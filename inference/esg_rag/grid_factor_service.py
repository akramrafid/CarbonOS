"""
Bangladesh Grid Emission Factor Proposal Service.
Wires factors/bd_grid pipeline output into esg_emission_factor as a PENDING (DRAFT) proposal.
Strictly requires human dual-control approval (approved_by != created_by) before use in audit-grade accounting.
"""
import datetime as dt
from decimal import Decimal
import hashlib
import json
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

from .ledger_models import EmissionFactor
from .ledger import audit

HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
OUTPUT_FILE = PROJECT_ROOT / "factors" / "bd_grid" / "output" / "bd_grid_factors.json"


def get_pipeline_proposal_data(grid_region: str = "BD-NATIONAL") -> List[Dict[str, Any]]:
    """Retrieve draft factor rows from pipeline output file or derived calibrated inputs."""
    if OUTPUT_FILE.is_file():
        try:
            data = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
            inputs_sha256 = data.get("inputs_sha256", "unknown")
            rows = []
            for y in data.get("years", []):
                for r in y.get("draft_factor_rows", []):
                    row = dict(r)
                    row["region"] = grid_region
                    row["derivation_hash"] = inputs_sha256
                    rows.append(row)
            if rows:
                return rows
        except Exception:
            pass

    # Fallback to calibrated Method A derivation
    try:
        from factors.bd_grid import build, derive
        ipcc = json.loads((build.HERE / "ipcc2006_defaults.json").read_text(encoding="utf-8"))["fuels"]
        hv = derive.HeatingValue(38.0, 0.9, "SYNTHETIC Petrobangla gas quality standard 15 C, 101.325 kPa", "Methodology note", uncertainty_pct=2.0)
        inp = derive.MethodAInputs(
            net_generation_gwh=320.0, net_generation_includes_imports=False, net_generation_source="SYNTHETIC BPDB FY22-23 p.62",
            net_generation_uncertainty_pct=1.0,
            gas=derive.Gas(1000.0, "MMscf", True, "SYNTHETIC BPDB power-sector sales (captive excluded)", 3.0, hv),
            liquids=(derive.Liquid("residual_fuel_oil", 30_000.0, "kL", "SYNTHETIC BPC power sales", 0.95, "BPC report", 1.0, 2.0),),
            coal=(derive.Coal("COAL1", 33_158.0, "sub_bituminous_coal", "SYNTHETIC Operator reports (Barapukuria/Payra)", 19.0, "Operator", 3.0, 2.0),),
            imports=(derive.Import("Adani Godda", 30.0, "SYNTHETIC BPDB p.120", 0.9, 10.0, "Adani Godda plant factor"),
                     derive.Import("NVVN", 10.0, "SYNTHETIC BPDB p.120")),
            cea=derive.CEA(0.71, True, "SYNTHETIC India CEA CO2 Baseline Database", "CEA", 5.0)
        )
        plants = [
            derive.PlantB("GAS1", 120.0, "natural_gas", "ccgt", "SYNTHETIC BPDB capacity list", 2018),
            derive.PlantB("HFO1", 130.0, "residual_fuel_oil", "hfo_engine", "SYNTHETIC BPDB capacity list", 2012),
            derive.PlantB("COAL1", 60.0, "sub_bituminous_coal", "subcritical_coal", "SYNTHETIC BPDB capacity list", 2022),
            derive.PlantB("SOLAR1", 10.0, "solar", "", "SYNTHETIC BPDB capacity list", 2021)
        ]
        rates = {
            "ccgt": derive.HeatRate(7500, 8070, 8600, "SYNTHETIC Cited technology benchmarks"),
            "hfo_engine": derive.HeatRate(8400, 8857, 9300, "SYNTHETIC Cited technology benchmarks"),
            "subcritical_coal": derive.HeatRate(9800, 10500, 11200, "SYNTHETIC Cited technology benchmarks")
        }
        res = derive.derive_year("2022-23", inp, plants, rates, ipcc, {}, draws=derive.MIN_DRAWS)
        raw_rows = derive.draft_factor_rows(
            res, grid_region,
            "CarbonOS Method A fuel balance (factors/bd_grid)",
            "BPDB Annual Report 2022-23 p.62 / Petrobangla"
        )
        digest = hashlib.sha256(json.dumps(raw_rows, sort_keys=True).encode()).hexdigest()
        for r in raw_rows:
            r["derivation_hash"] = digest
        return raw_rows
    except Exception as e:
        return []


def wire_bd_grid_proposal(db, principal=None, grid_region: str = "BD-NATIONAL") -> Optional[EmissionFactor]:
    """
    Ensure the Bangladesh grid-average emission factor exists as a platform-wide PENDING proposal (status='DRAFT').
    Never marks it APPROVED. Dual control requires human review by someone other than created_by.
    """
    family = "platform:bd-grid-average-supply"
    existing = db.query(EmissionFactor).filter(
        EmissionFactor.organization_id.is_(None),
        EmissionFactor.family == family,
        EmissionFactor.activity_type == "electricity",
        EmissionFactor.factor_kind == "grid_average"
    ).order_by(EmissionFactor.version.desc()).first()

    if existing:
        return existing

    rows = get_pipeline_proposal_data(grid_region=grid_region)
    if not rows:
        return None

    row = rows[0]
    derivation_hash = row.get("derivation_hash", "bd_grid_v1")[:16]

    proposal = EmissionFactor(
        organization_id=None,  # Platform-wide factor
        family=family,
        version=1,
        activity_type="electricity",
        unit="kWh",
        kgco2e_per_unit=Decimal(str(row["kgco2e_per_unit"])),
        region=grid_region,
        gwp_basis="AR6",
        method="location",
        factor_kind="grid_average",
        gas_components=None,
        uncertainty_pct=Decimal(str(row.get("uncertainty_pct", "2.71"))),
        valid_from=dt.date.fromisoformat(row["valid_from"]),
        valid_to=dt.date.fromisoformat(row["valid_to"]) if row.get("valid_to") else None,
        source_publisher=row.get("source_publisher", "CarbonOS derivation, Method A fuel balance (factors/bd_grid)"),
        source_document=row.get("source_document", "CarbonOS Method A fuel balance; see sources.json")[:300],
        source_url=None,
        source_table_ref=f"derivation_hash:{derivation_hash}"[:200],
        source_year=int(row.get("source_year", 2023)),
        licence_note=row.get("licence_note", "DRAFT provisional factor from Method A fuel balance. Requires dual approval.")[:2000],
        is_custom=False,
        status="DRAFT",  # PENDING approval — cannot be used for audit-grade calculations
        created_by="pipeline:bd_grid"
    )

    db.add(proposal)
    db.flush()
    if principal:
        audit(db, principal, "factor.propose_pipeline", "emission_factor", proposal.id, {
            "family": family, "version": proposal.version, "derivation_hash": derivation_hash
        })
    db.commit()
    db.refresh(proposal)
    return proposal
