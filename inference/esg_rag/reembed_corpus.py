"""
Re-embedding & Ingestion Migration Script for CarbonOS ESG Knowledge Base.
Ingests the authoritative corpus using structure-aware chunking and records:
publisher, year, version, license, scope, fuel, gas, region, language, and collection metadata.
"""
import os
import json
from pathlib import Path
from typing import List, Dict, Any

from .config import (
    CHROMA_PERSIST_DIR,
    EMBEDDING_MODEL,
    CORPUS_REGULATORY,
    CORPUS_EMISSION_FACTORS,
    CORPUS_TENANT_DOCS,
    VALID_CORPORA
)
from .chunker import structure_aware_chunk
from .ingest import compute_embedding, get_chroma_client
from .hybrid_retriever import reset_bm25_cache

CORPUS_DIR = Path(__file__).resolve().parent / "corpus"

DOC_CATALOG = [
    {
        "filename": "ghg_protocol_standards.md",
        "corpus": CORPUS_REGULATORY,
        "tenant_id": "global_regulatory",
        "metadata": {
            "publisher": "World Resources Institute (WRI) & WBCSD",
            "year": 2015,
            "version": "Corporate Standard / Scope 2 Guidance",
            "license": "CC-BY-4.0",
            "region": "GLOBAL"
        }
    },
    {
        "filename": "ipcc_2006_combustion_and_ar6_gwp.md",
        "corpus": CORPUS_EMISSION_FACTORS,
        "tenant_id": "global_ef",
        "metadata": {
            "publisher": "Intergovernmental Panel on Climate Change (IPCC)",
            "year": 2021,
            "version": "2006 Guidelines Vol 2 / AR6 WG1 Ch 7",
            "license": "United Nations Public Domain / IPCC Terms",
            "region": "GLOBAL"
        }
    },
    {
        "filename": "bangladesh_climate_regulatory.md",
        "corpus": CORPUS_REGULATORY,
        "tenant_id": "global_regulatory",
        "metadata": {
            "publisher": "Ministry of Environment, Forest and Climate Change (MoEFCC) / BERC",
            "year": 2023,
            "version": "ECR 2023 (S.R.O. 53) / Updated NDC 2021",
            "license": "Bangladesh Government Public Domain",
            "region": "BD-NATIONAL"
        }
    },
    {
        "filename": "bd_grid_methodology.md",
        "corpus": CORPUS_EMISSION_FACTORS,
        "tenant_id": "global_ef",
        "metadata": {
            "publisher": "CarbonOS Research & Engineering",
            "year": 2026,
            "version": "Methodology Note v2.0 (factors/bd_grid)",
            "license": "CC-BY-4.0",
            "region": "BD-NATIONAL"
        }
    },
    {
        "filename": "dexterity_textiles_demo.md",
        "corpus": CORPUS_TENANT_DOCS,
        "tenant_id": "demo_tenant",  # Strictly quarantined to demo tenant
        "metadata": {
            "publisher": "Dexterity Textiles Ltd (Fictional Demo)",
            "year": 2026,
            "version": "Q2 2026 Sample Logbook",
            "license": "FICTIONAL_DEMO_DATA: NOT AUDITED",
            "region": "BD-DEPZ"
        }
    }
]


def reembed_corpus():
    """Ingest and re-embed all documents in the authoritative catalog."""
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
    chroma = get_chroma_client()
    corpus_chunks: Dict[str, List[Dict[str, Any]]] = {c: [] for c in VALID_CORPORA}

    print(f"[ESG RAG] Starting corpus re-embedding with model: {EMBEDDING_MODEL}")

    for doc_entry in DOC_CATALOG:
        path = CORPUS_DIR / doc_entry["filename"]
        if not path.is_file():
            print(f"[ESG RAG] Warning: File not found: {path}")
            continue

        text = path.read_text(encoding="utf-8")
        target_corpus = doc_entry["corpus"]
        tenant_id = doc_entry["tenant_id"]
        doc_meta = dict(doc_entry["metadata"])
        doc_meta["tenant_id"] = tenant_id

        chunks = structure_aware_chunk(
            text=text,
            filename=doc_entry["filename"],
            doc_metadata=doc_meta,
            max_chunk_chars=900
        )

        for ch in chunks:
            ch_meta = {
                "filename": ch["filename"],
                "publisher": ch["publisher"],
                "year": ch["year"],
                "version": ch["version"],
                "scope": ch["scope"],
                "fuel": ch["fuel"],
                "gas": ch["gas"],
                "region": ch["region"],
                "language": ch["language"],
                "page": ch["page"],
                "section": ch["section"],
                "license": ch["license"],
                "tenant_id": tenant_id,
                "corpus": target_corpus
            }
            vec = compute_embedding(ch["content"])
            corpus_chunks[target_corpus].append({
                "id": f"{target_corpus}_{ch['filename']}_{ch['chunk_index']}",
                "document": ch["content"],
                "vector": vec,
                "metadata": ch_meta
            })

        print(f"[ESG RAG] Parsed {len(chunks)} structure-aware chunks from {doc_entry['filename']} (Corpus: {target_corpus})")

    # Save to ChromaDB and JSON fallback store
    for c_name, records in corpus_chunks.items():
        if not records:
            continue

        # 1. Update fallback JSON store
        fallback_file = os.path.join(CHROMA_PERSIST_DIR, f"fallback_{c_name}.json")
        with open(fallback_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        print(f"[ESG RAG] Wrote {len(records)} records to {fallback_file}")

        # 2. Update ChromaDB collection with collection metadata
        if chroma is not None:
            try:
                coll_name = f"esg_{c_name}"
                try:
                    chroma.delete_collection(name=coll_name)
                except Exception:
                    pass

                coll = chroma.create_collection(
                    name=coll_name,
                    metadata={
                        "embedding_model": EMBEDDING_MODEL,
                        "model_version": "v1.0",
                        "corpus_version": "2026.11",
                        "hnsw:space": "cosine"
                    }
                )
                coll.add(
                    ids=[r["id"] for r in records],
                    documents=[r["document"] for r in records],
                    embeddings=[r["vector"] for r in records],
                    metadatas=[r["metadata"] for r in records]
                )
                print(f"[ESG RAG] Updated Chroma collection '{coll_name}' with {len(records)} items.")
            except Exception as e:
                print(f"[ESG RAG] Chroma write error for {c_name}: {e}")

    # Reset BM25 cache
    reset_bm25_cache()
    print("[ESG RAG] Corpus re-embedding complete!")


if __name__ == "__main__":
    reembed_corpus()

