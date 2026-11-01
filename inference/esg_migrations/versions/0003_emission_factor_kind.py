"""emission factor kind: grid average vs combined margin

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-02 00:00:00

Adds esg_emission_factor.factor_kind and check constraints that make a CDM combined-margin factor
unusable for Scope 2. The column is nullable: existing rows are not rewritten. The calculation
library blocks Scope 2 electricity factors whose kind is undeclared (FACTOR_KIND_UNDECLARED).
"""
from alembic import op
import sqlalchemy as sa


revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

CONSTRAINTS = (
    ('ck_esg_factor_kind',
     "factor_kind IS NULL OR factor_kind IN ('grid_average','grid_combined_margin','supplier_specific','residual_mix')"),
    ('ck_esg_factor_no_margin_scope2',
     "NOT (factor_kind = 'grid_combined_margin' AND method IN ('location','market'))"),
    ('ck_esg_factor_location_grid_average',
     "NOT (activity_type = 'electricity' AND method = 'location' AND factor_kind <> 'grid_average')"),
    ('ck_esg_factor_direct_kind', "method <> 'direct' OR factor_kind IS NULL"),
)


def upgrade():
    with op.batch_alter_table('esg_emission_factor') as batch:
        batch.add_column(sa.Column('factor_kind', sa.String(length=30), nullable=True))
        for name, condition in CONSTRAINTS:
            batch.create_check_constraint(name, condition)


def downgrade():
    with op.batch_alter_table('esg_emission_factor') as batch:
        for name, _ in reversed(CONSTRAINTS):
            batch.drop_constraint(name, type_='check')
        batch.drop_column('factor_kind')
