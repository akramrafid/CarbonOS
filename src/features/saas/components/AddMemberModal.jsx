import React from 'react';
import { X } from 'lucide-react';

export const AddMemberModal = ({ isOpen, onClose, newMember, setNewMember, handleAddMember }) => {
  if (!isOpen) return null;
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-[#E2E8F0]">
            <button 
              onClick={() => setIsAddMemberOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F291B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                <Users className="w-5 h-5 text-emerald mr-2" />
                Add ESG Team Member
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">Invite a member to collaborate on corporate emissions data.</p>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Rafiqul Islam" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. rafiqul@carbonzero.io" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Role / Job Title</label>
                <input 
                  type="text" 
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="e.g. ESG Auditor" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Permission Level</label>
                <select 
                  value={newMember.permission}
                  onChange={(e) => setNewMember({ ...newMember, permission: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] cursor-pointer"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Editor">Editor (Read/Write)</option>
                  <option value="Auditor">Auditor (Verify Only)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Invite Member
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
  );
};

export default AddMemberModal;
