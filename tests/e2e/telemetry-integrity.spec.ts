import { test, expect } from '@playwright/test';

test('unsupported telemetry is explicit and sends no provider-token requests', async ({ page }) => {
  const providerRequests: string[] = [];
  page.on('request', (request) => { if (/blynk|token=/.test(request.url())) providerRequests.push(new URL(request.url()).hostname); });
  await page.route('**/api/farmers-ai/mrv/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto('/platform/mrv-dashboard');
  await expect(page.getByRole('heading', { name: 'MRV Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Live telemetry unavailable.' })).toBeVisible();
  await expect(page.getByText('Not calculated', { exact: true })).toBeVisible();
  await expect(page.getByText(/12,408|12,409|450\.2000|14 mins ago|SYSTEM: NOMINAL/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download Excel', exact: true })).toBeDisabled();
  expect(providerRequests).toEqual([]);
});
