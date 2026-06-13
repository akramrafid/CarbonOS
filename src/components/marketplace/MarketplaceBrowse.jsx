import React, { useState } from 'react';
import PurchaseConfirmModal from '../payments/PurchaseConfirmModal';

export const MarketplaceBrowse = () => {
  const [selectedCredit, setSelectedCredit] = useState(null);
  
  const [credits, setCredits] = useState([
    {
      id: 'BD-2026-CR-000142',
      type: 'Solar Irrigation',
      region: 'Khulna',
      tonnage: 1.4,
      price: 15400,
      status: 'AVAILABLE',
      farmer: 'Rahim U.',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000188',
      type: 'Mangrove Restoration',
      region: 'Sundarbans',
      tonnage: 3.2,
      price: 48000,
      status: 'AVAILABLE',
      farmer: 'Local Coop #4',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000199',
      type: 'Clean Cookstoves',
      region: 'Sylhet',
      tonnage: 0.8,
      price: 8500,
      status: 'AVAILABLE',
      farmer: 'Fatima B.',
      verification: 'Verra VCS'
    }
  ]);

  const handlePurchaseSuccess = (creditId) => {
    // Update local state to show it's sold
    setCredits(prev => prev.map(c => 
      c.id === creditId ? { ...c, status: 'SOLD' } : c
    ));
    setSelectedCredit(null);
  };

  return (
    <div className="bg-[#040A06] pt-32 pb-16 px-6 lg:px-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-4 inline-block">
            CORPORATE MARKETPLACE
          </span>
          <h1 className="serif-drama text-4xl lg:text-5xl text-white mb-4">Available Credits</h1>
          <p className="font-sans text-mist text-lg">Purchase verified offsets. 97% of funds settle instantly to the farmer's mobile wallet via bKash.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.map(credit => (
            <div key={credit.id} className="bg-[#080F0B] border border-white/10 rounded-[1.5rem] p-6 hover:border-emerald/40 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] text-amber bg-amber/10 px-2 py-1 rounded">
                  {credit.verification}
                </span>
                {credit.status === 'AVAILABLE' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" title="Available"></span>
                ) : (
                  <span className="text-[10px] font-mono text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">SOLD</span>
                )}
              </div>
              
              <h3 className="font-sans font-bold text-xl text-white mb-1">{credit.type}</h3>
              <p className="font-sans text-xs text-mist mb-6">Origin: {credit.region} • Farmer: {credit.farmer}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4 mb-6 bg-[#0D2B1A]/30 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="font-mono text-[10px] text-mist mb-1">VOLUME</p>
                  <p className="font-mono text-lg text-white">{credit.tonnage} <span className="text-xs">tCO₂</span></p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-mist mb-1">PRICE</p>
                  <p className="font-mono text-lg text-emerald">৳{credit.price}</p>
                </div>
              </div>

              <button 
                disabled={credit.status !== 'AVAILABLE'}
                onClick={() => setSelectedCredit(credit)}
                className={`w-full py-3 rounded-lg font-bold font-sans text-sm transition-all ${
                  credit.status === 'AVAILABLE' 
                    ? 'bg-emerald/10 text-emerald border border-emerald/30 hover:bg-emerald hover:text-carbon' 
                    : 'bg-white/5 text-mist/50 cursor-not-allowed'
                }`}
              >
                {credit.status === 'AVAILABLE' ? 'Purchase Credit' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedCredit && (
        <PurchaseConfirmModal 
          creditId={selectedCredit.id} 
          onClose={() => {
            setSelectedCredit(null);
            handlePurchaseSuccess(selectedCredit.id); // Mark as sold for demo
          }} 
        />
      )}
    </div>
  );
};

export default MarketplaceBrowse;
