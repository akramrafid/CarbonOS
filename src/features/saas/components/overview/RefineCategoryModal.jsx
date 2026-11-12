import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export const RefineCategoryModal = ({
  category,
  onClose,
  onSave
}) => {
  if (!category) return null;

  const [spend, setSpend] = useState(category.spendBdt || 0);
  const [kg, setKg] = useState(category.carbonKg || 0);
  const [qty, setQty] = useState(category.quantity || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(category.id, spend, kg, qty);
  };

  return (
    <Modal
      isOpen={Boolean(category)}
      onClose={onClose}
      title={`Refine ${category.name}`}
      description="Manually adjust spend, activity quantities, and emissions parameters."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
            Adjust Invoiced Spend (BDT)
          </label>
          <Input
            type="number"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
            Adjust Emissions (kg CO₂e)
          </label>
          <Input
            type="number"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
            Adjust Activity Quantity ({category.unit})
          </label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Recalculation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RefineCategoryModal;
