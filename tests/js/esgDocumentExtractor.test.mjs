// Client-side extractor must never invent values or assurance labels (data register A21).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDocumentTextToEsgParams } from '../../src/lib/esgDocumentExtractor.js';

test('no matches → zeros and no details, not a sample baseline', () => {
  for (const [text, name] of [['Board minutes, nothing measurable.', 'memo.txt'],
                              ['DESCO electricity bill account 1234', 'bill.pdf']]) {
    const r = parseDocumentTextToEsgParams(text, name);
    assert.equal(r.details.length, 0);
    assert.ok(Object.values(r.parameters).every((v) => v === 0), JSON.stringify(r.parameters));
  }
});

test('real value extracted with snippet and no invented confidence', () => {
  const r = parseDocumentTextToEsgParams('DESCO electricity: 4,321 kWh', 'bill.txt');
  assert.equal(r.parameters.electricity, 4321);
  assert.equal(r.details[0].confidence, null);
  assert.match(r.details[0].raw_snippet, /4,321/);
});
