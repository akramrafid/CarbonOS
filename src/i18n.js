import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        platform: "Platform",
        farmersAi: "Farmers AI",
        marketplace: "Marketplace",
        sectors: "Sectors",
        howItWorks: "How It Works",
        framework: "Framework",
        registry: "Registry",
        pricing: "Pricing",
        live: "BD REGISTRY: LIVE",
        requestDemo: "[Request Demo]"
      },
      howItWorks: {
        tag: "EDUCATION",
        title: "How CarbonOS Works",
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
        award1: "Gov Framework 2026",
        award2: "VVB Accredited",
        award3: "Article 6 Aligned"
      },
      footer: {
        ctaTitle: "Ready to Scale Bangladesh's Green Infrastructure?",
        ctaSubtext: "Explore how CarbonOS helps organizations plan, manage, and verify green projects across the country.",
        ctaButton: "Explore Platform",
        copyright: "Copyright 2026 CarbonOS BD",
        rights: "All Rights Reserved"
      }
    }
  },
  bn: {
    translation: {
      nav: {
        platform: "প্ল্যাটফর্ম",
        farmersAi: "ফার্মার্স এআই",
        marketplace: "মার্কেটপ্লেস",
        sectors: "খাতসমূহ",
        howItWorks: "কিভাবে কাজ করে",
        framework: "ফ্রেমওয়ার্ক",
        registry: "রেজিস্ট্রি",
        pricing: "মূল্যতালিকা",
        live: "বিডি রেজিস্ট্রি: লাইভ",
        requestDemo: "[ডেমো অনুরোধ করুন]"
      },
      howItWorks: {
        tag: "শিক্ষামূলক",
        title: "কার্বনওএস কিভাবে কাজ করে",
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
        award1: "সরকারী ফ্রেমওয়ার্ক ২০২৬",
        award2: "ভিভিবি স্বীকৃত",
        award3: "আর্টিকেল ৬ সামঞ্জস্যপূর্ণ"
      },
      footer: {
        ctaTitle: "বাংলাদেশের সবুজ অবকাঠামো সম্প্রসারণ করতে প্রস্তুত?",
        ctaSubtext: "কার্বনওএস কীভাবে সংস্থাগুলোকে সারা দেশে সবুজ প্রকল্পগুলির পরিকল্পনা, পরিচালনা এবং যাচাই করতে সহায়তা করে তা জানুন।",
        ctaButton: "প্ল্যাটফর্ম এক্সপ্লোর করুন",
        copyright: "কপিরাইট ২০২৬ কার্বনওএস বিডি",
        rights: "সর্বস্বত্ব সংরক্ষিত"
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
