"""
Property tests (Hypothesis): invariants that must hold for every input, not only for hand-picked fixtures.
Units, Bengali numbers, inventory totals and boundaries, contractual instruments, month splits, the refrigerant mass
balance and the bill rule evaluator. Factors are TEST values.

HYPOTHESIS_PROFILE=mutation (the mutmut CI job) runs fewer, derandomized examples so every mutant stays fast.
"""
import datetime as dt
import operator
import os
import sys
import unittest
from collections import defaultdict
from dataclasses import replace
from decimal import Decimal as D, localcontext

from hypothesis import HealthCheck, assume, given, settings, strategies as st

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag import accounting as acc  # noqa: E402
from esg_rag.accounting import (  # noqa: E402
    Activity, Facility, Factor, Instrument, MassBalance, UnitError, calculate, month_segments, normalize,
)
from esg_rag.bill_profiles import convert  # noqa: E402
from esg_rag.bill_rules import (  # noqa: E402
    DECIMAL_CONTEXT, EvalError, RuleError, compile_expression, evaluate, scope_lookup,
)
from esg_rag.bill_text import BillParseError, parse_number  # noqa: E402

_SLOW = [HealthCheck.too_slow, HealthCheck.data_too_large]
settings.register_profile("ci", max_examples=100, deadline=None, database=None, suppress_health_check=_SLOW)
settings.register_profile("mutation", max_examples=15, deadline=None, database=None, derandomize=True,
                          suppress_health_check=_SLOW)
settings.load_profile(os.environ.get("HYPOTHESIS_PROFILE", "ci"))

KG = D("0.000001")  # lines are rounded to this; totals of n lines may differ from exact arithmetic by n × KG
QTY = st.decimals(min_value=0, max_value=10 ** 6, places=2, allow_nan=False, allow_infinity=False)


# --- units -------------------------------------------------------------------------------------------------------

CONVERTIBLE = [(at, unit) for at, (_, canon) in acc.ACTIVITY_TYPES.items() for unit, (dim, _) in acc.UNITS.items()
               if dim == acc.UNITS[canon][0] and (at != "natural_gas" or unit == "m3")]
INCOMPATIBLE = [(at, unit) for at, (_, canon) in acc.ACTIVITY_TYPES.items() for unit, (dim, _) in acc.UNITS.items()
                if dim != acc.UNITS[canon][0]]
PINT_NAME = {"US_gal": "gallon"}  # pint's US liquid gallon; the other spellings are pint's own
BENGALI = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


class UnitProperties(unittest.TestCase):
    @given(st.sampled_from(CONVERTIBLE), QTY)
    def test_conversion_constants_agree_with_pint(self, pair, q):
        activity_type, unit = pair
        canon = acc.canonical_unit(activity_type)
        ours = normalize(q, unit, activity_type)
        theirs = convert(q, PINT_NAME.get(unit, unit), PINT_NAME.get(canon, canon))
        self.assertLessEqual(abs(ours - theirs), abs(ours) * D("1e-12") + D("1e-12"))

    @given(st.sampled_from(CONVERTIBLE), QTY, QTY)
    def test_conversion_is_additive_and_monotonic(self, pair, a, b):
        activity_type, unit = pair
        na, nb, nab = (normalize(x, unit, activity_type) for x in (a, b, a + b))
        self.assertLessEqual(abs(nab - (na + nb)), abs(nab) * D("1e-20") + D("1e-20"))
        self.assertEqual(na <= nb, a <= b)

    @given(st.sampled_from(INCOMPATIBLE), QTY)
    def test_a_unit_of_another_dimension_is_always_rejected(self, pair, q):
        with self.assertRaises(UnitError):
            normalize(q, pair[1], pair[0])

    @given(st.sampled_from(CONVERTIBLE), st.decimals(max_value=D("-0.01"), min_value=-10 ** 6, places=2))
    def test_negative_quantities_are_always_rejected(self, pair, q):
        with self.assertRaises(UnitError):
            normalize(q, pair[1], pair[0])

    @given(st.decimals(min_value=-10 ** 12, max_value=10 ** 12, places=3, allow_nan=False, allow_infinity=False))
    def test_bengali_and_ascii_digits_parse_to_the_same_number(self, value):
        plain, grouped = format(value, "f"), format(value, ",f")
        for text in (plain, grouped, plain.translate(BENGALI), grouped.translate(BENGALI)):
            self.assertEqual(parse_number(text), value)

    @given(st.text(max_size=30))
    def test_number_parsing_fails_only_with_its_own_error(self, text):
        try:
            parse_number(text)
        except BillParseError:
            pass


# --- inventory -----------------------------------------------------------------------------------------------------

FACS = {
    "f1": Facility("f1", "BD", True, True, D(100)),
    "f2": Facility("f2", "BD", False, True, D(40)),
    "f3": Facility("f3", "BD", True, False, D(60)),
}


def _factor(id, activity_type, unit, value, method, kind=None):
    return Factor(id=id, version=1, family=id, activity_type=activity_type, unit=unit, kgco2e_per_unit=D(value),
                  region="BD", gwp_basis="AR6", method=method, valid_from=dt.date(2024, 1, 1), kind=kind,
                  uncertainty_pct=D(5))


FACTORS = [_factor("grid", "electricity", "kWh", "0.5", "location", "grid_average"),
           _factor("diesel", "diesel", "L", "2.7", "direct"), _factor("lpg", "lpg", "kg", "2.98", "direct"),
           _factor("fo", "furnace_oil", "L", "3.1", "direct")]
TYPES = ("diesel", "lpg", "furnace_oil", "electricity", "electricity_export", "onsite_renewable_generation")


def _month(month):
    start = dt.date(2025, month, 1)
    return start, (start.replace(day=28) + dt.timedelta(days=4)).replace(day=1) - dt.timedelta(days=1)


@st.composite
def activities(draw, max_size=12):
    out = []
    for i in range(draw(st.integers(0, max_size))):
        activity_type = draw(st.sampled_from(TYPES))
        start, end = _month(draw(st.integers(1, 12)))
        out.append(Activity(id=f"a{i:02d}", facility_id=draw(st.sampled_from(sorted(FACS))),
                            activity_type=activity_type, quantity=draw(QTY), unit=acc.canonical_unit(activity_type),
                            period_start=start, period_end=end,
                            data_quality=draw(st.sampled_from(acc.DATA_QUALITY_GRADES))))
    return out


def _total(r, scope, method):
    return sum((l.emissions_kg for l in r.lines if l.scope == scope and l.method == method), D(0))


class InventoryProperties(unittest.TestCase):
    @given(activities(), st.sampled_from(acc.BOUNDARY_METHODS))
    def test_totals_are_the_sum_of_their_lines_and_of_facilities(self, acts, boundary):
        r = calculate(acts, FACS, FACTORS, boundary)
        self.assertFalse(r.blocking)  # every activity type here has an approved factor
        self.assertEqual(r.scope1_kg, _total(r, "1", "direct"))
        self.assertEqual(r.scope2_location_kg, _total(r, "2", "location"))
        has_grid = any(l.method == "location" for l in r.lines)
        self.assertEqual(r.scope2_market_kg, _total(r, "2", "market") if has_grid else None)
        if has_grid:  # nothing better than the grid average applies: market-based equals location-based
            self.assertEqual(r.scope2_market_kg, r.scope2_location_kg)
        for key, total in (("scope1_kg", r.scope1_kg), ("scope2_location_kg", r.scope2_location_kg)):
            self.assertEqual(sum((b[key] for b in r.by_facility.values()), D(0)), total)

    @given(activities(), st.sampled_from(acc.BOUNDARY_METHODS), st.randoms(use_true_random=False))
    def test_the_result_does_not_depend_on_input_order(self, acts, boundary, rnd):
        shuffled = list(acts)
        rnd.shuffle(shuffled)
        a, b = calculate(acts, FACS, FACTORS, boundary), calculate(shuffled, FACS, FACTORS, boundary)
        self.assertEqual([(l.activity_id, l.method, l.formula) for l in a.lines],
                         [(l.activity_id, l.method, l.formula) for l in b.lines])
        self.assertEqual((a.scope1_kg, a.scope2_location_kg, a.scope2_market_kg, a.exceptions, a.memo),
                         (b.scope1_kg, b.scope2_location_kg, b.scope2_market_kg, b.exceptions, b.memo))

    @given(activities(), st.sampled_from(acc.BOUNDARY_METHODS))
    def test_memo_items_are_reported_and_never_change_totals(self, acts, boundary):
        inventory = [a for a in acts if a.activity_type not in acc.MEMO_ACTIVITY_TYPES]
        full, bare = calculate(acts, FACS, FACTORS, boundary), calculate(inventory, FACS, FACTORS, boundary)
        self.assertEqual((full.scope1_kg, full.scope2_location_kg, full.scope2_market_kg),
                         (bare.scope1_kg, bare.scope2_location_kg, bare.scope2_market_kg))
        expected = defaultdict(D)
        for a in acts:
            if a.activity_type in acc.MEMO_ACTIVITY_TYPES:
                expected[a.activity_type] += a.quantity
        self.assertEqual(full.memo, dict(expected))

    @given(activities(), st.sampled_from([D(2), D(3), D(10)]))
    def test_emissions_scale_with_activity_quantities(self, acts, k):
        base = calculate(acts, FACS, FACTORS, "equity_share")
        scaled = calculate([replace(a, quantity=a.quantity * k) for a in acts], FACS, FACTORS, "equity_share")
        tolerance = KG * k * (len(base.lines) + 1)
        self.assertLessEqual(abs(scaled.scope1_kg - k * base.scope1_kg), tolerance)
        self.assertLessEqual(abs(scaled.scope2_location_kg - k * base.scope2_location_kg), tolerance)

    @given(activities())
    def test_equity_share_is_the_share_weighted_sum_of_whole_facilities(self, acts):
        r = calculate(acts, FACS, FACTORS, "equity_share")
        expected, lines = D(0), 0
        for fid, fac in FACS.items():
            whole = calculate([a for a in acts if a.facility_id == fid], {fid: replace(fac, equity_share_pct=D(100))},
                              FACTORS, "equity_share")
            expected += (whole.scope1_kg + whole.scope2_location_kg) * fac.equity_share_pct / 100
            lines += len(whole.lines)
        self.assertLessEqual(abs(r.scope1_kg + r.scope2_location_kg - expected), KG * (lines + 1))

    @given(activities(), st.lists(st.tuples(st.sampled_from(sorted(FACS)),
                                            st.decimals(min_value=D("0.001"), max_value=D(500), places=3),
                                            st.integers(1, 12), st.integers(0, 11)), max_size=4))
    def test_instrument_kwh_are_applied_at_most_once_and_never_beyond_consumption(self, acts, specs):
        instruments = [Instrument(id=f"i{n}", facility_id=fid, instrument_type="energy_attribute_certificate",
                                  ref=f"TEST-{n}", market="BD", mwh=mwh, kg_per_kwh=D(0),
                                  applies_from=dt.date(2025, month, 1), applies_to=_month(min(12, month + span))[1],
                                  criteria=acc.QUALITY_CRITERIA)
                       for n, (fid, mwh, month, span) in enumerate(specs)]
        r = calculate(acts, FACS, FACTORS, "operational_control", instruments=instruments)
        applied = defaultdict(D)
        for l in r.lines:
            if l.details.get("market_level") == "contractual_instrument":
                applied[l.details["instrument_id"]] += l.quantity
        for inst in instruments:
            self.assertLessEqual(applied[inst.id], inst.mwh * 1000)
        for a in acts:  # every grid kWh inside the boundary is in the market-based result exactly once
            if a.activity_type == "electricity" and FACS[a.facility_id].operational_control:
                covered = sum((l.quantity for l in r.lines if l.activity_id == a.id and l.method == "market"), D(0))
                self.assertEqual(covered, a.quantity)
        if r.scope2_market_kg is not None:
            self.assertLessEqual(r.scope2_market_kg, r.scope2_location_kg)  # zero-rate instruments only lower it

    @given(st.dates(min_value=dt.date(2020, 1, 1), max_value=dt.date(2030, 12, 31)), st.integers(0, 400), QTY)
    def test_month_segments_partition_the_activity(self, start, days, qty):
        a = Activity("a", "f1", "electricity", qty, "kWh", start, start + dt.timedelta(days=days))
        segments = month_segments(a)
        self.assertEqual(sum((s.quantity for s in segments), D(0)), qty)
        self.assertEqual((segments[0].period_start, segments[-1].period_end), (a.period_start, a.period_end))
        for s, nxt in zip(segments, segments[1:]):
            self.assertEqual(s.period_end + dt.timedelta(days=1), nxt.period_start)
        for s in segments:
            self.assertEqual((s.period_start.year, s.period_start.month), (s.period_end.year, s.period_end.month))
            self.assertGreaterEqual(s.quantity, 0)

    @given(*[st.decimals(min_value=0, max_value=10 ** 4, places=3)] * 6)
    def test_refrigerant_mass_balance_is_never_clamped(self, s0, s1, bought, sold, charge0, charge1):
        mb = MassBalance(s0, s1, bought, sold, charge0, charge1)
        a = Activity("r1", "f1", "refrigerant", D(0), "kg", dt.date(2025, 1, 1), dt.date(2025, 12, 31),
                     data_quality="metered", refrigerant="R-134a", mass_balance=mb)
        r = calculate([a], {"f1": FACS["f1"]}, [], "operational_control", gwp_basis="AR6")
        net = (s0 - s1) + (bought - sold) + (charge0 - charge1)
        if net < 0:
            self.assertEqual([e["code"] for e in r.exceptions], ["DATA_INCONSISTENT"])
            self.assertTrue(r.blocking)
            self.assertEqual((r.lines, r.scope1_kg), ([], 0))
        else:
            self.assertEqual([l.quantity for l in r.lines], [net])
            self.assertEqual(r.scope1_kg, (net * D(1530)).quantize(KG))  # AR6 GWP-100 of HFC-134a


# --- bill rule evaluator ------------------------------------------------------------------------------------------

KEYS = frozenset({"x.a", "x.b", "meter.read"})
NUM = st.decimals(min_value=-10 ** 6, max_value=10 ** 6, places=4, allow_nan=False, allow_infinity=False)
OPS = {"+": operator.add, "-": operator.sub, "*": operator.mul, "/": operator.truediv, "<": operator.lt,
       "<=": operator.le, ">": operator.gt, ">=": operator.ge, "==": operator.eq, "!=": operator.ne}
TOKENS = ("x.a", "x.b", "meter.read", "1", "0", "2.5", "'peak'", "True", "None", " + ", " - ", " * ", " / ", " ** ",
          "(", ")", " < ", " <= ", " == ", " != ", " and ", " or ", " not ", " if ", " else ", "abs(", "min(", "max(",
          "sum(", "round(", "sqrt(", "count(", "present(", ", ", "__import__", "__class__", ".", "[", "]", "{", "}",
          "lambda", ":", "x._a", "eval(", "open(", "getattr(", "@", "'", '"', "\\", "\n", "#", ";", "=", ":=", "\x00")
INJECTIONS = ("__import__('os')", "eval('1')", "exec('x = 1')", "open('/etc/passwd')", "getattr(x, 'a')", "globals()",
              "().__class__", "x.a.__class__", "[].__class__.__base__", "(lambda: 1)()", "x.a if x.a else __builtins__",
              "{}.keys()", "f'{x.a}'", "x.a[0]", "x.a.real", "type(x.a)", "compile('1', '', 'eval')", "vars()",
              "breakpoint()", "input()", "max(x.a, key=print)", "min(*x.a)", "x._a", "(x := 1)")


def _lookup(key):
    assert key in KEYS, key  # the evaluator only ever asks for keys the rule declared
    return D(1)


class RuleEvaluatorProperties(unittest.TestCase):
    @given(NUM, NUM, st.sampled_from(sorted(OPS)))
    def test_arithmetic_and_comparisons_match_decimal(self, a, b, op):
        assume(not (op == "/" and b == 0))
        got = evaluate(compile_expression(f"x.a {op} x.b", KEYS), scope_lookup({"x.a": a, "x.b": b}))
        with localcontext(DECIMAL_CONTEXT):
            self.assertEqual(got, OPS[op](a, b))

    @given(NUM, NUM)
    def test_min_max_abs_match_python(self, a, b):
        values = scope_lookup({"x.a": a, "x.b": b})
        self.assertEqual(evaluate(compile_expression("min(x.a, x.b)", KEYS), values), min(a, b))
        self.assertEqual(evaluate(compile_expression("max(x.a, x.b)", KEYS), values), max(a, b))
        self.assertEqual(evaluate(compile_expression("abs(x.a)", KEYS), values), abs(a))

    @given(NUM)
    def test_division_by_zero_is_an_evaluation_error(self, a):
        with self.assertRaises(EvalError):
            evaluate(compile_expression("x.a / x.b", KEYS), scope_lookup({"x.a": a, "x.b": D(0)}))

    @given(st.one_of(st.lists(st.sampled_from(TOKENS), min_size=1, max_size=25).map("".join), st.text(max_size=80)))
    def test_any_text_fails_only_with_the_evaluators_own_errors(self, source):
        try:
            expr = compile_expression(source, KEYS)
        except RuleError:
            return
        self.assertLessEqual(expr.keys, KEYS)
        try:
            evaluate(expr, _lookup)
        except EvalError:
            pass

    @given(st.sampled_from(INJECTIONS), st.sampled_from(["", " + 1", " * x.a", " and True"]),
           st.sampled_from([("", ""), ("abs(", ")"), ("(", ")"), ("max(x.a, ", ")")]))
    def test_code_injection_is_rejected_when_the_rule_is_compiled(self, core, suffix, wrap):
        with self.assertRaises(RuleError):
            compile_expression(wrap[0] + core + wrap[1] + suffix, KEYS)


if __name__ == "__main__":
    unittest.main()
