# Transformation implementation log

## A00 — Baseline audit (2026-11-04)

Phase: audit. State: PUSHED. Commit `7531f4611f2b91099a35aebcd9a7d6ae94d1b06a` matched remote Asif after push.

Files: ROADMAP, IMPLEMENTATION-LOG, FEATURE-COVERAGE, QA-REPORT, REMAINING-GAPS in this directory.

Inspected clean Asif `ffc5ffc`, fetched origin and fast-forward checked Asif; inspected route tree, shared UI/theme, ESG callers, MRV/registry API call sites, legacy simulation markers, dependencies, Playwright projects, CI workflows and read-only main history/file comparison. Main is 21 commits ahead of the merge base, with four Asif-only commits. No main integration performed.

Validation: baseline `frontend-check --area all` FAIL (missing funnel; four unresolved template documents; 64 source heuristics). This documentation task does not change runtime behavior or rerun every historical suite. Git whitespace/diff and artifact/link consistency checks are required before commit. Push uses `git push origin HEAD:Asif`; compare full local SHA with `git ls-remote origin refs/heads/Asif` before reporting PUSHED.

Next: D01 semantic state tokens and theme-safe shared ESG components.

## D01 — Theme-safe shared feedback and controls (2026-11-04)

Phase 1. State: TESTED; own SHA/remote verification reported after commit.

Files: src/index.css, src/pages/platform/esg/ui.jsx, tests/js/designTokens.test.mjs, tests/e2e/shared-controls.spec.ts and these tracking documents.

Added semantic success/warning/danger/neutral colors for each theme and control background/text/border/focus/primary-action tokens. Shared notices, status badges, input/select and buttons use them; actual status text, live-region roles, disabled states and 44px controls remain. Token tests require ≥4.5:1 text and ≥3:1 control-border/focus contrast. These limited tests do not establish whole-app WCAG compliance.

Validation: 11 JS tests pass; tsc and production build pass; real protected API browser test passes on 1440 and 320px (2 tests) for saving a legal entity, theme colors/focus and rejected invalid-period feedback. Initial run hit the old preview's different signing secret (401); stopped only our preview processes and reran with isolated test services. A direct theme-color assertion raced the existing transition; changed it to Playwright's retrying CSS assertion. Final rerun passes. No backend or tenant-control changes.

Next: D02 programmatic form descriptions and date-range validation.
