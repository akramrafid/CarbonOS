import { useRef, useState } from 'react';
import { esgFetch, esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, useAction, useEsgData } from './ui';
import BenchmarkPanel from './BenchmarkPanel';
import EvidenceAnswer from './EvidenceAnswer';

export default function EvidenceAssistantPanel({ canWrite }) {
  const documents = useEsgData('/api/esg/documents');
  const [answers, setAnswers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const nextId = useRef(0);
  const query = useAction();
  const upload = useAction();
  const ask = async (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setSelectedId(null);
    const result = await query.run(() => esgSend('POST', '/api/esg/query', {
      query: values.get('question'), corpus: values.get('corpus'), top_k: 5,
    }));
    if (result) {
      const id = ++nextId.current;
      setAnswers((current) => [{ id, response: result }, ...current].slice(0, 10));
      setSelectedId(id);
    }
  };
  const addDocument = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    const result = await upload.run(() => esgFetch('/api/esg/ingest', { method: 'POST', body }),
      (r) => `${r.filename}: ${r.chunks_created} indexed passage(s).`);
    if (result) { form.reset(); await documents.reload(); }
  };
  return <div className="space-y-6">
    <Panel title="Evidence assistant" description="Search your organization's documents and shared references. Answers support review; they cannot change activities, approve factors, or calculate an inventory.">
      <p className="text-sm text-mist">Use synthetic material for the showcase. When model answering is enabled, relevant passages are sent to the configured external AI provider. Otherwise, you receive a labeled source excerpt.</p>
      <form onSubmit={ask} className="space-y-4" aria-label="Ask about evidence">
        <Input label="Question" name="question" required minLength={1} maxLength={2000} placeholder="What does our boiler inspection policy require?" />
        <div className="grid items-end gap-3 sm:grid-cols-2">
          <Select label="Sources to search" name="corpus" options={[
            ['tenant_docs', 'My organization documents'], ['all', 'My documents and shared references'],
            ['regulatory', 'Shared regulatory references'], ['emission_factors', 'Shared factor references'],
          ]} />
          <Button type="submit" disabled={query.busy}>{query.busy ? 'Searching evidence…' : 'Ask with sources'}</Button>
        </div>
      </form>
      <Notice error={query.error} />
      {answers.length > 0 && <section aria-label="Answer history" className="space-y-3 border-t border-mist/20 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-registry">Recent answers</h3>
          <Button variant="secondary" disabled={query.busy} onClick={() => { setAnswers([]); setSelectedId(null); }}>Clear recent answers</Button>
        </div>
        <p className="text-xs text-mist">Up to 10 answers stay in this view’s memory. Each question searches independently. Clearing this view does not delete server audit records.</p>
        <ol className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {answers.map((entry) => <li key={entry.id} className="min-w-0">
            <button type="button" aria-pressed={selectedId === entry.id} onClick={() => setSelectedId(entry.id)}
              className={`min-h-[44px] w-full rounded-lg border p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald ${selectedId === entry.id ? 'border-emerald bg-emerald/10' : 'border-mist/30'}`}>
              <span className="line-clamp-2 break-words">{entry.response.query}</span>
              <span className="mt-1 block text-xs text-mist">{selectedId === entry.id ? 'Viewing · ' : ''}{entry.response.insufficient_data ? 'Insufficient evidence' : entry.response.answer_mode === 'supported_synthesis' ? 'AI synthesis · review required' : 'Retrieved excerpt'} · {entry.response.citations.length} source(s)</span>
            </button>
          </li>)}
        </ol>
      </section>}
      {answers.map((entry) => <div key={entry.id} hidden={selectedId !== entry.id}>
        <EvidenceAnswer answer={entry.response} />
      </div>)}
    </Panel>
    <Panel title="Indexed evidence" description="Uploads stay in your organization's private corpus. Shared references can only be published by platform operators.">
      <a href="/samples/factory-policy-demo.txt" download className="inline-block text-sm text-emerald underline">Download synthetic policy for RAG rehearsal</a>
      {canWrite && <form onSubmit={addDocument} className="space-y-3" aria-label="Index a source document">
        <Input label="Source document" name="file" type="file" required accept=".txt,.md,.pdf,.csv,.xlsx,.xls,.docx" />
        <p className="text-xs text-mist">Supported text documents, up to 20 MB. Scanned images require manual text entry; OCR is not implemented.</p>
        <Button type="submit" disabled={upload.busy}>{upload.busy ? 'Indexing document…' : 'Index source document'}</Button>
      </form>}
      <Notice error={upload.error} message={upload.message} />
      <Loading state={documents} empty="No source documents indexed yet.">
        <ul className="space-y-2 text-sm text-mist">{(documents.data || []).map((doc) => <li key={doc.id} className="break-words">{doc.filename} · {doc.chunk_count} passage(s) · {doc.corpus} · {doc.meta_info?.source_status || 'UNREVIEWED'}</li>)}</ul>
      </Loading>
    </Panel>
    <BenchmarkPanel />
  </div>;
}
