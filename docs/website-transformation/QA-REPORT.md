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

## R01

16 JS tests, type check/build/whitespace pass. Backend: **106 run / 105 pass / 1 PostgreSQL-only skip** locally. Protected inspection/accounting **6 pass**; final extended inspection **2 pass**; isolated showcase/product **16 pass**. Cross-tenant/role/ID-pair/global-owner source tests pass. Actual synthetic API export examples: [desktop JSON](evidence/answer-record-1440.json), [mobile JSON](evidence/answer-record-320.json); [desktop source inspector](evidence/source-inspector-1440.png), [mobile source inspector](evidence/source-inspector-320.png). Revised-hash path is deliberate fault injection; no live model-quality claim. Full contract remains FAIL on 55 legacy color findings.

## R02A

16 JS tests, tsc/build/whitespace pass. Protected history/inspection browser spec: **4 pass** (desktop/320px), including the eleven-query cap, per-answer matching/stale hashes, active state, local clear and reload. [Mobile history](evidence/answer-history-320.png), [desktop history](evidence/answer-history-1440.png). No context-aware conversation or cross-document comparison is claimed. No backend mutation in this task.

## R02B1

110 ESG backend tests run: **109 pass / 1 local PostgreSQL-only skip**. Four new source-scope tests cover authorization before generation, exact candidate context, pre-limit narrowing, selected scope/audit ID, negative validation, no-match/corpus restrictions and no non-SQL broadening. 16 JS tests and direct legacy tenant-isolation suite pass. No frontend runtime changed; browser suite not repeated for this API-only task. R01 hosted ESG CI [41791320522](https://github.com/akramrafid/CarbonOS/actions/runs/41791320522) is SUCCESS; newer commits require their own hosted result. Contract remains FAIL on 55 legacy color findings.

## R02B2

18 JS tests, tsc/build/whitespace pass. Protected comparison + inspection/history **6 browser tests pass** (desktop/320px). Real synthetic 12-month/24-month source comparison, exact request/citation scope, combined download, duplicate validation, partial 503, wrong-scope fault rejection, retry and independent no-evidence behavior pass. [Desktop comparison](evidence/document-comparison-1440.png), [mobile comparison](evidence/document-comparison-320.png); actual synthetic combined records: [desktop JSON](evidence/document-comparison-1440.json), [mobile JSON](evidence/document-comparison-320.json). No automatic conflict-resolution/model-accuracy claim. Full contract remains FAIL on 55 legacy color findings.

## E01A

18 JS tests, type check/build/whitespace pass. Protected accounting/form/delayed-period suite: **8 browser tests pass**; extended reference outage/retry/direct-link suite: **4 pass** (desktop/320px). Tests hold an actual older-period API response, switch periods, then release it; current rows remain correct and aborted errors stay hidden. Direct period state now initializes correctly. Known pre-existing disclosure duplicate-key warning is recorded as E01C, not silently treated as clean console output. Backend unchanged.

## E01C

Type check/build/whitespace pass. Four existing period/reference browser checks pass with the disclosure regression assertion: repeated missing-GHG entries remain present and no duplicate-key React errors occur. Backend disclosure calculations/status rules unchanged.

## E01B1

112 ESG backend tests: **111 pass / 1 local PostgreSQL-only skip**. New filter/paging tests verify exact combined results, cross-tenant exclusion, unknown filters, equal-date deterministic order, unchanged total across pages and invalid bounds. Whitespace passes. No accounting eligibility/schema or frontend change; concurrent offset-page snapshot consistency remains an operational limitation.

## E01B2

20 JS tests, type check/build/whitespace pass. Protected ledger + full accounting **12 browser tests pass** (desktop/320px). Actual 28-row pagination, combined/empty filters, per-page metadata-only counts, evidence detail text, delayed responses and late-action reload scope verified. [Desktop filters](evidence/ledger-filters-1440.png), [mobile filters](evidence/ledger-filters-320.png). Mobile review required a wider scrollable activity table, fixed before final rerun. Full contract still FAIL on 55 legacy color findings. No inventory math/eligibility changes.

## S03

115 ESG backend tests: **114 pass / 1 local PostgreSQL-only skip**. New activity/metric evidence-link negatives/positive shared scopes pass without unauthorized persistence or audit transitions. Direct tenant-isolation suite passes. Protected ledger + source inspection/history + comparison **16 browser tests pass** (desktop/320px); actual extraction-to-draft retains its authorized uploaded document ID. Shared document visibility fails closed when no scope exists. Existing proof snapshots restored. No claim of source accuracy, mandatory evidence completeness or historical-row validation. Full frontend contract remains FAIL on 55 legacy color findings.

## I01A

117 backend tests: **116 pass / 1 local PostgreSQL-only skip**. Numerical + real-API wrong-region selection blocks, no fallback/emission line and lock denial verified. Four protected accounting journey browser tests pass (desktop/320px). Same-region calculations, existing numerical/security controls and stored-snapshot behavior remain. New runs identify methodology 1.0.1; no main branch merge or schema replacement occurred.

## I01B

119 backend tests: **118 pass / 1 local PostgreSQL-only skip**; four protected accounting browser tests pass. Invalid explicit market inputs cannot become an approved run or silently use another factor; ordinary missing market data remains unreported. Version 1.0.2 distinguishes new behavior. Facility-level incomplete-market/JSON-unit issues discovered during review are tracked in I01D and are not claimed fixed here.

## I01D

123 backend tests: **122 pass / one local PostgreSQL-only skip**. Numerical completeness, real API calculate/independent lock/JSON/CSV, formula-injection-safe facility names and stored v1 byte compatibility pass. New version: methodology 1.0.3 / report schema 2. Historical v1 exports remain unchanged, including their known facility unit/completeness defect; they are not retroactively corrected or certified. Whitespace passes. Protected accounting browser journey **4 pass** on desktop/320px. Full frontend contract remains FAIL on 55 legacy color findings; no frontend runtime changed in this task.

## L01A

20 JS tests and TypeScript/Vite build pass. Technology route matrix **20 browser tests pass across ten viewport projects**, followed by **12 final technology/shared-shell tests pass** on desktop/320px after adding the footer entry. Checks cover both themes, resolved canvas/heading tokens, absence of invented operations/commercial claims, actual evidence/trust/pilot navigation, no provider calls from the architecture page, 44px links, no page overflow and no runtime errors. The expanded test initially assumed the wrong light heading override; corrected to the actual registry token and reran. Theme screenshot capture now waits for resolved colors and disables capture-time animations. [Desktop light](evidence/technology-light-1440.png), [desktop dark](evidence/technology-dark-1440.png), [mobile light](evidence/technology-light-320.png), [mobile dark](evidence/technology-dark-320.png). Full source gate remains FAIL on **50 legacy color findings**; checker unchanged. No backend/schema change or scientific/production certification.

Hosted ESG CI success verified for S03 [41812097655](https://github.com/akramrafid/CarbonOS/actions/runs/41812097655), I01A [41813447718](https://github.com/akramrafid/CarbonOS/actions/runs/41813447718), I01B [41814136518](https://github.com/akramrafid/CarbonOS/actions/runs/41814136518). Each result applies to its recorded SHA. I01D run 41815266165 was still running at the last check; no success claimed. The separate frontend-quality contract workflow remains red on source findings.

## L01B

Build/type check/whitespace pass; **10 browser tests pass across all ten viewport projects**, exercising dark/light themes, publisher URLs, scope/registry disclosure, no fake PDF/dead anchors, link hit areas, page width and real internal/footer navigation. [Desktop light](evidence/framework-light-1440.png), [desktop dark](evidence/framework-dark-1440.png), [mobile light](evidence/framework-light-320.png), [mobile dark](evidence/framework-dark-320.png). Original publisher pages manually verified with browsing on 2026-11-04; automated browser tests verify destination URLs without creating a third-party availability dependency in CI. Full source gate remains FAIL on **49 legacy color findings**. No backend change or whole-app legal/accessibility certification.

I01D hosted result correction: [41815266165](https://github.com/akramrafid/CarbonOS/actions/runs/41815266165) completed FAIL on PostgreSQL + Alembic backend tests; SQLite and the full protected browser job passed. Migration/model comparison was skipped after the database failure, so alignment is not claimed for that SHA. Root-cause investigation/fix is immediate task I01E.

## I01E

The hosted failure above is reproduced with a deterministic authorized UUID containing 999. The corrected test separates content from identifiers and asserts exact authorized citations/source text/candidate count; it still fails under intentional tenant-filter bypass. Full local SQLite **122 pass / one PostgreSQL-only skip** and fresh **PostgreSQL 16.14 all 123 pass**. Alembic model comparison: **No new upgrade operations detected**. This includes the I01D numerical/API/export/v1 compatibility checks. The disposable cluster was stopped after use. No production runtime/CI gate weakened or skipped; no browser rerun for this test-only change. Current full frontend contract remains FAIL on 49 legacy source color findings. New hosted verification is pending after push, not inferred from these local results.

## L01C

Build/type check/whitespace pass; **20 browser/API tests pass across ten viewport projects**. Exact displayed authenticated query payload/path executes against a real synthetic uploaded policy and returns its authorized 12-month citation; missing auth is 401. Theme/canvas/heading, code wrapping/no page overflow, metadata, actual evidence/footer navigation and link targets/sizes pass. [Desktop light](evidence/api-guide-light-1440.png), [desktop dark](evidence/api-guide-dark-1440.png), [mobile light](evidence/api-guide-light-320.png), [mobile dark](evidence/api-guide-dark-320.png). Full source gate remains FAIL on **48 legacy color findings**. No invented telemetry endpoint, keys, production OAuth setup or registry service claim; no backend change. No external provider or confidential data used by tests.

## L01D

Build/type check/whitespace pass; **10 browser tests pass across ten viewport projects**, dark/light. Honest vacancy state, no application/POST/form/mailto/JobPosting or unverified role claims, real project/footer navigation, 44px links and no page overflow/runtime errors verified. [Desktop light](evidence/careers-light-1440.png), [desktop dark](evidence/careers-dark-1440.png), [mobile light](evidence/careers-light-320.png), [mobile dark](evidence/careers-dark-320.png). Full source gate remains FAIL on **47 legacy color findings**; no checker change or backend behavior change.

I01E hosted backend [41817200718](https://github.com/akramrafid/CarbonOS/actions/runs/41817200718) is SUCCESS for SQLite, PostgreSQL/Alembic and model comparison. Its frontend job was still running at verification, so no full workflow success is inferred. Later page SHAs require their own hosted result.
