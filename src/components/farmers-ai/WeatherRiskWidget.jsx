import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { fetchMockWeather } from '../../lib/mockWeatherAPI';
import { calculateETCL, getBanglaAdvisory } from '../../lib/etclPredictor';
import { CloudRain, ThermometerSun, Droplets, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

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
    return <div className="text-fg-primary text-center mt-12">Batch not found.</div>;
  }

  if (loading || !weather) {
    return (
        <div className={`flex items-center justify-center text-accent animate-pulse ${isInline ? 'py-10 md:py-16' : 'py-12'}`}>
          Fetching hyper-local weather...
        </div>
        );
  }

        // Calculate ETCL based on today's weather and batch storage type
        const today = weather[0];
        const {etclHours, riskLevel, riskName} = calculateETCL(today.temperature, today.humidity, batch.storageType);
        const advisory = getBanglaAdvisory(riskLevel, today.rainProbability, batch.storageType);

  const getRiskColor = (level) => {
        if (level === 'High') return 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.05)]';
        if (level === 'Medium') return 'text-amber-800 dark:text-orange-400 bg-orange-500/10 border-orange-500/25 shadow-[0_0_15px_rgba(251,146,60,0.05)]';
        return 'text-emerald-700 dark:text-lime-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_15px_rgba(0,200,83,0.05)]';
  };

        const widgetContent = (
        <div className="max-w-4xl mx-auto w-full">
          {!isInline && (
        <Button variant="ghost" size="sm" onClick={() => navigate('/harvestguard/dashboard')} leftIcon={<ArrowLeft size={16} />} className="mb-6">
          Back to Dashboard
        </Button>
          )}
          {isInline && onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={16} />} className="mb-6">
          Back to Dashboard
        </Button>
          )}

          {isInline ? (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-fg-primary mb-6 tracking-tight">Risk Analysis: {batch.cropType}</h2>
          ) : (
            <h1 className="text-3xl font-extrabold text-fg-primary mb-6 tracking-tight">Risk Analysis: {batch.cropType}</h1>
          )}

          {/* Prediction Engine Output (A4) */}
          <div className={`border p-6 rounded-[28px] mb-8 ${getRiskColor(riskLevel)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold capitalize mb-1 tracking-tight">{riskLevel} Risk of {riskName}</h2>
                <p className="opacity-85 text-sm">Estimated Time to Critical Loss (ETCL): <span className="font-bold">{etclHours} hours</span></p>
              </div>
              <AlertTriangle size={32} className={riskLevel === 'High' ? 'animate-pulse' : ''} />
            </div>

              <div className="bg-bg-elevated/80 p-5 rounded-2xl mt-6 border border-border-subtle text-fg-primary">
                <h3 className="text-xs font-bold text-fg-secondary uppercase tracking-wider mb-2">কৃষকের জন্য পরামর্শ (Advisory)</h3>
                <p className="text-lg font-bold leading-relaxed">{advisory}</p>
              </div>
            </div>

              <div className="bg-bg-surface backdrop-blur-md border border-border-subtle p-6 md:p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
                <h2 className="text-xl font-extrabold text-fg-primary mb-6 tracking-tight relative z-10">৫ দিনের পূর্বাভাস - {batch.district} (Demo data)</h2>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {weather.map((day, idx) => (
                      <div key={idx} className={`bg-bg-elevated/60 border border-border-subtle rounded-2xl p-4 text-center transition-all duration-300 hover:border-accent/50 ${idx === 0 ? 'ring-2 ring-accent' : ''}`}>
                        <div className={`font-bold mb-1 ${idx === 0 ? 'text-emerald-700 dark:text-lime-400' : 'text-accent'}`}>{idx === 0 ? 'আজ' : day.dayNameBn}</div>
                        <div className="text-fg-muted text-xs mb-4">{day.date}</div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-center text-fg-primary font-bold">
                              <ThermometerSun size={16} className="text-amber-600 dark:text-yellow-500 mr-1.5" />
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
                  <div className="w-full max-w-4xl mx-auto">
                    {widgetContent}
                  </div>
                  );
};

                  export default WeatherRiskWidget;
