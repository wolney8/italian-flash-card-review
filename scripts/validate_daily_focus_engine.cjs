#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const engineModule = require('../study/daily-focus-engine.js');
const DAY=86400000;
let now = Date.parse('2026-11-25T10:00:00Z');
const storage = () => {const values = new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),values};};
const make = (store=storage()) => engineModule.createEngine({storage:store,now:()=>now,listen:false});
const pool = Array.from({length:240},(_,i)=>({id:'question:'+i,sourceId:'q'+i,topicId:['verbs','articles','sounds','questions'][i%4],topicTitle:['Verbs','Articles','Sounds','Questions'][i%4],type:'question',task:'Write the approved answer.',stimulus:[{lang:'it',text:'___'}],answer:'sono',answers:['io sono'],answerLang:'it',hint:'Use io.',explanation:'Io sono.',source:'Approved fixture'}));
const cards = Array.from({length:60},(_,i)=>({...pool[i],id:'card:'+i,type:'flashcard'}));
const readings = Array.from({length:40},(_,i)=>({...pool[i],id:'reading:'+i,type:'reading',reading:'Use the approved explanation.'}));
const mixed = [...pool,...cards,...readings];
function act(engine, correct=true) {
  const step=engine.currentStep();
  if(step.item.type==='reading')engine.markRead();
  else if(['flashcard','spoken'].includes(step.item.type)){engine.reveal();engine.rate(correct?'known':'again');}
  else engine.answer(correct?'sono':'sbagliato',{correct});
}
function completeN(engine,n,correct=true) {for(let i=0;i<n;i++){act(engine,correct);engine.advance();}}
const checks=[];
function test(name,fn){fn();checks.push(name);console.log('PASS '+name);}

test('Separate defaults, remembered duration, and all five budgets',()=>{
  const store=storage();store.setItem('original-course-progress','keep');const e=make(store);
  assert.equal(e.preferences().duration,5);assert.equal(e.preferences().difficulty,'standard');
  for(const duration of [2,5,10,30,60]){
    const session=e.createSession(mixed,{duration,difficulty:'gentle'});
    assert.equal(session.steps.length,e.stepCounts[duration]);
    assert.equal(session.difficulty,'gentle');
    assert.ok(session.steps.filter(s=>s.item.type==='reading').length<=Math.floor(session.steps.length/4));
    assert.ok(session.steps.some(s=>s.item.type==='flashcard'));assert.ok(session.steps.some(s=>s.item.type==='question'));
    assert.equal(session.roundSize,duration>=30?8:e.stepCounts[duration]);
  }
  assert.equal(make(store).preferences().duration,60);assert.equal(store.getItem('original-course-progress'),'keep');
});

test('Incorrect answers and I do not know count as practice, not accuracy',()=>{
  const e=make();e.createSession(pool,{duration:2});
  e.answer('',{dontKnow:true});e.advance();completeN(e,2,false);
  const summary=e.summary();assert.equal(summary.completed,3);assert.equal(summary.required,3);assert.equal(summary.correct,0);assert.equal(summary.activeRecall,3);assert.equal(summary.confident,0);assert.ok(summary.qualifies);
  assert.notEqual(e.status().state,'completed');e.finish();assert.equal(e.status().state,'completed');
});

test('Flashcards require reveal plus self-assessment; reading never records recall',()=>{
  const e=make();e.createSession([...cards,...readings],{duration:2});
  const reading=e.currentStep();assert.equal(reading.item.type,'reading');e.markRead();
  assert.equal(e.historyFor(reading.item).lastRecallAt,null);assert.equal(e.historyFor(reading.item).exposureCount,1);e.advance();
  assert.throws(()=>e.rate('known'),/Reveal/);e.reveal();assert.equal(e.summary().completed,1);assert.equal(e.summary().activeRecall,0);
  e.rate('again');assert.equal(e.summary().activeRecall,1);assert.equal(e.summary().correct,0);assert.equal(e.summary().checked,0);
  const id=e.currentStep().item.id;assert.ok(e.isFlagged('item',id));e.setFlag('item',id,false);e.getState();assert.equal(e.isFlagged('item',id),false);
});

test('Excessive skips leave recoverable partial work with exact outstanding count',()=>{
  const e=make();e.createSession(pool,{duration:2});act(e,false);e.advance();e.skip();e.skip();e.skip();
  assert.equal(e.summary().completed,1);assert.equal(e.summary().skipped,3);assert.equal(e.summary().remainingNeeded,2);
  e.finish();assert.equal(e.getSession().status,'partial');assert.notEqual(e.status().state,'completed');
  e.revisit(1);act(e);e.advance();act(e);e.finish();assert.equal(e.summary().completed,3);assert.equal(e.status().state,'completed');
});

test('Swap replaces one unfinished slot, does not inflate target or completion',()=>{
  const e=make();e.createSession(mixed,{duration:2});const old=e.currentStep().item.id;
  const assigned=e.summary().assigned;e.swap(mixed);assert.equal(e.summary().assigned,assigned);assert.equal(e.summary().completed,0);assert.notEqual(e.currentStep().item.id,old);
  act(e);assert.throws(()=>e.swap(mixed),/unfinished/);assert.equal(e.summary().completed,1);
});

test('Refresh and next-day resume preserve position, draft, answer and content snapshot',()=>{
  const store=storage(), e=make(store);const s=e.createSession(pool,{duration:5});act(e,false);e.advance();e.saveDraft('my draft');e.saveLater();
  const copied=make(store);assert.equal(copied.getSession().index,1);assert.equal(copied.currentStep().draft,'my draft');assert.equal(copied.getSession().steps[0].result.correct,false);
  now+=DAY;copied.resume();assert.equal(copied.getSession().id,s.id);assert.equal(copied.currentStep().draft,'my draft');
  pool.find(item=>item.id===s.steps[0].item.id).task='Changed source';assert.equal(copied.getSession().steps[0].item.task,'Write the approved answer.');
  assert.equal(copied.getSession().steps.length,8);
});

test('Shortening retains completed work and credits the honest shorter duration',()=>{
  const e=make();e.createSession(pool,{duration:30});completeN(e,6,false);const answered=e.getSession().steps.slice(0,6);
  e.shorten(5);assert.equal(e.summary().assigned,8);assert.equal(e.summary().completed,6);assert.equal(e.summary().duration,5);assert.equal(e.summary().originalDuration,30);
  assert.deepEqual(e.getSession().steps.slice(0,6),answered);e.finish();assert.equal(e.getSession().status,'completed');assert.equal(e.getSession().duration,5);
});

test('Daily completion survives extra partial drills and skip-today',()=>{
  const e=make();const complete=e.createSession(pool,{duration:2});completeN(e,3);e.finish();
  const extra=e.createSession(pool,{duration:60});e.skip();e.finish();assert.equal(e.getSession().id,extra.id);assert.equal(e.getSession().status,'partial');
  assert.equal(e.status().state,'completed');assert.deepEqual(e.status().completedSessions,[complete.id]);e.skipToday();assert.equal(e.status().state,'completed');
});

test('London midnight, DST, once-only finish credit, and resume without daily debt',()=>{
  const e=make();now=Date.parse('2026-06-30T22:59:00Z');const session=e.createSession(pool,{duration:2});completeN(e,3);e.saveLater();
  assert.equal(e.dayKey(now),'2026-06-30');now=Date.parse('2026-06-30T23:01:00Z');assert.equal(e.dayKey(now),'2026-07-01');e.resume();e.finish();
  assert.equal(e.getSession().creditDay,'2026-07-01');const credited=e.getSession().creditedAt;
  now+=2*DAY;e.resume(session.id);e.finish();assert.equal(e.getSession().creditedAt,credited);assert.equal(e.getSession().creditDay,'2026-07-01');assert.equal(e.status().completedSessions.length,0);
  assert.equal(e.weekly().length,7);assert.equal(Object.keys(e.getState().sessions).length,1);
});

test('Skip-today and external Anki/workbook check-ins never award a web completion',()=>{
  const e=make();e.checkIn('anki',10);e.checkIn('workbook',5);assert.equal(e.status().state,'not started');assert.equal(e.status().selfReported.length,2);
  e.skipToday();assert.equal(e.status().state,'skipped today');assert.equal(e.status().completedSessions.length,0);e.undoSkipToday();assert.equal(e.status().state,'not started');
});

test('Active time is capped, paused work does not accrue, and time never completes',()=>{
  const e=make();e.createSession(pool,{duration:2});e.tickActive(999999);assert.equal(e.summary().activeMs,30000);assert.equal(e.summary().completed,0);
  e.saveLater();e.tickActive(10000);assert.equal(e.summary().activeMs,30000);e.resume();e.tickActive(1200);assert.equal(e.summary().activeMs,31200);assert.notEqual(e.status().state,'completed');
});

test('Snapshots, drafts, source metadata and checkpoints survive backup transfer',()=>{
  const e=make();const source={...pool[0],id:'metadata',readingLines:[{text:'sono',lang:'it'}],optionalSubjects:['io'],answerMode:'whole',sourceLabel:'Approved source',contentVersion:'1'};
  e.createSession([source,...pool.slice(1)],{duration:30});completeN(e,8);e.acknowledgeCheckpoint(8);e.saveDraft('un');e.saveLater();const json=e.backup();
  const other=make();other.restore(json);assert.deepEqual(other.getSession().checkpoints,[8]);assert.equal(other.currentStep().draft,'un');assert.equal(other.getSession().steps.length,40);
  assert.deepEqual(other.getSession(),e.getSession());other.restore(json);assert.equal(Object.keys(other.getState().sessions).length,1);assert.equal(Object.keys(other.getState().events).length,Object.keys(e.getState().events).length);
});

test('Backup merge retains both browsers, scheduling records, and completed-day credit',()=>{
  const first=make(), second=make();const original=first.createSession(pool,{duration:2});completeN(first,3);first.finish();
  second.createSession(mixed,{duration:5});act(second);second.saveLater();second.restore(first.backup());
  assert.equal(Object.keys(second.getState().sessions).length,2);assert.equal(second.status().state,'completed');assert.ok(second.status().completedSessions.includes(original.id));
  const before=second.summary(original.id).completed;second.restore(first.backup());assert.equal(second.summary(original.id).completed,before);
});

test('Two tabs preserve independently written sessions, answers and manual flags',()=>{
  const store=storage(), a=make(store), b=make(store);const first=a.createSession(pool,{duration:2});const second=b.createSession(mixed,{duration:5});
  a.resume(first.id);act(a);a.setFlag('topic','articles',true,'Articles');b.resume(second.id);act(b);b.setFlag('topic','sounds',true,'Sounds');
  const state=make(store).getState();assert.equal(Object.keys(state.sessions).length,2);assert.equal(state.sessions[first.id].steps.filter(s=>s.status==='completed').length,1);assert.equal(state.sessions[second.id].steps.filter(s=>s.status==='completed').length,1);assert.ok(state.flags.topic.articles.value);assert.ok(state.flags.topic.sounds.value);
});

test('Legacy confidence aids selection without inventing review dates or daily results',()=>{
  const e=make();e.seedLegacyHistory(pool,{items:{[pool[0].id]:{correct:false,confidence:'again',lastRecallAt:null,dateKnown:false}}});
  const h=e.historyFor(pool[0]);assert.equal(h.lastRecallAt,null);assert.equal(h.recallCount,0);assert.equal(h.dueAt,null);assert.equal(h.difficult,true);
  assert.match(e.reasonFor(pool[0]),/earlier web practice/);assert.equal(e.status().state,'not started');assert.equal(e.reasonFor(pool[1]),'No review recorded here yet');
});

test('Simple selection respects flagged topics, rotates items and caps reading',()=>{
  const e=make();e.setFlag('topic','articles',true,'Articles');const first=e.createSession(mixed,{duration:5});
  assert.ok(first.steps.some(s=>s.reason==='You flagged articles'));assert.ok(new Set(first.steps.map(s=>s.item.topicId)).size>=3);
  const second=e.createSession(mixed,{duration:5});assert.ok(second.steps.some(s=>!first.steps.some(old=>old.item.id===s.item.id)));
  assert.ok(second.steps.filter(s=>s.item.type==='reading').length<=2);
});

test('Confidence stays separate from typed correctness and clear flags stay cleared',()=>{
  const e=make();e.createSession(pool,{duration:2});e.answer('sono',{correct:true});assert.equal(e.summary().correct,1);assert.equal(e.summary().confident,0);
  e.recordConfidence('unsure');assert.equal(e.summary().confident,0);assert.equal(e.summary().revisit.length,1);e.recordConfidence('known');assert.equal(e.summary().confident,1);
  const id=e.currentStep().item.id;e.setFlag('item',id,false);e.getState();assert.equal(e.isFlagged('item',id),false);
});

test('Malformed backups, prototype keys and false completion claims are rejected',()=>{
  const e=make();assert.throws(()=>e.restore('{bad'),/backup/);assert.throws(()=>e.restore('{"format":"italian-daily-focus","version":1,"state":{"__proto__":{}}}'),/unsafe/);
  e.createSession(pool,{duration:2});const malicious=JSON.parse(e.backup());const id=malicious.state.currentSessionId;malicious.state.sessions[id].status='completed';malicious.state.sessions[id].creditedAt=now;malicious.state.sessions[id].creditDay=e.dayKey(now);
  assert.throws(()=>make().restore(JSON.stringify(malicious)),/completion claim/);
});

test('Blocked, full or corrupt storage reports failure and keeps original data',()=>{
  const unavailable=make(null);unavailable.createSession(pool,{duration:2});assert.equal(unavailable.persistence().ok,false);assert.match(unavailable.backup(),/italian-daily-focus/);
  const full={getItem:()=>null,setItem:()=>{throw Error('Quota');}};const e=make(full);e.createSession(pool,{duration:2});assert.equal(e.persistence().ok,false);assert.match(e.persistence().message,/could not save/);
  const corrupt=storage();corrupt.setItem(e.storageKey,'bad data');const c=make(corrupt);c.createSession(pool,{duration:2});assert.equal(c.persistence().ok,false);assert.equal(corrupt.getItem(e.storageKey),'bad data');
});

test('A completed shortened drill survives a newer stale full-length backup',()=>{
  const storeA=storage(),a=make(storeA),b=make();const original=a.createSession(pool,{duration:30});b.restore(a.backup());
  completeN(a,6);a.shorten(5);a.finish();const creditedAt=a.getSession().creditedAt;
  now+=50000;b.saveDraft('a later draft');a.restore(b.backup());
  assert.equal(a.summary().assigned,8);assert.equal(a.summary().completed,6);assert.equal(a.summary().duration,5);assert.equal(a.summary().originalDuration,30);assert.equal(a.summary().qualifies,true);assert.equal(a.getSession().creditedAt,creditedAt);
  const reloaded=make(storeA);assert.equal(reloaded.persistence().ok,true);assert.equal(reloaded.getSession(original.id).status,'completed');assert.equal(reloaded.summary().assigned,8);
  b.restore(a.backup());assert.equal(b.summary().duration,5);assert.equal(b.summary().qualifies,true);
});

test('Two independent completions retain one earliest finish date',()=>{
  const a=make(),b=make();a.createSession(pool,{duration:2});b.restore(a.backup());completeN(a,3);a.finish();const firstDay=a.getSession().creditDay,firstAt=a.getSession().creditedAt;
  now+=DAY;completeN(b,3);b.finish();b.restore(a.backup());assert.equal(b.getSession().creditDay,firstDay);assert.equal(b.getSession().creditedAt,firstAt);assert.equal(b.status().completedSessions.length,0);
});

test('Swap clears old drafts and records exposure separately for replacement items',()=>{
  const e=make();e.createSession(pool,{duration:2});e.saveDraft('old answer');e.swap(pool);assert.equal(e.currentStep().draft,'');
  const f=make();f.createSession(cards,{duration:2});const old=f.currentStep().item;f.reveal();f.swap(cards);const replacement=f.currentStep().item;f.reveal();
  assert.notEqual(old.id,replacement.id);assert.equal(f.historyFor(old).exposureCount,1);assert.equal(f.historyFor(replacement).exposureCount,1);assert.equal(f.summary().completed,0);
});

test('Spoken preference persists and changing a flash rating does not add an attempt',()=>{
  const store=storage(),e=make(store);e.preferences({spoken:true});e.createSession(cards,{duration:2});assert.equal(make(store).preferences().spoken,true);
  e.reveal();e.rate('again');assert.equal(e.summary().activeRecall,1);e.rate('known');assert.equal(e.summary().activeRecall,1);assert.equal(e.summary().confident,1);assert.equal(e.currentStep().result.dontKnow,false);
  assert.equal(e.historyFor(e.currentStep().item).recallCount,1);
});

test('Weekly activity keeps the previous day when a saved drill resumes tomorrow',()=>{
  const e=make();e.createSession(pool,{duration:5});act(e,false);e.advance();e.saveLater();const previous=now,day=e.dayKey(now);
  now+=DAY;e.resume();act(e);e.advance();assert.equal(e.status(previous).state,'in progress');assert.ok(e.weekly().some(row=>row.day===day&&row.state==='in progress'));assert.equal(e.status().completedSessions.length,0);
});

test('Cleared skip-today survives an older tab and starting a drill resumes activity',()=>{
  const store=storage(),a=make(store),b=make(store);a.skipToday();b.getState();a.undoSkipToday();b.setFlag('topic','articles',true);assert.notEqual(make(store).status().state,'skipped today');
  a.skipToday();a.createSession(pool,{duration:2});assert.equal(a.status().state,'in progress');
});

test('New-question repeats exclude the previous drill when enough approved alternatives exist',()=>{
  const e=make();e.setFlag('topic','articles',true);const first=e.createSession(mixed,{duration:2});
  for(const step of first.steps)e.setFlag('item',step.item.id,true);
  const ids=first.steps.map(step=>step.item.id);const second=e.createSession(mixed,{duration:2,avoidIds:ids});
  assert.equal(second.steps.length,4);assert.ok(second.steps.every(step=>!ids.includes(step.item.id)));assert.equal(second.selectionNote,'');
  assert.equal(e.summary().completed,0);assert.equal(e.summary().assigned,4);
  const tiny=make();const initial=tiny.createSession(pool.slice(0,4),{duration:2});
  const fallback=tiny.createSession(pool.slice(0,4),{duration:2,avoidIds:initial.steps.map(step=>step.item.id)});
  assert.equal(fallback.steps.length,4);assert.match(fallback.selectionNote,/not enough suitable alternatives/);
});

test('Automatic difficulty reasons do not claim the learner set a manual flag',()=>{
  const e=make();e.createSession(pool,{duration:2});const item=e.currentStep().item;e.answer('wrong',{correct:false});
  assert.equal(e.reasonFor(item),'A recent answer needs another try');e.setFlag('item',item.id,true);assert.equal(e.reasonFor(item),'You flagged this item');
});


test('Weekly activity is Monday through Sunday in London, even across DST',()=>{
  now=Date.parse('2026-11-25T16:00:00Z');const e=make();
  assert.deepEqual(e.weekly().map(d=>d.day),['2026-11-23','2026-11-24','2026-11-25','2026-11-26','2026-11-27','2026-11-28','2026-11-29']);
  now=Date.parse('2026-03-29T23:20:00Z');
  assert.deepEqual(e.weekly().map(d=>d.day),['2026-03-30','2026-03-31','2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05']);
  now=Date.parse('2026-10-25T22:40:00Z');
  assert.deepEqual(e.weekly().map(d=>d.day),['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25']);
});
test('Study-area choice is optional, separate from difficulty, and remembered',()=>{
  const store=storage(),e=make(store);
  assert.equal(e.preferences().focusMode,'smart');assert.deepEqual(e.preferences().focusTopics,[]);
  e.preferences({focusMode:'blend',focusTopics:['articles','verbs'],difficulty:'challenge'});
  const loaded=make(store);
  assert.deepEqual(loaded.preferences().focusTopics,['articles','verbs']);
  assert.equal(loaded.preferences().difficulty,'challenge');
  assert.equal(loaded.preferences().focusMode,'blend');
  assert.equal(loaded.getState().flags.topic.articles,undefined,'Choosing a topic must not mark it difficult');
  loaded.preferences({focusMode:'smart'});
  const smart=loaded.createSession(mixed,{duration:2});
  assert.equal(smart.steps.length,4);assert.ok(new Set(smart.steps.map(x=>x.item.topicId)).size>1);
  assert.equal(smart.focusMode,'smart');
});
test('Blended practice includes chosen areas and rotates other topics',()=>{
  const e=make();const session=e.createSession(mixed,{duration:5,focusMode:'blend',focusTopics:['articles']});
  assert.equal(session.steps.length,8);
  assert.ok(session.steps.some(x=>x.item.topicId==='articles'));
  assert.ok(session.steps.some(x=>x.item.topicId!=='articles'));
  assert.ok(session.steps.some(x=>x.reason==='You chose articles'));
  assert.equal(e.isFlagged('topic','articles'),false);
});
test('Only selected areas constrain the queue, swaps and repeated settings',()=>{
  const e=make();const session=e.createSession(mixed,{duration:5,focusMode:'only',focusTopics:['articles','sounds']});
  assert.equal(session.steps.length,8);
  assert.ok(session.steps.every(x=>['articles','sounds'].includes(x.item.topicId)));
  e.swap(mixed);assert.ok(['articles','sounds'].includes(e.currentStep().item.topicId));
  const json=e.backup();const restored=make();restored.restore(json);
  assert.deepEqual(restored.getSession().focusTopics,['articles','sounds']);
  assert.equal(restored.getSession().focusMode,'only');
  assert.throws(()=>e.createSession(mixed,{duration:5,focusMode:'only',focusTopics:[]}),/Choose at least one/);
  assert.throws(()=>e.createSession(pool.slice(0,8),{duration:60,focusMode:'only',focusTopics:['articles']}),/Not enough approved questions/);
});
test('New UI supports bilingual controls without translating authored learning material',()=>{
  const ui=require('../study/daily-focus-ui-locale.js');
  assert.equal(ui.translate('A week of practice'),'Una settimana di pratica');
  assert.equal(ui.translate('Smart mix (recommended)'),'Mix intelligente (consigliato)');
  assert.equal(ui.translate('2-minute drill'),'Esercizio di 2 minuti');
  assert.equal(ui.translate('Step 3 of 8 · Round 1 of 5'),'Attività 3 di 8 · Turno 1 di 5');
  assert.equal(ui.translate('Last practised here 12 days ago'),'Ultimo ripasso qui 12 giorni fa');
  assert.equal(ui.translate('You chose articles'),'Hai scelto articoli');
  const fs=require('node:fs'),path=require('node:path');
  const page=fs.readFileSync(path.join(__dirname,'../study/daily-focus.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../study/daily-focus.css'),'utf8');
  assert.ok(page.includes("stepMarkup(session,slot))+qualifying+sessionControls(session)"),'Ready notice must follow the question');
  assert.ok(page.includes("italian-interface-language-changed"),'Language toggle must rerender Today');
  assert.ok(page.includes("weekday:'short'"),'Weekday names must use the chosen locale');
  assert.ok(css.includes('df-ready-arrive')&&css.includes('prefers-reduced-motion:reduce'));
});

console.log('\n'+checks.length+' Daily Focus engine scenarios passed.');
