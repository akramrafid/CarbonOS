import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export const ScopeCalculatorSection = ({
  isLight,
  inputs = {},
  handleInputChange,
  clearCalculator,
  isAuditorMode = false
}) => {
  return (
    <Card className="p-6 lg:p-8 space-y-6">
      <div className={`flex justify-between items-center border-b pb-4 ${
        isLight ? 'border-carbon-border' : 'border-border-subtle'
      }`}>
        <div>
          <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Protocol Emissions Calculator
          </h3>
          <p className={`text-xs mt-0.5 font-sans ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
            Input raw values or upload utility invoices to extract footprint.
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={clearCalculator}
        >
          Clear Data
        </Button>
      </div>

      {/* Scope Calculator Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scope 1 Column */}
        <div className="space-y-4">
          <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
            isLight ? 'text-emerald border-carbon-border' : 'text-emerald-200 border-border-subtle'
          }`}>
            Scope 1 (Direct)
          </div>
          
          <div className="space-y-3">
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Diesel (Liters)</label>
              <Input 
                type="number"
                name="diesel"
                value={inputs.diesel}
                onChange={handleInputChange}
                placeholder="e.g. 10000"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Petrol (Liters)</label>
              <Input 
                type="number"
                name="petrol"
                value={inputs.petrol}
                onChange={handleInputChange}
                placeholder="e.g. 5000"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>LPG (Kg)</label>
              <Input 
                type="number"
                name="lpg"
                value={inputs.lpg}
                onChange={handleInputChange}
                placeholder="e.g. 1500"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Scope 2 Column */}
        <div className="space-y-4">
          <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
            isLight ? 'text-emerald border-carbon-border' : 'text-emerald-200 border-border-subtle'
          }`}>
            Scope 2 (Indirect)
          </div>
          
          <div className="space-y-3">
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Grid Power (kWh)</label>
              <Input 
                type="number"
                name="electricity"
                value={inputs.electricity}
                onChange={handleInputChange}
                placeholder="e.g. 100000"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Scope 3 Column */}
        <div className="space-y-4">
          <div className={`font-mono text-[10px] uppercase tracking-wider font-bold pb-2 border-b ${
            isLight ? 'text-emerald border-carbon-border' : 'text-emerald-200 border-border-subtle'
          }`}>
            Scope 3 (Value Chain)
          </div>
          
          <div className="space-y-3">
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Employees (Commute)</label>
              <Input 
                type="number"
                name="employees"
                value={inputs.employees}
                onChange={handleInputChange}
                placeholder="e.g. 150"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Air Travel (Km)</label>
              <Input 
                type="number"
                name="airTravel"
                value={inputs.airTravel}
                onChange={handleInputChange}
                placeholder="e.g. 50000"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Truck Freight (T-Km)</label>
              <Input 
                type="number"
                name="truckTransport"
                value={inputs.truckTransport}
                onChange={handleInputChange}
                placeholder="e.g. 20000"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold font-sans uppercase mb-1 ${
                isLight ? 'text-fg-muted' : 'text-mist'
              }`}>Raw Materials (Tons)</label>
              <Input 
                type="number"
                name="rawMaterials"
                value={inputs.rawMaterials}
                onChange={handleInputChange}
                placeholder="e.g. 400"
                disabled={isAuditorMode}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScopeCalculatorSection;
