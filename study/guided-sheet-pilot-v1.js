/* Guided learning for all nine Study Sheets.
   Progressive enhancement: the original complete sheet remains usable on error. */
(function () {
  'use strict';

  const TARGET = new URLSearchParams(location.search).get('sheet')
    || decodeURIComponent(location.hash.slice(1));
  if (!TARGET) return; // Library remains unchanged.
  // Preserve existing pilot session key, extending it per topic without losing progress.
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
    const article = root.querySelector('.study-pack-sheet');
    if (!article || article.id !== TARGET) return false;
    if (article.dataset.guidedPilot === 'ready') return true;

    const hero = article.querySelector(':scope > header.hero');
    const quiz = article.querySelector(':scope > section[data-study-quiz]');
    const panels = [...article.querySelectorAll(':scope > section.panel')].filter(p => p !== quiz);
    // Every approved sheet contains 2–5 teaching sections.
    // Keep source order: the first introduces the topic; the remainder are examples
    // and pattern references, regardless of whether their source label says Study or Patterns.
    const learn = panels.slice(0, 1);
    const examples = panels.slice(1);
    const questions = quiz ? [...quiz.querySelectorAll('.quiz-question')] : [];
    if (!hero || !quiz || !learn.length || !examples.length || !questions.length) {
      if (hero && quiz) console.warn('Guided Study Sheet: missing content group for ' + TARGET);
      return false; // Existing full-length sheet remains available.
    }

    const old = savedState();
    const state = {
      step: STEP_IDS.includes(old.step) ? old.step : 'learn',
      learn: clamp(old.learn, learn.length),
      examples: clamp(old.examples, examples.length),
      question: clamp(old.question, questions.length),
      finished: !!old.finished,
      reviewIncorrect: !!old.reviewIncorrect,
      reviewQueue: Array.isArray(old.reviewQueue)
        ? old.reviewQueue.filter(n => Number.isInteger(n) && n >= 0 && n < questions.length)
        : [],
      visitedLearn: Array.isArray(old.visitedLearn)
        ? [...new Set(old.visitedLearn.filter(n => Number.isInteger(n) && n >= 0 && n < learn.length))]
        : [],
      visitedExamples: Array.isArray(old.visitedExamples)
        ? [...new Set(old.visitedExamples.filter(n => Number.isInteger(n) && n >= 0 && n < examples.length))]
        : []
    };

    // Keep the hero a fixed height across steps. Teaching notes belong in Learn,
    // not in the header where hiding a single line shifts the whole experience.
    const intro = [...hero.children].filter(c => c.tagName === 'P' && !c.classList.contains('lead'));
    if (intro.length) {
      const teachingNote = document.createElement('div');
      teachingNote.className = 'guided-sheet-teaching-note';
      for (const paragraph of intro) teachingNote.appendChild(paragraph);
      const firstHeading = learn[0].querySelector('h2');
      if (firstHeading) firstHeading.insertAdjacentElement('afterend', teachingNote);
      else learn[0].prepend(teachingNote);
    }
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
    steps.innerHTML = window.ItalianLearningSession.progressMarkup({
      label:'Overall progress',completed:0,
      total:learn.length+examples.length+questions.length,
      prefix:'guided-sheet-progress'
    }) +
      '<nav class="guided-sheet-step-navigation" aria-label="Study stages">' +
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
      '<button type="button" class="guided-sheet-review-missed" data-guided-review-incorrect>Review incorrect answers</button> ' +
      '<button type="button" class="guided-sheet-review-missed" data-guided-review-unanswered>Review unanswered questions</button>';
    quiz.insertAdjacentElement('afterend', finish);

    // Use the existing ordered sheet navigation, not a second hard-coded list.
    // When the current sheet is the final one, the follow-up opens flashcards.
    const nextSheet = document.querySelector('#studyNav .sheet-route-pager > a:last-child');
    const followup = document.createElement('a');
    followup.className = 'guided-sheet-followup';
    followup.href = nextSheet?.getAttribute('href') || '../?page=lessons';
    followup.textContent = nextSheet
      ? 'Next study sheet: ' + nextSheet.textContent.replace(/\s*→\s*$/, '').trim() + ' →'
      : 'Continue to flashcards →';
    finish.querySelector('[data-guided-review-unanswered]').before(followup);

    const pager = document.createElement('div');
    pager.className = 'guided-sheet-controls';
    pager.innerHTML = '<span class="guided-sheet-controls-status" aria-live="polite"></span>' +
      '<div class="guided-sheet-controls-buttons learning-session-controls">' +
      '<button type="button" data-guided-action="back">Previous</button>' +
      '<button type="button" class="guided-sheet-primary" data-guided-action="next">Next</button>' +
      '</div>';
    finish.insertAdjacentElement('afterend', pager);

    const status = steps.querySelector('.guided-sheet-position');
    const title = steps.querySelector('.guided-sheet-current-title');
    const instruction = steps.querySelector('.guided-sheet-instruction');
    const progressCount = steps.querySelector('.guided-sheet-progress-count');
    const progressTrack = steps.querySelector('.guided-sheet-progress-track');
    const progressFill = steps.querySelector('.guided-sheet-progress-fill');
    const previousButton = pager.querySelector('[data-guided-action="back"]');
    const nextButton = pager.querySelector('[data-guided-action="next"]');
    const controlsStatus = pager.querySelector('.guided-sheet-controls-status');
    const reviewUnanswered = finish.querySelector('[data-guided-review-unanswered]');
    const reviewIncorrect = finish.querySelector('[data-guided-review-incorrect]');
    const finishTitle = finish.querySelector('.guided-sheet-finish-title');
    const finishScore = finish.querySelector('.guided-sheet-finish-score');
    const finishExplanation = finish.querySelector('.guided-sheet-finish-explanation');

    function stats() {
      const states = questions.map(result);
      return {
        attempted: states.filter(Boolean).length,
        correct: states.filter(x => x === 'correct').length,
        wrong: states.filter(x => x === 'wrong').length,
        incorrectIndices: states.map((x,i)=>x==='wrong'?i:-1).filter(i=>i>=0),
        firstUnanswered: states.indexOf(null)
      };
    }
    function show() {
      const step = state.step;
      const practice = step === 'practise';
      const reviewing=practice&&state.reviewIncorrect&&!state.finished&&state.reviewQueue.length>0;
      if (step === 'learn' && !state.visitedLearn.includes(state.learn)) state.visitedLearn.push(state.learn);
      if (step === 'examples' && !state.visitedExamples.includes(state.examples)) state.visitedExamples.push(state.examples);
      for (const [i, panel] of learn.entries()) panel.hidden = !(step === 'learn' && i === state.learn);
      for (const [i, panel] of examples.entries()) panel.hidden = !(step === 'examples' && i === state.examples);
      quiz.hidden = !(practice && !state.finished);
      finish.hidden = !(practice && state.finished);
      for (const [i, question] of questions.entries()) {
        question.hidden = !(practice && !state.finished && i === state.question);
      }
      for (const button of steps.querySelectorAll('[data-guided-step]')) {
        if (button.dataset.guidedStep === step) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      }

      const pos = STEP_IDS.indexOf(step);
      const stat = stats();
      const totalActivities = learn.length + examples.length + questions.length;
      const covered = state.visitedLearn.length + state.visitedExamples.length + stat.attempted;
      progressCount.textContent = covered + ' of ' + totalActivities + ' activities';
      progressTrack.setAttribute('aria-valuenow', String(covered));
      progressTrack.setAttribute('aria-valuemax', String(totalActivities));
      progressTrack.setAttribute('aria-valuetext', covered + ' of ' + totalActivities + ' activities viewed or answered');
      progressFill.style.width = (100 * covered / totalActivities).toFixed(1) + '%';
      const count = step === 'learn' ? learn.length : step === 'examples' ? examples.length
        : reviewing ? state.reviewQueue.length : questions.length;
      const current = step === 'learn' ? state.learn : step === 'examples' ? state.examples
        : reviewing ? Math.max(0,state.reviewQueue.indexOf(state.question)) : state.question;
      const unit = reviewing ? 'Incorrect answer' : practice ? 'Question' : 'Part';
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
      previousButton.textContent = practice && state.finished ? 'Back to questions'
        : reviewing && current===0 ? 'Back to results' : first ? 'Previous' : 'Back';
      if (step === 'learn') nextButton.textContent = state.learn < learn.length - 1 ? 'Next part' : 'Next: Examples';
      if (step === 'examples') nextButton.textContent = state.examples < examples.length - 1 ? 'Next example' : 'Next: Practise';
      if (practice) nextButton.textContent = state.finished ? 'Review from start'
        : reviewing ? (current < count - 1 ? 'Next incorrect' : 'Finish review')
        : state.question < questions.length - 1 ? 'Next question' : 'Finish practice';
      finishTitle.textContent = stat.attempted === questions.length ? 'Practice complete' : 'Practice summary';
      finishScore.textContent = stat.correct + ' of ' + questions.length + ' correct';
      finishExplanation.textContent = stat.attempted === questions.length
        ? 'You have answered every question. You can revisit any of them.'
        : 'You have attempted ' + stat.attempted + ' of ' + questions.length + ' questions.';
      reviewUnanswered.hidden = stat.firstUnanswered < 0;
      reviewIncorrect.hidden = stat.wrong === 0;
      reviewIncorrect.textContent = 'Review ' + stat.wrong + ' incorrect ' +
        (stat.wrong===1?'answer':'answers');
      remember(state);
    }
    function focusStage(previousTop=null) {
      title.focus({preventScroll:true});
      // Stage changes deliberately anchor the three-stage navigation at one top
      // position, so the next task is visible on small screens. Question-to-question
      // navigation is handled separately and keeps the current question in place.
      requestAnimationFrame(() => {
        const delta=steps.getBoundingClientRect().top-16;
        if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'instant'});
      });
    }
    function focusCurrent(previousQuestionTop = null) {
      const currentQuestion = state.step === 'practise' && !state.finished
        ? questions[state.question] : null;
      if (currentQuestion) {
        // Keep each question at the previous question's screen position.
        // Do not scroll back to the stage navigation for Next/Previous question.
        const heading = currentQuestion.querySelector('.question-heading');
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({preventScroll:true});
        }
        requestAnimationFrame(() => {
          const rect = currentQuestion.getBoundingClientRect();
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const safeBottom = Math.max(18, viewportHeight - 110);
          const desiredTop = previousQuestionTop === null ? rect.top : previousQuestionTop;
          const targetTop = Math.max(18, Math.min(desiredTop, safeBottom));
          const delta = rect.top - targetTop;
          if (Math.abs(delta) > 2) window.scrollBy({top:delta,behavior:'instant'});
        });
        return;
      }
      focusStage();
    }
    function move(action) {
      const oldStageTop=steps.getBoundingClientRect().top;
      const previousStep=state.step;
      const wasFinished=state.finished;
      const oldQuestionTop = state.step === 'practise' && !state.finished
        ? questions[state.question]?.getBoundingClientRect().top ?? null : null;
      if (state.step === 'practise' && state.reviewIncorrect && !state.finished && state.reviewQueue.length) {
        const cursor=state.reviewQueue.indexOf(state.question);
        if (action==='back') {
          if (cursor>0) state.question=state.reviewQueue[cursor-1];
          else {state.finished=true;state.reviewIncorrect=false;}
        } else if (cursor<state.reviewQueue.length-1) {
          state.question=state.reviewQueue[cursor+1];
        } else {state.finished=true;state.reviewIncorrect=false;}
        show();
        focusCurrent(oldQuestionTop);
        return;
      }
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
      if(previousStep!==state.step||wasFinished!==state.finished)focusStage(oldStageTop);
      else focusCurrent(oldQuestionTop);
    }

    steps.addEventListener('click', event => {
      const button = event.target.closest('[data-guided-step]');
      if (!button) return;
      const oldStageTop=steps.getBoundingClientRect().top;
      state.step = button.dataset.guidedStep;
      state.finished = false;
      state.reviewIncorrect = false;
      show();
      focusStage(oldStageTop);
    });
    pager.addEventListener('click', event => {
      const button = event.target.closest('[data-guided-action]');
      if (button) move(button.dataset.guidedAction);
    });
    reviewIncorrect.addEventListener('click', () => {
      const queue=stats().incorrectIndices;
      if(!queue.length)return;
      state.reviewIncorrect=true;
      state.reviewQueue=queue;
      state.step='practise';
      state.question=queue[0];
      state.finished=false;
      show();
      focusStage();
    });
    reviewUnanswered.addEventListener('click', () => {
      const missing = stats().firstUnanswered;
      if (missing < 0) return;
      state.step = 'practise';
      state.question = missing;
      state.finished = false;
      state.reviewIncorrect=false;
      show();
      focusStage();
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
