# ESG Baseline — Phase 0

Date: 2026-10-24 · Branch at audit: `main` · SHA: `141e7b5bd9e77e18884e8da50d96e259afd43b32`
Work branch: `esg/p0-security-baseline`

Scope: the Enterprise ESG SaaS only (`/platform/saas-dashboard`, `inference/esg_rag/`,
`src/pages/platform/SaaSDashboard.jsx` and its components, `src/lib/esgDocumentExtractor.js`).
Marketplace, national registry, farmers AI and satellite MRV were not modified.

## Environment

| Tool | Version |
|---|---|
| Python | 3.12.6 (pyenv); isolated venv `.venv-esg` (gitignored) |
| Node / npm | v25.2.0 / 11.16.0 |
| ESG venv packages | fastapi 0.109.2, SQLAlchemy 2.0.x, pydantic 2, httpx <0.28, PyJWT, pandas, pdfplumber, python-docx |

`inference/requirements.txt` pulls torch/torchvision/earthengine/chromadb for the whole inference
service; those were **not** installed for the ESG baseline (not needed for ESG code paths).

## Commands and results

| Command | Result |
|---|---|
| `npm ci` | PASS (exit 0; npm warns about unapproved postinstall scripts for protobufjs/puppeteer) |
| `npm run build` (`tsc && vite build`) | PASS (exit 0). Largest chunks: `index` 556 kB, `SaaSDashboard` 281 kB |
| `npm run lint` | **FAIL — script does not exist** (`Missing script: "lint"`) |
| `npm test` | **FAIL — script does not exist** |
| `npx playwright test` | NOT RUN — `playwright.config.ts` points to `./tests/e2e`, which does not exist; `@playwright/test` is not a dependency |
| `python3 -m unittest tests.test_orchestrator` | PASS — 34 tests |
| `.venv-esg/bin/python -m unittest tests.test_esg_engine` | PASS — 6 tests (they assert the *current* hardcoded factors and synthetic fallbacks; passing ≠ correct) |
| `.venv-esg/bin/python -m unittest discover -s tests` | 51 run, **6 errors** — all `test_dmrv_*` import errors (`joblib`/`torch` not installed in ESG venv). Out of ESG scope → **NOT RUN** for dMRV |
| `python3 -m orchestrator.cli frontend-check --area all` | **FAIL** (exit 1): unresolved template placeholders in performance evidence; 66 blocking source-heuristic findings |
| Local boot of `inference/main.py` | NOT RUN — imports torch at module load and raises on startup if `GEMINI_API_KEY` is unset |

## CI

`.github/workflows/frontend-quality.yml` runs `npm run lint`, `npm test -- --runInBand` and
`npx playwright test`. The first two scripts don't exist and the Playwright directory is
missing, so **the browser job cannot pass on any commit**. No Python/backend CI exists.

## Headline findings (details in 02/03/06)

1. Every `/api/esg/*` endpoint is unauthenticated; `tenant_id` comes from the request body/query
   (`default_tenant`). Any caller can read any tenant's documents, audit trail and RAG content.
2. Upload filename and `corpus` are joined into filesystem paths unsanitized → arbitrary file write.
3. Extraction failures return canned consumption values labeled `verified`, `audit_seal: true`,
   "ISO 14064 assurance" — on both server and client.
4. No organization, membership, facility, reporting-period, ledger, approval or report-snapshot model exists.
5. Solar export is subtracted from Scope 2 (negative factor) in the utility-segment extractor.
6. Customer document text is sent to Gemini with no consent control (API key in URL query string).
7. Committed secrets/artifacts: OpenWeatherMap API key in `src/pages/farmers-ai/HarvestGuardDashboard.jsx`
   (out of ESG scope — rotation item), Django insecure default `SECRET_KEY`, `DEBUG=True` default,
   `ALLOWED_HOSTS` includes `*`; `__pycache__`, `inference/chroma_data/*` (incl. uploads) are tracked in Git.
