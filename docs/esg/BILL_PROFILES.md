# Bill profiles and dynamic bill parameters

Adding a utility, a bill layout or a new field, and analysing any field, is a **data change**: YAML loaded
through the API, approved by a second person. No code change and no deploy.

Status: every profile shipped in the repository is a **DRAFT seed awaiting a real bill**. Seeds carry no
detection anchors, extraction hints or aliases, because those are the words printed on real bills and are taken
only from real, consented, redacted bills. All tests use SYNTHETIC fixtures (`synthetic_*`); real bills replace
them as the reference set when they arrive. Nothing here is verified or assured.

## Three kinds of data

| Document | Schema | What it holds |
|---|---|---|
| Parameter definitions | `carbonos.bill_parameters/1` | One definition per field: stable key (`energy.kwh.register`, `meter.multiplier`, `demand.kw.max`, `gas.volume.corrected`, ...), English/Bengali labels and aliases, data type, dimension and canonical unit (pint), allowed input units, role (identifier, period, meter_read, multiplier, consumption, demand, power_quality, tariff, cost, quality_flag), group (bill › meter › register, generator), optional ledger mapping (consumption parameters only), `derived: true` for computed values |
| Rule sets | `carbonos.bill_rulesets/1` | Named sets of derived values and validation rules as expressions over parameter keys |
| Profiles | `carbonos.bill_profile/1` | One issuer + document type + layout version: detection anchors, repeating sections (e.g. one per meter), fields with extraction hints (anchor text, value to the right or below), tables (e.g. TOU registers with a band label per row), rule sets used, own rules, effective dates |

Repository copies: `inference/esg_rag/bill_profiles/` (`parameters.yaml`, `rulesets.yaml`, `seed/*.yaml`).
Database copies: `esg_bill_parameter`, `esg_bill_profile` (migration 0007).

## Versions and approval

* Loading YAML (`POST /api/esg/bill-parameters`, `POST /api/esg/bill-profiles`, body `{"yaml": "..."}`) creates a
  new DRAFT version only when the content changed (SHA-256 of the canonical definition); unchanged content
  returns the existing version.
* A second person approves each version (`POST .../{id}/approve`); the author cannot. A profile can be approved
  only after every parameter definition it uses is approved. Organization definitions need an admin;
  platform-wide ones (`platform_wide: true`, or `POST /api/esg/bill-profiles/load-repository` for the seeds) need
  a platform operator.
* A stored profile version is self-contained: its rule sets are expanded and the parameter definitions it uses are
  snapshotted. An extracted bill keeps the profile version it was read with, even after a newer version is
  approved.

## Reading a bill

1. `POST /api/esg/bills` (words or text lines read locally) or `POST /api/esg/bills/upload` (PDF text layer via
   pdfplumber, or local Tesseract OCR with `ben+eng`). Nothing is sent to an external service.
2. Detection runs over APPROVED profiles only. No match → `UNKNOWN_PROFILE`; more than one profile →
   `AMBIGUOUS_PROFILE`. Both go to a person (`POST /bills/{id}/assign-profile`); the engine never guesses.
3. Extraction output is long-form: one row per value with parameter key, profile version, group index
   (`meter:1/register:2`), raw text, normalised value and canonical unit, page and bounding box, source
   (`pdf_text` / `ocr` / `manual`) and status. `confidence` is NULL unless measured (Tesseract word confidence).
   Every number no field took is kept as an `unmapped` candidate with its evidence; a reviewer can map it
   (`POST /bill-values/{id}/map`). Nothing is dropped.
4. A person confirms, corrects (the extracted value is kept) or rejects every value
   (`POST /bill-values/{id}/confirm|correct|reject`). Derived values and findings are recomputed from the current
   review state after each change.
5. `POST /bills/{id}/post` creates DRAFT ledger activity records from reviewed consumption values that have a
   ledger mapping. It refuses a bill with a non-approved profile, a blocking finding or an unreviewed value. The
   activities then need their own independent approval in the ledger.

## Rules

Expressions are parsed with `ast.parse` and walked by `bill_rules.py`; nothing is passed to `eval`/`exec` or
compiled to bytecode. Allowed: numbers, strings, True/False, parameter keys, `+ - * / **` (whole exponents up to
12), comparisons, `and/or/not`, `a if c else b`, and `abs min max sum round sqrt count present`. Everything else
(attribute access, subscripts, imports, other calls, lambdas, comprehensions, keyword arguments, f-strings,
names starting with `_`) is rejected when the profile is loaded. Keys above the rule's scope read as single
values; keys below it read as lists and need an aggregate. Arithmetic is Decimal.

Rule set `electricity_meter_reads` carries the Step 3 checks: `METER_ROLLOVER`, `NEGATIVE_READING`,
`READING_MISMATCH` (billed = (present − previous) × MF ± 0.5 kWh), `ESTIMATED_READ` (not blocking),
`TOU_SUM_MISMATCH`. `gas_volume` carries `GAS_CORRECTION_MISMATCH`; `electricity_power_quality` derives the power
factor from kWh and kVArh; `generator_log` derives litres per kWh. The bills module (`esg_rag/bills.py`) runs the
same rule sets.

## Analysis on any parameter

`GET /api/esg/bill-analysis?keys=energy.kwh.register,cost.total&group_by=facility,meter,band,period&grain=month`
aggregates confirmed, corrected and derived values (sum, min, max, mean, count) in canonical units. `grain` is
`month` or `fiscal_year` (July–June). Tenant isolation and role checks are those of every ESG endpoint
(`read` to query, `write` to upload and review, `admin` / operator to define). The ESG workspace has a
*Bill analysis* tab with a minimal table.

## Adding something

| Change | Data to load |
|---|---|
| New utility or layout | A profile YAML (`profile_key`, `issuer`, `document_type`, `layout_version`, anchors from the real bill) |
| New field | A parameter definition (+ the field in a new profile version) |
| New check or derived value | A rule or `derived` entry in the profile (or a repository rule set) |

Proof: `tests/test_esg_bill_cases.py` runs every `tests/fixtures/bill_cases/*/case.yaml` (D1). Rule-language
injection tests: `tests/test_esg_bill_rules.py` (D2).

## Seed profiles awaiting a real bill

Electricity HT and LT: DESCO, DPDC, PBS/BREB, NESCO, WZPDCL, BPDB (12). Gas: Titas, Bakhrabad, KGDCL, Jalalabad,
Pashchimanchal, Sundarban (6). Fuel supplier challan, refrigerant vendor invoice, facility generator log (3).
Each needs a real, consented, redacted document to set its anchors, hints, aliases and effective dates, and a
second person to approve it.
