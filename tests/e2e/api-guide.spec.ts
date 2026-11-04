import { test, expect } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { E2E_JWT_SECRET } from '../../playwright.config';

test.use({ reducedMotion: 'reduce' });

test('developer guide has real endpoints and responsive examples in both themes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/company/api-docs');
  const main = page.getByRole('main');
  await expect(page).toHaveTitle('Developer guide | CarbonOS');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Integrate the working ESG workflow.');
  await expect(main.getByRole('region', { name: 'Implemented endpoint examples' }).locator('li')).toHaveCount(6);
  await expect(main.getByRole('link', { name: /Read the versioned API contract/ })).toHaveAttribute('href', 'https://github.com/akramrafid/CarbonOS/blob/Asif/docs/esg/API_CONTRACTS.md');
  await expect(main.getByText(/\/api\/v1\/mrv\/telemetry|node_id|BD-NODE|Carbon Zero BD|provision your client keys/)).toHaveCount(0);
  await expect(main.getByRole('complementary', { name: 'Integration boundaries' })).toContainText('Contributors cannot approve their own activity records');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('body')).toHaveCSS('background-color', theme === 'light' ? 'rgb(242, 243, 238)' : 'rgb(8, 15, 11)');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCSS('color', theme === 'light' ? 'rgb(65, 63, 63)' : 'rgb(240, 244, 241)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    const code = await main.locator('pre').boundingBox();
    expect(code!.x + code!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    for (const link of await main.getByRole('link').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    if ([320, 1440].includes(page.viewportSize()!.width)) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `docs/website-transformation/evidence/api-guide-${theme}-${page.viewportSize()!.width}.png`, fullPage: true, scale: 'css', animations: 'disabled' });
    }
  }
  await main.getByRole('link', { name: /Explore the evidence workspace/ }).click();
  await expect(page).toHaveURL(/\/platform\/esg\?view=evidence$/);
  await expect(page.getByRole('heading', { name: 'GHG accounting workspace' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Product links', exact: true }).getByRole('link', { name: 'Developer guide', exact: true }).click();
  await expect(page).toHaveURL(/\/company\/api-docs$/);
  expect(errors).toEqual([]);
});

test('the documented query payload executes against the real authorized API', async ({ page, request }) => {
  await page.goto('/company/api-docs');
  const example = (await page.getByRole('main').locator('pre').textContent())!;
  expect(example).toContain('Authorization: Bearer $CARBONOS_ACCESS_TOKEN');
  expect(example).toContain('X-Organization-Id: $CARBONOS_ORGANIZATION_ID');
  const payload = JSON.parse(example.match(/--data '(.*)'/)![1]);
  const path = example.match(/\$CARBONOS_API_URL([^"\s]+)/)![1];
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: `guide-${randomUUID()}`, exp: Math.floor(Date.now() / 1000) + 600 })}`;
  const token = `${unsigned}.${createHmac('sha256', E2E_JWT_SECRET).update(unsigned).digest('base64url')}`;
  const authorization = { Authorization: `Bearer ${token}` };
  const api = process.env.ESG_API_URL || 'http://127.0.0.1:8100';
  const created = await request.post(`${api}/api/esg/organizations`, { headers: authorization, data: { name: `Guide fixture ${randomUUID()}` } });
  expect(created.ok()).toBe(true);
  const headers = { ...authorization, 'X-Organization-Id': (await created.json()).id };
  const uploaded = await request.post(`${api}/api/esg/ingest`, { headers, multipart: {
    file: { name: 'guide-policy.txt', mimeType: 'text/plain', buffer: Buffer.from('Boiler inspections must occur every 12 months.') }, corpus: 'tenant_docs',
  } });
  expect(uploaded.ok()).toBe(true);
  const queried = await request.post(`${api}${path}`, { headers, data: payload });
  expect(queried.ok()).toBe(true);
  const answer = await queried.json();
  expect(answer.insufficient_data).toBe(false);
  expect(answer.answer).toContain('12 months');
  expect(answer.citations.map((citation: { document_id: string }) => citation.document_id)).toEqual([(await uploaded.json()).document_id]);
  expect(answer.query_id).toBeTruthy();
  expect((await request.post(`${api}${path}`, { data: payload })).status()).toBe(401);
});
