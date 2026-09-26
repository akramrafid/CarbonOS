import uuid
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

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
    """Integration tests for REST API endpoints."""

    def setUp(self):
        self.api_client = APIClient()
        PositiveNegativeRule.objects.all().delete()
        bootstrap_default_rules()

        self.project = RegistryProject.objects.create(
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

    def test_check_eligibility_endpoint(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/check-eligibility/"
        resp = self.api_client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data["is_eligible_for_submission"])
        self.assertEqual(resp.data["current_eligibility"], "positive_list")

    def test_submit_monitoring_report_endpoint(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/submit-monitoring-report/"
        payload = {
            "carbon_result_ids": [str(uuid.uuid4())],
            "provenance_chain_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "force_sandbox_success": True
        }
        resp = self.api_client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["submission_status"], "accepted")

    def test_jcm_export_endpoint(self):
        url = f"/api/registry-bridge/projects/{self.project.id}/jcm-export/"
        resp = self.api_client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("jcm_header", resp.data)
        self.assertEqual(resp.data["section_a_project_description"]["project_title"], self.project.project_name)

    def test_btr_summary_csv_endpoint(self):
        url = "/api/registry-bridge/btr-summary/?format=csv"
        resp = self.api_client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp["Content-Type"], "text/csv")
        self.assertIn("Unique ITMO Identifier", resp.content.decode("utf-8"))
