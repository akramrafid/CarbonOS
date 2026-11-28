import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';

export const TasksPanel = (props) => {
  const {
    tasks = [],
    toggleTask,
    deleteTask,
    taskInput,
    setTaskInput,
    handleAddTask,
    searchQuery = ''
  } = props;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-fg-primary">Verification Tasks</h2>
        <p className="text-sm text-fg-secondary mt-1 font-sans">Verify, audit, and log compliance steps to confirm climate metrics.</p>
      </div>

      {/* Task Add Form */}
        <form onSubmit={handleAddTask} className="flex flex-wrap sm:flex-nowrap gap-2 relative">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Type a new corporate ESG verification task..."
            className="flex-1 min-w-0 px-4 py-3 border border-border-subtle rounded-xl text-xs font-sans text-fg-primary placeholder-fg-muted focus:outline-none focus:border-accent bg-bg-muted"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            Add Task
          </Button>
        </form>

        {/* Tasks list */}
        <div className="space-y-3">
          {tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="text-center py-8 text-xs text-fg-secondary">No matching verification tasks found.</div>
          ) : (
            tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map(task => (
                  <div key={task.id} className="flex items-center justify-between gap-2 p-3.5 border border-border-subtle rounded-xl hover:bg-bg-muted transition-all">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Mark task completed: ${task.text}`}
                        className="w-5 h-5 shrink-0 border-border-subtle rounded text-accent focus:ring-accent cursor-pointer"
                      />
                      <span className={`text-sm font-sans font-medium ${task.completed ? 'text-fg-secondary line-through' : 'text-fg-primary'}`}>
                        {task.text}
                      </span>
                    </div>
                    <IconButton
                      icon={<Trash2 className="w-4 h-4" />}
                      aria-label="Delete task"
                      onClick={() => deleteTask(task.id)}
                      className="text-fg-secondary hover:text-red-700 dark:hover:text-red-400 shrink-0 min-h-[32px] min-w-[32px] p-1"
                    />
                  </div>
                  ))
              )}
                </div>
              </div>
            );
};

          export default TasksPanel;
