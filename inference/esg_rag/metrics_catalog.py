"""
E/S/G metric definitions (aggregated organization/facility figures only).

Privacy rule: only aggregated counts and totals are accepted — never records about individuals.
Sensitive breakdowns (gender) are optional dimensions; injuries are counts without personal detail.
Units are fixed per metric so values are comparable across facilities and periods.
"""
from decimal import Decimal

# key -> definition. dimensions: {name: allowed values}; kind: decimal | integer | percent | boolean
METRICS = {
    # Environmental
    "water_withdrawal": {"pillar": "E", "name": "Water withdrawal", "unit": "m3", "kind": "decimal",
                         "dimensions": {"source": ["surface_water", "groundwater", "third_party", "seawater", "produced_water"]}},
    "water_discharge": {"pillar": "E", "name": "Water discharge", "unit": "m3", "kind": "decimal",
                        "dimensions": {"destination": ["surface_water", "groundwater", "third_party", "seawater"]}},
    "waste_generated": {"pillar": "E", "name": "Waste generated", "unit": "t", "kind": "decimal",
                        "dimensions": {"hazardous": ["yes", "no"],
                                       "treatment": ["recycled", "reused", "composted", "incinerated", "landfilled", "other"]}},
    # Social (aggregated)
    "employees_headcount": {"pillar": "S", "name": "Employees at period end (headcount)", "unit": "people", "kind": "integer",
                            "dimensions": {"gender": ["female", "male", "other", "not_disclosed"]}, "sensitive": True},
    "new_hires": {"pillar": "S", "name": "New employee hires", "unit": "people", "kind": "integer", "dimensions": {}},
    "employee_departures": {"pillar": "S", "name": "Employee departures", "unit": "people", "kind": "integer", "dimensions": {}},
    "training_hours": {"pillar": "S", "name": "Training hours delivered", "unit": "hours", "kind": "decimal", "dimensions": {}},
    "hours_worked": {"pillar": "S", "name": "Hours worked", "unit": "hours", "kind": "decimal", "dimensions": {}},
    "recordable_injuries": {"pillar": "S", "name": "Recordable work-related injuries", "unit": "cases", "kind": "integer", "dimensions": {}},
    "lost_time_injuries": {"pillar": "S", "name": "Lost-time injuries", "unit": "cases", "kind": "integer", "dimensions": {}},
    "work_related_fatalities": {"pillar": "S", "name": "Work-related fatalities", "unit": "cases", "kind": "integer", "dimensions": {}},
    "grievances_received": {"pillar": "S", "name": "Grievances received", "unit": "cases", "kind": "integer", "dimensions": {}},
    # Governance
    "board_members": {"pillar": "G", "name": "Board members", "unit": "people", "kind": "integer",
                      "dimensions": {"independent": ["yes", "no"], "gender": ["female", "male", "other", "not_disclosed"]}},
    "board_meetings": {"pillar": "G", "name": "Board meetings held", "unit": "meetings", "kind": "integer", "dimensions": {}},
    "ethics_training_completion": {"pillar": "G", "name": "Employees completing ethics training", "unit": "%", "kind": "percent", "dimensions": {}},
    "anti_bribery_policy": {"pillar": "G", "name": "Anti-bribery policy in place", "unit": "yes/no", "kind": "boolean", "dimensions": {}},
    "confirmed_corruption_incidents": {"pillar": "G", "name": "Confirmed incidents of corruption", "unit": "cases", "kind": "integer", "dimensions": {}},
}


class MetricError(ValueError):
    pass


def validate(metric_key: str, value: Decimal, dimensions: dict) -> str:
    """Validates value and dimensions; returns the canonical dimension key used for duplicate detection."""
    m = METRICS.get(metric_key)
    if m is None:
        raise MetricError(f"Unknown metric '{metric_key}'")
    if value < 0:
        raise MetricError("Value must not be negative")
    if m["kind"] in ("integer", "boolean") and value != value.to_integral_value():
        raise MetricError(f"{m['name']} must be a whole number")
    if m["kind"] == "boolean" and value not in (0, 1):
        raise MetricError(f"{m['name']} is yes (1) or no (0)")
    if m["kind"] == "percent" and value > 100:
        raise MetricError("Percentages must be between 0 and 100")
    for name, v in (dimensions or {}).items():
        allowed = m["dimensions"].get(name)
        if allowed is None:
            raise MetricError(f"'{name}' is not a breakdown of {m['name']}")
        if v not in allowed:
            raise MetricError(f"'{v}' is not an allowed value for {name}")
    return "|".join(f"{k}={dimensions[k]}" for k in sorted(dimensions or {}))
