import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ShieldAlert, WifiOff, Sprout, ArrowRight, ArrowUpRight, LayoutDashboard, Map as MapIcon, Database, Leaf, ShieldCheck, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import LocalRiskMap from '../../components/farmers-ai/LocalRiskMap';
import CameraCapture from './CameraCapture';
import HarvestGuardDashboard from './HarvestGuardDashboard';
import BatchRegistration from './BatchRegistration';
import WeatherRiskWidget from '../../components/farmers-ai/WeatherRiskWidget';
import DiagnosisResult from './DiagnosisResult';

const cropsData = [
  {
    id: 'rice',
    nameEn: 'Rice',
    nameBn: 'ধান',
    icon: '🌾',
    diseasesEn: ["Bacterial Blight", "Blast", "Brown Spot", "Tungro"],
    diseasesBn: ["ব্যাকটেরিয়াল ব্লাইট (পাতা ধসা)", "ব্লাস্ট রোগ", "ব্রাউন স্পট (বাদামী দাগ)", "টুংরো ভাইরাস"]
  },
  {
    id: 'potato',
    nameEn: 'Potato',
    nameBn: 'আলু',
    icon: '🥔',
    diseasesEn: ["Early Blight", "Late Blight", "Healthy"],
    diseasesBn: ["আর্লি ব্লাইট (আগাম ধসা)", "লেট ব্লাইট (নাভি ধসা)", "সুস্থ আলু"]
  },
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameBn: 'টমেটো',
    icon: '🍅',
    diseasesEn: ["Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold", "Septoria Leaf Spot", "Spider Mites", "Target Spot", "Tomato Mosaic Virus", "Tomato Yellow Leaf Curl", "Healthy"],
    diseasesBn: ["ব্যাকটেরিয়াল স্পট", "আর্লি ব্লাইট (ধসা রোগ)", "লেট ব্লাইট (পাতা পচা)", "লিফ মোল্ড (ছত্রাক)", "সেপ্টোরিয়া লিফ স্পট", "মাকড়সা পোকা (Spider Mites)", "টার্গেট স্পট", "টমেটো মোজাইক ভাইরাস", "হলুদ পাতা কোঁকড়ানো ভাইরাস", "সুস্থ টমেটো"]
  },
  {
    id: 'maize',
    nameEn: 'Maize',
    nameBn: 'ভুট্টা',
    icon: '🌽',
    diseasesEn: ["Cercospora Leaf Spot", "Common Rust", "Northern Leaf Blight", "Healthy"],
    diseasesBn: ["সারকোস্পোরা লিফ স্পট", "কমন রাস্ট (মরিচা)", "নর্দার্ন লিফ ব্লাইট", "সুস্থ ভুট্টা"]
  },
  {
    id: 'mango',
    nameEn: 'Mango',
    nameBn: 'আম',
    icon: '🥭',
    diseasesEn: ["Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back", "Gall Midge", "Powdery Mildew", "Sooty Mould", "Healthy"],
    diseasesBn: ["অ্যানথ্রাকনোজ (দাগ রোগ)", "ব্যাকটেরিয়াল ক্যানকার", "পাতা কাটা উইভিল পোকা", "ডাই ব্যাক (ডাল শুকানো)", "গল মিজ পোকা (Gall Midge)", "পাউডারি মিলডিউ", "ঝুল রোগ (Sooty Mould)", "সুস্থ আম"]
  },
  {
    id: 'jackfruit',
    nameEn: 'Jackfruit',
    nameBn: 'কাঁঠাল',
    icon: '🌳',
    diseasesEn: ["Algal Leaf Spot", "Black Spot", "Healthy"],
    diseasesBn: ["অ্যালগাল লিফ স্পট (শৈবাল দাগ)", "ব্ল্যাক স্পট (কালো দাগ)", "সুস্থ কাঁঠাল"]
  },
  {
    id: 'guava',
    nameEn: 'Guava',
    nameBn: 'পেয়ারা',
    icon: '🍏',
    diseasesEn: ["Canker", "Dot", "Mummification", "Rust", "Healthy"],
    diseasesBn: ["ক্যানকার", "ডট (দাগ রোগ)", "মামিফিকেশন (শুকিয়ে কাঠ হওয়া)", "মরিচা রোগ (Rust)", "সুস্থ পেয়ারা"]
  },
  {
    id: 'citrus',
    nameEn: 'Citrus',
    nameBn: 'লেবু জাতীয়',
    icon: '🍋',
    diseasesEn: ["Citrus Canker", "Nutrient Deficiency", "Multiple Diseases", "Healthy"],
    diseasesBn: ["সাইট্রাস ক্যানকার (ক্ষত রোগ)", "পুষ্টির অভাব (হলুদ পাতা)", "একাধিক রোগ", "সুস্থ লেবু/কমলা"]
  }
];

const FarmersAILanding = () => {
  const [lang, setLang] = useState('en'); // 'en' or 'bn'
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanImage, setScanImage] = useState(null);
  const [dashboardSection, setDashboardSection] = useState('inventory'); // 'inventory', 'add-batch', 'risk-details'
  const [dashboardBatchId, setDashboardBatchId] = useState(null);

  const t = {
    en: {
      problemTitle: "The Invisible Crisis:",
      problemHighlight: "30% Post-Harvest Loss",
      problemDesc: "Every year in Bangladesh, millions of tons of harvested crops rot due to improper storage, sudden weather shifts, and undetected diseases. This threatens food security and devastates farmer livelihoods.",
      solutionTitle: "Enter HarvestGuard",
      solutionDesc: "An AI-powered, offline-first ecosystem that predicts spoilage, guides intervention, and protects your yield before it's lost.",
      workflowData: "Collect Data",
      workflowWarning: "Early Warning",
      workflowAction: "Take Action",
      workflowSaved: "Food Saved",
      ctaCamera: "Launch AI Scanner",
      ctaDashboard: "My HarvestGuard",
      featuresTitle: "The Complete Ecosystem",
      featureOffline: "Offline First",
      featureOfflineDesc: "Works completely without internet. Syncs when you're back online.",
      featureRisk: "Local Risk Map",
      featureRiskDesc: "See community spoilage threats visualized on a regional map.",
      featureWeather: "Hyper-Local Weather",
      featureWeatherDesc: "5-day forecasts with exact, localized crop advisories.",
      readyText: "Ready to protect your crops?",
      startScanning: "Start Scanning",
      cropsTitle: "Supported Crops & AI Diagnostics",
      cropsSubtitle: "Our multi-head deep learning model is custom-trained to identify specific diseases across 8 agricultural products of Bangladesh.",
      selectCropPrompt: "Click on any crop to view supported disease diagnoses",
      diseasesDetected: "diseases detected",
    },
    bn: {
      problemTitle: "অদৃশ্য সংকট:",
      problemHighlight: "৩০% ফসল নষ্ট",
      problemDesc: "প্রতি বছর বাংলাদেশে ভুল সংরক্ষণ, হঠাৎ আবহাওয়া পরিবর্তন এবং অজানা রোগের কারণে লক্ষ লক্ষ টন ফসল নষ্ট হয়। এটি খাদ্য নিরাপত্তা ও কৃষকের জীবিকাকে হুমকির মুখে ফেলে।",
      solutionTitle: "সমাধান: হারভেস্টগার্ড",
      solutionDesc: "একটি এআই-চালিত, অফলাইন-নির্ভর ইকোসিস্টেম যা ফসল নষ্ট হওয়ার আগেই পূর্বাভাস দেয়, প্রয়োজনীয় পদক্ষেপ জানায় এবং আপনার ফলন রক্ষা করে।",
      workflowData: "তথ্য সংগ্রহ",
      workflowWarning: "আগাম সতর্কবার্তা",
      workflowAction: "পদক্ষেপ গ্রহণ",
      workflowSaved: "ফসল রক্ষা",
      ctaCamera: "এআই স্ক্যানার চালু করুন",
      ctaDashboard: "আমার হারভেস্টগার্ড",
      featuresTitle: "সম্পূর্ণ ইকোসিস্টেম",
      featureOffline: "অফলাইন প্রথম",
      featureOfflineDesc: "ইন্টারনেট ছাড়াই সম্পূর্ণ কাজ করে। অনলাইনে গেলে সিঙ্ক হয়।",
      featureRisk: "স্থানীয় ঝুঁকি ম্যাপ",
      featureRiskDesc: "আঞ্চলিক ম্যাপে আপনার আশেপাশের সম্ভাব্য ঝুঁকিগুলো দেখুন।",
      featureWeather: "আবহাওয়ার পূর্বাভাস",
      featureWeatherDesc: "৫ দিনের পূর্বাভাস ও সঠিক কৃষিবান্ধব পরামর্শ।",
      readyText: "আপনার ফসল রক্ষায় প্রস্তুত?",
      startScanning: "স্ক্যানিং শুরু করুন",
      cropsTitle: "সমর্থিত ফসল ও এআই রোগ নির্ণয়",
      cropsSubtitle: "আমাদের মাল্টি-হেড ডিপ লার্নিং মডেলটি বাংলাদেশের ৮টি প্রধান কৃষিজাত পণ্যের রোগ নির্ভুলভাবে শনাক্ত করতে বিশেষভাবে প্রশিক্ষিত।",
      selectCropPrompt: "যেকোনো ফসলে ক্লিক করে তার বিস্তারিত রোগ তালিকা দেখুন",
      diseasesDetected: "টি রোগ শনাক্তকরণযোগ্য",
    }
  };

  const text = t[lang];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const workflowDetails = {
    en: [
      "Log harvest details, crop types, and moisture levels directly into HarvestGuard.",
      "Offline AI models and local weather predictors analyze metrics to forecast rot/mold threats.",
      "Receive personalized, bilingual agricultural advisories to shield your yield from sudden weather shifts.",
      "Safeguard local food security, reduce post-harvest waste, and qualify for carbon credit telemetry."
    ],
    bn: [
      "অ্যাপের মাধ্যমে ফসলের ওজন, আর্দ্রতা এবং প্রকার সরাসরি অ্যাপে এন্ট্রি করে সংরক্ষণ করুন।",
      "অফলাইন এআই মডেল এবং স্থানীয় আবহাওয়া বিশ্লেষণ করে পচন ও পঙ্গপাল আক্রমণ সম্পর্কে আগাম সতর্কবার্তা দেয়।",
      "ফসল নষ্ট হওয়া থেকে রক্ষা করতে আপনার জেলার সঠিক ও সময়োপযোগী বাংলা কৃষি পরামর্শ ও নির্দেশনা পান।",
      "অপচয় রোধ করে বাংলাদেশের খাদ্য নিরাপত্তা বৃদ্ধি করুন এবং প্রিমিয়াম কার্বন ক্রেডিট দাবি করুন।"
    ]
  };

  const workflowSteps = [
    { icon: <Database size={32} />, label: text.workflowData, color: "text-[#CCFF00]", bg: "bg-[#CCFF00]/10", details: workflowDetails[lang][0] },
    { icon: <ShieldAlert size={32} />, label: text.workflowWarning, color: "text-orange-400", bg: "bg-orange-400/10", details: workflowDetails[lang][1] },
    { icon: <Sprout size={32} />, label: text.workflowAction, color: "text-black", bg: "bg-[#CCFF00]", details: workflowDetails[lang][2] },
    { icon: <ShieldCheck size={32} />, label: text.workflowSaved, color: "text-green-400", bg: "bg-green-400/10", details: workflowDetails[lang][3] }
  ];

  return (
    <div className="min-h-screen bg-carbon pt-24 pb-24 px-4 lg:px-12 font-sans selection:bg-emerald selection:text-carbon overflow-hidden">
      {/* Language Toggle */}
      <div className="max-w-7xl mx-auto flex justify-end mb-8 relative z-20">
        <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
          <button 
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${lang === 'en' ? 'bg-emerald text-carbon' : 'text-white/60 hover:text-white'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('bn')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${lang === 'bn' ? 'bg-emerald text-carbon' : 'text-white/60 hover:text-white'}`}
          >
            বাংলা
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* Modern & Bold Hero Section (Inspired by reference image) */}
        <div 
          className="relative rounded-[32px] overflow-hidden mb-20 bg-cover bg-center min-h-[550px] md:min-h-[620px] flex items-center border border-white/10 shadow-3xl"
          style={{ backgroundImage: 'url(/farmers_hero_banner.png)' }}
        >
          {/* Gradients to blend background perfectly */}
          <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-black/35" />
          
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Side: Bold Title & Key problem statement */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-400 font-sans text-xs font-semibold uppercase tracking-wider">{text.problemTitle}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-sans font-extrabold text-white leading-tight tracking-tight">
                {lang === 'en' ? 'Bringing Innovation to' : 'ফসল সুরক্ষায় আনুন'} <br />
                <span className="text-[#CCFF00]">{lang === 'en' ? 'Your Farming Journey' : 'টেকসই ও আধুনিক প্রযুক্তি'}</span>
              </h1>
              
              <p className="text-base md:text-lg text-white/70 max-w-xl font-sans leading-relaxed">
                {text.problemDesc}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <a 
                  href="#ai-scanner" 
                  className="inline-flex items-center justify-center space-x-2 bg-[#CCFF00] text-black font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 hover:bg-[#bce500] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] shadow-lg cursor-pointer"
                >
                  <Camera size={20} />
                  <span>{text.ctaCamera}</span>
                </a>
                
                <a 
                  href="#harvestguard-dashboard" 
                  className="inline-flex items-center justify-center space-x-2 bg-white/5 text-white border border-white/20 font-sans font-bold text-base px-8 py-4 rounded-full transition-all hover:bg-white/10 hover:border-[#CCFF00] cursor-pointer"
                >
                  <LayoutDashboard size={20} className="text-[#CCFF00]" />
                  <span>{text.ctaDashboard}</span>
                </a>
              </div>
            </div>

            {/* Right Side: Glassmorphic Value Proposition Card (Mirrors reference image) */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[28px] text-left space-y-4 hover:border-[#CCFF00]/40 transition-all duration-300 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 blur-2xl rounded-full pointer-events-none" />
              <div className="text-white/60 text-xs font-bold uppercase tracking-wider">{text.solutionTitle}</div>
              <h3 className="text-2xl font-bold text-[#CCFF00]">
                {lang === 'en' ? 'Sustainable Farming Tech' : 'টেকসই কৃষি প্রযুক্তি'}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                {text.solutionDesc}
              </p>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <a href="#harvestguard-dashboard" className="text-white hover:text-[#CCFF00] text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors">
                  <span>{lang === 'en' ? 'Learn More' : 'আরও জানুন'}</span>
                  <ArrowRight size={14} className="text-[#CCFF00]" />
                </a>
                <div className="flex space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Workflow Metaphor (Solution / Cards Grid mirroring reference image layout) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-32 relative"
        >
          <div className="absolute inset-0 bg-[#CCFF00]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-white mb-4 tracking-tight">
            {text.solutionTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-white/60 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            {text.solutionDesc}
          </motion.p>

          {/* Grid layout styled exactly like the bottom cards of reference image */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, idx) => {
              const isSolidCard = idx === 2; // Make Step 3 (Take Action) a solid green card!
              return (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className={`p-8 rounded-[28px] text-left transition-all duration-300 relative flex flex-col justify-between min-h-[280px] group border
                    ${isSolidCard 
                      ? 'bg-[#CCFF00] text-black border-transparent shadow-[0_15px_30px_rgba(204,255,0,0.15)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(204,255,0,0.25)]' 
                      : 'bg-white/5 border-white/10 hover:border-[#CCFF00]/40 hover:scale-[1.02] hover:bg-white/10 text-white'
                    }`}
                >
                  <div>
                    {/* Top row: step number and icon/link arrow */}
                    <div className="flex justify-between items-center mb-6">
                      <div className={`text-sm font-black tracking-widest uppercase ${isSolidCard ? 'text-black/50' : 'text-white/40'}`}>
                        {idx + 1 === 1 ? '01' : idx + 1 === 2 ? '02' : idx + 1 === 3 ? '03' : '04'}
                      </div>
                      <div className={`p-2.5 rounded-full ${isSolidCard ? 'bg-black text-[#CCFF00]' : 'bg-white/5 text-[#CCFF00] border border-white/10 group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-transparent'} transition-all duration-300`}>
                        {isSolidCard ? <ArrowUpRight size={18} /> : step.icon}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className={`text-xl font-bold tracking-tight mb-2 ${isSolidCard ? 'text-black' : 'text-white'}`}>
                      {step.label}
                    </h3>

                    {/* Step description */}
                    <p className={`text-sm leading-relaxed ${isSolidCard ? 'text-black/80 font-medium' : 'text-white/60'}`}>
                      {step.details}
                    </p>
                  </div>

                  {/* Bottom link (optional decorative link/arrow) */}
                  <div className={`pt-6 mt-6 border-t ${isSolidCard ? 'border-black/10' : 'border-white/10'} flex items-center justify-between`}>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isSolidCard ? (lang === 'en' ? 'Get Advice' : 'পরামর্শ নিন') : (lang === 'en' ? 'Active' : 'চলমান')}
                    </span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Scanner Section */}
        <div id="ai-scanner" className="mb-32 relative z-10 scroll-mt-28">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl hover:border-[#CCFF00]/20 transition-all duration-300">
            {scanResult === null ? (
              <CameraCapture 
                isInline={true} 
                onScanComplete={(result, imgBlob) => {
                  setScanResult(result);
                  setScanImage(imgBlob);
                }}
              />
            ) : (
              <DiagnosisResult 
                isInline={true}
                onBack={() => {
                  setScanResult(null);
                  setScanImage(null);
                }}
                inlineResult={scanResult}
                inlineImageBlob={scanImage}
              />
            )}
          </div>
        </div>

        {/* Supported Crops Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-32 relative z-10"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-center text-white mb-4 tracking-tight">
            {text.cropsTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-white/60 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {text.cropsSubtitle}
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {cropsData.map((crop) => (
              <motion.button
                key={crop.id}
                variants={itemVariants}
                onClick={() => setSelectedCrop(selectedCrop === crop.id ? null : crop.id)}
                className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  selectedCrop === crop.id
                    ? 'bg-[#CCFF00]/10 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.15)] scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]'
                }`}
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{crop.icon}</div>
                <h4 className="text-xl font-bold text-white mb-1 tracking-tight">
                  {lang === 'en' ? crop.nameEn : crop.nameBn}
                </h4>
                <p className="text-xs text-white/40 font-medium capitalize">
                  {crop.diseasesEn.length} {lang === 'en' ? text.diseasesDetected : text.diseasesDetected}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Interactive Collapsible Detail Panel */}
          {selectedCrop && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#CCFF00]/10 to-transparent border border-[#CCFF00]/20 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl relative"
            >
              {/* Top-right corner glowing accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 blur-3xl rounded-full pointer-events-none" />
              {(() => {
                const crop = cropsData.find(c => c.id === selectedCrop);
                return (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl">{crop.icon}</span>
                      <h3 className="text-2xl font-bold text-[#CCFF00] tracking-tight">
                        {lang === 'en' ? crop.nameEn : crop.nameBn} {lang === 'en' ? 'Diagnostics' : 'রোগ তালিকা'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(lang === 'en' ? crop.diseasesEn : crop.diseasesBn).map((disease, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl flex items-center space-x-3 text-white/80 hover:text-white hover:border-[#CCFF00]/30 transition-all duration-200">
                          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
                          <span className="font-semibold text-sm capitalize tracking-wide">{disease.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </motion.div>

        {/* HarvestGuard Dashboard Section */}
        <div id="harvestguard-dashboard" className="mb-32 relative z-10 scroll-mt-28">
          <div className="bg-[#0A1F13]/90 border border-[#CCFF00]/20 p-6 md:p-8 rounded-3xl shadow-xl">
            {dashboardSection === 'inventory' && (
              <HarvestGuardDashboard 
                isInline={true}
                onAddBatchClick={() => setDashboardSection('add-batch')}
                onViewRiskClick={(batchId) => {
                  setDashboardBatchId(batchId);
                  setDashboardSection('risk-details');
                }}
              />
            )}
            {dashboardSection === 'add-batch' && (
              <BatchRegistration 
                isInline={true}
                onBack={() => setDashboardSection('inventory')}
                onSaveBatch={() => setDashboardSection('inventory')}
              />
            )}
            {dashboardSection === 'risk-details' && (
              <WeatherRiskWidget 
                isInline={true}
                onBack={() => setDashboardSection('inventory')}
                inlineBatchId={dashboardBatchId}
              />
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">{text.featuresTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-[#CCFF00]/30 transition-all duration-300 hover:scale-[1.01]">
              <WifiOff className="text-[#CCFF00] w-12 h-12 mb-6" />
              <h4 className="text-xl font-bold text-white mb-3">{text.featureOffline}</h4>
              <p className="text-white/60 leading-relaxed">{text.featureOfflineDesc}</p>
            </div>
            
            <a href="#local-risk-map" className="block bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-[#CCFF00]/30 transition-all duration-300 hover:scale-[1.01] group">
              <MapIcon className="text-[#CCFF00] w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
                {text.featureRisk}
                <ArrowRight className="w-5 h-5 text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-white/60 leading-relaxed">{text.featureRiskDesc}</p>
            </a>

            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl hover:border-[#CCFF00]/30 transition-all duration-300 hover:scale-[1.01]">
              <Sun className="text-[#CCFF00] w-12 h-12 mb-6" />
              <h4 className="text-xl font-bold text-white mb-3">{text.featureWeather}</h4>
              <p className="text-white/60 leading-relaxed">{text.featureWeatherDesc}</p>
            </div>
          </div>
        </div>

        {/* Local Risk Map Section */}
        <div id="local-risk-map" className="mb-24 relative z-10 scroll-mt-28">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl">
            <LocalRiskMap isEmbedded={true} />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="relative border border-white/10 rounded-3xl p-12 text-center overflow-hidden bg-cover bg-center min-h-[300px] flex flex-col justify-center items-center shadow-2xl" style={{ backgroundImage: 'url(/farmers_hero_banner.png)' }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
          <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-white mb-8 relative z-10 tracking-tight leading-tight max-w-2xl">
            {text.readyText}
          </h2>
          <a 
            href="#ai-scanner"
            className="inline-flex items-center space-x-2 bg-[#CCFF00] text-black font-sans font-bold text-lg px-8 py-4 rounded-full relative z-10 hover:scale-105 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] cursor-pointer"
          >
            <span>{text.startScanning}</span>
            <ArrowRight size={20} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default FarmersAILanding;
