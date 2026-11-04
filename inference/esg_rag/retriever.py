import os
import json
import math
import re
import hashlib
import unicodedata
from collections import Counter
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
from .ingest import get_chroma_client, compute_embedding, embedding_space
from .config import GLOBAL_CORPUS_OWNER, RAG_CANDIDATE_LIMIT
from .models import ESGDocument, ESGChunk
from sqlalchemy import or_

class RetrievedChunk:
    def __init__(self, content: str, score: float, metadata: Dict[str, Any]):
        self.content = content
        self.score = float(score)
        self.doc_id = metadata.get("doc_id", "")
        self.tenant_id = metadata.get("tenant_id", "")
        self.filename = metadata.get("filename", "unknown")
        self.corpus = metadata.get("corpus", "general")
        self.page = metadata.get("page", 1)
        self.chunk_id = metadata.get('chunk_id', '')
        self.source_status = metadata.get('source_status', 'UNREVIEWED')

    def to_citation(self) -> Dict[str, Any]:
        return {
            "source": self.filename,
            "document_id": self.doc_id,
            "chunk_id": self.chunk_id,
            "content_sha256": hashlib.sha256(self.content.encode()).hexdigest(),
            "source_status": self.source_status,
            "page": self.page,
            "section": f"Corpus: {self.corpus}",
            "snippet": self.content[:240] + ("..." if len(self.content) > 240 else ""),
            "relevance_score": round(self.score, 3)
        }

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    try:
        a = np.array(v1, dtype=np.float32)
        b = np.array(v2, dtype=np.float32)
    except (ValueError, TypeError):
        return 0.0
    if a.ndim != 1 or b.ndim != 1 or a.shape != b.shape or not a.size or not np.isfinite(a).all() or not np.isfinite(b).all():
        return 0.0
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-8 or norm_b < 1e-8:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


STOP_WORDS = set('a an the is are was were what which how much does do of in for to and our this that please কি কত এবং'.split())


def tokenize(text):
    text = unicodedata.normalize('NFKC', text).casefold()
    text = ''.join(str(unicodedata.decimal(c)) if c.isdecimal() else c for c in text)
    return [t for t in re.findall(r'[\w\u0980-\u09ff]+', text) if t not in STOP_WORDS]


def _retrieve_sql(query, corpus, tenant_id, top_k, min_confidence, db, document_ids=None):
    """SQL owns visibility and content; vectors are optional, replaceable ranking hints."""
    corpora = sorted(VALID_CORPORA) if corpus == 'all' else [corpus]
    filters = []
    for c in corpora:
        owner = tenant_id if c == CORPUS_TENANT_DOCS else GLOBAL_CORPUS_OWNER[c]
        if owner:
            filters.append((ESGDocument.corpus == c) & (ESGDocument.tenant_id == owner))
    rows = []
    if filters:
        candidates = db.query(ESGChunk, ESGDocument).join(ESGDocument, ESGChunk.document_id == ESGDocument.id).filter(or_(*filters))
        if document_ids is not None:
            candidates = candidates.filter(ESGDocument.id.in_(document_ids))
        rows = (candidates.order_by(ESGDocument.created_at.desc(), ESGDocument.id, ESGChunk.chunk_index)
                .limit(RAG_CANDIDATE_LIMIT + 1).all())
    truncated = len(rows) > RAG_CANDIDATE_LIMIT
    rows = rows[:RAG_CANDIDATE_LIMIT]
    query_terms = set(tokenize(query))
    terms = [Counter(tokenize(chunk.content)) for chunk, _ in rows]
    lengths = [sum(t.values()) for t in terms]
    avg_len = sum(lengths) / len(lengths) if lengths else 1
    frequencies = {q: sum(q in t for t in terms) for q in query_terms}
    lexical = []
    for i, counts in enumerate(terms):
        score = 0.0
        for q in query_terms:
            tf = counts[q]
            if tf:
                idf = math.log(1 + (len(rows) - frequencies[q] + 0.5) / (frequencies[q] + 0.5))
                score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * lengths[i] / (avg_len or 1)))
        if score > 0:
            lexical.append((i, score))
    lexical.sort(key=lambda item: (-item[1], rows[item[0]][0].id))

    stored = {}
    for c in corpora:
        try:
            with open(os.path.join(CHROMA_PERSIST_DIR, f'fallback_{c}.json'), encoding='utf-8') as f:
                stored.update({r['id']: r for r in json.load(f) if isinstance(r, dict) and 'id' in r})
        except (OSError, ValueError, TypeError):
            pass  # SQL BM25 remains usable when the optional vector index is unavailable.
    dense = []
    if rows and stored and query_terms:
        try:
            vector, space = compute_embedding(query), embedding_space()
        except (ValueError, RuntimeError):
            vector, space = [], None
        for i, (chunk, doc) in enumerate(rows):
            cached = stored.get(chunk.vector_id, {})
            meta = cached.get('metadata', {})
            if (cached.get('document') != chunk.content or meta.get('tenant_id') != doc.tenant_id
                    or meta.get('embedding_space') != space):
                continue
            similarity = cosine_similarity(vector, cached.get('vector', []))
            # Hash collisions are never accepted as semantic evidence.
            if similarity >= min_confidence and (space != 'feature-hash-384-v1' or any(q in terms[i] for q in query_terms)):
                dense.append((i, similarity))
    dense.sort(key=lambda item: (-item[1], rows[item[0]][0].id))
    fused = {}
    for ranking in (lexical, dense):
        for rank, (i, _) in enumerate(ranking, 1):
            fused[i] = fused.get(i, 0) + 0.5 * 61 / (60 + rank)
    chunks, seen = [], set()
    for i in sorted(fused, key=lambda i: (-fused[i], rows[i][0].id)):
        chunk, doc = rows[i]
        duplicate = (doc.id, ' '.join(chunk.content.split()))
        if duplicate in seen:
            continue
        seen.add(duplicate)
        chunks.append(RetrievedChunk(chunk.content, fused[i], {
            'doc_id': doc.id, 'chunk_id': chunk.id, 'tenant_id': doc.tenant_id,
            'source_status': (doc.meta_info or {}).get('source_status', 'UNREVIEWED'),
            'filename': doc.filename, 'corpus': doc.corpus, 'page': chunk.page_number}))
        if len(chunks) == top_k:
            break
    return {'chunks': chunks, 'best_score': chunks[0].score if chunks else 0,
            'insufficient_data': not chunks, 'citations': [c.to_citation() for c in chunks],
            'retrieval_method': 'bm25_vector_rrf', 'candidate_count': len(rows), 'candidate_limit_reached': truncated}

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
    min_confidence: float = MIN_CONFIDENCE,
    db: Optional[Session] = None,
    document_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Core retrieval function:
    1. Embeds the user query.
    2. Searches ChromaDB or fallback store across target corpora.
    3. Enforces strict tenant isolation on tenant_docs.
    4. Computes confidence score and filters against threshold.
    """
    if corpus not in VALID_CORPORA and corpus != 'all':
        raise ValueError('Unknown corpus')
    if not 1 <= top_k <= 20:
        raise ValueError('top_k must be between 1 and 20')
    if db is not None:
        return _retrieve_sql(query, corpus, tenant_id, top_k, min_confidence, db, document_ids)
    if document_ids is not None:
        raise ValueError('Document-scoped retrieval requires the authorized SQL index')
    query_vec = compute_embedding(query)
    target_corpora = [corpus] if corpus in VALID_CORPORA else list(VALID_CORPORA)

    all_retrieved: List[RetrievedChunk] = []
    chroma = get_chroma_client()

    for c in target_corpora:
        # Strict tenant boundary: unauthenticated or tenantless callers cannot access tenant documents
        if c == CORPUS_TENANT_DOCS and (not tenant_id or not str(tenant_id).strip()):
            continue

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
                        # Defense-in-depth: verify metadata tenant_id explicitly
                        if c == CORPUS_TENANT_DOCS and metas[i].get("tenant_id") != tenant_id:
                            continue

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
