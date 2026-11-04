#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const chrome=require('../course-site-header-v1.js');
for(const page of ['index.html','study/study-sheets.html']){
 const html=read(page);
 assert.match(html,/course-site-header-v1\.css\?v=/,'Missing shared header style: '+page);
 assert.match(html,/course-site-header-v1\.js\?v=/,'Missing shared header code: '+page);
 const first=html.indexOf('course-site-header-v1.js');
 const second=html.indexOf(page==='index.html'?'guided-course-v2.js':'study-editorial-v1.js');
 assert.ok(first>=0&&first<second,'Shared header code must load first: '+page);
}
for(const file of ['guided-course-v2.js','study/study-editorial-v1.js']){
 const content=read(file);
 assert.match(content,/ItalianCourseChrome\.header\(/,file+' has a separate header');
 assert.match(content,/ItalianCourseChrome\.breadcrumb\(/,file+' has a separate breadcrumb');
}
let variants=0;
for(const italianFirst of [true,false])for(const dark of [true,false])for(const menuOpen of [true,false]){
 const opts={current:'topics',italianFirst,dark,menuOpen};
 const guided=chrome.header({...opts,context:'guided'});
 const study=chrome.header({...opts,context:'study',mode:'learn'});
 const omitRoutes=s=>s.replace(/href="[^"]*"/g,'href="ROUTE"');
 assert.equal(omitRoutes(guided),omitRoutes(study),'Header elements differ between pages');
 assert.match(guided,/aria-controls="courseSiteNavigation"/);
 assert.match(guided,/data-guide-label-order/);
 assert.match(study,/data-study-editorial-language/);
 assert.equal((guided.match(/class="editorial-label-sub"/g)||[]).length,4);
 assert.equal((study.match(/class="editorial-label-sub"/g)||[]).length,4);
 assert.match(guided,/aria-current="page"/);
 variants++;
}
const breadcrumbs=[
 chrome.breadcrumb({homeHref:'?page=home',homeRoute:true,segments:[{label:'Lessons',href:'?page=lessons',route:'lessons'},{label:'Lesson 1'}]}),
 chrome.breadcrumb({homeHref:'../?page=home',segments:[{label:'Study sheets',href:'study-sheets.html'},{label:'Plurals and articles'}]})
];
for(const html of breadcrumbs){
 assert.match(html,/<nav class="course-site-breadcrumb" aria-label="Breadcrumb">/);
 assert.doesNotMatch(html,/editorial-label|lang="it"|Schede di studio|Lezione/,'Breadcrumb contains Italian');
 assert.match(html,/>Home<\/a>/);
}
const css=read('course-site-header-v1.css');
assert.match(css,/\.course-site-navigation \.editorial-label-main\{[^}]*font-weight:600/);
assert.match(css,/\.course-site-navigation \.editorial-label-sub\{[^}]*font-size:12px/);
assert.match(css,/@media\(max-width:960px\)/);
assert.match(css,/\.course-site-navigation\.is-open/);
console.log('PASS '+variants+' identical header variants, responsive navigation and English-only breadcrumbs.');
