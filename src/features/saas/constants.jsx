import React, { useState } from 'react';
import { 
  Utensils, 
  Car, 
  Zap, 
  Shirt, 
  ShoppingBag, 
  Home, 
  Film, 
  HeartPulse, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

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
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="50%" stopColor="#00C853" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={isLight ? '#E8ECE8' : '#152B1D'}
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
          <div className="w-8 h-8 rounded-full bg-[#00C853]/15 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
            <Leaf className="w-4 h-4 text-[#00C853]" />
          </div>
        ) : (
          <>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
              {label}
            </span>
            <span className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight leading-none my-0.5 ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              {score}
            </span>
            <span className={`text-[9px] font-sans font-medium ${isLight ? 'text-[#557361]' : 'text-[#7C9A88]'}`}>
              {sublabel}
            </span>
          </>
        )}
      </div>

      {badgeText && (
        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-sans font-semibold border ${
          isLight ? 'bg-[#F4F6F4] text-[#0F2417] border-[#E8ECE8]' : 'bg-[#040906] text-[#A7F3D0] border-[#1B4D2E]'
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

// 3. Wide Emissions Trend Chart (Smooth Spline Area Chart) - Dynamically calculated from annual total
const EmissionsTrendChart = ({ isLight = false, total = 2450 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Seasonal weights reflect localized energy demand (summer AC/grid strain peak in May-Aug)
  const seasonalWeights = [0.88, 0.82, 0.94, 1.06, 1.18, 1.25, 1.16, 1.10, 1.02, 0.94, 0.86, 0.82];
  const safeTotal = Math.max(12, parseFloat(total) || 2450);
  const avgMonthly = safeTotal / 12;

  const rawValues = seasonalWeights.map(w => Math.round(avgMonthly * w));
  const maxVal = Math.max(...rawValues, 10) * 1.15;
  const minVal = Math.max(0, Math.min(...rawValues) * 0.7);
  const range = maxVal - minVal || 1;

  const actualPoints = months.map((month, idx) => {
    const x = 45 + idx * 49;
    const val = rawValues[idx];
    const y = 140 - ((val - minVal) / range) * 105;
    return { x, y: Math.max(28, Math.min(140, y)), val, month };
  });

  const targetPoints = months.map((_, idx) => {
    const x = 45 + idx * 49;
    const targetVal = avgMonthly * (1.10 - 0.025 * idx);
    const y = 140 - ((targetVal - minVal) / range) * 105;
    return { x, y: Math.max(28, Math.min(140, y)) };
  });

  const actualCurve = getSplinePath(actualPoints);
  const targetCurve = getSplinePath(targetPoints);
  const areaPath = `${actualCurve} L 585 140 L 45 140 Z`;

  const gridTicks = [
    { label: Math.round(maxVal).toString(), y: 35 },
    { label: Math.round(minVal + range * 0.66).toString(), y: 70 },
    { label: Math.round(minVal + range * 0.33).toString(), y: 105 },
    { label: Math.round(minVal).toString(), y: 140 }
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {hoveredPoint && (
        <div 
          className={`absolute -top-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md border pointer-events-none transform -translate-x-1/2 transition-transform duration-150 ${
            isLight 
              ? 'bg-white text-[#0F2417] border-[#E8ECE8]' 
              : 'bg-[#0D2B1A] text-[#4ADE80] border-[#1B4D2E]'
          }`}
          style={{ left: `${(hoveredPoint.x / 620) * 100}%` }}
        >
          {hoveredPoint.month}: {hoveredPoint.val.toLocaleString()} tCO₂e
        </div>
      )}

      <svg viewBox="0 0 620 170" className="w-full h-auto overflow-visible select-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="emissionsSplineArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00C853" stopOpacity={isLight ? 0.35 : 0.45} />
            <stop offset="50%" stopColor="#00E676" stopOpacity={isLight ? 0.15 : 0.20} />
            <stop offset="100%" stopColor="#00C853" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Y Gridlines and Ticks */}
        {gridTicks.map((grid, idx) => (
          <g key={idx}>
            <text 
              x="8" 
              y={grid.y + 3} 
              fill={isLight ? '#8BA192' : '#557361'} 
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
              stroke={isLight ? '#E5ECE5' : '#122418'} 
              strokeDasharray="3 3" 
              strokeWidth="1" 
            />
          </g>
        ))}

        {/* Target baseline curve */}
        <path
          d={targetCurve}
          fill="none"
          stroke={isLight ? '#7C9A88' : '#385443'}
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
          stroke="#00C853"
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
              fill={isLight ? '#557361' : '#7C9A88'}
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
              fill={hoveredPoint?.month === pt.month ? '#00E676' : '#00C853'}
              stroke={isLight ? '#FFFFFF' : '#040906'}
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
                ? 'bg-[#00C853] shadow-[0_0_6px_rgba(0,200,83,0.3)]'
                : isLight
                  ? 'bg-[#E5ECE5]'
                  : 'bg-[#152B1D]'
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
                ? 'bg-[#00C853] shadow-[0_0_8px_rgba(0,200,83,0.35)]'
                : isLight
                  ? 'bg-[#E2ECE2]'
                  : 'bg-[#173020]'
            }`}
            style={{ height: bar.height }}
          />
          <span className={`text-[8.5px] font-mono ${isLight ? 'text-[#7C9A88]' : 'text-[#557361]'}`}>
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
      <div className="w-8 h-1 rounded-full bg-[#00C853]" />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-[#E2ECE2]' : 'bg-[#173020]'}`} />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-[#E2ECE2]' : 'bg-[#173020]'}`} />
      <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-[#E2ECE2]' : 'bg-[#173020]'}`} />
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
  { id: 'food_groceries', name: 'Food & Groceries', icon: Utensils, color: '#F59E0B', defaultScope: 'Scope 3', defaultUnit: 'Staff Meals', defaultFactor: 2.40 },
  { id: 'transport', name: 'Transport', icon: Car, color: '#00E5FF', defaultScope: 'Scope 1 & 3', defaultUnit: 'Liters / T-Km', defaultFactor: 2.31 },
  { id: 'electricity_energy', name: 'Electricity & Energy', icon: Zap, color: '#00C853', defaultScope: 'Scope 2 & 1', defaultUnit: 'kWh & Gen-Liters', defaultFactor: null },
  { id: 'clothing_footwear', name: 'Clothing & Footwear', icon: Shirt, color: '#EC4899', defaultScope: 'Scope 3', defaultUnit: 'PPE Garments', defaultFactor: 8.50 },
  { id: 'shopping_products', name: 'Shopping & Products', icon: ShoppingBag, color: '#A855F7', defaultScope: 'Scope 3', defaultUnit: 'Metric Tons Inputs', defaultFactor: 2500.0 },
  { id: 'housing_rent', name: 'Housing & Rent', icon: Home, color: '#3B82F6', defaultScope: 'Scope 1 & 2', defaultUnit: 'Facility m²', defaultFactor: 0.35 },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: '#F97316', defaultScope: 'Scope 3', defaultUnit: 'Hospitality Events', defaultFactor: 0.11 },
  { id: 'health_care', name: 'Health & Personal Care', icon: HeartPulse, color: '#10B981', defaultScope: 'Scope 3', defaultUnit: 'Medical Supplies', defaultFactor: 3.80 },
  { id: 'others', name: 'Others', icon: Package, color: '#94A3B8', defaultScope: 'Scope 3', defaultUnit: 'Ancillary Services', defaultFactor: 0.22 },
];

const computeCategoryMatrix = (rawParams = {}, customAddedItems = [], adjustments = {}, gridFactor = null) => {
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

  // 3. Electricity & Energy. No default grid factor: grid kWh carry emissions only once an approved
  // grid-average factor (location-based Scope 2) is entered.
  const gridKg = gridFactor == null ? 0 : electricity * gridFactor;
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
  const facGridKg = (electricity > 0 ? (gridFactor == null ? 0 : electricity * 0.08 * gridFactor) : 450);
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
            stroke={isLight ? "#E2E8F0" : "#0D2214"}
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
            isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'
          }`}>
            Total Footprint
          </span>
          <span className={`font-mono font-black text-lg sm:text-xl leading-tight ${
            isLight ? 'text-[#00873E]' : 'text-[#00E676]'
          }`}>
            {unitMode === 'tonnes' ? `${totalTonnes.toLocaleString()} t` : `${totalKg.toLocaleString()} kg`}
          </span>
          <span className={`text-[9px] font-semibold ${isLight ? 'text-[#64748B]' : 'text-emerald-300/60'}`}>
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
                  ? (isLight ? 'bg-emerald-50/80 border-emerald-300 scale-[1.02]' : 'bg-[#0E2616] border-[#00C853]/40 scale-[1.02]') 
                  : (isLight ? 'bg-[#F8FAFC] border-transparent hover:border-slate-200' : 'bg-[#061009]/60 border-transparent hover:border-[#152B1D]')
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <div className="truncate text-left leading-tight min-w-0">
                <div className={`text-[11px] font-bold truncate ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                  {slice.name}
                </div>
                <div className={`text-[10px] font-mono ${isLight ? 'text-[#41634E]' : 'text-[#9EBFAB]'}`}>
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


export {
  SemiCircularGauge,
  getSplinePath,
  EmissionsTrendChart,
  SegmentedProgressBar,
  MicroBarChart,
  CarouselIndicator,
  BANGLADESH_DISTRICTS,
  NINE_CATEGORIES_CONFIG,
  computeCategoryMatrix,
  CarbonDistributionDonut
};
