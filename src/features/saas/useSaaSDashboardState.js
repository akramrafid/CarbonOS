import { useState } from 'react';
import { CLIENT_PROFILES } from '../../pages/platform/clientProfiles';
import { computeCategoryMatrix } from './constants';
import { useSaaSClientState } from './hooks/useSaaSClientState';
import { useSaaSEmissionsCalculator } from './hooks/useSaaSEmissionsCalculator';
import { useSaaSRagAndExtraction } from './hooks/useSaaSRagAndExtraction';
import { useSaaSOperationsState } from './hooks/useSaaSOperationsState';

export const useSaaSDashboardState = () => {
  // Floating Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Modular state hooks
  const clientState = useSaaSClientState(showToast);
  const calcState = useSaaSEmissionsCalculator(clientState.activeClient, showToast);
  const opsState = useSaaSOperationsState(showToast);
  const ragState = useSaaSRagAndExtraction({
    inputs: calcState.inputs,
    setInputs: calcState.setInputs,
    ef: calcState.ef,
    setEf: calcState.setEf,
    calculateEmissions: calcState.calculateEmissions,
    setTasks: opsState.setTasks,
    setNotifications: opsState.setNotifications,
    showToast
  });

  const handleSelectClient = (clientId) => {
    clientState.setActiveClientId(clientId);
    clientState.setIsClientModalOpen(false);
    const client = CLIENT_PROFILES.find(c => c.id === clientId);
    if (client) {
      if (client.baselineInputs) {
        calcState.setInputs(prev => ({
          ...prev,
          ...client.baselineInputs
        }));
      }
      if (client.district) {
        clientState.setSelectedDistrict(client.district);
      }
      showToast(
        clientState.lang === 'bn' 
          ? `ক্লায়েন্ট প্রোফাইল সক্রিয়: ${client.name}` 
          : `Active corporate workspace: ${client.name}`,
        "info"
      );
    }
  };

  const activeParams = ragState.extractionResult ? (ragState.extractionResult.parameters || calcState.inputs) : calcState.inputs;
  const activeMatrix = computeCategoryMatrix(activeParams, calcState.customItems, calcState.categoryAdjustments, calcState.ef.electricity);

  return {
    ...clientState,
    ...calcState,
    ...opsState,
    ...ragState,
    toast,
    showToast,
    handleSelectClient,
    activeMatrix
  };
};

export default useSaaSDashboardState;
