export const RICE_POTATO_TREATMENTS = {
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
  }
};
