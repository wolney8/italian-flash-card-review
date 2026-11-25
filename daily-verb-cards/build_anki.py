"""Export the new Daily verb notes from the same approved records as the website.

The package is additive. It contains no old lesson notes or personal scheduling.
Run after: node scripts/build_daily_verb_cards.cjs --check
"""
from argparse import ArgumentParser
from hashlib import sha256
from html import escape
import json
from pathlib import Path
import sqlite3
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from anki.collection import Collection, NoteIdsLimit
from anki.import_export_pb2 import ExportAnkiPackageOptions
from anki.utils import base91

FOLDER = Path(__file__).resolve().parent
PARENT = 'Italian - Daily Practice - Verbs'
MODEL = 'Italian Course - Daily Verb Recall v1'
FIELDS = ('Key', 'Prompt', 'Answer', 'Pronunciation', 'IPA', 'Meaning', 'Use', 'Rule', 'Source', 'Topic', 'AnswerLanguage')
FRONT = '<section><small>{{Topic}}</small>{{Prompt}}</section>'
BACK = '''<section><small>{{Topic}}</small><h1 lang="{{AnswerLanguage}}">{{Answer}}</h1>
{{#Pronunciation}}<p class="reading-guide"><b>Say it</b><br>{{Pronunciation}}<br><span class="ipa">/{{IPA}}/</span></p>{{/Pronunciation}}
{{#Meaning}}<h2>Natural English</h2><p>{{Meaning}}</p>{{/Meaning}}
{{#Use}}<h2>Use / word jobs</h2><p>{{Use}}</p>{{/Use}}
{{#Rule}}<h2>Rule / forms</h2>{{Rule}}{{/Rule}}
{{#Pronunciation}}<details><summary>Reading guide</summary><p>Approximate English-friendly reading guide. Capitals mark stress. Hold doubled consonants slightly longer.</p></details>{{/Pronunciation}}
<details><summary>Course source</summary><p>{{Source}}</p><small>{{Key}}</small></details></section>'''
CSS = '''
.card { background:#f9f6ee; color:#252c28; font:20px/1.5 -apple-system,BlinkMacSystemFont,Arial,sans-serif; text-align:left; }
.card section { max-width:36em; padding:1em; margin:auto; }
.card small,.card h2,.card b { color:#285a50; }
.card h1,.instruction { font-size:1.35em; font-weight:650; line-height:1.3; }
.card h2 { font-size:.85em; margin:1.4em 0 .35em; }
.recall-cue { margin:.8em 0; }
.recall-cue-label { display:block; font-size:.8em; color:#53675f; }
.clue { font-size:.9em; margin-top:1.1em; }
.ipa { font-family:Arial,sans-serif; font-size:.9em; }
.l7-form-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:.6em; padding:.3em 0; border-bottom:1px solid #a4b5ab; }
details { margin-top:1.2em; font-size:.85em; }
.nightMode,.night_mode { color:#f8f4e8; background:#202521; }
.nightMode small,.night_mode small,.nightMode b,.night_mode b,.nightMode h2,.night_mode h2 { color:#abd5c1; }
.nightMode .recall-cue-label,.night_mode .recall-cue-label { color:#cad8d1; }
.learning-it,h1[lang="it"] { color:#285a50; font-style:italic; }
.learning-gloss { color:#8c4938; font-style:italic; }
.nightMode .learning-it,.night_mode .learning-it,.nightMode h1[lang="it"],.night_mode h1[lang="it"] { color:#abd5c1; }
.nightMode .learning-gloss,.night_mode .learning-gloss { color:#f0b39a; }
'''


def stable_number(value):
    return 1_600_000_000_000 + int.from_bytes(sha256(value.encode()).digest()[:5], 'big')


def stable_guid(key):
    return base91(int.from_bytes(sha256(key.encode()).digest()[:8], 'big'))


def prompt(card):
    cues = ''.join('<div class="recall-cue"><span class="recall-cue-label" lang="en">' + escape(cue['label']) +
                   '</span><span' + (' class="learning-it"' if cue['lang']=='it' else ' class="learning-gloss"' if cue['label'] in ('Verb meaning','In English') else '') +
                   ' lang="' + cue['lang'] + '">' + escape(cue['text']) + '</span></div>' for cue in card['cues'])
    display=card.get('display',{})
    hint = '<p class="clue" lang="en">' + display.get('hint',escape(card['hint'])) + '</p>' if card['hint'] else ''
    return '<div class="recall-exercise"><p class="instruction" lang="en">' + display.get('task',escape(card['task'])) + '</p>' + cues + hint + '</div>'


def deck(collection, name):
    record = collection.decks.new_deck_legacy(False)
    record.update(id=stable_number('daily-verb-deck:'+name), name=name)
    collection.decks.update(record)
    return record['id']


def portable_ids(source, destination, by_key):
    """Make numeric IDs deterministic as well as note GUIDs, without scheduling."""
    db = sqlite3.connect(':memory:')
    try:
        with ZipFile(source) as src, ZipFile(destination, 'w') as dst:
            db.deserialize(src.read('collection.anki21'))
            old = db.execute('SELECT n.id,n.guid,n.flds,c.id,c.ord FROM notes n JOIN cards c ON c.nid=n.id').fetchall()
            if db.execute('SELECT count(*) FROM revlog').fetchone()[0]:
                raise ValueError('Personal review history must not be included')
            with db:
                db.execute('UPDATE cards SET id=-id,nid=-nid')
                db.execute('UPDATE notes SET id=-id')
                for nid,guid,fields,cid,ordinal in old:
                    key=fields.split('\x1f')[0]
                    if key not in by_key or guid!=stable_guid(key) or ordinal!=0:
                        raise ValueError('Unexpected exported note identity')
                    note_id=stable_number('daily-verb-note:'+key)
                    card_id=stable_number('daily-verb-card:'+key)
                    db.execute('UPDATE notes SET id=? WHERE id=?',(note_id,-nid))
                    db.execute('UPDATE cards SET id=?,nid=? WHERE id=?',(card_id,note_id,-cid))
            if db.execute('PRAGMA integrity_check').fetchone()[0]!='ok':
                raise ValueError('Invalid package database')
            for info in src.infolist():
                dst.writestr(info,db.serialize() if info.filename=='collection.anki21' else src.read(info.filename))
    finally:
        db.close()


def build(output):
    cards=json.loads((FOLDER/'cards.json').read_text())
    manifest=json.loads((FOLDER/'coverage.json').read_text())
    keys=[card['key'] for card in cards]
    if len(set(keys))!=len(keys) or len(cards)!=manifest['newCards']:
        raise ValueError('Card inventory mismatch')
    with TemporaryDirectory() as folder:
        work=Path(folder)
        collection=Collection(str(work/'collection.anki2'))
        try:
            model=collection.models.new(MODEL)
            model.update(id=stable_number('daily-verb-model-v1'),css=CSS)
            for name in FIELDS:
                field=collection.models.new_field(name)
                field['id']=stable_number('daily-verb-field:'+name)
                collection.models.add_field(model,field)
            template=collection.models.new_template('Recall')
            template.update(id=stable_number('daily-verb-template:recall'),qfmt=FRONT,afmt=BACK)
            collection.models.add_template(model,template)
            collection.models.update(model)
            deck(collection,PARENT)
            decks={name:deck(collection,PARENT+'::'+name) for name in sorted({card['deck'] for card in cards})}
            notes=[]
            for card in cards:
                note=collection.new_note(model)
                note.guid=stable_guid(card['key'])
                values={'Key':card['key'],'Prompt':prompt(card),'Answer':escape(card['answer']),
                        'Pronunciation':escape(card['guide']),'IPA':escape(card['ipa']),'Meaning':card.get('display',{}).get('meaning',escape(card['meaning'])),
                        'Use':card.get('display',{}).get('usage',escape(card['usage'])),'Rule':card['rule'],'Source':escape(card['sourceClass']+' · '+card['source']),
                        'Topic':escape(card['deck']),'AnswerLanguage':card['answerLang']}
                for name,value in values.items():
                    note[name]=value
                note.tags=['Italian','DailyVerbs','DailyVerbs::'+card['kind'],'PresentIndicative']
                if card.get('verb'): note.tags.append('Verb::'+card['verb'])
                collection.add_note(note,decks[card['deck']])
                notes.append(note.id)
            package=work/'native.apkg'
            collection.export_anki_package(out_path=str(package),limit=NoteIdsLimit(notes),
                options=ExportAnkiPackageOptions(with_scheduling=False,with_media=False,with_deck_configs=False,legacy=True))
        finally:
            collection.close()
        output.parent.mkdir(parents=True,exist_ok=True)
        portable_ids(package,output,{card['key']:card for card in cards})
    return {'notes':len(cards),'cards':len(cards),'file':str(output),'sha256':sha256(output.read_bytes()).hexdigest()}


if __name__=='__main__':
    parser=ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    print(json.dumps(build(parser.parse_args().output)))
