# Three-minute CarbonOS booth walkthrough

This is a suggested rehearsal, not a time slot assigned by DCCI. Event date and venue are sourced in [AI_SUMMIT_READINESS.md](AI_SUMMIT_READINESS.md).

## Start the local showcase

Use two terminals from the repository root. Existing dependencies are `.venv-esg` and `node_modules`; if either is missing, install the pinned/minimal project dependencies before the event rather than during a live presentation.

Terminal 1:

```sh
ESG_ENV=development ESG_ACCESS_MODE=isolated_demo \
ESG_AUTH_JWT_SECRET="$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" \
DATABASE_URL=sqlite:////private/tmp/carbonos-summit.sqlite3 \
CHROMA_PERSIST_DIR=/private/tmp/carbonos-summit-store \
GEMINI_API_KEY='' ESG_LLM_EXTRACTION_ENABLED='' ESG_LLM_RAG_ENABLED='' \
ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000 \
.venv-esg/bin/python -m uvicorn esg_app:app --app-dir inference --host 127.0.0.1 --port 8100
```

Terminal 2:

```sh
VITE_FASTAPI_API_URL=http://127.0.0.1:8100 \
npm run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

Open `http://127.0.0.1:3000/platform/esg` in a fresh browser session. Check `http://127.0.0.1:8100/readyz` first. This localhost setup is for the presenter laptop; it is not a public/mobile-accessible showcase URL. Do not print it as a visitor QR code. Production startup deliberately rejects public demo mode.

If you restart the API with a new generated secret, use a fresh browser session or clear that tab's demo session; old tokens will no longer match. Keep the API running throughout the presentation.

## Talk track and clicks

### 0:00–0:25 — Business problem

“Factory ESG reporting often starts with bills, meter records, and spreadsheets. CarbonOS turns those source values into a reviewable inventory and a reproducible report. This walkthrough uses a synthetic factory, not customer data.”

Show the sample-data notice and the three demo roles. The customer hypothesis is factory ESG/compliance teams; pilot value and time savings still need measurement.

### 0:25–1:00 — Evidence extraction

1. Download the sample electricity bill from “Your three-minute demo.”
2. Open **Activity ledger**, upload the downloaded text file, and show the 125,000 kWh value with its source snippet.
3. Point out **rule match**. Say: “This local demonstration uses deterministic extraction. Optional model-based extraction needs separate provider setup and evaluation.”
4. Do not save a second copy of that bill during this short walkthrough: the same electricity activity is already seeded. If demonstrating data entry separately, use distinct sample evidence and reset before rehearsing the expected totals.

### 1:00–1:35 — Human oversight

1. Switch to **Auditor (Reviewer)**.
2. Approve the submitted diesel record in Activity ledger.
3. Explain that the owner who entered it cannot self-approve; the API enforces this rule.

### 1:35–2:05 — Deterministic accounting

1. Switch to **Submitter (Owner)**.
2. Open **Calculation & reports**, then **Run calculation**.
3. Show Scope 1 **12.06 tCO₂e**, location-based Scope 2 **80 tCO₂e**, and market-based **Not reported**.
4. Show a calculation line/factor version. Explain that these are synthetic fixture calculations, not an official factor or emissions-reduction claim. Scope 3 is outside the current inventory.

### 2:05–2:40 — Independent approval and export

1. Show that **Approve & lock period** is disabled for the preparer.
2. Switch to **Approver (Admin)**.
3. Review and lock the period, then export CSV or JSON.
4. Explain: “The report is an immutable internal snapshot. Re-exporting it reproduces the same content; external assurance is still a separate process.”

### 2:40–3:00 — Close with a pilot request

“We are looking for a pilot partner to evaluate supported bill formats, review effort, and reporting traceability on consented data.”

Use verified team/contact details when available. Do not state customers, paid pilots, model accuracy, revenue, or time savings without evidence.

## Recovery and reset

- A protected deployment displays sign-in/demo-disabled guidance; do not enable public demo mode on a production service to bypass it.
- An unreachable demo service displays a retry action. Check the local API terminal and `/readyz`, then retry.
- Use **Reset demo data** to reseed only this isolated tenant and return to Setup. Existing sessions from before the new approver need reset.
- If a read-only persona lacks an action, select the required persona rather than changing production permissions.
- For a failed live-provider call, disclose that it failed and demonstrate the supported local rule path. Do not replay invented model output.
- Keep genuine screenshots/recording, power, and connectivity backup. Rehearse on the exact laptop/display and confirm organizer setup instructions directly.

## Verification commands

```sh
npm run lint
npm test
npm run build
.venv-esg/bin/python -m unittest discover -s tests -p 'test_esg*.py'
ESG_PYTHON="$PWD/.venv-esg/bin/python" npx playwright test --project=desktop-chromium --project=small-mobile-chromium
```

Stop the two preview processes before automated tests so the runner starts services with its test configuration. For the actual seeded demo journey, run the following separately:

```sh
ESG_E2E_ACCESS_MODE=isolated_demo ESG_PYTHON="$PWD/.venv-esg/bin/python" \
npx playwright test tests/e2e/summit-showcase.spec.ts --project=desktop-chromium --project=small-mobile-chromium
```

No hosted model evaluation, public deployment, or real-device certification is implied by these checks.

## Optional live AI rehearsal

An actual two-case synthetic smoke check succeeded through the configured Gemini integration; see [provider-smoke-check.json](provider-smoke-check.json). This is not an accuracy benchmark.

To rehearse the model inside the app, stop the local API, keep `ESG_ENV=development` and `ESG_ACCESS_MODE=isolated_demo`, remove the `GEMINI_API_KEY=''` override from Terminal 1, and set `ESG_LLM_EXTRACTION_ENABLED=true`. The existing server-side configuration can load the configured credential; never put it in a `VITE_` variable. Use a fresh demo session and upload only the supplied synthetic bill.

The extraction result must visibly say **AI-assisted extraction** and show the model version. If the provider fails or returns invalid evidence, the result should identify **Rule-based extraction** instead. Disclose that fallback during the presentation. Model confidence is self-reported and does not establish correctness. Real customer documents require the applicable processing/consent arrangements before enabling this path.

## Evidence-assistant rehearsal

Open **Evidence assistant** in the ESG workspace. Download the synthetic policy, index it under **Indexed evidence**, and ask “What does the boiler inspection policy require?” Inspect the source excerpt, document/passage IDs, hash, and unreviewed status. Ask “Ocean shipping pension discounts” next; it should show insufficient evidence. These actions do not add any accounting activity.

For optional live RAG synthesis, restart the localhost development API with `ESG_LLM_RAG_ENABLED=true` and the existing server-side model configuration. This is separate from the extraction flag. A validated generated response says **AI synthesis — review required** and names the actual model. Unavailable/rejected generation shows **Retrieved source excerpt**. Demonstrate that distinction honestly. Synthetic policy statements are not regulations.

**Run extraction regression** executes the real ten-case rules suite. It now retains failures, including unsupported CNG. Its synthetic percentages are not measured customer-document or RAG accuracy. The legacy ATLAS screen uses the same endpoint and no longer displays invented hardcoded scores.
