#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║   Renombrador automático de imágenes                 ║
║   Portfolio — Paloma Maseda                          ║
╠══════════════════════════════════════════════════════╣
║  Ejecutar con:  python3 rename_images.py             ║
║                                                      ║
║  Qué hace:                                           ║
║   • Convierte archivos HEIC/HEIF a JPG               ║
║   • La primera foto (por fecha) → cover.jpg          ║
║   • El resto → 01.jpg, 02.jpg, 03.jpg ...            ║
║   • Funciona en todas las subcarpetas de             ║
║     img/proyectos/ automáticamente                   ║
╚══════════════════════════════════════════════════════╝
"""

import subprocess
import shutil
from pathlib import Path

# ── Carpeta base de proyectos (relativa al script) ─────
BASE = Path(__file__).parent / "img" / "proyectos"

# ── Extensiones reconocidas como imagen ───────────────
IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def convert_heic(src: Path, dst: Path) -> bool:
    """Convierte HEIC/HEIF a JPEG usando sips (macOS nativo, sin instalar nada)."""
    result = subprocess.run(
        ["sips", "-s", "format", "jpeg", str(src), "--out", str(dst)],
        capture_output=True, text=True
    )
    return result.returncode == 0 and dst.exists()


def is_valid_name(filename: str) -> bool:
    """Detecta si un archivo ya tiene un nombre válido: cover.jpg o NN.jpg."""
    if filename.lower() == "cover.jpg":
        return True
    if filename.lower().endswith((".jpg", ".jpeg")):
        name_without_ext = filename.rsplit(".", 1)[0]
        # NN.jpg donde NN es dos dígitos (01 a 99)
        return name_without_ext.isdigit() and len(name_without_ext) == 2
    return False


def compact_numbering(folder: Path) -> list[tuple[str, str]]:
    """
    Reacomoda la secuencia NN.jpg para que no queden huecos.
    Mantiene el orden actual por número y nunca toca cover.jpg.
    """
    numbered_files = []

    for file in folder.iterdir():
        if not file.is_file() or file.name.startswith(".") or file.name.startswith("_"):
            continue
        if not is_valid_name(file.name) or file.name.lower() == "cover.jpg":
            continue

        stem = file.stem
        if stem.isdigit():
            numbered_files.append((int(stem), file))

    if not numbered_files:
        return []

    numbered_files.sort(key=lambda item: item[0])
    planned_moves = []

    for index, (_, file) in enumerate(numbered_files, start=1):
        target_name = f"{index:02d}.jpg"
        if file.name != target_name:
            planned_moves.append((file, target_name))

    if not planned_moves:
        return []

    tmp_dir = folder / "_renumber_temp"
    tmp_dir.mkdir(exist_ok=True)

    staged_moves = []
    for source, target_name in planned_moves:
        temp_path = tmp_dir / source.name
        shutil.move(str(source), str(temp_path))
        staged_moves.append((temp_path, folder / target_name))

    for temp_path, final_path in staged_moves:
        if final_path.exists():
            final_path.unlink()
        shutil.move(str(temp_path), str(final_path))

    try:
        tmp_dir.rmdir()
    except OSError:
        pass

    return [(source.name, final_path.name) for (source, _), (_, final_path) in zip(planned_moves, staged_moves)]


def rename_folder(folder: Path):
    """Procesa una carpeta: convierte HEIC y renombra solo lo nuevo, mantiene numeraciones existentes."""
    renumbered = compact_numbering(folder)

    all_files = [
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMG_EXTS
        and not f.name.startswith(".")
        and not f.name.startswith("_")
    ]

    if not all_files:
        print(f"  [{folder.name}] — sin imágenes, salteando.")
        return

    # ── Separar: ya nombradas (cover.jpg / NN.jpg) vs. nuevas sin formato ──
    already_named = [f for f in all_files if is_valid_name(f.name)]
    to_rename     = [f for f in all_files if not is_valid_name(f.name)]

    if not to_rename:
        if renumbered:
            changes = ", ".join(f"{old}→{new}" for old, new in renumbered)
            print(f"  [{folder.name}] ✓ numeración ajustada ({changes})")
        else:
            print(f"  [{folder.name}] — todas con nombres válidos, sin cambios.")
        return

    # Números ya ocupados por archivos existentes (para no pisar ninguno)
    used_nums = set()
    for f in already_named:
        if f.name.lower() != "cover.jpg":
            stem = f.name.rsplit(".", 1)[0]
            if stem.isdigit():
                used_nums.add(int(stem))

    has_cover = any(f.name.lower() == "cover.jpg" for f in already_named)

    # Ordenar las nuevas por fecha de modificación (más vieja primero)
    to_rename = sorted(to_rename, key=lambda f: f.stat().st_mtime)

    tmp_dir = folder / "_renaming_temp"
    tmp_dir.mkdir(exist_ok=True)

    converted = []
    skipped   = []

    def next_available_num() -> int:
        """Devuelve el próximo número libre, ya incluye los asignados en esta corrida."""
        n = 1
        while n in used_nums:
            n += 1
        return n

    for i, src in enumerate(to_rename):
        # Primera nueva sin cover existente → es la cover
        if i == 0 and not has_cover:
            target_name = "cover.jpg"
        else:
            num = next_available_num()
            used_nums.add(num)          # ← reservar para que la siguiente no lo repita
            target_name = f"{num:02d}.jpg"

        tmp_dst = tmp_dir / target_name
        ext = src.suffix.lower()

        if ext in {".heic", ".heif"}:
            print(f"    {src.name} → {target_name} ...", end=" ")
            if convert_heic(src, tmp_dst):
                print("✓")
                converted.append((src, tmp_dst, target_name))
            else:
                print("✗  (no se pudo convertir)")
                skipped.append(src.name)
                tmp_dst.unlink(missing_ok=True)
        else:
            shutil.copy2(src, tmp_dst)
            converted.append((src, tmp_dst, target_name))

    if not converted:
        tmp_dir.rmdir()
        if skipped:
            print(f"  [{folder.name}] ⚠️  sin conversiones. No convertidos: {', '.join(skipped)}")
        return

    # ── Borrar originales → mover renombrados ──
    for src, _, _ in converted:
        src.unlink()
    for _, tmp_file, final_name in converted:
        final_path = folder / final_name
        if final_path.exists():
            final_path.unlink()
        shutil.move(str(tmp_file), str(final_path))

    try:
        tmp_dir.rmdir()
    except OSError:
        pass  # si quedó algo adentro, no es crítico

    # ── Resumen ──
    names = [n for _, _, n in converted]
    msg = f"  [{folder.name}] ✓ {', '.join(names)}"
    if renumbered:
        changes = ", ".join(f"{old}→{new}" for old, new in renumbered)
        msg += f"  · renumeradas: {changes}"
    if skipped:
        msg += f"  ⚠️  sin convertir: {', '.join(skipped)}"
    print(msg)

    all_final = sorted([f.name for f in folder.iterdir() if f.is_file() and is_valid_name(f.name)])
    display = ", ".join(all_final[:6]) + ("..." if len(all_final) > 6 else "")
    print(f"           → Total: {len(all_final)} fotos [{display}]")


def main():
    print()
    print("══════════════════════════════════════════════")
    print("  Renombrador de imágenes — Paloma Maseda     ")
    print("══════════════════════════════════════════════")
    print()

    if not BASE.exists():
        print(f"❌  No se encontró la carpeta: {BASE}")
        print("   Asegurate de ejecutar el script desde la raíz del proyecto.")
        return

    folders = sorted([f for f in BASE.iterdir() if f.is_dir() and not f.name.startswith(".")])

    if not folders:
        print("No hay subcarpetas en img/proyectos/")
        return

    for folder in folders:
        rename_folder(folder)

    # ── Actualizar galerías en HTML ───
    print()
    print("📝 Actualizando galerías en index.html...")
    try:
        import sys
        sys.path.insert(0, str(Path(__file__).parent))
        from update_galleries import update_html
        update_html()
    except ImportError:
        print("  ⚠️  update_galleries.py no encontrado, saltando.")

    print()
    print("✅  Listo. Recargá el navegador para ver los cambios.")
    print()


if __name__ == "__main__":
    main()
