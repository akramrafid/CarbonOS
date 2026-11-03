# Responsive upgrade verification

Date: 2026-11-03. Source baseline: `e96594f`. Delivery branch: `Asif`.

## Delivered

- Shared navigation now collapses below 1536 px, keeps every existing destination, and provides a native modal menu with background-scroll locking, keyboard containment, Escape dismissal, and focus restoration.
- Request Demo links reach `/platform/esg`. The old `/platform/saas` address redirects there. Unknown routes provide a home recovery link.
- A shared skip link targets the content container. Homepage content has a main landmark. Navigation tracks the current destination, and hash targets have clearance below the fixed header.
- Framework sections grow with their mobile content. Sticky scroll/blur effects apply only at wide widths with no reduced-motion preference.
- ESG fields and buttons have 44 px minimum height, inputs use readable mobile text, shrinking grid children are constrained, and Setup forms use less crowded tablet layouts.
- Data tables remain semantic and have named, keyboard-focusable horizontal scroll regions. Section navigation scrolls within the workspace.
- Long identities, organization names, sample-data notices, and persona controls wrap. Persona selection exposes its pressed state.
- The legacy dashboard main container can shrink beside its sidebar; footer copyright text wraps.
- Global-header light-theme styling no longer targets every navigation element. Two flagged light-theme heading gradients were changed to solid emerald. No design-hook suppressions were added. Existing dark-theme heading treatment remains.

## Automated results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm test` | 2 passed |
| `npm run build` | Passed; existing browser externalization warning for `zlib` remains |
| `git diff --check` | Passed |
| `responsive-shell.spec.ts`, eight viewport projects | 32 passed |
| Final fully-rendered screenshot checks plus existing Scope 2 accounting journey, desktop/mobile project selections | 4 passed |

The responsive matrix covers 320×720, 375×812, 667×375 landscape, 768×1024, 1024×900, 1280×800, 1440×900, and 1536×960. Tests cover viewport fit, visible header controls, modal focus behavior, Escape/focus restoration, language switching, skip navigation, selected sections, redirects, missing-page recovery, theme switching, desktop resize cleanup, and hash navigation.

The authenticated responsive test uses the actual local API with test-only JWTs, creates a legal entity through the form, verifies touch-sized controls and keyboard table access, and visits every workspace section. It does not mock accounting responses.

The existing accounting journey passed with both selected Playwright projects. Its helper creates separate browser contexts without forwarding the project's viewport, so these runs verify accounting behavior but are not additional evidence of phone layout coverage. The new responsive suite uses the project page fixture and does exercise the listed dimensions.

## Browser and visual review

IAB initially confirmed the crowded laptop navigation. At that point its exposed capabilities did not include viewport controls, so the installed Playwright setup provided the matrix checks. After a browser-tool update exposed viewport controls, IAB also verified the real seeded demo at 320 px. Its measured document width was 305 px inside a 320 px viewport with the native scrollbar, with no horizontal page overflow.

IAB verified switching from the owner persona to the reviewer: the role changed to auditor and write/admin controls disappeared. Switching back restored the owner controls. The viewport override was reset after inspection.

Screenshots were inspected with `view_image` for header fit, typography/wrapping, section spacing, preserved palette, and ESG table/form boundaries. Homepage screenshots wait for the entrance animation to finish before capture. This is a functional improvement within the existing design, not a newly approved visual redesign.

- [Homepage, 375 px](responsive-home-375.png)
- [Homepage, 1440 px](responsive-home-1440.png)
- [Authenticated ESG setup, 375 px](responsive-esg-375.png)
- [Authenticated ESG setup, 1440 px](responsive-esg-1440.png)
- [Seeded sample workspace, 375 px, IAB](responsive-demo-375.png)

## Repository quality gate

`frontend-check --area all` remains **failed**. The output reports a missing funnel artifact and unresolved placeholders in measurement, SEO, accessibility, and performance documents, plus 71 source-heuristic findings. Of those findings, 69 are in tracked files and two come from an existing ignored Playwright HTML report. Comparing the tracked findings with HEAD found no newly introduced hardcoded-color/raw-HTML flags in this change.

This report does not certify that the broader frontend gate passes. The unrelated documentation and source-token cleanup remain separate upgrade work.

## Remaining limits and next priorities

1. Audit all specialist routes and every legacy dashboard module. This increment checks shared behavior and representative public routes, not every interaction across the application.
2. Distinguish authentication-required/demo-disabled responses from service outages. The existing protected-mode UI still labels a rejected demo request as offline. The full older E2E suite includes a stale signed-out-screen expectation; it was not represented as passing here.
3. Reconcile Scope 3 and other completion claims with actual reports/API behavior. Review hardcoded homepage live/audited/official claims against evidence.
4. Verify production OIDC, PostgreSQL migrations/concurrency, actual external integrations, and real mobile Safari/Android hardware separately. No production credentials, data, or deployment were changed.
5. Extend theme/contrast review beyond the shared surfaces; replace the Vite favicon and profile large assets before making performance claims.

## Local preview

Frontend: `http://127.0.0.1:3000`; sample workspace: `http://127.0.0.1:3000/platform/esg`.

The API preview binds only to `127.0.0.1:8100`, uses isolated-demo mode, and stores synthetic preview data in `/private/tmp/carbonos-responsive-preview.sqlite3`. It uses neither production data nor the browser test-token hook. These settings are process-local, not changes to the repository's deployment configuration.

The detailed audit and reusable continuation prompt are in [RESPONSIVE_UPGRADE_PROMPT.md](../RESPONSIVE_UPGRADE_PROMPT.md).
