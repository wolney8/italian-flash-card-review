/* Web prompts for the existing Lesson 8 cards. The course and Anki share their answer records. */
(function (root) {
  'use strict';

  const cards = new Map();
  const english = (text, label = 'In English') => ({label, text, lang:'en'});
  const italian = (text, label = 'In Italian') => ({label, text, lang:'it'});

  function grammar(id, task, ...stimulus) {
    cards.set('italian-l8-grammar-' + id, {task, stimulus});
  }

  grammar('come-how', 'Ask one friend this question in Italian. Use stare.',
    english('How are you?'));
  grammar('come-as', 'Say what you do in Italian. Use lavorare.',
    english('I work as a teacher.'));
  grammar('come-like', 'Say this to a friend in Italian.',
    english('You’re like a brother to me.'));
  grammar('verb-of-question', 'Say the missing form of fare. You are asking a friend about their job.',
    english('What job do you do?'), italian('Che lavoro ___?'));
  grammar('object-of-question', 'Say the two Italian words for “what job”.',
    english('What job do you do?'), italian('___ fai?'));
  grammar('lavoro-as-verb', 'Say the missing form of lavorare.',
    english('I work in an office.'), italian('___ in un ufficio.'));
  grammar('two-verbs', 'Say the two missing verbs in order. Use fare and lavorare.',
    english('I’m a teacher and I work in a school.'), italian('___ l’insegnante e ___ in una scuola.'));
  grammar('lavare', 'Say the missing form of lavare.',
    english('I wash the dishes.'), italian('___ i piatti.'));
  grammar('dishes', 'What do I wash? Say the missing Italian article and noun.',
    english('I wash the dishes.'), italian('Lavo ___.'));
  grammar('workplace', 'Where do I work? Say the missing Italian phrase.',
    english('I work in an office.'), italian('Lavoro ___.'));
  grammar('wood', 'What do I work with? Say the missing Italian article and noun.',
    english('I work the wood.'), italian('Lavoro ___.'));
  grammar('fare-job', 'Say the whole sentence using fare and the correct article.',
    english('I work as a doctor.'), italian('dottore', 'Job title'));
  grammar('essere-indefinite', 'Say the whole sentence using essere. Include the word for “a”.',
    english('I’m a doctor.'), italian('dottore', 'Job title'));
  grammar('doctor-on-duty', 'Tell the patient who you are in Italian. Use essere.',
    english('I’m the doctor on duty.'), italian('dottore', 'Job title'));
  grammar('bare-job', 'Say the whole sentence using essere. Leave out the article before the job title.',
    english('I’m a teacher.'), italian('insegnante', 'Job title'));
  grammar('describing-subject', 'Who am I? Say the missing Italian article and noun.',
    english('I’m a doctor.'), italian('Sono ___.'), italian('dottore', 'Job title'));
  grammar('remember-two-clauses', 'Say the whole sentence. Use fare for the job and lavorare for the workplace.',
    english('I’m a teacher and I work in a school.'));
  grammar('remember-one-clause', 'Give your job and workplace in Italian. Use just one verb.',
    english('I work as a teacher in a school.'));

  const spellings = [
    ['ci-cibo', 'food', '___bo', 'ci / chi'],
    ['chi-chilo', 'a kilo', '___lo', 'ci / chi'],
    ['ce-voce', 'voice', 'vo___', 'ce / che'],
    ['che-amiche', 'female friends', 'ami___', 'ce / che', 'amica'],
    ['gi-giro', 'a tour', '___ro', 'gi / ghi'],
    ['ghi-ghiro', 'a dormouse', '___ro', 'gi / ghi'],
    ['ge-agenda', 'an appointment diary', 'a___nda', 'ge / ghe'],
    ['ghe-righe', 'lines on a page', 'ri___', 'ge / ghe', 'riga'],
    ['hard-c-cubo', 'a cube', '___ubo', 'c / ch'],
    ['hard-g-gatto', 'a cat', '___atto', 'g / gh'],
    ['cia-camicia', 'a shirt', 'cami___', 'ca / cia'],
    ['gia-giallo', 'yellow', '___llo', 'ga / gia']
  ];
  for (const [id, meaning, gap, options, singular] of spellings) {
    const stimulus = [english(meaning, 'Meaning')];
    if (singular) stimulus.push(italian(singular, 'Singular'));
    stimulus.push(italian(options, 'Choose from'), italian(gap));
    cards.set('italian-extra-sounds-' + id, {
      task:'Choose the missing letters. Say the whole Italian word aloud.',
      stimulus
    });
  }

  const articleTasks = {
    'the':'Say the phrase in Italian. Include the word for “the”.',
    'some':'Say the phrase in Italian. Use the form for “some”.',
    'in-the':'Say the phrase in Italian. Join “in” to the word for “the”.',
    'from-the':'Say the phrase in Italian. Join “da” to the word for “the”.'
  };
  const articleCues = [
    ['il', 'the', 'the book', 'libro'],
    ['il', 'some', 'some bread', 'pane'],
    ['il', 'in-the', 'in the park', 'parco'],
    ['il', 'from-the', 'from the park', 'parco'],
    ['lo', 'the', 'the rucksack', 'zaino'],
    ['lo', 'some', 'some string', 'spago'],
    ['lo', 'in-the', 'in the rucksack', 'zaino'],
    ['lo', 'from-the', 'from the studio', 'studio'],
    ['la', 'the', 'the school', 'scuola'],
    ['la', 'some', 'some pasta', 'pasta'],
    ['la', 'in-the', 'in the school', 'scuola'],
    ['la', 'from-the', 'from the school', 'scuola'],
    ['elided', 'the', 'the office', 'ufficio'],
    ['elided', 'some', 'some water', 'acqua'],
    ['elided', 'in-the', 'in the office', 'ufficio'],
    ['elided', 'from-the', 'from the classroom', 'aula'],
    ['i', 'the', 'the books', 'libri'],
    ['i', 'some', 'some books', 'libri'],
    ['i', 'in-the', 'in the books', 'libri'],
    ['i', 'from-the', 'from the books', 'libri'],
    ['gli', 'the', 'the students', 'studenti'],
    ['gli', 'some', 'some friends', 'amici'],
    ['gli', 'in-the', 'in the rucksacks', 'zaini'],
    ['gli', 'from-the', 'from the students', 'studenti'],
    ['le', 'the', 'the female friends', 'amiche'],
    ['le', 'some', 'some bananas', 'banane'],
    ['le', 'in-the', 'in the schools', 'scuole'],
    ['le', 'from-the', 'from the schools', 'scuole']
  ];
  for (const [form, pattern, phrase, noun] of articleCues) {
    cards.set('italian-extra-articles-' + form + '-' + pattern, {
      task:articleTasks[pattern],
      stimulus:[english(phrase), italian(noun, 'Noun to use')]
    });
  }

  root.ItalianLesson8CardTasks = {get: key => cards.get(key) || null};
})(window);
