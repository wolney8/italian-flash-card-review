#!/usr/bin/env python3
"""Exercise a full release with native Anki, using disposable collections only.

Usage: python scripts/validate_anki_full_update.py BASELINE_MANIFEST FULL_APKG
       [--lesson9-component L9_APKG] [--report REPORT_JSON]

Requires Node, anki and zstandard. The manifest lists the released baseline
packages in import order, followed by correction overlays. All inputs are read
only. Neither a real Anki profile nor the user's browser/progress is accessed.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from contextlib import contextmanager
from dataclasses import dataclass, field
from hashlib import sha256
from html.parser import HTMLParser
import importlib.metadata
import json
from pathlib import Path
import re
import sqlite3
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from anki.collection import Collection
from anki.import_export_pb2 import ImportAnkiPackageOptions, ImportAnkiPackageRequest
from anki.scheduler_pb2 import CardAnswer
import zstandard


ROOT = Path(__file__).resolve().parents[1]
KEY_FIELDS = ('StableKey', 'Key', 'ID')
PEOPLE = ('io', 'tu', 'lui / lei / Lei', 'noi', 'voi', 'loro')
L7_GAPS = dict(zip(
    ('italian-l7-ending-' + p for p in ('io', 'tu', 'lei', 'noi', 'voi', 'loro')),
    ('lavoro', 'lavori', 'lavora', 'lavoriamo', 'lavorate', 'lavorano'),
))
SCHEDULE_COLUMNS = ('id', 'nid', 'did', 'ord', 'type', 'queue', 'due', 'ivl',
                    'factor', 'reps', 'lapses', 'left', 'odue', 'odid', 'flags', 'data')
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}
BLOCK = {'article', 'br', 'div', 'h1', 'h2', 'h3', 'li', 'p', 'section', 'td', 'th', 'tr'}


@dataclass
class Element:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def has_class(self, name):
        return name in self.attrs.get('class', '').split()

    def find(self, *, tag=None, cls=None):
        result = []
        for child in self.children:
            if isinstance(child, Element):
                if (tag is None or child.tag == tag) and (cls is None or child.has_class(cls)):
                    result.append(child)
                result.extend(child.find(tag=tag, cls=cls))
        return result

    def text(self, blocks=False):
        if self.tag in {'style', 'script'}:
            return ''
        value = ''.join(c.text(blocks) if isinstance(c, Element) else c for c in self.children)
        return ' ' + value + ' ' if blocks and self.tag in BLOCK else value


class Tree(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=True)
        self.root = Element('root')
        self.stack = [self.root]
        self.feed(value)

    def handle_starttag(self, tag, attrs):
        child = Element(tag, dict(attrs))
        self.stack[-1].children.append(child)
        if tag not in VOID:
            self.stack.append(child)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def plain(value):
    return ' '.join(Tree(value).root.text(blocks=True).split())


def media(value):
    return [(e.tag, e.attrs.get('src')) for e in Tree(value).root.find()
            if e.tag in {'img', 'audio', 'source', 'video'}]


def key_for(note):
    return next(note[name] for name in KEY_FIELDS if name in note)


def native_import(collection, package, *, schedules=False, configs=False):
    result = collection.import_anki_package(ImportAnkiPackageRequest(
        package_path=str(Path(package).resolve()),
        options=ImportAnkiPackageOptions(
            merge_notetypes=False, update_notes=1, update_notetypes=1,
            with_scheduling=schedules, with_deck_configs=configs,
        ),
    ))
    assert not result.log.conflicting, 'Native import reported conflicting notes: ' + str(package)
    return {name: len(getattr(result.log, name)) for name in ('new', 'updated', 'duplicate', 'conflicting')}


@contextmanager
def package_db(package):
    with ZipFile(package) as archive:
        member = next(name for name in ('collection.anki21b', 'collection.anki21', 'collection.anki2')
                      if name in archive.namelist())
        data = archive.read(member)
    if member.endswith('b'):
        data = zstandard.ZstdDecompressor().stream_reader(data).read()
    db = sqlite3.connect(':memory:')
    try:
        db.deserialize(data)
        yield db
    finally:
        db.close()


def portable_identities(package):
    with package_db(package) as db:
        return {(guid, ordinal): (nid, mid, cid, did) for guid, ordinal, nid, mid, cid, did in db.execute(
            'SELECT n.guid,c.ord,n.id,n.mid,c.id,c.did FROM notes n JOIN cards c ON c.nid=n.id')}


def inspect_archive(package, originals, expected_total):
    with package_db(package) as db:
        assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert db.execute('SELECT count(*) FROM notes').fetchone()[0] == expected_total
        assert db.execute('SELECT count(*) FROM cards').fetchone()[0] == expected_total
        assert db.execute('SELECT count(*) FROM revlog').fetchone()[0] == 0, 'Export contains review history'
        states = db.execute('SELECT type,queue,ivl,factor,reps,lapses,left,odue,odid,flags,data FROM cards').fetchall()
        for row in states:
            assert row[:10] == (0,) * 10, 'Export contains personal scheduling/flags: ' + str(row)
            assert json.loads(row[10] or '{}') == {}, 'Export contains personal card data'
        # Unscheduled legacy APKGs include only Anki's ordinary default preset.
        columns = {row[1] for row in db.execute('PRAGMA table_info(col)')}
        if 'dconf' in columns:
            configs = json.loads(db.execute('SELECT dconf FROM col').fetchone()[0])
            assert set(configs).issubset({'1'}), 'Export contains additional deck presets'
            if configs:
                default = configs['1']
                assert default['name'] == 'Default'
                assert default['new']['perDay'] == 20 and default['rev']['perDay'] == 200
    actual = portable_identities(package)
    for identity, values in originals.items():
        assert actual.get(identity) == values, 'Portable note/card/model/deck identity changed: ' + repr(identity)
    return {'cards': expected_total, 'portable_identities_preserved': len(originals), 'review_rows': 0}


def canonical_source():
    script = """
global.window={};
require('./study/daily-verbs.js');
require('./lesson9/content.js');
process.stdout.write(JSON.stringify({verbs:window.ItalianDailyVerbs.verbs,l9:window.ItalianLesson9}));
"""
    result = subprocess.run(['node', '-e', script], cwd=ROOT, check=True, text=True, capture_output=True)
    return json.loads(result.stdout)


def notes_snapshot(collection, *, rendered=False):
    result = {}
    for nid in collection.find_notes(''):
        note = collection.get_note(nid)
        key = key_for(note)
        assert key not in result, 'Duplicate stable key: ' + key
        cards = note.cards()
        assert len(cards) == 1, 'Unexpected extra template/card: ' + key
        result[key] = {
            'note_id': note.id, 'guid': note.guid, 'model_id': note.mid,
            'fields': dict(note.items()), 'card_id': cards[0].id, 'ordinal': cards[0].ord,
        }
        if rendered:
            result[key]['question'] = cards[0].question()
            result[key]['answer'] = cards[0].answer()
    return result


def schedules_snapshot(collection):
    return {row[0]: tuple(row) for row in collection.db.all(
        'SELECT ' + ','.join(SCHEDULE_COLUMNS) + ' FROM cards ORDER BY id')}


def options_snapshot(collection):
    configs = {c['id']: c for c in collection.decks.all_config()}
    assignments = {d['id']: d.get('conf') for d in collection.decks.all() if not d['dyn']}
    return configs, assignments


def seed_personal_state(collection, baseline):
    """Use native scheduler operations, not fabricated revlog rows."""
    by_model = defaultdict(list)
    for key, row in sorted(baseline.items()):
        by_model[row['model_id']].append(row['card_id'])
    selected = [cid for ids in by_model.values() for cid in ids[:4]]
    ratings = (CardAnswer.EASY, CardAnswer.GOOD, CardAnswer.AGAIN, CardAnswer.HARD)
    for index, cid in enumerate(selected):
        card = collection.get_card(cid)
        card.start_timer()
        states = collection._backend.get_scheduling_states(cid=cid)
        collection.sched.answer_card(collection.sched.build_answer(
            card=card, states=states, rating=ratings[index % len(ratings)]))
    # One lapse, two suspended cards and a flag exercise more than new/review queues.
    lapse = collection.get_card(selected[0])
    lapse.start_timer()
    collection.sched.answer_card(collection.sched.build_answer(
        card=lapse, states=collection._backend.get_scheduling_states(cid=lapse.id), rating=CardAnswer.AGAIN))
    collection.sched.suspend_cards(selected[-2:])
    flagged = collection.get_card(selected[1])
    flagged.flags = 3
    collection.update_card(flagged)
    config = collection.decks.add_config('Regression only: personal options')
    config['new']['perDay'], config['rev']['perDay'] = 17, 93
    config['timer'], config['autoplay'] = 1, False
    collection.decks.update_config(config)
    for deck in collection.decks.all():
        if not deck['dyn']:
            collection.decks.set_config_id_for_deck_dict(deck, config['id'])
            collection.decks.update_dict(deck)
    assert collection.db.scalar('SELECT count(*) FROM revlog') == len(selected) + 1
    assert {0, 1, 2, -1}.issubset({r[0] for r in collection.db.all('SELECT DISTINCT queue FROM cards')})
    return {'review_rows': len(selected) + 1, 'reviewed_cards': len(selected), 'personal_preset_id': config['id']}


def assert_personal_state(collection, notes, schedules, reviews, options):
    current = notes_snapshot(collection)
    for key, old in notes.items():
        assert key in current, 'Existing note disappeared: ' + key
        for name in ('note_id', 'guid', 'model_id', 'card_id', 'ordinal'):
            assert current[key][name] == old[name], 'Existing ' + name + ' changed: ' + key
    now = schedules_snapshot(collection)
    for cid, previous in schedules.items():
        assert now[cid] == previous, 'Existing scheduling/flags/card data changed: ' + str(cid)
    assert collection.db.all('SELECT * FROM revlog ORDER BY id') == reviews, 'Review history changed'
    configs, assignments = options_snapshot(collection)
    for identifier, config in options[0].items():
        assert configs[identifier] == config, 'Personal deck preset changed: ' + str(identifier)
    for identifier, config_id in options[1].items():
        assert assignments[identifier] == config_id, 'Existing deck preset assignment changed: ' + str(identifier)


def check_existing_content(before, after):
    for key, old in before.items():
        new = after[key]
        assert media(new['question']) == media(old['question']), 'Front media changed: ' + key
        if key in L7_GAPS:
            word = L7_GAPS[key]
            expected_prompt = old['fields']['Prompt'].replace(
                'Choose the regular -ARE ending:', 'Complete the regular -ARE verb:').replace(
                'Give the ending only.', 'Try the whole word. The missing ending is also accepted.')
            assert new['fields']['Prompt'] == expected_prompt, 'Wrong whole-word encouragement: ' + key
            assert plain(new['fields']['Answer']) == word
            assert word not in plain(new['question']).lower(), 'Full gap answer leaked on front: ' + key
            alternative = Tree(new['fields']['Extra']).root.find(cls='anki-answer-alternative')
            assert len(alternative) == 1
            expected_ending = plain(old['fields']['Answer'])
            accepted = [e.text() for e in alternative[0].find(tag='span')]
            assert expected_ending in accepted and expected_ending.lstrip('-') in accepted
        else:
            assert plain(new['question']) == plain(old['question']), 'Front text changed: ' + key
        for name, value in old['fields'].items():
            assert name in new['fields'], 'Field removed: ' + key + ' / ' + name
            if name in ('Pattern', 'Rule') or key in L7_GAPS and name in ('Prompt', 'Answer', 'Extra'):
                continue
            if name in ('Answer', 'Italian', 'SoundNote'):
                assert plain(new['fields'][name]) == plain(value), 'Model answer text changed: ' + key
                assert media(new['fields'][name]) == media(value), 'Existing field media changed: ' + key
            else:
                assert new['fields'][name] == value, 'Unapproved field change: ' + key + ' / ' + name
    return {'unchanged_fronts': len(before) - len(L7_GAPS), 'whole_word_gap_cards': len(L7_GAPS)}


def assert_form(element, verb, index, context):
    assert element.text().lower() == verb['forms'][index].lower(), 'Wrong/malformed full form: ' + context
    endings, infixes = element.find(cls='verb-ending'), element.find(cls='verb-infix')
    if verb['kind'] != 'regular':
        assert not endings and not infixes, 'Irregular form falsely split: ' + context
        return
    part = verb['parts'][index]
    has_infix = bool(verb.get('isc') and index in (0, 1, 2, 5))
    stem = part['stem'][:-3] if has_infix else part['stem']
    assert [e.text().lower() for e in element.find(cls='verb-stem')] == [stem.lower()], 'Stem missing/wrong: ' + context
    assert [e.text() for e in endings] == [part['ending']], 'Person ending missing/wrong: ' + context
    assert [e.text() for e in infixes] == (['isc'] if has_infix else []), 'ISC infix missing/wrong: ' + context


def check_references(notes, catalogue):
    by_name = {v['name']: v for v in catalogue}
    references, old_references = Counter(), Counter()
    for key, record in notes.items():
        for name in ('Pattern', 'Rule', 'SoundNote'):
            if name not in record['fields']:
                continue
            tree = Tree(record['fields'][name]).root
            for reference in tree.find(cls='anki-verb-reference'):
                verb = by_name[reference.attrs['data-verb-reference']]
                bodies = reference.find(tag='tbody')
                assert len(bodies) == 1, 'Ambiguous reference table: ' + key
                rows = bodies[0].find(tag='tr')
                assert len(rows) == 6, 'Reference omits plural/singular rows: ' + key
                assert not reference.find(tag='details'), 'Reference hides plural rows: ' + key
                for i, row in enumerate(rows):
                    assert row.find(tag='th')[0].text() == PEOPLE[i], 'Incorrect person order: ' + key
                    assert_form(row.find(tag='td')[0], verb, i, key + '/' + verb['name'] + '/' + PEOPLE[i])
                references[verb['name']] += 1
            for group in tree.find(cls='l7-form-list'):
                rows = group.find(cls='l7-form-row')
                assert len(rows) == 6, 'Existing reference omits plural/singular rows: ' + key
                cells = [[e for e in row.children if isinstance(e, Element)] for row in rows]
                # Some released rows end with pronunciation; the ending drills
                # instead place the full form after a separate ending column.
                verbs = [v for v in catalogue if all(
                    sum(cell.text().strip().lower() == v['forms'][i].lower() for cell in row[1:]) == 1
                    for i, row in enumerate(cells))]
                assert len(verbs) == 1, 'Existing reference no longer matches canonical forms: ' + key
                verb = verbs[0]
                for i, cell in enumerate(cells):
                    assert cell[0].text().lower() in (PEOPLE[i].lower(), 'lui / lei' if i == 2 else PEOPLE[i])
                    form_cell = next(c for c in cell[1:] if c.text().strip().lower() == verb['forms'][i].lower())
                    assert_form(form_cell, verb, i, key + '/' + verb['name'] + '/' + PEOPLE[i])
                old_references[verb['name']] += 1
    totals = references + old_references
    for verb in ('finire', 'prendere', 'essere', 'fare', 'lavorare'):
        assert totals[verb] > 0, 'Missing full reference coverage for ' + verb
    return {'new_reference_tables': sum(references.values()), 'retained_six_row_references': sum(old_references.values()),
            'verbs': dict(sorted(totals.items()))}


def check_lesson9(notes, source, models):
    canonical = {c['key']: c for c in source['cards']}
    actual = {k: v for k, v in notes.items() if k.startswith('l9-')}
    assert set(actual) == set(canonical) and len(actual) == 22, 'Lesson 9 key inventory differs'
    for key, row in actual.items():
        card, fields = canonical[key], row['fields']
        assert fields['Panel'] == card['panel'] and fields['Prompt'] == card['prompt'], 'Lesson 9 front changed: ' + key
        assert plain(fields['Answer']) == plain(card['answer']), 'Lesson 9 model answer changed: ' + key
        model = models[row['model_id']]
        assert model['name'] == 'Italian Course - Lesson 9 Recall v1'
        assert [f['name'] for f in model['flds']] == [
            'StableKey', 'Lesson', 'Topic', 'Panel', 'Prompt', 'Answer', 'Pronunciation', 'NaturalEnglish',
            'Literal', 'Usage', 'Pattern', 'Extra', 'CourseSource', 'PronunciationStatus']
        assert len(model['tmpls']) == 1
        assert set(re.findall(r'{{([^{}]+)}}', model['tmpls'][0]['qfmt'])) == {'Lesson', 'Panel', 'Prompt'}, 'Answer/support field leaks on L9 front'
        front = Tree(row['question']).root
        assert not front.find(cls='anki-verb-reference') and not front.find(cls='verb-ending')
        references = Tree(fields['Pattern']).root.find(cls='anki-verb-reference')
        assert len(references) == (0 if key == 'l9-rule-subject-omission' else 1)
    return {'cards': len(actual), 'model_sentences': sum(k.startswith('l9-sentence-') for k in actual),
            'rule_cards': sum(k.startswith('l9-rule-') for k in actual), 'fronts_match_source': True}


def check_colours(notes, models):
    used_models = {row['model_id'] for row in notes.values() if any(
        Tree(value).root.find(cls='verb-ending') for value in row['fields'].values())}
    for mid in used_models:
        css = models[mid]['css']
        blocks = re.findall(r'/\* Italian shared verb display: start \*/(.*?)/\* Italian shared verb display: end \*/', css, re.S)
        assert len(blocks) == 1, 'Shared light/dark palette missing or repeated: ' + models[mid]['name']
        for colour in ('#285d47', '#8b4d15', '#bcd4bd', '#f0c58b'):
            assert colour in blocks[0], 'Inconsistent verb palette: ' + models[mid]['name']
        assert '.nightMode .verb-ending' in blocks[0] and '.night_mode .verb-ending' in blocks[0]
        assert '.card .verb-ending, .card .verb-infix' in blocks[0], 'Endings/infix must share a colour'
    assert used_models, 'No coloured model answers/reference forms found'
    return {'models_with_shared_light_dark_palette': len(used_models)}


def validate(manifest_path, package, lesson9_component=None, shared_presentation=False):
    manifest = json.loads(manifest_path.read_text())
    old_count, new_count = manifest['expected_existing_cards'], manifest['expected_new_cards']
    total = old_count + new_count
    assert (old_count, new_count) == (857, 22), 'Unexpected released inventory'
    originals = {}
    for entry in manifest['baseline'] + manifest.get('overlays', []):
        assert sha256(Path(entry['path']).read_bytes()).hexdigest() == entry['sha256'], 'Baseline hash mismatch: ' + entry['label']
    for entry in manifest['baseline']:
        identities = portable_identities(entry['path'])
        assert not originals.keys() & identities.keys(), 'Duplicate original card identity'
        originals.update(identities)
    assert len(originals) == old_count
    if lesson9_component:
        identities = portable_identities(lesson9_component)
        assert len(identities) == new_count and not originals.keys() & identities.keys()
        originals.update(identities)
    archive = inspect_archive(package, originals, total)
    source = canonical_source()
    with TemporaryDirectory(prefix='italian-anki-regression-') as tmp:
        root = Path(tmp)
        old = Collection(str(root / 'existing.anki2'))
        fresh = None
        try:
            for entry in manifest['baseline'] + manifest.get('overlays', []):
                native_import(old, entry['path'])
            assert old.note_count() == old.card_count() == old_count
            baseline = notes_snapshot(old, rendered=True)
            baseline_models = {m['id']: m for m in old.models.all()}
            assert sum(r['model_id'] == 2061006931 for r in baseline.values()) == 120, 'L2/L3 unused-model collision damaged L3'
            seeded = seed_personal_state(old, baseline)
            schedules = schedules_snapshot(old)
            reviews = old.db.all('SELECT * FROM revlog ORDER BY id')
            options = options_snapshot(old)

            fresh = Collection(str(root / 'fresh.anki2'))
            fresh_log = native_import(fresh, package, schedules=True, configs=True)
            assert fresh.note_count() == fresh.card_count() == total
            assert fresh.db.scalar('SELECT count(*) FROM revlog') == 0
            assert fresh.db.scalar('SELECT count(*) FROM cards WHERE type!=0 OR queue!=0 OR reps!=0 OR lapses!=0') == 0
            media_check = fresh.media.check()
            assert not media_check.missing, 'Fresh import has missing media: ' + repr(list(media_check.missing))
            updated = notes_snapshot(fresh, rendered=True)
            assert set(updated) - set(baseline) == {c['key'] for c in source['l9']['cards']}
            models = {m['id']: m for m in fresh.models.all()}
            if shared_presentation:
                from anki_card_presentation import apply_card_presentation, CSS_START, CSS_END
                for mid in {row['model_id'] for row in updated.values()}:
                    assert models[mid]['css'].count(CSS_START) == models[mid]['css'].count(CSS_END) == 1, 'Missing shared presentation'
                    assert apply_card_presentation(models[mid]) == models[mid], 'Shared presentation differs from the exporter contract'
            for mid in {r['model_id'] for r in baseline.values()}:
                assert [f['name'] for f in models[mid]['flds']] == [f['name'] for f in baseline_models[mid]['flds']], 'Existing field schema changed'
                expected_model = (apply_card_presentation(baseline_models[mid])
                                  if shared_presentation else baseline_models[mid])
                for name in ('qfmt', 'afmt'):
                    assert [t[name] for t in models[mid]['tmpls']] == [t[name] for t in expected_model['tmpls']], 'Existing template differs from its exact expected presentation'
            content = check_existing_content(baseline, updated)
            l9 = check_lesson9(updated, source['l9'], models)
            references = check_references(updated, source['verbs'])
            colours = check_colours(updated, models)

            update_log = native_import(old, package)
            assert old.note_count() == old.card_count() == total and update_log['new'] == new_count
            assert_personal_state(old, baseline, schedules, reviews, options)
            upgraded = notes_snapshot(old)
            for key in updated:
                assert upgraded[key]['fields'] == updated[key]['fields'], 'Updated collection missed release content: ' + key
            repeat_schedules = schedules_snapshot(old)
            repeat_options = options_snapshot(old)
            repeat_log = native_import(old, package)
            assert old.note_count() == old.card_count() == total and repeat_log['new'] == 0
            assert_personal_state(old, upgraded, repeat_schedules, reviews, repeat_options)
            repeated = notes_snapshot(old)
            assert repeated == upgraded, 'Second import changed identity/content or created duplicates'
        finally:
            if fresh:
                fresh.close()
            old.close()
    return {
        'status': 'passed', 'anki_version': importlib.metadata.version('anki'),
        'package_sha256': sha256(package.read_bytes()).hexdigest(),
        'baseline_cards': old_count, 'fresh_cards': total, 'new_lesson9_cards': new_count,
        'existing_native_identities_and_scheduling_preserved': old_count,
        'seeded_personal_state': seeded, 'personal_options_preserved': True,
        'fresh_import': fresh_log, 'existing_collection_update': update_log,
        'second_import': repeat_log, 'archive': archive, 'content': content,
        'lesson9': l9, 'references': references, 'colours': colours,
        'fresh_import_missing_media': 0,
        'shared_presentation_verified': shared_presentation,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('package', type=Path)
    parser.add_argument('--lesson9-component', type=Path)
    parser.add_argument('--report', type=Path)
    parser.add_argument('--shared-presentation', action='store_true',
                        help='Require the exact shared card presentation; preserve all other validation gates')
    args = parser.parse_args()
    report = validate(args.manifest, args.package, args.lesson9_component, args.shared_presentation)
    output = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(output)
    print(output, end='')
