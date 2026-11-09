#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const d=require('../lesson6/content.js');
assert.equal(d.cards.length,66);assert.equal(d.topics.length,8);assert.equal(d.sheets.length,11);
assert.equal(new Set(d.cards.map(c=>c.key)).size,66);
assert.equal(d.sheets.reduce((n,s)=>n+s.questions.length,0),120);
assert.equal(d.sheets.filter(s=>s.kind==='homework').reduce((n,s)=>n+s.questions.length,0),30);
for(const c of d.cards){
 assert.equal(c.lesson,'L6');assert.ok(c.key.startsWith('italian-l6-'));
 for(const f of ['prompt','answer','meaning','source_id','source_page','source_class','pronunciation_status'])assert.ok(c[f],c.key+' missing '+f);
 assert.ok(d.sources[c.source_id],c.key+' has no source');
 if(c.guide){assert.ok(c.ipa);assert.equal(c.pronunciation_status,'Provisional — verification pending');}
 assert.ok(d.topics.includes(c.deck));
}
for(const s of d.sheets){assert.equal(s.lesson,'L6');assert.ok(s.study_sections.length>=2);assert.ok(s.questions.length);for(const q of s.questions){assert.ok(q.answers.length&&q.source&&q.id);assert.ok(['accent','punctuation'].includes(q.answer_mode));}}
assert.equal(d.numberRows.length,10);assert.ok(d.numberRows.every(r=>r.length===8));
assert.ok(d.cards.some(c=>c.answer.includes('l6-n-hundred')));
assert.ok(d.cards.some(c=>c.answer.includes('l6-n-thousand')));
assert.ok(d.cards.some(c=>c.answer.includes('l6-n-accent')));
assert.ok(d.cards.some(c=>c.answer.includes('l6-n-join')));
for(const name of ['l6-intonation-statement.png','l6-intonation-question.png'])assert.ok(fs.statSync(path.join(root,'lesson6/media',name)).size>1000);
const intonation=d.sheets.find(s=>s.slug==='l6-intonation');assert.ok(JSON.stringify(intonation).includes('l6-intonation-statement.png'));assert.ok(JSON.stringify(intonation).includes('l6-intonation-question.png'));
assert.equal(d.checkAnswer('e',['è'],'accent'),false);assert.equal(d.checkAnswer('è',['è'],'accent'),true);
assert.equal(d.checkAnswer('Sei inglese.',['Sei inglese?'],'punctuation'),false);assert.equal(d.checkAnswer('Sei inglese?',['Sei inglese?'],'punctuation'),true);
assert.equal(d.checkAnswer('non e',['non è'],'accent'),false);assert.equal(d.checkAnswer('  Non è. ',['non è'],'accent'),true);
assert.equal(d.checkAnswer('ventitre',['ventitré'],'accent'),false);assert.equal(d.checkAnswer('ventitré',['ventitré'],'accent'),true);
assert.ok(!intonation.questions.some(q=>q.answers.includes('Sono italiani?')),'Ambiguous source row must not be scored');
const sourceText=read('study/study-sheets-v5.js');const match=sourceText.match(/const B="([^"]+)"/);assert.ok(match);
const old=JSON.parse(zlib.gunzipSync(Buffer.from(match[1],'base64')).toString());assert.equal(old.length,9,'Original embedded study set altered');
assert.match(sourceText,/data=data.concat\(window.ITALIAN_L6.sheets\)/);assert.match(sourceText,/answerMode!=='legacy'/);
assert.match(read('course-data-loader-v1.js'),/finalCards.concat\(lesson6Cards\)/);
assert.match(read('guided-course-v2.js'),/\['L6', 'Numbers, Essere and Questions'/);
assert.ok(read('index.html').indexOf('lesson6/content.js')<read('index.html').indexOf('course-data-loader-v1.js'));
assert.ok(read('study/study-sheets.html').indexOf('../lesson6/content.js')<read('study/study-sheets.html').indexOf('study-sheets-v5.js'));
const baseline=JSON.parse(read('lesson6/baseline-integrity.json'));
const crypto=require('node:crypto');
for(const [file,hash]of Object.entries(baseline.unchangedFiles))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Earlier data modified: '+file);
console.log('PASS Lesson 6: 66 cards / 8 topics / 11 exercise routes / 120 questions / 30 homework tasks.');
console.log('PASS source number patterns and original intonation media; exact accent and punctuation checks.');
console.log('PASS earlier course-data files unchanged; pronunciation remains explicitly provisional.');
