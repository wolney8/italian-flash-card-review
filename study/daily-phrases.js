/* Short activities from the Session 6 question table, Session 7 model sentences,
   Session 8 workplace reminder and the course's extra direct-object practice. */
(function (root) {
  'use strict';

  const en = text => ({text,lang:'en'});
  const it = text => ({text,lang:'it'});
  function question(id,task,stimulus,answer,hint,explanation,choices) {
    const row = {id,task,stimulus,answer,hint,explanation};
    if (choices) row.choices = choices;
    return row;
  }

  function questions() {
    // Session 6, Tables p. 3: “Useful question words” and “Frasi Utili”.
    const words = [
      ['who','Who are you?','___ sei?','Chi','The answer will name a person.','Chi sei? asks who someone is.'],
      ['where','Where are you?','___ sei?','Dove','The answer will name a place.','Dove sei? asks for someone’s location.'],
      ['origin','Where are you from?','___ sei?','Di dove','Ask about the place someone comes from. Use two words.','Di dove sei? asks where someone comes from.'],
      ['how','How are you?','___ stai?','Come','You are asking a friend how they feel.','Come stai? is the informal question.'],
      ['when','When are you coming?','___ vieni?','Quando','The answer will give a day or time.','Quando vieni? asks when someone is coming.'],
      ['why','Why are you coming?','___ vieni?','Perché','Ask for a reason. Remember the accent on the final vowel.','Perché vieni? asks why someone is coming.']
    ];
    const rows = words.map(([id,english,gap,answer,hint,explanation]) =>
      question('questions-' + id,'Fill the gap to ask the question in Italian.',
        [en(english),it(gap)],answer,hint,explanation));
    const add = (...args) => rows.push(question(...args));
    add('questions-what','Choose the question that means “What is it?”',
      [en('You want to identify an unfamiliar object.')],'Cos’è?',
      'Cosa means “what” in this question.','Cos’è? is the short form of Cosa è?.',
      ['Dov’è?','Cos’è?','Chi è?']);
    add('questions-meaning','Choose the word that asks what “letto” means.',
      [it('Che cosa ___ “letto”?')],'significa','You want the meaning of a word you have heard.',
      'Che cosa significa “letto”? means “What does letto mean?” Letto means “bed”.',
      ['dice','scrive','significa']);
    add('questions-spelling','Ask how “letto” is spelt. Write the missing verb.',
      [it('Come si ___ “letto” in italiano?')],'scrive','Think of the verb scrivere, “to write”.',
      'Come si scrive? asks for the letters. The word is spelt L, E, T, T, O.');
    add('questions-say','Ask how to say “bed” in Italian. Choose the verb.',
      [it('Come si ___ “bed” in italiano?')],'dice','You want the Italian word. Think of dire, “to say”.',
      'Come si dice “bed” in italiano? The reply is Si dice “letto”.',
      ['scrive','dice','significa']);
    add('questions-meaning-reply','Choose the reply about meaning.',
      [it('Che cosa significa “letto”?')],'“Letto” significa “bed”.',
      'Should your reply give an English word or name the Italian letters?',
      'The question asks for a meaning. “Bed” is the English translation.',
      ['Si scrive elle, e, ti, ti, o.','“Letto” significa “bed”.']);
    add('questions-understand','Fill the gap to say “I didn’t understand”.',
      [it('Non ho ___.')],'capito','Use the classroom expression with ho.',
      'Non ho capito means “I didn’t understand”.');
    add('questions-repeat-friend','Ask one friend to repeat. Choose the informal form.',
      [it('Scusa, ___ ripetere, per favore?')],'puoi','Use the tu form for one friend.',
      'Puoi is the tu form of potere. Scusa and puoi go together here.',['può','puoi']);
    add('questions-repeat-formal','Ask a stranger to repeat. Choose the formal form.',
      [it('Scusi, ___ ripetere, per favore?')],'può','Address one person politely with Lei.',
      'Può is the formal Lei form. Scusi and può go together here.',['puoi','può']);
    add('questions-excuse-formal','Choose the polite way to say “excuse me” to a stranger.',
      [it('___, può ripetere, per favore?')],'Scusi','Use the same level of formality as può.',
      'Scusi is the formal form. Scusa is the form for a friend.',['Scusi','Scusa']);
    add('questions-repeat-verb','Ask someone to repeat. Write the verb meaning “to repeat”.',
      [it('Puoi ___, per favore?')],'ripetere','After puoi, use the form you would look up in a dictionary.',
      'Puoi ripetere, per favore? means “Can you repeat, please?”');
    return rows;
  }

  function objects() {
    const rows = [];
    const add = (...args) => rows.push(question(...args));
    // Session 7, Tables p. 3 and Minutes p. 4. Each question targets one job a phrase does.
    add('objects-eater','Choose who eats the chocolate.',
      [it('Maria mangia tanta cioccolata.'),en('Maria eats a lot of chocolate.')],'Maria',
      'Start with mangia, “eats”. Who does the eating?',
      'Maria does the eating. She is the subject.',['tanta cioccolata','Maria']);
    add('objects-chocolate','Choose what Maria eats.',
      [it('Maria mangia tanta cioccolata.'),en('Maria eats a lot of chocolate.')],'tanta cioccolata',
      'Ask “Maria eats what?”','Tanta cioccolata answers “what?” directly. It is the direct object.',
      ['Maria','tanta cioccolata']);
    add('objects-languages','Choose what Lorenzo speaks.',
      [it('Lorenzo parla due lingue.'),en('Lorenzo speaks two languages.')],'due lingue',
      'Ask “Lorenzo speaks what?”','Due lingue is the direct object of parla.',['due lingue','Lorenzo']);
    add('objects-history','Fill the gap with the thing being studied.',
      [en('I study history.'),it('Io studio ___.')],'storia','Which Italian word means “history”?',
      'Io is the subject. Storia tells you what I study. It is the direct object.');
    add('objects-grandma','Choose what lentamente tells you.',
      [it('La nonna parla lentamente.'),en('Grandma speaks slowly.')],'how she speaks',
      'Try asking “how?” and “what?”','Lentamente means “slowly”. This sentence gives no direct object.',
      ['what she speaks','how she speaks']);
    add('objects-office','Choose what in un ufficio tells you.',
      [it('Io lavoro in un ufficio.'),en('I work in an office.')],'where I work',
      'In introduces a place.','In un ufficio tells you where I work. Lavoro has no direct object here.',
      ['where I work','what I make']);
    add('objects-compare-work','Choose the sentence where I shape a material.',
      [en('Look for the thing being worked on.')],'Lavoro il legno.',
      'Il legno means “the wood”. Un ufficio is a workplace.',
      'Il legno is the direct object. This use of lavorare is transitive.',
      ['Lavoro in un ufficio.','Lavoro il legno.']);
    add('objects-dishes','Choose the direct object in “I wash the dishes”.',
      [it('Lavo i piatti.')],'i piatti','Ask “I wash what?”',
      'You can say “I wash them”. Them stands for i piatti, the direct object.',['Lavo','i piatti']);
    add('objects-greet','Choose the person I greet.',
      [it('Saluto Anna.'),en('I greet Anna.')],'Anna','Ask “I greet whom?”',
      'Anna follows saluto directly. A person can be a direct object too.',['Anna','the speaker']);
    add('objects-phone','Fill the gap to say “I phone Luca”.',
      [it('Telefono ___ Luca.')],'a','Telefonare uses a linking word before the person.',
      'Telefono a Luca. A Luca tells you who receives the call. This is an indirect object.');
    add('objects-cook','Choose the person or thing the cook burns.',
      [it('Il cuoco brucia il pane.'),en('The cook burns the bread.')],'il pane',
      'Ask “the cook burns what?”','The cook does the burning. Il pane is the direct object.',
      ['il cuoco','il pane']);
    add('objects-burning','Choose what happens in this sentence.',
      [it('Il pane brucia.')],'The bread burns.','Il pane is the subject. No cook is mentioned.',
      'Here the bread itself burns. Bruciare has no direct object in this use. This is intransitive.',
      ['The bread burns.','The cook burns the bread.']);
    add('objects-transitive','Which sentence uses bruciare transitively?',
      [en('In one sentence, someone burns something.')],'Il cuoco brucia il pane.',
      'A transitive use has a direct object. Ask “burns what?”',
      'Il cuoco brucia il pane has the direct object il pane. In Il pane brucia, the bread is the subject.',
      ['Il pane brucia.','Il cuoco brucia il pane.']);
    add('objects-pizza-omitted','Choose what con noi tells you.',
      [it('Voi mangiate con noi?'),en('Are you eating with us?')],'who is eating with you',
      'Con means “with”. Does the sentence name any food?',
      'Con noi tells you who is there. Mangiare can take a direct object, but the food is left unstated here.',
      ['what you are eating','who is eating with you']);
    add('objects-doctor','Choose what un dottore tells you about Luca.',
      [it('Luca è un dottore.'),en('Luca is a doctor.')],'who Luca is',
      'È means “is”. Luca and the doctor are the same person.',
      'Un dottore describes Luca. After essere, that description is called a subject complement.',
      ['who Luca treats','who Luca is']);
    // Session 8, Tables p. 2, “Remember!” The source joins the role and the workplace two ways.
    add('objects-teacher-role','Fill the gap to say “I work as a teacher”.',
      [it('Lavoro ___ insegnante.')],'come','The missing word introduces a job or role.',
      'Come introduces the role in Laura’s model Lavoro come insegnante in una scuola.');
    add('objects-teacher-place','Fill the gap to say where the teacher works.',
      [it('Lavoro come insegnante ___ una scuola.')],'in','The school is the workplace.',
      'Come insegnante gives the role. In una scuola gives the place.');
    add('objects-teacher-and','Join the two parts with the Italian word for “and”.',
      [it('Faccio l’insegnante ___ lavoro in una scuola.')],'e',
      'Use one letter without an accent.','Faccio l’insegnante gives the job. E joins it to lavoro in una scuola.');
    const englishChoices = ['objects-grandma','objects-office','objects-greet','objects-burning','objects-pizza-omitted','objects-doctor'];
    for (const row of rows) if (englishChoices.includes(row.id)) row.answerLang = 'en';
    return rows;
  }

  function exercises(topic) {
    const id = typeof topic === 'string' ? topic : topic && topic.id;
    if (id === 'questions') return questions();
    if (id === 'objects') return objects();
    return [];
  }
  root.ItalianDailyPhrases = {exercises};
})(window);
