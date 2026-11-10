import React from 'react';
import { X, Building, CheckCircle2, ExternalLink } from 'lucide-react';
import { CLIENT_PROFILES } from '../../../pages/platform/clientProfiles';

export const CorporateClientModal = (props) => {
  const {
    isOpen,
    onClose,
    isLight,
    activeClientId,
    handleSelectClient,
    CLIENT_PROFILES: profiles = CLIENT_PROFILES
  } = props;

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
          <div className={`max-w-3xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border transition-all my-8 ${
            isLight ? 'bg-white border-[#E2E8E3] text-[#0F2417]' : 'bg-[#08130C] border-[#152B1D] text-white'
          }`}>
            <button 
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-[#00C853] font-bold">
                <Building className="w-4 h-4" />
                <span>Multi-Tenant Corporate ESG Registry</span>
              </div>
              <h3 className="font-sans font-bold text-xl sm:text-2xl mt-1">
                Select Client Workspace Profile
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                Seamlessly switch between our enterprise clients to inspect dedicated operational baselines, registered facilities, assigned ESG audit officers, and multi-segment utility invoices.
              </p>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {CLIENT_PROFILES.map((client) => {
                const isSelected = client.id === activeClientId;
                return (
                  <div
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#00C853] bg-[#00C853]/10 shadow-[0_0_20px_rgba(0,200,83,0.15)]'
                        : (isLight 
                            ? 'bg-[#F9FBFA] border-[#E8ECE8] hover:border-[#00C853]/50 hover:bg-white' 
                            : 'bg-[#0B1A11] border-[#152B1D] hover:border-[#00C853]/40 hover:bg-[#0D2216]')
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`h-12 px-3 py-1 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0 min-w-[80px] max-w-[100px] ${
                          client.logoTheme === 'dark'
                            ? 'bg-[#06140B] border border-[#163D22] ring-1 ring-emerald-500/20'
                            : 'bg-white border border-slate-200'
                        }`}>
                          <img 
                            src={client.logo} 
                            alt={client.name} 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00C853]/20 text-[#00C853] font-bold">
                            {client.sector}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-mono font-bold text-[#00C853] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active Workspace
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-sans font-bold text-sm leading-snug group-hover:text-[#00C853] transition-colors">
                        {client.name}
                      </h4>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {client.legalName}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {client.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <div className="text-gray-400">
                        Auditor: <span className="text-gray-300 font-bold">{client.assignedAuditor?.name?.split(' ')[0]} {client.assignedAuditor?.name?.split(' ')[1]}</span>
                      </div>
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#00C853] hover:underline flex items-center space-x-1"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/10 text-xs text-gray-400 font-mono">
              <span>{CLIENT_PROFILES.length} enterprise clients active in Bangladesh</span>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
  );
};

export default CorporateClientModal;
