import React from 'react';
import { Building } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export const AddProjectModal = ({ isOpen, onClose, newProject, setNewProject, handleAddProject }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Corporate Project"
      subtitle="Register a regional emission monitoring offset project."
      size="md"
    >
      <form onSubmit={handleAddProject} className="space-y-4 font-sans text-xs">
        <div>
          <label className="block font-bold text-mist mb-1">Project Name</label>
          <input 
            type="text" 
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="e.g. Chittagong Mangrove Restoration" 
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-mist mb-1">Project Sector</label>
          <select 
            value={newProject.sector}
            onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-carbon text-white cursor-pointer"
          >
            <option value="Solar Irrigation">Solar Irrigation</option>
            <option value="Rice Methane">Rice Methane</option>
            <option value="Clean Cookstoves">Clean Cookstoves</option>
            <option value="Waste-To-Energy">Waste-To-Energy</option>
            <option value="Mangrove Carbon">Mangrove Carbon</option>
            <option value="Brick Kilns">Brick Kilns</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-mist mb-1">Target Reduction (tCO₂e / year)</label>
          <input 
            type="number" 
            value={newProject.target}
            onChange={(e) => setNewProject({ ...newProject, target: e.target.value })}
            placeholder="e.g. 300" 
            className="w-full p-2.5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald bg-white/[0.04] text-white"
            required
          />
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
            Add Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
