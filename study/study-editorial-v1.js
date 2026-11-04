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
  function mapped(value){const [it,en]=PAIRS[value]||[value,value];return bi(it,en);}
  function currentSheet(){const slug=new URLSearchParams(location.search).get('sheet');return slug||document.querySelector('.study-pack-sheet')?.id||'';}
  function sheetTitle(){return document.querySelector('.study-pack-sheet h1')?.textContent.trim()||'Study sheets library';}
  function applyTheme(){dark=get(THEME_KEY,'light')!=='light';document.documentElement.dataset.italianTheme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';}
  function themeToggle(){set(THEME_KEY,dark?'light':'dark');applyTheme();renderHeader();}
  function labelToggle(){italianFirst=!italianFirst;set(LABEL_KEY,italianFirst?'it':'en');renderHeader();decoratePage();}
  function renderHeader(){
    let header=document.getElementById('studyGuideHeader');if(!header){header=document.createElement('header');header.id='studyGuideHeader';header.className='study-guide-header';document.querySelector('main')?.insertAdjacentElement('beforebegin',header);}
    header.innerHTML=`<a class="study-guide-brand" href="../?page=home"><span class="study-guide-mark" aria-hidden="true">it.</span><span><strong>Italian for Beginners</strong><small>BSE Course · Beginners · Semester 1</small></span></a><nav id="studyGuideNavigation" class="study-guide-navigation ${menuOpen?'is-open':''}" aria-label="Main navigation"><a href="../?page=home">${mapped('Home')}</a><a href="../?page=lessons">${mapped('Lessons')}</a><a href="study-sheets.html?mode=${new URLSearchParams(location.search).get('mode')==='review'?'review':'learn'}" aria-current="page">${mapped('Study sheets')}</a><button type="button" data-study-editorial-comment>${mapped('Comments')}</button></nav><div class="study-guide-tools"><button class="study-guide-language" type="button" data-study-editorial-language title="Switch label order" aria-label="Use ${italianFirst?'English':'Italian'} labels first"><span aria-hidden="true">⇄</span><span>${italianFirst?'IT · EN':'EN · IT'}</span></button><button type="button" class="study-guide-theme" data-study-editorial-theme title="Change colour theme" aria-label="Switch to ${dark?'light':'dark'} mode"><span aria-hidden="true">${dark?'☀':'☾'}</span><span>${dark?'Light':'Dark'}</span></button><button type="button" class="study-guide-menu" data-study-editorial-menu aria-expanded="${menuOpen}" aria-controls="studyGuideNavigation">☰ Menu</button></div>`;
  }
  function breadcrumb(){
    let el=document.getElementById('studyGuideCrumbs');if(!el){el=document.createElement('nav');el.id='studyGuideCrumbs';el.className='study-guide-crumbs';el.setAttribute('aria-label','Breadcrumb');document.getElementById('studyGuideHeader')?.insertAdjacentElement('afterend',el);}
    if(!el)return;
    const slug=currentSheet(),title=sheetTitle();
    el.innerHTML=`<a href="../?page=home">${mapped('Home')}</a><span aria-hidden="true">›</span>${slug?`<a href="study-sheets.html?mode=${new URLSearchParams(location.search).get('mode')==='review'?'review':'learn'}">${mapped('Study sheets')}</a><span aria-hidden="true">›</span><span aria-current="page">${mapped(PAIRS[title]?title:'Study sheets')}</span>`:`<span aria-current="page">${mapped('Study sheets')}</span>`}`;
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
  function initialise(){italianFirst=get(LABEL_KEY,'it')!=='en';applyTheme();renderHeader();decoratePage();const root=document.getElementById('studySheets');if(root){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decoratePage();});}).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded']});}}
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-study-editorial-theme]'))themeToggle();
    else if(event.target.closest('[data-study-editorial-language]'))labelToggle();
    else if(event.target.closest('[data-study-editorial-menu]')){menuOpen=!menuOpen;renderHeader();}
    else if(event.target.closest('[data-study-editorial-comment]'))openComment();
    else if(event.target.closest('.hint-button'))setTimeout(decoratePage,0);
  });
  initialise();
})();