import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { ArrowLeft, Save } from 'lucide-react';

const districts = [
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
  "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Rajshahi", "Sirajgonj",
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"
].sort();

const BatchRegistration = ({ isInline = false, onBack = null, onSaveBatch = null }) => {
  const { addBatch } = useHarvestStore();
  const navigate = useNavigate();

  const [cropType, setCropType] = useState('rice');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState(districts[0]);
  const [storageType, setStorageType] = useState('jute_bag');

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
          <label className="block text-white/80 text-sm font-bold mb-1.5">District / জেলা</label>
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
