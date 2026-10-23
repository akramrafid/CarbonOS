# ESG Test Evidence

Results are from local runs on 2026-10-24 (macOS, Python 3.12.6, Node 25.2.0, PostgreSQL 16 disposable
cluster). CI (`.github/workflows/esg-ci.yml`) runs the same commands; **CI has not run yet** because
nothing has been pushed.

## How to run

```bash
python3.12 -m venv .venv-esg && .venv-esg/bin/pip install -r inference/requirements-esg.txt
.venv-esg/bin/python -m unittest discover -s tests -p "test_esg*.py"            # SQLite (FKs enforced)
ESG_TEST_DATABASE_URL=postgresql+psycopg2://USER@HOST:PORT/DB \
  .venv-esg/bin/python -m unittest discover -s tests -p "test_esg*.py"          # PostgreSQL + Alembic (DB is TRUNCATED)
npm test                      # client extractor unit tests
ESG_PYTHON="$PWD/.venv-esg/bin/python" npx playwright test  # starts vite :3000 + ESG API :8100; 4 viewports
```

## Suites

| Suite | Tests | Covers (brief §14 item) |
|---|---|---|
| `test_esg_security.py` | 13 | unauthenticated rejection (1); tenant isolation of docs/RAG/audit (2); roles; traversal, type, size; duplicate upload (6) |
| `test_esg_authenticity.py` | 10 | missing document → no phantom footprint (4); invalid document → 422 (5); AI failure → no fabricated answer (12); demo segregation; solar export not netted (9) |
| `test_esg_accounting.py` | 12 | kWh×factor→t; unit normalisation/failure (7); missing factor; market vs location (9); memo items; boundary rollups (14); GWP mixing; determinism |
| `test_esg_ledger.py` | 17 | journey to locked report; double counting (6); retries (16); self-approval (3); lock preconditions, admin-only lock; factor change leaves locked report identical (8, 17); supersede (13); concurrency single winner (16, PostgreSQL); cross-tenant 404 + DB composite-FK rejection (2); reference endpoints |
| `test_esg_members.py` | 6 | invitations bound to verified email, single use, revocation, no privilege escalation, last-owner protection, audit |
| `test_esg_disclosures.py` | 7 | metric validation/privacy, duplicates, review, lock integration; missing disclosure → MISSING_DATA, never compliant (15); approval needs data + narrative + other reviewer |
| `test_esg_hardening.py` | 5 | RAG injection cannot reach other tenants or change rules (11); rate limits; CSV formula injection |
| `test_esg_app.py` | 2 | production config refuses insecure settings; no stack traces; request ids |
| `test_esg_engine.py` | 5 | legacy engine (asserts legacy constants — not evidence of correctness) |
| `tests/js/esgDocumentExtractor.test.mjs` | 2 | client extractor never invents values |
| `tests/e2e/esg-authenticity.spec.ts` | 5 × 4 viewports | legacy dashboard: upload failure, demo labelling, assistant unavailable, DEMO banner, no page errors |
| `tests/e2e/esg-journey.spec.ts` | 2 × 4 viewports | three-user journey through UI + real API to a locked, reproducible report and disclosure coverage (18: works at 375 px and 320 px); signed-out visitor sees nothing |

## Latest results (2026-10-24)

| Command | Result |
|---|---|
| ESG unittest, SQLite | Ran 77 — OK (1 skipped: PostgreSQL-only) |
| ESG unittest, PostgreSQL 16 (`ESG_TEST_DATABASE_URL`) | Ran 77 — OK |
| Alembic upgrade/check/downgrade on PostgreSQL + SQLite | OK, no drift |
| `python3 -m unittest tests.test_orchestrator` | Ran 34 — OK |
| `npm run lint` / `npm test` / `npm run build` | OK / 2 pass / OK |
| `ESG_PYTHON=../.venv-esg/bin/python npx playwright test` | 28 passed |

## Not run / known gaps

* Brief §14 item 10 (supplier data) — supplier portal not built.
* HawkScan DAST — no `HAWK_API_KEY`. Secret history scan — not run.
* dMRV tests (`test_dmrv_*`) — out of ESG scope; need torch/joblib.
* `frontend-quality.yml` contract job (`orchestrator frontend-check`) still fails on 66 pre-existing design-heuristic findings outside ESG.
