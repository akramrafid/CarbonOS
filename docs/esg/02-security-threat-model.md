# ESG Security Threat Model (Phase 0)

Assets: customer invoices/statements, extracted activity data, emissions results, RAG corpora,
query/audit logs, emission-factor catalogue, credentials (Gemini key, DB URL).
Actors: anonymous internet user, authenticated user of tenant A, malicious insider of tenant A,
supplier collaborator, platform operator, compromised LLM output / prompt-injected document.

## Findings at SHA 141e7b5

| ID | Threat (STRIDE) | Where | Severity | Status |
|---|---|---|---|---|
| T1 | Spoofing/EoP: no authentication on any ESG endpoint | `esg_rag/router.py` (all routes) | P0 | Fixed in P0-1 |
| T2 | Info disclosure / tampering: `tenant_id` trusted from client → cross-tenant read of documents, audit trail, RAG chunks; write into any tenant | `/query`, `/ingest`, `/extract-footprint`, `/documents`, `/audit-trail` | P0 | Fixed in P0-1 |
| T3 | Tampering: path traversal — upload filename joined into path (`../../x`) → arbitrary file write as the service user | `ingest.ingest_document` | P0 | Fixed in P0-1 |
| T4 | Tampering: `corpus` form field joined into `fallback_{corpus}.json` path → arbitrary `.json` write; and any caller can poison global `regulatory`/`emission_factors` corpora read by every tenant | `/ingest` | P0 | Fixed in P0-1 |
| T5 | DoS: unbounded upload size read fully into memory; no type allow-list | `/ingest`, `/extract-footprint` | P1 | Size + extension limits in P0-1; rate limiting open |
| T6 | Info disclosure: customer document text sent to Gemini without consent; API key in URL query string | `extractor.extract_parameters_with_gemini`, `generator` | P0 (privacy) | LLM extraction disabled unless explicitly enabled (P0-2); key-in-URL open |
| T7 | Repudiation / integrity: fabricated values labelled `verified`/`audit_seal` | server + client | P0 (trust) | P0-2 |
| T8 | Prompt injection via uploaded documents into RAG answers | `generator.build_grounded_prompt` | P1 | Prompt marks context untrusted; no tests yet |
| T9 | Info disclosure: stack traces / raw exceptions — `ingest` stores `str(e)` as page text | `ingest.extract_text_from_file` | P2 | Open |
| T10 | Secrets in repo: OpenWeatherMap key (farmers AI), Django insecure default secret, `DEBUG=True` default, `ALLOWED_HOSTS=*` | out-of-ESG modules | P1 | **Human rotation checklist below**; code not modified (out of scope) |
| T11 | Customer uploads committed to Git (`inference/chroma_data/uploads`) | repo | P1 | Upload dir gitignored in P0-1; historic files are seed samples |
| T12 | CORS `allow_credentials=True` with `allow_methods/headers=*` | `inference/main.py` | P2 | Bearer-token auth does not rely on cookies; revisit with cookie sessions |
| T13 | No rate limiting / request timeouts on ESG routes | FastAPI | P1 | Open |

## Controls introduced in P0-1

* Bearer JWT required on every ESG route except `/api/esg/health`; verification via OIDC JWKS
  (RS256/ES256) or HS256 secret; `exp` and `sub` required; issuer/audience enforced when configured.
* **Fail closed:** if no verifier is configured the API returns 503 — it never runs open.
* Tenant = `organization_id` resolved from the `esg_membership` table for the token subject;
  `X-Organization-Id` only *selects* among the caller's memberships.
* Role → permission map (read / write / review / admin); global corpora writable only by platform
  operators (`ESG_PLATFORM_OPERATOR_SUBS`).
* Uploads: extension allow-list, size cap (`ESG_MAX_UPLOAD_BYTES`, default 20 MB), server-generated
  storage name `<tenant>/<sha256><ext>`, containment check, per-tenant duplicate detection.

## Human rotation checklist (deleting code does not revoke keys)

- [ ] Revoke and reissue the OpenWeatherMap key committed in `src/pages/farmers-ai/HarvestGuardDashboard.jsx`; move it server-side.
- [ ] Confirm no deployment uses the Django fallback `SECRET_KEY` (`django-insecure-&!^e…`); if any did, rotate and invalidate sessions.
- [ ] Check Render/Vercel env for `GEMINI_API_KEY` exposure in logs (key is sent as a URL query parameter); rotate if logs are shared.
- [ ] Run a history secret scan (e.g. `gitleaks detect`) — NOT RUN in this session.
