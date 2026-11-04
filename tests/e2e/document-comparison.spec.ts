import { test, expect } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { E2E_JWT_SECRET } from '../../playwright.config';

test('two selected sources compare independently, export actual scopes and retain honest partial failures', async ({ page, request }) => {
  const sub = `comparison-${randomUUID()}`;
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', E2E_JWT_SECRET).update(body).digest('base64url')}`;
  const headers = { Authorization: `Bearer ${token}` };
  const api = process.env.ESG_TEST_API_URL || 'http://127.0.0.1:8100';
  await expect(await request.post(`${api}/api/esg/organizations`, { headers, data: { name: sub, is_demo: false } })).toBeOK();
  const docs: string[] = [];
  for (const [filename, text] of [
    ['synthetic-policy-a.txt', 'SYNTHETIC SOURCE A. Boiler inspection interval: every 12 months. Retain a maintenance record.'],
    ['synthetic-policy-b.txt', 'SYNTHETIC SOURCE B. Boiler inspection interval: every 24 months. Retain a maintenance record.'],
    ['synthetic-cafeteria.txt', 'SYNTHETIC SOURCE C. Employee cafeteria opens daily for lunch service.'],
  ]) {
    const uploaded = await request.post(`${api}/api/esg/ingest`, { headers, multipart: { corpus: 'tenant_docs', file: { name: filename, mimeType: 'text/plain', buffer: Buffer.from(text) } } });
    await expect(uploaded).toBeOK();
    docs.push((await uploaded.json()).document_id);
  }
  await page.addInitScript((value) => { (window as any).__ESG_E2E_TOKEN__ = value; }, token);
  await page.goto('/platform/esg?view=evidence');
  const panel = page.getByRole('region', { name: 'Compare source documents', exact: true });
  const form = panel.getByRole('form', { name: 'Compare evidence from two documents' });
  await form.getByLabel('First source document').selectOption(docs[0]);
  await form.getByLabel('Second source document').selectOption(docs[0]);
  await form.getByLabel('Comparison question').fill('What is the boiler inspection interval?');
  const queries: any[] = [];
  page.on('request', (req) => { if (req.method() === 'POST' && req.url().endsWith('/api/esg/query')) queries.push(req.postDataJSON()); });
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  await expect(form.getByRole('alert')).toContainText('two different');
  await expect(form.getByLabel('Second source document')).toBeFocused();
  expect(queries).toEqual([]);
  await form.getByLabel('Second source document').selectOption(docs[1]);
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  const results = panel.getByRole('region', { name: 'Document comparison results', exact: true });
  const first = results.getByRole('region', { name: 'Source 1: synthetic-policy-a.txt', exact: true });
  const second = results.getByRole('region', { name: 'Source 2: synthetic-policy-b.txt', exact: true });
  await expect(first).toContainText('12 months');
  await expect(first).not.toContainText('24 months');
  await expect(second).toContainText('24 months');
  await expect(second).not.toContainText('12 months');
  expect(queries.map((query) => query.document_ids).sort()).toEqual([[docs[0]], [docs[1]]].sort());
  const downloadEvent = page.waitForEvent('download');
  await results.getByRole('button', { name: 'Download comparison record' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('CarbonOS-document-comparison.json');
  const record = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(record.responses_received).toBe(2);
  expect(record.review_required).toBe(true);
  for (const source of record.sources) {
    expect(source.response.document_ids).toEqual([source.document.id]);
    expect(source.response.query_id).toBeTruthy();
    expect(source.response.citations.every((citation) => citation.document_id === source.document.id)).toBe(true);
  }
  await writeFile(`docs/website-transformation/evidence/document-comparison-${page.viewportSize()!.width}.json`, JSON.stringify(record, null, 2) + '\n');
  await results.screenshot({ path: `docs/website-transformation/evidence/document-comparison-${page.viewportSize()!.width}.png`, scale: 'css' });

  let mode = 'failure';
  await page.route(`${api}/api/esg/query`, async (route) => {
    if (route.request().postDataJSON().document_ids?.[0] !== docs[1]) return route.continue();
    if (mode === 'failure') return route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Synthetic source-query outage"}' });
    const upstream = await route.fetch();
    const wrong = await upstream.json();
    wrong.document_ids = [docs[0]];
    return route.fulfill({ response: upstream, json: wrong });
  });
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  await expect(results.getByRole('status').first()).toContainText('1 of 2');
  await expect(second.getByRole('alert')).toContainText('Synthetic source-query outage');
  await expect(second).not.toContainText('24 months');
  mode = 'wrong-scope';
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  await expect(second.getByRole('alert')).toContainText('outside the requested question or document scope');
  await expect(second.getByRole('region', { name: 'Evidence answer', exact: true })).toHaveCount(0);
  await page.unroute(`${api}/api/esg/query`);
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  await expect(second).toContainText('24 months');
  await expect(results.getByRole('alert')).toHaveCount(0);
  await form.getByLabel('Second source document').selectOption(docs[2]);
  await form.getByLabel('Comparison question').fill('boiler inspection');
  await form.getByRole('button', { name: 'Compare selected sources' }).click();
  await expect(results.getByRole('region', { name: 'Source 2: synthetic-cafeteria.txt', exact: true }).getByRole('heading', { name: 'Insufficient evidence' })).toBeVisible();
  await expect(first).toContainText('12 months');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});
