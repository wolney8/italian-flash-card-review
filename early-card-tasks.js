/* Web presentation for earlier exercise cards whose original directions were ambiguous. */
(function (root) {
  'use strict';

  const fronts = new Map();
  const english = (text, label) => ({ text, lang: 'en', label });
  const italian = (text, label) => ({ text, lang: 'it', label });
  const add = (key, task, ...stimulus) => fronts.set(key, { task, stimulus });

  add('italian-l1-come_sta', 'Ask one person politely how they are. Use stare.',
    english('How are you?', 'In English'));
  for (const [key, verb] of [['chiamarsi', 'to be called'], ['essere', 'to be']]) {
    add('italian-l1-' + key, 'Give the Italian infinitive for this English verb.', english(verb));
  }
  for (const [key, phrase, task] of [
    ['io_mi_chiamo', 'I am called…', 'Introduce yourself in Italian. Use io and chiamarsi.'],
    ['io_sono', 'I am…', 'Say the Italian pronoun and the form of essere.'],
    ['lei_e_she', 'She is…', 'Say the Italian pronoun and the form of essere.'],
    ['lei_si_chiama_she', 'She is called…', 'Say how to introduce a woman. Use the pronoun and chiamarsi.'],
    ['lui_e', 'He is…', 'Say the Italian pronoun and the form of essere.'],
    ['lui_si_chiama', 'He is called…', 'Say how to introduce a man. Use the pronoun and chiamarsi.'],
    ['tu_sei', 'You are…', 'Say this to one friend. Include the pronoun and the form of essere.'],
    ['tu_ti_chiami', 'You are called…', 'Say this to one friend. Use the pronoun and chiamarsi.'],
    ['lei_e_you', 'You are…', 'Say this politely to one person. Include the pronoun and the form of essere.'],
    ['lei_si_chiama_you', 'You are called…', 'Say this politely to one person. Use the pronoun and chiamarsi.']
  ]) {
    add('italian-l1-' + key, task, english(phrase));
  }
  add('italian-l1-lei_context', 'Which Italian pronoun would you use for “you”?',
    english('You are speaking politely to an unfamiliar adult.', 'Situation'));
  add('italian-l1-tu_context', 'Which Italian pronoun would you use for “you”?',
    english('You are chatting to one close friend.', 'Situation'));
  add('italian-l1-vowel_count', 'How many vowel sounds do these five letters represent in standard Italian?',
    italian('a · e · i · o · u'));
  add('italian-l1-check_tuo', 'Say the missing word for “your”. You are speaking to one friend.',
    italian('Il ___ nome è Marco?'));
  add('italian-l1-subject_verb_object', 'Say the Italian words for “subject”, “verb” and “object”, in that order.',
    italian('Anna mangia la pizza.'),
    english('Who does it? What is the action? What does she eat?'));

  for (const [suffix, task, cue] of [
    ['000', 'Ask one friend this question in Italian.', 'How are you?'],
    ['001', 'Ask several friends this question in Italian.', 'How are you all?'],
    ['002', 'Answer a friend in Italian. Use stare.', 'I’m well.'],
    ['003', 'Say in Italian that everything is fine. Use tutto.', 'Everything’s good!'],
    ['004', 'Tell a friend how you feel in Italian. Use benissimo.', 'Not very well…'],
    ['005', 'Answer a friend in Italian. Use stare.', 'I feel unwell.']
  ]) {
    add('italian-l2-warm-' + suffix, task, english(cue, 'In English'));
  }

  for (const [letter, offset] of [['c', 38], ['g', 58]]) {
    const key = n => 'italian-l2-' + letter + '-' + String(offset + n).padStart(3, '0');
    add(key(0), 'Say the sound of the first letter in these syllables.',
      italian([letter + 'a', letter + 'o', letter + 'u'].join(' · ')));
    add(key(1), 'Say the sound of the first letter in these syllables.',
      italian(letter + 'e · ' + letter + 'i'));
    add(key(2), 'Which letter keeps the ' + letter + ' sound hard before e and i?',
      italian(letter + '_e · ' + letter + '_i'));
    add(key(3), 'Which letter gives ' + letter + ' its soft sound before a, o and u?',
      italian(letter + '_a · ' + letter + '_o · ' + letter + '_u'));
  }

  const spellingGroups = [
    ['ce', ['cestino', 'cervo', 'cemento', 'cena']],
    ['ci', ['bicicletta', 'cipolla', 'circo', 'cima']],
    ['che', ['orchestra', 'panche', 'chele', 'forchetta']],
    ['chi', ['chioma', 'chiodo', 'chiosco', 'chilometro']],
    ['ge', ['gelato', 'gemelli', 'geranio']],
    ['gi', ['gita', 'giraffa', 'girasole']],
    ['ghe', ['ghepardo', 'spaghetti', 'alghe']],
    ['ghi', ['ghiro', 'ghirlanda', 'funghi']]
  ];
  const reviewWords = ['cestino', 'bicicletta', 'chele', 'chiodo', 'gelato', 'giraffa', 'ghepardo', 'ghiro'];
  let cId = 42;
  let gId = 62;
  spellingGroups.forEach(([group, words], index) => {
    const first = group[0];
    const options = first === 'c' ? 'ce, ci, che or chi' : 'ge, gi, ghe or ghi';
    const task = 'Read the word aloud. Which spelling can you see? Choose ' + options + '.';
    for (const word of words) {
      const id = first === 'c' ? cId++ : gId++;
      add('italian-l2-' + first + '-' + String(id).padStart(3, '0'), task, italian(word));
    }
    add('italian-l5-review-sound-' + group, task, italian(reviewWords[index]));
  });

  add('italian-l2-def-075', 'Give the singular and plural noun endings for “girl”.',
    italian('ragazza → ragazz___'));
  const nouns = [
    ['ufficio', 'office'], ['amico', 'male friend'], ['agenzia', 'agency'],
    ['architetta', 'female architect'], ['libreria', 'bookshop'], ['signore', 'gentleman'],
    ['casa', 'house'], ['amica', 'female friend'], ['operaio', 'male worker'],
    ['signora', 'lady'], ['corso', 'course'], ['infermiere', 'male nurse'],
    ['studente', 'male student'], ['studio', 'studio'], ['ospedale', 'hospital'],
    ['numero', 'number'], ['negozio', 'shop'], ['operaia', 'female worker'],
    ['segretaria', 'female secretary']
  ];
  nouns.forEach(([noun, meaning], index) => {
    add('italian-l2-ex9-' + String(93 + index).padStart(3, '0'),
      'Add the Italian word for “a” or “an”. Say the whole phrase.',
      italian('___ ' + noun), english(meaning, 'Meaning'));
  });

  add('italian-l6-darle-del-tu', 'Ask politely in Italian if you may address the other person as tu.',
    english('You currently use Lei with this person.', 'Situation'));
  add('italian-l6-darti-del-tu', 'Complete the question using dare and ti. Say the whole question aloud.',
    english('May I call you tu?', 'Meaning'), italian('Posso ___ del tu?'));
  add('italian-l6-intonation-what-changes', 'Read both lines aloud. What changes in your voice?',
    italian('Claudia è di Vienna.', 'Statement'), italian('Claudia è di Vienna?', 'Question'));
  add('italian-l7-subject-omission', 'Say what this whole verb means in English. Include who is working.',
    italian('Lavoro.'));

  root.ItalianEarlyCardTasks = { get: card => fronts.get(card.key) || null };
})(window);
