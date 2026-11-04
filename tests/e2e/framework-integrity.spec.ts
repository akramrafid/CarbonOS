import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('framework page links original publishers and explains actual product coverage', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/company/framework-docs');
  const main = page.getByRole('main');
  await expect(page).toHaveTitle('Standards & scope | CarbonOS');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Reference frameworks. Explicit product limits.');
  const sources = main.getByRole('region', { name: 'Read the published sources' });
  await expect(sources.locator('li')).toHaveCount(3);
  for (const [name, href] of [
    ['Read GHG Protocol Corporate Standard on GHG Protocol', 'https://ghgprotocol.org/corporate-standard'],
    ['Read GHG Protocol Scope 2 Guidance on GHG Protocol', 'https://ghgprotocol.org/scope-2-guidance'],
    ['Read The Paris Agreement on UNFCCC', 'https://unfccc.int/process-and-meetings/the-paris-agreement'],
  ]) await expect(sources.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  await expect(main.locator('a[href="#"], a[download]')).toHaveCount(0);
  await expect(main.getByText(/Official documentation for|Framework v1\.2|PDF \(|VVB Accreditation Requirements/)).toHaveCount(0);
  const coverage = main.getByRole('region', { name: 'Current calculation coverage' });
  await expect(coverage).toContainText('Scope 3 is not included');
  await expect(coverage).toContainText('Missing market inputs remain unavailable');
  await expect(coverage).toContainText('Refrigerant mass balance');
  await expect(main.getByRole('complementary', { name: 'National policy and registry boundary' })).toContainText('sandbox responses do not establish official authorization');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('body')).toHaveCSS('background-color', theme === 'light' ? 'rgb(242, 243, 238)' : 'rgb(8, 15, 11)');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCSS('color', theme === 'light' ? 'rgb(65, 63, 63)' : 'rgb(240, 244, 241)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    for (const link of await main.getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
    if ([320, 1440].includes(page.viewportSize()!.width)) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `docs/website-transformation/evidence/framework-${theme}-${page.viewportSize()!.width}.png`, fullPage: true, scale: 'css', animations: 'disabled' });
    }
  }
  await main.getByRole('link', { name: /Explore the reporting architecture/ }).click();
  await expect(page).toHaveURL(/\/technology$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Follow the evidence through every layer.');
  await page.getByRole('navigation', { name: 'Project and data links' }).getByRole('link', { name: 'Standards & scope', exact: true }).click();
  await expect(page).toHaveURL(/\/company\/framework-docs$/);
  await main.getByRole('link', { name: /Review trust & data boundaries/ }).click();
  await expect(page).toHaveURL(/\/company\/trust$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Traceability you can inspect.');
  expect(errors).toEqual([]);
});
