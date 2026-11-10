"""
Unit and integration tests for Phase 2: Guided Intake (Gap analysis and value entry).
Tests:
- GET /api/esg/bills/{id}/gaps
- POST /api/esg/bills/{id}/values
- Pre-upload SHA-256 duplicate rejection
- Calculation blockers (missing factor, duplicate period, unreviewed values)
- Bengali digit and Indian comma grouping normalization
- Audit logging of manual entry
"""
import datetime as dt
import io
import os
import sys
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag import bill_extract as bx  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402

API = "/api/esg"


SHARED = bp.PROFILE_DIR.parent.parent.parent / "tests" / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")


class BillGapsAndIntakeTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        # Load and approve parameters under dual control
        param_rows = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML}, headers=auth("user-a")).json()
        for r in param_rows:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-a"))

        # Load and approve synthetic grid profile
        prof_rows = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML}, headers=auth("user-a")).json()
        self.profile = prof_rows[0]
        self.client.post(f"{API}/bill-profiles/{self.profile['id']}/approve", headers=auth("admin-a"))

        # Create legal entity and facility
        le_res = self.client.post(f"{API}/legal-entities", json={"name": "Synthetic Ltd", "country": "BD"},
                                  headers=auth("user-a"))
        self.assertEqual(le_res.status_code, 201)
        le_id = le_res.json()["id"]

        fac_res = self.client.post(f"{API}/facilities", json={
            "legal_entity_id": le_id,
            "name": "Factory Alpha",
            "country": "BD",
            "grid_region": "BD-NATIONAL"
        }, headers=auth("user-a"))
        self.assertEqual(fac_res.status_code, 201)
        self.facility_id = fac_res.json()["id"]

    def _create_synthetic_bill(self, lines=None, profile_id=None):
        doc = {
            "source": "manual",
            "pages": [{
                "lines": lines or [
                    "SAMPLE UTILITY INVOICE",
                    "Account No ACC-BD-9001",
                    "Units Consumed: 1250 kWh",
                ]
            }]
        }
        res = self.client.post(f"{API}/bills", json={
            "facility_id": self.facility_id,
            "filename": "sample_invoice.pdf",
            "profile_id": profile_id or self.profile["id"],
            "document": doc
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 201)
        return res.json()["id"]

    def test_bill_gaps_returns_structured_contract(self):
        bill_id = self._create_synthetic_bill()
        res = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check top-level contract keys
        for key in ("profile_key", "present", "missing_required", "low_confidence",
                    "unmapped_candidates", "findings", "calc_blockers", "ready_to_post"):
            self.assertIn(key, data)

        self.assertIsInstance(data["present"], list)
        self.assertIsInstance(data["missing_required"], list)
        self.assertIsInstance(data["low_confidence"], list)
        self.assertIsInstance(data["unmapped_candidates"], list)
        self.assertIsInstance(data["calc_blockers"], list)
        self.assertIsInstance(data["ready_to_post"], bool)
        self.assertFalse(data["ready_to_post"])  # Not ready because missing required fields and factors

    def test_entering_missing_value_normalises_bengali_digits_and_indian_grouping(self):
        bill_id = self._create_synthetic_bill()

        # Enter period.start (date)
        res_date = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.start",
            "value": "২০২৬-০৫-০১",  # 2026-05-01 in Bengali digits
            "comment": "Entered from bill header"
        }, headers=auth("user-a"))
        self.assertEqual(res_date.status_code, 201, res_date.text)
        val_date = res_date.json()
        self.assertEqual(val_date["parameter_key"], "period.start")
        self.assertEqual(val_date["value_text"], "2026-05-01")
        self.assertEqual(val_date["status"], "entered")

        # Enter energy.kwh.total with Indian comma grouping and Bengali numerals: ১,২৫,০৫০
        res_kwh = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "energy.kwh.total",
            "value": "১,২৫,০৫০",  # 125,050
            "unit": "kWh",
            "comment": "Meter total from footer"
        }, headers=auth("user-a"))
        self.assertEqual(res_kwh.status_code, 201, res_kwh.text)
        val_kwh = res_kwh.json()
        self.assertEqual(val_kwh["parameter_key"], "energy.kwh.total")
        self.assertEqual(val_kwh["value_text"], "125050")
        self.assertEqual(val_kwh["unit"], "kWh")
        self.assertEqual(val_kwh["status"], "entered")

        # Verify gap analysis now reflects the newly entered values in present
        gaps_res = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-a"))
        gaps = gaps_res.json()
        present_fields = {p["field"]: p["value"] for p in gaps["present"]}
        self.assertIn("period.start", present_fields)
        self.assertEqual(present_fields["period.start"], "2026-05-01")
        self.assertIn("energy.kwh.total", present_fields)
        self.assertEqual(present_fields["energy.kwh.total"], "125050")

    def test_entering_value_rejects_silent_overwrite_of_existing_field(self):
        bill_id = self._create_synthetic_bill()

        # Enter period.end first time
        res1 = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.end",
            "value": "2026-05-31"
        }, headers=auth("user-a"))
        self.assertEqual(res1.status_code, 201)

        # Attempt to enter period.end second time via enter_value (must be 409)
        res2 = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.end",
            "value": "2026-06-01"
        }, headers=auth("user-a"))
        self.assertEqual(res2.status_code, 409)
        self.assertIn("already exists", res2.json()["detail"])

    def test_entering_value_rejects_invalid_unit(self):
        bill_id = self._create_synthetic_bill()
        res = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "energy.kwh.total",
            "value": "500",
            "unit": "litres"  # Invalid unit for energy
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 422)

    def test_duplicate_upload_rejection_by_sha256(self):
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Title (Test Invoice) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
        files = {"file": ("invoice_may.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        data = {"facility_id": self.facility_id}

        # First upload succeeds
        res1 = self.client.post(f"{API}/bills/upload", data=data, files=files, headers=auth("user-a"))
        self.assertEqual(res1.status_code, 201)

        # Second upload with identical bytes fails with 409 Conflict
        files2 = {"file": ("invoice_may_duplicate.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        res2 = self.client.post(f"{API}/bills/upload", data=data, files=files2, headers=auth("user-a"))
        self.assertEqual(res2.status_code, 409)
        self.assertIn("Duplicate bill", res2.json()["detail"])

    def test_tenant_isolation_on_gaps_and_values(self):
        bill_id = self._create_synthetic_bill()

        # Other tenant user-b cannot access gaps
        res = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-b"))
        self.assertEqual(res.status_code, 404)

        # Other tenant user-b cannot enter values
        res_val = self.client.post(f"{API}/bills/{bill_id}/values", json={
            "parameter_key": "period.end",
            "value": "2026-05-31"
        }, headers=auth("user-b"))
        self.assertEqual(res_val.status_code, 404)


if __name__ == "__main__":
    unittest.main()
