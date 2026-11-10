import sys
import os
import json
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.retriever import retrieve
from esg_rag.config import MIN_CONFIDENCE
from esg_rag.ingest import get_embedding_info


def run_negatives_eval(allow_fallback: bool = False, output_file: str = "scratch/in_domain_negatives_report.json"):
    emb_info = get_embedding_info()
    print("=" * 70)
    print("EMBEDDING DISCLOSURE & MODEL CONFIGURATION")
    print(f"Embedding Mode: {emb_info['mode']}")
    print(f"Model Name:     {emb_info['model_name']}")
    print(f"Dimension:      {emb_info['dimension']}")
    print("=" * 70)

    if emb_info["is_fallback"]:
        if not allow_fallback:
            print("\n[ERROR] Fallback embedding is active. Production model failed to load.")
            print("Run with --allow-fallback to proceed with fallback embeddings.")
            sys.exit(1)
        else:
            print("\n[WARNING] FALLBACK EMBEDDING - NOT PRODUCTION is active (--allow-fallback passed).")

    negatives_file = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "rag_eval_in_domain_negatives.json")
    negatives = json.load(open(negatives_file, encoding="utf-8"))

    print("\n=== EVALUATING 30 IN-DOMAIN NEGATIVES ===")
    print("Production retrieval path: retrieve(corpus='all', top_k=5)")
    print(f"Production confidence threshold: {MIN_CONFIDENCE}")

    stats = {
        "en": {"total": 0, "insufficient": 0, "false_positive": 0, "queries": []},
        "bn": {"total": 0, "insufficient": 0, "false_positive": 0, "queries": []}
    }

    for item in negatives:
        lang = item["language"]
        q = item["query"]
        res = retrieve(q, corpus="all", tenant_id="prod_tenant", top_k=5)
        insufficient = res.get("insufficient_data", False)
        best_score = res.get("best_score", 0.0)
        stats[lang]["total"] += 1

        record = {
            "id": item.get("id"),
            "query": q,
            "best_score": best_score,
            "insufficient_data": insufficient,
            "refused": insufficient
        }

        if insufficient:
            stats[lang]["insufficient"] += 1
        else:
            stats[lang]["false_positive"] += 1
            print(f"FALSE POSITIVE: [{lang}] {q} -> best_score: {best_score}")
        stats[lang]["queries"].append(record)

    total_q = len(negatives)
    total_fp = stats["en"]["false_positive"] + stats["bn"]["false_positive"]
    total_ins = stats["en"]["insufficient"] + stats["bn"]["insufficient"]

    print("\n--- Summary ---")
    for lang in ("en", "bn"):
        s = stats[lang]
        rate = (s["false_positive"] / s["total"]) * 100
        print(f"[{lang.upper()}] Total: {s['total']}, Refused (insufficient_data=True): {s['insufficient']}, False Positives: {s['false_positive']} ({rate:.1f}%)")
    print(f"[ALL] Total: {total_q}, Refused: {total_ins}, False Positives: {total_fp} ({(total_fp/total_q)*100:.1f}%)")

    report = {
        "embedding": emb_info,
        "evaluation_label": "FALLBACK EMBEDDING - NOT PRODUCTION" if emb_info["is_fallback"] else "PRODUCTION EMBEDDING",
        "retrieval_path": "retrieve(corpus='all', top_k=5)",
        "production_confidence_threshold": MIN_CONFIDENCE,
        "total_queries": total_q,
        "total_refused": total_ins,
        "total_false_positives": total_fp,
        "false_positive_rate": total_fp / total_q if total_q > 0 else 0.0,
        "by_language": {
            "en": {
                "total": stats["en"]["total"],
                "refused": stats["en"]["insufficient"],
                "false_positives": stats["en"]["false_positive"],
                "false_positive_rate": stats["en"]["false_positive"] / stats["en"]["total"]
            },
            "bn": {
                "total": stats["bn"]["total"],
                "refused": stats["bn"]["insufficient"],
                "false_positives": stats["bn"]["false_positive"],
                "false_positive_rate": stats["bn"]["false_positive"] / stats["bn"]["total"]
            }
        },
        "query_details": stats
    }

    out_path = os.path.join(os.path.dirname(__file__), "..", output_file)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nSaved report to {out_path}")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate 30 in-domain unanswerable negatives")
    parser.add_argument("--allow-fallback", action="store_true", help="Allow running with fallback hash embeddings")
    parser.add_argument("--output", default="scratch/in_domain_negatives_report.json", help="Path to write JSON report")
    args = parser.parse_args()
    run_negatives_eval(allow_fallback=args.allow_fallback, output_file=args.output)
