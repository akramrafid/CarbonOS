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
          <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-0.5 rounded font-bold uppercase">
            CARBON ZERO BD • AUDIT DOSSIER
          </span>
          <span className="font-mono text-[10px] text-slate-400">Serial ID: {inspectCredit.id}</span>
        </div>

        {/* Telemetry Block */}
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-bg-canvas border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 flex items-center space-x-1.5">
              <Satellite size={13} />
              <span>Remote Sensing &amp; Ground Sensor Data</span>
            </span>
            <span className="text-[10px] font-mono text-emerald">Not audited</span>
          </div>
          <p className="text-slate-300">{inspectCredit.mrvTelemetry}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <div>GPS Coordinates: <span className="text-white">{inspectCredit.coordinates}</span></div>
            <div>Auditor: <span className="text-white">{inspectCredit.auditor}</span></div>
          </div>
        </div>

        {/* Additionality & Co-benefits */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-3.5 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`}
          >
            <span className="font-mono text-[10px] text-slate-400 block mb-1">ADDITIONALITY</span>
            <span className="font-bold text-sm text-emerald block">{inspectCredit.additionality}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Additionality has not been assessed for these demo listings.
            </p>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`}
          >
            <span className="font-mono text-[10px] text-slate-400 block mb-1">CO-BENEFITS</span>
            <span className="text-[11px] text-slate-300 block">{inspectCredit.coBenefits}</span>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div
          className={`p-3.5 rounded-xl border flex justify-between items-center ${
            isLight ? 'bg-emerald/5 border-emerald/20' : 'bg-bg-surface/40 border-emerald/20'
          }`}
        >
          <div>
            <span className="text-[10px] font-mono text-slate-400 block">TOTAL LOT VALUATION</span>
            <span className="text-lg font-bold text-emerald font-mono">
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
