#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('study/study-sheets.html');
const css=read('study/study-readable-type-v1.css');
assert.ok(html.includes('study-readable-type-v1.css?v='),'Study typography must load on live study sheets');
assert.ok(html.indexOf('study-readable-type-v1.css')>html.indexOf('course-site-header-v1.css'),'Study typography should load after shared styles');
function declaration(selector,property,expected){
 const start=css.indexOf(selector+' {');
 assert.ok(start!==-1,'Missing selector: '+selector);
 const body=css.slice(start+selector.length+2).split('}')[0];
 assert.ok(body.includes(property+':'+expected+';'),'Incorrect '+property+' for '+selector);
}
declaration('.study-pack-sheet .question-heading label','font-weight','500');
declaration('.study-pack-sheet .panel h2','font-weight','500');
declaration('.study-pack-sheet .question-number','font-weight','600');
declaration('.study-pack-sheet :is(.hint-button,.check-button) .editorial-label-main','font-weight','500');
declaration('.study-pack-sheet :is(.hint-button,.check-button) .editorial-label-sub','font-weight','400');
declaration('.study-pack-sheet :is(.hint-button,.check-button) .editorial-label-main','font-size','15px');
declaration('.study-pack-sheet :is(.hint-button,.check-button) .editorial-label-sub','font-size','12px');
declaration('.study-pack-sheet .quiz-intro','font-weight','400');
const heavy=[...css.matchAll(/font-weight:\s*(\d{3})\s*;/g)].filter(m=>Number(m[1])>=700);
assert.equal(heavy.length,0,'Avoid heavy bold in study typography');
assert.ok(!css.includes('.course-site-header')&&!css.includes('.course-site-navigation'),'Keep shared navigation untouched');
console.log('PASS readable study hierarchy; bilingual button sizes; no heavy bold; shared header unchanged.');
