import React, { useState, useEffect } from 'react';
import FarmerPaidCard from './FarmerPaidCard';

const PaymentStatusTracker = ({ transactionId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentData, setPaymentData] = useState(null);

  // Mocking the WebSocket behavior for the Vite SPA
  useEffect(() => {
    if (!transactionId) return;

    const timer1 = setTimeout(() => setCurrentStep(1), 2000); // Payment Received
    const timer2 = setTimeout(() => setCurrentStep(2), 4000); // Smart Contract Executed
    const timer3 = setTimeout(() => {
      setCurrentStep(3); // Farmer Paid
      setPaymentData({
        farmer_payout: "15,400",
        tx_hash: "0x" + Math.random().toString(16).substr(2, 40)
      });
      if (onComplete) onComplete();
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [transactionId, onComplete]);

  const steps = [
    { label: "Credit Reserved", active: currentStep >= 0 },
    { label: "Payment Received", active: currentStep >= 1 },
    { label: "Smart Contract Executed", active: currentStep >= 2 },
    { label: "Farmer Paid ✓", active: currentStep >= 3 },
  ];

  return (
    <div className="w-full">
      {/* Sr-only announcement for accessibility */}
      <div className="sr-only" aria-live="polite">
        Payment status step {currentStep + 1}
      </div>

      {/* Horizontal Stepper */}
      <div className="relative flex justify-between items-center mb-8 px-4">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-[#E2E8F0] -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-4 h-[2px] bg-[#16A34A] -z-10 -translate-y-1/2 transition-all duration-700 ease-in-out"
          style={{ width: `calc(${(Math.max(0, currentStep) / 3) * 100}% - 32px)` }}
        ></div>

        {/* Step Nodes */}
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
              step.active ? 'bg-[#16A34A] text-white' : 'bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#475569]'
            }`}>
              {step.active ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs mt-2 font-medium text-center ${step.active ? 'text-[#0F172A]' : 'text-[#475569]'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Content Area Based on Step */}
      <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
        
        {currentStep === 0 && (
          <div className="text-center">
            <svg className="w-8 h-8 text-[#F59E0B] mx-auto mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#0F172A] font-semibold">Reserving Credit...</p>
            <p className="text-sm text-[#475569]">Locking this credit exclusively for you.</p>
          </div>
        )}

        {currentStep === 1 && (
          <div className="text-center">
            <svg className="w-8 h-8 text-[#16A34A] mx-auto mb-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#0F172A] font-semibold">Processing Escrow</p>
            <p className="text-sm text-[#475569]">Funds received. Awaiting network confirmation.</p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center w-full max-w-sm">
            <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#0F172A] font-semibold mb-4">Executing Smart Contract</p>
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] text-sm text-left shadow-sm">
              <div className="flex justify-between mb-2 pb-2 border-b border-[#E2E8F0]">
                <span className="text-[#475569]">Platform Fee (3%)</span>
                <span className="font-mono text-[#0F172A]">Calculating...</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#0A5C36]">Farmer Net Payout (97%)</span>
                <span className="font-mono text-[#16A34A] animate-pulse">Routing via Mobile Banking</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && paymentData && (
          <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
            <FarmerPaidCard 
              amount={paymentData.farmer_payout} 
              txHash={paymentData.tx_hash} 
            />
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default PaymentStatusTracker;
