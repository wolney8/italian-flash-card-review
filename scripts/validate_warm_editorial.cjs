#!/usr/bin/env node
'use strict';
// Visual-only A/C blend: both entrypoints, both themes, AA contrast and rollback.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('italian-warm-editorial-v1.css');
const index=read('index.html');
const study=read('study/study-sheets.html');
function tokens(selector){
  const start=css.indexOf(selector+' {');
  assert.ok(start!==-1,'Missing palette: '+selector);
  const body=css.slice(start+selector.length+2).split('}')[0];
  const result=Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)]
    .map(([,key,value])=>[key,value.toUpperCase()]));
  assert.ok(Object.keys(result).length>8,'Incomplete palette: '+selector);
  return result;
}
const palette={
  guidedLight:tokens('body.card.guided-enabled:not(.nightMode):not(.night_mode)'),
  guidedDark:tokens('body.card.guided-enabled:is(.nightMode,.night_mode)'),
  studyLight:tokens('html[data-italian-theme="light"]'),
  studyDark:tokens('html[data-italian-theme="dark"]')
};
function lum(hex){
  const ch=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
    .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*ch[0]+.7152*ch[1]+.0722*ch[2];
}
function contrast(fg,bg){
  const a=lum(fg),b=lum(bg);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
let count=0;
for(const [name,p] of Object.entries(palette)){
  for(const surface of ['paper','paper2']){
    for(const tone of ['ink','muted',name.startsWith('guided')?'accent':'pink']){
      assert.ok(p[surface]&&p[tone],name+' missing '+tone+'/'+surface);
      const r=contrast(p[tone],p[surface]);
      assert.ok(r>=4.5,name+' '+tone+' on '+surface+' has '+r.toFixed(2)+':1 contrast');
      count++;
    }
  }
  assert.equal(p.paper,name.toLowerCase().includes('dark')?'#292622':'#FFFCF7');
  assert.equal(p.ink,name.toLowerCase().includes('dark')?'#F6E8DC':'#332D28');
}
for(const name of ['guidedLight','guidedDark']){
  const p=palette[name];
  const ratio=contrast(p.primary,p['primary-ink']);
  assert.ok(ratio>=4.5,name+' primary button contrast '+ratio.toFixed(2));
  count++;
}
for(const name of ['studyLight','studyDark']){
  const p=palette[name],text=name==='studyLight'?p.paper:'#1B2920';
  assert.ok(contrast(p.mint,text)>=4.5,name+' study primary button contrast');
  for(const tone of ['correct','wrong','hint']){
    assert.ok(contrast(p[tone],p.paper)>=4.5,name+' '+tone+' feedback contrast');
    count++;
  }
  count++;
}
for(const key of ['bg','paper','paper2','ink','muted','line']){
  assert.equal(palette.guidedLight[key],palette.studyLight[key],
    'Light colours must match between learning surfaces: '+key);
  assert.equal(palette.guidedDark[key],palette.studyDark[key],
    'Dark colours must match between learning surfaces: '+key);
}
for(const [file,html,href] of [
  ['index.html',index,'italian-warm-editorial-v1.css?v=20261105a'],
  ['study/study-sheets.html',study,'../italian-warm-editorial-v1.css?v=20261105a']
]){
  assert.ok(html.includes(href),'Missing warm overlay: '+file);
  const position=html.indexOf(href);
  const headEnd=html.indexOf('</head>');
  assert.ok(position>html.indexOf('course-site-header-v1.css')&&position<headEnd,
    'Warm overlay must load last in head on '+file);
  assert.ok(position>html.indexOf('learning-session-v1.css'),
    'Warm overlay should not change application layout cascade on '+file);
}
assert.match(css,/Iowan Old Style/,'Keep subtle editorial heading character');
assert.match(css,/--accent:#8C4938/,'Keep muted terracotta, not saturated red');
assert.match(css,/--green:#285D47/,'Keep sage green primary actions');
assert.match(css,/@media print/,'Print output must remain unadorned');
assert.doesNotMatch(css,/display:\s*none\s*!important\s*;\s*.*(?:(?:next|previous|question)|(?:navigation))/i,
  'Do not conceal functional learning controls');
assert.doesNotMatch(css,/url\(\s*https?:/i,'No font or image network dependencies');
console.log('PASS harmonised Study Sheets/Flashcards theme, rollback path and '+count+' contrast checks.');
