"""
Bill parsing and validation (Step 3). Every bill here is SYNTHETIC and used only for unit and negative
tests (names start with synthetic_). Real-bill fixtures come only from the pilot factory, with consent.
"""
import datetime as dt
import os
import sys
import unittest
from decimal import Decimal as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.bills import (  # noqa: E402
    BillParseError, ElectricityBill, ExtractedField, GasBill, Register, confirm, parse_date, parse_number,
    ready_for_ledger, validate_electricity, validate_gas, validate_periods,
)


def synthetic_bill(registers, total, start=dt.date(2025, 6, 1), end=dt.date(2025, 6, 30), account="SYN-1"):
    return ElectricityBill("SYNTHETIC", account, "M-1", start, end, tuple(registers), D(total))


def codes(findings):
    return [f["code"] for f in findings]


class BengaliTextTest(unittest.TestCase):
    def test_numbers(self):
        self.assertEqual(parse_number("১,২৩,৪৫৬.৫"), D("123456.5"))  # Bengali digits, Indian grouping
        self.assertEqual(parse_number("123,456"), D(123456))
        for bad in ("১২.৩.৪", "kWh", ""):
            with self.assertRaises(BillParseError):
                parse_number(bad)

    def test_dates_with_bengali_months(self):
        self.assertEqual(parse_date("১৫ জুলাই ২০২৫"), dt.date(2025, 7, 15))
        self.assertEqual(parse_date("০১ জানুয়ারী ২০২৬"), dt.date(2026, 1, 1))  # alternate spelling
        self.assertEqual(parse_date("3 Feb 2025"), dt.date(2025, 2, 3))
        self.assertEqual(parse_date("31/12/2024"), dt.date(2024, 12, 31))
        with self.assertRaises(BillParseError):
            parse_date("১৫ ফাল্গুন ১৪৩১")  # Bengali-calendar dates need a separate converter


class ElectricityValidationTest(unittest.TestCase):
    def test_synthetic_consistent_tou_bill_passes(self):
        regs = [Register("off_peak", D(1000), D(1300), D(40), D(12000)), Register("peak", D(500), D(560), D(40), D(2400))]
        self.assertEqual(validate_electricity(synthetic_bill(regs, 14400)), [])

    def test_synthetic_reading_and_tou_mismatches(self):
        regs = [Register("off_peak", D(1000), D(1300), D(40), D(12500)), Register("peak", D(500), D(560), D(40), D(2400))]
        self.assertEqual(codes(validate_electricity(synthetic_bill(regs, 14000))), ["READING_MISMATCH", "TOU_SUM_MISMATCH"])

    def test_synthetic_rollover_and_negative_reading(self):
        rolled = Register("flat", D(99950), D(50), D(1), D(100), meter_digits=5)
        self.assertEqual(codes(validate_electricity(synthetic_bill([rolled], 100))), ["METER_ROLLOVER"])
        negative = Register("flat", D(99950), D(50), D(1), D(100))
        self.assertIn("NEGATIVE_READING", codes(validate_electricity(synthetic_bill([negative], 100))))

    def test_synthetic_estimated_read_is_flagged_not_blocking(self):
        f = validate_electricity(synthetic_bill([Register("flat", D(0), D(100), D(1), D(100), estimated=True)], 100))
        self.assertEqual((codes(f), f[0]["blocking"]), (["ESTIMATED_READ"], False))

    def test_synthetic_overlapping_and_missing_periods(self):
        regs = [Register("flat", D(0), D(1), D(1), D(1))]
        bills = [synthetic_bill(regs, 1, dt.date(2025, 6, 1), dt.date(2025, 6, 30)),
                 synthetic_bill(regs, 1, dt.date(2025, 6, 25), dt.date(2025, 7, 24)),
                 synthetic_bill(regs, 1, dt.date(2025, 9, 1), dt.date(2025, 9, 30))]
        self.assertEqual(codes(validate_periods(bills)), ["PERIOD_OVERLAP", "PERIOD_GAP"])


class GasAndProvenanceTest(unittest.TestCase):
    def test_synthetic_gas_correction(self):
        ok = GasBill("SYNTHETIC", "G-1", "GM-1", dt.date(2025, 6, 1), dt.date(2025, 6, 30), D(1000), D("1.05"), D(1050))
        self.assertEqual(validate_gas(ok), [])
        bad = GasBill("SYNTHETIC", "G-1", "GM-1", dt.date(2025, 6, 1), dt.date(2025, 6, 30), D(1000), D("1.05"), D(1000))
        self.assertEqual(codes(validate_gas(bad)), ["GAS_CORRECTION_MISMATCH"])

    def test_unconfirmed_fields_cannot_enter_the_ledger(self):
        fields_ = [ExtractedField("billed_kwh", "১৪,৪০০", 1, (10, 20, 80, 32), 0.91),
                   ExtractedField("meter_no", "M-1", 1, (10, 40, 60, 52), 0.97)]
        self.assertEqual(ready_for_ledger(fields_), (False, ["billed_kwh", "meter_no"]))
        done = [confirm(fields_[0], "reviewer-1", "14400"), confirm(fields_[1], "reviewer-1")]
        self.assertEqual(ready_for_ledger(done), (True, []))
        self.assertEqual((done[0].confirmed_value, done[0].page, done[0].bbox), ("14400", 1, (10, 20, 80, 32)))


if __name__ == "__main__":
    unittest.main()
