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
      className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 bg-bg-surface border-border-subtle"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
            <Award className="w-4 h-4" />
            <span>Illustrative Assurance Template (Demo — Not Externally Assured)</span>
          </div>
          <h3 className="font-bold text-xl text-fg-primary mt-0.5">Sample Limited Assurance Statement</h3>
          <p className="text-xs text-fg-secondary mt-0.5">Illustrative ISAE 3410 / ISO 14064-3:2019 draft template — not externally verified until an accredited verifier signs.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopyOpinion}
            className="flex items-center space-x-1.5 font-mono text-xs"
          >
            {copiedKey === 'opinion' ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Template Text</span>
          </Button>

          {/* [COMMENTED OUT FOR PERSONAL REFERENCE — fake Export Official PDF toast claiming printed signed PDF]
          <Button variant="primary" size="sm" onClick={() => showToast('Formal assurance letter printed to PDF with sovereign digital signature', 'success')}>
            Export Official PDF
          </Button>
          */}
          <Button
            variant="secondary"
            size="sm"
            disabled
            aria-disabled="true"
            title="Demo template only — connect an accredited VVB workflow to issue signed PDFs"
            className="flex items-center space-x-1.5 font-mono text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Demo Template — No VVB PDF</span>
          </Button>
        </div>
      </div>

      {/* Rendered Assurance Letter */}
          <div className="p-6 sm:p-8 rounded-2xl bg-bg-canvas border border-border-subtle space-y-6 font-serif text-xs leading-relaxed text-fg-primary">
            <div className="flex flex-wrap justify-between items-start gap-2 border-b border-border-subtle pb-4 font-sans not-italic">
              <div>
                <h4 className="font-bold text-sm text-fg-primary">Illustrative Assurance Body (Demo Template Only)</h4>
                <p className="text-[11px] text-fg-secondary">Sample Verification Workspace — Not an Accredited VVB Opinion</p>
                <p className="text-[10px] text-amber-800 dark:text-amber-400 font-mono mt-0.5">Status: Unverified Demo Template (ISAE 3410 / ISO 14064-3 Reference Format)</p>
              </div>
                <div className="text-right font-mono text-[10px] text-fg-secondary">
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
                <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans not-italic">
                  <div>
                    <div className="font-bold text-fg-primary text-xs">[Sample Verifier Signature Placeholder]</div>
                    <div className="text-[11px] text-fg-secondary">Pending Accredited Third-Party VVB Sign-Off</div>
                    <div className="text-[10px] text-amber-800 dark:text-amber-400 font-mono mt-0.5">Demo Reference: DEMO-DRAFT-{client.id.toUpperCase()}</div>
                  </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-[10px] text-right space-y-0.5">
                        <div className="text-amber-800 dark:text-amber-400 font-bold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>DEMO TEMPLATE SEAL (NOT SIGNED)</span>
                        </div>
                        <div className="text-gray-400 truncate max-w-xs">Awaiting live VVB cryptographic attestation</div>
                        <div className="text-gray-500">Demo Reference Draft Only</div>
                      </div>
                    </div>
                  </div>
                </div>
                );
}

                export default SignoffTab;
