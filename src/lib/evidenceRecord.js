export function buildEvidenceRecord(answer, inspectedPassages, receivedAt) {
  return {
    schema_version: 1,
    record_type: 'carbonos_evidence_answer',
    client_received_at: receivedAt,
    review_required: true,
    score_kind: 'ranking_score_not_probability',
    response: answer,
    inspected_passages: inspectedPassages.map((passage) => {
      const citation = answer.citations.find((item) => item.document_id === passage.document_id && item.chunk_id === passage.chunk_id);
      return { ...passage, matches_cited_hash: Boolean(citation?.content_sha256 && citation.content_sha256 === passage.content_sha256) };
    }),
    limitations: 'Indexed passages are extracted text, not the original file. Hash matching does not verify the claims or source authority. This record is not an approved inventory or assurance report.',
  };
}

export function validateDocumentAnswer(answer, documentId, question) {
  if (typeof answer?.answer !== 'string' || typeof answer?.insufficient_data !== 'boolean' ||
      typeof answer?.model_used !== 'string' || typeof answer?.retrieval_method !== 'string' || answer?.query !== question || !Array.isArray(answer?.document_ids) || answer.document_ids.length !== 1 ||
      answer.document_ids[0] !== documentId || !Array.isArray(answer.citations) ||
      answer.citations.some((citation) => citation.document_id !== documentId)) {
    throw new Error('The service returned evidence outside the requested question or document scope.');
  }
  return answer;
}

export function buildComparisonRecord(comparison) {
  return {
    schema_version: 1,
    record_type: 'carbonos_document_comparison',
    client_received_at: comparison.receivedAt,
    question: comparison.question,
    review_required: true,
    responses_received: comparison.sources.filter((source) => source.response).length,
    sources: comparison.sources,
    limitations: 'Independent document-scoped answers and citations, not an automated conflict or authority decision. Full inspected passages are available in each answer download; they are not included in this combined record.',
  };
}

export function downloadEvidenceRecord(record, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
