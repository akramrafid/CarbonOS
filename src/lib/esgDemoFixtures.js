// Client-side benchmark fixtures for zero-friction ESG evaluation.
// Mirrors backend seed_demo_organization() so the workspace is 100% interactive
// even when the remote API is waking up, deploying, or offline.

export const DEMO_ORG_ID = 'org-demo-bangladesh-benchmark';

export function getInitialDemoState() {
  const org = {
    id: DEMO_ORG_ID,
    name: 'Dhaka Apparel Mills Ltd [SAMPLE DATA]',
    is_demo: true,
    role: 'org_owner',
  };

  const entities = [
    {
      id: 'ent-demo-1',
      organization_id: DEMO_ORG_ID,
      name: 'Dhaka Apparel Mills Ltd [SAMPLE DATA]',
      country: 'BD',
      registration_number: 'C-145892/DEMO',
    },
  ];

  const facilities = [
    {
      id: 'fac-demo-1',
      organization_id: DEMO_ORG_ID,
      legal_entity_id: 'ent-demo-1',
      name: 'Savar Spinning Unit 1 [SAMPLE DATA]',
      country: 'BD',
      grid_region: 'BD-NATIONAL-GRID',
      address: 'Plot 42-45, Baipail Industrial Area, Savar, Dhaka',
      operational_control: true,
      equity_share_pct: '100.0000',
    },
  ];

  const periods = [
    {
      id: 'prd-demo-1',
      organization_id: DEMO_ORG_ID,
      name: 'FY2024-25 [SAMPLE DATA]',
      start_date: '2024-07-01',
      end_date: '2025-06-30',
      boundary_method: 'operational_control',
      status: 'OPEN',
      revision: 1,
    },
  ];

  const activityTypes = [
    { key: 'electricity_grid', name: 'Grid Electricity Consumption', scope: 'Scope 2', default_unit: 'kWh' },
    { key: 'stationary_combustion_diesel', name: 'Stationary Combustion — Diesel Generator', scope: 'Scope 1', default_unit: 'litres' },
    { key: 'stationary_combustion_gas', name: 'Stationary Combustion — Natural Gas Boiler', scope: 'Scope 1', default_unit: 'm3' },
    { key: 'freight_road', name: 'Upstream Freight — Road Transport', scope: 'Scope 3', default_unit: 'tkm' },
    { key: 'water_supply', name: 'Municipal Water Supply', scope: 'Environmental', default_unit: 'm3' },
    { key: 'waste_landfill', name: 'Industrial Solid Waste — Landfill', scope: 'Scope 3', default_unit: 'kg' },
  ];

  const factors = [
    {
      id: 'fac-f-1',
      family: 'grid-electricity-bd',
      version: 1,
      activity_type: 'electricity_grid',
      unit: 'kWh',
      co2e_factor: '0.634000',
      co2_factor: '0.621000',
      ch4_factor: '0.000021',
      n2o_factor: '0.000012',
      source: 'Department of Environment (DoE) Bangladesh National Grid Baseline 2023',
      status: 'approved',
      first_approved_by: 'system',
      second_approved_by: 'chief_sustainability_officer',
    },
    {
      id: 'fac-f-2',
      family: 'diesel-combustion-bd',
      version: 1,
      activity_type: 'stationary_combustion_diesel',
      unit: 'litres',
      co2e_factor: '2.680000',
      co2_factor: '2.660000',
      ch4_factor: '0.000150',
      n2o_factor: '0.000060',
      source: 'IPCC 2006 Guidelines for National GHG Inventories (Vol 2 Energy, Stationary Combustion)',
      status: 'approved',
      first_approved_by: 'system',
      second_approved_by: 'chief_sustainability_officer',
    },
    {
      id: 'fac-f-3',
      family: 'gas-combustion-bd',
      version: 1,
      activity_type: 'stationary_combustion_gas',
      unit: 'm3',
      co2e_factor: '1.980000',
      co2_factor: '1.960000',
      ch4_factor: '0.000120',
      n2o_factor: '0.000040',
      source: 'Titas Gas Transmission & Distribution Co Ltd — Average Natural Gas Carbon Content',
      status: 'approved',
      first_approved_by: 'system',
      second_approved_by: 'chief_sustainability_officer',
    },
  ];

  const activities = [
    {
      id: 'act-demo-1',
      facility_id: 'fac-demo-1',
      facility_name: 'Savar Spinning Unit 1 [SAMPLE DATA]',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'electricity_grid',
      scope: 'Scope 2',
      date: '2024-10-15',
      quantity: '32500.0000',
      unit: 'kWh',
      emission_factor_id: 'fac-f-1',
      co2e_tonnes: '20.6050',
      status: 'approved',
      evidence_ref: 'DPDC-BILL-OCT24-SAVAR',
      created_by_sub: 'demo-user',
    },
    {
      id: 'act-demo-2',
      facility_id: 'fac-demo-1',
      facility_name: 'Savar Spinning Unit 1 [SAMPLE DATA]',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'stationary_combustion_diesel',
      scope: 'Scope 1',
      date: '2024-10-18',
      quantity: '1450.0000',
      unit: 'litres',
      emission_factor_id: 'fac-f-2',
      co2e_tonnes: '3.8860',
      status: 'submitted',
      evidence_ref: 'PADMA-OIL-INVOICE-84912',
      created_by_sub: 'demo-user',
    },
    {
      id: 'act-demo-3',
      facility_id: 'fac-demo-1',
      facility_name: 'Savar Spinning Unit 1 [SAMPLE DATA]',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'stationary_combustion_gas',
      scope: 'Scope 1',
      date: '2024-10-22',
      quantity: '4200.0000',
      unit: 'm3',
      emission_factor_id: 'fac-f-3',
      co2e_tonnes: '8.3160',
      status: 'draft',
      evidence_ref: 'TITAS-BILL-OCT24',
      created_by_sub: 'demo-user',
    },
  ];

  const metricDefs = [
    { code: 'GHG-S1', name: 'Scope 1 Direct GHG Emissions', pillar: 'environmental', unit: 'tCO2e', description: 'Gross direct GHG emissions from stationary combustion and generators.' },
    { code: 'GHG-S2', name: 'Scope 2 Location-based Electricity', pillar: 'environmental', unit: 'tCO2e', description: 'Gross market/location GHG emissions from purchased grid electricity.' },
    { code: 'GHG-S3', name: 'Scope 3 Upstream Value Chain', pillar: 'environmental', unit: 'tCO2e', description: 'Upstream transportation, logistics, and purchased materials emissions.' },
    { code: 'WAT-01', name: 'Total Fresh Water Withdrawal', pillar: 'environmental', unit: 'm3', description: 'Total municipal and groundwater withdrawn across industrial operations.' },
    { code: 'SOC-DIV', name: 'Female Workforce Ratio', pillar: 'social', unit: '%', description: 'Proportion of women in total factory workforce and floor operations.' },
    { code: 'SOC-SAF', name: 'Lost Time Injury Frequency Rate (LTIFR)', pillar: 'social', unit: 'rate', description: 'Work-related injuries resulting in lost work days per 1,000,000 hours.' },
    { code: 'GOV-POL', name: 'Anti-Corruption Code Training', pillar: 'governance', unit: '%', description: 'Percentage of procurement staff trained on formal anti-bribery policies.' },
  ];

  const metrics = [
    { id: 'met-1', period_id: 'prd-demo-1', code: 'GHG-S1', pillar: 'environmental', value: '12.2020', unit: 'tCO2e', status: 'approved', comment: 'Sum of generator diesel and boiler natural gas combustion.' },
    { id: 'met-2', period_id: 'prd-demo-1', code: 'GHG-S2', pillar: 'environmental', value: '20.6050', unit: 'tCO2e', status: 'approved', comment: 'DPDC grid electricity consumption for spinning unit.' },
    { id: 'met-3', period_id: 'prd-demo-1', code: 'GHG-S3', pillar: 'environmental', value: '4.1500', unit: 'tCO2e', status: 'submitted', comment: 'Upstream raw cotton freight from Chattogram Port.' },
    { id: 'met-4', period_id: 'prd-demo-1', code: 'WAT-01', pillar: 'environmental', value: '1850.0000', unit: 'm3', status: 'approved', comment: 'Deep tube well extraction with approved extraction meter.' },
    { id: 'met-5', period_id: 'prd-demo-1', code: 'SOC-DIV', pillar: 'social', value: '64.5000', unit: '%', status: 'approved', comment: 'Savar factory payroll demographic breakdown.' },
    { id: 'met-6', period_id: 'prd-demo-1', code: 'SOC-SAF', pillar: 'social', value: '0.0000', unit: 'rate', status: 'approved', comment: 'Zero lost time incidents recorded during reporting period.' },
    { id: 'met-7', period_id: 'prd-demo-1', code: 'GOV-POL', pillar: 'governance', value: '100.0000', unit: '%', status: 'approved', comment: 'All procurement and logistics personnel signed ethics compliance.' },
  ];

  const frameworks = [
    { id: 'ghg_protocol', name: 'GHG Protocol Corporate Standard', version: '2004 (rev. 2015)' },
    { id: 'ifrs_s2', name: 'IFRS S2 Climate-related Disclosures', version: '2023' },
    { id: 'gri_305', name: 'GRI 305: Emissions', version: '2016' },
    { id: 'bangladesh_bank', name: 'Bangladesh Bank Sustainable Finance Policy', version: '2020' },
  ];

  const disclosures = {
    ghg_protocol: {
      framework: 'ghg_protocol',
      period_id: 'prd-demo-1',
      period_name: 'FY2024-25 [SAMPLE DATA]',
      status: 'computed',
      sections: [
        {
          code: 'Scope 1',
          name: 'Direct Greenhouse Gas Emissions',
          total_tco2e: '12.2020',
          breakdown: [
            { source: 'Stationary Combustion — Natural Gas', tco2e: '8.3160' },
            { source: 'Stationary Combustion — Diesel Generator', tco2e: '3.8860' },
          ],
        },
        {
          code: 'Scope 2',
          name: 'Electricity Indirect Emissions (Location-based)',
          total_tco2e: '20.6050',
          breakdown: [
            { source: 'Bangladesh National Grid', tco2e: '20.6050' },
          ],
        },
        {
          code: 'Scope 3',
          name: 'Other Indirect GHG Emissions',
          total_tco2e: '4.1500',
          breakdown: [
            { source: 'Upstream Freight Transport', tco2e: '4.1500' },
          ],
        },
      ],
      total_emissions_tco2e: '36.9570',
    },
    bangladesh_bank: {
      framework: 'bangladesh_bank',
      period_id: 'prd-demo-1',
      period_name: 'FY2024-25 [SAMPLE DATA]',
      status: 'computed',
      sections: [
        {
          code: 'SF-E1',
          name: 'Energy Efficiency and Carbon Footprint',
          total_tco2e: '32.8070',
          breakdown: [
            { source: 'Direct & Grid Energy', tco2e: '32.8070' },
          ],
        },
        {
          code: 'SF-E2',
          name: 'Water Resource Management',
          metric: '1850 m3 total fresh withdrawal (certified)',
        },
        {
          code: 'SF-S1',
          name: 'Occupational Health and Safety Compliance',
          metric: 'Zero reportable lost-time injury incidents',
        },
      ],
      total_emissions_tco2e: '36.9570',
    },
    ifrs_s2: {
      framework: 'ifrs_s2',
      period_id: 'prd-demo-1',
      period_name: 'FY2024-25 [SAMPLE DATA]',
      status: 'computed',
      sections: [
        {
          code: 'Cross-industry metric',
          name: 'Absolute gross GHG emissions generated',
          total_tco2e: '36.9570',
          breakdown: [
            { source: 'Scope 1', tco2e: '12.2020' },
            { source: 'Scope 2', tco2e: '20.6050' },
            { source: 'Scope 3', tco2e: '4.1500' },
          ],
        },
      ],
      total_emissions_tco2e: '36.9570',
    },
    gri_305: {
      framework: 'gri_305',
      period_id: 'prd-demo-1',
      period_name: 'FY2024-25 [SAMPLE DATA]',
      status: 'computed',
      sections: [
        { code: 'GRI 305-1', name: 'Direct (Scope 1) GHG emissions', total_tco2e: '12.2020' },
        { code: 'GRI 305-2', name: 'Energy indirect (Scope 2) GHG emissions', total_tco2e: '20.6050' },
        { code: 'GRI 305-3', name: 'Other indirect (Scope 3) GHG emissions', total_tco2e: '4.1500' },
      ],
      total_emissions_tco2e: '36.9570',
    },
  };

  const calculations = [
    {
      id: 'calc-demo-1',
      reporting_period_id: 'prd-demo-1',
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      summary: {
        scope1_tco2e: '12.2020',
        scope2_tco2e: '20.6050',
        scope3_tco2e: '4.1500',
        total_tco2e: '36.9570',
      },
      lines: [
        { activity_id: 'act-demo-1', scope: 'Scope 2', factor_applied: '0.634000 kgCO2e/kWh', co2e_tonnes: '20.6050' },
        { activity_id: 'act-demo-2', scope: 'Scope 1', factor_applied: '2.680000 kgCO2e/litres', co2e_tonnes: '3.8860' },
        { activity_id: 'act-demo-3', scope: 'Scope 1', factor_applied: '1.980000 kgCO2e/m3', co2e_tonnes: '8.3160' },
      ],
    },
  ];

  const members = [
    { id: 'mem-1', user_sub: 'demo-user', role: 'org_owner', email: 'submitter@demo.carbonos.io', name: 'Demo Submitter (Owner)' },
    { id: 'mem-2', user_sub: 'demo-user-reviewer', role: 'auditor', email: 'auditor@demo.carbonos.io', name: 'Demo Auditor (Reviewer)' },
  ];

  const auditEvents = [
    {
      id: 'aud-1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor_sub: 'system',
      action: 'TENANT_SEEDED',
      resource_type: 'organization',
      resource_id: DEMO_ORG_ID,
      details: 'Initial benchmark demo tenant provisioned with Bangladesh garments data.',
    },
    {
      id: 'aud-2',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      actor_sub: 'demo-user',
      action: 'ACTIVITY_RECORDED',
      resource_type: 'activity',
      resource_id: 'act-demo-1',
      details: 'Logged 32,500 kWh electricity consumption from DPDC grid.',
    },
    {
      id: 'aud-3',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor_sub: 'demo-user',
      action: 'CALCULATION_RUN',
      resource_type: 'calculation',
      resource_id: 'calc-demo-1',
      details: 'Executed GHG emissions calculation engine; produced 36.9570 tCO2e total.',
    },
  ];

  const snapshots = [
    {
      id: 'snap-demo-1',
      period_id: 'prd-demo-1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      summary: {
        scope1_tco2e: '12.2020',
        scope2_tco2e: '20.6050',
        scope3_tco2e: '4.1500',
        total_tco2e: '36.9570',
      },
      sha256: '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123',
    },
  ];

  const invitations = [];

  return {
    org,
    entities,
    facilities,
    periods,
    activityTypes,
    factors,
    activities,
    metricDefs,
    metrics,
    frameworks,
    disclosures,
    calculations,
    snapshots,
    members,
    invitations,
    auditEvents,
  };
}
