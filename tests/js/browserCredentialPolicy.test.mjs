import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('browser source cannot ship provider secret variables or keyed weather/telemetry requests', () => {
  const root = fileURLToPath(new URL('../../src/', import.meta.url));
  for (const name of readdirSync(root, { recursive: true })) {
    if (!/\.(jsx?|tsx?)$/.test(name)) continue;
    const source = readFileSync(join(root, name), 'utf8');
    assert.ok(!/VITE_\w*(?:AUTH_TOKEN|SECRET|API_KEY)\b/.test(source), `Secret-bearing Vite variable in ${name}`);
    assert.ok(!/blynk\.cloud\/external\/api|api\.openweathermap\.org/.test(source), `Keyed provider request in ${name}`);
  }
});
