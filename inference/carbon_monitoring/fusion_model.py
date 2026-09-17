"""
Multi-Modal Sensor Fusion Model (Kanop pattern).

Implements modular neural sensor fusion across Sentinel-2 optical bands & indices,
Sentinel-1 SAR dual-polarization radar, and GEDI LiDAR canopy height.

Architecture:
  - OpticalEncoder: 13 features (8 bands + 5 indices) -> 16-dim representation
  - SAREncoder: 3 features (S1_vv, S1_vh, S1_ratio) -> 8-dim representation
  - HeightEncoder: 1 feature (tree_height) -> 4-dim representation
  - FusionModule: 28-dim concatenated latent -> 32-dim shared latent
  - Output Heads:
      1. Point Estimate: [biomass_agb, carbon_agb]
      2. Quantile Heads: [biomass_q05, biomass_q95, carbon_q05, carbon_q95] (Learned 90% Prediction Interval)

Gating Rule:
  Deep multimodal fusion strictly refuses to train on synthetic data or if combined
  GroundTruthPlot + DroneSurveyResult count is below MIN_REAL_SAMPLES_GATE (150 samples).
"""

import os
import json
import datetime
from typing import Dict, Any, Optional, Tuple

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from .models import GroundTruthPlot, DroneSurveyResult

MIN_REAL_SAMPLES_GATE = 150

OPTICAL_FEATURES = [
    "B2_blue", "B3_green", "B4_red", "B8_nir",
    "B5_re1", "B6_re2", "B11_swir1", "B12_swir2",
    "ndvi", "evi", "ndwi", "savi", "ndbi"
]
SAR_FEATURES = ["S1_vv", "S1_vh", "S1_ratio"]
HEIGHT_FEATURES = ["tree_height"]
ALL_FUSION_FEATURES = OPTICAL_FEATURES + SAR_FEATURES + HEIGHT_FEATURES  # 17 features


class OpticalEncoder(nn.Module):
    """Encodes 8 Sentinel-2 multispectral bands + 5 spectral indices."""
    def __init__(self, in_features: int = 13, out_dim: int = 16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 32),
            nn.LayerNorm(32),
            nn.ReLU(),
            nn.Linear(32, out_dim),
            nn.LayerNorm(out_dim),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class SAREncoder(nn.Module):
    """Encodes Sentinel-1 C-band synthetic aperture radar backscatter."""
    def __init__(self, in_features: int = 3, out_dim: int = 8):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 16),
            nn.LayerNorm(16),
            nn.ReLU(),
            nn.Linear(16, out_dim),
            nn.LayerNorm(out_dim),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class HeightEncoder(nn.Module):
    """Encodes GEDI LiDAR canopy height / structural profile."""
    def __init__(self, in_features: int = 1, out_dim: int = 4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 8),
            nn.LayerNorm(8),
            nn.ReLU(),
            nn.Linear(8, out_dim),
            nn.LayerNorm(out_dim),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class MultimodalCarbonFusionNet(nn.Module):
    """
    Kanop-aligned Multimodal Sensor Fusion Network for Forest Biomass & Carbon MRV.
    """
    def __init__(self):
        super().__init__()
        self.optical_encoder = OpticalEncoder(in_features=13, out_dim=16)
        self.sar_encoder = SAREncoder(in_features=3, out_dim=8)
        self.height_encoder = HeightEncoder(in_features=1, out_dim=4)

        fusion_dim = 16 + 8 + 4  # 28
        self.fusion_module = nn.Sequential(
            nn.Linear(fusion_dim, 64),
            nn.LayerNorm(64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 32),
            nn.LayerNorm(32),
            nn.ReLU()
        )

        # Head 1: Point estimates for Aboveground Biomass (Mg/ha) and Carbon (tC/ha)
        self.point_head = nn.Linear(32, 2)

        # Head 2: Learned Quantile Heads for 90% Prediction Interval:
        # [biomass_q05, biomass_q95, carbon_q05, carbon_q95]
        self.quantile_head = nn.Linear(32, 4)

    def forward(self, x_optical: torch.Tensor, x_sar: torch.Tensor, x_height: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        opt_feat = self.optical_encoder(x_optical)
        sar_feat = self.sar_encoder(x_sar)
        h_feat = self.height_encoder(x_height)

        fused = torch.cat([opt_feat, sar_feat, h_feat], dim=-1)
        latent = self.fusion_module(fused)

        point_preds = self.point_head(latent)       # [batch, 2] -> (biomass, carbon)
        quantile_preds = self.quantile_head(latent) # [batch, 4] -> (b_05, b_95, c_05, c_95)

        return point_preds, quantile_preds


def pinball_loss(preds: torch.Tensor, targets: torch.Tensor, q: float) -> torch.Tensor:
    """Asymmetric Pinball loss for quantile regression."""
    errors = targets - preds
    return torch.max((q - 1) * errors, q * errors).mean()


class CarbonFusionEstimator:
    """
    Manager for the PyTorch multimodal sensor fusion model.
    Handles persistence, sample-count gating, inference, and learned uncertainty.
    """
    def __init__(self, model_dir: Optional[str] = None):
        if model_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_dir = os.path.join(base_dir, "models")
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, "carbon_fusion_model.pt")
        self.meta_path = os.path.join(model_dir, "carbon_fusion_meta.json")

        self.net = MultimodalCarbonFusionNet()
        self.is_loaded = False
        self.meta: Dict[str, Any] = {
            "status": "gated_insufficient_real_data",
            "version": "0.0.0-uncalibrated",
            "min_samples_required": MIN_REAL_SAMPLES_GATE,
            "trained_on": None,
            "trained_at": None,
            "validation": None
        }
        self.model_meta = self.meta
        self._load_if_exists()

    @property
    def model_meta(self) -> Dict[str, Any]:
        return self.meta

    @model_meta.setter
    def model_meta(self, value: Dict[str, Any]):
        self.meta = value

    def _load_if_exists(self):
        if os.path.exists(self.meta_path):
            try:
                with open(self.meta_path, "r") as f:
                    self.meta = json.load(f)
            except Exception as e:
                print(f"[Fusion Model] Could not load meta: {e}")

        if os.path.exists(self.model_path):
            try:
                checkpoint = torch.load(self.model_path, map_location=torch.device("cpu"))
                self.net.load_state_dict(checkpoint["state_dict"])
                self.net.eval()
                self.is_loaded = True
                print(f"[Fusion Model] Loaded pre-trained PyTorch fusion weights from {self.model_path}")
            except Exception as e:
                print(f"[Fusion Model] Could not load state dict: {e}")
                self.is_loaded = False

    def check_training_gate(self, db: Session) -> Tuple[bool, int, str]:
        """
        Non-negotiable constraint: The fusion model never trains on synthetic data.
        Enforces that real GroundTruthPlot + DroneSurveyResult count >= MIN_REAL_SAMPLES_GATE.
        """
        real_ground_plots = db.query(GroundTruthPlot).count()
        real_drone_surveys = db.query(DroneSurveyResult).filter(
            DroneSurveyResult.measured_carbon_tc_ha.isnot(None),
            DroneSurveyResult.measured_biomass_mg_ha.isnot(None)
        ).count()

        total_real = real_ground_plots + real_drone_surveys
        if total_real < MIN_REAL_SAMPLES_GATE:
            reason = (
                f"Gated: Found {total_real} real field/drone samples ({real_ground_plots} field plots, "
                f"{real_drone_surveys} drone surveys). Deep multimodal sensor fusion requires at least "
                f"{MIN_REAL_SAMPLES_GATE} real samples before training to prevent overfitting and synthetic artifacts."
            )
            return False, total_real, reason

        return True, total_real, f"Gate cleared: {total_real} real samples available."

    def fit_on_real_data(
        self,
        X: pd.DataFrame,
        y: pd.DataFrame,
        is_synthetic: bool = False,
        db: Optional[Session] = None,
        epochs: int = 50
    ) -> Dict[str, Any]:
        """
        Fits fusion model on provided real ground truth data with strict gates:
        1. Refuses synthetic dataset (is_synthetic=True)
        2. Requires >= 150 samples (MIN_REAL_SAMPLES_GATE)
        """
        if is_synthetic:
            return {
                "promoted": False,
                "reason": "Multimodal fusion model strictly refuses synthetic training data. Must use real ground-truth plots or drone surveys."
            }

        sample_count = len(X)
        if sample_count < MIN_REAL_SAMPLES_GATE:
            return {
                "promoted": False,
                "gated": True,
                "reason": f"Insufficient sample size: got {sample_count}, need >= {MIN_REAL_SAMPLES_GATE} real ground-truth samples.",
                "sample_count": sample_count,
                "min_samples_required": MIN_REAL_SAMPLES_GATE
            }

        df_real = X.copy()
        if "biomass" in y.columns:
            df_real["biomass"] = y["biomass"]
        if "carbon" in y.columns:
            df_real["carbon"] = y["carbon"]

        return self._train_internal(df_real, sample_count=sample_count, epochs=epochs)

    def train_on_real_data(self, df_real: pd.DataFrame, db: Session, epochs: int = 50) -> Dict[str, Any]:
        """
        Trains the multimodal fusion model strictly on real verified data.
        Gated by check_training_gate().
        """
        can_train, sample_count, gate_msg = self.check_training_gate(db)
        if not can_train:
            return {
                "promoted": False,
                "gated": True,
                "reason": gate_msg,
                "sample_count": sample_count,
                "min_samples_required": MIN_REAL_SAMPLES_GATE
            }

        return self._train_internal(df_real, sample_count=sample_count, epochs=epochs)

    def _train_internal(self, df_real: pd.DataFrame, sample_count: int, epochs: int = 50) -> Dict[str, Any]:
        # Validate that all required features exist in df_real
        missing = [f for f in ALL_FUSION_FEATURES if f not in df_real.columns]
        if missing:
            return {"promoted": False, "reason": f"Missing required features: {missing}"}

        # Prepare PyTorch tensors
        x_opt = torch.tensor(df_real[OPTICAL_FEATURES].values, dtype=torch.float32)
        x_sar = torch.tensor(df_real[SAR_FEATURES].values, dtype=torch.float32)
        x_h = torch.tensor(df_real[HEIGHT_FEATURES].values, dtype=torch.float32)
        y_targets = torch.tensor(df_real[["biomass", "carbon"]].values, dtype=torch.float32)

        dataset = torch.utils.data.TensorDataset(x_opt, x_sar, x_h, y_targets)
        train_size = int(0.8 * len(dataset))
        val_size = len(dataset) - train_size
        train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])

        train_loader = torch.utils.data.DataLoader(train_ds, batch_size=16, shuffle=True)
        val_loader = torch.utils.data.DataLoader(val_ds, batch_size=16, shuffle=False)

        model = MultimodalCarbonFusionNet()
        optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
        mse_loss_fn = nn.MSELoss()

        model.train()
        for epoch in range(epochs):
            for b_opt, b_sar, b_h, b_targets in train_loader:
                optimizer.zero_grad()
                point_preds, quant_preds = model(b_opt, b_sar, b_h)

                # Point loss (biomass, carbon)
                loss_point = mse_loss_fn(point_preds, b_targets)

                # Quantile losses: [b_05, b_95, c_05, c_95]
                loss_q_b05 = pinball_loss(quant_preds[:, 0], b_targets[:, 0], 0.05)
                loss_q_b95 = pinball_loss(quant_preds[:, 1], b_targets[:, 0], 0.95)
                loss_q_c05 = pinball_loss(quant_preds[:, 2], b_targets[:, 1], 0.05)
                loss_q_c95 = pinball_loss(quant_preds[:, 3], b_targets[:, 1], 0.95)

                total_loss = loss_point + (loss_q_b05 + loss_q_b95 + loss_q_c05 + loss_q_c95) * 0.5
                total_loss.backward()
                optimizer.step()

        # Validation pass
        model.eval()
        val_maes = []
        with torch.no_grad():
            for b_opt, b_sar, b_h, b_targets in val_loader:
                point_preds, _ = model(b_opt, b_sar, b_h)
                val_maes.append(torch.abs(point_preds - b_targets).mean(dim=0).numpy())

        mean_mae = np.mean(val_maes, axis=0) if val_maes else [99.0, 99.0]
        mae_biomass = float(round(mean_mae[0], 2))
        mae_carbon = float(round(mean_mae[1], 2))

        # Check validation threshold (e.g. MAE carbon <= 25 tC/ha)
        if mae_carbon > 25.0:
            return {
                "promoted": False,
                "reason": f"Validation MAE {mae_carbon} tC/ha exceeded threshold 25.0 tC/ha",
                "validation": {"mae_carbon": mae_carbon, "mae_biomass": mae_biomass}
            }

        # Promote model
        os.makedirs(self.model_dir, exist_ok=True)
        torch.save({"state_dict": model.state_dict()}, self.model_path)
        self.net = model
        self.is_loaded = True

        self.meta = {
            "status": "active_trained",
            "version": f"1.0.0-fusion-calibrated",
            "trained_on": f"real_field_and_drone_n{sample_count}",
            "trained_at": datetime.datetime.utcnow().isoformat(),
            "validation": {
                "sample_count": sample_count,
                "mae_carbon_tc_ha": mae_carbon,
                "mae_biomass_mg_ha": mae_biomass
            }
        }
        with open(self.meta_path, "w") as f:
            json.dump(self.meta, f, indent=2)

        return {
            "promoted": True,
            "version": self.meta["version"],
            "validation": self.meta["validation"]
        }

    def predict(self, feature_dict: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """
        Runs inference through the multi-modal fusion network.
        Returns point predictions and learned 90% prediction intervals.
        """
        if not self.is_loaded:
            return None

        # Build feature tensors
        opt_vals = [float(feature_dict.get(k, 0.0)) for k in OPTICAL_FEATURES]
        sar_vals = [float(feature_dict.get(k, 0.0)) for k in SAR_FEATURES]
        h_vals = [float(feature_dict.get(k, 0.0)) for k in HEIGHT_FEATURES]

        t_opt = torch.tensor([opt_vals], dtype=torch.float32)
        t_sar = torch.tensor([sar_vals], dtype=torch.float32)
        t_h = torch.tensor([h_vals], dtype=torch.float32)

        self.net.eval()
        with torch.no_grad():
            point_preds, quant_preds = self.net(t_opt, t_sar, t_h)

        b_est = float(point_preds[0, 0].item())
        c_est = float(point_preds[0, 1].item())

        b_q05 = float(quant_preds[0, 0].item())
        b_q95 = float(quant_preds[0, 1].item())
        c_q05 = float(quant_preds[0, 2].item())
        c_q95 = float(quant_preds[0, 3].item())

        # Guarantee physical bounds (lower <= upper and positive)
        b_lower = max(0.0, min(b_q05, b_q95))
        b_upper = max(b_lower, max(b_q05, b_q95))
        c_lower = max(0.0, min(c_q05, c_q95))
        c_upper = max(c_lower, max(c_q05, c_q95))

        return {
            "biomass_agb_mg_ha": round(b_est, 2),
            "carbon_agb_tc_ha": round(c_est, 2),
            "agb_interval": {
                "biomass_lower_90": round(b_lower, 2),
                "biomass_upper_90": round(b_upper, 2),
                "carbon_lower_90": round(c_lower, 2),
                "carbon_upper_90": round(c_upper, 2),
                "interval_method": "learned_fusion_quantiles"
            },
            "model_version": self.meta.get("version"),
            "model_trained_on": self.meta.get("trained_on")
        }
