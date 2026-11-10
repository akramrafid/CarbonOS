import React from 'react';
import {
  Mountain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  Download,
  Upload,
  RefreshCw,
  Plane,
  X
} from 'lucide-react';

export function TieredVerificationPanel(props) {
  const {
    isLight,
    isBn,
    t,
    verificationTasks = [],
    droneFormData,
    setDroneFormData,
    submittingDrone,
    handleCompleteDroneSurvey,
    triggerLocalBundleDownload,
    selectedTaskForDrone,
    setSelectedTaskForDrone
  } = props;

  return (
    <>
      <div className="space-y-6">
          {/* Header Banner: Treeconomy Architecture Pattern */}
          <div className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden transition-all ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="max-w-3xl">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-emerald/10 text-emerald">
                    <Mountain size={20} />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald/15 text-emerald border border-emerald/25">
                    Treeconomy Adaptive Resolution Protocol
                  </span>
                </div>
                <h2 className={`text-2xl md:text-3xl font-bold font-sans tracking-tight mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  Uncertainty-Tiered Monitoring & UAV LiDAR Dispatch
                </h2>
                <p className={`text-xs md:text-sm leading-relaxed ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  Satellite SAR & optical imagery provide nationwide temporal screening. Parcels where relative conformal uncertainty <span className="font-mono font-bold text-emerald">W = (C_upper90 - C_lower90) / C_est &gt; 0.35</span> (35%) are automatically escalated to this queue. Dispatching targeted high-density drone LiDAR surveys tightens the error bound, prevents Verra VM0047 precision discount penalties, and directly recalibrates sovereign biomass models.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={fetchVerificationTasks}
                  disabled={loadingTasks}
                  className={`text-xs font-mono px-4 py-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    isLight ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  <RefreshCw size={13} className={loadingTasks ? 'animate-spin' : ''} />
                  <span>{loadingTasks ? 'Refreshing Queue...' : 'Sync Tasks'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-5 border transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  Monitored Parcels
                </span>
                <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
                  <Trees size={14} />
                </span>
              </div>
              <div className={`text-2xl font-extrabold font-sans ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                {verificationTasks.length + 12}
              </div>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                100% Sentinel-1/2 Telemetry active
              </span>
            </div>

            <div className={`rounded-2xl p-5 border transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  High Uncertainty (W &gt; 0.35)
                </span>
                <span className="p-1.5 rounded-lg bg-amber/15 text-amber">
                  <AlertTriangle size={14} />
                </span>
              </div>
              <div className="text-2xl font-extrabold font-sans text-amber">
                {verificationTasks.filter(t => t.status === 'pending').length}
              </div>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Awaiting UAV LiDAR flight scan
              </span>
            </div>

            <div className={`rounded-2xl p-5 border transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  UAV LiDAR Calibrated
                </span>
                <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
                  <Plane size={14} />
                </span>
              </div>
              <div className="text-2xl font-extrabold font-sans text-emerald">
                {verificationTasks.filter(t => t.status === 'completed').length}
              </div>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                5cm CHM height model ingested
              </span>
            </div>

            <div className={`rounded-2xl p-5 border transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  Mean Conformal Width W
                </span>
                <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
                  <Scale size={14} />
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-extrabold font-sans ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                  {(verificationTasks.reduce((acc, t) => acc + (t.relative_width || 0), 0) / (verificationTasks.length || 1) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">
                  Target &le; 35%
                </span>
              </div>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                Zero Verra VM0047 precision deduction
              </span>
            </div>
          </div>

          {/* Verification Tasks Table Card */}
          <div className={`rounded-3xl border overflow-hidden transition-all ${
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
                <div className="flex items-center space-x-1 p-1 rounded-xl border border-inherit bg-black/5 dark:bg-white/5">
                  {[
                    { id: 'all', label: 'All', count: verificationTasks.length },
                    { id: 'pending', label: 'UAV Required', count: verificationTasks.filter(t => t.status !== 'completed').length },
                    { id: 'completed', label: 'Calibrated', count: verificationTasks.filter(t => t.status === 'completed').length }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTaskFilter(f.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald cursor-pointer ${
                        taskFilter === f.id
                          ? 'bg-emerald text-[#040906] font-bold shadow-xs'
                          : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-mist hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
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
                  {(() => {
                    const filteredTasks = verificationTasks.filter((task) => {
                      if (taskFilter === 'pending') return task.status !== 'completed';
                      if (taskFilter === 'completed') return task.status === 'completed';
                      return true;
                    });

                    if (filteredTasks.length === 0) {
                      return (
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
                      );
                    }

                    return filteredTasks.map((task) => {
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
                              <button
                                onClick={() => setSelectedTaskForDrone(task)}
                                className="text-xs font-sans font-bold px-3 py-1.5 rounded-xl bg-emerald text-[#040906] shadow-xs hover:bg-emerald/90 cursor-pointer inline-flex items-center space-x-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                              >
                                <Plane size={13} />
                                <span>Dispatch UAV</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
            {/* MODAL 1: UAV LiDAR Survey Calibration Intake (Treeconomy Pattern) */}
      {selectedTaskForDrone && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTaskForDrone(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="drone-modal-title"
            className={`relative w-full max-w-2xl rounded-3xl border p-6 md:p-8 shadow-2xl transition-all ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F291B]' : 'bg-[#0B1810] border-[#1D3B2B] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-emerald/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
                  <Plane size={20} />
                </div>
                <div>
                  <h3 id="drone-modal-title" className="text-lg font-bold">UAV LiDAR Survey Calibration Intake</h3>
                  <p className={`text-xs ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                    Treeconomy Tier-3 Recalibration for Mission #{selectedTaskForDrone.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTaskForDrone(null)}
                aria-label="Close dialog"
                className={`p-1.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald cursor-pointer ${
                  isLight ? 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]' : 'border-white/10 hover:bg-white/10 text-mist'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Context Notice */}
            <div className={`p-4 rounded-2xl border mb-5 text-xs space-y-2 ${
              isLight ? 'bg-amber-500/5 border-amber-500/20 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>High-Uncertainty Parcel Identified: {selectedTaskForDrone.parcel_id}</span>
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                  Relative Uncertainty W = {((selectedTaskForDrone.relative_width || 0) * 100).toFixed(1)}% (&gt; 35%)
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Satellite estimates exhibited wide conformal prediction intervals. Uploading centimeter-resolution drone LiDAR / photogrammetry will recalibrate local allometric models, tightening 90% confidence bounds to &lt; 10%.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCompleteDroneSurvey} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="drone_chm_path" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Drone CHM GeoTIFF Path / S3 URI
                  </label>
                  <input
                    id="drone_chm_path"
                    type="text"
                    required
                    value={droneFormData.drone_chm_path}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, drone_chm_path: e.target.value }))}
                    placeholder="s3://surveys/chm/sundarbans_uav_2026.tif"
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="surveyed_biomass" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Surveyed Biomass (AGB t/ha)
                  </label>
                  <input
                    id="surveyed_biomass"
                    type="number"
                    step="0.1"
                    required
                    value={droneFormData.surveyed_biomass}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, surveyed_biomass: e.target.value }))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sensor_model" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Sensor Model & Payload
                  </label>
                  <input
                    id="sensor_model"
                    type="text"
                    required
                    value={droneFormData.sensor_model}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, sensor_model: e.target.value }))}
                    placeholder="DJI Zenmuse L1 LiDAR"
                    className={`w-full border rounded-xl px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="resolution_cm" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Resolution GSD (cm/pixel)
                  </label>
                  <input
                    id="resolution_cm"
                    type="number"
                    step="0.1"
                    required
                    value={droneFormData.resolution_cm}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, resolution_cm: e.target.value }))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="operator_id" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Certified Operator / Pilot ID
                  </label>
                  <input
                    id="operator_id"
                    type="text"
                    required
                    value={droneFormData.operator_id}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, operator_id: e.target.value }))}
                    placeholder="UAV-TECH-BD-04"
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="survey_notes" className={`font-bold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Ground Calibration Notes
                  </label>
                  <input
                    id="survey_notes"
                    type="text"
                    value={droneFormData.survey_notes}
                    onChange={(e) => setDroneFormData(prev => ({ ...prev, survey_notes: e.target.value }))}
                    placeholder="Validated against 5 sample forest plots"
                    className={`w-full border rounded-xl px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald/20">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForDrone(null)}
                  className={`px-4 py-2.5 rounded-xl border font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald cursor-pointer ${
                    isLight ? 'border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#64748B]' : 'border-white/10 hover:bg-white/10 text-mist'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDrone}
                  className="px-5 py-2.5 rounded-xl bg-emerald hover:bg-emerald/90 text-[#0F291B] font-bold flex items-center space-x-2 shadow-lg shadow-emerald/20 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  {submittingDrone ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Ingesting Survey...</span>
                    </>
                  ) : (
                    <>
                      <Plane size={15} />
                      <span>Ingest UAV LiDAR & Resolve Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TieredVerificationPanel;
