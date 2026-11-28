// Presence of reference metadata does not prove the source exists, is correct, or has been reviewed.
export function hasEvidenceMetadata(record) {
  return ['source_document_id', 'source_ref', 'evidence_snippet'].some((key) => typeof record[key] === 'string' && record[key].trim().length > 0);
}
