import { test, expect } from '@playwright/test';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { E2E_JWT_SECRET } from '../../playwright.config';

async function openEvidenceWorkspace(page, request) {
  const sub = `source-review-${randomUUID()}`;
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', E2E_JWT_SECRET).update(body).digest('base64url')}`;
  const api = process.env.ESG_TEST_API_URL || 'http://127.0.0.1:8100';
  const org = await request.post(`${api}/api/esg/organizations`, {
    headers: { Authorization: `Bearer ${token}` }, data: { name: sub, is_demo: false },
  });
  await expect(org).toBeOK();
  await page.addInitScript((value) => { (window as any).__ESG_E2E_TOKEN__ = value; }, token);
  await page.goto('/platform/esg?view=evidence');
  return api;
}

test('authorized full source inspection retries, exports actual provenance, and resets for abstention', async ({ page, request }) => {
  const api = await openEvidenceWorkspace(page, request);
  const text = 'SYNTHETIC POLICY. Inspect the boiler every 12 months. ' + 'Retain inspection records. '.repeat(12) + '\nFULL_PASSAGE_REVIEW_MARKER\n<script>untrusted_source_marker</script>';
  await page.getByLabel('Source document', { exact: true }).setInputFiles({ name: 'inspection-synthetic.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await page.getByRole('button', { name: 'Index source document', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'indexed passage' })).toBeVisible();
  await page.getByLabel('Question', { exact: true }).fill('What does the boiler inspection policy require?');
  const response = page.waitForResponse((res) => res.url().endsWith('/api/esg/query') && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'Ask with sources', exact: true }).click();
  const actual = await (await response).json();
  const answer = page.getByRole('region', { name: 'Evidence answer', exact: true });
  await expect(answer).toContainText('12 months');
  await answer.getByText('Source provenance', { exact: true }).first().click();
  const sourceUrl = `${api}/api/esg/documents/${actual.citations[0].document_id}/chunks/${actual.citations[0].chunk_id}`;
  await page.route(sourceUrl, (route) => route.abort());
  await answer.getByRole('button', { name: 'Read full indexed passage', exact: true }).first().click();
  await expect(answer.getByRole('alert')).toContainText('unreachable');
  await page.unroute(sourceUrl);
  await answer.getByRole('button', { name: 'Retry passage', exact: true }).first().click();
  const passage = answer.getByRole('region', { name: 'Full indexed passage from inspection-synthetic.txt' });
  await expect(passage).toContainText('FULL_PASSAGE_REVIEW_MARKER');
  await expect(passage.getByRole('status')).toContainText('hash matches');
  await expect(passage.locator('script')).toHaveCount(0);
  const downloadEvent = page.waitForEvent('download');
  await answer.getByRole('button', { name: 'Download answer record' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('CarbonOS-evidence-answer.json');
  const record = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(record.response).toEqual(actual);
  expect(record.review_required).toBe(true);
  expect(record.inspected_passages[0].matches_cited_hash).toBe(true);
  expect(record.inspected_passages[0].content).toContain('FULL_PASSAGE_REVIEW_MARKER');
  expect(record.inspected_passages[0].content_sha256).toBe(actual.citations[0].content_sha256);
  await writeFile(`docs/website-transformation/evidence/answer-record-${page.viewportSize()!.width}.json`, JSON.stringify(record, null, 2) + '\n');
  await answer.screenshot({ path: `docs/website-transformation/evidence/source-inspector-${page.viewportSize()!.width}.png`, scale: 'css' });
  await page.getByRole('button', { name: 'Ask with sources', exact: true }).click();
  await answer.getByText('Source provenance', { exact: true }).first().click();
  await expect(answer.getByRole('button', { name: 'Read full indexed passage', exact: true })).toHaveCount(1);
  await page.route(sourceUrl, async (route) => {
    const upstream = await route.fetch();
    const revised = await upstream.json();
    revised.content += '\nSynthetic revised source for stale-citation fault injection.';
    revised.content_sha256 = createHash('sha256').update(revised.content).digest('hex');
    await route.fulfill({ response: upstream, json: revised });
  });
  await answer.getByRole('button', { name: 'Read full indexed passage', exact: true }).first().click();
  await expect(answer.getByRole('alert')).toContainText('differs from the cited hash');
  const staleDownload = page.waitForEvent('download');
  await answer.getByRole('button', { name: 'Download answer record' }).click();
  const staleRecord = JSON.parse(await readFile((await (await staleDownload).path())!, 'utf8'));
  expect(staleRecord.inspected_passages[0].matches_cited_hash).toBe(false);
  expect(staleRecord.response.citations[0].content_sha256).toBe(actual.citations[0].content_sha256);
  await page.unroute(sourceUrl);
  await page.getByLabel('Question', { exact: true }).fill('Ocean shipping pension discounts');
  await page.getByRole('button', { name: 'Ask with sources', exact: true }).click();
  await expect(answer.getByRole('heading', { name: 'Insufficient evidence' })).toBeVisible();
  const secondDownload = page.waitForEvent('download');
  await answer.getByRole('button', { name: 'Download answer record' }).click();
  const absent = JSON.parse(await readFile((await (await secondDownload).path())!, 'utf8'));
  expect(absent.inspected_passages).toEqual([]);
  expect(absent.response.citations).toEqual([]);
  const history = page.getByRole('region', { name: 'Answer history', exact: true });
  const oldQuestion = history.getByRole('button', { name: /What does the boiler inspection policy require/ });
  await oldQuestion.last().click();
  await expect(oldQuestion.last()).toHaveAttribute('aria-pressed', 'true');
  await expect(answer.getByRole('region', { name: 'Full indexed passage from inspection-synthetic.txt' })).toContainText('FULL_PASSAGE_REVIEW_MARKER');
  await expect(answer.getByRole('alert')).toHaveCount(0);
  await oldQuestion.first().click();
  await expect(oldQuestion.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(oldQuestion.last()).toHaveAttribute('aria-pressed', 'false');
  await expect(history.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await expect(oldQuestion.first()).toContainText('Viewing');
  await expect(answer.getByRole('alert')).toContainText('differs from the cited hash');
  await history.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `docs/website-transformation/evidence/answer-history-${page.viewportSize()!.width}.png`, scale: 'css' });
  await history.getByRole('button', { name: 'Clear recent answers' }).click();
  await expect(history).toHaveCount(0);
  await expect(answer).toHaveCount(0);
  await expect(page.getByLabel('Question', { exact: true })).toHaveValue('Ocean shipping pension discounts');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});


test('answer history is bounded and is discarded when this view reloads', async ({ page, request }) => {
  await openEvidenceWorkspace(page, request);
  const history = page.getByRole('region', { name: 'Answer history', exact: true });
  for (let index = 0; index < 11; index++) {
    const question = `Missing synthetic source topic ${index}`;
    await page.getByLabel('Question', { exact: true }).fill(question);
    await page.getByRole('button', { name: 'Ask with sources', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Evidence answer', exact: true })).toContainText(question);
  }
  await expect(history.locator('ol button')).toHaveCount(10);
  await expect(history.getByRole('button', { name: /^Missing synthetic source topic 0 / })).toHaveCount(0);
  await expect(history.getByRole('button', { name: /^Missing synthetic source topic 1 / })).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Evidence assistant', exact: true })).toBeVisible();
  await expect(history).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Evidence answer', exact: true })).toHaveCount(0);
});
