"""
Mutation score gate for the "mutation" CI job: (killed + timeout) / (total - skipped) x 100, the formula of mutmut's own
badge command. Survived, untested and suspicious mutants count against the score. Exits 1 below --minimum.

Usage: python tests/mutation/score.py mutants/mutmut-cicd-stats.json --minimum 80
"""
import argparse
import json
import sys

COUNTS = ("total", "killed", "timeout", "survived", "no_tests", "suspicious", "skipped", "segfault")


def score(stats: dict) -> float:
    tested = int(stats["total"]) - int(stats.get("skipped", 0))
    if tested <= 0:
        raise ValueError("no mutant was tested")
    return 100.0 * (int(stats["killed"]) + int(stats.get("timeout", 0))) / tested


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    ap.add_argument("stats", help="mutants/mutmut-cicd-stats.json written by `mutmut export-cicd-stats`")
    ap.add_argument("--minimum", type=float, default=80.0)
    args = ap.parse_args(argv)
    with open(args.stats, encoding="utf-8") as fh:
        stats = json.load(fh)
    for key in COUNTS:
        print(f"{key:>10}: {stats.get(key, 0)}")
    try:
        value = score(stats)
    except ValueError as e:
        print(f"mutation score: not available ({e})", file=sys.stderr)
        return 1
    print(f"mutation score: {value:.2f} % (minimum {args.minimum:g} %)")
    return 0 if value >= args.minimum else 1


if __name__ == "__main__":
    sys.exit(main())
