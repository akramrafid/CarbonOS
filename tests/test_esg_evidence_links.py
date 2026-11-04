"""Supplied activity/metric source IDs bind only to SQL-authorized documents; no trust is inferred."""
import os
import sys
from unittest import mock
sys.path.insert(0, os.path.dirname(__file__))
from test_esg_ledger import LedgerTestCase
from esg_rag.models import ESGDocument
from esg_rag.ledger_models import ActivityRecord, AuditEvent, MetricObservation
from esg_rag.evidence import visible_document_filter


class EvidenceLinkTest(LedgerTestCase):
    def source(self, owner, corpus='tenant_docs'):
        with self.Session() as db:
            doc = ESGDocument(tenant_id=owner, corpus=corpus, filename='synthetic-source.txt', meta_info={'source_status': 'UNREVIEWED'})
            db.add(doc)
            db.commit()
            return doc.id

    def metric(self, document_id=None, period=None):
        body = {'period_id': period or self.period, 'metric_key': 'water_withdrawal', 'value': '1',
                'dimensions': {'source': 'groundwater'}}
        if document_id is not None:
            body['source_document_id'] = document_id
        return self.call('POST', 'contrib-a', '/metrics', body)

    def test_unknown_foreign_and_misowned_ids_create_no_activity_metric_or_audit(self):
        invalid = [self.source(self.org_b), 'missing-id', self.source('global_regulatory', 'tenant_docs'),
                   self.source('global_regulatory', 'emission_factors'), self.source(self.org_a, 'regulatory')]
        with self.Session() as db:
            before = db.query(AuditEvent).count()
        for document_id in invalid:
            for response in [self.activity(source_document_id=document_id), self.metric(document_id)]:
                self.assertEqual(response.status_code, 404, response.text)
                self.assertEqual(response.json(), {'detail': 'Source document not found'})
        for document_id in ['', 'x' * 37]:
            self.assertEqual(self.activity(source_document_id=document_id).status_code, 422)
            self.assertEqual(self.metric(document_id).status_code, 422)
        with self.Session() as db:
            self.assertEqual(db.query(ActivityRecord).count(), 0)
            self.assertEqual(db.query(MetricObservation).count(), 0)
            self.assertEqual(db.query(AuditEvent).count(), before)

    def test_own_and_matching_shared_sources_remain_unreviewed_draft_references(self):
        ids = [self.source(self.org_a), self.source('global_regulatory', 'regulatory'), self.source('global_ef', 'emission_factors')]
        for index, document_id in enumerate(ids):
            record = self.activity(source_document_id=document_id, meter_ref=f'valid-source-{index}')
            self.assertEqual(record.status_code, 200, record.text)
            self.assertEqual((record.json()['source_document_id'], record.json()['status']), (document_id, 'DRAFT'))
            period = self.post('user-a', '/periods', {'name': f'Metric source {index}', 'start_date': '2025-01-01',
                'end_date': '2025-12-31', 'boundary_method': 'operational_control'})['id']
            observation = self.metric(document_id, period)
            self.assertEqual(observation.status_code, 200, observation.text)
            self.assertEqual((observation.json()['source_document_id'], observation.json()['status']), (document_id, 'DRAFT'))
        self.assertEqual(self.activity(meter_ref='manual-no-link', source_ref='Paper invoice, not uploaded').status_code, 200)
        self.assertEqual(self.metric().status_code, 200)
        with self.Session() as db:
            self.assertTrue(all(doc.meta_info['source_status'] == 'UNREVIEWED' for doc in db.query(ESGDocument).all()))

    def test_empty_visibility_configuration_fails_closed(self):
        self.source(self.org_a)
        with self.Session() as db, mock.patch('esg_rag.evidence.GLOBAL_CORPUS_OWNER', {}):
            self.assertEqual(db.query(ESGDocument).filter(visible_document_filter('')).count(), 0)
            self.assertEqual(db.query(ESGDocument).filter(visible_document_filter(None)).count(), 0)
            self.assertEqual(db.query(ESGDocument).filter(visible_document_filter(self.org_a)).count(), 1)
