(function () {
  const STORAGE_KEY = 'italianFlashCardSiteModeV1';
  const VALID_MODES = new Set(['learn', 'review']);
  const params = new URLSearchParams(window.location.search);
  const auditMode = params.get('audit') === '1';
  let mode = auditMode
    ? 'review'
    : (VALID_MODES.has(params.get('mode'))
      ? params.get('mode')
      : (VALID_MODES.has(localStorage.getItem(STORAGE_KEY))
        ? localStorage.getItem(STORAGE_KEY)
        : 'learn'));
  let refreshTimer = null;

  function installStyles() {
    if (document.getElementById('siteModeStyles')) return;

    const style = document.createElement('style');
    style.id = 'siteModeStyles';
    style.textContent = `
      .site-mode-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin: 16px 0;
        padding: 14px 16px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: color-mix(in srgb, var(--paper2) 92%, transparent);
        box-shadow: 0 8px 24px rgba(0, 0, 0, .16);
      }

      .site-mode-copy strong,
      .site-mode-copy span {
        display: block;
      }

      .site-mode-copy strong {
        margin-bottom: 3px;
        font-size: 14px;
      }

      .site-mode-copy span {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .site-mode-switch {
        display: inline-grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        min-width: 230px;
        padding: 4px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--paper);
      }

      .site-mode-button {
        min-height: 42px;
        padding: 8px 14px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: var(--muted);
        font: inherit;
        font-weight: 850;
        cursor: pointer;
        transition: background .2s ease, color .2s ease, transform .2s ease;
      }

      .site-mode-button:hover:not(:disabled) {
        color: var(--text);
        transform: translateY(-1px);
      }

      .site-mode-button[aria-pressed="true"] {
        background: var(--green);
        color: #172321;
        box-shadow: 0 5px 14px rgba(0, 0, 0, .2);
      }

      .site-mode-button:disabled {
        cursor: not-allowed;
        opacity: .45;
      }

      .mode-learn .general-comment,
      .mode-learn .lesson-comment-button,
      .mode-learn .subdeck-comment-button,
      .mode-learn .card-comment-button,
      .mode-learn .reviewer-identity,
      .mode-learn .review-course-source {
        display: none !important;
      }

      .mode-learn .review-tracking-note {
        margin-top: 0;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: color-mix(in srgb, var(--paper2) 88%, transparent);
      }

      .mode-learn .site-intro {
        grid-template-columns: 1fr;
      }

      @media (max-width: 760px) {
        .site-mode-panel {
          align-items: stretch;
          flex-direction: column;
        }

        .site-mode-switch {
          width: 100%;
          min-width: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .site-mode-button {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureToggle() {
    let panel = document.getElementById('siteModePanel');
    if (panel) return panel;

    const header = document.querySelector('.site-intro');
    if (!header) return null;

    panel = document.createElement('section');
    panel.id = 'siteModePanel';
    panel.className = 'site-mode-panel';
    panel.setAttribute('aria-label', 'Choose how to use the flash cards');
    panel.innerHTML = `
      <div class="site-mode-copy">
        <strong id="siteModeTitle">Choose a mode</strong>
        <span id="siteModeDescription"></span>
      </div>
      <div class="site-mode-switch" role="group" aria-label="Learn or review mode">
        <button type="button" class="site-mode-button" data-site-mode="learn">Learn</button>
        <button type="button" class="site-mode-button" data-site-mode="review">Review</button>
      </div>`;

    header.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function updateUrl(nextMode) {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', nextMode);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function closeCommentModal() {
    const modal = document.getElementById('reviewModal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function updateHeaderCopy() {
    const header = document.querySelector('.site-intro');
    if (!header) return;

    const eyebrow = header.querySelector('.eyebrow');
    const paragraphs = header.querySelectorAll(':scope > div > p:not(.eyebrow)');

    if (mode === 'learn') {
      if (eyebrow) eyebrow.textContent = 'Flash-card learning';
      if (paragraphs[0]) paragraphs[0].textContent = 'Choose a lesson, say each answer aloud, then reveal it and compare your response.';
      if (paragraphs[1]) paragraphs[1].textContent = 'Use Next card to move through each subdeck. Your viewed-answer progress is stored in this browser.';
    } else {
      if (eyebrow) eyebrow.textContent = 'Flash-card review';
      if (paragraphs[0]) paragraphs[0].textContent = 'Choose a lesson, inspect the Recall and Answer sides, and leave a short comment wherever something needs checking.';
      if (paragraphs[1]) paragraphs[1].textContent = 'Comments are sent privately to the site owner. A name or initials is enough.';
    }
  }

  function updateOverviewCopy() {
    const guide = document.querySelector('.review-guide');
    if (!guide) return;

    const eyebrow = guide.querySelector('.eyebrow');
    const heading = guide.querySelector('h2');
    const paragraphs = guide.querySelectorAll(':scope > p:not(.eyebrow)');

    if (mode === 'learn') {
      if (eyebrow) eyebrow.textContent = 'How to learn';
      if (heading) heading.textContent = 'Choose a lesson and work through one card at a time';
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Say the answer aloud before revealing the <strong>Answer side</strong>. Compare it, then continue with <strong>Next card</strong>.';
      if (paragraphs[1]) paragraphs[1].innerHTML = 'A card counts as viewed after its answer has been revealed. Progress is stored in this browser.';
    } else {
      if (eyebrow) eyebrow.textContent = 'How to review';
      if (heading) heading.textContent = 'Choose one lesson at a time';
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Each flash card opens on its <strong>Recall side</strong>. Select <strong>Flip to answer side</strong> to inspect the answer, pronunciation and teaching notes.';
      if (paragraphs[1]) paragraphs[1].innerHTML = 'Use <strong>Comment on this card</strong> for a specific correction. Use <strong>Comment on Lesson</strong> for broader feedback.';
    }
  }

  function updateLessonHelp() {
    const help = document.querySelector('.lesson-review-help');
    if (!help) return;

    const items = help.querySelectorAll(':scope > div');
    if (mode === 'learn') {
      if (items[0]) items[0].innerHTML = '<strong>Recall side</strong><span>Say your answer before revealing it.</span>';
      if (items[1]) items[1].innerHTML = '<strong>Answer side</strong><span>Compare the answer, pronunciation and explanation.</span>';
      if (items[2]) items[2].innerHTML = '<strong>Progress</strong><span>Reveal an answer before using Next card.</span>';
    } else {
      if (items[0]) items[0].innerHTML = '<strong>Recall side</strong><span>The prompt a learner sees first.</span>';
      if (items[1]) items[1].innerHTML = '<strong>Answer side</strong><span>Flip the card to see the answer, pronunciation and teaching notes.</span>';
      if (items[2]) items[2].innerHTML = '<strong>Comments</strong><span>Use card comments for exact corrections; use the lesson comment for general suggestions.</span>';
    }
  }

  function updateTrackingCopy() {
    const note = document.querySelector('.review-tracking-note');
    if (!note) return;

    note.textContent = mode === 'learn'
      ? 'This site records which lesson pages are opened in a private spreadsheet. It does not identify a visitor unless initials were previously saved in Review mode.'
      : 'This site records the lesson pages opened and comments submitted. It does not try to identify a visitor unless they enter a name or initials.';
  }

  function markCourseSources() {
    document.querySelectorAll('details.extra').forEach(details => {
      const summary = details.querySelector(':scope > summary');
      details.classList.toggle('review-course-source', Boolean(summary && /course source/i.test(summary.textContent)));
    });
  }

  function renderMode() {
    installStyles();
    const panel = ensureToggle();

    document.body.classList.toggle('mode-learn', mode === 'learn');
    document.body.classList.toggle('mode-review', mode === 'review');

    if (panel) {
      const title = panel.querySelector('#siteModeTitle');
      const description = panel.querySelector('#siteModeDescription');
      const learnButton = panel.querySelector('[data-site-mode="learn"]');
      const reviewButton = panel.querySelector('[data-site-mode="review"]');

      if (title) title.textContent = auditMode ? 'Personal audit mode' : (mode === 'learn' ? 'Learn mode' : 'Review mode');
      if (description) {
        description.textContent = auditMode
          ? 'Audit mode uses the Review view and adds private card-audit controls.'
          : (mode === 'learn'
            ? 'Study the cards without comments or reviewer controls.'
            : 'Inspect the cards and send corrections or teaching feedback.');
      }

      if (learnButton) {
        learnButton.setAttribute('aria-pressed', String(mode === 'learn'));
        learnButton.disabled = auditMode;
      }
      if (reviewButton) reviewButton.setAttribute('aria-pressed', String(mode === 'review'));
    }

    if (mode === 'learn') closeCommentModal();
    updateHeaderCopy();
    updateOverviewCopy();
    updateLessonHelp();
    updateTrackingCopy();
    markCourseSources();
  }

  function setMode(nextMode, updateAddress = true) {
    if (!VALID_MODES.has(nextMode)) return;
    if (auditMode && nextMode !== 'review') return;

    mode = nextMode;
    localStorage.setItem(STORAGE_KEY, mode);
    if (updateAddress) updateUrl(mode);
    renderMode();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-site-mode]');
    if (!button) return;
    setMode(button.dataset.siteMode);
  });

  const observer = new MutationObserver(() => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(renderMode, 70);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setMode(mode, false);
})();
