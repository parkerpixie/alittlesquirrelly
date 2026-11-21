#!/usr/bin/env python3
"""Generate iPhone/Android icons from the uploaded A Little Squirrelly app-icon PNG."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = Image.open(root / "assets" / "graphics" / "app-icon-1024.png").convert("RGBA")
icons = root / "assets" / "icons"
icons.mkdir(parents=True, exist_ok=True)

def make_icon(size: int, scale: float, target: Path):
    # A warm opaque tile ensures the transparent squirrel stays visible as a phone icon.
    canvas = Image.new("RGBA", (size, size), "#f4e5e0")
    art = ImageOps.contain(source, (int(size * scale), int(size * scale)), Image.Resampling.LANCZOS)
    x = (size - art.width) // 2
    y = (size - art.height) // 2
    canvas.alpha_composite(art, (x, y))
    canvas.convert("RGB").save(target, "PNG", optimize=True)

make_icon(192, 0.9, icons / "icon-192.png")
make_icon(512, 0.78, icons / "icon-512.png")  # keep maskable-safe margins
make_icon(180, 0.9, root / "apple-touch-icon.png")
print("Generated iOS and Android icons from the uploaded app-icon-1024.png.")
