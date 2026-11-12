import React from 'react';
import { Building } from 'lucide-react';

export function BoundariesAndMethodologySection({ activeClient, byFacility, fmt }) {
  return (
    <>
      {/* Section 2: Organizational & Reporting Boundary */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-accent font-bold">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Section 2 • Organizational & Operational Boundaries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-black/30 border border-border-subtle space-y-2">
            <h4 className="font-sans font-bold text-sm text-white">Consolidation Approach: Operational Control</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              The organizational boundary is defined strictly under the <strong>Operational Control approach</strong> in conformity with Chapter 3 of the GHG Protocol Corporate Standard. {activeClient.name} accounts for 100% of emissions originating from assets and operations over which it exerts management authority.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/30 border border-border-subtle space-y-2">
            <h4 className="font-sans font-bold text-sm text-white">Base-Year Recalculation Rule</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Base year is set to <strong>FY 2024</strong>. A structural recalculation threshold of <strong>&gt; 5%</strong> is enforced for corporate acquisitions, divestitures, or fundamental structural method shifts as mandated by ISO 14064-1 Clause 6.4.
            </p>
          </div>
        </div>

        {/* Facilities Register Table */}
        <div className="p-5 rounded-2xl bg-black/30 border border-border-subtle space-y-3">
          <h4 className="font-sans font-bold text-sm text-white">Operating Facilities Register (Physical Boundary)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-border-subtle pb-2 font-mono uppercase text-[10px]">
                  <th className="py-2">Facility Name</th>
                  <th>Geographic Location</th>
                  <th>Operational Function</th>
                  <th>Emissions Contributed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152B1D]/40">
                {byFacility.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 font-bold text-white flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-accent" />
                      <span>{item.site}</span>
                    </td>
                    <td className="text-gray-300">Bangladesh</td>
                    <td className="text-gray-400">Primary Enterprise Operations</td>
                    <td className="font-mono font-bold text-accent">{fmt(item.tCO2e, 2)} tCO₂e ({item.percentage}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Methodology & Factor Lineage */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-accent font-bold">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Section 3 • Quantification Methodology & Factor Lineage</span>
        </div>

        <div className="p-5 rounded-2xl bg-black/30 border border-border-subtle space-y-3">
          <p className="text-xs text-gray-300 leading-relaxed">
            Emissions quantification utilizes activity data multiplied by approved, source-versioned greenhouse gas emission factors. Original raw activity quantities and physical units are preserved in the permanent audit ledger without lossy conversions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-border-subtle font-mono">
              <span className="text-[10px] text-gray-400 block uppercase">Scope 2 Location Grid Factor</span>
              <span className="font-bold text-amber-400 text-sm block mt-0.5">Not set: grid-average factor pending approval</span>
              <span className="text-[10px] text-gray-400 block mt-1">No official Bangladesh grid factor located; CarbonOS derives a DRAFT grid average from BPDB data</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-border-subtle font-mono">
              <span className="text-[10px] text-gray-400 block uppercase">Scope 1 Fuel Combustion Factors</span>
              <span className="font-bold text-amber-400 text-sm block mt-0.5">Diesel: 2.68 kg/L • Petrol: 2.31 kg/L</span>
              <span className="text-[10px] text-gray-400 block mt-1">Source: UK DEFRA 2024 / IPCC AR6 stationary and fleet standards</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BoundariesAndMethodologySection;
