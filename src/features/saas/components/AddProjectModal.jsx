import React from 'react';
import { X } from 'lucide-react';

export const AddProjectModal = ({ isOpen, onClose, newProject, setNewProject, handleAddProject }) => {
  if (!isOpen) return null;
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-[#E2E8F0]">
            <button 
              onClick={() => setIsAddProjectOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F291B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-sans font-bold text-lg text-[#0F291B] flex items-center">
                <Building className="w-5 h-5 text-emerald mr-2" />
                Add Corporate Project
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">Register a regional emission monitoring offset project.</p>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Chittagong Mangrove Restoration" 
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Project Sector</label>
                <select 
                  value={newProject.sector}
                  onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA] cursor-pointer"
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
                <label className="block font-bold text-[#64748B] mb-1">Annual Emission reduction Target (tCO2e/yr)</label>
                <input 
                  type="number" 
                  value={newProject.target}
                  onChange={(e) => setNewProject({ ...newProject, target: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Add Project
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddProjectOpen(false)}
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

export default AddProjectModal;
