"""
Declarative bill rules: a whitelisted expression language over parameter keys.

Profiles are data, so their expressions are untrusted. They are parsed with ast.parse(mode="eval") and walked by
this module; nothing is ever passed to eval/exec/compile-to-bytecode. Allowed: numbers, strings, True/False,
parameter keys (dotted names such as meter.read.current resolve to values, never to Python attributes),
+ - * / **, comparisons, and/or/not, `a if c else b`, and the functions abs, min, max, sum, round, sqrt, count,
present. Everything else (attribute access on anything but a key, subscripts, lambdas, comprehensions,
keyword arguments, other calls, f-strings, names starting with "_") is rejected when the rule is compiled.

Scoping: a key at the evaluation scope or an ancestor scope is a scalar; a key below it (e.g. a register value
read at meter or bill scope) is the list of its instances, usable only inside sum/min/max/count/present.
Arithmetic is Decimal with a fixed context, so results are deterministic.
"""
import ast
import datetime as dt
import math
import re
from dataclasses import dataclass
from decimal import Context, Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
from typing import Callable, Dict, FrozenSet, Iterable, List, Optional, Union

MAX_LENGTH = 1000
MAX_NODES = 300
MAX_DEPTH = 40
MAX_EXPONENT = 12
DECIMAL_CONTEXT = Context(prec=34, rounding=ROUND_HALF_UP, Emax=999, Emin=-999)

SCALAR_FUNCS = ("abs", "round", "sqrt")
AGGREGATES = ("sum", "min", "max", "count")
FUNCS = frozenset(SCALAR_FUNCS + AGGREGATES + ("present",))
_BIN = (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow)
_CMP = (ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Eq, ast.NotEq)

Value = Union[Decimal, dt.date, str, bool, None]


class RuleError(ValueError):
    """The expression is not allowed (raised at compile time)."""


class EvalError(ValueError):
    """The expression could not be evaluated on these values (type mismatch, division by zero, ...)."""


class Missing(EvalError):
    """A key the expression needs has no value: the rule does not apply to this bill or group."""


@dataclass(frozen=True)
class Expression:
    source: str
    tree: ast.AST
    keys: FrozenSet[str]


def _key_of(node) -> Optional[str]:
    """Dotted parameter key for Name / Attribute chains rooted at a Name, else None."""
    parts = []
    while isinstance(node, ast.Attribute):
        parts.append(node.attr)
        node = node.value
    if not isinstance(node, ast.Name):
        return None
    parts.append(node.id)
    key = ".".join(reversed(parts))
    if any(p.startswith("_") for p in key.split(".")):
        raise RuleError(f"Key '{key}' is not allowed: no part may start with '_'")
    return key


def compile_expression(source: str, known_keys: Iterable[str]) -> Expression:
    """Parse and check an expression; every key it reads must be in known_keys."""
    if not isinstance(source, str) or not source.strip():
        raise RuleError("Expression must be a non-empty string")
    if len(source) > MAX_LENGTH:
        raise RuleError(f"Expression longer than {MAX_LENGTH} characters")
    try:
        tree = ast.parse(source.strip(), mode="eval")
    except SyntaxError as e:
        raise RuleError(f"Not a valid expression: {e.msg}") from None
    known, keys = set(known_keys), set()
    count = 0

    def check(node, depth):
        nonlocal count
        count += 1
        if count > MAX_NODES or depth > MAX_DEPTH:
            raise RuleError("Expression is too large or too deeply nested")
        if isinstance(node, ast.Expression):
            return check(node.body, depth + 1)
        if isinstance(node, (ast.Name, ast.Attribute)):
            key = _key_of(node)
            if key is None:
                raise RuleError("Attribute access is not allowed")
            if key in ("True", "False"):
                return
            if key not in known:
                raise RuleError(f"Unknown parameter key '{key}'")
            keys.add(key)
            return
        if isinstance(node, ast.Constant):
            if isinstance(node.value, bool) or node.value is None:
                return
            if isinstance(node.value, (int, float, str)):
                if isinstance(node.value, float) and not math.isfinite(node.value):
                    raise RuleError("Numbers must be finite")
                if isinstance(node.value, str) and len(node.value) > 100:
                    raise RuleError("String constants are limited to 100 characters")
                return
            raise RuleError(f"Constant of type {type(node.value).__name__} is not allowed")
        if isinstance(node, ast.BinOp) and isinstance(node.op, _BIN):
            check(node.left, depth + 1)
            return check(node.right, depth + 1)
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd, ast.Not)):
            return check(node.operand, depth + 1)
        if isinstance(node, ast.BoolOp) and isinstance(node.op, (ast.And, ast.Or)):
            for v in node.values:
                check(v, depth + 1)
            return
        if isinstance(node, ast.Compare) and all(isinstance(op, _CMP) for op in node.ops):
            check(node.left, depth + 1)
            for c in node.comparators:
                check(c, depth + 1)
            return
        if isinstance(node, ast.IfExp):
            for part in (node.test, node.body, node.orelse):
                check(part, depth + 1)
            return
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in FUNCS:
                raise RuleError("Only abs, min, max, sum, round, sqrt, count and present may be called")
            if node.keywords or any(isinstance(a, ast.Starred) for a in node.args):
                raise RuleError("Keyword and starred arguments are not allowed")
            if node.func.id == "present" and (len(node.args) != 1 or _key_of(node.args[0]) is None):
                raise RuleError("present() takes exactly one parameter key")
            if not node.args or len(node.args) > 10:
                raise RuleError(f"{node.func.id}() takes 1 to 10 arguments")
            for a in node.args:
                check(a, depth + 1)
            return
        raise RuleError(f"'{type(node).__name__}' is not allowed in a rule")

    check(tree, 0)
    return Expression(source.strip(), tree, frozenset(keys))


# --- evaluation ---------------------------------------------------------------------------------

Lookup = Callable[[str], object]  # key -> scalar Value, list of Values, or raises Missing


def evaluate(expr: Expression, lookup: Lookup) -> Value:
    """Evaluate a compiled expression. Raises Missing when a needed key has no value and EvalError for anything else:
    rules and values come from data, so no other exception ever leaves here."""
    with localcontext(DECIMAL_CONTEXT):
        try:
            value = _eval(expr.tree.body, lookup)
        except EvalError:
            raise
        except (InvalidOperation, ArithmeticError) as e:  # Decimal overflow, division by zero, ...
            raise EvalError(f"Arithmetic error in '{expr.source}': {type(e).__name__}") from None
        except (TypeError, ValueError, KeyError, RecursionError) as e:  # a malformed rule or value, never a 500
            raise EvalError(f"Cannot evaluate '{expr.source}': {type(e).__name__}") from None
    if isinstance(value, Decimal) and not value.is_finite():
        raise EvalError(f"'{expr.source}' does not give a finite number")
    return value


def _num(v) -> Decimal:
    if isinstance(v, bool) or not isinstance(v, Decimal):
        raise EvalError(f"Expected a number, got {type(v).__name__}")
    return v


def _scalar(v):
    if isinstance(v, list):
        raise EvalError("A list of values (a key below this scope) needs sum/min/max/count")
    return v


def _truth(v) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, Decimal):
        return v != 0
    raise EvalError(f"Expected a true/false value, got {type(v).__name__}")


def _eval(node, lookup):
    if isinstance(node, (ast.Name, ast.Attribute)):
        key = _key_of(node)
        if key in ("True", "False"):
            return key == "True"
        return lookup(key)
    if isinstance(node, ast.Constant):
        v = node.value
        return v if isinstance(v, (bool, str)) or v is None else Decimal(str(v))
    if isinstance(node, ast.UnaryOp):
        v = _scalar(_eval(node.operand, lookup))
        if isinstance(node.op, ast.Not):
            return not _truth(v)
        return -_num(v) if isinstance(node.op, ast.USub) else +_num(v)
    if isinstance(node, ast.BoolOp):
        want = isinstance(node.op, ast.Or)  # `or` stops at the first true part, `and` at the first false part
        for part in node.values:
            if _truth(_scalar(_eval(part, lookup))) is want:
                return want
        return not want
    if isinstance(node, ast.IfExp):
        return _eval(node.body if _truth(_scalar(_eval(node.test, lookup))) else node.orelse, lookup)
    if isinstance(node, ast.BinOp):
        return _binop(node.op, _scalar(_eval(node.left, lookup)), _scalar(_eval(node.right, lookup)))
    if isinstance(node, ast.Compare):
        left = _scalar(_eval(node.left, lookup))
        for op, comparator in zip(node.ops, node.comparators):
            right = _scalar(_eval(comparator, lookup))
            if not _compare(op, left, right):
                return False
            left = right
        return True
    if isinstance(node, ast.Call):
        return _call(node.func.id, node.args, lookup)
    raise EvalError(f"Unsupported node {type(node).__name__}")  # unreachable after compile checks


def _binop(op, left, right):
    if isinstance(op, ast.Sub) and isinstance(left, dt.date) and isinstance(right, dt.date):
        return Decimal((left - right).days)
    a, b = _num(left), _num(right)
    if isinstance(op, ast.Add):
        return a + b
    if isinstance(op, ast.Sub):
        return a - b
    if isinstance(op, ast.Mult):
        return a * b
    if isinstance(op, ast.Div):
        if b == 0:
            raise EvalError("Division by zero")
        return a / b
    if b != b.to_integral_value() or abs(b) > MAX_EXPONENT:
        raise EvalError(f"Exponent must be a whole number between -{MAX_EXPONENT} and {MAX_EXPONENT}")
    if a == 0 and b < 0:
        raise EvalError("0 cannot be raised to a negative power")
    return a ** int(b)


def _compare(op, a, b) -> bool:
    if isinstance(a, bool) or isinstance(b, bool):
        if not isinstance(op, (ast.Eq, ast.NotEq)):
            raise EvalError("True/False can only be compared with == or !=")
    elif type(a) is not type(b):
        raise EvalError(f"Cannot compare {type(a).__name__} with {type(b).__name__}")
    if isinstance(op, ast.Eq):
        return a == b
    if isinstance(op, ast.NotEq):
        return a != b
    if not isinstance(a, (Decimal, dt.date)):
        raise EvalError("Only numbers and dates can be ordered; text and empty values can only be compared with == or !=")
    if isinstance(op, ast.Lt):
        return a < b
    if isinstance(op, ast.LtE):
        return a <= b
    if isinstance(op, ast.Gt):
        return a > b
    return a >= b


def _call(name, args, lookup):
    if name == "present":
        try:
            v = lookup(_key_of(args[0]))
        except Missing:
            return False
        return v is not None and v != []
    values: List = []
    for a in args:
        v = _eval(a, lookup)
        values.extend(v if isinstance(v, list) else [v])
    if name == "count":
        return Decimal(len(values))
    if name in AGGREGATES:
        nums = [_num(v) for v in values]
        if not nums:
            raise Missing(f"{name}() over no values")
        return sum(nums, Decimal(0)) if name == "sum" else (min(nums) if name == "min" else max(nums))
    if name == "round":
        if len(values) not in (1, 2):
            raise EvalError("round(x) or round(x, places)")
        places = int(_num(values[1])) if len(values) == 2 else 0
        if not 0 <= places <= 10:
            raise EvalError("round() places must be 0..10")
        return _num(values[0]).quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP)
    if len(values) != 1:
        raise EvalError(f"{name}() takes one value")
    x = _num(values[0])
    if name == "abs":
        return abs(x)
    if x < 0:
        raise EvalError("sqrt() of a negative number")
    return x.sqrt()


_PLACEHOLDER = re.compile(r"\{([a-z][a-z0-9_]*(?:\.[a-z0-9][a-z0-9_]*)*)\}")  # no segment may start with _


def render(template: str, lookup: Lookup) -> str:
    """Fill {parameter.key} placeholders with values. Plain key lookup only, never str.format, so a template
    cannot reach object attributes."""
    def sub(m):
        try:
            v = lookup(m.group(1))
        except (EvalError, KeyError):  # no value, or a key the profile does not have (rejected at load)
            return "?"
        if isinstance(v, list):
            return "?"
        return format(v, "f") if isinstance(v, Decimal) else str(v)
    return _PLACEHOLDER.sub(sub, template[:500])


def placeholders(template: str) -> List[str]:
    """Parameter keys named as {placeholders} in a message template."""
    return _PLACEHOLDER.findall(template or "")


def scope_lookup(values: Dict[str, object]) -> Lookup:
    """Lookup over a plain dict (tests and simple callers): a missing key raises Missing."""
    def lookup(key):
        if key not in values or values[key] is None:
            raise Missing(f"No value for '{key}'")
        return values[key]
    return lookup
