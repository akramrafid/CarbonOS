import sys
import os
import json
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.retriever import retrieve
from esg_rag.config import MIN_CONFIDENCE
from esg_rag.ingest import get_embedding_info


def run_negatives_eval(allow_fallback: bool = False, output_file: str = "scratch/in_domain_negatives_report.json", demo_corpus: bool = True, thresholds: list = None):
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

    negatives_file = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "rag_eval_in_domain_negatives.json")
    negatives = json.load(open(negatives_file, encoding="utf-8"))

    pairs_file = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "rag_eval_pairs.json")
    all_pairs = json.load(open(pairs_file, encoding="utf-8"))
    answerables = [p for p in all_pairs if not p.get("is_unanswerable")]

    tenant_id = "demo_tenant" if demo_corpus else "prod_tenant"

    if thresholds is None:
        thresholds = [0.25, 0.30, 0.35, 0.40]

    print(f"\n=== EVALUATING 30 IN-DOMAIN NEGATIVES & 59 ANSWERABLES ({'DEMO CORPUS' if demo_corpus else 'PRODUCTION MODE'}) ===")
    print(f"Retrieval path: retrieve(corpus='all', tenant_id='{tenant_id}', top_k=5)")
    print(f"Thresholds evaluated: {thresholds}")

    # Retrieve scores for all negatives
    neg_results = []
    for item in negatives:
        q = item["query"]
        lang = item["language"]
        res = retrieve(q, corpus="all", tenant_id=tenant_id, top_k=5)
        best_score = res.get("best_score", 0.0)
        neg_results.append({
            "id": item.get("id"),
            "query": q,
            "language": lang,
            "best_score": best_score
        })

    # Retrieve scores for all answerables
    ans_results = []
    for item in answerables:
        q = item["question"]
        lang = item.get("language", "en")
        res = retrieve(q, corpus="all", tenant_id=tenant_id, top_k=5)
        best_score = res.get("best_score", 0.0)
        ans_results.append({
            "id": item.get("id"),
            "query": q,
            "language": lang,
            "best_score": best_score
        })

    threshold_reports = {}
    print("\n" + "=" * 90)
    print(f"{'Threshold':<10} | {'Neg Refusal (All)':<18} | {'Neg Refusal (EN)':<18} | {'Neg Refusal (BN)':<18} | {'Ans Accept (All)':<18}")
    print("-" * 90)

    for th in thresholds:
        # Negatives: refused if best_score < th
        neg_en = [r for r in neg_results if r["language"] == "en"]
        neg_bn = [r for r in neg_results if r["language"] == "bn"]

        ref_all = sum(1 for r in neg_results if r["best_score"] < th)
        ref_en = sum(1 for r in neg_en if r["best_score"] < th)
        ref_bn = sum(1 for r in neg_bn if r["best_score"] < th)

        # Answerables: accepted if best_score >= th
        ans_en = [r for r in ans_results if r["language"] == "en"]
        ans_bn = [r for r in ans_results if r["language"] == "bn"]

        acc_all = sum(1 for r in ans_results if r["best_score"] >= th)
        acc_en = sum(1 for r in ans_en if r["best_score"] >= th)
        acc_bn = sum(1 for r in ans_bn if r["best_score"] >= th)

        rate_ref_all = ref_all / len(neg_results) if neg_results else 0.0
        rate_ref_en = ref_en / len(neg_en) if neg_en else 0.0
        rate_ref_bn = ref_bn / len(neg_bn) if neg_bn else 0.0

        rate_acc_all = acc_all / len(ans_results) if ans_results else 0.0
        rate_acc_en = acc_en / len(ans_en) if ans_en else 0.0
        rate_acc_bn = acc_bn / len(ans_bn) if ans_bn else 0.0

        threshold_reports[str(th)] = {
            "threshold": th,
            "negatives": {
                "all": {"total": len(neg_results), "refused": ref_all, "refusal_rate": round(rate_ref_all, 4)},
                "en": {"total": len(neg_en), "refused": ref_en, "refusal_rate": round(rate_ref_en, 4)},
                "bn": {"total": len(neg_bn), "refused": ref_bn, "refusal_rate": round(rate_ref_bn, 4)},
            },
            "answerables": {
                "all": {"total": len(ans_results), "accepted": acc_all, "acceptance_rate": round(rate_acc_all, 4)},
                "en": {"total": len(ans_en), "accepted": acc_en, "acceptance_rate": round(rate_acc_en, 4)},
                "bn": {"total": len(ans_bn), "accepted": acc_bn, "acceptance_rate": round(rate_acc_bn, 4)},
            }
        }

        print(f"{th:<10.2f} | {f'{ref_all}/{len(neg_results)} ({rate_ref_all:.1%})':<18} | {f'{ref_en}/{len(neg_en)} ({rate_ref_en:.1%})':<18} | {f'{ref_bn}/{len(neg_bn)} ({rate_ref_bn:.1%})':<18} | {f'{acc_all}/{len(ans_results)} ({rate_acc_all:.1%})':<18}")

    print("=" * 90)

    # Detailed report for production MIN_CONFIDENCE
    def_th = MIN_CONFIDENCE
    def_neg_refused = sum(1 for r in neg_results if r["best_score"] < def_th)
    report = {
        "embedding": emb_info,
        "corpus_mode": "DEMO CORPUS" if demo_corpus else "PRODUCTION MODE",
        "evaluation_label": "FALLBACK EMBEDDING - NOT PRODUCTION" if emb_info["is_fallback"] else "PRODUCTION EMBEDDING",
        "retrieval_path": f"retrieve(corpus='all', tenant_id='{tenant_id}', top_k=5)",
        "production_confidence_threshold": MIN_CONFIDENCE,
        "threshold_tradeoff": threshold_reports,
        "negatives_scored": neg_results,
        "answerables_scored": ans_results
    }

    out_path = os.path.join(os.path.dirname(__file__), "..", output_file)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nSaved report to {out_path}")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate 30 in-domain unanswerable negatives and answerables tradeoff")
    parser.add_argument("--allow-fallback", action="store_true", help="Allow running with fallback hash embeddings")
    parser.add_argument("--demo-corpus", dest="demo_corpus", action="store_true", default=True, help="Run with demo corpus")
    parser.add_argument("--prod", dest="demo_corpus", action="store_false", help="Run in production mode")
    parser.add_argument("--thresholds", default="0.25,0.30,0.35,0.40", help="Comma-separated thresholds to evaluate")
    parser.add_argument("--output", default="scratch/in_domain_negatives_report.json", help="Path to write JSON report")
    args = parser.parse_args()
    th_list = [float(x.strip()) for x in args.thresholds.split(",") if x.strip()]
    run_negatives_eval(allow_fallback=args.allow_fallback, output_file=args.output, demo_corpus=args.demo_corpus, thresholds=th_list)
