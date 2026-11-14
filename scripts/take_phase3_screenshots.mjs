import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [
  { name: '375px', width: 375, height: 667 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 }
];

const THEMES = ['dark', 'light'];

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'saas-dashboard', path: '/platform/saas-dashboard' },
  { name: 'carbon-monitoring', path: '/carbon-monitoring' },
  { name: 'impact', path: '/platform/impact' },
  { name: 'esg-workspace', path: '/platform/esg' },
  { name: 'farmers-ai', path: '/farmers-ai' }
];

async function capture() {
  const outDir = path.resolve('qa/phase-3');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Starting preview server for Phase 3 screenshot capture...');
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 }
  });
  const port = server.httpServer.address().port;
  const BASE_URL = `http://127.0.0.1:${port}`;
  console.log(`Server running at ${BASE_URL}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });
      const page = await context.newPage();

      for (const route of ROUTES) {
        try {
          await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.evaluate((th) => {
            document.documentElement.setAttribute('data-theme', th);
            if (th === 'dark') {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
            }
          }, theme);

          await page.waitForTimeout(500);

          const filename = `${route.name}_${vp.name}_${theme}.png`;
          const filePath = path.join(outDir, filename);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Captured: ${filename}`);
        } catch (e) {
          console.error(`Failed to capture ${route.name} at ${vp.name} (${theme}):`, e.message);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  await server.close();
  console.log('All Phase 3 screenshots captured in qa/phase-3/');
}

capture().catch((e) => {
  console.error('Fatal screenshot error:', e);
  process.exit(1);
});

