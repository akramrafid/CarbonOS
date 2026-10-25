"""
P0-1 adversarial tests: authentication, tenant isolation, roles and upload safety for /api/esg.
"""
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import TMP, ESGApiTestCase, auth, token  # noqa: E402
from esg_rag.models import ESGDocument  # noqa: E402


class ESGSecurityTest(ESGApiTestCase):
    # --- authentication -------------------------------------------------------------

    def test_every_esg_route_except_health_requires_auth(self):
        checked = 0
        for route in self.app.routes:
            if not route.path.startswith("/api/esg"):
                continue
            for method in getattr(route, "methods", set()) - {"HEAD", "OPTIONS"}:
                path = route.path
                res = self.client.request(method, path)
                if path == "/api/esg/health":
                    self.assertEqual(res.status_code, 200)
                else:
                    self.assertEqual(res.status_code, 401, f"{method} {path} returned {res.status_code}")
                    checked += 1
        self.assertGreaterEqual(checked, 15)

    def test_invalid_tokens_rejected(self):
        for bad in (token("user-a", secret="wrong-" + "y" * 40), token("user-a", exp_in=-10), token(None), "not-a-jwt"):
            res = self.client.get("/api/esg/documents", headers={"Authorization": f"Bearer {bad}"})
            self.assertEqual(res.status_code, 401)

    def test_fails_closed_when_auth_not_configured(self):
        with mock.patch.dict(os.environ, {"ESG_AUTH_JWT_SECRET": ""}):
            res = self.client.get("/api/esg/documents", headers=auth("user-a"))
        self.assertEqual(res.status_code, 503)

    # --- tenant isolation ----------------------------------------------------------

    def test_tenant_cannot_read_other_tenant_documents_rag_or_audit(self):
        res = self.upload("user-a", "alpha_invoice.txt", b"Alpha facility grid electricity 12345 kWh confidential")
        self.assertEqual(res.status_code, 200, res.text)
        self.assertEqual(res.json()["tenant_id"], self.org_a)

        docs_b = self.client.get("/api/esg/documents", headers=auth("user-b")).json()
        self.assertNotIn("alpha_invoice.txt", [d["filename"] for d in docs_b])

        q = {"query": "Alpha facility grid electricity kWh confidential", "corpus": "tenant_docs", "top_k": 5}
        ans_b = self.client.post("/api/esg/query", json=q, headers=auth("user-b")).json()
        self.assertNotIn("alpha_invoice.txt", [c["source"] for c in ans_b["citations"]])
        self.assertNotIn("12345", ans_b["answer"])

        ans_a = self.client.post("/api/esg/query", json=q, headers=auth("user-a")).json()
        self.assertIn("alpha_invoice.txt", [c["source"] for c in ans_a["citations"]])

        # B's trail holds only B's own query, never A's query/answer.
        trail_b = self.client.get("/api/esg/audit-trail", headers=auth("user-b")).json()
        self.assertEqual(len(trail_b), 1)
        self.assertNotIn("alpha_invoice.txt", str(trail_b))
        trail_a = self.client.get("/api/esg/audit-trail", headers=auth("user-a")).json()
        self.assertIn("alpha_invoice.txt", str(trail_a))

    def test_client_supplied_tenant_id_is_ignored(self):
        res = self.upload("user-a", "a.txt", b"diesel 10 liters", extra={"tenant_id": self.org_b})
        self.assertEqual(res.json()["tenant_id"], self.org_a)
        q = {"query": "diesel", "corpus": "tenant_docs", "tenant_id": self.org_a}
        res = self.client.post("/api/esg/query", json=q, headers=auth("user-b"))
        self.assertEqual(res.status_code, 200)
        self.assertNotIn("a.txt", [c["source"] for c in res.json()["citations"]])

    def test_cannot_select_foreign_organization(self):
        res = self.client.get("/api/esg/documents", headers=auth("user-b", org=self.org_a))
        self.assertEqual(res.status_code, 403)
        res = self.client.get("/api/esg/documents", headers=auth("stranger", org=self.org_a))
        self.assertEqual(res.status_code, 403)

    def test_multiple_memberships_require_explicit_org(self):
        self.add_member(self.org_b, "user-a", "executive_viewer")
        self.assertEqual(self.client.get("/api/esg/documents", headers=auth("user-a")).status_code, 400)
        self.assertEqual(self.client.get("/api/esg/documents", headers=auth("user-a", self.org_b)).status_code, 200)
        orgs = self.client.get("/api/esg/organizations", headers=auth("user-a")).json()
        self.assertEqual({o["id"] for o in orgs}, {self.org_a, self.org_b})

    # --- roles ---------------------------------------------------------------------

    def test_viewer_cannot_write_and_contributor_cannot_read_audit_trail(self):
        self.add_member(self.org_a, "viewer-a", "executive_viewer")
        self.add_member(self.org_a, "contrib-a", "data_contributor")
        self.assertEqual(self.upload("viewer-a", "v.txt", b"lpg 5 kg").status_code, 403)
        self.assertEqual(self.upload("contrib-a", "c.txt", b"lpg 5 kg").status_code, 200)
        self.assertEqual(self.client.get("/api/esg/audit-trail", headers=auth("contrib-a")).status_code, 403)
        self.assertEqual(self.client.get("/api/esg/audit-trail", headers=auth("user-a")).status_code, 200)

    def test_supplier_collaborator_has_no_workspace_access(self):
        self.add_member(self.org_a, "supplier-1", "supplier_collaborator")
        self.assertEqual(self.client.get("/api/esg/documents", headers=auth("supplier-1")).status_code, 403)

    def test_only_platform_operator_writes_global_corpus(self):
        self.assertEqual(self.upload("user-a", "reg.txt", b"fake regulation", corpus="regulatory").status_code, 403)
        self.assertEqual(self.upload("user-a", "x.txt", b"x", corpus="../../etc").status_code, 422)
        op_org = self.client.post("/api/esg/organizations", json={"name": "Ops"}, headers=auth("operator-1")).json()["id"]
        res = self.upload("operator-1", "reg.txt", b"real regulation text", corpus="regulatory", org=op_org)
        self.assertEqual(res.status_code, 200, res.text)
        self.assertEqual(res.json()["tenant_id"], "global_regulatory")

    # --- upload safety ---------------------------------------------------------------

    def test_path_traversal_filename_is_contained(self):
        res = self.upload("user-a", "../../../../escape_test.txt", b"petrol 20 liters")
        self.assertEqual(res.status_code, 200, res.text)
        self.assertEqual(res.json()["filename"], "escape_test.txt")
        upload_root = os.path.realpath(os.path.join(os.environ["CHROMA_PERSIST_DIR"], "uploads"))
        stored = [os.path.join(d, f) for d, _, fs in os.walk(TMP) for f in fs if "escape_test" in f]
        self.assertEqual(stored, [])  # stored under a content hash, never under the client name
        tenant_files = os.listdir(os.path.join(upload_root, self.org_a))
        self.assertTrue(all(f.endswith(".txt") and len(f) == 64 + 4 for f in tenant_files))

    def test_disallowed_type_and_oversize_rejected(self):
        self.assertEqual(self.upload("user-a", "run.exe", b"MZ").status_code, 422)
        with mock.patch("esg_rag.router.MAX_UPLOAD_BYTES", 10), mock.patch("esg_rag.ingest.MAX_UPLOAD_BYTES", 10):
            self.assertEqual(self.upload("user-a", "big.txt", b"x" * 11).status_code, 413)

    def test_duplicate_upload_is_idempotent(self):
        first = self.upload("user-a", "bill.txt", b"electricity 500 kWh").json()
        second = self.upload("user-a", "bill-copy.txt", b"electricity 500 kWh").json()
        self.assertFalse(first["duplicate"])
        self.assertTrue(second["duplicate"])
        self.assertEqual(first["document_id"], second["document_id"])
        db = self.Session()
        self.assertEqual(db.query(ESGDocument).filter(ESGDocument.tenant_id == self.org_a).count(), 1)
        db.close()
        # Same bytes in another tenant are that tenant's own document.
        other = self.upload("user-b", "bill.txt", b"electricity 500 kWh").json()
        self.assertNotEqual(other["document_id"], first["document_id"])


if __name__ == "__main__":
    unittest.main()
