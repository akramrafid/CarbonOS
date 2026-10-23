# CarbonOS Bangladesh — Machine Learning Validation & Model Card

**Document Ref:** `docs/transformation/ML-VALIDATION.md`  
**Model Family:** Farmers AI Crop Disease Diagnostics & Carbon Monitoring Quantile Models  
**Status:** `AUDITED_AND_GUARDED`  
**Latest Baseline Commit:** `61e1263`  

---

## 1. Multi-Head Crop Disease Classifier (`inference/main.py`)

### 1.1 Architecture & Backbone
- **Base Architecture:** Transfer learning with an `EfficientNet-B3` feature extractor followed by independent crop-specific linear heads.
- **Supported Crop Species:**
  - `rice` (Rice / ধান)
  - `potato` (Potato / আলু)
  - `corn` (Maize / ভুট্টা)
  - `wheat` (Wheat / গম)
  - `mango` (Mango / আম — Tier B Carbon Stock Asset)
  - `tea` (Tea / চা)
  - `jute` (Jute / পাট)
  - `citrus` (Citrus / লেবু)
  - `jackfruit` (Jackfruit / কাঁঠাল)
  - `guava` (Guava / পেয়ারা)
- **Conditioned Inference:** Species token passed with image input isolates inference strictly to that crop's output head, eliminating cross-species classification noise.

### 1.2 Untrained Weight Prohibition (Scenario E Safeguard)
- **Hazard Identified in Audit:** When checkpoint `backend/multi_head_farmer_ai.pth` was absent from disk, the system previously ran forward passes on uninitialized weights with random logits, producing hallucinated disease diagnoses to farmers.
- **Production Guard Implemented:**
  - System verifies `checkpoint_loaded` flag upon startup.
  - If weights are missing and external cloud inference fails, `/predict` rejects untrained computation.
  - Returns `status: "MODEL_UNAVAILABLE"`, `confidence: 0.0`, `severity: "unknown"`, `needs_agronomist_review: True`, and a respectful notice in Bangla advising contact with a local agricultural extension officer.
  - Zero randomized or uncalibrated probabilities are returned to users.
- **Verification:** Unit tested in `backend/farmers_ai/tests.py` (`test_scenario_e_model_unavailable_safeguard`).

### 1.3 Explainability & Grad-CAM
- Model outputs Class Activation Maps (Grad-CAM) highlighting spatial regions on the leaf contributing to the prediction.
- Visual attention heatmaps provide visual verification for human agronomists reviewing diagnoses with confidence below 80%.

---

## 2. Carbon Biomass Quantile Regressors (`inference/carbon_monitoring/`)

### 2.1 Model Specification
- **Algorithms:** Random Forest Quantile Regressor & XGBoost Regressor (`fusion_model.py`).
- **Input Features:** Multi-spectral Sentinel-2 bands (B2, B3, B4, B8, B11, B12), derived vegetation indices (NDVI, EVI, NDRE), and radar backscatter (Sentinel-1 VV/VH).
- **Target Variable:** Aboveground Biomass (AGB, in t/ha) and Carbon Stock Density (tC/ha).
- **Uncertainty Bounds:** Outputs calibrated quantile intervals [P10 (pessimistic), P50 (median estimate), P90 (optimistic)].

### 2.2 Offline & Simulation Boundaries (Scenario D)
- When remote Sentinel STAC APIs are unreachable, the model generates labeled offline simulations.
- In accordance with the Data Authenticity Register, all fallback arrays are explicitly tagged with `data_origin = "simulation"`.
- Simulated outputs cannot be certified as verified Verra Article 6.2 credits without live ground-truth or STAC scene ingestion.

---

## 3. Recommended Validation Protocols for Production Release
1. **Independent Test Partition:** Assemble an annotated dataset of 5,000+ field-collected leaf photos across diverse Bangladesh agro-ecological zones (Rajshahi, Sylhet, Rangpur, Jessore).
2. **Performance Metrics:** Require macro-F1 >= 0.88 and class-wise recall >= 0.85 across priority diseases (Blast, Brown Spot, Late Blight) before issuing an automated certification seal.
3. **Out-of-Distribution Abstention:** Implement an image entropy or background check to reject non-leaf images (hands, soil, machinery) with high uncertainty.
