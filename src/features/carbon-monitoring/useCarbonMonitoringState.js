import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCarbonMapState } from './hooks/useCarbonMapState';
import { useCarbonTelemetryData } from './hooks/useCarbonTelemetryData';
import { useCarbonVerraProvenance } from './hooks/useCarbonVerraProvenance';

export function useCarbonMonitoringState() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Floating Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Modular state hooks
  const mapState = useCarbonMapState({ selectedJob: null, showToast });
  const telemetryState = useCarbonTelemetryData({ mapState, showToast });
  const verraState = useCarbonVerraProvenance({
    selectedJob: telemetryState.selectedJob,
    dashboardData: telemetryState.dashboardData,
    showToast
  });

  // Non-blocking background revalidation of stats
  useEffect(() => {
    telemetryState.fetchDashboardStats();
    telemetryState.fetchHistory();
    telemetryState.fetchAlerts();
    verraState.fetchVerificationTasks();
    verraState.fetchModelSettings();
    verraState.fetchProvenanceTrust();
  }, []);

  return {
    isBn,
    theme,
    isLight,
    toast,
    setToast,
    showToast,
    ...mapState,
    ...telemetryState,
    ...verraState
  };
}

export default useCarbonMonitoringState;
