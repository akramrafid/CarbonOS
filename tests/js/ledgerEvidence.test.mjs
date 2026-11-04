import test from 'node:test';
import assert from 'node:assert/strict';
import { hasEvidenceMetadata } from '../../src/lib/ledgerEvidence.js';

test('source type, record status and blank fields never count as reference metadata', () => {
  for (const record of [{}, { source_type: 'document', status: 'APPROVED' },
    { source_ref: '  ', evidence_snippet: '\n', source_document_id: '' }, { source_ref: 0, source_document_id: null }]) {
    assert.equal(hasEvidenceMetadata(record), false);
  }
});

test('each actual reference field can count as metadata without changing review status', () => {
  for (const key of ['source_ref', 'evidence_snippet', 'source_document_id']) {
    const record = { [key]: 'synthetic reference', status: 'DRAFT' };
    assert.equal(hasEvidenceMetadata(record), true);
    assert.equal(record.status, 'DRAFT');
  }
  assert.equal(hasEvidenceMetadata({ source_ref: '0' }), true);
});
