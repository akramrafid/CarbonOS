import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export const AddCustomItemModal = ({
  isOpen,
  onClose,
  newCustomItem,
  setNewCustomItem,
  handleAddCustomItem,
  isLight
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Expense / Invoice Item"
      description="Record a custom activity line item with specific emission factor into the footprint matrix."
      size="md"
    >
      <form onSubmit={handleAddCustomItem} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
            Item / Expense Description
          </label>
          <Input
            type="text"
            required
            placeholder="e.g. Auxiliary Diesel for Factory Generator B"
            value={newCustomItem.name}
            onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
              Category
            </label>
            <select
              value={newCustomItem.categoryId}
              onChange={(e) => setNewCustomItem({ ...newCustomItem, categoryId: e.target.value })}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-emerald ${
                isLight ? 'bg-slate-50 border-carbon-border text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
              }`}
            >
              <option value="transport">Transport</option>
              <option value="electricity_energy">Electricity & Energy</option>
              <option value="food_groceries">Food & Groceries</option>
              <option value="clothing_footwear">Clothing & Footwear</option>
              <option value="shopping_products">Shopping & Products</option>
              <option value="housing_rent">Housing & Rent</option>
              <option value="entertainment">Entertainment</option>
              <option value="health_care">Health & Personal Care</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
              GHG Scope
            </label>
            <select
              value={newCustomItem.scope}
              onChange={(e) => setNewCustomItem({ ...newCustomItem, scope: e.target.value })}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-emerald ${
                isLight ? 'bg-slate-50 border-carbon-border text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
              }`}
            >
              <option value="Scope 1">Scope 1 (Direct)</option>
              <option value="Scope 2">Scope 2 (Electricity)</option>
              <option value="Scope 3">Scope 3 (Value Chain)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
              Spend (BDT)
            </label>
            <Input
              type="number"
              placeholder="e.g. 75000"
              value={newCustomItem.spendBdt}
              onChange={(e) => setNewCustomItem({ ...newCustomItem, spendBdt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
              Quantity & Unit
            </label>
            <div className="flex gap-1">
              <Input
                type="number"
                placeholder="e.g. 500"
                value={newCustomItem.quantity}
                onChange={(e) => setNewCustomItem({ ...newCustomItem, quantity: e.target.value })}
                className="w-2/3"
              />
              <Input
                type="text"
                placeholder="Units"
                value={newCustomItem.unit}
                onChange={(e) => setNewCustomItem({ ...newCustomItem, unit: e.target.value })}
                className="w-1/3"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-1 text-mist">
            Emission Factor (kg CO₂e per unit)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 2.68"
            value={newCustomItem.factor}
            onChange={(e) => setNewCustomItem({ ...newCustomItem, factor: e.target.value })}
          />
        </div>

        {/* Calculated CO2 Preview */}
        <div className={`p-3 rounded-xl border flex justify-between items-center ${
          isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#0D2616] border-emerald/30'
        }`}>
          <span className="text-xs font-bold font-sans">Calculated Added Impact:</span>
          <span className="text-xs font-mono font-black text-emerald">
            +{(
              (parseFloat(newCustomItem.quantity) || 0) > 0
                ? Math.round((parseFloat(newCustomItem.quantity) || 0) * (parseFloat(newCustomItem.factor) || 1))
                : Math.round((parseFloat(newCustomItem.spendBdt) || 0) * 0.065)
            ).toLocaleString()} kg CO₂e
          </span>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add to Matrix
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCustomItemModal;
