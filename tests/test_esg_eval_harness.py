"""
Unit and integration tests for Phase 7: Evaluation & Quality Gate Harness.
Tests:
- Execution of run_evaluation_suite()
- Verification that all 5 evaluation quality gates pass
- Structured JSON output validity and baseline tracking
"""
import os
import sys
import json
import unittest

# Ensure inference path is available
INFERENCE_DIR = os.path.join(os.path.dirname(__file__), "..", "inference")
if INFERENCE_DIR not in sys.path:
    sys.path.insert(0, INFERENCE_DIR)

from esg_rag.eval import (
    run_evaluation_suite,
    eval_rag_retrieval,
    SYNTHETIC_BILL_EXTRACTION_CASES
)


class TestEsgEvalHarness(unittest.TestCase):
    def test_rag_retrieval_benchmark_meets_targets(self):
        retrieval_res = eval_rag_retrieval()
        self.assertEqual(retrieval_res["status"], "PASS")
        self.assertGreaterEqual(retrieval_res["hit@5"], 0.85)
        self.assertGreaterEqual(retrieval_res["mrr_overall"], 0.70)
        self.assertGreaterEqual(retrieval_res["mrr_bengali"], 0.65)
        self.assertEqual(retrieval_res["total_queries"], 64)

    def test_full_evaluation_suite_passes_all_quality_gates(self):
        output_path = "tests/test_eval_output.json"
        try:
            summary = run_evaluation_suite(output_file=output_path)
            self.assertIn("quality_gates", summary)
            gates = summary["quality_gates"]
            self.assertEqual(gates["bill_extraction"], "PASS")
            self.assertEqual(gates["gap_detection"], "PASS")
            self.assertEqual(gates["rag_retrieval"], "PASS")
            self.assertEqual(gates["emission_determinism"], "PASS")
            self.assertEqual(gates["safety_and_injection"], "PASS")

            self.assertTrue(os.path.exists(output_path))
            with open(output_path, "r", encoding="utf-8") as f:
                saved_json = json.load(f)
            self.assertIn("metrics", saved_json)
            self.assertTrue(saved_json["metrics"]["emission_exact_match"])
        finally:
            if os.path.exists(output_path):
                os.remove(output_path)


if __name__ == "__main__":
    unittest.main()

