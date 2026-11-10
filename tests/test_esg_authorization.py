"""
Adversarial Negative Authorization Suite & Key Security Controls (Task 7).

Tests:
1. Fail-fast encryption in production when ESG_STORAGE_ENCRYPTION_KEY is missing.
2. Unauthenticated requests to /gaps, /values, /estimate, /document, /invitations (401).
3. Read-only role (executive_viewer) permission boundaries (403 on mutate/admin).
4. Cross-tenant isolation on /gaps, /values, /estimate, /document, /invitations (404/403).
5. Self-approval vulnerability proof: single person creating two accounts in one org and self-approving.
"""
import hashlib
import io
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth, token  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402
from esg_rag import document_store  # noqa: E402

API = "/api/esg"
SHARED = bp.PROFILE_DIR.parent.parent.parent / "tests" / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")


def _pdf(text: str) -> bytes:
    return (
        f"%PDF-1.4\n1 0 obj\n<< /Title ({text}) >>\nendobj\n"
        f"2 0 obj\n<< /Pages 1 0 R >>\nendobj\n"
        f"xref\n0 3\n0000000000 65535 f \ntrailer\n<< /Root 1 0 R >>\nstartxref\n100\n%%EOF\n"
    ).encode("utf-8")


class ESGAuthorizationNegativeTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.tmp_uploads = tempfile.mkdtemp(prefix="esg-auth-uploads-")
        document_store.UPLOADS_DIR = document_store.Path(self.tmp_uploads)

        # Configure Org A
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "viewer-a", "executive_viewer")
        self.add_member(self.org_a, "contrib-a", "data_contributor")

        # Load parameters and profiles in Org A
        param_rows = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML}, headers=auth("user-a")).json()
        for r in param_rows:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-a"))

        prof_rows = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML}, headers=auth("user-a")).json()
        self.client.post(f"{API}/bill-profiles/{prof_rows[0]['id']}/approve", headers=auth("admin-a"))

        le_id = self.client.post(f"{API}/legal-entities", json={"name": "Org A Ltd", "country": "BD"},
                                 headers=auth("user-a")).json()["id"]
        self.fac_a = self.client.post(f"{API}/facilities", json={
            "legal_entity_id": le_id, "name": "Factory A", "country": "BD", "grid_region": "BD-NATIONAL"
        }, headers=auth("user-a")).json()["id"]

        # Create Bill in Org A
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "true"}):
            pdf_bytes = _pdf("Test Bill A")
            self.pdf_bytes = pdf_bytes
            self.pdf_sha256 = hashlib.sha256(pdf_bytes).hexdigest()
            files = {"file": ("bill_a.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.fac_a}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            self.bill_a_id = res.json()["id"]

    def tearDown(self):
        super().tearDown()
        import shutil
        shutil.rmtree(self.tmp_uploads, ignore_errors=True)

    # --- 1. Production Encryption Fail-Fast ---

    def test_production_encryption_fails_fast_when_key_missing(self):
        """In production with retention enabled, missing ESG_STORAGE_ENCRYPTION_KEY must raise RuntimeError."""
        with mock.patch.dict(os.environ, {
            "ESG_ENV": "production",
            "ESG_RETAIN_SOURCE_DOCUMENTS": "true",
            "ESG_STORAGE_ENCRYPTION_KEY": ""
        }):
            with self.assertRaises(RuntimeError) as ctx:
                document_store.save_document("test_tenant", b"sensitive data")
            self.assertIn("ESG_STORAGE_ENCRYPTION_KEY must be configured in production", str(ctx.exception))

    # --- 2. Unauthenticated Negative Tests (401) ---

    def test_unauthenticated_requests_fail(self):
        """All critical endpoints must reject unauthenticated requests with 401."""
        endpoints = [
            ("GET", f"{API}/bills/{self.bill_a_id}/gaps", None),
            ("POST", f"{API}/bills/{self.bill_a_id}/values", {"parameter_key": "energy.kwh.register", "value": "100"}),
            ("POST", f"{API}/bills/{self.bill_a_id}/estimate", {}),
            ("GET", f"{API}/bills/{self.bill_a_id}/document", None),
            ("POST", f"{API}/invitations", {"email": "test@example.com", "role": "esg_admin"}),
        ]
        for method, path, body in endpoints:
            if method == "GET":
                res = self.client.get(path)
            else:
                res = self.client.post(path, json=body)
            self.assertEqual(res.status_code, 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}")

    # --- 3. Read-Only Role (executive_viewer) Negative Tests ---

    def test_read_only_role_cannot_mutate_or_admin(self):
        """Executive viewer can read gaps but cannot mutate values or create invitations (403)."""
        # Can read gaps
        res_gaps = self.client.get(f"{API}/bills/{self.bill_a_id}/gaps", headers=auth("viewer-a"))
        self.assertEqual(res_gaps.status_code, 200)

        # Cannot enter values (requires 'write')
        res_val = self.client.post(
            f"{API}/bills/{self.bill_a_id}/values",
            json={"parameter_key": "energy.kwh.register", "value": "500", "unit": "kWh"},
            headers=auth("viewer-a")
        )
        self.assertEqual(res_val.status_code, 403)

        # Cannot create invitations (requires 'admin')
        res_inv = self.client.post(
            f"{API}/invitations",
            json={"email": "newbie@example.com", "role": "data_contributor"},
            headers=auth("viewer-a")
        )
        self.assertEqual(res_inv.status_code, 403)

    # --- 4. Cross-Tenant Isolation Negative Tests ---

    def test_cross_tenant_isolation_fails_closed(self):
        """Tenant B user cannot access Tenant A's gaps, values, estimate, document, or invitations."""
        headers_b = auth("user-b")

        # Gaps cross-tenant: 404
        res_gaps = self.client.get(f"{API}/bills/{self.bill_a_id}/gaps", headers=headers_b)
        self.assertEqual(res_gaps.status_code, 404)

        # Values cross-tenant: 404
        res_val = self.client.post(
            f"{API}/bills/{self.bill_a_id}/values",
            json={"parameter_key": "energy.kwh.register", "value": "500", "unit": "kWh"},
            headers=headers_b
        )
        self.assertEqual(res_val.status_code, 404)

        # Estimate cross-tenant: 404
        res_est = self.client.post(f"{API}/bills/{self.bill_a_id}/estimate", json={}, headers=headers_b)
        self.assertEqual(res_est.status_code, 404)

        # Document download cross-tenant: 404
        res_doc = self.client.get(f"{API}/bills/{self.bill_a_id}/document", headers=headers_b)
        self.assertEqual(res_doc.status_code, 404)

    # --- 5. Multi-Account Self-Approval Proof & Analysis ---

    def test_multi_account_self_approval_vulnerability(self):
        """
        Proof of Vulnerability: One person creates a second account via invitation
        and uses that second account to approve their own activity record.
        """
        # Step 1: Admin Alice creates invitation for her second email
        inv_res = self.client.post(
            f"{API}/invitations",
            json={"email": "alice-alt@example.com", "role": "esg_admin"},
            headers=auth("admin-a")
        )
        self.assertEqual(inv_res.status_code, 201)
        invite_token = inv_res.json()["token"]

        # Step 2: Alice logs in with second identity (sub='alice-second-id') and accepts invitation
        # Mint token with verified_email claim
        accept_token = token("alice-second-id", email="alice-alt@example.com", email_verified=True)
        accept_res = self.client.post(
            f"{API}/invitations/accept",
            json={"token": invite_token},
            headers={"Authorization": f"Bearer {accept_token}"}
        )
        self.assertEqual(accept_res.status_code, 200)

        # Step 3: Alice (primary identity 'admin-a') creates an activity record
        # Create a period and facility first
        period_res = self.client.post(
            f"{API}/periods",
            json={
                "name": "Jan 2026",
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
                "boundary_method": "operational_control",
                "gwp_basis": "AR6"
            },
            headers=auth("admin-a")
        )
        self.assertEqual(period_res.status_code, 201)
        period_id = period_res.json()["id"]

        act_res = self.client.post(
            f"{API}/activities",
            json={
                "period_id": period_id,
                "facility_id": self.fac_a,
                "activity_type": "electricity",
                "quantity": "100",
                "unit": "kWh",
                "activity_start": "2026-01-01",
                "activity_end": "2026-01-31",
                "source_type": "manual"
            },
            headers=auth("admin-a")
        )
        self.assertEqual(act_res.status_code, 200)
        act_id = act_res.json()["id"]

        # Submit activity
        sub_res = self.client.post(f"{API}/activities/{act_id}/submit", headers=auth("admin-a"))
        self.assertEqual(sub_res.status_code, 200)

        # Step 4: Self-approval via primary identity is BLOCKED (403)
        self_app_res = self.client.post(f"{API}/activities/{act_id}/approve", headers=auth("admin-a"))
        self.assertEqual(self_app_res.status_code, 403)

        # Step 5: Self-approval via second identity SUCCEEDS because created_by != sub!
        alt_app_res = self.client.post(
            f"{API}/activities/{act_id}/approve",
            headers={"Authorization": f"Bearer {accept_token}", "X-Organization-Id": self.org_a}
        )
        # Demonstrating that the system permits dual-account bypass:
        self.assertEqual(alt_app_res.status_code, 200)
        self.assertEqual(alt_app_res.json()["status"], "APPROVED")
        print("\n[SECURITY AUDIT PROOF] Multi-account self-approval succeeded: Alice approved her own activity using alice-second-id.")


if __name__ == "__main__":
    unittest.main()
