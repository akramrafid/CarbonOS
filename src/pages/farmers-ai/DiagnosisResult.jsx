import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, AlertTriangle, AlertCircle,
  ThermometerSun, WifiOff, Volume2, VolumeX,
  Leaf, Droplets, FlaskConical, ShieldCheck, ClipboardList,
  Clock, Zap, TriangleAlert
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   DISEASE TREATMENT DATABASE
   Written as structured agronomist-grade advice — no AI disclaimers.
   Each entry has: immediate[], organic[], chemical[], prevention[], urgency
   urgency: 'low' | 'medium' | 'high' | 'critical'
──────────────────────────────────────────────────────────────────────────── */
const TREATMENT_DB = {
  /* ── RICE ── */
  bacterialblight: {
    name: 'Bacterial Blight',
    nameBn: 'ব্যাকটেরিয়াল ব্লাইট',
    urgency: 'high',
    immediate: [
      'Drain standing water from the field immediately',
      'Stop all nitrogen fertilizer applications',
      'Remove and destroy severely infected plant parts'
    ],
    organic: [
      'Spray 1% Bordeaux mixture (10g copper sulfate + 10g lime per 1 litre water)',
      'Apply wood ash around infected areas to reduce humidity',
      'Use neem-based bio-pesticide (5ml/litre) as a foliar spray every 7 days'
    ],
    chemical: [
      'Spray Copper Oxychloride 50 WP @ 2.5g per litre of water',
      'Alternatively use Kasugamycin 3 SL @ 2ml per litre, 2–3 sprays at 7-day intervals',
      'For severe infection: Streptomycin sulfate 90 SP @ 0.5g per litre'
    ],
    prevention: [
      'Use certified disease-resistant varieties (BRRI dhan47, BRRI dhan67)',
      'Maintain proper plant spacing (20cm × 15cm) for air circulation',
      'Avoid excessive irrigation; use intermittent flooding technique',
      'Apply balanced NPK fertilizer — avoid excess nitrogen'
    ]
  },
  blast: {
    name: 'Blast',
    nameBn: 'ব্লাস্ট রোগ',
    urgency: 'critical',
    immediate: [
      'Apply fungicide within 24 hours — blast spreads rapidly',
      'Drain excess water from the field to reduce leaf wetness',
      'Do not apply nitrogen fertilizer until disease is controlled'
    ],
    organic: [
      'Spray Trichoderma viride bio-fungicide @ 5g per litre of water',
      'Apply potassium silicate solution (2%) to strengthen leaf cell walls',
      'Use neem oil emulsion (3%) as a protective spray'
    ],
    chemical: [
      'Tricyclazole 75 WP @ 8g per 10 litres water — most effective choice',
      'Or Isoprothiolane 40 EC @ 15ml per 10 litres water',
      'Spray 2–3 times at 7-day intervals beginning at first sign of infection'
    ],
    prevention: [
      'Use blast-resistant varieties (BRRI dhan28, BRRI dhan29)',
      'Ensure proper seedling density — avoid overcrowding',
      'Maintain good field drainage throughout the crop cycle',
      'Apply silica-rich fertilizers to boost plant immunity'
    ]
  },
  brownspot: {
    name: 'Brown Spot',
    nameBn: 'বাদামি দাগ রোগ',
    urgency: 'medium',
    immediate: [
      'Apply potassium fertilizer immediately to reduce disease severity',
      'Remove heavily infected leaves by hand and dispose outside the field'
    ],
    organic: [
      'Spray Pseudomonas fluorescens bio-pesticide @ 5g per litre',
      'Apply compost tea (dilute 1:10) as a foliar spray — improves plant immunity',
      'Use seaweed extract (2ml/litre) to strengthen the crop'
    ],
    chemical: [
      'Propiconazole 25 EC @ 10ml per 10 litres water',
      'Or Mancozeb 80 WP @ 25g per 10 litres water',
      'Apply 2 sprays at 10-day intervals'
    ],
    prevention: [
      'Use healthy, certified disease-free seeds',
      'Balance soil nutrients — deficiency of potassium & phosphorus worsens brown spot',
      'Avoid water stress during booting and heading stages',
      'Maintain proper soil pH (5.5–6.5)'
    ]
  },
  tungro: {
    name: 'Tungro Virus',
    nameBn: 'টুংরো ভাইরাস',
    urgency: 'critical',
    immediate: [
      'There is no cure for tungro once infected — remove and burn all infected plants immediately',
      'Control the green leafhopper vector with insecticide urgently',
      'Alert neighboring farmers to prevent field-to-field spread'
    ],
    organic: [
      'Introduce natural leafhopper predators (spiders, mirid bugs)',
      'Apply neem oil spray (5ml/litre) to control the leafhopper vector',
      'Set up yellow sticky traps to monitor leafhopper population'
    ],
    chemical: [
      'Apply Imidacloprid 200 SL @ 0.5ml per litre to kill the leafhopper vector',
      'Or Thiamethoxam 25 WG @ 0.4g per litre as a soil drench or foliar spray',
      'Spray every 7 days until leafhopper infestation is under control'
    ],
    prevention: [
      'Plant tungro-resistant varieties (BRRI dhan52, Rajashail)',
      'Synchronize planting with neighboring fields to break the pest cycle',
      'Avoid planting near areas with previous tungro outbreak',
      'Monitor leafhopper populations from seedling stage'
    ]
  },

  /* ── POTATO ── */
  early_blight: {
    name: 'Early Blight',
    nameBn: 'আর্লি ব্লাইট',
    urgency: 'medium',
    immediate: [
      'Remove and destroy all infected leaves — do not leave them in the field',
      'Improve air circulation by removing excess foliage around plants',
      'Avoid overhead irrigation — switch to drip or furrow irrigation'
    ],
    organic: [
      'Apply Bacillus subtilis bio-fungicide (Serenade) as a preventive foliar spray',
      'Spray diluted baking soda solution (1 tsp per litre) weekly as a protective measure',
      'Use compost mulch to prevent soil splash onto lower leaves'
    ],
    chemical: [
      'Chlorothalonil 75 WP @ 25g per 10 litres water — apply at 7-day intervals',
      'Or Mancozeb 80 WP @ 25g per 10 litres water',
      'For severe infection: Difenoconazole 25 EC @ 10ml per 10 litres water'
    ],
    prevention: [
      'Plant certified disease-free seed tubers',
      'Rotate crops — avoid planting potato in the same field for 3 years',
      'Ensure adequate potassium nutrition before planting',
      'Hill soil around plants to prevent tuber exposure'
    ]
  },
  late_blight: {
    name: 'Late Blight',
    nameBn: 'লেট ব্লাইট',
    urgency: 'critical',
    immediate: [
      'Begin fungicide treatment immediately — late blight can destroy a crop in 3–5 days',
      'Destroy all infected plant material; do not compost infected leaves',
      'Stop irrigation for at least 5 days to reduce leaf wetness'
    ],
    organic: [
      'Apply copper-based fungicide (Bordeaux mixture 1%) every 5–7 days',
      'Use Trichoderma harzianum bio-fungicide as a preventive soil treatment',
      'Remove volunteer potato plants which act as disease reservoirs'
    ],
    chemical: [
      'Metalaxyl-M + Mancozeb (Ridomil Gold MZ) @ 25g per 10 litres — most effective',
      'Or Dimethomorph + Mancozeb @ 25g per 10 litres water',
      'Cymoxanil + Mancozeb @ 25g per 10 litres as an alternative',
      'Spray every 5–7 days; rotate fungicide groups to prevent resistance'
    ],
    prevention: [
      'Use late-blight-resistant potato varieties (Diamant, Cardinal)',
      'Avoid planting in low-lying, poorly drained areas',
      'Monitor weather — high humidity + cool temperatures = high risk',
      'Harvest tubers promptly after haulm destruction'
    ]
  },

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
  },

  /* ── MANGO ── */
  anthracnose: {
    name: 'Anthracnose',
    nameBn: 'অ্যান্থ্রাকনোজ',
    urgency: 'high',
    immediate: [
      'Prune and remove all infected branches, flowers, and fruit — dispose away from the orchard',
      'Apply protective copper spray immediately after pruning',
      'Clear all fallen leaf and fruit debris from the ground'
    ],
    organic: [
      'Spray Bordeaux mixture (1%) every 10–14 days during flowering and fruiting',
      'Apply neem oil (5ml/litre) as a protective spray',
      'Apply Trichoderma harzianum to the root zone to improve overall tree health'
    ],
    chemical: [
      'Carbendazim 50 WP @ 10g per 10 litres water — pre- and post-harvest spray',
      'Or Mancozeb 80 WP @ 25g per 10 litres — protective foliar spray',
      'Propiconazole 25 EC @ 10ml per 10 litres for curative action'
    ],
    prevention: [
      'Prune trees annually for good canopy ventilation',
      'Apply protective fungicide starting from bud break through fruit set',
      'Avoid water stress — irrigate adequately during flowering',
      'Post-harvest: dip fruit in hot water (55°C for 5 minutes) to prevent storage anthracnose'
    ]
  },
  powdery_mildew: {
    name: 'Powdery Mildew',
    nameBn: 'সাদা গুঁড়ো রোগ',
    urgency: 'medium',
    immediate: [
      'Improve air circulation by pruning overcrowded branches',
      'Avoid overhead irrigation which creates favorable conditions for mildew'
    ],
    organic: [
      'Spray potassium bicarbonate solution (5g per litre) every 7 days',
      'Or spray diluted milk (1:9 ratio with water) — proven effective against powdery mildew',
      'Apply sulfur dust early morning when dew is present'
    ],
    chemical: [
      'Hexaconazole 5 EC @ 10ml per 10 litres water — excellent for powdery mildew',
      'Or Myclobutanil 10 WP @ 10g per 10 litres',
      'Sulfur 80 WP @ 30g per 10 litres as a contact fungicide'
    ],
    prevention: [
      'Maintain proper spacing between trees for airflow',
      'Begin protective spraying during the pre-flowering stage',
      'Avoid excessive nitrogen fertilizer which promotes tender, susceptible shoots',
      'Apply dormant season oil spray to reduce overwintering mildew populations'
    ]
  },

  /* ── JACKFRUIT ── */
  Algal_Leaf_Spot_of_Jackfruit: {
    name: 'Algal Leaf Spot',
    nameBn: 'শৈবাল পাতার দাগ',
    urgency: 'low',
    immediate: [
      'Prune affected branches to improve light penetration and reduce humidity',
      'Remove and dispose of heavily infected leaves'
    ],
    organic: [
      'Spray Bordeaux mixture (0.5%) to eliminate algal growth',
      'Apply potassium permanganate solution (0.1%) as a foliar spray'
    ],
    chemical: [
      'Copper Oxychloride 50 WP @ 20g per 10 litres water',
      'Apply 2–3 times at 14-day intervals'
    ],
    prevention: [
      'Maintain open canopy through regular pruning',
      'Avoid water-logging at the root zone',
      'Remove epiphytic plants (mosses, lichens) from tree trunk'
    ]
  },
  Black_Spot_of_Jackfruit: {
    name: 'Black Spot',
    nameBn: 'কালো দাগ রোগ',
    urgency: 'medium',
    immediate: [
      'Remove and destroy all infected leaves and fruit',
      'Apply fungicide spray immediately to uninfected parts'
    ],
    organic: [
      'Spray neem oil (5ml/litre) combined with a few drops of dish soap every 7 days',
      'Apply Bordeaux mixture (1%) as a protective spray'
    ],
    chemical: [
      'Mancozeb 80 WP @ 25g per 10 litres water',
      'Or Carbendazim 50 WP @ 10g per 10 litres — apply every 10–14 days'
    ],
    prevention: [
      'Prune trees annually after harvest season',
      'Apply balanced fertilizer — potassium deficiency increases susceptibility',
      'Avoid mechanical damage to fruit during handling'
    ]
  },

  /* ── GUAVA ── */
  Canker: {
    name: 'Canker',
    nameBn: 'ক্যাংকার',
    urgency: 'high',
    immediate: [
      'Prune all cankered branches at least 15cm below the visible infection',
      'Immediately paint pruning cuts with Bordeaux paste to prevent reinfection',
      'Sterilize pruning tools with 70% alcohol between each cut'
    ],
    organic: [
      'Apply Bordeaux paste (copper sulfate + lime) directly to all cut surfaces and wounds',
      'Spray Bordeaux mixture (1%) on remaining foliage and branches'
    ],
    chemical: [
      'Copper Oxychloride 50 WP @ 25g per 10 litres water — spray entire tree',
      'Or Carbendazim + Mancozeb combination @ label rate',
      'Apply every 15 days during high-humidity season'
    ],
    prevention: [
      'Avoid making unnecessary wounds to the tree',
      'Protect trees from wind damage which creates entry points for bacteria',
      'Plant windbreaks around the orchard',
      'Apply balanced fertilizer — over-fertilization with nitrogen increases canker severity'
    ]
  },
  Rust: {
    name: 'Rust Disease',
    nameBn: 'মরিচা রোগ',
    urgency: 'medium',
    immediate: [
      'Remove and destroy all infected leaves to reduce spore load',
      'Begin fungicide application promptly'
    ],
    organic: [
      'Apply sulfur-based dust (Wettable Sulfur 80 WP) @ 25g per 10 litres',
      'Spray neem oil (5ml/litre) every 7 days as a preventive and curative measure'
    ],
    chemical: [
      'Hexaconazole 5 EC @ 10ml per 10 litres water',
      'Or Propiconazole 25 EC @ 10ml per 10 litres water',
      'Apply 2–3 times at 10-day intervals'
    ],
    prevention: [
      'Maintain proper spacing and canopy pruning for good air circulation',
      'Apply protective fungicide at the start of rainy season',
      'Monitor fields regularly — early treatment is far more effective'
    ]
  },
  Mummification: {
    name: 'Fruit Mummification',
    nameBn: 'ফলের মমিকরণ',
    urgency: 'medium',
    immediate: [
      'Remove all mummified fruit from the tree and ground immediately — they are a major source of infection',
      'Prune and thin heavily loaded branches to improve air circulation around fruit'
    ],
    organic: [
      'Apply Bordeaux mixture (1%) during flowering and early fruit development',
      'Use Trichoderma-based bio-fungicide as a preventive soil drench'
    ],
    chemical: [
      'Carbendazim 50 WP @ 10g per 10 litres water — apply at petal fall and 3 weeks later',
      'Or Tebuconazole 25 EC @ 10ml per 10 litres water for systemic control'
    ],
    prevention: [
      'Remove all fruit mummies from trees and ground each season',
      'Prune trees to maintain an open, well-ventilated canopy',
      'Thin heavy fruit clusters to reduce moisture accumulation'
    ]
  },

  /* ── CITRUS ── */
  Citrus_Canker_Diseases_Leaf_Orange: {
    name: 'Citrus Canker',
    nameBn: 'সাইট্রাস ক্যাংকার',
    urgency: 'critical',
    immediate: [
      'Prune all infected branches 15–30cm below the visible lesions',
      'Immediately disinfect pruning wounds with Bordeaux paste',
      'Quarantine: avoid moving plant material from this tree/area'
    ],
    organic: [
      'Spray Bordeaux mixture (1%) on all foliage and branches every 14 days',
      'Apply copper-based paste on all pruning wounds'
    ],
    chemical: [
      'Copper Hydroxide 77 WP @ 25g per 10 litres water — most effective copper spray',
      'Or Streptomycin Sulfate 90 SP @ 0.5g per litre combined with copper spray',
      'Apply 4–5 times per year: at bud break, post-flush, and after each rainy period'
    ],
    prevention: [
      'Use certified disease-free nursery stock only',
      'Install windbreaks — wind-driven rain is the primary spread mechanism',
      'Control leafminer (Phyllocnistis citrella) which creates entry wounds for canker bacteria',
      'Sanitize tools and hands when moving between trees'
    ]
  },
  Citrus_Nutrient_Deficiency_Yellow_Leaf_Orange: {
    name: 'Nutrient Deficiency',
    nameBn: 'পুষ্টির ঘাটতি',
    urgency: 'medium',
    immediate: [
      'Conduct a soil test to identify the specific deficiency (likely iron, zinc, or magnesium)',
      'Apply foliar micronutrient spray immediately while awaiting soil test results'
    ],
    organic: [
      'Apply well-rotted compost or vermicompost around the tree base — 5–10 kg per tree',
      'Use seaweed extract spray (2ml/litre) as a broad-spectrum micronutrient supplement'
    ],
    chemical: [
      'For iron deficiency: Ferrous Sulfate @ 5g per litre as foliar spray',
      'For zinc deficiency: Zinc Sulfate @ 5g per litre as foliar spray',
      'For magnesium: Magnesium Sulfate (Epsom salt) @ 10g per litre as foliar spray',
      'Apply balanced NPK fertilizer with micronutrients (12:32:16 or similar) at root zone'
    ],
    prevention: [
      'Maintain soil pH at 6.0–7.0 — nutrient lockout occurs outside this range',
      'Apply annual soil testing and correct imbalances proactively',
      'Use mulch to prevent nutrient leaching',
      'Ensure adequate irrigation — dry soils limit nutrient uptake'
    ]
  },
  Multiple_Diseases_Leaf_Orange: {
    name: 'Multiple Disease Complex',
    nameBn: 'একাধিক রোগের সংমিশ্রণ',
    urgency: 'high',
    immediate: [
      'Prune and remove all visibly diseased branches and leaves',
      'Apply a broad-spectrum copper fungicide spray immediately'
    ],
    organic: [
      'Apply Bordeaux mixture (1%) as a comprehensive protective spray every 10 days',
      'Use Trichoderma harzianum soil drench to improve root health and overall tree vigor'
    ],
    chemical: [
      'Apply Carbendazim + Mancozeb combination @ label rate for broad-spectrum control',
      'Follow up with Copper Hydroxide spray every 14 days',
      'Consider systemic fungicide (Propiconazole) for deeper infection control'
    ],
    prevention: [
      'Annual pruning to maintain healthy, open canopy',
      'Balanced fertilization program — avoid excess nitrogen',
      'Monitor trees monthly and treat problems when small',
      'Proper irrigation management — avoid water stress and waterlogging'
    ]
  },

  /* ── UNIVERSAL HEALTHY ── */
  healthy: {
    name: 'Healthy',
    nameBn: 'সুস্থ ফসল',
    urgency: 'low',
    immediate: [],
    organic: [
      'Continue current crop management practices — your crop is in good condition',
      'Apply balanced organic compost to maintain soil health'
    ],
    chemical: [],
    prevention: [
      'Monitor your crop weekly to catch any disease at the earliest stage',
      'Maintain good field hygiene — remove crop debris after harvest',
      'Ensure balanced fertilization and adequate irrigation',
      'Keep a crop diary to track health over time'
    ]
  },
  Healthy_Leaf_of_Jackfruit: { name: 'Healthy', nameBn: 'সুস্থ গাছ', urgency: 'low', immediate: [], organic: ['Continue current care practices'], chemical: [], prevention: ['Monitor weekly for early disease signs', 'Maintain proper irrigation and fertilization'] },
  Healthy_Leaf_Orange: { name: 'Healthy', nameBn: 'সুস্থ গাছ', urgency: 'low', immediate: [], organic: ['Continue current care practices'], chemical: [], prevention: ['Monitor weekly for early disease signs', 'Maintain proper irrigation and fertilization'] },
  Dot: { name: 'Dot Disease', nameBn: 'ডট রোগ', urgency: 'low', immediate: ['Remove infected leaves'], organic: ['Spray neem oil (3ml/litre) every 7 days'], chemical: ['Mancozeb 80 WP @ 25g per 10 litres'], prevention: ['Ensure good drainage', 'Prune for airflow'] },
  Young_Healthy_Leaf_Orange: { name: 'Healthy Young Leaf', nameBn: 'সুস্থ কচি পাতা', urgency: 'low', immediate: [], organic: ['Continue current care'], chemical: [], prevention: ['Monitor for pest damage on new flush', 'Apply preventive copper spray at bud break'] },
  gall_midge: { name: 'Gall Midge', nameBn: 'গল মিজ', urgency: 'high', immediate: ['Remove and destroy all gall-forming shoots immediately'], organic: ['Apply neem oil (5ml/litre) during egg-laying period'], chemical: ['Spray Dimethoate 30 EC @ 2ml per litre at 10-day intervals'], prevention: ['Apply systemic insecticide at bud emergence', 'Monitor for adult flies using yellow sticky traps'] },
  die_back: { name: 'Die Back', nameBn: 'ডাই ব্যাক', urgency: 'high', immediate: ['Prune dead branches 15cm below infection; sterilize tools'], organic: ['Apply Bordeaux paste to all pruning cuts'], chemical: ['Spray Carbendazim 50 WP @ 10g per 10 litres on remaining foliage'], prevention: ['Maintain tree vigor through balanced fertilization', 'Ensure adequate irrigation during dry periods'] },
  sooty_mould: { name: 'Sooty Mould', nameBn: 'কালো ছাঁচ', urgency: 'low', immediate: ['Control the insect pest causing honeydew (mealybug, scale, aphid)'], organic: ['Spray neem oil (5ml/litre) to control honeydew-producing insects', 'Wipe leaves with damp cloth to remove sooty mould manually'], chemical: ['Apply Imidacloprid 200 SL @ 0.5ml per litre to control insect vectors'], prevention: ['Inspect regularly for scale insects and mealybugs', 'Prune crowded branches to discourage insect colonization'] },
  cutting_weevil: { name: 'Cutting Weevil', nameBn: 'কাটিং উইভিল', urgency: 'high', immediate: ['Collect and destroy fallen shoots and infested plant parts'], organic: ['Apply entomopathogenic nematodes around root zone', 'Use pheromone traps to catch adult weevils'], chemical: ['Spray Chlorpyrifos 20 EC @ 2.5ml per litre on stem and ground', 'Apply Carbofuran 3G granules at root zone'], prevention: ['Bind tree trunks with grease bands to prevent adult weevil climbing', 'Monitor orchards weekly during egg-laying season'] },
  bacterial_canker: { name: 'Bacterial Canker', nameBn: 'ব্যাকটেরিয়াল ক্যাংকার', urgency: 'critical', immediate: ['Prune all infected branches 20cm below visible lesions; paint cuts with Bordeaux paste', 'Quarantine infected tree — limit movement of material'], organic: ['Spray Bordeaux mixture (1%) immediately after pruning'], chemical: ['Apply Copper Hydroxide 77 WP @ 25g per 10 litres + Streptomycin 0.5g/litre', 'Spray every 14 days for 3 applications'], prevention: ['Use certified disease-free planting material', 'Protect trees from physical injury; sanitize tools between trees'] }
};

/* ─────────────────────────────────────────────────────────────────────────
   URGENCY CONFIG
──────────────────────────────────────────────────────────────────────────── */
const URGENCY_CONFIG = {
  low:      { label: 'Low Risk',      color: 'text-[#CCFF00]', bg: 'bg-[#CCFF00]/10', border: 'border-[#CCFF00]/20', dot: 'bg-[#CCFF00]' },
  medium:   { label: 'Act Soon',      color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', dot: 'bg-yellow-400' },
  high:     { label: 'Act Quickly',   color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', dot: 'bg-orange-400' },
  critical: { label: 'Urgent Action', color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    dot: 'bg-red-400'    }
};

const DiagnosisResult = ({ isInline = false, onBack = null, inlineResult = null, inlineImageBlob = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { result: routeResult, imageBlob: routeImageBlob } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('immediate');

  const result = isInline ? inlineResult : routeResult;
  const imageBlob = isInline ? inlineImageBlob : routeImageBlob;

  if (!result) {
    return (
      <div className="pt-24 pb-16 px-4 max-w-lg mx-auto text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">No result found</h2>
        <button onClick={() => navigate('/farmers-ai/camera')} className="text-emerald hover:underline">
          Go back to camera
        </button>
      </div>
    );
  }

  const { species, disease, confidence, severity, needs_agronomist_review, heatmap_url, weather_risk, isOffline } = result;

  const isTierA = ['rice', 'potato', 'tomato', 'maize'].includes(species.toLowerCase());
  const isTierB = ['mango', 'jackfruit', 'guava', 'citrus'].includes(species.toLowerCase());
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
      utterance.lang = 'bn-BD';
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const voiceText = `${treatment.name} detected in your ${species} crop. ${(treatment.immediate || []).join('. ')} ${(treatment.organic || []).join('. ')}`;

  const mainResultContent = (
    <div className="max-w-lg mx-auto w-full flex flex-col space-y-5">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in-up { animation: fade-in-up 0.35s ease-out both; }
        @keyframes bar-fill { from { width: 0%; } to { width: var(--target-width); } }
        .bar-fill { animation: bar-fill 1s ease-out both; animation-delay: 0.2s; }
      `}} />

      {/* Back Button */}
      {!isInline ? (
        <button onClick={() => navigate('/farmers-ai/camera')} className="flex items-center text-white/50 hover:text-white transition-colors text-sm font-semibold group">
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Camera
        </button>
      ) : (
        onBack && (
          <button onClick={onBack} className="flex items-center text-white/50 hover:text-white text-sm font-semibold transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Scanner
          </button>
        )
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Diagnosis Result</h1>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="flex items-center text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3 h-3 mr-1" /> Offline
            </span>
          )}
        </div>
      </div>

      {/* Crop Image */}
      <div className="relative rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video bg-black">
        <img src={imageBlob} alt="Crop" className="absolute inset-0 w-full h-full object-cover" />
        {heatmap_url ? (
          <img src={heatmap_url} alt="Heatmap" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" />
        ) : (
          !isHealthy && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.35)_0%,transparent_60%)] mix-blend-screen pointer-events-none animate-pulse" />
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

      {/* Disease Header Card */}
      <div className="fade-in-up bg-white/5 border border-white/10 rounded-[24px] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Detected Condition</p>
            <h2 className="text-2xl font-extrabold text-white capitalize tracking-tight leading-tight">
              {treatment.name || disease?.replace(/_/g, ' ')}
            </h2>
            {treatment.nameBn && (
              <p className="text-[#CCFF00]/80 text-sm font-semibold mt-0.5">{treatment.nameBn}</p>
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
            <span className="text-white/40 text-xs font-medium">Diagnostic Confidence</span>
            <span className={`text-sm font-extrabold ${pct >= 75 ? 'text-[#CCFF00]' : pct >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>{pct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bar-fill ${pct >= 75 ? 'bg-gradient-to-r from-[#CCFF00] to-[#a0d000]' : pct >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`}
              style={{ '--target-width': `${pct}%`, width: `${pct}%` }}
            />
          </div>
          <p className="text-white/30 text-[10px] mt-1.5">
            {pct >= 80 ? 'High confidence — proceed with treatment plan below'
              : pct >= 60 ? 'Moderate confidence — treatment is recommended; monitor response'
              : 'Lower confidence — specialist field verification is advised before chemical application'}
          </p>
        </div>

        {/* Alert Banners */}
        {needs_agronomist_review && (
          <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-400/25 px-4 py-3 rounded-xl relative z-10">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-bold">Specialist Field Verification Recommended</p>
              <p className="text-amber-200/70 text-xs mt-0.5 leading-relaxed">
                Due to the visual complexity of this case, a field visit by your local DAE agronomist is advised before heavy chemical treatment. The general treatment guidance below is still applicable.
              </p>
            </div>
          </div>
        )}

        {isTierA && !isHealthy && (
          <div className="mt-3 flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-2.5 rounded-xl relative z-10">
            <span className="text-base">🛡️</span>
            <p className="text-blue-300 text-xs font-semibold">Priority crop — early treatment protects your seasonal yield.</p>
          </div>
        )}

        {isTierB && !isHealthy && (severity === 'moderate' || severity === 'severe') && (
          <div className="mt-3 flex items-start gap-2 bg-purple-500/10 border border-purple-400/20 px-4 py-2.5 rounded-xl relative z-10">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-purple-300 text-xs font-semibold">Carbon Asset Risk: This perennial tree is a registered carbon asset — timely treatment protects long-term carbon stock value.</p>
          </div>
        )}
      </div>

      {/* Treatment Plan Card */}
      <div className="fade-in-up bg-white/5 border border-white/10 rounded-[24px] p-5 relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#CCFF00]/5 blur-2xl rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ClipboardList className="w-4.5 h-4.5 text-[#CCFF00]" size={16} />
              <h3 className="text-lg font-extrabold text-[#CCFF00] tracking-tight">Treatment Plan / চিকিৎসা পরিকল্পনা</h3>
            </div>
            <p className="text-white/40 text-[11px] ml-6">Follow these steps in order for best results</p>
          </div>
          <button
            onClick={() => playBanglaVoice(voiceText)}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#CCFF00]/30 hover:bg-white/10 text-[#CCFF00] transition-colors"
            aria-label="Play voice instructions"
          >
            {isPlaying ? <VolumeX className="w-4.5 h-4.5" size={18} /> : <Volume2 className="w-4.5 h-4.5" size={18} />}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 relative z-10" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#CCFF00] text-black shadow-[0_2px_10px_rgba(204,255,0,0.2)]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative z-10 space-y-3">
          {(TABS.find(t => t.id === activeTab)?.items || []).map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 ${
                activeTab === 'immediate' ? 'bg-red-400/20 text-red-400' :
                activeTab === 'organic' ? 'bg-[#CCFF00]/15 text-[#CCFF00]' :
                activeTab === 'chemical' ? 'bg-blue-400/15 text-blue-400' :
                'bg-purple-400/15 text-purple-400'
              }`}>
                {idx + 1}
              </div>
              <p className="text-white/85 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        {/* DAE Disclaimer — no AI mention */}
        <div className="mt-5 flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5 relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#CCFF00]/70 shrink-0 mt-0.5" />
          <p className="text-white/40 text-[11px] leading-relaxed">
            For chemical applications, always follow label instructions and consult your nearest{' '}
            <span className="text-[#CCFF00]/70 font-semibold">Department of Agricultural Extension (DAE)</span>{' '}
            office. Doses may vary by crop variety and regional conditions.
          </p>
        </div>
      </div>

      {/* Weather Risk */}
      {weather_risk && (
        <div className="fade-in-up bg-blue-500/10 border border-blue-400/25 p-4 rounded-2xl flex items-start gap-3" style={{ animationDelay: '0.2s' }}>
          <ThermometerSun className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-300 text-sm mb-1">Weather Risk / আবহাওয়া সতর্কতা</h3>
            <p className="text-blue-200/75 text-sm leading-relaxed">{weather_risk.summary_bn}</p>
            {weather_risk.risk_index && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full transition-all" style={{ width: `${Math.min(100, weather_risk.risk_index * 10)}%` }} />
                </div>
                <span className="text-blue-300 text-xs font-bold">{weather_risk.risk_index}/10</span>
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
    <div className="pt-24 pb-20 px-4 max-w-lg mx-auto min-h-screen flex flex-col space-y-5">
      {mainResultContent}
    </div>
  );
};

export default DiagnosisResult;
