import React from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';

export const EsgTeamPanel = (props) => {
  const {
    teamMembers = [],
    toggleMemberStatus,
    removeMember,
    setIsAddMemberOpen
  } = props;

  return (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-sans font-bold text-3xl text-[#0F291B]">ESG Audit Team</h1>
                <p className="text-sm text-[#64748B] mt-1 font-sans">Manage corporate accounts, permissions, and verifiers.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span className="text-white font-mono font-bold">Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase())).map((member, i) => (
                <div key={i} className="border border-[#E2E8F0] rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
                  <button 
                    onClick={() => removeMember(member.name)}
                    className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#EF4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald/20">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" width="48" height="48" loading="lazy" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-[#0F291B]">{member.name}</h4>
                      <p className="text-xs text-[#64748B]">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-[#F1F5F9] pt-3 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Email:</span>
                      <span className="font-mono text-[#0F291B]">{member.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Access:</span>
                      <span className="font-bold text-[#0F291B]">{member.permission}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Status:</span>
                      <button 
                        onClick={() => toggleMemberStatus(member.name)}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          member.status === 'Active' 
                            ? 'bg-emerald/10 text-emerald border-emerald/20' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {member.status}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
};

export default EsgTeamPanel;
