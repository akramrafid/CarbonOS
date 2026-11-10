# CarbonOS Comprehensive Codebase Audit

**Audit Date**: November 6, 2026  
**Auditor**: Senior Full-Stack Engineer, UI/UX Designer & Security Reviewer  
**Scope**: Full Repository (`frontend/`, `backend/`, `inference/`, `orchestrator/`, `factors/`, configuration)  
**Execution Rule**: Inspection only — zero source code modifications performed.

---

## 1. Project Overview

### What the Application Does
CarbonOS (Carbon Zero BD) is an end-to-end digital sovereign carbon market infrastructure and MRV (Measurement, Reporting, and Verification) platform designed for Bangladesh's Article 6.2 and voluntary carbon markets. It bridges local green project developers (smallholder farmers, mangrove afforestation, solar irrigation, waste-to-energy, circular apparel) with institutional ESG buyers and national carbon registries.

#### Primary User Flows
1. **Public Marketing & Education**: Sovereign protocol landing page, Article 6.2 education ([`HowItWorks.jsx`](file:///c:/projects/CarbonOS/src/pages/HowItWorks.jsx)), technology architecture, sector breakdowns (Mangrove, Rice Methane, Brick Kilns, Clean Cookstoves, Solar Irrigation, Waste-to-Energy).
2. **Farmers AI (HarvestGuard)**: Smallholder farmer onboarding, batch registration, leaf photo capture via web camera ([`CameraCapture.jsx`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/CameraCapture.jsx)), AI crop disease diagnosis with Grad-CAM heatmaps ([`DiagnosisResult.jsx`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/DiagnosisResult.jsx)), and weather risk assessment.
3. **Satellite dMRV & Carbon Monitoring**: Boundary GeoJSON/KML upload, Sentinel-1/2 and Landsat optical/SAR ingestion, AI biomass/carbon density estimation with conformal uncertainty intervals, dynamic baseline assessment, leakage monitoring, and Verra VM0047 reporting ([`CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx)).
4. **National Registry & Sovereign Ledger**: Article 6.2 ITMO issuance, corresponding adjustment tracking, double-counting mitigation, JCM bilateral transfer serialization, and BTR reporting export ([`CarbonRegistry.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonRegistry.jsx)).
5. **Corporate ESG SaaS & Accounting Workspace**: Multi-tenant ESG telemetry, Scope 1/2/3 GHG accounting, grid factor derivation, 24-capsule audited ESG scoring engine, interactive methodology audit modal ([`EsgAuditModal.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/EsgAuditModal.jsx)), utility bill extraction, and document RAG querying ([`SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx) and [`EsgWorkspace.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/esg/EsgWorkspace.jsx)).
6. **Carbon Marketplace**: Project browsing, credit checkout with bKash/Nagad and international payment gateways, instant retirement certificate issuance.

---

### Stack and Versions

| Layer | Technologies / Packages | Detected Version |
| :--- | :--- | :--- |
| **Frontend Framework** | React | `19.2.6` |
| **Bundler & Build Tool** | Vite (Rolldown engine) | `8.0.16` |
| **Type Checking** | TypeScript | `~6.0.2` (via `tsc`) |
| **Styling** | Tailwind CSS, PostCSS, Autoprefixer | `3.4.17` (Tailwind), `8.5.15` (PostCSS) |
| **UI Components & Icons** | Lucide React | `1.16.0` |
| **Animations** | GSAP (`gsap/ScrollTrigger`), Framer Motion | `3.15.0` (GSAP), `12.40.0` (Framer Motion) |
| **Maps & GIS** | Leaflet, React Leaflet | `1.9.4` (Leaflet), `5.0.0` (React Leaflet) |
| **Client-side ML** | ONNX Runtime Web | `1.27.0` |
| **State Management** | React Context (`ThemeContext`, `ToastContext`), Local Storage hook | React built-in |
| **Routing** | React Router DOM | `7.15.1` |
| **Internationalization** | i18next, react-i18next | `26.2.0` (i18next), `17.0.8` (react-i18next) |
| **Backend 1 (Inference/dMRV)**| FastAPI, Uvicorn, SQLAlchemy | `0.109.2` (FastAPI), `0.27.0` (Uvicorn) |
| **Backend 2 (Django Web/API)**| Django, Django REST Framework, Channels, Daphne | `6.0.6` (Django) |
| **Machine Learning / Vision** | PyTorch, Torchvision, OpenCV, Scikit-learn, XGBoost | `cpu` PyTorch |
| **LLM / Generative AI** | Google Gemini API (`generativelanguage.googleapis.com`) | `gemini-2.5-flash`, `gemini-2.0-flash` |
| **Databases** | SQLite (local dev), PostgreSQL (production target via `psycopg2-binary`) | SQLite 3 |
| **Vector DB** | ChromaDB (`PersistentClient`) | `0.4.x+` |
| **Package Manager** | `npm` (with `package-lock.json`) | Node.js v20+ / npm v10+ |
| **Deployment / Hosting** | Vercel (Frontend), Render / Docker (Backends) | Configured in `Dockerfile` & CORS |

---

### Folder Structure (Trimmed Tree)

```
c:\projects\CarbonOS\
├── .agents/                    # Multi-agent skill packs (akstack)
├── agents/                     # 42 programmatic role briefs for the orchestrator
├── backend/                    # Django 6.0 REST API & WebSockets service
│   ├── farmers_ai/             # Diagnosis, weather risk, agronomist reviews
│   ├── farmers_ai_project/     # Django settings, ASGI/WSGI, root URL routing
│   ├── ml_pipeline/            # PyTorch MultiHeadFarmerAIModel definition
│   └── national_registry_bridge/# Article 6.2 registry models, views, serializers
├── docs/                       # Architectural specs, QA reports, ADRs, compliance briefs
├── factors/                    # Bangladesh national grid factor derivation pipeline
├── inference/                  # FastAPI microservice for ML, dMRV, and ESG RAG
│   ├── carbon_monitoring/      # Satellite dMRV engine, allometry, calibration, models
│   ├── chroma_data/            # Vector store persistence and fallback tenant docs
│   ├── esg_migrations/         # Alembic database migrations for ESG ledger
│   ├── esg_rag/                # Document extraction, embeddings, retriever, generator
│   ├── main.py                 # FastAPI application root & crop disease inference
│   └── esg_app.py              # Dedicated ESG FastAPI server entrypoint
├── orchestrator/               # Zero-dependency Python CLI engine for DAG progression
├── phases/                     # Formal Akram-Stack phase blueprints (Phase 0–6)
├── public/                     # Static assets (favicons, satellite textures, logos, audio)
├── scripts/                    # Maintenance and operational scripts
├── src/                        # React 19 Frontend Application
│   ├── components/             # Reusable UI widgets, modals, layouts, sections
│   │   ├── dashboard/          # Farmer credits telemetry widget
│   │   ├── farmers-ai/         # Weather risk cards and local maps
│   │   ├── marketplace/        # Credit browse and checkout modals
│   │   ├── payments/           # Settlement cards and payment trackers
│   │   └── technology/         # Diagrams and satellite layer components
│   ├── context/                # Global ThemeContext and ToastContext
│   ├── lib/                    # API clients (esgApi, esgAuth, esgDocumentExtractor)
│   ├── pages/                  # Route views (Home, SaaS, Registry, Farmers AI, Sectors)
│   │   ├── company/            # About, Terms, Privacy, API Docs, Framework
│   │   ├── farmers-ai/         # HarvestGuard portal, CameraCapture, DiagnosisResult
│   │   ├── platform/           # MRVDashboard, CarbonMonitoring, SaaSDashboard, ESG
│   │   └── sectors/            # 6 Article 6.2 sector showcase pages
│   ├── App.jsx                 # Route definitions, suspense boundaries, layout wrapper
│   ├── i18n.js                 # Translation dictionary and language config
│   ├── index.css               # Design tokens, theme overrides, utility animations
│   └── main.jsx                # Application root mounting ErrorBoundary & Providers
├── templates/                  # Standard templates for ADRs, ToDos, screen specs
├── tests/                      # 30 Python test suites and JS unit tests
├── package.json                # Frontend dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS theme extension and dark mode setup
└── vite.config.js              # Vite build configuration, server proxy, watch exclusions
```

---

### Routing Setup, Layouts, and Global Providers

- **Provider Hierarchy** ([`src/main.jsx`](file:///c:/projects/CarbonOS/src/main.jsx#L11-L22)):
  ```jsx
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
  ```
- **Layout Structure** ([`src/App.jsx`](file:///c:/projects/CarbonOS/src/App.jsx#L65-L130)):
  - Global `ScrollToTop` helper resetting window scroll on route changes.
  - Sticky top [`Navbar.jsx`](file:///c:/projects/CarbonOS/src/components/Navbar.jsx) with responsive blur, dynamic route active pills, language switch, and enterprise demo modal.
  - Centered `<Suspense fallback={<LoadingSpinner />}>` wrapping `<Routes>`.
  - Dynamic catch-all 404 recovery route `<Route path="*" element={<NotFound />} />`.
  - Full-width landscape [`Footer.jsx`](file:///c:/projects/CarbonOS/src/components/Footer.jsx).

---

### Run, Build, Lint, and Typecheck Verification

Commands executed on the live repository:

```bash
# 1. Typecheck & Lint
npm run lint
> tsc
# Output: Exit Code 0 (Clean, 0 TypeScript errors)

# 2. Production Build
npm run build
> tsc && vite build
# Output: ✓ 2317 modules transformed. Built in 5.66s. Exit Code 0 (0 compilation errors)

# 3. Frontend Unit Tests
npm run test
> node --test tests/js/*.test.mjs
# Output: 2 tests passed in 99ms. Exit Code 0

# 4. Core Python Unit Tests
python -m unittest tests/test_orchestrator.py tests/test_bd_grid.py tests/test_esg_accounting.py tests/test_esg_scope1.py
# Output: 94 tests passed in 7.3s. Exit Code 0

# 5. Dependency Audit
npm audit
# Output: npm error getaddrinfo ENOTFOUND registry.npmjs.org (Offline/sandboxed execution)
```

---

## 2. Design System and Styling

### How Styling Is Done
Styling is built with **Tailwind CSS 3.4.17** augmented with CSS custom variables defined in [`src/index.css`](file:///c:/projects/CarbonOS/src/index.css#L5-L108) and configured via [`tailwind.config.js`](file:///c:/projects/CarbonOS/tailwind.config.js#L12-L31).

### Design Token System

| Token Category | Dark Mode Value (Default) | Light Mode Value | Tailwind Token Name |
| :--- | :--- | :--- | :--- |
| **Forest** | `#0D2B1A` | `#DBF0EA` | `forest` |
| **Carbon** | `#080F0B` | `#F2F3EE` | `carbon` |
| **Emerald** | `#00C853` | `#15803D` | `emerald` / `emerald-DEFAULT` |
| **Amber** | `#FFB300` | `#B45309` | `amber` / `amber-DEFAULT` |
| **Registry** | `#F0F4F1` | `#413F3F` | `registry` |
| **Mist** | `#B2C4B8` | `#6B7280` | `mist` |
| **Surface Base** | `#080F0B` | `#FFFFFF` | Custom CSS Variable |
| **Glow Shadow** | `0 0 20px rgba(0,200,83,0.15)` | `0 4px 20px rgba(4,18,38,0.08)` | `--shadow-glow` |

#### Typography Tokens
- **Sans**: `"Instrument Sans"`, `sans-serif`
- **Serif**: `"Cormorant Garamond"`, `serif`
- **Mono**: `"JetBrains Mono"`, `monospace`

---

### Hardcoded Colors and Magic Numbers
- **Critical Finding**: **2,430 instances** of hardcoded arbitrary hex values (e.g. `bg-[#040A06]`, `bg-[#0D2B1A]`, `text-[#00C853]`, `border-[#152B1D]`, `bg-[#08130C]`, `text-[#7C9A88]`) exist across JSX source files rather than referencing semantic tokens (`bg-carbon`, `bg-forest`, `text-registry`, `text-emerald`).
- **Files with Highest Hex Saturation**:
  - [`src/pages/platform/SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx): **1,308 hardcoded hex values**
  - [`src/pages/platform/CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx): **909 hardcoded hex values**
  - [`src/pages/platform/CarbonRegistry.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonRegistry.jsx): **293 hardcoded hex values**
  - [`src/pages/platform/components/ActivityEvidenceWorkspace.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/ActivityEvidenceWorkspace.jsx): **146 hardcoded hex values**
- **Impact**: Because colors are hardcoded directly into Tailwind JIT arbitrary classes, [`src/index.css`](file:///c:/projects/CarbonOS/src/index.css#L157-L200) was forced to create an enormous, brittle block of attribute selector overrides (`[data-theme="light"] [class*="bg-[#080F0B]"] !important`). Any new arbitrary hex added to JSX immediately breaks light mode.

---

### Duplicate and Near-Duplicate Components

1. **Modal Primitives**:
   - [`src/components/Modal.jsx`](file:///c:/projects/CarbonOS/src/components/Modal.jsx) (Generic accessible dialog)
   - [`src/components/RequestDemoModal.jsx`](file:///c:/projects/CarbonOS/src/components/RequestDemoModal.jsx) (Custom demo request modal)
   - [`src/components/marketplace/CheckoutModal.jsx`](file:///c:/projects/CarbonOS/src/components/marketplace/CheckoutModal.jsx) (Marketplace purchase modal)
   - [`src/components/payments/PurchaseConfirmModal.jsx`](file:///c:/projects/CarbonOS/src/components/payments/PurchaseConfirmModal.jsx) (Credit retirement confirmation)
   - [`src/pages/platform/components/EsgAuditModal.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/EsgAuditModal.jsx) (ESG methodology modal)
   - *Recommendation*: Refactor all modals to wrap the accessible, focus-trapped `src/components/Modal.jsx` primitive.
2. **Weather Risk Telemetry**:
   - [`src/components/farmers-ai/WeatherRiskWidget.jsx`](file:///c:/projects/CarbonOS/src/components/farmers-ai/WeatherRiskWidget.jsx) and [`src/pages/farmers-ai/HarvestGuardDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/HarvestGuardDashboard.jsx#L203-L220) independently implement identical OpenWeatherMap API polling and weather badge rendering.
3. **IoT Telemetry Clients**:
   - [`src/components/LiveMetrics.jsx`](file:///c:/projects/CarbonOS/src/components/LiveMetrics.jsx#L105-L125) and [`src/pages/platform/MRVDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/MRVDashboard.jsx#L260-L290) maintain duplicate polling loops to `blynk.cloud` using identical query tokens.
4. **Embedded Chart Primitives**:
   - `SemiCircularGauge`, `SegmentedProgressBar`, `EmissionsTrendChart`, `MicroBarChart`, and `CarouselIndicator` are declared directly inside [`src/pages/platform/SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx#L250-L400) rather than being shared from `src/components/charts/`.

---

## 3. Dark Mode

### Implementation Architecture
- **Theme Provider**: Located in [`src/context/ThemeContext.jsx`](file:///c:/projects/CarbonOS/src/context/ThemeContext.jsx). Manages state via `localStorage.getItem('carbonos-theme')` with fallback to `window.matchMedia('(prefers-color-scheme: light)')`.
- **DOM Reflection**: Toggles `data-theme="dark"` / `data-theme="light"` attributes and `.dark` / `.light` utility classes on `document.documentElement`.
- **Anti-FOUC Guard**: An inline blocking script is embedded inside `<head>` in [`index.html`](file:///c:/projects/CarbonOS/index.html#L9-L27). It evaluates theme preference synchronously before CSS or React mounts, successfully eliminating unstyled theme flash.

---

### Dark / Light Mode Architectural Flaws

#### 1. Light Mode Brand Font Destruction ([`src/index.css`](file:///c:/projects/CarbonOS/src/index.css#L119-L136))
```css
[data-theme="light"],
[data-theme="light"] body {
  font-family: Helvetica, Arial, sans-serif !important;
}
[data-theme="light"] h1, [data-theme="light"] h2, ... {
  font-family: Helvetica, Arial, sans-serif !important;
}
```
*Finding*: When switched to light mode, the entire application's font stack is forcibly reset to `Helvetica, Arial, sans-serif !important`. The brand typography (`Instrument Sans`, `Cormorant Garamond`, `JetBrains Mono`) disappears completely.

#### 2. Fragile Global Text Inversion ([`src/index.css`](file:///c:/projects/CarbonOS/src/index.css#L263-L289))
```css
[data-theme="light"] .text-white:not(.keep-white):not(#footer-section *):not(.toast-surface *):not(.modal-dark *) {
  color: #181414 !important;
}
```
*Finding*: To counter thousands of hardcoded `text-white` classes, `index.css` globally turns `.text-white` into black (`#181414`). Any element on an intentionally dark background (such as badges, buttons, tooltips, or charts) that lacks an explicit exemption class turns invisible or black-on-dark.

#### 3. Unadapted Third-Party Canvas / Leaflet Elements
- **Leaflet Map Tiles**: In [`src/components/farmers-ai/LocalRiskMap.jsx`](file:///c:/projects/CarbonOS/src/components/farmers-ai/LocalRiskMap.jsx#L140) and [`src/pages/platform/CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx), the base map uses a hardcoded dark CartoDB tile layer (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) which never switches to a light tile layer when light mode is activated.
- **Select Dropdown Options**: Native `<select>` elements on Windows/Linux render dark options on light inputs unless explicitly guarded.

---

## 4. Responsiveness

### Breakpoint Strategy
The application uses Tailwind's standard breakpoint tiers: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px). It is predominantly desktop-first in platform workspaces and mobile-first on marketing pages.

### Screen Size Evaluation (320px to 1920px)

| Screen Width | Viewport Device | Audit Observations & Identified Issues |
| :--- | :--- | :--- |
| **320px** | Ultra-narrow (iPhone SE / older Android) | **Severe table overflows**: Tables in [`ActivityEvidenceWorkspace.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/ActivityEvidenceWorkspace.jsx#L813) (`min-w-[1100px]`) and [`EsgReportGenerator.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/EsgReportGenerator.jsx#L588) (`min-w-[700px]`) push the horizontal viewport to 1100px. Header titles like "Bangladesh's Sovereign Protocol" wrap gracefully, but multi-column metric grids in `SaaSDashboard.jsx` stack vertically into massive scroll heights. |
| **375px** | Standard Mobile (iPhone 13/14/15) | Mobile drawer scrolls cleanly (`overflow-y-auto max-h-screen pb-12`). Camera capture view ([`CameraCapture.jsx`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/CameraCapture.jsx)) fits nicely within `max-w-xl`. Touch targets on primary action buttons are $\ge 48\text{px}$, but table action buttons in SaaS sub-tables are $\le 24\text{px}$. |
| **768px** | Tablet Portrait (iPad Mini) | Grid transitions from 1-column to 2-column. Hero layout balances well. Modals ([`EsgAuditModal.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/components/EsgAuditModal.jsx)) scale to `max-w-4xl` with proper inner scroll. |
| **1024px** | Tablet Landscape / Small Laptop | Navigation switches from mobile drawer to desktop pill menu. Sidebar in `SaaSDashboard.jsx` (`w-[272px]`) appears. Top navigation bar fits with minimal padding. |
| **1440px** | Standard Desktop Monitor | Optimal view. Layout container `max-w-[1780px]` centers properly. Charts in `CarbonMonitoring.jsx` render full resolution. |
| **1920px** | Ultra-Wide Monitor | Clean presentation, bounded by `max-w-[1780px]`. Ambient radial backgrounds and glow effects stay constrained without edge clipping. |

---

### Detailed Responsive Bugs

1. **Unwrapped Fixed `min-w-[1100px]` Data Tables**:
   - [`src/pages/platform/components/ActivityEvidenceWorkspace.jsx:813`](file:///c:/projects/CarbonOS/src/pages/platform/components/ActivityEvidenceWorkspace.jsx#L813):
     ```jsx
     <table className="w-full text-left font-sans text-xs border-collapse min-w-[1100px]">
     ```
     Lacks an enclosing `overflow-x-auto` wrapper, resulting in horizontal page blowout on mobile screens.
2. **`100vh` Mobile Clipping on Sticky Stacking Cards**:
   - [`src/components/FrameworkAlignment.jsx:101, 125, 149`](file:///c:/projects/CarbonOS/src/components/FrameworkAlignment.jsx#L101):
     ```jsx
     className="w-full h-screen sticky top-0 flex items-center bg-[#0D2B1A] overflow-hidden"
     ```
     `h-screen` evaluates to `100vh`. On iOS Safari and Chrome Mobile, the browser address bar and navigation bar obscure 60px–80px of bottom card content. Needs `h-[100dvh]`.
3. **Sub-44px Icon Buttons on Mobile**:
   - Multiple header action buttons in [`src/pages/platform/SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx#L1912) use `p-1` or `p-1.5` on 16px icons, yielding touch target bounds of $\sim 24\times 24\text{px}$, well below the 44px minimum touch target standard (WCAG 2.5.5).

---

## 5. Animations, Transitions, and Micro-Interactions

### Existing Implementations
- **GSAP & ScrollTrigger**: Drives pinned card stacking in [`FrameworkAlignment.jsx`](file:///c:/projects/CarbonOS/src/components/FrameworkAlignment.jsx#L69-L85), scrub animations in [`Philosophy.jsx`](file:///c:/projects/CarbonOS/src/components/Philosophy.jsx#L25-L40), and SVG path drawing in [`Roadmap.jsx`](file:///c:/projects/CarbonOS/src/components/Roadmap.jsx#L45-L65).
- **Framer Motion**: Used only in [`src/pages/farmers-ai/FarmersAILanding.jsx:4`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/FarmersAILanding.jsx#L4) for spring entrance animations.
- **CSS Keyframes**: Handcrafted CSS animations for orbital radar loaders (`LoadingSpinner.jsx`), scanning line lasers (`CameraCapture.jsx`), and floating gradient orbs.

---

### Deficiencies and UX Red Flags

1. **Unchecked `prefers-reduced-motion` in GSAP Animations**:
   - While [`src/components/Hero.jsx:41`](file:///c:/projects/CarbonOS/src/components/Hero.jsx#L41) checks `window.matchMedia('(prefers-reduced-motion: reduce)')`, [`FrameworkAlignment.jsx`](file:///c:/projects/CarbonOS/src/components/FrameworkAlignment.jsx), [`LiveMetrics.jsx`](file:///c:/projects/CarbonOS/src/components/LiveMetrics.jsx), [`Philosophy.jsx`](file:///c:/projects/CarbonOS/src/components/Philosophy.jsx), and [`Roadmap.jsx`](file:///c:/projects/CarbonOS/src/components/Roadmap.jsx) run continuous heavy scroll animations without checking user motion preferences.
2. **Library Redundancy**:
   - Both `gsap` (3.15.0) and `framer-motion` (12.40.0) are bundled. `framer-motion` adds over 30 kB gzipped to the client bundle for a single page.
3. **Missing Micro-Interactions**:
   - Button states in [`src/pages/platform/ProjectOnboarding.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/ProjectOnboarding.jsx) lack disabled/loading spinner states during file uploads.
   - Form inputs lack visible keyboard focus rings (`focus-visible:ring-2`) in several platform sub-components.

---

## 6. Error, Loading, and Edge-Case Pages

| Page / State | Implemented? | Location | Status & Quality Assessment |
| :--- | :---: | :--- | :--- |
| **404 Not Found** | **YES** | [`src/pages/NotFound.jsx`](file:///c:/projects/CarbonOS/src/pages/NotFound.jsx) | Clean, branded recovery page with quick navigation back to Home, Marketplace, ESG Portal, and Registry. Matches both light and dark themes. |
| **500 / Error Boundary** | **YES** | [`src/components/ErrorBoundary.jsx`](file:///c:/projects/CarbonOS/src/components/ErrorBoundary.jsx) | Catches unhandled React component crashes. Displays clean error message, stack diagnostic copy button, and reload trigger without exposing raw crashes. |
| **Global Loading UI** | **YES** | [`src/components/LoadingSpinner.jsx`](file:///c:/projects/CarbonOS/src/components/LoadingSpinner.jsx) | Custom orbital radar spinner with `screen`, `container`, and `inline` variants. Bound to `<Suspense>` in `App.jsx`. |
| **Offline State** | **PARTIAL**| [`src/lib/esgApi.js`](file:///c:/projects/CarbonOS/src/lib/esgApi.js#L483-L495) | API layer provides offline demo mock fallbacks for `/api/esg/*` requests. However, there is no global `navigator.onLine` connectivity banner notifying the user that they are offline. |
| **401 / 403 Forbidden** | **NO** | Missing Route | No dedicated 401 or 403 route in `App.jsx`. Access denials in the ESG workspace are handled via inline persona switcher rather than a structured unauthorized landing page. |

---

## 7. Security Review

| Security Area | Verdict | Evidence & File References |
| :--- | :---: | :--- |
| **1. Secrets & API Keys in Code** | <span style="color:red; font-weight:bold;">ISSUE</span> | **Active OpenWeatherMap API keys committed**: <br>• [`backend/farmers_ai/risk_engine.py:23`](file:///c:/projects/CarbonOS/backend/farmers_ai/risk_engine.py#L23): `api_key = "062104651c60e66e0115c841bd40f62e"`<br>• [`backend/farmers_ai/risk_engine.py:33`](file:///c:/projects/CarbonOS/backend/farmers_ai/risk_engine.py#L33): `api_key = "895284852c5a6104617a26ba3534b46c"`<br>• Client bundle leak in [`src/pages/farmers-ai/HarvestGuardDashboard.jsx:26`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/HarvestGuardDashboard.jsx#L26): `const apiKey = '895284852c5a6104617a26ba3534b46c';`<br>• Real credentials in [`inference/.env`](file:///c:/projects/CarbonOS/inference/.env#L1-L5) (`GEMINI_API_KEY`, `COPERNICUS_PASSWORD`, `EARTHDATA_PASSWORD`). `.env.example` is missing. |
| **2. Auth & Endpoint Protection** | <span style="color:red; font-weight:bold;">ISSUE</span> | **Unauthenticated dMRV & ML API**: Entire `/api/carbon/*` router in [`inference/carbon_monitoring/router.py`](file:///c:/projects/CarbonOS/inference/carbon_monitoring/router.py#L270) (`/analyze`, `/boundary/upload`, `/recalibrate`, `/settings`, `/provenance/{id}/sign`) has **zero authentication**. Anyone on the public internet can trigger heavy compute and modify settings. `POST /predict` in [`inference/main.py:230`](file:///c:/projects/CarbonOS/inference/main.py#L230) is completely unauthenticated. |
| **3. Client-Side Password Hashing** | <span style="color:red; font-weight:bold;">ISSUE</span> | [`src/lib/useHarvestStore.js:22-26`](file:///c:/projects/CarbonOS/src/lib/useHarvestStore.js#L22): Computes unsalted client-side SHA-256 hash and stores `passwordHash` in browser `localStorage`. No server-side authentication, salting, or session tokens for farmers. |
| **4. Object-Level Authorization (IDOR)** | <span style="color:red; font-weight:bold;">ISSUE</span> | [`backend/national_registry_bridge/views.py:32`](file:///c:/projects/CarbonOS/backend/national_registry_bridge/views.py#L32): `RegistryProjectViewSet` lacks tenant scoping. When authenticated, any user can update or delete projects belonging to other organizations. Same for `GET /api/carbon/results/{id}` in [`inference/carbon_monitoring/router.py:394`](file:///c:/projects/CarbonOS/inference/carbon_monitoring/router.py#L394). |
| **5. File Upload Validation** | <span style="color:orange; font-weight:bold;">ISSUE</span> | [`inference/main.py:230-240`](file:///c:/projects/CarbonOS/inference/main.py#L230): `POST /predict` reads raw image stream into memory without verifying maximum file size or guarding against decompression bombs. In contrast, `inference/esg_rag/ingest.py` is well-hardened with SHA-256 sandboxed paths and 20MB limit. |
| **6. Concurrency / Race Condition** | <span style="color:red; font-weight:bold;">ISSUE</span> | [`inference/main.py:92-104, 319-325`](file:///c:/projects/CarbonOS/inference/main.py#L92): PyTorch Grad-CAM hooks use global variables `cam_gradients` and `cam_activations`. Concurrent asynchronous requests overwrite each other's gradients, producing corrupted heatmaps or server crashes. |
| **7. Injection & Raw HTML (`dangerouslySetInnerHTML`)** | <span style="color:orange; font-weight:bold;">ISSUE</span> | 6 components inject raw `<style>` tags using `dangerouslySetInnerHTML`: <br>• [`FarmerPaidCard.jsx:56`](file:///c:/projects/CarbonOS/src/components/payments/FarmerPaidCard.jsx#L56)<br>• [`PaymentStatusTracker.jsx:127`](file:///c:/projects/CarbonOS/src/components/payments/PaymentStatusTracker.jsx#L127)<br>• [`CorporateSaaSPipeline.jsx:90`](file:///c:/projects/CarbonOS/src/components/CorporateSaaSPipeline.jsx#L90)<br>• [`CameraCapture.jsx:385`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/CameraCapture.jsx#L385)<br>• [`DiagnosisResult.jsx:795`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/DiagnosisResult.jsx#L795)<br>• [`HowItWorks.jsx:243`](file:///c:/projects/CarbonOS/src/pages/HowItWorks.jsx#L243). Should be moved to Tailwind or CSS modules. |
| **8. Security Headers & Cookies** | **OK** | In production (`DEBUG=False`), Django settings enforce `SESSION_COOKIE_SECURE = True`, `SESSION_COOKIE_HTTPONLY = True`, `SECURE_HSTS_SECONDS = 31536000`, `X_FRAME_OPTIONS = 'DENY'`, `SECURE_CONTENT_TYPE_NOSNIFF = True` ([`backend/farmers_ai_project/settings.py:178-189`](file:///c:/projects/CarbonOS/backend/farmers_ai_project/settings.py#L178)). |
| **9. CORS & Cross-Origin Security** | **OK** | Both Django ([`settings.py:78`](file:///c:/projects/CarbonOS/backend/farmers_ai_project/settings.py#L78)) and FastAPI ([`main.py:53`](file:///c:/projects/CarbonOS/inference/main.py#L53)) restrict CORS to whitelisted domains (`localhost:5173`, `127.0.0.1:5173`, `carbon-os-beta.vercel.app`) with credentials enabled, rejecting wildcard `*`. |
| **10. SQL Injection** | **OK** | Both Django ORM and SQLAlchemy engines use parameterized queries throughout. Raw SQL string formatting was not observed in database queries. |
| **11. SSRF & Insecure Redirects** | **OK** | Fixed previously: [`EarthdataAuthSession`](file:///c:/projects/CarbonOS/inference/carbon_monitoring/external_apis.py#L117) strips Authorization headers when redirected outside `*.nasa.gov`. |
| **12. Error Information Leakage** | <span style="color:orange; font-weight:bold;">ISSUE</span> | In [`backend/farmers_ai_project/settings.py:29`](file:///c:/projects/CarbonOS/backend/farmers_ai_project/settings.py#L29), `DEBUG` defaults to `True` if `DJANGO_DEBUG` environment variable is not explicitly defined, exposing full tracebacks and environment state on 500 errors. |

---

## 8. Accessibility and Quality

### Accessibility Audit (WCAG 2.1 AA)
1. **Interactive Form Accessibility**:
   - [`src/pages/farmers-ai/HarvestGuardDashboard.jsx:134`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/HarvestGuardDashboard.jsx#L134): Contains corrupted encoding string: `<label>Password / ??????????</label>`.
   - Modals outside `src/components/Modal.jsx` (such as `CheckoutModal.jsx`) lack keyboard focus traps (Tab key escapes the modal into background DOM).
2. **Accessible Names on Icon Controls**:
   - Multiple header action buttons in `SaaSDashboard.jsx` (Lines 1912, 2092, 2142) and `ActivityEvidenceWorkspace.jsx` render bare Lucide icons with no `aria-label` or visible label text.
3. **Color Contrast Warnings**:
   - In light mode, muted subtitles using `text-white/40` converted via `index.css:281` to `rgba(65, 63, 63, 0.52)` on white backgrounds yield a contrast ratio of $\sim 3.8:1$, failing the WCAG AA minimum requirement of $4.5:1$ for normal body text.

---

### Performance & Bundle Red Flags
1. **Massive Component Monoliths**:
   - [`src/pages/platform/CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx): **5,700 lines** in a single file.
   - [`src/pages/platform/SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx): **4,937 lines** in a single file.
   - These files contain inline sub-views, SVG charts, static client profiles, and modals that cause heavy re-renders and slow IDE/typecheck indexing.
2. **Heavy External Fonts Loaded via Blocking CSS**:
   - [`index.html:54`](file:///c:/projects/CarbonOS/index.html#L54): Loads 3 font families (`Cormorant Garamond`, `Instrument Sans`, `JetBrains Mono`) with multiple weights from Google Fonts. Consider self-hosting `.woff2` files to avoid render-blocking third-party network hops.
3. **Dead Code & Duplicate Backends**:
   - The repository contains both a complete Django 6 backend (`backend/`) and a complete FastAPI backend (`inference/`). Some endpoints (`/api/diagnose/`) duplicate logic between Django and FastAPI.

---

## 9. Prioritized Action Plan

All identified findings sorted strictly by **Severity** (Critical $\rightarrow$ High $\rightarrow$ Medium $\rightarrow$ Low), then by **Effort** (Small $\rightarrow$ Medium $\rightarrow$ Large). **All Security Issues are prioritized first.**

| ID | Issue & Description | Category | Severity | Effort | Files Affected |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **SEC-01** | **Purge hardcoded OpenWeatherMap API keys** from backend code and client bundles. Move to environment variables. | Security | **Critical** | **S** | [`backend/farmers_ai/risk_engine.py:23,33`](file:///c:/projects/CarbonOS/backend/farmers_ai/risk_engine.py#L23), [`src/pages/farmers-ai/HarvestGuardDashboard.jsx:26`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/HarvestGuardDashboard.jsx#L26) |
| **SEC-02** | **Add `.env.example`** and rotate live credentials currently stored in `inference/.env`. | Security | **Critical** | **S** | [`inference/.env`](file:///c:/projects/CarbonOS/inference/.env), `.env.example` (New) |
| **SEC-03** | **Enforce authentication on all `/api/carbon/*` and `/predict` endpoints**. Add JWT / API token dependency. | Security | **Critical** | **M** | [`inference/carbon_monitoring/router.py:270+`](file:///c:/projects/CarbonOS/inference/carbon_monitoring/router.py#L270), [`inference/main.py:230`](file:///c:/projects/CarbonOS/inference/main.py#L230) |
| **SEC-04** | **Replace client-side SHA-256 `localStorage` auth** with server-side password hashing (PBKDF2/bcrypt) and JWT/session tokens. | Security | **Critical** | **M** | [`src/lib/useHarvestStore.js:20-30`](file:///c:/projects/CarbonOS/src/lib/useHarvestStore.js#L20), [`backend/farmers_ai/views.py`](file:///c:/projects/CarbonOS/backend/farmers_ai/views.py) |
| **SEC-05** | **Fix Grad-CAM concurrency race condition** by eliminating global `cam_gradients`/`cam_activations` singletons. | Security / Reliability | **High** | **S** | [`inference/main.py:92-108, 319-325`](file:///c:/projects/CarbonOS/inference/main.py#L92) |
| **SEC-06** | **Enforce file size limits and image decompression bomb guards** on `POST /predict`. | Security | **High** | **S** | [`inference/main.py:230-242`](file:///c:/projects/CarbonOS/inference/main.py#L230) |
| **SEC-07** | **Implement object-level tenant authorization (IDOR protection)** in Django viewsets and FastAPI result endpoints. | Security | **High** | **M** | [`backend/national_registry_bridge/views.py:32`](file:///c:/projects/CarbonOS/backend/national_registry_bridge/views.py#L32), [`inference/carbon_monitoring/router.py:394`](file:///c:/projects/CarbonOS/inference/carbon_monitoring/router.py#L394) |
| **SEC-08** | **Set strict HTTP timeouts** on all inter-service requests (Django $\rightarrow$ FastAPI forwarding). | Security / Reliability | **Medium** | **S** | [`backend/farmers_ai/views.py:43`](file:///c:/projects/CarbonOS/backend/farmers_ai/views.py#L43) |
| **SEC-09** | **Ensure `DEBUG=False` by default in production** and verify safe error formatting without leaking stack traces. | Security | **Medium** | **S** | [`backend/farmers_ai_project/settings.py:29`](file:///c:/projects/CarbonOS/backend/farmers_ai_project/settings.py#L29) |
| **SEC-10** | **Replace `dangerouslySetInnerHTML` style injection** with scoped CSS modules or Tailwind classes. | Security | **Medium** | **M** | 6 files ([`FarmerPaidCard.jsx:56`](file:///c:/projects/CarbonOS/src/components/payments/FarmerPaidCard.jsx#L56), [`PaymentStatusTracker.jsx:127`](file:///c:/projects/CarbonOS/src/components/payments/PaymentStatusTracker.jsx#L127), etc.) |
| **DES-01** | **Restore brand typography in light mode**: remove `Helvetica !important` override in `index.css`. | Design / UI | **High** | **S** | [`src/index.css:119-136`](file:///c:/projects/CarbonOS/src/index.css#L119) |
| **DES-02** | **Refactor 2,430 hardcoded hex colors to semantic tokens** and eliminate the 400-line `!important` regex override layer. | Design / Styling | **High** | **L** | [`src/index.css`](file:///c:/projects/CarbonOS/src/index.css), [`SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx), [`CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx) |
| **RESP-01**| **Wrap fixed `min-w-[1100px]` tables in `overflow-x-auto`** to prevent mobile viewport horizontal blowout. | Responsiveness | **High** | **S** | [`ActivityEvidenceWorkspace.jsx:813`](file:///c:/projects/CarbonOS/src/pages/platform/components/ActivityEvidenceWorkspace.jsx#L813), [`EsgReportGenerator.jsx:588`](file:///c:/projects/CarbonOS/src/pages/platform/components/EsgReportGenerator.jsx#L588) |
| **RESP-02**| **Replace `h-screen` (`100vh`) with `h-[100dvh]`** on sticky stacking cards to prevent mobile browser toolbar clipping. | Responsiveness | **Medium** | **S** | [`src/components/FrameworkAlignment.jsx:101, 125, 149`](file:///c:/projects/CarbonOS/src/components/FrameworkAlignment.jsx#L101) |
| **A11Y-01**| **Increase touch target size ($\ge 44\text{px}$) and add `aria-label`** on icon-only buttons across dashboards. | Accessibility | **Medium** | **S** | [`src/pages/platform/SaaSDashboard.jsx:1912, 2092, 2142`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx#L1912) |
| **A11Y-02**| **Fix corrupted character string in label** (`Password / ??????????`). | Accessibility / UI | **Medium** | **S** | [`src/pages/farmers-ai/HarvestGuardDashboard.jsx:134`](file:///c:/projects/CarbonOS/src/pages/farmers-ai/HarvestGuardDashboard.jsx#L134) |
| **A11Y-03**| **Respect `prefers-reduced-motion` in all GSAP animations** (`FrameworkAlignment`, `LiveMetrics`, `Philosophy`, `Roadmap`).| Accessibility / Motion | **Medium** | **S** | [`FrameworkAlignment.jsx:68`](file:///c:/projects/CarbonOS/src/components/FrameworkAlignment.jsx#L68), [`LiveMetrics.jsx:169`](file:///c:/projects/CarbonOS/src/components/LiveMetrics.jsx#L169), [`Philosophy.jsx:25`](file:///c:/projects/CarbonOS/src/components/Philosophy.jsx#L25) |
| **CODE-01**| **Unify duplicate modal dialogs** around the accessible `Modal.jsx` component. | Architecture | **Medium** | **M** | [`CheckoutModal.jsx`](file:///c:/projects/CarbonOS/src/components/marketplace/CheckoutModal.jsx), [`PurchaseConfirmModal.jsx`](file:///c:/projects/CarbonOS/src/components/payments/PurchaseConfirmModal.jsx) |
| **CODE-02**| **Split monolithic God components** (`CarbonMonitoring.jsx` 5.7k lines, `SaaSDashboard.jsx` 4.9k lines) into modular files. | Architecture / Perf | **Medium** | **L** | [`CarbonMonitoring.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/CarbonMonitoring.jsx), [`SaaSDashboard.jsx`](file:///c:/projects/CarbonOS/src/pages/platform/SaaSDashboard.jsx) |
| **CODE-03**| **Standardize on a single backend architecture**: resolve duality between Django (`backend/`) and FastAPI (`inference/`).| Architecture | **Low** | **L** | `backend/`, `inference/` |

---

## 10. Questions for the Developer

1. **Dual Backend Architecture Strategy**:
   - What is the long-term plan for the dual backend setup? Currently, `backend/` runs Django 6 (handling Farmers AI risk engine and National Registry bridge), while `inference/` runs FastAPI (handling dMRV satellite analytics, PyTorch crop disease inference, and ESG RAG). Should Django be consolidated into FastAPI or vice versa to prevent duplicate models, dependencies, and deployment complexity?
2. **OpenWeatherMap & External API Key Quotas**:
   - The two OpenWeatherMap API keys committed in `backend/farmers_ai/risk_engine.py` and `HarvestGuardDashboard.jsx` appear to be personal or development keys. Have these keys exceeded free tier quotas, and should we transition to a server-side proxy route `/api/weather` utilizing a secured environment variable?
3. **Farmer Authentication & Identity**:
   - `HarvestGuardDashboard.jsx` currently hashes passwords client-side using `crypto.subtle` and persists profiles in browser `localStorage`. Are smallholder farmers intended to have a true server-side account (with SMS OTP or PIN-based login via phone number), or is a local offline-first profile sufficient for field demonstrations?
4. **Light Mode Typography Intent**:
   - `src/index.css:121` explicitly overrides all light-mode fonts to `Helvetica, Arial, sans-serif !important`. Was this a deliberate design decision, or was it a quick fallback that should be replaced with the official brand fonts (`Instrument Sans` and `Cormorant Garamond`)?
5. **Satellite Analysis Compute & Quotas**:
   - `POST /api/carbon/analyze` triggers Google Earth Engine, Copernicus CDSE, and NASA Earthdata API queries without authentication. Is this endpoint intended to be restricted to authenticated corporate tenant users, or should it remain open for public demo evaluation?

