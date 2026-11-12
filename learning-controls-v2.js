/* Explicit practice transitions and in-session flashcard review. Canonical content stays unchanged. */
(function(root){'use strict';
const $=s=>document.querySelector(s),get=(k,d={})=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')||d;}catch(_){return d;}},put=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v));}catch(_){}},checkpoint=()=>root.ItalianLearningResume?.save();
const lang=()=>root.ItalianUI?.language||document.documentElement.dataset.uiLanguage||'en';
const t=(en,it)=>lang()==='it'?it:en;
function label(el,en,it){if(!el)return;el.dataset.uiNoTranslate='';const text=t(en,it);if(el.textContent!==text)el.textContent=text;}
function button(attr,en,it){const b=document.createElement('button');b.type='button';b.setAttribute(attr,'');b.dataset.en=en;b.dataset.it=it;label(b,en,it);return b;}
const editing=e=>e.target.closest?.('input,textarea,select,[contenteditable=true]');
const modal=()=>!!$('dialog[open],.study-review-modal:not([hidden]),.editorial-comment-modal:not([hidden])');
let dock=null,resizeObserver;
function viewport(){
 const v=root.visualViewport,offset=v?Math.max(0,innerHeight-v.height-v.offsetTop):0;
 document.documentElement.style.setProperty('--flow-keyboard',offset+'px');
 if(!dock)return;
 let reserve=0;
 for(const el of document.querySelectorAll('iframe,#test-hosting-badge')){
  const r=el.getBoundingClientRect();if(r.width>40&&r.width<320&&r.height>15&&r.height<110&&r.bottom>innerHeight-90&&r.left>innerWidth/2)reserve=Math.max(reserve,innerHeight-r.top+8);
 }
 dock.style.setProperty('--flow-hosting',offset>0?'0px':reserve+'px');
 document.documentElement.style.setProperty('--flow-dock-height',dock.getBoundingClientRect().height+'px');
}
function setDock(el){if(dock===el){viewport();return;}resizeObserver?.disconnect();dock=el;if(el){resizeObserver=new ResizeObserver(viewport);resizeObserver.observe(el);}viewport();}
root.addEventListener('resize',viewport);root.visualViewport?.addEventListener('resize',viewport);root.visualViewport?.addEventListener('scroll',viewport);
let timer=null,timerKey=null,remaining=0,pausedClick=false,studyArticle=null,activeKey=null;
const guide=()=>root.ItalianGuidedStudy;
const question=()=>{const a=guide(),s=a?.getState();return s?.step==='practise'&&!s.finished?a.questions()[s.question]:null;};
const value=q=>q?.dataset.type==='choice'?(q.querySelector('input:checked')?.value||''):(q?.querySelector('input[type=text]')?.value||'');
function ready(q){if(!q)return false;if(q.dataset.type==='match')return root.ItalianPracticeUI.readyMatch(q);return !!value(q).trim();}
function stopTimer(){clearInterval(timer);timer=null;timerKey=null;remaining=0;}
function pause(){if(!timer)return false;stopTimer();refreshStudy();return true;}
function autoEnabled(){try{return localStorage.getItem('italianAutoAdvanceV2')!=='off';}catch(_){return true;}}
function startTimer(q){stopTimer();if(!autoEnabled()||document.hidden||q!==question())return;remaining=5;timerKey=q.dataset.progressKey;refreshStudy();timer=setInterval(()=>{
 if(!question()||question().dataset.progressKey!==timerKey||document.hidden){pause();return;}
 if(--remaining<=0){stopTimer();guide().move('next');return;}refreshStudy();
 },1000);refreshStudy();}
function blank(q){
 q.querySelectorAll('input').forEach(i=>{if(i.type==='radio'||i.type==='checkbox')i.checked=false;else i.value='';});
 q.querySelectorAll('select').forEach(s=>s.value='');
 if(q.dataset.type==='order'){
  const list=q.querySelector('.library-order-list'),rows=[...list.children],mixed=root.ItalianPracticeBank.shuffle(rows,'retry:'+Date.now());
  if(mixed.every((x,i)=>x===rows[i])&&mixed.length>1)mixed.push(mixed.shift());
  list.replaceChildren(...mixed);q.querySelector('input').value=JSON.stringify(mixed.map(x=>x.dataset.orderId));
 }
 q.dataset.result='';delete q.dataset.flowChecked;
 const f=q.querySelector('.feedback');f.className='feedback';f.textContent='';
 q.querySelector('.model-answer').hidden=true;
 q.querySelectorAll('.practice-match-feedback').forEach(e=>e.textContent='');
 const hint=q.querySelector('.hint');if(hint)hint.hidden=true;
 const hb=q.querySelector('.hint-button');if(hb){hb.setAttribute('aria-expanded','false');label(hb,'Show hint','Mostra suggerimento');}
}
function beginReview(kind){
 stopTimer();const a=guide(),s=a.getState(),stats=a.stats();const queue=kind==='mistakes'?stats.incorrectIndices:stats.unansweredIndices;if(!queue.length)return;
 for(const i of queue){const q=a.questions()[i],k=q.dataset.progressKey;s.round.last[k]=q.dataset.result||s.round.last[k];blank(q);if(!s.round.retryPending.includes(k))s.round.retryPending.push(k);}
 root.ItalianStudyPersistence?.captureAll();a.setState({reviewIncorrect:true,reviewKind:kind,reviewQueue:queue,step:'practise',question:queue[0],finished:false});a.remember();checkpoint();a.focusCurrent(24);
}
function skip(){const q=question(),a=guide();if(!q||q.dataset.result)return;stopTimer();q.dataset.result='skipped';const f=q.querySelector('.feedback');f.className='feedback skipped';label(f,'Skipped','Saltata');q.querySelector('.model-answer').hidden=false;a.recordFirst(q);a.show();root.ItalianStudySupport?.refreshQuestion(q);root.ItalianStudyPersistence?.captureAll();checkpoint();startTimer(q);}
function resetScope(scope){
 const C=root.ItalianStudyContext,L=root.ItalianStudyLibrary;if(!C||!L)return;
 let ids=[C.set.id];
 if(scope==='topic')ids=C.groups.map(g=>g.id);
 if(scope==='lesson'){
  const lesson=L.map.lessons.find(l=>l.id===C.lesson);if(!lesson)return;
  ids=lesson.topics.flatMap(id=>L.map.lessonSets[lesson.id+':'+id]||L.map.topics.find(t=>t.id===id)?.sets||[]).concat(lesson.extra||[]);
 }
 const keys=new Set(ids.flatMap(id=>L.questionKeys(id)));
 const prompt=t('Reset '+keys.size+' questions in this '+scope+'? Shared questions will also reset wherever they appear. Other questions and flashcards stay unchanged.','Azzerare '+keys.size+' domande? Le domande condivise verranno azzerate anche negli altri percorsi. Le altre domande e le carte non cambiano.');
 if(!confirm(prompt))return;
 stopTimer();root.ItalianStudyPersistence?.captureAll();
 const p=get('italianCourseSessionProgressV2');p.study=p.study||{};p.study.answers=p.study.answers||{};keys.forEach(k=>delete p.study.answers[k]);put('italianCourseSessionProgressV2',p);
 for(const [id,set] of Object.entries(L.sets()))if(L.questionKeys(id).some(k=>keys.has(k))){
  const rk='italianStudyRoundV2:'+id,r=get(rk);keys.forEach(k=>{if(r.first)delete r.first[k];if(r.last)delete r.last[k];});
  if(r.keys){r.retryPending=(r.retryPending||[]).filter(k=>!keys.has(k));r.finished=false;put(rk,r);}
  try{sessionStorage.removeItem('italianGuidedSheetPilotV1:'+id);sessionStorage.removeItem('italianStudyRoundHistoryV2:'+id);}catch(_){}
 }
 checkpoint();const u=new URL(location.href);u.searchParams.set('stage','practise');location.href=u.pathname+u.search;
}
function tools(){
 if(!studyArticle||studyArticle.querySelector('.flow-study-tools'))return;
 const box=document.createElement('div');box.className='flow-study-tools';
 const quit=button('data-flow-quit','Quit and save','Esci e salva'),results=button('data-flow-results','Results','Risultati');
 const details=document.createElement('details');details.className='flow-settings';const summary=document.createElement('summary');label(summary,'Practice options','Opzioni degli esercizi');details.append(summary);
 const auto=document.createElement('label');auto.innerHTML='<input type="checkbox" data-flow-auto><span data-flow-auto-label></span>';auto.querySelector('input').checked=autoEnabled();details.append(auto);
 const help=document.createElement('p');help.className='flow-shortcuts';help.dataset.uiNoTranslate='';help.innerHTML='';details.append(help);
 for(const [scope,en,it] of [['set','Reset this set','Azzera questi esercizi'],['topic','Reset this topic','Azzera questo argomento'],['lesson','Reset lesson pathway','Azzera il percorso della lezione']]){
  if(scope==='lesson'&&!root.ItalianStudyContext?.lesson)continue;const b=button('data-flow-reset',en,it);b.dataset.flowReset=scope;details.append(b);
 }
 box.append(quit,results,details);studyArticle.querySelector('.guided-sheet-steps').before(box);
 const pager=studyArticle.querySelector('.guided-sheet-controls');const skipButton=button('data-flow-skip','Skip and reveal','Salta e mostra');pager.querySelector('.guided-sheet-controls-buttons').prepend(skipButton);
 const note=document.createElement('span');note.className='flow-countdown-help';note.dataset.uiNoTranslate='';pager.append(note);
}
function refreshStudy(){
 if(!studyArticle||!guide())return;const a=guide(),state=a.getState(),q=question(),pager=studyArticle.querySelector('.guided-sheet-controls');
 const inPractice=state.step==='practise'&&!state.finished;
 document.body.classList.toggle('flow-practising',inPractice);pager.classList.toggle('flow-bottom-dock',inPractice);
 if(inPractice&&studyArticle.dataset.numberMode!=='flip'){setDock(pager);}else if(dock===pager)setDock(null);
 if(q&&activeKey!==q.dataset.progressKey){stopTimer();activeKey=q.dataset.progressKey;}
 if(!q){stopTimer();activeKey=null;}
 studyArticle.querySelectorAll('.quiz-question').forEach(e=>{
  const b=e.querySelector('.check-button'),checked=!!e.dataset.result;
  if(b){b.disabled=checked||!ready(e);label(b,checked?'Answer checked':!ready(e)?(e.dataset.type==='match'?'Complete all pairs':'Enter answer first'):'Check answer',checked?'Risposta controllata':!ready(e)?(e.dataset.type==='match'?'Completa gli abbinamenti':'Inserisci prima la risposta'):'Controlla la risposta');}
  const answerLabel=e.querySelector('.model-answer>strong');if(answerLabel&&/^(Risposta|Answer)\s*:/.test(answerLabel.textContent))label(answerLabel,'Answer:','Risposta:');
  if(e.dataset.result==='skipped')label(e.querySelector('.feedback'),'Skipped','Saltata');
 });
 const next=pager.querySelector('[data-guided-action=next]'),back=pager.querySelector('[data-guided-action=back]'),sb=pager.querySelector('[data-flow-skip]');
 if(sb){sb.hidden=!q;sb.disabled=!!q?.dataset.result;label(sb,'Skip and reveal','Salta e mostra');}
 if(q){next.disabled=!q.dataset.result;label(next,remaining?'Next in '+remaining+' · Pause':'Next question',remaining?'Avanti tra '+remaining+' · Pausa':'Prossima domanda');next.setAttribute('aria-keyshortcuts','Alt+ArrowRight');
  label(back,state.reviewIncorrect&&state.reviewQueue[0]===state.question?'Back to results':'Previous question',state.reviewIncorrect&&state.reviewQueue[0]===state.question?'Torna ai risultati':'Domanda precedente');
  const stats=a.stats();label(pager.querySelector('.guided-sheet-controls-status'),stats.attempted+' answered · '+stats.correct+' correct · '+stats.skipped+' skipped',stats.attempted+' risposte · '+stats.correct+' corrette · '+stats.skipped+' saltate');
 }
 label(pager.querySelector('.flow-countdown-help'),remaining?'Click anywhere to pause.':'',remaining?'Fai clic per mettere in pausa.':'');
 const options=studyArticle.querySelector('.flow-study-tools');if(options){options.querySelectorAll('button[data-en]').forEach(b=>label(b,b.dataset.en,b.dataset.it));label(options.querySelector('summary'),'Practice options','Opzioni degli esercizi');label(options.querySelector('[data-flow-auto-label]'),'Advance after 5 seconds','Avanza dopo 5 secondi');label(options.querySelector('.flow-shortcuts'),'Enter: check. Alt+S: skip. Alt+H: hint. Alt+←/→: previous/next. Escape: pause. 1–9: select a choice when not typing. Tab: move between answers.','Invio: controlla. Alt+S: salta. Alt+H: suggerimento. Alt+←/→: precedente/successiva. Esc: pausa. 1–9: scegli un’opzione. Tab: passa alle risposte.');}
}
function mountStudy(){const el=$('.study-pack-sheet[data-guided-pilot=ready]');if(!el||!guide())return;if(studyArticle!==el){studyArticle=el;tools();setTimeout(()=>{
 const s=guide().getState();for(const q of guide().questions()){if(s.round.retryPending.includes(q.dataset.progressKey)){q.dataset.result='';q.querySelector('.feedback').textContent='';q.querySelector('.feedback').className='feedback';q.querySelector('.model-answer').hidden=true;}else if(q.dataset.result)s.round.last[q.dataset.progressKey]=q.dataset.result;}
 guide().show();root.ItalianStudyPersistence?.captureAll();refreshStudy();if(guide().getState().step==='practise'&&!guide().getState().finished&&scrollY<50)requestAnimationFrame(()=>guide().focusCurrent(24));},0);}refreshStudy();}
root.addEventListener('italian-study-view-changed',mountStudy);
root.addEventListener('italian-study-answer-checked',e=>{const q=e.detail.question;if(q?.dataset.result){q.dataset.flowChecked=value(q);root.ItalianStudyPersistence?.captureAll();checkpoint();startTimer(q);}refreshStudy();});
root.addEventListener('italian-interface-language-changed',()=>{pause();refreshStudy();mountFlash();});
root.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('pointerdown',()=>{pausedClick=!!timer;if(timer)pause();},true);
document.addEventListener('click',e=>{
 const target=e.target;if(!target.closest)return;
 if(target.closest('[data-flow-quit]')){e.preventDefault();e.stopImmediatePropagation();pause();root.ItalianStudyPersistence?.captureAll();guide()?.remember();checkpoint();location.href=root.ItalianStudyContext?.library||'/study/study-sheets.html';return;}
 if(target.closest('[data-flow-results]')){e.preventDefault();e.stopImmediatePropagation();pause();guide().setState({step:'practise',finished:true,reviewIncorrect:false});return;}
 const reset=target.closest('[data-flow-reset]');if(reset){e.preventDefault();e.stopImmediatePropagation();resetScope(reset.dataset.flowReset);return;}
 if(target.closest('[data-guided-review-incorrect],[data-guided-review-unanswered]')){e.preventDefault();e.stopImmediatePropagation();beginReview(target.closest('[data-guided-review-incorrect]')?'mistakes':'unanswered');return;}
 if(target.closest('[data-flow-skip]')){e.preventDefault();e.stopImmediatePropagation();skip();return;}
 if(target.closest('[data-guided-action=next]')&&pausedClick){pausedClick=false;e.preventDefault();e.stopImmediatePropagation();return;}
 if(timer)pause();pausedClick=false;
},true);
document.addEventListener('change',e=>{if(e.target.matches('[data-flow-auto]')){try{localStorage.setItem('italianAutoAdvanceV2',e.target.checked?'on':'off');}catch(_){}pause();}queueMicrotask(refreshStudy);});
document.addEventListener('input',e=>{if(e.target.closest('.quiz-question')){pause();queueMicrotask(refreshStudy);}});
const flash=()=>root.ItalianFlashcards;
let flashScope='',repeatState=null;
function flashKey(){const s=flash()?.getState();return 'italianFlashPracticeV2:'+s?.lesson+':'+s?.deck+':'+(s?.reviewOnly?'review':'all');}
function currentKey(){return flash()?.currentCard()?.key;}
function schedule(){const a=flash(),s=a?.getState();if(!s||s.page!=='card'||s.finished)return null;const key=flashKey();if(flashScope!==key){flashScope=key;repeatState=get(key,{seen:[],pending:[],tick:0,history:[]});}
 repeatState.seen=repeatState.seen||[];repeatState.pending=repeatState.pending||[];repeatState.history=repeatState.history||[];repeatState.tick=repeatState.tick||0;
 const k=currentKey();if(k&&!repeatState.seen.includes(k))repeatState.seen.push(k);put(key,repeatState);return repeatState;}
function goKey(k){const a=flash(),s=a.getState(),idx=a.activeCardList().findIndex(c=>c.key===k);if(idx<0)return false;a.navigate({...s,index:idx,finished:false},true,true);checkpoint();return true;}
function nextFlash(){const r=schedule(),a=flash();if(!r)return false;const k=currentKey();r.history.push(k);r.history=r.history.slice(-300);r.tick++;
 const cards=a.activeCardList(),valid=new Set(cards.map(c=>c.key));r.pending=r.pending.filter(x=>valid.has(x.key));
 const due=[...r.pending].sort((x,y)=>x.due-y.due).find(x=>x.due<=r.tick&&x.key!==k);
 const unseen=cards.find(c=>!r.seen.includes(c.key));const pick=due?.key||unseen?.key||[...r.pending].sort((x,y)=>x.due-y.due)[0]?.key;
 put(flashScope,r);if(pick)return goKey(pick);checkpoint();a.navigate({...a.getState(),finished:true});return true;}
function grade(c,rating){const r=schedule();if(!r)return false;r.pending=r.pending.filter(x=>x.key!==c.key);if(rating!=='known')r.pending.push({key:c.key,due:r.tick+(rating==='again'?2:4),rating});put(flashScope,r);return nextFlash();}
root.ItalianFlashFlow={graded:grade,next:nextFlash,getSchedule:()=>repeatState};
function mountFlash(){const a=flash(),s=a?.getState();if(!s)return;const on=s.page==='card'&&!s.finished;document.body.classList.toggle('flow-flashcards',on);
 if(!on){if(dock?.classList.contains('guided-flashcard-actions'))setDock(null);return;}
 schedule();const actions=$('.guided-flashcard-actions');if(!actions)return;
 actions.classList.add('flow-flash-rail');if(innerWidth<900)setDock(actions);
 if(!actions.querySelector('[data-flow-flash-help]')){
  const help=document.createElement('details');help.dataset.flowFlashHelp='';help.className='flow-flash-help';help.innerHTML='<summary></summary><p data-ui-no-translate></p>';actions.append(help);
  const focus=button('data-flow-focus','Focus mode','Modalità concentrazione');const quit=button('data-flow-flash-quit','Quit and save','Esci e salva');actions.append(focus,quit);
 }
 label(actions.querySelector('[data-guide-rate=again]'),'1 · Again','1 · Ancora');label(actions.querySelector('[data-guide-rate=unsure]'),'2 · Not sure','2 · Non sono sicuro');label(actions.querySelector('[data-guide-rate=known]'),'3 · Got it','3 · Lo so');
 label(actions.querySelector('[data-flow-flash-help] summary'),'Keyboard and review','Tastiera e ripasso');label(actions.querySelector('[data-flow-flash-help] p'),'Space or Enter: flip. 1: Again, 2: Not sure, 3: Got it (after reveal). ←/→: previous/next. F: focus. Escape: exit focus. Again returns after 1 other card; Not sure after 3. Short topics repeat sooner. Got it leaves this round.','Spazio o Invio: gira. 1: Ancora, 2: Non sono sicuro, 3: Lo so (dopo la risposta). ←/→: precedente/successiva. F: concentrazione. Esc: esci. Ancora ritorna dopo 1 altra carta; Non sono sicuro dopo 3. Nei gruppi brevi ritorna prima. Lo so esce dal giro.');
 label(actions.querySelector('[data-flow-focus]'),document.body.classList.contains('guided-focus-active')?'Exit focus':'Focus mode',document.body.classList.contains('guided-focus-active')?'Esci dalla concentrazione':'Modalità concentrazione');
 label(actions.querySelector('[data-flow-flash-quit]'),'Quit and save','Esci e salva');
 const status=$('.guided-confidence-summary');if(status){const c=get('italianCourseSessionProgressV2').flashcards?.confidence||{},cards=a.activeCardList(),count=x=>cards.filter(y=>c[y.key]===x).length;label(status,'Got it: '+count('known')+' · Again: '+count('again')+' · Not sure: '+count('unsure'),'Lo so: '+count('known')+' · Ancora: '+count('again')+' · Non sono sicuro: '+count('unsure'));}
 label(actions.querySelector('[data-guide-prev]'),'Previous','Indietro');label(actions.querySelector('[data-guide-next]'),'Next','Avanti');
 const prev=actions.querySelector('[data-guide-prev]');if(prev&&repeatState?.history.length)prev.disabled=false;
 requestAnimationFrame(viewport);
}
root.addEventListener('italian-flashcard-rendered',mountFlash);
document.addEventListener('click',e=>{const a=flash(),s=a?.getState();if(s?.page!=='card')return;const b=e.target.closest?.('[data-guide-next],[data-guide-prev],[data-flow-focus],[data-flow-flash-quit],[data-guide-restart],[data-guide-review-again]');if(!b)return;
 if(b.matches('[data-guide-restart],[data-guide-review-again]')){if(b.matches('[data-guide-restart]')){try{sessionStorage.removeItem(flashKey());}catch(_){}flashScope='';}return;}
 e.preventDefault();e.stopImmediatePropagation();
 if(b.matches('[data-guide-next]'))nextFlash();
 if(b.matches('[data-guide-prev]')){const r=schedule(),k=r?.history.pop();if(k){put(flashScope,r);goKey(k);}else a.moveCard(-1);}
 if(b.matches('[data-flow-focus]'))a.toggleFocus();
 if(b.matches('[data-flow-flash-quit]')){put('italianGuidedResumeV1',{lesson:s.lesson,deck:s.deck,index:s.index});checkpoint();a.navigate({page:'lessons'});}
},true);
document.addEventListener('keydown',e=>{
 if(e.repeat||e.isComposing||e.ctrlKey||e.metaKey||modal())return;
 if(guide()&&studyArticle){
  const q=question();if(!q)return;
  if(e.key==='Escape'){e.preventDefault();pause();return;}
  if(e.altKey&&e.code==='KeyS'){e.preventDefault();e.stopImmediatePropagation();skip();return;}
  if(e.altKey&&e.code==='KeyH'){e.preventDefault();pause();q.querySelector('.hint-button')?.click();return;}
  if((e.altKey||!editing(e))&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(pause())return;guide().move(e.key==='ArrowLeft'?'back':'next');return;}
  if((!editing(e)||e.target.matches('input[type=radio]'))&&/^[1-9]$/.test(e.key)&&q.dataset.type==='choice'){e.preventDefault();pause();const r=q.querySelectorAll('input[type=radio]')[Number(e.key)-1];if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));r.focus({preventScroll:true});}return;}
  if(e.key==='Enter'&&(e.target.matches('input[type=text]:not([hidden]),input[type=radio]')||(!editing(e)&&!e.target.closest('button,a,summary')))){e.preventDefault();e.stopImmediatePropagation();if(pause())return;if(q.dataset.result)guide().move('next');else if(ready(q))q.querySelector('.check-button').click();return;}
  if(e.code==='Space'&&!editing(e)&&timer){e.preventDefault();e.stopImmediatePropagation();pause();return;}
  return;
 }
 const a=flash(),s=a?.getState();if(!s||s.page!=='card'||s.finished||editing(e)||e.altKey)return;
 if(e.target.closest('button,a,summary')&&['Enter',' '].includes(e.key))return;
 if(e.code==='Space'||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();a.flip();return;}
 if(['1','2','3'].includes(e.key)){e.preventDefault();a.recordConfidence({'1':'again','2':'unsure','3':'known'}[e.key]);return;}
 if(e.key==='ArrowRight'){e.preventDefault();nextFlash();return;}
 if(e.key==='ArrowLeft'){e.preventDefault();$('[data-guide-prev]')?.click();return;}
 if(e.key.toLowerCase()==='f'){e.preventDefault();a.toggleFocus();return;}
 if(e.key==='Escape'&&document.body.classList.contains('guided-focus-active')){e.preventDefault();a.toggleFocus();}
},true);
root.addEventListener('resize',mountFlash);
const start=()=>{mountStudy();mountFlash();};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
