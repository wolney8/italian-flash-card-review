(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('audit') === '1') return; // Keep the established detailed audit unchanged.

  const THEME_KEY = 'italianCourseThemeV1';
  const PROGRESS_KEY = 'italianCourseSessionProgressV2';
  const RESUME_KEY = 'italianGuidedResumeV1';
  const REVIEW_MODE_KEY = 'italianFlashCardSiteModeV1';
  const LABEL_KEY = 'italianCourseLabelOrderV1';
  const FOCUS_KEY = 'italianFocusModeV1';
  const EDITORIAL_VERSION = '2026-11-04-editorial-v1';
  const TRANSLATIONS = {
    'Home':['Inizio','Home'], 'Lessons':['Lezioni','Lessons'],
    'Study sheets':['Schede di studio','Study sheets'], 'Give feedback':['Commenti','Comments'],
    'Course pathway':['Percorso del corso','Course pathway'],
    'Beginners · Semester 1':['Principianti · Semestre 1','Beginners · Semester 1'],
    'Choose a lesson':['Scegli una lezione','Choose a lesson'],
    'Choose a topic':['Scegli un argomento','Choose a topic'],
    'Flashcards':['Carte didattiche','Flashcards']
  };
  const LESSON_ITALIAN = {
    L1:'Presentazioni', L2:'Alfabeto, suoni e articoli',
    L3:'Origini, nazionalità e residenza', L4:'Avere, numeri, plurali e famiglia',
    L5:'Ripasso'
  };
  const STUDY_ITALIAN = {
    'Conversation and context':'Conversazione e contesto',
    'Verbs and pronouns':'Verbi e pronomi',
    'Grammar and sentence building':'Grammatica e frasi',
    'Sounds and spelling':'Suoni e ortografia',
    'Mixed practice':'Esercizi misti',
    'Conversation foundations':'Conversazione di base',
    'Di, da, dove and pronouns':'Di, da, dove e pronomi',
    'Subject pronouns and present tense':'Pronomi personali e presente',
    'Known verbs and their forms':'Verbi conosciuti e coniugazioni',
    'Avere, numbers and family':'Avere, numeri e famiglia',
    'Word jobs and sentence building':'Funzioni delle parole e frasi',
    'Plurals and articles':'Plurali e articoli',
    'C/G sounds and spelling with towns':'Suoni C/G e spelling con le città',
    'Mixed review challenge':'Ripasso misto'
  };
  const LESSONS = [
    ['L1', 'Introductions', 'Greetings, names and polite introductions'],
    ['L2', 'Sounds and articles', 'Alphabet, pronunciation and articles'],
    ['L3', 'Origins and residence', 'Where you are from and where you live'],
    ['L4', 'Avere and plurals', 'To have, family, numbers and plural forms'],
    ['L5', 'Consolidation review', 'Mixed practice from previous lessons']
  ];
  const TOPICS = [
    ['Conversation and context', [['conversation-foundations', 'Conversation foundations'], ['di-da-dove-pronouns', 'Di, da, dove and pronouns']]],
    ['Verbs and pronouns', [['subject-pronouns-present-tense', 'Subject pronouns and present tense'], ['known-verbs-and-forms', 'Known verbs and their forms'], ['avere-numbers-family', 'Avere, numbers and family']]],
    ['Grammar and sentence building', [['word-jobs-sentence-building', 'Word jobs and sentence building'], ['plural-articles', 'Plurals and articles']]],
    ['Sounds and spelling', [['c-g-sounds-and-spelling', 'C/G sounds and spelling with towns']]],
    ['Mixed practice', [['mixed-review-challenge', 'Mixed review challenge']]]
  ];
  const isReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = {page: 'home', lesson: null, deck: '', index: 0, finished: false};
  let ready = false;
  let dark = true;
  let menuOpen = false;
  let italianFirst = true;
  let commentContext = null;
  let root;

  function safeGet(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (_e) {} }
  function sessionRead(key, fallback) { try { return JSON.parse(sessionStorage.getItem(key) || 'null') || fallback; } catch (_e) { return fallback; } }
  function sessionWrite(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_e) {} }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'}[c])); }
  function labelPair(italian,english,extraClass='') {
    const first=italianFirst?italian:english,second=italianFirst?english:italian;
    return `<span class="editorial-label ${extraClass}"><span class="editorial-label-main" lang="${italianFirst?'it':'en'}">${esc(first)}</span><span class="editorial-label-sub" lang="${italianFirst?'en':'it'}">${esc(second)}</span></span>`;
  }
  function translated(label) {return TRANSLATIONS[label]||[label,label];}
  function uiLabel(label) {const [it,en]=translated(label);return labelPair(it,en);}
  function lessonLabel(id) {return labelPair(LESSON_ITALIAN[id]||'Lezione '+id.slice(1),lessonInfo(id)[1]);}
  function topicLabel(label) {return labelPair(STUDY_ITALIAN[label]||label,label);}
  function toggleLabelOrder(){italianFirst=!italianFirst;safeSet(LABEL_KEY,italianFirst?'it':'en');document.getElementById('editorialCommentModal')?.remove();renderKeepingCardFace();}
  function topicSequence(lesson){return [...new Set(cardList(lesson).map(c=>c.deck))];}
  function confidenceData(){
    return sessionRead(PROGRESS_KEY,{}).flashcards?.confidence||{};
  }
  function reviewQueueKey(){return state.lesson+'::'+state.deck;}
  function activeCardList(lesson=state.lesson,deck=state.deck){
    const all=cardList(lesson,deck);
    if(!state.reviewOnly)return all;
    const queue=sessionRead(PROGRESS_KEY,{}).flashcards?.reviewQueues?.[reviewQueueKey()]||[];
    const keys=new Set(queue);
    return all.filter(card=>keys.has(card.key));
  }
  function focusActive(){
    const pref=safeGet(FOCUS_KEY,'auto');
    return pref==='on'||(pref==='auto'&&matchMedia('(max-width:740px)').matches);
  }
  function toggleFocus(){
    safeSet(FOCUS_KEY,focusActive()?'off':'on');
    renderKeepingCardFace();
  }
  function recordConfidence(rating){
    if(state.page!=='card'||state.finished||!['again','known'].includes(rating))return;
    const current=root?.querySelector('.guided-card-host .review-card');
    if(!current?.classList.contains('show-answer'))return;
    const card=currentCard();if(!card)return;
    const progress=sessionRead(PROGRESS_KEY,{});
    progress.flashcards=progress.flashcards||{viewed:{}};
    progress.flashcards.confidence=progress.flashcards.confidence||{};
    progress.flashcards.confidence[card.key]=rating;
    sessionWrite(PROGRESS_KEY,progress);
    moveCard(1);
  }
  function startReviewAgain(){
    const confidence=confidenceData();
    const keys=window.ItalianLearningSession.reviewKeys(cardList(state.lesson,state.deck),confidence);
    if(!keys.length)return;
    const progress=sessionRead(PROGRESS_KEY,{});
    progress.flashcards=progress.flashcards||{viewed:{}};
    progress.flashcards.reviewQueues=progress.flashcards.reviewQueues||{};
    progress.flashcards.reviewQueues[reviewQueueKey()]=keys;
    sessionWrite(PROGRESS_KEY,progress);
    navigate({...state,reviewOnly:true,index:0,finished:false});
  }
  function nextDestination(){
    const sequence=topicSequence(state.lesson);
    const idx=sequence.indexOf(state.deck);
    if(idx>=0&&idx<sequence.length-1)return {page:'card',lesson:state.lesson,deck:sequence[idx+1],index:0,finished:false,type:'topic',name:sequence[idx+1]};
    const lessonIndex=LESSONS.findIndex(x=>x[0]===state.lesson);
    if(lessonIndex>=0&&lessonIndex<LESSONS.length-1)return {page:'card',lesson:LESSONS[lessonIndex+1][0],deck:'',index:0,finished:false,type:'lesson',name:LESSONS[lessonIndex+1][1]};
    return null;
  }
  function markTopicCompleted(){
    if(state.reviewOnly)return; // A targeted review is not a new full-topic completion.
    const progress=sessionRead(PROGRESS_KEY,{});
    if(!progress.flashcards)progress.flashcards={viewed:{}};
    if(!progress.flashcards.completed)progress.flashcards.completed={};
    const key=state.lesson+'::'+(state.deck||'all');
    const viewed=progress.flashcards.viewed||{};
    const subset=cardList(state.lesson,state.deck);
    progress.flashcards.completed[key]={at:Date.now(),viewed:subset.filter(c=>viewed[c.key]).length,total:subset.length};
    sessionWrite(PROGRESS_KEY,progress);
  }
  function completeTopic(andNext=false){
    markTopicCompleted();
    const next=nextDestination();
    if(andNext&&next){navigate(next);return;}
    navigate({...state,finished:true});
  }
  function cardList(lesson, deck = '') { return (Array.isArray(cards) ? cards : []).filter(c => c.lesson === lesson && (!deck || c.deck === deck)); }
  function lessonInfo(id) { return LESSONS.find(l => l[0] === id) || LESSONS[0]; }
  function totalViewed(lesson) { const viewed = sessionRead(PROGRESS_KEY, {}).flashcards?.viewed || {}; return cardList(lesson).filter(c => !!viewed[c.key]).length; }
  function resume() { return sessionRead(RESUME_KEY, {lesson: null, deck: '', index: 0}); }

  function stateFromUrl() {
    const url = new URL(location.href);
    const reviewOnly=url.searchParams.get('review')==='again';
    const page = url.searchParams.get('page');
    const legacy = url.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase();
    const lesson = url.searchParams.get('lesson') || legacy;
    if (lesson && LESSONS.some(l => l[0] === lesson)) return {page:'card',lesson,deck:url.searchParams.get('topic') || '',index:Math.max(0,Number(url.searchParams.get('card') || 0)),finished:url.searchParams.get('done')==='1',reviewOnly};
    if (page === 'lessons' || page === 'topics' || page === 'feedback' || page === 'course') return {page,lesson:null,deck:'',index:0,finished:false};
    if (url.searchParams.get('view') === 'study') return {page:'topics',lesson:null,deck:'',index:0,finished:false};
    if (url.searchParams.get('view') === 'flashcards') return {page:'lessons',lesson:null,deck:'',index:0,finished:false};
    return {page:'home',lesson:null,deck:'',index:0,finished:false};
  }
  function urlFor(next) {
    const u = new URL(location.href);
    for (const key of ['view','page','lesson','topic','card','done','review']) u.searchParams.delete(key);
    u.hash = '';
    if (next.page !== 'home') u.searchParams.set('page',next.page);
    if (next.page === 'card' && next.lesson) {
      u.searchParams.set('lesson',next.lesson);
      if (next.deck) u.searchParams.set('topic',next.deck);
      if (next.index) u.searchParams.set('card',String(next.index));
      if (next.finished) u.searchParams.set('done','1');
      if (next.reviewOnly) u.searchParams.set('review','again');
    }
    return u.pathname + u.search;
  }
  function navigate(next, push = true, preserveCardPosition = false) {
    const previousTop=preserveCardPosition
      ? root?.querySelector('.guided-card-host')?.getBoundingClientRect().top
      : null;
    state = {page:next.page || 'home',lesson:next.lesson || null,deck:next.deck || '',
      index:next.index || 0,finished:!!next.finished,reviewOnly:!!next.reviewOnly};
    if (push) history.pushState(null,'',urlFor(state));
    menuOpen = false;
    render();
    if(preserveCardPosition&&state.page==='card'&&!state.finished&&typeof previousTop==='number'){
      window.ItalianLearningSession.restoreAnchor(root.querySelector('.guided-card-host'),previousTop);
    } else window.scrollTo({top:0,behavior:isReducedMotion()?'auto':'instant'});
    if(!preserveCardPosition)root.querySelector('.guided-title')?.focus({preventScroll:true});
  }
  function themeApply() {
    dark = safeGet(THEME_KEY,'light') !== 'light';
    document.body.classList.toggle('nightMode',dark);
    document.body.classList.toggle('night_mode',dark);
    document.documentElement.style.colorScheme = dark?'dark':'light';
  }
  function themeToggle() { safeSet(THEME_KEY,dark?'light':'dark'); themeApply(); renderKeepingCardFace(); }
  function ensure() {
    if (root) return;
    document.body.classList.add('guided-enabled');
    themeApply();
    italianFirst=safeGet(LABEL_KEY,'it')!=='en';
    root = document.createElement('div');
    root.id = 'guidedExperience';
    root.className = 'guided-experience';
    document.querySelector('.site-shell')?.prepend(root);
  }
  function header(){
    return window.ItalianCourseChrome.header({
      context:'guided',current:state.page,dark,italianFirst,menuOpen
    });
  }
  function crumbs(segments){
    return window.ItalianCourseChrome.breadcrumb({
      homeHref:'?page=home',homeRoute:true,
      segments:segments.map(s=>({
        label:s.label,
        href:s.to?'?page='+encodeURIComponent(s.to):undefined,
        route:s.to||undefined
      }))
    });
  }
  function coursePill() {return `<span class="guided-context">Beginners · Semester 1 of 3</span>`;}
  function home() {
    const last=resume();
    const validResume=ready&&LESSONS.some(l=>l[0]===last.lesson);
    return `<main id="guidedMain" class="guided-main">
      <p class="guided-eyebrow">${coursePill()}</p>
      <h1 tabindex="-1" class="guided-title editorial-hero-title">${labelPair('Scegli cosa studiare.','Choose what to study.')}</h1>
      <div class="guided-choices">
        <a href="?page=lessons" data-guide-to="lessons" class="guided-choice"><span class="guided-choice-icon" aria-hidden="true">▣</span><strong>${labelPair('Lezioni','Lesson flashcards')}</strong><b>${labelPair('Scegli una lezione','Choose a lesson')}</b></a>
        <a href="?page=topics" data-guide-to="topics" class="guided-choice"><span class="guided-choice-icon" aria-hidden="true">▤</span><strong>${labelPair('Schede di studio','Study sheets')}</strong><b>${labelPair('Scegli un argomento','Choose a topic')}</b></a>
      </div>
      ${validResume?`<section class="guided-resume"><div><strong>${labelPair('Continua','Continue')}</strong><span>Lesson ${last.lesson.slice(1)} · ${esc(lessonInfo(last.lesson)[1])} · ${totalViewed(last.lesson)} answers viewed</span></div><a href="${esc(urlFor({page:'card',...last}))}" data-guide-resume class="guided-primary">${labelPair('Riprendi','Resume')} →</a></section>`:''}
      <div class="editorial-context-link"><a href="?page=course" data-guide-to="course">${labelPair('Percorso del corso','Course pathway')} →</a></div>
    </main>`;
  }
  function lessons() {
    const content=ready?LESSONS.map(([id,title,description])=>{
      const total=cardList(id).length, viewed=totalViewed(id),pct=total?100*viewed/total:0;
      return `<a class="guided-lesson" href="${esc(urlFor({page:'card',lesson:id}))}" data-guide-lesson="${id}"><span class="guided-lesson-number">${id.slice(1)}</span><span class="guided-lesson-copy"><strong>${lessonLabel(id)}</strong><small>${total} cards · ${viewed} answers viewed</small><span class="guided-track"><span style="width:${pct}%"></span></span></span><span class="guided-chevron" aria-hidden="true">›</span></a>`;
    }).join(''):'<p class="guided-muted" role="status">Loading lessons…</p>';
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Beginners · Semester 1',to:'course'},{label:'Lessons'}])}<h1 class="guided-title" tabindex="-1">${uiLabel('Choose a lesson')}</h1><div class="guided-lessons">${content}</div></main>`;
  }
  function topics() {
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Study sheets'}])}<h1 class="guided-title" tabindex="-1">${uiLabel('Choose a topic')}</h1>${TOPICS.map(([name,entries])=>`<section class="guided-topic-group"><h2>${topicLabel(name)}</h2><div class="guided-topic-grid">${entries.map(([slug,title])=>`<a class="guided-topic" href="study/study-sheets.html?mode=learn&sheet=${encodeURIComponent(slug)}"><strong>${topicLabel(title)}</strong><span>${labelPair('Apri la scheda','Open guide')} →</span></a>`).join('')}</div></section>`).join('')}</main>`;
  }
  function course() {
    const stage=(label,current,items)=>`<section class="guided-course-stage"><div><h2>${label}</h2><span>${current?'Currently studying':'Planned stages — no content available yet'}</span></div><div class="guided-semesters">${items.map((name,i)=>`<span class="guided-semester ${current&&i===0?'is-current':''}">${name}${current&&i===0?' · current':name==='Details to be confirmed'?'':' · later'}</span>`).join('')}</div></section>`;
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Course pathway'}])}<h1 class="guided-title" tabindex="-1">${labelPair('Percorso del corso','Course pathway')}</h1><p class="guided-lede">The programme moves through Beginners (three semesters), Intermediate (three semesters), then Advanced. Advanced semester details are still to be confirmed.</p><div class="guided-course-path">${stage('Beginners',true,['Semester 1','Semester 2','Semester 3'])}${stage('Intermediate',false,['Semester 1','Semester 2','Semester 3'])}${stage('Advanced',false,['Details to be confirmed'])}</div><section class="guided-learning-note"><strong>Learn it in stages.</strong><p>Laura has explained that some ideas introduced in early lessons will make more sense as later lessons and semesters develop them. Future semesters are shown only as a pathway, not as available content.</p></section><div class="guided-actions"><button class="guided-primary" data-guide-to="lessons">Open this semester’s lessons →</button></div></main>`;
  }
  function feedback() {
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Give feedback'}])}<h1 class="guided-title" tabindex="-1">Suggest a correction</h1><p class="guided-lede">Found a translation, pronunciation or teaching issue? Leave a short comment for the course organiser. You can also comment on a specific card or study sheet.</p><section class="guided-info"><strong>Most useful feedback includes:</strong><p>The lesson or card, what seems incorrect, and what you suggest changing. A name or initials is enough.</p></section><div class="guided-actions"><button type="button" class="guided-primary" data-guide-general-feedback>Leave general feedback</button><a class="guided-secondary" href="?page=lessons" data-guide-to="lessons">Find a flashcard</a><a class="guided-secondary" href="study/study-sheets.html?mode=review">Browse study sheets to review</a></div></main>`;
  }
  function cardPage() {
    const lesson=state.lesson;
    if(!ready)return '<main class="guided-main" id="guidedMain">'+
      crumbs([{label:'Lessons',to:'lessons'},{label:'Loading'}])+
      '<div role="status" class="guided-info">Loading flashcards…</div></main>';
    const [id]=lessonInfo(lesson);
    const all=cardList(lesson),decks=topicSequence(lesson);
    if(state.deck&&!decks.includes(state.deck))state.deck='';
    if(!state.deck&&decks.length){
      const previous=all[Math.min(state.index,Math.max(0,all.length-1))];
      state.deck=previous?.deck||decks[0];
      const idx=cardList(lesson,state.deck).findIndex(c=>c.key===previous?.key);
      state.index=Math.max(0,idx);
      if(!state.finished)history.replaceState(null,'',urlFor(state));
    }
    const selected=activeCardList(lesson,state.deck);
    const total=selected.length;
    if(state.index>=total)state.index=Math.max(0,total-1);
    const current=selected[state.index];
    if(!current)return '<main class="guided-main" id="guidedMain">'+
      crumbs([{label:'Lessons',to:'lessons'}])+
      '<section class="guided-info"><p>No cards to review in this selection.</p>'+
      '<button class="guided-secondary" data-guide-all-cards>Return to all cards</button></section></main>';
    const next=nextDestination();
    const viewed=sessionRead(PROGRESS_KEY,{}).flashcards?.viewed||{};
    const confidence=confidenceData();
    const shown=selected.filter(c=>!!viewed[c.key]).length;
    const confidenceSummary=window.ItalianLearningSession.confidenceSummary(selected,confidence);
    const {known,again,rated}=confidenceSummary;
    if(state.finished){
      return '<main class="guided-main" id="guidedMain">'+
        crumbs([{label:'Lessons',to:'lessons'},{label:'Lesson '+id.slice(1)}])+
        '<section class="guided-complete editorial-complete">'+
        '<span class="guided-big-icon" aria-hidden="true">✓</span>'+
        '<h1 class="guided-title" tabindex="-1">'+
        (state.reviewOnly?'Targeted review finished':labelPair('Argomento completato','Topic complete'))+'</h1>'+
        '<p>'+shown+' / '+total+' answers revealed · '+rated+' rated.</p>'+
        '<div class="guided-result-stats">'+
        '<span><strong>'+known+'</strong> Got it</span>'+
        '<span><strong>'+again+'</strong> Practise again</span>'+
        '<span><strong>'+(total-rated)+'</strong> Unrated</span></div>'+
        '<p class="guided-muted">Revealing a card records that you saw it, not that you remembered it.</p>'+
        '<div class="guided-actions">'+
        (again?'<button class="guided-primary" data-guide-review-again>Review '+again+' marked '+(again===1?'card':'cards')+'</button>':'')+
        (state.reviewOnly?'<button class="guided-secondary" data-guide-all-cards>All cards</button>':'')+
        (next?'<button class="guided-primary" data-guide-next-topic>'+labelPair(next.type==='topic'?'Prossimo argomento':'Prossima lezione',next.type==='topic'?'Next topic':'Next lesson')+' →</button>':'')+
        '<button class="guided-secondary" data-guide-restart>'+labelPair('Ripeti','Repeat topic')+'</button>'+
        '<button class="guided-secondary" data-guide-to="lessons">'+labelPair('Tutte le lezioni','All lessons')+'</button>'+
        '</div></section></main>';
    }
    const isReviewed=!!viewed[current.key];
    const cardMarkup=typeof renderCard==='function'
      ?renderCard(current,state.index+1,total):'<p>Loading card template…</p>';
    const progressLabel=state.reviewOnly?'Targeted review position':'Answers revealed';
    const completed=state.reviewOnly?state.index+1:shown;
    const progress=window.ItalianLearningSession.progressMarkup({
      label:progressLabel,completed,total,
      prefix:'guided-review-progress'
    });
    const last=state.index===total-1;
    return '<main class="guided-main" id="guidedMain">'+
      crumbs([{label:'Beginners · Semester 1',to:'course'},{label:'Lessons',to:'lessons'},{label:'Lesson '+id.slice(1)}])+
      '<section class="guided-card-layout">'+
      '<div class="guided-card-heading"><div><p class="guided-eyebrow">'+
      labelPair('Lezione '+id.slice(1),'Lesson '+id.slice(1))+'</p>'+
      '<h1 class="guided-title" tabindex="-1">'+esc(current.deck)+'</h1></div>'+
      '<span class="guided-card-count">'+(state.reviewOnly?'Targeted review · ':'')+
      labelPair('Carta '+(state.index+1)+' di '+total,'Card '+(state.index+1)+' of '+total)+
      '</span></div>'+
      '<div class="guided-card-options">'+
      '<label for="guidedSubdeckSelect">'+labelPair('Argomento','Topic')+'</label>'+
      '<select id="guidedSubdeckSelect" aria-label="Choose a topic">'+decks.map(d=>
        '<option value="'+esc(d)+'" '+(state.deck===d?'selected':'')+'>'+esc(d)+'</option>').join('')+
      '</select><button type="button" class="learning-session-focus-toggle" data-guide-focus aria-pressed="'+focusActive()+'">'+
      (focusActive()?'Exit focus':'Focus mode')+'</button></div>'+
      progress+
      '<p class="guided-confidence-summary" aria-live="polite">Got it: '+known+
      ' · Practise again: '+again+' · Not rated: '+(total-rated)+'</p>'+
      '<section class="guided-card-host" aria-label="Current flashcard"><div class="subdeck-accordion is-open"><div class="card-list">'+
      cardMarkup+'</div></div></section>'+
      '<div class="guided-flashcard-actions">'+
      '<button class="guided-primary guided-reveal" data-guide-flip>'+
      labelPair(isReviewed?'Mostra risposta / domanda':'Mostra la risposta',
        isReviewed?'Show answer / question':'Reveal answer')+'</button>'+
      '<div class="guided-confidence" hidden aria-label="Recall confidence">'+
      '<p>Could you recall it without looking?</p>'+
      '<div class="guided-confidence-actions learning-session-controls">'+
      '<button type="button" class="guided-secondary" data-guide-rate="again">Practise again</button>'+
      '<button type="button" class="guided-primary" data-guide-rate="known">Got it</button></div></div>'+
      '<div class="guided-review-navigation learning-session-controls">'+
      '<button class="guided-secondary" data-guide-prev '+(state.index===0?'disabled':'')+'>← Previous</button>'+
      '<button class="guided-secondary" data-guide-next>'+(last?'Finish topic':'Next card')+' →</button>'+
      '</div>'+
      '<button class="guided-feedback guided-card-comment" data-guide-card-feedback>'+labelPair('Commenta questa carta','Comment on this card')+'</button>'+
      '</div></section></main>';
  }
  function currentCard() { return activeCardList()[state.index] || null; }
  function markViewed() {
    const card=currentCard(); if(!card)return;
    const progress=sessionRead(PROGRESS_KEY,{flashcards:{viewed:{}}});
    if(!progress.flashcards)progress.flashcards={viewed:{}};
    if(!progress.flashcards.viewed)progress.flashcards.viewed={};
    progress.flashcards.viewed[card.key]=Date.now();
    progress.flashcards.lastLesson=state.lesson;
    sessionWrite(PROGRESS_KEY,progress);
    if(!state.reviewOnly)sessionWrite(RESUME_KEY,{lesson:state.lesson,deck:state.deck,index:state.index});
  }
  function flip() {
    const current=root.querySelector('.guided-card-host .review-card');
    if(!current)return;
    const willAnswer=!current.classList.contains('show-answer');
    if(typeof setCardSide==='function')setCardSide(current,willAnswer);
    else current.classList.toggle('show-answer',willAnswer);
    if(willAnswer)markViewed();
    const b=root.querySelector('[data-guide-flip]');
    if(b)b.innerHTML=willAnswer?labelPair('Mostra la domanda','Show question'):labelPair('Mostra la risposta','Reveal answer');
    const confidence=root.querySelector('.guided-confidence');
    if(confidence)confidence.hidden=!willAnswer;
  }
  function syncCardHeight() { const current=root.querySelector('.guided-card-host .review-card'); if(current && typeof setFlipHeight==='function') requestAnimationFrame(()=>setFlipHeight(current,false,true)); }
  function moveCard(delta) {
    const total=activeCardList().length;
    if(delta>0 && state.index>=total-1){completeTopic(false);return;}
    state.index=Math.max(0,Math.min(total-1,state.index+delta));
    if(!state.reviewOnly)sessionWrite(RESUME_KEY,{lesson:state.lesson,deck:state.deck,index:state.index});
    navigate(state,true,true);
  }
  function feedbackLocation(preferredCard=null) {
    const parts=['Italian for Beginners'];
    let scope='general', itemId='page:'+state.page, lesson='', deck='', cardKey='';
    if(state.page==='card'){
      const c=preferredCard||currentCard();
      lesson=state.lesson||'';deck=state.deck||'';
      parts.push('Lesson '+lesson.slice(1),deck);
      if(c&&!state.finished){scope='card';cardKey=c.key;itemId='card:'+c.key;parts.push('Card '+(state.index+1)+' of '+cardList(lesson,deck).length);}
      else{scope='deck';itemId='deck:'+lesson+':'+(typeof slugify==='function'?slugify(deck):deck);parts.push('Topic completion');}
    } else if(state.page==='lessons'){parts.push('Lesson library');}
    else if(state.page==='topics'){parts.push('Study sheet library');}
    else if(state.page==='course'){parts.push('Course pathway');}
    else if(state.page==='feedback'){parts.push('Feedback page');}
    else{parts.push('Homepage');}
    return {scope,itemId,lesson,deck,cardKey,summary:parts.join(' › ')};
  }
  function ensureFeedbackModal() {
    let modal=document.getElementById('editorialCommentModal');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='editorialCommentModal';modal.className='editorial-comment-modal';modal.hidden=true;
    modal.innerHTML=`<div class="editorial-comment-backdrop" data-editorial-comment-close></div><section class="editorial-comment-dialog" role="dialog" aria-modal="true" aria-labelledby="editorialCommentTitle"><p class="guided-eyebrow">${labelPair('Commenti','Comments')}</p><h2 id="editorialCommentTitle">${labelPair('Invia un commento','Send feedback')}</h2><p class="editorial-comment-location" id="editorialCommentLocation"></p><form id="editorialCommentForm"><label for="editorialCommentReviewer">${labelPair('Nome o iniziali','Name or initials')}</label><input id="editorialCommentReviewer" name="reviewer" maxlength="80" autocomplete="name" required><label for="editorialCommentText">${labelPair('Commento','Comment')}</label><textarea id="editorialCommentText" name="comment" maxlength="4000" required></textarea><div class="editorial-comment-actions"><button type="button" class="guided-secondary" data-editorial-comment-close>${labelPair('Annulla','Cancel')}</button><button type="submit" class="guided-primary">${labelPair('Invia','Send')}</button></div><p class="editorial-comment-status" aria-live="polite"></p></form></section>`;
    document.body.appendChild(modal);
    return modal;
  }
  function openFeedback(card=null) {
    commentContext=feedbackLocation(card);
    const modal=ensureFeedbackModal();
    modal.querySelector('#editorialCommentLocation').textContent=commentContext.summary;
    modal.querySelector('.editorial-comment-status').textContent='';
    const savedReviewer=document.getElementById('reviewer')?.value?.trim();
    if(savedReviewer&&!modal.querySelector('#editorialCommentReviewer').value)modal.querySelector('#editorialCommentReviewer').value=savedReviewer;
    modal.hidden=false;
    setTimeout(()=>modal.querySelector('#editorialCommentReviewer')?.focus(),0);
  }
  function closeFeedback(){const modal=document.getElementById('editorialCommentModal');if(modal)modal.hidden=true;}
  function submitFeedback(event){
    event.preventDefault();
    const form=document.getElementById('editorialCommentForm');
    const name=form?.querySelector('#editorialCommentReviewer')?.value.trim()||'';
    const message=form?.querySelector('#editorialCommentText')?.value.trim()||'';
    if(!name||!message||!commentContext)return;
    const existing=document.getElementById('reviewForm');
    const endpoint=existing?.action;
    const target=existing?.target||'googleReviewSink';
    const status=form.querySelector('.editorial-comment-status');
    if(!endpoint){status.textContent='Comment submission is unavailable.';return;}
    const payload={scope:commentContext.scope,item_id:commentContext.itemId,lesson:commentContext.lesson,deck:commentContext.deck,card_key:commentContext.cardKey,card_summary:commentContext.summary,site_version:EDITORIAL_VERSION,reviewer:name,comment:message};
    const post=document.createElement('form');post.method='POST';post.action=endpoint;post.target=target;post.hidden=true;
    Object.entries(payload).forEach(([key,value])=>{const field=document.createElement('input');field.type='hidden';field.name=key;field.value=String(value??'');post.appendChild(field);});
    document.body.appendChild(post);HTMLFormElement.prototype.submit.call(post);setTimeout(()=>post.remove(),2000);
    status.textContent='Submitted for processing. Please check the review spreadsheet to confirm receipt.';
    form.querySelector('#editorialCommentText').value='';
  }
  function renderKeepingCardFace(){
    const wasAnswer=state.page==='card'&&!!root?.querySelector('.guided-card-host .review-card.show-answer');
    render();
    if(wasAnswer){
      const card=root?.querySelector('.guided-card-host .review-card');
      if(card){card.classList.add('show-answer');if(typeof updateCardSideControls==='function')updateCardSideControls(card,true);if(typeof setFlipHeight==='function')requestAnimationFrame(()=>setFlipHeight(card,true,true));}
      const button=root?.querySelector('[data-guide-flip]');
      if(button)button.innerHTML=labelPair('Mostra la domanda','Show question');
      const confidence=root?.querySelector('.guided-confidence');
      if(confidence)confidence.hidden=false;
    }
  }
  function render() {
    ensure();
    document.body.classList.toggle('guided-focus-active',state.page==='card'&&focusActive());
    root.innerHTML=header()+ (state.page==='lessons'?lessons():state.page==='card'?cardPage():state.page==='topics'?topics():state.page==='feedback'?feedback():state.page==='course'?course():home()) + `<footer class="guided-footer">Italian for Beginners · Last updated 4 November 2026</footer>`;
    syncCardHeight();
  }
  function activate() {
    ensure();
    state=stateFromUrl();
    ready=Boolean(window.__COURSE_DATA_READY__) && Array.isArray(cards) && cards.length>0;
    render();
  }
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-guide-to]');
    if(nav){event.preventDefault();navigate({page:nav.dataset.guideTo});return;}
    const l=event.target.closest('[data-guide-lesson]');
    if(l){event.preventDefault();navigate({page:'card',lesson:l.dataset.guideLesson});return;}
    if(event.target.closest('[data-guide-resume]')){event.preventDefault();navigate({page:'card',...resume()});return;}
    if(event.target.closest('[data-guide-theme]')){themeToggle();return;}
    if(event.target.closest('[data-guide-label-order]')){toggleLabelOrder();return;}
    if(event.target.closest('[data-guide-comment]')){openFeedback(state.page==='card'&&!state.finished?currentCard():null);return;}
    if(event.target.closest('[data-editorial-comment-close]')){closeFeedback();return;}
    if(event.target.closest('[data-guide-complete]')){completeTopic(false);return;}
    if(event.target.closest('[data-guide-focus]')){toggleFocus();return;}
    if(event.target.closest('[data-guide-review-again]')){startReviewAgain();return;}
    if(event.target.closest('[data-guide-all-cards]')){navigate({...state,reviewOnly:false,index:0,finished:false});return;}
    const rating=event.target.closest('[data-guide-rate]');
    if(rating){recordConfidence(rating.dataset.guideRate);return;}
    if(event.target.closest('[data-guide-next-topic]')){completeTopic(true);return;}
    if(event.target.closest('[data-guide-menu]')){menuOpen=!menuOpen;renderKeepingCardFace();return;}
    if(event.target.closest('[data-guide-next]')){moveCard(1);return;}
    if(event.target.closest('[data-guide-prev]')){moveCard(-1);return;}
    if(event.target.closest('[data-guide-restart]')){navigate({...state,index:0,finished:false});return;}
    if(event.target.closest('[data-guide-card-feedback]')){openFeedback(currentCard());return;}
    if(event.target.closest('[data-guide-general-feedback]')){openFeedback(null);return;}
    if(event.target.closest('[data-guide-flip]')){flip();return;}
    if(event.target.closest('.guided-card-host .flip-shell')&&!event.target.closest('button,a,input,summary,details,select,textarea')){flip();return;}
    // The existing delegated reveal controls remain operative. Reflect their state in the simplified button and progress.
    if(event.target.closest('.guided-card-host .reveal-button')){
      const card=root?.querySelector('.guided-card-host .review-card');
      if(card && !card.classList.contains('show-answer'))markViewed();
      setTimeout(()=>{const b=root?.querySelector('[data-guide-flip]');const c=root?.querySelector('.guided-card-host .review-card');const revealed=!!c?.classList.contains('show-answer');if(b&&c)b.innerHTML=revealed?labelPair('Mostra la domanda','Show question'):labelPair('Mostra la risposta','Reveal answer');const rating=root?.querySelector('.guided-confidence');if(rating)rating.hidden=!revealed;},90);
    }
  });
  document.addEventListener('submit',event=>{if(event.target.id==='editorialCommentForm')submitFeedback(event);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeFeedback();});
  document.addEventListener('change',event=>{
    if(event.target.id==='guidedSubdeckSelect')navigate({...state,deck:event.target.value,index:0,finished:false,reviewOnly:false});
  });
  window.addEventListener('popstate',()=>{state=stateFromUrl();render();});
  window.addEventListener('hashchange',()=>{if(location.hash.match(/^#lesson-L\d+$/i)){state=stateFromUrl();render();}});
  window.addEventListener('italian-course-data-ready',()=>{ready=true;render();});
  window.addEventListener('pageshow',()=>{ready=Boolean(window.__COURSE_DATA_READY__);render();});
  activate();
})();