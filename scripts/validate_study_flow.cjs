#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=require('../lesson6/content.js'),baseline=JSON.parse(read('lesson6/flow-preservation.json'));
const hash=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
const flow=['l6-greetings','l6-plural-workshop','l6-number-patterns','l6-age-dialogue','l6-essere-class','l6-negative-homework','l6-intonation','l6-useful-questions'];
assert.deepEqual(data.flow,flow,'Follow minutes pp.1–5, not worksheet upload order');
assert.equal(data.sheets.filter(s=>s.catalogue!==false).length,8,'Eight topics, not eleven separate exercise pages');
assert.equal(new Set(data.categories.flatMap(c=>c.slugs)).size,8);
assert.equal(data.topics.length,8);assert.equal(data.cards.length,66);
assert.equal(data.sheets.filter(s=>s.kind==='homework').reduce((n,s)=>n+s.questions.length,0),30);
for(const sheet of data.sheets){
 assert.ok(!/^Lesson\s*6/i.test(sheet.title),'No lesson prefix in topic titles');
 assert.ok(sheet.study_sections.some(s=>s.stage==='learn'),sheet.slug+' missing Learn assignment');
 assert.ok(sheet.study_sections.some(s=>s.stage==='examples'),sheet.slug+' missing Examples assignment');
 assert.ok(sheet.study_sections.every(s=>['learn','examples'].includes(s.stage)),sheet.slug+' has unassigned content');
}
for(const [key,old] of Object.entries(baseline.cards)){
 const card=data.cards.find(c=>c.key===key);assert.ok(card,key+' lost');
 assert.equal(hash(Object.fromEntries(baseline.unchanged_card_fields.map(k=>[k,card[k]]))),old,key+' recall content changed');
}
for(const [slug,old] of Object.entries(baseline.questions))assert.equal(hash(data.sheets.find(s=>s.slug===slug).questions),old,slug+' existing questions/answers/order changed');
const sets=data.practiceGroups['l6-essere-class'];assert.equal(sets.length,4);
for(const set of sets){const sheet=data.sheets.find(s=>s.slug===set.slug);assert.equal(sheet.topicSlug,'l6-essere-class');}
assert.equal(data.numberRows.length,10);
assert.ok(JSON.stringify(data.sheets.find(s=>s.slug==='l6-number-patterns')).includes('MIGLIAIA'));
for(const image of ['l6-intonation-question.png','l6-intonation-statement.png'])assert.ok(JSON.stringify(data.sheets.find(s=>s.slug==='l6-intonation')).includes(image));
assert.ok(data.legacyTopics['01 Conversation and age'].includes('italian-l6-age-formal'));
assert.ok(read('guided-course-v2.js').includes("location.replace('study/study-sheets.html?mode=learn')"));
assert.ok(read('study/study-sheets-v5.js').includes('window.ItalianStudyContext='));
assert.ok(read('study/guided-sheet-pilot-v1.js').includes("select.id='studyPracticePicker'"));
assert.ok(read('study/guided-sheet-pilot-v1.js').includes("url.searchParams.set('stage','practise')"));
const workflow=read('.github/workflows/lesson6-validation.yml');
assert.doesNotMatch(workflow,/run:\s*python lesson6\/build\.py/,'Anki must remain paused');
console.log('PASS class order, topic names, one Essere topic/four practice sets, all 66 card contents and 83 existing questions preserved.');
