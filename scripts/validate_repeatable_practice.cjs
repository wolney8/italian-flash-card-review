#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const B=require('../study/practice-bank-v1.js'),O=require('../study/practice-options-v1.js'),L6=require('../lesson6/content.js');
const packed=fs.readFileSync(path.join(root,'study/study-sheets-v5.js'),'utf8').match(/const B="([^"]+)"/)[1];
const baseline=JSON.parse(zlib.gunzipSync(Buffer.from(packed,'base64'))).concat(L6.sheets);
const before=JSON.stringify(baseline),categories=[];
global.window={};require('../study/verb-reference-v1.js');
const enhanced=B.enhance(baseline,categories,O,window.ItalianVerbReference.verbs);
assert.equal(JSON.stringify(baseline),before,'Canonical source must not be mutated');
assert.equal(enhanced.length,31);assert.equal(enhanced.filter(s=>s.practice).length,11);
let tasks=0,mc=0,matches=0;
for(const sheet of enhanced){
 for(const [i,q] of sheet.questions.entries()){
  tasks++;
  if(q.type==='choice'){
   mc++;assert.ok(q.choices.length>=6,sheet.slug+' '+i);assert.equal(new Set(q.choices).size,q.choices.length);
   assert.equal(q.redHerrings.length,2);assert.ok(q.redHerrings.every(x=>q.choices.includes(x)));
   const correct=q.choices.filter(v=>q.answers.some(a=>B.normal(a)===B.normal(v)));
   assert.equal(correct.length,1,sheet.slug+' '+i+' must have exactly one keyed answer');
   assert.ok(!q.redHerrings.includes(correct[0]));
   const a=B.shuffle(q.choices,'first');assert.deepEqual(a,B.shuffle(q.choices,'first'));
   assert.deepEqual([...a].sort(),[...q.choices].sort());
   const positions=new Set(Array.from({length:60},(_,n)=>B.shuffle(q.choices,String(n)).indexOf(correct[0])));
   assert.ok(positions.size>=5,'Correct answers need genuinely varied positions');
  }
  if(q.type==='match'){
   matches++;assert.equal(q.pairs.length,6);assert.equal(q.extras.length,2);
   assert.equal(new Set(q.pairs.map(p=>p.right)).size,6,'Identical sono needs explicit subjects');
   assert.equal(new Set([...q.pairs,...q.extras].map(p=>p.id)).size,8);
   assert.deepEqual(JSON.parse(q.model),q.pairs.map(p=>p.id));
  }
 }
}
for(const original of baseline){const updated=enhanced.find(s=>s.slug===original.slug);
 assert.equal(updated.questions.length,original.questions.length);
 for(let i=0;i<original.questions.length;i++){
  const a=original.questions[i],b=updated.questions[i];
  assert.deepEqual(b.answers,a.answers);assert.equal(b.model,a.model);assert.equal(b.hint,a.hint);
  if(a.type==='choice')assert.deepEqual(b.sourceChoices,a.choices);
 }
}
for(const key of Object.keys(B.V)){
 const s=enhanced.find(s=>s.slug==='practice-'+key);
 assert.equal(s.questions.length,16);
 assert.deepEqual([...new Set(s.questions.map(q=>q.kind))].sort(),['choice','matching','phrase','sentence','word']);
 assert.ok(s.study_sections[0].rows[2][0].includes('esso / essa'));
 assert.ok(s.study_sections[0].rows[5][0].includes('essi / esse'));
 assert.ok(s.study_sections[0].rows.every(r=>r[2]),'Pronunciation guide missing');
 assert.ok(s.questions.slice(0,12).every(q=>!/(?:Noi|Voi|Loro)\s+(?:<b>|<)/.test(q.prompt)),'Start with singular');
}
assert.equal(tasks,391);assert.equal(mc,118);assert.equal(matches,15);
const report={status:'pass',source_sheets:20,practice_topics:11,source_tasks:212,new_tasks:179,total_tasks:tasks,multiple_choice:mc,minimum_options:6,red_herrings_per_choice:2,matching_tasks:matches,canonical_answers:'unchanged',anki:'unchanged',source_note:'New tasks/distractors are adaptations. Esse completes the feminine-plural comparison as supplementary support.'};
const out=path.join(root,'artifacts/repeatable-practice');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'content-validation.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(out,'enhanced-sheets.json'),JSON.stringify(enhanced));
console.log(JSON.stringify(report,null,2));
