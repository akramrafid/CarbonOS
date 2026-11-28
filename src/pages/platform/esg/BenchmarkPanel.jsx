import { useState } from 'react';
import { esgGet } from '../../../lib/esgApi';
import { Button, Notice, Panel, Table, useAction } from './ui';

export default function BenchmarkPanel() {
  const [result, setResult] = useState(null);
  const action = useAction();
  const run = async () => {
    setResult(null);
    const response = await action.run(() => esgGet('/api/esg/atlas-benchmark/run'));
    if (response) setResult(response);
  };
  return <Panel title="Extraction regression" description="Runs the actual rules parser against ten synthetic text fixtures. Failures stay failures. This does not measure customer-document accuracy, OCR, or RAG answer quality.">
    <Button onClick={run} disabled={action.busy}>{action.busy ? 'Running regression…' : 'Run extraction regression'}</Button>
    <Notice error={action.error} />
    {result && <div className="space-y-4" aria-live="polite">
      <p className="text-sm text-registry">Synthetic numeric exact match: {result.metrics.parameter_accuracy_pct}% · {result.total_test_cases} cases · {result.extraction_method}</p>
      <p className="break-words text-xs text-mist">Run: {result.tested_at} · Version: {result.benchmark_version}</p>
      <Table caption="Synthetic extraction results" rows={result.test_results} rowKey="case_id" columns={[
        {key: 'case_id', label: 'Case'},
        {key: 'ground_truth', label: 'Expected', render: (r) => `${r.ground_truth.value} ${r.ground_truth.unit}`},
        {key: 'extracted', label: 'Actual', render: (r) => r.extracted.value == null ? 'No extraction' : `${r.extracted.value} ${r.extracted.unit}`},
        {key: 'value_exact_match', label: 'Numeric result', render: (r) => r.value_exact_match ? 'Match' : 'Failed'},
        {key: 'raw_snippet', label: 'Source excerpt'},
      ]} />
    </div>}
  </Panel>;
}
