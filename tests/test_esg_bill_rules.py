"""
Bill rule expressions (D2): arithmetic, comparisons and scoping work; everything else, in particular code
injection, is rejected when the rule is compiled. Pure library tests.
"""
import datetime as dt
import os
import sys
import unittest
from decimal import Decimal as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.bill_rules import (  # noqa: E402
    EvalError, Missing, RuleError, compile_expression, evaluate, render, scope_lookup,
)

KEYS = {"meter.read.current", "meter.read.previous", "meter.multiplier", "energy.kwh.register", "energy.kwh.total",
        "meter.digits", "period.start", "period.end", "register.band", "meter.read.estimated"}
VALUES = {"meter.read.current": D(1300), "meter.read.previous": D(1000), "meter.multiplier": D(40),
          "energy.kwh.register": D(12000), "energy.kwh.total": D(14400), "period.start": dt.date(2025, 7, 1),
          "period.end": dt.date(2025, 7, 31), "register.band": "peak", "meter.read.estimated": False}


def run(expr, values=VALUES):
    return evaluate(compile_expression(expr, KEYS), scope_lookup(values))


class EvaluatorTest(unittest.TestCase):
    def test_reading_reconciliation(self):
        self.assertTrue(run("abs((meter.read.current - meter.read.previous) * meter.multiplier - energy.kwh.register) <= 0.5"))
        self.assertEqual(run("(meter.read.current - meter.read.previous) * meter.multiplier"), D(12000))

    def test_decimal_arithmetic_is_exact(self):
        self.assertEqual(run("0.1 + 0.2"), D("0.3"))
        self.assertEqual(run("round(energy.kwh.total / 3, 2)"), D("4800.00"))
        self.assertEqual(run("sqrt(16)"), D(4))
        self.assertEqual(run("10 ** 5"), D(100000))

    def test_dates_text_and_flags(self):
        self.assertEqual(run("period.end - period.start"), D(30))
        self.assertTrue(run("period.end >= period.start"))
        self.assertTrue(run("register.band == 'peak' and not meter.read.estimated"))
        self.assertEqual(run("1 if meter.read.estimated else 2"), D(2))

    def test_missing_values_and_present(self):
        self.assertFalse(run("present(meter.digits)"))
        with self.assertRaises(Missing):
            run("meter.digits + 1")

    def test_lists_need_an_aggregate(self):
        values = {**VALUES, "energy.kwh.register": [D(12000), D(2400)]}
        self.assertEqual(run("sum(energy.kwh.register)", values), D(14400))
        self.assertEqual(run("max(energy.kwh.register)", values), D(12000))
        self.assertEqual(run("count(energy.kwh.register)", values), D(2))
        with self.assertRaises(EvalError):
            run("energy.kwh.register + 1", values)

    def test_runtime_errors_are_reported_not_raised_as_python_errors(self):
        for expr in ("energy.kwh.total / 0", "sqrt(0 - 1)", "10 ** 13", "register.band < 'x'", "period.end + 1",
                     "energy.kwh.total == period.end"):
            with self.subTest(expr=expr), self.assertRaises(EvalError):
                run(expr)

    def test_render_uses_plain_key_lookup(self):
        lookup = scope_lookup(VALUES)
        self.assertEqual(render("billed {energy.kwh.total} kWh", lookup), "billed 14400 kWh")
        self.assertEqual(render("{energy.kwh.total.__class__} {meter.digits}", lookup), "{energy.kwh.total.__class__} ?")


class InjectionTest(unittest.TestCase):
    """D2: rules are data, so anything outside the whitelist must fail at compile time."""
    ATTACKS = (
        "__import__('os').system('echo pwned')",
        "().__class__.__bases__[0].__subclasses__()",
        "energy.kwh.total.__class__",
        "meter.__dict__",
        "eval('1+1')",
        "exec('import os')",
        "open('/etc/passwd').read()",
        "getattr(energy, 'kwh')",
        "globals()",
        "lambda: 1",
        "[x for x in (1, 2)]",
        "{1: 2}",
        "energy.kwh.total[0]",
        "f'{energy.kwh.total}'",
        "abs(x=1)",
        "max(*[1, 2])",
        "(energy.kwh.total).real",
        "'a'.upper()",
        "__builtins__",
        "_secret.key",
        "not_a.key",
        "import os",
        "energy.kwh.total; 1",
        "energy.kwh.total := 1",
        "1 if True else __import__('os')",
        "b'bytes'",
    )

    def test_injection_attempts_are_rejected(self):
        for expr in self.ATTACKS:
            with self.subTest(expr=expr), self.assertRaises(RuleError):
                compile_expression(expr, KEYS)

    def test_size_and_depth_limits(self):
        with self.assertRaises(RuleError):
            compile_expression("1 + " * 400 + "1", KEYS)
        with self.assertRaises(RuleError):
            compile_expression("abs(" * 50 + "1" + ")" * 50, KEYS)
        with self.assertRaises(RuleError):
            compile_expression("'" + "x" * 101 + "'", KEYS)

    def test_no_code_object_is_ever_built(self):
        import ast
        import builtins
        flags, real_compile = [], builtins.compile

        def spy(source, filename, mode, flag=0, *args, **kwargs):
            flags.append(flag)
            return real_compile(source, filename, mode, flag, *args, **kwargs)
        builtins.compile = spy
        try:
            expr = compile_expression("abs(energy.kwh.total - 14400) <= 0.5", KEYS)
        finally:
            builtins.compile = real_compile
        self.assertTrue(flags and all(f & ast.PyCF_ONLY_AST for f in flags))  # parsing to a tree only, no bytecode
        calls, real = [], (builtins.eval, builtins.exec, builtins.compile)
        builtins.eval = builtins.exec = builtins.compile = lambda *a, **k: calls.append(a)
        try:
            self.assertTrue(evaluate(expr, scope_lookup(VALUES)))  # evaluation walks the tree itself
        finally:
            builtins.eval, builtins.exec, builtins.compile = real
        self.assertEqual(calls, [])


if __name__ == "__main__":
    unittest.main()
