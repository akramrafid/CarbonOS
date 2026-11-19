// Client-side benchmark fixtures for zero-friction ESG evaluation.
// Mirrors backend ledger schemas so every workspace tab (Overview, Setup, Factors,
// Ledger, Metrics, Calculation & Reports, Disclosures, Members, Audit Trail) renders
// cleanly when running in Offline Resilient mode.

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
      financial_control: false,
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

  const activityTypes = {
    inventory: [
      {
        activity_type: 'electricity',
        scope: '2',
        canonical_unit: 'kWh',
        accepted_units: ['kWh', 'MWh'],
      },
      {
        activity_type: 'diesel',
        scope: '1',
        canonical_unit: 'L',
        accepted_units: ['L'],
      },
      {
        activity_type: 'natural_gas',
        scope: '1',
        canonical_unit: 'm3',
        accepted_units: ['m3', 'MMBtu', 'GJ'],
      },
      {
        activity_type: 'lpg',
        scope: '1',
        canonical_unit: 'kg',
        accepted_units: ['kg'],
      },
      {
        activity_type: 'petrol',
        scope: '1',
        canonical_unit: 'L',
        accepted_units: ['L'],
      },
    ],
    memo: [
      {
        activity_type: 'renewable_electricity_onsite',
        scope: null,
        canonical_unit: 'kWh',
        accepted_units: ['kWh', 'MWh'],
      },
    ],
  };

  const factors = [
    {
      id: 'fac-f-1',
      family: 'demo:bd-grid-electricity',
      version: 1,
      activity_type: 'electricity',
      unit: 'kWh',
      kgco2e_per_unit: '0.634000',
      method: 'location',
      factor_kind: 'grid_average',
      region: 'BD-NATIONAL-GRID',
      source_publisher: 'DEMO PLACEHOLDER',
      source_document: 'Illustrative Bangladesh grid factor (not a published factor)',
      source_year: 2024,
      source_table_ref: 'Demo Table 1',
      is_custom: false,
      gwp_basis: 'AR6',
      status: 'APPROVED',
      created_by: 'system',
    },
    {
      id: 'fac-f-2',
      family: 'demo:diesel-combustion',
      version: 1,
      activity_type: 'diesel',
      unit: 'L',
      kgco2e_per_unit: '2.680000',
      method: 'direct',
      factor_kind: null,
      region: 'BD-NATIONAL-GRID',
      source_publisher: 'IPCC 2006 (Demo)',
      source_document: 'Guidelines for National GHG Inventories Vol 2 (Sample)',
      source_year: 2006,
      source_table_ref: 'Ch. 2 Table 2.3',
      is_custom: false,
      gwp_basis: 'AR6',
      status: 'APPROVED',
      created_by: 'system',
    },
    {
      id: 'fac-f-3',
      family: 'demo:natural-gas-boiler',
      version: 1,
      activity_type: 'natural_gas',
      unit: 'm3',
      kgco2e_per_unit: '1.980000',
      method: 'direct',
      factor_kind: null,
      region: 'BD-NATIONAL-GRID',
      source_publisher: 'DEMO PLACEHOLDER',
      source_document: 'Sample Industrial Boiler Natural Gas Factor',
      source_year: 2024,
      source_table_ref: null,
      is_custom: false,
      gwp_basis: 'AR6',
      status: 'APPROVED',
      created_by: 'system',
    },
  ];

  const activities = [
    {
      id: 'act-demo-1',
      facility_id: 'fac-demo-1',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'electricity',
      quantity: '32500',
      unit: 'kWh',
      quantity_raw: '32500',
      unit_raw: 'kWh',
      activity_start: '2024-10-01',
      activity_end: '2024-10-31',
      meter_ref: 'DPDC-SAVAR-9921',
      source_type: 'document',
      source_ref: 'DPDC-BILL-OCT24-SAVAR',
      evidence_snippet: 'DPDC Total Consumed: 32,500 kWh',
      data_quality: 'billed',
      status: 'APPROVED',
      created_by: 'demo-user',
    },
    {
      id: 'act-demo-2',
      facility_id: 'fac-demo-1',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'diesel',
      quantity: '1450',
      unit: 'L',
      quantity_raw: '1450',
      unit_raw: 'L',
      activity_start: '2024-10-01',
      activity_end: '2024-10-31',
      meter_ref: 'DG-SET-02',
      source_type: 'manual',
      source_ref: 'PADMA-OIL-INVOICE-84912',
      evidence_snippet: 'Captive generator diesel log: 1,450 L',
      data_quality: 'billed',
      status: 'APPROVED',
      created_by: 'demo-user',
    },
    {
      id: 'act-demo-3',
      facility_id: 'fac-demo-1',
      reporting_period_id: 'prd-demo-1',
      activity_type: 'natural_gas',
      quantity: '4200',
      unit: 'm3',
      quantity_raw: '4200',
      unit_raw: 'm3',
      activity_start: '2024-10-01',
      activity_end: '2024-10-31',
      meter_ref: 'TITAS-BOILER-01',
      source_type: 'document',
      source_ref: 'TITAS-BILL-OCT24',
      evidence_snippet: 'Boiler natural gas metered: 4,200 m3',
      data_quality: 'metered',
      status: 'SUBMITTED',
      created_by: 'demo-user',
    },
  ];

  const scope3Records = [
    {
      id: 's3-demo-1',
      organization_id: DEMO_ORG_ID,
      period_id: 'prd-demo-1',
      facility_id: 'fac-demo-1',
      category: 'cat_4_upstream_transport',
      calculation_method: 'distance_based',
      supplier_name: 'Chattogram-Savar Inland Haulage [DEMO]',
      activity_description: 'Raw cotton container drayage — 280 km',
      quantity: '25000',
      unit: 'tkm',
      factor_kgco2e_per_unit: '0.166000',
      factor_source: 'DEMO SAMPLE — illustrative distance freight factor',
      emissions_kg: '4150.0000',
      data_quality: 'estimated',
      status: 'APPROVED',
      created_by: 'demo-user',
    },
  ];

  const metricDefs = [
    { metric_key: 'water_withdrawal', name: 'Total Fresh Water Withdrawal', pillar: 'E', unit: 'm3', kind: 'decimal', dimensions: { source: ['groundwater', 'municipal'] }, sensitive: false },
    { metric_key: 'waste_recycled_pct', name: 'Fabric Cuttings Recycled', pillar: 'E', unit: '%', kind: 'percent', dimensions: {}, sensitive: false },
    { metric_key: 'female_workforce_pct', name: 'Female Workforce Ratio', pillar: 'S', unit: '%', kind: 'percent', dimensions: {}, sensitive: false },
    { metric_key: 'ltifr', name: 'Lost Time Injury Frequency Rate (LTIFR)', pillar: 'S', unit: 'per_1M_hrs', kind: 'decimal', dimensions: {}, sensitive: false },
    { metric_key: 'ethics_training_pct', name: 'Anti-Corruption Code Training', pillar: 'G', unit: '%', kind: 'percent', dimensions: {}, sensitive: false },
  ];

  const metrics = [
    { id: 'met-1', period_id: 'prd-demo-1', facility_id: 'fac-demo-1', metric_key: 'water_withdrawal', pillar: 'E', value: '1850', unit: 'm3', dimensions: { source: 'groundwater' }, status: 'APPROVED', evidence_ref: 'Tube well flow meter log [DEMO]', created_by: 'demo-user' },
    { id: 'met-2', period_id: 'prd-demo-1', facility_id: 'fac-demo-1', metric_key: 'female_workforce_pct', pillar: 'S', value: '64.5', unit: '%', dimensions: {}, status: 'APPROVED', evidence_ref: 'HR aggregated headcount summary [DEMO]', created_by: 'demo-user' },
    { id: 'met-3', period_id: 'prd-demo-1', facility_id: 'fac-demo-1', metric_key: 'ltifr', pillar: 'S', value: '0', unit: 'per_1M_hrs', dimensions: {}, status: 'APPROVED', evidence_ref: 'EHS Incident Register FY24-25 [DEMO]', created_by: 'demo-user' },
    { id: 'met-4', period_id: 'prd-demo-1', facility_id: null, metric_key: 'ethics_training_pct', pillar: 'G', value: '100', unit: '%', dimensions: {}, status: 'APPROVED', evidence_ref: 'Compliance attendance sheet [DEMO]', created_by: 'demo-user' },
  ];

  const frameworks = [
    { framework: 'GRI', name: 'GRI Universal & Topic Standards (Demo)', template_version: '1.0', verification_status: 'UNVERIFIED', materiality: 'impact' },
    { framework: 'IFRS_S2', name: 'IFRS S2 Climate-related Disclosures (Demo)', template_version: '1.0', verification_status: 'UNVERIFIED', materiality: 'financial' },
  ];

  const disclosures = {
    GRI: {
      framework: 'GRI',
      template_version: '1.0',
      materiality_perspective: 'impact',
      counts: { PUBLISHED: 1, APPROVED: 2, MISSING_DATA: 2 },
      all_requirements_addressed: false,
      requirements: [
        { ref: 'GRI 305-1', title: 'Direct (Scope 1) GHG emissions', status: 'APPROVED', response_status: 'APPROVED', missing: [], evidence: { scope1_tco2e: '3.886' }, data_status: 'OK', narrative: 'Diesel generator & stationary fuel ledger approved for Savar Spinning Unit 1 [DEMO].', updated_by: 'demo-user' },
        { ref: 'GRI 305-2', title: 'Energy indirect (Scope 2) GHG emissions', status: 'PUBLISHED', response_status: 'PUBLISHED', missing: [], evidence: { scope2_location_tco2e: '20.605' }, data_status: 'OK', narrative: 'Location-based electricity inventory prepared from utility invoices [DEMO].', updated_by: 'demo-user' },
        { ref: 'GRI 305-3', title: 'Other indirect (Scope 3) GHG emissions', status: 'MISSING_DATA', response_status: 'NOT_STARTED', missing: ['Review pending categories 1–15 coverage'], evidence: {}, data_status: 'PARTIAL', narrative: null, updated_by: null },
        { ref: 'GRI 303-3', title: 'Water withdrawal', status: 'APPROVED', response_status: 'APPROVED', missing: [], evidence: { water_withdrawal: ['1850 m3'] }, data_status: 'OK', narrative: null, updated_by: 'demo-user' },
        { ref: 'GRI 403-9', title: 'Work-related injuries', status: 'MISSING_DATA', response_status: 'DRAFT', missing: ['Publish annual EHS verification sign-off'], evidence: {}, data_status: 'DRAFT', narrative: null, updated_by: 'demo-user' },
      ],
    },
    IFRS_S2: {
      framework: 'IFRS_S2',
      template_version: '1.0',
      materiality_perspective: 'financial',
      counts: { APPROVED: 1, MISSING_DATA: 1 },
      all_requirements_addressed: false,
      requirements: [
        { ref: 'IFRS S2 ¶29(a)', title: 'Absolute gross Scope 1 & 2 GHG emissions', status: 'APPROVED', response_status: 'APPROVED', missing: [], evidence: { scope1_2_tco2e: '24.491' }, data_status: 'OK', narrative: 'Deterministic Decimal calculation run completed [DEMO].', updated_by: 'demo-user' },
        { ref: 'IFRS S2 ¶29(a)(i)(3)', title: 'Scope 3 GHG emissions by category', status: 'MISSING_DATA', response_status: 'NOT_STARTED', missing: ['Complete full Scope 3 screening'], evidence: {}, data_status: 'PARTIAL', narrative: null, updated_by: null },
      ],
    },
  };

  const calculations = [
    {
      id: 'calc-demo-1',
      period_id: 'prd-demo-1',
      period_revision: 1,
      boundary_method: 'operational_control',
      methodology_version: 'GHG Protocol Corporate Std (Demo)',
      gwp_basis: 'AR6',
      input_sha256: '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123',
      scope1_kg: '3886.000',
      scope2_location_kg: '20605.000',
      scope2_market_kg: null,
      blocking: false,
      exceptions: [
        { code: 'MARKET_FALLBACK_GRID_AVERAGE', activity_type: 'electricity', facility_id: 'fac-demo-1', blocking: false, detail: 'No contractual instrument recorded; market-based total withheld.' },
      ],
      excluded: [],
      memo: {},
      by_facility: {
        'fac-demo-1': { scope1_kg: '3886.000', scope2_location_kg: '20605.000' },
      },
      uncertainty: {
        scope1: { uncertainty_pct: '5.0' },
        scope2_location: { uncertainty_pct: '4.0' },
      },
      created_by: 'demo-user',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      lines: [
        {
          id: 1,
          facility_id: 'fac-demo-1',
          scope: '2',
          method: 'location',
          quantity: '32500',
          unit: 'kWh',
          factor_version: 1,
          emissions_kg: '20605.000',
          formula: '32500 kWh × 0.634000 kgCO2e/kWh (Demo grid average)',
        },
        {
          id: 2,
          facility_id: 'fac-demo-1',
          scope: '1',
          method: 'direct',
          quantity: '1450',
          unit: 'L',
          factor_version: 1,
          emissions_kg: '3886.000',
          formula: '1450 L × 2.680000 kgCO2e/L',
        },
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
      created_at: new Date(Date.now() - 7200000).toISOString(),
      actor_sub: 'system',
      action: 'tenant.seed',
      entity_type: 'organization',
      data: { note: 'Initial benchmark demo tenant provisioned with sample data.' },
    },
    {
      id: 'aud-2',
      created_at: new Date(Date.now() - 5400000).toISOString(),
      actor_sub: 'demo-user',
      action: 'activity.approve',
      entity_type: 'activity_record',
      data: { activity_type: 'electricity', quantity: 32500, unit: 'kWh' },
    },
    {
      id: 'aud-3',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      actor_sub: 'demo-user',
      action: 'calculation.run',
      entity_type: 'calculation_run',
      data: { scope1_kg: '3886.000', scope2_location_kg: '20605.000' },
    },
  ];

  const snapshots = [
    {
      id: 'snap-demo-1',
      period_id: 'prd-demo-1',
      revision: 1,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      prepared_by: 'demo-user',
      approved_by: 'demo-user-reviewer',
      content_sha256: '9f83a45c61234bde77890a1bcdef9823456789abcdef0123456789abcdef0123',
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
    scope3Records,
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
