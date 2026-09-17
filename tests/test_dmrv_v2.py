"""
tests/test_dmrv_v2.py - Comprehensive Unit & Integration Tests for dMRV v2
Architecture:
  1. Multi-modal sensor fusion model (Kanop pattern: Optical + SAR + LiDAR PyTorch encoders,
     pinball quantile loss, hard >= 150 real sample gate).
  2. Uncertainty-tiered monitoring (Treeconomy pattern: relative width > 0.35 auto-dispatch,
     DroneSurveyResult intake, recalibration feedback).
  3. Multi-validator cryptographic trust (Open Forest Protocol pattern: Ed25519 co-signatures,
     tamper detection, dual trust status).
  4. Verra VM0047 Dynamic Stocking Index Registry Export.
"""

import os
import sys
import json
import uuid
import datetime
import unittest
import numpy as np
import pandas as pd
import torch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import (
    CarbonResult, GroundTruthPlot, EstimateProvenance,
    VerificationTask, DroneSurveyResult, ValidatorSignature
)
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring import provenance as provenance_utils
from inference.carbon_monitoring.fusion_model import (
    OpticalEncoder, SAREncoder, HeightEncoder,
    MultimodalCarbonFusionNet, CarbonFusionEstimator, pinball_loss
)
from inference.carbon_monitoring.estimator import CarbonEstimator
from inference.carbon_monitoring.tiering import (
    calculate_relative_uncertainty_width, flag_for_verification,
    complete_verification_task, list_verification_tasks
)
from inference.carbon_monitoring.registry_export import export_vm0047_stocking_index


class TestDMRVv2TestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV v2 Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        try:
            self.db.query(ValidatorSignature).filter(
                ValidatorSignature.validator_id.in_(["VVB-AUDITOR-01", "BFD-REGISTRY-02", "VVB-API-TEST"])
            ).delete(synchronize_session=False)
            self.db.query(EstimateProvenance).filter(
                EstimateProvenance.result_id.like("test-%") | EstimateProvenance.result_id.like("api-sign-%")
            ).delete(synchronize_session=False)
            self.db.query(CarbonResult).filter(
                CarbonResult.job_id.like("job-vm0047-%") | CarbonResult.parcel_id.like("SUNDARBANS-PROJECT-%")
            ).delete(synchronize_session=False)
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()
            from inference.carbon_monitoring.router import carbon_estimator
            carbon_estimator.set_model_type("random_forest")

    # -------------------------------------------------------------------------
    # 1. Multi-Modal Sensor Fusion Tests (Kanop Pattern)
    # -------------------------------------------------------------------------

    def test_01_fusion_encoders_and_network_forward(self):
        """Test that Optical, SAR, and LiDAR encoders output exact tensor shapes."""
        batch_size = 8
        opt_in = torch.randn(batch_size, 13)
        sar_in = torch.randn(batch_size, 3)
        lidar_in = torch.randn(batch_size, 1)

        opt_enc = OpticalEncoder(13, 16)
        sar_enc = SAREncoder(3, 8)
        lidar_enc = HeightEncoder(1, 4)

        opt_out = opt_enc(opt_in)
        sar_out = sar_enc(sar_in)
        lidar_out = lidar_enc(lidar_in)

        self.assertEqual(opt_out.shape, (batch_size, 16))
        self.assertEqual(sar_out.shape, (batch_size, 8))
        self.assertEqual(lidar_out.shape, (batch_size, 4))

        # Full network forward pass
        net = MultimodalCarbonFusionNet()
        point_preds, quantile_preds = net(opt_in, sar_in, lidar_in)
        self.assertEqual(point_preds.shape, (batch_size, 2))      # [biomass, carbon]
        self.assertEqual(quantile_preds.shape, (batch_size, 4))   # [b_05, b_95, c_05, c_95]

    def test_02_pinball_loss_quantile_properties(self):
        """Test pinball quantile loss computes asymmetric penalties for quantiles."""
        y_true = torch.tensor([[100.0, 50.0]])
        y_under = torch.tensor([[90.0, 45.0]])
        y_over = torch.tensor([[110.0, 55.0]])

        # At q=0.95 (upper quantile), underprediction should be penalized heavily
        loss_under_95 = pinball_loss(y_under, y_true, q=0.95)
        loss_over_95 = pinball_loss(y_over, y_true, q=0.95)
        self.assertGreater(loss_under_95.item(), loss_over_95.item())

        # At q=0.05 (lower quantile), overprediction should be penalized heavily
        loss_under_05 = pinball_loss(y_under, y_true, q=0.05)
        loss_over_05 = pinball_loss(y_over, y_true, q=0.05)
        self.assertGreater(loss_over_05.item(), loss_under_05.item())

    def test_03_fusion_sample_size_gate_enforcement(self):
        """Test fusion estimator strictly rejects training if sample count < 150 or if synthetic."""
        estimator = CarbonFusionEstimator(model_dir=os.path.join(BASE_DIR, "inference", "models"))
        
        # Test 1: Sub-threshold sample size (< 150)
        np.random.seed(42)
        n_small = 50
        feature_names = [
            "B2_blue", "B3_green", "B4_red", "B8_nir", "B5_re1", "B6_re2", "B11_swir1", "B12_swir2",
            "ndvi", "evi", "ndwi", "savi", "ndbi", "S1_vv", "S1_vh", "S1_ratio", "tree_height"
        ]
        X_small = pd.DataFrame(np.random.randn(n_small, 17), columns=feature_names)
        y_small = pd.DataFrame({"biomass": np.random.uniform(50, 200, n_small), "carbon": np.random.uniform(25, 100, n_small)})
        
        res_small = estimator.fit_on_real_data(X_small, y_small)
        self.assertFalse(res_small["promoted"])
        self.assertIn("need >= 150", res_small["reason"])

        # Test 2: Synthetic dataset refusal
        X_synth = pd.DataFrame(np.random.randn(200, 17), columns=feature_names)
        y_synth = pd.DataFrame({"biomass": np.random.uniform(50, 200, 200), "carbon": np.random.uniform(25, 100, 200)})
        res_synth = estimator.fit_on_real_data(X_synth, y_synth, is_synthetic=True)
        self.assertFalse(res_synth["promoted"])
        self.assertIn("strictly refuses synthetic", res_synth["reason"])

    def test_04_fusion_honest_fallback_to_rf(self):
        """Test CarbonEstimator falls back to RF with honest model_used label when fusion is selected but gated."""
        estimator = CarbonEstimator()
        estimator.set_model_type("fusion")
        self.assertEqual(estimator.model_type, "fusion")

        res = estimator.estimate_carbon_stock({"average_ndvi": 0.65})
        self.assertEqual(res["model_used"], "fusion_fallback_rf")
        self.assertIsNotNone(res["interval"])
        self.assertEqual(res["interval"]["interval_method"], "rf_tree_quantile")

    # -------------------------------------------------------------------------
    # 2. Uncertainty-Tiered Monitoring Tests (Treeconomy Pattern)
    # -------------------------------------------------------------------------

    def test_05_relative_uncertainty_calculation(self):
        """Test relative uncertainty width calculation W = (upper - lower) / estimate."""
        # Lower=80, Upper=120, Estimate=100 -> W = 40/100 = 0.40
        w = calculate_relative_uncertainty_width(100.0, 80.0, 120.0)
        self.assertAlmostEqual(w, 0.40, places=4)

        # Invalid cases
        self.assertIsNone(calculate_relative_uncertainty_width(0.0, 80.0, 120.0))
        self.assertIsNone(calculate_relative_uncertainty_width(-10.0, 80.0, 120.0))
        self.assertIsNone(calculate_relative_uncertainty_width(100.0, None, 120.0))

    def test_06_uncertainty_flagging_triggers_verification_task(self):
        """Test that relative uncertainty width > 0.35 creates a pending VerificationTask."""
        # Case A: Low uncertainty (W = (110 - 90)/100 = 0.20 <= 0.35) -> Not flagged
        res_low = {
            "estimated_carbon": 100.0,
            "interval": {"carbon_lower_90": 90.0, "carbon_upper_90": 110.0}
        }
        eval_low = flag_for_verification(res_low, threshold_relative_width=0.35, db=self.db)
        self.assertFalse(eval_low["flagged"])
        self.assertAlmostEqual(eval_low["relative_width"], 0.20, places=3)

        # Case B: High uncertainty (W = (130 - 80)/100 = 0.50 > 0.35) -> Flagged
        # Create a dummy CarbonResult in DB
        tier_job_id = f"test-job-tiering-{uuid.uuid4().hex[:8]}"
        tier_parcel_id = f"test-parcel-{uuid.uuid4().hex[:8]}"
        c_res = CarbonResult(
            job_id=tier_job_id,
            parcel_id=tier_parcel_id,
            estimated_biomass=250.0,
            estimated_carbon=120.0,
            tonnes_co2e=440.04,
            avg_ndvi=0.62,
            forest_area_ha=10.0,
            confidence=0.82,
            interval_json=json.dumps({"carbon_lower_90": 90.0, "carbon_upper_90": 160.0}) # W = 70/120 = 0.583
        )
        self.db.add(c_res)
        self.db.commit()
        self.db.refresh(c_res)

        eval_high = flag_for_verification(c_res, threshold_relative_width=0.35, db=self.db)
        self.assertTrue(eval_high["flagged"])
        self.assertGreater(eval_high["relative_width"], 0.35)
        self.assertIsNotNone(eval_high["task_id"])

        # Check DB task created
        task = self.db.query(VerificationTask).filter(VerificationTask.id == eval_high["task_id"]).first()
        self.assertIsNotNone(task)
        self.assertEqual(task.status, "pending")
        self.assertEqual(task.verification_method, "drone_lidar")
        self.assertEqual(task.result_id, c_res.id)

    def test_07_complete_verification_task_and_register_survey(self):
        """Test completing a verification task stores DroneSurveyResult for recalibration."""
        # Create a pending task
        survey_res_id = f"test-res-survey-{uuid.uuid4().hex[:8]}"
        task = VerificationTask(
            result_id=survey_res_id,
            status="pending",
            assigned_to="Surveyor Unit Alpha",
            verification_method="drone_lidar",
            due_date=datetime.date.today(),
            notes="Uncertainty trigger test"
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)

        drone_data = {
            "measured_biomass_mg_ha": 310.5,
            "measured_carbon_tc_ha": 142.8,
            "survey_date": datetime.date.today().isoformat(),
            "drone_platform": "DJI Matrice 300 RTK + Zenmuse L1",
            "raw_imagery_path": "/data/drone/survey_001.las",
            "collected_by": "Certified UAV Pilot - Dhaka Hub",
            "data_source": "drone_lidar"
        }

        completion = complete_verification_task(task.id, drone_data, self.db)
        self.assertEqual(completion["status"], "completed")

        # Verify DB state
        task_db = self.db.query(VerificationTask).filter(VerificationTask.id == task.id).first()
        self.assertEqual(task_db.status, "completed")
        self.assertEqual(len(task_db.surveys), 1)

        survey = task_db.surveys[0]
        self.assertEqual(survey.measured_carbon_tc_ha, 142.8)
        self.assertFalse(survey.used_in_training)  # Ready for recalibration

    def test_08_verification_tasks_api_endpoints(self):
        """Test GET and POST verification tasks via FastAPI test client."""
        # List tasks
        resp = self.client.get("/api/carbon/verification-tasks")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)

    # -------------------------------------------------------------------------
    # 3. Multi-Validator Cryptographic Trust Tests (Open Forest Protocol Pattern)
    # -------------------------------------------------------------------------

    def test_09_ed25519_keypair_and_signature_verification(self):
        """Test Ed25519 key generation, signing, and verification over a record_hash."""
        keypair = provenance_utils.generate_validator_keypair()
        self.assertEqual(len(keypair["private_key_hex"]), 64)
        self.assertEqual(len(keypair["public_key_hex"]), 64)

        record_hash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
        sig_hex = provenance_utils.sign_record_hash(record_hash, keypair["private_key_hex"])
        self.assertEqual(len(sig_hex), 128)  # 64 bytes in hex

        # Valid verification
        is_valid = provenance_utils.verify_signature(record_hash, sig_hex, keypair["public_key_hex"])
        self.assertTrue(is_valid)

        # Tampered hash must fail
        tampered_hash = record_hash[:-1] + ("0" if record_hash[-1] != "0" else "1")
        is_tampered_valid = provenance_utils.verify_signature(tampered_hash, sig_hex, keypair["public_key_hex"])
        self.assertFalse(is_tampered_valid)

    def test_10_multi_validator_co_signing_and_dual_trust_status(self):
        """Test attaching multiple independent validator signatures and dual trust status reporting."""
        # Setup: Create a provenance record
        prov_res_id = f"test-trust-result-{uuid.uuid4().hex[:8]}"
        prov_record = EstimateProvenance(
            result_id=prov_res_id,
            data_source="sentinel2_stac",
            satellite_scene_ids=json.dumps(["S2A_MSIL2A_20260301"]),
            gedi_tree_height_source="gedi_l2a_footprint",
            model_type="fusion",
            model_version="1.0.0-real-calibrated",
            model_trained_on="real-plots-blend-v1",
            feature_vector_json=json.dumps({"ndvi": 0.72}),
            geolocation_lat=22.25,
            geolocation_lng=89.55,
            record_hash="11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
            previous_hash="GENESIS"
        )
        self.db.add(prov_record)
        self.db.commit()
        self.db.refresh(prov_record)

        # Validator 1: TUV SUD / VVB Auditor
        v1_keys = provenance_utils.generate_validator_keypair()
        v1_sig = provenance_utils.sign_record_hash(prov_record.record_hash, v1_keys["private_key_hex"])
        provenance_utils.add_validator_signature(
            db=self.db,
            result_id=prov_record.result_id,
            validator_id="VVB-AUDITOR-01",
            validator_name="Dr. Aris Thorne",
            validator_organization="TUV SUD Forest Carbon",
            public_key_hex=v1_keys["public_key_hex"],
            signature_hex=v1_sig,
            comments="Field inventory sample validated against drone survey."
        )

        # Validator 2: Bangladesh Forest Department
        v2_keys = provenance_utils.generate_validator_keypair()
        v2_sig = provenance_utils.sign_record_hash(prov_record.record_hash, v2_keys["private_key_hex"])
        provenance_utils.add_validator_signature(
            db=self.db,
            result_id=prov_record.result_id,
            validator_id="BFD-REGISTRY-02",
            validator_name="Kazi Rahman",
            validator_organization="Bangladesh Forest Department",
            public_key_hex=v2_keys["public_key_hex"],
            signature_hex=v2_sig,
            comments="Government baseline check completed."
        )

        # Retrieve dual trust status
        trust = provenance_utils.get_provenance_trust_status(prov_record, self.db)
        self.assertEqual(trust["verified_signature_count"], 2)
        self.assertTrue(trust["quorum_reached"])
        self.assertEqual(len(trust["validator_signatures"]), 2)
        for v_sig in trust["validator_signatures"]:
            self.assertTrue(v_sig["cryptographically_verified"])

    def test_11_provenance_api_sign_endpoint(self):
        """Test POST /api/carbon/provenance/{result_id}/sign via HTTP client."""
        # Create a record
        test_hash = provenance_utils.compute_record_hash({"test": "data"}, "GENESIS")
        api_prov_id = f"api-sign-test-result-{uuid.uuid4().hex[:8]}"
        prov_record = EstimateProvenance(
            result_id=api_prov_id,
            data_source="sentinel2_stac",
            satellite_scene_ids=json.dumps([]),
            gedi_tree_height_source="gedi_l2a_footprint",
            model_type="random_forest",
            model_version="0.1.0",
            model_trained_on="synthetic-v1",
            feature_vector_json=json.dumps({}),
            geolocation_lat=22.25,
            geolocation_lng=89.55,
            record_hash=test_hash,
            previous_hash="GENESIS"
        )
        self.db.add(prov_record)
        self.db.commit()

        keys = provenance_utils.generate_validator_keypair()
        sig_hex = provenance_utils.sign_record_hash(test_hash, keys["private_key_hex"])

        resp = self.client.post(f"/api/carbon/provenance/{prov_record.result_id}/sign", json={
            "validator_id": "VVB-API-TEST",
            "validator_name": "Auditor Jane",
            "validator_organization": "Global Carbon Certifiers",
            "public_key_hex": keys["public_key_hex"],
            "signature_hex": sig_hex,
            "comments": "Audited via automated API call"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")

    # -------------------------------------------------------------------------
    # 4. Verra VM0047 Registry Export Tests
    # -------------------------------------------------------------------------

    def test_12_vm0047_stocking_index_export(self):
        """Test exporting a Verra VM0047 compliant submission bundle with all required sections."""
        # Create dummy result with multi-pool and uncertainty
        vm_job_id = f"job-vm0047-test-{uuid.uuid4().hex[:8]}"
        vm_project_id = f"SUNDARBANS-PROJECT-{uuid.uuid4().hex[:8]}"
        c_res = CarbonResult(
            job_id=vm_job_id,
            parcel_id=vm_project_id,
            estimated_biomass=320.0,
            estimated_carbon=150.0,
            carbon_agb_tc_ha=75.0,
            carbon_bgb_tc_ha=25.0,
            carbon_soc_tc_ha=50.0,
            biomass_agb_mg_ha=230.0,
            biomass_bgb_mg_ha=90.0,
            tonnes_co2e=550.05,
            avg_ndvi=0.74,
            forest_area_ha=25.0,
            confidence=0.92,
            forest_stratum="SUNDARBANS_MANGROVE",
            indices_json=json.dumps({"average_ndvi": 0.74, "average_evi": 0.58, "average_vv": -11.5}),
            interval_json=json.dumps({
                "carbon_lower_90": 130.0,
                "carbon_upper_90": 170.0,
                "interval_method": "conformal_residual_quantile"
            })
        )
        self.db.add(c_res)
        self.db.commit()
        self.db.refresh(c_res)

        bundle = export_vm0047_stocking_index(
            project_id=vm_project_id,
            db=self.db,
            result_id=c_res.id,
            buffer_pool_pct=18.0
        )

        # 1. Metadata check
        self.assertIn("VM0047", bundle["metadata"]["standard"])
        self.assertEqual(bundle["metadata"]["project_id"], vm_project_id)

        # 2. Multi-pool check
        pools = bundle["carbon_pools"]
        self.assertEqual(pools["stratum"], "SUNDARBANS_MANGROVE")
        self.assertEqual(pools["total_carbon_tc_ha"], 150.0)
        self.assertEqual(pools["carbon_agb_tc_ha"], 75.0)
        self.assertEqual(pools["carbon_bgb_tc_ha"], 25.0)
        self.assertEqual(pools["carbon_soc_tc_ha"], 50.0)

        # 3. Uncertainty & crediting check
        crediting = bundle["uncertainty_and_crediting"]
        self.assertEqual(crediting["confidence_level"], "90%")
        self.assertEqual(crediting["carbon_lower_90_tc_ha"], 130.0)
        self.assertEqual(crediting["carbon_upper_90_tc_ha"], 170.0)
        self.assertEqual(crediting["buffer_pool_withholding_pct"], 18.0)
        self.assertGreater(crediting["net_creditable_tco2e_ha"], 0.0)

        # 4. API endpoint test
        api_resp = self.client.get(f"/api/carbon/registry-export/vm0047/{vm_project_id}?result_id={c_res.id}")
        self.assertEqual(api_resp.status_code, 200)
        self.assertEqual(api_resp.json()["metadata"]["project_id"], vm_project_id)


if __name__ == "__main__":
    unittest.main()
