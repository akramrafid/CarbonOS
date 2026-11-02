"""
Data migrations: one-off, reviewed changes to existing rows. Unlike Alembic schema migrations they never run at
startup. Each one is a dry run by default, prints exactly what it would change, and writes only with --apply.
"""
