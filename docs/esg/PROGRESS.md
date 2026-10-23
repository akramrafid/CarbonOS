# ESG Progress Log

Status vocabulary: VERIFIED · PARTIAL · DEMO ONLY · BLOCKED · NOT STARTED.
`CODE_COMPLETE` ≠ `SECURITY_REVIEWED` ≠ `METHODOLOGY_VALIDATED` ≠ `CUSTOMER_PILOT_READY` ≠
`PRODUCTION_APPROVED`; the last two need human/domain sign-off and none are claimed.

---

## Batch 1 — Phase 0 baseline + P0-1 auth & tenancy (branch `esg/p0-security-baseline`)

**Objective.** Establish a measured baseline and close the most dangerous ESG issue: unauthenticated,
client-chosen-tenant access to every `/api/esg` route, plus arbitrary file write via upload names.

**Baseline.** SHA `141e7b5`. See [00-baseline.md](00-baseline.md): build passes; `lint`/`test`
npm scripts missing (CI cannot pass); 6 dMRV tests not runnable without torch/joblib (out of scope).

**Files changed.**
- `inference/esg_rag/auth.py` (new) — JWT verification (JWKS or HS256, fail closed), membership-derived tenant, role permissions.
- `inference/esg_rag/models.py` — `esg_organization`, `esg_membership` (unique org+user, role check constraint); `verified_by_audit` defaults False.
- `inference/esg_rag/router.py` — every route except `/health` behind `require(...)`; tenant from principal; org create/list endpoints; global-corpus writes restricted to operators; bounded upload reads.
- `inference/esg_rag/ingest.py` — filename sanitising, extension allow-list, size cap, hash-named storage under `uploads/<tenant>/`, containment check, corpus allow-list, per-tenant duplicate detection; returns pages so callers never rebuild paths.
- `inference/esg_rag/schemas.py` — `OrganizationCreate`; `QueryRequest` loses `tenant_id`, gains bounds; `IngestResponse.duplicate`.
- `tests/test_esg_security.py` (new, 13 tests); `.gitignore`; `inference/requirements.txt` (+PyJWT).
- `docs/esg/00…06`, this file.

**Data migrations.** New tables only (`create_all`). Existing `default_tenant` rows become
unreachable through the API (no organization has that id) — intended; they were sample data.

**Tests run.**
```
.venv-esg/bin/python -m unittest tests.test_esg_security tests.test_esg_engine
Ran 19 tests … OK
python3 -m unittest tests.test_orchestrator → Ran 34 tests … OK
```

**Security/tenant impact.** Closes T1–T4 and partially T5/T11 (see threat model). The frontend has
no sign-in yet, so live ESG API calls from the SPA now return 401 until P0-4 (IdP) lands.

**Status.** P0-1: CODE_COMPLETE, tests VERIFIED locally. Not SECURITY_REVIEWED by an independent reviewer.

**Blocked.** P0-4 login UI — needs the identity-provider decision.

**Next slice.** P0-2 data authenticity (remove fabricated fallbacks server + client).

---

## Batch 2 — P0-2 data authenticity (branch `esg/p0-security-baseline`)

**Objective.** No ESG workflow returns invented values or self-awarded "verified/audited" labels.

**Files changed.**
- `inference/esg_rag/router.py` — `/extract-footprint` returns 422 on missing/unreadable/empty input; the invented 9-category footprint, `audit_seal`, constant trend and sample-text fallbacks are gone; extraction log never marked verified; `/entity-tree` and `/satellite-insets` demo-org only and labelled `DEMO_SAMPLE`.
- `inference/esg_rag/extractor.py` — regex "standard verified baseline" removed; rule matches carry `confidence: null`; LLM extraction behind `ESG_LLM_EXTRACTION_ENABLED`; utility segment detector reports only matched lines, drops invented meter IDs/invoice metadata/tariff costs, excludes solar export/kVA/kVARh from totals, fixes "Peak" matching inside "Off-Peak" (double count).
- `inference/esg_rag/ingest.py` — parse failures return no pages (no raw-byte or error-text indexing); `.doc` dropped (unsupported).
- `inference/esg_rag/generator.py` — fallback labelled "retrieval-only … not a generated or verified answer"; prompt forbids claiming verification.
- `inference/esg_rag/schemas.py` — `ExtractionResponse` reshaped (`review_status`, `extraction_method`, optional confidence).
- `src/lib/esgApi.js` (new) — bearer-token client; never sends a tenant id; errors surface as messages.
- `src/lib/esgDocumentExtractor.js` — removed electricity 18,640 and Dexterity-baseline fallbacks, invented confidences and assurance labels.
- `src/pages/platform/SaaSDashboard.jsx` — extraction/RAG/factor-sync use `esgFetch`; failures show errors and leave inputs for manual entry; demo sample labelled; "AUDIT VERIFIED" badge, "Audit Traceable Response", default 95 % confidence and 320 ms latency removed; review banner on the metrics step.
- `tests/esg_harness.py` (new shared harness), `tests/test_esg_authenticity.py` (new, 10 tests), `tests/test_esg_engine.py` (old segment test asserting the audit seal replaced by the new suite).
- `scripts/esg-browser-check.mjs` (new) — headless browser check of upload failure, demo labelling, RAG unavailable state, console errors.

**Tests run.**
```
.venv-esg/bin/python -m unittest discover -s tests -p "test_esg*.py"   → Ran 28 tests … OK
python3 -m unittest tests.test_orchestrator                            → Ran 34 tests … OK
npm run build                                                          → exit 0
node scripts/esg-browser-check.mjs (vite dev on :5199)                 → all checks true, 0 console errors, exit 0
```
Playwright MCP could not run (Chrome not installed); the puppeteer check above is the browser evidence.
HawkScan DAST: NOT RUN (no running API and no `HAWK_API_KEY`).

**Still fabricated (open, see register A9–A14, A22–A25).** Dashboard overview KPIs (2,450 tCO2e, "9.3 AI score",
"Audited against ISO 14064-1"), the client category matrix, factor catalogue citations, the `/duckdb-calculate`
engine and the studio components. These need the P1 ledger + calculation engine to replace them, not relabelling.

**Status.** P0-2: CODE_COMPLETE for API and extraction/RAG paths; PARTIAL for the dashboard as a whole.

**Next slice.** P0-3 CI (add `test` script + Python ESG job so the workflow can pass), then P1 domain model
(Alembic, facility, reporting period, activity ledger with Decimal) and factor registry. P0-4 login stays BLOCKED on the IdP decision.

---

## Batch 3 — P1-1 accounting core: ledger, factors, calculation, locks, snapshots

**Objective.** Replace "numbers in React state" with a persisted, tenant-bound, auditable ledger and a
deterministic Scope 1/2 engine, so a period can be calculated, approved, locked and reproduced.

**Files.**
- `inference/esg_rag/accounting.py` (new) — pure Decimal calculation library (units, factor selection, boundary, dual Scope 2, memo items, exceptions).
- `inference/esg_rag/ledger_models.py` (new) — 10 tables on `EsgBase` with composite tenant FKs and dual-control check constraints; `esg_organization`/`esg_membership` moved to `EsgBase`.
- `inference/esg_rag/ledger.py` (new) — domain service: structure, factor governance, activity workflow, calculation runs, lock/restate, snapshot export; audit event per state change.
- `inference/esg_rag/ledger_router.py` (new) — 22 routes; mounted by `router.py`.
- `inference/esg_rag/database.py` — `EsgBase`, Alembic helpers; `init_db` applies migrations.
- `inference/esg_migrations/` (new) — Alembic env limited to ESG tables, migration `0001`.
- `inference/requirements.txt` (+alembic, psycopg2-binary), `inference/requirements-esg.txt` (new, slim ESG deps).
- `tests/test_esg_accounting.py` (12), `tests/test_esg_ledger.py` (16), `tests/esg_harness.py` (SQLite with FK enforcement, or PostgreSQL via `ESG_TEST_DATABASE_URL`; Gemini disabled).
- Docs: `ACCOUNTING_METHODOLOGY.md`, `FACTOR_REGISTRY.md`, `DATA_MODEL.md`, API contracts.

**Data migration.** `0001` creates the ESG tables. On an existing database that already has
`esg_organization`/`esg_membership` from batch 1's `create_all`, stamp or drop those two empty tables before
upgrading (they only ever existed on this branch).

**Tests run.**
```
.venv-esg/bin/python -m unittest discover -s tests -p "test_esg*.py"
  SQLite:      Ran 56 tests … OK (skipped=1: PostgreSQL-only concurrency test)
  PostgreSQL:  ESG_TEST_DATABASE_URL=postgresql+psycopg2://esg@127.0.0.1:55432/esg_test → Ran 56 tests … OK
Alembic: upgrade head + `alembic check` (no drift) + downgrade base + upgrade on PostgreSQL 16 and SQLite → OK
```
PostgreSQL was a disposable local cluster (`initdb` in the session scratchpad, port 55432).

**Covered brief fixtures.** kWh×factor→t; overlapping invoices rejected; unit normalisation/rejection; factor
version change leaves locked report byte-identical; market/location separate; missing market input not
invented; approval + period locks; missing factor is a blocking exception; memo items never net; boundary
rollups (operational/financial/equity); post-approval change via supersede; concurrent approvals single
winner (PostgreSQL); retries idempotent; cross-tenant access 404 and DB-level composite FK rejection.

**Status.** CODE_COMPLETE + tests VERIFIED locally. METHODOLOGY_VALIDATED: no (needs a GHG practitioner).
No UI yet for these routes; no factors shipped (by policy — see FACTOR_REGISTRY.md).

**Next.** CI workflow; members/invitations; ledger UI screens; replace fabricated dashboard KPIs (A24) with ledger data.
