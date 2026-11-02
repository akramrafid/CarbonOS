"""
Bangladeshi utility bills (Step 3): numbers and dates in Bengali or English, reading validation and field
provenance. Pure functions; OCR runs locally only (Tesseract ben+eng) and is optional.

Customer bills never leave the machine: there is deliberately no external AI or OCR call here.
Every extracted field keeps its page and bounding box, and nothing enters the ledger until a person has
confirmed every field (ready_for_ledger).
"""
import datetime as dt
import re
import unicodedata
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import List, Optional, Tuple

BENGALI_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
_MONTHS = {
    1: ("জানুয়ারি", "জানুয়ারী", "january", "jan"), 2: ("ফেব্রুয়ারি", "ফেব্রুয়ারী", "february", "feb"),
    3: ("মার্চ", "march", "mar"), 4: ("এপ্রিল", "april", "apr"), 5: ("মে", "may"), 6: ("জুন", "june", "jun"),
    7: ("জুলাই", "july", "jul"), 8: ("আগস্ট", "আগষ্ট", "august", "aug"), 9: ("সেপ্টেম্বর", "september", "sep", "sept"),
    10: ("অক্টোবর", "october", "oct"), 11: ("নভেম্বর", "november", "nov"), 12: ("ডিসেম্বর", "december", "dec"),
}
# NFC on both sides: য় may arrive precomposed (U+09DF) or as য + nukta.
MONTHS = {unicodedata.normalize("NFC", name): num for num, names in _MONTHS.items() for name in names}
READ_TOLERANCE_KWH = Decimal("0.5")  # bills print whole units; (current − previous) × MF may round


class BillParseError(ValueError):
    pass


def to_ascii_digits(text: str) -> str:
    return unicodedata.normalize("NFC", text).translate(BENGALI_DIGITS)


def parse_number(text: str) -> Decimal:
    """'১,২৩,৪৫৬.৫' or '123,456.5' → Decimal('123456.5'). Indian digit grouping is accepted."""
    s = to_ascii_digits(text).strip().replace(",", "").replace(" ", "")
    if not re.fullmatch(r"-?\d+(\.\d+)?", s):
        raise BillParseError(f"Not a number: {text!r}")
    try:
        return Decimal(s)
    except InvalidOperation as e:
        raise BillParseError(f"Not a number: {text!r}") from e


def parse_date(text: str) -> dt.date:
    """'১৫ জুলাই ২০২৫', '15 July 2025', '15-07-2025' or '15/07/2025' (day first) → date."""
    s = to_ascii_digits(text).strip()
    m = re.fullmatch(r"(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})", s)
    if m:
        return dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    m = re.fullmatch(r"(\d{1,2})\s+([^\d\s,]+),?\s+(\d{4})", s)
    if m and m.group(2).lower() in MONTHS:
        return dt.date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))
    raise BillParseError(f"Unrecognised date: {text!r}")


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


def _finding(code: str, detail: str, blocking: bool = True) -> dict:
    return {"code": code, "detail": detail, "blocking": blocking}


def register_consumption(r: Register) -> Tuple[Decimal, List[dict]]:
    """(current − previous) × MF, with a rollover when the dial wrapped. Rollovers need a person to confirm."""
    if r.current >= r.previous:
        return (r.current - r.previous) * r.multiplying_factor, []
    if r.meter_digits:
        wrapped = (Decimal(10) ** r.meter_digits - r.previous + r.current) * r.multiplying_factor
        return wrapped, [_finding("METER_ROLLOVER", f"{r.name}: {r.previous} → {r.current} on a {r.meter_digits}-digit dial")]
    return Decimal(0), [_finding("NEGATIVE_READING", f"{r.name}: current {r.current} < previous {r.previous}")]


def validate_electricity(bill: ElectricityBill) -> List[dict]:
    findings = []
    for r in bill.registers:
        kwh, notes = register_consumption(r)
        findings += notes
        if abs(kwh - r.billed_kwh) > READ_TOLERANCE_KWH:
            findings.append(_finding("READING_MISMATCH", f"{r.name}: ({r.current} − {r.previous}) × {r.multiplying_factor}"
                                                         f" = {kwh} ≠ billed {r.billed_kwh}"))
        if r.estimated:
            findings.append(_finding("ESTIMATED_READ", f"{r.name}: estimated by the utility; grade 'estimated'", False))
    tou_sum = sum((r.billed_kwh for r in bill.registers), Decimal(0))
    if abs(tou_sum - bill.billed_total_kwh) > READ_TOLERANCE_KWH:
        findings.append(_finding("TOU_SUM_MISMATCH", f"registers sum to {tou_sum} ≠ total {bill.billed_total_kwh}"))
    return findings


def validate_gas(bill: GasBill, tolerance_m3: Decimal = Decimal("0.5")) -> List[dict]:
    expected = bill.metered_m3 * bill.correction_factor
    if abs(expected - bill.billed_m3) > tolerance_m3:
        return [_finding("GAS_CORRECTION_MISMATCH", f"{bill.metered_m3} × {bill.correction_factor} = {expected} "
                                                    f"≠ billed {bill.billed_m3}")]
    return []


def validate_periods(bills: List) -> List[dict]:
    """Bills for one account and meter must not overlap; gaps are reported."""
    findings = []
    key = lambda b: (b.utility, b.account, b.meter)
    for k in sorted({key(b) for b in bills}):
        series = sorted((b for b in bills if key(b) == k), key=lambda b: b.period_start)
        for prev, nxt in zip(series, series[1:]):
            if nxt.period_start <= prev.period_end:
                findings.append(_finding("PERIOD_OVERLAP", f"{k}: {prev.period_start}..{prev.period_end} overlaps "
                                                           f"{nxt.period_start}..{nxt.period_end}"))
            elif (nxt.period_start - prev.period_end).days > 1:
                findings.append(_finding("PERIOD_GAP", f"{k}: no bill {prev.period_end}..{nxt.period_start}", False))
    return findings


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
    try:
        import pytesseract
        from PIL import Image
    except ImportError as e:
        raise OCRUnavailable("Install Tesseract with the 'ben' and 'eng' language data and pytesseract") from e
    data = pytesseract.image_to_data(Image.open(image_path), lang="ben+eng", output_type=pytesseract.Output.DICT)
    out = []
    for i, word in enumerate(data["text"]):
        if word.strip():
            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            conf = float(data["conf"][i])
            out.append(ExtractedField("word", word, data["page_num"][i], (x, y, x + w, y + h),
                                      conf / 100 if conf >= 0 else None))
    return out
