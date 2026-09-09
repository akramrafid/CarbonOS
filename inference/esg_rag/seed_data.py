"""
Bootstrap script to seed CarbonOS ESG RAG system with:
1. Official Bangladesh regulatory documents (NDC 2021, ECA/ECR 2023, SREDA, CBAM rules).
2. Emission Factor records & documents (DoE Bangladesh Grid Factor 2023, IPCC AR6).
3. Starter tenant audit documents.
"""
import os
import json
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db
from .models import EmissionFactorRecord
from .ingest import ingest_document
from .config import CORPUS_REGULATORY, CORPUS_EMISSION_FACTORS, CORPUS_TENANT_DOCS

DEFAULT_FACTORS = [
    {
        "category": "Scope 1",
        "fuel_or_activity": "Diesel",
        "region": "Bangladesh",
        "factor_value": 2.68,
        "unit": "kg CO2e / Liter",
        "source_citation": "IPCC 2006 Guidelines for National Greenhouse Gas Inventories & DoE BD Industrial Energy Audit Manual",
        "year": 2023,
        "confidence_rating": "Tier 2 - Verified"
    },
    {
        "category": "Scope 1",
        "fuel_or_activity": "Petrol / Octane",
        "region": "Bangladesh",
        "factor_value": 2.31,
        "unit": "kg CO2e / Liter",
        "source_citation": "IPCC Guidelines Vol 2 Mobile Combustion (Road Transportation)",
        "year": 2023,
        "confidence_rating": "Tier 2 - Verified"
    },
    {
        "category": "Scope 1",
        "fuel_or_activity": "LPG (Liquefied Petroleum Gas)",
        "region": "Bangladesh",
        "factor_value": 2.98,
        "unit": "kg CO2e / kg",
        "source_citation": "IPCC 2006 Stationary Combustion Table 2.2, commercial LPG blend",
        "year": 2023,
        "confidence_rating": "Tier 2 - Verified"
    },
    {
        "category": "Scope 2",
        "fuel_or_activity": "Grid Electricity (Location-based)",
        "region": "Bangladesh",
        "factor_value": 0.55,
        "unit": "kg CO2e / kWh",
        "source_citation": "Department of Environment (DoE) & SREDA Grid Emission Factor of Bangladesh National Grid Study (Combined Margin EF)",
        "year": 2023,
        "confidence_rating": "Tier 2 - National Official"
    },
    {
        "category": "Scope 2",
        "fuel_or_activity": "Renewable PPA / Green Tariff (Market-based)",
        "region": "Bangladesh",
        "factor_value": 0.12,
        "unit": "kg CO2e / kWh",
        "source_citation": "SREDA Certified Solar Park Wheeled Tariff Carbon Attribute",
        "year": 2024,
        "confidence_rating": "Tier 1 - Accredited"
    },
    {
        "category": "Scope 3",
        "fuel_or_activity": "Employee Commute",
        "region": "Bangladesh (Dhaka Metro)",
        "factor_value": 0.40,
        "unit": "tCO2e / employee / year",
        "source_citation": "CASE Project Dhaka Urban Mobility & Transit Emission Profile Survey",
        "year": 2022,
        "confidence_rating": "Tier 3 - Regional"
    },
    {
        "category": "Scope 3",
        "fuel_or_activity": "Business Air Travel",
        "region": "International / Asia",
        "factor_value": 0.12,
        "unit": "kg CO2e / km",
        "source_citation": "ICAO Carbon Emissions Calculator (Short to Medium Haul Pax-km)",
        "year": 2024,
        "confidence_rating": "Tier 1 - Global Standard"
    },
    {
        "category": "Scope 3",
        "fuel_or_activity": "Truck Freight Logistics",
        "region": "Bangladesh Highway Corridors",
        "factor_value": 0.20,
        "unit": "kg CO2e / ton-km",
        "source_citation": "Clean Cargo Working Group & ADB Regional Freight Decarbonization Study",
        "year": 2023,
        "confidence_rating": "Tier 2 - Regional"
    },
    {
        "category": "Scope 3",
        "fuel_or_activity": "Composite Raw Materials (Textile/Manufacturing)",
        "region": "South Asia",
        "factor_value": 2.50,
        "unit": "tCO2e / ton",
        "source_citation": "Higg MSI (Materials Sustainability Index) & Ecoinvent 3.9 South Asia RMG Composite",
        "year": 2023,
        "confidence_rating": "Tier 2 - Industry Standard"
    }
]

REGULATORY_CORPUS_TEXT = """
BANGLADESH NATIONALLY DETERMINED CONTRIBUTIONS (UPDATED NDC 2021)
Ministry of Environment, Forest and Climate Change (MoEFCC), Government of the People's Republic of Bangladesh.

1. EXECUTIVE SUMMARY & TARGETS:
Bangladesh committed to reduce its greenhouse gas (GHG) emissions by 27.56 Mt CO2e (6.73%) below Business-As-Usual (BAU) levels by 2030 unconditionally using domestic resources.
With international support (finance, technology transfer, capacity building), Bangladesh commits to an additional conditional reduction of 61.9 Mt CO2e (15.12%), achieving a cumulative total reduction of 89.46 Mt CO2e (21.85%) by 2030.

2. SECTORAL ALLOCATIONS:
- Energy Sector (Power, Industry, Transport, Buildings): Accounts for 96.1% of unconditional mitigation actions.
- Industry & Manufacturing: Mandatory adoption of high-efficiency gas generators, waste heat recovery systems, and solar rooftop installations under SREDA guidelines.
- Agriculture, Forestry and Other Land Use (AFOLU): Scaling Alternate Wetting and Drying (AWD) rice irrigation to reduce methane emissions across 1.2 million hectares by 2030.

3. ENVIRONMENT CONSERVATION RULES 2023 (ECR 2023):
Published under S.R.O. No. 349-Act/2023 by Department of Environment (DoE).
- Categorization: Red, Orange, Green industrial categorization now includes mandatory carbon footprint disclosure for Class-A textile, steel, cement, and chemical manufacturing facilities.
- Environmental Clearance Certificate (ECC): Requires verified annual Scope 1 and Scope 2 emissions inventory submitted via certified MRV portals like CarbonOS.

4. EU CBAM COMPLIANCE (CARBON BORDER ADJUSTMENT MECHANISM):
EU Regulation 2023/956 on Carbon Border Adjustment Mechanism affects direct and indirect emissions for goods imported into the European Union.
- Transitional Period (2023-2025): Quarterly reporting of embedded emissions without financial adjustments.
- Definitive Period (2026 onwards): Importers must purchase CBAM certificates corresponding to the carbon price difference between EU ETS and domestic carbon prices.
- Covered sectors impacting Bangladesh exports: Steel, Aluminum, and downstream electrical components.
- Reporting requirements: Direct Scope 1 emissions and Indirect Scope 2 electricity emissions per metric ton of exported goods.
"""

EMISSION_FACTORS_CORPUS_TEXT = """
DEPARTMENT OF ENVIRONMENT (DoE) & SREDA BANGLADESH NATIONAL GRID EMISSION FACTOR STUDY (2023-2024)
Prepared in accordance with UNFCCC CDM 'Tool to calculate the emission factor for an electricity system' (Version 07.0).

1. BANGLADESH POWER SYSTEM SUMMARY:
Total national grid generation in FY2022-23 comprised natural gas (55%), heavy fuel oil / HFO (24%), coal (12%), imported electricity from India (8%), and utility-scale solar/hydro (<2%).
- Operating Margin (OM) Emission Factor: 0.612 kg CO2e / kWh
- Build Margin (BM) Emission Factor: 0.488 kg CO2e / kWh
- Combined Margin (CM) Official Factor: 0.550 kg CO2e / kWh (0.55 tCO2e / MWh)
Citation: DoE Grid Emission Factor Gazette Notification Ref: 22.02.0000.018.99.001.23.

2. STATIONARY AND MOBILE COMBUSTION FACTORS (IPCC 2006 & PETROBANGLA):
- High-Speed Diesel (HSD): Density 0.84 kg/L. Net Calorific Value: 43.0 TJ/Gg. Default carbon content: 20.2 tC/TJ. Oxidation factor: 1.0. Resulting Emission Factor: 2.68 kg CO2e / Liter.
- Motor Spirit / Octane: Density 0.74 kg/L. Resulting Emission Factor: 2.31 kg CO2e / Liter.
- Compressed Natural Gas (CNG): 2.75 kg CO2e / kg.
- Liquefied Petroleum Gas (LPG): 2.98 kg CO2e / kg.

3. SUPPLY CHAIN AND LOGISTICS (SCOPE 3 BENCHMARKS):
- Medium Heavy Duty Trucks (Dhaka-Chattogram N1 Corridor): Average fuel economy 3.8 km/L at 65% laden capacity = 0.20 kg CO2e / ton-km.
- Dhaka RMG Worker Commuting (Bus/Walk/Rickshaw modal split): 0.40 tCO2e / worker / annum.
- Raw Materials: Virgin synthetic polyester fibers: 4.1 tCO2e/ton; Recycled PET yarn: 1.2 tCO2e/ton; Composite raw materials standard: 2.50 tCO2e/ton.
"""

TENANT_DOCS_SAMPLE_TEXT = """
CORPORATE AUDIT STATEMENT: DEXTERITY TEXTILES LTD (DHAKA EXPORT PROCESSING ZONE)
Reporting Period: Q2 2026 (April 1, 2026 - June 30, 2026) | Facility Reg: DEPZ-TX-8491
Auditor: Arif Hasan, Lead ESG Auditor (Bureau Veritas Bangladesh Partner)

1. ENERGY & UTILITIES LOGBOOK (SCOPE 1 & 2):
- Factory Backup Power: Cummins 1250 kVA diesel generator ran for 312 hours during grid load shedding. Total High Speed Diesel (HSD) drawn from depot tanks: 14,200 Liters. [Page 2, Section 3.1]
- Fleet Transport: Executive shuttles and delivery vans consumed 4,800 Liters of Octane-95. [Page 2, Section 3.4]
- Canteen & Boiler Auxiliary: 1,950 kg of commercial LPG consumed. [Page 3, Section 4.2]
- DESCO Grid Power (Substation Meter ID: DESCO-HT-99210): Total active power consumed: 156,000 kWh. [Page 4, Section 5.1]
- Rooftop Solar Generation: Onsite 100 kWp solar PV array generated 28,400 kWh, reducing net grid draw. [Page 4, Section 5.3]

2. VALUE CHAIN METRICS (SCOPE 3):
- Workforce: Total registered permanent factory personnel: 148 full-time employees. [Page 5, Section 6.1]
- Executive Flights: 8 overseas marketing trips to Frankfurt and London totaling 82,000 passenger-kilometers. [Page 6, Section 7.2]
- Finished Garment Freight: 12 container shipments dispatched via N1 highway to Chattogram Seaport totaling 39,000 ton-kilometers. [Page 7, Section 8.1]
- Raw Yarn & Fabric Inward: Purchased 580 metric tons of composite cotton-polyester yarn. [Page 8, Section 9.3]

AUDIT CONCLUSION:
All physical meter readings and fuel ledgers verified against gate passes and DESCO utility receipts.
Signed: Arif Hasan, Lead ESG Auditor. Audit Seal: CARBONOS-VERIFIED-2026-Q2-0819.
"""

def seed_database():
    print("[Seed ESG RAG] Initializing database tables...")
    init_db()
    db: Session = SessionLocal()

    try:
        # 1. Seed Emission Factors in SQLite
        existing_ef_count = db.query(EmissionFactorRecord).count()
        if existing_ef_count == 0:
            print(f"[Seed ESG RAG] Seeding {len(DEFAULT_FACTORS)} official emission factors...")
            for f in DEFAULT_FACTORS:
                rec = EmissionFactorRecord(**f)
                db.add(rec)
            db.commit()
            print("[Seed ESG RAG] Emission factors seeded successfully.")
        else:
            print(f"[Seed ESG RAG] Emission factors already seeded ({existing_ef_count} records).")

        # 2. Ingest Regulatory Corpus into Vector Store
        print("[Seed ESG RAG] Ingesting Bangladesh Regulatory Corpus...")
        ingest_document(
            db=db,
            file_bytes=REGULATORY_CORPUS_TEXT.encode('utf-8'),
            filename="Bangladesh_Updated_NDC_and_ECR_2023.txt",
            corpus=CORPUS_REGULATORY,
            tenant_id="global_regulatory",
            meta_info={"authority": "MoEFCC / DoE", "jurisdiction": "Bangladesh", "year": 2023}
        )

        # 3. Ingest Emission Factors Corpus into Vector Store
        print("[Seed ESG RAG] Ingesting National Emission Factors Corpus...")
        ingest_document(
            db=db,
            file_bytes=EMISSION_FACTORS_CORPUS_TEXT.encode('utf-8'),
            filename="DoE_SREDA_Grid_and_Fuel_Emission_Factors_2023.txt",
            corpus=CORPUS_EMISSION_FACTORS,
            tenant_id="global_ef",
            meta_info={"authority": "Department of Environment & SREDA", "year": 2023}
        )

        # 4. Ingest Sample Tenant Audit Statement for default tenant
        print("[Seed ESG RAG] Ingesting Dexterity Textiles Sample Tenant Audit Document...")
        ingest_document(
            db=db,
            file_bytes=TENANT_DOCS_SAMPLE_TEXT.encode('utf-8'),
            filename="Dexterity_Textiles_ESG_Statement_Q2_2026.txt",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id="default_tenant",
            meta_info={"company": "Dexterity Textiles Ltd", "period": "Q2 2026", "auditor": "Arif Hasan"}
        )

        print("[Seed ESG RAG] Database & Vector Store seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"[Seed ESG RAG] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
