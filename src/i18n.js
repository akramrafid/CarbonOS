import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        platform: "Platform",
        farmersAi: "Farmers AI",
        marketplace: "Marketplace",
        carbonCredit: "Carbon Credit",
        sectors: "Sectors",
        carbonRegistry: "Carbon Registry",
        framework: "Framework",
        registry: "Registry",
        pricing: "Pricing",
        esg: "ESG",
        live: "BD REGISTRY: LIVE",
        requestDemo: "[Request Demo]",
        mrvTelemetry: "MRV Telemetry",
        biomassHeatmap: "GIS Biomass Heatmap",
        carbonLedger: "Carbon Ledger",
        verification: "Audit & Verification",
        aiDetection: "AI Change Detection",
        onboarding: "Project Onboarding",
        saasAccounting: "SaaS Accounting",
        esgIntake: "ESG Bill Intake",
        sdgImpact: "SDG Impact",
        offtakeMarketplace: "Offtake Marketplace",
        cropHealth: "Crop Health AI",
        fieldCamera: "Field Camera",
        harvestguard: "HarvestGuard Coop",
        batchRegistration: "Batch Registration",
        riskMap: "Risk Map",
        mfsPayouts: "MFS Payouts",
        searchPlaceholder: "Search routes, tools, telemetry (⌘K)...",
        commandPalette: "Command Palette",
        quickActions: "Quick Actions",
        navigation: "Navigation",
        noResults: "No results found",
        notifications: "Notifications",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
        collapseSidebar: "Collapse sidebar (Ctrl+B)",
        expandSidebar: "Expand sidebar (Ctrl+B)",
        nationalMrv: "National MRV & Satellite",
        enterpriseEsg: "Enterprise & ESG",
        farmersAiTitle: "Farmer's AI & Field"
      },
      howItWorks: {
        tag: "EDUCATION",
        title: "How Carbon Zero BD Works",
        subtitle: "A simple, step-by-step guide from your farm to the national registry.",
        steps: [
          {
            title: "Step 1: The Sensor (IoT)",
            subtitle: "Like a digital scale for your farm.",
            description: "We install small devices (like water meters or solar trackers) that automatically count how much carbon you are saving by using green technology."
          },
          {
            title: "Step 2: The Network",
            subtitle: "Sending data to the cloud.",
            description: "These devices send the data securely to our central computer system using mobile networks, just like sending a secure SMS."
          },
          {
            title: "Step 3: The Brain (AI)",
            subtitle: "Calculating the carbon saved.",
            description: "Our AI checks the data against satellite pictures to make sure it's 100% accurate, then calculates your total official Carbon Credits."
          },
          {
            title: "Step 4: The Reward",
            subtitle: "Getting paid for saving the earth.",
            description: "Your credits are placed on the National Registry. International buyers purchase them, and the money is sent directly to your account!"
          }
        ]
      },
      hero: {
        title1: "Bangladesh's",
        title2: "Carbon Infrastructure",
        title3: "Operating System.",
        description: "Digitizing, scaling, and securing the National Carbon Market from farmer to global registry.",
        users: "90K+ Active Users",
        cta: "Access Registry",
        stat1Value: "10M+",
        stat1Label: "tCO₂e Reduced",
        stat2Value: "~0ms",
        stat2Label: "Data Reconciliation",
        award1: "GHG Protocol method",
        award2: "Dual control",
        award3: "Not externally assured"
      },
      footer: {
        ctaBadge: "CLIMATE INFRASTRUCTURE & DMRV",
        ctaTitle: "Ready to Scale Bangladesh's Green Infrastructure?",
        ctaSubtext: "Explore how Carbon Zero BD helps organizations plan, manage, and verify emission reduction projects across the country.",
        ctaButton: "Explore Platform",
        mission: "Digital Measurement, Reporting, and Verification (dMRV), corporate ESG accounting, and agricultural risk intelligence for Bangladesh.",
        copyrightEntity: "Carbon Zero BD (CarbonOS)",
        copyright: "Copyright 2026 Carbon Zero BD",
        rights: "All rights reserved.",
        backToTop: "Back to top",
        switchLanguage: "Switch language",
        toggleTheme: "Toggle theme",
        lightMode: "Light",
        darkMode: "Dark",
        columns: {
          platform: "Platform",
          resources: "Resources",
          company: "Company",
          legal: "Legal"
        },
        links: {
          mrvDashboard: "MRV Dashboard",
          carbonMonitoring: "GIS Biomass Heatmap",
          carbonRegistry: "Carbon Registry",
          esgWorkspace: "ESG Bill Intake",
          saasDashboard: "SaaS Accounting",
          marketplace: "Credit Marketplace",
          howItWorks: "How It Works",
          technology: "Technology & Telemetry",
          frameworkDocs: "Framework & Methodology",
          apiDocs: "Developer API Docs",
          farmersAi: "Farmers AI & HarvestGuard",
          sectorMethodologies: "Sector Methodologies",
          about: "About Carbon Zero BD",
          impact: "SDG Impact & Co-Benefits",
          projectOnboarding: "Project Onboarding",
          careers: "Careers",
          privacy: "Privacy Policy",
          terms: "Terms of Service",
          verificationWorkflow: "Verification & Audit Rules"
        }
      }
    }
  },
  bn: {
    translation: {
      nav: {
        platform: "প্ল্যাটফর্ম",
        farmersAi: "ফার্মার্স এআই",
        marketplace: "মার্কেটপ্লেস",
        carbonCredit: "কার্বন ক্রেডিট",
        sectors: "খাতসমূহ",
        carbonRegistry: "কার্বন রেজিস্ট্রি",
        framework: "ফ্রেমওয়ার্ক",
        registry: "রেজিস্ট্রি",
        pricing: "মূল্যতালিকা",
        esg: "ইএসজি (ESG)",
        live: "বিডি রেজিস্ট্রি: লাইভ",
        requestDemo: "[ডেমো অনুরোধ করুন]",
        mrvTelemetry: "এমআরভি টেলিমেট্রি",
        biomassHeatmap: "জিআইএস বায়োমাস হিটম্যাপ",
        carbonLedger: "কার্বন লেজার",
        verification: "অডিট ও যাচাইকরণ",
        aiDetection: "এআই পরিবর্তন শনাক্তকরণ",
        onboarding: "প্রকল্প নিবন্ধন",
        saasAccounting: "সাস অ্যাকাউন্টিং",
        esgIntake: "ইএসজি বিল ইনটেক",
        sdgImpact: "এসডিজি ইমপ্যাক্ট",
        offtakeMarketplace: "অফটেক মার্কেটপ্লেস",
        cropHealth: "ফসল স্বাস্থ্য এআই",
        fieldCamera: "ফিল্ড ক্যামেরা",
        harvestguard: "হার্ভেস্টগার্ড কোঅপারেটিভ",
        batchRegistration: "ব্যাচ নিবন্ধন",
        riskMap: "ঝুঁকি মানচিত্র",
        mfsPayouts: "এমএফএস পরিশোধ",
        searchPlaceholder: "রুট, টুলস, টেলিমেট্রি খুঁজুন (⌘K)...",
        commandPalette: "কমান্ড প্যালেট",
        quickActions: "দ্রুত অ্যাকশন",
        navigation: "নেভিগেশন",
        noResults: "কোন ফলাফল পাওয়া যায়নি",
        notifications: "বিজ্ঞপ্তি",
        accountSettings: "অ্যাকাউন্ট সেটিংস",
        signOut: "লগ আউট",
        collapseSidebar: "সাইডবার সঙ্কুচিত করুন (Ctrl+B)",
        expandSidebar: "সাইডবার প্রসারিত করুন (Ctrl+B)",
        nationalMrv: "জাতীয় এমআরভি ও স্যাটেলাইট",
        enterpriseEsg: "এন্টারপ্রাইজ ও ইএসজি",
        farmersAiTitle: "কৃষক এআই ও মাঠ পর্যায়"
      },
      howItWorks: {
        tag: "শিক্ষামূলক",
        title: "কার্বন জিরো বিডি কিভাবে কাজ করে",
        subtitle: "আপনার খামার থেকে জাতীয় রেজিস্ট্রি পর্যন্ত একটি সহজ নির্দেশিকা।",
        steps: [
          {
            title: "ধাপ ১: সেন্সর (IoT)",
            subtitle: "আপনার খামারের জন্য একটি ডিজিটাল স্কেলের মত।",
            description: "আমরা ছোট ডিভাইস (যেমন জলের মিটার বা সোলার ট্র্যাকার) ইনস্টল করি যা স্বয়ংক্রিয়ভাবে হিসাব করে সবুজ প্রযুক্তি ব্যবহার করে আপনি কতটা কার্বন সংরক্ষণ করছেন।"
          },
          {
            title: "ধাপ ২: নেটওয়ার্ক",
            subtitle: "ক্লাউডে ডেটা পাঠানো হচ্ছে।",
            description: "এই ডিভাইসগুলো মোবাইল নেটওয়ার্ক ব্যবহার করে আমাদের কেন্দ্রীয় কম্পিউটার সিস্টেমে নিরাপদে এই ডেটা পাঠায়, ঠিক একটি নিরাপদ এসএমএস পাঠানোর মতো।"
          },
          {
            title: "ধাপ ৩: মস্তিষ্ক (AI)",
            subtitle: "সংরক্ষিত কার্বনের হিসাব করা হচ্ছে।",
            description: "আমাদের এআই স্যাটেলাইটের ছবির সাথে ডেটা মিলিয়ে দেখে তা শতভাগ সঠিক কিনা, তারপর আপনার মোট অফিসিয়াল কার্বন ক্রেডিটের হিসাব করে।"
          },
          {
            title: "ধাপ ৪: পুরস্কার",
            subtitle: "পৃথিবীকে বাঁচানোর জন্য অর্থ প্রদান করা হচ্ছে।",
            description: "আপনার ক্রেডিটগুলো জাতীয় রেজিস্ট্রিতে রাখা হয়। আন্তর্জাতিক ক্রেতারা এগুলো কিনে নেয় এবং টাকা সরাসরি আপনার অ্যাকাউন্টে পাঠানো হয়!"
          }
        ]
      },
      hero: {
        title1: "বাংলাদেশের",
        title2: "কার্বন অবকাঠামো",
        title3: "অপারেটিং সিস্টেম।",
        description: "কৃষক থেকে শুরু করে বিশ্ব রেজিস্ট্রি পর্যন্ত জাতীয় কার্বন মার্কেটকে ডিজিটাইজ, স্কেল এবং সুরক্ষিত করা।",
        users: "৯০ হাজার+ সক্রিয় ব্যবহারকারী",
        cta: "রেজিস্ট্রি অ্যাক্সেস করুন",
        stat1Value: "১০ মিলিয়ন+",
        stat1Label: "tCO₂e হ্রাস করা হয়েছে",
        stat2Value: "~০ মি.সে.",
        stat2Label: "ডেটা সমন্বয় বিলম্ব",
        award1: "GHG প্রোটোকল পদ্ধতি",
        award2: "দ্বৈত নিয়ন্ত্রণ",
        award3: "বাহ্যিকভাবে নিরীক্ষিত নয়"
      },
      footer: {
        ctaBadge: "জলবায়ু অবকাঠামো ও ডিএমআরভি",
        ctaTitle: "বাংলাদেশের সবুজ অবকাঠামো সম্প্রসারণ করতে প্রস্তুত?",
        ctaSubtext: "কার্বন জিরো বিডি কীভাবে সংস্থাগুলোকে সারা দেশে কার্বন নিঃসরণ হ্রাস প্রকল্পের পরিকল্পনা, পরিচালনা এবং যাচাই করতে সহায়তা করে তা জানুন।",
        ctaButton: "প্ল্যাটফর্ম এক্সপ্লোর করুন",
        mission: "বাংলাদেশের জন্য ডিজিটাল পরিমাপ, প্রতিবেদন ও যাচাইকরণ (dMRV), কর্পোরেট ইএসজি (ESG) হিসাবরক্ষণ এবং কৃষি ঝুঁকি বুদ্ধিমত্তা।",
        copyrightEntity: "কার্বন জিরো বিডি (CarbonOS)",
        copyright: "কপিরাইট ২০২৬ কার্বন জিরো বিডি",
        rights: "সর্বস্বত্ব সংরক্ষিত।",
        backToTop: "উপরে ফিরে যান",
        switchLanguage: "ভাষা পরিবর্তন করুন",
        toggleTheme: "থিম পরিবর্তন করুন",
        lightMode: "লাইট",
        darkMode: "ডার্ক",
        columns: {
          platform: "প্ল্যাটফর্ম",
          resources: "রিসোর্স ও ডকুমেন্টেশন",
          company: "প্রতিষ্ঠান",
          legal: "আইনি ও নীতিমালা"
        },
        links: {
          mrvDashboard: "এমআরভি ড্যাশবোর্ড",
          carbonMonitoring: "জিআইএস বায়োমাস হিটম্যাপ",
          carbonRegistry: "কার্বন রেজিস্ট্রি",
          esgWorkspace: "ইএসজি বিল ইনটেক",
          saasDashboard: "সাস অ্যাকাউন্টিং",
          marketplace: "ক্রেডিট মার্কেটপ্লেস",
          howItWorks: "কিভাবে কাজ করে",
          technology: "প্রযুক্তি ও টেলিমেট্রি",
          frameworkDocs: "ফ্রেমওয়ার্ক ও পদ্ধতি",
          apiDocs: "ডেভেলপার এপিআই ডকস",
          farmersAi: "ফার্মার্স এআই ও হার্ভেস্টগার্ড",
          sectorMethodologies: "খাতভিত্তিক পদ্ধতিসমূহ",
          about: "কার্বন জিরো বিডি সম্পর্কে",
          impact: "এসডিজি ইমপ্যাক্ট ও সুফল",
          projectOnboarding: "প্রকল্প নিবন্ধন",
          careers: "ক্যারিয়ার",
          privacy: "গোপনীয়তা নীতি",
          terms: "ব্যবহারের শর্তাবলী",
          verificationWorkflow: "যাচাইকরণ ও অডিট নিয়মাবলী"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
