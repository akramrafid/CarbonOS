"""Initial baseline carbon_monitoring dMRV schema

Revision ID: 0001
Revises:
Create Date: 2026-11-19 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    from carbon_monitoring.database import Base
    from carbon_monitoring import models  # noqa: F401
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade():
    pass
