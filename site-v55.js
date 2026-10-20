(function () {
  const SITE_VERSION = '6.0-review-2';
  const CARD_FILES = [
    'data/cards-v60-01.txt',
    'data/cards-v60-02.txt',
    'data/cards-v60-03.txt',
    'data/v60-fix-06.txt',
    'data/cards-v60-05.txt',
    'data/v60-fix-08.txt',
    'data/cards-v60-07.txt',
    'data/v60-fix-10.txt',
    'data/cards-v60-09.txt',
    'data/cards-v60-10.txt',
    'data/cards-v60-11.txt',
    'data/cards-v60-12.txt',
    'data/v60-fix-15.txt',
    'data/cards-v60-14.txt'
  ];

  function installV6Styles() {
    if (document.getElementById('v60CardStyles')) return;
    const style = document.createElement('style');
    style.id = 'v60CardStyles';
    style.textContent = `
      .literal-note{margin-top:8px;color:var(--muted);font-size:13px}
      .gram{display:inline-block;padding:.05em .25em;border-radius:.28em;font-weight:850;border-bottom:3px solid currentColor}
      .gram.masc{color:#8ec5ff}.gram.fem{color:#f0a3c2}.gram.sing{color:#f3c969}.gram.plur{color:#9edac9}
      .gram.vowel{color:#c2a7f0}.gram.special{color:#f0b27a}.gram.verb{color:#87d7c6}
      .field-heading{font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:14px 0 6px}
      .target-word{padding:.02em .18em;border-radius:.18em;background:var(--accent);color:#243332}
      .clarification-block{margin-top:16px}
    `;
    document.head.appendChild(style);
  }

  async function loadEncodedCards() {
    return (await Promise.all(CARD_FILES.map(async file => {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${file}`);
      return (await response.text()).trim();
    }))).join('');
  }

  async function decodeCards(encoded) {
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function patchLessonMetadata() {
    if (typeof lessonMeta !== 'function' || lessonMeta.__v60) return;
    const previous = lessonMeta;
    const replacement = function (lesson) {
      const meta = {
        L1: { number: '1', title: 'Introductions', description: 'Greetings, names, essere, chiamarsi, tu and formal Lei.' },
        L2: { number: '2', title: 'Alphabet, Sounds and Articles', description: 'Alphabet and spelling, C/CH and G/GH sounds, gender and articles.' },
        L3: { number: '3', title: 'Origins, Nationality and Residence', description: 'Pronouns, verb forms, origins, countries, nationalities and residence.' },
        L4: { number: '4', title: 'Avere, Numbers, Plurals and Family', description: 'Avere, silent H, numbers 0–20, plural forms, articles and family vocabulary.' }
      };
      return meta[lesson] || previous(lesson);
    };
    replacement.__v60 = true;
    lessonMeta = replacement;
  }

  function installDirectGoogleSubmit() {
    const reviewForm = document.getElementById('reviewForm');
    const endpoint = reviewForm?.action;
    const target = reviewForm?.target || 'googleReviewSink';
    if (!endpoint) return;
    submitToGoogleSheet = function (fields) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = endpoint;
      form.target = target;
      form.hidden = true;
      Object.entries({ ...fields, site_version: SITE_VERSION }).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value ?? '');
        form.appendChild(input);
      });
      document.body.appendChild(form);
      HTMLFormElement.prototype.submit.call(form);
      window.setTimeout(() => form.remove(), 1500);
    };
  }

  function installV6Renderer() {
    renderCard = function (card, position, total) {
      const anchor = `card-${slugify(card.key)}`;
      const title = panelTitle(card.panel, card.deck);
      const promptSummary = truncate(stripHtml(card.prompt), 86);
      const pattern = card.pattern || card.rule || '';
      const reference = card.reference || card.source || '';
      const usage = card.usage || '';
      const clarification = card.clarification || '';
      return `<article class="review-card" id="${anchor}" data-key="${escapeHtml(card.key)}" data-lesson="${escapeHtml(card.lesson)}" data-deck="${escapeHtml(card.deck)}">
        <div class="card-sticky-tools"><div class="sticky-card-copy"><span class="sticky-card-index">Card ${position} of ${total}</span><strong>${escapeHtml(title)}</strong><span class="sticky-side-state">Recall side</span></div><div class="sticky-card-actions"><button class="reveal-button sticky-reveal" type="button" aria-expanded="false">Show answer</button><button class="card-comment-button sticky-comment" type="button" data-comment-scope="card">Comment</button></div></div>
        <div class="card-position">Card ${position} of ${total} · ${escapeHtml(promptSummary)}</div>
        <div class="flip-shell"><div class="flip-card-inner">
          <section class="card-side card-face recall-side" aria-hidden="false"><div class="side-label recall-label">Recall side</div><div class="deck-label">${escapeHtml(card.lesson)} · ${escapeHtml(card.deck)}</div><div class="topic-panel">${card.panel || ''}</div><div class="front-body">${card.prompt || ''}</div></section>
          <section class="card-side card-face answer-side" aria-hidden="true"><div class="side-label answer-label-main">Answer side</div><div class="answer-body"><div class="answer-label">Answer</div><div class="italian">${card.answer || ''}</div>${card.pron ? `<div class="phon">${card.pron}</div>` : ''}${card.meaning ? `<div class="section"><div class="label">Natural English</div><div class="natural">${card.meaning}</div></div>` : ''}${card.literal ? `<div class="section"><div class="label">Literal construction</div><div class="literal">${card.literal}</div></div>` : ''}${usage ? `<div class="section"><div class="label">Use / word jobs</div><div class="usage">${usage}</div></div>` : ''}${pattern ? `<div class="section"><div class="label">Rule / forms</div><div class="pattern">${pattern}</div></div>` : ''}${clarification ? `<details class="extra clarification-block"><summary>Clarification</summary><div class="inside">${clarification}</div></details>` : ''}<details class="extra"><summary>Course source</summary><div class="inside">${reference}<p>${escapeHtml(card.key)}</p></div></details></div></section>
        </div></div>
        <div class="card-actions"><button class="reveal-button" type="button" aria-expanded="false">Flip to answer side</button><button class="card-comment-button" type="button" data-comment-scope="card">Comment on this card</button></div>
      </article>`;
    };
  }

  function apply(finalCards) {
    cards = finalCards;
    patchLessonMetadata();
    installV6Styles();
    installDirectGoogleSubmit();
    installV6Renderer();
    const requestedLesson = location.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase() || null;
    currentLesson = requestedLesson && cards.some(card => card.lesson === requestedLesson) ? requestedLesson : (currentLesson && cards.some(card => card.lesson === currentLesson) ? currentLesson : null);
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    document.querySelector('.site-footer')?.replaceChildren(document.createTextNode('Italian for Beginners - BSE Course · Version 6.0 review site'));
    document.querySelector('meta[name="description"]')?.setAttribute('content','Italian for Beginners - BSE Course flash-card review for Lessons 1–4, version 6.0.');
    updateDeckOptions(); renderNavigation(); renderView();
    window.__ITALIAN_V55_READY__ = true;
    window.__ITALIAN_V60_READY__ = true;
  }

  async function initialise() {
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress the version 6 card data.');
    const finalCards = await decodeCards(await loadEncodedCards());
    const waitForApp = () => {
      if (typeof cards !== 'undefined' && Array.isArray(cards) && typeof renderView === 'function' && window.__ITALIAN_V54_READY__) { apply(finalCards); return; }
      window.setTimeout(waitForApp, 60);
    };
    waitForApp();
  }

  initialise().catch(error => console.error('v6.0 site update failed:', error));
})();
