"""Executable RAG trust-boundary checks; synthetic sources, no network or model accuracy claims."""
import json
import sys
import os
import unittest
import tempfile
from pathlib import Path
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth
from esg_rag.generator import generate_answer
from esg_rag.retriever import RetrievedChunk, cosine_similarity, retrieve
from esg_rag.models import ESGDocument, ESGChunk
from esg_rag.ingest import chunk_text


class RagQualityTest(ESGApiTestCase):
    def evaluate_retrieval_fixture(self):
        fixture = json.loads((Path(__file__).parent / 'fixtures/esg_rag_retrieval.json').read_text())
        tenants = {'a': self.org_a, 'b': self.org_b, '': '', 'global_regulatory': 'global_regulatory'}
        db = self.Session()
        for source in fixture['sources']:
            doc = ESGDocument(tenant_id=tenants[source['tenant']], corpus=source['corpus'], filename=source['name'])
            db.add(doc)
            db.flush()
            db.add(ESGChunk(document_id=doc.id, chunk_index=0, content=source['text'], page_number=1))
        db.commit()
        results = []
        for case in fixture['queries']:
            actual = retrieve(case['query'], case['corpus'], tenants[case['tenant']], db=db)
            names = [c.filename for c in actual['chunks']]
            expected = case['expected']
            rank = names.index(expected) + 1 if expected in names else None
            results.append({**case, 'retrieved': names, 'rank': rank,
                            'passed': bool(rank) if expected else not names})
        db.close()
        answerable = [r for r in results if r['expected']]
        negative = [r for r in results if not r['expected']]
        return {'classification': fixture['classification'], 'method': 'SQL BM25 with no stored dense vectors',
                'query_count': len(results), 'recall_at_5': sum(bool(r['rank']) for r in answerable) / len(answerable),
                'mrr_at_5': sum(1/r['rank'] if r['rank'] else 0 for r in answerable) / len(answerable),
                'negative_abstention_rate': sum(r['passed'] for r in negative) / len(negative),
                'results': results}

    def test_labeled_retrieval_fixture(self):
        report = self.evaluate_retrieval_fixture()
        self.assertTrue(all(r['passed'] for r in report['results']), report)
        self.assertEqual(report['mrr_at_5'], 1)

    def test_dense_rankings_require_matching_content_and_embedding_space(self):
        db = self.Session()
        doc = ESGDocument(tenant_id=self.org_a, corpus='tenant_docs', filename='semantic.txt')
        db.add(doc)
        db.flush()
        chunk = ESGChunk(document_id=doc.id, chunk_index=0, content='Purchased electricity disclosure.', vector_id='vector-1')
        db.add(chunk)
        db.commit()
        with tempfile.TemporaryDirectory() as path, mock.patch('esg_rag.retriever.CHROMA_PERSIST_DIR', path), \
             mock.patch('esg_rag.retriever.compute_embedding', return_value=[1, 0]), \
             mock.patch('esg_rag.retriever.embedding_space', return_value='test-semantic-model'):
            record = {'id': 'vector-1', 'document': chunk.content, 'vector': [1, 0],
                      'metadata': {'tenant_id': self.org_a, 'embedding_space': 'test-semantic-model'}}
            store = os.path.join(path, 'fallback_tenant_docs.json')
            for space, text, expected in [('wrong-model', chunk.content, False),
                                          ('test-semantic-model', 'stale poisoned content', False),
                                          ('test-semantic-model', chunk.content, True)]:
                record['metadata']['embedding_space'], record['document'] = space, text
                with open(store, 'w') as f:
                    json.dump([record], f)
                result = retrieve('indirect energy', 'tenant_docs', self.org_a, db=db)
                self.assertEqual(bool(result['chunks']), expected)
        db.close()

    def test_database_sources_survive_unavailable_vector_store_and_remain_tenant_scoped(self):
        document_id = self.upload('user-a', 'policy.txt', b'Boiler maintenance policy: inspect the boiler every 12 months.').json()['document_id']
        # A content marker can also occur in an authorized identifier; it is not a source leak.
        chunk_id = '00000000-0000-4000-8000-000000000999'
        with self.Session() as db:
            chunk = db.query(ESGChunk).filter(ESGChunk.document_id == document_id).one()
            chunk.id = chunk_id
            db.commit()
        self.upload('user-b', 'secret.txt', b'Boiler maintenance policy: secret interval 999 months.')
        with mock.patch('esg_rag.retriever.get_chroma_client', return_value=None), \
             mock.patch('esg_rag.retriever.retrieve_from_fallback', return_value=[]):
            result = self.client.post('/api/esg/query', headers=auth('user-a'), json={
                'query': 'boiler maintenance inspection interval', 'corpus': 'tenant_docs'}).json()
        self.assertFalse(result['insufficient_data'])
        self.assertIn('12 months', result['answer'])
        self.assertNotIn('999', result['answer'])
        self.assertEqual([(c['document_id'], c['chunk_id']) for c in result['citations']], [(document_id, chunk_id)])
        citation = result['citations'][0]
        self.assertEqual(citation['snippet'], 'Boiler maintenance policy: inspect the boiler every 12 months.')
        self.assertEqual(result['candidate_count'], 1)
        self.assertEqual(len(citation['content_sha256']), 64)
        self.assertEqual(result['retrieval_method'], 'bm25_vector_rrf')
        self.assertEqual(result['answer_mode'], 'retrieval_only')

    def test_unknown_corpus_is_rejected_not_broadened(self):
        response = self.client.post('/api/esg/query', headers=auth('user-a'), json={
            'query': 'boiler policy', 'corpus': 'tennat_docs'})
        self.assertEqual(response.status_code, 422)

    def test_lexical_retrieval_handles_bengali_and_abstains_on_unrelated_question(self):
        self.upload('user-a', 'bangla.txt', 'বিদ্যুৎ ব্যবহার ১২৫০০০ কিলোওয়াট ঘণ্টা।'.encode())
        result = self.client.post('/api/esg/query', headers=auth('user-a'), json={
            'query': 'বিদ্যুৎ ব্যবহার', 'corpus': 'tenant_docs'}).json()
        self.assertFalse(result['insufficient_data'])
        unrelated = self.client.post('/api/esg/query', headers=auth('user-a'), json={
            'query': 'ocean shipping pension discounts', 'corpus': 'tenant_docs'}).json()
        self.assertTrue(unrelated['insufficient_data'])
        self.assertEqual(unrelated['citations'], [])


class GroundedGenerationTest(unittest.TestCase):
    def test_chunking_does_not_duplicate_the_final_overlap(self):
        short = chunk_text([{'page': 1, 'text': 'A' * 300}])
        self.assertEqual(len(short), 1)
        long = chunk_text([{'page': 1, 'text': 'A' * 650}])
        self.assertEqual([len(c['content']) for c in long], [512, 202])

    def setUp(self):
        self.chunk = RetrievedChunk('Boiler inspections occur every 12 months.', 0.8, {
            'doc_id': 'doc-a', 'chunk_id': 'chunk-a', 'filename': 'policy.txt',
            'page': 2, 'corpus': 'tenant_docs', 'tenant_id': 'a'})
        self.retrieval = {'chunks': [self.chunk], 'insufficient_data': False}
        self.valid = {'insufficient_data': False, 'claims': [{'text': 'Inspect the boiler every 12 months.',
            'evidence': [{'source_id': 'S1', 'quote': self.chunk.content}]}]}

    def generate(self, payload):
        with mock.patch('esg_rag.generator.generate_answer_with_gemini', return_value=(json.dumps(payload), 'test-model')):
            return generate_answer('How often is boiler inspection?', self.retrieval)

    def test_valid_structured_claim_has_server_owned_citation(self):
        result = self.generate(self.valid)
        self.assertEqual(result['answer_mode'], 'supported_synthesis')
        self.assertIn('[Source: policy.txt, Page 2]', result['answer'])
        self.assertIn('12 months', result['answer'])
        self.assertEqual(result['citations'][0]['chunk_id'], 'chunk-a')

    def test_invalid_citations_quotes_or_numbers_revert_to_retrieval(self):
        cases = [
            {'text': 'Inspect every 999 months.', 'evidence': [{'source_id': 'S1', 'quote': self.chunk.content}]},
            {'text': 'Inspect every 12 months.', 'evidence': [{'source_id': 'S99', 'quote': self.chunk.content}]},
            {'text': 'Inspect every 12 months.', 'evidence': [{'source_id': 'S1', 'quote': 'Invented regulation 12 months'}]},
            {'text': 'A statement with no evidence.', 'evidence': []},
        ]
        for claim in cases:
            with self.subTest(claim=claim):
                result = self.generate({'insufficient_data': False, 'claims': [claim]})
                self.assertEqual(result['answer_mode'], 'retrieval_only')
                self.assertEqual(result['model_used'], 'retrieval-only')

    def test_model_can_abstain_even_with_retrieved_passages(self):
        result = self.generate({'insufficient_data': True, 'claims': []})
        self.assertTrue(result['insufficient_data'])
        self.assertEqual(result['citations'], [])

    def test_bad_vectors_are_ignored_instead_of_crashing(self):
        for a, b in [([1], [1, 2]), ([float('nan')], [1]), ([], [])]:
            self.assertEqual(cosine_similarity(a, b), 0)
