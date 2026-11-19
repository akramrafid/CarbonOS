"""
Phase P1 & P2 Institutional Scientific, Accounting & Regulatory Tests:
- Real GeoTIFF COG pixel extraction (Sentinel-2 B02..B12 + Sentinel-1 VV/VH + SCL cloud mask)
- Real band preservation (no silent scalar-NDVI band inversion overwriting measured bands)
- Calibration heuristic rejection & DroneSurveyResult JSON coordinate parsing
- IPCC Approach 2 Monte Carlo multi-pool error propagation & lab soil-core override
- Split Conformal calibration gating (<20 plots vs >=20 held-out plots)
- Carbon Alembic schema upgrade + EUDR cutoff & TNFD LEAP spatial screening
- ESG Scope 3 (Categories 1-15), GRI 302-1 NCV Energy Consumption, Dated FacilityOwnership,
  Ch. 5 Base Year Recalculation, IPCC 2006 DRAFT factor loader, EU CBAM XML/JSON, CSRD/TNFD templates
"""
import datetime as dt
import json
import os
import tempfile
import unittest
from decimal import Decimal
import xml.etree.ElementTree as ET

import numpy as np
import rasterio
from rasterio.transform import from_bounds
from fastapi.testclient import TestClient

from dmrv_harness import BASE_DIR, dmrv_auth, ensure_test_org_and_members  # noqa: E402
from esg_rag import accounting, ledger  # noqa: E402
from esg_rag.database import SessionLocal as EsgSessionLocal, engine as esg_engine, upgrade as esg_upgrade  # noqa: E402
from inference.main import app  # noqa: E402
from inference.carbon_monitoring.calibration import _sat_result_to_training_row  # noqa: E402
from inference.carbon_monitoring.database import Base as CarbonBase, engine as carbon_engine, upgrade as carbon_upgrade  # noqa: E402
from inference.carbon_monitoring.estimator import (  # noqa: E402
    CarbonEstimator,
    calculate_multi_pool,
    extract_feature_vector,
    propagate_multipool_uncertainty,
)
from inference.carbon_monitoring.eudr_tnfd import evaluate_eudr_tnfd_compliance  # noqa: E402
from inference.carbon_monitoring.models import GroundTruthPlot  # noqa: E402
from inference.carbon_monitoring.satellite import SatelliteEngine  # noqa: E402
from inference.carbon_monitoring.uncertainty import compute_conformal_verra_assessment  # noqa: E402
from factors.ipcc2006_loader import build_ipcc2006_draft_factors  # noqa: E402


def _write_temp_geotiff(path: str, array: np.ndarray, bounds=(89.50, 22.20, 89.52, 22.22), crs="EPSG:4326"):
    minx, miny, maxx, maxy = bounds
    h, w = array.shape
    transform = from_bounds(minx, miny, maxx, maxy, w, h)
    with rasterio.open(
        path, "w", driver="GTiff", height=h, width=w, count=1,
        dtype=array.dtype, crs=crs, transform=transform,
    ) as dst:
        dst.write(array, 1)


class PhaseP1ScientificTests(unittest.TestCase):
    def test_01_real_geotiff_cog_extraction_and_band_preservation(self):
        tmpdir = tempfile.mkdtemp(prefix="cog-test-")
        bounds = (89.50, 22.20, 89.52, 22.22)
        h, w = 64, 64

        band_arrays = {
            "blue": np.full((h, w), 350, dtype=np.uint16),      # 0.035
            "green": np.full((h, w), 650, dtype=np.uint16),     # 0.065
            "red": np.full((h, w), 400, dtype=np.uint16),       # 0.040
            "rededge1": np.full((h, w), 1450, dtype=np.uint16), # 0.145
            "rededge2": np.full((h, w), 3100, dtype=np.uint16), # 0.310
            "nir": np.full((h, w), 4400, dtype=np.uint16),      # 0.440 -> real NDVI = (0.44-0.04)/(0.44+0.04)=0.8333
            "swir16": np.full((h, w), 1800, dtype=np.uint16),   # 0.180 (not linear from NDVI!)
            "swir22": np.full((h, w), 920, dtype=np.uint16),    # 0.092
            "scl": np.full((h, w), 4, dtype=np.uint16),         # 4 = vegetation
        }
        s2_assets = {}
        for k, arr in band_arrays.items():
            fp = os.path.join(tmpdir, f"s2_{k}.tif")
            _write_temp_geotiff(fp, arr, bounds=bounds)
            s2_assets[k] = {"href": fp}

        vv_path = os.path.join(tmpdir, "s1_vv.tif")
        vh_path = os.path.join(tmpdir, "s1_vh.tif")
        _write_temp_geotiff(vv_path, np.full((h, w), -9.5, dtype=np.float32), bounds=bounds)
        _write_temp_geotiff(vh_path, np.full((h, w), -15.2, dtype=np.float32), bounds=bounds)
        s1_feat = {"id": "S1A_TEST", "assets": {"vv": {"href": vv_path}, "vh": {"href": vh_path}}}
        s2_feat = {"id": "S2A_TEST", "assets": s2_assets}

        sat = SatelliteEngine()
        grid = sat._extract_stac_cog_grid(s2_feat, [[22.20, 89.50], [22.22, 89.52]], s1_feature=s1_feat)
        self.assertIsNotNone(grid)
        self.assertTrue(grid["s1_extracted"])
        self.assertEqual(grid["bands_interpolated"], [])
        self.assertAlmostEqual(grid["average_bands"]["B11_swir1"], 0.18, places=3)
        self.assertAlmostEqual(grid["average_bands"]["B5_re1"], 0.145, places=3)
        self.assertAlmostEqual(grid["average_vv"], -9.5, places=1)
        self.assertAlmostEqual(grid["average_vh"], -15.2, places=1)

        # Ensure estimator preserves real B11_swir1 = 0.18 rather than overwriting with 0.26 - 0.19*ndvi (~0.10)
        est = CarbonEstimator()
        out = est.estimate_carbon_stock({**grid, "eo_pixel_verified": True}, lat=22.21, lng=89.51)
        self.assertAlmostEqual(out["feature_vector"]["B11_swir1"], 0.18, places=2)
        self.assertFalse(out["spectral_bands_synthesized"])

        # Calibration rejects metadata-heuristic or simulated inputs strictly
        heuristic_sat = {
            "average_ndvi": 0.72,
            "data_source": "stac_live",
            "analysis_metadata": {"pixel_extraction_mode": "stac_metadata_heuristic"},
        }
        self.assertIsNone(_sat_result_to_training_row(heuristic_sat, 120.0, 56.4, est.feature_names))

        real_sat = {**grid, "data_source": "stac_live", "analysis_metadata": {"pixel_extraction_mode": "stac_cog_rasterio"}}
        row = _sat_result_to_training_row(real_sat, 120.0, 56.4, est.feature_names)
        self.assertIsNotNone(row)
        self.assertAlmostEqual(row["B11_swir1"], 0.18, places=3)

    def test_02_monte_carlo_error_propagation_and_soil_core_override(self):
        mp_default = calculate_multi_pool(180.0, 84.6, 0.78, stratum="SUNDARBANS_MANGROVE")
        self.assertEqual(mp_default["soc_source"], "stratum_literature_default")

        agb_iv = {"biomass_lower_90": 155.0, "biomass_upper_90": 205.0, "carbon_lower_90": 72.8, "carbon_upper_90": 96.4}
        mc_default = propagate_multipool_uncertainty(mp_default, agb_iv, stratum="SUNDARBANS_MANGROVE", n_iter=1500, seed=7)
        self.assertIn("pool_variance_share_pct", mc_default)
        shares = mc_default["pool_variance_share_pct"]
        self.assertAlmostEqual(shares["agb"] + shares["bgb"] + shares["soc"], 100.0, delta=0.5)

        core = {"bulk_density_g_cm3": 0.90, "soc_pct": 3.1, "depth_cm": 100.0, "bd_cv": 0.05, "oc_cv": 0.06}
        mp_core = calculate_multi_pool(180.0, 84.6, 0.78, stratum="SUNDARBANS_MANGROVE", soil_core_override=core)
        self.assertEqual(mp_core["soc_source"], "lab_soil_core_measured")
        self.assertAlmostEqual(mp_core["carbon_soc_tc_ha"], 279.0, places=1)
        mc_core = propagate_multipool_uncertainty(mp_core, agb_iv, stratum="SUNDARBANS_MANGROVE", soil_core_override=core, n_iter=1500, seed=7)
        self.assertLess(mc_core["soc_upper_90"] - mc_core["soc_lower_90"], mc_default["soc_upper_90"] - mc_default["soc_lower_90"])

    def test_03_conformal_calibration_gating_and_eudr_tnfd(self):
        CarbonBase.metadata.create_all(bind=carbon_engine)
        from inference.carbon_monitoring.database import SessionLocal as CarbonSession
        db = CarbonSession()
        try:
            # Ensure below 20 plots -> uncalibrated_proxy_not_conformal
            db.query(GroundTruthPlot).delete()
            db.commit()
            res_uncal = compute_conformal_verra_assessment(1000.0, 120.0, 145.0, 132.5, db=db)
            self.assertFalse(res_uncal["is_statistically_valid_conformal"])
            self.assertEqual(res_uncal["calibration_status"], "uncalibrated_proxy_not_conformal")

            # Seed 22 field plots + real predictor -> empirical_conformal
            for i in range(22):
                db.add(GroundTruthPlot(
                    plot_name=f"PLOT-{i}", location_lat=22.2 + i * 0.001, location_lng=89.5,
                    measured_biomass_mg_ha=200.0 + i, measured_carbon_tc_ha=95.0 + (i % 5),
                    measurement_date=dt.date(2025, 6, 1), measurement_method="field_inventory", collected_by="bfd",
                ))
            db.commit()
            res_cal = compute_conformal_verra_assessment(
                1000.0, 120.0, 145.0, 132.5, db=db, model_predict_fn=lambda p: 92.0 + (hash(p.plot_name) % 3)
            )
            self.assertTrue(res_cal["is_statistically_valid_conformal"])
            self.assertEqual(res_cal["calibration_status"], "empirical_conformal")
            self.assertIsNotNone(res_cal["calibrated_q_hat_tc_ha"])
        finally:
            db.query(GroundTruthPlot).delete()
            db.commit()
            db.close()

        # EUDR fails closed when EO raster verification is absent
        poly = {"type": "Polygon", "coordinates": [[[89.5, 22.2], [89.55, 22.2], [89.55, 22.25], [89.5, 22.25], [89.5, 22.2]]]}
        eudr = evaluate_eudr_tnfd_compliance(poly, satellite_engine=None, osm_context={"osm_available": False, "source_used": "unavailable", "leakage_belt": {"metrics": {}}})
        self.assertEqual(eudr["eudr_status"], "EO_VERIFICATION_REQUIRED")
        self.assertTrue(eudr["polygon_valid"])

    def test_04_carbon_alembic_upgrade_and_ipcc_draft_loader(self):
        tmp_db = os.path.join(tempfile.mkdtemp(prefix="carbon-alembic-"), "carbon.sqlite3")
        carbon_upgrade(f"sqlite:///{tmp_db}")

        drafts = build_ipcc2006_draft_factors(gwp_basis="AR6")
        self.assertEqual(len(drafts), 3)
        for d in drafts:
            self.assertEqual(d["status"], "DRAFT")
            self.assertIn("IPCC", d["source_publisher"])
            self.assertGreater(d["kgco2e_per_unit"], 0)


class PhaseP2EsgInstitutionalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        esg_upgrade(os.environ.get("ESG_DATABASE_URL", str(esg_engine.url)))
        cls.org_id = f"org-p2-{os.getpid()}"
        ensure_test_org_and_members(
            cls.org_id,
            "owner-p2",
            [("contrib-p2", "data_contributor"), ("rev-p2", "auditor"), ("admin2-p2", "esg_admin")],
        )
        cls.client = TestClient(app)
        cls.h_owner = dmrv_auth("owner-p2", cls.org_id)
        cls.h_contrib = dmrv_auth("contrib-p2", cls.org_id)
        cls.h_rev = dmrv_auth("rev-p2", cls.org_id)
        cls.h_admin2 = dmrv_auth("admin2-p2", cls.org_id)

    def test_01_scope3_gri302_energy_baseyear_ownership_cbam_and_csrd(self):
        # Setup LegalEntity, Facility, Period, Approved Scope 1 + Scope 2 Factors & Activities
        le = self.client.post("/api/esg/legal-entities", json={"name": "BD RMG Ltd", "country": "BD"}, headers=self.h_owner)
        self.assertEqual(le.status_code, 201)
        le_id = le.json()["id"]

        fac = self.client.post("/api/esg/facilities", json={
            "legal_entity_id": le_id, "name": "Gazipur Knit Plant", "country": "BD",
            "grid_region": "BD", "equity_share_pct": "100",
        }, headers=self.h_owner)
        self.assertEqual(fac.status_code, 201)
        fac_id = fac.json()["id"]

        # Dated ownership span (50% first half-year acquisition -> mid-period)
        own = self.client.post(f"/api/esg/facilities/{fac_id}/ownership", json={
            "effective_from": "2025-07-01", "effective_to": "2025-12-31",
            "operational_control": True, "financial_control": True, "equity_share_pct": "100",
            "change_reason": "Mid-year acquisition of Savar Dyeing unit",
        }, headers=self.h_owner)
        self.assertEqual(own.status_code, 201)

        per = self.client.post("/api/esg/periods", json={
            "name": "FY2025-P2", "start_date": "2025-01-01", "end_date": "2025-12-31",
            "boundary_method": "equity_share", "gwp_basis": "AR6",
        }, headers=self.h_owner)
        self.assertEqual(per.status_code, 201)
        per_id = per.json()["id"]

        # Create & dual-approve Diesel + Grid factors
        f1_r = self.client.post("/api/esg/factors", json={
            "family": "test-p2-diesel", "activity_type": "diesel", "unit": "L", "kgco2e_per_unit": "2.68",
            "uncertainty_pct": "5.0", "region": "BD", "gwp_basis": "AR6", "method": "direct",
            "valid_from": "2025-01-01", "source_publisher": "IPCC", "source_document": "Vol2 Ch2", "source_year": 2006,
        }, headers=self.h_owner)
        self.assertEqual(f1_r.status_code, 201, f1_r.text)
        f1 = f1_r.json()["id"]
        self.assertEqual(self.client.post(f"/api/esg/factors/{f1}/approve", headers=self.h_admin2).status_code, 200)

        f2_r = self.client.post("/api/esg/factors", json={
            "family": "test-p2-grid", "activity_type": "electricity", "unit": "kWh", "kgco2e_per_unit": "0.55",
            "uncertainty_pct": "8.0", "region": "BD", "gwp_basis": "AR6", "method": "location",
            "factor_kind": "grid_average", "valid_from": "2025-01-01",
            "source_publisher": "BPDB", "source_document": "Grid Test", "source_year": 2025,
        }, headers=self.h_owner)
        self.assertEqual(f2_r.status_code, 201, f2_r.text)
        f2 = f2_r.json()["id"]
        self.assertEqual(self.client.post(f"/api/esg/factors/{f2}/approve", headers=self.h_admin2).status_code, 200)

        for payload in (
            {"facility_id": fac_id, "period_id": per_id, "activity_type": "diesel", "quantity": "1000", "unit": "L",
             "activity_start": "2025-08-01", "activity_end": "2025-08-31", "source_type": "manual", "data_quality": "metered"},
            {"facility_id": fac_id, "period_id": per_id, "activity_type": "electricity", "quantity": "2000", "unit": "kWh",
             "activity_start": "2025-08-01", "activity_end": "2025-08-31", "source_type": "manual", "data_quality": "billed"},
        ):
            r = self.client.post("/api/esg/activities", json=payload, headers=self.h_contrib)
            self.assertIn(r.status_code, (200, 201), r.text)
            aid = r.json()["id"]
            sub_r = self.client.post(f"/api/esg/activities/{aid}/submit", headers=self.h_contrib)
            self.assertEqual(sub_r.status_code, 200, sub_r.text)
            app_r = self.client.post(f"/api/esg/activities/{aid}/approve", headers=self.h_rev)
            self.assertEqual(app_r.status_code, 200, app_r.text)

        # Scope 3 Record (Cat 1 Purchased Cotton Yarn via supplier-specific EPD)
        s3 = self.client.post("/api/esg/scope3-records", json={
            "period_id": per_id, "facility_id": fac_id, "category": "cat_1_purchased_goods",
            "calculation_method": "supplier_specific", "supplier_name": "Dhaka Cotton Spinners Ltd",
            "activity_description": "Combed organic cotton yarn", "quantity": "10", "unit": "t",
            "factor_kgco2e_per_unit": "3200", "factor_source": "Supplier EPD-2025-04", "data_quality": "metered",
        }, headers=self.h_contrib)
        self.assertEqual(s3.status_code, 201, s3.text)
        s3_id = s3.json()["id"]
        self.assertEqual(self.client.post(f"/api/esg/scope3-records/{s3_id}/submit", headers=self.h_contrib).status_code, 200)
        self.assertEqual(self.client.post(f"/api/esg/scope3-records/{s3_id}/approve", headers=self.h_rev).status_code, 200)

        calc = self.client.post(f"/api/esg/periods/{per_id}/calculate", headers=self.h_contrib)
        self.assertEqual(calc.status_code, 201, calc.text)
        self.assertFalse(calc.json()["blocking"], calc.json().get("exceptions"))
        calc_id = calc.json()["id"]

        # Base year policy + structural trigger check (>5% triggers recalculation)
        self.client.put("/api/esg/base-year-policy", json={
            "base_year_period_id": per_id, "significance_threshold_pct": "5.0",
            "base_year_scope1_tco2e": "100", "base_year_scope2_tco2e": "50", "base_year_scope3_tco2e": "200",
        }, headers=self.h_owner)
        ev = self.client.post("/api/esg/base-year-policy/evaluate", json={
            "structural_change_delta_tco2e": "35.0", "reason": "Plant acquisition", "apply_restatement": True,
        }, headers=self.h_owner)
        self.assertEqual(ev.status_code, 200)
        self.assertTrue(ev.json()["recalculation_required"])
        self.assertEqual(ev.json()["status"], "BASE_YEAR_SIGNIFICANT_STRUCTURAL_CHANGE")

        # EU CBAM XML export
        cbam_xml = self.client.post(f"/api/esg/periods/{per_id}/export/cbam?format=xml", json={
            "goods_declarations": [{"cn_code": "7208", "good_name": "Rolled strip", "facility_id": fac_id, "produced_tonnes": "100"}]
        }, headers=self.h_owner)
        self.assertEqual(cbam_xml.status_code, 200)
        root = ET.fromstring(cbam_xml.text)
        self.assertEqual(root.tag, "CBAMQuarterlyReport")
        direct_el = root.find(".//DirectEmissionsTCO2e")
        indirect_el = root.find(".//IndirectEmissionsTCO2e")
        self.assertIsNotNone(direct_el)
        self.assertGreater(float(direct_el.text), 1.0)
        self.assertGreater(float(indirect_el.text), 0.5)

        # Lock snapshot & check GRI 302-1 (energy NCV), GRI 305-3 (Scope 3), and CSRD_ESRS template
        lock = self.client.post(f"/api/esg/periods/{per_id}/lock", json={"calculation_run_id": calc_id}, headers=self.h_owner)
        self.assertEqual(lock.status_code, 201)
        snap_id = lock.json()["id"]
        snap_json = self.client.get(f"/api/esg/snapshots/{snap_id}/export?format=json", headers=self.h_owner).json()
        self.assertIn("energy_consumption", snap_json)
        self.assertEqual(snap_json["totals_tco2e"]["scope3_status"], "INCLUDED")
        self.assertEqual(snap_json["totals_tco2e"]["scope3"], "32.000")
        self.assertIsNotNone(snap_json["combined_uncertainty_scope123"]["combined_uncertainty_pct"])

        gri = self.client.get(f"/api/esg/periods/{per_id}/disclosures/GRI", headers=self.h_owner).json()
        r302 = next(r for r in gri["requirements"] if r["ref"] == "GRI 302-1")
        r305_3 = next(r for r in gri["requirements"] if r["ref"] == "GRI 305-3")
        self.assertIn("energy_consumption", r302["evidence"])
        self.assertEqual(r305_3["evidence"]["scope3_tco2e"], "32.000")

        csrd = self.client.get(f"/api/esg/periods/{per_id}/disclosures/CSRD_ESRS", headers=self.h_owner).json()
        self.assertEqual(csrd["materiality_perspective"], "double")
        self.assertGreaterEqual(len(csrd["requirements"]), 10)


if __name__ == "__main__":
    unittest.main()
