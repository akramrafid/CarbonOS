import { 
  Utensils, 
  Car, 
  Zap, 
  Shirt, 
  ShoppingBag, 
  Home, 
  Film, 
  HeartPulse, 
  Package 
} from 'lucide-react';

export const NINE_CATEGORIES_CONFIG = [
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

export const computeCategoryMatrix = (rawParams = {}, customAddedItems = [], adjustments = {}, gridFactor = null) => {
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

  Object.keys(adjustments).forEach(catId => {
    if (baseValues[catId]) {
      if (adjustments[catId].spend !== undefined) baseValues[catId].spend = adjustments[catId].spend;
      if (adjustments[catId].kg !== undefined) baseValues[catId].kg = adjustments[catId].kg;
      if (adjustments[catId].qty !== undefined) baseValues[catId].qty = adjustments[catId].qty;
    }
  });

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
