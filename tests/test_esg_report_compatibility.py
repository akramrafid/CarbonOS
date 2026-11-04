"""Schema v2 fixes new facility units without rewriting historical schema-v1 export bytes."""
import hashlib
import os
import sys
import unittest
from pathlib import Path
sys.path.insert(0, os.path.dirname(__file__))
import esg_harness  # Configure the isolated test environment before importing application models.
from esg_rag.ledger import export_snapshot
from esg_rag.ledger_models import ReportSnapshot


class HistoricalReportCompatibilityTest(unittest.TestCase):
    def test_v1_json_and_csv_remain_byte_identical_to_prechange_renderer(self):
        root = Path(__file__).parent / 'fixtures'
        content = (root / 'esg_report_v1.json').read_text()
        snapshot = ReportSnapshot(content=content, content_sha256=hashlib.sha256(content.encode()).hexdigest())
        self.assertEqual(export_snapshot(snapshot, 'json'), content)
        self.assertEqual(export_snapshot(snapshot, 'csv').encode(), (root / 'esg_report_v1.csv').read_bytes())
        self.assertNotIn('by_facility_units', export_snapshot(snapshot, 'csv'))
