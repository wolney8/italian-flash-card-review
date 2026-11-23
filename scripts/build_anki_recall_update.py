"""Build a review-compatible Anki update from the released lesson packages.

Requires Node, Python's anki package and zstandard. Original packages are named
L1.apkg through L8.apkg in the input directory. Only changed notes are exported.
"""
import argparse
from collections import Counter
from dataclasses import dataclass, field
from html import escape
import json
from pathlib import Path
import re
import sqlite3
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from anki.collection import Collection, NoteIdsLimit
from anki.import_export_pb2 import ExportAnkiPackageOptions, ImportAnkiPackageRequest
import zstandard


ROOT = Path(__file__).resolve().parents[1]
DASH = re.compile(r'\s*(?:\u2014|&mdash;|&#8212;|&#x2014;)\s*', re.I)
FIELD_KEYS = ('StableKey', 'Key', 'ID')


@dataclass
class Originals:
    # The native importer may reassign local deck IDs and future-dated note IDs.
    # Keep the archive's original portable IDs separately from the temporary collection.
    notes: dict = field(default_factory=dict)
    decks: dict = field(default_factory=dict)

    def read(self, package):
        with ZipFile(package) as archive:
            name = next(n for n in ('collection.anki21b', 'collection.anki21', 'collection.anki2')
                        if n in archive.namelist())
            data = archive.read(name)
        if name.endswith('b'):
            data = zstandard.ZstdDecompressor().stream_reader(data).read()
        db = sqlite3.connect(':memory:')
        try:
            db.deserialize(data)
            cards = db.execute('SELECT n.guid,n.id,n.mid,c.ord,c.id,c.did '
                               'FROM notes n JOIN cards c ON n.id=c.nid')
            for guid, nid, mid, ordinal, cid, did in cards:
                index = (guid, ordinal)
                if index in self.notes:
                    raise ValueError(f'Duplicate released card identity: {index}')
                self.notes[index] = (nid, mid, cid, did)
            if name.endswith('b'):
                decks = db.execute('SELECT id,name FROM decks').fetchall()
            else:
                metadata = json.loads(db.execute('SELECT decks FROM col').fetchone()[0])
                decks = [(d['id'], d['name']) for d in metadata.values()]
            for did, path in decks:
                path = path.replace('\x1f', '::')
                if self.decks.setdefault(path, did) != did:
                    raise ValueError(f'Ambiguous deck identity for {path}')
        finally:
            db.close()


def course_tasks(keys):
    # These are the exact JS adapters used to render the course. Reading them
    # directly prevents a second hand-maintained set of Anki translations.
    program = """
const fs = require('node:fs');
global.window = {};
require('./early-card-tasks.js');
require('./lesson8-practice/card-tasks.js');
const tasks = {};
for (const key of JSON.parse(fs.readFileSync(0, 'utf8'))) {
  const exercise = window.ItalianLesson8CardTasks.get(key) || window.ItalianEarlyCardTasks.get({key});
  if (exercise) tasks[key] = exercise;
}
process.stdout.write(JSON.stringify(tasks));
"""
    result = subprocess.run(['node', '-e', program], cwd=ROOT, check=True,
                            input=json.dumps(keys), text=True, capture_output=True)
    return json.loads(result.stdout)


def cue_html(rows):
    lines = []
    for row in rows:
        if row['lang'] not in ('en', 'it'):
            raise ValueError(f'Unsupported cue language: {row["lang"]}')
        label = row.get('label')
        label = (f'<span lang="en" style="display:block;font-size:.76em;font-weight:600">'
                 f'{escape(label)}</span>') if label else ''
        lines.append(f'<span style="display:block;margin-top:.45em">{label}'
                     f'<span lang="{row["lang"]}">{escape(row["text"])}</span></span>')
    return ''.join(lines)


def update_front(note, task):
    if task:
        instruction = '<span lang="en">' + escape(task['task']) + '</span>'
        stimulus = cue_html(task['stimulus'])
        if 'Focus' in note and 'Task' in note:
            note['Prompt'], note['Focus'], note['Task'] = instruction, stimulus, ''
        else:
            note['Prompt'] = ('<span style="display:block;font-weight:600">' + instruction +
                              '</span>' + stimulus)
        return 'structured'

    # In the original visual-only L1 type, English doubles as the visible cue.
    fields = [name for name in ('Prompt', 'Focus', 'Task') if name in note] or ['English']
    changed = False
    for name in fields:
        original = note[name]
        fixed = ''.join(part if part.startswith('<') else DASH.sub(' · ', part)
                        for part in re.split(r'(<[^>]+>)', original))
        if fixed != original:
            note[name] = fixed
            changed = True
    return 'punctuation' if changed else None


def restore_archive_ids(source, output, originals):
    """Restore source package IDs after native merging while preserving media and templates."""
    db = sqlite3.connect(':memory:')
    try:
        with ZipFile(source) as src, ZipFile(output, 'w') as dst:
            db.deserialize(src.read('collection.anki21'))
            decks = json.loads(db.execute('SELECT decks FROM col').fetchone()[0])
            restored_decks = {}
            for deck in decks.values():
                if deck['name'] not in originals.decks:
                    # Some source files only declare subdecks. Anki recreates their parent.
                    if not any(path.startswith(deck['name'] + '::') for path in originals.decks):
                        raise ValueError(f'Unrecognised deck: {deck["name"]}')
                    continue
                deck['id'] = originals.decks[deck['name']]
                if str(deck['id']) in restored_decks:
                    raise ValueError(f'Outgoing deck collision: {deck["name"]}')
                restored_decks[str(deck['id'])] = deck
            identity = db.execute('SELECT n.id,n.guid,n.mid,c.ord,c.id FROM notes n '
                                  'JOIN cards c ON n.id=c.nid').fetchall()
            if db.execute('SELECT count(*) FROM revlog').fetchone()[0]:
                raise ValueError('Unexpected personal review history in export')
            with db:
                db.execute('UPDATE col SET decks=?', (json.dumps(restored_decks, ensure_ascii=False),))
                db.execute('UPDATE cards SET id=-id,nid=-nid')
                db.execute('UPDATE notes SET id=-id')
                for nid, guid, model, ordinal, cid in identity:
                    source_nid, source_model, source_cid, source_did = originals.notes[guid, ordinal]
                    if model != source_model or str(source_did) not in restored_decks:
                        raise ValueError(f'Unexpected note type or deck for {guid}')
                    db.execute('UPDATE notes SET id=? WHERE id=?', (source_nid, -nid))
                    db.execute('UPDATE cards SET id=?,nid=?,did=? WHERE id=?',
                               (source_cid, source_nid, source_did, -cid))
            if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise ValueError('Invalid output database')
            for info in src.infolist():
                dst.writestr(info, db.serialize() if info.filename == 'collection.anki21'
                             else src.read(info.filename))
    finally:
        db.close()


def build(input_folder, output):
    with TemporaryDirectory() as tmp:
        work = Path(tmp)
        collection = Collection(str(work / 'collection.anki2'))
        originals, counts = Originals(), Counter()
        try:
            for number in range(1, 9):
                package = input_folder / f'L{number}.apkg'
                originals.read(package)
                collection.import_anki_package(ImportAnkiPackageRequest(package_path=str(package.resolve())))
            by_key = {}
            for identifier in collection.find_notes(''):
                note = collection.get_note(identifier)
                key = next(note[f] for f in FIELD_KEYS if f in note)
                if key in by_key:
                    raise ValueError(f'Duplicate key across lessons: {key}')
                by_key[key] = note
            tasks = course_tasks(list(by_key))
            if len(tasks) != 150:
                raise ValueError(f'Expected 150 reviewed prompts, found {len(tasks)}')
            changed = []
            for key, note in by_key.items():
                kind = update_front(note, tasks.get(key))
                if kind:
                    changed.append(note)
                    counts[kind] += 1
            collection.update_notes(changed)
            package = work / 'native-export.apkg'
            collection.export_anki_package(out_path=str(package), limit=NoteIdsLimit([n.id for n in changed]),
                options=ExportAnkiPackageOptions(with_scheduling=False, with_media=True,
                                                  with_deck_configs=False, legacy=True))
        finally:
            collection.close()
        output.parent.mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(dir=output.parent) as staging:
            checked_package = Path(staging) / output.name
            restore_archive_ids(package, checked_package, originals)
            checked_package.replace(output)
    return dict(counts)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input_directory', type=Path)
    parser.add_argument('output', type=Path)
    arguments = parser.parse_args()
    print(json.dumps(build(arguments.input_directory, arguments.output)))
