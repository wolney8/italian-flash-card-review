#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const map=require('../study/library-map-v1.js'),extra=require('../study/library-content-v1.js');
const B=require('../study/practice-bank-v1.js'),O=require('../study/practice-options-v1.js'),L6=require('../lesson6/content.js');
const source=JSON.parse(zlib.gunzipSync(Buffer.from(read('study/study-sheets-v5.js').match(/const B="([^"]+)"/)[1],'base64')));
const context={window:{},module:{exports:{}},console};vm.runInNewContext(read('study/verb-reference-v1.js'),context);
const original=B.enhance(source.concat(L6.sheets),[],O,context.window.ItalianVerbReference.verbs);
const data=original.concat(extra.sheets),byId=new Map(data.map(s=>[s.slug,s]));
assert.equal(original.length,31);assert.equal(new Set(data.map(s=>s.slug)).size,data.length,'Do not replace old sheets');
assert.equal(map.lessons.length,6);assert.deepEqual(map.lessons.map(l=>l.id),['L1','L2','L3','L4','L5','L6']);
const sets=new Set([...byId.keys(),...Object.keys(map.subsets)]);
for(const t of map.topics){assert.ok(t.title&&t.it);for(const id of t.sets)assert.ok(sets.has(id),id+' missing');}
for(const l of map.lessons){for(const id of l.topics)assert.ok(map.topics.some(t=>t.id===id));for(const id of l.extra)assert.ok(sets.has(id));}
for(const [id,s] of Object.entries(map.subsets)){assert.ok(byId.has(s.sheet));assert.equal(new Set(s.indices).size,s.indices.length);assert.ok(s.indices.every(i=>byId.get(s.sheet).questions[i]));}
assert.deepEqual(map.subsets['numbers-0-20'].indices,Array.from({length:21},(_,i)=>i));
for(const ids of Object.values(map.lessonSets))ids.forEach(id=>assert.ok(sets.has(id)));
let count=0,choices=0,matching=0,ordering=0;
for(const sheet of data){for(const q of sheet.questions){count++;
 assert.ok(q.model&&q.answers?.length,sheet.slug+' lacks keyed answers');
 if(q.type==='choice'){choices++;assert.ok(q.choices.length>=6);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.redHerrings.length,2);assert.ok(q.redHerrings.every(x=>q.choices.includes(x)&&!q.answers.includes(x)));assert.equal(q.choices.filter(x=>L6.checkAnswer(x,q.answers,q.answer_mode)).length,1,sheet.slug+' has multiple keyed correct choices');}
 if(q.type==='match'){matching++;assert.equal(q.pairs.length,6);assert.equal(q.extras.length,2);assert.deepEqual(JSON.parse(q.model),q.pairs.map(p=>p.id));}
 if(q.type==='order'){ordering++;assert.deepEqual(JSON.parse(q.model),q.items.map(x=>x.id));assert.equal(new Set(q.items.map(x=>x.id)).size,q.items.length);}
}}
assert.equal(extra.sheets.filter(s=>s.slug.startsWith('class4-')&&s.slug!=='class4-family').reduce((n,s)=>n+s.questions.length,0),27);
assert.equal(extra.sheets.filter(s=>s.slug.startsWith('class5-plurals-')).reduce((n,s)=>n+s.questions.length,0),32);
assert.equal(byId.get('l6-number-patterns').questions.length,41);
assert.equal(L6.cards.length,66);
assert.ok(map.lessonSets['L4:partitives'].includes('connected-partitives'));
assert.ok(map.lessonSets['L5:partitives'].includes('connected-partitives'));
assert.ok(map.lessonSets['L6:partitives'].includes('connected-partitives'));
for(const [name,markers] of Object.entries({
 'study/study-sheets-v5.js':['ItalianStudyLibrary.render','ItalianStudyLibrary.context','data-progress-key'],
 'study/study-recovery-v1.js':['q.dataset.progressKey','captureAll'],
 'study/guided-sheet-pilot-v1.js':['scopeIndices','ROUND_KEY','nextKeys','Retry mistakes','Quick round completed'],
 'course-study-links-v1.js':['studyReturn','u.origin===location.origin'],
 'course-ui-language-v1.js':['>ITA<','>ENG<','ui-language-changing','prefers-reduced-motion'],
 'index.html':['course-booting','course-shell-boot-v1.js'],
 'study/study-sheets.html':['course-booting','library-content-v1.js','library-map-v1.js','library-v1.js']
})){for(const m of markers)assert.ok(read(name).includes(m),name+' missing '+m);}
assert.ok(!read('study/study-sheets-v5.js').includes('studyPathPicker'),'Remove mismatched library dropdown');
const preserved=JSON.parse(read('docs/library-source-preservation.json'));
for(const [name,hash] of Object.entries(preserved)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),hash,'Canonical source changed: '+name);}
const report={status:'pass',lessons:6,existing_routes:original.length,added_routes:extra.sheets.length,total_routes:data.length,existing_tasks:original.reduce((n,s)=>n+s.questions.length,0),added_tasks:extra.sheets.reduce((n,s)=>n+s.questions.length,0),total_tasks:count,multiple_choice:choices,matching,ordering,lesson4_source_tasks:27,lesson5_source_tasks:32,question_identities:'legacy slug-qN retained; subsets select keys rather than copying questions',anki:'unchanged'};
const out=path.join(root,'artifacts/course-library');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'content-results.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(out,'all-sheets.json'),JSON.stringify(data));console.log(JSON.stringify(report,null,2));
