(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('audit') === '1') return; // Keep the established detailed audit unchanged.

  const THEME_KEY = 'italianCourseThemeV1';
  const PROGRESS_KEY = 'italianCourseSessionProgressV2';
  const RESUME_KEY = 'italianGuidedResumeV1';
  const REVIEW_MODE_KEY = 'italianFlashCardSiteModeV1';
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
  let root;

  function safeGet(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (_e) {} }
  function sessionRead(key, fallback) { try { return JSON.parse(sessionStorage.getItem(key) || 'null') || fallback; } catch (_e) { return fallback; } }
  function sessionWrite(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_e) {} }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'}[c])); }
  function cardList(lesson, deck = '') { return (Array.isArray(cards) ? cards : []).filter(c => c.lesson === lesson && (!deck || c.deck === deck)); }
  function lessonInfo(id) { return LESSONS.find(l => l[0] === id) || LESSONS[0]; }
  function totalViewed(lesson) { const viewed = sessionRead(PROGRESS_KEY, {}).flashcards?.viewed || {}; return cardList(lesson).filter(c => !!viewed[c.key]).length; }
  function resume() { return sessionRead(RESUME_KEY, {lesson: null, deck: '', index: 0}); }

  function stateFromUrl() {
    const url = new URL(location.href);
    const page = url.searchParams.get('page');
    const legacy = url.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase();
    const lesson = url.searchParams.get('lesson') || legacy;
    if (lesson && LESSONS.some(l => l[0] === lesson)) return {page:'card',lesson,deck:url.searchParams.get('topic') || '',index:Math.max(0,Number(url.searchParams.get('card') || 0)),finished:false};
    if (page === 'lessons' || page === 'topics' || page === 'feedback' || page === 'course') return {page,lesson:null,deck:'',index:0,finished:false};
    if (url.searchParams.get('view') === 'study') return {page:'topics',lesson:null,deck:'',index:0,finished:false};
    if (url.searchParams.get('view') === 'flashcards') return {page:'lessons',lesson:null,deck:'',index:0,finished:false};
    return {page:'home',lesson:null,deck:'',index:0,finished:false};
  }
  function urlFor(next) {
    const u = new URL(location.href);
    for (const key of ['view','page','lesson','topic','card']) u.searchParams.delete(key);
    u.hash = '';
    if (next.page !== 'home') u.searchParams.set('page',next.page);
    if (next.page === 'card' && next.lesson) {
      u.searchParams.set('lesson',next.lesson);
      if (next.deck) u.searchParams.set('topic',next.deck);
      if (next.index) u.searchParams.set('card',String(next.index));
    }
    return u.pathname + u.search;
  }
  function navigate(next, push = true) {
    state = {page:next.page || 'home',lesson:next.lesson || null,deck:next.deck || '',index:next.index || 0,finished:!!next.finished};
    if (push) history.pushState(null,'',urlFor(state));
    menuOpen = false;
    render();
    window.scrollTo({top:0,behavior:isReducedMotion()?'auto':'smooth'});
    root.querySelector('.guided-title')?.focus({preventScroll:true});
  }
  function themeApply() {
    dark = safeGet(THEME_KEY,'dark') !== 'light';
    document.body.classList.toggle('nightMode',dark);
    document.body.classList.toggle('night_mode',dark);
    document.documentElement.style.colorScheme = dark?'dark':'light';
  }
  function themeToggle() { safeSet(THEME_KEY,dark?'light':'dark'); themeApply(); render(); }
  function ensure() {
    if (root) return;
    document.body.classList.add('guided-enabled');
    themeApply();
    root = document.createElement('div');
    root.id = 'guidedExperience';
    root.className = 'guided-experience';
    document.querySelector('.site-shell')?.prepend(root);
  }
  function header() {
    const current = state.page === 'card'?'lessons':state.page;
    return `<header class="guided-header">
      <a class="guided-brand" data-guide-to="home" href="?page=home"><span class="guided-brandmark" aria-hidden="true">it.</span><span><strong>Italian for Beginners</strong><small>BSE Course · Beginners, Semester 1</small></span></a>
      <nav id="guidedNavigation" class="guided-navigation ${menuOpen?'is-open':''}" aria-label="Main navigation">
        ${[['home','Home'],['lessons','Lessons'],['topics','Study sheets'],['feedback','Give feedback']].map(([key,label])=>`<a href="?page=${key}" data-guide-to="${key}" ${current===key?'aria-current="page"':''}>${label}</a>`).join('')}
      </nav>
      <div class="guided-tools"><button class="guided-theme" type="button" data-guide-theme title="Change colour theme" aria-label="Switch to ${dark?'light':'dark'} mode"><span aria-hidden="true">${dark?'☀':'☾'}</span><span>${dark?'Light':'Dark'}</span></button><button class="guided-menu" type="button" data-guide-menu aria-controls="guidedNavigation" aria-expanded="${menuOpen}">☰ <span>Menu</span></button></div>
    </header>`;
  }
  function crumbs(segments) { return `<nav aria-label="Breadcrumb" class="guided-breadcrumb"><a data-guide-to="home" href="?page=home">Home</a>${segments.map(s=>`<span aria-hidden="true">›</span>${s.to?`<a href="?page=${s.to}" data-guide-to="${s.to}">${esc(s.label)}</a>`:`<span aria-current="page">${esc(s.label)}</span>`}`).join('')}</nav>`; }
  function coursePill() {return `<span class="guided-context">Beginners · Semester 1 of 3</span>`;}
  function home() {
    const last = resume();
    const validResume = ready && LESSONS.some(l=>l[0]===last.lesson);
    return `<main id="guidedMain" class="guided-main">
      <p class="guided-eyebrow">Start here ${coursePill()}</p><h1 tabindex="-1" class="guided-title">What would you like to do?</h1>
      <p class="guided-lede">Choose a lesson or a study topic. You can suggest corrections without interrupting your practice.</p>
      <div class="guided-choices">
        <a href="?page=lessons" data-guide-to="lessons" class="guided-choice"><span class="guided-choice-icon" aria-hidden="true">▣</span><strong>Study lesson flashcards</strong><span>Practise one card at a time, in course order.</span><b>Choose a lesson →</b></a>
        <a href="?page=topics" data-guide-to="topics" class="guided-choice"><span class="guided-choice-icon" aria-hidden="true">▤</span><strong>Study a topic</strong><span>Read a short guide, then answer a few questions.</span><b>Browse study sheets →</b></a>
      </div>
      ${validResume?`<section class="guided-resume"><div><span class="guided-small">Pick up where you left off</span><strong>Lesson ${last.lesson.slice(1)} · ${esc(lessonInfo(last.lesson)[1])}</strong><span>${totalViewed(last.lesson)} answer${totalViewed(last.lesson)===1?'':'s'} viewed in this browser session</span></div><a href="${esc(urlFor({page:'card',...last}))}" data-guide-resume class="guided-primary">Continue →</a></section>`:''}
      <section class="guided-learning-note"><div><strong>Some topics feel difficult at first.</strong><p>You can practise recognising a pattern now and return to it as later lessons build on it. You do not need to master every detail immediately.</p></div><a href="?page=course" data-guide-to="course">See the course pathway →</a></section>
    </main>`;
  }
  function lessons() {
    const content = ready?LESSONS.map(([id,title,description])=>{
      const total = cardList(id).length, viewed=totalViewed(id), pct=total?100*viewed/total:0;
      return `<a class="guided-lesson" href="${esc(urlFor({page:'card',lesson:id}))}" data-guide-lesson="${id}"><span class="guided-lesson-number">${id.slice(1)}</span><span class="guided-lesson-copy"><strong>${esc(title)}</strong><span>${esc(description)}</span><small>${total} cards · ${viewed} answers viewed</small><span class="guided-track"><span style="width:${pct}%"></span></span></span><span class="guided-chevron" aria-hidden="true">›</span></a>`;
    }).join(''):'<p class="guided-muted" role="status">Loading the lesson library…</p>';
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Beginners · Semester 1',to:'course'},{label:'Lessons'}])}<p class="guided-eyebrow">Flashcards ${coursePill()}</p><h1 class="guided-title" tabindex="-1">Choose a lesson</h1><p class="guided-lede">Five lessons from this semester. Each opens into one question at a time.</p><div class="guided-lessons">${content}</div><p class="guided-understated">Lessons build on each other. More challenging ideas may be revisited and expanded in later sessions.</p></main>`;
  }
  function topics() {
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Study sheets'}])}<p class="guided-eyebrow">Study guides</p><h1 class="guided-title" tabindex="-1">Choose a topic</h1><p class="guided-lede">Each guide opens separately with its own questions, hints, and progress.</p>${TOPICS.map(([name,entries])=>`<section class="guided-topic-group"><h2>${esc(name)}</h2><div class="guided-topic-grid">${entries.map(([slug,title])=>`<a class="guided-topic" href="study/study-sheets.html?mode=learn&sheet=${encodeURIComponent(slug)}"><strong>${esc(title)}</strong><span>Open guide →</span></a>`).join('')}</div></section>`).join('')}</main>`;
  }
  function course() {
    const stage=(label,current,items)=>`<section class="guided-course-stage"><div><h2>${label}</h2><span>${current?'Currently studying':'Planned stages — no content available yet'}</span></div><div class="guided-semesters">${items.map((name,i)=>`<span class="guided-semester ${current&&i===0?'is-current':''}">${name}${current&&i===0?' · current':name==='Details to be confirmed'?'':' · later'}</span>`).join('')}</div></section>`;
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Course pathway'}])}<p class="guided-eyebrow">Course pathway</p><h1 class="guided-title" tabindex="-1">Where this semester fits</h1><p class="guided-lede">The programme moves through Beginners (three semesters), Intermediate (three semesters), then Advanced. Advanced semester details are still to be confirmed.</p><div class="guided-course-path">${stage('Beginners',true,['Semester 1','Semester 2','Semester 3'])}${stage('Intermediate',false,['Semester 1','Semester 2','Semester 3'])}${stage('Advanced',false,['Details to be confirmed'])}</div><section class="guided-learning-note"><strong>Learn it in stages.</strong><p>Laura has explained that some ideas introduced in early lessons will make more sense as later lessons and semesters develop them. Future semesters are shown only as a pathway, not as available content.</p></section><div class="guided-actions"><button class="guided-primary" data-guide-to="lessons">Open this semester’s lessons →</button></div></main>`;
  }
  function feedback() {
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Give feedback'}])}<p class="guided-eyebrow">Help improve the materials</p><h1 class="guided-title" tabindex="-1">Suggest a correction</h1><p class="guided-lede">Found a translation, pronunciation or teaching issue? Leave a short comment for the course organiser. You can also comment on a specific card or study sheet.</p><section class="guided-info"><strong>Most useful feedback includes:</strong><p>The lesson or card, what seems incorrect, and what you suggest changing. A name or initials is enough.</p></section><div class="guided-actions"><button type="button" class="guided-primary" data-guide-general-feedback>Leave general feedback</button><a class="guided-secondary" href="?page=lessons" data-guide-to="lessons">Find a flashcard</a><a class="guided-secondary" href="study/study-sheets.html?mode=review">Browse study sheets to review</a></div></main>`;
  }
  function cardPage() {
    const lesson = state.lesson;
    if (!ready) return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Lessons',to:'lessons'},{label:'Loading'}])}<div role="status" class="guided-info">Loading the flashcards…</div></main>`;
    const [id,title] = lessonInfo(lesson);
    const all = cardList(lesson);
    const decks=[...new Set(all.map(c=>c.deck))];
    if (state.deck && !decks.includes(state.deck)) state.deck='';
    const filtered = cardList(lesson,state.deck);
    const total=filtered.length;
    if (state.index>=total) state.index=Math.max(0,total-1);
    const current=filtered[state.index];
    if(!current) return `<main id="guidedMain" class="guided-main"><p>No flashcards are available for this selection.</p><a href="?page=lessons" data-guide-to="lessons">Back to lessons</a></main>`;
    const done=totalViewed(lesson);
    if(state.finished){return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Lessons',to:'lessons'},{label:'Lesson '+id.slice(1)}])}<section class="guided-complete"><span aria-hidden="true" class="guided-big-icon">✓</span><h1 class="guided-title" tabindex="-1">You reached the end of this selection</h1><p>${done} of ${all.length} card answers viewed in this session. You can revisit unanswered cards whenever you like.</p><div class="guided-actions"><button class="guided-primary" data-guide-restart>Review these cards again</button><button class="guided-secondary" data-guide-to="lessons">Choose another lesson</button></div></section></main>`;}
    const pct=(state.index+1)/total*100;
    const isReviewed=!!sessionRead(PROGRESS_KEY,{}).flashcards?.viewed?.[current.key];
    const cardMarkup = typeof renderCard === 'function' ? renderCard(current,state.index+1,total):'<p>Loading card template…</p>';
    return `<main class="guided-main" id="guidedMain">${crumbs([{label:'Beginners · Semester 1',to:'course'},{label:'Lessons',to:'lessons'},{label:'Lesson '+id.slice(1)}])}
      <section class="guided-card-layout"><div class="guided-card-heading"><div><p class="guided-eyebrow">Lesson ${id.slice(1)} · ${esc(title)}</p><h1 class="guided-title" tabindex="-1">${esc(current.deck)}</h1></div><span class="guided-card-count">Card ${state.index+1} of ${total}</span></div>
      <div class="guided-card-options"><label for="guidedSubdeckSelect">Focus on a topic</label><select id="guidedSubdeckSelect"><option value="">All lesson topics</option>${decks.map(d=>`<option value="${esc(d)}" ${state.deck===d?'selected':''}>${esc(d)}</option>`).join('')}</select></div>
      <div role="progressbar" aria-label="Position in selected flashcards" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" class="guided-progress-track"><span style="width:${pct}%"></span></div>
      <section class="guided-card-host" aria-label="Current flashcard"><div class="subdeck-accordion is-open"><div class="card-list">${cardMarkup}</div></div></section>
      <div class="guided-card-actions"><button class="guided-primary" data-guide-flip>${isReviewed?'Show answer / question':'Reveal answer'}</button><button class="guided-secondary" data-guide-prev ${state.index===0?'disabled':''}>← Previous</button><button class="guided-secondary" data-guide-next>${state.index===total-1?'Finish':'Next card →'}</button><button class="guided-feedback" data-guide-card-feedback>Suggest a correction</button></div>
      <p class="guided-understated">Say your answer before revealing it. Explanations are provided to support your learning; some ideas will become clearer in later lessons.</p></section>
    </main>`;
  }
  function currentCard() { return cardList(state.lesson,state.deck)[state.index] || null; }
  function markViewed() {
    const card=currentCard(); if(!card)return;
    const progress=sessionRead(PROGRESS_KEY,{flashcards:{viewed:{}}});
    if(!progress.flashcards)progress.flashcards={viewed:{}};
    if(!progress.flashcards.viewed)progress.flashcards.viewed={};
    progress.flashcards.viewed[card.key]=Date.now();
    progress.flashcards.lastLesson=state.lesson;
    sessionWrite(PROGRESS_KEY,progress);
    sessionWrite(RESUME_KEY,{lesson:state.lesson,deck:state.deck,index:state.index});
  }
  function flip() {
    const current=root.querySelector('.guided-card-host .review-card');
    if(!current)return;
    const willAnswer=!current.classList.contains('show-answer');
    if(typeof setCardSide==='function')setCardSide(current,willAnswer);
    else current.classList.toggle('show-answer',willAnswer);
    if(willAnswer)markViewed();
    const b=root.querySelector('[data-guide-flip]');
    if(b)b.textContent=willAnswer?'Show question':'Reveal answer';
  }
  function syncCardHeight() { const current=root.querySelector('.guided-card-host .review-card'); if(current && typeof setFlipHeight==='function') requestAnimationFrame(()=>setFlipHeight(current,false,true)); }
  function moveCard(delta) {
    const total=cardList(state.lesson,state.deck).length;
    if(delta>0 && state.index>=total-1){state.finished=true;sessionWrite(RESUME_KEY,{lesson:state.lesson,deck:state.deck,index:state.index});navigate({...state,finished:true});return;}
    state.index=Math.max(0,Math.min(total-1,state.index+delta));
    sessionWrite(RESUME_KEY,{lesson:state.lesson,deck:state.deck,index:state.index});
    navigate(state);
  }
  function openFeedback(card) {
    // The existing comment component is intentionally hidden in Learn mode.
    // Switch to the supported Review mode before opening it, preserving its form fields and submission path.
    const reviewSwitch=document.querySelector('[data-site-mode="review"]');
    if(reviewSwitch && document.body.classList.contains('mode-learn'))reviewSwitch.click();
    if(typeof openReview==='function') {
      if(card)openReview('card',{lesson:card.lesson,deck:card.deck,card});
      else openReview('general');
    }
  }
  function render() {
    ensure();
    root.innerHTML=header()+ (state.page==='lessons'?lessons():state.page==='card'?cardPage():state.page==='topics'?topics():state.page==='feedback'?feedback():state.page==='course'?course():home()) + `<footer class="guided-footer">Italian for Beginners · Bury St Edmunds course · <a href="?page=course" data-guide-to="course">Course pathway</a> · Last updated 4 November 2026</footer>`;
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
    if(event.target.closest('[data-guide-menu]')){menuOpen=!menuOpen;render();return;}
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
      setTimeout(()=>{const b=root?.querySelector('[data-guide-flip]');const c=root?.querySelector('.guided-card-host .review-card');if(b&&c)b.textContent=c.classList.contains('show-answer')?'Show question':'Reveal answer';},90);
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='guidedSubdeckSelect')navigate({...state,deck:event.target.value,index:0,finished:false});
  });
  window.addEventListener('popstate',()=>{state=stateFromUrl();render();});
  window.addEventListener('hashchange',()=>{if(location.hash.match(/^#lesson-L\d+$/i)){state=stateFromUrl();render();}});
  window.addEventListener('italian-course-data-ready',()=>{ready=true;render();});
  window.addEventListener('pageshow',()=>{ready=Boolean(window.__COURSE_DATA_READY__);render();});
  activate();
})();