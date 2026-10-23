# CarbonOS Bangladesh — Baseline Inventory Audit (Phase Zero)

**Audit Execution Date:** 2026-10-24  
**Auditor:** Antigravity Autonomous Transformation Team  
**Git Baseline Commit:** `141e7b52125f4625b293c6628fc0ff2dbcf3c8df`  
**Git Branch:** `main` (tracked to `origin/main`)  
**Workspace Root:** `E:\Carbon Credit BD`

---

## 1. Repository & Working Tree State

- **Clean Commit Baseline:** `141e7b5 feat: add national registry bridge for API-authenticated carbon credit submission and monitoring`
- **Pre-Existing Uncommitted Working Changes:**
  - `src/pages/platform/SaaSDashboard.jsx` (Modified: modular extraction of subcomponents)
  - `src/pages/platform/components/ActivityEvidenceWorkspace.jsx` (Untracked: granular evidence upload card)
  - `src/pages/platform/components/EsgReportGenerator.jsx` (Untracked: PDF report compilation modal)
  - `src/pages/platform/components/VerificationReadinessCenter.jsx` (Untracked: auditor review workspace)
  - *Integrity Note:* All uncommitted changes have been preserved intact and verified against the TypeScript compilation pipeline (`npm run build` exits 0 with zero errors).

---

## 2. Directory Structure & Service Boundaries

```
E:\Carbon Credit BD\
├── orchestrator/          # Python 3.10+ Akram-Stack orchestration CLI engine (zero 3rd party deps)
├── bin/akstack            # Convenience bash launcher for orchestrator CLI
├── agents/                # 42 specialized agent role briefs + TEAM.md
├── phases/                # Phase specifications (Phase 0 through Phase 6)
├── templates/             # ADR, plan, ToDos, PROGRESS, and QA templates
├── tests/                 # 82 automated unit & integration tests (Python unittest)
├── src/                   # React 19 + Vite + Tailwind CSS frontend application
│   ├── components/        # Reusable UI widgets (Navbar, Footer, LiveMetrics, DeviceCard, etc.)
│   ├── pages/             # Route-level views (Home, Marketplace, SaaS Dashboard, MRV, Farmers AI)
│   ├── lib/               # Client-side state stores (useHarvestStore, etc.)
│   └── styles/            # CSS tokens and styling utilities
├── backend/               # Django 6.0.6 + Django REST Framework + Daphne ASGI service
│   ├── farmers_ai/        # Agricultural diagnostics, telemetry persistence, weather risk
│   ├── national_registry_bridge/ # Article 6 & JCM carbon registry client, models, and endpoints
│   ├── ml_pipeline/       # PyTorch multi-head crop disease network definitions & weights
│   └── farmers_ai_project/# Django settings, WSGI, ASGI, and root URL routing
├── inference/             # FastAPI asynchronous microservice
│   ├── carbon_monitoring/ # Satellite remote sensing, Random Forest fusion model, Ed25519 provenance
│   ├── esg_rag/           # ChromaDB vector retrieval, Gemini 2.5 Flash, CSRD/CBAM grounding
│   └── main.py            # FastAPI application entrypoint & image prediction endpoint
└── docs/                  # Architecture decisions, audit reports, runbooks, and QA specs
```

---

## 3. Dependency Manifests

### Frontend (`package.json`)
- **Core Runtime:** React `19.0.0`, React-DOM `19.0.0`, Vite `6.0.0`, React-Router-DOM `7.0.0`
- **Styling & Motion:** Tailwind CSS `3.4.1`, Framer Motion `11.11.0`, GSAP `3.12.5`, Lucide-React `0.460.0`
- **Mapping & GIS:** Leaflet `1.9.4`, React-Leaflet `5.0.0`
- **Inference & PDF:** ONNX Runtime Web `1.20.0`, JSZip `3.10.1`, JSPDF `2.5.2`
- **Verification:** TypeScript `5.6.3` (Build verified clean: 2,296 modules transformed).

### Backend & Inference Python Environments
- **Frameworks:** Django `6.0.6`, djangorestframework `3.15.2`, django-cors-headers `4.6.0`, Daphne `4.1.2`, Channels `4.2.0`, FastAPI `0.115.6`, Uvicorn `0.34.0`
- **Scientific & ML:** PyTorch `2.5.1`, Torchvision `0.20.1`, ONNX `1.17.0`, NumPy `2.2.0`, OpenCV-Python `4.10.0`, Scikit-Learn `1.6.0`, Pillow `11.0.0`
- **Vector & AI:** ChromaDB `0.5.23`, Google-GenerativeAI `0.8.3`, LangChain `0.3.14`, Sentence-Transformers `3.3.1`
- **GIS & Satellite:** Rasterio `1.4.3`, Geopandas `1.0.1`, Shapely `2.0.6`, Pyproj `3.7.0`
- **Security & Provenance:** Cryptography `44.0.0`, PyNaCl `1.5.0` (Ed25519)

---

## 4. Database Models & Schema Boundaries

### Django SQLite Database (`backend/db.sqlite3`)
- `Diagnosis`: Leaf disease prediction record, coordinates, confidence, agronomist review status.
- `AgronomistReview`: Human review by licensed agricultural expert, confirmed treatment plan.
- `WeatherRiskSnapshot`: Field-level microclimate conditions, humidity, temperature, fungal risk index.
- `CarbonTelemetry`: IoT sensor packets (temperature, humidity, air quality, ambient CO₂).
- `RegistryProject`: Article 6 / JCM carbon project metadata, standard, NDC sector, methodology.
- `MonitoringReportSubmission`: Auditable submission payload, provenance hash, status, response body.
- `CorrespondingAdjustment`: Article 6.2 authorization state, ITMO volume, vintage year, host country.
- `PositiveNegativeRule`: Negative lists and additionality criteria for national compliance.

### FastAPI Independent SQLite Databases (`inference/`)
- `carbon_monitoring.db`: `Project`, `MonitoringPeriod`, `CarbonResult`, `EstimateProvenance` (SHA-256 chain).
- `esg_rag.db`: `DocumentIndex`, `ChromaCollectionMetadata`, `TenantAuditTrail`.
- *Architecture Note:* Django and FastAPI operate strictly isolated databases with clear domain boundaries.

---

## 5. Frontend Route Mapping (`src/App.jsx`)

| Route Path | View Component | Status | Authenticity Level |
|---|---|---|---|
| `/` | `src/pages/Home.jsx` | Operational | Public Landing Page |
| `/marketplace` | `src/pages/Marketplace.jsx` | Operational | Simulated Sandbox (No live settlement) |
| `/platform/mrv` | `src/pages/platform/MRVDashboard.jsx` | Operational | Hybrid (Live Blynk IoT + Sim fallback) |
| `/platform/carbon-monitoring` | `src/pages/platform/CarbonMonitoring.jsx` | Operational | Hybrid (Quantile RF + Synthetic tensors) |
| `/platform/carbon-registry` | `src/pages/platform/CarbonRegistry.jsx` | Operational | Sandbox Registry Client (Mock DoE API) |
| `/platform/esg` | `src/pages/platform/ESGReporting.jsx` | Operational | Real ChromaDB RAG + Synthetic Bill Parser |
| `/platform/saas-dashboard` | `src/pages/platform/SaaSDashboard.jsx` | Operational | Enterprise ESG Accounting (DoE Factor locked) |
| `/farmers-ai/camera` | `src/pages/farmers-ai/CameraCapture.jsx` | Operational | Edge ONNX Web + Django Cloud Inference |
| `/farmers-ai/diagnosis-result` | `src/pages/farmers-ai/DiagnosisResult.jsx`| Operational | Real Disease Taxonomy + Bangla Rx |
| `/farmers-ai/journal` | `src/pages/farmers-ai/FarmerJournal.jsx` | Operational | SQLite Historical Diagnostic Log |

---

## 6. Test Suite Health Check

- **Test Framework:** Python `unittest` (`tests/test_*.py`)
- **Total Tests Discovered:** 82 tests
- **Tests Passing:** **82 / 82 (100% Pass Rate)**
- **Failures:** 0
- **Errors:** 0
- **Execution Time:** ~93.9 seconds
- **Test Modules:**
  - `test_satellite_pipeline.py` (Sentinel-2 processing, cloud masking, vegetation indices)
  - `test_dmrv_provenance.py` (SHA-256 hash chaining, Ed25519 digital signatures, tamper detection)
  - `test_model_pipeline.py` (PyTorch multi-head EfficientNet architecture, tensor validation)
  - `test_esg_rag.py` (Vector retrieval, grounded regulatory citation generation)
  - `test_awd_payout.py` (AWD methane mitigation equations, bKash payout ledger models)
  - `test_national_registry_bridge.py` (Registry client, JCM export, validation gates)
