#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const shared=require('../learning-session-v1.js');
const index=read('index.html'),sheet=read('study/study-sheets.html');
const guided=read('guided-course-v2.js');
const study=read('study/guided-sheet-pilot-v1.js');
const sharedCss=read('learning-session-v1.css'),guidedCss=read('guided-learning-session-v1.css');

for(const [page,html,scriptName] of [
  ['Flashcards',index,'guided-course-v2.js'],
  ['Study Sheets',sheet,'guided-sheet-pilot-v1.js']
]){
  assert.match(html,/learning-session-v1\.css\?v=/,page+' missing shared session styles');
  assert.match(html,/learning-session-v1\.js\?v=/,page+' missing shared session module');
  assert.ok(html.indexOf('learning-session-v1.js')<html.indexOf(scriptName),page+' loaded session module too late');
}
assert.match(index,/guided-learning-session-v1\.css\?v=/,'Flashcard styling missing');
assert.match(guided,/ItalianLearningSession\.progressMarkup/,'Flashcards not using shared progress');
assert.match(study,/ItalianLearningSession\.progressMarkup/,'Study pilot not using shared progress');
assert.match(study,/learning-session-controls/,'Study pilot not using paired controls');
const markup=shared.progressMarkup({label:'Answers revealed',completed:3,total:10,prefix:'example'});
assert.match(markup,/role="progressbar"/);
assert.match(markup,/aria-valuemax="10"/);
assert.match(markup,/aria-valuenow="3"/);
assert.match(markup,/width:30\.0%/);
assert.match(markup,/class="learning-session-progress-track example-track"/);
assert.doesNotMatch(shared.progressMarkup({label:'<img src=x>',completed:0,total:2}),/<img/,'Escape user-facing labels');
assert.deepEqual(shared.confidenceSummary([{key:'a'},{key:'b'},{key:'c'}],{a:'known',b:'again'}),{
  total:3,known:1,again:1,unsure:0,rated:2,unrated:1
});
assert.deepEqual(shared.reviewKeys([{key:'a'},{key:'b'},{key:'c'}],{a:'known',b:'again'}),['b']);

assert.match(guided,/flashcards\.confidence/,'Confidence ratings must have their own storage');
assert.match(guided,/flashcards\.viewed/,'Existing answer-reveal progress must remain');
assert.match(guided,/data-guide-rate="known"/);
assert.match(guided,/data-guide-rate="again"/);
assert.match(guided,/recordConfidence\(rating\.dataset\.guideRate\)/);
assert.match(guided,/if\(!current\?\.classList\.contains\('show-answer'\)\)return/,'Rate only after reveal');
assert.match(guided,/ItalianLearningSession\.reviewKeys/);
assert.match(guided,/data-guide-review-again/);
assert.match(guided,/reviewQueues/);
assert.match(guided,/reviewOnly=url\.searchParams\.get\('review'\)==='again'/);
assert.match(guided,/u\.searchParams\.set\('review','again'\)/);
assert.match(guided,/activeCardList\(\)/,'Navigation must use the active review queue');
assert.match(guided,/restoreAnchor\(root\.querySelector\('\.guided-card-host'\),previousTop\)/);
assert.match(guided,/guided-focus-active/);
assert.match(guided,/FOCUS_KEY/);
assert.match(study,/data-guided-review-incorrect/);
assert.match(study,/incorrectIndices/);
assert.match(study,/state\.reviewQueue=queue/);
assert.match(study,/state\.reviewIncorrect/);
assert.match(sharedCss,/\.learning-session-controls\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(guidedCss,/\.guided-review-navigation\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(guidedCss,/position:sticky;bottom:0/,'Mobile navigation should remain accessible');
assert.match(guidedCss,/body\.guided-focus-active \.course-site-breadcrumb/);
assert.doesNotMatch(guidedCss,/\.course-site-header\s*\{/,'Shared header must remain unchanged');
console.log('PASS shared UI resources, progress semantics and pure confidence logic.');
console.log('PASS Flashcard reveal vs recall, missed-card queue, and safe navigation.');
console.log('PASS mobile focus controls, paired buttons and Study Sheet incorrect review.');

assert.equal(shared.confidenceSummary([{key:'a'}],{a:'unsure'}).unsure,1);
assert.deepEqual(shared.reviewKeys([{key:'a'}],{a:'unsure'}),['a']);
