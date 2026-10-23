# ESG Architecture

Status as of branch `esg/p0-security-baseline` (2026-10-24). Phase 0 "as found" notes are at the end.

## Containers

```
Browser — React 19 SPA (Vite; Vercel)
  /platform/esg            ESG workspace (src/pages/platform/esg/*) — real data only, via typed API calls
  /platform/esg/callback   OIDC redirect (Authorization Code + PKCE, oidc-client-ts)
  /platform/saas-dashboard legacy demo dashboard (permanent DEMO banner)
      │  Bearer access token (from the organization's OIDC provider) + X-Organization-Id
      ▼
ESG API — FastAPI, inference/esg_app.py (torch-free) — also mounted inside inference/main.py
  esg_rag/auth.py          JWT verification (JWKS / HS256 dev), membership-derived tenant, roles, fail-closed
  esg_rag/router.py        RAG query/ingest/extraction (+ legacy demo endpoints, demo orgs only)
  esg_rag/ledger_router.py structure, factors, activities, calculations, locks, snapshots, metrics, disclosures
  esg_rag/members.py       members, invitations
  esg_rag/ledger.py        domain service (workflow, SoD, locks, snapshots, audit)
  esg_rag/esg_metrics.py   E/S/G observations, disclosure coverage
  esg_rag/accounting.py    pure Decimal GHG engine (no I/O)
  esg_rag/ratelimit.py     per-user limits on AI and uploads
      │
      ├── PostgreSQL (production) / SQLite (dev, tests)
      │     EsgBase tables via Alembic (inference/esg_migrations, version table esg_alembic_version)
      │     legacy RAG tables on the shared Base (create_all)
      ├── Upload store: CHROMA_PERSIST_DIR/uploads/<organization_id>/<sha256><ext>
      ├── Vector store: Chroma (optional) or JSON fallback; tenant filter applied before generation
      └── Gemini (optional): RAG answers; document extraction only when ESG_LLM_EXTRACTION_ENABLED=true
```

## Request path and trust boundaries

1. SPA obtains an access token from the organization's identity provider; nothing tenant-related is decided client-side.
2. API verifies signature, expiry, issuer and audience; unknown or missing configuration → 503 (never open).
3. Tenant = the caller's membership (`X-Organization-Id` only chooses among their own). Every query filters
   by `organization_id`; child rows reference parents via composite `(organization_id, id)` foreign keys.
4. Role permissions (read / write / review / admin) gate each route; separation of duties is enforced in the
   service and by database check constraints.
5. Every state change writes an `esg_audit_event` in the same transaction.

## Key design decisions

| ADR | Decision |
|---|---|
| ESG-001 | ESG stays in the FastAPI service as a bounded package; Django is not involved. Standalone `esg_app.py` deploys it without the ML stack |
| ESG-002 | Provider-neutral OIDC: the API verifies JWKS; the SPA uses Authorization Code + PKCE. The provider (Auth0, Keycloak, Cognito, Entra ID, …) is configuration, not code |
| ESG-003 | Ledger tables on their own metadata with Alembic migrations; legacy tables untouched |
| ESG-004 | Calculation is a pure library; runs persist lines + input hash; locking writes an immutable, content-addressed snapshot that exports render from |
| ESG-005 | No shipped emission factors; every factor is cited and second-person approved |
| ESG-006 | Disclosure templates are paraphrased and flagged for verification; coverage is never compliance |

## Deployment (non-production)

* SPA: existing Vercel project; set `VITE_FASTAPI_API_URL`, `VITE_OIDC_ISSUER`, `VITE_OIDC_CLIENT_ID`, `VITE_OIDC_AUDIENCE`.
* ESG API: `cd inference && pip install -r requirements-esg.txt && uvicorn esg_app:app --host 0.0.0.0 --port $PORT`
  with `DATABASE_URL=postgresql+psycopg2://…`, `ESG_AUTH_JWKS_URL`, `ESG_AUTH_ISSUER`, `ESG_AUTH_AUDIENCE`,
  `ALLOWED_ORIGINS`, `CHROMA_PERSIST_DIR` on persistent storage, `ESG_ENV=production` (enforces the above).
  Migrations run at startup (`alembic upgrade head`).
* **Not deployed in this work.** No hosting, database or identity provider was provisioned (needs authorization and accounts).

## Phase 0 "as found" (SHA 141e7b5)

All `/api/esg/*` routes were unauthenticated with a client-chosen `tenant_id`; ESG lived only in the
torch-importing `inference/main.py`; values lived in React state; tables were created with `create_all` on a
SQLite file shared with Django. See [00-baseline.md](00-baseline.md) and [06-data-authenticity-register.md](06-data-authenticity-register.md).
