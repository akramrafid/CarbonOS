import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { User, LogIn, Award, List, Download, Plus, ArrowLeft, Sprout } from 'lucide-react';

const HarvestGuardDashboard = ({ isInline = false, onBack = null, onAddBatchClick = null, onViewRiskClick = null }) => {
  const { profile, batches, badges, registerProfile, exportData, exportCSV } = useHarvestStore();
  const navigate = useNavigate();

  // Registration State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('bn');

  // Weather Location State
  const [userLocation, setUserLocation] = useState('Dhaka');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);
    
    const fetchWeather = async () => {
      const apiKey = '895284852c5a6104617a26ba3534b46c';
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userLocation},BD&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error("OpenWeather API failed");
        const data = await res.json();
        if (isMounted) {
          setWeatherData({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind: data.wind.speed,
            source: 'OpenWeather API'
          });
          setWeatherLoading(false);
        }
      } catch (err) {
        console.warn("OpenWeatherMap fetch failed, falling back to open-meteo:", err);
        try {
          const coords = {
            "Dhaka": { lat: 23.8103, lon: 90.4125 },
            "Rajshahi": { lat: 24.3636, lon: 88.6241 },
            "Sylhet": { lat: 24.8949, lon: 91.8687 },
            "Chittagong": { lat: 22.3569, lon: 91.7832 },
            "Khulna": { lat: 22.8456, lon: 89.5403 },
            "Barisal": { lat: 22.7010, lon: 90.3535 },
            "Rangpur": { lat: 25.7508, lon: 89.2467 },
          };
          const c = coords[userLocation] || coords["Dhaka"];
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
          if (!res.ok) throw new Error("Open-Meteo failed");
          const data = await res.json();
          if (isMounted) {
            setWeatherData({
              temp: Math.round(data.current.temperature_2m),
              humidity: data.current.relative_humidity_2m,
              description: "Clear sky (fallback)",
              icon: "01d",
              wind: data.current.wind_speed_10m,
              source: 'Open-Meteo API'
            });
            setWeatherLoading(false);
          }
        } catch (meteoErr) {
          console.warn("Both weather APIs failed, using local mock data:", meteoErr);
          const mockBases = {
            "Dhaka": { temp: 32, humidity: 75, desc: "Scattered Clouds", wind: 3.5 },
            "Rajshahi": { temp: 36, humidity: 60, desc: "Sunny and Clear", wind: 2.1 },
            "Sylhet": { temp: 28, humidity: 90, desc: "Moderate Rain", wind: 4.2 },
            "Chittagong": { temp: 31, humidity: 85, desc: "Light Drizzle", wind: 5.0 },
            "Khulna": { temp: 34, humidity: 80, desc: "Humid and Clear", wind: 3.1 },
            "Barisal": { temp: 30, humidity: 88, desc: "Overcast Clouds", wind: 4.8 },
            "Rangpur": { temp: 29, humidity: 70, desc: "Partly Cloudy", wind: 2.6 },
          };
          const mock = mockBases[userLocation] || mockBases["Dhaka"];
          if (isMounted) {
            setWeatherData({
              temp: mock.temp,
              humidity: mock.humidity,
              description: mock.desc,
              icon: "02d",
              wind: mock.wind,
              source: 'Local Engine'
            });
            setWeatherLoading(false);
          }
        }
      }
    };
    
    fetchWeather();
    return () => { isMounted = false; };
  }, [userLocation]);

  const handleLocationChange = (newLoc) => {
    setUserLocation(newLoc);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (name && phone && password) {
      registerProfile(name, phone, password, lang);
    }
  };

  if (!profile) {
    return (
      <div className={`flex items-center justify-center w-full ${isInline ? 'py-4' : 'min-h-screen pt-24 pb-16 px-4'}`}>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] w-full max-w-md shadow-2xl hover:border-[#CCFF00]/25 transition-all duration-300">
          {isInline && onBack && (
            <button onClick={onBack} className="flex items-center text-white/50 hover:text-white mb-6 text-sm font-semibold transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
          )}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Join HarvestGuard</h2>
            <p className="text-white/60 text-sm">Register your offline profile</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-bold mb-1.5">Name / নাম</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all" />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-bold mb-1.5">Phone / মোবাইল</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all" />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-bold mb-1.5">Password / পাসওয়ার্ড</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/50 transition-all" />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-bold mb-1.5">Language / ভাষা</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-all">
                <option value="bn" className="bg-carbon text-white">বাংলা (Bangla)</option>
                <option value="en" className="bg-carbon text-white">English</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-[#CCFF00] text-black font-extrabold py-4 rounded-xl mt-6 flex justify-center items-center space-x-2 hover:bg-[#bce500] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all">
              <LogIn size={20} />
              <span>Create Offline Profile</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const dashboardContent = (
    <div className="max-w-5xl mx-auto w-full">
      {!isInline && (
        <button onClick={() => navigate('/farmers-ai')} className="flex items-center text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Landing
        </button>
      )}
      {isInline && onBack && (
        <button onClick={onBack} className="flex items-center text-white/50 hover:text-white mb-8 text-sm font-semibold transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Landing
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[28px] mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 blur-2xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10 w-full md:w-auto text-center md:text-left">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border-2 border-[#CCFF00] shrink-0">
            <Sprout size={40} className="text-[#CCFF00] animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">A Farmer's Inventory</h1>
            
            {/* Location Select and Weather details */}
            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-white/40 text-xs font-semibold uppercase">Location:</span>
                <select 
                  value={userLocation} 
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="bg-white/5 border border-white/10 hover:border-[#CCFF00]/40 rounded-full px-3 py-1 text-xs text-white focus:outline-none focus:border-[#CCFF00] transition-colors font-semibold font-sans"
                >
                  <option value="Dhaka" className="bg-carbon text-white">Dhaka</option>
                  <option value="Rajshahi" className="bg-carbon text-white">Rajshahi</option>
                  <option value="Sylhet" className="bg-carbon text-white">Sylhet</option>
                  <option value="Chittagong" className="bg-carbon text-white">Chittagong</option>
                  <option value="Khulna" className="bg-carbon text-white">Khulna</option>
                  <option value="Barisal" className="bg-carbon text-white">Barisal</option>
                  <option value="Rangpur" className="bg-carbon text-white">Rangpur</option>
                </select>
              </div>

              {weatherLoading ? (
                <div className="flex items-center space-x-1.5 text-white/50 text-xs animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
                  <span>Fetching live weather...</span>
                </div>
              ) : weatherData ? (
                <div className="flex items-center space-x-2.5 bg-white/5 border border-white/5 px-3 py-1 rounded-full text-xs text-white/90">
                  {weatherData.icon && (
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} 
                      alt={weatherData.description}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span className="font-extrabold text-[#CCFF00]">{weatherData.temp}°C</span>
                  <span className="text-white/40">|</span>
                  <span className="capitalize">{weatherData.description}</span>
                  <span className="text-white/40">|</span>
                  <span className="text-[10px] text-[#CCFF00]/80 font-bold bg-[#CCFF00]/5 px-2 py-0.5 rounded-full">
                    {weatherData.source}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex space-x-4 relative z-10 mt-4 md:mt-0">
          <button onClick={exportCSV} className="px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold border border-white/15 hover:border-[#CCFF00]/30 hover:bg-white/5 transition-all text-white">
            <Download size={16} className="text-[#CCFF00]" /> <span>Export CSV</span>
          </button>
          <button onClick={exportData} className="px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold border border-white/15 hover:border-[#CCFF00]/30 hover:bg-white/5 transition-all text-white">
            <Download size={16} className="text-[#CCFF00]" /> <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Gamification / Badges */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center tracking-tight"><Award className="mr-2 text-[#CCFF00]" /> Achievements</h2>
        {badges.length === 0 ? (
          <p className="text-white/50 bg-white/5 border border-white/5 p-4 rounded-2xl text-sm">No badges earned yet. Register your first crop batch!</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-full flex items-center text-sm font-extrabold shadow-sm">
                <Award size={16} className="mr-2" />
                {badge}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Batches Inventory */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-white flex items-center tracking-tight"><List className="mr-2 text-[#CCFF00]" /> Crop Inventory</h2>
          <button 
            onClick={isInline && onAddBatchClick ? onAddBatchClick : () => navigate('/harvestguard/register-batch')} 
            className="bg-[#CCFF00] text-black px-6 py-2.5 rounded-xl font-extrabold flex items-center space-x-2 hover:bg-[#bce500] hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all shadow-md"
          >
            <Plus size={18} /> <span>Add Batch</span>
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <Sprout size={48} className="mx-auto text-white/20 mb-4 animate-pulse" />
            <p className="text-white/60 text-lg max-w-md mx-auto">Your inventory is empty. Log your first harvest to start protecting your yield.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map(batch => (
              <div key={batch.id} className="bg-white/5 border border-white/10 p-6 rounded-[24px] relative overflow-hidden group hover:border-[#CCFF00]/40 hover:bg-white/10 transition-all duration-300 shadow-md">
                <div className={`absolute top-0 right-0 w-2.5 h-full ${batch.status === 'active' ? 'bg-[#CCFF00]' : 'bg-white/20'} transition-colors`} />
                <h3 className="text-xl font-extrabold text-white capitalize mb-1 tracking-tight">{batch.cropType}</h3>
                <p className="text-[#CCFF00] font-extrabold text-lg mb-4">{batch.weight} kg</p>
                
                <div className="space-y-2.5 text-sm text-white/70">
                  <p><span className="text-white/40 font-medium">Location:</span> {batch.district}</p>
                  <p><span className="text-white/40 font-medium">Harvest Date:</span> {batch.date}</p>
                  <p><span className="text-white/40 font-medium">Storage:</span> <span className="capitalize">{batch.storageType.replace('_', ' ')}</span></p>
                </div>
                
                <button 
                  onClick={isInline && onViewRiskClick ? () => onViewRiskClick(batch.id) : () => navigate(`/harvestguard/risk-analysis/${batch.id}`)} 
                  className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold border border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00] transition-all"
                >
                  View Weather Risk
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isInline) {
    return <div className="w-full">{dashboardContent}</div>;
  }

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-16 px-4 lg:px-12">
      {dashboardContent}
    </div>
  );
};

export default HarvestGuardDashboard;
