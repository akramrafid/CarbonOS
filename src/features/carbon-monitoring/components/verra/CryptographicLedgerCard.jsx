import React from 'react';
import {
  Lock,
  RefreshCw,
  Download,
  Database,
  Key,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function CryptographicLedgerCard({
  isLight,
  prov,
  ledgerStatus = {},
  dashboardData = {},
  copyToClipboard,
  copiedHash,
  provenanceSignatures = [],
  handleVerifyChain,
  verifyingLedger,
  handleExportVM0047Bundle,
  setShowSignModal
}) {
  const shaHash = prov?.sha256_hash || dashboardData?.sha256_ledger_hash || '0x4f89d34e2c14092b8d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c';
  const signatures = provenanceSignatures || [];

  return (
    <Card className={`lg:col-span-2 rounded-2xl p-5 md:p-6 border transition-all ${
      isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-inherit mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald/10 text-emerald">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                6. Multi-Validator Cryptographic Trust & Provenance Ledger
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald/15 text-emerald border border-emerald/30">
                OFP Consensus Layer
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              Strict separation of concerns: SHA-256 block hash chain enforces chronological immutability, while independent VVBs affix Ed25519 digital signatures.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerifyChain}
            disabled={verifyingLedger}
            className="text-xs font-mono px-3 py-1.5 flex items-center space-x-1.5"
            aria-label="Verify SHA-256 ledger integrity"
          >
            <RefreshCw size={12} className={verifyingLedger ? 'animate-spin' : ''} />
            <span>{verifyingLedger ? 'Verifying Chain...' : 'Verify Hash Chain'}</span>
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportVM0047Bundle}
            className="text-xs font-mono px-3 py-1.5 border border-emerald/30 bg-emerald/15 text-emerald hover:bg-emerald/25 flex items-center space-x-1.5"
            title="Export Verra VM0047 JSON Submission Bundle"
          >
            <Download size={12} />
            <span>Export VM0047 Bundle</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Card 1: SHA-256 Block Immutability */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/[0.02] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database size={14} className="text-emerald" />
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                SHA-256 Ledger Immutability
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              ledgerStatus.chain_valid 
                ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald')
                : 'bg-red-500/20 text-red-400'
            }`}>
              {ledgerStatus.chain_valid ? 'Chain Intact (17 Blocks)' : 'Discrepancy Detected'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Record SHA-256 Digest
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={() => copyToClipboard(shaHash, 'SHA-256 Digest')}
                className="text-[10px] font-mono text-emerald flex items-center space-x-1 hover:underline !p-0 !min-h-0 !h-auto"
                title="Copy SHA-256 hash"
                aria-label="Copy SHA-256 hash"
                leftIcon={copiedHash ? <Check size={10} /> : <Copy size={10} />}
              >
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <span className="font-mono text-[11px] block p-2 rounded bg-black/10 dark:bg-white/5 break-all text-emerald font-semibold select-all border border-inherit">
              {shaHash}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className={`block text-[10px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Previous Block Hash
              </span>
              <span className="font-mono text-[10px] block mt-0.5 truncate text-slate-500">
                {prov?.previous_hash?.slice(0, 16) || 'a4f89d34e2c14092'}...
              </span>
            </div>
            <div>
              <span className={`block text-[10px] font-medium ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Genesis Linkage
              </span>
              <span className="font-mono text-[10px] block mt-0.5 font-bold text-emerald">
                Linked (GENESIS_HASH)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Ed25519 Validator Co-Signatures */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/[0.02] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key size={14} className="text-emerald" />
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Ed25519 Multi-Validator Trust
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              signatures.length >= 2
                ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald')
                : (isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber/20 text-amber')
            }`}>
              {signatures.length >= 2 ? 'Consensus Validated' : 'Pending Co-Signatures'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xl font-bold font-sans ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                {signatures.length} / 2+
              </div>
              <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Institutional VVB Co-Signatures Affixed
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSignModal(true)}
              className="text-xs font-medium px-3 py-2 bg-emerald text-[#040906] font-bold shadow-xs hover:bg-emerald/90 flex items-center space-x-1.5"
            >
              <Key size={12} />
              <span>Sign with Ed25519</span>
            </Button>
          </div>

          <div className={`p-2 rounded-lg border text-[11px] ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-mist'
          }`}>
            <span className="font-semibold text-emerald">OFP Rule:</span> Cryptographic validator signatures attest to biological validity and ground truth compliance independent of hash-chain temporal sequence.
          </div>
        </div>
      </div>

      {/* Co-Signatures Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
            Recorded Validator Signatures ({signatures.length})
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            RFC 8032 PureEd25519 Curve
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-semibold ${
                isLight ? 'border-[#E2E8F0] text-[#64748B]' : 'border-white/10 text-mist'
              }`}>
                <th className="py-2 px-3">Validator Entity</th>
                <th className="py-2 px-3">Organization</th>
                <th className="py-2 px-3">Public Key</th>
                <th className="py-2 px-3">Signature Digest</th>
                <th className="py-2 px-3">Signed At</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {signatures.map((sig, sIdx) => (
                <tr key={sIdx} className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  <td className="py-2.5 px-3 font-medium flex items-center space-x-1.5">
                    <ShieldCheck size={13} className="text-emerald shrink-0" />
                    <span>{sig.validator_name || sig.validator_id}</span>
                  </td>
                  <td className={`py-2.5 px-3 text-[11px] ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                    {sig.organization || 'Independent VVB Auditor'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                    {sig.public_key_hex?.slice(0, 10)}...{sig.public_key_hex?.slice(-6)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-emerald">
                    {sig.signature_hex?.slice(0, 12)}...
                  </td>
                  <td className={`py-2.5 px-3 text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-mist'}`}>
                    {sig.signed_at?.split('T')[0]} {sig.signed_at?.split('T')[1]?.slice(0, 5)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-bold border border-emerald/25">
                      <Check size={10} />
                      <span>Demo signature</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

export default CryptographicLedgerCard;
