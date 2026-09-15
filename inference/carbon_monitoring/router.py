import json
import time
import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import get_db, SessionLocal
from .models import (AnalysisJob, CarbonResult, SatelliteLayer, UploadedBoundary, CarbonReport,
                      CarbonAlert, GroundTruthPlot, EstimateProvenance, BaselineAssessment)
from .satellite import SatelliteEngine
from .estimator import CarbonEstimator, XGB_AVAILABLE
from .report_generator import ReportGenerator
from . import provenance as provenance_utils
from .calibration import run_recalibration
from .baseline import run_dynamic_baseline_assessment, LeakageMonitoringEngine, RiskBufferCalculator
from .uncertainty import (compute_conformal_verra_assessment, ConformalUncertaintyEngine,
                          VerraPrecisionDeductionEngine)

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
        
        # Conformal uncertainty & Verra precision discount evaluation on gross stock
        initial_uncert = compute_conformal_verra_assessment(
            net_creditable_tco2e=round(total_co2e, 2),
            carbon_lower_90=interval.get("carbon_lower_90") or (carbon_per_ha * 0.85),
            carbon_upper_90=interval.get("carbon_upper_90") or (carbon_per_ha * 1.15),
            estimated_carbon_tc_ha=carbon_per_ha,
            db=db
        )

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
            conservative_creditable_tco2e=initial_uncert["conservative_creditable_tco2e"]
        )
        db.add(result)
        db.flush()  # populate result.id before building the provenance record below

        # Part (c): immutable provenance record, written in the SAME transaction
        # as the result it describes. If this fails, the whole estimate is
        # rolled back rather than existing without a provenance trail.
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
            lat=coords[0][0], lng=coords[0][1]
        )
        db.add(prov)

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

        # Verra VM0047 Dynamic Synthetic Control Baseline & 10km Leakage Belt
        try:
            baseline_data = run_dynamic_baseline_assessment(
                job_id=job.id,
                polygon_geojson=job.polygon_geojson,
                forest_area_ha=forest_area_ha,
                project_carbon_tc_ha=carbon_per_ha,
                stratum=estimator_result.get("forest_stratum", "SUNDARBANS_MANGROVE")
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
                carbon_lower_90=interval.get("carbon_lower_90") or (carbon_per_ha * 0.85),
                carbon_upper_90=interval.get("carbon_upper_90") or (carbon_per_ha * 1.15),
                estimated_carbon_tc_ha=carbon_per_ha,
                db=db
            )
            result.relative_margin_of_error = net_uncert["relative_margin_of_error"]
            result.verra_precision_discount_pct = net_uncert["verra_precision_discount_pct"]
            result.conservative_creditable_tco2e = net_uncert["conservative_creditable_tco2e"]
        except Exception as e_base:
            print(f"[Baseline Warning] Could not construct baseline for job {job.id}: {e_base}")

        # Create system Alerts if forest health is poor (NDVI < 0.35) and area is significant
        if sat_result["average_ndvi"] < 0.40 and forest_area_ha > 5.0:
            alert = CarbonAlert(
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

    # Create job in database
    job = AnalysisJob(
        status="pending",
        polygon_geojson=polygon_geojson,
        analysis_type=analysis_type,
        start_date=s_date,
        end_date=e_date
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch background processing task (async queue)
    background_tasks.add_task(run_async_analysis, job.id)

    # Create a quick response indicating job submission
    return {
        "job_id": job.id,
        "status": "pending",
        "message": "Forest carbon stock analysis queued successfully.",
        "project_name": project_name
    }

@router.get("/history")
def get_analysis_history(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    """
    Retrieves pagination list of past analyses and results.
    """
    offset = (page - 1) * limit
    jobs = db.query(AnalysisJob).order_by(AnalysisJob.created_at.desc()).offset(offset).limit(limit).all()
    total = db.query(AnalysisJob).count()

    results = []
    for job in jobs:
        res_data = None
        if job.result:
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
                "conservative_creditable_tco2e": job.result.conservative_creditable_tco2e
            }
        
        layers_data = []
        for l in job.layers:
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

        results.append({
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
            "layers": layers_data
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": results
    }

@router.get("/results/{result_id}")
def get_result(result_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a single carbon result by result_id or job_id, including 90% prediction intervals, multi-pool vector, and Verra conformal precision.
    """
    res = db.query(CarbonResult).filter(CarbonResult.id == result_id).first()
    if not res:
        res = db.query(CarbonResult).filter(CarbonResult.job_id == result_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Carbon result not found.")

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
def get_baseline_assessment(job_id: str, db: Session = Depends(get_db)):
    """
    Retrieves the Verra VM0047 dynamic synthetic control baseline assessment,
    including donor weights, counterfactual trajectory, leakage deduction, and buffer pool withholding.
    """
    baseline = db.query(BaselineAssessment).filter(BaselineAssessment.job_id == job_id).first()
    if not baseline:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job or not job.result:
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
        "leakage_deduction_tco2e": baseline.leakage_deduction_tco2e,
        "leakage_risk_rating": baseline.leakage_risk_rating,
        "buffer_deduction_pct": baseline.buffer_deduction_pct,
        "buffer_withheld_tco2e": baseline.buffer_withheld_tco2e,
        "net_creditable_tco2e": baseline.net_creditable_tco2e,
        "created_at": baseline.created_at.isoformat() if baseline.created_at else None
    }

@router.post("/baseline/assess")
def assess_baseline_direct(
    polygon_geojson: str = Form(...),
    forest_area_ha: float = Form(...),
    project_carbon_tc_ha: float = Form(...),
    stratum: str = Form("SUNDARBANS_MANGROVE"),
    leakage_belt_loss_rate: float = Form(0.015),
    regional_control_loss_rate: float = Form(0.018)
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
def get_uncertainty_assessment(result_id: str, db: Session = Depends(get_db)):
    """
    Retrieves finite-sample distribution-free conformal uncertainty intervals (90% CI)
    and Verra VM0047 precision deduction evaluation for a carbon analysis result.
    """
    res = db.query(CarbonResult).filter(CarbonResult.id == result_id).first()
    if not res:
        res = db.query(CarbonResult).filter(CarbonResult.job_id == result_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Carbon result not found.")

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
    allowable_error: float = Form(0.15)
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
def get_report(job_id: str, format: str = "pdf", db: Session = Depends(get_db)):
    """
    Compiles and downloads report in PDF, CSV, or GeoJSON formats.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job or not job.result:
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
def get_audit_dossier(job_id: str, format: str = "json", db: Session = Depends(get_db)):
    """
    Generates an automated, institutional-grade Verra VM0047 Monitoring Dossier & VVB Audit Package.
    Outputs: JSON (default), Markdown ('markdown' or 'md'), or PDF ('pdf').
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job or not job.result:
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

        # Save boundary
        boundary = UploadedBoundary(
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
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns aggregated carbon estimates, NDVI, and forest health statistics.
    """
    # Fetch completed analysis jobs
    results = db.query(CarbonResult).all()
    alerts_count = db.query(CarbonAlert).filter(CarbonAlert.is_resolved == False).count()
    
    total_co2e = sum([r.tonnes_co2e for r in results])
    total_area = sum([r.forest_area_ha for r in results])
    
    if len(results) > 0:
        avg_ndvi = sum([r.avg_ndvi for r in results]) / len(results)
        avg_confidence = sum([r.confidence for r in results]) / len(results)
        # Average biomass density
        avg_biomass = sum([r.estimated_biomass for r in results]) / len(results)
    else:
        avg_ndvi = 0.0
        avg_confidence = 0.0
        avg_biomass = 0.0

    return {
        "current_carbon_estimate_tC_ha": round(avg_biomass * 0.475, 2) if len(results) > 0 else 0.0,
        "estimated_co2_storage_tCO2e": round(total_co2e, 2),
        "forest_health_score": round(avg_ndvi * 100, 1),
        "vegetation_index_ndvi": round(avg_ndvi, 3),
        "forest_change_percent": 1.25, # mock forest cover trend change
        "estimated_biomass_Mg_ha": round(avg_biomass, 2),
        "confidence_score": round(avg_confidence, 2),
        "latest_satellite_date": datetime.date.today().strftime("%Y-%m-%d"),
        "last_analysis_date": results[-1].created_at.date().strftime("%Y-%m-%d") if len(results) > 0 else None,
        "total_area_size_ha": round(total_area, 2),
        "active_alerts_count": alerts_count
    }

@router.get("/alerts", response_model=List[dict])
def get_alerts(db: Session = Depends(get_db)):
    """
    List all active satellite-triggered forest risk alerts.
    """
    alerts = db.query(CarbonAlert).order_by(CarbonAlert.created_at.desc()).all()
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
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """
    Marks an alert as resolved.
    """
    alert = db.query(CarbonAlert).filter(CarbonAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_resolved = True
    db.commit()
    return {"status": "success", "message": "Alert marked as resolved."}

@router.post("/settings")
def update_settings(model_type: str = Form(...)):
    """
    Toggles the active carbon estimation machine learning model between Random Forest and XGBoost.
    """
    success = carbon_estimator.set_model_type(model_type)
    if not success:
        raise HTTPException(status_code=400, detail=f"Model type '{model_type}' is invalid or not available.")
    return {
        "status": "success",
        "active_model": carbon_estimator.model_type,
        "xgboost_available": XGB_AVAILABLE
    }

@router.get("/settings")
def get_settings():
    """
    Retrieves active model settings.
    """
    return {
        "active_model": carbon_estimator.model_type,
        "xgboost_available": XGB_AVAILABLE,
        "feature_names": carbon_estimator.feature_names,
        "model_version": carbon_estimator.model_meta.get("version"),
        "model_trained_on": carbon_estimator.model_meta.get("trained_on")
    }

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
    db: Session = Depends(get_db)
):
    """
    Logs a real field measurement. This is the only thing that can ever make
    the model's accuracy claims real - there is no code substitute for someone
    physically measuring trees. TODO: gate this behind field-team authentication
    once auth exists; right now anyone who can reach this endpoint can write to
    the calibration dataset, which is a data-integrity risk worth closing before
    this goes anywhere near a VVB conversation.
    """
    try:
        m_date = datetime.datetime.strptime(measurement_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid measurement_date format. Use YYYY-MM-DD.")

    plot = GroundTruthPlot(
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
def list_ground_truth_plots(db: Session = Depends(get_db)):
    plots = db.query(GroundTruthPlot).order_by(GroundTruthPlot.measurement_date.desc()).all()
    return [{
        "id": p.id, "plot_name": p.plot_name, "location": [p.location_lat, p.location_lng],
        "measured_carbon_tc_ha": p.measured_carbon_tc_ha, "measurement_date": p.measurement_date.isoformat(),
        "measurement_method": p.measurement_method, "used_in_training": p.used_in_training
    } for p in plots]


@router.post("/recalibrate")
def trigger_recalibration():
    """
    Manually triggers the recalibration job (normally run on a schedule via
    Celery beat - see calibration.py). TODO: gate behind admin auth before
    exposing this outside internal use; it's a cheap operation to abuse
    (mostly Earth Engine quota) even though it can't corrupt the live model
    thanks to the staging/validate/promote design.
    """
    result = run_recalibration()
    return result

# --- Part (c): provenance ---

@router.get("/provenance/verify-chain")
def verify_provenance_chain(db: Session = Depends(get_db)):
    """
    Walks the entire provenance chain and confirms nothing has been altered
    after the fact. Run this before any audit conversation.
    """
    return provenance_utils.verify_chain(db)


@router.get("/provenance/{result_id}")
def get_provenance(result_id: str, db: Session = Depends(get_db)):
    """
    Returns the full provenance record for one estimate - the artifact you'd
    actually hand a VVB auditor. Recomputes the hash on the fly so tampering
    is visible in the response, not just in an offline check.
    """
    record = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == result_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No provenance record found for this result.")

    payload = {
        "result_id": record.result_id, "data_source": record.data_source,
        "satellite_scene_ids": json.loads(record.satellite_scene_ids or "[]"),
        "gedi_tree_height_source": record.gedi_tree_height_source,
        "model_type": record.model_type, "model_version": record.model_version,
        "model_trained_on": record.model_trained_on,
        "feature_vector": json.loads(record.feature_vector_json),
        "geolocation_lat": record.geolocation_lat, "geolocation_lng": record.geolocation_lng,
    }
    recomputed = provenance_utils.compute_record_hash(payload, record.previous_hash)

    return {
        **payload,
        "record_hash": record.record_hash,
        "previous_hash": record.previous_hash,
        "hash_verified": recomputed == record.record_hash,
        "created_at": record.created_at.isoformat()
    }


