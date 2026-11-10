"""
Tesseract OCR integration (Bengali + English: ben+eng).
Handles local character recognition for scanned bill PDFs and images.
Includes startup verification, image preprocessing (deskew, denoise, Otsu binarization),
and word-level bounding box and confidence extraction.
Customer documents are processed locally in memory only; never transmitted to an external service.
"""
from typing import Tuple, List, Optional, Set
import os
import io
import shutil
from PIL import Image

from .bills import OCRUnavailable
from .bill_extract import Document, Page, Word, OCR_FORMATS, MAX_OCR_PIXELS, OCR_TIMEOUT_S, _source
from .ocr_preprocess import preprocess_image_for_ocr, render_pdf_page_at_300_dpi


COMMON_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"/usr/bin/tesseract",
    r"/usr/local/bin/tesseract",
]


def resolve_tesseract_cmd() -> Optional[str]:
    """Find Tesseract executable from TESSERACT_CMD env, PATH, or standard OS paths."""
    env_cmd = os.environ.get("TESSERACT_CMD")
    if env_cmd and os.path.exists(env_cmd):
        return env_cmd

    which_cmd = shutil.which("tesseract")
    if which_cmd:
        return which_cmd

    for candidate in COMMON_TESSERACT_PATHS:
        if os.path.exists(candidate):
            return candidate

    return None


def check_tesseract_environment(required_langs: Tuple[str, ...] = ("ben", "eng")) -> Tuple[bool, str, List[str]]:
    """
    Check if Tesseract binary and required language traineddata models are available.
    Returns (is_ready, diagnostic_message, installed_languages_list).
    """
    try:
        import pytesseract
    except ImportError:
        return False, "pytesseract library is not installed", []

    cmd = resolve_tesseract_cmd()
    if not cmd:
        return (
            False,
            "Tesseract binary not found on PATH, in TESSERACT_CMD, or in standard system locations. "
            "Install Tesseract-OCR and ensure it is on PATH or set TESSERACT_CMD.",
            []
        )

    pytesseract.pytesseract.tesseract_cmd = cmd

    try:
        langs = set(pytesseract.get_languages(config=""))
    except Exception as e:
        return False, f"Tesseract binary at '{cmd}' failed to run: {type(e).__name__} ({e})", []

    required_set = set(required_langs)
    missing = required_set - langs
    if missing:
        found_str = ", ".join(sorted(langs)) or "none"
        missing_str = ", ".join(sorted(missing))
        return (
            False,
            f"Tesseract is missing required language model(s): {missing_str} (found: {found_str}). "
            f"Install the {missing_str} traineddata models (e.g. tesseract-ocr-ben, tesseract-ocr-eng).",
            sorted(langs)
        )

    return True, f"Tesseract ready with languages: {', '.join(sorted(langs))}", sorted(langs)


def is_ocr_available() -> bool:
    """Return True if Tesseract with 'ben' and 'eng' is operational."""
    ready, _, _ = check_tesseract_environment()
    return ready


def verify_tesseract_installed(required_langs: Tuple[str, ...] = ("ben", "eng")) -> None:
    """Raise OCRUnavailable with diagnostic message if Tesseract is not fully configured."""
    ready, message, _ = check_tesseract_environment(required_langs)
    if not ready:
        raise OCRUnavailable(message)


def ocr_image_to_document(source, lang: str = "ben+eng", preprocess: bool = True) -> Document:
    """
    Run local Tesseract OCR on an image (path or bytes) with pre-processing.
    Measures per-word bounding box and confidence score.
    """
    with Image.open(_source(source), formats=OCR_FORMATS) as image:
        if image.width * image.height > MAX_OCR_PIXELS:
            raise ValueError(f"Image larger than {MAX_OCR_PIXELS} pixels")

        verify_tesseract_installed()
        import pytesseract

        cmd = resolve_tesseract_cmd()
        if cmd:
            pytesseract.pytesseract.tesseract_cmd = cmd

        if preprocess:
            processed_img, _ = preprocess_image_for_ocr(image)
        else:
            processed_img = image

        data = pytesseract.image_to_data(
            processed_img,
            lang=lang,
            output_type=pytesseract.Output.DICT,
            timeout=OCR_TIMEOUT_S
        )

    words = []
    # If image was scaled during preprocessing, we keep the boxes relative to processed dimensions
    # or scaled back. processed_img coordinates match what Tesseract analyzed.
    for i, text in enumerate(data.get("text", [])):
        cleaned = text.strip()
        if cleaned:
            x = data["left"][i]
            y = data["top"][i]
            w = data["width"][i]
            h = data["height"][i]
            conf = float(data["conf"][i])
            conf_val = (conf / 100.0) if conf >= 0 else None
            words.append(Word(cleaned, (float(x), float(y), float(x + w), float(y + h)), conf_val))

    return Document((Page(1, tuple(words)),), "ocr")


def ocr_pdf_to_document(source, lang: str = "ben+eng", max_pages: Optional[int] = None,
                        preprocess: bool = True) -> Document:
    """
    Render PDF pages at ~300 DPI and run local Tesseract OCR per page.
    Used for scanned utility bills without an embedded text layer.
    """
    verify_tesseract_installed()
    import pdfplumber
    import pytesseract

    cmd = resolve_tesseract_cmd()
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd

    pages = []
    with pdfplumber.open(_source(source)) as pdf:
        if max_pages is not None and len(pdf.pages) > max_pages:
            raise ValueError(f"A bill may have at most {max_pages} pages")

        for n, page in enumerate(pdf.pages, start=1):
            rendered_pil = render_pdf_page_at_300_dpi(page)
            if preprocess:
                processed_pil, _ = preprocess_image_for_ocr(rendered_pil)
            else:
                processed_pil = rendered_pil

            data = pytesseract.image_to_data(
                processed_pil,
                lang=lang,
                output_type=pytesseract.Output.DICT,
                timeout=OCR_TIMEOUT_S
            )

            words = []
            for i, text in enumerate(data.get("text", [])):
                cleaned = text.strip()
                if cleaned:
                    x = data["left"][i]
                    y = data["top"][i]
                    w = data["width"][i]
                    h = data["height"][i]
                    conf = float(data["conf"][i])
                    conf_val = (conf / 100.0) if conf >= 0 else None
                    words.append(Word(cleaned, (float(x), float(y), float(x + w), float(y + h)), conf_val))

            pages.append(Page(n, tuple(words)))

    return Document(tuple(pages), "ocr")

