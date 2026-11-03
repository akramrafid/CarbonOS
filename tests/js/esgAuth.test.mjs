import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { requestDemoSession, loadSession, DEMO_SESSION_KEY, getStoredDemoSession } from '../../src/lib/esgAuth.js';

const originalFetch = globalThis.fetch;
const session = { access_token: 'sample-token', tenant_id: 'sample-tenant', is_demo: true, expires_in: 7200,
  personas: { owner: { token: 'sample-token' }, reviewer: { token: 'review-token' } } };
beforeEach(() => {
  const values = new Map();
  globalThis.sessionStorage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: (k) => values.delete(k) };
});
afterEach(() => { globalThis.fetch = originalFetch; });

test('simultaneous demo startup provisions one tenant and stores the shared session', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json(session); };
  const [first, second] = await Promise.all([requestDemoSession(), requestDemoSession()]);
  assert.equal(calls, 1);
  assert.equal(first.tenant_id, second.tenant_id);
  assert.equal(getStoredDemoSession().access_token, session.access_token);
});

test('protected deployment returns signed-out state without pretending the service is offline', async () => {
  globalThis.fetch = async () => new Response('', { status: 403 });
  assert.equal(await loadSession(), null);
});

test('network failure is recoverable and does not poison a later retry', async () => {
  globalThis.fetch = async () => { throw new TypeError('network failed'); };
  await assert.rejects(loadSession(), (e) => e.status === 0);
  globalThis.fetch = async () => Response.json(session);
  assert.equal((await loadSession()).isDemo, true);
});

test('invalid session responses fail closed and expired sessions are discarded', async () => {
  globalThis.fetch = async () => Response.json({ is_demo: true });
  await assert.rejects(requestDemoSession(), (e) => e.status === 502);
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ ...session, expires_at: Math.floor(Date.now() / 1000) }));
  assert.equal(getStoredDemoSession(), null);
});
