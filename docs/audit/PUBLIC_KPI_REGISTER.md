# Public KPI register: homepage, marketplace, satellite MRV

Every numeric KPI shown on these pages, with its source. **No number here has been changed**: changing marketing
numbers needs the owner's decision. "None found" means the value is a literal in the source file and no data
source, calculation or document backs it.

Method: `kpi_scan` over the rendered JSX (class names and styles stripped), then a manual pass for values whose
unit sits in a neighbouring element. Animation percentages, CSS values and colours are excluded. Line numbers are at
the commit that adds this file.

## Homepage (`/`, `src/pages/Home.jsx`)

| Where | Value shown | Claim | Source |
|---|---|---|---|
| Hero.jsx:156 | 97% | "Direct payout" | None found |
| Hero.jsx:175 | 1M+ | Smallholder farmers in the pipeline | None found |
| Hero.jsx:240 | 42ms | "Consensus" latency | None found |
| Hero.jsx:254 | 10.42M tCO₂e | Total reduction | None found |
| Hero.jsx:257 | +18.4% YoY | Growth of the total above | None found |
| Hero.jsx:264, :267 | 97.0%, ৳412.8M | Farmer remittance via bKash / Nagad | None found |
| Hero.jsx:279 | 42,850 tCO₂e | Live liquidity available for settlement | None found |
| Hero.jsx:292 | ৳14,920 per t | Average clearing price ("indicative spot reference") | None found |
| Hero.jsx:26 | 1,200 tCO₂e at ৳15,000/t; ৳17.46M to 410 wallets | "Real-time settlement feed" entry | None found (hardcoded list, rotates on a timer) |
| Hero.jsx:27 | 3,500 tCO₂e; NDVI 0.82 | Feed entry | None found |
| Hero.jsx:28 | 800 tCO₂e | Feed entry | None found |
| Hero.jsx:29 | 2,400 tCO₂e; 99.8% | Feed entry (sensor consensus) | None found |
| TrustBar.jsx:11 | 97% | "Instant settlement rail" | None found |
| ClientShowcase.jsx:132 (data: `src/pages/platform/clientProfiles.js`) | 850, 1,200, 420, 1,850, 620, 780, 2,400 tCO₂e … | Offsets per named company (Revoo EV, Govaly, MotoRent, East Delta University, SchoolBus BD, EzyGo BD, PolyJute Asia, …) | None found. The companies are named as clients; no agreement or record backs the figures |
| ClientShowcase.jsx:236 | 24 hours | Enterprise onboarding time | None found |
| LiveMetrics.jsx:8–60 | Temperature, humidity, air quality, CO₂ ppm per station | Live IoT telemetry | Blynk device API when `VITE_BLYNK_AUTH_TOKEN` is set; otherwise the hardcoded `mockData` |
| PlatformModules.jsx:62 | 99.9% | "Verified credits" | None found |
| CorporateSaaSPipeline.jsx:540, :550, :560 | 42t, 88t, 23t | Pipeline animation figures | None found |
| SectorFocus.jsx:20, :21 | 1M+ smallholders; 850,000 tCO₂e/yr | Solar irrigation market | None found |
| SectorFocus.jsx:33, :34 | 38% methane cut; 2.10M tCO₂e/yr | AWD rice market | None found |
| SectorFocus.jsx:47, :60, :73, :86 | 400,000; 600,000; 1.20M; 780,000 tCO₂e/yr | Market size per sector | None found |
| Pricing.jsx:59 | 20% | Annual billing saving | Price list (internal decision, not a measured KPI) |
| Pricing.jsx:84, :89 | ৳40,000 / ৳50,000 per month; ৳4,80,000 per year | Tier price | Price list |
| Pricing.jsx:155, :160 | ৳1,20,000 / ৳1,50,000 per month; ৳14,40,000 per year (save ৳3,60,000) | Tier price | Price list |
| Pricing.jsx:242, :274 | 99.98% | Uptime / SLA | None found (no SLA document in the repo) |

## Marketplace (`/platform/marketplace`)

| Where | Value shown | Claim | Source |
|---|---|---|---|
| MarketplaceBrowse.jsx:61–470 | 18 listings: `tonnage`, `pricePerTonne` (৳), `price` (৳), vintage, SDGs, GPS coordinates | Credits for sale | None found: hardcoded demo array |
| MarketplaceBrowse.jsx:122–431 | 99.2% uptime; 85%, 40%, 60%, 35%, 45%, 30% co-benefits | Per-listing telemetry and co-benefits | None found |
| MarketplaceBrowse.jsx:597, :607, :679, :968, :1034 | 97% | Direct farmer liquidity / remittance rate | None found |
| MarketplaceBrowse.jsx:636–641 | ৳1,450, ৳1,820, ৳1,250, ৳980, ৳1,320, ৳1,100 per t; +2.4%, +3.8%, +1.5%, −0.4%, +1.9%, +0.8% | Price ticker | None found |
| MarketplaceBrowse.jsx:656 | 84,250 tCO₂e | Listed inventory | None found |
| MarketplaceBrowse.jsx:665 | ৳1,420 | Average clean settlement price | None found |
| MarketplaceBrowse.jsx:678 | ৳112.4M | Direct farmer disbursal | None found |
| MarketplaceBrowse.jsx:843 | 0.1 tCO₂e | Minimum purchase | Product rule (not a KPI) |
| PurchaseConfirmModal.jsx:71, :207, :399, :528, :578, :676 | 97% / 3% | Farmer share and platform fee | Computed from the listing price × 0.97 (the listing price itself: none found) |
| CheckoutModal.jsx:53, :54, :70 | 0% fee, ৳0, **92%** to the farmer | Checkout split | None found. Inconsistent with the 97% shown everywhere else |
| Marketplace.jsx:27, :38 | ৳1,450 and ৳950 per tCO₂e | Listing prices | None found (this page is not routed; `/platform/marketplace` renders MarketplaceBrowse) |

## Satellite MRV (`/carbon-monitoring`) and MRV dashboard (`/platform/mrv-dashboard`)

| Where | Value shown | Claim | Source |
|---|---|---|---|
| CarbonMonitoring.jsx headline cards (≈1800–2010) | 112.5 tC/ha; 450,000 tCO₂e; forest health 72.4; NDVI 0.724; biomass 236.8 Mg/ha; 3,800.5 ha; confidence 91% | Project carbon stock | `GET /api/carbon/dashboard` (aggregates `CarbonResult` rows; `forest_change_percent` is a hardcoded mock there). With no rows or no API, the hardcoded `DEFAULT_DASHBOARD_DATA` (CarbonMonitoring.jsx:468) is shown |
| CarbonMonitoring.jsx:285–294 | 11 quarters of NDVI, biomass, carbon, baseline and cloud cover | Quarterly telemetry | None found: hardcoded dataset |
| CarbonMonitoring.jsx:1823 | ±4.2% | Uncertainty | None found (literal) |
| CarbonMonitoring.jsx:2579, :2584 | +18.4% YoY; reserve 18.5% | Net delta and reserve | None found |
| CarbonMonitoring.jsx:2156, :1255 | 18% | AFOLU risk buffer withheld | Hardcoded parameter `bufferPct = 18.0`; no project risk assessment backs it |
| CarbonMonitoring.jsx:2198 | 5.1% | Relative margin of error (fallback) | API field `relative_margin_of_error`, else the literal 5.1 |
| CarbonMonitoring.jsx:3015, :3023, :3551, :3684 | 15% cap; 35% target | Thresholds | Methodology parameters as coded (VM0047 15% precision cap; 35% screening width); not KPIs |
| CarbonMonitoring.jsx:3812, :3828, :4536 | 3,800 ha Sundarbans; 5,420 ha Chittagong HT | Project areas | None found |
| CarbonMonitoring.jsx:697, :1596 | 94% | Model confidence | None found |
| MRVDashboard.jsx:681, :682 | +2.1 tCO₂e; +0.4 tCO₂e | Node log entries | None found |

## Also found while compiling this list (not changed; owner decision)

* MarketplaceBrowse.jsx listings carry a farmer name and a bKash number that looks real (e.g. `01712-984521`).
  If it is someone's number, it is personal data on a public page.
* `VITE_BLYNK_AUTH_TOKEN` is bundled into the public JavaScript by design of `VITE_` variables. A device-cloud
  token in the client bundle is readable by anyone.
* The client showcase names real companies with offset figures and links to their sites.
