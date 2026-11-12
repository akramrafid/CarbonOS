import React from 'react';
import { ShieldCheck, CheckCircle2, ShieldAlert, Filter, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export function RegistryRulesTab({
  rules,
  testSector,
  setTestSector,
  testMitigation,
  setTestMitigation,
  testNdc,
  setTestNdc,
  handleTestEligibility,
  testResult
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#08130C] border border-[#152B1D] rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#152B1D]">
          <div>
            <h2 className="font-sans font-bold text-2xl text-white flex items-center gap-2">
              <ShieldCheck className="text-[#00C853]" size={24} />
              DOE Positive / Negative List Rules Engine
            </h2>
            <p className="font-sans text-sm text-white/70 max-w-3xl mt-1">
              Decoupled compliance database representing the Department of Environment's dynamic criteria.
              Non-Negotiable Constraint #3 requires verified Positive List standing before any monitoring report submission.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-white/50">Status:</span>
            <span className="font-mono text-xs text-[#00C853] bg-[#00C853]/10 border border-[#00C853]/20 px-3 py-1 rounded-full">
              Active & Synchronized
            </span>
          </div>
        </div>

        {/* Rules Table */}
        <div className="mt-6 w-full overflow-hidden">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pb-1 md:hidden">
            <span>← Scroll rules table horizontally →</span>
            <span className="text-[10px]">720px</span>
          </div>
          <div className="overflow-x-auto touch-pan-x w-full">
            <table className="w-full text-left font-mono text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-[#152B1D] text-white/50 uppercase tracking-wider">
                  <th className="pb-3 px-4">Sector</th>
                  <th className="pb-3 px-4">Mitigation Activity</th>
                  <th className="pb-3 px-4">NDC 3.0 Type</th>
                  <th className="pb-3 px-4">Eligibility Status</th>
                  <th className="pb-3 px-4">Regulatory Gazette Reference</th>
                  <th className="pb-3 px-4">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152B1D]/60 text-white/80">
                {rules.map((rule) => {
                  const isPositive = rule.status === 'positive_list';
                  const isNegative = rule.status === 'negative_list';
                  return (
                    <tr key={rule.id} className="hover:bg-[#0D2B1A]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{rule.sector}</td>
                      <td className="py-3.5 px-4 text-[#00C853]">{rule.mitigation_type}</td>
                      <td className="py-3.5 px-4 text-white/70 uppercase">{rule.ndc_commitment_type}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isPositive
                              ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30'
                              : isNegative
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isPositive && <CheckCircle2 size={12} className="mr-1.5" />}
                          {isNegative && <ShieldAlert size={12} className="mr-1.5" />}
                          {rule.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-white/60 font-sans text-xs max-w-xs truncate"
                        title={rule.regulatory_reference}
                      >
                        {rule.regulatory_reference || 'Official Article 6 Guidance'}
                      </td>
                      <td className="py-3.5 px-4 text-[#00C853]">
                        {rule.is_active ? 'TRUE' : 'FALSE'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Eligibility Tester */}
        <div className="mt-10 p-6 rounded-2xl bg-[#040906] border border-[#152B1D]">
          <h3 className="font-sans font-bold text-base text-white mb-2 flex items-center space-x-2">
            <Filter size={16} className="text-[#00C853]" />
            <span>Interactive DOE Compliance Sandbox Evaluator</span>
          </h3>
          <p className="font-sans text-xs text-white/60 mb-4">
            Simulate live evaluation against DOE criteria before submitting project registration packets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="font-mono text-xs text-white/50 block mb-1.5">Sector</label>
              <select
                value={testSector}
                onChange={(e) => setTestSector(e.target.value)}
                className="w-full bg-[#08130C] border border-[#152B1D] text-white text-xs font-mono p-2.5 rounded-xl focus:border-[#00C853] focus:outline-none"
              >
                <option value="Forestry">Forestry</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Energy">Energy</option>
                <option value="Industry">Industry</option>
                <option value="Waste">Waste</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-xs text-white/50 block mb-1.5">Mitigation Type</label>
              <select
                value={testMitigation}
                onChange={(e) => setTestMitigation(e.target.value)}
                className="w-full bg-[#08130C] border border-[#152B1D] text-white text-xs font-mono p-2.5 rounded-xl focus:border-[#00C853] focus:outline-none"
              >
                <option value="Afforestation">Afforestation</option>
                <option value="Reforestation">Reforestation</option>
                <option value="AWD Rice Cultivation">AWD Rice Cultivation</option>
                <option value="Solar Irrigation">Solar Irrigation</option>
                <option value="Clean Cookstoves">Clean Cookstoves</option>
                <option value="Coal Power Plant Retrofit">Coal Power Plant Retrofit</option>
                <option value="Fluorinated Gas (HFC-23) Destruction">Fluorinated Gas Destruction</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-xs text-white/50 block mb-1.5">NDC Commitment Type</label>
              <select
                value={testNdc}
                onChange={(e) => setTestNdc(e.target.value)}
                className="w-full bg-[#08130C] border border-[#152B1D] text-white text-xs font-mono p-2.5 rounded-xl focus:border-[#00C853] focus:outline-none"
              >
                <option value="conditional">conditional</option>
                <option value="unconditional">unconditional</option>
                <option value="beyond_ndc">beyond_ndc</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={handleTestEligibility}
            >
              Run Compliance Check
            </Button>
          </div>

          {testResult && (
            <div
              className={`mt-5 p-4 rounded-xl border font-mono text-xs flex items-start space-x-3 ${
                testResult.eligible
                  ? 'bg-[#0D2B1A] border-[#00C853]/40 text-[#00C853]'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              {testResult.eligible ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#00C853]" />
              ) : (
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
              )}
              <div>
                <span className="font-bold uppercase tracking-wider block">
                  Evaluation: {testResult.status.replace('_', ' ')} —{' '}
                  {testResult.eligible ? 'Eligible for Submission' : 'Blocked by DOE Registry Rules'}
                </span>
                <p className="font-sans text-xs text-white/80 mt-1">{testResult.rule.notes}</p>
                <span className="text-[11px] text-white/50 block mt-1">
                  Reference: {testResult.rule.regulatory_reference}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistryRulesTab;
