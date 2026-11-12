import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fmt } from './activityData';

export function AddActivityModal({
  isOpen,
  onClose,
  onSubmit,
  newActivity,
  setNewActivity,
  activeClient,
  isLight = false
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Activity Data"
      subtitle="Record energy or material consumption with instant tCO₂e calculation and audit traceability."
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
          <Plus className="w-4 h-4" />
          <span>New Operational Activity Entry</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Activity Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Backup Generator Diesel Consumption (Stationary)"
            value={newActivity.activityType}
            onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
            className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">GHG Protocol Scope</label>
            <select
              value={newActivity.scope}
              onChange={(e) => {
                const sc = e.target.value;
                let defaultFactor = '2.68';
                let defaultUnit = 'Liters';
                if (sc.includes('Scope 2')) {
                  defaultFactor = '';
                  defaultUnit = 'kWh';
                } else if (sc.includes('Scope 3')) {
                  defaultFactor = '0.20';
                  defaultUnit = 't-km';
                }
                setNewActivity({ ...newActivity, scope: sc, factorValue: defaultFactor, unit: defaultUnit });
              }}
              className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            >
              <option value="Scope 1">Scope 1 (Direct Stationary/Mobile)</option>
              <option value="Scope 2 (Loc)">Scope 2 (Grid Electricity - Loc)</option>
              <option value="Scope 3">Scope 3 (Value Chain / Logistics)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Operating Facility</label>
            <select
              value={newActivity.facility}
              onChange={(e) => setNewActivity({ ...newActivity, facility: e.target.value })}
              className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            >
              {activeClient?.facilities?.map((f, i) => (
                <option key={i} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Quantity</label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 5000"
              value={newActivity.quantity}
              onChange={(e) => setNewActivity({ ...newActivity, quantity: e.target.value })}
              className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Unit</label>
            <select
              value={newActivity.unit}
              onChange={(e) => setNewActivity({ ...newActivity, unit: e.target.value })}
              className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            >
              <option value="kWh">kWh (Power)</option>
              <option value="Liters">Liters (Fuel)</option>
              <option value="kg">kg (Gas/Materials)</option>
              <option value="tonnes">Tonnes (Bulk)</option>
              <option value="t-km">t-km (Freight)</option>
              <option value="p-km">p-km (Travel)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Factor (kg CO₂e/unit)</label>
            <input
              type="number"
              step="0.001"
              required
              value={newActivity.factorValue}
              onChange={(e) => setNewActivity({ ...newActivity, factorValue: e.target.value })}
              className={`w-full text-xs font-mono p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            />
          </div>
        </div>

        {/* Realtime Footprint Preview */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-border-subtle flex items-center justify-between text-xs">
          <span className="text-gray-400">Calculated Emission Footprint:</span>
          <span className="font-mono font-bold text-sm text-accent-hover">
            {fmt(((parseFloat(newActivity.quantity) || 0) * (parseFloat(newActivity.factorValue) || 0)) / 1000, 3)} tCO₂e
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Responsible Data Owner</label>
            <input
              type="text"
              placeholder="e.g. Plant Energy Lead"
              value={newActivity.responsiblePerson}
              onChange={(e) => setNewActivity({ ...newActivity, responsiblePerson: e.target.value })}
              className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Data Quality Tier</label>
            <select
              value={newActivity.dataQuality}
              onChange={(e) => setNewActivity({ ...newActivity, dataQuality: e.target.value })}
              className={`w-full text-xs font-sans p-2.5 rounded-xl border focus:outline-none focus:border-border-strong ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-bg-canvas border-border-subtle text-white'
              }`}
            >
              <option value="High">High (Direct Meter / Invoiced)</option>
              <option value="Medium">Medium (Supplier Average)</option>
              <option value="Estimated">Estimated (Proxy Estimation)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle/40">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Commit Activity Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddActivityModal;
