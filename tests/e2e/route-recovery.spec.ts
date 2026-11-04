import { test, expect } from '@playwright/test';

test('a failed lazy page offers reload and recovers after the connection returns', async ({ page }) => {
  let fail = true;
  await page.route('**/src/pages/company/Trust.jsx*', (route) => fail ? route.abort() : route.continue());
  await page.goto('/company/trust');
  await expect(page.getByRole('heading', { name: 'This page couldn’t open' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload page' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Reload page' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Traceability you can inspect.');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('a page render failure keeps navigation usable and exposes no raw error', async ({ page }) => {
  await page.route('**/src/pages/company/Trust.jsx*', (route) => route.fulfill({
    status: 200, contentType: 'text/javascript',
    body: 'export default function BrokenPage() { throw new Error("private-test-detail"); }',
  }));
  await page.goto('/company/trust');
  await expect(page.getByRole('heading', { name: 'This page couldn’t open' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('private-test-detail');
  await page.getByRole('link', { name: 'Back to home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Carbon evidence.');
  await expect(page.getByRole('button', { name: 'Reload page' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});
