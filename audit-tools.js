(function () {
  const AUDIT_PARAM = 'audit';
  const AUDIT_STORAGE_KEY = 'italianFlashCardAuditStatusesV1';
  const AUDIT_FILTER_KEY = 'italianFlashCardAuditFilterV1';
  const SITE_VERSION = '5.5-audit-1';
  const VALID_STATUSES = new Set(['ok', 'fix', 'remove']);
  const params = new URLSearchParams(window.location.search);

  if (params.get(AUDIT_PARAM) !== '1') return;

  let enhanceTimer = null;

  function readStatuses() {
    try {
      const value = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeStatuses(statuses) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(statuses));
  }

  function getStatus(key) {
    return readStatuses()[key]?.status || '';
  }

  function setStatus(key, status) {
    const statuses = readStatuses();
    if (status && VALID_STATUSES.has(status)) {
      statuses[key] = { status, updated_at: new Date().toISOString() };
    } else {
      delete statuses[key];
    }
    writeStatuses(statuses);
  }

  function currentReviewer() {
    if (typeof getSavedReviewer === 'function') return getSavedReviewer() || 'Anonymous';
    return document.getElementById('reviewer')?.value?.trim() || 'Anonymous';
  }

  function cardData(key) {
    return typeof cards !== 'undefined' ? cards.find(card => card.key === key) : null;
  }

  function plain(value) {
    if (typeof stripHtml === 'function') return stripHtml(value);
    const holder = document.createElement('div');
    holder.innerHTML = value || '';
    return holder.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function cardSummary(card) {
    return `${plain(card?.prompt)} → ${plain(card?.answer)}`;
  }

  function sendAuditRow(card, scope, comment) {
    if (!card || typeof submitToGoogleSheet !== 'function') return;
    submitToGoogleSheet({
      reviewer: currentReviewer(),
      comment,
      scope,
      item_id: `card:${card.key}`,
      lesson: card.lesson || '',
      deck: card.deck || '',
      card_key: card.key || '',
      card_summary: cardSummary(card),
      site_version: SITE_VERSION
    });
  }

  function statusLabel(status) {
    if (status === 'ok') return ['Reviewed OK', 'No change requested'];
    if (status === 'fix') return ['Needs change', 'A correction has been logged'];
    if (status === 'remove') return ['Remove card', 'Marked as not useful'];
    return ['Not reviewed', 'Choose an audit action'];
  }

  function auditBar(card) {
    const status = getStatus(card.key);
    const [title, subtitle] = statusLabel(status);
    return `
      <div class="audit-card-bar" data-audit-key="${card.key}">
        <div class="audit-status-copy">
          <strong>${title}</strong>
          <span>${subtitle}</span>
        </div>
        <div class="audit-actions" role="group" aria-label="Audit this card">
          <button type="button" class="audit-action ok ${status === 'ok' ? 'active' : ''}" data-audit-action="ok">✓ Reviewed OK</button>
          <button type="button" class="audit-action fix ${status === 'fix' ? 'active' : ''}" data-audit-action="fix">⚠ Needs change</button>
          <button type="button" class="audit-action remove ${status === 'remove' ? 'active' : ''}" data-audit-action="remove">✕ Remove</button>
          ${status ? '<button type="button" class="audit-action clear" data-audit-action="clear">Clear</button>' : ''}
        </div>
      </div>`;
  }

  function ensureAuditPanel() {
    if (!currentLesson || document.getElementById('auditPanel')) return;
    const help = document.querySelector('.lesson-review-help');
    const header = document.querySelector('.lesson-header');
    if (!help && !header) return;

    const exitUrl = `${window.location.pathname}${window.location.hash || '#lessons'}`;
    const panel = document.createElement('section');
    panel.id = 'auditPanel';
    panel.className = 'audit-panel';
    panel.innerHTML = `
      <div class="audit-panel-grid">
        <div>
          <p class="eyebrow">Personal audit mode</p>
          <h2>Review every card deliberately</h2>
          <p>Mark each card as <strong>Reviewed OK</strong>, <strong>Needs change</strong> or <strong>Remove</strong>. Status is saved in this browser; every action is also written to the private review spreadsheet using the card’s permanent key.</p>
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

    (help || header).insertAdjacentElement('afterend', panel);
    const filter = document.getElementById('auditFilter');
    filter.value = localStorage.getItem(AUDIT_FILTER_KEY) || 'all';
    filter.addEventListener('change', () => {
      localStorage.setItem(AUDIT_FILTER_KEY, filter.value);
      applyFilter();
    });
    document.getElementById('auditNext')?.addEventListener('click', goToNextUnreviewed);
  }

  function ensureCardBars() {
    document.querySelectorAll('.review-card').forEach(element => {
      const key = element.dataset.key;
      const card = cardData(key);
      if (!card) return;
      const existing = element.querySelector('.audit-card-bar');
      if (existing) existing.remove();
      element.insertAdjacentHTML('beforeend', auditBar(card));
      updateCardVisual(element, getStatus(key));
    });
  }

  function updateCardVisual(element, status) {
    element.classList.remove('audit-ok', 'audit-fix', 'audit-remove');
    if (status) element.classList.add(`audit-${status}`);
  }

  function updateProgress() {
    if (!currentLesson) return;
    const lessonCards = cards.filter(card => card.lesson === currentLesson);
    const statuses = readStatuses();
    const counts = { ok: 0, fix: 0, remove: 0 };
    lessonCards.forEach(card => {
      const status = statuses[card.key]?.status;
      if (counts[status] !== undefined) counts[status] += 1;
    });
    const reviewed = counts.ok + counts.fix + counts.remove;
    const total = lessonCards.length;
    const percent = total ? Math.round((reviewed / total) * 100) : 0;
    const fill = document.getElementById('auditProgressFill');
    if (fill) fill.style.width = `${percent}%`;
    const copy = document.getElementById('auditProgressCopy');
    if (copy) {
      copy.innerHTML = `
        <span><strong>${reviewed}/${total}</strong> reviewed</span>
        <span>${counts.ok} OK</span>
        <span>${counts.fix} need changes</span>
        <span>${counts.remove} to remove</span>
        <span>${total - reviewed} remaining</span>`;
    }
  }

  function applyFilter() {
    const filter = document.getElementById('auditFilter')?.value || 'all';
    document.querySelectorAll('.review-card').forEach(element => {
      const status = getStatus(element.dataset.key);
      const show = filter === 'all'
        || (filter === 'unreviewed' && !status)
        || status === filter;
      element.classList.toggle('audit-filtered-out', !show);
    });

    document.querySelectorAll('.subdeck-section').forEach(section => {
      const cardsInSection = [...section.querySelectorAll('.review-card')];
      section.classList.toggle('audit-empty-subdeck', cardsInSection.length > 0 && cardsInSection.every(card => card.classList.contains('audit-filtered-out')));
    });
    updateProgress();
  }

  function notice(message) {
    const element = document.getElementById('auditNotice');
    if (!element) return;
    element.textContent = message;
    window.clearTimeout(notice.timer);
    notice.timer = window.setTimeout(() => { element.textContent = ''; }, 3000);
  }

  function markOk(key) {
    const card = cardData(key);
    if (!card) return;
    setStatus(key, 'ok');
    sendAuditRow(card, 'audit_ok', 'Reviewed OK');
    enhance();
    notice('Saved: Reviewed OK.');
  }

  function clearStatus(key) {
    const card = cardData(key);
    if (!card) return;
    setStatus(key, '');
    sendAuditRow(card, 'audit_reset', 'Audit status cleared');
    enhance();
    notice('Audit status cleared.');
  }

  function openAuditComment(key, status) {
    const card = cardData(key);
    if (!card || typeof openReview !== 'function') return;
    openReview('card', { lesson: card.lesson, deck: card.deck, card });

    const title = document.getElementById('reviewTitle');
    const badge = document.getElementById('scopeBadge');
    const comment = document.getElementById('comment');
    const form = document.getElementById('reviewForm');
    const scope = status === 'remove' ? 'audit_remove' : 'audit_fix';

    document.getElementById('formScope').value = scope;
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

  function goToNextUnreviewed() {
    const target = cards.find(card => card.lesson === currentLesson && !getStatus(card.key));
    if (!target) {
      notice('Every card in this lesson has an audit status.');
      return;
    }

    const showTarget = () => {
      const element = document.querySelector(`.review-card[data-key="${target.key}"]`);
      if (!element) return;
      const accordion = element.closest('.subdeck-accordion');
      if (accordion && !accordion.classList.contains('is-open') && typeof setSubdeckOpen === 'function') {
        setSubdeckOpen(accordion, true);
      }
      document.getElementById('auditFilter').value = 'all';
      localStorage.setItem(AUDIT_FILTER_KEY, 'all');
      applyFilter();
      if (element.classList.contains('show-answer') && typeof setCardSide === 'function') setCardSide(element, false);
      window.setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160);
    };

    if (!document.querySelector(`.review-card[data-key="${target.key}"]`)) {
      deckSelect.value = '';
      searchInput.value = '';
      renderLesson();
      window.setTimeout(() => { enhance(); showTarget(); }, 180);
    } else {
      showTarget();
    }
  }

  function enhance() {
    if (!window.__ITALIAN_V55_READY__ || !currentLesson) return;
    ensureAuditPanel();
    ensureCardBars();
    applyFilter();
  }

  function scheduleEnhance() {
    window.clearTimeout(enhanceTimer);
    enhanceTimer = window.setTimeout(enhance, 90);
  }

  document.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-audit-action]');
    if (actionButton) {
      const cardElement = actionButton.closest('.review-card');
      const key = cardElement?.dataset.key;
      const action = actionButton.dataset.auditAction;
      if (!key) return;
      if (action === 'ok') markOk(key);
      if (action === 'fix' || action === 'remove') openAuditComment(key, action);
      if (action === 'clear') clearStatus(key);
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

  document.addEventListener('click', event => {
    const submit = event.target.closest('.modal-submit');
    if (!submit) return;
    const form = document.getElementById('reviewForm');
    const key = form?.dataset.auditKey;
    const status = form?.dataset.auditStatus;
    if (!key || !VALID_STATUSES.has(status) || !form.reportValidity()) return;
    setStatus(key, status);
    window.setTimeout(() => {
      delete form.dataset.auditKey;
      delete form.dataset.auditStatus;
      enhance();
    }, 1300);
  }, true);

  const observer = new MutationObserver(scheduleEnhance);
  const app = document.getElementById('app');
  if (app) observer.observe(app, { childList: true, subtree: true });

  const waitForSite = () => {
    if (window.__ITALIAN_V55_READY__ && typeof cards !== 'undefined' && cards.length) {
      enhance();
      return;
    }
    window.setTimeout(waitForSite, 100);
  };
  waitForSite();
})();
