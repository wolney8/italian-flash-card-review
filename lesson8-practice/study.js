/* Additional guided practice accompanying Lesson 8, 17 November 2026. */
(function (root) {
  'use strict';
  const {topics, bilingual, escape, soundButton} = root.ItalianLesson8;
  const section = (stage, title, titleIt, items) => ({stage, type: 'bullets', title, titleIt, items});
  const example = (italian, english) => '<strong lang="it">' + escape(italian) + '</strong><br><span lang="en" data-ui-no-translate>' + escape(english) + '</span>';
  function question(id, en, it, model, hintEn, hintIt, italian, english, alternatives = [], pronunciation = '') {
    return {
      id: 'l8-' + id, type: 'text', kind: 'word', prompt: bilingual(en, it), model,
      answers: [model, ...alternatives], choices: [], optional_subjects: [], answer_mode: 'accent',
      hint: bilingual(hintEn, hintIt), explanation: '',
      support: {hint: {en: hintEn, it: hintIt, html: ''}, prompt: null,
        lines: [{it: italian, en: english, pron: pronunciation}], pronunciationStatus: pronunciation ? 'Approximate pronunciation guide' : ''}
    };
  }
  function sheet(topic, subtitle, subtitleIt, sections, questions) {
    const meta = topics.find(item => item.key === topic);
    return {
      slug: meta.slug, title: meta.title, titleIt: meta.it, subtitle, subtitleIt,
      intro: bilingual(subtitle, subtitleIt), scope: 'Lesson 8 · Additional practice', lesson: 'L8', courseLesson: 'L8',
      study_sections: sections, questions
    };
  }

  const grammarSections = [
    section('learn', 'Who does what?', 'Chi fa che cosa?', [
      bilingual('Start with the verb. The subject is who or what it agrees with. A direct object is the person or thing the verb acts on directly.',
        'Parti dal verbo. Il soggetto è la persona o la cosa con cui il verbo concorda. Il complemento oggetto indica chi o che cosa è coinvolto direttamente nell’azione.'),
      example('Anna mangia la pizza.', 'Anna eats the pizza. Anna is the subject. Mangia is the verb. What does Anna eat? La pizza is the direct object.'),
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
  const grammarItems = [
    ['g-object', 'Anna mangia la pizza. Copy the whole direct object.', 'Anna mangia la pizza. Copia tutto il complemento oggetto.', 'la pizza', 'What does Anna eat?', 'Che cosa mangia Anna?', 'Anna mangia la pizza.', 'The pizza is what Anna eats.'],
    ['g-place', 'Anna mangia in cucina. Copy the phrase that says where.', 'Anna mangia in cucina. Copia le parole che indicano il luogo.', 'in cucina', 'Look for the preposition and its noun.', 'Cerca la preposizione e il nome.', 'Anna mangia in cucina.', 'In the kitchen tells us where Anna eats.'],
    ['g-no-object', 'Anna mangia in cucina. Does this sentence name what she eats? Type yes or no.', 'Anna mangia in cucina. La frase dice che cosa mangia? Scrivi sì o no.', 'no', 'A location and the thing eaten do different jobs.', 'Il luogo e ciò che si mangia hanno funzioni diverse.', 'Anna mangia in cucina.', 'She eats in the kitchen. No food is named.'],
    ['g-subject', 'Il pane brucia. Copy the whole subject.', 'Il pane brucia. Copia tutto il soggetto.', 'il pane', 'What is burning?', 'Che cosa brucia?', 'Il pane brucia.', 'The bread itself is burning.'],
    ['g-burn', 'Il cuoco brucia il pane. Copy the whole direct object.', 'Il cuoco brucia il pane. Copia tutto il complemento oggetto.', 'il pane', 'What does the cook burn?', 'Che cosa brucia il cuoco?', 'Il cuoco brucia il pane.', 'The cook burns the bread. Here il pane is the object.'],
    ['g-complement', 'Luca è un dottore. Copy the phrase that identifies Luca.', 'Luca è un dottore. Copia le parole che identificano Luca.', 'un dottore', 'After essere, look for the description of the subject.', 'Dopo essere, cerca la descrizione del soggetto.', 'Luca è un dottore.', 'Luca and the doctor are the same person. Un dottore is a subject complement.'],
    ['g-job-verb', 'Che lavoro fai? Copy the verb.', 'Che lavoro fai? Copia il verbo.', 'fai', 'Which word has the tu form?', 'Quale parola è la forma del tu?', 'Che lavoro fai?', 'Fai means you do. Che lavoro is the object.'],
    ['g-noun', 'Che lavoro fai? Copy just the noun meaning job.', 'Che lavoro fai? Copia solo il nome che indica la professione.', 'lavoro', 'Find the thing being asked about.', 'Individua ciò che si chiede.', 'Che lavoro fai?', 'Lavoro names a job here.'],
    ['g-work', 'I work in a restaurant. Complete: ___ in un ristorante.', 'I work in a restaurant. Completa: ___ in un ristorante.', 'lavoro', 'Use the first-person singular of lavorare.', 'Usa la prima persona singolare di lavorare.', 'Lavoro in un ristorante.', 'Lavoro is a verb here.'],
    ['g-fare', 'I work as a doctor. Complete with the article: Faccio ___ dottore.', 'Completa con l’articolo: Faccio ___ dottore.', 'il', 'Use fare + the definite article + the job.', 'Usa fare + articolo determinativo + professione.', 'Faccio il dottore.', 'Use the definite article in this job expression.'],
    ['g-wash', 'I wash the dishes. Choose lavo or lavoro: ___ i piatti.', 'Scegli il verbo per “I wash the dishes”. Lavo o lavoro? ___ i piatti.', 'lavo', 'Which infinitive means “to wash”?', 'Quale infinito significa “to wash”?', 'Lavo i piatti.', 'Lavo comes from lavare, to wash. Lavoro comes from lavorare, to work.'],
    ['g-wood', 'Lavoro il legno. Copy what the speaker works on.', 'Lavoro il legno. Copia il materiale su cui si lavora.', 'il legno', 'Name the material acted on.', 'Individua il materiale lavorato.', 'Lavoro il legno.', 'I work the wood. Here lavorare has a direct object; in Lavoro in un ufficio the phrase gives a place.'],
    ['g-specific-doctor', 'I am Marta’s doctor. Fill the definite article: Sono ___ dottore di Marta.', 'Completa con l’articolo determinativo: Sono ___ dottore di Marta.', 'il', 'This is the particular doctor identified by di Marta.', 'Di Marta identifica un medico preciso.', 'Sono il dottore di Marta.', 'Il identifies a specific doctor. Sono un dottore simply gives a profession.'],
    ['g-how', 'In Come stai? write the English meaning of come.', 'In Come stai? scrivi in inglese il significato di come.', 'how', 'This is a question about someone’s wellbeing.', 'È una domanda sullo stato di una persona.', 'Come stai?', 'How are you?'],
    ['g-as', 'In Lavoro come insegnante, write the English meaning of come.', 'In Lavoro come insegnante, scrivi in inglese il significato di come.', 'as', 'This is the speaker’s actual role.', 'Si tratta del vero ruolo di chi parla.', 'Lavoro come insegnante.', 'I work as a teacher.'],
    ['g-like', 'In Sei come un fratello per me, write the English meaning of come.', 'In Sei come un fratello per me, scrivi in inglese il significato di come.', 'like', 'The speaker compares two people.', 'Chi parla fa un paragone.', 'Sei come un fratello per me.', 'You are like a brother to me.']
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
    const gap = '___' + word.slice(letters.length);
    const bank = word.startsWith('c') ? 'ci / chi / ce / che' : 'gi / ghi / ge / ghe';
    const enPrompt = 'Meaning: ' + en + '. Complete ' + gap + ' with ' + bank + '. It starts like ' + englishSound +
      ', then the Italian vowel ' + letters.slice(-1) + '. Say it aloud and enter just the missing letters.';
    const itPrompt = 'Significato inglese: ' + en + '. Completa ' + gap + ' con ' + bank + '. Il suono iniziale è come in ' +
      englishSound.split(' ').pop() + ' e la vocale è ' + letters.slice(-1) + '. Pronuncia la parola e scrivi solo le lettere mancanti.';
    return question('s-' + id, enPrompt, itPrompt, letters, 'Before e or i, h keeps c or g hard.',
      'Davanti a e o i, h mantiene il suono duro di c o g.', word, en + '. First consonant like ' + englishSound + '.', [], guide);
  });
  const newWords = [
    ['amici','ami___','friends','ci','ah-MEE-chee'],['barche','bar___','boats','che','BAHR-keh'],
    ['funghi','fun___','mushrooms','ghi','FOON-ghee'],['pagine','pa___ne','pages','gi','PAH-jee-neh']
  ];
  newWords.forEach(([word,gap,en,answer,guide]) => soundQuestions.push(question('s-'+word,
    'Say the Italian word for “' + en + '” aloud. Supply the missing letters: ' + gap + '.',
    'Pronuncia la parola italiana per “' + en + '”. Scrivi le lettere mancanti: ' + gap + '.',
    answer, 'Think about the consonant sound and the following vowel.', 'Pensa al suono della consonante e alla vocale che segue.',
    word, en, [], guide)));

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
  const articleQuestions = [];
  // Cycle through meanings so consecutive cards practise different decisions.
  for (let n = 0; n < articles.length; n++) {
    articleFamilies.forEach(({en,it,words,english},family) => {
      const form = articles[n][family], noun = words[n], phrase = form + (form.endsWith('’') ? '' : ' ') + noun;
      articleQuestions.push(question('a-'+family+'-'+n,
        'Write the complete Italian phrase for “' + en + ' ' + english[n] + '”. Use ' + noun + '.',
        'Scrivi l’espressione italiana per “' + en + ' ' + english[n] + '”. Usa ' + noun + ' e ' + it + '.',
        phrase, 'Identify the noun’s gender, number and initial sound before choosing the form.',
        'Individua genere, numero e suono iniziale del nome prima di scegliere la forma.',
        phrase, en + ' ' + english[n] + '.'));
    });
  }
  root.ItalianLesson8.sheets = [
    sheet('grammar', 'Find the subject, object, place or description; use come in context.',
      'Distingui soggetto, oggetto, luogo e descrizione. Usa come nel contesto.', grammarSections, grammarItems.map(item=>question(...item))),
    sheet('sounds', 'Say and spell words with ci, chi, ce, che, gi, ghi, ge and ghe.',
      'Pronuncia e scrivi parole con ci, chi, ce, che, gi, ghi, ge e ghe.', soundSections, soundQuestions),
    sheet('articles', 'Build singular and plural phrases for the, some, in the and from the.',
      'Forma espressioni al singolare e al plurale con articoli, partitivi e preposizioni articolate.', articleSections, articleQuestions)
  ];
})(window);
