import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { PageHeader } from '../../components/ui/PageHeader';

const districts = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur",
  "Chapainawabganj", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur",
  "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore",
  "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram",
  "Kushtia", "Lalmonirhat", "Lakshmipur", "Madaripur", "Magura", "Manikganj", "Meherpur",
  "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
  "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur",
  "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
].sort();

const BatchRegistration = ({ isInline = false, onBack = null, onSaveBatch = null }) => {
  const { addBatch } = useHarvestStore();
  const navigate = useNavigate();

  const [cropType, setCropType] = useState('rice');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState(districts[0]);
  const [storageType, setStorageType] = useState('jute_bag');

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};

            const detectedValue =
              address.state_district ||
              address.county ||
              address.district ||
              address.city ||
              address.suburb ||
              "";

            const matchedDistrict = districts.find(d => {
              const normalizedD = d.toLowerCase().replace(/[\s']/g, '');
              const normalizedVal = detectedValue.toLowerCase().replace(/[\s']/g, '');
              return normalizedVal.includes(normalizedD) || normalizedD.includes(normalizedVal);
            });

            if (matchedDistrict) {
              setDistrict(matchedDistrict);
            } else {
              setLocationError("District not matched");
            }
          } else {
            setLocationError("Geocoding failed");
          }
        } catch (err) {
          setLocationError("Connection error");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setLocationError(error.code === 1 ? "Permission denied" : "Position unavailable");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight && date && district) {
      addBatch(cropType, weight, date, district, storageType);
      if (isInline && onSaveBatch) {
        onSaveBatch();
      } else {
        navigate('/harvestguard/dashboard');
      }
    }
  };

  const formContent = (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative hover:border-lime-400/25 transition-all duration-300">
      {!isInline && (
        <IconButton
          icon={<ArrowLeft size={24} />}
          aria-label="Back to HarvestGuard Dashboard"
          onClick={() => navigate('/harvestguard/dashboard')}
          className="absolute top-8 left-8 text-white/50 hover:text-white"
        />
      )}
      {isInline && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft size={20} />}
          className="text-white/50 hover:text-white mb-6 font-semibold"
        >
          Back
        </Button>
      )}

      {!isInline ? (
        <PageHeader
          title="Log New Harvest"
          description="Offline mode supported"
          align="center"
          className="border-none mb-6 pb-0"
          titleClassName="!text-3xl !font-extrabold !text-fg-primary !tracking-tight"
        />
      ) : (
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">Log New Harvest</h2>
          <p className="text-xs text-fg-muted mt-1">Offline mode supported</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className="block text-fg-secondary text-sm font-bold mb-1.5">Crop Type / ফসল</label>
            <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-fg-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all">
              <option value="rice">Paddy/Rice (ধান)</option>
              <option value="potato">Potato (আলু)</option>
              <option value="tomato">Tomato (টমেটো)</option>
              <option value="maize">Maize (ভুট্টা)</option>
              <option value="mango">Mango (আম)</option>
              <option value="jackfruit">Jackfruit (কাঁঠাল)</option>
              <option value="guava">Guava (পেয়ারা)</option>
              <option value="citrus">Citrus (লেবু/কমলা)</option>
            </select>
        </div>

        <div>
          <label className="block text-fg-secondary text-sm font-bold mb-1.5">Weight / ওজন (kg)</label>
          <input type="number" min="1" value={weight} onChange={e => setWeight(e.target.value)} required className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-fg-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all" placeholder="e.g., 500" />
        </div>

        <div>
          <label className="block text-fg-secondary text-sm font-bold mb-1.5">Harvest Date / কাটার তারিখ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-fg-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-fg-secondary text-sm font-bold">District / জেলা</label>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="text-xs text-accent hover:underline flex items-center space-x-1 p-0 h-auto"
            >
              {detectingLocation ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-1"></div>
                  <span>Detecting...</span>
                </>
              ) : locationError ? (
                <span className="text-fg-muted inline-flex items-center gap-1">Retry (Auto-detect) <MapPin size={12} /></span>
              ) : (
                <span className="inline-flex items-center gap-1">Auto-detect <MapPin size={12} /></span>
              )}
            </Button>
          </div>
            <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-fg-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all">
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>

        <div>
            <label className="block text-fg-secondary text-sm font-bold mb-1.5">Storage Type / সংরক্ষণের ধরন</label>
            <select value={storageType} onChange={e => setStorageType(e.target.value)} className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-fg-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all">
              <option value="jute_bag">Jute Bag Stack (চটের বস্তা)</option>
              <option value="silo">Silo / Sealed (সাইলো)</option>
              <option value="open_area">Open Area Drying (উন্মুক্ত স্থানে)</option>
            </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-8"
          leftIcon={<Save size={20} />}
        >
          Save Batch
        </Button>
      </form>
    </div>
  );

  if (isInline) {
    return <div className="w-full flex items-center justify-center py-4">{formContent}</div>;
  }

  return (
      <div className="w-full flex items-center justify-center py-4">
        {formContent}
      </div>
      );
};

      export default BatchRegistration;
