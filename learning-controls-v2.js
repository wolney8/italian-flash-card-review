/* Explicit practice transitions and in-session flashcard review. Canonical content stays unchanged. */
(function(root){'use strict';
const $=s=>document.querySelector(s),get=(k,d={})=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')||d;}catch(_){return d;}},put=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v));}catch(_){}},checkpoint=()=>root.ItalianLearningResume?.save();
const lang=()=>root.ItalianUI?.language||document.documentElement.dataset.uiLanguage||'en';
const t=(en,it)=>lang()==='it'?it:en;
function label(el,en,it){if(!el)return;el.dataset.uiNoTranslate='';const text=t(en,it);if(el.textContent!==text)el.textContent=text;}
function button(attr,en,it){const b=document.createElement('button');b.type='button';b.setAttribute(attr,'');b.dataset.en=en;b.dataset.it=it;label(b,en,it);return b;}
const editing=e=>e.target.closest?.('input,textarea,select,[contenteditable=true]');
const shortcutsEnabled=()=>{try{return localStorage.getItem('italianLearningShortcutsV2')!=='off';}catch(_){return true;}};
function shortcutOption(){const el=document.createElement('label');el.className='flow-shortcut-option';el.innerHTML='<input type="checkbox" data-flow-shortcuts><span></span>';el.querySelector('input').checked=shortcutsEnabled();label(el.querySelector('span'),'Keyboard shortcuts','Scorciatoie da tastiera');return el;}
const modal=()=>!!$('dialog[open],.study-review-modal:not([hidden]),.editorial-comment-modal:not([hidden])');
let dock=null,resizeObserver,viewportFrame=0;
const watchedFrames=new WeakSet();
function setPixel(el,name,n){const value=Math.round(n*100)/100+'px';if(el.style.getPropertyValue(name)!==value)el.style.setProperty(name,value);}
function requestViewport(){if(!viewportFrame)viewportFrame=requestAnimationFrame(()=>{viewportFrame=0;viewport();});}
const hostingResize=new ResizeObserver(requestViewport);
const hostingAttributes=new MutationObserver(requestViewport);
function watchHostingFrames(){
 for(const el of document.querySelectorAll('iframe,#test-hosting-badge'))if(!watchedFrames.has(el)){
  watchedFrames.add(el);hostingResize.observe(el);
  hostingAttributes.observe(el,{attributes:true,attributeFilter:['style','class','width','height','hidden']});
  el.addEventListener('load',requestViewport);
 }
}
function viewport(){
 const v=root.visualViewport,visibleBottom=v?v.height+v.offsetTop:innerHeight;
 const offset=Math.max(0,innerHeight-visibleBottom);
 setPixel(document.documentElement,'--flow-keyboard',offset);
 if(!dock)return;
 watchHostingFrames();
 let reserve=0;
 for(const el of document.querySelectorAll('iframe,#test-hosting-badge')){
  const r=el.getBoundingClientRect(),style=getComputedStyle(el);
  const fixed=style.position==='fixed'||el.id==='nl-badge-frame'||el.id==='test-hosting-badge';
  // A right-aligned badge can cross the midpoint of a narrow viewport.
  // Measure its intersection with the visible bottom edge, not its left position.
  if(fixed&&style.visibility!=='hidden'&&style.display!=='none'&&r.width>40&&r.width<=Math.min(600,innerWidth+1)&&r.height>15&&r.height<180&&r.right>0&&r.left<innerWidth&&r.top<visibleBottom&&r.bottom>visibleBottom-100)
   reserve=Math.max(reserve,visibleBottom-r.top+8);
 }
 setPixel(dock,'--flow-hosting',reserve);
 setPixel(document.documentElement,'--flow-dock-height',dock.getBoundingClientRect().height);
}
function setDock(el){if(dock===el){viewport();return;}resizeObserver?.disconnect();dock=el;if(el){resizeObserver=new ResizeObserver(requestViewport);resizeObserver.observe(el);}viewport();}
root.addEventListener('resize',requestViewport);root.visualViewport?.addEventListener('resize',requestViewport);root.visualViewport?.addEventListener('scroll',requestViewport);
let timer=null,timerKey=null,remaining=0,remainingMs=0,deadline=0,countdownState='manual',studyArticle=null,activeKey=null;
let revealFrame=0,questionFrame=0,reviewScroll=false,reviewScrollEnd=0;
let timerPress=null,pressEnd=0;
const COUNTDOWN_MS=5000,animationCleanup=new WeakMap();
const guide=()=>root.ItalianGuidedStudy;
const question=()=>{const a=guide(),s=a?.getState();return s?.step==='practise'&&!s.finished?a.questions()[s.question]:null;};
const value=q=>q?.dataset.type==='choice'?(q.querySelector('input:checked')?.value||''):(q?.querySelector('input[type=text]')?.value||'');
function ready(q){if(!q)return false;if(q.dataset.type==='match')return root.ItalianPracticeUI.readyMatch(q);return !!value(q).trim();}
const reducedMotion=()=>root.matchMedia('(prefers-reduced-motion: reduce)').matches;
function cancelReviewScroll(){
 if(revealFrame){cancelAnimationFrame(revealFrame);revealFrame=0;}
 clearTimeout(reviewScrollEnd);reviewScrollEnd=0;
 if(reviewScroll){reviewScroll=false;root.scrollTo({top:root.scrollY,behavior:'instant'});}
}
function stopTimer(){clearInterval(timer);timer=null;timerKey=null;remaining=0;remainingMs=0;deadline=0;countdownState='manual';}
function sampleTime(){if(timer)remainingMs=Math.max(0,deadline-performance.now());remaining=Math.ceil(remainingMs/1000);}
function freezeClock(){
 if(!timer)return false;sampleTime();clearInterval(timer);timer=null;deadline=0;
 // A pause pressed at the deadline wins over the next interval callback.
 remainingMs=Math.max(1,remainingMs);remaining=Math.ceil(remainingMs/1000);countdownState='paused';return true;
}
function pause(){
 cancelReviewScroll();if(!timer)return false;
 freezeClock();refreshStudy();return true;
}
function clearTimerPress(){clearTimeout(pressEnd);pressEnd=0;const press=timerPress;timerPress=null;return press;}
function finishTimerPress(){const press=clearTimerPress();if(press&&press.key===question()?.dataset.progressKey)refreshStudy();}
function beginTimerPress(target){
 const control=target.closest?.('[data-flow-countdown-toggle],[data-guided-action=next],[data-guided-action=back]'),q=question();
 if(!control||control.disabled||!q)return false;
 clearTimerPress();const toggle=control.matches('[data-flow-countdown-toggle]');
 timerPress={control,key:q.dataset.progressKey,action:toggle?(countdownState==='running'?'pause':'resume'):'navigate'};
 if(timer){
  cancelReviewScroll();freezeClock();
  if(toggle)refreshStudy();
  else{
   // Keep the navigation button under the pointer until its native click lands.
   const row=studyArticle.querySelector('.flow-countdown');if(row){row.dataset.flowCountdownState='paused';row.dataset.flowCountdownRemaining=String(remaining);row.dataset.flowCountdownRemainingMs=String(Math.round(remainingMs));}
  }
 }
 return true;
}
function endTimerPress(){
 if(timerPress)pressEnd=setTimeout(()=>{
  pressEnd=0;if(timerPress&&timerPress.key===question()?.dataset.progressKey)refreshStudy();
  // Keep the press intent until click or the next press; touch clicks may be delayed.
 },0);
}
function autoEnabled(){try{return localStorage.getItem('italianAutoAdvanceV2')!=='off';}catch(_){return true;}}
function lastQuestion(state){
 const queue=state.reviewIncorrect&&state.reviewQueue.length?state.reviewQueue:null;
 return queue?queue.indexOf(state.question)===queue.length-1:state.question===guide().questions().length-1;
}
function renderCountdown(){
 const row=studyArticle?.querySelector('.flow-countdown'),q=question();if(!row)return;
 const visible=!!q?.dataset.result&&studyArticle.dataset.numberMode!=='flip';row.hidden=!visible;
 if(!visible){row.dataset.flowCountdownState='manual';row.dataset.flowCountdownRemaining='0';row.dataset.flowCountdownRemainingMs='0';delete row.dataset.announcedState;return;}
 const state=guide().getState(),phase=timerKey===q.dataset.progressKey?countdownState:'manual';
 const seconds=phase==='manual'?0:remaining,ms=phase==='manual'?0:remainingMs;
 row.dataset.flowCountdownState=phase;row.dataset.flowCountdownRemaining=String(seconds);row.dataset.flowCountdownRemainingMs=String(Math.round(ms));
 const labelEl=row.querySelector('.flow-countdown-label'),toggle=row.querySelector('[data-flow-countdown-toggle]');
 if(phase==='running')label(labelEl,(lastQuestion(state)?'Results':'Next question')+' in '+seconds+' s',(lastQuestion(state)?'Risultati':'Prossima domanda')+' tra '+seconds+' s');
 else if(phase==='paused')label(labelEl,'Paused · '+seconds+' s left. Compare your answer.','In pausa · restano '+seconds+' s. Confronta la risposta.');
 else label(labelEl,autoEnabled()?'Continue when ready. Your answer stays visible.':'Automatic advance is off. Continue when ready.',autoEnabled()?'Continua quando vuoi. La risposta resta visibile.':'Avanzamento automatico disattivato. Continua quando vuoi.');
 toggle.hidden=phase==='manual';toggle.disabled=phase==='manual';label(toggle,phase==='running'?'Pause':'Resume',phase==='running'?'Pausa':'Riprendi');
 toggle.setAttribute('aria-label',t(phase==='running'?'Pause countdown to compare your answer':'Resume countdown from the time left',phase==='running'?'Metti in pausa il conto alla rovescia per confrontare la risposta':'Riprendi il conto alla rovescia dal tempo rimasto'));
 row.querySelector('.flow-countdown-fill').style.transform='scaleX('+Math.max(0,Math.min(1,ms/COUNTDOWN_MS)).toFixed(4)+')';
 const announcement=q.dataset.progressKey+':'+phase+':'+lang();
 if(row.dataset.announcedState!==announcement){
  row.dataset.announcedState=announcement;
  label(row.querySelector('.flow-countdown-announcement'),phase==='running'?'Automatic advance is running. Pause to compare your answer.':phase==='paused'?'Countdown paused. Your answer will stay here until you resume or choose Next.':'Automatic advance is not running. Continue when ready.',phase==='running'?'Avanzamento automatico attivo. Metti in pausa per confrontare la risposta.':phase==='paused'?'Conto alla rovescia in pausa. La risposta resta qui finché riprendi o scegli Avanti.':'Avanzamento automatico non attivo. Continua quando vuoi.');
 }
}
function countdownTick(){
 const q=question();if(!q||q.dataset.progressKey!==timerKey||!q.dataset.result){stopTimer();refreshStudy();return;}
 if(!autoEnabled()){stopTimer();refreshStudy();return;}
 if(document.hidden||modal()){pause();return;}
 sampleTime();if(remainingMs<=0){stopTimer();cancelReviewScroll();guide().move('next');return;}renderCountdown();
}
function resume(){
 const q=question();if(!q||q.dataset.progressKey!==timerKey||!q.dataset.result||countdownState!=='paused'||!remainingMs||!autoEnabled()||document.hidden||modal())return false;
 countdownState='running';deadline=performance.now()+remainingMs;timer=setInterval(countdownTick,100);refreshStudy();return true;
}
function startTimer(q){
 stopTimer();if(q!==question()||!q.dataset.result)return;
 timerKey=q.dataset.progressKey;
 if(autoEnabled()){remainingMs=COUNTDOWN_MS;remaining=5;countdownState='paused';if(!document.hidden&&!modal())resume();}
 refreshStudy();
}
function animateOnce(el,className){
 const old=animationCleanup.get(el);if(old){clearTimeout(old.timer);el.classList.remove(old.className);}
 el.classList.remove(className);if(reducedMotion())return;
 void el.offsetWidth;el.classList.add(className);
 const timer=setTimeout(()=>{el.classList.remove(className);animationCleanup.delete(el);},320);animationCleanup.set(el,{timer,className});
}
function enterQuestion(q){
 if(questionFrame)cancelAnimationFrame(questionFrame);
 questionFrame=requestAnimationFrame(()=>{questionFrame=0;if(q===question()&&studyArticle.dataset.numberMode!=='flip')animateOnce(q,'flow-question-entering');});
}
function revealAnswer(q){
 if(q!==question()||!q.dataset.result)return;
 const checked=q.dataset.result+'\n'+value(q);if(q.dataset.flowChecked===checked)return;
 q.dataset.flowChecked=checked;cancelReviewScroll();animateOnce(q,'flow-answer-revealing');startTimer(q);
 revealFrame=requestAnimationFrame(()=>{
  revealFrame=0;if(q!==question()||!q.dataset.result||document.hidden)return;
  viewport();
  const answer=q.querySelector('.model-answer'),feedback=q.querySelector('.feedback');if(!answer||answer.hidden)return;
  const v=root.visualViewport,top=(v?.offsetTop||0)+12,visibleBottom=v?v.height+v.offsetTop:innerHeight;
  const dockTop=dock?.classList.contains('flow-bottom-dock')?dock.getBoundingClientRect().top:visibleBottom;
  const bottom=Math.min(visibleBottom,dockTop)-12,available=bottom-top;if(available<60)return;
  const model=answer.getBoundingClientRect(),result=feedback.getBoundingClientRect();
  let start=Math.min(result.top,model.top),end=Math.max(result.bottom,model.bottom);
  const submitted=q.querySelector('input[type=text]:not([hidden])')||q.querySelector('input[type=radio]:checked')?.closest('.choice')||q.querySelector('.practice-match-pairs,.library-order-list');
  if(submitted){const r=submitted.getBoundingClientRect();if(end-r.top<=available)start=Math.min(start,r.top);}
  let delta=0;
  if(end-start>available){if(end>bottom||start<top)delta=start-top;}
  else if(end>bottom)delta=end-bottom;else if(start<top)delta=start-top;
  if(Math.abs(delta)>2){
   const smooth=!reducedMotion();reviewScroll=smooth;root.scrollBy({top:delta,behavior:smooth?'smooth':'instant'});
   if(smooth)reviewScrollEnd=setTimeout(()=>{reviewScroll=false;reviewScrollEnd=0;},1000);
  }
 });
}
root.addEventListener('scrollend',()=>{reviewScroll=false;clearTimeout(reviewScrollEnd);reviewScrollEnd=0;});
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
function skip(){const q=question(),a=guide();if(!q||q.dataset.result)return;stopTimer();q.dataset.result='skipped';const f=q.querySelector('.feedback');f.className='feedback skipped';label(f,'Skipped','Saltata');q.querySelector('.model-answer').hidden=false;a.recordFirst(q);a.show();root.ItalianStudySupport?.refreshQuestion(q);root.ItalianStudyPersistence?.captureAll();checkpoint();revealAnswer(q);}
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
 const auto=document.createElement('label');auto.innerHTML='<input type="checkbox" data-flow-auto><span data-flow-auto-label></span>';auto.querySelector('input').checked=autoEnabled();details.append(auto,shortcutOption());
 const help=document.createElement('p');help.className='flow-shortcuts';help.dataset.uiNoTranslate='';help.innerHTML='';details.append(help);
 for(const [scope,en,it] of [['set','Reset this set','Azzera questi esercizi'],['topic','Reset this topic','Azzera questo argomento'],['lesson','Reset lesson pathway','Azzera il percorso della lezione']]){
  if(scope==='lesson'&&!root.ItalianStudyContext?.lesson)continue;const b=button('data-flow-reset',en,it);b.dataset.flowReset=scope;details.append(b);
 }
 box.append(quit,results,details);studyArticle.querySelector('.guided-sheet-steps').before(box);
 const pager=studyArticle.querySelector('.guided-sheet-controls');const skipButton=button('data-flow-skip','Skip and reveal','Salta e mostra');pager.querySelector('.guided-sheet-controls-buttons').prepend(skipButton);
 const countdown=document.createElement('div');countdown.className='flow-countdown';countdown.hidden=true;countdown.dataset.flowCountdownState='manual';countdown.dataset.uiNoTranslate='';
 countdown.innerHTML='<p class="flow-countdown-label" role="timer" aria-live="off"></p><div class="flow-countdown-track" aria-hidden="true"><span class="flow-countdown-fill"></span></div><button type="button" data-flow-countdown-toggle></button><span class="flow-countdown-announcement" role="status" aria-live="polite" aria-atomic="true"></span>';pager.append(countdown);
}
function refreshStudy(){
 if(!studyArticle||!guide())return;const a=guide(),state=a.getState(),q=question(),pager=studyArticle.querySelector('.guided-sheet-controls');
 const inPractice=state.step==='practise'&&!state.finished;
 document.body.classList.toggle('flow-practising',inPractice);pager.classList.toggle('flow-bottom-dock',inPractice);
 if(inPractice&&studyArticle.dataset.numberMode!=='flip'){setDock(pager);}else if(dock===pager)setDock(null);
 if(q&&activeKey!==q.dataset.progressKey){const previous=activeKey;stopTimer();cancelReviewScroll();activeKey=q.dataset.progressKey;if(previous)enterQuestion(q);}
 if(!q){stopTimer();cancelReviewScroll();activeKey=null;if(questionFrame){cancelAnimationFrame(questionFrame);questionFrame=0;}}
 if(q&&!q.dataset.result){delete q.dataset.flowChecked;if(timerKey){stopTimer();cancelReviewScroll();}}
 studyArticle.querySelectorAll('.quiz-question').forEach(e=>{
  const b=e.querySelector('.check-button'),checked=!!e.dataset.result;
  if(b){b.disabled=checked||!ready(e);label(b,checked?'Answer checked':!ready(e)?(e.dataset.type==='match'?'Complete all pairs':'Enter answer first'):'Check answer',checked?'Risposta controllata':!ready(e)?(e.dataset.type==='match'?'Completa gli abbinamenti':'Inserisci prima la risposta'):'Controlla la risposta');}
  const answerLabel=e.querySelector('.model-answer>strong');if(answerLabel&&/^(Risposta|Answer)\s*:/.test(answerLabel.textContent))label(answerLabel,'Answer:','Risposta:');
  if(e.dataset.result==='skipped')label(e.querySelector('.feedback'),'Skipped','Saltata');
 });
 const next=pager.querySelector('[data-guided-action=next]'),back=pager.querySelector('[data-guided-action=back]'),sb=pager.querySelector('[data-flow-skip]');
 if(sb){sb.hidden=!q;sb.disabled=!!q?.dataset.result;label(sb,'Skip and reveal','Salta e mostra');}
 if(q){next.disabled=!q.dataset.result;const last=lastQuestion(state);label(next,last?(state.reviewIncorrect?'Finish review':'Finish practice'):'Next question',last?(state.reviewIncorrect?'Termina il ripasso':'Concludi gli esercizi'):'Prossima domanda');next.setAttribute('aria-keyshortcuts','Alt+ArrowRight');
  label(back,state.reviewIncorrect&&state.reviewQueue[0]===state.question?'Back to results':'Previous question',state.reviewIncorrect&&state.reviewQueue[0]===state.question?'Torna ai risultati':'Domanda precedente');
  const stats=a.stats();label(pager.querySelector('.guided-sheet-controls-status'),stats.attempted+' answered · '+stats.correct+' correct · '+stats.skipped+' skipped',stats.attempted+' risposte · '+stats.correct+' corrette · '+stats.skipped+' saltate');
 }
 renderCountdown();
 const options=studyArticle.querySelector('.flow-study-tools');if(options){options.querySelectorAll('button[data-en]').forEach(b=>label(b,b.dataset.en,b.dataset.it));label(options.querySelector('summary'),'Practice options','Opzioni degli esercizi');label(options.querySelector('[data-flow-auto-label]'),'Advance after 5 seconds','Avanza dopo 5 secondi');label(options.querySelector('.flow-shortcut-option span'),'Keyboard shortcuts','Scorciatoie da tastiera');label(options.querySelector('.flow-shortcuts'),'Enter: check. Alt+S: skip. Alt+H: hint. Alt+←/→: previous/next. Escape: pause. 1–9: select a choice when not typing. Tab: move between answers.','Invio: controlla. Alt+S: salta. Alt+H: suggerimento. Alt+←/→: precedente/successiva. Esc: pausa. 1–9: scegli un’opzione. Tab: passa alle risposte.');}
}
function mountStudy(){const el=$('.study-pack-sheet[data-guided-pilot=ready]');if(!el||!guide())return;if(studyArticle!==el){studyArticle=el;tools();setTimeout(()=>{
 const s=guide().getState();for(const q of guide().questions()){if(s.round.retryPending.includes(q.dataset.progressKey)){q.dataset.result='';q.querySelector('.feedback').textContent='';q.querySelector('.feedback').className='feedback';q.querySelector('.model-answer').hidden=true;}else if(q.dataset.result)s.round.last[q.dataset.progressKey]=q.dataset.result;}
 guide().show();root.ItalianStudyPersistence?.captureAll();refreshStudy();if(guide().getState().step==='practise'&&!guide().getState().finished&&scrollY<50)requestAnimationFrame(()=>guide().focusCurrent(24));},0);}refreshStudy();}
root.addEventListener('italian-study-view-changed',mountStudy);
root.addEventListener('italian-study-answer-checked',e=>{const q=e.detail.question;if(q?.dataset.result){root.ItalianStudyPersistence?.captureAll();checkpoint();revealAnswer(q);}refreshStudy();});
root.addEventListener('italian-interface-language-changed',()=>{pause();refreshStudy();mountFlash();});
root.addEventListener('blur',()=>{pause();finishTimerPress();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();finishTimerPress();}});
document.addEventListener('pointerdown',e=>{if(beginTimerPress(e.target))return;finishTimerPress();if(timer)pause();},true);
document.addEventListener('pointerup',endTimerPress,true);document.addEventListener('pointercancel',finishTimerPress,true);
document.addEventListener('keyup',e=>{if(e.key==='Enter'||e.code==='Space')endTimerPress();},true);
document.addEventListener('click',e=>{
 const target=e.target;if(!target.closest)return;
 const activation=target.closest('[data-flow-countdown-toggle],[data-guided-action=next],[data-guided-action=back]');
 const press=activation?clearTimerPress():null;
 if(press&&(press.control!==activation||press.key!==question()?.dataset.progressKey)){e.preventDefault();e.stopImmediatePropagation();return;}
 if(target.closest('[data-flow-countdown-toggle]')){
  e.preventDefault();e.stopImmediatePropagation();const action=press?.action||(countdownState==='running'?'pause':'resume');
  if(action==='pause'){pause();refreshStudy();}else if(action==='resume')resume();return;
 }
 if(target.closest('[data-flow-quit]')){e.preventDefault();e.stopImmediatePropagation();pause();root.ItalianStudyPersistence?.captureAll();guide()?.remember();checkpoint();location.href=root.ItalianStudyContext?.library||'/study/study-sheets.html';return;}
 if(target.closest('[data-flow-results]')){e.preventDefault();e.stopImmediatePropagation();pause();guide().setState({step:'practise',finished:true,reviewIncorrect:false});return;}
 const reset=target.closest('[data-flow-reset]');if(reset){e.preventDefault();e.stopImmediatePropagation();resetScope(reset.dataset.flowReset);return;}
 if(target.closest('[data-guided-review-incorrect],[data-guided-review-unanswered]')){e.preventDefault();e.stopImmediatePropagation();beginReview(target.closest('[data-guided-review-incorrect]')?'mistakes':'unanswered');return;}
 if(target.closest('[data-flow-skip]')){e.preventDefault();e.stopImmediatePropagation();skip();return;}
 if(timer)pause();
},true);
document.addEventListener('change',e=>{if(e.target.matches('[data-flow-shortcuts]')){try{localStorage.setItem('italianLearningShortcutsV2',e.target.checked?'on':'off');}catch(_){}document.querySelectorAll('[data-flow-shortcuts]').forEach(x=>x.checked=e.target.checked);pause();}if(e.target.matches('[data-flow-auto]')){try{localStorage.setItem('italianAutoAdvanceV2',e.target.checked?'on':'off');}catch(_){}stopTimer();cancelReviewScroll();}queueMicrotask(refreshStudy);});
document.addEventListener('input',e=>{const q=e.target.closest('.quiz-question');if(q){pause();delete q.dataset.flowChecked;queueMicrotask(refreshStudy);}});
const flash=()=>root.ItalianFlashcards;
let flashScope='',repeatState=null;
function flashKey(){const s=flash()?.getState();return 'italianFlashPracticeV2:'+s?.lesson+':'+s?.deck+':'+(s?.reviewOnly?'review':'all');}
function currentKey(){return flash()?.currentCard()?.key;}
function schedule(){const a=flash(),s=a?.getState();if(!s||s.page!=='card'||s.finished)return null;const key=flashKey();if(flashScope!==key){flashScope=key;repeatState=get(key,{seen:[],pending:[],tick:0,history:[]});}
 repeatState.seen=repeatState.seen||[];repeatState.pending=repeatState.pending||[];repeatState.history=repeatState.history||[];repeatState.tick=repeatState.tick||0;
 // Rendering and asynchronous content decoration are not learner actions.
 return repeatState;}
function goKey(k){const a=flash(),s=a.getState(),idx=a.activeCardList().findIndex(c=>c.key===k);if(idx<0)return false;a.navigate({...s,index:idx,finished:false},true,true);checkpoint();return true;}
function nextFlash(){const r=schedule(),a=flash();if(!r)return false;const k=currentKey();if(k&&!r.seen.includes(k))r.seen.push(k);r.history.push(k);r.history=r.history.slice(-300);r.tick++;
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
  const help=document.createElement('details');help.dataset.flowFlashHelp='';help.className='flow-flash-help';help.innerHTML='<summary></summary><p data-ui-no-translate></p>';help.append(shortcutOption());actions.append(help);
  const focus=button('data-flow-focus','Focus mode','Modalità concentrazione');const quit=button('data-flow-flash-quit','Quit and save','Esci e salva');actions.append(focus,quit);
 }
 label(actions.querySelector('[data-guide-rate=again]'),'1 · Again','1 · Ancora');label(actions.querySelector('[data-guide-rate=unsure]'),'2 · Not sure','2 · Non sono sicuro');label(actions.querySelector('[data-guide-rate=known]'),'3 · Got it','3 · Lo so');
 label(actions.querySelector('[data-flow-flash-help] summary'),'Keyboard and review','Tastiera e ripasso');label(actions.querySelector('[data-flow-flash-help] p'),'Space or Enter: flip. 1: Again, 2: Not sure, 3: Got it (after reveal). ←/→: previous/next. F: focus. Escape: exit focus. Again returns after 1 other card; Not sure after 3. Short topics repeat sooner. Got it leaves this round.','Spazio o Invio: gira. 1: Ancora, 2: Non sono sicuro, 3: Lo so (dopo la risposta). ←/→: precedente/successiva. F: concentrazione. Esc: esci. Ancora ritorna dopo 1 altra carta; Non sono sicuro dopo 3. Nei gruppi brevi ritorna prima. Lo so esce dal giro.');
 label(actions.querySelector('[data-flow-focus]'),document.body.classList.contains('guided-focus-active')?'Exit focus':'Focus mode',document.body.classList.contains('guided-focus-active')?'Esci dalla concentrazione':'Modalità concentrazione');
 label(actions.querySelector('[data-flow-flash-quit]'),'Quit and save','Esci e salva');
 const status=$('.guided-confidence-summary');if(status){const c=get('italianCourseSessionProgressV2').flashcards?.confidence||{},cards=a.activeCardList(),count=x=>cards.filter(y=>c[y.key]===x).length;label(status,'Got it: '+count('known')+' · Again: '+count('again')+' · Not sure: '+count('unsure'),'Lo so: '+count('known')+' · Ancora: '+count('again')+' · Non sono sicuro: '+count('unsure'));}
 label(actions.querySelector('[data-guide-prev]'),'Previous','Indietro');label(actions.querySelector('[data-guide-next]'),'Next','Avanti');
 const prev=actions.querySelector('[data-guide-prev]');if(prev&&repeatState?.history.length)prev.disabled=false;
 document.querySelectorAll('.flow-shortcut-option span').forEach(el=>label(el,'Keyboard shortcuts','Scorciatoie da tastiera'));requestAnimationFrame(viewport);
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
 // Native button activation must freeze at press-start, even with shortcuts off.
 if((e.key==='Enter'||e.code==='Space')&&beginTimerPress(e.target))return;
 if(!shortcutsEnabled()&&e.key!=='Escape')return;
 if(guide()&&studyArticle){
  const q=question();if(!q)return;
  if(e.key==='Escape'){e.preventDefault();pause();return;}
  if(e.altKey&&e.code==='KeyS'){e.preventDefault();e.stopImmediatePropagation();skip();return;}
  if(e.altKey&&e.code==='KeyH'){e.preventDefault();pause();q.querySelector('.hint-button')?.click();return;}
  if((e.altKey||!editing(e))&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(pause())return;guide().move(e.key==='ArrowLeft'?'back':'next');return;}
  if((!editing(e)||e.target.matches('input[type=radio]'))&&/^[1-9]$/.test(e.key)&&q.dataset.type==='choice'){e.preventDefault();pause();const r=q.querySelectorAll('input[type=radio]')[Number(e.key)-1];if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));r.focus({preventScroll:true});}return;}
  if(e.key==='Enter'&&(e.target.matches('input[type=text]:not([hidden]),input[type=radio]')||(!editing(e)&&!e.target.closest('button,a,summary')))){e.preventDefault();e.stopImmediatePropagation();if(pause())return;if(q.dataset.result)guide().move('next');else if(ready(q))q.querySelector('.check-button').click();return;}
  if(e.code==='Space'&&!editing(e)&&!e.target.closest('button,a,summary')&&timer){e.preventDefault();e.stopImmediatePropagation();pause();return;}
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
new MutationObserver(ms=>{if(dock&&ms.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('iframe,#test-hosting-badge')||n.querySelector?.('iframe,#test-hosting-badge')))))requestViewport();}).observe(document.documentElement,{childList:true,subtree:true});
const start=()=>{mountStudy();mountFlash();};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
