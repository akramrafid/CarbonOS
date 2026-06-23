import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { fetchMockWeather } from '../../lib/mockWeatherAPI';
import { calculateETCL, getBanglaAdvisory } from '../../lib/etclPredictor';
import { CloudRain, ThermometerSun, Droplets, AlertTriangle, ArrowLeft } from 'lucide-react';

const WeatherRiskWidget = ({ isInline = false, onBack = null, inlineBatchId = null }) => {
  const { batchId: paramBatchId } = useParams();
  const navigate = useNavigate();
  const { batches } = useHarvestStore();
  
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const batchId = isInline ? inlineBatchId : paramBatchId;
  const batch = batches.find(b => b.id === batchId);

  useEffect(() => {
    if (batch) {
      setLoading(true);
      fetchMockWeather(batch.district).then(data => {
        setWeather(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [batch]);

  if (!batch) {
    return <div className="text-white text-center mt-20">Batch not found.</div>;
  }

  if (loading || !weather) {
    return (
      <div className={`flex items-center justify-center text-emerald animate-pulse ${isInline ? 'py-20' : 'min-h-screen pt-24 pb-16'}`}>
        Fetching hyper-local weather...
      </div>
    );
  }

  // Calculate ETCL based on today's weather and batch storage type
  const today = weather[0];
  const { etclHours, riskLevel, riskName } = calculateETCL(today.temperature, today.humidity, batch.storageType);
  const advisory = getBanglaAdvisory(riskLevel, today.rainProbability, batch.storageType);

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]';
    if (level === 'Medium') return 'text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.05)]';
    return 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/20 shadow-[0_0_15px_rgba(204,255,0,0.05)]';
  };

  const widgetContent = (
    <div className="max-w-4xl mx-auto w-full">
      {!isInline && (
        <button onClick={() => navigate('/harvestguard/dashboard')} className="flex items-center text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
      )}
      {isInline && onBack && (
        <button onClick={onBack} className="flex items-center text-white/50 hover:text-white mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
      )}

      <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Risk Analysis: {batch.cropType}</h1>

      {/* Prediction Engine Output (A4) */}
      <div className={`border p-6 rounded-[28px] mb-8 ${getRiskColor(riskLevel)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold capitalize mb-1 tracking-tight">{riskLevel} Risk of {riskName}</h2>
            <p className="opacity-80 text-sm">Estimated Time to Critical Loss (ETCL): <span className="font-bold">{etclHours} hours</span></p>
          </div>
          <AlertTriangle size={32} className={riskLevel === 'High' ? 'animate-pulse' : ''} />
        </div>
        
        <div className="bg-black/40 p-5 rounded-2xl mt-6 border border-white/5">
          <h3 className="text-xs font-bold opacity-75 uppercase tracking-wider mb-2">কৃষকের জন্য পরামর্শ (Advisory)</h3>
          <p className="text-lg font-bold leading-relaxed">{advisory}</p>
        </div>
      </div>

      {/* 5-Day Hyper Local Weather (A3) */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 blur-3xl rounded-full pointer-events-none" />
        <h2 className="text-xl font-extrabold text-white mb-6 tracking-tight relative z-10">৫ দিনের পূর্বাভাস - {batch.district}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {weather.map((day, idx) => (
            <div key={idx} className={`bg-white/5 border border-white/10 rounded-2xl p-4 text-center transition-all duration-300 hover:border-[#CCFF00]/40 ${idx === 0 ? 'ring-2 ring-[#CCFF00]' : ''}`}>
              <div className={`font-bold mb-1 ${idx === 0 ? 'text-[#CCFF00]' : 'text-emerald'}`}>{idx === 0 ? 'আজ' : day.dayNameBn}</div>
              <div className="text-white/40 text-xs mb-4">{day.date}</div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center text-white font-bold">
                  <ThermometerSun size={16} className="text-yellow-500 mr-1.5" />
                  {day.temperature}°C
                </div>
                <div className="flex items-center justify-center text-white/80 text-sm">
                  <Droplets size={16} className="text-blue-400 mr-1.5" />
                  {day.humidity}%
                </div>
                <div className="flex items-center justify-center text-white/80 text-sm">
                  <CloudRain size={16} className="text-blue-300 mr-1.5" />
                  {day.rainProbability}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="w-full">{widgetContent}</div>;
  }

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-16 px-4 lg:px-12">
      {widgetContent}
    </div>
  );
};

export default WeatherRiskWidget;
