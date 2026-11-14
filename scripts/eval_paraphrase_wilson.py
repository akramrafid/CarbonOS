"""
Evaluate RAG retrieval against tests/fixtures/rag_eval_paraphrase_review.json (40 EN, 40 BN).
Computes Hit@1, Hit@3, Hit@5, MRR, and Wilson score 95% confidence intervals.
Does NOT tune any retriever parameters.
"""
import math
import os
import sys
import json
import argparse
from typing import Dict, Any, List, Tuple

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))

from esg_rag.hybrid_retriever import hybrid_retrieve
from esg_rag.ingest import get_embedding_info


def wilson_score_interval(successes: int, trials: int, confidence: float = 0.95) -> Tuple[float, float, float]:
    """Computes Wilson score confidence interval for a binomial proportion.
    Returns (point_estimate, lower_bound, upper_bound)."""
    if trials == 0:
        return 0.0, 0.0, 0.0
    z = 1.95996  # 95% confidence
    p_hat = successes / trials
    denominator = 1 + (z ** 2) / trials
    centre_adjusted = p_hat + (z ** 2) / (2 * trials)
    adjusted_sd = z * math.sqrt((p_hat * (1 - p_hat) / trials) + (z ** 2) / (4 * (trials ** 2)))
    lower = max(0.0, (centre_adjusted - adjusted_sd) / denominator)
    upper = min(1.0, (centre_adjusted + adjusted_sd) / denominator)
    return p_hat, lower, upper


def mrr_confidence_interval(reciprocal_ranks: List[float], confidence: float = 0.95) -> Tuple[float, float, float]:
    """Computes normal approximation 95% confidence interval for Mean Reciprocal Rank (MRR)."""
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


def run_paraphrase_eval(allow_fallback: bool = False, output_file: str = "scratch/paraphrase_eval_report.json", demo_corpus: bool = True):
    emb_info = get_embedding_info()
    print("=" * 70)
    print("EMBEDDING DISCLOSURE & MODEL CONFIGURATION")
    print(f"Embedding Mode: {emb_info['mode']}")
    print(f"Model Name:     {emb_info['model_name']}")
    print(f"Dimension:      {emb_info['dimension']}")
    print(f"Corpus Mode:    {'DEMO CORPUS' if demo_corpus else 'PRODUCTION MODE'}")
    print("=" * 70)

    if emb_info["is_fallback"]:
        if not allow_fallback:
            print("\n[ERROR] Fallback embedding is active. Production model failed to load.")
            print("Run with --allow-fallback to proceed with fallback embeddings.")
            sys.exit(1)
        else:
            print("\n[WARNING] FALLBACK EMBEDDING - NOT PRODUCTION is active (--allow-fallback passed).")

    fixture_path = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "rag_eval_paraphrase_review.json")
    pairs = json.load(open(fixture_path, encoding="utf-8"))
    print(f"\nLoaded {len(pairs)} paraphrase query pairs from {fixture_path}")

    groups = {"en": [], "bn": [], "all": []}
    tenant_id = "demo_tenant" if demo_corpus else "prod_tenant"

    for item in pairs:
        q = item["query"]
        expected = item["expected_doc"]
        lang = item["language"]

        res = hybrid_retrieve(q, corpus="all", tenant_id=tenant_id, top_k=5)
        chunks = res.get("chunks", [])
        retrieved_docs = [getattr(c, "filename", "") or "" for c in chunks]

        rank = 0
        for i, doc in enumerate(retrieved_docs, start=1):
            if doc == expected:
                rank = i
                break

        rr = 1.0 / rank if rank > 0 else 0.0
        record = {
            "id": item["id"],
            "lang": lang,
            "rank": rank,
            "reciprocal_rank": rr,
            "hit@1": 1 if rank == 1 else 0,
            "hit@3": 1 if 1 <= rank <= 3 else 0,
            "hit@5": 1 if 1 <= rank <= 5 else 0
        }
        groups[lang].append(record)
        groups["all"].append(record)

    report = {
        "embedding": emb_info,
        "corpus_mode": "DEMO CORPUS" if demo_corpus else "PRODUCTION MODE",
        "evaluation_label": "FALLBACK EMBEDDING - NOT PRODUCTION" if emb_info["is_fallback"] else "PRODUCTION EMBEDDING",
        "fixture": "tests/fixtures/rag_eval_paraphrase_review.json",
        "fixture_status": "needs_human_review",
        "results": {}
    }
    for group_name in ("en", "bn", "all"):
        records = groups[group_name]
        n = len(records)
        h1 = sum(r["hit@1"] for r in records)
        h3 = sum(r["hit@3"] for r in records)
        h5 = sum(r["hit@5"] for r in records)
        rrs = [r["reciprocal_rank"] for r in records]

        p_h1, l_h1, u_h1 = wilson_score_interval(h1, n)
        p_h3, l_h3, u_h3 = wilson_score_interval(h3, n)
        p_h5, l_h5, u_h5 = wilson_score_interval(h5, n)
        m_mrr, l_mrr, u_mrr = mrr_confidence_interval(rrs)

        report["results"][group_name] = {
            "n": n,
            "hit@1": {"point": round(p_h1, 4), "ci_95": (round(l_h1, 4), round(u_h1, 4)), "count": f"{h1}/{n}"},
            "hit@3": {"point": round(p_h3, 4), "ci_95": (round(l_h3, 4), round(u_h3, 4)), "count": f"{h3}/{n}"},
            "hit@5": {"point": round(p_h5, 4), "ci_95": (round(l_h5, 4), round(u_h5, 4)), "count": f"{h5}/{n}"},
            "mrr": {"point": round(m_mrr, 4), "ci_95": (round(l_mrr, 4), round(u_mrr, 4))}
        }

    print(f"\n================ RAG PARAPHRASE RETRIEVAL REPORT ({'DEMO CORPUS' if demo_corpus else 'PRODUCTION MODE'}) ================")
    for g, data in report["results"].items():
        title = "English (n=40)" if g == "en" else ("Bengali (n=40)" if g == "bn" else "Combined (n=80)")
        print(f"\n--- {title} ---")
        print(f"Hit@1: {data['hit@1']['point']:.1%} [{data['hit@1']['ci_95'][0]:.1%}, {data['hit@1']['ci_95'][1]:.1%}] (count: {data['hit@1']['count']})")
        print(f"Hit@3: {data['hit@3']['point']:.1%} [{data['hit@3']['ci_95'][0]:.1%}, {data['hit@3']['ci_95'][1]:.1%}] (count: {data['hit@3']['count']})")
        print(f"Hit@5: {data['hit@5']['point']:.1%} [{data['hit@5']['ci_95'][0]:.1%}, {data['hit@5']['ci_95'][1]:.1%}] (count: {data['hit@5']['count']})")
        print(f"MRR:   {data['mrr']['point']:.4f} [{data['mrr']['ci_95'][0]:.4f}, {data['mrr']['ci_95'][1]:.4f}]")

    out_file = os.path.join(os.path.dirname(__file__), "..", output_file)
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\nSaved report to {out_file}")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate RAG retrieval with Wilson CIs")
    parser.add_argument("--allow-fallback", action="store_true", help="Allow running with fallback hash embeddings")
    parser.add_argument("--demo-corpus", dest="demo_corpus", action="store_true", default=True, help="Run with demo corpus")
    parser.add_argument("--prod", dest="demo_corpus", action="store_false", help="Run in production mode")
    parser.add_argument("--output", default="scratch/paraphrase_eval_report.json", help="Path to write JSON report")
    args = parser.parse_args()
    run_paraphrase_eval(allow_fallback=args.allow_fallback, output_file=args.output, demo_corpus=args.demo_corpus)
