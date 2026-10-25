# CarbonOS ESG SaaS — Emission Factor Source Register

**Version:** 2026.1  
**Regulatory Jurisdiction:** Bangladesh Department of Environment (DoE) & GHG Protocol Corporate Standard  
**Data Status:** Grounded Gazette References (No Fabricated Factors)  

---

## 1. Scope 2 Grid Electricity Factors (Bangladesh National Grid)

| Factor Name | Value | Unit | Gas Basis | GWP Version | Provenance / Authority Reference | Notes / Application |
|---|---|---|---|---|---|---|
| **Bangladesh National Grid Electricity Baseline** | `0.637` | `kg CO2e / kWh` | CO2, CH4, N2O | IPCC AR5 (100-yr) | Department of Environment (DoE) Gazette Memo Ref: `22.02.0000.018.99.001.23` | Applies to all grid power off-takers (BPDB, DESCO, DPDC, WZPDCL, BREB) under Scope 2 Location-Based accounting. |
| **Grid Peak Hour Thermal Surcharge Factor** | `0.620` | `kg CO2e / kWh` | CO2 | IPCC AR5 | Bangladesh Energy Regulatory Commission (BERC) Peaking Gas Turbine Schedule | Applied during evening peak hours (17:00 - 23:00) when simple-cycle gas turbines and HFO plants meet peak demand. |
| **Off-Peak Industrial Combined Cycle Baseline** | `0.550` | `kg CO2e / kWh` | CO2 | IPCC AR5 | DoE Combined-Cycle Natural Gas Sub-Cluster Benchmark | Off-peak daytime baseload factor for heavy manufacturing. |
| **Rooftop Solar PV Generation (Avoided Emission)** | `-0.637` | `kg CO2e / kWh` | CO2e | IPCC AR5 | SREDA Bangladesh Net-Metering Guidelines 2018 (amended 2023) | Exported power credit under net-metering tariff. Accounted as avoided generation; never netted out of gross inventory. |

---

## 2. Scope 1 Stationary & Mobile Fossil Fuel Combustion

| Fuel Type | Consumption Unit | Emission Factor (kg CO2e / unit) | Net Calorific Value (NCV) | Source Reference | Calculation Formula |
|---|---|---|---|---|---|
| **High Speed Diesel (HSD) — Captive Generator** | Liter | `2.680` | `35.8 MJ/L` | Bangladesh DoE Stationary Diesel Gazette & 2006 IPCC Guidelines Vol 2 Ch 2 | `Emissions (tCO2e) = (Liters * 2.680) / 1000` |
| **Natural Gas — Industrial Boiler / Turbine** | Standard Cubic Meter ($m^3$) | `2.020` | `38.2 MJ/m³` | Titas Gas & Karnaphuli Gas Distribution Co. (KGDC) Gas Quality Gazette | `Emissions (tCO2e) = (m³ * 2.020) / 1000` |
| **Liquefied Petroleum Gas (LPG)** | Kilogram (kg) | `2.980` | `46.1 MJ/kg` | DEFRA / BEIS Greenhouse Gas Conversion Factors 2024 | `Emissions (tCO2e) = (kg * 2.980) / 1000` |
| **Heavy Fuel Oil (HFO) — Industrial Furnace** | Metric Ton | `3,114.00` | `40.4 MJ/kg` | IPCC Guidelines for National GHG Inventories | `Emissions (tCO2e) = (Tons * 3.114)` |

---

## 3. Scope 3 Category-Specific Activity Factors

| Scope 3 Category | Activity Description | Factor Value | Unit | Citation & Source Provenance |
|---|---|---|---|---|
| **Category 1: Purchased Goods & Services** | Industrial Water Supply Extraction | `0.344` | `kg CO2e / m³` | UK DEFRA Water Supply and Wastewater Treatment Carbon Conversion Factors |
| **Category 4: Upstream Freight Transport** | Heavy-Duty Road Freight Drayage (Port to Factory) | `0.200` | `kg CO2e / Ton-km` | Smart Freight Centre — Global Logistics Emissions Council (GLEC) Framework v3 |
| **Category 5: Waste Generated in Operations** | Industrial Solid Waste to Landfill (Unmanaged) | `450.00` | `kg CO2e / Ton` | IPCC Waste Model — Tropical wet climate with high organic content |
| **Category 6: Business Travel** | Domestic Short-Haul Commercial Aviation | `0.254` | `kg CO2e / pkm` | ICAO Carbon Emissions Calculator Methodology v12 |

---

## 4. Factor Governance & Two-Person Approval

1. **Immutable Versioning:** Every factor entry in `esg_emission_factors` carries a unique ID, effective start date, and publication version. Once published, factors are never overwritten.
2. **Custom Factor Workflow:** Custom factors submitted by a data contributor require second-person review and approval by an ESG Administrator (`esg_admin`) or Auditor (`auditor`) before calculation engine activation.
