"""
tiering.py - Uncertainty-Tiered Monitoring (Treeconomy Pattern)
Automatically flags parcels with high relative prediction uncertainty for physical / drone verification.
Ingests DroneSurveyResult records to feed back into model recalibration.
"""

import json
import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from .models import VerificationTask, DroneSurveyResult, CarbonResult

DEFAULT_UNCERTAINTY_THRESHOLD = 0.35 # Relative width: (upper - lower) / estimate > 0.35 triggers drone inspection

def calculate_relative_uncertainty_width(estimated_carbon: float, lower_90: float, upper_90: float) -> Optional[float]:
    """
    Computes relative uncertainty width W = (upper_90 - lower_90) / estimated_carbon.
    Returns None if inputs are invalid or estimated_carbon <= 0.
    """
    if estimated_carbon is None or estimated_carbon <= 0:
        return None
    if lower_90 is None or upper_90 is None:
        return None
    return float(max(0.0, upper_90 - lower_90) / estimated_carbon)

def flag_for_verification(
    carbon_result: Any,
    threshold_relative_width: float = DEFAULT_UNCERTAINTY_THRESHOLD,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Evaluates prediction uncertainty on a CarbonResult.
    If relative uncertainty width W > threshold_relative_width, automatically creates a
    pending VerificationTask in the database for drone/field team dispatch.
    """
    # Extract interval values
    interval_data = None
    if hasattr(carbon_result, "interval_json") and carbon_result.interval_json:
        if isinstance(carbon_result.interval_json, dict):
            interval_data = carbon_result.interval_json
        elif isinstance(carbon_result.interval_json, str):
            try:
                interval_data = json.loads(carbon_result.interval_json)
            except Exception:
                interval_data = None
    elif isinstance(carbon_result, dict):
        interval_data = carbon_result.get("interval")

    estimated_carbon = getattr(carbon_result, "estimated_carbon", None)
    if estimated_carbon is None and isinstance(carbon_result, dict):
        estimated_carbon = carbon_result.get("estimated_carbon_per_ha") or carbon_result.get("estimated_carbon")

    if not interval_data or estimated_carbon is None or estimated_carbon <= 0:
        return {
            "flagged": False,
            "relative_width": None,
            "threshold": threshold_relative_width,
            "reason": "missing_interval_or_carbon_value"
        }

    lower_90 = interval_data.get("carbon_lower_90")
    upper_90 = interval_data.get("carbon_upper_90")
    width = calculate_relative_uncertainty_width(estimated_carbon, lower_90, upper_90)

    if width is None:
        return {
            "flagged": False,
            "relative_width": None,
            "threshold": threshold_relative_width,
            "reason": "invalid_interval_bounds"
        }

    if width > threshold_relative_width:
        task_id = None
        if db is not None:
            result_id = getattr(carbon_result, "id", None)
            # Avoid duplicate pending tasks for the same result_id
            existing_task = db.query(VerificationTask).filter_by(result_id=result_id, status="pending").first() if result_id else None
            if not existing_task:
                due_date = datetime.date.today() + datetime.timedelta(days=14)
                notes = (
                    f"Relative uncertainty width W={width:.3f} exceeds threshold {threshold_relative_width:.2f}. "
                    f"Model-estimated carbon: {estimated_carbon:.2f} tC/ha (90% CI: [{lower_90:.2f}, {upper_90:.2f}]). "
                    f"Dispatching UAV LiDAR / field verification task."
                )
                new_task = VerificationTask(
                    result_id=result_id,
                    status="pending",
                    assigned_to="Field UAV Operations",
                    verification_method="drone_lidar",
                    due_date=due_date,
                    notes=notes
                )
                db.add(new_task)
                db.commit()
                db.refresh(new_task)
                task_id = new_task.id
            else:
                task_id = existing_task.id

        return {
            "flagged": True,
            "relative_width": round(width, 4),
            "threshold": threshold_relative_width,
            "task_id": task_id,
            "reason": "uncertainty_exceeds_threshold"
        }

    return {
        "flagged": False,
        "relative_width": round(width, 4),
        "threshold": threshold_relative_width,
        "reason": "uncertainty_within_acceptable_bounds"
    }

def complete_verification_task(
    task_id: int,
    drone_data: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """
    Marks a VerificationTask as completed and registers a DroneSurveyResult record.
    The resulting record is stored with used_in_training=False, ready to be ingested
    into the next model recalibration cycle.
    """
    task = db.query(VerificationTask).filter(VerificationTask.id == task_id).first()
    if not task:
        raise ValueError(f"VerificationTask with ID {task_id} not found.")

    survey_date = drone_data.get("survey_date")
    if isinstance(survey_date, str):
        try:
            survey_date = datetime.date.fromisoformat(survey_date)
        except Exception:
            survey_date = datetime.date.today()
    elif not isinstance(survey_date, datetime.date):
        survey_date = datetime.date.today()

    survey_result = DroneSurveyResult(
        verification_task_id=task.id,
        measured_biomass_mg_ha=float(drone_data["measured_biomass_mg_ha"]),
        measured_carbon_tc_ha=float(drone_data["measured_carbon_tc_ha"]),
        survey_date=survey_date,
        drone_platform=drone_data.get("drone_platform", "DJI Matrice 300 RTK + Zenmuse L1 LiDAR"),
        raw_imagery_path=drone_data.get("raw_imagery_path"),
        collected_by=drone_data.get("collected_by", "Certified UAV Surveyor"),
        data_source=drone_data.get("data_source", "drone_lidar"),
        used_in_training=False
    )
    db.add(survey_result)

    task.status = "completed"
    task.notes = (task.notes or "") + f" [Completed on {datetime.date.today().isoformat()}: {survey_result.measured_carbon_tc_ha:.2f} tC/ha verified]"
    task.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(survey_result)

    return {
        "task_id": task.id,
        "survey_id": survey_result.id,
        "status": "completed",
        "measured_carbon_tc_ha": survey_result.measured_carbon_tc_ha,
        "measured_biomass_mg_ha": survey_result.measured_biomass_mg_ha
    }

def list_verification_tasks(status: Optional[str] = None, db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """
    Lists verification tasks, optionally filtered by status ('pending', 'completed', etc.).
    Includes parcel and carbon estimate metadata.
    """
    if db is None:
        return []

    query = db.query(VerificationTask)
    if status:
        query = query.filter(VerificationTask.status == status)
    tasks = query.order_by(VerificationTask.created_at.desc()).all()

    results = []
    for t in tasks:
        item = {
            "id": t.id,
            "result_id": t.result_id,
            "status": t.status,
            "assigned_to": t.assigned_to,
            "verification_method": t.verification_method,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "notes": t.notes,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            "surveys": []
        }
        if t.surveys:
            for s in t.surveys:
                item["surveys"].append({
                    "id": s.id,
                    "measured_biomass_mg_ha": s.measured_biomass_mg_ha,
                    "measured_carbon_tc_ha": s.measured_carbon_tc_ha,
                    "survey_date": s.survey_date.isoformat() if s.survey_date else None,
                    "drone_platform": s.drone_platform,
                    "collected_by": s.collected_by,
                    "data_source": s.data_source,
                    "used_in_training": s.used_in_training
                })
        res = getattr(t, "carbon_result", None) or getattr(t, "result", None)
        if res:
            item["parcel_id"] = getattr(res, "parcel_id", None)
            item["estimated_carbon"] = getattr(res, "estimated_carbon", None)
            item["estimated_biomass"] = getattr(res, "estimated_biomass", None)
            date_val = getattr(res, "analysis_date", None) or getattr(res, "created_at", None)
            item["analysis_date"] = date_val.isoformat() if date_val else None
        results.append(item)
    return results
