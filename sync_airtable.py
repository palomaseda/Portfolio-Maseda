#!/usr/bin/env python3
"""
Sincroniza contenido desde Airtable hacia data/content.json.

Uso:
  AIRTABLE_TOKEN=pat... AIRTABLE_BASE=app... python3 sync_airtable.py
"""

from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).parent
OUTPUT_PATH = BASE_DIR / "data" / "content.json"


def fetch_table(base_id: str, token: str, table_name: str) -> list[dict]:
    records = []
    offset = None

    while True:
        params = {}
        if offset:
            params["offset"] = offset

        query = f"?{urllib.parse.urlencode(params)}" if params else ""
        url = f"https://api.airtable.com/v0/{base_id}/{urllib.parse.quote(table_name)}{query}"
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Bearer {token}"},
        )

        with urllib.request.urlopen(req) as response:
            payload = json.load(response)

        records.extend(payload.get("records", []))
        offset = payload.get("offset")
        if not offset:
            break

    return records


def rich_value(value):
    if isinstance(value, list):
        if value and isinstance(value[0], dict):
            return value[0].get("url", "")
        return [str(item).strip() for item in value if str(item).strip()]
    return str(value).strip() if value is not None else ""


def normalize_gallery(value) -> list[str]:
    if isinstance(value, list):
        if value and isinstance(value[0], dict):
            return [item.get("url", "").strip() for item in value if item.get("url")]
        return [str(item).strip() for item in value if str(item).strip()]

    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def split_body(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"\n\s*\n", text or "") if part.strip()]


def split_tags(text) -> list[str]:
    if isinstance(text, list):
        return [str(item).strip() for item in text if str(item).strip()]
    return [part.strip() for part in str(text or "").split(",") if part.strip()]


def join_text_list(value) -> str:
    if isinstance(value, list):
        return ", ".join(str(item).strip() for item in value if str(item).strip())
    return str(value).strip() if value is not None else ""


def slug_to_project_key(slug: str) -> str:
    parts = slug.split("-")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def build_content(project_records: list[dict], site_records: list[dict], about_records: list[dict]) -> dict:
    content = {
        "translations": {"es": {}, "en": {}},
        "projects": [],
        "about": {},
    }

    if about_records:
        fields = about_records[0].get("fields", {})
        body_es = split_body(rich_value(fields.get("body_es")))
        body_en = split_body(rich_value(fields.get("body_en")))

        content["about"] = {
            "image": rich_value(fields.get("image")),
            "caption_es": join_text_list(fields.get("caption_es")),
            "caption_en": join_text_list(fields.get("caption_en")),
            "body_es": rich_value(fields.get("body_es")),
            "body_en": rich_value(fields.get("body_en")),
        }

        content["translations"]["es"]["about"] = {
            "label": rich_value(fields.get("label_es")),
            "heading": rich_value(fields.get("heading_es")).replace("\n", "<br>"),
            **{f"p{i+1}": body_es[i] for i in range(len(body_es))},
        }
        content["translations"]["en"]["about"] = {
            "label": rich_value(fields.get("label_en")),
            "heading": rich_value(fields.get("heading_en")).replace("\n", "<br>"),
            **{f"p{i+1}": body_en[i] for i in range(len(body_en))},
        }

    site_map_es = {}
    site_map_en = {}
    for record in site_records:
        fields = record.get("fields", {})
        slug = rich_value(fields.get("slug"))
        site_map_es[slug] = rich_value(fields.get("value_es"))
        site_map_en[slug] = rich_value(fields.get("value_en"))

    content["translations"]["es"].update({
        "hero": {"subtitle": site_map_es.get("hero_subtitle", "")},
        "gallery": {
            "label": site_map_es.get("gallery_label", ""),
            "title": site_map_es.get("gallery_title", "").replace("\n", "<br>"),
        },
        "contact": {
            "label": site_map_es.get("contact_label", ""),
            "heading": site_map_es.get("contact_heading", ""),
            "intro": site_map_es.get("contact_intro", ""),
        },
        "footer": {"copy": site_map_es.get("footer_copy", "")},
    })

    content["translations"]["en"].update({
        "hero": {"subtitle": site_map_en.get("hero_subtitle", "")},
        "gallery": {
            "label": site_map_en.get("gallery_label", ""),
            "title": site_map_en.get("gallery_title", "").replace("\n", "<br>"),
        },
        "contact": {
            "label": site_map_en.get("contact_label", ""),
            "heading": site_map_en.get("contact_heading", ""),
            "intro": site_map_en.get("contact_intro", ""),
        },
        "footer": {"copy": site_map_en.get("footer_copy", "")},
    })

    content["translations"]["es"]["project"] = {}
    content["translations"]["en"]["project"] = {}

    sorted_projects = sorted(
        (record.get("fields", {}) for record in project_records if record.get("fields", {}).get("visible")),
        key=lambda fields: fields.get("order", 999),
    )

    for fields in sorted_projects:
        slug = rich_value(fields.get("slug"))
        key = slug_to_project_key(slug)
        tags_es = split_tags(fields.get("tags_es"))
        tags_en = split_tags(fields.get("tags_en"))
        gallery = normalize_gallery(fields.get("gallery"))

        content["projects"].append({
            "slug": slug,
            "cover": rich_value(fields.get("cover")),
            "gallery": gallery,
        })

        content["translations"]["es"]["project"][key] = {
            "title": rich_value(fields.get("title_es")).replace("\n", "<br>"),
            "desc": rich_value(fields.get("description_es")),
            **{f"tag{i+1}": tag for i, tag in enumerate(tags_es)},
        }
        content["translations"]["en"]["project"][key] = {
            "title": rich_value(fields.get("title_en")).replace("\n", "<br>"),
            "desc": rich_value(fields.get("description_en")),
            **{f"tag{i+1}": tag for i, tag in enumerate(tags_en)},
        }

    return content


def main():
    token = os.environ.get("AIRTABLE_TOKEN")
    base_id = os.environ.get("AIRTABLE_BASE")

    if not token or not base_id:
        raise SystemExit("Definí AIRTABLE_TOKEN y AIRTABLE_BASE antes de correr el script.")

    projects = fetch_table(base_id, token, "project")
    site = fetch_table(base_id, token, "site")
    about = fetch_table(base_id, token, "about")

    content = build_content(projects, site, about)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ content.json actualizado en {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
