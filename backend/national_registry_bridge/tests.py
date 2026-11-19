import datetime
import json
import uuid
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from farmers_ai.models import AnalysisJob, CarbonResult
from .models import (
    RegistryProject,
    PositiveNegativeRule,
    MonitoringReportSubmission,
    CorrespondingAdjustment
)
from .positive_negative_list import check_eligibility, evaluate_and_update_project, bootstrap_default_rules
from .registry_client import (
    NationalRegistryClient,
    ProvenanceMissingError,
    IneligibleProjectError,
    RegistryBridgeError
)
from .jcm_connector import map_to_jcm_format
from .btr_export import generate_btr_structured_summary, export_btr_csv

User = get_user_model()


class PositiveNegativeListTests(TestCase):
    """Tests for DOE Positive/Negative List rule engine."""

    def setUp(self):
        PositiveNegativeRule.objects.all().delete()
        bootstrap_default_rules()

    def test_bootstrap_default_rules_created(self):
        rules = PositiveNegativeRule.objects.filter(is_active=True)
        self.assertGreaterEqual(rules.count(), 6)

    def test_sundarbans_mangrove_is_positive_list(self):
        res = check_eligibility("Forestry", "Afforestation", "conditional")
        self.assertEqual(res, "positive_list")

    def test_awd_rice_methane_is_positive_list(self):
        res = check_eligibility("Agriculture", "Methane Avoidance", "conditional")
        self.assertEqual(res, "positive_list")

    def test_fossil_efficiency_is_negative_list(self):
        res = check_eligibility("Energy", "Fossil Efficiency Upgrade", "conditional")
        self.assertEqual(res, "negative_list")

    def test_unlisted_sector_defaults_to_pending_review(self):
        res = check_eligibility("UnchartedSector", "DirectAirCapture", "beyond_ndc")
        self.assertEqual(res, "pending_review")

    def test_admin_rule_update_changes_eligibility_without_code_deploy(self):
        # Add new dynamic rule for a previously unlisted sector
        PositiveNegativeRule.objects.create(
            sector="Biochar",
            mitigation_type="Pyrolysis",
            ndc_commitment_type="beyond_ndc",
            status="positive_list",
            regulatory_reference="DOE Circular 2026/04"
        )
        res = check_eligibility("Biochar", "Pyrolysis", "beyond_ndc")
        self.assertEqual(res, "positive_list")


class NonNegotiableConstraintsTests(TestCase):
    """
    Tests enforcing the 4 Non-Negotiable Constraints specified in the prompt:
    1. Never submit without attached provenance chain reference.
    2. Corresponding adjustment tracked explicitly, never inferred.
    3. Positive/Negative list checked before project registration and submission.
    4. JCM mapping built from real bilateral methodology standards.
    """

    def setUp(self):
        PositiveNegativeRule.objects.all().delete()
        bootstrap_default_rules()
        self.client = NationalRegistryClient(sandbox_mode=True)

        self.eligible_project = RegistryProject.objects.create(
            project_name="Sundarbans Mangrove Blue Carbon Pilot",
            external_project_id="BD-DOE-AFOLU-001",
            sector="Forestry",
            sectoral_scope="14. Afforestation and reforestation",
            mitigation_type="Afforestation",
            company_tax_id="BIN-8801928374",
            ndc_commitment_type="conditional",
            eligibility_status="positive_list",
            carbon_standard="Verra VM0047"
        )

        self.ineligible_project = RegistryProject.objects.create(
            project_name="Subcritical Coal Efficiency Mod",
            sector="Energy",
            sectoral_scope="01. Energy industries",
            mitigation_type="Fossil Efficiency Upgrade",
            company_tax_id="BIN-9902837461",
            ndc_commitment_type="unconditional",
            eligibility_status="negative_list",
            carbon_standard="CDM Legacy"
        )

        self.mock_carbon_results = [
            {
                "id": str(uuid.uuid4()),
                "estimated_biomass": 160.0,
                "estimated_carbon": 75.0,
                "tonnes_co2e": 275.0,
                "forest_area_ha": 50.0,
                "avg_ndvi": 0.76,
                "carbon_lower_90": 65.0,
                "carbon_upper_90": 85.0,
                "carbon_agb_tc_ha": 38.0,
                "carbon_bgb_tc_ha": 15.0,
                "carbon_soc_tc_ha": 22.0
            }
        ]
        self.valid_provenance_hash = "a7b8c9d0e1f234567890abcdef1234567890abcdef1234567890abcdef123456"

    # --- CONSTRAINT 1: Provenance Chain Reference Required ---
    def test_constraint_1_rejects_missing_provenance_hash(self):
        with self.assertRaises(ProvenanceMissingError):
            self.client.submit_monitoring_report(
                registry_project=self.eligible_project,
                carbon_results=self.mock_carbon_results,
                provenance_chain_hash=""  # Empty hash -> must fail!
            )

    def test_constraint_1_rejects_short_invalid_provenance_hash(self):
        with self.assertRaises(ProvenanceMissingError):
            self.client.submit_monitoring_report(
                registry_project=self.eligible_project,
                carbon_results=self.mock_carbon_results,
                provenance_chain_hash="123"  # Too short to be cryptographic -> must fail!
            )

    # --- CONSTRAINT 3: Eligibility checked before submission ---
    def test_constraint_3_ineligible_project_blocked_from_submission(self):
        with self.assertRaises(IneligibleProjectError):
            self.client.submit_monitoring_report(
                registry_project=self.ineligible_project,
                carbon_results=self.mock_carbon_results,
                provenance_chain_hash=self.valid_provenance_hash
            )

    def test_constraint_3_pending_review_project_blocked_from_submission(self):
        pending_project = RegistryProject.objects.create(
            project_name="Unreviewed Solar Farm",
            sector="Energy",
            sectoral_scope="01",
            mitigation_type="Utility Solar PV",
            company_tax_id="BIN-111",
            ndc_commitment_type="unconditional",
            eligibility_status="pending_review",
            carbon_standard="Gold Standard"
        )
        with self.assertRaises(IneligibleProjectError):
            self.client.submit_monitoring_report(
                registry_project=pending_project,
                carbon_results=self.mock_carbon_results,
                provenance_chain_hash=self.valid_provenance_hash
            )

    # --- CONSTRAINT 1 + 3: Eligible submission succeeds & logs immutably ---
    def test_eligible_project_submits_and_logs_outbound_audit_trail(self):
        initial_count = MonitoringReportSubmission.objects.count()
        res = self.client.submit_monitoring_report(
            registry_project=self.eligible_project,
            carbon_results=self.mock_carbon_results,
            provenance_chain_hash=self.valid_provenance_hash
        )
        self.assertEqual(res["submission_status"], "accepted")
        self.assertEqual(MonitoringReportSubmission.objects.count(), initial_count + 1)

        # Check logged submission in DB
        submission = MonitoringReportSubmission.objects.get(id=res["submission_id"])
        self.assertEqual(submission.provenance_chain_hash_at_submission, self.valid_provenance_hash)
        self.assertEqual(submission.registry_project, self.eligible_project)
        self.assertIn("carbonQuantification", submission.payload_sent)

    # --- CONSTRAINT 2: Corresponding adjustment is tracked explicitly, never inferred ---
    def test_constraint_2_corresponding_adjustment_explicit_tracking(self):
        submission_res = self.client.submit_monitoring_report(
            registry_project=self.eligible_project,
            carbon_results=self.mock_carbon_results,
            provenance_chain_hash=self.valid_provenance_hash
        )
        submission = MonitoringReportSubmission.objects.get(id=submission_res["submission_id"])

        # Create unadjusted record initially
        ca = self.client.record_corresponding_adjustment(
            submission=submission,
            credit_serial_number="BD-2026-ITMO-0001-0500",
            authorized_for_itmo=True,
            itmo_transfer_partner="Japan",
            ndc_inventory_sector="LULUCF_Forestry",
            metric_tonnes_co2e=500.0,
            vintage_year=2026,
            confirm_applied=False,  # Not yet applied
            notes="Awaiting DOE Article 6 DNA bilateral reconciliation note."
        )

        self.assertFalse(ca.adjustment_applied)
        self.assertIsNone(ca.adjustment_applied_at)
        self.assertEqual(ca.reconciliation_status, "pending_issuance")

        # Explicitly confirm adjustment with timestamp and authority reference
        now = timezone.now()
        ca.adjustment_applied = True
        ca.adjustment_applied_at = now
        ca.adjustment_confirmation_id = "DOE-CA-CONFIRM-2026-089"
        ca.reconciliation_status = "adjusted_confirmed"
        ca.save()

        ca.refresh_from_db()
        self.assertTrue(ca.adjustment_applied)
        self.assertIsNotNone(ca.adjustment_applied_at)
        self.assertEqual(ca.adjustment_confirmation_id, "DOE-CA-CONFIRM-2026-089")
        self.assertEqual(ca.reconciliation_status, "adjusted_confirmed")

    # --- CONSTRAINT 4: JCM methodology mapping is built from official standards ---
    def test_constraint_4_jcm_format_mapping(self):
        jcm_project = RegistryProject.objects.create(
            project_name="Japan-Bangladesh Mangrove Carbon Partnership",
            external_project_id="BD-JCM-004",
            sector="Forestry",
            sectoral_scope="14. Afforestation and reforestation",
            mitigation_type="Afforestation",
            company_tax_id="BIN-881928374",
            ndc_commitment_type="conditional",
            eligibility_status="positive_list",
            carbon_standard="JCM"
        )

        monitoring_data = {
            "metadata": {"analysis_date": "2026-09-20"},
            "carbon_pools": {
                "gross_tco2e_ha": 300.0,
                "total_carbon_tc_ha": 81.8,
                "carbon_agb_tc_ha": 40.0,
                "carbon_soc_tc_ha": 25.0,
                "stratum": "SUNDARBANS_MANGROVE"
            },
            "baseline_reference_tco2e": 60.0,
            "remote_sensing_telemetry": {
                "indices": {"ndvi": 0.78, "s1_ratio": 0.36, "tree_height_m": 16.5}
            },
            "uncertainty_and_crediting": {
                "uncertainty_deduction_tco2e_ha": 15.0,
                "buffer_pool_withholding_tco2e_ha": 40.0,
            },
            "cryptographic_provenance_and_trust": {
                "record_hash": self.valid_provenance_hash,
                "previous_hash": "GENESIS",
                "hash_chain_intact": True
            }
        }

        jcm_doc = map_to_jcm_format(
            registry_project=jcm_project,
            monitoring_data=monitoring_data,
            allocation_ratio_bd_pct=50.0
        )

        # Verify JCM header & structure
        self.assertIn("jcm_header", jcm_doc)
        self.assertEqual(jcm_doc["jcm_header"]["document_type"], "JCM Monitoring Report Form (JCM_BD_F_MoR)")
        self.assertIn("section_a_project_description", jcm_doc)
        self.assertIn("section_d_calculation_of_emission_reductions", jcm_doc)
        self.assertIn("section_e_monitored_parameters", jcm_doc)
        self.assertIn("section_g_cryptographic_provenance_and_audit", jcm_doc)

        # Check emission reduction math: ER_p = RE_p - PE_p - deductions
        sec_d = jcm_doc["section_d_calculation_of_emission_reductions"]
        self.assertEqual(sec_d["gross_removals_tco2e"], 300.0)
        self.assertEqual(sec_d["reference_emissions_re_p_tco2e"], 60.0)
        # raw ER = 300 - 60 = 240
        self.assertEqual(sec_d["raw_emission_reduction_tco2e"], 240.0)
        # net = 240 - 15 - 40 = 185
        self.assertEqual(sec_d["net_verified_emission_reductions_tco2e"], 185.0)

        # Check 50/50 bilateral ITMO split
        alloc = sec_d["bilateral_allocation_proposal"]
        self.assertEqual(alloc["bangladesh_retention_tco2e"], 92.5)
        self.assertEqual(alloc["japan_transfer_itmo_tco2e"], 92.5)


class BTRExportTests(TestCase):
    """Tests for Biennial Transparency Report (BTR) export under Article 13 & 6.2."""

    def setUp(self):
        PositiveNegativeRule.objects.all().delete()
        bootstrap_default_rules()

        self.project = RegistryProject.objects.create(
            project_name="AWD Rice Methane Abatement Rangpur",
            external_project_id="BD-AGRI-002",
            sector="Agriculture",
            sectoral_scope="15. Agriculture",
            mitigation_type="Methane Avoidance",
            company_tax_id="BIN-772819384",
            ndc_commitment_type="conditional",
            eligibility_status="positive_list",
            carbon_standard="Gold Standard"
        )

        self.submission = MonitoringReportSubmission.objects.create(
            registry_project=self.project,
            carbon_result_ids=["res-001"],
            provenance_chain_hash_at_submission="11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
            payload_sent={"carbonQuantification": {"grossTonnesCo2e": 1200.0}},
            response_status=201,
            response_body={"status": "ACCEPTED"},
            submission_status="accepted"
        )

        # Add Corresponding Adjustment
        self.ca = CorrespondingAdjustment.objects.create(
            monitoring_report_submission=self.submission,
            credit_serial_number="BD-GS-2026-0001-1200",
            authorized_for_itmo=True,
            itmo_transfer_partner="Switzerland",
            adjustment_applied=True,
            adjustment_applied_at=timezone.now(),
            adjustment_confirmation_id="DOE-CH-CONF-2026",
            ndc_inventory_sector="Agriculture",
            metric_tonnes_co2e=1200.0,
            vintage_year=2026,
            reconciliation_status="adjusted_confirmed"
        )

    def test_btr_structured_summary_generation(self):
        summary = generate_btr_structured_summary(registry_project=self.project, reporting_year=2026)
        self.assertEqual(summary["btr_metadata"]["submitting_party"], "People's Republic of Bangladesh")
        self.assertEqual(summary["headline_article_6_metrics"]["total_corresponding_adjustments_applied_tco2e"], 1200.0)
        self.assertEqual(summary["headline_article_6_metrics"]["adjustments_by_national_inventory_sector_tco2e"]["Agriculture"], 1200.0)

        rows = summary["table_structured_summary_itmos"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["unique_identifier"], "BD-GS-2026-0001-1200")
        self.assertTrue(rows[0]["corresponding_adjustment_applied"])

    def test_btr_csv_export(self):
        summary = generate_btr_structured_summary(registry_project=self.project, reporting_year=2026)
        csv_text = export_btr_csv(summary)
        self.assertIn("BD-GS-2026-0001-1200", csv_text)
        self.assertIn("Switzerland", csv_text)
        self.assertIn("YES", csv_text)


class RESTApiTests(TestCase):
    """Integration tests for authenticated, tenant-scoped REST API endpoints."""

    def setUp(self):
        self.user_a = User.objects.create_user(username="org_a_user", password="pw")
        self.user_b = User.objects.create_user(username="org_b_user", password="pw")
        self.unauth_client = APIClient()
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.user_a)
        self.client_b = APIClient()
        self.client_b.force_authenticate(user=self.user_b)

        PositiveNegativeRule.objects.all().delete()
        bootstrap_default_rules()

        self.project = RegistryProject.objects.create(
            organization_id=f"user-{self.user_a.pk}",
            owner=self.user_a,
            project_name="Coastal Sundarbans Blue Carbon Phase 1",
            external_project_id="BD-AFOLU-001",
            sector="Forestry",
            sectoral_scope="14",
            mitigation_type="Afforestation",
            company_tax_id="BIN-123456",
            ndc_commitment_type="conditional",
            eligibility_status="positive_list",
            carbon_standard="JCM"
        )
        self.job = AnalysisJob.objects.create(
            status="completed",
            polygon_geojson="[[22.25, 89.50], [22.35, 89.50], [22.35, 89.60]]",
            analysis_type="ndvi",
            start_date=datetime.date(2026, 1, 1),
            end_date=datetime.date(2026, 5, 1),
        )
        self.carbon_result = CarbonResult.objects.create(
            job=self.job,
            estimated_biomass=160.0,
            estimated_carbon=75.0,
            tonnes_co2e=275.0,
            avg_ndvi=0.76,
            forest_area_ha=50.0,
            confidence=0.91,
        )

    def test_unauthenticated_and_cross_tenant_blocked(self):
        self.assertIn(self.unauth_client.get("/api/registry-bridge/projects/").status_code, (401, 403))
        self.assertIn(self.unauth_client.get("/api/registry-bridge/btr-summary/").status_code, (401, 403))
        self.assertEqual(
            self.client_b.get(f"/api/registry-bridge/projects/{self.project.id}/").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_doe_url_does_not_force_sandbox_and_requires_api_key(self):
        with self.assertRaises(RegistryBridgeError):
            NationalRegistryClient(base_url="https://registry.doe.gov.bd/national-api", api_key="")
        live_client = NationalRegistryClient(base_url="https://registry.doe.gov.bd/national-api", api_key="live-token")
        self.assertFalse(live_client.sandbox_mode)

    def test_check_eligibility_endpoint(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/check-eligibility/"
        resp = self.api_client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data["is_eligible_for_submission"])
        self.assertEqual(resp.data["current_eligibility"], "positive_list")

    def test_submit_monitoring_report_rejects_missing_results_and_accepts_real_result(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/submit-monitoring-report/"
        # Missing DB ID must fail cleanly without injecting mocks
        bad_payload = {
            "carbon_result_ids": [str(uuid.uuid4())],
            "provenance_chain_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "force_sandbox_success": True
        }
        bad_resp = self.api_client.post(url, bad_payload, format="json")
        self.assertEqual(bad_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(bad_resp.data["error"], "MissingCarbonResults")

        # Real CarbonResult succeeds in sandbox when explicitly enabled
        import os
        prev_sandbox = os.environ.get("NATIONAL_REGISTRY_SANDBOX_MODE")
        os.environ["NATIONAL_REGISTRY_SANDBOX_MODE"] = "true"
        try:
            payload = {
                "carbon_result_ids": [str(self.carbon_result.id)],
                "provenance_chain_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "force_sandbox_success": True
            }
            resp = self.api_client.post(url, payload, format="json")
            self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
            self.assertEqual(resp.data["submission_status"], "accepted")
        finally:
            if prev_sandbox is None:
                os.environ.pop("NATIONAL_REGISTRY_SANDBOX_MODE", None)
            else:
                os.environ["NATIONAL_REGISTRY_SANDBOX_MODE"] = prev_sandbox

    def test_jcm_export_requires_real_submission_and_exports_from_submission(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/jcm-export/"
        # Before any submission -> 422 (no silent mock bundle)
        empty_resp = self.api_client.get(url)
        self.assertEqual(empty_resp.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        MonitoringReportSubmission.objects.create(
            registry_project=self.project,
            carbon_result_ids=[str(self.carbon_result.id)],
            provenance_chain_hash_at_submission="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            payload_sent={
                "carbonQuantification": {
                    "grossTonnesCo2e": 275.0,
                    "grossEstimatedCarbonTcHa": 75.0,
                    "averageNdvi": 0.76,
                    "multiPoolVector": {"abovegroundBiomassCarbonTcHa": 40.0, "belowgroundBiomassCarbonTcHa": 15.0, "soilOrganicCarbonTcHa": 20.0},
                },
                "conformalUncertaintyAnalysis": {"conservativeCreditableTco2e": 260.0},
                "provenanceAuditTrail": {"hashVerificationState": "INTACT", "quorumReached": False},
            },
            response_status=201,
            response_body={"status": "ACCEPTED"},
            submission_status="accepted",
        )
        resp = self.api_client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("jcm_header", resp.data)
        self.assertEqual(resp.data["section_a_project_description"]["project_title"], self.project.project_name)

    def test_btr_summary_csv_endpoint_and_verification_gate(self):
        url = "/api/registry-bridge/btr-summary/?format=csv"
        resp = self.api_client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp["Content-Type"], "text/csv")
        self.assertIn("Unique ITMO Identifier", resp.content.decode("utf-8"))

        json_resp = self.api_client.get("/api/registry-bridge/btr-summary/")
        self.assertEqual(json_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(json_resp.data["btr_metadata"]["verification_gate_status"], "UNVERIFIED_OR_SANDBOX_ONLY")
        self.assertIn("UNVERIFIED / SANDBOX NOTICE", json_resp.data["methodological_consistency_statement"])

    def test_jcm_requires_epoch_delta_and_deducts_project_emissions(self):
        # Single standing stock without delta or baseline -> 0 creditable (no 0.20*gross fabrication)
        standing_only = {
            "carbon_pools": {"gross_tco2e_ha": 400.0, "total_carbon_tc_ha": 109.0},
            "uncertainty_and_crediting": {"uncertainty_deduction_tco2e_ha": 0.0, "buffer_pool_withholding_tco2e_ha": 0.0},
        }
        doc_standing = map_to_jcm_format(self.project, standing_only)
        sec_d = doc_standing["section_d_calculation_of_emission_reductions"]
        self.assertEqual(sec_d["crediting_basis"], "STANDING_STOCK_ONLY_NOT_CREDITABLE_WITHOUT_EPOCH_DELTA")
        self.assertEqual(sec_d["net_verified_emission_reductions_tco2e"], 0.0)

        # Explicit removal delta + project emissions (diesel + fertilizer N2O)
        epoch_data = {
            "delta_project_tco2e": 120.0,
            "baseline_delta_tco2e": 20.0,
            "project_emissions": {"diesel_liters": 1000.0, "fertilizer_kg_n": 100.0},
            "carbon_pools": {"gross_tco2e_ha": 400.0, "total_carbon_tc_ha": 109.0},
            "uncertainty_and_crediting": {"uncertainty_deduction_tco2e_ha": 5.0, "buffer_pool_withholding_tco2e_ha": 15.0},
        }
        doc_epoch = map_to_jcm_format(self.project, epoch_data)
        sec_d_ep = doc_epoch["section_d_calculation_of_emission_reductions"]
        self.assertEqual(sec_d_ep["crediting_basis"], "EPOCH_REMOVAL_DELTA")
        self.assertGreater(sec_d_ep["project_emissions_pe_p_tco2e"], 3.0)
        self.assertLess(sec_d_ep["net_verified_emission_reductions_tco2e"], 80.0)

    def test_aoi_overlap_loa_lifecycle_aef_and_cad_trust(self):
        poly_a = json.dumps({
            "type": "Polygon",
            "coordinates": [[[89.50, 22.20], [89.60, 22.20], [89.60, 22.30], [89.50, 22.30], [89.50, 22.20]]],
        })
        poly_overlap = json.dumps({
            "type": "Polygon",
            "coordinates": [[[89.55, 22.22], [89.65, 22.22], [89.65, 22.32], [89.55, 22.32], [89.55, 22.22]]],
        })
        base_proj = {
            "project_name": "Sundarbans Block A",
            "sector": "Forestry",
            "sectoral_scope": "14",
            "mitigation_type": "Afforestation",
            "company_tax_id": "TIN-111",
            "ndc_commitment_type": "conditional",
            "carbon_standard": "Verra",
            "polygon_geojson": poly_a,
        }
        r1 = self.api_client.post("/api/registry-bridge/projects/", base_proj, format="json")
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        pid = r1.data["id"]

        # Overlapping project must be blocked (400 validation error)
        overlap_proj = {**base_proj, "project_name": "Duplicate Double-Count Zone", "polygon_geojson": poly_overlap}
        r_ov = self.api_client.post("/api/registry-bridge/projects/", overlap_proj, format="json")
        self.assertEqual(r_ov.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("polygon_geojson", r_ov.data)

        # Record & revoke Art. 6.2 LoA
        loa_hash = "a" * 64
        r_loa = self.api_client.post(f"/api/registry-bridge/projects/{pid}/record-loa/", {
            "loa_reference": "DOE-LOA-2026-01", "loa_sha256": loa_hash
        }, format="json")
        self.assertEqual(r_loa.status_code, status.HTTP_200_OK)
        self.assertEqual(r_loa.data["article62_loa_status"], "ACTIVE")

        # UNFCCC AEF JSON & CSV Export
        aef_resp = self.api_client.get("/api/registry-bridge/aef-export/")
        self.assertEqual(aef_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(aef_resp.data["schema"], "unfccc-art62-aef-6cma6-v1")
        self.assertTrue(any(row["loa_reference"] == "DOE-LOA-2026-01" for row in aef_resp.data["table_1_authorizations"]))

        # CAD Trust sync without credentials fails closed (503)
        cad_resp = self.api_client.post(f"/api/registry-bridge/projects/{pid}/cad-trust-sync/", {}, format="json")
        self.assertEqual(cad_resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(cad_resp.data["status"], "FAILED_CLOSED_NO_CAD_TRUST_CREDENTIALS")

        # Revoke LoA -> submission blocked with 409 LoARevoked
        r_rev = self.api_client.post(f"/api/registry-bridge/projects/{pid}/revoke-loa/", {"reason": "Boundary dispute"}, format="json")
        self.assertEqual(r_rev.status_code, status.HTTP_200_OK)
        self.assertEqual(r_rev.data["article62_loa_status"], "REVOKED")
        r_sub = self.api_client.post(f"/api/registry-bridge/projects/{pid}/submit-monitoring-report/", {
            "carbon_result_ids": [str(self.carbon_result.id)],
            "provenance_chain_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }, format="json")
        self.assertEqual(r_sub.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(r_sub.data["error"], "LoARevoked")
