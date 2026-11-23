/* Run with node scripts/validate_worksheet_tasks.cjs. No browser or packages required. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {gunzipSync} = require('node:zlib');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const location = new URL('http://localhost/study/study-sheets.html');
const events = new EventTarget();
const window = {location, addEventListener: events.addEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events)};
const document = {
  currentScript: {src: 'http://localhost/lesson8-practice/content.js'},
  body: {classList: {contains: () => false, add() {}, remove() {}}},
  querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  addEventListener() {}
};
const context = vm.createContext({window, document, location, Event, URL, URLSearchParams, console, setTimeout});
const modules = [
  'lesson6/content.js', 'lesson7/content.js', 'study/verb-reference-v1.js',
  'study/practice-options-v1.js', 'study/practice-bank-v1.js', 'study/library-content-v1.js',
  'study/library-map-v1.js', 'lesson7/integration.js', 'lesson8-practice/content.js',
  'lesson8-practice/core-study.js', 'lesson8-practice/study.js', 'lesson8-practice/catalogue.js',
  'study/library-v1.js', 'study/practice-session-v1.js', 'study/library-order-v1.js'
];
for (const file of modules) vm.runInContext(read(file), context, {filename: file});

const packed = read('study/study-sheets-v5.js').match(/const B="([^"]+)"/);
assert.ok(packed, 'Missing embedded worksheet catalogue');
const base = JSON.parse(gunzipSync(Buffer.from(packed[1], 'base64')));
const lessonSheets = base.concat(window.ITALIAN_L6.sheets, window.ItalianLesson7Integration.sheets());
const practice = window.ItalianPracticeBank.enhance(
  lessonSheets, [], window.ItalianPracticeOptions, window.ItalianVerbReference.verbs
);
const sheets = window.ItalianStudyLibrary.enhance(practice);
const recognisedTask = /\b(answer|ask|change|choose|compare|complete|correct|fill|follow|give|identify|introduce|join|make|match|put|read|replace|rewrite|say|select|spell|translate|turn|which|write)\b/i;
const accepts = (q, value) => window.ITALIAN_L6.checkAnswer(value, q.answers, q.answer_mode || 'accent');
const {esc} = window.ItalianPracticeBank;
const {renderQuestionHeading} = window.ItalianPracticeUI;
let screens = 0;
let anna;
for (const sheet of sheets) {
  assert.ok(!JSON.stringify(sheet).includes('\u2014'), sheet.slug + ' contains an em dash');
  for (const [index, q] of sheet.questions.entries()) {
    screens++;
    const id = sheet.slug + '-q' + (index + 1);
    assert.ok(q.task?.trim() && recognisedTask.test(q.task), id + ' needs an English instruction');
    assert.ok(q.hint || q.support?.hint, id + ' needs a learning hint');
    const heading = renderQuestionHeading(id, q, index + 1);
    assert.ok(heading.includes('id="' + id + '-heading"'), id + ' missing heading');
    assert.ok(heading.includes('lang="en">' + esc(q.task) + '</p>'), id + ' English task missing');
    assert.doesNotMatch(heading, /\u2014|\[object Object\]|\bundefined\b/, id);
    for (const row of q.stimulus || []) {
      assert.ok(['en','it'].includes(row.lang), id + ' cue needs an explicit language');
      const label = row.label ? '<span class="worksheet-cue-label" lang="en">' + esc(row.label) + '</span>' : '';
      const cue = '<span lang="' + (row.lang || 'it') + '">' + esc(row.text) + '</span>';
      assert.ok(heading.includes('<div class="worksheet-cue">' + label + cue + '</div>'), id + ' needs a separate cue row with language tags');
    }
    assert.ok(accepts(q, q.model), id + ' rejects its model answer');
    if (q.type === 'choice') {
      assert.equal(q.choices.filter(value => accepts(q, value)).length, 1, id + ' needs one correct choice');
    } else if (q.type === 'match') {
      const key = JSON.parse(q.model);
      assert.equal(key.length, q.pairs.length, id + ' incomplete matching key');
      for (const [i, pair] of q.pairs.entries()) {
        const options = pair.options || q.matchOptions || [...q.pairs, ...(q.extras || [])];
        assert.ok(options.some(option => option.id === key[i]), id + ' missing correct matching option');
      }
    } else if (q.type === 'order') {
      assert.deepEqual(JSON.parse(q.model).sort(), Array.from(q.items, item => item.id).sort(), id + ' invalid order key');
    }
    if (q.id === 'l8-g-no-object') anna = q;
  }
}

assert.ok(sheets.length >= 82 && screens >= 831, 'A course sheet or activity may have disappeared');
assert.ok(anna, 'Anna’s sandwich dialogue is missing');
assert.match(anna.task, /article/i);
assert.match(anna.task, /noun/i);
assert.ok(anna.stimulus.some(row => row.lang === 'en' && /sandwich/i.test(row.text)), 'Missing English context');
const turns = Array.from(anna.stimulus).filter(row => /^Speaker /.test(row.label));
assert.equal(turns.length, 2, 'Anna needs two distinct speaker turns');
assert.ok(turns[0].label !== turns[1].label && turns.every(row => row.lang === 'it'), 'Missing Italian speaker labels');
assert.ok(/\?/.test(turns[0].text) && /___/.test(turns[1].text), 'The reply must contain the blank');
for (const answer of ['un panino', 'un tramezzino']) assert.ok(accepts(anna, answer), answer);
for (const answer of ['no', 'in cucina', 'una pizza']) assert.ok(!accepts(anna, answer), answer);
console.log('Verified ' + sheets.length + ' sheets, ' + screens + ' exercise headings, scoring keys and Anna’s dialogue.');


// Follow the same links displayed by the lesson and topic catalogues in each mode.
const library = window.ItalianStudyLibrary, sheetBySlug = new Map(sheets.map(sheet => [sheet.slug, sheet]));
for (const mode of ['learn', 'review']) {
  const browseRoutes = ['browse=lesson', 'browse=topic', ...library.map.lessons.map(lesson => 'browse=lesson&lesson='+lesson.id)];
  for (const query of browseRoutes) {
    location.search = 'mode='+mode+'&'+query;
    const navigation = {}, page = {};
    library.render(navigation, page, location.searchParams);
    let catalogueLinks = 0;
    for (const [,href] of (navigation.innerHTML+page.innerHTML).matchAll(/href="([^"]+)"/g)) {
      const target = new URL(href.replaceAll('&amp;', '&'), location);
      if (target.pathname !== location.pathname) continue;
      catalogueLinks++;
      assert.equal(target.searchParams.get('mode'), mode, 'Lost mode on '+target.href);
      const slug = target.searchParams.get('sheet');
      if (!slug) continue;
      const sheet = sheetBySlug.get(slug);
      assert.ok(sheet, 'Missing routed sheet '+slug);
      const routed = library.context(sheet, target.searchParams);
      assert.equal(routed.set.id, target.searchParams.get('set'));
      assert.ok(routed.scopeIndices.length && routed.scopeIndices.every(i => sheet.questions[i].task), 'Missing structured question on '+target.href);
    }
    assert.ok(catalogueLinks, 'Empty catalogue: '+location.href);
  }
}
const attached = ['study-sheets.html?mode=learn&sheet=plural-articles', '../?page=home', '#top'].map(href => ({
  getAttribute: () => href,
  setAttribute: (name, value) => { assert.equal(name,'href'); href=value; }
}));
document.querySelectorAll = () => attached;
location.search = '?mode=review';
window.ItalianStudyContext = {
  library: 'study-sheets.html?mode=learn&browse=lesson',
  next: {href:'study-sheets.html?mode=learn&sheet=practice-avere'},
  breadcrumbs: [{href:'study-sheets.html?mode=learn'}, {label:'Current sheet'}]
};
window.dispatchEvent(new Event('italian-study-mode-updated'));
for (const link of [attached[0].getAttribute('href'), window.ItalianStudyContext.library, window.ItalianStudyContext.next.href, window.ItalianStudyContext.breadcrumbs[0].href]) {
  assert.equal(new URL(link,location).searchParams.get('mode'),'review', 'Mode toggle left a stale link');
}
assert.equal(attached[1].getAttribute('href'), '../?page=home');
assert.equal(attached[2].getAttribute('href'), '#top');
const oldURL = new URL('http://localhost/study/weekend-study.html?mode=review&stage=practise#plural-articles');
let destination;
vm.runInNewContext(read('study/weekend-study.html').match(/<script>([\s\S]*?)<\/script>/)[1], {
  location: {search:oldURL.search, hash:oldURL.hash, replace: value => destination = new URL(value,oldURL)}
});
assert.equal(destination.pathname, '/study/study-sheets.html');
assert.equal(destination.search, oldURL.search);
assert.equal(destination.hash, oldURL.hash);
const pluralHandout = read('study/plural-articles.html');
const selfChecks = Array.from(pluralHandout.matchAll(/<li class="worksheet-content">([\s\S]*?)<\/li>/g), match => match[1]);
assert.equal(selfChecks.length, 6);
for (const check of selfChecks) {
  assert.match(check, /class="worksheet-task" lang="en">Fill the gap/);
  assert.match(check, /class="worksheet-stimulus" lang="it">___/);
  assert.match(check, /<summary>Show hint<\/summary>/);
  assert.match(check, /<summary>Check your answer<\/summary>/);
}
assert.ok(!pluralHandout.includes('\u2014'));
console.log('Verified lesson and topic entry points in Learn and Review, legacy bookmarks and the six plural reference checks.');
