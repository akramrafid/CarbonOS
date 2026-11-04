import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('careers shows verified vacancy state without dead applications or data collection', async ({ page }) => {
  const posts: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => { if (request.method() === 'POST') posts.push(request.url()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/company/careers');
  const main = page.getByRole('main');
  await expect(page).toHaveTitle('Careers | CarbonOS');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Explore the work behind CarbonOS.');
  await expect(main.getByRole('region', { name: 'No confirmed vacancies published' })).toContainText('does not collect CVs');
  await expect(main.getByText(/Senior Data Engineer|Carbon Policy Analyst|Dhaka HQ|Full-time|actively looking/)).toHaveCount(0);
  await expect(main.locator('button, form, input, a[href="#"], a[href^="mailto:"]')).toHaveCount(0);
  expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join('')).not.toContain('JobPosting');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('body')).toHaveCSS('background-color', theme === 'light' ? 'rgb(242, 243, 238)' : 'rgb(8, 15, 11)');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCSS('color', theme === 'light' ? 'rgb(65, 63, 63)' : 'rgb(240, 244, 241)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    for (const link of await main.getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
    if ([320, 1440].includes(page.viewportSize()!.width)) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `docs/website-transformation/evidence/careers-${theme}-${page.viewportSize()!.width}.png`, fullPage: true, scale: 'css', animations: 'disabled' });
    }
  }
  for (const [name, path, title] of [
    ['Explore the architecture', '/technology', 'Follow the evidence through every layer.'],
    ['Review standards & scope', '/company/framework-docs', 'Reference frameworks. Explicit product limits.'],
    ['Read the developer guide', '/company/api-docs', 'Integrate the working ESG workflow.'],
  ]) {
    await main.getByRole('link', { name, exact: true }).click();
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await page.getByRole('navigation', { name: 'Project and data links' }).getByRole('link', { name: 'Careers', exact: true }).click();
    await expect(page).toHaveURL(/\/company\/careers$/);
  }
  expect(posts).toEqual([]);
  expect(errors).toEqual([]);
});
