#!/usr/bin/env node
'use strict';

// Portable content/integration gate. Real DOM, pointer and viewport checks live in
// validate_lesson7_browser.py; this script never reports them as model coverage.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const L7 = require('../lesson7/content.js');
const L6 = require('../lesson6/content.js');
const B = require('../study/practice-bank-v1.js');
const O = require('../study/practice-options-v1.js');
const support = require('../study/question-support-v1.js');
const fixture = require('./fixtures/lesson7-identities.json');
const report = { status: 'pending', scope: 'Content and integration model; browser validation is separate', checks: [], routes: [], counts: {} };

function check(name, fn) {
  try { fn(); report.checks.push({ name, status: 'pass' }); }
  catch (error) { report.checks.push({ name, status: 'fail', error: error.message }); }
}
async function checkAsync(name, fn) {
  try { await fn(); report.checks.push({ name, status: 'pass' }); }
  catch (error) { report.checks.push({ name, status: 'fail', error: error.message }); }
}
function same(actual, expected, message) { assert.deepEqual(clone(actual), clone(expected), message); }
function sourcePage(item) {
  const source = L7.sources[item.source_id === 'l6-minutes' ? 'l6minutes' : item.source_id];
  assert.ok(source, item.id || item.key);
  const pages = [].concat(item.source_page);
  assert.ok(pages.length > 0);
  for (const page of pages) {
    assert.ok(Number.isInteger(page) && page > 0 && page <= (source.pages || source.slides), item.id || item.key);
    assert.ok(!source.blank_pages?.includes(page), 'Blank source page: ' + (item.id || item.key));
  }
}

// Run the actual loader against local files, with no network and no UI rendering.
// This exercises its original counts/validation as well as its additive extension.
async function loadCards() {
  return new Promise((resolve, reject) => {
    const document = {
      getElementById: id => id === 'v60CardStyles' ? {} : null,
      querySelectorAll: () => [],
      documentElement: { dataset: {}, classList: { remove() {} } }
    };
    const window = {
      ITALIAN_L6: L6, ITALIAN_L7: L7, __ITALIAN_V54_READY__: true,
      dispatchEvent() { resolve(context.cards); },
      setTimeout() { reject(new Error('Loader unexpectedly waited for the application')); }
    };
    const context = {
      window, document, cards: [], currentLesson: null,
      location: new URL('http://localhost/'),
      lessonMeta: () => ({}), renderView() {}, renderNavigation() {}, updateDeckOptions() {},
      fetch: async url => ({ ok: true, text: async () => read(String(url).split('?')[0]) }),
      atob, Blob, Response, DecompressionStream,
      CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
      console: { error: (...values) => reject(new Error(values.map(String).join(' '))) }
    };
    vm.runInNewContext(read('course-data-loader-v1.js'), context, { filename: 'course-data-loader-v1.js' });
  });
}

async function main() {
  const studySource = read('study/study-sheets-v5.js');
  const original = JSON.parse(zlib.gunzipSync(Buffer.from(studySource.match(/const B="([^"]+)"/)[1], 'base64')));
  const session = {};
  const window = {
    ITALIAN_L7: L7, ITALIAN_L6: L6,
    ItalianLibraryMap: clone(require('../study/library-map-v1.js')),
    ItalianLibraryContent: clone(require('../study/library-content-v1.js')),
    ItalianPracticeBank: B, addEventListener() {}, dispatchEvent() {}
  };
  const document = {
    getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
    body: { classList: { contains: () => false } }, addEventListener() {}
  };
  const context = {
    window, document, console, URL, URLSearchParams,
    location: new URL('http://localhost/study/study-sheets.html'),
    sessionStorage: { getItem: key => session[key] || null, setItem: (key, value) => { session[key] = value; } },
    setTimeout: () => 0
  };
  vm.createContext(context);
  for (const file of ['study/verb-reference-v1.js', 'lesson7/integration.js', 'study/library-v1.js', 'study/practice-session-v1.js']) {
    vm.runInContext(read(file), context, { filename: file });
  }
  const verbs = window.ItalianVerbReference.verbs;
  const before = clone(B.enhance(clone(original.concat(L6.sheets)), [], O, verbs).concat(window.ItalianLibraryContent.sheets));
  const enhanced = B.enhance(clone(original.concat(L6.sheets, window.ItalianLesson7Integration.sheets())), [], O, verbs);
  const data = window.ItalianStudyLibrary.enhance(enhanced);
  const M = window.ItalianLibraryMap;
  const bySlug = new Map(data.map(sheet => [sheet.slug, sheet]));
  const newSheets = [...L7.sheets, ...L7.lesson6Supplements.sheets];
  const newQuestions = newSheets.flatMap(sheet => sheet.questions);
  const l6Keys = new Set(L6.cards.map(card => card.key));
  const responseCount = sheet => sheet.questions.reduce((sum, question) => sum + (question.type === 'match' ? question.pairs.length : 1), 0);

  check('54 stable Lesson 7 cards in seven topics; no duplicated Lesson 6 cards', () => {
    assert.equal(L7.cards.length, 54);
    assert.equal(new Set(L7.cards.map(card => card.key)).size, 54);
    same(L7.cards.map(card => card.key), fixture.cardKeys);
    assert.equal(L7.topics.length, 7);
    same(L7.topics.map(topic => L7.cards.filter(card => card.deck === topic).length), [4, 8, 5, 15, 6, 12, 4]);
    assert.equal(L6.cards.length, 66);
    assert.equal(L7.lesson6Supplements.cards.length, 0);
    for (const card of L7.cards) {
      assert.equal(card.lesson, 'L7');
      assert.ok(card.key.startsWith('italian-l7-') && L7.topics.includes(card.deck), card.key);
      for (const field of ['prompt', 'answer', 'source_id', 'source_class', 'pronunciation_status']) assert.ok(card[field], card.key + ': ' + field);
      assert.equal(typeof card.meaning, 'string', card.key + ': meaning');
      sourcePage(card);
      if (card.guide) { assert.ok(card.ipa, card.key); assert.match(card.pronunciation_status, /^Provisional/); }
      for (const key of card.relatedEarlier) assert.ok(l6Keys.has(key), card.key + ': ' + key);
    }
    for (const key of L7.recapReferences) assert.ok(l6Keys.has(key), key);
  });

  check('Fourteen Lesson 7 routes and one recap retain all 93 stable question identities', () => {
    assert.equal(L7.sheets.length, 14);
    assert.equal(L7.lesson6Supplements.sheets.length, 1);
    assert.equal(L7.sheets.reduce((sum, sheet) => sum + sheet.questions.length, 0), 81);
    assert.equal(L7.lesson6Supplements.sheets[0].questions.length, 12);
    assert.equal(newQuestions.length, 93);
    assert.equal(new Set(newQuestions.map(question => question.id)).size, 93);
    same(Object.fromEntries(newSheets.map(sheet => [sheet.slug, sheet.questions.map(question => question.id)])), fixture.questionKeys);
    for (const sheet of newSheets) {
      assert.equal(sheet.lesson, sheet.slug.startsWith('l6-') ? 'L6' : 'L7', sheet.slug);
      if (sheet.responseCount !== undefined) assert.equal(sheet.responseCount, responseCount(sheet), sheet.slug);
      for (const question of sheet.questions) {
        sourcePage(question);
        assert.ok(question.answer_origin && question.source, question.id);
        assert.ok(['accent', 'punctuation', 'match'].includes(question.answer_mode), question.id);
      }
    }
  });

  check('All 59 source worksheet responses retained: 30 classroom and 29 homework', () => {
    const classes = L7.sheets.filter(sheet => sheet.kind === 'class');
    const homework = L7.sheets.filter(sheet => sheet.kind === 'homework');
    assert.equal(classes.length, 5);
    assert.equal(homework.length, 5);
    assert.equal(classes.reduce((sum, sheet) => sum + responseCount(sheet), 0), 30);
    assert.equal(homework.reduce((sum, sheet) => sum + responseCount(sheet), 0), 29);
    for (const [verb, models] of Object.entries(fixture.classModels)) {
      const sheet = bySlug.get('l7-class-' + verb);
      same(sheet.questions.map(question => question.model), models, verb);
      assert.ok(sheet.questions.every(question => question.source_id === 'class' && question.source_item && question.adapted === false), verb);
    }
    const match = bySlug.get('l7-homework-matching').questions[0];
    same(match.pairs.map(pair => [pair.left, pair.right]), fixture.homework.matching);
    same(match.source_pairs.map(pair => [pair.english, pair.italian.toLowerCase()]), fixture.homework.matching);
    same(match.source_pairs.map(pair => pair.letter), ['C', 'A', 'B', 'D', 'E']);
    assert.equal(match.extras.length, 0, 'Preserve the five supplied matching relationships');
    for (const name of ['gaps', 'choices', 'more']) same(bySlug.get('l7-homework-' + name).questions.map(question => question.model), fixture.homework[name], name);
    const choices = bySlug.get('l7-homework-choices').questions;
    same(choices.map(question => question.source_choices), fixture.homework.sourceChoices);
    same(choices.map(question => question.sourceChoices), fixture.homework.sourceChoices);
    assert.ok(choices.every(question => question.adapted && question.source_choices.every(choice => question.choices.includes(choice))));
    same(bySlug.get('l7-homework-translation').questions.map(question => question.model), fixture.homework.translationModels);
    for (const sheet of homework) assert.ok(sheet.questions.every(question => question.source_id === 'homework' && question.source_item), sheet.slug);
  });

  check('All original 53 routes and 560 question identities, models and answer keys preserved', () => {
    assert.equal(before.length, 53);
    assert.equal(before.reduce((sum, sheet) => sum + sheet.questions.length, 0), 560);
    assert.equal(data.length, 68);
    assert.equal(data.reduce((sum, sheet) => sum + sheet.questions.length, 0), 653);
    assert.equal(bySlug.size, data.length);
    for (const sheet of before) {
      const current = bySlug.get(sheet.slug);
      assert.ok(current, sheet.slug);
      assert.equal(current.questions.length, sheet.questions.length, sheet.slug);
      sheet.questions.forEach((question, index) => {
        const now = current.questions[index];
        assert.equal(now.id, question.id, sheet.slug + ': question ID ' + index);
        assert.equal(now.model, question.model, sheet.slug + ': model ' + index);
        same(now.answers, question.answers, sheet.slug + ': answer ' + index);
      });
    }
    assert.equal(bySlug.get('l6-useful-questions').questions.length, 8);
  });

  let modelChecks = 0;
  let optionChecks = 0;
  check('Actual text/choice scoring accepts all explicit models and variants', () => {
    assert.match(studySource, /answerMode!=='legacy'&&window\.ITALIAN_L6\?window\.ITALIAN_L6\.checkAnswer\(raw,a,q\.dataset\.answerMode\)/);
    for (const question of newQuestions.filter(question => question.type !== 'match')) {
      for (const answer of [...question.answers, question.model]) {
        assert.ok(L6.checkAnswer(answer, question.answers, question.answer_mode), question.id + ': ' + answer);
        modelChecks++;
      }
      assert.equal(L6.checkAnswer('definitely wrong', question.answers, question.answer_mode), false, question.id);
    }
  });

  check('Wrong person, spelling, negation and accent answers remain rejected', () => {
    const cases = [
      ['Italian-l7-class-lavorare-1', 'lavori'],
      ['Italian-l7-class-studiare-2', 'studii'],
      ['Italian-l7-class-mangiare-4', 'mangiiamo'],
      ['Italian-l7-hw-5-5', 'Voi studiate storia.'],
      ['l6-recap-understand', 'Ho capito!'],
      ['l6-recap-scusi', 'scusa'],
      ['l6-recap-e-formal', 'e'],
      ['l6-recap-repeat-formal', 'Come, scusi? Puo ripetere, per favore?']
    ];
    for (const [id, wrong] of cases) {
      const question = newQuestions.find(question => question.id === id);
      assert.ok(question, id);
      assert.equal(L6.checkAnswer(wrong, question.answers, question.answer_mode), false, id + ': ' + wrong);
    }
    const translations = bySlug.get('l7-homework-translation').questions;
    assert.ok(L6.checkAnswer('Studiamo l\'italiano.', translations[1].answers, translations[1].answer_mode));
    assert.ok(L6.checkAnswer('Vivono in Inghilterra.', translations[3].answers, translations[3].answer_mode));
    assert.ok(L6.checkAnswer('Studi storia.', translations[4].answers, translations[4].answer_mode));
  });

  check('Recap accepts natural quoted words while rejecting wrong words and letter sequences', () => {
    const quotes = [['"', '"'], ["'", "'"], ['“', '”'], ['‘', '’'], ['«', '»']];
    const score = (id, answer) => {
      const question = newQuestions.find(question => question.id === id);
      assert.ok(question, id);
      return L6.checkAnswer(answer, question.answers, question.answer_mode);
    };
    for (const [left, right] of quotes) {
      const quoted = word => left + word + right;
      const cases = [
        ['l6-recap-meaning', `Che cosa significa ${quoted('letto')}?`],
        ['l6-recap-meaning', `Cosa significa ${quoted('letto')}?`],
        ['l6-recap-meaning', `Che significa ${quoted('letto')}?`],
        ['l6-recap-spelling', `Come si scrive ${quoted('letto')} in italiano?`],
        ['l6-recap-spelling', `Come si scrive in italiano ${quoted('letto')}?`],
        ['l6-recap-say', `Come si dice ${quoted('bed')} in italiano?`],
        ['l6-recap-say', `Come si dice in italiano ${quoted('bed')}?`],
        ['l6-recap-meaning-reply', `${quoted('Letto')} significa bed.`],
        ['l6-recap-meaning-reply', `Letto significa ${quoted('bed')}.`],
        ['l6-recap-meaning-reply', `${quoted('Letto')} significa ${quoted('bed')}.`],
        ['l6-recap-spelling-reply', `Si scrive ${quoted('elle e ti ti o')}.`],
        ['l6-recap-say-reply', `Si dice ${quoted('letto')}.`]
      ];
      for (const [id, answer] of cases) assert.ok(score(id, answer), id + ': ' + answer);
    }
    assert.ok(score('l6-recap-meaning-reply', '“Letto” significa «bed».'));
    for (const [id, wrong] of [
      ['l6-recap-meaning', 'Che cosa significa "casa"?'],
      ['l6-recap-spelling', 'Come si scrive "letta" in italiano?'],
      ['l6-recap-say', 'Come si dice "chair" in italiano?'],
      ['l6-recap-meaning-reply', '"Letto" significa "chair".'],
      ['l6-recap-spelling-reply', 'Si scrive "elle e ti o".'],
      ['l6-recap-say-reply', 'Si dice "letta".']
    ]) assert.equal(score(id, wrong), false, id + ': ' + wrong);
  });

  check('Six-option choices retain one correct option and two marked red herrings', () => {
    for (const question of newQuestions.filter(question => question.type === 'choice')) {
      assert.ok(question.choices.length >= 6, question.id);
      assert.equal(new Set(question.choices).size, question.choices.length, question.id);
      assert.equal(question.redHerrings.length, 2, question.id);
      assert.ok(question.redHerrings.every(choice => question.choices.includes(choice) && !question.answers.includes(choice)), question.id);
      assert.equal(question.choices.filter(choice => L6.checkAnswer(choice, question.answers, question.answer_mode)).length, 1, question.id);
      optionChecks += question.choices.length;
    }
  });

  check('Actual matching scorer distinguishes complete, swapped and partial responses', () => {
    assert.ok(studySource.includes('window.ItalianPracticeUI.checkMatch(q)'));
    const question = bySlug.get('l7-homework-matching').questions[0];
    const expected = question.pairs.map(pair => pair.id);
    same(JSON.parse(question.model), expected);
    const node = chosen => {
      const feedback = {};
      const model = { hidden: true };
      const input = { value: JSON.stringify(chosen) };
      const rows = expected.map(() => ({ querySelector: () => ({ innerHTML: '' }) }));
      return {
        dataset: { matchModel: question.model },
        querySelector: selector => ({ 'input[type=text]': input, '.feedback': feedback, '.model-answer': model }[selector]),
        querySelectorAll: () => rows
      };
    };
    const correct = node(expected);
    assert.ok(window.ItalianPracticeUI.readyMatch(correct));
    window.ItalianPracticeUI.checkMatch(correct);
    assert.equal(correct.dataset.result, 'correct');
    const swapped = node([expected[1], expected[0], ...expected.slice(2)]);
    assert.ok(window.ItalianPracticeUI.readyMatch(swapped));
    window.ItalianPracticeUI.checkMatch(swapped);
    assert.equal(swapped.dataset.result, 'wrong');
    const partial = node([expected[0], '', ...expected.slice(2)]);
    assert.equal(window.ItalianPracticeUI.readyMatch(partial), false);
    window.ItalianPracticeUI.checkMatch(partial);
    assert.equal(partial.dataset.result, undefined);
  });

  check('Explicit hints, English meanings and provisional guides survive support rendering', () => {
    for (const sheet of newSheets) {
      const current = bySlug.get(sheet.slug);
      current.questions.forEach((question, index) => {
        const description = support.describe(question, current, index);
        same(description, question.support, question.id);
        assert.ok(description.hint.en && description.hint.it && description.prompt.en, question.id);
        assert.ok(description.lines.length > 0, question.id);
        assert.ok(description.lines.every(line => line.it && line.en && line.pron), question.id);
        assert.match(description.pronunciationStatus, /^Provisional/, question.id);
      });
    }
  });

  check('Catalogue keeps original lessons and resolves every new route and flashcard target', () => {
    same(M.lessons.map(lesson => lesson.id), ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']);
    for (const lesson of M.lessons) for (const id of lesson.topics) assert.ok(M.topics.some(topic => topic.id === id), lesson.id + ': ' + id);
    for (const topic of M.topics) for (const slug of topic.sets) assert.ok(bySlug.has(slug) || M.subsets[slug], topic.id + ': ' + slug);
    const deckMap = { L7: new Set(L7.cards.map(card => card.deck)), L6: new Set(L6.cards.map(card => card.deck)) };
    for (const topic of L7.libraryTopics) assert.ok(deckMap[topic.flashcards.lesson]?.has(topic.flashcards.deck), topic.id);
    for (const sheet of newSheets) {
      const topic = L7.libraryTopics.find(topic => topic.sets.includes(sheet.slug));
      assert.ok(topic, sheet.slug);
      const ctx = window.ItalianStudyLibrary.context(bySlug.get(sheet.slug), new URLSearchParams({ sheet: sheet.slug, set: sheet.slug, lesson: 'L7', topic: topic.id }));
      assert.equal(ctx.slug, sheet.slug);
      assert.equal(ctx.flashcardTarget.lesson, topic.flashcards.lesson);
      assert.equal(ctx.flashcardTarget.deck, topic.flashcards.deck);
      assert.equal(ctx.scopeIndices.length, sheet.questions.length);
      report.routes.push({ slug: sheet.slug, questions: sheet.questions.length, responses: responseCount(sheet), topic: topic.id, relatedFlashcards: ctx.flashcards });
    }
    const questions = M.topics.find(topic => topic.id === 'questions');
    assert.ok(questions.sets.includes('l6-useful-questions') && questions.sets.includes('l6-recap-useful-requests'));
    const recap = bySlug.get('l6-recap-useful-requests');
    const l6Context = window.ItalianStudyLibrary.context(recap, new URLSearchParams({ sheet: recap.slug, set: recap.slug, lesson: 'L6', topic: 'questions' }));
    assert.equal(l6Context.slug, recap.slug);
    assert.equal(l6Context.scopeIndices.length, 12);
    assert.equal(l6Context.flashcardTarget.lesson, 'L6');
  });

  check('Learn/examples stages and title translations remain explicit', () => {
    for (const sheet of newSheets) {
      assert.ok(sheet.titleIt, sheet.slug);
      assert.equal(window.ItalianUILibraryMessages[sheet.title], sheet.titleIt, sheet.slug);
      assert.ok(sheet.study_sections.length >= 2, sheet.slug);
      assert.ok(sheet.study_sections.every(section => ['learn', 'examples'].includes(section.stage)), sheet.slug);
      assert.ok(sheet.study_sections.some(section => section.stage === 'learn') && sheet.study_sections.some(section => section.stage === 'examples'), sheet.slug);
    }
  });

  check('All 59 original content hashes preserved and reviewed control versions match', () => {
    const saved = JSON.parse(read('docs/library-source-preservation.json'));
    assert.equal(Object.keys(fixture.originalSourceHashes).length, 59);
    same(Object.keys(saved).sort(), [...Object.keys(fixture.originalSourceHashes), 'course-data-loader-v1.js'].sort());
    for (const [file, expected] of Object.entries(fixture.originalSourceHashes)) {
      assert.equal(saved[file], expected, 'Original manifest hash: ' + file);
      assert.equal(hash(file), expected, 'Original content: ' + file);
    }
    assert.equal(hash('course-data-loader-v1.js'), saved['course-data-loader-v1.js'], 'Reviewed loader integration hash');
    for (const [file, expected] of Object.entries(fixture.reviewedControls)) assert.equal(hash(file), expected, file);
  });

  check('Extension dependencies load in the correct order', () => {
    for (const [file, tokens] of [
      ['index.html', ['lesson7/content.js', 'course-data-loader-v1.js', 'study/library-map-v1.js', 'lesson7/integration.js', 'guided-course-v2.js']],
      ['study/study-sheets.html', ['../lesson7/content.js', 'library-map-v1.js', '../lesson7/integration.js', 'library-v1.js', 'study-sheets-v5.js', 'question-support-v1.js', '../learning-controls-v2.js']]
    ]) {
      const html = read(file);
      let previous = -1;
      for (const token of tokens) {
        const position = html.indexOf('src="' + token);
        assert.ok(position > previous, file + ': ' + token);
        previous = position;
      }
    }
  });

  await checkAsync('Actual course loader retains 511 original cards and appends exactly 54 new cards', async () => {
    const cards = await loadCards();
    assert.equal(cards.length, 565);
    assert.equal(cards.filter(card => card.lesson !== 'L7').length, 511);
    assert.equal(cards.filter(card => card.lesson === 'L7').length, 54);
    assert.equal(cards.filter(card => card.lesson === 'L6').length, 66);
    assert.equal(new Set(cards.map(card => card.key)).size, 565);
    same(cards.slice(-54).map(card => card.key), fixture.cardKeys);
    same(cards.filter(card => card.lesson === 'L6').map(card => card.key), L6.cards.map(card => card.key));
  });

  report.counts = {
    totalCards: 565, originalCards: 511, lesson6Cards: L6.cards.length, lesson7Cards: L7.cards.length,
    originalRoutes: before.length, newLesson7Routes: L7.sheets.length, newLesson6RecapRoutes: L7.lesson6Supplements.sheets.length,
    allRoutes: data.length, originalQuestionScreens: 560, newQuestionScreens: newQuestions.length,
    originalClassroomResponses: 30, originalHomeworkResponses: 29, sourceWorksheetResponses: 59,
    modelAndVariantChecks: modelChecks, choiceOptionChecks: optionChecks
  };
}

function finish() {
  report.status = report.checks.every(check => check.status === 'pass') ? 'pass' : 'fail';
  const out = path.join(root, 'artifacts/lesson7');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'content-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'pass') process.exitCode = 1;
}
main().then(finish, error => {
  report.checks.push({ name: 'Validation setup', status: 'fail', error: error.stack || error.message });
  finish();
});
