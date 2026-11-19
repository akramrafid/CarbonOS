---
name: Carbon Zero BD
description: Editorial Climate Telemetry design system for Bangladesh's digital MRV, corporate GHG accounting, and carbon registry infrastructure.
colors:
  dark-canvas: "#080F0B"
  dark-deep-canvas: "#040A06"
  dark-forest: "#0D2B1A"
  dark-emerald: "#00C853"
  dark-emerald-bright: "#00E676"
  dark-amber: "#FFB300"
  dark-ink: "#F0F4F1"
  dark-mist: "#B2C4B8"
  light-canvas: "#F2F3EE"
  light-surface: "#FFFFFF"
  light-mint: "#E3F0E8"
  light-emerald: "#15803D"
  light-emerald-hover: "#166534"
  light-teal: "#0F766E"
  light-cyan: "#0369A1"
  light-amber: "#B45309"
  light-ink: "#0F291B"
  light-ink-secondary: "#37473E"
  light-mist: "#4A5D52"
  light-subtle: "#556B5E"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "clamp(1.875rem, 3.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  xs: "8px"
  sm: "12px"
  md: "16px"
  pill: "100px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary-dark:
    backgroundColor: "{colors.dark-emerald}"
    textColor: "{colors.dark-deep-canvas}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-primary-light:
    backgroundColor: "{colors.light-emerald}"
    textColor: "{colors.light-surface}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  card-dark:
    backgroundColor: "{colors.dark-canvas}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-light:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Carbon Zero BD

## Overview

**Creative North Star: "Editorial Climate Telemetry"**

Carbon Zero BD pairs institutional climate ledger discipline with responsive spatial telemetry across dual themes: **Obsidian Dark** (`#080F0B` / `#040A06`) for continuous dMRV control rooms and field dashboards, and **Daylight Linen** (`#F2F3EE` / `#FFFFFF`) for daylight enterprise reading and compliance review. Typography stays anchored in geometric `Poppins`, reserving `JetBrains Mono` strictly for quantitative measurements, currency formatting (`৳`), serial codes, cryptographic hashes, and geographic coordinates.

Structural separation relies on hairline borders (`1px`), columnar data matrices, and deliberate asymmetry rather than floating card stacks, glassmorphism fog, decorative pills, or synthetic gradients. Unverified or demo states remain explicitly labeled inline rather than disguised behind glowing live badges.

**Key Characteristics:**
- Dual-theme contrast parity across `#040A06`/`#080F0B` dark surfaces and `#F2F3EE`/`#FFFFFF` daylight surfaces.
- Single-family `Poppins` hierarchy paired with `tabular-nums` monospace strictly for real data.
- Hairline-divided console and portfolio matrices (`gap-px`, `divide-y`, `divide-x`) replacing nested card containers.
- Zero decorative eyebrow pills, gradient-clipped display text, purple SaaS gradients, corner glow blurs, or `animate-ping` dot scatter.

## Colors

The palette pairs deep agronomic greens and crisp ink neutrals across dark telemetry mode and daylight linen mode.

### Primary
- **Obsidian Signal Emerald** (`#00C853` / `#00E676`): Primary interactive CTA fill, active station indicator, and positive sequestration metrics in Dark Mode.
- **Daylight Forest Emerald** (`#15803D`): High-contrast accessible primary CTA fill and accent ink on Light Mode surfaces (`#F2F3EE` and `#FFFFFF`).

### Secondary
- **Verification Caution Amber** (`#FFB300` dark / `#B45309` light): Baseline warnings,Starter pricing tier numerals, and gated model status alerts.
- **Spatial & Sovereign Cyan-Teal** (`#06B6D4` dark / `#0369A1`–`#0F766E` light): Satellite SAR/LiDAR telemetry metrics, multi-modal fusion badges, and Sovereign tier controls.

### Neutral
- **Dark Surface Hierarchy**: Deep Header/Section `#040A06`, Primary Surface `#080F0B`, Forest Panel `#0D2B1A`, Primary Ink `#F0F4F1`, Secondary Ink `#B2C4B8`, Hairline Divider `rgba(255, 255, 255, 0.10)`.
- **Light Surface Hierarchy**: Linen Canvas `#F2F3EE`, Elevated Card `#FFFFFF`, Botanical Mint `#E3F0E8`, Deep Ink `#0F291B`, Secondary Ink `#37473E`, Muted Ink `#4A5D52`, Hairline Divider `rgba(15, 41, 27, 0.11)`.

### Named Rules
**The Data-First Contrast Rule.** Interactive controls and body typography in Light Mode must resolve directly to dark forest ink (`#0F291B` / `#37473E`) on crisp `#FFFFFF` or `#F2F3EE` surfaces rather than relying on low-contrast CSS opacity overrides. Purple hues (`purple-*` / `indigo-*`) are barred from UI chrome and AI feature badges.

## Typography

**Display & UI Font:** `Poppins, sans-serif` (system sans fallback)
**Numeric / Telemetry Font:** `JetBrains Mono, monospace` (strictly for figures, timestamps, coordinates, hashes, and protocol identifiers)

**Character:** Crisp, high-legibility geometric proportions designed for dense financial clearing tables, IPCC Tier-3 biomass ledgers, and bilingual executive copy without decorative serifs.

### Hierarchy
- **Display** (`800` / `clamp(2.25rem, 5vw, 3.75rem)` / `1.08`, `-0.025em`): Landing hero and sub-page top headlines (`H1`).
- **Headline** (`700` / `clamp(1.875rem, 3.5vw, 3rem)` / `1.15`, `-0.02em`): Section titles leading directly without above-heading eyebrow pills.
- **Title** (`700` / `1.25rem` / `1.3`): Matrix cell headings and console panel headers.
- **Body** (`400` / `1rem` / `1.5`): Scannable editorial and methodology copy constrained cleanly for reading measure (`max-w-2xl` / `max-w-3xl`).
- **Label & Data Readout** (`600` / `0.75rem` / `0.05em` monospace `tabular-nums`): Table column headers, unit labels, coordinate pairs, and BDT/tCO₂e values.

### Named Rules
**The Real-Data Monospace Rule.** Use monospace and `tabular-nums` where alignment, serial precision, or unit comparison matters (telemetry numbers, coordinates, BDT currency, SHA hashes, UNFCCC methodology refs) — never as decorative pill captions above headings.

## Layout

Public marketing sections constrain to `max-w-7xl` (and `max-w-[90rem]` on wide pipeline showcases) with generous vertical breathing room (`py-20 sm:py-28`). Workspace views (`CarbonMonitoring`, `SaaSDashboard`, `CarbonRegistry`) use 12-column asymmetric splits (such as `7-col` ledger table beside `5-col` spatial/NDVI readout) and unified multi-column consoles connected via internal `1px` hairlines (`gap-px`, `divide-y`, `divide-x`) so related metrics read as a single instrument rather than detached boxes.

## Elevation & Depth

Surfaces remain **flat by structural default**. Hierarchy comes from stepped surface contrast (`#040A06` vs `#080F0B`, or `#F2F3EE` canvas vs `#FFFFFF` container) and crisp `1px` hairline borders rather than multi-layer box shadows or large ambient radial blur clouds (`blur-2xl`/`blur-3xl`). In Light Mode, unified panels may carry a tight structural ambient shadow (`0 8px 24px -6px rgba(15, 41, 27, 0.08)`).

## Shapes

Containers use restrained architectural radii (`8px`–`16px` / `rounded-xl`–`rounded-2xl`) and rectangular matrix grids. Interactive status indicators remain steady dots or crisp inline labels; `animate-ping` halo rings and protruding floating top badges (`-top-3.5`) are prohibited.

## Components

### Buttons
- **Shape:** Restrained rectangular radius (`12px` / `rounded-xl`, `8px` / `rounded-lg` inside toolbars).
- **Primary:** `#15803D` fill with `#FFFFFF` text in Light Mode; `#00C853` fill with `#050C07` dark ink in Dark Mode; generous horizontal padding (`px-6 py-3.5`).
- **Secondary:** Hairline border (`border-[#0F291B]/15` on `#F5F8F5` in Light Mode; `border-white/15` on `white/[0.06]` in Dark Mode).

### Data Consoles & Portfolio Matrices
- **Structure:** Unified outer `rounded-2xl border overflow-hidden` frame subdivided internally with `gap-px` or `divide-x`/`divide-y` hairlines — never nested floating sub-cards inside outer cards.
- **Numeric Cells:** Large bold `tabular-nums` value paired with unit, baseline comparison, and provenance status separated by a `1px` top hairline.

### Navigation & Workspace Chrome
- Top navigation uses subtle frosted canvas (`rgba(4,10,6,0.85)` dark / `rgba(255,255,255,0.92)` light) with explicit theme switching and single-row compact platform header bars without stacked pill strips.

## Do's and Don'ts

### Do:
- **Do** lead every section directly with its heading (`H1`/`H2`) without pre-heading kickers or pill badges.
- **Do** unify related metrics (pricing tiers, 4-channel IoT telemetry, sector portfolio matrices) into hairline-divided multi-column containers.
- **Do** test every changed surface explicitly in both `dark` and `light` themes for WCAG AA contrast.
- **Do** preserve all methodological disclaimers (`(demo — unvalidated)`, `modelled`, `Not assured until a verifier signs`) in clear, legible text.

### Don't:
- **Don't** render eyebrow pills or `[Bracketed]` decorative tags above section titles.
- **Don't** apply `bg-clip-text text-transparent` gradient washes to headings or display type.
- **Don't** nest bordered/frosted boxes inside outer bordered cards.
- **Don't** use purple/indigo AI-gradient chrome, corner `blur-2xl`/`blur-3xl` glow orbs, decorative ghost `01`/`02`/`03` numerals, mixed `serif-drama` fonts, or gratuitous `animate-ping` rings.
