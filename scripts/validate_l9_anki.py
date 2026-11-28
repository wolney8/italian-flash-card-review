#!/usr/bin/env python3
"""Verify Lesson 9's source parity, note identities and unscheduled APKG export.

Run with the same native Anki Python environment used by lesson9/build_anki.py.
Native fresh/repeat/full-course import tests are a separate release gate.
"""
from argparse import ArgumentParser
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('lesson9_anki_build', ROOT / 'lesson9' / 'build_anki.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class VisibleText(HTMLParser):
    def __init__(self, ignore_references=False):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.ignore_references = ignore_references
        self.skipped_depth = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if self.skipped_depth:
            if tag not in {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr'}:
                self.skipped_depth += 1
            return
        if self.ignore_references and 'anki-verb-reference' in attributes.get('class', '').split():
            self.skipped_depth = 1
            return
        if tag in {'p', 'div', 'br', 'tr', 'td', 'th', 'section', 'article', 'h1', 'h2', 'h3'}:
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if self.skipped_depth:
            self.skipped_depth -= 1
            return
        if tag in {'p', 'div', 'tr', 'td', 'th', 'section', 'article', 'h1', 'h2', 'h3'}:
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.skipped_depth:
            self.parts.append(data)


def plain(value, ignore_references=False):
    parser = VisibleText(ignore_references)
    parser.feed(value)
    return ' '.join(''.join(parser.parts).split())


def validate(package, reference_package=None):
    source_hash = sha256(build.SOURCE.read_bytes()).hexdigest()
    source = build.load_source()
    canonical = {card['key']: card for card in source['cards']}
    displays = build.display_records(source)
    expected = {key: build.note_values(card, displays[key]) for key, card in canonical.items()}
    database, member = build.read_package_db(package)
    try:
        assert database.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert database.execute('SELECT count(*) FROM notes').fetchone()[0] == 22
        assert database.execute('SELECT count(*) FROM cards').fetchone()[0] == 22
        assert database.execute('SELECT count(*) FROM revlog').fetchone()[0] == 0
        models = json.loads(database.execute('SELECT models FROM col').fetchone()[0])
        assert len(models) == 1, 'Lesson 9 component must contain only its dedicated note type'
        model = next(iter(models.values()))
        assert int(model['id']) == build.MODEL_ID
        assert model['name'] == build.MODEL_NAME
        assert tuple(field['name'] for field in model['flds']) == build.FIELDS
        assert model['sortf'] == 0
        assert len(model['tmpls']) == 1 and model['tmpls'][0]['ord'] == 0
        sys.path.insert(0, str(ROOT / 'scripts'))
        from anki_card_presentation import (
            CARD_PRESENTATION_CSS, CSS_END, CSS_START, apply_card_presentation,
        )
        from anki_verb_display import VERB_DISPLAY_CSS
        # The canonical field order and conditionals remain the source of
        # truth; the shared adapter adds presentation wrappers to that layout.
        canonical_layout = apply_card_presentation({
            'id': build.MODEL_ID, 'css': '',
            'tmpls': [{'qfmt': build.FRONT, 'afmt': build.BACK}],
        })
        assert model['tmpls'][0]['qfmt'] == canonical_layout['tmpls'][0]['qfmt']
        assert model['tmpls'][0]['afmt'] == canonical_layout['tmpls'][0]['afmt']
        for side, original in (('qfmt', build.FRONT), ('afmt', build.BACK)):
            assert re.findall(r'{{.*?}}', model['tmpls'][0][side], re.S) == re.findall(r'{{.*?}}', original, re.S)
        assert '{{Answer}}' not in model['tmpls'][0]['qfmt']
        assert '{{Pattern}}' not in model['tmpls'][0]['qfmt']
        assert '{{NaturalEnglish}}' not in model['tmpls'][0]['qfmt']
        assert 'LESSON 7' not in model['tmpls'][0]['qfmt']
        assert 'LESSON 7' not in model['tmpls'][0]['afmt']
        if reference_package:
            assert model['css'].startswith(build.reference_css(reference_package)), 'Released card styling was not retained'
        assert VERB_DISPLAY_CSS in model['css'], 'Shared colour/display stylesheet missing'
        assert model['css'].count(CSS_START) == model['css'].count(CSS_END) == 1
        assert CARD_PRESENTATION_CSS.rstrip() in model['css'], 'Current shared card presentation missing'
        assert apply_card_presentation(model) == model, 'Shared card presentation is not idempotent'
        decks = json.loads(database.execute('SELECT decks FROM col').fetchone()[0])
        rows = database.execute('''SELECT n.id,n.guid,n.mid,n.flds,c.id,c.did,c.ord,c.type,c.queue,c.ivl,c.reps,c.lapses,c.odid,c.odue
                                   FROM notes n JOIN cards c ON c.nid=n.id''').fetchall()
        seen = set()
        topics = Counter()
        reference_count = 0
        for nid, note_guid, mid, fields, cid, did, ordinal, kind, queue, interval, reps, lapses, original_deck, original_due in rows:
            values = fields.split('\x1f')
            assert len(values) == len(build.FIELDS)
            record = dict(zip(build.FIELDS, values))
            key = record['StableKey']
            assert key in canonical and key not in seen, 'Unexpected or duplicate Lesson 9 key: ' + key
            seen.add(key)
            card = canonical[key]
            assert nid == build.note_id(key) and cid == build.card_id(key)
            assert note_guid == build.guid(key)
            assert mid == build.MODEL_ID and ordinal == 0
            assert (kind, queue, interval, reps, lapses, original_deck, original_due) == (0, 0, 0, 0, 0, 0, 0)
            assert did == build.ident('italian-l9-deck:' + card['deck'])
            assert decks[str(did)]['name'] == build.PARENT + '::' + card['deck']
            assert record == expected[key], 'Export fields differ from canonical/display contract: ' + key
            # Independent original-text checks ensure the formatter cannot silently
            # change a model answer or replace a front with an answer-bearing cue.
            assert record['Panel'] == card['panel']
            assert record['Prompt'] == card['prompt']
            assert plain(record['Answer']) == plain(card['answer']), 'Changed answer text: ' + key
            assert plain(record['Pattern'], ignore_references=True) == plain(card['pattern']), 'Changed original explanation: ' + key
            assert record['Pronunciation'] == card['pron'] == ''
            assert record['PronunciationStatus'] == ''
            assert record['NaturalEnglish'] == card['meaning']
            assert record['Literal'] == card['literal']
            assert record['Usage'] == card['usage']
            assert record['Extra'] == card['clarification']
            assert record['CourseSource'] == card['reference']
            if key != 'l9-rule-subject-omission':
                verb = next((example['verb'] for example in source['examples']
                             if key == 'l9-sentence-' + example['verb'] + '-' + example['id']), 'prendere')
                assert record['Pattern'].count('data-verb-reference="' + verb + '"') == 1
                reference_rows = re.findall(r'<tbody>(.*?)</tbody>', record['Pattern'], re.S)
                assert len(reference_rows) == 1 and reference_rows[0].count('<tr>') == 6
                reference_text = plain(record['Pattern'])
                for form in source['forms'][verb]:
                    assert re.search(r'(?<!\w)' + re.escape(form) + r'(?!\w)', reference_text), 'Missing full reference form: ' + key + ' / ' + form
                for person in ('io', 'tu', 'lui', 'lei', 'Lei', 'noi', 'voi', 'loro'):
                    assert re.search(r'(?<!\w)' + person + r'(?!\w)', reference_text), 'Missing reference person: ' + key + ' / ' + person
                reference_count += 1
            topics[card['deck']] += 1
        assert seen == set(canonical)
        assert topics == Counter(build.TOPIC_COUNTS)
        assert reference_count == 21
        assert sha256(build.SOURCE.read_bytes()).hexdigest() == source_hash
        registry_file = Path(package).with_suffix('.identities.json')
        registry = json.loads(registry_file.read_text())
        assert registry['package_sha256'] == sha256(Path(package).read_bytes()).hexdigest()
        assert registry['source_sha256'] == source_hash
        assert {row['key'] for row in registry['identities']} == set(canonical)
        return {'status': 'passed', 'notes': 22, 'cards': 22, 'patterns': 6, 'model_sentences': 16,
                'full_references': reference_count, 'stable_identities': 22, 'review_rows': 0,
                'source_unchanged': True, 'shared_presentation': True,
                'database': member, 'model_id': build.MODEL_ID,
                'package_sha256': registry['package_sha256']}
    finally:
        database.close()


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('package', type=Path)
    parser.add_argument('--reference-package', type=Path)
    args = parser.parse_args()
    print(json.dumps(validate(args.package, args.reference_package), ensure_ascii=False))
