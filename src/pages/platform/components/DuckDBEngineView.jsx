import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  Zap, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
  Server
} from 'lucide-react';

const EEIO_SECTOR_DEFAULTS = {
  textiles_yarn: 15000000,     // 1.5 Crore BDT (~$125,000)
  chemicals_dyes: 4200000,     // 42 Lakh BDT (~$35,000)
  packaging_paper: 2800000,    // 28 Lakh BDT
  freight_logistics: 3600000,  // 36 Lakh BDT
  air_travel: 1200000,         // 12 Lakh BDT
  cloud_it: 850000,            // 8.5 Lakh BDT
  capital_machinery: 6500000,  // 65 Lakh BDT
  catering_canteen: 950000     // 9.5 Lakh BDT
};

export const DuckDBEngineView = ({ 
  isLight, 
  locale, 
  currency = 'BDT', 
  activityInputs, 
  activityResults,
  onRecalculate 
}) => {
  const [calculationMode, setCalculationMode] = useState('activity'); // 'activity' | 'spend_eeio'
  const [spendInputs, setSpendInputs] = useState(EEIO_SECTOR_DEFAULTS);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [exchangeRate, setExchangeRate] = useState(120);
  const [isCalculating, setIsCalculating] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0.85);

  const handleSpendChange = (sectorKey, val) => {
    setSpendInputs(prev => ({ ...prev, [sectorKey]: parseFloat(val) || 0 }));
  };

  // CEDA EEIO Calculation
  const eeioFactors = {
    textiles_yarn: { name: "Textiles & Cotton Yarn Sourcing", factor_usd: 0.48, cat: "Scope 3 Cat 1" },
    chemicals_dyes: { name: "Chemicals, Dyes & Wet Processing", factor_usd: 0.82, cat: "Scope 3 Cat 1" },
    packaging_paper: { name: "Corrugated Cartons & Poly Packaging", factor_usd: 0.65, cat: "Scope 3 Cat 1" },
    freight_logistics: { name: "Road & Seaport Container Freight", factor_usd: 0.94, cat: "Scope 3 Cat 4" },
    air_travel: { name: "Executive Business Flights & Agency", factor_usd: 1.15, cat: "Scope 3 Cat 6" },
    cloud_it: { name: "Enterprise Cloud, ERP & Data Centers", factor_usd: 0.22, cat: "Scope 3 Cat 1" },
    capital_machinery: { name: "Boilers, Stenter Frames & Looms", factor_usd: 0.58, cat: "Scope 3 Cat 2" },
    catering_canteen: { name: "Worker Canteen Food Supplies", factor_usd: 0.72, cat: "Scope 3 Cat 1" }
  };

  const calculateEEIOTotals = () => {
    let totalSpendUSD = 0;
    let totalSpendBDT = 0;
    let totalTCO2e = 0;
    const items = [];

    Object.keys(spendInputs).forEach(key => {
      const val = spendInputs[key] || 0;
      let valUSD = selectedCurrency === 'BDT' ? val / exchangeRate : val;
      let valBDT = selectedCurrency === 'BDT' ? val : val * exchangeRate;
      const factor = eeioFactors[key]?.factor_usd || 0.5;
      const tco2e = (valUSD * factor) / 1000;

      totalSpendUSD += valUSD;
      totalSpendBDT += valBDT;
      totalTCO2e += tco2e;

      items.push({
        key,
        name: eeioFactors[key]?.name || key,
        cat: eeioFactors[key]?.cat,
        valUSD,
        valBDT,
        factor,
        tco2e
      });
    });

    return { totalSpendUSD, totalSpendBDT, totalTCO2e, items };
  };

  const eeioResult = calculateEEIOTotals();

  const handleSimulateDuckDBCalculate = () => {
    setIsCalculating(true);
    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      setLatencyMs(parseFloat((end - start + 0.45).toFixed(2)));
      setIsCalculating(false);
    }, 120);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Engine Specs */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-emerald-50/70 to-teal-50/40 border-emerald-200/80 shadow-sm' 
          : 'bg-gradient-to-r from-[#06140D] to-[#0A2216] border-[#1B4D2E]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Database className="w-4 h-4" />
              </div>
              <h2 className={`text-xl font-bold font-sans ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {locale.duckdbTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                OLAP v2026.2
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-[#8FA899]'}`}>
              {locale.duckdbSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className={`px-3 py-1.5 rounded-2xl border flex items-center space-x-2 ${
              isLight ? 'bg-white/80 border-gray-200 text-gray-700' : 'bg-[#040A06] border-[#1B4D2E] text-emerald-400'
            }`}>
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Latency: <strong>{latencyMs} ms</strong></span>
            </div>
            <div className={`px-3 py-1.5 rounded-2xl border flex items-center space-x-2 ${
              isLight ? 'bg-white/80 border-gray-200 text-gray-700' : 'bg-[#040A06] border-[#1B4D2E] text-cyan-400'
            }`}>
              <Server className="w-3.5 h-3.5 text-cyan-500" />
              <span>Routing: <strong>30GB Microservice Tier</strong></span>
            </div>
            <button
              onClick={handleSimulateDuckDBCalculate}
              disabled={isCalculating}
              className="px-4 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{locale.calculateNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Activity vs EEIO Spend */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1B4D2E] pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setCalculationMode('activity')}
            className={`px-4 py-2 rounded-2xl text-xs font-sans font-semibold transition-all cursor-pointer ${
              calculationMode === 'activity'
                ? 'bg-emerald-600 text-white shadow-md'
                : (isLight ? 'bg-gray-100 text-gray-600 hover:text-gray-900' : 'bg-[#0A160F] text-gray-400 hover:text-white')
            }`}
          >
            {locale.activityMode}
          </button>
          <button
            onClick={() => setCalculationMode('spend_eeio')}
            className={`px-4 py-2 rounded-2xl text-xs font-sans font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              calculationMode === 'spend_eeio'
                ? 'bg-emerald-600 text-white shadow-md'
                : (isLight ? 'bg-gray-100 text-gray-600 hover:text-gray-900' : 'bg-[#0A160F] text-gray-400 hover:text-white')
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{locale.spendMode}</span>
          </button>
        </div>

        {calculationMode === 'spend_eeio' && (
          <div className="flex items-center space-x-2 text-xs font-sans">
            <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>Currency:</span>
            <button
              onClick={() => setSelectedCurrency(selectedCurrency === 'BDT' ? 'USD' : 'BDT')}
              className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold"
            >
              {selectedCurrency === 'BDT' ? 'BDT (৳) [1 USD = 120 BDT]' : 'USD ($)'}
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Activity Mode */}
      {calculationMode === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scope 1 Panel */}
          <div className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Scope 1 Direct</span>
              <span className="text-lg font-bold font-mono text-emerald-500">{activityResults?.scope1 || 0} tCO₂e</span>
            </div>
            <p className={`text-xs mb-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Stationary diesel generators, corporate fleet vehicles, and canteen LPG.
            </p>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Diesel ({activityInputs.diesel} L × 2.68)</span>
                <span className="font-bold">{((parseFloat(activityInputs.diesel) || 0) * 2.68 / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Petrol ({activityInputs.petrol} L × 2.31)</span>
                <span className="font-bold">{((parseFloat(activityInputs.petrol) || 0) * 2.31 / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>LPG ({activityInputs.lpg} kg × 2.98)</span>
                <span className="font-bold">{((parseFloat(activityInputs.lpg) || 0) * 2.98 / 1000).toFixed(2)} t</span>
              </div>
            </div>
          </div>

          {/* Scope 2 Panel */}
          <div className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider">Scope 2 Grid</span>
              <span className="text-lg font-bold font-mono text-cyan-500">{activityResults?.scope2 || 0} tCO₂e</span>
            </div>
            <p className={`text-xs mb-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Grid electricity via Bangladesh National Combined Margin (0.550 kg CO₂e/kWh).
            </p>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Electricity Consumption</span>
                <span className="font-bold">{activityInputs.electricity} kWh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Location Factor (DoE Gazette)</span>
                <span className="font-bold text-emerald-500">0.550 kg/kWh</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Market Factor (Solar PPA)</span>
                <span className="font-bold text-cyan-400">0.120 kg/kWh</span>
              </div>
            </div>
          </div>

          {/* Scope 3 Panel */}
          <div className={`p-5 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">Scope 3 Value Chain</span>
              <span className="text-lg font-bold font-mono text-emerald-500">{activityResults?.scope3 || 0} tCO₂e</span>
            </div>
            <p className={`text-xs mb-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Worker commuting, N1 highway freight, international travel, and yarn imports.
            </p>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Commute ({activityInputs.employees} staff)</span>
                <span className="font-bold">{((parseFloat(activityInputs.employees) || 0) * 0.40).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Freight ({activityInputs.truckTransport} t-km)</span>
                <span className="font-bold">{((parseFloat(activityInputs.truckTransport) || 0) * 0.20 / 1000).toFixed(2)} t</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Raw Material ({activityInputs.rawMaterials} T)</span>
                <span className="font-bold">{((parseFloat(activityInputs.rawMaterials) || 0) * 2.50).toFixed(2)} t</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CEDA EEIO Spend Mode */}
      {calculationMode === 'spend_eeio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
              <span className="text-xs font-mono text-gray-500 block mb-1">Total Scope 3 Spend</span>
              <span className="text-xl font-bold font-mono">
                {selectedCurrency === 'BDT' 
                  ? `৳ ${(eeioResult.totalSpendBDT / 10000000).toFixed(2)} Crore`
                  : `$ ${(eeioResult.totalSpendUSD).toLocaleString()}`}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
              <span className="text-xs font-mono text-gray-500 block mb-1">CEDA EEIO Modeled Emissions</span>
              <span className="text-xl font-bold font-mono text-emerald-500">
                {eeioResult.totalTCO2e.toFixed(2)} tCO₂e
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
              <span className="text-xs font-mono text-gray-500 block mb-1">Methodology Alignment</span>
              <span className="text-xs font-semibold text-cyan-400 block mt-1">
                GHG Protocol Scope 3 Guidance (Spend-Based Method)
              </span>
            </div>
          </div>

          {/* Spend Items Table */}
          <div className={`p-6 rounded-3xl border overflow-x-auto ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
            <h3 className={`text-sm font-bold font-sans mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Input Enterprise Expenditure Across Sectors (Comprehensive Environmental Data Archive)
            </h3>
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className={`border-b text-left ${isLight ? 'border-gray-200 text-gray-500' : 'border-[#1B4D2E] text-gray-400'}`}>
                  <th className="pb-3 font-semibold">Procurement Sector</th>
                  <th className="pb-3 font-semibold">Scope 3 Category</th>
                  <th className="pb-3 font-semibold">Expenditure ({selectedCurrency})</th>
                  <th className="pb-3 font-semibold">EEIO Factor (kg/USD)</th>
                  <th className="pb-3 font-semibold text-right">Emissions (tCO₂e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {eeioResult.items.map(item => (
                  <tr key={item.key} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 font-mono text-gray-500">{item.cat}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={spendInputs[item.key] || ''}
                        onChange={(e) => handleSpendChange(item.key, e.target.value)}
                        className={`w-36 px-2.5 py-1 rounded-lg border font-mono text-xs ${
                          isLight ? 'bg-gray-50 border-gray-300' : 'bg-[#040A06] border-[#1B4D2E] text-white'
                        }`}
                      />
                    </td>
                    <td className="py-3 font-mono text-gray-500">{item.factor}</td>
                    <td className="py-3 font-mono font-bold text-right text-emerald-500">
                      {item.tco2e.toFixed(2)} t
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuckDBEngineView;
