import React from 'react';

const FarmerEarnings = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-[#0F172A]">Earnings Dashboard</h1>
            <p className="text-[#475569] mt-1">Track your carbon credit sales and instant payouts.</p>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-sm font-medium text-[#475569] mb-1">Total Earned (BDT)</p>
              <p className="text-3xl font-bold text-[#16A34A]">৳ 124,500</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-sm font-medium text-[#475569] mb-1">Credits Sold</p>
              <p className="text-3xl font-bold text-[#0F172A]">8</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-sm font-medium text-[#475569] mb-1">Pending Settlements</p>
              <p className="text-3xl font-bold text-[#F59E0B]">0</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-sm font-medium text-[#475569] mb-1">Earned This Month</p>
              <p className="text-3xl font-bold text-[#0F172A]">৳ 15,400</p>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="text-lg font-semibold text-[#0F172A]">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Project / Credit ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#475569] uppercase tracking-wider">Gross</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#475569] uppercase tracking-wider">Net Payout</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#475569] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {/* Mock Row 1 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#475569]">Jun 13, 2026</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-[#0F172A]">Solar Irrigation</p>
                      <p className="text-xs font-mono text-[#475569]">BD-2026-CR-000142</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A]">TechCorp Global</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#475569]">৳ 15,876</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-[#16A34A]">৳ 15,400</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#16A34A]/10 text-[#16A34A]">Settled</span>
                    </td>
                  </tr>
                  {/* Mock Row 2 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#475569]">May 22, 2026</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-[#0F172A]">Agroforestry</p>
                      <p className="text-xs font-mono text-[#475569]">BD-2026-CR-000089</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A]">EcoBrands Ltd</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#475569]">৳ 23,814</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-[#16A34A]">৳ 23,100</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#16A34A]/10 text-[#16A34A]">Settled</span>
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
