import React from 'react';
import { Award, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SignoffTab({
  isLight = false,
  client,
  copiedKey,
  onCopyOpinion,
  showToast
}) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 ${
        isLight ? 'bg-white border-border-subtle' : 'bg-bg-elevated border-border-subtle'
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
            <Award className="w-4 h-4" />
            <span>Third-Party Verification Opinion Document</span>
          </div>
          <h3 className="font-bold text-xl mt-0.5">Independent Limited Assurance Statement</h3>
          <p className="text-xs text-gray-400 mt-0.5">Formal assurance letter prepared in accordance with ISAE 3410 and ISO 14064-3:2019.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopyOpinion}
            className="flex items-center space-x-1.5 font-mono text-xs"
          >
            {copiedKey === 'opinion' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Text</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => showToast('Formal assurance letter printed to PDF with sovereign digital signature', 'success')}
            className="flex items-center space-x-1.5 font-mono text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Official PDF</span>
          </Button>
        </div>
      </div>

      {/* Rendered Assurance Letter */}
      <div className="p-8 rounded-2xl bg-black/40 border border-white/10 space-y-6 font-serif text-xs leading-relaxed text-gray-200">
        <div className="flex justify-between items-start border-b border-white/10 pb-4 font-sans not-italic">
          <div>
            <h4 className="font-bold text-sm text-white">CarbonZero BD Independent Assurance Practice</h4>
            <p className="text-[11px] text-gray-400">Gulshan-2 Carbon Exchange Tower, Dhaka-1212, Bangladesh</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Accreditation: ISO 14065 / DoE Recognized GHG Verification Body</p>
          </div>
          <div className="text-right font-mono text-[10px] text-gray-400">
            <span>Date: April 18, 2026</span><br />
            <span>Ref: CZBD-VER-{client.id.toUpperCase()}-2026-01</span>
          </div>
        </div>

        <div className="space-y-4">
          <p>
            <strong>To the Board of Directors and Stakeholders of {client.name}:</strong>
          </p>
          <p>
            We have undertaken a limited assurance engagement of the accompanying Greenhouse Gas (GHG) Assertion of <strong>{client.name}</strong> for the annual reporting period ended December 31, 2025. The inventory comprises direct emissions (Scope 1), energy indirect emissions (Scope 2), and selected other indirect emissions (Scope 3) quantified in accordance with the <em>GHG Protocol Corporate Accounting and Reporting Standard</em> and <em>ISO 14064-1:2018</em>.
          </p>
          <p>
            <strong>Management’s Responsibility:</strong> Management is responsible for the preparation and fair presentation of the GHG assertion in accordance with the quantification criteria. This includes designing, implementing, and maintaining an internal data control framework, primary invoice evidence retention, and the continuous integrity of activity meter logs.
          </p>
          <p>
            <strong>Our Independence and Quality Control:</strong> We have complied with the Code of Ethics for Professional Accountants issued by the IESBA, which includes independence and other requirements founded on fundamental principles of integrity, objectivity, professional competence, and due care.
          </p>
          <p>
            <strong>Conclusion:</strong> Based on the procedures we have performed and the evidence we have obtained, nothing has come to our attention that causes us to believe that the GHG inventory assertion of <strong>{client.name}</strong> is not prepared, in all material respects, in accordance with ISO 14064-1:2018.
          </p>
        </div>

        {/* Signature & Seal Block */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans not-italic">
          <div>
            <div className="font-bold text-white text-xs">Engr. Kazi Tariqul Islam, Lead Verifier</div>
            <div className="text-[11px] text-gray-400">Senior Partner, Climate Assurance &amp; Carbon Accounting</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Cert ID: ISO14064-LEAD-BD-88219</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 font-mono text-[10px] text-right space-y-0.5">
            <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 DIGITAL VERIFICATION SEAL</span>
            </div>
            <div className="text-gray-400 truncate max-w-xs">e4a9c8b7f2d1e0a3b6c5d4e8f1a2b3c4d5e6f7a8b9c0d1e2</div>
            <div className="text-gray-500">Immutable Block Verification Timestamp: 2026-04-18T10:14:22Z</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignoffTab;
