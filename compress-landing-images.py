"""Comprime imagenes WebP de landing-1 (sobrescribe con backup en assets/_originales/)."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent / "assets"
BACKUP = ASSETS / "_originales"
FILES = [
    "card-pg-1.webp",
    "card-pg-2.webp",
    "card-pg-3.webp",
    "01-MAS-TRANQUILIDAD.webp",
    "02-PERRO-EQUILIBRADO.webp",
    "03-ENTIENDE-A-TU PERRO.webp",
    "testimonio-1.webp",
    "testimonio-2.webp",
    "testimonio-3.webp",
    "testimonio-4.webp",
    "testimonio-5.webp",
    "testimonio-6.webp",
    "testimonio-7.webp",
    "card-acceso-1.webp",
    "card-acceso-2.webp",
    "card-acceso-3.webp",
    "card-acceso-4.webp",
]

MAX_WIDTH = {
    "card-pg": 960,
    "01-MAS": 960,
    "02-PERRO": 960,
    "03-ENTIENDE": 960,
    "testimonio": 720,
    "card-acceso": 640,
}


def max_w(name: str) -> int:
    for key, width in MAX_WIDTH.items():
        if name.startswith(key):
            return width
    return 960


def fmt_kb(n: int) -> str:
    return f"{n / 1024:.0f} KB"


def main() -> None:
    BACKUP.mkdir(parents=True, exist_ok=True)
    total_before = 0
    total_after = 0

    for name in FILES:
        src = ASSETS / name
        if not src.exists():
            print(f"SKIP (no existe): {name}")
            continue

        before = src.stat().st_size
        total_before += before

        backup = BACKUP / name
        if not backup.exists():
            shutil.copy2(src, backup)

        with Image.open(src) as im:
            im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
            if im.mode == "RGBA":
                im = im.convert("RGB")
            w, h = im.size
            limit = max_w(name)
            if w > limit:
                nh = round(h * (limit / w))
                im = im.resize((limit, nh), Image.Resampling.LANCZOS)

            im.save(src, "WEBP", quality=78, method=6)

        after = src.stat().st_size
        total_after += after
        pct = (1 - after / before) * 100 if before else 0
        print(f"{name}: {fmt_kb(before)} -> {fmt_kb(after)} (-{pct:.0f}%)")

    print(f"\nTotal: {fmt_kb(total_before)} -> {fmt_kb(total_after)}")
    print(f"Backup en: {BACKUP}")


if __name__ == "__main__":
    main()
