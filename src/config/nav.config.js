import {
  Activity,
  Layers,
  Database,
  FileCheck,
  Cpu,
  BarChart3,
  FileText,
  TrendingUp,
  ShoppingCart,
  Sprout,
  Camera,
  MapPin,
  CreditCard,
  ShieldAlert,
  FolderPlus,
  ClipboardList,
  Home,
  BookOpen,
  Code2,
  Users,
  Shield,
  FileCode
} from 'lucide-react';

export const navConfig = {
  groups: [
    {
      id: 'mrv-core',
      title: 'National MRV & Satellite',
      titleKey: 'nav.nationalMrv',
      items: [
        {
          id: 'mrv-dashboard',
          label: 'MRV Telemetry',
          labelKey: 'nav.mrvTelemetry',
          route: '/platform/mrv-dashboard',
          icon: Activity,
          keywords: ['mrv', 'telemetry', 'satellite', 'emissions', 'biomass', 'sensor']
        },
        {
          id: 'carbon-monitoring',
          label: 'GIS Biomass Heatmap',
          labelKey: 'nav.biomassHeatmap',
          route: '/carbon-monitoring',
          icon: Layers,
          badge: 'Live',
          keywords: ['gis', 'map', 'biomass', 'heatmap', 'sundarbans', 'sentinel', 'landsat']
        },
        {
          id: 'carbon-registry',
          label: 'Carbon Ledger',
          labelKey: 'nav.carbonLedger',
          route: '/platform/carbon-registry',
          icon: Database,
          keywords: ['registry', 'ledger', 'blockchain', 'credits', 'issuance', 'retirement']
        },
        {
          id: 'verification-workflow',
          label: 'Audit & Verification',
          labelKey: 'nav.verification',
          route: '/platform/verification-workflow',
          icon: FileCheck,
          keywords: ['audit', 'verification', 'vvb', 'verra', 'gold standard', 'compliance']
        },
        {
          id: 'ai-detection',
          label: 'AI Change Detection',
          labelKey: 'nav.aiDetection',
          route: '/platform/ai-detection',
          icon: Cpu,
          keywords: ['ai', 'detection', 'deforestation', 'canopy', 'computer vision']
        },
        {
          id: 'project-onboarding',
          label: 'Project Onboarding',
          labelKey: 'nav.onboarding',
          route: '/platform/project-onboarding',
          icon: FolderPlus,
          keywords: ['onboarding', 'new project', 'register project', 'baseline']
        }
      ]
    },
    {
      id: 'enterprise-esg',
      title: 'Enterprise & ESG',
      titleKey: 'nav.enterpriseEsg',
      items: [
        {
          id: 'saas-dashboard',
          label: 'SaaS Accounting',
          labelKey: 'nav.saasAccounting',
          route: '/platform/saas-dashboard',
          icon: BarChart3,
          keywords: ['saas', 'accounting', 'scope 1', 'scope 2', 'scope 3', 'ghg']
        },
        {
          id: 'esg-workspace',
          label: 'ESG Bill Intake',
          labelKey: 'nav.esgIntake',
          route: '/platform/esg',
          icon: FileText,
          keywords: ['esg', 'utility', 'bills', 'titas', 'reb', 'desco', 'extraction', 'rag']
        },
        {
          id: 'impact-metrics',
          label: 'SDG Impact',
          labelKey: 'nav.sdgImpact',
          route: '/platform/impact',
          icon: TrendingUp,
          keywords: ['impact', 'sdg', 'payouts', 'farmers', 'community', 'benefits']
        },
        {
          id: 'marketplace',
          label: 'Offtake Marketplace',
          labelKey: 'nav.offtakeMarketplace',
          route: '/platform/marketplace',
          icon: ShoppingCart,
          keywords: ['marketplace', 'buy', 'sell', 'offtake', 'forward contracts', 'trade']
        }
      ]
    },
    {
      id: 'agriculture',
      title: "Farmer's AI & Field",
      titleKey: 'nav.farmersAiTitle',
      items: [
        {
          id: 'farmers-ai-landing',
          label: 'Crop Health AI',
          labelKey: 'nav.cropHealth',
          route: '/farmers-ai',
          icon: Sprout,
          keywords: ['crop', 'farmer', 'disease', 'diagnosis', 'rice', 'paddy']
        },
        {
          id: 'field-camera',
          label: 'Field Camera',
          labelKey: 'nav.fieldCamera',
          route: '/farmers-ai/camera',
          icon: Camera,
          keywords: ['camera', 'photo', 'scanner', 'leaf', 'blight', 'lesion']
        },
        {
          id: 'harvestguard-dashboard',
          label: 'HarvestGuard Coop',
          labelKey: 'nav.harvestguard',
          route: '/harvestguard/dashboard',
          icon: ShieldAlert,
          keywords: ['harvestguard', 'insurance', 'parametric', 'weather', 'risk', 'coop']
        },
        {
          id: 'register-batch',
          label: 'Batch Registration',
          labelKey: 'nav.batchRegistration',
          route: '/harvestguard/register-batch',
          icon: ClipboardList,
          keywords: ['batch', 'enroll', 'farmers', 'hectares', 'nid', 'mfs']
        },
        {
          id: 'risk-map',
          label: 'Risk Map',
          labelKey: 'nav.riskMap',
          route: '/harvestguard/risk-map',
          icon: MapPin,
          keywords: ['risk map', 'flood', 'cyclone', 'drought', 'weather forecast']
        },
        {
          id: 'farmer-earnings',
          label: 'MFS Payouts',
          labelKey: 'nav.mfsPayouts',
          route: '/dashboard/farmer/earnings',
          icon: CreditCard,
          keywords: ['payouts', 'bkash', 'nagad', 'earnings', 'disbursement', 'mfs']
        }
      ]
    }
  ],

  // Marketing and system links searchable via Command Palette
  marketingRoutes: [
    { id: 'home', label: 'Home Landing', route: '/', icon: Home, category: 'Marketing' },
    { id: 'how-it-works', label: 'How It Works', route: '/how-it-works', icon: BookOpen, category: 'Education' },
    { id: 'technology', label: 'Technology Architecture', route: '/technology', icon: Cpu, category: 'Architecture' },
    { id: 'about', label: 'About Carbon Zero BD', route: '/company/about', icon: Users, category: 'Company' },
    { id: 'framework-docs', label: 'Article 6 Framework Docs', route: '/company/framework-docs', icon: FileCode, category: 'Documentation' },
    { id: 'api-docs', label: 'Developer API Reference', route: '/company/api-docs', icon: Code2, category: 'Documentation' },
    { id: 'privacy', label: 'Privacy Policy', route: '/company/privacy', icon: Shield, category: 'Legal' },
    { id: 'terms', label: 'Terms of Service', route: '/company/terms', icon: Shield, category: 'Legal' }
  ]
};

/**
 * Find nav item by current pathname
 */
export function findNavItemByRoute(pathname) {
  for (const group of navConfig.groups) {
    for (const item of group.items) {
      if (item.route === pathname) return { ...item, groupTitle: group.title };
      if (item.children) {
        for (const child of item.children) {
          if (child.route === pathname) return { ...child, parentLabel: item.label, groupTitle: group.title };
        }
      }
    }
  }
  for (const mItem of navConfig.marketingRoutes) {
    if (mItem.route === pathname) return { ...mItem, groupTitle: mItem.category };
  }
  return null;
}

/**
 * Auto-generate breadcrumb hierarchy from route pathname
 */
export function getBreadcrumbs(pathname) {
  if (pathname === '/') return [{ label: 'Home', route: '/' }];
  
  const crumbs = [{ label: 'Dashboard', route: '/platform/saas-dashboard' }];
  const match = findNavItemByRoute(pathname);

  if (match) {
    if (match.groupTitle && match.groupTitle !== 'Dashboard') {
      // Non-routable group headers must not link directly to the child page URL
      crumbs.push({ label: match.groupTitle, route: null });
    }
    if (match.parentLabel) {
      crumbs.push({ label: match.parentLabel, route: null });
    }
    crumbs.push({ label: match.label, route: match.route, isCurrent: true });
  } else {
    // Fallback: humanize path segments, linking only resolved routes
    const segments = pathname.split('/').filter(Boolean);
    let accumulated = '';
    segments.forEach((seg, idx) => {
      accumulated += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const formatted = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const resolved = isLast || findNavItemByRoute(accumulated) ? accumulated : null;
      crumbs.push({ label: formatted, route: resolved, isCurrent: isLast });
    });
  }

  return crumbs;
}

/**
 * Returns a flattened search index of all platform routes for the Command Palette
 */
export function getAllSearchableItems() {
  const items = [];

  navConfig.groups.forEach((group) => {
    group.items.forEach((item) => {
      items.push({
        id: item.id,
        label: item.label,
        labelKey: item.labelKey,
        route: item.route,
        category: group.title,
        icon: item.icon,
        badge: item.badge,
        keywords: item.keywords || []
      });
    });
  });

  navConfig.marketingRoutes.forEach((item) => {
    items.push({
      id: item.id,
      label: item.label,
      route: item.route,
      category: item.category,
      icon: item.icon,
      keywords: [item.id, item.label.toLowerCase()]
    });
  });

  return items;
}

export default navConfig;
