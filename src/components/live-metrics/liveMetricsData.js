export const STATIONS = [
  {
    id: 'khulna',
    name: 'Khulna Solar Cluster #04',
    location: 'Paikgachha, Khulna (22.58° N, 89.33° E)',
    type: 'Solar Irrigation & Grid Feed',
    hardware: 'NodeMCU ESP8266EX • DHT22 • MQ-135',
    isLiveFeed: true,
    protocol: 'CarbonOS MRV-2026/049 (internal)',
    baselineCo2: 418,
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans Blue Carbon #12',
    location: 'Karamjal Coastal Tower (22.25° N, 89.58° E)',
    type: 'Mangrove Carbon Flux & Biomass',
    hardware: 'IoT LoRaWAN Eddy Covariance Tower',
    isLiveFeed: false,
    mockData: { temp: 28.4, hum: 84.2, air: 48, co2: 395 },
    protocol: 'Verra VM0033 Blue Carbon',
    baselineCo2: 412,
  },
  {
    id: 'rangpur',
    name: 'Rangpur AWD Field #07',
    location: 'Mithapukur, Rangpur (25.58° N, 89.28° E)',
    type: 'Alternate Wetting & Drying (Rice Methane)',
    hardware: 'Telemetry Soil Chamber & Water Loggers',
    isLiveFeed: false,
    mockData: { temp: 31.2, hum: 71.5, air: 82, co2: 445 },
    protocol: 'UNFCCC AMS-III.AU (reference)',
    baselineCo2: 420,
  },
  {
    id: 'dhaka',
    name: 'Dhaka Industrial CEMS #02',
    location: 'Tejgaon Light Industrial (23.76° N, 90.39° E)',
    type: 'Continuous Emission Monitoring (CEMS)',
    hardware: 'NDIR Flue Gas Optical Sensor Array',
    isLiveFeed: false,
    mockData: { temp: 34.6, hum: 62.0, air: 185, co2: 680 },
    protocol: 'Illustrative sensor feed (not a regulatory baseline)',
    baselineCo2: 430,
  }
];

export const AIR_GOOD_MAX = 250;
export const AIR_WARN_MAX = 450;
// [COMMENTED OUT FOR PERSONAL REFERENCE — 5000 ppm is the OSHA 8-hour hazardous PEL, not "AMBIENT OPTIMAL"]
// export const CO2_GOOD_MAX = 5000;
// export const CO2_WARN_MAX = 10000;
export const CO2_GOOD_MAX = 1000;
export const CO2_WARN_MAX = 2000;

export const getAirStatus = (raw) => {
  if (raw === null || isNaN(raw)) return { text: "STANDBY", badge: "bg-mist/10 text-mist border-mist/20", tone: "neutral" };
  if (raw <= AIR_GOOD_MAX) return { text: "PRISTINE (GOOD)", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", tone: "good" };
  if (raw <= AIR_WARN_MAX) return { text: "MODERATE", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", tone: "warning" };
  return { text: "ELEVATED CONC.", badge: "bg-rose-500/10 text-rose-400 border-rose-500/30", tone: "danger" };
};

export const getCO2Status = (raw) => {
  if (raw === null || isNaN(raw)) return { text: "CALIBRATING", badge: "bg-mist/10 text-mist border-mist/20" };
  if (raw <= CO2_GOOD_MAX) return { text: "AMBIENT OPTIMAL", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  if (raw <= CO2_WARN_MAX) return { text: "ATTENTION THRESHOLD", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
  return { text: "HIGH DENSITY", badge: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
};
