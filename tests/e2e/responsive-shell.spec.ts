import { test, expect, type Page } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { E2E_JWT_SECRET } from '../../playwright.config';

test.use({ reducedMotion: 'reduce' });

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    (page.viewportSize()?.width || 0) + 1,
  );
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  for (const control of await nav.locator('a:visible, button:visible').all()) {
    const box = await control.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x || 0) + (box?.width || 0)).toBeLessThanOrEqual((page.viewportSize()?.width || 0) + 1);
  }
}

test('navigation fits, traps modal focus, restores focus, and reaches the real demo route', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await fits(page);
  const width = page.viewportSize()?.width;
  if (width === 375 || width === 1440) {
    await expect(page.locator('.hero-terminal-card')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero-body')).toHaveCSS('opacity', '1');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `docs/qa/responsive-home-${width}.png`, scale: 'css' });
  }
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) {
    await menu.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeFocused();
    // Cycling beyond the number of controls must never reach the background page.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      // Native dialogs may hand focus to browser chrome; background controls remain inert.
      expect(await dialog.evaluate((el) => document.activeElement === document.body || el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(menu).toBeFocused();
    await menu.click();
    await dialog.getByRole('link', { name: /Try the demo/i }).click();
    await expect(dialog).not.toBeVisible();
  } else {
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: /Try the demo/i }).click();
  }
  await expect(page).toHaveURL(/\/platform\/esg$/);
  await expect(page.getByRole('heading', { name: 'GHG accounting workspace' })).toBeVisible();
  await fits(page);
});

test('shared routes, both languages, skip navigation and missing-page recovery work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  const language = page.getByRole('button', { name: /Current language is English/ });
  if (!(await language.isVisible())) await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await language.click();
  await fits(page);
  if (await page.getByRole('dialog').isVisible()) await page.keyboard.press('Escape');
  for (const path of ['/how-it-works', '/farmers-ai', '/platform/saas-dashboard', '/company/about']) {
    await page.goto(path);
    await expect(page.locator('#main-content')).not.toBeEmpty();
    await fits(page);
  }
  await page.goto('/missing-responsive-check');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/platform/saas');
  await expect(page).toHaveURL(/\/platform\/esg$/);
});

test('ESG forms and every workspace section stay inside the viewport with real API data', async ({ page, request }) => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sub = `responsive-${randomUUID()}`;
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', E2E_JWT_SECRET).update(body).digest('base64url')}`;
  const headers = { Authorization: `Bearer ${token}` };
  const api = process.env.ESG_TEST_API_URL || 'http://127.0.0.1:8100';
  const org = await request.post(`${api}/api/esg/organizations`, { headers, data: { name: `Responsive textiles ${sub}`, is_demo: false } });
  await expect(org).toBeOK();
  await page.addInitScript((t) => { (window as any).__ESG_E2E_TOKEN__ = t; }, token);
  await page.goto('/platform/esg');
  await expect(page.getByRole('button', { name: 'Add legal entity' })).toBeVisible();
  await page.getByLabel('Name', { exact: true }).first().fill('Responsive Textiles Limited');
  await page.getByLabel('Country (ISO-2)').first().fill('BD');
  await page.getByRole('button', { name: 'Add legal entity' }).click();
  await expect(page.getByRole('cell', { name: 'Responsive Textiles Limited', exact: true })).toBeVisible();
  await fits(page);
  const width = page.viewportSize()?.width;
  if (width === 375 || width === 1440) {
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `docs/qa/responsive-esg-${width}.png`, scale: 'css' });
  }
  const tableRegion = page.getByRole('region', { name: 'Legal entities table', exact: true });
  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  for (const field of await page.locator('.esg-workspace input:visible, .esg-workspace select:visible').all()) {
    const box = await field.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect((box?.x || 0) + (box?.width || 0)).toBeLessThanOrEqual((page.viewportSize()?.width || 0) + 1);
  }
  const sections = page.getByRole('navigation', { name: 'ESG workspace sections' });
  for (const name of ['Emission factors', 'Activity ledger', 'E/S/G metrics', 'Calculation & reports', 'Disclosures', 'Members', 'Audit trail']) {
    await sections.getByRole('button', { name, exact: true }).click();
    await expect(sections.getByRole('button', { name, exact: true })).toHaveAttribute('aria-current', 'page');
    await fits(page);
  }
});

test('menu unlocks on desktop resize, themes remain usable, and section links scroll below the header', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) {
    await menu.click();
    await page.setViewportSize({ width: 1536, height: 960 });
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  }
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await fits(page);
  if (await menu.isVisible()) await menu.click();
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await navigation.getByRole('link', { name: 'Platform', exact: true }).click();
  await expect(page).toHaveURL(/\/#platform$/);
  await expect.poll(() => page.locator('#platform').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeGreaterThanOrEqual(80);
  await expect.poll(() => page.locator('#platform').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThanOrEqual(160);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
