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

# Carpetas de proyectos
PROJECTS = {
    "celulosa": "Celulosa Bacteriana",
    "cafe": "Borra de Café",
    "tintes": "Tintes Naturales",
    "segunda-piel": "La indumentaria como segunda piel",
}


def get_images_for_project(project_name: str) -> list:
    """
    Obtiene todas las imágenes de una carpeta de proyecto,
    ordenadas: cover.jpg primero, luego 01.jpg, 02.jpg, etc.
    """
    folder = BASE / "img" / "proyectos" / project_name
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
    """Actualiza index.html con los data-gallery correctos."""
    html_path = BASE / "index.html"
    html = html_path.read_text(encoding="utf-8")

    for project_name in PROJECTS.keys():
        gallery = generate_gallery_string(project_name)
        if not gallery:
            print(f"  ⚠️  [{project_name}] — sin imágenes")
            continue

        # Encontrar y reemplazar los data-gallery de este proyecto
        # Busca los atributos data-gallery dentro del proyecto
        pattern = f'data-gallery="img/proyectos/{project_name}/[^"]*"'
        replacement = f'data-gallery="{gallery}"'

        matches = re.findall(pattern, html)
        if not matches:
            print(f"  ⚠️  [{project_name}] — no encontrado en HTML")
            continue

        html = re.sub(pattern, replacement, html)

        # Contar fotos
        images = get_images_for_project(project_name)
        print(f"  ✓ [{project_name}] → {len(images)} fotos")

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
