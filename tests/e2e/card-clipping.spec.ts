import { test, expect } from '@playwright/test';

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'how-it-works', path: '/how-it-works' },
  { name: 'technology', path: '/technology' },
  { name: 'solar-irrigation', path: '/sectors/solar-irrigation' },
  { name: 'rice-methane', path: '/sectors/rice-methane' },
  { name: 'clean-cookstoves', path: '/sectors/clean-cookstoves' },
  { name: 'waste-to-energy', path: '/sectors/waste-to-energy' },
  { name: 'mangrove-carbon', path: '/sectors/mangrove-carbon' },
  { name: 'brick-kilns', path: '/sectors/brick-kilns' },
  { name: 'about', path: '/company/about' },
  { name: 'framework-docs', path: '/company/framework-docs' },
  { name: 'api-docs', path: '/company/api-docs' },
  { name: 'careers', path: '/company/careers' },
  { name: 'privacy', path: '/company/privacy' },
  { name: 'terms', path: '/company/terms' },
  { name: 'project-onboarding', path: '/platform/project-onboarding' },
  { name: 'mrv-dashboard', path: '/platform/mrv-dashboard' },
  { name: 'carbon-registry', path: '/platform/carbon-registry' },
  { name: 'verification-workflow', path: '/platform/verification-workflow' },
  { name: 'marketplace', path: '/platform/marketplace' },
  { name: 'ai-detection', path: '/platform/ai-detection' },
  { name: 'saas-dashboard', path: '/platform/saas-dashboard' },
  { name: 'esg-workspace', path: '/platform/esg' },
  { name: 'impact', path: '/platform/impact' },
  { name: 'carbon-monitoring', path: '/carbon-monitoring' },
  { name: 'farmers-ai', path: '/farmers-ai' },
  { name: 'farmers-ai-camera', path: '/farmers-ai/camera' },
  { name: 'harvestguard-dashboard', path: '/harvestguard/dashboard' },
  { name: 'farmer-earnings', path: '/dashboard/farmer/earnings' }
];

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600 },
  { name: '375px', width: 375, height: 667 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1920px', width: 1920, height: 1080 }
];

const THEMES = ['dark', 'light'];

test.describe('Phase 3 Zero Card Clipping & Horizontal Overflow Suite', () => {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      test(`Audit ${vp.name} [${theme}]: zero horizontal overflow and zero clipped cards across core routes`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // Audit core representative landing and dashboard routes
        const testSubset = [
          ROUTES.find((r) => r.name === 'home')!,
          ROUTES.find((r) => r.name === 'saas-dashboard')!,
          ROUTES.find((r) => r.name === 'carbon-monitoring')!,
          ROUTES.find((r) => r.name === 'esg-workspace')!,
          ROUTES.find((r) => r.name === 'impact')!,
          ROUTES.find((r) => r.name === 'marketplace')!,
          ROUTES.find((r) => r.name === 'farmers-ai')!
        ];

        for (const route of testSubset) {
          await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
          
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

          const { hasHorizontalOverflow, scrollWidth, clientWidth, clippedCards } = await page.evaluate(() => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollW = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
            const clientW = docEl.clientWidth;
            const hasOverflow = scrollW > clientW + 2;

            // Detect clipped cards
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

                  // More than 8px cutoff is an actionable clipping defect
                  if (rightDiff > 8 || bottomDiff > 8 || leftDiff > 8 || topDiff > 8) {
                    const tag = card.tagName.toLowerCase();
                    const cls = typeof card.className === 'string' ? card.className.split(/\s+/).slice(0, 2).join('.') : '';
                    clipped.push({
                      card: `<${tag}.${cls}>`,
                      diff: { rightDiff, bottomDiff, leftDiff, topDiff }
                    });
                    break;
                  }
                }
                parent = parent.parentElement;
              }
            }

            return {
              hasHorizontalOverflow: hasOverflow,
              scrollWidth: scrollW,
              clientWidth: clientW,
              clippedCards: clipped
            };
          });

          expect(
            hasHorizontalOverflow,
            `Route ${route.path} has horizontal overflow at ${vp.name} [${theme}]: scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`
          ).toBe(false);

          expect(
            clippedCards.length,
            `Route ${route.path} has ${clippedCards.length} clipped cards at ${vp.name} [${theme}]: ${JSON.stringify(clippedCards)}`
          ).toBe(0);
        }
      });
    }
  }
});

