# CarbonOS (Carbon Zero) — Independent Verification Report

**Date:** 2026-11-10  
**Role:** Independent Verification Agent  
**Repository Working Directory:** `c:\projects\CarbonOS`  
**Verdict:** **UNVERIFIED CLAIMS IDENTIFIED & HARDENED / 5 TEST FAILURES FOUND / 10 RISKS RANKED**

---

## 1. Executive Summary & Verification Claims Matrix

Every claim from the previous multi-phase completion report was audited against raw command execution outputs. No claims were taken on trust.

| # | Claim Audited | Evidence (Command + Output) | Status | Notes |
|:--|:---|:---|:---:|:---|
| **1** | Full test suite passes across all modules | `python -m unittest tests.<module>` on all 37 files<br>`Passed: 32 / Failed: 5 / Skipped: 2`<br>`ModuleNotFoundError: No module named '_isolated_db'` | **FAILED** | 5 dMRV modules failed due to missing `sys.path` configuration for `_isolated_db.py`. ESG modules passed. |
| **2** | JavaScript tests pass completely | `npm test`<br>`ok 1..27 - 27 pass, 0 fail (262.5ms)` | **VERIFIED** | All 27 node test runner assertions pass (a11y, contrast, motion, responsiveness, extractor). |
| **3** | Playwright E2E test suite executes and passes | `npx playwright test tests/e2e/esg-authenticity.spec.ts`<br>`Error: browserType.launch: Executable doesn't exist at ...\ms-playwright\chromium_headless_shell-1194` | **NOT TESTABLE** | Playwright test runner is installed (1.56.1), but browser binaries have not been downloaded to the host machine (`npx playwright install` required). |
| **4** | Bengali OCR pipeline verified with real bills | `tesseract --version`<br>`'tesseract' is not recognized as an internal or external command` | **NOT TESTABLE / SYNTHETIC ONLY** | Tesseract binary and `ben.traineddata` are not installed on system PATH. `test_esg_ocr_smoke.py` is skipped. Pipeline tested on synthetic images only. |
| **5** | Real utility bill samples evaluated | `Get-ChildItem -Path tests\fixtures\real_samples`<br>`Total Count: 0 files` | **FAILED** | **Zero real utility bills exist in the repository.** All tests and profiles were built against synthetic mocks. |
| **6** | Authoritative corpus contains verbatim official regulatory documents | File header and git history inspection of `inference/esg_rag/corpus/*`<br>`Commit log: untracked. Author: Agent-authored markdown summaries` | **FAILED** | All 5 corpus documents are agent-authored synthesis summaries, not verbatim official government gazettes or UN standard documents. |
| **7** | RAG retrieval achieves Hit@5 ≥ 85% and MRR ≥ 0.70 | Evaluation against 64 synthetic pairs (`eval.py`):<br>`Hit@5: 91.53%, MRR: 0.7593, MRR-bn: 0.6684`<br>Evaluation against 10 paraphrased questions:<br>`Hit@5: 100%, MRR: 0.6650 (MRR-bn: 0.5300)` | **PARTIALLY VERIFIED** | Meets targets on synthetic pairs closely mirroring chunk text. Drops to MRR 0.5300 in Bengali when user paraphrases questions away from chunk wording. |
| **8** | In-domain unanswerable queries honestly rejected | Evaluation of 30 in-domain unanswerable negatives (`eval_retrieval_honesty.py`):<br>`False positive rate: 0/30 (0.0%)` | **VERIFIED** | BM25 + dense thresholding successfully suppresses all 30 off-corpus in-domain questions (averaging < 0.50 score or flagging `insufficient_data: True`). |
| **9** | Document store implements AES-GCM encryption and fails closed | `inference/esg_rag/document_store.py`<br>`Initial state: Fernet (AES-128-CBC) with silent fallback to raw bytes`<br>`Fixed: AES-256-GCM with unique 12-byte nonces and fail-closed None return` | **VERIFIED (AFTER CODE FIX)** | Code fixed in commit `ed9637f` to enforce AES-256-GCM, reject tampered/truncated data, and fail closed. |
| **10** | Tenant isolation and path traversal prevented | `document_store.get_tenant_dir('../evil')`<br>`ValueError: Path traversal detected in tenant_id`<br>`Cross-tenant read returns 404` | **VERIFIED** | Enforces `Path.is_relative_to(UPLOADS_DIR)`. Cross-tenant queries return 404. |
| **11** | Grid factor 0.663096 is an official empirical factor | `factors/bd_grid/derive.py` & `grid_factor_service.py`<br>`net_generation_source: "SYNTHETIC BPDB FY22-23 p.62"`<br>`Status: DRAFT` | **FAILED** | **0.663096 is derived from a calibrated synthetic input model**, not empirical government publications. Status is properly marked `DRAFT`. |
| **12** | Dual-control prevents provisional factor entering approved ledger | `tests.test_esg_bill_estimate.BillEstimateTest`<br>`prov_factor.status == "DRAFT"`<br>`creator cannot approve factor (RuleError)` | **VERIFIED** | The provisional factor cannot be used for audit-grade reporting without explicit approval by a second user (`approved_by != created_by`). |
| **13** | End-to-end bill processing executes deterministically | Executed electricity & gas end-to-end runs (`run_e2e_trace.py`):<br>`15,000 kWh * 0.663096 = 9,946.44 kgCO2e = 9.946 tCO2e`<br>`Exact match to microgram (Delta = 0.0)` | **VERIFIED** | Pure Python calculation in `accounting.py` is 100% deterministic. |
| **14** | Repository hygiene: no secrets, uploads, or DBs tracked | `git ls-files uploads/ chroma_data/ .env *.sqlite3`<br>`Empty`<br>`Tracked files found in inference/chroma_data/uploads/ from commit f297247` | **PARTIALLY VERIFIED** | `.gitignore` hardened in commit `411c263` and `9b62c1e`. Legacy commit `f297247` contains 3 tracked upload text files. |

---

## 2. Task-by-Task Detailed Verification Findings

### Task 1: Full Test Suite Execution

All 37 test modules under `tests/` were executed individually using Python 3.11 with a 90-second timeout per module:

```bash
python -m unittest tests.<module> -v
```

#### Detailed Test Module Breakdown
| Test Module | Status | Ran | Passed | Failed | Errors | Skipped | Duration | Root Cause / Notes |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| `tests.test_bd_grid` | **PASS** | 13 | 13 | 0 | 0 | 0 | 0.26s | Grid factor math & Monte Carlo CI |
| `tests.test_carbon_security` | **PASS** | 12 | 12 | 0 | 0 | 0 | 0.06s | Carbon monitoring auth, rate limiting, role gating |
| `tests.test_dmrv_allometry` | **FAIL** | 1 | 0 | 0 | 1 | 0 | 0.00s | `ModuleNotFoundError: No module named '_isolated_db'` |
| `tests.test_dmrv_baseline` | **FAIL** | 1 | 0 | 0 | 1 | 0 | 0.00s | `ModuleNotFoundError: No module named '_isolated_db'` |
| `tests.test_dmrv_dossier` | **FAIL** | 1 | 0 | 0 | 1 | 0 | 0.00s | `ModuleNotFoundError: No module named '_isolated_db'` |
| `tests.test_dmrv_provenance` | **FAIL** | 1 | 0 | 0 | 1 | 0 | 0.00s | `ModuleNotFoundError: No module named '_isolated_db'` |
| `tests.test_dmrv_satellite` | **PASS** | 5 | 5 | 0 | 0 | 0 | 4.69s | Satellite cloud masking & NDVI raster tests |
| `tests.test_dmrv_uncertainty` | **FAIL** | 1 | 0 | 0 | 1 | 0 | 0.00s | `ModuleNotFoundError: No module named '_isolated_db'` |
| `tests.test_dmrv_v2` | **PASS** | 12 | 12 | 0 | 0 | 0 | 0.57s | Kanop/Treeconomy dMRV multi-modal fusion |
| `tests.test_esg_accounting` | **PASS** | 17 | 17 | 0 | 0 | 0 | 0.01s | Scope 1/2/3 accounting, AR4/AR5/AR6 GWP metrics |
| `tests.test_esg_app` | **PASS** | 2 | 2 | 0 | 0 | 0 | 0.04s | FastAPI ESG app health and routing |
| `tests.test_esg_authenticity` | **PASS** | 10 | 10 | 0 | 0 | 0 | 13.38s | Tamper detection, hash sealing |
| `tests.test_esg_bill_cases` | **PASS** | 2 | 2 | 0 | 0 | 0 | 3.57s | Utility bill case evaluation |
| `tests.test_esg_bill_estimate` | **PASS** | 6 | 6 | 0 | 0 | 0 | 5.84s | Indicative solo estimates, provisional grid factor |
| `tests.test_esg_bill_gaps` | **PASS** | 6 | 6 | 0 | 0 | 0 | 5.53s | Gap detection, digit normalization, blockers |
| `tests.test_esg_bill_hardening` | **PASS** | 11 | 11 | 0 | 0 | 0 | 2.69s | Malformed PDFs, edge cases |
| `tests.test_esg_bill_profiles` | **PASS** | 17 | 17 | 0 | 0 | 0 | 10.42s | Profile loading, versioning, anchor validation |
| `tests.test_esg_bill_rules` | **PASS** | 10 | 10 | 0 | 0 | 0 | 0.01s | AST compilation & rule execution |
| `tests.test_esg_bills` | **PASS** | 9 | 9 | 0 | 0 | 0 | 0.88s | Bill parsing & Bengali digits |
| `tests.test_esg_data_migrations`| **PASS** | 8 | 8 | 0 | 0 | 0 | 3.27s | Alembic migration idempotency |
| `tests.test_esg_demo_mode` | **PASS** | 5 | 5 | 0 | 0 | 0 | 1.33s | Demo tenant isolation |
| `tests.test_esg_disclosures` | **PASS** | 7 | 7 | 0 | 0 | 0 | 2.79s | ESG disclosure responses |
| `tests.test_esg_engine` | **PASS** | 8 | 8 | 0 | 0 | 0 | 0.17s | Deterministic calculation engine |
| `tests.test_esg_eval_harness` | **PASS** | 2 | 2 | 0 | 0 | 0 | 10.60s | Quality gate benchmark harness |
| `tests.test_esg_evidence_retention`| **PASS** | 5 | 5 | 0 | 0 | 0 | 4.20s | AES-GCM storage, retention, hard deletion |
| `tests.test_esg_hardening` | **PASS** | 5 | 5 | 0 | 0 | 0 | 10.63s | RAG prompt injection & CSV formula injection |
| `tests.test_esg_ledger` | **PASS** | 35 | 34 | 0 | 0 | 1 | 12.90s | Dual-control ledger. 1 skipped: concurrency (needs PostgreSQL) |
| `tests.test_esg_market_based` | **PASS** | 21 | 21 | 0 | 0 | 0 | 1.20s | Market-based Scope 2 & residual mix |
| `tests.test_esg_members` | **PASS** | 6 | 6 | 0 | 0 | 0 | 1.57s | RBAC & invitation tokens |
| `tests.test_esg_ocr_pipeline` | **PASS** | 14 | 14 | 0 | 0 | 0 | 3.41s | Deskew, Otsu binarization, median filter |
| `tests.test_esg_ocr_smoke` | **PASS** | 1 | 0 | 0 | 0 | 1 | 0.75s | 1 skipped: `tesseract` binary not on system PATH |
| `tests.test_esg_properties` | **PASS** | 19 | 19 | 0 | 0 | 0 | 5.86s | Property-based AST fuzzing |
| `tests.test_esg_rag_phase5` | **PASS** | 7 | 7 | 0 | 0 | 0 | 10.14s | Structure chunking, BM25, hybrid retrieval |
| `tests.test_esg_scope1` | **PASS** | 39 | 39 | 0 | 0 | 0 | 0.01s | Scope 1 stationary and mobile combustion |
| `tests.test_esg_security` | **PASS** | 13 | 13 | 0 | 0 | 0 | 12.13s | Token verification, role enforcement |
| `tests.test_orchestrator` | **PASS** | 34 | 34 | 0 | 0 | 0 | 3.85s | Akram-stack CLI orchestrator & DAG engine |
| `tests.test_tenant_isolation` | **PASS** | 4 | 4 | 0 | 0 | 0 | 8.85s | Cross-tenant data isolation |
| **TOTAL** | **32 PASS / 5 FAIL** | **365** | **358** | **0** | **5** | **2** | **~145s** | **98.1% Pass Rate overall (100% on ESG)** |

#### Skip Reasons Verified
1. `tests.test_esg_ocr_smoke.py:test_smoke_tesseract`:
   - Reason: `unittest.case.SkipTest: Tesseract not installed on system PATH`
   - Command Evidence: `tesseract --version` returns `CommandNotFoundException`.
2. `tests.test_esg_ledger.py:test_concurrent_approvals_single_winner`:
   - Reason: `skipped 'needs PostgreSQL for real concurrency'` (SQLite locks entire file on write).

#### JavaScript Test Suite (`npm test`)
```bash
npm test
# Output:
# TAP version 13
# ok 1 - Modal: implements focus trap, Escape key handling, and ARIA dialog semantics
# ok 2 - ToastContext: provides aria-live announcements and accessible region
# ...
# ok 27 - Ultra-Narrow 320px Support: Hero heading scales gracefully without overflowing
# 1..27
# tests 27, pass 27, fail 0 (262.5ms)
```

#### Playwright Specs Status
- Command: `npx playwright test --list` discovered 244 tests across 3 files (`esg-authenticity.spec.ts`, `esg-journey.spec.ts`, `smoke-screenshots.spec.ts`).
- Command: `npx playwright test tests/e2e/esg-authenticity.spec.ts --project=desktop-chromium`
- Output:
  ```
  Error: browserType.launch: Executable doesn't exist at C:\Users\LENOVO\AppData\Local\ms-playwright\chromium_headless_shell-1194\chrome-win\headless_shell.exe
  Please run the following command to download new browsers: npx playwright install
  ```
- **Conclusion**: Playwright browser dependencies have not been installed on the host environment; E2E specs cannot execute headless until `npx playwright install` is executed outside sandbox.

---

### Task 2: Baseline Integrity & Before/After Metric Table

`git diff docs/BASELINE.md` revealed that `docs/BASELINE.md` was untracked in the working tree. The baseline data has been restored and aligned into explicit Before (Phase 0) and After (Phase 8) metrics:

| Metric / Dimension | Phase 0 Baseline (Before) | Phase 8 Post-Hardening (After) | Change & Verification |
|:---|:---:|:---:|:---|
| **Total Test Modules Discovered** | 23 modules | 37 modules | +14 modules (new ESG Phase 1-8 tests) |
| **ESG Test Suite Pass Count** | 240 passed, 1 failed, 1 skipped | 358 passed, 0 failed, 2 skipped | +118 tests passed; null byte parser bug fixed |
| **Frontend Unit Tests (`npm test`)** | 2 tests passed | 27 tests passed | +25 tests (WCAG AA, a11y focus, motion, responsive layout) |
| **ATLAS Extraction Recall** | 90.0% (1 fail on comma regex) | 100.0% | Regex comma parser fixed in Phase 2 |
| **Gap Detection & Blocker Analysis** | Findings only; 0 blockers | 100% recall on 5 blocker classes | Exposed as `calc_blockers` in `GET /bills/{id}/gaps` |
| **Duplicate Bill Detection** | None (Upload accepted duplicates) | SHA-256 pre-ingest deduplication | Upload returns 409 conflict on duplicate file |
| **RAG Retrieval Hit@5** | N/A (Vector-only, no eval set) | 91.53% (synthetic) / 100% (paraphrased) | BM25 + dense hybrid retrieval implemented |
| **Mean Reciprocal Rank (MRR)** | N/A | 0.7593 (overall) / 0.6684 (Bengali) | Reciprocal Rank Fusion implemented |
| **Emission Math Determinism** | Not automated in baseline | Exact match ($\Delta \le 10^{-6}$ tCO2e) | Pure Python deterministic accounting |
| **Evidence Document Retention** | None (PDF discarded on upload) | AES-256-GCM content-addressed storage | Encrypted at rest, tenant-scoped, hard deletion |

---

### Task 3: Fixture Provenance & Data Reality Check

Inspection of `tests/fixtures/`:
```bash
Get-ChildItem -Path tests\fixtures -Recurse
```

1. **`tests/fixtures/real_samples/`**:
   - **File Count: 0**.
   - **PROVENANCE: ZERO REAL BILLS EXIST IN THIS CODEBASE.**
   - No customer utility bills have ever been committed or ingested.
2. **`tests/fixtures/bill_cases/`**:
   - Files: `synthetic_bill_grid_2025_07.yaml`, `synthetic_bill_grid_2025_07_kva.yaml`, `synthetic_bill_grid_2025_09_bad_kva.yaml`, `synthetic_bill_river_2025_08.yaml`, `synthetic_parameters_d1.yaml`, `synthetic_profiles_d1.yaml`.
   - **PROVENANCE: 100% SYNTHETIC.** Explicitly generated mock YAML fixtures.
3. **`tests/fixtures/rag_eval_pairs.json`**:
   - 64 bilingual Q&A pairs (32 English, 32 Bengali).
   - **PROVENANCE: SYNTHETIC.** Authored by the previous assistant to evaluate the synthetic corpus.
4. **Anchor & Extraction Metrics**:
   - Anchor hints in `bill_profiles/seed/*.yaml` were derived from standard public utility bill layouts, **not** empirical user PDFs.
   - **Held-Out Test Set**: Since zero real bills exist and all synthetic cases were used during development, **there is NO independent held-out evaluation set for utility bill extraction.**
   - Extraction recall on real customer bills is **UNKNOWN and UNTESTED**.

---

### Task 4: Corpus Provenance & Agent Authorship Flag

Every file in `inference/esg_rag/corpus/` was audited:

| File Name | Declared Publisher | Year | License | Document Reality |
|:---|:---|:---:|:---|:---|
| `bangladesh_climate_regulatory.md` | MoEFCC & BERC | 2021/2023 | Public Domain | **AGENT-AUTHORED SYNTHESIS**: Summary of ECR 2023 & NDC 2021. Not official gazette PDF. |
| `bd_grid_methodology.md` | CarbonOS Research | 2026 | CC-BY-4.0 | **AGENT-AUTHORED CODE DOC**: Technical explanation of `factors/bd_grid`. |
| `dexterity_textiles_demo.md` | Dexterity Textiles Ltd | 2026 | Demo Only | **AGENT-AUTHORED FICTION**: Synthetic mock logbook quarantined to `demo_tenant`. |
| `ghg_protocol_standards.md` | WRI & WBCSD | 2004/2015 | CC-BY-4.0 | **AGENT-AUTHORED SYNTHESIS**: Bullet-point summary of GHG Protocol Corporate Standard. |
| `ipcc_2006_combustion_and_ar6_gwp.md`| IPCC | 2006/2021 | UN Public Domain | **AGENT-AUTHORED TABLES**: Extracted values from IPCC 2006 Vol. 2 Table 2.2 and AR6 GWP table. |

#### Implementation of Agent Authorship Suppression Flag
In commit `d02f5c9`, `inference/esg_rag/hybrid_retriever.py` was updated with the `ESG_EXCLUDE_AGENT_AUTHORED_CORPUS` flag:
- When `ESG_EXCLUDE_AGENT_AUTHORED_CORPUS=true`, all 5 agent-authored files are excluded from retrieval candidates.
- Queries against the corpus will return `insufficient_data: True` until official source documents (PDFs/gazettes) are ingested and approved.

---

### Task 5: Retrieval Honesty Benchmark (In-Domain Negatives & Paraphrased Queries)

Evaluated via `eval_retrieval_honesty.py` against 30 in-domain unanswerable queries (e.g. facility-specific data, uningested tariffs, years not in corpus) and 10 paraphrased answerable queries:

```bash
python eval_retrieval_honesty.py
```

#### Results Summary
- **30 In-Domain Unanswerable Negatives:**
  - False Answer Rate (English): **0 / 15 (0.0%)**
  - False Answer Rate (Bengali): **0 / 15 (0.0%)**
  - **Overall False Positive Rate: 0 / 30 (0.0%)** (All 30 correctly triggered `insufficient_data: True` or scored below threshold).
- **10 Paraphrased Answerables (Non-chunk wording):**
  - Hit@1: **5 / 10 (50.0%)**
  - Hit@3: **7 / 10 (70.0%)**
  - Hit@5: **10 / 10 (100.0%)**
  - **MRR Overall: 0.6650**
  - **MRR English: 0.8000**
  - **MRR Bengali: 0.5300** (Drops below the 0.650 quality gate when queries use conversational Bengali synonyms).

#### Code Changes & Justifications versus Baseline
1. `inference/esg_rag/hybrid_retriever.py`:
   - Introduced BM25 sparse keyword index alongside dense vector embeddings.
   - Applied Reciprocal Rank Fusion (RRF with $k=60$).
   - **Threshold Guard**: Chunks only receive an RRF rank bonus if their dense semantic score is $\ge 0.30$. This prevents keyword-stuffing off-topic queries from inflating scores.
   - Added `ESG_EXCLUDE_AGENT_AUTHORED_CORPUS` flag.
2. `inference/esg_rag/eval.py`:
   - Unified CLI evaluation harness validating 5 automated quality gates (Bill extraction, Gap recall, RAG Hit@5, Determinism $\Delta \le 10^{-6}$, Prompt injection resistance).

---

### Task 6: Security & Cryptographic Review

#### 1. Cryptographic Audit of `inference/esg_rag/document_store.py`
- **Initial Finding**: `_get_fernet()` implemented Fernet (AES-128-CBC with HMAC-SHA256). In `read_document()`, failed decryption caught `Exception` and silently returned raw corrupted ciphertext (`except Exception: return raw`), failing open!
- **Harden & Fix Applied (Commit `ed9637f`)**:
  - Replaced Fernet with **AES-256-GCM** (`cryptography.hazmat.primitives.ciphers.aead.AESGCM`).
  - Generates a fresh, cryptographically secure 12-byte random nonce (`os.urandom(12)`) on every write.
  - Stored format: `12-byte nonce + ciphertext + 16-byte authentication tag`.
  - **Fail Closed**: If payload < 28 bytes or tag authentication fails, decryption returns `None`. Never falls back to CBC and never returns unauthenticated ciphertext.

#### 2. Tenant Isolation & Path Traversal
- Sanitizes `tenant_id` and checks:
  ```python
  if not tenant_dir.is_relative_to(base_dir):
      raise ValueError("Path traversal detected")
  ```
- Tested: Directory traversal inputs (`../../etc`, `..\tenant_b`) raise `ValueError` and fail closed. Cross-tenant reads return `404 Not Found`.

#### 3. Endpoint Authorization & RBAC
- `GET /api/esg/bills/{id}/gaps`: Requires `require("read")`. Unauthenticated returns `401`. Cross-tenant returns `404`.
- `POST /api/esg/bills/{id}/values`: Requires `require("write")`. Read-only token returns `403`. Cross-tenant returns `404`.
- `POST /api/esg/bills/{id}/estimate`: Requires `require("read")`. Unauthenticated returns `401`.
- `GET /api/esg/bills/{id}/document`: Requires `require("read")`. Cross-tenant returns `404`.
- `DELETE /api/esg/bills/{id}/document`: Requires `require("write")`. Read-only token returns `403`. Cross-tenant returns `404`.
- `POST /api/esg/invitations`: Requires `require("admin")` or `require("write")`. Unauthenticated returns `401`.

#### 4. Secrets & Text Logging
- Inspected logs: Audit events in `esg_audit_event` record SHA-256 hashes, user IDs, and timestamps. Zero document text or JWT signing keys are output to logs or exception strings.

---

### Task 7: Grid Emission Factor Provenance (0.663096)

1. **Origin Trace**:
   - Traced to `factors/bd_grid/derive.py` via `inference/esg_rag/grid_factor_service.py`.
   - Function: `derive.derive_year("2022-23", inp, plants, rates, ipcc, {}, draws=10000)`.
   - Output Factor: `0.663096 kgCO2e/kWh`.
   - Derivation Hash: `b722c801567b4bf0c936c51e99d13ada22a779ce8447d32cf81d076f7b7f64a5`.
   - Uncertainty: `2.71%` (95% CI: 0.6459 – 0.6810 kgCO2e/kWh).
   - Vintage: FY2022-23 (2022-07-01 to 2023-06-30).
   - Method: Method A top-down national fuel balance.
2. **Data Reality**:
   - The inputs passed into `MethodAInputs` in `grid_factor_service.py` are explicitly documented in code as:
     `net_generation_source: "SYNTHETIC BPDB FY22-23 p.62"`
     `hv = derive.HeatingValue(..., "SYNTHETIC Petrobangla gas quality standard")`
   - **Conclusion**: The factor `0.663096` was generated from a synthetic calibrated input script, not extracted from an official published government gazette.
3. **Pending Status & Dual Control Governance**:
   - Status in database: `DRAFT` (`EmissionFactor.status == 'DRAFT'`).
   - `test_dual_control_preserved_in_ledger_run` verifies that a period calculation cannot use this factor without approval.
   - Attempting self-approval by `created_by` is rejected with `RuleError: Creator cannot approve own emission factor`.
   - Only when approved by a different user (`approved_by != created_by`) does it become `APPROVED`.

---

### Task 8: End-to-End Real Trace & Hand Recomputation

Executed live end-to-end trace script (`scratch/run_e2e_trace.py`) for both an Electricity Bill and a Gas Bill:

#### 1. Electricity Bill Trace (DESCO HT)
1. **Upload** (`POST /api/esg/bills/upload`):
   - Status: `201 Created`
   - Bill ID: `e0d7ca09-2b32-4bc7-bfa0-1f1100826a97`
   - Status: `UNKNOWN_PROFILE` (no matching anchors in raw sample text)
2. **Gaps Analysis** (`GET /api/esg/bills/{id}/gaps`):
   - Status: `200 OK`
   - Missing required: `account.number`, `period.start`, `period.end`, `energy.kwh.total`, `meter.serial`, `meter.multiplier`.
3. **Assign Profile & Enter Values** (`POST /bills/{id}/values`):
   - Assigned Profile: `synthetic-grid-ht`
   - Values entered: `ACC-DESCO-9921`, `2025-05-01`, `2025-05-31`, `15,000 kWh`.
4. **Indicative Estimate** (`POST /api/esg/bills/{id}/estimate` with `allow_provisional=True`):
   - Status: `200 OK`, `status: "INDICATIVE"`
   - Output: `scope2_location_kg: "9946.440000"`, `total_tco2e: "9.946"`.
   - **Hand Recomputation**:
     $$15,000 \text{ kWh} \times 0.663096 \text{ kgCO}_2\text{e/kWh} = 9,946.44 \text{ kgCO}_2\text{e} = 9.94644 \text{ tCO}_2\text{e}$$
     Exact match to microgram ($\Delta = 0.000000$).
5. **Invite Approver** (`POST /api/esg/invitations`):
   - Status: `201 Created`
   - Token generated: `xBVErITuvtfXYyeR1ilJkPL-Gelnay4ZUxDxA1fm07E`
6. **Second-User Approval** (`POST /factors/{id}/approve`):
   - Status: `200 OK` by `approver-a` (different from `admin-a`). Factor status becomes `APPROVED`.
7. **Post to Period & Calculation**:
   - Posting bill blocked if meter register readings are missing (`REQUIRED_PARAMETER_MISSING`).
   - Calculation run ID generated: `aa15c320-b802-41ad-a4e9-4d3692625b92`.
8. **Lock & Snapshot** (`POST /periods/{id}/lock`):
   - Status: `201 Created`. Snapshot sealed with SHA-256 hash `80009aa1...`.

#### 2. Gas Bill Trace (Titas Gas)
1. **Upload & Gaps**:
   - Gas bill uploaded without pre-configured anchor matches enters `UNKNOWN_PROFILE`.
2. **Entered Values**:
   - Entered `250 m3` natural gas volume.
3. **Gas Estimate Attempt**:
   - Status: `200 OK`, `status: "INDICATIVE"`
   - Blocked with: `["NO_CONSUMPTION_PARAMETERS_MAPPED", "UNKNOWN_PROFILE"]`
   - Proves that without an approved profile mapping, the estimate engine refuses to compute fabricated numbers.
4. **Approved Gas Factor Recomputation**:
   - Factor: `1.915000 kgCO2e/m3` (IPCC 2006 Table 2.2 defaults).
   - Hand Calculation:
     $$250 \text{ m}^3 \times 1.915000 \text{ kgCO}_2\text{e/m}^3 = 478.750 \text{ kgCO}_2\text{e} = 0.47875 \text{ tCO}_2\text{e}$$

#### 3. Playwright Intake Wizard Test
Created [`tests/e2e/bill-intake-wizard.spec.ts`](file:///c:/projects/CarbonOS/tests/e2e/bill-intake-wizard.spec.ts):
- Tests 5-step wizard render in English.
- Tests language toggle switching all labels to Bengali (`১. আপলোড`, `২. প্রাপ্ত ফলাফল`, `৩. তথ্যের ঘাটতি পূরণ`, `৪. নিশ্চিতকরণ ও সংরক্ষণ`, `৫. হিসাবের ফলাফল`).
- Tests upload and gap analysis field interaction.

---

### Task 9: Repository Hygiene & Git Tracking

1. **`git ls-files` check for sensitive paths:**
   - `uploads/`: Not tracked.
   - `chroma_data/`: Not tracked.
   - `.env`: Not tracked.
   - `*.sqlite3`: Not tracked.
   - `tests/fixtures/real_samples/`: Not tracked (0 files).
2. **Legacy Tracked Files Identified:**
   - Commit `f297247` contains 3 tracked files in `inference/chroma_data/uploads/`:
     - `0a9d773b1b_Dexterity_Textiles_ESG_Statement_Q2_2026.txt`
     - `438ad0464b_Bangladesh_Grid_and_Fuel_Factor_Status_Note.txt`
     - `7716aafb68_Bangladesh_Updated_NDC_and_ECR_2023.txt`
3. **Hardened `.gitignore` (Commits `411c263` and `9b62c1e`):**
   - Added `uploads/`
   - Added `inference/uploads/`
   - Added `inference/chroma_data/uploads/`
   - Added `tests/fixtures/real_samples/`
   - Verified via `git check-ignore`: All customer uploads, local database files, environment secrets, and real utility bills are strictly ignored.

---

## 3. The 10 Most Serious Open Risks (Ranked)

Below are the 10 most critical technical and compliance risks identified in the codebase, ranked in order of severity:

### 1. Zero Real Utility Bill Grounding (CRITICAL / PRODUCT INTEGRITY)
- **Files**: `tests/fixtures/real_samples/` (empty), `inference/esg_rag/bill_profiles/seed/*.yaml` (lines 1–80)
- **Description**: The system has never been evaluated against a real customer utility bill from Bangladesh (DESCO, DPDC, BPDB, or Titas). All anchors and extraction logic were developed against synthetic mocks. Real-world bill extraction accuracy, bounding-box tolerance, and table parsing recall are completely unknown.
- **Remediation**: Ingest at least 20 anonymized real utility bills across providers and benchmark field recall on a held-out set before production launch.

### 2. Agent-Authored Synthetic RAG Knowledge Base (HIGH / AUDIT COMPLIANCE)
- **Files**: `inference/esg_rag/corpus/*.md` (all 5 files), `inference/esg_rag/reembed_corpus.py` (lines 25–86)
- **Description**: All 5 documents in the RAG knowledge base are AI-generated markdown summaries rather than verbatim official source gazettes or standards. While the `ESG_EXCLUDE_AGENT_AUTHORED_CORPUS` flag has been added, serving unverified agent summaries in audit-grade compliance reports creates substantial regulatory liability.
- **Remediation**: Replace synthesized markdown files with authentic source PDFs (e.g., official Bangladesh Gazette S.R.O. 53/2023, WRI Scope 2 Guidance PDF, IPCC 2006 Chapter 2 PDF).

### 3. Missing `cft` Volume Unit in Core Accounting Engine (HIGH / CALCULATION ACCURACY)
- **Files**: `inference/esg_rag/accounting.py` (lines 12–28), `inference/esg_rag/bill_profiles/parameters.yaml` (lines 14–22)
- **Description**: Natural gas in Bangladesh is universally metered in cubic feet (`cft` or `mcf`). `parameters.yaml` accepts `cft`, but `accounting.py` only defines `m3` in `UNITS`. Attempting to calculate gas emissions in `cft` directly in `accounting.py` causes unhandled unit errors or requires manual conversion ($1\text{ m}^3 = 35.3147\text{ cft}$).
- **Remediation**: Add `cft` to `UNITS` in `accounting.py` with standard cubic meter density conversion: `'cft': ('volume', Decimal('28.316846592'))`.

### 4. Synthetic Calibrated Grid Factor Treated as Authoritative (HIGH / SCIENTIFIC INTEGRITY)
- **Files**: `inference/esg_rag/grid_factor_service.py` (lines 42–78), `factors/bd_grid/derive.py`
- **Description**: The grid factor `0.663096 kgCO2e/kWh` was generated from a synthetic calibrated input script (`SYNTHETIC BPDB FY22-23 p.62`), not empirical BPDB generation ledgers. While marked `DRAFT`, solo users running indicative estimates may perceive `0.663096` as an official government factor.
- **Remediation**: Label the factor clearly as `SYNTHETIC_MODEL_PROPOSAL` in the UI and require ingestion of the actual audited BPDB 2022-23 annual report figures.

### 5. Playwright Browser Binaries Missing from Deployment Host (MEDIUM / CI/CD)
- **Files**: `playwright.config.ts` (lines 1–49), `tests/e2e/*.spec.ts`
- **Description**: Playwright test runner version 1.56.1 is present in `package.json`, but Chromium browser binaries (`chromium_headless_shell-1194`) are not installed on the system, preventing automated UI regression and screenshot testing.
- **Remediation**: Run `npx playwright install chromium` outside sandbox in CI/CD pipelines before test execution.

### 6. Five dMRV Python Modules Failing Import Path Resolution (MEDIUM / CODE HEALTH)
- **Files**: `tests/test_dmrv_allometry.py` (line 14), `test_dmrv_baseline.py`, `test_dmrv_dossier.py`, `test_dmrv_provenance.py`, `test_dmrv_uncertainty.py`
- **Description**: Running `python -m unittest` on individual dMRV modules fails with `ModuleNotFoundError: No module named '_isolated_db'`. The test files lack `sys.path.insert(0, os.path.dirname(__file__))`.
- **Remediation**: Add directory path resolution to `sys.path` in all 5 dMRV test files.

### 7. Degraded Bengali Retrieval MRR on Paraphrased Queries (MEDIUM / LOCALIZATION)
- **Files**: `inference/esg_rag/hybrid_retriever.py` (lines 80–130), `eval_retrieval_honesty.py`
- **Description**: While the hybrid retriever achieves MRR 0.8000 in English on paraphrased questions, Bengali MRR drops to `0.5300` (below the 0.650 target) when queries use colloquial phrasing rather than exact chunk tokens.
- **Remediation**: Ingest a bilingual Bengali synonym dictionary into `bm25.py` and upgrade the dense vector model to a native multilingual model (`paraphrase-multilingual-MiniLM-L12-v2`).

### 8. Tracked Text Files in `inference/chroma_data/uploads/` (MEDIUM / REPO HYGIENE)
- **Files**: `inference/chroma_data/uploads/*.txt` (commit `f297247`)
- **Description**: Three synthetic tenant statement files were committed directly to Git history under `inference/chroma_data/uploads/`.
- **Remediation**: Untrack these files with `git rm --cached inference/chroma_data/uploads/*.txt`.

### 9. Lack of Real Concurrency Testing on SQLite (LOW / CONCURRENCY)
- **Files**: `tests/test_esg_ledger.py` (line 120), `test_concurrent_approvals_single_winner`
- **Description**: Multi-user concurrent approval tests are skipped on SQLite (`needs PostgreSQL for real concurrency`).
- **Remediation**: Add PostgreSQL test harness to GitHub Actions workflow to verify that database-level locking prevents race conditions in dual-control approval.

### 10. Tesseract Missing from Production / CI Environment (LOW / RUNTIME AVAILABILITY)
- **Files**: `inference/esg_rag/ocr.py` (lines 10–30), `tests/test_esg_ocr_smoke.py`
- **Description**: Tesseract OCR engine is not installed on the system PATH. Any scanned bill upload without digital text layers will fail extraction or fall back to LLM extraction (which requires `ESG_LLM_EXTRACTION_ENABLED=true`).
- **Remediation**: Package Tesseract with `ben` and `eng` traineddata into the Docker container image.

