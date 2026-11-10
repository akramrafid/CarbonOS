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
  ShieldAlert
} from 'lucide-react';

export const navConfig = {
  groups: [
    {
      id: 'mrv-core',
      title: 'National MRV & Satellite',
      items: [
        {
          id: 'mrv-dashboard',
          label: 'MRV Telemetry',
          route: '/platform/mrv-dashboard',
          icon: Activity
        },
        {
          id: 'carbon-monitoring',
          label: 'GIS Biomass Heatmap',
          route: '/carbon-monitoring',
          icon: Layers,
          badge: 'Live'
        },
        {
          id: 'carbon-registry',
          label: 'Carbon Ledger',
          route: '/platform/carbon-registry',
          icon: Database
        },
        {
          id: 'verification-workflow',
          label: 'Audit & Verification',
          route: '/platform/verification-workflow',
          icon: FileCheck
        },
        {
          id: 'ai-detection',
          label: 'AI Change Detection',
          route: '/platform/ai-detection',
          icon: Cpu
        }
      ]
    },
    {
      id: 'enterprise-esg',
      title: 'Enterprise & ESG',
      items: [
        {
          id: 'saas-dashboard',
          label: 'SaaS Accounting',
          route: '/platform/saas-dashboard',
          icon: BarChart3
        },
        {
          id: 'esg-workspace',
          label: 'ESG Bill Intake',
          route: '/platform/esg',
          icon: FileText
        },
        {
          id: 'impact-metrics',
          label: 'SDG Impact',
          route: '/platform/impact',
          icon: TrendingUp
        },
        {
          id: 'marketplace',
          label: 'Offtake Marketplace',
          route: '/platform/marketplace',
          icon: ShoppingCart
        }
      ]
    },
    {
      id: 'agriculture',
      title: "Farmer's AI & Field",
      items: [
        {
          id: 'farmers-ai-landing',
          label: 'Crop Health AI',
          route: '/farmers-ai',
          icon: Sprout
        },
        {
          id: 'field-camera',
          label: 'Field Camera',
          route: '/farmers-ai/camera',
          icon: Camera
        },
        {
          id: 'harvestguard-dashboard',
          label: 'HarvestGuard Coop',
          route: '/harvestguard/dashboard',
          icon: ShieldAlert
        },
        {
          id: 'risk-map',
          label: 'Risk Map',
          route: '/harvestguard/risk-map',
          icon: MapPin
        },
        {
          id: 'farmer-earnings',
          label: 'MFS Payouts',
          route: '/dashboard/farmer/earnings',
          icon: CreditCard
        }
      ]
    }
  ]
};

export default navConfig;
