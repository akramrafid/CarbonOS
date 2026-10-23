"""
HTTP layer for the ESG ledger (mounted under /api/esg). Thin: validation via Pydantic, rules in ledger.py.
Decimals are serialised as strings so no precision is lost to JSON floats.
"""
import datetime as dt
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field, condecimal
from sqlalchemy.orm import Session

from . import ledger
from .auth import Principal, require
from .database import get_db
from .ledger import DomainError
from .ledger_models import (
    ActivityRecord, AuditEvent, CalculationLine, CalculationRun, Facility, LegalEntity, ReportingPeriod, ReportSnapshot,
)

router = APIRouter(tags=["ESG Ledger"])

Boundary = Literal["operational_control", "financial_control", "equity_share"]
NonNeg = condecimal(ge=0, max_digits=28, decimal_places=10)


class LegalEntityIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    country: str = Field(..., pattern=r"^[A-Z]{2}$")
    registration_number: Optional[str] = Field(None, max_length=100)


class FacilityIn(BaseModel):
    legal_entity_id: str
    name: str = Field(..., min_length=1, max_length=200)
    country: str = Field(..., pattern=r"^[A-Z]{2}$")
    grid_region: str = Field(..., min_length=1, max_length=50)
    address: Optional[str] = Field(None, max_length=1000)
    operational_control: bool = True
    financial_control: bool = True
    equity_share_pct: condecimal(ge=0, le=100, max_digits=7, decimal_places=4) = Decimal(100)


class PeriodIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    start_date: dt.date
    end_date: dt.date
    boundary_method: Boundary


class FactorIn(BaseModel):
    family: str = Field(..., min_length=1, max_length=80, pattern=r"^[A-Za-z0-9._-]+$")
    activity_type: str
    unit: str
    kgco2e_per_unit: NonNeg
    region: str = Field(..., min_length=1, max_length=50)
    gwp_basis: Literal["AR4", "AR5", "AR6"]
    method: Literal["direct", "location", "market"]
    valid_from: dt.date
    valid_to: Optional[dt.date] = None
    source_publisher: str = Field(..., min_length=1, max_length=200)
    source_document: str = Field(..., min_length=1, max_length=300)
    source_url: Optional[str] = Field(None, max_length=500)
    source_table_ref: Optional[str] = Field(None, max_length=200)
    source_year: int = Field(..., ge=1990, le=2100)
    licence_note: Optional[str] = Field(None, max_length=2000)


class ActivityIn(BaseModel):
    facility_id: str
    period_id: str
    activity_type: str
    quantity: NonNeg
    unit: str = Field(..., max_length=10)
    activity_start: dt.date
    activity_end: dt.date
    meter_ref: Optional[str] = Field(None, max_length=100)
    source_type: Literal["manual", "document", "csv"] = "manual"
    source_document_id: Optional[str] = None
    source_ref: Optional[str] = Field(None, max_length=200)
    evidence_snippet: Optional[str] = Field(None, max_length=2000)
    factor_id: Optional[str] = None
    market_factor_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=2000)
    supersedes_id: Optional[str] = None
    idempotency_key: Optional[str] = Field(None, max_length=100)


class ActivityPatch(BaseModel):
    quantity: Optional[NonNeg] = None
    unit: Optional[str] = Field(None, max_length=10)
    activity_start: Optional[dt.date] = None
    activity_end: Optional[dt.date] = None
    meter_ref: Optional[str] = Field(None, max_length=100)
    source_ref: Optional[str] = Field(None, max_length=200)
    evidence_snippet: Optional[str] = Field(None, max_length=2000)
    factor_id: Optional[str] = None
    market_factor_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=2000)


class ReviewIn(BaseModel):
    comment: Optional[str] = Field(None, max_length=2000)


class LockIn(BaseModel):
    calculation_run_id: str


class RestateIn(BaseModel):
    reason: str = Field(..., min_length=1, max_length=2000)


def out(row) -> dict:
    d = ledger.row_dict(row)
    return {k: (format(v, "f") if isinstance(v, Decimal) else v) for k, v in d.items()}


def run(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except DomainError as e:
        raise HTTPException(e.status, e.message)


def _list(db, model, principal, limit, offset, *filters, order=None):
    q = db.query(model).filter(model.organization_id == principal.organization_id, *filters)
    total = q.count()
    rows = q.order_by(order if order is not None else model.id).limit(limit).offset(offset).all()
    return {"total": total, "items": [out(r) for r in rows]}


Limit = Query(50, ge=1, le=200)
Offset = Query(0, ge=0)


@router.get("/activity-types")
def activity_types(p: Principal = Depends(require("read"))):
    """Inventory and memo activity types with canonical and accepted input units."""
    from . import accounting
    accepted = lambda canon: sorted(u for u, (dim, _) in accounting.UNITS.items() if dim == accounting.UNITS[canon][0])
    return {
        "inventory": [{"activity_type": k, "scope": scope, "canonical_unit": unit,
                       "accepted_units": ["m3"] if k == "natural_gas" else accepted(unit)}
                      for k, (scope, unit) in accounting.ACTIVITY_TYPES.items()],
        "memo": [{"activity_type": k, "canonical_unit": unit, "accepted_units": accepted(unit)}
                 for k, unit in accounting.MEMO_ACTIVITY_TYPES.items()],
        "methodology_version": accounting.METHODOLOGY_VERSION,
    }


# --- structure ---------------------------------------------------------------------------

@router.post("/legal-entities", status_code=201)
def create_legal_entity(body: LegalEntityIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.create_legal_entity, db, p, body.model_dump()))


@router.get("/legal-entities")
def list_legal_entities(limit: int = Limit, offset: int = Offset, p: Principal = Depends(require("read")),
                        db: Session = Depends(get_db)):
    return _list(db, LegalEntity, p, limit, offset)


@router.post("/facilities", status_code=201)
def create_facility(body: FacilityIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.create_facility, db, p, body.model_dump()))


@router.get("/facilities")
def list_facilities(limit: int = Limit, offset: int = Offset, p: Principal = Depends(require("read")),
                    db: Session = Depends(get_db)):
    return _list(db, Facility, p, limit, offset)


@router.post("/periods", status_code=201)
def create_period(body: PeriodIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.create_period, db, p, body.model_dump()))


@router.get("/periods")
def list_periods(limit: int = Limit, offset: int = Offset, p: Principal = Depends(require("read")),
                 db: Session = Depends(get_db)):
    return _list(db, ReportingPeriod, p, limit, offset, order=ReportingPeriod.start_date.desc())


# --- factors -----------------------------------------------------------------------------

@router.post("/factors", status_code=201)
def create_factor(body: FactorIn, platform_wide: bool = False, p: Principal = Depends(require("read")),
                  db: Session = Depends(get_db)):
    return out(run(ledger.create_factor, db, p, body.model_dump(), platform_wide))


@router.post("/factors/{factor_id}/approve")
def approve_factor(factor_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.approve_factor, db, p, factor_id))


@router.get("/factors")
def list_factors(status: Optional[str] = None, activity_type: Optional[str] = None, limit: int = Limit,
                 offset: int = Offset, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    from .ledger_models import EmissionFactor
    q = ledger.visible_factors(db, p)
    if status:
        q = q.filter(EmissionFactor.status == status)
    if activity_type:
        q = q.filter(EmissionFactor.activity_type == activity_type)
    total = q.count()
    rows = q.order_by(EmissionFactor.family, EmissionFactor.version).limit(limit).offset(offset).all()
    return {"total": total, "items": [out(r) for r in rows]}


# --- activities ---------------------------------------------------------------------------

@router.post("/activities")
def create_activity(body: ActivityIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    rec, created = run(ledger.create_activity, db, p, body.model_dump())
    return {**out(rec), "created": created}


@router.patch("/activities/{rec_id}")
def update_activity(rec_id: str, body: ActivityPatch, p: Principal = Depends(require("read")),
                    db: Session = Depends(get_db)):
    return out(run(ledger.update_activity, db, p, rec_id, body.model_dump(exclude_unset=True)))


@router.post("/activities/{rec_id}/submit")
def submit_activity(rec_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.submit_activity, db, p, rec_id))


@router.post("/activities/{rec_id}/approve")
def approve_activity(rec_id: str, body: ReviewIn = ReviewIn(), p: Principal = Depends(require("read")),
                     db: Session = Depends(get_db)):
    return out(run(ledger.review_activity, db, p, rec_id, True, body.comment))


@router.post("/activities/{rec_id}/reject")
def reject_activity(rec_id: str, body: ReviewIn, p: Principal = Depends(require("read")),
                    db: Session = Depends(get_db)):
    return out(run(ledger.review_activity, db, p, rec_id, False, body.comment))


@router.get("/activities")
def list_activities(period_id: Optional[str] = None, facility_id: Optional[str] = None, status: Optional[str] = None,
                    limit: int = Limit, offset: int = Offset, p: Principal = Depends(require("read")),
                    db: Session = Depends(get_db)):
    filters = [c for c in (
        ActivityRecord.period_id == period_id if period_id else None,
        ActivityRecord.facility_id == facility_id if facility_id else None,
        ActivityRecord.status == status if status else None,
    ) if c is not None]
    return _list(db, ActivityRecord, p, limit, offset, *filters, order=ActivityRecord.activity_start)


# --- calculation, lock, report -------------------------------------------------------------

@router.post("/periods/{period_id}/calculate", status_code=201)
def calculate(period_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    return out(run(ledger.calculate_period, db, p, period_id))


@router.get("/periods/{period_id}/calculations")
def list_calculations(period_id: str, limit: int = Limit, offset: int = Offset, p: Principal = Depends(require("read")),
                      db: Session = Depends(get_db)):
    """Runs for a period, newest first, so an approver can review the preparer's calculation."""
    return _list(db, CalculationRun, p, limit, offset, CalculationRun.period_id == period_id,
                 order=CalculationRun.created_at.desc())


@router.get("/calculations/{run_id}")
def get_calculation(run_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    calc = run(ledger._get, db, CalculationRun, p, run_id)
    lines = db.query(CalculationLine).filter(CalculationLine.run_id == calc.id).order_by(CalculationLine.id).all()
    return {**out(calc), "lines": [out(l) for l in lines]}


@router.post("/periods/{period_id}/lock", status_code=201)
def lock_period(period_id: str, body: LockIn, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    snap = run(ledger.lock_period, db, p, period_id, body.calculation_run_id)
    return {k: v for k, v in out(snap).items() if k != "content"}


@router.post("/periods/{period_id}/restate")
def restate_period(period_id: str, body: RestateIn, p: Principal = Depends(require("read")),
                   db: Session = Depends(get_db)):
    return out(run(ledger.restate_period, db, p, period_id, body.reason))


@router.get("/periods/{period_id}/snapshots")
def list_snapshots(period_id: str, p: Principal = Depends(require("read")), db: Session = Depends(get_db)):
    rows = db.query(ReportSnapshot).filter(ReportSnapshot.organization_id == p.organization_id,
                                           ReportSnapshot.period_id == period_id) \
        .order_by(ReportSnapshot.revision).all()
    return [{k: v for k, v in out(s).items() if k != "content"} for s in rows]


@router.get("/snapshots/{snapshot_id}/export")
def export_snapshot(snapshot_id: str, format: Literal["json", "csv"] = "json", p: Principal = Depends(require("read")),
                    db: Session = Depends(get_db)):
    snap = run(ledger._get, db, ReportSnapshot, p, snapshot_id)
    body = ledger.export_snapshot(snap, format)
    media = "application/json" if format == "json" else "text/csv"
    return PlainTextResponse(body, media_type=media, headers={
        "Content-Disposition": f'attachment; filename="esg-report-{snap.period_id}-r{snap.revision}.{format}"',
        "X-Content-SHA256": snap.content_sha256,
    })


@router.get("/audit-events")
def list_audit_events(entity_id: Optional[str] = None, limit: int = Limit, offset: int = Offset,
                      p: Principal = Depends(require("review")), db: Session = Depends(get_db)):
    filters = [AuditEvent.entity_id == entity_id] if entity_id else []
    return _list(db, AuditEvent, p, limit, offset, *filters, order=AuditEvent.id.desc())
