// Framework disclosure coverage and gap explorer. Coverage is never shown as compliance.
import { useState } from 'react';
import { esgDownload, esgSend } from '../../../lib/esgApi';
import { Button, Loading, Notice, Panel, Select, StatusBadge, Table, useAction, useEsgData } from './ui';

export default function DisclosuresPanel({ me, can, periods }) {
  const [periodId, setPeriodId] = useState(periods?.[0]?.id || '');
  const [framework, setFramework] = useState('GRI');
  const [editing, setEditing] = useState(null);
  const frameworks = useEsgData('/api/esg/disclosure-frameworks');
  const report = useEsgData(periodId ? `/api/esg/periods/${periodId}/disclosures/${framework}` : null);
  const action = useAction();
  const base = (ref) => `/api/esg/periods/${periodId}/disclosures/${framework}/${encodeURIComponent(ref)}`;

  if (!periods?.length) return <Panel title="Disclosures"><p className="text-sm text-mist">Create a reporting period first.</p></Panel>;

  const save = (ref) => async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { status: f.get('status'), narrative: f.get('narrative') || null, applicability_rationale: f.get('rationale') || null };
    if (await action.run(() => esgSend('PUT', base(ref), body), 'Response saved.')) { setEditing(null); report.reload(); }
  };
  const step = (ref, verb) => async () => {
    if (await action.run(() => esgSend('POST', `${base(ref)}/${verb}`), verb === 'approve' ? 'Response approved.' : 'Response published.')) report.reload();
  };
  const downloadGap = async () => {
    const file = await action.run(() => esgDownload(`/api/esg/periods/${periodId}/disclosures/${framework}?format=csv`));
    if (!file) return;
    const url = URL.createObjectURL(new Blob([file.text], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `gap-report-${framework}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  const r = report.data;
  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />
      <Panel title="Disclosure coverage" description="Which requirements have supporting data and reviewed responses. This is not a compliance determination and does not replace external assurance."
        actions={<div className="flex flex-wrap items-end gap-3">
          <div className="w-44"><Select label="Reporting period" value={periodId} onChange={(e) => setPeriodId(e.target.value)} options={periods.map((p) => [p.id, p.name])} /></div>
          <div className="w-64"><Select label="Framework" value={framework} onChange={(e) => setFramework(e.target.value)}
            options={(frameworks.data || [{ framework: 'GRI', name: 'GRI' }]).map((f) => [f.framework, f.name])} /></div>
          <Button variant="secondary" onClick={downloadGap}>Gap report (CSV)</Button>
        </div>}>
        {r && (
          <div className="space-y-2 text-sm text-mist">
            <p>Template {r.template_version} · {r.materiality_perspective} materiality perspective ·{' '}
              <span className="text-amber-300">references to be verified against the official standard</span></p>
            <p role="status">{Object.entries(r.counts).map(([k, v]) => `${v} ${k.replace(/_/g, ' ').toLowerCase()}`).join(' · ')}
              {r.all_requirements_addressed ? ' — every requirement has an approved response or a recorded non-applicability decision.' : ' — gaps remain.'}</p>
          </div>
        )}
        <Loading state={report} empty="No requirements.">
          <Table caption="Disclosure requirements" rowKey="ref" rows={r?.requirements || []} columns={[
            { key: 'ref', label: 'Requirement', render: (q) => <span><span className="font-mono text-xs">{q.ref}</span><span className="block">{q.title}</span></span> },
            { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
            { key: 'missing', label: 'Gaps / evidence', render: (q) => (q.missing.length
              ? <ul className="list-disc pl-4 text-xs text-red-300">{q.missing.map((m) => <li key={m}>{m}</li>)}</ul>
              : <span className="text-xs text-mist">{Object.entries(q.evidence).filter(([k]) => k !== 'ghg_snapshot').map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.length} approved value(s)` : `${k}: ${v}`)).join('; ') || (q.data_status === 'NARRATIVE_ONLY' ? 'Narrative only' : '')}</span>) },
            { key: 'narrative', label: 'Response', render: (q) => (
              <div className="space-y-2 text-xs">
                {q.narrative && <p className="max-w-xs text-registry">{q.narrative}</p>}
                {q.applicability_rationale && <p className="max-w-xs text-mist">Not applicable: {q.applicability_rationale}</p>}
                {editing === q.ref && (
                  <form onSubmit={save(q.ref)} className="space-y-2" aria-label={`Edit response ${q.ref}`}>
                    <label className="block">Status
                      <select name="status" defaultValue={q.response_status === 'NOT_STARTED' ? 'DRAFT' : q.response_status} className="ml-2 rounded border border-mist/30 bg-carbon px-2 py-1">
                        <option value="DRAFT">Draft</option><option value="IN_REVIEW">Send for review</option><option value="NOT_APPLICABLE">Not applicable</option>
                      </select></label>
                    <label className="block">Narrative<textarea name="narrative" defaultValue={q.narrative || ''} rows={3} className="mt-1 w-full rounded border border-mist/30 bg-carbon p-2" /></label>
                    <label className="block">Reason if not applicable<input name="rationale" defaultValue={q.applicability_rationale || ''} className="mt-1 w-full rounded border border-mist/30 bg-carbon p-2" /></label>
                    <div className="flex gap-2"><Button type="submit">Save</Button><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button></div>
                  </form>
                )}
              </div>) },
            { key: 'actions', label: '', render: (q) => (
              <div className="flex flex-wrap gap-2">
                {can.write && q.response_status !== 'PUBLISHED' && editing !== q.ref && <Button variant="secondary" onClick={() => setEditing(q.ref)}>Edit</Button>}
                {can.review && q.response_status === 'IN_REVIEW' && q.updated_by !== me && !q.missing.length && <Button onClick={step(q.ref, 'approve')}>Approve</Button>}
                {can.admin && q.response_status === 'APPROVED' && <Button onClick={step(q.ref, 'publish')}>Publish</Button>}
              </div>) },
          ]} />
        </Loading>
      </Panel>
    </div>
  );
}
