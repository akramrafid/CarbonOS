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
    },
    {
      id: 'BD-2026-CR-000204',
      type: 'Solar Cold Storage',
      region: 'Mymensingh',
      tonnage: 2.1,
      price: 31500,
      status: 'AVAILABLE',
      farmer: 'Hassan K.',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000210',
      type: 'Brick Kiln Transition',
      region: 'Gazipur',
      tonnage: 4.5,
      price: 67500,
      status: 'AVAILABLE',
      farmer: 'Aminul S.',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000215',
      type: 'Waste-to-Energy (Biogas)',
      region: 'Jessore',
      tonnage: 1.8,
      price: 27000,
      status: 'AVAILABLE',
      farmer: 'Latifa A.',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000221',
      type: 'Rice Methane Reduction',
      region: 'Rangpur',
      tonnage: 1.2,
      price: 18000,
      status: 'AVAILABLE',
      farmer: 'Jahangir M.',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000225',
      type: 'Hill Tract Reforestation',
      region: 'Chittagong',
      tonnage: 5.6,
      price: 84000,
      status: 'AVAILABLE',
      farmer: 'Parbatya Coop',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000230',
      type: 'Rooftop Solar Array',
      region: 'Dhaka',
      tonnage: 2.8,
      price: 42000,
      status: 'AVAILABLE',
      farmer: 'Metro Fab Ltd',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000235',
      type: 'Community Biogas Digester',
      region: 'Kushtia',
      tonnage: 1.5,
      price: 22500,
      status: 'AVAILABLE',
      farmer: 'Rahimun N.',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000240',
      type: 'Biomass Cookstoves',
      region: 'Dinajpur',
      tonnage: 0.9,
      price: 9500,
      status: 'AVAILABLE',
      farmer: 'Nargis A.',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000245',
      type: 'Solar Irrigation Pump',
      region: 'Rajshahi',
      tonnage: 1.6,
      price: 17600,
      status: 'AVAILABLE',
      farmer: 'Tariqul I.',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000250',
      type: 'Mangrove Afforestation',
      region: 'Cox\'s Bazar',
      tonnage: 4.0,
      price: 60000,
      status: 'AVAILABLE',
      farmer: 'Coast Alliance',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000255',
      type: 'Grid-Connected Wind Project',
      region: 'Feni',
      tonnage: 6.5,
      price: 97500,
      status: 'AVAILABLE',
      farmer: 'WindPower BD',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000260',
      type: 'Solar Home Systems',
      region: 'Barisal',
      tonnage: 1.1,
      price: 16500,
      status: 'AVAILABLE',
      farmer: 'Grameen Shakti',
      verification: 'Gold Standard'
    },
    {
      id: 'BD-2026-CR-000265',
      type: 'Municipal Waste Compost',
      region: 'Narayanganj',
      tonnage: 3.5,
      price: 52500,
      status: 'AVAILABLE',
      farmer: 'Green Waste BD',
      verification: 'Verra VCS'
    },
    {
      id: 'BD-2026-CR-000270',
      type: 'Sustainable Agriculture',
      region: 'Comilla',
      tonnage: 1.3,
      price: 19500,
      status: 'AVAILABLE',
      farmer: 'Selim Hossain',
      verification: 'Gold Standard'
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
          <p className="font-sans text-mist text-lg">Purchase verified offsets. 97% of funds settle instantly to the farmer's mobile wallet via mobile banking system.</p>
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
