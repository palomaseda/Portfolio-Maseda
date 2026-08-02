#!/usr/bin/env python3
"""
Genera data/newsletter.json a partir de los archivos de la carpeta newsletter/.

Cada edición es una imagen o un PDF (lo que exporte Canva). El nombre del
archivo define la fecha y el título, con este formato:

    AAAA-MM-DD__Titulo-de-la-edicion.png

Ejemplos válidos:
    2026-08-01__Primera-edicion.png
    2026-09-15__Tintes naturales.pdf

Los PDF se convierten a imagen (primera página) dentro de newsletter/rendered/,
porque los navegadores de celular no muestran PDFs embebidos de forma confiable.
Esa carpeta la maneja este script: no hace falta tocarla a mano.

Uso:
  python3 build_newsletter.py
"""

from __future__ import annotations

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
RENDER_DPI = 140
RENDER_QUALITY = 88

IGNORED_NAMES = {"readme.md", ".gitkeep", ".ds_store"}
NAME_PATTERN = re.compile(r"^(\d{4}-\d{2}-\d{2})__(.+)$")


def slugify(text: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text).strip("-").lower()


def render_pdf_cover(path: Path) -> Path | None:
    """Convierte la primera página del PDF a JPG y devuelve el archivo generado.

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
    output = render_dir / f"{path.stem}.{digest}.jpg"

    if output.exists():
        return output

    with fitz.open(path) as document:
        if not document.page_count:
            print(f"⚠ El PDF no tiene páginas: {path.name}")
            return None

        if document.page_count > 1:
            print(f"· {path.name} tiene {document.page_count} páginas, se publica la primera.")

        render_dir.mkdir(parents=True, exist_ok=True)
        pixmap = document.load_page(0).get_pixmap(dpi=RENDER_DPI)
        pixmap.pil_save(output, format="JPEG", quality=RENDER_QUALITY, optimize=True)

    print(f"✓ PDF convertido: {path.name} → {RENDER_DIRNAME}/{output.name}")
    return output


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
            print(f"⚠ Ignorado, el nombre no sigue el formato AAAA-MM-DD__Titulo: {path.name}")
            continue

        date, raw_title = match.groups()

        if suffix == PDF_EXTENSION:
            rendered = render_pdf_cover(path)
            if rendered is None:
                continue
            used_renders.add(rendered.name)
            file_path = f"newsletter/{RENDER_DIRNAME}/{rendered.name}"
        else:
            file_path = f"newsletter/{path.name}"

        editions.append({
            "slug": f"{date}-{slugify(raw_title)}",
            "file": file_path,
            "title": re.sub(r"[-_]+", " ", raw_title).strip(),
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
