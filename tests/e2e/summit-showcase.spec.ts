import { test, expect } from '@playwright/test';

test('evidence assistant indexes, cites, abstains, and runs an actual extraction regression', async ({ page }) => {
  test.skip(process.env.ESG_E2E_ACCESS_MODE !== 'isolated_demo', 'Requires an isolated synthetic demo session.');
  await page.goto('/platform/esg');
  await page.getByRole('navigation', {name: 'ESG workspace sections'}).getByRole('button', {name:'Evidence assistant', exact:true}).click();
  await page.getByLabel('Source document', {exact:true}).setInputFiles('public/samples/factory-policy-demo.txt');
  await page.getByRole('button', {name:'Index source document', exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'indexed passage'})).toBeVisible();
  await page.getByLabel('Question', {exact:true}).fill('What does the boiler inspection policy require?');
  await page.getByRole('button', {name:'Ask with sources', exact:true}).click();
  const answer = page.getByRole('region', {name:'Evidence answer', exact:true});
  await expect(answer.getByRole('heading', {name:'Retrieved source excerpt'})).toBeVisible();
  await expect(answer).toContainText('12 months');
  await expect(answer).toContainText('factory-policy-demo.txt');
  await answer.getByText('Source provenance', {exact:true}).click();
  await expect(answer).toContainText('Content SHA-256:');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:`docs/showcase/evidence-assistant-${page.viewportSize()!.width}.png`, scale:'css'});
  await page.getByLabel('Question', {exact:true}).fill('Ocean shipping pension discounts');
  await page.getByRole('button', {name:'Ask with sources', exact:true}).click();
  await expect(answer.getByRole('heading', {name:'Insufficient evidence'})).toBeVisible();
  await page.getByRole('button', {name:'Run extraction regression', exact:true}).click();
  await expect(page.getByRole('table', {name:'Synthetic extraction results', exact:true})).toContainText('Failed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

test('homepage presents a working product without unsupported trading or customer claims', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Carbon evidence.');
  await expect(page.getByRole('link', { name: 'Try the ESG demo', exact: true }).first()).toHaveAttribute('href', '/platform/esg');
  await expect(page.getByText(/10\.42M|৳412\.8M|Verified Client|97% DIRECT PAYOUT|Real-Time Settlement Feed/)).toHaveCount(0);
});

test('service failure has a recoverable state and retry returns to protected entry', async ({ page }) => {
  await page.route('**/api/esg/demo/session', (route) => route.abort());
  await page.goto('/platform/esg');
  await expect(page.getByRole('heading', { name: 'Demo temporarily unavailable' })).toBeVisible();
  await expect(page.getByText(/localhost:8000|API server is running/)).toHaveCount(0);
  await page.route('**/api/esg/demo/session', (route) => route.fulfill({ status: 403, contentType: 'application/json', body: '{"detail":"Demo disabled"}' }));
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('heading', { name: 'Demo access is disabled' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('seeded showcase completes evidence extraction, independent review, calculation, lock, and export', async ({ page }) => {
  test.skip(process.env.ESG_E2E_ACCESS_MODE !== 'isolated_demo', 'Run with ESG_E2E_ACCESS_MODE=isolated_demo.');
  test.setTimeout(90000);
  await page.goto('/platform/esg');
  await expect(page.getByRole('heading', { name: 'Your three-minute demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approver (Admin)', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path: `docs/showcase/summit-workspace-${page.viewportSize()!.width}.png`, scale:'css'});
  const sections = page.getByRole('navigation', { name: 'ESG workspace sections' });
  await sections.getByRole('button', { name: 'Activity ledger', exact: true }).click();
  await page.getByLabel('Extract from a document').setInputFiles('public/samples/factory-electricity-demo.txt');
  await expect(page.getByRole('table', { name: 'Extracted values', exact: true })).toContainText('125,000');
  await expect(page.getByRole('table', { name: 'Extracted values', exact: true })).toContainText('rule match');
  await page.getByRole('button', { name: 'Auditor (Reviewer)', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Auditor (Reviewer)', exact: true })).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByText('Record approved.', {exact:true})).toBeVisible();
  await page.getByRole('button', { name: 'Submitter (Owner)', exact: true }).click();
  await sections.getByRole('button', { name: 'Calculation & reports', exact: true }).click();
  await page.getByRole('button', { name: 'Run calculation', exact: true }).click();
  await expect(page.getByText('12.06 tCO₂e', {exact:true})).toBeVisible();
  await expect(page.getByText('80 tCO₂e', {exact:true})).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve & lock period' })).toBeDisabled();
  await page.getByRole('button', { name: 'Approver (Admin)', exact: true }).click();
  await page.getByRole('button', { name: 'Approve & lock period' }).click();
  await expect(page.getByText('Period locked and report snapshot recorded.', {exact:true})).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add legal entity', exact: true })).toBeVisible();
  await expect(sections.getByRole('button', { name: 'Setup', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});
