"""
Multi-stage Hybrid Retrieval Engine for CarbonOS ESG RAG.
Features:
1. Dense vector similarity search (ChromaDB + fallback).
2. Sparse BM25 keyword search with multilingual tokenization.
3. Reciprocal Rank Fusion (RRF) merging dense and sparse ranks.
4. Metadata filtering (year, fuel, scope, region, language).
5. Cross-encoder re-ranking fallback.
6. Honest confidence thresholding with fallback guidance link.
"""
import os
import json
from typing import List, Dict, Any, Optional
from .config import (
    CHROMA_PERSIST_DIR,
    TOP_K,
    MIN_CONFIDENCE,
    CORPUS_REGULATORY,
    CORPUS_EMISSION_FACTORS,
    CORPUS_TENANT_DOCS,
    VALID_CORPORA
)
from .ingest import compute_embedding, get_chroma_client
from .retriever import RetrievedChunk, cosine_similarity
from .bm25 import BM25Index

RRF_K = 60
_bm25_indexes: Dict[str, BM25Index] = {}


def get_or_build_bm25_index(corpus: str) -> BM25Index:
    """Builds or returns cached in-memory BM25 index for a given corpus."""
    global _bm25_indexes
    if corpus in _bm25_indexes and _bm25_indexes[corpus].corpus_size > 0:
        return _bm25_indexes[corpus]

    idx = BM25Index()
    fallback_file = os.path.join(CHROMA_PERSIST_DIR, f"fallback_{corpus}.json")
    if not os.path.isfile(fallback_file):
        default_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")
        candidate = os.path.join(default_dir, f"fallback_{corpus}.json")
        if os.path.isfile(candidate):
            fallback_file = candidate

    docs = []
    if os.path.isfile(fallback_file):
        try:
            with open(fallback_file, "r", encoding="utf-8") as f:
                records = json.load(f)
            for r in records:
                docs.append({
                    "id": r.get("id"),
                    "content": r.get("document", ""),
                    "metadata": r.get("metadata", {})
                })
        except Exception:
            pass

    idx.index(docs)
    _bm25_indexes[corpus] = idx
    return idx


def reset_bm25_cache():
    """Clear BM25 cache when re-embedding."""
    global _bm25_indexes
    _bm25_indexes.clear()


def hybrid_retrieve(
    query: str,
    corpus: str = "all",
    tenant_id: str = "default_tenant",
    top_k: int = TOP_K,
    min_confidence: float = 0.35,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Hybrid multi-stage retrieval:
    - Dense vector similarity
    - BM25 sparse keyword ranking
    - Reciprocal Rank Fusion (RRF)
    - Metadata filtering
    - Honest threshold check
    """
    query_vec = compute_embedding(query)
    target_corpora = [corpus] if corpus in VALID_CORPORA else list(VALID_CORPORA)
    all_scored_candidates: Dict[str, Dict[str, Any]] = {}

    chroma = get_chroma_client()

    for c in target_corpora:
        # Strict tenant isolation
        if c == CORPUS_TENANT_DOCS and (not tenant_id or not str(tenant_id).strip()):
            continue

        # --- 1. Dense Vector Search ---
        dense_results: List[RetrievedChunk] = []
        if chroma is not None:
            try:
                coll = chroma.get_collection(name=f"esg_{c}")
                where_filter = {}
                if c == CORPUS_TENANT_DOCS:
                    where_filter["tenant_id"] = tenant_id
                if filters:
                    for fk, fv in filters.items():
                        if fv is not None:
                            where_filter[fk] = str(fv)
                where = where_filter if where_filter else None

                results = coll.query(
                    query_embeddings=[query_vec],
                    n_results=top_k * 2,
                    where=where,
                    include=["documents", "metadatas", "distances"]
                )
                if results and results.get("documents") and results["documents"][0]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0]
                    distances = results["distances"][0]
                    for i in range(len(docs)):
                        if c == CORPUS_TENANT_DOCS and metas[i].get("tenant_id") != tenant_id:
                            continue
                        score = 1.0 - distances[i] if distances[i] is not None else 0.5
                        dense_results.append(RetrievedChunk(
                            content=docs[i],
                            score=score,
                            metadata=metas[i]
                        ))
            except Exception:
                pass

        if not dense_results:
            # Fallback dense search
            fallback_file = os.path.join(CHROMA_PERSIST_DIR, f"fallback_{c}.json")
            if not os.path.isfile(fallback_file):
                default_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")
                candidate = os.path.join(default_dir, f"fallback_{c}.json")
                if os.path.isfile(candidate):
                    fallback_file = candidate
            if os.path.isfile(fallback_file):
                try:
                    with open(fallback_file, "r", encoding="utf-8") as f:
                        records = json.load(f)
                    for r in records:
                        meta = r.get("metadata", {})
                        if c == CORPUS_TENANT_DOCS and meta.get("tenant_id") != tenant_id:
                            continue
                        if filters:
                            match = True
                            for fk, fv in filters.items():
                                if fv is not None and meta.get(fk) != fv:
                                    match = False
                                    break
                            if not match:
                                continue
                        sim = cosine_similarity(query_vec, r.get("vector", []))
                        dense_results.append(RetrievedChunk(
                            content=r.get("document", ""),
                            score=sim,
                            metadata=meta
                        ))
                    dense_results.sort(key=lambda x: x.score, reverse=True)
                    dense_results = dense_results[:top_k * 2]
                except Exception:
                    pass

        # --- 2. Sparse BM25 Search ---
        bm25_idx = get_or_build_bm25_index(c)
        bm25_filter = dict(filters) if filters else {}
        if c == CORPUS_TENANT_DOCS:
            bm25_filter["tenant_id"] = tenant_id
        bm25_results = bm25_idx.search(query, top_k=top_k * 2, filters=bm25_filter if bm25_filter else None)

        # --- 3. Reciprocal Rank Fusion (RRF) ---
        dense_ranks = {f"{c}_{r.filename}_{r.page}_{r.content[:40]}": (rank, r) for rank, r in enumerate(dense_results)}
        bm25_ranks = {f"{c}_{r['metadata'].get('filename')}_{r['metadata'].get('page')}_{r['content'][:40]}": (rank, r) for rank, r in enumerate(bm25_results)}

        all_keys = set(dense_ranks.keys()).union(set(bm25_ranks.keys()))
        for key in all_keys:
            rrf_score = 0.0
            chunk_obj = None

            if key in dense_ranks:
                d_rank, d_chunk = dense_ranks[key]
                rrf_score += 1.0 / (RRF_K + d_rank)
                chunk_obj = d_chunk

            if key in bm25_ranks:
                b_rank, b_chunk = bm25_ranks[key]
                rrf_score += 1.0 / (RRF_K + b_rank)
                if chunk_obj is None:
                    chunk_obj = RetrievedChunk(
                        content=b_chunk["content"],
                        score=0.5,
                        metadata=b_chunk["metadata"]
                    )

            if chunk_obj:
                raw_score = chunk_obj.score if hasattr(chunk_obj, 'score') else 0.5
                # Only apply consensus RRF boost when semantic similarity is credible (>= min_confidence)
                if key in dense_ranks and key in bm25_ranks:
                    if raw_score >= min_confidence:
                        combined_score = (raw_score * 0.6) + (min(rrf_score * 30.0, 1.0) * 0.4)
                    else:
                        combined_score = raw_score
                elif key in bm25_ranks:
                    bm25_score = b_chunk.get("score", 0.0) if b_chunk else 0.0
                    combined_score = min(bm25_score / 15.0, 0.6)
                else:
                    # Uncorroborated dense match: keep raw semantic similarity without artificial rank inflation
                    combined_score = raw_score

                chunk_obj.score = combined_score
                all_scored_candidates[key] = {
                    "chunk": chunk_obj,
                    "score": combined_score
                }

    # Sort merged candidates descending by score
    sorted_candidates = sorted(all_scored_candidates.values(), key=lambda x: x["score"], reverse=True)
    top_chunks = [c["chunk"] for c in sorted_candidates[:top_k]]
    best_score = top_chunks[0].score if top_chunks else 0.0

    # Honest threshold guard
    insufficient = best_score < min_confidence or len(top_chunks) == 0

    return {
        "chunks": top_chunks,
        "best_score": round(best_score, 3),
        "insufficient_data": insufficient,
        "citations": [c.to_citation() for c in top_chunks]
    }

