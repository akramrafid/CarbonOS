import React from 'react';
import { Plane, AlertTriangle, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function DroneSurveyModal({
  selectedTask,
  onClose,
  isLight,
  droneFormData = {},
  setDroneFormData,
  handleCompleteDroneSurvey,
  submittingDrone
}) {
  if (!selectedTask) return null;

  return (
    <Modal
      isOpen={Boolean(selectedTask)}
      onClose={onClose}
      title="UAV LiDAR Survey Calibration Intake"
      description={`Treeconomy Tier-3 Recalibration for Mission #${selectedTask.id}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Context Notice */}
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
          isLight ? 'bg-amber-500/5 border-amber-500/20 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center space-x-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>High-Uncertainty Parcel Identified: {selectedTask.parcel_id}</span>
            </span>
            <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
              Relative Uncertainty W = {((selectedTask.relative_width || 0) * 100).toFixed(1)}% (&gt; 35%)
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
              <label htmlFor="drone_chm_path" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Drone CHM GeoTIFF Path / S3 URI
              </label>
              <Input
                id="drone_chm_path"
                type="text"
                required
                value={droneFormData.drone_chm_path || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, drone_chm_path: e.target.value }))}
                placeholder="s3://surveys/chm/sundarbans_uav_2026.tif"
                className="font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="surveyed_biomass" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Surveyed Biomass (AGB t/ha)
              </label>
              <Input
                id="surveyed_biomass"
                type="number"
                step="0.1"
                required
                value={droneFormData.surveyed_biomass || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, surveyed_biomass: e.target.value }))}
                className="font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sensor_model" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Sensor Model & Payload
              </label>
              <Input
                id="sensor_model"
                type="text"
                required
                value={droneFormData.sensor_model || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, sensor_model: e.target.value }))}
                placeholder="DJI Zenmuse L1 LiDAR"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="resolution_cm" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Resolution GSD (cm/pixel)
              </label>
              <Input
                id="resolution_cm"
                type="number"
                step="0.1"
                required
                value={droneFormData.resolution_cm || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, resolution_cm: e.target.value }))}
                className="font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="operator_id" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Certified Operator / Pilot ID
              </label>
              <Input
                id="operator_id"
                type="text"
                required
                value={droneFormData.operator_id || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, operator_id: e.target.value }))}
                placeholder="UAV-TECH-BD-04"
                className="font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="survey_notes" className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                Ground Calibration Notes
              </label>
              <Input
                id="survey_notes"
                type="text"
                value={droneFormData.survey_notes || ''}
                onChange={(e) => setDroneFormData(prev => ({ ...prev, survey_notes: e.target.value }))}
                placeholder="Validated against 5 sample forest plots"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald/20">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submittingDrone}
              className="flex items-center space-x-2"
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
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default DroneSurveyModal;
