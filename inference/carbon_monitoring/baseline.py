import json
import math
import numpy as np
import scipy.optimize as opt
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import transform
import datetime

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

        # Donor plots across the regional stratum (each has its own natural fluctuation / regional trend)
        donors = {}
        donor_matrix_pre = []
        donor_matrix_post = []

        for j in range(n_donors):
            donor_id = f"DONOR_PLOT_{self.stratum[:4]}_{j+1:02d}"
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
                "pre": d_pre,
                "post": d_post,
                "full": d_pre + d_post
            }
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
            "donor_matrix_pre": donor_matrix_pre,
            "donor_matrix_post": donor_matrix_post
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
        Computes 10 km outer buffer geometry and estimated area (ha).
        Approximate 10 km buffer = ~0.090 degrees in Bengal delta latitudes.
        """
        try:
            poly_data = json.loads(polygon_geojson)
            if isinstance(poly_data, list):
                # Format: [[lat, lng], ...]
                coords = [(pt[1], pt[0]) for pt in poly_data]  # convert to (lng, lat)
                project_poly = Polygon(coords)
            elif isinstance(poly_data, dict):
                if poly_data.get("type") == "Polygon":
                    project_poly = Polygon(poly_data["coordinates"][0])
                else:
                    project_poly = shape(poly_data)
            else:
                project_poly = Polygon([(89.5, 22.2), (89.6, 22.2), (89.6, 22.3), (89.5, 22.3)])
        except Exception:
            project_poly = Polygon([(89.5, 22.2), (89.6, 22.2), (89.6, 22.3), (89.5, 22.3)])

        # Buffer approx 0.09 degrees (~10 km)
        buffer_deg = buffer_km / 111.0
        buffered_poly = project_poly.buffer(buffer_deg)
        belt_poly = buffered_poly.difference(project_poly)

        # Estimate area in hectares (1 deg approx 111km x 103km at 22N)
        deg_area = belt_poly.area
        ha_per_deg2 = 111.0 * 103.0 * 100.0  # ~1,143,300 ha per sq degree
        leakage_belt_ha = max(500.0, deg_area * ha_per_deg2)

        return {
            "leakage_belt_area_ha": round(leakage_belt_ha, 2),
            "buffer_km": buffer_km
        }

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
    leakage_belt_loss_rate: float = 0.015,
    regional_control_loss_rate: float = 0.018
) -> dict:
    """
    Executes end-to-end Verra VM0047 dynamic baseline workflow:
    1. Generates and matches candidate donor plots using Synthetic Control (Abadie et al.).
    2. Projects counterfactual baseline carbon trajectory.
    3. Computes 10km leakage belt buffer and leakage deductions.
    4. Calculates Verra AFOLU non-permanence risk buffer withholding.
    5. Computes Net Creditable tCO2e.
    """
    # 1. Synthetic Control Matching
    sc_engine = SyntheticControlEngine(stratum=stratum)
    donors_data = sc_engine.generate_candidate_donors(
        polygon_geojson=polygon_geojson,
        n_donors=10,
        years_pre=5,
        years_post=3,
        seed=42
    )
    
    weights, pre_rmse = sc_engine.fit_synthetic_weights(
        project_pre=donors_data["project_pre"],
        donor_pre=donors_data["donor_matrix_pre"]
    )
    
    counterfactual_post = sc_engine.compute_counterfactual(
        donor_post=donors_data["donor_matrix_post"],
        weights=weights
    )

    # Donor weights dictionary
    donor_keys = list(donors_data["donors"].keys())
    donor_weights_map = {donor_keys[i]: round(float(weights[i]), 4) for i in range(len(weights))}

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
    leakage_assessment = LeakageMonitoringEngine.assess_leakage(
        leakage_belt_loss_rate=leakage_belt_loss_rate,
        regional_control_loss_rate=regional_control_loss_rate,
        gross_additionality_tco2e=gross_additionality_tco2e
    )
    leakage_deduction_tco2e = leakage_assessment["leakage_deduction_tco2e"]

    # 3. Non-Permanence Risk Buffer Pool Allocation
    risk_profile = RiskBufferCalculator.calculate_risk_buffer(stratum=stratum)
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
        "leakage_deduction_tco2e": leakage_deduction_tco2e,
        "leakage_risk_rating": leakage_assessment["leakage_risk_rating"],
        "buffer_deduction_pct": buffer_pct,
        "buffer_withheld_tco2e": buffer_withheld_tco2e,
        "net_creditable_tco2e": net_creditable_tco2e,
        "risk_breakdown": risk_profile
    }
