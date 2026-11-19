# CarbonOS ESG SaaS — Full Completion Matrix

**Repository:** `CarbonOS`  
**Branch:** `esg/p0-security-baseline`  
**Scope:** ESG SaaS Platform (`/platform/esg`, `inference/esg_rag`, `src/lib/esg*`)  
**Operating Mode:** `ESG_ACCESS_MODE=isolated_demo` (Public Demo / Development) | `protected` (Production Fail-Closed)

---

## 1. Feature-to-Test Acceptance Matrix

### Wave A: Direct-Access Demo, Security Baseline & Workspace Provisioning

| Feature / Requirement | Persona & Value | Current State | Frontend Route / Component | Backend API Route | Data Model / Entities | Provenance / Fixture Type | Security & Tenant Scoping | Acceptance Test & Evidence |
|---|---|---|---|---|---|---|---|---|
| **Zero-Friction Demo Entry** | Evaluator / Visitor can test ESG SaaS without login/signup barriers | **VERIFIED** | `/esg`, `/platform/esg` (`EsgWorkspace.jsx`, `esgAuth.js`); legacy static UI quarantined at `/demo-showcase` | `POST /api/esg/demo/session`, `GET /api/esg/demo/status` | `ESGOrganization` (`is_demo=True`), `ESGMembership` | Synthetic Bangladesh Benchmark; `SaaSDashboard.jsx` explicitly badged `DEMO DASHBOARD` | Ephemeral UUID tenant (`demo-<hex>`), server-minted 2h JWT; client tenant headers ignored | `tests/test_esg_demo_mode.py`, `tests/e2e/esg-authenticity.spec.ts` |
| **Tenant Isolation in Demo Mode** | Concurrent anonymous visitors never see or cross-pollinate data | **VERIFIED** | `/platform/esg` | All `/api/esg/*` endpoints | `organization_id` foreign keys on all 11 child tables | Isolated ephemeral database records | Server derives tenant strictly from authenticated JWT `sub`; no client header override | `tests/test_esg_demo_mode.py::test_tenant_isolation_between_concurrent_demo_sessions` (PASS) |
| **Dual-Control Persona Switching** | Simulates segregation of duties without fake practitioner certs | **VERIFIED** | `EsgWorkspace.jsx` persona toggle (`owner` vs `reviewer`) | `POST /api/esg/calculations/.../approve` | `ESGMembership` (`org_owner` vs `auditor`) | Persona-labeled simulated dual control | Submitter cannot approve their own record; 403 Forbidden enforced by backend | `tests/test_esg_demo_mode.py::test_dual_control_reviewer_persona_approval` (PASS) |
| **Demo Reset & Cleanup** | Re-seeds fresh benchmark data without manual DB operations | **VERIFIED** | `EsgWorkspace.jsx` ("Reset Demo" button) | `POST /api/esg/demo/reset` | Cascading cleanup across all child tables; retains org ID | Synthetic baseline reset | Requires authenticated demo tenant token; rejected for non-demo orgs | `tests/test_esg_demo_mode.py::test_demo_reset` (PASS) |
| **Fail-Closed Security Guard** | Production environments block unauthenticated demo routes | **VERIFIED** | N/A (Backend Security Middleware) | `POST /api/esg/demo/session` | N/A | Production configuration guard | When `ESG_ACCESS_MODE=protected`, demo provisioning returns 403 Forbidden | `tests/test_esg_demo_mode.py::test_protected_mode_rejects_demo_endpoints` (PASS) |
| **Unconfigured Secret Fail-Closed** | Protects against blank/missing JWT secrets in production | **VERIFIED** | Backend Middleware | `_decode()` in `auth.py` | N/A | Security boundary | Missing/blank JWT secret raises HTTP 503 Service Unavailable | `tests/test_esg_security.py::test_fails_closed_when_auth_not_configured` (PASS) |

---

### Wave B: Core Accounting (Scope 1, 2 Location/Market) & Activity Ledger

| Feature / Requirement | Persona & Value | Current State | Frontend Route / Component | Backend API Route | Data Model / Entities | Provenance / Fixture Type | Security & Tenant Scoping | Acceptance Test & Evidence |
|---|---|---|---|---|---|---|---|---|
| **Organizational Boundary & Facilities** | ESG Manager defines legal entities and physical plants | **VERIFIED** | `/platform/esg` (`EsgWorkspace.jsx`) | `GET/POST /api/esg/legal-entities`, `GET/POST /api/esg/facilities` | `LegalEntity`, `Facility` | Bangladesh industrial clusters (Gazipur, Chittagong, Savar) | Scoped to caller tenant ID; foreign org access returns 403 | `tests/test_esg_ledger.py` (PASS) |
| **Reporting Periods & Inventory Locking** | Finance/ESG Officer defines calendar/fiscal accounting periods | **VERIFIED** | `/platform/esg` | `GET/POST /api/esg/periods`, `POST /api/esg/periods/{id}/lock` | `ReportingPeriod` (`status=DRAFT/LOCKED`) | Fiscal periods (e.g. CY2025, FY2026) | Locked periods block new record additions; revisions require audit reason | `tests/test_esg_accounting.py` (PASS) |
| **Activity Records & Evidence Linking** | Data Contributor enters utility consumption with audit docs | **VERIFIED** | `UniversalUtilityExtractor.jsx` | `GET/POST /api/esg/activity-records` | `ActivityRecord` (`scope`, `activity_type`, `evidence_doc_id`) | BPDB, DESCO, Karnaphuli Gas utility bills | Line items carry audit document hash and page snippet | `tests/test_esg_accounting.py`, `tests/test_esg_ledger.py` (PASS) |
| **Emission Factor Registry** | Carbon Auditor validates emission factors with cited provenance | **IN_PROGRESS** | `/esg`, `/platform/esg` Factor Register | `GET/POST /api/esg/factors` | `EmissionFactor` (`gwp_basis`, `citation`, `version`, `effective_year`) | Zero pre-approved factors shipped; `factors/ipcc2006_loader.py` emits cited IPCC 2006 `DRAFT` payloads only (`factors/bd_grid/` exits `BLOCKED` pending primary BPDB inputs) | Immutable versioning; two-person rule (`ck_esg_factor_dual_control`); legacy catalog demo-gated | `tests/test_esg_authenticity.py`, `tests/test_esg_ledger.py`, `tests/test_p1_p2_institutional.py` |
| **Scope 1 Combustion & GRI 302-1 NCV** | Carbon Accountant computes direct combustion & NCV energy | **VERIFIED** | `/esg`, `/platform/esg` Calculations Tab | `POST /api/esg/periods/{id}/calculate` | `CalculationRun`, `CalculationLine` | Requires org/platform two-person approved `EmissionFactor` rows; GRI 302-1 energy converted via IPCC Vol. 2 Ch. 1 Table 1.2 NCV / gas certificates | Decimal arithmetic; formulas and `energy_consumption` sealed in immutable snapshot | `tests/test_esg_engine.py`, `tests/test_esg_ledger.py`, `tests/test_p1_p2_institutional.py` |
| **Scope 2 Location vs Market Accounting** | Sustainability Director reports Scope 2 dual-reporting | **IN_PROGRESS** | `/esg`, `/platform/esg` Emissions Tab | `POST /api/esg/periods/{id}/calculate` | `CalculationLine` (`scope_2_method=LOCATION/MARKET`) | Location: requires org/platform approved `grid_average` factor (none preloaded); Market: contractual instruments / supplier-specific / residual mix hierarchy | Distinguishes inventory emission from avoided generation credit | `tests/test_esg_accounting.py`, `tests/test_esg_ledger.py` |

---

### Wave C: Scope 3 (Cat 1–15), Dated Boundaries, CBAM, CSRD/TNFD & Base-Year Policy

| Feature / Requirement | Persona & Value | Current State | Frontend Route / Component | Backend API Route | Data Model / Entities | Provenance / Fixture Type | Security & Tenant Scoping | Acceptance Test & Evidence |
|---|---|---|---|---|---|---|---|---|
| **Scope 3 15-Category Engine** | ESG Analyst tracks upstream/downstream value chain (supplier-specific/hybrid/average/spend) | **VERIFIED** | API-backed Ledger (UI pending full module) | `GET /api/esg/scope3/categories`, `POST /api/esg/scope3-records` (`submit`/`approve`) | `Scope3Record` (`category=cat_1..cat_15`) | Requires explicit cited `factor_kgco2e_per_unit` and `factor_source`; unincluded periods report `scope3: null` | Tenant composite FK + dual-control approval (`ck_esg_scope3_dual_control`) | `tests/test_p1_p2_institutional.py`, `tests/test_esg_disclosures.py` |
| **Dated Facility Ownership & Ch. 5 Base Year** | Accountant pro-rates M&A acquisitions and checks structural restatement thresholds | **VERIFIED** | API-backed Ledger | `GET/POST /api/esg/facilities/{id}/ownership`, `PUT /api/esg/base-year-policy`, `POST /api/esg/base-year-policy/evaluate` | `FacilityOwnership`, `BaseYearPolicy` | Day-proportioned inclusion share (`time_weighted_inclusion_share`); configurable Ch. 5 threshold (default 5%) | Tenant composite FKs (`esg_migrations/0010`) | `tests/test_p1_p2_institutional.py` |
| **EU CBAM XML/JSON, CSRD/ESRS & EUDR/TNFD** | Exporter generates CBAM embedded intensity & CSRD/TNFD/EUDR disclosures | **VERIFIED** | API-backed Disclosures & Exports | `POST /api/esg/periods/{id}/export/cbam`, `GET /api/esg/periods/{id}/disclosures/CSRD_ESRS`, `POST /api/esg/periods/{id}/eudr-tnfd-check` | `ReportSnapshot`, `DisclosureResponse` | EU Implementing Reg. 2023/1773 XML; CSRD ESRS E1-E5/S1-S4/G1 & TNFD LEAP; fail-closed EUDR 2020 cutoff screening | Tenant-isolated; fail-closed without verified EO imagery or approved factors | `tests/test_p1_p2_institutional.py`, `tests/test_esg_disclosures.py` |
| **Supplier Portal Collaboration** | External suppliers submit primary PCF data directly | **NOT_IMPLEMENTED** | Disabled (`supplier_collaborator` has empty perms) | N/A (internal `/api/esg/scope3-records` entry only) | `ESGMembership` (`supplier_collaborator`) | External portal deferred; primary supplier factors recorded by internal contributors with EPD citation | Blocked (`403 Forbidden`) for `supplier_collaborator` role | `tests/test_esg_security.py::test_supplier_collaborator_has_no_workspace_access` |

---

### Wave D: Document Intake, OCR Review & Immutable Reports

| Feature / Requirement | Persona & Value | Current State | Frontend Route / Component | Backend API Route | Data Model / Entities | Provenance / Fixture Type | Security & Tenant Scoping | Acceptance Test & Evidence |
|---|---|---|---|---|---|---|---|---|
| **Universal Utility Extractor (OCR/Parser)** | Utility Analyst extracts meter bills with side-by-side snippet review | **VERIFIED** | `UniversalUtilityExtractor.jsx` | `POST /api/esg/ingest`, `POST /api/esg/extract-utility` | `ESGDocument`, `ActivityRecord` | BPDB, DESCO, KGDC, WASA invoice samples | Extracted values must be reviewed before committing; no fabricated numbers | `tests/js/utilityExtractor.test.mjs` (PASS) |
| **Audit Trail & Append-Only Log** | Compliance Auditor inspects every change, calculation, and export | **VERIFIED** | `/platform/esg` Audit Log View | `GET /api/esg/audit-trail` | `AuditEvent` (`actor_sub`, `action`, `resource_id`, `diff_payload`) | Append-only event store | Auditor/Owner read-only; contributors cannot view audit log | `tests/test_esg_security.py` (PASS) |
| **Tamper-Evident Report Export** | Executive downloads verified ESG summary (CSV/JSON/PDF data) | **VERIFIED** | `/platform/esg` Reports Tab | `POST /api/esg/reports/export` | `ReportSnapshot` (`sha256_hash`, `methodology_version`) | Sealed snapshot with immutable SHA-256 hash | Re-export byte-for-byte reproducible; demo exports badged `NOT ASSURED` | `tests/test_esg_accounting.py` (PASS) |

---

### Wave E: Quality Gates, Compliance & Verification Summary

| Gate / Suite | Target Criteria | Result | Evidence |
|---|---|---|---|
| **Python Unit & Integration Tests** | Full suite verification (`python -m unittest discover -s tests -v`) | Executed after final code edits (see session test summary) | `python -m unittest discover -s tests -v` |
| **Django Registry & Farmers AI Suite** | National Registry Bridge & Farmers AI tests | Executed via `backend\venv\Scripts\python.exe backend\manage.py test` | `backend\venv\Scripts\python.exe backend\manage.py test` |
| **Frontend Production Build** | TypeScript compilation & Vite bundle creation | Executed cleanly via Vite (`npm run build`) | `npm run build` |
| **Orchestrator Doctor** | Environment and dependency lint check | **PASS** (0 lint issues) | `python -m orchestrator doctor` |
