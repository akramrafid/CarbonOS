import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EsgSettingsPanel = (props) => {
  const {
    reductionTarget,
    setReductionTarget,
    baseYear,
    setBaseYear,
    baseYearEmissions,
    setBaseYearEmissions,
    acquisitionsDivestments,
    setAcquisitionsDivestments,
    cbamCommodity,
    setCbamCommodity,
    cbamWeight,
    setCbamWeight,
    ef,
    setEf,
    syncOfficialFactors,
    isSyncingFactors,
    handleSaveSettings
  } = props;

  return (
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-fg-primary">ESG Parameter Settings</h2>
          <p className="text-sm text-fg-secondary mt-1 font-sans">Configure GHG Protocol emission factors and reduction targets.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">

          {/* Target configurations */}
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-base text-fg-primary border-b border-border-subtle pb-2">Target Metrics</h3>
            <div>
              <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Corporate Reduction Target (%)</label>
              <input
                type="number"
                value={reductionTarget}
                onChange={(e) => setReductionTarget(e.target.value)}
                className="w-full max-w-xs text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
              />
              <p className="text-[10px] text-fg-secondary mt-1">This configures the target carbon footprint reduction card on the dashboard.</p>
            </div>
          </div>

          {/* Emission Factors grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-subtle pb-2">
              <h3 className="font-sans font-bold text-base text-fg-primary">GHG Emission Factors (EF)</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={syncOfficialFactors}
                disabled={isSyncingFactors}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncingFactors ? 'animate-spin' : ''}`} />}
              >
                Load legacy factor table (unverified, no grid factor)
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Diesel (kg CO₂e/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ef.diesel}
                  onChange={(e) => setEf({ ...ef, diesel: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Petrol (kg CO₂e/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ef.petrol}
                  onChange={(e) => setEf({ ...ef, petrol: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">LPG Gas (kg CO₂e/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ef.lpg}
                  onChange={(e) => setEf({ ...ef, lpg: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Grid average, location-based (kg CO₂e/kWh)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Approved grid-average factor"
                  title="Location-based Scope 2 uses the grid's average emission rate. A CDM combined margin is not allowed."
                  value={ef.electricity ?? ''}
                  onChange={(e) => setEf({ ...ef, electricity: e.target.value === '' ? null : parseFloat(e.target.value) })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Commute (tCO₂e/emp/yr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ef.employees}
                  onChange={(e) => setEf({ ...ef, employees: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-secondary uppercase mb-1">Air Travel (kg CO₂e/km)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ef.airTravel}
                  onChange={(e) => setEf({ ...ef, airTravel: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono p-2 border border-border-subtle rounded-lg focus:outline-none focus:border-border-subtle bg-bg-muted"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            Save Settings
          </Button>

        </form>
      </div>
      );
};

      export default EsgSettingsPanel;
