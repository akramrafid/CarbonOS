"""
Comprehensive tests for Phase 6: OCR Robustness & Bengali Support.
Covers:
1. Image preprocessing: 300 DPI rendering, deskewing, denoising, Otsu binarization.
2. Tesseract environment verification and startup fail-fast diagnostics.
3. Per-field OCR confidence thresholding and unreviewed low-confidence blocker enforcement.
4. Vision-LLM fallback dual gating (ESG_LLM_EXTRACTION_ENABLED + terms ref).
5. Literal grounding verification (accepting Bengali/ASCII digit matches, rejecting hallucinations).
"""
import os
import sys
import io
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402

import numpy as np
import cv2
from PIL import Image
from pypdf import PdfWriter
import pdfplumber

from esg_rag.ocr_preprocess import (
    preprocess_image_for_ocr,
    ensure_300_dpi,
    deskew_image,
    denoise_image,
    binarize_image,
    render_pdf_page_at_300_dpi,
    TARGET_DPI
)
from esg_rag.ocr import (
    check_tesseract_environment,
    verify_tesseract_installed,
    resolve_tesseract_cmd
)
from esg_rag.bills import OCRUnavailable
from esg_rag.bill_extract import Word, Document, Page
from esg_rag.ocr_fallback import (
    is_vision_llm_enabled,
    verify_value_literal_grounding,
    ground_llm_extracted_candidates
)
from esg_rag.bill_service import (
    get_field_confidence_threshold,
    FIELD_CONFIDENCE_THRESHOLDS,
    DEFAULT_OCR_CONFIDENCE_THRESHOLD,
    bill_gaps,
    create_bill,
    enter_value
)
from esg_rag.ledger_models import BillValue, Facility, ESGOrganization
from esg_rag import bill_profiles as bp


SHARED = bp.PROFILE_DIR.parent.parent.parent / "tests" / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")
API = "/api/esg"


class TestOcrImagePreprocessing(unittest.TestCase):
    def test_ensure_300_dpi_scales_low_res_image(self):
        img = Image.new("RGB", (600, 800), (255, 255, 255))
        upscaled = ensure_300_dpi(img)
        self.assertGreater(upscaled.width, img.width)
        self.assertGreater(upscaled.height, img.height)
        self.assertGreaterEqual(min(upscaled.size), 1800)

    def test_deskew_image_detects_and_corrects_skew(self):
        img = np.ones((300, 500), dtype=np.uint8) * 255
        center = (250, 150)
        rot_mat = cv2.getRotationMatrix2D(center, 5.0, 1.0)
        bar = np.zeros((300, 500), dtype=np.uint8)
        cv2.rectangle(bar, (100, 140), (400, 160), 255, -1)
        rotated_bar = cv2.warpAffine(bar, rot_mat, (500, 300))
        img[rotated_bar > 0] = 0

        deskewed, detected_angle = deskew_image(img)
        self.assertAlmostEqual(abs(detected_angle), 5.0, delta=1.5)
        self.assertEqual(deskewed.shape, img.shape)

    def test_deskew_image_ignores_extreme_or_trivial_angles(self):
        img = np.ones((300, 500), dtype=np.uint8) * 255
        cv2.rectangle(img, (100, 140), (400, 160), 0, -1)
        _, detected_angle = deskew_image(img, min_skew_deg=0.3)
        self.assertEqual(detected_angle, 0.0)

        deskewed_rej, detected_rej = deskew_image(img, max_skew_deg=0.0)
        self.assertEqual(detected_rej, 0.0)

    def test_denoise_and_binarize(self):
        img = np.ones((200, 300), dtype=np.uint8) * 255
        img[50, 50] = 0
        img[51, 50] = 0
        denoised = denoise_image(img, ksize=3)
        self.assertEqual(denoised[50, 50], 255)

        binary = binarize_image(denoised)
        unique_vals = set(np.unique(binary))
        self.assertTrue(unique_vals <= {0, 255})

    def test_render_pdf_page_at_300_dpi(self):
        writer = PdfWriter()
        writer.add_blank_page(width=100, height=100)
        buf = io.BytesIO()
        writer.write(buf)
        buf.seek(0)

        with pdfplumber.open(buf) as pdf:
            img = render_pdf_page_at_300_dpi(pdf.pages[0])
            self.assertIsInstance(img, Image.Image)
            self.assertGreater(img.width, 300)


class TestTesseractEnvironmentAndFailFast(ESGApiTestCase):
    def test_check_tesseract_environment_returns_diagnostic_when_missing(self):
        with patch("esg_rag.ocr.resolve_tesseract_cmd", return_value=None):
            ready, msg, langs = check_tesseract_environment()
            self.assertFalse(ready)
            self.assertIn("Tesseract binary not found", msg)
            self.assertEqual(langs, [])

    def test_check_tesseract_environment_reports_missing_bengali_language(self):
        with patch("esg_rag.ocr.resolve_tesseract_cmd", return_value="/mock/tesseract"), \
             patch("pytesseract.get_languages", return_value=["eng", "osd"]):
            ready, msg, langs = check_tesseract_environment(required_langs=("ben", "eng"))
            self.assertFalse(ready)
            self.assertIn("missing required language model(s): ben", msg)

    def test_verify_tesseract_installed_raises_ocrunavailable(self):
        with patch("esg_rag.ocr.resolve_tesseract_cmd", return_value=None):
            with self.assertRaises(OCRUnavailable) as ctx:
                verify_tesseract_installed()
            self.assertIn("Tesseract binary not found", str(ctx.exception))

    def test_upload_scanned_bill_without_tesseract_returns_422(self):
        self.add_member(self.org_a, "admin-a", "esg_admin")
        le = self.client.post(
            f"{API}/legal-entities",
            json={"name": "Synthetic Ltd", "country": "BD"},
            headers=auth("user-a")
        ).json()
        fac = self.client.post(
            f"{API}/facilities",
            json={"name": "Factory A", "code": "FAC-A", "country": "BD", "grid_region": "BD-NATIONAL", "legal_entity_id": le["id"]},
            headers=auth("user-a")
        ).json()

        img = Image.new("RGB", (100, 100), (255, 255, 255))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        with patch("esg_rag.ocr.resolve_tesseract_cmd", return_value=None):
            res = self.client.post(
                f"{API}/bills/upload",
                headers=auth("user-a"),
                data={"facility_id": fac["id"], "ocr": "true"},
                files={"file": ("bill.png", buf, "image/png")}
            )
            self.assertEqual(res.status_code, 422)
            self.assertIn("OCR unavailable", res.json()["detail"])


class TestPerFieldConfidenceThresholds(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        param_rows = self.client.post(f"{API}/bill-parameters", json={"yaml": PARAMS_YAML}, headers=auth("user-a")).json()
        for r in param_rows:
            self.client.post(f"{API}/bill-parameters/{r['id']}/approve", headers=auth("admin-a"))

        prof_rows = self.client.post(f"{API}/bill-profiles", json={"yaml": GRID_YAML}, headers=auth("user-a")).json()
        self.profile = prof_rows[0]
        self.client.post(f"{API}/bill-profiles/{self.profile['id']}/approve", headers=auth("admin-a"))

        le = self.client.post(
            f"{API}/legal-entities",
            json={"name": "Synthetic Ltd", "country": "BD"},
            headers=auth("user-a")
        ).json()
        fac = self.client.post(
            f"{API}/facilities",
            json={"name": "Factory A", "code": "FAC-A", "country": "BD", "grid_region": "BD-NATIONAL", "legal_entity_id": le["id"]},
            headers=auth("user-a")
        ).json()
        self.facility_id = fac["id"]

    def test_confidence_threshold_registry(self):
        self.assertEqual(get_field_confidence_threshold("energy.kwh.total"), 0.85)
        self.assertEqual(get_field_confidence_threshold("gas.volume.total"), 0.85)
        self.assertEqual(get_field_confidence_threshold("account.number"), 0.80)
        self.assertEqual(get_field_confidence_threshold("customer.name"), 0.70)
        self.assertEqual(get_field_confidence_threshold("unknown.field"), DEFAULT_OCR_CONFIDENCE_THRESHOLD)

    def test_low_confidence_ocr_field_blocks_posting_until_reviewed(self):
        doc = {
            "source": "ocr",
            "pages": [{
                "lines": [
                    "DESCO ELECTRICITY BILL",
                    "Account No ACC-BD-9001",
                    "Units Consumed: 1250 kWh",
                ]
            }]
        }
        res = self.client.post(
            f"{API}/bills",
            json={
                "facility_id": self.facility_id,
                "profile_id": self.profile["id"],
                "filename": "bill_ocr.pdf",
                "document": doc
            },
            headers=auth("user-a")
        )
        self.assertEqual(res.status_code, 201)
        bill_id = res.json()["id"]

        # Insert low-confidence extracted value (0.72 < 0.85 for energy.kwh.total)
        val = BillValue(
            organization_id=self.org_a,
            bill_id=bill_id,
            parameter_key="energy.kwh.total",
            value_text="1250",
            status="extracted",
            confidence="0.72",
            source="ocr"
        )
        db = self.Session()
        try:
            db.add(val)
            db.commit()
            val_id = val.id
        finally:
            db.close()

        # Check gaps
        gaps = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-a")).json()
        low_conf = gaps["low_confidence"]
        self.assertEqual(len(low_conf), 1)
        self.assertEqual(low_conf[0]["field"], "energy.kwh.total")
        self.assertEqual(low_conf[0]["reason"], "ocr_below_threshold")
        self.assertEqual(low_conf[0]["threshold"], 0.85)
        self.assertEqual(low_conf[0]["confidence"], 0.72)
        self.assertIn("UNREVIEWED_LOW_CONFIDENCE", gaps["calc_blockers"])
        self.assertFalse(gaps["ready_to_post"])

        # Review by confirming the extracted value
        res_confirm = self.client.post(
            f"{API}/bill-values/{val_id}/confirm",
            headers=auth("user-a")
        )
        self.assertEqual(res_confirm.status_code, 200)

        # Blocker UNREVIEWED_LOW_CONFIDENCE is now cleared
        gaps_after = self.client.get(f"{API}/bills/{bill_id}/gaps", headers=auth("user-a")).json()
        self.assertNotIn("UNREVIEWED_LOW_CONFIDENCE", gaps_after["calc_blockers"])


class TestVisionLlmGatingAndLiteralGrounding(unittest.TestCase):
    def test_vision_llm_dual_gating(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertFalse(is_vision_llm_enabled())

        with patch.dict(os.environ, {"ESG_LLM_EXTRACTION_ENABLED": "true"}, clear=True):
            self.assertFalse(is_vision_llm_enabled())

        with patch.dict(os.environ, {"ESG_LLM_PROCESSING_TERMS_REF": "TERMS-2026-V1"}, clear=True):
            self.assertFalse(is_vision_llm_enabled())

        with patch.dict(os.environ, {
            "ESG_LLM_EXTRACTION_ENABLED": "true",
            "ESG_LLM_PROCESSING_TERMS_REF": "TERMS-2026-V1"
        }, clear=True):
            self.assertTrue(is_vision_llm_enabled())

    def test_literal_grounding_accepts_exact_and_bengali_digits(self):
        words = [
            Word("Total", (10, 10, 40, 20)),
            Word("Units:", (45, 10, 80, 20)),
            Word("\u09e7\u09e8\u09ea\u09e6", (85, 10, 120, 20)),
            Word("kWh", (125, 10, 150, 20))
        ]

        grounded, matched, bbox = verify_value_literal_grounding("1240", words)
        self.assertTrue(grounded)
        self.assertEqual(matched, "\u09e7\u09e8\u09ea\u09e6")
        self.assertEqual(bbox, (85, 10, 120, 20))

        grounded_comma, _, _ = verify_value_literal_grounding("1,240", words)
        self.assertTrue(grounded_comma)

    def test_literal_grounding_rejects_and_flags_hallucinations(self):
        words = [
            Word("Account", (10, 10, 40, 20)),
            Word("01234567", (45, 10, 100, 20))
        ]

        candidates = [
            {"field": "account.number", "value": "01234567"},
            {"field": "energy.kwh.total", "value": "9999"}
        ]

        grounded_cands, findings = ground_llm_extracted_candidates(candidates, words)
        self.assertEqual(len(grounded_cands), 2)

        self.assertTrue(grounded_cands[0]["grounded"])
        self.assertEqual(grounded_cands[0]["flags"], [])

        self.assertFalse(grounded_cands[1]["grounded"])
        self.assertEqual(grounded_cands[1]["confidence"], 0.0)
        self.assertIn("UNVERIFIED_LLM_VALUE", grounded_cands[1]["flags"])
        self.assertIn("LLM_GROUNDING_FAILED:energy.kwh.total", findings)


if __name__ == "__main__":
    unittest.main()
