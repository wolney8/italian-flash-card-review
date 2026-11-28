#!/usr/bin/env python3
"""Export the 22 reviewed Lesson 9 notes from the website's canonical records.

The note type uses the released Lesson 7 field layout, with a dedicated stable
Lesson 9 identity. No existing collection or review history is read or changed.
The optional released reference package supplies the exact existing card CSS.
"""
from argparse import ArgumentParser
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'lesson9' / 'content.js'
PARENT = 'Italian - Lesson 9 - Regular ERE Verbs and Everyday Sentences'
MODEL_NAME = 'Italian Course - Lesson 9 Recall v1'
FIELDS = (
    'StableKey', 'Lesson', 'Topic', 'Panel', 'Prompt', 'Answer',
    'Pronunciation', 'NaturalEnglish', 'Literal', 'Usage', 'Pattern',
    'Extra', 'CourseSource', 'PronunciationStatus',
)
TOPIC_COUNTS = {'01 -ERE Patterns': 6, '02 Laura’s Model Sentences': 16}
FRONT = '<article class="l7-card"><div class="l7-kicker">{{Lesson}} · RECALL</div>{{Panel}}{{Prompt}}</article>'
BACK = '''<article class="l7-card"><div class="l7-kicker">{{Lesson}} · ANSWER</div>
<div class="l9-answer">{{Answer}}</div>{{#Pronunciation}}{{Pronunciation}}{{/Pronunciation}}
{{#NaturalEnglish}}<div class="section"><div class="label">Natural English</div>{{NaturalEnglish}}</div>{{/NaturalEnglish}}
{{#Literal}}<div class="section"><div class="label">Literal construction</div>{{Literal}}</div>{{/Literal}}
{{#Usage}}<div class="section"><div class="label">Use / word jobs</div>{{Usage}}</div>{{/Usage}}
{{#Pattern}}<div class="section"><div class="label">Rule / forms</div>{{Pattern}}</div>{{/Pattern}}
{{#Extra}}<details class="extra"><summary>Memory aid and extra information</summary><div class="inside">{{Extra}}</div></details>{{/Extra}}
<details class="extra"><summary>Course source</summary><div class="inside">{{CourseSource}}{{#PronunciationStatus}}<br>{{PronunciationStatus}}{{/PronunciationStatus}}</div></details></article>'''
LAYOUT_CSS = '''
.card{font-size:19px}.l7-card{max-width:760px;margin:0 auto;text-align:left;overflow-wrap:anywhere}
.l7-card .panel-title{font-size:1.3em}.l7-card .focus{font-size:1.25em}
.l7-kicker{font-size:.75em;letter-spacing:.12em;opacity:.75;margin-bottom:14px}
.l7-card p{line-height:1.5}.l9-answer{font-size:1.7em;line-height:1.35;margin-bottom:8px}
.l9-answer-it{color:var(--green);font-style:italic}.l9-answer-en{color:var(--ink);font-style:normal;font-size:.78em}
.l7-form-row>span:last-child{font-size:.9em}
'''


def ident(label, base=1_600_000_000, span=400_000_000):
    """Keep stable identifiers within the existing course's positive ranges."""
    return base + int(sha256(label.encode()).hexdigest()[:15], 16) % span


MODEL_ID = ident('italian-course-lesson9-recall-v1')
PARENT_ID = ident('italian-l9-deck:parent')


def note_id(key):
    return ident(key + ':note', 1_800_000_000_000, 500_000_000_000)


def card_id(key):
    return ident(key + ':card', 2_400_000_000_000, 500_000_000_000)


def guid(key):
    from anki.utils import base91
    return base91(int.from_bytes(sha256(key.encode()).digest()[:8], 'big'))


def load_source():
    """Execute the same CommonJS payload that supplies the live website."""
    result = subprocess.run(
        ['node', '-e', "process.stdout.write(JSON.stringify(require('./lesson9/content.js')))"],
        cwd=ROOT, check=True, capture_output=True, text=True,
    )
    source = json.loads(result.stdout)
    cards = source['cards']
    keys = [card['key'] for card in cards]
    if len(cards) != 22 or len(set(keys)) != 22:
        raise ValueError('Lesson 9 must contain exactly 22 distinct canonical cards')
    if Counter(card['deck'] for card in cards) != Counter(TOPIC_COUNTS):
        raise ValueError('Expected six pattern cards and sixteen Laura sentence cards')
    if any(card['lesson'] != 'L9' or not card['key'].startswith('l9-') for card in cards):
        raise ValueError('Unexpected lesson identity in the canonical records')
    return source


def read_package_db(package):
    with ZipFile(package) as archive:
        member = 'collection.anki21' if 'collection.anki21' in archive.namelist() else 'collection.anki2'
        database = sqlite3.connect(':memory:')
        database.deserialize(archive.read(member))
    return database, member


def reference_css(package=None):
    if package:
        database, _ = read_package_db(package)
        try:
            models = json.loads(database.execute('SELECT models FROM col').fetchone()[0])
            matching = [model for model in models.values()
                        if tuple(field['name'] for field in model['flds']) == FIELDS
                        and len(model['tmpls']) == 1]
            if len(matching) != 1:
                raise ValueError('Released reference must contain one matching 14-field recall model')
            return matching[0]['css']
        finally:
            database.close()
    return ((ROOT / 'lesson7' / 'tools' / 'anki-base.css').read_text()
            + '\n' + (ROOT / 'lesson7' / 'styles.css').read_text())


def display_records(source):
    """Add back-only presentation while preserving every canonical field's text."""
    sys.path.insert(0, str(ROOT / 'scripts'))
    from anki_verb_display import format_verb_displays
    examples = {'l9-sentence-' + example['verb'] + '-' + example['id']: example
                for example in source['examples']}
    records = []
    for card in source['cards']:
        record = {'key': card['key'], 'pattern': card['pattern'], 'answer': card['answer'],
                  'answerLanguage': 'en' if card['key'] == 'l9-rule-subject-omission' else 'it'}
        if card['key'] in examples:
            example = examples[card['key']]
            record.update(verb=example['verb'], targetForm=source['forms'][example['verb']][example['person']],
                          referenceVerbs=[example['verb']])
        elif card['key'] != 'l9-rule-subject-omission':
            record.update(verb='prendere', referenceVerbs=['prendere'])
        records.append(record)
    formatted = format_verb_displays(records)
    if [record['key'] for record in formatted] != [card['key'] for card in source['cards']]:
        raise ValueError('Display formatting changed the canonical order or identities')
    return {record['key']: record for record in formatted}


def note_values(card, display):
    language = 'en' if card['key'] == 'l9-rule-subject-omission' else 'it'
    answer_display = display['answer']
    if card['key'] == 'l9-rule-stem':
        answer_display = '<span class="verb-stem">' + answer_display + '</span>'
    elif card['key'].startswith(('l9-rule-ending-', 'l9-rule-endings-')):
        answer_display = '<span class="verb-ending">' + answer_display + '</span>'
    answer = '<span class="l9-answer-' + language + '" lang="' + language + '">' + answer_display + '</span>'
    return {
        'StableKey': card['key'], 'Lesson': card['lesson'], 'Topic': card['deck'],
        'Panel': card['panel'], 'Prompt': card['prompt'], 'Answer': answer,
        'Pronunciation': card['pron'], 'NaturalEnglish': card['meaning'],
        'Literal': card['literal'], 'Usage': card['usage'], 'Pattern': display['pattern'],
        'Extra': card['clarification'], 'CourseSource': card['reference'], 'PronunciationStatus': '',
    }


def make_deck(collection, name, deck_id):
    record = collection.decks.new_deck_legacy(False)
    record.update(id=deck_id, name=name)
    collection.decks.update(record)
    return record['id']


def portable_ids(source_package, destination, cards):
    """Stabilise new-note numeric IDs without importing any scheduling data."""
    by_key = {card['key']: card for card in cards}
    database, member = read_package_db(source_package)
    try:
        rows = database.execute('SELECT n.id,n.guid,n.flds,c.id,c.ord FROM notes n JOIN cards c ON c.nid=n.id').fetchall()
        if len(rows) != 22 or database.execute('SELECT count(*) FROM revlog').fetchone()[0]:
            raise ValueError('Unexpected card count or review history in the new Lesson 9 export')
        with database:
            database.execute('UPDATE cards SET id=-id,nid=-nid')
            database.execute('UPDATE notes SET id=-id')
            for old_note, note_guid, fields, old_card, ordinal in rows:
                key = fields.split('\x1f')[0]
                if key not in by_key or note_guid != guid(key) or ordinal != 0:
                    raise ValueError('Unexpected exported Lesson 9 note identity')
                database.execute('UPDATE notes SET id=? WHERE id=?', (note_id(key), -old_note))
                database.execute('UPDATE cards SET id=?,nid=? WHERE id=?', (card_id(key), note_id(key), -old_card))
        if database.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise ValueError('Invalid package database after assigning stable identities')
        if database.execute('SELECT count(*) FROM cards WHERE type<>0 OR queue<>0 OR reps<>0 OR lapses<>0 OR ivl<>0 OR odid<>0 OR odue<>0').fetchone()[0]:
            raise ValueError('Lesson 9 export must contain only unscheduled new cards')
        with ZipFile(source_package) as source_zip, ZipFile(destination, 'w', ZIP_DEFLATED) as target_zip:
            for entry in source_zip.infolist():
                target_zip.writestr(entry, database.serialize() if entry.filename == member else source_zip.read(entry.filename))
    finally:
        database.close()


def build(output, reference_package=None):
    from anki.collection import Collection, NoteIdsLimit
    from anki.import_export_pb2 import ExportAnkiPackageOptions
    sys.path.insert(0, str(ROOT / 'scripts'))
    from anki_verb_display import VERB_DISPLAY_CSS
    from anki_card_presentation import apply_card_presentation
    source_bytes = SOURCE.read_bytes()
    source = load_source()
    displays = display_records(source)
    output = output.expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    deck_ids = {topic: ident('italian-l9-deck:' + topic) for topic in TOPIC_COUNTS}
    with TemporaryDirectory() as folder:
        workspace = Path(folder)
        collection = Collection(str(workspace / 'collection.anki2'))
        try:
            model = collection.models.new(MODEL_NAME)
            model.update(id=MODEL_ID, css=reference_css(reference_package) + '\n' + LAYOUT_CSS + '\n' + VERB_DISPLAY_CSS, sortf=0)
            for name in FIELDS:
                field = collection.models.new_field(name)
                field['id'] = ident('italian-l9-field:' + name)
                collection.models.add_field(model, field)
            template = collection.models.new_template('Recall')
            template.update(id=ident('italian-l9-template:recall'), qfmt=FRONT, afmt=BACK)
            collection.models.add_template(model, template)
            model = apply_card_presentation(model)
            collection.models.update(model)
            collection.models.update(model, preserve_usn=False)
            make_deck(collection, PARENT, PARENT_ID)
            for topic, deck_id in deck_ids.items():
                make_deck(collection, PARENT + '::' + topic, deck_id)
            notes = []
            for card in source['cards']:
                note = collection.new_note(model)
                note.guid = guid(card['key'])
                for name, value in note_values(card, displays[card['key']]).items():
                    note[name] = value
                note.tags = ['Italian', 'Lesson9', 'Lesson9::' + ('ModelSentences' if card['key'].startswith('l9-sentence-') else 'Patterns')]
                collection.add_note(note, deck_ids[card['deck']])
                notes.append(note.id)
            temporary_package = workspace / 'native.apkg'
            collection.export_anki_package(
                out_path=str(temporary_package), limit=NoteIdsLimit(notes),
                options=ExportAnkiPackageOptions(with_scheduling=False, with_media=False, with_deck_configs=False, legacy=True),
            )
        finally:
            collection.close()
        portable_ids(temporary_package, output, source['cards'])
    if SOURCE.read_bytes() != source_bytes:
        raise ValueError('Canonical source changed during the export')
    registry = {
        'schema': 1, 'component': 'Lesson9', 'notes': 22, 'cards': 22, 'model_id': MODEL_ID,
        'model_name': MODEL_NAME, 'fields': list(FIELDS), 'parent_deck_id': PARENT_ID, 'decks': deck_ids,
        'source': 'lesson9/content.js', 'source_sha256': sha256(source_bytes).hexdigest(),
        'package': output.name, 'package_sha256': sha256(output.read_bytes()).hexdigest(),
        'with_scheduling': False, 'reference_package_sha256': sha256(Path(reference_package).read_bytes()).hexdigest() if reference_package else None,
        'identities': [{'key': card['key'], 'note_id': note_id(card['key']), 'card_id': card_id(card['key']),
                        'guid': guid(card['key']), 'deck_id': deck_ids[card['deck']], 'topic': card['deck']}
                       for card in source['cards']],
    }
    registry_path = output.with_suffix('.identities.json')
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
    return {'file': str(output), 'registry': str(registry_path), 'notes': 22, 'cards': 22,
            'model_id': MODEL_ID, 'fields': list(FIELDS), 'sha256': registry['package_sha256']}


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    parser.add_argument('--reference-package', type=Path, help='Released Lesson 7 APKG for exact compatible styling and schema verification')
    arguments = parser.parse_args()
    print(json.dumps(build(arguments.output, arguments.reference_package), ensure_ascii=False))
