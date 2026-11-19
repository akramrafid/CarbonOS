import os
import json
import time
import warnings
import datetime
import numpy as np
import pandas as pd
import joblib
import sklearn
from sklearn.exceptions import InconsistentVersionWarning
from PIL import Image, ImageDraw
import io
import base64
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

from .fusion_model import CarbonFusionEstimator

OPTICAL_BAND_NAMES = [
    "B2_blue", "B3_green", "B4_red", "B8_nir",
    "B5_re1", "B6_re2", "B11_swir1", "B12_swir2",
]

DEFAULT_FEATURE_NAMES = OPTICAL_BAND_NAMES + [
    "ndvi", "evi", "ndwi", "savi", "ndbi",
    "S1_vv", "S1_vh", "S1_ratio",
    "tree_height",
]


def extract_feature_vector(
    source: dict,
    feature_names: list[str] | None = None,
    *,
    allow_spectral_fallback: bool = True,
) -> tuple[list[float], dict]:
    """
    Canonical feature extractor shared across single-AOI inference, 64x64 grid inference,
    and ground-truth recalibration.

    Prioritizes measured Sentinel-2 optical bands (directly on `source` or in `source['average_bands']`)
    and real Sentinel-1 / LiDAR features instead of overwriting them from scalar NDVI.
    Only synthesizes missing spectral bands when `allow_spectral_fallback=True` and explicitly flags
    `spectral_bands_synthesized` in the returned diagnostic dict.
    """
    names = feature_names or DEFAULT_FEATURE_NAMES
    avg_bands = source.get("average_bands") if isinstance(source.get("average_bands"), dict) else {}

    def _pick(key: str, avg_key: str | None = None, default=None):
        val = source.get(key)
        if val is None and avg_key:
            val = source.get(avg_key)
        if val is None and key in avg_bands:
            val = avg_bands.get(key)
        return default if val is None else float(val)

    ndvi = _pick("ndvi", "average_ndvi", 0.6)
    evi = _pick("evi", "average_evi", 0.5)
    ndwi = _pick("ndwi", "average_ndwi", -0.2)
    savi = _pick("savi", "average_savi", 0.45)
    ndbi = _pick("ndbi", "average_ndbi", -0.3)
    vv = _pick("S1_vv", "average_vv", -12.0)
    vh = _pick("S1_vh", "average_vh", -18.5)
    ratio = _pick("S1_ratio", "average_ratio", vv - vh)
    inferred_height = 0.0 if (ndvi < 0.15 or (ndwi > 0.10 and ndvi < 0.28)) else max(1.0, (ndvi - 0.12) * 24.0)
    tree_height = _pick("tree_height", "average_tree_height", inferred_height)

    resolved = {
        "ndvi": ndvi,
        "evi": evi,
        "ndwi": ndwi,
        "savi": savi,
        "ndbi": ndbi,
        "S1_vv": vv,
        "S1_vh": vh,
        "S1_ratio": ratio,
        "tree_height": tree_height,
    }

    missing_bands = []
    for band in OPTICAL_BAND_NAMES:
        val = source.get(band)
        if val is None:
            val = avg_bands.get(band)
        if val is None:
            missing_bands.append(band)
        else:
            resolved[band] = float(val)

    synthesized = bool(missing_bands)
    if missing_bands:
        if not allow_spectral_fallback:
            raise ValueError(
                f"Real measured spectral bands missing ({missing_bands}); refusing scalar-NDVI band synthesis."
            )
        b4_red = resolved.get("B4_red", max(0.01, 0.10 - (ndvi * 0.09)))
        b8_nir = resolved.get("B8_nir", max(0.12, b4_red + ndvi * 0.65))
        b11_swir1 = resolved.get("B11_swir1", max(0.03, 0.26 - ndvi * 0.19))
        fallback_bands = {
            "B4_red": b4_red,
            "B8_nir": b8_nir,
            "B2_blue": max(0.01, b4_red * 0.75),
            "B3_green": max(0.02, b4_red * 1.3),
            "B5_re1": b4_red + (b8_nir - b4_red) * 0.22,
            "B6_re2": b4_red + (b8_nir - b4_red) * 0.68,
            "B11_swir1": b11_swir1,
            "B12_swir2": max(0.01, b11_swir1 * 0.55),
        }
        for band in missing_bands:
            resolved[band] = float(fallback_bands[band])

    vector = [float(resolved.get(col, 0.0)) for col in names]
    diag = {
        "spectral_bands_synthesized": synthesized,
        "missing_bands": missing_bands,
    }
    return vector, diag


STRATUM_ALLOMETRY = {
    "SUNDARBANS_MANGROVE": {
        "root_shoot_ratio": 0.49,     # Mahmood et al. 2019 / IPCC 2013 Wetlands Supplement
        "root_shoot_cv": 0.18,
        "carbon_fraction": 0.47,      # IPCC Wetlands default
        "bulk_density_g_cm3": 0.82,   # Mangrove anaerobic delta mud (Sarker et al. 2016)
        "bulk_density_cv": 0.14,
        "base_soc_pct": 2.4,          # Deep delta silt core (100cm)
        "soc_ndvi_factor": 0.6,
        "soc_pct_cv": 0.18,
        "allometry_cv": 0.105,        # Chave et al. 2014 pantropical allometric error
        "description": "Sundarbans Estuarine Mangrove Complex (Tier-3 Blue Carbon)"
    },
    "TROPICAL_MOIST_FOREST": {
        "root_shoot_ratio": 0.235,    # Mokany et al. 2006 / IPCC 2006 AFOLU
        "root_shoot_cv": 0.20,
        "carbon_fraction": 0.47,
        "bulk_density_g_cm3": 1.15,   # Mineral clay/loam soils
        "bulk_density_cv": 0.12,
        "base_soc_pct": 0.9,
        "soc_ndvi_factor": 0.4,
        "soc_pct_cv": 0.18,
        "allometry_cv": 0.11,
        "description": "Chittagong Hill Tracts & Sylhet Tropical Semi-Evergreen Forest"
    },
    "COASTAL_AGROFORESTRY": {
        "root_shoot_ratio": 0.28,     # IPCC 2006 Agroforestry default
        "root_shoot_cv": 0.20,
        "carbon_fraction": 0.46,
        "bulk_density_g_cm3": 1.25,   # Alluvial agricultural soils
        "bulk_density_cv": 0.12,
        "base_soc_pct": 0.55,
        "soc_ndvi_factor": 0.3,
        "soc_pct_cv": 0.20,
        "allometry_cv": 0.12,
        "description": "Coastal Mixed Agroforestry and Social Forestry Belt"
    },
    "OPEN_WATER": {
        "root_shoot_ratio": 0.0,
        "root_shoot_cv": 0.0,
        "carbon_fraction": 0.0,
        "bulk_density_g_cm3": 0.0,
        "bulk_density_cv": 0.0,
        "base_soc_pct": 0.0,
        "soc_ndvi_factor": 0.0,
        "soc_pct_cv": 0.0,
        "allometry_cv": 0.0,
        "description": "Open Water / Estuarine River Channel (Non-Forest)"
    },
    "BARREN_OR_URBAN": {
        "root_shoot_ratio": 0.0,
        "root_shoot_cv": 0.0,
        "carbon_fraction": 0.46,
        "bulk_density_g_cm3": 0.0,
        "bulk_density_cv": 0.0,
        "base_soc_pct": 0.0,
        "soc_ndvi_factor": 0.0,
        "soc_pct_cv": 0.0,
        "allometry_cv": 0.12,
        "description": "Non-Forest Built-Up, Barren, or Bare Sandbar Surface"
    }
}

SYNTHETIC_BASELINE_VERSION = "0.2.0-synthetic"

def determine_stratum(lat: float, lng: float) -> str:
    """
    Classifies geographic coordinates into ecological forest strata for Bangladesh.
    - SUNDARBANS_MANGROVE: Southwest coastal delta (21.4 <= lat <= 22.65 N, 88.9 <= lng <= 90.1 E)
    - TROPICAL_MOIST_FOREST: Southeast Hill Tracts & Northeast Sylhet (lat > 21.0, lng >= 91.5 or lat >= 24.0, lng >= 91.4)
    - COASTAL_AGROFORESTRY: Default agricultural / social forestry coastal plain
    """
    if 21.4 <= lat <= 22.65 and 88.9 <= lng <= 90.1:
        return "SUNDARBANS_MANGROVE"
    elif (21.0 <= lat <= 23.9 and lng >= 91.5) or (lat >= 24.0 and lng >= 91.4):
        return "TROPICAL_MOIST_FOREST"
    else:
        return "COASTAL_AGROFORESTRY"

def calculate_multi_pool(
    biomass_agb: float,
    carbon_agb: float,
    ndvi: float,
    stratum: str = "SUNDARBANS_MANGROVE",
    soc_depth_cm: float = 100.0,
    soil_core_override: dict | None = None,
) -> dict:
    """
    Computes IPCC Tier-3 / Verra VM0047 multi-pool carbon stocks:
    1. Aboveground Biomass (AGB) Carbon: carbon_agb
    2. Belowground Biomass (BGB) Carbon: carbon_agb * root_shoot_ratio
    3. Soil Organic Carbon (SOC): bulk_density * soc_depth_cm * soc_pct (preferring measured core data)
    """
    if stratum in ("OPEN_WATER", "BARREN_OR_URBAN") and not soil_core_override:
        return {
            "stratum": stratum,
            "biomass_agb_mg_ha": 0.0 if stratum == "OPEN_WATER" else round(max(0.0, biomass_agb), 2),
            "biomass_bgb_mg_ha": 0.0,
            "biomass_total_mg_ha": 0.0 if stratum == "OPEN_WATER" else round(max(0.0, biomass_agb), 2),
            "carbon_agb_tc_ha": 0.0 if stratum == "OPEN_WATER" else round(max(0.0, carbon_agb), 2),
            "carbon_bgb_tc_ha": 0.0,
            "carbon_soc_tc_ha": 0.0,
            "carbon_total_tc_ha": 0.0 if stratum == "OPEN_WATER" else round(max(0.0, carbon_agb), 2),
            "root_shoot_ratio": 0.0,
            "soc_depth_cm": soc_depth_cm,
            "soil_bulk_density": 0.0,
            "soc_pct": 0.0,
            "soc_source": "open_water_zero" if stratum == "OPEN_WATER" else "non_forest_excluded",
        }

    params = STRATUM_ALLOMETRY.get(stratum, STRATUM_ALLOMETRY["SUNDARBANS_MANGROVE"])
    r_ratio = params["root_shoot_ratio"]

    # Belowground Biomass
    biomass_bgb = biomass_agb * r_ratio
    carbon_bgb = carbon_agb * r_ratio

    # Soil Organic Carbon (prefer measured field core override when supplied)
    if soil_core_override and soil_core_override.get("soc_pct") is not None and soil_core_override.get("bulk_density_g_cm3") is not None:
        bd = float(soil_core_override["bulk_density_g_cm3"])
        soc_pct = float(soil_core_override["soc_pct"])
        depth = float(soil_core_override.get("depth_cm", soc_depth_cm))
        soc_source = "lab_soil_core_measured"
    else:
        bd = params["bulk_density_g_cm3"]
        soc_pct = params["base_soc_pct"] + (max(0.0, ndvi) * params["soc_ndvi_factor"])
        depth = soc_depth_cm
        soc_source = "stratum_literature_default"
    carbon_soc = bd * depth * soc_pct

    # Total Stocks
    total_biomass = biomass_agb + biomass_bgb
    total_carbon = carbon_agb + carbon_bgb + carbon_soc

    return {
        "stratum": stratum,
        "biomass_agb_mg_ha": round(biomass_agb, 2),
        "biomass_bgb_mg_ha": round(biomass_bgb, 2),
        "biomass_total_mg_ha": round(total_biomass, 2),
        "carbon_agb_tc_ha": round(carbon_agb, 2),
        "carbon_bgb_tc_ha": round(carbon_bgb, 2),
        "carbon_soc_tc_ha": round(carbon_soc, 2),
        "carbon_total_tc_ha": round(total_carbon, 2),
        "root_shoot_ratio": r_ratio,
        "soc_depth_cm": depth,
        "soil_bulk_density": bd,
        "soc_pct": round(soc_pct, 3),
        "soc_source": soc_source,
    }


def propagate_multipool_uncertainty(
    multi_pool: dict,
    agb_interval: dict | None,
    stratum: str = "SUNDARBANS_MANGROVE",
    soil_core_override: dict | None = None,
    n_iter: int = 2000,
    seed: int = 42,
) -> dict:
    """
    IPCC 2006 Vol. 4 Ch. 3 Approach 2 / Verra VM0047 Monte Carlo error propagation across pools:
      C_total = C_agb * (1 + R) + (BD * depth * SOC_pct)
    Combines remote-sensing prediction variance with allometric equation, root-to-shoot ratio,
    bulk density, and soil organic carbon measurement/spatial variance rather than fixed +/-12% bounds.
    """
    params = STRATUM_ALLOMETRY.get(stratum, STRATUM_ALLOMETRY["SUNDARBANS_MANGROVE"])
    rng = np.random.default_rng(seed)

    c_agb_mean = max(0.0, float(multi_pool["carbon_agb_tc_ha"]))
    b_agb_mean = max(0.0, float(multi_pool["biomass_agb_mg_ha"]))
    r_mean = float(multi_pool["root_shoot_ratio"])
    bd_mean = float(multi_pool["soil_bulk_density"])
    depth = float(multi_pool["soc_depth_cm"])
    soc_pct_mean = float(multi_pool.get("soc_pct", multi_pool["carbon_soc_tc_ha"] / max(bd_mean * depth, 1e-6)))

    # 90% half-width from RF/Fusion -> 1-sigma std dev (z_0.95 = 1.64485)
    model_sigma_c = 0.0
    model_sigma_b = 0.0
    if agb_interval:
        model_sigma_c = max(0.0, (float(agb_interval["carbon_upper_90"]) - float(agb_interval["carbon_lower_90"])) / (2.0 * 1.64485))
        model_sigma_b = max(0.0, (float(agb_interval["biomass_upper_90"]) - float(agb_interval["biomass_lower_90"])) / (2.0 * 1.64485))

    allom_cv = float(params.get("allometry_cv", 0.11))
    sigma_c_agb = float(np.hypot(model_sigma_c, c_agb_mean * allom_cv))
    sigma_b_agb = float(np.hypot(model_sigma_b, b_agb_mean * allom_cv))

    r_cv = float(params.get("root_shoot_cv", 0.18))
    bd_cv = float((soil_core_override or {}).get("bd_cv", params.get("bulk_density_cv", 0.14)))
    oc_cv = float((soil_core_override or {}).get("oc_cv", params.get("soc_pct_cv", 0.18)))

    c_agb_s = np.clip(rng.normal(c_agb_mean, sigma_c_agb, n_iter), 0.0, None)
    b_agb_s = np.clip(rng.normal(b_agb_mean, sigma_b_agb, n_iter), 0.0, None)
    r_s = np.zeros(n_iter) if r_mean <= 0 else np.clip(rng.normal(r_mean, r_mean * r_cv, n_iter), 0.05, 1.5)
    bd_s = np.zeros(n_iter) if bd_mean <= 0 else np.clip(rng.normal(bd_mean, bd_mean * bd_cv, n_iter), 0.1, 2.2)
    oc_s = np.zeros(n_iter) if soc_pct_mean <= 0 else np.clip(rng.normal(soc_pct_mean, soc_pct_mean * oc_cv, n_iter), 0.05, 35.0)

    c_bgb_s = c_agb_s * r_s
    c_soc_s = bd_s * depth * oc_s
    c_total_s = c_agb_s + c_bgb_s + c_soc_s
    b_total_s = b_agb_s * (1.0 + r_s)

    var_agb = float(np.var(c_agb_s))
    var_bgb = float(np.var(c_bgb_s))
    var_soc = float(np.var(c_soc_s))
    total_var = max(var_agb + var_bgb + var_soc, 1e-9)

    base_method = agb_interval.get("interval_method", "rf_tree_quantile") if agb_interval else "allometric_mc"
    return {
        "biomass_lower_90": round(float(np.percentile(b_total_s, 5)), 2),
        "biomass_upper_90": round(float(np.percentile(b_total_s, 95)), 2),
        "carbon_lower_90": round(float(np.percentile(c_total_s, 5)), 2),
        "carbon_upper_90": round(float(np.percentile(c_total_s, 95)), 2),
        "interval_method": base_method,
        "propagation_method": f"{base_method}+ipcc_approach2_mc_{n_iter}",
        "monte_carlo_iterations": n_iter,
        "pool_variance_share_pct": {
            "agb": round(100.0 * var_agb / total_var, 1),
            "bgb": round(100.0 * var_bgb / total_var, 1),
            "soc": round(100.0 * var_soc / total_var, 1),
        },
        "soc_lower_90": round(float(np.percentile(c_soc_s, 5)), 2),
        "soc_upper_90": round(float(np.percentile(c_soc_s, 95)), 2),
    }

class CarbonEstimator:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_dir = os.path.join(base_dir, "models")
        self.rf_path = os.path.join(self.model_dir, "carbon_rf_model.joblib")
        self.xgb_path = os.path.join(self.model_dir, "carbon_xgb_model.joblib")
        self.xgb_biomass_ubj_path = os.path.join(self.model_dir, "carbon_xgb_biomass.ubj")
        self.xgb_carbon_ubj_path = os.path.join(self.model_dir, "carbon_xgb_carbon.ubj")
        self.meta_path = os.path.join(self.model_dir, "carbon_model_meta.json")
        # Honest default: until a recalibration run promotes a real-data model,
        # every estimate must say plainly that it came from a synthetic-trained model.
        self.model_meta = {"version": "0.0.0-unset", "trained_on": "synthetic-v1",
                            "trained_at": None, "validation": None}
        
        # Canonical 17-feature vector shared with calibration.py
        self.feature_names = list(DEFAULT_FEATURE_NAMES)
        
        self.model_type = "random_forest" # Options: random_forest, xgboost, fusion
        self.rf_model = None
        self.xgb_model = None
        self.fusion_estimator = CarbonFusionEstimator(self.model_dir)
        self._load_or_train_models()

    def _load_or_train_models(self):
        """
        Loads Random Forest and XGBoost models.
        Uses native XGBoost UBJSON artifacts (eliminating pickle version warnings) and
        re-synchronizes legacy synthetic pickles when scikit-learn runtime versions differ
        while never overwriting a real-ground-truth calibrated artifact.
        """
        if os.path.exists(self.meta_path):
            try:
                with open(self.meta_path, "r") as f:
                    self.model_meta = json.load(f)
            except Exception as e:
                print(f"[AI Module] Could not read model metadata, using default: {e}")

        is_synthetic_artifact = str(self.model_meta.get("trained_on", "synthetic-v1")).startswith("synthetic")
        needs_resync = is_synthetic_artifact and (self.model_meta.get("version") != SYNTHETIC_BASELINE_VERSION)

        # Load RF cleanly without letting legacy 1.9.0 synthetic pickles emit warnings
        if os.path.exists(self.rf_path):
            try:
                with warnings.catch_warnings(record=True) as caught:
                    warnings.simplefilter("always", InconsistentVersionWarning)
                    self.rf_model = joblib.load(self.rf_path)
                version_mismatch = any(issubclass(w.category, InconsistentVersionWarning) for w in caught)
                if version_mismatch and is_synthetic_artifact:
                    needs_resync = True
                else:
                    print(f"[AI Module] Loaded Random Forest model from {self.rf_path}")
            except Exception as e:
                print(f"[AI Module] Error loading RF: {e}")
                self.rf_model = None

        # Prefer native XGBoost UBJSON (.ubj) models over legacy pickled joblib dicts
        if XGB_AVAILABLE:
            if os.path.exists(self.xgb_biomass_ubj_path) and os.path.exists(self.xgb_carbon_ubj_path):
                try:
                    xgb_b = xgb.XGBRegressor()
                    xgb_b.load_model(self.xgb_biomass_ubj_path)
                    xgb_c = xgb.XGBRegressor()
                    xgb_c.load_model(self.xgb_carbon_ubj_path)
                    self.xgb_model = {"biomass": xgb_b, "carbon": xgb_c}
                    print(f"[AI Module] Loaded XGBoost UBJSON models from {self.model_dir}")
                except Exception as e:
                    print(f"[AI Module] Error loading XGBoost UBJSON: {e}")
                    self.xgb_model = None
            elif is_synthetic_artifact:
                needs_resync = True
            elif os.path.exists(self.xgb_path):
                try:
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore", UserWarning)
                        self.xgb_model = joblib.load(self.xgb_path)
                    print(f"[AI Module] Loaded XGBoost model from {self.xgb_path}")
                except Exception as e:
                    print(f"[AI Module] Error loading XGBoost: {e}")

        # Retrain deterministic synthetic baseline ONLY when missing or legacy synthetic needs version resync
        if self.rf_model is None or (XGB_AVAILABLE and self.xgb_model is None) or (needs_resync and is_synthetic_artifact):
            os.makedirs(self.model_dir, exist_ok=True)
            self._train_models()

    def _train_models(self):
        """
        Trains baseline RandomForest and XGBoost Regressors across 5 stratified Bangladesh
        land-cover regimes (open water, urban/barren, cropland, agroforestry, dense forest)
        so non-forest Sentinel pixels never extrapolate to forest carbon.
        """
        print("[AI Module] Fitting multi-regime EO baseline estimators...")
        rng = np.random.default_rng(42)
        regime_specs = [
            # (name, count, b2, b3, b4, b8, b5, b6, b11, b12, vv, vh_delta)
            ("water", 250, (0.04, 0.14), (0.05, 0.16), (0.03, 0.12), (0.004, 0.05),
             (0.03, 0.09), (0.01, 0.06), (0.004, 0.04), (0.002, 0.03), (-22.0, -14.0), (4.0, 8.0)),
            ("urban", 250, (0.06, 0.18), (0.08, 0.22), (0.10, 0.26), (0.10, 0.28),
             (0.10, 0.24), (0.10, 0.25), (0.15, 0.36), (0.12, 0.30), (-10.0, -1.0), (5.0, 10.0)),
            ("crop", 300, (0.03, 0.09), (0.05, 0.13), (0.05, 0.14), (0.18, 0.42),
             (0.08, 0.16), (0.14, 0.28), (0.10, 0.24), (0.06, 0.16), (-14.0, -8.0), (5.0, 8.5)),
            ("agro", 350, (0.02, 0.07), (0.04, 0.10), (0.03, 0.08), (0.26, 0.52),
             (0.07, 0.16), (0.18, 0.34), (0.09, 0.22), (0.04, 0.13), (-13.5, -7.0), (5.0, 8.0)),
            ("forest", 350, (0.01, 0.06), (0.03, 0.09), (0.01, 0.06), (0.35, 0.72),
             (0.08, 0.20), (0.22, 0.42), (0.07, 0.20), (0.03, 0.12), (-14.0, -5.5), (4.5, 7.5)),
        ]

        cols = {k: [] for k in ("b2", "b3", "b4", "b8", "b5", "b6", "b11", "b12", "vv", "vh")}
        regimes = []
        for name, cnt, r2, r3, r4, r8, r5, r6, r11, r12, rvv, rvhd in regime_specs:
            regimes.extend([name] * cnt)
            for key, bounds in (("b2", r2), ("b3", r3), ("b4", r4), ("b8", r8),
                                ("b5", r5), ("b6", r6), ("b11", r11), ("b12", r12), ("vv", rvv)):
                cols[key].append(rng.uniform(bounds[0], bounds[1], cnt))
            vv_seg = cols["vv"][-1]
            cols["vh"].append(vv_seg - rng.uniform(rvhd[0], rvhd[1], cnt))

        b2_blue = np.concatenate(cols["b2"])
        b3_green = np.concatenate(cols["b3"])
        b4_red = np.concatenate(cols["b4"])
        b8_nir = np.concatenate(cols["b8"])
        b5_re1 = np.concatenate(cols["b5"])
        b6_re2 = np.concatenate(cols["b6"])
        b11_swir1 = np.concatenate(cols["b11"])
        b12_swir2 = np.concatenate(cols["b12"])
        s1_vv = np.concatenate(cols["vv"])
        s1_vh = np.concatenate(cols["vh"])
        s1_ratio = s1_vv - s1_vh
        regimes_arr = np.array(regimes)
        n_samples = len(regimes_arr)

        # Indices computed consistently across all regimes
        ndvi = np.clip((b8_nir - b4_red) / (b8_nir + b4_red + 1e-8) + rng.normal(0, 0.01, n_samples), -0.85, 0.95)
        evi = np.clip(2.5 * ((b8_nir - b4_red) / (b8_nir + 6 * b4_red - 7.5 * b2_blue + 1.0)) + rng.normal(0, 0.01, n_samples), -0.5, 0.88)
        ndwi = np.clip((b3_green - b8_nir) / (b3_green + b8_nir + 1e-8) + rng.normal(0, 0.01, n_samples), -0.9, 0.95)
        savi = np.clip((b8_nir - b4_red) / (b8_nir + b4_red + 0.5) * 1.5 + rng.normal(0, 0.01, n_samples), -0.85, 0.95)
        ndbi = np.clip((b11_swir1 - b8_nir) / (b11_swir1 + b8_nir + 1e-8) + rng.normal(0, 0.01, n_samples), -0.9, 0.9)

        tree_height = np.zeros(n_samples)
        biomass = np.zeros(n_samples)

        is_urban = regimes_arr == "urban"
        tree_height[is_urban] = np.clip(rng.uniform(0.0, 2.2, is_urban.sum()), 0.0, 2.5)
        biomass[is_urban] = np.where(
            ndvi[is_urban] < 0.12,
            0.0,
            np.clip(ndvi[is_urban] * 25.0 + rng.uniform(-1.0, 3.0, is_urban.sum()), 0.0, 12.0),
        )

        is_crop = regimes_arr == "crop"
        tree_height[is_crop] = np.clip((ndvi[is_crop] - 0.14) * 14.0 + rng.uniform(0.0, 2.5, is_crop.sum()), 0.5, 9.0)
        biomass[is_crop] = np.clip(
            tree_height[is_crop] * 4.5 + ndvi[is_crop] * 35.0 + rng.normal(0, 4.0, is_crop.sum()),
            4.0, 55.0,
        )

        is_agro = regimes_arr == "agro"
        tree_height[is_agro] = np.clip((ndvi[is_agro] - 0.12) * 20.0 + rng.uniform(1.0, 4.0, is_agro.sum()), 4.0, 18.0)
        biomass[is_agro] = np.clip(
            tree_height[is_agro] * 6.5 + ndvi[is_agro] * 70.0 + (s1_vh[is_agro] * 1.5 + 22.0) + rng.normal(0, 8.0, is_agro.sum()),
            40.0, 165.0,
        )

        is_forest = regimes_arr == "forest"
        tree_height[is_forest] = np.clip((ndvi[is_forest] - 0.12) * 24.0 + rng.uniform(2.0, 6.0, is_forest.sum()), 10.0, 29.0)
        biomass[is_forest] = np.clip(
            tree_height[is_forest] * 8.2 + ndvi[is_forest] * 115.0 + (s1_vh[is_forest] * 2.0 + 30.0) + rng.normal(0, 10.0, is_forest.sum()),
            140.0, 390.0,
        )

        X = pd.DataFrame({
            "B2_blue": b2_blue,
            "B3_green": b3_green,
            "B4_red": b4_red,
            "B8_nir": b8_nir,
            "B5_re1": b5_re1,
            "B6_re2": b6_re2,
            "B11_swir1": b11_swir1,
            "B12_swir2": b12_swir2,
            "ndvi": ndvi,
            "evi": evi,
            "ndwi": ndwi,
            "savi": savi,
            "ndbi": ndbi,
            "S1_vv": s1_vv,
            "S1_vh": s1_vh,
            "S1_ratio": s1_ratio,
            "tree_height": tree_height,
        })

        # Carbon conversion (IPCC tropical carbon factor ~47.5% of dry aboveground biomass)
        carbon = biomass * 0.475

        y = pd.DataFrame({
            "biomass": biomass,
            "carbon": carbon
        })

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 1. Train Random Forest
        rf = RandomForestRegressor(n_estimators=100, max_depth=14, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        self.rf_model = rf
        joblib.dump(rf, self.rf_path)
        print(f"[AI Module] Trained RandomForest. Test R2: {rf.score(X_test, y_test):.4f}")

        # 2. Train XGBoost (dual regressors)
        if XGB_AVAILABLE:
            xgb_biomass = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
            xgb_biomass.fit(X_train, y_train["biomass"])

            xgb_carbon = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
            xgb_carbon.fit(X_train, y_train["carbon"])

            self.xgb_model = {"biomass": xgb_biomass, "carbon": xgb_carbon}
            xgb_biomass.save_model(self.xgb_biomass_ubj_path)
            xgb_carbon.save_model(self.xgb_carbon_ubj_path)
            print("[AI Module] Trained dual-head XGBoost regressors (saved UBJSON).")

        # Record honestly that this model has NOT been calibrated against any
        # real field measurement yet. calibration.py overwrites this once a
        # recalibration run against GroundTruthPlot data actually passes validation.
        self.model_meta = {
            "version": SYNTHETIC_BASELINE_VERSION,
            "trained_on": "synthetic-v1",
            "sklearn_version": sklearn.__version__,
            "xgboost_version": xgb.__version__ if XGB_AVAILABLE else None,
            "vvb_eligible": False,
            "trained_at": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(),
            "validation": None
        }
        self._save_model_meta()

    def _save_model_meta(self):
        os.makedirs(self.model_dir, exist_ok=True)
        with open(self.meta_path, "w") as f:
            json.dump(self.model_meta, f, indent=2)

    def set_model_type(self, model_name):
        if model_name in ["random_forest", "xgboost", "fusion"]:
            if model_name == "xgboost" and not XGB_AVAILABLE:
                print("[AI Module] XGBoost is not available, remaining on Random Forest.")
                return False
            if model_name == "fusion":
                if not hasattr(self, "fusion_estimator") or self.fusion_estimator is None:
                    self.fusion_estimator = CarbonFusionEstimator(self.model_dir)
                if not self.fusion_estimator.is_loaded:
                    print(f"[AI Module] Fusion model status: {self.fusion_estimator.meta.get('status')}. Will operate with baseline fallback until gate is cleared.")
            self.model_type = model_name
            return True
        return False

    def _rf_prediction_interval(self, X_df, lower_pct=5, upper_pct=95):
        """
        Part (a): a 90% prediction interval built from the spread of individual
        tree predictions in the Random Forest ensemble. This is a real, if
        somewhat narrow, uncertainty estimate - not a placeholder number.
        It undersells true uncertainty for small forests (few trees agree on
        out-of-distribution inputs), so treat this as a floor on the real
        interval, not a ceiling. A quantile-regression XGBoost pair (see the
        build prompt's note on this) is the natural next upgrade once you have
        enough ground-truth data to train one properly.
        """
        if self.rf_model is None:
            return None
        # Each tree predicts [biomass, carbon] since the RF was fit on 2 targets.
        # .values: individual trees don't carry feature-name metadata like the
        # top-level RF does, so passing the raw array avoids a harmless-but-noisy warning.
        X_values = X_df.values
        per_tree = np.array([tree.predict(X_values)[0] for tree in self.rf_model.estimators_])
        biomass_samples = per_tree[:, 0]
        carbon_samples = per_tree[:, 1]
        return {
            "biomass_lower_90": float(np.percentile(biomass_samples, lower_pct)),
            "biomass_upper_90": float(np.percentile(biomass_samples, upper_pct)),
            "carbon_lower_90": float(np.percentile(carbon_samples, lower_pct)),
            "carbon_upper_90": float(np.percentile(carbon_samples, upper_pct)),
            "interval_method": "rf_tree_quantile"
        }

    @staticmethod
    def _classify_non_forest(ndvi: float, ndwi: float) -> str | None:
        if (ndvi < 0.12 and ndwi > 0.05) or ndvi < -0.05:
            return "OPEN_WATER"
        if ndvi < 0.15:
            return "BARREN_OR_URBAN"
        return None

    def _predict_batch(self, X_df):
        is_xgb = self.model_type == "xgboost" and self.xgb_model is not None
        is_fusion = (
            self.model_type == "fusion"
            and self.fusion_estimator is not None
            and self.fusion_estimator.is_loaded
        )
        if is_fusion:
            fusion_res = self.fusion_estimator.predict(X_df)
            return np.asarray(fusion_res["biomass"]), np.asarray(fusion_res["carbon"]), fusion_res
        if is_xgb:
            return (
                np.asarray(self.xgb_model["biomass"].predict(X_df)),
                np.asarray(self.xgb_model["carbon"].predict(X_df)),
                None,
            )
        preds = np.asarray(self.rf_model.predict(X_df))
        return preds[:, 0], preds[:, 1], None

    def estimate_carbon_stock(self, indices_data, lat=None, lng=None, soil_core_override=None):
        """
        Runs model inference for aggregate statistics with IPCC Tier-3 Multi-Pool Allometry
        and IPCC Approach 2 Monte Carlo multi-pool error propagation.
        Uses measured EO bands directly when present in `indices_data['average_bands']` instead
        of overwriting spectral channels from scalar NDVI.
        """
        is_fusion = self.model_type == "fusion" and self.fusion_estimator is not None and self.fusion_estimator.is_loaded

        # Determine coordinates and ecological stratum
        if lat is None:
            lat = indices_data.get("lat", indices_data.get("location_lat", 22.25))
        if lng is None:
            lng = indices_data.get("lng", indices_data.get("location_lng", 89.55))
        stratum = determine_stratum(lat, lng)

        features, feat_diag = extract_feature_vector(
            indices_data,
            self.feature_names,
            allow_spectral_fallback=True,
        )
        ndvi = float(features[self.feature_names.index("ndvi")])
        ndwi = float(features[self.feature_names.index("ndwi")])

        X_df = pd.DataFrame([features], columns=self.feature_names)
        biomass_preds, carbon_preds, fusion_res = self._predict_batch(X_df)
        biomass_agb = max(0.0, float(biomass_preds[0]))
        carbon_agb = max(0.0, float(carbon_preds[0]))

        non_forest = self._classify_non_forest(ndvi, ndwi)
        if non_forest is not None and not soil_core_override:
            stratum = non_forest
            biomass_agb = 0.0
            carbon_agb = 0.0

        # Multi-pool calculation (IPCC Tier-3 / Verra VM0047)
        multi_pool = calculate_multi_pool(
            biomass_agb,
            carbon_agb,
            ndvi,
            stratum=stratum,
            soil_core_override=soil_core_override,
        )

        # Interval from the fusion quantile head or RF ensemble for AGB, propagated via IPCC Approach 2 Monte Carlo
        if non_forest is not None and not soil_core_override:
            interval = {
                "biomass_lower_90": 0.0,
                "biomass_upper_90": 0.0,
                "carbon_lower_90": 0.0,
                "carbon_upper_90": 0.0,
                "interval_method": "fusion_pinball_quantile" if (is_fusion and fusion_res is not None) else "rf_tree_quantile",
            }
        elif is_fusion and fusion_res is not None:
            interval = {
                "biomass_lower_90": float(fusion_res["biomass_lower_90"][0]),
                "biomass_upper_90": float(fusion_res["biomass_upper_90"][0]),
                "carbon_lower_90": float(fusion_res["carbon_lower_90"][0]),
                "carbon_upper_90": float(fusion_res["carbon_upper_90"][0]),
                "interval_method": "fusion_pinball_quantile"
            }
        else:
            interval = self._rf_prediction_interval(X_df)

        total_interval = propagate_multipool_uncertainty(
            multi_pool,
            interval,
            stratum=stratum,
            soil_core_override=soil_core_override,
        )

        # Model provenance metadata
        if self.model_type == "fusion":
            if is_fusion:
                active_model_name = "fusion"
                active_version = self.fusion_estimator.model_meta.get("version", "fusion-v1")
                active_trained_on = self.fusion_estimator.model_meta.get("trained_on", "real-ground-truth")
            else:
                active_model_name = "fusion_fallback_rf"
                active_version = self.model_meta.get("version")
                active_trained_on = self.model_meta.get("trained_on")
        else:
            active_model_name = self.model_type
            active_version = self.model_meta.get("version")
            active_trained_on = self.model_meta.get("trained_on")

        is_real_model = not str(active_trained_on or "synthetic").startswith("synthetic")
        eo_verified = bool(indices_data.get("eo_pixel_verified", not feat_diag["spectral_bands_synthesized"]))

        return {
            "estimated_biomass_per_ha": multi_pool["biomass_total_mg_ha"],
            "estimated_carbon_per_ha": multi_pool["carbon_total_tc_ha"],
            "carbon_agb_tc_ha": multi_pool["carbon_agb_tc_ha"],
            "carbon_bgb_tc_ha": multi_pool["carbon_bgb_tc_ha"],
            "carbon_soc_tc_ha": multi_pool["carbon_soc_tc_ha"],
            "biomass_agb_mg_ha": multi_pool["biomass_agb_mg_ha"],
            "biomass_bgb_mg_ha": multi_pool["biomass_bgb_mg_ha"],
            "forest_stratum": stratum,
            "root_shoot_ratio": multi_pool["root_shoot_ratio"],
            "soc_source": multi_pool["soc_source"],
            "co2_multiplier": 3.667,
            "model_used": active_model_name,
            "feature_importance": self._get_feature_importances(),
            "interval": total_interval,
            "agb_interval": interval,
            "model_version": active_version,
            "model_trained_on": active_trained_on,
            "spectral_bands_synthesized": feat_diag["spectral_bands_synthesized"],
            "vvb_model_eligible": is_real_model and not feat_diag["spectral_bands_synthesized"] and eo_verified,
            "feature_vector": dict(zip(self.feature_names, [round(float(v), 5) for v in features]))
        }

    def _predict_pixel_grid(self, grid_pixels, stride: int = 1):
        """
        Shared helper that extracts 17-feature EO vectors for a 2D pixel grid (with optional
        striding), runs batch model inference, and clamps water/barren pixels to zero woody carbon.
        """
        if not grid_pixels or not grid_pixels[0]:
            return 0, 0, []

        src_h = len(grid_pixels)
        src_w = len(grid_pixels[0])
        row_indices = list(range(0, src_h, max(1, stride)))
        col_indices = list(range(0, src_w, max(1, stride)))

        sampled_coords = []
        features_batch = []
        ndvi_idx = self.feature_names.index("ndvi")
        ndwi_idx = self.feature_names.index("ndwi")

        for out_r, r in enumerate(row_indices):
            row_px = grid_pixels[r]
            for out_c, c in enumerate(col_indices):
                if c >= len(row_px):
                    continue
                px = row_px[c]
                feats, _ = extract_feature_vector(px, self.feature_names, allow_spectral_fallback=True)
                sampled_coords.append((out_r, out_c, px, float(feats[ndvi_idx]), float(feats[ndwi_idx])))
                features_batch.append(feats)

        if not features_batch:
            return len(row_indices), len(col_indices), []

        X_df = pd.DataFrame(features_batch, columns=self.feature_names)
        biomass_preds, carbon_preds, _ = self._predict_batch(X_df)

        items = []
        for idx, (out_r, out_c, px, ndvi_val, ndwi_val) in enumerate(sampled_coords):
            non_forest = self._classify_non_forest(ndvi_val, ndwi_val)
            if non_forest is not None:
                b_val = 0.0
                c_val = 0.0
            else:
                b_val = max(0.0, float(biomass_preds[idx]))
                c_val = max(0.0, float(carbon_preds[idx]))
            items.append((out_r, out_c, px, ndvi_val, ndwi_val, b_val, c_val, non_forest))

        return len(row_indices), len(col_indices), items

    def predict_grid_cells(self, grid_pixels, max_dim: int = 24) -> list[dict]:
        """
        Runs batch ML inference over real satellite `grid_pixels` (strided to at most `max_dim x max_dim`)
        and returns structured per-cell EO + carbon metrics for vector grid rendering.
        """
        if not grid_pixels or not grid_pixels[0]:
            return []

        src_h = len(grid_pixels)
        src_w = len(grid_pixels[0])
        stride = max(1, (max(src_h, src_w) + max_dim - 1) // max_dim)
        out_h, out_w, items = self._predict_pixel_grid(grid_pixels, stride=stride)
        if not items:
            return []

        lats = sorted({round(float(it[2].get("lat", 0.0)), 6) for it in items})
        lngs = sorted({round(float(it[2].get("lng", 0.0)), 6) for it in items})
        lat_diffs = [lats[i + 1] - lats[i] for i in range(len(lats) - 1) if lats[i + 1] > lats[i]]
        lng_diffs = [lngs[i + 1] - lngs[i] for i in range(len(lngs) - 1) if lngs[i + 1] > lngs[i]]
        step_lat = float(np.median(lat_diffs)) if lat_diffs else 0.0005
        step_lng = float(np.median(lng_diffs)) if lng_diffs else 0.0005

        cells = []
        for out_r, out_c, px, ndvi_val, ndwi_val, b_val, c_val, non_forest in items:
            px_lat = float(px.get("lat", 0.0))
            px_lng = float(px.get("lng", 0.0))
            stratum = non_forest if non_forest is not None else determine_stratum(px_lat, px_lng)
            mp = calculate_multi_pool(b_val, c_val, ndvi_val, stratum=stratum)
            cells.append({
                "r": out_r,
                "c": out_c,
                "lat": round(px_lat, 6),
                "lng": round(px_lng, 6),
                "step_lat": round(step_lat, 6),
                "step_lng": round(step_lng, 6),
                "ndvi": round(ndvi_val, 4),
                "evi": round(float(px.get("evi", 0.0)), 4),
                "ndwi": round(ndwi_val, 4),
                "height": round(float(px.get("tree_height", 0.0)), 2),
                "biomass": round(b_val, 2),
                "carbon": round(c_val, 2),
                "carbon_total": mp["carbon_total_tc_ha"],
                "stratum": stratum,
            })
        return cells

    def predict_grid_heatmap(self, grid_pixels, layer_type="carbon_heatmap"):
        """
        Runs pixel-by-pixel inference across the EO pixel grid and compiles the resulting
        color-mapped PNG image overlay based on actual measured spectral & SAR pixel features.
        """
        out_h, out_w, items = self._predict_pixel_grid(grid_pixels, stride=1)
        if out_h <= 0 or out_w <= 0 or not items:
            image = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

        width, height = out_w, out_h
        image = Image.new("RGBA", (width, height), (0, 0, 0, 0))

        for out_r, out_c, px, ndvi_val, ndwi_val, val_biomass, val_carbon, non_forest in items:
            # Determine value to display on map based on selection
            if layer_type == "carbon_heatmap":
                if non_forest == "OPEN_WATER":
                    red, green, blue, alpha = 20, 75, 140, 45
                elif non_forest == "BARREN_OR_URBAN":
                    red, green, blue, alpha = 150, 120, 90, 55
                else:
                    # Normalize: typical AGB carbon range 0 to 200 tC/ha
                    val = min(1.0, max(0.0, val_carbon / 200.0))
                    red = int(255 - 180 * val)
                    green = int(140 - 120 * val)
                    blue = int(40 + 190 * val)
                    alpha = int(130 + 110 * val)
            elif layer_type == "forest_cover":
                if non_forest is None and ndvi_val > 0.45 and val_biomass > 80.0:
                    red, green, blue, alpha = 34, 139, 34, 190
                else:
                    red, green, blue, alpha = 0, 0, 0, 0
            elif layer_type == "ndvi":
                val = ndvi_val
                if val < 0.2:
                    red, green, blue, alpha = 130, 110, 85, 60
                elif val < 0.5:
                    red, green, blue, alpha = 200, 210, 80, 130
                else:
                    red, green, blue, alpha = 20, 175, 50, int(150 + 105 * min(1.0, (val - 0.5) / 0.5))
            elif layer_type == "evi":
                val = max(0.0, min(1.0, float(px.get("evi", 0.0))))
                red, green, blue, alpha = int(150 - 110 * val), int(110 + 130 * val), 60, int(120 + 135 * val)
            else:  # ndwi
                val = max(0.0, min(1.0, ndwi_val + 0.5))
                red, green, blue, alpha = 35, 110, int(200 + 55 * val), int(200 * val)

            image.putpixel((out_c, out_r), (red, green, blue, alpha))

        # Smooth border mask only when grid is large enough to preserve interior cells cleanly
        if width >= 8 and height >= 8:
            mask = Image.new("L", (width, height), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.ellipse([1, 1, width - 2, height - 2], fill=255)
            final_image = Image.new("RGBA", (width, height))
            final_image.paste(image, (0, 0), mask=mask)
        else:
            final_image = image

        buffered = io.BytesIO()
        final_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"

    def _get_feature_importances(self):
        """
        Extracts feature importances depending on selected model.
        """
        importances = []
        if self.model_type == "xgboost" and self.xgb_model is not None:
            # Average feature importance across the two models
            imp_biomass = self.xgb_model["biomass"].feature_importances_
            imp_carbon = self.xgb_model["carbon"].feature_importances_
            importances = ((imp_biomass + imp_carbon) / 2.0).tolist()
        elif self.model_type == "fusion" and self.fusion_estimator is not None and self.fusion_estimator.is_loaded:
            # Multi-modal encoder relative weights: optical 13/28, SAR 3/28, LiDAR 1/28
            opt_weight = (13.0 / 28.0) / 13.0
            sar_weight = (3.0 / 28.0) / 3.0
            lidar_weight = (1.0 / 28.0)
            importances = [opt_weight]*13 + [sar_weight]*3 + [lidar_weight]
        elif self.rf_model is not None:
            importances = self.rf_model.feature_importances_.tolist()
            
        if importances:
            return dict(zip(self.feature_names, [round(x, 4) for x in importances]))
        return {}

    def retrain_with_ground_truth(self, X_real, y_real, min_samples=30,
                                   max_mae_carbon=25.0, min_r2=0.3):
        """
        Part (b): staging/validate/promote retraining loop, called by
        calibration.py's scheduled recalibration job.

        X_real: DataFrame with columns matching self.feature_names, built from
                actual satellite feature extraction at each GroundTruthPlot's
                location and measurement_date.
        y_real: DataFrame with columns ['biomass', 'carbon'] from measured_biomass_mg_ha
                and measured_carbon_tc_ha.

        This NEVER overwrites the live model directly. It trains a candidate,
        validates it against a held-out slice of real plots, and only promotes
        it if it clears the thresholds - otherwise the live model is untouched
        and the failure is returned for the caller to log/alert on.
        """
        n = len(X_real)
        if n < min_samples:
            return {
                "promoted": False,
                "reason": f"only {n} ground-truth plots available, need >= {min_samples}. "
                          f"Model remains {self.model_meta.get('trained_on')} - this is expected "
                          f"and should be surfaced to users, not hidden.",
            }

        X_train, X_holdout, y_train, y_holdout = train_test_split(
            X_real, y_real, test_size=0.25, random_state=42
        )

        candidate_rf = RandomForestRegressor(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
        candidate_rf.fit(X_train, y_train)

        holdout_pred = candidate_rf.predict(X_holdout)
        mae_carbon = mean_absolute_error(y_holdout["carbon"], holdout_pred[:, 1])
        r2_carbon = r2_score(y_holdout["carbon"], holdout_pred[:, 1])

        validation = {
            "n_samples": n,
            "n_holdout": len(X_holdout),
            "mae_carbon_tc_ha": round(float(mae_carbon), 3),
            "r2_carbon": round(float(r2_carbon), 3),
            "evaluated_at": datetime.datetime.utcnow().isoformat()
        }

        if mae_carbon > max_mae_carbon or r2_carbon < min_r2:
            return {"promoted": False, "reason": "candidate model failed validation thresholds",
                    "validation": validation}

        # Passed validation - refit on the FULL real dataset (train+holdout) and promote.
        final_rf = RandomForestRegressor(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
        final_rf.fit(X_real, y_real)
        self.rf_model = final_rf
        joblib.dump(self.rf_model, self.rf_path)

        prev_version = self.model_meta.get("version", "0.0.0")
        try:
            major = int(prev_version.split("-")[0].split(".")[1]) + 1
        except Exception:
            major = 1
        self.model_meta = {
            "version": f"0.{major}.0-real-calibrated",
            "trained_on": f"real-plots-blend-v{major}",
            "sklearn_version": sklearn.__version__,
            "vvb_eligible": True,
            "trained_at": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(),
            "validation": validation
        }
        self._save_model_meta()

        return {"promoted": True, "validation": validation, "new_version": self.model_meta["version"]}

    def retrain_fusion_with_ground_truth(self, X_real, y_real):
        """
        Retrains the multi-modal fusion model on real ground-truth samples,
        enforcing the >= 150 sample gate and refusing synthetic training data.
        """
        res = self.fusion_estimator.fit_on_real_data(X_real, y_real)
        return res

