import { useState, useEffect, useRef } from 'react';
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
  const toastTimerRef = useRef(null);
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Keep latest selectedJob in a ref so mapState callbacks never read stale null
  const selectedJobRef = useRef(null);

  // Modular state hooks
  // [COMMENTED OUT FOR PERSONAL REFERENCE — passed selectedJob: null because telemetryState initializes after mapState]
  // const mapState = useCarbonMapState({ selectedJob: null, showToast });
  const mapState = useCarbonMapState({ selectedJob: selectedJobRef, showToast });
  const telemetryState = useCarbonTelemetryData({ mapState, showToast });
  selectedJobRef.current = telemetryState.selectedJob;
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
