import subprocess
import re
import os

pattern = re.compile(r"official|withdrawn|combined margin|CDM|0\.550|0\.663|Method A|Method B|reconcil|Monte Carlo|2\.71", re.IGNORECASE)

# Get all tracked git files
res = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True)
files = res.stdout.strip().splitlines()

hits = []
for f in files:
    if not os.path.isfile(f):
        continue
    # Skip binaries / images / node_modules / virtualenv / git logs
    if f.endswith((".png", ".jpg", ".jpeg", ".ico", ".pdf", ".lock", ".log", ".jsonl")):
        continue
    try:
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            for l_num, line in enumerate(fp, 1):
                m = pattern.search(line)
                if m:
                    hits.append((f, l_num, m.group(0), line.strip()))
    except Exception as e:
        pass

out_path = "scratch/claim_removal_evidence.txt"
with open(out_path, "w", encoding="utf-8") as out:
    out.write(f"Total hits found: {len(hits)}\n")
    out.write("=" * 100 + "\n")
    for f, l_num, matched, text in hits:
        disposition = "legitimate"
        text_lower = text.lower()
        if "unverified" in text_lower or "agent-written" in text_lower or "claimed_derivation_unverified" in text_lower:
            disposition = "marked unverified"
        elif "official text" in text_lower and "not the official text" in text_lower:
            disposition = "marked unverified (summary disclaimer)"
        elif any(k in matched.lower() for k in ["method a", "method b", "monte carlo", "0.550", "0.663", "withdrawn"]) and "unverified" not in text_lower:
            # Check context
            if "cdm tool 07" in text_lower or "ck_esg_factor_no_margin_scope2" in text_lower or "grid_combined_margin" in text_lower:
                disposition = "legitimate (schema constraint / standard citation)"
            elif "uncertainty" in text_lower and "monte carlo" in text_lower and "allometry" in f:
                disposition = "legitimate (nature-based dMRV allometry)"
            else:
                disposition = "review / check"
        out.write(f"{f}:{l_num} | [{matched}] | Disposition: {disposition}\n  Context: {text[:140]}\n")

print(f"Audit complete: {len(hits)} hits recorded in {out_path}")

