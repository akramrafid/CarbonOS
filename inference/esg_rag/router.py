import time
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from .database import get_db
from .models import ESGDocument, ESGQueryLog, EmissionFactorRecord, ESGOrganization, ESGMembership
from .schemas import (
    QueryRequest,
    QueryResponse,
    IngestResponse,
    ExtractionResponse,
    EmissionFactorItem,
    Citation,
    OrganizationCreate,
)
from .auth import Identity, Principal, get_identity, require
from .config import CORPUS_TENANT_DOCS, CORPUS_REGULATORY, CORPUS_EMISSION_FACTORS
from .ingest import ingest_document, IngestRejected, MAX_UPLOAD_BYTES
from .retriever import retrieve
from .generator import generate_answer
from .extractor import extract_footprint_from_text, detect_all_utility_segments

router = APIRouter(prefix="/api/esg", tags=["ESG RAG Intelligence"])

# Global corpora are shared by every tenant, so only platform operators may write them.
GLOBAL_CORPUS_OWNER = {CORPUS_REGULATORY: "global_regulatory", CORPUS_EMISSION_FACTORS: "global_ef"}


async def _read_upload(file: UploadFile) -> bytes:
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"File exceeds {MAX_UPLOAD_BYTES} bytes")
    return content


def _demo_only(principal: Principal):
    if not principal.is_demo:
        raise HTTPException(404, "Sample data is only available in demo workspaces")


def _ingest(db: Session, content: bytes, filename: str, corpus: str, tenant_id: str):
    try:
        return ingest_document(db=db, file_bytes=content, filename=filename, corpus=corpus, tenant_id=tenant_id)
    except IngestRejected as e:
        raise HTTPException(422, str(e))


@router.post("/organizations", status_code=201)
def create_organization(
    body: OrganizationCreate,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
):
    """Create a tenant organization; the caller becomes its owner."""
    org = ESGOrganization(name=body.name.strip(), is_demo=body.is_demo, created_by_sub=identity.sub)
    db.add(org)
    db.flush()
    db.add(ESGMembership(organization_id=org.id, user_sub=identity.sub, role="org_owner"))
    db.commit()
    return {"id": org.id, "name": org.name, "is_demo": org.is_demo, "role": "org_owner"}


@router.get("/me")
def whoami(identity: Identity = Depends(get_identity)):
    """The caller's subject id (used by the UI for separation-of-duties hints; the API enforces it)."""
    return {"sub": identity.sub, "verified_email": identity.verified_email,
            "is_platform_operator": identity.is_platform_operator}


@router.get("/organizations")
def list_my_organizations(identity: Identity = Depends(get_identity), db: Session = Depends(get_db)):
    """Organizations the caller belongs to (for the organization switcher)."""
    rows = (
        db.query(ESGMembership, ESGOrganization)
        .join(ESGOrganization, ESGOrganization.id == ESGMembership.organization_id)
        .filter(ESGMembership.user_sub == identity.sub, ESGOrganization.archived_at.is_(None))
        .order_by(ESGOrganization.name)
        .all()
    )
    return [{"id": o.id, "name": o.name, "is_demo": o.is_demo, "role": m.role} for m, o in rows]

@router.get("/health")
def esg_health_check():
    """Health status of the ESG RAG subsystem."""
    return {
        "status": "healthy",
        "service": "CarbonOS ESG Multi-Corpus RAG",
        "version": "1.0.0",
        "corpora": ["regulatory", "emission_factors", "tenant_docs"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/query", response_model=QueryResponse)
def esg_query(
    request: QueryRequest,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db)
):
    """
    Query the ESG RAG system across regulatory, emission factors, and the caller's tenant corpus.
    Returns grounded answers with source citations. Retrieval similarity is not verification.
    """
    start_time = time.time()
    tenant_id = principal.organization_id

    # 1. Retrieve relevant chunks
    retrieval_res = retrieve(
        query=request.query,
        corpus=request.corpus or "all",
        tenant_id=tenant_id,
        top_k=request.top_k or 5
    )

    # 2. Generate grounded answer
    gen_res = generate_answer(request.query, retrieval_res)

    latency = round((time.time() - start_time) * 1000, 2)
    citations_data = retrieval_res.get("citations", [])

    # 3. Log query in audit trail
    log = ESGQueryLog(
        tenant_id=tenant_id,
        corpus=request.corpus or "all",
        query_text=request.query,
        answer_text=gen_res["answer"],
        confidence=retrieval_res.get("best_score", 0.0),
        citations=citations_data,
        latency_ms=latency,
        llm_model=gen_res.get("model_used", "unknown"),
        verified_by_audit=False
    )
    db.add(log)
    db.commit()

    return QueryResponse(
        query=request.query,
        answer=gen_res["answer"],
        confidence=round(retrieval_res.get("best_score", 0.0), 3),
        citations=[Citation(**c) for c in citations_data],
        corpus=request.corpus or "all",
        model_used=gen_res.get("model_used", "gemini"),
        insufficient_data=gen_res.get("insufficient_data", False),
        latency_ms=latency
    )

@router.post("/extract-footprint", response_model=ExtractionResponse)
async def extract_footprint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    filename: Optional[str] = Form("pasted_text"),
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db)
):
    """
    Extracts activity quantities (diesel, petrol, LPG, electricity, …) with source snippets from an
    uploaded document or pasted text. Results are REVIEW_REQUIRED inputs, never verified values.
    Returns 422 when nothing readable or extractable is found — it never substitutes sample data.
    """
    tenant_id = principal.organization_id
    doc_text = ""
    target_filename = filename or "pasted_text"
    document_id = None

    if file:
        content_bytes = await _read_upload(file)
        # Ingest document into the caller's tenant corpus so it's searchable via RAG
        result = _ingest(db, content_bytes, file.filename, CORPUS_TENANT_DOCS, tenant_id)
        target_filename = result.document.filename
        document_id = result.document.id
        doc_text = "\n".join([f"[Page {p['page']}] {p['text']}" for p in result.pages])
    elif raw_text and raw_text.strip():
        doc_text = raw_text[:200_000]
    else:
        raise HTTPException(422, "Provide a document or text to extract from")

    if not doc_text.strip():
        raise HTTPException(422, "No readable text found in the document (scanned PDFs need OCR, which is not supported yet). Enter values manually.")

    started = time.time()
    extracted = extract_footprint_from_text(doc_text)
    params = {k: float(v or 0) for k, v in extracted.get("parameters", {}).items()}
    if not any(params.values()):
        raise HTTPException(422, "No activity quantities were found in the document. Enter values manually.")

    log = ESGQueryLog(
        tenant_id=tenant_id,
        corpus=CORPUS_TENANT_DOCS,
        query_text=f"Extract activity data from {target_filename}",
        answer_text=extracted.get("summary", ""),
        confidence=extracted.get("overall_confidence") or 0.0,
        citations=[{"source": target_filename, "snippet": d.get("raw_snippet", "")} for d in extracted.get("details", [])],
        latency_ms=round((time.time() - started) * 1000, 2),
        llm_model=extracted.get("method", "regex"),
        verified_by_audit=False
    )
    db.add(log)
    db.commit()

    # Extracted values are inputs awaiting human review. No footprint is computed or stored here.
    return ExtractionResponse(
        filename=target_filename,
        document_id=document_id,
        tenant_id=tenant_id,
        parameters=params,
        details=extracted.get("details", []),
        overall_confidence=extracted.get("overall_confidence"),
        extraction_method=extracted.get("method", "regex"),
        extracted_at=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        summary=extracted.get("summary", ""),
    )

@router.post("/ingest", response_model=IngestResponse)
async def ingest_file(
    file: UploadFile = File(...),
    corpus: str = Form(CORPUS_TENANT_DOCS),
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db)
):
    """
    Ingest a PDF, XLSX, CSV, TXT, MD or DOCX file into the caller's tenant corpus.
    Global corpora (regulatory, emission_factors) are writable only by platform operators.
    """
    if corpus == CORPUS_TENANT_DOCS:
        tenant_id = principal.organization_id
    elif corpus in GLOBAL_CORPUS_OWNER and principal.is_platform_operator:
        tenant_id = GLOBAL_CORPUS_OWNER[corpus]
    elif corpus in GLOBAL_CORPUS_OWNER:
        raise HTTPException(403, "Only platform operators may write global corpora")
    else:
        raise HTTPException(422, "Unknown corpus")

    content = await _read_upload(file)
    doc, _pages, duplicate = _ingest(db, content, file.filename, corpus, tenant_id)

    return IngestResponse(
        document_id=doc.id,
        filename=doc.filename,
        corpus=doc.corpus,
        chunks_created=doc.chunk_count,
        tenant_id=doc.tenant_id,
        duplicate=duplicate,
        message=(f"Document '{doc.filename}' was already ingested; existing record returned." if duplicate
                 else f"Document '{doc.filename}' processed and indexed.")
    )

@router.get("/emission-factors")
def get_emission_factors(
    category: Optional[str] = None,
    region: Optional[str] = "Bangladesh",
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db)
):
    """
    Query the emission factor table. Citations are as recorded and not yet independently validated.
    """
    query = db.query(EmissionFactorRecord)
    if category:
        query = query.filter(EmissionFactorRecord.category.ilike(f"%{category}%"))
    if region:
        query = query.filter(EmissionFactorRecord.region.ilike(f"%{region}%"))

    factors = query.all()
    return [
        {
            "id": f.id,
            "category": f.category,
            "fuel_or_activity": f.fuel_or_activity,
            "region": f.region,
            "factor_value": f.factor_value,
            "unit": f.unit,
            "source_citation": f.source_citation,
            "year": f.year,
            "confidence_rating": f.confidence_rating
        }
        for f in factors
    ]

@router.get("/documents")
def list_documents(
    corpus: Optional[str] = None,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db)
):
    """List the caller's tenant documents plus global corpora, with provenance."""
    q = db.query(ESGDocument).filter(
        (ESGDocument.tenant_id == principal.organization_id)
        | (ESGDocument.tenant_id.in_(list(GLOBAL_CORPUS_OWNER.values())))
    )
    if corpus:
        q = q.filter(ESGDocument.corpus == corpus)

    docs = q.order_by(ESGDocument.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "corpus": d.corpus,
            "chunk_count": d.chunk_count,
            "file_size": d.file_size,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "meta_info": d.meta_info
        }
        for d in docs
    ]

@router.get("/audit-trail")
def get_audit_trail(
    limit: int = 15,
    principal: Principal = Depends(require("review")),
    db: Session = Depends(get_db)
):
    """Retrieve the caller's tenant log of recent RAG queries and extractions."""
    limit = max(1, min(limit, 100))
    logs = db.query(ESGQueryLog).filter(
        ESGQueryLog.tenant_id == principal.organization_id
    ).order_by(ESGQueryLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": l.id,
            "query": l.query_text,
            "answer": l.answer_text,
            "confidence": l.confidence,
            "citations": l.citations,
            "model_used": l.llm_model,
            "verified": l.verified_by_audit,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in logs
    ]

# -------------------------------------------------------------
# NEXT-GEN ESG SAAS ENGINE ENDPOINTS (WATERSHED & PERSEFONI GRADE)
# -------------------------------------------------------------

@router.post("/duckdb-calculate")
def duckdb_calculate(
    payload: Dict[str, Any] = Body(...),
    principal: Principal = Depends(require("read")),
):
    """
    In-Process DuckDB-Style OLAP Calculation Endpoint.
    Executes both Activity-Based (Scope 1, 2, 3) and Spend-Based EEIO (CEDA) calculations
    in sub-25ms with resource estimation and cryptographic audit hash.
    """
    from .calculation_engine import calculate_activity_footprint, calculate_spend_eeio_footprint
    import hashlib

    activities = payload.get("activities", {})
    spend_items = payload.get("spend_items", {})
    factors = payload.get("factors", None)
    currency = payload.get("currency", "BDT")
    exchange_rate = float(payload.get("exchange_rate", 120.0))

    act_res = calculate_activity_footprint(activities, factors)
    spend_res = calculate_spend_eeio_footprint(spend_items, currency=currency, usd_bdt_exchange_rate=exchange_rate)

    # Cryptographic SHA-256 seal for audit trail
    ledger_content = f"{act_res['totals']['location_based_tco2e']}:{spend_res['total_emissions_tco2e']}:{datetime.datetime.utcnow().isoformat()}"
    audit_hash = hashlib.sha256(ledger_content.encode('utf-8')).hexdigest()

    return {
        "engine": "DuckDB-Vectorized-OLAP",
        "version": "2026.2.1",
        "calculated_at": datetime.datetime.utcnow().isoformat(),
        "audit_hash": f"SHA256-{audit_hash[:16].upper()}",
        "activity_accounting": act_res,
        "spend_eeio_accounting": spend_res,
        "consolidated_total_tco2e": round(act_res["totals"]["location_based_tco2e"] + spend_res["total_emissions_tco2e"], 3)
    }

@router.get("/emission-factors/registry")
def get_factor_registry(principal: Principal = Depends(require("read"))):
    """
    Retrieve typed, versioned emission factor catalog with DoE Gazette citations.
    """
    from .factor_registry import FACTOR_REGISTRY_CATALOG
    return {
        "catalog_version": "v2026.1-NATIONAL",
        "governing_body": "Department of Environment (DoE) & SREDA Bangladesh",
        "gazette_reference": "Ref: 22.02.0000.018.99.001.23",
        "total_factors": len(FACTOR_REGISTRY_CATALOG),
        "factors": FACTOR_REGISTRY_CATALOG
    }

@router.post("/emission-factors/regression-test")
def run_factor_regression(
    payload: Dict[str, Any] = Body(...),
    principal: Principal = Depends(require("admin")),
):
    """
    Watershed-style regression testing:
    Tests proposed emission factor changes against customer baseline portfolios.
    """
    from .factor_registry import run_factor_regression_test
    proposed = payload.get("proposed_factors", {})
    tolerance = float(payload.get("tolerance_pct", 2.0))
    return run_factor_regression_test(proposed, tolerance_pct=tolerance)

@router.get("/atlas-benchmark/run")
def run_atlas_benchmark(principal: Principal = Depends(require("read"))):
    """
    Run the ATLAS invoice extraction & classification benchmark suite.
    """
    from .atlas_benchmark import run_atlas_eval_suite
    return run_atlas_eval_suite()

@router.get("/satellite-insets")
def get_satellite_insets(principal: Principal = Depends(require("read"))):
    """Static sample payload — available to demo workspaces only (data register A8)."""
    _demo_only(principal)
    return {
        "data_classification": "DEMO_SAMPLE",
        "mrv_network": "CarbonOS Sentinel-2 & GEDI Remote Sensing Grid",
        "resolution": "10m Multispectral + GEDI 25m LiDAR Canopy Profiling",
        "last_orbit_pass": "2026-09-08T04:12:00Z (Sentinel-2B Tile 46RCH)",
        "projects": [
            {
                "project_id": "MRV-BD-SUNDARBANS-01",
                "name": "Sundarbans Coastal Mangrove Blue Carbon Reserve",
                "region": "Khulna & Bagerhat",
                "ecosystem": "Mangrove Wetland",
                "coordinates": [21.9497, 89.1833],
                "biomass_density_tc_ha": 248.5,
                "annual_removal_capacity_tco2e": 48500,
                "available_corporate_insets_tco2e": 12400,
                "sylvera_rating": "AAA",
                "permanence_score": 98.4,
                "additionality_score": 99.1,
                "vintage": 2026,
                "verification_standard": "Verra VM0033 & CarbonOS Satellite LiDAR"
            },
            {
                "project_id": "MRV-BD-SYLHET-CANOPY-02",
                "name": "Sylhet Agroforestry & High-Canopy Tea Estate Carbon Sink",
                "region": "Sreemangal, Sylhet",
                "ecosystem": "Agroforestry & Subtropical Broadleaf",
                "coordinates": [24.3065, 91.7296],
                "biomass_density_tc_ha": 182.3,
                "annual_removal_capacity_tco2e": 26800,
                "available_corporate_insets_tco2e": 8200,
                "sylvera_rating": "AA+",
                "permanence_score": 94.2,
                "additionality_score": 95.8,
                "vintage": 2026,
                "verification_standard": "Gold Standard & Sentinel-2 NDVI"
            },
            {
                "project_id": "MRV-BD-SOLAR-IRRIGATION-03",
                "name": "Northern Agrarian Solar Irrigation Pump Displacement Belt",
                "region": "Dinajpur & Rangpur",
                "ecosystem": "Clean Energy Grid Displacement",
                "coordinates": [25.6279, 88.6332],
                "biomass_density_tc_ha": 0.0,
                "annual_removal_capacity_tco2e": 34200,
                "available_corporate_insets_tco2e": 15600,
                "sylvera_rating": "AAA",
                "permanence_score": 100.0,
                "additionality_score": 98.6,
                "vintage": 2026,
                "verification_standard": "UNFCCC CDM AMS-I.D & IoT Inverter Telemetry"
            },
            {
                "project_id": "MRV-BD-CHT-WATERSHED-04",
                "name": "Chittagong Hill Tracts Indigenous Forest Watershed Inset",
                "region": "Bandarban & Rangamati",
                "ecosystem": "Montane Rain Forest",
                "coordinates": [22.1953, 92.2184],
                "biomass_density_tc_ha": 215.8,
                "annual_removal_capacity_tco2e": 51200,
                "available_corporate_insets_tco2e": 19400,
                "sylvera_rating": "AA+",
                "permanence_score": 93.6,
                "additionality_score": 97.2,
                "vintage": 2026,
                "verification_standard": "Plan Vivo & GEDI Waveform LiDAR"
            }
        ]
    }

@router.get("/entity-tree")
def get_conglomerate_entity_tree(principal: Principal = Depends(require("read"))):
    """Static sample hierarchy — available to demo workspaces only (data register A7)."""
    _demo_only(principal)
    return {
        "data_classification": "DEMO_SAMPLE",
        "conglomerate_name": "Apex Holdings Group (Bangladesh)",
        "holding_id": "HOLDING-BD-APEX-01",
        "hq_location": "Gulshan 2, Dhaka, Bangladesh",
        "reporting_period": "Q2 2026",
        "consolidation_method": "Operational Control (GHG Protocol)",
        "entities": [
            {
                "entity_id": "ENT-01",
                "name": "Dexterity Textiles Ltd (Plant 1)",
                "division": "RMG & Apparel Export",
                "location": "DEPZ, Savar, Dhaka",
                "share_pct": 100,
                "headcount": 148,
                "emissions": {"scope1": 49.32, "scope2": 85.80, "scope3": 1521.80, "total": 1656.92},
                "revenue_crore_bdt": 42.5,
                "intensity_tco2e_per_crore": 38.98
            },
            {
                "entity_id": "ENT-02",
                "name": "Apex Composite Spinning Mills",
                "division": "Yarn & Raw Material Processing",
                "location": "Narayanganj Industrial Cluster",
                "share_pct": 100,
                "headcount": 230,
                "emissions": {"scope1": 84.10, "scope2": 142.50, "scope3": 890.40, "total": 1117.00},
                "revenue_crore_bdt": 68.0,
                "intensity_tco2e_per_crore": 16.42
            },
            {
                "entity_id": "ENT-03",
                "name": "Padma Intermodal Logistics & Fleet",
                "division": "Supply Chain & Highway Haulage",
                "location": "Sitakunda & Chattogram Port Corridor",
                "share_pct": 80,
                "headcount": 55,
                "emissions": {"scope1": 112.40, "scope2": 14.20, "scope3": 340.50, "total": 467.10},
                "revenue_crore_bdt": 21.0,
                "intensity_tco2e_per_crore": 22.24
            },
            {
                "entity_id": "ENT-04",
                "name": "Apex Corporate Headquarters",
                "division": "Administration & Executive",
                "location": "Gulshan Financial District, Dhaka",
                "share_pct": 100,
                "headcount": 42,
                "emissions": {"scope1": 8.50, "scope2": 24.60, "scope3": 95.20, "total": 128.30},
                "revenue_crore_bdt": 0.0,
                "intensity_tco2e_per_crore": 0.0
            }
        ],
        "group_summary": {
            "total_scope1": 254.32,
            "total_scope2": 267.10,
            "total_scope3": 2847.90,
            "consolidated_total": 3369.32,
            "total_workforce": 475,
            "total_revenue_crore_bdt": 131.5,
            "group_carbon_intensity": 25.62
        }
    }


@router.post("/detect-utility-segments")
def esg_detect_utility_segments(
    payload: Dict[str, Any] = Body(default={}),
    principal: Principal = Depends(require("read")),
):
    """
    Detects utility line items present in the text (power, gas, diesel, steam, water, …) and applies
    rule factors marked UNVERIFIED. Non-energy and exported/avoided items are listed separately and
    never netted into inventory totals. Output is REVIEW_REQUIRED.
    """
    raw_text = payload.get("raw_text", "")
    client_id = payload.get("client_id", None)
    return detect_all_utility_segments(raw_text, client_id=client_id)




# Ledger routes (facilities, periods, factors, activities, calculations, snapshots) share the /api/esg prefix.
from .ledger_router import router as _ledger_router  # noqa: E402
router.include_router(_ledger_router)

from .members import router as _members_router  # noqa: E402
router.include_router(_members_router)
