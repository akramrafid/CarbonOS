# CarbonOS upgrade audit and implementation prompt

Date: 2026-11-03. Baseline inspected: `e96594f`, branch `esg/p0-security-baseline`.

## Recommended approach

Improve the shared shell first, then finish the real ESG workspace, then extend the same responsive checks to every public and specialist route. Keep the existing React 19, React Router 7, Vite, Tailwind 3, Instrument Sans/Cormorant/JetBrains typography, emerald palette, translations, API contracts, and accounting controls. A framework migration or wholesale visual rewrite would add risk without solving the immediate usability problems.

This audit covers source inspection and local browser behavior. It is not a security audit, independent accounting validation, legal review, or production-readiness certification.

## Findings and priorities

| Priority | Finding and evidence | Required upgrade |
| --- | --- | --- |
| P0 | `Navbar.jsx` displayed its full desktop row from 1024 px; the row visibly overflowed the laptop browser. The phone header also reserved space for too many controls. | Collapse navigation when its content does not fit; preserve every destination and language/theme control. Check English and Bengali at intermediate widths. |
| P0 | Both navbar demo CTAs used `/platform/saas`, which had no route in `App.jsx`. | Send demo entry to `/platform/esg`; retain a redirect for old bookmarks and add a useful wildcard route. |
| P0 | The old mobile drawer stayed mounted offscreen, used `aria-hidden` without making descendants inert, and inherited an outer `pointer-events-none` container. It lacked modal focus and background-scroll handling. | Use a native modal dialog, a named close control, Escape dismissal, focus restoration, and a scrollable interior. Closed menu controls must be absent from keyboard navigation. |
| P1 | `FrameworkAlignment.jsx` used sticky, fixed `h-screen` sections containing stacked graphics and long text. Scroll animations blurred earlier content even on small screens. | Let sections grow on mobile; limit stacking/blur to wide screens without reduced-motion preference. Ensure badges wrap. |
| P1 | ESG `ui.jsx` controls lacked `min-w-0`, used small mobile text, and buttons were 40 px high. Tables scrolled but had no keyboard-focusable named scroll region. `SetupPanel.jsx` packed five controls into one row from 640 px. | Share responsive field sizing, 44 px controls, readable mobile input text, and keyboard-scrollable table regions. Delay denser form grids until enough width exists. |
| P1 | `EsgWorkspace.jsx` has long organization/user names, a wide sample-data notice, persona controls, and horizontally scrolling section buttons. | Test real long values and the full sample-data banner at 320 px. Wrap notices and identity details; retain visible selection and touch-sized persona controls. |
| P1 | `App.jsx` lacked a shared skip target and an unknown-route recovery screen. Broad light-theme `nav` styles also affected workspace section navigation. | Add skip navigation, preserve page landmarks, scope global-header styles, and keep both themes legible. |
| P1 | The legacy `SaaSDashboard.jsx` is a very large component with an aside hidden below `lg`; its many modules need a dedicated mobile-navigation and interaction audit. | Make each existing module reachable on phones before attempting component extraction. Preserve its explicit illustrative-data warning. |
| P1 | Homepage terminal data in `Hero.jsx` is hardcoded yet labeled live/audited; `index.html` describes the product as official infrastructure. Those claims were not substantiated by this UI audit. | Build a claim register. Cite evidence for each claim or label the affected experience illustrative. Do not invent a live backend, credentials, government status, verification, trades, or payouts. |
| P1 | `docs/esg/RELEASE_READINESS.md` claims Scope 3 completion, while `ReportsPanel.jsx` explicitly says Scope 3 is excluded and describes Scope 1/2 calculations. | Reconcile code, tests, methodology, and documentation before asserting feature completion. Adding a scope selector alone does not implement Scope 3 accounting. |
| P1 | `loadSession()` attempts demo provisioning for unauthenticated visitors; in protected deployments that request is correctly rejected. The current UI then reports the service as offline even when it returned 403. | Distinguish sign-in required, demo disabled, and genuinely unreachable service states. Preserve fail-closed access and tenant isolation; never enable demo mode in production to make the UI look operational. |
| P2 | The app still references `/vite.svg`; global theme overrides are broad; large imagery, ONNX assets, and animated sections warrant profiling. | Add an actual brand favicon, narrow theme overrides incrementally, and measure route payloads before optimizing. Lazy-load specialist code/assets where measurements justify it. |
| P2 | Existing journey tests expect a signed-out “Sign in” screen, but the newer frontend currently renders an offline screen when protected-mode demo provisioning fails. | Update tests alongside the corrected authentication UX and verify protected and isolated-demo modes separately. Keep security assertions meaningful. |

## Copyable implementation prompt

You are upgrading the existing CarbonOS repository as a senior frontend and product engineer. Inspect the current checkout and applicable AGENTS.md before editing. Use `docs/RESPONSIVE_UPGRADE_PROMPT.md` as a starting audit, then verify every finding against the current source and browser. Preserve existing user changes. Implement working, reviewable increments and report exactly what was verified.

### Product goal

Make CarbonOS usable on phones, tablets, laptops, and large monitors. Users must be able to discover the product, enter the appropriate workspace, navigate every available section, complete supported forms, inspect evidence and tabular data, recover from failures, and export supported reports without clipped controls or invented results.

Keep public marketing, illustrative legacy dashboards, isolated sample workspaces, and authenticated production data clearly distinguishable. All financial, environmental, assurance, regulatory, and live-service claims must have evidence or explicit limitations.

### Step 1 — Establish the baseline

1. Inspect `src/App.jsx`, shared navigation/footer/styles, all route components, ESG primitives and panels, `playwright.config.ts`, existing tests, and the actual API contracts.
2. Inventory every route, CTA destination, navigation item, form, modal, table, chart, and export action. Record whether it works, needs a service, is illustrative, or is unavailable.
3. Run existing checks. Record baseline failures separately from regressions. Do not delete failing tests or weaken tenant/approval assertions to obtain a green result.
4. Capture representative desktop and phone screenshots before major visual changes. Preserve the current brand unless a new design direction is explicitly approved.

### Step 2 — Finish the responsive foundation

- Keep the header within the viewport at 320, 375, 768, 1024, 1280, 1440, 1536, and 1920 CSS px. Choose breakpoints from actual content fit in both languages.
- Provide one complete mobile menu with real links, current-page indication, a labeled close control, Escape behavior, focus containment/restoration, and background-scroll locking. Resizing to desktop must not leave the page locked.
- Route demo entry to the supported ESG experience. Preserve redirects for previously published URLs. Unknown routes must show a recovery action.
- Preserve a visible-on-focus skip link and a real content target. Keep headings, navigation, regions, and table captions meaningful.
- Use fluid containers and `min-width: 0` on shrinking flex/grid children. Do not use page-wide overflow hiding as the fix for inaccessible content.
- Let long mobile sections grow with their content. Restrict sticky cinematic layouts to viewports where all content remains reachable. Respect reduced motion in CSS and JavaScript.
- Keep controls at least 44 px high where practical, inputs readable on mobile, and focus indicators visible. Do not disable browser zoom.
- Constrain paragraphs, wrap long organization names, and keep data numerals aligned. Use existing typography and components.

### Step 3 — Complete the ESG workspace

- Verify Setup, Emission factors, Activity ledger, E/S/G metrics, Calculation & reports, Disclosures, Members, and Audit trail.
- Keep single-column forms on narrow phones, two columns only when readable, and denser layouts at wide widths. Preserve labels, help text, required markers, native validation, and inline API errors.
- Keep data tables semantic. Use a bounded, labeled, keyboard-scrollable region when columns need more room. Do not hide critical columns or actions just to fit a phone screenshot.
- Preserve independent review, self-approval rejection, period locking, deterministic exports, factor versioning, and tenant-scoped requests. Layout work must not change accounting behavior.
- Test long names, evidence references, empty lists, loading, 401/403, unavailable services, validation failures, and locked/read-only states.
- Test isolated demo entry and persona switching separately from protected/OIDC entry. Keep sample-data warnings visible. Do not display server configuration instructions as the only end-user recovery path.
- Verify that every successful action updates visible UI and that retries do not silently duplicate records. Reuse current APIs and request helpers.

### Step 4 — Extend to specialist routes

- Audit marketplace browsing/checkout, registry, MRV, monitoring maps, project onboarding, verification workflow, farmer camera/diagnosis, HarvestGuard, company pages, and all sector pages.
- Give each route an explicit loading, empty, unavailable, and error experience appropriate to its existing capabilities.
- Keep maps/charts inside responsive containers with usable controls. Allow contained panning/scrolling where needed; never turn a complex interface into a static screenshot.
- Verify modals on short landscape phones, long forms with the keyboard open, sticky notices, and route-to-route navigation.
- Avoid rebuilding unavailable backend services during the layout pass. Record service-dependent acceptance checks and their actual blockers.

### Step 5 — Reconcile trust and readiness

- Compare feature claims with executable tests and API implementations, especially Scope 3, registry integration, external assurance, and live trading/payouts.
- Separate implemented behavior from demo simulations and external deployment requirements in release documentation.
- Keep production identity, database, privacy, deployment, and independent methodology-review requirements explicit. Do not infer that UI polish satisfies those requirements.
- Refactor large files only when a concrete fix requires it. Add no framework, component library, or backend abstraction without a demonstrated need.

### Verification and acceptance

1. Run `npm run lint`, `npm test`, and `npm run build`.
2. Run the responsive Playwright suite against the real local ESG test service, including narrow phones and intermediate tablet/laptop widths. Test both themes and both navigation languages. Add a 1536 px desktop-navigation check and a short landscape check.
3. Verify keyboard entry, skip navigation, dialog focus, Escape, menu selection, hash links, route redirects, current states, and all relevant form actions.
4. Assert that the document and visible controls fit the viewport; separately verify intentionally scrollable tables. Inspect screenshots as well as DOM geometry—clipping can conceal overflow without reducing `scrollWidth`.
5. Rerun the supported accounting journey through entry, independent review, calculation, lock, and reproducible export if changes touch that workflow.
6. Run `.venv-esg/bin/python -m unittest discover -s tests -p 'test_esg*.py'` if authentication, API behavior, accounting, or fixtures change. PostgreSQL tests require a specifically disposable database; the harness truncates it.
7. Run `.venv-esg/bin/python -m orchestrator.cli frontend-check --area all` before claiming the repository quality gate passes. Record existing findings accurately.
8. Document the checked routes, dimensions, themes, interactions, results, screenshots, and unresolved blockers. Do not label the entire app fully responsive based only on its homepage or build output.

### Deliverables

- Focused source changes using the existing design system and APIs.
- Small regression tests for behavior changed by the upgrade.
- A verification report with concrete pass/fail results and links to representative screenshots.
- An updated implementation/claim register that distinguishes verified, illustrative, unavailable, and externally gated functionality.
- A concise handoff explaining what works now, what remains, and any material risks. Publishing, deployment, and unrelated backend expansion are separate actions.

## Current implementation increment

The initial increment addresses shared navigation and routing, keyboard access, mobile framework sections, the legacy main container, ESG input/button/table primitives, wrapping identity/demo controls, and Setup form breakpoints. It does not claim to complete every specialist module, production identity setup, claims reconciliation, or accounting expansion. See `docs/qa/responsive-upgrade-report.md` for current verification results when available.
