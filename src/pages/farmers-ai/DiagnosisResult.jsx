import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, ThermometerSun, WifiOff, Volume2, VolumeX } from 'lucide-react';

const DiagnosisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageBlob } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);

  if (!result) {
    return (
      <div className="pt-24 pb-16 px-4 max-w-lg mx-auto text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">No result found</h2>
        <button onClick={() => navigate('/farmers-ai')} className="text-emerald hover:underline">
          Go back to camera
        </button>
      </div>
    );
  }

  const { species, disease, confidence, severity, needs_agronomist_review, heatmap_url, weather_risk, isOffline } = result;

  const getSeverityColor = (sev) => {
    switch(sev) {
      case 'none': return 'text-emerald';
      case 'mild': return 'text-yellow-400';
      case 'moderate': return 'text-orange-500';
      case 'severe': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (sev) => {
    switch(sev) {
      case 'none': return <CheckCircle className={`w-6 h-6 ${getSeverityColor(sev)}`} />;
      case 'mild': return <AlertCircle className={`w-6 h-6 ${getSeverityColor(sev)}`} />;
      case 'moderate': return <AlertTriangle className={`w-6 h-6 ${getSeverityColor(sev)}`} />;
      case 'severe': return <AlertTriangle className={`w-6 h-6 ${getSeverityColor(sev)}`} />;
      default: return <AlertCircle className={`w-6 h-6 ${getSeverityColor(sev)}`} />;
    }
  };

  const isTierA = ['rice', 'potato', 'tomato', 'maize'].includes(species.toLowerCase());
  const isTierB = ['mango', 'jackfruit', 'guava', 'citrus'].includes(species.toLowerCase());

  // Expanded Bangla treatment dictionary
  const getTreatmentPlan = (disease, isLowConfidence) => {
    if (isLowConfidence) {
        return {
            text: "সতর্কতা: এআই মডেল রোগের বিষয়ে শতভাগ নিশ্চিত নয়। ভুল রাসায়নিক প্রয়োগ ক্ষতিকর হতে পারে। অনুগ্রহ করে কৃষি কর্মকর্তার পর্যালোচনার জন্য অপেক্ষা করুন।",
            voice_url: null
        };
    }
    
    const disclaimer = "রাসায়নিক ঔষধ প্রয়োগের আগে অবশ্যই নিকটস্থ কৃষি সম্প্রসারণ অধিদপ্তরে (DAE) যোগাযোগ করুন।";
    
    if (disease === 'healthy') {
        return { text: "ফসল সুস্থ আছে। বর্তমান যত্ন চালিয়ে যান।", voice_url: null };
    }
    if (disease === 'blast' || disease === 'bacterial_blight') {
        return { 
            text: `জৈব চিকিৎসা: আক্রান্ত জমির পানি বের করে দিন। নাইট্রোজেন সার প্রয়োগ বন্ধ রাখুন।\n\nরাসায়নিক চিকিৎসা: ট্রাইসাইক্লাজোল (Tricyclazole) ৭৫ ডব্লিউপি প্রতি ১০ লিটার পানিতে ৮ গ্রাম মিশিয়ে স্প্রে করুন।\n\nসতর্কতা: ${disclaimer}`, 
            voice_url: null 
        };
    }
    if (disease === 'brown_spot' || disease === 'black_spot') {
        return { 
            text: `জৈব চিকিৎসা: বীজ শোধন করে রোপণ করুন। সুষম মাত্রায় পটাশ সার ব্যবহার করুন।\n\nরাসায়নিক চিকিৎসা: কার্বেন্ডাজিম (Carbendazim) ৫০ ডব্লিউপি প্রতি ১০ লিটার পানিতে ১০ গ্রাম মিশিয়ে স্প্রে করুন।\n\nসতর্কতা: ${disclaimer}`, 
            voice_url: null 
        };
    }
    
    // Default fallback
    return { 
        text: `জৈব চিকিৎসা: আক্রান্ত পাতা বা ডাল কেটে পুড়িয়ে ফেলুন বা মাটিতে পুঁতে রাখুন।\n\nরাসায়নিক চিকিৎসা: উপযুক্ত ছত্রাকনাশক বা কীটনাশক স্প্রে করুন।\n\nসতর্কতা: ${disclaimer}`, 
        voice_url: null 
    };
  };

  const treatment = getTreatmentPlan(disease, needs_agronomist_review);

  const playBanglaVoice = (text) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD'; // Bangla (Bangladesh)
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-lg mx-auto min-h-screen flex flex-col space-y-6">
      <button 
        onClick={() => navigate('/farmers-ai')}
        className="flex items-center text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Camera
      </button>

      <h1 className="text-3xl font-bold text-white flex items-center justify-between">
        Diagnosis Result
        {isOffline && <span className="flex items-center text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full"><WifiOff className="w-4 h-4 mr-1" /> Offline</span>}
      </h1>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-square bg-black">
        <img src={imageBlob} alt="Crop" className="absolute inset-0 w-full h-full object-cover" />
        
        {/* Heatmap Overlay */}
        {heatmap_url ? (
            <img src={heatmap_url} alt="Heatmap" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" />
        ) : (
            disease !== 'healthy' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.4)_0%,transparent_60%)] mix-blend-screen pointer-events-none animate-pulse"></div>
            )
        )}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white capitalize">
          {species}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white capitalize">
              {disease.replace('_', ' ')}
            </h2>
            <p className="text-gray-400 mt-1">Confidence: {(confidence * 100).toFixed(1)}%</p>
          </div>
          <div className="flex flex-col items-center">
            {getSeverityIcon(severity)}
            <span className={`text-xs mt-1 font-bold uppercase ${getSeverityColor(severity)}`}>{severity}</span>
          </div>
        </div>

        {needs_agronomist_review && (
          <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-3 rounded-lg mb-4 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <p>Low confidence result. This has been flagged for agronomist review.</p>
          </div>
        )}

        {isTierA && disease !== 'healthy' && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-3 rounded-lg mb-4 text-sm font-medium">
            🛡️ Protect this season's yield: Act quickly to prevent crop loss.
          </div>
        )}

        {isTierB && disease !== 'healthy' && (severity === 'moderate' || severity === 'severe') && (
          <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 p-3 rounded-lg mb-4 text-sm font-bold flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <p>CARBON ASSET RISK: This perennial tree is a registered carbon asset. Treatment is critical to maintain carbon stock.</p>
          </div>
        )}

        <div className="border-t border-gray-800 pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-lg font-semibold text-emerald">Treatment Plan (চিকিৎসা)</h3>
             <button 
                onClick={() => playBanglaVoice(treatment.text)}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-emerald"
                aria-label="Play Bangla Treatment Instructions"
             >
                {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
             </button>
          </div>
          <div className="text-white text-lg leading-relaxed whitespace-pre-wrap">
            {treatment.text}
          </div>
        </div>
      </div>

      {weather_risk && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-start text-blue-300">
          <ThermometerSun className="w-6 h-6 mr-3 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-400 mb-1">Weather Risk</h3>
            <p className="text-sm">{weather_risk.summary_bn}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiagnosisResult;
