/* Article reference and practice based on Laura's Lessons 2–6 and the course's
   article revision. Extra initial-letter examples are labelled in the reference. */
(function (root) {
  'use strict';

  const cases = [
    {
      id: 'masculine-consonant', gender: 'Masculine', start: 'Most consonants, including s + a vowel',
      definiteSingular: 'il', definitePlural: 'i', indefinite: 'un',
      partitiveSingular: 'del', partitivePlural: 'dei',
      examples: {definiteSingular: 'il libro', definitePlural: 'i libri', indefinite: 'un libro', partitiveSingular: 'del pane', partitivePlural: 'dei libri'},
      hint: 'Sapone starts with s + a. It follows the same article pattern as libro.'
    },
    {
      id: 'masculine-special', gender: 'Masculine', start: 's + a consonant, z, gn, ps, x, or consonant-sound i/y',
      definiteSingular: 'lo', definitePlural: 'gli', indefinite: 'uno',
      partitiveSingular: 'dello', partitivePlural: 'degli',
      examples: {definiteSingular: 'lo studente', definitePlural: 'gli studenti', indefinite: 'uno studente', partitiveSingular: 'dello zucchero', partitivePlural: 'degli studenti'},
      hint: 'Studente starts with st. Specchio starts with sp. Both begin with s + another consonant.'
    },
    {
      id: 'masculine-vowel', gender: 'Masculine', start: 'A vowel sound',
      definiteSingular: 'l’', definitePlural: 'gli', indefinite: 'un',
      partitiveSingular: 'dell’', partitivePlural: 'degli',
      examples: {definiteSingular: 'l’amico', definitePlural: 'gli amici', indefinite: 'un amico', partitiveSingular: 'dell’olio', partitivePlural: 'degli amici'},
      hint: 'Un amico has a space and no apostrophe. Amico is masculine.'
    },
    {
      id: 'feminine-consonant', gender: 'Feminine', start: 'A consonant, including s + a consonant and z',
      definiteSingular: 'la', definitePlural: 'le', indefinite: 'una',
      partitiveSingular: 'della', partitivePlural: 'delle',
      examples: {definiteSingular: 'la scuola', definitePlural: 'le scuole', indefinite: 'una scuola', partitiveSingular: 'della pasta', partitivePlural: 'delle scuole'},
      hint: 'Scuola is feminine. Its sc beginning still uses la and una.'
    },
    {
      id: 'feminine-vowel', gender: 'Feminine', start: 'A vowel sound',
      definiteSingular: 'l’', definitePlural: 'le', indefinite: 'un’',
      partitiveSingular: 'dell’', partitivePlural: 'delle',
      examples: {definiteSingular: 'l’amica', definitePlural: 'le amiche', indefinite: 'un’amica', partitiveSingular: 'dell’acqua', partitivePlural: 'delle amiche'},
      hint: 'Un’amica is the shortened form of una amica. The apostrophe replaces the final a.'
    }
  ];

  const specialStarts = [
    {start: 's + consonant', example: 'lo specchio · uno studente', note: 'Look at the letter immediately after s.'},
    {start: 's + vowel', example: 'il sapone · un signore', note: 'S + a vowel follows the ordinary masculine consonant pattern.'},
    {start: 'z', example: 'lo zio · uno zaino', note: 'Use the masculine special-start pattern.'},
    {start: 'gn', example: 'lo gnomo · uno gnomo', note: 'Example from the course’s added article practice.'},
    {start: 'ps', example: 'lo psicologo · uno psicologo', note: 'Example from the course’s added article practice.'},
    {start: 'x', example: 'lo xilofono · uno xilofono', note: 'Extra reference example. Xilofono means xylophone.'},
    {start: 'Consonant-sound i/y', example: 'lo yogurt · uno yogurt', note: 'Extra reference example. The starting sound is like y in yes. A vowel i follows the vowel pattern.'},
    {start: 'pn', example: 'lo pneumatico / il pneumatico', note: 'Both patterns are accepted. Lo/uno/gli/degli is the careful traditional pattern. Il/un/i/dei is common in everyday use.'},
    {start: 'Silent h', example: 'l’hotel · un hotel', note: 'Treat a silent h as a vowel beginning. Loanwords with a pronounced h can vary.'}
  ];

  const notes = [
    {title: 'Choose the meaning first', text: 'The definite article means “the”. The indefinite article means “a” or “an”. The partitive article can mean “some”.'},
    {title: 'Then check the noun', text: 'Choose masculine or feminine, singular or plural, then check the starting sound. A noun ending in -e can have either gender.'},
    {title: 'One thing and several things', text: 'A/an is singular. To change “a book” into “some books”, use un libro → dei libri. Both the article and the noun change.'},
    {title: 'An amount of something', text: 'Use singular partitives with an amount, such as del pane, dello zucchero, della pasta, dell’olio or dell’acqua. Use plural partitives for several countable things, such as dei libri and delle sedie.'},
    {title: 'How partitives are formed', text: 'Combine di with the definite article. Di + il gives del. Di + lo gives dello. Di + l’ gives dell’. Di + la gives della. Di + i gives dei. Di + gli gives degli. Di + le gives delle.'},
    {title: 'The sentence gives the meaning', text: 'In Compro del pane, del means “some”. In il prezzo del pane, it means “of the”. The spelling is the same.'},
    {title: 'Two kinds of un', text: 'Masculine un has no apostrophe, including un amico and un aereo. Feminine una can shorten before a vowel to un’, as in un’amica. The full form una amica is also possible.'}
  ];

  const exercises = [];
  const pluralNouns = new Set(['libri','studenti','amici','sedie','aule','aerei','stivali','macchine','amiche']);
  const it = text => ({label: 'Complete', text, lang: 'it'});
  const en = text => ({label: 'Meaning', text, lang: 'en'});
  const join = (article, noun) => article + (article.endsWith('’') ? '' : ' ') + noun;

  function gap(id, group, noun, meaning, answer, choices, hint, explanation, caseId, alternatives) {
    const word = group === 'definite' ? '“the”' : group === 'indefinite' ? '“a” or “an”' : '“some”';
    const row = {
      id, group, number: pluralNouns.has(noun) ? 'plural' : 'singular',
      type: choices ? 'choice' : 'text', format: choices ? 'choice-gap' : 'type-gap',
      task: (choices ? 'Choose' : 'Type') + ' the missing article meaning ' + word + '.',
      stimulus: [it('___ ' + noun), en(meaning)], answer, hint,
      explanation: join(answer, noun) + '. ' + explanation, caseId
    };
    if (choices) row.choices = choices;
    if (alternatives) row.alternatives = alternatives;
    exercises.push(row);
  }

  // Definite articles. These contrasts include each gender, number and starting pattern.
  gap('the-book', 'definite', 'libro', 'the book', 'il', ['lo','il','la'],
    'Libro is masculine and singular. It starts with an ordinary consonant.',
    'Use il before most masculine singular nouns beginning with a consonant.', 'masculine-consonant');
  gap('the-soap', 'definite', 'sapone', 'the soap', 'il', ['lo','la','il'],
    'Sapone is masculine. The letter after s is a vowel.',
    'S + a vowel follows the ordinary consonant pattern.', 'masculine-consonant');
  gap('the-gentleman', 'definite', 'signore', 'the gentleman', 'il', ['il','lo','l’'],
    'Signore is masculine and singular. Look at the i after s.',
    'S + i uses the ordinary masculine article.', 'masculine-consonant');
  gap('the-student', 'definite', 'studente', 'the student, male', 'lo', ['il','l’','lo'],
    'Studente is masculine. It begins with s followed by t.',
    'A masculine noun beginning with s + a consonant takes lo.', 'masculine-special');
  gap('the-mirror', 'definite', 'specchio', 'the mirror', 'lo', ['lo','il','la'],
    'Specchio is masculine and singular. Check its sp beginning.',
    'Sp is s + a consonant, so use lo.', 'masculine-special');
  gap('the-uncle', 'definite', 'zio', 'the uncle', 'lo', ['il','lo','l’'],
    'Zio is masculine. Z belongs to the special starting group.',
    'A masculine singular noun starting with z takes lo.', 'masculine-special');
  gap('the-gnome', 'definite', 'gnomo', 'the gnome', 'lo', ['l’','il','lo'],
    'Gnomo is masculine. The gn sound follows the special-start pattern.',
    'Use lo before masculine singular gn.', 'masculine-special');
  gap('the-psychologist', 'definite', 'psicologo', 'the psychologist, male', 'lo', ['lo','l’','il'],
    'Psicologo is masculine. Check the ps beginning.',
    'Use lo before masculine singular ps.', 'masculine-special');
  gap('the-friend-male', 'definite', 'amico', 'the friend, male', 'l’', ['lo','l’','il'],
    'Amico is masculine and singular. It starts with a vowel.',
    'Before this vowel, the singular definite article shortens to l’.', 'masculine-vowel');
  gap('the-school', 'definite', 'scuola', 'the school', 'la', ['lo','l’','la'],
    'Scuola is feminine. Check gender before looking at sc.',
    'Feminine consonant words use la, including scuola.', 'feminine-consonant');
  gap('the-aunt', 'definite', 'zia', 'the aunt', 'la', ['la','lo','l’'],
    'Zia is feminine and singular. The masculine z rule applies to masculine nouns.',
    'Use la for a feminine singular noun beginning with a consonant.', 'feminine-consonant');
  gap('the-friend-female', 'definite', 'amica', 'the friend, female', 'l’', ['la','l’','lo'],
    'Amica is feminine and singular. It begins with a vowel.',
    'The feminine singular article shortens before the vowel.', 'feminine-vowel');
  gap('the-books', 'definite', 'libri', 'the books', 'i', ['gli','le','i'],
    'Libri is masculine and plural. The singular phrase is il libro.',
    'Il becomes i in the plural.', 'masculine-consonant');
  gap('the-students', 'definite', 'studenti', 'the students, male or a mixed group', 'gli', ['i','gli','le'],
    'Studenti is masculine and plural. Keep the st starting pattern.',
    'Lo studente becomes gli studenti.', 'masculine-special');
  gap('the-friends-male', 'definite', 'amici', 'the friends, male or a mixed group', 'gli', null,
    'Amici is masculine and plural. It starts with a vowel.',
    'Masculine plural nouns beginning with a vowel use gli.', 'masculine-vowel');
  gap('the-chairs', 'definite', 'sedie', 'the chairs', 'le', null,
    'Sedie is feminine and plural. The singular is la sedia.',
    'Feminine plural nouns use le.', 'feminine-consonant');
  gap('the-classrooms', 'definite', 'aule', 'the classrooms', 'le', null,
    'Aule is feminine and plural. Its vowel does not require an apostrophe in the plural.',
    'Feminine plural le stays whole before a vowel.', 'feminine-vowel');
  gap('the-planes', 'definite', 'aerei', 'the planes', 'gli', null,
    'Aerei is masculine and plural, beginning with a vowel.',
    'L’aereo becomes gli aerei.', 'masculine-vowel');
  gap('the-boots', 'definite', 'stivali', 'the boots', 'gli', null,
    'Stivali is masculine and plural. Its first two letters are st.',
    'Lo stivale becomes gli stivali.', 'masculine-special');
  gap('the-cars', 'definite', 'macchine', 'the cars', 'le', null,
    'Macchine is feminine and plural. The singular is la macchina.',
    'La becomes le in the plural.', 'feminine-consonant');

  function plural(id, group, from, meaning, answer, hint, explanation) {
    exercises.push({id, group, number: 'plural', type: 'text', format: 'one-to-many',
      task: 'Change the phrase to mean “' + meaning + '”. Write the whole Italian phrase.',
      stimulus: [{label: 'One', text: from, lang: 'it'}], answer, hint, explanation});
  }
  plural('the-one-to-many-book','definite','il libro','the books','i libri',
    'Change the article and the noun. Libro is masculine.', 'Il becomes i and libro becomes libri.');
  plural('the-one-to-many-mirror','definite','lo specchio','the mirrors','gli specchi',
    'Keep the masculine sp starting pattern when choosing the plural article.', 'Lo specchio becomes gli specchi.');
  plural('the-one-to-many-island','definite','l’isola','the islands','le isole',
    'Isola is feminine. Check both the article and the noun ending.', 'The plural is le isole. Le stays whole before the vowel.');
  plural('the-one-to-many-friend','definite','l’amico','the friends, male or a mixed group','gli amici',
    'Amico is masculine. Its plural is amici.', 'A masculine plural noun starting with a vowel takes gli.');

  // Un' is the shortened feminine form. Typed answers also accept full una before a vowel.
  gap('a-book','indefinite','libro','a book','un',['uno','un','una'],
    'Libro is masculine and begins with an ordinary consonant.', 'Use un for a masculine singular noun in this group.', 'masculine-consonant');
  gap('a-gentleman','indefinite','signore','a gentleman','un',['un','uno','un’'],
    'Signore is masculine. Its s is followed by a vowel.', 'S + a vowel uses un.', 'masculine-consonant');
  gap('a-student','indefinite','studente','a student, male','uno',['un','una','uno'],
    'Studente is masculine. Its st beginning needs the special form.', 'Use uno before a masculine singular noun beginning with s + a consonant.', 'masculine-special');
  gap('a-mirror','indefinite','specchio','a mirror','uno',['uno','un','un’'],
    'Specchio is masculine and starts with sp.', 'Uno goes with masculine s + a consonant.', 'masculine-special');
  gap('a-backpack','indefinite','zaino','a backpack','uno',['un','uno','una'],
    'Zaino is masculine. Z uses the special starting pattern.', 'Use uno before a masculine singular noun beginning with z.', 'masculine-special');
  gap('a-gnome','indefinite','gnomo','a gnome','uno',['un’','un','uno'],
    'Gnomo is masculine and begins with gn.', 'Use uno before masculine gn.', 'masculine-special');
  gap('a-friend-male','indefinite','amico','a friend, male','un',['un','un’','uno'],
    'Amico is masculine. Compare un amico with the feminine un’amica.', 'Masculine un has no apostrophe before a vowel.', 'masculine-vowel');
  gap('a-school','indefinite','scuola','a school','una',['uno','una','un’'],
    'Scuola is feminine and starts with a consonant.', 'Feminine consonant nouns use una, including words starting with sc.', 'feminine-consonant');
  gap('a-friend-female','indefinite','amica','a friend, female','un’',['un','uno','un’'],
    'Amica is feminine. Choose the shortened form of una.', 'The shortened feminine form keeps an apostrophe.', 'feminine-vowel');
  gap('a-classroom','indefinite','aula','a classroom','un’',['un’','un','uno'],
    'Aula is feminine. Choose the shortened form used before its vowel.', 'Un’aula is the shortened form of una aula.', 'feminine-vowel');
  gap('a-plane','indefinite','aereo','a plane','un',null,
    'Aereo is masculine and begins with a vowel.', 'Write un aereo with no apostrophe.', 'masculine-vowel');
  gap('a-psychologist','indefinite','psicologo','a psychologist, male','uno',null,
    'Psicologo is masculine and starts with ps.', 'Use uno before masculine ps.', 'masculine-special');
  gap('a-chair','indefinite','sedia','a chair','una',null,
    'Sedia is feminine and singular.', 'Use una before a feminine noun starting with a consonant.', 'feminine-consonant');
  gap('an-aunt','indefinite','zia','an aunt','una',null,
    'Zia is feminine. The Italian noun starts with z.', 'Use una because zia is feminine and starts with a consonant.', 'feminine-consonant');
  gap('a-wave','indefinite','onda','a wave','un’',null,
    'Onda is feminine and starts with a vowel. You can shorten una.', 'Un’onda is the shortened form. Una onda is also grammatically possible.', 'feminine-vowel',['una']);
  gap('an-office','indefinite','ufficio','an office','un',null,
    'Ufficio is masculine. Its starting vowel does not add an apostrophe to un.', 'The phrase is un ufficio.', 'masculine-vowel');

  // Singular food nouns make the amount meaning explicit. Plurals name countable things.
  gap('some-bread','partitive','pane','some bread','del',['dello','del','della'],
    'Pane is masculine. You are asking for an amount of bread.', 'Di + il gives del for an unspecified amount.', 'masculine-consonant');
  gap('some-sugar','partitive','zucchero','some sugar','dello',['del','della','dello'],
    'Zucchero is masculine. Its z beginning uses lo.', 'Di + lo gives dello. Sugar is an amount here.', 'masculine-special');
  gap('some-oil','partitive','olio','some oil','dell’',['dell’','del','dello'],
    'Olio is masculine and singular. It begins with a vowel.', 'Di + l’ gives dell’ before olio.', 'masculine-vowel');
  gap('some-pasta','partitive','pasta','some pasta','della',['del','della','dello'],
    'Pasta is feminine. You are asking for an amount.', 'Di + la gives della.', 'feminine-consonant');
  gap('some-water','partitive','acqua','some water','dell’',['della','dello','dell’'],
    'Acqua is feminine and starts with a vowel.', 'Di + l’ gives dell’. Use the singular for an amount of water.', 'feminine-vowel');
  gap('some-books','partitive','libri','some books','dei',['dei','degli','delle'],
    'Libri is masculine and plural. The definite phrase is i libri.', 'Di + i gives dei for some books.', 'masculine-consonant');
  gap('some-students','partitive','studenti','some students, male or a mixed group','degli',['dei','degli','delle'],
    'Studenti is masculine and plural. Check its st beginning.', 'Di + gli gives degli.', 'masculine-special');
  gap('some-friends-male','partitive','amici','some friends, male or a mixed group','degli',['dei','delle','degli'],
    'Amici is masculine and plural and begins with a vowel.', 'The definite phrase is gli amici. Di + gli gives degli amici.', 'masculine-vowel');
  gap('some-chairs','partitive','sedie','some chairs','delle',['delle','dei','degli'],
    'Sedie is feminine and plural.', 'Di + le gives delle for feminine plurals.', 'feminine-consonant');
  gap('some-friends-female','partitive','amiche','some friends, female','delle',['degli','delle','dell’'],
    'Amiche is feminine and plural. The plural article stays whole before the vowel.', 'Delle is used with all feminine plural nouns.', 'feminine-vowel');

  const combinations = [
    ['il','del','masculine singular, most consonants'],
    ['lo','dello','masculine singular, special starting sounds'],
    ['l’','dell’','singular, before a vowel'],
    ['la','della','feminine singular, before a consonant'],
    ['i','dei','masculine plural, most consonants'],
    ['gli','degli','masculine plural, special starts or vowels'],
    ['le','delle','feminine plural']
  ];
  combinations.forEach(([article,answer,rule],index) => exercises.push({
    id: 'combine-di-' + index, group: 'partitive', number: index < 4 ? 'singular' : 'plural', type: 'text', format: 'combine',
    task: 'Join di and the article. Write the combined form.',
    stimulus: [{label: 'Join', text: 'di + ' + article, lang: 'it'}], answer,
    hint: 'The article is for ' + rule + '.',
    explanation: 'Di + ' + article + ' gives ' + answer + '.'
  }));

  plural('some-divani','partitive','un divano','some sofas','dei divani',
    'Divano is masculine. Its plural is divani.', 'Use dei before a masculine plural noun with an ordinary consonant.');
  plural('some-aerei','partitive','un aereo','some planes','degli aerei',
    'Aereo is masculine and begins with a vowel. Its plural is aerei.', 'A masculine plural beginning with a vowel uses degli.');
  plural('some-specchi','partitive','uno specchio','some mirrors','degli specchi',
    'Specchio is masculine. Keep its sp starting pattern.', 'Uno specchio becomes degli specchi.');
  plural('some-cravatte','partitive','una cravatta','some ties','delle cravatte',
    'Cravatta is feminine. Change its final a to e.', 'Feminine plural nouns use delle for some.');
  plural('some-aule','partitive','un’aula','some classrooms','delle aule',
    'Aula is feminine. Its plural is aule.', 'Feminine plural delle stays whole before a vowel.');
  plural('some-ponti','partitive','un ponte','some bridges','dei ponti',
    'Ponte is masculine even though it ends in e. Its plural is ponti.', 'Un ponte becomes dei ponti.');
  plural('some-torri','partitive','una torre','some towers','delle torri',
    'Torre is feminine even though it ends in e. Its plural is torri.', 'Una torre becomes delle torri.');

  function rule(id, task, stimulus, answer, choices, hint, explanation) {
    exercises.push({id,group:'rules',type:'choice',format:'reason',task,
      stimulus: stimulus ? [{text:stimulus,lang:'it'}] : [], answer,choices,hint,explanation});
  }
  rule('rule-s-consonant','Which word begins with s followed by another consonant?',null,
    'studente',['sapone','studente','signore'],'Look at the second letter in each word.',
    'Studente begins st. Sapone begins sa and signore begins si.');
  rule('rule-s-vowel','Which word begins with s followed by a vowel?',null,
    'sapone',['specchio','studente','sapone'],'Check the letter immediately after s.',
    'Sapone begins sa. A is a vowel, so the masculine articles are il and un.');
  rule('rule-sc-feminine','Why does this phrase use la?', 'la scuola',
    'Scuola is feminine.',['Scuola is feminine.','Every sc word uses la.','Scuola is plural.'],
    'Gender is the first thing to check.', 'The special lo rule applies to masculine nouns. Feminine scuola uses la.');
  rule('rule-uno-student','Why does this phrase use uno?', 'uno studente',
    'It is masculine and starts with st.',['It ends in e.','It is masculine and starts with st.','It is plural.'],
    'Consider the gender and the first two letters.', 'Studente is masculine and st is s + a consonant.');
  rule('rule-un-amico','Which phrase means “a male friend”?',null,
    'un amico',['un’amico','uno amico','un amico'],'Masculine un keeps its spelling before a vowel.',
    'Un amico is masculine. Write a space, with no apostrophe.');
  rule('rule-un-amica','Which shortened phrase means “a female friend”?',null,
    'un’amica',['un’amica','un amica','uno amica'],'Shorten the feminine article una before the vowel.',
    'The a of una drops and leaves an apostrophe in un’amica.');
  rule('rule-plural-feminine-vowel','Why is the article still le before amiche?', 'le amiche',
    'Le stays whole before a plural noun.',['Amiche is masculine.','Le stays whole before a plural noun.','The noun is singular.'],
    'Check whether the friends are one or several.', 'Feminine plural le keeps its vowel and has no apostrophe.');
  rule('rule-which-plural','Which phrase means “the friends”, all female?',null,
    'le amiche',['gli amiche','l’amiche','le amiche'],'The noun is feminine and plural.',
    'Feminine plurals use le, including nouns starting with a vowel.');
  rule('rule-amount','Which phrase refers to an amount of food?',null,
    'del pane',['del pane','dei libri','delle sedie'],'Find the item you would measure as an amount.',
    'Del pane means some bread. The other phrases refer to several countable things.');
  rule('rule-count','Which phrase refers to several countable things?',null,
    'dei libri',['della pasta','dei libri','dell’acqua'],'Look for a plural noun.',
    'Dei libri means some books. Pasta and water are amounts in these phrases.');
  rule('rule-di-gli','Which two words form degli?',null,
    'di + gli',['di + le','di + i','di + gli'],'Think of the definite article in gli studenti.',
    'Di + gli gives degli.');
  rule('rule-of-the','What does del mean in this phrase?', 'il prezzo del pane',
    'of the',['of the','some','a'], 'The phrase is about the price belonging to the bread.',
    'Il prezzo del pane means the price of the bread. Here del joins di and il.');
  rule('rule-some','What does del mean in this sentence?', 'Compro del pane.',
    'some',['the','some','from the'],'The speaker is buying an unspecified amount.',
    'Compro del pane means I buy some bread.');
  rule('rule-un-plural','Which phrase means “some books”?', 'un libro → ___',
    'dei libri',['un libri','degli libri','dei libri'],'Change both the article and the noun to refer to several.',
    'The plural phrase meaning some books is dei libri.');
  rule('rule-gender-e','Why does this phrase use delle?', 'delle torri',
    'Torri is feminine and plural.',['Torri is feminine and plural.','Every noun ending in i is masculine.','It begins with a vowel.'],
    'The singular phrase is una torre.', 'Gender comes from the noun. Torre is feminine and its plural torri uses delle.');
  rule('rule-z-feminine','Choose the correct pair of phrases.',null,
    'uno zio · una zia',['un zio · uno zia','uno zio · una zia','un’zio · un’zia'],
    'Zio is masculine and zia is feminine. Both are singular.',
    'The masculine z pattern uses uno. Feminine zia uses una.');

  function dayNumber(value) {
    const text = value instanceof Date ? value.getFullYear() + '-' +
      String(value.getMonth() + 1).padStart(2,'0') + '-' + String(value.getDate()).padStart(2,'0') : String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) throw new TypeError('Use a date in YYYY-MM-DD format.');
    const milliseconds = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (new Date(milliseconds).toISOString().slice(0,10) !== text) throw new TypeError('Use a valid calendar date.');
    return Math.floor(milliseconds / 86400000);
  }

  const englishRuleAnswers = new Set([
    'rule-sc-feminine','rule-uno-student','rule-plural-feminine-vowel',
    'rule-of-the','rule-some','rule-gender-e'
  ]);
  // Apostrophe styles are equivalent. An apostrophe itself remains significant.
  for (const exercise of exercises) {
    if (exercise.group === 'rules') exercise.answerLang = englishRuleAnswers.has(exercise.id) ? 'en' : 'it';
    if (exercise.type === 'text' && exercise.answer.includes('’')) {
      exercise.alternatives = [...(exercise.alternatives || []), exercise.answer.replaceAll('’', "'")];
    }
  }

  function randomGenerator(seed) {
    let state = seed || 1;
    return function random() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function sample(pool, count, random) {
    const shuffled = [...pool];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled.slice(0, count);
  }

  function daily(date = new Date(), group = 'all', round = 0) {
    if (!Number.isInteger(round) || round < 0) throw new TypeError('Use a non-negative round number.');
    const day = dayNumber(date);
    const random = randomGenerator(Math.imul(day + 1, 2654435761) ^ Math.imul(round + 1, 2246822519));
    const pool = name => exercises.filter(row => row.group === name);
    const take = (rows, count) => sample(rows, count, random);
    const definite = pool('definite');
    const indefinite = pool('indefinite');
    const partitive = pool('partitive');
    const rules = pool('rules');
    const definiteSingular = definite.filter(row => row.number === 'singular');
    const definitePlural = definite.filter(row => row.number === 'plural' && row.format !== 'one-to-many');
    const definiteChange = definite.filter(row => row.format === 'one-to-many');
    const amounts = partitive.filter(row => row.number === 'singular' && row.format !== 'combine');
    const counts = partitive.filter(row => row.number === 'plural' && row.format !== 'combine');
    const combinations = partitive.filter(row => row.format === 'combine');
    let rows;
    if (group === 'definite') {
      rows = [...take(definiteSingular,5), ...take(definitePlural,3), ...take(definiteChange,2)];
    } else if (group === 'indefinite') {
      // A/an is singular. Mix selecting an article with recalling it in writing.
      rows = [...take(indefinite.filter(row => row.type === 'choice'),6), ...take(indefinite.filter(row => row.type === 'text'),4)];
    } else if (group === 'partitive') {
      rows = [...take(amounts,4),
        ...take(counts.filter(row => row.format !== 'one-to-many'),2),
        ...take(counts.filter(row => row.format === 'one-to-many'),2),
        ...take(combinations.filter(row => row.number === 'singular'),1),
        ...take(combinations.filter(row => row.number === 'plural'),1)];
    } else if (group === 'rules') {
      rows = take(rules,10);
    } else if (group === 'all') {
      rows = [...take(definiteSingular,1), ...take(definitePlural,1), ...take(definiteChange,1),
        ...take(indefinite.filter(row => row.type === 'choice'),1), ...take(indefinite.filter(row => row.type === 'text'),1),
        ...take(amounts,1), ...take(counts,1), ...take(combinations,1), ...take(rules,2)];
    } else {
      return [];
    }
    return sample(rows,10,random);
  }

  root.ItalianArticleGuide = {cases,specialStarts,notes,exercises,daily};
})(window);
