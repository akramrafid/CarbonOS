import os
import sys
import unittest
import json
import numpy as np
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import AnalysisJob, CarbonResult, BaselineAssessment
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring.baseline import (
    SyntheticControlEngine,
    LeakageMonitoringEngine,
    RiskBufferCalculator,
    run_dynamic_baseline_assessment
)


class TestDMRVDynamicBaseline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV Baseline Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_synthetic_control_optimization_and_weights(self):
        """Verify Abadie et al. convex optimization yields valid weights summing to 1.0."""
        engine = SyntheticControlEngine(stratum="SUNDARBANS_MANGROVE")
        polygon_geojson = json.dumps([[22.25, 89.50], [22.35, 89.50], [22.35, 89.60], [22.25, 89.60]])
        
        donors_data = engine.generate_candidate_donors(polygon_geojson, n_donors=8, years_pre=5, years_post=3)
        self.assertEqual(donors_data["donor_matrix_pre"].shape, (5, 8))
        self.assertEqual(donors_data["donor_matrix_post"].shape, (3, 8))
        
        weights, pre_rmse = engine.fit_synthetic_weights(
            donors_data["project_pre"],
            donors_data["donor_matrix_pre"]
        )

        # Mathematical constraints of synthetic control: w_j >= 0, sum(w) = 1.0
        self.assertTrue(np.all(weights >= -1e-6), "All synthetic weights must be non-negative.")
        self.assertAlmostEqual(float(np.sum(weights)), 1.0, places=5, msg="Synthetic weights must sum to 1.0.")
        self.assertLess(pre_rmse, 6.0, "Pre-treatment fit RMSE should be small.")

        # Counterfactual projection
        counterfactual = engine.compute_counterfactual(donors_data["donor_matrix_post"], weights)
        self.assertEqual(len(counterfactual), 3)
        self.assertTrue(np.all(counterfactual > 50.0), "Counterfactual carbon stock should be realistic.")

    def test_02_leakage_belt_buffer_and_loss_deduction(self):
        """Verify 10km leakage belt buffer calculation and excess deforestation deduction."""
        polygon = json.dumps([[22.20, 89.45], [22.30, 89.45], [22.30, 89.55], [22.20, 89.55]])
        
        # Test belt area geometry
        belt_geo = LeakageMonitoringEngine.calculate_leakage_belt_geometry(polygon, buffer_km=10.0)
        self.assertEqual(belt_geo["buffer_km"], 10.0)
        self.assertGreater(belt_geo["leakage_belt_area_ha"], 1000.0)

        # Scenario A: No leakage (leakage belt loss <= regional control loss)
        leak_a = LeakageMonitoringEngine.assess_leakage(
            leakage_belt_loss_rate=0.012,
            regional_control_loss_rate=0.016,
            gross_additionality_tco2e=50000.0
        )
        self.assertEqual(leak_a["excess_loss_rate"], 0.0)
        self.assertEqual(leak_a["leakage_deduction_tco2e"], 0.0)
        self.assertEqual(leak_a["leakage_risk_rating"], "LOW")

        # Scenario B: High leakage displacement into 10km buffer
        leak_b = LeakageMonitoringEngine.assess_leakage(
            leakage_belt_loss_rate=0.045,
            regional_control_loss_rate=0.015,
            gross_additionality_tco2e=100000.0
        )
        self.assertGreater(leak_b["excess_loss_rate"], 0.02)
        self.assertGreater(leak_b["leakage_deduction_tco2e"], 0.0)
        self.assertEqual(leak_b["leakage_risk_rating"], "MODERATE")

    def test_03_non_permanence_risk_buffer_withholding(self):
        """Verify Verra AFOLU non-permanence risk rating and pooled buffer withholding."""
        # Mangrove has higher cyclone surge exposure
        mangrove_buffer = RiskBufferCalculator.calculate_risk_buffer("SUNDARBANS_MANGROVE")
        self.assertEqual(mangrove_buffer["total_buffer_pct"], 0.18)
        self.assertGreater(mangrove_buffer["cyclone_storm_surge_risk"], 0.05)

        # Inland agroforestry
        agro_buffer = RiskBufferCalculator.calculate_risk_buffer("COASTAL_AGROFORESTRY")
        self.assertEqual(agro_buffer["total_buffer_pct"], 0.12)

    def test_04_full_dynamic_baseline_workflow_additionality(self):
        """Verify end-to-end dynamic baseline assessment and carbon credit balances."""
        poly = json.dumps([[22.25, 89.50], [22.35, 89.50], [22.35, 89.60], [22.25, 89.60]])
        
        report = run_dynamic_baseline_assessment(
            job_id="TEST_JOB_BASELINE_01",
            polygon_geojson=poly,
            forest_area_ha=1000.0,
            project_carbon_tc_ha=135.0,
            stratum="SUNDARBANS_MANGROVE",
            leakage_belt_loss_rate=0.014,
            regional_control_loss_rate=0.017
        )

        self.assertEqual(report["baseline_method"], "synthetic_control_abadie")
        self.assertGreater(report["active_donor_count"], 0)
        self.assertGreater(report["gross_additionality_tco2e"], 0.0)
        
        # Verify carbon balance equation:
        # Net Creditable = (Gross Additionality - Leakage) - Buffer Withheld
        net_after_leakage = report["gross_additionality_tco2e"] - report["leakage_deduction_tco2e"]
        expected_net = round(net_after_leakage - report["buffer_withheld_tco2e"], 2)
        self.assertAlmostEqual(report["net_creditable_tco2e"], expected_net, places=1)

    def test_05_api_baseline_persistence_and_endpoints(self):
        """Test GET /api/carbon/baseline/{job_id} and POST /api/carbon/baseline/assess."""
        sundarbans_poly = json.dumps([[22.25, 89.50], [22.35, 89.50], [22.35, 89.60], [22.25, 89.60]])
        
        # 1. Direct simulation endpoint
        direct_payload = {
            "polygon_geojson": sundarbans_poly,
            "forest_area_ha": 500.0,
            "project_carbon_tc_ha": 140.0,
            "stratum": "SUNDARBANS_MANGROVE",
            "leakage_belt_loss_rate": 0.015,
            "regional_control_loss_rate": 0.018
        }
        direct_resp = self.client.post("/api/carbon/baseline/assess", data=direct_payload)
        self.assertEqual(direct_resp.status_code, 200)
        direct_data = direct_resp.json()
        self.assertIn("donor_weights", direct_data)
        self.assertIn("net_creditable_tco2e", direct_data)

        # 2. End-to-end analysis job pipeline persistence
        analyze_payload = {
            "polygon_geojson": sundarbans_poly,
            "start_date": "2026-01-01",
            "end_date": "2026-05-01",
            "analysis_type": "carbon_heatmap",
            "project_name": "Sundarbans Baseline Pipeline Test"
        }
        analyze_resp = self.client.post("/api/carbon/analyze", data=analyze_payload)
        self.assertEqual(analyze_resp.status_code, 200)
        job_id = analyze_resp.json()["job_id"]

        # Fetch baseline via API
        base_resp = self.client.get(f"/api/carbon/baseline/{job_id}")
        self.assertEqual(base_resp.status_code, 200)
        base_data = base_resp.json()

        self.assertEqual(base_data["job_id"], job_id)
        self.assertIn("donor_weights", base_data)
        self.assertIn("trajectory", base_data)
        self.assertGreater(base_data["net_creditable_tco2e"], 0.0)
        self.assertEqual(base_data["buffer_deduction_pct"], 0.18)


if __name__ == "__main__":
    unittest.main()
