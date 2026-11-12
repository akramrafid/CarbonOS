import React from 'react';
import { TieredHeaderCard } from './tiered/TieredHeaderCard';
import { TieredStatsRow } from './tiered/TieredStatsRow';
import { VerificationTasksTable } from './tiered/VerificationTasksTable';
import { DroneSurveyModal } from './tiered/DroneSurveyModal';

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
    setSelectedTaskForDrone,
    fetchVerificationTasks,
    loadingTasks
  } = props;

  return (
    <>
      <div className="space-y-6">
        {/* Header Banner: Treeconomy Architecture Pattern */}
        <TieredHeaderCard
          isLight={isLight}
          fetchVerificationTasks={fetchVerificationTasks}
          loadingTasks={loadingTasks}
        />

        {/* 4 Summary Stat Cards */}
        <TieredStatsRow
          isLight={isLight}
          verificationTasks={verificationTasks}
        />

        {/* Verification Tasks Table Card */}
        <VerificationTasksTable
          isLight={isLight}
          verificationTasks={verificationTasks}
          setSelectedTaskForDrone={setSelectedTaskForDrone}
        />
      </div>

      {/* UAV LiDAR Survey Calibration Intake Modal */}
      <DroneSurveyModal
        selectedTask={selectedTaskForDrone}
        onClose={() => setSelectedTaskForDrone(null)}
        isLight={isLight}
        droneFormData={droneFormData}
        setDroneFormData={setDroneFormData}
        handleCompleteDroneSurvey={handleCompleteDroneSurvey}
        submittingDrone={submittingDrone}
      />
    </>
  );
}

export default TieredVerificationPanel;
