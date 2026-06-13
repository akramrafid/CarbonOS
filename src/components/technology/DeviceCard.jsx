import React from 'react';

const DeviceCard = ({ name, model, measures, frequency, phase, status }) => {
  const phaseColor = 
    phase.includes('1') ? 'bg-[#16A34A] text-white' : 
    phase.includes('2') ? 'bg-[#F59E0B] text-white' : 
    'bg-[#3B82F6] text-white';

  const statusColor = 
    status.toLowerCase() === 'deployed' ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' : 
    status.toLowerCase() === 'pilot' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 
    'bg-slate-100 text-[#475569] border-[#E2E8F0]';

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 text-[#0A5C36]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <h3 className="text-lg font-bold text-[#0F172A] mb-1">{name}</h3>
      <p className="text-sm font-mono text-[#475569] mb-4">{model}</p>
      
      <div className="mt-auto space-y-3">
        <div>
          <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Measures</p>
          <p className="text-sm text-[#0F172A] leading-tight">{measures}</p>
        </div>
        <div className="pt-3 border-t border-[#E2E8F0]">
          <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Data Frequency</p>
          <p className="text-sm font-mono text-[#0A5C36]">{frequency}</p>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
