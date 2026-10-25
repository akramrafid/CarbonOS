import os
import re
import json
import requests
from typing import Dict, Any, List
from .config import GEMINI_API_KEY, GEMINI_MODEL

EXTRACTION_PROMPT = """You are an expert ESG Carbon Accounting Auditor AI for Bangladesh.
Analyze the following corporate document text (e.g. utility bill, financial expense report, freight invoice, or ESG disclosure).
Extract the quantitative consumption/activity metrics required for the GHG Protocol Corporate Standard emissions calculation.

Target parameters to extract:
- diesel: Volume in LITERS (Scope 1 stationary/mobile combustion)
- petrol: Volume in LITERS (Scope 1 fleet vehicles)
- lpg: Weight in KILOGRAMS (Scope 1 heating/kitchen/generators)
- electricity: Consumption in KILOWATT-HOURS (kWh) (Scope 2 purchased electricity)
- employees: Headcount or commute headcount (Scope 3 Category 7)
- airTravel: Distance in KILOMETERS (km) (Scope 3 Category 6 business travel)
- truckTransport: Freight in TONNE-KILOMETERS (t-km) (Scope 3 Category 4/9 transport)
- rawMaterials: Production input in METRIC TONS (Scope 3 Category 1 purchased goods)

STRICT AUDIT ACCURACY RULES:
1. Only extract numbers explicitly backed by the provided document text. If a metric is NOT mentioned, set its value to 0.
2. For every non-zero extracted parameter, provide the exact verbatim snippet from the document, and the page number where it appears.
3. Assign a confidence score (0.0 to 1.0) based on how clearly the unit and value were stated.

DOCUMENT TEXT:
{document_text}

Return your response strictly as valid JSON matching this schema:
{{
  "parameters": {{
    "diesel": 0.0,
    "petrol": 0.0,
    "lpg": 0.0,
    "electricity": 0.0,
    "employees": 0.0,
    "airTravel": 0.0,
    "truckTransport": 0.0,
    "rawMaterials": 0.0
  }},
  "details": [
    {{
      "param_name": "electricity",
      "value": 156000.0,
      "unit": "kWh",
      "scope": "Scope 2",
      "source_page": 1,
      "raw_snippet": "Total power bill for Dhaka plant: 156,000 kWh",
      "confidence": 0.98
    }}
  ],
  "summary": "Audited extraction summary of activities found in this statement.",
  "overall_confidence": 0.95
}}
"""

def extract_parameters_with_gemini(document_text: str) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    prompt = EXTRACTION_PROMPT.format(document_text=document_text[:12000])

    models = [GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
    last_err = None

    for m in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                result = res.json()
                content = result['candidates'][0]['content']['parts'][0]['text']
                return json.loads(content)
            else:
                last_err = f"Status {res.status_code}: {res.text}"
        except Exception as e:
            last_err = str(e)

    raise RuntimeError(f"Gemini parameter extraction failed. Last error: {last_err}")

def regex_heuristic_extraction(document_text: str) -> Dict[str, Any]:
    """
    Fallback deterministic pattern extractor for CSV/Excel bills or offline runs.
    """
    params = {
        "diesel": 0.0,
        "petrol": 0.0,
        "lpg": 0.0,
        "electricity": 0.0,
        "employees": 0.0,
        "airTravel": 0.0,
        "truckTransport": 0.0,
        "rawMaterials": 0.0
    }
    details = []

    patterns = {
        "diesel": (r'(?i)(?:diesel|generator fuel)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:l|liter|litres)?', "Liters", "Scope 1"),
        "petrol": (r'(?i)(?:petrol|gasoline|octane)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:l|liter|litres)?', "Liters", "Scope 1"),
        "lpg": (r'(?i)(?:lpg|propane|cylinder)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kg|kilograms)?', "kg", "Scope 1"),
        "electricity": (r'(?i)(?:electricity|power|grid|desco|dpdc|reb)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kwh|units)?', "kWh", "Scope 2"),
        "employees": (r'(?i)(?:headcount|employee|workers|staff)[\s:]*([0-9,]+)', "Staff", "Scope 3"),
        "airTravel": (r'(?i)(?:flight|air\s*travel|aviation)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:km)?', "km", "Scope 3"),
        "truckTransport": (r'(?i)(?:truck|freight|cargo|logistics)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:t-?km|ton-?km)?', "T-Km", "Scope 3"),
        "rawMaterials": (r'(?i)(?:raw\s*material|yarn|steel|plastic|fabric)[\s:]*([0-9,]+(?:\.[0-9]+)?)\s*(?:ton|tons|mt)?', "Tons", "Scope 3")
    }

    for key, (pattern, unit, scope) in patterns.items():
        match = re.search(pattern, document_text)
        if match:
            raw_val = match.group(1).replace(',', '')
            try:
                val = float(raw_val)
                params[key] = val
                snippet_start = max(0, match.start() - 30)
                snippet_end = min(len(document_text), match.end() + 30)
                details.append({
                    "param_name": key,
                    "value": val,
                    "unit": unit,
                    "scope": scope,
                    "source_page": 1,
                    "raw_snippet": document_text[snippet_start:snippet_end].replace('\n', ' ').strip(),
                    "confidence": None  # rule match: no model confidence exists
                })
            except ValueError:
                pass

    return {
        "parameters": params,
        "details": details,
        "summary": f"Rule-based parser matched {len(details)} activity value(s). Values require human review.",
        "overall_confidence": None,
        "method": "regex",
        "status": "METRICS_DETECTED" if details else "NO_METRICS_DETECTED",
    }

def llm_extraction_enabled() -> bool:
    """Customer documents go to an external LLM only when the operator has explicitly enabled it
    (processing terms and customer consent are an operator responsibility)."""
    return os.getenv("ESG_LLM_EXTRACTION_ENABLED", "").lower() == "true"


def extract_footprint_from_text(document_text: str) -> Dict[str, Any]:
    """
    Rule-based extraction by default. Gemini is used only when explicitly enabled; if it fails
    the rule-based parser runs. Neither path invents values: unmatched parameters stay 0.
    """
    if llm_extraction_enabled():
        try:
            res = extract_parameters_with_gemini(document_text)
            res["method"] = "llm"
            return res
        except Exception as e:
            print(f"[ESG Extractor] LLM extraction failed ({type(e).__name__}); using rule-based parser")
    return regex_heuristic_extraction(document_text)


# =====================================================================
# UNIVERSAL MULTI-SEGMENT PDF UTILITY INVOICE DETECTOR & CALCULATOR
# =====================================================================

UTILITY_SEGMENT_RULES = [
    {
        "id": "elec_offpeak",
        "name": "Off-Peak Energy Consumption",
        "type": "Electricity & Grid Power",
        "scope": "Scope 2",
        "pattern": r'(?i)(?:off[- ]?peak(?:\s+energy|\s+units)?|flat\s+energy)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kwh|units)?',
        "unit": "kWh",
        "factor": 0.550,
        "factor_citation": "Bangladesh DoE Grid Baseline Gazette Ref: 22.02.0000.018.99.001.23"
    },
    {
        "id": "elec_peak",
        "name": "Peak Hour Energy (17:00 - 23:00)",
        "type": "Electricity & Grid Power",
        "scope": "Scope 2",
        "pattern": r'(?i)(?:(?<![-\w])peak(?:\s+hour)?(?:\s+energy|\s+units)?)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kwh|units)?',
        "unit": "kWh",
        "factor": 0.620,
        "factor_citation": "DoE Grid Peak Generation Surcharge Model (Peaking Gas Turbines)"
    },
    {
        "id": "solar_netmeter",
        "name": "Rooftop Solar Net-Metering Credit",
        "type": "Renewable Generation",
        "scope": "Scope 2 (Avoided / Credit)",
        "pattern": r'(?i)(?:solar\s+export|net[- ]?metering|solar\s+generation|solar\s+inflow)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kwh|units)?',
        "unit": "kWh",
        "factor": -0.550,
        "factor_citation": "SREDA Bangladesh Net-Metering Guidelines & DoE Displacement Factor"
    },
    {
        "id": "demand_charge",
        "name": "Sanctioned Maximum Demand",
        "type": "Grid Capacity Tariff",
        "scope": "Infrastructure Surcharge",
        "pattern": r'(?i)(?:maximum\s+demand|sanctioned\s+demand|billing\s+demand)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kw|kva)?',
        "unit": "kVA",
        "factor": 0.0,
        "factor_citation": "BERC Tariff Schedule (Infrastructure Capacity Allocation)"
    },
    {
        "id": "power_factor_penalty",
        "name": "Power Factor Reactive Surcharge",
        "type": "Grid Efficiency",
        "scope": "Scope 2 (Line Losses)",
        "pattern": r'(?i)(?:power\s+factor(?:\s+penalty|\s+surcharge)?|reactive\s+power)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kvarh|units|bdt)?',
        "unit": "kVARh",
        "factor": 0.080,
        "factor_citation": "Substation Power Factor Correction & Transmission Line Loss Factor"
    },
    {
        "id": "natural_gas",
        "name": "Captive Natural Gas / Boilers",
        "type": "Fossil Fuel Combustion",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:natural\s+gas|gas\s+consumption|titas|karnaphuli|cng)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:m3|cubic\s*meter|mmbtu|mcf)?',
        "unit": "m³",
        "factor": 2.020,
        "factor_citation": "Petrobangla & DoE Gas Emission Factor Ref: 22.02.0000.018.99.001.23"
    },
    {
        "id": "captive_diesel",
        "name": "High-Speed Diesel (HSD) Backup Genset",
        "type": "Fossil Fuel Combustion",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:diesel|hsd|generator\s+fuel|backup\s+genset)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:l|liter|litres)?',
        "unit": "Liters",
        "factor": 2.680,
        "factor_citation": "Bangladesh DoE High Speed Diesel Gazette Notice 2023"
    },
    {
        "id": "fleet_octane",
        "name": "Fleet Octane-95 / Petrol",
        "type": "Mobile Transport",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:octane|petrol|motor\s+spirit|fleet\s+fuel)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:l|liter|litres)?',
        "unit": "Liters",
        "factor": 2.310,
        "factor_citation": "BPC / DoE Motor Spirit & Octane Factor Gazette 2023"
    },
    {
        "id": "commercial_lpg",
        "name": "Commercial LPG / Kitchen Auxiliary",
        "type": "Fossil Fuel Combustion",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:lpg|propane|gas\s+cylinder|autogas)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kg|cylinders)?',
        "unit": "kg",
        "factor": 2.980,
        "factor_citation": "DoE Liquefied Petroleum Gas Standard Factor"
    },
    {
        "id": "saturated_steam",
        "name": "Industrial High-Pressure Saturated Steam",
        "type": "Thermal Energy",
        "scope": "Scope 2",
        "pattern": r'(?i)(?:steam|saturated\s+steam|boiler\s+steam)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:ton|tons|mt|klbs)?',
        "unit": "Metric Tons",
        "factor": 180.0,
        "factor_citation": "GHG Protocol Scope 2 Guidance for Purchased Industrial Steam"
    },
    {
        "id": "wasa_water",
        "name": "Municipal WASA / Deep Tubewell Water",
        "type": "Water & Utility",
        "scope": "Scope 3 (Cat 1)",
        "pattern": r'(?i)(?:water(?:\s+consumption|\s+supply)?|wasa|deep\s+tube\s*well)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:m3|cubic\s*meter|k\s*liters)?',
        "unit": "m³",
        "factor": 0.344,
        "factor_citation": "DEFRA / Water Supply Pumping & Treatment Carbon Metric"
    },
    {
        "id": "etp_effluent",
        "name": "Effluent Treatment Plant (ETP) Discharge",
        "type": "Effluent & Wastewater",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:effluent|etp|waste\s*water|cod\s+discharge)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:m3|cubic\s*meter)?',
        "unit": "m³",
        "factor": 0.780,
        "factor_citation": "IPCC Wastewater Treatment & Anaerobic Discharge Standard"
    },
    {
        "id": "refrigerants_hvac",
        "name": "HVAC Chiller Refrigerant Top-Up (R-410A)",
        "type": "Fugitive Emissions",
        "scope": "Scope 1",
        "pattern": r'(?i)(?:refrigerant|r[- ]?410a|r[- ]?134a|chiller\s+gas|freon)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:kg)?',
        "unit": "kg",
        "factor": 2088.0,
        "factor_citation": "IPCC AR6 Global Warming Potential (GWP) for R-410A"
    },
    {
        "id": "port_freight",
        "name": "Chittagong Port Container Drayage Freight",
        "type": "Logistics & Transport",
        "scope": "Scope 3 (Cat 4)",
        "pattern": r'(?i)(?:freight|container\s+drayage|port\s+logistics|truck\s+haulage)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:t-?km|ton-?km)?',
        "unit": "Ton-Km",
        "factor": 0.200,
        "factor_citation": "Smart Freight Centre GLEC Heavy Goods Road Transport Factor"
    },
    {
        "id": "solid_waste",
        "name": "Industrial Process Waste to Landfill",
        "type": "Waste & Disposal",
        "scope": "Scope 3 (Cat 5)",
        "pattern": r'(?i)(?:solid\s+waste|refuse|landfill\s+waste|disposal)[\s:=]*([0-9,]+(?:\.[0-9]+)?)\s*(?:ton|tons|mt)?',
        "unit": "Tons",
        "factor": 450.0,
        "factor_citation": "DoE Municipal Solid Waste Methane Generation Standard"
    }
]


# Segments that are reported but never added to the GHG inventory totals.
NON_INVENTORY_SEGMENTS = {
    "solar_netmeter": "Exported/avoided electricity is reported separately and never netted against Scope 2 (GHG Protocol Scope 2 Guidance).",
    "demand_charge": "Capacity charge (kVA) is not an energy quantity; no emissions.",
    "power_factor_penalty": "Reactive energy (kVARh) is not consumed energy; emissions are already in the kWh lines.",
}


def detect_all_utility_segments(document_text: str, client_id: str = None) -> Dict[str, Any]:
    """
    Detects utility line items that are literally present in the document text and applies the
    rule's factor. Nothing is invented: unmatched segments are absent, invoice metadata and costs
    are not guessed, and the result always requires human review.
    client_id is accepted for backward compatibility and ignored.
    """
    detected_segments = []
    excluded_segments = []
    scope_totals = {"Scope 1": 0.0, "Scope 2": 0.0, "Scope 3": 0.0}

    for rule in UTILITY_SEGMENT_RULES:
        match = re.search(rule["pattern"], document_text or "")
        if not match:
            continue
        try:
            qty = float(match.group(1).replace(',', ''))
        except ValueError:
            continue
        if qty <= 0:
            continue

        s_start = max(0, match.start() - 35)
        s_end = min(len(document_text), match.end() + 35)
        segment = {
            "segment_id": rule["id"],
            "segment_name": rule["name"],
            "utility_type": rule["type"],
            "quantity": qty,
            "unit": rule["unit"],
            "scope": rule["scope"],
            "emission_factor": rule["factor"],
            "factor_citation": rule["factor_citation"],
            "factor_status": "UNVERIFIED",
            "source_page": None,
            "raw_snippet": document_text[s_start:s_end].replace('\n', ' ').strip(),
        }

        if rule["id"] in NON_INVENTORY_SEGMENTS:
            segment["excluded_reason"] = NON_INVENTORY_SEGMENTS[rule["id"]]
            excluded_segments.append(segment)
            continue

        emissions_t = qty * rule["factor"] / 1000.0
        segment["emissions_kg"] = round(qty * rule["factor"], 2)
        segment["emissions_tco2e"] = round(emissions_t, 3)
        for scope in scope_totals:
            if rule["scope"].startswith(scope):
                scope_totals[scope] += emissions_t
        detected_segments.append(segment)

    return {
        "segments": detected_segments,
        "excluded_segments": excluded_segments,
        "total_segments_detected": len(detected_segments),
        "total_emissions_tco2e": round(sum(scope_totals.values()), 3),
        "scope_breakdown": {
            "scope1_tco2e": round(scope_totals["Scope 1"], 3),
            "scope2_tco2e": round(scope_totals["Scope 2"], 3),
            "scope3_tco2e": round(scope_totals["Scope 3"], 3),
        },
        "review_status": "REVIEW_REQUIRED",
        "method_note": "Rule-based text match with unverified factors; not an audited or verified result.",
        "status": "SEGMENTS_DETECTED" if detected_segments or excluded_segments else "NO_SEGMENTS_DETECTED",
    }
