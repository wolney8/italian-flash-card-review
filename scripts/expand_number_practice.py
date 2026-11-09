#!/usr/bin/env python3
"""Idempotent, narrowly scoped number-practice upgrade. Never builds Anki."""
from pathlib import Path
import base64, gzip, json, re, subprocess
ROOT = Path(__file__).resolve().parents[1]
def replace(path, old, new):
    p=ROOT/path; text=p.read_text()
    if new in text:return
    assert text.count(old)==1, f'{path}: unexpected source near {old[:70]}'
    p.write_text(text.replace(old,new))
# Use the already-approved 0–20 course reference, not a newly invented answer source.
packed=(ROOT/'study/study-sheets-v5.js').read_text()
original=json.loads(gzip.decompress(base64.b64decode(re.search(r'const B="([^"]+)"',packed)[1])))
reference=next(s for s in original if s['slug']=='avere-numbers-family')
grid=next(s for s in reference['study_sections'] if s['type']=='number_grid')
words={int(n):w for n,w in grid['items']}
assert set(words)==set(range(21)), 'Expected all 0–20 spellings in earlier course material'
rows=json.dumps([words[i] for i in range(21)],ensure_ascii=False)
anchor="const numMap=new Map(numberRows.flatMap(r=>[[r[0],r[1]],[r[2],r[3]],[r[4],r[5]],[r[6],r[7]]]));"
addition=anchor+"\n// Requested expansion: every integer 0–30 (31 tasks), plus ten larger values.\nconst basicNumberWords="+rows+";\nbasicNumberWords.forEach((word,n)=>numMap.set(n,word));\nconst numberPracticeValues=[...Array.from({length:31},(_,n)=>n),40,50,60,70,80,90,100,200,1000,10000];"
replace('lesson6/content.js',anchor,addition)
p=ROOT/'lesson6/content.js';text=p.read_text()
old=next((line for line in text.splitlines() if line.startswith('],[21,23,28,40,200,600,800,1000,2000,4000,9000,10000].map')),None)
new="""],numberPracticeValues.map(n=>q('l6-number-write-'+n,'Write <b>'+n.toLocaleString('en-GB')+'</b> in Italian.',numMap.get(n),n===23?'Remember the accent on the final vowel.':n===21||n===28?'Think about the final vowel of venti before uno or otto.':n>=1000?'Compare mille with the repeating mila ending.':n>=100?'Use the repeated cento part.':n>=40?'Use the tens column of the handout.':'Write the number as one Italian word.',{explanation:num(numMap.get(n)),source:n<=20?'Earlier course reference · Avere, numbers and family · Numbers 0–20':sourceText('numbers',1),origin:n<=20?'User-requested revision using the existing 0–20 course reference':'User-requested writing practice using the supplied number handout'})),'numbers',1,'pattern');"""
if old:replace('lesson6/content.js',old,new)
else:assert new in text,'Number question generation changed unexpectedly'
# Positional storage used q1 for 21 before this change. Remap by the NUMBER,
# preserving unrelated answers and archiving removed values rather than misgrading 0.
migration="""function migrateNumberPractice(storage){
 if(!storage)return;
 try{
  const key='italianCourseSessionProgressV2',viewKey='italianGuidedSheetPilotV1:l6-number-patterns';
  const progress=JSON.parse(storage.getItem(key)||'{}');
  progress.study=progress.study||{answers:{}};
  if(progress.study.numberPracticeVersion===2)return;
  const answers=progress.study.answers||{};
  const previousValues=[21,23,28,40,200,600,800,1000,2000,4000,9000,10000];
  const archive={};
  previousValues.forEach((n,i)=>{const id='l6-number-patterns-q'+(i+1);if(answers[id])archive[id]=answers[id];});
  Object.keys(answers).filter(k=>/^l6-number-patterns-q\\d+$/.test(k)).forEach(k=>delete answers[k]);
  previousValues.forEach((n,i)=>{const saved=archive['l6-number-patterns-q'+(i+1)],next=numberPracticeValues.indexOf(n);if(saved&&next>=0)answers['l6-number-patterns-q'+(next+1)]=saved;});
  progress.study.answers=answers;
  if(Object.keys(archive).length)progress.study.numberPracticeArchiveV1=archive;
  const rawView=storage.getItem(viewKey);
  if(rawView){
   const view=JSON.parse(rawView);
   if(view.numberPracticeVersion!==2){
    view.question=Math.max(0,numberPracticeValues.indexOf(previousValues[view.question]));
    view.finished=false;view.reviewIncorrect=false;view.reviewQueue=[];view.numberPracticeVersion=2;
    storage.setItem(viewKey,JSON.stringify(view));
   }
  }
  progress.study.numberPracticeVersion=2;
  storage.setItem(key,JSON.stringify(progress));
 }catch(_){/* Storage unavailable: practice still works without erasing user data. */}
}
"""
replace('lesson6/content.js','const api={version,title:',migration+'const api={numberPracticeValues,migrateNumberPractice,version,title:')
replace('lesson6/content.js','if(root)root.ITALIAN_L6=api;',"if(root){root.ITALIAN_L6=api;try{migrateNumberPractice(root.sessionStorage);}catch(_){}}")
# Keep installer idempotent and bust cache at both entrypoints.
for f in ['index.html','study/study-sheets.html','lesson6/install.py']:
    p=ROOT/f;s=p.read_text();s=s.replace('content.js?v=20261106a','content.js?v=20261109numbers');p.write_text(s)
replace('scripts/validate_lesson6.cjs',"s.questions.length,0),91)","s.questions.length,0),120)")
p=ROOT/'scripts/validate_lesson6.cjs';p.write_text(p.read_text().replace('91 questions','120 questions'))
# Update only the user-approved replacement baseline; keep all other hashes intact.
manifest=ROOT/'lesson6/flow-preservation.json';data=json.loads(manifest.read_text())
new_hash=subprocess.check_output(['node','-e',"const d=require('./lesson6/content.js');const c=require('node:crypto');console.log(c.createHash('sha256').update(JSON.stringify(d.sheets.find(s=>s.slug==='l6-number-patterns').questions)).digest('hex'));"],cwd=ROOT,text=True).strip()
if data['questions']['l6-number-patterns']!=new_hash:
    data.setdefault('approved_replacements',{})['l6-number-patterns']={'date':'2026-11-09','reason':'User requested 0–30 writing practice plus 10 larger numbers; 41 inclusive tasks.','previous_sha256':data['questions']['l6-number-patterns'],'current_sha256':new_hash}
    data['questions']['l6-number-patterns']=new_hash
    manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
p=ROOT/'scripts/validate_study_flow.cjs';p.write_text(p.read_text().replace('all 66 card contents and 83 existing questions preserved.','all 66 card contents, unchanged non-number questions and approved 41-question number set.'))
p=ROOT/'lesson6/README.md';s=p.read_text().replace('83 earlier practice questions preserved, with eight source-derived warm-up/dialogue checks added (91 total).','120 practice questions: 79 unchanged non-number questions and 41 number-writing tasks (0–30 inclusive plus ten larger values).').replace('26 existing adapted number-pattern, intonation and useful-expression questions, plus eight warm-up/dialogue checks.','55 adapted number-writing, intonation and useful-expression questions, plus eight warm-up/dialogue checks.');p.write_text(s)
print('Expanded number writing to 41 tasks; other content and Anki hold unchanged.')
