import React from 'react';
import { Edit3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function EditSegmentModal({
  isOpen,
  onClose,
  editingSegment,
  setEditingSegment,
  onSave
}) {
  if (!isOpen || !editingSegment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auditor Field Correction & Evidence Review"
      subtitle="Modify line item parameters and record mandatory reason in audit log."
      size="md"
    >
      <form onSubmit={onSave} className="space-y-4 text-xs font-sans">
        <div>
          <label className="block text-fg-secondary mb-1">Line Item Name</label>
          <input
            type="text"
            value={editingSegment.name}
            onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
            required
            className="w-full p-2.5 rounded-xl bg-bg-canvas border border-border-subtle text-fg-primary focus:outline-none focus:border-amber-500"
          />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-fg-secondary mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                value={editingSegment.qty}
                onChange={(e) => setEditingSegment({ ...editingSegment, qty: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl bg-bg-canvas border border-border-subtle text-fg-primary focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-fg-secondary mb-1">Unit</label>
              <input
                type="text"
                value={editingSegment.unit}
                onChange={(e) => setEditingSegment({ ...editingSegment, unit: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl bg-bg-canvas border border-border-subtle text-fg-primary focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-fg-secondary mb-1">Factor (kg/unit)</label>
              <input
                type="number"
                step="any"
                value={editingSegment.factor ?? ''}
                onChange={(e) => setEditingSegment({ ...editingSegment, factor: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl bg-bg-canvas border border-border-subtle focus:outline-none focus:border-amber-500 font-mono text-emerald-700 dark:text-emerald-400 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-fg-secondary mb-1">Billed Cost (BDT ৳)</label>
            <input
              type="number"
              step="any"
              value={editingSegment.cost_bdt}
              onChange={(e) => setEditingSegment({ ...editingSegment, cost_bdt: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-bg-canvas border border-border-subtle text-fg-primary focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
              <label className="block text-amber-800 dark:text-amber-300 mb-1 font-bold">
                Mandatory Reason for Adjustment (Logged to Audit Trail)
              </label>
              <input
                type="text"
                value={editingSegment.reason}
                onChange={(e) => setEditingSegment({ ...editingSegment, reason: e.target.value })}
                placeholder="e.g., Physical meter verification discrepancy; adjusted peak tariff factor"
                required
                className="w-full p-2.5 rounded-xl bg-bg-canvas border border-amber-500/40 text-fg-primary focus:outline-none focus:border-amber-500"
              />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button type="submit" variant="primary" size="sm" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black">
              Save Auditor Correction
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
      </form>
    </Modal>
  );
}

export default EditSegmentModal;
