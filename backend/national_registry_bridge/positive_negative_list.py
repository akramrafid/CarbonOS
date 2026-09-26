"""
positive_negative_list.py - DOE Positive/Negative List Eligibility Engine.

DOE's Positive/Negative list is reviewed case-by-case, not a fixed table.
This module queries an admin-editable database table (PositiveNegativeRule),
ensuring policy updates by Bangladesh Department of Environment (DOE) or compliance
officers take effect immediately without requiring a code deployment.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def check_eligibility(sector: str, mitigation_type: str, ndc_commitment_type: str) -> str:
    """
    Checks whether a planned mitigation project meets Bangladesh DOE's Article 6 criteria.

    Args:
        sector: Project sector (e.g. 'Forestry', 'Agriculture', 'Energy', 'Waste')
        mitigation_type: Mitigation activity (e.g. 'Afforestation', 'Methane Avoidance')
        ndc_commitment_type: 'unconditional' | 'conditional' | 'beyond_ndc'

    Returns:
        'positive_list' | 'negative_list' | 'pending_review'

    Evaluation Hierarchy:
    1. Exact match on (sector, mitigation_type, ndc_commitment_type)
    2. Specific match on (sector, mitigation_type, 'any')
    3. Sector-wide match on (sector, '*', ndc_commitment_type)
    4. Sector-wide match on (sector, '*', 'any')
    5. Fallback: 'pending_review' (conservative default: never assume eligible without evidence)
    """
    from .models import PositiveNegativeRule

    sector_clean = (sector or "").strip().lower()
    mitigation_clean = (mitigation_type or "").strip().lower()
    ndc_clean = (ndc_commitment_type or "").strip().lower()

    try:
        active_rules = list(PositiveNegativeRule.objects.filter(is_active=True))
    except Exception as e:
        logger.error(f"Error querying PositiveNegativeRule table: {e}")
        return "pending_review"

    if not active_rules:
        # No rules in DB yet -> bootstrap defaults and re-query
        bootstrap_default_rules()
        active_rules = list(PositiveNegativeRule.objects.filter(is_active=True))

    # Priority 1: Exact match on sector, mitigation, ndc
    for rule in active_rules:
        r_sec = rule.sector.strip().lower()
        r_mit = rule.mitigation_type.strip().lower()
        r_ndc = rule.ndc_commitment_type.strip().lower()

        if r_sec == sector_clean and r_mit == mitigation_clean and r_ndc == ndc_clean:
            return rule.status

    # Priority 2: Match on sector, mitigation, and ndc='any'
    for rule in active_rules:
        r_sec = rule.sector.strip().lower()
        r_mit = rule.mitigation_type.strip().lower()
        r_ndc = rule.ndc_commitment_type.strip().lower()

        if r_sec == sector_clean and r_mit == mitigation_clean and r_ndc == "any":
            return rule.status

    # Priority 3: Match on sector, wildcard mitigation ('*'), and ndc
    for rule in active_rules:
        r_sec = rule.sector.strip().lower()
        r_mit = rule.mitigation_type.strip().lower()
        r_ndc = rule.ndc_commitment_type.strip().lower()

        if r_sec == sector_clean and r_mit in ("*", "all") and (r_ndc == ndc_clean or r_ndc == "any"):
            return rule.status

    # Priority 4: Universal wildcard rule if configured
    for rule in active_rules:
        r_sec = rule.sector.strip().lower()
        r_mit = rule.mitigation_type.strip().lower()
        r_ndc = rule.ndc_commitment_type.strip().lower()

        if r_sec in ("*", "all") and r_mit in ("*", "all") and (r_ndc == ndc_clean or r_ndc == "any"):
            return rule.status

    # Default conservative position: case-by-case DNA review
    return "pending_review"


def evaluate_and_update_project(registry_project, auto_save: bool = True) -> str:
    """
    Evaluates a RegistryProject instance against the current Positive/Negative list
    and updates its eligibility_status field.
    """
    status = check_eligibility(
        sector=registry_project.sector,
        mitigation_type=registry_project.mitigation_type,
        ndc_commitment_type=registry_project.ndc_commitment_type,
    )
    registry_project.eligibility_status = status
    if auto_save:
        registry_project.save(update_fields=["eligibility_status", "updated_at"])
    return status


def bootstrap_default_rules():
    """
    Initializes standard benchmark rules based on Bangladesh's National Carbon Framework,
    NDC 3.0, and bilateral Article 6.2 bilateral arrangements (e.g. JCM Japan-Bangladesh).
    Only creates rules if the PositiveNegativeRule table is currently empty.
    """
    from .models import PositiveNegativeRule

    if PositiveNegativeRule.objects.exists():
        return

    default_rules = [
        # 1. Forestry & Mangrove Conservation (Blue Carbon / Sundarbans)
        {
            "sector": "Forestry",
            "mitigation_type": "Afforestation",
            "ndc_commitment_type": "conditional",
            "status": "positive_list",
            "regulatory_reference": "Bangladesh NDC 3.0 Annex 2 - Priority AFOLU Mitigation",
            "notes": "Coastal mangrove restoration & Sundarbans conservation with verified dMRV telemetry."
        },
        {
            "sector": "Forestry",
            "mitigation_type": "Reforestation",
            "ndc_commitment_type": "beyond_ndc",
            "status": "positive_list",
            "regulatory_reference": "MoEFCC Article 6 DNA Pilot Guideline 2024",
            "notes": "High additionality mangrove and social forestry projects."
        },
        # 2. Agriculture (AWD Rice Methane Avoidance)
        {
            "sector": "Agriculture",
            "mitigation_type": "Methane Avoidance",
            "ndc_commitment_type": "conditional",
            "status": "positive_list",
            "regulatory_reference": "Bangladesh Climate Change Strategy and Action Plan (BCCSAP)",
            "notes": "Alternate Wetting and Drying (AWD) paddy irrigation verified via Sentinel-1 SAR backscatter."
        },
        # 3. Renewable Energy (Solar Irrigation & Mini-grids)
        {
            "sector": "Energy",
            "mitigation_type": "Solar Irrigation",
            "ndc_commitment_type": "conditional",
            "status": "positive_list",
            "regulatory_reference": "SREDA National Solar Irrigation Roadmap 2030",
            "notes": "Diesel pump replacement with smart solar pumping & IoT telemetry."
        },
        {
            "sector": "Energy",
            "mitigation_type": "Clean Cookstoves",
            "ndc_commitment_type": "conditional",
            "status": "positive_list",
            "regulatory_reference": "National Action Plan for Clean Cooking (2020-2030)",
            "notes": "Tier-4/5 biomass and electric cooking interventions in rural areas."
        },
        # 4. Ineligible / Negative List Activities
        {
            "sector": "Energy",
            "mitigation_type": "Fossil Efficiency Upgrade",
            "ndc_commitment_type": "any",
            "status": "negative_list",
            "regulatory_reference": "UNFCCC Article 6.2 Environmental Integrity Guidance (COP26/28)",
            "notes": "Unabated coal or heavy fuel oil efficiency improvements without fuel switching are strictly excluded."
        },
        {
            "sector": "Waste",
            "mitigation_type": "Landfill Gas Incineration",
            "ndc_commitment_type": "unconditional",
            "status": "negative_list",
            "regulatory_reference": "DOE National Solid Waste Management Rules",
            "notes": "Unconditional NDC activities cannot be transferred as international ITMOs."
        },
        # 5. Pending Review (Grid Solar PV without storage)
        {
            "sector": "Energy",
            "mitigation_type": "Utility Solar PV",
            "ndc_commitment_type": "unconditional",
            "status": "pending_review",
            "regulatory_reference": "Power Division Renewable Energy Policy 2024",
            "notes": "Standard grid solar PV requires additionality demonstration before Article 6 authorization."
        },
    ]

    for rule_data in default_rules:
        PositiveNegativeRule.objects.create(**rule_data)

    logger.info(f"Bootstrapped {len(default_rules)} default Positive/Negative List rules.")
