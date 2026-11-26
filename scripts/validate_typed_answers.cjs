#!/usr/bin/env node
'use strict';
// Exercise the approved question banks and the actual Daily Focus grading adapter.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {pathToFileURL} = require('node:url');
const policy = require('../study/typed-answer-policy.js');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const window = {addEventListener() {}, ItalianTypedAnswers: policy};
const context = vm.createContext({window, URL, document: {
  currentScript: {src: pathToFileURL(path.join(root, 'lesson8-practice/content.js')).href},
  addEventListener() {}
}});
for (const file of [
  'study/daily-verbs.js', 'lesson7/content.js', 'study/library-content-v1.js',
  'lesson8-practice/content.js', 'lesson8-practice/core-study.js', 'lesson8-practice/study.js'
]) vm.runInContext(read(file), context, {filename: file});

// Only remove the module loader syntax: the production adapter functions run intact.
const adapter = read('study/daily-focus-content.js')
  .replace(/^import .*;\s*$/gm, '')
  .replace(/import\.meta\.url/g, JSON.stringify(pathToFileURL(path.join(root, 'study/daily-focus-content.js')).href))
  .replace(/^export \{[^}]+\};\s*$/gm, '') + '\nwindow.testDailyQuestion = dailyQuestion;';
vm.runInContext(adapter, context, {filename: 'study/daily-focus-content.js'});
const {matchAnswer} = window.ItalianDailyFocusContent;
const verbs = window.ItalianDailyVerbs;
const l7 = window.ITALIAN_L7.sheets.flatMap(sheet => sheet.questions);
const library = window.ItalianLibraryContent.sheets.flatMap(sheet => sheet.questions);
const l8 = window.ItalianLesson8.sheets.flatMap(sheet => sheet.questions);
const before = JSON.stringify([verbs.verbs, l7, library, l8]);
let count = 0;
function test(name, fn) {
  fn(); count++; console.log('PASS ' + name);
}
function find(rows, id) {
  const row = rows.find(question => question.id === id);
  assert.ok(row, 'Missing approved question: ' + id);
  return row;
}
function graded(question, accepted, rejected = []) {
  for (const answer of accepted) assert.equal(matchAnswer(question, answer), true, question.id + ' must accept ' + JSON.stringify(answer));
  for (const answer of rejected) assert.equal(matchAnswer(question, answer), false, question.id + ' must reject ' + JSON.stringify(answer));
}
function expanded(question, model) {
  const result = policy.describe(question);
  assert.equal(result.expanded, true, question.id + ' should expand');
  assert.equal(result.model, model, question.id + ' should show a full-word model');
  assert.match(result.guidance, /(?:full|whole) word/i, question.id + ' should encourage writing the word');
  assert.doesNotMatch(result.task, /write only the missing (?:ending|letters)/i, question.id + ' must remove contradictory instructions');
  assert.equal(result.guidance.toLowerCase().includes(model.toLowerCase()), false, question.id + ' guidance must not reveal the answer');
  graded(question, [model, ...(question.answers || [question.answer])].filter(Boolean), ['', 'sbagliato']);
  return result;
}
function unchanged(question) {
  const result = policy.describe(question);
  assert.equal(result.expanded, false, question.id + ' must not expand');
  assert.deepEqual(plain(result.answers), plain(question.answers?.length ? question.answers : [question.answer || question.model]));
  assert.equal(result.model, question.model || question.answer || question.answers?.[0]);
  assert.equal(result.task, question.task);
}

test('The screenshot question accepts lavoro or o and rejects the wrong person', () => {
  const question = find(l7, 'Italian-l7-class-lavorare-1');
  assert.deepEqual(plain(question.stimulus), [
    {label:'Italian',text:'Io ___',lang:'it'}, {label:'Stem',text:'lavor-',lang:'it'}
  ]);
  expanded(question, 'lavoro');
  graded(question, ['o', 'lavoro', ' LAVORO. '], ['i', 'lavori', 'lavor', 'ro', 'oro', 'avora']);
});

test('All 176 daily endings accept their approved complete word and exact ending', () => {
  const person = {io:0,tu:1,lui:2,lei:2,formal:2,noi:3,voi:4,loro:5};
  let endings = 0;
  for (const verb of verbs.verbs) {
    for (const question of verbs.exercises(verb.name).filter(row => row.skill === 'ending')) {
      const key = question.id.slice(('verb-' + verb.name + '-').length, -'-ending'.length);
      assert.ok(key in person, question.id + ' has an unknown subject');
      // The approved conjugation table is the independent expected full-word source.
      const model = verb.forms[person[key]];
      expanded(question, model);
      graded(question, [question.answer, model, model.split(' ').at(-1)]);
      // The real adapter adds legacy hyphen notation and must preserve it.
      const adapted = window.testDailyQuestion(question, 'verbs', verb);
      expanded(adapted, model);
      graded(adapted, [question.answer, '-' + question.answer, model]);
      endings++;
    }
  }
  assert.equal(endings, 176, 'Review coverage if generated endings change');
});

test('Single i, hard c, isc and reflexive forms use the actual written word', () => {
  const cases = [
    ['studiare', 'verb-studiare-tu-ending', 'studi', 'i', ['studii','studio','o']],
    ['significare', 'verb-significare-tu-ending', 'significhi', 'i', ['significi','significo','chi']],
    ['finire', 'verb-finire-io-ending', 'finisco', 'o', ['fino','finisci','sco']],
    ['chiamarsi', 'verb-chiamarsi-io-ending', 'mi chiamo', 'o', ['mi','chiami','iamo']]
  ];
  for (const [verb, id, word, ending, wrong] of cases) {
    const question = find(verbs.exercises(verb), id);
    expanded(question, word);
    graded(question, [word, word.split(' ').at(-1), ending], wrong);
  }
});

test('All six Lesson 7 endings retain their notation and show complete conjugations', () => {
  const expected = ['lavoro','lavori','lavora','lavoriamo','lavorate','lavorano'];
  expected.forEach((word, index) => {
    const question = find(l7, 'Italian-l7-ending-' + (index + 1));
    expanded(question, word);
    graded(question, [word, word.slice(5), '-' + word.slice(5)], expected.filter(other => other !== word));
  });
  assert.equal(l7.filter(question => question.id.startsWith('Italian-l7-ending-')).length, 6);
});

test('All 16 C/G spelling gaps accept full words without weakening spelling', () => {
  const groups = {
    c: ['cena','cinema','casa','come','cucina','che','chi','barche'],
    g: ['gelato','giro','gatto','gonna','gufo','ghepardo','ghiaccio','funghi']
  };
  for (const [letter, words] of Object.entries(groups)) {
    words.forEach((word, index) => expanded(find(library, 'class2-' + letter + '-sounds-q' + (index + 1)), word));
  }
  graded(find(library, 'class2-c-sounds-q8'), ['barche','ch'], ['barce','ce','che','e','c']);
  graded(find(library, 'class2-g-sounds-q8'), ['funghi','gh'], ['fungi','gi','ghi','i','g']);
});

test('Lesson 8 supports all 11 embedded gaps and leaves its whole-word gap intact', () => {
  const expected = {ci:'cibo',chi:'chilo',ce:'cena',gi:'giro',ghi:'ghiro',ge:'gelato',ghe:'ghepardo',amici:'amici',barche:'barche',funghi:'funghi',pagine:'pagine'};
  for (const [id, word] of Object.entries(expected)) expanded(find(l8, 'l8-s-' + id), word);
  graded(find(l8, 'l8-s-pagine'), ['gi','pagine'], ['ghi','paghine','gine','ne']);
  graded(find(l8, 'l8-s-ghe'), ['ghe','ghepardo'], ['ge','gepardo','gh']);
  const whole = find(l8, 'l8-s-che');
  const described = policy.describe(whole);
  assert.equal(described.expanded, false);
  assert.deepEqual(plain(described.answers), plain(whole.answers));
  assert.equal(described.model, 'che');
  assert.match(described.task, /whole Italian word/i);
  graded(whole, ['che'], ['ch','e']);
});

test('Choice, match, ordering, reading and spoken activities keep their existing answers', () => {
  const base = find(l7, 'Italian-l7-class-lavorare-1');
  for (const type of ['choice','match','order','reading','spoken','flashcard']) {
    const question = {...plain(base), id:'excluded-' + type, type};
    if (type === 'choice') question.choices = ['lavoro','lavori'];
    unchanged(question);
  }
  unchanged({...plain(base), id:'adapted-choice', type:'question', choices:['lavoro','lavori']});
  unchanged(find(library, 'class2-c-sounds-q9'));
});

test('Whole forms and sentences do not acquire arbitrary suffix answers', () => {
  const whole = find(verbs.exercises('lavorare'), 'verb-lavorare-io-whole');
  unchanged(whole);
  graded(whole, ['lavoro'], ['o','ro','oro','lavor']);
  const sentence = {id:'sentence',type:'text',kind:'sentence',task:'Write the whole sentence in Italian.',
    stimulus:[{lang:'en',text:'I work in an office.'}],answer:'Lavoro in un ufficio.'};
  unchanged(sentence);
  graded(sentence, ['Lavoro in un ufficio.'], ['lavoro','ufficio','o']);
  const multi = {id:'two-gaps',type:'text',task:'Complete both words.',
    stimulus:[{lang:'it',text:'Io lavor___ e tu parl___.'}],answer:'o, i'};
  unchanged(multi);
  const english = {id:'english',type:'text',task:'Complete the English word.',answerLang:'en',
    stimulus:[{lang:'en',text:'wor___'}],answer:'k'};
  unchanged(english);
});

test('Accent, punctuation and optional-subject rules remain strict in actual Focus grading', () => {
  for (const [answer, wrong] of [['è','e'], ['può','puo'], ['ventitré','ventitre']]) {
    const question = {id:'accent-' + answer,type:'question',task:'Write the missing word.',
      stimulus:[{lang:'it',text:'___'}],answer,answers:[answer],answerMode:'accent'};
    unchanged(question);
    graded(question, [answer, answer.toUpperCase(), answer.normalize('NFD')], [wrong]);
  }
  const punctuation = {id:'punctuation',type:'question',task:'Write the complete question.',answer:'Come stai?',answers:['Come stai?'],answerMode:'punctuation'};
  graded(punctuation, ['Come stai?'], ['Come stai']);
  const subject = {id:'optional-subject',type:'question',task:'Say where you work.',answer:'Io lavoro in un ufficio.',answers:['Io lavoro in un ufficio.'],optionalSubjects:['io']};
  graded(subject, ['Io lavoro in un ufficio.','Lavoro in un ufficio.'], ['o','lavoro','in un ufficio']);
});

test('Describing and grading never changes canonical data or saved question snapshots', () => {
  assert.equal(JSON.stringify([verbs.verbs,l7,library,l8]), before);
  const snapshot = plain(find(l7, 'Italian-l7-class-lavorare-1'));
  const saved = JSON.stringify(snapshot);
  graded(snapshot, ['o','lavoro']);
  expanded(snapshot, 'lavoro');
  assert.equal(JSON.stringify(snapshot), saved);
  assert.deepEqual(snapshot.answers, ['lavoro'], 'Saved canonical answers are not rewritten');
});

console.log('PASS typed-answer regression: ' + count + ' groups; real course banks and Daily Focus grading');
