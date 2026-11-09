'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const ROOT=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const api=require('../lesson3-origins-v1.js');
const loader=read('course-data-loader-v1.js');
const files=[...loader.split('const CORE_FILES = [')[1].split('];')[0].matchAll(/'([^']+\.txt)'/g)].map(m=>m[1]);
const before=JSON.parse(zlib.gunzipSync(Buffer.from(files.map(read).join('').replace(/\s/g,''),'base64')));
const after=api.applyCards(before),byKey=new Map(after.map(c=>[c.key,c]));
assert.equal(before.length,after.length);assert.equal(byKey.size,after.length);
assert.deepEqual([...byKey.keys()].sort(),before.map(c=>c.key).sort());
const core=after.filter(c=>c.lesson==='L3'&&c.deck===api.core);
assert.equal(core.length,15);assert.deepEqual(core.map(c=>c.key),api.sequence);
for(const c of before){
 const next=byKey.get(c.key);
 assert.equal(next.answer,c.answer,'Do not repurpose the recall identity: '+c.key);
 assert.equal(next.pron,c.pron,'Do not overwrite main pronunciation: '+c.key);
 assert.equal(next.literal,c.literal,'Do not damage existing literal markup: '+c.key);
 if(!api.sequence.includes(c.key)&&!api.moves[c.key])assert.deepEqual(next,c,'Unrelated card changed: '+c.key);
}
const strip=s=>s.replace(/<[^>]+>/g,' ');
for(const c of core){
 assert.doesNotMatch(strip(c.prompt+c.pattern+c.usage),/\b(?:voi|siete|venite|vivete|abitate|noi|loro)\b/i,'Plural overload: '+c.key);
 assert.match(c.reference,/Session 3/);
 if(c.key!=='origin_where'){
  assert.equal((c.pattern.match(/<tr>/g)||[]).length,4,'Header + three singular forms');
  assert.match(c.usage,/Complete reply/);
  assert.match(c.usage,/Io (?:sono di|vengo da|vivo (?:a|in)|abito (?:a|in)) /);
  assert.doesNotMatch(strip(c.usage),/Io (?:sono|vengo|vivo|abito)\s*(?:\.{2,}|…)/,'Incomplete reply: '+c.key);
 }
}
assert.equal(after.filter(c=>c.deck===api.later).length,4);
assert.equal(after.filter(c=>c.lesson==='L3').length,120);
assert.ok(core.findIndex(c=>c.key==='origin_sono_napoli')<core.findIndex(c=>c.key==='origin_di_tu'));
assert.ok(core.findIndex(c=>c.key==='origin_vengo_napoli')<core.findIndex(c=>c.key==='origin_da_tu'));
assert.ok(core.findIndex(c=>c.key==='reside_vivo_Napoli')<core.findIndex(c=>c.key==='liveq_vivi'));
assert.match(read('index.html'),/lesson3-origins-v1\.js\?v=20261109a/);
assert.ok(read('index.html').indexOf('lesson3-origins-v1.js')>read('index.html').indexOf('pronunciation-decisions-v628.js'));
assert.deepEqual(api.applyCards(after),after);
const report={status:'pass',original_cards:before.length,final_cards:after.length,lesson3_cards:120,core_cards:15,later_plural_cards:4,new_cards:0,retained_keys:before.length,changed_content:api.sequence,moves:api.moves,main_answers_pronunciation_literal:'unchanged',unrelated_content:'unchanged'};
if(process.env.L3_REPORT_PATH){fs.mkdirSync(path.dirname(process.env.L3_REPORT_PATH),{recursive:true});fs.writeFileSync(process.env.L3_REPORT_PATH,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
