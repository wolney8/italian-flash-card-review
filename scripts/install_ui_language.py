#!/usr/bin/env python3
"""Idempotent integration of the shared interface locale. Only five known presentation files."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def patch(name,old,new):
    path=ROOT/name
    text=path.read_text()
    if new in text:
        assert old not in text, (name,'both patch versions present')
        return
    assert text.count(old)==1,(name,'integration point changed')
    path.write_text(text.replace(old,new))

for name in ['index.html','study/study-sheets.html']:
    path=ROOT/name;text=path.read_text();prefix='../' if name.startswith('study/') else ''
    if 'course-ui-language-v1.js' not in text:
        assert text.count('</head>')==1
        links='  <link rel="stylesheet" href="'+prefix+'course-ui-language-v1.css?v=20261111a">\n'
        for script in ['course-ui-italian-v1.js','course-ui-guidance-v1.js','course-ui-language-v1.js']:
            links+='  <script src="'+prefix+script+'?v=20261111a" defer></script>\n'
        path.write_text(text.replace('</head>',links+'</head>'))

patch('study/study-editorial-v1.js',
    "function mapped(value){const pair=PAIRS[value];return pair?bi(pair[0],pair[1]):escapeHtml(value);}",
    "function mapped(value){const pair=PAIRS[value];return pair?bi(pair[0],pair[1]):window.ItalianUI?window.ItalianUI.pair(value):escapeHtml(value);}")
patch('study/study-editorial-v1.js',
    "function sheetTitle(){return document.querySelector('.study-pack-sheet h1')?.textContent.trim()||'Study sheets library';}",
    "function sheetTitle(){const title=document.querySelector('.study-pack-sheet h1');return (window.ItalianUI?window.ItalianUI.sourceText(title):title?.textContent.trim())||'Study sheets library';}")
patch('study/study-recovery-v1.js',
    "result:/^Corretto/.test(t)?'correct':/^Sbagliato/.test(t)?'wrong':''",
    "result:q.dataset.result||((q.querySelector('.feedback')||{}).classList?.contains('correct')?'correct':(q.querySelector('.feedback')||{}).classList?.contains('wrong')?'wrong':'')")
patch('study/verb-reference-v1.js',
    "+v.name+'</span> — '+v.meaning+'<small>'",
    "+v.name+'</span><span class=\"ui-study-gloss\" lang=\"en\"> — '+v.meaning+'</span><small>'")
for old,new in [
    ('study-editorial-v1.js?v=20261106flow','study-editorial-v1.js?v=20261111language'),
    ('study-recovery-v1.js?v=20261104e','study-recovery-v1.js?v=20261111language'),
    ('verb-reference-v1.js?v=20261110a','verb-reference-v1.js?v=20261111language')
]:
    patch('study/study-sheets.html',old,new)
print('PASS idempotent language integration; no learning data or Anki files changed.')
