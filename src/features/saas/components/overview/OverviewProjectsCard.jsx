import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

export const OverviewProjectsCard = ({
  isLight,
  projects = [],
  setIsAddProjectOpen
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-sans font-bold text-lg ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            Active Corporate Projects
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-[#41634E]' : 'text-mist'}`}>
            District specific offsetting initiatives under CarbonZero monitoring.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddProjectOpen(true)}
          icon={<Plus className="w-3.5 h-3.5 text-emerald" />}
        >
          New Project
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className={`font-bold border-b pb-2 text-[10px] uppercase font-mono ${
              isLight ? 'text-[#557361] border-carbon-border' : 'text-mist border-[#122418]'
            }`}>
              <th className="py-2.5">Project Name</th>
              <th>Sector</th>
              <th>Target (tCO2e/yr)</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-carbon-border' : 'divide-[#122418]'}`}>
            {projects.map(p => (
              <tr key={p.id} className={`transition-colors ${isLight ? 'hover:bg-[#F7FAF7]' : 'hover:bg-[#040906]'}`}>
                <td className={`py-3 font-bold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>{p.name}</td>
                <td className={isLight ? 'text-[#557361]' : 'text-mist'}>{p.sector}</td>
                <td className={`font-mono font-semibold ${isLight ? 'text-emerald' : 'text-[#4ADE80]'}`}>{p.target} tCO2e</td>
                <td>
                  <Badge 
                    variant={p.status === 'Verified' ? 'emerald' : p.status === 'In Progress' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default OverviewProjectsCard;
