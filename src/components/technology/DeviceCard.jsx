import React from 'react';

const DeviceCard = ({ name, model, measures, frequency, phase, status }) => {
  const phaseColor = 
    phase.includes('1') ? 'bg-accent text-white' : 
    phase.includes('2') ? 'bg-amber-500 text-white' : 
    'bg-blue-500 text-white';

  const statusColor = 
    status.toLowerCase() === 'deployed' ? 'bg-accent/10 text-accent border-border-strong/20' : 
    status.toLowerCase() === 'pilot' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
    'bg-slate-100 text-fg-secondary border-border-subtle';

  return (
    <div className="bg-white border border-border-subtle rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 bg-bg-canvas rounded-lg border border-border-subtle flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${phaseColor}`}>
            {phase}
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-fg-primary mb-1">{name}</h3>
      <p className="text-sm font-mono text-fg-secondary mb-4">{model}</p>
      
      <div className="mt-auto space-y-3">
        <div>
          <p className="text-[10px] uppercase font-semibold text-fg-secondary mb-1">Measures</p>
          <p className="text-sm text-fg-primary leading-tight">{measures}</p>
        </div>
        <div className="pt-3 border-t border-border-subtle">
          <p className="text-[10px] uppercase font-semibold text-fg-secondary mb-1">Data Frequency</p>
          <p className="text-sm font-mono text-accent">{frequency}</p>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
