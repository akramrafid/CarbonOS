import React, { useState } from 'react';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';

const CreditStatusBadge = ({ status }) => {
  const styles = {
    AVAILABLE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    RESERVED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    SOLD: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    SETTLED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-mono ${styles[status]}`}>
      {status}
    </span>
  );
};

const CreditCard = ({ credit }) => {
  // Hook up to real-time status updates
  const liveStatus = useRealtimeStatus(credit.status, credit.id);
  
  const progressSteps = ['AVAILABLE', 'RESERVED', 'SOLD', 'SETTLED'];
  const currentIndex = progressSteps.indexOf(liveStatus);

  return (
    <div className="bg-[#0D2B1A]/40 border border-emerald/20 p-5 rounded-2xl mb-4 hover:border-emerald/40 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-mono text-emerald text-sm mb-1">{credit.id}</h3>
          <p className="font-sans text-xs text-mist">Issued: {new Date(credit.issuedAt).toLocaleDateString()}</p>
        </div>
        <CreditStatusBadge status={liveStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#080F0B] p-3 rounded-lg border border-white/5">
          <p className="font-sans text-[10px] text-mist mb-1">Volume</p>
          <p className="font-mono text-lg text-white">{credit.tonnage} <span className="text-xs">tCO₂</span></p>
        </div>
        <div className="bg-[#080F0B] p-3 rounded-lg border border-white/5">
          <p className="font-sans text-[10px] text-mist mb-1">Est. Value (Net)</p>
          <p className="font-mono text-lg text-amber">
            ৳{liveStatus === 'SETTLED' ? credit.netEarned : (credit.estimatedValue * 0.92).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between mb-2">
          {progressSteps.map((step, idx) => (
            <span key={step} className={`text-[10px] font-mono ${idx <= currentIndex ? 'text-emerald' : 'text-mist/40'}`}>
              {step}
            </span>
          ))}
        </div>
        <div className="h-1.5 w-full bg-[#080F0B] rounded-full overflow-hidden flex">
          {progressSteps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 border-r border-[#080F0B] transition-all duration-500 ${idx <= currentIndex ? 'bg-emerald shadow-[0_0_10px_rgba(0,200,83,0.5)]' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const FarmerCreditsWidget = () => {
  // Mock data representing a farmer's portfolio
  const [credits] = useState([
    {
      id: 'BD-2026-CR-000142',
      tonnage: 1.4,
      status: 'AVAILABLE',
      issuedAt: '2026-06-10T10:00:00Z',
      estimatedValue: 15400, // ৳11,000 per ton approx
      netEarned: 0
    },
    {
      id: 'BD-2026-CR-000089',
      tonnage: 2.1,
      status: 'SETTLED',
      issuedAt: '2026-05-15T10:00:00Z',
      estimatedValue: 23100,
      netEarned: 21252 // 92% of gross
    }
  ]);

  return (
    <div className="bg-[#080F0B] rounded-[2rem] p-6 lg:p-8 registry-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-sans font-bold text-2xl text-registry">My Credits</h2>
        <span className="font-mono text-xs bg-emerald/10 text-emerald px-3 py-1 rounded-full border border-emerald/20">Live Pipeline</span>
      </div>
      
      <div className="space-y-2">
        {credits.map(credit => (
          <CreditCard key={credit.id} credit={credit} />
        ))}
      </div>
    </div>
  );
};

export default FarmerCreditsWidget;
