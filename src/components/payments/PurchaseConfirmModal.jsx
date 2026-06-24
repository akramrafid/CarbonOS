import React, { useState } from 'react';
import PaymentStatusTracker from './PaymentStatusTracker';

const PurchaseConfirmModal = ({ creditId, onClose }) => {
  const [txId, setTxId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'mfs'
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsOTP, setMfsOTP] = useState('');
  const [mfsStep, setMfsStep] = useState('number'); // 'number' | 'otp'

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate API call to initiate transaction
    setTimeout(() => {
      const mockTxId = `TXN-${Math.random().toString(36).substring(7)}`;
      setTxId(mockTxId);
    }, 1000);
  };

  const handleCTA = () => {
    if (paymentMethod === 'mfs') {
      if (mfsStep === 'number') {
        if (!mfsNumber || mfsNumber.length < 11) {
          alert("Please enter a valid 11-digit mobile wallet number.");
          return;
        }
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setMfsStep('otp');
        }, 1200);
      } else {
        if (!mfsOTP || mfsOTP.length < 6) {
          alert("Please enter the 6-digit verification code sent to your mobile.");
          return;
        }
        handleConfirm();
      }
    } else {
      handleConfirm();
    }
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
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Payment Method</h4>
                <div className="grid grid-cols-3 gap-3">
                  <label 
                    onClick={() => setPaymentMethod('card')}
                    className={`border-2 rounded-lg p-3 cursor-pointer flex items-center space-x-2 transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-[#16A34A] bg-[#16A34A]/5' 
                        : 'border-[#E2E8F0] bg-transparent'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'card'} readOnly className="text-[#16A34A] focus:ring-[#16A34A]" />
                    <span className="text-xs font-semibold text-[#0F172A]">Corporate Card</span>
                  </label>
                  
                  <label 
                    onClick={() => setPaymentMethod('mfs')}
                    className={`border-2 rounded-lg p-3 cursor-pointer flex items-center space-x-2 transition-all ${
                      paymentMethod === 'mfs' 
                        ? 'border-[#16A34A] bg-[#16A34A]/5' 
                        : 'border-[#E2E8F0] bg-transparent'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'mfs'} readOnly className="text-[#16A34A] focus:ring-[#16A34A]" />
                    <span className="text-xs font-semibold text-[#0F172A]">Mobile Wallet</span>
                  </label>

                  <label className="border border-[#E2E8F0] rounded-lg p-3 flex items-center space-x-2 opacity-50 cursor-not-allowed">
                    <input type="radio" name="payment" disabled />
                    <span className="text-xs font-semibold text-[#0F172A]">Wire Transfer</span>
                  </label>
                </div>
              </div>

              {/* Mobile Wallet Details Inputs */}
              {paymentMethod === 'mfs' && (
                <div className="mb-6 p-4 bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl space-y-3.5 transition-all">
                  <div className="flex justify-between items-center pb-2 border-b border-[#16A34A]/10">
                    <span className="text-xs font-bold text-[#16A34A] uppercase font-mono tracking-wide">Mobile Banking Gateway</span>
                    <span className="text-[10px] font-sans font-semibold text-amber">Active Integration</span>
                  </div>
                  {mfsStep === 'number' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#475569] font-sans uppercase">Mobile Account Number</label>
                      <input 
                        type="text" 
                        maxLength="11"
                        placeholder="e.g. 01712345678" 
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#16A34A] bg-white"
                      />
                      <p className="text-[10px] text-[#475569]">Enter the 11-digit mobile wallet number linked to your mobile banking account.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#475569] font-sans uppercase">Verification Code (OTP)</label>
                      <input 
                        type="text" 
                        maxLength="6"
                        placeholder="e.g. 123456" 
                        value={mfsOTP}
                        onChange={(e) => setMfsOTP(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#16A34A] bg-white"
                      />
                      <p className="text-[10px] text-[#475569]">A 6-digit one-time PIN has been sent to {mfsNumber}.</p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <button 
                onClick={handleCTA}
                disabled={isProcessing}
                className="w-full bg-[#0A5C36] hover:bg-[#0A5C36]/90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : paymentMethod === 'mfs' ? (
                  mfsStep === 'number' ? "Next: Verify Mobile Wallet" : "Confirm & Pay ৳ 15,400"
                ) : (
                  "Confirm Purchase — ৳ 15,400"
                )}
              </button>

              <p className="text-center text-xs text-[#475569] mt-4">
                // PITCH POINT: The real-time farmer payout pipeline is our core differentiation.
                97% goes directly to the farmer instantly via mobile banking system.
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
