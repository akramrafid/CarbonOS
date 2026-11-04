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
