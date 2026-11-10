"""
Structure-aware document chunker for CarbonOS ESG Knowledge Base.
Replaces naive character-window chunking.
Key features:
- Respects section headings (#, ##, ###) and semantic boundaries.
- Preserves markdown tables and emission factor rows intact without splitting.
- Enriches every chunk with structured metadata:
  publisher, year, version, scope, gas, fuel, region, language, page, section, license.
"""
import re
from typing import List, Dict, Any, Optional

TABLE_ROW_REGEX = re.compile(r"^\s*\|.*\|\s*$")
HEADING_REGEX = re.compile(r"^(#{1,6})\s+(.+)$")
BENGALI_REGEX = re.compile(r"[\u0980-\u09FF]")

FUEL_PATTERNS = {
    "natural_gas": [r"\bnatural gas\b", r"\bgas\b", r"\bmmscf\b", r"\bcft\b", r"\bpetrobangla\b"],
    "diesel": [r"\bdiesel\b", r"\bhsd\b", r"\bhigh speed diesel\b"],
    "petrol": [r"\bpetrol\b", r"\boctane\b", r"\bmotor gasoline\b"],
    "heavy_fuel_oil": [r"\bhfo\b", r"\bfuel oil\b", r"\bresidual fuel oil\b"],
    "coal": [r"\bcoal\b", r"\bsub-bituminous\b", r"\bbituminous\b", r"\bbarapukuria\b"],
    "electricity": [r"\belectricity\b", r"\bgrid\b", r"\bkwh\b", r"\bmwh\b", r"\bpowe\b", r"\bbpdb\b", r"\bdesco\b", r"\bdpdc\b"],
    "lpg": [r"\blpg\b", r"\bliquefied petroleum gas\b", r"\bpropane\b", r"\bbutane\b"],
}

SCOPE_PATTERNS = {
    "scope1": [r"\bscope\s*1\b", r"\bdirect emissions\b", r"\bstationary combustion\b", r"\bmobile combustion\b", r"\bfugitive\b"],
    "scope2": [r"\bscope\s*2\b", r"\blocation-based\b", r"\bmarket-based\b", r"\bpurchased electricity\b", r"\bgrid average\b"],
    "scope3": [r"\bscope\s*3\b", r"\bvalue chain\b", r"\bupstream\b", r"\bdownstream\b", r"\bcommute\b", r"\bfreight\b", r"\bcategory\s*\d+\b"],
}

GAS_PATTERNS = {
    "CO2": [r"\bco2\b", r"\bcarbon dioxide\b"],
    "CH4": [r"\bch4\b", r"\bmethane\b"],
    "N2O": [r"\bn2o\b", r"\bnitrous oxide\b"],
    "HFC": [r"\bhfc\b", r"\br-?134a\b", r"\br-?410a\b", r"\br-?32\b", r"\brefrigerant\b"],
}


def detect_language(text: str) -> str:
    """Detect if text contains Bengali characters."""
    return "bn" if BENGALI_REGEX.search(text) else "en"


def detect_scope(text: str) -> Optional[str]:
    lower = text.lower()
    for scope, patterns in SCOPE_PATTERNS.items():
        if any(re.search(p, lower) for p in patterns):
            return scope
    return None


def detect_fuel(text: str) -> Optional[str]:
    lower = text.lower()
    for fuel, patterns in FUEL_PATTERNS.items():
        if any(re.search(p, lower) for p in patterns):
            return fuel
    return None


def detect_gas(text: str) -> Optional[str]:
    lower = text.lower()
    for gas, patterns in GAS_PATTERNS.items():
        if any(re.search(p, lower) for p in patterns):
            return gas
    return None


def parse_structural_blocks(text: str) -> List[Dict[str, Any]]:
    """
    Parses document into structural blocks:
    - Headings
    - Tables (grouped as atomic table blocks)
    - Code blocks
    - Paragraphs
    """
    lines = text.splitlines()
    blocks = []
    current_table = []
    current_code = []
    current_para = []
    current_heading = "General"
    in_code_block = False

    def flush_para():
        nonlocal current_para
        if current_para:
            content = "\n".join(current_para).strip()
            if content:
                blocks.append({
                    "type": "paragraph",
                    "section": current_heading,
                    "content": content
                })
            current_para = []

    def flush_table():
        nonlocal current_table
        if current_table:
            content = "\n".join(current_table).strip()
            if content:
                blocks.append({
                    "type": "table",
                    "section": current_heading,
                    "content": content
                })
            current_table = []

    def flush_code():
        nonlocal current_code
        if current_code:
            content = "\n".join(current_code).strip()
            if content:
                blocks.append({
                    "type": "code",
                    "section": current_heading,
                    "content": content
                })
            current_code = []

    for line in lines:
        stripped = line.strip()

        # Code block fence
        if stripped.startswith("```"):
            if in_code_block:
                current_code.append(line)
                flush_code()
                in_code_block = False
            else:
                flush_para()
                flush_table()
                in_code_block = True
                current_code.append(line)
            continue

        if in_code_block:
            current_code.append(line)
            continue

        # Heading
        m = HEADING_REGEX.match(stripped)
        if m:
            flush_para()
            flush_table()
            current_heading = m.group(2).strip()
            blocks.append({
                "type": "heading",
                "level": len(m.group(1)),
                "section": current_heading,
                "content": stripped
            })
            continue

        # Table row
        if TABLE_ROW_REGEX.match(stripped):
            flush_para()
            current_table.append(line)
            continue
        elif current_table:
            flush_table()

        # Regular text or empty line
        if not stripped:
            flush_para()
        else:
            current_para.append(line)

    flush_para()
    flush_table()
    flush_code()
    return blocks


def structure_aware_chunk(
    text: str,
    filename: str,
    doc_metadata: Optional[Dict[str, Any]] = None,
    max_chunk_chars: int = 1000,
    overlap_chars: int = 150
) -> List[Dict[str, Any]]:
    """
    Converts text into structure-aware chunks.
    Ensures tables and factor rows are never cut in half.
    Enriches with publisher, year, version, scope, gas, fuel, region, language, page, section, license.
    """
    meta = doc_metadata or {}
    publisher = meta.get("publisher", "CarbonOS Reference Corpus")
    year = meta.get("year", 2026)
    version = meta.get("version", "v1.0")
    region = meta.get("region", "BD-NATIONAL")
    license_info = meta.get("license", "Open Data / Public Domain / Educational")
    doc_scope = meta.get("scope")

    blocks = parse_structural_blocks(text)
    chunks = []
    chunk_idx = 0
    current_section = "Introduction"

    current_chunk_text = ""
    current_chunk_section = current_section
    current_chunk_blocks = []

    def save_chunk(content: str, section: str):
        nonlocal chunk_idx
        content = content.strip()
        if not content:
            return

        scope = doc_scope or detect_scope(content) or detect_scope(section)
        fuel = detect_fuel(content) or detect_fuel(section)
        gas = detect_gas(content) or detect_gas(section)
        lang = detect_language(content)

        chunks.append({
            "chunk_index": chunk_idx,
            "content": content,
            "filename": filename,
            "publisher": publisher,
            "year": int(year) if str(year).isdigit() else year,
            "version": str(version),
            "scope": scope or "cross-scope",
            "gas": gas or "GHG-CO2e",
            "fuel": fuel or "general",
            "region": region,
            "language": lang,
            "page": meta.get("page", 1),
            "section": section,
            "license": license_info,
            "token_count": len(content.split())
        })
        chunk_idx += 1

    for b in blocks:
        b_type = b["type"]
        b_section = b["section"]
        b_content = b["content"]

        if b_type == "heading":
            current_section = b_section
            if current_chunk_text and len(current_chunk_text) >= (max_chunk_chars // 2):
                save_chunk(current_chunk_text, current_chunk_section)
                current_chunk_text = ""
                current_chunk_section = current_section
            continue

        # If it's a table, keep it completely intact
        if b_type == "table":
            if current_chunk_text and (len(current_chunk_text) + len(b_content)) > max_chunk_chars:
                save_chunk(current_chunk_text, current_chunk_section)
                current_chunk_text = ""
            table_with_heading = f"### {current_section}\n{b_content}"
            save_chunk(table_with_heading, current_section)
            continue

        # Paragraph or code block
        if not current_chunk_text:
            current_chunk_text = f"### {current_section}\n{b_content}"
            current_chunk_section = current_section
        elif len(current_chunk_text) + len(b_content) <= max_chunk_chars:
            current_chunk_text += "\n\n" + b_content
        else:
            save_chunk(current_chunk_text, current_chunk_section)
            current_chunk_text = f"### {current_section}\n{b_content}"
            current_chunk_section = current_section

    if current_chunk_text:
        save_chunk(current_chunk_text, current_chunk_section)

    return chunks

