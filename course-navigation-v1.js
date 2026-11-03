(function(){
  const RESOURCE_KEY='italianCourseResourceV1';
  const PROGRESS_KEY='italianCourseSessionProgressV2';
  const VALID_RESOURCES=new Set(['flashcards','study']);
  const TOTAL_STUDY_QUESTIONS=92;

  const STUDY_CATEGORIES=[
    {
      id:'conversation',
      title:'Conversation and context',
      description:'Greetings, introductions, origins, residence and choosing formal or informal speech.',
      sheets:[
        {slug:'conversation-foundations',title:'Conversation foundations',description:'Greetings, names, formal and informal speech, origins and residence.',type:'Conversation guide',questions:10},
        {slug:'di-da-dove-pronouns',title:'Di, da, dove and pronouns',description:'Origin, movement, residence, current location and third-person pronouns.',type:'Grammar guide',questions:10}
      ]
    },
    {
      id:'verbs',
      title:'Verbs and pronouns',
      description:'Subject pronouns, present-tense patterns and the verb forms currently known.',
      sheets:[
        {slug:'subject-pronouns-present-tense',title:'Subject pronouns and present tense',description:'Match io, tu, lui/lei, noi, voi and loro to the verb ending.',type:'Verb-pattern guide',questions:10},
        {slug:'known-verbs-and-forms',title:'Known verbs and their forms',description:'A present-tense reference for every verb currently taught or encountered.',type:'Verb reference',questions:12},
        {slug:'avere-numbers-family',title:'Avere, numbers and family',description:'Present-tense forms, silent H, age, common expressions and quantities.',type:'Course review',questions:10}
      ]
    },
    {
      id:'grammar',
      title:'Grammar and sentence building',
      description:'Word jobs, agreement, articles and transforming between singular and plural.',
      sheets:[
        {slug:'word-jobs-sentence-building',title:'Word jobs and sentence building',description:'Nouns, verbs, adjectives, pronouns, articles and prepositions.',type:'Grammar foundations',questions:10},
        {slug:'plural-articles',title:'Plurals and articles',description:'Noun endings, definite articles and the plural forms used for “some”.',type:'Course review',questions:10}
      ]
    },
    {
      id:'sounds',
      title:'Sounds and spelling',
      description:'Recognise hard and soft C/G sounds and practise the Italian spelling code.',
      sheets:[
        {slug:'c-g-sounds-and-spelling',title:'C/G sounds and spelling with towns',description:'Hard and soft sounds, H combinations and the Italian town spelling code.',type:'Pronunciation and spelling',questions:10}
      ]
    },
    {
      id:'mixed',
      title:'Mixed practice',
      description:'Combine material from across the course in one short challenge.',
      sheets:[
        {slug:'mixed-review-challenge',title:'Mixed review challenge',description:'Combine register, origins, verbs, articles, plurals and sounds.',type:'Mixed practice',questions:10}
      ]
    }
  ];

  const params=new URLSearchParams(location.search);
  let resource=VALID_RESOURCES.has(params.get('view'))?params.get('view'):(sessionStorage.getItem(RESOURCE_KEY)||'flashcards');
  let category='all';
  let renderTimer=null;

  function getMode(){return document.body.classList.contains('mode-review')?'review':'learn';}
  function readProgress(){
    try{
      const parsed=JSON.parse(sessionStorage.getItem(PROGRESS_KEY)||'{}');
      return {
        flashcards:{viewed:parsed.flashcards?.viewed||{},lastLesson:parsed.flashcards?.lastLesson||null},
        study:{answers:parsed.study?.answers||{},lastSheet:parsed.study?.lastSheet||null}
      };
    }catch(_error){return{flashcards:{viewed:{},lastLesson:null},study:{answers:{},lastSheet:null}};}
  }
  function writeProgress(progress){sessionStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));window.dispatchEvent(new CustomEvent('italian-session-progress-changed'));}
  function studyStats(slug){
    const answers=readProgress().study.answers;
    const entries=Object.entries(answers).filter(([key])=>key.startsWith(`${slug}-q`));
    return {attempted:entries.length,correct:entries.filter(([,value])=>value.result==='correct').length};
  }
  function overallStats(){
    const progress=readProgress();
    const viewedKeys=Object.keys(progress.flashcards.viewed);
    const answers=Object.values(progress.study.answers);
    return {viewed:viewedKeys.length,attempted:answers.length,correct:answers.filter(value=>value.result==='correct').length};
  }
  function updateUrl(){
    const url=new URL(location.href);
    url.searchParams.set('view',resource);
    history.replaceState(null,'',`${url.pathname}${url.search}${url.hash}`);
  }
  function ensureMount(){
    let mount=document.getElementById('courseNavigationMount');
    if(mount)return mount;
    const modePanel=document.getElementById('siteModePanel');
    const identity=document.getElementById('reviewerIdentityMount');
    mount=document.createElement('div');
    mount.id='courseNavigationMount';
    (modePanel||identity)?.insertAdjacentElement('afterend',mount);
    return mount;
  }
  function progressSummary(){
    const stats=overallStats();
    return `<div class="course-session-progress" aria-live="polite">
      <span class="course-progress-pill"><strong>${stats.viewed}</strong> flashcard answers viewed</span>
      <span class="course-progress-pill"><strong>${stats.attempted}</strong> / ${TOTAL_STUDY_QUESTIONS} study questions attempted</span>
      <span class="course-progress-pill"><strong>${stats.correct}</strong> correct</span>
    </div>`;
  }
  function renderResourceShell(){
    const mount=ensureMount();
    if(!mount)return;
    const mode=getMode();
    mount.innerHTML=`<section class="course-resource-shell" aria-label="Choose learning resource">
      <div class="course-resource-top">
        <div><div class="course-breadcrumb"><span>${mode==='review'?'Review':'Learn'}</span><span aria-hidden="true">›</span><strong>${resource==='study'?'Study Sheets':'Flashcards'}</strong></div><div class="course-resource-copy">${mode==='review'?'Inspect the same learning resources and leave focused feedback.':'Choose lesson flashcards or a focused topic guide.'}</div></div>
        <div class="course-resource-tabs" role="group" aria-label="Flashcards or study sheets">
          <button type="button" class="course-resource-button" data-course-resource="flashcards" aria-pressed="${resource==='flashcards'}">Flashcards</button>
          <button type="button" class="course-resource-button" data-course-resource="study" aria-pressed="${resource==='study'}">Study Sheets</button>
        </div>
      </div>
      <div class="course-session-row">${progressSummary()}<button class="course-session-reset" type="button" data-reset-session title="Reset progress for this browser session" aria-label="Reset progress for this browser session">↺</button></div>
    </section>`;
  }
  function ensureSectionHeadings(){
    let flashHeading=document.getElementById('flashcardSectionHeading');
    if(!flashHeading){
      flashHeading=document.createElement('section');
      flashHeading.id='flashcardSectionHeading';
      flashHeading.className='resource-section-heading';
      document.getElementById('lessonNav')?.insertAdjacentElement('beforebegin',flashHeading);
    }
    const mode=getMode();
    flashHeading.innerHTML=`<p class="eyebrow">${mode==='review'?'Review':'Learn'} · Flashcards</p><h2>Flashcards by lesson</h2><p>${mode==='review'?'Open a lesson to inspect cards and send corrections.':'Open a lesson and reveal each answer to build session progress.'}</p>`;
  }
  function studyCard(sheet){
    const mode=getMode(),stats=studyStats(sheet.slug),percent=Math.round((stats.attempted/sheet.questions)*100);
    const href=`study/study-sheets.html?mode=${mode}&sheet=${encodeURIComponent(sheet.slug)}`;
    return `<article class="study-sheet-card" data-study-sheet="${sheet.slug}">
      <span class="study-sheet-type">${sheet.type}</span><h4>${sheet.title}</h4><p>${sheet.description}</p>
      <div class="study-sheet-card-progress"><div class="study-sheet-progress-track"><div class="study-sheet-progress-fill" style="width:${percent}%"></div></div><div class="study-sheet-progress-copy">${stats.attempted} / ${sheet.questions} attempted · ${stats.correct} correct this session</div></div>
      <div class="study-sheet-actions"><a class="study-sheet-button" href="${href}">${mode==='review'?'Open to review':'Open study sheet'}</a><button type="button" class="study-sheet-review-button" data-review-study-sheet="${sheet.slug}">Comment</button></div>
    </article>`;
  }
  function renderStudySheets(){
    const section=document.querySelector('.study-sheets-section');
    if(!section)return;
    const categories=STUDY_CATEGORIES.filter(item=>category==='all'||item.id===category);
    const desired=`<div class="study-sheets-heading"><p class="eyebrow">${getMode()==='review'?'Review':'Learn'} · Study sheets</p><h2 id="studySheetsTitle">Study sheets by topic</h2><p>Use a focused guide, answer the questions, reveal hints when needed and continue within this browser session.</p></div>
      <nav id="studySheetsCategoryNav" class="study-category-nav" aria-label="Study sheet categories"><button type="button" data-study-category="all" aria-pressed="${category==='all'}">All topics</button>${STUDY_CATEGORIES.map(item=>`<button type="button" data-study-category="${item.id}" aria-pressed="${category===item.id}">${item.title}</button>`).join('')}</nav>
      ${categories.map(item=>`<section class="study-category-group" data-category="${item.id}"><div class="study-category-heading"><h3>${item.title}</h3><p>${item.description}</p></div><div class="study-sheet-grid">${item.sheets.map(studyCard).join('')}</div></section>`).join('')}`;
    if(section.innerHTML!==desired)section.innerHTML=desired;
  }
  function applyVisibility(){
    document.body.classList.toggle('resource-flashcards',resource==='flashcards');
    document.body.classList.toggle('resource-study',resource==='study');
    document.querySelector('.study-sheets-section')?.setAttribute('aria-hidden',String(resource!=='study'));
    document.getElementById('lessonNav')?.setAttribute('aria-hidden',String(resource!=='flashcards'));
  }
  function markFlashcardProgress(card){
    const key=card?.dataset.key;if(!key)return;
    const progress=readProgress();
    progress.flashcards.viewed[key]=Date.now();
    progress.flashcards.lastLesson=card.dataset.lesson||progress.flashcards.lastLesson;
    writeProgress(progress);
  }
  function decorateFlashcardProgress(){
    if(!Array.isArray(cards)||!cards.length)return;
    const progress=readProgress(),viewed=progress.flashcards.viewed;
    document.querySelectorAll('#lessonNav [data-lesson-nav]').forEach(button=>{
      const lesson=button.dataset.lessonNav;if(!lesson)return;
      const total=cards.filter(card=>card.lesson===lesson).length;
      const done=cards.filter(card=>card.lesson===lesson&&viewed[card.key]).length;
      let badge=button.querySelector('.session-count');
      if(!badge){badge=document.createElement('span');badge.className='session-count';button.appendChild(badge);}
      badge.textContent=`${done}/${total}`;
    });
    document.querySelectorAll('.lesson-tile').forEach(tile=>{
      const button=tile.querySelector('[data-lesson-nav]');const lesson=button?.dataset.lessonNav;if(!lesson)return;
      const total=cards.filter(card=>card.lesson===lesson).length;
      const done=cards.filter(card=>card.lesson===lesson&&viewed[card.key]).length;
      const percent=total?Math.round(done/total*100):0;
      let block=tile.querySelector('.lesson-tile-session-progress');
      if(!block){block=document.createElement('div');block.className='lesson-tile-session-progress';tile.querySelector('.lesson-count')?.insertAdjacentElement('afterend',block);}
      block.innerHTML=`<div class="lesson-tile-session-track"><div class="lesson-tile-session-fill" style="width:${percent}%"></div></div><div class="lesson-tile-session-copy">${done} of ${total} answers viewed this session</div>`;
    });
  }
  function openStudyReview(slug){
    const sheet=STUDY_CATEGORIES.flatMap(item=>item.sheets).find(item=>item.slug===slug);if(!sheet||typeof openReview!=='function')return;
    openReview('general');
    document.getElementById('formScope').value='study_sheet';
    document.getElementById('formItemId').value=`study-sheet:${slug}`;
    document.getElementById('formLesson').value='Study Sheets';
    document.getElementById('formDeck').value=sheet.type;
    document.getElementById('formCardKey').value=slug;
    document.getElementById('formCardSummary').value=sheet.title;
    const badge=document.getElementById('scopeBadge');if(badge)badge.textContent='Study sheet comment';
    const context=document.getElementById('reviewContext');if(context)context.textContent=`Study sheet · ${sheet.title}`;
  }
  function resetSession(){
    if(!confirm('Reset flashcard and study-sheet progress for this browser session? Comments and audit decisions are not affected.'))return;
    sessionStorage.removeItem(PROGRESS_KEY);
    location.reload();
  }

  function installCurrentMetadata(){
    const currentVersion='2026-11-01-course-shell-v1';
    let style=document.getElementById('courseShellFooterDateStyle');
    if(!style){
      style=document.createElement('style');
      style.id='courseShellFooterDateStyle';
      document.head.appendChild(style);
    }
    style.textContent='.site-footer{font-size:0!important}.site-footer::after{content:"Italian for Beginners - BSE Course · Last updated 1 November 2026";font-size:14px!important;color:var(--muted)}';
    document.querySelector('meta[name="description"]')?.setAttribute('content','Italian for Beginners — flashcards and interactive study sheets for learning or collaborative review. Lessons 1–5. Last updated 1 November 2026.');
    const form=document.getElementById('reviewForm');
    if(form&&!form.__courseShellVersionBound){
      form.addEventListener('submit',()=>{const input=form.querySelector('input[name="site_version"]');if(input)input.value=currentVersion;},true);
      form.__courseShellVersionBound=true;
    }
    if(typeof submitToGoogleSheet==='function'&&!submitToGoogleSheet.__courseShellDirect){
      const endpoint=form?.action;
      const target=form?.target||'googleReviewSink';
      if(endpoint){
        const direct=function(fields){
          const post=document.createElement('form');post.method='POST';post.action=endpoint;post.target=target;post.hidden=true;
          Object.entries({...fields,site_version:currentVersion}).forEach(([name,value])=>{const input=document.createElement('input');input.type='hidden';input.name=name;input.value=String(value??'');post.appendChild(input);});
          document.body.appendChild(post);HTMLFormElement.prototype.submit.call(post);setTimeout(()=>post.remove(),1500);
        };
        direct.__courseShellDirect=true;submitToGoogleSheet=direct;
      }
    }
  }

  function renderAll(){
    window.clearTimeout(renderTimer);
    renderTimer=window.setTimeout(()=>{
      installCurrentMetadata();renderResourceShell();ensureSectionHeadings();renderStudySheets();applyVisibility();decorateFlashcardProgress();
    },20);
  }

  document.addEventListener('click',event=>{
    const resourceButton=event.target.closest('[data-course-resource]');
    if(resourceButton){resource=resourceButton.dataset.courseResource;sessionStorage.setItem(RESOURCE_KEY,resource);updateUrl();renderAll();window.scrollTo({top:0,behavior:'smooth'});return;}
    const categoryButton=event.target.closest('[data-study-category]');
    if(categoryButton){category=categoryButton.dataset.studyCategory;renderStudySheets();return;}
    const reviewButton=event.target.closest('[data-review-study-sheet]');
    if(reviewButton){openStudyReview(reviewButton.dataset.reviewStudySheet);return;}
    if(event.target.closest('[data-reset-session]')){resetSession();return;}
  });

  let lastMode=getMode();
  const cardObserver=new MutationObserver(mutations=>{
    let modeChanged=false;
    let needsDecoration=false;
    for(const mutation of mutations){
      if(mutation.type==='attributes'&&mutation.target===document.body){
        const nextMode=getMode();
        if(nextMode!==lastMode){lastMode=nextMode;modeChanged=true;}
      }
      if(mutation.type==='attributes'&&mutation.target.classList?.contains('review-card')&&mutation.target.classList.contains('show-answer')){
        markFlashcardProgress(mutation.target);
      }
      if(mutation.type==='childList'){
        const relevant=[...mutation.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.lesson-tile,.lesson-nav-button')||node.querySelector?.('.lesson-tile,.lesson-nav-button')));
        if(relevant)needsDecoration=true;
      }
    }
    if(modeChanged)renderAll();
    else if(needsDecoration)window.setTimeout(decorateFlashcardProgress,0);
  });
  cardObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('italian-course-data-ready',renderAll);
  window.addEventListener('italian-session-progress-changed',renderAll);
  window.addEventListener('pageshow',renderAll);
  renderAll();
})();
