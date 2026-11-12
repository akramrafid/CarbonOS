import React from 'react';
import { Database, Sparkles, Upload, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export const InvoiceUploadStep = ({
  isLight,
  executeAIExtraction,
  isUploading = false,
  handleFileDrop,
  uploadedFile,
  uploadedFileObj,
  setExtractionStep,
  extractionResult
}) => {
  return (
    <div className="space-y-5">
      {/* Sample Quick Loader Banner */}
      <div className={`rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border ${
        isLight ? 'bg-[#F2FBF5] border-emerald/30' : 'bg-[#0A1D12] border-[#1B4D2E]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 bg-emerald/15 border-emerald/30">
            <Database className="w-4 h-4 text-emerald" />
          </div>
          <div className="text-left">
            <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              Quick Test with Demo Sample
            </div>
            <div className={`text-[11px] ${isLight ? 'text-[#41634E]' : 'text-mist'}`}>
              Load Dexterity Textiles Ltd Q2 Audit Statement (DEPZ TX-8491)
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => executeAIExtraction("Dexterity_Textiles_ESG_Statement_Q2_2026.txt")}
          disabled={isUploading}
          icon={<Sparkles className="w-3.5 h-3.5 text-emerald" />}
        >
          Load Demo Sample (fictional)
        </Button>
      </div>

      {/* Drag and Drop Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer relative ${
          isLight 
            ? 'border-emerald/30 bg-[#F7FAF7] hover:bg-[#E8F8EE]' 
            : 'border-[#1B3B26] bg-[#040906]/80 hover:bg-[#061009]'
        }`}
      >
        <input 
          type="file" 
          id="drag-file-input"
          onChange={handleFileDrop}
          className="hidden" 
          accept=".csv,.xlsx,.xls,.pdf,.txt"
        />
        <div onClick={() => document.getElementById('drag-file-input').click()} className="space-y-3">
          <Upload className="w-10 h-10 text-emerald mx-auto animate-none" />
          <div className={`text-xs font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            {uploadedFile ? `Uploaded Document: ${uploadedFile}` : "Drag & Drop Financial spreadsheets, utility bills, or fuel invoices here"}
          </div>
          <div className={`text-[10px] ${isLight ? 'text-[#41634E]' : 'text-mist'}`}>
            Supports PDF, XLSX, CSV, TXT (Max 25MB) • Encrypted Per-Tenant Ingestion
          </div>
        </div>
      </div>

      {/* Controls & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => executeAIExtraction(uploadedFileObj || uploadedFile || "ESG_Statement_Q2_2026.xlsx")}
            disabled={isUploading}
            loading={isUploading}
            icon={<Sparkles className="w-4 h-4 text-emerald" />}
          >
            {isUploading ? "RAG Extracting..." : "Run RAG Extraction"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setExtractionStep(2)}
            icon={<ArrowRight className="w-3.5 h-3.5 text-current" />}
          >
            View Metrics & Categories
          </Button>
        </div>

        {extractionResult && (
          <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border ${
            isLight ? 'bg-emerald-50 border-emerald/30 text-emerald' : 'bg-[#0D2B1A] border-[#1B4D2E] text-emerald'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald" />
            <div className="text-left leading-none">
              <div className="font-mono text-[9px] uppercase tracking-wider font-bold text-mist">
                Status
              </div>
              <div className={`font-sans font-bold text-xs ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
                {extractionResult.review_status === 'DEMO_SAMPLE' ? 'DEMO SAMPLE — NOT CUSTOMER DATA' : 'UNREVIEWED — REVIEW REQUIRED'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceUploadStep;
