# Component & Token Traceability

Every P0 route maps to a screen spec, composition, reusable components, and
the tokens those components consume. This is the bridge between design intent
and code review.

| Route / screen | Screen spec | Composition | Components | Tokens / page override | Browser evidence |
|---|---|---|---|---|---|
| `/platform/carbon-monitoring` | `design-system/pages/carbon-monitoring.md` | Single-page audit dashboard with 7 Verra VM0047/VM0048 cards | ControlBar, BoundaryCard, CarbonStockCard, AdditionalityCard, ConformalUncertaintyCard, SensorResolutionCard, HashLedgerCard, VVBCertificateCard | `design-system/pages/carbon-monitoring.md` | Verified via Vite production build and UI-UX-Pro-Max reasoning |

## New Pattern Decisions

| Pattern | Why it is needed | Master token/component update | Approval |
|---|---|---|---|
| Verra VM0047 dMRV Audit Inspector | Institutional audit compliance requiring high data density, monospace cryptographic verification, and RME visual gauge | Documented in `design-system/pages/carbon-monitoring.md` without mutating `design-system/MASTER.md` | Approved |

Rules:

- A page may compose existing components; it may not duplicate their tokens.
- A new visual pattern requires a Master update or documented page override.
- Every row has loading, empty, error, success, focus, disabled, and reduced-motion coverage.
