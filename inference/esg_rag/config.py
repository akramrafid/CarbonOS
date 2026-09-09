"""
Central configuration for the ESG RAG subsystem.
All tunables in one place — override via environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

# ChromaDB persistence
# ---------------------------------------------------------------------------
CHROMA_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIR",
    os.path.join(os.path.dirname(__file__), "..", "chroma_data"),
)

# ---------------------------------------------------------------------------
# Embedding model (sentence-transformers hub name)
# ---------------------------------------------------------------------------
EMBEDDING_MODEL = os.getenv("ESG_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # matches all-MiniLM-L6-v2

# ---------------------------------------------------------------------------
# Chunking parameters
# ---------------------------------------------------------------------------
CHUNK_SIZE = int(os.getenv("ESG_CHUNK_SIZE", "512"))       # characters
CHUNK_OVERLAP = int(os.getenv("ESG_CHUNK_OVERLAP", "64"))   # characters

# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------
TOP_K = int(os.getenv("ESG_TOP_K", "5"))
MIN_CONFIDENCE = float(os.getenv("ESG_MIN_CONFIDENCE", "0.30"))

# ---------------------------------------------------------------------------
# Generation — Gemini free-tier (reuses existing GEMINI_API_KEY)
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("ESG_GEMINI_MODEL", "gemini-2.5-flash")

# ---------------------------------------------------------------------------
# Corpus collection names (ChromaDB)
# ---------------------------------------------------------------------------
CORPUS_REGULATORY = "regulatory"
CORPUS_EMISSION_FACTORS = "emission_factors"
CORPUS_TENANT_DOCS = "tenant_docs"

VALID_CORPORA = {CORPUS_REGULATORY, CORPUS_EMISSION_FACTORS, CORPUS_TENANT_DOCS}
