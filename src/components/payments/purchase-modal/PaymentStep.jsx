import React from 'react';
import { Smartphone, CreditCard, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export function PaymentStep({
  isLight,
  activeCredit,
  farmerRemittance,
  registryFee,
  paymentMethod,
  setPaymentMethod,
  mfsProvider,
  setMfsProvider,
  mfsNumber,
  setMfsNumber,
  mfsOTP,
  setMfsOTP,
  mfsStep,
  cardName,
  setCardName,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvc,
  setCardCvc,
  isProcessing,
  onBack,
  onInitiatePayment
}) {
  return (
    <div className="space-y-4">
      {/* Payment Method Selector */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setPaymentMethod('mfs')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
            paymentMethod === 'mfs'
              ? isLight
                ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E]'
                : 'bg-emerald/10 border-emerald text-emerald'
              : isLight
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone size={18} />
          <span className="text-[11px] font-bold">MFS Wallet</span>
        </button>

        <button
          onClick={() => setPaymentMethod('card')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
            paymentMethod === 'card'
              ? isLight
                ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E]'
                : 'bg-emerald/10 border-emerald text-emerald'
              : isLight
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard size={18} />
          <span className="text-[11px] font-bold">Corporate Card</span>
        </button>

        <button
          onClick={() => setPaymentMethod('wire')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
            paymentMethod === 'wire'
              ? isLight
                ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E]'
                : 'bg-emerald/10 border-emerald text-emerald'
              : isLight
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Building2 size={18} />
          <span className="text-[11px] font-bold">BFTN / RTGS Wire</span>
        </button>
      </div>

      {/* MFS Form */}
      {paymentMethod === 'mfs' && (
        <div
          className={`p-4 rounded-xl border space-y-3.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040A06] border-emerald/20'
          }`}
        >
          <div className="flex space-x-2">
            {['bKash', 'Nagad', 'Rocket'].map((provider) => (
              <button
                key={provider}
                onClick={() => setMfsProvider(provider)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  mfsProvider === provider
                    ? provider === 'bKash'
                      ? 'bg-[#E2136E] text-white border-[#E2136E]'
                      : provider === 'Nagad'
                      ? 'bg-[#F7941D] text-white border-[#F7941D]'
                      : 'bg-[#8C3494] text-white border-[#8C3494]'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>

          {mfsStep === 'number' ? (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                {mfsProvider} Corporate Wallet Number
              </label>
              <input
                type="text"
                value={mfsNumber}
                onChange={(e) => setMfsNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className={`w-full p-2.5 text-xs font-mono rounded-lg border focus:outline-none focus:border-emerald ${
                  isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                }`}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Enter OTP Code sent to {mfsNumber}
              </label>
              <input
                type="text"
                value={mfsOTP}
                onChange={(e) => setMfsOTP(e.target.value)}
                placeholder="6-digit OTP code"
                maxLength={6}
                className={`w-full p-2.5 text-xs font-mono rounded-lg border text-center tracking-widest text-lg font-bold focus:outline-none focus:border-emerald ${
                  isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                }`}
              />
            </div>
          )}
        </div>
      )}

      {/* Corporate Card Form */}
      {paymentMethod === 'card' && (
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#040A06] border-emerald/20'
          }`}
        >
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Cardholder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className={`w-full p-2 text-xs rounded border ${
                isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
              }`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className={`w-full p-2 text-xs font-mono rounded border ${
                isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
              }`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Expiry</label>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className={`w-full p-2 text-xs font-mono rounded border ${
                  isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">CVC</label>
              <input
                type="text"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className={`w-full p-2 text-xs font-mono rounded border ${
                  isLight ? 'bg-white border-slate-300 text-[#181414]' : 'bg-[#080F0B] border-white/10 text-white'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Wire Tab Content */}
      {paymentMethod === 'wire' && (
        <div
          className={`p-4 rounded-xl border space-y-2 text-xs ${
            isLight ? 'bg-[#f2f3ee]/80 border-[#dbf0ea]' : 'bg-[#040A06] border-emerald/20'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-mono font-bold text-emerald">RTGS Escrow Account (demo)</span>
            <span className="text-[10px] text-slate-400 font-mono">Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">BENEFICIARY</span>
              <span className="font-semibold text-white">Carbon Zero BD Escrow A/C</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">BANK NAME</span>
              <span className="font-semibold text-white">Standard Chartered BD / Motijheel</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">ACCOUNT NUMBER</span>
              <span className="font-semibold text-emerald">01-8492041-01</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">ROUTING NUMBER</span>
              <span className="font-semibold text-white">215260849</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div
        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
        }`}
      >
        <div className="flex justify-between">
          <span className="text-slate-400">Carbon Offset Subtotal ({activeCredit.tonnage} tCO₂e):</span>
          <span className="font-mono">৳{activeCredit.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-emerald">
          <span>Direct Farmer Disbursal (97%):</span>
          <span className="font-mono font-bold">৳{farmerRemittance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400 text-[11px]">
          <span>Registry & Cryptographic Ledger Fee (3%):</span>
          <span className="font-mono">৳{registryFee.toLocaleString()}</span>
        </div>
        <div
          className={`flex justify-between pt-1.5 border-t font-bold text-sm ${
            isLight ? 'border-slate-200 text-[#181414]' : 'border-white/10 text-white'
          }`}
        >
          <span>Total Authorized Settlement:</span>
          <span className="text-emerald font-mono">৳{activeCredit.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          size="md"
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onInitiatePayment}
          disabled={isProcessing}
        >
          <ShieldCheck size={16} className="mr-1.5" />
          <span>{isProcessing ? 'Processing Transaction...' : 'Pay & Settle via Escrow'}</span>
        </Button>
      </div>
    </div>
  );
}

export default PaymentStep;
