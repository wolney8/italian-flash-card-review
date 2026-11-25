/* Course reference using the same verb catalogue as Daily practice.
 * Existing pronunciation and usage notes are retained as added study support. */
(function(root){
'use strict';
const support=[
  {
    "name": "essere",
    "sound": "EHSS-seh-reh",
    "sounds": [
      "SOH-noh",
      "SEH-ee",
      "EH",
      "SYAH-moh",
      "SYEH-teh",
      "SOH-noh"
    ],
    "usage": "Identity, origin, description and location.",
    "note": "The same sono occurs with io and loro. Use context or agreement to tell them apart."
  },
  {
    "name": "avere",
    "sound": "ah-VEH-reh",
    "sounds": [
      "OH",
      "AH-ee",
      "AH",
      "ahb-BYAH-moh",
      "ah-VEH-teh",
      "AHN-noh"
    ],
    "usage": "Possession, age and expressions such as ho fame.",
    "note": "The h is silent in ho, hai, ha and hanno."
  },
  {
    "name": "venire",
    "sound": "veh-NEE-reh",
    "sounds": [
      "VEHN-goh",
      "VYEH-nee",
      "VYEH-neh",
      "veh-NYAH-moh",
      "veh-NEE-teh",
      "VEHN-goh-noh"
    ],
    "usage": "Coming from somewhere; learn venire da as a complete construction.",
    "note": "Da stays part of the construction when it joins an article: da + l’ → dall’Italia."
  },
  {
    "name": "stare",
    "sound": "STAH-reh",
    "sounds": [
      "STOH",
      "STAH-ee",
      "STAH",
      "STYAH-moh",
      "STAH-teh",
      "STAHN-noh"
    ],
    "usage": "Wellbeing in Come stai?, Come sta? and Sto proprio male.",
    "note": "Do not replace every essere with stare. Learn the expressions in context. The existing reference supplies the complete table; not every form was taught in the lesson."
  },
  {
    "name": "andare",
    "sound": "ahn-DAH-reh",
    "sounds": [
      "VAH-doh",
      "VAH-ee",
      "VAH",
      "ahn-DYAH-moh",
      "ahn-DAH-teh",
      "VAHN-noh"
    ],
    "usage": "Going somewhere; va also appears in Come va?",
    "note": "Vado and va occur in the course. The other forms are supplementary support from the existing reference."
  },
  {
    "name": "vivere",
    "sound": "VEE-veh-reh",
    "sounds": [
      "VEE-voh",
      "VEE-vee",
      "VEE-veh",
      "vee-VYAH-moh",
      "vee-VEH-teh",
      "VEE-voh-noh"
    ],
    "usage": "Residence: a city or a country, not necessarily your place of origin.",
    "note": "Dove vivi? asks where you live. The answer supplies a Napoli or in Italia. Vivere has other irregular forms outside this present-tense reference."
  },
  {
    "name": "abitare",
    "sound": "ah-bee-TAH-reh",
    "sounds": [
      "AH-bee-toh",
      "AH-bee-tee",
      "AH-bee-tah",
      "ah-bee-TYAH-moh",
      "ah-bee-TAH-teh",
      "AH-bee-tah-noh"
    ],
    "usage": "The place where your home is; an everyday alternative to vivere for residence.",
    "note": "Dove abita Lei? asks the same question formally. The reply still uses io abito."
  },
  {
    "name": "chiamarsi",
    "sound": "kyah-MAHR-see",
    "sounds": [
      "mee KYAH-moh",
      "tee KYAH-mee",
      "see KYAH-mah",
      "chee kyah-MYAH-moh",
      "vee kyah-MAH-teh",
      "see KYAH-mah-noh"
    ],
    "usage": "Introducing a name. Keep the small reflexive word with the verb.",
    "note": "Come si chiama? is formal. The plural forms complete the existing table as supplementary support."
  }
];
const byName=new Map(support.map(item=>[item.name,item]));
const escape=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function referenceVerbs(){return root.ItalianDailyVerbs.verbs.map(verb=>({...verb,...(byName.get(verb.name)||{})}));}
function find(name){return referenceVerbs().find(verb=>verb.name===name);}
function markup(){
 const verbs=referenceVerbs(),view=root.ItalianVerbReferenceView;
 return '<div class="verb-reference" id="verb-reference" lang="en-GB" data-ui-no-translate><h2>Verbs at a glance</h2><p><strong>'+verbs.length+' verbs · present indicative.</strong> Open a verb for all six forms and examples of how to use it.</p><p class="verb-support-note">Each example shows whether it comes from Laura’s material or is added practice. The verb’s source note explains its course coverage.</p><div class="verb-reference-list">'+verbs.map((verb,index)=>'<details class="verb-entry"'+(index===0?' open':'')+'><summary><span lang="it">'+escape(verb.name)+'</span><span class="ui-study-gloss" lang="en"> · '+escape(verb.meaning)+'</span><small>'+escape([view.familyLabel(verb),view.patternLabel(verb)].filter(Boolean).join(' · '))+'</small></summary><div class="verb-entry-content">'+view.render(verb)+'</div></details>').join('')+'</div>'+contrast()+agreement()+'<p class="verb-support-note">The comparisons above are added study support, based on the course origin, residence and agreement patterns.</p></div>';
}
function contrast(){return '<details class="verb-explainer" id="di-da-dove"><summary>Why di dove, da dove, or just dove?</summary><p><strong>Start with the Italian verb. It tells you which preposition to use.</strong></p><div class="verb-comparison"><article><h3>Essere di · be from</h3><p lang="it">Di dove sei? / Di dove è Lei?</p><p lang="it">Io sono <strong>di Napoli</strong>.</p><p>I am from Naples. Di belongs to the origin construction <em>essere di</em>.</p></article><article><h3>Venire da · come from</h3><p lang="it">Da dove vieni? / Da dove viene Lei?</p><p lang="it">Io vengo <strong>da Napoli</strong>.</p><p>I come from Naples. Da introduces the source in <em>venire da</em>.</p></article><article><h3>Vivere / abitare · live</h3><p lang="it">Dove vivi? / Dove vive Lei?</p><p lang="it">Io vivo <strong>a Napoli</strong>.</p><p lang="it">Dove abiti? / Dove abita Lei?</p><p lang="it">Io abito <strong>in Italia</strong>.</p><p>You ask where someone lives, not “from where”. The answer still needs a place phrase.</p></article><article><h3>Essere + a place · be located</h3><p lang="it">Dove sei?<br>Sono <strong>a casa</strong>.</p><p>Where are you?<br>I am at home. Compare this with <em>Di dove sei?</em>, which asks about your origin.</p></article></div><p>Both <em>Di dove sei?</em> and <em>Da dove vieni?</em> can ask about origins. Da does not automatically mean a journey happening right now. Di is not “for cities” and da is not “for countries”: Napoli appears with both.</p><p><strong>Question → reply:</strong> the question addresses tu or formal Lei; the speaker answers with io. The examples are model sentences, not facts about you.</p></details>';}
function agreement(){return '<details class="verb-explainer" id="agreement"><summary>What changes with articles, partitives and masculine/feminine?</summary><p><strong>Choose the verb form to match the subject.</strong> Articles and adjectives do a different job.</p><div class="verb-comparison"><article><h3>Same verb, different adjective</h3><p lang="it">Io <strong>sono</strong> italiano.<br>Io <strong>sono</strong> italiana.</p><p>The speaker’s adjective changes; sono does not. With more than one person: <em>Noi siamo italiani / italiane.</em></p></article><article><h3>Same verb, different article</h3><p lang="it">Io <strong>ho</strong> un divano.<br>Io <strong>ho</strong> una cravatta.</p><p>The noun’s gender selects un or una. Ho stays the same because the subject is still io. These are constructed examples using the worksheet vocabulary.</p></article><article><h3>Some: dei / degli / delle</h3><p lang="it">un divano → dei divani<br>uno specchio → degli specchi<br>una cravatta → delle cravatte</p><p>The article and noun ending change together. With io ho, the verb does not change merely because the objects become plural.</p></article><article><h3>A preposition can join an article</h3><p lang="it">da + l’ → <strong>dall’</strong>Italia<br>di + il → <strong>del</strong><br>da + il → <strong>dal</strong></p><p>In <em>Vengo dall’Italia</em>, dall’ still means “from” with the article. In <em>dei divani</em>, dei means “some”. The sentence tells you the job the word is doing.</p></article></div><p><strong>Keep the layers separate:</strong> subject → verb form; noun → article; noun/person → adjective agreement; meaning → preposition.</p></details>';}
root.ItalianVerbReference={get verbs(){return referenceVerbs();},find,markup};
})(window);
