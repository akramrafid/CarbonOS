"""Alembic environment for carbon_monitoring dMRV tables (Base). Shared DB tables belonging
to ESG ledger or Django are excluded so migrations never collide."""
import os
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from carbon_monitoring.database import Base  # noqa: E402
from carbon_monitoring import models  # noqa: E402,F401

config = context.config
target_metadata = Base.metadata
VERSION_TABLE = "carbon_alembic_version"


def include_object(obj, name, type_, reflected, compare_to):
    if type_ == "table":
        return name in target_metadata.tables
    return True


def run_migrations_offline():
    context.configure(url=config.get_main_option("sqlalchemy.url"), target_metadata=target_metadata,
                      literal_binds=True, version_table=VERSION_TABLE, include_object=include_object)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}),
                                     prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, version_table=VERSION_TABLE,
                          include_object=include_object, render_as_batch=connection.dialect.name == "sqlite")
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
