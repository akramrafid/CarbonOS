// Bill parameter analysis and guided intake wizard.
// Toggle between step-by-step intake wizard (Upload -> Gaps -> Fill -> Confirm)
// and parameter aggregation analysis.
import { useState } from 'react';
import { Button, Loading, Panel, Select, Table, useEsgData } from './ui';
import BillIntakeWizard from './BillIntakeWizard';

const DIMENSIONS = [['facility', 'Facility'], ['meter', 'Meter / account'], ['band', 'TOU band'], ['period', 'Period']];

export default function BillAnalysisPanel({ facilities = [], periods = [] }) {
  const [mode, setMode] = useState('wizard'); // 'wizard' | 'analysis'
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-emerald/10 pb-3">
        <button
          type="button"
          onClick={() => setMode('wizard')}
          className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors ${
            mode === 'wizard'
              ? 'bg-emerald text-carbon font-semibold'
              : 'border border-mist/20 text-registry hover:border-emerald/40'
          }`}
        >
          Guided Intake Wizard
        </button>
        <button
          type="button"
          onClick={() => setMode('analysis')}
          className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors ${
            mode === 'analysis'
              ? 'bg-emerald text-carbon font-semibold'
              : 'border border-mist/20 text-registry hover:border-emerald/40'
          }`}
        >
          Bill Parameter Analysis
        </button>
      </div>

      {mode === 'wizard' ? (
        <BillIntakeWizard facilities={facilities} periods={periods} />
      ) : (
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
      )}
    </div>
  );
}
