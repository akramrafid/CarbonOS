import { test, expect } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { E2E_JWT_SECRET } from '../../playwright.config';

test.use({ reducedMotion: 'reduce' });

test('shared ESG controls and real feedback remain readable in both themes', async ({ page, request }) => {
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const sub = `controls-${randomUUID()}`;
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', E2E_JWT_SECRET).update(body).digest('base64url')}`;
  const org = await request.post(`${process.env.ESG_TEST_API_URL || 'http://127.0.0.1:8100'}/api/esg/organizations`, {
    headers: { Authorization: `Bearer ${token}` }, data: { name: sub, is_demo: false },
  });
  await expect(org).toBeOK();
  await page.addInitScript((value) => { (window as any).__ESG_E2E_TOKEN__ = value; }, token);
  await page.goto('/platform/esg');
  await page.getByLabel('Name', { exact: true }).first().fill('Theme test entity');
  await page.getByLabel('Country (ISO-2)').first().fill('BD');
  await page.getByRole('button', { name: 'Add legal entity' }).click();
  const success = page.getByRole('status').filter({ hasText: 'Saved.' });
  await expect(success).toBeVisible();
  for (const theme of ['light', 'dark']) {
    const toggle = page.getByRole('button', { name: `Switch to ${theme} mode` });
    if (!(await toggle.isVisible()) && await page.getByRole('button', { name: 'Open navigation menu' }).isVisible()) {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
    }
    if (await toggle.isVisible()) await toggle.click();
    if (await page.getByRole('dialog').isVisible()) await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(success).toHaveClass(/esg-tone-success/);
    const field = page.getByLabel('Factor region', { exact: true });
    await expect(field).toHaveAccessibleDescription('Must match the region of the factors you approve.');
    await field.focus();
    await expect(field).toBeFocused();
    await expect(field).toHaveCSS('outline-style', 'solid');
    await expect(success).toHaveCSS('color', theme === 'light' ? 'rgb(20, 83, 45)' : 'rgb(134, 239, 172)');
  }
  let periodRequests = 0;
  page.on('request', (request) => { if (request.method() === 'POST' && request.url().endsWith('/api/esg/periods')) periodRequests++; });
  await page.getByLabel('Name', { exact: true }).last().fill('Invalid period');
  await page.getByLabel('Start date').fill('2025-12-31');
  await page.getByLabel('End date').fill('2025-01-01');
  await page.getByRole('button', { name: 'Add period' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  const endDate = page.getByLabel('End date', { exact: true });
  await expect(endDate).toBeFocused();
  await expect(endDate).toHaveAttribute('aria-invalid', 'true');
  await expect(endDate).toHaveAccessibleDescription('The reporting period must end after its start date. End date must be after the start date.');
  expect(periodRequests).toBe(0);
  await endDate.fill('2025-12-31');
  await page.getByRole('button', { name: 'Add period' }).click();
  await expect(endDate).toHaveAttribute('aria-invalid', 'true');
  expect(periodRequests).toBe(0);
  await endDate.fill('2026-01-01');
  await expect(endDate).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Name', { exact: true }).last().fill('Corrected period');
  await page.getByRole('button', { name: 'Add period' }).click();
  await expect(page.getByRole('cell', { name: 'Corrected period', exact: true })).toBeVisible();
  expect(periodRequests).toBe(1);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('navigation', { name: 'ESG workspace sections' }).getByRole('button', { name: 'Emission factors', exact: true }).click();
  await expect(page.getByLabel('Scope 2 method', { exact: true })).toHaveAccessibleDescription('Ignored for Scope 1 (direct)');
  await expect(page.getByRole('cell', { name: 'Invalid period', exact: true })).toHaveCount(0);
});
