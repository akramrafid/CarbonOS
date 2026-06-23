import { useState, useEffect } from 'react';

// Basic LocalStorage Sync Hook
export const useHarvestStore = () => {
  const [profile, setProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Load from LocalStorage on mount
    const storedProfile = localStorage.getItem('hg_profile');
    const storedBatches = localStorage.getItem('hg_batches');
    const storedBadges = localStorage.getItem('hg_badges');

    if (storedProfile) setProfile(JSON.parse(storedProfile));
    if (storedBatches) setBatches(JSON.parse(storedBatches));
    if (storedBadges) setBadges(JSON.parse(storedBadges));
  }, []);

  const registerProfile = async (name, phone, password, language) => {
    // Simple mock hash (DO NOT use in real production)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const newProfile = { name, phone, passwordHash: hashedPassword, language, registeredAt: new Date().toISOString() };
    setProfile(newProfile);
    localStorage.setItem('hg_profile', JSON.stringify(newProfile));
  };

  const addBatch = (cropType, weight, date, district, storageType) => {
    const newBatch = {
      id: crypto.randomUUID(),
      cropType,
      weight,
      date,
      district,
      storageType,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    const updatedBatches = [newBatch, ...batches];
    setBatches(updatedBatches);
    localStorage.setItem('hg_batches', JSON.stringify(updatedBatches));

    // Gamification Logic
    if (updatedBatches.length === 1 && !badges.includes('First Harvest Logged')) {
      const newBadges = [...badges, 'First Harvest Logged'];
      setBadges(newBadges);
      localStorage.setItem('hg_badges', JSON.stringify(newBadges));
    }
  };

  const exportData = () => {
    const data = { profile, badges, batches };
    
    // Export JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvestguard_export_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (batches.length === 0) return;
    
    const headers = ['ID', 'Crop', 'Weight (kg)', 'Harvest Date', 'District', 'Storage Type', 'Status'];
    const rows = batches.map(b => [
      b.id, b.cropType, b.weight, b.date, b.district, b.storageType, b.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvestguard_batches_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    profile,
    batches,
    badges,
    registerProfile,
    addBatch,
    exportData,
    exportCSV
  };
};
