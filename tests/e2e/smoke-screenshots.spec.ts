import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'carbon-registry', path: '/platform/carbon-registry' },
  { name: 'marketplace', path: '/platform/marketplace' },
  { name: 'saas-dashboard', path: '/platform/saas-dashboard' },
  { name: 'esg-workspace', path: '/platform/esg' },
  { name: 'farmers-ai', path: '/farmers-ai' },
  { name: 'harvestguard-dashboard', path: '/harvestguard/dashboard' },
  { name: 'forbidden', path: '/forbidden' },
  { name: 'not-found', path: '/unresolved-test-node-404' }
];

const VIEWPORTS = [
  { name: '375px', width: 375, height: 812 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1440px', width: 1440, height: 900 }
];

const THEMES = ['dark', 'light'] as const;

test.describe('E2E QA Smoke Screenshots', () => {
  test.beforeAll(async () => {
    const dir = path.resolve('qa-screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        test(`Capture ${route.name} at ${vp.name} [${theme}]`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          // Pre-populate theme before navigation
          await page.addInitScript((th) => {
            try {
              localStorage.setItem('carbonos-theme', th);
              if (th === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch {}
          }, theme);

          await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(600);

          const screenshotPath = path.resolve(
            'qa-screenshots',
            `${route.name}-${vp.name}-${theme}.png`
          );

          await page.screenshot({ path: screenshotPath, fullPage: false });
        });
      }
    }
  }
});
