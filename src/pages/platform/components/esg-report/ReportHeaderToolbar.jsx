import React from 'react';
import { Award, Check, Copy, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportHeaderToolbar({
  isLight,
  activeClient,
  copied,
  onCopyMarkdown,
  onPrint,
  onExportJSON
}) {
  return (
    <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all relative overflow-hidden ${
      isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
            <Award className="w-4 h-4" />
            <span>Executive ESG Disclosure Suite</span>
          </div>
          <h2 className={`font-sans font-bold text-2xl sm:text-3xl mt-1 tracking-tight ${
            isLight ? 'text-[#0F2417]' : 'text-white'
          }`}>
            ISO 14064-1 GHG Inventory Report
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
            isLight ? 'text-slate-500' : 'text-[#7C9A88]'
          }`}>
            Formal corporate sustainability disclosure statement for <strong className="text-[#00C853]">{activeClient.legalName}</strong>. Ready for auditor assurance, board governance, and EU CBAM filing.
          </p>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopyMarkdown}
            leftIcon={copied ? <Check className="w-4 h-4 text-[#00C853]" /> : <Copy className="w-4 h-4 text-[#00C853]" />}
          >
            {copied ? 'Copied Markdown' : 'Copy Markdown'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onPrint}
            leftIcon={<Printer className="w-4 h-4 text-[#00C853]" />}
          >
            Print / PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onExportJSON}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Audit JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReportHeaderToolbar;
