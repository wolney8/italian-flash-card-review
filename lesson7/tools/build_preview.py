#!/usr/bin/env python3
"""Build a self-contained review preview from the committed content.js payload."""
from pathlib import Path
import argparse
import json

REPO = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir', type=Path, default=REPO / 'artifacts' / 'lesson7-review')
args = parser.parse_args()
source = (REPO / 'lesson7' / 'content.js').read_text(encoding='utf-8')
data, _ = json.JSONDecoder().raw_decode(source.split('const data=', 1)[1])
template = (Path(__file__).parent / 'preview-template.html').read_text(encoding='utf-8')
if template.count('__LESSON_DATA__') != 1:
    raise ValueError('The preview template must contain one lesson-data placeholder.')
payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
out = args.output_dir.expanduser().resolve() / 'Lesson_7_Interactive_Preview.html'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(template.replace('__LESSON_DATA__', payload), encoding='utf-8')
print(json.dumps({
    'output': str(out), 'bytes': out.stat().st_size,
    'cards': len(data['cards']),
    'study_sets': len(data['sheets']) + len(data['lesson6Supplements']['sheets']),
    'screens': sum(len(s['questions']) for s in data['sheets'] + data['lesson6Supplements']['sheets'])
}))
