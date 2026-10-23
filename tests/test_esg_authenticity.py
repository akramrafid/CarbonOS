"""
P0-2 data-authenticity tests: the ESG API never substitutes sample values, never self-verifies,
and keeps demo payloads out of production workspaces.
"""
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag.extractor import detect_all_utility_segments, extract_footprint_from_text  # noqa: E402
from esg_rag.models import ESGDocument, ESGQueryLog  # noqa: E402

CANNED = ("14200", "14,200", "156000", "156,000", "82000", "39000")


class ExtractionAuthenticityTest(ESGApiTestCase):
    def extract(self, sub="user-a", **kwargs):
        return self.client.post("/api/esg/extract-footprint", headers=auth(sub), **kwargs)

    def test_missing_document_is_rejected_without_phantom_footprint(self):
        res = self.extract(data={})
        self.assertEqual(res.status_code, 422)
        db = self.Session()
        self.assertEqual(db.query(ESGQueryLog).count(), 0)
        db.close()

    def test_unextractable_document_is_rejected_not_filled_with_samples(self):
        res = self.extract(files={"file": ("memo.txt", b"Quarterly board memo. No utility data here.", "text/plain")})
        self.assertEqual(res.status_code, 422)
        self.assertIn("manually", res.json()["detail"])
        self.assertFalse(any(c in res.text for c in CANNED))

    def test_unreadable_pdf_is_rejected(self):
        res = self.extract(files={"file": ("scan.pdf", b"%PDF-1.4 not really a pdf", "application/pdf")})
        self.assertEqual(res.status_code, 422)
        db = self.Session()
        chunks = [c.content for d in db.query(ESGDocument).all() for c in d.chunks]
        db.close()
        self.assertFalse(any("Error" in c for c in chunks))

    def test_real_values_are_review_required_and_never_sealed(self):
        res = self.extract(files={"file": ("bill.txt", b"DESCO grid electricity: 4,321 kWh for March", "text/plain")})
        self.assertEqual(res.status_code, 200, res.text)
        body = res.json()
        self.assertEqual(body["parameters"]["electricity"], 4321.0)
        self.assertEqual(body["parameters"]["diesel"], 0.0)
        self.assertEqual(body["review_status"], "REVIEW_REQUIRED")
        self.assertIsNone(body["overall_confidence"])  # rule-based match has no model confidence
        for banned in ("audit_seal", "verified_at", "categories", "total_footprint_kg", "trend_vs_last_month"):
            self.assertNotIn(banned, body)
        self.assertIn("4,321 kWh", body["details"][0]["raw_snippet"])
        db = self.Session()
        self.assertFalse(any(l.verified_by_audit for l in db.query(ESGQueryLog).all()))
        db.close()

    def test_llm_extraction_requires_explicit_opt_in(self):
        with mock.patch("esg_rag.extractor.extract_parameters_with_gemini") as llm:
            extract_footprint_from_text("electricity 10 kWh")
            llm.assert_not_called()
            with mock.patch.dict(os.environ, {"ESG_LLM_EXTRACTION_ENABLED": "true"}):
                llm.side_effect = RuntimeError("provider down")
                res = extract_footprint_from_text("electricity 10 kWh")
            llm.assert_called_once()
        self.assertEqual(res["method"], "regex")  # failure falls back to rules, not to invented data
        self.assertEqual(res["parameters"]["electricity"], 10.0)


class RagAuthenticityTest(ESGApiTestCase):
    def test_ai_failure_returns_retrieval_only_and_is_not_verified(self):
        self.client.post("/api/esg/ingest", headers=auth("user-a"),
                         files={"file": ("policy.txt", b"Our boiler policy requires annual inspection.", "text/plain")})
        res = self.client.post("/api/esg/query", headers=auth("user-a"),
                               json={"query": "boiler policy annual inspection", "corpus": "tenant_docs"})
        body = res.json()
        self.assertEqual(body["model_used"], "retrieval-only")  # no GEMINI_API_KEY in tests
        self.assertIn("not a generated or verified answer", body["answer"])
        trail = self.client.get("/api/esg/audit-trail", headers=auth("user-a")).json()
        self.assertTrue(all(t["verified"] is False for t in trail))

    def test_no_data_answer_abstains(self):
        res = self.client.post("/api/esg/query", headers=auth("user-a"),
                               json={"query": "What is our water withdrawal?", "corpus": "tenant_docs"})
        self.assertTrue(res.json()["insufficient_data"])
        self.assertEqual(res.json()["citations"], [])


class DemoSegregationTest(ESGApiTestCase):
    def test_sample_payloads_only_in_demo_workspaces(self):
        for path in ("/api/esg/entity-tree", "/api/esg/satellite-insets"):
            self.assertEqual(self.client.get(path, headers=auth("user-a")).status_code, 404)
        demo = self.client.post("/api/esg/organizations", json={"name": "Demo", "is_demo": True},
                                headers=auth("demo-user")).json()["id"]
        for path in ("/api/esg/entity-tree", "/api/esg/satellite-insets"):
            res = self.client.get(path, headers=auth("demo-user", demo))
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["data_classification"], "DEMO_SAMPLE")


class UtilitySegmentTest(unittest.TestCase):
    INVOICE = """
    Off-Peak Energy: 85,000 kWh @ 9.20 BDT
    Peak Hour Energy: 22,000 kWh @ 12.80 BDT
    Sanctioned Maximum Demand: 400 kVA
    Backup Genset Diesel: 3,400 Liters
    Solar Export: 5,000 kWh
    """

    def test_only_present_segments_and_no_netting(self):
        res = detect_all_utility_segments(self.INVOICE)
        qty = {s["segment_id"]: s["quantity"] for s in res["segments"]}
        self.assertEqual(qty, {"elec_offpeak": 85000.0, "elec_peak": 22000.0, "captive_diesel": 3400.0})
        excluded = {s["segment_id"] for s in res["excluded_segments"]}
        self.assertEqual(excluded, {"solar_netmeter", "demand_charge"})
        # Scope 2 = location-based kWh lines only; exported solar is not subtracted.
        self.assertAlmostEqual(res["scope_breakdown"]["scope2_tco2e"], (85000 * 0.550 + 22000 * 0.620) / 1000, places=3)
        self.assertNotIn("audit_seal", res)
        self.assertEqual(res["review_status"], "REVIEW_REQUIRED")
        self.assertTrue(all(s["factor_status"] == "UNVERIFIED" for s in res["segments"]))

    def test_sparse_text_yields_nothing(self):
        res = detect_all_utility_segments("hello")
        self.assertEqual(res["segments"], [])
        self.assertEqual(res["total_emissions_tco2e"], 0)


if __name__ == "__main__":
    unittest.main()
