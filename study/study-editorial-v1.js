(function () {
  'use strict';
  const THEME_KEY='italianCourseThemeV1';
  const LABEL_KEY='italianCourseLabelOrderV1';
  const PAIRS={
    'Home':['Inizio','Home'],'Lessons':['Lezioni','Lessons'],
    'Study sheets':['Schede di studio','Study sheets'],
    'Comments':['Commenti','Comments'], 'Comment':['Commenta','Comment'],
    'All study sheets':['Tutte le schede','All study sheets'],
    'Choose a sheet':['Scegli una scheda','Choose a sheet'],
    'Browse by category':['Sfoglia per categoria','Browse by category'],
    'Conversation and context':['Conversazione e contesto','Conversation and context'],
    'Verbs and pronouns':['Verbi e pronomi','Verbs and pronouns'],
    'Grammar and sentence building':['Grammatica e frasi','Grammar and sentence building'],
    'Sounds and spelling':['Suoni e ortografia','Sounds and spelling'],
    'Mixed practice':['Esercizi misti','Mixed practice'],
    'Conversation foundations':['Conversazione di base','Conversation foundations'],
    'Di, da, dove and pronouns':['Di, da, dove e pronomi','Di, da, dove and pronouns'],
    'Subject pronouns and present tense':['Pronomi personali e presente','Subject pronouns and present tense'],
    'Known verbs and their forms':['Verbi conosciuti e coniugazioni','Known verbs and their forms'],
    'Avere, numbers and family':['Avere, numeri e famiglia','Avere, numbers and family'],
    'Word jobs and sentence building':['Funzioni delle parole e frasi','Word jobs and sentence building'],
    'Plurals and articles':['Plurali e articoli','Plurals and articles'],
    'C/G sounds and spelling with towns':['Suoni C/G e spelling con le città','C/G sounds and spelling with towns'],
    'Mixed review challenge':['Ripasso misto','Mixed review challenge']
  };
  let dark=true,italianFirst=true,menuOpen=false;
  const get=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch(_e){return fallback;}};
  const set=(key,value)=>{try{localStorage.setItem(key,value);}catch(_e){}};
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function bi(it,en){const a=italianFirst?it:en,b=italianFirst?en:it;return `<span class="editorial-label"><span class="editorial-label-main" lang="${italianFirst?'it':'en'}">${escapeHtml(a)}</span><span class="editorial-label-sub" lang="${italianFirst?'en':'it'}">${escapeHtml(b)}</span></span>`;}
  function mapped(value){const pair=PAIRS[value];return pair?bi(pair[0],pair[1]):escapeHtml(value);}
  function currentSheet(){const slug=new URLSearchParams(location.search).get('sheet');return slug||document.querySelector('.study-pack-sheet')?.id||'';}
  function sheetTitle(){return document.querySelector('.study-pack-sheet h1')?.textContent.trim()||'Study sheets library';}
  function applyTheme(){dark=get(THEME_KEY,'light')!=='light';document.documentElement.dataset.italianTheme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';}
  function themeToggle(){set(THEME_KEY,dark?'light':'dark');applyTheme();renderHeader();}
  function labelToggle(){italianFirst=!italianFirst;set(LABEL_KEY,italianFirst?'it':'en');renderHeader();decoratePage();}
  function studyMode(){
    return new URLSearchParams(location.search).get('mode')==='review'?'review':'learn';
  }
  function renderHeader(){
    let host=document.getElementById('studyGuideHeader');
    if(!host){
      host=document.createElement('div');
      host.id='studyGuideHeader';
      document.querySelector('main')?.insertAdjacentElement('beforebegin',host);
    }
    host.innerHTML=window.ItalianCourseChrome.header({
      context:'study',current:'topics',mode:studyMode(),dark,italianFirst,menuOpen
    });
  }
  const TOOL_ICON={
    learn:'<path d="M12 7.5c-2.6-1.7-5-1.8-8-1.2v12c3-.6 5.4-.5 8 1.2m0-12c2.6-1.7 5-1.8 8-1.2v12c-3-.6-5.4-.5-8 1.2m0-12v12"/>',
    review:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M9 12l2 2 4-4"/>',
    reset:'<path d="M3 11a9 9 0 1 1 2.8 6.4M3 4v7h7"/>',
    print:'<path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2M7 14h10v7H7zM17 11h.01"/>'
  };
  function toolIcon(name){
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
      'stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">'+
      TOOL_ICON[name]+'</svg>';
  }
  function detailTools(){
    const mode=studyMode();
    return '<div class="study-detail-tools" role="group" aria-label="Study sheet actions">'+
      '<div class="study-detail-mode-toggle" role="group" aria-label="Learning mode">'+
      '<button type="button" class="study-crumb-action" data-study-mode="learn" aria-pressed="'+(mode==='learn')+'" title="Learn mode">'+toolIcon('learn')+'<span>Learn</span></button>'+
      '<button type="button" class="study-crumb-action" data-study-mode="review" aria-pressed="'+(mode==='review')+'" title="Review mode">'+toolIcon('review')+'<span>Review</span></button></div>'+
      '<button type="button" class="study-crumb-action" data-reset-study-session title="Reset this session" aria-label="Reset this session">'+toolIcon('reset')+'<span>Reset</span></button>'+
      '<button type="button" class="study-crumb-action study-print-action" data-study-print title="Print or save as PDF" aria-label="Print or save as PDF">'+toolIcon('print')+'</button>'+
      '</div>';
  }
  function breadcrumb(){
    let host=document.getElementById('studyGuideCrumbs');
    if(!host){
      host=document.createElement('div');
      host.id='studyGuideCrumbs';
      document.getElementById('studyGuideHeader')?.insertAdjacentElement('afterend',host);
    }
    if(!host)return;
    const isDetail=document.body.classList.contains('study-sheet-detail');
    const title=sheetTitle();
    // Do not destroy live toolbar buttons every time quiz feedback changes.
    const renderKey=JSON.stringify([isDetail,title,studyMode()]);
    if(host.dataset.renderKey===renderKey)return;
    const nav=window.ItalianCourseChrome.breadcrumb({
      homeHref:'../?page=home',
      segments:isDetail?[{label:'Study sheets',href:'study-sheets.html?mode='+studyMode()},{label:title}]:[{label:'Study sheets'}]
    });
    host.innerHTML=isDetail
      ? '<div class="study-detail-location-row">'+nav+detailTools()+'</div>'
      : nav;
    host.dataset.renderKey=renderKey;
  }
  function decoratePage(){
    breadcrumb();
    const root=document.getElementById('studySheets');if(!root)return;
    // Only navigational labels are translated. Answers, grammar and exercises remain unchanged.
    const elements=[['.sheet-library-category h3',v=>mapped(v)],['.sheet-library-item strong',v=>mapped(v)],['.sheet-route-back',v=>'← '+mapped('All study sheets')],['.sheet-route-label',v=>mapped('Browse by category')],['.sheet-route-select-label',v=>mapped('Choose a sheet')]];
    for(const [selector,transform] of elements){for(const el of document.querySelectorAll(selector)){const raw=el.dataset.bilingualSource||el.textContent.trim();el.dataset.bilingualSource=raw;const output=transform(raw);if(el.innerHTML!==output)el.innerHTML=output;}}
    for(const button of root.querySelectorAll('.check-button')){const output=bi('Controlla','Check answer');if(button.innerHTML!==output)button.innerHTML=output;}
    for(const button of root.querySelectorAll('.hint-button')){const expanded=button.getAttribute('aria-expanded')==='true';const output=bi(expanded?'Nascondi suggerimento':'Mostra suggerimento',expanded?'Hide hint':'Show hint');if(button.innerHTML!==output)button.innerHTML=output;}
  }
  function openComment(){
    const slug=currentSheet()||'study-library';const modal=document.getElementById('studyReviewModal');if(!modal)return;
    const title=slug==='study-library'?'Study sheets library':sheetTitle();
    document.getElementById('studyReviewSheet').value=slug;
    document.getElementById('studyReviewTitle').textContent='Comment on: '+title;
    document.getElementById('studyReviewStatus').textContent='';
    modal.hidden=false;document.getElementById('studyReviewer')?.focus();
  }
  function initialise(){
    italianFirst=get(LABEL_KEY,'it')!=='en';
    applyTheme();renderHeader();decoratePage();
    const root=document.getElementById('studySheets');
    if(root){
      let scheduled=false;
      new MutationObserver(()=>{
        if(scheduled)return;
        scheduled=true;
        // Structural controls must be ready with the lesson, even when animation
        // frames are throttled. Coalesce mutations without waiting for a paint.
        queueMicrotask(()=>{scheduled=false;decoratePage();});
      }).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded']});
    }
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-study-editorial-theme]'))themeToggle();
    else if(event.target.closest('[data-study-editorial-language]'))labelToggle();
    else if(event.target.closest('[data-study-editorial-menu]')){menuOpen=!menuOpen;renderHeader();}
    else if(event.target.closest('[data-study-editorial-comment]'))openComment();
    else if(event.target.closest('[data-study-print]'))window.print();
    else if(event.target.closest('.hint-button'))setTimeout(decoratePage,0);
  });
  window.addEventListener('italian-study-mode-updated',()=>{
    const focusMode=document.activeElement?.closest('[data-study-mode]')?.dataset.studyMode;
    renderHeader();breadcrumb();
    if(focusMode)document.querySelector('.study-detail-location-row [data-study-mode="'+focusMode+'"]')?.focus({preventScroll:true});
  });
  initialise();
})();