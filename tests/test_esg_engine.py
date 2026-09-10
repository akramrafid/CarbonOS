"""
Unit Tests for Next-Gen ESG Calculation Engine, Factor Registry & ATLAS Benchmark
"""

import unittest
import sys
import os

# Add inference directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../inference'))
from esg_rag.calculation_engine import calculate_activity_footprint, calculate_spend_eeio_footprint, estimate_query_resource
from esg_rag.factor_registry import run_factor_regression_test, FACTOR_REGISTRY_CATALOG
from esg_rag.atlas_benchmark import run_atlas_eval_suite

class TestESGCalculationEngine(unittest.TestCase):
    def test_activity_footprint_calculation(self):
        sample_activities = {
            "diesel": 14200,   # 14,200 * 2.68 / 1000 = 38.056 t
            "petrol": 4800,    # 4,800 * 2.31 / 1000 = 11.088 t
            "lpg": 1950,       # 1,950 * 2.98 / 1000 = 5.811 t
            "electricity": 156000, # 156,000 * 0.550 / 1000 = 85.800 t
            "employees": 148,  # 148 * 0.40 = 59.200 t
            "airTravel": 82000, # 82,000 * 0.12 / 1000 = 9.840 t
            "truckTransport": 39000, # 39,000 * 0.20 / 1000 = 7.800 t
            "rawMaterials": 580 # 580 * 2.50 = 1450.000 t
        }
        res = calculate_activity_footprint(sample_activities)
        
        # Verify Scope 1 total: 38.056 + 11.088 + 5.811 = 54.955
        self.assertAlmostEqual(res["scope1"]["total_tco2e"], 54.955, places=2)
        # Verify Scope 2 location total: 85.80
        self.assertAlmostEqual(res["scope2"]["location_based_tco2e"], 85.80, places=2)
        # Verify Scope 3 total: 59.2 + 9.84 + 7.8 + 1450 = 1526.84
        self.assertAlmostEqual(res["scope3"]["total_tco2e"], 1526.84, places=2)
        # Verify grand total
        self.assertAlmostEqual(res["totals"]["location_based_tco2e"], 54.955 + 85.80 + 1526.84, places=2)
        self.assertIn("DuckDB", res["engine"])

    def test_spend_eeio_calculation(self):
        sample_spend = {
            "textiles_yarn": 1200000, # 1.2M BDT = 10,000 USD * 0.48 / 1000 = 4.8 tCO2e
            "freight_logistics": 600000 # 600k BDT = 5,000 USD * 0.94 / 1000 = 4.7 tCO2e
        }
        res = calculate_spend_eeio_footprint(sample_spend, currency="BDT", usd_bdt_exchange_rate=120.0)
        self.assertEqual(len(res["items"]), 2)
        self.assertAlmostEqual(res["total_emissions_tco2e"], 9.50, places=2)
        self.assertEqual(res["currency_input"], "BDT")

    def test_resource_estimator(self):
        est_small = estimate_query_resource(num_records=100)
        self.assertIn("30GB", est_small["memory_tier"])

        est_large = estimate_query_resource(num_records=25000)
        self.assertIn("180GB", est_large["memory_tier"])

    def test_factor_registry_and_regression_testing(self):
        self.assertGreaterEqual(len(FACTOR_REGISTRY_CATALOG), 8)

        # Proposed minimal update (< 2% variance)
        minor_bump = {"diesel": 2.69}
        res_pass = run_factor_regression_test(minor_bump, tolerance_pct=2.0)
        self.assertTrue(res_pass["passed_all_gates"])
        self.assertEqual(res_pass["status"], "APPROVED_REGRESSION_PASSED")

        # Proposed huge update (> 2% variance, should trigger gate warning)
        major_bump = {"diesel": 4.50}
        res_fail = run_factor_regression_test(major_bump, tolerance_pct=2.0)
        self.assertFalse(res_fail["passed_all_gates"])
        self.assertEqual(res_fail["status"], "REJECTED_AUDIT_WARNING")

    def test_atlas_benchmark_suite(self):
        eval_res = run_atlas_eval_suite()
        self.assertEqual(eval_res["total_test_cases"], 10)
        self.assertGreaterEqual(eval_res["metrics"]["parameter_accuracy_pct"], 90.0)
        self.assertGreaterEqual(eval_res["metrics"]["scope_classification_pct"], 90.0)

    def test_universal_utility_segments_detection(self):
        from esg_rag.extractor import detect_all_utility_segments
        test_invoice = """
        DHAKA ELECTRIC SUPPLY COMPANY (DESCO) INDUSTRIAL HIGH TENSION STATEMENT
        Account Meter: MTR-DESCO-HT-8821. Billing Period: May 2026.
        Off-Peak Energy: 85,000 kWh @ 9.20 BDT
        Peak Hour Energy: 22,000 kWh @ 12.80 BDT
        Sanctioned Maximum Demand: 400 kVA
        Captive Natural Gas: 12,500 m3
        Backup Genset Diesel: 3,400 Liters
        WASA Water Supply: 4,200 m3
        Solar Net-Metering Export: 5,000 kWh
        """
        res = detect_all_utility_segments(test_invoice)
        self.assertGreaterEqual(res["total_segments_detected"], 5)
        self.assertGreater(res["total_emissions_tco2e"], 0)
        self.assertIn("invoice_meta", res)
        self.assertIn("audit_seal", res)
        self.assertTrue(res["audit_seal"].startswith("SHA256-SEAL-"))
        self.assertIn("scope_breakdown", res)
        self.assertGreater(res["scope_breakdown"]["scope2_tco2e"], 0)

if __name__ == '__main__':
    unittest.main()
