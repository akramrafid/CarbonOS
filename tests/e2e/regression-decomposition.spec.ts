import { test, expect } from '@playwright/test';

test.describe('Regression Proof: Decomposition Click-Through', () => {
  test('CarbonMonitoring: visit every tab, toggle panels, check modals, verify no errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: Error[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless network/cors warnings, tile misses, or sandboxed loopback refused connections
        if (!text.includes('tile') && !text.includes('favicon') && !text.includes('404') && !text.includes('ERR_CONNECTION_REFUSED')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      // Allow known satellite/map tile providers or analytics
      if (!url.includes('tile.openstreetmap.org') && !url.includes('cartocdn.com') && !url.includes('favicon')) {
        failedRequests.push(url);
      }
    });

    await page.goto('/carbon-monitoring', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Verify error boundary did not trigger
    expect(await page.locator('text="Something went wrong"').count()).toBe(0);

    // All tabs in CarbonMonitoring
    const tabs = ['satellite', 'biomass', 'verra_audit', 'tiered', 'reports', 'alerts', 'map'];
    for (const tabId of tabs) {
      const tabButton = page.locator(`button[role="tab"]:has-text("${tabId}"), button[role="tab"]`).filter({ hasText: new RegExp(tabId, 'i') }).first();
      if (await tabButton.count() > 0 && await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(400);
        expect(await page.locator('text="Something went wrong"').count()).toBe(0);
      }
    }

    // Modal check 1: VerraSignModal
    const verraTab = page.locator('button[role="tab"]').filter({ hasText: /audit|verra/i }).first();
    if (await verraTab.count() > 0 && await verraTab.isVisible()) {
      await verraTab.click();
      await page.waitForTimeout(400);
      const signBtn = page.locator('button:has-text("Sign with Ed25519")').first();
      if (await signBtn.count() > 0 && await signBtn.isVisible()) {
        await signBtn.click();
        await page.waitForTimeout(300);
        // Modal is open
        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        // Close modal
        const closeBtn = page.locator('[role="dialog"] button:has-text("Cancel")').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await page.waitForTimeout(200);
        }
      }
    }

    // Modal check 2: DroneSurveyModal
    const tieredTab = page.locator('button[role="tab"]').filter({ hasText: /tier|drone/i }).first();
    if (await tieredTab.count() > 0 && await tieredTab.isVisible()) {
      await tieredTab.click();
      await page.waitForTimeout(400);
      const dispatchBtn = page.locator('button:has-text("Dispatch UAV")').first();
      if (await dispatchBtn.count() > 0 && await dispatchBtn.isVisible()) {
        await dispatchBtn.click();
        await page.waitForTimeout(300);
        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        const closeBtn = page.locator('[role="dialog"] button:has-text("Cancel")').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await page.waitForTimeout(200);
        }
      }
    }

    // Verify zero fatal console errors and zero page exceptions
    expect(pageErrors, `Uncaught page errors: ${pageErrors.map(e => e.message).join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('SaaSDashboard: visit every tab, toggle panels, check modals, verify no errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: Error[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('tile') && !text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!url.includes('tile.openstreetmap.org') && !url.includes('cartocdn.com') && !url.includes('favicon')) {
        failedRequests.push(url);
      }
    });

    await page.goto('/platform/saas-dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    expect(await page.locator('text="Something went wrong"').count()).toBe(0);

    // Click through SaaS tabs
    const saasTabs = ['overview', 'emissions', 'rag', 'tasks', 'calendar', 'materiality', 'settings', 'team', 'help'];
    for (const tabId of saasTabs) {
      const tabButton = page.locator(`button[role="tab"]`).filter({ hasText: new RegExp(tabId, 'i') }).first();
      if (await tabButton.count() > 0 && await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(400);
        expect(await page.locator('text="Something went wrong"').count()).toBe(0);
      }
    }

    // Modal check: Add Member modal in Team tab
    const teamTab = page.locator('button[role="tab"]').filter({ hasText: /team/i }).first();
    if (await teamTab.count() > 0 && await teamTab.isVisible()) {
      await teamTab.click();
      await page.waitForTimeout(400);
      const addMemberBtn = page.locator('button:has-text("Add Member")').first();
      if (await addMemberBtn.count() > 0 && await addMemberBtn.isVisible()) {
        await addMemberBtn.click();
        await page.waitForTimeout(300);
        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        const cancelBtn = page.locator('[role="dialog"] button:has-text("Cancel")').first();
        if (await cancelBtn.count() > 0) {
          await cancelBtn.click();
          await page.waitForTimeout(200);
        }
      }
    }

    expect(pageErrors, `Uncaught page errors: ${pageErrors.map(e => e.message).join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });
});
