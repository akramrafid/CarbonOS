# Accessibility evidence — scoped prototype checks

Date: 2026-11-04. Sources: Asif D01/D02/Q01/X01 commits and `docs/website-transformation/QA-REPORT.md`. Browser automation: installed Playwright 1.56.1 / Chromium. This is an evidence record with explicit gaps, **not a WCAG 2.2 AA certification**.

## Automated results

- Shared shell: 40 tests pass across 320, 375, 390, 667 landscape, 768, 1024, 1280, 1440, 1536 and 1920 CSS pixel widths. Named navigation, modal focus/Escape/restore, skip target, EN/BN navigation, 44px ESG controls, keyboard table regions, theme switch, overflow, 404 and resize unlock are checked.
- Shared fields + protected accounting: six tests pass on 1440/320px. Hints/errors have resolved accessible descriptions; invalid reporting dates identify/focus the field, issue no request and permit correction. Input/select native required/type validation remains.
- D01 token contrast: text ≥4.5:1 for success/warning/danger/neutral and controls/buttons, control borders/focus ≥3:1 in both themes. This test calculates declared opaque token pairs, not every composited page color or all legacy controls.
- Route recovery: four tests pass for failed imports/rendering, reload/home and no raw error text in the page.
- No axe or Lighthouse accessibility scan has been run for this increment. Critical/serious/moderate/minor counts are **unmeasured**, not zero. Test artifacts and screenshots are linked in the transformation QA report.

## Manual results

Prior product-site keyboard and dark/light review is documented in `docs/showcase/COMPETITIVE_UPGRADE_QA.md`. New 390px ESG and 1920px home screenshots were visually inspected. Shared styles retain visible focus and existing reduced-motion rules; tests use reduced-motion emulation. No new manual screen-reader session, 200%/400% zoom review, forced-colors review, full keyboard route audit or real-device test has been performed for this increment. New weather/provider states have labelled controls and status text but await broader legacy-page accessibility review. Body copy is not fully translated.

## Decision

Scoped checks PASS as recorded. Whole-app release accessibility remains OPEN: complete assistive-technology/zoom/contrast/localization/legacy-dialog/chart checks, fix findings with route-specific evidence, then assess conformance. `frontend-check --area a11y` also checks all source heuristics; it is still red while source violations remain. Documentation completeness is not accessibility compliance, and no findings are waived.
