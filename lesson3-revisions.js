(function () {
  const SITE_VERSION = '6.0-review-3';

  function replaceAllText(value, replacements) {
    let result = value || '';
    replacements.forEach(([from, to]) => {
      result = result.split(from).join(to);
    });
    return result;
  }

  function normaliseAbitareReference(card) {
    card.panel = replaceAllText(card.panel, [
      ['abitare — to live / reside', 'abitare — to reside / live at a place']
    ]);
    card.pattern = replaceAllText(card.pattern, [
      ['<b>abitare</b> — to live / reside', '<b>abitare</b> — to reside / live at a place'],
      ['I live / reside', 'I reside / live at a place'],
      ['You live / reside — one person, informal', 'You reside / live at a place — one person, informal'],
      ['He lives / she lives', 'He / she resides or lives at a place'],
      ['He / she lives / resides', 'He / she resides or lives at a place'],
      ['We live / reside', 'We reside / live at a place'],
      ['You live / reside — several people', 'You reside / live at a place — several people'],
      ['They live / reside', 'They reside / live at a place'],
      ['You live / reside — one person, formal', 'You reside / live at a place — one person, formal']
    ]);
    return card;
  }

  function dayTiles() {
    return `<div class="tiles">
      <div class="word-tile"><span lang="it">lunedì</span><small>Monday</small></div>
      <div class="word-tile"><span lang="it">martedì</span><small>Tuesday</small></div>
      <div class="word-tile"><span lang="it">mercoledì</span><small>Wednesday</small></div>
      <div class="word-tile"><span lang="it">giovedì</span><small>Thursday</small></div>
      <div class="word-tile"><span lang="it">venerdì</span><small>Friday</small></div>
      <div class="word-tile"><span lang="it">sabato</span><small>Saturday</small></div>
      <div class="word-tile"><span lang="it">domenica</span><small>Sunday</small></div>
    </div>`;
  }

  function patchAbitareForm(card, focus, meaning, pronoun, verbForm, pronounGloss) {
    normaliseAbitareReference(card);
    card.prompt = `<div class="instruction">Use <strong>abitare</strong> to say:</div><div class="focus">${focus}</div><div class="clue">Teaching gloss: <strong>reside</strong>. In everyday English, Italian <strong>abitare</strong> often translates naturally as “live”.</div>`;
    card.meaning = meaning;
    card.literal = `<div class="tiles"><div class="word-tile"><span lang="it">${pronoun}</span><small>${pronounGloss}</small></div><div class="word-tile"><span lang="it">${verbForm}</span><small>reside / live at</small></div></div>`;
    card.clarification = 'The deck uses “reside” as a teaching gloss to keep <strong>abitare</strong> distinct from <strong>vivere</strong>. In normal Italian, <strong>abitare</strong> is an everyday way to say where someone lives.';
    card.reference = replaceAllText(card.reference, [
      ['</span> Session 3', '</span> Session 3']
    ]) + '<p class="tiny">The “reside” teaching gloss is added study support; the course presents <strong>vivere</strong> and <strong>abitare</strong> as alternatives for where someone lives.</p>';
  }

  function patchAbitareQuestion(card, focus, clue, meaning) {
    normaliseAbitareReference(card);
    card.prompt = `<div class="instruction">Ask this in Italian:</div><div class="focus">${focus}</div><div class="clue">${clue}</div>`;
    card.meaning = meaning;
    card.usage = '<strong>Abitare</strong> is normal everyday Italian for where someone lives. “Reside” is used here only as a clear teaching contrast with <strong>vivere</strong>.';
    card.clarification = 'Natural English usually says “live”. The deck uses “reside” on the Recall side so the requested Italian verb is unambiguous.';
  }

  function applyRevisions() {
    if (!Array.isArray(cards) || !cards.length || window.__LESSON3_REVISION_20261020__) return;

    cards = cards.map(original => {
      const card = { ...original };

      if (card.key === 'conversation_name_tu') {
        card.prompt = '<div class="instruction">Ask this informally in Italian:</div><div class="focus">What is your name?</div><div class="clue">Use <strong>chiamarsi</strong>. Italian asks literally: <strong>How do you call yourself?</strong></div>';
        card.answer = '<strong>Come ti chiami?</strong><div class="answer-variant"><small>Also possible for contrast or emphasis: <strong>Tu, come ti chiami?</strong></small></div>';
        card.pron = '<strong>KOH</strong>-meh tee <strong>KYAH</strong>-mee';
        card.meaning = 'What is your name? — informal';
        card.usage = '<strong>Come</strong> is the question word that makes this an open question. <strong>Ti chiami?</strong> on its own normally needs a name or context, for example <strong>Ti chiami Marco?</strong> — “Are you called Marco?” The subject pronoun <strong>tu</strong> is usually omitted unless it is being contrasted or emphasised.';
        card.pattern = card.pattern.replace('<div class="base-rule">ti chiami</div>', '<div class="base-rule"><strong>come + ti chiami</strong> → “what are you called?”</div>');
        card.clarification = 'The course model <strong>Tu come ti chiami?</strong> is grammatical. The shorter <strong>Come ti chiami?</strong> is the usual neutral question; <strong>tu</strong> can be added for contrast or emphasis.';
        card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 3 minutes and slides, 06.10.2026: <strong>Tu come ti chiami?</strong>. The subject-omission note is added study support.';
      }

      if (card.key === 'conversation_name_lei') {
        card.prompt = '<div class="instruction">Ask this formally in Italian:</div><div class="focus">What is your name?</div><div class="clue">Use <strong>chiamarsi</strong> with formal <strong>Lei → si chiama</strong>. Italian asks literally: <strong>How do you call yourself?</strong></div>';
        card.answer = '<strong>Come si chiama?</strong><div class="answer-variant"><small>Also possible for clarity or emphasis: <strong>Lei, come si chiama?</strong></small></div>';
        card.pron = '<strong>KOH</strong>-meh see <strong>KYAH</strong>-mah';
        card.meaning = 'What is your name? — formal';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">Come</span><small>how</small></div><div class="word-tile"><span lang="it">si</span><small>yourself — formal</small></div><div class="word-tile"><span lang="it">chiama</span><small>you call — formal</small></div></div>';
        card.usage = '<strong>Come</strong> is required for the open question. <strong>Lei si chiama?</strong> by itself normally asks whether the person is called something and needs a name or context. Formal <strong>Lei</strong> uses the third-person singular form <strong>si chiama</strong>.';
        card.pattern = card.pattern.replace('<div class="base-rule">si chiama</div>', '<div class="base-rule"><strong>come + si chiama</strong> → formal “what are you called?”</div>');
        card.clarification = 'The course model <strong>Lei come si chiama?</strong> is grammatical. The neutral formal question is commonly <strong>Come si chiama?</strong>; <strong>Lei</strong> can be stated for clarity or emphasis.';
        card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 3 minutes and slides, 06.10.2026: <strong>Lei come si chiama?</strong>. The subject-omission note is added study support.';
      }

      if (card.key === 'conversation_martedi') {
        card.panel = '<div class="panel-head"><span class="panel-badge">A + DAY</span><div class="panel-copy"><div class="panel-title">Farewell with a day</div><div class="panel-subtitle">Reuse the same pattern with any day</div></div></div>';
        card.prompt = '<div class="instruction">Say this in Italian:</div><div class="focus">See you on Tuesday.</div><div class="clue">Use <strong>a + day</strong>. Italian literally says “to / until Tuesday”; the next Tuesday is understood from context.</div>';
        card.answer = '<strong>A martedì!</strong>';
        card.meaning = 'See you on Tuesday! / See you next Tuesday! — when the next Tuesday is clear from context';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">A</span><small>to / until</small></div><div class="word-tile"><span lang="it">martedì</span><small>Tuesday</small></div></div>';
        card.usage = 'Use <strong>a + day</strong> as a concise farewell: <strong>A lunedì!</strong>, <strong>A venerdì!</strong>, and so on. To make “next” explicit, say <strong>A martedì prossimo!</strong> or <strong>Ci vediamo martedì prossimo.</strong>';
        card.pattern = '<div class="key-rule"><strong>a + day</strong> → “see you on [day]”</div><div class="field-heading">Days of the week</div>' + dayTiles();
        card.clarification = 'The words “see you” are understood in natural English. In Italian, the short farewell is built with <strong>a + day</strong>.';
      }

      if (card.key === 'origin_sono_napoli') {
        card.prompt = '<div class="instruction">Say this in Italian:</div><div class="focus">I am from Naples.</div><div class="clue">Use <strong>essere</strong>: <strong>io sono + di + city</strong>. Fictional speaker.</div>';
      }

      if (card.key === 'verb_abitare_0') patchAbitareForm(card, 'I reside', 'I reside / I live at a place', 'io', 'abito', 'I');
      if (card.key === 'verb_abitare_1') patchAbitareForm(card, 'You reside — informal', 'You reside / live at a place — informal', 'tu', 'abiti', 'you — informal');
      if (card.key === 'verb_abitare_2') {
        normaliseAbitareReference(card);
        card.prompt = '<div class="instruction">Use <strong>abitare</strong> to say:</div><div class="focus">He resides / she resides</div><div class="clue">Teaching gloss: <strong>reside</strong>. The verb form is the same for <strong>lui</strong> and <strong>lei</strong>.</div>';
        card.meaning = 'He / she resides or lives at a place';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">lui / lei</span><small>he / she</small></div><div class="word-tile"><span lang="it">abita</span><small>resides / lives at</small></div></div>';
        card.clarification = 'The deck uses “reside” as a teaching gloss to distinguish <strong>abitare</strong> from <strong>vivere</strong>. The Italian verb is normal everyday language.';
      }
      if (card.key === 'verb_abitare_noi') patchAbitareForm(card, 'We reside', 'We reside / we live at a place', 'noi', 'abitiamo', 'we');
      if (card.key === 'verb_abitare_voi') patchAbitareForm(card, 'You all reside', 'You all reside / live at a place', 'voi', 'abitate', 'you — plural');
      if (card.key === 'verb_abitare_loro') patchAbitareForm(card, 'They reside', 'They reside / live at a place', 'loro', 'abitano', 'they');

      if (card.key === 'formal_lei_abita') {
        normaliseAbitareReference(card);
        card.prompt = '<div class="instruction">Say this formally in Italian:</div><div class="focus">You reside.</div><div class="clue">Use <strong>Lei</strong> with <strong>abitare</strong>. Natural English often says “you live”.</div>';
        card.meaning = 'You reside / live at a place — formal singular';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">Lei</span><small>you — formal</small></div><div class="word-tile"><span lang="it">abita</span><small>reside / live at</small></div></div>';
        card.clarification = 'The “reside” wording makes the requested verb clear. In ordinary English, the natural translation is often “you live”.';
      }

      if (card.key === 'q_dove_abitate') {
        patchAbitareQuestion(card, 'Where do you all reside?', 'Use <strong>abitare</strong> with <strong>voi → abitate</strong>. Natural English usually says “Where do you all live?”', 'Where do you all reside? / Where do you all live?');
      }
      if (card.key === 'liveq_abita') {
        patchAbitareQuestion(card, 'Where do you reside? — formal', 'Use <strong>abitare</strong> with formal <strong>Lei → abita</strong>.', 'Where do you reside? / Where do you live? — formal');
      }
      if (card.key === 'liveq_abiti') {
        patchAbitareQuestion(card, 'Where do you reside? — informal', 'Use <strong>abitare</strong> with <strong>tu → abiti</strong>.', 'Where do you reside? / Where do you live? — informal');
      }

      if (card.key === 'reside_abito_Italia') {
        normaliseAbitareReference(card);
        card.prompt = '<div class="instruction">Say this in Italian:</div><div class="focus">I reside in Italy.</div><div class="clue">Use <strong>abitare</strong>, <strong>io</strong> and a full sentence. Natural English can also say “I live in Italy”. Fictional speaker.</div>';
        card.meaning = 'I reside in Italy. / I live in Italy.';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">Io</span><small>I</small></div><div class="word-tile"><span lang="it">abito</span><small>reside / live</small></div><div class="word-tile"><span lang="it">in</span><small>in</small></div><div class="word-tile"><span lang="it">Italia</span><small>Italy</small></div></div>';
        card.usage = '<strong>Abitare</strong> is normal Italian for where someone lives. “Reside” is used on this Recall side only to distinguish it from the separate <strong>vivere</strong> card.';
        card.clarification = 'Both <strong>Io abito in Italia</strong> and <strong>Io vivo in Italia</strong> are correct. The deck keeps separate cards so the learner practises both verbs rather than duplicating the same <strong>vivere</strong> answer.';
      }

      if (card.key === 'reside_abito_Napoli') {
        normaliseAbitareReference(card);
        card.prompt = '<div class="instruction">Say this in Italian:</div><div class="focus">I reside in Naples.</div><div class="clue">Use <strong>abitare</strong>, <strong>io</strong> and <strong>a + city</strong>. Natural English can also say “I live in Naples”. Fictional speaker.</div>';
        card.meaning = 'I reside in Naples. / I live in Naples.';
        card.literal = '<div class="tiles"><div class="word-tile"><span lang="it">Io</span><small>I</small></div><div class="word-tile"><span lang="it">abito</span><small>reside / live</small></div><div class="word-tile"><span lang="it">a</span><small>in / at — city</small></div><div class="word-tile"><span lang="it">Napoli</span><small>Naples</small></div></div>';
        card.usage = '<strong>Abitare</strong> is normal Italian for where someone lives. The Recall side uses “reside” to distinguish it from the separate <strong>vivere</strong> card.';
        card.clarification = 'Use <strong>a</strong> before a city. Both <strong>Io abito a Napoli</strong> and <strong>Io vivo a Napoli</strong> are correct.';
      }

      return card;
    });

    if (typeof submitToGoogleSheet === 'function' && !submitToGoogleSheet.__lesson3RevisionWrapped) {
      const previousSubmit = submitToGoogleSheet;
      const wrappedSubmit = fields => previousSubmit({ ...fields, site_version: SITE_VERSION });
      wrappedSubmit.__lesson3RevisionWrapped = true;
      submitToGoogleSheet = wrappedSubmit;
    }

    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    window.__LESSON3_REVISION_20261020__ = true;
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function waitForV60() {
    if (window.__ITALIAN_V60_READY__ && Array.isArray(cards) && cards.some(card => card.key === 'conversation_name_tu')) {
      applyRevisions();
      return;
    }
    window.setTimeout(waitForV60, 80);
  }

  waitForV60();
})();
