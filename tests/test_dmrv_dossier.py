import os
import sys
import unittest
import json
import datetime
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add repo root and inference directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "inference"))

from inference.carbon_monitoring.database import init_db, SessionLocal
from inference.carbon_monitoring.models import AnalysisJob, CarbonResult, BaselineAssessment, EstimateProvenance
from inference.carbon_monitoring.router import router as carbon_router
from inference.carbon_monitoring.report_generator import ReportGenerator
from inference.carbon_monitoring import provenance as provenance_utils


class TestDMRVAuditDossier(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.app = FastAPI(title="dMRV Audit Dossier Test Harness")
        cls.app.include_router(carbon_router)
        cls.client = TestClient(cls.app)

    def setUp(self):
        self.db: Session = SessionLocal()

        # Seed realistic analysis job, result, baseline, and provenance
        self.job = AnalysisJob(
            status="completed",
            polygon_geojson=json.dumps([[22.25, 89.50], [22.35, 89.50], [22.35, 89.60], [22.25, 89.60]]),
            analysis_type="ndvi",
            start_date=datetime.date(2023, 1, 1),
            end_date=datetime.date(2023, 12, 31),
            processing_time=4.82
        )
        self.db.add(self.job)
        self.db.commit()

        self.result = CarbonResult(
            job_id=self.job.id,
            estimated_biomass=285.5,
            estimated_carbon=134.2,
            tonnes_co2e=2460.8,
            avg_ndvi=0.79,
            forest_area_ha=50.0,
            confidence=0.94,
            satellite_sources="Copernicus Sentinel-2 + Sentinel-1 SAR RTC + NASA GEDI",
            carbon_lower_90=118.0,
            carbon_upper_90=150.4,
            interval_method="conformal_quantile_regression",
            forest_stratum="SUNDARBANS_MANGROVE",
            carbon_agb_tc_ha=134.19,
            carbon_bgb_tc_ha=65.75,
            carbon_soc_tc_ha=180.4,
            relative_margin_of_error=0.1207,
            verra_precision_discount_pct=0.0,
            conservative_creditable_tco2e=2460.8
        )
        self.db.add(self.result)
        self.db.commit()

        self.baseline = BaselineAssessment(
            job_id=self.job.id,
            baseline_method="synthetic_control_convex_optimization",
            donor_pool_count=8,
            pre_treatment_rmse=1.12,
            weights_json=json.dumps({"donor_01": 0.45, "donor_02": 0.35, "donor_03": 0.20}),
            historical_trajectory_json=json.dumps([{"year": 2023, "counterfactual_tc_ha": 98.4}]),
            counterfactual_carbon_tc_ha=98.4,
            gross_additionality_tco2e=656.3,
            leakage_belt_area_ha=425.0,
            leakage_deduction_tco2e=0.0,
            leakage_risk_rating="LOW",
            buffer_deduction_pct=18.0,
            buffer_withheld_tco2e=118.13,
            net_creditable_tco2e=538.17
        )
        self.db.add(self.baseline)
        self.db.commit()

        self.provenance = provenance_utils.build_provenance_record(
            self.db,
            result_id=self.result.id,
            data_source="stac_live_aws_earth_search",
            satellite_scene_ids=["S2B_MSIL2A_20231015", "S1A_IW_GRDH_20231018"],
            gedi_tree_height_source="nasa_gedi_l2b_rh98_calibrated",
            model_type="random_forest_tier3_allometry",
            model_version="2.0.0-verra-aligned",
            model_trained_on="sundarbans_mangrove_ground_truth",
            feature_vector={"ndvi": 0.79, "vh_vv_cr": -6.4},
            lat=22.30,
            lng=89.55
        )
        self.db.add(self.provenance)
        self.db.commit()

    def tearDown(self):
        try:
            if hasattr(self, "provenance") and self.provenance:
                self.db.delete(self.provenance)
            if hasattr(self, "baseline") and self.baseline:
                self.db.delete(self.baseline)
            if hasattr(self, "result") and self.result:
                self.db.delete(self.result)
            if hasattr(self, "job") and self.job:
                self.db.delete(self.job)
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def test_01_build_vvb_audit_dossier_structure(self):
        """Verify build_vvb_audit_dossier compiles all 7 institutional Verra VM0047 sections."""
        dossier = ReportGenerator.build_vvb_audit_dossier(
            job=self.job,
            result=self.result,
            baseline=self.baseline,
            provenance=self.provenance,
            db=self.db
        )

        self.assertEqual(dossier["certification_standard"], "Verra VM0047 v1.0 & VCS Standard v4.5")
        self.assertTrue(dossier["dossier_id"].startswith("VVB-DOSSIER-"))

        # Section 1: Project Metadata
        self.assertIn("project_metadata", dossier)
        meta = dossier["project_metadata"]
        self.assertEqual(meta["forest_stratum"], "SUNDARBANS_MANGROVE")
        self.assertEqual(meta["project_boundary_area_ha"], 50.0)

        # Section 2: Space Data
        self.assertIn("space_data_provenance", dossier)
        space = dossier["space_data_provenance"]
        self.assertEqual(len(space["scenes_processed"]), 2)
        self.assertEqual(space["average_ndvi"], 0.79)

        # Section 3: IPCC Tier-3 Multi-Pool
        self.assertIn("ipcc_tier3_multipool_inventory", dossier)
        pool = dossier["ipcc_tier3_multipool_inventory"]
        self.assertEqual(pool["root_to_shoot_ratio"], 0.49)
        self.assertEqual(pool["soil_organic_carbon_tc_ha"], 180.4)
        self.assertEqual(pool["soil_bulk_density_g_cm3"], 0.82)

        # Section 4: Dynamic Baseline
        self.assertIn("dynamic_synthetic_control_baseline", dossier)
        base = dossier["dynamic_synthetic_control_baseline"]
        self.assertEqual(base["donor_pool_count"], 8)
        self.assertAlmostEqual(base["pre_treatment_rmse"], 1.12, places=2)

        # Section 5: Leakage & Buffer
        self.assertIn("leakage_and_permanence_risk", dossier)
        risk = dossier["leakage_and_permanence_risk"]
        self.assertEqual(risk["risk_buffer_withholding_pct"], 18.0)
        self.assertEqual(risk["leakage_risk_rating"], "LOW")

        # Section 6: Uncertainty & Conservativeness
        self.assertIn("conformal_uncertainty_and_conservativeness", dossier)
        uncert = dossier["conformal_uncertainty_and_conservativeness"]
        self.assertEqual(uncert["confidence_level_pct"], 90.0)
        self.assertAlmostEqual(uncert["relative_margin_of_error_pct"], 12.07, places=1)
        self.assertEqual(uncert["verra_allowable_precision_threshold_pct"], 15.0)
        self.assertEqual(uncert["verra_precision_discount_pct"], 0.0)

        # Section 7: Audit Trail & Attestation
        self.assertIn("tamper_evident_audit_trail", dossier)
        audit = dossier["tamper_evident_audit_trail"]
        self.assertEqual(audit["chain_verification_status"], "VERIFIED_VALID")
        self.assertIn("vvb_digital_attestation", audit)

    def test_02_generate_vvb_dossier_markdown(self):
        """Verify Markdown dossier renders all tables, math equations, and digital attestation."""
        dossier = ReportGenerator.build_vvb_audit_dossier(
            job=self.job,
            result=self.result,
            baseline=self.baseline,
            provenance=self.provenance
        )
        md_text = ReportGenerator.generate_vvb_dossier_markdown(dossier)

        self.assertIn("# Verra VM0047 Digital Monitoring Report & VVB Audit Dossier", md_text)
        self.assertIn("SUNDARBANS_MANGROVE", md_text)
        self.assertIn("Soil Organic Carbon (SOC)", md_text)
        self.assertIn("Dynamic Synthetic Control Counterfactual Baseline", md_text)
        self.assertIn("Abadie et al.", md_text)
        self.assertIn("18.0%", md_text)
        self.assertIn("Split Conformal Quantile Prediction", md_text)
        self.assertIn("VVB Digital Attestation Statement:", md_text)

    def test_03_generate_vvb_dossier_pdf(self):
        """Verify valid PDF generation containing VVB dossier certificate."""
        dossier = ReportGenerator.build_vvb_audit_dossier(
            job=self.job,
            result=self.result,
            baseline=self.baseline,
            provenance=self.provenance
        )
        pdf_bytes = ReportGenerator.generate_vvb_dossier_pdf(dossier)

        self.assertTrue(pdf_bytes.startswith(b"%PDF-1.4"))
        self.assertTrue(pdf_bytes.strip().endswith(b"%%EOF"))
        self.assertIn(b"VERRA VM0047 DIGITAL MONITORING REPORT", pdf_bytes)
        self.assertIn(b"VVB Audit Dossier", pdf_bytes)
        self.assertIn(b"SUNDARBANS_MANGROVE", pdf_bytes)

    def test_04_fastapi_audit_dossier_endpoints(self):
        """Verify GET /api/carbon/report/audit-dossier/{job_id} across JSON, Markdown, and PDF."""
        # 1. JSON output
        res_json = self.client.get(f"/api/carbon/report/audit-dossier/{self.job.id}?format=json")
        self.assertEqual(res_json.status_code, 200)
        data = res_json.json()
        self.assertEqual(data["certification_standard"], "Verra VM0047 v1.0 & VCS Standard v4.5")
        self.assertIn("ipcc_tier3_multipool_inventory", data)

        # 2. Markdown output
        res_md = self.client.get(f"/api/carbon/report/audit-dossier/{self.job.id}?format=markdown")
        self.assertEqual(res_md.status_code, 200)
        self.assertEqual(res_md.headers["content-type"], "text/markdown; charset=utf-8")
        self.assertIn("Verra VM0047", res_md.text)

        # 3. PDF output
        res_pdf = self.client.get(f"/api/carbon/report/audit-dossier/{self.job.id}?format=pdf")
        self.assertEqual(res_pdf.status_code, 200)
        self.assertEqual(res_pdf.headers["content-type"], "application/pdf")
        self.assertTrue(res_pdf.content.startswith(b"%PDF-1.4"))

        # 4. Standard /report/{job_id}?format=dossier endpoint integration
        res_dos = self.client.get(f"/api/carbon/report/{self.job.id}?format=dossier")
        self.assertEqual(res_dos.status_code, 200)
        self.assertEqual(res_dos.headers["content-type"], "application/pdf")


if __name__ == "__main__":
    unittest.main()
