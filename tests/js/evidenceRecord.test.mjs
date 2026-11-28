import test from 'node:test';
import assert from 'node:assert/strict';
import { buildComparisonRecord, buildEvidenceRecord, validateDocumentAnswer } from '../../src/lib/evidenceRecord.js';
const answer = { query: 'Boiler policy?', answer: 'Review this synthetic passage.', answer_mode: 'retrieval_only', model_used: 'retrieval-only', retrieval_method: 'bm25_vector_rrf', insufficient_data: false, citations: [{ document_id: 'doc-a', chunk_id: 'chunk-a', content_sha256: 'cited-hash', source_status: 'UNREVIEWED' }] };

test('answer export preserves actual response and inspected provenance with an explicit review boundary', () => {
  const record = buildEvidenceRecord(answer, [{ document_id: 'doc-a', chunk_id: 'chunk-a', content: 'Full source', content_sha256: 'cited-hash' }], '2026-11-04T07:00:00Z');
  assert.equal(record.response, answer);
  assert.equal(record.review_required, true);
  assert.equal(record.inspected_passages[0].matches_cited_hash, true);
  assert.equal(record.score_kind, 'ranking_score_not_probability');
  assert.match(record.limitations, /not an approved inventory/);
  assert.equal(JSON.parse(JSON.stringify(record)).inspected_passages[0].content, 'Full source');
});

test('export never presents changed, foreign or uninspected passages as verified citations', () => {
  for (const passage of [{ document_id: 'doc-a', chunk_id: 'chunk-a', content_sha256: 'changed' }, { document_id: 'doc-b', chunk_id: 'chunk-a', content_sha256: 'cited-hash' }]) {
    assert.equal(buildEvidenceRecord(answer, [passage], 'now').inspected_passages[0].matches_cited_hash, false);
  }
  assert.deepEqual(buildEvidenceRecord(answer, [], 'now').inspected_passages, []);
  assert.deepEqual(buildEvidenceRecord({ ...answer, insufficient_data: true, citations: [] }, [], 'now').response.citations, []);
  assert.equal(answer.citations[0].source_status, 'UNREVIEWED');
});


test('comparison rejects unconfirmed question/document scope and citations from another source', () => {
  const scoped = { ...answer, document_ids: ['doc-a'] };
  assert.equal(validateDocumentAnswer(scoped, 'doc-a', answer.query), scoped);
  for (const bad of [answer, { ...scoped, query: 'Different question' }, { ...scoped, document_ids: [] },
    { ...scoped, document_ids: ['doc-a', 'doc-b'] }, { ...scoped, document_ids: ['doc-b'] },
    { ...scoped, citations: [{ document_id: 'doc-b' }] }, { ...scoped, citations: null }, { ...scoped, answer: null }]) {
    assert.throws(() => validateDocumentAnswer(bad, 'doc-a', answer.query), /outside/);
  }
});

test('combined comparison record preserves partial failures without inventing conflict conclusions', () => {
  const comparison = { question: answer.query, receivedAt: 'now', sources: [
    { document: { id: 'doc-a' }, response: answer, error: null },
    { document: { id: 'doc-b' }, response: null, error: 'Source unavailable' },
  ] };
  const record = buildComparisonRecord(comparison);
  assert.equal(record.responses_received, 1);
  assert.equal(record.review_required, true);
  assert.deepEqual(record.sources, comparison.sources);
  assert.match(record.limitations, /not an automated conflict or authority decision/);
  assert.equal(record.sources[1].response, null);
});
