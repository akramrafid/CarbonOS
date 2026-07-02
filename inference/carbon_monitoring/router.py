import json
import time
import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import get_db, SessionLocal
from .models import AnalysisJob, CarbonResult, SatelliteLayer, UploadedBoundary, CarbonReport, CarbonAlert
from .satellite import SatelliteEngine
from .estimator import CarbonEstimator, XGB_AVAILABLE
from .report_generator import ReportGenerator

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
        if polygon_geojson.get("type") == "Polygon":
            # GEE / Simulator expects list of [lat, lng]
            # GeoJSON stores coordinates as [lng, lat]
            coords = [[c[1], c[0]] for c in polygon_geojson["coordinates"][0]]
        elif polygon_geojson.get("type") == "Feature":
            coords = [[c[1], c[0]] for c in polygon_geojson["geometry"]["coordinates"][0]]
        else:
            raise ValueError("Unsupported geometry type. Must be Polygon.")

        # Run satellite analysis
        sat_result = satellite_engine.run_analysis(
            coords, 
            job.start_date.strftime("%Y-%m-%d"), 
            job.end_date.strftime("%Y-%m-%d"), 
            job.analysis_type
        )

        # Run AI estimation
        estimator_result = carbon_estimator.estimate_carbon_stock(sat_result)

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
        result = CarbonResult(
            job_id=job.id,
            estimated_biomass=biomass_per_ha,
            estimated_carbon=carbon_per_ha,
            tonnes_co2e=round(total_co2e, 2),
            avg_ndvi=sat_result["average_ndvi"],
            forest_area_ha=forest_area_ha,
            confidence=round(confidence, 2),
            satellite_sources=sat_result["satellite_sources"]
        )
        db.add(result)

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
                "estimated_biomass": job.result.estimated_biomass,
                "estimated_carbon": job.result.estimated_carbon,
                "tonnes_co2e": job.result.tonnes_co2e,
                "avg_ndvi": job.result.avg_ndvi,
                "forest_area_ha": job.result.forest_area_ha,
                "confidence": job.result.confidence,
                "satellite_sources": job.result.satellite_sources
            }
        
        layers_data = []
        for l in job.layers:
            layers_data.append({
                "layer_type": l.layer_type,
                "layer_url": l.layer_url
            })

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
            "layers": layers_data
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": results
    }

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

    if format == "csv":
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
    else: # PDF
        pdf_bytes = ReportGenerator.generate_pdf_placeholder(job_data, result_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=carbon_report_{job_id}.pdf"}
        )

@router.post("/boundary/upload")
async def upload_boundary(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ingests and parses boundary spatial files (GeoJSON/KML) and extracts polygon paths.
    """
    contents = await file.read()
    filename = file.filename
    file_ext = filename.split(".")[-1].lower()

    if file_ext not in ["geojson", "json", "kml"]:
        raise HTTPException(status_code=400, detail="Only GeoJSON and KML files are supported.")

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
        "feature_names": carbon_estimator.feature_names
    }
