# CarbonOS Bangladesh — Test Suite Baseline & Verification Report (Phase Zero)

**Document Ref:** `docs/audit/TEST-BASELINE.md`  
**Execution Timestamp:** 2026-10-24T00:25:00+06:00  
**QA Lead:** QA Automation Architect  
**Operating Environment:** Windows (PowerShell), Python 3.13.1, Node v22.11.0  

---

## 1. Executive Summary

- **Backend / ML / Integration Test Suite:** **82 / 82 Tests PASSED (100% Pass Rate)**
- **Test Execution Time:** 93.882 seconds
- **Test Discovery Command:** `python -m unittest discover -s tests -v`
- **Frontend Build & Typecheck:** **Passed** (`npm run build` -> `tsc && vite build`, 2,296 modules transformed in 23.33s)
- **Akram-Stack Doctor Check:** **Passed** (`python -m orchestrator.cli doctor`, exit code 0)

---

## 2. Test Suite Breakdown by Module

| Module Name | Test Count | Passing | Failing | Execution Focus & Domain Invariants Verified |
|---|---|---|---|---|
| `tests/test_national_registry_bridge.py` | 18 | 18 | 0 | Article 6.2 authorization, JCM Bilateral Document schema export, Provenance hash checks, Positive/Negative rule validation, BTR summaries |
| `tests/test_model_pipeline.py` | 16 | 16 | 0 | PyTorch `MultiHeadFarmerAIModel` forward pass, species conditioning, class-map consistency, Grad-CAM tensor generation |
| `tests/test_dmrv_provenance.py` | 14 | 14 | 0 | SHA-256 hash chaining, Ed25519 digital signature signing and verification, intentional tamper detection, record immutability |
| `tests/test_esg_rag.py` | 12 | 12 | 0 | ChromaDB vector collection querying, citation extraction, low-confidence threshold (<0.60) abstention handling |
| `tests/test_satellite_pipeline.py` | 12 | 12 | 0 | Sentinel-2 L2A ingestion, cloud masking algorithms, NDVI / EVI calculation, Random Forest quantile regression [P10, P50, P90] |
| `tests/test_awd_payout.py` | 10 | 10 | 0 | Alternate Wetting & Drying methane emission mitigation modeling, farmer eligibility verification, bKash disbursement ledger |
| **TOTAL** | **82** | **82** | **0** | **Clean baseline across all unit & integration test suites** |

---

## 3. Frontend Verification & Static Analysis

```bash
$ npm run build
> carbon-os@0.0.0 build
> tsc && vite build

vite v6.4.1 building for production...
✓ 2296 modules transformed.
dist/index.html                   1.42 kB │ gzip:   0.68 kB
dist/assets/index-D7K3...css     84.12 kB │ gzip:  14.20 kB
dist/assets/index-Bx49...js     984.30 kB │ gzip: 268.12 kB
✓ built in 23.33s
```
- Zero TypeScript syntax or type errors in the current codebase.
- Bundle sizes remain within acceptable bounds for an enterprise analytical dashboard suite.

---

## 4. Test Coverage Gaps & Priority Remediation

1. **Missing Cross-Tenant Isolation Tests (P0):**
   - No automated test currently asserts that Organization A (`tenant_id = "org_a"`) is blocked from retrieving documents or calculation runs owned by Organization B (`tenant_id = "org_b"`).
   - *Action:* Write `tests/test_tenant_isolation.py` enforcing ChromaDB and SQLite tenant isolation.

2. **Missing Live Contract & Port Verification Tests (P0):**
   - The port discrepancy (`views.py:12` pointing to 8001 instead of 8000) was undetected because tests mock `requests.post`.
   - *Action:* Write `tests/test_api_contracts.py` to statically verify all registered routes against frontend invocation patterns.

3. **Missing Playwright E2E Regression Workflows (P1):**
   - User flows (leaf photo upload, utility bill extraction approval, carbon credit reservation) are not currently exercised in a real headless browser.
   - *Action:* Set up Playwright test fixtures for critical user journeys.
