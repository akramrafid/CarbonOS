# CarbonOS Bangladesh — Product Specification

<!-- impeccable:product-schema 1 -->

## 1. Platform & Deployment Targets

* **Primary**: Modern Web Application (React 19 + Vite + Tailwind CSS).
* **Target Viewports**: 
  * High-density desktop & laptop screens (1440px to 2560px) in corporate headquarters, compliance departments, and audit offices.
  * Tablet devices (768px to 1024px) for plant walkthroughs and industrial floor audits.
  * Mobile devices (320px to 425px) for field agronomists, smallholder farmers, and mobile verification.
* **Browsers**: Chrome, Edge, Safari, Firefox (last 2 major versions).
* **Offline / Low-Connectivity Grace**: Fully functional local calculation engine, responsive caching, and deterministic offline RAG fallback.

---

## 2. Target Users & Personas

| Persona | Role | Key Goals | Primary Touchpoints |
|---|---|---|---|
| **Farhan Rahman** | Enterprise Sustainability Director (RMG & Textiles) | Comply with EU CBAM export mandates, prepare CSRD-compliant disclosures, automate factory utility bill carbon footprinting | `/platform/saas-dashboard` (Executive Overview, Scope 1-3 Engine, Materiality Matrix) |
| **Engr. Masud Alam** | Factory General Manager & Plant Engineer (Gazipur Plant) | Track real-time boiler gas consumption, captive diesel generator output, and live IoT telemetry to prevent environmental clearance violations | `/platform/saas-dashboard` (Utility Extractor, IoT Telemetry), `/carbon-monitoring` |
| **Dr. Nusrat Jahan** | Lead Third-Party ESG Auditor (ISO 14064 / GHG Protocol) | Verify corporate GHG disclosures against official Bangladesh DoE gazettes and inspect verbatim audit trails with zero mathematical ambiguity | `/platform/saas-dashboard` (Auditor View, Multi-Corpus RAG Copilot, Dual Scope 2 Review) |
| **Tanvir Ahmed** | Climate Project Developer (Clean Energy & Forestry) | Onboard renewable energy (Solar Irrigation) and mangrove blue carbon projects, register Article 6 credits, track secondary market retirements | `/platform/project-onboarding`, `/platform/mrv-dashboard`, `/platform/marketplace` |
| **Abul Kashem** | Smallholder Rice Farmer (Rangpur District) | Earn supplemental income from Alternate Wetting and Drying (AWD) rice cultivation and diagnose crop fungal diseases via mobile camera | `/farmers-ai` (HarvestGuard camera diagnosis, AWD credit earnings, bKash wallet) |

---

## 3. Product Purpose & Sovereign Mission

CarbonOS is Bangladesh's sovereign climate-tech operating system. It provides an auditable, end-to-end bridge connecting grassroots rural decarbonization projects (AWD rice methane reduction, solar irrigation pumps, clean cookstoves, blue carbon) with enterprise corporate carbon accounting and global carbon markets. 

By grounding all calculations in verified Bangladesh Department of Environment (DoE) emission factors and enabling multi-corpus RAG regulatory reasoning, CarbonOS eliminates greenwashing and equips Bangladeshi exporters to thrive under the European Union Carbon Border Adjustment Mechanism (EU CBAM) and global ESG disclosure regimes.

---

## 4. Positioning & Key Differentiators

Unlike generic Western carbon accounting platforms (e.g., Watershed, Persefoni) that apply broad global averages or lack localized South Asian grid coefficients, CarbonOS offers:

1. **Sovereign Regulatory Grounding**: Native incorporation of the Bangladesh Department of Environment & SREDA Grid Emission Factor Gazette (`0.550 kg CO₂e / kWh`), Environment Conservation Rules 2023 (ECR 2023 / S.R.O. 349), and Bangladesh Updated NDC 2021.
2. **Dual-Reporting Scope 2 Accounting**: Implements both Location-Based and Market-Based accounting methods side-by-side with contractual PPA adjustments and captive rooftop solar net-metering.
3. **Multi-Corpus Grounded RAG with Verbatim Citations**: A ChromaDB vector store that quotes exact gazette clauses, page numbers, and factory utility statement line-items.
4. **Live Industrial IoT Hardware Integration**: Direct WebSocket streaming from physical ESP8266/ESP32 sensor nodes connected to factory generators and boilers via Blynk Cloud.
5. **$0 Required Recurring API Cost**: Designed to operate with zero mandatory third-party software licensing fees, utilizing open-source vector search, local embeddings (`all-MiniLM-L6-v2`), and robust local deterministic synthesis fallback engines.

---

## 5. Functional Scope & Module Breakdown

### 5.1 Enterprise ESG SaaS Suite (`/platform/saas-dashboard`)
* **Executive Hero & Metric Badges**: High-contrast, floating action bar displaying gross organizational emissions, Scope breakdown, renewable share, and data verification status.
* **Scope 1 (Direct Emissions)**:
  * Stationary Combustion: Natural gas (Titas/Bakhrabad/KGDCL pipelines) with calorific values calibrated to Bangladesh supply (IPCC 2006 Factor: `56.1 t CO₂ / TJ`).
  * Captive Generation: Diesel generators (`2.68 kg CO₂e / L`) providing emergency power during grid shedding.
  * Mobile Fleet: Company-owned transport and logistics vans.
* **Scope 2 (Indirect Electricity Emissions - Dual Reporting)**:
  * **Location-Based Method**: Multiplies metered electricity consumption (kWh) by the Bangladesh national grid average factor (`0.550 kg CO₂e / kWh`).
  * **Market-Based Method**: Reflects contractual supplier-specific emission factors, Green Energy Tariffs (GET), and on-site rooftop solar net-metering deductions.
* **Scope 3 (Value Chain Emissions)**:
  * Upstream transportation & freight manifests.
  * Raw material processing (cotton fiber, yarn, chemicals).
  * Business travel and employee commuting.
* **Automated Document Footprint Extractor**: Drag-and-drop parsing zone for DESCO, DPDC, NESCO, and Titas Gas utility statements with automated OCR, figure extraction, and confidence scoring.
* **Double Materiality Matrix**: 9-theme interactive quadrant assessing Financial Impact vs. ESG Materiality (Water Stewardship, Factory Heat Stress, Microplastic Effluents, Living Wage).
* **Auditor View**: Toggleable compliance view locking metrics, displaying verification seals, and exposing raw JSON export payloads for third-party certifiers.

### 5.2 Multi-Corpus RAG & Regulatory Copilot (`inference/esg_rag`)
* **Corpus Partitioning**:
  * `regulatory`: Bangladesh Updated NDC (2021), Environment Conservation Rules 2023 (S.R.O. 349).
  * `emission_factors`: DoE 2023 Gazette (Ref: 22.02.0000.018.99.001.23) and IPCC Guidelines for National Greenhouse Gas Inventories.
  * `tenant_docs`: Scoped factory utility statements, fuel delivery receipts, and previous year audit statements.
* **Auditability Contract**: All outputs must return:
  1. `answer`: Grounded synthesis.
  2. `citations`: List containing `document_title`, `page_number`, `verbatim_snippet`, and `relevance_score`.
  3. `confidence`: Numerical score (0.0 to 1.0). If confidence falls below 0.60, the engine issues a structured data-insufficiency disclaimer.

### 5.3 National Carbon Registry & Marketplace (`/platform/carbon-registry`, `/platform/marketplace`)
* **Article 6 Compatibility**: Supports bilateral ITMO transfers under Article 6.2 and centralized mechanism credits under Article 6.4.
* **Credit Lifecycle**: Project Submission → Third-Party Validation → Baseline Measurement → Credit Issuance → Marketplace Listing → Immutable Retirement.
* **Serial Number Syntax**: `BD-DOE-{SECTOR}-{YEAR}-{PROJECT_ID}-{SERIAL_RANGE}` (e.g., `BD-DOE-AWD-2026-084-0001-5000`).

### 5.4 Satellite MRV Engine (`/platform/mrv-dashboard`)
* **Copernicus Sentinel-2 Ingestion**: Multi-spectral imagery analysis across Band 4 (Red) and Band 8 (Near-Infrared).
* **NDVI Calculation**: $(B8 - B4) / (B8 + B4)$ normalized index tracking vegetation density and agroforestry biomass.
* **Biomass Density**: Aboveground Biomass (AGB) tons per hectare computed via Random Forest regression model.

### 5.5 Live IoT Telemetry Node (`/carbon-monitoring`)
* **Sensor Polling**: 5-second polling interval against Blynk Cloud REST API.
* **Telemetry Pins**:
  * `V0`: Temperature (°C) — industrial boiler exhaust monitoring.
  * `V1`: Relative Humidity (%) — factory floor ambient conditions.
  * `V2`: Air Quality Index / Gas Concentration (ppm) — MQ-135 sensor detecting carbon monoxide and hydrocarbons.
  * `V3`: Calculated real-time CO₂ emission rate (kg/hr).

### 5.6 HarvestGuard & Farmers AI (`/farmers-ai`)
* **PyTorch CNN Backbone**: EfficientNet-B3 multi-head convolutional neural network trained on South Asian crop pathology datasets.
* **Disease Classes**: 41 classes spanning Rice, Potato, Tomato, Maize, Mango, Jackfruit, Guava, and Citrus.
* **Grad-CAM Visualization**: Class Activation Maps generated from the final convolutional layer highlighting visual evidence of disease lesions.
* **Alternate Wetting & Drying (AWD) Ledger**: Logs drying days, computes avoided methane ($\text{CH}_4$) emissions using IPCC GWP-28 multipliers, and calculates farmer carbon dividend payouts.

---

## 6. Design System & Master Token Contract

### 6.1 Dual Theme Specifications

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ Obsidian Dark Mode (Primary Tech Climate-Tech Vibe)                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Canvas Background:  #040906  (Deep Obsidian Charcoal)                        ║
║ Card Container:     #08130C  (Card base) / #0D1C13 (Elevated card)           ║
║ Container Border:   #152B1D  (Muted emerald-tinted border)                   ║
║ Primary Brand:      #00C853  (High-voltage emerald green)                    ║
║ Secondary Signal:   #4ADE80  (Luminous mint signal)                          ║
║ Warning / Accent:   #F59E0B  (Amber) / #EF4444 (Rose Red)                    ║
║ Primary Text:       #FFFFFF  (Pure White)                                    ║
║ Muted Text:         #94A3B8  (Slate 400)                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════╗
║ Light Theme UI (Clean, Functional, Implementation-Oriented Foundations)      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Canvas (color.surface.muted):   #f2f3ee  (Warm Linen Base Canvas)            ║
║ Containers (color.surface.strong): #dbf0ea (Mint Strong Surface / Highlight) ║
║ Base Surface (color.surface.base): #000000 / #ffffff (Crisp Card Background) ║
║ Primary Text (color.text.primary): #413f3f  (Charcoal Slate Primary Text)    ║
║ Inverse Text (color.text.inverse): #181414  (Deep Black Headings & Metrics)  ║
║ Tertiary Text (color.text.tertiary): #ffffff (White Button & Badge Text)     ║
║ Primary CTA (color.primary):    #15803d  (Forest Emerald Interactive Action) ║
║ Typography Stack: Helvetica, Arial, sans-serif (16px base, 22.4px line-height)║
║ Spacing Scale: 3px, 6px, 7px, 8px, 12px, 24px, 28px, 32px                   ║
║ Radii: xs=8px, sm=13px, md=16px, lg=100px (Full Pill)                       ║
║ Shadow Token: shadow.1 (0px 10px 26px rgba(4, 18, 38, 0.24))                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 6.2 Typography & Spacing Scale
* **Light Mode Primary Font**: Helvetica, Arial, sans-serif (`font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=22.4px`).
* **Scale**: `xs=16px`, `sm=20px`, `md=40px`, `lg=46px`, `xl=56px`.
* **Dark Mode Primary Font**: Instrument Sans, sans-serif.
* **Metrics & Mono**: JetBrains Mono, monospace for numbers, serial keys, and emission factors.
* **Layout Geometry**: Spacing scale (`space.1=3px` to `space.8=32px`), radii (`radius.xs=8px`, `radius.sm=13px`, `radius.md=16px`, `radius.lg=100px`).
* **Shadow Token**: `shadow.1` (`rgba(4, 18, 38, 0.24) 0px 10px 26px 0px`).

---

## 7. Regulatory Grounding & Verification Evidence

| Regulation / Gazette | Official Reference | Key Parameters Ingested |
|---|---|---|
| **Bangladesh DoE Grid Emission Factor** | Ref: `22.02.0000.018.99.001.23` (DoE & SREDA Gazette 2023) | **0.550 kg CO₂e / kWh** (Combined Margin Grid Emission Factor) |
| **Bangladesh Updated NDC 2021** | Ministry of Environment, Forest and Climate Change (MoEFCC) | Unconditional: 6.73% GHG reduction; Conditional: 15.12% reduction by 2030 |
| **Environment Conservation Rules 2023** | S.R.O. No. 349-Law/2023 (ECR 2023) | Industrial red/orange category environmental clearance thresholds & air quality standards |
| **EU CBAM Regulation** | Regulation (EU) 2023/956 | Scope 1 & embedded Scope 2 reporting requirements for industrial goods exported to the EU |
| **IPCC Sixth Assessment Report (AR6)** | IPCC Working Group I Technical Summary | Methane ($\text{CH}_4$) 100-year GWP = **27.9**; Nitrous Oxide ($\text{N}_2\text{O}$) GWP = **273** |
| **Factory Benchmark Statement** | Dexterity Textiles Ltd Q2 2026 Audit (DEPZ TX-8491) | 482.4 t CO₂e audited quarterly baseline |

---

## 8. Non-Functional & Security Requirements

1. **Strict Multi-Tenant Document Isolation**: Corporate utility bills and proprietary audit data stored in ChromaDB vector indices must be strictly tagged by `tenant_id`. Queries must enforce `where={"tenant_id": current_tenant}` filter to prevent cross-tenant vector leakage.
2. **Audit Logging**: Every RAG query, calculation adjustment, and credit retirement must write an append-only row to `esg_query_logs` or `registry_events` with timestamp, client IP, user ID, and latency.
3. **Response Latency Budgets**:
   * Vector chunk retrieval: P95 < 250ms.
   * Full RAG answer synthesis: P95 < 1.8s.
   * IoT telemetry polling: 5-second cadence.
4. **WCAG Accessibility**: 100% keyboard navigable, clear focus outlines (`focus-visible:ring-2`), and high-contrast color pairs exceeding 4.5:1 for body text and 3:1 for large headers.
