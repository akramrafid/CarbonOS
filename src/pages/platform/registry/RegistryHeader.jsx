import React from 'react';
import { Landmark, RefreshCw, Download, ShieldCheck, Fingerprint } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export function RegistryHeader({
  isLiveConnected,
  isLoading,
  fetchRegistryData,
  handleDownloadBtrCsv
}) {
  return (
    <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <span className="inline-flex items-center space-x-1.5 font-mono text-[11px] font-bold text-accent bg-accent/10 border border-border-strong/30 px-3 py-1 rounded-full uppercase tracking-widest">
            <Landmark size={13} className="text-accent" />
            <span>People's Republic of Bangladesh</span>
          </span>
          <span className="text-fg-muted text-xs">•</span>
          <span className="font-mono text-[11px] text-fg-secondary">DOE Article 6 DNA</span>
          <span className="text-fg-muted text-xs">•</span>
          <span className="font-mono text-[11px] text-fg-muted">World Bank PMI Workstream B</span>
        </div>

        <PageHeader
          title="Carbon Registry"
          description="National sovereign client bridge linking CarbonOS continuous dMRV telemetry with Bangladesh's National Carbon Registry, UNDP Digital for Climate (D4C) ledger, and official UNFCCC Article 6.2 / JCM Bilateral accounts."
          badge={<Badge variant="emerald">v2.4.1 (D4C API)</Badge>}
          breadcrumbs={[
            { label: 'Platform', path: '/platform/mrv-dashboard' },
            { label: 'Carbon Registry', path: '/platform/carbon-registry' }
          ]}
          secondaryActions={
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${isLiveConnected
                        ? 'bg-accent animate-pulse shadow-[0_0_8px_#00C853]'
                    : 'bg-emerald-500'
                }`}
              ></div>
                  <span className="font-mono text-xs font-bold text-fg-primary">
                    {isLiveConnected ? 'LIVE: national-api.doe.gov.bd' : 'ACTIVE: Sovereign Ledger (Sandbox)'}
                  </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={fetchRegistryData}
                disabled={isLoading}
              >
                <RefreshCw size={13} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Syncing...' : 'Sync Bridge'}</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadBtrCsv}
              >
                <Download size={13} className="mr-1.5" />
                <span>BTR Summary</span>
              </Button>
            </div>
          }
        />

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
          <StatCard
            title="Total Serialized Volume"
            value="10,000.0"
            unit="tCO2e"
            trend="up"
            subtitle="100% Measured via dMRV"
          />
          <StatCard
            title="Article 6.2 ITMO Transfer"
            value="5,000.0"
            unit="tCO2e"
            trend="up"
            subtitle="Government of Japan (JCM)"
          />
          <StatCard
            title="Bangladesh NDC Retention"
            value="5,000.0"
            unit="tCO2e"
            trend="neutral"
            subtitle="Sovereign Unadjusted Reserve"
          />
          <StatCard
            title="DOE Positive List Status"
            value="100% Eligible"
            trend="up"
            subtitle="0 Negative List Infractions"
            icon={<ShieldCheck size={16} className="text-accent" />}
          />
          <StatCard
            title="Cryptographic Provenance"
            value="Merkle Chain"
            trend="neutral"
            subtitle="SHA-256 Root Hash Verified"
            icon={<Fingerprint size={16} className="text-accent" />}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </div>
      );
}

      export default RegistryHeader;
