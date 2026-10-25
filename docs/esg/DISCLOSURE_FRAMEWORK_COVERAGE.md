# Disclosure Framework Coverage

**Coverage is not compliance.** CarbonOS shows which requirements have supporting data and reviewed
responses. It never labels an organization or report "compliant", and internal review is not external assurance.

Templates live in `inference/esg_rag/disclosures_catalog.py`. Titles are short paraphrases (no standard
text reproduced). **All references are `REFERENCES_TO_BE_VERIFIED`**: a qualified reviewer must check every
paragraph/disclosure number and applicability against the current official publications (and their
licences) before customers rely on them.

## Status model

Per requirement and reporting period:

| Status | Meaning |
|---|---|
| NOT_APPLICABLE | Recorded decision with mandatory rationale |
| MISSING_DATA | Required CarbonOS data absent (no locked GHG snapshot, no approved metric, or unsupported data such as Scope 3) — overrides any narrative state |
| NOT_STARTED / DRAFT / IN_REVIEW | Response workflow |
| APPROVED | Reviewed by someone other than the last editor; supporting data present; narrative present where required |
| PUBLISHED | Approved and released by an admin; then read-only |

## Templates

| Framework | Template | Materiality | Requirements | Data CarbonOS can evidence today |
|---|---|---|---|---|
| GRI Standards (selected) | carbonos-gri-2025.1 | impact | 12 | 305-1, 305-2 (locked snapshot); 303-3, 303-4, 306-3, 403-9, 404-1, 405-1, 2-9, 205-3 (approved metrics). **Always gaps:** 302-1 (no NCV conversion), 305-3 (no Scope 3) |
| IFRS S2 | carbonos-ifrs-s2-2023.1 | financial | 10 | Scope 1, Scope 2 location-based, measurement approach (locked snapshot); market-based instruments only when complete. Governance, strategy, resilience, risk management and targets are narrative-only. **Always a gap:** Scope 3 |
| ESRS (E1 etc.) | — | double | — | **Not supported** — no template |
| CDP | — | — | — | **Not supported** — questionnaire structure licensed; no template |

## Exports

`GET /periods/{id}/disclosures/{framework}?format=csv` — gap report listing every requirement, its status and
the specific missing data, with the coverage statement and verification status in the header.
