/* Pilot: one focused activity at a time for Di, da, dove and pronouns.
   Progressive enhancement: if this script cannot initialise, the original sheet works. */
(function () {
  'use strict';

  const TARGET = 'di-da-dove-pronouns';
  const VIEW_KEY = 'italianGuidedSheetPilotV1:' + TARGET;
  const STEP_IDS = ['learn', 'examples', 'practise'];
  const STEP_LABELS = ['Learn', 'Examples', 'Practise'];
  const STEP_HELP = [
    'Understand the rule',
    'Recognise the pattern',
    'Check your understanding'
  ];
  const INSTRUCTIONS = [
    'Read the explanation. Use Next when you are ready.',
    'Look for patterns in the examples, then try a question.',
    'Choose or type an answer, then select Check answer.'
  ];
  const requested = new URLSearchParams(location.search).get('sheet') || decodeURIComponent(location.hash.slice(1));
  if (requested !== TARGET) return; // Other eight sheets and the library remain unchanged.
  const root = document.getElementById('studySheets');
  if (!root) return;

  function savedState() {
    try { return JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function remember(state) {
    try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(state)); }
    catch (_) { /* Browsers without storage can still use the guide. */ }
  }
  function clamp(n, size) {
    return Number.isInteger(n) && n >= 0 && n < size ? n : 0;
  }
  function result(question) {
    const feedback = question.querySelector('.feedback');
    if (feedback && feedback.classList.contains('correct')) return 'correct';
    if (feedback && feedback.classList.contains('wrong')) return 'wrong';
    return null;
  }
  function initialise() {
    const article = root.querySelector('.study-pack-sheet#' + TARGET);
    if (!article) return false;
    if (article.dataset.guidedPilot === 'ready') return true;

    const hero = article.querySelector(':scope > header.hero');
    const quiz = article.querySelector(':scope > section[data-study-quiz]');
    const panels = [...article.querySelectorAll(':scope > section.panel')].filter(p => p !== quiz);
    const learn = panels.filter(p => p.querySelector('.eyebrow')?.textContent.trim() !== 'Patterns');
    const examples = panels.filter(p => p.querySelector('.eyebrow')?.textContent.trim() === 'Patterns');
    const questions = quiz ? [...quiz.querySelectorAll('.quiz-question')] : [];
    if (!hero || !quiz || !learn.length || !examples.length || !questions.length) return false;

    const old = savedState();
    const state = {
      step: STEP_IDS.includes(old.step) ? old.step : 'learn',
      learn: clamp(old.learn, learn.length),
      examples: clamp(old.examples, examples.length),
      question: clamp(old.question, questions.length),
      finished: !!old.finished
    };

    const intro = [...hero.children].filter(c => c.tagName === 'P' && !c.classList.contains('lead'));
    const actions = hero.querySelector('.actions');
    const backLink = actions?.querySelector('a[href*="study-sheets.html"]');
    if (backLink) backLink.hidden = true; // The existing sheet selector already offers a route back.
    const originalHelp = quiz.querySelector('.quiz-intro');
    if (originalHelp) {
      const disclosure = document.createElement('details');
      disclosure.className = 'guided-sheet-tips';
      disclosure.innerHTML = '<summary>Answer tips</summary>';
      originalHelp.parentNode.insertBefore(disclosure, originalHelp);
      disclosure.appendChild(originalHelp);
    }

    const steps = document.createElement('div');
    steps.className = 'guided-sheet-steps';
    steps.innerHTML = '<nav class="guided-sheet-step-navigation" aria-label="Study stages">' +
      STEP_IDS.map((id, i) =>
        '<button type="button" data-guided-step="' + id + '"><span class="guided-sheet-step-number">' +
        (i + 1) + '</span><span class="guided-sheet-step-copy"><span>' + STEP_LABELS[i] +
        '</span><small>' + STEP_HELP[i] + '</small></span></button>'
      ).join('') + '</nav>' +
      '<div class="guided-sheet-current" aria-live="polite">' +
      '<p class="guided-sheet-position"></p>' +
      '<h2 class="guided-sheet-current-title" tabindex="-1"></h2>' +
      '<p class="guided-sheet-instruction"></p></div>';
    hero.insertAdjacentElement('afterend', steps);

    const finish = document.createElement('section');
    finish.className = 'panel guided-sheet-finish';
    finish.setAttribute('aria-live', 'polite');
    finish.innerHTML = '<h2 class="guided-sheet-finish-title">Practice summary</h2>' +
      '<p class="guided-sheet-finish-score"></p>' +
      '<p class="guided-sheet-finish-explanation"></p>' +
      '<button type="button" class="guided-sheet-review-missed" data-guided-review-unanswered>Review unanswered questions</button>';
    quiz.insertAdjacentElement('afterend', finish);

    const pager = document.createElement('div');
    pager.className = 'guided-sheet-controls';
    pager.innerHTML = '<span class="guided-sheet-controls-status" aria-live="polite"></span>' +
      '<div class="guided-sheet-controls-buttons">' +
      '<button type="button" data-guided-action="back">Previous</button>' +
      '<button type="button" class="guided-sheet-primary" data-guided-action="next">Next</button>' +
      '</div>';
    finish.insertAdjacentElement('afterend', pager);

    const status = steps.querySelector('.guided-sheet-position');
    const title = steps.querySelector('.guided-sheet-current-title');
    const instruction = steps.querySelector('.guided-sheet-instruction');
    const previousButton = pager.querySelector('[data-guided-action="back"]');
    const nextButton = pager.querySelector('[data-guided-action="next"]');
    const controlsStatus = pager.querySelector('.guided-sheet-controls-status');
    const reviewUnanswered = finish.querySelector('[data-guided-review-unanswered]');
    const finishTitle = finish.querySelector('.guided-sheet-finish-title');
    const finishScore = finish.querySelector('.guided-sheet-finish-score');
    const finishExplanation = finish.querySelector('.guided-sheet-finish-explanation');

    function stats() {
      const states = questions.map(result);
      return {
        attempted: states.filter(Boolean).length,
        correct: states.filter(x => x === 'correct').length,
        firstUnanswered: states.indexOf(null)
      };
    }
    function show() {
      const step = state.step;
      const sectionList = step === 'learn' ? learn : examples;
      const index = step === 'learn' ? state.learn : state.examples;
      const practice = step === 'practise';
      for (const [i, panel] of learn.entries()) panel.hidden = !(step === 'learn' && i === state.learn);
      for (const [i, panel] of examples.entries()) panel.hidden = !(step === 'examples' && i === state.examples);
      quiz.hidden = !(practice && !state.finished);
      finish.hidden = !(practice && state.finished);
      for (const [i, question] of questions.entries()) {
        question.hidden = !(practice && !state.finished && i === state.question);
      }
      for (const paragraph of intro) paragraph.hidden = !(step === 'learn' && state.learn === 0);

      for (const button of steps.querySelectorAll('[data-guided-step]')) {
        if (button.dataset.guidedStep === step) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      }

      const pos = STEP_IDS.indexOf(step);
      const stat = stats();
      const count = step === 'learn' ? learn.length : step === 'examples' ? examples.length : questions.length;
      const current = step === 'learn' ? state.learn : step === 'examples' ? state.examples : state.question;
      const unit = practice ? 'Question' : 'Part';
      const position = practice && state.finished ? 'Summary' : unit + ' ' + (current + 1) + ' of ' + count;
      status.textContent = 'Step ' + (pos + 1) + ' of 3 · ' + position;
      title.textContent = practice && state.finished ? 'Your practice results' : STEP_LABELS[pos];
      instruction.textContent = practice && state.finished
        ? 'Review your progress or return to a question.'
        : INSTRUCTIONS[pos];
      controlsStatus.textContent = practice
        ? stat.attempted + ' of ' + questions.length + ' attempted · ' + stat.correct + ' correct'
        : position;
      const first = step === 'learn' && state.learn === 0;
      previousButton.disabled = first;
      previousButton.textContent = practice && state.finished ? 'Back to questions' : first ? 'Previous' : 'Back';
      if (step === 'learn') nextButton.textContent = state.learn < learn.length - 1 ? 'Next part' : 'Next: Examples';
      if (step === 'examples') nextButton.textContent = state.examples < examples.length - 1 ? 'Next example' : 'Next: Practise';
      if (practice) nextButton.textContent = state.finished ? 'Restart practice' :
        state.question < questions.length - 1 ? 'Next question' : 'Finish practice';
      finishTitle.textContent = stat.attempted === questions.length ? 'Practice complete' : 'Practice summary';
      finishScore.textContent = stat.correct + ' of ' + questions.length + ' correct';
      finishExplanation.textContent = stat.attempted === questions.length
        ? 'You have answered every question. You can revisit any of them.'
        : 'You have attempted ' + stat.attempted + ' of ' + questions.length + ' questions.';
      reviewUnanswered.hidden = stat.firstUnanswered < 0;
      remember(state);
    }
    function move(action) {
      if (action === 'back') {
        if (state.step === 'practise') {
          if (state.finished) state.finished = false;
          else if (state.question > 0) state.question--;
          else state.step = 'examples';
        } else if (state.step === 'examples') {
          if (state.examples > 0) state.examples--;
          else state.step = 'learn';
        } else if (state.learn > 0) state.learn--;
      } else {
        if (state.step === 'learn') {
          if (state.learn < learn.length - 1) state.learn++;
          else state.step = 'examples';
        } else if (state.step === 'examples') {
          if (state.examples < examples.length - 1) state.examples++;
          else state.step = 'practise';
        } else if (state.finished) {
          state.question = 0;
          state.finished = false; // Revisit answers; do not erase them.
        } else if (state.question < questions.length - 1) {
          state.question++;
        } else state.finished = true;
      }
      show();
      title.focus({preventScroll: true});
      steps.scrollIntoView({block:'start', behavior:'auto'});
    }

    steps.addEventListener('click', event => {
      const button = event.target.closest('[data-guided-step]');
      if (!button) return;
      state.step = button.dataset.guidedStep;
      state.finished = false;
      show();
      title.focus({preventScroll:true});
    });
    pager.addEventListener('click', event => {
      const button = event.target.closest('[data-guided-action]');
      if (button) move(button.dataset.guidedAction);
    });
    reviewUnanswered.addEventListener('click', () => {
      const missing = stats().firstUnanswered;
      if (missing < 0) return;
      state.step = 'practise';
      state.question = missing;
      state.finished = false;
      show();
      title.focus({preventScroll:true});
      steps.scrollIntoView({block:'start',behavior:'auto'});
    });
    // Existing answer and hint handlers remain unchanged; just refresh progress labels.
    article.addEventListener('click', event => {
      if (event.target.closest('.check-button')) setTimeout(show, 0);
    });
    article.addEventListener('input', event => {
      if (event.target.closest('.quiz-question')) setTimeout(show, 0);
    });
    article.addEventListener('change', event => {
      if (event.target.closest('.quiz-question')) setTimeout(show, 0);
    });
    article.dataset.guidedPilot = 'ready';
    document.body.classList.add('guided-study-pilot');
    show();
    // Recovery restores saved question feedback asynchronously after render.
    setTimeout(show, 0);
    return true;
  }
  if (initialise()) return;
  const observer = new MutationObserver(() => {
    if (initialise()) observer.disconnect();
  });
  observer.observe(root, {childList:true,subtree:true});
})();
