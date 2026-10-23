# CarbonOS Bangladesh — Comprehensive Feature Coverage Matrix

**Document Ref:** `docs/transformation/FEATURE-COVERAGE.md`  
**Standard:** Master Prompt The Objective (Capabilities 1–13)  
**Status:** `AUDITED_AND_BENCHMARKED`  
**Latest Baseline Commit:** `61e1263`  

---

## 1. Feature Coverage Matrix (Capabilities 1–13)

| # | Capability | Current Status | Supporting Backend / Modules | Verifiable Evidence | Roadmap & Next Milestones |
|---|---|---|---|---|---|
| 1 | **Enterprise Carbon Accounting** | `VERIFIED_READY` | `inference/esg_rag/calculation_engine.py`, `factor_registry.py` | Scope 1, 2, 3 calculations; verified DoE Combined Margin (`0.550 kg/kWh`); SHA256 audit seals (`test_esg_engine.py`). | Expand Scope 3 supplier activity factors and product lifecycle accounting. |
| 2 | **ESG Data Management & Reporting** | `VERIFIED_READY` | `inference/esg_rag/router.py`, `src/pages/platform/SaaSDashboard.jsx` | 9-category breakdown, facility comparisons, audit trail exports, executive KPI metrics. | Add formal BRSR and CSRD export format templates. |
| 3 | **Multi-Organization & Multi-Facility Operations** | `PARTIALLY_IMPLEMENTED` | `inference/esg_rag/retriever.py`, Django tenant models | Tenant-isolated vector retrieval (`test_tenant_isolation.py`); organization filtering in DB queries. | Build multi-tenant self-serve facility onboarding wizard in frontend. |
| 4 | **AI-Assisted Utility Document Processing** | `VERIFIED_READY` | `inference/esg_rag/extractor.py`, `router.py` | Universal regex & multi-segment bill parser with zero-fabrication fallback; extraction confidence scores. | Introduce side-by-side human-in-the-loop PDF review canvas before ledger commit. |
| 5 | **Regulatory Knowledge Retrieval (RAG)** | `VERIFIED_READY` | `inference/esg_rag/retriever.py`, ChromaDB | Grounded vector search over Bangladesh DoE gazettes and NDC guidelines with source citations. | Add hybrid BM25 lexical reranking for long Bengali legal gazette texts. |
| 6 | **Supplier Emissions Collection** | `PARTIALLY_IMPLEMENTED` | `inference/esg_rag/router.py` | EEIO spend-based Scope 3 Cat 1 estimation; supplier risk scoring. | Build vendor questionnaire portal and direct CSV upload for supplier activity data. |
| 7 | **Carbon Reduction Planning** | `VERIFIED_READY` | `inference/esg_rag/router.py` | Sector-specific abatement levers (rooftop solar net-metering, fleet electrification, recycled fiber). | Add 5-year marginal abatement cost curve (MACC) scenario forecaster. |
| 8 | **Scientifically Validated Satellite MRV** | `READY_WITH_LIMITATIONS` | `inference/carbon_monitoring/`, `fusion_model.py` | Random Forest & XGBoost quantile models [P10, P50, P90]; Sentinel-2 spectral indices; offline simulation guards. | Ingest ground-truth calibration plots from Sundarbans / Chittagong Hill Tracts field surveys. |
| 9 | **Agricultural & Farmer-Oriented Intelligence** | `READY_WITH_LIMITATIONS` | `inference/main.py`, `backend/farmers_ai/` | Multi-head crop disease classifier with Scenario E untrained weight safeguard and weather risk engine. | Train checkpoint on independently validated Bangladesh field leaf image dataset. |
| 10 | **Verifiable Carbon-Credit Registry Integrations** | `READY_WITH_LIMITATIONS` | `backend/national_registry_bridge/`, `registry_export.py` | Verra VM0047, Article 6.2, and JCM export bundles; sandbox records tagged `SANDBOX_ACCEPTED`. | Connect to official Bangladesh Ministry of Environment NDC portal when API is released. |
| 11 | **Secure Carbon-Credit Transactions** | `PROTOTYPE_ONLY` | `src/pages/platform/CarbonRegistry.jsx` | Transaction workflows and farmer payout calculators; explicitly labeled as sandbox demonstration. | Integrate regulated payment gateway / bank escrow adapter when commercial licenses permit. |
| 12 | **Professional APIs & Developer Integrations** | `VERIFIED_READY` | FastAPI `/docs`, Django REST Framework routers | Standardized OpenAPI 3.1 schemas, typed Pydantic models, and DRF endpoint contracts. | Publish official TypeScript / Python SDKs for enterprise ERP webhooks. |
| 13 | **Enterprise Security, Observability & Testing** | `VERIFIED_READY` | `tests/`, Django hardened settings, logging | 89 automated tests passing; Ed25519 tamper detection; fail-safe secret key checking. | Add OpenTelemetry distributed tracing and Redis rate-limiting middleware. |

---

## 2. Summary Breakdown
- **Verified Ready:** 6 / 13 (46%)
- **Ready With Limitations:** 4 / 13 (31%)
- **Partially Implemented:** 2 / 13 (15%)
- **Prototype Only:** 1 / 13 (8%)
- **Not Started / Blocked:** 0 / 13 (0%)
