# Codebase Inventory & Structural Audit

Generated as part of **Phase 0: Preflight and Baseline** for the comprehensive UI/UX overhaul.

---

## 1. Route Map
Total active routes: **36**

| Path | Primary Component | Responsibility & Description |
| :--- | :--- | :--- |
| `/` | [Home.jsx](file:///C:\projects\CarbonOS\src\pages\Home.jsx) | CarbonOS Corporate & National Landing Page |
| `/how-it-works` | [HowItWorks.jsx](file:///C:\projects\CarbonOS\src\pages\HowItWorks.jsx) | Process Architecture & Workflow Explanation |
| `/platform/project-onboarding` | [ProjectOnboarding.jsx](file:///C:\projects\CarbonOS\src\pages\platform\ProjectOnboarding.jsx) | Step-by-step Carbon Project Registration Wizard |
| `/platform/mrv-dashboard` | [MRVDashboard.jsx](file:///C:\projects\CarbonOS\src\pages\platform\MRVDashboard.jsx) | Measurement, Reporting & Verification Telemetry Console |
| `/platform/carbon-registry` | [CarbonRegistry.jsx](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx) | National Carbon Asset Ledger & Credit Registry |
| `/platform/verification-workflow` | [VerificationWorkflow.jsx](file:///C:\projects\CarbonOS\src\pages\platform\VerificationWorkflow.jsx) | Auditor & Validator Review Pipeline |
| `/platform/marketplace` | [MarketplaceBrowse.jsx](file:///C:\projects\CarbonOS\src\components\marketplace\MarketplaceBrowse.jsx) | Credit Purchasing & Farmer Offtake Marketplace |
| `/platform/ai-detection` | [AIDetection.jsx](file:///C:\projects\CarbonOS\src\pages\platform\AIDetection.jsx) | Multi-spectral AI Remote Sensing & Change Detection |
| `/platform/saas-dashboard` | [SaaSDashboard.jsx](file:///C:\projects\CarbonOS\src\pages\platform\SaaSDashboard.jsx) | Enterprise SaaS Carbon Accounting & Billing Portal |
| `/platform/esg` | [EsgWorkspace.jsx](file:///C:\projects\CarbonOS\src\pages\platform\esg\EsgWorkspace.jsx) | Corporate ESG Intake, Utility Bill OCR & Scope 1-3 Calculator |
| `/platform/impact` | [Impact.jsx](file:///C:\projects\CarbonOS\src\pages\platform\Impact.jsx) | SDG Impact Metrics & Community Benefit Tracking |
| `/carbon-monitoring` | [CarbonMonitoring.jsx](file:///C:\projects\CarbonOS\src\pages\platform\CarbonMonitoring.jsx) | Integrated GIS Satellite & Biomass Heatmap Console |
| `/farmers-ai` | [FarmersAILanding.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\FarmersAILanding.jsx) | Farmer-first AI Crop Health & Carbon Diagnostics |
| `/farmers-ai/camera` | [CameraCapture.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\CameraCapture.jsx) | Field Camera & Offline Photo Capture UI |
| `/farmers-ai/result` | [DiagnosisResult.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\DiagnosisResult.jsx) | Crop Pest/Disease Diagnosis & Treatment Advisory |
| `/harvestguard/dashboard` | [HarvestGuardDashboard.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\HarvestGuardDashboard.jsx) | Farmer Cooperative Yield & Carbon Aggregation |
| `/harvestguard/register-batch` | [BatchRegistration.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\BatchRegistration.jsx) | Agricultural Parcel & Batch Enrollment |
| `/harvestguard/risk-analysis/:batchId` | [WeatherRiskWidget.jsx](file:///C:\projects\CarbonOS\src\components\farmers-ai\WeatherRiskWidget.jsx) | Micro-climate & Monsoon Risk Analysis |
| `/harvestguard/risk-map` | [LocalRiskMap.jsx](file:///C:\projects\CarbonOS\src\components\farmers-ai\LocalRiskMap.jsx) | Geo-spatial Plot Weather & Flood Risk Map |
| `/technology` | [Technology.jsx](file:///C:\projects\CarbonOS\src\pages\Technology.jsx) | Core Tech Stack: Sentinel, Drone LiDAR, Grad-CAM, dMRV |
| `/dashboard/farmer` | [FarmerCreditsWidget.jsx](file:///C:\projects\CarbonOS\src\components\dashboard\FarmerCreditsWidget.jsx) | Smallholder Farmer Direct Credit Balance |
| `/dashboard/farmer/earnings` | [FarmerEarnings.jsx](file:///C:\projects\CarbonOS\src\pages\platform\FarmerEarnings.jsx) | MFS / bKash Payout Ledger & History |
| `/sectors/solar-irrigation` | [SolarIrrigation.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\SolarIrrigation.jsx) | Clean Energy Irrigation Sector Profile |
| `/sectors/rice-methane` | [RiceMethane.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\RiceMethane.jsx) | AWD Alternate Wetting & Drying Sector Profile |
| `/sectors/clean-cookstoves` | [CleanCookstoves.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\CleanCookstoves.jsx) | Improved Biomass Cookstove Sector Profile |
| `/sectors/waste-to-energy` | [WasteToEnergy.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\WasteToEnergy.jsx) | Municipal Solid Waste Biogas Profile |
| `/sectors/mangrove-carbon` | [MangroveCarbon.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\MangroveCarbon.jsx) | Sundarbans Blue Carbon Sequestration Profile |
| `/sectors/brick-kilns` | [BrickKilns.jsx](file:///C:\projects\CarbonOS\src\pages\sectors\BrickKilns.jsx) | Zigzag & HHK Industrial Kiln Modernization |
| `/company/about` | [About.jsx](file:///C:\projects\CarbonOS\src\pages\company\About.jsx) | Team, Mission & Advisory Governance |
| `/company/framework-docs` | [FrameworkDocs.jsx](file:///C:\projects\CarbonOS\src\pages\company\FrameworkDocs.jsx) | Methodology & Article 6.2 Regulatory Alignment |
| `/company/api-docs` | [APIDocs.jsx](file:///C:\projects\CarbonOS\src\pages\company\APIDocs.jsx) | REST & GraphQL Developer Documentation |
| `/company/careers` | [Careers.jsx](file:///C:\projects\CarbonOS\src\pages\company\Careers.jsx) | Open Engineering & Climate Science Roles |
| `/company/privacy` | [Privacy.jsx](file:///C:\projects\CarbonOS\src\pages\company\Privacy.jsx) | Privacy Policy & Data Sovereign Protocol |
| `/company/terms` | [Terms.jsx](file:///C:\projects\CarbonOS\src\pages\company\Terms.jsx) | Terms of Service & Tokenized Asset Disclaimers |
| `/forbidden` | [Forbidden.jsx](file:///C:\projects\CarbonOS\src\pages\Forbidden.jsx) | 403 Forbidden Access State |
| `/*` | [NotFound.jsx](file:///C:\projects\CarbonOS\src\pages\NotFound.jsx) | 404 Dynamic Route Catch-all |

---

## 2. Monolithic & Large Files (>400 Lines)
The following **20** files exceed the 400-line modularity threshold and require decomposition into domain panels under `src/features/`:

| Lines | File Path | Modularity Risk & Notes |
| :---: | :--- | :--- |
| **5707** | [src/pages/platform/CarbonMonitoring.jsx](file:///C:\projects\CarbonOS\src\pages\platform\CarbonMonitoring.jsx) | Monolithic GIS, heatmap, charts, layer toggles, and state (~5.7k lines). |
| **4967** | [src/pages/platform/SaaSDashboard.jsx](file:///C:\projects\CarbonOS\src\pages\platform\SaaSDashboard.jsx) | Monolithic enterprise suite with ESG, billing, metrics, and modals (~5.0k lines). |
| **1709** | [src/pages/platform/CarbonRegistry.jsx](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx) | Registry ledger, table filters, retirement modals, and issuance flows (~1.7k lines). |
| **1325** | [src/pages/platform/components/ActivityEvidenceWorkspace.jsx](file:///C:\projects\CarbonOS\src\pages\platform\components\ActivityEvidenceWorkspace.jsx) | Evidence uploads, audit trails, and document reviewers (~1.3k lines). |
| **1289** | [src/components/marketplace/MarketplaceBrowse.jsx](file:///C:\projects\CarbonOS\src\components\marketplace\MarketplaceBrowse.jsx) | Product cards, cart state, checkout drawers, and filtering (~1.3k lines). |
| **1018** | [src/pages/farmers-ai/DiagnosisResult.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\DiagnosisResult.jsx) | Diagnosis card, treatment actions, disease explanations, and weather (~1.0k lines). |
| **967** | [src/pages/platform/components/VerificationReadinessCenter.jsx](file:///C:\projects\CarbonOS\src\pages\platform\components\VerificationReadinessCenter.jsx) | High complexity component needing decomposition. |
| **940** | [src/pages/platform/components/UniversalUtilityExtractor.jsx](file:///C:\projects\CarbonOS\src\pages\platform\components\UniversalUtilityExtractor.jsx) | High complexity component needing decomposition. |
| **920** | [src/pages/platform/esg/BillIntakeWizard.jsx](file:///C:\projects\CarbonOS\src\pages\platform\esg\BillIntakeWizard.jsx) | High complexity component needing decomposition. |
| **789** | [src/pages/platform/MRVDashboard.jsx](file:///C:\projects\CarbonOS\src\pages\platform\MRVDashboard.jsx) | High complexity component needing decomposition. |
| **755** | [src/components/payments/PurchaseConfirmModal.jsx](file:///C:\projects\CarbonOS\src\components\payments\PurchaseConfirmModal.jsx) | High complexity component needing decomposition. |
| **647** | [src/pages/farmers-ai/CameraCapture.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\CameraCapture.jsx) | High complexity component needing decomposition. |
| **633** | [src/pages/platform/components/EsgReportGenerator.jsx](file:///C:\projects\CarbonOS\src\pages\platform\components\EsgReportGenerator.jsx) | High complexity component needing decomposition. |
| **632** | [src/lib/esgDocumentExtractor.js](file:///C:\projects\CarbonOS\src\lib\esgDocumentExtractor.js) | High complexity component needing decomposition. |
| **611** | [src/components/PlatformModules.jsx](file:///C:\projects\CarbonOS\src\components\PlatformModules.jsx) | High complexity component needing decomposition. |
| **575** | [src/lib/esgApi.js](file:///C:\projects\CarbonOS\src\lib\esgApi.js) | High complexity component needing decomposition. |
| **564** | [src/pages/platform/Impact.jsx](file:///C:\projects\CarbonOS\src\pages\platform\Impact.jsx) | High complexity component needing decomposition. |
| **554** | [src/components/CorporateSaaSPipeline.jsx](file:///C:\projects\CarbonOS\src\components\CorporateSaaSPipeline.jsx) | High complexity component needing decomposition. |
| **515** | [src/pages/farmers-ai/FarmersAILanding.jsx](file:///C:\projects\CarbonOS\src\pages\farmers-ai\FarmersAILanding.jsx) | High complexity component needing decomposition. |
| **459** | [src/components/LiveMetrics.jsx](file:///C:\projects\CarbonOS\src\components\LiveMetrics.jsx) | High complexity component needing decomposition. |

---

## 3. Near-Duplicate Components & Repeated JSX Blocks

### Modals (Inconsistent overlay, close button, and focus behavior)
**Identified In:**
- [`src/components/RequestDemoModal.jsx`](file:///C:\projects\CarbonOS\src\components\RequestDemoModal.jsx)
- [`src/components/marketplace/CheckoutModal.jsx`](file:///C:\projects\CarbonOS\src\components\marketplace\CheckoutModal.jsx)
- [`src/components/payments/PurchaseConfirmModal.jsx`](file:///C:\projects\CarbonOS\src\components\payments\PurchaseConfirmModal.jsx)
- [`src/pages/platform/components/EsgAuditModal.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\EsgAuditModal.jsx)

**Issue & Remediation Plan:**
Multiple distinct modal shells instead of a unified accessible Dialog primitive.

### Stat Cards / Metric KPI Tiles
**Identified In:**
- [`src/pages/platform/SaaSDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\SaaSDashboard.jsx)
- [`src/pages/platform/MRVDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\MRVDashboard.jsx)
- [`src/pages/platform/CarbonRegistry.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx)
- [`src/pages/platform/Impact.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\Impact.jsx)
- [`src/pages/farmers-ai/HarvestGuardDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\HarvestGuardDashboard.jsx)
- [`src/components/LiveMetrics.jsx`](file:///C:\projects\CarbonOS\src\components\LiveMetrics.jsx)

**Issue & Remediation Plan:**
Repeated card markup with hardcoded borders, shadows, backgrounds, and tabular numbers.

### Section Headers (Badge + Title + Paragraph)
**Identified In:**
- [`src/components/Hero.jsx`](file:///C:\projects\CarbonOS\src\components\Hero.jsx)
- [`src/components/Philosophy.jsx`](file:///C:\projects\CarbonOS\src\components\Philosophy.jsx)
- [`src/components/Roadmap.jsx`](file:///C:\projects\CarbonOS\src\components\Roadmap.jsx)
- [`src/components/CorporateSaaSPipeline.jsx`](file:///C:\projects\CarbonOS\src\components\CorporateSaaSPipeline.jsx)
- [`src/components/FrameworkAlignment.jsx`](file:///C:\projects\CarbonOS\src\components\FrameworkAlignment.jsx)
- [`src/components/ClientShowcase.jsx`](file:///C:\projects\CarbonOS\src\components\ClientShowcase.jsx)
- [`src/pages/Technology.jsx`](file:///C:\projects\CarbonOS\src\pages\Technology.jsx)

**Issue & Remediation Plan:**
Nearly identical markup for centered pill badges, headings with gradients, and muted subtitles.

### Data Tables with Ad-hoc Mobile Scrolling
**Identified In:**
- [`src/pages/platform/CarbonRegistry.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx)
- [`src/pages/platform/MRVDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\MRVDashboard.jsx)
- [`src/pages/platform/esg/BillAnalysisPanel.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\esg\BillAnalysisPanel.jsx)
- [`src/pages/platform/components/ActivityEvidenceWorkspace.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\ActivityEvidenceWorkspace.jsx)

**Issue & Remediation Plan:**
Inline table implementations with varying overflow wrappers and lack of sticky headers/columns.


---

## 4. Hardcoded Hex & RGB Literals per File
Files containing hardcoded color literals that must be mapped to semantic CSS tokens:
Total files affected: **73**

| File | Hex Literals | RGB(A) Literals | Sample Literals |
| :--- | :---: | :---: | :--- |
| [`src/pages/platform/SaaSDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\SaaSDashboard.jsx) | 1308 | 0 | `#00E676, #00C853, #10B981, #E8ECE8, #152B1D` |
| [`src/pages/platform/CarbonMonitoring.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonMonitoring.jsx) | 909 | 1 | `#00E676, #00C853, #78350F, #F59E0B, #84CC16` |
| [`src/pages/platform/CarbonRegistry.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx) | 290 | 0 | `#040906, #00C853, #152B1D, #08130C, #0D2B1A` |
| [`src/pages/platform/components/ActivityEvidenceWorkspace.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\ActivityEvidenceWorkspace.jsx) | 147 | 0 | `#E2E8F0, #08130C, #152B1D, #00C853, #0F2417` |
| [`src/components/ClientShowcase.jsx`](file:///C:\projects\CarbonOS\src\components\ClientShowcase.jsx) | 106 | 0 | `#dbf0ea, #15803d, #091A10, #06130B, #030805` |
| [`src/pages/platform/Impact.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\Impact.jsx) | 97 | 0 | `#080F0B, #0D2B1A, #00C853, #1E293B, #E2E8F0` |
| [`src/pages/platform/components/UniversalUtilityExtractor.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\UniversalUtilityExtractor.jsx) | 90 | 0 | `#E8ECE8, #0F2417, #08130C, #152B1D, #00C853` |
| [`src/pages/platform/components/EsgAuditModal.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\EsgAuditModal.jsx) | 84 | 0 | `#E2E8E3, #0F2417, #08130C, #152B1D, #E8ECE8` |
| [`src/components/PlatformModules.jsx`](file:///C:\projects\CarbonOS\src\components\PlatformModules.jsx) | 66 | 13 | `#040A06, #ffffff, #cbd5e1, #94a3b8, #475569` |
| [`src/pages/platform/components/EsgReportGenerator.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\EsgReportGenerator.jsx) | 78 | 0 | `#E2E8F0, #08130C, #152B1D, #00C853, #0F2417` |
| [`src/pages/platform/components/VerificationReadinessCenter.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\VerificationReadinessCenter.jsx) | 54 | 0 | `#E2E8E3, #08130C, #152B1D, #00C853, #040906` |
| [`src/components/marketplace/MarketplaceBrowse.jsx`](file:///C:\projects\CarbonOS\src\components\marketplace\MarketplaceBrowse.jsx) | 50 | 0 | `#f2f3ee, #181414, #040A06, #413f3f, #dbf0ea` |
| [`src/components/CorporateSaaSPipeline.jsx`](file:///C:\projects\CarbonOS\src\components\CorporateSaaSPipeline.jsx) | 40 | 9 | `#040A06, #080F0B, #10b981, #1A3A28, rgba(16, 185, 129, 0.15)` |
| [`src/components/payments/PurchaseConfirmModal.jsx`](file:///C:\projects\CarbonOS\src\components\payments\PurchaseConfirmModal.jsx) | 49 | 0 | `#dbf0ea, #080F0B, #f2f3ee, #0D2B1A, #181414` |
| [`src/components/Pricing.jsx`](file:///C:\projects\CarbonOS\src\components\Pricing.jsx) | 45 | 0 | `#040A06, #00C853, #00E676, #10B981, #08150D` |
| [`src/pages/platform/MRVDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\MRVDashboard.jsx) | 37 | 8 | `#040A06, #10b981, #f59e0b, #06b6d4, #3b82f6` |
| [`src/pages/farmers-ai/CameraCapture.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\CameraCapture.jsx) | 42 | 2 | `#CCFF00, #bce500, rgba(255,255,255,0.05)` |
| [`src/pages/farmers-ai/FarmersAILanding.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\FarmersAILanding.jsx) | 40 | 0 | `#CCFF00, #bce500, #0A1F13` |
| [`src/pages/farmers-ai/HarvestGuardDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\HarvestGuardDashboard.jsx) | 34 | 0 | `#CCFF00, #bce500` |
| [`src/pages/platform/components/ConglomerateTreeStudio.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\ConglomerateTreeStudio.jsx) | 31 | 0 | `#10b981, #06b6d4, #f59e0b, #a855f7, #100B1A` |
| [`src/pages/NotFound.jsx`](file:///C:\projects\CarbonOS\src\pages\NotFound.jsx) | 28 | 0 | `#f2f3ee, #181414, #dbf0ea, #166534, #4b5563` |
| [`src/pages/platform/components/DuckDBEngineView.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\DuckDBEngineView.jsx) | 28 | 0 | `#06140D, #0A2216, #1B4D2E, #8FA899, #040A06` |
| [`src/pages/Technology.jsx`](file:///C:\projects\CarbonOS\src\pages\Technology.jsx) | 25 | 0 | `#F8FAFC, #E2E8F0, #16A34A, #0F172A, #475569` |
| [`src/components/payments/PaymentStatusTracker.jsx`](file:///C:\projects\CarbonOS\src\components\payments\PaymentStatusTracker.jsx) | 24 | 0 | `#E2E8F0, #16A34A, #F8FAFC, #475569, #0F172A` |
| [`src/pages/platform/components/SatelliteMRVStudio.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\components\SatelliteMRVStudio.jsx) | 23 | 0 | `#06140D, #0A2216, #1B4D2E, #8FA899, #040A06` |
| [`src/components/technology/DeviceCard.jsx`](file:///C:\projects\CarbonOS\src\components\technology\DeviceCard.jsx) | 22 | 0 | `#16A34A, #F59E0B, #3B82F6, #475569, #E2E8F0` |
| [`src/components/technology/DeploymentTimeline.jsx`](file:///C:\projects\CarbonOS\src\components\technology\DeploymentTimeline.jsx) | 21 | 0 | `#E2E8F0, #16A34A, #0A5C36, #F59E0B, #3B82F6` |
| [`src/pages/farmers-ai/DiagnosisResult.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\DiagnosisResult.jsx) | 19 | 1 | `#CCFF00, #a0d000, rgba(239,68,68,0.35)` |
| [`src/pages/HowItWorks.jsx`](file:///C:\projects\CarbonOS\src\pages\HowItWorks.jsx) | 19 | 0 | `#040A06, #16A34A, #0D2B1A, #080F0B, #1A1A1A` |
| [`src/pages/farmers-ai/BatchRegistration.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\BatchRegistration.jsx) | 16 | 0 | `#CCFF00, #bce500` |
| *...and 43 additional files* | | | |

---

## 5. Spacing Rhythm & Viewport Height Violations
Identified **48** files utilizing excessive vertical spacing (`py-`, `pt-`, `pb-`, `my-` $\ge$ 16 / 4rem) or fixed `h-screen` / `min-h-screen`:

| File | $\ge$ 4rem Classes | `h-screen` / `min-h-screen` | Discovered Tokens |
| :--- | :---: | :---: | :--- |
| [`src/pages/Technology.jsx`](file:///C:\projects\CarbonOS\src\pages\Technology.jsx) | 8 | 0 | `pt-24, pb-16, py-20, py-24` |
| [`src/components/farmers-ai/WeatherRiskWidget.jsx`](file:///C:\projects\CarbonOS\src\components\farmers-ai\WeatherRiskWidget.jsx) | 5 | 2 | `py-20, pt-24, pb-16, min-h-screen` |
| [`src/pages/farmers-ai/HarvestGuardDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\HarvestGuardDashboard.jsx) | 4 | 2 | `pt-24, pb-16, min-h-screen` |
| [`src/pages/HowItWorks.jsx`](file:///C:\projects\CarbonOS\src\pages\HowItWorks.jsx) | 5 | 1 | `pt-20, pt-40, pb-20, py-24, min-h-screen` |
| [`src/pages/platform/Impact.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\Impact.jsx) | 5 | 1 | `pt-28, pb-24, pt-16, min-h-screen` |
| [`src/pages/farmers-ai/DiagnosisResult.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\DiagnosisResult.jsx) | 4 | 1 | `pt-24, pb-16, pb-20, min-h-screen` |
| [`src/pages/farmers-ai/FarmersAILanding.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\FarmersAILanding.jsx) | 3 | 1 | `pt-24, pb-24, py-16, min-h-screen` |
| [`src/pages/platform/SaaSDashboard.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\SaaSDashboard.jsx) | 3 | 1 | `pt-24, pt-28, pb-20, min-h-screen` |
| [`src/App.jsx`](file:///C:\projects\CarbonOS\src\App.jsx) | 2 | 1 | `pt-24, pb-16, min-h-screen` |
| [`src/components/farmers-ai/LocalRiskMap.jsx`](file:///C:\projects\CarbonOS\src\components\farmers-ai\LocalRiskMap.jsx) | 2 | 1 | `pt-24, pb-16, min-h-screen` |
| [`src/components/Hero.jsx`](file:///C:\projects\CarbonOS\src\components\Hero.jsx) | 3 | 0 | `pt-28, pt-32, pb-16` |
| [`src/components/marketplace/MarketplaceBrowse.jsx`](file:///C:\projects\CarbonOS\src\components\marketplace\MarketplaceBrowse.jsx) | 2 | 1 | `pt-28, pb-20, min-h-screen` |
| [`src/pages/company/About.jsx`](file:///C:\projects\CarbonOS\src\pages\company\About.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/company/APIDocs.jsx`](file:///C:\projects\CarbonOS\src\pages\company\APIDocs.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/company/Careers.jsx`](file:///C:\projects\CarbonOS\src\pages\company\Careers.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/company/FrameworkDocs.jsx`](file:///C:\projects\CarbonOS\src\pages\company\FrameworkDocs.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/company/Privacy.jsx`](file:///C:\projects\CarbonOS\src\pages\company\Privacy.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/company/Terms.jsx`](file:///C:\projects\CarbonOS\src\pages\company\Terms.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/farmers-ai/BatchRegistration.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\BatchRegistration.jsx) | 2 | 1 | `pt-24, pb-16, min-h-screen` |
| [`src/pages/farmers-ai/CameraCapture.jsx`](file:///C:\projects\CarbonOS\src\pages\farmers-ai\CameraCapture.jsx) | 2 | 1 | `pb-16, pt-24, min-h-screen` |
| [`src/pages/platform/AIDetection.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\AIDetection.jsx) | 3 | 0 | `pt-24, pb-16, py-16` |
| [`src/pages/platform/CarbonMonitoring.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonMonitoring.jsx) | 2 | 1 | `pt-28, pb-16, min-h-screen` |
| [`src/pages/platform/CarbonRegistry.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\CarbonRegistry.jsx) | 2 | 1 | `pt-24, pb-20, min-h-screen` |
| [`src/pages/platform/esg/EsgWorkspace.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\esg\EsgWorkspace.jsx) | 3 | 0 | `pb-16, pt-28, pt-32` |
| [`src/pages/platform/FarmerEarnings.jsx`](file:///C:\projects\CarbonOS\src\pages\platform\FarmerEarnings.jsx) | 2 | 1 | `pt-32, pb-16, min-h-screen` |
| *...and 23 additional files* | | | |

---

## 6. Summary of Action Items for Upcoming Phases
1. **Phase 1 (Architecture)**: Extract `CarbonMonitoring.jsx` (5,707 lines) and `SaaSDashboard.jsx` (4,967 lines) into feature slices. Unify `Card`, `Modal`, `StatCard`, and `DataTable`.
2. **Phase 2 (Design Tokens & Spacing)**: Eliminate 100+ hardcoded hex colors; replace unconstrained `py-24`/`py-32` with parent-controlled `--section-y: clamp(2.5rem, 5vw, 5rem)`.
3. **Phase 3 (Card Clipping)**: Address overflow-clipping and lack of `min-w-0` in cards across grid containers.
4. **Phase 4-5 (Navigation & Footer)**: Introduce config-driven `nav.config.js` and `footer.config.js` with responsive drawer/rail system.
