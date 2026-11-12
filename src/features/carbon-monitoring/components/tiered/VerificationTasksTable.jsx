import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Plane, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';

export function VerificationTasksTable({
  isLight,
  verificationTasks = [],
  setSelectedTaskForDrone
}) {
  const [taskFilter, setTaskFilter] = useState('all');

  const filteredTasks = verificationTasks.filter((task) => {
    if (taskFilter === 'pending') return task.status !== 'completed';
    if (taskFilter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <Card className={`rounded-3xl border overflow-hidden transition-all ${
      isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="p-5 md:p-6 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            Verification Mission Queue & Recalibration Ledger
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
            Parcels requiring high-tier drone LiDAR validation and model recalibration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            size="sm"
            tabs={[
              { id: 'all', label: `All (${verificationTasks.length})` },
              { id: 'pending', label: `UAV Required (${verificationTasks.filter(t => t.status !== 'completed').length})` },
              { id: 'completed', label: `Calibrated (${verificationTasks.filter(t => t.status === 'completed').length})` }
            ]}
            activeTab={taskFilter}
            onChange={setTaskFilter}
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500">Threshold:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber/15 text-amber border border-amber/30">
              W &gt; 0.35 (Auto-Dispatch)
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
              isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]' : 'bg-white/[0.02] border-white/10 text-mist'
            }`}>
              <th className="py-3 px-4">Task ID & Parcel</th>
              <th className="py-3 px-4">Carbon Estimate</th>
              <th className="py-3 px-4">Conformal 90% Bound</th>
              <th className="py-3 px-4">Relative Uncertainty W</th>
              <th className="py-3 px-4">Priority / Status</th>
              <th className="py-3 px-4">Recommended Protocol Action</th>
              <th className="py-3 px-4 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <CheckCircle size={28} className="mx-auto text-emerald/60" />
                    <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      No tasks in this view
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-mist'}`}>
                      {taskFilter === 'pending'
                        ? 'All high-uncertainty parcels have completed drone LiDAR calibration.'
                        : 'No verification tasks match the current filter selection.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isExceeded = (task.relative_width || 0) > 0.35;
                const isCompleted = task.status === 'completed';
                return (
                  <tr key={task.id} className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold flex items-center space-x-1.5">
                        <span className="text-emerald">#{task.id}</span>
                        <span>{task.parcel_id}</span>
                      </div>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-mist'}`}>
                        {task.project_id || 'sundarbans-b2'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm">
                      {task.carbon_estimate?.toFixed(1) || '118.4'} <span className="text-[10px] font-normal text-slate-500">tC/ha</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-slate-500">[</span>
                      <span className="text-emerald font-semibold">{task.uncertainty_lower?.toFixed(1) || '93.1'}</span>
                      <span className="text-slate-500"> &mdash; </span>
                      <span className="text-emerald font-semibold">{task.uncertainty_upper?.toFixed(1) || '143.8'}</span>
                      <span className="text-slate-500">]</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 font-mono font-bold text-[11px]">
                          <span className={isExceeded ? 'text-amber' : 'text-emerald'}>
                            {((task.relative_width || 0) * 100).toFixed(1)}%
                          </span>
                          {isExceeded && !isCompleted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber/20 text-amber font-mono font-bold">
                              &gt; 35% Limit
                            </span>
                          )}
                        </div>
                        <div className="w-28 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full ${isExceeded ? 'bg-amber' : 'bg-emerald'}`}
                            style={{ width: `${Math.min((task.relative_width || 0) * 200, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-bold border border-emerald/25">
                          <CheckCircle size={10} />
                          <span>CALIBRATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/15 text-amber font-bold border border-amber/25">
                          <AlertTriangle size={10} />
                          <span>UAV_REQUIRED</span>
                        </span>
                      )}
                    </td>

                    <td className={`py-3.5 px-4 text-[11px] max-w-xs ${isLight ? 'text-slate-600' : 'text-mist'}`}>
                      {task.recommended_action || (isCompleted ? 'LiDAR scan ingested; model recalibrated.' : 'Dispatch UAV LiDAR scan.')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isCompleted ? (
                        <div className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald bg-emerald/10 px-2.5 py-1 rounded-lg border border-emerald/20">
                          <Check size={12} />
                          <span>{task.survey_result?.sensor_model || 'LiDAR Ingested'}</span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedTaskForDrone(task)}
                          className="text-xs font-sans font-bold px-3 py-1.5 bg-emerald text-[#040906] shadow-xs hover:bg-emerald/90 inline-flex items-center space-x-1.5"
                        >
                          <Plane size={13} />
                          <span>Dispatch UAV</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default VerificationTasksTable;
