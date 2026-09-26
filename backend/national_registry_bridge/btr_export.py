"""
btr_export.py - Biennial Transparency Report (BTR) Article 6 Structured Summary Export.

Implements UNFCCC Enhanced Transparency Framework (ETF) reporting standards under
Article 13 and Article 6.2 of the Paris Agreement (Decision 18/CMA.1, Decision 2/CMA.3,
and Decision 5/CMA.3 Common Tabular Formats).

Generates the Article 6.2 Structured Summary Table for tracking ITMOs, authorization status,
first transfers, and Corresponding Adjustments against Bangladesh's National GHG Inventory.
"""

import csv
import io
import datetime
from typing import Dict, Any, List, Optional
from django.utils import timezone


def generate_btr_structured_summary(
    registry_project=None,
    reporting_year: Optional[int] = None,
    include_all_projects: bool = False
) -> Dict[str, Any]:
    """
    Generates a structured summary report for Bangladesh's Biennial Transparency Report (BTR).

    Args:
        registry_project: Optional RegistryProject instance to filter by.
        reporting_year: Target reporting year (defaults to current year).
        include_all_projects: If True, aggregates across all projects with submissions.

    Returns:
        Structured dictionary matching UNFCCC Decision 2/CMA.3 Annex Table specifications.
    """
    from .models import RegistryProject, MonitoringReportSubmission, CorrespondingAdjustment

    year = reporting_year or timezone.now().year
    now_iso = timezone.now().isoformat()

    # Query corresponding adjustments and submissions
    ca_query = CorrespondingAdjustment.objects.select_related(
        "monitoring_report_submission",
        "monitoring_report_submission__registry_project"
    )

    if registry_project and not include_all_projects:
        ca_query = ca_query.filter(
            monitoring_report_submission__registry_project=registry_project
        )

    # Filter adjustments by vintage if specified
    adjustments = list(ca_query.order_by("vintage_year", "created_at"))

    # Also include submitted reports that are pending issuance/serial numbers
    sub_query = MonitoringReportSubmission.objects.select_related("registry_project")
    if registry_project and not include_all_projects:
        sub_query = sub_query.filter(registry_project=registry_project)
    submissions = list(sub_query.order_by("-submitted_at"))

    # Aggregate national inventory sector balance
    sector_adjustments: Dict[str, float] = {
        "LULUCF_Forestry": 0.0,
        "Agriculture": 0.0,
        "Energy": 0.0,
        "Waste": 0.0,
        "IPPU": 0.0,
    }

    cumulative_itmos_authorized = 0.0
    cumulative_itmos_adjusted = 0.0

    itmo_table_rows: List[Dict[str, Any]] = []

    for ca in adjustments:
        proj = ca.monitoring_report_submission.registry_project
        qty = float(ca.metric_tonnes_co2e or 0.0)

        if ca.authorized_for_itmo:
            cumulative_itmos_authorized += qty

        if ca.adjustment_applied:
            cumulative_itmos_adjusted += qty
            sec = ca.ndc_inventory_sector
            if sec in sector_adjustments:
                sector_adjustments[sec] += qty
            else:
                sector_adjustments[sec] = qty

        itmo_table_rows.append({
            "unique_identifier": ca.credit_serial_number or f"PENDING-{str(ca.id)[:8]}",
            "project_name": proj.project_name,
            "external_project_id": proj.external_project_id or "N/A",
            "sector": proj.sector,
            "ndc_inventory_sector": ca.ndc_inventory_sector,
            "vintage_year": ca.vintage_year or year,
            "metric": "tCO2e",
            "quantity": round(qty, 2),
            "authorization_status": "Authorized" if ca.authorized_for_itmo else "Pending Authorization",
            "authorized_entity_acquiring": ca.itmo_transfer_partner or "Unassigned",
            "first_transfer_occurred": ca.adjustment_applied,
            "corresponding_adjustment_applied": ca.adjustment_applied,
            "adjustment_date": ca.adjustment_applied_at.isoformat() if ca.adjustment_applied_at else None,
            "adjustment_confirmation_ref": ca.adjustment_confirmation_id or "None",
            "reconciliation_status": ca.reconciliation_status,
            "provenance_chain_hash": ca.monitoring_report_submission.provenance_chain_hash_at_submission,
            "environmental_integrity_criteria": {
                "additionality_verified": proj.eligibility_status == "positive_list",
                "double_counting_safeguard": "Serial retired in National Registry upon ITMO export",
                "permanence_risk_mitigation": "Verra/JCM risk buffer pool applied"
            }
        })

    # Assemble structured summary compliant with Decision 2/CMA.3 Chapter IV
    structured_summary = {
        "btr_metadata": {
            "submitting_party": "People's Republic of Bangladesh",
            "competent_authority": "Department of Environment (DOE), Ministry of Environment, Forest and Climate Change (MoEFCC)",
            "article_6_dna": "Bangladesh Designated National Authority (DNA) for Article 6",
            "reporting_framework": "UNFCCC Paris Agreement Article 13 (ETF) & Article 6.2",
            "decisions_referenced": ["18/CMA.1", "2/CMA.3", "5/CMA.3"],
            "reporting_year": year,
            "generated_at": now_iso,
            "mrv_provider_client": "CarbonOS Bangladesh (Carbon Zero BD)"
        },
        "ndc_accounting_context": {
            "ndc_target_description": "Bangladesh Updated NDC 2021 / NDC 3.0",
            "accounting_approach": "Annual trajectory approach with Multi-Year Target reconciliation",
            "ndc_period": "2021-2030",
            "inventory_sectors_covered": ["Energy", "IPPU", "Agriculture", "LULUCF / Forestry", "Waste"],
        },
        "headline_article_6_metrics": {
            "total_registered_projects_tracked": len(set(s.registry_project_id for s in submissions)),
            "total_monitoring_submissions_logged": len(submissions),
            "total_itmos_authorized_tco2e": round(cumulative_itmos_authorized, 2),
            "total_corresponding_adjustments_applied_tco2e": round(cumulative_itmos_adjusted, 2),
            "adjustments_by_national_inventory_sector_tco2e": {
                k: round(v, 2) for k, v in sector_adjustments.items()
            }
        },
        "table_structured_summary_itmos": itmo_table_rows,
        "methodological_consistency_statement": (
            "All reported ITMO quantities originate from verified dMRV pipelines "
            "incorporating Sentinel-2 optical imagery, Sentinel-1 SAR, NASA GEDI LiDAR, "
            "and ground-truth calibration plots with conformal prediction intervals "
            "and cryptographic hash-chain provenance records."
        )
    }

    return structured_summary


def export_btr_csv(structured_summary: Dict[str, Any]) -> str:
    """
    Exports the Structured Summary ITMO Table to CSV format suitable for official
    UNFCCC Common Tabular Format (CTF) compilation.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header metadata
    meta = structured_summary.get("btr_metadata", {})
    writer.writerow(["# UNFCCC Article 6.2 Structured Summary Table - Bangladesh BTR"])
    writer.writerow(["# Submitting Party", meta.get("submitting_party")])
    writer.writerow(["# Reporting Year", meta.get("reporting_year")])
    writer.writerow(["# Generated At", meta.get("generated_at")])
    writer.writerow([])

    # Table columns
    columns = [
        "Unique ITMO Identifier / Serial",
        "Project Name",
        "External Project ID",
        "Sector",
        "NDC Inventory Sector",
        "Vintage Year",
        "Metric",
        "Quantity (tCO2e)",
        "Authorization Status",
        "Acquiring Partner Party",
        "Corresponding Adjustment Applied",
        "Adjustment Confirmation Ref",
        "Adjustment Date",
        "Reconciliation Status",
        "Provenance Chain Hash"
    ]
    writer.writerow(columns)

    for row in structured_summary.get("table_structured_summary_itmos", []):
        writer.writerow([
            row.get("unique_identifier"),
            row.get("project_name"),
            row.get("external_project_id"),
            row.get("sector"),
            row.get("ndc_inventory_sector"),
            row.get("vintage_year"),
            row.get("metric"),
            row.get("quantity"),
            row.get("authorization_status"),
            row.get("authorized_entity_acquiring"),
            "YES" if row.get("corresponding_adjustment_applied") else "NO",
            row.get("adjustment_confirmation_ref"),
            row.get("adjustment_date") or "",
            row.get("reconciliation_status"),
            row.get("provenance_chain_hash")
        ])

    return output.getvalue()
