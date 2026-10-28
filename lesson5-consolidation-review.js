(function(){
  const SITE_VERSION='2026-10-28-lesson5-consolidation-review';

  const DATA_FILES=[
    'data/lesson5-consolidation-01.txt',
    'data/lesson5-consolidation-02.txt',
    'data/lesson5-consolidation-03.txt',
    'data/lesson5-consolidation-04.txt',
  ];

  async function loadCards(){
    const encoded=(await Promise.all(DATA_FILES.map(async file=>{
      const response=await fetch(file,{cache:'no-store'});
      if(!response.ok)throw new Error(`Could not load ${file}`);
      return (await response.text()).trim();
    }))).join('');
    const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function patchLessonMeta(){
    if(typeof lessonMeta!=='function'||lessonMeta.__lesson5Review)return;
    const previous=lessonMeta;
    const replacement=function(lesson){
      if(lesson==='L5')return{number:'5',title:'Consolidation Review',description:'A mixed review of greetings, names, origins, avere, plurals, articles, family, C/G sounds and spelling.'};
      return previous(lesson);
    };
    replacement.__lesson5Review=true;
    lessonMeta=replacement;
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
    if(typeof submitToGoogleSheet==='function'&&!submitToGoogleSheet.__lesson5Wrapped){
      const previous=submitToGoogleSheet;
      const wrapped=fields=>previous({...fields,site_version:SITE_VERSION});
      wrapped.__lesson5Wrapped=true;
      submitToGoogleSheet=wrapped;
    }
    if(!document.getElementById('lesson5FooterDateStyle')){
      const style=document.createElement('style');
      style.id='lesson5FooterDateStyle';
      style.textContent='.site-footer{font-size:0!important}.site-footer::after{content:"Italian for Beginners - BSE Course · Last updated 28 October 2026";font-size:14px!important;color:var(--muted)}';
      document.head.appendChild(style);
    }
  }

  function apply(lesson5){
    if(!Array.isArray(cards)||window.__LESSON5_CONSOLIDATION_REVIEW__)return;
    cards=cards.filter(card=>card.lesson!=='L5').concat(lesson5);
    patchLessonMeta();
    const requested=location.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase();
    if(requested==='L5')currentLesson='L5';
    installSiteMetadata();
    ensureAuditButton();
    window.__LESSON5_CONSOLIDATION_REVIEW__=true;
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  async function initialise(){
    if(typeof DecompressionStream==='undefined')throw new Error('This browser cannot decompress the Lesson 5 data.');
    const lesson5=await loadCards();
    const wait=()=>{
      if(window.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__&&Array.isArray(cards))apply(lesson5);
      else window.setTimeout(wait,80);
    };
    wait();
  }

  new MutationObserver(()=>{ensureAuditButton();installSiteMetadata();}).observe(document.documentElement,{childList:true,subtree:true});
  initialise().catch(error=>console.error('Lesson 5 consolidation review failed:',error));
})();
