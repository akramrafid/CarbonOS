import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const OUT_DIR = path.resolve('qa/phase-5');
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
    // 1. Desktop Dark & Light Verification (1440x900)
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.addInitScript((t) => {
        localStorage.setItem('carbonos-theme', t);
        if (document.documentElement) {
          document.documentElement.setAttribute('data-theme', t);
        }
      }, theme);

      await page.goto(`${baseUrl}/company/about`, { waitUntil: 'networkidle' });
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        document.documentElement.classList.toggle('dark', t === 'dark');
        document.documentElement.classList.toggle('light', t === 'light');
      }, theme);
      const footer = page.locator('footer[aria-label="Site footer"]');
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert.equal(overflow, false, `Desktop (${theme}) must have zero horizontal overflow`);

      // Verify 4 desktop link columns are visible
      const desktopNav = footer.locator('nav[aria-label="Footer navigation"]');
      assert.equal(await desktopNav.isVisible(), true, 'Desktop 4-column footer nav must be visible at 1440px');

      await footer.screenshot({
        path: path.join(OUT_DIR, `footer-desktop-1440-${theme}.png`),
      });

      // Test language toggle to Bangla on desktop
      if (theme === 'dark') {
        const langBtn = footer.locator('button[aria-label="Switch language"]');
        await langBtn.click();
        await page.waitForTimeout(200);
        await footer.screenshot({
          path: path.join(OUT_DIR, `footer-desktop-1440-dark-bn.png`),
        });
      }

      assert.deepEqual(errors, [], `Unexpected page errors on Desktop (${theme}): ${errors.join('; ')}`);
      await context.close();
    }

    // 2. Mobile Dark & Light Accordion Verification (375x812)
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const page = await context.newPage();

      await page.addInitScript((t) => {
        localStorage.setItem('carbonos-theme', t);
        if (document.documentElement) {
          document.documentElement.setAttribute('data-theme', t);
        }
      }, theme);

      await page.goto(`${baseUrl}/company/about`, { waitUntil: 'networkidle' });
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        document.documentElement.classList.toggle('dark', t === 'dark');
        document.documentElement.classList.toggle('light', t === 'light');
      }, theme);
      const footer = page.locator('footer[aria-label="Site footer"]');
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Verify mobile accordion opens on click
      const mobileNav = footer.locator('nav[aria-label="Mobile footer navigation"]');
      const firstAccordionBtn = mobileNav.locator('button[aria-expanded]').first();
      assert.equal(await firstAccordionBtn.getAttribute('aria-expanded'), 'false');
      await firstAccordionBtn.click();
      await page.waitForTimeout(200);
      assert.equal(await firstAccordionBtn.getAttribute('aria-expanded'), 'true');

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert.equal(overflow, false, `Mobile (${theme}) must have zero horizontal overflow`);

      await footer.screenshot({
        path: path.join(OUT_DIR, `footer-mobile-375-${theme}-accordion.png`),
      });

      await context.close();
    }

    // 3. Dashboard Slim Footer Verification (1440x900)
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/platform/saas-dashboard`, { waitUntil: 'networkidle' });
      const slimFooter = page.locator('footer[aria-label="Workspace footer"]');
      await slimFooter.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      assert.equal(await slimFooter.isVisible(), true, 'Dashboard slim footer must be visible on desktop');
      await slimFooter.screenshot({
        path: path.join(OUT_DIR, `footer-dashboard-slim-1440-dark.png`),
      });
      await context.close();
    }

    process.stdout.write('[verify_phase5_footer] PASSED: 6 screenshots saved to qa/phase-5/\n');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
