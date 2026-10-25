# CarbonOS ESG SaaS — Production-Grade Transformation Prompt for Claude

> **Scope:** ONLY the Enterprise ESG SaaS / Sustainability Accounting / Reporting product inside `https://github.com/akramrafid/CarbonOS`. This is a repository implementation assignment, not a generic architecture essay.

## ROLE & OUTCOME

Act as a coordinated principal engineering team: SaaS architect, security engineer, senior React/TypeScript engineer, Django/FastAPI engineer, PostgreSQL/data architect, carbon accounting specialist, ESG disclosure specialist, document-AI engineer, SRE, accessibility-focused product designer, QA architect and technical writer.

**Mission:** Inspect the existing CarbonOS repository and incrementally ship a trustworthy, secure, multi-tenant, audit-ready ESG SaaS product that real organizations could pilot and eventually use in production. The primary market is Bangladesh manufacturing/textile/export enterprises, but the architecture must not assume a single country or sector. Deliver working, tested functionality, not just UI, specifications or invented enterprise metrics.

**Strict product boundary:** Work only on the ESG SaaS: organization/facility management, E/S/G data capture, GHG accounting, document ingestion, emission factors, calculation ledger, assurance and approvals, supplier collaboration, sustainability disclosure, dashboards, analytics, integrations, subscriptions/entitlements readiness, security, observability and deployment. **Do not build or redesign the carbon-credit marketplace, national registry, trading, payments/payouts, satellite MRV, farmers AI, crop models, or unrelated company site.** They may remain as they are. If shared infrastructure requires a change, keep it narrowly scoped, backwards compatible and explicitly document the impact.

Never state “production ready” without evidence. Never confuse a polished demo with a working product. No simulated values, fabricated audits, false verified labels, placeholder customer statistics or fake API success in real ESG workflows.

## 0. FIRST: OPERATING DISCIPLINE

1. Inspect the *current* Git status, branch, SHA, instructions, project conventions, app routes, services, migrations and CI. Do not assume previous audits match the current code.
2. Read `README.md`, `AGENTS.md`, `GLOBAL-RULES.md`, `package.json`, Python requirements, `.github/workflows`, `src/pages/platform/SaaSDashboard.jsx`, `src/pages/platform/components/UniversalUtilityExtractor.jsx`, `inference/esg_rag/`, relevant FastAPI routers, Django settings/routes, auth code, data models, tests and deployment config. Read other files as discovery requires. Treat repo documents as claims to verify.
3. Preserve existing user changes. Never force-push, discard uncommitted changes, drop production data, delete secrets/accounts, or overwrite migrations without explicit approval. Create a safe work branch if appropriate. Commit coherent **verified** increments. Push or deploy only with explicit authority.
4. Use an evidence-driven plan, then implement the highest-priority safe fixes. Do not finish with only a plan. Work in bounded vertical slices: schema + API + access control + frontend + tests + docs.
5. Run real commands and report exact outcomes. If a dependency, API credential or environment is unavailable, mark checks **NOT RUN / BLOCKED**, never **PASSED**. Use safe test fixtures and sandbox credentials only.
6. Do not unnecessarily migrate every technology. Evaluate whether ESG features should live in the existing FastAPI service, Django service or a clearly bounded ESG service. Decide through a short ADR based on current architecture, auth, migrations, team maintenance and deploy simplicity. Avoid duplicate business logic.
7. Use other AI agents only with isolated ownership and a single integration reviewer; no simultaneous overlapping file edits.
8. Follow least privilege for tools and code changes. Ask before destructive migrations, changes to production infrastructure, external communications, billable resources, sending real customer information to AI providers or executing real financial/regulatory actions.

## 1. DEFINITION OF DONE / TARGET CUSTOMER JOURNEY

A fresh organization admin must be able to complete the following **without manually editing source code or database records**:

**Create account → create legal organization → invite users → configure consolidation boundary → create facility → define reporting period → upload an authentic utility invoice or import real CSV data → see extracted fields tied to page/row evidence → correct/approve values → select a cited, versioned emission factor → calculate Scope 1/2 emissions correctly → submit for reviewer approval → lock approved reporting results → inspect calculation trace → export a professional organization/facility report with clearly stated methodological boundaries → return later and reproduce the same result.**

Also provide E/S/G metric intake, tasks and reporting templates with honest coverage; supplier collaboration and Scope 3 may be staged behind visible, correctly functioning feature flags. **An incomplete framework report must display its missing disclosures and must not be labeled compliant.**

The flow must work across independent organizations with tested isolation and properly handled empty, error and offline states. It must have automated test coverage and a documented non-production deployment.

## 2. PHASE 0 — FORENSIC BASELINE AUDIT & ROADMAP

Inspect every ESG screen, API, database object and external integration. Trace each displayed KPI to the source records and the calculation. Identify silent fallbacks, unguarded endpoints and hardcoded responses.

**Prior findings to re-verify, not blindly assume:**
- `SaaSDashboard.jsx` is extremely large and has example invoice/footprint fallbacks with high-looking confidence numbers.
- `UniversalUtilityExtractor.jsx` has client demo presets and simulated PDF analysis.
- `/api/esg/query`, `/api/esg/ingest` and footprint extraction were observed without proven user/tenant authorization; client-supplied tenant IDs are not proof of isolation.
- The RAG layer may treat generation as if audited; audit status and LLM confidence must be independently determined.
- Frontend quality CI references scripts not present in `package.json`.
- Django has been observed with insecure fallback development settings; determine which backend actually owns ESG authentication.
- Existing feature-heavy dashboards may not have a real accounting ledger, authentic approvals or end-to-end reporting journey.

Produce:
- `docs/esg/00-baseline.md` (SHA, commands and real results)
- `docs/esg/01-architecture-current.md` (C4-style services, routes, data flow)
- `docs/esg/02-security-threat-model.md`
- `docs/esg/03-feature-gap-matrix.md` (REAL / PARTIAL / DEMO / MISSING / BLOCKED)
- `docs/esg/04-phased-roadmap.md` (P0, P1, P2, dependencies, explicit acceptance)
- `docs/esg/05-api-contracts.md`
- `docs/esg/06-data-authenticity-register.md` (every known fake/estimated/simulated source)

Baseline build, lint, test, dependency checks and current local boot, where feasible. Record failures without editing unrelated modules just to turn dashboards green.

## 3. PHASE 1 — SECURITY, AUTH, TENANCY & TRUST (P0)

**Identity:** Adopt a robust, maintainable user authentication approach compatible with current architecture (well-maintained auth package / OIDC / managed auth if justified). Secure session/token handling, logout, account recovery where applicable, secure cookies, expiry/rotation, CSRF protection as needed, email verification where appropriate. Privileged accounts should support MFA.

**Organizations:** Model `Organization`, `Membership`, `Invitation`, `Role`, `Permission`, `Facility`, `LegalEntity`, `ReportingPeriod`, `OrganizationSettings`. Use stable IDs and soft-delete/archival semantics where necessary. Create least-privilege roles: platform operator, organization owner, ESG administrator, data contributor, facility manager, supplier collaborator, auditor/reviewer and read-only executive.

**Authorization:** Enforce **deny by default on every ESG endpoint**, including upload, RAG ingestion/retrieval, calculate, factor CRUD, report download, approvals, tenant settings and audit logs. Tenant ID must be derived from verified membership, never trusted from request JSON. Add resource-level access policies. Consider DB row-level security if worthwhile, but do not treat ORM filtering as untested protection. Prevent IDOR, cross-tenant vector search, unauthorized file access and unbounded exports. Limit privileged global admin operations and audit them.

**Secrets:** Remove live keys/tokens from client bundles; use validated server-side configuration, secret management, safe example env files, least-privilege external credentials and secret scanning. If credentials were committed, produce a **human rotation checklist**; deleting code alone does not revoke them.

**Threat controls:** Strict CORS versus actual auth; secure upload paths and filenames; type/size/content checks; malware scanning or quarantine path where practical; rate limiting; request timeouts; SQL safety; abuse/resource limits; encryption in transit, object storage access control, secure log redaction, backup privacy, documented retention/deletion. Review Django/FastAPI production settings, reverse proxy and cookies. Never expose system stack traces to users.

**Tests:** An unauthenticated request cannot create or alter ESG records. Tenant A cannot read, retrieve via AI, download or alter Tenant B's documents, emissions, factors, users or reports. A data contributor cannot self-approve their own work when separation of duties is required. Unauthorized users cannot invoke administrative report locks. Test both HTTP and storage-level boundaries.

## 4. PHASE 2 — ACCOUNTING DOMAIN & DATABASE DESIGN (P0/P1)

Use a well-defined domain model and migrations. Keep domain rules out of giant React components and route handlers.

**Recommended entities (adapt to existing schema):**
- `Organization`, `LegalEntity`, `Facility`, `FacilityOwnership`, `ConsolidationBoundary`, `ReportingPeriod`, `Membership`
- `SourceDocument`, `ExtractionRun`, `ExtractionField`, `ImportBatch`, `DataQualityIssue`
- `ActivityRecord` (facility, activity type, quantity, unit, period, source, evidence, entry method, quality status)
- `EmissionFactor` (source publisher, source URL/document, region, activity, GHG, unit, version, validity dates, method, approval)
- `GWPVersion` / global warming potential basis, where required
- `CalculationRun`, `CalculationLine`, `CalculationResult`, `MethodologyVersion`, `CalculationEvidence`
- `ESGMetricDefinition`, `MetricObservation`, `MetricTarget`, `MetricEvidence` (E, S and G)
- `Supplier`, `SupplierRequest`, `SupplierSubmission`, `SupplierEvidence`
- `ApprovalRequest`, `ReviewComment`, `EvidenceRequest`, `AuditEvent`, `ReportSnapshot`, `ExportJob`
- `DisclosureFramework`, `DisclosureRequirement`, `DisclosureMapping`, `DisclosureResponse`, `ApplicabilityDecision`

Use PostgreSQL with enforceable FK constraints, unique indexes, check constraints and clearly defined tenant-bound access. Normalize values into canonical units using tested conversions; use `Decimal` / fixed-precision storage for accounting values rather than uncontrolled floating-point arithmetic. Preserve both raw and normalized source values.

**Immutability:** Approved report snapshots must remain reproducible; factor updates must not mutate historic approved calculations. Implement versioned factors, calculation method versions, audit history and controlled restatements. Do not permit editing approved totals without creating a new revision. Track who/what/when/why of each state change.

**Boundary policy:** Support operational control, financial control and equity share as explicit choices. Treat organizational structure, facility ownership percentages, time validity and exclusions seriously. Report inclusion/exclusion and avoid double counting across entity roll-ups.

## 5. PHASE 3 — REAL GHG CALCULATION ENGINE (CORE PRODUCT)

Reference the **GHG Protocol Corporate Standard**, **Scope 2 Guidance**, and **Scope 3 Standard / Calculation Guidance**. Read authoritative and current material, track versions and applicability. Do not claim third-party certification or verification.

**Scope 1:** Stationary and mobile fuels (diesel, petrol, gas, LPG and appropriate regional fuels), refrigerant leakage, relevant industrial processes. Store fuel quantities, conversion and heating-value assumptions, gas-specific emission factors and CO₂e conversion basis where appropriate. Do not silently mix units or combine incompatible factors.

**Scope 2:** Electricity, acquired steam/heat/cooling as relevant. Implement location-based accounting and, where qualified market-based instruments exist, market-based reporting. Distinguish purchased electricity, on-site generation, electricity exports, RECs/EACs and avoided emissions. Never quietly subtract solar export or estimated avoided emissions from inventory Scope 2 totals. Show missing market-based inputs transparently; do not invent residual mix factors.

**Scope 3:** Model all 15 categories and applicability decisions, but implement a subset based on verified MVP needs. Prefer supplier-specific primary data when available; document estimation method, spend/quantity basis, uncertainty and data-quality tier. Never advertise full Scope 3 accounting because a few demo cards exist.

**Factor governance:** No uncited constant allowed to be treated as an authoritative current grid/fuel factor. Version sources, jurisdiction, units, date ranges, ownership, gases, GWP basis and licensing limitations. Allow admin-supplied factors with approval and clear custom labels. Distinguish measured values, estimates and unknowns. Do not fake Bangladesh-specific values when no official source can be validated.

**Pure calculation library:** Unit-tested deterministic functions/services, isolated from HTTP. Prevent accidental duplication of activities across meter readings/invoices. Include explicit rounding rules, units and aggregation semantics. Retain calculation formula and operands per line.

**Required numerical fixtures:**
- kWh × kgCO₂e/kWh correctly converts to tCO₂e.
- Multiple invoices for the same period do not accidentally double-count.
- Mixed unit inputs normalize correctly or fail validation.
- Emission-factor version change does not alter an approved historical report.
- Market- and location-based methods are reported separately.
- Approval and reporting-period locks work.
- Missing factors produce actionable data-quality exceptions, not made-up values.
- Biogenic emissions, offsets and avoided emissions cannot silently inflate/deflate corporate inventory totals.
- Multi-facility rollups respect the chosen organizational boundary.

## 6. PHASE 4 — DOCUMENT INGESTION, OCR & HUMAN REVIEW

Implement secure async upload of PDF, scans/images, CSV/XLSX and applicable formats. Add schema-based import mapping for customer spreadsheets. Use storage with object-level tenant ACLs; record SHA-256 and import provenance. Support retryable background extraction jobs with QUEUED/RUNNING/REVIEW_REQUIRED/APPROVED/FAILED states.

**Utility invoice extraction:** Provider, invoice number, billing dates, meter, address/facility, energy/fuel quantity, unit, currency, totals, line items and relevant notes. Return evidence link: source page, text span or bounding box. A confidence score is **extraction-model confidence only**, not regulatory verification.

**Human review:** Side-by-side source viewer and editable extracted fields; highlight uncertainty, duplicates, unsupported units and failed OCR. Users can correct, accept or reject before posting entries. Corrections carry actor/time and original value. Approved entries are committed via idempotent transactional API, not by a client-side success toast.

**No fake fallback:** When extraction fails, show an error and offer manual entry. Demonstration/sample invoices live in a visible, isolated demo workspace with non-production badges. Never return canned utility amounts under a real user's document ID.

**Data confidentiality:** Do not send customer invoices to Gemini or another provider without configured consent, processing terms and clear data-handling policy. Keep an option to use non-LLM extraction. Sanitize PDFs and protect against prompt-injection text masquerading as operational instructions.

## 7. PHASE 5 — FULL ESG OPERATING SYSTEM (NOT JUST CARBON)

### Environmental (E)
- Energy: source, quantity, renewable share, facility intensity and time series.
- Emissions: Scope 1/2; prioritized Scope 3; method and uncertainty breakdowns.
- Water: withdrawals, consumption, discharge, water source and site context.
- Waste: type, weight, hazardous status, treatment/recovery/disposal and documented sources.
- Air/pollutant and materials metrics as configurable modules when evidence supports them.
- Targets, baselines, owners, initiatives and progress with no automatic claims of verified reduction.

### Social (S)
- Headcount, turnover, gender/diversity metrics where lawful and context-appropriate, training hours, workplace safety incidents, lost-time rates with consistent denominators, grievance processes, supplier/labor standards.
- Access-controlled and privacy-preserving aggregated data; prevent exposure of individual medical or employee-sensitive details. Make sensitive categories optional and governed by jurisdiction and need.

### Governance (G)
- Board oversight, policy acknowledgment, ethics training, anti-bribery policies, incident registers, risk and control owners, internal audit findings and supplier governance.
- Evidence upload, deadlines, attestations and reviewer approval. Do not equate self-reported governance metrics with external certification.

### Materiality and framework mappings
- Configurable topic relevance, thresholds and materiality decisions, with management rationale and evidence.
- Support disclosure mappings to relevant **IFRS S1/S2**, **GRI**, applicable **ESRS** and **CDP** structures as versioned templates; verify the latest requirements, jurisdictional applicability, licensing and whether each disclosure is mandatory, voluntary or unsupported.
- Explicitly distinguish financial materiality versus impact/double materiality wherever the chosen framework requires it.
- Disclosures should have status: NOT_APPLICABLE / NOT_STARTED / MISSING_DATA / DRAFT / IN_REVIEW / APPROVED / PUBLISHED.
- Never claim a company is “compliant” solely because a report template exported successfully. Produce a gap report and appropriate disclaimer.

## 8. PHASE 6 — ENTERPRISE WORKFLOWS, SUPPLIERS & APPROVALS

- Organization → legal entity → facility ownership hierarchy.
- Reporting period opening/closing/locking and comparison against baseline.
- Role-scoped workspaces and invitations; explicit separation-of-duties rules.
- Data-owner tasks and reminders, evidence requests, reviewer comments, reassignment, resubmission and history.
- Supplier invitation and submission portal: tenant-isolated supplier records, data request versioning, supplier-specific factors and quality ratings based on explicit rules, not fake AI risk scores.
- KPI targets and initiatives with accountable owners, due dates, assumptions and evidence.
- Materiality and disclosure workflow with draft/review/approve/publish states.
- Executive dashboard: calculated totals, category breakdowns, trends, facilities, incomplete records, and method/factor coverage. Every tile has data freshness, unit, provenance and drill-down.
- Optional anomaly detection should explain thresholds and false-positive handling; AI can suggest anomalies but must not auto-approve data.
- Integration adapters for CSV/XLSX and future ERP/supplier APIs using documented typed contracts, retries, rate limits and sandbox fixtures.

## 9. PHASE 7 — REPORTING & ASSURANCE

Produce exportable facility, organization and period reports (PDF, Excel, CSV as justified), with:
- Reporting entity, dates and boundary policy.
- Quantities, units and location-based / market-based Scope 2 separation.
- Scope coverage and applicable Scope 3 categories.
- Factor/method version, calculation timestamps, evidence references and data quality.
- Exclusions, estimates, uncertainty, missing data and unresolved reviews.
- Historical period comparison and calculation reproducibility.
- Disclosure mappings with the status and supporting references for IFRS/GRI/etc.
- Documented preparer/reviewer approval, sign-off and immutable report snapshot.

A report labeled “audited” requires actual auditor engagement evidence and authorization. Built-in internal QA is **not external assurance**. Optional signatures/hashes must be real, tamper-evident and verified. Never construct a fake seal, certification logo or regulator endorsement.

Build a clean auditor/read-only evidence pack with restricted access and activity logs.

## 10. PHASE 8 — AI ESG COPILOT (GROUNDED, OPTIONAL)

Keep AI advisory, not the ultimate accounting authority. Build secure tenant-filtered hybrid retrieval (dense + lexical + optional rerank after evidence of value), document-level permission enforcement, source citations and an abstain path.

Copilot use cases:
- Explain calculation lineage and factor choice.
- Identify missing disclosure evidence.
- Draft supported narrative with citations.
- Summarize approved metrics and period changes.
- Suggest remediation tasks, never auto-approve regulatory submissions.

Prohibit hallucinated citations, fabricated audits, fabricated compliance status, unverified financial savings and prompts based on other tenants' content. Prevent uploaded document prompt injection. Version prompts and evaluate on independent cases with citation correctness, numerical accuracy, faithfulness, abstention, privacy and latency. If LLM service fails, show graceful unavailable state—not a fake verified answer.

## 11. PHASE 9 — WORLD-CLASS UI/UX, NOT A GENERIC DASHBOARD

Preserve the legitimate CarbonOS brand personality while making the app simpler, more consistent and measurably useful. Establish design tokens, reusable table/form/chart/map primitives, semantic states, loading/error/empty states, keyboard navigation, focus indicators and responsive layouts. Target WCAG 2.2 AA and test it; do not self-certify.

**Required user routes/screens (adapt names to app):**
1. Login, invitation, onboarding, organization switcher.
2. Organization settings, billing/entitlements display (no unapproved charge flows), members/RBAC.
3. Facilities and legal-entity hierarchy.
4. Reporting-period setup, boundary and standards selection.
5. Activity-data ledger (filters, date, status, source, inline drill-down).
6. Utility document upload → processing → reviewer → commit.
7. Emission-factor registry and provenance viewer.
8. Scope 1/2 calculation explorer and data-quality exceptions.
9. Environmental, Social, Governance metric collection screens.
10. Supplier tasks / evidence requests.
11. Audit/review inbox and evidence trail.
12. Executive overview, emissions trends, ESG target progression.
13. Framework disclosure coverage and gap explorer.
14. Report builder, approvals, exports and history.
15. Service integrations, jobs, error states, audit events.

Break down oversized `SaaSDashboard.jsx` into bounded components/features; avoid a destabilizing blanket rewrite. Use accessible charts with real empty states. Charts and KPIs must originate from typed backend responses, never hardcoded production-looking values. Consider server pagination and aggregation for large datasets. Provide Bangla/English localization architecture with accurate ESG terms and accessible date/number formatting where supported.

Performance: measure baseline and target Core Web Vitals, realistic mid-range Android, bundle size, heavy chart rendering, PDF upload responsiveness, API p95 and error rate. Provide reduced-motion support. Don't claim improvements without measurements.

## 12. PHASE 10 — PRODUCTION BACKEND, INFRASTRUCTURE & SRE

- Explicit dev/test/staging/prod environment profiles, validated startup config, no wildcard allowed hosts or debug mode in prod.
- Database migrations, backup/restore test, retention and deletion policy, transaction boundaries, concurrency locks and indexing.
- Reliable job queue for OCR, imports, report generation and long AI operations; idempotent jobs, retry/backoff/dead-letter handling.
- Secure object storage with expiring access and tenant-scoped download.
- Schema-first OpenAPI, typed frontend client, API versioning, consistent errors, request IDs, health/readiness endpoints.
- Structured redacted logs, traces, metrics, error tracking, alerts, operational runbooks and incident response.
- Safe Docker builds or existing hosting strategy; document exact deployment choice and cost.
- GitHub Actions CI: formatter/linter, type check, dependency/secret scanning, migrations check, unit/integration/contract/E2E tests, production build.
- Feature flags with demo/production segregation. No real external API claims without credentials and successful contract tests.
- SLO suggestions should be based on measurements and costs; set actual release targets before launch.
- Ensure new ESG changes do not break the other CarbonOS modules; run appropriate regression checks.

## 13. DATA PROTECTION & COMMERCIAL READINESS

- Privacy notice and terms accurately describe actual data flows, processors, retention and exports. Do not publish invented legal commitments.
- User data export, request-based deletion, tenant offboarding, organization archival, least-privilege staff access and documented customer support access.
- Data residency decisions must follow customer contracts and applicable law; make no unsupported compliance guarantees.
- Billing readiness can include plans, quotas, entitlements and usage meters, but **do not enable real subscriptions, charge cards or impersonate payment confirmation without permission and a provider integration**.
- Customer pilot readiness: demo/production distinction, onboarding checklist, customer-facing help, support tickets/contact flow and feedback capture.
- Produce a truthful public feature inventory, indicating READY / BETA / DEMO / PLANNED.

## 14. REGRESSION & ADVERSARIAL TESTS — MANDATORY

Write tests (not just test plans) for:
1. Unauthorized ESG create/update/export rejected.
2. Organization A cannot see Organization B's users, files, RAG content, reports, or factors.
3. A contributor cannot approve their own high-risk submission if policy requires dual control.
4. Missing document → no phantom footprint created.
5. Invalid invoice → clear review/error, no fake consumption.
6. Duplicate invoice → flagged or idempotently rejected, no double counting.
7. Invalid unit or factor mismatch → explicit validation failure.
8. Grid factor update → historical approved report unchanged.
9. Scope 2 market/location totals separate and correctly labeled.
10. Bad supplier data or unauthenticated upload → rejected.
11. RAG injection document cannot order the system to leak data or bypass workflow.
12. AI failure → no fabricated compliance success or numerical figures.
13. Post-approval modification → requires revision and retains full evidence/history.
14. Multiple legal entities consolidate according to chosen organizational boundary.
15. Missing disclosure → report explicitly indicates unavailable evidence, not “compliant”.
16. Concurrent approvals or duplicate import retries do not corrupt state.
17. A report exported twice from a locked snapshot is numerically identical.
18. On mobile, upload/review/export flows remain usable with keyboard and assistive technology where possible.

Use integration tests against the actual DB and API, and Playwright/Cypress end-to-end flows. Use deterministic fixtures and test credentials only. Include security-oriented negative test cases and record exact results.

## 15. ACCEPTANCE GATES & RELEASE CLASSIFICATION

**P0 Launch blockers:** Any exploitable cross-tenant/authorization failure, fake verified accounting result, missing trained model being treated as real ESG inference, leakage of customer documents, unrestricted ESG ingestion/export, wrong calculation units, mutable approved reports, missing traceability for key inventory totals or inability to reproduce a report.

**P1 Pilot essentials:** Real onboarding, facility and period management, secure ingestion, human review, verified Scope 1/2 calculation, factor sourcing, E/S/G metric records, explicit disclosure gaps, reviewer approval, exports, operating backup and minimum observability.

**P2 Expansion:** Broader Scope 3, suppliers, advanced framework templates, SSO/MFA expansion, scenario plans, sophisticated analytics, ERP adapters, multi-language refinements.

At each milestone classify **VERIFIED**, **PARTIAL**, **DEMO ONLY**, **BLOCKED**, **NOT STARTED**, with tests/commands and evidence. Do not use arbitrary 10/10 quality scores. Separate `CODE_COMPLETE` from `SECURITY_REVIEWED`, `METHODOLOGY_VALIDATED`, `CUSTOMER_PILOT_READY` and `PRODUCTION_APPROVED`. The last two require human/domain authorization.

## 16. REQUIRED DELIVERABLES & WORK LOG

Maintain, updating rather than recreating for every session:
- `docs/esg/ROADMAP.md`
- `docs/esg/ARCHITECTURE.md`
- `docs/esg/THREAT_MODEL.md`
- `docs/esg/DATA_MODEL.md`
- `docs/esg/ACCOUNTING_METHODOLOGY.md`
- `docs/esg/FACTOR_REGISTRY.md`
- `docs/esg/API_CONTRACTS.md`
- `docs/esg/DOCUMENT_AI_EVALUATION.md`
- `docs/esg/DISCLOSURE_FRAMEWORK_COVERAGE.md`
- `docs/esg/TEST_EVIDENCE.md`
- `docs/esg/RELEASE_READINESS.md`
- `docs/esg/PROGRESS.md`

For each batch provide: **Objective; baseline; files changed; data migrations; precise functionality; tests run with output; security/tenant impact; documentation; commit hash/branch; blocked dependencies; next slice**. Use conventional commits if aligned with repo rules. Never report a push unless you pushed with permission and verified it.

## 17. IMMEDIATE NEXT ACTION — START IMPLEMENTING, DO NOT JUST PLAN

1. Read all applicable repository instructions and inspect the actual ESG code paths and Git state.
2. Run baseline lint/build/tests, document exact status and current SHA.
3. Identify the most dangerous **ESG-specific** issue (likely authorization and demo/real-data conflation; verify).
4. Create the smallest complete P0 remediation slice with tests across affected backend/frontend boundaries.
5. Verify the change locally, commit it safely, and update ESG progress documents.
6. Continue down the P0/P1 dependency path, not into marketplace/farmer/satellite features. Stop for explicit authorization on risky production operations.

**The standard:** A new enterprise user can trust that every ESG number is derived from authorized real inputs, every conversion is explainable, every disclosure is appropriately qualified, every approval is recorded, every tenant is isolated, and every generated report is reproducible.

**No fake success. No invented compliance. No insecure tenant shortcuts. No code-only showcase. Build a real, defensible ESG SaaS.**

### Official standards references for verification
- GHG Protocol Standards & Guidance: https://ghgprotocol.org/standards-guidance
- GHG Protocol Scope 3 Standard: https://ghgprotocol.org/corporate-value-chain-scope-3-standard
- IFRS S1: https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s1-general-requirements/
- IFRS Sustainability standards introduction: https://www.ifrs.org/sustainability/knowledge-hub/introduction-to-issb-and-ifrs-sustainability-disclosure-standards/

Check current amendments, applicability, licensed source materials and jurisdiction-specific rules before claiming standards alignment.
