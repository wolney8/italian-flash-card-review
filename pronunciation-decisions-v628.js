(function () {
  const SITE_VERSION = '2026-10-22-reviewed-pronunciation-decisions';
  const PRONUNCIATION_PATCHES = {
  "italian-l1-vowel_count": "",
  "italian-l1-subject_verb_object": "",
  "italian-l1-come_stai": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KOH</strong>-meh <strong>STAI</strong></div><div class=\"pron-ipa-line\">/ˈkome ˈstai/</div></div>",
  "italian-l2-warm-000": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KOH</strong>-meh <strong>STAI</strong></div><div class=\"pron-ipa-line\">/ˈkome ˈstai/</div></div>",
  "italian-l2-c-038": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>K</strong></div><div class=\"pron-ipa-line\">/k/</div></div>",
  "italian-l2-c-039": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CH</strong></div><div class=\"pron-ipa-line\">/tʃ/</div></div>",
  "italian-l2-c-040": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEH</strong> / <strong>KEE</strong></div><div class=\"pron-ipa-line\">/ke / ki/</div></div>",
  "italian-l2-c-041": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHAH</strong> / <strong>CHOH</strong> / <strong>CHOO</strong></div><div class=\"pron-ipa-line\">/tʃa / tʃo / tʃu/</div></div>",
  "italian-l2-g-058": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>G</strong></div><div class=\"pron-ipa-line\">/ɡ/</div></div>",
  "italian-l2-g-059": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>J</strong></div><div class=\"pron-ipa-line\">/dʒ/</div></div>",
  "italian-l2-g-060": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEH</strong> / <strong>GEE</strong></div><div class=\"pron-ipa-line\">/ɡe / ɡi/</div></div>",
  "italian-l2-g-061": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JAH</strong> / <strong>JOH</strong> / <strong>JOO</strong></div><div class=\"pron-ipa-line\">/dʒa / dʒo / dʒu/</div></div>",
  "italian-l2-c-042": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEH</strong></div><div class=\"pron-ipa-line\">/tʃe/</div></div>",
  "italian-l2-c-043": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEH</strong></div><div class=\"pron-ipa-line\">/tʃe/</div></div>",
  "italian-l2-c-044": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEH</strong></div><div class=\"pron-ipa-line\">/tʃe/</div></div>",
  "italian-l2-c-045": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEH</strong></div><div class=\"pron-ipa-line\">/tʃe/</div></div>",
  "italian-l2-c-046": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEE</strong></div><div class=\"pron-ipa-line\">/tʃi/</div></div>",
  "italian-l2-c-047": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEE</strong></div><div class=\"pron-ipa-line\">/tʃi/</div></div>",
  "italian-l2-c-048": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEE</strong></div><div class=\"pron-ipa-line\">/tʃi/</div></div>",
  "italian-l2-c-049": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEE</strong></div><div class=\"pron-ipa-line\">/tʃi/</div></div>",
  "italian-l2-c-050": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEH</strong></div><div class=\"pron-ipa-line\">/ke/</div></div>",
  "italian-l2-c-051": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEH</strong></div><div class=\"pron-ipa-line\">/ke/</div></div>",
  "italian-l2-c-052": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEH</strong></div><div class=\"pron-ipa-line\">/ke/</div></div>",
  "italian-l2-c-053": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEH</strong></div><div class=\"pron-ipa-line\">/ke/</div></div>",
  "italian-l2-c-054": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEE</strong></div><div class=\"pron-ipa-line\">/ki/</div></div>",
  "italian-l2-c-055": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEE</strong></div><div class=\"pron-ipa-line\">/ki/</div></div>",
  "italian-l2-c-056": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEE</strong></div><div class=\"pron-ipa-line\">/ki/</div></div>",
  "italian-l2-c-057": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>KEE</strong></div><div class=\"pron-ipa-line\">/ki/</div></div>",
  "italian-l2-g-062": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEH</strong></div><div class=\"pron-ipa-line\">/dʒe/</div></div>",
  "italian-l2-g-063": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEH</strong></div><div class=\"pron-ipa-line\">/dʒe/</div></div>",
  "italian-l2-g-064": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEH</strong></div><div class=\"pron-ipa-line\">/dʒe/</div></div>",
  "italian-l2-g-065": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEE</strong></div><div class=\"pron-ipa-line\">/dʒi/</div></div>",
  "italian-l2-g-066": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEE</strong></div><div class=\"pron-ipa-line\">/dʒi/</div></div>",
  "italian-l2-g-067": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEE</strong></div><div class=\"pron-ipa-line\">/dʒi/</div></div>",
  "italian-l2-g-068": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEH</strong></div><div class=\"pron-ipa-line\">/ɡe/</div></div>",
  "italian-l2-g-069": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEH</strong></div><div class=\"pron-ipa-line\">/ɡe/</div></div>",
  "italian-l2-g-070": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEH</strong></div><div class=\"pron-ipa-line\">/ɡe/</div></div>",
  "italian-l2-g-071": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEE</strong></div><div class=\"pron-ipa-line\">/ɡi/</div></div>",
  "italian-l2-g-072": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEE</strong></div><div class=\"pron-ipa-line\">/ɡi/</div></div>",
  "italian-l2-g-073": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>GEE</strong></div><div class=\"pron-ipa-line\">/ɡi/</div></div>",
  "italian-l2-alpha-010": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>CHEE</strong></div><div class=\"pron-ipa-line\">/tʃi/</div></div>",
  "italian-l2-alpha-014": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>JEE</strong></div><div class=\"pron-ipa-line\">/dʒi/</div></div>",
  "italian-l2-alpha-024": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>ESS</strong>-seh</div><div class=\"pron-ipa-line\">/ˈɛsse/</div></div>",
  "italian-l2-def-079": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>L</strong></div><div class=\"pron-ipa-line\">/l/</div></div>",
  "italian-l2-def-081": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>L</strong></div><div class=\"pron-ipa-line\">/l/</div></div>",
  "role_nationality_italiana": "",
  "recognition_esse": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\"><strong>ESS</strong>-seh</div><div class=\"pron-ipa-line\">/ˈɛsse/</div></div>",
  "nationality_IT": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\">ee-tah-<strong>LYAH</strong>-noh / ee-tah-<strong>LYAH</strong>-nah</div><div class=\"pron-ipa-line\">/itaˈljano / itaˈljana/</div></div>",
  "nat_rule_oa": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\">ee-tah-<strong>LYAH</strong>-noh / ee-tah-<strong>LYAH</strong>-nah</div><div class=\"pron-ipa-line\">/itaˈljano / itaˈljana/</div></div>",
  "italian-l4-plural-example-ragazzo": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\">ee rah-<strong>GAHT</strong>-tsee</div><div class=\"pron-ipa-line\">/i raˈɡatːsi/</div></div>",
  "italian-l4-plural-mixed-group": "<div class=\"pronunciation-compact\"><div class=\"pron-guide-line\">ee rah-<strong>GAHT</strong>-tsee</div><div class=\"pron-ipa-line\">/i raˈɡatːsi/</div></div>"
};
  const REMOVE_PRONUNCIATION = new Set(["italian-l1-subject_verb_object", "italian-l1-vowel_count", "role_nationality_italiana"]);
  const EXAMPLE_PATCHES = {
  "italian-l2-c-042": {"word":"cestino","guide":"cheh-<strong>STEE</strong>-noh","ipa":"/tʃeˈstino/","meaning":"basket/bin"},
  "italian-l2-c-043": {"word":"cervo","guide":"<strong>CHEHR</strong>-voh","ipa":"/ˈtʃɛrvo/","meaning":"deer"},
  "italian-l2-c-044": {"word":"cemento","guide":"cheh-<strong>MEN</strong>-toh","ipa":"/tʃeˈmento/","meaning":"cement"},
  "italian-l2-c-045": {"word":"cena","guide":"<strong>CHEH</strong>-nah","ipa":"/ˈtʃena/","meaning":"dinner"},
  "italian-l2-c-046": {"word":"bicicletta","guide":"bee-chee-<strong>KLET</strong>-tah","ipa":"/bitʃiˈkletta/","meaning":"bicycle"},
  "italian-l2-c-047": {"word":"cipolla","guide":"chee-<strong>POL</strong>-lah","ipa":"/tʃiˈpɔlla/","meaning":"onion"},
  "italian-l2-c-048": {"word":"circo","guide":"<strong>CHEER</strong>-koh","ipa":"/ˈtʃirko/","meaning":"circus"},
  "italian-l2-c-049": {"word":"cima","guide":"<strong>CHEE</strong>-mah","ipa":"/ˈtʃima/","meaning":"summit/top"},
  "italian-l2-c-050": {"word":"orchestra","guide":"or-<strong>KEHS</strong>-trah","ipa":"/orˈkɛstra/","meaning":"orchestra"},
  "italian-l2-c-051": {"word":"panche","guide":"<strong>PAN</strong>-keh","ipa":"/ˈpaŋke/","meaning":"benches"},
  "italian-l2-c-052": {"word":"chele","guide":"<strong>KEH</strong>-leh","ipa":"/ˈkɛle/","meaning":"claws"},
  "italian-l2-c-053": {"word":"forchetta","guide":"for-<strong>KET</strong>-tah","ipa":"/forˈketta/","meaning":"fork"},
  "italian-l2-c-054": {"word":"chioma","guide":"<strong>KYOH</strong>-mah","ipa":"/ˈkjɔma/","meaning":"hair/mane"},
  "italian-l2-c-055": {"word":"chiodo","guide":"<strong>KYOH</strong>-doh","ipa":"/ˈkjɔdo/","meaning":"nail"},
  "italian-l2-c-056": {"word":"chiosco","guide":"<strong>KYOS</strong>-koh","ipa":"/ˈkjɔsko/","meaning":"kiosk"},
  "italian-l2-c-057": {"word":"chilometro","guide":"kee-<strong>LOH</strong>-meh-troh","ipa":"/kiˈlɔmetro/","meaning":"kilometre"},
  "italian-l2-g-062": {"word":"gelato","guide":"jeh-<strong>LAH</strong>-toh","ipa":"/dʒeˈlato/","meaning":"ice cream"},
  "italian-l2-g-063": {"word":"gemelli","guide":"jeh-<strong>MEL</strong>-lee","ipa":"/dʒeˈmɛlli/","meaning":"twins"},
  "italian-l2-g-064": {"word":"geranio","guide":"jeh-<strong>RAH</strong>-nyoh","ipa":"/dʒeˈranjo/","meaning":"geranium"},
  "italian-l2-g-065": {"word":"gita","guide":"<strong>JEE</strong>-tah","ipa":"/ˈdʒita/","meaning":"trip/outing"},
  "italian-l2-g-066": {"word":"giraffa","guide":"jee-<strong>RAF</strong>-fah","ipa":"/dʒiˈraffa/","meaning":"giraffe"},
  "italian-l2-g-067": {"word":"girasole","guide":"jee-rah-<strong>ZOH</strong>-leh","ipa":"/dʒiraˈzole/","meaning":"sunflower"},
  "italian-l2-g-068": {"word":"ghepardo","guide":"geh-<strong>PAR</strong>-doh","ipa":"/ɡeˈpardo/","meaning":"cheetah"},
  "italian-l2-g-069": {"word":"spaghetti","guide":"spah-<strong>GET</strong>-tee","ipa":"/spaˈɡetti/","meaning":"spaghetti"},
  "italian-l2-g-070": {"word":"alghe","guide":"<strong>AHL</strong>-geh","ipa":"/ˈalɡe/","meaning":"seaweed/algae"},
  "italian-l2-g-071": {"word":"ghiro","guide":"<strong>GEE</strong>-roh","ipa":"/ˈɡiro/","meaning":"dormouse"},
  "italian-l2-g-072": {"word":"ghirlanda","guide":"geer-<strong>LAN</strong>-dah","ipa":"/ɡirˈlanda/","meaning":"garland"},
  "italian-l2-g-073": {"word":"funghi","guide":"<strong>FOON</strong>-gee","ipa":"/ˈfuŋɡi/","meaning":"mushrooms"},
  "italian-l2-def-079": {"word":"l’amico","guide":"lah-<strong>MEE</strong>-koh","ipa":"/laˈmiko/","meaning":"the male friend"},
  "italian-l2-def-081": {"word":"l’amica","guide":"lah-<strong>MEE</strong>-kah","ipa":"/laˈmika/","meaning":"the female friend"}
};
  const CONSISTENCY_GROUPS = {
  "come_stai": ["italian-l1-come_stai","italian-l2-warm-000"],
  "sound_ci": ["italian-l2-alpha-010","italian-l2-c-046","italian-l2-c-047","italian-l2-c-048","italian-l2-c-049"],
  "sound_gi": ["italian-l2-alpha-014","italian-l2-g-065","italian-l2-g-066","italian-l2-g-067"],
  "letter_esse": ["italian-l2-alpha-024","recognition_esse"],
  "sound_ce": ["italian-l2-c-042","italian-l2-c-043","italian-l2-c-044","italian-l2-c-045"],
  "sound_che": ["italian-l2-c-050","italian-l2-c-051","italian-l2-c-052","italian-l2-c-053"],
  "sound_chi": ["italian-l2-c-054","italian-l2-c-055","italian-l2-c-056","italian-l2-c-057"],
  "sound_ge": ["italian-l2-g-062","italian-l2-g-063","italian-l2-g-064"],
  "sound_ghe": ["italian-l2-g-068","italian-l2-g-069","italian-l2-g-070"],
  "sound_ghi": ["italian-l2-g-071","italian-l2-g-072","italian-l2-g-073"],
  "nationality_italiano_italiana": ["nationality_IT","nat_rule_oa"],
  "phrase_i_ragazzi": ["italian-l4-plural-example-ragazzo","italian-l4-plural-mixed-group"]
};

  function installStyles() {
    if (document.getElementById('reviewedPronunciationDecisionStyles')) return;
    const style = document.createElement('style');
    style.id = 'reviewedPronunciationDecisionStyles';
    style.textContent = `
      .example-pronunciation{margin:12px 0 0;padding:12px 14px;border-left:4px solid var(--accent);border-radius:8px;background:var(--paper2)}
      .example-pronunciation .example-italian{display:block;font-size:20px;font-weight:850;color:var(--ink)}
      .example-pronunciation .example-guide{display:block;margin-top:4px;color:var(--green);font-size:15px}
      .example-pronunciation .example-ipa{display:block;margin-top:2px;color:var(--muted);font-size:14px}
      .example-pronunciation .example-meaning{display:block;margin-top:6px;color:var(--muted);font-size:14px}
    `;
    document.head.appendChild(style);
  }

  function stripHtml(value) {
    const element = document.createElement('div');
    element.innerHTML = value || '';
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function exampleBlock(config) {
    return `<div class="example-pronunciation"><span class="field-heading">Example word from the prompt</span><span class="example-italian" lang="it">${config.word}</span><span class="example-guide">${config.guide}</span><span class="example-ipa">${config.ipa}</span><span class="example-meaning">${config.meaning}</span></div>`;
  }

  function removeIpaHelp(value) {
    if (!value) return value;
    const template = document.createElement('template');
    template.innerHTML = value;
    template.content.querySelectorAll('.ipa-memory-aid').forEach(node => {
      const previous = node.previousElementSibling;
      if (previous?.tagName === 'HR') previous.remove();
      node.remove();
    });
    return template.innerHTML.trim();
  }

  function appendExample(card, config) {
    const existing = String(card.clarification || '');
    if (existing.includes('example-pronunciation')) return card;
    return {...card, clarification: `${exampleBlock(config)}${existing ? '<hr>' + existing : ''}`};
  }

  function validate(cardsByKey) {
    const errors = [];
    REMOVE_PRONUNCIATION.forEach(key => {
      if (String(cardsByKey.get(key)?.pron || '').trim()) errors.push(`${key}: pronunciation should be empty`);
    });
    Object.entries(PRONUNCIATION_PATCHES).forEach(([key, expected]) => {
      if (String(cardsByKey.get(key)?.pron || '') !== expected) errors.push(`${key}: pronunciation patch mismatch`);
    });
    Object.entries(CONSISTENCY_GROUPS).forEach(([name, keys]) => {
      const values = new Set(keys.map(key => stripHtml(cardsByKey.get(key)?.pron || ''));
      if (values.size !== 1) errors.push(`${name}: duplicate group is not standardised`);
    });
    window.__PRONUNCIATION_DECISION_ERRORS__ = errors;
    document.documentElement.dataset.pronunciationIntegrity = errors.length ? 'error' : 'ok';
    if (errors.length) console.error('Pronunciation decision integrity errors', errors);
  }

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__) return;
    cards = cards.map(original => {
      let card = {...original};
      if (REMOVE_PRONUNCIATION.has(card.key)) {
        card.pron = '';
        if (card.key === 'role_nationality_italiana') card.clarification = removeIpaHelp(card.clarification);
      }
      if (PRONUNCIATION_PATCHES[card.key] !== undefined) card.pron = PRONUNCIATION_PATCHES[card.key];
      if (EXAMPLE_PATCHES[card.key]) card = appendExample(card, EXAMPLE_PATCHES[card.key]);
      if (card.key === 'italian-l2-def-079' || card.key === 'italian-l2-def-081') {
        card.pattern = '<div class="key-rule"><strong>L’</strong> is the elided article form before a vowel. Its sound is <strong>/l/</strong> joined directly to the following word; do not pronounce it as the letter name <em>elle</em>.</div>';
      }
      return card;
    });
    installStyles();
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    window.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__ = true;
    validate(new Map(cards.map(card => [card.key, card])));
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function wait() {
    if (window.__FINAL_CONTENT_INTEGRITY_V627__ && Array.isArray(cards)) apply();
    else window.setTimeout(wait, 80);
  }

  wait();
})();
