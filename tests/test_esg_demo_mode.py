"""
Tests for zero-friction no-login ephemeral ESG demo mode.
Verifies session provisioning, dual-control reviewer persona switching,
multi-tenant isolation between demo workspaces, reset functionality,
and rejection under protected access mode.
"""
import os
import sys
import unittest
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase


class TestEsgDemoMode(ESGApiTestCase):
    def test_seeded_inventory_calculates_and_exports_with_independent_approval(self):
        session = self.client.post('/api/esg/demo/session').json()
        owner = {'Authorization': f"Bearer {session['personas']['owner']['token']}"}
        sample = Path(__file__).resolve().parents[1] / 'public/samples/factory-electricity-demo.txt'
        extraction = self.client.post('/api/esg/extract-footprint', headers=owner,
            files={'file': (sample.name, sample.read_bytes(), 'text/plain')})
        self.assertEqual(extraction.status_code, 200, extraction.text)
        self.assertEqual(extraction.json()['parameters']['electricity'], 125000)
        self.assertIsNone(extraction.json()['details'][0]['confidence'])
        reviewer = {'Authorization': f"Bearer {session['personas']['reviewer']['token']}"}
        period = session['seed_summary']['period_id']
        records = self.client.get('/api/esg/activities', headers=owner).json()['items']
        pending = next(r for r in records if r['status'] == 'SUBMITTED')
        review = self.client.post(f"/api/esg/activities/{pending['id']}/approve", json={}, headers=reviewer)
        self.assertEqual(review.status_code, 200, review.text)
        response = self.client.post(f'/api/esg/periods/{period}/calculate', headers=owner)
        self.assertEqual(response.status_code, 201, response.text)
        run = self.client.get(f"/api/esg/calculations/{response.json()['id']}", headers=owner).json()
        self.assertFalse(run['blocking'], run['exceptions'])
        self.assertEqual(Decimal(run['scope1_kg']), Decimal('12060'))
        self.assertEqual(Decimal(run['scope2_location_kg']), Decimal('80000'))
        self.assertIsNone(run['scope2_market_kg'])
        lock_url = f'/api/esg/periods/{period}/lock'
        body = {'calculation_run_id': run['id']}
        self.assertEqual(self.client.post(lock_url, json=body, headers=owner).status_code, 403)
        self.assertEqual(self.client.post(lock_url, json=body, headers=reviewer).status_code, 403)
        approver = {'Authorization': f"Bearer {session['personas']['approver']['token']}"}
        locked = self.client.post(lock_url, json=body, headers=approver)
        self.assertEqual(locked.status_code, 201, locked.text)
        url = f"/api/esg/snapshots/{locked.json()['id']}/export?format=csv"
        first = self.client.get(url, headers=approver)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.content, self.client.get(url, headers=approver).content)
        self.assertIn('Not externally assured', first.text)

    def setUp(self):
        super().setUp()
        self._old_access_mode = os.environ.get("ESG_ACCESS_MODE")
        os.environ["ESG_ACCESS_MODE"] = "isolated_demo"

    def tearDown(self):
        super().tearDown()
        if self._old_access_mode is None:
            os.environ.pop("ESG_ACCESS_MODE", None)
        else:
            os.environ["ESG_ACCESS_MODE"] = self._old_access_mode

    def test_demo_session_creation_and_seeding(self):
        """Zero-friction POST /api/esg/demo/session yields isolated tenant and Bangladesh benchmarks."""
        res = self.client.post("/api/esg/demo/session")
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()

        self.assertTrue(data.get("is_demo"))
        self.assertTrue(data.get("access_token"))
        self.assertTrue(data.get("tenant_id"))
        self.assertIn("owner", data.get("personas", {}))
        self.assertIn("reviewer", data.get("personas", {}))
        self.assertIn("DEMO WORKSPACE", data.get("disclaimer", ""))

        owner_token = data["personas"]["owner"]["token"]
        headers = {"Authorization": f"Bearer {owner_token}"}

        # Verify organizations endpoint reflects demo membership with org_owner role
        orgs_res = self.client.get("/api/esg/organizations", headers=headers)
        self.assertEqual(orgs_res.status_code, 200)
        orgs = orgs_res.json()
        self.assertEqual(len(orgs), 1)
        self.assertEqual(orgs[0]["id"], data["tenant_id"])
        self.assertEqual(orgs[0]["role"], "org_owner")
        self.assertTrue(orgs[0]["is_demo"])

        # Verify seeded benchmark facilities
        fac_res = self.client.get("/api/esg/facilities", headers=headers)
        self.assertEqual(fac_res.status_code, 200)
        facilities = fac_res.json().get("items", [])
        self.assertGreaterEqual(len(facilities), 1)
        self.assertIn("Savar Spinning", facilities[0]["name"])

        # Verify seeded emission factors
        factor_res = self.client.get("/api/esg/factors", headers=headers)
        self.assertEqual(factor_res.status_code, 200)
        factors = factor_res.json().get("items", [])
        self.assertGreaterEqual(len(factors), 1)

        # Verify seeded activities (including pre-approved electricity and submitted diesel)
        act_res = self.client.get("/api/esg/activities", headers=headers)
        self.assertEqual(act_res.status_code, 200)
        activities = act_res.json().get("items", [])
        self.assertGreaterEqual(len(activities), 2)
        statuses = [a["status"] for a in activities]
        self.assertIn("APPROVED", statuses)
        self.assertIn("SUBMITTED", statuses)

    def test_tenant_isolation_between_concurrent_demo_sessions(self):
        """Different demo sessions receive isolated tenants and cannot read each other's data."""
        res_a = self.client.post("/api/esg/demo/session")
        self.assertEqual(res_a.status_code, 200)
        session_a = res_a.json()

        res_b = self.client.post("/api/esg/demo/session")
        self.assertEqual(res_b.status_code, 200)
        session_b = res_b.json()

        self.assertNotEqual(session_a["tenant_id"], session_b["tenant_id"])

        headers_a = {"Authorization": f"Bearer {session_a['access_token']}"}
        headers_b = {"Authorization": f"Bearer {session_b['access_token']}"}

        fac_a = self.client.get("/api/esg/facilities", headers=headers_a).json().get("items", [])
        fac_b = self.client.get("/api/esg/facilities", headers=headers_b).json().get("items", [])

        fac_a_ids = {f["id"] for f in fac_a}
        fac_b_ids = {f["id"] for f in fac_b}
        self.assertTrue(fac_a_ids.isdisjoint(fac_b_ids), "Tenants must not share facility records")

        # Cross-tenant manipulation attempt using explicit header must be denied
        for f_id in fac_a_ids:
            hijack_attempt = self.client.get(
                f"/api/esg/facilities/{f_id}",
                headers={"Authorization": f"Bearer {session_b['access_token']}", "X-Organization-Id": session_a["tenant_id"]},
            )
            self.assertIn(hijack_attempt.status_code, (403, 404))

    def test_dual_control_reviewer_persona_approval(self):
        """
        Demo mode preserves segregation of duties: submitter cannot approve own record;
        switching to auditor/reviewer persona allows valid approval without bypass.
        """
        res = self.client.post("/api/esg/demo/session")
        data = res.json()

        owner_token = data["personas"]["owner"]["token"]
        reviewer_token = data["personas"]["reviewer"]["token"]

        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        reviewer_headers = {"Authorization": f"Bearer {reviewer_token}"}

        # Verify reviewer role is auditor
        me_reviewer = self.client.get("/api/esg/me", headers=reviewer_headers).json()
        self.assertNotEqual(me_reviewer["sub"], data["personas"]["owner"]["sub"])

        orgs_reviewer = self.client.get("/api/esg/organizations", headers=reviewer_headers).json()
        self.assertEqual(orgs_reviewer[0]["role"], "auditor")

        # Find the submitted diesel record
        acts = self.client.get("/api/esg/activities", headers=owner_headers).json().get("items", [])
        submitted_acts = [a for a in acts if a["status"] == "SUBMITTED"]
        self.assertTrue(submitted_acts, "Demo seed must include a submitted record for dual-control demo")
        target_act = submitted_acts[0]

        # 1. Owner attempts self-approval -> must fail with 403 (insufficient review permission or separation of duties)
        self_approve = self.client.post(
            f"/api/esg/activities/{target_act['id']}/approve",
            headers=owner_headers,
        )
        self.assertIn(self_approve.status_code, (400, 403))

        # 2. Reviewer (Auditor) approves -> must succeed (200)
        reviewer_approve = self.client.post(
            f"/api/esg/activities/{target_act['id']}/approve",
            headers=reviewer_headers,
        )
        self.assertEqual(reviewer_approve.status_code, 200, reviewer_approve.text)
        approved_body = reviewer_approve.json()
        self.assertEqual(approved_body["status"], "APPROVED")
        self.assertEqual(approved_body["reviewed_by"], data["personas"]["reviewer"]["sub"])

    def test_demo_reset(self):
        """POST /api/esg/demo/reset cleans and re-seeds the tenant workspace."""
        res = self.client.post("/api/esg/demo/session")
        data = res.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Query seeded legal entity
        entities = self.client.get("/api/esg/legal-entities", headers=headers).json().get("items", [])
        self.assertTrue(entities, "Seeded demo org must have a legal entity")
        entity_id = entities[0]["id"]

        # Add a custom facility
        post_fac = self.client.post(
            "/api/esg/facilities",
            json={
                "legal_entity_id": entity_id,
                "name": "Temporary Experimental Unit",
                "country": "BD",
                "grid_region": "BD-REB",
            },
            headers=headers,
        )
        self.assertEqual(post_fac.status_code, 201)
        temp_id = post_fac.json()["id"]

        # Call reset
        reset_res = self.client.post("/api/esg/demo/reset", headers=headers)
        self.assertEqual(reset_res.status_code, 200)
        reset_data = reset_res.json()
        self.assertEqual(reset_data["tenant_id"], data["tenant_id"])
        self.assertIn('approver', reset_data['personas'])

        # Check facilities: temporary unit is gone, default seed is intact
        fac_after = self.client.get("/api/esg/facilities", headers=headers).json().get("items", [])
        fac_after_ids = [f["id"] for f in fac_after]
        self.assertNotIn(temp_id, fac_after_ids)
        self.assertGreaterEqual(len(fac_after), 1)

    def test_protected_mode_rejects_demo_endpoints(self):
        """When ESG_ACCESS_MODE is protected, demo endpoints are rejected with 403."""
        old_mode = os.environ.get("ESG_ACCESS_MODE")
        try:
            os.environ["ESG_ACCESS_MODE"] = "protected"
            res = self.client.post("/api/esg/demo/session")
            self.assertEqual(res.status_code, 403)
            self.assertIn("disabled", res.text.lower())
        finally:
            if old_mode is None:
                os.environ.pop("ESG_ACCESS_MODE", None)
            else:
                os.environ["ESG_ACCESS_MODE"] = old_mode


if __name__ == "__main__":
    unittest.main()
