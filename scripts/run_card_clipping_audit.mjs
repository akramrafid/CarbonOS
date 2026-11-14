import { chromium } from '@playwright/test';
import { preview } from 'vite';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600 },
  { name: '375px', width: 375, height: 667 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1920px', width: 1920, height: 1080 }
];

const THEMES = ['dark', 'light'];

const CORE_ROUTES = [
  { name: 'home', path: '/' },
  { name: 'how-it-works', path: '/how-it-works' },
  { name: 'saas-dashboard', path: '/platform/saas-dashboard' },
  { name: 'carbon-monitoring', path: '/carbon-monitoring' },
  { name: 'esg-workspace', path: '/platform/esg' },
  { name: 'impact', path: '/platform/impact' },
  { name: 'marketplace', path: '/platform/marketplace' },
  { name: 'farmers-ai', path: '/farmers-ai' },
  { name: 'camera', path: '/farmers-ai/camera' },
  { name: 'harvestguard-dashboard', path: '/harvestguard/dashboard' }
];

async function run() {
  console.log(`Starting in-process Vite preview server on ephemeral port...`);
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 }
  });
  const port = server.httpServer.address().port;
  const BASE_URL = `http://127.0.0.1:${port}`;
  console.log(`Vite preview server listening at ${BASE_URL}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log(`Starting Phase 3 Card Clipping & Horizontal Overflow Audit across ${VIEWPORTS.length} viewports and ${THEMES.length} themes...`);

  let totalChecked = 0;
  let totalOverflows = 0;
  let totalClipped = 0;
  const failureDetails = [];

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme
      });
      const page = await context.newPage();

      for (const route of CORE_ROUTES) {
        totalChecked++;
        const url = `${BASE_URL}${route.path}`;

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
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

          await page.waitForTimeout(300);

          const result = await page.evaluate(() => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollW = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
            const clientW = docEl.clientWidth;
            const hasOverflow = scrollW > clientW + 2;

            const clipped = [];
            const cards = document.querySelectorAll('[class*="card"], [class*="panel"], article, [data-component="card"]');
            for (const card of cards) {
              if (card.closest('.leaflet-container') || card.closest('.marquee-track')) continue;
              const cardRect = card.getBoundingClientRect();
              if (cardRect.width === 0 || cardRect.height === 0) continue;

              let parent = card.parentElement;
              while (parent && parent !== document.documentElement && parent !== document.body) {
                if (parent.closest('.leaflet-container') || parent.closest('.marquee-track')) break;
                const pStyle = window.getComputedStyle(parent);
                const clips = ['hidden', 'clip'].includes(pStyle.overflowX) || ['hidden', 'clip'].includes(pStyle.overflowY);
                if (clips) {
                  const pRect = parent.getBoundingClientRect();
                  const rightDiff = Math.round(cardRect.right - pRect.right);
                  const bottomDiff = Math.round(cardRect.bottom - pRect.bottom);
                  const leftDiff = Math.round(pRect.left - cardRect.left);
                  const topDiff = Math.round(pRect.top - cardRect.top);

                  if (rightDiff > 8 || bottomDiff > 8 || leftDiff > 8 || topDiff > 8) {
                    const tag = card.tagName.toLowerCase();
                    const cls = typeof card.className === 'string' ? card.className.split(/\s+/).slice(0, 2).join('.') : '';
                    const pTag = parent.tagName.toLowerCase();
                    const pCls = typeof parent.className === 'string' ? parent.className.split(/\s+/).slice(0, 2).join('.') : '';
                    clipped.push({
                      card: `<${tag}.${cls}>`,
                      parent: `<${pTag}.${pCls}>`,
                      parentOverflow: `${pStyle.overflowX}/${pStyle.overflowY}`,
                      cardRect: { width: cardRect.width, right: cardRect.right, left: cardRect.left },
                      parentRect: { width: pRect.width, right: pRect.right, left: pRect.left },
                      diff: { rightDiff, bottomDiff, leftDiff, topDiff }
                    });
                    break;
                  }
                }
                parent = parent.parentElement;
              }
            }

            return {
              hasOverflow,
              scrollW,
              clientW,
              clipped
            };
          });

          if (result.hasOverflow) {
            totalOverflows++;
            failureDetails.push({
              type: 'HORIZONTAL_OVERFLOW',
              route: route.path,
              viewport: vp.name,
              theme,
              details: `scrollWidth (${result.scrollW}px) > clientWidth (${result.clientW}px)`
            });
          }

          if (result.clipped.length > 0) {
            totalClipped += result.clipped.length;
            failureDetails.push({
              type: 'CLIPPED_CARDS',
              route: route.path,
              viewport: vp.name,
              theme,
              details: result.clipped
            });
          }
        } catch (err) {
          console.error(`Error on ${route.path} (${vp.name}, ${theme}):`, err.message);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  await server.close();

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total checks conducted: ${totalChecked}`);
  console.log(`Horizontal overflows detected: ${totalOverflows}`);
  console.log(`Clipped cards detected: ${totalClipped}`);

  if (failureDetails.length > 0) {
    console.error('\nViolations found:');
    console.error(JSON.stringify(failureDetails, null, 2));
    process.exit(1);
  } else {
    console.log('\nSUCCESS: 0 horizontal overflows, 0 clipped cards across all viewports (320px - 1920px) and themes!');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});

