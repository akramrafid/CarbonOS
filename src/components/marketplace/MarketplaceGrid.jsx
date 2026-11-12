import React from 'react';
import { MapPin, Satellite, FileText, ShoppingCart, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

export function MarketplaceGrid({
  isLight = false,
  credits,
  copiedId,
  onCopyId,
  onInspectCredit,
  onSelectCredit
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {credits.map((credit) => {
        const isAvailable = credit.status === 'AVAILABLE';
        const farmerRemittance = Math.round(credit.price * 0.97);

        return (
          <div
            key={credit.id}
            className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden ${
              isLight
                ? 'bg-white border-border-strong shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-emerald/40'
                : 'bg-bg-canvas border-white/10 hover:border-emerald/50 hover:shadow-[0_0_30px_rgba(0,200,83,0.1)]'
            }`}
          >
            {/* Top Ambient Highlight Banner */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                    credit.verification.includes('Verra')
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {credit.verification}
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  Vintage {credit.vintage}
                </span>
              </div>

              {isAvailable ? (
                <span className="flex items-center space-x-1.5 font-mono text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                  <span>AVAILABLE</span>
                </span>
              ) : (
                <span className="font-mono text-[10px] text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                  RETIRED
                </span>
              )}
            </div>

            {/* Project Title & Serial */}
            <div className="mb-3">
              <h3
                className={`font-sans font-bold text-xl leading-snug group-hover:text-emerald transition-colors ${
                  isLight ? 'text-fg-primary' : 'text-white'
                }`}
              >
                {credit.type}
              </h3>

              <div className="flex items-center space-x-1.5 mt-1 font-mono text-[11px] text-slate-400">
                <span>{credit.id}</span>
                <IconButton
                  aria-label="Copy Serial ID"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => onCopyId(e, credit.id)}
                  className="hover:text-emerald transition-colors"
                  icon={copiedId === credit.id ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                />
              </div>
            </div>

            {/* Producer & Origin with MapPin */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4 pb-3 border-b border-white/5">
              <MapPin size={14} className="text-emerald shrink-0" />
              <span className="truncate">{credit.region}</span>
              <span>•</span>
              <span className="truncate font-medium text-slate-300">{credit.farmer}</span>
            </div>

            {/* MRV Telemetry Tag */}
            <div
              className={`p-2.5 rounded-lg border text-[11px] font-mono mb-4 flex items-center space-x-2 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-bg-canvas border-white/5 text-slate-300'
              }`}
            >
              <Satellite size={14} className="text-cyan-400 shrink-0" />
              <span className="truncate">{credit.mrvTelemetry}</span>
            </div>

            {/* UN SDG Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              {credit.sdgs.map((sdg) => (
                <span
                  key={sdg}
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald/10 text-emerald border border-emerald/20"
                >
                  SDG {sdg}
                </span>
              ))}
              <span className="text-[10px] font-mono text-slate-500 ml-auto">
                {credit.additionality}
              </span>
            </div>

            {/* Financial Metrics Box */}
            <div
              className={`mt-auto p-4 rounded-xl border mb-5 transition-colors ${
                isLight ? 'bg-bg-canvas/80 border-border-strong' : 'bg-bg-surface/30 border-white/5'
              }`}
            >
              <div className="grid grid-cols-2 gap-3 mb-2.5">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block mb-0.5">VOLUME</span>
                  <span className={`font-mono text-xl font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                    {credit.tonnage} <span className="text-xs font-sans text-slate-400">tCO₂e</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-slate-400 block mb-0.5">TOTAL SETTLEMENT</span>
                  <span className="font-mono text-xl font-bold text-emerald">
                    ৳{credit.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 97% Farmer Remittance Callout */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">97% Mobile Payout:</span>
                <span className="font-bold text-emerald">৳{farmerRemittance.toLocaleString()} direct to wallet</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onInspectCredit(credit)}
                className="flex items-center justify-center space-x-1.5"
              >
                <FileText size={13} />
                <span>MRV Dossier</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!isAvailable}
                onClick={() => onSelectCredit(credit)}
                className="flex items-center justify-center space-x-1.5"
              >
                <ShoppingCart size={13} />
                <span>{isAvailable ? 'Buy & Settle' : 'Retired'}</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MarketplaceGrid;
