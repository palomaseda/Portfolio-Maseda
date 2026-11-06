#!/usr/bin/env python3
"""
Trae las ediciones de la newsletter desde una carpeta pública de Google Drive
hacia newsletter/, para que quien arma la newsletter solo tenga que soltar el
archivo en esa carpeta.

No usa la API de Google ni claves: lee la vista pública de la carpeta (que
tiene que estar compartida como "Cualquier persona con el enlace → Lector") y
baja cada archivo por su link público de descarga.

Reglas de nombres:
  - Si el archivo se llama como siempre (AAAA-MM-DD__Titulo.pdf o AAAA-MM-DD.pdf)
    se respeta tal cual.
  - Si no, el nombre del archivo es el título, y la fecha es el día en que se
    subió a Drive (hora de Buenos Aires). Esa fecha queda fija aunque después
    se reemplace o se renombre el archivo.

Se sincronizan altas, reemplazos, renombres y borrados, pero solo de los
archivos que vinieron de Drive (los que figuran en data/drive_sync.json). Lo que
se subió a mano a newsletter/ no se toca.

Uso:
  GDRIVE_FOLDER_ID=... python3 sync_drive_newsletter.py
"""

from __future__ import annotations

import datetime
import email.utils
import html
import json
import os
import re
import shutil
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

from build_newsletter import BASE_DIR, NAME_PATTERN, NEWSLETTER_DIR, SUPPORTED_EXTENSIONS, parse_date

FOLDER_VIEW_URL = "https://drive.google.com/embeddedfolderview"
DOWNLOAD_URL = "https://drive.usercontent.google.com/download"
USER_AGENT = "Mozilla/5.0 (compatible; Portfolio-Maseda newsletter sync)"

MANIFEST_PATH = BASE_DIR / "data" / "drive_sync.json"
TIMEZONE = ZoneInfo("America/Argentina/Buenos_Aires")

# GitHub rechaza archivos de más de 100 MB; un push rechazado trabaría todas
# las corridas siguientes, así que mejor saltear el archivo y avisar.
MAX_BYTES = 95 * 1024 * 1024

ENTRY_PATTERN = re.compile(
    r'<div class="flip-entry" id="entry-([\w-]+)".*?<a href="([^"]+)".*?'
    r'<div class="flip-entry-title">(.*?)</div>'
    r'(?:.*?<div class="flip-entry-last-modified"><div>(.*?)</div>)?',
    re.S,
)
INVALID_FILENAME_CHARS = re.compile(r'[\\/:*?"<>|]+')


def warn(message: str) -> None:
    # El prefijo ::warning:: lo muestra GitHub Actions como aviso visible.
    print(f"::warning::{message}")


def request(url: str, method: str = "GET"):
    return urllib.request.urlopen(
        urllib.request.Request(url, method=method, headers={"User-Agent": USER_AGENT}),
        timeout=300,
    )


def list_folder(folder_id: str) -> list[dict]:
    """Devuelve [{id, name, listed_modified}] de los archivos (no subcarpetas).

    listed_modified es la fecha/hora de modificación tal como la muestra la
    vista pública; solo se usa para saber si vale la pena consultar el archivo.
    """
    url = f"{FOLDER_VIEW_URL}?{urllib.parse.urlencode({'id': folder_id})}"
    try:
        with request(url) as response:
            page = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        raise SystemExit(
            f"Google Drive respondió {error.code} al abrir la carpeta. Revisá que esté "
            "compartida como 'Cualquier persona con el enlace' y que GDRIVE_FOLDER_ID sea correcto."
        ) from error

    # Si Google devuelve otra cosa (login, captcha, un cambio de diseño), mejor
    # cortar acá que interpretarlo como "carpeta vacía" y borrar ediciones.
    if 'class="flip-entries"' not in page:
        raise SystemExit("La vista pública de la carpeta no tiene el formato esperado; no se toca nada.")

    return [
        {"id": file_id, "name": html.unescape(name).strip(), "listed_modified": html.unescape(modified).strip()}
        for file_id, href, name, modified in ENTRY_PATTERN.findall(page)
        if "/file/d/" in href
    ]


def download_url(file_id: str) -> str:
    return f"{DOWNLOAD_URL}?{urllib.parse.urlencode({'id': file_id, 'export': 'download', 'confirm': 't'})}"


def file_info(file_id: str) -> dict:
    """Tamaño y fecha de modificación del archivo, sin bajarlo."""
    with request(download_url(file_id), method="HEAD") as response:
        if response.headers.get_content_type() == "text/html":
            raise OSError("Google devolvió una página en vez del archivo")
        modified = email.utils.parsedate_to_datetime(response.headers["Last-Modified"])
        return {"size": int(response.headers.get("Content-Length", 0)), "modified": modified}


def download(file_id: str, destination: Path) -> None:
    temp = destination.with_name(destination.name + ".part")
    try:
        with request(download_url(file_id)) as response:
            if response.headers.get_content_type() == "text/html":
                raise OSError("Google devolvió una página en vez del archivo")
            with open(temp, "wb") as handle:
                shutil.copyfileobj(response, handle)
        temp.replace(destination)
    finally:
        temp.unlink(missing_ok=True)


def target_name(original: str, upload_date: str, taken: set[str]) -> str:
    stem, extension = os.path.splitext(original)
    extension = extension.lower()
    stem = re.sub(r"\s+", " ", INVALID_FILENAME_CHARS.sub(" ", stem)).strip()

    match = NAME_PATTERN.match(stem)
    base = stem if match and parse_date(*match.groups()[:3]) else f"{upload_date}__{stem}"

    name = f"{base}{extension}"
    counter = 2
    while name in taken:
        name = f"{base}-{counter}{extension}"
        counter += 1
    return name


def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {}


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def sync(folder_id: str) -> None:
    NEWSLETTER_DIR.mkdir(exist_ok=True)

    manifest = load_manifest()
    listed = list_folder(folder_id)
    listed_ids = {item["id"] for item in listed}

    candidates = []
    for item in listed:
        extension = os.path.splitext(item["name"])[1].lower()
        if extension not in SUPPORTED_EXTENSIONS:
            warn(f"Ignorado, formato no soportado ({extension or 'sin extensión'}): {item['name']}")
            continue

        known = manifest.get(item["id"])
        if (
            known
            and known.get("listed_modified") == item["listed_modified"]
            and (NEWSLETTER_DIR / known["name"]).exists()
        ):
            # Sin cambios a la vista: no hace falta consultar a Google por este archivo.
            candidates.append((known["date"], item, known["version"]))
            continue

        try:
            info = file_info(item["id"])
        except (urllib.error.URLError, OSError, KeyError, TypeError, ValueError) as error:
            # Se reintenta en la próxima corrida; mientras tanto no se borra nada de este archivo.
            warn(f"No se pudo consultar {item['name']}: {error}")
            continue

        if info["size"] > MAX_BYTES:
            warn(f"Ignorado, pesa más de {MAX_BYTES // 1024 // 1024} MB y GitHub no lo acepta: {item['name']}")
            continue

        upload_date = known["date"] if known else info["modified"].astimezone(TIMEZONE).date().isoformat()
        version = f"{info['size']}@{info['modified'].isoformat()}"
        candidates.append((upload_date, item, version))

    taken: set[str] = set()
    wanted = []
    for upload_date, item, version in sorted(candidates, key=lambda entry: (entry[0], entry[1]["id"])):
        name = target_name(item["name"], upload_date, taken)
        taken.add(name)
        wanted.append((item, name, upload_date, version))

    names = {item["id"]: name for item, name, _, _ in wanted}

    # 1) Quitar lo que ya no corresponde: borrado de Drive o con otro nombre.
    #    Se hace antes de descargar para que un nombre nuevo nunca pise el
    #    archivo viejo de otra edición. (Un renombre = borrar y volver a bajar.)
    #    Lo que sigue listado pero falló al consultarse no se toca.
    for file_id in sorted(manifest):
        still_listed = file_id in listed_ids
        if still_listed and file_id not in names:
            continue
        if names.get(file_id) == manifest[file_id]["name"]:
            continue
        if not listed and manifest:
            warn("La carpeta de Drive aparece vacía; por las dudas no se borra ninguna edición.")
            break
        old = manifest.pop(file_id)
        (NEWSLETTER_DIR / old["name"]).unlink(missing_ok=True)
        print(f"✗ Se elimina {old['name']} ({'cambió de nombre' if still_listed else 'ya no está en Drive'})")

    # 2) Descargar lo nuevo o lo que cambió.
    for item, name, upload_date, version in wanted:
        known = manifest.get(item["id"])
        if known and known["version"] == version and (NEWSLETTER_DIR / name).exists():
            known["listed_modified"] = item["listed_modified"]
            continue

        try:
            download(item["id"], NEWSLETTER_DIR / name)
        except (urllib.error.URLError, OSError) as error:
            # Se reintenta en la próxima corrida (la versión guardada sigue siendo la vieja).
            warn(f"No se pudo descargar {item['name']}: {error}")
            continue

        manifest[item["id"]] = {
            "name": name,
            "version": version,
            "date": upload_date,
            "listed_modified": item["listed_modified"],
        }
        print(f"✓ Descargado: {item['name']} → {name}")

    save_manifest(manifest)


def main() -> None:
    folder_id = os.environ.get("GDRIVE_FOLDER_ID", "").strip()
    if not folder_id:
        print("Sincronización con Drive sin configurar (falta GDRIVE_FOLDER_ID). Nada que hacer.")
        return

    sync(folder_id)


if __name__ == "__main__":
    main()
