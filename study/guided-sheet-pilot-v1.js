/* Guided learning for all nine Study Sheets.
   Progressive enhancement: the original complete sheet remains usable on error. */
(function () {
  'use strict';

  const TARGET = new URLSearchParams(location.search).get('sheet')
    || decodeURIComponent(location.hash.slice(1));
  if (!TARGET) return;
  const SET_ID=new URLSearchParams(location.search).get('set')||TARGET;
  const VIEW_KEY = 'italianGuidedSheetPilotV1:' + (SET_ID===TARGET?TARGET:SET_ID);
  const ROUND_KEY='italianStudyRoundV2:'+SET_ID;
  const STEP_IDS = ['learn', 'examples', 'practise'];
  const STEP_LABELS = ['Learn', 'Examples', 'Practise'];
  const STEP_HELP = ['Understand the rule','Recognise the pattern','Check your understanding'];
  const INSTRUCTIONS = ['Read the explanation. Use Next when you are ready.','Look for patterns in the examples, then try a question.','Choose or type an answer, then select Check answer.'];
  const root = document.getElementById('studySheets');
  if (!root) return;
  function savedState() {try{return JSON.parse(sessionStorage.getItem(VIEW_KEY)||'{}');}catch(_){return {};}}
  function remember(state) {try{sessionStorage.setItem(VIEW_KEY,JSON.stringify(state));}catch(_){}}
  function clamp(n,size) {return Number.isInteger(n)&&n>=0&&n<size?n:0;}
  function result(question) {
    const feedback=question.querySelector('.feedback');
    if(feedback&&feedback.classList.contains('correct'))return 'correct';
    if(feedback&&feedback.classList.contains('wrong'))return 'wrong';
    return null;
  }
  function initialise() {
    const article=root.querySelector('.study-pack-sheet');
    if(!article||article.id !== TARGET)return false;
    if(article.dataset.guidedPilot==='ready')return true;
    const hero=article.querySelector(':scope > header.hero');
    const quiz=article.querySelector(':scope > section[data-study-quiz]');
    const panels=[...article.querySelectorAll(':scope > section.panel')].filter(p=>p!==quiz);
    const explicitStages=panels.some(p=>p.dataset.studyStage);
    const learn = explicitStages?panels.filter(p=>p.dataset.studyStage==='learn'):panels.slice(0, 1);
    const examples = explicitStages?panels.filter(p=>p.dataset.studyStage==='examples'):panels.slice(1);
    const allQuestions=quiz?[...quiz.querySelectorAll('.quiz-question')]:[];
    const context=root&&window.ItalianStudyContext;
    allQuestions.forEach((q,i)=>{q.dataset.progressKey=TARGET+'-q'+(i+1);});
    const scope=(context?.scopeIndices||allQuestions.map((_,i)=>i)).map(i=>allQuestions[i]).filter(Boolean);
    const storedRound=window.ItalianStudyLibrary.get(ROUND_KEY);
    const validKeys=new Set(scope.map(q=>q.dataset.progressKey));
    let round=storedRound.keys?.length&&storedRound.keys.every(k=>validKeys.has(k))?storedRound:{id:String(Date.now()),mode:'full',keys:scope.map(q=>q.dataset.progressKey),first:{},finished:false};
    const questions=round.keys.map(k=>scope.find(q=>q.dataset.progressKey===k));
    round.first=round.first||{};
    const saveRound=()=>window.ItalianStudyLibrary.put(ROUND_KEY,round);
    saveRound();
    if(!hero||!quiz||!learn.length||!examples.length||!questions.length){
      if(hero&&quiz)console.warn('Guided Study Sheet: missing content group for '+TARGET);
      return false;
    }
    const old=savedState();
    const state={
      step:STEP_IDS.includes(new URLSearchParams(location.search).get('stage'))?new URLSearchParams(location.search).get('stage'):'practise',
      learn:clamp(old.learn,learn.length),examples:clamp(old.examples,examples.length),question:clamp(old.question,questions.length),finished:!!round.finished,
      reviewIncorrect:!!old.reviewIncorrect,
      reviewQueue:Array.isArray(old.reviewQueue)?old.reviewQueue.filter(n=>Number.isInteger(n)&&n>=0&&n<questions.length):[],
      visitedLearn:Array.isArray(old.visitedLearn)?[...new Set(old.visitedLearn.filter(n=>Number.isInteger(n)&&n>=0&&n<learn.length))]:[],
      visitedExamples:Array.isArray(old.visitedExamples)?[...new Set(old.visitedExamples.filter(n=>Number.isInteger(n)&&n>=0&&n<examples.length))]:[]
    };
    const intro=[...hero.children].filter(c=>c.tagName==='P'&&!c.classList.contains('lead'));
    if(intro.length){
      const teachingNote=document.createElement('div');teachingNote.className='guided-sheet-teaching-note';
      for(const paragraph of intro)teachingNote.appendChild(paragraph);
      const firstHeading=learn[0].querySelector('h2');
      if(firstHeading)firstHeading.insertAdjacentElement('afterend', teachingNote);else learn[0].prepend(teachingNote);
    }
    const actions=hero.querySelector('.actions');
    const backLink=actions?.querySelector('a[href*="study-sheets.html"]');
    if(backLink)backLink.hidden=true;
    const originalHelp=quiz.querySelector('.quiz-intro');
    if(originalHelp){const disclosure=document.createElement('details');disclosure.className='guided-sheet-tips';disclosure.innerHTML='<summary>Answer tips</summary>';originalHelp.parentNode.insertBefore(disclosure,originalHelp);disclosure.appendChild(originalHelp);}
    const steps=document.createElement('div');steps.className='guided-sheet-steps';
    steps.innerHTML=window.ItalianLearningSession.progressMarkup({label:'Overall progress',completed:0,total:learn.length+examples.length+questions.length,prefix:'guided-sheet-progress'})+
      '<nav class="guided-sheet-step-navigation" aria-label="Study stages">'+STEP_IDS.map((id,i)=>'<button type="button" data-guided-step="'+id+'"><span class="guided-sheet-step-number">'+(i+1)+'</span><span class="guided-sheet-step-copy"><span>'+STEP_LABELS[i]+'</span><small>'+STEP_HELP[i]+'</small></span></button>').join('')+'</nav><div class="guided-sheet-current" aria-live="polite"><p class="guided-sheet-position"></p><h2 class="guided-sheet-current-title" tabindex="-1"></h2><p class="guided-sheet-instruction"></p></div>';
    hero.insertAdjacentElement('afterend',steps);
    const finish=document.createElement('section');finish.className='panel guided-sheet-finish';finish.setAttribute('aria-live','polite');
    finish.innerHTML='<h2 class="guided-sheet-finish-title">Practice summary</h2><p class="guided-sheet-finish-score"></p><p class="guided-sheet-finish-explanation"></p><button type="button" class="guided-sheet-review-missed" data-guided-review-incorrect>Review incorrect answers</button> <button type="button" class="guided-sheet-review-missed" data-guided-review-unanswered>Review unanswered questions</button>';
    quiz.insertAdjacentElement('afterend',finish);
    const followup=document.createElement('a');followup.className='guided-sheet-followup';followup.href=context?.next?.href||context?.library||'study-sheets.html';followup.textContent=context?.next?'Next practice set: '+context.next.title+' →':'Back to lesson';finish.querySelector('[data-guided-review-unanswered]').before(followup);
    const returnLink=document.createElement('a');returnLink.className='study-return-link';returnLink.href=context?.library||'study-sheets.html';returnLink.textContent='Back to topics';finish.appendChild(returnLink);
    const groups=null;
    if(groups){
      const chooser=document.createElement('div');chooser.className='study-practice-picker';const label=document.createElement('label');label.htmlFor='studyPracticePicker';label.textContent='Practice set';const select=document.createElement('select');select.id='studyPracticePicker';
      for(const group of groups){const option=document.createElement('option');option.value=group.slug;option.textContent=group.label;option.selected=group.slug===TARGET;select.appendChild(option);}
      chooser.append(label,select);quiz.prepend(chooser);
      select.addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('sheet',select.value);url.searchParams.set('stage','practise');location.href=url.pathname+url.search;});
      const practiceLinks=document.createElement('div');practiceLinks.className='study-practice-links';const heading=document.createElement('h3');heading.textContent='Other practice for this topic';practiceLinks.appendChild(heading);
      for(const group of groups.filter(g=>g.slug!==TARGET)){const link=document.createElement('a');const url=new URL(location.href);url.searchParams.set('sheet',group.slug);url.searchParams.set('stage','practise');link.href=url.pathname+url.search;link.textContent=group.label;practiceLinks.appendChild(link);}finish.appendChild(practiceLinks);
    }
    const pager=document.createElement('div');pager.className='guided-sheet-controls';pager.innerHTML='<span class="guided-sheet-controls-status" aria-live="polite"></span><div class="guided-sheet-controls-buttons learning-session-controls"><button type="button" data-guided-action="back">Previous</button><button type="button" class="guided-sheet-primary" data-guided-action="next">Next</button></div>';finish.insertAdjacentElement('afterend',pager);
    const status=steps.querySelector('.guided-sheet-position'),title=steps.querySelector('.guided-sheet-current-title'),instruction=steps.querySelector('.guided-sheet-instruction'),progressCount=steps.querySelector('.guided-sheet-progress-count'),progressTrack=steps.querySelector('.guided-sheet-progress-track'),progressFill=steps.querySelector('.guided-sheet-progress-fill');
    const previousButton=pager.querySelector('[data-guided-action="back"]'),nextButton=pager.querySelector('[data-guided-action="next"]'),controlsStatus=pager.querySelector('.guided-sheet-controls-status'),reviewUnanswered=finish.querySelector('[data-guided-review-unanswered]'),reviewIncorrect=finish.querySelector('[data-guided-review-incorrect]'),finishTitle=finish.querySelector('.guided-sheet-finish-title'),finishScore=finish.querySelector('.guided-sheet-finish-score'),finishExplanation=finish.querySelector('.guided-sheet-finish-explanation');
    function stats(){const states=questions.map(result);return {attempted:states.filter(Boolean).length,correct:states.filter(x=>x==='correct').length,wrong:states.filter(x=>x==='wrong').length,incorrectIndices:states.map((x,i)=>x==='wrong'?i:-1).filter(i=>i>=0),firstUnanswered:states.indexOf(null)};}
    function show(){
      const step=state.step,practice=step==='practise',reviewing=practice&&state.reviewIncorrect&&!state.finished&&state.reviewQueue.length>0;
      if(step==='learn'&&!state.visitedLearn.includes(state.learn))state.visitedLearn.push(state.learn);
      if(step==='examples'&&!state.visitedExamples.includes(state.examples))state.visitedExamples.push(state.examples);
      for(const [i,panel] of learn.entries())panel.hidden=!(step==='learn'&&i===state.learn);
      for(const [i,panel] of examples.entries())panel.hidden=!(step==='examples'&&i===state.examples);
      quiz.hidden=!(practice&&!state.finished);finish.hidden=!(practice&&state.finished);
      // Keep the focused question mounted during a score refresh. Briefly hiding
      // every question commits native blur/change and can swallow a pending click.
      const activeQuestion=practice&&!state.finished?questions[state.question]:null;
      for(const question of allQuestions){const hidden=question!==activeQuestion;if(question.hidden!==hidden)question.hidden=hidden;}
      for(const [i,question] of questions.entries()){const number=question.querySelector('.question-number');if(number.textContent!==String(i+1))number.textContent=String(i+1);}
      for(const button of steps.querySelectorAll('[data-guided-step]')){if(button.dataset.guidedStep===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}
      const pos=STEP_IDS.indexOf(step),stat=stats(),totalActivities=learn.length+examples.length+questions.length;const covered = state.visitedLearn.length + state.visitedExamples.length + stat.attempted;
      progressCount.textContent=covered+' of '+totalActivities+' activities';progressTrack.setAttribute('aria-valuenow',String(covered));progressTrack.setAttribute('aria-valuemax',String(totalActivities));progressTrack.setAttribute('aria-valuetext',covered+' of '+totalActivities+' activities viewed or answered');progressFill.style.width=(100*covered/totalActivities).toFixed(1)+'%';
      const count=step==='learn'?learn.length:step==='examples'?examples.length:reviewing?state.reviewQueue.length:questions.length;
      const current=step==='learn'?state.learn:step==='examples'?state.examples:reviewing?Math.max(0,state.reviewQueue.indexOf(state.question)):state.question;
      const unit=reviewing?'Incorrect answer':practice?'Question':'Part';
      const position=practice&&state.finished?'Summary':unit+' '+(current+1)+' of '+count;
      status.textContent='Step '+(pos+1)+' of 3 · '+position;title.textContent=practice&&state.finished?'Your practice results':STEP_LABELS[pos];instruction.textContent=practice&&state.finished?'Review your progress or return to a question.':INSTRUCTIONS[pos];
      controlsStatus.textContent=practice?stat.attempted+' of '+questions.length+' attempted · '+stat.correct+' correct':position;
      const first=step==='learn'&&state.learn===0;previousButton.disabled=first;
      previousButton.textContent=practice&&state.finished?'Back to questions':reviewing&&current===0?'Back to results':practice?(state.question?'Previous question':'Back to examples'):step==='examples'?(state.examples?'Previous example':'Back to learn'):'Previous section';
      if(step==='learn')nextButton.textContent=state.learn<learn.length-1?'Next section':'Next: Examples';
      if(step==='examples')nextButton.textContent=state.examples<examples.length-1?'Next example':'Next: Practise';
      if(practice)nextButton.textContent=state.finished?'Review from start':reviewing?(current<count-1?'Next incorrect':'Finish review'):state.question<questions.length-1?'Next question':'Finish practice';
      finishTitle.textContent=stat.attempted===questions.length?(round.mode==='quick'?'Quick round completed':'Practice complete'):'Practice summary';finishScore.textContent=stat.correct+' of '+questions.length+' correct';
      finishExplanation.textContent=stat.attempted===questions.length?'You have answered every question. You can revisit any of them.':'You have attempted '+stat.attempted+' of '+questions.length+' questions.';
      reviewUnanswered.hidden=stat.firstUnanswered<0;reviewIncorrect.hidden=stat.wrong===0;reviewIncorrect.textContent='Retry mistakes ('+stat.wrong+')';reviewIncorrect.classList.toggle('guided-sheet-primary',stat.wrong>0);reviewUnanswered.classList.toggle('guided-sheet-primary',stat.wrong===0&&stat.firstUnanswered>=0);followup.classList.toggle('guided-sheet-secondary',stat.wrong>0||stat.firstUnanswered>=0);
      if(stat.wrong>0)finish.prepend(finishTitle,finishScore,finishExplanation,reviewIncorrect);
      const firstCorrect=Object.values(round.first||{}).filter(x=>x==='correct').length;
      const corrected=questions.filter(q=>round.first?.[q.dataset.progressKey]==='wrong'&&result(q)==='correct').length;
      finishExplanation.innerHTML=window.ItalianStudyLibrary.pair('Attempted: '+stat.attempted+' / '+questions.length+'. First checks: '+firstCorrect+' correct. Corrected after retry: '+corrected+'. Unanswered: '+(questions.length-stat.attempted)+'.','Svolti: '+stat.attempted+' / '+questions.length+'. Prime risposte corrette: '+firstCorrect+'. Correzioni dopo un errore: '+corrected+'. Senza risposta: '+(questions.length-stat.attempted)+'.');
      round.finished=state.finished;round.questionKey=questions[state.question]?.dataset.progressKey;saveRound();const label=article.querySelector('.library-round-label');if(label)label.textContent=(round.mode==='quick'?'Quick practice':'Full exercise set')+' · '+questions.length+' questions';remember(state);const stepUrl=new URL(location.href);stepUrl.searchParams.set('stage',state.step);history.replaceState(null,'',stepUrl.pathname+stepUrl.search+stepUrl.hash);
    }
    function focusStage(previousTop=null){title.focus({preventScroll:true});const delta=steps.getBoundingClientRect().top-16;if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'instant'});}
    function focusCurrent(previousQuestionTop = null){
      const currentQuestion=state.step==='practise'&&!state.finished?questions[state.question]:null;
      if(currentQuestion){const heading=currentQuestion.querySelector('.question-heading');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}const rect=currentQuestion.getBoundingClientRect(),viewportHeight=window.innerHeight||document.documentElement.clientHeight,safeBottom=Math.max(18,viewportHeight-110),desiredTop=previousQuestionTop===null?rect.top:previousQuestionTop,targetTop=Math.max(18,Math.min(desiredTop,safeBottom)),delta=rect.top-targetTop;if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'instant'});return;}focusStage();
    }
    function move(action){
      const oldStageTop=steps.getBoundingClientRect().top,previousStep=state.step,wasFinished=state.finished;
      const oldQuestionTop=state.step==='practise'&&!state.finished?questions[state.question]?.getBoundingClientRect().top??null:null;
      if(state.step==='practise'&&state.reviewIncorrect&&!state.finished&&state.reviewQueue.length){const cursor=state.reviewQueue.indexOf(state.question);if(action==='back'){if(cursor>0)state.question=state.reviewQueue[cursor-1];else{state.finished=true;state.reviewIncorrect=false;}}else if(cursor<state.reviewQueue.length-1)state.question=state.reviewQueue[cursor+1];else{state.finished=true;state.reviewIncorrect=false;}show();focusCurrent(oldQuestionTop);return;}
      if(action==='back'){
        if(state.step==='practise'){if(state.finished)state.finished=false;else if(state.question>0)state.question--;else state.step='examples';}
        else if(state.step==='examples'){if(state.examples>0)state.examples--;else state.step='learn';}
        else if(state.learn>0)state.learn--;
      }else{
        if(state.step==='learn'){if(state.learn<learn.length-1)state.learn++;else state.step='examples';}
        else if(state.step==='examples'){if(state.examples<examples.length-1)state.examples++;else state.step='practise';}
        else if(state.finished){state.question=0;state.finished=false;}
        else if(state.question<questions.length-1)state.question++;else state.finished=true;
      }
      show();if(previousStep!==state.step||wasFinished!==state.finished)focusStage(oldStageTop);else focusCurrent(oldQuestionTop);
    }
    steps.addEventListener('click',event=>{const button=event.target.closest('[data-guided-step]');if(!button)return;const oldStageTop=steps.getBoundingClientRect().top;state.step=button.dataset.guidedStep;state.finished=false;state.reviewIncorrect=false;show();focusStage(oldStageTop);});
    pager.addEventListener('click',event=>{const button=event.target.closest('[data-guided-action]');if(button)move(button.dataset.guidedAction);});
    reviewIncorrect.addEventListener('click',()=>{const queue=stats().incorrectIndices;if(!queue.length)return;state.reviewIncorrect=true;state.reviewQueue=queue;state.step='practise';state.question=queue[0];state.finished=false;show();focusStage();});
    reviewUnanswered.addEventListener('click',()=>{const missing=stats().firstUnanswered;if(missing<0)return;state.step='practise';state.question=missing;state.finished=false;state.reviewIncorrect=false;show();focusStage();});
    // An edit is not navigation. Avoid stage redraws between pointer down and up.
    function refreshAnswer(question){if(!question)return;setTimeout(()=>{recordFirst(question);show();window.ItalianStudySupport?.refreshQuestion(question);},0);}
    article.addEventListener('click',event=>{if(event.target.closest('.check-button'))refreshAnswer(event.target.closest('.quiz-question'));});
    article.addEventListener('input',event=>{const question=event.target.closest('.quiz-question');if(question)window.ItalianStudySupport?.refreshQuestion(question);});
    function recordFirst(q){if(!q)return;const r=result(q);if(r&&!round.first[q.dataset.progressKey]){round.first[q.dataset.progressKey]=r;saveRound();}}
    function newRound(mode=round.mode){
      if(!['quick','full'].includes(mode))mode='full';const latest=questions.map(q=>({key:q.dataset.progressKey,result:result(q)}));
      if(latest.some(q=>q.result)&&!confirm(window.ItalianUI?.language==='it'?'Iniziare un nuovo giro? Gli altri esercizi non cambiano.':'Start a new round? Other exercise sets are unchanged.'))return;
      const historyKey='italianStudyRoundHistoryV2:'+SET_ID,history=window.ItalianStudyLibrary.get(historyKey,[]);
      if(latest.some(q=>q.result))window.ItalianStudyLibrary.put(historyKey,history.concat({...round,results:latest,at:Date.now()}).slice(-10));
      const seed=Date.now()+':'+Math.random(),nextKeys=mode==='quick'?window.ItalianPracticeBank.shuffle([...validKeys],seed).slice(0,10):scope.map(q=>q.dataset.progressKey),progress=window.ItalianStudyLibrary.get('italianCourseSessionProgressV2');
      progress.study=progress.study||{};progress.study.answers=progress.study.answers||{};nextKeys.forEach(k=>delete progress.study.answers[k]);window.ItalianStudyLibrary.put('italianCourseSessionProgressV2',progress);window.ItalianStudyLibrary.put(ROUND_KEY,{id:seed,mode,keys:nextKeys,first:{},finished:false});
      try{sessionStorage.removeItem(VIEW_KEY);sessionStorage.setItem('italianPracticeSeedV1:'+TARGET,seed);}catch(_){}
      const url=new URL(location.href);url.searchParams.set('stage','practise');url.searchParams.delete('round');location.href=url.pathname+url.search;
    }
    article.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[type=text]:not([hidden])'))refreshAnswer(e.target.closest('.quiz-question'));});
    window.ItalianGuidedStudy={newRound,remember:()=>{remember(state);saveRound();},getState:()=>({...state,round}),questions:()=>questions};
    article.dataset.guidedPilot='ready';document.body.classList.add('guided-study-pilot');show();
    setTimeout(()=>{show();window.ItalianStudyLibrary.mountDetail(article);window.ItalianUI?.refresh();window.ItalianCourseBoot?.ready();},0);
    return true;
  }
  if(initialise())return;
  const observer=new MutationObserver(()=>{if(initialise())observer.disconnect();});observer.observe(root,{childList:true,subtree:true});
})();
