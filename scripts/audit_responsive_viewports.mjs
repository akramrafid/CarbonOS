import { chromium } from '@playwright/test';
import { preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('qa/phase-10');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '320px_iphone_se', width: 320, height: 568 },
  { name: '375px_iphone_standard', width: 375, height: 667 },
  { name: '414px_iphone_max', width: 414, height: 896 },
  { name: '768px_ipad_portrait', width: 768, height: 1024 },
  { name: '1024px_ipad_landscape', width: 1024, height: 768 },
  { name: '1280px_laptop', width: 1280, height: 800 },
  { name: '1440px_desktop', width: 1440, height: 900 },
  { name: '1920px_ultrawide', width: 1920, height: 1080 },
  { name: '844x390_landscape_mobile', width: 844, height: 390 },
  { name: '640x360_zoom_200pct', width: 640, height: 360 },
];

const ROUTES = [
  '/',
  '/how-it-works',
  '/technology',
  '/platform/saas-dashboard',
  '/platform/mrv-dashboard',
  '/platform/carbon-registry',
  '/carbon-monitoring',
  '/farmers-ai',
  '/platform/impact',
];

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

async function main() {
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
  });
  const port = server.httpServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const auditResults = [];
  let overflowViolations = 0;
  let sub44TapTargets = 0;

  try {
    const context = await browser.newContext();

    // Stub external CDN assets so sandbox doesn't trigger network errors
    await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/i, async (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com')) {
        await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      } else if (/\.(png|jpg|jpeg|webp|svg)/i.test(url) || url.includes('basemaps.cartocdn.com')) {
        await route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    const page = await context.newPage();

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of ROUTES) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(100);

        const metrics = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const bodyWidth = document.body.scrollWidth;
          const isOverflowing = Math.max(docWidth, bodyWidth) > winWidth + 1; // 1px subpixel tolerance

          // Audit interactive tap targets
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));
          const smallTargets = [];
          for (const b of buttons) {
            const rect = b.getBoundingClientRect();
            // Only check visible elements
            if (rect.width > 0 && rect.height > 0 && b.offsetParent !== null) {
              if (rect.width < 40 || rect.height < 40) {
                smallTargets.push({
                  tag: b.tagName,
                  text: (b.textContent || '').trim().slice(0, 30),
                  ariaLabel: b.getAttribute('aria-label'),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                });
              }
            }
          }

          return {
            docWidth,
            winWidth,
            isOverflowing,
            smallTargetCount: smallTargets.length,
            smallTargets: smallTargets.slice(0, 5),
          };
        });

        if (metrics.isOverflowing) {
          overflowViolations++;
        }
        sub44TapTargets += metrics.smallTargetCount;

        auditResults.push({
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          route,
          ...metrics,
        });
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      totalChecks: auditResults.length,
      viewportsTested: VIEWPORTS.length,
      routesTested: ROUTES.length,
      overflowViolations,
      sub44TapTargets,
      allViewportsPassedZeroOverflow: overflowViolations === 0,
      summary: auditResults,
    };

    fs.writeFileSync(path.join(OUT_DIR, 'responsive-audit-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({
      totalChecks: report.totalChecks,
      overflowViolations: report.overflowViolations,
      allViewportsPassedZeroOverflow: report.allViewportsPassedZeroOverflow,
      sub44TapTargets: report.sub44TapTargets,
    }, null, 2));

    if (overflowViolations > 0) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

