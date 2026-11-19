"""
Automated Test Suite for dMRV Provenance Extension
Tests:
  1. Prediction Intervals (90% nominal spread via rf_tree_quantile)
  2. Ground-Truth Plot Ingestion & Recalibration Staging/Guard
  3. Immutable Hash-Chained Provenance Log & Cryptographic Verification
  4. Chain Tamper-Detection
  5. Honest Model Metadata
"""

import os
import sys
import json
import unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

import _isolated_db  # noqa: F401,E402  (temporary database, never backend/db.sqlite3)
from dmrv_harness import setup_dmrv_test_tenants  # noqa: E402
from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import CarbonResult, GroundTruthPlot, EstimateProvenance
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring import provenance as provenance_utils
from inference.carbon_monitoring.calibration import run_recalibration
from inference.carbon_monitoring.estimator import CarbonEstimator


class TestDMRVProvenanceExtension(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.tenants = setup_dmrv_test_tenants("prov")
        cls.headers = cls.tenants["owner_a"]
        cls.app = FastAPI(title="dMRV Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_honest_model_metadata(self):
        """Phase 3.3: Confirm active model settings surface honest synthetic metadata."""
        response = self.client.get("/api/carbon/settings", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("synthetic", data.get("model_version", "").lower() + data.get("model_trained_on", "").lower())
        self.assertEqual(data.get("model_trained_on"), "synthetic-v1")
        self.assertEqual(data.get("active_model"), "random_forest")

    def test_02_ground_truth_submission_and_listing(self):
        """Phase 3 Part (b): Submit and list ground-truth field measurements."""
        payload = {
            "plot_name": "Sundarbans Plot Sector 4B",
            "location_lat": 22.30,
            "location_lng": 89.55,
            "plot_radius_m": 15.0,
            "measured_biomass_mg_ha": 210.5,
            "measured_carbon_tc_ha": 99.8,
            "measurement_date": "2026-03-15",
            "measurement_method": "allometric_field_inventory",
            "collected_by": "Bangladesh Forest Dept Field Team",
            "notes": "Healthy dense mangrove patch with mature Sundari trees."
        }
        resp = self.client.post("/api/carbon/ground-truth", data=payload, headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        created = resp.json()
        self.assertEqual(created["status"], "recorded")
        self.assertFalse(created["used_in_training"])
        plot_id = created["id"]

        # Verify listing
        list_resp = self.client.get("/api/carbon/ground-truth", headers=self.headers)
        self.assertEqual(list_resp.status_code, 200)
        plots = list_resp.json()
        matching = [p for p in plots if p["id"] == plot_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["plot_name"], "Sundarbans Plot Sector 4B")

    def test_03_recalibration_pipeline_guard(self):
        """Phase 3 Part (b): Confirm recalibration refuses to promote when below sample threshold or on simulated data."""
        resp = self.client.post("/api/carbon/recalibrate", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        res = resp.json()
        self.assertFalse(res.get("promoted"))
        self.assertIn("reason", res)
        # Verify model remains uncorrupted
        settings = self.client.get("/api/carbon/settings", headers=self.headers).json()
        self.assertEqual(settings.get("model_trained_on"), "synthetic-v1")

    def test_04_analysis_prediction_interval_and_provenance(self):
        """Phase 3.1: Run carbon analysis and verify 90% prediction intervals + provenance record."""
        sundarbans_polygon = json.dumps([
            [22.25, 89.50],
            [22.35, 89.50],
            [22.35, 89.60],
            [22.25, 89.60],
            [22.25, 89.50]
        ])
        analyze_payload = {
            "polygon_geojson": sundarbans_polygon,
            "start_date": "2026-01-01",
            "end_date": "2026-05-01",
            "analysis_type": "carbon_heatmap",
            "project_name": "Sundarbans Mangrove Conservation Unit"
        }
        # In TestClient, BackgroundTasks are executed synchronously
        analyze_resp = self.client.post("/api/carbon/analyze", data=analyze_payload, headers=self.headers)
        self.assertEqual(analyze_resp.status_code, 200)
        job_id = analyze_resp.json()["job_id"]

        # Fetch result
        result_row = self.db.query(CarbonResult).filter(CarbonResult.job_id == job_id).first()
        self.assertIsNotNone(result_row, "CarbonResult should have been written by background task.")
        result_id = result_row.id

        # Verify endpoint GET /api/carbon/results/{result_id}
        res_resp = self.client.get(f"/api/carbon/results/{result_id}", headers=self.headers)
        self.assertEqual(res_resp.status_code, 200)
        res_data = res_resp.json()

        # Check prediction interval fields
        self.assertIsNotNone(res_data["biomass_lower_90"])
        self.assertIsNotNone(res_data["biomass_upper_90"])
        self.assertIsNotNone(res_data["carbon_lower_90"])
        self.assertIsNotNone(res_data["carbon_upper_90"])
        self.assertEqual(res_data["interval_method"], "rf_tree_quantile")

        # Nominal bounds check: lower <= upper
        self.assertLessEqual(res_data["biomass_lower_90"], res_data["biomass_upper_90"])
        self.assertLessEqual(res_data["carbon_lower_90"], res_data["carbon_upper_90"])

        # Verify provenance record via GET /api/carbon/provenance/{result_id}
        prov_resp = self.client.get(f"/api/carbon/provenance/{result_id}", headers=self.headers)
        self.assertEqual(prov_resp.status_code, 200)
        prov_data = prov_resp.json()

        self.assertEqual(prov_data["result_id"], result_id)
        self.assertTrue(prov_data["hash_verified"], "Cryptographic hash must verify against content and previous hash.")
        self.assertIn(prov_data["data_source"], ["gee_live", "simulated", "stac_live"])
        self.assertEqual(prov_data["model_trained_on"], "synthetic-v1")
        self.assertIn(prov_data["gedi_tree_height_source"], ["formula_estimate_not_gedi_l2b", "gedi_l2b_spatial_allometry"])
        self.assertTrue(len(prov_data["record_hash"]) == 64, "SHA-256 hash must be 64 characters hex.")

    def test_05_verify_provenance_chain_endpoint(self):
        """Phase 3.2: Verify full provenance chain validity via API."""
        resp = self.client.get("/api/carbon/provenance/verify-chain", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        chain_data = resp.json()
        self.assertTrue(chain_data["valid"])
        self.assertGreater(chain_data["records_checked"], 0)

    def test_06_chain_tamper_detection(self):
        """Phase 3 / Arch (c): Verify that altering any historical record breaks the chain."""
        first_record = self.db.query(EstimateProvenance).order_by(EstimateProvenance.created_at.asc()).first()
        self.assertIsNotNone(first_record)
        
        original_lat = first_record.geolocation_lat
        try:
            # Simulate tamper: alter geolocation latitude
            first_record.geolocation_lat = original_lat + 1.5
            self.db.commit()

            # Chain verification must now FAIL
            tampered_result = provenance_utils.verify_chain(self.db)
            self.assertFalse(tampered_result["valid"])
            self.assertEqual(tampered_result["broken_at"], first_record.id)
            self.assertEqual(tampered_result["reason"], "record_hash does not match content")

            # API endpoint must also report invalid
            api_resp = self.client.get("/api/carbon/provenance/verify-chain", headers=self.headers)
            self.assertFalse(api_resp.json()["valid"])
        finally:
            # Revert tamper to restore pristine state
            first_record.geolocation_lat = original_lat
            self.db.commit()

        # Confirm restored valid state
        restored_result = provenance_utils.verify_chain(self.db)
        self.assertTrue(restored_result["valid"])

    def test_07_quantification_tamper_detected_by_provenance_hash(self):
        """P0: Mutating CarbonResult credit/biomass numbers in SQL must break provenance verification."""
        prov = self.db.query(EstimateProvenance).filter(EstimateProvenance.quantification_snapshot_json.isnot(None)).first()
        self.assertIsNotNone(prov)
        c_res = self.db.query(CarbonResult).filter(CarbonResult.id == prov.result_id).first()
        self.assertIsNotNone(c_res)
        orig_co2 = c_res.tonnes_co2e
        try:
            c_res.tonnes_co2e = orig_co2 + 9999.0
            self.db.commit()
            chain = provenance_utils.verify_chain(self.db)
            self.assertFalse(chain["valid"])
            self.assertIn("mutated", chain["reason"])
            trust = provenance_utils.get_provenance_trust_status(prov, self.db)
            self.assertFalse(trust["hash_chain_intact"])
        finally:
            c_res.tonnes_co2e = orig_co2
            self.db.commit()

    def test_08_auth_rbac_and_tenant_isolation_on_dmrv_endpoints(self):
        """P0: Unauthenticated callers get 401, RBAC blocks unauthorized mutations, and cross-tenant reads get 404."""
        self.assertEqual(self.client.get("/api/carbon/dashboard").status_code, 401)
        self.assertEqual(self.client.get("/api/carbon/settings").status_code, 401)
        self.assertEqual(self.client.post("/api/carbon/recalibrate").status_code, 401)
        self.assertIn(self.client.post("/api/carbon/provenance/generate-keys").status_code, (404, 405))

        # Viewer cannot write; contributor cannot run admin recalibration or settings
        self.assertEqual(
            self.client.post("/api/carbon/recalibrate", headers=self.tenants["contrib_a"]).status_code, 403
        )
        self.assertEqual(
            self.client.post("/api/carbon/settings", json={"model_type": "xgboost"}, headers=self.tenants["contrib_a"]).status_code,
            403,
        )
        self.assertEqual(
            self.client.post(
                "/api/carbon/ground-truth",
                data={
                    "plot_name": "X", "location_lat": 22.0, "location_lng": 89.0,
                    "measured_biomass_mg_ha": 10.0, "measured_carbon_tc_ha": 5.0,
                    "measurement_date": "2026-01-01", "measurement_method": "field",
                    "collected_by": "viewer",
                },
                headers=self.tenants["viewer_a"],
            ).status_code,
            403,
        )

        # Cross-tenant isolation: Org B cannot read Org A's result or provenance
        any_res = self.db.query(CarbonResult).first()
        self.assertIsNotNone(any_res)
        self.assertEqual(
            self.client.get(f"/api/carbon/results/{any_res.id}", headers=self.tenants["owner_b"]).status_code,
            404,
        )
        self.assertEqual(
            self.client.get(f"/api/carbon/provenance/{any_res.id}", headers=self.tenants["owner_b"]).status_code,
            404,
        )


if __name__ == "__main__":
    unittest.main()
