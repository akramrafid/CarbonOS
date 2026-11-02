"""facility equipment register, facility-scoped generator_ref, legacy factor lifecycle columns

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-02 00:00:00

* esg_equipment: captive generators and refrigeration units. The reference is unique per facility
  (uq_esg_equipment_facility_ref), so 'G1' at two factories is two generators.
* esg_activity_record.generator_id is renamed generator_ref (values kept): a generator is identified by
  (facility_id, generator_ref).
* The legacy esg_emission_factors table (created by create_all, not owned by Alembic) gains nullable lifecycle
  columns so a withdrawn row can be RETIRED with a reason instead of being deleted or overwritten. Skipped when
  the table does not exist; columns already created from the current model are not added twice. No row is
  rewritten: setting a status is a separate, dry-run-first data migration
  (esg_rag/data_migrations/retire_withdrawn_grid_factor.py).
"""
from alembic import op
import sqlalchemy as sa


revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None

LEGACY_TABLE = 'esg_emission_factors'


def _legacy_columns():
    return [sa.Column('status', sa.String(length=10), nullable=True),
            sa.Column('status_reason', sa.Text(), nullable=True),
            sa.Column('status_changed_at', sa.DateTime(), nullable=True),
            sa.Column('status_changed_by', sa.String(length=255), nullable=True)]


def upgrade():
    op.create_table(
        'esg_equipment',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=False),
        sa.Column('equipment_ref', sa.String(length=100), nullable=False),
        sa.Column('kind', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('fuel', sa.String(length=20), nullable=True),
        sa.Column('rated_kw', sa.Numeric(precision=12, scale=3), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("kind IN ('generator','refrigeration')", name='ck_esg_equipment_kind'),
        sa.CheckConstraint("kind = 'generator' OR fuel IS NULL", name='ck_esg_equipment_fuel'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'], ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_equipment_facility'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('facility_id', 'equipment_ref', name='uq_esg_equipment_facility_ref'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_esg_equipment_org_id'),
    )
    op.create_index(op.f('ix_esg_equipment_organization_id'), 'esg_equipment', ['organization_id'], unique=False)
    with op.batch_alter_table('esg_activity_record') as batch:
        batch.alter_column('generator_id', new_column_name='generator_ref', existing_type=sa.String(length=100),
                           existing_nullable=True)

    inspector = sa.inspect(op.get_bind())
    if inspector.has_table(LEGACY_TABLE):
        present = {c['name'] for c in inspector.get_columns(LEGACY_TABLE)}
        for column in _legacy_columns():
            if column.name not in present:
                op.add_column(LEGACY_TABLE, column)  # nullable ADD COLUMN: no table copy, no row rewrite


def downgrade():
    # The legacy lifecycle columns stay: dropping them would erase retirement records.
    with op.batch_alter_table('esg_activity_record') as batch:
        batch.alter_column('generator_ref', new_column_name='generator_id', existing_type=sa.String(length=100),
                           existing_nullable=True)
    op.drop_index(op.f('ix_esg_equipment_organization_id'), table_name='esg_equipment')
    op.drop_table('esg_equipment')
