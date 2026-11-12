export const DEFAULT_PROJECTS = [
  {
    id: "7a6cba3c-f759-414d-a499-d28bb772c436",
    external_project_id: "BD-DOE-8FB55D",
    project_name: "Sundarbans Mangrove Article 6 Pilot (Satkhira Block)",
    sector: "Forestry",
    sectoral_scope: "Scope 14: Afforestation and Reforestation",
    mitigation_type: "Afforestation",
    company_tax_id: "BIN-8492019482-LULUCF",
    ndc_commitment_type: "conditional",
    eligibility_status: "positive_list",
    carbon_standard: "JCM / Japan-Bangladesh Bilateral",
    created_at: "2026-03-15T09:30:00Z",
    metrics: {
      biomass_mg_ha: 375.73,
      carbon_tc_ha: 409.71,
      ndvi: 0.74,
      s1_ratio: 0.38,
      canopy_height_m: 15.2,
      tonnes_co2e: 10000.0,
      confidence_interval: "382.4 - 437.0 tC/ha (90% Conformal Bound)",
      carbon_agb_tc_ha: 215.3,
      carbon_bgb_tc_ha: 74.2,
      carbon_soc_tc_ha: 120.21,
      provenance_hash: "b413b77ce547bb1bd57e015810ae3bea2bdc3b0b3f1efaf620c037d76a80fc6d"
    }
  },
  {
    id: "9c12df84-3b2e-48a1-9a71-61b4d0812e91",
    external_project_id: "BD-JCM-AGR-002",
    project_name: "Northwest AWD Rice Methane Abatement (Rangpur Hub)",
    sector: "Agriculture",
    sectoral_scope: "Scope 01: Agriculture and Land Management",
    mitigation_type: "AWD Rice Cultivation",
    company_tax_id: "BIN-4491028371-AGRI",
    ndc_commitment_type: "conditional",
    eligibility_status: "positive_list",
    carbon_standard: "Article 6.2 Bilateral / JCM",
    created_at: "2026-04-10T11:15:00Z",
    metrics: {
      biomass_mg_ha: 84.10,
      carbon_tc_ha: 38.60,
      ndvi: 0.68,
      s1_ratio: 0.42,
      canopy_height_m: 1.1,
      tonnes_co2e: 4850.0,
      confidence_interval: "35.1 - 42.0 tC/ha (90% Conformal Bound)",
      carbon_agb_tc_ha: 22.0,
      carbon_bgb_tc_ha: 6.4,
      carbon_soc_tc_ha: 10.2,
      provenance_hash: "8f5a2b137d4e9c80a221f5798e91845c2da9f93167b5e408c1c54e63b827ea19"
    }
  },
  {
    id: "3e58fa21-12c8-47d3-9bc0-8a1e5069d412",
    external_project_id: "BD-DOE-EN-089",
    project_name: "Sylhet Rural Clean Cookstove Transition Program",
    sector: "Energy",
    sectoral_scope: "Scope 03: Energy Demand & Efficiency",
    mitigation_type: "Clean Cookstoves",
    company_tax_id: "BIN-2910384756-ENERGY",
    ndc_commitment_type: "unconditional",
    eligibility_status: "positive_list",
    carbon_standard: "Gold Standard / Article 6.4 PACM",
    created_at: "2026-05-02T14:45:00Z",
    metrics: {
      biomass_mg_ha: 0.0,
      carbon_tc_ha: 0.0,
      ndvi: 0.0,
      s1_ratio: 0.0,
      canopy_height_m: 0.0,
      tonnes_co2e: 3200.0,
      confidence_interval: "Direct Thermal Metering (±2.5% uncertainty)",
      carbon_agb_tc_ha: 0.0,
      carbon_bgb_tc_ha: 0.0,
      carbon_soc_tc_ha: 0.0,
      provenance_hash: "d7a8f3b2019c4e56821b9a7c3e4f028165d49a37c2b5e801f94c3d82a1b567ef"
    }
  }
];

export const DEFAULT_RULES = [
  {
    id: "r1",
    sector: "Forestry",
    mitigation_type: "Afforestation",
    ndc_commitment_type: "conditional",
    status: "positive_list",
    regulatory_reference: "Bangladesh NDC 3.0 Annex II, Section 4.2; DOE Circular 2025/08",
    notes: "Directly qualifies for Article 6.2 bilateral transfer (JCM / Switzerland) subject to 10% national retention.",
    is_active: true
  },
  {
    id: "r2",
    sector: "Forestry",
    mitigation_type: "Reforestation",
    ndc_commitment_type: "any",
    status: "positive_list",
    regulatory_reference: "Bangladesh Forest Department Strategic Plan 2021-2030",
    notes: "Restoration of degraded coastal and mangrove forest belts.",
    is_active: true
  },
  {
    id: "r3",
    sector: "Agriculture",
    mitigation_type: "AWD Rice Cultivation",
    ndc_commitment_type: "conditional",
    status: "positive_list",
    regulatory_reference: "DAE Climate-Smart Agriculture Guideline 2024",
    notes: "Alternate Wetting and Drying (AWD) irrigation reducing methane flux by >30%.",
    is_active: true
  },
  {
    id: "r4",
    sector: "Energy",
    mitigation_type: "Solar Irrigation",
    ndc_commitment_type: "conditional",
    status: "positive_list",
    regulatory_reference: "IDCOL Solar Irrigation Roadmap 2025",
    notes: "Replacement of diesel irrigation pumps with solar PV micro-grids.",
    is_active: true
  },
  {
    id: "r5",
    sector: "Energy",
    mitigation_type: "Clean Cookstoves",
    ndc_commitment_type: "any",
    status: "positive_list",
    regulatory_reference: "National Action Plan for Clean Cooking 2020-2030",
    notes: "Tier-4 certified biomass cookstoves with digital IoT usage monitoring.",
    is_active: true
  },
  {
    id: "r6",
    sector: "Energy",
    mitigation_type: "Coal Power Plant Retrofit",
    ndc_commitment_type: "any",
    status: "negative_list",
    regulatory_reference: "DOE Carbon Market Guidance 2025, Article 4.3 (Fossil Fuel Exclusion)",
    notes: "All coal-based energy mitigation is strictly disqualified from Article 6 credit issuance.",
    is_active: true
  },
  {
    id: "r7",
    sector: "Industry",
    mitigation_type: "Fluorinated Gas (HFC-23) Destruction",
    ndc_commitment_type: "any",
    status: "negative_list",
    regulatory_reference: "UNFCCC Kigali Amendment Compliance Order",
    notes: "Industrial greenhouse gas destruction without domestic technological transition is disallowed.",
    is_active: true
  },
  {
    id: "r8",
    sector: "Waste",
    mitigation_type: "Landfill Methane Capture",
    ndc_commitment_type: "any",
    status: "pending_review",
    regulatory_reference: "Local Government Division Municipal Waste Rule 2024",
    notes: "Under technical committee review for grid-injection additionality.",
    is_active: true
  }
];

export const DEFAULT_SUBMISSIONS = [
  {
    id: "7a6cba3c-f759-414d-a499-d28bb772c436",
    project_name: "Sundarbans Mangrove Article 6 Pilot (Satkhira Block)",
    external_id: "BD-DOE-8FB55D",
    provenance_hash: "b413b77ce547bb1bd57e015810ae3bea2bdc3b0b3f1efaf620c037d76a80fc6d",
    response_status: 201,
    submission_status: "accepted",
    tonnes_co2e: 10000.0,
    submitted_at: "2026-09-26T12:00:00Z"
  },
  {
    id: "b109c84e-51c3-424a-93a8-410a5e81d023",
    project_name: "Northwest AWD Rice Methane Abatement (Rangpur Hub)",
    external_id: "BD-JCM-AGR-002",
    provenance_hash: "8f5a2b137d4e9c80a221f5798e91845c2da9f93167b5e408c1c54e63b827ea19",
    response_status: 201,
    submission_status: "accepted",
    tonnes_co2e: 4850.0,
    submitted_at: "2026-09-24T16:20:00Z"
  }
];

export const DEFAULT_ADJUSTMENTS = [
  {
    id: "adj-001",
    credit_serial_number: "BD-JCM-2026-0001-5000",
    sector: "LULUCF_Forestry",
    itmo_transfer_partner: "Government of Japan (JCM Joint Committee)",
    authorized_for_itmo: true,
    metric_tonnes_co2e: 5000.0,
    adjustment_applied: true,
    adjustment_applied_at: "2026-09-26T12:05:00Z",
    adjustment_confirmation_id: "DOE-DNA-CONF-2026-BDJP-01",
    reconciliation_status: "adjusted_confirmed"
  },
  {
    id: "adj-002",
    credit_serial_number: "BD-JCM-2026-5001-10000",
    sector: "LULUCF_Forestry",
    itmo_transfer_partner: "Bangladesh National NDC Reserve (Domestic)",
    authorized_for_itmo: false,
    metric_tonnes_co2e: 5000.0,
    adjustment_applied: false,
    adjustment_applied_at: null,
    adjustment_confirmation_id: "DOE-NDC-RESERVE-2026-01",
    reconciliation_status: "domestic_retention"
  }
];
