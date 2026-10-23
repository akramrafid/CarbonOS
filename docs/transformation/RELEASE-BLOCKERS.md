# CarbonOS Bangladesh — Production Release Blockers Register

**Document Ref:** `docs/transformation/RELEASE-BLOCKERS.md`  
**Governing Standard:** Section 2, Section 12, Section 24 & Section 26 of Enterprise Master Prompt  
**Status:** ACTIVE AUDIT REGISTER  
**Last Updated:** 2026-10-24  
**Audit Baseline Commit:** `61e1263`  

---

## Executive Summary

In adherence to the **Non-Negotiable Core Invariant** (*"Every consequential output must be either genuinely computed and supported by evidence, explicitly marked as an estimate, or clearly labeled as simulated"*), CarbonOS enforces an uncompromised distinction between operational capabilities and future integrations. 

This document catalogs all verified blockers that prevent unrestricted commercial production rollout across national registry submissions, financial settlements, satellite biomass verification, and AI diagnostics.

---

## 1. Critical Production Release Blockers

### Blocker 1: MoEFCC National Registry Production Credentials & Bilateral Protocol
- **Domain:** Carbon Credit Registry & Article 6.2 ITMO Transfer
- **Severity:** `P0 - RELEASE BLOCKING FOR REGISTRY WRITES`
- **Current State:**  
  The National Registry Bridge (`backend/national_registry_bridge/`) is fully implemented with Article 6.2 authorization schemas, corresponding adjustments tracking, JCM Bilateral Document exports, and Ed25519 digital signatures. However, all submissions currently route to `SANDBOX_ACCEPTED` with `data_origin: "simulation"`.
- **Blocker Description:**  
  The Government of Bangladesh Ministry of Environment, Forest and Climate Change (MoEFCC) has not yet deployed a public, authenticated REST/GraphQL API for third-party automated ITMO credit batch issuance. 
- **Required Resolution Criteria:**
  1. Formal Bilateral MoU or authorization letter from MoEFCC Designated National Authority (DNA).
  2. Production mTLS / API Key credential issuance from MoEFCC.
  3. End-to-end integration test against MoEFCC staging environment with verified transaction hash.
- **Interim Safeguard:**  
  The system hard-gates all registry outputs with `status: "SANDBOX_ACCEPTED"` and `audit_seal: "ED25519-SANDBOX-SIMULATION"`, ensuring no prototype record can be misrepresented as an official sovereign issuance.

---

### Blocker 2: In-Situ Ground-Truth Field Plot Calibration for Mangrove/Sundarbans Biomass
- **Domain:** Satellite dMRV & Geospatial Carbon Modeling
- **Severity:** `P1 - RELEASE BLOCKING FOR ACCREDITED CARBON OFFSET CREDITING`
- **Current State:**  
  The multi-modal satellite pipeline (`inference/carbon_monitoring/`) ingests Sentinel-1 SAR (VV/VH), Sentinel-2 MSI (NDVI, EVI, NDWI), and terrain indices, running through a Quantile Random Forest regressor with [P10, P50, P90] conformal confidence intervals. The model's baseline allometric parameters are derived from published peer-reviewed equations (Chave et al., 2014; Sundarbans forest inventory publications).
- **Blocker Description:**  
  Accredited carbon registries (Verra VM0007, Plan Vivo, Gold Standard) mandate empirical, ground-truth terrestrial sample plot measurements (DBH, height, tree species census, soil core bulk density) taken within the project boundary within 12 months of credit baseline calculation. 
- **Required Resolution Criteria:**
  1. Execution of field sample plot campaigns across designated Sundarbans/Chittagong monitoring zones with GPS-tagged boundary coordinates.
  2. Laboratory soil organic carbon (SOC) core analysis and independent surveyor sign-off.
  3. Re-calibration and cross-validation of the Quantile Random Forest regressor against empirical field plots.
- **Interim Safeguard:**  
  All satellite-estimated carbon figures display explicit confidence bounds (`[P10, P90]`), and where live STAC imagery is unavailable or simulated arrays are analyzed, records are programmatically stamped `data_origin: "simulation"`.

---

### Blocker 3: Live Financial Merchant Gateway & Escrow Settlement (bKash / Nagad / Bank Escrow)
- **Domain:** Marketplace Transactions & Smallholder Farmer Payouts
- **Severity:** `P0 - RELEASE BLOCKING FOR MONETARY SETTLEMENT`
- **Current State:**  
  The transaction system (`backend/farmers_ai_project/` and `src/lib/useHarvestStore.js`) implements transactional order state machines (`INITIATED → RESERVED → PENDING_PAYMENT → SETTLED → RETIRED`). All payment reconciliation and mobile financial services (MFS) payout records are processed in isolated sandbox memory or authenticated test adapter modes.
- **Blocker Description:**  
  Live production merchant accounts for bKash Merchant API, Nagad Commercial API, and Bangladesh Bank Authorized Dealer escrow accounts are not provisioned or connected.
- **Required Resolution Criteria:**
  1. Execution of corporate merchant agreements with bKash / Nagad / Banking Partner.
  2. Integration of webhook signature verification (`HMAC-SHA256`) and idempotency key enforcement.
  3. Deployment of an append-only accounting ledger ensuring zero double-spending and zero unverified payouts.
- **Interim Safeguard:**  
  All credit reservations and farmer payouts are watermarked with `status: "SIMULATED_RESERVATION"` and `mode: "SANDBOX"`. No funds are debited or claimed as disbursed.

---

### Blocker 4: Production Trained Weights for Farmers AI Multi-Head Classifier
- **Domain:** Agricultural Edge AI & Disease Diagnosis
- **Severity:** `P1 - RELEASE BLOCKING FOR REAL-TIME CROP DIAGNOSIS`
- **Current State:**  
  The deep learning diagnostic subsystem (`inference/main.py` and `backend/farmers_ai/views.py`) utilizes an EfficientNet-B3 backbone with species-conditioned disease classification heads for 5 staple Bangladeshi crops (Rice, Potato, Tomato, Wheat, Corn). 
- **Blocker Description:**  
  In local development environments lacking the pre-trained weights file (`backend/multi_head_farmer_ai.pth`), uninitialized model checkpoints must never generate random softmax outputs presented to farmers as agricultural advice.
- **Required Resolution Criteria:**
  1. Full training and validation run on Bangladesh agricultural disease datasets (BRRI Rice Pathology, BARI Potato Late Blight corpus).
  2. Validation exceeding Macro F1 > 0.85 and Calibration Error < 0.10.
  3. Checkpoint artifact deployment to secure S3/GCS object storage with SHA-256 integrity verification.
- **Interim Safeguard:**  
  Enforced by commit `61e1263` (Scenario E verification). When the weight file is missing or unverified, the API safely halts execution, returning `status: "MODEL_UNAVAILABLE"` and localized educational guidance in Bangla, preventing harmful misdiagnoses.

---

### Blocker 5: Third-Party Utility Bill OCR & LayoutLM Document Intelligence Model
- **Domain:** Enterprise Carbon Accounting & ESG Document Extraction
- **Severity:** `P2 - NON-BLOCKING FOR MANUAL ENTRY, BLOCKING FOR FULL AUTOMATION`
- **Current State:**  
  The document extraction pipeline (`inference/esg_rag/extractor.py`) contains regex-based token parsing and structured rule sets for DPDC, DESCO, Titas Gas, and Biman invoices. Under commit `61e1263`, empty or malformed files output strict 0.0 metrics without synthetic data injection (Scenario F).
- **Blocker Description:**  
  Handwritten, poorly photocopied, or stained physical bills from rural industrial zones require fine-tuned LayoutLMv3 or specialized Bengali OCR engines to achieve >95% extraction recall on diverse invoice formats.
- **Required Resolution Criteria:**
  1. Fine-tuning a LayoutLMv3 / Donut model on a curated corpus of 2,500+ de-identified Bangladeshi utility statements.
  2. Integrating a human-in-the-loop review UI allowing sustainability auditors to inspect bounding boxes and correct field values before committing to the emissions ledger.
- **Interim Safeguard:**  
  Extraction outputs require explicit user confirmation before ledger ingestion; unparsed files return zero values without hallucinating consumption numbers.

---

## 2. Release Blocker Tracking & Resolution Matrix

| ID | Capability Area | Blocker Summary | Target Resolution Milestone | Governance Owner |
|---|---|---|---|---|
| **BLK-01** | National Registry | MoEFCC official API authorization & credentials | Phase 8.3 / National Partnership | Principal Architect & Policy Lead |
| **BLK-02** | Satellite dMRV | Sundarbans ground-truth plot calibration | Phase 6.4 / Field Survey Campaign | Remote Sensing Scientist |
| **BLK-03** | Marketplace / Payouts | bKash/MFS merchant integration & bank escrow | Phase 12.4 / Commercial FinTech Integration | Financial Systems Engineer |
| **BLK-04** | Farmers AI | Production trained weights for multi-head EfficientNet | Phase 7.3 / Model Training Pipeline | Computer Vision Engineer |
| **BLK-05** | Document Ingestion | Multi-format Bengali OCR / LayoutLM fine-tuning | Phase 5.2 / Document AI Enhancement | RAG/LLM Engineer |

---

## 3. Compliance Declaration

CarbonOS strictly prohibits the bypass of these blockers through deceptive UI patterns, synthetic mock substitution, or unverified claims. A capability blocked by external institutional dependencies must remain in verified sandbox mode until its technical and legal criteria are fulfilled.
