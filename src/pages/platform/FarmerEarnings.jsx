import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';

const FarmerEarnings = () => {
  const transactions = [
    {
      id: 'BD-2026-CR-000142',
      date: 'Jun 13, 2026',
      projectName: 'Solar Irrigation',
      creditId: 'BD-2026-CR-000142',
      buyer: 'TechCorp Global',
      gross: '৳ 15,876',
      netPayout: '৳ 15,400',
      status: 'SETTLED'
    },
    {
      id: 'BD-2026-CR-000089',
      date: 'May 22, 2026',
      projectName: 'Agroforestry',
      creditId: 'BD-2026-CR-000089',
      buyer: 'EcoBrands Ltd',
      gross: '৳ 23,814',
      netPayout: '৳ 23,100',
      status: 'SETTLED'
    }
  ];

  const columns = [
    { key: 'date', header: 'Date' },
    {
      key: 'project',
      header: 'Project / Credit ID',
      render: (_, row) => (
        <div>
          <p className="font-bold text-white group-hover:text-emerald transition-colors">{row?.projectName}</p>
          <p className="text-[11px] font-mono text-mist/60 mt-0.5">{row?.creditId}</p>
        </div>
      )
    },
    { key: 'buyer', header: 'Buyer' },
    { key: 'gross', header: 'Gross', align: 'right' },
    {
      key: 'netPayout',
      header: 'Net Payout',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-emerald">{val || row?.netPayout}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val, row) => (
        <Badge variant="emerald">{val || row?.status}</Badge>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#040A06] font-sans relative overflow-hidden">
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85308_1px,transparent_1px),linear-gradient(to_bottom,#00C85308_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <PageHeader
              title="Earnings Dashboard"
              description="Track your carbon credit sales and instant payouts."
              badge={<Badge variant="emerald">FARMER PORTAL</Badge>}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Earned (BDT)"
              value="৳ 124,500"
              trend="up"
              featured
            />
            <StatCard
              title="Credits Sold"
              value="8"
              unit="tCO₂e"
              trend="neutral"
            />
            <StatCard
              title="Pending Settlements"
              value="0"
              trend="neutral"
            />
            <StatCard
              title="Earned This Month"
              value="৳ 15,400"
              trend="up"
            />
          </div>

          {/* Transaction History Table */}
          <div className="bg-[#080F0B]/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Transaction History</h3>
              <Button variant="secondary" size="sm" className="font-mono text-xs">
                DOWNLOAD CSV
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={transactions}
              keyField="id"
              className="border-0 rounded-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
