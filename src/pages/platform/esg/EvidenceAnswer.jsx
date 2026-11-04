import { useState } from 'react';
import { esgGet } from '../../../lib/esgApi';
import { buildEvidenceRecord } from '../../../lib/evidenceRecord';
import { Button, Notice, useAction } from './ui';

function SourcePassage({ citation, onInspected }) {
  const [passage, setPassage] = useState(null);
  const action = useAction();
  const load = async () => {
    const result = await action.run(async () => {
      const source = await esgGet(`/api/esg/documents/${encodeURIComponent(citation.document_id)}/chunks/${encodeURIComponent(citation.chunk_id)}`);
      if (source.document_id !== citation.document_id || source.chunk_id !== citation.chunk_id) throw new Error('The returned passage does not match this citation.');
      return source;
    });
    if (result) { setPassage(result); onInspected(result); }
  };
  return <details className="mt-2 text-xs text-mist">
    <summary className="min-h-[44px] cursor-pointer py-3">Source provenance</summary>
    <p className="break-all">Document: {citation.document_id}<br />Passage: {citation.chunk_id}<br />Content SHA-256: {citation.content_sha256}</p>
    {citation.document_id && citation.chunk_id ? <div className="mt-3 space-y-3">
      {!passage && <Button variant="secondary" onClick={load} disabled={action.busy}>{action.busy ? 'Loading passage…' : action.error ? 'Retry passage' : 'Read full indexed passage'}</Button>}
      <Notice error={action.error} />
      {passage && <section aria-label={`Full indexed passage from ${citation.source}`} className="space-y-2">
        {passage.content_sha256 !== citation.content_sha256
          ? <Notice error="The stored passage differs from the cited hash. Treat this answer as stale and ask again before relying on it." />
          : <p role="status">The stored passage hash matches this citation. Source review is still required.</p>}
        <p>Current source status: {passage.source_status} · Page {passage.page ?? 'not recorded'} · {passage.corpus}</p>
        <blockquote className="whitespace-pre-wrap break-words border-l-2 border-mist/40 pl-3 text-sm text-registry">{passage.content}</blockquote>
        <p className="break-all">Stored passage SHA-256: {passage.content_sha256}<br />Original file SHA-256: {passage.document_sha256 || 'not recorded'}</p>
        <p>This is the full indexed passage, not the entire original file.</p>
      </section>}
    </div> : <p className="mt-2">This citation has no stored passage identifier to inspect.</p>}
  </details>;
}

export default function EvidenceAnswer({ answer }) {
  const [receivedAt] = useState(() => new Date().toISOString());
  const [passages, setPassages] = useState({});
  const download = () => {
    const record = buildEvidenceRecord(answer, Object.values(passages), receivedAt);
    const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CarbonOS-evidence-answer.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  return <section aria-label="Evidence answer" className="space-y-4 rounded-xl border border-mist/30 p-4" aria-live="polite">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h3 className="font-serif text-xl text-registry">{answer.insufficient_data ? 'Insufficient evidence' : answer.answer_mode === 'supported_synthesis' ? 'AI synthesis — review required' : 'Retrieved source excerpt'}</h3>
      <Button variant="secondary" onClick={download}>Download answer record</Button>
    </div>
    <p className="text-xs text-mist">Method: {answer.retrieval_method} · Model: {answer.model_used}. Ranking scores are not accuracy or verification.</p>
    {answer.candidate_limit_reached && <p role="status" className="esg-notice esg-tone-warning rounded-lg p-3 text-sm">The search reached its candidate limit. Narrow the selected corpus; this result may omit older passages.</p>}
    <p className="whitespace-pre-wrap break-words text-sm text-registry">{answer.answer}</p>
    {answer.citations.length > 0 && <ul className="space-y-3" aria-label="Answer sources">
      {answer.citations.map((citation, i) => <li key={citation.chunk_id || i} className="min-w-0 rounded-lg bg-carbon/60 p-3">
        <p className="break-words text-sm text-emerald">{citation.source} · Page {citation.page ?? 'not recorded'} · {citation.source_status}</p>
        <blockquote className="mt-2 break-words text-sm text-mist">{citation.snippet}</blockquote>
        <SourcePassage citation={citation} onInspected={(passage) => setPassages((current) => ({ ...current, [passage.chunk_id]: passage }))} />
      </li>)}
    </ul>}
    <p className="text-xs text-mist">Citation and quote checks do not establish that a claim is correct. Review the original source and its applicability before relying on an answer.</p>
    <p className="text-xs text-mist">The local download includes your question, answer, citations and passages you inspected. It is a review record, not a signed or approved report.</p>
  </section>;
}
