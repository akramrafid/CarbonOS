import { useRef, useState } from 'react';
import { esgSend } from '../../../lib/esgApi';
import { buildComparisonRecord, downloadEvidenceRecord, validateDocumentAnswer } from '../../../lib/evidenceRecord';
import { Button, Input, Loading, Panel, Select, useAction } from './ui';
import EvidenceAnswer from './EvidenceAnswer';

export default function DocumentComparisonPanel({ documents }) {
  const [comparison, setComparison] = useState(null);
  const [selectionError, setSelectionError] = useState(null);
  const nextId = useRef(0);
  const action = useAction();
  const sources = documents.data || [];
  const options = [['', 'Choose a source document'], ...sources.map((doc) => [doc.id,
    `${doc.filename} · ${doc.corpus} · ID ${doc.id.slice(0, 8)}`])];

  const compare = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const ids = [values.get('first_document'), values.get('second_document')];
    if (ids[0] === ids[1]) {
      setSelectionError('Choose two different source documents.');
      form.elements.namedItem('second_document').focus();
      return;
    }
    setSelectionError(null);
    setComparison(null);
    const question = String(values.get('comparison_question'));
    const result = await action.run(async () => {
      const results = await Promise.allSettled(ids.map(async (id) => validateDocumentAnswer(
        await esgSend('POST', '/api/esg/query', { query: question, corpus: 'all', top_k: 5, document_ids: [id] }), id, question,
      )));
      return { id: ++nextId.current, question, receivedAt: new Date().toISOString(), sources: results.map((item, index) => {
        const doc = sources.find((source) => source.id === ids[index]);
        return {
          document: { id: doc.id, filename: doc.filename, corpus: doc.corpus, source_status: doc.meta_info?.source_status || 'UNREVIEWED' },
          response: item.status === 'fulfilled' ? item.value : null,
          error: item.status === 'rejected' ? item.reason.message || 'Source query failed. Try the comparison again.' : null,
        };
      }) };
    });
    if (result) setComparison(result);
  };

  return <Panel title="Compare source documents" description="Ask the same question of two selected documents. Each answer is restricted to its own source; review both for differing requirements or missing evidence.">
    <Loading state={documents} empty="Index at least two documents to compare their evidence.">
      {sources.length < 2 ? <p className="text-sm text-mist">Index at least two documents to compare their evidence.</p> : <form onSubmit={compare} className="space-y-4" aria-label="Compare evidence from two documents">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="First source document" name="first_document" options={options} required disabled={action.busy} />
          <Select label="Second source document" name="second_document" options={options} required disabled={action.busy} error={selectionError} onChange={() => setSelectionError(null)} />
        </div>
        <Input label="Comparison question" name="comparison_question" required maxLength={2000} pattern=".*\S.*" title="Enter a question containing text." disabled={action.busy} hint="For example: What is the boiler inspection interval?" />
        <Button type="submit" disabled={action.busy}>{action.busy ? 'Comparing sources…' : 'Compare selected sources'}</Button>
      </form>}
    </Loading>
    {documents.error && <Button variant="secondary" onClick={documents.reload}>Retry document list</Button>}
    {action.error && <p role="alert" className="esg-notice esg-tone-danger rounded-lg p-3 text-sm">{action.error}</p>}
    {comparison && <section key={comparison.id} aria-label="Document comparison results" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-mist">{comparison.sources.filter((source) => source.response).length} of 2 source responses received. Responses may still have insufficient evidence.</p>
        <Button variant="secondary" onClick={() => downloadEvidenceRecord(buildComparisonRecord(comparison), 'CarbonOS-document-comparison.json')}>Download comparison record</Button>
      </div>
      <p className="text-xs text-mist">These independent answers do not determine which document is authoritative or automatically resolve conflicts. A failed source stays unavailable; use the form to retry. Each answer download can include its inspected passages.</p>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {comparison.sources.map((source, index) => <section key={source.document.id} aria-label={`Source ${index + 1}: ${source.document.filename}`} className="min-w-0 space-y-3">
          <h3 className="break-words font-serif text-xl text-registry">Source {index + 1}: {source.document.filename}</h3>
          {source.response ? <EvidenceAnswer answer={source.response} /> : <p role="alert" className="esg-notice esg-tone-danger rounded-lg p-3 text-sm">{source.error}</p>}
        </section>)}
      </div>
    </section>}
  </Panel>;
}
