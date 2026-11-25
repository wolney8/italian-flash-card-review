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
  const courseGroups = {
    are: 'First conjugation · -ARE',
    ere: 'Second conjugation · -ERE',
    ire: 'Third conjugation · -IRE',
    auxiliary: 'Own conjugations · essere and avere'
  };

  // These are the course's groups, not an attempt to infer every paradigm from
  // an infinitive's last letters. Fare follows Laura's Lesson 8 convention.
  const courseGroupByName = {
    essere: 'auxiliary', avere: 'auxiliary',
    fare: 'are', stare: 'are', andare: 'are', dare: 'are',
    chiamarsi: 'are', lavorare: 'are', parlare: 'are', abitare: 'are',
    studiare: 'are', mangiare: 'are', significare: 'are', scusare: 'are',
    lavare: 'are', salutare: 'are', telefonare: 'are', bruciare: 'are',
    vivere: 'ere', vedere: 'ere', leggere: 'ere', scrivere: 'ere',
    potere: 'ere', ripetere: 'ere', volere: 'ere', dispiacere: 'ere',
    bere: 'ere', prendere: 'ere',
    venire: 'ire', dire: 'ire', dormire: 'ire', aprire: 'ire',
    finire: 'ire', capire: 'ire', uscire: 'ire'
  };
  const classificationNotes = {
    fare: 'Laura groups fare with -ARE verbs. Some references group it with -ERE because of its older form facere. Its present forms are irregular.',
    dire: 'Dire is shown in the -IRE group by its modern ending. Some references group it with -ERE because of its older form dicere. Its present forms are irregular.',
    bere: 'Bere belongs to the -ERE group. Learn the present stem bev-: bevo, bevi, beve, beviamo, bevete, bevono.',
    essere: 'Essere has its own conjugation. It does not follow the regular -ERE pattern.',
    avere: 'Avere has its own conjugation. It does not follow the regular -ERE pattern.'
  };

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
    regular('bruciare', 'to burn', extension, objects, 'Il pane brucia.', 'The bread is burning.', {singleI: true}),
    regular('prendere', 'to take, get or have, depending on context', 'Reported in Lesson 9', 'The meanings you described point to prendere. Laura’s Lesson 9 slide is still needed to confirm her examples.', 'Prendo un caffè.', 'I’ll have a coffee.', {sourceStatus: 'learner-report-pending-source', reportedSpelling: 'pendere'})
  ];

  // Italian examples checked against the source audit. English is clarified where
  // needed; source labels distinguish course material from illustrative practice.
  const usageExamples = {
    essere: [
      {"id": "laura-use-17-1", "category": "Identity", "italian": "Sono Laura.", "english": "I am Laura.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "laura-use-18-1", "category": "Nationality", "italian": "Sei italiana.", "english": "You are Italian.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "laura-use-19-1", "category": "Jobs", "italian": "È un’insegnante.", "english": "She is a teacher.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}, "note": "Un’insegnante is feminine here. The apostrophe marks the shortened feminine article una."},
      {"id": "laura-use-20-1", "category": "Feelings", "italian": "Siamo felici.", "english": "We are happy.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "laura-use-21-1", "category": "Characteristics", "italian": "Siete alti.", "english": "You are (plural) tall.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "laura-use-22-1", "category": "Location", "italian": "Sono a casa.", "english": "I am at home / They are at home.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}, "note": "Sono can mean I am or they are. The surrounding conversation identifies the subject."},
      {"id": "laura-use-23-1", "category": "Existence", "italian": "Ci sono dei libri.", "english": "There are some books.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "laura-use-24-1", "category": "Time", "italian": "Sono le tre.", "english": "It is three o’clock.", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 6 material"}},
      {"id": "origin-question", "category": "Origin", "italian": "Di dove sei?", "english": "Where are you from?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 6 material"}, "note": "Use di when asking where someone is from."},
    ],
    avere: [
      {"id": "laura-use-01-1", "category": "Possession", "italian": "Io ho una penna", "english": "I have a pen", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 1", "label": "Laura’s Lesson 4 material"}},
      {"id": "laura-use-04-1", "category": "Hunger", "italian": "Ho fame", "english": "I am hungry", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-05-1", "category": "Thirst", "italian": "Ho sete", "english": "I am thirsty", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-06-1", "category": "Feeling hot", "italian": "Ho caldo", "english": "I am hot", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-07-1", "category": "Feeling cold", "italian": "Ho freddo", "english": "I am cold", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-08-1", "category": "Fear", "italian": "Ho paura", "english": "I am scared", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-09-1", "category": "Sleepiness", "italian": "Ho sonno", "english": "I am sleepy", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-10-1", "category": "Being in a hurry", "italian": "Ho fretta", "english": "I am in a hurry", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-11-1", "category": "Being right", "italian": "Ho ragione", "english": "I am right", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-12-1", "category": "Being wrong", "italian": "Ho torto", "english": "I am wrong", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "laura-use-13-1", "category": "Age", "italian": "Ho ... anni", "english": "I am ... years old", "source": {"kind": "laura", "file": "Session 4 - 13.10.2026(1).pdf", "location": "page 2", "label": "Laura’s Lesson 4 material"}, "note": "Italian uses avere in this expression."},
      {"id": "age-question", "category": "Age", "italian": "Quanti anni hai?", "english": "How old are you? (informal)", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 6 material"}, "note": "Hai is for one person informally. Formal Lei uses ha."},
    ],
    fare: [
      {"id": "laura-use-25-1", "category": "Creating", "italian": "fare una torta", "english": "to make a cake", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 1", "label": "Laura’s Lesson 8 material"}, "note": "Fare means make here."},
      {"id": "laura-use-25-2", "category": "Creating", "italian": "fare un disegno", "english": "to make a drawing", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 1", "label": "Laura’s Lesson 8 material"}, "note": "Fare means make here."},
      {"id": "laura-use-26-1", "category": "Actions", "italian": "fare sport", "english": "to play sports", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 1", "label": "Laura’s Lesson 8 material"}, "note": "Italian uses fare with sport and i compiti."},
      {"id": "laura-use-26-2", "category": "Actions", "italian": "fare i compiti", "english": "to do homework", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 1", "label": "Laura’s Lesson 8 material"}, "note": "Italian uses fare with sport and i compiti."},
      {"id": "laura-use-27-1", "category": "Jobs", "italian": "fare l’insegnante (essere insegnante)", "english": "to be a teacher", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Use fare + the definite article + the job."},
      {"id": "laura-use-27-2", "category": "Jobs", "italian": "fare l’infermiere (essere infermiere)", "english": "to be a nurse", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Use fare + the definite article + the job."},
      {"id": "laura-use-28-1", "category": "Weather", "italian": "fa freddo", "english": "it's cold", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Weather expressions use the third-person singular fa."},
      {"id": "laura-use-28-2", "category": "Weather", "italian": "fa caldo", "english": "it's hot", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Weather expressions use the third-person singular fa."},
      {"id": "laura-use-29-1", "category": "Calculations and measurements", "italian": "due più due fa quattro", "english": "two plus two equals four", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Fare can express a result or a measurement."},
      {"id": "laura-use-29-2", "category": "Calculations and measurements", "italian": "la strada fa tre chilometri", "english": "the road is three kilometres", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Fare can express a result or a measurement."},
      {"id": "job-question", "category": "Jobs", "italian": "Che lavoro fai?", "english": "What job do you do?", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Lavoro means job in this question. Fai is the verb."},
      {"id": "job-cook", "category": "Jobs", "italian": "Faccio il cuoco.", "english": "I’m a chef.", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 8 material"}, "note": "Use faccio for io, followed by il and the job."},
    ],
    stare: [
      {"id": "laura-use-30-1", "category": "Wellbeing", "italian": "Sto bene / Sto male", "english": "I am well / I am unwell", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare describes how someone feels."},
      {"id": "laura-use-31-1", "category": "Staying somewhere", "italian": "Sto a casa stasera", "english": "I stay at home tonight", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare can describe staying in a place."},
      {"id": "laura-use-32-1", "category": "Position and posture", "italian": "stare in piedi", "english": "standing", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare can describe a position."},
      {"id": "laura-use-32-2", "category": "Position and posture", "italian": "stare seduto /a", "english": "sitting", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare can describe a position."},
      {"id": "laura-use-32-3", "category": "Position and posture", "italian": "i piatti stanno nella credenza", "english": "the plates are in the cupboard", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare can describe a position."},
      {"id": "laura-use-33-1", "category": "Instructions", "italian": "Stai attento!", "english": "Be careful!", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "This is an instruction: the imperative stai. It has the same spelling as tu stai in the present."},
      {"id": "laura-use-34-1", "category": "Appearance and fit", "italian": "Questa giacca ti sta d’incanto", "english": "This jacket suits you beautifully.", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 8 material"}, "note": "Stare can describe how clothes look on someone."},
      {"id": "wellbeing-question", "category": "Wellbeing", "italian": "Come stai oggi?", "english": "How are you today?", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 8 material"}, "note": "Stai is for one person informally."},
    ],
    venire: [
      {"id": "origin-informal", "category": "Origin", "italian": "Da dove vieni tu?", "english": "Where do you come from? (Informal)", "source": {"kind": "laura", "file": "Session 3 - 06.10.2026.pptx", "location": "slide 10", "label": "Laura’s Lesson 3 material"}, "note": "Vieni and tu address one person informally. Venire uses da for origin."},
      {"id": "origin-formal", "category": "Origin", "italian": "Da dove viene Lei?", "english": "Where do you come from? (Formal)", "source": {"kind": "laura", "file": "Session 3 - 06.10.2026.pptx", "location": "slide 10", "label": "Laura’s Lesson 3 material"}, "note": "Formal Lei uses viene. Venire uses da for origin."},
      {"id": "arrival-question", "category": "Arrival", "italian": "Quando vieni?", "english": "When are you coming?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 6 material"}, "note": "Quando asks when. Vieni is the form for tu."},
    ],
    chiamarsi: [
      {"id": "name-question", "category": "Introductions", "italian": "Ciao! Come ti chiami?", "english": "Hi! What’s your name?", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 8 material"}, "note": "Ti chiami is the form for tu. Include the reflexive pronoun ti."},
      {"id": "name-answer", "category": "Introductions", "italian": "Mi chiamo John.", "english": "My name is John.", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 8 material"}, "note": "Mi chiamo is the form for io. Include the reflexive pronoun mi."},
    ],
    lavorare: [
      {"id": "office", "category": "Workplaces", "italian": "Io lavoro in un ufficio.", "english": "I work in an office.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Use in for a workplace and come for a professional role."},
      {"id": "chef", "category": "Jobs", "italian": "Marco lavora come cuoco.", "english": "Marco works as a chef.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Use in for a workplace and come for a professional role."},
      {"id": "school", "category": "Workplaces", "italian": "L’insegnante lavora in una scuola.", "english": "The teacher works in a school.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Use in for a workplace and come for a professional role."},
      {"id": "hospital", "category": "Workplaces", "italian": "I dottori lavorano in ospedale.", "english": "The doctors work in the hospital.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Use in for a workplace and come for a professional role."},
      {"id": "workplace-question", "category": "Workplaces", "italian": "Dove lavori?", "english": "Where do you work?", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 8 material"}, "note": "Use in for a workplace and come for a professional role."},
      {"id": "teacher-role", "category": "Jobs", "italian": "Lavoro come insegnante", "english": "I work as a teacher", "source": {"kind": "laura", "file": "Session 8 - 17.11.2026 - Minutes.pdf", "location": "page 3", "label": "Laura’s Lesson 8 material"}, "note": "Use in for a workplace and come for a professional role."},
    ],
    parlare: [
      {"id": "spanish", "category": "Languages", "italian": "Io parlo spagnolo.", "english": "I speak Spanish.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "two-languages", "category": "Languages", "italian": "Lorenzo parla due lingue.", "english": "Lorenzo speaks two languages.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "slowly", "category": "How someone speaks", "italian": "La nonna parla lentamente.", "english": "The grandma speaks slowly.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "talking", "category": "Everyday actions", "italian": "I bambini parlano molto.", "english": "The children talk a lot.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
    ],
    mangiare: [
      {"id": "pizza", "category": "Food and meals", "italian": "Tu mangi la pizza?", "english": "Do you eat pizza?", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "chocolate", "category": "Food and meals", "italian": "Maria mangia tanta cioccolata.", "english": "Maria eats a lot of chocolate.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "together", "category": "Food and meals", "italian": "Voi mangiate con noi?", "english": "Do you eat with us? (speaking to several people)", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Voi means you are speaking to more than one person. Noi means we or us."},
      {"id": "pasta", "category": "Food and meals", "italian": "Gli italiani mangiano tanta pasta.", "english": "Italians eat a lot of pasta.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
    ],
    studiare: [
      {"id": "history", "category": "Study", "italian": "Io studio storia.", "english": "I study history.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "italian", "category": "Study", "italian": "Noi studiamo l’italiano.", "english": "We study Italian.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
      {"id": "english", "category": "Study", "italian": "Voi studiate inglese?", "english": "Do you study English? (speaking to several people)", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}, "note": "Voi is plural: you are asking a group."},
      {"id": "exam", "category": "Study", "italian": "I ragazzi studiano per l’esame.", "english": "The kids study for the exam.", "source": {"kind": "laura", "file": "Session 7 - 10.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 7 material"}},
    ],
    scrivere: [
      {"id": "spelling-question", "category": "Classroom questions", "italian": "Come si scrive “letto” in italiano?", "english": "How is “letto” written / spelt in Italian?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 6 material"}, "note": "Come si scrive asks how a word is written or spelt."},
    ],
    dire: [
      {"id": "translation-question", "category": "Classroom questions", "italian": "Come si dice “bed” in italiano?", "english": "How do you say “bed” in Italian?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 6 material"}, "note": "Come si dice asks how to say a word or phrase."},
    ],
    significare: [
      {"id": "meaning-question", "category": "Classroom questions", "italian": "Che cosa significa “letto”?", "english": "What does “letto” mean?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 4", "label": "Laura’s Lesson 6 material"}, "note": "Che cosa significa asks what a word means."},
    ],
    potere: [
      {"id": "repeat-formal", "category": "Polite requests", "italian": "Come, scusi? Può ripetere, per favore?", "english": "Sorry, what did you say? Can you repeat, please?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 6 material"}, "note": "Può is the form for polite Lei. Scusi is the polite request for attention."},
    ],
    ripetere: [
      {"id": "repeat-informal", "category": "Classroom requests", "italian": "Come, scusa? Puoi ripetere, per favore?", "english": "Sorry, what did you say? Can you repeat, please?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 6 material"}, "note": "Puoi is for tu, one person informally. Ripetere stays in the infinitive after puoi."},
    ],
    dare: [
      {"id": "use-tu-formal", "category": "Formality", "italian": "Posso darle del tu?", "english": "May I use tu with you?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 2", "label": "Laura’s Lesson 6 material"}, "note": "This asks permission to switch from formal Lei to informal tu."},
    ],
    capire: [
      {"id": "not-understood", "category": "Classroom phrases", "italian": "Non ho capito!", "english": "I did not understand!", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 6 material"}, "note": "This classroom phrase is in the past tense. The present form is Non capisco. Only the present paradigm is provided above."},
      {"id": "present-example", "category": "Understanding", "italian": "Non capisco.", "english": "I do not understand.", "source": {"kind": "supplementary", "label": "Added practice"}, "note": "Capire uses -isc with io: capisco."},
    ],
    scusare: [
      {"id": "request-informal", "category": "Asking for attention", "italian": "Come, scusa?", "english": "Sorry, what did you say?", "source": {"kind": "laura", "file": "Session 6 - 03.11.2026 - Minutes.pdf", "location": "page 5", "label": "Laura’s Lesson 6 material"}, "note": "Scusa is an informal request here, rather than a statement that you excuse someone."},
    ],
    dispiacere: [
      {"id": "sympathy", "category": "Sympathy", "italian": "Mi dispiace!", "english": "I’m sorry!", "source": {"kind": "laura", "file": "Exercise Class FARE-STARE.pdf", "location": "page 1, exercise 1", "label": "Laura’s Lesson 8 class sheet"}, "note": "Mi dispiace expresses regret or sympathy. It is the everyday phrase to remember."},
    ],
    prendere: [
      {"id": "take-book", "category": "Taking something", "italian": "Prendo il libro.", "english": "I take the book.", "source": {"kind": "supplementary", "label": "Added practice", "url": "https://www.treccani.it/vocabolario/prendere/"}, "note": "Prendere can mean take or pick up an object."},
      {"id": "get-bread", "category": "Getting or buying", "italian": "Prendo il pane al supermercato.", "english": "I get the bread at the supermarket.", "source": {"kind": "supplementary", "label": "Added practice", "url": "https://www.treccani.it/vocabolario/prendere/"}, "note": "Here prendere means get or buy."},
      {"id": "catch-bus", "category": "Transport", "italian": "Prendo l’autobus.", "english": "I take the bus.", "source": {"kind": "supplementary", "label": "Added practice", "url": "https://www.treccani.it/vocabolario/prendere/"}, "note": "With transport, prendere means take or catch."},
      {"id": "have-coffee", "category": "Ordering food and drink", "italian": "Prendo un caffè.", "english": "I’ll have a coffee.", "source": {"kind": "supplementary", "label": "Added practice", "url": "https://www.treccani.it/vocabolario/prendere/"}, "note": "In a café, this can be used to order a coffee. Prendo is present tense despite the natural English I’ll have."},
      {"id": "have-sandwich", "category": "Ordering food and drink", "italian": "Prendo un panino.", "english": "I’ll have a sandwich.", "source": {"kind": "supplementary", "label": "Added practice", "url": "https://www.treccani.it/vocabolario/prendere/"}, "note": "In a café, this can be used to order a sandwich."},
    ],
  };

  const fallbackCategories = {abitare: 'Residence', vivere: 'Residence', vedere: 'Seeing', leggere: 'Reading', dormire: 'Sleep', aprire: 'Everyday actions', finire: 'Finishing', andare: 'Travel', volere: 'Choices', uscire: 'Going out', bere: 'Food and drink', lavare: 'Everyday actions', salutare: 'Greetings', telefonare: 'Communication', bruciare: 'Everyday actions'};

  verbs.forEach(verb => {
    verb.courseGroup = courseGroupByName[verb.name];
    if (classificationNotes[verb.name]) verb.classificationNote = classificationNotes[verb.name];
    // kind/forms remain the original present-only interface for existing callers.
    // Additional tenses need their own verified forms and regularity metadata.
    verb.tenses = {presente: {
      label: 'Present indicative', regularity: verb.kind, forms: verb.forms,
      pattern: verb.isc ? 'ire-isc' : verb.kind === 'irregular' ? 'irregular' : verb.family
    }};
    verb.uses = usageExamples[verb.name] || [{
      id: 'example', category: fallbackCategories[verb.name] || 'Everyday actions',
      italian: verb.example, english: verb.translation,
      source: {kind: 'supplementary', label: 'Added practice'}
    }];
  });

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

  // Each short gap is tied to one displayed example. The two English alternatives
  // test that phrase's meaning, not an unrelated grammar rule or a literal gloss.
  // Tuple: verb, use ID, English task, Italian gap, answer, hint, two wrong meanings.
  const phrasePrompts = [
    ['essere', 'origin-question', 'Complete the question about where someone is from.', 'Di ___ sei?', 'dove', 'Di dove asks about origin. Sei addresses one person informally.', 'Where do you live?', 'What is your name?'],
    ['essere', 'laura-use-20-1', 'Use essere to complete this sentence about how a group feels.', '___ felici.', 'Siamo', 'We is noi. Use the noi form of essere.', 'They are happy.', 'We are at home.'],
    ['essere', 'laura-use-23-1', 'Complete the phrase meaning there are.', 'Ci ___ dei libri.', 'sono', 'Libri is plural. Compare c’è for one thing with ci sono for several.', 'There is a book.', 'The books are at home.'],
    ['avere', 'age-question', 'Complete the question about someone’s age.', 'Quanti ___ hai?', 'anni', 'Italian asks how many years someone has. Anni is plural.', 'How are you?', 'How many brothers do you have?'],
    ['avere', 'laura-use-04-1', 'Complete the phrase for feeling hungry.', 'Ho ___.', 'fame', 'Italian uses avere + fame for hunger.', 'I am thirsty.', 'I am sleepy.'],
    ['avere', 'laura-use-05-1', 'Complete the phrase for feeling thirsty.', 'Ho ___.', 'sete', 'Italian uses avere + sete for thirst.', 'I am hungry.', 'I am cold.'],
    ['avere', 'laura-use-07-1', 'Complete the phrase for personally feeling cold.', 'Ho ___.', 'freddo', 'Ho freddo describes your feeling. Fa freddo describes the weather.', 'The weather is cold.', 'I am hot.'],
    ['avere', 'laura-use-09-1', 'Complete the phrase for feeling sleepy.', 'Ho ___.', 'sonno', 'Italian uses avere + sonno when you feel sleepy.', 'I am hungry.', 'I am scared.'],
    ['fare', 'laura-use-25-1', 'Complete the phrase for making a cake.', 'fare una ___', 'torta', 'Fare means make here. Una introduces one feminine noun.', 'to do homework', 'to make a drawing'],
    ['fare', 'laura-use-25-2', 'Complete the phrase for making a drawing.', 'fare un ___', 'disegno', 'Fare means make here. Un introduces one masculine noun.', 'to make a cake', 'to play sport'],
    ['fare', 'laura-use-26-1', 'Use fare to complete the phrase for playing sport.', '___ sport', 'fare', 'This is the infinitive phrase, so use the to do form.', 'to do homework', 'to make a drawing'],
    ['fare', 'laura-use-26-2', 'Complete the phrase for doing homework.', 'fare i ___', 'compiti', 'Compiti is plural. The masculine plural article is i.', 'to make a cake', 'to play sport'],
    ['fare', 'laura-use-27-1', 'Complete the article before insegnante.', 'fare ___insegnante', 'l’', 'With a job, fare takes the definite article. Insegnante begins with a vowel.', 'to be a nurse', 'to make a drawing'],
    ['fare', 'laura-use-28-1', 'Use fare to complete the phrase about cold weather.', '___ freddo', 'fa', 'Weather uses the third-person singular form of fare.', 'I am cold.', 'It is hot.'],
    ['fare', 'laura-use-28-2', 'Use fare to complete the phrase about hot weather.', '___ caldo', 'fa', 'Use fa for the weather. Ho caldo is about how you feel.', 'I am hot.', 'It is cold.'],
    ['fare', 'laura-use-29-1', 'Complete the calculation with the result in Italian.', 'due più due fa ___', 'quattro', 'Fa means equals in this calculation. Write the result as an Italian word.', 'two plus four equals six', 'the road is three kilometres'],
    ['fare', 'laura-use-29-2', 'Use fare to complete Laura’s distance example.', 'la strada ___ tre chilometri', 'fa', 'La strada is singular. Fare can express a measurement.', 'the road is four kilometres', 'two plus two equals four'],
    ['fare', 'job-question', 'Use fare to ask one friend about their job.', 'Che lavoro ___?', 'fai', 'Use the tu form for one friend. Lavoro means job here.', 'Where do you work?', 'How are you today?'],
    ['stare', 'laura-use-31-1', 'Complete the phrase about staying at home.', 'Sto ___ stasera', 'a casa', 'The useful phrase is stare a casa. Stasera means tonight.', 'I am at work tonight.', 'I am well tonight.'],
    ['stare', 'laura-use-32-1', 'Complete the phrase for standing.', 'stare ___', 'in piedi', 'Piedi means feet. The expression uses in.', 'sitting', 'staying at home'],
    ['stare', 'wellbeing-question', 'Use stare to ask one friend how they feel today.', 'Come ___ oggi?', 'stai', 'Use tu when speaking informally to one person.', 'Where do you work today?', 'What is your job?'],
    ['venire', 'origin-informal', 'Complete the question about where someone comes from.', '___ dove vieni tu?', 'Da', 'Venire uses da for origin. Essere uses di.', 'Where do you live? (informal)', 'When are you coming?'],
    ['venire', 'origin-formal', 'Use venire to complete this polite question.', 'Da dove ___ Lei?', 'viene', 'Polite Lei takes the same form as lui and lei.', 'Where do you live? (formal)', 'When are you coming?'],
    ['chiamarsi', 'name-question', 'Complete the informal question about someone’s name.', 'Ciao! Come ___?', 'ti chiami', 'Include ti with the tu form of chiamarsi.', 'Hi! How are you?', 'Hi! Where are you from?'],
    ['chiamarsi', 'name-answer', 'Use chiamarsi to complete John’s introduction.', '___ John.', 'Mi chiamo', 'Use mi with the io form of chiamarsi.', 'His name is John.', 'Your name is John.'],
    ['lavorare', 'office', 'Complete the phrase about working in an office.', 'Io lavoro ___.', 'in un ufficio', 'Use in for a workplace. Ufficio is masculine.', 'I work as a chef.', 'I study in an office.'],
    ['lavorare', 'chef', 'Complete the phrase for working as a chef.', 'Marco lavora ___ cuoco.', 'come', 'Come means as when you describe a professional role.', 'Marco works in a school.', 'Marco is studying to be a chef.'],
    ['lavorare', 'school', 'Complete the teacher’s workplace.', 'L’insegnante lavora in una ___.', 'scuola', 'Scuola is feminine. The phrase uses in una.', 'The teacher works in an office.', 'The teacher speaks Italian.'],
    ['parlare', 'spanish', 'Use parlare to complete the sentence.', 'Io ___ spagnolo.', 'parlo', 'The io ending of a regular -ARE verb is -o.', 'I study Spanish.', 'I speak Italian.'],
    ['parlare', 'slowly', 'Complete the phrase about speaking slowly.', 'La nonna parla ___.', 'lentamente', 'Lentamente describes how she speaks.', 'The grandma speaks loudly.', 'The children talk a lot.'],
    ['mangiare', 'pizza', 'Use mangiare to ask one friend about pizza.', 'Tu ___ la pizza?', 'mangi', 'Use the tu form. Write one i in mangi.', 'Do we eat pizza?', 'Do you make pizza?'],
    ['mangiare', 'together', 'Complete the phrase about eating with us.', 'Voi mangiate ___?', 'con noi', 'Con means with. Noi means we or us.', 'Do we eat with you?', 'Do you eat alone?'],
    ['studiare', 'italian', 'Use studiare to complete the sentence about we.', 'Noi ___ l’italiano.', 'studiamo', 'Noi uses -iamo. Studiamo has one written i before amo.', 'They study Italian.', 'We speak Italian.'],
    ['studiare', 'exam', 'Complete the phrase about studying for an exam.', 'I ragazzi studiano ___ l’esame.', 'per', 'Per means for in this study phrase.', 'The kids study English.', 'The kids have finished the exam.'],
    ['scrivere', 'spelling-question', 'Use scrivere to complete the spelling question.', 'Come si ___ “letto” in italiano?', 'scrive', 'Come si scrive asks for the spelling, rather than the meaning.', 'What does letto mean?', 'How do you say bed in Italian?'],
    ['dire', 'translation-question', 'Use dire to complete the translation question.', 'Come si ___ “bed” in italiano?', 'dice', 'The useful expression is come si dice: how do you say.', 'How do you spell letto in Italian?', 'What does letto mean?'],
    ['significare', 'meaning-question', 'Use significare to ask what a word means.', 'Che cosa ___ “letto”?', 'significa', 'The word letto is the singular subject of significa.', 'How do you spell letto?', 'Where is the bed?'],
    ['potere', 'repeat-formal', 'Use potere to complete this polite request.', 'Come, scusi? ___ ripetere, per favore?', 'Può', 'Polite Lei uses può. Keep the accent on ò.', 'Can you spell it, please?', 'Can you speak more slowly, please?'],
    ['ripetere', 'repeat-informal', 'Complete the informal request to repeat something.', 'Come, scusa? Puoi ___, per favore?', 'ripetere', 'After puoi, the next verb stays in its infinitive form.', 'Can you spell it, please?', 'Can you speak more slowly, please?'],
    ['dispiacere', 'sympathy', 'Complete the phrase for expressing sympathy.', 'Mi ___!', 'dispiace', 'Learn mi dispiace as a useful whole expression.', 'I am pleased!', 'Please repeat!'],
    ['prendere', 'take-book', 'Use prendere to complete the sentence about taking a book.', '___ il libro.', 'Prendo', 'Use the io form: the regular -ERE ending is -o.', 'I read the book.', 'I write the book.'],
    ['prendere', 'catch-bus', 'Use prendere to complete the sentence about transport.', '___ l’autobus.', 'Prendo', 'Prendere with a means of transport means take or catch.', 'I drive the bus.', 'I wait for the bus.'],
    ['prendere', 'have-coffee', 'Complete the café order with the missing drink.', 'Prendo un ___.', 'caffè', 'In this café example, prendo means I’ll have. Caffè has a final accent.', 'I’ll have a sandwich.', 'I make a coffee.'],
    ['prendere', 'have-sandwich', 'Complete the café order with the missing food.', 'Prendo un ___.', 'panino', 'Panino means sandwich. Prendo can introduce an order.', 'I’ll have a coffee.', 'I make a sandwich.']
  ];

  const phraseAlternatives = {
    'essere/laura-use-20-1': ['Noi siamo'],
    'fare/laura-use-27-1': ["l'"],
    'chiamarsi/name-question': ['ti chiami tu'],
    'chiamarsi/name-answer': ['Io mi chiamo'],
    'lavorare/office': ['in ufficio'],
    'lavorare/chef': ['da'],
    'parlare/slowly': ['adagio', 'piano'],
    'prendere/take-book': ['Io prendo'],
    'prendere/catch-bus': ['Io prendo']
  };

  function phrasePractice(verb) {
    return phrasePrompts.filter(row => row[0] === verb.name).flatMap((row, index) => {
      const [, useId, task, gap, answer, hint, firstWrong, secondWrong] = row;
      const use = verb.uses.find(item => item.id === useId);
      const id = 'verb-' + verb.name + '-phrase-' + useId;
      const phraseText = verb.name === 'fare' && useId === 'laura-use-27-1' ? 'fare l’insegnante' : use.italian;
      const explanation = phraseText + ' = ' + use.english;
      const choices = [firstWrong, secondWrong];
      choices.splice(index % 3, 0, use.english);
      return [
        {id: id + '-gap', skill: 'phrase', type: 'text', task,
          stimulus: [{label: 'Complete', text: gap, lang: 'it'}, {label: 'Meaning', text: use.english, lang: 'en'}],
          answer, answers: phraseAlternatives[verb.name + '/' + useId] || [], answerLang: 'it', hint, explanation, source: use.source},
        {id: id + '-meaning', skill: 'phrase', type: 'choice', task: 'What does this Italian phrase mean?',
          stimulus: [{label: 'Phrase', text: phraseText, lang: 'it'}],
          answer: use.english, answerLang: 'en', choices, hint, explanation, source: use.source}
      ];
    });
  }

  function exercises(verbName) {
    const verb = verbs.find(item => item.name === verbName);
    if (!verb) return [];
    return people.flatMap(person => rowsForPerson(verb, person)).concat(matchSubjects(verb), traditionalSubjects(verb), sentencePractice(verb), phrasePractice(verb));
  }

  root.ItalianDailyVerbs = { verbs, exercises, courseGroups };
})(window);
