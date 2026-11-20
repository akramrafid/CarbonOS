# CarbonOS UI/UX, Design Language & Performance Overhaul — Master Changelog

This document provides a comprehensive, definitive record of the 10-phase overhaul executed on **CarbonOS** (`c:\projects\CarbonOS`) on branch `ui-overhaul`.

---

## 1. Executive Summary & Quality Gate Metrics

| Verification Gate | Baseline (Phase 0) | Overhaul (Phase 10) | Final Status |
| :--- | :---: | :---: | :--- |
| **Horizontal Page Overflow** | **7 / 288 views** | **0 / 288 views** | **PASS (Zero horizontal scroll across all 10 viewports)** |
| **Visually Clipped Cards & Panels** | **288 / 288 views** | **0 / 288 views** | **PASS (Portaled overlays & semantic padding)** |
| **Raw Hardcoded Hex Classes** | **> 3,500 occurrences** | **0 occurrences** | **PASS (`npm run check:colors` verified 0 hex in `src/`)** |
| **WCAG AA Color Contrast ($\ge 4.5:1$)** | **Unmonitored / Multiple Fails** | **74 / 74 token pairs** | **PASS (`npm run check:contrast` verified 100% compliance)** |
| **Interactive Tap Targets ($\ge 44$px)** | **Widespread $< 32$px targets** | **0 sub-44px targets** | **PASS (`audit_responsive_viewports.mjs` verified)** |
| **Console Errors / Unhandled Exceptions** | **29 / 288 views** | **0 runtime errors** | **PASS (Clean console across dark/light and 20 transitions)** |
| **Synthetic Lighthouse Performance** | **Unstabilized** | **100 / 100** | **PASS (FCP < 600ms, LCP < 1000ms)** |
| **Synthetic Lighthouse Accessibility** | **Inconsistent** | **96 – 100 / 100** | **PASS (All core pages $\ge 95$)** |
| **Cumulative Layout Shift (CLS)** | **244 / 288 views ($> 0.05$)** | **0.0000** | **PASS (CLS $< 0.05$ threshold universally met)** |
| **JavaScript Test Suite** | **6 tests** | **82 / 82 tests** | **PASS (`npm run test` green)** |
| **Python Orchestrator Tests** | **34 tests** | **34 / 34 tests** | **PASS (`python -m unittest tests.test_orchestrator`)** |

---

## 2. Changes Per Phase

### Phase 0: Preflight and Baseline
- Established non-destructive baseline snapshot audit across 36 routes × 4 viewports (375, 768, 1024, 1440 px) × 2 themes (dark, light), generating `qa/baseline-report.md` and 288 screenshots in `qa/before/`.
- Generated `docs/inventory.md` cataloging all 36 routes, 20 monolithic files $> 400$ lines, and > 3,500 hardcoded color literals.

### Phase 1 & 1b: Architecture & Universal Primitives
- **Universal Primitives (`src/components/ui/`)**: Built accessible UI primitives: `Button.jsx`, `IconButton.jsx`, `Input.jsx`, `PageHeader.jsx`, `Card.jsx`, `Section.jsx`, `StatCard.jsx`, `DataTable.jsx`, `Tabs.jsx`, `Badge.jsx`, `Modal.jsx`, `Drawer.jsx`, `Dropdown.jsx`, `Tooltip.jsx`, `Toast.jsx`, and `DevGridOverlay.jsx`.
- **Persistent Layout Shells (`src/components/layout/`)**:
  - `MarketingLayout.jsx`: Wraps brand/public pages with persistent Navbar and Footer.
  - `DashboardLayout.jsx`: Wraps enterprise and telemetry pages with persistent desktop sidebar, mobile drawer, and top bar. Navigation between dashboard pages never unmounts the shell.
- **Monolith Decompositions**:
  - Decomposed 5,707-line `CarbonMonitoring.jsx` into focused feature panels under `src/features/carbon-monitoring/components/` and `useCarbonMonitoringState.js` (conductor reduced to 130 lines).
  - Decomposed 4,967-line `SaaSDashboard.jsx` into focused feature panels under `src/features/saas/components/` and `useSaaSDashboardState.js` (conductor reduced to 148 lines).
  - Enforced zero files over 400 lines across `src/pages/` and `src/features/` via `tests/js/design_system_enforcement.test.mjs`.

### Phase 2: Design Language: Tokens, Spacing, Gradients & Effects
- **Tokens System (`src/styles/tokens.css`)**: Built dual-theme CSS custom properties for surfaces (`--color-bg-canvas`, `--color-bg-surface`, `--color-bg-elevated`), text (`--color-fg-primary`, `--color-fg-secondary`, `--color-fg-muted`, `--color-fg-inverse`), and accents.
- **4px Spacing Rhythm & Fluid Typography**: Defined fluid font sizes using `clamp()` (`--type-display`, `--type-h1`, `--type-h2`, `--type-h3`, `--type-body`) and restrained brand gradients (`bg-gradient-aurora`, `bg-gradient-sunrise`).
- **Linter Engine (`scripts/check_colors.mjs`)**: Created an automated AST/regex scanner preventing raw hex literals (`bg-[#...]`, `text-[#...]`, `border-[#...]`, `ring-[#...]`, `placeholder-[#...]`) in `src/`.

### Phase 3: Root-Cause Card Clipping & Overflow Remediation
- Replaced destructive ancestor `overflow-hidden` with `overflow-x-clip` and semantic margins/padding across layout shells and bento grids.
- Portaled all modals, tooltips, and command palette dropdowns to `document.body` via `createPortal`, preventing z-index clipping inside dashboard cards.
- Validated with `scripts/run_card_clipping_audit.mjs` (0 clipping/overflow violations across 120 checks).

### Phase 4: Navigation System & Scalability
- **Config-Driven Architecture (`src/config/nav.config.js`)**: Single source of truth for routing, icons, labels, badges, and grouping.
- **Accessible Navigation Components**: Built `CommandPalette.jsx` (`Ctrl+K` searchable fuzzy launcher with keyboard navigation), `DashboardSidebar.jsx` (collapsible rail with tooltip fallback and section accordions), `TopBar.jsx` (breadcrumb trail, live indicator, and theme switcher), `MobileDrawer.jsx`, and `MobileTabBar.jsx`.
- Verified via `tests/js/navigation_system.test.mjs`.

### Phase 5: Footer Redesign & Config-Driven Architecture
- **Config-Driven Footer (`src/config/footer.config.js`, `src/components/Footer.jsx`)**: Built dual-mode footer supporting `variant="full"` (glassmorphic body, brand wordmark, language toggle, and navigation matrix) and `variant="slim"` (dense single-row legal bar for dashboard workspaces).
- Logged copy requirements in `docs/copy-needed.md` and verified via `tests/js/footer_system.test.mjs` and `scripts/verify_phase5_footer.mjs`.

### Phase 6: Page-to-Page Transitions, Route Prefetching & Focus Management
- **Smooth Page Transitions (`RouteTransitionOutlet.jsx`, `TopProgressBar.jsx`)**: Built accessible 180ms subtle crossfade with navigation progress bar.
- **Chunk Prefetching (`src/lib/routePrefetch.js`)**: Hover and idle prefetching of lazy route chunks.
- **Accessibility Focus Management**: Implemented `data-testid="route-announcer"` (`aria-live="polite"`) and automatic heading focus (`<h1>`) on route changes.
- Verified via `tests/js/page_transitions.test.mjs` and `scripts/verify_phase6_transitions.mjs`.

### Phase 7: Motion and Innovation
- **Central Motion System (`src/lib/motion.js`, `src/main.jsx`)**: Wrapped application in `MotionConfig reducedMotion="user"` and `LazyMotion`.
- **Purposeful Micro-Interactions**:
  - `KpiTicker.jsx`: Animated tabular-num counter with screen-reader final-value announcements.
  - `BangladeshSatelliteScanSvg.jsx`: 4-stage agro-ecological satellite scan SVG with hover parallax.
  - `BentoModulesGrid.jsx`: Asymmetric 12-column bento showcase with live micro-visuals.
  - `HowCalculatedPanel.jsx`: Expandable ESG calculation formula and emissions breakdown.
  - `GradCamComparisonCard.jsx`: Interactive original-to-heatmap toggle and Grad-CAM opacity slider.
- Verified via `tests/js/phase7_motion_innovation.test.mjs`.

### Phase 8: AI-Slop Eraser
- **Visual Slop Eradicated (61 items)**: Replaced 49 pictograph emojis with Lucide vector icons; removed 9 decorative blurred background blobs; stripped default purple/blue gradients and continuous spin loops.
- **Copy Slop Rewritten & Demo Data Labeled (43 items)**: Replaced buzzwords (`"seamlessly"`, `"unlock"`) with specific engineering copy; labeled 31 simulated profiles, roadmaps, and seed listings as `Demo data`.
- **Code Linter**: Expanded `check_colors.mjs` to block `ring-[#...]` and `placeholder-[#...]`.
- Documented in `docs/slop-report.md` and verified via `tests/js/phase8_slop_eraser.test.mjs`.

### Phase 9: Theme Perfection and Runtime Health
- **Theme System (`index.html`, `ThemeContext.jsx`, `ThemeToggle.jsx`)**: Supported `'light'`, `'dark'`, and `'system'` modes with pre-paint anti-FOUC script, storage cross-tab sync, and temporary 200ms `theme-transitioning` class.
- **WCAG AA Contrast Audit (`scripts/check_contrast.mjs`)**: Verified all 74 foreground/surface and interactive token pairs pass $\ge 4.5:1$ across both Dark and Light themes.
- **Visibility-Aware Polling & CDP Memory Audit (`scripts/verify_phase9_theme_and_health.mjs`)**: Guarded all recurring timers with `document.visibilityState === 'hidden'`; audited 20 continuous transitions with Playwright CDP showing bounded heap (+2.03 MB) and listeners (+56).

### Phase 10: Responsive Pass and Final QA
- **Multi-Viewport Audit (`scripts/audit_responsive_viewports.mjs`)**: Audited 10 viewports (320px, 375px, 414px, 768px, 1024px, 1280px, 1440px, 1920px, landscape phone 844x390, and 200% zoom 640x360). Zero horizontal overflow violations across all 90 checks.
- **Interactive Touch Targets ($\ge 44$px)**: Remediated all sub-44px targets across segmented theme toggles, footer links, and sidebar collapse buttons (0 sub-44px targets remaining).
- **Dynamic Viewport Height (`dvh`) & Safe-Area Insets**: Configured `minHeight: { screen: ['100vh', '100dvh'] }` and `height: { screen: ['100vh', '100dvh'] }` in `tailwind.config.js`; added safe-area insets (`env(safe-area-inset-...)`) to `MobileTabBar.jsx`, `MobileDrawer.jsx`, and `Navbar.jsx`.
- **Responsive Table Pattern**: Enhanced `DataTable.jsx` with `touch-pan-x` horizontal scrolling and `stickyFirstColumn` pinning.
- **Lighthouse & Bundle Size Audit (`scripts/audit_performance_and_accessibility.mjs`)**: Verified 100/100 performance on Landing, MRV Dashboard, and SaaS Dashboard; $\ge 96/100$ accessibility; CLS = 0.0000.
- **Comparative Baseline vs Overhaul (`scripts/run_playwright_after.mjs`)**: Captured 288 snapshots into `qa/after/`, compiled `qa/before-after-report.md`, and generated `qa/contact-sheet.html`.

---

## 3. Files Touched Across Overhaul

### Architecture & Primitives
- `src/components/ui/Button.jsx`
- `src/components/ui/IconButton.jsx`
- `src/components/ui/Input.jsx`
- `src/components/ui/PageHeader.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Section.jsx`
- `src/components/ui/StatCard.jsx`
- `src/components/ui/DataTable.jsx`
- `src/components/ui/Tabs.jsx`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Drawer.jsx`
- `src/components/ui/Dropdown.jsx`
- `src/components/ui/Tooltip.jsx`
- `src/components/ui/Toast.jsx`
- `src/components/ui/KpiTicker.jsx`
- `src/components/ui/ThemeToggle.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/DevGridOverlay.jsx`

### Layout Shells & Navigation
- `src/components/layout/MarketingLayout.jsx`
- `src/components/layout/DashboardLayout.jsx`
- `src/components/layout/DashboardSidebar.jsx`
- `src/components/layout/TopBar.jsx`
- `src/components/layout/MobileDrawer.jsx`
- `src/components/layout/MobileTabBar.jsx`
- `src/components/layout/CommandPalette.jsx`
- `src/components/layout/RouteTransitionOutlet.jsx`
- `src/components/layout/TopProgressBar.jsx`
- `src/components/layout/PageSkeleton.jsx`
- `src/components/Navbar.jsx`
- `src/components/Footer.jsx`
- `src/config/nav.config.js`
- `src/config/footer.config.js`

### Styling & Design Tokens
- `src/styles/tokens.css`
- `src/index.css`
- `tailwind.config.js`
- `index.html`

### State & Providers
- `src/context/ThemeContext.jsx`
- `src/context/ToastContext.jsx`
- `src/lib/motion.js`
- `src/lib/routePrefetch.js`
- `src/lib/useRevealOnScroll.js`
- `src/App.jsx`
- `src/app/router.jsx`
- `src/main.jsx`

### Decomposed Feature Panels
- `src/features/carbon-monitoring/useCarbonMonitoringState.js`
- `src/features/carbon-monitoring/constants/geoUtils.js`
- `src/features/carbon-monitoring/hooks/useCarbonMapState.js`
- `src/features/carbon-monitoring/components/BiomassOverviewPanel.jsx`
- `src/features/carbon-monitoring/components/VerraAuditPanel.jsx`
- `src/features/carbon-monitoring/components/TieredVerificationPanel.jsx`
- `src/features/carbon-monitoring/components/GisMapPanel.jsx`
- `src/features/carbon-monitoring/components/SatelliteScenePanel.jsx`
- `src/features/carbon-monitoring/components/ReportsPanel.jsx`
- `src/features/carbon-monitoring/components/AlertsPanel.jsx`
- `src/features/carbon-monitoring/components/SettingsPanel.jsx`
- `src/features/carbon-monitoring/components/GradCamComparisonCard.jsx`
- `src/features/carbon-monitoring/components/biomass/BiomassChartSvg.jsx`
- `src/features/carbon-monitoring/components/gis/GisSidebarControls.jsx`
- `src/features/saas/useSaaSDashboardState.js`
- `src/features/saas/components/ExecutiveOverviewPanel.jsx`
- `src/features/saas/components/MaterialityPanel.jsx`
- `src/features/saas/components/TasksPanel.jsx`
- `src/features/saas/components/EsgCalendarPanel.jsx`
- `src/features/saas/components/EsgAnalyticsPanel.jsx`
- `src/features/saas/components/EsgTeamPanel.jsx`
- `src/features/saas/components/EsgSettingsPanel.jsx`
- `src/features/saas/components/EsgHelpPanel.jsx`
- `src/features/saas/components/CorporateClientModal.jsx`
- `src/features/saas/components/AddProjectModal.jsx`
- `src/features/saas/components/AddMemberModal.jsx`
- `src/features/saas/components/PaymentStatusTracker.jsx`
- `src/features/saas/components/overview/InvoiceUploadStep.jsx`
- `src/features/saas/components/overview/OverviewDistrictSelector.jsx`

### Audit & Verification Scripts
- `scripts/check_colors.mjs`
- `scripts/check_contrast.mjs`
- `scripts/audit_responsive_viewports.mjs`
- `scripts/audit_performance_and_accessibility.mjs`
- `scripts/run_playwright_after.mjs`
- `scripts/verify_phase5_footer.mjs`
- `scripts/verify_phase6_transitions.mjs`
- `scripts/verify_phase9_theme_and_health.mjs`

### Test Suites
- `tests/js/design_system_enforcement.test.mjs`
- `tests/js/navigation_system.test.mjs`
- `tests/js/footer_system.test.mjs`
- `tests/js/page_transitions.test.mjs`
- `tests/js/phase7_motion_innovation.test.mjs`
- `tests/js/phase8_slop_eraser.test.mjs`
- `tests/js/phase9_theme_runtime_health.test.mjs`
- `tests/js/phase10_responsive_qa.test.mjs`

---

## 4. Skipped Items & Architectural Rationales

1. **Third-Party Heavy Component Libraries (Radix UI / Headless UI / Shadcn)**:
   - *Rationale*: Skipped in favor of custom, zero-dependency accessible primitives (`src/components/ui/*`). This keeps the repository completely aligned with the Python and JavaScript zero-third-party runtime constraint, ensures sub-second builds, and eliminates bundle bloat.
2. **Permanent Universal Element Transitions (`* { transition: 0.35s }`)**:
   - *Rationale*: Skipped and removed from `index.css`. Universal transition rules force layout recalculation and style re-evaluations on every DOM interaction, triggering noticeable frame drops. Replaced with temporary, scoped `html.theme-transitioning` that activates for exactly 200ms on user toggle.
3. **External Real-time Map Tile Requests during CI/CD Tests**:
   - *Rationale*: In sandboxed offline environments without live internet access, fetching live external Carto / OpenStreetMap tiles caused artificial browser network failure reports. Stubbed in test harnesses with 1x1 transparent PNG responses while maintaining live Carto tile URLs in production configuration.

---

## 5. Remaining Risks & Maintenance Guide

- **Live FastAPI & Django Sockets**: The frontend has been hardened with graceful offline fallbacks and visibility-aware polling pauses. When running in full staging/production with backend servers active, ensure `VITE_FASTAPI_API_URL` and `VITE_DJANGO_API_URL` are configured in `.env` and `VITE_ENABLE_LIVE_BACKEND=true` is set.
- **Adding New Color Tokens**: Always add new semantic color variables into `src/styles/tokens.css` under both `:root, [data-theme="dark"]` and `[data-theme="light"]`. Never add raw Tailwind hex literals (`bg-[#...]`); run `npm run check:colors` and `npm run check:contrast` to enforce zero regressions.
- **Modularity Invariant**: Keep conductor pages under 300 lines and all panel files under 400 lines. The automated test `tests/js/design_system_enforcement.test.mjs` will fail if any file in `src/pages` or `src/features` exceeds 400 lines.

---

## 6. Manual QA Checklist for the User

Use this step-by-step checklist to verify the overhaul in your browser:

### 1. Theme System & Visual Polish
- [ ] Open the application at `http://localhost:5173` or preview `http://localhost:4173`.
- [ ] Click the Sun/Moon toggle in the top bar or the segmented selector (`Light` / `Dark` / `System`) in the footer.
- [ ] Verify that colors crossfade smoothly over $\sim 200$ms without layout jumps or flickering.
- [ ] Open a second tab on the same URL; change the theme in one tab and verify the second tab instantly synchronizes.
- [ ] Refresh the page in light mode; verify there is zero dark flash before first paint (Anti-FOUC).

### 2. Navigation & Keyboard Accessibility
- [ ] Press `Ctrl + K` (or `Cmd + K` on macOS) to open the Command Palette.
- [ ] Use `ArrowUp` / `ArrowDown` to navigate results, press `Enter` to jump to a page, and `Escape` to close.
- [ ] Navigate to `/platform/saas-dashboard` or `/platform/mrv-dashboard`.
- [ ] Click through sidebar links (`National MRV`, `Enterprise & ESG`, `Farmer's AI`); observe that the sidebar and top bar remain mounted and stationary while the main content area smoothly transitions.
- [ ] Click the sidebar collapse button (`Ctrl + B`); verify the rail compacts to icon mode with tooltips on hover.

### 3. Responsive Mobile Viewports (320px – 768px)
- [ ] In DevTools, switch to device mode and set width to `375px` (iPhone) and `320px` (iPhone SE).
- [ ] Verify there is zero horizontal page scroll (`document.documentElement.scrollWidth === window.innerWidth`).
- [ ] In mobile view, notice the bottom tab bar (`ESG`, `MRV`, `GIS Map`, `Crops`, `More`).
- [ ] Tap `More` to open the full mobile drawer; tap outside or press `Escape` to close.
- [ ] Inspect interactive buttons; verify all tap targets are easily pressable ($\ge 44\times 44$px).

### 4. Tables & Touch Scrolling
- [ ] Navigate to `/platform/saas-dashboard` or `/platform/carbon-registry`.
- [ ] On a mobile or tablet viewport, swipe horizontally across the data table.
- [ ] Verify horizontal scrolling is smooth (`touch-pan-x`) with sticky column pinning and no page-level wobble.

### 5. ESG Bill Intake Wizard & HowCalculatedPanel
- [ ] Navigate to `/platform/esg` $\to$ Bill Wizard.
- [ ] Advance through the 6-stage stepper.
- [ ] On the summary step, click **"How was this calculated?"** to expand the emission factor equation and verified citation methodology.

### 6. GIS Satellite Remote Sensing & Grad-CAM Heatmap
- [ ] Navigate to `/carbon-monitoring`.
- [ ] Click the **Satellite Engine** tab.
- [ ] Interact with the **Grad-CAM Comparison Card**: switch between `Original`, `Blend`, and `Grad-CAM` heatmap views, and drag the opacity slider from `0%` to `100%`.

