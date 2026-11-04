"""
CarbonOS ATLAS Benchmark Evaluation Suite
Inspired by Watershed's ATLAS: Continuous evaluation and benchmark harness
for utility bill extraction, spend line classification, and citation grounding.
"""

from typing import Dict, Any, List
import time
import datetime
from .extractor import regex_heuristic_extraction

ATLAS_GROUND_TRUTH_CASES = [
    {
        "case_id": "ATLAS-01",
        "document_name": "DESCO_DEPZ_HT_Electric_Bill_May2026.pdf",
        "category": "Scope 2 Purchased Electricity",
        "raw_text": "DHAKA ELECTRIC SUPPLY COMPANY (DESCO) HT-Industrial Bill. Meter No: DESCO-HT-84910. Active consumption: 156,000 kWh. Off-peak: 42,000 kWh. Total billed units: 156,000 kWh.",
        "ground_truth": {"param": "electricity", "value": 156000.0, "unit": "kWh", "scope": "Scope 2"}
    },
    {
        "case_id": "ATLAS-02",
        "document_name": "Meghna_Petroleum_Diesel_Challan_CH9921.pdf",
        "category": "Scope 1 Stationary Combustion",
        "raw_text": "MEGHNA PETROLEUM LTD - Depot Gate Pass & Delivery Slip. Consignee: Dexterity Textiles Boiler Station 1. High Speed Diesel (HSD) delivered: 14,200 Liters via Bowzer Tanker DH-KA-819.",
        "ground_truth": {"param": "diesel", "value": 14200.0, "unit": "Liters", "scope": "Scope 1"}
    },
    {
        "case_id": "ATLAS-03",
        "document_name": "Padma_Oil_Octane95_Fleet_Voucher_Q2.xlsx",
        "category": "Scope 1 Mobile Combustion",
        "raw_text": "Corporate Logistics Division: Monthly fuel log for 14 factory employee shuttles and 6 cargo delivery vans. Total Octane-95 drawn: 4,800 Liters.",
        "ground_truth": {"param": "petrol", "value": 4800.0, "unit": "Liters", "scope": "Scope 1"}
    },
    {
        "case_id": "ATLAS-04",
        "document_name": "Jamuna_Gas_Commercial_LPG_Refill.pdf",
        "category": "Scope 1 Heating & Auxiliary",
        "raw_text": "Jamuna Gas & Chemicals Invoice. Supplied 45 commercial cylinders of 45kg liquefied petroleum gas (LPG) for plant canteen and ironing boilers. Net weight: 1,950 kg LPG.",
        "ground_truth": {"param": "lpg", "value": 1950.0, "unit": "kg", "scope": "Scope 1"}
    },
    {
        "case_id": "ATLAS-05",
        "document_name": "DEPZ_Biometric_Worker_Roster_Q2.csv",
        "category": "Scope 3 Employee Commuting",
        "raw_text": "Human Resources Payroll Report Q2 2026. Permanent registered factory workforce on roll: 148 employees across shift A and shift B.",
        "ground_truth": {"param": "employees", "value": 148.0, "unit": "Staff", "scope": "Scope 3"}
    },
    {
        "case_id": "ATLAS-06",
        "document_name": "Biman_Bangladesh_Corporate_Travel_Ledger.pdf",
        "category": "Scope 3 Business Travel",
        "raw_text": "Executive Sales & Marketing Air Travel Ledger. London and Frankfurt buyer summits: 8 roundtrips totaling 82,000 passenger-kilometers.",
        "ground_truth": {"param": "airTravel", "value": 82000.0, "unit": "km", "scope": "Scope 3"}
    },
    {
        "case_id": "ATLAS-07",
        "document_name": "N1_Highway_Chattogram_Port_Challan.pdf",
        "category": "Scope 3 Upstream Freight",
        "raw_text": "Prime Mover Freight Log. 12 forty-foot export containers dispatched from DEPZ to Chattogram Port via Dhaka-Chattogram N1 highway: 39,000 ton-kilometers.",
        "ground_truth": {"param": "truckTransport", "value": 39000.0, "unit": "T-Km", "scope": "Scope 3"}
    },
    {
        "case_id": "ATLAS-08",
        "document_name": "Raw_Yarn_Import_LC_Manifest_8819.pdf",
        "category": "Scope 3 Purchased Goods",
        "raw_text": "Customs Clearance Bill of Entry: 580 metric tons of virgin composite yarn received from Chittagong seaport bonded warehouse.",
        "ground_truth": {"param": "rawMaterials", "value": 580.0, "unit": "Tons", "scope": "Scope 3"}
    },
    {
        "case_id": "ATLAS-09",
        "document_name": "DPDC_Tejgaon_Commercial_Utility_Bill.pdf",
        "category": "Scope 2 Purchased Electricity",
        "raw_text": "DHAKA POWER DISTRIBUTION COMPANY (DPDC). Commercial LT tariff account. Net recorded billing units: 48,500 kWh for Tejgaon warehouse.",
        "ground_truth": {"param": "electricity", "value": 48500.0, "unit": "kWh", "scope": "Scope 2"}
    },
    {
        "case_id": "ATLAS-10",
        "document_name": "Petrobangla_CNG_Fleet_Fueling_Log.xlsx",
        "category": "Scope 1 Mobile Combustion",
        "raw_text": "Navana CNG Station refueling slip. Total compressed natural gas supplied to light transport vans: 3,400 kg CNG.",
        "ground_truth": {"param": "cng", "value": 3400.0, "unit": "kg", "scope": "Scope 1"}
    }
]

def run_atlas_eval_suite() -> Dict[str, Any]:
    """Evaluate the actual rules parser on synthetic text; never replace a failure with its label."""
    started = time.perf_counter()
    cases = []
    for case in ATLAS_GROUND_TRUTH_CASES:
        gt = case['ground_truth']
        actual = regex_heuristic_extraction(case['raw_text'])
        detail = next((d for d in actual['details'] if d['param_name'] == gt['param']), None)
        value = actual['parameters'].get(gt['param']) if detail else None
        unit, scope = (detail['unit'], detail['scope']) if detail else (None, None)
        snippet = detail['raw_snippet'] if detail else ''
        cases.append({
            'case_id': case['case_id'], 'document_name': case['document_name'], 'category': case['category'],
            'ground_truth': gt, 'extracted': {'param': gt['param'], 'value': value, 'unit': unit, 'scope': scope},
            'raw_snippet': snippet, 'confidence': None, 'method': actual['method'],
            'value_exact_match': value is not None and abs(value - gt['value']) < 0.01,
            'scope_match': scope == gt['scope'], 'unit_match': unit == gt['unit'],
            'citation_match': bool(snippet) and snippet in case['raw_text'],
        })
    total = len(cases)
    def percentage(key):
        return round(100 * sum(c[key] for c in cases) / total, 1) if total else 0
    return {
        'suite_name': 'CarbonOS synthetic rules-extraction regression', 'benchmark_version': '2026.3.0',
        'tested_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'total_test_cases': total,
        'data_classification': 'SYNTHETIC_TEXT_FIXTURES', 'extraction_method': 'regex',
        'limitations': 'In-file synthetic text, not real invoices, OCR, a RAG evaluation, or an accuracy estimate for customer data.',
        'metrics': {
            'parameter_accuracy_pct': percentage('value_exact_match'),
            'scope_classification_pct': percentage('scope_match'), 'unit_accuracy_pct': percentage('unit_match'),
            'citation_fidelity_pct': percentage('citation_match'),
            'overall_f1_score': None, 'average_confidence': None,
            'latency_ms': round((time.perf_counter() - started) * 1000, 2),
        }, 'test_results': cases,
    }
