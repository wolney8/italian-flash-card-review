let cards = [];
let currentLesson = null;

const app = document.getElementById('app');
const lessonNav = document.getElementById('lessonNav');
const lessonToolbar = document.getElementById('lessonToolbar');
const deckSelect = document.getElementById('deck');
const searchInput = document.getElementById('search');
const count = document.getElementById('count');
const expandAllButton = document.getElementById('expandAll');
const modal = document.getElementById('reviewModal');
const reviewForm = document.getElementById('reviewForm');
const reviewContext = document.getElementById('reviewContext');
const scopeBadge = document.getElementById('scopeBadge');
const formStatus = document.getElementById('formStatus');

const COMMENT_FORM_NAME = 'card-review';
const COMMENT_POST_PATH = '/forms.html';

const LESSON_META = {
  L1: {
    number: '1',
    title: 'Introductions',
    description: 'Greetings, names, essere, chiamarsi, tu and formal Lei.'
  },
  L2: {
    number: '2',
    title: 'Alphabet, Sounds and Articles',
    description: 'Alphabet and spelling, pronunciation patterns, gender and articles.'
  },
  L3: {
    number: '3',
    title: 'Origins, Nationality and Residence',
    description: 'Pronouns, origins, countries, nationalities and where people live.'
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function stripHtml(value) {
  const element = document.createElement('div');
  element.innerHTML = value || '';
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function truncate(value, maxLength = 76) {
  const text = String(value || '').trim();
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trim()}…`;
}

function panelTitle(panelHtml, fallback) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = panelHtml || '';
  return wrapper.querySelector('.panel-title')?.textContent?.trim() || fallback;
}

function naturalLessonSort(a, b) {
  return Number(String(a).replace(/\D/g, '')) - Number(String(b).replace(/\D/g, ''));
}

function lessonMeta(lesson) {
  if (LESSON_META[lesson]) return LESSON_META[lesson];
  const number = String(lesson).replace(/\D/g, '') || lesson;
  return {
    number,
    title: `Lesson ${number}`,
    description: 'Italian for Beginners revision cards.'
  };
}

function lessonFromHash() {
  const match = location.hash.match(/^#lesson-(L\d+)$/i);
  return match ? match[1].toUpperCase() : null;
}

function setLesson(lesson, updateHash = true) {
  currentLesson = lesson;
  deckSelect.value = '';
  searchInput.value = '';
  updateDeckOptions();
  renderNavigation();
  renderView();

  if (updateHash) {
    const targetHash = lesson ? `#lesson-${lesson}` : '#lessons';
    if (location.hash !== targetHash) history.pushState(null, '', targetHash);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadCards() {
  try {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser is too old to open the review data.');
    }

    const files = Array.from(
      { length: 9 },
      (_, index) => `data/cards-${String(index + 1).padStart(2, '0')}.txt`
    );

    const encoded = (await Promise.all(files.map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error('Could not load the card data.');
      return (await response.text()).trim();
    }))).join('');

    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    cards = JSON.parse(await new Response(stream).text());

    const requestedLesson = lessonFromHash();
    currentLesson = cards.some(card => card.lesson === requestedLesson) ? requestedLesson : null;

    updateDeckOptions();
    renderNavigation();
    renderView();
  } catch (error) {
    app.innerHTML = `<div class="loading"><strong>The cards could not be loaded.</strong><br>${escapeHtml(error.message)}</div>`;
  }
}

function renderNavigation() {
  const lessons = [...new Set(cards.map(card => card.lesson))].sort(naturalLessonSort);
  lessonNav.innerHTML = [
    `<button type="button" class="lesson-nav-button ${currentLesson ? '' : 'active'}" data-lesson-nav="">All lessons</button>`,
    ...lessons.map(lesson => {
      const meta = lessonMeta(lesson);
      return `<button type="button" class="lesson-nav-button ${currentLesson === lesson ? 'active' : ''}" data-lesson-nav="${escapeHtml(lesson)}">Lesson ${escapeHtml(meta.number)}</button>`;
    })
  ].join('');
}

function updateDeckOptions() {
  const previous = deckSelect.value;
  const decks = [...new Set(
    cards
      .filter(card => !currentLesson || card.lesson === currentLesson)
      .map(card => card.deck)
  )];

  deckSelect.innerHTML = '<option value="">All subdecks</option>' + decks
    .map(deck => `<option value="${escapeHtml(deck)}">${escapeHtml(deck)}</option>`)
    .join('');

  if (decks.includes(previous)) deckSelect.value = previous;
}

function renderView() {
  if (!currentLesson) {
    lessonToolbar.hidden = true;
    renderLessonIndex();
    return;
  }

  lessonToolbar.hidden = false;
  renderLesson();
}

function renderLessonIndex() {
  const lessons = [...new Set(cards.map(card => card.lesson))].sort(naturalLessonSort);
  const totalSubdecks = new Set(cards.map(card => `${card.lesson}::${card.deck}`)).size;

  app.innerHTML = `
    <section class="review-guide">
      <p class="eyebrow">How to review</p>
      <h2>Choose one lesson at a time</h2>
      <p>Each flash card opens on its <strong>Recall side</strong>: the question the learner sees in Anki. Select <strong>Flip to answer side</strong> to inspect the answer, pronunciation and teaching notes.</p>
      <p>Use <strong>Comment on this card</strong> for a specific correction. Use the main <strong>Comment on Lesson</strong> button inside a lesson for broader feedback.</p>
      <div class="review-stats"><span>${cards.length} cards</span><span>${totalSubdecks} subdecks</span><span>${lessons.length} lessons</span></div>
    </section>
    <section class="lesson-grid" aria-label="Course lessons">
      ${lessons.map(lesson => {
        const meta = lessonMeta(lesson);
        const lessonCards = cards.filter(card => card.lesson === lesson);
        const subdeckCount = new Set(lessonCards.map(card => card.deck)).size;
        return `<article class="lesson-tile">
          <div class="lesson-number">${escapeHtml(meta.number)}</div>
          <div>
            <p class="eyebrow">Lesson ${escapeHtml(meta.number)}</p>
            <h2>${escapeHtml(meta.title)}</h2>
            <p>${escapeHtml(meta.description)}</p>
            <p class="lesson-count">${lessonCards.length} cards · ${subdeckCount} subdecks</p>
            <button type="button" class="open-lesson-button" data-lesson-nav="${escapeHtml(lesson)}">Open Lesson ${escapeHtml(meta.number)}</button>
          </div>
        </article>`;
      }).join('')}
    </section>`;
}

function renderLesson() {
  const meta = lessonMeta(currentLesson);
  const query = searchInput.value.toLowerCase().trim();
  const selectedDeck = deckSelect.value;
  const lessonCards = cards.filter(card => card.lesson === currentLesson);
  const filteredCards = lessonCards.filter(card =>
    (!selectedDeck || card.deck === selectedDeck) &&
    (!query || JSON.stringify(card).toLowerCase().includes(query))
  );

  count.textContent = `${filteredCards.length} of ${lessonCards.length} cards`;

  const grouped = new Map();
  filteredCards.forEach(card => {
    if (!grouped.has(card.deck)) grouped.set(card.deck, []);
    grouped.get(card.deck).push(card);
  });

  const forceOpen = Boolean(query || selectedDeck);

  app.innerHTML = `
    <section class="lesson-header">
      <div>
        <button type="button" class="back-to-lessons" data-lesson-nav="">← All lessons</button>
        <p class="eyebrow">Lesson ${escapeHtml(meta.number)}</p>
        <h2>${escapeHtml(meta.title)}</h2>
        <p>${escapeHtml(meta.description)}</p>
      </div>
      <button type="button" class="lesson-comment-button" data-comment-scope="lesson" data-lesson="${escapeHtml(currentLesson)}">Comment on Lesson ${escapeHtml(meta.number)}</button>
    </section>

    <section class="lesson-review-help">
      <div><strong>Recall side</strong><span>The prompt a learner sees first.</span></div>
      <div><strong>Answer side</strong><span>Flip the card to see the answer, pronunciation and teaching notes.</span></div>
      <div><strong>Comments</strong><span>Use card comments for exact corrections; use the lesson comment for general suggestions.</span></div>
    </section>

    ${filteredCards.length ? [...grouped.entries()]
      .map(([deck, deckCards], groupIndex) => renderSubdeck(deck, deckCards, forceOpen || groupIndex === 0))
      .join('') : `
      <div class="empty-state">No cards match these filters.</div>
    `}`;

  scheduleVisibleFlipHeights();
}

function renderSubdeck(deck, deckCards, open) {
  const meta = lessonMeta(currentLesson);
  const accordionId = `subdeck-${slugify(`${currentLesson}-${deck}`)}`;

  return `<section class="subdeck-section" data-subdeck="${escapeHtml(deck)}">
    <div class="subdeck-heading">
      <div>
        <p class="eyebrow">Lesson ${escapeHtml(meta.number)} subdeck</p>
        <h3>${escapeHtml(deck)}</h3>
        <p>${deckCards.length} card${deckCards.length === 1 ? '' : 's'}</p>
      </div>
      <button type="button" class="subdeck-comment-button" data-comment-scope="deck" data-lesson="${escapeHtml(currentLesson)}" data-deck="${escapeHtml(deck)}">Comment on subdeck</button>
    </div>

    <div class="subdeck-accordion ${open ? 'is-open' : ''}">
      <button
        type="button"
        class="subdeck-toggle"
        aria-expanded="${String(open)}"
        aria-controls="${accordionId}"
        data-card-count="${deckCards.length}"
      >
        <span class="subdeck-toggle-text">${open ? 'Cards shown' : `Open ${deckCards.length} card${deckCards.length === 1 ? '' : 's'}`}</span>
        <span class="subdeck-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="subdeck-collapse" id="${accordionId}">
        <div class="subdeck-collapse-inner">
          <div class="card-list">
            ${deckCards.map((card, index) => renderCard(card, index + 1, deckCards.length)).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderCard(card, position, total) {
  const anchor = `card-${slugify(card.key)}`;
  const title = panelTitle(card.panel, card.deck);
  const promptSummary = truncate(stripHtml(card.prompt), 86);

  return `<article class="review-card" id="${anchor}" data-key="${escapeHtml(card.key)}" data-lesson="${escapeHtml(card.lesson)}" data-deck="${escapeHtml(card.deck)}">
    <div class="card-sticky-tools">
      <div class="sticky-card-copy">
        <span class="sticky-card-index">Card ${position} of ${total}</span>
        <strong>${escapeHtml(title)}</strong>
        <span class="sticky-side-state">Recall side</span>
      </div>
      <div class="sticky-card-actions">
        <button class="reveal-button sticky-reveal" type="button" aria-expanded="false">Show answer</button>
        <button class="card-comment-button sticky-comment" type="button" data-comment-scope="card">Comment</button>
      </div>
    </div>

    <div class="card-position">Card ${position} of ${total} · ${escapeHtml(promptSummary)}</div>

    <div class="flip-shell">
      <div class="flip-card-inner">
        <section class="card-side card-face recall-side" aria-hidden="false">
          <div class="side-label recall-label">Recall side</div>
          <div class="deck-label">${escapeHtml(card.lesson)} · ${escapeHtml(card.deck)}</div>
          <div class="topic-panel">${card.panel}</div>
          <div class="front-body">${card.prompt}</div>
        </section>

        <section class="card-side card-face answer-side" aria-hidden="true">
          <div class="side-label answer-label-main">Answer side</div>
          <div class="answer-body">
            <div class="answer-label">Answer</div>
            <div class="italian">${card.answer}</div>
            <div class="phon">${card.pron}</div>
            <div class="section"><div class="label">Meaning</div>${card.meaning}</div>
            ${card.literal ? `<div class="section"><div class="label">Literal</div>${card.literal}</div>` : ''}
            <div class="section"><div class="label">Rule / forms</div>${card.rule}</div>
            <details class="extra"><summary>Source</summary><div class="inside">${card.source}<p>${escapeHtml(card.key)}</p></div></details>
          </div>
        </section>
      </div>
    </div>

    <div class="card-actions">
      <button class="reveal-button" type="button" aria-expanded="false">Flip to answer side</button>
      <button class="card-comment-button" type="button" data-comment-scope="card">Comment on this card</button>
    </div>
  </article>`;
}

function setFlipHeight(reviewCard, showAnswer, immediate = false) {
  const shell = reviewCard?.querySelector('.flip-shell');
  const targetFace = reviewCard?.querySelector(showAnswer ? '.answer-side' : '.recall-side');
  if (!shell || !targetFace || targetFace.offsetParent === null) return;

  const height = Math.ceil(targetFace.scrollHeight);
  if (!height) return;

  if (immediate) {
    shell.style.transition = 'none';
    shell.style.height = `${height}px`;
    shell.getBoundingClientRect();
    shell.style.removeProperty('transition');
  } else {
    shell.style.height = `${height}px`;
  }
}

function scheduleVisibleFlipHeights() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.subdeck-accordion.is-open .review-card').forEach(reviewCard => {
      setFlipHeight(reviewCard, reviewCard.classList.contains('show-answer'), true);
    });
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      document.querySelectorAll('.subdeck-accordion.is-open .review-card').forEach(reviewCard => {
        setFlipHeight(reviewCard, reviewCard.classList.contains('show-answer'), true);
      });
    });
  }
}

function scrollCardIntoFocus(reviewCard) {
  if (!reviewCard) return;
  requestAnimationFrame(() => {
    reviewCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  });
}

function updateCardSideControls(reviewCard, showAnswer) {
  reviewCard.querySelectorAll('.reveal-button').forEach(button => {
    button.setAttribute('aria-expanded', String(showAnswer));
    button.textContent = button.classList.contains('sticky-reveal')
      ? (showAnswer ? 'Show recall' : 'Show answer')
      : (showAnswer ? 'Flip to recall side' : 'Flip to answer side');
  });

  const state = reviewCard.querySelector('.sticky-side-state');
  if (state) state.textContent = showAnswer ? 'Answer side' : 'Recall side';

  reviewCard.querySelector('.recall-side')?.setAttribute('aria-hidden', String(showAnswer));
  reviewCard.querySelector('.answer-side')?.setAttribute('aria-hidden', String(!showAnswer));
}

function setCardSide(reviewCard, showAnswer) {
  if (!reviewCard) return;

  setFlipHeight(reviewCard, showAnswer);
  requestAnimationFrame(() => {
    reviewCard.classList.toggle('show-answer', showAnswer);
    updateCardSideControls(reviewCard, showAnswer);
    scrollCardIntoFocus(reviewCard);
  });

  window.setTimeout(() => {
    setFlipHeight(reviewCard, showAnswer);
  }, 620);
}

function setSubdeckOpen(accordion, open) {
  if (!accordion) return;

  accordion.classList.toggle('is-open', open);
  const toggle = accordion.querySelector('.subdeck-toggle');
  const text = accordion.querySelector('.subdeck-toggle-text');
  const total = Number(toggle?.dataset.cardCount || 0);

  toggle?.setAttribute('aria-expanded', String(open));
  if (text) {
    text.textContent = open
      ? 'Cards shown'
      : `Open ${total} card${total === 1 ? '' : 's'}`;
  }

  if (open) {
    window.setTimeout(() => {
      accordion.querySelectorAll('.review-card').forEach(reviewCard => {
        setFlipHeight(reviewCard, reviewCard.classList.contains('show-answer'), true);
      });
    }, 460);
  }
}

function findCardFromSection(section) {
  return cards.find(card => card.key === section?.dataset.key);
}

function openReview(scope, context = {}) {
  formStatus.textContent = '';
  formStatus.classList.remove('error');
  reviewForm.reset();

  const lesson = context.lesson || '';
  const deck = context.deck || '';
  const card = context.card || null;
  const meta = lesson ? lessonMeta(lesson) : null;

  document.getElementById('formScope').value = scope;
  document.getElementById('formLesson').value = lesson;
  document.getElementById('formDeck').value = deck;
  document.getElementById('formCardKey').value = card?.key || '';

  const summary = card ? `${stripHtml(card.prompt)} → ${stripHtml(card.answer)}` : '';
  document.getElementById('formCardSummary').value = summary;

  if (scope === 'card' && card) {
    document.getElementById('formItemId').value = `card:${card.key}`;
    scopeBadge.textContent = 'Card comment';
    reviewContext.textContent = `${card.lesson} · ${card.deck} · ${summary}`;
  } else if (scope === 'deck') {
    document.getElementById('formItemId').value = `deck:${lesson}:${slugify(deck)}`;
    scopeBadge.textContent = 'Subdeck comment';
    reviewContext.textContent = `Lesson ${meta?.number || ''} · ${deck}`;
  } else if (scope === 'lesson') {
    document.getElementById('formItemId').value = `lesson:${lesson}`;
    scopeBadge.textContent = `Lesson ${meta?.number || ''} comment`;
    reviewContext.textContent = `Lesson ${meta?.number || ''} · ${meta?.title || ''}`;
  } else {
    document.getElementById('formItemId').value = 'site:general';
    scopeBadge.textContent = 'General comment';
    reviewContext.textContent = 'Italian for Beginners - BSE Course';
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('reviewer').focus(), 0);
}

function closeReview() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

async function copyCurrentComment() {
  const reviewer = document.getElementById('reviewer').value.trim();
  const comment = document.getElementById('comment').value.trim();
  const context = reviewContext.textContent.trim();
  const text = [
    'Italian flash-card review comment',
    context,
    reviewer ? `Reviewer: ${reviewer}` : '',
    `Comment: ${comment}`
  ].filter(Boolean).join('\n');

  try {
    await navigator.clipboard.writeText(text);
    formStatus.textContent = 'Comment copied. You can paste it into an email or message.';
    formStatus.classList.remove('error');
  } catch (error) {
    formStatus.textContent = 'Could not copy automatically. Select and copy the comment text manually.';
    formStatus.classList.add('error');
  }
}

document.addEventListener('click', event => {
  const navigationButton = event.target.closest('[data-lesson-nav]');
  if (navigationButton) {
    setLesson(navigationButton.dataset.lessonNav || null);
    return;
  }

  const subdeckToggle = event.target.closest('.subdeck-toggle');
  if (subdeckToggle) {
    const accordion = subdeckToggle.closest('.subdeck-accordion');
    setSubdeckOpen(accordion, !accordion.classList.contains('is-open'));
    return;
  }

  const revealButton = event.target.closest('.reveal-button');
  if (revealButton) {
    const reviewCard = revealButton.closest('.review-card');
    setCardSide(reviewCard, !reviewCard.classList.contains('show-answer'));
    return;
  }

  const copyButton = event.target.closest('[data-copy-comment]');
  if (copyButton) {
    copyCurrentComment();
    return;
  }

  const commentButton = event.target.closest('[data-comment-scope]');
  if (commentButton) {
    const scope = commentButton.dataset.commentScope;
    if (scope === 'general') {
      openReview('general');
      return;
    }
    if (scope === 'lesson') {
      openReview('lesson', { lesson: commentButton.dataset.lesson });
      return;
    }
    if (scope === 'deck') {
      openReview('deck', {
        lesson: commentButton.dataset.lesson,
        deck: commentButton.dataset.deck
      });
      return;
    }
    if (scope === 'card') {
      const section = commentButton.closest('.review-card');
      const card = findCardFromSection(section);
      if (card) openReview('card', { lesson: card.lesson, deck: card.deck, card });
      return;
    }
  }

  if (event.target.closest('[data-close-modal]')) closeReview();
});

document.addEventListener('toggle', event => {
  const reviewCard = event.target.closest?.('.review-card');
  if (reviewCard && event.target.matches('.extra')) {
    requestAnimationFrame(() => {
      setFlipHeight(reviewCard, reviewCard.classList.contains('show-answer'));
    });
  }
}, true);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) closeReview();
});

reviewForm.addEventListener('submit', async event => {
  event.preventDefault();
  formStatus.textContent = 'Sending…';
  formStatus.classList.remove('error');

  const submitButton = reviewForm.querySelector('.modal-submit');
  submitButton.disabled = true;

  try {
    const data = new URLSearchParams(new FormData(reviewForm));
    data.set('form-name', COMMENT_FORM_NAME);

    const response = await fetch(COMMENT_POST_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString(),
      credentials: 'same-origin',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Submission failed with status ${response.status}`);
    }

    formStatus.textContent = 'Thank you — your comment was sent.';
    reviewForm.querySelector('#comment').value = '';
    setTimeout(closeReview, 1200);
  } catch (error) {
    formStatus.classList.add('error');
    formStatus.innerHTML = 'Comments are not active yet. In Netlify, enable <strong>Forms → Form detection</strong>, redeploy the site, then try again. <button type="button" data-copy-comment>Copy this comment</button>';
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
});

searchInput.addEventListener('input', renderLesson);
deckSelect.addEventListener('change', renderLesson);

expandAllButton.addEventListener('click', () => {
  const accordions = [...document.querySelectorAll('.subdeck-accordion')];
  const shouldOpen = accordions.some(accordion => !accordion.classList.contains('is-open'));
  accordions.forEach(accordion => setSubdeckOpen(accordion, shouldOpen));
  expandAllButton.textContent = shouldOpen ? 'Close all subdecks' : 'Open all subdecks';
});

window.addEventListener('hashchange', () => {
  const lesson = lessonFromHash();
  if (lesson !== currentLesson) setLesson(lesson, false);
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scheduleVisibleFlipHeights, 140);
});

loadCards();
