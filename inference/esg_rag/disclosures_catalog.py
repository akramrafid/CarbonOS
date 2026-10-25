"""
Versioned disclosure templates: which CarbonOS data can evidence which framework requirement.

Titles are short paraphrases (no standard text is reproduced). Paragraph/disclosure references must be
checked against the official publications before a customer relies on them — every framework carries
`verification_status: "REFERENCES_TO_BE_VERIFIED"` until a qualified reviewer signs them off.
Coverage of a template is never a compliance determination.

Data sources per requirement:
  ("ghg", key)          key ∈ scope1, scope2_location, scope2_market, methodology — needs a LOCKED snapshot
  ("metric", key)       an APPROVED metric observation in the period (metrics_catalog.METRICS)
  ("unsupported", why)  CarbonOS cannot produce this data yet → always MISSING_DATA unless not applicable
"""

FRAMEWORKS = {
    "GRI": {
        "name": "GRI Standards — selected disclosures",
        "template_version": "carbonos-gri-2025.1",
        "verification_status": "REFERENCES_TO_BE_VERIFIED",
        "materiality": "impact",
        "requirements": [
            {"ref": "GRI 2-9", "title": "Governance structure and composition", "data": [("metric", "board_members")], "narrative": True},
            {"ref": "GRI 205-3", "title": "Confirmed incidents of corruption and actions taken", "data": [("metric", "confirmed_corruption_incidents")], "narrative": True},
            {"ref": "GRI 302-1", "title": "Energy consumption within the organization", "data": [("unsupported", "Fuel energy-content (NCV) conversion is not implemented")], "narrative": False},
            {"ref": "GRI 303-3", "title": "Water withdrawal", "data": [("metric", "water_withdrawal")], "narrative": False},
            {"ref": "GRI 303-4", "title": "Water discharge", "data": [("metric", "water_discharge")], "narrative": False},
            {"ref": "GRI 305-1", "title": "Direct (Scope 1) GHG emissions", "data": [("ghg", "scope1"), ("ghg", "methodology")], "narrative": False},
            {"ref": "GRI 305-2", "title": "Energy indirect (Scope 2) GHG emissions", "data": [("ghg", "scope2_location"), ("ghg", "methodology")], "narrative": False},
            {"ref": "GRI 305-3", "title": "Other indirect (Scope 3) GHG emissions", "data": [("unsupported", "Scope 3 accounting is not implemented")], "narrative": False},
            {"ref": "GRI 306-3", "title": "Waste generated", "data": [("metric", "waste_generated")], "narrative": False},
            {"ref": "GRI 403-9", "title": "Work-related injuries", "data": [("metric", "recordable_injuries"), ("metric", "work_related_fatalities"), ("metric", "hours_worked")], "narrative": False},
            {"ref": "GRI 404-1", "title": "Average hours of training per employee", "data": [("metric", "training_hours"), ("metric", "employees_headcount")], "narrative": False},
            {"ref": "GRI 405-1", "title": "Diversity of governance bodies and employees", "data": [("metric", "board_members"), ("metric", "employees_headcount")], "narrative": False},
        ],
    },
    "IFRS_S2": {
        "name": "IFRS S2 Climate-related Disclosures",
        "template_version": "carbonos-ifrs-s2-2023.1",
        "verification_status": "REFERENCES_TO_BE_VERIFIED",
        "materiality": "financial",
        "requirements": [
            {"ref": "IFRS S2 ¶6", "title": "Governance of climate-related risks and opportunities", "data": [], "narrative": True},
            {"ref": "IFRS S2 ¶10", "title": "Climate-related risks and opportunities", "data": [], "narrative": True},
            {"ref": "IFRS S2 ¶22", "title": "Climate resilience", "data": [], "narrative": True},
            {"ref": "IFRS S2 ¶25", "title": "Risk management processes", "data": [], "narrative": True},
            {"ref": "IFRS S2 ¶29(a)(i)(1)", "title": "Absolute gross Scope 1 GHG emissions", "data": [("ghg", "scope1")], "narrative": False},
            {"ref": "IFRS S2 ¶29(a)(i)(2)", "title": "Absolute gross Scope 2 GHG emissions (location-based)", "data": [("ghg", "scope2_location")], "narrative": False},
            {"ref": "IFRS S2 ¶29(a)(v)", "title": "Contractual instruments informing Scope 2", "data": [("ghg", "scope2_market")], "narrative": True},
            {"ref": "IFRS S2 ¶29(a)(i)(3)", "title": "Absolute gross Scope 3 GHG emissions", "data": [("unsupported", "Scope 3 accounting is not implemented")], "narrative": False},
            {"ref": "IFRS S2 ¶29(a)(iii)", "title": "Approach to measuring GHG emissions", "data": [("ghg", "methodology")], "narrative": True},
            {"ref": "IFRS S2 ¶33", "title": "Climate-related targets", "data": [], "narrative": True},
        ],
    },
}

RESPONSE_STATUSES = ("NOT_STARTED", "NOT_APPLICABLE", "DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED")
COVERAGE_STATEMENT = ("Coverage shows which requirements have supporting data and reviewed responses. "
                      "It is not a compliance determination and does not replace external assurance.")


def requirement(framework: str, ref: str):
    fw = FRAMEWORKS.get(framework)
    return next((r for r in fw["requirements"] if r["ref"] == ref), None) if fw else None
