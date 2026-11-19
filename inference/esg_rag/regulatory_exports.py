"""
EU CBAM Transitional Registry XML & JSON Exporter (Implementing Regulation (EU) 2023/1773).

Generates deterministic embedded direct (Scope 1) + indirect (Scope 2 electricity) intensity
reports per Combined Nomenclature (CN) goods produced at verified facilities.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List
from xml.sax.saxutils import escape


def build_cbam_payload(
    organization: dict,
    period: dict,
    calculation_run: dict,
    facilities: List[dict],
    goods_declarations: List[dict],
) -> Dict[str, object]:
    """
    goods_declarations items:
      {"cn_code": "7208", "good_name": "Hot-rolled flat steel products", "facility_id": "...", "produced_tonnes": "1200.0"}
    """
    by_fac = calculation_run.get("by_facility") or {}
    fac_map = {f["id"]: f for f in facilities}

    entries = []
    blockers = []
    for idx, g in enumerate(goods_declarations):
        fid = g["facility_id"]
        fac = fac_map.get(fid)
        if not fac:
            blockers.append(f"Declaration {idx}: unknown facility '{fid}'")
            continue
        produced_t = Decimal(str(g["produced_tonnes"]))
        if produced_t <= 0:
            blockers.append(f"Declaration {idx}: produced_tonnes must be positive")
            continue
        fac_totals = by_fac.get(fid) or {}
        direct_t = Decimal(str(fac_totals.get("scope1", "0")))
        indirect_t = Decimal(str(fac_totals.get("scope2_location_based", "0")))
        see_direct = (direct_t / produced_t).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        see_indirect = (indirect_t / produced_t).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        see_total = (see_direct + see_indirect).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        entries.append({
            "cn_code": str(g["cn_code"]),
            "good_name": str(g["good_name"]),
            "installation": {
                "facility_id": fid,
                "name": fac["name"],
                "country": fac["country"],
                "grid_region": fac["grid_region"],
            },
            "quantity_tonnes": str(produced_t),
            "direct_emissions_tco2e": str(direct_t),
            "indirect_emissions_tco2e": str(indirect_t),
            "specific_embedded_direct_tco2e_per_t": str(see_direct),
            "specific_embedded_indirect_tco2e_per_t": str(see_indirect),
            "specific_embedded_total_tco2e_per_t": str(see_total),
        })

    if calculation_run.get("blocking"):
        blockers.append("Calculation run contains blocking exceptions (missing approved factors or data quality failure)")

    return {
        "schema": "eu-cbam-transitional-2023-1773-v1",
        "organization": organization,
        "reporting_period": {
            "id": period["id"],
            "name": period["name"],
            "start_date": str(period["start_date"]),
            "end_date": str(period["end_date"]),
        },
        "gwp_basis": calculation_run.get("gwp_basis", "AR6"),
        "methodology_version": calculation_run.get("methodology_version"),
        "status": "VALIDATED_FOR_SUBMISSION" if not blockers else "BLOCKED_MISSING_PREREQUISITES",
        "blockers": blockers,
        "imported_goods": entries,
    }


def render_cbam_xml(payload: Dict[str, object]) -> str:
    """Renders valid XML document following CBAM Quarterly Report structure."""
    org = payload["organization"]
    per = payload["reporting_period"]
    goods_xml = []
    for item in payload["imported_goods"]:
        inst = item["installation"]
        goods_xml.append(
            "    <ImportedGood>\n"
            f"      <CNCode>{escape(item['cn_code'])}</CNCode>\n"
            f"      <GoodDescription>{escape(item['good_name'])}</GoodDescription>\n"
            "      <Installation>\n"
            f"        <Id>{escape(inst['facility_id'])}</Id>\n"
            f"        <Name>{escape(inst['name'])}</Name>\n"
            f"        <CountryCode>{escape(inst['country'])}</CountryCode>\n"
            "      </Installation>\n"
            f"      <QuantityTonnes>{escape(item['quantity_tonnes'])}</QuantityTonnes>\n"
            f"      <DirectEmissionsTCO2e>{escape(item['direct_emissions_tco2e'])}</DirectEmissionsTCO2e>\n"
            f"      <IndirectEmissionsTCO2e>{escape(item['indirect_emissions_tco2e'])}</IndirectEmissionsTCO2e>\n"
            f"      <SpecificEmbeddedDirect>{escape(item['specific_embedded_direct_tco2e_per_t'])}</SpecificEmbeddedDirect>\n"
            f"      <SpecificEmbeddedIndirect>{escape(item['specific_embedded_indirect_tco2e_per_t'])}</SpecificEmbeddedIndirect>\n"
            f"      <SpecificEmbeddedTotal>{escape(item['specific_embedded_total_tco2e_per_t'])}</SpecificEmbeddedTotal>\n"
            "    </ImportedGood>"
        )

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<CBAMQuarterlyReport schema="eu-cbam-transitional-2023-1773-v1">\n'
        "  <Header>\n"
        f"    <DeclarantName>{escape(str(org.get('name', '')))}</DeclarantName>\n"
        f"    <PeriodName>{escape(str(per.get('name', '')))}</PeriodName>\n"
        f"    <PeriodStart>{escape(str(per.get('start_date', '')))}</PeriodStart>\n"
        f"    <PeriodEnd>{escape(str(per.get('end_date', '')))}</PeriodEnd>\n"
        f"    <Status>{escape(str(payload.get('status', '')))}</Status>\n"
        "  </Header>\n"
        "  <ImportedGoods>\n"
        + ("\n".join(goods_xml) + "\n" if goods_xml else "")
        + "  </ImportedGoods>\n"
        "</CBAMQuarterlyReport>\n"
    )
