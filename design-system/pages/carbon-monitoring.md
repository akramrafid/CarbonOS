# Carbon monitoring — implemented research surface and open review

Updated 2026-11-04. Route: `/carbon-monitoring` (the earlier `/platform/carbon-monitoring` note was incorrect). Component: `src/pages/platform/CarbonMonitoring.jsx`; backend: `inference/carbon_monitoring/router.py`. Parent: [implemented foundations](../MASTER.md). This specification records the current code boundary and acceptance gaps; it does not establish methodology compliance, approved credits, calibrated uncertainty or independent assurance.

## Visual Direction

The existing research dashboard combines geographic boundaries, analysis results/history, uncertainty/baseline views, settings, provenance, verification tasks/drone fields and exports. It uses dark/forest panels, map controls and numeric/hash detail. Legacy colors, dense layout and trust/attestation language need a route-specific audit. Prefer source/status labels over decorative seals. Observed, inferred, simulated, untrained and unavailable data must be distinguishable before this surface is promoted as a supported product. Do not display a fixed uncertainty percentage or risk buffer as a measured result.

## Responsive States

The shared site shell is tested at ten widths. CarbonMonitoring's complete map, overlays, dialogs, dossier and result controls were not covered by that shell suite. M01/P02 must test 320/375/390/768/1024/1280/1440/1920 plus landscape, long hashes, panel overflow, touch map interactions, theme and 200%/400% zoom. These states are acceptance work, not recorded passes. Maps/tables may scroll within named regions; the page must not hide controls offscreen.

## Interaction States

Current API call sites include boundary upload, analysis, dashboard/history/alerts, settings, provenance verification/signing, drone verification completion and VM0047 export. Code also uses third-party place search/reverse lookup and contains simulation/random paths. Treat each as an independent capability requiring permission, source and failure review. A local provenance signature/chain result does not constitute external validation or issuance. Missing scene credentials/data, unavailable analysis models and failed exports must show actual server states. No fallback may silently become official or observed data. M01 must check source selection, asynchronous job progress/error/cancellation, empty history, source metadata, upload bounds and key/settings mutation authorization before release.

## Accessibility

Shared navigation/focus/route-error handling applies, but this full page has not received complete keyboard/screen-reader/zoom/forced-colors assessment. Map alternatives, meaningful chart legends/data tables, dialog focus restoration, labelled units, selectable/copyable hashes, errors/status announcements and reduced motion require direct testing. Do not infer compliance from the shared token tests or successful compilation.

## Instrumentation

No dedicated product analytics collector/exposure tracking is implemented. Existing API logs and stored provenance/results are operational/source records, not conversion metrics. Future instrumentation must exclude precise field boundaries/coordinates, document text, auth tokens and key material from analytics. Job latency/retrieval/model-version/scene-ID evidence should come from authorized backend records with configured retention. No performance, field-accuracy or scientific-validation benchmark for this route is asserted here.

## Acceptance and ownership

CarbonOS maintainers own M01/G01/P02 in the transformation roadmap. Field calibration, representative labels, provider credentials and independent scientific review are external dependencies for M02. The existing route remains a research prototype; no VVB/Verra/sovereign attestation or official registry approval is claimed by this spec.
