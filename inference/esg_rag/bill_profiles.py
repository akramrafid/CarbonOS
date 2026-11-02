"""
Bill profiles as versioned data: parameter definitions (one per field), rule sets and issuer / layout profiles.

Three YAML document types, all validated here before anything is stored or used:

* carbonos.bill_parameters/1: groups (bill > meter > register, ...) and parameter definitions with a stable key,
  English/Bengali labels and aliases, data type, dimension and canonical unit (pint), allowed input units, role,
  group, and an optional ledger mapping (consumption parameters only).
* carbonos.bill_rulesets/1: named sets of derived values and validation rules (bill_rules expressions).
* carbonos.bill_profile/1: one issuer, document type and layout version: detection anchors, sections, fields
  with extraction hints, tables, referenced rule sets plus its own rules.

A stored profile version is self-contained: validate_profile() expands its rule sets and snapshots the parameter
definitions it uses, and content_sha256() identifies it. Adding a utility, a layout or a field is a data change.
Aliases and anchors are taken from real bills only; seed profiles ship without them and stay DRAFT.
"""
import datetime as dt
import hashlib
import json
import re
from dataclasses import dataclass
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

from . import accounting, bill_rules

PROFILE_DIR = Path(__file__).with_name("bill_profiles")
SCHEMA_PARAMETERS = "carbonos.bill_parameters/1"
SCHEMA_RULESETS = "carbonos.bill_rulesets/1"
SCHEMA_PROFILE = "carbonos.bill_profile/1"

ROLES = ("identifier", "period", "meter_read", "multiplier", "consumption", "demand", "power_quality", "tariff",
         "cost", "quality_flag")
DTYPES = ("decimal", "integer", "date", "text", "enum", "boolean")
NUMERIC = ("decimal", "integer")
DOCUMENT_TYPES = ("electricity_ht", "electricity_lt", "gas", "fuel_challan", "refrigerant_invoice", "generator_log")
LANGUAGES = ("en", "bn")
TAKES = ("value", "rest", "flag")
MAX_YAML_BYTES = 200_000
# Nodes after alias expansion (a shared node counts every time it is reached): a few hundred bytes of nested aliases
# can otherwise expand to millions of nodes when the document is walked or turned into text.
MAX_YAML_NODES = 100_000
MAX_ITEMS = 200

KEY = re.compile(r"^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$")
NAME = re.compile(r"^[a-z][a-z0-9_]{0,39}$")
CODE = re.compile(r"^[A-Z][A-Z0-9_]{2,59}$")
PROFILE_KEY = re.compile(r"^[a-z0-9][a-z0-9._-]{2,79}$")
# Bill spellings → pint expressions. Sm3 is a volume at stated reference conditions (see the heating value).
UNIT_SPELLINGS = {"m3": "m**3", "Sm3": "m**3", "ft3": "ft**3", "%": "percent", "": "dimensionless"}


class ProfileError(ValueError):
    pass


def _fail(where: str, msg: str):
    raise ProfileError(f"{where}: {msg}")


# --- units -------------------------------------------------------------------------------------

@lru_cache(maxsize=1)
def units():
    import pint
    ureg = pint.UnitRegistry(non_int_type=Decimal)
    ureg.define("var = [reactive_power] = VAr")  # its own dimension: kvarh can never pass as kWh
    ureg.define("varh = var * hour = VArh")
    ureg.define("BDT = [currency] = Tk = taka")
    return ureg


def _pint(unit: str) -> str:
    return UNIT_SPELLINGS.get(unit, unit)


def unit_dimension_ok(unit: str, dimension: str) -> bool:
    ureg = units()
    try:
        q = ureg.Quantity(Decimal(1), _pint(unit))
        if dimension == "dimensionless":
            return q.dimensionless
        return q.dimensionality == ureg.get_dimensionality(dimension)
    except Exception:  # pint raises several unrelated types for bad input
        return False


def convert(value: Decimal, from_unit: str, to_unit: str) -> Decimal:
    if from_unit == to_unit:
        return value
    q = units().Quantity(Decimal(value), _pint(from_unit)).to(_pint(to_unit))
    return Decimal(str(q.magnitude))


# --- parameter definitions ---------------------------------------------------------------------

@dataclass(frozen=True)
class Parameter:
    key: str
    dtype: str
    role: str
    group: str
    labels: Dict[str, str]
    aliases: Dict[str, Tuple[str, ...]]
    dimension: Optional[str] = None
    canonical_unit: Optional[str] = None
    allowed_units: Tuple[str, ...] = ()
    enum: Tuple[str, ...] = ()
    ledger: Optional[Dict[str, str]] = None
    derived: bool = False
    description: str = ""

    def as_dict(self) -> dict:
        return {"key": self.key, "dtype": self.dtype, "role": self.role, "group": self.group, "labels": self.labels,
                "aliases": {k: list(v) for k, v in self.aliases.items()}, "dimension": self.dimension,
                "canonical_unit": self.canonical_unit, "allowed_units": list(self.allowed_units),
                "enum": list(self.enum), "ledger": self.ledger, "derived": self.derived,
                "description": self.description}


def _strings(value, where, limit=100) -> Tuple[str, ...]:
    if value is None:
        return ()
    if not isinstance(value, list) or len(value) > limit or not all(isinstance(v, str) and 0 < len(v) <= 100 for v in value):
        _fail(where, f"must be a list of up to {limit} short strings")
    return tuple(value)


def parse_parameter(raw: dict, groups: Dict[str, Optional[str]]) -> Parameter:
    if not isinstance(raw, dict):
        _fail("parameter", "must be a mapping")
    key = raw.get("key")
    where = f"parameter {key!r}"
    if not isinstance(key, str) or not KEY.match(key):
        _fail(where, "key must be dotted lower-case, e.g. energy.kwh.register")
    dtype, role, group = raw.get("dtype"), raw.get("role"), raw.get("group", "bill")
    if dtype not in DTYPES:
        _fail(where, f"dtype must be one of {', '.join(DTYPES)}")
    if role not in ROLES:
        _fail(where, f"role must be one of {', '.join(ROLES)}")
    if group not in groups:
        _fail(where, f"unknown group '{group}'")
    labels = raw.get("labels") or {}
    if not isinstance(labels, dict) or not isinstance(labels.get("en"), str) or set(labels) - set(LANGUAGES):
        _fail(where, "labels need an English label ('en') and may add 'bn'")
    aliases_raw = raw.get("aliases") or {}
    if not isinstance(aliases_raw, dict) or set(aliases_raw) - set(LANGUAGES):
        _fail(where, "aliases are keyed by language (en, bn)")
    aliases = {lang: _strings(aliases_raw.get(lang), f"{where} aliases.{lang}") for lang in LANGUAGES}
    dimension, canonical = raw.get("dimension"), raw.get("canonical_unit")
    allowed = _strings(raw.get("allowed_units"), f"{where} allowed_units", 20)
    if dtype in NUMERIC:
        if not isinstance(dimension, str) or not isinstance(canonical, str):
            _fail(where, "numeric parameters need a dimension and a canonical_unit")
        for unit in (canonical,) + allowed:
            if not unit_dimension_ok(unit, dimension):
                _fail(where, f"unit '{unit}' does not have dimension {dimension}")
    elif dimension or canonical or allowed:
        _fail(where, "only numeric parameters have units")
    enum = _strings(raw.get("enum"), f"{where} enum", 30)
    if (dtype == "enum") != bool(enum):
        _fail(where, "enum parameters (and only they) list their values")
    ledger = raw.get("ledger")
    if ledger is not None:
        if role != "consumption":
            _fail(where, "only consumption parameters map to the GHG ledger")
        if not isinstance(ledger, dict) or set(ledger) - {"activity_type", "unit", "meter_ref_from", "generator_ref_from"}:
            _fail(where, "ledger takes activity_type, unit, meter_ref_from, generator_ref_from")
        at = ledger.get("activity_type")
        if at not in accounting.ACTIVITY_TYPES and at not in accounting.MEMO_ACTIVITY_TYPES:
            _fail(where, f"unknown ledger activity type '{at}'")
        unit = ledger.get("unit")
        if unit != accounting.canonical_unit(at) or not unit_dimension_ok(unit, dimension or "dimensionless"):
            _fail(where, f"ledger unit must be {accounting.canonical_unit(at)} and match the parameter's dimension")
    description = raw.get("description", "")
    if not isinstance(description, str):
        _fail(where, "description must be text")
    return Parameter(key=key, dtype=dtype, role=role, group=group, labels=dict(labels), aliases=aliases,
                     dimension=dimension, canonical_unit=canonical, allowed_units=allowed, enum=enum,
                     ledger=dict(ledger) if ledger else None, derived=bool(raw.get("derived", False)),
                     description=description[:500])


def parse_groups(raw) -> Dict[str, Optional[str]]:
    """{group: parent}; 'bill' is the root. Depth is limited so scopes stay simple."""
    groups: Dict[str, Optional[str]] = {"bill": None}
    for name, parent in (raw or {}).items():
        if name == "bill":
            continue
        if not isinstance(name, str) or not NAME.match(name) or not isinstance(parent, str):
            _fail("groups", f"bad group {name!r}")
        groups[name] = parent
    for name in groups:
        seen, node = set(), name
        while node is not None:
            if node in seen or node not in groups or len(seen) > 4:
                _fail("groups", f"group '{name}' has an unknown, cyclic or too deep parent chain")
            seen.add(node)
            node = groups[node]
    return groups


def parse_parameters(doc: dict) -> Tuple[Dict[str, Parameter], Dict[str, Optional[str]]]:
    if not isinstance(doc, dict) or doc.get("schema") != SCHEMA_PARAMETERS:
        _fail("parameters", f"schema must be {SCHEMA_PARAMETERS}")
    groups = parse_groups(doc.get("groups"))
    items = doc.get("parameters") or []
    if not isinstance(items, list) or len(items) > MAX_ITEMS:
        _fail("parameters", f"must be a list of up to {MAX_ITEMS}")
    params: Dict[str, Parameter] = {}
    for raw in items:
        p = parse_parameter(raw, groups)
        if p.key in params:
            _fail("parameters", f"duplicate key {p.key}")
        params[p.key] = p
    return params, groups


def parameter_from_dict(d: dict) -> Parameter:
    return Parameter(**{**d, "aliases": {k: tuple(v) for k, v in d["aliases"].items()},
                        "allowed_units": tuple(d["allowed_units"]), "enum": tuple(d["enum"])})


# --- rules ------------------------------------------------------------------------------------

def _check_rule(raw, params, groups, where) -> dict:
    if not isinstance(raw, dict):
        _fail(where, "a rule must be a mapping")
    code, scope = raw.get("code"), raw.get("scope", "bill")
    if not isinstance(code, str) or not CODE.match(code):
        _fail(where, "code must be UPPER_SNAKE_CASE")
    if scope not in groups:
        _fail(where, f"unknown scope '{scope}'")
    if raw.get("when") is None and raw.get("expect") is None:
        _fail(where, f"{code} needs 'when', 'expect' or both")
    for part in ("when", "expect"):
        if raw.get(part) is not None:
            try:
                bill_rules.compile_expression(raw[part], params)
            except bill_rules.RuleError as e:
                _fail(where, f"{code}.{part}: {e}")
    message = raw.get("message", "")
    if not isinstance(message, str) or len(message) > 300:
        _fail(where, f"{code}.message must be text up to 300 characters")
    unknown = sorted(set(bill_rules.placeholders(message)) - set(params))
    if unknown:
        _fail(where, f"{code}.message names unknown parameter(s): {', '.join(unknown)}")
    return {"code": code, "scope": scope, "when": raw.get("when"), "expect": raw.get("expect"),
            "blocking": bool(raw.get("blocking", True)), "message": message}


def _check_derived(raw, params, groups, where) -> dict:
    key, scope = (raw or {}).get("key"), (raw or {}).get("scope", "bill")
    if key not in params or not params[key].derived:
        _fail(where, f"derived key {key!r} must be a parameter declared derived: true")
    if scope not in groups or params[key].group != scope:
        _fail(where, f"derived {key} must be computed at its own group ('{params[key].group}')")
    try:
        bill_rules.compile_expression(raw.get("expr"), params)
    except bill_rules.RuleError as e:
        _fail(where, f"{key}: {e}")
    return {"key": key, "scope": scope, "expr": raw["expr"]}


def parse_rulesets(doc: dict, params, groups) -> Dict[str, dict]:
    if not isinstance(doc, dict) or doc.get("schema") != SCHEMA_RULESETS:
        _fail("rulesets", f"schema must be {SCHEMA_RULESETS}")
    out = {}
    for name, body in (doc.get("rulesets") or {}).items():
        if not NAME.match(str(name)) or not isinstance(body, dict):
            _fail("rulesets", f"bad rule set {name!r}")
        out[name] = {"derived": [_check_derived(d, params, groups, f"ruleset {name}") for d in body.get("derived") or []],
                     "rules": [_check_rule(r, params, groups, f"ruleset {name}") for r in body.get("rules") or []]}
    return out


# --- profiles ----------------------------------------------------------------------------------

def _date(value, where) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, dt.date):
        return value.isoformat()
    try:
        return dt.date.fromisoformat(str(value)).isoformat()
    except ValueError:
        _fail(where, f"not an ISO date: {value!r}")


def _hint(raw, param: "Parameter", where) -> dict:
    if not isinstance(raw, dict) or set(raw) - {"anchor", "take", "direction"}:
        _fail(where, "a hint takes anchor, take, direction")
    take = raw.get("take", "flag" if param.dtype == "boolean" else ("rest" if param.dtype == "text" else "value"))
    if take not in TAKES or (take == "flag") != (param.dtype == "boolean"):
        _fail(where, f"take must be one of {', '.join(TAKES)}; 'flag' is for boolean parameters")
    if raw.get("direction", "right") not in ("right", "below"):
        _fail(where, "direction is right or below")
    return {"anchor": list(_strings(raw.get("anchor"), f"{where} anchor", 20)), "take": take,
            "direction": raw.get("direction", "right")}


def validate_profile(doc: dict, params: Dict[str, Parameter], groups, rulesets: Dict[str, dict]) -> dict:
    """Check a profile document and return its self-contained stored form (rule sets expanded, parameters
    snapshotted). Raises ProfileError."""
    if not isinstance(doc, dict) or doc.get("schema") != SCHEMA_PROFILE:
        _fail("profile", f"schema must be {SCHEMA_PROFILE}")
    key = doc.get("profile_key")
    where = f"profile {key!r}"
    if not isinstance(key, str) or not PROFILE_KEY.match(key):
        _fail(where, "profile_key must be lower-case letters, digits, '.', '_' or '-'")
    if doc.get("document_type") not in DOCUMENT_TYPES:
        _fail(where, f"document_type must be one of {', '.join(DOCUMENT_TYPES)}")
    for f in ("issuer", "layout_version"):
        if not isinstance(doc.get(f), str) or not 0 < len(doc[f]) <= 100:
            _fail(where, f"{f} is required text")
    languages = list(_strings(doc.get("languages"), f"{where} languages", 2))
    if not languages or set(languages) - set(LANGUAGES):
        _fail(where, "languages must list en and/or bn")
    start, end = _date(doc.get("effective_from"), where), _date(doc.get("effective_to"), where)
    if start is None or (end is not None and end < start):
        _fail(where, "effective_from is required and must not be after effective_to")
    detect = doc.get("detect") or {}
    if not isinstance(detect, dict) or set(detect) - {"all_of", "any_of"}:
        _fail(where, "detect takes all_of and any_of anchor lists")
    detect = {k: list(_strings(detect.get(k), f"{where} detect.{k}", 20)) for k in ("all_of", "any_of")}

    sections = {}
    for name, body in (doc.get("sections") or {}).items():
        if name not in groups or name == "bill" or not isinstance(body, dict):
            _fail(where, f"section '{name}' must be a non-root group with repeat_anchor")
        sections[name] = {"repeat_anchor": list(_strings(body.get("repeat_anchor"), f"{where} sections.{name}", 20))}

    used: Dict[str, Parameter] = {}

    def use(k, ctx, extractable=True):
        if k not in params:
            _fail(where, f"{ctx}: unknown parameter '{k}'")
        if extractable and params[k].derived:
            _fail(where, f"{ctx}: '{k}' is derived; it is computed, not extracted")
        used[k] = params[k]
        return params[k]

    fields = []
    for i, raw in enumerate(doc.get("fields") or []):
        if not isinstance(raw, dict) or set(raw) - {"key", "required", "unit", "hints"}:
            _fail(where, f"field {i} takes key, required, unit, hints")
        p = use(raw.get("key"), f"field {i}")
        unit = raw.get("unit")
        if unit is not None and (p.dtype not in NUMERIC or not unit_dimension_ok(unit, p.dimension)):
            _fail(where, f"field {p.key}: unit '{unit}' does not fit {p.dimension}")
        hints = [_hint(h, p, f"{where} field {p.key}") for h in raw.get("hints") or []]
        fields.append({"key": p.key, "required": bool(raw.get("required", False)), "unit": unit, "hints": hints})

    tables = []
    for i, raw in enumerate(doc.get("tables") or []):
        if not isinstance(raw, dict) or raw.get("group") not in groups or raw.get("group") == "bill":
            _fail(where, f"table {i} needs a non-root group")
        label = raw.get("label") or {}
        label_param = use(label.get("key"), f"table {i} label")
        if label_param.dtype != "enum" or label_param.group != raw["group"]:
            _fail(where, f"table {i}: the label must be an enum parameter of group {raw['group']}")
        values = label.get("values") or {}
        if not isinstance(values, dict) or set(values) - set(label_param.enum):
            _fail(where, f"table {i}: label values must be among {', '.join(label_param.enum)}")
        columns = [use(c, f"table {i} column").key for c in _strings(raw.get("columns"), f"{where} table {i} columns", 12)]
        flags = {use(k, f"table {i} flag").key: list(_strings(v, f"{where} table {i} flag {k}", 10))
                 for k, v in (raw.get("flags") or {}).items()}
        if any(params[k].dtype != "boolean" for k in flags):
            _fail(where, f"table {i}: flags must be boolean parameters")
        tables.append({"group": raw["group"], "header": list(_strings(raw.get("header"), f"{where} table {i} header", 12)),
                       "label": {"key": label_param.key, "values": {k: list(_strings(v, f"{where} label {k}", 10))
                                                                     for k, v in values.items()}},
                       "columns": columns, "flags": flags, "required": bool(raw.get("required", False)),
                       "end": list(_strings(raw.get("end"), f"{where} table {i} end", 10))})

    rules, derived = [], []
    for name in _strings(doc.get("rulesets"), f"{where} rulesets", 20):
        if name not in rulesets:
            _fail(where, f"unknown rule set '{name}'")
        rules += rulesets[name]["rules"]
        derived += rulesets[name]["derived"]
    rules += [_check_rule(r, params, groups, where) for r in doc.get("rules") or []]
    derived += [_check_derived(d, params, groups, where) for d in doc.get("derived") or []]
    for item in rules + derived:  # every key a rule reads is part of the snapshot
        for part in ("when", "expect", "expr"):
            if item.get(part):
                for k in bill_rules.compile_expression(item[part], params).keys:
                    use(k, "rule", extractable=False)
    for d in derived:
        use(d["key"], "derived", extractable=False)
    if len(fields) + len(tables) > MAX_ITEMS or len(rules) > MAX_ITEMS:
        _fail(where, "too many fields or rules")
    groups_used = {}
    for p in used.values():  # the snapshot carries the ancestor chain of every group it uses
        g = p.group
        while g is not None:
            groups_used[g] = groups[g]
            g = groups[g]
    return {"schema": SCHEMA_PROFILE, "profile_key": key, "issuer": doc["issuer"], "document_type": doc["document_type"],
            "layout_version": doc["layout_version"], "languages": languages, "effective_from": start,
            "effective_to": end, "detect": detect, "sections": sections, "fields": fields, "tables": tables,
            "rules": rules, "derived": derived, "groups": groups_used,
            "parameters": {k: used[k].as_dict() for k in sorted(used)},
            "notes": _text_field(doc.get("notes", ""), where, "notes")[:2000]}


def _text_field(value, where, name) -> str:
    if not isinstance(value, str):
        _fail(where, f"{name} must be text")
    return value


def canonical_json(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


def content_sha256(obj) -> str:
    return hashlib.sha256(canonical_json(obj).encode()).hexdigest()


# --- YAML --------------------------------------------------------------------------------------

def load_yaml(text: str) -> dict:
    """Safe YAML (no tags, no objects), size-limited, must be a mapping."""
    if len(text.encode()) > MAX_YAML_BYTES:
        raise ProfileError(f"YAML larger than {MAX_YAML_BYTES} bytes")
    try:
        doc = yaml.safe_load(text)
    except yaml.YAMLError as e:
        raise ProfileError(f"Not valid YAML: {e}") from None
    except RecursionError:
        raise ProfileError("YAML is nested too deeply") from None
    if not isinstance(doc, dict):
        raise ProfileError("YAML document must be a mapping")
    if not _within_node_limit(doc, MAX_YAML_NODES):
        raise ProfileError(f"YAML expands to more than {MAX_YAML_NODES} nodes (check its aliases)")
    return doc


def _within_node_limit(doc, limit: int) -> bool:
    """True if the document, aliases expanded, has at most `limit` nodes. Iterative, and stops once over the limit."""
    stack, seen = [doc], 0
    while stack:
        node = stack.pop()
        seen += 1
        if seen > limit:
            return False
        if isinstance(node, dict):
            stack.extend(node.keys())
            stack.extend(node.values())
        elif isinstance(node, list):
            stack.extend(node)
    return True


def profile_documents(doc: dict) -> List[dict]:
    """A file holds one profile, or `profiles: [...]` so several can share YAML anchors."""
    if "profiles" in doc and isinstance(doc["profiles"], list):
        return [{"schema": doc.get("schema", SCHEMA_PROFILE), **p} for p in doc["profiles"]]
    return [doc]


def repo_catalog(directory: Path = PROFILE_DIR):
    params, groups = parse_parameters(load_yaml((directory / "parameters.yaml").read_text(encoding="utf-8")))
    rulesets = parse_rulesets(load_yaml((directory / "rulesets.yaml").read_text(encoding="utf-8")), params, groups)
    return params, groups, rulesets


def repo_profiles(directory: Path = PROFILE_DIR) -> List[dict]:
    params, groups, rulesets = repo_catalog(directory)
    out = []
    for path in sorted((directory / "seed").glob("*.yaml")):
        for doc in profile_documents(load_yaml(path.read_text(encoding="utf-8"))):
            out.append(validate_profile(doc, params, groups, rulesets))
    return out
