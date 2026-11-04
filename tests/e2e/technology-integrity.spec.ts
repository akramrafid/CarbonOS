import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('technology explains implemented workflows and dependencies in both themes', async ({ page }) => {
  const errors: string[] = [];
  const providerRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/blynk|earthengine|copernicus|planet\.com/i.test(request.url())) providerRequests.push(request.url());
  });
  await page.goto('/technology');
  await expect(page).toHaveTitle('Technology & deployment | CarbonOS');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /research boundaries/);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Follow the evidence through every layer.');
  await expect(main.getByRole('complementary', { name: 'Current deployment status' })).toContainText('Prototype, with explicit limits');
  await expect(main.getByRole('heading', { name: 'Field telemetry is unavailable' })).toBeVisible();
  await expect(main.getByText(/50,000|tamper-proof|50 IoT|5,000\+|Crore|letter of support secured|credits issued|Carbon Zero BD/i)).toHaveCount(0);
  const workflow = main.getByRole('region', { name: 'The reporting architecture' });
  await expect(workflow.locator('li')).toHaveCount(4);
  await expect(workflow).toContainText('Missing market inputs remain unavailable');
  await expect(main.locator('a[href="#"], button')).toHaveCount(0);

  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('body')).toHaveCSS('background-color', theme === 'light' ? 'rgb(242, 243, 238)' : 'rgb(8, 15, 11)');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCSS('color', theme === 'light' ? 'rgb(65, 63, 63)' : 'rgb(240, 244, 241)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    for (const control of await main.getByRole('link').all()) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
    await page.evaluate(() => document.fonts.ready);
    if ([320, 1440].includes(page.viewportSize()!.width)) {
      await page.screenshot({ path: `docs/website-transformation/evidence/technology-${theme}-${page.viewportSize()!.width}.png`, fullPage: true, scale: 'css', animations: 'disabled' });
    }
  }
  expect(errors).toEqual([]);
  expect(providerRequests).toEqual([]);
});

test('technology links enter the existing evidence and trust workflows', async ({ page }) => {
  await page.goto('/technology');
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: /Explore carbon-monitoring research/ })).toHaveAttribute('href', '/carbon-monitoring');
  await main.getByRole('link', { name: /Open the evidence assistant/ }).click();
  await expect(page).toHaveURL(/\/platform\/esg\?view=evidence$/);
  await expect(page.getByRole('heading', { name: 'GHG accounting workspace' })).toBeVisible();
  await page.goto('/technology');
  await main.getByRole('link', { name: /Review trust & data boundaries/ }).click();
  await expect(page).toHaveURL(/\/company\/trust$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Traceability you can inspect.');
  await page.goto('/technology');
  await main.getByRole('link', { name: 'Plan a pilot', exact: true }).click();
  await expect(page).toHaveURL(/\/#pricing$/);
  await expect(page.getByRole('form', { name: 'Plan a pilot', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Product links', exact: true }).getByRole('link', { name: 'Technology & deployment', exact: true }).click();
  await expect(page).toHaveURL(/\/technology$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Follow the evidence through every layer.');
});
