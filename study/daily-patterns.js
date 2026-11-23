/* Daily practice with the house, people, food and sound words from the course. */
(function (root) {
  'use strict';

  const topics = [
    {id:'articles', title:'Articles', description:'Choose the, a, an or some. Change one thing into several.'},
    {id:'sounds', title:'Pronouncing C and G', description:'Say the Italian word, then choose its sound or spelling.'},
    {id:'prepositions', title:'In, on and from', description:'Build phrases such as nel libro, sul tavolo and da una scuola.'}
  ];

  const it = text => ({text, lang:'it'});
  const en = text => ({text, lang:'en'});
  const phrase = (form, noun) => form + (form.endsWith('’') ? '' : ' ') + noun;

  // The same groups apply to “the”, “some”, and the joined prepositions.
  const commonForms = {
    il:  {some:'del',   in:'nel',   su:'sul',   da:'dal'},
    lo:  {some:'dello', in:'nello', su:'sullo', da:'dallo'},
    'l’':{some:'dell’', in:'nell’', su:'sull’', da:'dall’'},
    la:  {some:'della', in:'nella', su:'sulla', da:'dalla'},
    i:   {some:'dei',   in:'nei',   su:'sui',   da:'dai'},
    gli: {some:'degli', in:'negli', su:'sugli', da:'dagli'},
    le:  {some:'delle', in:'nelle', su:'sulle', da:'dalle'}
  };

  // singular, plural, singular article, plural article, “a/an”, gender, starting sound
  const countNouns = [
    ['libro','libri','il','i','un','masculine','l'],
    ['panino','panini','il','i','un','masculine','p'],
    ['studente','studenti','lo','gli','uno','masculine','s followed by t'],
    ['zaino','zaini','lo','gli','uno','masculine','z'],
    ['specchio','specchi','lo','gli','uno','masculine','s followed by p'],
    ['gnomo','gnomi','lo','gli','uno','masculine','gn'],
    ['psicologo','psicologi','lo','gli','uno','masculine','ps'],
    ['amico','amici','l’','gli','un','masculine','a vowel'],
    ['ufficio','uffici','l’','gli','un','masculine','a vowel'],
    ['sedia','sedie','la','le','una','feminine','s followed by a vowel'],
    ['scuola','scuole','la','le','una','feminine','s followed by c'],
    ['amica','amiche','l’','le','un’','feminine','a vowel'],
    ['aula','aule','l’','le','un’','feminine','a vowel']
  ];

  const massNouns = [
    ['pane','bread','il','masculine','p'],
    ['zucchero','sugar','lo','masculine','z'],
    ['olio','oil','l’','masculine','a vowel'],
    ['pasta','pasta','la','feminine','p'],
    ['acqua','water','l’','feminine','a vowel']
  ];

  function articleExercises() {
    const rows = [];
    for (const [noun,plural,singularThe,pluralThe,indefinite,gender,start] of countNouns) {
      const singularHint = 'The noun is ' + gender + ', singular, and starts with ' + start + '.';
      const pluralHint = 'The noun is ' + gender + ', plural, and starts with ' + start + '.';
      const some = commonForms[pluralThe].some;
      const add = (kind,task,stimulus,answer,hint,explanation,choices) =>
        rows.push({id:'articles-' + noun + '-' + kind,skill:kind === 'a' ? 'indefinite' : kind.startsWith('the-') ? 'definite' : 'partitive',task,stimulus,answer,hint,explanation,choices});

      add('the-one','Fill the gap with the Italian word for “the”.',[it('___ ' + noun)],singularThe,
        singularHint,phrase(singularThe,noun) + '. ' + singularHint);
      add('a','Choose the Italian form for “a” or “an”.',[it('___ ' + noun)],indefinite,
        singularHint,phrase(indefinite,noun) + '. ' + (start === 'a vowel'
          ? (gender === 'masculine' ? 'Masculine un has no apostrophe.' : 'Una loses its final a before a vowel. Keep the apostrophe.')
          : singularHint),['un','uno','una','un’']);
      add('the-many','Fill the gap with the Italian word for “the”.',[it('___ ' + plural)],pluralThe,
        pluralHint,phrase(singularThe,noun) + ' becomes ' + phrase(pluralThe,plural) + '.');
      add('some','Fill the gap with the Italian word for “some”.',[it('___ ' + plural)],some,
        'Start with the plural article for “the”. Join di to that article.',
        'di + ' + pluralThe + ' gives ' + some + '. The full phrase is ' + phrase(some,plural) + '.');
      add('one-to-some','Change this to “some”. Write the article and the plural noun.',
        [it(phrase(indefinite,noun))],phrase(some,plural),
        'The plural of ' + noun + ' is ' + plural + '. Choose the matching partitive article.',
        'Italian has no plural form of ' + indefinite + '. To say “some”, use ' + phrase(some,plural) + '.');
    }
    for (const [noun,meaning,article,gender,start] of massNouns) {
      const some = commonForms[article].some;
      rows.push({id:'articles-amount-' + noun,skill:'partitive',task:'Fill the gap with the Italian word for “some”.',
        stimulus:[en('I would like some ' + meaning + '.'),it('Vorrei ___ ' + noun + '.')],answer:some,
        hint:'Use a singular partitive for an amount. This noun is ' + gender + ' and starts with ' + start + '.',
        explanation:'di + ' + article + ' gives ' + some + '. ' + phrase(some,noun) + ' means “some ' + meaning + '”.'});
    }
    return rows;
  }

  const sounds = {
    k:{example:'key', rule:'Before a, o or u, c sounds like k in key.'},
    ch:{example:'chip', rule:'Before e or i, c sounds like ch in chip.'},
    g:{example:'go', rule:'Before a, o or u, g sounds like g in go.'},
    j:{example:'jam', rule:'Before e or i, g sounds like j in jam.'}
  };
  // Word, gloss, letters to practise, phonetic group.
  const startingSounds = [
    ['casa','house','ca','k'],['corso','course','co','k'],['cubo','cube','cu','k'],
    ['cena','dinner','ce','ch'],['cibo','food','ci','ch'],
    ['che','what','che','k'],['chilo','kilo','chi','k'],
    ['gatto','cat','ga','g'],['gola','throat','go','g'],['gufo','owl','gu','g'],
    ['gelato','ice cream','ge','j'],['giro','turn','gi','j'],
    ['ghepardo','cheetah','ghe','g'],['ghiro','dormouse','ghi','g']
  ];
  // Use the gap as shown, including cases where the letters are inside the word.
  const soundGaps = [
    ['cena','dinner','___na','ce','che','ch'],['che','what','___','che','ce','k'],
    ['cibo','food','___bo','ci','chi','ch'],['chilo','kilo','___lo','chi','ci','k'],
    ['gelato','ice cream','___lato','ge','ghe','j'],['ghepardo','cheetah','___pardo','ghe','ge','g'],
    ['giro','turn','___ro','gi','ghi','j'],['ghiro','dormouse','___ro','ghi','gi','g'],
    ['amici','friends','ami___','ci','chi','ch'],['amiche','female friends','ami___','che','ce','k'],
    ['barche','boats','bar___','che','ce','k'],['funghi','mushrooms','fun___','ghi','gi','g'],
    ['pagine','pages','pa___ne','gi','ghi','j']
  ];
  function soundRule(letters, group) {
    if (letters.includes('h')) {
      return 'The h is silent. It keeps ' + letters[0] + ' hard before ' + letters.slice(-1) + '.';
    }
    return sounds[group].rule;
  }
  function soundExercises() {
    const rows = startingSounds.map(([word,meaning,letters,group]) => ({
      id:'sounds-read-' + word,word,answerLang:'en', task:'Say the Italian word. Which English word starts with the same sound?',
      stimulus:[it(word),en(meaning)], answer:sounds[group].example,
      choices:letters[0] === 'c' ? ['key','chip'] : ['jam','go'],
      hint:'Look at the letters ' + letters + ' at the start of the word.',
      explanation:word + ' starts like ' + sounds[group].example + '. ' + soundRule(letters,group)
    }));
    for (const [word,meaning,gap,letters,other,group] of soundGaps) {
      const pair = [letters,other].sort((left,right) => left.length - right.length);
      rows.push({id:'sounds-spell-' + word,word,task:'Choose the missing letters to spell the Italian word.',
        stimulus:[en(meaning),it(gap)],answer:letters,choices:pair,
        hint:'Say the missing sound like the first sound in ' + sounds[group].example + '.',
        explanation:word + ' means “' + meaning + '”. ' + soundRule(letters,group)});
    }
    return rows;
  }

  // Each preposition has an article, noun and English gloss. Keep the phrases natural
  // for each preposition (e.g. on the chair, from the school, in the office).
  const placePhrases = {
    in:[
      ['il','libro','book'],['lo','zaino','rucksack'],['l’','ufficio','office'],['la','scuola','school'],
      ['i','negozi','shops'],['gli','uffici','offices'],['le','scuole','schools']
    ],
    su:[
      ['il','tavolo','table'],['lo','specchio','mirror'],['l’','aereo','plane'],['la','sedia','chair'],
      ['i','tavoli','tables'],['gli','aerei','planes'],['le','sedie','chairs']
    ],
    da:[
      ['il','negozio','shop'],['lo','studio','studio'],['l’','aula','classroom'],['la','banca','bank'],
      ['i','negozi','shops'],['gli','studi','studios'],['le','banche','banks']
    ]
  };
  const fromOne = [
    ['negozio','un','from a shop'],['studio','uno','from a studio'],['ufficio','un','from an office'],
    ['scuola','una','from a school'],['aula','un’','from a classroom']
  ];
  function prepositionExercises() {
    const rows = [];
    const meanings = {in:'in the',su:'on the',da:'from the'};
    for (const [prep,entries] of Object.entries(placePhrases)) {
      for (const [article,noun,gloss] of entries) {
        const word = commonForms[article][prep];
        rows.push({id:'prepositions-' + prep + '-' + noun,
          task:'Fill the gap with the Italian form for “' + meanings[prep] + '”.',
          stimulus:[en(meanings[prep] + ' ' + gloss),it('___ ' + noun)],answer:word,
          hint:'Start with ' + phrase(article,noun) + '. Join ' + prep + ' to the article.',
          explanation:prep + ' + ' + article + ' gives ' + word + '. The full phrase is ' + phrase(word,noun) + '.'});
      }
    }
    for (const [noun,article,gloss] of fromOne) {
      const word = 'da ' + article;
      rows.push({id:'prepositions-from-one-' + noun,task:'Write the Italian words for “from a” or “from an”.',
        stimulus:[en(gloss),it('___ ' + noun)],answer:word,
        hint:'The preposition da stays separate from the indefinite article. Choose the article for ' + noun + '.',
        explanation:phrase(word,noun) + '. Keep a space after da.'});
    }
    return rows;
  }

  const banks = {articles:articleExercises, sounds:soundExercises, prepositions:prepositionExercises};
  function exercises(topic) {
    const id = typeof topic === 'string' ? topic : topic && topic.id;
    if (!Object.hasOwn(banks,id)) return [];
    return banks[id]().map(row => {
      if (row.answer.includes('’')) row.answers = [row.answer,row.answer.replaceAll('’',"'")];
      return row;
    });
  }
  root.ItalianDailyPatterns = {topics,exercises};
})(window);
