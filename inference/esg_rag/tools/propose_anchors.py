"""
Dev-only helper: proposes candidate detection anchors and field-extraction hints
for an UNKNOWN_PROFILE utility bill.

Workflow:
1. Reads PDF text (or image OCR if PDF text is empty).
2. Runs profile detection against seed/database profiles.
3. If UNKNOWN_PROFILE, analyzes document geometry, headers, and key-value spatial
   relationships to propose:
   - detect: {all_of: [...], any_of: [...]}
   - field extraction hints: {anchor: [...], direction: right|below, take: value|rest}
4. Outputs candidate YAML block for human review and dual-control approval.
   NEVER automatically modifies production/seed profiles without human approval.
"""
import argparse
import os
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

# Add parent directory to path so imports work
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(REPO_ROOT / "inference") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "inference"))

from esg_rag import bill_extract as bx
from esg_rag import bill_profiles as bp
from esg_rag import bill_text as bt

# Common utility signatures for Bangladesh utilities
KNOWN_UTILITY_SIGNATURES = {
    "DESCO": ["dhaka electric supply company", "desco", "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি"],
    "DPDC": ["dhaka power distribution company", "dpdc", "ঢাকা পাওয়ার ডিস্ট্রিবিউশন কোম্পানি"],
    "BPDB": ["bangladesh power development board", "power development board", "bpdb", "pdb", "বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড"],
    "BREB": ["rural electrification board", "breb", "pbs", "পল্লী বিদ্যুৎ"],
    "NESCO": ["northern electricity supply company", "nesco", "নেসকো"],
    "WZPDCL": ["west zone power distribution company", "wzpdcl", "ওজোপাডিকো"],
    "TITAS": ["titas gas transmission and distribution", "titas gas", "তিতাস গ্যাস"],
    "KGDCL": ["karnaphuli gas distribution", "karnaphuli gas", "কর্ণফুলী গ্যাস"],
    "JGTDSL": ["jalalabad gas transmission and distribution", "jalalabad gas", "জালালাবাদ গ্যাস"],
    "BGDCL": ["bakhrabad gas distribution", "bakhrabad gas", "বাখরাবাদ গ্যাস"],
    "PGCL": ["paschimanchal gas company", "pgcl", "পশ্চিমাঞ্চল গ্যাস"],
    "SGCL": ["sundarban gas company", "sgcl", "সুন্দরবন গ্যাস"],
}

# Common field keywords (English and Bengali) to probe for spatial hint discovery
FIELD_PROBES = {
    "account.number": [
        "account no", "account number", "consumer no", "consumer number", "cust no", "customer no",
        "গ্রাহক নং", "হিসাব নং", "কনজিউমার নং"
    ],
    "bill.number": [
        "bill no", "bill number", "invoice no", "invoice number", "বিল নং", "ইনভয়েস নং"
    ],
    "period.start": [
        "from date", "period from", "billing from", "start date", "শুরু"
    ],
    "period.end": [
        "to date", "period to", "billing to", "end date", "শেষ"
    ],
    "energy.kwh.total": [
        "total kwh", "total units", "consumed units", "energy charge", "মোট ইউনিট", "ব্যবহৃত ইউনিট",
        "net units", "consumption (kwh)"
    ],
    "meter.serial": [
        "meter no", "meter serial", "meter number", "মিটার নং", "মিটার নম্বর"
    ],
    "meter.multiplier": [
        "multiplying factor", "multiplier", "mf", "গুণক", "মিটার গুণক"
    ],
    "demand.kw.sanctioned": [
        "sanctioned load", "sanctioned demand", "মঞ্জুরিকৃত লোড", "লোড"
    ],
    "tariff.category": [
        "tariff", "tariff category", "tariff rate", "ট্যারিফ", "শ্রেণী"
    ],
    "cost.total": [
        "total amount", "net payable", "total bill", "current bill", "মোট টাকা", "সর্বমোট", "টাকা"
    ]
}


def load_seed_profiles() -> List[Tuple[str, dict]]:
    """Loads all profiles via bp.repo_profiles()."""
    try:
        return [(p["profile_key"], p) for p in bp.repo_profiles()]
    except Exception as e:
        print(f"Warning: could not load repo profiles: {e}", file=sys.stderr)
        return []


def propose_anchors_for_document(doc: bx.Document) -> dict:
    """Analyzes a Document and returns candidate detection anchors and field hints."""
    lines = bx._lines(doc)
    if not lines:
        return {"error": "Document contains no readable text or words."}

    # Analyze header lines (first 15 lines of page 1) for utility signatures
    page1_lines = [l for l in lines if l.page == 1][:15]
    all_text_p1 = " ".join(l.text for l in page1_lines).lower()

    detected_issuer = None
    matched_phrases = []
    for issuer, signatures in KNOWN_UTILITY_SIGNATURES.items():
        for sig in signatures:
            if sig in all_text_p1:
                detected_issuer = issuer
                matched_phrases.append(sig)
                break
        if detected_issuer:
            break

    # Propose all_of / any_of anchors
    all_of_candidates = []
    any_of_candidates = []

    if detected_issuer and matched_phrases:
        # Use exact string from the line where the phrase appeared
        for l in page1_lines:
            if matched_phrases[0] in l.text.lower():
                all_of_candidates.append(l.text.strip())
                break
    else:
        if page1_lines:
            all_of_candidates.append(page1_lines[0].text.strip())

    # Check for HT vs LT clues
    doc_type = "electricity_lt"
    if any("ht" in l.tokens or "high tension" in l.text.lower() for l in page1_lines):
        doc_type = "electricity_ht"
        any_of_candidates.extend(["HT", "High Tension"])
    elif any("lt" in l.tokens or "low tension" in l.text.lower() for l in page1_lines):
        doc_type = "electricity_lt"
        any_of_candidates.extend(["LT", "Low Tension"])

    # Spatial hint analysis for parameters
    proposed_hints = []
    for key, probe_labels in FIELD_PROBES.items():
        found_hint = None
        for line in lines:
            line_text_lower = line.text.lower()
            for probe in probe_labels:
                if probe in line_text_lower:
                    idx = bx._find(line.tokens, probe)
                    if idx is not None:
                        after_words = line.words[idx[1]:]
                        if after_words:
                            found_hint = {
                                "key": key,
                                "anchor": [" ".join(w.text for w in line.words[idx[0]:idx[1]])],
                                "direction": "right",
                                "take": "value" if "name" not in key and "tariff" not in key else "rest"
                            }
                            break
            if found_hint:
                break
        if found_hint:
            proposed_hints.append(found_hint)

    proposal = {
        "profile_key": f"{detected_issuer.lower() if detected_issuer else 'unknown'}-{doc_type.replace('_', '-')}-proposed",
        "issuer": detected_issuer or "UNKNOWN_ISSUER",
        "document_type": doc_type,
        "layout_version": "v1",
        "languages": ["en", "bn"],
        "detect": {
            "all_of": all_of_candidates,
            "any_of": any_of_candidates
        },
        "proposed_hints": proposed_hints
    }
    return proposal


def main():
    parser = argparse.ArgumentParser(description="Propose detection anchors for unknown utility bills.")
    parser.add_argument("file", help="Path to PDF or image utility bill")
    parser.add_argument("--json", action="store_true", help="Output raw JSON instead of YAML")
    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading document: {file_path} ...", file=sys.stderr)
    try:
        if file_path.suffix.lower() == ".pdf":
            doc = bx.document_from_pdf(str(file_path))
        else:
            doc = bx.document_from_image(str(file_path))
    except Exception as e:
        print(f"Error opening document: {e}", file=sys.stderr)
        sys.exit(1)

    # Check against existing profiles
    profiles = load_seed_profiles()
    match_status, matched_ids = bx.detect(doc, profiles)
    print(f"Detection Status: {match_status} (matches: {matched_ids})", file=sys.stderr)

    if match_status == "MATCHED":
        print(f"Document already matches profile: {matched_ids[0]}", file=sys.stderr)

    proposal = propose_anchors_for_document(doc)
    print("\n--- Proposed Candidate Profile Configuration (Human Review Required) ---\n")
    print(yaml.dump(proposal, sort_keys=False, allow_unicode=True))


if __name__ == "__main__":
    main()
