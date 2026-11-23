#!/usr/bin/env node
'use strict';

// Exercise the same local data loader and recall renderer as the course pages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const location = new URL('http://localhost/');
const escapeHtml = text => String(text).replace(/[&<>"']/g, c =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);

async function loadCourse() {
  const requested = new Set();
  const document = {
    currentScript: null, getElementById: id => id === 'v60CardStyles' ? {} : null,
    addEventListener() {}, querySelectorAll: () => [],
    documentElement: {dataset:{}, classList:{remove() {}}}
  };
  const window = {location, addEventListener() {}, __ITALIAN_V54_READY__:true};
  const context = vm.createContext({
    window, document, location, URL, Response, Blob, DecompressionStream, atob,
    CustomEvent: class { constructor(type) { this.type = type; } },
    cards:[], currentLesson:null, lessonMeta:() => ({}), panelTitle:(_panel, deck) => deck,
    renderView() {}, renderNavigation() {}, updateDeckOptions() {}, slugify:key => key,
    stripHtml:value => value.replace(/<[^>]*>/g, ''), escapeHtml,
    truncate:(value, length) => value.slice(0, length),
    fetch:async url => {
      const file = new URL(url, location).pathname.slice(1);
      requested.add(file);
      return new Response(read(file));
    }
  });
  const ready = new Promise((resolve, reject) => {
    window.dispatchEvent = event => { if (event.type === 'italian-course-data-ready') resolve(); };
    window.setTimeout = () => reject(new Error('Course loader failed to initialise'));
    context.console = {error:(_message, error) => reject(error)};
  });
  const scripts = Array.from(read('index.html').matchAll(/<script src="([^"?]+)/g), match => match[1]);
  for (const file of scripts) {
    if (!/(?:card-tasks|card-front)|^(?:lesson6|lesson7|lesson8-practice)\/content\.js$|^course-data-loader-v1\.js$/.test(file)) continue;
    document.currentScript = {src:new URL(file, location).href};
    vm.runInContext(read(file), context, {filename:file});
  }
  await ready;
  assert.equal([...requested].filter(file => file.endsWith('.txt')).length, 18, 'Missing early course card chunks');
  assert.ok(requested.has('lesson8-practice/cards.json'));
  return {cards:context.cards, renderCard:context.renderCard, window};
}

async function main() {
  const {cards, renderCard, window} = await loadCourse();
  const source = JSON.stringify(cards);
  const l8Source = new Map(JSON.parse(read('lesson8-practice/cards.json')).map(row => [row.key, row]));
  assert.equal(cards.length, 623);
  assert.equal(new Set(cards.map(card => card.key)).size, cards.length);
  assert.equal(new Set(cards.map(card => card.lesson)).size, 8);
  assert.equal(l8Source.size, 58);
  assert.equal(window.ItalianLesson8CardTasks.get('missing-card'), null);

  let adapted = 0;
  for (const [i, card] of cards.entries()) {
    const front = window.ItalianCardFront.render(card);
    const instruction = front.match(/<(?:p|div)\b[^>]*class="instruction"[^>]*>/);
    assert.ok(instruction, card.key + ' missing instruction');
    assert.match(instruction[0], /\blang="en"/, card.key);
    assert.ok(front.includes('data-ui-no-translate'), card.key + ' English instruction must survive a UI language change');
    assert.doesNotMatch(front, /\u2014|&mdash;|&#8212;|&#x2014;/i, card.key);
    const html = renderCard(card, i + 1, cards.length);
    assert.ok(html.includes('<div class="front-body">' + front + '</div>'), card.key + ' course bypasses the recall renderer');
    assert.ok(html.includes('<div class="italian">' + card.answer + '</div>'), card.key + ' answer changed');
    assert.ok(html.includes('data-key="' + escapeHtml(card.key) + '"'), card.key + ' identity changed');
    const l8 = l8Source.get(card.key);
    const exercise = l8 ? window.ItalianLesson8CardTasks.get(card.key) : window.ItalianEarlyCardTasks?.get(card);
    if (l8) {
      assert.ok(exercise, card.key + ' missing Lesson 8 activity');
      assert.equal(card.answer, escapeHtml(l8.answer), card.key);
    }
    if (!exercise) {
      assert.ok(front.includes('class="focus"'), card.key + ' missing original cue');
      continue;
    }
    adapted++;
    assert.ok(front.includes(escapeHtml(exercise.task)), card.key + ' missing task text');
    assert.equal((front.match(/class="recall-cue"/g) || []).length, exercise.stimulus.length, card.key);
    for (const row of exercise.stimulus) {
      assert.ok(['it','en'].includes(row.lang) && row.text.trim(), card.key + ' invalid cue');
      assert.ok(front.includes('lang="' + row.lang + '">' + escapeHtml(row.text) + '</span>'), card.key);
      if (row.label) assert.ok(front.includes('lang="en">' + escapeHtml(row.label) + '</span>'), card.key);
    }
  }

  const greeting = cards.find(card => card.key === 'italian-l1-come_sta');
  const politeTask = window.ItalianEarlyCardTasks.get(greeting);
  assert.match(politeTask.task, /ask.*politely/i, 'Name the action and register before showing the question');
  assert.ok(politeTask.stimulus.some(row => row.lang === 'en' && row.text === 'How are you?'));
  assert.equal(greeting.answer, 'Come sta?');
  const pitch = cards.find(card => card.key === 'italian-l6-intonation-what-changes');
  const pitchCues = window.ItalianEarlyCardTasks.get(pitch).stimulus;
  assert.ok(pitchCues.some(row => row.label === 'Statement' && row.text.endsWith('.')));
  assert.ok(pitchCues.some(row => row.label === 'Question' && row.text.endsWith('?')));

  const getL8 = key => window.ItalianLesson8CardTasks.get(key);
  const originalQuestion = getL8('italian-l8-grammar-verb-of-question');
  assert.match(originalQuestion.task, /form of fare/);
  assert.ok(originalQuestion.stimulus.some(row => row.lang === 'it' && row.text === 'Che lavoro ___?'));
  for (const row of l8Source.values()) {
    const {stimulus} = getL8(row.key);
    assert.ok(stimulus.every(cue => cue.lang !== 'it' || !cue.text.toLowerCase().includes(row.answer.toLowerCase())), row.key + ' leaks answer');
    if (row.topic === 'sounds') {
      const bank = stimulus.find(cue => cue.label === 'Choose from').text.split(' / ');
      const gap = stimulus.find(cue => cue.text.includes('___')).text;
      assert.equal(bank.filter(letters => gap.replace('___', letters) === row.answer).length, 1, row.key);
    }
    if (row.topic === 'articles') {
      assert.ok(stimulus.some(cue => cue.lang === 'en' && cue.text === row.english), row.key);
      assert.ok(stimulus.some(cue => cue.lang === 'it' && row.answer.endsWith(cue.text)), row.key);
    }
  }
  assert.equal(JSON.stringify(cards), source, 'Rendering must preserve every shared card record');
  console.log('Verified ' + cards.length + ' recall fronts, answer sides and stable identities, including ' + adapted + ' adapted prompts.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
