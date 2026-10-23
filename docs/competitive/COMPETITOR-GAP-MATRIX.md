# CarbonOS Bangladesh — Competitive Benchmark & Gap Matrix

## Overview
This document benchmarks **CarbonOS Bangladesh** against international market leaders in enterprise carbon accounting, ESG disclosure, carbon credit integrity, satellite MRV, and agricultural AI.

**Operating Principle:** Never claim a competitor capability exists without reliable documentation; never claim a CarbonOS capability exists or is verified unless supported by evidence in the active codebase.

---

## 1. Competitor Landscape

### Enterprise Carbon Accounting & ESG
- **Watershed**: Enterprise carbon accounting, supply chain engagement, Scope 1-3 analytics, verified emissions factor library, reduction planning.
- **Persefoni**: SEC/CSRD compliance-grade carbon accounting, PCAF financed emissions, financial-grade audit trails.
- **Sweep**: Multi-company collaborative carbon footprints, tree hierarchy, supply chain survey campaigns.
- **IBM Envizi**: Multi-facility utility bill capture, enterprise asset hierarchy, historical restatements.
- **Salesforce Net Zero Cloud**: CRM-integrated supplier emissions, ESG disclosures, automated workflows.

### Carbon Integrity & Marketplaces
- **Patch / Cloverly / Carbonmark**: API-driven carbon credit procurement, programmatic retirement, live registry synchronization.
- **Sylvera / BeZero Carbon**: Independent carbon project rating, satellite permanence analysis, additionality auditing.
- **Verra / Gold Standard**: Official crediting standards, serial number registries, project methodology verification.

### Satellite & Agricultural MRV
- **Chloris Geospatial**: Spaceborne LiDAR and SAR biomass dynamics, Tier-3 uncertainty calculations, deforestation monitoring.
- **Regrow Ag / Boomitra**: Soil organic carbon (SOC) modeling, Alternate Wetting and Drying (AWD) rice paddy verification.
- **Cropin / PlantVillage Nuru**: Edge crop disease diagnostics, agronomist referral networks, weather risk alerts.

---

## 2. Competitor Gap Matrix

| Capability | Competitor Reference | CarbonOS Current State | Evidence (Codebase Location) | Gap | Business Impact | Priority | Implementation Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| **Scope 1 & 2 Emissions Accounting** | Watershed, Persefoni | VERIFIED_IMPLEMENTED | `src/pages/platform/SaaSDashboard.jsx:130-220`, `inference/carbon_monitoring/router.py` | Missing dynamic monthly activity entry; hardcoded emission factor library | Core MVP table stakes for RMG exporters | P0 | Verified emission factor registry (`0.550 kg CO₂e/kWh` locked) | User can enter kWh/fuel consumption and receive auditable tCO₂e breakdown with methodology citations |
| **Grid Emission Factor Precision** | Watershed, Persefoni | VERIFIED_IMPLEMENTED | `plan.md:68`, `AGENTS.md:68`, `LiveMetrics.jsx:62` (Bangladesh DoE Combined Margin `0.550 kg CO₂e/kWh`) | Factor is enforced, but lacks regional time-series variance (e.g., peak/off-peak) | High credibility with local regulators (DoE, SREDA) | P0 | Department of Environment Gazette ref `22.02.0000.018.99.001.23` | Scope 2 calculations strictly apply `0.550 kg CO₂e/kWh` with immutable audit log |
| **Multi-Facility & Enterprise Hierarchy** | IBM Envizi, Sweep | PARTIALLY_IMPLEMENTED | `src/pages/platform/SaaSDashboard.jsx`, `src/pages/platform/components/ActivityEvidenceWorkspace.jsx` | Hierarchy (Org → Division → Facility → Meter) partially represented in frontend; needs relational database models | Critical for multinational conglomerates (e.g., DBL, Beximco, Square) | P1 | PostgreSQL multi-tenant schema with Facility & Meter models | Tenant admin can create multiple facilities and assign facility managers with scoped view |
| **Utility Bill Document Intelligence (OCR/AI)** | Watershed, IBM Envizi | PARTIALLY_IMPLEMENTED | `src/pages/platform/ESGReporting.jsx:110-180`, `inference/esg_rag/router.py` | PDF ingestion relies on client Gemini API without field-by-field verification & audit commit workflow | Highest commercial wedge for reducing onboarding friction | P0 / P1 | Tesseract/Docling OCR + structured Pydantic extraction schema | Uploaded utility bill extracts provider, kWh, cost, and requires human confirmation before ledger commit |
| **Regulatory RAG with Citation Grounding** | Persefoni, Workiva | VERIFIED_IMPLEMENTED | `inference/esg_rag/router.py:180-245`, `tests/test_esg_rag.py` | ChromaDB vector search + Gemini grounded with page/snippet citations; needs cross-tenant isolation enforcement | Essential for CSRD, CBAM, and Bangladesh Bank ESG guidelines | P0 | `where={"tenant_id": current_tenant}` filter on every query | Vector search returns verbatim citation or outputs explicit data-insufficiency notice if score < 0.60 |
| **Scope 3 Category 1 (Purchased Goods - Textiles)** | Sweep, Terrascope | PARTIALLY_IMPLEMENTED | `src/pages/platform/SaaSDashboard.jsx`, `src/pages/platform/components/EsgReportGenerator.jsx` | Cradle-to-gate yarn/fabric factors hardcoded; missing supplier survey portal | Critical differentiator for Bangladesh RMG sector (CBAM compliance) | P1 | Supplier onboarding portal & Higg FEM data import adapter | Exporter can calculate Product Carbon Footprint (PCF) for a cotton t-shirt with transparent factor lineage |
| **Biomass & Carbon Estimation via Remote Sensing** | Chloris Geospatial | VERIFIED_IMPLEMENTED | `inference/carbon_monitoring/fusion_model.py`, `router.py`, `tests/test_satellite_pipeline.py` | Model runs Random Forest quantile regression on synthetic mock tensors when Sentinel imagery API is unavailable | Key for domestic forestry and agroforestry carbon credit developers | P0 / P2 | Sentinel-2 STAC API / Copernicus Hub connector with clear offline fallback | Pipeline outputs prediction intervals [P10, P50, P90] and explicitly marks synthetic tensors as `data_origin = "simulation"` |
| **Alternate Wetting & Drying (AWD) Methane Verification** | Regrow Ag, Boomitra | PARTIALLY_IMPLEMENTED | `backend/farmers_ai/models.py:AWDProject`, `tests/test_awd_payout.py` | Mathematical baseline formulas implemented; lacks automated Sentinel-1 SAR flood/drain radar indexing | High national impact (rice cultivation methane reduction) | P1 / P2 | Sentinel-1 SAR water-index calculation script | Verifiable water-depth sensor logs paired with satellite backscatter radar confirmation |
| **Crop Disease Diagnosis (Mobile/Edge)** | PlantVillage Nuru, Cropin | VERIFIED_IMPLEMENTED | `src/pages/farmers-ai/CameraCapture.jsx`, `backend/farmers_ai/views.py`, `tests/test_model_pipeline.py` | Inconsistent port mapping between Django and FastAPI prevents seamless cloud inference; ONNX web model needs validation | Core value for rural smallholders and contract farmers | P0 | Unified port contract (Django: 8001, FastAPI: 8000) and species-conditioned heads | Camera capture uploads leaf scan, forwards to FastAPI, returns disease + Bangla treatment with severity |
| **National Carbon Registry Bridge (Article 6 & JCM)** | ClimateTrade, Carbonmark | VERIFIED_IMPLEMENTED | `backend/national_registry_bridge/`, `src/pages/platform/CarbonRegistry.jsx` | Sandbox mock responses return `"status": "ACCEPTED"` without explicit `SANDBOX_` prefix, risking conflation with real DoE approval | Sovereign compliance differentiator for Bangladesh | P0 | Strict status enum: `LOCAL_DRAFT`, `SANDBOX_SUBMITTED`, `SANDBOX_ACCEPTED`, `PRODUCTION_SUBMITTED` | Submissions in sandbox mode are machine-tagged `SANDBOX_ACCEPTED` with zero claims of official government sign-off |
| **Ed25519 Cryptographic Provenance** | Sylvera, Patch | VERIFIED_IMPLEMENTED | `inference/carbon_monitoring/provenance.py`, `tests/test_dmrv_provenance.py` | Provenance chain implemented with SHA-256 and Ed25519 signing; key generation was previously exposed in mock UI | Fundamental for auditability and anti-greenwashing defense | P0 | Private key stored in server environment, never returned to client | Tampering with any historical sensor log invalidates subsequent hash chain and prevents credit issuance |
| **Carbon Credit Marketplace & Settlement** | Patch, Cloverly | SIMULATED | `src/pages/Marketplace.jsx`, `src/pages/platform/CarbonRegistry.jsx` | Purchase transactions and farmer bKash payouts are simulated in client memory; no live payment gateway connected | High commercial interest, but strictly dependent on real legal authorization | P3 | Authorized payment gateway (SSLCommerz/Stripe) + legal escrow custody | Clear UI banner stating "DEMO SANDBOX MARKETPLACE - NO REAL FUNDS OR CREDITS TRANSFERRED" |

---

## 3. Strategic Recommendations for CarbonOS Bangladesh

1. **Focus on the Initial Commercial Wedge:**
   - Establish CarbonOS as the definitive **Enterprise Carbon Accounting & Utility Extraction Engine for Bangladesh RMG Exporters facing EU CBAM**.
   - Foreign competitors (Watershed, Persefoni) lack localized Bangladesh emission factors, Bengali utility invoice OCR models (DESCO, DPDC, TITAS Gas), and domestic regulatory integrations.

2. **Decouple and Protect the Registry & Marketplace:**
   - Keep the National Registry Bridge and Carbon Credit Marketplace in an explicitly labeled **`SANDBOX`** operational state until institutional agreements with the Ministry of Environment, Forest and Climate Change (MoEFCC) and Department of Environment (DoE) are formally executed.

3. **Ground All AI & Sensor Feeds:**
   - Eliminate all instances where failed remote connections silently fall back to synthetic data masquerading as "live telemetry" or "official approvals".
