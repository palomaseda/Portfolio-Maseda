#!/usr/bin/env python3
"""
Trae las ediciones de la newsletter desde una carpeta pública de Google Drive
hacia newsletter/, para que quien arma la newsletter solo tenga que soltar el
archivo en esa carpeta.

Reglas de nombres:
  - Si el archivo se llama como siempre (AAAA-MM-DD__Titulo.pdf o AAAA-MM-DD.pdf)
    se respeta tal cual.
  - Si no, el nombre del archivo es el título, y la fecha es el día en que se
    subió a Drive (hora de Buenos Aires).

Se sincronizan altas, reemplazos (mismo archivo con contenido nuevo), renombres
y borrados, pero solo de los archivos que vinieron de Drive (los que figuran en
data/drive_sync.json). Lo que se subió a mano a newsletter/ no se toca.

Uso:
  GDRIVE_API_KEY=... GDRIVE_FOLDER_ID=... python3 sync_drive_newsletter.py
"""

from __future__ import annotations

import datetime
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

API_BASE = "https://www.googleapis.com/drive/v3"
MANIFEST_PATH = BASE_DIR / "data" / "drive_sync.json"
TIMEZONE = ZoneInfo("America/Argentina/Buenos_Aires")

# GitHub rechaza archivos de más de 100 MB; un push rechazado trabaría todas
# las corridas siguientes, así que mejor saltear el archivo y avisar.
MAX_BYTES = 95 * 1024 * 1024

INVALID_FILENAME_CHARS = re.compile(r'[\\/:*?"<>|]+')


def warn(message: str) -> None:
    # El prefijo ::warning:: lo muestra GitHub Actions como aviso visible.
    print(f"::warning::{message}")


def drive_url(path: str, params: dict, key: str) -> str:
    query = urllib.parse.urlencode({**params, "key": key, "supportsAllDrives": "true"})
    return f"{API_BASE}{path}?{query}"


def drive_error(error: urllib.error.HTTPError) -> SystemExit:
    detail = error.read().decode("utf-8", errors="replace")[:300]
    return SystemExit(
        f"Google Drive respondió {error.code}: {detail}\n"
        "Revisá que la carpeta esté compartida como 'Cualquier persona con el enlace' "
        "y que GDRIVE_API_KEY y GDRIVE_FOLDER_ID sean correctos."
    )


def list_folder(folder_id: str, key: str) -> list[dict]:
    files: list[dict] = []
    page_token = None

    while True:
        params = {
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "nextPageToken, files(id, name, md5Checksum, createdTime, size)",
            "pageSize": 100,
            "includeItemsFromAllDrives": "true",
        }
        if page_token:
            params["pageToken"] = page_token

        try:
            with urllib.request.urlopen(drive_url("/files", params, key), timeout=60) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as error:
            raise drive_error(error) from error

        files.extend(payload.get("files", []))
        page_token = payload.get("nextPageToken")
        if not page_token:
            return files


def download(file_id: str, key: str, destination: Path) -> None:
    temp = destination.with_name(destination.name + ".part")
    try:
        with urllib.request.urlopen(
            drive_url(f"/files/{file_id}", {"alt": "media"}, key), timeout=300
        ) as response, open(temp, "wb") as handle:
            shutil.copyfileobj(response, handle)
        temp.replace(destination)
    finally:
        temp.unlink(missing_ok=True)


def target_name(drive_file: dict, taken: set[str]) -> str:
    stem, extension = os.path.splitext(drive_file["name"])
    extension = extension.lower()
    stem = re.sub(r"\s+", " ", INVALID_FILENAME_CHARS.sub(" ", stem)).strip()

    match = NAME_PATTERN.match(stem)
    if match and parse_date(*match.groups()[:3]):
        base = stem
    else:
        created = datetime.datetime.fromisoformat(drive_file["createdTime"].replace("Z", "+00:00"))
        base = f"{created.astimezone(TIMEZONE).date().isoformat()}__{stem}"

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


def sync(folder_id: str, key: str) -> None:
    NEWSLETTER_DIR.mkdir(exist_ok=True)

    manifest = load_manifest()
    taken: set[str] = set()
    wanted: list[tuple[dict, str]] = []

    for drive_file in sorted(list_folder(folder_id, key), key=lambda item: (item["createdTime"], item["id"])):
        original = drive_file["name"]
        extension = os.path.splitext(original)[1].lower()

        if extension not in SUPPORTED_EXTENSIONS:
            warn(f"Ignorado, formato no soportado ({extension or 'sin extensión'}): {original}")
            continue

        if int(drive_file.get("size", 0)) > MAX_BYTES:
            warn(f"Ignorado, pesa más de {MAX_BYTES // 1024 // 1024} MB y GitHub no lo acepta: {original}")
            continue

        name = target_name(drive_file, taken)
        taken.add(name)
        wanted.append((drive_file, name))

    names = {drive_file["id"]: name for drive_file, name in wanted}

    # 1) Quitar lo que ya no corresponde: borrado en Drive o con otro nombre.
    #    Se hace antes de descargar para que un nombre nuevo nunca pise el
    #    archivo viejo de otra edición. (Un renombre = borrar y volver a bajar.)
    for file_id in sorted(manifest):
        if names.get(file_id) == manifest[file_id]["name"]:
            continue
        old = manifest.pop(file_id)
        (NEWSLETTER_DIR / old["name"]).unlink(missing_ok=True)
        reason = "cambió de nombre" if file_id in names else "ya no está en Drive"
        print(f"✗ Se elimina {old['name']} ({reason})")

    # 2) Descargar lo nuevo o lo que cambió de contenido.
    for drive_file, name in wanted:
        file_id = drive_file["id"]
        md5 = drive_file.get("md5Checksum", "")
        known = manifest.get(file_id)

        if known and known["md5"] == md5 and (NEWSLETTER_DIR / name).exists():
            continue

        try:
            download(file_id, key, NEWSLETTER_DIR / name)
        except (urllib.error.URLError, OSError) as error:
            # Se reintenta en la próxima corrida: no figura en el manifest.
            warn(f"No se pudo descargar {drive_file['name']}: {error}")
            continue

        manifest[file_id] = {"name": name, "md5": md5}
        print(f"✓ Descargado: {drive_file['name']} → {name}")

    save_manifest(manifest)


def main() -> None:
    key = os.environ.get("GDRIVE_API_KEY", "").strip()
    folder_id = os.environ.get("GDRIVE_FOLDER_ID", "").strip()

    if not key or not folder_id:
        print("Sincronización con Drive sin configurar (faltan GDRIVE_API_KEY y GDRIVE_FOLDER_ID). Nada que hacer.")
        return

    sync(folder_id, key)


if __name__ == "__main__":
    main()
