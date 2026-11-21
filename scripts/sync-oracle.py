#!/usr/bin/env python3
"""Download the 56 PUBLIC oracle card images into this repository.
This script never reads any personal data or modifies GrizzlyJohn.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
import json
import time

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "oracle"
NAMES = json.loads((DEST / "cards.json").read_text(encoding="utf-8"))
SOURCE = "https://raw.githubusercontent.com/parkerpixie/GrizzlyJohn/main/"
errors = []
for i, name in enumerate(NAMES, 1):
    output = DEST / name
    if output.exists() and output.stat().st_size > 1000:
        print(f"{i}/{len(NAMES)} exists: {name}")
        continue
    try:
        request = Request(SOURCE + quote(name), headers={"User-Agent":"A-Little-Squirrelly-Oracle-Importer"})
        with urlopen(request, timeout=45) as response:
            payload = response.read()
        if not payload.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError("Source did not return a PNG")
        output.write_bytes(payload)
        print(f"{i}/{len(NAMES)} copied {name}")
    except Exception as exc:
        errors.append(f"{name}: {exc}")
    time.sleep(0.1)

if errors:
    print("\n".join(errors))
    raise SystemExit(f"{len(errors)} oracle images still missing")
(ROOT/"oracle-config.js").write_text("window.ALS_LOCAL_ORACLE = true;\n", encoding="utf-8")
print("All 56 animal cards are now locally bundled.")
