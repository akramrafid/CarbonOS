import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.use({ reducedMotion: 'reduce' });
const fits = async (page) => expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);

test('factory product page explains a real workflow without legacy commercial or verification claims', async ({ page }) => {
  const telemetry: string[] = [];
  page.on('request', (request) => { if (/blynk/i.test(request.url())) telemetry.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'CarbonOS home', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Carbon evidence.');
  await expect(page.getByRole('link', { name: 'See the workflow', exact: true })).toHaveAttribute('href', '/#platform');
  await expect(page.getByText(/99\.98%|MoEFCC Verified|Verified Client|Active Registry|4-hour SLA|institutional@carbonzerobd|Real-Time Ecological Ground Truth/i)).toHaveCount(0);
  await expect(page.locator('.hero-terminal-card')).toHaveCSS('opacity', '1');
  await page.evaluate(() => document.fonts.ready);
  if (page.viewportSize()!.width <= 375) {
    const cta = await page.getByRole('link', {name:'Try the ESG demo', exact:true}).first().boundingBox();
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  }
  await page.screenshot({path:`docs/showcase/product-home-${page.viewportSize()!.width}.png`, scale:'css'});
  const steps = page.getByRole('group', {name:'Workflow preview steps'});
  await steps.getByRole('button', {name:/Calculate from approved inputs/}).click();
  await expect(page.getByRole('region', {name:'Workflow preview', exact:true})).toContainText('80 tCO₂e');
  await expect(page.getByRole('region', {name:'Workflow preview', exact:true})).toContainText('custom synthetic fixture');
  await expect(steps.getByRole('button', {name:/Calculate from approved inputs/})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('table', {name:'Current product scope', exact:true})).toContainText('Not implemented');
  await fits(page);
  expect(telemetry).toEqual([]);
  await page.getByRole('button', {name:'Switch to light mode', exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  if (page.viewportSize()!.width <= 375) {
    const cta = await page.getByRole('link', {name:'Try the ESG demo', exact:true}).first().boundingBox();
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  }
  await page.screenshot({path:`docs/showcase/product-home-light-${page.viewportSize()!.width}.png`, scale:'css'});
  await fits(page);
});

test('pilot planner validates choices and downloads an honest local brief without submitting an enquiry', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', (request) => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.goto('/#pricing');
  const form = page.getByRole('form', {name:'Plan a pilot', exact:true});
  await form.getByLabel('Text / Markdown', {exact:true}).uncheck();
  await form.getByLabel('Text-based PDF', {exact:true}).uncheck();
  await form.getByRole('button', {name:'Prepare pilot brief'}).click();
  await expect(form.getByRole('alert')).toContainText('at least one');
  await form.getByLabel('Scanned invoice / image', {exact:true}).check();
  await form.getByLabel('Pilot facilities').selectOption('larger');
  await form.getByLabel('Document languages').selectOption('mixed');
  await form.getByLabel('Main reporting goal').selectOption('extended');
  await form.getByRole('button', {name:'Prepare pilot brief'}).click();
  const brief = page.getByRole('region', {name:'Prepared pilot brief', exact:true});
  await expect(brief).toContainText('Additional scoping required');
  await expect(brief).toContainText('OCR is not implemented');
  const downloaded = page.waitForEvent('download');
  await brief.getByRole('button', {name:'Download pilot brief'}).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('CarbonOS-pilot-brief.txt');
  const text = await readFile((await download.path())!, 'utf8');
  expect(text).toContain('Facilities: 6+ facilities');
  expect(text).toContain('outside the current demo');
  expect(text).toContain('No enquiry was submitted');
  expect(posts).toEqual([]);
  await fits(page);
  await page.getByRole('link', {name:'CarbonOS home', exact:true}).click();
  await expect(page).toHaveURL(/\/#hero$/);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
});

test('trust and company pages explain deployment limits and have distinct titles', async ({ page }) => {
  for (const [path, title, heading] of [
    ['/company/trust', 'Trust & data', 'Traceability you can inspect.'],
    ['/company/privacy', 'Prototype data use', 'Understand the data path'],
    ['/company/terms', 'Prototype service status', 'Evaluate the workflow'],
    ['/company/about', 'About', 'A clearer path'],
    ['/how-it-works', 'How it works', 'From a source document'],
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(`${title} | CarbonOS`);
    await expect(page.getByRole('heading', {level:1})).toContainText(heading);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    await expect(page.getByText(/sovereign servers physically|violation of federal law|100% accurate/i)).toHaveCount(0);
    await fits(page);
  }
});

test('evidence entry links open the intended workspace and stay synchronized with section changes', async ({ page }) => {
  test.skip(process.env.ESG_E2E_ACCESS_MODE !== 'isolated_demo', 'Requires an isolated synthetic demo session.');
  await page.goto('/platform/esg?view=evidence');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  const sections = page.getByRole('navigation', {name:'ESG workspace sections'});
  await expect(sections.getByRole('button', {name:'Evidence assistant', exact:true})).toHaveAttribute('aria-current','page');
  await sections.getByRole('button', {name:'Setup', exact:true}).click();
  await expect(page).toHaveURL(/\/platform\/esg$/);
  await page.getByRole('navigation', {name:'Product links'}).getByRole('link', {name:'Evidence assistant', exact:true}).click();
  await expect(page).toHaveURL(/view=evidence/);
  await expect(sections.getByRole('button', {name:'Evidence assistant', exact:true})).toHaveAttribute('aria-current','page');
  await page.goto('/platform/esg?view=unsupported');
  await expect(sections.getByRole('button', {name:'Setup', exact:true})).toHaveAttribute('aria-current','page');
  await fits(page);
});
