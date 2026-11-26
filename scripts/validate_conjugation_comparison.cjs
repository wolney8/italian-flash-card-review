#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('study/daily-verbs.js'),ctx);
vm.runInNewContext(read('study/verb-reference-view.js'),ctx);
const verbs=ctx.window.ItalianDailyVerbs.verbs;
const sourceBefore=JSON.stringify(verbs);
const view=ctx.window.ItalianVerbReferenceView;
const text=html=>html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
const part=(html,name)=>{
  const match=html.match(new RegExp('<span class="'+name+'"[^>]*>([^<]*)</span>'));
  return match ? text(match[1]) : '';
};
try {
  // Test actual output against the canonical tables, including all spelling exceptions.
  for(const verb of verbs){
    for(let index=0;index<6;index++){
      const html=view.formatForm(verb,index),form=verb.tenses?.presente?.forms[index] || verb.forms[index];
      assert.equal(text(html),form,verb.name+' '+index+' changed the written form');
      if(verb.kind==='regular'){
        assert.equal(part(html,'verb-ending'),verb.parts[index].ending,verb.name+' '+index+' ending differs from its approved key');
        assert.equal(part(html,'verb-stem')+part(html,'verb-infix'),verb.parts[index].stem,verb.name+' '+index+' lost its written stem');
      } else assert.doesNotMatch(html,/class="verb-(?:ending|infix)"/,verb.name+' must not invent a regular ending');
    }
    const reference=view.render(verb),body=reference.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
    assert.ok(body,verb.name+' has no reference table body');
    assert.equal((body.match(/<tr>/g)||[]).length,6,verb.name+' must show all six reference forms');
  }
  for(const [name,index,stem,infix,ending] of [
    ['finire',0,'fin','isc','o'],['finire',3,'fin','','iamo'],['finire',4,'fin','','ite'],
    ['finire',5,'fin','isc','ono'],['studiare',1,'stud','','i'],['significare',1,'significh','','i']
  ]){
    const html=view.formatForm(verbs.find(verb=>verb.name===name),index);
    assert.deepEqual([part(html,'verb-stem'),part(html,'verb-infix'),part(html,'verb-ending')],[stem,infix,ending],name+' '+index+' has the wrong highlighted parts');
  }
  const finire=verbs.find(verb=>verb.name==='finire');
  assert.equal(text(view.formatVerbText('io finisco',finire)),'io finisco');
  assert.match(view.formatVerbText('io finisco',finire),/class="verb-infix"/);
  assert.doesNotMatch(view.formatVerbText('Domani finisco il libro.',finire),/class="verb-(?:ending|infix)"/,'The formatter must not guess inside arbitrary sentences');
  const content=read('study/present-conjugation-comparison.js');
  // Load the production rendering function without needing a browser module loader.
  vm.runInNewContext(content.replace(/export function /g,'function ')+'\nwindow.testComparison=renderComparison;',ctx);
  const html=ctx.window.testComparison(verbs);
  const bodies=[...html.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)];
  assert.equal(bodies.length,1,'All people must appear together in one comparison');
  const rows=[...bodies[0][1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length,6,'All six persons must remain visible in the comparison');
  rows.forEach((row,index)=>{
    const cells=[...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length,4,'Compare all three families and the isc pattern');
    ['parlare','leggere','dormire','finire'].forEach((name,column)=>{
      const verb=verbs.find(item=>item.name===name),cell=cells[column][1];
      assert.ok(text(cell).includes(verb.forms[index]),verb.forms[index]+' is missing from its comparison row');
      assert.equal(part(cell,'verb-ending'),verb.parts[index].ending,'Comparison ending differs from the verb reference');
      assert.equal(part(cell,'verb-stem')+part(cell,'verb-infix'),verb.parts[index].stem,'Comparison stem differs from the verb reference');
    });
  });
  for(const label of ['1st -ARE','2nd -ERE','3rd -IRE','3rd -IRE (-isc-)','io','tu','lui / lei / Lei','noi','voi','loro']){
    assert.ok(html.includes(label),label+' not shown');
  }
  assert.doesNotMatch(html,/<details\b|\bhidden\b|class="conj-plural"/,'Plural forms must not need a separate reveal');
  assert.ok(html.includes('-isc-'),'The -isc pattern must be identified');
  const page=read('study/daily-practice.html'),practice=read('study/daily-practice.js');
  assert.match(page,/id="overview"/);
  assert.match(practice,/renderComparison\(verbs\)/);
  assert.match(practice,/focusCurrent\(box,oldTop/);
  assert.doesNotMatch(practice,/byId\('reference'\)\.open\s*=\s*false/,'Next Question must not close the expanded reference');
  assert.match(read('course-site-header-v1.js'),/class="course-site-comment"[^>]*aria-label="Comments"/);
  const header=require('../course-site-header-v1.js').header({context:'guided',current:'daily-practice'});
  assert.ok(header.includes('Today') && !header.includes('Daily Practice') && !header.includes('Daily Focus'),'Today replaces the two separate top menu links');
  assert.ok(header.includes('<svg aria-hidden="true"'),'Comments must be an icon-only control');
  assert.match(read('guided-course-v2.js'),/italian-course-data-ready'.*renderKeepingCardFace\(\)/,'Late data refresh must preserve a flipped card');
  assert.equal(JSON.stringify(verbs),sourceBefore,'Reference rendering must not modify approved verb data');
  console.log('PASS All six persons, canonical stems/endings, distinct isc infix, shared comparison/reference rendering and unchanged source data.');
} catch(e){console.error(e);process.exitCode=1;}
