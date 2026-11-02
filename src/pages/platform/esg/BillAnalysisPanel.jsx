// Bill parameter analysis: any confirmed or derived bill value, aggregated by facility, meter, band and period.
// Parameter keys are chosen at query time from the approved definitions; values nobody has confirmed are left out.
import { useState } from 'react';
import { Button, Loading, Panel, Select, Table, useEsgData } from './ui';

const DIMENSIONS = [['facility', 'Facility'], ['meter', 'Meter / account'], ['band', 'TOU band'], ['period', 'Period']];

export default function BillAnalysisPanel({ facilities }) {
  const [query, setQuery] = useState(null);
  const definitions = useEsgData('/api/esg/bill-parameters?status=APPROVED&limit=200');
  const result = useEsgData(query ? `/api/esg/bill-analysis?${new URLSearchParams(query)}` : null);
  const facilityName = Object.fromEntries((facilities || []).map((f) => [f.id, f.name]));
  const keys = [...new Set((definitions.data?.items || []).map((p) => p.key))].sort();
  const groupBy = query?.group_by ? query.group_by.split(',') : [];
  const rows = (result.data?.rows || []).map((r, i) => ({ ...r, rowKey: i }));

  const run = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setQuery({ keys: form.getAll('keys').join(','), group_by: form.getAll('group_by').join(','), grain: form.get('grain') });
  };

  return (
    <Panel title="Bill analysis"
      description="Totals and ranges of confirmed bill values in each parameter's canonical unit. Extracted values count only after a person confirms or corrects them.">
      <Loading state={definitions} empty="No approved bill parameter definitions yet.">
        <form onSubmit={run} className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="Bill analysis query">
          <Select label="Parameters" name="keys" multiple required size={Math.min(8, Math.max(keys.length, 2))}
            hint="Hold Ctrl (Cmd on a Mac) to choose several" options={keys.map((k) => [k, k])} />
          <fieldset className="flex flex-col gap-1">
            <legend className="font-mono text-[11px] uppercase tracking-wider text-mist">Group by</legend>
            {DIMENSIONS.map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-registry">
                <input type="checkbox" name="group_by" value={value} defaultChecked={value === 'period'} /> {label}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-3">
            <Select label="Period" name="grain" options={[['month', 'Month'], ['fiscal_year', 'Fiscal year (July–June)']]} />
            <Button type="submit" disabled={!keys.length}>Run analysis</Button>
          </div>
        </form>
      </Loading>
      {query && (
        <Loading state={{ ...result, data: result.data && { items: rows } }} empty="No confirmed values for these parameters yet.">
          <Table caption="Bill analysis results" rowKey="rowKey" rows={rows} columns={[
            ...groupBy.map((d) => ({ key: d, label: DIMENSIONS.find(([v]) => v === d)?.[1] || d,
              render: (r) => (d === 'facility' ? facilityName[r.facility] || r.facility : r[d] ?? '—') })),
            { key: 'key', label: 'Parameter' },
            { key: 'unit', label: 'Unit' },
            { key: 'count', label: 'Values' },
            { key: 'sum', label: 'Sum' },
            { key: 'min', label: 'Min' },
            { key: 'max', label: 'Max' },
            { key: 'avg', label: 'Mean' },
          ]} />
        </Loading>
      )}
    </Panel>
  );
}
