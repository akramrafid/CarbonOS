"""
Comparative Embedding Model Evaluation Harness.
Designed to benchmark alternative embedding models (e.g. all-MiniLM-L6-v2 vs paraphrase-multilingual-MiniLM-L12-v2)
on human-reviewed retrieval fixtures with Wilson 95% confidence intervals.

SAFETY LOCK:
Does NOT execute comparative benchmark or tune retriever while fixture is marked needs_human_review: true.
"""
import argparse
import json
import math
import os
import sys
from typing import Dict, Any, List, Tuple

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.hybrid_retriever import hybrid_retrieve
from esg_rag.ingest import get_embedding_info, compute_embedding


def wilson_score_interval(successes: int, trials: int, confidence: float = 0.95) -> Tuple[float, float, float]:
    if trials == 0:
        return 0.0, 0.0, 0.0
    z = 1.95996
    p_hat = successes / trials
    denominator = 1 + (z ** 2) / trials
    centre_adjusted = p_hat + (z ** 2) / (2 * trials)
    adjusted_sd = z * math.sqrt((p_hat * (1 - p_hat) / trials) + (z ** 2) / (4 * (trials ** 2)))
    lower = max(0.0, (centre_adjusted - adjusted_sd) / denominator)
    upper = min(1.0, (centre_adjusted + adjusted_sd) / denominator)
    return p_hat, lower, upper


def mrr_confidence_interval(reciprocal_ranks: List[float], confidence: float = 0.95) -> Tuple[float, float, float]:
    n = len(reciprocal_ranks)
    if n == 0:
        return 0.0, 0.0, 0.0
    mean = sum(reciprocal_ranks) / n
    variance = sum((x - mean) ** 2 for x in reciprocal_ranks) / (n - 1) if n > 1 else 0.0
    se = math.sqrt(variance / n)
    z = 1.95996
    lower = max(0.0, mean - z * se)
    upper = min(1.0, mean + z * se)
    return mean, lower, upper


def main():
    parser = argparse.ArgumentParser(description="Compare Embedding Models on Human-Reviewed Fixture")
    parser.add_argument("--fixture", default="tests/fixtures/rag_eval_paraphrase_review.json", help="Path to fixture JSON")
    parser.add_argument("--models", default="all-MiniLM-L6-v2,paraphrase-multilingual-MiniLM-L12-v2", help="Comma-separated model list")
    parser.add_argument("--output", default="scratch/embedding_comparison_report.json", help="Output report JSON")
    parser.add_argument("--force-unreviewed", action="store_true", help="Force benchmark on unreviewed fixture")
    args = parser.parse_args()

    fixture_path = os.path.join(os.path.dirname(__file__), "..", args.fixture)
    if not os.path.isfile(fixture_path):
        print(f"[ERROR] Fixture file not found: {fixture_path}")
        sys.exit(1)

    pairs = json.load(open(fixture_path, encoding="utf-8"))
    needs_review = False
    if isinstance(pairs, list):
        needs_review = any(item.get("needs_human_review", False) for item in pairs)
    elif isinstance(pairs, dict):
        needs_review = pairs.get("needs_human_review", False)

    print("=" * 78)
    print("EMBEDDING MODEL COMPARISON HARNESS")
    print("=" * 78)
    print(f"Target Fixture:   {args.fixture} ({len(pairs) if isinstance(pairs, list) else 'dict'} pairs)")
    print(f"Candidate Models: {args.models}")
    print(f"Output File:      {args.output}")

    if needs_review and not args.force_unreviewed:
        print("\n[SAFETY LOCK ACTIVE] Fixture is flagged 'needs_human_review: true'.")
        print("Per independent verification instructions, comparative model benchmarking")
        print("and retriever tuning are strictly frozen until human expert review is complete.")
        print("Run with --force-unreviewed to override this lock after human sign-off.")
        sys.exit(0)

    # Comparative evaluation logic (activated post-human-review)
    model_list = [m.strip() for m in args.models.split(",") if m.strip()]
    comparison_report = {
        "fixture": args.fixture,
        "models": model_list,
        "results": {}
    }

    for model_name in model_list:
        print(f"\nEvaluating Model: {model_name}...")
        os.environ["ESG_EMBEDDING_MODEL"] = model_name
        groups = {"en": [], "bn": [], "all": []}
        for item in pairs:
            q = item["query"]
            expected = item["expected_doc"]
            lang = item["language"]
            res = hybrid_retrieve(q, corpus="all", tenant_id="demo_tenant", top_k=5)
            chunks = res.get("chunks", [])
            retrieved_docs = [getattr(c, "filename", "") or "" for c in chunks]
            rank = 0
            for i, doc in enumerate(retrieved_docs, start=1):
                if doc == expected:
                    rank = i
                    break
            rr = 1.0 / rank if rank > 0 else 0.0
            rec = {
                "id": item["id"], "lang": lang, "rank": rank, "reciprocal_rank": rr,
                "hit@1": 1 if rank == 1 else 0,
                "hit@3": 1 if 1 <= rank <= 3 else 0,
                "hit@5": 1 if 1 <= rank <= 5 else 0
            }
            groups[lang].append(rec)
            groups["all"].append(rec)

        model_summary = {}
        for g_name in ("en", "bn", "all"):
            recs = groups[g_name]
            n = len(recs)
            h1 = sum(r["hit@1"] for r in recs)
            h3 = sum(r["hit@3"] for r in recs)
            h5 = sum(r["hit@5"] for r in recs)
            rrs = [r["reciprocal_rank"] for r in recs]
            p_h1, l_h1, u_h1 = wilson_score_interval(h1, n)
            p_h3, l_h3, u_h3 = wilson_score_interval(h3, n)
            p_h5, l_h5, u_h5 = wilson_score_interval(h5, n)
            m_mrr, l_mrr, u_mrr = mrr_confidence_interval(rrs)
            model_summary[g_name] = {
                "n": n,
                "hit@1": {"point": round(p_h1, 4), "ci_95": (round(l_h1, 4), round(u_h1, 4)), "count": f"{h1}/{n}"},
                "hit@3": {"point": round(p_h3, 4), "ci_95": (round(l_h3, 4), round(u_h3, 4)), "count": f"{h3}/{n}"},
                "hit@5": {"point": round(p_h5, 4), "ci_95": (round(l_h5, 4), round(u_h5, 4)), "count": f"{h5}/{n}"},
                "mrr": {"point": round(m_mrr, 4), "ci_95": (round(l_mrr, 4), round(u_mrr, 4))}
            }
        comparison_report["results"][model_name] = model_summary

    out_file = os.path.join(os.path.dirname(__file__), "..", args.output)
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(comparison_report, f, indent=2)
    print(f"\nComparison report written to {out_file}")


if __name__ == "__main__":
    main()
