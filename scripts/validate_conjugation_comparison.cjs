#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('study/daily-verbs.js'),ctx);
const verbs=ctx.window.ItalianDailyVerbs.verbs;
(async()=>{
  const content=read('study/present-conjugation-comparison.js');
  const module=await import('data:text/javascript,'+encodeURIComponent(content));
  const html=module.renderComparison(verbs);
  for(const value of ['parlo','parli','parla','leggo','leggi','legge','dormo','dormi','dorme','finisco','finisci','finisce','parliamo','leggiamo','dormiamo','finiamo']){
    assert.ok(html.includes(value),value+' is missing from the comparison');
  }
  for(const label of ['1st -ARE','2nd -ERE','3rd -IRE','3rd -IRE (-isc-)','io','tu','lui / lei / Lei','noi','voi','loro']){
    assert.ok(html.includes(label),label+' not shown');
  }
  const singular=html.slice(html.indexOf('aria-label="Singular present-tense comparison"'),html.indexOf('class="conj-plural"'));
  const plural=html.slice(html.indexOf('class="conj-plural"'));
  assert.equal((singular.match(/<tr>/g)||[]).length,4,'Header + three singular rows');
  assert.equal((plural.match(/<tr>/g)||[]).length,4,'Header + three plural rows');
  assert.ok(html.includes('-isc-'),'The -isc pattern must be identified');
  const page=read('study/daily-practice.html'),practice=read('study/daily-practice.js');
  assert.match(page,/id="overview"/);
  assert.match(practice,/overviewScope/);
  assert.match(practice,/renderComparison\(verbs\)/);
  assert.match(practice,/focusCurrent\(box,oldTop/);
  assert.doesNotMatch(practice,/byId\('reference'\)\.open\s*=\s*false/,'Next Question must not close the expanded reference');
  assert.match(read('course-site-header-v1.js'),/class="course-site-comment"[^>]*aria-label="Comments"/);
  const header=require('../course-site-header-v1.js').header({context:'guided',current:'daily-practice'});
  assert.ok(header.includes('Daily Practice') && header.includes('Daily Focus'));
  assert.ok(header.includes('<svg aria-hidden="true"'),'Comments must be an icon-only control');
  console.log('PASS Regular conjugations, singular/plural comparison, references stay open and header labels are consistent.');
})().catch(e=>{console.error(e);process.exitCode=1;});
