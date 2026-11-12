import { useState, useEffect } from 'react';
import { calculateESGMetrics } from '../../../pages/platform/esgMetricsCalculator';
import { computeCategoryMatrix } from '../constants';

export const useSaaSEmissionsCalculator = (activeClient, showToast) => {
  // Calculator inputs state
  const [inputs, setInputs] = useState(() => ({
    diesel: activeClient?.baselineInputs?.diesel || '2200',
    petrol: activeClient?.baselineInputs?.petrol || '1400',
    lpg: activeClient?.baselineInputs?.lpg || '800',
    electricity: activeClient?.baselineInputs?.electricity || '96000',
    employees: activeClient?.baselineInputs?.employees || '420',
    airTravel: activeClient?.baselineInputs?.airTravel || '34000',
    truckTransport: activeClient?.baselineInputs?.truckTransport || '14000',
    rawMaterials: activeClient?.baselineInputs?.rawMaterials || '120'
  }));

  // GHG Protocol Emission Factors state
  const [ef, setEf] = useState({
    diesel: 2.68,
    petrol: 2.31,
    lpg: 2.98,
    electricity: null,
    employees: 0.40,
    airTravel: 0.12,
    truckTransport: 0.20,
    rawMaterials: 2.50
  });

  // Calculation results state
  const [results, setResults] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  // Multi-Category Invoice Footprint & Custom Items
  const [unitMode, setUnitMode] = useState('tonnes');
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

  const calculateEmissions = (vals, factors = ef) => {
    const dVal = parseFloat(vals.diesel) || 0;
    const pVal = parseFloat(vals.petrol) || 0;
    const lVal = parseFloat(vals.lpg) || 0;
    const eVal = parseFloat(vals.electricity) || 0;
    const empVal = parseFloat(vals.employees) || 0;
    const airVal = parseFloat(vals.airTravel) || 0;
    const truckVal = parseFloat(vals.truckTransport) || 0;
    const rawVal = parseFloat(vals.rawMaterials) || 0;

    const scope1 = ((dVal * factors.diesel) + (pVal * factors.petrol) + (lVal * factors.lpg)) / 1000;
    const scope2Missing = eVal > 0 && factors.electricity == null;
    const scope2 = scope2Missing ? null : (eVal * (factors.electricity || 0)) / 1000;
    const scope2Market = scope2;
    const scope3 = (empVal * factors.employees) + 
                   ((airVal * factors.airTravel) / 1000) + 
                   ((truckVal * factors.truckTransport) / 1000) + 
                   (rawVal * factors.rawMaterials);

    const total = scope1 + (scope2 ?? 0) + scope3;
    const totalMarket = scope1 + (scope2Market ?? 0) + scope3;

    setResults({
      scope1: parseFloat(scope1.toFixed(2)),
      scope2: scope2 === null ? null : parseFloat(scope2.toFixed(2)),
      scope2Missing,
      scope2Market: scope2Market === null ? null : parseFloat(scope2Market.toFixed(2)),
      scope3: parseFloat(scope3.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMarket: parseFloat(totalMarket.toFixed(2))
    });
  };

  const esgMetrics = calculateESGMetrics(results, inputs, ef, activeClient, 0.12);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    calculateEmissions(inputs, ef);
  }, [inputs, ef]);

  const clearCalculator = () => {
    setInputs({
      diesel: '',
      petrol: '',
      lpg: '',
      electricity: '',
      employees: '',
      airTravel: '',
      truckTransport: '',
      rawMaterials: ''
    });
    showToast("Calculator inputs cleared.", "info");
  };

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

  return {
    inputs,
    setInputs,
    ef,
    setEf,
    results,
    setResults,
    calculateEmissions,
    esgMetrics,
    handleInputChange,
    clearCalculator,
    unitMode,
    setUnitMode,
    customItems,
    setCustomItems,
    isAddCustomModalOpen,
    setIsAddCustomModalOpen,
    newCustomItem,
    setNewCustomItem,
    editingCategory,
    setEditingCategory,
    categoryAdjustments,
    setCategoryAdjustments,
    donutHoveredId,
    setDonutHoveredId,
    handleAddCustomItem,
    handleDeleteCustomItem,
    handleSaveCategoryAdjustment
  };
};
