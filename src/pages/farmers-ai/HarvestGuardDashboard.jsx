import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { User, LogIn, Award, List, Download, Plus, ArrowLeft, Sprout } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { JoinHarvestGuardCard } from './components/JoinHarvestGuardCard';

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
      const djangoApiUrl = import.meta.env.VITE_DJANGO_API_URL || '';
      if (djangoApiUrl) {
        try {
          const res = await fetch(`${djangoApiUrl}/api/farmers-ai/weather/current/?location=${encodeURIComponent(userLocation)}`);
          if (!res.ok) throw new Error('Backend weather proxy failed');
          const data = await res.json();
          if (isMounted) {
            setWeatherData({
              temp: Math.round(data.temp),
              humidity: data.humidity,
              description: data.description,
              icon: data.icon,
              wind: data.wind,
              source: data.source || 'Regional Telemetry',
            });
            setWeatherLoading(false);
            return;
          }
        } catch {
          // Fall through to calibrated regional weather baseline
        }
      }
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
          source: 'Regional Baseline (Demo data)'
        });
        setWeatherLoading(false);
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
      <JoinHarvestGuardCard
        isInline={isInline}
        onBack={onBack}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        password={password}
        setPassword={setPassword}
        lang={lang}
        setLang={setLang}
        handleRegister={handleRegister}
      />
    );
  }

  const dashboardContent = (
    <div className="max-w-5xl mx-auto w-full">
      {!isInline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/farmers-ai')}
          leftIcon={<ArrowLeft size={20} />}
          className="text-fg-secondary hover:text-fg-primary mb-8"
        >
          Back to Landing
        </Button>
      )}
      {isInline && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft size={20} />}
          className="text-fg-secondary hover:text-fg-primary mb-8 font-semibold"
        >
          Back to Landing
        </Button>
      )}

      <div className="mb-6">
        {!isInline ? (
          <PageHeader
            title="A Farmer's Inventory"
            description="Track harvest batches, local climate risk, and verified eco-credentials."
            badge={<Badge variant="emerald">FARMER PORTAL</Badge>}
          />
        ) : (
          <div>
            <Badge variant="emerald" className="mb-2">FARMER PORTAL</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-fg-primary tracking-tight">A Farmer's Inventory</h2>
            <p className="text-sm text-fg-secondary mt-1">Track harvest batches, local climate risk, and verified eco-credentials.</p>
          </div>
        )}
      </div>

        <div className="bg-bg-surface backdrop-blur-md border border-border-subtle p-6 md:p-8 rounded-[28px] mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10 w-full md:w-auto text-center md:text-left">
              <div className="w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center border-2 border-accent shrink-0">
                <Sprout size={40} className="text-emerald-700 dark:text-lime-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-fg-primary tracking-tight">Registered Farm Profile</h2>

                {/* Location Select and Weather details */}
                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-fg-muted text-xs font-semibold uppercase">Location:</span>
                    <select
                      value={userLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="bg-bg-elevated border border-border-subtle hover:border-accent rounded-full px-3 py-1 text-xs text-fg-primary focus:outline-none focus:border-accent transition-colors font-semibold font-sans"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Rangpur">Rangpur</option>
                    </select>
                  </div>

                  {weatherLoading ? (
                      <div className="flex items-center space-x-1.5 text-fg-secondary text-xs animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        <span>Fetching live weather...</span>
                      </div>
                      ) : weatherData ? (
                        <div className="flex items-center space-x-2.5 bg-bg-elevated border border-border-subtle px-3 py-1 rounded-full text-xs text-fg-primary">
                          {weatherData.icon && (
                            <img
                              src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
                              alt={weatherData.description}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span className="font-extrabold text-emerald-700 dark:text-lime-400">{weatherData.temp}°C</span>
                          <span className="text-fg-muted">|</span>
                          <span className="capitalize">{weatherData.description}</span>
                            <span className="text-fg-muted">|</span>
                            <span className="text-[10px] text-emerald-700 dark:text-lime-400 font-bold bg-accent/10 px-2 py-0.5 rounded-full">
                              {weatherData.source}
                            </span>
                        </div>
              ) : null}
                      </div>
                    </div>
        </div>
                <div className="flex space-x-4 relative z-10 mt-4 md:mt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={exportCSV}
                    leftIcon={<Download size={16} className="text-lime-400" />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={exportData}
                    leftIcon={<Download size={16} className="text-lime-400" />}
                  >
                    Backup JSON
                  </Button>
                </div>
              </div>

              {/* Gamification / Badges */}
              <div className="mb-12">
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center tracking-tight"><Award className="mr-2 text-lime-400" /> Achievements</h2>
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
                  <h2 className="text-2xl font-extrabold text-white flex items-center tracking-tight"><List className="mr-2 text-lime-400" /> Crop Inventory</h2>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={isInline && onAddBatchClick ? onAddBatchClick : () => navigate('/harvestguard/register-batch')}
                    leftIcon={<Plus size={18} />}
                  >
                    Add Batch
                  </Button>
                </div>

                {batches.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
                    <Sprout size={48} className="mx-auto text-white/20 mb-4 animate-pulse" />
                    <p className="text-white/60 text-lg max-w-md mx-auto">Your inventory is empty. Log your first harvest to start protecting your yield.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {batches.map(batch => (
                      <div key={batch.id} className="bg-white/5 border border-white/10 p-6 rounded-[24px] relative overflow-hidden group hover:border-lime-400/40 hover:bg-white/10 transition-all duration-300 shadow-md">
                        <div className={`absolute top-0 right-0 w-2.5 h-full ${batch.status === 'active' ? 'bg-lime-400' : 'bg-white/20'} transition-colors`} />
                        <h3 className="text-xl font-extrabold text-white capitalize mb-1 tracking-tight">{batch.cropType}</h3>
                        <p className="text-lime-400 font-extrabold text-lg mb-4">{batch.weight} kg</p>

                        <div className="space-y-2.5 text-sm text-white/70">
                          <p><span className="text-white/40 font-medium">Location:</span> {batch.district}</p>
                          <p><span className="text-white/40 font-medium">Harvest Date:</span> {batch.date}</p>
                          <p><span className="text-white/40 font-medium">Storage:</span> <span className="capitalize">{batch.storageType.replace('_', ' ')}</span></p>
                        </div>

                        <Button
                          variant="secondary"
                          size="md"
                          onClick={isInline && onViewRiskClick ? () => onViewRiskClick(batch.id) : () => navigate(`/harvestguard/risk-analysis/${batch.id}`)}
                          className="mt-6 w-full"
                        >
                          View Weather Risk
                        </Button>
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
              <div className="w-full max-w-[1600px] mx-auto">
                {dashboardContent}
              </div>
              );
};

              export default HarvestGuardDashboard;
