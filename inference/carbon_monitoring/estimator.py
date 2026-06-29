import os
import time
import numpy as np
import pandas as pd
import joblib
from PIL import Image, ImageDraw
import io
import base64
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

class CarbonEstimator:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_dir = os.path.join(base_dir, "models")
        self.rf_path = os.path.join(self.model_dir, "carbon_rf_model.joblib")
        self.xgb_path = os.path.join(self.model_dir, "carbon_xgb_model.joblib")
        
        # Extended 16-feature vector
        self.feature_names = [
            "B2_blue", "B3_green", "B4_red", "B8_nir",
            "B5_re1", "B6_re2", "B11_swir1", "B12_swir2",
            "ndvi", "evi", "ndwi", "savi", "ndbi",
            "S1_vv", "S1_vh", "S1_ratio",
            "tree_height" # GEDI LiDAR footprint tree height
        ]
        
        self.model_type = "random_forest" # Options: random_forest, xgboost
        self.rf_model = None
        self.xgb_model = None
        self._load_or_train_models()

    def _load_or_train_models(self):
        """
        Loads the pre-trained Random Forest and XGBoost models.
        If missing, automatically generates synthetic datasets representing GEDI
        and Sentinel-2 forestry features, fits the estimators, and serializes them.
        """
        # Load RF
        if os.path.exists(self.rf_path):
            try:
                self.rf_model = joblib.load(self.rf_path)
                print(f"[AI Module] Loaded Random Forest model from {self.rf_path}")
            except Exception as e:
                print(f"[AI Module] Error loading RF: {e}")
                
        # Load XGBoost
        if XGB_AVAILABLE and os.path.exists(self.xgb_path):
            try:
                self.xgb_model = joblib.load(self.xgb_path)
                print(f"[AI Module] Loaded XGBoost model from {self.xgb_path}")
            except Exception as e:
                print(f"[AI Module] Error loading XGBoost: {e}")

        # If any model is missing, trigger joint training
        if self.rf_model is None or (XGB_AVAILABLE and self.xgb_model is None):
            os.makedirs(self.model_dir, exist_ok=True)
            self._train_models()

    def _train_models(self):
        """
        Trains baseline RandomForest and XGBoost Regressors on synthetic datasets representing
        coastal mangrove and inland forest plots (features: Sentinel, GEDI heights; targets: biomass, carbon).
        """
        print("[AI Module] Fitting estimators on remote sensing GEDI labels...")
        np.random.seed(42)
        n_samples = 800

        # Simulate Sentinel-2 bands
        b2_blue = np.random.uniform(0.01, 0.08, n_samples)
        b3_green = np.random.uniform(0.03, 0.12, n_samples)
        b4_red = np.random.uniform(0.01, 0.09, n_samples)
        b8_nir = np.random.uniform(0.35, 0.75, n_samples)
        b5_re1 = np.random.uniform(0.08, 0.22, n_samples)
        b6_re2 = np.random.uniform(0.20, 0.40, n_samples)
        b11_swir1 = np.random.uniform(0.08, 0.25, n_samples)
        b12_swir2 = np.random.uniform(0.04, 0.15, n_samples)

        # Indices
        ndvi = (b8_nir - b4_red) / (b8_nir + b4_red + 1e-8) + np.random.normal(0, 0.01, n_samples)
        ndvi = np.clip(ndvi, 0.0, 0.95)
        evi = 2.5 * ((b8_nir - b4_red) / (b8_nir + 6 * b4_red - 7.5 * b2_blue + 1)) + np.random.normal(0, 0.01, n_samples)
        evi = np.clip(evi, 0.0, 0.85)
        ndwi = (b3_green - b8_nir) / (b3_green + b8_nir + 1e-8) + np.random.normal(0, 0.01, n_samples)
        savi = (b8_nir - b4_red) / (b8_nir + b4_red + 0.5) * 1.5 + np.random.normal(0, 0.01, n_samples)
        ndbi = (b11_swir1 - b8_nir) / (b11_swir1 + b8_nir + 1e-8) + np.random.normal(0, 0.01, n_samples)

        # Sentinel-1 Radar
        s1_vv = np.random.uniform(-15.0, -5.0, n_samples)
        s1_vh = s1_vv - np.random.uniform(5.0, 9.0, n_samples)
        s1_ratio = s1_vv - s1_vh

        # GEDI canopy tree height (meters)
        tree_height = (ndvi * 24.0) + np.random.uniform(2.0, 6.0, n_samples)

        # Create DataFrame
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
            "tree_height": tree_height
        })

        # TARGETS: Biomass and Carbon stock
        # Mangrove biomass correlates strongly with tree height, NDVI, and Radar backscatter volume
        biomass = (tree_height * 8.5) + (ndvi * 120.0) + (s1_vh * 2.0 + 30.0) + np.random.normal(0, 10.0, n_samples)
        biomass = np.clip(biomass, 10.0, 390.0)
        
        # Carbon conversion (IPCC tropical carbon factor is typically ~47.5% of dry biomass)
        carbon = biomass * 0.475

        y = pd.DataFrame({
            "biomass": biomass,
            "carbon": carbon
        })

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 1. Train Random Forest
        rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        self.rf_model = rf
        joblib.dump(rf, self.rf_path)
        print(f"[AI Module] Trained RandomForest. Test R2: {rf.score(X_test, y_test):.4f}")

        # 2. Train XGBoost (Multi-output Wrapper or separate regressors)
        if XGB_AVAILABLE:
            # XGBoost doesn't do multi-output naturally in older versions, so we train two models or use MultiOutputRegressor.
            # To keep it simple and dependency-light, we train two separate XGBoost models.
            xgb_biomass = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
            xgb_biomass.fit(X_train, y_train["biomass"])
            
            xgb_carbon = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42)
            xgb_carbon.fit(X_train, y_train["carbon"])
            
            self.xgb_model = {"biomass": xgb_biomass, "carbon": xgb_carbon}
            joblib.dump(self.xgb_model, self.xgb_path)
            print("[AI Module] Trained dual-head XGBoost regressors.")

    def set_model_type(self, model_name):
        if model_name in ["random_forest", "xgboost"]:
            if model_name == "xgboost" and not XGB_AVAILABLE:
                print("[AI Module] XGBoost is not available, remaining on Random Forest.")
                return False
            self.model_type = model_name
            return True
        return False

    def estimate_carbon_stock(self, indices_data):
        """
        Runs model inference for aggregate statistics.
        """
        model = self.rf_model
        # Use active model
        is_xgb = self.model_type == "xgboost" and self.xgb_model is not None
        
        # Prepare feature vector (using mean indices)
        ndvi = indices_data.get("average_ndvi", 0.6)
        evi = indices_data.get("average_evi", 0.5)
        ndwi = indices_data.get("average_ndwi", -0.2)
        savi = indices_data.get("average_savi", 0.45)
        ndbi = indices_data.get("average_ndbi", -0.3)
        vv = indices_data.get("average_vv", -12.0)
        vh = indices_data.get("average_vh", -18.5)
        ratio = indices_data.get("average_ratio", 6.5)
        height = indices_data.get("average_tree_height", 15.0)

        # Derive bands back-calculation for tabular input
        b4_red = max(0.01, 0.10 - (ndvi * 0.09))
        b8_nir = max(0.12, b4_red + ndvi * 0.65)
        b2_blue = max(0.01, b4_red * 0.75)
        b3_green = max(0.02, b4_red * 1.3)
        b5_re1 = b4_red + (b8_nir - b4_red) * 0.22
        b6_re2 = b4_red + (b8_nir - b4_red) * 0.68
        b11_swir1 = max(0.03, 0.26 - ndvi * 0.19)
        b12_swir2 = max(0.01, b11_swir1 * 0.55)

        features = [
            b2_blue, b3_green, b4_red, b8_nir,
            b5_re1, b6_re2, b11_swir1, b12_swir2,
            ndvi, evi, ndwi, savi, ndbi,
            vv, vh, ratio, height
        ]

        X_df = pd.DataFrame([features], columns=self.feature_names)

        if is_xgb:
            biomass = float(self.xgb_model["biomass"].predict(X_df)[0])
            carbon = float(self.xgb_model["carbon"].predict(X_df)[0])
        else:
            pred = self.rf_model.predict(X_df)[0]
            biomass = float(pred[0])
            carbon = float(pred[1])

        return {
            "estimated_biomass_per_ha": round(biomass, 2),
            "estimated_carbon_per_ha": round(carbon, 2),
            "co2_multiplier": 3.667,
            "model_used": self.model_type,
            "feature_importance": self._get_feature_importances()
        }

    def predict_grid_heatmap(self, grid_pixels, layer_type="carbon_heatmap"):
        """
        Runs pixel-by-pixel inference across the 64x64 grid and compiles the resulting color-mapped
        PNG image overlay based on actual model outputs.
        """
        width, height = 64, 64
        image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        
        is_xgb = self.model_type == "xgboost" and self.xgb_model is not None

        # Build feature list for batch inference (speeds up predicting 4096 pixels)
        features_batch = []
        for r in range(height):
            for c in range(width):
                px = grid_pixels[r][c]
                # Reconstruct spectral bands
                ndvi = px["ndvi"]
                b4_red = max(0.01, 0.10 - (ndvi * 0.09))
                b8_nir = max(0.12, b4_red + ndvi * 0.65)
                b2_blue = max(0.01, b4_red * 0.75)
                b3_green = max(0.02, b4_red * 1.3)
                b5_re1 = b4_red + (b8_nir - b4_red) * 0.22
                b6_re2 = b4_red + (b8_nir - b4_red) * 0.68
                b11_swir1 = max(0.03, 0.26 - ndvi * 0.19)
                b12_swir2 = max(0.01, b11_swir1 * 0.55)

                feat = [
                    b2_blue, b3_green, b4_red, b8_nir,
                    b5_re1, b6_re2, b11_swir1, b12_swir2,
                    ndvi, px["evi"], px["ndwi"], px["savi"], px["ndbi"],
                    px["S1_vv"], px["S1_vh"], px["S1_ratio"], px["tree_height"]
                ]
                features_batch.append(feat)

        # Batch predict
        X_df = pd.DataFrame(features_batch, columns=self.feature_names)
        if is_xgb:
            biomass_preds = self.xgb_model["biomass"].predict(X_df)
            carbon_preds = self.xgb_model["carbon"].predict(X_df)
        else:
            preds = self.rf_model.predict(X_df)
            biomass_preds = preds[:, 0]
            carbon_preds = preds[:, 1]

        idx = 0
        for r in range(height):
            for c in range(width):
                px = grid_pixels[r][c]
                val_biomass = biomass_preds[idx]
                val_carbon = carbon_preds[idx]
                
                # Determine value to display on map based on selection
                if layer_type == "carbon_heatmap":
                    # Normalize: typical carbon range 0 to 200 tC/ha
                    val = min(1.0, max(0.0, val_carbon / 200.0))
                    # Color map: Orange (low carbon) -> Purple (high carbon)
                    red = int(255 - 180 * val)
                    green = int(140 - 120 * val)
                    blue = int(40 + 190 * val)
                    alpha = int(130 + 110 * val)
                elif layer_type == "forest_cover":
                    # Canopy density threshold (NDVI > 0.45 or biomass > 120 Mg/ha)
                    if px["ndvi"] > 0.45 and val_biomass > 100.0:
                        red, green, blue, alpha = 34, 139, 34, 190 # Forest green
                    else:
                        red, green, blue, alpha = 0, 0, 0, 0
                elif layer_type == "ndvi":
                    # Colormap: Brown -> Light Green -> Green
                    val = px["ndvi"]
                    if val < 0.2:
                        red, green, blue, alpha = 130, 110, 85, 60
                    elif val < 0.5:
                        red, green, blue, alpha = 200, 210, 80, 130
                    else:
                        red, green, blue, alpha = 20, 175, 50, int(150 + 105 * (val-0.5)/0.5)
                elif layer_type == "evi":
                    val = px["evi"]
                    red, green, blue, alpha = int(150 - 110 * val), int(110 + 130 * val), 60, int(120 + 135 * val)
                else: # ndwi
                    val = max(0.0, px["ndwi"] + 0.5) # Shift range to positive for visualization
                    red, green, blue, alpha = 35, 110, int(200 + 55 * val), int(200 * val)

                image.putpixel((c, r), (red, green, blue, alpha))
                idx += 1

        # Smooth crop and blur borders
        mask = Image.new("L", (width, height), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([2, 2, width-3, height-3], fill=255)
        
        final_image = Image.new("RGBA", (width, height))
        final_image.paste(image, (0, 0), mask=mask)

        # Base64 output
        buffered = io.BytesIO()
        final_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
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
        elif self.rf_model is not None:
            importances = self.rf_model.feature_importances_.tolist()
            
        if importances:
            return dict(zip(self.feature_names, [round(x, 4) for x in importances]))
        return {}
