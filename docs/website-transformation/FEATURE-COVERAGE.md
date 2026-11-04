# Feature coverage — audited Asif baseline

2026-11-04 at `ffc5ffc`. “Implemented” below describes code on Asif, not production certification. Current task execution is tracked in ROADMAP and IMPLEMENTATION-LOG.

| Area | Current evidence | Remaining gap |
|---|---|---|
| Factory ESG demo | Real isolated demo API; three personas; calculation, review/lock/export browser journey recorded in docs/showcase | Ledger filters/paging and per-page reference metadata implemented; production OIDC/Postgres operations, new supplied document links now SQL-authorized; historical source governance and main accounting integration remain |
| Scope 1/2 | Deterministic Decimal engine, boundaries and region matching; invalid explicit market inputs block; incomplete facility market totals are null; schema-v2 facility exports carry correct kg units | Historical v1 facility units need reviewed restatement; main equipment/refrigerant/certificate/instrument and derived grid work absent |
| Documents | Text ingestion, rules/provider opt-in, source chunks/hashes, manual review | Main versioned bill profiles and OCR absent; no real invoice accuracy benchmark |
| RAG | Authorized SQL candidates, BM25, optional compatible vectors, checked source excerpts/numbers, abstention/model/mode; full SQL-authorized passage inspector, local provenance answer export and bounded in-memory answer history and independent two-document scoped comparison with partial failures/combined export | No demonstrated learned multilingual retrieval quality; 2,000 chunk bound, vector cache concurrency |
| Public site | CarbonOS branding, factory workflow, scope disclosures, local pilot download, trust/company policies; factual technology architecture/research/deployment boundaries and publisher-linked standards/scope page | Full Bengali content, verified contact/domain, rendered crawl content/performance measurements |
| Shared UI | Native mobile modal, skip link, reduced motion, labels and 44px ESG controls, scrollable semantic tables | Semantic state/control tokens and described fields implemented; full error/focus coverage, skeletons/breadcrumbs remain |
| MRV | Analysis/boundary/history/uncertainty/provenance/drone/export code and API call sites | Field/model validation, explicit observation types throughout, authorization/credential audit |
| Registry | Django bridge project/rules/submission/adjustment call sites; sandbox code paths | Exact lifecycle mapping, authenticated external receipts; no official issuance claim |
| Other modules | Reachable crop/weather/marketplace/farmer/sector/legacy dashboards | Mock states, unsupported actions, payment/telemetry integrity and route-by-route behavior audit |
| Responsive QA | Ten-project shell suite: 40 pass; includes 390/1920 and landscape; primary desktop/320px protected ESG journey | Real devices and complete screen-reader/zoom/locale validation |
| Delivery | Clean baseline pushed to origin/Asif; existing build/unit/E2E histories | Artifact contract resolved; 49 legacy color findings remain. Supported hosted ESG CI passed at b31e35e; main mutation integration still open |

Historical evidence: [competitive QA](../showcase/COMPETITIVE_UPGRADE_QA.md), [AI changes](../showcase/AI_SYSTEM_UPGRADE.md), [competitor comparison](../showcase/COMPETITOR_REVIEW.md). These are scoped snapshots, not evidence that this entire transformation is complete.
