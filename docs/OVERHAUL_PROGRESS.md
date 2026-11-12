# UI Overhaul Progress Tracker

This document tracks the progress, architectural decisions, verification results, and upcoming milestones for the comprehensive UI/UX, Design Language, and Performance Overhaul of CarbonOS.

---

## Current Status Overview
- **Active Branch**: `ui-overhaul`
- **Completed Phases**:
  - **Phase 0 (Preflight & Baseline) — COMPLETED & COMMITTED (`8087796`)**
  - **Phase 1 (Architecture & Universal Primitives) — COMPLETED**
  - **Phase 1b (Verify, Adopt & Monolith Decomposition) — COMPLETED & VERIFIED**
- **Next Phase**: **Phase 2 (Design Language: Tokens, Spacing, Gradients & Effects)**

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

### 4. Next Step: Phase 2 (Design Language)
- **2.1 Semantic Tokens**: CSS variables for light & dark (tuned separately, never inverted), wire into `tailwind.config.js`. Restore brand fonts (`Instrument Sans`, `Cormorant Garamond`, `JetBrains Mono`).
- **2.2 Spacing Rhythm**: Replace arbitrary margins/paddings with tokens (4/8/12/16/24/32/48/64/96). Parent-controlled rhythm.
- **2.3 Hardcoded Color Migration**: Migrate hex/rgb literals to semantic tokens with `npm run check:colors` lint rule.
