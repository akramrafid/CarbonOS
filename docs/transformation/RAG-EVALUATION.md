# RAG evaluation: current evidence

Status: **local prototype evaluated on synthetic regressions; not independently audited or verified**.

The previous report's `AUDITED_AND_VERIFIED` label, 95% extraction accuracy, and 100% RAG pass-rate claims were not supported. The old ATLAS function replaced failed extractions with ground truth. It evaluated neither real invoices nor generated-answer faithfulness. Those figures are withdrawn.

The actual HTTP query path now uses membership-scoped SQL documents/chunks, BM25 lexical retrieval, compatible optional vectors, reciprocal-rank fusion, and structured Gemini synthesis with source/quote/number checks. Chroma is an optional existing index; it is not the authority for the HTTP path's visibility or source text. There is no learned reranker, OCR, trained anomaly detector, or independently validated regulatory corpus in this increment.

Current evidence and limitations are recorded in [AI_SYSTEM_UPGRADE.md](../showcase/AI_SYSTEM_UPGRADE.md):

- [Twelve-query labeled synthetic retrieval regression](../showcase/rag-retrieval-regression.json): English/Bengali search, private/public corpora, tenantless exclusion, negative and cross-tenant queries. This run has no stored learned dense vectors; it measures SQL/BM25 behavior.
- [Actual rules-extraction regression](../showcase/extraction-regression.json): ten synthetic text fixtures, with failures retained. This is not a RAG or real-document accuracy evaluation. CNG remains unsupported by this parser.
- [Live synthetic provider smoke checks](../showcase/rag-provider-smoke.json): initial fallback retained, supported answers with actual sources, and model abstention. These calls do not establish reliability, semantic entailment, or real-world accuracy.
- `tests/test_esg_rag_quality.py`: actual API isolation, database retrieval when indexes are unavailable, embedding-space/content compatibility, quote/source/number rejection, and abstention. Dense ranking uses mocked vectors in its compatibility test; it is not a learned retrieval-quality benchmark.

Confidence in the legacy response field is now a ranking score, never probability, legal authority, correctness, or verification. The API labels its score kind, answer mode, model, candidate limit, and review requirement. Source status defaults to `UNREVIEWED`; uploaded/seeded text is not automatically an authoritative regulatory source.

The model cannot write activities, select/approve factors, lock periods, or execute tools. Source and quote checks reduce specific failure modes but do not prove that a claim follows from the quote. Human review, a governed primary-source corpus, and a consented held-out evaluation set remain necessary. Prompt instructions are not a complete prompt-injection defense; see the [OWASP guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).
