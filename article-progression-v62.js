(function () {
  const SITE_VERSION = '6.2-article-progression-candidate';

  function tile(word, gloss) {
    return `<div class="word-tile"><span lang="it">${word}</span><small>${gloss}</small></div>`;
  }

  function literalFamily(base, article, combined, articleGloss, combinedGloss) {
    return `<div class="tiles article-build">${tile(base, 'of / from')}${tile(article, articleGloss)}${tile(combined, combinedGloss)}</div><p class="literal-note"><strong>${combined}</strong> is historically and grammatically built from <strong>${base} + ${article}</strong>. In this card it functions as a partitive/indefinite plural and translates naturally as <strong>some</strong>, not word-for-word “of the”.</p>`;
  }

  function definiteFamily(singular, plural, some, noun, nounGloss, rule) {
    return `<div class="tiles article-family">${tile(singular, 'the — singular')}${tile(plural, 'the — plural')}${tile(some, 'some — plural')}</div><p class="literal-note">Example: <strong>${plural} ${noun}</strong> = the ${nounGloss}; <strong>${some} ${noun}</strong> = some ${nounGloss}.</p><div class="key-rule">${rule}</div>`;
  }

  function patchL2Def(card, config) {
    card.prompt = `<div class="instruction">Choose the definite plural article meaning <strong>“the”</strong>.</div><div class="focus">___ ${config.noun}</div><div class="clue">${config.clue} Lesson 2 introduces the article family; Lesson 4 applies it in full plural agreement.</div>`;
    card.answer = config.answer;
    card.meaning = `the ${config.gloss}`;
    card.literal = definiteFamily(config.singular, config.answer.toLowerCase(), config.some, config.noun, config.gloss, config.rule);
    card.usage = config.usage;
    card.pattern = `<div class="field-heading">Article family</div><div class="article-map"><strong>${config.answer.toLowerCase()}</strong> = the · <strong>${config.some}</strong> = some</div>`;
    card.clarification = 'This is the Lesson 2 foundation layer: recognise the correct plural article and its family. Lesson 4 revisits the same forms with detailed starting-sound rules, noun agreement and “the / some” phrase production.';
    card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 2, 29.09.2026: plural definite forms <strong>i, gli, le</strong>. <span class="source-pill later">REINFORCED</span> Session 4, 13.10.2026, plural article table and agreement practice.';
  }

  function patchL2Some(card, config) {
    card.prompt = `<div class="instruction">Choose the plural partitive article meaning <strong>“some”</strong>.</div><div class="focus">___ ${config.noun}</div><div class="clue">${config.clue} It pairs with definite plural <strong>${config.definite}</strong>.</div>`;
    card.answer = config.answer;
    card.meaning = `some ${config.gloss}`;
    card.literal = literalFamily('di', config.definite, config.answer.toLowerCase(), 'the — plural', 'some — in this use');
    card.usage = `<strong>${config.answer.toLowerCase()}</strong> is the partitive/indefinite plural form used here for an unspecified quantity: “some ${config.gloss}”. ${config.usage}`;
    card.pattern = `<div class="field-heading">Pair to remember</div><div class="key-rule"><strong>${config.definite}</strong> = the → <strong>${config.answer.toLowerCase()}</strong> = some</div><div class="article-map"><strong>di + ${config.definite} = ${config.answer.toLowerCase()}</strong></div>`;
    card.clarification = 'These are not mechanical plurals of un / uno / una. They are partitive forms that can function as an indefinite plural meaning “some”. Lesson 2 introduces the family; Lesson 4 teaches the detailed rules and applies them to complete noun phrases.';
    card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 2, 29.09.2026: plural “some” forms <strong>dei, degli, delle</strong>. <span class="source-pill later">DETAILED IN LESSON 4</span> Session 4, 13.10.2026, Articoli Indeterminativi / Partitivi Plurali.';
  }

  function patchL4Def(card, config) {
    card.prompt = `<div class="instruction">Complete the plural noun phrase with the article meaning <strong>“the”</strong>.</div><div class="focus">___ ${config.noun}</div><div class="clue">${config.clue}</div>`;
    card.meaning = `the ${config.gloss}`;
    card.literal = `<div class="tiles">${tile(config.answer, 'the — ' + config.grammar)}${tile(config.noun, config.gloss)}</div>`;
    card.usage = config.usage;
    card.pattern = `<div class="key-rule"><strong>${config.answer}</strong> = the · <strong>${config.some}</strong> = some</div><div class="article-map">Lesson 2: recognise the family → Lesson 4: apply gender, number and starting-sound agreement.</div>`;
    card.clarification = 'This is the Lesson 4 application layer. The article form was first introduced in Lesson 2; here it is selected inside a complete plural noun phrase using the detailed table from the Lesson 4 handout.';
    card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 4 handout, 13.10.2026, p.4: Articoli Determinativi Plurali.';
  }

  function patchL4Some(card, config) {
    card.prompt = `<div class="instruction">Complete the plural noun phrase with the article meaning <strong>“some”</strong>.</div><div class="focus">___ ${config.noun}</div><div class="clue">${config.clue}</div>`;
    card.meaning = `some ${config.gloss}`;
    card.literal = literalFamily('di', config.definite, config.answer, 'the — plural', 'some — in this use') + `<div class="tiles">${tile(config.answer, 'some — ' + config.grammar)}${tile(config.noun, config.gloss)}</div>`;
    card.usage = `${config.usage} Here <strong>${config.answer}</strong> gives an unspecified plural quantity: “some ${config.gloss}”.`;
    card.pattern = `<div class="key-rule"><strong>${config.definite}</strong> = the → <strong>${config.answer}</strong> = some</div><div class="article-map"><strong>di + ${config.definite} = ${config.answer}</strong></div>`;
    card.clarification = 'The form can literally represent “of the” in another construction, but on this card it is functioning as the partitive/indefinite plural “some”. This is the detailed Lesson 4 rule-and-application layer.';
    card.reference = '<span class="source-pill course">COURSE MATERIAL</span> Session 4 handout, 13.10.2026, p.4: Articoli Indeterminativi / Partitivi Plurali.';
  }

  function patchPair(card, definite, partitive, grammarNote) {
    card.pattern = `<div class="key-rule"><strong>${definite}</strong> = the → <strong>${partitive}</strong> = some</div><div class="article-map"><strong>di + ${definite} = ${partitive}</strong></div>`;
    card.clarification = `Lesson 2 introduced this article family. Lesson 4 now applies it to a complete noun phrase and contrasts definite “the” with partitive/indefinite plural “some”. ${grammarNote}`;
  }

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__ARTICLE_PROGRESSION_V62__) return;

    cards = cards.map(original => {
      const card = { ...original };

      if (card.key === 'italian-l2-def-082') patchL2Def(card, {
        answer: 'I', singular: 'il', some: 'dei', noun: 'libri', gloss: 'books',
        clue: 'Masculine plural before most consonants.',
        rule: '<strong>il → i</strong> in the definite plural; <strong>di + i → dei</strong> for “some”.',
        usage: 'Use <strong>i</strong> with masculine plural nouns beginning with most consonants.'
      });
      if (card.key === 'italian-l2-def-083') patchL2Def(card, {
        answer: 'GLI', singular: 'lo / l’', some: 'degli', noun: 'amici', gloss: 'male or mixed friends',
        clue: 'Masculine plural before a vowel; the same article is used for the special starts that take lo in the singular.',
        rule: '<strong>lo / masculine l’ → gli</strong>; <strong>di + gli → degli</strong> for “some”.',
        usage: 'Use <strong>gli</strong> before masculine plural nouns beginning with a vowel or a special start such as s + consonant, z, gn, ps, pn or x.'
      });
      if (card.key === 'italian-l2-def-084') patchL2Def(card, {
        answer: 'LE', singular: 'la / l’', some: 'delle', noun: 'case', gloss: 'houses',
        clue: 'Feminine plural; the initial sound does not change the article.',
        rule: '<strong>la / feminine l’ → le</strong>; <strong>di + le → delle</strong> for “some”.',
        usage: 'Use <strong>le</strong> with feminine plural nouns, whether they begin with a consonant or vowel.'
      });

      if (card.key === 'italian-l2-indef-090') patchL2Some(card, {
        answer: 'DEI', definite: 'i', noun: 'libri', gloss: 'books',
        clue: 'Masculine plural before most consonants.',
        usage: 'It follows the same ordinary-consonant family as definite plural <strong>i</strong>.'
      });
      if (card.key === 'italian-l2-indef-091') patchL2Some(card, {
        answer: 'DEGLI', definite: 'gli', noun: 'amici', gloss: 'male or mixed friends',
        clue: 'Masculine plural before a vowel or a special start.',
        usage: 'It follows the same vowel/special-start family as definite plural <strong>gli</strong>.'
      });
      if (card.key === 'italian-l2-indef-092') patchL2Some(card, {
        answer: 'DELLE', definite: 'le', noun: 'case', gloss: 'houses',
        clue: 'Feminine plural, before either a consonant or vowel.',
        usage: 'It follows the feminine plural family of definite article <strong>le</strong>.'
      });

      if (card.key === 'italian-l4-plural-article-i') patchL4Def(card, {
        answer: 'i', some: 'dei', noun: 'maestri', gloss: 'male or mixed teachers', grammar: 'masculine plural',
        clue: 'Masculine plural before an ordinary consonant.',
        usage: 'Use <strong>i</strong> with masculine plural nouns beginning with most consonants.'
      });
      if (card.key === 'italian-l4-plural-article-gli') patchL4Def(card, {
        answer: 'gli', some: 'degli', noun: 'amici', gloss: 'male or mixed friends', grammar: 'masculine plural',
        clue: 'Masculine plural before a vowel. Gli is also used for the special starts that take lo in the singular.',
        usage: 'Use <strong>gli</strong> before masculine plural nouns beginning with a vowel or a recognised special start.'
      });
      if (card.key === 'italian-l4-plural-article-le') patchL4Def(card, {
        answer: 'le', some: 'delle', noun: 'maestre', gloss: 'female teachers', grammar: 'feminine plural',
        clue: 'Feminine plural; the starting sound does not change the article.',
        usage: 'Use <strong>le</strong> with all feminine plural nouns.'
      });

      if (card.key === 'italian-l4-plural-article-dei') patchL4Some(card, {
        answer: 'dei', definite: 'i', noun: 'maestri', gloss: 'male or mixed teachers', grammar: 'masculine plural',
        clue: 'Masculine plural before an ordinary consonant; it pairs with definite article i.',
        usage: 'Use <strong>dei</strong> before masculine plural nouns beginning with most consonants.'
      });
      if (card.key === 'italian-l4-plural-article-degli') patchL4Some(card, {
        answer: 'degli', definite: 'gli', noun: 'amici', gloss: 'male or mixed friends', grammar: 'masculine plural',
        clue: 'Masculine plural before a vowel or special start; it pairs with definite article gli.',
        usage: 'Use <strong>degli</strong> before masculine plural nouns beginning with a vowel or a recognised special start.'
      });
      if (card.key === 'italian-l4-plural-article-delle') patchL4Some(card, {
        answer: 'delle', definite: 'le', noun: 'maestre', gloss: 'female teachers', grammar: 'feminine plural',
        clue: 'Feminine plural; it pairs with definite article le.',
        usage: 'Use <strong>delle</strong> with feminine plural nouns, whether they begin with a consonant or vowel.'
      });

      const pairMap = {
        'italian-l4-plural-article-pair-maestri': ['i', 'dei', 'Masculine plural, ordinary consonant.'],
        'italian-l4-plural-article-pair-maestre': ['le', 'delle', 'Feminine plural.'],
        'italian-l4-plural-article-pair-amici': ['gli', 'degli', 'Masculine plural, vowel.'],
        'italian-l4-plural-article-pair-amiche': ['le', 'delle', 'Feminine plural.'],
        'italian-l4-plural-article-pair-stranieri': ['gli', 'degli', 'Masculine plural, s + consonant.'],
        'italian-l4-plural-article-pair-straniere': ['le', 'delle', 'Feminine plural.'],
        'italian-l4-plural-article-pair-zii': ['gli', 'degli', 'Masculine plural, z.'],
        'italian-l4-plural-article-pair-zie': ['le', 'delle', 'Feminine plural.']
      };
      if (pairMap[card.key]) patchPair(card, ...pairMap[card.key]);

      return card;
    });

    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    window.__ARTICLE_PROGRESSION_V62__ = true;
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function wait() {
    if (window.__PRON_V62_READY__ && Array.isArray(cards) && cards.some(card => card.key === 'italian-l2-indef-090')) {
      apply();
      return;
    }
    window.setTimeout(wait, 80);
  }

  wait();
})();
