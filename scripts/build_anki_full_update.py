"""Assemble one complete, review-compatible Italian course Anki package.

The input manifest lists the exact released lesson packages and later overlays.
Existing notes, cards, note types and decks retain their portable identities.
The only new notes come from the separately validated Lesson 9 component.
No user collection, scheduling information or deck presets are read or exported.
"""
from __future__ import annotations

import argparse
from collections import Counter
from hashlib import sha256
from html import escape, unescape
import json
from pathlib import Path
import re
import subprocess
from tempfile import TemporaryDirectory

from anki.collection import Collection, NoteIdsLimit
from anki.import_export_pb2 import (
    ExportAnkiPackageOptions, ImportAnkiPackageOptions, ImportAnkiPackageRequest,
)

from anki_verb_display import append_verb_display_css, format_verb_displays
from build_anki_recall_update import Originals, restore_archive_ids


ROOT = Path(__file__).resolve().parents[1]
KEY_FIELDS = ('StableKey', 'Key', 'ID')
ENDING_SUBJECTS = ('io', 'tu', 'lei', 'noi', 'voi', 'loro')
IMPORT_OPTIONS = ImportAnkiPackageOptions(
    merge_notetypes=False, update_notes=1, update_notetypes=1,
    with_scheduling=False, with_deck_configs=False,
)


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def key_for(note) -> str:
    return next(note[name] for name in KEY_FIELDS if name in note)


def plain(value: str) -> str:
    return unescape(re.sub(r'<[^>]*>', ' ', value))


def canonical_verbs() -> list[dict]:
    script = "global.window={};require('./study/daily-verbs.js');" \
             "process.stdout.write(JSON.stringify(window.ItalianDailyVerbs.verbs));"
    result = subprocess.run(['node', '-e', script], cwd=ROOT, text=True,
                            capture_output=True, check=True)
    return json.loads(result.stdout)


def verb_for_reference(pattern: str, catalogue: list[dict]) -> str | None:
    """Infer only from an existing complete reference with all six full forms."""
    text = plain(pattern)
    if not all(re.search(r'(?<!\w)' + person + r'(?!\w)', text, re.I)
               for person in ('io', 'tu', 'noi', 'voi', 'loro')):
        return None
    candidates = [verb['name'] for verb in catalogue if all(
        re.search(r'(?<!\w)' + re.escape(form) + r'(?!\w)', text, re.I)
        for form in verb['forms'])]
    return candidates[0] if len(candidates) == 1 else None


def encourage_whole_word(note, key: str, lesson7: dict) -> bool:
    """Keep each L7 gap card's identity, preferring its full conjugated word.

    These are ordinary self-assessed Anki recall cards, so the short alternative
    is stated explicitly on the back. No unsupported automatic grader is added.
    """
    prefix = 'italian-l7-ending-'
    if not key.startswith(prefix) or key[len(prefix):] not in ENDING_SUBJECTS:
        return False
    index = ENDING_SUBJECTS.index(key[len(prefix):])
    source = next(card for card in lesson7['cards'] if card['key'] == key)
    word = lesson7['forms']['lavorare'][index][0]
    ending = source['primaryAnswer']
    prompt = source['prompt'].replace(
        'Choose the regular -ARE ending:', 'Complete the regular -ARE verb:').replace(
        'Give the ending only.', 'Try the whole word. The missing ending is also accepted.')
    if prompt == source['prompt'] or 'Give the ending only.' in prompt:
        raise ValueError('Unexpected canonical Lesson 7 gap prompt: ' + key)
    note['Prompt'] = prompt
    note['Answer'] = escape(word)
    note['Extra'] = source['clarification'] + (
        '<p class="anki-answer-alternative"><b>Also accepted:</b> '
        '<span lang="it">' + escape(ending.lstrip('-')) + '</span> or '
        '<span lang="it">' + escape(ending) + '</span>. '
        'For stronger recall, practise writing the complete word '
        '<span class="learning-it" lang="it">' + escape(word) + '</span>.</p>')
    return True


def update_course_display(collection: Collection) -> dict:
    catalogue = canonical_verbs()
    lesson7 = json.loads((ROOT / 'lesson7/card-data.json').read_text())
    selected, records, before, whole_words = [], [], {}, []
    for identifier in collection.find_notes(''):
        note = collection.get_note(identifier)
        key = key_for(note)
        # Those two components already use this exact shared presentation layer.
        if key.startswith('l9-') or note.note_type()['name'] == 'Italian Course - Daily Verb Recall v1':
            continue
        before[key] = dict(note.items())
        if encourage_whole_word(note, key, lesson7):
            whole_words.append(key)
        pattern_field = next((name for name in ('Pattern', 'Rule', 'SoundNote', 'Explain') if name in note), None)
        answer_field = next((name for name in ('Answer', 'Italian') if name in note), None)
        pattern = note[pattern_field] if pattern_field else ''
        verb = verb_for_reference(pattern, catalogue)
        record = {'key': key, 'pattern': pattern, 'answer': note[answer_field] if answer_field else '',
                  'answerLanguage': note['AnswerLanguage'] if 'AnswerLanguage' in note else 'it'}
        if verb:
            record['verb'] = verb
        selected.append((note, pattern_field, answer_field))
        records.append(record)
    output = format_verb_displays(records)
    changed, fields_changed, affected_models = [], Counter(), set()
    for (note, pattern_field, answer_field), display in zip(selected, output):
        key = key_for(note)
        if pattern_field:
            note[pattern_field] = display['pattern']
        if answer_field:
            note[answer_field] = display['answer']
        differences = [name for name, value in note.items() if before[key][name] != value]
        allowed = {'Pattern', 'Rule', 'SoundNote', 'Explain', 'Answer', 'Italian'}
        if key in whole_words:
            allowed.update(('Prompt', 'Extra'))
        if not set(differences).issubset(allowed):
            raise ValueError('Unapproved field change: ' + key)
        if differences:
            changed.append(note)
            fields_changed.update(differences)
            affected_models.add(note.mid)
    if len(whole_words) != 6:
        raise ValueError('Expected exactly six existing L7 gap cards')
    if changed:
        collection.update_notes(changed)
    for model_id in affected_models:
        model = collection.models.get(model_id)
        model['css'] = append_verb_display_css(model['css'])
        collection.models.update(model, preserve_usn=False)
    return {'notes_updated': len(changed), 'fields_updated': dict(fields_changed),
            'whole_word_gap_cards': whole_words}


def import_package(collection: Collection, path: Path) -> dict:
    result = collection.import_anki_package(ImportAnkiPackageRequest(
        package_path=str(path.resolve()), options=IMPORT_OPTIONS))
    log = result.log
    return {'file': path.name, 'new': len(log.new), 'updated': len(log.updated),
            'duplicate': len(log.duplicate), 'conflicting': len(log.conflicting)}


def count(collection: Collection) -> int:
    return collection.db.scalar('SELECT count(*) FROM cards')


def build(manifest_path: Path, daily_path: Path, lesson9_path: Path, output: Path) -> dict:
    manifest = json.loads(manifest_path.read_text())
    baselines = manifest['baseline']
    overlays = manifest.get('overlays', [])
    for item in baselines + overlays:
        if digest(Path(item['path'])) != item['sha256']:
            raise ValueError('Released package hash does not match manifest: ' + item['label'])
    originals = Originals()
    for item in baselines:
        originals.read(Path(item['path']))
    originals.read(lesson9_path)
    expected_old = manifest['expected_existing_cards']
    expected_new = manifest['expected_new_cards']
    expected_total = expected_old + expected_new
    if len(originals.notes) != expected_total:
        raise ValueError('Portable identity inventory mismatch')
    output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory() as folder:
        work = Path(folder)
        collection = Collection(str(work / 'collection.anki2'))
        logs = []
        try:
            for item in baselines:
                logs.append(import_package(collection, Path(item['path'])))
            if count(collection) != expected_old:
                raise ValueError('Baseline import count mismatch')
            for item in overlays:
                logs.append(import_package(collection, Path(item['path'])))
                if count(collection) != expected_old:
                    raise ValueError('Correction overlay created duplicate notes')
            logs.append(import_package(collection, daily_path))
            if count(collection) != expected_old:
                raise ValueError('Daily update changed the existing card count')
            logs.append(import_package(collection, lesson9_path))
            if count(collection) != expected_total or logs[-1]['new'] != expected_new:
                raise ValueError('Lesson 9 must add exactly 22 new notes/cards')
            if any(log['conflicting'] for log in logs):
                raise ValueError('Native importer reported conflicting notes')
            presentation = update_course_display(collection)
            notes = [collection.get_note(identifier) for identifier in collection.find_notes('')]
            keys = [key_for(note) for note in notes]
            if len(keys) != expected_total or len(set(keys)) != expected_total:
                raise ValueError('Course key inventory is not unique')
            for guid, ordinal, mid in collection.db.all(
                    'SELECT n.guid,c.ord,n.mid FROM notes n JOIN cards c ON c.nid=n.id'):
                if originals.notes[guid, ordinal][1] != mid:
                    raise ValueError('An existing note changed note-type identity')
            if collection.db.scalar('SELECT count(*) FROM revlog'):
                raise ValueError('Unexpected personal review history')
            native = work / 'native.apkg'
            collection.export_anki_package(
                out_path=str(native), limit=NoteIdsLimit([note.id for note in notes]),
                options=ExportAnkiPackageOptions(with_scheduling=False, with_media=True,
                                                 with_deck_configs=False, legacy=True))
        finally:
            collection.close()
        staged = output.with_suffix('.staging.apkg')
        restore_archive_ids(native, staged, originals)
        staged.replace(output)
    report = {
        'release': manifest['release'], 'file': output.name, 'sha256': digest(output),
        'notes': expected_total, 'cards': expected_total,
        'existing_cards': expected_old, 'new_lesson9_cards': expected_new,
        'imports': logs, 'presentation': presentation,
        'contains_review_history': False, 'contains_deck_presets': False,
        'sources': [{'label': item['label'], 'file': Path(item['path']).name,
                     'sha256': item['sha256']} for item in baselines + overlays],
        'components': [{'file': p.name, 'sha256': digest(p)} for p in (daily_path, lesson9_path)],
    }
    output.with_suffix('.build.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('daily_component', type=Path)
    parser.add_argument('lesson9_component', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(json.dumps(build(args.manifest, args.daily_component, args.lesson9_component,
                           args.output), ensure_ascii=False))
