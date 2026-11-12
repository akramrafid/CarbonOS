import React from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export const AddMemberModal = ({ isOpen, onClose, newMember, setNewMember, handleAddMember }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add ESG Team Member"
      subtitle="Invite a member to collaborate on corporate emissions data."
      size="md"
    >
      <form onSubmit={handleAddMember} className="space-y-4 font-sans text-xs">
        <div>
          <label className="block font-bold text-mist mb-1">Full Name</label>
          <input 
            type="text" 
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            placeholder="e.g. Rafiqul Islam" 
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-mist mb-1">Email Address</label>
          <input 
            type="email" 
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            placeholder="e.g. rafiqul@carbonzero.io" 
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-mist mb-1">Role / Job Title</label>
          <input 
            type="text" 
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            placeholder="e.g. Senior Carbon Auditor" 
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-mist mb-1">System Permission</label>
          <select 
            value={newMember.permission}
            onChange={(e) => setNewMember({ ...newMember, permission: e.target.value })}
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-carbon text-white cursor-pointer"
          >
            <option value="Auditor">Auditor (Read & Submit Notes)</option>
            <option value="Admin">Admin (Full Control)</option>
            <option value="Viewer">Viewer (Read Only)</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Add Team Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
