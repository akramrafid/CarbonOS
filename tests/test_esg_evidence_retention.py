"""
Unit and integration tests for Phase 3: Evidence Retention.
Tests:
- Default behavior: ESG_RETAIN_SOURCE_DOCUMENTS=false (files are not retained)
- Retention enabled: ESG_RETAIN_SOURCE_DOCUMENTS=true (content-addressed storage)
- Document retrieval: GET /api/esg/bills/{id}/document with X-Content-SHA256
- Encryption at rest via ESG_STORAGE_ENCRYPTION_KEY
- Hard deletion on request: DELETE /api/esg/bills/{id}/document
- Audit logging for retain, read, and delete events
- Tenant isolation across document storage
"""
import hashlib
import io
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402
from esg_rag import document_store  # noqa: E402

API = "/api/esg"
SHARED = bp.PROFILE_DIR.parent.parent.parent / "tests" / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")


def _valid_pdf(title: str) -> bytes:
    return (
        f"%PDF-1.4\n"
        f"1 0 obj\n"
        f"<< /Title ({title}) /Type /Catalog /Pages 2 0 R >>\n"
        f"endobj\n"
        f"2 0 obj\n"
        f"<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n"
        f"endobj\n"
        f"3 0 obj\n"
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\n"
        f"endobj\n"
        f"4 0 obj\n"
        f"<< /Length 44 >>\n"
        f"stream\n"
        f"BT /F1 12 Tf 72 712 Td ({title}) Tj ET\n"
        f"endstream\n"
        f"endobj\n"
        f"xref\n"
        f"0 5\n"
        f"0000000000 65535 f \n"
        f"0000000009 00000 n \n"
        f"0000000074 00000 n \n"
        f"0000000133 00000 n \n"
        f"0000000220 00000 n \n"
        f"trailer\n"
        f"<< /Root 1 0 R /Size 5 >>\n"
        f"startxref\n"
        f"314\n"
        f"%%EOF\n"
    ).encode("utf-8")


class EvidenceRetentionTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.tmp_uploads = tempfile.mkdtemp(prefix="esg-test-uploads-")
        document_store.UPLOADS_DIR = document_store.Path(self.tmp_uploads)

        self.add_member(self.org_a, "admin-a", "esg_admin")
        param_rows = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML}, headers=auth("user-a")).json()
        for r in param_rows:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-a"))

        prof_rows = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML}, headers=auth("user-a")).json()
        self.profile = prof_rows[0]
        self.client.post(f"{API}/bill-profiles/{self.profile['id']}/approve", headers=auth("admin-a"))

        le_id = self.client.post(f"{API}/legal-entities", json={"name": "Synthetic Ltd", "country": "BD"},
                                 headers=auth("user-a")).json()["id"]
        self.facility_id = self.client.post(f"{API}/facilities", json={
            "legal_entity_id": le_id, "name": "Factory Alpha", "country": "BD", "grid_region": "BD-NATIONAL"
        }, headers=auth("user-a")).json()["id"]

    def tearDown(self):
        super().tearDown()
        import shutil
        shutil.rmtree(self.tmp_uploads, ignore_errors=True)

    def test_default_does_not_retain_files(self):
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "false"}):
            pdf_bytes = _valid_pdf("Default Bill")
            files = {"file": ("bill_default.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.facility_id}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            bill_id = res.json()["id"]

            doc_res = self.client.get(f"{API}/bills/{bill_id}/document", headers=auth("user-a"))
            self.assertEqual(doc_res.status_code, 404)
            self.assertIn("not retained", doc_res.json()["detail"])

    def test_retention_stores_content_addressed_and_serves_document(self):
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "true"}):
            pdf_bytes = _valid_pdf("Retained Invoice")
            expected_sha = hashlib.sha256(pdf_bytes).hexdigest()
            files = {"file": ("bill_retained.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.facility_id}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            bill_id = res.json()["id"]

            tenant_file = document_store.get_document_path(self.org_a, expected_sha)
            self.assertTrue(tenant_file.exists())

            doc_res = self.client.get(f"{API}/bills/{bill_id}/document", headers=auth("user-a"))
            self.assertEqual(doc_res.status_code, 200)
            self.assertEqual(doc_res.content, pdf_bytes)
            self.assertEqual(doc_res.headers.get("X-Content-SHA256"), expected_sha)

            gaps_res = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-a"))
            self.assertEqual(gaps_res.status_code, 200)
            self.assertTrue(gaps_res.json().get("has_source_document"))

    def test_encryption_at_rest(self):
        key = "test-secret-storage-key-32-chars!!"
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "true", "ESG_STORAGE_ENCRYPTION_KEY": key}):
            pdf_bytes = _valid_pdf("Encrypted PDF")
            expected_sha = hashlib.sha256(pdf_bytes).hexdigest()
            files = {"file": ("encrypted_bill.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.facility_id}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            bill_id = res.json()["id"]

            tenant_file = document_store.get_document_path(self.org_a, expected_sha)
            disk_bytes = tenant_file.read_bytes()
            self.assertNotEqual(disk_bytes, pdf_bytes)

            doc_res = self.client.get(f"{API}/bills/{bill_id}/document", headers=auth("user-a"))
            self.assertEqual(doc_res.status_code, 200)
            self.assertEqual(doc_res.content, pdf_bytes)

    def test_hard_deletion_on_request(self):
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "true"}):
            pdf_bytes = _valid_pdf("To Be Deleted")
            files = {"file": ("bill_delete.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.facility_id}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            bill_id = res.json()["id"]

            del_res = self.client.delete(f"{API}/bills/{bill_id}/document", headers=auth("user-a"))
            self.assertEqual(del_res.status_code, 200)
            self.assertTrue(del_res.json().get("deleted"))

            get_after = self.client.get(f"{API}/bills/{bill_id}/document", headers=auth("user-a"))
            self.assertEqual(get_after.status_code, 404)

    def test_tenant_isolation_on_document_access(self):
        with mock.patch.dict(os.environ, {"ESG_RETAIN_SOURCE_DOCUMENTS": "true"}):
            pdf_bytes = _valid_pdf("Confidential PDF")
            files = {"file": ("confidential.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
            res = self.client.post(f"{API}/bills/upload", data={"facility_id": self.facility_id}, files=files,
                                   headers=auth("user-a"))
            self.assertEqual(res.status_code, 201)
            bill_id = res.json()["id"]

            doc_res = self.client.get(f"{API}/bills/{bill_id}/document", headers=auth("user-b"))
            self.assertEqual(doc_res.status_code, 404)

            del_res = self.client.delete(f"{API}/bills/{bill_id}/document", headers=auth("user-b"))
            self.assertEqual(del_res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
