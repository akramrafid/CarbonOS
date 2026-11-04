# Transformation QA evidence

## A00 baseline inspection — 2026-11-04

- Branch: Asif; local/remote baseline `ffc5ffc92e04de2eecfc4cf33327631e6d74160e`; tree clean before audit.
- Main read-only head: `5bd3ba898b5702a54849b173c2f7c0ab844b8ae7`. Divergence 4 Asif-only / 21 main-only. No merge.
- `python3 -m orchestrator.cli frontend-check --area all`: **FAIL**, missing funnel artifact, unresolved measurement/SEO/accessibility/performance docs, 64 source heuristics. Gate remains enforced.
- Runtime suites were not rerun for this documentation-only task. Prior scoped results and limitations are linked in FEATURE-COVERAGE; do not confuse those historical runs with a fresh full release gate.
- Initial documentation checks and subsequent per-task results are appended below before each commit. Remote verification is reported only after successful push.

## Release criteria still outstanding

Full required viewport matrix (including 390 and 1920), complete protected + isolated journeys, main integration regression/migration tests, PostgreSQL, real OIDC, screen reader/zoom/contrast, real device/browser coverage, measured Web Vitals, field scientific validation and operational security/restore/load evidence. No Lighthouse, accuracy, WCAG or production claim is made without measurements.

## D01

- `npm test`: 11/11 pass, including dark/light state/control contrast guards.
- `npm run lint` and `npm run build`: pass (existing browser zlib externalization warning remains).
- Protected `shared-controls.spec.ts`, desktop + 320px: **2 passed** with real API writes and 422 rejection; no synthetic response interception.
- `git diff --check`: pass. Frontend contract remains the previously recorded failure; no gate suppression.

## D02

11 JS tests, tsc and build pass. Protected shared-controls + esg-journey specs on desktop and small mobile: **6 passed**. Tests assert named field descriptions, aria-invalid, invalid-date focus, no invalid HTTP writes, same-day rejection, correction/save and independent protected accounting controls. Backend remained authoritative and unchanged.

## Q01

`responsive-shell.spec.ts`: **40 passed**, ten Chromium projects: 320×720, 375×812, 390×844, 667×375 landscape, 768×1024, 1024×900, 1280×800, 1440×900, 1536×960, 1920×1080. Type check and whitespace pass. New [phone ESG](evidence/responsive-esg-390.png), [phone home](evidence/responsive-home-390.png), [desktop ESG](evidence/responsive-esg-1920.png), [desktop home](evidence/responsive-home-1920.png). This scope checks common shell and ESG panels, not every legacy module or every body string in Bengali.

## X01

11 JS tests, tsc, production build and whitespace check pass. Route recovery **4/4 browser tests pass** (desktop/320px); failures are deliberately injected into lazy loading/rendering, then actual reload/home recovery is exercised. The application shell remains usable. This boundary covers render/module errors, not arbitrary asynchronous event-handler failures.

## S01A

13 JS tests, tsc/build/whitespace pass. Weather browser tests **4 pass**, explicit synthetic provider fixtures; actual live keyless Open-Meteo response also validated separately. No business or user profile data sent. This does not validate agricultural risk predictions or provider availability over time. Historical weather credential revocation remains external.

## S01B

14 JS tests, type check/build/whitespace pass. Production JS/source credential scans pass. Telemetry browser tests **2 pass** (desktop/320px), using explicitly empty Django fixtures and observing no direct Blynk request. No live sensor or authenticated telemetry proxy was tested or implemented; unsupported state is deliberate. Existing wider MRV/scientific/registry workflows still need their separate audit.

## C01

Both workflow YAML files parse; Asif trigger and supported ubuntu-24.04 configuration validated. Local installed Playwright platform/dependency manifests explicitly support 24.04; actual GitHub run 41472555751 identifies 26.04 as the previous Chromium blocker. Test discovery: 250 cases in nine files across ten projects. Hosted result is pending after push; contract remains red and mutation integration remains separate. No claim that Linux CI executed locally on macOS.

## C02

`frontend-check --area all --json`: all required artifacts/sections/template resolution PASS; overall FAIL remains **64 source heuristics**. Machine-readable [result](evidence/frontend-contract-after-artifact-fixes.json). No new runtime behavior in this task; prior test evidence is identified by task above. No Web Vitals/Lighthouse or whole-app accessibility result is invented.

## C03A / correction to C02

C02's named artifact/template checks passed, but its full errors list also had four MRV screen-spec missing-section errors not represented in the checks array. C03A corrects the route/spec and all four errors. Full JSON errors now show only source findings plus their summary (64 findings; full gate remains FAIL). Runtime untouched. This correction does not assert that CarbonMonitoring itself has been validated.

## C03B

4 browser tests pass; generated HTML exists at build/playwright-report/index.html. Workflow YAML parses. Full contract still FAIL on **62 application source findings**, with no screen-spec or generated-report errors. The checker is unchanged. Reports remain available as CI artifacts and local build output.

## C03C

Five static CSS blocks preserve identical text after removing raw HTML APIs. tsc/build/whitespace pass; eight responsive shell tests pass (desktop/320px). Full gate FAIL: **57 color findings**, no raw HTML findings. Hosted ESG CI b31e35e run [41788765542](https://github.com/akramrafid/CarbonOS/actions/runs/41788765542) completed SUCCESS, including both database modes and migration alignment. Later commits require their own CI results; this is a SHA-scoped success.

## C03D

14 JS tests, tsc/build/whitespace pass. Protected desktop/320px product + shell checks: **14 pass, 2 intentional demo-only skips**. New [phone light](evidence/semantic-home-light-320.png), [phone dark](evidence/semantic-home-320.png), [desktop dark](evidence/semantic-home-1440.png), [desktop light](evidence/semantic-home-light-1440.png) evidence. Source gate still FAIL on **55 legacy color findings**; primary home/nav findings resolved.
