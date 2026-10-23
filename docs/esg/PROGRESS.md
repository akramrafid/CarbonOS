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
