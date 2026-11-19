import json
import math
from typing import Any, Dict, Optional
import numpy as np
import scipy.optimize as opt
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import transform
import datetime

from .osm_intelligence import (
    compute_leakage_belt_geometry,
    extract_osm_context,
    parse_aoi_polygon,
    resolve_local_geoparquet_path,
    resolve_local_pbf_path,
)

class SyntheticControlEngine:
    """
    Abadie et al. Synthetic Control Estimator for Activity-Matched Dynamic Baselines (Verra VM0047).
    Constructs a counterfactual baseline from a convex combination of un-intervened donor plots
    within the same ecological stratum.
    """

    def __init__(self, stratum: str = "SUNDARBANS_MANGROVE"):
        self.stratum = stratum

    def generate_candidate_donors(
        self,
        polygon_geojson: str,
        n_donors: int = 10,
        years_pre: int = 5,
        years_post: int = 3,
        seed: int = 42
    ) -> dict:
        """
        Synthesizes candidate un-intervened donor control plots located in the same ecological
        stratum outside the project intervention zone and outer leakage belt.
        Returns historical pre-intervention and post-intervention carbon trajectories.
        """
        np.random.seed(seed)
        
        # Base carbon stock by stratum
        stratum_bases = {
            "SUNDARBANS_MANGROVE": 120.0,
            "TROPICAL_MOIST_FOREST": 85.0,
            "COASTAL_AGROFORESTRY": 55.0
        }
        base_c = stratum_bases.get(self.stratum, 100.0)
        
        # Pre-intervention timeline (e.g., 2018-2022) and post-intervention (2023-2025)
        total_years = years_pre + years_post
        timeline = [2018 + i for i in range(total_years)]
        pre_years = timeline[:years_pre]
        post_years = timeline[years_pre:]

        # Project pre-intervention trajectory has moderate deforestation pressure (-1.5% to -2.0% per year)
        proj_pre = []
        val = base_c
        for yr in pre_years:
            val += np.random.normal(-1.8, 0.4)
            proj_pre.append(round(float(val), 2))

        # Project post-intervention with active conservation/ARR shows recovery (+3.5% to +5.0% per year)
        proj_post = []
        for yr in post_years:
            val += np.random.normal(4.2, 0.5)
            proj_post.append(round(float(val), 2))

        # Generate spatially distributed external annular donor plot coordinates (12-30 km outside AOI)
        try:
            proj_poly = parse_aoi_polygon(polygon_geojson)
            c_lng, c_lat = float(proj_poly.centroid.x), float(proj_poly.centroid.y)
        except Exception:
            c_lat, c_lng = 22.15, 89.50

        # Donor plots across the regional stratum (each has its own natural fluctuation / regional trend)
        donors = {}
        donor_matrix_pre = []
        donor_matrix_post = []
        donor_features = []

        for j in range(n_donors):
            donor_id = f"DONOR_PLOT_{self.stratum[:4]}_{j+1:02d}"
            angle = (2.0 * math.pi * j) / max(1, n_donors)
            dist_km = 14.0 + (j % 3) * 6.5
            d_lat = round(c_lat + (dist_km * math.sin(angle)) / 111.132, 5)
            d_lng = round(c_lng + (dist_km * math.cos(angle)) / (111.320 * max(0.2, math.cos(math.radians(c_lat)))), 5)

            # Donors have varying baselines and continue on business-as-usual regional trajectory
            offset = np.random.uniform(-15.0, 15.0)
            d_val = base_c + offset
            d_pre = []
            for yr in pre_years:
                d_val += np.random.normal(-1.5 + np.random.uniform(-0.5, 0.5), 0.6)
                d_pre.append(round(float(d_val), 2))
            
            d_post = []
            for yr in post_years:
                # Without intervention, donors continue experiencing regional deforestation/degradation pressure
                d_val += np.random.normal(-1.2 + np.random.uniform(-0.4, 0.4), 0.7)
                d_post.append(round(float(d_val), 2))

            donors[donor_id] = {
                "id": donor_id,
                "lat": d_lat,
                "lng": d_lng,
                "distance_km": round(dist_km, 1),
                "pre": d_pre,
                "post": d_post,
                "full": d_pre + d_post
            }
            donor_features.append({
                "type": "Feature",
                "id": donor_id,
                "properties": {
                    "donor_id": donor_id,
                    "stratum": self.stratum,
                    "distance_km": round(dist_km, 1),
                    "latest_carbon_tc_ha": d_post[-1] if d_post else d_pre[-1],
                    "data_origin": "simulated_stratum_control",
                },
                "geometry": {"type": "Point", "coordinates": [d_lng, d_lat]},
            })
            donor_matrix_pre.append(d_pre)
            donor_matrix_post.append(d_post)

        # Convert to numpy arrays: shape (T_pre, J) and (T_post, J)
        donor_matrix_pre = np.array(donor_matrix_pre).T
        donor_matrix_post = np.array(donor_matrix_post).T

        return {
            "timeline": timeline,
            "pre_years": pre_years,
            "post_years": post_years,
            "project_pre": np.array(proj_pre),
            "project_post": np.array(proj_post),
            "donors": donors,
            "donor_plots_geojson": {"type": "FeatureCollection", "features": donor_features},
            "donor_matrix_pre": donor_matrix_pre,
            "donor_matrix_post": donor_matrix_post,
            "baseline_data_origin": "simulated_donor_trajectories",
            "vvb_baseline_eligible": False,
        }

    def fetch_eo_donor_trajectories(
        self,
        polygon_geojson: str,
        satellite_engine=None,
        n_donors: int = 10,
        years_pre: int = 5,
        years_post: int = 3,
        seed: int = 42,
        allow_simulated_fallback: bool = True,
    ) -> dict:
        """
        Attempts genuine off-site EO annular donor sampling (12–30 km outside AOI, outside
        10 km leakage belt) using SatelliteEngine when real EO pixels are available.
        Computes pre-treatment covariate balance (Standardized Mean Difference).
        Falls back to simulated donors ONLY when `allow_simulated_fallback=True`,
        flagging `baseline_data_origin='simulated_donor_trajectories'` and `vvb_baseline_eligible=False`.
        """
        if satellite_engine is not None:
            try:
                proj_poly = parse_aoi_polygon(polygon_geojson)
                c_lng, c_lat = float(proj_poly.centroid.x), float(proj_poly.centroid.y)
                allom = {"SUNDARBANS_MANGROVE": 165.0, "TROPICAL_MOIST_FOREST": 118.0, "COASTAL_AGROFORESTRY": 78.0}.get(self.stratum, 120.0)
                pre_years = [2019 + i for i in range(years_pre)]
                post_years = [2019 + years_pre + i for i in range(years_post)]
                timeline = pre_years + post_years

                def _sample_point_series(p_lat: float, p_lng: float):
                    buf = 0.002
                    sq = [
                        [p_lat - buf, p_lng - buf], [p_lat - buf, p_lng + buf],
                        [p_lat + buf, p_lng + buf], [p_lat + buf, p_lng - buf],
                        [p_lat - buf, p_lng - buf],
                    ]
                    series = []
                    for yr in timeline:
                        res = satellite_engine.run_analysis(sq, f"{yr}-01-01", f"{yr}-12-31", "ndvi")
                        if not res or not res.get("eo_pixel_verified"):
                            return None
                        series.append(round(max(1.0, float(res["average_ndvi"]) * allom), 2))
                    return series

                proj_series = _sample_point_series(c_lat, c_lng)
                if proj_series is not None:
                    donors = {}
                    donor_matrix_pre = []
                    donor_matrix_post = []
                    donor_features = []
                    for j in range(n_donors):
                        angle = (2.0 * math.pi * j) / max(1, n_donors)
                        dist_km = 14.0 + (j % 3) * 6.5
                        d_lat = round(c_lat + (dist_km * math.sin(angle)) / 111.132, 5)
                        d_lng = round(c_lng + (dist_km * math.cos(angle)) / (111.320 * max(0.2, math.cos(math.radians(c_lat)))), 5)
                        d_series = _sample_point_series(d_lat, d_lng)
                        if d_series is None:
                            continue
                        did = f"EO_DONOR_{self.stratum[:4]}_{j+1:02d}"
                        d_pre, d_post = d_series[:years_pre], d_series[years_pre:]
                        donors[did] = {"id": did, "lat": d_lat, "lng": d_lng, "distance_km": round(dist_km, 1), "pre": d_pre, "post": d_post, "full": d_series}
                        donor_features.append({
                            "type": "Feature", "id": did,
                            "properties": {"donor_id": did, "stratum": self.stratum, "distance_km": round(dist_km, 1), "latest_carbon_tc_ha": d_post[-1], "data_origin": "real_eo_annular_control"},
                            "geometry": {"type": "Point", "coordinates": [d_lng, d_lat]},
                        })
                        donor_matrix_pre.append(d_pre)
                        donor_matrix_post.append(d_post)

                    if len(donors) >= 3:
                        p_pre_arr = np.array(proj_series[:years_pre], dtype=float)
                        d_pre_mat = np.array(donor_matrix_pre, dtype=float).T
                        smd = float(abs(np.mean(p_pre_arr) - np.mean(d_pre_mat)) / max(float(np.std(d_pre_mat)), 1e-6))
                        return {
                            "timeline": timeline,
                            "pre_years": pre_years,
                            "post_years": post_years,
                            "project_pre": p_pre_arr,
                            "project_post": np.array(proj_series[years_pre:], dtype=float),
                            "donors": donors,
                            "donor_plots_geojson": {"type": "FeatureCollection", "features": donor_features},
                            "donor_matrix_pre": d_pre_mat,
                            "donor_matrix_post": np.array(donor_matrix_post, dtype=float).T,
                            "covariate_balance_smd": round(smd, 4),
                            "baseline_data_origin": "real_eo_annular_control",
                            "vvb_baseline_eligible": True,
                        }
            except Exception as err:
                print(f"[Baseline] Real EO donor sampling failed: {err}")

        if not allow_simulated_fallback:
            raise RuntimeError("Real EO donor pixel trajectories unavailable and allow_simulated_fallback=False.")

        out = self.generate_candidate_donors(
            polygon_geojson=polygon_geojson,
            n_donors=n_donors,
            years_pre=years_pre,
            years_post=years_post,
            seed=seed,
        )
        p_pre_arr = np.array(out["project_pre"], dtype=float)
        d_pre_mat = np.array(out["donor_matrix_pre"], dtype=float)
        out["covariate_balance_smd"] = round(float(abs(np.mean(p_pre_arr) - np.mean(d_pre_mat)) / max(float(np.std(d_pre_mat)), 1e-6)), 4)
        return out

    def compute_in_space_placebo(
        self,
        project_pre: np.ndarray,
        project_post: np.ndarray,
        donor_pre: np.ndarray,
        donor_post: np.ndarray,
        weights: np.ndarray,
    ) -> dict:
        """Abadie et al. leave-one-out in-space placebo permutation ratio test."""
        syn_pre = donor_pre.dot(weights)
        syn_post = donor_post.dot(weights)
        proj_pre_rmse = float(np.sqrt(np.mean((project_pre - syn_pre) ** 2)))
        proj_post_rmse = float(np.sqrt(np.mean((project_post - syn_post) ** 2)))
        treated_ratio = proj_post_rmse / max(0.05, proj_pre_rmse)

        placebo_ratios = []
        n_j = donor_pre.shape[1]
        for j in range(n_j):
            others_idx = [k for k in range(n_j) if k != j]
            if not others_idx:
                continue
            w_j, pre_r_j = self.fit_synthetic_weights(donor_pre[:, j], donor_pre[:, others_idx])
            post_pred_j = donor_post[:, others_idx].dot(w_j)
            post_r_j = float(np.sqrt(np.mean((donor_post[:, j] - post_pred_j) ** 2)))
            placebo_ratios.append(post_r_j / max(0.05, pre_r_j))

        n_ge = sum(1 for r in placebo_ratios if r >= treated_ratio)
        p_val = round(float((n_ge + 1) / (len(placebo_ratios) + 1)), 4) if placebo_ratios else 1.0
        return {
            "treated_post_pre_rmspe_ratio": round(treated_ratio, 2),
            "placebo_p_value": p_val,
            "n_placebos": len(placebo_ratios),
            "statistically_distinct": p_val <= 0.15,
        }

    def fit_synthetic_weights(
        self,
        project_pre: np.ndarray,
        donor_pre: np.ndarray
    ) -> tuple[np.ndarray, float]:
        """
        Solves constrained quadratic optimization to find optimal convex combination of donors:
            min_w || Y_proj - Y_donors * w ||^2
            subject to w_j >= 0, sum(w_j) = 1.0
        Returns (weights, pre_rmse).
        """
        n_donors = donor_pre.shape[1]
        
        # Objective function: mean squared prediction error
        def objective(w):
            diff = project_pre - donor_pre.dot(w)
            return np.mean(diff ** 2)

        # Equal initial weights
        w0 = np.ones(n_donors) / n_donors
        bounds = [(0.0, 1.0) for _ in range(n_donors)]
        constraints = {"type": "eq", "fun": lambda w: np.sum(w) - 1.0}

        res = opt.minimize(
            objective,
            w0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 1000, "ftol": 1e-8}
        )

        weights = np.clip(res.x, 0.0, 1.0)
        weights = weights / np.sum(weights)  # re-normalize to exact 1.0
        
        # Pre-treatment Root Mean Squared Error (RMSE)
        diff_final = project_pre - donor_pre.dot(weights)
        pre_rmse = float(np.sqrt(np.mean(diff_final ** 2)))

        return weights, round(pre_rmse, 4)

    def compute_counterfactual(
        self,
        donor_post: np.ndarray,
        weights: np.ndarray
    ) -> np.ndarray:
        """
        Projects synthetic counterfactual baseline into the post-intervention period:
            Y_synthetic(t) = Y_donors(t) * w
        """
        counterfactual = donor_post.dot(weights)
        return np.round(counterfactual, 2)


class LeakageMonitoringEngine:
    """
    10 km Leakage Belt Monitoring (Verra VM0047 Section 8.3).
    Tracks displacement of deforestation into a 10km buffer surrounding the project boundary.
    """

    @staticmethod
    def calculate_leakage_belt_geometry(polygon_geojson: str, buffer_km: float = 10.0) -> dict:
        """
        Computes the 10 km outer leakage belt geometry, GeoJSON ring, and estimated area (ha).
        """
        belt = compute_leakage_belt_geometry(polygon_geojson, buffer_km=buffer_km)
        return {
            "leakage_belt_area_ha": belt["leakage_belt_area_ha"],
            "buffer_km": belt["buffer_km"],
            "leakage_belt_geojson": belt["leakage_belt_geojson"],
        }

    @staticmethod
    def assess_osm_leakage(
        polygon_geojson: Any,
        gross_additionality_tco2e: float,
        osm_context: Optional[Dict[str, Any]] = None,
        regional_control_loss_rate: float = 0.018,
        fallback_loss_rate: float = 0.015,
        allow_overpass: bool = False,
        buffer_km: float = 10.0,
    ) -> dict:
        """
        Evaluates VM0047 leakage displacement using real OSM belt feature densities
        (QuackOSM local PBF or Overpass fallback) and falls back honestly when unavailable.
        """
        ctx = osm_context
        if ctx is None:
            ctx = extract_osm_context(
                polygon_geojson=polygon_geojson,
                buffer_km=buffer_km,
                allow_overpass=allow_overpass,
            )

        belt_metrics = (ctx.get("leakage_belt") or {}).get("metrics") or {}
        osm_available = bool(ctx.get("osm_available"))
        derived_rate = belt_metrics.get("derived_leakage_loss_rate")

        if osm_available and isinstance(derived_rate, (int, float)):
            effective_loss_rate = float(derived_rate)
            leakage_source = "osm_vector_analysis"
        else:
            effective_loss_rate = float(fallback_loss_rate)
            leakage_source = "fallback_default_no_osm"

        assessed = LeakageMonitoringEngine.assess_leakage(
            leakage_belt_loss_rate=effective_loss_rate,
            regional_control_loss_rate=regional_control_loss_rate,
            gross_additionality_tco2e=gross_additionality_tco2e,
        )
        assessed["leakage_source"] = leakage_source
        assessed["source_used"] = ctx.get("source_used", "unavailable")
        assessed["osm_available"] = osm_available
        assessed["osm_leakage_metrics"] = belt_metrics
        return assessed

    @staticmethod
    def assess_leakage(
        leakage_belt_loss_rate: float,
        regional_control_loss_rate: float,
        gross_additionality_tco2e: float
    ) -> dict:
        """
        Verra VM0047 Leakage Deduction Formula:
        If deforestation in 10km leakage belt exceeds the regional un-intervened control loss rate,
        the excess loss is deducted from gross carbon additions.
        """
        excess_loss = max(0.0, leakage_belt_loss_rate - regional_control_loss_rate)
        
        # Excess loss factor applied to gross credits
        deduction_ratio = min(0.35, excess_loss * 1.25)
        leakage_deduction_tco2e = round(gross_additionality_tco2e * deduction_ratio, 2)
        
        if excess_loss <= 0.01:
            risk_rating = "LOW"
        elif excess_loss <= 0.03:
            risk_rating = "MODERATE"
        else:
            risk_rating = "ELEVATED"

        return {
            "leakage_belt_loss_rate": round(leakage_belt_loss_rate, 4),
            "regional_control_loss_rate": round(regional_control_loss_rate, 4),
            "excess_loss_rate": round(excess_loss, 4),
            "leakage_deduction_tco2e": leakage_deduction_tco2e,
            "leakage_risk_rating": risk_rating
        }


class RiskBufferCalculator:
    """
    Verra AFOLU Non-Permanence Risk Tool (AFOLU Non-Permanence Risk Assessment v4.0).
    Computes risk rating and buffer pool allocation withheld into the pooled buffer account.
    """

    @staticmethod
    def calculate_risk_buffer(
        stratum: str = "SUNDARBANS_MANGROVE",
        custom_risk_scores: dict = None
    ) -> dict:
        """
        Evaluates Natural Risks (fire, pest, cyclone surge) and Internal Project Risks.
        Standard default for coastal Sundarbans mangrove projects is 15-20% buffer pool withholding.
        """
        defaults = {
            "SUNDARBANS_MANGROVE": {
                "fire_risk": 0.01,
                "cyclone_storm_surge_risk": 0.09,  # High cyclonic exposure (Bay of Bengal)
                "sea_level_salinization_risk": 0.04,
                "project_longevity_risk": 0.02,
                "tenure_governance_risk": 0.02,
                "total_buffer_pct": 0.18           # 18% buffer pool allocation
            },
            "TROPICAL_MOIST_FOREST": {
                "fire_risk": 0.04,
                "cyclone_storm_surge_risk": 0.02,
                "sea_level_salinization_risk": 0.00,
                "project_longevity_risk": 0.03,
                "tenure_governance_risk": 0.04,
                "total_buffer_pct": 0.13           # 13% buffer pool allocation
            },
            "COASTAL_AGROFORESTRY": {
                "fire_risk": 0.02,
                "cyclone_storm_surge_risk": 0.04,
                "sea_level_salinization_risk": 0.02,
                "project_longevity_risk": 0.02,
                "tenure_governance_risk": 0.02,
                "total_buffer_pct": 0.12           # 12% buffer pool allocation
            }
        }

        profile = defaults.get(stratum, defaults["SUNDARBANS_MANGROVE"])
        if custom_risk_scores:
            profile.update(custom_risk_scores)
            profile["total_buffer_pct"] = min(0.35, max(0.08, sum(
                v for k, v in profile.items() if k != "total_buffer_pct"
            )))

        return profile


def run_dynamic_baseline_assessment(
    job_id: str,
    polygon_geojson: str,
    forest_area_ha: float,
    project_carbon_tc_ha: float,
    stratum: str = "SUNDARBANS_MANGROVE",
    leakage_belt_loss_rate: Optional[float] = None,
    regional_control_loss_rate: float = 0.018,
    osm_context: Optional[Dict[str, Any]] = None,
    allow_live_overpass: bool = False,
    satellite_engine=None,
    allow_simulated_fallback: bool = True,
    custom_risk_scores: Optional[Dict[str, float]] = None,
) -> dict:
    """
    Executes end-to-end Verra VM0047 dynamic baseline workflow:
    1. Matches candidate annular donor plots (real EO pixels when available; simulated fallback labeled explicitly).
    2. Projects counterfactual baseline carbon trajectory.
    3. Computes 10km leakage belt buffer and leakage deductions.
    4. Calculates Verra AFOLU non-permanence risk buffer withholding.
    5. Computes Net Creditable tCO2e.
    """
    # 1. Synthetic Control Matching (prefer real EO donor trajectories when satellite_engine yields real rasters)
    sc_engine = SyntheticControlEngine(stratum=stratum)
    donors_data = sc_engine.fetch_eo_donor_trajectories(
        polygon_geojson=polygon_geojson,
        satellite_engine=satellite_engine,
        n_donors=10,
        years_pre=5,
        years_post=3,
        seed=42,
        allow_simulated_fallback=allow_simulated_fallback,
    )
    
    weights, pre_rmse = sc_engine.fit_synthetic_weights(
        project_pre=donors_data["project_pre"],
        donor_pre=donors_data["donor_matrix_pre"]
    )
    
    counterfactual_post = sc_engine.compute_counterfactual(
        donor_post=donors_data["donor_matrix_post"],
        weights=weights
    )

    # Donor weights dictionary & attach weights onto donor map pins
    donor_keys = list(donors_data["donors"].keys())
    donor_weights_map = {donor_keys[i]: round(float(weights[i]), 4) for i in range(len(weights))}
    donor_geo = donors_data.get("donor_plots_geojson") or {"type": "FeatureCollection", "features": []}
    for feat in donor_geo.get("features", []):
        did = feat.get("properties", {}).get("donor_id")
        if did in donor_weights_map:
            feat["properties"]["weight_pct"] = round(donor_weights_map[did] * 100.0, 1)

    placebo_test = sc_engine.compute_in_space_placebo(
        project_pre=donors_data["project_pre"],
        project_post=donors_data["project_post"],
        donor_pre=donors_data["donor_matrix_pre"],
        donor_post=donors_data["donor_matrix_post"],
        weights=weights,
    )

    # Counterfactual carbon stock at most recent evaluation
    counterfactual_c_final = float(counterfactual_post[-1])
    
    # Net Carbon additionality per ha
    c_gain_per_ha = max(0.0, project_carbon_tc_ha - counterfactual_c_final)
    gross_additionality_tco2e = round(c_gain_per_ha * forest_area_ha * 3.667, 2)

    # 2. Leakage Belt Buffer Analysis
    leakage_belt = LeakageMonitoringEngine.calculate_leakage_belt_geometry(
        polygon_geojson=polygon_geojson,
        buffer_km=10.0
    )
    if leakage_belt_loss_rate is not None:
        leakage_assessment = LeakageMonitoringEngine.assess_leakage(
            leakage_belt_loss_rate=leakage_belt_loss_rate,
            regional_control_loss_rate=regional_control_loss_rate,
            gross_additionality_tco2e=gross_additionality_tco2e,
        )
        leakage_assessment["leakage_source"] = "explicit_override"
        leakage_assessment["source_used"] = "explicit_parameter"
        leakage_assessment["osm_available"] = False
        leakage_assessment["osm_leakage_metrics"] = {}
    elif osm_context is not None or resolve_local_geoparquet_path() is not None or resolve_local_pbf_path() is not None or allow_live_overpass:
        leakage_assessment = LeakageMonitoringEngine.assess_osm_leakage(
            polygon_geojson=polygon_geojson,
            gross_additionality_tco2e=gross_additionality_tco2e,
            osm_context=osm_context,
            regional_control_loss_rate=regional_control_loss_rate,
            fallback_loss_rate=0.015,
            allow_overpass=allow_live_overpass,
            buffer_km=10.0,
        )
    else:
        leakage_assessment = LeakageMonitoringEngine.assess_leakage(
            leakage_belt_loss_rate=0.015,
            regional_control_loss_rate=regional_control_loss_rate,
            gross_additionality_tco2e=gross_additionality_tco2e,
        )
        leakage_assessment["leakage_source"] = "fallback_default_no_osm"
        leakage_assessment["source_used"] = "unavailable"
        leakage_assessment["osm_available"] = False
        leakage_assessment["osm_leakage_metrics"] = {}

    leakage_deduction_tco2e = leakage_assessment["leakage_deduction_tco2e"]

    # 3. Non-Permanence Risk Buffer Pool Allocation
    risk_profile = RiskBufferCalculator.calculate_risk_buffer(
        stratum=stratum,
        custom_risk_scores=custom_risk_scores,
    )
    buffer_pct = risk_profile["total_buffer_pct"]
    
    net_pre_buffer = max(0.0, gross_additionality_tco2e - leakage_deduction_tco2e)
    buffer_withheld_tco2e = round(net_pre_buffer * buffer_pct, 2)
    net_creditable_tco2e = round(net_pre_buffer - buffer_withheld_tco2e, 2)

    # Historical timeline comparison
    pre_counterfactual = donors_data["donor_matrix_pre"].dot(weights)
    full_synthetic = list(np.round(pre_counterfactual, 2)) + list(counterfactual_post)
    full_project = list(donors_data["project_pre"]) + list(donors_data["project_post"])

    trajectory_report = {
        "years": donors_data["timeline"],
        "pre_years_count": len(donors_data["pre_years"]),
        "post_years_count": len(donors_data["post_years"]),
        "project_carbon_tc_ha": full_project,
        "synthetic_baseline_carbon_tc_ha": full_synthetic
    }

    return {
        "job_id": job_id,
        "baseline_method": "synthetic_control_abadie",
        "forest_stratum": stratum,
        "pre_treatment_rmse": pre_rmse,
        "donor_weights": donor_weights_map,
        "active_donor_count": int(np.sum(weights > 0.01)),
        "trajectory": trajectory_report,
        "project_carbon_tc_ha": round(project_carbon_tc_ha, 2),
        "counterfactual_carbon_tc_ha": round(counterfactual_c_final, 2),
        "carbon_additionality_per_ha": round(c_gain_per_ha, 2),
        "forest_area_ha": round(forest_area_ha, 2),
        "gross_additionality_tco2e": gross_additionality_tco2e,
        "leakage_belt_area_ha": leakage_belt["leakage_belt_area_ha"],
        "leakage_belt_geojson": leakage_belt["leakage_belt_geojson"],
        "leakage_deduction_tco2e": leakage_deduction_tco2e,
        "leakage_risk_rating": leakage_assessment["leakage_risk_rating"],
        "leakage_source": leakage_assessment["leakage_source"],
        "osm_leakage_metrics": leakage_assessment["osm_leakage_metrics"],
        "buffer_deduction_pct": buffer_pct,
        "buffer_withheld_tco2e": buffer_withheld_tco2e,
        "net_creditable_tco2e": net_creditable_tco2e,
        "risk_breakdown": risk_profile,
        "donor_plots_geojson": donor_geo,
        "placebo_test": placebo_test,
        "covariate_balance_smd": donors_data.get("covariate_balance_smd"),
        "baseline_data_origin": donors_data.get("baseline_data_origin", "simulated_donor_trajectories"),
        "vvb_baseline_eligible": bool(donors_data.get("vvb_baseline_eligible", False)),
    }
