import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

export const TasksPanel = (props) => {
  const {
    tasks = [],
    toggleTask,
    deleteTask,
    taskInput,
    setTaskInput,
    handleAddTask
  } = props;

  return (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">Verification Tasks</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Verify, audit, and log compliance steps to confirm climate metrics.</p>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 relative">
              <input 
                type="text" 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Type a new corporate ESG verification task..." 
                className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-xl text-xs font-sans placeholder-[#94A3B8] focus:outline-none focus:border-[#0F291B] bg-[#F8F9FA]"
              />
              <button 
                type="submit" 
                className="bg-[#00C853] hover:bg-[#00E676] text-white px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                Add Task
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-3">
              {tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-xs text-[#64748B]">No matching verification tasks found.</div>
              ) : (
                tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3.5 border border-[#F1F5F9] rounded-xl hover:bg-[#F8F9FA] transition-all">
                    <div className="flex items-center space-x-3.5">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="w-4.5 h-4.5 border-[#E2E8F0] rounded text-emerald focus:ring-emerald cursor-pointer"
                      />
                      <span className={`text-sm font-sans font-medium ${task.completed ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-[#94A3B8] hover:text-[#EF4444] p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
  );
};

export default TasksPanel;
