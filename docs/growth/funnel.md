# CarbonOS prototype funnel contract

Owner: CarbonOS project maintainers. Date: 2026-11-04. Routes and behavior reflect Asif through `b31e35e`. This describes the working showcase, not a paid service or an instrumented customer funnel.

| Stage | User intent / route | Working action and next state | Evidence / failure path |
|---|---|---|---|
| Discover | Understand factory ESG, `/` | Read scope, select a workflow preview step | FactoryWorkflow/ProductScope; previews explicitly synthetic |
| Evaluate | Inspect controls, `/company/trust`, `/how-it-works` | See source → review → calculation → lock/export sequence | Product/company browser specs; research modules retain separate limitations |
| Start demo | `/platform/esg` | Isolated deployment provisions synthetic tenant/personas; protected deployment requires actual sign-in | esgAuth, API permissions; unavailable session offers retry; never fake successful data |
| First value | ESG source/ledger | Inspect extracted source values, save/submit, independently review | summit-showcase + protected esg-journey; uncertain extraction needs human confirmation |
| Core value | Calculation & reports | Calculate with approved factors, independent lock, download reproducible report | Complete protected browser journey; API rejects unauthorized/self approval |
| Pilot planning | `/#pricing` | Select facilities/formats/language/scope and download local brief | product-site + pilotBrief unit tests; no enquiry is submitted |
| Commercial | Not implemented | No checkout, quote, subscription or verified public inbox in the primary funnel | Operator contact, deployment and service terms required first |
| Retention | Not measured | Reopen authorized workspace and reporting period | No production cohort/event tracking is installed |

## Guardrails and measurement

Never use simulated credits, fabricated clients, fake official status or invented model quality as conversion proof. Use synthetic data for rehearsals. Do not send documents/profile/phone/auth data into analytics. There is no analytics SDK or conversion collector in the supported primary flow. The measurement plan documents proposed definitions and explicit implementation gaps, not working instrumentation. Any future consent/retention/collector implementation needs review before activation.

## Accessibility and recovery

Shared navigation has a skip link, native mobile modal/Escape/focus restoration, EN/BN navigation, visible focus and light/dark states. ESG fields describe their help/errors; period validation focuses the invalid end date. A route error boundary offers reload/home. Tests cover ten emulated widths; full screen-reader, real-device and translated body-content review remains open.
