# Remaining gaps and dependencies

As of A00 (2026-11-04), the enterprise brief is **not complete**. See ROADMAP for task-level acceptance and priorities.

1. Shared theme states, form descriptions/date validation, requested viewport widths and route-failure recovery are implemented and tested. Full design-system and legacy-route work remains.
2. Frontend contract is red: missing funnel, four unresolved templates and 64 source findings. Fix source/doc causes; do not suppress the gate.
3. Main contains overlapping accounting, bill/OCR and factor improvements. Selective integration requires schema and old/new regression review; main was not merged.
4. Weather credential requests and invented fallback are removed. Browser Blynk telemetry still needs removal or authenticated server mediation. Never copy credential values into documentation. The operator must rotate any historically exposed credentials.
5. MRV, registry, marketplace, crop/weather and legacy dashboard routes need honest state/action audits. Local sandbox or synthetic success cannot establish official approval, payment, calibrated prediction or issued credits.
6. RAG has working evidence controls but no field-grade learned EN/BN semantic benchmark. Corpus scale, cache concurrency, production authorization and provider retention terms remain open.
7. Current UI navigation is bilingual; body content and critical forms are not fully localized. Complete manual assistive-technology, zoom, contrast and real-device testing remains open.
8. No verified public contact address or deployed domain has been provided. Keep pilot export local; canonical/contact/production sitemap setup is blocked on verified operator configuration.
9. CI browser OS support and main's mutation pytest compatibility must be addressed with real version evidence. Passing local browser tests does not mean hosted CI ran.
10. Production OIDC/Postgres/concurrency, backup restore/load, infrastructure headers, independent security/accounting review and model/field calibration require external environment/data/access.

Do not claim CarbonOS is the sector's best product or production/scientifically validated from synthetic fixtures. Current competitor analysis is source-linked in docs/showcase/COMPETITOR_REVIEW.md.
