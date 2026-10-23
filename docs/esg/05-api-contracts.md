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
| POST `/extract-footprint` | write | multipart `file` or `raw_text` | `ExtractionResponse` (see P0-2 for authenticity rules) |
| POST `/ingest` | write (global corpora: platform operator) | multipart `file`, `corpus` | `IngestResponse` incl. `duplicate` |
| GET `/emission-factors` | read | `category?`, `region?` | factor rows |
| GET `/documents` | read | `corpus?` | caller's tenant docs + global corpora |
| GET `/audit-trail` | review | `limit` (1–100) | caller's tenant query/extraction log |
| POST `/duckdb-calculate` | read | activities/spend payload | legacy estimate (see register A9–A11) |
| GET `/emission-factors/registry` | read | — | static catalogue (unverified, register A12) |
| POST `/emission-factors/regression-test` | admin | proposed factors | regression report |
| GET `/atlas-benchmark/run` | read | — | synthetic benchmark (register A13) |
| GET `/satellite-insets`, GET `/entity-tree` | read | — | demo payloads (register A7–A8) |
| POST `/detect-utility-segments` | read | `{raw_text}` | detected segments |

## Upload rules

Allowed extensions: `.pdf .csv .xlsx .xls .txt .md .docx`. The client filename is reduced to a
display-safe basename and never used for storage; files are stored at
`uploads/<organization_id>/<sha256><ext>`. Re-uploading identical bytes into the same tenant and
corpus returns the existing document with `duplicate: true`.
