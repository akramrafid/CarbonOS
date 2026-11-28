import React from 'react';
import { Satellite, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function MrvDossierModal({
  inspectCredit,
  onClose,
  onPurchaseThisCredit,
  isLight = false
}) {
  if (!inspectCredit) return null;

  return (
    <Modal
      isOpen={Boolean(inspectCredit)}
      onClose={onClose}
      title={inspectCredit.type}
      subtitle={`Origin: ${inspectCredit.region} • Producer: ${inspectCredit.farmer}`}
      size="lg"
      footer={
        <div className="flex items-center space-x-3 w-full justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const toBuy = inspectCredit;
              onClose();
              onPurchaseThisCredit(toBuy);
            }}
          >
            Proceed to Purchase This Credit (৳{inspectCredit.price.toLocaleString()})
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center space-x-2 mb-2">
            <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded font-bold uppercase">
              CARBON ZERO BD • AUDIT DOSSIER
            </span>
            <span className="font-mono text-[10px] text-fg-secondary">Serial ID: {inspectCredit.id}</span>
        </div>

        {/* Telemetry Block */}
        <div
          className="p-4 rounded-xl border space-y-2 bg-bg-elevated/60 border-border-subtle"
        >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-400 flex items-center space-x-1.5">
                  <Satellite size={13} />
                  <span>Remote Sensing &amp; Ground Sensor Data</span>
                </span>
                <span className="text-[10px] font-mono text-accent">Not audited</span>
              </div>
                <p className="text-fg-secondary">{inspectCredit.mrvTelemetry}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-fg-secondary">
                  <div>GPS Coordinates: <span className="text-fg-primary">{inspectCredit.coordinates}</span></div>
                  <div>Auditor: <span className="text-fg-primary">{inspectCredit.auditor}</span></div>
                </div>
              </div>

              {/* Additionality & Co-benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className="p-3.5 rounded-xl border bg-bg-elevated/60 border-border-subtle"
                  >
                      <span className="font-mono text-[10px] text-fg-secondary block mb-1">ADDITIONALITY</span>
                      <span className="font-bold text-sm text-accent block">{inspectCredit.additionality}</span>
                      <p className="text-[11px] text-fg-secondary mt-1">
                        Additionality has not been assessed for these demo listings.
                      </p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border bg-bg-elevated/60 border-border-subtle"
                  >
                    <span className="font-mono text-[10px] text-fg-secondary block mb-1">CO-BENEFITS</span>
                    <span className="text-[11px] text-fg-primary block">{inspectCredit.coBenefits}</span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div
                  className="p-3.5 rounded-xl border flex justify-between items-center bg-emerald-500/10 border-emerald-500/30"
                >
                  <div>
                      <span className="text-[10px] font-mono text-fg-secondary block">TOTAL LOT VALUATION</span>
                      <span className="text-lg font-bold text-accent font-mono">
                        ৳{inspectCredit.price.toLocaleString()} ({inspectCredit.tonnage} tCO₂e)
                      </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">DIRECT FARMER WALLET</span>
                    <span className="text-xs font-mono font-bold text-white">{inspectCredit.farmerWallet}</span>
                  </div>
                </div>
              </div>
            </Modal>
            );
}

            export default MrvDossierModal;
