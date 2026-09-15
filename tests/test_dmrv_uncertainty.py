import os
import sys
import unittest
import numpy as np
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import AnalysisJob, CarbonResult
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring.uncertainty import (
    ConformalUncertaintyEngine,
    VerraPrecisionDeductionEngine,
    compute_conformal_verra_assessment
)


class TestDMRVUncertaintyEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV Uncertainty Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_conformal_quantile_finite_sample_correction(self):
        """Verify split conformal prediction computes finite-sample corrected quantile."""
        engine = ConformalUncertaintyEngine(alpha=0.10)
        self.assertEqual(engine.coverage_target, 0.90)

        # 100 known residuals
        np.random.seed(42)
        residuals = np.random.exponential(scale=10.0, size=100)
        q_hat = engine.compute_conformal_quantile(residuals)

        # Target conformal level: ceil(101 * 0.90) / 100 = 91 / 100 = 0.91
        expected_level = min(1.0, np.ceil(101 * 0.90) / 100)
        expected_q = float(np.quantile(residuals, expected_level))
        self.assertAlmostEqual(q_hat, expected_q, places=2)
        self.assertGreater(q_hat, 0.0)

        # Empty array fallback
        empty_q = engine.compute_conformal_quantile(np.array([]))
        self.assertEqual(empty_q, 15.0)

    def test_02_conformal_interval_coverage_properties(self):
        """Verify conformal interval [y_hat - q, y_hat + q] satisfies non-negative lower bound."""
        engine = ConformalUncertaintyEngine(alpha=0.10)
        point_est = 50.0
        q_hat = 12.5

        lower, upper, half_width = engine.predict_conformal_interval(point_est, q_hat)
        self.assertEqual(lower, 37.5)
        self.assertEqual(upper, 62.5)
        self.assertEqual(half_width, 12.5)

        # Test truncation at zero for small point estimate
        low_pt = 8.0
        lower_trunc, upper_trunc, _ = engine.predict_conformal_interval(low_pt, q_hat)
        self.assertEqual(lower_trunc, 0.0)
        self.assertEqual(upper_trunc, 20.5)

    def test_03_verra_precision_deduction_thresholds(self):
        """Verify Verra VM0047 precision discount rules (RME <= 15% vs RME > 15%)."""
        engine = VerraPrecisionDeductionEngine()

        # Scenario A: Tight interval (RME = 10% <= 15% allowable) -> 0% discount
        res_tight = engine.calculate_verra_discount(
            point_estimate=1000.0,
            interval_lower=900.0,
            interval_upper=1100.0,
            allowable_error=0.15
        )
        self.assertEqual(res_tight["half_width"], 100.0)
        self.assertAlmostEqual(res_tight["relative_margin_of_error"], 0.10, places=3)
        self.assertEqual(res_tight["precision_discount_pct"], 0.0)
        self.assertEqual(res_tight["conservative_estimate"], 1000.0)
        self.assertFalse(res_tight["is_discount_applied"])

        # Scenario B: Moderate uncertainty (RME = 22% > 15% allowable) -> 7% deduction
        res_mod = engine.calculate_verra_discount(
            point_estimate=1000.0,
            interval_lower=780.0,
            interval_upper=1220.0,
            allowable_error=0.15
        )
        self.assertEqual(res_mod["half_width"], 220.0)
        self.assertAlmostEqual(res_mod["relative_margin_of_error"], 0.22, places=3)
        self.assertAlmostEqual(res_mod["precision_discount_pct"], 0.07, places=3)
        self.assertAlmostEqual(res_mod["conservative_estimate"], 930.0, places=1)
        self.assertTrue(res_mod["is_discount_applied"])

        # Scenario C: Severe uncertainty (RME = 80%) -> Capped at 50% discount
        res_severe = engine.calculate_verra_discount(
            point_estimate=1000.0,
            interval_lower=200.0,
            interval_upper=1800.0,
            allowable_error=0.15
        )
        self.assertAlmostEqual(res_severe["precision_discount_pct"], 0.50, places=3)
        self.assertEqual(res_severe["conservative_estimate"], 500.0)

    def test_04_compute_conformal_verra_assessment_integration(self):
        """Verify full end-to-end conformal uncertainty + Verra precision evaluation."""
        eval_res = compute_conformal_verra_assessment(
            net_creditable_tco2e=5000.0,
            carbon_lower_90=160.0,
            carbon_upper_90=220.0,
            estimated_carbon_tc_ha=190.0,
            db=self.db,
            allowable_error=0.15
        )

        self.assertEqual(eval_res["conformal_method"], "split_conformal_quantile_regression")
        self.assertEqual(eval_res["confidence_level_pct"], 90.0)
        self.assertEqual(eval_res["net_creditable_point_tco2e"], 5000.0)
        self.assertIn("conformal_lower_90", eval_res)
        self.assertIn("conformal_upper_90", eval_res)
        self.assertIn("relative_margin_of_error", eval_res)
        self.assertIn("conservative_creditable_tco2e", eval_res)
        self.assertLessEqual(eval_res["conservative_creditable_tco2e"], 5000.0)

    def test_05_fastapi_uncertainty_endpoints(self):
        """Verify GET /api/carbon/uncertainty/{result_id} and POST /api/carbon/uncertainty/assess."""
        # 1. Direct simulation endpoint
        payload = {
            "net_creditable_tco2e": 4200.0,
            "carbon_lower_90": 150.0,
            "carbon_upper_90": 210.0,
            "estimated_carbon_tc_ha": 180.0,
            "allowable_error": 0.15
        }
        res_post = self.client.post("/api/carbon/uncertainty/assess", data=payload)
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.json()
        self.assertEqual(data_post["net_creditable_point_tco2e"], 4200.0)
        self.assertIn("relative_margin_of_error", data_post)
        self.assertIn("conservative_creditable_tco2e", data_post)

        import datetime
        # 2. Database result lookup
        # Create a test job and result
        job = AnalysisJob(
            status="completed",
            polygon_geojson="[[22.2, 89.5], [22.3, 89.6]]",
            analysis_type="ndvi",
            start_date=datetime.date(2023, 1, 1),
            end_date=datetime.date(2023, 12, 31)
        )
        self.db.add(job)
        self.db.commit()

        result = CarbonResult(
            job_id=job.id,
            estimated_biomass=240.0,
            estimated_carbon=120.0,
            tonnes_co2e=1500.0,
            avg_ndvi=0.76,
            forest_area_ha=25.0,
            confidence=0.92,
            satellite_sources="Sentinel-2 + Sentinel-1 SAR RTC",
            carbon_lower_90=105.0,
            carbon_upper_90=135.0,
            forest_stratum="SUNDARBANS_MANGROVE",
            relative_margin_of_error=0.125,
            verra_precision_discount_pct=0.0,
            conservative_creditable_tco2e=1500.0
        )
        self.db.add(result)
        self.db.commit()

        res_get = self.client.get(f"/api/carbon/uncertainty/{result.id}")
        self.assertEqual(res_get.status_code, 200)
        data_get = res_get.json()
        self.assertEqual(data_get["result_id"], result.id)
        self.assertEqual(data_get["job_id"], job.id)
        self.assertEqual(data_get["verra_compliance_standard"], "Verra VM0047 Section 8.4 & VCS Standard v4.5")
        self.assertIn("relative_margin_of_error", data_get)


if __name__ == "__main__":
    unittest.main()
