import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../context/ToastContext';

const FarmerEarnings = () => {
  const { showToast } = useToast();
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
          <p className="font-bold text-fg-primary group-hover:text-emerald transition-colors">{row?.projectName}</p>
          <p className="text-[11px] font-mono text-fg-muted mt-0.5">{row?.creditId}</p>
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

  const handleDownloadCsv = () => {
    const header = 'ID,Date,Project,Buyer,Gross,NetPayout,Status';
    const rows = transactions.map((t) =>
      [t.id, t.date, t.projectName, t.buyer, t.gross, t.netPayout, t.status]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carbonos-farmer-earnings.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast?.('Farmer earnings CSV downloaded.', 'success');
  };

  return (
      <div className="w-full max-w-[1600px] mx-auto font-sans space-y-6">
        <PageHeader
          title="Earnings Dashboard"
          description="Track your carbon credit sales and instant payouts."
          badge={<Badge variant="emerald">FARMER PORTAL</Badge>}
        />

            {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                    <div className="bg-bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-border-subtle flex flex-wrap justify-between items-center gap-3">
                        <h3 className="text-lg font-bold text-fg-primary">Transaction History</h3>
                        <Button variant="secondary" size="sm" onClick={handleDownloadCsv} className="font-mono text-xs">
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
            );
};

            export default FarmerEarnings;
