import React from 'react';
import { Plus, ExternalLink, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { IconButton } from '../../../../components/ui/IconButton';
import { Badge } from '../../../../components/ui/Badge';

export const OverviewSideCards = ({
  isLight,
  navigate,
  projects = [],
  setIsAddProjectOpen,
  tasks = [],
  toggleTask,
  deleteTask,
  openTasksCount = 0,
  setActiveMenu,
  teamMembers = [],
  removeMember,
  setIsAddMemberOpen
}) => {
  return (
    <div className="space-y-8">
      {/* Offset Options Panel */}
      <div className={`p-6 rounded-3xl shadow-md flex flex-col justify-between h-[230px] border transition-all ${
        isLight
          ? 'bg-gradient-to-br from-accent-muted via-accent-muted to-accent-muted border-border-strong text-fg-primary'
          : 'bg-gradient-to-br from-bg-surface via-bg-surface to-bg-canvas border-border-subtle text-white'
      }`}>
        <div className="space-y-2">
          <div className="font-mono text-[9px] uppercase tracking-wider font-bold text-emerald">
            EMISSIONS COMPENSATIONS
          </div>
          <h3 className={`font-sans font-bold text-lg leading-tight ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Offset Your Footprint
          </h3>
          <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-fg-secondary' : 'text-white/70'}`}>
            Purchase certified Bangladeshi carbon credits directly on our registry to mitigate your calculated corporate emissions debt.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/platform/marketplace')}
          icon={<ExternalLink className="w-3.5 h-3.5" />}
        >
          Browse Marketplace
        </Button>
      </div>

      {/* Verification Tasks */}
      <Card className="p-6">
        <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
          isLight ? 'border-carbon-border' : 'border-border-subtle'
        }`}>
          <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Verification Tasks
          </h3>
          <Badge variant="emerald" size="sm">
            {openTasksCount} left
          </Badge>
        </div>
        
        <ul className="space-y-3 font-sans text-xs">
          {tasks.slice(0, 3).map(task => (
            <li key={task.id} className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded text-emerald focus:ring-emerald cursor-pointer" 
                />
                <span className={task.completed 
                  ? "line-through text-mist" 
                  : isLight ? "text-fg-primary" : "text-fg-primary"
                }>
                  {task.text}
                </span>
              </div>
              <IconButton 
                icon={<Trash2 className="w-3.5 h-3.5" />}
                aria-label={`Delete task ${task.text}`}
                onClick={() => deleteTask(task.id)} 
                className="text-mist hover:text-red-500 min-h-[32px] min-w-[32px] p-1"
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-inherit">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveMenu('Tasks')}
            className="w-full justify-center"
          >
            View All Tasks &rarr;
          </Button>
        </div>
      </Card>

      {/* Team Summary */}
      <Card className="p-6">
        <div className={`flex justify-between items-center mb-4 pb-2 border-b ${
          isLight ? 'border-carbon-border' : 'border-border-subtle'
        }`}>
          <h3 className={`font-sans font-bold text-sm ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Audit Team
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddMemberOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-emerald" />}
          >
            Invite
          </Button>
        </div>

        <div className="space-y-3">
          {teamMembers.slice(0, 3).map((member) => (
            <div key={member.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-7 h-7 rounded-full object-cover shrink-0" 
                />
                <div className="truncate">
                  <div className={`text-xs font-bold truncate ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                    {member.name}
                  </div>
                  <div className="text-[10px] text-mist truncate">
                    {member.role}
                  </div>
                </div>
              </div>
              <IconButton
                icon={<X className="w-3.5 h-3.5" />}
                aria-label={`Remove team member ${member.name}`}
                onClick={() => removeMember(member.name)}
                className="text-mist hover:text-red-500 min-h-[32px] min-w-[32px] p-1"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default OverviewSideCards;
