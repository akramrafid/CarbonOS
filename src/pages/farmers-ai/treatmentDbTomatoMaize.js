export const TOMATO_MAIZE_TREATMENTS = {
  /* ── TOMATO ── */
  bacterial_spot: {
    name: 'Bacterial Spot',
    nameBn: 'ব্যাকটেরিয়াল স্পট',
    urgency: 'high',
    immediate: [
      'Remove all heavily spotted leaves and fruit immediately',
      'Avoid all overhead irrigation — bacteria spread through water splash',
      'Sanitize all tools with 70% alcohol between plants'
    ],
    organic: [
      'Apply copper-based spray (Bordeaux mixture 0.5%) every 5–7 days',
      'Spray diluted hydrogen peroxide (3%) on affected leaves',
      'Apply plant-strengthening foliar spray using potassium silicate (2g/litre)'
    ],
    chemical: [
      'Copper Hydroxide 77 WP @ 25g per 10 litres water',
      'Or Copper Oxychloride 50 WP @ 25g per 10 litres water',
      'For severe: combine Streptomycin 90 SP @ 0.5g/litre + Copper Oxychloride — spray every 7 days'
    ],
    prevention: [
      'Use certified bacterial-spot-resistant tomato varieties',
      'Avoid working in the field when plants are wet',
      'Maintain 50cm plant spacing to ensure good air movement',
      'Use drip irrigation exclusively — never overhead sprinklers'
    ]
  },
  leaf_mold: {
    name: 'Leaf Mold',
    nameBn: 'পাতার ছাঁচ রোগ',
    urgency: 'medium',
    immediate: [
      'Improve ventilation inside greenhouse or shade structure immediately',
      'Reduce humidity by increasing spacing between plants',
      'Remove all infected leaves and dispose outside the growing area'
    ],
    organic: [
      'Apply Bacillus subtilis bio-fungicide every 7 days as a foliar spray',
      'Spray 2% potassium bicarbonate solution weekly',
      'Apply neem oil (5ml/litre) to create an unfavorable environment for fungal growth'
    ],
    chemical: [
      'Chlorothalonil 75 WP @ 25g per 10 litres water',
      'Or Mancozeb + Metalaxyl combination product at label rate',
      'Apply every 7 days; ensure thorough coverage of leaf undersides'
    ],
    prevention: [
      'Maintain relative humidity below 70% in enclosed growing areas',
      'Ensure proper ventilation with fans if growing in greenhouse',
      'Remove plant debris promptly after harvest',
      'Avoid wetting foliage during irrigation'
    ]
  },
  septoria_leaf_spot: {
    name: 'Septoria Leaf Spot',
    nameBn: 'সেপটোরিয়া পাতার দাগ',
    urgency: 'medium',
    immediate: [
      'Remove all infected lower leaves — infection moves upward from ground level',
      'Apply a thick mulch layer to prevent soil splash onto lower leaves',
      'Stop all overhead watering immediately'
    ],
    organic: [
      'Apply copper-based fungicide (Bordeaux mixture 0.5%) every 7–10 days',
      'Use Bacillus subtilis-based bio-fungicide as a preventive spray',
      'Spray diluted neem oil (3ml/litre) to suppress fungal spread'
    ],
    chemical: [
      'Chlorothalonil 75 WP @ 25g per 10 litres — highly effective against Septoria',
      'Or Mancozeb 80 WP @ 25g per 10 litres water',
      'Azoxystrobin 23 SC @ 10ml per 10 litres for systemic protection'
    ],
    prevention: [
      'Rotate crops — do not plant tomato or other solanaceous crops in the same bed for 2+ years',
      'Stake plants to keep foliage off the ground',
      'Maintain good soil drainage',
      'Remove old plant debris thoroughly after each harvest'
    ]
  },
  'spider_mites_two-spotted_spider_mite': {
    name: 'Spider Mite Infestation',
    nameBn: 'মাকড়সা মাইট আক্রমণ',
    urgency: 'high',
    immediate: [
      'Spray plants with a strong jet of water to physically dislodge mites',
      'Remove and destroy the most heavily infested leaves',
      'Isolate affected plants if possible to prevent spread'
    ],
    organic: [
      'Apply insecticidal soap solution (5ml/litre) — coat leaf undersides thoroughly',
      'Spray neem oil (5ml/litre) every 3–5 days for 2–3 weeks',
      'Introduce predatory mites (Phytoseiulus persimilis) as biological control'
    ],
    chemical: [
      'Abamectin 1.8 EC @ 1ml per litre water — highly effective against mites',
      'Or Bifenazate (Floramite) @ label rate for rapid knockdown',
      'Spiromesifen 240 SC @ 1ml per litre for persistent control',
      'Rotate miticide groups to prevent resistance; apply 2–3 times at 5-day intervals'
    ],
    prevention: [
      'Monitor plants weekly for early mite signs (fine webbing, silvery speckling)',
      'Maintain adequate soil moisture — drought stress increases mite susceptibility',
      'Control dust on plants by misting the field periodically',
      'Avoid broad-spectrum insecticides that kill natural mite predators'
    ]
  },
  target_spot: {
    name: 'Target Spot',
    nameBn: 'টার্গেট স্পট',
    urgency: 'medium',
    immediate: [
      'Remove infected leaves at the first sign of concentric ring patterns',
      'Apply fungicide promptly — target spot spreads rapidly under warm, humid conditions'
    ],
    organic: [
      'Apply copper hydroxide-based spray (Kocide) every 7 days',
      'Use Bacillus amyloliquefaciens (Serenade) bio-fungicide as a preventive spray',
      'Spray diluted neem oil (3ml/litre) to inhibit fungal sporulation'
    ],
    chemical: [
      'Azoxystrobin 23 SC @ 10ml per 10 litres — excellent systemic action',
      'Boscalid + Pyraclostrobin (Pristine) @ label rate for broad spectrum protection',
      'Or Chlorothalonil 75 WP @ 25g per 10 litres as a protectant'
    ],
    prevention: [
      'Maintain plant spacing at 50–60cm to improve air circulation',
      'Use drip irrigation to keep foliage dry',
      'Stake plants to keep them off the ground',
      'Avoid over-fertilizing with nitrogen — lush growth is more susceptible'
    ]
  },
  tomato_mosaic_virus: {
    name: 'Tomato Mosaic Virus',
    nameBn: 'টমেটো মোজেইক ভাইরাস',
    urgency: 'high',
    immediate: [
      'Remove and destroy all visibly infected plants immediately to prevent spread',
      'Disinfect hands with soap and tools with 10% bleach after handling infected plants',
      'Do not work with healthy plants after touching infected ones without washing'
    ],
    organic: [
      'There is no cure — focus on removing infected plants and controlling spread',
      'Apply neem oil spray (3ml/litre) to deter insect vectors (aphids, whiteflies)',
      'Use reflective mulch to repel aphid vectors'
    ],
    chemical: [
      'Control aphid and whitefly vectors with Imidacloprid 200 SL @ 0.5ml per litre',
      'Or Thiamethoxam 25 WG @ 0.4g per litre as a systemic insecticide',
      'Note: Insecticides treat the vector, not the virus — remove infected plants first'
    ],
    prevention: [
      'Source seeds from certified, virus-tested suppliers only',
      'Control aphid and whitefly populations from seedling stage',
      'Do not transplant seedlings from infected batches',
      'Wash hands thoroughly before handling plants — TMV can spread mechanically'
    ]
  },
  tomato_yellow_leaf_curl_virus: {
    name: 'Yellow Leaf Curl Virus',
    nameBn: 'টমেটো হলুদ পাতা কোঁকড়ানো ভাইরাস',
    urgency: 'critical',
    immediate: [
      'Remove and destroy all infected plants immediately — TYLCV has no cure',
      'Control whitefly vector urgently with systemic insecticide',
      'Use yellow sticky traps to monitor and capture whitefly populations'
    ],
    organic: [
      'Apply reflective silver mulch around plants to repel whiteflies',
      'Spray insecticidal soap (5ml/litre) on leaf undersides to kill whitefly nymphs',
      'Introduce Encarsia formosa (a parasitic wasp) as biological control in enclosed areas'
    ],
    chemical: [
      'Imidacloprid 70 WS seed treatment for transplants to provide systemic protection',
      'Foliar spray of Spirotetramat (Movento) @ 0.75ml per litre for whitefly control',
      'Or Pyriproxyfen 10 EC @ 1ml per litre to disrupt whitefly life cycle'
    ],
    prevention: [
      'Grow virus-resistant tomato varieties (HM 7882, Shaktiman-4)',
      'Use fine mesh (50-mesh) insect-proof nets for nursery beds',
      'Maintain a gap of at least 50m between tomato crops of different ages',
      'Monitor whitefly populations from transplanting — act at first detection'
    ]
  },

  /* ── MAIZE ── */
  cercospora_leaf_spot_gray_leaf_spot: {
    name: 'Gray Leaf Spot',
    nameBn: 'ধূসর পাতার দাগ',
    urgency: 'medium',
    immediate: [
      'Remove lower infected leaves to slow disease progression',
      'Improve air circulation between rows by thinning if over-planted'
    ],
    organic: [
      'Apply Trichoderma-based bio-fungicide as a foliar spray at early stages',
      'Use compost to improve soil health and plant immunity'
    ],
    chemical: [
      'Azoxystrobin 23 SC @ 10ml per 10 litres water',
      'Or Tebuconazole 25 EC @ 10ml per 10 litres water',
      'Apply at early tasseling stage for best results; repeat after 14 days'
    ],
    prevention: [
      'Use certified gray-leaf-spot-resistant maize hybrids',
      'Rotate maize with legumes or other non-host crops annually',
      'Till crop residue deeply after harvest to reduce inoculum',
      'Maintain proper row spacing (75cm) for airflow'
    ]
  },
  common_rust: {
    name: 'Common Rust',
    nameBn: 'সাধারণ মরিচা রোগ',
    urgency: 'medium',
    immediate: [
      'Apply fungicide at first sign of orange pustules before disease spreads',
      'Prioritize fungicide application during tasseling and silking stages'
    ],
    organic: [
      'Apply sulfur-based fungicide (Sulfur 80 WP) @ 25g per 10 litres',
      'Use neem-based spray every 5–7 days as a protective measure'
    ],
    chemical: [
      'Propiconazole 25 EC @ 10ml per 10 litres water — most effective',
      'Or Mancozeb 80 WP @ 25g per 10 litres as a protective spray',
      'Apply at 7–10 day intervals; 2–3 applications usually sufficient'
    ],
    prevention: [
      'Plant rust-resistant maize varieties — check BADC recommended varieties',
      'Plant early to avoid peak rust season',
      'Avoid excessive nitrogen fertilizer which promotes lush, susceptible foliage'
    ]
  },
  northern_leaf_blight: {
    name: 'Northern Leaf Blight',
    nameBn: 'উত্তরীয় পাতার ঝলসা',
    urgency: 'high',
    immediate: [
      'Apply fungicide immediately — northern leaf blight can cause 30–50% yield loss',
      'Remove and destroy severely infected lower leaves'
    ],
    organic: [
      'Apply Pseudomonas fluorescens bio-fungicide @ 5g per litre',
      'Use Trichoderma viride as a protective soil drench around roots'
    ],
    chemical: [
      'Propiconazole 25 EC @ 10ml per 10 litres water',
      'Or Azoxystrobin + Propiconazole (Quilt Xcel) @ label rate for systemic protection',
      'Begin spraying at VT/R1 (tasseling/silking) stage; repeat at 14-day interval'
    ],
    prevention: [
      'Plant NLB-resistant hybrids — BARI Hybrid Maize 9 or similar',
      'Crop rotation with non-host crops breaks disease cycle',
      'Deep plow to bury infected residue after harvest',
      'Avoid water stress during grain fill — stressed plants are more susceptible'
    ]
  }
};
