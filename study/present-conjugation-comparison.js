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
function makeTable(models, view){
  const headers=models.map(({verb,entry}) =>
    '<th scope="col"><span class="conj-family-name">'+escape(entry.family)+'</span><span class="learning-it" lang="it">'+escape(verb.name)+'</span></th>').join('');
  const rows=people.map((person,index)=>{
    return '<tr><th scope="row"><span class="learning-it" lang="it">'+escape(person.name)+'</span><small>'+escape(person.english)+'</small></th>'+
      models.map(({verb})=>{
        const part=verb.parts[index];
        return '<td><span class="learning-it conj-form" lang="it">'+view.formatForm(verb,index)+'</span><small><span class="verb-ending" lang="it">-'+escape(part.ending)+'</span></small></td>';
      }).join('')+'</tr>';
  }).join('');
  return '<div class="conj-table-scroll" role="region" tabindex="0" aria-label="All six present-tense forms"><table class="conj-matrix"><caption>Singular and plural together</caption><thead><tr><th scope="col">Subject</th>'+headers+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}
export function renderComparison(verbs){
  const models=examples.map(entry=>({entry,verb:verbs.find(verb=>verb.name===entry.name)}));
  if(models.some(({verb})=>!verb||verb.kind!=='regular'||!Array.isArray(verb.parts)||verb.parts.length!==6||verb.forms?.length!==6)) {
    throw Error('Regular comparison requires the approved verb forms and endings.');
  }
  const view=window.ItalianVerbReferenceView;
  if(!view?.formatForm || !view?.formLegend) throw Error('Regular comparison requires the shared verb reference formatter.');
  return '<section class="conj-reference" lang="en-GB" data-ui-no-translate aria-label="Present-Tense Verb Family Comparison">'+
    '<div class="conj-heading"><h3>Present Tense: Regular Verb Endings</h3>'+
    '<p>Compare all three regular conjugation families. Singular forms come first, followed by plural forms in the same table.</p></div>'+
    view.formLegend()+makeTable(models,view)+
    '<p class="conj-note"><strong>Notice:</strong> <span class="learning-it" lang="it">io</span> ends in <strong class="verb-ending">-o</strong> across all three regular families. The third-person singular ending is <strong class="verb-ending">-a</strong> for -ARE, and <strong class="verb-ending">-e</strong> for -ERE and -IRE.</p>'+
    '<p class="conj-note"><span class="learning-it" lang="it">finire</span> adds <strong class="verb-infix">-isc-</strong> before the person ending for <span class="learning-it" lang="it">io, tu, lui / lei / Lei</span> and <span class="learning-it" lang="it">loro</span>. This added piece is an infix. It shares the ending colour: <span lang="it"><span class="verb-stem">fin</span> + <span class="verb-infix">isc</span> + <span class="verb-ending">o</span></span>. With <span class="learning-it" lang="it">noi</span>, use <span lang="it"><span class="verb-stem">fin</span> + <span class="verb-ending">iamo</span></span>. Both follow the third-conjugation pattern.</p>'+
    '<p class="conj-note">Formal <span class="learning-it" lang="it">Lei</span> and <span class="learning-it" lang="it">esso / essa</span> use the third-person singular form. Find irregular forms in the Verb forms and uses reference. Past and future tenses will be added when their course material is available.</p>'+
    '</section>';
}
