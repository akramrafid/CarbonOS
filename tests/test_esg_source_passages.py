"""Source inspection uses SQL membership/corpus boundaries, not supplied citation IDs as authority."""
import hashlib
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth
from esg_rag.models import ESGDocument, ESGChunk


class SourcePassageTest(ESGApiTestCase):
    def source(self, owner, corpus='tenant_docs', text='Synthetic policy: inspect every 12 months.'):
        with self.Session() as db:
            doc = ESGDocument(tenant_id=owner, corpus=corpus, filename='source.txt', meta_info={'source_status': 'UNREVIEWED'})
            db.add(doc)
            db.flush()
            chunk = ESGChunk(document_id=doc.id, chunk_index=0, content=text, page_number=2)
            db.add(chunk)
            db.commit()
            return doc.id, chunk.id

    def read(self, ids, headers):
        return self.client.get(f'/api/esg/documents/{ids[0]}/chunks/{ids[1]}', headers=headers)

    def test_full_passage_hash_and_metadata_require_read_permission(self):
        text = 'Synthetic policy. <script>untrusted source text</script> ' + 'inspection record ' * 30
        ids = self.source(self.org_a, text=text)
        result = self.read(ids, auth('user-a'))
        self.assertEqual(result.status_code, 200)
        body = result.json()
        self.assertEqual(body['content'], text)
        self.assertEqual(body['content_sha256'], hashlib.sha256(text.encode()).hexdigest())
        self.assertEqual((body['page'], body['source_status']), (2, 'UNREVIEWED'))
        self.assertEqual(self.read(ids, {}).status_code, 401)
        self.add_member(self.org_a, 'supplier', 'supplier_collaborator')
        self.assertEqual(self.read(ids, auth('supplier')).status_code, 403)

    def test_tenant_ids_and_passage_document_pairs_cannot_be_swapped(self):
        a, b = self.source(self.org_a), self.source(self.org_b)
        for ids in [b, (a[0], b[1]), ('missing', a[1]), (a[0], 'missing')]:
            result = self.read(ids, auth('user-a'))
            self.assertEqual(result.status_code, 404)
            self.assertEqual(result.json(), {'detail': 'Source passage not found'})
        self.assertEqual(self.read(a, auth('user-b')).status_code, 404)
        self.assertEqual(self.read(a, auth('user-a', self.org_b)).status_code, 403)

    def test_shared_visibility_requires_both_operator_owner_and_matching_corpus(self):
        allowed = [self.source('global_regulatory', 'regulatory'), self.source('global_ef', 'emission_factors')]
        forbidden = [self.source(self.org_b, 'regulatory'), self.source(self.org_a, 'regulatory'),
                     self.source('global_regulatory', 'tenant_docs'), self.source('global_regulatory', 'emission_factors')]
        for ids in allowed:
            self.assertEqual(self.read(ids, auth('user-a')).status_code, 200)
        for ids in forbidden:
            self.assertEqual(self.read(ids, auth('user-a')).status_code, 404)
        listed = self.client.get('/api/esg/documents', headers=auth('user-a')).json()
        self.assertEqual({d['id'] for d in listed}, {ids[0] for ids in allowed})
