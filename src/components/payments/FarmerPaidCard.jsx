import React, { useEffect, useState } from 'react';

const FarmerPaidCard = ({ amount, txHash }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transform transition-transform duration-500 translate-y-0 opacity-100">
      
      {/* CSS Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-[#16A34A] rounded-full animate-[fall_2s_ease-out_forwards]"></div>
          <div className="absolute top-0 left-2/4 w-2 h-2 bg-[#F59E0B] rounded-full animate-[fall_2.5s_ease-out_forwards_0.2s]"></div>
          <div className="absolute top-0 left-3/4 w-2 h-2 bg-[#16A34A] rounded-full animate-[fall_1.8s_ease-out_forwards_0.1s]"></div>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Placeholder Avatar */}
        <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-[#16A34A]">
          <img 
            src="https://images.unsplash.com/photo-1596700676450-93cf02157c96?q=80&w=200&auto=format&fit=crop" 
            alt="Farmer profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-[18px] font-semibold text-[#0F172A]">Rahim Uddin</h4>
            <svg className="w-4 h-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-[#475569] mb-3">Khulna District, Bangladesh</p>
          
          <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
            <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold mb-1">Payment Delivered (bKash)</p>
            <p className="text-2xl font-bold text-[#16A34A]">৳ {amount}</p>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-[#475569]">
            <span className="font-mono bg-slate-100 px-2 py-1 rounded">TX: {txHash.substring(0, 10)}...</span>
            <span className="text-[#16A34A] font-medium">Verified by CarbonOS</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default FarmerPaidCard;
