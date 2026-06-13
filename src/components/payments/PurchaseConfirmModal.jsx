import React, { useState } from 'react';
import PaymentStatusTracker from './PaymentStatusTracker';

const PurchaseConfirmModal = ({ creditId, onClose }) => {
  const [txId, setTxId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate API call to initiate transaction
    setTimeout(() => {
      const mockTxId = `TXN-${Math.random().toString(36).substring(7)}`;
      setTxId(mockTxId);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h2 className="text-xl font-bold text-[#0F172A]">Secure Checkout</h2>
          {!txId && (
            <button onClick={onClose} className="text-[#475569] hover:text-[#0F172A] p-2">✕</button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!txId ? (
            <>
              {/* Credit Details Card */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono text-[#16A34A] bg-[#16A34A]/10 px-2 py-1 rounded">Verra VCS</span>
                    <h3 className="font-semibold text-[#0F172A] mt-2">Solar Irrigation Initiative</h3>
                  </div>
                  <span className="font-mono text-sm text-[#475569]">ID: {creditId}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#475569]">Volume</p>
                    <p className="font-mono text-lg text-[#0F172A]">1.4 tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#475569]">Total Price</p>
                    <p className="font-bold text-xl text-[#0A5C36]">৳ 15,400</p>
                  </div>
                </div>
              </div>

              {/* Payment Selector */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="border-2 border-[#16A34A] bg-[#16A34A]/5 rounded-lg p-3 cursor-pointer flex items-center space-x-2">
                    <input type="radio" name="payment" defaultChecked className="text-[#16A34A] focus:ring-[#16A34A]" />
                    <span className="text-sm font-medium">Corporate Card</span>
                  </label>
                  <label className="border border-[#E2E8F0] rounded-lg p-3 cursor-pointer flex items-center space-x-2 opacity-50">
                    <input type="radio" name="payment" disabled />
                    <span className="text-sm font-medium">Wire Transfer</span>
                  </label>
                </div>
              </div>

              {/* CTA */}
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full bg-[#0A5C36] hover:bg-[#0A5C36]/90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  "Confirm Purchase — ৳ 15,400"
                )}
              </button>

              <p className="text-center text-xs text-[#475569] mt-4">
                // PITCH POINT: The real-time farmer payout pipeline is our core differentiation.
                97% goes directly to the farmer instantly via bKash.
              </p>
            </>
          ) : (
            /* Live Status Tracker */
            <div className="py-4">
              <PaymentStatusTracker 
                transactionId={txId} 
                onComplete={() => {
                  console.log("Payment flow completed visually.");
                }}
              />
              
              <div className="mt-8 text-center">
                <button 
                  onClick={onClose}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-100 text-[#0F172A] font-semibold py-3 rounded-lg transition-colors"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PurchaseConfirmModal;
