#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║   Actualizador de galerías — Paloma Maseda          ║
╠══════════════════════════════════════════════════════╣
║  Ejecutar con:  python3 update_galleries.py          ║
║                                                      ║
║  Qué hace:                                           ║
║   • Escanea img/proyectos/*/                         ║
║   • Detecta todas las fotos (cover.jpg + NN.jpg)     ║
║   • Genera data-gallery automático en index.html     ║
║   • Soporta hasta 99 fotos por proyecto              ║
╚══════════════════════════════════════════════════════╝
"""

import re
from pathlib import Path

BASE = Path(__file__).parent

PROJECTS_DIR = BASE / "img" / "proyectos"


def get_images_for_project(project_name: str) -> list:
    """
    Obtiene todas las imágenes de una carpeta de proyecto,
    ordenadas: cover.jpg primero, luego 01.jpg, 02.jpg, etc.
    """
    folder = PROJECTS_DIR / project_name
    if not folder.exists():
        return []

    images = []

    # Cover primero
    cover = folder / "cover.jpg"
    if cover.exists():
        images.append("cover.jpg")

    # Luego numeradas, sin cortar si quedó un hueco entre archivos.
    numbered_images = []
    for file in folder.iterdir():
        if not file.is_file() or file.suffix.lower() != ".jpg":
            continue

        stem = file.stem
        if len(stem) == 2 and stem.isdigit():
            numbered_images.append((int(stem), file.name))

    numbered_images.sort(key=lambda item: item[0])
    images.extend(filename for _, filename in numbered_images)

    return images


def generate_gallery_string(project_name: str) -> str:
    """Genera el string data-gallery para un proyecto."""
    images = get_images_for_project(project_name)
    if not images:
        return ""
    paths = [f"img/proyectos/{project_name}/{img}" for img in images]
    return "|".join(paths)


def update_html():
    """Actualiza los data-gallery de cada proyecto en index.html.

    Cada carpeta de img/proyectos/ corresponde a la sección con el mismo
    data-slug; si la carpeta está vacía, la galería queda vacía.
    """
    html_path = BASE / "index.html"
    html = html_path.read_text(encoding="utf-8")

    for folder in sorted(path for path in PROJECTS_DIR.iterdir() if path.is_dir()):
        project_name = folder.name
        article = re.search(
            rf'<article[^>]*data-slug="{re.escape(project_name)}".*?</article>', html, re.S
        )
        if not article:
            print(f"  ⚠️  [{project_name}] — no hay sección con ese data-slug en index.html")
            continue

        gallery = generate_gallery_string(project_name)
        block = re.sub(r'data-gallery="[^"]*"', f'data-gallery="{gallery}"', article.group(0))
        html = html[:article.start()] + block + html[article.end():]

        count = len(get_images_for_project(project_name))
        print(f"  ✓ [{project_name}] → {count} fotos" if count else f"  · [{project_name}] — todavía sin fotos")

    html_path.write_text(html, encoding="utf-8")


def main():
    print()
    print("══════════════════════════════════════════════")
    print("  Actualizador de galerías                    ")
    print("══════════════════════════════════════════════")
    print()

    update_html()

    print()
    print("✅  index.html actualizado. Recargá el navegador.")
    print()


if __name__ == "__main__":
    main()
