(function () {
  const SITE_VERSION = '6.2.4';
  if (window.__CARD_FLIP_EXPERIENCE_V624__) return;
  window.__CARD_FLIP_EXPERIENCE_V624__ = true;

  function installStyles() {
    if (document.getElementById('cardFlipExperienceV624Styles')) return;
    const style = document.createElement('style');
    style.id = 'cardFlipExperienceV624Styles';
    style.textContent = `
      body.card {
        --flip-answer-bg: #2f7180;
        --flip-answer-bg-hover: #3a8798;
        --flip-answer-border: #67aebb;
        --flip-answer-ink: #f7fcfd;
        --flip-recall-bg: #765a86;
        --flip-recall-bg-hover: #89699a;
        --flip-recall-border: #aa8fba;
        --flip-recall-ink: #fffaff;
      }

      body.card:not(.nightMode):not(.night_mode) {
        --flip-answer-bg: #236274;
        --flip-answer-bg-hover: #2d7488;
        --flip-answer-border: #1c5363;
        --flip-answer-ink: #ffffff;
        --flip-recall-bg: #694d79;
        --flip-recall-bg-hover: #7b5d8c;
        --flip-recall-border: #573d67;
        --flip-recall-ink: #ffffff;
      }

      .review-card:not(.show-answer) .reveal-button {
        background: var(--flip-answer-bg) !important;
        border-color: var(--flip-answer-border) !important;
        color: var(--flip-answer-ink) !important;
        box-shadow: 0 8px 19px color-mix(in srgb, var(--flip-answer-bg) 38%, transparent) !important;
      }

      .review-card:not(.show-answer) .reveal-button:hover,
      .review-card:not(.show-answer) .reveal-button:focus-visible {
        background: var(--flip-answer-bg-hover) !important;
        filter: none !important;
        box-shadow: 0 11px 25px color-mix(in srgb, var(--flip-answer-bg) 48%, transparent) !important;
      }

      .review-card.show-answer .reveal-button {
        background: var(--flip-recall-bg) !important;
        border-color: var(--flip-recall-border) !important;
        color: var(--flip-recall-ink) !important;
        box-shadow: 0 8px 19px color-mix(in srgb, var(--flip-recall-bg) 38%, transparent) !important;
      }

      .review-card.show-answer .reveal-button:hover,
      .review-card.show-answer .reveal-button:focus-visible {
        background: var(--flip-recall-bg-hover) !important;
        filter: none !important;
        box-shadow: 0 11px 25px color-mix(in srgb, var(--flip-recall-bg) 48%, transparent) !important;
      }

      .flip-shell[data-click-flip='true'] {
        cursor: pointer;
        outline: 0 solid transparent;
        transition: height .52s cubic-bezier(.22,.8,.24,1), outline-color .18s ease, box-shadow .18s ease;
      }

      .flip-shell[data-click-flip='true']:hover {
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--line) 72%, transparent);
      }

      .flip-shell[data-click-flip='true']:focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 4px;
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 18%, transparent);
      }

      @media (prefers-reduced-motion: reduce) {
        .flip-shell[data-click-flip='true'] { transition: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function interactiveTarget(target, shell) {
    const interactive = target.closest?.('button, a, input, select, textarea, label, summary, details, [contenteditable="true"], [role="button"]');
    return Boolean(interactive && interactive !== shell);
  }

  function visibleRevealButton(card) {
    return card?.querySelector('.card-actions .reveal-button') || card?.querySelector('.reveal-button');
  }

  function flipCardFromSurface(shell) {
    const card = shell?.closest('.review-card');
    if (!card || card.classList.contains('study-collapsed') || card.classList.contains('audit-collapsed')) return;
    visibleRevealButton(card)?.click();
  }

  function updateShell(shell) {
    if (!shell) return;
    const card = shell.closest('.review-card');
    if (!card) return;
    const showingAnswer = card.classList.contains('show-answer');
    shell.dataset.clickFlip = 'true';
    shell.tabIndex = 0;
    shell.setAttribute('aria-label', showingAnswer ? 'Show the recall side' : 'Show the answer side');
    shell.setAttribute('title', showingAnswer ? 'Click to show the recall side' : 'Click to show the answer side');
  }

  function decorateCards(root = document) {
    root.querySelectorAll?.('.flip-shell').forEach(updateShell);
  }

  function applyVersion() {
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    document.querySelector('.site-footer')?.replaceChildren(document.createTextNode(`Italian for Beginners - BSE Course · Version ${SITE_VERSION}`));
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Italian for Beginners - BSE Course flash-card learning and review for Lessons 1–4, version ${SITE_VERSION}.`);

    if (typeof submitToGoogleSheet === 'function' && !submitToGoogleSheet.__v624Wrapped) {
      const previous = submitToGoogleSheet;
      const wrapped = fields => previous({ ...fields, site_version: SITE_VERSION });
      wrapped.__v624Wrapped = true;
      submitToGoogleSheet = wrapped;
    }
  }

  document.addEventListener('click', event => {
    const shell = event.target.closest?.('.flip-shell[data-click-flip="true"]');
    if (!shell || interactiveTarget(event.target, shell)) return;
    if (window.getSelection?.().toString().trim()) return;
    flipCardFromSurface(shell);
  });

  document.addEventListener('keydown', event => {
    const shell = event.target.closest?.('.flip-shell[data-click-flip="true"]');
    if (!shell || event.target !== shell || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    flipCardFromSurface(shell);
  });

  installStyles();
  applyVersion();
  decorateCards();

  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(mutations => {
      let shouldDecorate = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) shouldDecorate = true;
        if (mutation.type === 'attributes' && mutation.target.classList?.contains('review-card')) {
          updateShell(mutation.target.querySelector('.flip-shell'));
        }
      });
      if (shouldDecorate) decorateCards(app);
      applyVersion();
    }).observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
})();
