"""
Tests for Corpus Honesty & Provenance (Task 4):
- Exclusion of agent-authored corpus in production and non-demo tenants
- Front-matter verification for all markdown corpus files (authored_by, source_documents, verbatim: false)
- Citation formatting: non-verbatim chunks display 'CarbonOS summary (not the official text)' and omit official filenames
- Official PDF ingestion path with file sha256 provenance and page indexing
"""
import hashlib
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))

from esg_rag.hybrid_retriever import is_agent_authored_excluded
from esg_rag.retriever import RetrievedChunk
from esg_rag.ingest import ingest_official_pdf, IngestRejected


CORPUS_DIR = Path(__file__).resolve().parent.parent / "inference" / "esg_rag" / "corpus"
EXPECTED_CORPUS_FILES = [
    "bangladesh_climate_regulatory.md",
    "bd_grid_methodology.md",
    "dexterity_textiles_demo.md",
    "ghg_protocol_standards.md",
    "ipcc_2006_combustion_and_ar6_gwp.md",
]


class TestCorpusHonesty(unittest.TestCase):
    def test_corpus_front_matter_presence_and_truthfulness(self):
        """All 5 corpus files must declare authored_by, source_documents, and verbatim: false."""
        for fname in EXPECTED_CORPUS_FILES:
            path = CORPUS_DIR / fname
            self.assertTrue(path.is_file(), f"Missing corpus file: {fname}")
            content = path.read_text(encoding="utf-8")
            self.assertTrue(content.startswith("---"), f"{fname} must start with YAML front-matter '---'")
            parts = content.split("---", 2)
            self.assertGreaterEqual(len(parts), 3, f"{fname} has malformed front-matter delimiter")
            front_matter = parts[1]
            self.assertIn("authored_by:", front_matter, f"{fname} missing 'authored_by' in front-matter")
            self.assertIn("source_documents:", front_matter, f"{fname} missing 'source_documents' in front-matter")
            self.assertIn("verbatim: false", front_matter, f"{fname} must declare 'verbatim: false'")

    def test_agent_authored_exclusion_defaults(self):
        """is_agent_authored_excluded defaults to True in production or for non-demo tenants."""
        # Non-demo tenant in development/staging
        old_env = os.environ.get("ESG_ENV")
        try:
            os.environ["ESG_ENV"] = "development"
            self.assertTrue(is_agent_authored_excluded(tenant_is_demo=False))
            self.assertFalse(is_agent_authored_excluded(tenant_is_demo=True))

            # In production, even demo tenants default to exclusion unless explicitly overridden
            os.environ["ESG_ENV"] = "production"
            self.assertTrue(is_agent_authored_excluded(tenant_is_demo=False))
            self.assertTrue(is_agent_authored_excluded(tenant_is_demo=True))
        finally:
            if old_env is not None:
                os.environ["ESG_ENV"] = old_env
            else:
                os.environ.pop("ESG_ENV", None)

    def test_non_verbatim_citation_label(self):
        """Chunks from non-verbatim / agent-authored files MUST show 'CarbonOS summary (not the official text)'."""
        for fname in EXPECTED_CORPUS_FILES:
            chunk = RetrievedChunk(
                content="Sample GHG protocol guidance for textiles",
                score=0.88,
                metadata={"filename": fname, "corpus": "regulatory", "page": 1, "verbatim": False}
            )
            citation = chunk.to_citation()
            self.assertEqual(citation["source"], "CarbonOS summary (not the official text)")
            self.assertNotIn("bangladesh", citation["source"].lower())
            self.assertNotIn("ipcc", citation["source"].lower())
            self.assertNotIn("ghg_protocol", citation["source"].lower())
            self.assertIsNone(citation.get("page"))

    def test_verbatim_official_citation_label(self):
        """Chunks from official verbatim documents display real filename, page, and file sha256."""
        official_sha = hashlib.sha256(b"official pdf bytes").hexdigest()
        chunk = RetrievedChunk(
            content="Official SRO No. 273-Law/2023 text",
            score=0.92,
            metadata={"filename": "ECR_2023_Gazette_Official.pdf", "corpus": "regulatory", "page": 14,
                      "verbatim": True, "file_sha256": official_sha, "is_official": True}
        )
        citation = chunk.to_citation()
        self.assertEqual(citation["source"], "ECR_2023_Gazette_Official.pdf")
        self.assertEqual(citation["page"], 14)
        self.assertEqual(citation["file_sha256"], official_sha)

    def test_official_pdf_ingestion_path_validation(self):
        """ingest_official_pdf rejects non-PDF files and requires official metadata."""
        from unittest.mock import MagicMock
        mock_db = MagicMock()
        with self.assertRaises(IngestRejected):
            ingest_official_pdf(mock_db, b"not a pdf", "file.txt", "MOEFCC", 2023)


if __name__ == "__main__":
    unittest.main()
