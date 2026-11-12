/**
 * Preloaded Invoice Templates for Corporate Client Profiles
 */

export const PRELOADED_INVOICE_TEMPLATES = {
  "east-delta-university": {
    filename: "EDU_Campus_BPDB_Solar_NetMeter_Bill.pdf",
    authority: "Bangladesh Power Development Board (BPDB) & WASA",
    period: "May 2026",
    meter: "BPDB-CTG-HT-44910",
    tariff: "E-1 Institutional Educational Tariff",
    raw_text: "EAST DELTA UNIVERSITY CAMPUS OPERATIONS. BPDB Chittagong High Tension Meter: BPDB-CTG-HT-44910. Flat Off-Peak Energy: 142,000 kWh @ 7.80 BDT. Peak Hour Energy: 48,000 kWh @ 11.20 BDT. Rooftop Solar Net-Metering Export Credit: 18,500 kWh @ 7.50 BDT. Maximum Sanctioned Demand: 350 kVA. Campus Bus Backup Diesel Fuel: 2,800 Liters. WASA Deep Tubewell Water Withdrawal: 9,200 m3.",
    segments: [
      { id: "elec_offpeak", name: "Off-Peak Academic Power", type: "Electricity", scope: "Scope 2", qty: 142000, unit: "kWh", factor: null, citation: "Grid-average factor required (none approved)", emissions_t: null, cost_bdt: 1107600, confidence: 0.99, snippet: "Flat Off-Peak Energy: 142,000 kWh @ 7.80 BDT", status: "PENDING_AUDIT" },
      { id: "elec_peak", name: "Peak Hour AC & Labs (17:00-23:00)", type: "Electricity", scope: "Scope 2", qty: 48000, unit: "kWh", factor: null, citation: "Grid-average factor required (none approved)", emissions_t: null, cost_bdt: 537600, confidence: 0.98, snippet: "Peak Hour Energy: 48,000 kWh @ 11.20 BDT", status: "PENDING_AUDIT" },
      { id: "solar_netmeter", name: "Rooftop Solar PV Export Credit", type: "Renewable Generation", scope: "Memo (export, never netted)", qty: 18500, unit: "kWh", factor: null, citation: "Memo item: exported kWh are never subtracted from Scope 2", emissions_t: 0, cost_bdt: 138750, confidence: 1.0, snippet: "Rooftop Solar Net-Metering Export Credit: 18,500 kWh", status: "PENDING_AUDIT" },
      { id: "demand_charge", name: "Sanctioned Campus Demand", type: "Grid Capacity Tariff", scope: "Infrastructure", qty: 350, unit: "kVA", factor: 0.0, citation: "BERC Educational Tariff Schedule", emissions_t: 0.0, cost_bdt: 52500, confidence: 0.97, snippet: "Maximum Sanctioned Demand: 350 kVA", status: "PENDING_AUDIT" },
      { id: "captive_diesel", name: "Campus Generator & Shuttle Diesel", type: "Fossil Fuel", scope: "Scope 1", qty: 2800, unit: "Liters", factor: 2.680, citation: "UNVERIFIED legacy constant", emissions_t: 7.50, cost_bdt: 294000, confidence: 0.96, snippet: "Campus Bus Backup Diesel Fuel: 2,800 Liters", status: "PENDING_AUDIT" },
      { id: "wasa_water", name: "WASA & Campus Tubewell Extraction", type: "Water Supply", scope: "Scope 3 (Cat 1)", qty: 9200, unit: "m³", factor: 0.344, citation: "DEFRA Water Supply Carbon Metric", emissions_t: 3.16, cost_bdt: 386400, confidence: 0.95, snippet: "WASA Deep Tubewell Water Withdrawal: 9,200 m3", status: "PENDING_AUDIT" }
    ]
  },
  "revoo-ev": {
    filename: "Revoo_EV_Assembly_DESCO_Substation_Bill.pdf",
    authority: "Dhaka Electric Supply Company (DESCO)",
    period: "May 2026",
    meter: "DESCO-GZ-HT-8821",
    tariff: "HT-3 Industrial Heavy Manufacturing",
    raw_text: "REVOO ELECTRIC VEHICLES ASSEMBLY PLANT. DESCO Gazipur Substation HT-3 Meter: DESCO-GZ-HT-8821. Off-Peak Assembly Energy: 108,000 kWh @ 9.20 BDT. Battery Formation & High-Rate Pack Charging: 34,000 kWh @ 12.80 BDT. Sanctioned Demand: 500 kVA. Power Factor Reactive Surcharge: 2,800 kVARh. Captive Genset HSD Diesel: 1,200 Liters. Chittagong Port Battery Cell Drayage: 46,000 Ton-km.",
    segments: [
      { id: "elec_offpeak", name: "Off-Peak Assembly Robotics", type: "Electricity", scope: "Scope 2", qty: 108000, unit: "kWh", factor: null, citation: "Grid-average factor required (none approved)", emissions_t: null, cost_bdt: 993600, confidence: 0.99, snippet: "Off-Peak Assembly Energy: 108,000 kWh @ 9.20 BDT", status: "PENDING_AUDIT" },
      { id: "elec_peak", name: "Battery Pack Formation Charging", type: "Electricity", scope: "Scope 2", qty: 34000, unit: "kWh", factor: null, citation: "Grid-average factor required (none approved)", emissions_t: null, cost_bdt: 435200, confidence: 0.98, snippet: "Battery Formation & High-Rate Pack Charging: 34,000 kWh", status: "PENDING_AUDIT" },
      { id: "power_factor_penalty", name: "Power Factor Reactive Loss", type: "Grid Efficiency", scope: "Memo (reactive energy)", qty: 2800, unit: "kVARh", factor: null, citation: "Reactive energy is not consumed energy: no emissions", emissions_t: 0, cost_bdt: 12600, confidence: 0.96, snippet: "Power Factor Reactive Surcharge: 2,800 kVARh", status: "PENDING_AUDIT" },
      { id: "captive_diesel", name: "Testing Backup HSD Diesel", type: "Fossil Fuel", scope: "Scope 1", qty: 1200, unit: "Liters", factor: 2.680, citation: "UNVERIFIED legacy constant", emissions_t: 3.22, cost_bdt: 126000, confidence: 0.97, snippet: "Captive Genset HSD Diesel: 1,200 Liters", status: "PENDING_AUDIT" },
      { id: "port_freight", name: "Port Battery Cell Drayage Haulage", type: "Logistics", scope: "Scope 3 (Cat 4)", qty: 46000, unit: "Ton-km", factor: 0.200, citation: "Smart Freight Centre GLEC Heavy Goods Road Transport", emissions_t: 9.20, cost_bdt: 828000, confidence: 0.97, snippet: "Chittagong Port Battery Cell Drayage: 46,000 Ton-km", status: "PENDING_AUDIT" }
    ]
  },
  "polyjute-asia": {
    filename: "PolyJute_Mill_Karnaphuli_Gas_Boiler_Steam_Invoice.pdf",
    authority: "Karnaphuli Gas Distribution Co. & WASA",
    period: "May 2026",
    meter: "KGDC-IND-9092",
    tariff: "Captive Industrial Cogeneration & Thermal",
    raw_text: "POLYJUTE ASIA ECO-PACKAGING MILL. KGDC Gas Meter: KGDC-IND-9092. Captive Natural Gas Boiler: 24,500 m3 @ 30.00 BDT. Industrial High-Pressure Saturated Steam: 140 Metric Tons @ 2400 BDT. WASA Industrial Water Supply: 8,500 m3 @ 42.00 BDT. Effluent Treatment Plant (ETP) Discharged Volume: 6,200 m3 @ 25.00 BDT. Backup Generator HSD: 4,200 Liters. Process Solid Waste Landfill Divert: 28 Tons.",
    segments: [
      { id: "natural_gas", name: "Captive Natural Gas for Boiler", type: "Fossil Fuel", scope: "Scope 1", qty: 24500, unit: "m³", factor: 2.020, citation: "UNVERIFIED legacy constant", emissions_t: 49.49, cost_bdt: 735000, confidence: 0.99, snippet: "Captive Natural Gas Boiler: 24,500 m3 @ 30.00 BDT", status: "PENDING_AUDIT" },
      { id: "saturated_steam", name: "Purchased High-Pressure Steam", type: "Thermal Energy", scope: "Scope 2", qty: 140, unit: "Metric Tons", factor: 180.0, citation: "GHG Protocol Scope 2 Purchased Steam Guidance", emissions_t: 25.20, cost_bdt: 336000, confidence: 0.98, snippet: "Industrial High-Pressure Saturated Steam: 140 Metric Tons", status: "PENDING_AUDIT" },
      { id: "wasa_water", name: "Jute Retting Water Intake", type: "Water Supply", scope: "Scope 3 (Cat 1)", qty: 8500, unit: "m³", factor: 0.344, citation: "DEFRA Water Treatment Metric", emissions_t: 2.92, cost_bdt: 357000, confidence: 0.96, snippet: "WASA Industrial Water Supply: 8,500 m3 @ 42.00 BDT", status: "PENDING_AUDIT" },
      { id: "etp_effluent", name: "ETP Anaerobic Effluent Discharge", type: "Effluent", scope: "Scope 1", qty: 6200, unit: "m³", factor: 0.780, citation: "IPCC Wastewater Treatment Standard", emissions_t: 4.84, cost_bdt: 155000, confidence: 0.97, snippet: "Effluent Treatment Plant (ETP) Discharged Volume: 6,200 m3", status: "PENDING_AUDIT" },
      { id: "captive_diesel", name: "Mill Backup Power HSD", type: "Fossil Fuel", scope: "Scope 1", qty: 4200, unit: "Liters", factor: 2.680, citation: "UNVERIFIED legacy constant", emissions_t: 11.26, cost_bdt: 441000, confidence: 0.96, snippet: "Backup Generator HSD: 4,200 Liters", status: "PENDING_AUDIT" },
      { id: "solid_waste", name: "Biodegradable Offcut Landfill Diversion", type: "Waste", scope: "Scope 3 (Cat 5)", qty: 28, unit: "Tons", factor: 450.0, citation: "DoE Municipal Solid Waste Methane Standard", emissions_t: 12.60, cost_bdt: 33600, confidence: 0.95, snippet: "Process Solid Waste Landfill Divert: 28 Tons", status: "PENDING_AUDIT" }
    ]
  }
};
