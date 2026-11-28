// Live Executive Overview Dashboard for EsgWorkspace.
// Renders Scope 1/2/3 KPIs, facility breakdown, activity workflow status, E/S/G pillars,
// and disclosure readiness strictly from API responses — never placeholder figures.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { esgGet } from '../../../lib/esgApi';
import { Button, Loading, Notice, Panel, Select, StatusBadge, useEsgData } from './ui';
import { FacilityBars, KpiCard, ScopeDonutChart } from './OverviewCharts';
import { formatTonnes, summarizeOverviewData } from './overviewHelpers';

/* [COMMENTED OUT FOR PERSONAL REFERENCE — extracted KpiCard, ScopeDonutChart, FacilityBars into OverviewCharts.jsx to stay under 400 lines] */

export default function OverviewPanel({ periods, facilities, onNavigateTab, isDemoWorkspace }) {
  const [periodId, setPeriodId] = useState(periods?.[0]?.id || '');
  const [latestRun, setLatestRun] = useState(null);
  const [runError, setRunError] = useState(null);
  const [runLoading, setRunLoading] = useState(false);

  useEffect(() => {
    if (periods?.length && !periods.some((p) => p.id === periodId)) {
      setPeriodId(periods[0].id);
    }
  }, [periods, periodId]);

  const activePeriod = (periods || []).find((p) => p.id === periodId) || null;

  const activities = useEsgData(periodId ? `/api/esg/activities?period_id=${periodId}&limit=200` : null);
  const factors = useEsgData('/api/esg/factors?limit=200');
  const scope3 = useEsgData(periodId ? `/api/esg/scope3-records?period_id=${periodId}&limit=200` : null);
  const metricDefs = useEsgData('/api/esg/metric-definitions');
  const metrics = useEsgData(periodId ? `/api/esg/metrics?period_id=${periodId}&limit=200` : null);
  const frameworks = useEsgData('/api/esg/disclosure-frameworks');
  const snapshots = useEsgData(periodId ? `/api/esg/periods/${periodId}/snapshots` : null);

  const fwList = Array.isArray(frameworks.data) ? frameworks.data : (frameworks.data?.items || []);
  const primaryFramework = fwList[0]?.framework || fwList[0]?.id || null;
  const disclosure = useEsgData(
    periodId && primaryFramework ? `/api/esg/periods/${periodId}/disclosures/${primaryFramework}` : null,
  );

  useEffect(() => {
    if (!periodId) {
      setLatestRun(null);
      return;
    }
    let live = true;
    setRunLoading(true);
    setRunError(null);
    esgGet(`/api/esg/periods/${periodId}/calculations?limit=1`)
      .then((list) => {
        const firstId = list?.items?.[0]?.id;
        return firstId ? esgGet(`/api/esg/calculations/${firstId}`) : null;
      })
      .then((run) => {
        if (live) {
          setLatestRun(run);
          setRunLoading(false);
        }
      })
      .catch((err) => {
        if (live) {
          setLatestRun(null);
          setRunError(err.message);
          setRunLoading(false);
        }
      });
    return () => { live = false; };
  }, [periodId, activePeriod?.status]);

  const vm = useMemo(() => {
    const defList = Array.isArray(metricDefs.data) ? metricDefs.data : (metricDefs.data?.items || []);
    return summarizeOverviewData({
      period: activePeriod,
      run: latestRun,
      activities: activities.data?.items || [],
      facilities: facilities || [],
      factors: factors.data?.items || [],
      metrics: metrics.data?.items || [],
      metricDefinitions: defList,
      scope3Records: scope3.data?.items || [],
      disclosureReport: disclosure.data,
      snapshots: snapshots.data,
    });
  }, [
    activePeriod,
    latestRun,
    activities.data,
    facilities,
    factors.data,
    metrics.data,
    metricDefs.data,
    scope3.data,
    disclosure.data,
    snapshots.data,
  ]);

  if (!periods?.length) {
    return (
      <Panel
        title="Overview dashboard"
        description="Configure at least one legal entity, facility, and reporting period in Setup to track your GHG inventory and ESG metrics."
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigateTab?.('setup')}>Open Setup</Button>
          <Link
            to="/demo-showcase"
            className="inline-flex min-h-[40px] items-center rounded-lg border border-mist/40 px-4 py-2 font-mono text-xs font-bold text-registry hover:border-emerald"
          >
            Explore Visual Demo Showcase →
          </Link>
        </div>
      </Panel>
    );
  }

  const { inventory, scopeShares, facilityBreakdown, activityPipeline, factorCounts, metricPillars, disclosure: disc } = vm;
  const scope1Share = scopeShares.find((s) => s.key === 'scope1');
  const scope2Share = scopeShares.find((s) => s.key === 'scope2');
  const scope1Unc = inventory.uncertainty?.scope1?.uncertainty_pct;
  const scope2LocUnc = inventory.uncertainty?.scope2_location?.uncertainty_pct;

  return (
    <div className="space-y-6">
      <Notice error={runError} />

      {/* Top Reporting Period Control & Demo Showcase Switcher Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald/20 bg-forest/50 p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald">Executive Inventory Summary</span>
            {activePeriod && <StatusBadge status={activePeriod.status} />}
            <span className="rounded bg-mist/15 px-2 py-0.5 font-mono text-[11px] text-mist">
              {activePeriod?.boundary_method?.replace('_', ' ') || 'boundary'}
            </span>
          </div>
          <p className="text-xs text-mist">
            Computed from approved ledger entries only. Internal calculation — not external assurance.
            {isDemoWorkspace && ' Active tenant contains illustrative Bangladesh sample data.'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-56">
            <Select
              label="Reporting period"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              options={periods.map((p) => [p.id, `${p.name} (${p.status})`])}
            />
          </div>
        </div>
      </section>

      {/* Row 1: Top 4 KPI Cards */}
      <section aria-label="Key emissions and readiness indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          eyebrow="Gross Inventory (Location)"
          valueText={runLoading ? 'Loading…' : (inventory.totalTonnes != null ? `${formatTonnes(inventory.totalTonnes)} tCO₂e` : 'Not calculated')}
          subtitle={
            inventory.hasRun
              ? `${vm.snapshots.count} locked snapshot(s) · rev ${inventory.periodRevision ?? activePeriod?.revision ?? 1}`
              : `${activityPipeline.counts.APPROVED} approved activity record(s) ready`
          }
          badge={inventory.blockingExceptions.length > 0
              ? <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] text-red-700 dark:text-red-300">{inventory.blockingExceptions.length} blocker(s)</span>
              : null}
          actionLabel="Calculation & reports"
          onAction={() => onNavigateTab?.('reports')}
        />

        <KpiCard
          eyebrow="Scope 1 Direct"
          valueText={inventory.scope1Tonnes != null ? `${formatTonnes(inventory.scope1Tonnes)} tCO₂e` : 'Not calculated'}
          subtitle={
            inventory.scope1Tonnes != null
              ? `${scope1Share ? `${scope1Share.pct.toFixed(1)}% of inventory` : 'Direct combustion & process'}${scope1Unc != null ? ` · ±${scope1Unc}% (95%)` : ''}`
              : 'Fuels, boilers, generators & refrigerants'
          }
          actionLabel="Activity ledger"
          onAction={() => onNavigateTab?.('ledger')}
        />

        <KpiCard
          eyebrow="Scope 2 Electricity"
          valueText={inventory.scope2LocationTonnes != null ? `${formatTonnes(inventory.scope2LocationTonnes)} tCO₂e` : 'Not calculated'}
          subtitle={
            inventory.scope2MarketTonnes != null
              ? `Location (${scope2Share ? `${scope2Share.pct.toFixed(1)}%` : '—'}) · Market: ${formatTonnes(inventory.scope2MarketTonnes)} tCO₂e`
              : `Location-based${scope2LocUnc != null ? ` (±${scope2LocUnc}%)` : ''} · Market-based: Not reported`
          }
          actionLabel="Emission factors"
          onAction={() => onNavigateTab?.('factors')}
        />

        <KpiCard
          eyebrow="Scope 3 & Workflow Gate"
          valueText={inventory.scope3Tonnes != null ? `${formatTonnes(inventory.scope3Tonnes)} tCO₂e` : 'Not recorded'}
          subtitle={
            `${activityPipeline.counts.APPROVED}/${activityPipeline.counts.total} activities · ${factorCounts.APPROVED}/${factorCounts.total} factors approved`
          }
          actionLabel="Disclosures"
          onAction={() => onNavigateTab?.('disclosures')}
        />
      </section>

      {/* Row 2: Scope Donut + Facility Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Emissions by GHG Scope"
          description="Share of Scope 1 direct, Scope 2 location-based, and approved Scope 3 value-chain emissions."
        >
          <ScopeDonutChart
            shares={scopeShares}
            totalTonnes={inventory.totalTonnes}
            hasRun={inventory.hasRun}
            onOpenReports={() => onNavigateTab?.('reports')}
          />
          {inventory.hasRun && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-mist/15 pt-3 text-xs text-mist">
              <span>Methodology: <strong className="text-registry">{inventory.methodologyVersion || '—'}</strong></span>
              <span>GWP: <strong className="text-registry">{inventory.gwpBasis || '—'}</strong></span>
              {inventory.inputSha256 && (
                <span>Input SHA-256: <strong className="font-mono text-registry">{inventory.inputSha256.slice(0, 12)}…</strong></span>
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="Facility Footprint & Review Pipeline"
          description="Emissions intensity per boundary facility and dual-control activity approval counts."
          actions={<Button variant="secondary" onClick={() => onNavigateTab?.('setup')}>Facilities ({facilities?.length || 0})</Button>}
        >
          <FacilityBars rows={facilityBreakdown} hasRun={inventory.hasRun} />
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-subtle pt-4 sm:grid-cols-4">
              {[
                ['Approved', activityPipeline.counts.APPROVED, 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10'],
                ['In review', activityPipeline.counts.SUBMITTED, 'text-amber-800 dark:text-amber-300 border-amber-500/30 bg-amber-500/10'],
                ['Draft', activityPipeline.counts.DRAFT, 'text-fg-secondary border-border-subtle bg-bg-elevated/60'],
                ['Rejected', activityPipeline.counts.REJECTED, 'text-red-700 dark:text-red-300 border-red-500/30 bg-red-500/10'],
              ].map(([label, count, cls]) => (
                <div key={label} className={`rounded-lg border px-3 py-2 ${cls}`}>
                  <div className="font-mono text-[10px] uppercase">{label}</div>
                  <div className="mt-0.5 font-mono text-lg font-bold">{count}</div>
                </div>
              ))}
            </div>
        </Panel>
      </div>

      {/* Row 3: Activity Mix in Native Units + Calculation Governance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Energy & Fuel Activity Mix"
          description="Totals grouped strictly by activity type and canonical unit (never mixing units)."
          actions={<Button variant="secondary" onClick={() => onNavigateTab?.('ledger')}>Manage ledger</Button>}
        >
          <Loading state={activities} empty="No activity records logged for this period yet.">
            <div className="space-y-2.5">
              {activityPipeline.byActivityType.map((row) => (
                <div
                  key={`${row.activityType}-${row.unit}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mist/15 bg-carbon/40 px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-registry">{row.activityType}</div>
                    <div className="text-mist">{row.approvedCount}/{row.recordCount} records approved</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-emerald-300">
                      {row.approvedQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} {row.unit}
                    </div>
                    {row.totalQuantity > row.approvedQuantity && (
                      <div className="text-[10px] text-mist">
                        {row.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} {row.unit} logged total
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Loading>
        </Panel>

        <Panel
          title="E/S/G Non-GHG Pillar Highlights"
          description="Self-reported organizational metrics across Environmental, Social, and Governance pillars."
          actions={<Button variant="secondary" onClick={() => onNavigateTab?.('metrics')}>Open E/S/G metrics</Button>}
        >
          <Loading state={metrics} empty="No E/S/G metric observations recorded for this period yet.">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['E', 'Environmental'],
                ['S', 'Social'],
                ['G', 'Governance'],
              ].map(([key, label]) => (
                <div key={key} className="rounded-xl border border-mist/20 bg-carbon/40 p-3 space-y-2">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-emerald">{label}</div>
                  {metricPillars[key].length === 0 ? (
                    <p className="text-xs text-mist">None recorded</p>
                  ) : (
                    metricPillars[key].slice(0, 3).map((m) => (
                      <div key={m.id} className="border-t border-mist/10 pt-2 first:border-t-0 first:pt-0">
                        <div className="text-xs text-registry">{m.name}</div>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-300">
                            {m.value != null ? m.value.toLocaleString() : '—'} {m.unit}
                          </span>
                          <StatusBadge status={m.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </Loading>
        </Panel>
      </div>

      {/* Row 4: Disclosure Readiness & Data-Quality Alerts */}
      <Panel
        title="Disclosure Readiness & Data-Quality Checks"
        description="Shows which framework requirements have approved evidence vs explicit remaining gaps — not a determination of compliance."
        actions={<Button variant="secondary" onClick={() => onNavigateTab?.('disclosures')}>Open Disclosures</Button>}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            {disc ? (
              <div className="space-y-3 rounded-xl border border-mist/20 bg-carbon/40 p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-registry">
                    {disc.framework} {disc.templateVersion ? `v${disc.templateVersion}` : ''}
                  </span>
                  <span className="font-mono text-mist">
                    {disc.addressed}/{disc.total} addressed ({disc.gaps} gaps remain)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-carbon">
                  <div className="h-full bg-emerald transition-all duration-300" style={{ width: `${disc.pctAddressed}%` }} />
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {disc.requirementsPreview.map((req) => (
                    <div key={req.ref} className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-mono text-mist">{req.ref}</span>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-mist/30 px-3 py-4 text-sm text-mist">
                Disclosure coverage summary will appear once a framework template loads.
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-mist/20 bg-carbon/40 p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-mist">
              Calculation Exceptions ({inventory.blockingExceptions.length + inventory.warningExceptions.length})
            </div>
            {!inventory.hasRun ? (
              <p className="text-xs text-mist">Run a calculation to inspect factor matching and market-instrument exceptions.</p>
            ) : (inventory.blockingExceptions.length === 0 && inventory.warningExceptions.length === 0) ? (
              <p className="text-xs text-emerald-300">Zero blocking or warning exceptions recorded in the latest calculation run.</p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {[...inventory.blockingExceptions, ...inventory.warningExceptions].slice(0, 5).map((ex, idx) => (
                  <li key={`${ex.code}-${idx}`} className="flex items-start gap-2">
                    <span className={ex.blocking ? 'font-mono text-red-300' : 'font-mono text-amber-300'}>
                      {ex.code}
                    </span>
                    <span className="text-mist">{ex.detail || ex.activity_type || ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
