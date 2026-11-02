"""contractual instruments for market-based Scope 2

Revision ID: 0009
Revises: 0008
Create Date: 2026-11-02 00:00:00

Energy attribute certificates and power purchase agreements, attested against the Scope 2 Quality Criteria and approved
by a second person, are the first level of the market-based hierarchy. New table only: no existing row is touched.
"""
from alembic import op
import sqlalchemy as sa


revision = '0009'
down_revision = '0008'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'esg_contractual_instrument',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=False),
        sa.Column('period_id', sa.String(length=36), nullable=False),
        sa.Column('instrument_type', sa.String(length=40), nullable=False),
        sa.Column('instrument_ref', sa.String(length=200), nullable=False),
        sa.Column('registry', sa.String(length=100), nullable=True),
        sa.Column('generation_market', sa.String(length=50), nullable=False),
        sa.Column('generation_technology', sa.String(length=50), nullable=True),
        sa.Column('generation_start', sa.Date(), nullable=False),
        sa.Column('generation_end', sa.Date(), nullable=False),
        sa.Column('mwh', sa.Numeric(precision=28, scale=6), nullable=False),
        sa.Column('emission_rate_kg_per_kwh', sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column('applies_from', sa.Date(), nullable=False),
        sa.Column('applies_to', sa.Date(), nullable=False),
        sa.Column('quality_criteria', sa.JSON(), nullable=False),
        sa.Column('source_document_id', sa.String(length=36), nullable=True),
        sa.Column('evidence_snippet', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=10), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('approved_by', sa.String(length=255), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('DRAFT','APPROVED','RETIRED')", name='ck_esg_instrument_status'),
        sa.CheckConstraint("instrument_type IN ('energy_attribute_certificate','power_purchase_agreement')",
                           name='ck_esg_instrument_type'),
        sa.CheckConstraint("mwh > 0 AND emission_rate_kg_per_kwh >= 0", name='ck_esg_instrument_values'),
        sa.CheckConstraint("applies_to >= applies_from AND generation_end >= generation_start",
                           name='ck_esg_instrument_dates'),
        sa.CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name='ck_esg_instrument_dual_control'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'], ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_instrument_facility'),
        sa.ForeignKeyConstraint(['organization_id', 'period_id'],
                                ['esg_reporting_period.organization_id', 'esg_reporting_period.id'],
                                name='fk_esg_instrument_period'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_esg_instrument_org_id'),
    )
    op.create_index(op.f('ix_esg_contractual_instrument_organization_id'), 'esg_contractual_instrument',
                    ['organization_id'])


def downgrade():
    op.drop_index(op.f('ix_esg_contractual_instrument_organization_id'), table_name='esg_contractual_instrument')
    op.drop_table('esg_contractual_instrument')
