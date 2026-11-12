export const FRUIT_ORCHARD_TREATMENTS = {
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

  /* ── UNIVERSAL HEALTHY & SPECIALIZED ── */
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
