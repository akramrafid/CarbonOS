export const CROPS_DATA = [
  {
    id: 'rice',
    nameEn: 'Rice',
    nameBn: 'ধান',
    icon: 'Sprout',
    diseasesEn: ["Bacterial Blight", "Blast", "Brown Spot", "Tungro"],
    diseasesBn: ["ব্যাকটেরিয়াল ব্লাইট (পাতা ধসা)", "ব্লাস্ট রোগ", "ব্রাউন স্পট (বাদামী দাগ)", "টুংরো ভাইরাস"]
  },
  {
    id: 'potato',
    nameEn: 'Potato',
    nameBn: 'আলু',
    icon: 'Leaf',
    diseasesEn: ["Early Blight", "Late Blight", "Healthy"],
    diseasesBn: ["আর্লি ব্লাইট (আগাম ধসা)", "লেট ব্লাইট (নাভি ধসা)", "সুস্থ আলু"]
  },
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameBn: 'টমেটো',
    icon: 'Leaf',
    diseasesEn: ["Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold", "Septoria Leaf Spot", "Spider Mites", "Target Spot", "Tomato Mosaic Virus", "Tomato Yellow Leaf Curl", "Healthy"],
    diseasesBn: ["ব্যাকটেরিয়াল স্পট", "আর্লি ব্লাইট (ধসা রোগ)", "লেট ব্লাইট (পাতা পচা)", "লিফ মোল্ড (ছত্রাক)", "সেপ্টোরিয়া লিফ স্পট", "মাকড়সা পোকা (Spider Mites)", "টার্গেট স্পট", "টমেটো মোজাইক ভাইরাস", "হলুদ পাতা কোঁকড়ানো ভাইরাস", "সুস্থ টমেটো"]
  },
  {
    id: 'maize',
    nameEn: 'Maize',
    nameBn: 'ভুট্টা',
    icon: 'Sprout',
    diseasesEn: ["Cercospora Leaf Spot", "Common Rust", "Northern Leaf Blight", "Healthy"],
    diseasesBn: ["সারকোস্পোরা লিফ স্পট", "কমন রাস্ট (মরিচা)", "নর্দার্ন লিফ ব্লাইট", "সুস্থ ভুট্টা"]
  },
  {
    id: 'mango',
    nameEn: 'Mango',
    nameBn: 'আম',
    icon: 'Trees',
    diseasesEn: ["Anthracnose", "Bacterial Canker", "Cutting Weevil", "Die Back", "Gall Midge", "Powdery Mildew", "Sooty Mould", "Healthy"],
    diseasesBn: ["অ্যানথ্রাকনোজ (দাগ রোগ)", "ব্যাকটেরিয়াল ক্যানকার", "পাতা কাটা উইভিল পোকা", "ডাই ব্যাক (ডাল শুকানো)", "গল মিজ পোকা (Gall Midge)", "পাউডারি মিলডিউ", "ঝুল রোগ (Sooty Mould)", "সুস্থ আম"]
  },
  {
    id: 'jackfruit',
    nameEn: 'Jackfruit',
    nameBn: 'কাঁঠাল',
    icon: 'Trees',
    diseasesEn: ["Algal Leaf Spot", "Black Spot", "Healthy"],
    diseasesBn: ["অ্যালগাল লিফ স্পট (শৈবাল দাগ)", "ব্ল্যাক স্পট (কালো দাগ)", "সুস্থ কাঁঠাল"]
  },
  {
    id: 'guava',
    nameEn: 'Guava',
    nameBn: 'পেয়ারা',
    icon: 'Trees',
    diseasesEn: ["Canker", "Dot", "Mummification", "Rust", "Healthy"],
    diseasesBn: ["ক্যানকার", "ডট (দাগ রোগ)", "মামিফিকেশন (শুকিয়ে কাঠ হওয়া)", "মরিচা রোগ (Rust)", "সুস্থ পেয়ারা"]
  },
  {
    id: 'citrus',
    nameEn: 'Citrus',
    nameBn: 'লেবু জাতীয়',
    icon: 'Trees',
    diseasesEn: ["Citrus Canker", "Nutrient Deficiency", "Multiple Diseases", "Healthy"],
    diseasesBn: ["সাইট্রাস ক্যানকার (ক্ষত রোগ)", "পুষ্টির অভাব (হলুদ পাতা)", "একাধিক রোগ", "সুস্থ লেবু/কমলা"]
  }
];

export const LANDING_TEXTS = {
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

export const WORKFLOW_DETAILS = {
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
