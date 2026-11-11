#!/usr/bin/env python3
"""Idempotent scoped integration; original packed content and lesson card data stay intact."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def replace(name,old,new):
 p=ROOT/name;s=p.read_text()
 if new in s:return
 assert s.count(old)==1,(name,old[:90],s.count(old))
 p.write_text(s.replace(old,new))
v='study/study-sheets-v5.js'
replace(v,"function question(slug,q,i){const id=", "function question(slug,q,i){if(q.type==='match'&&window.ItalianPracticeUI)return window.ItalianPracticeUI.renderMatching(slug,q,i);const id=")
replace(v,"${q.choices.map(c=>", "${(window.ItalianPracticeBank?window.ItalianPracticeBank.choices(q,slug,i):q.choices).map(c=>")
replace(v,"  const params=new URLSearchParams(location.search);", "  if(window.ItalianPracticeBank)data=window.ItalianPracticeBank.enhance(data,categories,window.ItalianPracticeOptions,window.ItalianVerbReference?.verbs);\n  const params=new URLSearchParams(location.search);")
replace(v,"const listing=coursePath?window.ITALIAN_L6.flow.map(slug=>data.find(s=>s.slug===slug)):allListing.filter(s=>s.lesson!=='L6');", "const practicePath=params.get('path')==='verbs'||Boolean(active?.practice);\n  const listing=coursePath?window.ITALIAN_L6.flow.map(slug=>data.find(s=>s.slug===slug)):practicePath?allListing.filter(s=>s.practice):allListing.filter(s=>s.lesson!=='L6');")
replace(v,'+(coursePath?"&path=L6":"")','+(coursePath?"&path=L6":practicePath?"&path=verbs":"")')
replace(v,"categories.map(c=>({...c,slugs:c.slugs.filter(slug=>data.find(s=>s.slug===slug)?.lesson!=='L6')}))", "categories.map(c=>({...c,slugs:c.slugs.filter(slug=>{const s=data.find(s=>s.slug===slug);return s?.lesson!=='L6'&&(!practicePath||s.practice);})}))")
replace(v,"const visibleCategories=coursePath?[{id:'class-sequence',title:'Class order',slugs:window.ITALIAN_L6.flow}]:categories;", "const visibleCategories=coursePath?[{id:'class-sequence',title:'Class order',slugs:window.ITALIAN_L6.flow}]:params.get('path')==='verbs'?categories.filter(c=>c.id==='verb-practice'):categories;")
replace(v,"${!coursePath?' selected':''}>All topics</option>", "${!coursePath&&params.get('path')!=='verbs'?' selected':''}>All topics</option><option value=\"verbs\"${params.get('path')==='verbs'?' selected':''}>Verb practice</option>")
replace(v,"(event.target.value==='L6'?'&path=L6':'')", "(['L6','verbs'].includes(event.target.value)?'&path='+event.target.value:'')")
replace(v,"function updateButton(q){q.querySelector('.check-button').disabled=!value(q).trim();}", "function updateButton(q){q.querySelector('.check-button').disabled=q.dataset.type==='match'?!window.ItalianPracticeUI.readyMatch(q):!value(q).trim();}")
replace(v,"function check(q){const raw=value(q).trim();", "function check(q){if(q.dataset.type==='match'){window.ItalianPracticeUI.checkMatch(q);summary(q.closest('[data-study-quiz]'));return;}const raw=value(q).trim();")
r='study/verb-reference-v1.js'
replace(r,"['noi — we','voi — you all','loro — they']", "['noi — we','voi — you all','loro / essi / esse — they']")
replace(r,"'Lei — formal you / lui, lei — he, she'", "'Lei — formal you / lui, lei / esso, essa'")
replace(r,'Plural forms — later reference','Plural forms — noi, voi, loro / essi / esse')
h='study/study-sheets.html'
replace(h,'  <script src="../course-ui-language-v1.js?v=20261111a" defer></script>', '  <script src="practice-language-v1.js?v=20261111r1" defer></script>\n  <script src="../course-ui-language-v1.js?v=20261111a" defer></script>')
replace(h,'</head>','  <link rel="stylesheet" href="practice-session-v1.css?v=20261111r1">\n</head>')
p=ROOT/h;s=p.read_text();ref='<script src="verb-reference-v1.js?v=20261111language" defer></script>'
if 'practice-bank-v1.js' not in s:
 assert s.count(ref)==1
 s=s.replace(ref+'\n','')
 needle='<script src="study-sheets-v5.js?v=20261106flow" defer></script>'
 assert s.count(needle)==1
 s=s.replace(needle,ref+'\n<script src="practice-options-v1.js?v=20261111r1" defer></script>\n<script src="practice-bank-v1.js?v=20261111r1" defer></script>\n<script src="practice-session-v1.js?v=20261111r1" defer></script>\n'+needle)
 p.write_text(s)
replace(h,'verb-reference-v1.js?v=20261111language"','verb-reference-v1.js?v=20261111language&practice=1"')
replace(h,'study-sheets-v5.js?v=20261106flow"','study-sheets-v5.js?v=20261106flow&practice=1"')
# Eleven additional practice topics; original class-order checks remain unchanged.
replace('scripts/validate_study_flow.py',"page.locator('.sheet-library-item').count()==17","page.locator('.sheet-library-item').count()==28")
print('PASS repeatable practice integrated; original cards and packed lesson sources untouched.')
