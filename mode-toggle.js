(function () {
  const STORAGE_KEY = 'italianFlashCardSiteModeV1';
  const LEARNING_PROGRESS_KEYS = [
    'italianFlashCardAnswersViewedV1',
    'italianFlashCardStudyCollapsedV1'
  ];
  const VALID = new Set(['learn', 'review']);
  const params = new URLSearchParams(window.location.search);
  const auditMode = params.get('audit') === '1';
  const requestedMode = params.get('mode');
  const savedMode = localStorage.getItem(STORAGE_KEY);
  let mode = auditMode
    ? 'review'
    : (VALID.has(requestedMode) ? requestedMode : (VALID.has(savedMode) ? savedMode : 'learn'));
  let timer = null;

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function setHtml(element, value) {
    if (element && element.innerHTML !== value) element.innerHTML = value;
  }

  function installStyles() {
    if (document.getElementById('siteModeStyles')) return;
    const style = document.createElement('style');
    style.id = 'siteModeStyles';
    style.textContent = `
      .site-mode-panel{display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;max-width:1040px;margin:16px auto;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--paper2) 92%,transparent);box-shadow:0 8px 24px rgba(0,0,0,.16)}
      .site-mode-copy{min-width:0;text-align:left}.site-mode-copy strong,.site-mode-copy span{display:block}.site-mode-copy strong{margin-bottom:3px;font-size:14px}.site-mode-copy span{color:var(--muted);font-size:13px;line-height:1.45}
      .site-mode-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      .site-mode-switch{display:inline-grid;grid-template-columns:1fr 1fr;gap:4px;min-width:230px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--paper)}
      .site-mode-button,.site-mode-reset{min-height:42px;padding:8px 14px;border-radius:9px;font:inherit;font-weight:850;cursor:pointer;transition:background .2s ease,color .2s ease,transform .2s ease}
      .site-mode-button{border:0;background:transparent;color:var(--muted)}
      .site-mode-button:hover:not(:disabled),.site-mode-reset:hover{color:var(--text);transform:translateY(-1px)}
      .site-mode-button[aria-pressed="true"]{background:var(--green);color:#172321;box-shadow:0 5px 14px rgba(0,0,0,.2)}
      .site-mode-button:disabled{cursor:not-allowed;opacity:.45}
      .site-mode-reset{border:1px solid var(--line);background:var(--paper);color:var(--muted);white-space:nowrap}
      .mode-review .site-mode-reset{display:none!important}
      .mode-learn .general-comment,.mode-learn .lesson-comment-button,.mode-learn .subdeck-comment-button,.mode-learn .card-comment-button,.mode-learn .reviewer-identity,.mode-learn .review-course-source{display:none!important}
      .mode-learn .review-tracking-note{margin-top:0;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--paper2) 88%,transparent)}
      .mode-learn .site-intro{grid-template-columns:1fr}
      @media(max-width:760px){.site-mode-panel{align-items:stretch;flex-direction:column}.site-mode-actions,.site-mode-switch,.site-mode-reset{width:100%}.site-mode-actions{justify-content:stretch}.site-mode-switch{min-width:0}}
      @media(prefers-reduced-motion:reduce){.site-mode-button,.site-mode-reset{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
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
      <div class="site-mode-actions">
        <div class="site-mode-switch" role="group" aria-label="Learn or review mode">
          <button type="button" class="site-mode-button" data-site-mode="learn">Learn</button>
          <button type="button" class="site-mode-button" data-site-mode="review">Review</button>
        </div>
        <button type="button" class="site-mode-reset" data-reset-learning>Reset learning progress</button>
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

  function resetLearningProgress() {
    const confirmed = window.confirm(
      'Reset all learning progress for Lessons 1–4 in this browser?\n\nThis clears viewed-answer and collapsed-card progress. Comments and audit decisions are not affected.'
    );
    if (!confirmed) return;

    LEARNING_PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  }

  function updateHeader() {
    const header = document.querySelector('.site-intro');
    if (!header) return;
    const eyebrow = header.querySelector('.eyebrow');
    const paragraphs = header.querySelectorAll(':scope > div > p:not(.eyebrow)');

    if (mode === 'learn') {
      setText(eyebrow, 'Flash-card learning');
      setText(paragraphs[0], 'Choose a lesson, say each answer aloud, then reveal it and compare your response.');
      setText(paragraphs[1], 'Use Next card to move through each subdeck. Your viewed-answer progress is stored in this browser.');
    } else {
      setText(eyebrow, 'Flash-card review');
      setText(paragraphs[0], 'Choose a lesson, inspect the Recall and Answer sides, and leave a short comment wherever something needs checking.');
      setText(paragraphs[1], 'Comments are sent privately to the site owner. A name or initials is enough.');
    }
  }

  function updateOverview() {
    const guide = document.querySelector('.review-guide');
    if (!guide) return;
    const eyebrow = guide.querySelector('.eyebrow');
    const heading = guide.querySelector('h2');
    const paragraphs = guide.querySelectorAll(':scope > p:not(.eyebrow)');

    if (mode === 'learn') {
      setText(eyebrow, 'How to learn');
      setText(heading, 'Choose a lesson and work through one card at a time');
      setHtml(paragraphs[0], 'Say the answer aloud before revealing the <strong>Answer side</strong>. Compare it, then continue with <strong>Next card</strong>.');
      setHtml(paragraphs[1], 'A card counts as viewed after its answer has been revealed. Progress is stored in this browser.');
    } else {
      setText(eyebrow, 'How to review');
      setText(heading, 'Choose one lesson at a time');
      setHtml(paragraphs[0], 'Each flash card opens on its <strong>Recall side</strong>. Select <strong>Flip to answer side</strong> to inspect the answer, pronunciation and teaching notes.');
      setHtml(paragraphs[1], 'Use <strong>Comment on this card</strong> for a specific correction. Use <strong>Comment on Lesson</strong> for broader feedback.');
    }
  }

  function updateLessonHelp() {
    const items = document.querySelectorAll('.lesson-review-help > div');
    if (!items.length) return;

    if (mode === 'learn') {
      setHtml(items[0], '<strong>Recall side</strong><span>Say your answer before revealing it.</span>');
      setHtml(items[1], '<strong>Answer side</strong><span>Compare the answer, pronunciation and explanation.</span>');
      setHtml(items[2], '<strong>Progress</strong><span>Reveal an answer before using Next card.</span>');
    } else {
      setHtml(items[0], '<strong>Recall side</strong><span>The prompt a learner sees first.</span>');
      setHtml(items[1], '<strong>Answer side</strong><span>Flip the card to see the answer, pronunciation and teaching notes.</span>');
      setHtml(items[2], '<strong>Comments</strong><span>Use card comments for exact corrections; use the lesson comment for general suggestions.</span>');
    }
  }

  function updateTrackingNote() {
    const note = document.querySelector('.review-tracking-note');
    if (!note) return;
    setText(note, mode === 'learn'
      ? 'This site records which lesson pages are opened in a private spreadsheet. It does not identify a visitor unless initials were previously saved in Review mode.'
      : 'This site records the lesson pages opened and comments submitted. It does not try to identify a visitor unless they enter a name or initials.');
  }

  function markCourseSources() {
    document.querySelectorAll('details.extra').forEach(details => {
      const summary = details.querySelector(':scope > summary');
      details.classList.toggle('review-course-source', Boolean(summary && /course source/i.test(summary.textContent)));
    });
  }

  function render() {
    installStyles();
    const panel = ensurePanel();
    document.body.classList.toggle('mode-learn', mode === 'learn');
    document.body.classList.toggle('mode-review', mode === 'review');

    if (panel) {
      setText(panel.querySelector('#siteModeTitle'), auditMode ? 'Personal audit mode' : (mode === 'learn' ? 'Learn mode' : 'Review mode'));
      setText(panel.querySelector('#siteModeDescription'), auditMode
        ? 'Audit mode uses the Review view and adds private card-audit controls.'
        : (mode === 'learn'
          ? 'Study the cards without comments or reviewer controls.'
          : 'Inspect the cards and send corrections or teaching feedback.'));

      const learnButton = panel.querySelector('[data-site-mode="learn"]');
      const reviewButton = panel.querySelector('[data-site-mode="review"]');
      const resetButton = panel.querySelector('[data-reset-learning]');
      if (learnButton) {
        learnButton.setAttribute('aria-pressed', String(mode === 'learn'));
        learnButton.disabled = auditMode;
      }
      if (reviewButton) reviewButton.setAttribute('aria-pressed', String(mode === 'review'));
      if (resetButton) resetButton.hidden = auditMode || mode !== 'learn';
    }

    if (mode === 'learn') closeCommentModal();
    updateHeader();
    updateOverview();
    updateLessonHelp();
    updateTrackingNote();
    markCourseSources();
  }

  function setMode(nextMode, updateAddress = true) {
    if (!VALID.has(nextMode) || (auditMode && nextMode !== 'review')) return;
    mode = nextMode;
    localStorage.setItem(STORAGE_KEY, mode);
    if (updateAddress) updateUrl(mode);
    render();
  }

  document.addEventListener('click', event => {
    const resetButton = event.target.closest('[data-reset-learning]');
    if (resetButton) {
      resetLearningProgress();
      return;
    }

    const modeButton = event.target.closest('[data-site-mode]');
    if (modeButton) setMode(modeButton.dataset.siteMode);
  });

  new MutationObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 70);
  }).observe(document.body, { childList: true, subtree: true });

  setMode(mode, false);
})();