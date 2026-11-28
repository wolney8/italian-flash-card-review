#!/usr/bin/env node
'use strict';

// Export-only bridge to the website's canonical verb formatter. It reads source
// modules without running a browser, changing source records or touching prompts.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {pathToFileURL} = require('node:url');
const ROOT = path.resolve(__dirname, '..');
const window = {};
const context = vm.createContext({
  window, URL,
  document: {currentScript: {src: pathToFileURL(path.join(ROOT, 'daily-verb-cards/content.js')).href}}
});
for (const file of ['study/daily-verbs.js', 'study/verb-reference-view.js', 'daily-verb-cards/content.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, {filename:file});
}
const view = window.ItalianVerbReferenceView;
const catalogue = window.ItalianDailyVerbs.verbs;
const byName = new Map(catalogue.map(verb => [verb.name, verb]));
const people = ['io', 'tu', 'lui / lei / Lei', 'noi', 'voi', 'loro'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const regexEscape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decode = value => String(value).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
  if (/^#x/i.test(code)) return String.fromCodePoint(parseInt(code.slice(2), 16));
  if (/^#/.test(code)) return String.fromCodePoint(parseInt(code.slice(1), 10));
  return {amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' '}[code.toLowerCase()] || entity;
});
const plain = html => decode(html.replace(/<[^>]*>/g, ''));
const normal = text => text.normalize('NFC').toLocaleLowerCase('it');
const labelNormal = text => normal(text).replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim();

function labelPerson(text, verb) {
  const value = labelNormal(text);
  const labels = [['io'], ['tu'], ['lui / lei', 'lui / lei / Lei', 'lei', 'lui'], ['noi'], ['voi'], ['loro']];
  return labels.findIndex((subjects, index) => subjects.some(subject => value === labelNormal(subject + ' ' + verb.forms[index])));
}

function sectionPersons(html, verb) {
  const matched = new Set();
  for (const label of html.matchAll(/<strong\b[^>]*\blang="it"[^>]*>([\s\S]*?)<\/strong>/g)) {
    const index = labelPerson(plain(label[1]), verb);
    if (index >= 0) matched.add(index);
  }
  return matched;
}

function sectionVerb(open, body) {
  const named = open.match(/\bdata-verb="([^"]+)"/)?.[1];
  if (named) return byName.get(named) || null;
  // Early L1 fields name the verb in form-intro rather than data-verb. The
  // entire six-person pattern must confirm that heading before it is trusted.
  const intro = body.match(/<p\b[^>]*class="[^"]*\bform-intro\b[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] ||
    body.match(/<p><b>([a-z]+\s*[—–·=-][^<]*)<\/b><\/p>/)?.[1];
  const name = intro && plain(intro).match(/^\s*([a-z]+)\s*(?:[—–·=-]|\bto\b)/)?.[1];
  const verb = byName.get(name);
  return verb && sectionPersons(body, verb).size === 6 ? verb : null;
}

function knownVerb(name) {
  if (!name) return null;
  const verb = byName.get(name);
  if (!verb) throw new Error('Unknown canonical verb: ' + name);
  return verb;
}

function completeReference(html, verb) {
  if (html.includes('data-verb-reference="' + esc(verb.name) + '"')) return true;
  const matched = new Set();
  for (const row of html.matchAll(/<div class="l7-form-row">([\s\S]*?)<\/div>/g)) {
    const subject = row[1].match(/^<span(?:\s[^>]*)?>([^<]*)<\/span>/);
    if (!subject) continue;
    const label = normal(plain(subject[1])).replace(/\s+/g, ' ').trim();
    const index = label === 'lui / lei' ? 2 : people.map(normal).indexOf(label);
    if (index < 0) continue;
    const written = plain(row[1].slice(subject[0].length)).trim();
    const form = verb.forms[index];
    if (written === form || (verb.parts && written === '-' + verb.parts[index].ending + form)) matched.add(index);
  }
  if (matched.size === 6) return true;
  for (const section of html.matchAll(/(<section\b[^>]*class="[^"]*\bforms-section\b[^"]*"[^>]*>)([\s\S]*?)<\/section>/g)) {
    if (sectionVerb(section[1], section[2])?.name === verb.name && sectionPersons(section[2], verb).size === 6) return true;
  }
  return false;
}

function legacyReferences(html) {
  const required = new Set();
  let result = html.replace(/(<section\b[^>]*class="[^"]*\bforms-section\b[^"]*"[^>]*>)([\s\S]*?)(<\/section>)/g, (section, open, body, close) => {
    const verb = sectionVerb(open, body);
    if (!verb || verb.kind !== 'regular') return section;
    const styled = body.replace(/(<strong\b[^>]*\blang="it"[^>]*>)([^<]*)(<\/strong>)/g, (element, start, value, end) => {
      const text = decode(value), index = labelPerson(text, verb);
      if (index < 0) return element;
      const form = text.match(new RegExp(regexEscape(verb.forms[index]) + '$', 'iu'));
      return form ? start + esc(text.slice(0, form.index)) + view.formatVerbText(form[0], verb) + end : element;
    });
    return open + styled + close;
  });

  // The L3 origin/residence source examples deliberately show io/tu/Lei. Keep
  // those examples, prove all three against their explicit infinitive heading,
  // then provide the complete paradigm as a separate visible reference.
  const lemmas = [...new Set([...result.matchAll(/<strong>([a-z]+)<\/strong>\s*=/g)].map(match => match[1]).filter(name => byName.has(name)))];
  if (lemmas.length === 1) {
    const verb = byName.get(lemmas[0]);
    result = result.replace(/(<table\b[^>]*class="[^"]*\bl3-singular-forms\b[^"]*"[^>]*>)([\s\S]*?)(<\/table>)/g, (table, open, body, close) => {
      if (/data-reference-kind="source-examples"/.test(open)) return table;
      const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(match => [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => cell[1])).filter(cells => cells.length);
      if (rows.length !== 3 || rows.some((cells, index) => cells.length !== 3 ||
          labelNormal(cells[0].split('<')[0]) !== ['io','tu','lei'][index] ||
          decode(cells[1].split('<')[0]).trim() !== verb.forms[index])) return table;
      required.add(verb.name);
      let rowIndex = 0;
      const styled = body.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, inside) => {
        if (!/<td\b/.test(inside)) return row;
        const index = rowIndex++;
        if (verb.kind !== 'regular') return row;
        let column = 0;
        return '<tr>' + inside.replace(/(<td\b[^>]*>)([\s\S]*?)(<\/td>)/g, (cell, start, content, end) => {
          const current = column++;
          if (current === 1) return start + view.formatForm(verb, index) + content.slice(verb.forms[index].length) + end;
          if (current === 2) return start + answerMarkup(content, verb, verb.forms[index]) + end;
          return cell;
        }) + '</tr>';
      });
      return open.replace(/>$/, ' data-reference-kind="source-examples">') + '<caption>Source examples: singular subjects</caption>' + styled + close;
    });
  }
  if (required.size) result = result.replace('Practise one speaker and one listener before adding plural forms.', 'The complete six-person reference follows these examples.');
  return {pattern:result, required:[...required]};
}

function reference(verb) {
  const regular = verb.kind === 'regular';
  const rows = people.map((person, index) => '<tr><th scope="row" lang="it">' + esc(person) + '</th><td lang="it"><span class="learning-it">' + view.formatForm(verb, index) + '</span></td></tr>').join('');
  const note = verb.isc
    ? '<p class="anki-verb-note"><span class="verb-infix" lang="it">-isc-</span> is inserted before the person ending with <span lang="it">io, tu, lui / lei / Lei</span> and <span lang="it">loro</span>. Both added parts share the same colour. <span lang="it">Noi</span> and <span lang="it">voi</span> use the stem without <span lang="it">-isc-</span>.</p>'
    : !regular ? '<p class="anki-verb-note">Irregular in the present: learn each whole form.</p>' : '';
  return '<div class="anki-verb-reference" data-verb-reference="' + esc(verb.name) + '" lang="en">' +
    '<h3><span class="learning-it" lang="it">' + esc(verb.name) + '</span> · all six present forms</h3>' +
    (regular ? view.formLegend() : '') +
    '<table class="anki-verb-table"><thead><tr><th scope="col">Subject</th><th scope="col">Present form</th></tr></thead><tbody>' + rows + '</tbody></table>' + note + '</div>';
}

function answerMarkup(html, verb, targetForm) {
  if (!verb || /class="[^"]*\bverb-(?:ending|infix)\b/.test(html)) return html;
  const nodes = html.split(/(<[^>]*>)/g);
  if (targetForm) {
    const index = verb.forms.findIndex(form => normal(form) === normal(targetForm));
    if (index < 0) throw new Error('Target form is not in ' + verb.name + ': ' + targetForm);
    const pattern = '(?<![\\p{L}\\p{M}\\p{N}_])' + regexEscape(targetForm) + '(?![\\p{L}\\p{M}\\p{N}_])';
    const matches = nodes.filter((_, i) => i % 2 === 0).flatMap(node => [...node.matchAll(new RegExp(pattern, 'giu'))]);
    if (matches.length !== 1) throw new Error('Expected one exact target form in the answer: ' + targetForm + ' (' + matches.length + ' found)');
    return nodes.map((node, i) => i % 2 ? node : node.replace(new RegExp(pattern, 'giu'), text => view.formatVerbText(text, verb))).join('');
  }
  // Without an explicit sentence target, retain the canonical formatter's
  // conservative exact-form/subject rule; never guess whether lavoro is a noun.
  return nodes.map((node, i) => {
    if (i % 2) return node;
    const formatted = view.formatVerbText(decode(node), verb);
    return /class="verb-(?:ending|infix)"/.test(formatted) ? formatted : node;
  }).join('');
}

function formatRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Expected a display record');
  const result = {...record};
  const verb = knownVerb(record.verb);
  if (typeof record.answer === 'string' && record.answerLanguage !== 'en') {
    result.answer = answerMarkup(record.answer, verb, record.targetForm);
  }
  if (typeof record.pattern === 'string') {
    const legacy = legacyReferences(record.pattern);
    result.pattern = window.ItalianDailyVerbCards.referencePattern(legacy.pattern, verb?.name);
    const names = [...new Set([...legacy.required, ...(record.referenceVerbs || []), ...(record.includeReference && verb ? [verb.name] : [])])];
    for (const name of names) {
      const model = knownVerb(name);
      if (!completeReference(result.pattern, model)) result.pattern += reference(model);
    }
  }
  return result;
}

function formatVerbDisplays(records) {
  if (!Array.isArray(records)) throw new Error('Expected an array of display records');
  return records.map(formatRecord);
}

if (require.main === module) {
  try {
    process.stdout.write(JSON.stringify(formatVerbDisplays(JSON.parse(fs.readFileSync(0, 'utf8')))));
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}
module.exports = {formatVerbDisplays};
