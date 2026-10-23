# ESG API Contracts (`/api/esg`, FastAPI)

## Common rules (from P0-1)

* **Auth:** `Authorization: Bearer <JWT>` on every route except `GET /api/esg/health`.
  Token must carry `sub` and `exp`; issuer/audience are enforced when configured.
* **Tenant:** derived from the caller's membership. `X-Organization-Id` selects one of the
  caller's organizations and is required only when the caller has several. Any `tenant_id` in a
  body, form or query string is ignored.
* **Errors:** `{"detail": "<message>"}`. 401 unauthenticated · 403 no membership / missing permission ·
  400 ambiguous organization · 413 upload too large · 422 validation or rejected upload ·
  503 authentication not configured (fail closed).

## Server configuration

| Variable | Purpose |
|---|---|
| `ESG_AUTH_JWKS_URL` | OIDC JWKS endpoint (RS256/ES256). Takes precedence |
| `ESG_AUTH_JWT_SECRET` | HS256 secret (≥32 chars) for dev/test or HS256 providers |
| `ESG_AUTH_ISSUER`, `ESG_AUTH_AUDIENCE` | Enforced when set (set both in production) |
| `ESG_PLATFORM_OPERATOR_SUBS` | Comma-separated subjects allowed to write global corpora |
| `ESG_MAX_UPLOAD_BYTES` | Upload cap, default 20 MB |

## Roles → permissions

| Role | read | write | review | admin |
|---|---|---|---|---|
| org_owner, esg_admin | ✓ | ✓ | ✓ | ✓ |
| data_contributor, facility_manager | ✓ | ✓ | | |
| auditor | ✓ | | ✓ | |
| executive_viewer | ✓ | | | |
| supplier_collaborator | (no workspace access until the supplier portal exists) | | | |

## Routes

| Method & path | Permission | Request | Response |
|---|---|---|---|
| GET `/health` | public | — | service status (no tenant data) |
| POST `/organizations` | any authenticated user | `{name, is_demo?}` | 201 `{id, name, is_demo, role:"org_owner"}` |
| GET `/organizations` | any authenticated user | — | `[{id, name, is_demo, role}]` for the caller |
| POST `/query` | read | `{query (1–2000 chars), corpus?, top_k? (1–20)}` | `QueryResponse` — `confidence` is retrieval similarity, not verification |
| POST `/extract-footprint` | write | multipart `file` or `raw_text` | `{filename, tenant_id, parameters, details[{param_name,value,unit,scope,source_page?,raw_snippet,confidence?}], overall_confidence?, extraction_method: regex\|llm, extracted_at, summary, review_status: "REVIEW_REQUIRED"}`; 422 if no input, no readable text, or no quantities found. No footprint is computed here |
| POST `/ingest` | write (global corpora: platform operator) | multipart `file`, `corpus` | `IngestResponse` incl. `duplicate` |
| GET `/emission-factors` | read | `category?`, `region?` | factor rows |
| GET `/documents` | read | `corpus?` | caller's tenant docs + global corpora |
| GET `/audit-trail` | review | `limit` (1–100) | caller's tenant query/extraction log |
| POST `/duckdb-calculate` | read | activities/spend payload | legacy estimate (see register A9–A11) |
| GET `/emission-factors/registry` | read | — | static catalogue (unverified, register A12) |
| POST `/emission-factors/regression-test` | admin | proposed factors | regression report |
| GET `/atlas-benchmark/run` | read | — | synthetic benchmark (register A13) |
| GET `/satellite-insets`, GET `/entity-tree` | read, **demo org only** (404 otherwise) | — | sample payloads with `data_classification: "DEMO_SAMPLE"` |
| POST `/detect-utility-segments` | read | `{raw_text}` | only segments present in the text; `excluded_segments` (solar export, kVA, kVARh) never netted; factors `UNVERIFIED`; `review_status: REVIEW_REQUIRED` |

## Upload rules

Allowed extensions: `.pdf .csv .xlsx .xls .txt .md .docx`. The client filename is reduced to a
display-safe basename and never used for storage; files are stored at
`uploads/<organization_id>/<sha256><ext>`. Re-uploading identical bytes into the same tenant and
corpus returns the existing document with `duplicate: true`.

## Extraction rules (from P0-2)

* No fabricated fallback anywhere: failures are 422 with a message telling the user to enter values manually.
* `confidence` is extraction-model confidence only and is `null` for rule-based matches.
* LLM extraction (Gemini) runs only when `ESG_LLM_EXTRACTION_ENABLED=true`; otherwise documents never leave the server.
* Nothing in the API sets `verified`, `audit_seal` or similar; `verified_by_audit` is reserved for a recorded human review (not built yet).

## Ledger routes (P1-1)

All under `/api/esg`, same auth/tenant rules. Decimals are JSON **strings**. Lists return `{total, items}`
with `limit` (1–200, default 50) and `offset`. Domain rule violations: 403 (role / separation of duties),
404 (not in caller's organization), 409 (state conflict, overlap, locked period, stale calculation), 422 (validation).

| Method & path | Permission | Notes |
|---|---|---|
| POST/GET `/legal-entities` | admin / read | `{name, country (ISO-2), registration_number?}` |
| POST/GET `/facilities` | admin / read | `{legal_entity_id, name, country, grid_region, address?, operational_control, financial_control, equity_share_pct}` |
| POST/GET `/periods` | admin / read | `{name, start_date, end_date, boundary_method}` |
| POST `/factors[?platform_wide=true]` | admin (platform: operator) | creates DRAFT version; unit must be the activity's canonical unit; Scope 1 → `direct`, Scope 2 → `location`/`market` |
| POST `/factors/{id}/approve` | admin (platform: operator), not the author | DRAFT → APPROVED, then immutable |
| GET `/factors?status&activity_type` | read | organization + platform factors |
| POST `/activities` | write | `{facility_id, period_id, activity_type, quantity, unit, activity_start, activity_end, meter_ref?, source_type, source_document_id?, source_ref?, evidence_snippet?, factor_id?, market_factor_id?, notes?, supersedes_id?, idempotency_key?}` → record + `created` |
| PATCH `/activities/{id}` | write | DRAFT/REJECTED only; audit keeps before/after |
| POST `/activities/{id}/submit` | write | DRAFT/REJECTED → SUBMITTED |
| POST `/activities/{id}/approve` · `/reject` | review, not the creator | reject requires `comment` |
| GET `/activities?period_id&facility_id&status` | read | |
| POST `/periods/{id}/calculate` | write | stores run + lines; returns totals, exceptions, `blocking` |
| GET `/calculations/{id}` | read | run + line-level trace (formula, factor version) |
| POST `/periods/{id}/lock` | admin, not the run's preparer | `{calculation_run_id}` → snapshot (content omitted) |
| POST `/periods/{id}/restate` | admin | `{reason}`; LOCKED → OPEN, revision + 1 |
| GET `/periods/{id}/snapshots` | read | revisions with sha256 |
| GET `/snapshots/{id}/export?format=json\|csv` | read | byte-identical on every call; `X-Content-SHA256` header |
| GET `/audit-events?entity_id` | review | newest first |

## Members & invitations (P1-2)

| Method & path | Permission | Notes |
|---|---|---|
| GET `/members` | admin | `[{id, user_sub, role, created_at}]` |
| PATCH `/members/{id}` | admin | `{role}`; only owners grant/alter the owner role; last owner cannot be demoted (409) |
| DELETE `/members/{id}` | admin | last owner cannot be removed (409) |
| POST `/invitations` | admin | `{email, role}` → 201 with `token` **shown once** (stored as SHA-256; expires in 7 days; no email is sent) |
| GET `/invitations` · DELETE `/invitations/{id}` | admin | list (no tokens) · revoke |
| POST `/invitations/accept` | any authenticated user | `{token}`; token's `email` claim must equal the invited address **and** `email_verified` must be true. Any mismatch / expiry / reuse / revocation → the same 404 |

## Additions (P1-3)

| Method & path | Permission | Notes |
|---|---|---|
| GET `/me` | any authenticated user | `{sub, verified_email, is_platform_operator}` — UI hints only |
| GET `/activity-types` | read | inventory/memo types, scope, canonical and accepted units, methodology version |
| GET `/periods/{id}/calculations` | read | runs newest first (so a second person can review and lock) |
| POST `/extract-footprint` | write | response now includes `document_id` of the stored source document |

Standalone service: `cd inference && uvicorn esg_app:app` — `/healthz`, `/readyz` (DB check), `X-Request-Id` on
every response, generic 500 body with request id (no stack traces), `ESG_ENV=production` refuses to start without
OIDC JWKS + issuer + audience, PostgreSQL, explicit origins, and data-processing terms if LLM extraction is enabled.
