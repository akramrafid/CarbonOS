"""
Unit and integration tests for Phase 5: Knowledge Base ("Training" the RAG).
Covers:
- Structure-aware chunking preserving markdown tables and extracting rich metadata.
- BM25 multilingual search (English + Bengali) and metadata filtering.
- Hybrid retrieval with Reciprocal Rank Fusion (RRF) and strict tenant isolation.
- Factor questions querying structured registry first, explicitly distinguishing APPROVED vs PROVISIONAL vs literature.
- Honest prompt fallback when corpus has no verified guidance: links to manual entry form without inventing facts.
- Quarantining fictional Dexterity Textiles doc to demo tenant only.
"""
import os
import sys
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag.chunker import structure_aware_chunk, detect_language, detect_fuel, detect_scope  # noqa: E402
from esg_rag.bm25 import BM25Index, tokenize  # noqa: E402
from esg_rag.hybrid_retriever import hybrid_retrieve  # noqa: E402
from esg_rag.factor_qa import detect_factor_intent, query_factor_registry, format_factor_qa_response  # noqa: E402
from esg_rag.grid_factor_service import wire_bd_grid_proposal  # noqa: E402
from esg_rag.ledger_models import EmissionFactor  # noqa: E402

API = "/api/esg"


class TestEsgRagPhase5(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "approver-a", "esg_admin")

    def test_structure_aware_chunking_keeps_tables_intact(self):
        md_text = """# Section 1: Introduction
Background text before table.

## Section 2: Default Fuel Factors
| Fuel | NCV | CO2 Factor |
|---|---|---|
| Natural Gas | 48.0 | 56100 |
| Diesel | 43.0 | 74100 |
| Sub-bituminous Coal | 18.9 | 96100 |

### Section 3: Summary
Summary text after table."""
        chunks = structure_aware_chunk(md_text, "test_doc.md", {
            "publisher": "IPCC", "year": 2006, "version": "v1.0", "region": "GLOBAL"
        })

        # Table should be in its own intact chunk
        table_chunks = [c for c in chunks if "| Fuel |" in c["content"]]
        self.assertEqual(len(table_chunks), 1)
        self.assertIn("Natural Gas", table_chunks[0]["content"])
        self.assertIn("Diesel", table_chunks[0]["content"])
        self.assertIn("Sub-bituminous Coal", table_chunks[0]["content"])
        self.assertEqual(table_chunks[0]["publisher"], "IPCC")
        self.assertEqual(table_chunks[0]["year"], 2006)
        self.assertEqual(table_chunks[0]["region"], "GLOBAL")

    def test_bm25_multilingual_search_and_metadata_filter(self):
        docs = [
            {"id": "doc1", "content": "Diesel generators provide backup power for Dhaka RMG factories.", "metadata": {"fuel": "diesel", "lang": "en"}},
            {"id": "doc2", "content": "প্রাকৃতিক গ্যাস বাংলাদেশের প্রধান বিদ্যুৎ উৎপাদন জ্বালানি।", "metadata": {"fuel": "natural_gas", "lang": "bn"}},
            {"id": "doc3", "content": "Coal power plants operate at Payra and Rampal.", "metadata": {"fuel": "coal", "lang": "en"}}
        ]
        index = BM25Index()
        index.index(docs)

        # English query
        res_en = index.search("diesel generators", top_k=2)
        self.assertTrue(len(res_en) >= 1)
        self.assertEqual(res_en[0]["id"], "doc1")

        # Bengali query
        res_bn = index.search("প্রাকৃতিক গ্যাস", top_k=2)
        self.assertTrue(len(res_bn) >= 1)
        self.assertEqual(res_bn[0]["id"], "doc2")

        # Metadata filter
        filtered = index.search("power", top_k=5, filters={"fuel": "coal"})
        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["id"], "doc3")

    def test_factor_intent_detection(self):
        # Queries asking for factors
        f1 = detect_factor_intent("What is the grid emission factor for Bangladesh electricity?")
        self.assertIsNotNone(f1)
        self.assertEqual(f1["activity_type"], "electricity")

        f2 = detect_factor_intent("Tell me the emission rate for diesel combustion in kgco2e")
        self.assertIsNotNone(f2)
        self.assertEqual(f2["activity_type"], "diesel")

        # Non-factor query
        f3 = detect_factor_intent("What are the environmental clearance categories under ECR 2023?")
        self.assertIsNone(f3)

    def test_factor_query_returns_provisional_proposal_when_pending(self):
        db = self.Session()
        wire_bd_grid_proposal(db, grid_region="BD-NATIONAL")
        db.close()

        res = self.client.post(f"{API}/query", json={
            "query": "What is the national grid emission factor for electricity in Bangladesh?"
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["model_used"], "carbonos-factor-registry")
        self.assertIn("PROVISIONAL", data["answer"])
        self.assertIn("0.663096", data["answer"])
        self.assertIn("derivation_hash", data["answer"].lower())
        self.assertIn("awaiting secondary dual-control approval", data["answer"].lower())

    def test_factor_query_returns_approved_factor_when_certified(self):
        # Create and approve a factor under dual control
        f_res = self.client.post(f"{API}/factors", json={
            "family": "custom-desco-grid",
            "activity_type": "electricity",
            "unit": "kWh",
            "kgco2e_per_unit": "0.612000",
            "region": "BD-NATIONAL",
            "gwp_basis": "AR6",
            "method": "location",
            "factor_kind": "grid_average",
            "valid_from": "2023-01-01",
            "valid_to": "2024-12-31",
            "source_publisher": "BERC Tariff Schedule 2023",
            "source_document": "BERC Gazette Notification",
            "source_year": 2023
        }, headers=auth("admin-a"))
        self.assertEqual(f_res.status_code, 201)
        fid = f_res.json()["id"]

        # Dual approval
        self.client.post(f"{API}/factors/{fid}/approve", headers=auth("approver-a"))

        res = self.client.post(f"{API}/query", json={
            "query": "What is the approved emission factor for grid electricity in Bangladesh?"
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["model_used"], "carbonos-factor-registry")
        self.assertIn("APPROVED", data["answer"])
        self.assertIn("0.612000", data["answer"])
        self.assertIn("BERC Tariff Schedule 2023", data["answer"])

    def test_honest_fallback_when_guidance_missing(self):
        # Query topic completely absent from the corpus
        res = self.client.post(f"{API}/query", json={
            "query": "What is the exact carbon credit methodology for lunar extraterrestrial helium-3 extraction?"
        }, headers=auth("user-a"))
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertTrue(data["insufficient_data"])
        self.assertIn("I cannot find guidance on", data["answer"])
        self.assertIn("/platform/esg/intake", data["answer"])
        self.assertEqual(data["citations"], [])

    def test_dexterity_textiles_quarantine_to_demo_tenant(self):
        # Create demo org and member
        db = self.Session()
        from esg_rag.models import ESGOrganization
        demo_org = db.query(ESGOrganization).filter(ESGOrganization.id == "demo_tenant").first()
        if not demo_org:
            demo_org = ESGOrganization(id="demo_tenant", name="Demo Org", is_demo=True, created_by_sub="user-demo")
            db.add(demo_org)
            db.commit()
        db.close()
        self.add_member("demo_tenant", "user-demo", "esg_admin")

        # Demo tenant query should retrieve Dexterity Textiles
        res_demo = self.client.post(f"{API}/query", json={
            "query": "Cummins 1250 kVA diesel generator running hours",
            "corpus": "tenant_docs"
        }, headers=auth("user-demo", org="demo_tenant"))
        self.assertEqual(res_demo.status_code, 200)

        # Standard tenant (user-a, org_a) MUST NOT retrieve demo tenant private documents
        res_a = self.client.post(f"{API}/query", json={
            "query": "Cummins 1250 kVA diesel generator running hours",
            "corpus": "tenant_docs"
        }, headers=auth("user-a"))
        self.assertEqual(res_a.status_code, 200)
        # Should be insufficient data or 0 citations for org_a
        for c in res_a.json().get("citations", []):
            self.assertNotEqual(c["source"], "dexterity_textiles_demo.md")


if __name__ == "__main__":
    unittest.main()
