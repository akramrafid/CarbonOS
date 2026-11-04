# CarbonOS design system — implemented foundations

Updated 2026-11-04. Source of truth: `src/index.css`, `tailwind.config.js`, shared ESG `ui.jsx` and the shipped CarbonOS pages. This describes implemented foundations and open migration work. Earlier “sovereign”, verified-serial and universal contrast claims were intentions without evidence; they are not current product guarantees.

## Brand and composition

CarbonOS helps factory teams inspect evidence, review activity and produce reproducible Scope 1/2 reports. Use precise source/state labels, readable tables, quiet forest/charcoal surfaces and restrained emerald emphasis. Never imply official approval, hardware signatures, customers, credit issuance or validated model quality from decoration. Current site uses a landscape hero, explanatory workflow, supported-scope disclosure and local pilot brief. Research modules remain separate from the supported factory demo.

## Color

Theme colors are CSS variables, exposed through Tailwind forest/carbon/emerald/amber/registry/mist. Dark canvas `--color-carbon` #080F0B, forest #0D2B1A, primary text #F0F4F1. Light canvas #f2f3ee, forest #dbf0ea, text #413f3f. Shared controls use `--control-bg/text/border/primary-bg/primary-text/focus` and feedback uses `--state-{success,warning,danger,neutral}-{bg,text,border}`. D01 token tests require opaque text pairs ≥4.5:1 and control border/focus pairs ≥3:1. Other colors, opacity/compositing and decorative borders are not universally verified. Use status text and roles, never color alone.

## Typography

Dark/public typography: Instrument Sans body, Cormorant Garamond display, JetBrains Mono metadata, with system fallbacks. Light theme currently applies Helvetica/Arial globally, including heading overrides. ESG inputs use 16px on phones and 14px from sm; body/captions/headings use existing Tailwind scales. Micro labels are smaller and require a broader readability audit. Full EN/BN font/line-height and critical copy review remains open. Do not invent token names that are absent from source.

## Spacing and surfaces

Use existing Tailwind spacing and breakpoint utilities. ESG panels: p-4 / sm:p-6, rounded-2xl, min-w-0; forms wrap to sm/lg grids; workspace max-w-6xl with px-4/sm:px-6. Inputs/buttons retain min-height 44px. Shared semantic tables scroll inside a named, keyboard-focusable region, not the document. Legacy custom grids/radii/colors remain inconsistent and must be migrated route by route with visual review, not suppressed from checks.

## Motion

Global CSS defines normal theme transitions, animation utilities and a prefers-reduced-motion block. Navigation uses native dialog behavior. Hero step rotation respects reduced motion. Scope-specific browser tests emulate reduce; no claim that every legacy GSAP/Framer animation has been fully audited. Avoid hiding primary copy/actions on initial render.

## Component contract and states

| Component / source | Implemented behavior | Open gap |
|---|---|---|
| Navbar | Desktop from 1280px; native mobile dialog, focus/Escape/restore, theme/language | Full locale body copy and real-device review |
| ESG Panel/Button/Input/Select | Wrapping layout, 44px controls, native validation, semantic colors/focus | Full inline/server-error mapping across all forms |
| Field | Stable label/help/error IDs, aria-describedby/invalid; caller ID/help preserved | Broad assistive-technology review |
| Notice / StatusBadge | Error alert / success status; semantic colors plus exact status text | All backend-state combinations/contrast on legacy surfaces |
| Table / Loading | Caption/header semantics, named scrolling region; loading/error/empty | Sort/filter/pagination and richer partial/skeleton states |
| RouteErrorBoundary | Reload/home fallback; reset on pathname; no raw error in page | Event-handler errors require local action error handling |
| PilotPlanner | Native form validation, unsupported-needs disclosure, local download | Real contact integration blocked on verified operator details |

No unused component library is added. New primitives must serve a real caller. Shared forms preserve backend validation/auth/tenant/SoD rules; client state is not authoritative.

## Breakpoints and evidence

Tested emulation widths: 320, 375, 390, 667 landscape, 768, 1024, 1280, 1440, 1536, 1920. Tailwind sm/md/lg/xl defaults apply; nav uses xl. Forty responsive shell tests pass; see docs/website-transformation/QA-REPORT.md for exact scope and screenshots. Full screen-reader, zoom, forced-colors, all-route localization and real-device conformance remain open. Design contract source findings still block the full gate.
