# Design System — MASTER

> Generated in Phase 3. Frontend and mobile consume these tokens only.
> Do not invent colors, type, or spacing in implementation.

## Brand

- **Personality**: Sovereign, executive, empirical, climate-tech precision, authoritative.
- **Voice**: Institutional, data-grounded, verified, unambiguous, audit-ready.
- **Anti-patterns**: Generic SaaS purple gradients, vague greenwashing claims, decorative non-functional charts, AI slop templates, ungrounded carbon offset metrics.

## Art Direction

- **Chosen direction**: Dual-Engine Sovereign Infrastructure (Executive Obsidian Dark Mode & Clean, Functional, Implementation-Oriented Light Mode).
- **Visual thesis**: Sovereign enterprise ESG operating system delivering institutional auditability for Bangladesh's export industries and global carbon markets.
- **Signature element**: Precision live telemetry gauges, verified Article 6 ledger serials, and dual-layer interactive Catmull-Rom SVG data trendlines.
- **Composition rule**: Structured high-density modular grid with 8px baseline rhythm, asymmetric split panels, and floating contextual control bars.
- **Image and illustration treatment**: High-resolution multispectral satellite imagery (Sentinel-2 NDVI bands), authentic smallholder farmer fieldwork, factory IoT nodes, 16:9 responsive aspect ratio.
- **Surfaces rule**:
  - *Dark mode*: Matte obsidian surfaces (`#040906`, `#08130C`, `#0D1C13`) with muted emerald stroke (`#152B1D`) and neon emerald focus (`#00C853`).
  - *Light mode*: Clean warm linen canvas (`#f2f3ee`) with soft mint highlight surfaces (`#dbf0ea`), crisp white cards (`#ffffff`), and deep charcoal text (`#413f3f`, `#181414`).

Do not default to a generic centered hero, interchangeable rounded cards, purple
gradients, excessive glass, or a dashboard made of equal-weight cards. Those are
allowed only when the product's audience and content make the choice explicit.

## Design Principles

1. **Hierarchy before decoration**: the primary user action is obvious within five seconds.
2. **One strong visual idea per surface**: variety comes from composition and content, not random effects.
3. **Confidence through clarity**: price, state, ownership, and next step are never obscured.
4. **Restraint is a feature**: motion, shadows, blur, and gradients earn their place.
5. **Accessible by construction**: contrast, focus, reduced motion, zoom, and content reflow are token-level concerns.

## Color

| Token | Light Theme UI | Dark Theme (Default) | Contrast vs surface | Usage |
|---|---|---|---|---|
| `--color-bg-primary` | `#f2f3ee` (Linen Canvas) | `#040906` (Obsidian Charcoal) | ≥ 7:1 | App main background canvas |
| `--color-surface-base` | `#ffffff` (Crisp Card) | `#08130C` (Card Base) | ≥ 4.5:1 | Cards, data panels, containers |
| `--color-surface-strong`| `#dbf0ea` (Mint Strong) | `#0D2B1A` (Forest Elevated) | ≥ 4.5:1 | Active tabs, section highlights |
| `--color-text-primary` | `#413f3f` (Charcoal Slate) | `#F0F4F1` (Off-white Mist) | ≥ 4.5:1 | Primary body text, labels |
| `--color-text-inverse` | `#181414` (Deep Black) | `#00C853` (Vibrant Emerald) | ≥ 7:1 | Headings, metrics, counter titles |
| `--color-text-tertiary`| `#ffffff` (Pure White) | `#FFFFFF` (Pure White) | ≥ 4.5:1 | Text inside buttons and dark badges |
| `--color-primary` | `#15803d` (Forest Emerald) | `#00C853` (High-Voltage Emerald) | ≥ 4.5:1 on bg | Primary CTA and interactive buttons |
| `--color-danger` | `#DC2626` (Red 600) | `#EF4444` (Rose Red) | ≥ 4.5:1 | Non-compliance errors and alerts |
| `--color-border` | `#dbf0ea` (Mint Border) | `#152B1D` (Muted Green Border) | ≥ 3:1 | Dividers and container strokes |
| `--color-border-subtle`| `rgba(65, 63, 63, 0.12)` | `rgba(255, 255, 255, 0.1)` | ≥ 3:1 | Card borders and table lines |

Never convey state by color alone.

## Typography

### Light Theme Foundations
- **Visual Style**: Clean, functional, implementation-oriented
- **Primary Font**: `Helvetica`, Stack: `Helvetica, Arial, sans-serif`
- **Base Typography**: Size: `16px`, Weight: `400`, Line-Height: `22.4px` (1.4 ratio)

### Typography Scale Matrix

| Token | Size / Line-Height / Weight | Font Family Stack | Usage |
|---|---|---|---|
| `--text-xs` | `16px` / `22.4px` / `400` | `Helvetica, Arial, sans-serif` | Meta text, timestamps, table cells |
| `--text-sm` | `20px` / `28px` / `500` | `Helvetica, Arial, sans-serif` | Subheadings, card titles, captions |
| `--text-md` | `40px` / `48px` / `600` | `Helvetica, Arial, sans-serif` | Section titles, KPI metric numbers |
| `--text-lg` | `46px` / `54px` / `700` | `Helvetica, Arial, sans-serif` | Page header H2, hero declarations |
| `--text-xl` | `56px` / `64px` / `800` | `Helvetica, Arial, sans-serif` | Primary page H1 display title |
| `--font-mono` | `14px` / `20px` / `400` | `JetBrains Mono, monospace` | Serial keys, emission factors, formulas |

One `<h1>` per page. Do not skip heading levels.

## Spacing & Radii

### Spacing Scale (Zero Magic Numbers)
- `space.1`: `3px` (micro padding, icon gaps)
- `space.2`: `6px` (tight badge padding)
- `space.3`: `7px` (button vertical inset)
- `space.4`: `8px` (standard compact spacing)
- `space.5`: `12px` (input padding, pill gutter)
- `space.6`: `24px` (card content padding, column gutter)
- `space.7`: `28px` (section block spacing)
- `space.8`: `32px` (container margins)

### Radius Tokens
- `radius.xs`: `8px` (compact buttons, tooltips, tags)
- `radius.sm`: `13px` (inputs, card sub-containers)
- `radius.md`: `16px` (primary cards, modal dialogs)
- `radius.lg`: `100px` (full pill buttons, badge containers)

### Shadow Tokens
- `shadow.1`: `rgba(4, 18, 38, 0.24) 0px 10px 26px 0px, rgba(0, 229, 255, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.12) 0px 1px 0px 0px inset`
- `shadow.subtle`: `0 4px 20px rgba(4, 18, 38, 0.06)` (light card elevation)
- `shadow.dark-glow`: `0 0 20px rgba(0, 200, 83, 0.15)` (dark emerald ambient glow)

## Iconography & Assets

- **Icon family**: Lucide React (`stroke-width: 1.75px`)
- **Icon sizes**: `--icon-sm` (16px), `--icon-md` (20px), `--icon-lg` (24px)
- Meaningful icons have accessible names; decorative icons are hidden with `aria-hidden="true"`.
- No emoji as structural UI icons.
- **Asset manifest**: Public assets located under `/public/` (logos, national seal, satellite overlays).

## Motion

- **Motion Durations**:
  - `motion.duration.instant`: `100ms` (hover states, focus rings)
  - `motion.duration.fast`: `280ms` (dropdowns, toggle buttons)
  - `motion.duration.normal`: `400ms` (page transitions, modal popups)
  - `motion.duration.slow`: `500ms` (drawer expansions, telemetry graphs)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-damped exit/entry)
- **Reduced Motion**: Full fallback to opacity-only transitions under `prefers-reduced-motion: reduce`.

## Component states (mandatory)

Every interactive component specifies: default, hover, focus-visible, active, disabled, loading, empty, error, success.

Each component documents: purpose, anatomy, token dependencies, keyboard behavior,
screen-reader name/state, responsive behavior, content limits, and analytics events.

## Page Composition

Every page spec identifies: audience, intent, funnel stage, primary action,
secondary actions, proof/trust elements, responsive composition, and the empty/error
recovery path. Pages may override the system only through a documented page override.

## Breakpoints

- Mobile: 375–428px
- Tablet: 768–1024px
- Desktop: 1280–1920px
- Touch target ≥ 44×44 CSS px
- Also verify 320px minimum content width, 200% and 400% zoom, landscape, forced colors, and reduced motion.
