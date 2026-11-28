"""Selected source IDs narrow authorized SQL retrieval; they never grant access or broaden fallback."""
import os
import sys
from unittest import mock
sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth
from esg_rag.models import ESGDocument, ESGChunk, ESGQueryLog
from esg_rag.ledger_models import AuditEvent
from esg_rag.retriever import retrieve
from esg_rag.generator import generate_answer


class DocumentQueryTest(ESGApiTestCase):
    def source(self, owner, text, corpus='tenant_docs'):
        with self.Session() as db:
            doc = ESGDocument(tenant_id=owner, corpus=corpus, filename='synthetic.txt')
            db.add(doc)
            db.flush()
            db.add(ESGChunk(document_id=doc.id, chunk_index=0, content=text, page_number=1))
            db.commit()
            return doc.id

    def query(self, ids, **kwargs):
        return self.client.post('/api/esg/query', headers=auth('user-a'), json={
            'query': 'boiler inspection policy', 'corpus': 'all', 'document_ids': ids, **kwargs})

    def test_selected_document_restricts_context_before_ranking_and_is_audited(self):
        first = self.source(self.org_a, 'Synthetic boiler inspection policy: every 12 months.')
        second = self.source(self.org_a, 'Synthetic boiler inspection policy: every 24 months.')
        private = self.source(self.org_b, 'Boiler inspection secret: 999 months.')
        with mock.patch('esg_rag.retriever.RAG_CANDIDATE_LIMIT', 1), \
             mock.patch('esg_rag.router.generate_answer', wraps=generate_answer) as generator:
            response = self.query([first])
            self.assertEqual(response.status_code, 200)
            result = response.json()
            self.assertEqual({chunk.doc_id for chunk in generator.call_args.args[1]['chunks']}, {first})
        self.assertEqual(result['document_ids'], [first])
        self.assertIn('12 months', result['answer'])
        self.assertNotIn('24 months', result['answer'])
        self.assertNotIn('999', result['answer'])
        self.assertEqual({c['document_id'] for c in result['citations']}, {first})
        with self.Session() as db:
            event = db.query(AuditEvent).filter_by(action='evidence.query_scoped').one()
            self.assertEqual(event.entity_id, result['query_id'])
            self.assertEqual(event.organization_id, self.org_a)
            self.assertEqual(event.data['document_ids'], [first])
            self.assertEqual(db.query(ESGQueryLog).filter_by(id=result['query_id']).one().tenant_id, self.org_a)
        combined = self.query([first, second]).json()
        self.assertTrue({c['document_id'] for c in combined['citations']} <= {first, second})
        self.assertNotIn(private, str(combined))

    def test_inaccessible_unknown_and_poisoned_global_documents_fail_before_generation(self):
        own = self.source(self.org_a, 'Boiler policy 12 months.')
        foreign = self.source(self.org_b, 'Boiler policy 999 months.')
        poisoned = self.source('global_regulatory', 'Boiler policy wrong corpus.', 'tenant_docs')
        for ids in [[foreign], ['not-a-real-id'], [own, foreign], [poisoned]]:
            with mock.patch('esg_rag.router.retrieve') as search, mock.patch('esg_rag.router.generate_answer') as model:
                response = self.query(ids)
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.json(), {'detail': 'Selected source documents not found'})
                search.assert_not_called()
                model.assert_not_called()
        with self.Session() as db:
            self.assertEqual(db.query(ESGQueryLog).count(), 0)

    def test_empty_invalid_and_duplicate_scope_is_not_broadened(self):
        own = self.source(self.org_a, 'Boiler policy 12 months.')
        for ids in [[], [own, own], [own, 'x', 'y'], [' '], ['x' * 37]]:
            self.assertEqual(self.query(ids).status_code, 422)

    def test_no_match_corpus_filter_and_shared_scope_stay_explicit(self):
        unrelated = self.source(self.org_a, 'Synthetic cafeteria policy: lunch service.')
        self.source(self.org_a, 'Boiler inspection policy: 12 months.')
        self.assertTrue(self.query([unrelated], query='boiler inspection').json()['insufficient_data'])
        shared = self.source('global_regulatory', 'Synthetic boiler inspection reference: 18 months.', 'regulatory')
        self.assertIn('18 months', self.query([shared]).json()['answer'])
        self.assertTrue(self.query([shared], corpus='tenant_docs').json()['insufficient_data'])
        with self.Session() as db:
            self.assertTrue(retrieve('boiler', 'all', self.org_a, db=db, document_ids=[])['insufficient_data'])
        with self.assertRaisesRegex(ValueError, 'SQL index'):
            retrieve('boiler', 'all', self.org_a, document_ids=[unrelated])
