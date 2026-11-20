/**
 * Single-Source Footer Configuration (Phase 5)
 *
 * Design Principles & Constraints:
 * - Includes ONLY links that resolve to real routes defined in src/App.jsx.
 * - Brand block contains the logo and a short, factual mission statement.
 * - 4 structured link columns: Platform, Resources, Company, Legal.
 * - Contact email and social links are intentionally null/empty (never invented;
 *   documented in docs/copy-needed.md for user confirmation).
 * - Newsletter form and live status indicator are disabled because no dedicated
 *   public newsletter/status backend endpoint is configured.
 */

export const footerConfig = {
  brand: {
    namePrimary: 'Carbon',
    nameAccent: 'Zero',
    badge: 'BD',
    homeRoute: '/',
    missionKey: 'footer.mission',
    missionDefault:
      'Digital Measurement, Reporting, and Verification (dMRV), corporate ESG accounting, and agricultural risk intelligence for Bangladesh.',
    wordmark: 'CARBON ZERO BD',
    copyrightEntityKey: 'footer.copyrightEntity',
    copyrightEntityDefault: 'Carbon Zero BD (CarbonOS)',
  },

  cta: {
    badgeKey: 'footer.ctaBadge',
    badgeDefault: 'CLIMATE INFRASTRUCTURE & DMRV',
    titleKey: 'footer.ctaTitle',
    titleDefault: "Ready to Scale Bangladesh's Green Infrastructure?",
    subtextKey: 'footer.ctaSubtext',
    subtextDefault:
      'Explore how Carbon Zero BD helps organizations plan, manage, and verify emission reduction projects across the country.',
    buttonKey: 'footer.ctaButton',
    buttonDefault: 'Explore Platform',
    to: '/platform/saas-dashboard',
  },

  columns: [
    {
      id: 'platform',
      titleKey: 'footer.columns.platform',
      defaultTitle: 'Platform',
      links: [
        {
          id: 'mrv-dashboard',
          labelKey: 'footer.links.mrvDashboard',
          defaultLabel: 'MRV Dashboard',
          to: '/platform/mrv-dashboard',
        },
        {
          id: 'carbon-monitoring',
          labelKey: 'footer.links.carbonMonitoring',
          defaultLabel: 'GIS Biomass Heatmap',
          to: '/carbon-monitoring',
        },
        {
          id: 'carbon-registry',
          labelKey: 'footer.links.carbonRegistry',
          defaultLabel: 'Carbon Registry',
          to: '/platform/carbon-registry',
        },
        {
          id: 'esg-workspace',
          labelKey: 'footer.links.esgWorkspace',
          defaultLabel: 'ESG Bill Intake',
          to: '/platform/esg',
        },
        {
          id: 'saas-dashboard',
          labelKey: 'footer.links.saasDashboard',
          defaultLabel: 'SaaS Accounting',
          to: '/platform/saas-dashboard',
        },
        {
          id: 'marketplace',
          labelKey: 'footer.links.marketplace',
          defaultLabel: 'Credit Marketplace',
          to: '/platform/marketplace',
        },
      ],
    },
    {
      id: 'resources',
      titleKey: 'footer.columns.resources',
      defaultTitle: 'Resources',
      links: [
        {
          id: 'how-it-works',
          labelKey: 'footer.links.howItWorks',
          defaultLabel: 'How It Works',
          to: '/how-it-works',
        },
        {
          id: 'technology',
          labelKey: 'footer.links.technology',
          defaultLabel: 'Technology & Telemetry',
          to: '/technology',
        },
        {
          id: 'framework-docs',
          labelKey: 'footer.links.frameworkDocs',
          defaultLabel: 'Framework & Methodology',
          to: '/company/framework-docs',
        },
        {
          id: 'api-docs',
          labelKey: 'footer.links.apiDocs',
          defaultLabel: 'Developer API Docs',
          to: '/company/api-docs',
        },
        {
          id: 'farmers-ai',
          labelKey: 'footer.links.farmersAi',
          defaultLabel: 'Farmers AI & HarvestGuard',
          to: '/farmers-ai',
        },
        {
          id: 'sector-rice-methane',
          labelKey: 'footer.links.sectorMethodologies',
          defaultLabel: 'Sector Methodologies',
          to: '/sectors/rice-methane',
        },
      ],
    },
    {
      id: 'company',
      titleKey: 'footer.columns.company',
      defaultTitle: 'Company',
      links: [
        {
          id: 'about',
          labelKey: 'footer.links.about',
          defaultLabel: 'About Carbon Zero BD',
          to: '/company/about',
        },
        {
          id: 'impact',
          labelKey: 'footer.links.impact',
          defaultLabel: 'SDG Impact & Co-Benefits',
          to: '/platform/impact',
        },
        {
          id: 'project-onboarding',
          labelKey: 'footer.links.projectOnboarding',
          defaultLabel: 'Project Onboarding',
          to: '/platform/project-onboarding',
        },
        {
          id: 'careers',
          labelKey: 'footer.links.careers',
          defaultLabel: 'Careers',
          to: '/company/careers',
        },
      ],
    },
    {
      id: 'legal',
      titleKey: 'footer.columns.legal',
      defaultTitle: 'Legal',
      links: [
        {
          id: 'privacy',
          labelKey: 'footer.links.privacy',
          defaultLabel: 'Privacy Policy',
          to: '/company/privacy',
        },
        {
          id: 'terms',
          labelKey: 'footer.links.terms',
          defaultLabel: 'Terms of Service',
          to: '/company/terms',
        },
        {
          id: 'verification-workflow',
          labelKey: 'footer.links.verificationWorkflow',
          defaultLabel: 'Verification & Audit Rules',
          to: '/platform/verification-workflow',
        },
      ],
    },
  ],

  /**
   * Contact & Socials:
   * Never invent contact emails or social media URLs.
   * Populate only when confirmed by the repository owner (see docs/copy-needed.md).
   */
  contact: {
    email: null,
    socialLinks: [],
  },

  /**
   * Feature Flags:
   * Omit newsletter forms or live status badges unless backed by a real endpoint.
   */
  features: {
    hasNewsletterEndpoint: false,
    hasLiveStatusEndpoint: false,
  },
};

/**
 * Helper: Returns all unique internal route paths referenced by the footer configuration.
 */
export function getAllFooterRoutes() {
  const routes = new Set();
  if (footerConfig.brand?.homeRoute) {
    routes.add(footerConfig.brand.homeRoute);
  }
  if (footerConfig.cta?.to) {
    routes.add(footerConfig.cta.to);
  }
  for (const col of footerConfig.columns) {
    for (const link of col.links) {
      if (link.to) {
        routes.add(link.to);
      }
    }
  }
  return Array.from(routes);
}

export default footerConfig;

