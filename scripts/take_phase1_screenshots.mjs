import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const outDir = path.join(ROOT, 'qa/phase-1');
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  { path: '/', name: 'home' },
  { path: '/platform/saas-dashboard', name: 'saas-dashboard' },
  { path: '/carbon-monitoring', name: 'carbon-monitoring' },
  { path: '/platform/esg', name: 'esg-workspace' },
  { path: '/platform/mrv-dashboard', name: 'mrv-dashboard' }
];

const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 375, height: 667, name: 'mobile' }
];

const themes = ['dark', 'light'];

async function capture() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('Capturing Phase 1 screenshots...');

  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });
      const page = await context.newPage();

      for (const route of routes) {
        const url = `http://localhost:5173${route.path}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          // Ensure theme class is applied
          await page.evaluate((t) => {
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);
          await page.waitForTimeout(600);

          const filename = `${route.name}_${vp.name}_${theme}.png`;
          const filepath = path.join(outDir, filename);
          await page.screenshot({ path: filepath, fullPage: false });
          console.log(`Saved: ${filename}`);
        } catch (err) {
          console.error(`Failed ${route.name} (${vp.name}, ${theme}):`, err.message);
        }
      }
      await context.close();
    }
  }

  await browser.close();
  console.log('Phase 1 screenshots complete in qa/phase-1!');
}

capture();
