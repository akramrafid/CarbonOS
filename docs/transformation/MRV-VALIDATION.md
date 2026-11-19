# CarbonOS Bangladesh — Satellite dMRV Validation & Verification Report

**Document Ref:** `docs/transformation/MRV-VALIDATION.md`  
**Standard:** Verra VM0047, IPCC Tier 2/3 Biomass Measurement & Article 6.2  
**Status:** `VERIFIED_WITH_SIMULATION_GUARDS`  
**Latest Baseline Commit:** `61e1263`  

---

## 1. Digital MRV (dMRV) Pipeline Overview

CarbonOS integrates automated remote sensing, radar backscatter, allometric allometry, and machine-learning quantile estimators into an auditable digital MRV pipeline (`inference/carbon_monitoring/`).

```
[ Polygon Boundary (GeoJSON / WKT) ]
                 │
                 ▼
[ STAC Sentinel-2 & Sentinel-1 Ingestion Engine ]
   • Scene ID, BBox, Cloud Masking (< 20%)
   • Multi-spectral Bands: Red, Green, Blue, NIR, SWIR1, SWIR2
   • SAR Polarizations: VV, VH, Cross-Ratio (VH/VV)
                 │
                 ▼
[ Biophysical Index Computation ]
   • NDVI = (NIR - Red) / (NIR + Red)
   • EVI  = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
   • NDWI = (Green - NIR) / (Green + NIR)
                 │
                 ▼
[ AI Biomass Quantile Regressor (RF + XGBoost Fusion) ]
   • Outputs: Aboveground Biomass (AGB t/ha)
   • Uncertainty: [P10 (Pessimistic), P50 (Expected), P90 (Optimistic)]
                 │
                 ▼
[ Cryptographic Provenance Chaining (Ed25519 + SHA-256) ]
   • Signed Hash Chains linking monitoring epochs T0 -> T1 -> T2
   • Tamper-evident seals on every monitoring block
                 │
                 ▼
[ Verra VM0047 Submission Bundle Exporter ]
   • Canonical JSON export with Stratum Area, Net Carbon Abated,
     Buffer Pool Deduction (15%), and Article 6.2 ITMO eligibility.
```

---

## 2. Cryptographic Provenance & Tamper-Detection

- **Cryptographic Library:** Pure standard-library / cryptography Ed25519 digital signatures.
- **Data Chaining:** Every monitoring record hashes the previous epoch's signature and payload into a continuous SHA-256 block chain (`inference/carbon_monitoring/provenance.py`).
- **Tamper Invalidation (Scenario G):** If a malicious actor alters a previously verified biomass reading from 120.0 t/ha to 180.0 t/ha, the signature verification routine immediately detects cryptographic mismatch and invalidates the entire monitoring epoch.
- **Test Evidence:** `tests/test_dmrv_provenance.py` (Passing).

---

## 3. Verra VM0047 Bundle Exporter (`registry_export.py`)

- **Methodology Specification:** Verra VM0047 Methodology for Afforestation, Reforestation and Revegetation (ARR).
- **Required Sections Exported:**
  1. `project_metadata`: Verified Project ID, Geographic Extent, Proponent.
  2. `stratum_data`: Hectares, Baseline Carbon Stock, Project Carbon Stock.
  3. `biomass_estimates`: Quantile distribution [P10, P50, P90], Standard Error.
  4. `risk_and_permanence`: Mandatory 15% non-permanence buffer pool contribution.
  5. `article_6_authorization`: Corresponding adjustments and national registry linkage.
- **Test Evidence:** `tests/test_dmrv_v2.py` (`test_12_vm0047_stocking_index_export`: PASS).

---

## 4. Scientific Grounding & Simulation Boundaries (Scenario D)

6. **Real EO COG vs Simulation Boundaries (Fail-Closed):**
   - `SatelliteEngine._extract_stac_cog_grid` reads real GeoTIFF COGs (`B02..B12`, `SCL`, and `Sentinel-1` GRD `VV`/`VH`) preserving raw measured `average_bands` into `CarbonEstimator` without scalar-NDVI overwrites.
   - When real COG extraction or `>= 30` (RF) / `>= 150` (Fusion) calibrated ground-truth plots or `>= 20` held-out conformal plots are absent, runs are explicitly marked (`pixel_extraction_mode="stac_metadata_heuristic"` / `"simulated"`, `model_trained_on="synthetic-v1"`, `is_statistically_valid_conformal=False`, `vvb_model_eligible=False`) and blocked from registry issuance (`BLOCKED_PENDING_AUDIT_REQUIREMENTS`).
   - Multi-pool intervals use seeded IPCC 2006 Approach 2 Monte Carlo error propagation (`propagate_multipool_uncertainty`); Article 6.2 / JCM exports enforce epoch-over-epoch removal deltas, `PE_p` deductions, SHA-256 LoA tracking, and AOI polygon overlap checks.
