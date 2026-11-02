"""
Data migration: retire the withdrawn 0.55 kg CO2e/kWh legacy grid factor.

Approved by the repository owner on 2026-11-02 (branch esg/bd-scope12-verifier-inventory). The row stays: nothing
is deleted and no value, unit or citation changes. Only the lifecycle columns added by Alembic migration 0005 are
set (status RETIRED, status_reason, status_changed_at, status_changed_by), and one esg_audit_event row records who
made the change and why.

Dry run by default: prints the rows it would change and writes nothing. --apply writes in one transaction.
The database URL is always explicit; this never reads DATABASE_URL, so it cannot touch another database by
accident.

    cd inference
    python -m esg_rag.data_migrations.retire_withdrawn_grid_factor --database-url sqlite:///../backend/db.sqlite3
    python -m esg_rag.data_migrations.retire_withdrawn_grid_factor --database-url ... --apply --actor <your id>
"""
import argparse
import datetime as dt
import os
import sys
from typing import Callable, List

from sqlalchemy import (
    JSON, Column, DateTime, Integer, MetaData, String, Table, and_, create_engine, func, inspect, make_url, or_, select,
    update,
)

BRANCH = "esg/bd-scope12-verifier-inventory"
TABLE = "esg_emission_factors"
LIFECYCLE = ("status", "status_reason", "status_changed_at", "status_changed_by")
WITHDRAWN_VALUE = 0.55  # kg CO2e/kWh, stored as a float in the legacy table
ACTION = "legacy_factor.retire"
REASON = (f"Withdrawn on branch {BRANCH} (commit fc64850): 0.55 kg CO2e/kWh is a CDM combined-margin value credited "
          "to a 'DoE Gazette' that could not be located. Location-based Scope 2 uses a grid-average factor (GHG "
          "Protocol Scope 2 Guidance). Retirement approved by the repository owner on 2026-11-02; the row is kept "
          "for audit and is never deleted.")
SHOWN = ("id", "category", "fuel_or_activity", "region", "factor_value", "unit", "source_citation", "year",
         "confidence_rating")

_audit = Table(  # the columns this migration writes; the table itself is created by Alembic migration 0001
    "esg_audit_event", MetaData(),
    Column("id", Integer, primary_key=True, autoincrement=True), Column("organization_id", String(36)),
    Column("actor_sub", String(255)), Column("action", String(60)), Column("entity_type", String(40)),
    Column("entity_id", String(36)), Column("data", JSON), Column("created_at", DateTime(timezone=True)))


def _scope2_rows(conn, t):
    """Every Scope 2 row for Bangladesh, oldest id first (shown, so rows outside the approval are visible too)."""
    cond = and_(t.c.category == "Scope 2", func.lower(t.c.region).like("%bangladesh%"))
    return conn.execute(select(t).where(cond).order_by(t.c.id)).mappings().all()


def _is_target(row) -> bool:
    """The approval covers the 0.55 grid row only, and only while it is not already retired."""
    return (row["factor_value"] == WITHDRAWN_VALUE and "grid" in (row["fuel_or_activity"] or "").lower()
            and row.get("status") != "RETIRED")


def run(database_url: str, apply: bool = False, actor: str = None, out: Callable[[str], None] = print) -> int:
    """0 = done (or nothing to do), 2 = a precondition failed and nothing was written."""
    if apply and not actor:
        out("ERROR: --apply needs --actor (who is making this change). Nothing written.")
        return 2
    url = make_url(database_url)
    if url.get_backend_name() == "sqlite" and url.database not in (None, "", ":memory:") \
            and not os.path.exists(url.database):  # connecting would create an empty database file
        out(f"ERROR: SQLite database file not found: {url.database}. Nothing written.")
        return 2
    engine = create_engine(database_url)
    try:
        return _run(engine, apply, actor, out)
    finally:
        engine.dispose()


def _run(engine, apply, actor, out) -> int:
    out(("APPLY" if apply else "DRY RUN (nothing is written)") + f": {engine.url.render_as_string(hide_password=True)}")
    insp = inspect(engine)
    if not insp.has_table(TABLE):
        out(f"Table {TABLE} not found: nothing to retire.")
        return 0
    t = Table(TABLE, MetaData(), autoload_with=engine)
    missing = [c for c in LIFECYCLE if c not in t.c]
    with engine.connect() as conn:
        total = conn.execute(select(func.count()).select_from(t)).scalar_one()
        scope2 = [dict(r) for r in _scope2_rows(conn, t)]
    targets = [r for r in scope2 if _is_target(r)]
    others = [r for r in scope2 if not _is_target(r)]

    out(f"Table {TABLE}: {total} rows. Lifecycle columns: "
        + ("present" if not missing else "MISSING (" + ", ".join(missing) + ")"))
    if missing:
        out("  Apply the Alembic schema upgrade first; migration 0005 adds them (nullable, no row rewritten):")
        out("  python -c \"from esg_rag.database import upgrade; upgrade('<database url>')\"")
    out(f"Rows to retire: {len(targets)}")
    for r in targets:
        out(_describe(r, actor))
    out(f"Other Scope 2 rows (not covered by the approval, left unchanged): {len(others)}")
    for r in others:
        out(f"  {r['id']}  {r['fuel_or_activity']}  {r['factor_value']} {r['unit']}  status={r.get('status') or 'NULL'}")
    if not targets:
        out("Nothing to do.")
        return 0
    has_audit = insp.has_table("esg_audit_event")
    out(f"Audit events to write: {len(targets) if has_audit else 0} ({ACTION}, entity_type legacy_emission_factor)"
        + ("" if has_audit else "  [esg_audit_event table not found: no audit row]"))
    if not apply:
        out("Re-run with --apply --actor <id> to make this change.")
        return 0
    if missing:
        out("ERROR: lifecycle columns are missing; nothing written.")
        return 2

    now = dt.datetime.now(dt.timezone.utc)
    with engine.begin() as conn:
        for r in targets:
            changed = conn.execute(
                update(t).where(t.c.id == r["id"], or_(t.c.status.is_(None), t.c.status != "RETIRED"))
                .values(status="RETIRED", status_reason=REASON, status_changed_at=now.replace(tzinfo=None),
                        status_changed_by=actor)).rowcount
            if changed != 1:
                raise RuntimeError(f"Row {r['id']} changed concurrently; transaction rolled back")
            if has_audit:
                conn.execute(_audit.insert().values(
                    organization_id=None, actor_sub=actor, action=ACTION, entity_type="legacy_emission_factor",
                    entity_id=r["id"], created_at=now,
                    data={"table": TABLE, "branch": BRANCH, "reason": REASON,
                          "before": {"status": r.get("status")}, "after": {"status": "RETIRED"},
                          "unchanged": {k: r[k] for k in ("factor_value", "unit", "source_citation")}}))
    out(f"Retired {len(targets)} row(s) at {now.isoformat()} by {actor}.")
    return 0


def _describe(r, actor) -> str:
    lines: List[str] = [f"  {k:<18} {r[k]}" + ("   (unchanged)" if k not in ("id", "category") else "")
                        for k in SHOWN]
    lines += [f"  {'status':<18} {r.get('status') or 'NULL'} -> RETIRED",
              f"  {'status_reason':<18} {r.get('status_reason') or 'NULL'} -> \"{REASON}\"",
              f"  {'status_changed_at':<18} NULL -> <time of --apply, UTC>",
              f"  {'status_changed_by':<18} NULL -> {actor or '<--actor>'}"]
    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Retire the withdrawn 0.55 kg CO2e/kWh legacy grid factor.")
    parser.add_argument("--database-url", required=True, help="SQLAlchemy URL; never read from the environment")
    parser.add_argument("--apply", action="store_true", help="write the change (default: dry run)")
    parser.add_argument("--actor", help="who is making the change (required with --apply)")
    args = parser.parse_args(argv)
    return run(args.database_url, apply=args.apply, actor=args.actor)


if __name__ == "__main__":
    sys.exit(main())
