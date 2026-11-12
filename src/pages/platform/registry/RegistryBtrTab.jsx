import React from 'react';
import { FileText, Download } from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryBtrTab({ setShowBtrJsonModal, handleDownloadBtrCsv }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#152B1D]">
          <div>
            <h2 className="font-sans font-bold text-2xl text-white flex items-center gap-2">
              <FileText className="text-[#00C853]" size={24} />
              UNFCCC Article 13 & 6.2 Biennial Transparency Report (BTR) Export
            </h2>
            <p className="font-sans text-sm text-white/70 max-w-3xl mt-1">
              Structured Summary tables for reporting internationally transferred mitigation outcomes (ITMOs)
              under the Paris Agreement Enhanced Transparency Framework (ETF).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBtrJsonModal(true)}
            >
              View JSON Payload
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadBtrCsv}
            >
              <Download size={14} className="mr-1.5" />
              <span>Download Official BTR (CSV)</span>
            </Button>
          </div>
        </div>

        {/* National Inventory Sector Adjustments breakdown */}
        <div className="mt-8 space-y-4">
          <h3 className="font-mono text-xs text-[#00C853] uppercase tracking-wider font-bold">
            National Greenhouse Gas Inventory Sector Adjustments (tCO2e)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="bg-[#040906] border border-[#152B1D] p-4 rounded-xl">
              <span className="font-mono text-[10px] text-white/50 block">LULUCF / Forestry</span>
              <span className="font-mono text-xl font-bold text-[#00C853] mt-1 block">+10,000.0</span>
              <span className="font-sans text-[10px] text-white/40">Sundarbans Afforestation</span>
            </div>

            <div className="bg-[#040906] border border-[#152B1D] p-4 rounded-xl">
              <span className="font-mono text-[10px] text-white/50 block">Agriculture</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">0.0</span>
              <span className="font-sans text-[10px] text-white/40">AWD Pilot Reserve</span>
            </div>

            <div className="bg-[#040906] border border-[#152B1D] p-4 rounded-xl">
              <span className="font-mono text-[10px] text-white/50 block">Energy</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">0.0</span>
              <span className="font-sans text-[10px] text-white/40">Clean Cooking</span>
            </div>

            <div className="bg-[#040906] border border-[#152B1D] p-4 rounded-xl">
              <span className="font-mono text-[10px] text-white/50 block">Waste</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">0.0</span>
              <span className="font-sans text-[10px] text-white/40">Pending Review</span>
            </div>

            <div className="bg-[#040906] border border-[#152B1D] p-4 rounded-xl">
              <span className="font-mono text-[10px] text-white/50 block">IPPU</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">0.0</span>
              <span className="font-sans text-[10px] text-white/40">Zero Authorized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistryBtrTab;
