import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export const CheckoutModal = ({ credit, onClose, onSuccess }) => {
  const [step, setStep] = useState('review'); // review -> processing -> success

  const handleCheckout = () => {
    setStep('processing');
    
    // Simulate the API call to /api/credits/[id]/purchase
    // and subsequent webhook resolution
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(credit);
      }, 2000);
    }, 2500);
  };

  if (!credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0D2B1A] border border-emerald/20 w-full max-w-md rounded-[2rem] p-8 shadow-[0_0_40px_rgba(0,200,83,0.15)] relative overflow-hidden">
        
        {step === 'review' && (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 text-mist hover:text-white">✕</button>
            <h2 className="font-sans font-bold text-2xl text-white mb-2">Complete Purchase</h2>
            <p className="font-sans text-sm text-mist mb-6">You are securing verified carbon credits directly from the source.</p>
            
            <div className="bg-[#080F0B] rounded-xl p-4 border border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-mist">CREDIT ID</span>
                <span className="font-mono text-sm text-emerald">{credit.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-mist">PROJECT TYPE</span>
                <span className="font-sans text-sm text-white">{credit.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-mist">VOLUME</span>
                <span className="font-mono text-sm text-white">{credit.tonnage} tCO₂e</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-mist">Subtotal</span>
                <span className="font-mono text-white">৳{credit.price}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-mist">Platform Fee (0%)</span>
                <span className="font-mono text-white">৳0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-white text-lg">Total Due</span>
                <span className="font-mono font-bold text-emerald text-xl">৳{credit.price}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-emerald text-carbon font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-emerald/90 transition-colors"
            >
              <ShieldCheck size={20} />
              <span>Pay & Retire Credit</span>
            </button>
            <p className="text-center font-mono text-[10px] text-mist mt-4">
              92% of this payment goes instantly to the farmer via Mobile Banking.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-emerald animate-spin mb-6" />
            <h3 className="font-sans font-bold text-xl text-white mb-2">Processing Payment...</h3>
            <p className="font-mono text-xs text-amber animate-pulse">Securing credit on registry & routing funds to farmer.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-emerald/20 rounded-full flex items-center justify-center border border-emerald text-emerald mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-sans font-bold text-xl text-white mb-2">Purchase Confirmed</h3>
            <p className="font-sans text-sm text-mist mb-4">Credit {credit.id} has been retired in your name.</p>
            <p className="font-mono text-xs text-emerald bg-emerald/10 px-3 py-1 rounded">Farmer Paid Successfully ✓</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;
