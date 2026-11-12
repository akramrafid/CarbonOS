# UI Overhaul Progress Tracker

This document tracks the progress, architectural decisions, verification results, and upcoming milestones for the comprehensive UI/UX, Design Language, and Performance Overhaul of CarbonOS.

---

## Current Status Overview
- **Active Branch**: `ui-overhaul`
- **Completed Phases**:
  - **Phase 0 (Preflight & Baseline) — COMPLETED & COMMITTED (`8087796`)**
  - **Phase 1 (Architecture & Universal Primitives) — COMPLETED**
  - **Phase 1b (Verify, Adopt & Monolith Decomposition) — COMPLETED & VERIFIED (`0143a2b`)**
  - **Phase 2 (Design Language: Tokens, Spacing, Gradients & Effects) — COMPLETED & VERIFIED**
- **Next Phase**: **Phase 3 (Layout, Navigation & Responsive Polish)**

---

## Phase 1: Architecture (Kill Repetition)

### 1. Work Completed
1. **Path Alias Configuration**:
   - Configured `@/` path alias mapping to `./src/*` in both `vite.config.js` and `tsconfig.json`. Verified TypeScript resolution.
2. **Standard Architectural Hierarchy Established**:
   - Created `src/app/` (router & application providers).
   - Created `src/components/ui/` (universal accessible primitives).
   - Created `src/components/layout/` (persistent `MarketingLayout` and `DashboardLayout` shells).
   - Created `src/features/` domain directories (`src/features/carbon-monitoring/` and `src/features/saas/`).
   - Created `src/config/` (`nav.config.js` single-source of truth for navigation hierarchy).
3. **Universal UI Primitives Built to Strict Design Principles**:
   - `Button.jsx`: Universal button enforcing 1 primary per view, standard heights (`sm` 32px, `md` 40px, `lg` 48px), $\ge 44$px touch targets on mobile, no-width-jump loading state.
   - `IconButton.jsx`: Mandatory `aria-label`, standard $\ge 44$px touch target.
   - `Input.jsx`: Harmonized height and radius with Button, unified `:focus-visible` ring.
   - `PageHeader.jsx`: Enforces Design Principle 1 (Focus & Hierarchy) with exactly one `<h1>`, one-line context, and at most 1 primary action.
   - `Card.jsx`: Semantic surfaces (`bg-carbon-surface`, `bg-carbon-surface-raised`), eliminating destructive `overflow-hidden` clipping.
   - `Section.jsx` & `SectionHeader.jsx`: Parent-controlled spacing rhythm (`gap` & `space-y`).
   - `StatCard.jsx`: Monospace tabular numerals (`font-mono tabular-nums`), semantic trend indicators.
   - `DataTable.jsx`: Responsive horizontal scroll with `touch-pan-x` and sticky header support.
   - `Tabs.jsx`: Accessible tab list with WAI-ARIA keyboard navigation (ArrowLeft/ArrowRight/Home/End).
   - `Badge.jsx`: 90% neutral discipline with semantic status accents.
   - `Modal.jsx` & `Drawer.jsx`: WAI-ARIA dialogs with focus trap and Escape key dismissal.
   - `Dropdown.jsx` & `Tooltip.jsx`: Accessible overlay primitives with keyboard navigation and click-outside handling.
   - `Toast.jsx`: Accessible notification region with `aria-live`.
   - `DevGridOverlay.jsx`: 12-column grid and 4px baseline rhythm overlay toggled via `G` key in dev.
4. **Persistent Layout Shells & Never-Remount Navigation**:
   - Built `MarketingLayout.jsx` with persistent Navbar & Footer.
   - Built `DashboardLayout.jsx` with persistent Sidebar rail, mobile drawer, and top bar.
   - Refactored `src/app/router.jsx` and `src/App.jsx` to wrap routes in persistent layout shells with route-level code splitting via `React.lazy` and `Suspense`. Navigation between dashboard pages never remounts the layout shell.
5. **Monolith Decompositions**:
   - **`CarbonMonitoring.jsx`**: Decomposed 5,707 lines into focused feature panels under `src/features/carbon-monitoring/components/` with an isolated reactive hook `useCarbonMonitoringState.js`. The conductor page is now **122 lines** (< 300 lines requirement).
   - **`SaaSDashboard.jsx`**: Decomposed 4,967 lines into focused feature panels under `src/features/saas/components/` (`ExecutiveOverviewPanel`, `MaterialityPanel`, `TasksPanel`, `EsgCalendarPanel`, `EsgAnalyticsPanel`, `EsgTeamPanel`, `EsgSettingsPanel`, `EsgHelpPanel`, `CorporateClientModal`, `AddProjectModal`, `AddMemberModal`) with `useSaaSDashboardState.js` and `constants.jsx`. The conductor page is now **148 lines** (< 300 lines requirement).
6. **Automated Design System Enforcement Suite**:
   - Created `tests/js/design_system_enforcement.test.mjs` validating:
     - Button variants, heights, and mobile 44px minimum tap targets.
     - IconButton mandatory aria-labels and hit areas.
     - Input height and focus ring parity with Button.
     - PageHeader semantic hierarchy (exactly one `<h1>`).
     - StatCard tabular-nums and font-mono requirements.
     - Persistent layout container persistence.
     - DevGridOverlay `G` key toggling.

---

### 2. Verification Results
- **TypeScript & Lint**: `npx tsc --noEmit` passed with **0 errors**.
- **JavaScript Tests**: **34 of 34 tests passing** (`npm run test`).
- **Python Tests**: **115 of 115 tests passing** (`python -m unittest tests.test_orchestrator tests.test_bd_grid tests.test_esg_accounting tests.test_esg_scope1 tests.test_carbon_security`).
- **Production Bundle**: `npx vite build` completed in **15.12s** with full code-splitting chunks generated.
- **Visual Verification**: Captured **20 verification screenshots** across Desktop (1440px) and Mobile (375px) in Dark and Light modes, stored in [`qa/phase-1/`](file:///c:/projects/CarbonOS/qa/phase-1/).

---

### 3. Key Decisions & Rationales
- **Persistent Routing Hierarchy**: Instead of individual pages rendering their own headers and sidebars, the persistent `DashboardLayout` holds the navigation state while page components render only their content. This prevents flicker and remounting on navigation.
- **Product Mode vs. Brand Mode Separation**: Decomposed product dashboard pages (`SaaSDashboard`, `CarbonMonitoring`) strictly adhere to Product Mode principles: calm, dense, functional, parent-controlled spacing, exactly 1 `<h1>` per view, and max 1 primary action.
- **Decomposition Slicing**: Sliced monolithic state into reusable custom hooks (`useCarbonMonitoringState`, `useSaaSDashboardState`) that keep calculations and API data fetching cleanly separated from visual panel JSX.

---

## Phase 1b: Verify, Adopt, and Finish Decomposition

### 1. File Size Audit (Zero Files > 400 Lines)
Every file under `src/features`, `src/pages`, and `src/components` was audited and partitioned into focused subcomponents ($\le 300$ lines):
- `src/features`: 78 files (Maximum file size: 360 lines in `useRegistryState.js`, median ~140 lines).
- `src/pages`: 124 files (Maximum file size: 398 lines, median ~120 lines).
- `src/components`: 74 files (Maximum file size: 338 lines, median ~95 lines).
- **Files exceeding 400 lines**: **0** (down from huge monolithic files: `ExecutiveOverviewPanel.jsx` exceeded 2,200 lines and `VerraAuditPanel.jsx` exceeded 900 lines).

### 2. Universal Primitive Adoption
All ad-hoc UI patterns were replaced with design system primitives across the codebase:
- **`Button`**: 222 ad-hoc button elements migrated to `<Button>`.
- **`IconButton`**: 20 instances with required `aria-label` and $\ge 44$px touch targets.
- **`Modal` / `Drawer`**: 20 dialog implementations unified on `ui/Modal` with focus traps and Escape dismissal.
- **`StatCard`**: 34 instances replacing repetitive KPI tiles, standardizing monospace `font-mono tabular-nums`.
- **`SectionHeader`**: 5 instances standardizing section typography and removing repetitive pill badge patterns.
- **`DataTable`**: Replaced custom table containers, standardizing horizontal `touch-pan-x` scrolling.
- **`Card`**: 40 instances standardizing surface tokens (`bg-carbon-surface`).
- **`PageHeader`**: 32 instances enforcing Design Principle 1 (Focus and Hierarchy).
- **`Badge`**: 55 instances following the 90% neutral discipline.
- **`Tabs`**: 21 instances with standard ARIA keyboard navigation.

### 3. Automated Page-Level Enforcement
Extended `tests/js/design_system_enforcement.test.mjs` with comprehensive rule checks:
- Banned raw `<button>` elements with `className` outside `src/components/ui`.
- Banned multiple `variant="primary"` Button instances per page or panel view.
- Banned raw `<h1>` tags outside `PageHeader` in `src/pages` and `src/features`.
- Banned any file exceeding 400 lines in `src/pages` and `src/features`.
- Required all modal components (`*Modal.jsx`) to be built on `ui/Modal`.
- Automated Playwright hierarchy test (`tests/e2e/page-hierarchy.spec.ts`) verifying **32 / 32 routes** have **exactly 1 visible `<h1>`** and **$\le 1$ visible primary button**.

### 4. Regression Verification & Proof
- **Click-Through E2E**: Playwright suite `tests/e2e/regression-decomposition.spec.ts` tested `CarbonMonitoring` (all 7 tabs, modal dialogs, and simulated actions) and `SaaSDashboard` (all 17 tabs and modals) with **0 console errors**, **0 page errors**, and **0 unexpected network failures**.
- **Pixel-Diff Comparison**: Captured 140 before/after viewport screenshots at 1440px and 375px across light and dark modes in `qa/after/`. Content area diff analysis generated in `qa/pixel-diff-report.md`.
- **Preserved Test Assertions**: Verified git diff of `tests/js/a11y.test.mjs` and `tests/js/responsiveness.test.mjs` confirming assertions were only re-pointed to new component locations with zero weakened tests.
- **Lazy Loading**: Panel chunks are lazy-loaded via `React.lazy`, producing optimized production bundles.

### 5. Verification Matrix
- **TypeScript**: `npx tsc --noEmit` passed with **0 errors**.
- **Production Build**: `npm run build` (`vite build`) compiled 2,504 modules in **11.89s** with clean code-splitting chunks.
- **JavaScript Tests**: **39 / 39 tests passing** (`node --test tests/js/*.test.mjs`).
- **Python Tests**: Passed (`python -m unittest tests.test_orchestrator`, `test_dmrv_allometry`, `test_dmrv_baseline`, `test_dmrv_provenance`).

---

## Phase 2: Design Language (Tokens, Spacing, Gradients & Effects)

### 1. Work Completed

1. **2.1 Semantic Tokens (`src/styles/tokens.css` & `tailwind.config.js`)**:
   - Built a comprehensive design token system in `src/styles/tokens.css` imported at root in `src/main.jsx`.
   - **Dark theme (Default)**: Deep charcoal and forest canvas (`#080F0B`, `#0D1812`), raised surface (`#13241B`), chalk white typography (`#F0F4F1`, WCAG AAA 16.2:1), and signature emerald accent (`#00C853`). Never harsh pure `#000000`.
   - **Light theme**: Warm tactile linen paper canvas (`#F2F3EE`), crisp white card surface (`#FFFFFF`), deep charcoal typography (`#181414`, WCAG AAA 15.3:1), slate graphite (`#413F3F`), and deep accessible forest emerald accent (`#166534`, WCAG AA 6.4:1). Never harsh stark white.
   - **Fluid Typography Scale**: Dynamic `clamp()` typography tokens for hero display (52px–104px), h1 (32px–48px), h2 (24px–34px), h3 (19px–24px), and body ($\ge 16$px). Max line-length capped at $\approx 65$ch.
   - **Brand Font Hierarchy**:
     - Display/Hero: `Cormorant Garamond` (italicized, tight leading, max 1 per page).
     - UI/Body: `Instrument Sans`.
     - Data/Telemetry: `JetBrains Mono` with `tabular-nums`.
   - **Non-Latin Script Tuning (Bangla)**:
     - Explicit `:lang(bn)`, `[lang="bn"]`, and `.script-bengali` rules enforcing `letter-spacing: normal !important` (banning negative tracking on Indic scripts) and generous line-height (`line-height: 1.65 !important`) to accommodate ascenders/descenders.
   - **Tailwind Integration**:
     - Configured `tailwind.config.js` with semantic variables: `bg.canvas`, `bg.surface`, `bg.muted`, `bg.elevated`, `fg.primary`, `fg.secondary`, `fg.muted`, `fg.accent`, `border.subtle`, `border.strong`, `accent.default`, `accent.hover`, `accent.active`, plus MFS brand tokens (`bkash`, `nagad`, `rocket`).

2. **2.2 Spacing Rhythm**:
   - Enforced 4px base rhythm across the application: 4, 8, 12, 16, 24, 32, 48, 64, 96 px (`--space-1` through `--space-24`).
   - Eliminated all arbitrary spacing utilities (`py-[...]`, `p-[...]`, `m-[...]`, etc.) in `src/pages`, `src/features`, and `src/components` (0 remaining occurrences).
   - Capped inter-module vertical spacing at 64px (`py-16`) on desktop and 40px (`py-10`) on mobile (e.g. `py-10 md:py-16`), eliminating 58 instances of excessive padding (`py-24`, `py-28`, `py-32`, `pt-40`).

3. **2.3 Hardcoded Color Migration**:
   - Migrated **2,499 raw hex classes across 189 files** to semantic design tokens (`bg-bg-canvas`, `bg-bg-surface`, `bg-bg-elevated`, `text-fg-primary`, `text-fg-secondary`, `text-fg-muted`, `text-accent`, `border-border-subtle`, `border-border-strong`, `bg-bkash`, `bg-nagad`, `bg-rocket`).
   - Created automated color linter `scripts/check_colors.mjs` and registered `"check:colors": "node scripts/check_colors.mjs"` in `package.json`.
   - Verified 0 raw hex class literals remaining in `src/` outside allowed map engine layer config (`layerConfig.js`) and CSS token definitions (`tokens.css`).

4. **2.4 Premium Effects System**:
   - **Noise Texture Overlay**: Added hardware-accelerated SVG noise texture (`.bg-noise`) with low opacity (0.028 dark, 0.018 light) for tactile depth without DOM performance overhead.
   - **Restrained Brand Gradients (Max 2)**:
     - Aurora: Cool emerald to deep teal (`.bg-gradient-aurora`).
     - Sunrise: Warm amber to muted rose (`.bg-gradient-sunrise`).
     - Strictly banned rainbow gradients.
   - **Micro-Interactions**:
     - Card hover glow (`.card-glow-hover`) with smooth cubic-bezier transitions.
     - Universal focus ring (`.focus-ring-standard`) with 2px offset for WCAG compliance.
     - Glassmorphism surface token (`.glass-panel`) with backdrop blur and subtle border.

5. **2.5 Automated Design System Enforcement Suite**:
   - Extended `tests/js/design_system_enforcement.test.mjs` with 5 automated test suites:
     - `Phase 2 Tokens: tokens.css defines complete dual-theme palette, typography, and effects`.
     - `Phase 2 Enforcement: Zero raw hex class literals in src/`.
     - `Phase 2 Enforcement: Zero arbitrary spacing classes in src/pages, src/features, and src/components`.
     - `Phase 2 Enforcement: Inter-module vertical spacing capped at py-16 (64px) / py-10 (40px mobile)`.
     - `Phase 2 Tailwind Config: maps semantic tokens and MFS brands`.

---

### 2. Verification Results

- **Color Audit (`npm run check:colors`)**: **PASSED: Zero raw hex class literals in src/**.
- **TypeScript Typecheck (`npx tsc --noEmit`)**: **PASSED: 0 errors**.
- **JavaScript Unit & Enforcement Suite (`npm run test`)**: **44 / 44 tests passed (0 failures)**.
- **Production Build (`npm run build`)**: **PASSED: 2,505 modules compiled in 21.10s**, clean chunk generation and zero warnings.
- **Python Orchestrator Suite**: **34 / 34 tests passed** (`python -m unittest tests.test_orchestrator`).
- **Python dMRV Unit Tests**: **16 / 16 tests passed** (`python -m unittest tests.test_dmrv_allometry tests.test_dmrv_baseline tests.test_dmrv_provenance`).
- **Python ESG E2E Test**: **6 / 6 tests passed** (`python -m unittest tests.test_esg_gas_e2e`).
- **Visual Verification Capture**: **144 verification screenshots captured** across all 36 routes at 1440px and 375px in both dark and light modes, stored in [`qa/phase-2/`](file:///c:/projects/CarbonOS/qa/phase-2/).

---

### 3. Key Decisions & Rationales

- **Color Inversion vs. Independent Palettes**: Dark and light modes are independently designed rather than inverted. Dark mode uses deep pine/forest canvas (`#080F0B`) with emerald luminescence, while light mode uses tactile warm linen paper (`#F2F3EE`) with deep graphite text and forest green accents, preserving brand calm and editorial credibility.
- **Script-Specific Typography Tuning**: Non-Latin Indic scripts like Bengali degrade with negative tracking and tight line-heights. Enforcing normal letter spacing and $\ge 1.65$ line-height at the token level guarantees legibility in localized views.
- **Automated Color Enforcement in CI**: Instead of relying on manual code review, `scripts/check_colors.mjs` and the expanded `design_system_enforcement.test.mjs` automatically flag any future addition of ad-hoc hex classes or arbitrary spacing.

---

### 4. Next Step: Phase 3 (Layout, Navigation & Responsive Polish)

- **3.1 Navbar & Navigation Architecture**: Scalable, optimized navigation system with clean dropdowns, mobile drawer, search integration, and active route indicators.
- **3.2 Persistent Layout Polish**: Seamless page-to-page transitions with zero content jump or remount flicker.
- **3.3 Card & Layout Clipping Remediation**: Fix card cut-off/clipping bugs identified in baseline checklist by replacing destructive `overflow-hidden` with contained layout structures.
- **3.4 Footer Redesign**: Modern, comprehensive, and premium footer system with clear IA, language switcher, and live network status.
