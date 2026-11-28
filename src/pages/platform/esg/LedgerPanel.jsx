// Activity-data ledger: enter or extract activity data with evidence, then submit → independent review.
import { useState } from 'react';
import { hasEvidenceMetadata } from '../../../lib/ledgerEvidence';
import { esgFetch, esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, StatusBadge, Table, formValues, useAction, useEsgData } from './ui';

// Extracted parameter → inventory activity type and unit. Other extracted values (headcount, travel,
// freight) are Scope 3 inputs, which this ledger does not account for yet.
const EXTRACTED = { electricity: ['electricity', 'kWh'], diesel: ['diesel', 'L'], petrol: ['petrol', 'L'], lpg: ['lpg', 'kg'] };

export default function LedgerPanel({ me, can, types, periods, facilities }) {
  const openPeriods = (periods || []).filter((p) => p.status === 'OPEN');
  const [periodId, setPeriodId] = useState(openPeriods[0]?.id || periods?.[0]?.id || '');
  const [draft, setDraft] = useState({});
  const [extraction, setExtraction] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [filters, setFilters] = useState({ facility: '', activity: '', status: '' });
  const [offset, setOffset] = useState(0);
  const params = new URLSearchParams({ period_id: periodId, limit: '25', offset: String(offset) });
  if (filters.facility) params.set('facility_id', filters.facility);
  if (filters.activity) params.set('activity_type', filters.activity);
  if (filters.status) params.set('status', filters.status);
  const activities = useEsgData(periodId ? `/api/esg/activities?${params}` : null);
  const rows = activities.data?.items || [];
  const totalRows = activities.data?.total ?? rows.length;
  const hasFilters = Boolean(filters.facility || filters.activity || filters.status);
  const withMetadata = rows.filter(hasEvidenceMetadata).length;
  const filter = (key) => (event) => { setFilters((current) => ({ ...current, [key]: event.target.value })); setOffset(0); };
  const action = useAction();
  const allTypes = [...(types?.inventory || []), ...(types?.memo || [])];
  const facilityName = Object.fromEntries((facilities || []).map((f) => [f.id, f.name]));
  const period = (periods || []).find((p) => p.id === periodId);
  const typeInfo = allTypes.find((t) => t.activity_type === (draft.activity_type || allTypes[0]?.activity_type));

  if (!periods?.length || !facilities?.length) {
    return <Panel title="Activity ledger"><p className="text-sm text-mist">Add at least one facility and reporting period in Setup first.</p></Panel>;
  }

  const create = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const body = { ...formValues(form), period_id: periodId };
    const rec = await action.run(() => esgSend('POST', '/api/esg/activities', body),
      (r) => (r.created ? 'Saved as DRAFT. Submit it for review when ready.' : 'This import key was already recorded; the existing record is shown.'));
    if (rec) { form.reset(); setDraft({}); setExtraction(null); activities.reload(); }
  };

  const transition = (id, verb, body) => async () => {
    if (await action.run(() => esgSend('POST', `/api/esg/activities/${id}/${verb}`, body), `Record ${verb === 'submit' ? 'submitted' : `${verb}d`}.`)) activities.reload();
  };

  const reject = (id) => (e) => {
    e.preventDefault();
    transition(id, 'reject', { comment: new FormData(e.currentTarget).get('comment') })().then(() => setRejecting(null));
  };

  const extract = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const res = await action.run(() => esgFetch('/api/esg/extract-footprint', { method: 'POST', body }),
      (r) => `Found ${r.details.length} value(s) in ${r.filename}. Review each one before using it.`);
    setExtraction(res || null);
  };

  const useExtracted = (d) => {
    const [activity_type, unit] = EXTRACTED[d.param_name];
    setDraft({
      activity_type, unit, quantity: String(d.value), source_type: 'document', source_document_id: extraction.document_id || '',
      source_ref: d.source_page ? `page ${d.source_page}` : '', evidence_snippet: d.raw_snippet
    });
  };

  return (
    <div className="space-y-6">
      <Notice error={action.error} message={action.message} />
      <Panel title="Activity ledger" description="Approved records feed the calculation. Approved records never change: corrections supersede them, keeping the history."
          actions={<div className="w-full sm:w-56"><Select label="Reporting period" value={periodId} onChange={(e) => { setPeriodId(e.target.value); setOffset(0); }}
            options={periods.map((p) => [p.id, `${p.name} (${p.status})`])} /></div>}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Activity filters">
            <Select label="Filter facility" value={filters.facility} onChange={filter('facility')} options={[
              ['', 'All facilities'], ...facilities.map((facility) => [facility.id, facility.name]),
            ]} />
            <Select label="Filter activity" value={filters.activity} onChange={filter('activity')} options={[
              ['', 'All activity types'], ...allTypes.map((type) => [type.activity_type, type.activity_type]),
            ]} />
            <Select label="Filter status" value={filters.status} onChange={filter('status')} options={[
              ['', 'All statuses'], ...['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SUPERSEDED'].map((status) => [status, status]),
            ]} />
            <div className="flex items-end"><Button variant="secondary" disabled={!hasFilters && offset === 0} onClick={() => { setFilters({ facility: '', activity: '', status: '' }); setOffset(0); }}>Clear filters</Button></div>
          </div>
            {activities.data && <section aria-label="Evidence metadata on this page" className="rounded-lg border border-border-subtle p-3 text-sm text-fg-secondary">
              <p>{withMetadata} of {rows.length} records on this page have reference metadata; {rows.length - withMetadata} have none.</p>
              <p className="mt-1 text-xs">Reference presence does not establish source accuracy, validity or approval.</p>
            </section>}
            <Loading state={activities} empty={hasFilters ? 'No records match these filters. Clear filters to review the period.' : 'No activity records in this period yet.'}>
              <Table caption="Activity records" rows={rows} columns={[
                { key: 'facility_id', label: 'Facility', render: (r) => facilityName[r.facility_id] || r.facility_id },
                { key: 'activity_type', label: 'Activity' },
                {
                  key: 'quantity', label: 'Quantity', render: (r) => (
                <span className="tabular-nums">{Number(r.quantity).toLocaleString()} {r.unit}{r.unit_raw !== r.unit && <span className="block text-xs text-fg-secondary">entered {Number(r.quantity_raw).toLocaleString()} {r.unit_raw}</span>}</span>) },
              {key: 'dates', label: 'Dates', render: (r) => `${r.activity_start} → ${r.activity_end}` },
              {key: 'meter_ref', label: 'Meter' },
              {key: 'source', label: 'Evidence', render: (r) => (
              <div className="text-xs">
                <span>{hasEvidenceMetadata(r) ? 'Reference metadata present' : 'No reference metadata'}</span>
                <details className="mt-1"><summary className="cursor-pointer py-1">Evidence details</summary>
                  <span className="block text-mist">{r.source_type}{r.source_ref ? ` · ${r.source_ref}` : ''}{r.source_document_id ? ` · Doc ${r.source_document_id.slice(0, 8)}` : ''}</span>
                  {r.evidence_snippet && <q className="block text-mist">{r.evidence_snippet}</q>}
                </details>
              </div>) },
              {key: 'status', label: 'Status', render: (r) => <span><StatusBadge status={r.status} />{r.review_comment && <span className="block text-xs text-mist">{r.review_comment}</span>}</span> },
              {key: 'actions', label: '', render: (r) => (
              <div className="flex flex-wrap gap-2">
                {can.write && ['DRAFT', 'REJECTED'].includes(r.status) && <Button variant="secondary" onClick={transition(r.id, 'submit')}>Submit</Button>}
                {can.review && r.status === 'SUBMITTED' && r.created_by !== me && <>
                  <Button onClick={transition(r.id, 'approve', {})}>Approve</Button>
                  <Button variant="secondary" onClick={() => setRejecting(r.id)}>Reject</Button></>}
                {rejecting === r.id && (
                  <form onSubmit={reject(r.id)} className="flex w-full flex-col gap-2" aria-label="Reject record">
                    <Input label="Reason for rejection" name="comment" required maxLength={2000} autoFocus />
                    <div className="flex gap-2"><Button type="submit">Confirm reject</Button>
                      <Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button></div>
                  </form>)}
                {can.review && r.status === 'SUBMITTED' && r.created_by === me && <span className="text-xs text-mist">Needs another reviewer</span>}
                {can.write && r.status === 'APPROVED' && period?.status === 'OPEN' && <Button variant="secondary" onClick={() => setDraft({
                  activity_type: r.activity_type, unit: r.unit_raw, quantity: r.quantity_raw, facility_id: r.facility_id, meter_ref: r.meter_ref || '',
                  activity_start: r.activity_start, activity_end: r.activity_end, supersedes_id: r.id
                })}>Correct</Button>}
              </div>) },
          ]} />
              {totalRows > 25 && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-mist">
                  <span>Showing {offset + 1}–{Math.min(offset + rows.length, totalRows)} of {totalRows} matching records</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 25))}>Previous page</Button>
                    <Button variant="secondary" size="sm" disabled={offset + rows.length >= totalRows} onClick={() => setOffset((o) => o + 25)}>Next page</Button>
                  </div>
                </div>
              )}
            </Loading>
          </Panel>

      {can.write && period?.status === 'OPEN' && (
            <Panel title={draft.supersedes_id ? 'Correct an approved record' : 'Add activity data'}
              description="Enter values from a source document. Extraction only suggests values: you confirm each one.">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-mist/40 px-4 py-2 font-mono text-xs text-registry focus-within:ring-2 focus-within:ring-emerald">
                  Extract from a document (PDF, CSV, XLSX, TXT, DOCX)
                  <input type="file" className="sr-only" accept=".pdf,.csv,.xlsx,.xls,.txt,.md,.docx" onChange={extract} disabled={action.busy} />
                </label>
                {draft.supersedes_id && <span className="text-xs text-amber-300">Supersedes record {draft.supersedes_id.slice(0, 8)}…</span>}
              </div>
              {extraction && (
                <Table caption="Extracted values" rowKey="param_name" rows={extraction.details} columns={[
                  { key: 'param_name', label: 'Value' },
                  { key: 'value', label: 'Amount', render: (d) => `${Number(d.value).toLocaleString()} ${d.unit}` },
                  { key: 'raw_snippet', label: 'Found in document', render: (d) => <q className="text-xs">{d.raw_snippet}</q> },
                  { key: 'confidence', label: 'Confidence', render: (d) => (d.confidence == null ? 'rule match' : `${Math.round(d.confidence * 100)}% (model)`) },
                  {
                    key: 'use', label: '', render: (d) => (EXTRACTED[d.param_name]
                      ? <Button variant="secondary" onClick={() => useExtracted(d)}>Use</Button>
                      : <span className="text-xs text-mist">Scope 3 — not in ledger yet</span>)
                  },
                ]} />
              )}
              <form key={JSON.stringify(draft)} onSubmit={create} className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="New activity record">
                <Select label="Facility" name="facility_id" defaultValue={draft.facility_id} options={facilities.map((f) => [f.id, f.name])} />
                <Select label="Activity" name="activity_type" defaultValue={draft.activity_type}
                  onChange={(e) => setDraft({ ...draft, activity_type: e.target.value, unit: '' })}
                  options={allTypes.map((t) => [t.activity_type, t.scope ? `${t.activity_type} (Scope ${t.scope})` : `${t.activity_type} (memo, not in totals)`])} />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Quantity" name="quantity" type="number" min="0" step="any" required defaultValue={draft.quantity} />
                  <Select label="Unit" name="unit" defaultValue={draft.unit || typeInfo?.canonical_unit} options={(typeInfo?.accepted_units || []).map((u) => [u, u])} />
                </div>
                <Input label="From" name="activity_start" type="date" required defaultValue={draft.activity_start} min={period?.start_date} max={period?.end_date} />
                <Input label="To" name="activity_end" type="date" required defaultValue={draft.activity_end} min={period?.start_date} max={period?.end_date} />
                <Input label="Meter / account ref" name="meter_ref" defaultValue={draft.meter_ref} maxLength={100} hint="Separate meters avoid false double-count warnings" />
                <Select label="Data quality" name="data_quality" defaultValue={draft.data_quality || ''} required
                  hint="Sets the activity uncertainty used in the IPCC Approach 1 total"
                  options={[['', 'Choose a grade'], ['billed', 'Billed (utility invoice)'], ['metered', 'Metered (own calibrated meter)'],
                  ['estimated', 'Estimated'], ['default', 'Default / proxy']]} />
                <Input label="Source reference" name="source_ref" defaultValue={draft.source_ref} maxLength={200} hint="Invoice no., page or row" />
                <Input label="Evidence excerpt" name="evidence_snippet" defaultValue={draft.evidence_snippet} maxLength={2000} />
                <input type="hidden" name="source_type" value={draft.source_type || 'manual'} />
                {draft.source_document_id && <input type="hidden" name="source_document_id" value={draft.source_document_id} />}
                {draft.supersedes_id && <input type="hidden" name="supersedes_id" value={draft.supersedes_id} />}
                <Button type="submit" disabled={action.busy}>Save draft</Button>
              </form>
            </Panel>
          )}
        </div>
  );
}
