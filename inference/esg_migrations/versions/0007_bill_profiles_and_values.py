"""dynamic bill parameters: versioned parameter definitions and profiles, bills, long-form values

Revision ID: 0007
Revises: 0006
Create Date: 2026-11-02 00:00:00

New tables only; no existing row is touched. Definitions and profiles follow the factor pattern: versioned,
DRAFT until a second person approves, NULL organization = platform-wide.
"""
from alembic import op
import sqlalchemy as sa


revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None


def _definition_audit():
    return [sa.Column('status', sa.String(length=10), nullable=False),
            sa.Column('created_by', sa.String(length=255), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('approved_by', sa.String(length=255), nullable=True),
            sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True)]


def upgrade():
    op.create_table(
        'esg_bill_parameter',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=True),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('definition', sa.JSON(), nullable=False),
        sa.Column('content_sha256', sa.String(length=64), nullable=False),
        *_definition_audit(),
        sa.CheckConstraint("status IN ('DRAFT','APPROVED','RETIRED')", name='ck_esg_bill_parameter_status'),
        sa.CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name='ck_esg_bill_parameter_dual_control'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'key', 'version', name='uq_esg_bill_parameter_version'),
    )
    op.create_index(op.f('ix_esg_bill_parameter_organization_id'), 'esg_bill_parameter', ['organization_id'])
    op.create_index('ix_esg_bill_parameter_key', 'esg_bill_parameter', ['key', 'version'])

    op.create_table(
        'esg_bill_profile',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=True),
        sa.Column('profile_key', sa.String(length=80), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('issuer', sa.String(length=100), nullable=False),
        sa.Column('document_type', sa.String(length=30), nullable=False),
        sa.Column('layout_version', sa.String(length=100), nullable=False),
        sa.Column('effective_from', sa.Date(), nullable=False),
        sa.Column('effective_to', sa.Date(), nullable=True),
        sa.Column('definition', sa.JSON(), nullable=False),
        sa.Column('content_sha256', sa.String(length=64), nullable=False),
        *_definition_audit(),
        sa.CheckConstraint("status IN ('DRAFT','APPROVED','RETIRED')", name='ck_esg_bill_profile_status'),
        sa.CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name='ck_esg_bill_profile_dual_control'),
        sa.CheckConstraint("effective_to IS NULL OR effective_to >= effective_from", name='ck_esg_bill_profile_dates'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'profile_key', 'version', name='uq_esg_bill_profile_version'),
    )
    op.create_index(op.f('ix_esg_bill_profile_organization_id'), 'esg_bill_profile', ['organization_id'])
    op.create_index('ix_esg_bill_profile_key', 'esg_bill_profile', ['profile_key', 'version'])

    op.create_table(
        'esg_bill',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('facility_id', sa.String(length=36), nullable=False),
        sa.Column('profile_id', sa.String(length=36), nullable=True),
        sa.Column('profile_key', sa.String(length=80), nullable=True),
        sa.Column('profile_version', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('source', sa.String(length=10), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=True),
        sa.Column('document_sha256', sa.String(length=64), nullable=False),
        sa.Column('document', sa.JSON(), nullable=False),
        sa.Column('findings', sa.JSON(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('posted_by', sa.String(length=255), nullable=True),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('UNKNOWN_PROFILE','AMBIGUOUS_PROFILE','EXTRACTED','POSTED')", name='ck_esg_bill_status'),
        sa.CheckConstraint("source IN ('pdf_text','ocr','manual')", name='ck_esg_bill_source'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'facility_id'], ['esg_facility.organization_id', 'esg_facility.id'],
                                name='fk_esg_bill_facility'),
        sa.ForeignKeyConstraint(['profile_id'], ['esg_bill_profile.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'id', name='uq_esg_bill_org_id'),
    )
    op.create_index(op.f('ix_esg_bill_organization_id'), 'esg_bill', ['organization_id'])
    op.create_index('ix_esg_bill_org_facility', 'esg_bill', ['organization_id', 'facility_id'])

    op.create_table(
        'esg_bill_value',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('organization_id', sa.String(length=36), nullable=False),
        sa.Column('bill_id', sa.String(length=36), nullable=False),
        sa.Column('parameter_key', sa.String(length=100), nullable=True),
        sa.Column('profile_version', sa.Integer(), nullable=True),
        sa.Column('group_index', sa.String(length=200), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('value_text', sa.String(length=500), nullable=True),
        sa.Column('unit', sa.String(length=30), nullable=True),
        sa.Column('page', sa.Integer(), nullable=True),
        sa.Column('bbox', sa.JSON(), nullable=True),
        sa.Column('source', sa.String(length=10), nullable=False),
        sa.Column('status', sa.String(length=12), nullable=False),
        sa.Column('confidence', sa.Numeric(precision=6, scale=5), nullable=True),
        sa.Column('extracted_value_text', sa.String(length=500), nullable=True),
        sa.Column('review_comment', sa.Text(), nullable=True),
        sa.Column('confirmed_by', sa.String(length=255), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('activity_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status IN ('extracted','confirmed','corrected','rejected','unmapped','derived','superseded')",
                           name='ck_esg_bill_value_status'),
        sa.CheckConstraint("source IN ('pdf_text','ocr','manual','derived')", name='ck_esg_bill_value_source'),
        sa.CheckConstraint("status NOT IN ('confirmed','corrected','rejected') OR confirmed_by IS NOT NULL",
                           name='ck_esg_bill_value_reviewer'),
        sa.CheckConstraint("status = 'unmapped' OR status = 'superseded' OR parameter_key IS NOT NULL",
                           name='ck_esg_bill_value_key'),
        sa.ForeignKeyConstraint(['organization_id'], ['esg_organization.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id', 'bill_id'], ['esg_bill.organization_id', 'esg_bill.id'],
                                name='fk_esg_bill_value_bill'),
        sa.ForeignKeyConstraint(['activity_id'], ['esg_activity_record.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_esg_bill_value_organization_id'), 'esg_bill_value', ['organization_id'])
    op.create_index('ix_esg_bill_value_bill', 'esg_bill_value', ['bill_id'])
    op.create_index('ix_esg_bill_value_key', 'esg_bill_value', ['organization_id', 'parameter_key', 'status'])


def downgrade():
    for table, indexes in (
            ('esg_bill_value', ('ix_esg_bill_value_key', 'ix_esg_bill_value_bill', 'ix_esg_bill_value_organization_id')),
            ('esg_bill', ('ix_esg_bill_org_facility', 'ix_esg_bill_organization_id')),
            ('esg_bill_profile', ('ix_esg_bill_profile_key', 'ix_esg_bill_profile_organization_id')),
            ('esg_bill_parameter', ('ix_esg_bill_parameter_key', 'ix_esg_bill_parameter_organization_id'))):
        for index in indexes:
            op.drop_index(index, table_name=table)
        op.drop_table(table)
