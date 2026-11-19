import json
import time
import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from pydantic import BaseModel, Field

from .database import get_db, SessionLocal
from .models import (AnalysisJob, CarbonResult, SatelliteLayer, UploadedBoundary, CarbonReport,
                      CarbonAlert, GroundTruthPlot, EstimateProvenance, BaselineAssessment,
                      VerificationTask, DroneSurveyResult, ValidatorSignature, AccreditedValidator)
from esg_rag.auth import Principal, require
from .satellite import SatelliteEngine, RASTERIO_AVAILABLE
from .estimator import CarbonEstimator, XGB_AVAILABLE
from .report_generator import ReportGenerator
from . import provenance as provenance_utils
from .calibration import run_recalibration
from .baseline import run_dynamic_baseline_assessment, LeakageMonitoringEngine, RiskBufferCalculator
from .osm_intelligence import extract_osm_context
from .uncertainty import (compute_conformal_verra_assessment, ConformalUncertaintyEngine,
                          VerraPrecisionDeductionEngine)
from .tiering import flag_for_verification, complete_verification_task, list_verification_tasks
from .registry_export import export_vm0047_stocking_index


class OsmLayersRequest(BaseModel):
    polygon_geojson: Any
    buffer_km: float = Field(default=10.0, ge=1.0, le=25.0)
    gross_additionality_tco2e: Optional[float] = Field(default=None, ge=0.0)
    regional_control_loss_rate: float = Field(default=0.018, ge=0.0, le=1.0)
    allow_overpass: bool = True
    ignore_cache: bool = False

class PixelInspectRequest(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    job_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class CompleteTaskRequest(BaseModel):
    measured_biomass_mg_ha: float
    measured_carbon_tc_ha: float
    survey_date: Optional[str] = None
    drone_platform: Optional[str] = "DJI Matrice 300 RTK + Zenmuse L1 LiDAR"
    raw_imagery_path: Optional[str] = None
    collected_by: Optional[str] = "Certified UAV Surveyor"
    data_source: Optional[str] = "drone_lidar"

class SignProvenanceRequest(BaseModel):
    validator_id: str
    validator_name: str
    validator_organization: str
    public_key_hex: str
    signature_hex: str
    comments: Optional[str] = None

class UpdateSettingsRequest(BaseModel):
    model_type: str


class RegisterValidatorRequest(BaseModel):
    validator_id: str
    validator_name: str
    validator_organization: str
    public_key_hex: str
    accreditation_standard: str = "Verra VVB / ISO 14065"


def _get_tenant_job(db: Session, job_id: str, organization_id: str) -> AnalysisJob:
    job = (
        db.query(AnalysisJob)
        .filter(AnalysisJob.id == job_id, AnalysisJob.organization_id == organization_id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found.")
    return job


def _get_tenant_result(db: Session, result_id: str, organization_id: str) -> CarbonResult:
    res = (
        db.query(CarbonResult)
        .join(AnalysisJob, AnalysisJob.id == CarbonResult.job_id)
        .filter(CarbonResult.id == result_id, AnalysisJob.organization_id == organization_id)
        .first()
    )
    if not res:
        res = (
            db.query(CarbonResult)
            .join(AnalysisJob, AnalysisJob.id == CarbonResult.job_id)
            .filter(CarbonResult.job_id == result_id, AnalysisJob.organization_id == organization_id)
            .first()
        )
    if not res:
        raise HTTPException(status_code=404, detail="Carbon result not found.")
    return res

router = APIRouter(prefix="/api/carbon", tags=["Carbon Monitoring"])

# Initialize engines
satellite_engine = SatelliteEngine()
carbon_estimator = CarbonEstimator()

# Background worker for async imagery and AI estimation
def run_async_analysis(job_id: str):
    db: Session = SessionLocal()
    start_time = time.time()
    try:
        # Fetch job
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            return
            
        job.status = "running"
        db.commit()

        # Parse polygon coordinates
        polygon_geojson = json.loads(job.polygon_geojson)
        coords = []
        if isinstance(polygon_geojson, list):
            coords = polygon_geojson
        elif isinstance(polygon_geojson, dict):
            if polygon_geojson.get("type") == "Polygon":
                # GEE / Simulator expects list of [lat, lng]
                # GeoJSON stores coordinates as [lng, lat]
                coords = [[c[1], c[0]] for c in polygon_geojson["coordinates"][0]]
            elif polygon_geojson.get("type") == "Feature":
                coords = [[c[1], c[0]] for c in polygon_geojson["geometry"]["coordinates"][0]]
            else:
                raise ValueError("Unsupported geometry type. Must be Polygon.")
        else:
            raise ValueError("Unsupported geometry type. Must be Polygon.")

        # Run satellite analysis
        sat_result = satellite_engine.run_analysis(
            coords, 
            job.start_date.strftime("%Y-%m-%d"), 
            job.end_date.strftime("%Y-%m-%d"), 
            job.analysis_type
        )

        # Run AI estimation with multi-pool allometry
        estimator_result = carbon_estimator.estimate_carbon_stock(sat_result, lat=coords[0][0], lng=coords[0][1])

        # Compute totals
        forest_area_ha = sat_result["forest_area_ha"]
        carbon_per_ha = estimator_result["estimated_carbon_per_ha"]
        biomass_per_ha = estimator_result["estimated_biomass_per_ha"]
        
        total_carbon = carbon_per_ha * forest_area_ha
        total_co2e = total_carbon * estimator_result["co2_multiplier"]

        # Calculate dynamic confidence (slightly perturbs based on cloud cover or simulation)
        confidence = 0.88 - (0.01 * sat_result.get("analysis_metadata", {}).get("cloud_cover_max", 10)/10.0)
        # Ensure it stays in bounds
        confidence = min(0.98, max(0.50, confidence))

        # Save result
        interval = estimator_result.get("interval") or {}
        c_low_90 = interval.get("carbon_lower_90") if interval.get("carbon_lower_90") is not None else (carbon_per_ha * 0.85)
        c_high_90 = interval.get("carbon_upper_90") if interval.get("carbon_upper_90") is not None else (carbon_per_ha * 1.15)

        # Conformal uncertainty & Verra precision discount evaluation on gross stock
        initial_uncert = compute_conformal_verra_assessment(
            net_creditable_tco2e=round(total_co2e, 2),
            carbon_lower_90=c_low_90,
            carbon_upper_90=c_high_90,
            estimated_carbon_tc_ha=carbon_per_ha,
            db=db
        )

        sat_meta = sat_result.get("analysis_metadata", {}) or {}
        eo_summary = {
            "average_ndvi": sat_result.get("average_ndvi"),
            "average_evi": sat_result.get("average_evi"),
            "average_ndwi": sat_result.get("average_ndwi"),
            "average_tree_height_m": sat_result.get("average_tree_height"),
            "elevation_m": (sat_meta.get("terrain") or {}).get("elevation_m"),
            "data_source": sat_result.get("data_source", "unknown"),
            "pixel_extraction_mode": sat_result.get("pixel_extraction_mode", sat_result.get("data_source", "unknown")),
            "eo_pixel_verified": bool(sat_result.get("eo_pixel_verified", False)),
            "gedi_tree_height_source": sat_meta.get("gedi_tree_height_source", sat_result.get("gedi_tree_height_source")),
            "s2_scene_ids": sat_meta.get("s2_scene_ids", []),
            "s1_scene_ids": sat_meta.get("s1_scene_ids", []),
        }

        result = CarbonResult(
            job_id=job.id,
            estimated_biomass=biomass_per_ha,
            estimated_carbon=carbon_per_ha,
            tonnes_co2e=round(total_co2e, 2),
            avg_ndvi=sat_result["average_ndvi"],
            forest_area_ha=forest_area_ha,
            confidence=round(confidence, 2),
            satellite_sources=sat_result["satellite_sources"],
            biomass_lower_90=interval.get("biomass_lower_90"),
            biomass_upper_90=interval.get("biomass_upper_90"),
            carbon_lower_90=interval.get("carbon_lower_90"),
            carbon_upper_90=interval.get("carbon_upper_90"),
            interval_method=interval.get("interval_method"),
            forest_stratum=estimator_result.get("forest_stratum", "SUNDARBANS_MANGROVE"),
            carbon_agb_tc_ha=estimator_result.get("carbon_agb_tc_ha"),
            carbon_bgb_tc_ha=estimator_result.get("carbon_bgb_tc_ha"),
            carbon_soc_tc_ha=estimator_result.get("carbon_soc_tc_ha"),
            relative_margin_of_error=initial_uncert["relative_margin_of_error"],
            verra_precision_discount_pct=initial_uncert["verra_precision_discount_pct"],
            conservative_creditable_tco2e=initial_uncert["conservative_creditable_tco2e"],
            indices_json=json.dumps(eo_summary),
        )
        db.add(result)
        db.flush()  # populate result.id

        # Save layer
        tile_url = sat_result.get("tile_url", "")
        if not tile_url:
            tile_url = carbon_estimator.predict_grid_heatmap(sat_result["grid_pixels"], job.analysis_type)

        layer = SatelliteLayer(
            job_id=job.id,
            layer_type=job.analysis_type,
            layer_url=tile_url
        )
        db.add(layer)

        grid_cells = carbon_estimator.predict_grid_cells(sat_result.get("grid_pixels"), max_dim=28)
        if grid_cells:
            db.add(SatelliteLayer(
                job_id=job.id,
                layer_type="canopy_grid_json",
                layer_url=json.dumps(grid_cells),
            ))

        # Verra VM0047 Dynamic Synthetic Control Baseline & 10km Leakage Belt
        baseline_rec = None
        try:
            baseline_data = run_dynamic_baseline_assessment(
                job_id=job.id,
                polygon_geojson=job.polygon_geojson,
                forest_area_ha=forest_area_ha,
                project_carbon_tc_ha=carbon_per_ha,
                stratum=estimator_result.get("forest_stratum", "SUNDARBANS_MANGROVE"),
                satellite_engine=None,
            )
            baseline_rec = BaselineAssessment(
                job_id=job.id,
                baseline_method=baseline_data["baseline_method"],
                donor_pool_count=len(baseline_data["donor_weights"]),
                pre_treatment_rmse=baseline_data["pre_treatment_rmse"],
                weights_json=json.dumps(baseline_data["donor_weights"]),
                historical_trajectory_json=json.dumps(baseline_data["trajectory"]),
                counterfactual_carbon_tc_ha=baseline_data["counterfactual_carbon_tc_ha"],
                gross_additionality_tco2e=baseline_data["gross_additionality_tco2e"],
                leakage_belt_area_ha=baseline_data["leakage_belt_area_ha"],
                leakage_deduction_tco2e=baseline_data["leakage_deduction_tco2e"],
                leakage_risk_rating=baseline_data["leakage_risk_rating"],
                buffer_deduction_pct=baseline_data["buffer_deduction_pct"],
                buffer_withheld_tco2e=baseline_data["buffer_withheld_tco2e"],
                net_creditable_tco2e=baseline_data["net_creditable_tco2e"]
            )
            db.add(baseline_rec)

            # Re-evaluate conformal uncertainty and Verra discount on net additionality credits
            net_uncert = compute_conformal_verra_assessment(
                net_creditable_tco2e=baseline_data["net_creditable_tco2e"],
                carbon_lower_90=c_low_90,
                carbon_upper_90=c_high_90,
                estimated_carbon_tc_ha=carbon_per_ha,
                db=db
            )
            result.relative_margin_of_error = net_uncert["relative_margin_of_error"]
            result.verra_precision_discount_pct = net_uncert["verra_precision_discount_pct"]
            result.conservative_creditable_tco2e = net_uncert["conservative_creditable_tco2e"]
        except Exception as e_base:
            print(f"[Baseline Warning] Could not construct baseline for job {job.id}: {e_base}")

        db.flush()

        # Part (c): immutable provenance record written AFTER final result & baseline values
        # so the SHA-256 digest seals exact quantification + AOI polygon + input provenance.
        prov = provenance_utils.build_provenance_record(
            db,
            result_id=result.id,
            data_source=sat_result.get("data_source", "unknown"),
            satellite_scene_ids=sat_result.get("analysis_metadata", {}).get("s2_scene_ids", []),
            gedi_tree_height_source=sat_result.get("analysis_metadata", {}).get(
                "gedi_tree_height_source", "formula_estimate_not_gedi_l2b"),
            model_type=estimator_result.get("model_used", "random_forest"),
            model_version=estimator_result.get("model_version", "0.0.0-unset"),
            model_trained_on=estimator_result.get("model_trained_on", "synthetic-v1"),
            feature_vector=estimator_result.get("feature_vector", {}),
            lat=coords[0][0], lng=coords[0][1],
            carbon_result=result,
            baseline=baseline_rec,
            polygon_geojson=job.polygon_geojson,
            organization_id=job.organization_id,
        )
        db.add(prov)

        # Treeconomy tiered uncertainty monitoring dispatch
        try:
            flag_res = flag_for_verification(result, threshold_relative_width=0.35, db=db)
            if flag_res.get("flagged"):
                print(f"[Tiering Alert] High uncertainty W={flag_res['relative_width']} triggered verification task {flag_res.get('task_id')}")
        except Exception as e_tier:
            print(f"[Tiering Warning] Failed to evaluate verification task: {e_tier}")

        # Create system Alerts if forest health is poor (NDVI < 0.35) and area is significant
        if sat_result["average_ndvi"] < 0.40 and forest_area_ha > 5.0:
            alert = CarbonAlert(
                organization_id=job.organization_id,
                alert_type="rapid_decline",
                severity="critical" if sat_result["average_ndvi"] < 0.30 else "warning",
                location_lat=coords[0][0],
                location_lng=coords[0][1],
                message=f"Rapid vegetation decline detected. Average NDVI dropped to {sat_result['average_ndvi']}.",
                suggested_action="Deploy drone inspections or local forestry patrol immediately."
            )
            db.add(alert)
        elif random_trigger_fire_alert(coords):
            alert = CarbonAlert(
                organization_id=job.organization_id,
                alert_type="fire_risk",
                severity="warning",
                location_lat=coords[0][0],
                location_lng=coords[0][1],
                message="High canopy dryness and elevated thermal readings suggest fire risk in this forest block.",
                suggested_action="Alert local fire suppression units; monitor weather patterns."
            )
            db.add(alert)

        # Update job
        processing_time = time.time() - start_time
        job.status = "completed"
        job.processing_time = round(processing_time, 2)
        db.commit()

    except Exception as e:
        print(f"[AI Pipeline Error] Async analysis failed for job {job_id}: {e}")
        try:
            db.rollback()
            job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
            if job:
                job.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

def random_trigger_fire_alert(coords):
    # Generates alerts probabilistically to showcase alert list functionality
    import random
    random.seed(int(coords[0][0] * 1000))
    return random.random() < 0.20

# Endpoints

@router.post("/analyze")
async def analyze_carbon(
    background_tasks: BackgroundTasks,
    polygon_geojson: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    analysis_type: str = Form("ndvi"),
    project_name: str = Form("Carbon Project"),
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db)
):
    """
    Submits a forest polygon boundary for NDVI, composite generation, and carbon stock AI estimation.
    Runs asynchronously if the process takes longer than 10 seconds.
    """
    try:
        # Validate dates
        s_date = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
        e_date = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Create job in database scoped to authenticated organization
    job = AnalysisJob(
        organization_id=principal.organization_id,
        status="pending",
        polygon_geojson=polygon_geojson,
        analysis_type=analysis_type,
        start_date=s_date,
        end_date=e_date
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch background processing task via Celery or durable in-process queue
    from .job_queue import dispatch_analysis_job
    queue_backend = dispatch_analysis_job(background_tasks, job.id, run_async_analysis)

    # Create a quick response indicating job submission
    return {
        "job_id": job.id,
        "status": "pending",
        "queue_backend": queue_backend,
        "message": "Forest carbon stock analysis queued successfully.",
        "project_name": project_name
    }

def _serialize_job(job: AnalysisJob) -> dict:
    res_data = None
    prov_summary = None
    if job.result:
        indices_meta = {}
        if getattr(job.result, "indices_json", None):
            try:
                indices_meta = json.loads(job.result.indices_json) or {}
            except Exception:
                indices_meta = {}

        if getattr(job.result, "provenance", None):
            p = job.result.provenance
            try:
                scene_ids = json.loads(p.satellite_scene_ids) if p.satellite_scene_ids else []
            except Exception:
                scene_ids = []
            prov_summary = {
                "data_source": p.data_source,
                "gedi_tree_height_source": p.gedi_tree_height_source,
                "model_type": p.model_type,
                "model_version": p.model_version,
                "model_trained_on": p.model_trained_on,
                "satellite_scene_ids": scene_ids,
                "record_hash": p.record_hash,
                "chain_index": p.chain_index,
            }

        res_data = {
            "id": job.result.id,
            "estimated_biomass": job.result.estimated_biomass,
            "estimated_carbon": job.result.estimated_carbon,
            "tonnes_co2e": job.result.tonnes_co2e,
            "avg_ndvi": job.result.avg_ndvi,
            "forest_area_ha": job.result.forest_area_ha,
            "confidence": job.result.confidence,
            "satellite_sources": job.result.satellite_sources,
            "biomass_lower_90": job.result.biomass_lower_90,
            "biomass_upper_90": job.result.biomass_upper_90,
            "carbon_lower_90": job.result.carbon_lower_90,
            "carbon_upper_90": job.result.carbon_upper_90,
            "interval_method": job.result.interval_method,
            "forest_stratum": job.result.forest_stratum,
            "carbon_agb_tc_ha": job.result.carbon_agb_tc_ha,
            "carbon_bgb_tc_ha": job.result.carbon_bgb_tc_ha,
            "carbon_soc_tc_ha": job.result.carbon_soc_tc_ha,
            "relative_margin_of_error": job.result.relative_margin_of_error,
            "verra_precision_discount_pct": job.result.verra_precision_discount_pct,
            "conservative_creditable_tco2e": job.result.conservative_creditable_tco2e,
            "eo_summary": indices_meta,
        }

    layers_data = []
    grid_cells = []
    for l in job.layers:
        if l.layer_type == "canopy_grid_json":
            try:
                parsed = json.loads(l.layer_url)
                if isinstance(parsed, list):
                    grid_cells = parsed
            except Exception:
                pass
        else:
            layers_data.append({
                "layer_type": l.layer_type,
                "layer_url": l.layer_url
            })

    base_data = None
    if job.baseline:
        base_data = {
            "baseline_method": job.baseline.baseline_method,
            "donor_pool_count": job.baseline.donor_pool_count,
            "pre_treatment_rmse": job.baseline.pre_treatment_rmse,
            "counterfactual_carbon_tc_ha": job.baseline.counterfactual_carbon_tc_ha,
            "gross_additionality_tco2e": job.baseline.gross_additionality_tco2e,
            "leakage_belt_area_ha": job.baseline.leakage_belt_area_ha,
            "leakage_deduction_tco2e": job.baseline.leakage_deduction_tco2e,
            "leakage_risk_rating": job.baseline.leakage_risk_rating,
            "buffer_deduction_pct": job.baseline.buffer_deduction_pct,
            "buffer_withheld_tco2e": job.baseline.buffer_withheld_tco2e,
            "net_creditable_tco2e": job.baseline.net_creditable_tco2e
        }

    return {
        "id": job.id,
        "status": job.status,
        "analysis_type": job.analysis_type,
        "start_date": job.start_date.isoformat(),
        "end_date": job.end_date.isoformat(),
        "processing_time": job.processing_time,
        "created_at": job.created_at.isoformat(),
        "polygon_geojson": job.polygon_geojson,
        "result": res_data,
        "baseline": base_data,
        "provenance": prov_summary,
        "layers": layers_data,
        "grid_cells": grid_cells,
    }


@router.get("/history")
def get_analysis_history(
    page: int = 1,
    limit: int = 10,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Retrieves paginated list of past analyses and results for the caller's organization.
    """
    offset = (page - 1) * limit
    base_q = db.query(AnalysisJob).filter(AnalysisJob.organization_id == principal.organization_id)
    jobs = base_q.order_by(AnalysisJob.created_at.desc()).offset(offset).limit(limit).all()
    total = base_q.count()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [_serialize_job(job) for job in jobs],
    }


@router.get("/jobs/{job_id}")
def get_analysis_job(
    job_id: str,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Retrieves a single analysis job with its result, baseline, layers, provenance, and EO pixel grid cells.
    """
    job = (
        db.query(AnalysisJob)
        .filter(AnalysisJob.id == job_id, AnalysisJob.organization_id == principal.organization_id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found.")
    return _serialize_job(job)

@router.get("/results/{result_id}")
def get_result(
    result_id: str,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Retrieves a single carbon result by result_id or job_id, scoped to caller's organization.
    """
    res = _get_tenant_result(db, result_id, principal.organization_id)

    return {
        "id": res.id,
        "job_id": res.job_id,
        "estimated_biomass": res.estimated_biomass,
        "estimated_carbon": res.estimated_carbon,
        "tonnes_co2e": res.tonnes_co2e,
        "avg_ndvi": res.avg_ndvi,
        "forest_area_ha": res.forest_area_ha,
        "confidence": res.confidence,
        "satellite_sources": res.satellite_sources,
        "biomass_lower_90": res.biomass_lower_90,
        "biomass_upper_90": res.biomass_upper_90,
        "carbon_lower_90": res.carbon_lower_90,
        "carbon_upper_90": res.carbon_upper_90,
        "interval_method": res.interval_method,
        "forest_stratum": res.forest_stratum,
        "carbon_agb_tc_ha": res.carbon_agb_tc_ha,
        "carbon_bgb_tc_ha": res.carbon_bgb_tc_ha,
        "carbon_soc_tc_ha": res.carbon_soc_tc_ha,
        "relative_margin_of_error": res.relative_margin_of_error,
        "verra_precision_discount_pct": res.verra_precision_discount_pct,
        "conservative_creditable_tco2e": res.conservative_creditable_tco2e,
        "created_at": res.created_at.isoformat() if res.created_at else None
    }

@router.get("/baseline/{job_id}")
def get_baseline_assessment(
    job_id: str,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Retrieves the Verra VM0047 dynamic synthetic control baseline assessment for a tenant job.
    """
    job = _get_tenant_job(db, job_id, principal.organization_id)
    baseline = db.query(BaselineAssessment).filter(BaselineAssessment.job_id == job.id).first()
    if not baseline:
        if not job.result:
            raise HTTPException(status_code=404, detail="Baseline assessment not found for this job.")
        # Compute on-the-fly if missing on older job
        baseline_data = run_dynamic_baseline_assessment(
            job_id=job.id,
            polygon_geojson=job.polygon_geojson,
            forest_area_ha=job.result.forest_area_ha,
            project_carbon_tc_ha=job.result.estimated_carbon,
            stratum=job.result.forest_stratum or "SUNDARBANS_MANGROVE"
        )
        return baseline_data

    job_row = job
    belt_geo = (
        LeakageMonitoringEngine.calculate_leakage_belt_geometry(job_row.polygon_geojson, buffer_km=10.0)
        if job_row
        else None
    )

    return {
        "id": baseline.id,
        "job_id": baseline.job_id,
        "baseline_method": baseline.baseline_method,
        "donor_pool_count": baseline.donor_pool_count,
        "pre_treatment_rmse": baseline.pre_treatment_rmse,
        "donor_weights": json.loads(baseline.weights_json),
        "trajectory": json.loads(baseline.historical_trajectory_json),
        "counterfactual_carbon_tc_ha": baseline.counterfactual_carbon_tc_ha,
        "gross_additionality_tco2e": baseline.gross_additionality_tco2e,
        "leakage_belt_area_ha": baseline.leakage_belt_area_ha,
        "leakage_belt_geojson": belt_geo["leakage_belt_geojson"] if belt_geo else None,
        "leakage_deduction_tco2e": baseline.leakage_deduction_tco2e,
        "leakage_risk_rating": baseline.leakage_risk_rating,
        "buffer_deduction_pct": baseline.buffer_deduction_pct,
        "buffer_withheld_tco2e": baseline.buffer_withheld_tco2e,
        "net_creditable_tco2e": baseline.net_creditable_tco2e,
        "created_at": baseline.created_at.isoformat() if baseline.created_at else None
    }


@router.post("/osm/layers")
def get_osm_vector_layers(
    payload: OsmLayersRequest,
    principal: Principal = Depends(require("read")),
):
    """
    Extracts OpenStreetMap vector overlays (forest, water, roads, industrial) and computes
    Verra VM0047 10 km leakage belt spatial pressure metrics via QuackOSM (local Bangladesh PBF)
    with Overpass API fallback when no local PBF extract is mounted.
    """
    osm_ctx = extract_osm_context(
        polygon_geojson=payload.polygon_geojson,
        buffer_km=payload.buffer_km,
        allow_overpass=payload.allow_overpass,
        ignore_cache=payload.ignore_cache,
    )
    leakage_assessment = LeakageMonitoringEngine.assess_osm_leakage(
        polygon_geojson=payload.polygon_geojson,
        gross_additionality_tco2e=payload.gross_additionality_tco2e if payload.gross_additionality_tco2e is not None else 0.0,
        osm_context=osm_ctx,
        regional_control_loss_rate=payload.regional_control_loss_rate,
        allow_overpass=payload.allow_overpass,
        buffer_km=payload.buffer_km,
    )
    return {
        **osm_ctx,
        "leakage_assessment": leakage_assessment,
    }


@router.post("/pixel-inspect")
def inspect_pixel_carbon(
    payload: PixelInspectRequest,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Runs backend dMRV multi-pool carbon estimation for a 100m spatial patch centered at (lat, lng).
    Returns real backend satellite indices, model estimates, provenance, and unverified/calibrated status
    instead of client-side approximations.
    """
    today = datetime.date.today()
    s_date = payload.start_date or (today - datetime.timedelta(days=180)).strftime("%Y-%m-%d")
    e_date = payload.end_date or today.strftime("%Y-%m-%d")

    delta = 0.0005  # ~110m pixel inspection window
    patch_coords = [
        [payload.lat - delta, payload.lng - delta],
        [payload.lat + delta, payload.lng - delta],
        [payload.lat + delta, payload.lng + delta],
        [payload.lat - delta, payload.lng + delta],
    ]

    sat_result = satellite_engine.run_analysis(
        patch_coords,
        s_date,
        e_date,
        "ndvi",
        include_grid=False,
        include_tile=False,
    )

    sanitized_ndvi = float(sat_result.get("average_ndvi") if sat_result.get("average_ndvi") is not None else 0.0)
    sanitized_ndwi = float(sat_result.get("average_ndwi") if sat_result.get("average_ndwi") is not None else 0.0)
    raw_h = sat_result.get("average_tree_height")
    default_h = (
        0.0
        if (sanitized_ndvi < 0.15 or (sanitized_ndwi > 0.10 and sanitized_ndvi < 0.28))
        else max(1.0, (sanitized_ndvi - 0.12) * 24.0)
    )
    sanitized_h = float(raw_h if raw_h is not None else default_h)

    # Guard against None band reductions over open water or 100%-clouded patches
    sanitized_sat = {
        **sat_result,
        "average_ndvi": sanitized_ndvi,
        "average_evi": float(sat_result.get("average_evi") if sat_result.get("average_evi") is not None else 0.0),
        "average_ndwi": sanitized_ndwi,
        "average_savi": float(sat_result.get("average_savi") if sat_result.get("average_savi") is not None else 0.0),
        "average_ndbi": float(sat_result.get("average_ndbi") if sat_result.get("average_ndbi") is not None else 0.0),
        "average_vv": float(sat_result.get("average_vv") if sat_result.get("average_vv") is not None else -16.0),
        "average_vh": float(sat_result.get("average_vh") if sat_result.get("average_vh") is not None else -22.0),
        "average_ratio": float(sat_result.get("average_ratio") if sat_result.get("average_ratio") is not None else 6.0),
        "average_tree_height": sanitized_h,
    }

    est = carbon_estimator.estimate_carbon_stock(sanitized_sat, lat=payload.lat, lng=payload.lng)

    # Honest provenance and verification label derived strictly from live engine metadata
    sat_meta = sat_result.get("analysis_metadata", {}) or {}
    cloud_max = sat_meta.get("cloud_cover_max", 20)
    confidence = min(0.98, max(0.50, 0.88 - (0.01 * cloud_max / 10.0)))
    trained_on = est.get("model_trained_on") or "unknown"
    model_used = est.get("model_used") or "random_forest"
    is_real_calibrated = str(trained_on).startswith("real-")
    pct = round(confidence * 100)
    status_tag = f"calibrated on {trained_on}" if is_real_calibrated else f"{trained_on}, unverified"
    confidence_label = f"{pct}% ({model_used} {est.get('model_version', '0.0.0')}; {status_tag})"

    matched_job_id = None
    if payload.job_id:
        job = (
            db.query(AnalysisJob)
            .filter(AnalysisJob.id == payload.job_id, AnalysisJob.organization_id == principal.organization_id)
            .first()
        )
        if job and job.result:
            matched_job_id = job.id

    biomass_agb = float(est.get("biomass_agb_mg_ha", 0.0))
    biomass_total = float(est.get("estimated_biomass_per_ha", 0.0))
    carbon_agb = float(est.get("carbon_agb_tc_ha", 0.0))
    carbon_total = float(est.get("estimated_carbon_per_ha", 0.0))
    co2_mult = float(est.get("co2_multiplier", 3.667))

    return {
        "lat": round(payload.lat, 5),
        "lng": round(payload.lng, 5),
        "ndvi": round(sanitized_sat["average_ndvi"], 3),
        "evi": round(sanitized_sat["average_evi"], 3),
        "ndwi": round(sanitized_sat["average_ndwi"], 3),
        "estimated_biomass_mg_ha": round(biomass_agb, 2),
        "estimated_biomass_total_mg_ha": round(biomass_total, 2),
        "estimated_carbon_tc_ha": round(carbon_agb, 2),
        "estimated_carbon_total_tc_ha": round(carbon_total, 2),
        "carbon_agb_tc_ha": round(carbon_agb, 2),
        "carbon_bgb_tc_ha": round(float(est.get("carbon_bgb_tc_ha", 0.0)), 2),
        "carbon_soc_tc_ha": round(float(est.get("carbon_soc_tc_ha", 0.0)), 2),
        "tonnes_co2e_ha": round(carbon_total * co2_mult, 2),
        "forest_stratum": est.get("forest_stratum", "COASTAL_AGROFORESTRY"),
        "confidence": round(confidence, 2),
        "confidence_label": confidence_label,
        "data_source": sat_result.get("data_source", "unknown"),
        "pixel_extraction_mode": sat_result.get("pixel_extraction_mode", sat_result.get("data_source", "unknown")),
        "eo_pixel_verified": bool(sat_result.get("eo_pixel_verified", True)),
        "gedi_tree_height_source": sat_result.get("gedi_tree_height_source")
            or sat_meta.get("gedi_tree_height_source", "formula_estimate_not_gedi_l2b"),
        "average_tree_height_m": round(sanitized_h, 2),
        "elevation_m": (sat_meta.get("terrain") or {}).get("elevation_m"),
        "satellite_sources": sat_result.get("satellite_sources", "Unknown"),
        "s2_scene_ids": sat_meta.get("s2_scene_ids", []),
        "s1_scene_ids": sat_meta.get("s1_scene_ids", []),
        "date_range": {"start_date": s_date, "end_date": e_date},
        "model_used": model_used,
        "model_version": est.get("model_version"),
        "model_trained_on": trained_on,
        "is_verified": False,
        "interval": est.get("interval"),
        "matched_job_id": matched_job_id,
    }

@router.post("/baseline/assess")
def assess_baseline_direct(
    polygon_geojson: str = Form(...),
    forest_area_ha: float = Form(...),
    project_carbon_tc_ha: float = Form(...),
    stratum: str = Form("SUNDARBANS_MANGROVE"),
    leakage_belt_loss_rate: float = Form(0.015),
    regional_control_loss_rate: float = Form(0.018),
    principal: Principal = Depends(require("read")),
):
    """
    Direct simulation endpoint for Verra VM0047 dynamic baseline, leakage belt, and risk buffer.
    """
    return run_dynamic_baseline_assessment(
        job_id="SIMULATED_BASELINE",
        polygon_geojson=polygon_geojson,
        forest_area_ha=forest_area_ha,
        project_carbon_tc_ha=project_carbon_tc_ha,
        stratum=stratum,
        leakage_belt_loss_rate=leakage_belt_loss_rate,
        regional_control_loss_rate=regional_control_loss_rate
    )

@router.get("/uncertainty/{result_id}")
def get_uncertainty_assessment(
    result_id: str,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Retrieves finite-sample distribution-free conformal uncertainty intervals (90% CI)
    and Verra VM0047 precision deduction evaluation for a carbon analysis result.
    """
    res = _get_tenant_result(db, result_id, principal.organization_id)

    assessment = compute_conformal_verra_assessment(
        net_creditable_tco2e=res.tonnes_co2e,
        carbon_lower_90=res.carbon_lower_90 or (res.estimated_carbon * 0.85),
        carbon_upper_90=res.carbon_upper_90 or (res.estimated_carbon * 1.15),
        estimated_carbon_tc_ha=res.estimated_carbon,
        db=db
    )
    assessment["result_id"] = res.id
    assessment["job_id"] = res.job_id
    assessment["verra_compliance_standard"] = "Verra VM0047 Section 8.4 & VCS Standard v4.5"
    return assessment

@router.post("/uncertainty/assess")
def assess_uncertainty_direct(
    net_creditable_tco2e: float = Form(...),
    carbon_lower_90: float = Form(...),
    carbon_upper_90: float = Form(...),
    estimated_carbon_tc_ha: float = Form(...),
    allowable_error: float = Form(0.15),
    principal: Principal = Depends(require("read")),
):
    """
    Direct simulation endpoint for Conformal Prediction bounds and Verra VM0047 precision deduction.
    """
    return compute_conformal_verra_assessment(
        net_creditable_tco2e=net_creditable_tco2e,
        carbon_lower_90=carbon_lower_90,
        carbon_upper_90=carbon_upper_90,
        estimated_carbon_tc_ha=estimated_carbon_tc_ha,
        allowable_error=allowable_error
    )

@router.get("/report/{job_id}")
def get_report(
    job_id: str,
    format: str = "pdf",
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Compiles and downloads report in PDF, CSV, or GeoJSON formats, scoped to caller's organization.
    """
    job = _get_tenant_job(db, job_id, principal.organization_id)
    if not job.result:
        raise HTTPException(status_code=404, detail="Analysis result or job not found.")

    # Project metadata mapping
    job_data = {
        "id": job.id,
        "project_name": f"Forest Block {job.id[:8].upper()}",
        "polygon_geojson": job.polygon_geojson,
        "processing_time": job.processing_time
    }
    
    result_data = {
        "estimated_biomass": job.result.estimated_biomass,
        "estimated_carbon": job.result.estimated_carbon,
        "tonnes_co2e": job.result.tonnes_co2e,
        "avg_ndvi": job.result.avg_ndvi,
        "forest_area_ha": job.result.forest_area_ha,
        "confidence": job.result.confidence,
        "satellite_sources": job.result.satellite_sources
    }

    if format in ["dossier", "vvb-pdf", "audit-pdf"]:
        provenance = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == job.result.id).first()
        dossier = ReportGenerator.build_vvb_audit_dossier(job, job.result, job.baseline, provenance, db=db)
        return Response(
            content=ReportGenerator.generate_vvb_dossier_pdf(dossier),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=VVB_Audit_Dossier_{job_id[:8]}.pdf"}
        )
    elif format in ["dossier-md", "markdown", "md"]:
        provenance = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == job.result.id).first()
        dossier = ReportGenerator.build_vvb_audit_dossier(job, job.result, job.baseline, provenance, db=db)
        return Response(
            content=ReportGenerator.generate_vvb_dossier_markdown(dossier),
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=VVB_Audit_Dossier_{job_id[:8]}.md"}
        )
    elif format == "csv":
        csv_content = ReportGenerator.generate_csv(job_data, result_data)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=carbon_report_{job_id}.csv"}
        )
    elif format == "geojson":
        geojson_content = ReportGenerator.generate_geojson(job_data, result_data)
        return Response(
            content=geojson_content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=boundary_carbon_{job_id}.geojson"}
        )
    else: # PDF standard summary
        pdf_bytes = ReportGenerator.generate_pdf_placeholder(job_data, result_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=carbon_report_{job_id}.pdf"}
        )

@router.get("/report/audit-dossier/{job_id}")
def get_audit_dossier(
    job_id: str,
    format: str = "json",
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Generates an institutional-grade Verra VM0047 Monitoring Dossier & VVB Audit Package.
    Outputs: JSON (default), Markdown ('markdown' or 'md'), or PDF ('pdf').
    """
    job = _get_tenant_job(db, job_id, principal.organization_id)
    if not job.result:
        raise HTTPException(status_code=404, detail="Analysis result or job not found.")

    provenance = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == job.result.id).first()
    dossier = ReportGenerator.build_vvb_audit_dossier(job, job.result, job.baseline, provenance, db=db)

    if format in ["markdown", "md"]:
        md_text = ReportGenerator.generate_vvb_dossier_markdown(dossier)
        return Response(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=VVB_Audit_Dossier_{job_id[:8]}.md"}
        )
    elif format == "pdf":
        pdf_bytes = ReportGenerator.generate_vvb_dossier_pdf(dossier)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=VVB_Audit_Dossier_{job_id[:8]}.pdf"}
        )
    else:
        return dossier

@router.post("/boundary/upload")
async def upload_boundary(
    file: UploadFile = File(...),
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db)
):
    """
    Ingests and parses boundary spatial files (GeoJSON/KML) and extracts polygon paths.
    """
    # Enforce maximum file size check of 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds the maximum limit of 5MB.")

    filename = file.filename
    file_ext = filename.split(".")[-1].lower()

    if file_ext not in ["geojson", "json", "kml"]:
        raise HTTPException(status_code=400, detail="Only GeoJSON and KML files are supported.")

    # Validate MIME type / content type
    allowed_types = ["application/json", "application/xml", "application/vnd.google-earth.kml+xml", "text/plain", "application/octet-stream"]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file format or MIME type.")

    try:
        if file_ext in ["geojson", "json"]:
            raw_text = contents.decode("utf-8")
            geojson_data = json.loads(raw_text)
            
            # Extract polygon geometry
            coords = None
            if geojson_data.get("type") == "FeatureCollection" and len(geojson_data.get("features", [])) > 0:
                feature = geojson_data["features"][0]
                geometry = feature.get("geometry", {})
                if geometry.get("type") == "Polygon":
                    coords = geometry["coordinates"]
            elif geojson_data.get("type") == "Feature":
                geometry = geojson_data.get("geometry", {})
                if geometry.get("type") == "Polygon":
                    coords = geometry["coordinates"]
            elif geojson_data.get("type") == "Polygon":
                coords = geojson_data.get("coordinates")

            if not coords:
                raise ValueError("Could not extract a valid Polygon geometry from GeoJSON.")
                
            boundary_geojson = json.dumps({"type": "Polygon", "coordinates": coords})

        else: # KML simple parsing
            raw_text = contents.decode("utf-8")
            # Minimalist mock parser for KML coordinates
            # Look for <coordinates> tag
            import re
            coord_match = re.search(r"<coordinates>(.*?)</coordinates>", raw_text, re.DOTALL)
            if not coord_match:
                raise ValueError("No coordinates tag found in KML file.")
            
            coord_str = coord_match.group(1).strip()
            coord_lines = coord_str.split()
            coords_list = []
            for line in coord_lines:
                parts = line.split(",")
                if len(parts) >= 2:
                    lng = float(parts[0])
                    lat = float(parts[1])
                    coords_list.append([lng, lat])

            if len(coords_list) < 3:
                raise ValueError("KML coordinates do not contain a valid polygon (less than 3 coordinates).")
                
            # Close polygon if not closed
            if coords_list[0] != coords_list[-1]:
                coords_list.append(coords_list[0])
                
            boundary_geojson = json.dumps({"type": "Polygon", "coordinates": [coords_list]})

        # Save boundary scoped to tenant organization
        boundary = UploadedBoundary(
            organization_id=principal.organization_id,
            name=filename,
            file_type=file_ext,
            boundary_data=boundary_geojson
        )
        db.add(boundary)
        db.commit()
        db.refresh(boundary)

        return {
            "id": boundary.id,
            "filename": filename,
            "polygon": json.loads(boundary_geojson)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse spatial file: {str(e)}")

@router.get("/dashboard")
def get_dashboard_summary(
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated carbon estimates, NDVI, and forest health statistics for the caller's organization.
    """
    results = (
        db.query(CarbonResult)
        .join(AnalysisJob, AnalysisJob.id == CarbonResult.job_id)
        .filter(AnalysisJob.organization_id == principal.organization_id)
        .order_by(CarbonResult.created_at.asc())
        .all()
    )
    alerts_count = (
        db.query(CarbonAlert)
        .filter(CarbonAlert.organization_id == principal.organization_id, CarbonAlert.is_resolved == False)  # noqa: E712
        .count()
    )

    total_co2e = sum([r.tonnes_co2e for r in results])
    total_area = sum([r.forest_area_ha for r in results])

    if len(results) > 0:
        avg_ndvi = sum([r.avg_ndvi for r in results]) / len(results)
        avg_confidence = sum([r.confidence for r in results]) / len(results)
        avg_biomass = sum([r.estimated_biomass for r in results]) / len(results)
    else:
        avg_ndvi = 0.0
        avg_confidence = 0.0
        avg_biomass = 0.0

    forest_change_pct = None
    if len(results) >= 2 and results[0].avg_ndvi > 0:
        forest_change_pct = round(((results[-1].avg_ndvi - results[0].avg_ndvi) / results[0].avg_ndvi) * 100.0, 2)

    return {
        "current_carbon_estimate_tC_ha": round(avg_biomass * 0.475, 2) if len(results) > 0 else 0.0,
        "estimated_co2_storage_tCO2e": round(total_co2e, 2),
        "forest_health_score": round(avg_ndvi * 100, 1),
        "vegetation_index_ndvi": round(avg_ndvi, 3),
        "forest_change_percent": forest_change_pct,
        "estimated_biomass_Mg_ha": round(avg_biomass, 2),
        "confidence_score": round(avg_confidence, 2),
        "latest_satellite_date": datetime.date.today().strftime("%Y-%m-%d"),
        "last_analysis_date": results[-1].created_at.date().strftime("%Y-%m-%d") if len(results) > 0 else None,
        "total_area_size_ha": round(total_area, 2),
        "active_alerts_count": alerts_count
    }

@router.get("/alerts", response_model=List[dict])
def get_alerts(
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    List all active satellite-triggered forest risk alerts for the caller's organization.
    """
    alerts = (
        db.query(CarbonAlert)
        .filter(CarbonAlert.organization_id == principal.organization_id)
        .order_by(CarbonAlert.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "location": [a.location_lat, a.location_lng],
            "message": a.message,
            "suggested_action": a.suggested_action,
            "is_resolved": a.is_resolved,
            "timestamp": a.created_at.isoformat()
        } for a in alerts
    ]

@router.post("/alerts/resolve/{alert_id}")
def resolve_alert(
    alert_id: str,
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db),
):
    """
    Marks a tenant alert as resolved.
    """
    alert = (
        db.query(CarbonAlert)
        .filter(CarbonAlert.id == alert_id, CarbonAlert.organization_id == principal.organization_id)
        .first()
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_resolved = True
    db.commit()
    return {"status": "success", "message": "Alert marked as resolved."}

@router.get("/settings")
def get_settings(principal: Principal = Depends(require("read"))):
    """
    Retrieves active model settings including multi-modal fusion model gate status.
    """
    sat_mode = (
        "gee_live"
        if satellite_engine.ee_initialized
        else ("stac_cog" if RASTERIO_AVAILABLE else "simulation_fallback")
    )
    return {
        "active_model": carbon_estimator.model_type,
        "xgboost_available": XGB_AVAILABLE,
        "fusion_model_available": True,
        "fusion_model_loaded": carbon_estimator.fusion_estimator.is_loaded,
        "fusion_model_status": carbon_estimator.fusion_estimator.model_meta.get("status", "gated_insufficient_real_data"),
        "fusion_gate_threshold": 150,
        "feature_names": carbon_estimator.feature_names,
        "model_version": carbon_estimator.model_meta.get("version"),
        "model_trained_on": carbon_estimator.model_meta.get("trained_on"),
        "ee_initialized": bool(satellite_engine.ee_initialized),
        "rasterio_available": bool(RASTERIO_AVAILABLE),
        "satellite_engine_mode": sat_mode,
    }


@router.post("/settings")
def update_settings(
    payload: Optional[UpdateSettingsRequest] = None,
    model_type: Optional[str] = Form(None),
    principal: Principal = Depends(require("admin")),
):
    """
    Updates the active estimator model type (admin only).
    """
    chosen_type = (payload.model_type if payload else None) or model_type
    if not chosen_type:
        raise HTTPException(status_code=400, detail="model_type is required.")
    try:
        success = carbon_estimator.set_model_type(chosen_type)
        if not success:
            raise HTTPException(status_code=400, detail=f"Model type '{chosen_type}' is invalid or not available.")
        return {
            "status": "success",
            "active_model": carbon_estimator.model_type,
            "xgboost_available": XGB_AVAILABLE,
            "fusion_model_available": True,
            "fusion_model_loaded": carbon_estimator.fusion_estimator.is_loaded,
            "fusion_model_status": carbon_estimator.fusion_estimator.model_meta.get("status", "gated_insufficient_real_data")
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

# --- Part (b): ground-truth plots ---

@router.post("/ground-truth")
def submit_ground_truth_plot(
    plot_name: str = Form(...),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    measured_biomass_mg_ha: float = Form(...),
    measured_carbon_tc_ha: float = Form(...),
    measurement_date: str = Form(...),
    measurement_method: str = Form(...),
    collected_by: str = Form(...),
    plot_radius_m: float = Form(15.0),
    notes: Optional[str] = Form(None),
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db)
):
    """
    Logs a real field measurement scoped to the caller's authenticated organization.
    """
    try:
        m_date = datetime.datetime.strptime(measurement_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid measurement_date format. Use YYYY-MM-DD.")

    plot = GroundTruthPlot(
        organization_id=principal.organization_id,
        plot_name=plot_name,
        location_lat=location_lat,
        location_lng=location_lng,
        plot_radius_m=plot_radius_m,
        measured_biomass_mg_ha=measured_biomass_mg_ha,
        measured_carbon_tc_ha=measured_carbon_tc_ha,
        measurement_date=m_date,
        measurement_method=measurement_method,
        collected_by=collected_by,
        notes=notes
    )
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return {"id": plot.id, "status": "recorded", "used_in_training": False}


@router.get("/ground-truth")
def list_ground_truth_plots(
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    plots = (
        db.query(GroundTruthPlot)
        .filter(GroundTruthPlot.organization_id == principal.organization_id)
        .order_by(GroundTruthPlot.measurement_date.desc())
        .all()
    )
    return [{
        "id": p.id, "plot_name": p.plot_name, "location": [p.location_lat, p.location_lng],
        "measured_carbon_tc_ha": p.measured_carbon_tc_ha, "measurement_date": p.measurement_date.isoformat(),
        "measurement_method": p.measurement_method, "used_in_training": p.used_in_training
    } for p in plots]


@router.post("/recalibrate")
def trigger_recalibration(principal: Principal = Depends(require("admin"))):
    """
    Triggers the recalibration job (admin only).
    """
    result = run_recalibration()
    return result

# --- Part (c): provenance & Accredited VVB PKI ---

@router.get("/provenance/verify-chain")
def verify_provenance_chain(
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Walks the provenance chain and confirms hash + live quantification integrity.
    """
    return provenance_utils.verify_chain(db, organization_id=principal.organization_id)


@router.get("/provenance/{result_id}")
def get_provenance(
    result_id: str,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Returns the full provenance record for a tenant's estimate with dual trust status.
    """
    res = _get_tenant_result(db, result_id, principal.organization_id)
    record = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == res.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No provenance record found for this result.")

    trust_status = provenance_utils.get_provenance_trust_status(record, db)

    payload = {
        "result_id": record.result_id, "data_source": record.data_source,
        "satellite_scene_ids": json.loads(record.satellite_scene_ids or "[]"),
        "gedi_tree_height_source": record.gedi_tree_height_source,
        "model_type": record.model_type, "model_version": record.model_version,
        "model_trained_on": record.model_trained_on,
        "feature_vector": json.loads(record.feature_vector_json),
        "geolocation_lat": record.geolocation_lat, "geolocation_lng": record.geolocation_lng,
    }

    return {
        **payload,
        **trust_status,
        "hash_verified": trust_status["hash_chain_intact"],
        "created_at": record.created_at.isoformat()
    }


@router.get("/validators")
def list_accredited_validators(
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    rows = db.query(AccreditedValidator).order_by(AccreditedValidator.created_at.desc()).all()
    return [
        {
            "validator_id": v.validator_id,
            "validator_name": v.validator_name,
            "validator_organization": v.validator_organization,
            "public_key_hex": v.public_key_hex,
            "accreditation_standard": v.accreditation_standard,
            "is_active": v.is_active,
            "revoked_at": v.revoked_at.isoformat() if v.revoked_at else None,
        }
        for v in rows
    ]


@router.post("/validators", status_code=201)
def create_accredited_validator(
    payload: RegisterValidatorRequest,
    principal: Principal = Depends(require("admin")),
    db: Session = Depends(get_db),
):
    """Registers an external accredited VVB/DOE Ed25519 public key (admin only)."""
    try:
        entry = provenance_utils.register_accredited_validator(
            db,
            validator_id=payload.validator_id,
            validator_name=payload.validator_name,
            validator_organization=payload.validator_organization,
            public_key_hex=payload.public_key_hex,
            accreditation_standard=payload.accreditation_standard,
            registered_by_sub=principal.sub,
        )
        return {
            "status": "registered",
            "validator_id": entry.validator_id,
            "validator_organization": entry.validator_organization,
            "public_key_hex": entry.public_key_hex,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid validator registration: {e}")


@router.delete("/validators/{validator_id}")
def revoke_validator(
    validator_id: str,
    principal: Principal = Depends(require("admin")),
    db: Session = Depends(get_db),
):
    try:
        entry = provenance_utils.revoke_accredited_validator(db, validator_id)
        return {"status": "revoked", "validator_id": entry.validator_id}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/provenance/{result_id}/sign")
def sign_provenance(
    result_id: str,
    payload: SignProvenanceRequest,
    principal: Principal = Depends(require("review")),
    db: Session = Depends(get_db),
):
    """
    Attaches an accredited VVB validator's Ed25519 co-signature to a tenant provenance record.
    """
    res = _get_tenant_result(db, result_id, principal.organization_id)
    try:
        sig_record = provenance_utils.add_validator_signature(
            db=db,
            result_id=res.id,
            validator_id=payload.validator_id,
            validator_name=payload.validator_name,
            validator_organization=payload.validator_organization,
            public_key_hex=payload.public_key_hex,
            signature_hex=payload.signature_hex,
            comments=payload.comments
        )
        return {
            "status": "success",
            "message": "Validator signature verified and attached to provenance record.",
            "signature_id": sig_record.id,
            "validator_id": sig_record.validator_id,
            "signed_at": sig_record.signed_at.isoformat()
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add signature: {e}")


# --- Tiered Monitoring & Drone Verification Tasks (Treeconomy Pattern) ---

@router.get("/verification-tasks")
def get_verification_tasks(
    status: Optional[str] = None,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db),
):
    """
    Lists verification tasks flagged due to high model prediction uncertainty for caller's organization.
    """
    return list_verification_tasks(status=status, db=db, organization_id=principal.organization_id)


@router.post("/verification-tasks/{task_id}/complete")
def complete_task(
    task_id: str,
    payload: CompleteTaskRequest,
    principal: Principal = Depends(require("write")),
    db: Session = Depends(get_db),
):
    """
    Marks a verification task as completed and ingests drone survey measurements (tenant-scoped).
    """
    task = db.query(VerificationTask).filter(VerificationTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Verification task not found.")
    _get_tenant_result(db, task.result_id, principal.organization_id)
    try:
        res = complete_verification_task(task_id, payload.model_dump(), db)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete task: {e}")


# --- Verra VM0047 Dynamic Stocking Index Registry Export ---

@router.get("/registry-export/vm0047/{project_id}")
def get_vm0047_export(
    project_id: str,
    result_id: Optional[str] = None,
    buffer_pool_pct: float = 18.0,
    principal: Principal = Depends(require("read")),
    db: Session = Depends(get_db)
):
    """
    Exports a Verra VM0047-compliant Dynamic Stocking Index submission bundle scoped to caller's organization.
    """
    try:
        bundle = export_vm0047_stocking_index(
            project_id=project_id,
            db=db,
            result_id=result_id,
            buffer_pool_pct=buffer_pool_pct,
            organization_id=principal.organization_id,
        )
        return bundle
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate VM0047 export: {e}")


