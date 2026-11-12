import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('qa/phase-2');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 375, height: 667, name: '375x667' },
  { width: 1440, height: 900, name: '1440x900' }
];

const THEMES = ['dark', 'light'];

const ALL_ROUTES = [
  { path: '/', name: 'home' },
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/platform/project-onboarding', name: 'project-onboarding' },
  { path: '/platform/mrv-dashboard', name: 'mrv-dashboard' },
  { path: '/platform/carbon-registry', name: 'carbon-registry' },
  { path: '/platform/verification-workflow', name: 'verification-workflow' },
  { path: '/platform/marketplace', name: 'marketplace' },
  { path: '/platform/ai-detection', name: 'ai-detection' },
  { path: '/platform/saas-dashboard', name: 'saas-dashboard' },
  { path: '/platform/esg', name: 'esg-workspace' },
  { path: '/platform/impact', name: 'impact' },
  { path: '/carbon-monitoring', name: 'carbon-monitoring' },
  { path: '/farmers-ai', name: 'farmers-ai' },
  { path: '/farmers-ai/camera', name: 'camera' },
  { path: '/farmers-ai/result', name: 'diagnosis-result' },
  { path: '/harvestguard/dashboard', name: 'harvestguard-dashboard' },
  { path: '/harvestguard/register-batch', name: 'register-batch' },
  { path: '/harvestguard/risk-analysis/batch-001', name: 'risk-analysis' },
  { path: '/harvestguard/risk-map', name: 'risk-map' },
  { path: '/technology', name: 'technology' },
  { path: '/dashboard/farmer', name: 'farmer-dashboard' },
  { path: '/dashboard/farmer/earnings', name: 'farmer-earnings' },
  { path: '/sectors/solar-irrigation', name: 'solar-irrigation' },
  { path: '/sectors/rice-methane', name: 'rice-methane' },
  { path: '/sectors/clean-cookstoves', name: 'clean-cookstoves' },
  { path: '/sectors/waste-to-energy', name: 'waste-to-energy' },
  { path: '/sectors/mangrove-carbon', name: 'mangrove-carbon' },
  { path: '/sectors/brick-kilns', name: 'brick-kilns' },
  { path: '/company/about', name: 'about' },
  { path: '/company/framework-docs', name: 'framework-docs' },
  { path: '/company/api-docs', name: 'api-docs' },
  { path: '/company/careers', name: 'careers' },
  { path: '/company/privacy', name: 'privacy' },
  { path: '/company/terms', name: 'terms' },
  { path: '/forbidden', name: 'forbidden' },
  { path: '/404-nonexistent', name: 'not-found' }
];

async function run() {
  const PORT = 5199;
  const BASE_URL = `http://localhost:${PORT}`;

  console.log(`Starting in-process Vite preview server on port ${PORT}...`);
  const server = await preview({
    preview: { port: PORT }
  });
  console.log(`Vite preview ready at ${BASE_URL}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log(`Starting Phase 2 screenshot capture across ${ALL_ROUTES.length} routes...`);
  let successCount = 0;

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });
      const page = await context.newPage();

      for (const route of ALL_ROUTES) {
        const url = `${BASE_URL}${route.path}`;
        const filename = `${route.name}_${vp.name}_${theme}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.evaluate((t) => {
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
              document.documentElement.setAttribute('data-theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
            }
          }, theme);
          await page.waitForTimeout(400);

          await page.screenshot({ path: filepath, fullPage: false });
          console.log(`[Phase 2] Captured: ${filename}`);
          successCount++;
        } catch (err) {
          console.error(`[Phase 2] Failed ${filename}: ${err.message}`);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  await server.close();
  console.log(`Phase 2 capture complete! ${successCount} screenshots captured in ${OUTPUT_DIR}`);
}

run().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

