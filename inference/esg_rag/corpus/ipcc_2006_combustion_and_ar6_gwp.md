---
authored_by: "AI Agent"
claimed_derivation_unverified:
  - "2006 IPCC Guidelines for National Greenhouse Gas Inventories, Vol 2 Energy"
  - "IPCC Sixth Assessment Report (AR6) WG1 Chapter 7 Table 7.15"
verbatim: false
---

# IPCC 2006 Stationary & Mobile Combustion & AR6 GWP Values

**Publisher**: Intergovernmental Panel on Climate Change (IPCC)  
**Year**: 2006 / 2021  
**Version**: 2006 Guidelines for National GHG Inventories (Vol. 2 Energy) & Sixth Assessment Report (AR6 WG1 Ch. 7)  
**License**: United Nations Public Domain / IPCC Terms of Use  
**URL**: https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html  

## 1. IPCC 2006 Default Fuel Emission Factors (Vol. 2 Ch. 2 Table 2.2)

The 2006 IPCC Guidelines provide default Net Calorific Values (NCVs) and emission factors for stationary combustion.

| Fuel Name | Typical NCV (TJ/Gg) | CO2 Factor (kg CO2 / TJ) | CH4 Factor (kg CH4 / TJ) | N2O Factor (kg N2O / TJ) | Uncertainty (95% CI) |
|---|---|---|---|---|---|
| Natural Gas | 48.0 | 56,100 | 1.0 | 0.1 | CO2: ±2%, CH4: ±50% |
| Gas / Diesel Oil (HSD) | 43.0 | 74,100 | 3.0 | 0.6 | CO2: ±2%, CH4: ±50% |
| Motor Gasoline (Petrol) | 44.3 | 69,300 | 3.0 | 0.6 | CO2: ±2%, CH4: ±50% |
| Residual Fuel Oil (HFO) | 40.4 | 77,400 | 3.0 | 0.6 | CO2: ±3%, CH4: ±50% |
| Sub-bituminous Coal | 18.9 | 96,100 | 1.0 | 1.5 | CO2: ±4%, CH4: ±100% |
| Liquefied Petroleum Gas (LPG) | 47.3 | 63,100 | 1.0 | 0.1 | CO2: ±3%, CH4: ±50% |

### Calculation Formula for Stationary Combustion
$$\text{Emissions}_{\text{gas}} (\text{kg}) = \text{Fuel Consumed} (\text{physical}) \times \text{NCV} (\text{TJ/physical unit}) \times \text{Emission Factor}_{\text{gas}} (\text{kg/TJ})$$
$$\text{Total Emissions} (\text{kg CO}_2\text{e}) = \sum_{\text{gas}} \left( \text{Emissions}_{\text{gas}} \times \text{GWP}_{\text{gas}} \right)$$

## 2. IPCC Sixth Assessment Report (AR6) 100-Year Global Warming Potentials (GWPs)

The IPCC Sixth Assessment Report (AR6, Working Group I, Chapter 7, Table 7.15) establishes updated 100-year GWPs without climate-carbon feedback:

| Greenhouse Gas | Chemical Formula | SAR (1995) GWP | AR4 (2007) GWP | AR5 (2014) GWP | AR6 (2021) GWP |
|---|---|---|---|---|---|
| Carbon Dioxide | CO2 | 1 | 1 | 1 | 1 |
| Methane (fossil) | CH4 | 21 | 25 | 28 | 29.8 |
| Nitrous Oxide | N2O | 310 | 298 | 265 | 273 |
| HFC-134a | CH2FCF3 | 1,300 | 1,430 | 1,300 | 1,530 |
| HFC-32 | CH2F2 | 650 | 675 | 677 | 771 |
| HFC-125 | C2HF5 | 2,800 | 3,500 | 3,170 | 3,740 |
| R-410A (blend) | 50% HFC-32 / 50% HFC-125 | 1,725 | 2,088 | 1,924 | 2,256 |
| Sulfur Hexafluoride | SF6 | 23,900 | 22,800 | 23,500 | 25,200 |

CarbonOS standardizes on AR6 as the primary inventory basis per international practice. When comparing across reporting periods, mixed GWP basis is strictly flagged as `MIXED_GWP_BASIS`.

