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
npx playwright test tests/e2e # starts vite on :3000; 4 viewports
```

## Suites

| Suite | Tests | Covers (brief §14 item) |
|---|---|---|
| `test_esg_security.py` | 13 | unauthenticated rejection (1); tenant isolation of docs/RAG/audit (2); roles; traversal, type, size; duplicate upload (6) |
| `test_esg_authenticity.py` | 10 | missing document → no phantom footprint (4); invalid document → 422 (5); AI failure → no fabricated answer (12); demo segregation; solar export not netted (9) |
| `test_esg_accounting.py` | 12 | kWh×factor→t; unit normalisation/failure (7); missing factor exception; market vs location (9); memo items; boundary rollups (14); GWP mixing; determinism |
| `test_esg_ledger.py` | 16 | journey to locked report; double-count rejection (6); retries idempotent (16); self-approval blocked (3); lock preconditions & admin-only lock; factor change leaves locked report identical (8, 17); post-approval change via supersede (13); concurrency single winner (16, PostgreSQL only); cross-tenant 404 + DB composite-FK rejection (2) |
| `test_esg_engine.py` | 5 | legacy engine (still asserts legacy constants — not evidence of correctness) |
| `tests/js/esgDocumentExtractor.test.mjs` | 2 | client extractor never invents values |
| `tests/e2e/esg-authenticity.spec.ts` | 4 × 4 viewports | upload failure, demo labelling, assistant unavailable, no page errors — desktop, tablet, 375 px, 320 px |

## Latest results

| Command | Result |
|---|---|
| ESG unittest, SQLite (fresh venv from `requirements-esg.txt`) | Ran 56 — OK (1 skipped: PostgreSQL-only) |
| ESG unittest, PostgreSQL 16 | Ran 56 — OK |
| `alembic check` on PostgreSQL | No new upgrade operations detected |
| `python3 -m unittest tests.test_orchestrator` | Ran 34 — OK |
| `npm run lint` (tsc) / `npm test` / `npm run build` | exit 0 / 2 pass / exit 0 |
| `npx playwright test` | 16 passed |

## Not run / known gaps

* Brief §14 items 10 (supplier data), 11 (RAG prompt-injection), 15 (missing disclosure) — features not built yet.
* HawkScan DAST — no `HAWK_API_KEY`. Secret history scan — not run.
* dMRV tests (`test_dmrv_*`) — out of ESG scope; need torch/joblib.
* `frontend-quality.yml` contract job (`orchestrator frontend-check`) still fails on 66 pre-existing design-heuristic findings outside ESG.
