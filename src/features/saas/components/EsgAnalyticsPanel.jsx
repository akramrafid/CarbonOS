import React from 'react';
import { TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

export const EsgAnalyticsPanel = (props) => {
  const {
    results,
    inputs,
    activeClient
  } = props;

  return (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-sans font-bold text-3xl text-[#0F291B]">Emissions Analytics</h2>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Deep dive into corporate footprint breakdown per GHG Protocol Scopes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Carbon Intensity Score</span>
                <div className="text-2xl font-sans font-bold text-[#0F291B]">0.18 <span className="text-xs text-[#64748B]">tCO2e/person</span></div>
                <p className="text-[10px] text-[#64748B]">Average monthly emissions calculated per corporate employee.</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Revenue Intensity</span>
                <div className="text-2xl font-sans font-bold text-[#0F291B]">1.24 <span className="text-xs text-[#64748B]">kgCO2e/৳</span></div>
                <p className="text-[10px] text-[#64748B]">Carbon dioxide generated per Taka generated in business activity.</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">Energy Efficiency</span>
                <div className="text-2xl font-sans font-bold text-emerald">Grade A+</div>
                <p className="text-[10px] text-[#64748B]">Optimized power grid usage vs average Bangladeshi manufacturing.</p>
              </div>
            </div>

            {/* Scope Visual Progress Bars */}
            <div className="space-y-5 border-t border-[#F1F5F9] pt-6">
              <h3 className="font-sans font-bold text-base text-[#0F291B]">Scope Distribution</h3>
              
              <div className="space-y-4">
                {/* Scope 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 1 (Direct Fuel Burning)</span>
                    <span className="font-mono font-semibold text-amber">{results.scope1} tCO2e ({results.total > 0 ? ((results.scope1 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope1 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 2 (Electricity Consumption)</span>
                    <span className="font-mono font-semibold text-emerald">
                      {results.scope2Missing
                        ? 'Grid-average factor needed'
                        : `${results.scope2} tCO2e (${results.total > 0 ? ((results.scope2 / results.total) * 100).toFixed(0) : 0}%)`}
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope2 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-bold text-[#0F291B]">Scope 3 (Supply Chain & Business travel)</span>
                    <span className="font-mono font-semibold text-purple-600">{results.scope3} tCO2e ({results.total > 0 ? ((results.scope3 / results.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full transition-all duration-500" 
                      style={{ width: `${results.total > 0 ? (results.scope3 / results.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fuel Breakdown Grid */}
            <div className="border-t border-[#F1F5F9] pt-6 space-y-4">
              <h3 className="font-sans font-bold text-base text-[#0F291B]">Activity Emission Logs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Diesel</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.diesel) || 0) * ef.diesel / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Petrol</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.petrol) || 0) * ef.petrol / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">LPG Gas</span>
                  <span className="font-bold font-mono text-[#0F291B]">{((parseFloat(inputs.lpg) || 0) * ef.lpg / 1000).toFixed(2)} tCO2e</span>
                </div>
                <div className="p-3 bg-[#F8F9FA] rounded-xl">
                  <span className="text-[#64748B] block mb-1">Electricity</span>
                  <span className="font-bold font-mono text-[#0F291B]">
                    {ef.electricity == null ? '— (no grid-average factor)' : `${((parseFloat(inputs.electricity) || 0) * ef.electricity / 1000).toFixed(2)} tCO2e`}
                  </span>
                </div>
              </div>
            </div>

          </div>
  );
};

export default EsgAnalyticsPanel;
