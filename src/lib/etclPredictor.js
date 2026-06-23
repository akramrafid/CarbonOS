// ETCL (Estimated Time to Critical Loss) Predictor Logic
// Returns hours until critical loss and a human readable risk summary

export const calculateETCL = (temperature, humidity, storageType) => {
  // Base ETCL in hours based on storage type (ideal conditions)
  let baseETCL = 0;
  let riskName = "";

  switch (storageType) {
    case 'open_area':
      baseETCL = 48; // Open area decays fast if conditions bad
      riskName = "Environmental Spoilage & Pest Attack";
      break;
    case 'jute_bag':
      baseETCL = 120; // Jute bags breathe but can grow mold
      riskName = "Aflatoxin Mold & Fungal Growth";
      break;
    case 'silo':
      baseETCL = 336; // 14 days in silo if not aerated
      riskName = "Heat Stress & Grain Discoloration";
      break;
    default:
      baseETCL = 72;
      riskName = "General Spoilage";
  }

  // Modifiers based on temperature (> 30C is high)
  let tempModifier = 1.0;
  if (temperature > 35) tempModifier = 0.4; // Extremely fast decay
  else if (temperature > 30) tempModifier = 0.7;

  // Modifiers based on humidity (> 80% is high)
  let humidityModifier = 1.0;
  if (humidity > 90) humidityModifier = 0.5;
  else if (humidity > 80) humidityModifier = 0.8;

  // Calculate final ETCL
  const finalETCL = Math.max(12, Math.round(baseETCL * tempModifier * humidityModifier));

  // Determine Risk Level
  let riskLevel = 'Low';
  if (finalETCL <= 48) riskLevel = 'High';
  else if (finalETCL <= 120) riskLevel = 'Medium';

  return {
    etclHours: finalETCL,
    riskLevel: riskLevel,
    riskName: riskName
  };
};

export const getBanglaAdvisory = (riskLevel, rainChance, storageType) => {
  if (rainChance > 70 && storageType === 'open_area') {
    return "আগামী ৩ দিন প্রবল বৃষ্টির সম্ভাবনা। আজই ধান কাটুন অথবা ঢেকে রাখুন। (High Rain Risk)";
  }
  
  if (riskLevel === 'High') {
    if (storageType === 'jute_bag') {
      return "উচ্চ আর্দ্রতার কারণে ছত্রাকের ঝুঁকি বেশি। বস্তাগুলো শুকনো স্থানে সরিয়ে নিন এবং হাওয়া চলাচলের ব্যবস্থা করুন।";
    }
    return "উচ্চ তাপমাত্রার কারণে ফসলের ক্ষতি হতে পারে। দ্রুত ব্যবস্থা নিন।";
  }

  if (riskLevel === 'Medium') {
    return "মাঝারি ঝুঁকি। ফসলের তাপমাত্রা ও আর্দ্রতা নিয়মিত পর্যবেক্ষণ করুন।";
  }

  return "আবহাওয়া অনুকূল রয়েছে। বর্তমান সংরক্ষণ ব্যবস্থা চালিয়ে যান।";
};
