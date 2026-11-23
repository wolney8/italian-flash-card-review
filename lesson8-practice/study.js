/* Additional guided practice accompanying Lesson 8, 17 November 2026. */
(function (root) {
  'use strict';
  const {topics, bilingual, escape, soundButton} = root.ItalianLesson8;
  const section = (stage, title, titleIt, items) => ({stage, type: 'bullets', title, titleIt, items});
  const example = (italian, english) => '<strong lang="it">' + escape(italian) + '</strong><br><span lang="en" data-ui-no-translate>' + escape(english) + '</span>';
  const line = (label, text, lang = 'it') => ({label, text, lang});
  function question(id, task, stimulus, model, hintEn, hintIt, italian, english, alternatives = [], pronunciation = '') {
    // The full text fallback also preserves the instruction and each distinct line.
    const prompt = '<span lang="en" data-ui-no-translate>' + escape(task) + '</span>' +
      stimulus.map(row => '<br>' + (row.label ? '<span lang="en">' + escape(row.label) + '</span> · ' : '') +
        '<span lang="' + row.lang + '">' + escape(row.text) + '</span>').join('');
    return {
      id: 'l8-' + id, type: 'text', kind: 'word', task, stimulus, prompt, model,
      answers: [model, ...alternatives], choices: [], optional_subjects: [], answer_mode: 'accent',
      hint: bilingual(hintEn, hintIt), explanation: '',
      support: {hint: {en: hintEn, it: hintIt, html: ''}, prompt: null,
        lines: [{it: italian, en: english, pron: pronunciation}], pronunciationStatus: pronunciation ? 'Approximate pronunciation guide' : ''}
    };
  }
  function sheet(topic, subtitle, subtitleIt, sections, questions) {
    const meta = topics.find(item => item.key === topic);
    return {
      slug: meta.slug, title: 'Extra practice · ' + meta.title, titleIt: 'Esercizi aggiuntivi · ' + meta.it, subtitle, subtitleIt, sourceKind: 'Extra practice',
      intro: bilingual(subtitle, subtitleIt), scope: 'Lesson 8 · Additional practice', lesson: 'L8', courseLesson: 'L8',
      study_sections: sections, questions
    };
  }

  const grammarSections = [
    section('learn', 'Who does what?', 'Chi fa che cosa?', [
      bilingual('Start with the verb. The subject is who or what it agrees with. A direct object is the person or thing the verb acts on directly.',
        'Parti dal verbo. Il soggetto è la persona o la cosa con cui il verbo concorda. Il complemento oggetto indica chi o che cosa è coinvolto direttamente nell’azione.'),
      example('Anna mangia la pizza.', 'Anna eats the pizza. Anna is the subject. Mangia is the verb. What does Anna eat? La pizza is the direct object.'),
      example('Che cosa mangia Anna? / Dove mangia Anna?', 'What does Anna eat? / Where does Anna eat? First decide whether you are asking for food or for a place.'),
      example('Saluto Anna. / Telefono ad Anna.', 'I greet Anna. / I phone Anna. Saluto chi? Anna directly answers who I greet. A chi telefono? The verb telefonare needs a before the person I ring.'),
      example('Anna mangia in cucina.', 'Anna eats in the kitchen. In cucina says where she eats. Mangiare can take an object, but this sentence leaves it unstated.'),
      example('Lavo i piatti. / Lavoro in un ufficio. / Lavoro il legno.', 'I wash the dishes (lavare). / I work in an office (lavorare). / I work the wood (lavorare). In un ufficio gives the workplace. Il legno is what I shape or work on.'),
      example('Il cuoco brucia il pane. / Il pane brucia.', 'The cook burns the bread. / The bread burns. The first use is transitive: the bread is the direct object. The second use is intransitive: the bread is the subject and there is no direct object.'),
      example('Luca è un dottore.', 'Luca is a doctor. Un dottore identifies Luca. A phrase that names or describes the subject after essere is a subject complement.')
    ]),
    section('examples', 'Jobs, articles and come', 'Professioni, articoli e come', [
      example('Che lavoro fai? / Lavoro in un ufficio.', 'What job do you do? / I work in an office. Lavoro is a noun in the question and a verb in the answer. In the question, fai already tells us the subject is tu.'),
      example('Sono un dottore. / Sono il dottore di Marta. / Faccio il dottore.', 'I’m a doctor. / I’m Marta’s doctor. / I work as a doctor. Essere can introduce a profession, also without an article. Fare takes the definite article in this job expression.'),
      example('Come stai? / Lavoro come insegnante. / Sei come un fratello per me.', 'How are you? / I work as a teacher. / You’re like a brother to me. Come introduces a question, a real role or a comparison.'),
      bilingual('English uses “as” in different ways too. “I work as a teacher” names a role. “She is as tall as me” compares height. Italian can express that comparison with È alta quanto me.',
        'Anche “as” in inglese ha funzioni diverse. “I work as a teacher” indica un ruolo. “She is as tall as me” fa un paragone di altezza: È alta quanto me.'),
      example('Faccio l’insegnante e lavoro in una scuola.', 'I’m a teacher and I work in a school. You can also say Lavoro come insegnante in una scuola.')
    ])
  ];
  const grammarQuestions = [
    question("g-object", "Complete the reply with the food Anna eats. Write “the pizza” in Italian.",
      [line("Speaker A", "Che cosa mangia Anna?"), line("Speaker B", "Mangia ___.")], "la pizza",
      "Pizza is feminine and singular. Include the word for “the”.", "Pizza è femminile e singolare. Aggiungi l’articolo determinativo.",
      "Anna mangia la pizza.", "Anna eats the pizza. What does she eat? The pizza is the direct object."),
    question("g-place", "Say where Anna eats. Fill the gap with “in the kitchen” in Italian.",
      [line("Speaker A", "Dove mangia Anna?"), line("Speaker B", "Mangia ___.")], "in cucina",
      "Dove means “where”. For this room, Italian uses in followed by the room name.", "Dove introduce una domanda sul luogo. Per questa stanza usa in davanti al nome.",
      "Anna mangia in cucina.", "Anna eats in the kitchen. In cucina tells us where."),
    question("g-no-object", "Complete the reply with the food Anna eats. Write the article and the noun in Italian.",
      [line("Situation", "Anna is eating a sandwich.", "en"), line("Speaker A", "Che cosa mangia Anna?"), line("Speaker B", "Mangia ___.")], "un panino",
      "Panino means “sandwich”. For one sandwich, use the masculine singular article meaning “a”.", "Panino è maschile singolare. Qui serve l’articolo indeterminativo.",
      "Mangia un panino.", "She eats a sandwich. What does she eat? A sandwich is the direct object.", ["un tramezzino"]),
    question("g-subject", "Say what is burning. Write “the bread” in Italian.",
      [line("Speaker A", "Che cosa brucia nel forno?"), line("Speaker B", "___!")], "il pane",
      "Pane is masculine and singular. Here the bread itself is burning.", "Pane è maschile e singolare. È il pane stesso che brucia.",
      "Il pane brucia nel forno.", "The bread is burning in the oven. The bread is the subject."),
    question("g-burn", "Say what the cook burns. Fill the gap with “the bread” in Italian.",
      [line("", "Il cuoco brucia ___.")], "il pane",
      "What does the cook burn? Include the article before pane.", "Che cosa brucia il cuoco? Metti l’articolo prima di pane.",
      "Il cuoco brucia il pane.", "The cook burns the bread. This time the bread is the direct object."),
    question("g-complement", "Say you are a doctor. Write “a doctor” in Italian using dottore.",
      [line("Speaker A", "C’è un medico sul treno?"), line("Speaker B", "Sì, sono ___.")], "un dottore",
      "Dottore is masculine and begins with a single consonant.", "Dottore è maschile e inizia con una consonante semplice.",
      "Sì, sono un dottore.", "Yes, I’m a doctor. Un dottore tells us who the speaker is."),
    question("g-job-verb", "Ask a friend about their job. Write the missing form of fare.",
      [line("Speaker A", "Che lavoro ___?"), line("Speaker B", "Faccio il cuoco.")], "fai",
      "One friend takes tu. Choose the present form that goes with tu.", "Per parlare con un amico usa la forma del presente per tu.",
      "Che lavoro fai?", "What do you do for a living? Fai means “you do”."),
    question("g-noun", "Ask what someone does for work. Write the Italian noun for “job”.",
      [line("Speaker A", "Che ___ fai?"), line("Speaker B", "Faccio la farmacista.")], "lavoro",
      "Fai supplies the verb. The missing noun names the work someone does.", "Fai è il verbo. Manca il nome che indica la professione.",
      "Che lavoro fai?", "What job do you do? Lavoro means “job” here."),
    question("g-work", "Say where you work. Write the missing form of lavorare.",
      [line("Speaker A", "Dove lavori?"), line("Speaker B", "___ in un ristorante.")], "lavoro",
      "The speaker means “I work”. Use the io ending of a regular -are verb.", "Chi risponde parla di sé. Usa la desinenza di io per un verbo regolare in -are.",
      "Lavoro in un ristorante.", "I work in a restaurant. Lavoro means “I work” here."),
    question("g-fare", "Give the doctor’s job title with fare. Write the Italian word for “the”.",
      [line("Speaker A", "Che lavoro fai?"), line("Speaker B", "Faccio ___ dottore.")], "il",
      "Dottore is masculine, singular and starts with d.", "Dottore è maschile singolare e inizia con d.",
      "Faccio il dottore.", "I work as a doctor. Italian uses a definite article with fare and a job."),
    {...question("g-wash", "Choose the verb that means “I wash”.",
      [line("", "Dopo cena ___ i piatti.")], "lavo",
      "Lavare means “to wash”. Lavorare means “to work”.", "Lavare significa “to wash”. Lavorare significa “to work”.",
      "Dopo cena lavo i piatti.", "After dinner I wash the dishes."), type: 'choice', choices: ['lavoro', 'lavo']},
    question("g-wood", "Say which material the carpenter works with. Write “the wood” in Italian.",
      [line("", "Sono un falegname. Lavoro ___.")], "il legno",
      "Legno is masculine singular. Include the definite article.", "Legno è maschile singolare. Aggiungi l’articolo determinativo.",
      "Lavoro il legno.", "I work the wood. The wood is the material I shape."),
    question("g-specific-doctor", "Identify Marta’s particular doctor. Write the Italian word for “the”.",
      [line("", "Sono ___ dottore di Marta.")], "il",
      "Here dottore refers to one specific man. It starts with d.", "Qui dottore indica una persona precisa. È maschile singolare e inizia con d.",
      "Sono il dottore di Marta.", "I’m Marta’s doctor."),
    question("g-how", "Complete the question with the Italian word for “how”.",
      [line("", "___ stai oggi?")], "come",
      "Someone might answer this question with sto bene.", "Una possibile risposta a questa domanda è sto bene.",
      "Come stai oggi?", "How are you today? Come asks how somebody feels."),
    question("g-as", "Say that you work as a teacher. Write the word meaning “as”.",
      [line("", "Lavoro ___ insegnante.")], "come",
      "Use the expression lavorare + a linking word + the job title.", "Usa la costruzione lavorare + una parola di collegamento + il nome della professione.",
      "Lavoro come insegnante.", "I work as a teacher. Come introduces a role."),
    question("g-like", "Compare a friend to a brother. Write the Italian word for “like”.",
      [line("", "Sei ___ un fratello per me.")], "come",
      "The speaker is comparing two people.", "Chi parla fa un confronto fra due persone.",
      "Sei come un fratello per me.", "You’re like a brother to me. Come introduces a comparison."),
  ];

  const sounds = [
    ['ci','cibo','food','CHEE-boh','ch in chip','ci'],
    ['chi','chilo','kilo','KEE-loh','k in key','chi'],
    ['ce','cena','dinner','CHEH-nah','ch in chip','ce'],
    ['che','che','what','keh','k in key','che'],
    ['gi','giro','turn / trip','JEE-roh','j in jam','gi'],
    ['ghi','ghiro','dormouse','GHEE-roh','g in go','ghi'],
    ['ge','gelato','ice cream','jeh-LAH-toh','j in jam','ge'],
    ['ghe','ghepardo','cheetah','gheh-PAR-doh','g in go','ghe']
  ];
  const soundSections = [
    section('learn', 'C and G before E or I', 'C e G davanti a E o I', [
      bilingual('In these examples, c before e or i sounds like ch in chip. G before e or i sounds like j in jam.',
        'In questi esempi c davanti a e o i ha il suono dolce di cena e cibo. G davanti a e o i ha il suono dolce di gelato e giro.'),
      bilingual('Add a silent h to keep the hard sound. Che and chi start with k. Ghe and ghi start with the g of go.',
        'Una h muta conserva il suono duro. Che e chi iniziano col suono di c in casa. Ghe e ghi iniziano col suono di g in gatto.'),
      bilingual('Say each Italian word before revealing or playing its model. Capitals in a written guide show stress.',
        'Pronuncia ogni parola italiana prima di mostrare o ascoltare il modello. Le maiuscole nella guida indicano la sillaba accentata.')
    ]),
    section('examples', 'Read, listen and repeat', 'Leggi, ascolta e ripeti', sounds.map(([pattern,word,en,guide]) =>
      example(word, en) + '<br><span class="l8-reading">' + escape(guide) + '</span><br>' + soundButton(word)))
  ];
  const soundQuestions = sounds.map(([id,word,en,guide,englishSound,letters]) => {
    const gaps = {ci:'Il ___bo è buono.', chi:'Un ___lo di pane, per favore.', ce:'La ___na è pronta.',
      che:'___ lavoro fai?', gi:'Facciamo un ___ro?', ghi:'Il ___ro dorme.', ge:'Vorrei un ___lato.', ghe:'Il ___pardo corre.'};
    const bank = {ci:'ci / chi',chi:'ci / chi',ce:'ce / che',che:'ce / che',gi:'gi / ghi',ghi:'gi / ghi',ge:'ge / ghe',ghe:'ge / ghe'};
    const hintEn = 'Say the first sound, like ' + englishSound + '. A hard sound needs h before e or i.';
    const hintIt = 'Pronuncia il suono iniziale, come in ' + (letters.includes('h') ? (word.startsWith('c') ? 'casa' : 'gatto') : (word.startsWith('c') ? 'cena' : 'gelato')) + '. Davanti a e o i il suono duro vuole h.';
    const task = 'Write the missing letters. Choose ' + bank[id].replace(' / ', ' or ') + ' to spell the word for “' + en + '”.';
    return question('s-' + id, task, [line('', gaps[id])], letters, hintEn, hintIt,
      word, en + '. First consonant like ' + englishSound + '.', [], guide);
  });
  const newWords = [
    ['amici','Ho due ami___.','friends','ci','ah-MEE-chee','ci / chi','ch in chip','cena'],
    ['barche','Vedo due bar___.','boats','che','BAHR-keh','ce / che','k in key','casa'],
    ['funghi','Vorrei una pizza con i fun___.','mushrooms','ghi','FOON-ghee','gi / ghi','g in go','gatto'],
    ['pagine','Leggo due pa___ne.','pages','gi','PAH-jee-neh','gi / ghi','j in jam','gelato']
  ];
  newWords.forEach(([word,gap,en,answer,guide,bank,sound,model]) => {
    const task = 'Write the missing letters. Choose ' + bank.replace(' / ', ' or ') + ' to spell the word for “' + en + '”.';
    soundQuestions.push(question('s-'+word, task, [line('', gap)], answer,
      'The missing letters start like ' + sound + '. Say the whole word, then write the missing letters.',
      'Il suono è quello di ' + model + '. Pronuncia la parola e scrivi le lettere mancanti.', word,en,[],guide));
  });

  const articles = [
    ['il','del','nel','dal'],['lo','dello','nello','dallo'],['l’','dell’','nell’','dall’'],
    ['la','della','nella','dalla'],['i','dei','nei','dai'],['gli','degli','negli','dagli'],['le','delle','nelle','dalle']
  ];
  const articleSections = [
    section('learn', 'Build the four families', 'Forma le quattro serie', [
      bilingual('First pick the definite article using the noun’s gender, number and first sound. Then use the matching form of di, in or da joined to that article.',
        'Scegli l’articolo determinativo in base al genere, al numero e al suono iniziale del nome. Poi combina di, in o da con quell’articolo.'),
      example('il libro → i libri · lo studente → gli studenti · la casa → le case', 'The book → the books. The student → the students. The house → the houses.'),
      example('l’amico → gli amici · l’amica → le amiche', 'Before a vowel, both genders can use l’ in the singular. In the plural, masculine uses gli and feminine uses le.'),
      bilingual('Use singular partitives for an unspecified amount (del pane, some bread) and plural partitives for an unspecified number (dei libri, some books). In another sentence those same di + article forms can mean “of the”.',
        'Usa il partitivo singolare per una quantità imprecisata (del pane) e il plurale per un numero imprecisato (dei libri). In altri contesti, le stesse forme possono indicare “di” + articolo.')
    ]),
    {stage:'learn', type:'table', title:'Article and combined forms', titleIt:'Articolo e forme articolate',
      headers:['the','some','in the','from the'], headersIt:['articolo','partitivo','in + articolo','da + articolo'], rows:articles},
    section('examples', 'Which meaning fits?', 'Qual è il significato?', [
      example('Prendo del pane. / Il prezzo del pane.', 'I take some bread. / The price of the bread. Context tells you whether del means “some” or “of the”.'),
      example('Entro nella scuola. / Esco dalla scuola.', 'I go into the school. / I come out of the school. In + la becomes nella. Da + la becomes dalla.'),
      example('Lavoro in ospedale. / Lavoro nell’ospedale vicino a casa.', 'I work in hospital. / I work in the hospital near my home. The specific hospital takes the article.'),
      example('negli uffici / dalle farmacie', 'In the offices / from the pharmacies. Keep the noun plural when you combine the preposition and the article.')
    ])
  ];
  const articleFamilies = [
    {en:'the', it:'l’articolo determinativo', words:['libro','studente','amica','casa','libri','amici','amiche'], english:['book','student','female friend','house','books','male friends','female friends']},
    {en:'some', it:'il partitivo', words:['pane','zucchero','olio','pasta','libri','studenti','mele'], english:['bread','sugar','oil','pasta','books','students','apples']},
    {en:'in the', it:'in + articolo', words:['negozio','studio','ufficio','scuola','negozi','uffici','scuole'], english:['shop','studio','office','school','shops','offices','schools']},
    {en:'from the', it:'da + articolo', words:['negozio','studio','aula','banca','negozi','studi','banche'], english:['shop','studio','classroom','bank','shops','studios','banks']}
  ];
  // Each gap asks for the whole phrase. Its sentence supplies the intended
  // meaning of di, in or da; the supplied noun keeps the answer unambiguous.
  const articleFrames = [
    ['___ è sul tavolo.', '___ arriva alle otto.', '___ di Marta si chiama Sara.', '___ è grande.',
      '___ sono sul tavolo.', '___ di Paolo arrivano domani.', '___ di Sara sono qui.'],
    ['Vorrei ___, per favore.', 'Nel caffè metto ___.', 'Nell’insalata metto ___.', 'A pranzo mangio ___.',
      'In biblioteca prendo ___.', 'Oggi incontro ___.', 'Al mercato compro ___.'],
    ['Il regalo è ___ vicino a casa.', 'Il quadro è ___ di Luca.', 'La cartella è ___ di Anna.', 'La riunione è ___ del paese.',
      'I saldi iniziano ___ del centro.', 'Ci sono computer ___ del comune.', 'Oggi si vota ___ del paese.'],
    ['Esco ___ vicino a casa.', 'Luca esce ___ del dentista.', 'Gli studenti escono ___.', 'Anna esce ___.',
      'I clienti escono ___ del centro.', 'Gli artisti escono ___ al piano terra.', 'I clienti escono ___ del centro.']
  ];
  const familyHints = [
    ['Which article means “the” here?','Quale articolo determinativo serve?'],
    ['For “some”, join di to the article.','Per il partitivo, unisci di e l’articolo.'],
    ['For “in the”, join in to the article.','Per dire dove, unisci in e l’articolo.'],
    ['For “from the”, join da to the article.','Per dire da dove, unisci da e l’articolo.']
  ];
  const articleQuestions = [];
  for (let n = 0; n < articles.length; n++) {
    articleFamilies.forEach(({en,words,english},family) => {
      const form = articles[n][family], noun = words[n], phrase = form + (form.endsWith('’') ? '' : ' ') + noun;
      const gloss = en + ' ' + english[n], frame = articleFrames[family][n];
      const feminine = n === 3 || n === 6 || noun === 'amica' || noun === 'aula';
      const initial = noun.startsWith('st') || noun.startsWith('sc') ? noun.slice(0,2) : noun[0];
      const hintEn = 'The noun is ' + (feminine ? 'feminine' : 'masculine') + (n < 4 ? ' singular' : ' plural') + ' and starts with ' + initial + '. ';
      const hintIt = 'Il nome è ' + (feminine ? 'femminile' : 'maschile') + (n < 4 ? ' singolare' : ' plurale') + ' e inizia per ' + initial + '. ';
      articleQuestions.push(question('a-'+family+'-'+n,
        'Write “' + gloss + '” in Italian. Include the noun ' + noun + ' in your answer.', [line('', frame)],
        phrase, hintEn + familyHints[family][0], hintIt + familyHints[family][1],
        frame.replace('___',phrase), gloss + '.'));
    });
  }
  root.ItalianLesson8.sheets = [
    ...root.ItalianLesson8.buildCoreSheets({question, example, section, line}),
    sheet('grammar', 'Complete short kitchen and workplace conversations.',
      'Completa brevi conversazioni in cucina e sul lavoro.', grammarSections, grammarQuestions),
    sheet('sounds', 'Say and spell words with ci, chi, ce, che, gi, ghi, ge and ghe.',
      'Pronuncia e scrivi parole con ci, chi, ce, che, gi, ghi, ge e ghe.', soundSections, soundQuestions),
    sheet('articles', 'Build singular and plural phrases for the, some, in the and from the.',
      'Forma espressioni al singolare e al plurale con articoli, partitivi e preposizioni articolate.', articleSections, articleQuestions)
  ];
})(window);
