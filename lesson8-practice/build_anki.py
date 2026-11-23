"""Build the three review decks from the same records used by the website.

Run with the Anki Python package installed in a compatible Python environment:
    python lesson8-practice/build_anki.py /path/to/Italian_Lesson_8_Practice.apkg
"""
from argparse import ArgumentParser
from hashlib import sha256
from html import escape
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from anki.collection import Collection, NoteIdsLimit
from anki.import_export_pb2 import ExportAnkiPackageOptions
from anki.utils import base91

FOLDER = Path(__file__).resolve().parent
PARENT = 'Italian - Lesson 8 - Grammar and Extra Practice'
TOPICS = {
    'grammar': '01 Grammar in context',
    'sounds': '02 Pronunciation practice',
    'articles': '03 Articles in context',
}
FIELDS = {
    'Key': 'key', 'Prompt': 'front', 'Answer': 'answer', 'English': 'english',
    'Pronunciation': 'pron', 'IPA': 'ipa', 'Explanation': 'notes',
}
FRONT = '<section><small>{{Topic}}</small><p class="ask">{{Prompt}}</p></section>'
BACK = '''<section><small>{{Topic}}</small>
<h1 lang="it">{{Answer}}</h1>{{#Spoken}}{{tts it_IT:Spoken}}{{/Spoken}}
<p>{{English}}</p>
<hr><p><b>Say it</b><br>{{Pronunciation}}<br><span class="ipa">{{IPA}}</span></p>
<p>{{Explanation}}</p></section>'''
CSS = '''
.card { background: #f9f6ee; color: #252c28; font: 20px/1.5 -apple-system, sans-serif; text-align: left; }
.card section { max-width: 36em; padding: 1em; margin: auto; }
.card small, .card b { color: #285a50; }
.card .ask, .card h1 { font-size: 1.4em; font-weight: 650; line-height: 1.3; }
.card hr { border: 0; border-top: 1px solid #a4b5ab; }
.card .ipa { font-family: sans-serif; }
.nightMode, .night_mode { color: #f8f4e8; background: #202521; }
.nightMode small, .night_mode small, .nightMode b, .night_mode b { color: #abd5c1; }
'''


def stable_number(name):
    # Anki identifiers are positive signed 64-bit integers.
    return 1_600_000_000_000 + int.from_bytes(sha256(name.encode()).digest()[:5], 'big')


def make_deck(collection, name):
    deck = collection.decks.new_deck_legacy(False)
    deck.update(id=stable_number('deck:'+name), name=name)
    collection.decks.update(deck)
    return deck['id']


def make_package(output):
    cards = json.loads((FOLDER / 'cards.json').read_text())
    if len({card['key'] for card in cards}) != len(cards):
        raise ValueError('Duplicate web card keys')
    with TemporaryDirectory() as directory:
        collection = Collection(str(Path(directory) / 'collection.anki2'))
        try:
            model = collection.models.new('Italian Course - Grammar and Extra Practice v1')
            model.update(id=stable_number('practice-notetype-v1'), css=CSS)
            for name in [*FIELDS, 'Topic', 'Spoken']:
                field = collection.models.new_field(name)
                field['id'] = stable_number('practice-field:'+name)
                collection.models.add_field(model, field)
            template = collection.models.new_template('Recall')
            template.update(id=stable_number('practice-template:recall'), qfmt=FRONT, afmt=BACK)
            collection.models.add_template(model, template)
            collection.models.update(model)
            make_deck(collection, PARENT)
            decks = {key:make_deck(collection, PARENT+'::'+topic) for key, topic in TOPICS.items()}
            note_ids = []
            for card in cards:
                note = collection.new_note(model)
                note.guid = base91(int.from_bytes(sha256(card['key'].encode()).digest()[:8], 'big'))
                for name, key in FIELDS.items():
                    note[name] = escape(card[key], quote=False)
                topic = card['topic']
                note['Topic'] = TOPICS[topic]
                note['Spoken'] = escape(card.get('spoken',card['answer']), quote=False) if topic == 'sounds' else ''
                note.tags = ['Italian', 'Lesson8', 'L8Practice::'+topic]
                collection.add_note(note, decks[topic])
                note_ids.append(note.id)
            output.parent.mkdir(parents=True, exist_ok=True)
            collection.export_anki_package(out_path=str(output.resolve()),
                options=ExportAnkiPackageOptions(with_scheduling=False, with_media=False, legacy=True),
                limit=NoteIdsLimit(note_ids))
        finally:
            collection.close()


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    make_package(parser.parse_args().output)
