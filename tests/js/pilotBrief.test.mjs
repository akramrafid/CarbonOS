import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPilotBrief } from '../../src/lib/pilotBrief.js';

const basic = { facilities: 'one', formats: ['text', 'pdf'], language: 'en', goal: 'inventory' };

test('pilot brief preserves the selected scope and commits no price or service', () => {
  const brief = buildPilotBrief(basic);
  assert.equal(brief.needsDiscovery, false);
  assert.match(brief.text, /Facilities: 1 facility/);
  assert.match(brief.text, /Scope 1 and 2 inventory/);
  assert.match(brief.text, /not a quote or service commitment/);
  assert.match(brief.text, /No enquiry was submitted/);
});

test('unsupported OCR and extended accounting remain explicit pilot gaps', () => {
  const brief = buildPilotBrief({ ...basic, formats: ['scan'], goal: 'extended', language: 'mixed', facilities: 'larger' });
  assert.equal(brief.needsDiscovery, true);
  assert.match(brief.text, /OCR is not implemented/);
  assert.match(brief.text, /outside the current demo/);
  assert.match(brief.text, /Bengali field extraction/);
  assert.match(brief.text, /scale\/concurrency/);
});

test('empty or unknown pilot choices are rejected', () => {
  for (const invalid of [{...basic, formats: []}, {...basic, formats: ['unknown']}, {...basic, facilities: 'unknown'}]) {
    assert.throws(() => buildPilotBrief(invalid), /Choose/);
  }
});
