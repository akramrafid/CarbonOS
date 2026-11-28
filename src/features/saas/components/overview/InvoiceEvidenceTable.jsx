import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

export const InvoiceEvidenceTable = ({
  isLight,
  extractionResult,
  executeAIExtraction
}) => {
  if (!extractionResult) {
    return (
      <Card className="p-8 text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-emerald mx-auto" />
        <div className={`text-sm font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
          No Extracted Audit Traces Yet
        </div>
        <p className="text-xs text-mist max-w-md mx-auto">
          Ingest a document or click "Load Demo Sample (fictional)" to see extracted values with their source snippets.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald" />}
        >
          Load Sample Document Now
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-inherit">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald" />
          <span className={`font-sans font-bold text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Extraction Evidence — {extractionResult.filename}
          </span>
        </div>
        <span className="font-mono text-[10px] text-mist">
          {extractionResult.overall_confidence == null ? 'Rule-based match (no model confidence)' : `Confidence: ${Math.round(extractionResult.overall_confidence * 100)}%`} • Not verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="font-bold border-b text-[10px] uppercase font-mono text-mist border-inherit">
              <th className="py-3 px-3 min-w-[130px]">Metric</th>
              <th className="py-3 px-3 min-w-[120px]">Scope</th>
              <th className="py-3 px-3 min-w-[140px]">Extracted Value</th>
              <th className="py-3 px-3 min-w-[95px]">Source Page</th>
              <th className="py-3 px-3 min-w-[260px]">Source Snippet</th>
              <th className="py-3 px-3 min-w-[90px] text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {(extractionResult.details || []).map((item, idx) => (
              <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                <td className={`py-3 px-3 font-bold capitalize whitespace-nowrap ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {item.param_name}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <Badge variant={item.scope?.toLowerCase().includes('scope 1') ? 'emerald' : item.scope?.toLowerCase().includes('scope 2') ? 'accent' : 'neutral'} size="sm">
                    {item.scope}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono font-bold whitespace-nowrap text-emerald">
                  {Number(item.value).toLocaleString()} {item.unit}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap text-mist">
                  Page {item.source_page || 1}
                </td>
                <td className="py-3 px-3 text-[11px] italic max-w-[360px] truncate text-mist" title={item.raw_snippet}>
                  "{item.raw_snippet}"
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <Badge variant="neutral" size="sm">
                    {item.confidence == null ? '—' : `${Math.round(item.confidence * 100)}%`}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default InvoiceEvidenceTable;
