# UI Overhaul Progress Tracker

This document tracks the progress, architectural decisions, verification results, and upcoming milestones for the comprehensive UI/UX, Design Language, and Performance Overhaul of CarbonOS.

---

## Current Status Overview
- **Active Branch**: `ui-overhaul`
- **Active Phase**: **Phase 0 (Preflight & Baseline) — COMPLETED**
- **Next Phase**: **Phase 1 (Architecture & Decomposition)**

---

## Phase 0: Preflight and Baseline

### 1. Work Completed
1. **Repository & Branch Management**:
   - Created and checked out active branch `ui-overhaul`.
   - Verified that `backend/db.sqlite3`, `backend/venv/`, and `.env` files across the repo root, `backend/`, and `inference/` are strictly gitignored and untracked.
2. **Database Sanity Check (Read-Only)**:
   - Executed `python backend/manage.py makemigrations --check --dry-run` and `showmigrations`.
   - **Schema Drift Report**: Confirmed that all existing migrations are applied (`admin`, `auth`, `contenttypes`, `farmers_ai`, `national_registry_bridge`, `sessions`). The dry-run check noted legacy 32-bit `AutoField` usage on four `farmers_ai` models (`AgronomistReview`, `CropImage`, `TreatmentRecommendation`, `WeatherRiskSnapshot`), which Django 3.2+ suggests upgrading to `BigAutoField`. Pursuant to instructions, **zero database modifications were made**.
3. **Access & Route Audit**:
   - Audited `src/App.jsx` and verified all 36 active routes.
   - Confirmed client-side routing with no blocking authentication walls preventing direct deep-linking or automated browser evaluation.
4. **Visual & Runtime Baseline Engine**:
   - Implemented automated Playwright audit runner in `scripts/run_playwright_baseline.mjs` using the local Chrome channel.
   - Visited **36 distinct routes** across **4 responsive breakpoints** (375px mobile, 768px tablet, 1024px landscape/small desktop, 1440px desktop) in both **Dark and Light modes**.
   - Captured and saved **288 visual baseline snapshots** in [`qa/before/`](file:///c:/projects/CarbonOS/qa/before/).
   - Generated the comprehensive baseline audit checklist in [`qa/baseline-report.md`](file:///c:/projects/CarbonOS/qa/baseline-report.md).
5. **Codebase Structural Inventory**:
   - Implemented `scripts/generate_inventory.mjs` and generated [`docs/inventory.md`](file:///c:/projects/CarbonOS/docs/inventory.md).
   - Mapped all 36 routes with components and responsibilities.
   - Identified 20 monolithic files > 400 lines (notably `CarbonMonitoring.jsx` at 5,707 lines and `SaaSDashboard.jsx` at 4,967 lines).
   - Cataloged near-duplicate components (4 modal shells, 6 repeated KPI tile implementations, 7 repeated section header patterns, ad-hoc data tables).
   - Mapped hardcoded color literals and identified excessive vertical spacing (`py-16` through `py-32` and unconstrained `min-h-screen`).
6. **Preflight Test & Verification Runs**:
   - **JS Test Suite**: 27 of 27 tests passing (`npm run test`).
   - **Python Test Suite**: 115 of 115 core tests passing (`python -m unittest tests.test_orchestrator tests.test_bd_grid tests.test_esg_accounting tests.test_esg_scope1 tests.test_carbon_security`).
   - **TypeScript / Lint Check**: Passed with 0 errors (`npm run lint`).
   - **Production Build**: Verified client bundle generation (`npx vite build`) with zero runtime errors.

---

### 2. Architectural Decisions & Key Findings
- **Card Clipping Root Causes**: The baseline revealed that ancestor `overflow: hidden` containers (e.g. wrapper sections and cards) are clipping outer card box-shadows, hover elevation translates, and borders across cards on mobile/tablet. Solution for Phase 3 will introduce shared `Grid` with `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` and remove destructive `overflow-hidden` wrappers.
- **Horizontal Overflow Hotspots**: Discovered horizontal page scroll on `/platform/esg` and `/carbon-monitoring` at 1024px because the desktop navbar (`hidden lg:flex`) renders at 1024px without adequate horizontal flex shrink or drawer fallback.
- **Monolith Decomposition Strategy**: `CarbonMonitoring.jsx` (5,707 lines) and `SaaSDashboard.jsx` (4,967 lines) account for ~10,700 lines of complex state. Phase 1 will decompose these into focused feature slices under `src/features/carbon-monitoring/` and `src/features/saas/` with shared hooks, reducing each file to < 300 lines.
- **Theme & Contrast Integrity**: CartoDB Positron and Dark Matter map layers toggle cleanly, but several pages leak hardcoded dark `#080F0B` styles when rendered under light mode. Semantic CSS tokens in Phase 2 will eliminate theme leakage.

---

### 3. Next Milestone: Phase 1 (Architecture & Elimination of Repetition)
- Set up target structure: `src/app/`, `src/components/ui/`, `src/components/layout/`, `src/features/`, `src/styles/`, `src/config/`.
- Introduce persistent layout shells (`MarketingLayout`, `DashboardLayout`) to prevent navbar/footer remounting on route transitions.
- Deconstruct the two giant monoliths (`CarbonMonitoring.jsx` and `SaaSDashboard.jsx`) into feature panels under `src/features/` (< 300 lines each) with shared hooks.
- Create unified UI primitives for `Card`, `SectionHeader`, `StatCard`, `DataTable`, `EmptyState`, `Modal`, `Drawer`, `Button`, `Badge`, `Tabs`, `Skeleton`.
- Implement route-level code splitting (`React.lazy` + `Suspense`) and delete dead code/unused exports.
