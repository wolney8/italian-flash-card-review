(function () {
  const IPA_HELP = '<div class="ipa-memory-aid"><p class="field-heading">How do I read the IPA?</p><p>Use the English-friendly line to speak. The IPA is the precision guide: <b>ˈ</b> marks the stressed syllable; <b>ɛ</b> is open <i>e</i> as in British “bed”; <b>e</b> is a pure closed <i>e</i>; <b>ɔ</b> is open <i>o</i> as in British “off”; <b>o</b> is a pure closed <i>o</i>; <b>ɲ</b> = “ny”; <b>ʎ</b> = “ly”; <b>tʃ</b> = “ch”; <b>dʒ</b> = “j”. Tap or roll <b>r</b>, and hold doubled consonants slightly longer.</p></div>';

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__COMPACT_PRON_FINAL_V622__) return;
    cards = cards.map(card => {
      if (!card.pron || String(card.clarification || '').includes('ipa-memory-aid')) return card;
      return {
        ...card,
        clarification: `${card.clarification || ''}${card.clarification ? '<hr>' : ''}${IPA_HELP}`
      };
    });
    window.__COMPACT_PRON_FINAL_V622__ = true;
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function wait() {
    if (window.__ARTICLE_PROGRESSION_V62__ && window.__PRON_V62_READY__) apply();
    else window.setTimeout(wait, 80);
  }

  wait();
})();