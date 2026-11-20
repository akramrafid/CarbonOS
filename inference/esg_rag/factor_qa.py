"""
Structured factor question handler for CarbonOS ESG RAG.
Queries the esg_emission_factor database table FIRST before generating text explanations.
Always explicitly distinguishes between:
1. Factors APPROVED in the registry (audit-grade).
2. Factors PROVISIONAL in the registry (DRAFT, awaiting dual approval).
3. Factors mentioned in documents only (unverified/reference).
"""
import re
from typing import Optional, Dict, Any, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .ledger_models import EmissionFactor

FACTOR_INTENT_PATTERNS = [
    r"\bemission\s*factor\b",
    r"\bgrid\s*factor\b",
    r"\bgrid\s*emission\b",
    r"\bemission\s*rate\b",
    r"\bkgco2e\b",
    r"\bco2\s*factor\b",
    r"\bfactor\s*for\b",
    r"\bcarbon\s*intensity\b",
    r"\bwhat\s*is\s*the\s*factor\b",
    r"\bhow\s*much\s*co2\b",
]

ACTIVITY_KEYWORDS = {
    "electricity": [r"\belectricity\b", r"\bgrid\b", r"\bkwh\b", r"\bpower\b", r"\bdesco\b", r"\bdpdc\b", r"\bbpdb\b"],
    "diesel": [r"\bdiesel\b", r"\bhsd\b", r"\bgenerator\b"],
    "petrol": [r"\bpetrol\b", r"\boctane\b", r"\bgasoline\b"],
    "natural_gas": [r"\bnatural\s*gas\b", r"\bgas\b", r"\btitas\b", r"\bpetrobangla\b"],
    "lpg": [r"\blpg\b", r"\bliquefied\s*petroleum\b", r"\bcylinder\b"],
    "coal": [r"\bcoal\b", r"\bbarapukuria\b"],
    "refrigerant": [r"\brefrigerant\b", r"\bhfc\b", r"\br-?134a\b", r"\br-?410a\b"],
}


def detect_factor_intent(query: str) -> Optional[Dict[str, str]]:
    """Detect if the user query is asking about an emission factor and extract activity."""
    q_lower = query.lower()
    is_factor_query = any(re.search(p, q_lower) for p in FACTOR_INTENT_PATTERNS)
    if not is_factor_query:
        return None

    detected_act = None
    for act, patterns in ACTIVITY_KEYWORDS.items():
        if any(re.search(p, q_lower) for p in patterns):
            detected_act = act
            break

    return {
        "is_factor_query": True,
        "activity_type": detected_act or "electricity",
        "method": "location" if "location" in q_lower or detected_act == "electricity" else "direct"
    }


def query_factor_registry(
    db: Session,
    principal: Any,
    activity_type: str,
    region: str = "BD-NATIONAL"
) -> Tuple[Optional[Dict[str, Any]], str]:
    """
    Queries esg_emission_factor.
    Returns (factor_dict, status_category) where status_category is 'APPROVED', 'PROVISIONAL', or 'NOT_FOUND'.
    """
    org_id = getattr(principal, "organization_id", None)
    visibility = (
        or_(EmissionFactor.organization_id == org_id, EmissionFactor.organization_id.is_(None))
        if org_id is not None
        else EmissionFactor.organization_id.is_(None)
    )

    # 1. Check for APPROVED factor first (tenant-scoped + platform factors only)
    # [COMMENTED OUT FOR PERSONAL REFERENCE — previously queried EmissionFactor globally without tenant visibility]
    # q_appr = db.query(EmissionFactor).filter(
    #     EmissionFactor.activity_type == activity_type,
    #     EmissionFactor.status == "APPROVED"
    # )
    q_appr = db.query(EmissionFactor).filter(
        visibility,
        EmissionFactor.activity_type == activity_type,
        EmissionFactor.status == "APPROVED"
    )
    if activity_type == "electricity":
        q_appr = q_appr.filter(EmissionFactor.factor_kind == "grid_average")
    approved = q_appr.order_by(EmissionFactor.organization_id.is_(None), EmissionFactor.version.desc()).first()

    if approved:
        return {
            "id": approved.id,
            "family": approved.family,
            "version": approved.version,
            "kgco2e_per_unit": str(approved.kgco2e_per_unit),
            "unit": approved.unit,
            "region": approved.region,
            "method": approved.method,
            "gwp_basis": approved.gwp_basis,
            "uncertainty_pct": str(approved.uncertainty_pct) if approved.uncertainty_pct else "N/A",
            "status": "APPROVED",
            "source_publisher": approved.source_publisher or "CarbonOS Registry",
            "source_document": approved.source_document or "Verified primary source",
            "vintage": f"{approved.valid_from.year if approved.valid_from else ''}-{approved.valid_to.year if approved.valid_to else ''}",
            "derivation_hash": approved.source_table_ref or "registry_verified"
        }, "APPROVED"

    # 2. Check for PROVISIONAL (DRAFT) factor proposal (tenant-scoped + platform factors only)
    # q_draft = db.query(EmissionFactor).filter(
    #     EmissionFactor.activity_type == activity_type,
    #     EmissionFactor.status == "DRAFT"
    # )
    q_draft = db.query(EmissionFactor).filter(
        visibility,
        EmissionFactor.activity_type == activity_type,
        EmissionFactor.status == "DRAFT"
    )
    if activity_type == "electricity":
        q_draft = q_draft.filter(EmissionFactor.factor_kind == "grid_average")
    draft = q_draft.order_by(EmissionFactor.version.desc()).first()

    if draft:
        return {
            "id": draft.id,
            "family": draft.family,
            "version": draft.version,
            "kgco2e_per_unit": str(draft.kgco2e_per_unit),
            "unit": draft.unit,
            "region": draft.region,
            "method": draft.method,
            "gwp_basis": draft.gwp_basis,
            "uncertainty_pct": str(draft.uncertainty_pct) if draft.uncertainty_pct else "N/A",
            "status": "PROVISIONAL",
            "source_publisher": draft.source_publisher or "CarbonOS derivation pipeline",
            "source_document": draft.source_document or "bd_grid fuel balance",
            "vintage": f"{draft.valid_from.year if draft.valid_from else ''}-{draft.valid_to.year if draft.valid_to else ''}",
            "derivation_hash": draft.source_table_ref or "bd_grid_proposal"
        }, "PROVISIONAL"

    return None, "NOT_FOUND"


def format_factor_qa_response(
    query: str,
    factor_info: Optional[Dict[str, Any]],
    status_category: str,
    text_explanation: str = ""
) -> Dict[str, Any]:
    """
    Format authoritative answer clearly disclosing registry status vs literature.
    """
    if status_category == "APPROVED":
        f = factor_info
        header = (
            f"**CarbonOS Factor Registry Status: APPROVED (Audit-Grade)**\n\n"
            f"- **Factor**: {f['kgco2e_per_unit']} kgCO2e / {f['unit']}\n"
            f"- **Activity / Method**: {f['family']} ({f['method']}, GWP {f['gwp_basis']})\n"
            f"- **Vintage & Region**: {f['vintage']} | {f['region']}\n"
            f"- **Source**: {f['source_publisher']} ({f['source_document']})\n\n"
            f"This factor is **approved** in the CarbonOS registry under dual control and is eligible for sealed audit calculations."
        )
    elif status_category == "PROVISIONAL":
        f = factor_info
        header = (
            f"**CarbonOS Factor Registry Status: PROVISIONAL (Pending Dual Approval) [UNVERIFIED - agent-written]**\n\n"
            f"- **Proposed Factor**: {f['kgco2e_per_unit']} kgCO2e / {f['unit']} [UNVERIFIED - agent-written]\n"
            f"- **Activity / Method**: {f['family']} ({f['method']}, GWP {f['gwp_basis']}) [UNVERIFIED - agent-written]\n"
            f"- **Derivation Hash**: `{f['derivation_hash']}`\n"
            f"- **Source**: {f['source_publisher']} ({f['source_document']})\n\n"
            f"**Notice**: This factor is currently an **UNVERIFIED agent-written DRAFT proposal** awaiting secondary dual-control approval. "
            f"It can be used for **indicative estimates only** (`allow_provisional=true`), not for compliance filings."
        )
    else:
        header = (
            f"**CarbonOS Factor Registry Status: NOT APPROVED**\n\n"
            f"No factor for this activity is currently approved in the CarbonOS factor registry. "
            f"Any numbers mentioned in literature or documents below are for reference only and have not been certified for inventory use."
        )

    full_text = header
    if text_explanation:
        full_text += f"\n\n### Explanatory Context\n{text_explanation}"

    return {
        "answer": full_text,
        "factor_info": factor_info,
        "registry_status": status_category,
        "model_used": "carbonos-factor-registry"
    }

