from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Diagnosis, WeatherRiskSnapshot

class FarmersAITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Diagnosis.objects.all().delete()

    def test_diagnose_missing_parameters_returns_400(self):
        resp = self.client.post('/api/farmers-ai/diagnose/', {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', resp.json())

    @patch('requests.post')
    def test_scenario_e_model_unavailable_safeguard(self, mock_post):
        """
        Master Prompt Phase 11.2 & Regression Scenario E:
        The local crop classifier has no trained weights and cloud is unreachable.
        Expected: Model unavailable status, confidence 0.0, needs_agronomist_review=True,
        and no random disease diagnosis or fake treatment displayed.
        """
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "MODEL_UNAVAILABLE",
            "error": "Trained crop diagnosis model checkpoint unavailable and cloud inference unreachable.",
            "species": "rice",
            "disease": "Diagnosis Unavailable",
            "confidence": 0.0,
            "severity": "unknown",
            "needs_agronomist_review": True,
            "message_bn": "বর্তমানে স্বয়ংক্রিয় রোগ নির্ণয় মডেল অনুপলব্ধ। অনুগ্রহ করে অভিজ্ঞ কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।",
            "heatmap_url": None,
            "data_origin": "model_unavailable"
        }
        mock_post.return_value = mock_response

        dummy_img = SimpleUploadedFile("leaf.jpg", b"fake_image_bytes", content_type="image/jpeg")
        resp = self.client.post('/api/farmers-ai/diagnose/', {
            'image': dummy_img,
            'species': 'rice',
            'field_id': 'field_sylhet_01'
        }, format='multipart')

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertEqual(data.get("status"), "MODEL_UNAVAILABLE")
        self.assertEqual(data.get("disease"), "Diagnosis Unavailable")
        self.assertEqual(data.get("confidence"), 0.0)
        self.assertTrue(data.get("needs_agronomist_review"))
        self.assertIn("অনুপলব্ধ", data["treatment_plan"]["text_bn"])

        # Verify DB record
        diag = Diagnosis.objects.first()
        self.assertIsNotNone(diag)
        self.assertEqual(diag.disease, "Diagnosis Unavailable")
        self.assertEqual(diag.confidence, 0.0)
        self.assertTrue(diag.needs_agronomist_review)

    @patch('requests.post')
    def test_diagnose_success_contract(self, mock_post):
        """Verify successful diagnosis contract payload."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "species": "rice",
            "disease": "blast",
            "confidence": 92.5,
            "severity": "severe",
            "needs_agronomist_review": False,
            "heatmap_url": "data:image/jpeg;base64,dummy_cam"
        }
        mock_post.return_value = mock_response

        dummy_img = SimpleUploadedFile("leaf.jpg", b"fake_image_bytes", content_type="image/jpeg")
        resp = self.client.post('/api/farmers-ai/diagnose/', {
            'image': dummy_img,
            'species': 'rice',
            'field_id': 'field_rangpur_02'
        }, format='multipart')

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertEqual(data["disease"], "blast")
        self.assertAlmostEqual(data["confidence"], 92.5)
        self.assertEqual(data["severity"], "severe")
        self.assertIn("treatment_plan", data)
        self.assertIn("weather_risk", data)

    def test_get_journal_filtering(self):
        """Verify journal endpoint returns history filtered by field_id."""
        Diagnosis.objects.create(species="rice", disease="blast", confidence=90.0, field_id="f1")
        Diagnosis.objects.create(species="rice", disease="healthy", confidence=98.0, field_id="f1")
        Diagnosis.objects.create(species="potato", disease="late_blight", confidence=88.0, field_id="f2")

        resp = self.client.get('/api/farmers-ai/journal/?field_id=f1')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        entries = data.get("entries", [])
        self.assertEqual(len(entries), 2)
        for e in entries:
            self.assertEqual(e["species"], "rice")
