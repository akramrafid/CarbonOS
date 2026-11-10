"""
Tests for emission factor provenance classification and guardrails:
- Provenance classification: SYNTHETIC | PUBLISHED | DERIVED_FROM_PUBLISHED
- Synthetic factors are permanently refused from approval into the ledger
- Human-audited published factor loader path with cited document, publisher, year, page, value
- /estimate refuses SYNTHETIC factors outside demo tenants (SYNTHETIC_FACTOR_INPUTS)
- In demo tenants, output is labeled 'DEMO - SYNTHETIC FACTOR'
"""
import datetime as dt
from decimal import Decimal as D
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from carbon_monitoring.database import Base
from esg_rag.database import EsgBase
from esg_rag.models import ESGOrganization, ESGMembership
from esg_rag.ledger_models import LegalEntity, Facility, Bill, BillValue, BillProfile, EmissionFactor
from esg_rag import ledger, bill_service
from esg_rag.auth import Principal


class TestFactorProvenanceGuardrails(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        event.listen(self.engine, "connect", lambda conn, _: conn.execute("PRAGMA foreign_keys=ON"))
        Base.metadata.create_all(self.engine)
        EsgBase.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Create real org and members
        self.org_real = ESGOrganization(name="Real Enterprise Org", is_demo=False, created_by_sub="admin-real")
        self.db.add(self.org_real)
        self.db.commit()

        self.db.add(ESGMembership(organization_id=self.org_real.id, user_sub="admin-real", role="esg_admin"))
        self.db.add(ESGMembership(organization_id=self.org_real.id, user_sub="approver-real", role="esg_admin"))
        self.db.commit()

        self.p_author = Principal("admin-real", self.org_real.id, "esg_admin", False, False)
        self.p_approver = Principal("approver-real", self.org_real.id, "esg_admin", False, False)

    def tearDown(self):
        self.db.close()

    def test_synthetic_factor_cannot_be_approved(self):
        """A factor with SYNTHETIC inputs must be flagged SYNTHETIC and rejected at approval."""
        factor_synthetic = ledger.create_factor(self.db, self.p_author, {
            "family": "synthetic-test-factor",
            "activity_type": "electricity",
            "unit": "kWh",
            "kgco2e_per_unit": "0.663096",
            "region": "BD-NATIONAL",
            "gwp_basis": "AR6",
            "method": "location",
            "factor_kind": "grid_average",
            "valid_from": dt.date(2024, 1, 1),
            "source_publisher": "SYNTHETIC BPDB Calibration p.62",
            "source_document": "Not a real document",
            "source_year": 2023
        })
        self.assertEqual(factor_synthetic.provenance_class, "SYNTHETIC")
        self.assertEqual(factor_synthetic.status, "DRAFT")

        # Approval must fail closed with 422 DomainError
        with self.assertRaises(ledger.DomainError) as ctx:
            ledger.approve_factor(self.db, self.p_approver, factor_synthetic.id)
        self.assertEqual(ctx.exception.status, 422)
        self.assertIn("Synthetic factors cannot be approved", ctx.exception.message)

    def test_published_factor_loading_and_dual_approval(self):
        """load_published_factor loads audited published data and permits dual approval."""
        factor_published = ledger.load_published_factor(
            self.db, self.p_author,
            family="berc-grid-published",
            activity_type="electricity",
            unit="kWh",
            kgco2e_per_unit=D("0.612000"),
            region="BD-NATIONAL",
            source_publisher="Bangladesh Energy Regulatory Commission",
            source_document="BERC Gazette Notification No. 12-2023",
            source_year=2023,
            source_page="Table 4, p. 12",
            source_url="http://berc.org.bd/tariff/2023",
            gwp_basis="AR6",
            valid_from=dt.date(2023, 1, 1),
            valid_to=dt.date(2024, 12, 31),
            method="location",
            factor_kind="grid_average"
        )
        self.assertEqual(factor_published.provenance_class, "PUBLISHED")
        self.assertEqual(factor_published.status, "DRAFT")
        self.assertEqual(factor_published.kgco2e_per_unit, D("0.612000"))

        # Dual-control approval succeeds
        approved = ledger.approve_factor(self.db, self.p_approver, factor_published.id)
        self.assertEqual(approved.status, "APPROVED")
        self.assertEqual(approved.approved_by, "approver-real")

    def test_estimate_refuses_synthetic_outside_demo(self):
        """Outside demo tenants, estimate_bill returns SYNTHETIC_FACTOR_INPUTS blocker."""
        from esg_rag import bill_profiles as bp
        profiles = bp.repo_profiles()
        elec_profile_dict = next(p for p in profiles if str(p.get("document_type")).startswith("electricity"))

        prof = BillProfile(
            profile_key=elec_profile_dict["profile_key"], version=1, issuer=elec_profile_dict["issuer"],
            document_type="electricity", layout_version="v1", effective_from=dt.date(2024, 1, 1),
            content_sha256="0" * 64, status="APPROVED", created_by="admin-real",
            definition=elec_profile_dict
        )
        self.db.add(prof)
        self.db.commit()

        le = LegalEntity(organization_id=self.org_real.id, name="Real Mill Ltd", country="BD")
        self.db.add(le)
        self.db.commit()

        fac = Facility(
            organization_id=self.org_real.id, legal_entity_id=le.id, name="Real Factory",
            country="BD", grid_region="BD-NATIONAL", operational_control=True,
            financial_control=True, equity_share_pct=D(100)
        )
        self.db.add(fac)
        self.db.commit()

        bill = Bill(
            organization_id=self.org_real.id, facility_id=fac.id, filename="bill.pdf",
            document_sha256="0" * 64, document={"pages": []}, profile_id=prof.id,
            profile_key=prof.profile_key, profile_version=1, source="pdf_text", status="EXTRACTED",
            created_by="admin-real"
        )
        self.db.add(bill)
        self.db.commit()

        self.db.add(BillValue(organization_id=self.org_real.id, bill_id=bill.id, parameter_key="period.start",
                              value_text="2025-01-01", status="confirmed", source="manual", confirmed_by="admin-real"))
        self.db.add(BillValue(organization_id=self.org_real.id, bill_id=bill.id, parameter_key="period.end",
                              value_text="2025-01-31", status="confirmed", source="manual", confirmed_by="admin-real"))
        self.db.add(BillValue(organization_id=self.org_real.id, bill_id=bill.id, parameter_key="energy.kwh.total",
                              value_text="10000", unit="kWh", status="confirmed", source="manual", confirmed_by="admin-real"))
        self.db.commit()

        est = bill_service.estimate_bill(self.db, self.p_author, bill.id, allow_provisional=True)
        self.assertIn("SYNTHETIC_FACTOR_INPUTS", est["calc_blockers"])
        self.assertIsNone(est["emissions"])
        self.assertIn("SYNTHETIC_FACTOR_INPUTS", est["message"])

    def test_estimate_labels_demo_synthetic_factor(self):
        """Inside demo tenants, estimate_bill allows synthetic factor and labels output."""
        from esg_rag import bill_profiles as bp
        profiles = bp.repo_profiles()
        elec_profile_dict = next(p for p in profiles if str(p.get("document_type")).startswith("electricity"))

        prof = BillProfile(
            profile_key="demo-" + elec_profile_dict["profile_key"], version=1, issuer=elec_profile_dict["issuer"],
            document_type="electricity", layout_version="v1", effective_from=dt.date(2024, 1, 1),
            content_sha256="1" * 64, status="APPROVED", created_by="demo-user",
            definition=elec_profile_dict
        )
        self.db.add(prof)
        self.db.commit()

        demo_org = ESGOrganization(name="Demo Textile Ltd", is_demo=True, created_by_sub="demo-user")
        self.db.add(demo_org)
        self.db.commit()

        p_demo = Principal("demo-user", demo_org.id, "esg_admin", is_demo=True, is_platform_operator=False)

        le_d = LegalEntity(organization_id=demo_org.id, name="Demo LE", country="BD")
        self.db.add(le_d)
        self.db.commit()

        fac_d = Facility(
            organization_id=demo_org.id, legal_entity_id=le_d.id, name="Demo Plant",
            country="BD", grid_region="BD-NATIONAL", operational_control=True,
            financial_control=True, equity_share_pct=D(100)
        )
        self.db.add(fac_d)
        self.db.commit()

        bill_d = Bill(
            organization_id=demo_org.id, facility_id=fac_d.id, filename="demo_bill.pdf",
            document_sha256="2" * 64, document={"pages": []}, profile_id=prof.id,
            profile_key=prof.profile_key, profile_version=1, source="pdf_text", status="EXTRACTED",
            created_by="demo-user"
        )
        self.db.add(bill_d)
        self.db.commit()

        self.db.add(BillValue(organization_id=demo_org.id, bill_id=bill_d.id, parameter_key="period.start",
                              value_text="2025-01-01", status="confirmed", source="manual", confirmed_by="demo-user"))
        self.db.add(BillValue(organization_id=demo_org.id, bill_id=bill_d.id, parameter_key="period.end",
                              value_text="2025-01-31", status="confirmed", source="manual", confirmed_by="demo-user"))
        self.db.add(BillValue(organization_id=demo_org.id, bill_id=bill_d.id, parameter_key="energy.kwh.total",
                              value_text="10000", unit="kWh", status="confirmed", source="manual", confirmed_by="demo-user"))
        self.db.commit()

        est_d = bill_service.estimate_bill(self.db, p_demo, bill_d.id, allow_provisional=True)
        self.assertNotIn("SYNTHETIC_FACTOR_INPUTS", est_d["calc_blockers"])
        self.assertEqual(est_d.get("label"), "DEMO - SYNTHETIC FACTOR")
        self.assertIn("DEMO - SYNTHETIC FACTOR", est_d.get("flags", []))


if __name__ == "__main__":
    unittest.main()
