#!/usr/bin/env python3
"""
Release gate for Italian pronunciation integrity.

Checks Anki .apkg files against PRONUNCIATION_MANIFEST_APPROVED.json.

Usage:
  python validate_pronunciation_release.py \
      --manifest PRONUNCIATION_MANIFEST_APPROVED.json \
      "Italian - Lesson 1 - Introductions.apkg" \
      "Italian - Lesson 2 - Alphabet, C-G Sounds & Articles.apkg" \
      "Italian - Lesson 3 - Origins, Nationality and Residence.apkg" \
      "Italian - Lesson 4 - Avere, Numbers, Plurals and Family.apkg"
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import subprocess
import tempfile
import zipfile
from collections import defaultdict
from pathlib import Path

from bs4 import BeautifulSoup


def unicase(a: str | None, b: str | None) -> int:
    left = (a or "").casefold()
    right = (b or "").casefold()
    return (left > right) - (left < right)


def strip_html(value: str) -> str:
    soup = BeautifulSoup(value or "", "html.parser")
    return " ".join(soup.get_text(" ", strip=True).split())


def extract_pronunciation(value: str) -> tuple[list[str], list[str]]:
    soup = BeautifulSoup(value or "", "html.parser")
    guides = [
        " ".join(node.get_text(" ", strip=True).split())
        for node in soup.select(".pron-guide-line")
    ]
    ipas = [
        " ".join(node.get_text(" ", strip=True).split())
        for node in soup.select(".pron-ipa-line")
    ]
    return guides, ipas


def unpack(apkg: Path) -> Path:
    root = Path(tempfile.mkdtemp(prefix="pronunciation_release_gate_"))
    with zipfile.ZipFile(apkg) as archive:
        archive.extract("collection.anki21b", root)
    compressed = root / "collection.anki21b"
    database = root / "collection.sqlite"
    subprocess.run(
        ["zstd", "-d", "-q", str(compressed), "-o", str(database)],
        check=True,
        capture_output=True,
    )
    return database


def read_cards(apkg: Path) -> list[dict]:
    database = unpack(apkg)
    connection = sqlite3.connect(database)
    connection.create_collation("unicase", unicase)
    cursor = connection.cursor()

    fields_by_model: dict[int, list[str]] = defaultdict(list)
    for model_id, ordinal, name in cursor.execute(
        "SELECT ntid, ord, name FROM fields ORDER BY ntid, ord"
    ):
        fields_by_model[model_id].append(name)

    cards = []
    for note_id, guid, model_id, fields_blob in cursor.execute(
        "SELECT id, guid, mid, flds FROM notes ORDER BY id"
    ):
        values = fields_blob.split("\x1f")
        names = fields_by_model[model_id]
        fields = {
            names[index]: values[index] if index < len(values) else ""
            for index in range(len(names))
        }
        stable_key = fields.get("StableKey") or fields.get("ID") or ""
        answer_html = fields.get("Answer") or fields.get("Italian") or ""
        pronunciation_html = fields.get("Pronunciation") or ""
        guides, ipas = extract_pronunciation(pronunciation_html)
        cards.append(
            {
                "stable_key": stable_key,
                "note_id": note_id,
                "guid": guid,
                "answer": strip_html(answer_html),
                "english_friendly": guides,
                "ipa": ipas,
                "has_pronunciation": bool(pronunciation_html.strip()),
                "deck_file": apkg.name,
            }
        )
    connection.close()
    return cards


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("packages", nargs="+", type=Path)
    args = parser.parse_args()

    payload = json.loads(args.manifest.read_text(encoding="utf-8"))
    expected = {row["stable_key"]: row for row in payload["manifest"]}

    actual_cards: list[dict] = []
    for package in args.packages:
        actual_cards.extend(read_cards(package))
    actual = {row["stable_key"]: row for row in actual_cards}

    failures: list[str] = []

    if len(actual_cards) != payload["card_count"]:
        failures.append(
            f"Card count mismatch: expected {payload['card_count']}, found {len(actual_cards)}"
        )

    for key in sorted(set(expected) | set(actual)):
        wanted = expected.get(key)
        got = actual.get(key)
        if wanted is None:
            failures.append(f"{key}: present in packages but absent from manifest")
            continue
        if got is None:
            failures.append(f"{key}: present in manifest but absent from packages")
            continue

        for field in ("note_id", "guid", "answer", "english_friendly", "ipa"):
            if got[field] != wanted[field]:
                failures.append(
                    f"{key}: {field} mismatch\n"
                    f"  expected: {wanted[field]!r}\n"
                    f"  actual:   {got[field]!r}"
                )

        policy = wanted["pronunciation_policy"]
        if policy == "none":
            if got["has_pronunciation"] or got["english_friendly"] or got["ipa"]:
                failures.append(f"{key}: policy=none but pronunciation is present")
        elif policy in {
            "spoken_answer",
            "target_sound",
            "approved_pattern_example",
            "elided_article_sound",
        }:
            if not got["has_pronunciation"]:
                failures.append(f"{key}: policy={policy} but pronunciation is missing")
            if len(got["english_friendly"]) != len(got["ipa"]):
                failures.append(
                    f"{key}: guide/IPA count mismatch "
                    f"({len(got['english_friendly'])} vs {len(got['ipa'])})"
                )
            if not got["english_friendly"] or not got["ipa"]:
                failures.append(f"{key}: pronunciation entries are empty")
        else:
            failures.append(f"{key}: unknown pronunciation policy {policy!r}")

    for group_name, keys in payload.get("consistency_groups", {}).items():
        rows = [expected[key] for key in keys]
        variants = {
            (tuple(row["english_friendly"]), tuple(row["ipa"]))
            for row in rows
        }
        if len(variants) > 1:
            failures.append(
                f"Consistency group {group_name!r} has different pronunciations across: "
                f"{', '.join(keys)}"
            )

    if failures:
        print("PRONUNCIATION RELEASE GATE FAILED")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"PRONUNCIATION RELEASE GATE PASSED: {len(actual_cards)} cards")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
