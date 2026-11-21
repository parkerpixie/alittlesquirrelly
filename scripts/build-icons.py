#!/usr/bin/env python3
"""Create installable PNG icons from the approved squirrel image embedded in brand-icon.svg."""
from io import BytesIO
from pathlib import Path
import base64
import re
from PIL import Image

root = Path(__file__).resolve().parents[1]
svg = (root/"assets"/"brand-icon.svg").read_text(encoding="utf-8")
match = re.search(r'data:image/webp;base64,([A-Za-z0-9+/=]+)',svg)
if not match:
    raise SystemExit("No embedded illustrated squirrel artwork in brand-icon.svg")
source = Image.open(BytesIO(base64.b64decode(match.group(1)))).convert("RGB")
icons=root/"assets"/"icons"
icons.mkdir(parents=True,exist_ok=True)
for size in (192,512):
    source.resize((size,size),Image.Resampling.LANCZOS).save(icons/f"icon-{size}.png",optimize=True)
source.resize((180,180),Image.Resampling.LANCZOS).save(root/"apple-touch-icon.png",optimize=True)
print("Generated iOS and PWA icons from the illustrated squirrel.")
