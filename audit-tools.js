(function () {
  const STORAGE_KEY = 'italianFlashCardAuditStatusesV1';
  const FILTER_KEY = 'italianFlashCardAuditFilterV1';
  const COLLAPSE_KEY = 'italianFlashCardAuditCollapsedV1';
  const SITE_VERSION = '5.5-audit-3';
  const VALID = new Set(['ok', 'fix', 'remove']);
  const params = new URLSearchParams(window.location.search);
  if (params.get('audit') !== '1') return;

  document.body.classList.add('audit-mode-active');

  let timer = null;

  function installAuditRibbon() {
    if (document.getElementById('auditModeRibbon')) return;
    const ribbon = document.createElement('div');
    ribbon.id = 'auditModeRibbon';
    ribbon.className = 'audit-mode-ribbon';
    ribbon.innerHTML = '<strong>AUDIT MODE</strong><span>Review controls are active</span>';
    document.body.appendChild(ribbon);
  }

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function readState() {
    return readJson(STORAGE_KEY, {});
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function readCollapsed() {
    return readJson(COLLAPSE_KEY, {});
  }

  function writeCollapsed(state) {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state));
  }

  function statusOf(key) {
    return readState()[key]?.status || '';
  }

  function isAudited(key) {
    return VALID.has(statusOf(key));
  }

  function saveStatus(key, status) {
    const state = readState();
    if (VALID.has(status)) state[key] = { status, updated_at: new Date().toISOString() };
    else delete state[key];
    writeState(state);
  }

  function isCollapsed(key) {
    return Boolean(readCollapsed()[key]);
  }

  function saveCollapsed(key, collapsed) {
    const state = readCollapsed();
    if (collapsed) state[key] = true;
    else delete state[key];
    writeCollapsed(state);
  }

  function cardFor(key) {
    return typeof cards !== 'undefined' ? cards.find(card => card.key === key) : null;
  }

  function plain(value) {
    if (typeof stripHtml === 'function') return stripHtml(value);
    const holder = document.createElement('div');
    holder.innerHTML = value || '';
    return holder.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function reviewer() {
    if (typeof getSavedReviewer === 'function') return getSavedReviewer() || 'Anonymous';
    return document.getElementById('reviewer')?.value?.trim() || 'Anonymous';
  }

  function sendAudit(card, scope, comment) {
    if (!card || typeof submitToGoogleSheet !== 'function') return;
    submitToGoogleSheet({
      reviewer: reviewer(),
      comment,
      scope,
      item_id: `card:${card.key}`,
      lesson: card.lesson || '',
      deck: card.deck || '',
      card_key: card.key || '',
      card_summary: `${plain(card.prompt)} → ${plain(card.answer)}`,
      site_version: SITE_VERSION
    });
  }

  function labels(status) {
    if (status === 'ok') return ['Reviewed OK', 'No change requested'];
    if (status === 'fix') return ['Needs change', 'A correction has been logged'];
    if (status === 'remove') return ['Remove card', 'Marked as not useful'];
    return ['Not reviewed', 'Choose an audit action'];
  }

  function barMarkup(card, status, collapsed) {
    const [title, subtitle] = labels(status);
    return `
      <div class="audit-card-bar" data-audit-key="${card.key}" data-audit-status="${status}" data-audit-collapsed="${String(collapsed)}">
        <div class="audit-status-copy">
          <strong>${title}</strong>
          <span>${subtitle}</span>
        </div>
        <div class="audit-actions" role="group" aria-label="Audit this card">
          <button type="button" class="audit-action ok ${status === 'ok' ? 'active' : ''}" data-audit-action="ok">✓ Reviewed OK</button>
          <button type="button" class="audit-action fix ${status === 'fix' ? 'active' : ''}" data-audit-action="fix">⚠ Needs change</button>
          <button type="button" class="audit-action remove ${status === 'remove' ? 'active' : ''}" data-audit-action="remove">✕ Remove</button>
          ${status ? `<button type="button" class="audit-action collapse" data-audit-action="collapse" aria-expanded="${String(!collapsed)}">${collapsed ? 'Expand card' : 'Collapse card'}</button>` : ''}
          <button type="button" class="audit-action next" data-audit-next="${card.key}">Next unreviewed →</button>
          ${status ? '<button type="button" class="audit-action clear" data-audit-action="clear">Clear</button>' : ''}
        </div>
      </div>`;
  }

  function ensurePanel() {
    if (typeof currentLesson === 'undefined' || !currentLesson || document.getElementById('auditPanel')) return;
    const header = document.querySelector('.lesson-header');
    if (!header) return;

    const exitUrl = `${window.location.pathname}${window.location.hash || '#lessons'}`;
    const panel = document.createElement('section');
    panel.id = 'auditPanel';
    panel.className = 'audit-panel audit-panel-prominent';
    panel.innerHTML = `
      <div class="audit-panel-grid">
        <div>
          <p class="eyebrow">Personal audit mode</p>
          <h2>Audit controls are active for this lesson</h2>
          <p>Choose <strong>Reviewed OK</strong>, <strong>Needs change</strong> or <strong>Remove</strong> for every card. Any of those three choices counts as audited, so <strong>Next unreviewed</strong> skips all cards that already have a decision.</p>
        </div>
        <div class="audit-controls">
          <label>Show
            <select id="auditFilter">
              <option value="all">All cards</option>
              <option value="unreviewed">Unreviewed only</option>
              <option value="ok">Reviewed OK</option>
              <option value="fix">Needs change</option>
              <option value="remove">Remove</option>
            </select>
          </label>
          <button type="button" id="auditNext">Next unreviewed</button>
          <a href="${exitUrl}">Exit audit mode</a>
        </div>
      </div>
      <div class="audit-progress-track" aria-hidden="true"><div class="audit-progress-fill" id="auditProgressFill"></div></div>
      <div class="audit-progress-copy" id="auditProgressCopy"></div>
      <div class="audit-notice" id="auditNotice" aria-live="polite"></div>`;

    header.insertAdjacentElement('afterend', panel);
    const filter = document.getElementById('auditFilter');
    filter.value = localStorage.getItem(FILTER_KEY) || 'all';
    filter.addEventListener('change', () => {
      localStorage.setItem(FILTER_KEY, filter.value);
      applyFilter();
    });
    document.getElementById('auditNext')?.addEventListener('click', () => nextUnreviewed());
  }

  function collapsibleParts(cardElement) {
    return [
      cardElement.querySelector('.card-sticky-tools'),
      cardElement.querySelector('.flip-shell'),
      cardElement.querySelector('.card-actions')
    ].filter(Boolean);
  }

  function applyCollapsedState(cardElement, collapsed, animate = false) {
    if (!cardElement) return;
    const parts = collapsibleParts(cardElement);

    if (!animate) {
      cardElement.classList.toggle('audit-collapsed', collapsed);
      parts.forEach(part => {
        part.classList.add('audit-collapsible-part');
        if (collapsed) {
          part.style.maxHeight = '0px';
          part.style.opacity = '0';
          part.style.pointerEvents = 'none';
          part.setAttribute('aria-hidden', 'true');
          part.inert = true;
        } else {
          part.style.maxHeight = 'none';
          part.style.opacity = '1';
          part.style.pointerEvents = '';
          part.removeAttribute('aria-hidden');
          part.inert = false;
        }
      });
      return;
    }

    if (collapsed) {
      parts.forEach(part => {
        part.classList.add('audit-collapsible-part');
        part.inert = false;
        part.removeAttribute('aria-hidden');
        part.style.maxHeight = `${Math.ceil(part.getBoundingClientRect().height || part.scrollHeight)}px`;
        part.style.opacity = '1';
        part.style.pointerEvents = '';
      });
      document.body.offsetHeight;
      requestAnimationFrame(() => {
        cardElement.classList.add('audit-collapsed');
        parts.forEach(part => {
          part.style.maxHeight = '0px';
          part.style.opacity = '0';
          part.style.pointerEvents = 'none';
        });
      });
      window.setTimeout(() => {
        if (!cardElement.classList.contains('audit-collapsed')) return;
        parts.forEach(part => {
          part.setAttribute('aria-hidden', 'true');
          part.inert = true;
        });
      }, 380);
    } else {
      cardElement.classList.remove('audit-collapsed');
      parts.forEach(part => {
        part.classList.add('audit-collapsible-part');
        part.inert = false;
        part.removeAttribute('aria-hidden');
        part.style.maxHeight = '0px';
        part.style.opacity = '0';
        part.style.pointerEvents = 'none';
      });
      document.body.offsetHeight;
      requestAnimationFrame(() => {
        parts.forEach(part => {
          part.style.maxHeight = `${Math.ceil(part.scrollHeight)}px`;
          part.style.opacity = '1';
          part.style.pointerEvents = '';
        });
      });
      window.setTimeout(() => {
        if (cardElement.classList.contains('audit-collapsed')) return;
        parts.forEach(part => { part.style.maxHeight = 'none'; });
      }, 400);
    }
  }

  function syncBars() {
    document.querySelectorAll('.review-card').forEach(cardElement => {
      const key = cardElement.dataset.key;
      const card = cardFor(key);
      if (!card) return;
      const status = statusOf(key);
      const collapsed = Boolean(status) && isCollapsed(key);
      const existing = cardElement.querySelector('.audit-card-bar');
      const markup = barMarkup(card, status, collapsed);

      if (!existing) {
        const position = cardElement.querySelector('.card-position');
        if (position) position.insertAdjacentHTML('afterend', markup);
        else cardElement.insertAdjacentHTML('afterbegin', markup);
      } else if (existing.dataset.auditStatus !== status || existing.dataset.auditCollapsed !== String(collapsed)) {
        existing.outerHTML = markup;
      }

      cardElement.classList.remove('audit-ok', 'audit-fix', 'audit-remove');
      if (status) cardElement.classList.add(`audit-${status}`);
      applyCollapsedState(cardElement, collapsed, false);
    });
  }

  function syncSubdeckCounts() {
    if (typeof currentLesson === 'undefined' || !currentLesson) return;
    const state = readState();

    document.querySelectorAll('.subdeck-section').forEach(section => {
      const deck = section.dataset.subdeck || '';
      const deckCards = cards.filter(card => card.lesson === currentLesson && card.deck === deck);
      const counts = { ok: 0, fix: 0, remove: 0 };
      deckCards.forEach(card => {
        const status = state[card.key]?.status;
        if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;
      });
      const audited = counts.ok + counts.fix + counts.remove;
      const total = deckCards.length;
      const toggle = section.querySelector('.subdeck-toggle');
      if (!toggle) return;

      let badge = toggle.querySelector('.audit-subdeck-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'audit-subdeck-count';
        const chevron = toggle.querySelector('.subdeck-chevron');
        if (chevron) chevron.insertAdjacentElement('beforebegin', badge);
        else toggle.appendChild(badge);
      }

      const text = `${audited}/${total} audited · ${counts.ok} OK · ${counts.fix} change · ${counts.remove} remove`;
      if (badge.textContent !== text) badge.textContent = text;
      badge.title = `${audited} of ${total} cards have a decision`;
    });
  }

  function progress() {
    if (typeof currentLesson === 'undefined' || !currentLesson) return;
    const lessonCards = cards.filter(card => card.lesson === currentLesson);
    const state = readState();
    const counts = { ok: 0, fix: 0, remove: 0 };
    lessonCards.forEach(card => {
      const status = state[card.key]?.status;
      if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;
    });
    const audited = counts.ok + counts.fix + counts.remove;
    const total = lessonCards.length;
    const percent = total ? Math.round((audited / total) * 100) : 0;
    const fill = document.getElementById('auditProgressFill');
    if (fill) fill.style.width = `${percent}%`;
    const copy = document.getElementById('auditProgressCopy');
    if (copy) copy.innerHTML = `
      <span><strong>${audited}/${total}</strong> audited</span>
      <span>${counts.ok} OK</span>
      <span>${counts.fix} need changes</span>
      <span>${counts.remove} to remove</span>
      <span>${total - audited} unreviewed</span>`;
  }

  function applyFilter() {
    const filter = document.getElementById('auditFilter')?.value || 'all';
    document.querySelectorAll('.review-card').forEach(cardElement => {
      const status = statusOf(cardElement.dataset.key);
      const visible = filter === 'all'
        || (filter === 'unreviewed' && !VALID.has(status))
        || status === filter;
      cardElement.classList.toggle('audit-filtered-out', !visible);
    });
    document.querySelectorAll('.subdeck-section').forEach(section => {
      const sectionCards = [...section.querySelectorAll('.review-card')];
      const empty = sectionCards.length && sectionCards.every(card => card.classList.contains('audit-filtered-out'));
      section.classList.toggle('audit-empty-subdeck', Boolean(empty));
    });
    progress();
    syncSubdeckCounts();
  }

  function announce(message) {
    const notice = document.getElementById('auditNotice');
    if (!notice) return;
    notice.textContent = message;
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => { notice.textContent = ''; }, 3000);
  }

  function markOk(key) {
    const card = cardFor(key);
    if (!card) return;
    saveStatus(key, 'ok');
    sendAudit(card, 'audit_ok', 'Reviewed OK');
    enhance();
    announce('Saved: Reviewed OK.');
  }

  function clearStatus(key) {
    const card = cardFor(key);
    if (!card) return;
    const cardElement = document.querySelector(`.review-card[data-key="${key}"]`);
    saveCollapsed(key, false);
    if (cardElement?.classList.contains('audit-collapsed')) applyCollapsedState(cardElement, false, true);
    saveStatus(key, '');
    sendAudit(card, 'audit_reset', 'Audit status cleared');
    window.setTimeout(enhance, 50);
    announce('Audit status cleared.');
  }

  function toggleCollapse(key) {
    const cardElement = document.querySelector(`.review-card[data-key="${key}"]`);
    if (!cardElement || !isAudited(key)) return;
    const collapsed = !isCollapsed(key);
    saveCollapsed(key, collapsed);
    applyCollapsedState(cardElement, collapsed, true);

    const existing = cardElement.querySelector('.audit-card-bar');
    const card = cardFor(key);
    if (existing && card) existing.outerHTML = barMarkup(card, statusOf(key), collapsed);
  }

  function openAuditComment(key, status) {
    const card = cardFor(key);
    if (!card || typeof openReview !== 'function') return;
    openReview('card', { lesson: card.lesson, deck: card.deck, card });
    const form = document.getElementById('reviewForm');
    const title = document.getElementById('reviewTitle');
    const badge = document.getElementById('scopeBadge');
    const comment = document.getElementById('comment');

    document.getElementById('formScope').value = status === 'remove' ? 'audit_remove' : 'audit_fix';
    if (title) title.textContent = status === 'remove' ? 'Why should this card be removed?' : 'What needs changing?';
    if (badge) badge.textContent = status === 'remove' ? 'Remove card' : 'Needs change';
    if (comment) {
      comment.value = '';
      comment.placeholder = status === 'remove'
        ? 'REMOVE — Explain why this card does not add useful learning.'
        : 'For example: FIX FRONT — the target word is not highlighted.';
    }
    form.dataset.auditKey = key;
    form.dataset.auditStatus = status;
  }

  function nextUnreviewed(afterKey = '') {
    const lessonCards = cards.filter(card => card.lesson === currentLesson);
    if (!lessonCards.length) return;

    const currentIndex = afterKey ? lessonCards.findIndex(card => card.key === afterKey) : -1;
    const start = currentIndex >= 0 ? currentIndex + 1 : 0;
    const ordered = lessonCards.slice(start).concat(lessonCards.slice(0, start));
    const target = ordered.find(card => card.key !== afterKey && !isAudited(card.key));

    if (!target) {
      if (afterKey && !isAudited(afterKey)) announce('This is the only unreviewed card left in this lesson.');
      else announce('Every card in this lesson has an audit status.');
      return;
    }

    const reveal = () => {
      const cardElement = document.querySelector(`.review-card[data-key="${target.key}"]`);
      if (!cardElement) return;
      const accordion = cardElement.closest('.subdeck-accordion');
      if (accordion && !accordion.classList.contains('is-open') && typeof setSubdeckOpen === 'function') {
        setSubdeckOpen(accordion, true);
      }
      const filter = document.getElementById('auditFilter');
      if (filter) filter.value = 'all';
      localStorage.setItem(FILTER_KEY, 'all');
      applyFilter();
      if (cardElement.classList.contains('audit-collapsed')) {
        saveCollapsed(target.key, false);
        applyCollapsedState(cardElement, false, true);
      }
      if (cardElement.classList.contains('show-answer') && typeof setCardSide === 'function') setCardSide(cardElement, false);
      window.setTimeout(() => cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
    };

    if (!document.querySelector(`.review-card[data-key="${target.key}"]`)) {
      deckSelect.value = '';
      searchInput.value = '';
      renderLesson();
      window.setTimeout(() => { enhance(); reveal(); }, 200);
    } else reveal();
  }

  function enhance() {
    installAuditRibbon();
    if (typeof cards === 'undefined' || !Array.isArray(cards) || !cards.length) return;
    if (typeof currentLesson === 'undefined' || !currentLesson) return;
    ensurePanel();
    syncBars();
    syncSubdeckCounts();
    applyFilter();
  }

  function scheduleEnhance() {
    window.clearTimeout(timer);
    timer = window.setTimeout(enhance, 90);
  }

  document.addEventListener('click', event => {
    const nextButton = event.target.closest('[data-audit-next]');
    if (nextButton) {
      nextUnreviewed(nextButton.dataset.auditNext || '');
      return;
    }

    const auditButton = event.target.closest('[data-audit-action]');
    if (auditButton) {
      const key = auditButton.closest('.review-card')?.dataset.key;
      const action = auditButton.dataset.auditAction;
      if (!key) return;
      if (action === 'ok') markOk(key);
      else if (action === 'fix' || action === 'remove') openAuditComment(key, action);
      else if (action === 'collapse') toggleCollapse(key);
      else if (action === 'clear') clearStatus(key);
      return;
    }

    if (event.target.closest('[data-comment-scope]')) {
      const form = document.getElementById('reviewForm');
      if (form) {
        delete form.dataset.auditKey;
        delete form.dataset.auditStatus;
      }
      window.setTimeout(() => {
        const title = document.getElementById('reviewTitle');
        if (title) title.textContent = 'Leave a comment';
      }, 0);
    }

    if (event.target.closest('[data-close-modal]')) {
      const form = document.getElementById('reviewForm');
      if (form) {
        delete form.dataset.auditKey;
        delete form.dataset.auditStatus;
      }
    }
  }, true);

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form?.id !== 'reviewForm') return;
    const key = form.dataset.auditKey;
    const status = form.dataset.auditStatus;
    if (!key || !VALID.has(status) || !form.reportValidity()) return;
    saveStatus(key, status);
    window.setTimeout(() => {
      delete form.dataset.auditKey;
      delete form.dataset.auditStatus;
      enhance();
    }, 1300);
  }, true);

  const app = document.getElementById('app');
  if (app) new MutationObserver(scheduleEnhance).observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleEnhance);

  installAuditRibbon();
  const wait = () => {
    if (typeof cards !== 'undefined' && Array.isArray(cards) && cards.length) enhance();
    else window.setTimeout(wait, 100);
  };
  wait();
})();