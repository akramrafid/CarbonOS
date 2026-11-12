import React from 'react';
import { Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function InquiriesTab({
  isLight = false,
  inquiries,
  newInquiryVerifier,
  setNewInquiryVerifier,
  newInquiryQuestion,
  setNewInquiryQuestion,
  onAddInquiry,
  showToast
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
        isLight ? 'bg-white border-[#E2E8E3]' : 'bg-[#08130C] border-[#152B1D]'
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-lg">Verifier Question &amp; Inquiry Register</h3>
          <p className="text-xs text-gray-400 mt-0.5">Pre-cleared technical responses and notes to standard third-party assurance inquiries.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => showToast('Inquiry export downloaded for external audit packet', 'success')}
          className="flex items-center space-x-1.5 font-mono text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Q&amp;A PDF</span>
        </Button>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div key={inq.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  {inq.verifier}
                </span>
                <span className="text-xs text-gray-500 font-mono">Recorded: {inq.date}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  inq.status === 'Addressed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {inq.status}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-sans flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{inq.question}</span>
              </h4>
              <div className="pl-6 text-xs text-gray-300 leading-relaxed font-sans bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2">
                <strong className="text-[#00E676] block mb-1 font-mono text-[10px] uppercase">Corporate Technical Answer:</strong>
                {inq.response}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record New Verifier Question Form */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 font-mono">Log New Verifier Question</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Verifier Institution (e.g. SGS, Bureau Veritas)"
            value={newInquiryVerifier}
            onChange={(e) => setNewInquiryVerifier(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-white/10 bg-black/30 text-white focus:outline-none focus:border-[#00C853]"
          />
          <input
            type="text"
            placeholder="Technical Question or Data Clarification"
            value={newInquiryQuestion}
            onChange={(e) => setNewInquiryQuestion(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-white/10 bg-black/30 text-white sm:col-span-2 focus:outline-none focus:border-[#00C853]"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddInquiry}
        >
          Add to Inquiry Register
        </Button>
      </div>
    </div>
  );
}

export default InquiriesTab;
