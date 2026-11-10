# Visual & Runtime Baseline Report (Phase 0 Preflight)

Generated on 2026-11-10T12:02:29.136Z across **288** route/viewport/theme combinations.

---

## Executive Summary Checklist

| Category | Snapshots Affected | Severity | Primary Root Causes |
| :--- | :---: | :---: | :--- |
| **Horizontal Page Overflow** | **7** / 288 | High | Cards/tables with fixed `min-w`, missing `min-w-0`, lack of responsive grid wrapping |
| **Visually Clipped Cards & Panels** | **288** / 288 | High | Ancestors with `overflow-hidden` clipping shadows, cards exceeding container width |
| **Console Errors / Exceptions** | **29** / 288 | Medium | Uncaught runtime errors, missing image/tile endpoints, Leaflet re-init collisions |
| **Failed Network Requests** | **24** / 288 | Medium | External map tile 404s, mock APIs without backend handlers |
| **High Layout Shift (CLS > 0.05)** | **244** / 288 | Medium | Late font swapping, unstabilized image/chart dimension calculations |

---

## 1. Top Visually Clipped Elements & Cards

The following components and routes exhibited card or element clipping caused by ancestor `overflow: hidden/clip`:

| Route | Viewport | Theme | Clipped Element | Clipping Ancestor | Cutoff Dimensions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | 375px | light | `<div.hero-bg.absolute>` | `<section.relative.min-h-[100dvh]>` | R: +11px, B: +41px |
| `/` | 375px | light | `<div.hero-terminal-card.bg-[#080F0B]/90>` | `<section.relative.min-h-[100dvh]>` | R: +17px, B: +-75px |
| `/` | 375px | light | `<div.absolute.top-0>` | `<section.relative.min-h-[100dvh]>` | R: +16px, B: +-436px |
| `/` | 375px | light | `<div.flex.whitespace-nowrap>` | `<div.w-full.bg-[#050C07]>` | R: +8221px, B: +-15px |
| `/` | 375px | light | `<div.flex.items-center>` | `<div.w-full.bg-[#050C07]>` | R: +25px, B: +-15px |
| `/how-it-works` | 375px | light | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/how-it-works` | 768px | light | `<div.w-full.bg-emerald>` | `<section.relative.py-24>` | R: +-383px, B: +-2488px |
| `/platform/project-onboarding` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/mrv-dashboard` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/carbon-registry` | 375px | dark | `<div.absolute.top-0>` | `<header.mb-8.border>` | R: +-1px, B: +-559px |
| `/platform/carbon-registry` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/verification-workflow` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/marketplace` | 375px | dark | `<div.absolute.top-0>` | `<div.relative.overflow-hidden>` | R: +95px, B: +-253px |
| `/platform/marketplace` | 375px | dark | `<div.flex.items-center>` | `<div.rounded-2xl.border>` | R: +1315px, B: +-296px |
| `/platform/marketplace` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/ai-detection` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/saas-dashboard` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/saas-dashboard` | 1440px | dark | `<div.flex.justify-between>` | `<div.p-6.rounded-3xl>` | R: +-25px, B: +36px |
| `/platform/esg` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/platform/impact` | 375px | dark | `<div.absolute.top-20>` | `<div.bg-[#080F0B].min-h-screen>` | R: +49px, B: +-5251px |
| `/platform/impact` | 375px | dark | `<div.absolute.bottom-20>` | `<div.bg-[#080F0B].min-h-screen>` | R: +-40px, B: +-80px |
| `/platform/impact` | 375px | dark | `<div.p-3.bg-[#080F0B]/80>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-29px, B: +27px |
| `/platform/impact` | 375px | dark | `<div.flex.items-center>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-104px, B: +5px |
| `/platform/impact` | 375px | dark | `<div.text-left.leading-none>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-104px, B: +5px |
| `/platform/impact` | 375px | dark | `<div.text-[10px].text-mist/60>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-104px, B: +5px |
| `/platform/impact` | 375px | dark | `<div.text-right.leading-none>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-42px, B: +14px |
| `/platform/impact` | 375px | dark | `<div.text-[9px].text-mist/40>` | `<div.lg:col-span-2.bg-[#0D2B1A]/20>` | R: +-42px, B: +14px |
| `/platform/impact` | 1024px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/carbon-monitoring` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |
| `/farmers-ai` | 375px | dark | `<div.w-full.overflow-hidden>` | `<section.relative.w-full>` | R: +0px, B: +8px |

---

## 2. Horizontal Overflow Hotspots (document.scrollWidth > clientWidth)

The following views trigger horizontal window scrolling on mobile and tablet screens:

| Route | Viewport | Theme | Client Width | Scroll Width | Culprit Elements |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `/platform/esg` | 1024px | light | 1024px | **1152px** | `<div.hidden.lg:flex>` (827px), `<button.font-mono.text-[11px]>` (122px), `<div.flex.items-center>` (229px), `<button.ghost-btn.font-sans>` (87px), `<span.text-white.drop-shadow-sm>` (16px) |
| `/carbon-monitoring` | 1024px | light | 1024px | **1434px** | `<div.hidden.lg:flex>` (830px), `<button.font-mono.text-[11px]>` (122px), `<div.flex.items-center>` (229px), `<button.ghost-btn.font-sans>` (87px), `<span.text-white.drop-shadow-sm>` (16px) |
| `/carbon-monitoring` | 768px | light | 768px | **1408px** | `<div#mobile-menu-drawer.fixed.inset-0>` (768px), `<div.flex.flex-col>` (768px), `<a.font-sans.font-bold>` (720px), `<a.font-sans.font-bold>` (720px), `<a.font-sans.font-bold>` (720px) |
| `/carbon-monitoring` | 1024px | dark | 1024px | **1434px** | `<div.hidden.lg:flex>` (830px), `<button.font-mono.text-[11px]>` (122px), `<div.flex.items-center>` (229px), `<button.ghost-btn.font-sans>` (87px), `<span.text-white.drop-shadow-sm>` (16px) |
| `/carbon-monitoring` | 768px | dark | 768px | **1434px** | `<div#mobile-menu-drawer.fixed.inset-0>` (768px), `<div.flex.flex-col>` (768px), `<a.font-sans.font-bold>` (720px), `<a.font-sans.font-bold>` (720px), `<a.font-sans.font-bold>` (720px) |
| `/farmers-ai/camera` | 375px | dark | 375px | **576px** | `<div#mobile-menu-drawer.fixed.inset-0>` (375px), `<div.flex.flex-col>` (375px), `<a.font-sans.font-bold>` (327px), `<a.font-sans.font-bold>` (327px), `<a.font-sans.font-bold>` (327px) |
| `/farmers-ai/camera` | 375px | light | 375px | **576px** | `<div#mobile-menu-drawer.fixed.inset-0>` (375px), `<div.flex.flex-col>` (375px), `<a.font-sans.font-bold>` (327px), `<a.font-sans.font-bold>` (327px), `<a.font-sans.font-bold>` (327px) |

---

## 3. Console Errors & Runtime Exceptions

| Route | Viewport | Theme | Error Message |
| :--- | :---: | :---: | :--- |
| `/platform/carbon-registry` | 375px | dark | `Failed to load resource: the server responded with a status of 403 (Forbidden)` |
| `/platform/verification-workflow` | 375px | dark | `Failed to load resource: the server responded with a status of 403 (Forbidden)` |
| `/carbon-monitoring` | 768px | light | `Failed to load resource: the server responded with a status of 404 (Not Found)` |
| `/farmers-ai` | 768px | dark | `WebSocket connection to 'ws://localhost:8000/ws/inference/' failed: Error during WebSocket handshake: Unexpected response code: 403` |
| `/farmers-ai/camera` | 375px | dark | `WebSocket connection to 'ws://localhost:8000/ws/inference/' failed: Error during WebSocket handshake: Unexpected response code: 403` |

---

## 4. Failed Network Requests

| Route | Viewport | Failed Request URL |
| :--- | :---: | :--- |
| `/` | 1440px | `GET http://localhost:5173/ezygo_clean.png (net::ERR_ABORTED)` |
| `/` | 1440px | `GET http://localhost:5173/School_Bus_clean.png (net::ERR_ABORTED)` |
| `/platform/carbon-registry` | 375px | `403 GET http://localhost:8001/api/registry-bridge/projects/` |
| `/platform/verification-workflow` | 375px | `403 GET http://localhost:8001/api/registry-bridge/projects/` |
| `/platform/esg` | 1024px | `GET http://localhost:5173/src/pages/platform/esg/BillIntakeWizard.jsx (net::ERR_ABORTED)` |
| `/platform/esg` | 1024px | `POST http://localhost:8000/api/esg/demo/session (net::ERR_ABORTED)` |
| `/carbon-monitoring` | 768px | `404 GET http://localhost:8000/api/carbon/provenance/mrv-2026-06-25-sundarbans` |
| `/farmers-ai` | 768px | `GET http://localhost:5173/src/lib/onnxRunner.js (net::ERR_ABORTED)` |
| `/farmers-ai` | 768px | `GET http://localhost:5173/src/lib/mockWeatherAPI.js (net::ERR_ABORTED)` |
| `/farmers-ai` | 768px | `GET http://localhost:5173/src/lib/useHarvestStore.js (net::ERR_ABORTED)` |
| `/farmers-ai` | 768px | `GET http://localhost:5173/node_modules/.vite/deps/react_jsx-runtime.js?v=f25ee617 (net::ERR_ABORTED)` |
| `/farmers-ai` | 768px | `GET http://localhost:5173/src/lib/etclPredictor.js (net::ERR_ABORTED)` |
| `/harvestguard/dashboard` | 1024px | `GET https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,relative_humidity_2m,wind_speed_10m (ne` |
| `/harvestguard/register-batch` | 375px | `GET https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,relative_humidity_2m,wind_speed_10m (ne` |

---

## 5. Phase 0 Remediation Checklist for Upcoming Phases

- [ ] **Phase 1 Architecture**: Deconstruct giant single-file views (`CarbonMonitoring.jsx`, `SaaSDashboard.jsx`) into modular feature folders; introduce persistent AppShell and shared `Card` / `Modal` / `DataTable` primitives.
- [ ] **Phase 2 Design System**: Remove hardcoded color literals, replace unconstrained `py-24`/`py-32` with parent-controlled rhythm, configure font definitions without `!important` hacks.
- [ ] **Phase 3 Card Clipping & Overflow**: Eliminate clipping on all cards by applying `min-w-0`, `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`, and removing unnecessary `overflow-hidden` on wrapper cards.
- [ ] **Phase 4 Dashboard Navigation**: Implement desktop collapsible rail / drawer system to resolve horizontal squishing of cards in tablet viewports.
- [ ] **Phase 5 Footer**: Modernize footer into a responsive multi-column layout with accordions on mobile.
- [ ] **Phase 6 Transitions**: Prevent abrupt page jumps with fluid outlet transitions and top progress bar.
- [ ] **Phase 7 Purposeful Motion**: Implement subtle micro-interactions, guided stepper in ESG, and interactive hero graphics.
- [ ] **Phase 8 Slop Eraser**: Clean up placeholder text and generic AI slogans.
- [ ] **Phase 9 Theming & Leak Verification**: Verify contrast across all tokens and ensure zero console errors in both themes.
- [ ] **Phase 10 Responsive Polish**: Audit across 320px–1920px with zero horizontal scroll and Lighthouse performance scores $\ge$ 90.
