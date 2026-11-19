"""Scope 3 value-chain ledger, dated facility ownership, and Ch. 5 base-year policy

Revision ID: 0010
Revises: 0009
Create Date: 2026-11-19 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'esg_facility_ownership',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=False),
        sa.Column('effective_from', sa.Date(), nullable=False),
        sa.Column('effective_to', sa.Date(), nullable=True),
        sa.Column('operational_control', sa.Boolean(), nullable=False),
        sa.Column('financial_control', sa.Boolean(), nullable=False),
        sa.Column('equity_share_pct', sa.Numeric(precision=7, scale=4), nullable=False),
        sa.Column('change_reason', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("equity_share_pct >= 0 AND equity_share_pct <= 100", name='ck_esg_fac_ownership_equity'),
        sa.CheckConstraint("effective_to IS NULL OR effective_to >= effective_from", name='ck_esg_fac_ownership_dates'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'], ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_fac_ownership_facility'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_esg_facility_ownership_organization_id'), 'esg_facility_ownership', ['organization_id'])
    op.create_index('ix_esg_fac_ownership_facility_date', 'esg_facility_ownership',
                    ['organization_id', 'facility_id', 'effective_from'])

    op.create_table(
        'esg_base_year_policy',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('base_year_period_id', sa.String(length=36), nullable=False),
        sa.Column('significance_threshold_pct', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('base_year_scope1_tco2e', sa.Numeric(precision=28, scale=6), nullable=False),
        sa.Column('base_year_scope2_tco2e', sa.Numeric(precision=28, scale=6), nullable=False),
        sa.Column('base_year_scope3_tco2e', sa.Numeric(precision=28, scale=6), nullable=False),
        sa.Column('restatement_history', sa.JSON(), nullable=False),
        sa.Column('updated_by', sa.String(length=255), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("significance_threshold_pct > 0 AND significance_threshold_pct <= 100",
                           name='ck_esg_base_year_threshold'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'base_year_period_id'],
                                ['esg_reporting_period.organization_id', 'esg_reporting_period.id'],
                                name='fk_esg_base_year_period'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', name='uq_esg_base_year_org'),
    )
    op.create_index(op.f('ix_esg_base_year_policy_organization_id'), 'esg_base_year_policy', ['organization_id'])

    op.create_table(
        'esg_scope3_record',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('period_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=True),
        sa.Column('category', sa.String(length=40), nullable=False),
        sa.Column('calculation_method', sa.String(length=20), nullable=False),
        sa.Column('supplier_name', sa.String(length=200), nullable=True),
        sa.Column('activity_description', sa.String(length=500), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=28, scale=10), nullable=False),
        sa.Column('unit', sa.String(length=30), nullable=False),
        sa.Column('factor_kgco2e_per_unit', sa.Numeric(precision=28, scale=10), nullable=False),
        sa.Column('factor_source', sa.String(length=400), nullable=False),
        sa.Column('emissions_kg', sa.Numeric(precision=28, scale=6), nullable=False),
        sa.Column('data_quality', sa.String(length=12), nullable=True),
        sa.Column('uncertainty_pct', sa.Numeric(precision=12, scale=6), nullable=True),
        sa.Column('status', sa.String(length=12), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by', sa.String(length=255), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_comment', sa.Text(), nullable=True),
        sa.CheckConstraint("quantity >= 0 AND factor_kgco2e_per_unit >= 0 AND emissions_kg >= 0",
                           name='ck_esg_scope3_nonnegative'),
        sa.CheckConstraint("reviewed_by IS NULL OR reviewed_by <> created_by", name='ck_esg_scope3_dual_control'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'period_id'],
                                ['esg_reporting_period.organization_id', 'esg_reporting_period.id'],
                                name='fk_esg_scope3_period'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'],
                                ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_scope3_facility'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_esg_scope3_record_organization_id'), 'esg_scope3_record', ['organization_id'])
    op.create_index('ix_esg_scope3_period_cat', 'esg_scope3_record', ['organization_id', 'period_id', 'category'])


def downgrade():
    op.drop_index('ix_esg_scope3_period_cat', table_name='esg_scope3_record')
    op.drop_index(op.f('ix_esg_scope3_record_organization_id'), table_name='esg_scope3_record')
    op.drop_table('esg_scope3_record')
    op.drop_index(op.f('ix_esg_base_year_policy_organization_id'), table_name='esg_base_year_policy')
    op.drop_table('esg_base_year_policy')
    op.drop_index('ix_esg_fac_ownership_facility_date', table_name='esg_facility_ownership')
    op.drop_index(op.f('ix_esg_facility_ownership_organization_id'), table_name='esg_facility_ownership')
    op.drop_table('esg_facility_ownership')
