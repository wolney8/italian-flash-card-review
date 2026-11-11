/* Interface language only. Canonical cards, answers, IDs, URLs and learner data are never translated. */
(function (root) {
  'use strict';
  const KEY='italianCourseLanguageV1',OLD_KEY='italianCourseLabelOrderV1',C=root.ItalianUICatalogue;
  if(!C)return;
  const norm=s=>String(s??'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const messages=C.messages,blocks=C.blocks;
  let locale='en';
  try{const saved=localStorage.getItem(KEY)||localStorage.getItem(OLD_KEY);if(saved==='it'||saved==='en')locale=saved;}catch(_){}
  const nodeState=new WeakMap(),blockState=new WeakMap(),attributeState=new WeakMap();
  const CONTROL='[data-guide-label-order],[data-study-editorial-language]';
  const SCOPE=[
    'h1','h2','h3','h4','h5','h6','th','caption','legend','summary','button','a','option',
    'label:not(.choice):not(.question-heading label)',
    '.eyebrow','.guided-eyebrow','.field-heading','.panel-title','.panel-subtitle','.instruction',
    '.answer-label','.side-label','.section>.label','.answer-body .label','.deck-label',
    '.course-site-brand small','.course-site-breadcrumb','.guided-context','.guided-footer',
    '.guided-card-count','.guided-lesson-copy small','.guided-confidence-summary',
    '.guided-result-stats','.guided-complete>p','.guided-resume span',
    '.guided-course-stage>div>span','.guided-semester','.guided-learning-note>strong',
    '.guided-sheet-position','.guided-sheet-controls-status','.guided-sheet-progress-count',
    '.learning-session-progress-label','.guided-sheet-step-copy','.study-topic-position',
    '.sheet-library-count','.sheet-library-progress','.sheet-library-item .progress-copy',
    '.sheet-library-meta','.sheet-library-set-count','.study-overall-progress',
    '.number-reveal-status','.number-flip-cue','.verb-entry>summary',
    '.feedback','.form-status','.study-review-status','.editorial-modal-status'
  ].join(',');
  const COPY=[
    '.hint','.quiz-intro','.guided-sheet-instruction','.guided-sheet-finish-explanation',
    '.guided-sheet-finish-score','.guided-sheet-teaching-note p','.study-pack-sheet .lead',
    '.study-pack-sheet .bullet','.study-pack-sheet .panel p','.number-flip-help','.number-reveal-note',
    '.verb-reference p:not([lang="it"])','.verb-support-note','.verb-entry-content>p:not([lang="it"])',
    '.guided-lede','.guided-learning-note p','.guided-info p','.guided-muted','.guided-confidence>p',
    '.l3-topic-primer p','.study-pack-sheet .l6-source-detail','.l6-int-label'
  ].join(',');
  const PROTECTED=[
    'script','style','textarea','input','code','pre','[contenteditable=true]',
    '.editorial-label',CONTROL,'[data-ui-no-translate]','[data-bilingual-source]',
    '.italian','.phon','.mini-phon','.phonetic','.pronunciation','.literal','.focus','.l6-gloss',
    '.choice','.model-answer','.question-heading','.number-flip-answer>p[lang=it]',
    '.verb-form-table td','.forms-table td','.matrix-wrap td','.l3-dialogue p[lang=it]'
  ].join(',');
  const aliases={Corretto:'Correct',Sbagliato:'Incorrect',Controlla:'Check answer',Risposta:'Answer','Risposta:':'Answer:',
    'Mostra suggerimento':'Show hint','Nascondi suggerimento':'Hide hint'};
  function translate(source,lang=locale){
    const raw=norm(source),s=aliases[raw]||raw;
    if(lang==='en')return s;
    if(messages[s])return messages[s];
    if(blocks[s])return blocks[s];
    if(s==='Numbers')return 'Numeri';
    if(/^[←→]\s/.test(s))return s[0]+' '+translate(s.slice(2),lang);
    if(/\s[←→]$/.test(s))return translate(s.slice(0,-2),lang)+' '+s.slice(-1);
    if(/^\d{2} /.test(s))return s.slice(0,3)+translate(s.slice(3),lang);
    let m;
    if((m=s.match(/^L(\d+) · (.+)$/)))return 'L'+m[1]+' · '+translate(m[2],lang);
    if((m=s.match(/^Lesson (\d+)( subdeck)?$/)))return 'Lezione '+m[1]+(m[2]?' — mazzo':'');
    if((m=s.match(/^Card (\d+) (?:of|di) (\d+)$/)))return 'Carta '+m[1]+' di '+m[2];
    if((m=s.match(/^(Question|Part|Topic|Incorrect answer) (\d+) of (\d+)$/)))return ({Question:'Domanda',Part:'Parte',Topic:'Argomento','Incorrect answer':'Risposta errata'}[m[1]])+' '+m[2]+' di '+m[3];
    if((m=s.match(/^Step (\d+) of 3 · (.+)$/)))return 'Fase '+m[1]+' di 3 · '+translate(m[2],lang);
    if((m=s.match(/^(Class order|Reference topics) · (.+)$/)))return (m[1]==='Class order'?'Ordine della lezione':'Argomenti di riferimento')+' · '+translate(m[2],lang);
    if((m=s.match(/^(\d+) of (\d+) activities( viewed or answered)?$/)))return m[1]+' di '+m[2]+' attività'+(m[3]?' viste o svolte':'');
    if((m=s.match(/^(\d+) of (\d+) attempted · (\d+) correct$/)))return m[1]+' di '+m[2]+' tentativi · '+m[3]+' risposte corrette';
    if((m=s.match(/^(\d+) \/ (\d+) attempted · (\d+) correct(?: this session)?(?: · (\d+) practice sets)?$/)))return m[1]+' / '+m[2]+' tentativi · '+m[3]+' risposte corrette'+(s.includes('this session')?' nella sessione':'')+(m[4]?' · '+m[4]+' gruppi di esercizi':'');
    if((m=s.match(/^(\d+) of (\d+) correct$/)))return m[1]+' di '+m[2]+' risposte corrette';
    if((m=s.match(/^(\d+) of (\d+)$/)))return m[1]+' di '+m[2];
    if((m=s.match(/^(\d+) \/ (\d+) revealed$/)))return m[1]+' / '+m[2]+' mostrate';
    if((m=s.match(/^(\d+) cards · (\d+) answers viewed$/)))return m[1]+' carte · '+m[2]+' risposte viste';
    if((m=s.match(/^Got it: (\d+) · Practise again: (\d+) · Not rated: (\d+)$/)))return 'Lo so: '+m[1]+' · Da ripassare: '+m[2]+' · Non valutate: '+m[3];
    if((m=s.match(/^(\d+) \/ (\d+) answers revealed · (\d+) rated\.$/)))return m[1]+' / '+m[2]+' risposte mostrate · '+m[3]+' valutate.';
    if((m=s.match(/^Review (\d+) incorrect (?:answer|answers)$/)))return 'Ripassa '+m[1]+' '+(m[1]==='1'?'risposta errata':'risposte errate');
    if((m=s.match(/^Review (\d+) marked (?:card|cards)$/)))return 'Ripassa '+m[1]+' carte selezionate';
    if((m=s.match(/^You have attempted (\d+) of (\d+) questions\.$/)))return 'Hai provato '+m[1]+' domande su '+m[2]+'.';
    if((m=s.match(/^(Irregular|Regular present-tense comparison|Regular comparison|Reflexive comparison) · (.+)$/)))return translate(m[1],lang)+' · '+m[2];
    if((m=s.match(/^(.+) — (\d+) questions$/)))return translate(m[1],lang)+' — '+m[2]+' domande';
    if((m=s.match(/^Next topic: (.+)$/)))return 'Prossimo argomento: '+translate(m[1],lang);
    if((m=s.match(/^Comment on: (.+)$/)))return 'Commenta: '+translate(m[1],lang);
    if((m=s.match(/^\(?(\d+) (cards|questions|practice sets)\)?$/)))return m[1]+' '+({cards:'carte',questions:'domande','practice sets':'gruppi di esercizi'}[m[2]]);
    if((m=s.match(/^Semester (\d+)( · (?:current|later))?$/)))return 'Semestre '+m[1]+(m[2]?(m[2].includes('current')?' · attuale':' · successivo'):'');
    if((m=s.match(/^Lesson (\d+) · (.+) · (\d+) answers viewed$/)))return 'Lezione '+m[1]+' · '+translate(m[2],lang)+' · '+m[3]+' risposte viste';
    return s;
  }
  function sourceText(el){
    if(!el)return '';
    if(blockState.has(el))return blockState.get(el).source;
    const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,out='';
    while((n=walk.nextNode()))out+=(nodeState.get(n)?.source??n.data);
    return norm(out);
  }
  function pair(en,it=translate(en,'it')){
    return '<span class="editorial-label"><span class="editorial-label-main" lang="en">'+esc(en)+'</span><span class="editorial-label-sub" lang="it">'+esc(it)+'</span></span>';
  }
  let observer,scheduled=false,flushes=0;
  const safePrompts=new Set(['Write','in Italian.','Choose the correct translation:','Choose the pronoun and form for','Make the whole phrase plural:','What does this source curve signal?']);
  function translateNode(node){
    const parent=node.parentElement;
    if(!parent||parent.closest('[data-ui-block]'))return;
    const protectedPrompt=parent.closest('.question-heading');
    const exactPrompt=protectedPrompt&&safePrompts.has(norm(nodeState.get(node)?.source||node.data))&&!parent.closest('b,strong,.question-heading [lang=it],.l6-gloss');
    if(parent.closest(PROTECTED)&&!exactPrompt)return;
    if(!exactPrompt&&!parent.closest(SCOPE+','+COPY))return;
    const old=nodeState.get(node);
    const source=old&&node.data===old.output?old.source:node.data;
    const raw=norm(source);if(!raw)return;
    const converted=translate(raw);
    const output=converted===raw?source:source.replace(/\S[\s\S]*\S|\S/,converted);
    nodeState.set(node,{source,output});
    if(node.data!==output)node.data=output;
  }
  function translateBlock(el){
    if(el.closest(PROTECTED)||el.querySelector('input,button,a,select,details,svg,img,.l6-build,.l6-int-pair'))return;
    const old=blockState.get(el);
    let source,original;
    if(old&&el.innerHTML===old.output){source=old.source;original=old.original;}
    else{source=norm(el.textContent);original=el.innerHTML;}
    if(!blocks[source])return;
    const output=locale==='it'?esc(blocks[source]):original;
    blockState.set(el,{source,original,output});
    el.dataset.uiBlock='true';el.lang=locale;
    if(el.innerHTML!==output)el.innerHTML=output;
  }
  function translateAttribute(el,name){
    if(el.matches(CONTROL)||el.closest('.editorial-label')||!el.hasAttribute(name))return;
    const value=el.getAttribute(name),all=attributeState.get(el)||{};
    const old=all[name],source=old&&value===old.output?old.source:value;
    const output=translate(source);
    all[name]={source,output};attributeState.set(el,all);
    if(value!==output)el.setAttribute(name,output);
  }
  function refresh(){
    scheduled=false;if(!document.body)return;
    observer?.disconnect();flushes++;
    document.documentElement.dataset.uiLanguage=locale;document.documentElement.lang=locale;
    // CSS removes the alternate label from layout and the accessibility tree.
    // Leave bilingual source markup intact: legacy decorators compare exact HTML.
    for(const button of document.querySelectorAll(CONTROL)){
      if(!button.dataset.uiLanguageToggle){
        button.dataset.uiLanguageToggle='true';
        button.innerHTML='<span class="ui-language-choice" lang="en">EN</span><span aria-hidden="true"> / </span><span class="ui-language-choice" lang="it">IT</span>';
      }
      button.setAttribute('aria-label',locale==='it'?'Lingua: italiano. Passa all’inglese.':'Language: English. Switch to Italian.');
      button.title=locale==='it'?'Passa all’inglese':'Switch to Italian';
      button.setAttribute('aria-pressed',String(locale==='it'));
    }
    for(const option of document.querySelectorAll('select option'))if(!option.hasAttribute('value'))option.setAttribute('value',sourceText(option));
    for(const el of document.querySelectorAll(COPY+',[data-ui-block]'))translateBlock(el);
    // Breadcrumbs stay plain English, as previously requested; the adjacent toolbar follows the locale.
    const roots=[document.getElementById('guidedExperience'),document.getElementById('studyGuideHeader'),document.querySelector('.study-detail-tools'),document.querySelector('body>main'),document.getElementById('editorialCommentModal'),document.getElementById('studyReviewModal')].filter(Boolean);
    for(const area of roots){const walk=document.createTreeWalker(area,NodeFilter.SHOW_TEXT);let n;while((n=walk.nextNode()))translateNode(n);}
    for(const el of document.querySelectorAll('[title],[aria-label],[aria-valuetext],[placeholder],optgroup[label]')){
      if(el.closest('.choice,textarea,[contenteditable=true]'))continue;
      for(const name of ['title','aria-label','aria-valuetext','placeholder',...(el.tagName==='OPTGROUP'?['label']:[])])translateAttribute(el,name);
    }
    for(const el of document.querySelectorAll('.l6-gloss,.phon,.mini-phon'))el.lang='en';
    for(const el of document.querySelectorAll('.italian'))el.lang='it';
    document.documentElement.style.setProperty('--ui-number-hide','"'+(locale==='it'?'Nascondi l’italiano':'Hide Italian')+'"');
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-expanded','aria-valuetext','placeholder','title']});
    if(typeof root.scheduleVisibleFlipHeights==='function')root.scheduleVisibleFlipHeights();
  }
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
  function setLanguage(next,persist=true){
    if(next!=='it'&&next!=='en')return;
    locale=next;if(persist){try{localStorage.setItem(KEY,locale);}catch(_) {}}
    const active=document.activeElement,top=root.scrollY;
    refresh();active?.focus?.({preventScroll:true});root.scrollTo({top,behavior:'instant'});
    root.dispatchEvent(new CustomEvent('italian-interface-language-changed',{detail:{language:locale}}));
  }
  root.ItalianUI=Object.freeze({translate,pair,sourceText,setLanguage,refresh,get language(){return locale;},get flushes(){return flushes;},version:'2026-11-11-ui-language-v1'});
  document.documentElement.dataset.uiLanguage=locale;document.documentElement.lang=locale;
  document.addEventListener('click',event=>{
    const button=event.target.closest?.(CONTROL);if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();setLanguage(locale==='it'?'en':'it');
  },true);
  root.addEventListener('storage',event=>{if(event.key===KEY&&(event.newValue==='en'||event.newValue==='it'))setLanguage(event.newValue,false);});
  function start(){observer=new MutationObserver(schedule);refresh();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
