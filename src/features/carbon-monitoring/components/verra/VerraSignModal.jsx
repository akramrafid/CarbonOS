import React from 'react';
import { Key, Sparkles, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, IconButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function VerraSignModal({
  isOpen,
  onClose,
  isLight,
  selectedJob,
  generatedPublicKey,
  copyToClipboard,
  signFormData = {},
  setSignFormData,
  handleGenerateKeypair,
  generatingKeys,
  showPrivateKey,
  setShowPrivateKey,
  handleSubmitSignature,
  signingLedger
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Affix Ed25519 Validator Co-Signature"
      description="Open Forest Protocol (OFP) Multi-Validator Consensus Layer"
      size="lg"
    >
      <div className="space-y-4">
        {/* Target Hash Info */}
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
          isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className={`font-bold ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Target Record ID:</span>
            <span className="font-mono text-emerald font-bold">{selectedJob?.id || 'res_sundarbans_001'}</span>
          </div>
          <p className={`text-[10px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
            Signing this calculation attests to the sensor telemetry, conformal uncertainty deductions, and IPCC Tier-3 compliance. Signatures are verified with Ed25519 and permanently anchored to the provenance block.
          </p>
        </div>

        {/* Generated Public Key Banner (if keypair generated) */}
        {generatedPublicKey && (
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono transition-all ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="space-y-0.5 truncate mr-3">
              <span className="text-[10px] uppercase font-bold text-emerald tracking-wider block">
                Derived Ed25519 Public Key
              </span>
              <p className="truncate text-[11px] font-semibold">{generatedPublicKey}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(generatedPublicKey, 'Public Key')}
              className="text-xs font-bold"
              aria-label="Copy public key"
              leftIcon={<Copy size={12} />}
            >
              Copy
            </Button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmitSignature} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="validator_id" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
              Validator ID
            </label>
            <Input
              id="validator_id"
              type="text"
              required
              value={signFormData.validator_id || ''}
              onChange={(e) => setSignFormData(prev => ({ ...prev, validator_id: e.target.value }))}
              placeholder="val_sgs_forestdmrv"
              className="font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="validator_name" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Validator Full Name
              </label>
              <Input
                id="validator_name"
                type="text"
                required
                value={signFormData.validator_name || ''}
                onChange={(e) => setSignFormData(prev => ({ ...prev, validator_name: e.target.value }))}
                placeholder="Dr. Tariq Ahmed"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="organization" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Accredited Organization
              </label>
              <Input
                id="organization"
                type="text"
                required
                value={signFormData.organization || ''}
                onChange={(e) => setSignFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="private_key_hex" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Ed25519 Private Key (Hex, 64 characters)
              </label>
              <Button
                variant="link"
                size="sm"
                onClick={handleGenerateKeypair}
                disabled={generatingKeys}
                leftIcon={<Sparkles size={11} />}
                className="text-[10px] !p-0 !min-h-0 !h-auto font-bold"
              >
                <span>{generatingKeys ? 'Generating...' : 'Generate New Keypair'}</span>
              </Button>
            </div>
            <div className="relative">
              <Input
                id="private_key_hex"
                type={showPrivateKey ? "text" : "password"}
                required
                value={signFormData.private_key_hex || ''}
                onChange={(e) => setSignFormData(prev => ({ ...prev, private_key_hex: e.target.value }))}
                placeholder="Paste 64-character private key hex or click 'Generate New Keypair'"
                className="font-mono text-[11px] pr-10"
              />
              <IconButton
                icon={showPrivateKey ? <EyeOff size={15} /> : <Eye size={15} />}
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
                className="absolute right-2 top-1/2 -translate-y-1/2 !min-h-0 !h-7 !w-7"
              />
            </div>
            <p className={`text-[10px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              Private key never leaves the client/session. Only the signature and public key are affixed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald/20">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={signingLedger}
              className="flex items-center space-x-2"
            >
              {signingLedger ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Verifying & Signing...</span>
                </>
              ) : (
                <>
                  <Key size={15} />
                  <span>Sign & Affix to Ledger</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default VerraSignModal;
