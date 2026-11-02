"""
Local OCR smoke test: Tesseract with the Bengali (ben) and English (eng) models reads a synthetic image through the code
path bills use (bill_extract.document_from_image). Nothing leaves the machine. The image is drawn here; it is not a bill.

Skipped when Tesseract, its ben/eng models or a Bengali font are missing, unless ESG_REQUIRE_OCR=1 (set in CI), where
it fails instead. TESSERACT_CMD points at a tesseract executable that is not on PATH.
"""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag import bill_extract  # noqa: E402
from esg_rag.bill_text import to_ascii_digits  # noqa: E402

REQUIRED = os.environ.get("ESG_REQUIRE_OCR") == "1"
BENGALI_FONTS = ("/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf",
                 "/usr/share/fonts/truetype/lohit-bengali/Lohit-Bengali.ttf",
                 r"C:\Windows\Fonts\Nirmala.ttf", r"C:\Windows\Fonts\Nirmala.ttc", r"C:\Windows\Fonts\vrinda.ttf")
LATIN_FONTS = ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", r"C:\Windows\Fonts\arial.ttf")


def _first(paths):
    return next((p for p in paths if os.path.exists(p)), None)


def _languages():
    try:
        import pytesseract
    except ImportError:
        return set(), "pytesseract is not installed"
    if os.environ.get("TESSERACT_CMD"):
        pytesseract.pytesseract.tesseract_cmd = os.environ["TESSERACT_CMD"]
    try:
        return set(pytesseract.get_languages(config="")), None
    except (pytesseract.TesseractNotFoundError, OSError) as e:
        return set(), f"tesseract not found ({type(e).__name__})"


class LocalOcrSmokeTest(unittest.TestCase):
    def setUp(self):
        langs, problem = _languages()
        missing = [problem] if problem else []
        if not problem and not {"ben", "eng"} <= langs:
            missing.append(f"Tesseract models ben and eng (found: {', '.join(sorted(langs)) or 'none'})")
        self.bengali_font, self.latin_font = _first(BENGALI_FONTS), _first(LATIN_FONTS)
        missing += [name for name, font in (("a Bengali font", self.bengali_font), ("a Latin font", self.latin_font))
                    if font is None]
        if missing and REQUIRED:
            self.fail("ESG_REQUIRE_OCR=1 but missing: " + "; ".join(missing))
        if missing:
            self.skipTest("not installed: " + "; ".join(missing))

    def test_bengali_digits_and_english_words_are_read_locally_with_boxes(self):
        from PIL import Image, ImageDraw, ImageFont
        image = Image.new("L", (1200, 320), 255)
        draw = ImageDraw.Draw(image)
        draw.text((40, 30), "Units consumed", font=ImageFont.truetype(self.latin_font, 64), fill=0)
        draw.text((40, 170), "১২৩৪৫", font=ImageFont.truetype(self.bengali_font, 80), fill=0)
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "synthetic_ocr_smoke.png")
            image.save(path)
            doc = bill_extract.document_from_image(path)
        words = [w for page in doc.pages for w in page.words]
        text = to_ascii_digits(" ".join(w.text for w in words))
        self.assertEqual(doc.source, "ocr")
        self.assertIn("consumed", text.lower())
        self.assertIn("12345", text.replace(" ", ""))
        for w in words:  # every word keeps the box a reviewer is shown
            x0, y0, x1, y1 = w.bbox
            self.assertTrue(0 <= x0 < x1 <= image.width and 0 <= y0 < y1 <= image.height, w)


if __name__ == "__main__":
    unittest.main()
