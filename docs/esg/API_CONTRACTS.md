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
| `ESG_LLM_RAG_ENABLED` | Explicit model-answer opt-in (`true`, `1`, `yes`); defaults off |
| `ESG_LLM_EXTRACTION_ENABLED` | Explicit model-extraction opt-in (`true`); defaults off |
| `ESG_LLM_PROCESSING_TERMS_REF` | Required in production before either external-model path is enabled |
| `ESG_EMBEDDING_MODEL` | Optional SentenceTransformer model; unavailable dependency/model uses explicitly lexical feature hashing |

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
| POST `/query` | read | `{query (1–2000 chars), corpus?: all\|tenant_docs\|regulatory\|emission_factors, top_k? (1–20), document_ids?: 1–2 distinct IDs}` | `QueryResponse` includes query_id and selected document_ids; unknown corpora rejected; `confidence` is a ranking score, not probability or verification |
| POST `/extract-footprint` | write | multipart `file` or `raw_text` | `{filename, tenant_id, parameters, details[{param_name,value,unit,scope,source_page?,raw_snippet,confidence?}], overall_confidence?, extraction_method: regex\|llm, model_used?, extracted_at, summary, review_status: "REVIEW_REQUIRED"}`; 422 if no input, no readable text, or no quantities found. No footprint is computed here |
| POST `/ingest` | write (global corpora: platform operator) | multipart `file`, `corpus` | `IngestResponse` incl. `duplicate` |
| GET `/emission-factors` | read | `category?`, `region?` | factor rows |
| GET `/documents` | read | `corpus?` | caller's tenant docs + matching operator-owned global corpora |
| GET `/documents/{document_id}/chunks/{chunk_id}` | read | paired document/passage IDs | Full indexed text, page/corpus/source status and passage/file hashes; SQL-authorized tenant/global corpus; 404 for unknown, foreign or mismatched pairs |
| GET `/audit-trail` | review | `limit` (1–100) | caller's tenant query/extraction log |
| POST `/duckdb-calculate` | read, demo org only | activities/spend payload | legacy estimate (see register A9–A11) |
| GET `/emission-factors/registry` | read, demo org only | — | static catalogue (unverified, register A12) |
| POST `/emission-factors/regression-test` | admin, demo org only | proposed factors | regression report |
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
* External model extraction requires `ESG_LLM_EXTRACTION_ENABLED=true`; external RAG answering separately requires `ESG_LLM_RAG_ENABLED=true`. Both default off. Production requires a recorded processing-terms reference. The operator remains responsible for consent, retention, and permitted processing. Provider credentials travel in request headers, not URLs.
* Model quantities must be finite and nonnegative, match evidence details, and include excerpts present in the document. Invalid structure, missing excerpts, or out-of-range confidence triggers local rule fallback. This is source validation, not an accuracy or assurance guarantee. Model-assisted results identify `model_used` when available.
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
| GET `/activities?period_id&facility_id&status&activity_type&limit&offset` | read | Tenant-scoped combined filters; `{total,items}`; total counts all matching rows before paging; stable activity-start then ID ordering; limit 1–200, offset ≥0. Filters do not alter accounting inputs. |
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

## RAG query provenance and failure behavior

`QueryResponse` adds `answer_mode` (`supported_synthesis`, `retrieval_only`, `insufficient_evidence`),
`retrieval_method`, `candidate_count`, `candidate_limit_reached`, `score_kind: ranking_score_not_probability`,
and `review_required: true`. Citations include `document_id`, `chunk_id`, `content_sha256` (passage hash),
`source_status` (default `UNREVIEWED`), filename, page, excerpt, and relevance ranking score.

The HTTP retriever filters authorized SQL rows before ranking, evaluates up to 2,000 recent chunks,
and discloses when that bound is reached. It combines BM25 ranks with optional compatible vector ranks.
Missing/corrupt vector files retain SQL lexical search; incompatible or stale vectors are excluded.
Legacy vectors without an embedding-space tag are ignored for dense ranking. They need reindexing
under the chosen model; do not mix hash/model spaces or reinterpret a hash as a semantic embedding.

Generation uses one configured model and a 20-second HTTP timeout. JSON output must include supported
claims with known source IDs and exact source quotes. Numbers absent from the evidence are rejected.
Returned citations are constructed by the server and limited to sources actually used. Missing model
access/provider errors/invalid generation return a labeled source excerpt, not fabricated model text.
No relevant source or an explicit model abstention returns insufficient evidence and no citations.
These are mechanical evidence checks, not semantic entailment or legal verification.

ATLAS now runs the actual rules parser and returns `data_classification: SYNTHETIC_TEXT_FIXTURES`.
Missing values remain null and failed; model confidence and F1 are null because this suite does not
measure them. Its percentages must never be presented as customer-document or RAG accuracy.

Legacy calculation/catalogue/regression endpoints return 404 for non-demo organizations. Scenario output is labeled `DEMO_SAMPLE`; it grants no approval or assurance. Use the ledger factor/activity/period routes for protected accounting.

### Selected-document query boundary

`document_ids` is optional: omitted/null retains ordinary authorized-corpus search. An explicit empty, duplicate, whitespace or oversized list is rejected (422), never broadened to all sources. Every selected ID must be SQL-visible under the caller's tenant or the matching operator-owned global corpus; unknown/foreign/mixed inaccessible selections return the same 404 before retrieval or model invocation. Corpus filtering remains in force. Document filtering occurs before the candidate limit/ranking. No matching passage returns insufficient evidence rather than another document's answer. Scoped queries add an append-only `evidence.query_scoped` audit event linked to `query_id`; metadata records IDs/corpus/model/mode without duplicating source contents. Direct document-scoped retrieval without an authorized SQL session is rejected, not sent to an unfiltered vector fallback.

### Activity and metric document references

When creating an activity or metric observation, an optional `source_document_id` must name an existing SQL-visible tenant document or exact operator-owned shared-corpus document. Missing/foreign/wrong-corpus references receive the same 404 and create no record/audit transition. Empty/oversized identifiers are rejected (422). Omitting the identifier keeps manual-reference workflows available; a source ID's existence/access check does not approve the document, confirm its accuracy or make evidence mandatory. Existing historical records are not rewritten or retroactively certified by this change. Linked identifiers are not mutable through the current activity/metric patch contract.
