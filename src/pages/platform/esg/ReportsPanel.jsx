// Calculation explorer, data-quality exceptions, period lock and immutable report snapshots.
import { useEffect, useState } from 'react';
import { esgDownload, esgGet, esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, useAction, useEsgData } from './ui';

const tonnes = (kg) => (kg == null ? null : (Number(kg) / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 }));

function Total({ label, kg, note }) {
  return (
    <div className="rounded-xl border border-mist/20 bg-carbon/50 p-4">
      <div className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</div>
      <div className="mt-1 text-2xl text-registry">{kg == null ? 'Not reported' : `${tonnes(kg)} tCO₂e`}</div>
      {note && <div className="mt-1 text-xs text-mist">{note}</div>}
    </div>
  );
}

export default function ReportsPanel({ can, me, periods, facilities, onPeriodsChanged }) {
  const [periodId, setPeriodId] = useState(periods?.[0]?.id || '');
  const [run, setRun] = useState(null);
  const snapshots = useEsgData(periodId ? `/api/esg/periods/${periodId}/snapshots` : null);
  const action = useAction();
  const period = (periods || []).find((p) => p.id === periodId);
  const facilityName = Object.fromEntries((facilities || []).map((f) => [f.id, f.name]));

  // Show the latest run for the period so a second person can review and approve it.
  useEffect(() => {
    if (!periodId) return;
    let live = true;
    esgGet(`/api/esg/periods/${periodId}/calculations?limit=1`)
      .then((list) => (list.items[0] ? esgGet(`/api/esg/calculations/${list.items[0].id}`) : null))
      .then((latest) => live && setRun(latest), () => live && setRun(null));
    return () => { live = false; };
  }, [periodId, period?.status]);

  if (!periods?.length) return <Panel title="Calculation & reports"><p className="text-sm text-mist">Create a reporting period first.</p></Panel>;

  const calculate = async () => {
    const created = await action.run(() => esgSend('POST', `/api/esg/periods/${periodId}/calculate`), 'Calculation complete.');
    if (created) setRun(await action.run(() => esgSend('GET', `/api/esg/calculations/${created.id}`)));
  };

  const lock = async () => {
    if (await action.run(() => esgSend('POST', `/api/esg/periods/${periodId}/lock`, { calculation_run_id: run.id }),
      'Period locked and report snapshot recorded.')) { setRun(null); snapshots.reload(); onPeriodsChanged(); }
  };

  const restate = async (e) => {
    e.preventDefault();
    const reason = new FormData(e.currentTarget).get('reason');
    if (await action.run(() => esgSend('POST', `/api/esg/periods/${periodId}/restate`, { reason }),
      'Period re-opened as a new revision. Earlier snapshots are kept unchanged.')) onPeriodsChanged();
  };

  const download = async (snap, format) => {
    const file = await action.run(() => esgDownload(`/api/esg/snapshots/${snap.id}/export?format=${format}`));
    if (!file) return;
    const url = URL.createObjectURL(new Blob([file.text], { type: format === 'csv' ? 'text/csv' : 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `esg-report-${period.name}-r${snap.revision}.${format}` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const blocking = run?.exceptions.filter((x) => x.blocking) || [];

  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />
      <Panel title="Calculation" description="Scope 1 and Scope 2 from APPROVED records only. Every line shows its formula and factor version."
        actions={<div className="flex flex-wrap items-end gap-3">
          <div className="w-56"><Select label="Reporting period" value={periodId} onChange={(e) => { setPeriodId(e.target.value); setRun(null); }}
            options={periods.map((p) => [p.id, `${p.name} (${p.status})`])} /></div>
          {can.write && period?.status === 'OPEN' && <Button onClick={calculate} disabled={action.busy}>Run calculation</Button>}
        </div>}>
        {period?.status === 'LOCKED' && <p className="text-sm text-mist">This period is locked (revision {period.revision}). Its reports are below.</p>}
        {run && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Total label="Scope 1" kg={run.scope1_kg} />
              <Total label="Scope 2 — location-based" kg={run.scope2_location_kg} />
              <Total label="Scope 2 — market-based" kg={run.scope2_market_kg}
                note={run.scope2_market_kg == null ? 'Missing market-based inputs for some electricity; not estimated.' : null} />
            </div>
            <p className="text-xs text-mist">Prepared by {run.created_by} at {run.created_at}{run.period_revision !== period?.revision ? ' (earlier revision)' : ''}.</p>
            <p className="text-xs text-mist">Boundary: {run.boundary_method.replace('_', ' ')} · Methodology {run.methodology_version} · Inputs {run.input_sha256.slice(0, 12)}… · Scope 3 not included.</p>
            {run.exceptions.length > 0 && (
              <Table caption="Data-quality exceptions" rowKey="key" rows={run.exceptions.map((x, i) => ({ ...x, key: i }))} columns={[
                { key: 'code', label: 'Exception', render: (x) => <span className={x.blocking ? 'text-red-300' : 'text-amber-300'}>{x.code}{x.blocking ? ' (blocks lock)' : ''}</span> },
                { key: 'activity_type', label: 'Activity' },
                { key: 'facility_id', label: 'Facility', render: (x) => facilityName[x.facility_id] },
                { key: 'detail', label: 'Detail' },
              ]} />
            )}
            {Object.keys(run.memo).length > 0 && <p className="text-sm text-mist">Memo items (not in totals): {Object.entries(run.memo).map(([k, v]) => `${k} ${Number(v).toLocaleString()} kWh`).join(', ')}</p>}
            {run.excluded.length > 0 && <p className="text-sm text-mist">Excluded by boundary: {run.excluded.map((x) => facilityName[x.facility_id]).join(', ')}</p>}
            <Table caption="Calculation lines" rows={run.lines} columns={[
              { key: 'facility_id', label: 'Facility', render: (l) => facilityName[l.facility_id] },
              { key: 'scope', label: 'Scope', render: (l) => `${l.scope} (${l.method})` },
              { key: 'formula', label: 'Formula', render: (l) => <span className="font-mono text-xs">{l.formula}</span> },
              { key: 'factor_version', label: 'Factor', render: (l) => `v${l.factor_version}` },
            ]} />
            {can.admin && (
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={lock} disabled={action.busy || blocking.length > 0 || run.created_by === me}>Approve & lock period</Button>
                {blocking.length > 0 && <span className="text-xs text-red-300">Resolve blocking exceptions first.</span>}
                {run.created_by === me && <span className="text-xs text-mist">Another admin must approve a calculation you ran.</span>}
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Report snapshots" description="Locked, content-addressed reports. Exporting the same snapshot always produces identical files. Internal calculation — not external assurance.">
        <Loading state={snapshots} empty="No locked reports for this period yet.">
          <Table caption="Report snapshots" rows={snapshots.data || []} columns={[
            { key: 'revision', label: 'Revision' },
            { key: 'created_at', label: 'Locked at' },
            { key: 'prepared_by', label: 'Prepared by' },
            { key: 'approved_by', label: 'Approved by' },
            { key: 'content_sha256', label: 'SHA-256', render: (s) => <span className="font-mono text-xs">{s.content_sha256.slice(0, 16)}…</span> },
            { key: 'export', label: 'Export', render: (s) => (
              <div className="flex gap-2"><Button variant="secondary" onClick={() => download(s, 'csv')}>CSV</Button>
                <Button variant="secondary" onClick={() => download(s, 'json')}>JSON</Button></div>) },
          ]} />
        </Loading>
        {can.admin && period?.status === 'LOCKED' && (
          <form onSubmit={restate} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" aria-label="Restate period">
            <Input label="Reason for restatement" name="reason" required maxLength={2000} />
            <Button type="submit" variant="secondary" disabled={action.busy}>Restate period</Button>
          </form>
        )}
        <p className="text-xs text-mist">Status: <StatusBadge status={period?.status} /></p>
      </Panel>
    </div>
  );
}
