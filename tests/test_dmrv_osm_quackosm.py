import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import geopandas as gpd
from fastapi import FastAPI
from fastapi.testclient import TestClient
from shapely.geometry import LineString, Point, Polygon

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

import _isolated_db  # noqa: F401,E402
from inference.carbon_monitoring.baseline import (
    LeakageMonitoringEngine,
    run_dynamic_baseline_assessment,
)
from inference.carbon_monitoring.database import init_db
from inference.carbon_monitoring.osm_intelligence import (
    classify_osm_tags,
    compute_leakage_belt_geometry,
    extract_osm_context,
    overpass_elements_to_features,
    parse_aoi_polygon,
)
from inference.carbon_monitoring.router import router as carbon_router


SUNDARBANS_AOI = [
    [22.25, 89.50],
    [22.30, 89.50],
    [22.30, 89.55],
    [22.25, 89.55],
]


class TestDMRVOsmQuackOSM(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV OSM QuackOSM Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def test_01_aoi_parsing_and_10km_belt_geojson(self):
        poly = parse_aoi_polygon(SUNDARBANS_AOI)
        self.assertIsInstance(poly, Polygon)
        self.assertGreater(poly.area, 0)

        belt = compute_leakage_belt_geometry(SUNDARBANS_AOI, buffer_km=10.0)
        self.assertGreater(belt["leakage_belt_area_ha"], 1000.0)
        self.assertIn(belt["leakage_belt_geojson"]["type"], ("Polygon", "MultiPolygon"))
        self.assertFalse(belt["belt_poly"].intersects(poly.centroid))

    def test_02_osm_tag_classification(self):
        self.assertEqual(classify_osm_tags({"natural": "wetland", "name": "Sundarbans Block"}), "forest")
        self.assertEqual(classify_osm_tags({"waterway": "river"}), "water")
        self.assertEqual(classify_osm_tags({"highway": "tertiary"}), "roads")
        self.assertEqual(classify_osm_tags({"man_made": "kiln"}), "industrial")
        self.assertEqual(classify_osm_tags({"landuse": "farmland"}), "cropland")
        self.assertIsNone(classify_osm_tags({"highway": "footway"}))

    def test_03_quackosm_local_pbf_pipeline_and_belt_density(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            fake_pbf = Path(tmpdir) / "bangladesh-latest.osm.pbf"
            fake_pbf.write_bytes(b"mock-pbf-header")
            cache_dir = Path(tmpdir) / "cache"

            # Features overlapping the 10 km outer belt (~22.16..22.39, 89.41..89.64)
            mock_gdf = gpd.GeoDataFrame(
                [
                    {
                        "feature_id": "way/101",
                        "tags": {"natural": "wetland", "name": "Sundarbans Reserve"},
                        "geometry": Polygon([(89.57, 22.26), (89.59, 22.26), (89.59, 22.28), (89.57, 22.28)]),
                    },
                    {
                        "feature_id": "way/102",
                        "tags": {"highway": "secondary", "name": "Mongla Access Road"},
                        "geometry": LineString([(89.56, 22.24), (89.61, 22.32)]),
                    },
                    {
                        "feature_id": "way/103",
                        "tags": {"landuse": "farmland", "name": "Paddy Buffer"},
                        "geometry": Polygon([(89.44, 22.25), (89.48, 22.25), (89.48, 22.29), (89.44, 22.29)]),
                    },
                    {
                        "feature_id": "node/104",
                        "tags": {"man_made": "kiln", "name": "Delta Brick Kiln"},
                        "geometry": Point(89.58, 22.29),
                    },
                    {
                        "feature_id": "way/105",
                        "tags": {"waterway": "river", "name": "Pashur River"},
                        "geometry": LineString([(89.56, 22.21), (89.58, 22.33)]),
                    },
                ],
                crs="EPSG:4326",
            )

            with patch.dict(
                os.environ,
                {"OSM_PBF_PATH": str(fake_pbf), "OSM_CACHE_DIR": str(cache_dir)},
                clear=False,
            ), patch("inference.carbon_monitoring.osm_intelligence.quackosm.convert_pbf_to_geodataframe", return_value=mock_gdf) as mock_quack:
                ctx = extract_osm_context(SUNDARBANS_AOI, buffer_km=10.0, allow_overpass=False, ignore_cache=True)

            self.assertTrue(mock_quack.called)
            self.assertTrue(ctx["osm_available"])
            self.assertEqual(ctx["source_used"], "quackosm_pbf")
            self.assertEqual(ctx["layer_counts"]["forest"], 1)
            self.assertEqual(ctx["layer_counts"]["roads"], 1)
            self.assertEqual(ctx["layer_counts"]["industrial"], 1)
            self.assertEqual(ctx["layer_counts"]["water"], 1)

            metrics = ctx["leakage_belt"]["metrics"]
            self.assertGreater(metrics["road_length_km"], 0.0)
            self.assertGreater(metrics["road_density_km_per_km2"], 0.0)
            self.assertGreater(metrics["cropland_area_ha"], 0.0)
            self.assertEqual(metrics["industrial_count"], 1)
            self.assertEqual(metrics["leakage_source"], "osm_vector_analysis")
            self.assertGreater(metrics["derived_leakage_loss_rate"], 0.008)

            # Dynamic baseline picks up real OSM pressure when osm_context is supplied
            baseline = run_dynamic_baseline_assessment(
                job_id="TEST_OSM_BASELINE",
                polygon_geojson=json.dumps(SUNDARBANS_AOI),
                forest_area_ha=300.0,
                project_carbon_tc_ha=135.0,
                osm_context=ctx,
            )
            self.assertEqual(baseline["leakage_source"], "osm_vector_analysis")
            self.assertEqual(baseline["osm_leakage_metrics"]["industrial_count"], 1)
            self.assertIn("leakage_belt_geojson", baseline)

    def test_04_overpass_fallback_and_cache(self):
        overpass_payload = {
            "elements": [
                {
                    "type": "way",
                    "id": 201,
                    "tags": {"highway": "primary", "name": "Khulna Corridor"},
                    "geometry": [
                        {"lat": 22.24, "lon": 89.56},
                        {"lat": 22.34, "lon": 89.60},
                    ],
                },
                {
                    "type": "way",
                    "id": 202,
                    "tags": {"natural": "wood", "name": "Mangrove Fringe"},
                    "geometry": [
                        {"lat": 22.26, "lon": 89.57},
                        {"lat": 22.26, "lon": 89.59},
                        {"lat": 22.28, "lon": 89.59},
                        {"lat": 22.28, "lon": 89.57},
                        {"lat": 22.26, "lon": 89.57},
                    ],
                },
                {
                    "type": "node",
                    "id": 203,
                    "lat": 22.31,
                    "lon": 89.58,
                    "tags": {"man_made": "kiln", "name": "Belt Kiln"},
                },
            ]
        }

        parsed = overpass_elements_to_features(overpass_payload["elements"])
        self.assertEqual(len(parsed), 3)

        class _FakeResp:
            def raise_for_status(self):
                return None

            def json(self):
                return overpass_payload

        with tempfile.TemporaryDirectory() as tmpdir:
            env_patch = {
                "DMRV_DISABLE_LOCAL_PBF": "1",
                "DMRV_OFFLINE_ONLY": "0",
                "OSM_CACHE_DIR": tmpdir,
            }
            with patch.dict(os.environ, env_patch, clear=False), patch(
                "inference.carbon_monitoring.osm_intelligence.requests.post", return_value=_FakeResp()
            ) as mock_post:
                first = extract_osm_context(SUNDARBANS_AOI, buffer_km=10.0, allow_overpass=True)
                second = extract_osm_context(SUNDARBANS_AOI, buffer_km=10.0, allow_overpass=True)

            self.assertEqual(mock_post.call_count, 1)
            self.assertTrue(first["osm_available"])
            self.assertEqual(first["source_used"], "overpass_api")
            self.assertFalse(first["cached"])
            self.assertTrue(second["cached"])
            self.assertEqual(second["layer_counts"]["roads"], 1)

    def test_05_honest_offline_fallback_and_api_endpoint(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.dict(
                os.environ,
                {"DMRV_DISABLE_LOCAL_PBF": "1", "DMRV_OFFLINE_ONLY": "1", "OSM_CACHE_DIR": tmpdir},
                clear=False,
            ):
                resp = self.client.post(
                    "/api/carbon/osm/layers",
                    json={
                        "polygon_geojson": SUNDARBANS_AOI,
                        "buffer_km": 10.0,
                        "gross_additionality_tco2e": 10000.0,
                        "allow_overpass": False,
                        "ignore_cache": True,
                    },
                )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["osm_available"])
        self.assertEqual(data["source_used"], "unavailable")
        self.assertEqual(data["layers"]["roads"]["features"], [])
        self.assertEqual(data["layers"]["forest"]["features"], [])
        self.assertEqual(data["leakage_belt"]["metrics"]["leakage_source"], "fallback_default_no_osm")
        self.assertIn(data["leakage_belt"]["geojson"]["type"], ("Polygon", "MultiPolygon"))
        self.assertEqual(data["leakage_assessment"]["leakage_source"], "fallback_default_no_osm")

        fallback_direct = LeakageMonitoringEngine.assess_osm_leakage(
            polygon_geojson=SUNDARBANS_AOI,
            gross_additionality_tco2e=50000.0,
            osm_context=data,
        )
        self.assertEqual(fallback_direct["leakage_source"], "fallback_default_no_osm")
        self.assertFalse(fallback_direct["osm_available"])


if __name__ == "__main__":
    unittest.main()
