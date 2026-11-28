"""Repair presentation in a released course package without editing note fields.

Only the used note types' CSS and template markup change. The native Anki engine
exports an ordinary APKG; original portable IDs and media are retained. The
learner can import note types while leaving note updates disabled.
"""
from __future__ import annotations

import argparse
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from anki.collection import Collection, NoteIdsLimit
from anki.import_export_pb2 import (
    ExportAnkiPackageOptions, ImportAnkiPackageOptions, ImportAnkiPackageRequest,
)

from anki_card_presentation import apply_card_presentation
from build_anki_recall_update import Originals, restore_archive_ids


def without_presentation(model: dict) -> dict:
    protected = deepcopy(model)
    protected.pop('css', None)
    for template in protected['tmpls']:
        template.pop('qfmt', None)
        template.pop('afmt', None)
    return protected


def apply_presentation_to_collection(collection: Collection) -> list[dict]:
    """Apply one idempotent visual layer to every used course note type."""
    changes = []
    for model_id, notes in collection.db.all('SELECT mid,count(*) FROM notes GROUP BY mid'):
        previous = collection.models.get(model_id)
        updated = apply_card_presentation(previous)
        if without_presentation(previous) != without_presentation(updated):
            raise ValueError('Presentation repair changed protected note-type metadata')
        if apply_card_presentation(updated) != updated:
            raise ValueError('Presentation repair is not idempotent')
        change = {
            'id': model_id, 'name': previous['name'], 'cards': notes,
            'css_before_sha256': sha256(previous['css'].encode()).hexdigest(),
            'css_after_sha256': sha256(updated['css'].encode()).hexdigest(),
            'front_changed': previous['tmpls'][0]['qfmt'] != updated['tmpls'][0]['qfmt'],
            'back_changed': previous['tmpls'][0]['afmt'] != updated['tmpls'][0]['afmt'],
        }
        collection.models.update(updated, preserve_usn=False)
        changes.append(change)
    return changes


def fields_snapshot(collection: Collection) -> dict:
    return {guid: (mid, fields, tags) for guid, mid, fields, tags in collection.db.all(
        'SELECT guid,mid,flds,tags FROM notes')}


def build(source: Path, output: Path) -> dict:
    source, output = source.resolve(), output.resolve()
    if source == output:
        raise ValueError('Keep the released input immutable; use a separate working output')
    originals = Originals()
    originals.read(source)
    expected = len(originals.notes)
    source_sha = sha256(source.read_bytes()).hexdigest()
    output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix='anki-format-repair-') as folder:
        work = Path(folder)
        collection = Collection(str(work / 'collection.anki2'))
        try:
            result = collection.import_anki_package(ImportAnkiPackageRequest(
                package_path=str(source), options=ImportAnkiPackageOptions(
                    update_notes=1, update_notetypes=1, merge_notetypes=False,
                    with_scheduling=False, with_deck_configs=False)))
            if len(result.log.new) != expected or result.log.conflicting:
                raise ValueError('The released input did not import cleanly')
            before = fields_snapshot(collection)
            changes = apply_presentation_to_collection(collection)
            if fields_snapshot(collection) != before:
                raise ValueError('Formatting repair changed an existing note field or tag')
            identifiers = collection.find_notes('')
            if len(identifiers) != expected or collection.db.scalar('SELECT count(*) FROM cards') != expected:
                raise ValueError('Formatting repair changed the card inventory')
            if collection.db.scalar('SELECT count(*) FROM revlog'):
                raise ValueError('Unexpected review history in the disposable build collection')
            native = work / 'native.apkg'
            collection.export_anki_package(
                out_path=str(native), limit=NoteIdsLimit(identifiers),
                options=ExportAnkiPackageOptions(with_scheduling=False, with_media=True,
                                                 with_deck_configs=False, legacy=True))
        finally:
            collection.close()
        staged = output.with_suffix('.staging.apkg')
        restore_archive_ids(native, staged, originals)
        staged.replace(output)
    report = {
        'release': '2026-11-28', 'kind': 'presentation-only correction',
        'file': output.name, 'sha256': sha256(output.read_bytes()).hexdigest(),
        'source_file': source.name, 'source_sha256': source_sha,
        'cards': expected, 'notes': expected, 'new_cards': 0,
        'note_fields_changed': 0, 'note_types_repaired': len(changes),
        'recommended_import': {
            'update_notes': 'Never', 'update_note_types': 'Always',
            'import_learning_progress': False, 'import_deck_presets': False,
            'merge_note_types': False,
        },
        'note_types': changes,
    }
    output.with_suffix('.build.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    arguments = parser.parse_args()
    print(json.dumps(build(arguments.source, arguments.output), ensure_ascii=False))
