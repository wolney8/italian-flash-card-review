/* Accessible matching and topic-only repeat rounds. Saved values never depend on option position. */
(function(root){
'use strict';
const B=root.ItalianPracticeBank;if(!B)return;
const {esc,pair}=B;
function renderMatching(slug,q,i){const id=slug+'-q'+i,options=q.pairs.map(p=>({id:p.id,right:p.right})).concat(q.extras);
const rows=q.pairs.map((p,row)=>'<div class="practice-match-row" data-match-id="'+p.id+'"><label for="'+id+'-match-'+p.id+'" lang="en" data-ui-no-translate>'+esc(p.left)+'</label><select id="'+id+'-match-'+p.id+'" data-match-select="'+p.id+'" aria-describedby="'+id+'-match-feedback-'+p.id+'"><option value="">'+(root.ItalianUI?.language==='it'?'Scegli…':'Choose…')+'</option>'+B.shuffle(options,B.seed(slug)+':match:'+i+':'+row).map(o=>'<option value="'+o.id+'" lang="it" data-ui-no-translate>'+esc(o.right)+'</option>').join('')+'</select><span class="practice-match-feedback" id="'+id+'-match-feedback-'+p.id+'" aria-live="polite"></span></div>').join('');
return '<article class="quiz-question" data-type="match" data-question-key="'+id+'" data-answers="'+esc(JSON.stringify(q.answers))+'" data-match-model="'+esc(q.model)+'" data-optional-subjects="[]" data-answer-mode="match"><div class="question-heading"><span class="question-number">'+i+'</span><span>'+q.prompt+'</span></div><button class="hint-button" type="button" aria-expanded="false">Mostra suggerimento</button><div class="hint" hidden>'+q.hint+'</div><div class="answer-row"><input id="'+id+'" type="text" hidden tabindex="-1" aria-hidden="true" autocomplete="off"><div class="practice-match-pairs">'+rows+'</div><button class="check-button" type="button" disabled>Controlla</button></div><div class="feedback" role="status"></div><div class="model-answer" hidden><strong>Risposta:</strong><div class="practice-match-key">'+q.pairs.map(p=>'<p><span lang="en">'+esc(p.left)+'</span> → <span lang="it">'+esc(p.right)+'</span></p>').join('')+'</div>'+q.explanation+'</div></article>';}
function checkMatch(q){let chosen=[];try{chosen=JSON.parse(q.querySelector('input[type=text]').value||'[]');}catch(_){}const expected=JSON.parse(q.dataset.matchModel);if(chosen.length!==expected.length||!chosen.every(Boolean))return;
const correct=chosen.every((v,i)=>v===expected[i]);q.dataset.result=correct?'correct':'wrong';
const feedback=q.querySelector('.feedback');feedback.className='feedback '+q.dataset.result;feedback.textContent=correct?'Corretto':'Sbagliato';q.querySelector('.model-answer').hidden=false;
q.querySelectorAll('[data-match-id]').forEach((row,i)=>{row.querySelector('.practice-match-feedback').innerHTML=chosen[i]===expected[i]?pair('Correct','Corretto'):pair('Check this pair','Controlla questo abbinamento');});
}
function readyMatch(q){try{const a=JSON.parse(q.querySelector('input[type=text]').value||'[]');return a.length===q.querySelectorAll('[data-match-select]').length&&a.every(Boolean);}catch(_){return false;}}
function hydrate(q){let saved=[];try{saved=JSON.parse(q.querySelector('input[type=text]').value||'[]');}catch(_){}q.querySelectorAll('[data-match-select]').forEach((s,i)=>{if(saved[i]!==undefined)s.value=saved[i];});
 q.querySelector('.check-button').disabled=!readyMatch(q);
 if(q.querySelector('.feedback.correct,.feedback.wrong'))checkMatch(q);
}
const PKEY='italianCourseSessionProgressV2';
function newRound(article){const slug=article.id,lang=root.ItalianUI?.language||'en';
 const questions=[...article.querySelectorAll('.quiz-question')];
 const unfinished=questions.some(q=>q.querySelector('input[type=text]')?.value||q.querySelector('input[type=radio]:checked'));
 if(unfinished&&!confirm(lang==='it'?'Iniziare un nuovo giro per questa scheda? Le altre schede non cambiano. Il risultato attuale verrà conservato.':'Start a fresh round for this sheet? Other sheets are unchanged. The current result will be saved.'))return;
 try{
  const progress=JSON.parse(sessionStorage.getItem(PKEY)||'{}');progress.study=progress.study||{answers:{}};progress.study.answers=progress.study.answers||{};
  const entries=Object.entries(progress.study.answers).filter(([id])=>id.startsWith(slug+'-q'));
  const history=JSON.parse(localStorage.getItem('italianPracticeHistoryV1')||'{}');history[slug]=(history[slug]||[]).concat({at:new Date().toISOString(),attempted:entries.filter(([,x])=>x.result).length,correct:entries.filter(([,x])=>x.result==='correct').length,total:questions.length}).slice(-10);
  localStorage.setItem('italianPracticeHistoryV1',JSON.stringify(history));
  entries.forEach(([id])=>delete progress.study.answers[id]);sessionStorage.setItem(PKEY,JSON.stringify(progress));
  sessionStorage.removeItem('italianGuidedSheetPilotV1:'+slug);sessionStorage.setItem('italianPracticeSeedV1:'+slug,String(Date.now())+':'+Math.random());
 }catch(_){/* Storage is optional. A clean query gets a usable practice session. */}
 const url=new URL(location.href);url.searchParams.set('stage','practise');url.searchParams.set('round',String(Date.now()));location.href=url.pathname+url.search;
}
function mount(){const article=document.querySelector('.study-pack-sheet');
 if(document.body.classList.contains('study-sheet-library')){
  const host=document.querySelector('.study-ready-shortcuts');if(host&&!host.querySelector('[data-verb-practice-link]')){
   const a=document.createElement('a');a.href='study-sheets.html?mode=learn&path=verbs';a.dataset.verbPracticeLink='true';a.innerHTML=pair('Verbs — practise','Verbi — esercizi');host.prepend(a);
  }
 }
 if(!article||article.dataset.guidedPilot!=='ready'||article.dataset.repeatPractice)return;
 const quiz=article.querySelector('[data-study-quiz]');if(!quiz)return;
 article.dataset.repeatPractice='ready';
 const toolbar=document.createElement('div');toolbar.className='practice-round-toolbar';
 toolbar.innerHTML='<button type="button" data-new-practice-round>'+pair('New practice round','Nuovo giro di esercizi')+'</button><a href="study-sheets.html?mode=learn&path=verbs">'+pair('All verb practice','Tutti gli esercizi sui verbi')+'</a><p>'+pair('Choices stay in place while you work. A new round shuffles them and resets only this sheet.','Le opzioni restano ferme durante il lavoro. Un nuovo giro le mescola e azzera solo questa scheda.')+'</p>';
 quiz.prepend(toolbar);
 const finish=article.querySelector('.guided-sheet-finish');if(finish){const button=document.createElement('button');button.type='button';button.dataset.newPracticeRound='true';button.innerHTML=pair('New practice round','Nuovo giro di esercizi');finish.append(button);}
 try{const previous=JSON.parse(localStorage.getItem('italianPracticeHistoryV1')||'{}')[article.id]?.at(-1);if(previous){const p=document.createElement('p');p.className='practice-last-round';p.innerHTML=pair('Previous round: '+previous.correct+' / '+previous.total+' correct.','Giro precedente: '+previous.correct+' / '+previous.total+' corrette.');toolbar.append(p);}}catch(_){}
 setTimeout(()=>article.querySelectorAll('[data-type=match]').forEach(hydrate),0);
}
document.addEventListener('change',e=>{const select=e.target.closest('[data-match-select]');if(!select)return;
 const q=select.closest('.quiz-question'),values=[...q.querySelectorAll('[data-match-select]')].map(s=>s.value),input=q.querySelector('input[type=text]');
 input.value=values.some(Boolean)?JSON.stringify(values):'';
 q.querySelectorAll('.practice-match-feedback').forEach(s=>s.textContent='');
 input.dispatchEvent(new Event('input',{bubbles:true}));
});
document.addEventListener('click',e=>{if(e.target.closest('[data-new-practice-round]'))newRound(e.target.closest('.study-pack-sheet'));});
root.ItalianPracticeUI={renderMatching,checkMatch,readyMatch,mount};
const host=document.getElementById('studySheets');if(host)new MutationObserver(mount).observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['data-guided-pilot']});
mount();
})(window);
