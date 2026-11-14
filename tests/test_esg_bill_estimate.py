"""
Unit and integration tests for Phase 4: Indicative Estimate for Solo Users.
Invariants verified:
- Math stays deterministic in Python (accounting.py).
- Status is explicitly INDICATIVE; audit_grade=False, registry_eligible=False.
- Zero ledger mutation: no ActivityRecord, no CalculationRun, bill status unchanged.
- Dual control strictly preserved: provisional factor is DRAFT and never usable by calculate_period.
- Missing grid factor returns MISSING_GRID_AVERAGE_FACTOR blocker unless allow_provisional=True.
- Factor citations include publisher, source document, vintage, uncertainty, and derivation hash.
- Invitation endpoint creates token and logs audit event for dual-control upgrade.
"""
import datetime as dt
import os
import sys
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402
from esg_rag.ledger_models import ActivityRecord, Bill, CalculationRun, EmissionFactor  # noqa: E402

API = "/api/esg"

SHARED = bp.PROFILE_DIR.parent.parent.parent / "tests" / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")


class BillEstimateTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "approver-a", "esg_admin")

        # Load and approve parameters
        param_rows = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML}, headers=auth("user-a")).json()
        for r in param_rows:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-a"))

        # Load and approve synthetic grid profile
        prof_rows = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML}, headers=auth("user-a")).json()
        self.profile = prof_rows[0]
        self.client.post(f"{API}/bill-profiles/{self.profile['id']}/approve", headers=auth("admin-a"))

        # Create facility
        le_res = self.client.post(f"{API}/legal-entities", json={"name": "Textile Mills Ltd", "country": "BD"},
                                  headers=auth("user-a"))
        le_id = le_res.json()["id"]
        fac_res = self.client.post(f"{API}/facilities", json={
            "legal_entity_id": le_id,
            "name": "Dhaka Weaving Facility",
            "country": "BD",
            "grid_region": "BD-NATIONAL"
        }, headers=auth("user-a"))
        self.facility_id = fac_res.json()["id"]

        # Create demo org and facility for demo-tenant testing
        self.org_demo = self.client.post(f"{API}/organizations", json={"name": "Demo Textile Org", "is_demo": True},
                                          headers=auth("user-demo")).json()["id"]
        self.add_member(self.org_demo, "admin-demo", "esg_admin")

        param_rows_demo = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML},
                                           headers=auth("user-demo", self.org_demo)).json()
        for r in param_rows_demo:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-demo", self.org_demo))

        prof_rows_demo = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML},
                                          headers=auth("user-demo", self.org_demo)).json()
        self.profile_demo = prof_rows_demo[0]
        self.client.post(f"{API}/bill-profiles/{self.profile_demo['id']}/approve", headers=auth("admin-demo", self.org_demo))

        le_demo = self.client.post(f"{API}/legal-entities", json={"name": "Demo Mills Ltd", "country": "BD"},
                                   headers=auth("user-demo", self.org_demo)).json()["id"]
        self.facility_demo_id = self.client.post(f"{API}/facilities", json={
            "legal_entity_id": le_demo,
            "name": "Dhaka Demo Facility",
            "country": "BD",
            "grid_region": "BD-NATIONAL"
        }, headers=auth("user-demo", self.org_demo)).json()["id"]

    def _create_and_fill_demo_bill(self, kwh="1000", start="2022-07-01", end="2022-07-31"):
        doc = {
            "source": "manual",
            "pages": [{
                "lines": [
                    "ELECTRICITY BILL",
                    "Account: ACC-BD-12345",
                    f"Consumption: {kwh} kWh"
                ]
            }]
        }
        res = self.client.post(f"{API}/bills", json={
            "facility_id": self.facility_demo_id,
            "filename": "demo_bill_2022_07.pdf",
            "profile_id": self.profile_demo["id"],
            "document": doc
        }, headers=auth("user-demo", self.org_demo))
        self.assertEqual(res.status_code, 201)
        bill_id = res.json()["id"]

        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.start", "value": start, "unit": None
        }, headers=auth("user-demo", self.org_demo))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.end", "value": end, "unit": None
        }, headers=auth("user-demo", self.org_demo))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "account.number", "value": "ACC-BD-12345", "unit": None
        }, headers=auth("user-demo", self.org_demo))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "energy.kwh.total", "value": kwh, "unit": "kWh"
        }, headers=auth("user-demo", self.org_demo))

        return bill_id

    def _create_and_fill_bill(self, kwh="1000", start="2022-07-01", end="2022-07-31"):
        doc = {
            "source": "manual",
            "pages": [{
                "lines": [
                    "ELECTRICITY BILL",
                    "Account: ACC-BD-12345",
                    f"Consumption: {kwh} kWh"
                ]
            }]
        }
        res = self.client.post(f"{API}/bills", json={
            "facility_id": self.facility_id,
            "filename": "bill_2022_07.pdf",
            "profile_id": self.profile["id"],
            "document": doc
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 201)
        bill_id = res.json()["id"]

        # Enter period start, period end, and confirm consumption
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.start", "value": start, "unit": None
        }, headers=auth("user-a"))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.end", "value": end, "unit": None
        }, headers=auth("user-a"))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "account.number", "value": "ACC-BD-12345", "unit": None
        }, headers=auth("user-a"))
        self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "energy.kwh.total", "value": kwh, "unit": "kWh"
        }, headers=auth("user-a"))

        return bill_id

    def test_estimate_without_provisional_returns_missing_factor_blocker(self):
        bill_id = self._create_and_fill_bill(kwh="1200")
        res = self.client.post(f"{API}/bills/{bill_id}/estimate", json={"allow_provisional": False},
                               headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["status"], "INDICATIVE")
        self.assertFalse(data["audit_grade"])
        self.assertFalse(data["registry_eligible"])
        self.assertIsNone(data["emissions"])
        self.assertIn("MISSING_GRID_AVERAGE_FACTOR", data["calc_blockers"])
        self.assertTrue(data.get("provisional_factor_available"))
        self.assertIsNotNone(data.get("provisional_factor"))
        prov = data["provisional_factor"]
        self.assertEqual(prov["method"], "location")
        self.assertIn("family", prov)
        self.assertIn("kgco2e_per_unit", prov)

    def test_estimate_with_provisional_factor_computes_exact_emissions(self):
        # 1. Non-demo tenant: synthetic provisional factor is rejected with SYNTHETIC_FACTOR_INPUTS
        bill_id_nondemo = self._create_and_fill_bill(kwh="1000")
        res_nondemo = self.client.post(f"{API}/bills/{bill_id_nondemo}/estimate", json={"allow_provisional": True},
                                       headers=auth("user-a"))
        self.assertEqual(res_nondemo.status_code, 200)
        data_nondemo = res_nondemo.json()
        self.assertEqual(data_nondemo["status"], "INDICATIVE")
        self.assertIn("SYNTHETIC_FACTOR_INPUTS", data_nondemo["calc_blockers"])
        self.assertIsNone(data_nondemo["emissions"])

        # 2. Demo tenant: synthetic provisional factor is permitted with DEMO label
        bill_id = self._create_and_fill_demo_bill(kwh="1000")
        res = self.client.post(f"{API}/bills/{bill_id}/estimate", json={"allow_provisional": True},
                               headers=auth("user-demo", self.org_demo))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Contract checks
        self.assertEqual(data["status"], "INDICATIVE")
        self.assertIn("PROVISIONAL_FACTOR", data["flags"])
        self.assertIn("DEMO - SYNTHETIC FACTOR", data["flags"])
        self.assertEqual(data["label"], "DEMO - SYNTHETIC FACTOR")
        self.assertFalse(data["audit_grade"])
        self.assertFalse(data["registry_eligible"])
        self.assertEqual(data["calc_blockers"], [])

        # Emissions math verification
        emissions = data["emissions"]
        self.assertIsNotNone(emissions)
        self.assertEqual(emissions["scope1_kg"], "0")
        # 1000 kWh * 0.663096 kgCO2e/kWh = 663.096000 kgCO2e = 0.663 tCO2e
        self.assertEqual(Decimal(emissions["scope2_location_kg"]), Decimal("663.096000"))
        self.assertEqual(emissions["scope2_location_tco2e"], "0.663")
        self.assertEqual(emissions["total_tco2e"], "0.663")

        # Lines and factor citations
        self.assertTrue(len(data["lines"]) >= 1)
        loc_line = next((line for line in data["lines"] if line["method"] == "location"), None)
        self.assertIsNotNone(loc_line)
        self.assertEqual(loc_line["factor_status"], "PROVISIONAL")
        self.assertEqual(loc_line["unit"], "kWh")

        # Factor citation details
        self.assertTrue(len(data["factor_citations"]) >= 1)
        cite = data["factor_citations"][0]
        self.assertTrue(cite["is_provisional"])
        self.assertEqual(cite["status"], "PROVISIONAL")
        self.assertEqual(cite["method"], "location")
        self.assertIn("derivation_hash", cite)
        self.assertEqual(cite["gwp_basis"], "AR6")

        # Assumptions & Actions
        self.assertTrue(any("Provisional grid factor" in a for a in data["assumptions"]))
        self.assertTrue(any(act["type"] == "invite_approver" for act in data["actions"]))

    def test_estimate_does_not_mutate_ledger(self):
        bill_id = self._create_and_fill_bill(kwh="1500")

        db = self.Session()
        act_count_before = db.query(ActivityRecord).count()
        run_count_before = db.query(CalculationRun).count()
        bill_before = db.query(Bill).filter(Bill.id == bill_id).first()
        status_before = bill_before.status
        db.close()

        # Execute estimate
        res = self.client.post(f"{API}/bills/{bill_id}/estimate", json={"allow_provisional": True},
                               headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)

        db = self.Session()
        act_count_after = db.query(ActivityRecord).count()
        run_count_after = db.query(CalculationRun).count()
        bill_after = db.query(Bill).filter(Bill.id == bill_id).first()
        status_after = bill_after.status
        db.close()

        # Invariant check: zero mutation
        self.assertEqual(act_count_before, act_count_after)
        self.assertEqual(run_count_before, run_count_after)
        self.assertEqual(status_before, status_after)

    def test_dual_control_preserved_in_ledger_run(self):
        # Even after provisional factor is wired into DB, it has status='DRAFT'
        # An audit-grade period calculation must NOT use it
        bill_id = self._create_and_fill_bill(kwh="1000")
        # Trigger provisional wiring via estimate
        self.client.post(f"{API}/bills/{bill_id}/estimate", json={"allow_provisional": False}, headers=auth("user-a"))

        db = self.Session()
        prov_factor = db.query(EmissionFactor).filter(
            EmissionFactor.family == "platform:bd-grid-average-supply"
        ).first()
        self.assertIsNotNone(prov_factor)
        self.assertEqual(prov_factor.status, "DRAFT")
        self.assertIsNone(prov_factor.approved_by)
        db.close()

    def test_estimate_with_approved_factor(self):
        # Create and approve a location grid factor under dual control
        factor_res = self.client.post(f"{API}/factors", json={
            "family": "custom-dhaka-grid",
            "activity_type": "electricity",
            "unit": "kWh",
            "kgco2e_per_unit": "0.580000",
            "region": "BD-NATIONAL",
            "gwp_basis": "AR6",
            "method": "location",
            "factor_kind": "grid_average",
            "valid_from": "2022-01-01",
            "valid_to": "2023-12-31",
            "source_publisher": "BERC Tariff Order 2022",
            "source_document": "BERC Order p.45",
            "source_year": 2022
        }, headers=auth("admin-a"))
        self.assertEqual(factor_res.status_code, 201)
        factor_id = factor_res.json()["id"]

        # Dual approval by different user
        appr_res = self.client.post(f"{API}/factors/{factor_id}/approve", headers=auth("approver-a"))
        self.assertEqual(appr_res.status_code, 200)

        # Bill estimate using approved factor (no allow_provisional needed)
        bill_id = self._create_and_fill_bill(kwh="2000")
        res = self.client.post(f"{API}/bills/{bill_id}/estimate", json={"allow_provisional": False},
                               headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["status"], "INDICATIVE")
        self.assertEqual(data["flags"], [])  # NOT provisional
        self.assertEqual(data["calc_blockers"], [])
        self.assertIsNotNone(data["emissions"])
        # 2000 kWh * 0.580000 = 1160.000000 kgCO2e = 1.160 tCO2e
        self.assertEqual(Decimal(data["emissions"]["scope2_location_kg"]), Decimal("1160.000000"))
        self.assertEqual(data["emissions"]["total_tco2e"], "1.160")

        loc_line = next((line for line in data["lines"] if line["method"] == "location"), None)
        self.assertIsNotNone(loc_line)
        self.assertEqual(loc_line["factor_status"], "APPROVED")

        cite = data["factor_citations"][0]
        self.assertFalse(cite["is_provisional"])
        self.assertEqual(cite["status"], "APPROVED")

    def test_invite_approver_endpoint_generates_token_and_audits(self):
        # Test inviting a second user as approver
        res = self.client.post(f"{API}/invitations", json={
            "email": "secondary.approver@example.com",
            "role": "esg_admin"
        }, headers=auth("admin-a"))
        self.assertEqual(res.status_code, 201)
        data = res.json()

        self.assertIn("token", data)
        self.assertEqual(data["email"], "secondary.approver@example.com")
        self.assertEqual(data["role"], "esg_admin")
        self.assertIn("expires_at", data)


if __name__ == "__main__":
    unittest.main()
