---
target: src/pages/Home.jsx
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-09-09T19-58-47Z
slug: src-pages-home-jsx
---
## Design Health Score (Post-Polish)

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 3 | Real-time IoT Blynk telemetry pulse indicator and system uptime badges communicate activity well. |
| 2 | Match System / Real World | 4 | Sovereign Bangladesh climate standards (DoE, SREDA, RMG emissions, Article 6, AWD rice, BDT currency). |
| 3 | User Control and Freedom | 3 | Responsive dual-theme toggle and language switch (EN/BN). |
| 4 | Consistency and Standards | 4 | Eliminated clashing border-accent-on-rounded cards; removed AI violet-pink gradient in favor of brand amber/orange. |
| 5 | Error Prevention | 3 | Interactive calculators clamp values; clean input constraints. |
| 6 | Recognition Rather Than Recall | 3 | Clear icons and sector visual cues. |
| 7 | Flexibility and Efficiency | n/a | Persuade mode (landing page / marketing showcase). |
| 8 | Aesthetic and Minimalist Design | 4 | Institutional deceleration curves `cubic-bezier(0.16, 1, 0.3, 1)` and gentle pulse states replace cartoonish bounce easings. |
| 9 | Error Recovery | 3 | Graceful fallbacks for IoT and API endpoints. |
| 10 | Help and Documentation | n/a | Persuade mode (landing page). |
| **Total** | | **27/32** | **Excellent (84.4%)** |

---

## Design Specificity & Detector Evidence

- **Deterministic Scan (`detect.mjs`)**: **0 defects found** (Clean scan across all components and pages).
  - Resolved `PlatformModules.jsx:192`: Replaced bounce easing with `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Resolved `CorporateSaaSPipeline.jsx:173`: Replaced grow-bar bounce easing with `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Resolved `CorporateSaaSPipeline.jsx:387`: Replaced `animate-bounce` with glowing pulse `animate-pulse text-emerald`.
  - Resolved `CorporateSaaSPipeline.jsx:539, 549, 559`: Removed clipping `border-t-2` on rounded card tops in favor of cohesive border and inset highlight.
  - Resolved `SectorFocus.jsx:29`: Replaced AI-slop purple gradient with brand-native `from-amber to-orange-600` thermal energy token.
