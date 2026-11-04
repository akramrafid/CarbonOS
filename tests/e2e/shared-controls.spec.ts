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
    await field.focus();
    await expect(field).toBeFocused();
    await expect(field).toHaveCSS('outline-style', 'solid');
    await expect(success).toHaveCSS('color', theme === 'light' ? 'rgb(20, 83, 45)' : 'rgb(134, 239, 172)');
  }
  await page.getByLabel('Name', { exact: true }).last().fill('Invalid period');
  await page.getByLabel('Start date').fill('2025-12-31');
  await page.getByLabel('End date').fill('2025-01-01');
  await page.getByRole('button', { name: 'Add period' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveClass(/esg-tone-danger/);
  await expect(page.getByRole('cell', { name: 'Invalid period', exact: true })).toHaveCount(0);
});
