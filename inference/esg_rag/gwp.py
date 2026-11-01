"""
100-year global warming potentials (GWP-100) pinned by methodology version.

GWPs are IPCC metric values, not emission factors: they are versioned with the methodology and cited
here, so the factor registry's second-person approval is not needed for them.

Sources (read from the primary PDFs; see docs/esg/ACCOUNTING_METHODOLOGY.md for SHA-256 hashes):
* AR6: IPCC AR6 WG1 Chapter 7, Table 7.15 (CH4-fossil 29.8, CH4-non fossil 27.0, N2O 273) and
  Supplementary Material Table 7.SM.7 (halocarbons, as used by the GHG Protocol AR6 GWP list).
* AR5: IPCC AR5 WG1 Chapter 8, Appendix Table 8.A.1 (no climate-carbon feedback; methane 28, fossil 30).
Blend compositions are mass fractions of the ASHRAE 34 designations.
"""
from decimal import Decimal
from typing import Dict, Optional, Tuple

D = Decimal

GWP100: Dict[str, Dict[str, Decimal]] = {
    "AR6": {
        "CO2": D(1), "CH4_fossil": D("29.8"), "CH4_non_fossil": D("27.0"), "N2O": D(273),
        "HFC-23": D(14600), "HFC-32": D(771), "HFC-125": D(3740), "HFC-134a": D(1530), "HFC-143a": D(5810),
        "HFC-152a": D(164), "HCFC-22": D(1960),
    },
    "AR5": {
        "CO2": D(1), "CH4_fossil": D(30), "CH4_non_fossil": D(28), "N2O": D(265),
        "HFC-23": D(12400), "HFC-32": D(677), "HFC-125": D(3170), "HFC-134a": D(1300), "HFC-143a": D(4800),
        "HFC-152a": D(138), "HCFC-22": D(1760),
    },
}
DEFAULT_BASIS = "AR6"

# Combustion gases a gas-level factor may carry. CO2_biogenic is reported outside the scopes.
COMBUSTION_GASES = ("CO2", "CO2_biogenic", "CH4_fossil", "CH4_non_fossil", "N2O")
BIOGENIC = "CO2_biogenic"

BLENDS: Dict[str, Dict[str, Decimal]] = {
    "R-410A": {"HFC-32": D("0.50"), "HFC-125": D("0.50")},
    "R-407C": {"HFC-32": D("0.23"), "HFC-125": D("0.25"), "HFC-134a": D("0.52")},
    "R-404A": {"HFC-125": D("0.44"), "HFC-143a": D("0.52"), "HFC-134a": D("0.04")},
}
ALIASES = {"R-23": "HFC-23", "R-32": "HFC-32", "R-125": "HFC-125", "R-134a": "HFC-134a", "R-143a": "HFC-143a",
           "R-152a": "HFC-152a", "R-22": "HCFC-22"}
# Ozone-depleting HCFCs are Montreal Protocol gases: reported separately, never in the Scope 1 total.
MONTREAL_PROTOCOL_GASES = ("HCFC-22",)


def gas_gwp(gas: str, basis: str) -> Optional[Decimal]:
    return GWP100.get(basis, {}).get(gas)


def refrigerant_composition(name: str) -> Optional[Dict[str, Decimal]]:
    """Mass fractions of the pure gases in a refrigerant (pure gas → {gas: 1})."""
    if name in BLENDS:
        return BLENDS[name]
    gas = ALIASES.get(name, name)
    return {gas: D(1)} if gas in GWP100[DEFAULT_BASIS] and gas not in COMBUSTION_GASES else None


def refrigerant_gwp(name: str, basis: str) -> Tuple[Optional[Decimal], bool]:
    """(GWP-100 of the refrigerant, is_montreal_protocol_gas). GWP is None if unknown or basis unsupported."""
    comp = refrigerant_composition(name)
    if comp is None or basis not in GWP100:
        return None, False
    montreal = any(g in MONTREAL_PROTOCOL_GASES for g in comp)
    return sum((share * GWP100[basis][g] for g, share in comp.items()), D(0)), montreal
