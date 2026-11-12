import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { SaaSLocales } from '../../../pages/platform/SaaSLocalization';
import { CLIENT_PROFILES } from '../../../pages/platform/clientProfiles';

export const useSaaSClientState = (showToast) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Active Menu / Tabs state
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Bilingual Localization & Reporting Currency state
  const [lang, setLang] = useState('en');
  const locale = SaaSLocales[lang] || SaaSLocales.en;
  const [currency, setCurrency] = useState('BDT');

  // Selected District state
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");

  // Multi-Tenant Corporate Client Profiles
  const [activeClientId, setActiveClientId] = useState('east-delta-university');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEsgAuditModalOpen, setIsEsgAuditModalOpen] = useState(false);
  const activeClient = CLIENT_PROFILES.find(c => c.id === activeClientId) || CLIENT_PROFILES[0];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    showToast("Detecting regional location...", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let detected = "Dhaka";
        if (lat > 24.5) detected = "Sylhet";
        else if (lat < 22.5) detected = "Chittagong";
        else if (lon < 89.5) detected = "Khulna";
        else if (lat > 24 && lon < 89.5) detected = "Rajshahi";
        else detected = "Dhaka";
        
        setSelectedDistrict(detected);
        showToast(`Located in ${detected} district! Regional default emission parameters applied.`, "success");
      },
      () => {
        showToast("Unable to detect coordinates. Defaulted to Dhaka.", "info");
      }
    );
  };

  return {
    navigate,
    theme,
    toggleTheme,
    isLight,
    activeMenu,
    setActiveMenu,
    lang,
    setLang,
    locale,
    currency,
    setCurrency,
    selectedDistrict,
    setSelectedDistrict,
    activeClientId,
    setActiveClientId,
    isClientModalOpen,
    setIsClientModalOpen,
    isEsgAuditModalOpen,
    setIsEsgAuditModalOpen,
    activeClient,
    detectLocation
  };
};
