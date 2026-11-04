import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCityWeather } from '../../src/lib/cityWeather.js';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const sample = () => ({ timezone: 'Asia/Dhaka', current_units: { temperature_2m: '°C', relative_humidity_2m: '%', wind_speed_10m: 'm/s' }, current: { temperature_2m: 0, relative_humidity_2m: 0, wind_speed_10m: 0, time: '2026-11-04T12:00' } });

test('city weather uses public city coordinates, correct units and preserves zero', async () => {
  const signal = new AbortController().signal;
  globalThis.fetch = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.hostname, 'api.open-meteo.com');
    assert.equal(parsed.searchParams.get('latitude'), '23.8103');
    assert.equal(parsed.searchParams.get('wind_speed_unit'), 'ms');
    assert.equal(parsed.searchParams.get('timezone'), 'Asia/Dhaka');
    assert.equal(options.signal, signal);
    assert.ok(!/appid|token|key|phone|name/i.test(parsed.search));
    return { ok: true, json: async () => sample() };
  };
  assert.deepEqual(await fetchCityWeather('Dhaka', signal), { temp: 0, humidity: 0, wind: 0, time: '2026-11-04T12:00' });
});

test('bad weather payloads and provider failures never return invented values', async () => {
  for (const data of [ {}, { ...sample(), current: { ...sample().current, temperature_2m: null } },
    { ...sample(), current: { ...sample().current, relative_humidity_2m: 101 } },
    { ...sample(), current: { ...sample().current, wind_speed_10m: -1 } },
    { ...sample(), timezone: 'GMT' }, { ...sample(), current_units: {} } ]) {
    globalThis.fetch = async () => ({ ok: true, json: async () => data });
    await assert.rejects(fetchCityWeather('Dhaka'), /incomplete or unsupported/);
  }
  globalThis.fetch = async () => ({ ok: false });
  await assert.rejects(fetchCityWeather('Dhaka'), /unavailable/);
  await assert.rejects(fetchCityWeather('unknown'), /supported weather city/);
});
