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
