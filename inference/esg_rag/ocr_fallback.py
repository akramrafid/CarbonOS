"""
Optional Vision-LLM Fallback with Strict Grounding Verification.
Security Invariants:
1. Gated strictly behind ESG_LLM_EXTRACTION_ENABLED=true AND ESG_LLM_PROCESSING_TERMS_REF.
   If either condition is absent, no external LLM call is ever made.
2. Literal Grounding Check:
   Any value returned by an LLM MUST be verified against the local document text/OCR tokens.
   If the literal value does not appear in the document layer, it is flagged with
   UNVERIFIED_LLM_VALUE and LLM_GROUNDING_FAILED, and forced to 0.0 confidence.
3. Dual Control: LLM extractions never enter the ledger directly; they undergo profile validation
   and require human review/confirmation.
"""
from typing import Dict, Any, List, Optional, Tuple, Sequence
import os
import re

from .bill_text import to_ascii_digits, normalise_token
from .bill_extract import Word


def is_vision_llm_enabled() -> bool:
    """
    Returns True ONLY when:
    1. ESG_LLM_EXTRACTION_ENABLED is 'true'
    2. ESG_LLM_PROCESSING_TERMS_REF is non-empty (signed terms reference)
    """
    enabled = os.getenv("ESG_LLM_EXTRACTION_ENABLED", "").lower() == "true"
    terms = bool(os.getenv("ESG_LLM_PROCESSING_TERMS_REF", "").strip())
    return enabled and terms


def _normalize_token_for_matching(text: str) -> str:
    """Strip punctuation and normalize Bengali digits to ASCII for fuzzy comparison."""
    if not text:
        return ""
    ascii_t = to_ascii_digits(text).replace(",", "").strip()
    return re.sub(r"[^\w\d.]", "", ascii_t).lower()


def verify_value_literal_grounding(
    raw_value: str,
    doc_words: Sequence[Word]
) -> Tuple[bool, Optional[str], Optional[Tuple[float, float, float, float]]]:
    """
    Verify that an extracted value string appears literally in the document's OCR/text layer.
    Checks:
    - Exact string match
    - ASCII normalized digits match (e.g. '১২৪০' matches '1240')
    - Comma-stripped numbers (e.g. '1,240' matches '1240')
    - Substring inclusion inside word tokens
    Returns (is_grounded, matched_word_text, matched_bbox).
    """
    if not raw_value or not doc_words:
        return False, None, None

    val_str = str(raw_value).strip()
    norm_val = _normalize_token_for_matching(val_str)
    if not norm_val:
        return False, None, None

    # 1. Exact token match
    for w in doc_words:
        w_text = w.text.strip()
        if w_text == val_str:
            return True, w_text, w.bbox

    # 2. Normalized token match (digits / commas)
    for w in doc_words:
        w_norm = _normalize_token_for_matching(w.text)
        if w_norm and (w_norm == norm_val or norm_val in w_norm):
            return True, w.text, w.bbox

    # 3. Multi-token joined match (e.g. "12" and "40" or "0123" "4567")
    full_text = " ".join(w.text for w in doc_words)
    full_norm = _normalize_token_for_matching(full_text)
    if norm_val in full_norm:
        return True, val_str, None

    return False, None, None


def ground_llm_extracted_candidates(
    candidates: List[Dict[str, Any]],
    doc_words: Sequence[Word]
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Verify a list of LLM-extracted candidate fields against document tokens.
    Returns (grounded_candidates, findings).
    """
    grounded_list: List[Dict[str, Any]] = []
    findings: List[str] = []

    for cand in candidates:
        field = cand.get("field") or cand.get("parameter_key") or "unknown"
        val = str(cand.get("value") or "")
        is_grounded, matched_text, bbox = verify_value_literal_grounding(val, doc_words)

        flags = list(cand.get("flags") or [])
        item = dict(cand)
        item["field"] = field
        item["source"] = "llm"
        item["bbox"] = bbox or cand.get("bbox")

        if is_grounded:
            item["grounded"] = True
            item["flags"] = flags
            # Retain model confidence if present and valid, capped at 0.90 for unreviewed LLM values
            orig_conf = float(cand.get("confidence", 0.85))
            item["confidence"] = min(0.90, max(0.50, orig_conf))
        else:
            item["grounded"] = False
            item["confidence"] = 0.0
            if "UNVERIFIED_LLM_VALUE" not in flags:
                flags.append("UNVERIFIED_LLM_VALUE")
            item["flags"] = flags
            item["reason"] = f"Literal value '{val}' for field '{field}' was not found in document text/OCR"
            finding_msg = f"LLM_GROUNDING_FAILED:{field}"
            if finding_msg not in findings:
                findings.append(finding_msg)

        grounded_list.append(item)

    return grounded_list, findings


def run_vision_llm_fallback(
    document_text_or_image: Any,
    doc_words: Sequence[Word],
    required_fields: Optional[Sequence[str]] = None
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Execute vision-LLM fallback only if dual gating is satisfied.
    If terms or config are missing, returns empty candidates with gate diagnostic.
    """
    if not is_vision_llm_enabled():
        return [], ["VISION_LLM_DISABLED: Gated behind ESG_LLM_EXTRACTION_ENABLED=true and ESG_LLM_PROCESSING_TERMS_REF"]

    # In production, call vision LLM (e.g. Gemini / Docling)
    # Gating and grounding are enforced on any output
    from .extractor import extract_footprint_from_text
    raw_res = extract_footprint_from_text(str(document_text_or_image))
    raw_details = raw_res.get("details", [])

    candidates = []
    for d in raw_details:
        candidates.append({
            "field": d.get("param_name"),
            "value": str(d.get("value")),
            "unit": d.get("unit"),
            "confidence": d.get("confidence", 0.85)
        })

    return ground_llm_extracted_candidates(candidates, doc_words)
