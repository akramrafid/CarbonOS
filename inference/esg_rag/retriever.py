import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .config import (
    CHROMA_PERSIST_DIR,
    TOP_K,
    MIN_CONFIDENCE,
    CORPUS_REGULATORY,
    CORPUS_EMISSION_FACTORS,
    CORPUS_TENANT_DOCS,
    VALID_CORPORA
)
from .ingest import get_chroma_client, compute_embedding

class RetrievedChunk:
    def __init__(self, content: str, score: float, metadata: Dict[str, Any]):
        self.content = content
        self.score = float(score)
        self.doc_id = metadata.get("doc_id", "")
        self.tenant_id = metadata.get("tenant_id", "")
        self.filename = metadata.get("filename", "unknown")
        self.corpus = metadata.get("corpus", "general")
        self.page = metadata.get("page", 1)

    def to_citation(self) -> Dict[str, Any]:
        return {
            "source": self.filename,
            "page": self.page,
            "section": f"Corpus: {self.corpus}",
            "snippet": self.content[:240] + ("..." if len(self.content) > 240 else ""),
            "relevance_score": round(self.score, 3)
        }

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-8 or norm_b < 1e-8:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def retrieve_from_fallback(
    query_vec: List[float],
    corpus: str,
    tenant_id: str,
    top_k: int
) -> List[RetrievedChunk]:
    """Retrieves from disk JSON store with cosine similarity."""
    fallback_store_file = os.path.join(CHROMA_PERSIST_DIR, f"fallback_{corpus}.json")
    if not os.path.exists(fallback_store_file):
        return []

    try:
        with open(fallback_store_file, "r", encoding="utf-8") as f:
            records = json.load(f)
    except Exception as e:
        print(f"[ESG RAG] Read fallback error: {e}")
        return []

    scored_chunks = []
    for r in records:
        meta = r.get("metadata", {})
        # Multi-tenant isolation filter:
        if corpus == CORPUS_TENANT_DOCS and meta.get("tenant_id") != tenant_id:
            continue

        sim = cosine_similarity(query_vec, r.get("vector", []))
        scored_chunks.append(RetrievedChunk(
            content=r.get("document", ""),
            score=sim,
            metadata=meta
        ))

    scored_chunks.sort(key=lambda x: x.score, reverse=True)
    return scored_chunks[:top_k]

def retrieve(
    query: str,
    corpus: str = "all",
    tenant_id: str = "default_tenant",
    top_k: int = TOP_K,
    min_confidence: float = MIN_CONFIDENCE
) -> Dict[str, Any]:
    """
    Core retrieval function:
    1. Embeds the user query.
    2. Searches ChromaDB or fallback store across target corpora.
    3. Enforces strict tenant isolation on tenant_docs.
    4. Computes confidence score and filters against threshold.
    """
    query_vec = compute_embedding(query)
    target_corpora = [corpus] if corpus in VALID_CORPORA else list(VALID_CORPORA)

    all_retrieved: List[RetrievedChunk] = []
    chroma = get_chroma_client()

    for c in target_corpora:
        chunks_for_corpus: List[RetrievedChunk] = []
        
        # 1. Try ChromaDB
        if chroma is not None:
            try:
                collection = chroma.get_collection(name=f"esg_{c}")
                where_filter = {"tenant_id": tenant_id} if c == CORPUS_TENANT_DOCS else None
                
                results = collection.query(
                    query_embeddings=[query_vec],
                    n_results=top_k,
                    where=where_filter,
                    include=["documents", "metadatas", "distances"]
                )
                
                if results and results.get("documents") and results["documents"][0]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0]
                    distances = results["distances"][0]
                    
                    for i in range(len(docs)):
                        # In cosine space, distance is 1 - similarity
                        score = 1.0 - distances[i] if distances[i] is not None else 0.5
                        chunks_for_corpus.append(RetrievedChunk(
                            content=docs[i],
                            score=score,
                            metadata=metas[i]
                        ))
            except Exception as e:
                # Collection might not exist yet or error, use fallback
                pass

        # 2. If Chroma yielded no results, query fallback
        if not chunks_for_corpus:
            chunks_for_corpus = retrieve_from_fallback(query_vec, c, tenant_id, top_k)

        all_retrieved.extend(chunks_for_corpus)

    # Sort merged results by relevance score descending
    all_retrieved.sort(key=lambda x: x.score, reverse=True)
    top_chunks = all_retrieved[:top_k]

    # Confidence calculation: max similarity score
    best_score = top_chunks[0].score if top_chunks else 0.0
    insufficient_data = best_score < min_confidence or len(top_chunks) == 0

    return {
        "chunks": top_chunks,
        "best_score": best_score,
        "insufficient_data": insufficient_data,
        "citations": [c.to_citation() for c in top_chunks]
    }
