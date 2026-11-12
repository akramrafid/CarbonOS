import React from 'react';
import { FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryAdjustmentsTab({ adjustments, handleConfirmAdjustment }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#152B1D]">
          <div>
            <h2 className="font-sans font-bold text-2xl text-white flex items-center gap-2">
              <FileSpreadsheet className="text-[#00C853]" size={24} />
              Article 6.2 Corresponding Adjustment (CA) Ledger
            </h2>
            <p className="font-sans text-sm text-white/70 max-w-3xl mt-1">
              Non-Negotiable Constraint #2: Corresponding adjustments are explicitly tracked with official
              DOE authorization IDs and timestamps. They are never inferred from market transfers.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-white/50">Total Adjusted:</span>
            <span className="font-mono text-xs font-bold text-[#00C853] bg-[#00C853]/10 border border-[#00C853]/30 px-3 py-1 rounded-full">
              5,000.0 tCO2e
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="mt-6 w-full overflow-hidden">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pb-1 md:hidden">
            <span>← Scroll ledger table horizontally →</span>
            <span className="text-[10px]">800px</span>
          </div>
          <div className="overflow-x-auto touch-pan-x w-full">
            <table className="w-full text-left font-mono text-xs min-w-[800px]">
              <thead>
                <tr className="border-b border-[#152B1D] text-white/50 uppercase tracking-wider">
                  <th className="pb-3 px-4">Serial Number Block</th>
                  <th className="pb-3 px-4">Sector</th>
                  <th className="pb-3 px-4">Metric Tonnes</th>
                  <th className="pb-3 px-4">Transfer Partner</th>
                  <th className="pb-3 px-4">Authorized ITMO</th>
                  <th className="pb-3 px-4">CA Status</th>
                  <th className="pb-3 px-4">Confirmation ID</th>
                  <th className="pb-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152B1D]/60 text-white/80">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-[#0D2B1A]/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{adj.credit_serial_number}</td>
                    <td className="py-3.5 px-4 text-white/70">{adj.sector}</td>
                    <td className="py-3.5 px-4 font-bold text-[#00C853]">
                      {adj.metric_tonnes_co2e.toLocaleString()} tCO2e
                    </td>
                    <td className="py-3.5 px-4 text-white/80 font-sans text-xs">
                      {adj.itmo_transfer_partner}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          adj.authorized_for_itmo
                            ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30'
                            : 'bg-white/5 text-white/50'
                        }`}
                      >
                        {adj.authorized_for_itmo ? 'AUTHORIZED' : 'DOMESTIC'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase ${
                          adj.adjustment_applied
                            ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 font-bold'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {adj.adjustment_applied ? (
                          <CheckCircle2 size={11} className="mr-1 text-[#00C853]" />
                        ) : (
                          <Clock size={11} className="mr-1 text-amber-400" />
                        )}
                        {adj.adjustment_applied ? 'CONFIRMED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white/60 text-[11px]">
                      {adj.adjustment_confirmation_id || 'Awaiting DOE Approval'}
                    </td>
                    <td className="py-3.5 px-4">
                      {!adj.adjustment_applied && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleConfirmAdjustment(adj.id)}
                        >
                          Confirm
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistryAdjustmentsTab;
