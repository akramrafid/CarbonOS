# Document AI Evaluation

## Status: NOT EVALUATED

No extraction accuracy figure exists for CarbonOS. There is no consented, labelled set of real customer
invoices, so any accuracy number would be invented. `atlas_benchmark.py` runs over synthetic in-file cases
and is **not** evidence of real-world accuracy (data register A13).

## What runs today

| Path | When | Confidence shown |
|---|---|---|
| Rule-based (regex) parser, server (`extractor.regex_heuristic_extraction`) and client (`esgDocumentExtractor.js`) | default | none (`null`): a regex match has no model confidence |
| Gemini extraction (`extractor.extract_parameters_with_gemini`) | only with `ESG_LLM_EXTRACTION_ENABLED=true` (and, in production, a recorded data-processing terms reference) | the model's self-reported score, labelled "extraction-model confidence" — never verification |
| Text extraction | pdfplumber (text PDFs), pandas (CSV/XLSX), python-docx | — scanned PDFs return no text (no OCR yet) → 422 "enter manually" |

Guarantees that are tested: no fallback values on failure (422), every extracted value carries its source
snippet, extracted values only enter the ledger after a person confirms them and a different person approves
the record, and an injected document cannot bring other tenants' content into an LLM prompt.

## Evaluation plan (needs customer consent and labelled data)

1. Collect ≥100 real utility/fuel invoices across issuers (DESCO, DPDC, BPDB/REB, Titas, fuel vendors), formats
   (native PDF, scans, XLSX) and languages (English/Bangla) under written consent; strip personal data.
2. Two annotators label fields (provider, invoice no., period, meter, quantity, unit, amount, page); adjudicate.
3. Metrics per field and per path: exact-match on numbers after unit normalisation, unit accuracy, page
   attribution accuracy, false-extraction rate on documents without the field, abstention rate.
4. Gate: a path may pre-fill review forms only above agreed per-field thresholds; it never auto-approves.
5. Re-run on every parser/prompt/model change; keep versioned results here.
