// Environmental, social and governance metrics: aggregated figures with evidence and independent review.
import { useState } from 'react';
import { esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, useAction, useEsgData } from './ui';

const PILLARS = [['E', 'Environmental'], ['S', 'Social'], ['G', 'Governance']];

export default function MetricsPanel({ me, can, periods, facilities }) {
  const [periodId, setPeriodId] = useState(periods?.[0]?.id || '');
  const [pillar, setPillar] = useState('E');
  const [metricKey, setMetricKey] = useState('');
  const defs = useEsgData('/api/esg/metric-definitions');
  const obs = useEsgData(periodId ? `/api/esg/metrics?period_id=${periodId}&pillar=${pillar}&limit=200` : null);
  const action = useAction();
  const period = (periods || []).find((p) => p.id === periodId);
  const pillarDefs = (defs.data || []).filter((d) => d.pillar === pillar);
  const def = pillarDefs.find((d) => d.metric_key === metricKey) || pillarDefs[0];
  const defName = Object.fromEntries((defs.data || []).map((d) => [d.metric_key, d.name]));
  const facilityName = Object.fromEntries((facilities || []).map((f) => [f.id, f.name]));

  if (!periods?.length) return <Panel title="E/S/G metrics"><p className="text-sm text-mist">Create a reporting period first.</p></Panel>;

  const create = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const dimensions = Object.fromEntries(Object.keys(def.dimensions).map((d) => [d, f.get(`dim_${d}`)]).filter(([, v]) => v));
    const body = { period_id: periodId, metric_key: def.metric_key, value: f.get('value'), dimensions,
                   ...(f.get('facility_id') ? { facility_id: f.get('facility_id') } : {}),
                   ...(f.get('evidence_ref') ? { evidence_ref: f.get('evidence_ref') } : {}) };
    if (await action.run(() => esgSend('POST', '/api/esg/metrics', body), 'Saved as DRAFT. Submit it for review.')) { form.reset(); obs.reload(); }
  };

  const act = (id, verb, body) => async () => {
    if (await action.run(() => esgSend('POST', `/api/esg/metrics/${id}/${verb}`, body), `Observation ${verb === 'submit' ? 'submitted' : `${verb}d`}.`)) obs.reload();
  };

  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />
      <Panel title="E/S/G metrics" description="Aggregated figures only — never records about individual people. Self-reported values are not external certification."
        actions={<div className="flex flex-wrap gap-3">
          <div className="w-48"><Select label="Reporting period" value={periodId} onChange={(e) => setPeriodId(e.target.value)} options={periods.map((p) => [p.id, p.name])} /></div>
          <div className="w-44"><Select label="Pillar" value={pillar} onChange={(e) => { setPillar(e.target.value); setMetricKey(''); }} options={PILLARS} /></div>
        </div>}>
        <Loading state={obs} empty="No observations for this pillar and period yet.">
          <Table caption="Metric observations" rows={obs.data?.items || []} columns={[
            { key: 'metric_key', label: 'Metric', render: (o) => defName[o.metric_key] || o.metric_key },
            { key: 'facility_id', label: 'Scope', render: (o) => (o.facility_id ? facilityName[o.facility_id] : 'Organization') },
            { key: 'dimensions', label: 'Breakdown', render: (o) => Object.entries(o.dimensions || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '—' },
            { key: 'value', label: 'Value', render: (o) => `${Number(o.value).toLocaleString()} ${o.unit}` },
            { key: 'evidence_ref', label: 'Evidence' },
            { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
            { key: 'actions', label: '', render: (o) => (
              <div className="flex gap-2">
                {can.write && ['DRAFT', 'REJECTED'].includes(o.status) && <Button variant="secondary" onClick={act(o.id, 'submit')}>Submit</Button>}
                {can.review && o.status === 'SUBMITTED' && o.created_by !== me && <Button onClick={act(o.id, 'approve', {})}>Approve</Button>}
              </div>) },
          ]} />
        </Loading>
      </Panel>
      {can.write && period?.status === 'OPEN' && def && (
        <Panel title="Add a figure">
          <form key={def.metric_key} onSubmit={create} className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="New metric observation">
            <Select label="Metric" value={def.metric_key} onChange={(e) => setMetricKey(e.target.value)}
              options={pillarDefs.map((d) => [d.metric_key, `${d.name} (${d.unit})`])} />
            <Select label="Facility" name="facility_id" options={[['', 'Whole organization'], ...(facilities || []).map((f) => [f.id, f.name])]} />
            {def.kind === 'boolean'
              ? <Select label="Answer" name="value" options={[['1', 'Yes'], ['0', 'No']]} />
              : <Input label={`Value (${def.unit})`} name="value" type="number" min="0" max={def.kind === 'percent' ? 100 : undefined}
                  step={def.kind === 'integer' ? 1 : 'any'} required />}
            {Object.entries(def.dimensions).map(([d, values]) => (
              <Select key={d} label={`Breakdown: ${d}`} name={`dim_${d}`} options={[['', 'Total (no breakdown)'], ...values.map((v) => [v, v.replace(/_/g, ' ')])]} />
            ))}
            <Input label="Evidence reference" name="evidence_ref" maxLength={200} hint="Bill, register or policy document" />
            <Button type="submit" disabled={action.busy}>Save draft</Button>
          </form>
          {def.sensitive && <p className="text-xs text-amber-300">Sensitive breakdown: enter only aggregated counts, and only where lawful and needed.</p>}
        </Panel>
      )}
    </div>
  );
}
