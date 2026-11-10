"""
End-to-end trace for natural gas through real profile detection (Task 3):
Profile Detection -> Extraction -> Gaps -> Entered Value -> Estimate -> Post -> Dual Approval -> Period Calculation.

Energy-basis calculation stoichiometry:
  Billed Volume: 5,000 m3
  Volume Correction: 1.0 (standard conditions: 15 °C, 101.325 kPa)
  Gas Certificate: GCV = 38.0 MJ/m3, NCV/GCV = 0.90 -> NCV = 34.2 MJ/m3
  Energy Content: 5,000 m3 * 1.0 * 38.0 MJ/m3 * 0.90 / 1000 = 171.0 GJ (NCV basis)
  Emission Factor: 56.157100 kgCO2e/GJ (TEST fixture, IPCC 2006 Vol 2 Table 2.3 NCV basis)
    Gases included: CO2 (56.1 kg/GJ), fossil CH4 (0.001 kg/GJ * 29.8 = 0.0298), N2O (0.0001 kg/GJ * 273 = 0.0273)
    Total kgCO2e/GJ = 56.100 + 0.0298 + 0.0273 = 56.157100 (AR6 GWP basis)
  Total Emissions: 171.0 GJ * 56.157100 kgCO2e/GJ = 9,602.864100 kgCO2e = 9.602864 tCO2e (Scope 1)
"""
import datetime as dt
from decimal import Decimal as D
import json
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from carbon_monitoring.database import Base
from esg_rag.database import EsgBase
from esg_rag.models import ESGOrganization, ESGMembership
from esg_rag.ledger_models import (
    LegalEntity, Facility, Bill, BillValue, BillProfile, EmissionFactor, ReportingPeriod, ActivityRecord
)
from esg_rag import ledger, bill_service, bill_extract as bx, bill_profiles as bp
from esg_rag.auth import Principal


class TestGasEndToEndRealDetection(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        event.listen(self.engine, "connect", lambda conn, _: conn.execute("PRAGMA foreign_keys=ON"))
        Base.metadata.create_all(self.engine)
        EsgBase.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Org and users
        self.org = ESGOrganization(name="Apex Spinning Ltd", is_demo=False, created_by_sub="user-preparer")
        self.db.add(self.org)
        self.db.commit()

        self.db.add(ESGMembership(organization_id=self.org.id, user_sub="user-preparer", role="esg_admin"))
        self.db.add(ESGMembership(organization_id=self.org.id, user_sub="user-approver", role="esg_admin"))
        self.db.commit()

        self.p_preparer = Principal("user-preparer", self.org.id, "esg_admin", False, False)
        self.p_approver = Principal("user-approver", self.org.id, "esg_admin", False, False)

        # Facility and reporting period
        self.le = LegalEntity(organization_id=self.org.id, name="Apex Spinning Mills", country="BD")
        self.db.add(self.le)
        self.db.commit()

        self.fac = Facility(
            organization_id=self.org.id, legal_entity_id=self.le.id, name="Gazipur Dyeing Unit",
            country="BD", grid_region="BD-NATIONAL", operational_control=True,
            financial_control=True, equity_share_pct=D(100)
        )
        self.db.add(self.fac)
        self.db.commit()

        self.period = ReportingPeriod(
            organization_id=self.org.id, name="FY2025-Annual", start_date=dt.date(2025, 1, 1),
            end_date=dt.date(2025, 12, 31), boundary_method="operational_control", status="OPEN",
            created_by="user-preparer"
        )
        self.db.add(self.period)
        self.db.commit()

        # Load approved titas-gas profile into database
        profiles = bp.repo_profiles()
        titas_doc = next(p for p in profiles if p["profile_key"] == "titas-gas")
        self.profile = BillProfile(
            profile_key="titas-gas", version=1, issuer=titas_doc["issuer"],
            document_type="gas", layout_version="fixture-1", effective_from=dt.date(2020, 1, 1),
            content_sha256="titas_sha256_fixture", status="APPROVED", created_by="system",
            definition=titas_doc
        )
        self.db.add(self.profile)
        self.db.commit()

        # Create and dual-approve a TEST Gas Certificate for the facility
        self.cert = ledger.create_gas_certificate(self.db, self.p_preparer, {
            "facility_id": self.fac.id,
            "distributor": "Titas Gas Transmission and Distribution Company Limited",
            "certificate_ref": "TITAS-TEST-QC-2025-05",
            "gcv": D("38.0"),
            "gcv_unit": "MJ/m3",
            "ncv_to_gcv": D("0.90"),
            "reference_conditions": "15 C, 101.325 kPa",
            "valid_from": dt.date(2025, 1, 1),
            "valid_to": dt.date(2025, 12, 31),
            "uncertainty_pct": D("1.0"),
            "evidence_snippet": "TEST gas certificate from Titas lab"
        })
        ledger.approve_gas_certificate(self.db, self.p_approver, self.cert.id)

        # Load and dual-approve natural gas factor on energy basis (TEST fixture, NCV basis)
        self.factor = ledger.create_factor(self.db, self.p_preparer, {
            "family": "titas-natural-gas-energy-test",
            "activity_type": "natural_gas",
            "unit": "GJ",
            "kgco2e_per_unit": D("56.157100"),
            "region": "BD-NATIONAL",
            "source_publisher": "TEST fixture - IPCC 2006 Guidelines for National GHG Inventories",
            "source_document": "IPCC Vol 2 Energy, Ch 2 Stationary Combustion, Table 2.3 (natural gas, 56.1 kg/GJ CO2, 0.001 kg/GJ CH4, 0.0001 kg/GJ N2O)",
            "source_year": 2021,
            "source_table_ref": "Table 2.3, p. 2.18",
            "source_url": "https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf",
            "gwp_basis": "AR6",
            "valid_from": dt.date(2025, 1, 1),
            "valid_to": dt.date(2025, 12, 31),
            "method": "direct",
            "provenance_class": "TEST"
        })
        ledger.approve_factor(self.db, self.p_approver, self.factor.id)

    def tearDown(self):
        self.db.close()

    def test_gas_e2e_trace_with_real_detection(self):
        """Execute full trace: detection -> extraction -> gaps -> entered value -> estimate -> post -> approval -> calculation."""
        trace = {}

        # 1. Document definition: a Titas Gas bill fixture
        bill_lines = [
            "TITAS GAS TRANSMISSION AND DISTRIBUTION COMPANY LIMITED",
            "Customer Code: TITAS-IND-1049-DHAKA",
            "Bill No: TGTD-2025-05-992",
            "Period From: 01-05-2025 Period To: 31-05-2025",
            "Tariff: Industrial Captive Power",
            "Meter No: MTR-TITAS-9921",
            "Measured Consumption: 5,000 m3",
            "Total Amount: 1,50,000 BDT"
        ]
        layout = {
            "source": "pdf_text",
            "pages": [{"lines": bill_lines}]
        }
        doc = bx.document_from_layout(layout)

        # Step 1: Real Profile Detection
        all_profiles = [(self.profile.id, self.profile.definition)]
        status, matched_ids = bx.detect(doc, all_profiles)
        self.assertEqual(status, "MATCHED")
        self.assertEqual(matched_ids, [self.profile.id])
        trace["1_detection"] = {
            "status": status,
            "matched_profile_id": matched_ids[0],
            "profile_key": self.profile.profile_key
        }

        # Step 2: Extraction
        extracted_rows = bx.extract(doc, self.profile.definition)
        extracted_by_key = {r.key: (str(r.value), r.unit) for r in extracted_rows if r.key}
        self.assertEqual(extracted_by_key["account.number"][0], "TITAS-IND-1049-DHAKA")
        self.assertEqual(extracted_by_key["period.start"][0], "2025-05-01")
        self.assertEqual(extracted_by_key["period.end"][0], "2025-05-31")
        self.assertEqual(extracted_by_key["meter.serial"][0], "MTR-TITAS-9921")
        self.assertEqual(extracted_by_key["gas.volume.measured"][0], "5000")
        self.assertNotIn("gas.volume.corrected", extracted_by_key)

        # Create Bill in DB with extracted values
        bill = Bill(
            organization_id=self.org.id, facility_id=self.fac.id, filename="titas_may_2025.pdf",
            document_sha256="titas_may_2025_hash", document=layout, profile_id=self.profile.id,
            profile_key=self.profile.profile_key, profile_version=1, source="pdf_text",
            status="EXTRACTED", created_by="user-preparer"
        )
        self.db.add(bill)
        self.db.commit()

        for r in extracted_rows:
            if r.key:
                self.db.add(BillValue(
                    organization_id=self.org.id, bill_id=bill.id, parameter_key=r.key,
                    profile_version=1, group_index=r.group_index, raw_text=r.raw_text,
                    value_text=str(r.value) if r.value is not None else None,
                    unit=r.unit, source="pdf_text", status="extracted",
                    confidence=r.confidence, confirmed_by=None
                ))
        self.db.commit()
        trace["2_extraction"] = {
            "bill_id": bill.id,
            "extracted_count": len(extracted_rows),
            "values": {k: v[0] for k, v in extracted_by_key.items()}
        }

        # User confirms extracted values
        for v in self.db.query(BillValue).filter(BillValue.bill_id == bill.id, BillValue.status == "extracted").all():
            bill_service.review_value(self.db, self.p_preparer, v.id, action="confirm")

        # Step 3: Gap Analysis
        gaps_initial = bill_service.bill_gaps(self.db, self.p_preparer, bill.id)
        self.assertFalse(gaps_initial["ready_to_post"])
        missing_keys = [m["field"] for m in gaps_initial["missing_required"]]
        self.assertIn("gas.volume.corrected", missing_keys)
        trace["3_gaps_initial"] = {
            "ready_to_post": gaps_initial["ready_to_post"],
            "calc_blockers": gaps_initial["calc_blockers"],
            "missing_required": missing_keys
        }

        # Step 4: Value Entry (Resolving the Gap)
        meter_group = next(r.group_index for r in extracted_rows if r.key == "gas.volume.measured")
        v_entered = bill_service.enter_value(
            self.db, self.p_preparer, bill.id,
            parameter_key="gas.volume.corrected",
            value="5000",
            unit="m3",
            group_index=meter_group,
            comment="Standard conditions 15 C, 101.325 kPa (correction factor 1.0)"
        )
        self.assertEqual(v_entered.value_text, "5000")
        self.assertEqual(v_entered.status, "entered")
        gaps_after = bill_service.bill_gaps(self.db, self.p_preparer, bill.id)
        self.assertTrue(gaps_after["ready_to_post"])
        self.assertEqual(len(gaps_after["missing_required"]), 0)
        trace["4_entered_value"] = {
            "value_id": v_entered.id,
            "parameter_key": v_entered.parameter_key,
            "value": v_entered.value_text,
            "unit": v_entered.unit,
            "ready_to_post": gaps_after["ready_to_post"]
        }

        # Step 5: Estimate (Energy Basis)
        # 5,000 m3 * 1.0 * 38.0 MJ/m3 * 0.90 / 1000 = 171.0 GJ NCV
        # 171.0 GJ * 56.157100 kgCO2e/GJ = 9,602.864100 kgCO2e = 9.602864 tCO2e
        estimate = bill_service.estimate_bill(self.db, self.p_preparer, bill.id, allow_provisional=False)
        self.assertEqual(estimate["status"], "INDICATIVE")
        self.assertEqual(len(estimate["calc_blockers"]), 0)
        emissions = estimate["emissions"]
        self.assertIsNotNone(emissions)
        self.assertEqual(emissions["scope1_kg"], "9602.864100")
        self.assertEqual(emissions["scope2_location_kg"], "0")
        self.assertEqual(emissions["scope1_tco2e"], "9.603")
        self.assertEqual(emissions["total_tco2e"], "9.603")
        self.assertIn("171.0000 GJ NCV", estimate["lines"][0]["formula"])
        trace["5_estimate"] = {
            "status": estimate["status"],
            "scope1_kg": emissions["scope1_kg"],
            "total_tco2e": emissions["total_tco2e"],
            "factor_used": estimate["lines"][0]["factor_value"],
            "formula": estimate["lines"][0]["formula"]
        }

        # Step 6: Post Bill Activities to Ledger
        posted_activities = bill_service.post_bill(self.db, self.p_preparer, bill.id, self.period.id)
        self.assertEqual(len(posted_activities), 1)
        act = posted_activities[0]
        self.assertEqual(act.activity_type, "natural_gas")
        self.assertEqual(act.quantity, D("5000"))
        self.assertEqual(act.unit, "m3")
        self.assertEqual(act.status, "DRAFT")
        trace["6_post_bill"] = {
            "activity_id": act.id,
            "activity_type": act.activity_type,
            "quantity": str(act.quantity),
            "unit": act.unit,
            "status": act.status
        }

        # Step 7: Submit & Dual Approval
        # Author submits activity for review
        submitted_act = ledger.submit_activity(self.db, self.p_preparer, act.id)
        self.assertEqual(submitted_act.status, "SUBMITTED")

        # Author cannot approve their own record (separation of duties)
        with self.assertRaises(ledger.DomainError) as ctx:
            ledger.review_activity(self.db, self.p_preparer, act.id, approve=True, comment="Self-approval")
        self.assertEqual(ctx.exception.status, 403)

        # Second user reviews and approves
        approved_act = ledger.review_activity(self.db, self.p_approver, act.id, approve=True, comment="Audited and approved")
        self.assertEqual(approved_act.status, "APPROVED")
        self.assertEqual(approved_act.reviewed_by, "user-approver")
        trace["7_dual_approval"] = {
            "activity_id": approved_act.id,
            "status": approved_act.status,
            "reviewed_by": approved_act.reviewed_by,
            "review_comment": approved_act.review_comment
        }

        # Step 8: Period Calculation & Lock (Energy Basis)
        calc_run = ledger.calculate_period(self.db, self.p_preparer, self.period.id)
        self.assertEqual(str(calc_run.scope1_kg), "9602.864100")
        self.assertFalse(calc_run.blocking)
        self.assertIsNotNone(calc_run.input_sha256)

        # Separation of duties: calculation preparer cannot lock their own period run
        with self.assertRaises(ledger.DomainError) as lock_ctx:
            ledger.lock_period(self.db, self.p_preparer, self.period.id, calc_run.id)
        self.assertEqual(lock_ctx.exception.status, 403)

        # Second user locks the period run, generating a sealed ReportSnapshot
        snapshot = ledger.lock_period(self.db, self.p_approver, self.period.id, calc_run.id)
        self.db.refresh(self.period)
        self.assertEqual(self.period.status, "LOCKED")
        self.assertEqual(snapshot.prepared_by, "user-preparer")
        self.assertEqual(snapshot.approved_by, "user-approver")
        self.assertIsNotNone(snapshot.content_sha256)

        trace["8_period_calculation"] = {
            "period_id": self.period.id,
            "status": self.period.status,
            "scope1_kg": str(calc_run.scope1_kg),
            "input_sha256": calc_run.input_sha256,
            "snapshot_id": snapshot.id,
            "snapshot_content_sha256": snapshot.content_sha256,
            "prepared_by": snapshot.prepared_by,
            "approved_by": snapshot.approved_by,
            "created_at": str(snapshot.created_at)
        }

        # Save trace JSON for report evidence
        trace_file = Path(__file__).resolve().parent.parent / "scratch" / "gas_e2e_trace_output.json"
        trace_file.parent.mkdir(parents=True, exist_ok=True)
        trace_file.write_text(json.dumps(trace, indent=2), encoding="utf-8")
        print("\n=== GAS E2E TRACE SUCCESSFUL ===")
        print(json.dumps(trace, indent=2))

    def test_per_volume_gas_factor_fails_outside_test(self):
        """Assert that per-volume natural gas factors (m3 or cft) are strictly rejected outside TEST."""
        # 1. Attempt to create per-volume factor with PUBLISHED provenance without TEST
        with self.assertRaises(ledger.DomainError) as ctx1:
            ledger.create_factor(self.db, self.p_preparer, {
                "family": "published-gas-volume",
                "activity_type": "natural_gas",
                "unit": "m3",
                "kgco2e_per_unit": D("1.915000"),
                "region": "BD-NATIONAL",
                "source_publisher": "Official Gazette",
                "source_document": "National Energy Report",
                "source_year": 2024,
                "source_table_ref": "Table 1",
                "gwp_basis": "AR6",
                "valid_from": dt.date(2025, 1, 1),
                "valid_to": dt.date(2025, 12, 31),
                "method": "direct",
                "provenance_class": "PUBLISHED"
            })
        self.assertEqual(ctx1.exception.status, 422)
        self.assertIn("energy basis (GJ)", ctx1.exception.message)

        # 2. Attempt via load_published_factor with m3
        with self.assertRaises(ledger.DomainError) as ctx2:
            ledger.load_published_factor(
                self.db, self.p_preparer,
                family="published-gas-volume-loader",
                activity_type="natural_gas",
                unit="m3",
                kgco2e_per_unit=D("1.915000"),
                region="BD-NATIONAL",
                source_publisher="Official Gazette",
                source_document="National Energy Report",
                source_year=2024,
                source_page="1",
                gwp_basis="AR6",
                valid_from=dt.date(2025, 1, 1),
                valid_to=dt.date(2025, 12, 31),
                method="direct"
            )
        self.assertEqual(ctx2.exception.status, 422)
        self.assertIn("energy basis (GJ)", ctx2.exception.message)

        # 3. Permitted when explicitly marked TEST
        test_factor = ledger.create_factor(self.db, self.p_preparer, {
            "family": "test-gas-volume",
            "activity_type": "natural_gas",
            "unit": "m3",
            "kgco2e_per_unit": D("1.915000"),
            "region": "BD-NATIONAL",
            "source_publisher": "TEST suite only",
            "source_document": "TEST mock document",
            "source_year": 2024,
            "source_table_ref": "TEST Table",
            "gwp_basis": "AR6",
            "valid_from": dt.date(2025, 1, 1),
            "valid_to": dt.date(2025, 12, 31),
            "method": "direct",
            "provenance_class": "TEST"
        })
        self.assertEqual(test_factor.unit, "m3")


if __name__ == "__main__":
    unittest.main()
