"""dated equipment register events: install / retire / recharge, with the full charge per gas

Revision ID: 0006
Revises: 0005
Create Date: 2026-11-02 00:00:00

Refrigerant mass balance E = (stored_start − stored_end) + (purchased − returned_or_sold)
+ (equipment_charge_start − equipment_charge_end) takes the equipment charge from these events. Events are
append-only; a wrong one is voided with a reason. New table only: no existing row is touched.
"""
from alembic import op
import sqlalchemy as sa


revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'esg_equipment_event',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('equipment_id', sa.String(length=36), nullable=False),
        sa.Column('event_type', sa.String(length=10), nullable=False),
        sa.Column('event_date', sa.Date(), nullable=False),
        sa.Column('refrigerant', sa.String(length=30), nullable=True),
        sa.Column('charge_kg', sa.Numeric(precision=28, scale=6), nullable=True),
        sa.Column('source_ref', sa.String(length=200), nullable=True),
        sa.Column('evidence_snippet', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('voided_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('voided_by', sa.String(length=255), nullable=True),
        sa.Column('void_reason', sa.Text(), nullable=True),
        sa.CheckConstraint("event_type IN ('install','retire','recharge')", name='ck_esg_equipment_event_type'),
        sa.CheckConstraint("(event_type = 'retire' AND refrigerant IS NULL AND charge_kg IS NULL) OR "
                           "(event_type <> 'retire' AND refrigerant IS NOT NULL AND charge_kg > 0)",
                           name='ck_esg_equipment_event_charge'),
        sa.CheckConstraint("voided_at IS NULL OR void_reason IS NOT NULL", name='ck_esg_equipment_event_void'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'equipment_id'], ['esg_equipment.organization_id', 'esg_equipment.id'],
                                name='fk_esg_equipment_event_equipment'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_esg_equipment_event_organization_id'), 'esg_equipment_event', ['organization_id'],
                    unique=False)
    op.create_index('ix_esg_equipment_event_equipment', 'esg_equipment_event', ['equipment_id', 'event_date'],
                    unique=False)


def downgrade():
    op.drop_index('ix_esg_equipment_event_equipment', table_name='esg_equipment_event')
    op.drop_index(op.f('ix_esg_equipment_event_organization_id'), table_name='esg_equipment_event')
    op.drop_table('esg_equipment_event')
