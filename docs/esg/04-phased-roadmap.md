# ESG Phased Roadmap

Ordering follows the dependency path: nothing customer-facing is trustworthy until identity and
tenancy are enforced, and no number is trustworthy until it comes from a persisted ledger with
cited, versioned factors.

## P0 — launch blockers

| Slice | Content | Acceptance (tests must exist and pass) | Depends on |
|---|---|---|---|
| **P0-1 Auth & tenancy** | JWT verification (fail closed), org + membership model, server-derived tenant, role permissions, upload path/size/type hardening, global-corpus write restriction, duplicate upload detection | Unauthenticated 401 on every ESG route but `/health`; org A cannot list/query/read B's docs, audit trail or RAG chunks; client `tenant_id` ignored; traversal filenames stored safely; viewer cannot write; tenant cannot write global corpus | — |
| **P0-2 Data authenticity** | Remove fabricated fallbacks (server extraction, segment detector, 9-category footprint, client extraction/RAG/factor-sync fallbacks); `verified`/`audit_seal` never set by software; LLM extraction off unless consented; demo payloads only for demo orgs | Missing/invalid document → 422 and no stored footprint; RAG failure → explicit unavailable state; no response contains `audit_seal: true` | P0-1 |
| P0-3 CI that can pass | `lint`/`test` scripts, backend pytest job, ESG tests in CI | CI green on branch | P0-1 |
| P0-4 Login UI | Integrate chosen IdP in SPA; org switcher; sign-in-required states | **BLOCKED: IdP choice** (Supabase Auth / Auth0 / Keycloak / Cognito) | P0-1 |

## P1 — pilot essentials

1. Alembic migrations + PostgreSQL profile; `Facility`, `LegalEntity`, `ReportingPeriod`, `ConsolidationBoundary`.
2. `ActivityRecord` ledger (Decimal, raw + normalised units, evidence link, entry method, quality status, duplicate key).
3. `EmissionFactor` registry: versioned, cited, validity dates, GWP basis, custom-factor approval. Replace uncited constants; mark Bangladesh grid factor **UNVERIFIED** until an official source is validated.
4. Pure calculation library (Scope 1 fuels, Scope 2 location/market separated, data-quality exceptions) with the numerical fixtures from the brief; `CalculationRun`/`CalculationLine` persisted.
5. Extraction review workflow: QUEUED → RUNNING → REVIEW_REQUIRED → APPROVED/FAILED; corrections keep original value and actor.
6. Approvals with separation of duties, period lock, immutable `ReportSnapshot`, deterministic hash.
7. Report export (CSV/PDF) with boundary, methods, factor versions, missing data and disclaimer.
8. `AuditEvent` table for every state change; rate limiting; structured logs with request IDs.
9. Break `SaaSDashboard.jsx` into feature modules backed by typed API responses.

## P2 — expansion

Scope 3 subset with applicability decisions; suppliers portal; E/S/G metric modules; disclosure
framework templates with gap report; copilot evaluation set; ERP adapters; SSO/MFA; Bangla terms review.
