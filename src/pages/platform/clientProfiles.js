/**
 * CarbonZero BD - Corporate Client Profiles Registry
 * Contains multi-tenant configuration, baseline operational data,
 * sector classifications, and sample utility invoices for all 7 active corporate clients.
 */

export const CLIENT_PROFILES = [
  {
    id: "revoo-ev",
    name: "Revoo EV",
    legalName: "Revoo Electric Vehicles Bangladesh Ltd.",
    logo: "/Reevo.svg",
    website: "https://www.revoo-ev.com.bd/",
    sector: "Clean Electric Mobility",
    category: "mobility",
    headquarters: "Gazipur Industrial Zone, Dhaka",
    founded: "2021",
    reportingStandard: "GHG Protocol & UNEP Electric Mobility",
    assignedAuditor: "Md. Aminul Islam • Senior Fleet Decarbonization Lead",
    facilities: [
      { name: "Central EV Assembly Plant", location: "Gazipur", type: "Manufacturing & R&D" },
      { name: "Lithium Battery Testing Lab", location: "Tejgaon, Dhaka", type: "Testing Hub" },
      { name: "Fast-Charging Network Depot 01", location: "Uttara, Dhaka", type: "Charging Hub" }
    ],
    baselineInputs: {
      diesel: "1200",         // Minimal captive generator backup
      petrol: "800",          // Service rescue vans
      lpg: "450",
      electricity: "142000",  // Assembly lines, battery cell formation & pack charging
      employees: "165",       // Engineers, assembly technicians, field staff
      airTravel: "28000",     // International supplier procurement trips
      truckTransport: "46000",// Battery pack & chassis freight from port
      rawMaterials: "420"     // Aluminum alloys, copper, motor coils
    },
    sustainabilityHighlight: "100% Tailpipe Zero-Emission Electric 2-Wheeler & Fleet Telemetry Tracking",
    activeInsets: 850,
    creditVintage: "2026",
    sampleInvoiceName: "Revoo_EV_Assembly_DESCO_Substation_Bill.pdf",
    sampleInvoiceType: "Industrial High-Tension (HT-3) Power & Battery Charging"
  },
  {
    id: "govaly",
    name: "Govaly",
    legalName: "Govaly Technologies Bangladesh Ltd.",
    logo: "/govaly.png",
    website: "https://govaly.com.bd/",
    sector: "Corporate Travel Tech & Aviation",
    category: "travel",
    headquarters: "Gulshan-2, Dhaka",
    founded: "2020",
    reportingStandard: "ICAO CORSIA & IATA Carbon Offset Framework",
    assignedAuditor: "Farhana Ahmed, MBA • Aviation Scope 3 Lead",
    facilities: [
      { name: "Corporate HQ & Operations Suite", location: "Gulshan-2, Dhaka", type: "Commercial Office" },
      { name: "Regional Data Operations Hub", location: "Banani, Dhaka", type: "Server Facility" }
    ],
    baselineInputs: {
      diesel: "2400",         // Executive shuttle & building generator share
      petrol: "3200",         // Corporate fleet vehicles
      lpg: "350",
      electricity: "68000",   // Data servers, workstations, air conditioning
      employees: "85",        // Product managers, engineers, customer support
      airTravel: "340000",    // Primary business metric: Scope 3 Cat 6 passenger aviation flights
      truckTransport: "4500", // IT hardware shipments
      rawMaterials: "25"      // Paperless digital operations
    },
    sustainabilityHighlight: "AI Route Optimization & Direct SAF Aviation Carbon Offset Settlement",
    activeInsets: 1200,
    creditVintage: "2026",
    sampleInvoiceName: "Govaly_Corporate_Aviation_Travel_Manifest_Q2.pdf",
    sampleInvoiceType: "IATA Passenger Aviation Seat-Km & Airport Surcharge Manifest"
  },
  {
    id: "motorent",
    name: "MotoRent",
    legalName: "MotoRent Fleet Leasing & Mobility Services Ltd.",
    logo: "/Motorent.svg",
    website: "https://www.motorent.com.bd/",
    sector: "Two-Wheeler Rental & Fleet Leasing",
    category: "mobility",
    headquarters: "Dhanmondi, Dhaka",
    founded: "2019",
    reportingStandard: "ISO 14064-1 & Leased Asset GHG Protocol Scope 3 Cat 13",
    assignedAuditor: "Tanvir Rahman, CISA • Leased Assets GHG Specialist",
    facilities: [
      { name: "Central Maintenance & Fleet Hub", location: "Dhanmondi, Dhaka", type: "Depot & Workshop" },
      { name: "Chittagong Tourism Hub", location: "GEC Circle, Chittagong", type: "Rental Outpost" },
      { name: "Cox's Bazar Beach Coastal Hub", location: "Kolatoli, Cox's Bazar", type: "Rental Outpost" }
    ],
    baselineInputs: {
      diesel: "3600",         // Recovery flatbed trucks
      petrol: "18500",        // Test fuels, client delivery, rental fleet combustion
      lpg: "600",
      electricity: "42000",   // Workshop power, tools, EV scooter battery bank
      employees: "60",        // Fleet mechanics, logistics coordinators
      airTravel: "12000",
      truckTransport: "22000",// Inter-city motorcycle relocation transport
      rawMaterials: "80"      // Spare parts, tires, lubricants, helmets
    },
    sustainabilityHighlight: "Electric Fleet Transition Tracker & Rental Emission Offset Passports",
    activeInsets: 420,
    creditVintage: "2026",
    sampleInvoiceName: "MotoRent_Fleet_Fuel_Logistics_Padma_Oil_Invoice.pdf",
    sampleInvoiceType: "Commercial Fleet Fuel Waybill & Workshop Power"
  },
  {
    id: "east-delta-university",
    name: "East Delta University",
    legalName: "East Delta University (EDU) Campus Operations",
    logo: "/East Delta University.png",
    website: "https://www.eastdelta.edu.bd/",
    sector: "Higher Education & Sustainable Campus",
    category: "education",
    headquarters: "East Delta University Campus, Khulshi, Chittagong",
    founded: "2008",
    reportingStandard: "AASHE STARS & UN Race to Zero for Universities",
    assignedAuditor: "Dr. Kazi Mostafa • Director of Campus Environmental Sustainability",
    facilities: [
      { name: "Main Academic Complex & Labs", location: "Khulshi, Chittagong", type: "Academic Campus" },
      { name: "Student Innovation & Tech Hub", location: "Chittagong", type: "Research Lab" },
      { name: "Central Library & Auditorium", location: "Chittagong", type: "Community Facility" }
    ],
    baselineInputs: {
      diesel: "8400",         // Campus backup power & student bus diesel
      petrol: "2900",         // Administrative transport
      lpg: "1800",            // Campus cafeteria & faculty dining
      electricity: "210000",  // AC lecture theaters, computer clusters, labs
      employees: "320",       // Faculty, research assistants, administrative personnel
      airTravel: "48000",     // Academic research conferences
      truckTransport: "14000",// Lab equipment & campus supplies
      rawMaterials: "120"     // Paper, library books, lab chemicals, stationery
    },
    sustainabilityHighlight: "Net-Zero Campus Road-Map, Solar Rooftop Micro-Grid & Green Education",
    activeInsets: 1850,
    creditVintage: "2026",
    sampleInvoiceName: "EDU_Campus_BPDB_Chittagong_Solar_NetMeter_Bill.pdf",
    sampleInvoiceType: "High-Tension Institutional Utility Bill with Solar Net Metering"
  },
  {
    id: "schoolbus-bd",
    name: "SchoolBus BD",
    legalName: "SchoolBus Bangladesh Transit Technologies Ltd.",
    logo: "/School Bus.jpg",
    website: "https://schoolbus.com.bd/",
    sector: "Smart Student Transit & Fleet Logistics",
    category: "mobility",
    headquarters: "Mirpur DOHS, Dhaka",
    founded: "2022",
    reportingStandard: "GHG Protocol Scope 1 Fleet Standard & Clean Air Initiative",
    assignedAuditor: "Rezaul Karim • Municipal Transport Sustainability Auditor",
    facilities: [
      { name: "Central Fleet Depot & Service Garage", location: "Mirpur, Dhaka", type: "Fleet Yard" },
      { name: "Route Telemetry Dispatch Command", location: "DOHS, Dhaka", type: "Control Center" }
    ],
    baselineInputs: {
      diesel: "28500",        // 85 school buses operating daily double-shifts
      petrol: "1400",
      lpg: "850",
      electricity: "38000",   // Depot overnight security lights, battery maintenance
      employees: "140",       // Certified drivers, bus attendants, route safety officers
      airTravel: "6000",
      truckTransport: "9500", // Spare bus tires and engine components
      rawMaterials: "95"
    },
    sustainabilityHighlight: "Urban Route Optimization Displacing 2,400+ Daily Private Car School Trips",
    activeInsets: 620,
    creditVintage: "2026",
    sampleInvoiceName: "SchoolBus_BD_Meghna_Petroleum_Bulk_Diesel_Receipt.pdf",
    sampleInvoiceType: "Commercial Fleet Bulk Fuel Purchase & Dispatch Log"
  },
  {
    id: "ezygo-bd",
    name: "EzyGo BD",
    legalName: "EzyGo Urban Logistics & Mobility Ltd.",
    logo: "/ezygo.jpg",
    website: "https://www.ezygobd.com/",
    sector: "On-Demand Urban Logistics & Delivery",
    category: "mobility",
    headquarters: "Tejgaon I/A, Dhaka",
    founded: "2021",
    reportingStandard: "Smart Freight Centre GLEC Framework & Scope 3 Cat 4",
    assignedAuditor: "Sabbir Hossain • Urban Logistics GHG Lead",
    facilities: [
      { name: "Tejgaon Central Sorting Facility", location: "Tejgaon, Dhaka", type: "Fulfillment Center" },
      { name: "Chittagong Port Transit Hub", location: "Agrabad, Chittagong", type: "Logistics Hub" }
    ],
    baselineInputs: {
      diesel: "16400",        // Medium delivery vans & inter-district trucks
      petrol: "9200",         // Urban delivery 2-wheelers
      lpg: "750",
      electricity: "54000",   // Automated parcel sorting conveyors & dispatch
      employees: "190",       // Sorting staff, logistics coordinators, riders
      airTravel: "18000",
      truckTransport: "62000",// Inter-district hub-to-hub freight ton-km
      rawMaterials: "180"     // Corrugated cardboard boxes, recyclable mailers
    },
    sustainabilityHighlight: "Last-Mile Green Dispatch, Electric Cargo Trikes & Consolidated Delivery",
    activeInsets: 780,
    creditVintage: "2026",
    sampleInvoiceName: "EzyGo_Logistics_InterDistrict_Freight_Waybill.pdf",
    sampleInvoiceType: "Consolidated Freight Ton-Km & Logistics Hub Fuel Waybill"
  },
  {
    id: "polyjute-asia",
    name: "PolyJute Asia",
    legalName: "PolyJute Asia Eco-Materials Industries Ltd.",
    logo: "/polyjute.jpeg",
    website: "https://polyjute.asia/",
    sector: "Circular Bioplastics & Jute Packaging",
    category: "circular",
    headquarters: "Narayanganj & Dhaka",
    founded: "2020",
    reportingStandard: "ISO 14040 Life Cycle Assessment (LCA) & Ellen MacArthur Circularity",
    assignedAuditor: "Dr. Nabila Chowdhury • Circular Economy & Biopolymer LCA Specialist",
    facilities: [
      { name: "Narayanganj Jute Biopolymer Mill", location: "Narayanganj", type: "Manufacturing Facility" },
      { name: "Eco-Packaging Extrusion Works", location: "Narsingdi", type: "Processing Factory" },
      { name: "Corporate Sales & Export Office", location: "Motijheel, Dhaka", type: "Headquarters" }
    ],
    baselineInputs: {
      diesel: "9800",         // Backup captive generation during peak hours
      petrol: "1900",
      lpg: "3100",            // Thermoforming auxiliary heating
      electricity: "285000",  // High-capacity biopolymer extruders, loom weaving
      employees: "280",       // Mill workers, textile engineers, quality auditors
      airTravel: "42000",     // Export buyer meetings in Germany, UK, USA
      truckTransport: "88000",// Raw jute transport from Faridpur to mill, export to port
      rawMaterials: "950"     // Golden fiber raw jute, bio-starch, biodegradable additives
    },
    sustainabilityHighlight: "100% Biodegradable Jute Biopolymer Displacing Fossil-Fuel Plastics",
    activeInsets: 2400,
    creditVintage: "2026",
    sampleInvoiceName: "PolyJute_Mill_Karnaphuli_Gas_Boiler_Steam_Invoice.pdf",
    sampleInvoiceType: "Industrial Gas, Saturated Steam & WASA Effluent Treatment Statement"
  }
];

export const CLIENT_SECTORS = [
  { id: "all", label: "All Enterprise Clients", count: 7 },
  { id: "mobility", label: "Clean Mobility & Fleet", count: 4 },
  { id: "circular", label: "Circular Economy & Packaging", count: 1 },
  { id: "education", label: "Higher Education & Campus", count: 1 },
  { id: "travel", label: "Corporate Travel & Aviation", count: 1 }
];

export default CLIENT_PROFILES;
