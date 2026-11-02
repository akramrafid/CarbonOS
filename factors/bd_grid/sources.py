"""
Record the SHA-256 of every source document the owner places in factors/bd_grid/sources/.

New files are added to sources.json's "files" list with their SHA-256, size and the date recorded. A file whose
bytes no longer match its recorded SHA-256 is reported and its record is left unchanged (exit 3): a source is
never silently replaced. Recorded files that are no longer present are marked MISSING.

Usage: python -m factors.bd_grid.sources
"""
import argparse
import datetime as dt
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
IGNORED = {"README.md", ".gitkeep"}
RECORDED = "RECORDED: not yet extracted"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def register(register_path: Path, directory: Path, today: str) -> dict:
    data = json.loads(register_path.read_text(encoding="utf-8"))
    files = {f["file"]: f for f in data.get("files", [])}
    present = sorted(p for p in directory.iterdir() if p.is_file() and p.name not in IGNORED) if directory.is_dir() else []
    added, changed, missing = [], [], []
    for p in present:
        digest, record = sha256(p), files.get(p.name)
        if record is None:
            files[p.name] = {"file": p.name, "sha256": digest, "bytes": p.stat().st_size, "recorded": today,
                             "status": RECORDED}
            added.append(p.name)
        elif record["sha256"] != digest:
            changed.append(p.name)  # the record keeps the original hash
        elif record.get("status", "").startswith("MISSING"):
            record["status"] = RECORDED
    names = {p.name for p in present}
    for name, record in files.items():
        if name not in names and not record.get("status", "").startswith("MISSING"):
            record["status"] = "MISSING: recorded, no longer in sources/"
            missing.append(name)
    data["files"] = [files[k] for k in sorted(files)]
    register_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"added": added, "changed": changed, "missing": missing}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    ap.add_argument("--dir", type=Path, default=HERE / "sources")
    ap.add_argument("--register", type=Path, default=HERE / "sources.json")
    args = ap.parse_args(argv)
    result = register(args.register, args.dir, dt.date.today().isoformat())
    for name in result["added"]:
        print(f"recorded {name}")
    for name in result["missing"]:
        print(f"MISSING {name}")
    for name in result["changed"]:
        print(f"CHANGED {name}: bytes differ from the recorded SHA-256; record kept, file not accepted", file=sys.stderr)
    if not any(result.values()):
        print("no change")
    return 3 if result["changed"] else 0


if __name__ == "__main__":
    sys.exit(main())
