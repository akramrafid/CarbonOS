import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, AlertTriangle, AlertCircle,
  ThermometerSun, WifiOff, Volume2, VolumeX,
  Leaf, FlaskConical, ShieldCheck, ClipboardList,
  Zap, TriangleAlert
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Tabs } from '../../components/ui/Tabs';
import { TREATMENT_DB, URGENCY_CONFIG } from './treatmentDb';

const DiagnosisResult = ({ isInline = false, onBack = null, inlineResult = null, inlineImageBlob = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { result: routeResult, imageBlob: routeImageBlob } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('immediate');
  const [gradCamOpacity, setGradCamOpacity] = useState(60);

  const result = isInline ? inlineResult : routeResult;
  const imageBlob = isInline ? inlineImageBlob : routeImageBlob;

  if (!result) {
    return (
      <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 max-w-lg mx-auto text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">No result found</h2>
        <Button variant="link" onClick={() => navigate('/farmers-ai/camera')}>
          Go back to camera
        </Button>
      </div>
    );
  }

  const { species, disease, confidence, severity, needs_agronomist_review, heatmap_url, weather_risk, isOffline } = result;

  const isTierA = ['rice', 'potato', 'tomato', 'maize'].includes(species?.toLowerCase());
  const isTierB = ['mango', 'jackfruit', 'guava', 'citrus'].includes(species?.toLowerCase());
  const isHealthy = disease === 'healthy' || disease?.includes('Healthy');
  const pct = Math.round((confidence || 0) * 100);

  // Lookup treatment — fallback to generic if not in DB
  const treatment = TREATMENT_DB[disease] || {
    name: disease?.replace(/_/g, ' '),
    nameBn: '',
    urgency: severity === 'severe' ? 'critical' : severity === 'moderate' ? 'high' : 'medium',
    immediate: ['Remove visibly infected plant parts and dispose away from the field'],
    organic: [
      'Apply Bordeaux mixture (0.5%) as a broad-spectrum protective spray',
      'Spray neem oil (5ml/litre) every 7 days'
    ],
    chemical: [
      'Apply Mancozeb 80 WP @ 25g per 10 litres as a contact fungicide',
      'For systemic protection: Carbendazim 50 WP @ 10g per 10 litres',
      'Consult your nearest Department of Agricultural Extension (DAE) office for crop-specific guidance'
    ],
    prevention: [
      'Maintain good field hygiene — remove crop debris regularly',
      'Use certified disease-free planting material',
      'Maintain balanced soil nutrition; avoid excess nitrogen'
    ]
  };

  const urgency = URGENCY_CONFIG[treatment.urgency] || URGENCY_CONFIG.medium;

  const TABS = [
    { id: 'immediate', label: 'Immediate Steps', icon: <Zap size={13} />, items: treatment.immediate },
    { id: 'organic', label: 'Organic Treatment', icon: <Leaf size={13} />, items: treatment.organic },
    { id: 'chemical', label: 'Chemical Treatment', icon: <FlaskConical size={13} />, items: treatment.chemical },
    { id: 'prevention', label: 'Prevention', icon: <ShieldCheck size={13} />, items: treatment.prevention }
  ].filter(t => t.items && t.items.length > 0);

  const playBanglaVoice = (text) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      // Match utterance language to script instead of forcing bn-BD on English text
      utterance.lang = /[\u0980-\u09FF]/.test(text) ? 'bn-BD' : 'en-US';
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const voiceText = `${treatment.name} detected in your ${species} crop. ${(treatment.immediate || []).join('. ')} ${(treatment.organic || []).join('. ')}`;

  const mainResultContent = (
    <div className="max-w-lg mx-auto w-full flex flex-col space-y-5">
      {/* Back Button */}
      {!isInline ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/farmers-ai/camera')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="self-start text-white/50 hover:text-white font-semibold"
        >
          Back to Camera
        </Button>
      ) : (
        onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="self-start text-white/50 hover:text-white font-semibold"
          >
            Back to Scanner
          </Button>
        )
      )}

      {/* Page Header (suppress second <h1> when embedded inline on FarmersAILanding) */}
      {!isInline ? (
        <PageHeader
          title="Diagnosis Result"
          badge={isOffline ? <Badge variant="warning"><WifiOff className="w-3 h-3 mr-1 inline" /> Offline</Badge> : undefined}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h2 className="text-2xl font-bold text-fg-primary tracking-tight">Diagnosis Result</h2>
          {isOffline && <Badge variant="warning"><WifiOff className="w-3 h-3 mr-1 inline" /> Offline</Badge>}
        </div>
      )}

      {/* Crop Image + Grad-CAM Opacity Comparison */}
      <div className="space-y-2.5">
        <div className="relative rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video bg-black">
          <img src={imageBlob} alt="Crop" className="absolute inset-0 w-full h-full object-cover" />
          {heatmap_url ? (
            <img
              src={heatmap_url}
              alt="Grad-CAM Heatmap"
              style={{ opacity: gradCamOpacity / 100 }}
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-150"
            />
          ) : (
            !isHealthy && (
              <>
                <div
                  style={{ opacity: gradCamOpacity / 100 }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.45)_0%,transparent_60%)] mix-blend-screen pointer-events-none transition-opacity duration-150"
                />
                <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-black/75 border border-white/10 text-[10px] font-mono text-white/75 pointer-events-none">
                  Illustrative offline overlay — connect server for Grad-CAM map
                </span>
              </>
            )
          )}
          {/* Species badge */}
          <div className="absolute top-4 left-4 bg-black/75 backdrop-blur px-3.5 py-1 rounded-full text-xs font-bold text-white capitalize border border-white/10">
            {species}
          </div>
          {/* Urgency badge */}
          {!isHealthy && (
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 ${urgency.bg} border ${urgency.border} backdrop-blur px-3 py-1 rounded-full`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
              <span className={`text-[11px] font-bold ${urgency.color}`}>{urgency.label}</span>
            </div>
          )}
        </div>

        {/* Phase 7: Grad-CAM Original-to-Heatmap Slider & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGradCamOpacity(0)}
              className="text-[11px] font-mono h-8 px-2.5"
            >
              Original
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGradCamOpacity(60)}
              className="text-[11px] font-mono h-8 px-2.5"
            >
              Blend (60%)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGradCamOpacity(100)}
              className="text-[11px] font-mono h-8 px-2.5"
            >
              Grad-CAM
            </Button>
          </div>
            <label className="flex items-center gap-2 flex-1 min-w-[160px] font-mono text-[11px] text-fg-secondary">
              <span>Heatmap:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={gradCamOpacity}
                aria-label="Crop Grad-CAM heatmap opacity"
                onChange={(e) => setGradCamOpacity(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400 w-9 text-right">{gradCamOpacity}%</span>
            </label>
        </div>
      </div>

        <div className="fade-in-up bg-bg-surface border border-border-subtle rounded-[24px] p-5 relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
                <p className="text-fg-secondary text-xs font-semibold uppercase tracking-wider mb-1">Detected Condition</p>
                <h2 className="text-2xl font-extrabold text-fg-primary capitalize tracking-tight leading-tight">
                  {treatment.name || disease?.replace(/_/g, ' ')}
                </h2>
                {treatment.nameBn && (
              <p className="text-emerald-700 dark:text-lime-400 text-sm font-semibold mt-0.5">{treatment.nameBn}</p>
                )}
            </div>
            <div className={`ml-4 px-3 py-1.5 rounded-xl ${urgency.bg} border ${urgency.border} text-center`}>
              {isHealthy
                ? <CheckCircle className={`w-6 h-6 mx-auto ${urgency.color}`} />
                : treatment.urgency === 'critical'
                  ? <TriangleAlert className={`w-6 h-6 mx-auto ${urgency.color}`} />
                  : <AlertTriangle className={`w-6 h-6 mx-auto ${urgency.color}`} />
              }
              <span className={`text-[10px] mt-1 font-bold uppercase block ${urgency.color}`}>{severity || 'mild'}</span>
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="mt-4 relative z-10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-fg-secondary text-xs font-medium">Diagnostic Confidence</span>
              <span className={`text-sm font-extrabold ${pct >= 75 ? 'text-emerald-700 dark:text-lime-400' : pct >= 50 ? 'text-amber-700 dark:text-yellow-400' : 'text-orange-700 dark:text-orange-400'}`}>{pct}%</span>
            </div>
              <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bar-fill ${pct >= 75 ? 'bg-gradient-to-r from-lime-400 to-lime-500' : pct >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`}
                  style={{ '--target-width': `${pct}%`, width: `${pct}%` }}
                />
              </div>
                <p className="text-fg-muted text-[10px] mt-1.5">
                  {pct >= 80 ? 'High confidence — proceed with treatment plan below'
                    : pct >= 60 ? 'Moderate confidence — treatment is recommended; monitor response'
                      : 'Lower confidence — specialist field verification is advised before chemical application'}
                </p>
            </div>

            {/* Alert Banners */}
            {needs_agronomist_review && (
                <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-xl relative z-10">
                  <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                      <p className="text-amber-800 dark:text-amber-300 text-sm font-bold">Specialist Field Verification Recommended</p>
                      <p className="text-amber-800/80 dark:text-amber-200/80 text-xs mt-0.5 leading-relaxed">
                        Due to the visual complexity of this case, a field visit by your local DAE agronomist is advised before heavy chemical treatment. The general treatment guidance below is still applicable.
                      </p>
                  </div>
                </div>
        )}

                {isTierA && !isHealthy && (
                    <div className="mt-3 flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 px-4 py-2.5 rounded-xl relative z-10">
                      <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      <p className="text-blue-800 dark:text-blue-300 text-xs font-semibold">Priority crop: early treatment protects your seasonal yield.</p>
                    </div>
        )}

                    {isTierB && !isHealthy && (severity === 'moderate' || severity === 'severe') && (
          <div className="mt-3 flex items-start gap-2 bg-purple-500/10 border border-purple-500/25 px-4 py-2.5 rounded-xl relative z-10">
            <AlertTriangle className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="text-purple-800 dark:text-purple-300 text-xs font-semibold">Carbon Asset Risk: This perennial tree is a registered carbon asset — timely treatment protects long-term carbon stock value.</p>
          </div>
        )}
      </div>

      <div className="fade-in-up bg-bg-surface border border-border-subtle rounded-[24px] p-5 relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ClipboardList className="w-5 h-5 text-emerald-700 dark:text-lime-400" size={16} />
              <h3 className="text-lg font-extrabold text-emerald-700 dark:text-lime-400 tracking-tight">Treatment Plan / চিকিৎসা পরিকল্পনা</h3>
            </div>
            <p className="text-fg-muted text-[11px] ml-6">Follow these steps in order for best results</p>
          </div>
          <IconButton
            icon={isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
            aria-label="Play voice instructions"
            onClick={() => playBanglaVoice(voiceText)}
            className="text-emerald-700 dark:text-lime-400"
          />
        </div>

        {/* Tab Selector */}
        <div className="mb-5 overflow-x-auto pb-1 relative z-10">
          <Tabs
            tabs={TABS.map(t => ({
              id: t.id,
              label: t.label,
              icon: t.icon
            }))}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="sm"
          />
        </div>

        {/* Tab Content */}
        <div className="relative z-10 space-y-3">
          {(TABS.find(t => t.id === activeTab)?.items || []).map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-bg-elevated/60 border border-border-subtle rounded-2xl p-3.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 ${
                activeTab === 'immediate' ? 'bg-red-500/15 text-red-700 dark:text-red-400' :
                activeTab === 'organic' ? 'bg-emerald-500/15 text-emerald-700 dark:text-lime-400' :
                activeTab === 'chemical' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' :
                'bg-purple-500/15 text-purple-700 dark:text-purple-400'
              }`}>
                {idx + 1}
              </div>
              <p className="text-fg-primary text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        {/* DAE Disclaimer */}
        <div className="mt-5 flex items-start gap-2.5 bg-bg-elevated/60 border border-border-subtle rounded-xl p-3.5 relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-lime-400 shrink-0 mt-0.5" />
          <p className="text-fg-muted text-[11px] leading-relaxed">
            For chemical applications, always follow label instructions and consult your nearest{' '}
            <span className="text-emerald-700 dark:text-lime-400 font-semibold">Department of Agricultural Extension (DAE)</span>{' '}
            office. Doses may vary by crop variety and regional conditions.
          </p>
        </div>
      </div>

      {/* Weather Risk */}
      {weather_risk && (
        <div className="fade-in-up bg-blue-500/10 border border-blue-500/25 p-4 rounded-2xl flex items-start gap-3" style={{ animationDelay: '0.2s' }}>
          <ThermometerSun className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Weather Risk / আবহাওয়া সতর্কতা</h3>
            <p className="text-blue-800/80 dark:text-blue-200/80 text-sm leading-relaxed">{weather_risk.summary_bn}</p>
            {weather_risk.risk_index && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min(100, weather_risk.risk_index * 10)}%` }} />
                </div>
                <span className="text-blue-800 dark:text-blue-300 text-xs font-bold">{weather_risk.risk_index}/10</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return <div className="w-full py-4">{mainResultContent}</div>;
  }

  return (
    <div className="max-w-lg mx-auto w-full flex flex-col space-y-5">
      {mainResultContent}
    </div>
  );
};

export default DiagnosisResult;
