# CarbonOS summit upgrade prompt

Improve this existing React/Vite and FastAPI project for the Bangladesh AI Business Summit on 5 November 2026. Preserve the current stack, visual identity, tenant isolation, permissions, and real accounting controls. Work on branch `Asif`; retain other contributors' work. Read AGENTS.md and the readiness audit before editing. Do not rewrite the app or add dependencies without a concrete need.

## Product outcome

Make one credible three-minute demonstration for a factory ESG/compliance team: synthetic electricity bill → proposed quantity with source excerpt → independent review → deterministic Scope 1/2 calculation → separate approval/lock → reproducible export. Use the existing `/platform/esg` workflow. Keep crop diagnosis, registry, and telemetry modules secondary until their independent evidence is established.

## Work in priority order

1. Repair anything that blocks the seeded calculation, independent approval, or export. Demonstrate the expected synthetic totals, preserve rejection of self-approval, and label every fixture as sample/not assured.
2. Make startup, role switching, retry, reset, and signed-out states predictable. Prevent duplicate demo provisioning. Configured OIDC deployments must require sign-in. Production must reject public demo access modes.
3. Add a short in-product walkthrough and a downloadable synthetic bill. Make every step operable at 320, 375, 667 landscape, 768, 1024, 1280, 1440, and 1536 CSS pixels, with keyboard access, readable text, scrolling tables, and no page overflow.
4. Explain the AI boundary. Default rules stay local. Optional model extraction must validate response structure, quantities, confidence bounds, and source excerpts. Show the actual method/model; require review. On failure, label the local fallback. Rehearse only synthetic inputs with the existing server-side credential. Never put credentials in frontend variables or claim model confidence establishes accuracy.
5. Remove unsupported customer, trading, offset, sovereign, verification, and regulatory claims from the lead presentation surfaces. Use verified product capabilities. Inventory remaining claims and third-party logo rights. Never invent traction, ROI, certifications, pilots, or organizer allocation.
6. Prepare a protected hosting plan, exact-laptop rehearsal, genuine backup recording, contact destination, pilot hypothesis, and consented evaluation set. Mark external decisions or absent evidence as unresolved; do not turn a prototype into a production claim through copy alone.

## Acceptance criteria

- Actual API journey passes: seed, extract 125,000 kWh from the supplied bill, approve diesel independently, calculate 12.06 t Scope 1 and 80 t location-based Scope 2, reject preparer self-lock, lock as the separate approver, and download a repeatable report.
- Market-based Scope 2 remains unreported without evidence. Scope 3 remains outside current accounting. New sample factors carry no invented official citations.
- Network failures can be retried, protected entry does not masquerade as offline, reset returns to Setup, and demo identity controls appear only in a demo session.
- Model failures and invalid evidence use labeled rules; invented excerpts, negative/nonfinite quantities, and invalid confidence do not cross the response boundary as accepted AI results.
- Run type checking, JS regressions, ESG API tests, protected and isolated-demo browser tests, production build, and the repository frontend contract check. Record actual failures/skips, test configuration, and meaningful limitations. Passing local Chromium/SQLite checks does not establish real-device, PostgreSQL, accuracy, security, or assurance certification.
- Save an audit, runbook, screenshots, and evidence report. Stage files explicitly, review for secrets, commit and push to `Asif` without merging into the main branch.
