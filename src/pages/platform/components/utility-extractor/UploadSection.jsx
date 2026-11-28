import React from 'react';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CLIENT_PROFILES } from '../../clientProfiles';
import { PRELOADED_INVOICE_TEMPLATES } from './invoiceTemplates';

export function UploadSection({
  isLight = false,
  isProcessing,
  activeInvoice,
  onUploadFile,
  onOpenAddSegment,
  onSelectTemplate
}) {
  return (
    <div
      className={`p-6 rounded-3xl border ${isLight ? 'bg-bg-muted border-border-subtle' : 'bg-bg-canvas border-border-subtle'
        }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div>
            <h3 className="font-sans font-bold text-sm text-fg-primary">
              Upload New Industrial Utility Invoice (PDF / Scanned Bill)
            </h3>
              <p className="text-xs text-fg-secondary font-sans">
                Drop any DESCO, DPDC, WASA, Titas, or fuel invoice to run OCR and line-item extraction.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="utility-pdf-upload"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                onChange={onUploadFile}
                className="hidden"
              />
              <label
                htmlFor="utility-pdf-upload"
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-fg-inverse font-sans font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all shadow-md shadow-[#00C853]/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Ingestion &amp; OCR...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Utility Bill PDF</span>
                  </>
                )}
              </label>

              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenAddSegment}
                className="flex items-center space-x-1.5 font-sans font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-accent" />
                <span>Add Custom Segment</span>
              </Button>
            </div>
        </div>

        {/* Client Demo Invoice Presets */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-[10px] text-gray-500 uppercase font-bold mr-1">Client Sample Bills:</span>
          {Object.keys(PRELOADED_INVOICE_TEMPLATES).map((key) => {
            const client = CLIENT_PROFILES.find((c) => c.id === key);
            const isSelected = activeInvoice.filename === PRELOADED_INVOICE_TEMPLATES[key].filename;

            return (
              <Button
                key={key}
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onSelectTemplate(key)}
                className="text-[11px] font-mono h-auto min-h-0 py-1 px-3"
              >
                {client?.name || key} Bill
              </Button>
            );
          })}
        </div>
      </div>
      );
}

      export default UploadSection;
