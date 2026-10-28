(function() {
  const SITE_UPDATED = '28 October 2026';
  const SITE_VERSION = '2026-10-28-lesson5';
  const DATA_FILE = 'data/lesson5-cards-20261028.txt';
  let lesson5Cards = null;

  async function loadCards() {
    if (lesson5Cards) return lesson5Cards;
    const response = await fetch(DATA_FILE, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${DATA_FILE}`);
    const encoded = (await response.text()).trim();
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    lesson5Cards = JSON.parse(await new Response(stream).text());
    return lesson5Cards;
  }

  function patchLessonMeta() {
    if (typeof lessonMeta !== 'function' || lessonMeta.__lesson5Patched) return;
    const previous = lessonMeta;
    const wrapped = function(lesson) {
      if (lesson === 'L5') return {
        number: '5',
        title: 'Plural Practice and Spelling',
        description: 'Consolidation of singular/plural agreement, article choice, family plurals, error correction and spelling with Italian towns.'
      };
      return previous(lesson);
    };
    wrapped.__lesson5Patched = true;
    lessonMeta = wrapped;
  }

  function ensureAuditButton() {
    const controls = document.querySelector('#auditOverviewBanner .audit-controls');
    if (!controls || controls.querySelector('[data-lesson-nav="L5"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.lessonNav = 'L5';
    button.textContent = 'Audit Lesson 5';
    controls.appendChild(button);
  }

  function applyMetadata() {
    document.querySelectorAll('input[name="site_version"]').forEach(input => {
      if (input.value !== SITE_VERSION) input.value = SITE_VERSION;
    });
    const meta = document.querySelector('meta[name="description"]');
    const desiredDescription = `Italian for Beginners - BSE Course flash-card learning and review for Lessons 1–5. Last updated ${SITE_UPDATED}.`;
    if (meta?.getAttribute('content') !== desiredDescription) meta.setAttribute('content', desiredDescription);

    const footer = document.querySelector('.site-footer');
    if (footer) {
      footer.dataset.lesson5Updated = 'true';
      footer.setAttribute('aria-label', `Italian for Beginners - BSE Course. Last updated ${SITE_UPDATED}.`);
    }
    if (!document.getElementById('lesson5FooterMetadataStyle')) {
      const style = document.createElement('style');
      style.id = 'lesson5FooterMetadataStyle';
      style.textContent = `.site-footer[data-lesson5-updated="true"]{font-size:0}.site-footer[data-lesson5-updated="true"]::after{content:"Italian for Beginners - BSE Course · Last updated 28 October 2026";font-size:14px}`;
      document.head.appendChild(style);
    }
    ensureAuditButton();
  }

  function validate(newCards) {
    const errors = [];
    const keys = new Set();
    newCards.forEach(card => {
      if (!card.key || keys.has(card.key)) errors.push(`Duplicate or missing key: ${card.key}`);
      keys.add(card.key);
      if (!card.answer) errors.push(`${card.key}: missing answer`);
      if (!card.prompt) errors.push(`${card.key}: missing prompt`);
      if (card.pron) {
        const guides = (card.pron.match(/pron-guide-line/g) || []).length;
        const ipas = (card.pron.match(/pron-ipa-line/g) || []).length;
        if (guides !== 1 || ipas !== 1) errors.push(`${card.key}: pronunciation parity failure`);
      }
    });
    if (newCards.length !== 82) errors.push(`Expected 82 Lesson 5 cards; found ${newCards.length}`);
    window.__LESSON5_VALIDATION_ERRORS__ = errors;
    if (errors.length) console.error('Lesson 5 validation errors', errors);
    return !errors.length;
  }

  function apply(newCards) {
    if (!Array.isArray(cards) || !cards.length || window.__LESSON5_CARDS_20261028__) return;
    if (!validate(newCards)) return;
    const existingKeys = new Set(cards.map(card => card.key));
    const additions = newCards.filter(card => !existingKeys.has(card.key));
    cards = cards.concat(additions);
    patchLessonMeta();
    applyMetadata();
    window.__LESSON5_CARDS_20261028__ = true;
    updateDeckOptions();
    renderNavigation();
    renderView();
    window.setTimeout(applyMetadata, 120);
  }

  async function initialise() {
    while (!(window.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__ && Array.isArray(cards))) {
      await new Promise(resolve => window.setTimeout(resolve, 80));
    }
    const newCards = await loadCards();
    apply(newCards);
  }

  const metadataObserver = new MutationObserver(() => {
    window.clearTimeout(metadataObserver._timer);
    metadataObserver._timer = window.setTimeout(applyMetadata, 60);
  });
  metadataObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  initialise().catch(error => {
    window.__LESSON5_LOAD_ERROR__ = String(error?.message || error);
    console.error('Lesson 5 could not be loaded', error);
  });
})();
