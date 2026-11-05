import { legacyColors } from '../../styles/legacyColors.js';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Bell, 
  FileText, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Compass, 
  Trash2, 
  Loader2,
  Calendar as CalendarIcon,
  Users,
  Grid,
  TrendingDown,
  Building,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  MapPin,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Sparkles,
  Database,
  ShieldCheck,
  Quote,
  RefreshCw,
  Send,
  BookOpen,
  Sun,
  Moon,
  MoreHorizontal,
  Leaf,
  Smile,
  Zap,
  Globe,
  Cpu,
  Layers,
  GitBranch,
  Utensils,
  Car,
  Shirt,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Package,
  Sliders,
  Edit3,
  Lightbulb,
  PieChart
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SaaSLocales } from './SaaSLocalization';
import { DuckDBEngineView } from './components/DuckDBEngineView';
import { SatelliteMRVStudio } from './components/SatelliteMRVStudio';
import { FactorRegistryStudio } from './components/FactorRegistryStudio';
import { AtlasBenchmarkStudio } from './components/AtlasBenchmarkStudio';
import { ConglomerateTreeStudio } from './components/ConglomerateTreeStudio';
import { CLIENT_PROFILES } from './clientProfiles';
import { UniversalUtilityExtractor } from './components/UniversalUtilityExtractor';
import { ActivityEvidenceWorkspace } from './components/ActivityEvidenceWorkspace';
import { EsgReportGenerator } from './components/EsgReportGenerator';
import { VerificationReadinessCenter } from './components/VerificationReadinessCenter';
import { extractESGFromDocument, parseDocumentTextToEsgParams } from '../../lib/esgDocumentExtractor';
import { esgFetch } from '../../lib/esgApi';

// -------------------------------------------------------------
// HIGH-CRAFT EXECUTIVE DASHBOARD COMPONENTS (EMITRA / $30K SPEC)
// -------------------------------------------------------------

// 1. Semi-Circular SVG Radial Gauge Arch
const SemiCircularGauge = ({
  score = 9.3,
  max = 10,
  label = 'Rating',
  sublabel = 'AI score',
  showIcon = false,
  percentage = null,
  isLight = false,
  badgeText = null
}) => {
  const radius = 64;
  const strokeWidth = 11;
  const circumference = Math.PI * radius; // ~201.06
  const normalizedValue = percentage !== null ? percentage / 100 : score / max;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(normalizedValue, 0), 1));
  const gradientId = `gauge-grad-${(label || 'metric').replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 160 92" className="w-36 sm:w-40 h-auto overflow-visible" role="img" aria-label={`${label} gauge: ${score || percentage}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={legacyColors["legacy-brand-bright"]} />
            <stop offset="50%" stopColor={legacyColors["legacy-brand-base"]} />
            <stop offset="100%" stopColor={legacyColors["legacy-emerald-500"]} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={isLight ? legacyColors["legacy-divider-light"] : legacyColors["legacy-divider-base"]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active progress arc */}
        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Central content */}
      <div className="absolute top-8 sm:top-9 flex flex-col items-center justify-center text-center select-none">
        {showIcon ? (
          <div className="w-8 h-8 rounded-full bg-legacy-brand-base/15 border border-legacy-brand-base/30 flex items-center justify-center text-legacy-brand-base">
            <Leaf className="w-4 h-4 text-legacy-brand-base" />
          </div>
        ) : (
          <>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
              {label}
            </span>
            <span className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight leading-none my-0.5 ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
              {score}
            </span>
            <span className={`text-[9px] font-sans font-medium ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
              {sublabel}
            </span>
          </>
        )}
      </div>

      {badgeText && (
        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-sans font-semibold border ${
          isLight ? 'bg-legacy-mint-08 text-legacy-forest-43 border-legacy-divider-light' : 'bg-legacy-canvas-deep text-legacy-emerald-200 border-legacy-forest-11'
        }`}>
          {badgeText}
        </div>
      )}
    </div>
  );
};

// 2. Catmull-Rom Bezier Spline Helper for Smooth Curves
function getSplinePath(points) {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// 3. Wide Emissions Trend Chart (Smooth Spline Area Chart)
const EmissionsTrendChart = ({ isLight = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 12 months mapped for 620 x 170 viewBox
  const actualPoints = [
    { x: 45, y: 55, val: 327, month: 'Jan' },
    { x: 94, y: 105, val: 145, month: 'Feb' },
    { x: 143, y: 98, val: 170, month: 'Mar' },
    { x: 192, y: 78, val: 243, month: 'Apr' },
    { x: 241, y: 68, val: 279, month: 'May' },
    { x: 290, y: 40, val: 382, month: 'Jun' },
    { x: 339, y: 62, val: 301, month: 'Jul' },
    { x: 388, y: 80, val: 236, month: 'Aug' },
    { x: 437, y: 66, val: 287, month: 'Sep' },
    { x: 486, y: 84, val: 221, month: 'Oct' },
    { x: 535, y: 56, val: 323, month: 'Nov' },
    { x: 585, y: 50, val: 345, month: 'Dec' },
  ];

  const targetPoints = [
    { x: 45, y: 38 },
    { x: 94, y: 44 },
    { x: 143, y: 52 },
    { x: 192, y: 60 },
    { x: 241, y: 70 },
    { x: 290, y: 76 },
    { x: 339, y: 82 },
    { x: 388, y: 88 },
    { x: 437, y: 92 },
    { x: 486, y: 96 },
    { x: 535, y: 100 },
    { x: 585, y: 104 },
  ];

  const actualCurve = getSplinePath(actualPoints);
  const targetCurve = getSplinePath(targetPoints);
  const areaPath = `${actualCurve} L 585 140 L 45 140 Z`;

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {hoveredPoint && (
        <div 
          className={`absolute -top-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md border pointer-events-none transform -translate-x-1/2 transition-transform duration-150 ${
            isLight 
              ? 'bg-white text-legacy-forest-43 border-legacy-divider-light'
              : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
          }`}
          style={{ left: `${(hoveredPoint.x / 620) * 100}%` }}
        >
          {hoveredPoint.month}: {hoveredPoint.val} tCO₂e
        </div>
      )}

      <svg viewBox="0 0 620 170" className="w-full h-auto overflow-visible select-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="emissionsSplineArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={legacyColors["legacy-brand-base"]} stopOpacity={isLight ? 0.35 : 0.45} />
            <stop offset="50%" stopColor={legacyColors["legacy-brand-bright"]} stopOpacity={isLight ? 0.15 : 0.20} />
            <stop offset="100%" stopColor={legacyColors["legacy-brand-base"]} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Y Gridlines and Ticks */}
        {[
          { label: '400', y: 35 },
          { label: '300', y: 70 },
          { label: '200', y: 105 },
          { label: '100', y: 140 }
        ].map((grid, idx) => (
          <g key={idx}>
            <text 
              x="8" 
              y={grid.y + 3} 
              fill={isLight ? legacyColors["legacy-mint-41"] : legacyColors["legacy-text-quiet"]}
              fontSize="8" 
              fontFamily="monospace"
            >
              {grid.label}
            </text>
            <line 
              x1="35" 
              y1={grid.y} 
              x2="600" 
              y2={grid.y} 
              stroke={isLight ? legacyColors["legacy-mint-19"] : legacyColors["legacy-forest-38"]}
              strokeDasharray="3 3" 
              strokeWidth="1" 
            />
          </g>
        ))}

        {/* Target baseline curve */}
        <path
          d={targetCurve}
          fill="none"
          stroke={isLight ? legacyColors["legacy-text-muted"] : legacyColors["legacy-forest-07"]}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.7"
        />

        {/* Actual emissions area gradient fill */}
        <path
          d={areaPath}
          fill="url(#emissionsSplineArea)"
        />

        {/* Actual emissions spline curve */}
        <path
          d={actualCurve}
          fill="none"
          stroke={legacyColors["legacy-brand-base"]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Month labels and hover interactive dots */}
        {actualPoints.map((pt, i) => (
          <g key={i}>
            <text
              x={pt.x}
              y="160"
              textAnchor="middle"
              fill={isLight ? legacyColors["legacy-text-quiet"] : legacyColors["legacy-text-muted"]}
              fontSize="8.5"
              fontFamily="sans-serif"
              fontWeight={hoveredPoint?.month === pt.month ? 'bold' : 'normal'}
            >
              {pt.month}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.month === pt.month ? 5 : 3}
              fill={hoveredPoint?.month === pt.month ? legacyColors["legacy-brand-bright"] : legacyColors["legacy-brand-base"]}
              stroke={isLight ? legacyColors["legacy-warm-01"] : legacyColors["legacy-canvas-deep"]}
              strokeWidth="1.5"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

// 4. Segmented LED Capsule Progress Bar (24 rounded vertical capsules)
const SegmentedProgressBar = ({ totalBars = 24, activeBars = 19, isLight = false }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-1.5 w-full py-1">
      {Array.from({ length: totalBars }).map((_, index) => {
        const isActive = index < activeBars;
        return (
          <div
            key={index}
            className={`flex-1 h-6 sm:h-7 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-legacy-brand-base shadow-[0_0_6px_rgba(0,200,83,0.3)]'
                : isLight
                  ? 'bg-legacy-mint-19'
                  : 'bg-legacy-divider-base'
            }`}
            title={`Segment ${index + 1} of ${totalBars} (${isActive ? 'Verified' : 'Pending'})`}
          />
        );
      })}
    </div>
  );
};

// 5. Micro Bar Chart (Telemetry Volume)
const MicroBarChart = ({ isLight = false }) => {
  const bars = [
    { label: 'Apr', height: '45%', active: false },
    { label: 'May', height: '58%', active: false },
    { label: 'Jun', height: '50%', active: false },
    { label: 'Jul', height: '88%', active: true },
  ];

  return (
    <div className="flex items-end justify-end space-x-2.5 h-16 sm:h-18">
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center space-y-1.5 h-full justify-end">
          <div
            className={`w-3.5 sm:w-4 rounded-t-md transition-all duration-500 ${
              bar.active
                ? 'bg-legacy-brand-base shadow-[0_0_8px_rgba(0,200,83,0.35)]'
                : isLight
                  ? 'bg-legacy-mint-20'
                  : 'bg-legacy-forest-32'
            }`}
            style={{ height: bar.height }}
          />
          <span className={`text-[8.5px] font-mono ${isLight ? 'text-legacy-text-muted' : 'text-legacy-text-quiet'}`}>
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// 6. Carousel Slider Indicator
const CarouselIndicator = ({ isLight = false }) => {
  return (
    <div className="flex items-center space-x-1.5 pt-1">
      <div className="w-8 h-1 rounded-full bg-legacy-brand-base" />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-legacy-mint-20' : 'bg-legacy-forest-32'}`} />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-legacy-mint-20' : 'bg-legacy-forest-32'}`} />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-legacy-mint-20' : 'bg-legacy-forest-32'}`} />
    </div>
  );
};

// Bangladesh Districts List
const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", 
  "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", 
  "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", 
  "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", 
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", 
  "Madaripur", "Magura", "Manikganj", "Maulvibazar", "Meherpur", "Munshiganj", 
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", 
  "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", 
  "Thakurgaon"
];

// -------------------------------------------------------------
// 9 STANDARD INVOICE FOOTPRINT CATEGORIES & CALCULATOR
// -------------------------------------------------------------
const NINE_CATEGORIES_CONFIG = [
  { id: 'food_groceries', name: 'Food & Groceries', icon: Utensils, color: legacyColors["legacy-amber-500"], defaultScope: 'Scope 3', defaultUnit: 'Staff Meals', defaultFactor: 2.40 },
  { id: 'transport', name: 'Transport', icon: Car, color: legacyColors["legacy-teal-01"], defaultScope: 'Scope 1 & 3', defaultUnit: 'Liters / T-Km', defaultFactor: 2.31 },
  { id: 'electricity_energy', name: 'Electricity & Energy', icon: Zap, color: legacyColors["legacy-brand-base"], defaultScope: 'Scope 2 & 1', defaultUnit: 'kWh & Gen-Liters', defaultFactor: 0.55 },
  { id: 'clothing_footwear', name: 'Clothing & Footwear', icon: Shirt, color: legacyColors["legacy-pink-500"], defaultScope: 'Scope 3', defaultUnit: 'PPE Garments', defaultFactor: 8.50 },
  { id: 'shopping_products', name: 'Shopping & Products', icon: ShoppingBag, color: legacyColors["legacy-purple-500"], defaultScope: 'Scope 3', defaultUnit: 'Metric Tons Inputs', defaultFactor: 2500.0 },
  { id: 'housing_rent', name: 'Housing & Rent', icon: Home, color: legacyColors["legacy-blue-500"], defaultScope: 'Scope 1 & 2', defaultUnit: 'Facility m²', defaultFactor: 0.35 },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: legacyColors["legacy-orange-500"], defaultScope: 'Scope 3', defaultUnit: 'Hospitality Events', defaultFactor: 0.11 },
  { id: 'health_care', name: 'Health & Personal Care', icon: HeartPulse, color: legacyColors["legacy-emerald-500"], defaultScope: 'Scope 3', defaultUnit: 'Medical Supplies', defaultFactor: 3.80 },
  { id: 'others', name: 'Others', icon: Package, color: legacyColors["legacy-slate-400"], defaultScope: 'Scope 3', defaultUnit: 'Ancillary Services', defaultFactor: 0.22 },
];

const computeCategoryMatrix = (rawParams = {}, customAddedItems = [], adjustments = {}) => {
  const diesel = parseFloat(rawParams.diesel) || 0;
  const petrol = parseFloat(rawParams.petrol) || 0;
  const lpg = parseFloat(rawParams.lpg) || 0;
  const electricity = parseFloat(rawParams.electricity) || 0;
  const employees = parseFloat(rawParams.employees) || 0;
  const airTravel = parseFloat(rawParams.airTravel) || 0;
  const truckTransport = parseFloat(rawParams.truckTransport) || 0;
  const rawMaterials = parseFloat(rawParams.rawMaterials) || 0;

  // 1. Food & Groceries
  const canteenKg = (employees > 0 ? employees * 22 * 2.4 : 850);
  const lpgKitchenKg = (lpg > 0 ? lpg * 0.60 * 2.98 : 340);
  let foodKg = canteenKg + lpgKitchenKg;
  let foodSpend = (employees > 0 ? employees * 22 * 180 + (lpg * 0.60 * 120) : 68000);

  // 2. Transport
  const petrolKg = petrol * 2.31;
  const dieselFleetKg = (diesel * 0.30) * 2.68;
  const truckKg = truckTransport * 0.20;
  const flightKg = airTravel * 0.12;
  let transKg = petrolKg + dieselFleetKg + truckKg + flightKg;
  let transSpend = (petrol * 125) + (diesel * 0.30 * 105) + (truckTransport * 18) + (airTravel * 14);
  if (transSpend <= 0) transSpend = 185000;

  // 3. Electricity & Energy
  const gridKg = electricity * 0.550;
  const dieselGenKg = (diesel * 0.70) * 2.68;
  let elecKg = gridKg + dieselGenKg;
  let elecSpend = (electricity * 10.50) + (diesel * 0.70 * 105);
  if (elecSpend <= 0) elecSpend = 450000;

  // 4. Clothing & Footwear
  let clothKg = (employees > 0 ? employees * 4 * 8.5 : 180);
  let clothSpend = (employees > 0 ? employees * 4 * 1200 : 42000);

  // 5. Shopping & Products
  let shopKg = (rawMaterials > 0 ? rawMaterials * 2500 : 14500);
  let shopSpend = (rawMaterials > 0 ? rawMaterials * 140000 : 820000);

  // 6. Housing & Rent
  const lpgFacKg = (lpg > 0 ? lpg * 0.40 * 2.98 : 220);
  const facGridKg = (electricity > 0 ? electricity * 0.08 * 0.55 : 450);
  let houseKg = lpgFacKg + facGridKg + 850;
  let houseSpend = (lpg * 0.40 * 120) + 185000;

  // 7. Entertainment
  let entKg = (airTravel * 0.03) + 240;
  let entSpend = (airTravel * 3.5) + 55000;

  // 8. Health & Personal Care
  let healthKg = (employees > 0 ? employees * 3.8 : 190);
  let healthSpend = (employees > 0 ? employees * 650 : 32000);

  // 9. Others
  let othersKg = (employees > 0 ? employees * 2.5 : 680);
  let othersSpend = (employees > 0 ? employees * 280 : 125000);

  const baseValues = {
    food_groceries: { spend: foodSpend, kg: foodKg, qty: employees * 22 || 350 },
    transport: { spend: transSpend, kg: transKg, qty: petrol + (diesel * 0.3) + truckTransport },
    electricity_energy: { spend: elecSpend, kg: elecKg, qty: electricity + (diesel * 0.7) },
    clothing_footwear: { spend: clothSpend, kg: clothKg, qty: employees * 4 || 24 },
    shopping_products: { spend: shopSpend, kg: shopKg, qty: rawMaterials || 12 },
    housing_rent: { spend: houseSpend, kg: houseKg, qty: 1 },
    entertainment: { spend: entSpend, kg: entKg, qty: 1 },
    health_care: { spend: healthSpend, kg: healthKg, qty: employees * 15 || 15 },
    others: { spend: othersSpend, kg: othersKg, qty: 1 }
  };

  // If an explicit invoiced spend was extracted from the document/invoice, scale category spend proportionally
  if (parseFloat(rawParams.spendBdt) > 0) {
    const targetSpend = parseFloat(rawParams.spendBdt);
    const unscaledTotalSpend = Object.values(baseValues).reduce((acc, v) => acc + v.spend, 0);
    if (unscaledTotalSpend > 0) {
      const ratio = targetSpend / unscaledTotalSpend;
      Object.keys(baseValues).forEach(k => {
        baseValues[k].spend = Math.round(baseValues[k].spend * ratio);
      });
    }
  }

  // Apply user custom category adjustments if any
  Object.keys(adjustments).forEach(catId => {
    if (baseValues[catId]) {
      if (adjustments[catId].spend !== undefined) baseValues[catId].spend = adjustments[catId].spend;
      if (adjustments[catId].kg !== undefined) baseValues[catId].kg = adjustments[catId].kg;
      if (adjustments[catId].qty !== undefined) baseValues[catId].qty = adjustments[catId].qty;
    }
  });

  // Add custom items
  customAddedItems.forEach(item => {
    if (baseValues[item.categoryId]) {
      baseValues[item.categoryId].spend += (parseFloat(item.spendBdt) || 0);
      baseValues[item.categoryId].kg += (parseFloat(item.carbonKg) || 0);
      baseValues[item.categoryId].qty += (parseFloat(item.quantity) || 0);
    }
  });

  const totalKg = Object.values(baseValues).reduce((acc, v) => acc + v.kg, 0);
  const totalSpend = Object.values(baseValues).reduce((acc, v) => acc + v.spend, 0);

  const categories = NINE_CATEGORIES_CONFIG.map(cfg => {
    const val = baseValues[cfg.id];
    const pct = totalKg > 0 ? (val.kg / totalKg) * 100 : 0;
    return {
      id: cfg.id,
      name: cfg.name,
      icon: cfg.icon,
      color: cfg.color,
      scope: cfg.defaultScope,
      unit: cfg.defaultUnit,
      spendBdt: Math.round(val.spend),
      carbonKg: Math.round(val.kg),
      carbonTonnes: parseFloat((val.kg / 1000).toFixed(3)),
      percentage: parseFloat(pct.toFixed(1)),
      quantity: Math.round(val.qty)
    };
  });

  const sorted = [...categories].sort((a, b) => b.carbonKg - a.carbonKg);
  const topImpactCategories = sorted.slice(0, 3).map((cat, idx) => ({
    rank: idx + 1,
    id: cat.id,
    name: cat.name,
    color: cat.color,
    carbonKg: cat.carbonKg,
    carbonTonnes: cat.carbonTonnes,
    percentage: cat.percentage
  }));

  const top1 = sorted[0] || categories[0];
  const tipsCatalog = {
    electricity_energy: `Electricity & Energy is your primary emissions driver (${top1.percentage}% of total). Installing a 150 kWp rooftop solar system under SREDA net-metering can abate ~85 tonnes CO₂e annually and eliminate peak grid surcharges.`,
    transport: `Transport & Logistics accounts for ${top1.percentage}% of your carbon footprint. Consolidate N1 highway dispatch schedules and transition internal site shuttles to EV/CNG to cut fleet emissions by up to 24%.`,
    shopping_products: `Purchased Raw Materials contribute ${top1.percentage}% of total emissions. Procuring OEKO-TEX or GRS-certified circular recycled fibers can lower upstream Scope 3 intensity by ~28%.`,
    food_groceries: `Canteen & Provisions make up ${top1.percentage}% of footprint. Switching to direct local agro-cooperatives and implementing organic kitchen composting reduces Scope 3 food loss footprints by 18%.`,
    housing_rent: `Facility HVAC & Heating contributes ${top1.percentage}% of emissions. Performing thermal insulation on boiler steam pipes and tuning chiller setpoints by 1.5°C will save ~12% facility energy.`,
    clothing_footwear: `Uniforms & protective gear generate ${top1.percentage}% of emissions. Transitioning to organic certified cotton workwear extends replacement cycles and cuts Scope 3 textile impact by 15%.`,
    entertainment: `Hospitality & corporate travel accounts for ${top1.percentage}%. Substituting 25% of overseas sales flights with virtual showroom sessions saves ~20 tCO₂e.`,
    health_care: `Occupational health and safety supplies represent ${top1.percentage}%. Consolidating medical deliveries and selecting autoclave-reusable PPE reduces consumable waste.`,
    others: `Ancillary services and solid waste make up ${top1.percentage}%. Installing on-site waste segregation and subscribing to green cloud data regions mitigates operational overhead.`
  };
  const quickTip = tipsCatalog[top1.id] || `Conduct an ISO 50001 energy audit on your largest consumption facilities to unlock immediate 10-15% operational emission reductions.`;

  return {
    categories,
    totalFootprintKg: Math.round(totalKg),
    totalFootprintTonnes: parseFloat((totalKg / 1000).toFixed(2)),
    totalSpendBdt: Math.round(totalSpend),
    trendVsLastMonth: -8.4,
    topImpactCategories,
    quickTip
  };
};

const CarbonDistributionDonut = ({ categories = [], totalKg = 0, totalTonnes = 0, unitMode = 'tonnes', hoveredId = null, onHover = () => {}, isLight = false }) => {
  const radius = 68;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius; // ~427.25

  const activeSlices = categories.filter(c => c.percentage > 0);
  let accumulatedPct = 0;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke={isLight ? legacyColors["legacy-slate-200"] : legacyColors["legacy-forest-47"]}
            strokeWidth={strokeWidth}
          />
          {activeSlices.map((slice) => {
            const strokeDash = (slice.percentage / 100) * circumference;
            const strokeOffset = -((accumulatedPct / 100) * circumference);
            accumulatedPct += slice.percentage;
            const isHovered = hoveredId === slice.id;

            return (
              <circle
                key={slice.id}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => onHover(slice.id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${slice.color}99)` : 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${
            isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'
          }`}>
            Total Footprint
          </span>
          <span className={`font-mono font-black text-lg sm:text-xl leading-tight ${
            isLight ? 'text-legacy-brand-strong' : 'text-legacy-brand-bright'
          }`}>
            {unitMode === 'tonnes' ? `${totalTonnes.toLocaleString()} t` : `${totalKg.toLocaleString()} kg`}
          </span>
          <span className={`text-[9px] font-semibold ${isLight ? 'text-legacy-slate-500' : 'text-emerald-300/60'}`}>
            CO₂e Emissions
          </span>
        </div>
      </div>

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 w-full">
        {activeSlices.map(slice => {
          const isHovered = hoveredId === slice.id;
          return (
            <div
              key={slice.id}
              onMouseEnter={() => onHover(slice.id)}
              onMouseLeave={() => onHover(null)}
              className={`flex items-center space-x-2 p-1.5 rounded-xl cursor-pointer transition-all border ${
                isHovered 
                  ? (isLight ? 'bg-emerald-50/80 border-emerald-300 scale-[1.02]' : 'bg-legacy-forest-42 border-legacy-brand-base/40 scale-[1.02]')
                  : (isLight ? 'bg-legacy-slate-50 border-transparent hover:border-slate-200' : 'bg-legacy-forest-76/60 border-transparent hover:border-legacy-divider-base')
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <div className="truncate text-left leading-tight min-w-0">
                <div className={`text-[11px] font-bold truncate ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                  {slice.name}
                </div>
                <div className={`text-[10px] font-mono ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>
                  {slice.percentage}% • {unitMode === 'tonnes' ? `${slice.carbonTonnes} t` : `${slice.carbonKg.toLocaleString()} kg`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SaaSDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Active Menu / Tabs state
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Bilingual Localization & Reporting Currency state
  const [lang, setLang] = useState('en');
  const locale = SaaSLocales[lang] || SaaSLocales.en;
  const [currency, setCurrency] = useState('BDT');

  // Selected District state
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");

  // Calculator inputs state
  const [inputs, setInputs] = useState({
    diesel: '10000',
    petrol: '4000',
    lpg: '1200',
    electricity: '85000',
    employees: '120',
    airTravel: '45000',
    truckTransport: '18000',
    rawMaterials: '320'
  });

  // GHG Protocol Emission Factors state (allows runtime configuration in Settings tab)
  const [ef, setEf] = useState({
    diesel: 2.68, // kg CO2e / Liter
    petrol: 2.31, // kg CO2e / Liter
    lpg: 2.98, // kg CO2e / kg
    electricity: 0.55, // kg CO2e / kWh (Bangladesh grid average)
    employees: 0.40, // tCO2e / employee / year average commute
    airTravel: 0.12, // kg CO2e / km
    truckTransport: 0.20, // kg CO2e / ton-km
    rawMaterials: 2.50 // tCO2e / ton (composite raw materials)
  });

  // Calculation results state
  const [results, setResults] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  // Materiality Assessment State
  const [materialityScores, setMaterialityScores] = useState({
    climateChange: { name: "Climate Change & Emissions", impact: 5, financial: 5, description: "GHG emissions footprint and energy efficiency transition risks." },
    waterResources: { name: "Water & Marine Resources", impact: 3, financial: 4, description: "Freshwater withdrawal, waste water discharge and scarcity risks." },
    biodiversity: { name: "Biodiversity & Ecosystems", impact: 4, financial: 2, description: "Land use change, deforestation, and ecosystem degradation." },
    circularEconomy: { name: "Resource Use & Circular Economy", impact: 4, financial: 3, description: "Raw materials sourcing, plastic packaging and waste recycle loops." },
    ownWorkforce: { name: "Own Workforce (Social)", impact: 4, financial: 3, description: "Gender ratio, labor standards, training hours and safety records." },
    affectedCommunities: { name: "Affected Communities", impact: 3, financial: 2, description: "Impact on local neighborhoods, human rights, and investments." },
    businessConduct: { name: "Business Conduct & Governance", impact: 4, financial: 4, description: "Ethics, cybersecurity, whistleblowing, and anti-corruption." }
  });

  // Auditor Mode State
  const [isAuditorMode, setIsAuditorMode] = useState(false);

  // Dual Scope 2 Settings
  const [marketFactor, setMarketFactor] = useState(0.12); // kg CO2e / kWh (green tariff)
  
  // Base Year Recalculation State
  const [baseYear, setBaseYear] = useState(2025);
  const [baseYearEmissions, setBaseYearEmissions] = useState(1200);
  const [acquisitionsDivestments, setAcquisitionsDivestments] = useState(0);

  // CBAM State
  const [cbamCommodity, setCbamCommodity] = useState('Steel');
  const [cbamWeight, setCbamWeight] = useState(500); // tons

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [downloadingApp, setDownloadingApp] = useState(false);

  // Modals state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', sector: 'Solar Irrigation', target: '300' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Auditor', email: '', permission: 'Auditor' });

  // Floating Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Multi-Tenant Corporate Client Profiles (Revoo EV, Govaly, MotoRent, East Delta University, SchoolBus BD, EzyGo BD, PolyJute Asia)
  const [activeClientId, setActiveClientId] = useState('east-delta-university');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const activeClient = CLIENT_PROFILES.find(c => c.id === activeClientId) || CLIENT_PROFILES[0];

  const handleSelectClient = (clientId) => {
    setActiveClientId(clientId);
    setIsClientModalOpen(false);
    const client = CLIENT_PROFILES.find(c => c.id === clientId);
    if (client) {
      if (client.baselineInputs) {
        setInputs(prev => ({
          ...prev,
          ...client.baselineInputs
        }));
      }
      if (client.district) {
        setSelectedDistrict(client.district);
      }
      showToast(
        lang === 'bn' 
          ? `ক্লায়েন্ট প্রোফাইল সক্রিয়: ${client.name}` 
          : `Active corporate workspace: ${client.name}`,
        "info"
      );
    }
  };

  // Carbon Zero BD ESG Multi-Corpus RAG State
  const [extractionResult, setExtractionResult] = useState(null);
  const [showExtractionEvidence, setShowExtractionEvidence] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragCorpus, setRagCorpus] = useState('all');
  const [ragResponse, setRagResponse] = useState(null);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSyncingFactors, setIsSyncingFactors] = useState(false);

  // Multi-Category Invoice Footprint & Metrics State
  const [extractionStep, setExtractionStep] = useState(1); // 1: Upload/Ingest, 2: Refine & Analyze, 3: Audit Assurance
  const [unitMode, setUnitMode] = useState('tonnes'); // 'kg' | 'tonnes'
  const [customItems, setCustomItems] = useState([]);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState({
    name: '',
    categoryId: 'transport',
    scope: 'Scope 1',
    spendBdt: '',
    quantity: '',
    unit: 'Liters',
    factor: '2.31'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryAdjustments, setCategoryAdjustments] = useState({});
  const [donutHoveredId, setDonutHoveredId] = useState(null);

  // Handlers for Custom Items & Category Refinement
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newCustomItem.name.trim()) {
      showToast("Please enter an item description.", "error");
      return;
    }
    const spend = parseFloat(newCustomItem.spendBdt) || 0;
    const qty = parseFloat(newCustomItem.quantity) || 0;
    const factor = parseFloat(newCustomItem.factor) || 1.0;
    const carbonKg = qty > 0 ? Math.round(qty * factor) : Math.round(spend * 0.065);

    const item = {
      id: Date.now(),
      name: newCustomItem.name,
      categoryId: newCustomItem.categoryId,
      scope: newCustomItem.scope,
      spendBdt: spend,
      quantity: qty || 1,
      unit: newCustomItem.unit || 'Units',
      factor: factor,
      carbonKg: carbonKg
    };

    setCustomItems(prev => [...prev, item]);
    setIsAddCustomModalOpen(false);
    setNewCustomItem({
      name: '',
      categoryId: 'transport',
      scope: 'Scope 1',
      spendBdt: '',
      quantity: '',
      unit: 'Liters',
      factor: '2.31'
    });
    showToast(`Added "${item.name}" (+${carbonKg.toLocaleString()} kg CO₂e) to footprint matrix!`, "success");
  };

  const handleDeleteCustomItem = (id) => {
    setCustomItems(prev => prev.filter(i => i.id !== id));
    showToast("Removed custom item from matrix.", "info");
  };

  const handleSaveCategoryAdjustment = (catId, newSpend, newKg, newQty) => {
    setCategoryAdjustments(prev => ({
      ...prev,
      [catId]: {
        spend: parseFloat(newSpend) || 0,
        kg: parseFloat(newKg) || 0,
        qty: parseFloat(newQty) || 0
      }
    }));
    setEditingCategory(null);
    showToast("Category parameters refined and recalculated!", "success");
  };

  // Interactive Checklist Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload Q2 Boiler Fuel statements', completed: true },
    { id: 2, text: 'Verify Scope 3 Cargo Commutes', completed: false },
    { id: 3, text: 'Purchase offsets for raw materials (plastic)', completed: false },
    { id: 4, text: 'Verify Solar Branch 2 generation statements', completed: false },
    { id: 5, text: 'Calibrate Blynk IoT Node 4 sensor stream', completed: false }
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Blynk IoT device Carbon Monitor connected successfully.", read: false, time: "2 mins ago" },
    { id: 2, text: "Verification Report for Q1 2026 approved by Tasnim Chowdhury.", read: true, time: "1 hour ago" },
    { id: 3, text: "Annual ESG target set to 38% reduction.", read: true, time: "1 day ago" }
  ]);

  // Team members list state
  const [teamMembers, setTeamMembers] = useState([
    { name: "Tasnim Chowdhury", role: "Lead ESG Auditor", email: "tasnim@carbonzero.io", permission: "Admin", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80", status: "Active" },
    { name: "Kazi Rahman", role: "Carbon Credit Specialist", email: "kazi@carbonzero.io", permission: "Auditor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80", status: "Active" },
    { name: "Arif Hasan", role: "IoT Hardware Engineer", email: "arif@carbonzero.io", permission: "Auditor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80", status: "Active" }
  ]);

  // Projects list state
  const [projects, setProjects] = useState([
    { id: 1, name: 'Dhaka Solar Rooftop Phase 1', sector: 'Solar Energy', target: '250', status: 'In Progress' },
    { id: 2, name: 'AgriCarbon Rice Methane Mitigation', sector: 'Agriculture', target: '480', status: 'Verified' },
    { id: 3, name: 'Mymensingh Clean Cookstoves', sector: 'Clean Cookstoves', target: '180', status: 'Draft' }
  ]);

  // Calendar Event dates state
  const [calendarEvents, setCalendarEvents] = useState({
    4: { title: "Scope 1 Boiler Audit", auditor: "Tasnim Chowdhury", time: "10:00 AM" },
    11: { title: "Scope 2 Grid reporting", auditor: "Kazi Rahman", time: "02:00 PM" },
    18: { title: "AI Document footprint check", auditor: "Arif Hasan", time: "11:30 AM" },
    25: { title: "Offsets purchase settlement", auditor: "Tasnim Chowdhury", time: "04:00 PM" },
    28: { title: "Board ESG presentation", auditor: "Tanveer Ahmed", time: "09:00 AM" }
  });
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(4);

  // Settings target reduction state
  const [reductionTarget, setReductionTarget] = useState(38);

  // FAQ Accordion open states
  const [faqOpen, setFaqOpen] = useState({ 0: true, 1: false, 2: false });

  // Geolocation API to auto select Bangladesh District
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    
    showToast("Detecting regional location...", "info");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        let detected = "Dhaka";
        // Simple division logic for demonstration coordinates mapping
        if (lat > 24.5) {
          detected = "Sylhet";
        } else if (lat < 22.5) {
          detected = "Chittagong";
        } else if (lon < 89.5) {
          detected = "Khulna";
        } else if (lat > 24 && lon < 89.5) {
          detected = "Rajshahi";
        } else {
          detected = "Dhaka";
        }
        
        setSelectedDistrict(detected);
        showToast(`Located in ${detected} district! Regional default emission parameters applied.`, "success");
      },
      (error) => {
        showToast("Unable to detect coordinates. Defaulted to Dhaka.", "info");
      }
    );
  };

  // Perform emissions calculations
  const calculateEmissions = (vals, factors = ef) => {
    const dVal = parseFloat(vals.diesel) || 0;
    const pVal = parseFloat(vals.petrol) || 0;
    const lVal = parseFloat(vals.lpg) || 0;
    const eVal = parseFloat(vals.electricity) || 0;
    const empVal = parseFloat(vals.employees) || 0;
    const airVal = parseFloat(vals.airTravel) || 0;
    const truckVal = parseFloat(vals.truckTransport) || 0;
    const rawVal = parseFloat(vals.rawMaterials) || 0;

    // Scope 1: Direct emissions (fuels converted to tons by dividing by 1000)
    const scope1 = ((dVal * factors.diesel) + (pVal * factors.petrol) + (lVal * factors.lpg)) / 1000;

    // Scope 2 Location-based (default factor)
    const scope2 = (eVal * factors.electricity) / 1000;
    
    // Scope 2 Market-based (uses custom marketFactor, which defaults to 0.12 kg CO2e / kWh)
    const scope2Market = (eVal * marketFactor) / 1000;

    // Scope 3: Value Chain emissions (commutes in tons, travel/freight converted, raw materials in tons)
    const scope3 = (empVal * factors.employees) + 
                   ((airVal * factors.airTravel) / 1000) + 
                   ((truckVal * factors.truckTransport) / 1000) + 
                   (rawVal * factors.rawMaterials);

    const total = scope1 + scope2 + scope3;
    const totalMarket = scope1 + scope2Market + scope3;

    setResults({
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: parseFloat(scope2.toFixed(2)),
      scope2Market: parseFloat(scope2Market.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMarket: parseFloat(totalMarket.toFixed(2))
    });
  };

  // Handle manual inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...inputs, [name]: value };
    setInputs(updated);
  };

  // Trigger calculations whenever inputs or emission factors change
  useEffect(() => {
    calculateEmissions(inputs, ef);
  }, [inputs, ef, marketFactor]);

  // Handle drag and drop file upload
  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
    if (file) {
      setUploadedFile(file.name);
      setUploadedFileObj(file);
      showToast(`Selected file: ${file.name}. Initializing Carbon Zero BD RAG pipeline...`, "info");
      await executeAIExtraction(file);
      if (e.target && e.target.value !== undefined) {
        e.target.value = '';
      }
    }
  };

  // Activity extraction: client-side parse first, then the authenticated ESG API.
  // Extracted values are unreviewed inputs. On failure nothing is substituted: the user enters values manually.
  const SAMPLE_TEXT = `Dexterity Textiles Ltd Q2 Audit Statement DEPZ TX-8491. High Speed Diesel generator: 14,200 Liters. Fleet octane petrol: 4,800 Liters. Commercial LPG: 1,950 kg. DESCO Grid active electricity: 156,000 kWh. Workforce: 148 employees. Overseas marketing flights: 82,000 km. Outward truck freight: 39,000 ton-km. Purchased raw cotton fabric yarn: 580 metric tons. Total Invoiced Spend: BDT 14,850,000.`;

  const executeAIExtraction = async (fileOrName = "ESG_Statement_Q2_2026.xlsx") => {
    setIsUploading(true);
    const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
    showToast(`Extracting activity data from ${fileName}...`, "info");

    try {
      let data = null;
      if (typeof fileOrName !== 'string' && fileOrName instanceof File) {
        try {
          data = await extractESGFromDocument(fileOrName);
        } catch (clientErr) {
          console.warn("Client ESG extraction note:", clientErr);
        }
        if (!data || !data.details?.length) {
          const formData = new FormData();
          formData.append('file', fileOrName);
          data = await esgFetch('/api/esg/extract-footprint', { method: 'POST', body: formData });
        }
      } else {
        // Sample loader: fictional demo text, labelled as such everywhere it is shown.
        const parsed = parseDocumentTextToEsgParams(SAMPLE_TEXT, fileName);
        data = {
          filename: `${fileName} (DEMO SAMPLE)`,
          overall_confidence: null,
          extraction_method: "demo-sample",
          review_status: "DEMO_SAMPLE",
          summary: "Demo sample data for a fictional company. Not customer data and not verified.",
          parameters: parsed.parameters,
          details: parsed.details,
          spendBdt: parsed.spendBdt
        };
      }

      if (!data || !data.details?.length) {
        throw new Error("No activity quantities were found in the document.");
      }

      const newParams = { ...data.parameters };
      const newInputs = { ...inputs };
      for (const key of ['diesel', 'petrol', 'lpg', 'electricity', 'employees', 'airTravel', 'truckTransport', 'rawMaterials']) {
        if (newParams[key] !== undefined) newInputs[key] = String(newParams[key]);
      }
      if (data.spendBdt) newInputs.spendBdt = data.spendBdt;

      setInputs(newInputs);
      calculateEmissions(newInputs, ef);
      setExtractionResult(data);
      setShowExtractionEvidence(true);
      setExtractionStep(2);
      setTasks(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));
      setNotifications(prev => [
        { id: Date.now(), text: `Extracted ${data.details.length} value(s) from ${fileName} — review required`, read: false, time: "Just now" },
        ...prev
      ]);
      showToast(`Extracted ${data.details.length} value(s). Review each value before use.`, "success");
    } catch (err) {
      showToast(`Extraction failed: ${err.message || "unknown error."} Enter values manually.`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Ask AI (POST /api/esg/query). On failure show an unavailable state — never a synthesized answer.
  const executeRagQuery = async (overrideQuery = null) => {
    const q = overrideQuery || ragQuery;
    if (!q || !q.trim()) return;

    setIsRagLoading(true);
    setRagQuery(q);

    try {
      const data = await esgFetch('/api/esg/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, corpus: ragCorpus, top_k: 5 })
      });
      setRagResponse(data);
    } catch (err) {
      setRagResponse({
        query: q,
        answer: `The ESG assistant is unavailable: ${err.message} No answer was generated.`,
        confidence: null,
        citations: [],
        corpus: ragCorpus,
        model_used: "unavailable",
        insufficient_data: true,
        latency_ms: null
      });
    } finally {
      setIsRagLoading(false);
    }
  };

  // Load emission factors from the ESG API. On failure the current factors stay and the user is told so.
  const syncOfficialFactors = async () => {
    setIsSyncingFactors(true);
    try {
      const factors = await esgFetch('/api/esg/emission-factors');
      const newEf = { ...ef };
      factors.forEach(item => {
        const name = item.fuel_or_activity.toLowerCase();
        if (name.includes("diesel")) newEf.diesel = item.factor_value;
        if (name.includes("petrol")) newEf.petrol = item.factor_value;
        if (name.includes("lpg")) newEf.lpg = item.factor_value;
        if (name.includes("grid")) newEf.electricity = item.factor_value;
        if (name.includes("commute")) newEf.employees = item.factor_value;
        if (name.includes("air")) newEf.airTravel = item.factor_value;
        if (name.includes("truck")) newEf.truckTransport = item.factor_value;
        if (name.includes("raw")) newEf.rawMaterials = item.factor_value;
      });
      setEf(newEf);
      showToast(`Loaded ${factors.length} factor(s) from the ESG factor table. Citations are not yet independently validated.`, "success");
    } catch (e) {
      showToast(`Factors not updated: ${e.message}`, "error");
    } finally {
      setIsSyncingFactors(false);
    }
  };

  // Clear inputs
  const clearCalculator = () => {
    const cleared = {
      diesel: '',
      petrol: '',
      lpg: '',
      electricity: '',
      employees: '',
      airTravel: '',
      truckTransport: '',
      rawMaterials: ''
    };
    setInputs(cleared);
    setUploadedFile(null);
    showToast("Calculator inputs cleared.", "info");
  };

  // Toggle tasks check
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Add a new checklist task
  const [taskInput, setTaskInput] = useState('');
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const newTask = {
      id: Date.now(),
      text: taskInput.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setTaskInput('');
    showToast("Verification task added successfully!", "success");
  };

  // Delete checklist task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Task deleted.", "info");
  };

  // Add new project
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    const project = {
      id: Date.now(),
      name: newProject.name.trim(),
      sector: newProject.sector,
      target: newProject.target,
      status: 'Draft'
    };
    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', sector: 'Solar Irrigation', target: '300' });
    setIsAddProjectOpen(false);
    showToast(`Project "${project.name}" added successfully!`, "success");
  };

  // Add new team member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    const member = {
      name: newMember.name.trim(),
      role: newMember.role,
      email: newMember.email.trim(),
      permission: newMember.permission,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=80&q=80`,
      status: "Active"
    };
    setTeamMembers(prev => [...prev, member]);
    setNewMember({ name: '', role: 'Auditor', email: '', permission: 'Auditor' });
    setIsAddMemberOpen(false);
    showToast(`${member.name} added to ESG Audit Team!`, "success");
  };

  // Toggle Member Status
  const toggleMemberStatus = (name) => {
    setTeamMembers(prev => prev.map(m => m.name === name ? { ...m, status: m.status === 'Active' ? 'Offline' : 'Active' } : m));
    showToast("Member status toggled.", "info");
  };

  // Delete team member
  const removeMember = (name) => {
    setTeamMembers(prev => prev.filter(m => m.name !== name));
    showToast("Team member removed.", "info");
  };

  // Toggle FAQ collapse
  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Notifications helper
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  // App download handler
  const handleDownloadApp = () => {
    setDownloadingApp(true);
    showToast("Downloading CarbonZero companion installer...", "info");
    setTimeout(() => {
      setDownloadingApp(false);
      showToast("App installer downloaded successfully!", "success");
    }, 2500);
  };

  // Settings Save Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast("ESG settings and emission factors saved successfully!", "success");
  };

  // Active tasks count
  const openTasksCount = tasks.filter(t => !t.completed).length;

  // Active 9-Category Footprint Matrix (auto-cascades custom items & category adjustments)
  const activeParams = extractionResult ? (extractionResult.parameters || inputs) : inputs;
  const activeMatrix = computeCategoryMatrix(activeParams, customItems, categoryAdjustments);

  return (
    <div className={`min-h-screen flex relative platform-saas-dashboard transition-colors duration-300 ${
      isLight ? 'bg-legacy-mint-08 text-legacy-forest-43' : 'bg-legacy-canvas-deep text-legacy-text-on-dark-soft'
    }`}>
      {/* This legacy dashboard shows illustrative figures; real accounting lives in /platform/esg (register A24). */}
      <p role="note" className="fixed inset-x-0 bottom-0 z-40 bg-amber-400 px-4 py-2 text-center font-mono text-[11px] font-bold text-black">
        DEMO DASHBOARD — figures are illustrative, not your organization&apos;s data and not assured.{' '}
        <a href="/platform/esg" className="underline">Open the ESG accounting workspace</a>
      </p>

      {/* FLOAT TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl shadow-xl border transition-all transform duration-300 animate-fade-in ${
          toast.type === 'success' 
            ? (isLight ? 'bg-legacy-mint-15 text-legacy-forest-21 border-legacy-brand-base/40' : 'bg-legacy-ink-forest text-legacy-green-400 border-legacy-green-400/30')
            : toast.type === 'error'
              ? (isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/80 text-red-300 border-red-500/30')
              : (isLight ? 'bg-white text-legacy-forest-43 border-legacy-mint-25' : 'bg-legacy-forest-60 text-legacy-text-on-dark-soft border-legacy-forest-31')
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className={`w-5 h-5 ${isLight ? 'text-legacy-brand-base' : 'text-legacy-green-400'}`} />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Info className="w-5 h-5 text-sky-500" />
          )}
          <span className="font-sans font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 1. Left Sidebar Navigation Panel — Executive Enterprise Architecture */}
      <aside className={`w-[272px] min-w-[272px] border-r h-screen sticky top-0 hidden lg:flex flex-col justify-between shrink-0 transition-colors duration-200 z-30 select-none ${
        isLight ? 'bg-legacy-mint-01 border-legacy-mint-22' : 'bg-legacy-forest-78 border-legacy-forest-37'
      }`}>
        {/* Header / Brand */}
        <div className={`px-5 pt-6 pb-4 border-b shrink-0 ${isLight ? 'border-legacy-mint-22' : 'border-legacy-forest-37'}`}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-legacy-brand-base to-legacy-brand-bright flex items-center justify-center shadow-[0_0_16px_rgba(0,200,83,0.25)] text-legacy-forest-80 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Leaf className="w-4 h-4 text-legacy-forest-80 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className={`font-sans font-bold text-sm tracking-tight truncate ${
                  isLight ? 'text-legacy-forest-43' : 'text-white'
                }`}>
                  CarbonZero
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-legacy-brand-base/15 text-legacy-brand-bright border border-legacy-brand-base/30 shrink-0 leading-none">
                  BD
                </span>
              </div>
              <span className={`text-[10px] font-sans font-semibold tracking-wider uppercase block truncate mt-0.5 ${
                isLight ? 'text-legacy-text-quiet' : 'text-legacy-mint-45'
              }`}>
                Sovereign Registry OS
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Menu Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar">
          {/* Main Menu */}
          <div>
            <span className={`font-sans text-[10px] uppercase tracking-wider block px-2.5 mb-1.5 font-bold ${
              isLight ? 'text-legacy-text-muted' : 'text-legacy-text-quiet'
            }`}>
              {lang === 'bn' ? 'প্রধান মেনু' : 'Menu'}
            </span>
            <nav className="space-y-1">
              {[
                { name: 'Dashboard', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: Grid },
                { name: 'Materiality', label: lang === 'bn' ? 'ম্যাটেরিয়ালিটি' : 'Materiality', icon: Compass },
                { name: 'Audit & Compliance', label: lang === 'bn' ? 'অডিট ও কমপ্লায়েন্স' : 'Audit & Compliance', icon: CheckCircle2, badge: 'ISO 14064' },
                { name: 'Tasks', label: lang === 'bn' ? 'টাস্ক তালিকা' : 'Tasks', icon: CheckCircle, badge: openTasksCount > 0 ? `${openTasksCount} left` : null },
                { name: 'Calendar', label: lang === 'bn' ? 'ক্যালেন্ডার' : 'Calendar', icon: CalendarIcon },
                { name: 'Analytics', label: lang === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: BarChart2 },
                { name: 'Team', label: lang === 'bn' ? 'টিম ম্যানেজমেন্ট' : 'Team', icon: Users }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveMenu(item.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer relative group ${
                      isActive 
                        ? (isLight 
                            ? 'bg-legacy-mint-14 text-legacy-forest-36 font-bold border border-legacy-mint-30 shadow-sm'
                            : 'bg-legacy-forest-50 text-white font-bold border border-legacy-forest-16 shadow-[0_2px_10px_rgba(0,200,83,0.08)]')
                        : (isLight 
                            ? 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-950 font-medium border border-transparent' 
                            : 'text-legacy-mint-40 hover:bg-white/[0.04] hover:text-white font-medium border border-transparent')
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${
                        isLight ? 'bg-legacy-brand-base' : 'bg-legacy-brand-bright shadow-[0_0_8px_rgba(0,230,118,0.5)]'
                      }`} />
                    )}
                    <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive 
                          ? (isLight ? 'bg-legacy-brand-base/15 text-legacy-forest-02' : 'bg-legacy-brand-base/20 text-legacy-brand-bright')
                          : (isLight ? 'text-legacy-slate-500 group-hover:text-slate-900' : 'text-legacy-mint-45 group-hover:text-emerald-300')
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs tracking-tight truncate">{item.label || item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enterprise Core & Satellite MRV Engines */}
          <div>
            <span className={`font-sans text-[10px] uppercase tracking-wider block px-2.5 mb-1.5 font-bold ${
              isLight ? 'text-legacy-text-muted' : 'text-legacy-text-quiet'
            }`}>
              {lang === 'bn' ? 'কোর ইঞ্জিন ও এমআরভি' : 'Engines & MRV'}
            </span>
            <nav className="space-y-1">
              {[
                { name: 'Activity & Evidence', label: lang === 'bn' ? 'অ্যাক্টিভিটি ও এভিডেন্স' : 'Activity & Evidence', icon: Layers, badge: 'ISO 14064' },
                { name: 'ESG Reports', label: lang === 'bn' ? 'ইএসজি রিপোর্ট' : 'ESG Reports', icon: FileText, badge: 'Audit-Ready' },
                { name: 'DuckDB Engine', label: lang === 'bn' ? 'ডাকডিবি ইঞ্জিন' : 'DuckDB Engine', icon: Zap, badge: 'Sub-25ms' },
                { name: 'Utility Invoices', label: lang === 'bn' ? 'ইউটিলিটি ইনভয়েস' : 'Utility Invoices', icon: FileText, badge: 'Universal' },
                { name: 'Satellite MRV', label: lang === 'bn' ? 'স্যাটেলাইট এমআরভি' : 'Satellite MRV', icon: Globe, badge: 'GEDI' },
                { name: 'Factor Registry', label: lang === 'bn' ? 'ফ্যাক্টর রেজিস্ট্রি' : 'Factor Registry', icon: Database, badge: 'DoE' },
                { name: 'ATLAS Benchmark', label: lang === 'bn' ? 'অ্যাটলাস বেঞ্চমার্ক' : 'ATLAS Benchmark', icon: CheckCircle2, badge: '10 Bills' },
                { name: 'Entity Tree', label: lang === 'bn' ? 'কর্পোরেট হায়ারার্কি' : 'Entity Tree', icon: Building, badge: 'Sweep' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveMenu(item.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer relative group ${
                      isActive 
                        ? (isLight 
                            ? 'bg-legacy-mint-14 text-legacy-forest-36 font-bold border border-legacy-mint-30 shadow-sm'
                            : 'bg-legacy-forest-50 text-white font-bold border border-legacy-forest-16 shadow-[0_2px_10px_rgba(0,200,83,0.08)]')
                        : (isLight 
                            ? 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-950 font-medium border border-transparent' 
                            : 'text-legacy-mint-40 hover:bg-white/[0.04] hover:text-white font-medium border border-transparent')
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${
                        isLight ? 'bg-legacy-brand-base' : 'bg-legacy-brand-bright shadow-[0_0_8px_rgba(0,230,118,0.5)]'
                      }`} />
                    )}
                    <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive 
                          ? (isLight ? 'bg-legacy-brand-base/15 text-legacy-forest-02' : 'bg-legacy-brand-base/20 text-legacy-brand-bright')
                          : (isLight ? 'text-legacy-slate-500 group-hover:text-slate-900' : 'text-legacy-mint-45 group-hover:text-emerald-300')
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs tracking-tight truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-legacy-brand-base/10 text-legacy-brand-bright text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-legacy-brand-base/25 shrink-0 whitespace-nowrap leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* General Section */}
          <div>
            <span className={`font-sans text-[10px] uppercase tracking-wider block px-2.5 mb-1.5 font-bold ${
              isLight ? 'text-legacy-text-muted' : 'text-legacy-text-quiet'
            }`}>
              {lang === 'bn' ? 'সাধারণ' : 'General'}
            </span>
            <nav className="space-y-1">
              {[
                { name: 'Settings', label: lang === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings },
                { name: 'Help', label: lang === 'bn' ? 'সহায়তা' : 'Help', icon: HelpCircle },
                { name: 'Logout', label: lang === 'bn' ? 'লগআউট' : 'Logout', icon: LogOut }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.name === 'Logout') {
                        navigate('/');
                      } else {
                        setActiveMenu(item.name);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer relative group ${
                      isActive 
                        ? (isLight 
                            ? 'bg-legacy-mint-14 text-legacy-forest-36 font-bold border border-legacy-mint-30 shadow-sm'
                            : 'bg-legacy-forest-50 text-white font-bold border border-legacy-forest-16 shadow-[0_2px_10px_rgba(0,200,83,0.08)]')
                        : (isLight 
                            ? 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-950 font-medium border border-transparent' 
                            : 'text-legacy-mint-40 hover:bg-white/[0.04] hover:text-white font-medium border border-transparent')
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${
                        isLight ? 'bg-legacy-brand-base' : 'bg-legacy-brand-bright shadow-[0_0_8px_rgba(0,230,118,0.5)]'
                      }`} />
                    )}
                    <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive 
                          ? (isLight ? 'bg-legacy-brand-base/15 text-legacy-forest-02' : 'bg-legacy-brand-base/20 text-legacy-brand-bright')
                          : (isLight ? 'text-legacy-slate-500 group-hover:text-slate-900' : 'text-legacy-mint-45 group-hover:text-emerald-300')
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs tracking-tight truncate">{item.label || item.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Telemetry Status & Mobile App Card */}
        <div className={`p-3 border-t shrink-0 ${isLight ? 'border-legacy-mint-22' : 'border-legacy-forest-37'}`}>
          <div className={`p-3 rounded-2xl border transition-all ${
            isLight 
              ? 'bg-legacy-mint-09 border-legacy-mint-30 text-legacy-forest-43'
              : 'bg-legacy-forest-68 border-legacy-forest-35 text-white'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-legacy-brand-base opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-legacy-brand-base"></span>
                </span>
                <span className="font-sans font-bold text-[11px] tracking-tight">
                  Live MRV Telemetry
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-legacy-brand-base/15 border border-legacy-brand-base/30 px-1.5 py-0.5 rounded leading-none">
                SYNC
              </span>
            </div>
            <p className={`text-[10px] mb-2.5 leading-tight font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
              Mobile satellite sync & live emissions stream telemetry.
            </p>
            <button 
              disabled={downloadingApp}
              onClick={handleDownloadApp}
              className="w-full bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {downloadingApp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span className="text-white font-mono font-bold">Connecting...</span>
                </>
              ) : (
                <span className="text-white font-mono font-bold tracking-tight">Download Mobile App</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="min-w-0 w-full flex-1 pt-24 lg:pt-28 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-7xl mx-auto space-y-8 pb-28 relative">
        
        {/* Auditor Read-only Active Watermark Banner */}
        {isAuditorMode && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between text-red-500 animate-pulse mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs font-sans font-bold uppercase tracking-wider">
                Auditor Assurance Lock Active — System Read-only Mode (ISAE 3410)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-500 px-2 py-0.5 rounded">
              Locked
            </span>
          </div>
        )}

        {/* Top Header — Elegant Search Pill, Action Buttons, Theme Switch & Profile */}
        <header className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6 relative z-30 transition-colors ${
          isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
        }`}>
          
          {/* Rounded-full Search pill */}
          <div className="relative w-full max-w-sm">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 ${
              isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'
            }`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, team, projects... (Ctrl + F)" 
              className={`w-full pl-10 pr-9 py-2.5 rounded-full text-xs font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-legacy-brand-base/40 ${
                isLight 
                  ? 'bg-white border border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40 shadow-sm'
                  : 'bg-legacy-surface-base border border-legacy-divider-base text-white placeholder-legacy-text-quiet'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-legacy-text-muted hover:text-legacy-brand-base"
              >
                Clear
              </button>
            )}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            
            {/* Corporate Client Profile Switcher Button */}
            <button
              onClick={() => setIsClientModalOpen(true)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-sm ${
                isLight 
                  ? 'bg-white border-legacy-mint-25 hover:border-legacy-brand-base text-legacy-forest-43'
                  : 'bg-legacy-surface-base border-legacy-divider-base hover:border-legacy-brand-base text-white'
              }`}
              title="Switch Corporate Client Workspace Profile"
            >
              <div className={`w-7 h-5 px-1 rounded flex items-center justify-center overflow-hidden shrink-0 ${
                activeClient.logoTheme === 'dark' ? 'bg-legacy-forest-73 border border-legacy-forest-25' : 'bg-white border border-slate-200'
              }`}>
                <img src={activeClient.logo} alt={activeClient.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-left leading-none flex items-center gap-1.5">
                <span className="font-sans font-bold text-xs">{activeClient.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-legacy-brand-base/15 text-legacy-brand-base font-mono font-bold hidden sm:inline-block">
                  {activeClient.sector}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-legacy-text-muted" />
            </button>

            {/* Top Action Pills */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsAddProjectOpen(true)}
                className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span className="text-white font-mono font-bold">Add Project</span>
              </button>
              <button 
                onClick={() => {
                  const inputEl = document.getElementById('drag-file-input');
                  if (inputEl) inputEl.click();
                }}
                className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span className="text-white font-mono font-bold">Import Data</span>
              </button>
            </div>

            {/* Profile, Theme Toggle & Notifications Bell */}
            <div className={`flex items-center space-x-2.5 pl-3 border-l relative ${
              isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
            }`}>
              
              {/* Language Switcher Button (English / বাংলা) */}
              <button
                onClick={() => {
                  const nextLang = lang === 'en' ? 'bn' : 'en';
                  setLang(nextLang);
                  showToast(nextLang === 'bn' ? "ভাষা পরিবর্তন: বাংলা (Bilingual ESG Active)" : "Language switched: English", "info");
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43 hover:bg-legacy-mint-11'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white hover:bg-legacy-surface-raised'
                }`}
                title="Toggle English / বাংলা"
              >
                <Globe className="w-3.5 h-3.5 text-legacy-brand-base" />
                <span className="font-mono text-[11px]">{lang === 'en' ? 'বাংলা' : 'English'}</span>
              </button>

              {/* Reporting Currency Toggle (BDT / USD) */}
              <button
                onClick={() => {
                  const nextCur = currency === 'BDT' ? 'USD' : 'BDT';
                  setCurrency(nextCur);
                  showToast(`Reporting currency: ${nextCur}`, "info");
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43 hover:bg-legacy-mint-11'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-legacy-brand-base hover:bg-legacy-surface-raised'
                }`}
                title="Toggle Currency BDT / USD"
              >
                <span>{currency === 'BDT' ? '৳ BDT' : '$ USD'}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                id="dashboard-theme-toggle"
                onClick={toggleTheme}
                className="theme-toggle cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <Sun size={16} className="icon icon-sun text-amber" />
                <Moon size={16} className="icon icon-moon text-legacy-brand-base" />
              </button>

              {/* Notification Bell */}
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  isLight 
                    ? 'bg-white border border-legacy-divider-light text-legacy-text-quiet hover:text-legacy-brand-base shadow-sm'
                    : 'bg-legacy-surface-base border border-legacy-divider-base text-legacy-text-muted hover:text-legacy-brand-base'
                }`}
              >
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-legacy-red-500 animate-pulse"></span>
                )}
                <Bell className="w-4 h-4" />
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-left border ${
                  isLight 
                    ? 'bg-white border-legacy-mint-24 text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  <div className={`flex justify-between items-center pb-2 border-b ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <span className="font-sans font-bold text-sm">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-sans font-semibold text-legacy-brand-base hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-legacy-text-muted py-4 text-center">No alerts or notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 ${
                          n.read 
                            ? 'bg-transparent' 
                            : (isLight ? 'bg-legacy-mint-11 border border-legacy-brand-base/20' : 'bg-legacy-surface-raised/40 border border-legacy-brand-base/30')
                        }`}>
                          <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${n.read ? 'bg-transparent' : 'bg-legacy-brand-base'}`}></div>
                          <div className="flex-1">
                            <p className="font-sans leading-tight">{n.text}</p>
                            <span className={`text-[9px] font-mono block mt-1 ${isLight ? 'text-legacy-mint-40' : 'text-legacy-text-muted'}`}>{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* User Profile Pill (Assigned ESG Auditor / Admin) */}
              <div className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-full border shadow-sm ${
                isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-surface-base border-legacy-divider-base'
              }`}>
                <div className="w-7 h-7 rounded-full overflow-hidden border border-legacy-brand-base/40 bg-legacy-brand-base/15 flex items-center justify-center font-mono font-bold text-[10px] text-legacy-brand-base">
                  {activeClient.assignedAuditor?.name 
                    ? activeClient.assignedAuditor.name.split(' ').filter(p=>!['Dr.', 'Engr.', 'FCA'].includes(p)).map(n=>n[0]).join('').slice(0, 2)
                    : 'MT'}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className={`font-sans font-bold text-xs ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    {activeClient.assignedAuditor?.name || 'Mohammad Tanveer'}
                  </div>
                  <div className="text-[9px] text-legacy-brand-base font-mono font-medium truncate max-w-[130px]">
                    {activeClient.assignedAuditor?.title || 'Admin • ESG Lead'}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </header>

        {/* -------------------- TAB CONTENT: DASHBOARD -------------------- */}
        {activeMenu === 'Dashboard' && (
          <>
            {/* Dashboard Title & Bangladesh Geolocation Selector */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className={`font-sans font-black text-2xl lg:text-3xl tracking-tight ${
                    isLight ? 'text-legacy-forest-43' : 'text-white'
                  }`}>
                    ESG Progress
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isLight ? 'bg-legacy-mint-17 text-legacy-forest-21 border border-legacy-brand-base/30' : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11'
                  }`}>
                    Live Active
                  </span>
                </div>
                <p className={`text-xs font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                  Plan, prioritize, and verify your corporate emissions with ease.
                </p>
              </div>

              {/* Bangladesh Geolocation Selector Pill */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border self-start md:self-auto shadow-sm ${
                isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-surface-base border-legacy-divider-base'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-legacy-brand-base" />
                <span className={`text-[11px] font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>District:</span>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    showToast(`District branch updated to ${e.target.value}.`, "info");
                  }}
                  className={`text-xs font-sans font-bold border-none bg-transparent focus:ring-0 cursor-pointer ${
                    isLight ? 'text-legacy-forest-43' : 'text-white'
                  }`}
                >
                  {BANGLADESH_DISTRICTS.map(dist => (
                    <option key={dist} value={dist} className={isLight ? 'bg-white text-legacy-forest-43' : 'bg-legacy-surface-base text-white'}>
                      {dist}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={detectLocation}
                  className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Auto Select
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* ROW 1: EXECUTIVE SHOWCASE — IMPACT OVERVIEW & EMISSIONS TREND */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card 1: Impact Overview (Pills + Radial Gauge) */}
              <div className={`lg:col-span-5 rounded-3xl p-6 lg:p-7 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-legacy-divider-light shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]'
                  : 'bg-legacy-surface-base border-legacy-divider-base shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-legacy-brand-base/15 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-legacy-brand-base" />
                    </div>
                    <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                      Impact Overview
                    </h3>
                  </div>
                  <button className={`p-1.5 rounded-full hover:opacity-80 transition-opacity ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Content: Left Stacked Pills + Right SemiCircular Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
                  
                  {/* Left Column: 3 Tactile Metric Pills */}
                  <div className="sm:col-span-7 space-y-2.5">
                    
                    {/* Metric 1 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-legacy-mint-05 border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                          Emissions Reduced
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isLight ? 'bg-legacy-mint-17 text-legacy-forest-21' : 'bg-legacy-brand-base/15 text-legacy-green-400'
                        }`}>
                          +14%
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          2,450
                        </span>
                        <span className={`text-[11px] font-mono ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                          tCO2e
                        </span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-legacy-mint-05 border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                          Projects Tracked
                        </span>
                        <span className="w-2 h-2 rounded-full bg-legacy-brand-base"></span>
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          12 Active
                        </span>
                        <span className={`text-[11px] font-sans ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                          initiatives
                        </span>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLight ? 'bg-legacy-mint-05 border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                          Teams Involved
                        </span>
                        <Users className={`w-3.5 h-3.5 ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-quiet'}`} />
                      </div>
                      <div className="mt-1 flex items-baseline space-x-1.5">
                        <span className={`font-sans font-extrabold text-lg tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          8 Units
                        </span>
                        <span className={`text-[11px] font-sans ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                          cross-functional
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Radial Arch Gauge with Rating 9.3 */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0">
                    <SemiCircularGauge 
                      value={93} 
                      max={100} 
                      label="Rating" 
                      sublabel="9.3 AI score" 
                      accentColor={legacyColors["legacy-brand-base"]}
                      isLight={isLight} 
                    />
                    <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-sans font-bold flex items-center space-x-1 border shadow-xs ${
                      isLight 
                        ? 'bg-legacy-mint-15 text-legacy-forest-21 border-legacy-brand-base/30'
                        : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
                    }`}>
                      <Sparkles className="w-3 h-3 text-legacy-brand-base" />
                      <span>Excellence Tier</span>
                    </div>
                  </div>

                </div>

                {/* Footer Insight */}
                <div className={`pt-3 border-t text-[11px] font-sans flex items-center justify-between ${
                  isLight ? 'border-legacy-divider-light text-legacy-text-quiet' : 'border-legacy-forest-38 text-legacy-text-muted'
                }`}>
                  <span>Illustrative demo figures</span>
                  <span className="font-mono text-amber-500 font-bold">DEMO</span>
                </div>
              </div>

              {/* Card 2: Emissions Trend (Wide Catmull-Rom Area Chart) */}
              <div className={`lg:col-span-7 rounded-3xl p-6 lg:p-7 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-legacy-divider-light shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]'
                  : 'bg-legacy-surface-base border-legacy-divider-base shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header with Title & Metric Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                      Emissions Trend
                    </h3>
                    <p className={`text-[11px] font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                      12-Month Corporate Carbon Trajectory (Jan – Dec 2026)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border ${
                      isLight ? 'bg-legacy-mint-05 border-legacy-divider-light text-legacy-text-quiet' : 'bg-legacy-canvas-deep border-legacy-divider-base text-legacy-text-muted'
                    }`}>
                      Scope 1-3 Baseline
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                      isLight ? 'bg-legacy-mint-17 text-legacy-forest-21 border border-legacy-brand-base/30' : 'bg-legacy-brand-base/15 text-legacy-green-400 border border-legacy-forest-11'
                    }`}>
                      <TrendingDown className="w-3 h-3 text-legacy-brand-base" />
                      <span>(+12%) improvement since January</span>
                    </span>
                  </div>
                </div>

                {/* Spline Area Chart */}
                <div className="py-2">
                  <EmissionsTrendChart isLight={isLight} />
                </div>

                {/* Chart Legend & Telemetry Status */}
                <div className={`pt-3 border-t text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 ${
                  isLight ? 'border-legacy-divider-light text-legacy-text-quiet' : 'border-legacy-forest-38 text-legacy-text-muted'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-legacy-brand-base"></span>
                      <span>Target Path</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-legacy-mint-39' : 'bg-legacy-forest-13'}`}></span>
                      <span>Prior Year Actual</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px]">Updated 12m ago via IoT API</span>
                </div>
              </div>

            </div>

            {/* ============================================================= */}
            {/* ROW 2: DEEP TELEMETRY — CARBON OVERVIEW, NEW ESG DATA, ANALYZER */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Carbon Overview */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-legacy-divider-light shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]'
                  : 'bg-legacy-surface-base border-legacy-divider-base shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    Carbon Overview
                  </h3>
                  <button className={`p-1 rounded-full hover:opacity-80 transition-opacity ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Gauge with 78% Real-Time Insights */}
                <div className="flex flex-col items-center justify-center py-2">
                  <SemiCircularGauge 
                    value={78} 
                    max={100} 
                    label="78%" 
                    sublabel="real-time insights" 
                    accentColor={legacyColors["legacy-brand-base"]}
                    isLight={isLight} 
                  />
                  
                  {/* Footprint Readout Underneath Gauge */}
                  <div className="mt-3 text-center">
                    <div className={`font-sans font-extrabold text-2xl tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                      {results.total} <span className="text-xs font-mono font-normal text-legacy-brand-base">tCO2e</span>
                    </div>
                    <div className="flex items-center justify-center space-x-6 text-[10px] font-mono text-legacy-text-muted mt-1">
                      <span>0%</span>
                      <span className="text-legacy-brand-base font-bold">Optimal Target</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Eco Trajectory Pill */}
                <div className={`mt-3 p-2.5 rounded-2xl border text-center text-xs font-sans font-semibold flex items-center justify-center space-x-2 ${
                  isLight ? 'bg-legacy-mint-05 border-legacy-divider-light text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-legacy-brand-base animate-pulse"></span>
                  <span>Optimal Reduction Trajectory</span>
                </div>
              </div>

              {/* Card 2: New ESG Data */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-legacy-divider-light shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]'
                  : 'bg-legacy-surface-base border-legacy-divider-base shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-2">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    New ESG Data
                  </h3>
                  <button className={`p-1 rounded-full hover:opacity-80 transition-opacity ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Counter + Growth Pill */}
                <div>
                  <div className="flex items-baseline space-x-2.5">
                    <span className={`font-sans font-black text-3xl lg:text-4xl tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                      4,826
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isLight ? 'bg-legacy-mint-17 text-legacy-forest-21' : 'bg-legacy-brand-base/15 text-legacy-green-400'
                    }`}>
                      +1,852 this month
                    </span>
                  </div>
                  <p className={`text-[11px] font-sans mt-1 ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                    Telemetry data points synced from smart meters & utility logs
                  </p>
                </div>

                {/* Micro Monthly Bar Chart (Apr - Jul) */}
                <div className="py-2">
                  <MicroBarChart isLight={isLight} />
                </div>

                {/* Segmented Carousel Indicator */}
                <div className="pt-2 flex justify-center">
                  <CarouselIndicator count={4} activeIndex={0} isLight={isLight} />
                </div>
              </div>

              {/* Card 3: ESG Analyzer */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-legacy-divider-light shadow-[0_10px_30px_-4px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]'
                  : 'bg-legacy-surface-base border-legacy-divider-base shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)]'
              }`}>
                {/* Header with Run AI Pill */}
                <div className="flex items-center justify-between pb-2">
                  <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    ESG Analyzer
                  </h3>
                  <button 
                    onClick={() => executeRagQuery("Summarize our ESG score readiness against CSRD and Bangladesh ECR standards.")}
                    className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-white font-mono font-bold">Run AI</span>
                  </button>
                </div>

                {/* Statement */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-legacy-brand-base"></span>
                    <p className={`text-xs font-sans font-semibold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                      Your ESG score is <span className="text-legacy-brand-base font-bold">80%</span>
                    </p>
                  </div>
                  <p className={`text-[11px] font-sans mt-1 leading-relaxed ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                    This score is considered to be <strong className={isLight ? 'text-legacy-forest-21' : 'text-legacy-green-400'}>Strong</strong> across Scope 1-3 direct & value-chain emissions.
                  </p>
                </div>

                {/* 24-Capsule LED Segmented Progress Bar */}
                <div className="py-2 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-legacy-text-muted">
                    <span>Score: 80 / 100</span>
                    <span className="text-legacy-brand-base font-bold">19 / 24 Capsules Active</span>
                  </div>
                  <SegmentedProgressBar activeCount={19} total={24} isLight={isLight} />
                </div>

                {/* Subtext Footer */}
                <div className={`pt-3 border-t text-[10px] font-mono flex items-center justify-between ${
                  isLight ? 'border-legacy-divider-light text-legacy-text-quiet' : 'border-legacy-forest-38 text-legacy-text-muted'
                }`}>
                  <span>Demo data</span>
                  <span className="text-amber-500 font-semibold">Not assured</span>
                </div>
              </div>

            </div>

            {/* ============================================================= */}
            {/* ROW 3: DETAILED SCOPE BREAKDOWN CARDS                         */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Emissions */}
              <div className={`p-6 rounded-3xl border shadow-md relative overflow-hidden flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-gradient-to-br from-legacy-mint-16 via-legacy-mint-21 to-legacy-mint-27 border-legacy-mint-30 text-legacy-forest-43'
                  : 'bg-gradient-to-br from-legacy-surface-raised via-legacy-forest-52 to-legacy-forest-64 border-legacy-forest-11 text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-legacy-forest-21' : 'text-legacy-emerald-200'
                  }`}>
                    Total Carbon Footprint
                  </div>
                  <div className={`font-sans font-black text-3xl lg:text-4xl tracking-tight ${
                    isLight ? 'text-legacy-forest-43' : 'text-white'
                  }`}>
                    {results.total} <span className={`text-xs font-mono font-normal ${isLight ? 'text-legacy-forest-21' : 'text-legacy-emerald-200'}`}>tCO2e</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-[10px] font-mono px-3 py-1 rounded-full flex items-center border ${
                    isLight 
                      ? 'bg-white/80 text-legacy-forest-21 border-legacy-brand-base/20 shadow-xs'
                      : 'bg-white/10 text-legacy-green-400 border-white/10'
                  }`}>
                    <TrendingDown className="w-3 h-3 mr-1 text-legacy-brand-base" />
                    {reductionTarget}% reduced
                  </span>
                  <span className={`text-[9px] font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-emerald-200'}`}>
                    vs baseline
                  </span>
                </div>
              </div>

              {/* Card 2: Scope 1 (Direct) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-legacy-divider-light text-legacy-forest-43 shadow-sm'
                  : 'bg-legacy-surface-base border-legacy-divider-base text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                  }`}>
                    Scope 1 (Direct)
                  </div>
                  <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    {results.scope1} <span className={`text-xs font-mono font-normal ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>tCO2e</span>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                  <span>Boilers, Fleet, Fuel</span>
                  <span className="font-mono font-bold text-amber">
                    {results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Card 3: Scope 2 (Electricity) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-legacy-divider-light text-legacy-forest-43 shadow-sm'
                  : 'bg-legacy-surface-base border-legacy-divider-base text-white'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                      isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                    }`}>
                      Scope 2 (Electricity)
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-sans uppercase ${
                      isLight ? 'bg-legacy-mint-17 text-legacy-forest-21 border border-legacy-brand-base/20' : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11'
                    }`}>
                      Dual Reporting
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-quiet'}`}>Location</span>
                      <span className={`font-sans font-bold text-xl ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                        {results.scope2} <span className="text-[10px] font-mono font-normal text-legacy-text-muted">t</span>
                      </span>
                    </div>
                    <div>
                      <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-quiet'}`}>Market</span>
                      <span className="font-sans font-bold text-xl text-legacy-brand-base">
                        {results.scope2Market} <span className="text-[10px] font-mono font-normal text-legacy-text-muted">t</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-3 text-[10px] ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                  <span>Purchased Power</span>
                  <span className="font-mono text-[9px] text-legacy-brand-base font-bold">
                    Loc: {results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}% | Mkt: {results.totalMarket > 0 ? ((results.scope2Market / results.totalMarket) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Card 4: Scope 3 (Value Chain) */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between aspect-[1.5] transition-all ${
                isLight 
                  ? 'bg-white border-legacy-divider-light text-legacy-forest-43 shadow-sm'
                  : 'bg-legacy-surface-base border-legacy-divider-base text-white'
              }`}>
                <div>
                  <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
                    isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                  }`}>
                    Scope 3 (Value Chain)
                  </div>
                  <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                    {results.scope3} <span className={`text-xs font-mono font-normal ${isLight ? 'text-legacy-mint-43' : 'text-legacy-text-muted'}`}>tCO2e</span>
                  </div>
                </div>
                <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                  <span>Supply Chain & Commutes</span>
                  <span className="font-mono font-bold text-legacy-purple-500">
                    {results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

            </div>

            {/* Main Two Column Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Calculator & File Dropzone) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Scope Emissions Calculator Module */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  
                  <div className={`flex justify-between items-center border-b pb-4 ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <div>
                      <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>Protocol Emissions Calculator</h3>
                      <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>Input raw values or upload utility invoices to extract footprint.</p>
                    </div>
                    <button 
                      onClick={clearCalculator}
                      className="font-mono text-[10px] text-legacy-red-500 bg-legacy-red-500/10 hover:bg-legacy-red-500/20 border border-legacy-red-500/20 px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Clear Data
                    </button>
                  </div>

                  {/* Scope Calculator Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Scope 1 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-legacy-brand-strong border-legacy-divider-light' : 'text-legacy-emerald-200 border-legacy-forest-38'
                      }`}>
                        Scope 1 (Direct)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Diesel (Liters)</label>
                          <input 
                            type="number"
                            name="diesel"
                            value={inputs.diesel}
                            onChange={handleInputChange}
                            placeholder="e.g. 10000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Petrol (Liters)</label>
                          <input 
                            type="number"
                            name="petrol"
                            value={inputs.petrol}
                            onChange={handleInputChange}
                            placeholder="e.g. 5000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>LPG (Kg)</label>
                          <input 
                            type="number"
                            name="lpg"
                            value={inputs.lpg}
                            onChange={handleInputChange}
                            placeholder="e.g. 1500"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 2 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-legacy-brand-strong border-legacy-divider-light' : 'text-legacy-emerald-200 border-legacy-forest-38'
                      }`}>
                        Scope 2 (Indirect)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Grid Power (kWh)</label>
                          <input 
                            type="number"
                            name="electricity"
                            value={inputs.electricity}
                            onChange={handleInputChange}
                            placeholder="e.g. 100000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope 3 Column */}
                    <div className="space-y-4">
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
                        isLight ? 'text-legacy-brand-strong border-legacy-divider-light' : 'text-legacy-emerald-200 border-legacy-forest-38'
                      }`}>
                        Scope 3 (Value Chain)
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Employees (Commute)</label>
                          <input 
                            type="number"
                            name="employees"
                            value={inputs.employees}
                            onChange={handleInputChange}
                            placeholder="e.g. 150"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Air Travel (Km)</label>
                          <input 
                            type="number"
                            name="airTravel"
                            value={inputs.airTravel}
                            onChange={handleInputChange}
                            placeholder="e.g. 50000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Truck Freight (T-Km)</label>
                          <input 
                            type="number"
                            name="truckTransport"
                            value={inputs.truckTransport}
                            onChange={handleInputChange}
                            placeholder="e.g. 20000"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                            isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'
                          }`}>Raw Materials (Tons)</label>
                          <input 
                            type="number"
                            name="rawMaterials"
                            value={inputs.rawMaterials}
                            onChange={handleInputChange}
                            placeholder="e.g. 400"
                            disabled={isAuditorMode}
                            className={`w-full text-xs font-mono p-2 border rounded-lg focus:outline-none focus:border-legacy-brand-base transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isLight 
                                ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-mint-40'
                                : 'bg-legacy-canvas-deep border-legacy-forest-32 text-legacy-green-400 placeholder-legacy-forest-07'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* AI Document Footprint Extractor — 3-Step Executive Flow */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  
                  {/* Header & Badges */}
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-legacy-brand-base" />
                        <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          ESG SaaS
                        </h3>
                      </div>
                      <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>
                        Upload corporate bills, utility statements, or fuel spreadsheets. Carbon Zero BD RAG scans documents, matches national DoE emission factors, and calculates multi-category carbon metrics.
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        isLight ? 'bg-legacy-positive-surface text-legacy-brand-strong border border-legacy-positive-border' : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11'
                      }`}>
                        <Sparkles className="w-3 h-3 mr-1 text-legacy-brand-base" />
                        Multi-Corpus RAG Active
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        isLight ? 'bg-legacy-mint-13 text-legacy-forest-06 border border-legacy-mint-28' : 'bg-legacy-forest-47 text-legacy-emerald-200 border border-legacy-forest-10'
                      }`}>
                        DoE 2023 Factors
                      </span>
                    </div>
                  </div>

                  {/* 3-Step Interactive Process Navigation Bar */}
                  <div className={`p-1.5 rounded-2xl border grid grid-cols-3 gap-1 ${
                    isLight ? 'bg-legacy-mint-08 border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                  }`}>
                    {[
                      { step: 1, label: "1. Ingest & Upload", sub: "Raw Bills & Invoices" },
                      { step: 2, label: "2. Refine & Categorize", sub: "9 Categories & Impact" },
                      { step: 3, label: "3. Evidence", sub: "Source snippets" }
                    ].map(s => {
                      const isActive = extractionStep === s.step;
                      return (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => setExtractionStep(s.step)}
                          className={`py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-legacy-brand-base text-white shadow-sm font-bold border border-legacy-brand-base'
                              : (isLight 
                                  ? 'text-legacy-text-quiet hover:text-legacy-forest-43 hover:bg-white/50'
                                  : 'text-legacy-text-muted hover:text-white hover:bg-legacy-forest-66')
                          }`}
                        >
                          <div className={`text-xs font-bold font-mono ${isActive ? 'text-white' : ''}`}>{s.label}</div>
                          <div className={`text-[10px] font-mono hidden sm:block ${
                            isActive ? 'text-white/90 font-medium' : (isLight ? 'text-legacy-mint-43' : 'text-legacy-text-quiet')
                          }`}>
                            {s.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* STEP 1: Upload & Document Intake View */}
                  <div className={`space-y-5 ${extractionStep === 1 ? 'block' : 'hidden'}`}>
                    {/* Sample Quick Loader Banner */}
                    <div className={`rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border ${
                      isLight 
                        ? 'bg-legacy-mint-06 border-legacy-mint-32'
                        : 'bg-legacy-forest-55 border-legacy-forest-11'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          isLight ? 'bg-legacy-positive-surface border-legacy-mint-32 text-legacy-brand-strong' : 'bg-legacy-surface-raised border-legacy-forest-11 text-legacy-green-400'
                        }`}>
                          <Database className={`w-4 h-4 ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`} />
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>Quick Test with Demo Sample</div>
                          <div className={`text-[11px] ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>Load Dexterity Textiles Ltd Q2 Audit Statement (DEPZ TX-8491)</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
                        disabled={isUploading}
                        className="text-xs font-bold font-mono px-3.5 py-1.5 rounded-xl bg-legacy-brand-base hover:bg-legacy-brand-bright text-white transition-all shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-mono font-bold">Load Demo Sample (fictional)</span>
                      </button>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer relative ${
                        isLight 
                          ? 'border-legacy-positive-border bg-legacy-mint-05 hover:bg-legacy-positive-surface'
                          : 'border-legacy-forest-22 bg-legacy-canvas-deep/80 hover:bg-legacy-forest-76'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="drag-file-input"
                        onChange={handleFileDrop}
                        className="hidden" 
                        accept=".csv,.xlsx,.xls,.pdf,.txt"
                      />
                      <div onClick={() => document.getElementById('drag-file-input').click()} className="space-y-3">
                        <Upload className="w-10 h-10 text-legacy-brand-base mx-auto animate-none" />
                        <div className={`text-xs font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          {uploadedFile ? `Uploaded Document: ${uploadedFile}` : "Drag & Drop Financial spreadsheets, utility bills, or fuel invoices here"}
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>Supports PDF, XLSX, CSV, TXT (Max 25MB) • Encrypted Per-Tenant Ingestion</div>
                      </div>
                    </div>

                    {/* Controls & Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => executeAIExtraction(uploadedFileObj || uploadedFile || "ESG_Statement_Q2_2026.xlsx")}
                          disabled={isUploading}
                          className="bg-legacy-brand-base hover:bg-legacy-brand-bright disabled:bg-legacy-forest-49 disabled:text-white/40 disabled:border disabled:border-legacy-forest-26 disabled:shadow-none disabled:cursor-not-allowed text-white font-mono font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 w-full sm:w-auto cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span className="text-white font-mono font-bold">RAG Extracting & Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-white" />
                              <span className="text-white font-mono font-bold">Run RAG Extraction</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setExtractionStep(2)}
                          className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span className="text-white font-mono font-bold">View Metrics & Categories</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>

                      {extractionResult && (
                        <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border ${
                          isLight 
                            ? 'bg-legacy-positive-surface border-legacy-positive-border text-legacy-brand-strong'
                            : 'bg-legacy-surface-raised border-legacy-forest-11 text-legacy-green-400'
                        }`}>
                          <CheckCircle2 className="w-5 h-5 text-legacy-brand-base" />
                          <div className="text-left leading-none">
                            <div className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                              isLight ? 'text-legacy-brand-strong' : 'text-legacy-emerald-200'
                            }`}>Status</div>
                            <div className={`font-sans font-bold text-xs ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>{extractionResult.review_status === 'DEMO_SAMPLE' ? 'DEMO SAMPLE — NOT CUSTOMER DATA' : 'UNREVIEWED — REVIEW REQUIRED'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXECUTIVE HEADLINE METRICS CARD (Always accessible for complete footprint overview) */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    isLight 
                      ? 'bg-legacy-mint-04 border-legacy-mint-25'
                      : 'bg-legacy-canvas-deep border-legacy-forest-34'
                  }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      
                      {/* Left: Total Footprint Readout */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono text-[10px] uppercase tracking-wider font-bold ${
                            isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'
                          }`}>
                            Total Invoiced Carbon Footprint
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-legacy-brand-base border border-emerald-500/20">
                            <TrendingDown className="w-3 h-3 mr-1 text-legacy-brand-base" />
                            {Math.abs(activeMatrix.trendVsLastMonth)}% vs last month
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-3">
                          <div className={`font-sans font-extrabold text-3xl sm:text-4xl tracking-tight ${
                            isLight ? 'text-legacy-forest-43' : 'text-white'
                          }`}>
                            {unitMode === 'tonnes' 
                              ? `${activeMatrix.totalFootprintTonnes.toLocaleString()}` 
                              : `${activeMatrix.totalFootprintKg.toLocaleString()}`
                            }
                          </div>
                          <div className={`font-mono text-base font-bold ${
                            isLight ? 'text-legacy-brand-strong' : 'text-legacy-brand-bright'
                          }`}>
                            {unitMode === 'tonnes' ? 'tCO₂e' : 'kg CO₂e'}
                          </div>
                        </div>
                        <div className={`text-xs ${isLight ? 'text-legacy-slate-500' : 'text-legacy-text-muted'}`}>
                          Calculated from {activeMatrix.categories.filter(c => c.carbonKg > 0).length} active corporate emission categories • estimate, not assured
                        </div>
                      </div>

                      {/* Right: Quick Stats & Unit Mode Toggle */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Spend Box */}
                        <div className={`px-4 py-2.5 rounded-xl border text-left ${
                          isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-surface-base border-legacy-forest-32'
                        }`}>
                          <div className={`text-[10px] uppercase font-mono font-bold ${isLight ? 'text-legacy-forest-03' : 'text-legacy-text-muted'}`}>
                            Invoiced Spend
                          </div>
                          <div className={`text-sm font-bold font-mono ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                            ৳ {activeMatrix.totalSpendBdt.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">BDT</span>
                          </div>
                        </div>

                        {/* Intensity Box */}
                        <div className={`px-4 py-2.5 rounded-xl border text-left ${
                          isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-surface-base border-legacy-forest-32'
                        }`}>
                          <div className={`text-[10px] uppercase font-mono font-bold ${isLight ? 'text-legacy-forest-03' : 'text-legacy-text-muted'}`}>
                            Carbon Intensity
                          </div>
                          <div className={`text-sm font-bold font-mono ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`}>
                            {activeMatrix.totalSpendBdt > 0 
                              ? ((activeMatrix.totalFootprintKg / activeMatrix.totalSpendBdt) * 1000).toFixed(2) 
                              : "0.00"
                            } <span className="text-[10px] font-normal text-slate-400">kg/৳1k</span>
                          </div>
                        </div>

                        {/* Unit Toggle Buttons */}
                        <div className={`flex items-center p-1 rounded-xl border ${
                          isLight ? 'bg-white border-legacy-mint-25' : 'bg-legacy-surface-base border-legacy-forest-32'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setUnitMode('kg')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              unitMode === 'kg'
                                ? 'bg-legacy-brand-base text-white shadow-sm'
                                : (isLight ? 'text-legacy-text-quiet hover:text-legacy-forest-43' : 'text-legacy-text-muted hover:text-white')
                            }`}
                          >
                            kg CO₂e
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnitMode('tonnes')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              unitMode === 'tonnes'
                                ? 'bg-legacy-brand-base text-white shadow-sm'
                                : (isLight ? 'text-legacy-text-quiet hover:text-legacy-forest-43' : 'text-legacy-text-muted hover:text-white')
                            }`}
                          >
                            Tonnes (t)
                          </button>
                        </div>

                        {/* Add Custom Item Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setIsAddCustomModalOpen(true)}
                          className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span className="text-white font-mono font-bold">Add Custom Item</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* STEP 2: Refine & Analyze Category Matrix & Top Impacts */}
                  <div className={`space-y-6 ${extractionStep === 2 ? 'block' : 'hidden'}`}>
                    {extractionResult && (
                      <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-300">
                        {extractionResult.review_status === 'DEMO_SAMPLE'
                          ? 'DEMO SAMPLE — fictional data, not customer data. Figures below are illustrative estimates.'
                          : 'UNREVIEWED — extracted values must be reviewed before use. Figures below are estimates with unverified factors.'}
                      </p>
                    )}

                    {/* Visual Category Distribution (Donut) & Top Impact Categories (2 Columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Column: Interactive Donut Chart */}
                      <div className={`lg:col-span-6 p-5 rounded-2xl border flex flex-col items-center justify-between ${
                        isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                      }`}>
                        <div className="w-full flex justify-between items-center border-b pb-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <PieChart className="w-4 h-4 text-legacy-brand-base" />
                            <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                              isLight ? 'text-legacy-forest-43' : 'text-white'
                            }`}>
                              Emission Distribution by Category
                            </h4>
                          </div>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>
                            Hover slices for breakdown
                          </span>
                        </div>

                        <CarbonDistributionDonut 
                          categories={activeMatrix.categories}
                          totalKg={activeMatrix.totalFootprintKg}
                          totalTonnes={activeMatrix.totalFootprintTonnes}
                          unitMode={unitMode}
                          hoveredId={donutHoveredId}
                          onHover={setDonutHoveredId}
                          isLight={isLight}
                        />
                      </div>

                      {/* Right Column: Top Impact Categories & Decarbonization AI Tip */}
                      <div className="lg:col-span-6 space-y-4">
                        
                        {/* Top 3 Impact Categories Cards */}
                        <div className={`p-5 rounded-2xl border space-y-3 ${
                          isLight ? 'bg-white border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                        }`}>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-legacy-brand-base" />
                              <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                                isLight ? 'text-legacy-forest-43' : 'text-white'
                              }`}>
                                Top Impact Drivers
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-legacy-brand-base font-bold">
                              Prioritized by Footprint Magnitude
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {activeMatrix.topImpactCategories.map(top => (
                              <div 
                                key={top.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isLight 
                                    ? 'bg-legacy-mint-04 border-legacy-divider-light hover:border-emerald-300'
                                    : 'bg-legacy-surface-base border-legacy-forest-32 hover:border-legacy-brand-base/40'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1.5">
                                  <div className="flex items-center space-x-2">
                                    <span 
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                      style={{ backgroundColor: top.color }}
                                    >
                                      {top.rank}
                                    </span>
                                    <span className={`text-xs font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                                      {top.name}
                                    </span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className={`text-xs font-black ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`}>
                                      {unitMode === 'tonnes' ? `${top.carbonTonnes} t` : `${top.carbonKg.toLocaleString()} kg`}
                                    </span>
                                    <span className={`ml-2 text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                      ({top.percentage}%)
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Impact Progress Meter */}
                                <div className="w-full h-2 rounded-full bg-slate-200/40 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ 
                                      width: `${top.percentage}%`,
                                      backgroundColor: top.color 
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic AI Decarbonization Recommendation Card */}
                        <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                          isLight 
                            ? 'bg-legacy-mint-10 border-legacy-mint-32'
                            : 'bg-legacy-forest-65 border-legacy-forest-17'
                        }`}>
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isLight ? 'bg-emerald-100 text-legacy-brand-strong' : 'bg-legacy-surface-raised text-legacy-green-400'
                          }`}>
                            <Lightbulb className="w-4 h-4 text-legacy-brand-base" />
                          </div>
                          <div className="space-y-1">
                            <div className={`text-xs font-bold font-sans ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                              AI Decarbonization Action Plan
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-legacy-forest-08' : 'text-legacy-emerald-200'}`}>
                              {activeMatrix.quickTip}
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* 9 Standard Categories Grid */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                            All 9 Activity & Invoiced Expense Categories
                          </h4>
                          <p className={`text-[11px] ${isLight ? 'text-legacy-forest-03' : 'text-legacy-text-muted'}`}>
                            Categorized under GHG Protocol Corporate Standard & Bangladesh DoE Emission Factors
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddCustomModalOpen(true)}
                          className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span className="text-white font-mono font-bold">Add Custom Line Item</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeMatrix.categories.map((cat) => {
                          const IconComp = cat.icon || Package;
                          return (
                            <div
                              key={cat.id}
                              className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                isLight 
                                  ? 'bg-white border-legacy-divider-light hover:border-legacy-brand-base/50 hover:shadow-sm'
                                  : 'bg-legacy-canvas-deep border-legacy-divider-base hover:border-legacy-brand-base/40'
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Top Row: Icon + Name + Scope Badge */}
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-2.5">
                                    <div 
                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                                      style={{ backgroundColor: cat.color }}
                                    >
                                      <IconComp className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="leading-tight">
                                      <div className={`text-xs font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                                        {cat.name}
                                      </div>
                                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-legacy-forest-56 text-emerald-300/80 border-legacy-forest-22'
                                      }`}>
                                        {cat.scope}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Refine / Adjust Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategory(cat)}
                                    title="Refine category values"
                                    className={`p-1.5 rounded-lg text-slate-400 hover:text-legacy-brand-base transition-colors cursor-pointer border ${
                                      isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-transparent hover:bg-legacy-forest-47'
                                    }`}
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Spend & Emissions Figures */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/10">
                                  <div>
                                    <span className={`text-[10px] font-mono uppercase ${isLight ? 'text-legacy-slate-500' : 'text-legacy-text-muted'}`}>
                                      Spend (BDT)
                                    </span>
                                    <div className={`text-xs font-bold font-mono ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                                      ৳ {cat.spendBdt.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[10px] font-mono uppercase ${isLight ? 'text-legacy-slate-500' : 'text-legacy-text-muted'}`}>
                                      Emissions
                                    </span>
                                    <div className={`text-xs font-bold font-mono ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`}>
                                      {unitMode === 'tonnes' ? `${cat.carbonTonnes} t` : `${cat.carbonKg.toLocaleString()} kg`}
                                    </div>
                                  </div>
                                </div>

                                {/* Percentage Bar */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Share</span>
                                    <span className="font-bold text-legacy-brand-base">{cat.percentage}%</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-slate-200/30 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${cat.percentage}%`,
                                        backgroundColor: cat.color 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Activity Volume Footer */}
                              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] font-mono ${
                                isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/40 text-slate-400'
                              }`}>
                                <span>Activity Qty</span>
                                <span className="font-bold">{cat.quantity.toLocaleString()} {cat.unit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Added Line Items Ledger (if any) */}
                    {customItems.length > 0 && (
                      <div className={`p-4 rounded-2xl border space-y-3 ${
                        isLight ? 'bg-legacy-mint-02 border-legacy-mint-25' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-legacy-brand-base" />
                            <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                              isLight ? 'text-legacy-forest-43' : 'text-white'
                            }`}>
                              Custom Invoiced Additions ({customItems.length})
                            </h4>
                          </div>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Live calculated into total footprint
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-sans text-xs">
                            <thead>
                              <tr className={`border-b text-[10px] uppercase font-mono ${
                                isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800'
                              }`}>
                                <th className="py-2">Description</th>
                                <th>Category</th>
                                <th>Scope</th>
                                <th>Spend (BDT)</th>
                                <th>Quantity</th>
                                <th>Emissions</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/40'}`}>
                              {customItems.map((item) => (
                                <tr key={item.id} className={isLight ? 'hover:bg-white' : 'hover:bg-legacy-surface-base'}>
                                  <td className={`py-2 font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                                    {item.name}
                                  </td>
                                  <td className="capitalize text-slate-400">
                                    {item.categoryId.replace('_', ' ')}
                                  </td>
                                  <td>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-legacy-brand-base border border-emerald-500/20">
                                      {item.scope}
                                    </span>
                                  </td>
                                  <td className="font-mono">
                                    ৳ {item.spendBdt.toLocaleString()}
                                  </td>
                                  <td className="font-mono text-slate-400">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="font-mono font-bold text-legacy-brand-base">
                                    +{unitMode === 'tonnes' ? (item.carbonKg / 1000).toFixed(3) : item.carbonKg.toLocaleString()} {unitMode === 'tonnes' ? 't' : 'kg'}
                                  </td>
                                  <td className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomItem(item.id)}
                                      className="p-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* STEP 3: Audit Assurance & Citation Traces View */}
                  <div className={`space-y-4 ${extractionStep === 3 ? 'block' : 'hidden'}`}>
                    {extractionResult ? (
                      <div className={`rounded-2xl p-5 space-y-3 border ${
                        isLight 
                          ? 'bg-legacy-mint-05 border-legacy-divider-light'
                          : 'bg-legacy-canvas-deep border-legacy-divider-base'
                      }`}>
                        <div className={`flex justify-between items-center pb-2 border-b ${
                          isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-legacy-brand-base" />
                            <span className={`font-sans font-bold text-xs ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                              Extraction Evidence — {extractionResult.filename}
                            </span>
                          </div>
                          <span className={`font-mono text-[10px] ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>
                            {extractionResult.overall_confidence == null ? 'Rule-based match (no model confidence)' : `Extraction-model confidence: ${Math.round(extractionResult.overall_confidence * 100)}%`} • Not verified
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-sans text-xs border-collapse">
                            <thead>
                              <tr className={`font-bold border-b text-[10px] uppercase tracking-wider ${
                                isLight ? 'text-legacy-forest-03 border-legacy-divider-light' : 'text-legacy-mint-38 border-legacy-forest-38'
                              }`}>
                                <th className="py-3 px-3 w-40 min-w-[130px]">Metric</th>
                                <th className="py-3 px-3 w-36 min-w-[120px]">Scope</th>
                                <th className="py-3 px-3 w-44 min-w-[140px]">Extracted Value</th>
                                <th className="py-3 px-3 w-28 min-w-[95px]">Source Page</th>
                                <th className="py-3 px-3 min-w-[260px]">Source Snippet</th>
                                <th className="py-3 px-3 w-28 min-w-[90px] text-right">Confidence</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLight ? 'divide-legacy-divider-light' : 'divide-legacy-forest-38'}`}>
                              {extractionResult.details && extractionResult.details.map((item, idx) => (
                                <tr key={idx} className={`transition-colors ${isLight ? 'hover:bg-white' : 'hover:bg-legacy-surface-base'}`}>
                                  <td className={`py-3 px-3 font-bold capitalize whitespace-nowrap ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                                    {item.param_name}
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap shadow-xs ${
                                      item.scope?.toLowerCase().includes('scope 1')
                                        ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
                                        : item.scope?.toLowerCase().includes('scope 2')
                                        ? isLight ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-legacy-teal-02 text-legacy-teal-400 border-legacy-teal-900'
                                        : isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-legacy-forest-48 text-legacy-green-300 border-legacy-forest-19'
                                    }`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0 opacity-80" />
                                      {item.scope}
                                    </span>
                                  </td>
                                  <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`}>
                                    {Number(item.value).toLocaleString()} {item.unit}
                                  </td>
                                  <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>
                                    Page {item.source_page || 1}
                                  </td>
                                  <td className={`py-3 px-3 text-[11px] italic max-w-[360px] truncate ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-34'}`} title={item.raw_snippet}>
                                    "{item.raw_snippet}"
                                  </td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                      isLight ? 'bg-legacy-positive-surface text-legacy-brand-strong border-legacy-positive-border' : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
                                    }`}>
                                      {item.confidence == null ? '—' : `${Math.round(item.confidence * 100)}%`}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                        isLight ? 'bg-legacy-mint-02 border-legacy-mint-25' : 'bg-legacy-canvas-deep border-legacy-divider-base'
                      }`}>
                        <ShieldCheck className="w-8 h-8 text-legacy-brand-base mx-auto" />
                        <div className={`text-sm font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          No Extracted Audit Traces Yet
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Ingest a document or click "Load Demo Sample (fictional)" to see extracted values with their source snippets.
                        </p>
                        <button
                          type="button"
                          onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
                          className="mt-2 text-xs font-mono font-bold px-4 py-2 rounded-xl bg-legacy-brand-base text-white hover:bg-legacy-brand-bright transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span className="text-white font-mono font-bold">Load Sample Document Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MODAL: ADD CUSTOM INVOICE ITEM */}
                  {isAddCustomModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 ${
                        isLight ? 'bg-white border-slate-200 text-legacy-forest-43' : 'bg-legacy-surface-base border-legacy-forest-22 text-white'
                      }`}>
                        <div className="flex justify-between items-center border-b pb-3">
                          <div className="flex items-center space-x-2">
                            <Plus className="w-5 h-5 text-legacy-brand-base" />
                            <h3 className="font-bold text-base font-sans">Add Custom Expense / Invoice Item</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddCustomModalOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleAddCustomItem} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Item / Expense Description
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Auxiliary Diesel for Factory Generator B"
                              value={newCustomItem.name}
                              onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                              }`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Category
                              </label>
                              <select
                                value={newCustomItem.categoryId}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, categoryId: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                                }`}
                              >
                                {NINE_CATEGORIES_CONFIG.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Scope Protocol
                              </label>
                              <select
                                value={newCustomItem.scope}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, scope: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                                }`}
                              >
                                <option value="Scope 1">Scope 1 (Direct)</option>
                                <option value="Scope 2">Scope 2 (Electricity)</option>
                                <option value="Scope 3">Scope 3 (Value Chain)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Invoiced Spend (BDT)
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 75000"
                                value={newCustomItem.spendBdt}
                                onChange={(e) => setNewCustomItem({ ...newCustomItem, spendBdt: e.target.value })}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                  isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                                Activity Quantity
                              </label>
                              <div className="flex space-x-1">
                                <input
                                  type="number"
                                  placeholder="e.g. 500"
                                  value={newCustomItem.quantity}
                                  onChange={(e) => setNewCustomItem({ ...newCustomItem, quantity: e.target.value })}
                                  className={`w-2/3 text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                                  }`}
                                />
                                <input
                                  type="text"
                                  placeholder="Units"
                                  value={newCustomItem.unit}
                                  onChange={(e) => setNewCustomItem({ ...newCustomItem, unit: e.target.value })}
                                  className={`w-1/3 text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Emission Factor (kg CO₂e per unit)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 2.68"
                              value={newCustomItem.factor}
                              onChange={(e) => setNewCustomItem({ ...newCustomItem, factor: e.target.value })}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                              }`}
                            />
                          </div>

                          {/* Preview Calculated CO2 */}
                          <div className={`p-3 rounded-xl border flex justify-between items-center ${
                            isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-legacy-forest-44 border-legacy-brand-base/30'
                          }`}>
                            <span className="text-xs font-bold font-sans">Calculated Added Impact:</span>
                            <span className="text-xs font-mono font-black text-legacy-brand-base">
                              +{(
                                (parseFloat(newCustomItem.quantity) || 0) > 0
                                  ? Math.round((parseFloat(newCustomItem.quantity) || 0) * (parseFloat(newCustomItem.factor) || 1))
                                  : Math.round((parseFloat(newCustomItem.spendBdt) || 0) * 0.065)
                              ).toLocaleString()} kg CO₂e
                            </span>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="submit"
                              className="flex-1 bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Add to Footprint Matrix
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddCustomModalOpen(false)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/40 text-slate-300 border-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* MODAL: REFINE CATEGORY ADJUSTMENT */}
                  {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                      <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-5 ${
                        isLight ? 'bg-white border-slate-200 text-legacy-forest-43' : 'bg-legacy-surface-base border-legacy-forest-22 text-white'
                      }`}>
                        <div className="flex justify-between items-center border-b pb-3">
                          <div className="flex items-center space-x-2">
                            <Sliders className="w-5 h-5 text-legacy-brand-base" />
                            <h3 className="font-bold text-base font-sans">
                              Refine {editingCategory.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Invoiced Spend (BDT)
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.spendBdt}
                              id="adjust-spend"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Emissions (kg CO₂e)
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.carbonKg}
                              id="adjust-kg"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-400">
                              Adjust Activity Quantity ({editingCategory.unit})
                            </label>
                            <input
                              type="number"
                              defaultValue={editingCategory.quantity}
                              id="adjust-qty"
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-legacy-brand-base ${
                                isLight ? 'bg-slate-50 border-slate-200 text-legacy-forest-43' : 'bg-legacy-canvas-deep border-legacy-divider-base text-white'
                              }`}
                            />
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const s = document.getElementById('adjust-spend').value;
                                const k = document.getElementById('adjust-kg').value;
                                const q = document.getElementById('adjust-qty').value;
                                handleSaveCategoryAdjustment(editingCategory.id, s, k, q);
                              }}
                              className="flex-1 bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Save Recalculation
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/40 text-slate-300 border-slate-700'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* Carbon Zero BD ESG Regulatory & Copilot (RAG Assistant Section)     */}
                  {/* ------------------------------------------------------------- */}
                  <div className={`border-t pt-6 space-y-4 ${isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                          isLight ? 'bg-legacy-positive-surface border-legacy-positive-border' : 'bg-legacy-surface-raised border-legacy-forest-11'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-legacy-brand-base" />
                        </div>
                        <h4 className={`font-sans font-bold text-sm ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                          Carbon Zero BD ESG Regulatory & Auditor Copilot
                        </h4>
                      </div>
                      
                      {/* Corpus Filter Tabs */}
                      <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
                        isLight ? 'bg-legacy-mint-08 border-legacy-divider-light' : 'bg-legacy-canvas-deep border-legacy-forest-26'
                      }`}>
                        {[
                          { id: 'all', label: 'All Corpora' },
                          { id: 'regulatory', label: 'Regulations (NDC/ECR)' },
                          { id: 'emission_factors', label: 'Emission Factors' },
                          { id: 'tenant_docs', label: 'Audit Statements' }
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setRagCorpus(c.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                              ragCorpus === c.id
                                ? isLight 
                                  ? 'bg-white text-legacy-brand-strong border border-legacy-positive-border shadow-xs'
                                  : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11 shadow-sm'
                                : isLight 
                                  ? 'text-legacy-forest-03 hover:text-legacy-forest-43 hover:bg-black/[0.03]'
                                  : 'text-legacy-mint-37 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Question Chips */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What is Bangladesh's official 2023 grid emission factor?",
                        "What are Bangladesh's updated NDC 2030 mitigation targets?",
                        "How does EU CBAM affect our manufacturing and export emissions?",
                        "What was the diesel generator fuel consumption in Q2 audit statement?"
                      ].map((promptText, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => executeRagQuery(promptText)}
                          className={`text-[11px] font-sans px-3 py-1.5 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer border ${
                            isLight 
                              ? 'bg-legacy-mint-13 hover:bg-legacy-mint-18 text-legacy-forest-43 border-legacy-mint-31'
                              : 'bg-legacy-forest-57 hover:bg-legacy-forest-39 text-legacy-mint-33 hover:text-white border-legacy-forest-24 hover:border-emerald-500/40'
                          }`}
                        >
                          <Search className={`w-3 h-3 shrink-0 ${isLight ? 'text-legacy-brand-strong' : 'text-emerald-400'}`} />
                          <span>{promptText}</span>
                        </button>
                      ))}
                    </div>

                    {/* Search / Ask AI Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); executeRagQuery(); } }}
                          placeholder="Ask anything about Bangladesh ESG laws, DoE emission factors, or audit evidence..."
                          className={`w-full text-xs font-sans p-3 pl-9 border rounded-xl focus:outline-none focus:border-legacy-brand-base transition-all ${
                            isLight 
                              ? 'bg-legacy-mint-05 border-legacy-mint-25 text-legacy-forest-43 placeholder-legacy-text-quiet'
                              : 'bg-legacy-canvas-deep border-legacy-forest-22 text-white placeholder-legacy-mint-42 focus:bg-legacy-forest-71'
                          }`}
                        />
                        <Search className={`w-4 h-4 absolute left-3 top-3.5 ${isLight ? 'text-legacy-text-quiet' : 'text-emerald-400/80'}`} />
                      </div>
                      <button
                        type="button"
                        onClick={() => executeRagQuery()}
                        disabled={isRagLoading || !ragQuery.trim()}
                        className="bg-legacy-brand-base hover:bg-legacy-brand-bright disabled:bg-legacy-forest-49 disabled:text-white/40 disabled:border disabled:border-legacy-forest-26 disabled:shadow-none disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-mono font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        {isRagLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-white" />
                            <span className="text-white font-mono font-bold">Ask Copilot</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* RAG Grounded Answer Output */}
                    {ragResponse && (
                      <div className={`rounded-2xl p-5 space-y-4 border ${
                        isLight 
                          ? 'bg-legacy-mint-06 border-legacy-mint-32'
                          : 'bg-legacy-forest-80 border-legacy-forest-11'
                      }`}>
                        <div className={`flex justify-between items-center pb-2 border-b ${
                          isLight ? 'border-legacy-positive-border' : 'border-legacy-forest-38'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                              isLight ? 'bg-white text-legacy-brand-strong border-legacy-mint-32' : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
                            }`}>
                              {ragResponse.model_used || "unknown"}
                            </span>
                            <span className={`font-sans font-bold text-xs ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>
                              {ragResponse.insufficient_data ? 'No answer available' : 'AI response with sources — not verified'}
                            </span>
                          </div>
                          <div className={`flex items-center space-x-2 font-mono text-[10px] ${
                            isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'
                          }`}>
                            <span>Retrieval similarity: {ragResponse.confidence == null ? '—' : `${Math.round(ragResponse.confidence * 100)}%`}</span>
                            <span>•</span>
                            <span>{ragResponse.latency_ms == null ? '—' : `${ragResponse.latency_ms}ms`}</span>
                          </div>
                        </div>

                        {/* Answer Text */}
                        <div className={`text-xs leading-relaxed font-sans whitespace-pre-line ${
                          isLight ? 'text-legacy-forest-43' : 'text-legacy-mint-26'
                        }`}>
                          {ragResponse.answer}
                        </div>

                        {/* Citations List */}
                        {ragResponse.citations && ragResponse.citations.length > 0 && (
                          <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-legacy-positive-border' : 'border-legacy-forest-38'}`}>
                            <div className={`text-[10px] font-mono uppercase font-bold flex items-center ${
                              isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'
                            }`}>
                              <Quote className="w-3 h-3 mr-1 text-legacy-brand-base" />
                              Verifiable Document Citations ({ragResponse.citations.length}):
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {ragResponse.citations.map((c, idx) => (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-xl space-y-1 border transition-colors ${
                                    isLight 
                                      ? 'bg-white border-legacy-mint-25 hover:border-legacy-brand-base'
                                      : 'bg-legacy-surface-base border-legacy-divider-base hover:border-legacy-forest-11'
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className={`font-mono font-bold truncate max-w-[200px] ${
                                      isLight ? 'text-legacy-forest-43' : 'text-white'
                                    }`} title={c.source}>
                                      📄 {c.source}
                                    </span>
                                    <span className={`font-mono font-semibold ${
                                      isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'
                                    }`}>
                                      Page {c.page || 1} • {Math.round((c.relevance_score || 0.9) * 100)}% Match
                                    </span>
                                  </div>
                                  <p className={`text-[11px] line-clamp-2 italic ${
                                    isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-37'
                                  }`}>
                                    "{c.snippet}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Company Projects List in Dashboard */}
                <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  <div className={`flex justify-between items-center pb-4 border-b mb-4 ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <div>
                      <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>Active Corporate Projects</h3>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-legacy-forest-03' : 'text-legacy-mint-38'}`}>District specific offsetting initiatives under CarbonZero monitoring.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddProjectOpen(true)}
                      className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-white stroke-[2.5]" />
                      <span className="text-white font-mono font-bold">New Project</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className={`font-bold border-b pb-2 text-[10px] uppercase ${
                          isLight ? 'text-legacy-text-quiet border-legacy-divider-light' : 'text-legacy-text-quiet border-legacy-forest-38'
                        }`}>
                          <th className="py-2.5">Project Name</th>
                          <th>Sector</th>
                          <th>Target (tCO2e/yr)</th>
                          <th>Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-legacy-divider-light' : 'divide-legacy-forest-38'}`}>
                        {projects.map(p => (
                          <tr key={p.id} className={`transition-colors ${isLight ? 'hover:bg-legacy-mint-05' : 'hover:bg-legacy-canvas-deep'}`}>
                            <td className={`py-3 font-bold ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>{p.name}</td>
                            <td className={isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}>{p.sector}</td>
                            <td className={`font-mono font-semibold ${isLight ? 'text-legacy-brand-strong' : 'text-legacy-green-400'}`}>{p.target} tCO2e</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'Verified' 
                                  ? isLight ? 'bg-legacy-positive-surface text-legacy-brand-strong border border-legacy-positive-border' : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11'
                                  : p.status === 'In Progress'
                                    ? isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : isLight ? 'bg-gray-100 text-gray-600' : 'bg-legacy-canvas-deep text-legacy-text-muted'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (Reminders, Offset and Team) */}
              <div className="space-y-8">
                
                {/* Offset Options Panel */}
                <div className={`p-6 rounded-3xl shadow-md flex flex-col justify-between h-[230px] border transition-all ${
                  isLight
                    ? 'bg-gradient-to-br from-legacy-positive-surface via-legacy-mint-23 to-legacy-mint-29 border-legacy-mint-35 text-legacy-forest-43'
                    : 'bg-gradient-to-br from-legacy-surface-raised via-legacy-forest-52 to-legacy-forest-64 border-legacy-forest-11 text-white'
                }`}>
                  <div className="space-y-2">
                    <div className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                      isLight ? 'text-legacy-brand-strong' : 'text-legacy-emerald-200'
                    }`}>EMISSIONS COMPENSATIONS</div>
                    <h3 className={`font-sans font-bold text-lg leading-tight ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>Offset Your Footprint</h3>
                    <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-legacy-forest-04' : 'text-white/70'}`}>
                      Purchase certified Bangladeshi carbon credits directly on our registry to mitigate your calculated corporate emissions debt.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/platform/marketplace')}
                    className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span className="text-white font-mono font-bold">Browse Marketplace</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Reminders / To-dos */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>Verification Tasks</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      isLight ? 'bg-legacy-positive-surface text-legacy-brand-strong border border-legacy-positive-border' : 'bg-legacy-surface-raised text-legacy-green-400 border border-legacy-forest-11'
                    }`}>
                      {openTasksCount} left
                    </span>
                  </div>
                  
                  <ul className="space-y-3 font-sans text-xs">
                    {tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTask(task.id)}
                            className={`mt-0.5 rounded text-legacy-brand-base focus:ring-legacy-brand-base cursor-pointer ${
                              isLight ? 'border-legacy-mint-25 bg-white' : 'border-legacy-forest-32 bg-legacy-canvas-deep'
                            }`} 
                          />
                          <span className={task.completed 
                            ? isLight ? "text-legacy-mint-40 line-through" : "text-legacy-text-quiet line-through"
                            : isLight ? "text-legacy-forest-43" : "text-legacy-mint-26"
                          }>
                            {task.text}
                          </span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className={`transition-colors hover:text-legacy-red-500 cursor-pointer ${
                          isLight ? 'text-legacy-mint-40' : 'text-legacy-text-quiet'
                        }`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setActiveMenu('Tasks')}
                    className="w-full bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer mt-3"
                  >
                    <span className="text-white font-mono font-bold">View All Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Team Members */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
                  isLight 
                    ? 'bg-white border-legacy-divider-light text-legacy-forest-43'
                    : 'bg-legacy-surface-base border-legacy-divider-base text-white'
                }`}>
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
                    isLight ? 'border-legacy-divider-light' : 'border-legacy-forest-38'
                  }`}>
                    <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>ESG Audit Team</h3>
                    <button 
                      onClick={() => setIsAddMemberOpen(true)}
                      className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3 text-white stroke-[2.5]" />
                      <span className="text-white font-mono font-bold">Add Member</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-7 h-7 rounded-full overflow-hidden border cursor-pointer ${
                            isLight ? 'bg-legacy-mint-05 border-legacy-mint-25' : 'bg-legacy-canvas-deep border-legacy-forest-11'
                          }`} onClick={() => toggleMemberStatus(member.name)}>
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" width="28" height="28" loading="lazy" />
                          </div>
                          <div className="text-left leading-none">
                            <div className={`font-sans font-bold text-xs ${isLight ? 'text-legacy-forest-43' : 'text-white'}`}>{member.name}</div>
                            <div className={`text-[9px] font-mono mt-0.5 ${isLight ? 'text-legacy-text-quiet' : 'text-legacy-text-muted'}`}>{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] border px-2 py-0.5 rounded uppercase font-bold ${
                            member.status === 'Active' 
                              ? isLight ? 'bg-legacy-positive-surface text-legacy-brand-strong border-legacy-positive-border' : 'bg-legacy-surface-raised text-legacy-green-400 border-legacy-forest-11'
                              : isLight ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-legacy-canvas-deep text-legacy-text-quiet border-legacy-forest-38'
                          }`}>
                            {member.status}
                          </span>
                          <button onClick={() => removeMember(member.name)} className={`hover:text-legacy-red-500 transition-colors cursor-pointer ${
                            isLight ? 'text-legacy-mint-40' : 'text-legacy-text-quiet'
                          }`}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* -------------------- TAB CONTENT: MATERIALITY -------------------- */}
        {activeMenu === 'Materiality' && (
          <div className="bg-legacy-surface-base border border-legacy-divider-base rounded-3xl p-6 lg:p-8 shadow-xl space-y-6 text-white">
            <div>
              <h1 className="font-sans font-bold text-3xl text-white">Double Materiality Assessment</h1>
              <p className="text-sm text-legacy-text-muted mt-1 font-sans">
                Identify and prioritize key ESG issues based on their Impact Materiality and Financial Materiality (CSRD/ESRS aligned).
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Matrix Plot (Visual Grid) */}
              <div className="xl:col-span-1 bg-legacy-canvas-deep rounded-2xl p-6 border border-legacy-divider-base flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-bold text-sm text-white mb-4">Double Materiality Matrix</h3>
                  <div className="relative w-full aspect-square bg-carbon border-l border-b border-forest grid grid-cols-5 grid-rows-5">
                    {/* Matrix Labels */}
                    <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 text-[9px] font-mono uppercase text-legacy-text-muted font-bold">Impact Materiality →</div>
                    <div className="absolute -left-14 top-1/2 transform -translate-y-1/2 rotate-90 text-[9px] font-mono uppercase text-legacy-text-muted font-bold">Financial Materiality →</div>
                    
                    {/* Materiality threshold line (dashed red) */}
                    <div className="absolute inset-0 border-t border-r border-dashed border-red-400 pointer-events-none" style={{ left: '40%', top: '40%' }}>
                      <span className="absolute right-2 top-2 text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider bg-legacy-canvas-deep/90 px-1 rounded">Material Threshold</span>
                    </div>

                    {/* Plotted Topics */}
                    {Object.entries(materialityScores).map(([key, topic]) => {
                      // Map 1-5 to percentage coordinates
                      const xPercent = (topic.impact - 0.5) * 20; 
                      const yPercent = (5.5 - topic.financial) * 20; // invert y for top-origin
                      
                      const isMaterial = topic.impact >= 3 && topic.financial >= 3;

                      return (
                        <div 
                          key={key}
                          className={`absolute w-4 h-4 rounded-full cursor-pointer flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-all hover:scale-125 ${
                            isMaterial ? 'bg-legacy-brand-base border-2 border-emerald-400' : 'bg-legacy-slate-700 border-2 border-legacy-forest-11'
                          }`}
                          style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                          title={`${topic.name} (Impact: ${topic.impact}, Financial: ${topic.financial})`}
                          onClick={() => showToast(`Selected: ${topic.name}. Impact: ${topic.impact}, Financial: ${topic.financial}`, "info")}
                        >
                          <span className="text-[7px] text-black font-bold">{topic.name.charAt(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[10px] text-legacy-text-muted mt-10 leading-relaxed font-sans">
                  * Dark green dots with emerald borders represent <span className="text-legacy-green-400 font-semibold">Material Topics</span> which exceed the ESRS threshold (≥ 3.0 on both dimensions) and must be included in your ESG disclosures.
                </div>
              </div>

              {/* Slider Controls */}
              <div className="xl:col-span-2 space-y-6">
                <h3 className="font-sans font-bold text-sm text-white border-b border-legacy-divider-base pb-2">Rate ESG Topics</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(materialityScores).map(([key, topic]) => (
                    <div key={key} className="p-4 bg-legacy-canvas-deep rounded-xl border border-legacy-divider-base space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-sans font-bold text-xs text-white">{topic.name}</h4>
                          <p className="text-[10px] text-legacy-text-muted mt-0.5 font-sans leading-relaxed">{topic.description}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          topic.impact >= 3 && topic.financial >= 3
                            ? 'bg-legacy-brand-base/20 text-legacy-green-400 border border-legacy-brand-base/30'
                            : 'bg-white/5 text-legacy-text-muted'
                        }`}>
                          {topic.impact >= 3 && topic.financial >= 3 ? 'Material' : 'Non-Material'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-legacy-text-muted font-mono">
                            <span>Impact Materiality</span>
                            <span className="font-bold text-legacy-green-400">{topic.impact} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.impact}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], impact: val }
                              }));
                            }}
                            className="w-full h-1 bg-legacy-divider-base rounded-lg appearance-none cursor-pointer accent-legacy-brand-base"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-legacy-text-muted font-mono">
                            <span>Financial Materiality</span>
                            <span className="font-bold text-legacy-green-400">{topic.financial} / 5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={topic.financial}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setMaterialityScores(prev => ({
                                ...prev,
                                [key]: { ...prev[key], financial: val }
                              }));
                            }}
                            className="w-full h-1 bg-legacy-divider-base rounded-lg appearance-none cursor-pointer accent-legacy-brand-base"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: AUDIT & COMPLIANCE -------------------- */}
        {activeMenu === 'Audit & Compliance' && (
          <VerificationReadinessCenter 
            activeClientId={activeClientId}
            isLight={isLight}
            locale={locale}
            currency={currency}
            showToast={showToast}
          />
        )}

        {/* -------------------- TAB CONTENT: TASKS -------------------- */}
        {activeMenu === 'Tasks' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">Verification Tasks</h1>
              <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Verify, audit, and log compliance steps to confirm climate metrics.</p>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 relative">
              <input 
                type="text" 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Type a new corporate ESG verification task..." 
                className="flex-1 px-4 py-3 border border-legacy-slate-200 rounded-xl text-xs font-sans placeholder-legacy-slate-400 focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
              />
              <button 
                type="submit" 
                className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                Add Task
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-3">
              {tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-xs text-legacy-slate-500">No matching verification tasks found.</div>
              ) : (
                tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3.5 border border-legacy-slate-100 rounded-xl hover:bg-legacy-surface-light-input transition-all">
                    <div className="flex items-center space-x-3.5">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="w-4.5 h-4.5 border-legacy-slate-200 rounded text-emerald focus:ring-emerald cursor-pointer"
                      />
                      <span className={`text-sm font-sans font-medium ${task.completed ? 'text-legacy-slate-400 line-through' : 'text-legacy-slate-800'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-legacy-slate-400 hover:text-legacy-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: CALENDAR -------------------- */}
        {activeMenu === 'Calendar' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">ESG Reporting Calendar</h1>
              <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Track verification schedules, third party audits, and offset purchases.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Calendar Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-sm text-legacy-ink-forest">June 2026</h3>
                  <div className="flex items-center space-x-1 text-xs text-legacy-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block"></span>
                    <span>Audit Events</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold">
                  {/* Days of week */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-legacy-slate-400 py-1">{day}</div>
                  ))}
                  
                  {/* Empty spaces for starting offset of June 2026 (Starts on Monday) */}
                  <div className="border border-transparent p-3"></div>
                  
                  {/* Days of month */}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const hasEvent = calendarEvents[day];
                    const isSelected = selectedCalendarDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => hasEvent && setSelectedCalendarDay(day)}
                        className={`border rounded-xl p-3 relative flex flex-col items-center justify-between font-mono font-bold aspect-square transition-all ${
                          isSelected 
                            ? 'bg-legacy-ink-forest border-legacy-ink-forest text-white shadow-md'
                            : 'border-legacy-slate-100 hover:bg-legacy-surface-light-input text-legacy-slate-800'
                        } ${hasEvent ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                      >
                        <span>{day}</span>
                        {hasEvent && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-legacy-green-400' : 'bg-legacy-emerald-500'}`}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event details panel */}
              <div className="bg-legacy-surface-light-input rounded-2xl p-6 border border-legacy-slate-200 space-y-4 h-fit">
                <h3 className="font-sans font-bold text-sm text-legacy-ink-forest border-b border-legacy-slate-200 pb-2">Event Schedule Details</h3>
                {selectedCalendarDay && calendarEvents[selectedCalendarDay] ? (
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <span className="text-[10px] text-legacy-slate-500 block font-mono">DATE</span>
                      <span className="font-bold text-legacy-ink-forest">June {selectedCalendarDay}, 2026</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-legacy-slate-500 block font-mono">AUDIT MISSION</span>
                      <span className="font-bold text-sm text-legacy-ink-forest block mt-0.5">{calendarEvents[selectedCalendarDay].title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-legacy-slate-500 block font-mono">ASSIGNED AUDITOR</span>
                      <span className="font-semibold text-emerald">{calendarEvents[selectedCalendarDay].auditor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-legacy-slate-500 block font-mono">SCHEDULED TIME</span>
                      <span className="font-mono font-bold text-legacy-slate-800">{calendarEvents[selectedCalendarDay].time}</span>
                    </div>
                    <button 
                      onClick={() => showToast(`Report for "${calendarEvents[selectedCalendarDay].title}" requested.`, "success")}
                      className="w-full bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-sm block text-center cursor-pointer"
                    >
                      Request Audit Dossier
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-legacy-slate-500">Click on any highlighted date in the calendar to view its ESG audit logs.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: ANALYTICS -------------------- */}
        {activeMenu === 'Analytics' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">Emissions Analytics</h1>
              <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Deep dive into corporate footprint breakdown per GHG Protocol Scopes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-legacy-slate-200 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-legacy-slate-500">Carbon Intensity Score</span>
                <div className="text-2xl font-sans font-bold text-legacy-ink-forest">0.18 <span className="text-xs text-legacy-slate-500">tCO2e/person</span></div>
                <p className="text-[10px] text-legacy-slate-500">Average monthly emissions calculated per corporate employee.</p>
              </div>
              <div className="border border-legacy-slate-200 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-legacy-slate-500">Revenue Intensity</span>
                <div className="text-2xl font-sans font-bold text-legacy-ink-forest">1.24 <span className="text-xs text-legacy-slate-500">kgCO2e/৳</span></div>
                <p className="text-[10px] text-legacy-slate-500">Carbon dioxide generated per Taka generated in business activity.</p>
              </div>
              <div className="border border-legacy-slate-200 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-legacy-slate-500">Energy Efficiency</span>
                <div className="text-2xl font-sans font-bold text-emerald">Grade A+</div>
                <p className="text-[10px] text-legacy-slate-500">Optimized power grid usage vs average Bangladeshi manufacturing.</p>
              </div>
            </div>

            {/* Scope Visual Progress Bars */}
            <div className="space-y-5 border-t border-legacy-slate-100 pt-6">
              <h3 className="font-sans font-bold text-base text-legacy-ink-forest">Scope Distribution</h3>
              
              <div className="space-y-4">
                {/* Scope 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-legacy-ink-forest">Scope 1 (Direct Fuel Burning)</span>
                    <span className="font-mono font-semibold text-amber">{results.scope1} tCO2e ({results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-legacy-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope1 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-legacy-ink-forest">Scope 2 (Electricity Consumption)</span>
                    <span className="font-mono font-semibold text-emerald">{results.scope2} tCO2e ({results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-legacy-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope2 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-legacy-ink-forest">Scope 3 (Supply Chain & Business travel)</span>
                    <span className="font-mono font-semibold text-purple-600">{results.scope3} tCO2e ({results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-legacy-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope3 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Breakdown Grid */}
            <div className="border-t border-legacy-slate-100 pt-6 space-y-4">
              <h3 className="font-sans font-bold text-base text-legacy-ink-forest">Activity Emission Logs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div className="p-3 bg-legacy-surface-light-input rounded-xl">
                  <span className="text-legacy-slate-500 block mb-1">Diesel</span>
                  <span className="font-bold font-mono text-legacy-ink-forest">{((parseFloat(inputs.diesel) || 0) * ef.diesel / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-legacy-surface-light-input rounded-xl">
                  <span className="text-legacy-slate-500 block mb-1">Petrol</span>
                  <span className="font-bold font-mono text-legacy-ink-forest">{((parseFloat(inputs.petrol) || 0) * ef.petrol / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-legacy-surface-light-input rounded-xl">
                  <span className="text-legacy-slate-500 block mb-1">LPG Gas</span>
                  <span className="font-bold font-mono text-legacy-ink-forest">{((parseFloat(inputs.lpg) || 0) * ef.lpg / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-legacy-surface-light-input rounded-xl">
                  <span className="text-legacy-slate-500 block mb-1">Electricity</span>
                  <span className="font-bold font-mono text-legacy-ink-forest">{((parseFloat(inputs.electricity) || 0) * ef.electricity / 1000).toFixed(2)} tCO2e</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* -------------------- TAB CONTENT: TEAM -------------------- */}
        {activeMenu === 'Team' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">ESG Audit Team</h1>
                <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Manage corporate accounts, permissions, and verifiers.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span className="text-white font-mono font-bold">Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase())).map((member, i) => (
                <div key={i} className="border border-legacy-slate-200 rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
                  <button 
                    onClick={() => removeMember(member.name)}
                    className="absolute top-4 right-4 text-legacy-slate-400 hover:text-legacy-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald/20">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" width="48" height="48" loading="lazy" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-legacy-ink-forest">{member.name}</h4>
                      <p className="text-xs text-legacy-slate-500">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-legacy-slate-100 pt-3 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-legacy-slate-500">Email:</span>
                      <span className="font-mono text-legacy-ink-forest">{member.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-legacy-slate-500">Access:</span>
                      <span className="font-bold text-legacy-ink-forest">{member.permission}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-legacy-slate-500">Status:</span>
                      <button 
                        onClick={() => toggleMemberStatus(member.name)}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          member.status === 'Active' 
                            ? 'bg-emerald/10 text-emerald border-emerald/20' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {member.status}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT: SETTINGS -------------------- */}
        {activeMenu === 'Settings' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">ESG Parameter Settings</h1>
              <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Configure GHG Protocol emission factors and reduction targets.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Target configurations */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-base text-legacy-ink-forest border-b border-legacy-slate-100 pb-2">Target Metrics</h3>
                <div>
                  <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Corporate Reduction Target (%)</label>
                  <input 
                    type="number"
                    value={reductionTarget}
                    onChange={(e) => setReductionTarget(e.target.value)}
                    className="w-full max-w-xs text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  />
                  <p className="text-[10px] text-legacy-slate-500 mt-1">This configures the target carbon footprint reduction card on the dashboard.</p>
                </div>
              </div>

              {/* Emission Factors grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-legacy-slate-100 pb-2">
                  <h3 className="font-sans font-bold text-base text-legacy-ink-forest">GHG Emission Factors (EF)</h3>
                  <button
                    type="button"
                    onClick={syncOfficialFactors}
                    disabled={isSyncingFactors}
                    className="text-xs font-mono font-bold px-3.5 py-2 rounded-xl bg-legacy-brand-base text-white hover:bg-legacy-brand-bright flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncingFactors ? 'animate-spin' : ''}`} />
                    <span className="text-white font-mono font-bold">Sync with Official DoE / IPCC RAG Registry</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Diesel (kg CO₂e/L)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.diesel}
                      onChange={(e) => setEf({ ...ef, diesel: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Petrol (kg CO₂e/L)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.petrol}
                      onChange={(e) => setEf({ ...ef, petrol: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">LPG Gas (kg CO₂e/kg)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.lpg}
                      onChange={(e) => setEf({ ...ef, lpg: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Grid Power (kg CO₂e/kWh)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.electricity}
                      onChange={(e) => setEf({ ...ef, electricity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Commute (tCO₂e/emp/yr)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.employees}
                      onChange={(e) => setEf({ ...ef, employees: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legacy-slate-500 uppercase mb-1">Air Travel (kg CO₂e/km)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={ef.airTravel}
                      onChange={(e) => setEf({ ...ef, airTravel: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="bg-legacy-ink-forest hover:bg-legacy-forest-15 text-white font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
              >
                Save Settings
              </button>

            </form>
          </div>
        )}

        {/* -------------------- TAB CONTENT: HELP -------------------- */}
        {activeMenu === 'Help' && (
          <div className="bg-white border border-legacy-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-legacy-ink-forest">FAQ & GHG Guidelines</h1>
              <p className="text-sm text-legacy-slate-500 mt-1 font-sans">Understand Scope definitions and carbon tracking calculations.</p>
            </div>

            {/* Accordion */}
            <div className="space-y-4 border-t border-legacy-slate-100 pt-4">
              {[
                {
                  q: "What is Scope 1 Direct Emissions?",
                  a: "Scope 1 emissions are direct greenhouse gas emissions from sources that are owned or controlled by the company. Examples include emissions from combustion in owned boilers, diesel generators, furnaces, and corporate vehicles."
                },
                {
                  q: "What is Scope 2 Indirect Electricity Emissions?",
                  a: "Scope 2 accounts for greenhouse gas emissions from the generation of purchased electricity, steam, heating, and cooling consumed by the reporting company. In Bangladesh, grid electricity factors average around 0.55 kgCO2e/kWh due to natural gas power station footprints."
                },
                {
                  q: "What is Scope 3 Value Chain Emissions?",
                  a: "Scope 3 emissions are a consequence of the activities of the company, but occur from sources not owned or controlled by it. Examples include employee business commutes, supplier raw material logistics (plastic, glass), and third party flights."
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-legacy-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-4 bg-legacy-surface-light-input text-left text-xs font-sans font-bold text-legacy-ink-forest"
                  >
                    <span>{item.q}</span>
                    {faqOpen[idx] ? <ChevronUp className="w-4 h-4 text-legacy-slate-400" /> : <ChevronDown className="w-4 h-4 text-legacy-slate-400" />}
                  </button>
                  {faqOpen[idx] && (
                    <div className="p-4 bg-white border-t border-legacy-slate-200 text-xs font-sans text-legacy-slate-500 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="border-t border-legacy-slate-100 pt-6 space-y-4">
              <h3 className="font-sans font-bold text-sm text-legacy-ink-forest">Need help with auditing?</h3>
              <p className="text-xs text-legacy-slate-500 font-sans">Our certified ESG specialists are available to review your corporate data streams.</p>
              <button 
                onClick={() => showToast("A support request has been sent. An ESG auditor will reach out soon.", "success")}
                className="bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Consult Carbon Zero BD Specialists
              </button>
            </div>

          </div>
        )}

        {/* -------------------- ENTERPRISE CORE STUDIOS -------------------- */}
        {activeMenu === 'DuckDB Engine' && (
          <DuckDBEngineView 
            isLight={isLight} 
            locale={locale} 
            currency={currency}
            activityInputs={inputs}
            activityResults={results}
            onRecalculate={() => calculateEmissions(inputs, ef)}
          />
        )}

        {activeMenu === 'Utility Invoices' && (
          <UniversalUtilityExtractor 
            isLight={isLight} 
            locale={locale} 
            activeClientId={activeClientId}
            onApplyToLedger={(extractedData) => {
              showToast(
                lang === 'bn'
                  ? `ইউটিলিটি লেজার আপডেট সম্পন্ন: ${extractedData.segments?.length || 0} টি সেগমেন্ট অন্তর্ভুক্ত`
                  : `Universal utility ledger updated: ${extractedData.segments?.length || 0} segments committed with SHA-256 seal.`, 
                "success"
              );
            }}
          />
        )}

        {activeMenu === 'Satellite MRV' && (
          <SatelliteMRVStudio isLight={isLight} locale={locale} />
        )}

        {activeMenu === 'Factor Registry' && (
          <FactorRegistryStudio isLight={isLight} locale={locale} />
        )}

        {activeMenu === 'ATLAS Benchmark' && (
          <AtlasBenchmarkStudio isLight={isLight} locale={locale} />
        )}

        {activeMenu === 'Entity Tree' && (
          <ConglomerateTreeStudio isLight={isLight} locale={locale} />
        )}

        {activeMenu === 'Activity & Evidence' && (
          <ActivityEvidenceWorkspace 
            activeClientId={activeClientId}
            isLight={isLight}
            locale={locale}
            currency={currency}
            showToast={showToast}
          />
        )}

        {activeMenu === 'ESG Reports' && (
          <EsgReportGenerator 
            activeClientId={activeClientId}
            isLight={isLight}
            locale={locale}
            currency={currency}
            showToast={showToast}
          />
        )}

      </main>

      {/* -------------------- CORPORATE CLIENT WORKSPACE SWITCHER MODAL -------------------- */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
          <div className={`max-w-3xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border transition-all my-8 ${
            isLight ? 'bg-white border-legacy-mint-24 text-legacy-forest-43' : 'bg-legacy-surface-base border-legacy-divider-base text-white'
          }`}>
            <button 
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-legacy-brand-base font-bold">
                <Building className="w-4 h-4" />
                <span>Multi-Tenant Corporate ESG Registry</span>
              </div>
              <h3 className="font-sans font-bold text-xl sm:text-2xl mt-1">
                Select Client Workspace Profile
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                Seamlessly switch between our enterprise clients to inspect dedicated operational baselines, registered facilities, assigned ESG audit officers, and multi-segment utility invoices.
              </p>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {CLIENT_PROFILES.map((client) => {
                const isSelected = client.id === activeClientId;
                return (
                  <div
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                      isSelected
                        ? 'border-legacy-brand-base bg-legacy-brand-base/10 shadow-[0_0_20px_rgba(0,200,83,0.15)]'
                        : (isLight 
                            ? 'bg-legacy-mint-02 border-legacy-divider-light hover:border-legacy-brand-base/50 hover:bg-white'
                            : 'bg-legacy-forest-56 border-legacy-divider-base hover:border-legacy-brand-base/40 hover:bg-legacy-forest-46')
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`h-12 px-3 py-1 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0 min-w-[80px] max-w-[100px] ${
                          client.logoTheme === 'dark'
                            ? 'bg-legacy-forest-73 border border-legacy-forest-25 ring-1 ring-emerald-500/20'
                            : 'bg-white border border-slate-200'
                        }`}>
                          <img 
                            src={client.logo} 
                            alt={client.name} 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-legacy-brand-base/20 text-legacy-brand-base font-bold">
                            {client.sector}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-mono font-bold text-legacy-brand-base flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active Workspace
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-sans font-bold text-sm leading-snug group-hover:text-legacy-brand-base transition-colors">
                        {client.name}
                      </h4>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {client.legalName}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {client.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <div className="text-gray-400">
                        Auditor: <span className="text-gray-300 font-bold">{client.assignedAuditor?.name?.split(' ')[0]} {client.assignedAuditor?.name?.split(' ')[1]}</span>
                      </div>
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-legacy-brand-base hover:underline flex items-center space-x-1"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/10 text-xs text-gray-400 font-mono">
              <span>{CLIENT_PROFILES.length} enterprise clients active in Bangladesh</span>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADD PROJECT MODAL DIALOG -------------------- */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-legacy-slate-200">
            <button 
              onClick={() => setIsAddProjectOpen(false)}
              className="absolute top-4 right-4 text-legacy-slate-400 hover:text-legacy-ink-forest"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-legacy-ink-forest flex items-center">
                <Building className="w-5 h-5 text-emerald mr-2" />
                Add Corporate Project
              </h3>
              <p className="text-xs text-legacy-slate-500 mt-0.5">Register a regional emission monitoring offset project.</p>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Chittagong Mangrove Restoration" 
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Project Sector</label>
                <select 
                  value={newProject.sector}
                  onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input cursor-pointer"
                >
                  <option value="Solar Irrigation">Solar Irrigation</option>
                  <option value="Rice Methane">Rice Methane</option>
                  <option value="Clean Cookstoves">Clean Cookstoves</option>
                  <option value="Waste-To-Energy">Waste-To-Energy</option>
                  <option value="Mangrove Carbon">Mangrove Carbon</option>
                  <option value="Brick Kilns">Brick Kilns</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Annual Emission reduction Target (tCO2e/yr)</label>
                <input 
                  type="number" 
                  value={newProject.target}
                  onChange={(e) => setNewProject({ ...newProject, target: e.target.value })}
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Add Project
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddProjectOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- ADD MEMBER MODAL DIALOG -------------------- */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-legacy-slate-200">
            <button 
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-4 right-4 text-legacy-slate-400 hover:text-legacy-ink-forest"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-legacy-ink-forest flex items-center">
                <Users className="w-5 h-5 text-emerald mr-2" />
                Add ESG Team Member
              </h3>
              <p className="text-xs text-legacy-slate-500 mt-0.5">Invite a member to collaborate on corporate emissions data.</p>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Rafiqul Islam" 
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. rafiqul@carbonzero.io" 
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Role / Job Title</label>
                <input 
                  type="text" 
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="e.g. ESG Auditor" 
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-legacy-slate-500 mb-1">Permission Level</label>
                <select 
                  value={newMember.permission}
                  onChange={(e) => setNewMember({ ...newMember, permission: e.target.value })}
                  className="w-full p-2 border border-legacy-slate-200 rounded-lg focus:outline-none focus:border-legacy-ink-forest bg-legacy-surface-light-input cursor-pointer"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Editor">Editor (Read/Write)</option>
                  <option value="Auditor">Auditor (Verify Only)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-legacy-brand-base hover:bg-legacy-brand-bright text-white font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Invite Member
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SaaSDashboard;
