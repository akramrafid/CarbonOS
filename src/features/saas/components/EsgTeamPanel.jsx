import React from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';

export const EsgTeamPanel = (props) => {
  const {
    teamMembers = [],
    toggleMemberStatus,
    removeMember,
    setIsAddMemberOpen,
    searchQuery = ''
  } = props;

  return (
          <div className="bg-white border border-border-subtle rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-sans font-bold text-3xl text-fg-primary">ESG Audit Team</h2>
                <p className="text-sm text-fg-secondary mt-1 font-sans">Manage corporate accounts, permissions, and verifiers.</p>
              </div>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => setIsAddMemberOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase())).map((member, i) => (
                <div key={i} className="border border-border-subtle rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
                  <IconButton 
                    icon={<Trash2 className="w-4 h-4" />}
                    aria-label={`Remove member ${member.name}`}
                    onClick={() => removeMember(member.name)}
                    className="absolute top-4 right-4 text-fg-secondary hover:text-red-400 min-h-[32px] min-w-[32px] p-1"
                  />

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald/20">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" width="48" height="48" loading="lazy" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-fg-primary">{member.name}</h4>
                      <p className="text-xs text-fg-secondary">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border-subtle pt-3 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-fg-secondary">Email:</span>
                      <span className="font-mono text-fg-primary">{member.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-secondary">Access:</span>
                      <span className="font-bold text-fg-primary">{member.permission}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-secondary">Status:</span>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleMemberStatus(member.name)}
                        className="text-[9px] uppercase font-bold py-0.5 px-2 h-auto min-h-0"
                      >
                        {member.status}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
};

export default EsgTeamPanel;
