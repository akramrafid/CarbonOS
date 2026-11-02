"""
Security review regressions for bill definitions, rules and documents (pure library): YAML stays bounded, the rule
evaluator raises only its own errors, bill text gives only parse errors, documents are read in memory with bounds.
All inputs are SYNTHETIC.
"""
import io
import os
import sys
import time
import unittest
from decimal import Decimal as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from PIL import Image, UnidentifiedImageError  # noqa: E402
from esg_rag import bill_extract as bx  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402
from esg_rag.bill_rules import EvalError, RuleError, compile_expression, evaluate, render, scope_lookup  # noqa: E402
from esg_rag.bill_text import BillParseError, parse_date, parse_number  # noqa: E402

# Seven levels of nine aliases each: about 4.8 million nodes once expanded, from a few hundred bytes.
BOMB = "\n".join(["a: &a [x, x, x, x, x, x, x, x, x]"]
                  + [f"{n}: &{n} [{', '.join(['*' + p] * 9)}]" for p, n in zip("abcdef", "bcdefg")] + ["notes: *g"])


class BoundedYamlTest(unittest.TestCase):
    def test_an_alias_bomb_is_refused_quickly(self):
        started = time.perf_counter()
        with self.assertRaises(bp.ProfileError) as ctx:
            bp.load_yaml(BOMB)
        self.assertIn("aliases", str(ctx.exception))
        self.assertLess(time.perf_counter() - started, 2.0)

    def test_deep_nesting_is_refused(self):
        with self.assertRaises(bp.ProfileError):
            bp.load_yaml("a: " + "[" * 5000 + "]" * 5000)

    def test_the_repository_definitions_stay_within_the_limit(self):
        for path in (bp.PROFILE_DIR / "parameters.yaml", bp.PROFILE_DIR / "rulesets.yaml",
                     *sorted((bp.PROFILE_DIR / "seed").glob("*.yaml"))):
            with self.subTest(path=path.name):
                bp.load_yaml(path.read_text(encoding="utf-8"))

    def test_text_fields_must_be_text(self):
        with self.assertRaises(bp.ProfileError):
            bp.parse_parameter({"key": "energy.kwh.total", "dtype": "decimal", "role": "consumption",
                                "dimension": "[energy]", "canonical_unit": "kWh", "labels": {"en": "Total"},
                                "description": ["not", "text"]}, {"bill": None})


class EvaluatorErrorsTest(unittest.TestCase):
    def test_only_the_evaluators_own_errors_leave_it(self):
        for src in ("None < None", "0 ** -1", "(x.a - x.a) ** -2", "'a' < 'b'"):
            with self.subTest(src=src), self.assertRaises(EvalError):
                evaluate(compile_expression(src, {"x.a"}), scope_lookup({"x.a": D(3)}))

    def test_non_finite_numbers_are_refused_when_a_rule_is_compiled(self):
        for src in ("1e999", "-1e999 + 1"):
            with self.subTest(src=src), self.assertRaises(RuleError):
                compile_expression(src, set())

    def test_a_message_naming_an_unknown_parameter_is_refused_at_load(self):
        params, groups = bp.parse_parameters(bp.load_yaml((bp.PROFILE_DIR / "parameters.yaml").read_text("utf-8")))
        rules = {"schema": bp.SCHEMA_RULESETS, "rulesets": {"synthetic": {"rules": [
            {"code": "SYNTHETIC_RULE", "scope": "bill", "expect": "1 == 1", "message": "see {no.such.key}"}]}}}
        with self.assertRaises(bp.ProfileError):
            bp.parse_rulesets(rules, params, groups)

    def test_render_never_raises_for_an_unknown_key(self):
        def lookup(key):
            raise KeyError(key)
        self.assertEqual(render("value {energy.kwh.total}", lookup), "value ?")


class BillTextTest(unittest.TestCase):
    def test_impossible_dates_and_overlong_numbers_are_parse_errors(self):
        for text in ("31-02-2025", "32-07-2025", "15-13-2025", "01-01-0000", "৩১-০২-২০২৫"):
            with self.subTest(text=text), self.assertRaises(BillParseError):
                parse_date(text)
        with self.assertRaises(BillParseError):
            parse_number("9" * 40)
        self.assertEqual(parse_number("1" * 24), D("1" * 24))


class InMemoryDocumentTest(unittest.TestCase):
    def test_pdf_pages_are_capped_before_any_page_is_read(self):
        buf = io.BytesIO()
        pages = [Image.new("L", (200, 200), 255) for _ in range(3)]
        pages[0].save(buf, "PDF", save_all=True, append_images=pages[1:])
        with self.assertRaises(ValueError):
            bx.document_from_pdf(buf.getvalue(), max_pages=2)
        self.assertEqual(len(bx.document_from_pdf(buf.getvalue(), max_pages=3).pages), 3)

    def test_only_listed_image_formats_are_opened_for_ocr(self):
        try:
            import pytesseract  # noqa: F401
        except ImportError:
            self.skipTest("pytesseract is not installed")
        with self.assertRaises(UnidentifiedImageError):
            bx.document_from_image(b"%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 10 10\n")


if __name__ == "__main__":
    unittest.main()
