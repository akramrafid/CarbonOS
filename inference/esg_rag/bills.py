"""
Bangladeshi utility bills (Step 3): numbers and dates in Bengali or English, reading validation and field
provenance. Pure functions; OCR runs locally only (Tesseract ben+eng) and is optional.

The validators run on the profile system: each bill becomes long-form values (bill_extract.Extracted) and is
checked by the repository rule sets in bill_profiles/rulesets.yaml, the same rules a stored profile version uses.
Changing a check is a data change there, not a code change here.

Customer bills never leave the machine: there is deliberately no external AI or OCR call here.
Every extracted field keeps its page and bounding box, and nothing enters the ledger until a person has
confirmed every field (ready_for_ledger).
"""
import datetime as dt
from dataclasses import dataclass
from decimal import Decimal
from functools import lru_cache
from typing import List, Optional, Tuple

from . import bill_extract as bx
from .bill_text import BENGALI_DIGITS, MONTHS, BillParseError, parse_date, parse_number, to_ascii_digits  # noqa: F401

READ_TOLERANCE_KWH = Decimal("0.5")  # bills print whole units; the rule sets use the same tolerance


@dataclass(frozen=True)
class Register:
    name: str  # e.g. "peak", "off_peak", "flat"; TOU registers sum to the bill total
    previous: Decimal
    current: Decimal
    multiplying_factor: Decimal
    billed_kwh: Decimal
    estimated: bool = False
    meter_digits: Optional[int] = None  # dial size, to recognise a rollover


@dataclass(frozen=True)
class ElectricityBill:
    utility: str  # DESCO, DPDC, BREB/PBS, NESCO, WZPDCL, BPDB
    account: str
    meter: str
    period_start: dt.date
    period_end: dt.date
    registers: Tuple[Register, ...]
    billed_total_kwh: Decimal


@dataclass(frozen=True)
class GasBill:
    utility: str  # Titas, Bakhrabad, KGDCL, Jalalabad, Pashchimanchal, Sundarban
    account: str
    meter: str
    period_start: dt.date
    period_end: dt.date
    metered_m3: Decimal
    correction_factor: Decimal
    billed_m3: Decimal


@lru_cache(maxsize=None)
def _profile(*rulesets: str) -> dict:
    return bx.rules_profile(rulesets)


def _row(key, path, value) -> bx.Extracted:
    return bx.Extracted(key, path, "", value, None, None, None, "manual")


def _register_rows(i: int, r: Register) -> List[bx.Extracted]:
    meter, reg = f"meter:{i}", f"meter:{i}/register:1"  # one meter per register keeps each register's own MF
    rows = [_row("meter.multiplier", meter, r.multiplying_factor),
            _row("meter.read.previous", reg, r.previous), _row("meter.read.current", reg, r.current),
            _row("meter.read.estimated", reg, r.estimated), _row("energy.kwh.register", reg, r.billed_kwh)]
    if r.meter_digits:
        rows.append(_row("meter.digits", meter, Decimal(r.meter_digits)))
    return rows


def _plain(findings) -> List[dict]:
    return [{"code": f["code"], "detail": f["detail"], "blocking": f["blocking"]} for f in findings]


def register_consumption(r: Register) -> Tuple[Decimal, List[dict]]:
    """(current − previous) × MF, with a rollover when the dial wrapped. Rollovers need a person to confirm."""
    derived, findings = bx.evaluate_bill(_register_rows(1, r), _profile("electricity_meter_reads"))
    kwh = next(d.value for d in derived if d.key == "energy.kwh.computed")
    return kwh, _plain(f for f in findings if f["code"] in ("METER_ROLLOVER", "NEGATIVE_READING"))


def validate_electricity(bill: ElectricityBill) -> List[dict]:
    rows = [_row("energy.kwh.total", "", bill.billed_total_kwh)]
    for i, r in enumerate(bill.registers, start=1):
        rows += _register_rows(i, r)
    return _plain(bx.evaluate_bill(rows, _profile("electricity_meter_reads"))[1])


def validate_gas(bill: GasBill) -> List[dict]:
    rows = [_row("gas.volume.measured", "meter:1", bill.metered_m3),
            _row("gas.volume.correction_factor", "meter:1", bill.correction_factor),
            _row("gas.volume.corrected", "meter:1", bill.billed_m3)]
    return _plain(bx.evaluate_bill(rows, _profile("gas_volume"))[1])


def validate_periods(bills: List) -> List[dict]:
    """Bills for one account and meter must not overlap; gaps are reported."""
    return _plain(bx.period_findings([((b.utility, b.account, b.meter), b.period_start, b.period_end) for b in bills]))


@dataclass(frozen=True)
class ExtractedField:
    name: str
    value: str
    page: int
    bbox: Tuple[float, float, float, float]  # x0, y0, x1, y1 in page points
    confidence: Optional[float] = None
    confirmed_by: Optional[str] = None
    confirmed_value: Optional[str] = None  # what the person accepted (may correct the OCR value)


def confirm(f: ExtractedField, person: str, value: Optional[str] = None) -> ExtractedField:
    return ExtractedField(f.name, f.value, f.page, f.bbox, f.confidence, person, value if value is not None else f.value)


def ready_for_ledger(fields_: List[ExtractedField]) -> Tuple[bool, List[str]]:
    """Every field must be confirmed by a person before anything enters the ledger."""
    pending = [f.name for f in fields_ if not f.confirmed_by]
    return not pending, pending


class OCRUnavailable(RuntimeError):
    pass


def ocr_page_words(image_path: str) -> List[ExtractedField]:
    """Local OCR (Tesseract ben+eng) → words with bounding boxes. Never calls an external service."""
    doc = bx.document_from_image(image_path)
    return [ExtractedField("word", w.text, page.number, w.bbox, w.confidence) for page in doc.pages for w in page.words]
