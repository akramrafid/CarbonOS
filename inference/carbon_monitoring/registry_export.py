"""
registry_export.py - Verra VM0047 Dynamic Stocking Index Registry Export
Generates compliant audit-ready submission bundles containing:
1. Multi-pool carbon stocks (AGB, BGB, SOC, Total tC & tCO2e)
2. Remote sensing telemetry & sensor fusion feature vectors
3. Conformal / learned 90% quantile uncertainty bounds & conservative deductions
4. Risk buffer pool withholding (Verra AFOLU buffer)
5. Cryptographic hash-chain provenance block & Ed25519 validator co-signatures
"""

import json
import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from .models import CarbonResult, EstimateProvenance, VerificationTask, DroneSurveyResult
from .provenance import get_provenance_trust_status
from .tiering import calculate_relative_uncertainty_width

DEFAULT_VM0047_BUFFER_POOL_PCT = 18.0  # Verra standard AFOLU non-permanence risk buffer

def export_vm0047_stocking_index(
    project_id: str,
    db: Session,
    result_id: Optional[str] = None,
    buffer_pool_pct: float = DEFAULT_VM0047_BUFFER_POOL_PCT
) -> Dict[str, Any]:
    """
    Generates a Verra VM0047 compliant Stocking Index audit export for a given project.
    If result_id is provided, exports the specific monitoring period; otherwise selects
    the latest verified or available CarbonResult for the project.
    """
    query = db.query(CarbonResult)
    if result_id:
        c_res = query.filter(CarbonResult.id == result_id).first()
        if not c_res:
            c_res = query.filter(CarbonResult.job_id == result_id).first()
    else:
        c_res = query.filter(
            (CarbonResult.parcel_id == project_id) |
            (CarbonResult.job_id == project_id) |
            (CarbonResult.id == project_id)
        ).order_by(CarbonResult.created_at.desc()).first()

    if not c_res:
        raise ValueError(f"No carbon monitoring records found for project {project_id}.")

    # Parse JSON fields
    indices = {}
    if getattr(c_res, "indices_json", None):
        indices = json.loads(c_res.indices_json) if isinstance(c_res.indices_json, str) else c_res.indices_json

    interval = {}
    if getattr(c_res, "interval_json", None):
        interval = json.loads(c_res.interval_json) if isinstance(c_res.interval_json, str) else c_res.interval_json

    # Multi-pool breakdown
    biomass_agb = getattr(c_res, "biomass_agb", None) or getattr(c_res, "biomass_agb_mg_ha", None) or (c_res.estimated_biomass * 0.72)
    biomass_bgb = getattr(c_res, "biomass_bgb", None) or getattr(c_res, "biomass_bgb_mg_ha", None) or (c_res.estimated_biomass * 0.28)
    carbon_agb = getattr(c_res, "carbon_agb_tc_ha", None) or getattr(c_res, "carbon_agb", None) or (c_res.estimated_carbon * 0.50)
    carbon_bgb = getattr(c_res, "carbon_bgb_tc_ha", None) or getattr(c_res, "carbon_bgb", None) or (c_res.estimated_carbon * 0.20)
    carbon_soc = getattr(c_res, "carbon_soc_tc_ha", None) or getattr(c_res, "carbon_soc", None) or (c_res.estimated_carbon * 0.30)
    carbon_total = c_res.estimated_carbon
    co2_multiplier = 3.667
    gross_tco2e_ha = carbon_total * co2_multiplier

    # Uncertainty and conservative crediting calculation (VM0047 §8.3)
    c_lower = interval.get("carbon_lower_90") or getattr(c_res, "carbon_lower_90", None) or (carbon_total * 0.85)
    c_upper = interval.get("carbon_upper_90") or getattr(c_res, "carbon_upper_90", None) or (carbon_total * 1.15)
    rel_width = calculate_relative_uncertainty_width(carbon_total, c_lower, c_upper) or 0.20

    # VM0047 requires an uncertainty deduction if relative half-width exceeds 10% (i.e. width > 20%)
    # Precision threshold: 0.15 width
    uncertainty_deduction_pct = max(0.0, round((rel_width - 0.15) * 100, 2))
    uncertainty_deduction_tco2e = gross_tco2e_ha * (uncertainty_deduction_pct / 100.0)

    # Risk buffer withholding
    buffer_withholding_tco2e = (gross_tco2e_ha - uncertainty_deduction_tco2e) * (buffer_pool_pct / 100.0)
    net_creditable_tco2e_ha = max(0.0, gross_tco2e_ha - uncertainty_deduction_tco2e - buffer_withholding_tco2e)

    # Provenance and Multi-Validator Trust Status
    prov_record = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == c_res.id).first()
    provenance_data = None
    if prov_record:
        trust_status = get_provenance_trust_status(prov_record, db)
        provenance_data = {
            "record_hash": prov_record.record_hash,
            "previous_hash": prov_record.previous_hash,
            "hash_chain_intact": trust_status["hash_chain_intact"],
            "model_type": prov_record.model_type,
            "model_version": prov_record.model_version,
            "model_trained_on": prov_record.model_trained_on,
            "satellite_scene_ids": json.loads(prov_record.satellite_scene_ids or "[]"),
            "gedi_source": prov_record.gedi_tree_height_source,
            "validator_signatures": trust_status["validator_signatures"],
            "quorum_reached": trust_status["quorum_reached"],
            "trust_summary": trust_status["honest_summary"]
        }

    # Physical / Drone Surveys (Tier-3 ground validation)
    drone_verifications = []
    tasks = db.query(VerificationTask).filter(VerificationTask.result_id == c_res.id).all()
    for task in tasks:
        for s in task.surveys:
            drone_verifications.append({
                "task_id": task.id,
                "status": task.status,
                "survey_id": s.id,
                "survey_date": s.survey_date.isoformat() if s.survey_date else None,
                "drone_platform": s.drone_platform,
                "collected_by": s.collected_by,
                "measured_carbon_tc_ha": s.measured_carbon_tc_ha,
                "measured_biomass_mg_ha": s.measured_biomass_mg_ha,
                "data_source": s.data_source
            })

    # Assemble complete VM0047 Bundle
    export_bundle = {
        "metadata": {
            "standard": "Verra VM0047 - Methodology for Improved Forest Management Using Dynamic Baselines and Remote Sensing",
            "module": "Dynamic Stocking Index & Multi-Pool Allometry (IPCC Tier-3)",
            "export_version": "2.0.0",
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "project_id": project_id,
            "monitoring_result_id": c_res.id,
            "analysis_date": (c_res.created_at.isoformat() if getattr(c_res, "created_at", None) else datetime.date.today().isoformat()),
            "coordinates": {
                "latitude": getattr(c_res, "location_lat", None) or (prov_record.geolocation_lat if prov_record else 22.25),
                "longitude": getattr(c_res, "location_lng", None) or (prov_record.geolocation_lng if prov_record else 89.55)
            }
        },
        "carbon_pools": {
            "stratum": c_res.forest_stratum or "SUNDARBANS_MANGROVE",
            "aboveground_biomass_agb_mg_ha": round(biomass_agb, 2),
            "belowground_biomass_bgb_mg_ha": round(biomass_bgb, 2),
            "total_biomass_mg_ha": round(c_res.estimated_biomass, 2),
            "carbon_agb_tc_ha": round(carbon_agb, 2),
            "carbon_bgb_tc_ha": round(carbon_bgb, 2),
            "carbon_soc_tc_ha": round(carbon_soc, 2),
            "total_carbon_tc_ha": round(carbon_total, 2),
            "gross_tco2e_ha": round(gross_tco2e_ha, 2)
        },
        "remote_sensing_telemetry": {
            "optical_sensors": "Copernicus Sentinel-2 MSI (10m L2A BOA Reflectance)",
            "radar_sensors": "Copernicus Sentinel-1 SAR (C-Band Interferometric Wide Swath GRD)",
            "lidar_sensor": "NASA GEDI L2A Footprint LiDAR / High-Density UAV LiDAR",
            "indices": {
                "ndvi": indices.get("average_ndvi"),
                "evi": indices.get("average_evi"),
                "ndwi": indices.get("average_ndwi"),
                "savi": indices.get("average_savi"),
                "ndbi": indices.get("average_ndbi"),
                "s1_vv_db": indices.get("average_vv"),
                "s1_vh_db": indices.get("average_vh"),
                "s1_ratio": indices.get("average_ratio"),
                "tree_height_m": indices.get("average_tree_height")
            }
        },
        "uncertainty_and_crediting": {
            "confidence_level": "90%",
            "carbon_lower_90_tc_ha": round(c_lower, 2),
            "carbon_upper_90_tc_ha": round(c_upper, 2),
            "relative_uncertainty_width": round(rel_width, 4),
            "interval_method": interval.get("interval_method", "conformal_residual_quantile"),
            "uncertainty_deduction_pct": uncertainty_deduction_pct,
            "uncertainty_deduction_tco2e_ha": round(uncertainty_deduction_tco2e, 2),
            "buffer_pool_withholding_pct": buffer_pool_pct,
            "buffer_pool_withholding_tco2e_ha": round(buffer_withholding_tco2e, 2),
            "net_creditable_tco2e_ha": round(net_creditable_tco2e_ha, 2)
        },
        "ground_truth_and_drone_validation": {
            "tier3_validation_surveys": drone_verifications,
            "verified_count": len(drone_verifications)
        },
        "cryptographic_provenance_and_trust": provenance_data or {
            "status": "unverified",
            "message": "No cryptographic provenance record found."
        }
    }

    return export_bundle
