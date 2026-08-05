#!/usr/bin/env python3
"""
Genera data/newsletter.json a partir de los archivos de la carpeta newsletter/.

Cada edición es una imagen o un PDF (lo que exporte Canva). El nombre del
archivo define la fecha y, opcionalmente, el título:

    AAAA-MM-DD__Titulo-de-la-edicion.png
    AAAA-MM-DD.png                       (sin título: solo se muestra la fecha)

El mes y el día pueden llevar o no el cero adelante (2026-8-1 y 2026-08-01
son equivalentes).

Ejemplos válidos:
    2026-08-01__Primera-edicion.png
    2026-8-1__Primera-edicion.png
    2026-09-15__Tintes naturales.pdf
    2026-09-15.pdf

Los PDF se convierten a imagen (todas las páginas) dentro de newsletter/rendered/,
porque los navegadores de celular no muestran PDFs embebidos de forma confiable.
La edición se publica como todas las páginas, una debajo de la otra. Esa carpeta
la maneja este script: no hace falta tocarla a mano.

Uso:
  python3 build_newsletter.py
"""

from __future__ import annotations

import datetime
import hashlib
import json
import re
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).parent
NEWSLETTER_DIR = BASE_DIR / "newsletter"
OUTPUT_PATH = BASE_DIR / "data" / "newsletter.json"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
PDF_EXTENSION = ".pdf"
SUPPORTED_EXTENSIONS = IMAGE_EXTENSIONS | {PDF_EXTENSION}

RENDER_DIRNAME = "rendered"
RENDER_DPI = 150
RENDER_QUALITY = 88
MAX_PDF_PAGES = 60

IGNORED_NAMES = {"readme.md", ".gitkeep", ".ds_store"}

# Acepta el mes y el día con o sin cero adelante (8 u 08, 6 o 06).
# El título (después de "__") es opcional.
NAME_PATTERN = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:__(.+))?$")


def parse_date(year: str, month: str, day: str) -> str | None:
    """Devuelve la fecha normalizada AAAA-MM-DD, o None si no es una fecha real."""
    try:
        return datetime.date(int(year), int(month), int(day)).isoformat()
    except ValueError:
        return None


def slugify(text: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text).strip("-").lower()


def render_pdf_pages(path: Path) -> list[Path] | None:
    """Convierte cada página del PDF a JPG y devuelve los archivos generados en orden.

    El nombre incluye un hash del PDF, así que si Paloma vuelve a subir una
    versión corregida con el mismo nombre, se regenera sola.
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("⚠ Falta PyMuPDF para convertir PDFs. Instalalo con: pip install pymupdf")
        return None

    digest = hashlib.sha1(path.read_bytes()).hexdigest()[:10]
    render_dir = NEWSLETTER_DIR / RENDER_DIRNAME

    with fitz.open(path) as document:
        page_count = document.page_count
        if not page_count:
            print(f"⚠ El PDF no tiene páginas: {path.name}")
            return None

        if page_count > MAX_PDF_PAGES:
            print(f"⚠ {path.name} tiene {page_count} páginas, se publican solo las primeras {MAX_PDF_PAGES}.")
            page_count = MAX_PDF_PAGES

        outputs = [
            render_dir / f"{path.stem}.{digest}.p{index + 1:02d}.jpg"
            for index in range(page_count)
        ]

        if all(output.exists() for output in outputs):
            return outputs

        render_dir.mkdir(parents=True, exist_ok=True)
        for index, output in enumerate(outputs):
            if output.exists():
                continue
            pixmap = document.load_page(index).get_pixmap(dpi=RENDER_DPI)
            pixmap.pil_save(output, format="JPEG", quality=RENDER_QUALITY, optimize=True)

    print(f"✓ PDF convertido: {path.name} → {len(outputs)} página/s en {RENDER_DIRNAME}/")
    return outputs


def prune_renders(used_names: set[str]) -> None:
    """Borra conversiones de PDFs que ya no existen o que cambiaron."""
    render_dir = NEWSLETTER_DIR / RENDER_DIRNAME
    if not render_dir.is_dir():
        return

    for path in sorted(render_dir.iterdir()):
        if path.is_file() and path.name not in used_names:
            path.unlink()
            print(f"· Conversión obsoleta eliminada: {path.name}")


def build_editions() -> list[dict]:
    if not NEWSLETTER_DIR.is_dir():
        return []

    editions = []
    used_renders: set[str] = set()

    for path in sorted(NEWSLETTER_DIR.iterdir()):
        if path.is_dir() or path.name.lower() in IGNORED_NAMES:
            continue

        suffix = path.suffix.lower()

        if suffix not in SUPPORTED_EXTENSIONS:
            print(f"⚠ Ignorado, formato no soportado ({suffix or 'sin extensión'}): {path.name}")
            continue

        match = NAME_PATTERN.match(path.stem)
        if not match:
            print(f"⚠ Ignorado, el nombre no sigue el formato AAAA-MM-DD o AAAA-MM-DD__Titulo: {path.name}")
            continue

        year, month, day, raw_title = match.groups()
        date = parse_date(year, month, day)
        if date is None:
            print(f"⚠ Ignorado, la fecha no es válida ({year}-{month}-{day}): {path.name}")
            continue

        title = re.sub(r"[-_]+", " ", raw_title).strip() if raw_title else ""
        slug = f"{date}-{slugify(title)}" if title else date

        if suffix == PDF_EXTENSION:
            rendered_pages = render_pdf_pages(path)
            if not rendered_pages:
                continue
            used_renders.update(page.name for page in rendered_pages)
            pages = [f"newsletter/{RENDER_DIRNAME}/{page.name}" for page in rendered_pages]
        else:
            pages = [f"newsletter/{path.name}"]

        editions.append({
            "slug": slug,
            "file": pages[0],
            "pages": pages,
            "title": title,
            "date": date,
        })

    prune_renders(used_renders)

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
