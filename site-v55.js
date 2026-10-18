(function () {
  const SITE_VERSION = '5.5-audit-1';
  const ARTICLE_MEANINGS = {
    'italian-l2-ex9-093': 'an office',
    'italian-l2-ex9-094': 'a male friend',
    'italian-l2-ex9-095': 'an agency',
    'italian-l2-ex9-096': 'a female architect',
    'italian-l2-ex9-097': 'a bookshop',
    'italian-l2-ex9-098': 'a gentleman / Mr',
    'italian-l2-ex9-099': 'a house',
    'italian-l2-ex9-100': 'a female friend',
    'italian-l2-ex9-101': 'a male worker',
    'italian-l2-ex9-102': 'a lady / Mrs',
    'italian-l2-ex9-103': 'a course',
    'italian-l2-ex9-104': 'a male nurse',
    'italian-l2-ex9-105': 'a male student',
    'italian-l2-ex9-106': 'a studio / an office',
    'italian-l2-ex9-107': 'a hospital',
    'italian-l2-ex9-108': 'a number',
    'italian-l2-ex9-109': 'a shop',
    'italian-l2-ex9-110': 'a female worker',
    'italian-l2-ex9-111': 'a female secretary'
  };

  function byKey(key) {
    return cards.find(card => card.key === key);
  }

  function installDirectGoogleSubmit() {
    const reviewForm = document.getElementById('reviewForm');
    const endpoint = reviewForm?.action;
    const target = reviewForm?.target || 'googleReviewSink';
    if (!endpoint || typeof submitToGoogleSheet !== 'function') return;

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

  function applyTeacherFeedback() {
    const endingCard = byKey('italian-l2-def-074');
    if (endingCard) {
      endingCard.panel = `
        <div class="panel-head">
          <span class="panel-badge">PLURAL</span>
          <div class="panel-copy">
            <div class="panel-title">Masculine plural endings</div>
            <div class="panel-subtitle">Change a common -o noun to plural</div>
          </div>
        </div>
        <div class="choice-row">
          <span class="choice-chip">-i</span>
          <span class="choice-chip">-e</span>
          <span class="choice-chip">unchanged</span>
        </div>`;
      endingCard.prompt = `
        <div class="instruction">Complete the common ending pattern.</div>
        <div class="focus">masculine singular -o → masculine plural ___</div>
        <div class="clue">ragazzo → ragazzi · boy → boys</div>`;
      endingCard.answer = '-i';
      endingCard.pron = 'ee';
      endingCard.meaning = '<div class="natural">A common masculine noun ending changes from <b>-o</b> in the singular to <b>-i</b> in the plural.</div>';
      endingCard.literal = '<div class="literal">singular <b>-o</b> → plural <b>-i</b></div>';
      endingCard.rule = '<div class="pattern">Example: <b>ragazzo → ragazzi</b>. This is a common pattern, not an exception-free rule.</div>';
    }

    Object.entries(ARTICLE_MEANINGS).forEach(([key, english]) => {
      const card = byKey(key);
      if (card) card.meaning = `<div class="natural">${english}</div>`;
    });

    const whereCard = byKey('origin_where');
    if (whereCard) {
      whereCard.prompt = `
        <div class="instruction">Say this in Italian:</div>
        <div class="focus">Where?</div>
        <div class="clue">Use the question word for place.</div>`;
      whereCard.meaning = '<div class="natural">Where?</div>';
      whereCard.literal = '<div class="literal"><b>dove</b> = where</div>';
      whereCard.rule = '<div class="pattern"><b>Dove?</b> is the standalone question word used to ask about place.</div>';
    }

    const wordJobCard = byKey('role_nationality_italiana');
    if (wordJobCard) {
      wordJobCard.panel = `
        <div class="panel-head">
          <span class="panel-badge">JOB</span>
          <div class="panel-copy">
            <div class="panel-title">Word jobs</div>
            <div class="panel-subtitle">Identify the target word</div>
          </div>
        </div>
        <div class="choice-row">
          <span class="choice-chip">noun</span>
          <span class="choice-chip">verb</span>
          <span class="choice-chip">adjective</span>
        </div>`;
      wordJobCard.prompt = `
        <div class="instruction">What word class is the target word?</div>
        <div class="focus">Io sono <mark class="target-word">italiana</mark>.</div>
        <div class="clue">Target: <b>italiana</b> · it describes the speaker.</div>`;
    }
  }

  function apply() {
    applyTeacherFeedback();
    installDirectGoogleSubmit();
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    document.querySelector('.site-footer')?.replaceChildren(
      document.createTextNode('Italian for Beginners - BSE Course · Version 5.5 audit site')
    );
    updateDeckOptions();
    renderNavigation();
    renderView();
    window.__ITALIAN_V55_READY__ = true;
  }

  function waitForV54() {
    if (window.__ITALIAN_V54_READY__ && typeof cards !== 'undefined' && Array.isArray(cards) && cards.length) {
      apply();
      return;
    }
    window.setTimeout(waitForV54, 80);
  }

  waitForV54();
})();
