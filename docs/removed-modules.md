# Removed & Modularized Modules

Documenting components and modules removed or restructured as part of **Phase 1: Architecture (Kill Repetition)**.

---

## 1. Monolith Decompositions

### 1.1 `src/pages/platform/CarbonMonitoring.jsx`
- **Initial size**: 5,707 lines
- **Final size**: 122 lines
- **Reason**: Excessive cognitive load, monolithic mixing of GIS map layers, Verra VM0047 cryptographic audits, tiered drone verifications, STAC scene browsers, and settings.
- **Replacement**:
  - `src/features/carbon-monitoring/constants.js`: Extracted eco-zones, layer configs, default history.
  - `src/features/carbon-monitoring/useCarbonMonitoringState.js`: Isolated reactive state and API handlers.
  - `src/features/carbon-monitoring/components/BiomassOverviewPanel.jsx`: Executive overview.
  - `src/features/carbon-monitoring/components/VerraAuditPanel.jsx`: Cryptographic audit trail & Ed25519 key signing modal.
  - `src/features/carbon-monitoring/components/TieredVerificationPanel.jsx`: Verification queues & drone ground-truth modal.
  - `src/features/carbon-monitoring/components/GisMapPanel.jsx`: Interactive Leaflet map & coordinate controls.
  - `src/features/carbon-monitoring/components/SatelliteScenePanel.jsx`: STAC Sentinel scene browser.
  - `src/features/carbon-monitoring/components/ReportsPanel.jsx`: Audit readiness reports.
  - `src/features/carbon-monitoring/components/AlertsPanel.jsx`: Forest loss & fire alert console.
  - `src/features/carbon-monitoring/components/SettingsPanel.jsx`: Model threshold tuning sliders.

### 1.2 `src/pages/platform/SaaSDashboard.jsx`
- **Initial size**: 4,967 lines
- **Final size**: 148 lines
- **Reason**: Monolithic enterprise suite containing internal duplicate sidebars, duplicate top navbars, 9-category footprint calculations, RAG chatbot, and multiple modals in one file.
- **Removed Duplicate Elements**:
  - Hardcoded internal sidebar (lines 1350-1550) — replaced by persistent `DashboardLayout` sidebar.
  - Hardcoded internal top search bar (lines 1700-1835) — replaced by persistent `DashboardLayout` header.
- **Modularized Feature Panels**:
  - `src/features/saas/constants.jsx`: Gauge, spline paths, charts, Bangladesh districts, and 9-category invoice calculators.
  - `src/features/saas/useSaaSDashboardState.js`: All multi-tenant client profile states, inputs, emissions equations.
  - `src/features/saas/components/ExecutiveOverviewPanel.jsx`: Core KPI overview and emissions trends.
  - `src/features/saas/components/MaterialityPanel.jsx`: CSRD/ESRS double-materiality matrix.
  - `src/features/saas/components/TasksPanel.jsx`: Verification tasks checklist.
  - `src/features/saas/components/EsgCalendarPanel.jsx`: Filing deadlines and compliance calendar.
  - `src/features/saas/components/EsgAnalyticsPanel.jsx`: Scope 1/2/3 intensity analytics.
  - `src/features/saas/components/EsgTeamPanel.jsx`: Multi-user team management.
  - `src/features/saas/components/EsgSettingsPanel.jsx`: Emission factors and baseline configuration.
  - `src/features/saas/components/EsgHelpPanel.jsx`: GHG Protocol FAQ.
  - `src/features/saas/components/CorporateClientModal.jsx`: Workspace tenant selector.
  - `src/features/saas/components/AddProjectModal.jsx`: Project creation modal.
  - `src/features/saas/components/AddMemberModal.jsx`: Team invitation modal.

---

## 2. Universal UI Primitives Library Created
Consolidated ad-hoc styling across pages into unified primitives in `src/components/ui/`:
- `Button.jsx`: Strict variant and height scales (`sm` 32px, `md` 40px, `lg` 48px), $\ge 44$px touch targets on mobile.
- `IconButton.jsx`: Mandatory `aria-label`, $\ge 44$px hit area.
- `Input.jsx`: Harmonized height and radius with Button, unified focus-visible ring.
- `PageHeader.jsx`: Semantic header enforcing exactly 1 `<h1>` per page and at most 1 primary button.
- `Card.jsx`: Semantic surface tokens, no arbitrary overflow-hidden clipping.
- `Section.jsx` & `SectionHeader.jsx`: Parent-controlled spacing rhythm.
- `StatCard.jsx`: Tabular-nums and monospace numerals for quantitative telemetry.
- `DataTable.jsx`: Responsive touch-pan-x scrolling with sticky headers.
- `Tabs.jsx`: WAI-ARIA compliant tab list with keyboard navigation.
- `Badge.jsx`: 90% neutral discipline with semantic status accents.
- `Modal.jsx` & `Drawer.jsx`: Focus-trapped dialogs with escape key dismissal.
- `Dropdown.jsx` & `Tooltip.jsx`: Accessible overlays with keyboard and click-outside handling.
- `Toast.jsx`: Universal aria-live status alerts.
- `DevGridOverlay.jsx`: 12-column grid and 4px baseline rhythm overlay toggled via `G` key in dev.

