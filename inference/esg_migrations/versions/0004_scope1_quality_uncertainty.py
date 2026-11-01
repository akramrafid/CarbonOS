"""scope 1 completion: gas-level factors, data quality, uncertainty, gas heating values, refrigerants

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-02 00:00:00

All new columns are nullable and existing rows are not rewritten. esg_calculation_line.factor_id and
factor_version become nullable because refrigerant lines use the methodology's pinned GWPs, not a factor row.
"""
from alembic import op
import sqlalchemy as sa


revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None

QTY = sa.Numeric(precision=28, scale=10)
PCT = sa.Numeric(precision=12, scale=6)


def upgrade():
    with op.batch_alter_table('esg_reporting_period') as batch:
        batch.add_column(sa.Column('gwp_basis', sa.String(length=10), nullable=True))
        batch.create_check_constraint('ck_esg_period_gwp_basis', "gwp_basis IS NULL OR gwp_basis IN ('AR5','AR6')")
    with op.batch_alter_table('esg_emission_factor') as batch:
        batch.add_column(sa.Column('gas_components', sa.JSON(), nullable=True))
        batch.add_column(sa.Column('uncertainty_pct', PCT, nullable=True))
    with op.batch_alter_table('esg_activity_record') as batch:
        batch.add_column(sa.Column('data_quality', sa.String(length=12), nullable=True))
        batch.add_column(sa.Column('uncertainty_pct', PCT, nullable=True))
        batch.add_column(sa.Column('generator_id', sa.String(length=100), nullable=True))
        batch.add_column(sa.Column('heating_value', sa.JSON(), nullable=True))
        batch.add_column(sa.Column('volume_correction', QTY, nullable=True))
        batch.add_column(sa.Column('refrigerant', sa.String(length=30), nullable=True))
        batch.add_column(sa.Column('mass_balance', sa.JSON(), nullable=True))
        batch.create_check_constraint(
            'ck_esg_activity_data_quality',
            "data_quality IS NULL OR data_quality IN ('metered','billed','estimated','default')")
    with op.batch_alter_table('esg_calculation_run') as batch:
        batch.add_column(sa.Column('gwp_basis', sa.String(length=10), nullable=True))
        batch.add_column(sa.Column('uncertainty', sa.JSON(), nullable=True))
    with op.batch_alter_table('esg_calculation_line') as batch:
        batch.alter_column('factor_id', existing_type=sa.String(length=36), nullable=True)
        batch.alter_column('factor_version', existing_type=sa.Integer(), nullable=True)
        batch.add_column(sa.Column('data_quality', sa.String(length=12), nullable=True))
        batch.add_column(sa.Column('uncertainty_pct', PCT, nullable=True))
        batch.add_column(sa.Column('factor_ref', sa.String(length=200), nullable=True))
        batch.add_column(sa.Column('details', sa.JSON(), nullable=True))


def downgrade():
    with op.batch_alter_table('esg_calculation_line') as batch:
        for name in ('details', 'factor_ref', 'uncertainty_pct', 'data_quality'):
            batch.drop_column(name)
        batch.alter_column('factor_version', existing_type=sa.Integer(), nullable=False)
        batch.alter_column('factor_id', existing_type=sa.String(length=36), nullable=False)
    with op.batch_alter_table('esg_calculation_run') as batch:
        batch.drop_column('uncertainty')
        batch.drop_column('gwp_basis')
    with op.batch_alter_table('esg_activity_record') as batch:
        batch.drop_constraint('ck_esg_activity_data_quality', type_='check')
        for name in ('mass_balance', 'refrigerant', 'volume_correction', 'heating_value', 'generator_id',
                     'uncertainty_pct', 'data_quality'):
            batch.drop_column(name)
    with op.batch_alter_table('esg_emission_factor') as batch:
        batch.drop_column('uncertainty_pct')
        batch.drop_column('gas_components')
    with op.batch_alter_table('esg_reporting_period') as batch:
        batch.drop_constraint('ck_esg_period_gwp_basis', type_='check')
        batch.drop_column('gwp_basis')
