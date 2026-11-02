"""facility gas-analysis certificates with validity periods

Revision ID: 0008
Revises: 0007
Create Date: 2026-11-02 00:00:00

A distributor's certificate, approved by a second person, is the facility's heating value for natural gas used
inside its validity period. New table only: no existing row is touched.
"""
from alembic import op
import sqlalchemy as sa


revision = '0008'
down_revision = '0007'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'esg_gas_certificate',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=False),
        sa.Column('distributor', sa.String(length=100), nullable=False),
        sa.Column('certificate_ref', sa.String(length=200), nullable=False),
        sa.Column('gcv_mj_per_m3', sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column('ncv_to_gcv', sa.Numeric(precision=7, scale=6), nullable=False),
        sa.Column('reference_conditions', sa.String(length=100), nullable=False),
        sa.Column('valid_from', sa.Date(), nullable=False),
        sa.Column('valid_to', sa.Date(), nullable=False),
        sa.Column('uncertainty_pct', sa.Numeric(precision=12, scale=6), nullable=True),
        sa.Column('source_document_id', sa.String(length=36), nullable=True),
        sa.Column('evidence_snippet', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=10), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('approved_by', sa.String(length=255), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('DRAFT','APPROVED','RETIRED')", name='ck_esg_gas_certificate_status'),
        sa.CheckConstraint("valid_to >= valid_from", name='ck_esg_gas_certificate_validity'),
        sa.CheckConstraint("gcv_mj_per_m3 > 0 AND ncv_to_gcv > 0 AND ncv_to_gcv <= 1", name='ck_esg_gas_certificate_values'),
        sa.CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name='ck_esg_gas_certificate_dual_control'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'], ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_gas_certificate_facility'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_esg_gas_certificate_org_id'),
    )
    op.create_index(op.f('ix_esg_gas_certificate_organization_id'), 'esg_gas_certificate', ['organization_id'])


def downgrade():
    op.drop_index(op.f('ix_esg_gas_certificate_organization_id'), table_name='esg_gas_certificate')
    op.drop_table('esg_gas_certificate')
