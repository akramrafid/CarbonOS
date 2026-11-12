"""
Generate tests/fixtures/rag_eval_paraphrase_review.json with >= 40 English and >= 40 Bengali
paraphrase questions marked needs_human_review: true across all 5 corpus topics.
"""
import json
from pathlib import Path

FIXTURE_PATH = Path("tests/fixtures/rag_eval_paraphrase_review.json")

# 40 English Paraphrase Questions
en_questions = [
    # Topic 1: GHG Protocol Standards (8 questions)
    ("Under corporate carbon guidelines, what test decides whether an asset falls under operational control?", "ghg_protocol_standards.md"),
    ("How does the GHG Protocol differentiate direct stationary fuel emissions from purchased energy impacts?", "ghg_protocol_standards.md"),
    ("When an entity holds equity in a subsidiary without operational management, which consolidation approach is required?", "ghg_protocol_standards.md"),
    ("What are the two mandatory calculation methodologies required for Scope 2 electricity accounting?", "ghg_protocol_standards.md"),
    ("Why does the GHG Protocol prohibit netting offsite exported renewable electricity against Scope 2 totals?", "ghg_protocol_standards.md"),
    ("Which greenhouse gas inventory scope covers company-owned diesel forklifts and factory standby generators?", "ghg_protocol_standards.md"),
    ("Under dual-reporting rules, which Scope 2 figure reflects physical grid carbon intensity versus supplier contracts?", "ghg_protocol_standards.md"),
    ("Can a corporation retroactively alter historical base year emissions without formal threshold recalculation?", "ghg_protocol_standards.md"),

    # Topic 2: Bangladesh Climate & Regulatory (8 questions)
    ("What percentage reduction in greenhouse gases did Bangladesh pledge unconditionally under its NDC by 2030?", "bangladesh_climate_regulatory.md"),
    ("Under the Environmental Conservation Rules 2023, which risk category includes industrial textile dyeing and wet processing?", "bangladesh_climate_regulatory.md"),
    ("What governmental authority is tasked with issuing environmental clearance certificates to manufacturing facilities in Dhaka?", "bangladesh_climate_regulatory.md"),
    ("Which national policy framework articulates Bangladesh's goal of transitioning from climate vulnerability to resilience by 2050?", "bangladesh_climate_regulatory.md"),
    ("Under ECR 2023, what is the validity duration for an Environmental Clearance Certificate for Red category plants?", "bangladesh_climate_regulatory.md"),
    ("What sectoral mitigation measures are prioritized in Bangladesh's updated climate action commitments for the industrial energy sector?", "bangladesh_climate_regulatory.md"),
    ("How does the 2023 environmental regulatory schedule classify captive natural gas power plants versus small diesel sets?", "bangladesh_climate_regulatory.md"),
    ("What conditional emission reduction target did Bangladesh propose contingent on international climate finance?", "bangladesh_climate_regulatory.md"),

    # Topic 3: BD Grid Emission Factor Methodology (8 questions)
    ("Why is the Clean Development Mechanism combined margin factor unsuitable for corporate Scope 2 reporting in Bangladesh?", "bd_grid_methodology.md"),
    ("In the national grid factor estimation, how does Method A derive total fuel carbon from energy balances?", "bd_grid_methodology.md"),
    ("What statistical threshold is required between Method A and Method B before a national grid factor is eligible for review?", "bd_grid_methodology.md"),
    ("Why must captive industrial generators be removed when calculating the public utility average grid factor?", "bd_grid_methodology.md"),
    ("What primary data sources from Petrobangla and BPDB supply the generation inputs for the grid emission model?", "bd_grid_methodology.md"),
    ("How are cross-border electricity imports from Indian interconnectors accounted for in the Bangladesh grid mix?", "bd_grid_methodology.md"),
    ("What uncertainty assessment technique is applied to determine confidence intervals for the grid emission factor?", "bd_grid_methodology.md"),
    ("Under what condition does an unexplained discrepancy between generation methods cause a provisional factor to remain in draft status?", "bd_grid_methodology.md"),

    # Topic 4: IPCC 2006 Stationary Combustion & AR6 GWP (8 questions)
    ("What are the default net calorific values and carbon content factors for natural gas in IPCC Tier 1 stationary combustion?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("Under the IPCC Sixth Assessment Report (AR6), what is the 100-year Global Warming Potential for methane compared to CO2?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("How does the IPCC guidance distinguish Tier 1 default emission factors from Tier 2 country-specific fuel specifications?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("What is the AR6 100-year GWP value assigned to nitrous oxide in combustion inventory calculations?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("In stationary combustion accounting, why is biogenic CO2 reported as an informational memo rather than within Scope 1 totals?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("What conversion equation relates fuel volume in cubic meters to gigajoules using higher versus lower heating values?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("What default emission factors does IPCC 2006 provide for heavy fuel oil (HFO) combustion in industrial boilers?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("Why is standard temperature and pressure normalization essential when converting gaseous fuel volume to mass basis?", "ipcc_2006_combustion_and_ar6_gwp.md"),

    # Topic 5: Dexterity Textiles Demo Facility (8 questions)
    ("What are the primary production units and registered operational facilities at Dexterity Textiles in Gazipur?", "dexterity_textiles_demo.md"),
    ("Which natural gas utility company supplies the main pipeline feed to Dexterity Textiles manufacturing complex?", "dexterity_textiles_demo.md"),
    ("What is the sanctioned electrical load and utility feeder category for Dexterity's spinning division?", "dexterity_textiles_demo.md"),
    ("How does Dexterity Textiles record monthly fuel oil intake for its backup steam boilers?", "dexterity_textiles_demo.md"),
    ("What refrigerant gas is utilized in the factory's industrial air conditioning chillers at the spinning plant?", "dexterity_textiles_demo.md"),
    ("What was Dexterity Textiles' audited Scope 1 natural gas consumption during the baseline reporting year?", "dexterity_textiles_demo.md"),
    ("Which distribution company provides high-tension electrical connection to Dexterity's Gazipur plant?", "dexterity_textiles_demo.md"),
    ("How does Dexterity track electricity meter multipliers when verifying utility billing records for carbon accounting?", "dexterity_textiles_demo.md")
]

# 40 Bengali Paraphrase Questions
bn_questions = [
    # Topic 1: GHG Protocol Standards (8 questions)
    ("কর্পোরেট কার্বন হিসাবরক্ষণ পদ্ধতিতে অপারেশনাল কন্ট্রোল এবং ফিনান্সিয়াল কন্ট্রোলের মধ্যে মূল পার্থক্য কী?", "ghg_protocol_standards.md"),
    ("জিএইচজি প্রটোকল অনুযায়ী প্রতিষ্ঠানের নিজস্ব বিদ্যুৎ জেনারেটরের জ্বালানি কোন স্কোপের অন্তর্ভুক্ত?", "ghg_protocol_standards.md"),
    ("স্কোপ ২ বিদ্যুৎ হিসাবের ক্ষেত্রে লোকেশন-বেসড এবং মার্কেট-বেসড পদ্ধতির দ্বৈত রিপোর্টিং কেন বাধ্যতামূলক?", "ghg_protocol_standards.md"),
    ("কোনো কোম্পানি সৌর বিদ্যুৎ জাতীয় গ্রিডে রপ্তানি করলে তা কি স্কোপ ২ এর মোট হিসাব থেকে বাদ দেওয়া যায়?", "ghg_protocol_standards.md"),
    ("একটি সহযোগী প্রতিষ্ঠানে আর্থিক বিনিয়োগ থাকলে কিন্তু পরিচালন ক্ষমতা না থাকলে কোন পদ্ধতিতে কার্বন হিসাব করতে হয়?", "ghg_protocol_standards.md"),
    ("প্রতিষ্ঠানের সীমানা নির্ধারণের ক্ষেত্রে ইক্যুইটি শেয়ার পদ্ধতির নিয়ম কী?", "ghg_protocol_standards.md"),
    ("বায়োজেনিক বা জৈব জ্বালানির নির্গমন কি সরাসরি স্কোপ ১ এ যোগ করা হয় নাকি আলাদা মেমো হিসেবে রাখতে হয়?", "ghg_protocol_standards.md"),
    ("ভিত্তি বছরের নির্গমন তথ্য কখন বা কোন পরিস্থিতিতে পুনরায় গণনা করা আবশ্যক?", "ghg_protocol_standards.md"),

    # Topic 2: Bangladesh Climate & Regulatory (8 questions)
    ("বাংলাদেশের হালনাগাদ এনডিসিতে (NDC) ২০৩০ সালের মধ্যে নিজস্ব অর্থায়নে কতটা নির্গমন কমানোর প্রতিশ্রুতি রয়েছে?", "bangladesh_climate_regulatory.md"),
    ("পরিবেশ সংরক্ষণ বিধিমালা ২০২৩ অনুসারে টেক্সটাইল ডাইং ও ওয়াশিং কারখানা কোন পরিবেশগত শ্রেণিতে পড়ে?", "bangladesh_climate_regulatory.md"),
    ("লাল শ্রেণির শিল্প কারখানার জন্য পরিবেশ ছাড়পত্রের মেয়াদ কত বছর নির্ধারণ করা হয়েছে?", "bangladesh_climate_regulatory.md"),
    ("মুজিব জলবায়ু সমৃদ্ধি পরিকল্পনার মূল লক্ষ্য এবং দৃষ্টিভঙ্গি কী?", "bangladesh_climate_regulatory.md"),
    ("বাংলাদেশে শিল্প প্রতিষ্ঠানের পরিবেশ ছাড়পত্র ইস্যু করার দায়িত্বপ্রাপ্ত সরকারি সংস্থা কোনটি?", "bangladesh_climate_regulatory.md"),
    ("২০২৩ সালের পরিবেশ বিধিমালার অধীনে ক্যাপটিভ বিদ্যুৎ কেন্দ্রগুলোকে কীভাবে শ্রেণিবদ্ধ করা হয়েছে?", "bangladesh_climate_regulatory.md"),
    ("আন্তর্জাতিক আর্থিক ও প্রযুক্তিগত সহায়তা সাপেক্ষে বাংলাদেশ ২০৩০ সালের মধ্যে কত শতাংশ নির্গমন কমানোর লক্ষ্য নির্ধারণ করেছে?", "bangladesh_climate_regulatory.md"),
    ("শিল্প খাতের শক্তি দক্ষতা বৃদ্ধিতে জাতীয় কর্মপরিকল্পনায় কী কী ব্যবস্থা উল্লেখ করা হয়েছে?", "bangladesh_climate_regulatory.md"),

    # Topic 3: BD Grid Emission Factor Methodology (8 questions)
    ("কর্পোরেট স্কোপ ২ হিসাবের ক্ষেত্রে সিডিএম (CDM) কম্বাইন্ড মার্জিন পদ্ধতি কেন গ্রহণযোগ্য নয়?", "bd_grid_methodology.md"),
    ("বাংলাদেশের জাতীয় গ্রিড নির্গমন সহগ নির্ণয়ে মেথড এ (জ্বালানি ভারসাম্য) কীভাবে কাজ করে?", "bd_grid_methodology.md"),
    ("মেথড এ এবং মেথড বি এর মধ্যে ফলাফলের সর্বোচ্চ কত শতাংশ পার্থক্য থাকলে তা পর্যালোচনার যোগ্য হয়?", "bd_grid_methodology.md"),
    ("জাতীয় গ্রিডের গড় নির্গমন ফ্যাক্টর থেকে ক্যাপটিভ জেনারেটরের উৎপাদন কেন বাদ দেওয়া আবশ্যক?", "bd_grid_methodology.md"),
    ("গ্রিড নির্গমন ফ্যাক্টর গণনার জন্য পিডিবি এবং পেট্রোবাংলার কোন কোন বার্ষিক প্রতিবেদন ব্যবহার করা হয়?", "bd_grid_methodology.md"),
    ("ভারত থেকে আমদানিকৃত বিদ্যুতের কার্বন নির্গমন কীভাবে বাংলাদেশ গ্রিডের মডেলে অন্তর্ভুক্ত করা হয়?", "bd_grid_methodology.md"),
    ("গ্রিড ফ্যাক্টরের অনিশ্চয়তা (Uncertainty) পরিমাপের জন্য কোন পরিসংখ্যানিক পদ্ধতি ব্যবহার করা হয়?", "bd_grid_methodology.md"),
    ("দুই পদ্ধতির মধ্যে ব্যাখ্যাতীত ব্যবধান ৫ শতাংশের বেশি হলে খসড়া ফ্যাক্টরের ক্ষেত্রে কী সিদ্ধান্ত নেওয়া হয়?", "bd_grid_methodology.md"),

    # Topic 4: IPCC 2006 Stationary Combustion & AR6 GWP (8 questions)
    ("আইপিসিসি টিয়ার ১ পদ্ধতিতে প্রাকৃতিক গ্যাসের ডিফল্ট নেট ক্যালরিফিক মান এবং কার্বন সহগ কত?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("আইপিসিসি সিক্সথ অ্যাসেসমেন্ট রিপোর্ট (AR6) অনুযায়ী মিথেন গ্যাসের ১০০ বছরের জিডব্লিউপি (GWP) মান কত?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("স্থায়ী জ্বালানি দহনের ক্ষেত্রে টিয়ার ১ ডিফল্ট ফ্যাক্টর এবং টিয়ার ২ স্থানীয় ফ্যাক্টরের মধ্যে পার্থক্য কী?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("এআর৬ অনুযায়ী নাইট্রাস অক্সাইডের (N2O) ১০০ বছরের গ্লোবাল ওয়ার্মিং পটেনশিয়াল মান কত ধরা হয়?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("শিল্প বয়লারে ফার্নেস অয়েল (HFO) পোড়ানোর জন্য আইপিসিসি ২০০৬ এর ডিফল্ট নির্গমন সহগ কত?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("গ্যাসীয় জ্বালানির ভলিউম (ঘনমিটার) থেকে শক্তিতে (GJ) রূপান্তরের সময় এনসিভি এবং জিসিভির নিয়ম কী?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("প্রাকৃতিক গ্যাস পরিমাপের সময় প্রমাণ তাপমাত্রা ও চাপের (STP/NTP) সমন্বয় কেন প্রয়োজন?", "ipcc_2006_combustion_and_ar6_gwp.md"),
    ("বিভিন্ন গ্রিনহাউস গ্যাসের নির্গমনকে CO2 সমতুল্যে রূপান্তরের সাধারণ সূত্রটি কী?", "ipcc_2006_combustion_and_ar6_gwp.md"),

    # Topic 5: Dexterity Textiles Demo Facility (8 questions)
    ("ডেক্সটোরি টেক্সটাইলস এর গাজীপুর কারখানার প্রধান উৎপাদন ইউনিটগুলো কী কী?", "dexterity_textiles_demo.md"),
    ("ডেক্সটোরি টেক্সটাইলসে প্রাকৃতিক গ্যাস সরবরাহকারী গ্যাস বিতরণ কোম্পানির নাম কী?", "dexterity_textiles_demo.md"),
    ("ডেক্সটোরির স্পিনিং ইউনিটের অনুমোদিত বৈদ্যুতিক লোড এবং সংযোগের ধরন কী?", "dexterity_textiles_demo.md"),
    ("কারখানার বয়লারে বিকল্প জ্বালানি হিসেবে ব্যবহৃত ডিজেলের চালান কীভাবে সংরক্ষণ করা হয়?", "dexterity_textiles_demo.md"),
    ("কারখানার এসি চিলারে কোন ধরনের রেফ্রিজারেন্ট গ্যাস ব্যবহার করা হয়?", "dexterity_textiles_demo.md"),
    ("ডেক্সটোরির বেসলাইন বছরের নিরীক্ষিত স্কোপ ১ প্রাকৃতিক গ্যাস ব্যবহারের পরিমাণ কত ছিল?", "dexterity_textiles_demo.md"),
    ("গাজীপুর কারখানায় হাই-টেনশন বিদ্যুৎ সরবরাহকারী বিতরণ কর্তৃপক্ষ কোনটি?", "dexterity_textiles_demo.md"),
    ("কার্বন হিসাব নিরীক্ষায় বিদ্যুৎ বিলের মিটার মাল্টিপ্লায়ার কীভাবে যাচাই করা হয়?", "dexterity_textiles_demo.md")
]

fixture = []
for i, (q, doc) in enumerate(en_questions, start=1):
    fixture.append({
        "id": f"PARAPHRASE-EN-{i:02d}",
        "query": q,
        "expected_doc": doc,
        "language": "en",
        "query_type": "paraphrase",
        "needs_human_review": True
    })

for i, (q, doc) in enumerate(bn_questions, start=1):
    fixture.append({
        "id": f"PARAPHRASE-BN-{i:02d}",
        "query": q,
        "expected_doc": doc,
        "language": "bn",
        "query_type": "paraphrase",
        "needs_human_review": True
    })

FIXTURE_PATH.parent.mkdir(parents=True, exist_ok=True)
FIXTURE_PATH.write_text(json.dumps(fixture, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Created {FIXTURE_PATH} with {len(fixture)} questions ({len(en_questions)} EN, {len(bn_questions)} BN).")

