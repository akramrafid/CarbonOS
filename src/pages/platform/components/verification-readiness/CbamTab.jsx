import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CbamTab({
  isLight = false,
  cbamSector,
  setCbamSector,
  cbamExportTons,
  setCbamExportTons,
  cbamElectricityOrigin,
  cbamResult,
  client,
  showToast
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
        isLight ? 'bg-white border-border-subtle' : 'bg-bg-elevated border-border-subtle'
      }`}
    >
      <div>
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
          <span>EU Regulation 2023/956 Compliance</span>
        </div>
        <h3 className="font-bold text-lg mt-0.5">Carbon Border Adjustment Mechanism (CBAM) Customs Declarator</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
          Export declaration studio for Bangladeshi industrial goods exported to the European Union. Calculates specific embedded direct and indirect greenhouse gas emissions according to EU methodologies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CBAM Parameter Controls */}
        <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Export Commodity Category</label>
            <select
              value={cbamSector}
              onChange={(e) => setCbamSector(e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-border-strong cursor-pointer"
            >
              <option value="Jute & Polymer Composites">Jute, Geotextiles &amp; Bio-Polymer Blends (HS 5307)</option>
              <option value="Steel & Industrial Metals">Steel, Rebar &amp; Fabricated Structural Steel (HS 7208)</option>
              <option value="Aluminium Extrusions">Aluminium Ingots &amp; Extrusions (HS 7601)</option>
              <option value="Cement & Clinker">Portland Cement &amp; Hydraulic Clinker (HS 2523)</option>
              <option value="Nitrogenous Fertilizers">Ammonia &amp; Urea Fertilizers (HS 3102)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Net Export Volume (Metric Tons)</label>
            <input
              type="number"
              value={cbamExportTons}
              onChange={(e) => setCbamExportTons(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-border-strong"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Electricity Generation Factor</label>
            <input
              type="text"
              disabled
              value={cbamElectricityOrigin}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-white/10 bg-black/50 text-gray-400"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              showToast(`CBAM customs XML/JSON declaration exported for ${cbamExportTons} MT of ${cbamSector}`, 'success');
            }}
            className="w-full flex items-center justify-center space-x-2 font-mono text-xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download CBAM XML Registry Packet</span>
          </Button>
        </div>

        {/* CBAM Output Summary */}
        <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs text-gray-400 font-mono">Specific Emission Intensity:</span>
              <span className="text-xs font-bold font-mono text-emerald-400">{cbamResult.factor} tCO₂e / ton commodity</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs text-gray-400 font-mono">Total Embedded Direct Emissions:</span>
              <span className="text-base font-bold font-mono text-white">{cbamResult.embeddedEmissions} tCO₂e</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs text-gray-400 font-mono">EU ETS Benchmark Credit Allowance:</span>
              <span className="text-xs font-mono text-gray-300">-{cbamResult.euEtsBenchmarkAllowance} tCO₂e</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">Net Surrender Requirement</span>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {cbamResult.netCbamCertificatesNeeded} <span className="text-xs font-sans text-gray-400">CBAM Certificates</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Estimated at EU ETS auction average ~€68.50 / tCO₂e. Insetting offsets through CarbonZero BD reduce this liability.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/10">
            EU Transit Authority: European Commission DG TAXUD Registry Identifier BD-{client.id.toUpperCase()}-2026
          </div>
        </div>
      </div>
    </div>
  );
}

export default CbamTab;
