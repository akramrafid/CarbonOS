import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { ArrowLeft, Save } from 'lucide-react';

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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative hover:border-[#CCFF00]/25 transition-all duration-300">
      {!isInline && (
        <button onClick={() => navigate('/harvestguard/dashboard')} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}
      {isInline && onBack && (
        <button onClick={onBack} className="flex items-center text-white/50 hover:text-white mb-6 text-sm font-semibold transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
      )}
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 mt-4">Log New Harvest</h2>
        <p className="text-white/60 text-sm">Offline mode supported</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-white/80 text-sm font-bold mb-1.5">Crop Type / ফসল</label>
          <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all">
            <option value="rice" className="bg-carbon text-white">Paddy/Rice (ধান)</option>
            <option value="potato" className="bg-carbon text-white">Potato (আলু)</option>
            <option value="tomato" className="bg-carbon text-white">Tomato (টমেটো)</option>
            <option value="maize" className="bg-carbon text-white">Maize (ভুট্টা)</option>
            <option value="mango" className="bg-carbon text-white">Mango (আম)</option>
            <option value="jackfruit" className="bg-carbon text-white">Jackfruit (কাঁঠাল)</option>
            <option value="guava" className="bg-carbon text-white">Guava (পেয়ারা)</option>
            <option value="citrus" className="bg-carbon text-white">Citrus (লেবু/কমলা)</option>
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-bold mb-1.5">Weight / ওজন (kg)</label>
          <input type="number" min="1" value={weight} onChange={e => setWeight(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all" placeholder="e.g., 500" />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-bold mb-1.5">Harvest Date / কাটার তারিখ</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all" style={{ colorScheme: 'dark' }} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-white/80 text-sm font-bold">District / জেলা</label>
            <button 
              type="button" 
              onClick={detectLocation} 
              disabled={detectingLocation}
              className="text-xs text-[#CCFF00] hover:text-[#bce500] hover:underline flex items-center space-x-1 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {detectingLocation ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin"></div>
                  <span>Detecting...</span>
                </>
              ) : locationError ? (
                <span className="text-white/40">Retry (Auto-detect) 📍</span>
              ) : (
                <span>Auto-detect 📍</span>
              )}
            </button>
          </div>
          <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all">
            {districts.map(d => <option key={d} value={d} className="bg-carbon text-white">{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-bold mb-1.5">Storage Type / সংরক্ষণের ধরন</label>
          <select value={storageType} onChange={e => setStorageType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all">
            <option value="jute_bag" className="bg-carbon text-white">Jute Bag Stack (চটের বস্তা)</option>
            <option value="silo" className="bg-carbon text-white">Silo / Sealed (সাইলো)</option>
            <option value="open_area" className="bg-carbon text-white">Open Area Drying (উন্মুক্ত স্থানে)</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-[#CCFF00] text-black font-extrabold py-4 rounded-xl mt-8 flex justify-center items-center space-x-2 hover:bg-[#bce500] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all">
          <Save size={20} />
          <span>Save Batch</span>
        </button>
      </form>
    </div>
  );

  if (isInline) {
    return <div className="w-full flex items-center justify-center py-4">{formContent}</div>;
  }

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-16 px-4 flex items-center justify-center">
      {formContent}
    </div>
  );
};

export default BatchRegistration;
