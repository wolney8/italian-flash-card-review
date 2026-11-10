/* Web-only study tools. Reads the canonical lesson; never changes answer history. */
(function(){
'use strict';
const root=document.getElementById('studySheets');
if(!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function word(w){
 const safe=esc(w);
 if(w==='mille')return '<span class="l6-n-thousand">mille</span>';
 if(w.endsWith('mila'))return safe.slice(0,-4)+'<span class="l6-n-thousand">mila</span>';
 if(w.endsWith('cento'))return safe.slice(0,-5)+'<span class="l6-n-hundred">cento</span>';
 if(w==='ventuno')return 'vent<span class="l6-n-join">uno</span>';
 if(w==='ventotto')return 'vent<span class="l6-n-join">otto</span>';
 if(w==='ventitré')return 'venti<span class="l6-n-accent">tré</span>';
 return safe;
}
function help(n){
 if(n===21||n===28)return 'venti loses its final i before uno or otto: '+(n===21?'vent + uno':'vent + otto')+'.';
 if(n===23)return 'venti + tré → ventitré. Keep the final accent.';
 if(n>21&&n<30)return 'Compare the repeating venti- with the unit ending.';
 if(n===100)return 'cento means one hundred.';
 if(n===1000)return 'mille means one thousand; larger multiples use -mila.';
 if(n>1000)return 'Compare mille with the repeated -mila ending in this column.';
 if(n>100&&n<1000)return 'The hundreds repeat -cento: due + cento, tre + cento…';
 return '';
}
function tile(n,w,index,items){
 const adjacent=items.slice(Math.max(0,index-1),index+2).map(x=>x[0]+' = '+x[1]).join(' · ');
 return '<details class="number-flip-card" data-number="'+n+'"><summary><span class="number-flip-numeral">'+n.toLocaleString('en-GB')+'</span><span class="number-flip-cue">Reveal Italian</span></summary><div class="number-flip-answer"><p lang="it">'+word(w)+'</p>'+(help(n)?'<p class="number-flip-help">'+esc(help(n))+'</p>':'')+'<small>'+esc(adjacent)+'</small></div></details>';
}
function group(title,items){return '<section class="number-flip-group"><h3>'+esc(title)+'</h3><div class="number-flip-grid">'+items.map(([n,w],i)=>tile(n,w,i,items)).join('')+'</div></section>';}
function catalogueLinks(){
 if(!document.body.classList.contains('study-sheet-library')||root.querySelector('.study-ready-shortcuts'))return;
 const bar=document.createElement('nav');bar.className='study-ready-shortcuts';bar.setAttribute('aria-label','Course shortcuts');
 bar.innerHTML='<a href="study-sheets.html?mode=learn&path=L6">Session 6 — class order</a><a href="study-sheets.html?mode=learn&sheet=l6-number-patterns&stage=practise&practice=flip">Numbers — flip & reveal</a><a href="study-sheets.html?mode=learn&sheet=known-verbs-and-forms&stage=learn">Verb reference</a>';
 root.prepend(bar);
}
function addNumberMode(){
 const article=root.querySelector('#l6-number-patterns[data-guided-pilot="ready"]');
 if(!article||article.dataset.numberTools)return;
 const lesson=window.ITALIAN_L6,source=lesson?.sheets.find(s=>s.slug===article.id);
 const quiz=article.querySelector('[data-study-quiz]');
 if(!source||!quiz)return;
 article.dataset.numberTools='ready';
 const items=source.questions.map((q,i)=>[lesson.numberPracticeValues[i],q.model]);
 const board=document.createElement('section');board.className='number-reveal-board';board.hidden=true;
 board.setAttribute('aria-label','Number flip cards');
 board.innerHTML='<div class="number-view-switch" role="group" aria-label="Number card layout"><button type="button" data-number-view="sequence" aria-pressed="true">Practice sequence</button><button type="button" data-number-view="patterns" aria-pressed="false">Pattern columns</button></div><div class="number-reveal-actions"><button type="button" data-number-action="reveal">Reveal all</button><button type="button" data-number-action="hide">Hide all</button><span class="number-reveal-status" role="status"></span></div><p class="number-reveal-note">Tap a number to reveal its Italian. Flips do not count as checked answers.</p><div data-number-panel="sequence">'+group('0–10',items.slice(0,11))+group('11–20',items.slice(11,21))+group('21–30',items.slice(21,31))+group('Tens, hundreds and thousands',items.slice(31))+'</div><div data-number-panel="patterns" hidden class="number-pattern-columns">'+['UNITÀ','DECINE','CENTINAIA','MIGLIAIA'].map((t,c)=>group(t,lesson.numberRows.map(row=>[row[c*2],row[c*2+1]]))).join('')+'</div>';
 const mode=document.createElement('div');mode.className='number-practice-modes';mode.setAttribute('role','group');mode.setAttribute('aria-label','Number practice method');
 mode.innerHTML='<button type="button" data-number-reveal-mode="write" aria-pressed="true">Write answers</button><button type="button" data-number-reveal-mode="flip" aria-pressed="false">Flip & reveal</button>';
 quiz.prepend(mode);mode.after(board);
 let view='sequence';
 function status(){const cards=[...board.querySelectorAll('[data-number-panel="'+view+'"] .number-flip-card')];board.querySelector('.number-reveal-status').textContent=cards.filter(c=>c.open).length+' / '+cards.length+' revealed';}
 function setMode(next){
  article.dataset.numberMode=next;board.hidden=next!=='flip';
  mode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.numberRevealMode===next)));
  // This changes presentation only; the canonical quiz and all saved attempts stay intact.
  status();
 }
 mode.addEventListener('click',e=>{const b=e.target.closest('[data-number-reveal-mode]');if(b)setMode(b.dataset.numberRevealMode);});
 board.addEventListener('click',e=>{
  const v=e.target.closest('[data-number-view]');
  if(v){view=v.dataset.numberView;board.querySelectorAll('[data-number-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===v)));board.querySelectorAll('[data-number-panel]').forEach(p=>p.hidden=p.dataset.numberPanel!==view);status();}
  const action=e.target.closest('[data-number-action]');
  if(action){board.querySelectorAll('[data-number-panel="'+view+'"] .number-flip-card').forEach(c=>c.open=action.dataset.numberAction==='reveal');status();}
 });
 board.addEventListener('toggle',status,true);
 setMode(new URLSearchParams(location.search).get('practice')==='flip'?'flip':'write');
}
function linkReference(){
 const article=root.querySelector('#di-da-dove-pronouns');
 if(!article||article.querySelector('.study-reference-link'))return;
 const a=document.createElement('a');a.className='study-reference-link';a.href='study-sheets.html?mode=learn&sheet=known-verbs-and-forms&stage=learn';a.textContent='Open the verb reference — forms, usage, pronunciation and di / da / dove';
 article.querySelector('header.hero')?.append(a);
}
function addVerbReference(){
 const article=root.querySelector('#known-verbs-and-forms[data-guided-pilot="ready"]');
 const panel=article?.querySelector(':scope > section.panel');
 if(!panel||panel.dataset.verbReference||!window.ItalianVerbReference)return;
 panel.dataset.verbReference='ready';
 const original=document.createElement('details');original.className='verb-original';
 const summary=document.createElement('summary');summary.textContent='Original pronoun map and lesson notes';original.append(summary);
 for(const child of [...panel.children])original.append(child);
 panel.innerHTML=window.ItalianVerbReference.markup();panel.append(original);
}
function init(){catalogueLinks();addNumberMode();linkReference();addVerbReference();}
let pending=false;
new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;init();});}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-guided-pilot']});
init();
})();
