import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getInitialDemoState } from '../../src/lib/esgDemoFixtures.js';
import {
  buildFacilityBreakdown,
  buildScopeShares,
  extractRunScopeTotals,
  summarizeActivityPipeline,
  summarizeDisclosureCoverage,
  summarizeOverviewData,
} from '../../src/pages/platform/esg/overviewHelpers.js';

test('missing calculation run keeps scope totals null and never invents numbers', () => {
  const totals = extractRunScopeTotals(null, []);
  assert.equal(totals.hasRun, false);
  assert.equal(totals.scope1Tonnes, null);
  assert.equal(totals.scope2LocationTonnes, null);
  assert.equal(totals.scope2MarketTonnes, null);
  assert.equal(totals.scope3Tonnes, null);
  assert.equal(totals.totalTonnes, null);
});

test('live FastAPI CalculationRun + approved Scope 3 records aggregate deterministically', () => {
  const run = {
    id: 'run-1',
    scope1_kg: '12202.000',
    scope2_location_kg: '20605.000',
    scope2_market_kg: null,
    boundary_method: 'operational_control',
    methodology_version: '2026.1',
    gwp_basis: 'AR6',
    input_sha256: 'abcdef1234567890',
    created_by: 'owner-1',
    created_at: '2026-01-15T10:00:00Z',
    period_revision: 1,
    exceptions: [
      { code: 'MARKET_FALLBACK_GRID_AVERAGE', blocking: false },
      { code: 'MISSING_FACTOR', blocking: true },
    ],
    by_facility: {
      'fac-1': { scope1_kg: '12202.0', scope2_location_kg: '20605.0' },
    },
  };
  const scope3Records = [
    { id: 's3-1', emissions_kg: '4150.0', status: 'APPROVED' },
    { id: 's3-2', emissions_kg: '9999.0', status: 'DRAFT' }, // draft must be excluded
  ];

  const totals = extractRunScopeTotals(run, scope3Records);
  assert.equal(totals.hasRun, true);
  assert.ok(Math.abs(totals.scope1Tonnes - 12.202) < 1e-6);
  assert.ok(Math.abs(totals.scope2LocationTonnes - 20.605) < 1e-6);
  assert.equal(totals.scope2MarketTonnes, null);
  assert.ok(Math.abs(totals.scope3Tonnes - 4.15) < 1e-6);
  assert.equal(totals.scope3ApprovedCount, 1);
  assert.equal(totals.scope3TotalCount, 2);
  assert.ok(Math.abs(totals.totalTonnes - 36.957) < 1e-6);
  assert.equal(totals.blockingExceptions.length, 1);
  assert.equal(totals.warningExceptions.length, 1);

  const shares = buildScopeShares(totals);
  assert.equal(shares.length, 3);
  const sumPct = shares.reduce((s, x) => s + x.pct, 0);
  assert.ok(Math.abs(sumPct - 100) < 1e-6);

  const facilities = buildFacilityBreakdown(
    [{ id: 'fac-1', name: 'Savar Unit 1', grid_region: 'BD-NATIONAL-GRID' }],
    run,
  );
  assert.equal(facilities.length, 1);
  assert.equal(facilities[0].name, 'Savar Unit 1');
  assert.ok(Math.abs(facilities[0].totalTonnes - 32.807) < 1e-6);
});

test('summarizeActivityPipeline and summarizeDisclosureCoverage handle gaps without compliance claims', () => {
  const pipe = summarizeActivityPipeline([
    { activity_type: 'electricity', unit: 'kWh', quantity: '10000', status: 'APPROVED' },
    { activity_type: 'electricity', unit: 'kWh', quantity: '2500', status: 'SUBMITTED' },
    { activity_type: 'diesel', unit: 'L', quantity: '500', status: 'DRAFT' },
  ]);
  assert.equal(pipe.counts.APPROVED, 1);
  assert.equal(pipe.counts.SUBMITTED, 1);
  assert.equal(pipe.counts.DRAFT, 1);
  assert.equal(pipe.counts.total, 3);
  assert.equal(pipe.byActivityType[0].approvedQuantity, 10000);
  assert.equal(pipe.byActivityType[0].totalQuantity, 12500);

  const disc = summarizeDisclosureCoverage({
    framework: 'GRI',
    template_version: '1.0',
    materiality_perspective: 'impact',
    all_requirements_addressed: false,
    counts: { PUBLISHED: 2, APPROVED: 1, MISSING_DATA: 3 },
    requirements: [
      { ref: 'GRI 305-1', title: 'Direct GHG', status: 'PUBLISHED', missing: [] },
      { ref: 'GRI 305-2', title: 'Energy indirect GHG', status: 'APPROVED', missing: [] },
      { ref: 'GRI 305-3', title: 'Other indirect GHG', status: 'MISSING_DATA', missing: ['Scope 3'] },
      { ref: 'GRI 303-3', title: 'Water', status: 'PUBLISHED', missing: [] },
      { ref: 'GRI 403-9', title: 'Injuries', status: 'MISSING_DATA', missing: ['LTIFR'] },
      { ref: 'GRI 2-27', title: 'Compliance', status: 'MISSING_DATA', missing: ['Response'] },
    ],
  });
  assert.equal(disc.addressed, 3);
  assert.equal(disc.total, 6);
  assert.equal(disc.gaps, 3);
  assert.equal(disc.pctAddressed, 50);
  assert.equal(disc.allAddressed, false);
});

test('summarizeOverviewData aggregates snapshots and E/S/G pillars', () => {
  const vm = summarizeOverviewData({
    period: { id: 'p1', name: 'FY2025', status: 'LOCKED' },
    run: { scope1_kg: '5000', scope2_location_kg: '15000', exceptions: [] },
    activities: [],
    facilities: [{ id: 'f1', name: 'Plant A', grid_region: 'BD' }],
    factors: [{ id: 'fac1', status: 'APPROVED' }, { id: 'fac2', status: 'DRAFT' }],
    metrics: [{ id: 'm1', metric_key: 'water_withdrawal', pillar: 'E', value: '1200', unit: 'm3', status: 'APPROVED' }],
    metricDefinitions: [{ metric_key: 'water_withdrawal', name: 'Water withdrawal', pillar: 'E', unit: 'm3' }],
    scope3Records: [],
    disclosureReport: null,
    snapshots: [{ id: 'snap-1', revision: 1 }],
  });
  assert.equal(vm.factorCounts.APPROVED, 1);
  assert.equal(vm.factorCounts.DRAFT, 1);
  assert.equal(vm.metricPillars.E[0].name, 'Water withdrawal');
  assert.equal(vm.snapshots.count, 1);
});

test('demo benchmark fixtures produce complete, crash-free overview metrics', () => {
  const demo = getInitialDemoState();
  const vm = summarizeOverviewData({
    period: demo.periods[0],
    run: demo.calculations[0],
    activities: demo.activities,
    facilities: demo.facilities,
    factors: demo.factors,
    metrics: demo.metrics,
    metricDefinitions: demo.metricDefs,
    scope3Records: demo.scope3Records,
    disclosureReport: demo.disclosures.GRI,
    snapshots: demo.snapshots,
  });

  assert.equal(vm.inventory.hasRun, true);
  assert.ok(Math.abs(vm.inventory.scope1Tonnes - 3.886) < 1e-6);
  assert.ok(Math.abs(vm.inventory.scope2LocationTonnes - 20.605) < 1e-6);
  assert.equal(vm.inventory.scope2MarketTonnes, null);
  assert.ok(Math.abs(vm.inventory.scope3Tonnes - 4.15) < 1e-6);
  assert.equal(vm.activityPipeline.counts.APPROVED, 2);
  assert.equal(vm.activityPipeline.counts.SUBMITTED, 1);
  assert.equal(vm.metricPillars.E.length, 1);
  assert.equal(vm.metricPillars.S.length, 2);
  assert.equal(vm.metricPillars.G.length, 1);
  assert.equal(vm.disclosure.addressed, 3);
  assert.equal(vm.disclosure.gaps, 2);
});
