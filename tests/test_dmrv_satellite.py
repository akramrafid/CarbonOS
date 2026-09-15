"""
Automated Test Suite for Sprint 1: Live Space Data Ingestion (STAC API + Sentinel-1 SAR + NASA GEDI)
Tests:
  1. Sentinel-2 L2A BOA Optical Query via Open STAC API
  2. Sentinel-1 GRD Dual-Pol Radar SAR Query (VV/VH, IW mode)
  3. SatelliteEngine STAC Live Execution Pipeline & Biophysical Consistency
  4. Graceful Fallback to High-Fidelity Simulation on STAC Network Failure
  5. Deterministic Simulation Flag Override (DMRV_FORCE_SIMULATION)
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.satellite import SatelliteEngine, STACEngine


class TestDMRVSatelliteIngestion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = SatelliteEngine()
        cls.stac = STACEngine()
        # Sundarbans Mangrove Reserve Bounding Box [min_lng, min_lat, max_lng, max_lat]
        cls.sundarbans_bbox = [89.50, 22.25, 89.60, 22.35]
        cls.sundarbans_polygon = [
            [22.25, 89.50],
            [22.35, 89.50],
            [22.35, 89.60],
            [22.25, 89.60],
            [22.25, 89.50]
        ]
        cls.start_date = "2023-01-01"
        cls.end_date = "2023-12-31"

    def tearDown(self):
        # Ensure environment override is cleared after each test
        os.environ.pop("DMRV_FORCE_SIMULATION", None)

    def test_01_stac_sentinel2_optical_query(self):
        """Verify STAC queries real Sentinel-2 L2A scenes with valid cloud cover metadata."""
        features = self.stac.search_sentinel2(
            self.sundarbans_bbox,
            self.start_date,
            self.end_date,
            max_cloud=25,
            limit=3
        )
        self.assertGreater(len(features), 0, "STAC should return at least one Sentinel-2 scene.")
        top_scene = features[0]
        
        # Verify scene ID format
        self.assertTrue(
            top_scene["id"].startswith(("S2A_", "S2B_", "S2C_")),
            f"Invalid Sentinel-2 scene ID: {top_scene['id']}"
        )
        # Verify properties
        props = top_scene.get("properties", {})
        self.assertIn("eo:cloud_cover", props)
        self.assertIsInstance(props["eo:cloud_cover"], (int, float))
        self.assertIn("datetime", props)

    def test_02_stac_sentinel1_radar_dual_pol(self):
        """Verify STAC queries real Sentinel-1 GRD SAR radar scenes with dual-polarization (VV, VH)."""
        features = self.stac.search_sentinel1(
            self.sundarbans_bbox,
            self.start_date,
            self.end_date,
            limit=3
        )
        self.assertGreater(len(features), 0, "STAC should return at least one Sentinel-1 scene.")
        top_scene = features[0]
        
        # Verify scene ID format
        self.assertTrue(
            top_scene["id"].startswith(("S1A_", "S1B_")),
            f"Invalid Sentinel-1 scene ID: {top_scene['id']}"
        )
        props = top_scene.get("properties", {})
        polarizations = props.get("sar:polarizations", [])
        self.assertIn("VV", polarizations, "Sentinel-1 scene must contain VV co-polarization.")
        self.assertIn("VH", polarizations, "Sentinel-1 scene must contain VH cross-polarization for canopy scattering.")

    def test_03_satellite_engine_stac_live_run(self):
        """Verify full SatelliteEngine live execution returns valid indices, SAR radar, and GEDI allometry."""
        result = self.engine.run_analysis(
            self.sundarbans_polygon,
            self.start_date,
            self.end_date,
            analysis_type="carbon_heatmap"
        )
        self.assertEqual(result["data_source"], "stac_live")
        self.assertIn("Sentinel-1 GRD", result["satellite_sources"])
        self.assertIn("Sentinel-2 L2A", result["satellite_sources"])

        # Check metadata
        meta = result.get("analysis_metadata", {})
        self.assertGreater(len(meta.get("s2_scene_ids", [])), 0)
        self.assertGreater(len(meta.get("s1_scene_ids", [])), 0)
        self.assertEqual(meta.get("gedi_tree_height_source"), "gedi_l2b_spatial_allometry")
        self.assertIn("stac_endpoint", meta)

        # Biophysical consistency checks
        self.assertGreater(result["average_ndvi"], 0.1)
        self.assertLessEqual(result["average_ndvi"], 1.0)
        self.assertGreater(result["average_tree_height"], 5.0)
        self.assertLess(result["average_vv"], 0.0, "Radar VV backscatter must be negative (dB scale).")
        self.assertLess(result["average_vh"], result["average_vv"], "VH cross-pol must be lower backscatter than VV.")
        self.assertGreater(result["average_ratio"], 0.0, "Cross-Ratio (VV - VH) must be positive.")

        # Spatial grid consistency
        grid = result.get("grid_pixels", [])
        self.assertEqual(len(grid), 64)
        self.assertEqual(len(grid[0]), 64)
        first_pixel = grid[0][0]
        required_keys = ["ndvi", "evi", "ndwi", "savi", "ndbi", "S1_vv", "S1_vh", "S1_ratio", "tree_height"]
        for key in required_keys:
            self.assertIn(key, first_pixel, f"Grid pixel missing required key: {key}")

    def test_04_fallback_to_simulation_on_stac_failure(self):
        """Verify that when STAC API endpoint fails or times out, SatelliteEngine falls back cleanly to simulation."""
        # Create a satellite engine with broken STAC URL
        broken_engine = SatelliteEngine()
        broken_engine.stac_engine = STACEngine(stac_url="https://invalid.stac.endpoint.example.com/v1", timeout=1)
        
        result = broken_engine.run_analysis(
            self.sundarbans_polygon,
            self.start_date,
            self.end_date,
            analysis_type="ndvi"
        )
        self.assertEqual(result["data_source"], "simulated", "Should fall back to simulated data source.")
        self.assertTrue(result["analysis_metadata"].get("simulation"))

    def test_05_force_simulation_env_flag(self):
        """Verify DMRV_FORCE_SIMULATION=1 immediately triggers high-fidelity simulation mode."""
        os.environ["DMRV_FORCE_SIMULATION"] = "1"
        result = self.engine.run_analysis(
            self.sundarbans_polygon,
            self.start_date,
            self.end_date,
            analysis_type="ndvi"
        )
        self.assertEqual(result["data_source"], "simulated")
        self.assertTrue(result["analysis_metadata"].get("simulation"))


if __name__ == "__main__":
    unittest.main()
