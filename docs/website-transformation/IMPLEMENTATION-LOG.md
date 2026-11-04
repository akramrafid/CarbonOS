# Transformation implementation log

## A00 — Baseline audit (2026-11-04)

Phase: audit. State: PUSHED. Commit `7531f4611f2b91099a35aebcd9a7d6ae94d1b06a` matched remote Asif after push.

Files: ROADMAP, IMPLEMENTATION-LOG, FEATURE-COVERAGE, QA-REPORT, REMAINING-GAPS in this directory.

Inspected clean Asif `ffc5ffc`, fetched origin and fast-forward checked Asif; inspected route tree, shared UI/theme, ESG callers, MRV/registry API call sites, legacy simulation markers, dependencies, Playwright projects, CI workflows and read-only main history/file comparison. Main is 21 commits ahead of the merge base, with four Asif-only commits. No main integration performed.

Validation: baseline `frontend-check --area all` FAIL (missing funnel; four unresolved template documents; 64 source heuristics). This documentation task does not change runtime behavior or rerun every historical suite. Git whitespace/diff and artifact/link consistency checks are required before commit. Push uses `git push origin HEAD:Asif`; compare full local SHA with `git ls-remote origin refs/heads/Asif` before reporting PUSHED.

Next: D01 semantic state tokens and theme-safe shared ESG components.

## D01 — Theme-safe shared feedback and controls (2026-11-04)

Phase 1. State: PUSHED. Commit `bc6db2a46b51c99a7934d60f00057506f24447ee` matched remote Asif after push.

Files: src/index.css, src/pages/platform/esg/ui.jsx, tests/js/designTokens.test.mjs, tests/e2e/shared-controls.spec.ts and these tracking documents.

Added semantic success/warning/danger/neutral colors for each theme and control background/text/border/focus/primary-action tokens. Shared notices, status badges, input/select and buttons use them; actual status text, live-region roles, disabled states and 44px controls remain. Token tests require ≥4.5:1 text and ≥3:1 control-border/focus contrast. These limited tests do not establish whole-app WCAG compliance.

Validation: 11 JS tests pass; tsc and production build pass; real protected API browser test passes on 1440 and 320px (2 tests) for saving a legal entity, theme colors/focus and rejected invalid-period feedback. Initial run hit the old preview's different signing secret (401); stopped only our preview processes and reran with isolated test services. A direct theme-color assertion raced the existing transition; changed it to Playwright's retrying CSS assertion. Final rerun passes. No backend or tenant-control changes.

Next: D02 programmatic form descriptions and date-range validation.

## D02 — Accessible field help and validation (2026-11-04)

Phase 1/9. State: PUSHED. Commit `e1de8a61d51a74095d06083663def7400e8ee732` matched remote Asif after push.

Files: shared ui.jsx, SetupPanel.jsx, index.css, shared-controls.spec.ts and tracking docs. All Input/Select callers now receive stable label and help IDs, with existing caller IDs/descriptions preserved. Visible errors connect through aria-describedby and aria-invalid. Reporting periods reject reversed or equal dates before a request, focus the end-date field and clear the error on correction; required/native validation and backend rules remain in force.

Validation: 11 JS tests, type check and production build pass. Protected browser tests (1440px + 320px) **6 passed**, including accessible input/select descriptions, zero invalid-period requests, correction/save, and complete accounting journeys with independent approvals, locking, export and negative permissions. Whitespace check passes. No backend changes.

Next: Q01 add and exercise 390px and 1920px responsive projects.

## Q01 — Complete requested viewport widths (2026-11-04)

Phase 10/14. State: PUSHED. Commit `ec622683e6eccf073afee0b7e8661cb676e5991c` matched remote Asif.

Files: playwright.config.ts, responsive-shell.spec.ts, four new evidence PNGs and tracking docs. Added 390×844 phone and 1920×1080 desktop projects; retained all eight earlier projects including landscape. New screenshots use this directory's evidence folder, preserving historical QA images.

Validation: responsive shell across ten projects **40 passed (35.2s)**. Includes navigation bounds, native mobile focus/Escape/restore, EN/BN navigation, skip links, shared routes, 404 recovery, real protected ESG API forms/all tabs, 44px controls, table keyboard access, theme switching and resize unlock. Type check and whitespace pass. Inspected 390px ESG and 1920px homepage screenshots. Chromium emulation is not real-device or full bilingual/content/assistive-technology certification.

Next: X01 recoverable route error boundary.

## X01 — Page failure recovery (2026-11-04)

Phase 9. State: PUSHED. Commit `4f05dccbcc5225fa201bbd4768bc21ad673d03d0` matched remote Asif.

Files: App.jsx, RouteErrorBoundary.jsx, route-recovery.spec.ts and tracking docs. A pathname-scoped React error boundary surrounds routed content while preserving the main navigation/footer. Failed module loading and render errors show an alert with reload/home recovery and a truthful unsaved-edit notice. The UI does not expose raw exception messages. Path changes reset the boundary; query-only workspace navigation does not remount it.

Validation: 11 JS tests, type check and production build pass; **4 browser tests pass** on desktop/320px for aborted lazy imports, successful reload, deliberately injected render exceptions, no raw error in the page and home recovery. The initial reload assertion used the wrong Trust heading; corrected it to the existing visible heading and reran. Tests deliberately cause expected React console exceptions. No external reporting or extra dependency added.

Next: S01 remove frontend provider credential requests, preserving explicit unavailable telemetry states.

## S01A — Credential-free, honest city weather (2026-11-04)

Phase 13. State: PUSHED. Commit `9c79d424c4f3df8dc7440ea4ae75d5181e62cf71` matched remote Asif.

Files: HarvestGuardDashboard.jsx, cityWeather.js, Privacy.jsx, JS/browser weather tests and tracking docs. Removed the embedded weather credential and OpenWeather requests/images. Reused the existing Open-Meteo fallback as the keyless primary path, with bounded supported cities, finite/range/unit/time validation and abort-safe location changes. Weather no longer falls back to invented conditions. UI identifies model estimates, provider and timestamp/timezone; offers unavailable/retry; city selector is labelled and 44px. Weather loads only after the local profile exists and sends city coordinates, without profile/contact fields. Provider contract checked against https://open-meteo.com/en/docs on 2026-11-04.

Validation: **13 JS tests pass**, tsc/build pass, **4 browser tests pass** on desktop/320px using explicit provider fixtures for value/provenance, outage/retry, malformed payload and no credential-bearing requests. Separate real public Dhaka request passed the same response validator (model timestamp 2026-11-04T12:45 Asia/Dhaka); this is one connectivity check, not uptime evidence. Source diff reviewed without reproducing credential values. Operator revocation/rotation remains required for the credential in historical commits; history was not rewritten.

Next: S01B remove browser Blynk credential calls and present unsupported live telemetry honestly.

## S01B — Remove browser Blynk credentials and false live metrics (2026-11-04)

Phase 13. State: PUSHED. Commit `08d0b692b9fd0db590a0731b0bf7f56c02985722` matched remote Asif.

Files: LiveMetrics.jsx, MRVDashboard.jsx, browserCredentialPolicy.test.mjs, telemetry-integrity.spec.ts and tracking docs. Deleted both direct Blynk credential/request paths and polling, the unneeded browser ingestion/write path and fabricated mitigation increments. Dashboard live count/satellite/mitigation show unavailable/not calculated. Unsupported gateway is explicit; no false offline sensor alert is generated when connectivity is unknown. Unmounted legacy LiveMetrics retains explicitly labelled synthetic station fixtures, with no invented live fallback, packet count or hardware-signature claim. Existing history/trend reads are retained; they are not authenticated live telemetry proof.

Validation: **14 JS tests pass**, including a frontend credential policy scan; tsc/build/whitespace pass. Production JS scan finds no direct Blynk URL or Vite Blynk token configuration. **2 browser tests pass** on desktop/320px with empty fixture history/trends, explicit unsupported status, no fabricated metrics and no provider requests. First policy test exposed URL-encoded workspace spaces; fixed it with Node fileURLToPath, reran successfully.

An authenticated server gateway and provider rotation remain external/unimplemented dependencies. No live hardware integration is claimed. Next: C01 supported browser CI and Asif workflow execution.

## C01 — Supported, observable Asif CI (2026-11-04)

Phase 14. State: PUSHED. Commit `b31e35e61fd72a570f2febeda9c1b10f621b7a4f` matched remote Asif; hosted runs 41788765542 (ESG) and 41788765481 (contract) started.

Files: .github/workflows/frontend-quality.yml, esg-ci.yml and tracking docs. Actual main run https://github.com/akramrafid/CarbonOS/actions/runs/41472555751 fails Chromium installation on Ubuntu 26.04. Installed Playwright 1.56.1 maps/supports Ubuntu 24.04 and includes its dependency manifest; pinned runners to ubuntu-24.04. Added Asif push triggers, Node 22 (compatible with Vite's >=22.12 requirement), the missing Python API dependencies in the contract-dependent browser job, two browser workers and failure-report artifacts. Preserved the failing contract dependency and real protected API tests; no gate removed or ignored.

Validation: Ruby YAML parser validates both workflows and explicit Asif/runner settings; Playwright lists **250 tests in 9 files / ten projects**. Recent local focused suites and build/type/unit checks are recorded above. Hosted execution can only be observed after this commit's push; do not claim CI green yet. Latest official Vite/Playwright docs consulted; installed Playwright platform source is the version-specific runner evidence. Main's separate mutmut/pytest failure was confirmed in logs; its source/config is absent on Asif and remains C04/integration work.

Next: C02 resolve frontend contract template artifacts with actual evidence and explicitly unmeasured states.

## C02 — Replace contract templates with factual evidence (2026-11-04)

Phase 14. State: PUSHED. Commit `566d2607effecf0f51bca0b7ca1f8802bd7c2383` matched remote Asif.

Files: docs/growth/funnel.md, analytics/measurement-plan.md, seo/technical-seo.md, design/accessibility-spec.md, design/component-traceability.md, performance/report.md, design-system/MASTER.md, machine-readable contract evidence and tracking docs. Added the missing implemented funnel; replaced four unresolved templates; corrected unsupported design/traceability assertions. Analytics events are proposed/unimplemented, crawl/domain/schema gaps explicit, accessibility scope bounded, Web Vitals/Lighthouse unmeasured. Actual current build bytes recorded with method and artifact hashes, not relabelled as browser timing.

Validation: full frontend contract rerun: **all artifact/section/template checks pass**, full result still **FAIL: 64 source heuristics** (unchanged). No checker modifications, bypasses or waivers. Artifact JSON is preserved in evidence/frontend-contract-after-artifact-fixes.json. Markdown whitespace check passes. Runtime tests not repeated for this documentation-only task.

Next: C03 inventory and fix source findings in independently reviewable route/component batches; preserve dark/light behavior. Remaining main accounting/mutation and scientific integrations remain separately tracked.

## C03A — Correct the MRV screen contract (2026-11-04)

Phase 14. State: PUSHED. Commit `c7e9e052a40c26e33f5dad5c88b6fbb185cb0f13` matched remote Asif.

Files: design-system/pages/carbon-monitoring.md and tracking docs. Replaced the inaccurate route and unverified fixed scientific/attestation claims with actual research API/state boundaries, required visual/responsive/interaction/accessibility/instrumentation sections and explicit untested acceptance work.

Correction to C02: all named artifact/template checks passed, but the checker also appends screen-spec errors outside its checks array. Inspection of the full errors list found four missing sections in the old MRV spec. The earlier “all section checks pass” report was too broad; those four errors are fixed here. Full JSON errors are now inspected, not just named check results. The full gate still fails 64 source findings, including two in generated Playwright HTML. No checker code was altered.

Validation: full contract JSON rerun contains **zero screen-spec errors** and unchanged source finding count. Whitespace passes. Runtime behavior unchanged; no runtime tests repeated. Next: C03B standard build location for generated browser reports.

## C03B — Separate generated browser reports from product source (2026-11-04)

Phase 14. State: PUSHED. Commit `5374377d910eb8ac66729a6d732b28067450fbca` matched remote Asif.

Files: Playwright config + scaffold template, both CI artifact paths, .gitignore and tracking docs. HTML reports now go to build/playwright-report; previous generated local report preserved under build/playwright-report-previous. Both CI jobs retain the actual new report and test-results as artifacts. No checker exclusions or rule changes were made; standard build output was already excluded by the checker. Product source stays fully checked.

Validation: both workflow YAML files parse; route recovery **4 browser tests pass**, producing a real HTML report at the new location. Full contract contains zero screen-spec/generated-report errors; **62 application source findings remain** (the two former generated-HTML findings are gone). Whitespace passes. Existing historical machine-readable snapshot is retained as historical evidence. Next: fix unsafe raw-HTML style APIs and primary page token findings in separate tasks.

## C03C — Ordinary React style elements (2026-11-04)

Phase 1/14. State: PUSHED. Commit `ac2fdab7a509cd525ccc9cb90d5c64c80ec9bd00` matched remote Asif.

Files: CorporateSaaSPipeline, CameraCapture, DiagnosisResult, PaymentStatusTracker, FarmerPaidCard and tracking docs. Replaced five unnecessary raw-HTML APIs with React style children; inspected every caller and asserted static CSS text preserved byte-for-byte, with no interpolated values. These were static trusted literals; this is removal of an unnecessary injection API, not a claim that an exploit was demonstrated.

Validation: tsc/build/whitespace pass; **8 responsive/browser tests pass** on desktop/320px (shared/farmer routes and protected ESG panels). Full contract now has **57 remaining color-token findings**, zero raw-HTML API findings. No new test for the trivial syntax substitution; content-preservation assertion and existing route/build checks verify it.

Hosted CI update: https://github.com/akramrafid/CarbonOS/actions/runs/41788765542 at b31e35e completed **SUCCESS**, including frontend E2E and backend SQLite, PostgreSQL and migration/model checks. Separate contract workflow still fails as expected on outstanding source colors. This proves the CI repair, not production Postgres/OIDC/restore/load readiness. Next: C03D migrate primary home/navigation colors to existing semantic theme foundations.

## C03D — Semantic primary website colors (2026-11-04)

Phase 1/14. State: PUSHED. Commit `d7ab77b085e6638ef222600cdeb85f911c3a3aa6` matched remote Asif.

Files: Hero.jsx, Navbar.jsx, index.css, product-site.spec.ts, four new theme screenshots and tracking docs. Home/nav use existing semantic canvas/accent/control/nav variables. Centralized hero panel/shade/glow/grid CSS; separate light/dark panel and shade tokens preserve readable composition. Primary CTA now shares the tested theme-specific button text/background. New screenshots preserve earlier showcase evidence.

Validation: **14 JS tests pass**, tsc/build/whitespace pass. Product + responsive browser specs on desktop/320px: **14 pass, 2 intentional isolated-demo-only skips** under protected mode. Visually inspected new 320px light and 1440px dark screenshots; first-screen phone CTA, themes, menu/focus/resize, navigation, forms and local pilot download remain usable. Full contract still FAIL, reduced to **55 legacy color findings**, no primary Hero/Navbar findings. No checker modifications. Next: R01 evidence source inspector/export, retaining current tenant and grounding controls; remaining legacy token migration stays open.

## R01 — Authorized full-passage review and answer records (2026-11-04)

Phase 7. State: PUSHED. Commit `919f1cbbbdd2e6e2b28e6a4f7ba466e258b01f47` matched remote Asif.

Files: ESG router/API contracts, EvidenceAssistantPanel/EvidenceAnswer, evidenceRecord helper, backend/JS/browser tests, four synthetic evidence artifacts and tracking docs. New read-only document/passage endpoint pairs both IDs and enforces SQL tenant or exact operator-owner/corpus visibility. The document list now uses the same strict owner/corpus policy as retrieval. Full indexed text, page/status and passage/file hashes are returned, without original filesystem paths. Cross-tenant/unknown/mismatched pairs return identical 404; missing token and unsupported roles are denied.

Answer UI can explicitly load the complete indexed passage, retry failures and compare its current hash to the citation. A changed hash shows a stale-answer warning. JSON download preserves the actual server response, model/method/mode/citations and inspected passages, marks hash matches explicitly, and states human review is still required. The exported timestamp is client receipt time, not signed evidence. State is scoped to each answer; a new abstention has no old inspected sources. No model, retrieval ranking or accounting permissions were changed. No original-file viewer or semantic correctness guarantee is claimed.

Validation: **16 JS tests pass**, tsc/build/whitespace pass; **106 ESG backend tests run: 105 pass / one PostgreSQL-only local skip**, including three new source API authorization/visibility/hash tests. Protected source inspection + accounting journeys: **6 pass**; extended stale-source/failure/retry/export/text-safety/abstention test: **2 pass**. Existing isolated showcase/product suite: **16 pass**. Hash-change browser case explicitly injects a revised provider response to exercise stale-state handling; ordinary inspection/export uses the real API and synthetic uploaded text. Inspected 320px screenshot. Earlier broad-source fixture named the global factor owner incorrectly; corrected it to the actual config value. A browser assertion initially searched a control inside closed native details; opened the details before asserting and reran. Existing screenshot artifacts overwritten by tests were restored; new evidence is stored separately.

Full frontend contract still fails the **55 recorded legacy color findings**, without new findings or checker changes. Next: remaining design/source migration, conversation/document-review usability and selective main accounting integration, each with its own tests/push.

## R02A — Independent in-memory answer history (2026-11-04)

Phase 7. State: PUSHED. Commit `c2d35650368790b66ea059ebc9fa8170c01e7743` matched remote Asif.

Files: EvidenceAssistantPanel.jsx, EvidenceAnswer.jsx, evidence-inspection.spec.ts, two history screenshots and tracking docs. Keeps the ten most recent results while the evidence view remains mounted. Selecting a result preserves its own original response, receipt time, inspected source and stale-hash state. The selected question and a visible “Viewing” label prevent confusion with draft form text; aria-pressed communicates active selection. Clearing/reload removes local history; it does not delete server audit records. No browser storage or new API/permission was added. Each question still searches independently: this is not an assertion of conversational model memory. Document comparison remains R02B.

Validation: **16 JS tests pass**, type check/build/whitespace pass, **4 real-API browser tests pass** on desktop/320px: retained matching/stale sources across answer switches, one active selection, safe export/abstention, local clearing, eleven queries leaving ten entries, and reload clearing all history. No backend code changed or backend tests repeated for this task. History screenshot reviewed on mobile; prior R01 generated proof snapshots restored. The first commit/push attempt was not executed because automatic approval review reached its usage limit; retry follows the stated reset time and the user's Continue instruction. Next: selected-document comparison, remaining source/design migration and main accounting integration.

## R02B1 — Authorized document-scoped retrieval (2026-11-04)

Phase 7. State: PUSHED. Commit `e37e4dee2afd3c4051eebc74a880c6753d2fa30c` matched remote Asif.

Files: ESG query schema/router/retriever, API contracts, test_esg_document_queries.py and tracking docs. Optional one/two-document scope narrows SQL candidates before limit/ranking/model context. Empty, repeated, whitespace and oversized IDs/lists fail validation; foreign/unknown/mixed inaccessible/wrong-owner documents fail uniformly before search/model. Missing matches or excluded corpus returns insufficient evidence, never a broadened search. Direct non-SQL scoped retrieval is rejected. Responses include actual query ID/selected scope; existing append-only audit records scoped IDs/corpus/model/mode linked to that query. No schema migration/new provider required; ordinary queries retain their prior corpus behavior.

Validation: **110 backend tests run / 109 pass / one PostgreSQL-only local skip**; four new scoped-query tests include candidate-limit=1 on an older selected document, context/citation isolation, no generation on unauthorized IDs, validation negatives, shared/corpus scopes and audit linkage. **16 JS tests pass**; direct legacy tenant-isolation suite passes; whitespace passes. Initial no-match fixture shared the generic word “policy” with the question and therefore matched lexical search; the scope test now uses the specific query “boiler inspection” to test truly absent terms. This does not establish semantic relevance quality; the synthetic lexical limits remain explicit.

Hosted update: R01's actual source-inspection commit 919f1cb passed ESG CI (https://github.com/akramrafid/CarbonOS/actions/runs/41791320522), including PostgreSQL and full protected browser suite. Separate design contract remains red on 55 legacy color findings. Next: R02B2 side-by-side document evidence UI using this tested scope boundary.

## R02B2 — Real two-document evidence comparison (2026-11-04)

Phase 7. State: PUSHED. Commit `8c226b89c8737320cd028f90ae51403e29da7144` matched remote Asif.

Files: DocumentComparisonPanel, assistant/answer views, shared evidenceRecord helper, JS/browser tests, four synthetic comparison artifacts and tracking docs. A focused question runs as two independent, authorized document-scoped queries. Results retain exact question/source IDs, query IDs, model/method, excerpts, full source inspector and per-answer export. Combined JSON preserves both actual responses and any source errors; it excludes full inspected passages explicitly. Duplicate source selection focuses/marks the second control without querying. Missing evidence remains source-specific. Failed queries or unconfirmed question/document/citation scope produce explicit unavailable states rather than old/other-source answers; retry reruns the selected scope. The display and export make no automatic conflict/authority decision. Document identifiers distinguish same-name indexed versions; no date/timezone interpretation is invented.

Validation: **18 JS tests pass**, type check/build/whitespace pass; **6 real-API browser tests pass** on desktop/320px (comparison plus inspection/history regressions). Tests cover source A 12-month vs source B 24-month passages, distinct single-source request IDs/citations, no query for duplicates, actual combined download, simulated per-source 503, deliberately wrong scope response rejection, successful retry and source-specific abstention. Core comparison/export uses actual uploaded synthetic sources and the real API; outage/wrong-scope branches are explicit fault injection. Desktop/mobile comparison screenshots inspected. Prior generated history/source proof artifacts restored. Backend unchanged from R02B1; no duplicate backend suite run. Full frontend contract remains FAIL on **55 legacy color findings**.

Next: remaining core workspace UX and legacy source/security audits, followed by selective main accounting integration; scientific/production external blockers remain explicit.

## E01A — Reliable workspace/period data loading (2026-11-04)

Phase 4/9. State: PUSHED. Commit `afde0dd5e3098b4127425a283452cc47d71295b0` matched remote Asif.

Files: shared ui.jsx hook, EsgWorkspace.jsx, ledger-review.spec.ts and tracking docs. Shared GETs abort superseded/unmounted requests, ignore aborted results/errors, and immediately hide data belonging to a different path. Workspace reference reads similarly reject stale requests and tag results by organization. Dependent panels mount only after actual types/periods/facilities arrive, fixing direct-link empty internal period state. Reference failures are explicit with retry instead of being converted to empty lists. Valid same-organization reference data remains mounted during refresh, preserving review/report form state.

Validation: **18 JS tests pass**, tsc/build/whitespace pass. Protected shared-controls + complete accounting + delayed-ledger browser suite **8 pass** on desktop/320px. Extended reference failure/retry and direct ledger/reports/metrics/disclosures checks **4 pass**. First delayed test exposed the pre-existing direct-link initialization bug, fixed at the shared reference-loading boundary for all dependent panels. The disclosure view emits a pre-existing duplicate React key warning for repeated missing-GHG messages; functional checks pass, but E01C records and fixes that warning next. No backend/schema changes or accounting rule changes.

Next: E01C disclosure-list keys, then E01B ledger filters/pagination/evidence metadata.

## E01C — Preserve repeated disclosure gaps without key collisions (2026-11-04)

Phase 4/9. State: PUSHED. Commit `0ae1fecebe687421bfb53145f959bf3efd2ad7bc` matched remote Asif.

Files: DisclosuresPanel.jsx, ledger-review.spec.ts and tracking docs. Repeated identical missing-data messages now use per-list positional keys rather than their duplicate text. These are stateless text entries; every requirement/gap remains displayed. No deduplication, suppressed console warning or disclosure-rule change.

Validation: type check/build/whitespace pass. Existing delayed/reference/direct-view browser checks **4 pass** on desktop/320px, now additionally waiting for actual disclosure gaps, confirming multiple repeated missing-GHG messages remain, and asserting no duplicate-key console errors. No new test for the trivial syntax change; strengthened the existing meaningful view test. Next: E01B ledger filtering/pagination/evidence metadata.

## E01B1 — Ledger filters and stable page ordering (2026-11-04)

Phase 4. State: PUSHED. Commit `077203ed5f42f8c28416793be3f3deb8057bbe04` matched remote Asif after retry; GitHub rejected the first push with an Internal Server Error, not an auth/history problem.

Files: ledger_router.py, test_esg_ledger.py, API contracts and tracking docs. Added activity-type filtering alongside period/facility/status. Shared list ordering now breaks equal primary sort values by record ID, preserving deterministic pages for an unchanged dataset. Totals remain counts of all tenant-authorized matching records before paging. Limit/offset bounds remain enforced. Filters do not change calculation or approval inputs; offset pagination is not a concurrent snapshot guarantee.

Validation: **112 ESG backend tests run / 111 pass / one PostgreSQL-only local skip**, including combined type/status/facility/period filters, cross-tenant empty results, unknown filters, stable tied-date pagination, before-page totals and bounds. Whitespace passes. No frontend code changed or duplicate browser/build checks run for this API task. Next: E01B2 ledger controls, per-page evidence metadata and explicit empty/filter states.

## E01B2 — Ledger review controls and honest metadata (2026-11-04)

Phase 4. State: PUSHED. Commit `70de23be18e9b93962e07e887400ad628e74fb09` matched remote Asif.

Files: LedgerPanel, shared ui hook/Table, ledgerEvidence helper, JS/browser tests, two filter screenshots and tracking docs. Added combined facility/activity/status controls, clear/reset, 25-row paging and actual matching totals. Evidence summary counts only reference metadata on the loaded page and explicitly disclaims validity/approval/period-wide coverage. Details show recorded type/reference/document ID/excerpt/record ID without pretending an ID verifies a file. Unknown facility names fall back to actual IDs. Calculations still use eligible approved period records, independently of these filters.

Shared reload now reads the latest path and ignores calls after unmount, so an older save finishing after period/filter changes refreshes the current view rather than reviving a prior query. The activity table uses a readable 1100px minimum inside the existing named keyboard-scroll region; other tables retain 600px. A mobile screenshot caught squeezed columns at the older default width; fixed before commit and refreshed evidence.

Validation: **20 JS tests pass**, type check/build/whitespace pass. Ledger + complete protected accounting journey **12 browser tests pass** on desktop/320px, including 28 real API records across two pages, combined/empty/reset filters, metadata/details, page boundaries, delayed GET/reference failures and a delayed submit after period change. The original journey's broad SUBMITTED text selector became ambiguous with the new dropdown; scoped it to the actual record table and reran without weakening the status assertion. Final mobile screenshot inspected. No backend/accounting changes. Full contract remains FAIL on **55 legacy color findings**.

Next: validate document identifiers supplied as activity evidence against actual authorized SQL documents, then remaining workspace/source and main integration work.

## S03 — SQL-authorized evidence identifiers on new records (2026-11-04)

Phase 4/13. State: PUSHED. Commit `d4545ac7daa826894ebdb8d869ecd3bdc3b08d58` matched remote Asif.

Files: evidence.py, ledger/metrics services, ESG routers/retriever, API contracts, source-link/backend/browser tests and tracking docs. Centralized the existing exact owner/corpus SQL visibility rule for retrieval, listing, inspection and source references. New activities and metric observations with a supplied document ID require an existing visible source; unknown/foreign/misowned references receive identical 404 before persistence/audit. Identifier length is bounded to the declared 36-character document schema. Empty visibility configuration fails closed. Manual records without a linked ID remain possible; source existence/access is not accuracy or human approval. Existing historical rows are not rewritten or retroactively certified.

Validation: **115 ESG backend tests run / 114 pass / one PostgreSQL-only local skip**; three new source-reference tests cover private/shared validity, wrong-owner/corpus/unknown/length denial, no partial record/audit writes, unchanged DRAFT/UNREVIEWED state, manual paths and empty configuration. Direct legacy tenant isolation passes. Protected ledger + comparison + inspection/history browser suite **16 pass** on desktop/320px, including actual synthetic document upload, rule extraction, Use, draft save and the exact stored source ID. Initial metric fixture used an unsupported dimension and wrong assumed HTTP status; corrected to the actual groundwater metric/200 contract and reran. Prior generated evidence snapshots restored; backend tests exercised the common SQL refactor. No new model/provider, schema migration, verification status or mandatory-evidence policy.

Full frontend contract remains FAIL on 55 legacy color findings. Next: selective main accounting integration and remaining design/security/production work, with honest external-data/operational blockers.

## I01A — Selective main location-factor region safeguard (2026-11-04)

Phase 4. State: PUSHED. Commit `8778fd900f9f62748d2ff16740670ea36fc102f8` matched remote Asif.

Files: accounting.py, numerical/ledger tests, ACCOUNTING_METHODOLOGY.md and tracking docs. Read-only main comparison spans ~1,800 changed lines across engine/models/router/ledger/tests and includes overlapping schema/market changes. Selectively integrated the contained explicit location-based region rejection from main rather than replacing the engine. Wrong-region explicit location input now blocks with SELECTED_FACTOR_OTHER_REGION and an explanatory detail, without falling back to an otherwise available local factor. Same-region math and current strict market-input policy remain intact. New calculation methodology is carbonos-ghg-scope12-1.0.1; historical snapshots are unchanged.

Validation: **117 ESG backend tests run / 116 pass / one local PostgreSQL-only skip**. New numerical/API tests prove the bypass is closed, same-region decimal arithmetic remains correct, invalid location total/lines are not generated, and an independent approver cannot lock the blocked run. Complete protected accounting journey **4 browser tests pass** (desktop/320px). Whitespace passes; no frontend change requiring a duplicate build. Existing finite-number, duplicate-ID, unit/date, GWP, auth/tenant, review and reproducible-export tests pass. Official GHG Protocol Scope 2 Guidance Chapter 6/Table 6.2 and Calculation Tools FAQ reviewed; links and implementation limits recorded in the methodology. Remaining main features/schema and full Scope 2 conformance are not claimed.

Next: I01B explicitly invalid market-based selections, with separate tests/version/push.

## I01B — Explicit invalid market inputs are blocking (2026-11-04)

Phase 4. State: PUSHED. Commit `0962c6c3107d13e1acc0237400cf46a9b51f6551` matched remote Asif.

Files: accounting.py, numerical/ledger tests, methodology and tracking docs. Explicit market factors now respect the configured facility factor-region mapping. Wrong-region, unapproved, inapplicable or nonfinite selected factors produce their actual blocking error without substitution. Missing optional market input keeps its existing non-blocking/unreported behavior. Location totals remain separate, but an invalid explicit market selection prevents locking. New methodology version 1.0.2 records this change; existing snapshots remain immutable. This exact configured-region check is not full market geography, certificate quality or contractual-instrument validation.

Validation: **119 backend tests run / 118 pass / one PostgreSQL-only local skip**. New numerical cases cover four invalid selected-factor modes despite an available valid alternative, valid selected market arithmetic and unchanged absent-input behavior. API test verifies wrong-market error, unchanged valid location total, null market total and independent-lock denial. Protected accounting browser journey **4 pass** on desktop/320px. Whitespace passes; no frontend/schema change. Primary Scope 2 source/limits remain in methodology documentation.

Next: I01D facility-level report integrity. Inspection found that missing/partial market facility values could appear as zero/subtotals and JSON facility fields labelled kg were converted to tonnes. Correct both with explicit new output versions while preserving historical snapshots.

## I01D — Facility totals and versioned export integrity (2026-11-04)

Phase 4. State: PUSHED. Commit `2f7242792c30330a2eae369fbbe09364c52bf07e` matched remote Asif.

Files: accounting/ledger, numerical/API/export-compatibility tests, synthetic v1 JSON/CSV fixtures, methodology/API contracts and tracking docs. Incomplete/no-electricity facility market values are null; complete facilities keep valid values even when the global market total is missing. New reports use schema 2 with actual kilogram facility fields and an explicit unit marker. CSV v2 includes those facilities through the existing formula-safe writer. Global tonne totals are unchanged. Methodology 1.0.3 invalidates old run fingerprints for new locking without rewriting historical snapshots. Schema-v1 exports retain their exact previous bytes; historical facility-unit/completeness defects are disclosed and need reviewed restatement before reliance.

Validation: **123 backend tests run / 122 pass / one local PostgreSQL-only skip**. New cases cover missing/partial/no-electricity market amounts, independently complete facilities, exact 500 kg versus 0.500 t API/export values, null handling, repeated exports, formula-like facility names and byte-identical v1 JSON/CSV fixtures captured from HEAD 0962c6c's actual renderer. Initial API test incorrectly assumed snapshot lists used the generic items wrapper; corrected to the existing array contract and reran. Protected accounting browser journey **4 pass** on desktop/320px. Whitespace passes. No frontend runtime or schema migration changed.

Next: remaining main accounting/factor governance integration and legacy design contract findings, preserving current controls.

## L01A — Technology architecture without invented operations (2026-11-04)

Phase 1/2/8/12. State: PUSHED. Commit `bd3699b0bb9c4f3cb2e26480dcba81bfcfc82858` matched remote Asif.

Files: Technology.jsx, App metadata/Footer entry, removed four route-exclusive technology components, new technology-integrity browser spec/screenshots, component traceability and tracking docs. Reused CompanyPage and existing semantic surface/state/control tokens. Replaced unsupported deployed hardware, 50,000+ readings/hour, live integrations, issued-credit, official-support, revenue and dated scale-up claims with the implemented evidence/review/calculation/report path, optional AI behavior, research limits and actual pilot requirements. No fabricated replacement milestones or hardware specs. Removed the dead registration button; evidence/trust/pilot links navigate to actual flows, and the research link points to the retained monitoring module. The route has a distinct title/description, public robots metadata and a discoverable footer product link.

All four removed components had Technology.jsx as their sole caller; no research engine or device integration code was removed. No new dependencies or duplicated design framework. The page describes implementation boundaries, not runtime service health or independently validated methodology.

Validation so far: 20 JS tests and TypeScript/Vite build pass; existing zlib browser-externalization warning remains. Initial desktop/320px functional tests 4 pass. Visual review caught intermediate theme-transition capture; strengthened the test to wait for actual resolved canvas/heading colors and disable animations only during screenshots. The first expanded run used an incorrect test assumption about heading CSS precedence (expected a generic heading override instead of the actual registry token); corrected the assertion to the resolved semantic token. Final full ten-viewport matrix **20 pass**; final technology + shared navigation/workspace checks after adding the footer entry **12 pass** on desktop/320px. Settled desktop/mobile light/dark screenshots inspected. Source contract decreases from 55 to **50 legacy color findings**, with no checker changes. No backend behavior changed.

Next: continue route-specific truth/theme/dead-link fixes; main accounting/factor schema integration and external validation remain open.

## L01B — Original framework sources and actual scope (2026-11-04)

Phase 1/2/8/12. State: TESTED; own SHA/remote verification reported after commit.

Files: FrameworkDocs.jsx, metadata/Footer, framework-integrity browser spec/screenshots, component traceability and tracking docs. Replaced three dead PDF anchors and unsupported official national-document claim with publisher links to the GHG Protocol Corporate Standard, Scope 2 Guidance and UNFCCC Paris Agreement overview. Original pages were opened and verified on 2026-11-04; page links do not impersonate hosted PDFs or national authority. Added factual current Scope 1/2 exclusions, absence of Scope 3/assurance and explicit registry/national-document boundaries. Reused CompanyPage and semantic tokens, added route metadata and a discoverable Project & data footer link. No new dependency or legal/approval guarantee.

Validation: TypeScript/Vite build and whitespace pass. **10 browser tests pass across all ten viewport projects**, both themes, actual route navigation, original publisher destinations, no dead/download anchors, coverage/registry wording, no overflow, minimum 44px links and no runtime errors. Mobile light screenshot inspected; four mobile/desktop theme captures recorded. Contract decreases from 50 to **49 legacy color findings**, with no checker changes. Backend unaffected and unrelated numerical tests not rerun for this static route.

Hosted follow-up: I01D ESG CI run 41815266165 completed with a PostgreSQL backend failure; SQLite and the full ten-project protected browser job passed. Earlier successful run evidence is SHA-scoped, not a claim that this new database failure passed. I01E is the next immediate task after this atomic page push; inspect actual hosted failure and fix the cause without suppressing tests.

Primary references: [Corporate Standard](https://ghgprotocol.org/corporate-standard), [Scope 2 Guidance](https://ghgprotocol.org/scope-2-guidance), [Paris Agreement](https://unfccc.int/process-and-meetings/the-paris-agreement). An initially guessed Article 6 page failed and was not shipped; the verified UNFCCC overview is linked instead.

I01E diagnosis from hosted failure log: the RAG isolation test searched all serialized response metadata for the substring `999`; an authorized random chunk UUID happened to contain it. The answer/citation source text was the correct 12-month policy, not the foreign 999-month source. This is a nondeterministic test-boundary error, not evidence of a PostgreSQL accounting defect. Next task will verify text and exact source identifiers separately, with a deterministic collision fixture; authorization behavior must remain tested.
