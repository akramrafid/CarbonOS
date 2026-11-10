"""
Pure-Python Okapi BM25 indexer with multilingual tokenization and metadata filtering.
Supports both English and Bengali queries without external C dependencies.
"""
import math
import re
from typing import List, Dict, Any, Optional, Tuple

TOKEN_PATTERN = re.compile(r"[\w\u0980-\u09FF]+", re.UNICODE)


def tokenize(text: str) -> List[str]:
    """Tokenize English and Bengali text into lowercased terms."""
    if not text:
        return []
    return [t.lower() for t in TOKEN_PATTERN.findall(text)]


class BM25Index:
    """Okapi BM25 index supporting metadata filtering."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size: int = 0
        self.avg_doc_len: float = 0.0
        self.doc_lens: List[int] = []
        self.doc_ids: List[str] = []
        self.documents: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.doc_freqs: Dict[str, int] = {}
        self.term_freqs: List[Dict[str, int]] = []

    def index(self, docs: List[Dict[str, Any]]):
        """
        Index documents.
        Each item in docs must have 'id', 'content', and optional 'metadata'.
        """
        self.doc_ids = []
        self.documents = []
        self.metadatas = []
        self.doc_lens = []
        self.term_freqs = []
        self.doc_freqs = {}

        total_len = 0
        for doc in docs:
            doc_id = str(doc.get("id", len(self.doc_ids)))
            content = doc.get("content", "")
            meta = doc.get("metadata", {})

            tokens = tokenize(content)
            d_len = len(tokens)
            total_len += d_len

            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1

            for t in tf.keys():
                self.doc_freqs[t] = self.doc_freqs.get(t, 0) + 1

            self.doc_ids.append(doc_id)
            self.documents.append(content)
            self.metadatas.append(meta)
            self.doc_lens.append(d_len)
            self.term_freqs.append(tf)

        self.corpus_size = len(self.doc_ids)
        self.avg_doc_len = (total_len / self.corpus_size) if self.corpus_size > 0 else 0.0

    def _idf(self, term: str) -> float:
        n = self.doc_freqs.get(term, 0)
        return math.log(((self.corpus_size - n + 0.5) / (n + 0.5)) + 1.0)

    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search corpus with BM25 and optional metadata filters.
        Returns list of dicts with id, score, content, metadata.
        """
        if self.corpus_size == 0:
            return []

        q_tokens = tokenize(query)
        if not q_tokens:
            return []

        scores: List[Tuple[int, float]] = []

        for idx in range(self.corpus_size):
            meta = self.metadatas[idx]

            # Enforce metadata filters
            if filters:
                match = True
                for k, v in filters.items():
                    if v is not None and meta.get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            d_len = self.doc_lens[idx]
            tf = self.term_freqs[idx]
            score = 0.0

            for q in q_tokens:
                if q not in tf:
                    continue
                f = tf[q]
                idf = self._idf(q)
                numerator = f * (self.k1 + 1.0)
                denominator = f + self.k1 * (1.0 - self.b + self.b * (d_len / self.avg_doc_len if self.avg_doc_len else 1.0))
                score += idf * (numerator / denominator)

            if score > 0:
                scores.append((idx, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for idx, sc in scores[:top_k]:
            results.append({
                "id": self.doc_ids[idx],
                "score": sc,
                "content": self.documents[idx],
                "metadata": self.metadatas[idx]
            })
        return results

