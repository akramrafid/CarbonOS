import { test, expect } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { E2E_JWT_SECRET } from '../../playwright.config';

async function ledgerWorkspace(page, request, extraCount = 0) {
  const sub = `ledger-review-${randomUUID()}`;
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', E2E_JWT_SECRET).update(body).digest('base64url')}`;
  const headers = { Authorization: `Bearer ${token}` };
  const api = process.env.ESG_TEST_API_URL || 'http://127.0.0.1:8100';
  const create = async (path, data) => {
    const response = await request.post(`${api}/api/esg/${path}`, { headers, data });
    await expect(response).toBeOK();
    return response.json();
  };
  await create('organizations', { name: sub, is_demo: false });
  const entity = await create('legal-entities', { name: 'Synthetic review entity', country: 'BD' });
  const facility = await create('facilities', { name: 'Synthetic review facility', legal_entity_id: entity.id, country: 'BD', grid_region: 'TEST' });
  const periods = [];
  for (const year of [2024, 2025]) {
    const period = await create('periods', { name: `Synthetic FY${year}`, start_date: `${year}-01-01`, end_date: `${year}-12-31`, boundary_method: 'operational_control' });
    await create('activities', { period_id: period.id, facility_id: facility.id, activity_type: 'electricity', quantity: year, unit: 'kWh', activity_start: `${year}-01-01`, activity_end: `${year}-01-31`, meter_ref: `synthetic-${year}`, source_ref: `Synthetic invoice ${year}` });
    periods.push(period.id);
  }
  let secondFacility;
  if (extraCount > 0) {
    for (let index = 1; index <= extraCount; index++) {
      const record = await create('activities', { period_id: periods[1], facility_id: facility.id,
        activity_type: index % 2 ? 'diesel' : 'electricity', quantity: index + 1, unit: index % 2 ? 'L' : 'kWh',
        activity_start: '2025-01-01', activity_end: '2025-01-31', meter_ref: `extra-${index}`,
        ...(index % 2 ? {} : { source_ref: `Synthetic extra invoice ${index}` }),
      });
      if (index === 1) await create(`activities/${record.id}/submit`, {});
    }
    secondFacility = await create('facilities', { name: 'Synthetic second facility', legal_entity_id: entity.id, country: 'BD', grid_region: 'TEST' });
    await create('activities', { period_id: periods[1], facility_id: secondFacility.id, activity_type: 'diesel', quantity: 1, unit: 'L',
      activity_start: '2025-01-01', activity_end: '2025-01-31', meter_ref: 'second-site' });
  }
  await page.addInitScript((value) => { (window as any).__ESG_E2E_TOKEN__ = value; }, token);
  await page.goto('/platform/esg?view=ledger');
  const ledger = page.getByRole('region', { name: 'Activity ledger', exact: true });
  await expect(ledger.getByRole('table', { name: 'Activity records', exact: true })).toBeVisible();
  return { api, periods, ledger, secondFacility };
}

test('late period responses cannot overwrite the current ledger or show stale errors', async ({ page, request }) => {
  const { periods, ledger } = await ledgerWorkspace(page, request);
  let releaseOld;
  let markRequested;
  const held = new Promise<void>((resolve) => { releaseOld = resolve; });
  const requested = new Promise<void>((resolve) => { markRequested = resolve; });
  await page.route('**/api/esg/activities?**', async (route) => {
    if (new URL(route.request().url()).searchParams.get('period_id') !== periods[0]) return route.continue();
    const oldResponse = await route.fetch();
    markRequested();
    await held;
    await route.fulfill({ response: oldResponse }).catch(() => {}); // The superseded browser request may already be aborted.
  });
  await ledger.getByLabel('Reporting period', { exact: true }).selectOption(periods[0]);
  await requested;
  await expect(ledger.getByRole('status')).toContainText('Loading');
  await expect(ledger.getByRole('cell', { name: 'synthetic-2025', exact: true })).toHaveCount(0);
  await ledger.getByLabel('Reporting period', { exact: true }).selectOption(periods[1]);
  await expect(ledger.getByRole('cell', { name: 'synthetic-2025', exact: true })).toBeVisible();
  releaseOld();
  await page.unrouteAll({ behavior: 'wait' });
  await expect(ledger.getByRole('cell', { name: 'synthetic-2024', exact: true })).toHaveCount(0);
  await expect(ledger.getByRole('cell', { name: 'synthetic-2025', exact: true })).toBeVisible();
  await expect(page.locator('.esg-workspace').getByRole('alert')).toHaveCount(0);
});

test('reference-data failures stay explicit, retry, and initialize direct reporting links correctly', async ({ page, request }) => {
  const keyWarnings: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error' && /same key/.test(message.text())) keyWarnings.push(message.text()); });
  const { periods } = await ledgerWorkspace(page, request);
  let unavailable = true;
  await page.route('**/api/esg/periods?**', (route) => unavailable
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Synthetic reference outage"}' })
    : route.continue());
  await page.reload();
  await expect(page.locator('.esg-workspace').getByRole('alert')).toContainText('Synthetic reference outage');
  await expect(page.getByRole('region', { name: 'Activity ledger', exact: true })).toHaveCount(0);
  await expect(page.getByText('No activity records in this period yet.', { exact: true })).toHaveCount(0);
  unavailable = false;
  await page.getByRole('button', { name: 'Retry workspace data', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'synthetic-2025', exact: true })).toBeVisible();
  await expect(page.locator('.esg-workspace').getByRole('alert')).toHaveCount(0);
  await page.unrouteAll({ behavior: 'wait' });
  for (const view of ['ledger', 'reports', 'metrics', 'disclosures']) {
    await page.goto(`/platform/esg?view=${view}`);
    await expect(page.getByLabel('Reporting period', { exact: true }).first()).toHaveValue(periods[1]);
  }
  const gaps = page.getByRole('table', { name: 'Disclosure requirements', exact: true }).getByText('No locked GHG inventory for this period', { exact: true });
  await expect(gaps.first()).toBeVisible();
  expect(await gaps.count()).toBeGreaterThan(1);
  expect(keyWarnings).toEqual([]);
});


test('ledger filters, real totals/pages and evidence metadata remain scoped to visible records', async ({ page, request }) => {
  const { ledger, secondFacility } = await ledgerWorkspace(page, request, 26);
  const pages = ledger.getByRole('navigation', { name: 'Activity record pages' });
  await expect(pages).toContainText('Showing 1–25 of 28 matching records');
  await expect(ledger.getByRole('table', { name: 'Activity records' }).locator('tbody tr')).toHaveCount(25);
  await pages.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(pages).toContainText('Showing 26–28 of 28 matching records');
  await expect(ledger.getByRole('table', { name: 'Activity records' }).locator('tbody tr')).toHaveCount(3);
  await expect(pages.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
  await ledger.getByLabel('Filter facility', { exact: true }).selectOption(secondFacility.id);
  await expect(pages).toContainText('Showing 1–1 of 1 matching records');
  const metadata = ledger.getByRole('region', { name: 'Evidence metadata on this page', exact: true });
  await expect(metadata).toContainText('0 of 1 records on this page have reference metadata; 1 have none.');
  await expect(ledger.getByRole('cell', { name: 'second-site', exact: true })).toBeVisible();
  await ledger.getByLabel('Filter activity', { exact: true }).selectOption('electricity');
  await expect(ledger.getByText('No records match these filters. Clear filters to review the period.', { exact: true })).toBeVisible();
  await expect(pages).toContainText('0 matching records');
  await ledger.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await ledger.getByLabel('Filter status', { exact: true }).selectOption('SUBMITTED');
  await expect(pages).toContainText('Showing 1–1 of 1 matching records');
  const row = ledger.getByRole('row').filter({ has: page.getByRole('cell', { name: 'extra-1', exact: true }) });
  await row.getByText('Evidence details', { exact: true }).click();
  await expect(row).toContainText('No linked document recorded');
  await expect(row).toContainText('No reference metadata');
  await expect(metadata).toContainText('0 of 1');
  await ledger.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(pages).toContainText('Showing 1–25 of 28 matching records');
  await pages.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(pages).toContainText('Showing 26–28');
  await pages.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(pages).toContainText('Showing 1–25');
  await ledger.getByRole('heading', { name: 'Activity ledger', exact: true }).evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: `docs/website-transformation/evidence/ledger-filters-${page.viewportSize()!.width}.png`, scale: 'css' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

test('an earlier action finishing after a period change reloads the currently selected period', async ({ page, request }) => {
  const { ledger, periods } = await ledgerWorkspace(page, request);
  let release;
  let requested;
  const hold = new Promise<void>((resolve) => { release = resolve; });
  const started = new Promise<void>((resolve) => { requested = resolve; });
  await page.route('**/api/esg/activities/*/submit', async (route) => {
    const upstream = await route.fetch();
    requested();
    await hold;
    await route.fulfill({ response: upstream });
  });
  const periodRequests: string[] = [];
  page.on('request', (req) => { if (req.url().includes('/api/esg/activities?')) periodRequests.push(new URL(req.url()).searchParams.get('period_id')!); });
  await ledger.getByRole('button', { name: 'Submit', exact: true }).click();
  await started;
  await ledger.getByLabel('Reporting period', { exact: true }).selectOption(periods[0]);
  await expect(ledger.getByRole('cell', { name: 'synthetic-2024', exact: true })).toBeVisible();
  const completed = page.waitForResponse((response) => response.url().endsWith('/submit'));
  release();
  await completed;
  await expect(page.locator('.esg-workspace').getByRole('status').filter({ hasText: 'Record submitted.' })).toBeVisible();
  await expect.poll(() => periodRequests.at(-1)).toBe(periods[0]);
  await expect(ledger.getByRole('cell', { name: 'synthetic-2024', exact: true })).toBeVisible();
  await expect(ledger.getByRole('cell', { name: 'synthetic-2025', exact: true })).toHaveCount(0);
});
