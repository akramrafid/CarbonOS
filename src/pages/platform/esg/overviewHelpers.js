// Pure aggregation and normalization helpers for the ESG Workspace Overview dashboard.
// Normalizes both live FastAPI ledger schemas and offline demo resilient store shapes
// without fabricating numbers when records or calculations are absent.

export function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatTonnes(tonnes, maximumFractionDigits = 3) {
  const num = toFiniteNumber(tonnes);
  if (num === null) return null;
  return num.toLocaleString(undefined, { maximumFractionDigits });
}

export function normalizeStatus(status) {
  if (!status) return 'UNKNOWN';
  return String(status).trim().toUpperCase();
}

export function normalizePillar(pillar) {
  const value = String(pillar || '').trim().toLowerCase();
  if (value === 'e' || value === 'environmental') return 'E';
  if (value === 's' || value === 'social') return 'S';
  if (value === 'g' || value === 'governance') return 'G';
  return 'OTHER';
}

function kgToTonnes(kgValue, fallbackTonnes = null) {
  const kg = toFiniteNumber(kgValue);
  if (kg !== null) return kg / 1000;
  return toFiniteNumber(fallbackTonnes);
}

/**
 * Extract deterministic GHG inventory totals from a CalculationRun and approved Scope 3 records.
 * Returns null values (never placeholders) when no calculation run or approved Scope 3 data exists.
 */
export function extractRunScopeTotals(run, scope3Records = []) {
  const listScope3 = Array.isArray(scope3Records) ? scope3Records : [];
  const approvedScope3 = listScope3.filter((r) => normalizeStatus(r.status) === 'APPROVED');

  let scope3Tonnes = null;
  if (approvedScope3.length > 0) {
    scope3Tonnes = approvedScope3.reduce((sum, r) => {
      const t = kgToTonnes(r.emissions_kg, r.co2e_tonnes);
      return sum + (t || 0);
    }, 0);
  }

  if (!run) {
    return {
      hasRun: false,
      runId: null,
      scope1Tonnes: null,
      scope2LocationTonnes: null,
      scope2MarketTonnes: null,
      scope3Tonnes,
      scope3ApprovedCount: approvedScope3.length,
      scope3TotalCount: listScope3.length,
      totalTonnes: scope3Tonnes,
      uncertainty: null,
      boundaryMethod: null,
      methodologyVersion: null,
      gwpBasis: null,
      inputSha256: null,
      createdBy: null,
      createdAt: null,
      periodRevision: null,
      blockingExceptions: [],
      warningExceptions: [],
      memo: {},
      excluded: [],
    };
  }

  const scope1Tonnes = kgToTonnes(run.scope1_kg, run.summary?.scope1_tco2e);
  const scope2LocationTonnes = kgToTonnes(run.scope2_location_kg, run.summary?.scope2_tco2e);
  const scope2MarketTonnes = run.scope2_market_kg != null
    ? kgToTonnes(run.scope2_market_kg)
    : toFiniteNumber(run.summary?.scope2_market_tco2e);

  if (scope3Tonnes === null && run.summary?.scope3_tco2e != null && listScope3.length === 0) {
    scope3Tonnes = toFiniteNumber(run.summary.scope3_tco2e);
  }

  const parts = [scope1Tonnes, scope2LocationTonnes, scope3Tonnes].filter((v) => v !== null);
  const totalTonnes = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) : null;

  const exceptions = Array.isArray(run.exceptions) ? run.exceptions : [];
  return {
    hasRun: true,
    runId: run.id || null,
    scope1Tonnes,
    scope2LocationTonnes,
    scope2MarketTonnes,
    scope3Tonnes,
    scope3ApprovedCount: approvedScope3.length,
    scope3TotalCount: listScope3.length,
    totalTonnes,
    uncertainty: run.uncertainty || null,
    boundaryMethod: run.boundary_method || null,
    methodologyVersion: run.methodology_version || null,
    gwpBasis: run.gwp_basis || null,
    inputSha256: run.input_sha256 || null,
    createdBy: run.created_by || null,
    createdAt: run.created_at || null,
    periodRevision: run.period_revision ?? null,
    blockingExceptions: exceptions.filter((x) => Boolean(x.blocking)),
    warningExceptions: exceptions.filter((x) => !x.blocking),
    memo: run.memo && typeof run.memo === 'object' ? run.memo : {},
    excluded: Array.isArray(run.excluded) ? run.excluded : [],
  };
}

/**
 * Compute proportional share breakdown across reported scopes for chart and legend rendering.
 */
export function buildScopeShares({ scope1Tonnes, scope2LocationTonnes, scope3Tonnes }) {
  const entries = [
    { key: 'scope1', label: 'Scope 1 Direct', tonnes: scope1Tonnes, color: '#10b981' },
    { key: 'scope2', label: 'Scope 2 Location-based', tonnes: scope2LocationTonnes, color: '#38bdf8' },
    { key: 'scope3', label: 'Scope 3 Value Chain', tonnes: scope3Tonnes, color: '#f59e0b' },
  ].filter((item) => item.tonnes !== null);

  const total = entries.reduce((sum, item) => sum + item.tonnes, 0);
  return entries.map((item) => ({
    ...item,
    pct: total > 0 ? (item.tonnes / total) * 100 : 0,
  }));
}

/**
 * Aggregate per-facility emissions from CalculationRun.by_facility or CalculationRun.lines.
 */
export function buildFacilityBreakdown(facilities = [], run = null) {
  const list = Array.isArray(facilities) ? facilities : [];
  const facilityMap = Object.fromEntries(list.map((f) => [f.id, f]));
  const buckets = new Map();

  const ensureBucket = (facilityId) => {
    if (!buckets.has(facilityId)) {
      const fac = facilityMap[facilityId];
      buckets.set(facilityId, {
        id: facilityId,
        name: fac?.name || facilityId || 'Unassigned facility',
        gridRegion: fac?.grid_region || '—',
        scope1Tonnes: 0,
        scope2LocationTonnes: 0,
        totalTonnes: 0,
      });
    }
    return buckets.get(facilityId);
  };

  for (const fac of list) {
    ensureBucket(fac.id);
  }

  if (run?.by_facility && typeof run.by_facility === 'object' && Object.keys(run.by_facility).length > 0) {
    for (const [facId, vals] of Object.entries(run.by_facility)) {
      const bucket = ensureBucket(facId);
      const s1 = kgToTonnes(vals?.scope1_kg, vals?.scope1_tco2e) || 0;
      const s2 = kgToTonnes(vals?.scope2_location_kg, vals?.scope2_tco2e) || 0;
      bucket.scope1Tonnes = s1;
      bucket.scope2LocationTonnes = s2;
      bucket.totalTonnes = s1 + s2;
    }
  } else if (Array.isArray(run?.lines)) {
    for (const line of run.lines) {
      const facId = line.facility_id || list[0]?.id || 'unassigned';
      const bucket = ensureBucket(facId);
      const t = kgToTonnes(line.emissions_kg, line.co2e_tonnes) || 0;
      const scopeStr = String(line.scope || '').toLowerCase();
      if (scopeStr === '1' || scopeStr.includes('1')) {
        bucket.scope1Tonnes += t;
      } else if (scopeStr === '2' || scopeStr.includes('2')) {
        bucket.scope2LocationTonnes += t;
      }
      bucket.totalTonnes = bucket.scope1Tonnes + bucket.scope2LocationTonnes;
    }
  }

  return [...buckets.values()].sort((a, b) => b.totalTonnes - a.totalTonnes);
}

/**
 * Count workflow statuses and sum activity quantities cleanly inside each canonical unit.
 */
export function summarizeActivityPipeline(activities = []) {
  const list = Array.isArray(activities) ? activities : [];
  const counts = { APPROVED: 0, SUBMITTED: 0, DRAFT: 0, REJECTED: 0, total: list.length };
  const byType = new Map();

  for (const act of list) {
    const status = normalizeStatus(act.status);
    if (status in counts) {
      counts[status] += 1;
    }

    const typeKey = `${act.activity_type || 'unknown'}__${act.unit || ''}`;
    if (!byType.has(typeKey)) {
      byType.set(typeKey, {
        activityType: act.activity_type || 'unknown',
        unit: act.unit || '',
        totalQuantity: 0,
        approvedQuantity: 0,
        recordCount: 0,
        approvedCount: 0,
      });
    }
    const group = byType.get(typeKey);
    const qty = toFiniteNumber(act.quantity) || 0;
    group.totalQuantity += qty;
    group.recordCount += 1;
    if (status === 'APPROVED') {
      group.approvedQuantity += qty;
      group.approvedCount += 1;
    }
  }

  return {
    counts,
    byActivityType: [...byType.values()].sort((a, b) => b.recordCount - a.recordCount),
  };
}

/**
 * Group E/S/G non-GHG observations by Environmental, Social, and Governance pillars.
 */
export function summarizeMetricsByPillar(metrics = [], definitions = []) {
  const list = Array.isArray(metrics) ? metrics : [];
  const defs = Array.isArray(definitions) ? definitions : [];
  const defByKey = new Map();
  for (const d of defs) {
    const key = d.metric_key || d.code;
    if (key) defByKey.set(key, d);
  }

  const grouped = { E: [], S: [], G: [] };
  for (const m of list) {
    const key = m.metric_key || m.code;
    const def = defByKey.get(key);
    const pillar = normalizePillar(def?.pillar || m.pillar);
    if (!(pillar in grouped)) continue;
    grouped[pillar].push({
      id: m.id || `${pillar}-${key}`,
      metricKey: key,
      name: def?.name || key,
      value: toFiniteNumber(m.value),
      unit: m.unit || def?.unit || '',
      status: normalizeStatus(m.status),
      evidenceRef: m.evidence_ref || m.comment || null,
    });
  }

  return grouped;
}

/**
 * Normalize disclosure coverage metrics without claiming regulatory compliance.
 */
export function summarizeDisclosureCoverage(report) {
  if (!report) return null;

  if (report.counts && Array.isArray(report.requirements)) {
    const total = report.requirements.length;
    const counts = report.counts || {};
    const addressed = (counts.PUBLISHED || 0) + (counts.APPROVED || 0) + (counts.NOT_APPLICABLE || 0);
    const gaps = Math.max(0, total - addressed);
    return {
      framework: report.framework || 'GRI',
      templateVersion: report.template_version || null,
      materialityPerspective: report.materiality_perspective || null,
      addressed,
      total,
      gaps,
      pctAddressed: total > 0 ? Math.round((addressed / total) * 100) : 0,
      allAddressed: Boolean(report.all_requirements_addressed),
      requirementsPreview: report.requirements.slice(0, 6).map((q) => ({
        ref: q.ref,
        title: q.title,
        status: normalizeStatus(q.status),
        missingCount: Array.isArray(q.missing) ? q.missing.length : 0,
      })),
    };
  }

  if (Array.isArray(report.sections)) {
    const total = report.sections.length;
    return {
      framework: report.framework || 'Framework',
      templateVersion: null,
      materialityPerspective: null,
      addressed: 0,
      total,
      gaps: total,
      pctAddressed: 0,
      allAddressed: false,
      requirementsPreview: report.sections.slice(0, 6).map((s) => ({
        ref: s.code,
        title: s.name,
        status: 'DRAFT',
        missingCount: s.total_tco2e || s.metric ? 0 : 1,
      })),
    };
  }

  return null;
}

/**
 * Aggregate all Overview dashboard slices from live/offline ledger APIs.
 */
export function summarizeOverviewData({
  period = null,
  run = null,
  activities = [],
  facilities = [],
  factors = [],
  metrics = [],
  metricDefinitions = [],
  scope3Records = [],
  disclosureReport = null,
  snapshots = [],
}) {
  const inventory = extractRunScopeTotals(run, scope3Records);
  const scopeShares = buildScopeShares(inventory);
  const facilityBreakdown = buildFacilityBreakdown(facilities, run);
  const activityPipeline = summarizeActivityPipeline(activities);
  const factorList = Array.isArray(factors) ? factors : [];
  const factorCounts = {
    APPROVED: factorList.filter((f) => normalizeStatus(f.status) === 'APPROVED').length,
    DRAFT: factorList.filter((f) => normalizeStatus(f.status) === 'DRAFT').length,
    total: factorList.length,
  };
  const metricPillars = summarizeMetricsByPillar(metrics, metricDefinitions);
  const disclosure = summarizeDisclosureCoverage(disclosureReport);
  const snapshotList = Array.isArray(snapshots) ? snapshots : (snapshots?.items || []);

  return {
    period,
    inventory,
    scopeShares,
    facilityBreakdown,
    activityPipeline,
    factorCounts,
    metricPillars,
    disclosure,
    snapshots: {
      count: snapshotList.length,
      latest: snapshotList[0] || null,
    },
  };
}
