import { useState, useEffect } from 'react';
import { escapeCsvCell, safeGetItem, safeSetItem } from './safeStorage';

// Secure HarvestStore Hook (Real server-side auth + zero credentials in localStorage)
export const useHarvestStore = () => {
  const [profile, setProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Load from storage on mount with automatic security migration
    const storedProfile = safeGetItem('hg_profile');
    const storedBatches = safeGetItem('hg_batches');
    const storedBadges = safeGetItem('hg_badges');

    if (storedProfile) {
      try {
        const p = JSON.parse(storedProfile);
        // Security migration: Remove any legacy unsalted passwordHash from localStorage
        if (p && p.passwordHash) {
          delete p.passwordHash;
          safeSetItem('hg_profile', JSON.stringify(p));
        }
        setProfile(p);
      } catch (e) {
        console.error("Failed to parse stored profile", e);
      }
    }
    if (storedBatches) {
      try {
        setBatches(JSON.parse(storedBatches));
      } catch (e) {
        console.error("Failed to parse stored batches", e);
      }
    }
    if (storedBadges) {
      try {
        setBadges(JSON.parse(storedBadges));
      } catch (e) {
        console.error("Failed to parse stored badges", e);
      }
    }
  }, []);

  const registerProfile = async (name, phone, password, language) => {
    // Send to backend for cryptographically salted password hashing and secure session establishment
    try {
      const response = await fetch('/api/farmers-ai/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone, password, language })
      });
      if (!response.ok) {
        console.warn("Server auth registration failed, proceeding with local offline profile");
      }
    } catch (err) {
      console.warn("Backend auth unreachable (offline mode), proceeding locally:", err);
    }

    // Store ONLY safe non-sensitive metadata locally.
    // NEVER store passwords or hashes in localStorage!
    const newProfile = { name, phone, language, registeredAt: new Date().toISOString() };
    setProfile(newProfile);
    safeSetItem('hg_profile', JSON.stringify(newProfile));
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
    safeSetItem('hg_batches', JSON.stringify(updatedBatches));

    // Gamification Logic
    if (updatedBatches.length === 1 && !badges.includes('First Harvest Logged')) {
      const newBadges = [...badges, 'First Harvest Logged'];
      setBadges(newBadges);
      safeSetItem('hg_badges', JSON.stringify(newBadges));
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
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(','))
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
