import sys
import os
import json
from pathlib import Path

sys.path.insert(0, "inference")

from esg_rag.hybrid_retriever import hybrid_retrieve
from esg_rag.config import CORPUS_EMISSION_FACTORS, CORPUS_REGULATORY

queries = [
    "no official Bangladesh grid factor",
    "withdrawn combined margin",
    "Method A Method B agreement"
]

print("=== 1. CHECKING RAW FILES (CORPUS & FALLBACK JSON) ===")
corpus_dir = Path("inference/esg_rag/corpus")
fallback_dir = Path("inference/chroma_data")

for q in queries:
    print(f"\nSearching for literal: '{q}'")
    for f in list(corpus_dir.glob("*.md")) + list(fallback_dir.glob("fallback_*.json")):
        txt = f.read_text(encoding="utf-8")
        cnt = txt.lower().count(q.lower())
        if cnt > 0:
            print(f"  FOUND in {f.name}: {cnt} occurrence(s)")
        else:
            print(f"  CLEAN: {f.name} (0 occurrences)")

print("\n=== 2. PRODUCTION / NON-DEMO TENANT RETRIEVAL (agent-authored excluded) ===")
prod_results = {}
for q in queries:
    res = hybrid_retrieve(query=q, corpus="all", tenant_id="prod_tenant", top_k=3, min_confidence=0.30)
    print(f"Query: '{q}'")
    print(f"  best_score: {res['best_score']}")
    print(f"  insufficient_data: {res['insufficient_data']}")
    print(f"  citations: {res['citations']}")
    prod_results[q] = {
        "best_score": res["best_score"],
        "insufficient_data": res["insufficient_data"],
        "citations": res["citations"]
    }

print("\n=== 3. DEMO TENANT RETRIEVAL (agent-authored included) ===")
demo_results = {}
for q in queries:
    res = hybrid_retrieve(query=q, corpus="all", tenant_id="demo_tenant", top_k=3, min_confidence=0.30)
    print(f"Query: '{q}'")
    print(f"  best_score: {res['best_score']}")
    print(f"  insufficient_data: {res['insufficient_data']}")
    print(f"  citations: {res['citations']}")
    demo_results[q] = {
        "best_score": res["best_score"],
        "insufficient_data": res["insufficient_data"],
        "citations": res["citations"]
    }

out_data = {
    "prod_results": prod_results,
    "demo_results": demo_results
}
Path("scratch/claims_query_output.json").write_text(json.dumps(out_data, indent=2), encoding="utf-8")
print("\nResults saved to scratch/claims_query_output.json")
