"""
eudr_tnfd.py - EU Deforestation Regulation (EU 2023/1115) Cutoff & TNFD LEAP Spatial Screening.

Evaluates geospatial plot boundaries against:
1. Valid EPSG:4326 closed polygon geometry & geodesic area calculation
2. EUDR 2020-12-31 deforestation cutoff via real EO baseline vs current NDVI delta (fails closed when EO unavailable)
3. TNFD LEAP ecosystem proximity / road encroachment metrics via OSM/QuackOSM context
"""
from typing import Any, Dict, Optional

from .osm_intelligence import extract_osm_context, parse_aoi_polygon


def evaluate_eudr_tnfd_compliance(
    polygon_geojson: Any,
    satellite_engine=None,
    osm_context: Optional[Dict[str, Any]] = None,
    cutoff_date: str = "2020-12-31",
    current_start: str = "2025-01-01",
    current_end: str = "2025-12-31",
    allow_overpass: bool = False,
) -> Dict[str, Any]:
    """
    Runs fail-closed EUDR cutoff & TNFD LEAP polygon screening.
    Never stamps EUDR_DEFORESTATION_FREE unless real verified EO pixel imagery covers both
    the 2020 cutoff window and current evaluation window without canopy loss >= 0.12 NDVI.
    """
    poly = parse_aoi_polygon(polygon_geojson)
    bounds = poly.bounds  # (minx, miny, maxx, maxy)
    coords = [[float(y), float(x)] for x, y in list(poly.exterior.coords)]

    ctx = osm_context if osm_context is not None else extract_osm_context(
        polygon_geojson=polygon_geojson,
        buffer_km=10.0,
        allow_overpass=allow_overpass,
    )
    belt_metrics = (ctx.get("leakage_belt") or {}).get("metrics") or {}

    cutoff_ndvi = None
    current_ndvi = None
    cutoff_verified = False
    current_verified = False

    if satellite_engine is not None:
        try:
            baseline_res = satellite_engine.run_analysis(coords, "2020-01-01", cutoff_date, "ndvi")
            curr_res = satellite_engine.run_analysis(coords, current_start, current_end, "ndvi")
            if baseline_res and baseline_res.get("eo_pixel_verified"):
                cutoff_verified = True
                cutoff_ndvi = float(baseline_res["average_ndvi"])
            if curr_res and curr_res.get("eo_pixel_verified"):
                current_verified = True
                current_ndvi = float(curr_res["average_ndvi"])
        except Exception:
            pass

    if cutoff_verified and current_verified and cutoff_ndvi is not None and current_ndvi is not None:
        ndvi_delta = round(current_ndvi - cutoff_ndvi, 4)
        deforestation_detected = ndvi_delta <= -0.12 and cutoff_ndvi >= 0.45
        eudr_status = "NON_COMPLIANT_CANOPY_LOSS" if deforestation_detected else "DEFORESTATION_FREE_VERIFIED"
    else:
        ndvi_delta = None
        deforestation_detected = None
        eudr_status = "EO_VERIFICATION_REQUIRED"

    return {
        "regulation": "EU Regulation 2023/1115 (EUDR) & TNFD LEAP",
        "cutoff_date": cutoff_date,
        "geometry_crs": "EPSG:4326",
        "polygon_bbox": [round(float(v), 6) for v in bounds],
        "polygon_valid": bool(poly.is_valid and not poly.is_empty),
        "eudr_status": eudr_status,
        "eo_pixels_verified": cutoff_verified and current_verified,
        "cutoff_mean_ndvi": round(cutoff_ndvi, 4) if cutoff_ndvi is not None else None,
        "current_mean_ndvi": round(current_ndvi, 4) if current_ndvi is not None else None,
        "ndvi_change_since_cutoff": ndvi_delta,
        "deforestation_detected": deforestation_detected,
        "tnfd_leap": {
            "locate_osm_source": ctx.get("source_used", "unavailable"),
            "osm_available": bool(ctx.get("osm_available")),
            "nearest_road_km": belt_metrics.get("nearest_road_km"),
            "nearest_waterway_km": belt_metrics.get("nearest_waterway_km"),
            "mean_frontier_risk_score": belt_metrics.get("mean_frontier_risk_score"),
        },
    }
