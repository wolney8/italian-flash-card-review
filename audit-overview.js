(function () {
  const params = new URLSearchParams(window.location.search);
  const AUDIT_MODE = params.get('audit') === '1';
  const VIEWED_KEY = 'italianFlashCardAnswersViewedV1';
  const COLLAPSED_KEY = 'italianFlashCardStudyCollapsedV1';
  const AUDIT_KEY = 'italianFlashCardAuditStatusesV1';
  let timer = null;

  function installStyles() {
    if (document.getElementById('reviewFlowStyles')) return;
    const style = document.createElement('style');
    style.id = 'reviewFlowStyles';
    style.textContent = `
      .study-card-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:12px 0 18px;padding:13px 14px;background:#171c20;border:1px solid #5d6972;border-radius:14px;text-align:left}
      .study-status-copy strong,.study-status-copy span{display:block}.study-status-copy strong{font-size:14px}.study-status-copy span{color:#aeb9bf;font-size:12px}
      .study-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.study-action{min-height:40px;padding:8px 12px;border:2px solid #71808a;border-radius:10px;background:#2a3137;color:#edf3f1;font:inherit;font-size:13px;font-weight:800}.study-action.next{border-color:#86b9ea;background:#25384a}.study-action.collapse{border-color:#b7a3e4;background:#35304a}.study-action:disabled{cursor:not-allowed;opacity:.48}
      .study-collapsible-part{overflow:hidden;transition:max-height .38s cubic-bezier(.22,.8,.24,1),opacity .24s ease}.review-card.study-collapsed{box-shadow:0 9px 24px rgba(0,0,0,.2)}
      .subdeck-toggle{flex-wrap:wrap}.study-subdeck-count{margin-left:auto;padding:5px 9px;border:1px solid var(--line);border-radius:999px;color:var(--muted);font-size:12px;font-weight:750;white-space:nowrap}.study-subdeck-count.complete{border-color:#75c7ae;color:#b6e5d8}
      .answer-body .section p+p,.answer-body .section div+div{margin-top:.65em}
      @media(max-width:760px){.study-card-bar{align-items:stretch;flex-direction:column}.study-actions,.study-action{width:100%}.study-subdeck-count{order:3;width:100%;margin-left:0;border-radius:9px;white-space:normal}}
      @media(prefers-reduced-motion:reduce){.study-collapsible-part{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function readJson(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isViewed(key) { return Boolean(readJson(VIEWED_KEY)[key]); }
  function markViewed(key) {
    if (!key || isViewed(key)) return;
    const state = readJson(VIEWED_KEY);
    state[key] = { viewed_at: new Date().toISOString() };
    writeJson(VIEWED_KEY, state);
  }
  function isCollapsed(key) { return Boolean(readJson(COLLAPSED_KEY)[key]); }
  function saveCollapsed(key, collapsed) {
    const state = readJson(COLLAPSED_KEY);
    if (collapsed) state[key] = true; else delete state[key];
    writeJson(COLLAPSED_KEY, state);
  }
  function auditStatus(key) { return readJson(AUDIT_KEY)[key]?.status || ''; }

  function lessonCards() {
    if (typeof cards === 'undefined' || typeof currentLesson === 'undefined' || !currentLesson) return [];
    return cards.filter(card => card.lesson === currentLesson);
  }
  function cardElement(key) { return document.querySelector(`.review-card[data-key="${CSS.escape(key)}"]`); }
  function sectionFor(card) {
    if (!card) return null;
    return [...document.querySelectorAll('.subdeck-section')].find(section => section.dataset.subdeck === card.deck) || null;
  }
  function setAccordion(section, open) {
    const accordion = section?.querySelector('.subdeck-accordion');
    if (!accordion) return;
    if (typeof setSubdeckOpen === 'function') setSubdeckOpen(accordion, open);
    else accordion.classList.toggle('is-open', open);
  }

  function removeBanner() { document.getElementById('auditOverviewBanner')?.remove(); }
  function renderAuditBanner() {
    if (!AUDIT_MODE) return;
    const app = document.getElementById('app');
    if (!app || typeof cards === 'undefined' || !Array.isArray(cards) || !cards.length) return;
    if (typeof currentLesson !== 'undefined' && currentLesson) { removeBanner(); return; }
    if (document.getElementById('auditOverviewBanner')) return;
    const anchor = app.querySelector('.review-guide') || app.firstElementChild;
    if (!anchor) return;
    const banner = document.createElement('section');
    banner.id = 'auditOverviewBanner';
    banner.className = 'audit-panel audit-panel-prominent';
    banner.innerHTML = `<div class="audit-panel-grid"><div><p class="eyebrow">Personal audit mode is active</p><h2>Choose a lesson to begin the card-by-card audit</h2><p>The <strong>Reviewed OK</strong>, <strong>Needs change</strong> and <strong>Remove</strong> controls appear near the top of every card.</p></div><div class="audit-controls" aria-label="Open a lesson for auditing"><button type="button" data-lesson-nav="L1">Audit Lesson 1</button><button type="button" data-lesson-nav="L2">Audit Lesson 2</button><button type="button" data-lesson-nav="L3">Audit Lesson 3</button><button type="button" data-lesson-nav="L4">Audit Lesson 4</button></div></div>`;
    anchor.insertAdjacentElement('beforebegin', banner);
  }

  function studyParts(element) {
    return [element?.querySelector('.card-sticky-tools'),element?.querySelector('.flip-shell'),element?.querySelector('.card-actions')].filter(Boolean);
  }
  function applyStudyCollapse(element, collapsed, animate) {
    if (!element) return;
    const parts = studyParts(element);
    element.classList.toggle('study-collapsed', collapsed);
    parts.forEach(part => {
      part.classList.add('study-collapsible-part');
      part.inert = collapsed;
      part.setAttribute('aria-hidden', String(collapsed));
      if (!animate) {
        part.style.maxHeight = collapsed ? '0px' : 'none'; part.style.opacity = collapsed ? '0' : '1'; part.style.pointerEvents = collapsed ? 'none' : '';
        return;
      }
      if (collapsed) {
        part.style.maxHeight = `${Math.ceil(part.getBoundingClientRect().height || part.scrollHeight)}px`; part.style.opacity = '1';
        requestAnimationFrame(() => { part.style.maxHeight = '0px'; part.style.opacity = '0'; part.style.pointerEvents = 'none'; });
      } else {
        part.style.maxHeight = '0px'; part.style.opacity = '0'; part.style.pointerEvents = '';
        requestAnimationFrame(() => { part.style.maxHeight = `${Math.ceil(part.scrollHeight)}px`; part.style.opacity = '1'; });
        setTimeout(() => { if (!element.classList.contains('study-collapsed')) part.style.maxHeight = 'none'; }, 420);
      }
    });
  }

  function normalBar(card) {
    const viewed = isViewed(card.key), collapsed = isCollapsed(card.key);
    return `<div class="study-card-bar" data-study-key="${card.key}" data-viewed="${String(viewed)}" data-collapsed="${String(collapsed)}"><div class="study-status-copy"><strong>${viewed ? 'Answer viewed' : 'Review this card'}</strong><span>${viewed ? 'Ready to continue' : 'Reveal the answer before moving on'}</span></div><div class="study-actions"><button type="button" class="study-action collapse" data-study-action="collapse">${collapsed ? 'Expand card' : 'Collapse card'}</button><button type="button" class="study-action next" data-study-next="${card.key}" ${viewed ? '' : 'disabled'}>${viewed ? 'Next card →' : 'Show answer first'}</button></div></div>`;
  }

  function syncStudyBars() {
    if (AUDIT_MODE || typeof currentLesson === 'undefined' || !currentLesson) return;
    document.querySelectorAll('.review-card').forEach(element => {
      const card = cards.find(item => item.key === element.dataset.key); if (!card) return;
      const viewed = String(isViewed(card.key)), collapsed = String(isCollapsed(card.key));
      const existing = element.querySelector('.study-card-bar');
      if (!existing) {
        const position = element.querySelector('.card-position');
        if (position) position.insertAdjacentHTML('afterend', normalBar(card)); else element.insertAdjacentHTML('afterbegin', normalBar(card));
      } else if (existing.dataset.viewed !== viewed || existing.dataset.collapsed !== collapsed) existing.outerHTML = normalBar(card);
      applyStudyCollapse(element, isCollapsed(card.key), false);
    });
  }

  function syncStudyCounts() {
    if (AUDIT_MODE || typeof currentLesson === 'undefined' || !currentLesson) return;
    document.querySelectorAll('.subdeck-section').forEach(section => {
      const deckCards = cards.filter(card => card.lesson === currentLesson && card.deck === section.dataset.subdeck);
      const viewed = deckCards.filter(card => isViewed(card.key)).length;
      const toggle = section.querySelector('.subdeck-toggle'); if (!toggle) return;
      let badge = toggle.querySelector('.study-subdeck-count');
      if (!badge) { badge = document.createElement('span'); badge.className = 'study-subdeck-count'; const chevron = toggle.querySelector('.subdeck-chevron'); if (chevron) chevron.insertAdjacentElement('beforebegin', badge); else toggle.appendChild(badge); }
      badge.textContent = `${viewed}/${deckCards.length} answers viewed`;
      badge.classList.toggle('complete', viewed === deckCards.length && deckCards.length > 0);
    });
  }

  function deckComplete(deck) {
    const deckCards = lessonCards().filter(card => card.deck === deck);
    return deckCards.length > 0 && deckCards.every(card => isViewed(card.key));
  }

  function ensureAllCardsRendered(targetKey) {
    let element = cardElement(targetKey);
    if (!element && typeof renderLesson === 'function') {
      if (typeof deckSelect !== 'undefined') deckSelect.value = '';
      if (typeof searchInput !== 'undefined') searchInput.value = '';
      renderLesson();
      element = cardElement(targetKey);
    }
    return element;
  }

  function goToStudyCard(target) {
    const element = ensureAllCardsRendered(target.key); if (!element) return;
    saveCollapsed(target.key, false); applyStudyCollapse(element, false, false);
    if (element.classList.contains('show-answer') && typeof setCardSide === 'function') setCardSide(element, false);
    setTimeout(() => element.scrollIntoView({behavior:'smooth',block:'start'}), 150);
  }

  function nextStudy(afterKey) {
    const ordered = lessonCards(); const index = ordered.findIndex(card => card.key === afterKey); if (index < 0) return;
    const current = ordered[index], currentElement = cardElement(current.key);
    if (!isViewed(current.key)) { currentElement?.querySelector('.reveal-button')?.focus(); return; }
    saveCollapsed(current.key, true); applyStudyCollapse(currentElement, true, true);
    const target = ordered[index + 1], currentSection = sectionFor(current);
    if (!target) { if (deckComplete(current.deck)) setAccordion(currentSection, false); return; }
    const targetSection = sectionFor(target);
    if (current.deck !== target.deck) { if (deckComplete(current.deck)) setAccordion(currentSection, false); setAccordion(targetSection, true); }
    goToStudyCard(target); syncStudyBars(); syncStudyCounts();
  }

  function nextAudit(afterKey) {
    const ordered = lessonCards(); if (!ordered.length) return;
    const index = afterKey ? ordered.findIndex(card => card.key === afterKey) : -1;
    const candidates = ordered.slice(index + 1).concat(ordered.slice(0, Math.max(index + 1, 0)));
    const target = candidates.find(card => card.key !== afterKey && !['ok','fix','remove'].includes(auditStatus(card.key)));
    if (!target) return;
    const current = index >= 0 ? ordered[index] : null;
    if (current && current.deck !== target.deck) { setAccordion(sectionFor(current), false); setAccordion(sectionFor(target), true); }
    else setAccordion(sectionFor(target), true);
    const filter = document.getElementById('auditFilter'); if (filter) filter.value = 'all';
    const element = ensureAllCardsRendered(target.key); if (!element) return;
    setAccordion(sectionFor(target), true);
    if (element.classList.contains('audit-collapsed')) element.querySelector('[data-audit-action="collapse"]')?.click();
    if (element.classList.contains('show-answer') && typeof setCardSide === 'function') setCardSide(element, false);
    setTimeout(() => element.scrollIntoView({behavior:'smooth',block:'start'}), 180);
  }

  function normaliseContent() {
    document.querySelectorAll('.front-body').forEach(front => {
      const focus = front.querySelector('.focus'), clue = front.querySelector('.clue');
      if (focus && clue) clue.hidden = focus.textContent.replace(/\s+/g,' ').trim() === clue.textContent.replace(/\s+/g,' ').trim();
    });
    document.querySelectorAll('.answer-body .section').forEach(section => {
      const label = section.querySelector(':scope > .label'); if (!label || !/rule\s*\/\s*forms/i.test(label.textContent)) return;
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT), nodes=[]; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => { if (node.parentElement?.classList.contains('label')) return; node.nodeValue = node.nodeValue.replace(/([.!?])(?=[A-ZÀ-ÖØ-Þ])/g,'$1 ').replace(/([a-zà-öø-ÿ0-9)])(?=(Who|The|Visuals|English|Lesson|Example|Use|Formal|Informal)\b)/g,'$1 '); });
    });
  }

  function enhance() {
    installStyles(); normaliseContent(); renderAuditBanner();
    if (!AUDIT_MODE) { syncStudyBars(); syncStudyCounts(); }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(enhance, 100); }

  window.addEventListener('click', event => {
    if (!AUDIT_MODE) return;
    const button = event.target.closest('[data-audit-next], #auditNext');
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation(); nextAudit(button.dataset.auditNext || '');
  }, true);

  document.addEventListener('click', event => {
    if (AUDIT_MODE) return;
    const reveal = event.target.closest('.reveal-button');
    if (reveal) { const element = reveal.closest('.review-card'); if (element && !element.classList.contains('show-answer')) { markViewed(element.dataset.key); setTimeout(enhance,80); } return; }
    const collapse = event.target.closest('[data-study-action="collapse"]');
    if (collapse) { const element = collapse.closest('.review-card'), key = element?.dataset.key; if (!key) return; const next = !isCollapsed(key); saveCollapsed(key,next); applyStudyCollapse(element,next,true); setTimeout(enhance,420); return; }
    const next = event.target.closest('[data-study-next]'); if (next) { event.preventDefault(); nextStudy(next.dataset.studyNext); }
  }, true);

  const app = document.getElementById('app'); if (app) new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
  const wait=()=>{if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length)enhance();else setTimeout(wait,120);}; wait();
})();
