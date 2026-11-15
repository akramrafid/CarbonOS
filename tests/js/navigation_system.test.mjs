import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { 
  navConfig, 
  findNavItemByRoute, 
  getBreadcrumbs, 
  getAllSearchableItems 
} from '../../src/config/nav.config.js';

test('Phase 4 Nav Config: structure, routes, icons, and keyword index', () => {
  assert.ok(Array.isArray(navConfig.groups), 'navConfig must define groups array');
  assert.ok(navConfig.groups.length >= 3, 'navConfig must contain at least 3 major groups');

  let totalItems = 0;
  navConfig.groups.forEach((group) => {
    assert.ok(group.id, `Group must have an id: ${JSON.stringify(group)}`);
    assert.ok(group.title, `Group must have a title: ${group.id}`);
    assert.ok(Array.isArray(group.items), `Group ${group.id} must have items array`);

    group.items.forEach((item) => {
      totalItems++;
      assert.ok(item.id, `Item must have id in ${group.id}`);
      assert.ok(item.label, `Item ${item.id} must have label`);
      assert.ok(item.labelKey, `Item ${item.id} must have i18n labelKey`);
      assert.ok(item.route.startsWith('/'), `Item ${item.id} route must start with slash`);
      assert.ok(item.icon, `Item ${item.id} must define an icon`);
      assert.ok(Array.isArray(item.keywords), `Item ${item.id} must define search keywords`);
    });
  });

  assert.ok(totalItems >= 14, `Expected at least 14 dashboard items, found ${totalItems}`);
});

test('Phase 4 Nav Helpers: findNavItemByRoute and getBreadcrumbs hierarchy', () => {
  const saasItem = findNavItemByRoute('/platform/saas-dashboard');
  assert.ok(saasItem, 'Must find SaaS dashboard item');
  assert.equal(saasItem.id, 'saas-dashboard');
  assert.equal(saasItem.groupTitle, 'Enterprise & ESG');

  const mrvItem = findNavItemByRoute('/platform/mrv-dashboard');
  assert.ok(mrvItem, 'Must find MRV dashboard item');
  assert.equal(mrvItem.id, 'mrv-dashboard');
  assert.equal(mrvItem.groupTitle, 'National MRV & Satellite');

  // Breadcrumbs calculation
  const crumbs = getBreadcrumbs('/platform/saas-dashboard');
  assert.ok(Array.isArray(crumbs), 'getBreadcrumbs must return array');
  assert.ok(crumbs.length >= 2, 'Breadcrumbs must contain root and active page');
  assert.equal(crumbs[0].label, 'Dashboard');
  assert.equal(crumbs[crumbs.length - 1].isCurrent, true);
  assert.equal(crumbs[crumbs.length - 1].label, 'SaaS Accounting');
});

test('Phase 4 Nav Helpers: getAllSearchableItems index coverage', () => {
  const searchable = getAllSearchableItems();
  assert.ok(searchable.length >= 20, 'Search index must cover dashboard and marketing routes');

  const home = searchable.find((i) => i.route === '/');
  assert.ok(home, 'Search index must include Home landing');

  const mrv = searchable.find((i) => i.route === '/platform/mrv-dashboard');
  assert.ok(mrv, 'Search index must include MRV Telemetry');
  assert.ok(mrv.keywords.includes('satellite'), 'Keywords must include satellite');
});

test('Phase 4 Component Architecture: DashboardLayout integrates all sub-systems', () => {
  const layoutPath = path.resolve('src/components/layout/DashboardLayout.jsx');
  const content = fs.readFileSync(layoutPath, 'utf8');

  assert.ok(content.includes('DashboardSidebar'), 'DashboardLayout must render DashboardSidebar');
  assert.ok(content.includes('TopBar'), 'DashboardLayout must render TopBar');
  assert.ok(content.includes('MobileDrawer'), 'DashboardLayout must render MobileDrawer');
  assert.ok(content.includes('MobileTabBar'), 'DashboardLayout must render MobileTabBar');
  assert.ok(content.includes('CommandPalette'), 'DashboardLayout must render CommandPalette');
  assert.ok(content.includes('Skip to main content'), 'DashboardLayout must include Skip to content link');
  assert.ok(content.includes("e.key.toLowerCase() === 'b'"), 'DashboardLayout must bind Ctrl/Cmd+B shortcut');
  assert.ok(content.includes("e.key.toLowerCase() === 'k'"), 'DashboardLayout must bind Ctrl/Cmd+K shortcut');
});

test('Phase 4 Component Architecture: DashboardSidebar implements rail, tooltips, and masks', () => {
  const sidebarPath = path.resolve('src/components/layout/DashboardSidebar.jsx');
  const content = fs.readFileSync(sidebarPath, 'utf8');

  assert.ok(content.includes('Tooltip'), 'DashboardSidebar must use Tooltip in rail mode');
  assert.ok(content.includes('scrollIntoView'), 'DashboardSidebar must support auto-scrolling active item into view');
  assert.ok(content.includes('mask-image'), 'DashboardSidebar must include top/bottom gradient fade mask');
  assert.ok(content.includes('aria-label="Dashboard navigation"'), 'DashboardSidebar must declare accessible nav landmark');
  assert.ok(content.includes('aria-current'), 'DashboardSidebar must set aria-current on active link');
});

test('Phase 4 Component Architecture: CommandPalette implements portaled accessible modal', () => {
  const palettePath = path.resolve('src/components/layout/CommandPalette.jsx');
  const content = fs.readFileSync(palettePath, 'utf8');

  assert.ok(content.includes('createPortal'), 'CommandPalette must render into createPortal');
  assert.ok(content.includes('role="dialog"'), 'CommandPalette must declare role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'CommandPalette must declare aria-modal="true"');
  assert.ok(content.includes('ArrowDown'), 'CommandPalette must handle ArrowDown key');
  assert.ok(content.includes('ArrowUp'), 'CommandPalette must handle ArrowUp key');
  assert.ok(content.includes('Escape'), 'CommandPalette must handle Escape key');
});

test('Phase 4 Component Architecture: MobileTabBar implements touch targets and safe areas', () => {
  const tabBarPath = path.resolve('src/components/layout/MobileTabBar.jsx');
  const content = fs.readFileSync(tabBarPath, 'utf8');

  assert.ok(content.includes('safe-area-inset-bottom'), 'MobileTabBar must respect safe-area-inset-bottom');
  assert.ok(content.includes('min-h-[48px]'), 'MobileTabBar must provide min 44px (48px) touch targets');
  assert.ok(content.includes('aria-label="Mobile Bottom Navigation"'), 'MobileTabBar must declare accessible nav landmark');
});

