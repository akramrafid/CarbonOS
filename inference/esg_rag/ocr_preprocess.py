"""
Image preprocessing pipeline for local OCR (Tesseract ben+eng).
Prepares scanned and digital bill images for maximum character recognition accuracy:
1. High-resolution rendering / upscaling to ~300 DPI.
2. Deskewing to align text lines horizontally.
3. Denoising to eliminate scanner speckles without eroding character strokes or Bengali matras.
4. Optimal binarization via Otsu's adaptive thresholding.
"""
from typing import Tuple, Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image


TARGET_DPI = 300
MIN_DPI_WIDTH = 1800  # A4 width at ~220+ DPI; standard 300 DPI A4 is 2480x3508
MAX_ALLOWED_PIXELS = 40_000_000


def render_pdf_page_at_300_dpi(pdfplumber_page) -> Image.Image:
    """Render a pdfplumber PDF page to a PIL Image at 300 DPI (bounded by MAX_ALLOWED_PIXELS)."""
    est_pixels = (float(pdfplumber_page.width or 0) * TARGET_DPI / 72.0) * (float(pdfplumber_page.height or 0) * TARGET_DPI / 72.0)
    if est_pixels > MAX_ALLOWED_PIXELS:
        raise ValueError(f"PDF page exceeds maximum render size of {MAX_ALLOWED_PIXELS} pixels")
    return pdfplumber_page.to_image(resolution=TARGET_DPI).original


def ensure_300_dpi(image: Image.Image) -> Image.Image:
    """
    Ensure image has sufficient resolution (~300 DPI equivalent) for OCR.
    If image dimensions correspond to screen resolution (~72-96 DPI),
    upscale using Lanczos resampling.
    """
    w, h = image.size
    total_pixels = w * h
    if total_pixels > MAX_ALLOWED_PIXELS:
        # Avoid exploding oversized images
        return image

    # If an A4 page is under 1800px on its narrow side, upscale to ~300 DPI
    narrow_dim = min(w, h)
    if narrow_dim < MIN_DPI_WIDTH and narrow_dim > 0:
        scale_factor = min(3.0, MIN_DPI_WIDTH / float(narrow_dim))
        if scale_factor > 1.2:
            new_w = int(round(w * scale_factor))
            new_h = int(round(h * scale_factor))
            if new_w * new_h <= MAX_ALLOWED_PIXELS:
                resample = getattr(Image, "Resampling", Image).LANCZOS
                return image.resize((new_w, new_h), resample=resample)

    return image


def deskew_image(gray: np.ndarray, max_skew_deg: float = 45.0, min_skew_deg: float = 0.3) -> Tuple[np.ndarray, float]:
    """
    Detect and correct document skew using OpenCV minAreaRect on binary text mask.
    Constrained to [-max_skew_deg, max_skew_deg] to avoid rotating sideways or upside-down.
    Returns (deskewed_gray_array, detected_angle_degrees).
    """
    # Invert so text is foreground (non-zero)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 50:
        return gray, 0.0

    # Points in (x, y) format
    pts = np.column_stack((coords[:, 1], coords[:, 0]))
    rect = cv2.minAreaRect(pts)
    box_angle = rect[-1]
    w, h = rect[1]

    # In OpenCV, angle normalization depends on width/height ratio
    if w < h:
        box_angle = box_angle - 90.0 if box_angle > 0 else box_angle + 90.0

    # Filter out near-zero or extreme angles
    if abs(box_angle) < min_skew_deg or abs(box_angle) > max_skew_deg:
        return gray, 0.0

    # Rotate around center, padding border with white (255)
    img_h, img_w = gray.shape[:2]
    center = (img_w / 2.0, img_h / 2.0)
    rot_matrix = cv2.getRotationMatrix2D(center, box_angle, 1.0)
    deskewed = cv2.warpAffine(
        gray, rot_matrix, (img_w, img_h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=255
    )
    return deskewed, float(box_angle)


def denoise_image(gray: np.ndarray, ksize: int = 3) -> np.ndarray:
    """
    Denoise grayscale image using median blur.
    Effectively removes scanner salt-and-pepper artifacts while preserving Bengali diacritics.
    """
    if ksize < 3:
        return gray
    # ksize must be odd
    if ksize % 2 == 0:
        ksize += 1
    return cv2.medianBlur(gray, ksize)


def binarize_image(gray: np.ndarray) -> np.ndarray:
    """
    Binarize grayscale image using Otsu's thresholding.
    Produces high-contrast black text on white background (255).
    """
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    return binary


def preprocess_image_for_ocr(image: Image.Image,
                             apply_deskew: bool = True,
                             apply_denoise: bool = True,
                             apply_binarize: bool = True) -> Tuple[Image.Image, Dict[str, Any]]:
    """
    End-to-end preprocessing pipeline for Tesseract OCR.
    1. Scale to ~300 DPI equivalent if needed.
    2. Convert to grayscale.
    3. Deskew.
    4. Denoise.
    5. Binarize (Otsu).
    Returns (processed_PIL_image, metadata_dict).
    """
    orig_size = image.size

    # Step 1: Ensure resolution
    img_scaled = ensure_300_dpi(image)
    scaled_size = img_scaled.size

    # Step 2: Grayscale numpy array
    if img_scaled.mode != "L":
        gray_pil = img_scaled.convert("L")
    else:
        gray_pil = img_scaled
    gray = np.array(gray_pil)

    detected_angle = 0.0
    # Step 3: Deskew
    if apply_deskew:
        gray, detected_angle = deskew_image(gray)

    # Step 4: Denoise
    if apply_denoise:
        gray = denoise_image(gray, ksize=3)

    # Step 5: Binarize
    if apply_binarize:
        binary = binarize_image(gray)
    else:
        binary = gray

    processed_pil = Image.fromarray(binary)
    metadata = {
        "original_size": orig_size,
        "scaled_size": scaled_size,
        "deskew_angle": detected_angle,
        "binarized": apply_binarize,
        "denoised": apply_denoise,
        "target_dpi": TARGET_DPI
    }
    return processed_pil, metadata

