"""Tenant isolation columns, hash chain index/snapshot, and accredited validators table

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-19 00:00:01
"""
from alembic import op
import sqlalchemy as sa


revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    patches = {
        "farmers_ai_carbonresult": [
            ("forest_stratum", sa.String(length=50)),
            ("carbon_agb_tc_ha", sa.Float()),
            ("carbon_bgb_tc_ha", sa.Float()),
            ("carbon_soc_tc_ha", sa.Float()),
            ("relative_margin_of_error", sa.Float()),
            ("verra_precision_discount_pct", sa.Float()),
            ("conservative_creditable_tco2e", sa.Float()),
            ("parcel_id", sa.String(length=255)),
            ("biomass_agb_mg_ha", sa.Float()),
            ("biomass_bgb_mg_ha", sa.Float()),
            ("indices_json", sa.Text()),
            ("interval_json", sa.Text()),
        ],
        "farmers_ai_analysisjob": [("organization_id", sa.String(length=64))],
        "farmers_ai_uploadedboundary": [("organization_id", sa.String(length=64))],
        "carbon_mrv_groundtruthplot": [("organization_id", sa.String(length=64))],
        "farmers_ai_carbonalert": [("organization_id", sa.String(length=64))],
        "carbon_mrv_estimateprovenance": [
            ("chain_index", sa.Integer()),
            ("quantification_snapshot_json", sa.Text()),
        ],
    }
    for tbl, cols in patches.items():
        if tbl not in existing_tables:
            continue
        present = {c["name"] for c in inspector.get_columns(tbl)}
        with op.batch_alter_table(tbl) as batch_op:
            for col_name, col_type in cols:
                if col_name not in present:
                    batch_op.add_column(sa.Column(col_name, col_type, nullable=True))

    if "carbon_mrv_accreditedvalidator" not in existing_tables:
        op.create_table(
            "carbon_mrv_accreditedvalidator",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("organization_id", sa.String(length=64), nullable=False),
            sa.Column("validator_name", sa.String(length=255), nullable=False),
            sa.Column("accreditation_body", sa.String(length=100), nullable=False),
            sa.Column("public_key_hex", sa.String(length=64), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("registered_by", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("revoked_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("organization_id", "public_key_hex", name="uq_validator_org_pubkey"),
        )


def downgrade():
    pass
