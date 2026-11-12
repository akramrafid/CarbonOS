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
  { name: 'forbidden', path: '/forbidden' },
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
  { name: 'harvestguard-register-batch', path: '/harvestguard/register-batch' },
  { name: 'farmer-earnings', path: '/dashboard/farmer/earnings' },
  { name: 'not-found', path: '/unresolved-test-node-404' }
];

test.describe('Design Principles Enforcement: Exactly 1 H1 & <= 1 Primary Button per route', () => {
  for (const route of ROUTES) {
    test(`Route ${route.name} (${route.path}) enforces single H1 and max 1 primary CTA`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      try {
        await page.locator('h1').first().waitFor({ state: 'visible', timeout: 8000 });
      } catch {
        // Fall through to record explicit assertion failure
      }
      await page.waitForTimeout(400);

      // Check for error boundary or fatal exceptions
      const errorBoundary = await page.locator('text="Something went wrong"').count();
      expect(errorBoundary, `Error boundary triggered on ${route.path}`).toBe(0);

      // 1. Verify exactly one visible <h1>
      const h1Locators = await page.locator('h1').all();
      let visibleH1Count = 0;
      for (const h1 of h1Locators) {
        if (await h1.isVisible()) {
          visibleH1Count++;
        }
      }
      expect(visibleH1Count, `Route ${route.path} must have exactly one visible <h1>`).toBe(1);

      // 2. Verify at most one visible primary button
      // Button primitive uses data-variant="primary" or standard primary styling
      const primaryButtons = await page.locator('button[data-variant="primary"]').all();
      let visiblePrimaryCount = 0;
      for (const btn of primaryButtons) {
        if (await btn.isVisible()) {
          visiblePrimaryCount++;
        }
      }
      expect(
        visiblePrimaryCount,
        `Route ${route.path} must have at most 1 visible primary button, found ${visiblePrimaryCount}`
      ).toBeLessThanOrEqual(1);
    });
  }
});
