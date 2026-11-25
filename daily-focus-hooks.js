/* Small, reversible focus flags beside existing practice. Visits never imply recall. */
(function (root) {
  'use strict';
  const titles={articles:'Articles',sounds:'Sounds and spelling',prepositions:'In, on and from',verbs:'Verb forms',questions:'Questions and classroom phrases',objects:'Subjects and objects',conversation:'Everyday conversation',numbers:'Numbers'};
  let queued=false;
  const seenChecks=new WeakMap();
  function topicFor(value) {
    if(root.ItalianDailyFocusContent?.topicFor)return root.ItalianDailyFocusContent.topicFor(value);
    const text=String(value || '').toLowerCase();
    if(/article|partitiv|plural|singolare/.test(text))return 'articles';
    if(/preposition|^(?:\d+\s+)?(?:in the|on the|from the)(?:\s*[,/·]|$)/.test(text))return 'prepositions';
    if(/sound|pronunc|phonetic|alphabet|spelling|silent.h|town.code|(?:^|[- ])(?:c|g)[- ]columns/.test(text))return 'sounds';
    if(/number|calculation/.test(text))return 'numbers';
    if(/useful.question|question.word|classroom|^questions/.test(text))return 'questions';
    if(/object|word.jobs|grammar.in.context/.test(text))return 'objects';
    if(/verb|pronoun|essere|avere|fare|stare|venire|andare|chiamarsi|lavorare|parlare|studiare|mangiare|vivere|abitare|negative|^l7-(?:class|homework|endings|families|connected)|^l6-recap/.test(text))return 'verbs';
    return 'conversation';
  }
  const cardTopic=card=>root.ItalianDailyFocusContent?.topicForCard(card) || topicFor(card.deck || card.key);
  function button(kind,id,label) {
    const el=document.createElement('button');el.type='button';el.className='focus-flag guided-secondary';
    el.dataset.focusFlagKind=kind;el.dataset.focusFlagId=id;el.dataset.focusFlagLabel=label;
    el.setAttribute('data-ui-no-translate','');el.lang='en-GB';
    return el;
  }
  function paint(el) {
    const flagged=root.ItalianDailyFocus?.isFlagged(el.dataset.focusFlagKind,el.dataset.focusFlagId) || false;
    el.setAttribute('aria-pressed',String(flagged));
    const item=el.dataset.focusFlagKind==='item';
    const label=item?'This item':el.dataset.focusFlagLabel;
    const text=flagged?(item?'Needs practice ✓':label+' ✓'):(item?'Needs practice':'Flag '+label.toLowerCase());
    if(el.textContent!==text)el.textContent=text;
    el.setAttribute('aria-label',(flagged?'Clear needs practice flag for ':'Mark needs practice for ')+label.toLowerCase());
    el.title=flagged?'Clear this flag when you feel comfortable.':'Give this priority in Daily Focus.';
  }
  function group(host,item,topicId,{topicOnly=false}={}) {
    if(!host || !root.ItalianDailyFocus)return;
    let bar=[...host.children].find(el=>el.classList?.contains('focus-practice-flags'));
    const identity=(topicOnly?'topic:'+topicId:item.id);
    if(bar?.dataset.focusIdentity!==identity){bar?.remove();bar=null;}
    if(!bar){
      bar=document.createElement('div');bar.className='focus-practice-flags';bar.dataset.focusIdentity=identity;
      bar.setAttribute('role','group');bar.setAttribute('aria-label','Daily Focus practice flags');
      if(!topicOnly)bar.append(button('item',item.id,item.task || item.label || 'This item'));
      if(topicId)bar.append(button('topic',topicId,titles[topicId] || topicId));
      host.append(bar);
    }
    bar.querySelectorAll('[data-focus-flag-kind]').forEach(paint);
  }
  function sheetItem(q) {
    const sheet=q.closest('.study-pack-sheet'),slug=sheet?.id || '';
    const sourceId=q.dataset.questionKey || q.dataset.progressKey;
    if(!sourceId)return null;
    const canonical=root.ItalianStudyData?.find(item=>item.slug===slug);
    if(canonical && root.ItalianDailyFocusContent){
      const index=canonical.questions.findIndex((row,i)=>(row.id || slug+'-q'+(i+1))===sourceId || slug+'-q'+(i+1)===q.dataset.progressKey);
      if(index>=0)return root.ItalianDailyFocusContent.sheetQuestion(canonical.questions[index],canonical,index);
    }
    if(!['text','choice'].includes(q.dataset.type))return null;
    const topicId=topicFor(slug);
    return {id:'sheet:'+sourceId,sourceId,topicId,topicTitle:titles[topicId],type:'question',origin:'study-sheet',
      task:q.querySelector('.worksheet-task,.question-task,h3')?.textContent?.trim() || 'Study-sheet question'};
  }
  function decorate() {
    queued=false;
    if(!root.ItalianDailyFocus)return;
    const card=root.ItalianFlashcards?.currentCard();
    const cardHost=document.querySelector('.guided-card-host');
    if(card && cardHost){
      // The toolbar is outside the authored card content and its reveal state.
      const item=root.ItalianDailyFocusContent?.cardItem(card);
      if(root.ItalianDailyFocusContent && !item)group(cardHost,null,cardTopic(card),{topicOnly:true});
      else group(cardHost,item || {id:'card:'+card.key,task:'Flashcard '+card.key},cardTopic(card));
    }
    document.querySelectorAll('.study-pack-sheet').forEach(sheet=>{
      const topicId=topicFor(sheet.id),actions=sheet.querySelector('.hero .actions');
      group(actions,null,topicId,{topicOnly:true});
      sheet.querySelectorAll('.quiz-question').forEach(q=>{
        const item=sheetItem(q);if(item)group(q,item,null);
      });
    });
    document.querySelectorAll('[data-focus-flag-kind]').forEach(paint);
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(decorate);}}
  function studyCheck(q) {
    if(!q || !['correct','wrong'].includes(q.dataset.result))return;
    const item=sheetItem(q);if(!item)return;
    const value=q.querySelector('input[type=radio]:checked')?.value || q.querySelector('input[type=text]')?.value || '';
    const signature=q.dataset.result+'|'+value;
    if(seenChecks.get(q)===signature)return;
    seenChecks.set(q,signature);
    root.ItalianDailyFocus?.recordExternalAttempt(item,{correct:q.dataset.result==='correct',confidence:null,value,at:Date.now()});
  }
  document.addEventListener('click',event=>{
    const flag=event.target.closest('[data-focus-flag-kind]');
    if(flag){
      event.preventDefault();
      const api=root.ItalianDailyFocus;if(!api)return;
      const {focusFlagKind:kind,focusFlagId:id,focusFlagLabel:label}=flag.dataset;
      api.setFlag(kind,id,!api.isFlagged(kind,id),label);paint(flag);return;
    }
  },true);
  document.addEventListener('input',event=>{
    const q=event.target.closest('.quiz-question');if(q)seenChecks.delete(q);
  });
  document.addEventListener('change',event=>{
    const q=event.target.closest('.quiz-question');if(q)seenChecks.delete(q);
  });
  root.addEventListener('italian-study-answer-checked',event=>studyCheck(event.detail?.question));
  root.addEventListener('italian-flashcard-assessed',event=>{
    const {card,rating:confidence,at}=event.detail || {};
    if(!card || !['known','again','unsure'].includes(confidence))return;
    const topicId=cardTopic(card);
    root.ItalianDailyFocus?.recordExternalAttempt({id:'card:'+card.key,sourceId:card.key,topicId,topicTitle:titles[topicId],type:'flashcard',origin:'flashcard',task:'Flashcard recall'},
      {correct:null,confidence,at:Number.isFinite(at)?at:Date.now()});
  });
  for(const name of ['italian-flashcard-rendered','italian-library-ready','italian-daily-focus-changed','italian-daily-focus-content-ready','italian-focus-changed','storage'])root.addEventListener(name,schedule);
  root.ItalianDailyFocus?.subscribe(schedule);
  // Existing renderers replace their own content after navigation; only decorate those new nodes.
  new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1 && !node.matches?.('.focus-practice-flags,.focus-flag'))))schedule();})
    .observe(document.body,{childList:true,subtree:true});
  schedule();
})(window);
