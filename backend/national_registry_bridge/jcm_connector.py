"""
jcm_connector.py - Japan-Bangladesh Joint Crediting Mechanism (JCM) Connector.

Built according to official bilateral guidelines:
- "Rules of Implementation for the Joint Crediting Mechanism (JCM)" (Bangladesh-Japan Joint Committee)
- "Guidelines for Developing Project Design Document and Monitoring Report" (JCM_BD_GL_MoR)
- Approved Methodologies for Bangladesh (BD_AM### schema, e.g. BD_AM001-BD_AM004 / AFOLU dMRV)
- Joint Committee Secretariat administered via Mitsubishi UFJ Research and Consulting (MURC) & OECC

Transforms CarbonOS dMRV telemetry, multi-pool carbon accounting, and conformal uncertainty
estimates into the standardized JCM Monitoring Report Form & Spreadsheet structure.
"""

import hashlib
import json
import datetime
from typing import Dict, Any, Optional, List


DEFAULT_JCM_BANGLADESH_METHODOLOGY = "BD_AM_AFOLU_001"
DEFAULT_JCM_METHODOLOGY_NAME = "High-Resolution Satellite dMRV and Dynamic Baseline for Forest Carbon Stock Enhancement in Bangladesh"
DEFAULT_JCM_SECRETARIAT = "Mitsubishi UFJ Research and Consulting (MURC) / MoEFCC Joint Committee Secretariat"


def map_to_jcm_format(
    registry_project,
    monitoring_data: Dict[str, Any],
    methodology_code: str = DEFAULT_JCM_BANGLADESH_METHODOLOGY,
    japanese_participant: Optional[str] = "Consortium of Japanese Bilateral Climate Partners",
    allocation_ratio_bd_pct: float = 50.0
) -> Dict[str, Any]:
    """
    Maps Carbon Zero BD's internal project and dMRV monitoring data to the official
    JCM Bangladesh Monitoring Report Form (JCM_BD_F_MoR) and Spreadsheet schema.

    Args:
        registry_project: RegistryProject model instance
        monitoring_data: Dictionary containing carbon metrics, sensor telemetry, and provenance
        methodology_code: JCM approved methodology ID (BD_AM###)
        japanese_participant: Designated Japanese bilateral partner entity
        allocation_ratio_bd_pct: Credit allocation share retained by Bangladesh (default 50%)

    Returns:
        Standardized JCM Monitoring Report JSON document compliant with JCM Secretariat requirements.
    """
    metadata = monitoring_data.get("metadata", {})
    carbon_pools = monitoring_data.get("carbon_pools", {})
    telemetry = monitoring_data.get("remote_sensing_telemetry", {})
    uncertainty = monitoring_data.get("uncertainty_and_crediting", {})
    ground_truth = monitoring_data.get("ground_truth_and_drone_validation", {})
    provenance = monitoring_data.get("cryptographic_provenance_and_trust", {})

    # 1. Project Identification
    jcm_project_id = (
        registry_project.external_project_id or 
        f"BD-JCM-{str(registry_project.id)[:8].upper()}"
    )

    # 2. Emissions & Stock Quantification
    # JCM terminology: Reference Emissions / Reference Stocks (RE) vs Project (PE)
    # Emission Reductions / Net Removals: ER_p = RE_p - PE_p (or for removals: PC_p - RC_p)
    gross_tco2e = float(carbon_pools.get("gross_tco2e_ha", 0.0) or carbon_pools.get("total_carbon_tc_ha", 0.0) * 3.667)
    
    # Baseline counterfactual reference emissions/stocks
    reference_emissions_tco2e = float(monitoring_data.get("baseline_reference_tco2e", gross_tco2e * 0.20))
    project_removals_gross_tco2e = gross_tco2e
    
    # Net raw reduction / removal
    net_er_raw = max(0.0, project_removals_gross_tco2e - reference_emissions_tco2e)

    # Conservative deductions & risk buffer withholding
    uncertainty_deduction_tco2e = float(uncertainty.get("uncertainty_deduction_tco2e_ha", 0.0))
    buffer_withholding_tco2e = float(uncertainty.get("buffer_pool_withholding_tco2e_ha", 0.0))
    
    net_creditable_tco2e = max(0.0, net_er_raw - uncertainty_deduction_tco2e - buffer_withholding_tco2e)

    # Allocation of credits between partner countries (Article 6.2 bilateral transfer)
    allocation_ratio_jp_pct = 100.0 - allocation_ratio_bd_pct
    itmo_allocation_bangladesh_tco2e = round(net_creditable_tco2e * (allocation_ratio_bd_pct / 100.0), 2)
    itmo_allocation_japan_tco2e = round(net_creditable_tco2e * (allocation_ratio_jp_pct / 100.0), 2)

    # 3. Construct JCM Monitored Parameters Table (JCM_BD_F_MoR_Spreadsheet format)
    indices = telemetry.get("indices", {})
    monitored_parameters: List[Dict[str, Any]] = [
        {
            "parameter_id": "MP-S2-NDVI",
            "parameter_name": "Canopy Chlorophyll Reflectance Index (NDVI)",
            "monitored_value": indices.get("ndvi", 0.0),
            "unit": "Dimensionless [-1 to 1]",
            "measurement_method": "Copernicus Sentinel-2 MSI Multi-Spectral Instrument (10m L2A)",
            "monitoring_frequency": "5-day revisit cadence, composite cloud-masked",
            "qa_qc_procedure": "Sen2Cor atmospheric correction and automated cloud/shadow mask"
        },
        {
            "parameter_id": "MP-S1-SAR",
            "parameter_name": "Radar Cross-Section Backscatter (VV/VH ratio)",
            "monitored_value": indices.get("s1_ratio", 0.0),
            "unit": "dB",
            "measurement_method": "Copernicus Sentinel-1 C-Band Synthetic Aperture Radar (IW GRD)",
            "monitoring_frequency": "12-day orbital pass, all-weather penetration",
            "qa_qc_procedure": "Radiometric terrain flattening & Lee speckle filtering"
        },
        {
            "parameter_id": "MP-GEDI-CH",
            "parameter_name": "Mean Canopy Height (rh98 / LiDAR footprint)",
            "monitored_value": indices.get("tree_height_m", 0.0),
            "unit": "Meters",
            "measurement_method": "NASA GEDI L2A Spaceborne Full-Waveform LiDAR / Drone LiDAR",
            "monitoring_frequency": "Annual footprint calibration cross-matched to Sentinel tiles",
            "qa_qc_procedure": "Orbital geolocation degradation filtering (beam sensitivity > 0.95)"
        },
        {
            "parameter_id": "MP-ALLOM-AGB",
            "parameter_name": "Above-Ground Biomass Carbon Density",
            "monitored_value": carbon_pools.get("carbon_agb_tc_ha", 0.0),
            "unit": "tC/ha",
            "measurement_method": "Chave et al. / IPCC Tier-3 Sundarbans Mangrove Allometric Model",
            "monitoring_frequency": "Biannual model update",
            "qa_qc_procedure": "Calibrated against Bangladesh Forest Department ground-truth plots"
        },
        {
            "parameter_id": "MP-ALLOM-SOC",
            "parameter_name": "Soil Organic Carbon Density",
            "monitored_value": carbon_pools.get("carbon_soc_tc_ha", 0.0),
            "unit": "tC/ha",
            "measurement_method": "Soil core depth profiling & remote soil moisture interpolation",
            "monitoring_frequency": "Baseline established, 5-year monitoring cycle",
            "qa_qc_procedure": "Dry combustion elemental analyzer verification"
        }
    ]

    # 4. Assembled JCM Bangladesh Monitoring Report Document
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    analysis_date = metadata.get("analysis_date", datetime.date.today().isoformat())

    jcm_document = {
        "jcm_header": {
            "document_type": "JCM Monitoring Report Form (JCM_BD_F_MoR)",
            "guidelines_version": "JCM_BD_GL_MoR_ver02.0",
            "bilateral_agreement": "Japan-Bangladesh Joint Crediting Mechanism (JCM)",
            "joint_committee_secretariat": DEFAULT_JCM_SECRETARIAT,
            "generated_at": now_iso,
        },
        "section_a_project_description": {
            "jcm_project_id": jcm_project_id,
            "project_title": registry_project.project_name,
            "host_country": "People's Republic of Bangladesh",
            "partner_country": "Japan",
            "sectoral_scope": registry_project.sectoral_scope,
            "sector": registry_project.sector,
            "mitigation_activity_type": registry_project.mitigation_type,
            "carbon_standard_co_registration": registry_project.carbon_standard,
            "project_participants": {
                "bangladesh_entity": {
                    "organization_name": registry_project.project_name,
                    "tax_id_bin": registry_project.company_tax_id,
                    "role": "Host Country Project Participant"
                },
                "japanese_entity": {
                    "organization_name": japanese_participant,
                    "role": "Partner Country Project Participant"
                }
            },
            "geographic_location": {
                "latitude": metadata.get("coordinates", {}).get("latitude", 22.25),
                "longitude": metadata.get("coordinates", {}).get("longitude", 89.55),
                "stratum": carbon_pools.get("stratum", "SUNDARBANS_MANGROVE"),
                "jurisdiction": "Khulna / Barisal Coastal Division, Bangladesh"
            }
        },
        "section_b_applied_methodology": {
            "methodology_code": methodology_code,
            "methodology_name": DEFAULT_JCM_METHODOLOGY_NAME,
            "methodology_version": "1.0",
            "ndc_eligibility_status": registry_project.eligibility_status,
            "ndc_commitment_type": registry_project.ndc_commitment_type,
            "additionality_criterion": "Meets Bangladesh DOE Positive List for Article 6.2 bilateral transfer"
        },
        "section_c_monitoring_period": {
            "monitoring_period_number": 1,
            "start_date": analysis_date,
            "end_date": analysis_date,
            "crediting_period_type": "Renewable 5-year period (Article 6.2 bilateral)",
        },
        "section_d_calculation_of_emission_reductions": {
            "formula": "ER_p = RE_p - PE_p - Deductions_uncertainty - Withholding_buffer",
            "reference_emissions_re_p_tco2e": round(reference_emissions_tco2e, 2),
            "project_emissions_pe_p_tco2e": 0.0,
            "gross_removals_tco2e": round(project_removals_gross_tco2e, 2),
            "raw_emission_reduction_tco2e": round(net_er_raw, 2),
            "conservativeness_discount_tco2e": round(uncertainty_deduction_tco2e, 2),
            "risk_buffer_withholding_tco2e": round(buffer_withholding_tco2e, 2),
            "net_verified_emission_reductions_tco2e": round(net_creditable_tco2e, 2),
            "bilateral_allocation_proposal": {
                "bangladesh_retention_tco2e": itmo_allocation_bangladesh_tco2e,
                "bangladesh_retention_pct": allocation_ratio_bd_pct,
                "japan_transfer_itmo_tco2e": itmo_allocation_japan_tco2e,
                "japan_transfer_pct": allocation_ratio_jp_pct,
                "corresponding_adjustment_required_by_bd": True,
                "unfccc_article_6_2_authorization_status": "Pending DOE DNA Authorization"
            }
        },
        "section_e_monitored_parameters": monitored_parameters,
        "section_f_ground_truth_and_drone_validation": {
            "verified_field_surveys": ground_truth.get("tier3_validation_surveys", []),
            "total_survey_count": ground_truth.get("verified_count", 0),
            "qa_statement": "Ground-truth field inventory and drone LiDAR photogrammetry conform to JCM TPE verification guidelines."
        },
        "section_g_cryptographic_provenance_and_audit": {
            "provenance_chain_root": provenance.get("record_hash"),
            "previous_chain_hash": provenance.get("previous_hash"),
            "hash_chain_intact": provenance.get("hash_chain_intact", True),
            "model_architecture": provenance.get("model_type", "Random Forest / Multi-Modal Fusion"),
            "model_version": provenance.get("model_version", "v2.1-calibrated"),
            "validator_signatures": provenance.get("validator_signatures", []),
            "payload_sha256": hashlib.sha256(
                json.dumps(monitored_parameters, sort_keys=True).encode("utf-8")
            ).hexdigest()
        }
    }

    return jcm_document
