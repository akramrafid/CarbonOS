"""
Bengali and English bill text: digits, numbers and dates. Pure functions shared by the bill extraction engine
and the bills module.
"""
import datetime as dt
import re
import unicodedata
from decimal import Decimal, InvalidOperation

BENGALI_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
_MONTHS = {
    1: ("জানুয়ারি", "জানুয়ারী", "january", "jan"), 2: ("ফেব্রুয়ারি", "ফেব্রুয়ারী", "february", "feb"),
    3: ("মার্চ", "march", "mar"), 4: ("এপ্রিল", "april", "apr"), 5: ("মে", "may"), 6: ("জুন", "june", "jun"),
    7: ("জুলাই", "july", "jul"), 8: ("আগস্ট", "আগষ্ট", "august", "aug"), 9: ("সেপ্টেম্বর", "september", "sep", "sept"),
    10: ("অক্টোবর", "october", "oct"), 11: ("নভেম্বর", "november", "nov"), 12: ("ডিসেম্বর", "december", "dec"),
}
# NFC on both sides: য় may arrive precomposed (U+09DF) or as য + nukta.
MONTHS = {unicodedata.normalize("NFC", name): num for num, names in _MONTHS.items() for name in names}


class BillParseError(ValueError):
    pass


def to_ascii_digits(text: str) -> str:
    return unicodedata.normalize("NFC", text).translate(BENGALI_DIGITS)


def normalise_token(text: str) -> str:
    """Matching form of a word: NFC, ASCII digits, case-folded, outer punctuation removed."""
    return to_ascii_digits(text).casefold().strip(" :;,.=()[]|/-–—")


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
