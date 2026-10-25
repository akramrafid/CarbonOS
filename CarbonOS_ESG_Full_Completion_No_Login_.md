# CarbonOS ESG SaaS — COMPLETE THE FULL PRODUCT (NO VISIBLE LOGIN)
## Claude Code / Claude Agent — execution master prompt

**Repository:** https://github.com/akramrafid/CarbonOS  
**Worktree:** existing local clone `CarbonOS/`  
**Current working branch reported:** `esg/p0-security-baseline`  
**Scope:** **ESG SaaS ONLY**. Do not develop marketplace, national registry, farmers AI, satellite MRV, or other products.  
**Objective:** Complete the functional ESG SaaS as a coherent, testable, end-to-end system—not merely a prototype, a roadmap, or a polished showcase. Do **not** add a visible login/signup screen or select an external identity provider in this phase.

---

## 0. First read this: exact requirements and non-negotiable constraints

You are the acting staff/principal engineer, ESG domain engineer, QA lead, application security reviewer, product designer, database architect, and production-readiness lead. Work as an implementer, not only a planner. Read the actual repo and tests before modifying code. Do not blindly assume the following progress report is accurate; verify it against the working tree.

### Latest developer report to verify

The previous implementation session reported **8 local commits** on `esg/p0-security-baseline`, none pushed, adding:

- Organization setup, organization switching, email-verified invitations, seven roles.
- Legal entities, facilities, reporting periods, consolidation methods.
- Versioned emission-factor registry with sourced factors and second-person approval.
- Evidence-backed activity records, review, overlap detection, non-destructive corrections.
- Decimal-precision Scope 1/2 accounting with separate location- and market-based Scope 2.
- Locked, reproducible reports; revisions require a reason.
- Seventeen ESG metrics and evidence-gap tracking for GRI and IFRS S2.
- Audit logs, rate limits, safe spreadsheet exports.
- `/platform/esg` frontend, legacy demo banner.
- 77 backend tests on SQLite and PostgreSQL 16, 28 Playwright tests.
- OIDC integration designed but an identity provider has **not** been configured.
- **No emission factors are loaded**; calculation methodology and disclosure mapping have not had independent professional review.
- Missing: scanned document OCR, full PDF reports, Scope 3, supplier portal, background jobs, tested backups, Bangla translations, real staging CI verification.

Inspect the branch, commit log, migrations, installed dependencies, docs under `docs/esg/`, and `docs/esg/TEST_EVIDENCE.md`, `docs/esg/RELEASE_READINESS.md`. Establish what genuinely works and what remains.

### Explicit client/product constraints

1. **Do not build or show a login/signup/account password UI.** Do not require Supabase, Auth0, Cognito, Keycloak, Entra ID, or any identity-provider subscription to demonstrate the ESG SaaS.
2. **Do not reverse the prior P0 security work.** Never restore open tenant IDs, unauthenticated administrative endpoints, insecure uploads, or authorization bypasses to make the UI work.
3. **Enable direct entry to `/platform/esg` in a safe, isolated sandbox/demo configuration.** Users should be able to use all non-regulated ESG workflows with prepared sample data without creating an account.
4. **No public anonymous access to confidential company data.** If real company data are to be used before identity is integrated, use a private, network-restricted company installation, or explicitly stop and identify the security prerequisite. Browser-issued demo sessions are not equivalent to verifiable personal identity.
5. **Separate DEMO, STAGING, and PRODUCTION behavior and data.** Example invoices, demo factor records, seeded organizations, fictional user personas, and example outputs must be explicitly flagged as illustrative. No demo records in live client reports.
6. **Two-person segregation of duties cannot be honestly verified without distinct authenticated identities.** In demo mode, support a clearly labeled reviewer-persona simulation and test the workflow. For genuine approvals, preserve identity hooks and block attestation/assurance claims until a reliable identity mechanism is enabled.
7. **Do not invent emission factors, citations, approvals, audits, certifications, credit quantities, customer logos, revenue, emissions reductions, or scientific accuracy.** Provide seed fixtures explicitly labeled `DEMO / ILLUSTRATIVE` and make source provenance and limitations visible.
8. **Do not read, echo, or transmit secrets unnecessarily.** `.env` may contain real keys. Never print keys, copy them into frontend variables, commit them, or send real company documents to LLMs without explicit configuration/consent. Mock Gemini in tests; external calls off by default.
9. **Do not push, deploy, send email, rotate keys, change production infrastructure, or make destructive migrations without explicit approval.** Local safe implementation, testing, and meaningful commits are authorized for this task. Respect existing uncommitted changes.
10. **Do not touch unrelated modules** except an absolutely necessary, small and tested shared dependency change; document such exceptions.

### Outcome definition

The **ESG SaaS functional scope** should be complete and coherent, testable in the browser, deployable to a non-public staging environment when approved, and based on credible calculation practices. **True production readiness for confidential multi-user customer use remains gated on identity, access control deployment, domain review, qualified approval, operational readiness, and third-party integrations.** Explicitly report these gates; do not call them complete to satisfy the prompt.

---

## 1. Operation and workflow: never mistake a plan for implementation

Start with an evidence-based inventory and a **feature-to-test acceptance matrix**. Create or update `docs/esg/FULL_COMPLETION_MATRIX.md` and `docs/esg/IMPLEMENTATION_PROGRESS.md`.

For each feature list:
- User persona and business value.
- Current observed state: `VERIFIED`, `PARTIAL`, `DEMO_ONLY`, `MISSING`, `BLOCKED_EXTERNAL`, `NOT_TESTED`.
- Actual frontend route/component and backend API.
- Data model and migrations.
- Real source or explicit demonstration fixture.
- Security/tenant implications.
- Exact acceptance test.
- Priority and dependencies.
- Evidence: test command, output, and commit.

Prioritize in this order:

**Wave A:** Direct-access demo/isolated workspace, remove legacy misleading metrics, working CI, stable no-auth UX, consistent APIs, visible errors, verified data provenance.  
**Wave B:** Complete Scope 1/2 robustly, environmental/social/governance management and real report exports.  
**Wave C:** Scope 3 engine, supplier data workflows, multi-facility consolidation, evidence management and disclosure reporting.  
**Wave D:** Robust OCR/document pipelines, forecasting, goals, comparison dashboards, background jobs, localization and onboarding.  
**Wave E:** Regression/performance/security validation, migrations and recovery drills, deployment manifests, handoff documents.

Do not start new cosmetic sections until the current end-to-end journey is verified. Work in small batches, test, commit, then continue. Never misrepresent `NOT_TESTED` as passing.

---

## 2. Direct-entry ESG mode — NO LOGIN SCREEN, NO OPEN BACKEND

### Supported operating profiles

**`ESG_ACCESS_MODE=isolated_demo` (development and public *synthetic-only* demonstrations):**
- Visiting `/platform/esg` automatically provisions or retrieves a short-lived isolated demo workspace.
- Server creates a randomized, opaque, securely stored demo-session identifier (prefer Secure, HttpOnly, SameSite cookie over a token in localStorage).
- The server binds the temporary demo identity to one synthetic-only organization; never trust `tenant_id` from the browser.
- Issue/validate the appropriate short-lived server-side credentials internally, or adapt the current auth abstraction without exposing an anonymous organization-escalation route.
- Rate-limit workspace creation; expire and clean up abandoned workspaces; cap uploads, storage, computation, API/LLM costs and concurrent jobs.
- Exclude production client and real sensitive datasets; disable external email invites and production approval attestations in this mode.
- Display a persistent small **DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED** indication on sample-derived results and exports.
- Prevent SSRF, IDOR, CSRF, replay, session fixation and resource exhaustion; test anonymous visitor A cannot read visitor B's workspace.
- Demo reviewer roles may be simulated through explicit labeled personas, but must never be presented as independent verified human approvals.

**`ESG_ACCESS_MODE=private_single_tenant` (only a network-restricted, controlled installation):**
- Direct dashboard entry with a server-owned single organization context.
- Accessible only within an appropriate network/security perimeter, not as an open internet deployment with real company records.
- No role-specific human attestation claims without identity; clearly explain this limitation in reports.
- Retain authorization middleware and owner-managed service configuration.

**`ESG_ACCESS_MODE=oidc` (future production-compatible integration):**
- Preserve the existing OIDC implementation without forcing this phase to build login screens.
- No middleware disabling, production wildcard bypass, or “trust X-User-ID” shortcuts.

### Acceptance tests

- Brand-new browser opens `/platform/esg` without encountering 401 or login redirects in demo configuration.
- New isolated workspace works end-to-end without manual database operations.
- A second incognito browser cannot read or change the first session's data.
- Expired and modified sessions are rejected appropriately.
- Production deployment fails closed on unsafe auth-free configuration or open public access to private data.
- The existing Auth/OIDC backend tests remain passing.
- Admin/regulatory/financial state transitions are not exposed to demo principals.

---

## 3. Core domain model and high-integrity accounting

Complete or validate the existing schema (using reversible migrations):

- Organizations, legal entities, facilities, sites/meters/assets.
- Reporting periods, inventory boundaries, consolidation approaches: operational control, financial control, equity share.
- Ownership/consolidation percentages and effective date ranges.
- Activity categories, units, evidence, source documents, approved corrections, duplicate detection.
- Emission factors with original publication, geography, gas, GWP basis, effective dates, units, provenance and approval/version history.
- Calculation runs, trace lines, uncertainty/data-quality classification, excluded/missing activities, report revisions.
- Disclosure frameworks and edition/version; disclosure requirements and mappings.
- ESG metrics, targets, milestones, source evidence and approvals.
- Suppliers, submitted activity/factor evidence, supplier period/status and coverage.
- Jobs, exports, change events and immutable audit snapshots.

### Scientific/accounting integrity

- Use decimal arithmetic for measurements, factors, currency and output; specify rounding policies by boundary and report, not UI float arithmetic.
- Unit normalization must be dimensionally correct (kWh/MWh, m³, L, kg, tonne, therm, etc.). Fail on ambiguous units.
- Separate CO2, CH4, N2O and applicable other gases, CO2e and GWP version; prevent double-counting.
- Support biogenic emissions and removals as distinct line items where applicable, never an unexplained subtraction.
- Preserve original activity, original documents, factor versions and reproducible report snapshots.
- Distinguish emission inventory from avoided emissions, offsets, credits, and exported renewable generation.
- Missing factor, missing contractual instrument, low-confidence extraction or unsupported methodology must show `BLOCKED/NOT REPORTED/REVIEW REQUIRED`, never guessed values.
- Document calculation assumptions, boundaries, exclusion rules and sources. Add independent review checklist; never pretend practitioner sign-off occurred.

### Scope 1

Provide configured and verified calculation paths for applicable: stationary combustion, mobile combustion, refrigerants/fugitive emissions, process emissions. Show applicability restrictions and gas-specific factor treatment. Include test fixtures for realistic Bangladesh manufacturing scenarios with clearly sourced factors *where obtainable*; otherwise flag factor missing and allow manual sourced factor review.

### Scope 2

Separate location- and market-based totals. Implement contractual instrument quality/eligibility and residual mix logic where available; clearly report `Not available` where inputs are missing. No unexplained rooftop export netting. Respect the difference between kWh billing and generation/export records. Show full source-to-calculation trace.

### Scope 3

Implement an extensible GHG Protocol-aligned framework for all 15 categories, with explicit applicability status and progressively complete calculation methods. Prioritize typical manufacturing use cases: purchased goods and services; fuel/energy activities not in Scope 1/2; upstream/downstream transport; waste; business travel; employee commuting; capital goods; product end-of-life where applicable.

For every category:
- Expose applicable vs not applicable vs omitted vs lacking data.
- Choose supported activity-based or spend-based methods with declared quality, currency/time handling, factor specificity and assumptions.
- Disallow made-up factors and fake supplier actuals.
- Capture category-specific supporting documentation.
- Include boundary and allocation tests.
- Surface uncertainty and estimation hierarchy.
- Version calculations and report exclusions.

Deliver actual working priority Scope 3 categories first; document legitimately blocked categories and finish any feasible remaining categories without inventing underlying methods.

---

## 4. Real document-to-ledger-to-report workflow

The final product must support a complete browser journey:

`Create/Open Workspace → Add Facility/Period → Upload Invoice → Extract → Review & Correct → Link Meter and Activity → Validate → Choose Sourced Factor → Calculate → Review → Freeze Period → Generate PDF/Excel/CSV → Reopen & Revise With Reason`.

### Document intake

- PDF (digital and scanned), images, CSV/XLSX and structured manual entry.
- OCR adapter with local/offline option where feasible and explicit quality limitations; keep output page/image/source pointers.
- Detect duplicate file content and overlapping utility intervals.
- Recognize electricity, gas, diesel, LPG, water, waste and relevant activities with validated schemas.
- Capture start/end billing dates, meter number, units, usage, site, supplier and line item.
- Never commit OCR or LLM-extracted values without user review.
- Never fabricate numbers on parsing, OCR, Gemini or network failure.
- Make external LLM extraction opt-in, server-side only, with retention/privacy controls and cost ceilings. Tests must mock all external model calls.

### Reconciliation

- Show extracted vs source side by side; highlight confidence, uncertain fields and unit normalization.
- Preserve corrections with reviewer identity and timestamps (or demo persona label).
- Detect duplicates and overlapping meters in a single period across uploads.
- Prevent the same bill/line from posting to multiple accounting scopes without a documented allocation rule.
- Keep successful imports idempotent.

### Reports

Produce professional, actual server-generated:

1. Comprehensive ESG inventory PDF (professional branded print layout).
2. Carbon footprint Scope 1/2/3 PDF.
3. ESG environmental/social/governance metrics report.
4. Facility-level report.
5. Factor/version/source register and audit evidence package.
6. GRI / IFRS S1 or S2 evidence coverage report, with explicit gaps.
7. Excel workbook with structured data, formulas only where safe and appropriate, formatting, provenance and references.
8. CSV export with injection-safe escaped cells and stable schemas.

Reports must preserve figures/units/factor versions after locking, be reproducible byte-for-byte when required by existing contract, and state `NOT INDEPENDENTLY VERIFIED` unless verifiable review has truly occurred. Do not print 'ISO assured', 'certified', or 'fully compliant' merely because software generated a report.

---

## 5. Complete ESG: environmental, social, governance

Extend the current 17 metrics into a coherent, configurable, versioned ESG metric catalogue. Implement metrics suitable for business operations such as:

**Environmental:** Scope 1/2/3, energy consumption by source, renewable share (with correct accounting), water withdrawal/discharge/consumption, waste by type and diversion method, material resource consumption, environmental incidents (only aggregate if sensitive), reduction projects and targets.

**Social:** employee counts, workforce composition (aggregate-only), safety incident rate (with transparent denominator), lost-time incidents, training hours, worker turnover, grievance summaries and corrective actions, supplier social questionnaires, responsible sourcing and relevant policies.

**Governance:** board composition, committee oversight, ethics training, anti-corruption controls, compliance incidents, policies and control attestations, accountable owners, risk registers and follow-up tasks.

For each metric include: formula, unit, denominator, timeframe, organization/facility association, evidence, source, reviewer state, version, coverage and quality. Never collect unnecessary personally identifying workforce, health or sensitive employee records; use aggregate values and appropriate privacy controls.

Add configurable targets, baseline year, trajectories, actual progress, explanations of changes and alerts. Compute rollups from actual stored records, not frontend literals.

---

## 6. GRI / IFRS S1/S2 and disclosure evidence

- Build a versioned framework catalogue; store the exact standard/version and applicable reporting criteria.
- Add structured requirement mapping, evidence references, ownership, readiness state, missing data and review comments.
- Distinguish required, not applicable, not assessed and missing evidence.
- Generate traceable gap analysis and draft disclosures from approved data only.
- Allow document/citation navigation from every claimed number or statement.
- Do not misuse 'compliant' or 'assured' labels; professional determination is external.
- Confirm all standard references against current authoritative sources when internet access is available; otherwise explicitly mark standards review pending.
- Ensure GRI and IFRS S1/S2 concepts are mapped correctly rather than treated as interchangeable disclosure checkboxes.

---

## 7. Supplier workflows and Scope 3 data collection

Implement internal supplier management now, even without an external login experience:

- Supplier directory with ownership/contact metadata stored securely.
- Supplier categories, associated spend/products/services/transport and reporting coverage.
- Internal questionnaire builder using relevant activity requirements.
- Import supplier-provided CSV/XLSX/PDF responses manually into the dashboard.
- Review, approve/reject, request clarification in the *internal* workflow.
- Rank submissions by data quality and missing evidence rather than unsupported accuracy percentages.
- Roll applicable supplier data into Scope 3 with transparent allocation and duplication controls.
- Supplier-specific trend and hotspot reports.

If truly external authenticated supplier response collection is required, design adapters and UIs but label the actual remote submission flow BLOCKED_ON_IDENTITY until approved. **Never create a public unauthenticated endpoint accepting arbitrary confidential supplier files.**

---

## 8. Complete frontend experience

Build a consistent responsive product surface under `/platform/esg`:

- Overview and KPIs from real backend records.
- Organization/facility/reporting period context.
- Setup wizard / first-use checklist.
- Documents and OCR review.
- Activity ledger and reconciliation.
- Emission factor registry and source explorer.
- Scope 1/2/3 calculation & drill-down.
- ESG metrics collection.
- Suppliers and questionnaires.
- Targets, hotspots and scenarios.
- Disclosure evidence coverage.
- Review queue and evidence pack.
- Report generator/download history.
- Audit events and changes.
- Jobs/notifications and error states.
- Documentation, methodology and support entry points.

Preserve CarbonOS's brand while simplifying clutter. Use genuinely useful visualizations. Include accessible tables, search, pagination, filters, sorting, empty/loading/error/permission states, toast feedback and real form validation. Remove all false claims and arbitrary KPIs, including the known legacy '2,450 tCO2e' and '9.3 AI score' patterns in any live non-demo view.

### Localization

Add Bangla and English for all newly built ESG views. Keep translations centralized; verify unit symbols, numeral formatting and long-label layouts. Document any strings that cannot reasonably be localized in this phase.

### Accessibility and responsiveness

Aim for WCAG 2.2 AA. Verify keyboard flows, screen-reader names, focus states, color contrast, dialogs, tables, reduced motion and mobile usability. Test realistic 360, 390, 768, 1024, 1440 pixel viewports.

---

## 9. Operational architecture / real deployment capabilities

- PostgreSQL as the validated target database; SQLite only for appropriate local tests.
- Reproducible migrations, forward/rollback plans, fresh database bootstrap and fixture seeding.
- Server-side jobs for OCR, large imports, exports, recalculation and asynchronous tasks; bounded retries, state transitions and idempotency.
- Durable blob/object storage with tenant namespaces and signed/authorized download paths.
- Backup and restore scripts with a tested **restore drill** on a non-production database.
- Structured logs, request IDs, basic metrics, alerting hooks, health and readiness endpoints.
- Strict environment separation and missing-secret fail-closed behavior.
- Content-type and upload-size limits, antivirus/malware screening where feasible, file path containment, no frontend secrets.
- Resource budgets for OCR, AI inference and large reports.
- Pin dependencies and document upgrade policy.
- Production-like Docker compose or deployment manifests for staging; avoid inventing cloud resources or live deployment completion.
- Test network timeouts, failed jobs, retry limits, failed exports and service outages.
- Validate concurrent edits, double submission, locking races and safe correction workflows.

---

## 10. CI, automated quality, scientific review and security

Ensure CI actually runs against checked-in scripts rather than referring to missing commands.

**Required suites:**

- Lint / formatting / type checks where supported.
- Frontend build and UI tests.
- Unit tests for every supported emission-factor formula and unit conversion.
- Integration tests on **PostgreSQL 16** in clean migrations.
- Browser E2E tests on actual isolated demo mode.
- Cross-workspace access attempts and expired/forged demo session tests.
- Upload filename traversal, malicious PDF, CSV formula injection and zip-bomb/oversized upload tests.
- Background job and timeout tests.
- Statement-of-work acceptance workflows from actual sample files.
- Reports with testable stable totals, source traces and repeatability.
- Supplier double-counting and Scope 3 boundary tests.
- Audit log append-only and report revision tests.
- Backup restore verification.
- Synthetic sample data separation and production startup guard tests.
- Secret scanning of working tree; request authorization for history scans and secret revocation where needed.
- OWASP-focused review and dependency scanning where available.

Tests must never make real Gemini calls. Keep credentials out of test fixtures, logs and build artifacts.

**External review gate:** calculation methodologies, factor applicability, IFRS/GRI mapping, assurance statements and actual ESG reporting must be reviewed by a qualified practitioner before real company operational use. Add a precise review checklist and sign-off form, but never forge the sign-off.

---

## 11. Concrete acceptance demonstration to implement and automate

Using a fresh, isolated demo workspace and labeled illustrative data:

1. Navigate directly to `/platform/esg` in a clean browser — no login UI.
2. Create or open an automatically scoped organization.
3. Set legal entity, facility, reporting period and consolidation approach.
4. Upload one real-format *synthetic/sample* scanned electricity PDF and one fuel invoice.
5. Extract with OCR/parser, review source snippets and correct an intentional issue.
6. Import or select documented example factor entries with clearly marked status; test second-reviewer simulation label.
7. Approve sample activity records, reject an overlapping duplicate bill.
8. Calculate Scope 1 and Scope 2 location-based; show market-based `Not reported` when instruments are missing.
9. Add a supplier activity, compute a supported Scope 3 category, and flag missing data in other categories.
10. Enter water, waste, safety training and board governance aggregates; inspect ESG KPI calculations.
11. Open a GRI or IFRS S2 disclosure requirement; view evidence links and missing items.
12. Lock the reporting period in labeled demo-review mode, generate report and download PDF, XLSX and CSV.
13. Re-download fixed report and verify reproducibility; reopen with a reason and create a new revision.
14. Refresh the page; verify the demo session retains its own data and records; open an incognito session and confirm isolation.
15. Break the API/OCR service intentionally; confirm honest error states rather than invented results.
16. Execute automated Playwright checks for desktop, tablet and mobile, with screenshots/artifacts saved.

This scenario, plus CI and recovery evidence, is the **functional completeness gate**. A functional demo can pass it without claiming audited/certified production status.

---

## 12. Delivery rules and progress reporting

For **each batch**, report:

- What actually changed, including file paths.
- Data model/API changes and migrations.
- Functionality shown in the browser.
- Test commands and exact pass/fail output.
- Data integrity/security checks.
- Current commit SHA and working tree state.
- Known limitations and remaining implementation work.
- External dependencies, approvals and production gates.

Create/update:

- `docs/esg/FULL_COMPLETION_MATRIX.md`
- `docs/esg/IMPLEMENTATION_PROGRESS.md`
- `docs/esg/ACCOUNTING_METHODOLOGY.md`
- `docs/esg/FACTOR_SOURCE_REGISTER.md`
- `docs/esg/DEMO_MODE_SECURITY.md`
- `docs/esg/REPORTING_FRAMEWORK_MAPPING.md`
- `docs/esg/TEST_EVIDENCE.md`
- `docs/esg/RELEASE_READINESS.md`
- `docs/esg/DEPLOYMENT_AND_RECOVERY.md`
- `docs/esg/EXTERNAL_APPROVALS_REQUIRED.md`

Use verified commits only; no force push or production deployment. Do not modify non-ESG modules, unless necessary shared fixes are scoped and justified.

### Honest final verdict criteria

Maintain separate verdicts:

1. **ESG_FEATURE_COMPLETE** — all agreed business functions and exports work on realistic sample datasets.
2. **DEMO_READY** — browser journey and synthetic sandbox tests pass.
3. **PILOT_READY** — externally reviewed calculation method and factors, deployment controls and formal user/data protections exist.
4. **PRODUCTION_READY** — verified identity/access, privacy/operational requirements, qualified reviews, backups, monitoring, incident and recovery controls are satisfied.

`ESG_FEATURE_COMPLETE` and `DEMO_READY` **may be true** without visible login. `PILOT_READY` / `PRODUCTION_READY` for sensitive data must **not** be asserted while identity and associated security gates remain unresolved.

### Immediate commands to begin

1. Inspect branch, git status, recent commits and `docs/esg/` evidence.
2. Run the baseline backend and browser tests; inspect actual failures.
3. Build the feature matrix and verify every reported feature.
4. Implement safe loginless isolated demo entry without weakening API security.
5. Fix CI and remove unsourced legacy dashboard figures.
6. Complete the missing SaaS modules and report exports in dependency order.
7. Execute the full realistic acceptance demo and verified test suites.
8. Commit each coherent, tested increment and update progress docs.
9. Produce final feature-completeness report and explicit unresolved operational gates.

**DO THE WORK. DO NOT STOP AFTER THE AUDIT OR A PLAN. DO NOT MARK UNFINISHED FEATURES DONE. DO NOT FAKE CONFIDENCE, COMPANY DATA, SCIENTIFIC ACCURACY, APPROVALS, OR PRODUCTION READINESS.**
