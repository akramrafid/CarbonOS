# CarbonOS Bangladesh — Data Integrity & Authenticity Register

**Document Ref:** `docs/transformation/DATA-INTEGRITY-REPORT.md`  
**Execution Phase:** Phase Three & Non-Negotiable Core Principles  
**Status:** `VERIFIED_IMPLEMENTED`  
**Latest Audit Commit:** `61e1263`  

---

## 1. Governing Non-Negotiable Principle

> **"Every consequential output must be either genuinely computed and supported by evidence, explicitly marked as an estimate, or clearly labeled as simulated (`data_origin = "simulation"`). Never fabricate carbon credits, regulatory approvals, satellite observations, customer relationships, payment confirmations, scientific validation, or operational statistics."**

---

## 2. Integrity Audit & Remediations Executed

### 2.1 Utility Document Parsing — Elimination of Fabricated Baselines (Scenario F)
- **Previous Hazard:** In `inference/esg_rag/extractor.py`, if a document produced zero regex matches (`sum(params.values()) == 0`), the engine silently substituted hardcoded synthetic values (14,200 L diesel, 156,000 kWh electricity, 39,000 ton-km transport). In `detect_all_utility_segments`, if `< 3` segments were detected, it injected 8 fake utility rules. In `router.py`, `build_nine_category_footprint` added minimum hardcoded spend (e.g. 185,000 BDT transport, 450,000 BDT electricity).
- **Remediation Implemented:**
  - Excised all synthetic baseline metric injection in `extractor.py` and `router.py`.
  - When an uploaded document produces 0 matched utility parameters or is malformed:
    - Returns `status: "NO_METRICS_DETECTED"` or `"NO_SEGMENTS_DETECTED"`.
    - Returns `overall_confidence: 0.0`.
    - Total emissions and spend remain exactly `0.00`.
    - Audit seal marked as `"UNSEALED-NO-DATA"`.
    - `data_origin` explicitly tagged as `"document_parse_empty"`.
  - Zero fabricated consumption values are committed to the emissions ledger.
- **Verification:** Tested in `tests/test_esg_engine.py` (`test_scenario_f_invalid_document_no_fabricated_metrics`).

### 2.2 Emission Factor Traceability & Versioning (Scenario J)
- **Requirement:** Historical approved reports must reproduce identically when future factors are updated. New factors must never silently alter approved historical emissions.
- **Remediation Implemented:**
  - Every calculation in `inference/esg_rag/calculation_engine.py` generates an immutable SHA-256 digital audit seal:
    `SHA256-SEAL-<HASH>`
  - The hash canonically binds: `factor_version`, `reporting_period`, `tenant_id`, and exact sorted parameter values.
  - Every emission factor used carries verified provenance:
    - Diesel: `2.68 kg CO₂e / L` (DoE Bangladesh Gazette 2023)
    - Grid Electricity: `0.550 kg CO₂e / kWh` (DoE Combined Margin, Ref: 22.02.0000.018.99.001.23)
    - Captive Gas: `2.15 kg CO₂e / m³` (DoE National GHG Inventory Guidelines)
  - Historical reports pinned to `v2026.1-NATIONAL` reproduce identical numbers even if future factor catalogs change.
- **Verification:** Tested in `tests/test_esg_engine.py` (`test_scenario_j_factor_versioning_reproducibility` and `test_audit_seal_and_factor_provenance`).

### 2.3 National Carbon Registry Bridge Simulation Isolation
- **Previous Hazard:** Default sandbox responses returned un-prefixed `"ACCEPTED"` statuses, allowing demonstration or test calls to be confused with real governmental Article 6.2 authorization.
- **Remediation Implemented:**
  - In `backend/national_registry_bridge/views.py`:
    - Updated default mock status to `SANDBOX_ACCEPTED`.
    - Injected mandatory metadata: `"data_origin": "simulation"`.
    - Injected clear warning: `"notice": "Simulated local sandbox record. Not an official UNFCCC or Bangladesh Ministry approval."`
  - Prevents accidental representation of test tokens as genuine verified national carbon credits.
- **Commit Reference:** `a509358`

### 2.4 Satellite & dMRV Ground Truth Safeguards (Scenario D)
- **Requirement:** If remote STAC Sentinel imagery or NASA GEDI data is unavailable, the system must not report synthetic data as verified satellite observations.
- **Remediation Implemented:**
  - In `inference/carbon_monitoring/`: When STAC APIs are unreachable, fallback synthetic arrays are tagged with `data_origin: "simulation"` and `status: "OFFLINE_SIMULATION"`.
  - Bi-temporal change detection and forest canopy cover metrics are withheld from production registry export bundles unless genuine imagery was processed.
- **Verification:** Verified by `tests/test_dmrv_v2.py`.

---

## 3. Data Authenticity Register

| Component | Ingestion / Processing Source | Output Classification | Audit Seal / Provenance |
|---|---|---|---|
| **Scope 1 Fuel Combustion** | Generator logbooks, Fuel receipts | `GENUINE_COMPUTED` | SHA256-SEAL with DoE Gazette 2023 |
| **Scope 2 Purchased Grid Power** | DESCO / BPDB / NESCO Statements | `GENUINE_COMPUTED` | SHA256-SEAL with DoE Combined Margin |
| **Scope 3 Upstream & Logistics** | Freight consignment notes, EEIO | `ESTIMATE_EXPLICIT` | SFC GLEC & CEDA EEIO citations |
| **Crop Health Diagnosis** | Field leaf photos | `GENUINE_COMPUTED` / `MODEL_UNAVAILABLE` | Checkpoint verified; no untrained execution |
| **National Registry Bridge** | Ministry NDC Bridge API | `SANDBOX_ACCEPTED` (`data_origin = "simulation"`) | Marked local sandbox |
| **Satellite Biomass MRV** | Sentinel-2 / NASA GEDI STAC | `GENUINE_COMPUTED` or `SIMULATION` | Ed25519 hash chain |

---

## 4. Verification Checkpoint Status

- **Scenario F (Invalid Document Handling):** `PASS` (Verified in `test_esg_engine.py`)
- **Scenario J (Factor Reproducibility):** `PASS` (Verified in `test_esg_engine.py`)
- **Cryptographic Chaining:** `PASS` (Verified in `test_dmrv_provenance.py`)
- **Zero-Fabrication Audit:** All synthetic fallback metric injections eliminated from parsing and router pipelines.
