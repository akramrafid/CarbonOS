# Competitive website upgrade: QA evidence

Date: 4 November 2026. Branch: `Asif`. Baseline: `655a067`.

## Outcome and scope

The focused product site, interactive synthetic workflow, pilot-brief download, company/trust pages, and workspace entry links pass the local functional checks below. This establishes a tested prototype increment, not an industry ranking, production certification, real-document accuracy result, or validated customer outcome.

The flow under test is: **homepage → workflow preview → real demo/evidence entry → source/reporting context → pilot choices → local brief download**. Additional checks exercise unsupported choices, invalid section keys, return-to-home navigation, company metadata and indexing hints, keyboard navigation, themes, and responsive boundaries.

Environment: React/Vite at `http://127.0.0.1:3000`, local standalone ESG API at `127.0.0.1:8100`, isolated synthetic SQLite data for demo tests. The Browser plugin's `browser` skill was not available; the installed repository Playwright runner provided automation, with CUA/IAB used for separate manual UI review. No browser dependency was installed. Automated services used test configuration with model calls disabled; the presenter preview uses separate process-local development settings.

## Automated checks

| Run | Observed result |
| --- | --- |
| `npm run lint` | Passed (TypeScript checking) |
| `npm test` | 9 passed, including pilot input validation, unsupported-needs disclosure, and brief content |
| `npm run build` | Passed; existing browser externalization warning for `zlib` remains |
| Default protected E2E suite, 1440×900 + 320×720 | 32 passed; 6 intentionally skipped demo-only cases |
| Isolated product + showcase integration, same two viewports | 16 passed, including source upload/query, independent accounting review, calculation, lock/export/reset, pilot download, and workspace entry |
| Shared responsive suite, all eight viewport projects | 32 passed |
| Final focused product suite after visual/metadata/navigation refinements | 8 passed; includes first-screen phone CTA in both themes, actual downloaded text, no form POST, company metadata, and synchronized evidence entry |
| Final company-title/indexing spot check | 2 passed against the restored local preview |
| `git diff --check` | Passed |
| `frontend-check --area all` | Failed: missing funnel artifact, unresolved measurement/SEO/accessibility/performance templates, and 64 source-heuristic findings |

These runs overlap; their counts are not a count of unique tests or independent quality certifications. The final focused runs cover the last public-site changes. No backend calculation/RAG implementation changed in this increment; the existing real accounting/Evidence API journey was exercised again through the browser integration suite.

Responsive projects: 320×720, 375×812, 667×375 landscape, 768×1024, 1024×900, 1280×800, 1440×900, and 1536×960. The main navigation now switches at 1280 px for its smaller, focused link set. Modal focus, Escape, resize cleanup, language controls, skip navigation, hashes, form/table boundaries, and viewport fit remain checked.

## Manual and visual review

CUA/IAB verified the new page identity and nonblank content, selected the calculation preview, observed 80 tCO₂e with its explicit synthetic factor/formula, changed pilot options to scanned documents/extended accounting/Bengali, and prepared the outline. The result visibly retained the unsupported OCR/Scope 3 requirements and exposed a download control. Automated tests separately downloaded and read the actual file, confirming selected values and the absence of a submitted enquiry.

The manual phone check measured 320 CSS px document width inside a 320 px viewport, with no horizontal page overflow. The temporary viewport override and theme were restored. A fresh manual product tab had no relevant console errors/warnings or framework overlay. The broader shared-route test also visits older farmer/research pages: geolocation denial, WebSocket failure and weather-provider fallback warnings were observed there. Those services are not represented as healthy or validated by the product-page result.

Material fixes from visual inspection:

- Removed the hero entrance effect that hid primary content on arrival.
- Reduced narrow-phone heading sizes so the complete primary demo CTA fits the first 320×720 viewport in dark and light themes.
- Added a light-theme image veil for readable text and reduced the terminal-card shadow.
- Narrowed a global navigation background selector that treated hover classes as permanent light-theme backgrounds.
- Kept the scope table inside a named keyboard-scrollable region, checkbox labels touch-sized, and footer/navigation controls reachable.
- Replaced invented pricing, verification, telemetry, registry and commercial promises on the lead page with the currently supported workflow and labeled boundaries.

The design hook found no deterministic issues in the scanned Navbar/FactoryWorkflow changes. No suppressions or quality-gate waivers were added. This does not establish that the full design or repository gate passes.

## Build-size evidence

[product-bundle-comparison.json](product-bundle-comparison.json) records the previous increment's observed build output against this increment with unchanged package dependencies:

| Vite main JavaScript entry | Baseline | Updated |
| --- | --- | --- |
| Raw | 555.76 kB | 338.25 kB |
| Gzipped | 173.24 kB | 106.25 kB |

The entry is **38.7% smaller when gzipped**. The 1,096,601-byte footer background is no longer requested by the new footer. Old homepage modules are absent from the home import graph; their research/source files remain in the repository.

This measures build artifacts, not total page weight, all shared/lazy chunks, network transfer in a real deployment, LCP, INP, or visitor conversion. The landscape hero and external fonts remain optimization/rehearsal considerations. Real-device and cold-network performance checks are outstanding.

## Screenshots and artifacts

- [Homepage, desktop dark](product-home-1440.png)
- [Homepage, desktop light](product-home-light-1440.png)
- [Homepage, 320 px dark](product-home-320.png)
- [Homepage, 320 px light](product-home-light-320.png)
- [Selected workflow calculation, manual](product-workflow-1440.png)
- [Prepared pilot outline, desktop manual](product-pilot-1440.png)
- [Prepared pilot outline, phone manual](product-pilot-320.png)
- [Full competitor review and roadmap](COMPETITOR_REVIEW.md)

Historical screenshots from prior increments were restored after automated capture; this increment's artifacts use the `product-` names above.

## Reproduce

Stop the presenter preview before browser tests so the runner starts fresh services with its test settings:

```sh
npm run lint
npm test
npm run build
ESG_PYTHON="$PWD/.venv-esg/bin/python" npx playwright test --project=desktop-chromium --project=small-mobile-chromium
ESG_PYTHON="$PWD/.venv-esg/bin/python" npx playwright test tests/e2e/responsive-shell.spec.ts
ESG_E2E_ACCESS_MODE=isolated_demo ESG_PYTHON="$PWD/.venv-esg/bin/python" npx playwright test tests/e2e/product-site.spec.ts tests/e2e/summit-showcase.spec.ts --project=desktop-chromium --project=small-mobile-chromium
.venv-esg/bin/python -m orchestrator.cli frontend-check --area all
```

No production deployment, external enquiry, email, payment, or public hosting change was made. The project name is confirmed; public contact, domain, deployment/privacy commitments, real-data evaluation, independent assurance, physical devices, and remaining repository release gates still need resolution. The current prototype notices do not replace agreed commercial/legal terms for a real pilot.
