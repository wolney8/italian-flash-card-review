(function () {
  const SITE_UPDATED = '22 October 2026';
  const SITE_VERSION = '2026-10-22-pronunciation-integrity';

  const PATCHES = {
    'italian-l2-def-074': ['rah-<strong>GAHT</strong>-tsee', '/raˈɡatːsi/'],
    'italian-l4-plural-rule-o-i': ['ee <strong>GAHT</strong>-tee', '/i ˈɡatːi/'],
    'italian-l4-plural-rule-a-e': ['leh <strong>KAH</strong>-zeh', '/le ˈkaːze/'],
    'italian-l4-plural-rule-masc-e-i': ['ee <strong>PON</strong>-tee', '/i ˈponti/'],
    'italian-l4-plural-rule-masc-a-i': ['ee proh-<strong>BLEH</strong>-mee', '/i proˈblɛmi/'],
    'italian-l4-plural-rule-fem-e-i': ['leh <strong>NOT</strong>-tee', '/le ˈnɔtːi/'],
    'italian-l4-plural-example-ragazzo': ['ee rah-<strong>GAHT</strong>-tsee', '/i raˈɡatːsi/'],
    'italian-l4-plural-example-negozio': ['ee neh-<strong>GOT</strong>-tsee', '/i neˈɡɔtːsi/'],
    'italian-l4-plural-example-ragazza': ['leh rah-<strong>GAHT</strong>-tseh', '/le raˈɡatːse/'],
    'italian-l4-plural-example-casa': ['leh <strong>KAH</strong>-zeh', '/le ˈkaːze/'],
    'italian-l4-plural-example-ponte': ['ee <strong>PON</strong>-tee', '/i ˈponti/'],
    'italian-l4-plural-example-nipote-m': ['ee nee-<strong>POH</strong>-tee', '/i niˈpoti/'],
    'italian-l4-plural-example-problema': ['ee proh-<strong>BLEH</strong>-mee', '/i proˈblɛmi/'],
    'italian-l4-plural-example-notte': ['leh <strong>NOT</strong>-tee', '/le ˈnɔtːi/'],
    'italian-l4-plural-example-citta': ['leh chee-<strong>TAH</strong>', '/le tʃitˈta/'],
    'italian-l4-plural-example-film': ['ee <strong>FEELM</strong>', '/i film/'],
    'italian-l4-plural-example-bici': ['leh <strong>BEE</strong>-chee', '/le ˈbitʃi/'],
    'italian-l4-plural-example-cinema': ['ee <strong>CHEE</strong>-neh-mah', '/i ˈtʃinema/']
  };

  function pronunciation(guide, ipa) {
    return `<div class="pronunciation-compact"><div class="pron-guide-line">${guide}</div><div class="pron-ipa-line">${ipa}</div></div>`;
  }

  function setUpdatedReference() {
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    const footer = document.querySelector('.site-footer');
    if (footer) footer.innerHTML = `Italian for Beginners - BSE Course · <time datetime="2026-10-22">Last updated ${SITE_UPDATED}</time>`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Italian for Beginners - BSE Course flash-card learning and review for Lessons 1–4. Last updated ${SITE_UPDATED}.`);
  }

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__PRONUNCIATION_INTEGRITY_20261022__) return;

    cards = cards.map(card => {
      const patch = PATCHES[card.key];
      if (!patch) return card;
      return { ...card, pron: pronunciation(patch[0], patch[1]) };
    });

    window.__PRONUNCIATION_INTEGRITY_20261022__ = true;
    setUpdatedReference();
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function wait() {
    if (window.__LITERAL_LAYOUT_FINAL_V2__ && Array.isArray(cards)) apply();
    else window.setTimeout(wait, 80);
  }

  new MutationObserver(setUpdatedReference).observe(document.documentElement, { childList: true, subtree: true });
  wait();
})();
