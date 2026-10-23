# Current Architecture (as found, SHA 141e7b5)

## Context

```
Browser (React 19 + Vite SPA, deployed on Vercel: carbon-os-beta.vercel.app)
  │  /platform/saas-dashboard  → SaaSDashboard.jsx (5,176 lines)
  │       ├─ client-side PDF/text parsing  (src/lib/esgDocumentExtractor.js)
  │       ├─ client-side emissions maths   (calculateEmissions in SaaSDashboard)
  │       └─ fetch → FASTAPI_API_URL (VITE_FASTAPI_API_URL, default http://localhost:8000)
  │              POST /api/esg/extract-footprint
  │              POST /api/esg/query
  │              GET  /api/esg/emission-factors
  │
  ├─► FastAPI "Farmer's AI Inference Service"  (inference/main.py)
  │       routers: carbon_monitoring (satellite MRV — out of scope), esg_rag (ESG)
  │       + /predict (farmers AI — out of scope)
  │       SQLAlchemy engine from carbon_monitoring.database (SQLite default, DATABASE_URL override)
  │       ChromaDB (optional) + JSON fallback vector files under inference/chroma_data/
  │       Gemini REST API (generation + extraction)
  │
  └─► Django (backend/farmers_ai_project) — farmers AI + national registry bridge only.
          No ESG routes. Not the owner of ESG auth (there is no ESG auth anywhere).
```

## ESG backend modules (`inference/esg_rag/`)

| Module | Role | Notes |
|---|---|---|
| `router.py` | All `/api/esg/*` HTTP endpoints | No auth; tenant from request; contains a 9-category "footprint" with invented constants and two static demo payloads |
| `models.py` | `ESGDocument`, `ESGChunk`, `ESGQueryLog`, `EmissionFactorRecord` | Float values, no org/facility/period; `tenant_id` free string |
| `ingest.py` | File save, text extraction, chunking, embeddings | Unsanitized path join; hash-vector fallback when sentence-transformers is absent |
| `retriever.py` | Vector retrieval (Chroma or JSON) | Tenant filter only on `tenant_docs` corpus |
| `generator.py` | Gemini answer generation + "local fallback" | Fallback text claims "verified repository records" |
| `extractor.py` | Gemini/regex parameter extraction; utility segment detector | Canned defaults when nothing matches |
| `calculation_engine.py` | Activity + spend EEIO maths | Float maths, uncited defaults, "DuckDB" label but no DuckDB |
| `factor_registry.py` | Static factor catalogue + "regression test" | Gazette references not validated |
| `atlas_benchmark.py` | Extraction "benchmark" | Runs on synthetic in-file cases |
| `seed_data.py` | Seeds regulatory/EF corpora and a sample tenant doc | Sample doc is written as an "audit statement" |

## Data stores

* Relational: one SQLAlchemy `Base` shared with satellite MRV tables, created with `create_all`
  (no migrations). Default SQLite at `backend/db.sqlite3` (shared with Django) or `inference/db.sqlite3`.
* Files: `inference/chroma_data/uploads/<sha10>_<client filename>` — tracked in Git today.
* Vectors: Chroma collections `esg_<corpus>` + `fallback_<corpus>.json` (single file for all tenants).

## Decision (ADR-ESG-001): where ESG lives

**Keep ESG in the FastAPI service as the bounded package `inference/esg_rag`.**
Reasons: all ESG code, tables and the frontend integration already target it; Django has no ESG
code and its settings are insecure by default; moving would duplicate logic. Constraints adopted:

* `esg_rag` must be importable and testable without torch (the router is mounted in tests with
  a minimal FastAPI app and an in-memory database).
* Authentication is provider-agnostic OIDC/JWT verification in `esg_rag/auth.py`; tenant comes
  from server-side membership, never from request input.
* Schema migrations (Alembic) are introduced with the accounting domain slice (P1); until then
  ESG tables are created by `create_all`, which only adds new tables.
