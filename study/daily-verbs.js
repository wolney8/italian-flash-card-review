/* Present indicative. The course source describes where a verb was encountered;
   an example in a lesson does not imply that the whole paradigm was assigned. */
(function (root) {
  'use strict';

  const endings = {
    are: ['o', 'i', 'a', 'iamo', 'ate', 'ano'],
    ere: ['o', 'i', 'e', 'iamo', 'ete', 'ono'],
    ire: ['o', 'i', 'e', 'iamo', 'ite', 'ono']
  };
  const reflexives = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];
  const classPractice = 'Class and homework';
  const familyExample = 'Conjugation-family example';
  const expression = 'Course expression';
  const extension = 'Extra practice';
  const lesson7 = 'Lesson 7 regular -are class sheet and homework';
  const families = 'Lesson 7 minutes and three-conjugation table';
  const lesson8 = 'Lesson 8 fare and stare class sheet and homework';
  const phrases = 'Lesson 6 minutes, useful questions and expressions';
  const objects = 'Lesson 8 extra practice, direct objects';

  function irregular(name, meaning, forms, coverage, source, example, translation) {
    return { name, meaning, kind: 'irregular', forms, coverage, source, example, translation };
  }

  function regular(name, meaning, coverage, source, example, translation, options = {}) {
    const infinitive = options.reflexive ? name.slice(0, -2) + 'e' : name;
    const family = infinitive.slice(-3);
    const stem = infinitive.slice(0, -3);
    const parts = endings[family].map((ending, index) => {
      let writtenStem = stem;
      if (options.isc && ![3, 4].includes(index)) writtenStem += 'isc';
      if (ending.startsWith('i')) {
        if (options.singleI) writtenStem = writtenStem.slice(0, -1);
        if (options.hardC) writtenStem += 'h';
      }
      const particle = options.reflexive ? reflexives[index] + ' ' : '';
      return { stem: particle + writtenStem, ending };
    });
    const forms = parts.map(part => part.stem + part.ending);
    return { name, meaning, kind: 'regular', forms, family, parts, coverage, source, example, translation, ...options };
  }

  const verbs = [
    irregular('essere', 'to be', ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'], classPractice, 'Lesson 6 essere class sheet and homework', 'Di dove sei?', 'Where are you from?'),
    irregular('avere', 'to have', ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], classPractice, 'Lesson 4 avere class sheet and homework', 'Quanti anni hai?', 'How old are you?'),
    irregular('fare', 'to do or make', ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'], classPractice, lesson8, 'Che lavoro fai?', 'What do you do for a living?'),
    irregular('stare', 'to be, feel or stay', ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'], classPractice, lesson8, 'Come stai?', 'How are you?'),
    irregular('venire', 'to come', ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'], expression, 'Lesson 3 dialogues about where someone comes from', 'Da dove vieni?', 'Where do you come from?'),
    irregular('andare', 'to go', ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'], expression, 'Lesson 4 avere homework, exercise 2', 'Vado a Roma.', 'I am going to Rome.'),
    regular('chiamarsi', 'to be called', expression, 'Lessons 1 and 3 introductions', 'Come ti chiami?', 'What is your name?', {reflexive: true}),
    regular('lavorare', 'to work', classPractice, lesson7, 'Lavoro in un ufficio.', 'I work in an office.'),
    regular('parlare', 'to speak', classPractice, lesson7, 'Parlo inglese e italiano.', 'I speak English and Italian.'),
    regular('abitare', 'to live or reside', classPractice, lesson7, 'Abiti a Roma?', 'Do you live in Rome?'),
    regular('studiare', 'to study', classPractice, lesson7, 'Studiamo lo spagnolo.', 'We study Spanish.', {singleI: true}),
    regular('mangiare', 'to eat', classPractice, lesson7, 'Maria mangia una pizza.', 'Maria eats a pizza.', {singleI: true}),
    regular('vivere', 'to live', familyExample, 'Lesson 3 residence and Lesson 7 conjugation table', 'Vivo a Roma.', 'I live in Rome.'),
    regular('vedere', 'to see', familyExample, 'Lesson 7 slide 9 and Lesson 8 slide 2, -ere examples', 'Vedo la scuola.', 'I can see the school.'),
    regular('leggere', 'to read', familyExample, 'Lesson 7 conjugation table and verb-matching homework', 'Leggo un libro.', 'I read a book.'),
    regular('scrivere', 'to write', familyExample, 'Lesson 7 conjugation table and Lesson 6 classroom expressions', 'Come si scrive?', 'How is it spelt?'),
    regular('dormire', 'to sleep', familyExample, 'Lesson 7 conjugation table and verb-matching homework', 'Il bambino dorme.', 'The child is sleeping.'),
    regular('aprire', 'to open', familyExample, families, 'Apro la porta.', 'I open the door.'),
    regular('finire', 'to finish', familyExample, families, 'Finisco il libro.', 'I finish the book.', {isc: true}),
    irregular('dire', 'to say or tell', ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'], expression, phrases, 'Come si dice in italiano?', 'How do you say it in Italian?'),
    regular('significare', 'to mean', expression, phrases, 'Che cosa significa “letto”?', 'What does “letto” mean?', {hardC: true}),
    irregular('potere', 'to be able to', ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'], expression, phrases, 'Può ripetere, per favore?', 'Could you repeat that, please?'),
    regular('ripetere', 'to repeat', expression, phrases, 'Puoi ripetere, per favore?', 'Can you repeat that, please?'),
    irregular('volere', 'to want', ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'], expression, 'Lesson 4 avere homework, exercise 2 and word help', 'Vuoi il tè o il caffè?', 'Do you want tea or coffee?'),
    irregular('dare', 'to give', ['do', 'dai', 'dà', 'diamo', 'date', 'danno'], expression, 'Lesson 6 paired speaking, switching to tu', 'Posso darle del tu?', 'May I use tu with you?'),
    regular('capire', 'to understand', expression, 'Lesson 6 classroom phrase Non ho capito uses the past tense. The table gives the present', 'Non capisco.', 'I do not understand.', {isc: true}),
    regular('scusare', 'to excuse', expression, 'Lesson 6 pairs scusa and scusi as requests. The table gives the present indicative', 'Scuso il ritardo.', 'I excuse the delay.'),
    irregular('uscire', 'to go out or leave', ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'], expression, 'Lesson 4 avere class sheet, exercise 10, and Lesson 8 extra practice on from the', 'Esco dal negozio.', 'I am leaving the shop.'),
    irregular('dispiacere', 'to cause regret or displeasure', ['dispiaccio', 'dispiaci', 'dispiace', 'dispiacciamo', 'dispiacete', 'dispiacciono'], expression, 'Lesson 8 fare and stare class dialogue. Mi dispiace is the everyday expression to remember', 'Mi dispiace!', 'I’m sorry! Literally, it saddens me.'),
    irregular('bere', 'to drink', ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono'], extension, 'Lesson 1 word-order flashcard, worked example', 'Io bevo caffè.', 'I drink coffee.'),
    regular('lavare', 'to wash', extension, objects, 'Lavo i piatti.', 'I wash the dishes.'),
    regular('salutare', 'to greet', extension, objects, 'Saluto Anna.', 'I greet Anna.'),
    regular('telefonare', 'to phone', extension, objects, 'Telefono ad Anna.', 'I phone Anna.'),
    regular('bruciare', 'to burn', extension, objects, 'Il pane brucia.', 'The bread is burning.', {singleI: true})
  ];

  // Keep formal address separate from talking about a woman, even though the forms agree.
  const people = [
    {key: 'io', label: 'io', gloss: 'I', index: 0, hint: 'The speaker is talking about themself.'},
    {key: 'tu', label: 'tu', gloss: 'you, one person informally', index: 1, hint: 'Use tu when talking to one person informally.'},
    {key: 'lui', label: 'lui', gloss: 'he', index: 2, hint: 'You are talking about one man.'},
    {key: 'lei', label: 'lei', gloss: 'she', index: 2, hint: 'You are talking about one woman.'},
    {key: 'formal', label: 'Lei', gloss: 'you, one person politely', index: 2, hint: 'Polite Lei takes the same verb form as lui and lei.'},
    {key: 'noi', label: 'noi', gloss: 'we', index: 3, hint: 'The group includes the speaker.'},
    {key: 'voi', label: 'voi', gloss: 'you, more than one person', index: 4, hint: 'You are speaking directly to a group.'},
    {key: 'loro', label: 'loro', gloss: 'they', index: 5, hint: 'You are talking about other people.'}
  ];

  function optionsFor(values, index) {
    // Choose nearby competing forms, including voi/loro. Rotate where the correct choice appears.
    const alternatives = [];
    for (const step of [1, 5, 2, 3, 4]) {
      const value = values[(index + step) % 6];
      if (value !== values[index] && !alternatives.includes(value)) alternatives.push(value);
      if (alternatives.length === 2) break;
    }
    alternatives.splice(index % (alternatives.length + 1), 0, values[index]);
    return alternatives;
  }

  function endingHelp(verb, index) {
    if (verb.isc) return [3, 4].includes(index) ? 'Noi and voi use the short stem ' + verb.name.slice(0, -3) + '-.' : 'The stem includes isc for this person.';
    if (verb.singleI && [1, 3].includes(index)) return 'The stem and ending share a single written i.';
    if (verb.hardC && [1, 3].includes(index)) return 'The h keeps the c hard before an ending that starts with i.';
    if (verb.reflexive) return 'The reflexive pronoun is already in the cue.';
    return 'Use the present endings for -' + verb.family + ' verbs.';
  }

  function rowsForPerson(verb, person) {
    const index = person.index;
    const form = verb.forms[index];
    const id = 'verb-' + verb.name + '-' + person.key;
    // Keep each language on its own line for speech and accessible reading order.
    const stimulus = [ {label: 'Subject', text: person.label, lang: 'it'}, {label: 'Meaning', text: person.gloss, lang: 'en'} ];
    const explanation = person.label + ' ' + form + '. ' + person.hint;
    const rows = [
      {id: id + '-match', skill: 'match', type: 'choice', task: 'Choose the form of ' + verb.name + ' (' + verb.meaning + ') for this subject.', stimulus, answer: form, choices: optionsFor(verb.forms, index), hint: person.hint, explanation},
      {id: id + '-whole', skill: 'whole', type: 'text', task: 'Write the whole present form of ' + verb.name + ' (' + verb.meaning + ').', stimulus, answer: form, hint: verb.reflexive ? 'Include the reflexive pronoun before the verb.' : person.hint, explanation}
    ];
    if (verb.kind === 'regular') {
      const {stem, ending} = verb.parts[index];
      const line = person.label + ' ' + stem + '___';
      rows.push({id: id + '-ending', skill: 'ending', type: 'text', task: 'Write only the missing ending of ' + verb.name + '.', stimulus: [{label: 'Complete', text: line, lang: 'it'}, {label: 'Subject', text: person.gloss, lang: 'en'}], answer: ending, hint: endingHelp(verb, index), explanation: stem + ' + ' + ending + ' gives ' + form + '.'});
    }
    return rows;
  }

  // Reverse the matching task. Group all valid subjects for the same written form,
  // especially sono, to avoid asking the learner to guess between io and loro.
  function matchSubjects(verb) {
    const labels = ['io', 'tu', 'lui / lei / Lei', 'noi', 'voi', 'loro'];
    const subjects = verb.forms.map(form => labels.filter((label, index) => verb.forms[index] === form).join(' / '));
    return verb.forms.flatMap((form, index) => {
      if (verb.forms.indexOf(form) !== index) return [];
      const answer = subjects[index];
      return [{
        id: 'verb-' + verb.name + '-subject-' + index, type: 'choice', skill: 'match',
        task: 'Choose the subject that fits this form of ' + verb.name + '. If several fit, choose the group.',
        stimulus: [{label: 'Verb form', text: form, lang: 'it'}],
        answer, choices: optionsFor(subjects, index),
        hint: 'Think about who is doing the action. Voi means you are speaking to a group. Loro means you are talking about them.',
        explanation: form + ' goes with ' + answer + '.'
      }];
    });
  }

  // Traditional pronouns remain useful for reading a table. Use a verb with natural non-human subjects.
  function traditionalSubjects(verb) {
    if (verb.name !== 'essere') return [];
    return [
      ['esso', 'it, masculine singular', 2], ['essa', 'it, feminine singular', 2],
      ['essi', 'they, masculine plural', 5], ['esse', 'they, feminine plural', 5]
    ].map(([label, meaning, index]) => ({
      id: 'verb-essere-' + label + '-recognise', skill: 'match', type: 'choice',
      task: 'Which form of essere goes with this pronoun in a grammar table?',
      stimulus: [{label: 'Pronoun', text: label, lang: 'it'}, {label: 'Meaning', text: meaning, lang: 'en'}],
      answer: verb.forms[index], choices: optionsFor(verb.forms, index), hint: 'Decide whether the pronoun stands for one thing or several.',
      explanation: label + ' ' + verb.forms[index] + '. ' + (index === 2 ? 'Esso and essa use the same form as lui and lei.' : 'Essi and esse use the same form as loro.')
    }));
  }

  // These cues practise the same kinds of short questions and gaps as the sheets.
  // Both the English meaning and the Italian line identify the intended person.
  const contexts = {
    essere: [1, 'Di dove ___?', 'Where are you from? (one friend)', 'You are asking a friend about their origin.'],
    avere: [5, 'Loro ___ vent’anni.', 'They are twenty years old.', 'Italian uses avere when giving an age.'],
    fare: [4, 'Voi ___ sport?', 'Do you play sport? (several people)', 'You are asking a group directly.'],
    stare: [2, 'Come ___, signora?', 'How are you, madam?', 'Use the form for polite Lei.'],
    venire: [1, 'Da dove ___?', 'Where do you come from? (one friend)', 'The question uses tu.'],
    andare: [0, '___ a Roma.', 'I am going to Rome.', 'The speaker is describing their own journey.'],
    chiamarsi: [1, 'Come ___?', 'What is your name? (one friend)', 'Include the reflexive pronoun in the gap.'],
    lavorare: [2, 'Marco ___ in un ristorante.', 'Marco works in a restaurant.', 'Marco is one person, like lui.'],
    parlare: [4, 'Voi ___ italiano?', 'Do you speak Italian? (several people)', 'The question is addressed to a group.'],
    abitare: [5, 'Loro ___ a Londra.', 'They live in London.', 'The speaker is talking about a group.'],
    studiare: [3, 'Noi ___ lo spagnolo.', 'We study Spanish.', 'The group includes the speaker.'],
    mangiare: [2, 'Maria ___ una pizza.', 'Maria eats a pizza.', 'Maria is one person, like lei.'],
    vivere: [0, '___ a Roma.', 'I live in Rome.', 'Use the form for io.'],
    potere: [2, '___ ripetere, per favore?', 'Can you repeat that, please? (polite)', 'You are politely asking one person.'],
    volere: [1, '___ il tè o il caffè?', 'Do you want tea or coffee? (one friend)', 'You are offering one friend a drink.'],
    vedere: [0, '___ la scuola.', 'I can see the school.', 'Use the present form for io.'],
    capire: [0, 'Non ___.', 'I do not understand.', 'Use the present tense. The classroom phrase Non ho capito describes a past event.'],
    scusare: [0, '___ il ritardo.', 'I excuse the delay.', 'Use the present form for io.'],
    uscire: [5, 'Gli studenti ___ dall’aula.', 'The students are leaving the classroom.', 'You are talking about several students. Think of loro.'],
    dispiacere: [2, 'Mi ___!', 'I’m sorry!', 'Think of the Italian wording as “it saddens me”. Mi means “to me”.'],
    bere: [0, 'Io ___ caffè.', 'I drink coffee.', 'In the course example, caffè is what the speaker drinks.'],
    lavare: [0, '___ i piatti.', 'I wash the dishes.', 'The verb here is lavare, to wash.'],
    salutare: [0, '___ Anna.', 'I greet Anna.', 'The speaker is greeting someone.'],
    telefonare: [0, '___ ad Anna.', 'I phone Anna.', 'The speaker calls someone on the phone.'],
    bruciare: [2, 'Il pane ___.', 'The bread is burning.', 'The bread is the singular subject.']
  };

  function sentencePractice(verb) {
    const cue = contexts[verb.name];
    if (!cue) return [];
    const [person, sentence, meaning, hint] = cue;
    const answer = verb.forms[person];
    return [{
      id: 'verb-' + verb.name + '-sentence', type: 'text', skill: 'whole',
      task: 'Fill the gap with the present form of ' + verb.name + '.',
      stimulus: [{label: 'Sentence', text: sentence, lang: 'it'}, {label: 'Meaning', text: meaning, lang: 'en'}],
      answer, hint, explanation: sentence.replace('___', answer).replace(/^./u, letter => letter.toUpperCase())
    }];
  }

  function exercises(verbName) {
    const verb = verbs.find(item => item.name === verbName);
    if (!verb) return [];
    return people.flatMap(person => rowsForPerson(verb, person)).concat(matchSubjects(verb), traditionalSubjects(verb), sentencePractice(verb));
  }

  root.ItalianDailyVerbs = { verbs, exercises };
})(window);
