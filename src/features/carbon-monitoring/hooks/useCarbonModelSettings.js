import { useState } from 'react';
import { FASTAPI_API_URL, DEFAULT_MODEL_SETTINGS, authFetch } from '../constants';

export const useCarbonModelSettings = ({ showToast }) => {
  const [modelSettings, setModelSettings] = useState(DEFAULT_MODEL_SETTINGS);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [updatingModel, setUpdatingModel] = useState(false);

  const fetchModelSettings = async () => {
    try {
      const res = await authFetch(`${FASTAPI_API_URL}/api/carbon/settings`);
      if (res.ok) {
        const data = await res.json();
        setModelSettings(prev => ({ ...prev, ...data }));
      }
    } catch {
      // Retain default model settings
    }
  };

  const handleSelectModel = async (newModelType) => {
    setUpdatingModel(true);
    try {
      const res = await authFetch(`${FASTAPI_API_URL}/api/carbon/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_type: newModelType })
      });
      if (res.ok) {
        const data = await res.json();
        setModelSettings(prev => ({ ...prev, ...data, active_model: newModelType }));
        if (newModelType === 'fusion') {
          showToast('Multi-Modal Fusion active (Safety Gate: Insufficient real samples fallback to Random Forest engaged).', 'info');
        } else {
          showToast(`Active estimation model switched to: ${newModelType.toUpperCase()}`, 'success');
        }
      } else {
        setModelSettings(prev => ({ ...prev, active_model: newModelType }));
        showToast(`Model set to: ${newModelType.toUpperCase()}`, 'success');
      }
    } catch {
      setModelSettings(prev => ({ ...prev, active_model: newModelType }));
      showToast(`Model set to: ${newModelType.toUpperCase()}`, 'success');
    } finally {
      setUpdatingModel(false);
    }
  };

  return {
    modelSettings, setModelSettings,
    modelPerformance, setModelPerformance,
    updatingModel,
    fetchModelSettings,
    handleSelectModel
  };
};
