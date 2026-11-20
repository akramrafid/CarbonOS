import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const OUT_DIR = path.resolve('qa/phase-6');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
  });
  const address = server.httpServer.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Verify Persistent Shell (Sidebar & TopBar never unmount on route transition)
    await page.goto(`${baseUrl}/platform/mrv-dashboard`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      window.__sidebarElement = document.querySelector('aside[aria-label="Dashboard navigation"]');
      window.__headerElement = document.querySelector('header');
    });

    // Click SaaS Accounting link in sidebar
    await page.click('aside[aria-label="Dashboard navigation"] a[href="/platform/saas-dashboard"]');
    await page.waitForSelector('[data-route-path="/platform/saas-dashboard"]');
    await page.waitForTimeout(350);

    const shellPersisted = await page.evaluate(() => {
      return (
        window.__sidebarElement === document.querySelector('aside[aria-label="Dashboard navigation"]') &&
        window.__headerElement === document.querySelector('header')
      );
    });
    assert.equal(shellPersisted, true, 'DashboardSidebar and TopBar must remain mounted across route transitions');

    // Verify focus moved to <h1> and aria-live announcer updated
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    assert.equal(activeTag, 'H1', 'Focus must move to the page main <h1> heading after route change');

    const announcerText = await page.locator('[data-testid="route-announcer"]').textContent();
    assert.ok(
      announcerText && announcerText.startsWith('Navigated to '),
      `Expected aria-live announcer to start with "Navigated to ", got "${announcerText}"`
    );

    await page.screenshot({
      path: path.join(OUT_DIR, 'phase6-dashboard-transition-1440.png'),
    });

    // 2. Verify Direction-Aware Sub-Route Transitions (+1 deeper, -1 POP back)
    await page.goto(`${baseUrl}/farmers-ai`, { waitUntil: 'networkidle' });
    await page.click('aside[aria-label="Dashboard navigation"] a[href="/farmers-ai/camera"]');
    await page.waitForSelector('[data-route-path="/farmers-ai/camera"]');
    const forwardDir = await page
      .locator('[data-route-path="/farmers-ai/camera"]')
      .getAttribute('data-route-direction');
    assert.equal(forwardDir, '1', 'Deeper sub-route must transition forward (+1)');

    await page.goBack();
    await page.waitForSelector('[data-route-path="/farmers-ai"]');
    const backDir = await page
      .locator('[data-route-path="/farmers-ai"]')
      .getAttribute('data-route-direction');
    assert.equal(backDir, '-1', 'POP navigation must reverse transition direction (-1)');

    // 3. Verify Scroll-to-Top on PUSH and Scroll Restoration on POP
    await page.goto(`${baseUrl}/how-it-works`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      window.scrollTo(0, 360);
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(100);

    await page.click('footer a[href="/company/about"]');
    await page.waitForSelector('[data-route-path="/company/about"]');
    await page.waitForTimeout(300);

    const newRouteScrollY = await page.evaluate(() => window.scrollY);
    assert.equal(newRouteScrollY, 0, 'New route navigation must scroll to top (0)');

    await page.goBack();
    await page.waitForSelector('[data-route-path="/how-it-works"]');
    await page.waitForTimeout(300);

    const restoredScrollY = await page.evaluate(() => window.scrollY);
    assert.ok(
      restoredScrollY >= 300,
      `Expected POP navigation to restore scrollY >= 300, got ${restoredScrollY}`
    );

    await page.screenshot({
      path: path.join(OUT_DIR, 'phase6-marketing-scroll-restored-1440.png'),
    });

    assert.deepEqual(pageErrors, [], `Unexpected page errors: ${pageErrors.join('; ')}`);
    await context.close();
    process.stdout.write('[verify_phase6_transitions] PASSED: All Phase 6 browser assertions and screenshots succeeded.\n');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

