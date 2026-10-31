(function(){
  const SITE_VERSION='2026-10-31-expanded-study-sheets-v3';
  const SITE_UPDATED='31 October 2026';
  const EXPECTED_ENCODED_LENGTH=16828;
  const EXPECTED_CARD_COUNT=56;
  const EXPECTED_SUBDECK_COUNT=7;

  const DATA_FILES=[
    'data/lesson5-consolidation-01.txt',
    'data/lesson5-consolidation-02.txt',
    'data/lesson5-consolidation-03.txt',
    'data/lesson5-consolidation-04.txt',
  ];

  const STUDY_SHEETS=[
    {
      title:'Conversation foundations',
      description:'Greetings, names, formal and informal speech, origins and residence',
      href:'study/study-sheets.html#conversation-foundations',
      scope:'Standalone conversation guide'
    },
    {
      title:'Di, da, dove and pronouns',
      description:'Origin, movement, residence, current location and third-person pronouns',
      href:'study/study-sheets.html#di-da-dove-pronouns',
      scope:'Standalone grammar guide'
    },
    {
      title:'Subject pronouns and present tense',
      description:'Match io, tu, lui/lei, noi, voi and loro to the verb ending',
      href:'study/study-sheets.html#subject-pronouns-present-tense',
      scope:'Standalone verb-pattern guide'
    },
    {
      title:'Known verbs and their forms',
      description:'A present-tense reference for every verb currently taught or encountered',
      href:'study/study-sheets.html#known-verbs-and-forms',
      scope:'Standalone verb reference'
    },
    {
      title:'Word jobs and sentence building',
      description:'Nouns, verbs, adjectives, pronouns, articles and prepositions',
      href:'study/study-sheets.html#word-jobs-sentence-building',
      scope:'Standalone grammar foundations'
    },
    {
      title:'Avere, numbers and family',
      description:'Present-tense forms, silent H, age, common expressions and quantities',
      href:'study/study-sheets.html#avere-numbers-family',
      scope:'Course review'
    },
    {
      title:'Plurals and articles',
      description:'Noun endings, definite articles and plural "some" forms',
      href:'study/study-sheets.html#plural-articles',
      scope:'Course review'
    },
    {
      title:'C/G sounds and spelling with towns',
      description:'Hard and soft sounds, H combinations and the Italian town spelling code',
      href:'study/study-sheets.html#c-g-sounds-and-spelling',
      scope:'Course review'
    },
    {
      title:'Mixed review challenge',
      description:'Combine register, origins, verbs, articles, plurals and sounds',
      href:'study/study-sheets.html#mixed-review-challenge',
      scope:'Standalone mixed practice'
    }
  ];

  async function loadCards(){
    const chunks=await Promise.all(DATA_FILES.map(async file=>{
      const response=await fetch(file,{cache:'no-store'});
      if(!response.ok)throw new Error(`Could not load ${file} (${response.status}).`);
      return (await response.text()).trim();
    }));

    const encoded=chunks.join('');
    if(encoded.length!==EXPECTED_ENCODED_LENGTH){
      throw new Error(`Lesson 5 data is incomplete: expected ${EXPECTED_ENCODED_LENGTH} characters, received ${encoded.length}.`);
    }
    if(encoded.length%4!==0)throw new Error('Lesson 5 data is not valid Base64.');

    const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const lesson5=JSON.parse(await new Response(stream).text());

    if(!Array.isArray(lesson5)||lesson5.length!==EXPECTED_CARD_COUNT){
      throw new Error(`Lesson 5 card validation failed: expected ${EXPECTED_CARD_COUNT} cards.`);
    }

    const keys=new Set(lesson5.map(card=>card.key));
    const subdecks=new Set(lesson5.map(card=>card.deck));
    const wrongLesson=lesson5.some(card=>card.lesson!=='L5');
    if(keys.size!==EXPECTED_CARD_COUNT||subdecks.size!==EXPECTED_SUBDECK_COUNT||wrongLesson){
      throw new Error('Lesson 5 identity validation failed.');
    }
    return lesson5;
  }

  function patchLessonMeta(){
    if(typeof lessonMeta!=='function'||lessonMeta.__lesson5Review)return;
    const previous=lessonMeta;
    const replacement=function(lesson){
      if(lesson==='L5')return{
        number:'5',
        title:'Consolidation Review',
        description:'A mixed review of greetings, names, origins, avere, plurals, articles, family, C/G sounds and spelling.'
      };
      return previous(lesson);
    };
    replacement.__lesson5Review=true;
    lessonMeta=replacement;
  }

  function renderStudySheets(){
    const section=document.querySelector('.study-sheets-section');
    if(!section)return;
    const cards=STUDY_SHEETS.map(sheet=>`<article class="study-sheet-card">
      <span class="study-sheet-type">${sheet.scope}</span>
      <h3>${sheet.title}</h3>
      <p>${sheet.description}</p>
      <a class="study-sheet-button" href="${sheet.href}">Open study sheet</a>
    </article>`).join('');
    const desired=`<div class="study-sheets-heading">
      <p class="eyebrow">Study resources</p>
      <h2 id="studySheetsTitle">Study sheets</h2>
      <p>Choose from nine guides. Use typed or multiple-choice answers, reveal a hint when needed, then receive <strong style="color:#65c992">Corretto</strong> or <strong style="color:#ef777f">Sbagliato</strong> feedback after the attempt.</p>
      <p><a class="study-sheet-index-link" href="study/study-sheets.html">View all study sheets</a></p>
    </div><div class="study-sheet-grid">${cards}</div>`;
    if(section.innerHTML!==desired)section.innerHTML=desired;
  }

  function ensureAuditButton(){
    if(new URLSearchParams(location.search).get('audit')!=='1')return;
    const controls=document.querySelector('#auditOverviewBanner .audit-controls');
    if(controls&&!controls.querySelector('[data-lesson-nav="L5"]')){
      controls.insertAdjacentHTML('beforeend','<button type="button" data-lesson-nav="L5">Audit Lesson 5</button>');
    }
  }

  function installSiteMetadata(){
    document.querySelectorAll('input[name="site_version"]').forEach(input=>{input.value=SITE_VERSION;});
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute('content',`Italian for Beginners - BSE Course flash-card learning and review for Lessons 1-5, with interactive study sheets. Last updated ${SITE_UPDATED}.`);

    if(typeof submitToGoogleSheet==='function'&&!submitToGoogleSheet.__lesson5Wrapped){
      const previous=submitToGoogleSheet;
      const wrapped=fields=>previous({...fields,site_version:SITE_VERSION});
      wrapped.__lesson5Wrapped=true;
      submitToGoogleSheet=wrapped;
    }

    let style=document.getElementById('lesson5FooterDateStyle');
    if(!style){
      style=document.createElement('style');
      style.id='lesson5FooterDateStyle';
      document.head.appendChild(style);
    }
    const rule=`.site-footer{font-size:0!important}.site-footer::after{content:"Italian for Beginners - BSE Course · Last updated ${SITE_UPDATED}";font-size:14px!important;color:var(--muted)}`;
    if(style.textContent!==rule)style.textContent=rule;
  }

  function showLoadError(error){
    console.error('Lesson 5 consolidation review failed:',error);
    window.__LESSON5_LOAD_ERROR__=String(error?.message||error);
    document.documentElement.dataset.lesson5Status='error';

    let notice=document.getElementById('lesson5LoadError');
    if(!notice){
      notice=document.createElement('section');
      notice.id='lesson5LoadError';
      notice.setAttribute('role','alert');
      notice.style.cssText='max-width:1040px;margin:14px auto;padding:14px 16px;border:1px solid #d88b8b;border-radius:12px;background:#3a2629;color:#ffe7e7;';
      const heading=document.createElement('strong');
      heading.textContent='Lesson 5 could not be loaded.';
      const detail=document.createElement('div');
      detail.style.marginTop='5px';
      detail.textContent='Please hard-refresh the page. Technical detail: '+window.__LESSON5_LOAD_ERROR__;
      notice.append(heading,detail);
      document.getElementById('lessonNav')?.insertAdjacentElement('afterend',notice);
    }
  }

  function apply(lesson5){
    if(!Array.isArray(cards)||window.__LESSON5_CONSOLIDATION_REVIEW__)return;
    cards=cards.filter(card=>card.lesson!=='L5').concat(lesson5);
    patchLessonMeta();

    const requested=location.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase();
    if(requested==='L5')currentLesson='L5';

    installSiteMetadata();
    renderStudySheets();
    ensureAuditButton();

    window.__LESSON5_CONSOLIDATION_REVIEW__=true;
    window.__LESSON5_LOAD_REPORT__={cards:lesson5.length,subdecks:new Set(lesson5.map(card=>card.deck)).size,keys:new Set(lesson5.map(card=>card.key)).size};
    document.documentElement.dataset.lesson5Status='ok';
    document.getElementById('lesson5LoadError')?.remove();

    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  async function initialise(){
    if(typeof DecompressionStream==='undefined')throw new Error('This browser cannot decompress the Lesson 5 data.');
    const lesson5=await loadCards();
    const started=Date.now();
    const wait=()=>{
      const baseReady=Array.isArray(cards)&&cards.length>0&&typeof renderNavigation==='function'&&typeof renderView==='function';
      const reviewedReady=Boolean(window.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__);
      if(baseReady&&(reviewedReady||Date.now()-started>12000))apply(lesson5);
      else window.setTimeout(wait,80);
    };
    wait();
  }

  new MutationObserver(()=>{ensureAuditButton();installSiteMetadata();renderStudySheets();}).observe(document.documentElement,{childList:true,subtree:true});
  initialise().catch(showLoadError);
})();