# CarbonOS Bangladesh — Technical Debt Inventory (Phase Zero)

**Document Ref:** `docs/audit/TECHNICAL-DEBT.md`  
**Audit Date:** 2026-10-24  
**Technical Debt Lead:** Senior Engineering Architect  

---

## 1. Overview & Categorization

This document catalogs technical debt accumulated during rapid prototyping, providing an actionable remediation roadmap ranked by architectural debt impact and maintenance cost.

---

## 2. Technical Debt Catalog

### Category A: Frontend Monoliths & State Duplication
1. **Oversized Component Files:**
   - `src/pages/platform/CarbonMonitoring.jsx` (~780 lines): Merges Leaflet polygon drawing, satellite band preview, Random Forest quantile charting, Ed25519 provenance rendering, and export handlers in one giant component.
   - `src/pages/platform/MRVDashboard.jsx` (~782 lines): Combines Blynk live polling, canvas sparkline charts, crop health trend tables, and local storage fallback queues.
   - `src/pages/platform/CarbonRegistry.jsx` (~600 lines): Mixes Article 6.2 authorization forms, JCM bilateral exports, and NDC sector validation.
   - *Refactoring Action:* Decompose each page into modular, single-responsibility subcomponents (similar to the progress already made on `SaaSDashboard.jsx`).

2. **Decentralized API Configurations:**
   - `const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';` repeated verbatim across 8 different JSX files with an incorrect fallback port.
   - *Refactoring Action:* Centralize into `src/services/apiClient.ts` with typed Axios/fetch interceptors and standard error handling.

3. **Incomplete Design System Enforcement:**
   - Some components still mix raw hex codes with Tailwind theme tokens, risking contrast failures when switching between Obsidian Dark (`#040906`) and Mint Light (`#E6F5E2`).
   - *Refactoring Action:* Enforce CSS custom property tokens (`var(--surface-primary)`, `var(--text-primary)`, `var(--brand-mint)`).

---

### Category B: Backend & Service Integration
1. **Service Port Inversion & Forwarding Defect:**
   - `backend/farmers_ai/views.py:12` hardcodes `FASTAPI_URL = "http://127.0.0.1:8001/predict"`, causing Django to forward inference requests to its own port rather than FastAPI on 8000.
   - *Refactoring Action:* Use `os.getenv("FASTAPI_URL", "http://127.0.0.1:8000/predict")` and add automated integration test.

2. **Redundant URL Routing Prefixes:**
   - `farmers_ai/urls.py` prepends `api/` to every endpoint, causing routes to be registered as `/api/farmers-ai/api/...` when included under `api/farmers-ai/`.
   - *Refactoring Action:* Clean URL patterns and provide clean backward-compatible aliases.

3. **SQLite Single-Writer Concurrency:**
   - Production workloads with concurrent telemetry packets and document OCR runs will encounter `sqlite3.OperationalError: database is locked`.
   - *Refactoring Action:* Maintain clean PostgreSQL migration path via `dj_database_url` for Django and SQLAlchemy asyncpg for FastAPI.

---

### Category C: Scientific & ML Pipeline
1. **Synthetic Tensor Disclosures:**
   - Satellite spectral bands fall back to synthetic Random Forest quantile predictions without explicitly annotating the returned JSON payload with `data_origin = "simulation"`.
   - *Refactoring Action:* Enforce metadata tagging and standard UI simulation indicators.

2. **Crop Disease Species-Conditioned Validation:**
   - Softmax confidence comparison across separately trained crop-specific output heads can misclassify out-of-distribution weed or leaf species.
   - *Refactoring Action:* Implement dedicated species gate or abstention threshold (<0.60) before displaying disease treatment advice.

---

### Category D: DevOps, Observability & CI/CD
1. **Unstructured Log Output:**
   - Services currently log using standard Python `print()` statements rather than structured JSON logging with request IDs and trace correlation.
   - *Refactoring Action:* Implement structured JSON logger formatting timestamps, log levels, tenant IDs, and request paths.

2. **Containerization Gaps:**
   - Dockerfiles are missing non-root execution users, explicit healthcheck endpoints, and multi-stage build optimization.
   - *Refactoring Action:* Write hardened, production-ready `Dockerfile` and `docker-compose.yml` configurations.
