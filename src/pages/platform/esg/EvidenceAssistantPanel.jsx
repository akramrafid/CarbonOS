import { useState } from 'react';
import { esgFetch, esgSend } from '../../../lib/esgApi';
import { Button, Input, Loading, Notice, Panel, Select, useAction, useEsgData } from './ui';
import BenchmarkPanel from './BenchmarkPanel';

export default function EvidenceAssistantPanel({ canWrite }) {
  const documents = useEsgData('/api/esg/documents');
  const [answer, setAnswer] = useState(null);
  const query = useAction();
  const upload = useAction();
  const ask = async (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setAnswer(null);
    const result = await query.run(() => esgSend('POST', '/api/esg/query', {
      query: values.get('question'), corpus: values.get('corpus'), top_k: 5,
    }));
    if (result) setAnswer(result);
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
      {answer && <section aria-label="Evidence answer" className="space-y-4 rounded-xl border border-mist/30 p-4" aria-live="polite">
        <h3 className="font-serif text-xl text-registry">{answer.insufficient_data ? 'Insufficient evidence' : answer.answer_mode === 'supported_synthesis' ? 'AI synthesis — review required' : 'Retrieved source excerpt'}</h3>
        <p className="text-xs text-mist">Method: {answer.retrieval_method} · Model: {answer.model_used}. Ranking scores are not accuracy or verification.</p>
        {answer.candidate_limit_reached && <Notice message="The search reached its candidate limit. Narrow the selected corpus; this result may omit older passages." />}
        <p className="whitespace-pre-wrap break-words text-sm text-registry">{answer.answer}</p>
        {answer.citations.length > 0 && <ul className="space-y-3" aria-label="Answer sources">
          {answer.citations.map((citation, i) => <li key={citation.chunk_id || i} className="min-w-0 rounded-lg bg-carbon/60 p-3">
            <p className="break-words text-sm text-emerald">{citation.source} · Page {citation.page ?? 'not recorded'} · {citation.source_status}</p>
            <blockquote className="mt-2 break-words text-sm text-mist">{citation.snippet}</blockquote>
            <details className="mt-2 text-xs text-mist">
              <summary className="cursor-pointer">Source provenance</summary>
              <p className="break-all">Document: {citation.document_id}<br />Passage: {citation.chunk_id}<br />Content SHA-256: {citation.content_sha256}</p>
            </details>
          </li>)}
        </ul>}
        <p className="text-xs text-mist">Citation and quote checks do not establish that a claim is correct. Review the original source and its applicability before relying on an answer.</p>
      </section>}
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
