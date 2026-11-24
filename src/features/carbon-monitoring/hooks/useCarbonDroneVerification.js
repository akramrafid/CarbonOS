import { useState } from 'react';
import { FASTAPI_API_URL, DEFAULT_VERIFICATION_TASKS, authFetch } from '../constants';

export const useCarbonDroneVerification = ({ showToast }) => {
  const [verificationTasks, setVerificationTasks] = useState(DEFAULT_VERIFICATION_TASKS);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskForDrone, setSelectedTaskForDrone] = useState(null);
  const [droneFormData, setDroneFormData] = useState({
    drone_chm_path: "/surveys/chm/sundarbans_uav_2026.tif",
    surveyed_biomass: 245.5,
    sensor_model: "DJI Zenmuse L1 LiDAR",
    resolution_cm: 5.0,
    operator_id: "UAV-TECH-BD-04",
    survey_notes: "High-density canopy return; validated against ground plots"
  });
  const [submittingDrone, setSubmittingDrone] = useState(false);

  const fetchVerificationTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await authFetch(`${FASTAPI_API_URL}/api/carbon/verification-tasks`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVerificationTasks(data);
        }
      }
    } catch {
      // Retain default tasks
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCompleteDroneSurvey = async (e) => {
    e.preventDefault();
    if (!selectedTaskForDrone) return;
    setSubmittingDrone(true);
    const biomassMgHa = parseFloat(droneFormData.surveyed_biomass);
    const carbonTcHa = Number.isFinite(biomassMgHa) ? Number((biomassMgHa * 0.475).toFixed(3)) : 0;
    try {
      const res = await authFetch(`${FASTAPI_API_URL}/api/carbon/verification-tasks/${encodeURIComponent(selectedTaskForDrone.id)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measured_biomass_mg_ha: biomassMgHa,
          measured_carbon_tc_ha: carbonTcHa,
          survey_date: new Date().toISOString().slice(0, 10),
          drone_platform: droneFormData.sensor_model,
          raw_imagery_path: droneFormData.drone_chm_path,
          collected_by: droneFormData.operator_id,
          data_source: 'drone_lidar',
        })
      });
      if (res.ok) {
        const completed = await res.json();
        setVerificationTasks(prev => prev.map(t => t.id === selectedTaskForDrone.id ? {
          ...t,
          status: completed.status || 'completed',
          priority: 'RESOLVED',
          recommended_action: `UAV LiDAR survey ingested (${droneFormData.sensor_model}).`,
          survey_result: {
            sensor_model: droneFormData.sensor_model,
            measured_biomass_mg_ha: completed.measured_biomass_mg_ha ?? biomassMgHa,
            measured_carbon_tc_ha: completed.measured_carbon_tc_ha ?? carbonTcHa,
            operator_id: droneFormData.operator_id,
            calibrated_at: new Date().toISOString(),
          }
        } : t));
        showToast(`UAV LiDAR data ingested for parcel ${selectedTaskForDrone.parcel_id}!`, 'success');
        setSelectedTaskForDrone(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || `Failed to complete verification task (HTTP ${res.status}).`, 'error');
      }
    } catch {
      // [COMMENTED OUT FOR PERSONAL REFERENCE — never fake verification task completion on network failure]
      showToast('Failed to reach verification backend to submit drone survey.', 'error');
    } finally {
      setSubmittingDrone(false);
    }
  };

  return {
    verificationTasks,
    loadingTasks,
    droneFormData, setDroneFormData,
    submittingDrone,
    selectedTaskForDrone, setSelectedTaskForDrone,
    fetchVerificationTasks,
    handleCompleteDroneSurvey
  };
};
