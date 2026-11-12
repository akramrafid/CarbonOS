import React from 'react';
import { Globe, FileSpreadsheet } from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryJcmTab({ handleOpenJcmExport }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#152B1D]">
          <div>
            <h2 className="font-sans font-bold text-2xl text-white flex items-center gap-2">
              <Globe className="text-[#00C853]" size={24} />
              Japan-Bangladesh Joint Crediting Mechanism (JCM) Bilateral Connector
            </h2>
            <p className="font-sans text-sm text-white/70 max-w-3xl mt-1">
              Built strictly per official JCM guidelines (JCM_BD_GL_MoR) and official monitoring spreadsheet (JCM_BD_F_MoR_Spreadsheet).
              Implements bilateral allocation split: Bangladesh NDC retention (50%) and Japan ITMO transfer (50%).
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleOpenJcmExport}
          >
            <FileSpreadsheet size={15} className="mr-2" />
            <span>Inspect JCM Monitoring Form</span>
          </Button>
        </div>

        {/* Methodology & Calculation Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-[#040906] border border-[#152B1D] p-5 rounded-xl space-y-3">
            <span className="font-mono text-[10px] text-[#00C853] uppercase tracking-wider block">
              Methodology Specification
            </span>
            <h3 className="font-sans font-bold text-base text-white">JCM_BD_AM001</h3>
            <p className="font-sans text-xs text-white/60">
              Afforestation and Reforestation of Degraded Mangrove and Coastal Ecosystems in Bangladesh.
            </p>
            <div className="pt-2 border-t border-[#152B1D] space-y-1 font-mono text-xs text-white/70">
              <div>Host Secretariat: <span className="text-white">MoEFCC DNA</span></div>
              <div>Partner Secretariat: <span className="text-white">MURC / Japan MoE</span></div>
              <div>Bilateral Ratio: <span className="text-[#00C853] font-bold">50% BD / 50% JP</span></div>
            </div>
          </div>

          <div className="bg-[#040906] border border-[#152B1D] p-5 rounded-xl space-y-3">
            <span className="font-mono text-[10px] text-[#00C853] uppercase tracking-wider block">
              Net Reduction Equation
            </span>
            <div className="font-mono text-sm bg-[#08130C] border border-[#152B1D] p-3 rounded-lg text-white">
              ER_p = RE_p - PE_p
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Reference Emissions (RE_p):</span>
                <span className="text-white font-bold">10,240.0 tCO2e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Project Emissions (PE_p):</span>
                <span className="text-white font-bold">965.2 tCO2e</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#152B1D]">
                <span className="text-[#00C853]">Net Reductions (ER_p):</span>
                <span className="text-[#00C853] font-bold">9,274.8 tCO2e</span>
              </div>
            </div>
          </div>

          <div className="bg-[#040906] border border-[#152B1D] p-5 rounded-xl space-y-3">
            <span className="font-mono text-[10px] text-[#00C853] uppercase tracking-wider block">
              Bilateral Credit Distribution
            </span>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-white/70">Bangladesh (50%):</span>
                <span className="text-[#00C853] font-bold">4,637.4 tCO2e</span>
              </div>
              <div className="w-full bg-[#152B1D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#00C853] h-full w-1/2"></div>
              </div>
              <div className="flex justify-between font-mono text-xs pt-1">
                <span className="text-white/70">Japan ITMO (50%):</span>
                <span className="text-white font-bold">4,637.4 tCO2e</span>
              </div>
            </div>
            <span className="font-sans text-[11px] text-white/40 block pt-1">
              Article 6.2 authorization confirmed by DOE DNA.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistryJcmTab;
