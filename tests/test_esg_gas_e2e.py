"""
End-to-end trace for natural gas through real profile detection (Task 3):
Profile Detection -> Extraction -> Gaps -> Entered Value -> Estimate -> Post -> Dual Approval -> Period Calculation.

All factor values used are test fixtures clearly labelled 'TEST'.
Hand-calculation:
  Activity: 5,000 m3 natural gas
  Factor: 1.915000 kgCO2e / m3 (TEST factor, IPCC 2006 Vol 2 Ch 2 default combustion energy basis)
  Emissions: 5,000 * 1.915000 = 9,575.00 kgCO2e = 9.575000 tCO2e (Scope 1)
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

        # Load and dual-approve published natural gas factor (TEST fixture)
        self.factor = ledger.load_published_factor(
            self.db, self.p_preparer,
            family="titas-natural-gas-test",
            activity_type="natural_gas",
            unit="m3",
            kgco2e_per_unit=D("1.915000"),
            region="BD-NATIONAL",
            source_publisher="TEST fixture - IPCC 2006 Guidelines for National GHG Inventories",
            source_document="IPCC Vol 2 Energy, Ch 2 Stationary Combustion, Table 2.2 (default 56.1 kg/TJ, 34.13 MJ/m3)",
            source_year=2021,
            source_page="Table 2.2, p. 2.16",
            source_url="https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf",
            gwp_basis="AR6",
            valid_from=dt.date(2025, 1, 1),
            valid_to=dt.date(2025, 12, 31),
            method="direct"
        )
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

        # Step 5: Estimate
        estimate = bill_service.estimate_bill(self.db, self.p_preparer, bill.id, allow_provisional=False)
        self.assertEqual(estimate["status"], "INDICATIVE")
        self.assertEqual(len(estimate["calc_blockers"]), 0)
        emissions = estimate["emissions"]
        self.assertIsNotNone(emissions)
        self.assertEqual(emissions["scope1_kg"], "9575.000000")
        self.assertEqual(emissions["scope2_location_kg"], "0")
        self.assertEqual(emissions["scope1_tco2e"], "9.575")
        self.assertEqual(emissions["total_tco2e"], "9.575")
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

        # Step 8: Period Calculation & Lock
        calc_run = ledger.calculate_period(self.db, self.p_preparer, self.period.id)
        self.assertEqual(str(calc_run.scope1_kg), "9575.000000")
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


if __name__ == "__main__":
    unittest.main()
