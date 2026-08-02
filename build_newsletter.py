#!/usr/bin/env python3
"""
Genera data/newsletter.json a partir de los archivos de la carpeta newsletter/.

Cada edición es una imagen (la exportada desde Canva). El nombre del archivo
define la fecha y el título, con este formato:

    AAAA-MM-DD__Titulo-de-la-edicion.png

Ejemplos válidos:
    2026-08-01__Primera-edicion.png
    2026-09-15__Tintes naturales.jpg

Uso:
  python3 build_newsletter.py
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).parent
NEWSLETTER_DIR = BASE_DIR / "newsletter"
OUTPUT_PATH = BASE_DIR / "data" / "newsletter.json"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
NAME_PATTERN = re.compile(r"^(\d{4}-\d{2}-\d{2})__(.+)$")


def slugify(text: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text).strip("-").lower()


def build_editions() -> list[dict]:
    if not NEWSLETTER_DIR.is_dir():
        return []

    editions = []

    for path in sorted(NEWSLETTER_DIR.iterdir()):
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue

        match = NAME_PATTERN.match(path.stem)
        if not match:
            print(f"⚠ Ignorado, el nombre no sigue el formato AAAA-MM-DD__Titulo: {path.name}")
            continue

        date, raw_title = match.groups()

        editions.append({
            "slug": f"{date}-{slugify(raw_title)}",
            "file": f"newsletter/{path.name}",
            "title": re.sub(r"[-_]+", " ", raw_title).strip(),
            "date": date,
        })

    editions.sort(key=lambda edition: (edition["date"], edition["slug"]), reverse=True)
    return editions


def main():
    editions = build_editions()

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps({"editions": editions}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"✓ newsletter.json actualizado con {len(editions)} edición/es")


if __name__ == "__main__":
    main()
