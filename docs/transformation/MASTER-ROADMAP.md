# CarbonOS Bangladesh — Enterprise Transformation Master Roadmap (Phases 0–14)

**Document Ref:** `docs/transformation/MASTER-ROADMAP.md`  
**Initial Baseline Date:** 2026-10-24  
**Governing Standard:** Akram-Stack (`akstack`) Engineering Protocol & Google Antigravity Master Directive  
**Status:** **ACTIVE / IN EXECUTION**  

---

## 1. Phased Execution Architecture

The transformation of CarbonOS Bangladesh from a promising prototype into an enterprise-grade, scientifically credible climate technology platform proceeds through 15 structured phases:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: Independent Baseline Audit & Competitor Gap Analysis (COMPLETED)      │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Critical Security Remediation & Secret Excision (ACTIVE)              │
│ - SEC-01: Excision of hardcoded Blynk IoT credentials & rotation advisory      │
│ - SEC-02: Hardening of Django production settings, SECRET_KEY, and ALLOWED_HOSTS│
│ - SEC-03: Configuration of global DRF authentication & permission policies     │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Integration Repair & Service Port Harmonization (ACTIVE)              │
│ - INT-01: Correction of Django -> FastAPI port inversion (views.py:12)         │
│ - INT-02: Cleaning of redundant Django URL prefixes (/api/farmers-ai/...)      │
│ - INT-03: Centralized frontend API client configuration and default port fixes │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Data Foundation & Simulation Disclosures (P0/P1)                      │
│ - DAT-01: National Registry Bridge status hierarchy (SANDBOX_ACCEPTED vs PROD) │
│ - DAT-02: Mandatory data_origin = "simulation" tagging across synthetic models │
│ - DAT-03: Relabeling of deceptive fallback telemetry cache banners             │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Enterprise Carbon Accounting Core (P1)                                │
│ - GHG-01: Locking of Bangladesh DoE Grid Factor (0.550 kg CO₂e/kWh)           │
│ - GHG-02: Multi-facility data models (Org -> Division -> Facility -> Meter)    │
│ - GHG-03: Scope 1, 2, and initial Scope 3 (Purchased Goods - RMG) ledgers     │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: AI Document Intelligence & Regulatory RAG Grounding (P1)              │
│ - DOC-01: Utility bill extraction schema & human-in-the-loop review queue      │
│ - RAG-01: Multi-tenant vector segregation (where={"tenant_id": current_tenant})│
│ - RAG-02: Verifiable citation grounding with abstention on low confidence      │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: Satellite MRV & Quantile Uncertainty Calibration (P1/P2)              │
│ - MRV-01: Real Copernicus STAC / Sentinel-2 L2A pipeline hardening             │
│ - MRV-02: Conformal prediction intervals [P10, P50, P90] with Tier-3 disclosure│
│ - MRV-03: Tamper-proof Ed25519 digital signature chain validation              │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: Farmers AI Diagnostic & Edge Verification (P1/P2)                     │
│ - FAI-01: Species-conditioned classification gating and out-of-distribution    │
│ - FAI-02: Edge ONNX web model offline caching and sync protocol                │
│ - FAI-03: Agronomist human-in-the-loop verification workflow                   │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 8: National Carbon Registry & Marketplace Sandboxing (P1/P3)             │
│ - REG-01: JCM bilateral document schema mapping and validation                 │
│ - MKT-01: Permanent demo sandbox warning banners and simulated reservation     │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 9: Premium Enterprise UX/UI & Dual-Theme System (P1/P2)                  │
│ - UI-01: Modular decomposition of oversized components (CarbonMonitoring, MRV) │
│ - UI-02: WCAG 2.2 AA contrast compliance across Obsidian Dark & Mint Light     │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASES 10–14: Integrations, DevOps, Comprehensive QA, and Trust Center         │
│ - Containerization, Structured Logging, E2E Testing, Trust Center Documentation│
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Immediate Execution Batch (Phases 1 & 2 Remediation)

### Priority P0 Safe Remediations
1. **P0-SEC-01 (Blynk Credential Excision):**
   - Files: `src/pages/platform/MRVDashboard.jsx`, `src/components/LiveMetrics.jsx`
   - Action: Remove hardcoded token; switch to environment variable `VITE_BLYNK_AUTH_TOKEN` (defaulting to empty string / sandbox mode) and display safe fallback state.
2. **P0-SEC-02 (Django Settings Hardening):**
   - File: `backend/farmers_ai_project/settings.py`
   - Action: Fail-safe `SECRET_KEY`, safe `DEBUG = False` default in production, strip wildcard from `ALLOWED_HOSTS`, add security cookies and headers.
3. **P0-INT-01 (Django -> FastAPI Port Inversion Fix):**
   - File: `backend/farmers_ai/views.py`
   - Action: Update `FASTAPI_URL` to point to port `8000` (`http://127.0.0.1:8000/predict`).
4. **P0-INT-02 (Django URL Pattern Standardization):**
   - Files: `backend/farmers_ai/urls.py`, `backend/farmers_ai_project/urls.py`
   - Action: Remove redundant `api/` prefix in child routes; add root alias `path('api/diagnose/', views.diagnose)`.
5. **P0-INT-03 (Frontend Default Port Realignment):**
   - Files: `src/pages/farmers-ai/CameraCapture.jsx`, `src/pages/platform/MRVDashboard.jsx`, `src/pages/platform/CarbonRegistry.jsx`
   - Action: Align default `VITE_DJANGO_API_URL` to `'http://localhost:8001'`.
6. **P0-DAT-01 (National Registry Bridge Sandbox Labeling):**
   - File: `backend/national_registry_bridge/registry_client.py`
   - Action: Set mock status to `SANDBOX_ACCEPTED` and tag payload with `data_origin = "simulation"`.
7. **P0-DAT-02 (LiveMetrics Fallback Labeling):**
   - File: `src/components/LiveMetrics.jsx`
   - Action: Relabel misleading "verified sensor cache" to "Hardware Gateway Offline — Reference Baseline (Simulated)".
