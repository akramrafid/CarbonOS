import React from 'react';
import { TrendingDown } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

export const ScopeBreakdownRow = ({
  isLight,
  results = {},
  reductionTarget = 38
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Total Emissions */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider font-bold mb-2 text-emerald">
            Total Carbon Footprint
          </div>
          <div className={`font-sans font-black text-3xl lg:text-4xl tracking-tight ${
            isLight ? 'text-fg-primary' : 'text-white'
          }`}>
            {results.total} <span className="text-xs font-mono font-normal text-emerald">tCO2e</span>
            {results.scope2Missing && (
              <span className="block text-[10px] font-mono font-normal text-amber-500">
                excl. Scope 2 (grid-average factor needed)
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Badge variant="emerald" size="sm">
            <TrendingDown className="w-3 h-3 mr-1 inline text-emerald" />
            {reductionTarget}% reduced
          </Badge>
          <span className={`text-[9px] font-sans ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
            vs baseline
          </span>
        </div>
      </Card>

      {/* Card 2: Scope 1 (Direct) */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
            isLight ? 'text-fg-muted' : 'text-mist'
          }`}>
            Scope 1 (Direct)
          </div>
          <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {results.scope1} <span className={`text-xs font-mono font-normal ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>tCO2e</span>
          </div>
        </div>
        <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
          <span>Boilers, Fleet, Fuel</span>
          <span className="font-mono font-bold text-amber-500">
            {results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%
          </span>
        </div>
      </Card>

      {/* Card 3: Scope 2 (Electricity) */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
              isLight ? 'text-fg-muted' : 'text-mist'
            }`}>
              Scope 2 (Electricity)
            </span>
            <Badge variant="emerald" size="sm">Dual Reporting</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-fg-secondary' : 'text-fg-muted'}`}>Location</span>
              <span className={`font-sans font-bold text-xl ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                {results.scope2 ?? '—'} <span className="text-[10px] font-mono font-normal text-mist">t</span>
              </span>
              {results.scope2Missing && (
                <span className="block text-[9px] text-amber-500">Needs an approved grid-average factor</span>
              )}
            </div>
            <div>
              <span className={`text-[9px] font-semibold uppercase block ${isLight ? 'text-fg-secondary' : 'text-fg-muted'}`}>Market</span>
              <span className="font-sans font-bold text-xl text-emerald">
                {results.scope2Market ?? '—'} <span className="text-[10px] font-mono font-normal text-mist">t</span>
              </span>
              <span className="block text-[9px] text-amber-500">Grid-average fallback</span>
            </div>
          </div>
        </div>
        <div className={`flex justify-between items-center mt-3 text-[10px] ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
          <span>Purchased Power</span>
          <span className="font-mono text-[9px] text-emerald font-bold">
            Loc: {results.scope2Missing ? '—' : `${results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%`} | Mkt: {results.scope2Market == null ? '—' : `${results.totalMarket > 0 ? ((results.scope2Market / results.totalMarket) * 100).toFixed(0) : 0}%`}
          </span>
        </div>
      </Card>

      {/* Card 4: Scope 3 (Value Chain) */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className={`font-mono text-[9px] uppercase tracking-wider font-bold mb-2 ${
            isLight ? 'text-fg-muted' : 'text-mist'
          }`}>
            Scope 3 (Value Chain)
          </div>
          <div className={`font-sans font-bold text-3xl tracking-tight ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {results.scope3} <span className={`text-xs font-mono font-normal ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>tCO2e</span>
          </div>
        </div>
        <div className={`flex justify-between items-center mt-4 text-[10px] ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
          <span>Supply Chain & Commutes</span>
          <span className="font-mono font-bold text-purple-400">
            {results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ScopeBreakdownRow;
