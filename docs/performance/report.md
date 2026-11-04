# Frontend performance evidence — build sizes, unmeasured Web Vitals

Date: 2026-11-04. Runtime source through `08d0b69`, workflow head `b31e35e`. Local macOS / Node 25.2.0 production build; file-size inspection is independent of browser/network timing.

## Metrics

| Artifact / metric | Observed value | Method / limitation |
|---|---:|---|
| `index-BkBTvMS1.js` | 339,272 bytes raw / 105,084 gzip | Production file / Python gzip level 9; not a browser transfer measurement |
| `index-DaXXrnPk.css` | 185,063 bytes raw / 26,662 gzip | Same method; global legacy CSS still large |
| `hero_landscape.png` | 952,038 bytes | Source/public file, still a likely transfer optimization target |
| TTFB / LCP / INP / CLS | Unmeasured | No lab/field capture performed in this task |
| Lighthouse scores / long tasks | Unmeasured | No audit run performed in this task |

Targets remain LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, and Lighthouse ≥90 where measured under a declared profile. These are goals, not current results. The older entry-size reduction is recorded in docs/showcase/product-bundle-comparison.json; bundle size is not user-perceived speed or total page weight.

## Review

Routes are lazy imports with Suspense; protected ESG is separate from the public entry. ONNX and legacy dashboards still have large lazy payloads. Heavy legacy homepage sections and footer landscape are unmounted in the current site. Google font requests and the hero image still affect first render; image format/dimensions/preload and self-hosted font decisions require measured before/after work. No product analytics SDK was found in the primary flow. HarvestGuard uses a keyless modelled-weather request only after its local profile loads; external APIs must not be counted as healthy from static build success. No production CDN/cache/header profile is known.

No main-thread trace, API waterfall/load benchmark, cold-cache mobile measurement or production field data was captured here. Production build succeeds with an existing zlib browser externalization warning. Source heuristic findings remain; they are not hidden by this document.

## Decision

Build-size inspection PASS; performance release acceptance is **OPEN / NOT MEASURED**. P01/P02 track measured image/chunk/render improvements and lab/field evidence. `frontend-check` artifact completeness can improve without proving any target passed. Do not label mobile/desktop budgets green until actual route/profile measurements exist.
