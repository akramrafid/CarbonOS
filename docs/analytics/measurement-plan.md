# Product measurement plan — prototype status

Date: 2026-11-04. Owner: CarbonOS project maintainers. **No product analytics collector, experiment service or conversion-event pipeline is implemented.** Existing API audit logs support accountability; they are not a customer analytics service. This document defines future measurement and avoids claiming unobserved adoption.

## North-star outcome

Proposed north-star: authorized reporting periods with an independently reviewed, reproducible locked export. Activation: first source-linked activity independently approved. Core value: a calculation locked by a different permitted actor, with successful report download. Synthetic demos must be excluded from customer outcome metrics. Revenue and retention are not measured; there is no active commercial conversion flow. Proposed retention window: a second reporting workflow within 30 days, to be validated with actual pilots.

## Funnel

See [implemented funnel](../growth/funnel.md). Discover → inspect → enter protected/demo workspace → source review → independent approval → calculation/lock/export → local pilot brief. Signup, paid checkout and production cohort tracking are absent. Do not infer a sale or submitted enquiry from a browser download. No current conversion or retention numbers exist.

## Event contract (proposed, not emitted)

All proposed events use schema version 1. Actor is a pseudonymous authorized principal only after an operator-approved consent/privacy decision. Destination, retention, deletion owner and collector are **unconfigured**, so none of these events may be enabled yet. No document text, query body, exact coordinates, contact fields, token, factor value or freeform message belongs in an event payload.

| Event | Trigger | Allowed non-sensitive properties | Deduplication | Decision |
|---|---|---|---|---|
| demo_entry | Synthetic demo session succeeds | schema_version, demo=true, locale | anonymous session + entry sequence | Understand entry failures, separately from real activation |
| activity_reviewed | API commits an independent decision | schema_version, demo, decision enum | audit event ID | Measure completion/rework without source contents |
| report_locked | API commits permitted period lock | schema_version, demo, revision | immutable lock audit ID | Measure reproducible core value |
| report_downloaded | Authorized export response completes | schema_version, demo, format enum | request ID + export revision | Diagnose export usability |
| pilot_brief_downloaded | Local file is generated | schema_version, locale | browser session + download sequence | Understand planning interest; never count as a lead submission |

Implementation prerequisites: schema validation, role/tenant boundaries, optional consent before first emission and after revocation, minimal retention with deletion, deduplication and collector-failure behavior that cannot block accounting. Current tests assert actual workflow behavior, not delivery of these proposed events.

## Attribution

No attribution persistence, cross-site identifiers or advertising SDK is installed. Current routes may contain ordinary UTM parameters, but no campaign aggregation is implemented. Future allowed campaign keys: utm_source, utm_medium, utm_campaign; exclude PII and document/query contents. Do not persist these until retention/consent and server reconciliation are approved.

## Experiment registry

No active experiments. Before any test, register hypothesis, eligibility, exposure definition, primary outcome, sample/duration rule, privacy guardrails and rollback owner. Do not claim an improvement from synthetic scripted sessions. QA screenshots and bundle deltas are engineering evidence, not conversion experiments.

## Decision

Contract definitions are documented; instrumentation, consent collector checks, deduplication and invalid-event monitoring remain NOT IMPLEMENTED. No production measurement or paid-conversion readiness claim is made.
