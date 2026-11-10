"""
HTTP layer for dynamic bill parameters (mounted under /api/esg). Thin: validation via Pydantic, rules in
bill_service. Documents are read locally (pdfplumber / Tesseract); nothing is sent to an external service.
"""
import hashlib
import os
from typing import List, Literal, Optional

from fastapi import APIRouter, Response, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from . import bill_extract as bx
from . import bill_service
from . import document_store
from .bills import OCRUnavailable
from .auth import Principal, require
from .ratelimit import limited
from .database import get_db
from .ledger_models import Bill, BillParameter, BillProfile
from .ledger_router import Limit, Offset, _list, out, run

router = APIRouter(tags=["ESG Bills"])
MAX_UPLOAD_BYTES = 15 * 1024 * 1024


class YamlIn(BaseModel):
    yaml: str = Field(..., min_length=1, max_length=200_000)
    platform_wide: bool = False


class DocumentIn(BaseModel):
    # Text lines (manual entry, fixtures) or words with boxes from a local reader (pdf_text / ocr).
    source: Literal["pdf_text", "ocr", "manual"] = "manual"
    pages: List[dict] = Field(..., min_length=1, max_length=bill_service.MAX_PAGES)


class BillIn(BaseModel):
    facility_id: str
    filename: Optional[str] = Field(None, max_length=255)
    profile_id: Optional[str] = None  # a person routing the bill; otherwise APPROVED profiles are detected
    document: DocumentIn


class EnterValueIn(BaseModel):
    parameter_key: str = Field(..., max_length=100)
    value: str = Field(..., min_length=1, max_length=200)
    unit: Optional[str] = Field(None, max_length=30)
    group_index: str = Field("", max_length=200)
    comment: Optional[str] = Field(None, max_length=2000)


class ReviewValueIn(BaseModel):
    value: Optional[str] = Field(None, max_length=200)
    unit: Optional[str] = Field(None, max_length=30)
    comment: Optional[str] = Field(None, max_length=2000)


class MapIn(BaseModel):
    parameter_key: str = Field(..., max_length=100)
    group_index: str = Field("", max_length=200)


class AssignIn(BaseModel):
    profile_id: str


class PostIn(BaseModel):
    period_id: str


def _bill_out(detail) -> dict:
    return {**out(detail["bill"]), "document": None, "values": [out(v) for v in detail["values"]]}


@router.post("/bill-parameters", status_code=201)
def load_parameters(body: YamlIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return [out(r) for r in run(bill_service.load_parameters, db, p, body.yaml, body.platform_wide)]


@router.post("/bill-parameters/{row_id}/approve")
def approve_parameter(row_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(bill_service.approve_definition, db, p, BillParameter, row_id))


@router.get("/bill-parameters")
def list_parameters(key: Optional[str] = None, status: Optional[str] = None, limit: int = Limit, offset: int = Offset,
                    p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    q = db.query(BillParameter).filter(bill_service._visible(BillParameter, p))
    if key:
        q = q.filter(BillParameter.key == key)
    if status:
        q = q.filter(BillParameter.status == status)
    rows = q.order_by(BillParameter.key, BillParameter.version).limit(limit).offset(offset).all()
    return {"total": q.count(), "items": [out(r) for r in rows]}


@router.post("/bill-profiles", status_code=201)
def load_profiles(body: YamlIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return [{**out(r), "definition": None} for r in run(bill_service.load_profiles, db, p, body.yaml, body.platform_wide)]


@router.post("/bill-profiles/load-repository", status_code=201)
def load_repository(p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    """Platform operators: load the repository's parameters and seed profiles as platform-wide DRAFT versions."""
    return run(bill_service.load_repository_definitions, db, p)


@router.post("/bill-profiles/{row_id}/approve")
def approve_profile(row_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return {**out(run(bill_service.approve_definition, db, p, BillProfile, row_id)), "definition": None}


@router.get("/bill-profiles")
def list_profiles(status: Optional[str] = None, limit: int = Limit, offset: int = Offset,
                  p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    q = db.query(BillProfile).filter(bill_service._visible(BillProfile, p))
    if status:
        q = q.filter(BillProfile.status == status)
    rows = q.order_by(BillProfile.profile_key, BillProfile.version).limit(limit).offset(offset).all()
    return {"total": q.count(), "items": [{**out(r), "definition": None} for r in rows]}


@router.post("/bills", status_code=201)
def create_bill(body: BillIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    try:
        doc = bx.document_from_layout(body.document.model_dump())
    except (ValueError, KeyError, TypeError) as e:
        raise HTTPException(422, f"Document: {e}")
    bill = run(bill_service.create_bill, db, p, body.facility_id, doc, body.filename, body.profile_id)
    return _bill_out(run(bill_service.bill_detail, db, p, bill.id))


@router.post("/bills/upload", status_code=201)
def upload_bill(facility_id: str = Form(...), file: UploadFile = File(...), ocr: bool = Form(False),
                p: Principal = Depends(limited("upload", "write")), db: Session = Depends(get_db)):
    """PDF text layer (pdfplumber) or local OCR (Tesseract ben+eng), read in memory: the file is not kept, its SHA-256
    and words are. A plain def, so parsing runs in the worker thread pool, not on the event loop."""
    run(bill_service.check_upload, db, p, facility_id)  # role and facility before any parsing
    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Bill files are limited to 15 MB")
    is_pdf = data[:5] == b"%PDF-"
    try:
        doc = (bx.document_from_image(data) if (ocr or not is_pdf)
               else bx.document_from_pdf(data, max_pages=bill_service.MAX_PAGES))
    except OCRUnavailable as e:
        raise HTTPException(422, f"OCR unavailable: {e}. Scanned bills require Tesseract (ben+eng). Please enter values manually via the intake wizard.")
    except Exception as e:  # unreadable, too large, or Tesseract missing or timed out: say so, keep nothing
        raise HTTPException(422, f"Could not read the document locally ({type(e).__name__})")
    file_sha256 = hashlib.sha256(data).hexdigest()
    prefix = file_sha256[:12]
    existing = db.query(Bill).filter(
        Bill.organization_id == p.organization_id,
        Bill.filename.like(f"{prefix}_%")
    ).first()
    if existing:
        raise HTTPException(409, f"Duplicate bill: file already uploaded for this tenant as bill {existing.id}")
    name = f"{file_sha256}_{os.path.basename(file.filename or 'bill')}"[:255]
    bill = run(bill_service.create_bill, db, p, facility_id, doc, name)
    if document_store.is_retention_enabled():
        document_store.save_document(p.organization_id, data, file_sha256)
        run(bill_service.log_document_retention, db, p, bill.id, file_sha256)
    return _bill_out(run(bill_service.bill_detail, db, p, bill.id))


@router.get("/bills")
def list_bills(facility_id: Optional[str] = None, status: Optional[str] = None, limit: int = Limit,
               offset: int = Offset, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    filters = [c for c in (Bill.facility_id == facility_id if facility_id else None,
                           Bill.status == status if status else None) if c is not None]
    listing = _list(db, Bill, p, limit, offset, *filters, order=Bill.created_at.desc())
    return {**listing, "items": [{**b, "document": None} for b in listing["items"]]}


@router.get("/bills/{bill_id}")
def get_bill(bill_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return _bill_out(run(bill_service.bill_detail, db, p, bill_id))


@router.get("/bills/{bill_id}/gaps")
def get_bill_gaps(bill_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    """Structured gap analysis, low confidence fields, and calculation blockers for a bill."""
    return run(bill_service.bill_gaps, db, p, bill_id)


@router.post("/bills/{bill_id}/values", status_code=201)
def enter_bill_value(bill_id: str, body: EnterValueIn, p: Principal = Depends(require("write")), db: Session = Depends(get_db)):
    """Enter a value for a missing field without an extracted row."""
    return out(run(bill_service.enter_value, db, p, bill_id, body.parameter_key, body.value,
                   body.unit, body.group_index, body.comment))


@router.post("/bill-values/{value_id}/map")
def map_value(value_id: int, body: MapIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(bill_service.map_value, db, p, value_id, body.parameter_key, body.group_index))


@router.post("/bill-values/{value_id}/{action}")
def review_value(value_id: int, action: Literal["confirm", "correct", "reject"], body: ReviewValueIn = ReviewValueIn(),
                 p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(bill_service.review_value, db, p, value_id, action, body.value, body.unit, body.comment))


@router.post("/bills/{bill_id}/assign-profile")
def assign_profile(bill_id: str, body: AssignIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    bill = run(bill_service.assign_profile, db, p, bill_id, body.profile_id)
    return _bill_out(run(bill_service.bill_detail, db, p, bill.id))


@router.post("/bills/{bill_id}/post", status_code=201)
def post_bill(bill_id: str, body: PostIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return [out(r) for r in run(bill_service.post_bill, db, p, bill_id, body.period_id)]


@router.get("/bill-analysis")
def bill_analysis(keys: str = Query(..., max_length=2000), group_by: str = Query("", max_length=200),
                  grain: Literal["month", "fiscal_year"] = "month", p: Principal = Depends(require("read")),
                  db: Session = Depends(get_db)):
    """Aggregate any confirmed parameter, base or derived: ?keys=energy.kwh.register&group_by=facility,band."""
    key_list = [k.strip() for k in keys.split(",") if k.strip()]
    dims = [d.strip() for d in group_by.split(",") if d.strip()]
    return run(bill_service.analyse, db, p, key_list, dims, grain)


@router.get("/bills/{bill_id}/document")
def get_bill_document(bill_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    """Download or view retained source PDF with SHA-256 header."""
    bill = run(bill_service._get, db, Bill, p, bill_id)
    file_sha256 = bill.filename.split("_")[0] if bill.filename and "_" in bill.filename else bill.document_sha256
    content = document_store.read_document(p.organization_id, file_sha256)
    if not content:
        raise HTTPException(404, "Source document not retained or deleted")
    actual_sha = hashlib.sha256(content).hexdigest()
    run(bill_service.log_document_read, db, p, bill.id, actual_sha)
    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "X-Content-SHA256": actual_sha,
            "Content-Disposition": f'inline; filename="{bill.filename or "bill.pdf"}"'
        }
    )


@router.delete("/bills/{bill_id}/document", status_code=200)
def delete_bill_document(bill_id: str, p: Principal = Depends(require("write")), db: Session = Depends(get_db)):
    """Hard-delete retained source document upon request."""
    bill = run(bill_service._get, db, Bill, p, bill_id)
    file_sha256 = bill.filename.split("_")[0] if bill.filename and "_" in bill.filename else bill.document_sha256
    deleted = document_store.delete_document(p.organization_id, file_sha256)
    if not deleted:
        raise HTTPException(404, "Source document not found or already deleted")
    run(bill_service.log_document_delete, db, p, bill.id, file_sha256)
    return {"deleted": True, "sha256": file_sha256}


class BillEstimateIn(BaseModel):
    allow_provisional: bool = False
    boundary_method: str = "operational_control"


@router.post("/bills/{bill_id}/estimate")
def estimate_bill_emissions(bill_id: str, body: Optional[BillEstimateIn] = None,
                            p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    """Indicative carbon footprint calculation for a bill (solo users / screening).
    Deterministic Python calculation on confirmed/corrected/entered values.
    Does NOT mutate the ledger or create approved records."""
    allow_provisional = body.allow_provisional if body else False
    boundary_method = body.boundary_method if body else "operational_control"
    return run(bill_service.estimate_bill, db, p, bill_id,
               allow_provisional=allow_provisional, boundary_method=boundary_method)
