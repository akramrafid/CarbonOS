"""
Part (b): scheduled recalibration job.

Run this periodically (see the Celery beat snippet at the bottom) or trigger it
manually via POST /api/carbon/recalibrate (router.py, admin-gated in production).

What it does, in order:
  1. Pull every GroundTruthPlot not yet used in a successful training run.
  2. For each plot, build a small polygon around its lat/lng and re-run the
     SatelliteEngine for its measurement_date, so the model sees the same kind
     of feature vector at prediction time and at calibration time.
  3. Hand (X, y) to CarbonEstimator.retrain_with_ground_truth(), which owns the
     staging/validate/promote decision.
  4. On success, mark the consumed plots used_in_training=True and log the event.
  5. On failure (not enough data, or validation didn't clear the bar), log why
     and leave the live model untouched.
"""
import datetime
import pandas as pd
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import GroundTruthPlot, DroneSurveyResult, VerificationTask
from .satellite import SatelliteEngine
from .estimator import CarbonEstimator

PLOT_BUFFER_DEGREES = 0.00135  # ~150m at the equator; matches a ~15m-radius field plot loosely


def _point_to_polygon(lat: float, lng: float, buffer_deg: float = PLOT_BUFFER_DEGREES):
    """SatelliteEngine.run_analysis expects a polygon. Build a small square around
    the plot's point coordinates rather than adding a whole new point-query path."""
    return [
        [lat - buffer_deg, lng - buffer_deg],
        [lat - buffer_deg, lng + buffer_deg],
        [lat + buffer_deg, lng + buffer_deg],
        [lat + buffer_deg, lng - buffer_deg],
        [lat - buffer_deg, lng - buffer_deg],
    ]


def _extract_features_for_plot(satellite_engine: SatelliteEngine, plot: GroundTruthPlot) -> dict:
    """Re-runs the same satellite feature extraction used at prediction time,
    for a single ground-truth plot's location and measurement date, so training
    features and prediction-time features come from the same pipeline."""
    polygon = _point_to_polygon(plot.location_lat, plot.location_lng)
    # Small window around the measurement date to give the compositor scenes to work with
    start = (plot.measurement_date - datetime.timedelta(days=15)).strftime("%Y-%m-%d")
    end = (plot.measurement_date + datetime.timedelta(days=15)).strftime("%Y-%m-%d")
    return satellite_engine.run_analysis(polygon, start, end, "carbon_heatmap")


def _extract_features_for_drone_survey(satellite_engine: SatelliteEngine, survey: DroneSurveyResult) -> tuple:
    """Extracts satellite features for a DroneSurveyResult by locating its
    parent parcel coordinates from the linked CarbonResult."""
    task = survey.verification_task
    if not task or not task.carbon_result:
        return None, None
    c_res = task.carbon_result
    lat = getattr(c_res, "location_lat", None)
    lng = getattr(c_res, "location_lng", None)
    if lat is None or lng is None:
        return None, None
    polygon = _point_to_polygon(lat, lng)
    s_date = survey.survey_date if isinstance(survey.survey_date, datetime.date) else datetime.date.today()
    start = (s_date - datetime.timedelta(days=15)).strftime("%Y-%m-%d")
    end = (s_date + datetime.timedelta(days=15)).strftime("%Y-%m-%d")
    sat_res = satellite_engine.run_analysis(polygon, start, end, "carbon_heatmap")
    return sat_res, (lat, lng)


def run_recalibration(min_samples: int = 30) -> dict:
    db: Session = SessionLocal()
    satellite_engine = SatelliteEngine()
    estimator = CarbonEstimator()

    try:
        plots = db.query(GroundTruthPlot).filter(GroundTruthPlot.used_in_training == False).all()  # noqa: E712
        drone_surveys = db.query(DroneSurveyResult).filter(DroneSurveyResult.used_in_training == False).all()  # noqa: E712

        total_available = len(plots) + len(drone_surveys)
        if total_available < min_samples:
            result = {
                "promoted": False,
                "reason": f"only {total_available} new ground-truth/drone records available ({len(plots)} field plots, {len(drone_surveys)} drone surveys), need >= {min_samples}."
            }
            print(f"[Calibration] Skipping: {result['reason']}")
            return result

        rows = []
        used_plots = []
        used_surveys = []

        # Process field plots
        for plot in plots:
            try:
                sat_result = _extract_features_for_plot(satellite_engine, plot)
                if sat_result.get("data_source") == "simulated":
                    print(f"[Calibration] Skipping plot {plot.id}: satellite data was simulated, not live.")
                    continue

                feature_row = {name: sat_result.get(f"average_{name}", sat_result.get(name, 0.0))
                                for name in estimator.feature_names}
                ndvi = sat_result.get("average_ndvi", 0.6)
                b4_red = max(0.01, 0.10 - (ndvi * 0.09))
                b8_nir = max(0.12, b4_red + ndvi * 0.65)
                feature_row.update({
                    "B4_red": b4_red, "B8_nir": b8_nir,
                    "B2_blue": max(0.01, b4_red * 0.75), "B3_green": max(0.02, b4_red * 1.3),
                    "B5_re1": b4_red + (b8_nir - b4_red) * 0.22,
                    "B6_re2": b4_red + (b8_nir - b4_red) * 0.68,
                    "B11_swir1": max(0.03, 0.26 - ndvi * 0.19),
                    "B12_swir2": max(0.03, 0.26 - ndvi * 0.19) * 0.55,
                    "S1_vv": sat_result.get("average_vv"), "S1_vh": sat_result.get("average_vh"),
                    "S1_ratio": sat_result.get("average_ratio"),
                    "tree_height": sat_result.get("average_tree_height"),
                    "ndvi": ndvi, "evi": sat_result.get("average_evi"),
                    "ndwi": sat_result.get("average_ndwi"), "savi": sat_result.get("average_savi"),
                    "ndbi": sat_result.get("average_ndbi"),
                })
                rows.append({
                    **{k: feature_row[k] for k in estimator.feature_names},
                    "biomass": plot.measured_biomass_mg_ha,
                    "carbon": plot.measured_carbon_tc_ha,
                })
                used_plots.append(plot)
            except Exception as e:
                print(f"[Calibration] Failed to extract features for plot {plot.id}: {e}")

        # Process drone surveys
        for survey in drone_surveys:
            try:
                sat_result, coords = _extract_features_for_drone_survey(satellite_engine, survey)
                if not sat_result or sat_result.get("data_source") == "simulated":
                    print(f"[Calibration] Skipping drone survey {survey.id}: satellite data unavailable or simulated.")
                    continue

                feature_row = {name: sat_result.get(f"average_{name}", sat_result.get(name, 0.0))
                                for name in estimator.feature_names}
                ndvi = sat_result.get("average_ndvi", 0.6)
                b4_red = max(0.01, 0.10 - (ndvi * 0.09))
                b8_nir = max(0.12, b4_red + ndvi * 0.65)
                feature_row.update({
                    "B4_red": b4_red, "B8_nir": b8_nir,
                    "B2_blue": max(0.01, b4_red * 0.75), "B3_green": max(0.02, b4_red * 1.3),
                    "B5_re1": b4_red + (b8_nir - b4_red) * 0.22,
                    "B6_re2": b4_red + (b8_nir - b4_red) * 0.68,
                    "B11_swir1": max(0.03, 0.26 - ndvi * 0.19),
                    "B12_swir2": max(0.03, 0.26 - ndvi * 0.19) * 0.55,
                    "S1_vv": sat_result.get("average_vv"), "S1_vh": sat_result.get("average_vh"),
                    "S1_ratio": sat_result.get("average_ratio"),
                    "tree_height": sat_result.get("average_tree_height"),
                    "ndvi": ndvi, "evi": sat_result.get("average_evi"),
                    "ndwi": sat_result.get("average_ndwi"), "savi": sat_result.get("average_savi"),
                    "ndbi": sat_result.get("average_ndbi"),
                })
                rows.append({
                    **{k: feature_row[k] for k in estimator.feature_names},
                    "biomass": survey.measured_biomass_mg_ha,
                    "carbon": survey.measured_carbon_tc_ha,
                })
                used_surveys.append(survey)
            except Exception as e:
                print(f"[Calibration] Failed to extract features for drone survey {survey.id}: {e}")

        if len(rows) < min_samples:
            result = {"promoted": False,
                       "reason": f"only {len(rows)} plots/surveys had usable live satellite data, need >= {min_samples}."}
            print(f"[Calibration] Skipping: {result['reason']}")
            return result

        df = pd.DataFrame(rows)
        X_real = df[estimator.feature_names]
        y_real = df[["biomass", "carbon"]]

        # Retrain baseline Random Forest
        result = estimator.retrain_with_ground_truth(X_real, y_real, min_samples=min_samples)

        # If real ground-truth sample size clears the hard gate (>= 150), also retrain multi-modal fusion model
        fusion_result = None
        if len(rows) >= 150:
            print(f"[Calibration] Ground-truth sample count ({len(rows)}) clears gate >= 150. Retraining multi-modal fusion model...")
            fusion_result = estimator.retrain_fusion_with_ground_truth(X_real, y_real)
            result["fusion_training"] = fusion_result

        if result.get("promoted"):
            for plot in used_plots:
                plot.used_in_training = True
            for s in used_surveys:
                s.used_in_training = True
            db.commit()
            print(f"[Calibration] Promoted new model version {result['new_version']} "
                  f"(MAE {result['validation']['mae_carbon_tc_ha']} tC/ha, "
                  f"R2 {result['validation']['r2_carbon']}). Ingested {len(used_plots)} plots, {len(used_surveys)} drone surveys.")
        else:
            print(f"[Calibration] Not promoted: {result.get('reason')}")

        return result

    finally:
        db.close()


# --- Celery beat wiring (adapt to wherever your Celery app is configured) ---
#
# from celery import shared_task
#
# @shared_task
# def recalibrate_carbon_model_task():
#     return run_recalibration()
#
# In your Celery beat schedule (e.g. backend/celery.py):
#
# app.conf.beat_schedule = {
#     "recalibrate-carbon-model-monthly": {
#         "task": "inference.carbon_monitoring.calibration.recalibrate_carbon_model_task",
#         "schedule": crontab(day_of_month=1, hour=3, minute=0),
#     },
# }
if __name__ == "__main__":
    print(run_recalibration())
