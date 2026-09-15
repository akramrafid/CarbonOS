import os
import sys
import unittest
import json
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import CarbonResult, AnalysisJob
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring.estimator import (
    CarbonEstimator,
    determine_stratum,
    calculate_multi_pool,
    STRATUM_ALLOMETRY
)


class TestDMRVAllometryMultiPool(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV Allometry Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)
        cls.estimator = CarbonEstimator()

    def setUp(self):
        self.db: Session = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_stratum_classification_boundaries(self):
        """Test geographic boundary classification across Bangladesh ecosystems."""
        # Sundarbans mangrove delta
        self.assertEqual(determine_stratum(22.25, 89.50), "SUNDARBANS_MANGROVE")
        self.assertEqual(determine_stratum(21.80, 89.10), "SUNDARBANS_MANGROVE")
        
        # Chittagong Hill Tracts (CHT)
        self.assertEqual(determine_stratum(22.30, 92.20), "TROPICAL_MOIST_FOREST")
        # Sylhet northeast rainforest belt
        self.assertEqual(determine_stratum(24.50, 91.85), "TROPICAL_MOIST_FOREST")
        
        # Coastal plain / agricultural inland
        self.assertEqual(determine_stratum(23.81, 90.41), "COASTAL_AGROFORESTRY")
        self.assertEqual(determine_stratum(24.37, 88.60), "COASTAL_AGROFORESTRY")

    def test_02_sundarbans_mangrove_allometry_and_soc(self):
        """Test IPCC Tier-3 / Verra VM0047 mangrove equations (R=0.49, deep mud SOC)."""
        biomass_agb = 200.0  # Mg/ha
        carbon_agb = 94.0    # tC/ha (0.47 * 200)
        ndvi = 0.72

        pool = calculate_multi_pool(
            biomass_agb=biomass_agb,
            carbon_agb=carbon_agb,
            ndvi=ndvi,
            stratum="SUNDARBANS_MANGROVE",
            soc_depth_cm=100.0
        )

        # Root:Shoot ratio for Sundarbans pneumatophores is 0.49
        self.assertEqual(pool["root_shoot_ratio"], 0.49)
        self.assertAlmostEqual(pool["biomass_bgb_mg_ha"], 200.0 * 0.49, places=2)
        self.assertAlmostEqual(pool["carbon_bgb_tc_ha"], 94.0 * 0.49, places=2)
        
        # Mangrove deep core delta mud SOC must exceed 150 tC/ha down to 100cm
        self.assertGreater(pool["carbon_soc_tc_ha"], 150.0)
        self.assertLess(pool["carbon_soc_tc_ha"], 300.0)

        # Total carbon must equal AGB + BGB + SOC
        expected_total_c = pool["carbon_agb_tc_ha"] + pool["carbon_bgb_tc_ha"] + pool["carbon_soc_tc_ha"]
        self.assertAlmostEqual(pool["carbon_total_tc_ha"], round(expected_total_c, 2), places=1)

    def test_03_tropical_moist_forest_and_agroforestry_pools(self):
        """Test allometric pool ratios for Tropical Moist Forest and Agroforestry."""
        biomass_agb = 150.0
        carbon_agb = 70.5
        ndvi = 0.65

        # Tropical moist forest
        t_pool = calculate_multi_pool(biomass_agb, carbon_agb, ndvi, stratum="TROPICAL_MOIST_FOREST")
        self.assertEqual(t_pool["root_shoot_ratio"], 0.235)
        self.assertAlmostEqual(t_pool["carbon_bgb_tc_ha"], round(70.5 * 0.235, 2), places=1)

        # Coastal agroforestry
        a_pool = calculate_multi_pool(biomass_agb, carbon_agb, ndvi, stratum="COASTAL_AGROFORESTRY")
        self.assertEqual(a_pool["root_shoot_ratio"], 0.28)
        self.assertAlmostEqual(a_pool["carbon_bgb_tc_ha"], round(70.5 * 0.28, 2), places=1)

    def test_04_estimator_multi_pool_integration_and_intervals(self):
        """Verify CarbonEstimator outputs all multi-pool fields with consistent intervals."""
        sample_indices = {
            "average_ndvi": 0.70,
            "average_evi": 0.55,
            "average_ndwi": -0.15,
            "average_savi": 0.50,
            "average_ndbi": -0.35,
            "average_vv": -11.5,
            "average_vh": -17.8,
            "average_ratio": 6.3,
            "average_tree_height": 16.5
        }

        # Estimate with Sundarbans location
        est_result = self.estimator.estimate_carbon_stock(sample_indices, lat=22.25, lng=89.55)
        
        self.assertEqual(est_result["forest_stratum"], "SUNDARBANS_MANGROVE")
        self.assertIn("carbon_agb_tc_ha", est_result)
        self.assertIn("carbon_bgb_tc_ha", est_result)
        self.assertIn("carbon_soc_tc_ha", est_result)
        self.assertIn("biomass_agb_mg_ha", est_result)
        self.assertIn("biomass_bgb_mg_ha", est_result)
        
        # Bounds check
        self.assertGreater(est_result["carbon_soc_tc_ha"], 100.0)
        self.assertGreater(est_result["estimated_carbon_per_ha"], est_result["carbon_agb_tc_ha"])
        
        # Uncertainty intervals
        interval = est_result["interval"]
        self.assertIsNotNone(interval)
        self.assertLessEqual(interval["carbon_lower_90"], interval["carbon_upper_90"])
        self.assertLessEqual(interval["biomass_lower_90"], interval["biomass_upper_90"])

    def test_05_api_multi_pool_persistence_and_serialization(self):
        """Verify API persists multi-pool columns and returns them via /api/carbon/results/{id}."""
        sundarbans_polygon = json.dumps([
            [22.25, 89.50],
            [22.35, 89.50],
            [22.35, 89.60],
            [22.25, 89.60],
            [22.25, 89.50]
        ])
        payload = {
            "polygon_geojson": sundarbans_polygon,
            "start_date": "2026-01-01",
            "end_date": "2026-05-01",
            "analysis_type": "carbon_heatmap",
            "project_name": "Sundarbans Tier-3 Multi-Pool Test"
        }
        resp = self.client.post("/api/carbon/analyze", data=payload)
        self.assertEqual(resp.status_code, 200)
        job_id = resp.json()["job_id"]

        # Fetch result from DB
        result_row = self.db.query(CarbonResult).filter(CarbonResult.job_id == job_id).first()
        self.assertIsNotNone(result_row)
        self.assertEqual(result_row.forest_stratum, "SUNDARBANS_MANGROVE")
        self.assertIsNotNone(result_row.carbon_agb_tc_ha)
        self.assertIsNotNone(result_row.carbon_bgb_tc_ha)
        self.assertIsNotNone(result_row.carbon_soc_tc_ha)

        # Fetch via API endpoint
        res_resp = self.client.get(f"/api/carbon/results/{result_row.id}")
        self.assertEqual(res_resp.status_code, 200)
        res_data = res_resp.json()

        self.assertEqual(res_data["forest_stratum"], "SUNDARBANS_MANGROVE")
        self.assertEqual(res_data["carbon_agb_tc_ha"], result_row.carbon_agb_tc_ha)
        self.assertEqual(res_data["carbon_bgb_tc_ha"], result_row.carbon_bgb_tc_ha)
        self.assertEqual(res_data["carbon_soc_tc_ha"], result_row.carbon_soc_tc_ha)


if __name__ == "__main__":
    unittest.main()
