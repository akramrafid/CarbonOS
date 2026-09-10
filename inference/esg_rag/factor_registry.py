"""
CarbonOS Emission Factor Registry & Automated Regression Testing Harness
Watershed Lesson: Treating emission factors as typed, versioned software artifacts with regression tests.
"""

from typing import Dict, Any, List, Optional
import copy
import datetime

# Typed Emission Factor Registry
FACTOR_REGISTRY_CATALOG = [
    {
        "factor_id": "EF-BD-DIESEL-01",
        "name": "High-Speed Diesel (HSD) Stationary Combustion",
        "category": "Scope 1",
        "fuel_or_activity": "Diesel",
        "factor_value": 2.68,
        "unit": "kg CO2e / Liter",
        "uncertainty_pct": 2.5,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (National Model)",
        "source_citation": "Department of Environment (DoE) & PetroBangla Energy Statistics",
        "gazette_ref": "DoE Gazette Notification Ref: 22.02.0000.018.99.001.23",
        "effective_date": "2024-01-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-PETROL-01",
        "name": "Motor Spirit / Octane-95 Mobile Combustion",
        "category": "Scope 1",
        "fuel_or_activity": "Petrol",
        "factor_value": 2.31,
        "unit": "kg CO2e / Liter",
        "uncertainty_pct": 3.0,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (National Model)",
        "source_citation": "PetroBangla & Eastern Refinery Standard Density Benchmark",
        "gazette_ref": "DoE ECR 2023 Schedule 4",
        "effective_date": "2024-01-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-LPG-01",
        "name": "Commercial Liquefied Petroleum Gas (LPG)",
        "category": "Scope 1",
        "fuel_or_activity": "LPG",
        "factor_value": 2.98,
        "unit": "kg CO2e / kg",
        "uncertainty_pct": 4.0,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (National Model)",
        "source_citation": "SREDA Industrial Thermal Benchmark 2023",
        "gazette_ref": "SREDA/Audit/Gas/2023-09",
        "effective_date": "2023-07-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-GRID-CM-01",
        "name": "National Electricity Grid Combined Margin (CM)",
        "category": "Scope 2",
        "fuel_or_activity": "Electricity (Location-Based)",
        "factor_value": 0.550,
        "unit": "kg CO2e / kWh",
        "uncertainty_pct": 1.8,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (UNFCCC CDM Tool)",
        "source_citation": "DoE & SREDA Grid Emission Factor Study (FY2022-23 Dispatch Data)",
        "gazette_ref": "Gazette Ref: 22.02.0000.018.99.001.23",
        "effective_date": "2023-11-15",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-GRID-OM-01",
        "name": "National Electricity Grid Operating Margin (OM)",
        "category": "Scope 2",
        "fuel_or_activity": "Electricity (Operating Margin)",
        "factor_value": 0.612,
        "unit": "kg CO2e / kWh",
        "uncertainty_pct": 2.1,
        "version": "v2024.1-HISTORIC",
        "region": "Bangladesh",
        "tier": "Tier 2 (UNFCCC CDM Tool)",
        "source_citation": "BPDB Generation Margin Merit Order Curve",
        "gazette_ref": "BPDB Annual Dispatch Report 2023",
        "effective_date": "2023-01-01",
        "status": "archived"
    },
    {
        "factor_id": "EF-BD-GREEN-TARIFF-01",
        "name": "On-Site Solar PV / SREDA Corporate Green Tariff",
        "category": "Scope 2",
        "fuel_or_activity": "Electricity (Market-Based)",
        "factor_value": 0.120,
        "unit": "kg CO2e / kWh",
        "uncertainty_pct": 5.0,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 3 (Facility PPA)",
        "source_citation": "SREDA Net-Metering Guidelines & IDCOL Solar Standard",
        "gazette_ref": "SREDA-NMP-2022",
        "effective_date": "2024-01-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-COMMUTE-01",
        "name": "Dhaka Industrial Worker Multi-Modal Commute",
        "category": "Scope 3",
        "fuel_or_activity": "Employee Commute",
        "factor_value": 0.400,
        "unit": "tCO2e / employee / year",
        "uncertainty_pct": 6.5,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (Survey Sample N=12,400)",
        "source_citation": "BGMEA & ILO Decent Work Transport Modal Survey",
        "gazette_ref": "ILO-BGMEA-ESG-2023",
        "effective_date": "2024-01-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-FREIGHT-N1-01",
        "name": "Medium-Heavy Goods Vehicle (N1 Dhaka-Chattogram Corridor)",
        "category": "Scope 3",
        "fuel_or_activity": "Road Freight Transport",
        "factor_value": 0.200,
        "unit": "kg CO2e / ton-km",
        "uncertainty_pct": 4.2,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (Highway Telemetry)",
        "source_citation": "Roads & Highways Department (RHD) Bangladesh Logistics Carbon Study",
        "gazette_ref": "RHD/Freight/2023-11",
        "effective_date": "2024-01-01",
        "status": "active"
    },
    {
        "factor_id": "EF-BD-RAW-YARN-01",
        "name": "Composite Cotton-Polyester Yarn Blend (50/50)",
        "category": "Scope 3",
        "fuel_or_activity": "Textile Raw Materials",
        "factor_value": 2.500,
        "unit": "tCO2e / metric ton",
        "uncertainty_pct": 5.8,
        "version": "v2026.1-NATIONAL",
        "region": "Bangladesh",
        "tier": "Tier 2 (BTMA Benchmark)",
        "source_citation": "Bangladesh Textile Mills Association (BTMA) Material Flow Model",
        "gazette_ref": "BTMA-MFA-2023",
        "effective_date": "2024-01-01",
        "status": "active"
    }
]

# Benchmark Customer Footprint Test Fixtures for Regression Testing
REGRESSION_BENCHMARK_CUSTOMERS = [
    {
        "name": "Dexterity Textiles Ltd (DEPZ Gazipur)",
        "sector": "RMG & Apparel Export",
        "activities": {
            "diesel": 14200,
            "petrol": 4800,
            "lpg": 1950,
            "electricity": 156000,
            "employees": 148,
            "airTravel": 82000,
            "truckTransport": 39000,
            "rawMaterials": 580
        }
    },
    {
        "name": "Padma Agro-Processing & Cold Storage (Rajshahi)",
        "sector": "Agriculture & Logistics",
        "activities": {
            "diesel": 8400,
            "petrol": 1200,
            "lpg": 450,
            "electricity": 92000,
            "employees": 65,
            "airTravel": 12000,
            "truckTransport": 52000,
            "rawMaterials": 180
        }
    },
    {
        "name": "Sitakunda Steel & Re-Rolling Mills (Chattogram)",
        "sector": "Heavy Metallurgy",
        "activities": {
            "diesel": 28000,
            "petrol": 3500,
            "lpg": 8200,
            "electricity": 420000,
            "employees": 210,
            "airTravel": 25000,
            "truckTransport": 84000,
            "rawMaterials": 1200
        }
    }
]

def get_catalog_factors_dict() -> Dict[str, float]:
    d = {}
    for item in FACTOR_REGISTRY_CATALOG:
        key = item["fuel_or_activity"].lower()
        if "diesel" in key: d["diesel"] = item["factor_value"]
        elif "petrol" in key: d["petrol"] = item["factor_value"]
        elif "lpg" in key: d["lpg"] = item["factor_value"]
        elif "electricity" in key and "margin" not in key: d["electricity"] = item["factor_value"]
        elif "commute" in key: d["employees"] = item["factor_value"]
        elif "freight" in key: d["truckTransport"] = item["factor_value"]
        elif "raw" in key: d["rawMaterials"] = item["factor_value"]
    d["airTravel"] = 0.12
    return d

def run_factor_regression_test(
    proposed_factors: Dict[str, float],
    tolerance_pct: float = 2.0
) -> Dict[str, Any]:
    """
    Watershed-style regression test:
    Validates proposed emission factor updates against 3 real customer footprints
    before pushing updates to production.
    """
    from .calculation_engine import calculate_activity_footprint

    baseline_factors = get_catalog_factors_dict()
    test_results = []
    has_exceeded_tolerance = False
    max_delta_pct = 0.0

    for customer in REGRESSION_BENCHMARK_CUSTOMERS:
        baseline_res = calculate_activity_footprint(customer["activities"], baseline_factors)
        proposed_res = calculate_activity_footprint(customer["activities"], {**baseline_factors, **proposed_factors})

        base_total = baseline_res["totals"]["location_based_tco2e"]
        prop_total = proposed_res["totals"]["location_based_tco2e"]
        delta_tco2e = round(prop_total - base_total, 3)
        delta_pct = round(((prop_total - base_total) / base_total) * 100, 2) if base_total > 0 else 0.0

        if abs(delta_pct) > abs(max_delta_pct):
            max_delta_pct = delta_pct

        flagged = abs(delta_pct) > tolerance_pct
        if flagged:
            has_exceeded_tolerance = True

        test_results.append({
            "customer_name": customer["name"],
            "sector": customer["sector"],
            "baseline_footprint_tco2e": base_total,
            "proposed_footprint_tco2e": prop_total,
            "delta_tco2e": delta_tco2e,
            "delta_pct": delta_pct,
            "tolerance_pct": tolerance_pct,
            "passed": not flagged,
            "scope_breakdown": {
                "scope1_delta": round(proposed_res["scope1"]["total_tco2e"] - baseline_res["scope1"]["total_tco2e"], 3),
                "scope2_delta": round(proposed_res["scope2"]["location_based_tco2e"] - baseline_res["scope2"]["location_based_tco2e"], 3),
                "scope3_delta": round(proposed_res["scope3"]["total_tco2e"] - baseline_res["scope3"]["total_tco2e"], 3)
            }
        })

    status = "REJECTED_AUDIT_WARNING" if has_exceeded_tolerance else "APPROVED_REGRESSION_PASSED"

    return {
        "status": status,
        "tested_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "customer_count": len(REGRESSION_BENCHMARK_CUSTOMERS),
        "tolerance_threshold_pct": tolerance_pct,
        "max_variance_observed_pct": max_delta_pct,
        "passed_all_gates": not has_exceeded_tolerance,
        "test_cases": test_results,
        "recommendation": (
            "Proposed factor changes exceed the ±2.0% annual recalculation threshold. Require Lead ESG Auditor sign-off."
            if has_exceeded_tolerance else
            "All benchmark customer footprint regressions verified within ISO 14064 tolerance."
        )
    }
