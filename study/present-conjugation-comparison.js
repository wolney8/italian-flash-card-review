/* Side-by-side regular present-tense reference. Read-only: derive from the
   approved verb catalogue so it remains aligned with all six verb tables. */
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const people = [
  {name:'io',english:'I'},
  {name:'tu',english:'you, informal singular'},
  {name:'lui / lei / Lei',english:'he / she / formal you'},
  {name:'noi',english:'we'},
  {name:'voi',english:'you, plural'},
  {name:'loro',english:'they'}
];
const examples = [
  {name:'parlare',family:'1st -ARE'},
  {name:'leggere',family:'2nd -ERE'},
  {name:'dormire',family:'3rd -IRE'},
  {name:'finire',family:'3rd -IRE (-isc-)'}
];
function makeTable(models, indexes, name){
  const headers=models.map(({verb,entry}) =>
    '<th scope="col"><span class="conj-family-name">'+escape(entry.family)+'</span><span class="learning-it" lang="it">'+escape(verb.name)+'</span></th>').join('');
  const rows=indexes.map(index=>{
    const person=people[index];
    return '<tr><th scope="row"><span class="learning-it" lang="it">'+escape(person.name)+'</span><small>'+escape(person.english)+'</small></th>'+
      models.map(({verb})=>{
        const part=verb.parts[index];
        return '<td><span class="learning-it conj-form" lang="it">'+escape(verb.forms[index])+'</span><small>-'+escape(part.ending)+'</small></td>';
      }).join('')+'</tr>';
  }).join('');
  return '<div class="conj-table-scroll" role="region" tabindex="0" aria-label="'+escape(name)+'"><table class="conj-matrix"><thead><tr><th scope="col">Subject</th>'+headers+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}
export function renderComparison(verbs){
  const models=examples.map(entry=>({entry,verb:verbs.find(verb=>verb.name===entry.name)}));
  if(models.some(({verb})=>!verb||verb.kind!=='regular'||!Array.isArray(verb.parts)||verb.parts.length!==6)) {
    throw Error('Regular comparison requires the approved verb forms and endings.');
  }
  return '<section class="conj-reference" aria-label="Present-Tense Verb Family Comparison">'+
    '<div class="conj-heading"><h3>Present Tense: Regular Verb Endings</h3>'+
    '<p>Compare all three regular conjugation families. The first three rows are singular.</p></div>'+
    makeTable(models,[0,1,2],'Singular present-tense comparison')+
    '<details class="conj-plural"><summary>Show Plural Forms (noi, voi, loro)</summary>'+
    makeTable(models,[3,4,5],'Plural present-tense comparison')+'</details>'+
    '<p class="conj-note"><strong>Notice:</strong> <span class="learning-it" lang="it">io</span> ends in <strong>-o</strong> across all three regular families. The third-person singular ending is <strong>-a</strong> for -ARE, and <strong>-e</strong> for -ERE and -IRE.</p>'+
    '<p class="conj-note"><span class="learning-it" lang="it">finire</span> adds <strong>-isc-</strong> before the endings for <span class="learning-it" lang="it">io, tu, lui / lei / Lei</span> and <span class="learning-it" lang="it">loro</span>. It is still a regular third-conjugation pattern, not a fourth family.</p>'+
    '<p class="conj-note">Formal <span class="learning-it" lang="it">Lei</span> and <span class="learning-it" lang="it">esso / essa</span> use the third-person singular form. Irregular verbs have their own tables below. Past and future tenses will be added when their course material is available.</p>'+
    '</section>';
}
