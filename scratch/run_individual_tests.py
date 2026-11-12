import subprocess
import sys
import time
from pathlib import Path
import json

tests_dir = Path("tests")
test_files = sorted([f.stem for f in tests_dir.glob("test_*.py")])

results = {}
total_passed = 0
total_failed = 0

print(f"Running {len(test_files)} test modules individually...")

for mod in test_files:
    start = time.time()
    cmd = [sys.executable, "-m", "unittest", f"tests.{mod}"]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    elapsed = time.time() - start
    
    status = "PASS" if proc.returncode == 0 else "FAIL"
    if status == "PASS":
        total_passed += 1
    else:
        total_failed += 1
        
    # Check for skips
    skipped_count = proc.stderr.count(" ... skipped ")
    failures_count = proc.stderr.count("FAIL: ") + proc.stderr.count("ERROR: ")
    
    results[mod] = {
        "status": status,
        "returncode": proc.returncode,
        "elapsed_sec": round(elapsed, 2),
        "skipped": skipped_count,
        "failures": failures_count,
        "stderr_tail": proc.stderr.splitlines()[-3:] if proc.stderr else []
    }
    print(f"[{status}] {mod} ({elapsed:.1f}s, returncode={proc.returncode})")

output_path = Path("scratch/individual_tests_summary.json")
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps({
    "total_modules": len(test_files),
    "passed_modules": total_passed,
    "failed_modules": total_failed,
    "modules": results
}, indent=2), encoding="utf-8")

print(f"\nSummary: {total_passed}/{len(test_files)} modules passed, {total_failed} failed.")

