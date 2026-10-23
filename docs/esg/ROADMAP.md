# ESG Roadmap

Ordering follows the dependency path: identity and tenancy → trustworthy data → persisted ledger and
engine → workflow and reporting → breadth. Status: VERIFIED (tests pass locally) · PARTIAL · BLOCKED · NOT STARTED.

## P0 — launch blockers

| Slice | Status | Evidence / remaining |
|---|---|---|
| P0-1 Auth & tenancy (fail-closed JWT, membership-derived tenant, roles, upload hardening) | VERIFIED | `test_esg_security.py` |
| P0-2 Data authenticity (no fabricated fallbacks, no self-awarded verification) | VERIFIED for API + workspace; legacy dashboard labelled DEMO | `test_esg_authenticity.py`, e2e; register A9–A14, A22–A23 remain in legacy demo code |
| P0-3 CI that can pass | PARTIAL | `esg-ci.yml` written and reproduced locally; **not yet run on GitHub** (nothing pushed) |
| P0-4 Sign-in | PARTIAL | OIDC code complete and e2e-tested with test tokens; **BLOCKED on choosing and configuring an identity provider** |

## P1 — pilot essentials

| Item | Status |
|---|---|
| Alembic migrations, PostgreSQL profile | VERIFIED (0001, 0002; PG 16 + SQLite; drift check) |
| Legal entities, facilities, periods, boundary methods | VERIFIED (API + UI) |
| Activity ledger (Decimal, raw + canonical units, evidence, overlap rejection, idempotency, supersede) | VERIFIED |
| Factor registry (cited, versioned, dual-control, immutable) | VERIFIED — **empty by policy**; loading sourced factors is a human task |
| Scope 1 fuels / Scope 2 location + market engine with exceptions | VERIFIED; METHODOLOGY_VALIDATED: no |
| Review, separation of duties, lock, restatement, immutable snapshots, CSV/JSON export | VERIFIED |
| Members and invitations | VERIFIED (no email delivery) |
| E/S/G metric intake | VERIFIED (17 aggregated metrics) |
| Disclosure coverage + gap report (GRI selected, IFRS S2) | VERIFIED; references to be verified by a qualified reviewer |
| Audit events, request ids, rate limits, CSV-injection guard | VERIFIED |
| Extraction → reviewed ledger entry (with document link) | VERIFIED (rule-based); OCR NOT STARTED |
| PDF report export | NOT STARTED |
| Backups/restore test, retention/deletion, tenant export/offboarding | NOT STARTED |
| Job queue for long extraction/report jobs | NOT STARTED (extraction is synchronous) |
| Bangla localisation of the workspace | NOT STARTED (English only) |

## P2 — expansion

Scope 3 (applicability decisions for all 15 categories, then a verified subset); supplier portal; refrigerant
and process emissions; dated facility ownership; ESRS/CDP templates; targets and initiatives; copilot
evaluation set; ERP/CSV import mapping; SSO/MFA policy; anomaly hints; billing/entitlements display.
