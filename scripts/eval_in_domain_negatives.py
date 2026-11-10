import sys
import os
os.environ["ESG_FAST_EMBEDDING"] = "1"
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.retriever import retrieve
from esg_rag.config import MIN_CONFIDENCE

negatives_file = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "rag_eval_in_domain_negatives.json")
negatives = json.load(open(negatives_file, encoding="utf-8"))

print("=== EVALUATING 30 IN-DOMAIN NEGATIVES ===")
print("Production retrieval path: retrieve(corpus='all', top_k=5)")
print(f"Production confidence threshold: {MIN_CONFIDENCE}")

stats = {"en": {"total": 0, "insufficient": 0, "false_positive": 0},
         "bn": {"total": 0, "insufficient": 0, "false_positive": 0}}

for item in negatives:
    lang = item["language"]
    q = item["query"]
    res = retrieve(q, corpus="all", tenant_id="prod_tenant", top_k=5)
    insufficient = res.get("insufficient_data", False)
    best_score = res.get("best_score", 0.0)
    stats[lang]["total"] += 1
    if insufficient:
        stats[lang]["insufficient"] += 1
    else:
        stats[lang]["false_positive"] += 1
        print(f"FALSE POSITIVE: [{lang}] {q} -> best_score: {best_score}")

print("\n--- Summary ---")
total_q = len(negatives)
total_fp = stats["en"]["false_positive"] + stats["bn"]["false_positive"]
total_ins = stats["en"]["insufficient"] + stats["bn"]["insufficient"]
for lang in ("en", "bn"):
    s = stats[lang]
    rate = (s["false_positive"] / s["total"]) * 100
    print(f"[{lang.upper()}] Total: {s['total']}, Refused (insufficient_data=True): {s['insufficient']}, False Positives: {s['false_positive']} ({rate:.1f}%)")
print(f"[ALL] Total: {total_q}, Refused: {total_ins}, False Positives: {total_fp} ({(total_fp/total_q)*100:.1f}%)")
