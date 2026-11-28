import React from 'react';
import { FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryAdjustmentsTab({ adjustments, handleConfirmAdjustment }) {
  return (
    <div className="space-y-8 animate-fadeIn">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div>
                <h2 className="font-sans font-bold text-2xl text-fg-primary flex items-center gap-2">
                  <FileSpreadsheet className="text-accent" size={24} />
                  Article 6.2 Corresponding Adjustment (CA) Ledger
                </h2>
                  <p className="font-sans text-sm text-fg-secondary max-w-3xl mt-1">
                    Non-Negotiable Constraint #2: Corresponding adjustments are explicitly tracked with official
                    DOE authorization IDs and timestamps. They are never inferred from market transfers.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-fg-muted">Total Adjusted:</span>
                  <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-border-strong/30 px-3 py-1 rounded-full">
                    5,000.0 tCO2e
                  </span>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="mt-6 w-full overflow-hidden">
                <div className="text-[11px] font-mono text-fg-muted flex items-center justify-between pb-1 md:hidden">
                  <span>← Scroll ledger table horizontally →</span>
                  <span className="text-[10px]">800px</span>
                </div>
                <div className="overflow-x-auto touch-pan-x w-full">
                  <table className="w-full text-left font-mono text-xs min-w-[800px]">
                    <thead>
                        <tr className="border-b border-border-subtle text-fg-secondary uppercase tracking-wider">
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
                      <tbody className="divide-y divide-border-subtle text-fg-primary">
                        {adjustments.map((adj) => (
                            <tr key={adj.id} className="hover:bg-bg-elevated/40 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-fg-primary">{adj.credit_serial_number}</td>
                              <td className="py-3.5 px-4 text-fg-secondary">{adj.sector}</td>
                              <td className="py-3.5 px-4 font-bold text-accent">
                                {adj.metric_tonnes_co2e.toLocaleString()} tCO2e
                              </td>
                                <td className="py-3.5 px-4 text-fg-primary font-sans text-xs">
                                  {adj.itmo_transfer_partner}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] uppercase ${adj.authorized_for_itmo
                                        ? 'bg-accent/10 text-accent border border-border-strong/30'
                            : 'bg-bg-muted text-fg-secondary'
                        }`}
                      >
                                  {adj.authorized_for_itmo ? 'AUTHORIZED' : 'DOMESTIC'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase ${adj.adjustment_applied
                                      ? 'bg-accent/10 text-accent border border-border-strong/30 font-bold'
                            : 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                                {adj.adjustment_applied ? (
                                  <CheckCircle2 size={11} className="mr-1 text-accent" />
                                ) : (
                          <Clock size={11} className="mr-1 text-amber-700 dark:text-amber-400" />
                                )}
                                {adj.adjustment_applied ? 'CONFIRMED' : 'PENDING'}
                              </span>
                            </td>
                              <td className="py-3.5 px-4 text-fg-secondary text-[11px]">
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
