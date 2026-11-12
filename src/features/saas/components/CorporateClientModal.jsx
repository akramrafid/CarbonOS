import React from 'react';
import { Building, CheckCircle2 } from 'lucide-react';
import { CLIENT_PROFILES } from '../../../pages/platform/clientProfiles';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Client Workspace Profile"
      subtitle="Seamlessly switch between our enterprise clients to inspect dedicated operational baselines."
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
        {profiles.map((client) => {
          const isSelected = client.id === activeClientId;
          return (
            <div
              key={client.id}
              onClick={() => handleSelectClient(client.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                isSelected 
                  ? 'bg-emerald/10 border-emerald/50 shadow-[0_0_15px_rgba(0,200,83,0.15)]' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-mist">
                    {client.sector}
                  </span>
                  {isSelected && (
                    <span className="flex items-center text-[11px] font-bold text-emerald gap-1">
                      <CheckCircle2 size={13} /> Active
                    </span>
                  )}
                </div>
                <h4 className="font-sans font-bold text-base text-white group-hover:text-emerald transition-colors">
                  {client.name}
                </h4>
                <p className="text-xs text-mist mt-1 line-clamp-2">
                  {client.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-mist/70">
                <span>Facility: {client.district || 'Dhaka'}</span>
                <span>Base: {client.baselineInputs?.electricity || 0} kWh</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end border-t border-white/10">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CorporateClientModal;
