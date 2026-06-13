import React from 'react';

const FarmerEarnings = () => {
  return (
    <div className="min-h-screen bg-[#040A06] font-sans relative overflow-hidden">
      
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85308_1px,transparent_1px),linear-gradient(to_bottom,#00C85308_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-12">
            <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-4 inline-block">
              FARMER PORTAL
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Earnings Dashboard</h1>
            <p className="text-mist text-lg">Track your carbon credit sales and instant payouts.</p>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#080F0B] p-6 rounded-2xl border border-emerald/20 shadow-lg relative overflow-hidden group hover:border-emerald/40 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-4xl">💰</span>
              </div>
              <p className="text-sm font-medium text-mist mb-2">Total Earned (BDT)</p>
              <p className="text-3xl font-bold text-emerald">৳ 124,500</p>
            </div>
            
            <div className="bg-[#080F0B] p-6 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-colors">
              <p className="text-sm font-medium text-mist mb-2">Credits Sold</p>
              <p className="text-3xl font-bold text-white">8 <span className="text-sm font-normal text-mist">tCO₂e</span></p>
            </div>
            
            <div className="bg-[#080F0B] p-6 rounded-2xl border border-amber/20 shadow-lg hover:border-amber/40 transition-colors">
              <p className="text-sm font-medium text-mist mb-2">Pending Settlements</p>
              <p className="text-3xl font-bold text-amber">0</p>
            </div>
            
            <div className="bg-[#0D2B1A]/60 p-6 rounded-2xl border border-emerald/30 shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald/10 rounded-full blur-xl"></div>
              <p className="text-sm font-medium text-emerald mb-2">Earned This Month</p>
              <p className="text-3xl font-bold text-white">৳ 15,400</p>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-[#080F0B]/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Transaction History</h3>
              <button className="text-xs font-mono text-emerald border border-emerald/20 px-3 py-1.5 rounded hover:bg-emerald/10 transition-colors">
                DOWNLOAD CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-mono text-mist uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-[11px] font-mono text-mist uppercase tracking-widest">Project / Credit ID</th>
                    <th className="px-6 py-4 text-left text-[11px] font-mono text-mist uppercase tracking-widest">Buyer</th>
                    <th className="px-6 py-4 text-right text-[11px] font-mono text-mist uppercase tracking-widest">Gross</th>
                    <th className="px-6 py-4 text-right text-[11px] font-mono text-mist uppercase tracking-widest">Net Payout</th>
                    <th className="px-6 py-4 text-center text-[11px] font-mono text-mist uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Mock Row 1 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-mist/80">Jun 13, 2026</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-bold text-white group-hover:text-emerald transition-colors">Solar Irrigation</p>
                      <p className="text-[11px] font-mono text-mist/60 mt-1">BD-2026-CR-000142</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-registry">TechCorp Global</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-right text-mist">৳ 15,876</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-right text-emerald">৳ 15,400</td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-[10px] font-mono font-bold rounded-full border bg-emerald/10 border-emerald/20 text-emerald">SETTLED</span>
                    </td>
                  </tr>
                  {/* Mock Row 2 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-mist/80">May 22, 2026</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-bold text-white group-hover:text-emerald transition-colors">Agroforestry</p>
                      <p className="text-[11px] font-mono text-mist/60 mt-1">BD-2026-CR-000089</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-registry">EcoBrands Ltd</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-right text-mist">৳ 23,814</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-right text-emerald">৳ 23,100</td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-[10px] font-mono font-bold rounded-full border bg-emerald/10 border-emerald/20 text-emerald">SETTLED</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FarmerEarnings;
