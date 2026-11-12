import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AddSegmentModal({
  isOpen,
  onClose,
  newSegment,
  setNewSegment,
  onAdd
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Utility Segment"
      subtitle="Manually append an industrial invoice surcharge or utility line item."
      size="md"
    >
      <form onSubmit={onAdd} className="space-y-4 text-xs font-sans">
        <div>
          <label className="block text-gray-400 mb-1">Segment Name / Line Item</label>
          <input
            type="text"
            value={newSegment.name}
            onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
            placeholder="e.g. Substation SF6 Gas Leakage or ETP COD Sludge"
            required
            className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 mb-1">Utility Type</label>
            <select
              value={newSegment.type}
              onChange={(e) => setNewSegment({ ...newSegment, type: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
            >
              <option value="Electricity">Electricity</option>
              <option value="Fossil Fuel">Fossil Fuel</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Effluent">Effluent</option>
              <option value="Fugitive Gas">Fugitive Gas</option>
              <option value="Logistics">Logistics</option>
              <option value="Waste">Waste</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Scope</label>
            <select
              value={newSegment.scope}
              onChange={(e) => setNewSegment({ ...newSegment, scope: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
            >
              <option value="Scope 1">Scope 1</option>
              <option value="Scope 2">Scope 2</option>
              <option value="Scope 3">Scope 3</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-gray-400 mb-1">Quantity</label>
            <input
              type="number"
              step="any"
              value={newSegment.qty}
              onChange={(e) => setNewSegment({ ...newSegment, qty: e.target.value })}
              placeholder="e.g. 500"
              required
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Unit</label>
            <input
              type="text"
              value={newSegment.unit}
              onChange={(e) => setNewSegment({ ...newSegment, unit: e.target.value })}
              placeholder="kWh / Liters / m3"
              required
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Factor (kg/unit)</label>
            <input
              type="number"
              step="any"
              value={newSegment.factor}
              onChange={(e) => setNewSegment({ ...newSegment, factor: e.target.value })}
              placeholder="Approved factor"
              required
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Billed Cost (BDT ৳)</label>
          <input
            type="number"
            step="any"
            value={newSegment.cost_bdt}
            onChange={(e) => setNewSegment({ ...newSegment, cost_bdt: e.target.value })}
            placeholder="e.g. 45000"
            className="w-full p-2.5 rounded-xl bg-bg-canvas border border-white/10 text-white focus:outline-none focus:border-border-strong"
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button type="submit" variant="primary" size="sm" className="flex-1">
            Add Segment
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddSegmentModal;
