#!/usr/bin/env python3
"""Validate a presentation-only repair against the delivered 879-card package.

Usage: python scripts/validate_anki_format_repair.py BASELINE_APKG REPAIR_APKG
       [--report REPORT_JSON]

The baseline is the complete 27 November 2026 release. All note field bytes,
portable identities, schemas and template field/conditional order must remain
unchanged. Stylesheets and HTML wrappers may change. Native Anki checks use
disposable collections, including personal annotations, tags and scheduling.
Recommended repair import: update notes Never; update note types Always.
The If newer note-type setting is also exercised against the released baseline.
"""
from __future__ import annotations

import argparse
from copy import deepcopy
from hashlib import sha256
import importlib.metadata
import json
from pathlib import Path
import re
from tempfile import TemporaryDirectory

from anki.collection import Collection
from anki.import_export_pb2 import ImportAnkiPackageOptions, ImportAnkiPackageRequest

from validate_anki_full_update import (
    Tree, assert_personal_state, inspect_archive, media, notes_snapshot,
    options_snapshot, package_db, plain, portable_identities, schedules_snapshot,
    seed_personal_state,
)


BASELINE_SHA256 = '19eb65d05ec9af62185091a5232e2aedfd8be5aebcca863c3c5467da7e93195b'
EXPECTED_CARDS = 879
EXPECTED_MODELS = 11
CSS_START = '/* Italian shared card presentation: start */'
CSS_END = '/* Italian shared card presentation: end */'


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def import_package(collection, package, *, note_types=1, notes=2, scheduling=False, configs=False):
    """Enums: 0 If newer; 1 Always; 2 Never. New notes can still be imported."""
    result = collection.import_anki_package(ImportAnkiPackageRequest(
        package_path=str(package.resolve()),
        options=ImportAnkiPackageOptions(
            merge_notetypes=False, update_notes=notes, update_notetypes=note_types,
            with_scheduling=scheduling, with_deck_configs=configs,
        ),
    ))
    assert not result.log.conflicting, 'Native importer reported conflicting notes'
    return {name: len(getattr(result.log, name)) for name in ('new', 'updated', 'duplicate', 'conflicting')}


def archive_metadata(package):
    with package_db(package) as db:
        models, decks = db.execute('SELECT models,decks FROM col').fetchone()
        notes = {row[0]: row[1:] for row in db.execute(
            'SELECT id,guid,mid,flds,tags,flags,data FROM notes')}
        return {'models': json.loads(models), 'decks': json.loads(decks), 'notes': notes}


def template_tokens(value):
    """Retain filters, conditional polarity and order; validate nesting too."""
    tokens = [token.strip() for token in re.findall(r'{{([^{}]+)}}', value)]
    stack = []
    for token in tokens:
        if token.startswith(('#', '^')):
            stack.append(token[1:])
        elif token.startswith('/'):
            assert stack and stack.pop() == token[1:], 'Broken template conditional: ' + token
    assert not stack, 'Unclosed template conditionals: ' + repr(stack)
    return tokens


def check_model_contract(old_models, new_models):
    assert set(old_models) == set(new_models), 'Note-type IDs changed'
    assert len(old_models) == EXPECTED_MODELS
    changed = []
    for identifier, old in old_models.items():
        new = new_models[identifier]
        before, after = deepcopy(old), deepcopy(new)
        for model in (before, after):
            for name in ('css', 'mod', 'usn'):
                model.pop(name, None)
            for template in model['tmpls']:
                template.pop('qfmt', None)
                template.pop('afmt', None)
        assert before == after, 'Non-presentation schema/model metadata changed: ' + old['name']
        assert old['type'] == new['type'] == 0, 'Unexpected cloze/reverse model conversion'
        assert len(old['tmpls']) == len(new['tmpls']) == 1, 'Template count changed'
        for old_template, new_template in zip(old['tmpls'], new['tmpls']):
            for side, marker in (('qfmt', 'anki-front'), ('afmt', 'anki-back')):
                assert template_tokens(new_template[side]) == template_tokens(old_template[side]), (
                    'Field/filter/conditional order changed: ' + old['name'] + ' / ' + side)
                roots = Tree(new_template[side]).root.find(cls=marker)
                assert len(roots) == 1 and roots[0].has_class('anki-course'), 'Missing/duplicated common card root'
            assert Tree(new_template['qfmt']).root.find(cls='anki-task'), 'Missing structured front task'
            assert Tree(new_template['afmt']).root.find(cls='anki-answer'), 'Missing structured answer'
        css = new['css']
        assert css.count(CSS_START) == css.count(CSS_END) == 1, 'Shared card CSS missing or duplicated'
        assert css != old['css'], 'Used note type retained its old stylesheet: ' + old['name']
        assert new['mod'] > old['mod'], 'Repair is not newer than delivered note type: ' + old['name']
        changed.append(old['name'])
    return changed


def text_fingerprint(value):
    # Adding block wrappers can introduce line boundaries between unchanged
    # fields. Field bytes are checked separately; all non-whitespace visible
    # characters and their order must survive native rendering unchanged.
    return re.sub(r'\s+', '', plain(value))


def check_rendered_content(before, after):
    assert set(before) == set(after), 'Stable-key inventory changed'
    for key, old in before.items():
        new = after[key]
        assert new['fields'] == old['fields'], 'Note field bytes changed: ' + key
        for side in ('question', 'answer'):
            assert text_fingerprint(new[side]) == text_fingerprint(old[side]), 'Rendered text changed: ' + key + '/' + side
            assert media(new[side]) == media(old[side]), 'Rendered media changed: ' + key + '/' + side
        front = Tree(new['question']).root
        back = Tree(new['answer']).root
        tasks, answers = front.find(cls='anki-task'), back.find(cls='anki-answer')
        assert len(tasks) == 1 and tasks[0].text().strip(), 'Empty/duplicated task: ' + key
        assert len(answers) == 1 and answers[0].text().strip(), 'Empty/duplicated answer: ' + key
        assert not front.find(cls='anki-answer'), 'Answer container leaked onto front: ' + key


def probe_template_conditions(collection, old_models, new_models):
    """Render unique field markers under optional-field presence combinations.

    This independently catches changed answer exposure, field duplication,
    filter behaviour, inverted conditions, TTS and accidental FrontSide reuse.
    The ephemeral notes are never saved and cannot create review cards.
    """
    probes = 0
    for identifier, old in old_models.items():
        new = new_models[identifier]
        names = [field['name'] for field in old['flds']]
        tokens = template_tokens(old['tmpls'][0]['qfmt']) + template_tokens(old['tmpls'][0]['afmt'])
        optional = sorted({token[1:] for token in tokens if token.startswith(('#', '^'))})
        assert set(optional).issubset(names), 'Unknown conditional field'
        # Full, empty, each absent and each alone cover nested positive/inverse
        # combinations in these eleven released templates without saving notes.
        empty_cases = {frozenset(), frozenset(optional)}
        empty_cases.update(frozenset({name}) for name in optional)
        empty_cases.update(frozenset(set(optional) - {name}) for name in optional)
        for empty in sorted(empty_cases, key=lambda value: (len(value), sorted(value))):
            note = collection.new_note(collection.models.get(int(identifier)))
            markers = {name: 'REPAIRFIELD' + str(index) + 'SENTINEL' for index, name in enumerate(names)}
            for name in names:
                note[name] = '' if name in empty else markers[name]
            old_card = note.ephemeral_card(custom_note_type=old)
            new_card = note.ephemeral_card(custom_note_type=new)
            for old_html, new_html in ((old_card.question(), new_card.question()), (old_card.answer(), new_card.answer())):
                for marker in markers.values():
                    assert old_html.count(marker) == new_html.count(marker), (
                        'Conditional/filter/answer exposure changed: ' + old['name'] + ' / ' + marker)
                assert text_fingerprint(old_html) == text_fingerprint(new_html), (
                    'Template content changed with optional fields: ' + old['name'])
            probes += 1
    return probes


def personalised_notes(collection, baseline):
    """Simulate learner tags everywhere and their own text in each note type."""
    seen_models, changed = set(), []
    for index, (key, row) in enumerate(sorted(baseline.items())):
        note = collection.get_note(row['note_id'])
        note.tags.append('repair_regression::personal::' + str(index % 7))
        if note.mid not in seen_models:
            field = next(name for name in ('Extra', 'Usage', 'Use', 'Explanation', 'Explain', 'SoundNote') if name in note)
            note[field] += '<p>Personal annotation: keep this learner note unchanged.</p>'
            seen_models.add(note.mid)
        changed.append(note)
    collection.update_notes(changed)
    assert len(seen_models) == EXPECTED_MODELS
    return {'tagged_notes': len(changed), 'notes_with_personal_text': len(seen_models)}


def tags_snapshot(collection):
    return {nid: sorted(collection.get_note(nid).tags) for nid in collection.find_notes('')}


def assert_personal_notes(collection, expected, expected_tags):
    current = notes_snapshot(collection)
    assert current == expected, 'Repair changed personal note content or note/card identity'
    assert tags_snapshot(collection) == expected_tags, 'Repair changed personal tags'


def assert_installed_models(collection, expected):
    for identifier, model in expected.items():
        # The headless import method updates Rust storage without the desktop
        # UI's cache-reset hooks. Read persisted data, not ModelManager.get()'s
        # dictionary cached while inspecting the pre-import collection.
        installed = json.loads(collection._backend.get_notetype_legacy(int(identifier)))
        assert installed is not None
        assert installed['css'] == model['css'], 'Updated CSS not installed: ' + model['name']
        assert len(installed['tmpls']) == len(model['tmpls'])
        for actual, wanted in zip(installed['tmpls'], model['tmpls']):
            for name in ('qfmt', 'afmt'):
                assert actual[name] == wanted[name], 'Updated template not installed: ' + model['name']


def validate(baseline_path, repair_path):
    assert digest(baseline_path) == BASELINE_SHA256, 'Baseline differs from the delivered full package'
    original, repair = archive_metadata(baseline_path), archive_metadata(repair_path)
    assert original['notes'] == repair['notes'], 'Archive note data, fields, tags or identities changed'
    assert len(original['notes']) == EXPECTED_CARDS
    assert set(original['decks']) == set(repair['decks']), 'Portable deck ID inventory changed'
    for identifier, deck in original['decks'].items():
        for name in ('id', 'name', 'dyn', 'conf'):
            assert repair['decks'][identifier].get(name) == deck.get(name), 'Deck identity/configuration changed'
    models = check_model_contract(original['models'], repair['models'])
    archive = inspect_archive(repair_path, portable_identities(baseline_path), EXPECTED_CARDS)
    assert portable_identities(repair_path) == portable_identities(baseline_path)
    with TemporaryDirectory(prefix='italian-anki-format-repair-') as temp:
        root = Path(temp)
        existing = Collection(str(root / 'existing.anki2'))
        fresh = if_newer = None
        try:
            import_package(existing, baseline_path, notes=1)
            assert existing.card_count() == existing.note_count() == EXPECTED_CARDS
            baseline = notes_snapshot(existing, rendered=True)
            probe_count = probe_template_conditions(existing, original['models'], repair['models'])

            fresh = Collection(str(root / 'fresh.anki2'))
            fresh_log = import_package(fresh, repair_path, scheduling=True, configs=True)
            assert fresh_log['new'] == fresh.card_count() == fresh.note_count() == EXPECTED_CARDS
            assert fresh.db.scalar('SELECT count(*) FROM revlog') == 0
            media_check = fresh.media.check()
            assert not media_check.missing, 'Fresh repair import has missing media'
            check_rendered_content(baseline, notes_snapshot(fresh, rendered=True))
            assert_installed_models(fresh, repair['models'])

            seeded = seed_personal_state(existing, baseline)
            seeded.update(personalised_notes(existing, baseline))
            personal_notes = notes_snapshot(existing)
            personal_tags = tags_snapshot(existing)
            schedules = schedules_snapshot(existing)
            reviews = existing.db.all('SELECT * FROM revlog ORDER BY id')
            options = options_snapshot(existing)
            repair_log = import_package(existing, repair_path)
            assert repair_log['new'] == repair_log['updated'] == 0
            assert existing.card_count() == existing.note_count() == EXPECTED_CARDS
            assert_personal_state(existing, personal_notes, schedules, reviews, options)
            assert_personal_notes(existing, personal_notes, personal_tags)
            assert_installed_models(existing, repair['models'])
            repeat_log = import_package(existing, repair_path)
            assert repeat_log['new'] == repeat_log['updated'] == 0
            assert existing.card_count() == existing.note_count() == EXPECTED_CARDS
            assert_personal_state(existing, personal_notes, schedules, reviews, options)
            assert_personal_notes(existing, personal_notes, personal_tags)
            assert_installed_models(existing, repair['models'])

            if_newer = Collection(str(root / 'if-newer.anki2'))
            import_package(if_newer, baseline_path, notes=1)
            before_if_newer = notes_snapshot(if_newer)
            if_newer_log = import_package(if_newer, repair_path, note_types=0)
            assert if_newer_log['new'] == if_newer_log['updated'] == 0
            assert notes_snapshot(if_newer) == before_if_newer
            assert_installed_models(if_newer, repair['models'])
        finally:
            for collection in (if_newer, fresh, existing):
                if collection:
                    collection.close()
    assert digest(baseline_path) == BASELINE_SHA256, 'Read-only baseline unexpectedly changed'
    return {
        'status': 'passed', 'anki_version': importlib.metadata.version('anki'),
        'baseline_sha256': BASELINE_SHA256, 'repair_sha256': digest(repair_path),
        'cards': EXPECTED_CARDS, 'unchanged_note_field_bytes': EXPECTED_CARDS,
        'unchanged_native_front_and_back_content': EXPECTED_CARDS,
        'updated_note_types': len(models), 'note_type_names': models,
        'conditional_render_probes': probe_count, 'archive': archive,
        'seeded_personal_state': seeded, 'personal_content_tags_and_options_preserved': True,
        'recommended_import_options': {'update_notes': 'Never', 'update_note_types': 'Always',
                                       'import_learning_progress': False, 'import_deck_presets': False},
        'fresh_import': fresh_log, 'repair_import': repair_log, 'repeat_import': repeat_log,
        'note_types_if_newer_import': if_newer_log, 'missing_media': 0,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('baseline', type=Path)
    parser.add_argument('repair', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = validate(args.baseline, args.repair)
    output = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(output)
    print(output, end='')
