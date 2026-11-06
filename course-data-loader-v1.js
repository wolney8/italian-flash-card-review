(function () {
  const SITE_VERSION = '2026-11-01-course-shell-v1';
  const DATA_VERSION = '20261101a';
  const EXPECTED_CORE_CARDS = 389;
  const EXPECTED_LESSON5_CARDS = 56;
  const EXPECTED_TOTAL_CARDS = 445;

  const CORE_FILES = [
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

  const LESSON5_FILES = [
    'data/lesson5-consolidation-01.txt',
    'data/lesson5-consolidation-02.txt',
    'data/lesson5-consolidation-03.txt',
    'data/lesson5-consolidation-04.txt'
  ];

  function versioned(file) {
    return `${file}?v=${DATA_VERSION}`;
  }

  async function loadEncodedGroup(files) {
    const chunks = await Promise.all(files.map(async file => {
      const response = await fetch(versioned(file), { cache: 'default' });
      if (!response.ok) throw new Error(`Could not load ${file} (${response.status}).`);
      return (await response.text()).trim();
    }));
    return chunks.join('');
  }

  async function decodeCards(encoded, label) {
    if (!encoded || encoded.length % 4 !== 0) {
      throw new Error(`${label} data is incomplete or not valid Base64.`);
    }
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const decoded = JSON.parse(await new Response(stream).text());
    if (!Array.isArray(decoded)) throw new Error(`${label} data did not decode to a card list.`);
    return decoded;
  }

  function validateCards(coreCards, lesson5Cards) {
    if (coreCards.length !== EXPECTED_CORE_CARDS) {
      throw new Error(`Expected ${EXPECTED_CORE_CARDS} cards in Lessons 1–4, received ${coreCards.length}.`);
    }
    if (lesson5Cards.length !== EXPECTED_LESSON5_CARDS) {
      throw new Error(`Expected ${EXPECTED_LESSON5_CARDS} cards in Lesson 5, received ${lesson5Cards.length}.`);
    }
    if (lesson5Cards.some(card => card.lesson !== 'L5')) {
      throw new Error('Lesson 5 data contains a card assigned to another lesson.');
    }

    const finalCards = coreCards.filter(card => card.lesson !== 'L5').concat(lesson5Cards);
    const keys = new Set(finalCards.map(card => card.key));
    if (finalCards.length !== EXPECTED_TOTAL_CARDS || keys.size !== EXPECTED_TOTAL_CARDS) {
      throw new Error(`Expected ${EXPECTED_TOTAL_CARDS} unique course cards, received ${finalCards.length} cards and ${keys.size} unique keys.`);
    }
    const lesson6Cards=window.ITALIAN_L6?.cards;
    if(!Array.isArray(lesson6Cards)||!lesson6Cards.length)throw new Error('Lesson 6 data did not load.');
    if(lesson6Cards.some(c=>c.lesson!=='L6'))throw new Error('Invalid Lesson 6 assignment.');
    const expanded=finalCards.concat(lesson6Cards);
    if(new Set(expanded.map(c=>c.key)).size!==expanded.length)throw new Error('Duplicate card keys in Lesson 6.');
    return expanded;
  }

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

  function patchLessonMetadata() {
    if (typeof lessonMeta !== 'function' || lessonMeta.__courseShellV1) return;
    const previous = lessonMeta;
    const replacement = function (lesson) {
      const meta = {
        L1: { number: '1', title: 'Introductions', description: 'Greetings, names, essere, chiamarsi, tu and formal Lei.' },
        L2: { number: '2', title: 'Alphabet, Sounds and Articles', description: 'Alphabet and spelling, C/CH and G/GH sounds, gender and articles.' },
        L3: { number: '3', title: 'Origins, Nationality and Residence', description: 'Pronouns, verb forms, origins, countries, nationalities and residence.' },
        L4: { number: '4', title: 'Avere, Numbers, Plurals and Family', description: 'Avere, silent H, numbers 0–20, plural forms, articles and family vocabulary.' },
        L5: { number: '5', title: 'Consolidation Review', description: 'A mixed review of greetings, names, origins, avere, plurals, articles, family, C/G sounds and spelling.' }
      };
      if(lesson==='L6')return {number:'6',title:'Numbers, Essere and Questions',description:'Number-building patterns, negatives, intonation and useful questions.'};
      return meta[lesson] || previous(lesson);
    };
    replacement.__courseShellV1 = true;
    replacement.__v60 = true;
    lessonMeta = replacement;
  }

  function installDirectGoogleSubmit() {
    const formElement = document.getElementById('reviewForm');
    const endpoint = formElement?.action;
    const target = formElement?.target || 'googleReviewSink';
    if (!endpoint) return;

    submitToGoogleSheet = function (fields) {
      const post = document.createElement('form');
      post.method = 'POST';
      post.action = endpoint;
      post.target = target;
      post.hidden = true;
      Object.entries({ ...fields, site_version: SITE_VERSION }).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value ?? '');
        post.appendChild(input);
      });
      document.body.appendChild(post);
      HTMLFormElement.prototype.submit.call(post);
      window.setTimeout(() => post.remove(), 1500);
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

  function showFailure(error) {
    console.error('Course card loading failed:', error);
    document.documentElement.classList.remove('course-data-pending');
    document.documentElement.dataset.courseDataStatus = 'error';
    const status = document.getElementById('courseDataStatus');
    if (status) {
      status.hidden = false;
      status.className = 'course-data-status is-error';
      status.innerHTML = `<strong>The lessons could not be loaded.</strong><br>${escapeHtml(error.message)}<br>Please hard-refresh the page.`;
    }
  }

  function apply(finalCards) {
    cards = finalCards;
    patchLessonMetadata();
    installV6Styles();
    installDirectGoogleSubmit();
    installV6Renderer();

    const requestedLesson = location.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase() || null;
    currentLesson = requestedLesson && cards.some(card => card.lesson === requestedLesson)
      ? requestedLesson
      : (currentLesson && cards.some(card => card.lesson === currentLesson) ? currentLesson : null);

    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    updateDeckOptions();
    renderNavigation();
    renderView();

    window.__ITALIAN_V55_READY__ = true;
    window.__ITALIAN_V60_READY__ = true;
    window.__LESSON5_CONSOLIDATION_REVIEW__ = true;
    window.__COURSE_DATA_READY__ = true;
    window.__COURSE_DATA_REPORT__ = {
      cards: finalCards.length,
      lessons: new Set(finalCards.map(card => card.lesson)).size,
      subdecks: new Set(finalCards.map(card => `${card.lesson}::${card.deck}`)).size
    };

    document.documentElement.dataset.courseDataStatus = 'ok';
    document.documentElement.classList.remove('course-data-pending');
    document.getElementById('courseDataStatus')?.setAttribute('hidden', '');
    window.dispatchEvent(new CustomEvent('italian-course-data-ready', { detail: window.__COURSE_DATA_REPORT__ }));
  }

  async function initialise() {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser cannot decompress the course card data.');
    }

    const [coreEncoded, lesson5Encoded] = await Promise.all([
      loadEncodedGroup(CORE_FILES),
      loadEncodedGroup(LESSON5_FILES)
    ]);
    const [coreCards, lesson5Cards] = await Promise.all([
      decodeCards(coreEncoded, 'Lessons 1–4'),
      decodeCards(lesson5Encoded, 'Lesson 5')
    ]);
    const finalCards = validateCards(coreCards, lesson5Cards);

    const waitForApp = () => {
      const appReady = typeof cards !== 'undefined' && Array.isArray(cards) && typeof renderView === 'function';
      const legacyLoadSettled = Boolean(window.__ITALIAN_V54_READY__);
      if (appReady && legacyLoadSettled) {
        apply(finalCards);
        return;
      }
      window.setTimeout(waitForApp, 40);
    };
    waitForApp();
  }

  initialise().catch(showFailure);
})();
