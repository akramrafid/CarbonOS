"""
Bill extraction driven only by profile data: detect the profile, extract each field by its hints, keep every
other number as an UNMAPPED candidate, normalise units, compute derived values and evaluate the profile's rules.

Output is long-form: one Extracted row per value, with its group index (e.g. meter:1/register:2), raw text,
normalised value and canonical unit, page and bounding box, and source (pdf_text / ocr / manual). confidence is
None unless it was measured (Tesseract word confidence). Nothing here confirms a value: a person does, later.

Documents never leave the machine: PDF text comes from pdfplumber, OCR from a local Tesseract (ben+eng).
"""
import datetime as dt
import io
import os
from dataclasses import dataclass, field, replace
from typing import Dict, List, Optional, Sequence, Tuple

from . import bill_profiles as bp
from . import bill_rules
from .bill_text import BillParseError, normalise_token, parse_date, parse_number

SOURCES = ("pdf_text", "ocr", "manual")
CHAR_WIDTH, LINE_HEIGHT = 6.0, 14.0  # geometry of text-layout fixtures and manual entry, in points


@dataclass(frozen=True)
class Word:
    text: str
    bbox: Tuple[float, float, float, float]  # x0, y0, x1, y1 in page points
    confidence: Optional[float] = None  # measured by OCR only


@dataclass(frozen=True)
class Page:
    number: int
    words: Tuple[Word, ...]


@dataclass(frozen=True)
class Document:
    pages: Tuple[Page, ...]
    source: str


@dataclass(frozen=True)
class Extracted:
    key: Optional[str]  # None = UNMAPPED candidate
    group_index: str  # "" (bill), "meter:1", "meter:1/register:2"
    raw_text: str
    value: object  # Decimal, date, str, bool or None
    unit: Optional[str]
    page: Optional[int]
    bbox: Optional[Tuple[float, float, float, float]]
    source: str
    confidence: Optional[float] = None
    status: str = "extracted"  # extracted / unmapped / derived


@dataclass
class _Line:
    page: int
    words: List[Word]
    tokens: List[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return " ".join(w.text for w in self.words)


# --- documents ----------------------------------------------------------------------------------

def document_from_layout(spec: dict) -> Document:
    """Pages of text lines (fixtures, manual entry) or of pre-extracted words with boxes (local OCR / Docling)."""
    source = spec.get("source", "manual")
    if source not in SOURCES:
        raise ValueError(f"source must be one of {', '.join(SOURCES)}")
    pages = []
    for n, page in enumerate(spec.get("pages") or [], start=1):
        words = []
        for w in page.get("words") or []:
            conf = w.get("confidence")
            words.append(Word(str(w["text"]), tuple(float(c) for c in w["bbox"]),
                              float(conf) if conf is not None else None))
        for row, line in enumerate(page.get("lines") or []):
            col = 0
            for part in str(line).split(" "):
                if part:
                    words.append(Word(part, (col * CHAR_WIDTH, row * LINE_HEIGHT, (col + len(part)) * CHAR_WIDTH,
                                             row * LINE_HEIGHT + 10)))
                col += len(part) + 1
        pages.append(Page(n, tuple(words)))
    if not pages:
        raise ValueError("A document needs at least one page")
    return Document(tuple(pages), source)


# Local OCR bounds: image formats Pillow may open, pixels (a 300 dpi A3 page is about 17.4 million) and seconds.
OCR_FORMATS = ("PNG", "JPEG", "TIFF", "BMP", "GIF", "WEBP")
MAX_OCR_PIXELS = 40_000_000
OCR_TIMEOUT_S = 120


def _source(source):
    """A path or the document's bytes (read in memory, so nothing is written to disk)."""
    return io.BytesIO(source) if isinstance(source, (bytes, bytearray)) else source


def document_from_pdf(source, max_pages: Optional[int] = None) -> Document:
    """Text layer of a PDF via pdfplumber, locally. Pages without text are scans: OCR them instead."""
    import pdfplumber
    pages = []
    with pdfplumber.open(_source(source)) as pdf:
        if max_pages is not None and len(pdf.pages) > max_pages:
            raise ValueError(f"A bill may have at most {max_pages} pages")
        for n, page in enumerate(pdf.pages, start=1):
            words = [Word(w["text"], (float(w["x0"]), float(w["top"]), float(w["x1"]), float(w["bottom"])))
                     for w in page.extract_words(keep_blank_chars=False)]
            pages.append(Page(n, tuple(words)))
    return Document(tuple(pages), "pdf_text")


def document_from_image(source, lang: str = "ben+eng") -> Document:
    """Local Tesseract OCR (Bengali + English). Word confidence is measured, so it is kept."""
    from .bills import OCRUnavailable
    try:
        import pytesseract
        from PIL import Image
    except ImportError as e:
        raise OCRUnavailable("Install Tesseract with the 'ben' and 'eng' language data and pytesseract") from e
    if os.environ.get("TESSERACT_CMD"):  # a local install that is not on PATH (the Windows installer does not add it)
        pytesseract.pytesseract.tesseract_cmd = os.environ["TESSERACT_CMD"]
    with Image.open(_source(source), formats=OCR_FORMATS) as image:  # closed even when OCR fails
        if image.width * image.height > MAX_OCR_PIXELS:
            raise ValueError(f"Image larger than {MAX_OCR_PIXELS} pixels")
        data = pytesseract.image_to_data(image, lang=lang, output_type=pytesseract.Output.DICT,
                                         timeout=OCR_TIMEOUT_S)
    words = []
    for i, text in enumerate(data["text"]):
        if text.strip():
            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            conf = float(data["conf"][i])
            words.append(Word(text, (x, y, x + w, y + h), conf / 100 if conf >= 0 else None))
    return Document((Page(1, tuple(words)),), "ocr")


def _lines(doc: Document) -> List[_Line]:
    out = []
    for page in doc.pages:
        current: List[Word] = []
        top = None
        for w in sorted(page.words, key=lambda w: (round(w.bbox[1], 1), w.bbox[0])):
            height = max(w.bbox[3] - w.bbox[1], 1.0)
            if top is not None and abs(w.bbox[1] - top) > max(2.0, 0.5 * height):
                out.append(_Line(page.number, current))
                current = []
            if not current:
                top = w.bbox[1]
            current.append(w)
        if current:
            out.append(_Line(page.number, current))
    for line in out:
        line.words.sort(key=lambda w: w.bbox[0])
        line.tokens = [normalise_token(w.text) for w in line.words]
    return out


def _find(tokens: Sequence[str], phrase: str) -> Optional[Tuple[int, int]]:
    want = [t for t in (normalise_token(p) for p in phrase.split()) if t]
    if not want:
        return None
    for i in range(len(tokens) - len(want) + 1):
        if list(tokens[i:i + len(want)]) == want:
            return i, i + len(want)
    return None


def _bbox(words: Sequence[Word]):
    if not words:
        return None
    return (min(w.bbox[0] for w in words), min(w.bbox[1] for w in words),
            max(w.bbox[2] for w in words), max(w.bbox[3] for w in words))


def _confidence(words: Sequence[Word], source: str) -> Optional[float]:
    measured = [w.confidence for w in words if w.confidence is not None]
    return min(measured) if source == "ocr" and measured else None


# --- detection ----------------------------------------------------------------------------------

def _matches(lines: List[_Line], profile: dict) -> bool:
    detect = profile.get("detect") or {}
    all_of, any_of = detect.get("all_of") or [], detect.get("any_of") or []
    if not all_of and not any_of:
        return False  # a profile without anchors (a seed awaiting a real bill) never matches by itself
    found = lambda phrase: any(_find(line.tokens, phrase) for line in lines)
    return all(found(p) for p in all_of) and (not any_of or any(found(p) for p in any_of))


def detect(doc: Document, profiles: Sequence[Tuple[str, dict]]) -> Tuple[str, List[str]]:
    """('MATCHED' | 'UNKNOWN_PROFILE' | 'AMBIGUOUS_PROFILE', matching ids). Never guesses between profile keys."""
    lines = _lines(doc)
    hits = [(pid, p) for pid, p in profiles if _matches(lines, p)]
    if not hits:
        return "UNKNOWN_PROFILE", []
    if len({p["profile_key"] for _, p in hits}) > 1:
        return "AMBIGUOUS_PROFILE", [pid for pid, _ in hits]
    return "MATCHED", [pid for pid, _ in hits]


# --- extraction ---------------------------------------------------------------------------------

def profile_parameters(profile: dict) -> Dict[str, bp.Parameter]:
    return {k: bp.parameter_from_dict(v) for k, v in profile["parameters"].items()}


def normalise(p: bp.Parameter, raw: str, unit: Optional[str] = None):
    """(value in the canonical unit, canonical unit) or raises BillParseError."""
    if p.dtype in bp.NUMERIC:
        value = parse_number(raw)
        if p.dtype == "integer" and value != value.to_integral_value():
            raise BillParseError(f"{p.key}: {raw!r} is not a whole number")
        return bp.convert(value, unit or p.canonical_unit, p.canonical_unit), p.canonical_unit
    if p.dtype == "date":
        return parse_date(raw), None
    if p.dtype == "enum":
        token = normalise_token(raw)
        for e in p.enum:
            if normalise_token(e) == token:
                return e, None
        raise BillParseError(f"{p.key}: {raw!r} is not one of {', '.join(p.enum)}")
    if p.dtype == "boolean":
        if normalise_token(raw) in ("true", "yes", "1"):
            return True, None
        if normalise_token(raw) in ("false", "no", "0"):
            return False, None
        raise BillParseError(f"{p.key}: {raw!r} is not true/false")
    return raw.strip(), None


def _unit_at(line: _Line, j: int, p: bp.Parameter) -> Optional[str]:
    if j >= len(line.words):
        return None
    token = line.words[j].text.strip(" .,:;")
    for u in p.allowed_units + ((p.canonical_unit,) if p.canonical_unit else ()):
        if token.casefold() == u.casefold():
            return u
    return None


def _take(line: _Line, after: int, p: bp.Parameter, take: str):
    """(raw text, value words, unit) after an anchor on this line, or None."""
    rest = line.words[after:]
    if not rest:
        return None
    if take == "rest":
        return " ".join(w.text for w in rest), list(rest), None
    if p.dtype == "date":
        for n in range(1, min(4, len(rest)) + 1):
            raw = " ".join(w.text for w in rest[:n])
            try:
                parse_date(raw)
                return raw, list(rest[:n]), None
            except BillParseError:
                continue
        return None
    if p.dtype in bp.NUMERIC:
        for j, w in enumerate(rest):
            try:
                parse_number(w.text)
            except BillParseError:
                continue
            return w.text, [w], _unit_at(line, after + j + 1, p)
        return None
    return rest[0].text, [rest[0]], None


class _Extraction:
    def __init__(self, doc: Document, profile: dict):
        self.doc, self.profile = doc, profile
        self.params, self.groups = profile_parameters(profile), profile["groups"]
        self.lines = _lines(doc)
        self.used = set()
        self.out: List[Extracted] = []

    def add(self, key, path, raw, words, unit, line, value=None):
        p = self.params[key]
        canonical = p.canonical_unit if p.dtype in bp.NUMERIC else None
        if value is None:
            try:
                value, canonical = normalise(p, raw, unit)
            except (BillParseError, ValueError, ArithmeticError):
                value = None  # kept with its evidence; the reviewer sees the unparsable raw text
        self.out.append(Extracted(key, path, line.text if line else "", value, canonical,
                                  line.page if line else None, _bbox(words), self.doc.source,
                                  _confidence(words, self.doc.source)))
        self.used.update(id(w) for w in words)

    def instances(self, group: str) -> List[Tuple[str, int, int]]:
        """(path, first line, last line) of every instance of a group, nested under its parent's instances."""
        if group == "bill":
            return [("", 0, len(self.lines) - 1)]
        out = []
        for ppath, start, end in self.instances(self.groups[group]):
            prefix = f"{ppath}/" if ppath else ""
            anchors = self.profile["sections"].get(group, {}).get("repeat_anchor") or []
            if not anchors:
                out.append((f"{prefix}{group}:1", start, end))
                continue
            starts = [i for i in range(start, end + 1) if any(_find(self.lines[i].tokens, a) for a in anchors)]
            for n, s in enumerate(starts, start=1):
                stop = starts[n] - 1 if n < len(starts) else end
                out.append((f"{prefix}{group}:{n}", s, stop))
        return out

    def fields(self):
        for f in self.profile["fields"]:
            p = self.params[f["key"]]
            for path, start, end in self.instances(p.group):
                self.field(f, p, path, start, end)

    def field(self, f, p, path, start, end):
        for hint in f["hints"]:
            for i in range(start, end + 1):
                line = self.lines[i]
                for anchor in hint["anchor"]:
                    hit = _find(line.tokens, anchor)
                    if hit is None:
                        continue
                    if hint["take"] == "flag":
                        self.add(p.key, path, "true", line.words[hit[0]:hit[1]], None, line, value=True)
                        return
                    target, after = line, hit[1]
                    if hint["direction"] == "below":
                        if i + 1 > end:
                            continue
                        target, after = self.lines[i + 1], 0
                    got = _take(target, after, p, hint["take"])
                    if got:
                        raw, words, unit = got
                        self.add(p.key, path, raw, words, unit or f.get("unit"), target)
                        return
        if p.dtype == "boolean":  # a flag that is not printed is false; there is nothing to point at
            self.out.append(Extracted(p.key, path, "", False, None, None, None, self.doc.source))

    def tables(self):
        for t in self.profile["tables"]:
            for ppath, start, end in self.instances(self.groups[t["group"]]):
                self.table(t, ppath, start, end)

    def table(self, t, ppath, start, end):
        header = next((i for i in range(start, end + 1)
                       if all(_find(self.lines[i].tokens, h) for h in t["header"])), None)
        if header is None:
            return
        label_key, n = t["label"]["key"], 0
        for i in range(header + 1, end + 1):
            line = self.lines[i]
            if any(_find(line.tokens, e) for e in t["end"]):
                return
            band = None
            for value, names in t["label"]["values"].items():
                for name in names:
                    hit = _find(line.tokens, name)
                    if hit and hit[0] == 0:
                        band = (value, hit[1])
            if band is None:
                return
            n += 1
            path = f"{ppath}/{t['group']}:{n}" if ppath else f"{t['group']}:{n}"
            self.add(label_key, path, band[0], line.words[:band[1]], None, line, value=band[0])
            numbers = []
            for j in range(band[1], len(line.words)):
                try:
                    parse_number(line.words[j].text)
                    numbers.append(j)
                except BillParseError:
                    continue
            for key, j in zip(t["columns"], numbers):
                self.add(key, path, line.words[j].text, [line.words[j]], _unit_at(line, j + 1, self.params[key]), line)
            for key, markers in t["flags"].items():
                hit = next((h for h in (_find(line.tokens, m) for m in markers) if h), None)
                words = line.words[hit[0]:hit[1]] if hit else []
                self.out.append(Extracted(key, path, line.text, bool(hit), None, line.page, _bbox(words), self.doc.source))
                self.used.update(id(w) for w in words)

    def unmapped(self):
        """Every number not taken by a field stays as a candidate, with its line as evidence. Never dropped."""
        for line in self.lines:
            for w in line.words:
                if id(w) in self.used:
                    continue
                try:
                    value = parse_number(w.text)
                except BillParseError:
                    continue
                self.out.append(Extracted(None, "", line.text, value, None, line.page, w.bbox, self.doc.source,
                                          _confidence([w], self.doc.source), status="unmapped"))


def extract(doc: Document, profile: dict) -> List[Extracted]:
    run = _Extraction(doc, profile)
    run.tables()
    run.fields()
    run.unmapped()
    return run.out


# --- derived values and rules -----------------------------------------------------------------

def group_of(path: str) -> str:
    return path.rsplit("/", 1)[-1].split(":")[0] if path else "bill"


def ancestors(path: str) -> List[str]:
    out, parts = [path], path.split("/") if path else []
    while parts:
        parts = parts[:-1]
        out.append("/".join(parts))
    return out


def _depth(group: str, groups) -> int:
    d = 0
    while groups.get(group) is not None:
        group, d = groups[group], d + 1
    return d


class Values:
    """Values by group instance, scoped as bill_rules expects: ancestors give scalars, descendants give lists."""

    def __init__(self, rows: Sequence[Extracted], params: Dict[str, bp.Parameter], groups):
        self.params, self.groups = params, groups
        self.inst: Dict[str, Dict[str, object]] = {"": {}}
        for r in rows:
            if r.key is None or r.key not in params:
                continue
            for anc in ancestors(r.group_index):
                self.inst.setdefault(anc, {})
            if r.value is not None:
                self.inst[r.group_index].setdefault(r.key, r.value)

    def of_group(self, group: str) -> List[str]:
        return sorted(p for p in self.inst if group_of(p) == group)

    def _below(self, group, scope_group) -> bool:
        g = self.groups.get(group)
        while g is not None:
            if g == scope_group:
                return True
            g = self.groups.get(g)
        return False

    def lookup(self, path: str):
        chain = ancestors(path)
        prefix = f"{path}/" if path else ""

        def lookup(key):
            group = self.params[key].group
            for anc in chain:
                if group_of(anc) == group:
                    if key not in self.inst.get(anc, {}):
                        raise bill_rules.Missing(f"No value for '{key}'")
                    return self.inst[anc][key]
            if not self._below(group, group_of(path)):
                raise bill_rules.Missing(f"'{key}' is not in scope here")
            return [self.inst[p][key] for p in sorted(self.inst)
                    if p.startswith(prefix) and group_of(p) == group and key in self.inst[p]]
        return lookup


def _finding(code, blocking, path, detail, rule) -> dict:
    return {"code": code, "blocking": bool(blocking), "group_index": path, "detail": detail, "rule": rule}


def evaluate_bill(rows: Sequence[Extracted], profile: dict) -> Tuple[List[Extracted], List[dict]]:
    """Derived values and findings for one bill's current values (the caller leaves out rejected and unmapped
    rows). Findings are {code, blocking, group_index, detail, rule}, deepest scope first."""
    params, groups = profile_parameters(profile), profile["groups"]
    values = Values(rows, params, groups)
    derived_rows, findings = [], []

    for d in profile["derived"]:
        expr = bill_rules.compile_expression(d["expr"], params)
        for path in values.of_group(d["scope"]):
            try:
                v = bill_rules.evaluate(expr, values.lookup(path))
            except bill_rules.Missing:
                continue
            except bill_rules.EvalError as e:
                findings.append(_finding("DERIVED_VALUE_ERROR", True, path, f"{d['key']}: {e}", d["key"]))
                continue
            values.inst[path][d["key"]] = v
            derived_rows.append(Extracted(d["key"], path, f"= {d['expr']}", v, params[d["key"]].canonical_unit,
                                          None, None, "derived", status="derived"))

    present = {(p, k) for p, kv in values.inst.items() for k in kv}
    for f in profile["fields"]:
        p = params[f["key"]]
        if f["required"] and not any((path, p.key) in present for path in values.of_group(p.group)):
            findings.append(_finding("REQUIRED_PARAMETER_MISSING", True, "", f"{p.key} ({p.labels['en']}) not found", p.key))
    for t in profile["tables"]:
        if t["required"] and not values.of_group(t["group"]):
            findings.append(_finding("REQUIRED_PARAMETER_MISSING", True, "", f"no {t['group']} rows found", t["group"]))

    for scope in sorted({r["scope"] for r in profile["rules"]}, key=lambda g: -_depth(g, groups)):
        compiled = [(r, bill_rules.compile_expression(r["when"], params) if r["when"] else None,
                     bill_rules.compile_expression(r["expect"], params) if r["expect"] else None)
                    for r in profile["rules"] if r["scope"] == scope]
        for path in values.of_group(scope):
            lookup = values.lookup(path)
            for rule, when, expect in compiled:
                try:
                    if when is not None and not bill_rules.evaluate(when, lookup):
                        continue
                    if expect is not None and bill_rules.evaluate(expect, lookup):
                        continue
                except bill_rules.Missing:
                    continue  # the rule does not apply: a value it reads is absent
                except bill_rules.EvalError as e:
                    findings.append(_finding("RULE_ERROR", True, path, f"{rule['code']}: {e}", rule["code"]))
                    continue
                detail = bill_rules.render(rule["message"], lookup) if rule["message"] else (rule["expect"] or rule["when"])
                findings.append(_finding(rule["code"], rule["blocking"], path, detail, rule["code"]))
    return derived_rows, findings


def rules_profile(rulesets: Sequence[str], directory=bp.PROFILE_DIR) -> dict:
    """A field-less profile made of repository rule sets, for values that did not come from a layout."""
    params, groups, sets = bp.repo_catalog(directory)
    doc = {"schema": bp.SCHEMA_PROFILE, "profile_key": "repo-rules", "issuer": "repository rule sets",
           "document_type": "electricity_ht", "layout_version": "n/a", "languages": ["en"],
           "effective_from": "2000-01-01", "rulesets": list(rulesets)}
    return bp.validate_profile(doc, params, groups, sets)


def period_findings(bills: Sequence[Tuple[tuple, dt.date, dt.date]]) -> List[dict]:
    """Bills for one account and meter must not overlap; gaps are reported. Input: (identity, start, end)."""
    findings = []
    for identity in sorted({b[0] for b in bills}, key=str):
        series = sorted((b for b in bills if b[0] == identity), key=lambda b: b[1])
        for prev, nxt in zip(series, series[1:]):
            if nxt[1] <= prev[2]:
                findings.append(_finding("PERIOD_OVERLAP", True, "", f"{identity}: {prev[1]}..{prev[2]} overlaps "
                                                                     f"{nxt[1]}..{nxt[2]}", "PERIOD_OVERLAP"))
            elif (nxt[1] - prev[2]).days > 1:
                findings.append(_finding("PERIOD_GAP", False, "", f"{identity}: no bill {prev[2]}..{nxt[1]}",
                                         "PERIOD_GAP"))
    return findings


def with_value(row: Extracted, value, unit=None) -> Extracted:
    return replace(row, value=value, unit=unit if unit is not None else row.unit)
