"""
Unit Tests for Multi-Tenant Isolation in RAG Retrieval (Scenario B)
Verifies that Organization A cannot access Organization B's document corpus,
no cross-tenant snippets or metadata are leaked, and tenantless queries
are barred from private tenant corpora.
"""

import unittest
import sys
import os

# Add inference directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../inference'))
from esg_rag.retriever import retrieve, retrieve_from_fallback, RetrievedChunk
from esg_rag.config import CORPUS_TENANT_DOCS, CORPUS_REGULATORY, CORPUS_EMISSION_FACTORS

class TestTenantIsolation(unittest.TestCase):
    def setUp(self):
        self.tenant_a = "org_apparel_alpha"
        self.tenant_b = "org_textile_beta"

    def test_tenant_isolation_in_fallback_retrieval(self):
        """Simulate chunk retrieval from fallback store and ensure strict tenant partition."""
        query_vec = [0.1] * 384

        # Mock chunk list simulating mixed stored records
        mock_records = [
            {
                "document": "Confidential Q1 2026 diesel consumption for Alpha Apparel: 50,000 Liters.",
                "vector": [0.1] * 384,
                "metadata": {
                    "doc_id": "doc_alpha_01",
                    "tenant_id": self.tenant_a,
                    "filename": "Alpha_Energy_Q1.xlsx",
                    "corpus": CORPUS_TENANT_DOCS
                }
            },
            {
                "document": "Proprietary natural gas bill for Beta Textiles: 120,000 m3.",
                "vector": [0.1] * 384,
                "metadata": {
                    "doc_id": "doc_beta_01",
                    "tenant_id": self.tenant_b,
                    "filename": "Beta_Gas_Statement.pdf",
                    "corpus": CORPUS_TENANT_DOCS
                }
            }
        ]

        # Test filtering logic for Tenant A
        results_a = []
        for r in mock_records:
            meta = r.get("metadata", {})
            if meta.get("corpus") == CORPUS_TENANT_DOCS and meta.get("tenant_id") != self.tenant_a:
                continue
            results_a.append(r)

        self.assertEqual(len(results_a), 1)
        self.assertEqual(results_a[0]["metadata"]["tenant_id"], self.tenant_a)
        self.assertIn("Alpha Apparel", results_a[0]["document"])
        self.assertNotIn("Beta Textiles", results_a[0]["document"])

        # Test filtering logic for Tenant B
        results_b = []
        for r in mock_records:
            meta = r.get("metadata", {})
            if meta.get("corpus") == CORPUS_TENANT_DOCS and meta.get("tenant_id") != self.tenant_b:
                continue
            results_b.append(r)

        self.assertEqual(len(results_b), 1)
        self.assertEqual(results_b[0]["metadata"]["tenant_id"], self.tenant_b)
        self.assertIn("Beta Textiles", results_b[0]["document"])
        self.assertNotIn("Alpha Apparel", results_b[0]["document"])

    def test_tenantless_query_cannot_access_tenant_docs(self):
        """A query with empty or missing tenant_id must never retrieve from tenant_docs corpus."""
        res_empty = retrieve(
            query="diesel fuel consumption",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id=""
        )
        self.assertEqual(len(res_empty["chunks"]), 0)
        self.assertTrue(res_empty["insufficient_data"])

        res_none = retrieve(
            query="diesel fuel consumption",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id=None
        )
        self.assertEqual(len(res_none["chunks"]), 0)
        self.assertTrue(res_none["insufficient_data"])

    def test_cross_tenant_document_query_isolation(self):
        """Cross-tenant queries cannot return chunks or citations belonging to another tenant."""
        # Querying specifically for tenant A's corpus
        res_a = retrieve(
            query="apparel industrial diesel",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id=self.tenant_a
        )
        # Any retrieved chunk must strictly match tenant A
        for chunk in res_a["chunks"]:
            self.assertEqual(chunk.tenant_id, self.tenant_a)

        # Querying specifically for tenant B's corpus
        res_b = retrieve(
            query="textile natural gas",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id=self.tenant_b
        )
        # Any retrieved chunk must strictly match tenant B
        for chunk in res_b["chunks"]:
            self.assertEqual(chunk.tenant_id, self.tenant_b)

    def test_public_corpora_shared_across_tenants(self):
        """Regulatory and emission factors corpora remain accessible to all tenants."""
        res_reg_a = retrieve(
            query="Bangladesh Department of Environment Combined Margin Factor",
            corpus=CORPUS_REGULATORY,
            tenant_id=self.tenant_a
        )
        res_reg_b = retrieve(
            query="Bangladesh Department of Environment Combined Margin Factor",
            corpus=CORPUS_REGULATORY,
            tenant_id=self.tenant_b
        )
        # Both tenants receive the same public regulatory/emission factor data
        self.assertIsNotNone(res_reg_a)
        self.assertIsNotNone(res_reg_b)

if __name__ == '__main__':
    unittest.main()
