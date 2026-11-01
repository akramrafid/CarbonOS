"""
Bootstrap script to seed CarbonOS ESG RAG system with:
1. Source notes on Bangladesh rules (NDC 2021, ECR 2023 = S.R.O. No. 53) and EU CBAM; not official texts.
2. Legacy unverified emission factor records (no grid factor) and a factor status note.
3. A fictional, unaudited sample tenant document.
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
        "confidence_rating": "UNVERIFIED - no primary source located"
    },
    {
        "category": "Scope 1",
        "fuel_or_activity": "Petrol / Octane",
        "region": "Bangladesh",
        "factor_value": 2.31,
        "unit": "kg CO2e / Liter",
        "source_citation": "IPCC Guidelines Vol 2 Mobile Combustion (Road Transportation)",
        "year": 2023,
        "confidence_rating": "UNVERIFIED - no primary source located"
    },
    {
        "category": "Scope 1",
        "fuel_or_activity": "LPG (Liquefied Petroleum Gas)",
        "region": "Bangladesh",
        "factor_value": 2.98,
        "unit": "kg CO2e / kg",
        "source_citation": "IPCC 2006 Stationary Combustion Table 2.2, commercial LPG blend",
        "year": 2023,
        "confidence_rating": "UNVERIFIED - no primary source located"
    },
    {
        "category": "Scope 2",
        "fuel_or_activity": "Renewable PPA / Green Tariff (Market-based)",
        "region": "Bangladesh",
        "factor_value": 0.12,
        "unit": "kg CO2e / kWh",
        "source_citation": "SREDA Certified Solar Park Wheeled Tariff Carbon Attribute",
        "year": 2024,
        "confidence_rating": "UNVERIFIED - no primary source located"
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
BANGLADESH CLIMATE AND ENVIRONMENT RULES: SOURCE NOTES
Prepared by CarbonOS for retrieval. Not an official text: read the primary documents before relying on it.

1. UPDATED NATIONALLY DETERMINED CONTRIBUTIONS (NDC), submitted to the UNFCCC in August 2021
Ministry of Environment, Forest and Climate Change (MoEFCC). Base year 2012; sectors: Energy, IPPU, AFOLU, Waste.
- Unconditional: reduce GHG emissions by 27.56 Mt CO2e (6.73%) below business-as-usual (BAU) by 2030.
- Conditional on international support: a further 61.9 Mt CO2e (15.12%), i.e. 21.85% below BAU in total
  (89.47 Mt CO2e as summarised by UNDP and UNEP).
- A later NDC (NDC 3.0) was reported submitted in September 2025. Check the UNFCCC NDC registry for the current text.

2. ENVIRONMENT CONSERVATION RULES, 2023 (ECR 2023)
- Bangladesh Gazette Extraordinary, Sunday 5 March 2023, page 3009: S.R.O. No. 53-Ain/2023, made by MoEFCC under
  section 20 of the Bangladesh Environment Conservation Act, 1995. It repealed the Environment Conservation Rules, 1997.
- Content (FAOLEX abstract, listed by UNEP LEAP): complaints about pollution; sampling notices; classification of
  industrial units and projects into Green, Yellow, Orange and Red categories; environmental clearance and location
  clearance certificates; EIA and environmental management plans; appeals; water quality and liquid-waste
  standards; effluent treatment plants; fees.
- ECR 2023 is not a GHG inventory rule. Neither the FAOLEX abstract nor the machine-readable parts of the gazetted
  text require reporting or verification of Scope 1 or Scope 2 emissions, and the rules name no MRV software.

3. EU CARBON BORDER ADJUSTMENT MECHANISM (CBAM): Regulation (EU) 2023/956, amended by Regulation (EU) 2025/2083
- Covered goods: iron and steel, aluminium, cement, fertilisers, hydrogen and electricity.
  Garments and textiles are NOT covered.
- Transitional period, 1 October 2023 to 31 December 2025: quarterly reports of embedded emissions, no payment.
- Definitive period from 1 January 2026: authorised CBAM declarants surrender CBAM certificates for the embedded
  emissions of covered goods they import. Certificate sales open on 1 February 2027; the first annual declaration
  and surrender, for 2026 imports, are due by 30 September 2027.
- De minimis: an importer bringing in no more than 50 tonnes a year of covered goods (electricity and hydrogen
  excluded) is exempt.
- CBAM counts "embedded emissions" per tonne of product (direct emissions, and for some goods indirect emissions
  from electricity). That is not the same as a company's GHG Protocol Scope 1 and Scope 2 inventory.

Sources: UNFCCC NDC registry and UNDP Bangladesh NDC 2021 summary; Bangladesh Gazette of 5 March 2023 (FAOLEX
BGD219240, https://faolex.fao.org/docs/pdf/BGD219240.pdf); UNEP LEAP entry "Environment Conservation Rules, 2023
(SRO No. 53)"; Regulation (EU) 2023/956 and Regulation (EU) 2025/2083; EPA Ireland CBAM guidance.
"""

EMISSION_FACTORS_CORPUS_TEXT = """
BANGLADESH GRID AND FUEL EMISSION FACTORS: STATUS NOTE
Prepared by CarbonOS for retrieval. Not an official text.

1. GRID ELECTRICITY
- No officially published Bangladesh grid emission factor has been located. An earlier version of this corpus
  cited a "DoE Gazette 22.02.0000.018.99.001.23" with a combined margin of 0.550 kg CO2e/kWh, an operating margin
  of 0.612 and a build margin of 0.488. No such document could be found and those figures have been withdrawn.
- A combined margin, operating margin or build margin (UNFCCC CDM "Tool to calculate the emission factor for an
  electricity system", Tool 07) is a project-baseline metric. It is never used for GHG Protocol location-based
  Scope 2, which uses the average emission rate of the grid where the electricity is consumed.
- Any Bangladesh grid-average factor derived by CarbonOS stays DRAFT until a second person approves it.

2. FUEL COMBUSTION
- Default emission factors: 2006 IPCC Guidelines, Volume 2 (Energy), Chapter 2 (Stationary Combustion), with net
  calorific values from Chapter 1. Natural gas is accounted on an energy basis from the distributor's or
  Petrobangla's heating value.
"""

TENANT_DOCS_SAMPLE_TEXT = """
FICTIONAL DEMO DOCUMENT: NOT A REAL COMPANY STATEMENT, NOT AUDITED, NOT VERIFIED.
SAMPLE ENERGY LOGBOOK: DEXTERITY TEXTILES LTD (DHAKA EXPORT PROCESSING ZONE)
Reporting Period: Q2 2026 (April 1, 2026 - June 30, 2026) | Facility Reg: DEPZ-TX-8491

1. ENERGY & UTILITIES LOGBOOK (SCOPE 1 & 2):
- Factory Backup Power: Cummins 1250 kVA diesel generator ran for 312 hours during grid load shedding. Total High Speed Diesel (HSD) drawn from depot tanks: 14,200 Liters. [Page 2, Section 3.1]
- Fleet Transport: Executive shuttles and delivery vans consumed 4,800 Liters of Octane-95. [Page 2, Section 3.4]
- Canteen & Boiler Auxiliary: 1,950 kg of commercial LPG consumed. [Page 3, Section 4.2]
- DESCO Grid Power (Substation Meter ID: DESCO-HT-99210): Total active power consumed: 156,000 kWh. [Page 4, Section 5.1]
- Rooftop Solar Generation: Onsite 100 kWp solar PV array generated 28,400 kWh (memo item; never netted against grid purchases). [Page 4, Section 5.3]

2. VALUE CHAIN METRICS (SCOPE 3):
- Workforce: Total registered permanent factory personnel: 148 full-time employees. [Page 5, Section 6.1]
- Executive Flights: 8 overseas marketing trips to Frankfurt and London totaling 82,000 passenger-kilometers. [Page 6, Section 7.2]
- Finished Garment Freight: 12 container shipments dispatched via N1 highway to Chattogram Seaport totaling 39,000 ton-kilometers. [Page 7, Section 8.1]
- Raw Yarn & Fabric Inward: Purchased 580 metric tons of composite cotton-polyester yarn. [Page 8, Section 9.3]

STATUS:
Fictional sample data for demonstrating retrieval. No audit, verification or assurance has been performed.
"""

def seed_database():
    print("[Seed ESG RAG] Initializing database tables...")
    init_db()
    db: Session = SessionLocal()

    try:
        # 1. Seed Emission Factors in SQLite
        existing_ef_count = db.query(EmissionFactorRecord).count()
        if existing_ef_count == 0:
            print(f"[Seed ESG RAG] Seeding {len(DEFAULT_FACTORS)} unverified legacy emission factors...")
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
            meta_info={"authority": "CarbonOS source notes (not an official text)", "jurisdiction": "Bangladesh", "year": 2026}
        )

        # 3. Ingest Emission Factors Corpus into Vector Store
        print("[Seed ESG RAG] Ingesting National Emission Factors Corpus...")
        ingest_document(
            db=db,
            file_bytes=EMISSION_FACTORS_CORPUS_TEXT.encode('utf-8'),
            filename="Bangladesh_Grid_and_Fuel_Factor_Status_Note.txt",
            corpus=CORPUS_EMISSION_FACTORS,
            tenant_id="global_ef",
            meta_info={"authority": "CarbonOS status note (not an official source)", "year": 2026}
        )

        # 4. Ingest Sample Tenant Audit Statement for default tenant
        print("[Seed ESG RAG] Ingesting fictional Dexterity Textiles sample document...")
        ingest_document(
            db=db,
            file_bytes=TENANT_DOCS_SAMPLE_TEXT.encode('utf-8'),
            filename="Dexterity_Textiles_ESG_Statement_Q2_2026.txt",
            corpus=CORPUS_TENANT_DOCS,
            tenant_id="default_tenant",
            meta_info={"company": "Dexterity Textiles Ltd (fictional)", "period": "Q2 2026", "status": "FICTIONAL_UNAUDITED"}
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
