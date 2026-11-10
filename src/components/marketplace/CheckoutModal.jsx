import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '../Modal';

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
    <Modal
      isOpen={!!credit}
      onClose={onClose}
      size="sm"
      title={step === 'review' ? "Complete Purchase" : undefined}
      subtitle={step === 'review' ? "Demo checkout: no credit is transferred, retired or registered." : undefined}
      showClose={step === 'review'}
    >
      <div className="p-6">
        {step === 'review' && (
          <>
            <div className="bg-gray-50 dark:bg-[#080F0B] rounded-xl p-4 border border-gray-200 dark:border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-gray-500 dark:text-mist">CREDIT ID</span>
                <span className="font-mono text-sm text-emerald-600 dark:text-emerald font-semibold">{credit.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-gray-500 dark:text-mist">PROJECT TYPE</span>
                <span className="font-sans text-sm text-gray-900 dark:text-white font-medium">{credit.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500 dark:text-mist">VOLUME</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">{credit.tonnage} tCO₂e</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-white/10 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-gray-600 dark:text-mist">Subtotal</span>
                <span className="font-mono text-gray-900 dark:text-white">৳{credit.price}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-gray-600 dark:text-mist">Platform Fee (0%)</span>
                <span className="font-mono text-gray-900 dark:text-white">৳0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-gray-900 dark:text-white text-lg">Total Due</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald text-xl">৳{credit.price}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-emerald-600 dark:bg-emerald text-white dark:text-carbon font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-emerald-700 dark:hover:bg-emerald/90 transition-colors shadow-sm"
            >
              <ShieldCheck size={20} />
              <span>Pay & Retire Credit</span>
            </button>
            <p className="text-center font-mono text-[10px] text-gray-500 dark:text-mist mt-4">
              92% of this payment goes instantly to the farmer via Mobile Banking.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald animate-spin mb-4" />
            <h3 className="font-sans font-bold text-xl text-gray-900 dark:text-white mb-2">Processing Payment...</h3>
            <p className="font-mono text-xs text-amber-600 dark:text-amber animate-pulse">Securing credit on registry & routing funds to farmer.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald/20 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-600 dark:text-emerald mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-sans font-bold text-xl text-gray-900 dark:text-white mb-2">Purchase Confirmed</h3>
            <p className="font-sans text-sm text-gray-600 dark:text-mist mb-4">Credit {credit.id} has been retired in your name.</p>
            <p className="font-mono text-xs text-emerald-700 dark:text-emerald bg-emerald-50 dark:bg-emerald/10 border border-emerald-200 dark:border-emerald/20 px-3 py-1 rounded">Farmer Paid Successfully ✓</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckoutModal;
