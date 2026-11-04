import { test, expect } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { E2E_JWT_SECRET } from '../../playwright.config';

async function ledgerWorkspace(page, request) {
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
  await page.addInitScript((value) => { (window as any).__ESG_E2E_TOKEN__ = value; }, token);
  await page.goto('/platform/esg?view=ledger');
  const ledger = page.getByRole('region', { name: 'Activity ledger', exact: true });
  await expect(ledger.getByRole('cell', { name: 'synthetic-2025', exact: true })).toBeVisible();
  return { api, periods, ledger };
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
