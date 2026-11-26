/* Permanent reference sheets share the course's existing catalogues and views.
 * Add a sheet here to expose it in both the sidebar and the reference catalogue. */
import {renderComparison} from './present-conjugation-comparison.js?v=20261126references1';
import './articles-guide-data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const italian = value => '<span class="learning-it" lang="it">' + esc(value) + '</span>';

function table(headings, records, italianColumns = []) {
  return '<div class="table-wrap reference-table-scroll" tabindex="0"><table class="reference-rule-table"><thead><tr>' +
    headings.map(value => '<th scope="col">' + esc(value) + '</th>').join('') + '</tr></thead><tbody>' +
    records.map(row => '<tr>' + row.map((value, index) => {
      const tag = index ? 'td' : 'th';
      return '<' + tag + (index ? '' : ' scope="row"') + '>' + (italianColumns.includes(index) ? italian(value) : esc(value)) + '</' + tag + '>';
    }).join('') + '</tr>').join('') + '</tbody></table></div>';
}

function articleTable(partitive = false) {
  const data = window.ItalianArticleGuide;
  const keys = partitive ? ['partitiveSingular', 'partitivePlural'] : ['definiteSingular', 'definitePlural', 'indefinite'];
  const headings = partitive ? ['Gender and beginning', 'Some: an amount', 'Some: several'] : ['Gender and beginning', 'The: singular', 'The: plural', 'A / an'];
  return '<div class="table-wrap reference-table-scroll" tabindex="0"><table class="reference-rule-table"><thead><tr>' +
    headings.map(heading => '<th scope="col">' + esc(heading) + '</th>').join('') + '</tr></thead><tbody>' +
    data.cases.map(row => '<tr><th scope="row">' + esc(row.gender) + '<small>' + esc(row.start) + '</small></th>' +
      keys.map(key => '<td><strong>' + italian(row[key]) + '</strong><small>' + italian(row.examples[key]) + '</small></td>').join('') + '</tr>').join('') +
    '</tbody></table></div>';
}

function articleReference() {
  const data = window.ItalianArticleGuide;
  return '<section class="reference-section"><h3>The, a and an</h3>' + articleTable() + '</section>' +
    '<section class="reference-section"><h3>Some</h3>' + articleTable(true) + '</section>' +
    '<div class="reference-note-grid">' + data.notes.map(note => '<article><h3>' + esc(note.title) + '</h3><p>' + esc(note.text) + '</p></article>').join('') + '</div>' +
    '<details class="reference-extra"><summary>Starting sounds and useful exceptions</summary>' +
      table(['Beginning', 'Example', 'Reminder'], data.specialStarts.map(row => [row.start, row.example, row.note]), [1]) + '</details>';
}

// These are the same quick-reference explanations already used in Practice.
const quickReferences = {
  articles: () => articleTable() + '<p>' + esc(window.ItalianArticleGuide.notes.find(note => note.title === 'An amount of something').text) + '</p>',
  sounds: () => table(['Spelling', 'First sound', 'Try saying'], [
    ['ce, ci', 'ch in chip', 'cena, cinema'], ['che, chi', 'k in key', 'che, chi'],
    ['ge, gi', 'j in jam', 'gelato, giro'], ['ghe, ghi', 'g in go', 'ghepardo, ghisa']
  ], [0, 2]) + '<p>Before <b>e</b> or <b>i</b>, an <b>h</b> keeps c and g hard. Before <b>a, o, u</b>, c and g are normally hard already.</p>',
  prepositions: () => table(['Base', 'il', 'lo', 'la', 'l’', 'i', 'gli', 'le'], [
    ['in', 'nel', 'nello', 'nella', 'nell’', 'nei', 'negli', 'nelle'],
    ['su', 'sul', 'sullo', 'sulla', 'sull’', 'sui', 'sugli', 'sulle'],
    ['da', 'dal', 'dallo', 'dalla', 'dall’', 'dai', 'dagli', 'dalle']
  ], [0, 1, 2, 3, 4, 5, 6, 7]) + '<p>These joined forms are called <i lang="it">preposizioni articolate</i>. For “from a”, keep <i lang="it">da</i> separate, as in <i lang="it">da una scuola</i>.</p>',
  questions: () => table(['English', 'Italian'], [
    ['Who?', 'Chi?'], ['What?', 'Che cosa? / Cosa?'], ['Where?', 'Dove?'],
    ['When?', 'Quando?'], ['Why?', 'Perché?'], ['How?', 'Come?']
  ], [1]) + '<p><i lang="it">Come si dice … in italiano?</i> means “How do you say … in Italian?” <i lang="it">Che cosa significa …?</i> means “What does … mean?”</p>',
  objects: () => '<p><b>Anna mangia una mela.</b> Anna eats what? An apple. <i lang="it">Una mela</i> is the direct object. This use of <i lang="it">mangiare</i> is transitive.</p><p><b>Anna dorme in cucina.</b> Anna is sleeping. Where? In the kitchen. <i lang="it">In cucina</i> gives a place. <i lang="it">Dormire</i> is intransitive.</p><p><b>Anna mangia.</b> You can leave the food unspoken. <i lang="it">Mangiare</i> can still take an object.</p>'
};

function verbReference(name) {
  const verbs = [...window.ItalianVerbReference.verbs].sort((a, b) => a.name.localeCompare(b.name, 'it'));
  const selected = verbs.find(verb => verb.name === name) || verbs[0];
  return '<label class="reference-verb-picker" for="practice-reference-verb">Choose a verb' +
    '<select id="practice-reference-verb">' + verbs.map(verb => '<option value="' + esc(verb.name) + '"' + (verb.name === selected.name ? ' selected' : '') + '>' + esc(verb.name) + ' (' + esc(verb.meaning) + ')</option>').join('') + '</select></label>' +
    '<div id="practice-reference-verb-body">' + window.ItalianVerbReferenceView.render(selected) + '</div>';
}

export const referenceSheets = Object.freeze([
  {id: 'verb-endings', title: 'Regular verb endings', description: 'Compare -ARE, -ERE and -IRE across all six present-tense forms.', render: () => renderComparison(window.ItalianDailyVerbs.verbs)},
  {id: 'verb-forms', title: 'Verb forms and uses', description: 'Choose any course verb for its full present-tense table and examples.', render: ({verb}) => verbReference(verb)},
  {id: 'articles', title: 'Articles', description: 'The, a, an and some, including singular, plural and starting-sound rules.', render: articleReference},
  {id: 'sounds', title: 'C and G sounds', description: 'Compare ce, ci, che, chi, ge, gi, ghe and ghi.', render: () => quickReferences.sounds()}
].map(Object.freeze));

export const referenceFor = id => referenceSheets.find(sheet => sheet.id === id);
export const referenceHref = (id, verb = '') => '?page=today&tab=practice&reference=' + encodeURIComponent(id) + (id === 'verb-forms' && verb ? '&verb=' + encodeURIComponent(verb) : '');
export const renderQuickReference = topic => quickReferences[topic]?.() || '';

export function renderReference(id, options = {}) {
  if (id === 'all') return '<div class="practice-reference-catalogue">' + referenceSheets.map(sheet =>
    '<a class="practice-reference-card" data-reference="' + sheet.id + '" href="' + esc(referenceHref(sheet.id)) + '"><strong>' + esc(sheet.title) + '</strong><span>' + esc(sheet.description) + '</span><span class="reference-card-action">Open reference <span aria-hidden="true">→</span></span></a>'
  ).join('') + '</div>';
  return referenceFor(id)?.render(options) || '';
}
