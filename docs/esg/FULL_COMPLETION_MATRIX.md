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
| **Zero-Friction Demo Entry** | Evaluator / Visitor can test ESG SaaS without login/signup barriers | **VERIFIED** | `/platform/esg` (`EsgWorkspace.jsx`, `esgAuth.js`) | `POST /api/esg/demo/session`, `GET /api/esg/demo/status` | `ESGOrganization` (`is_demo=True`), `ESGMembership` | Synthetic Bangladesh Benchmark (East Delta University / Revoo EV / PolyJute Asia) | Ephemeral UUID tenant (`demo-<hex>`), server-minted 2h JWT; client tenant headers ignored | `tests/test_esg_demo_mode.py::test_demo_session_creation_and_seeding` (PASS) |
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
| **Emission Factor Registry** | Carbon Auditor validates emission factors with gazette provenance | **VERIFIED** | `/platform/esg` Factor Register | `GET/POST /api/esg/factors` | `EmissionFactor` (`gwp_basis`, `citation`, `version`, `effective_year`) | Bangladesh DoE Grid Factor Gazette 2023 (0.637 kgCO2e/kWh), DEFRA 2024 | Immutable versioning; two-person rule for custom factor approval | `tests/test_esg_authenticity.py` (PASS) |
| **Scope 1 Combustion Calculations** | Carbon Accountant computes direct stationary/mobile emissions | **VERIFIED** | `/platform/esg` Calculations Tab | `POST /api/esg/calculations/run` | `CalculationRun`, `CalculationLine` | Natural Gas (2.02 kgCO2e/m³), Diesel (2.68 kgCO2e/L) | Decimal arithmetic (no float rounding errors); trace formulas preserved | `tests/test_esg_engine.py` (PASS) |
| **Scope 2 Location vs Market Accounting** | Sustainability Director reports Scope 2 dual-reporting | **VERIFIED** | `/platform/esg` Emissions Tab | `POST /api/esg/calculations/run` | `CalculationLine` (`scope_2_method=LOCATION/MARKET`) | Location: Bangladesh Grid (0.637); Market: SREDA Solar net-metering | Distinguishes inventory emission from avoided generation credit | `tests/test_esg_engine.py` (PASS) |

---

### Wave C: Scope 3 Value Chain & Supplier Assessment

| Feature / Requirement | Persona & Value | Current State | Frontend Route / Component | Backend API Route | Data Model / Entities | Provenance / Fixture Type | Security & Tenant Scoping | Acceptance Test & Evidence |
|---|---|---|---|---|---|---|---|---|
| **Scope 3 15-Category Framework** | ESG Analyst evaluates upstream/downstream value chain | **VERIFIED** | `/platform/esg` Scope 3 Module | `GET /api/esg/scope3/categories`, `POST /api/esg/scope3/evaluate` | `ActivityRecord` (`scope=SCOPE_3`, `category=1..15`) | GLEC heavy-duty freight, WASA water extraction, textile waste | Missing data explicitly flagged as `DATA_GAP / NOT REPORTED`; no fake actuals | `tests/test_esg_accounting.py` (PASS) |
| **Internal Supplier Questionnaire & Ledger** | Procurement Officer manages supplier ESG questionnaires | **VERIFIED** | `/platform/esg` Suppliers Tab | `GET/POST /api/esg/suppliers`, `POST /api/esg/suppliers/{id}/responses` | `SupplierAssessment`, `SupplierLedgerEntry` | RMG spinning mill & packaging supplier benchmark templates | Internal manual/file intake only; remote unauthenticated submission disabled | `tests/test_esg_accounting.py` (PASS) |

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
| **Python Unit & Integration Tests** | All `tests/test_esg_*.py` must pass with 0 failures | **PASS** (85/85 tests passed, 1 skipped) | `python -m unittest discover -s tests -p "test_esg_*.py"` |
| **Tenant Isolation Suite** | Zero cross-tenant data leakage or citation exposure | **PASS** (4/4 tests passed) | `python -m unittest discover -s tests -p "test_tenant_isolation.py"` |
| **Orchestrator CLI Tests** | Workflow parser, DAG, gates, and packets remain intact | **PASS** (34/34 tests passed) | `python -m unittest discover -s tests -p "test_orchestrator.py"` |
| **Frontend Unit Tests** | Extractor regex & parsing unit tests | **PASS** (2/2 tests passed) | `npm test` |
| **Frontend Production Build** | TypeScript compilation & Vite bundle creation | **PASS** (exit code 0, 10.11s) | `npm run build` |
| **Orchestrator Doctor** | Environment and dependency lint check | **PASS** (0 lint issues) | `python -m orchestrator doctor` |
