/* Repeatable exercises derived from the existing course verb reference.
 * Source homework is retained. Additional practice is labelled separately from the original worksheets.
 * No Anki/card data is read or modified. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=(en,it)=>'<span class="editorial-label"><span lang="en" class="editorial-label-main">'+String(en).replace(/\s*\u2014\s*/g,': ')+'</span><span lang="it" class="editorial-label-sub">'+String(it).replace(/\s*\u2014\s*/g,': ')+'</span></span>';
const SUBJECTS=['Io','Tu','Lei','Noi','Voi','Loro'];
const V={
 essere:{forms:['sono','sei','è','siamo','siete','sono'],en:'to be',kind:'irregular',tail:'a casa',gloss:'at home'},
 avere:{forms:['ho','hai','ha','abbiamo','avete','hanno'],en:'to have',kind:'irregular',tail:'fame',gloss:'hungry'},
 venire:{forms:['vengo','vieni','viene','veniamo','venite','vengono'],en:'to come',kind:'irregular',tail:'da Napoli',gloss:'from Naples'},
 stare:{forms:['sto','stai','sta','stiamo','state','stanno'],en:'to be / feel / stay',kind:'irregular',sound:'STAH-reh',tail:'bene',gloss:'well',support:true},
 andare:{forms:['vado','vai','va','andiamo','andate','vanno'],en:'to go',kind:'irregular',tail:'a casa',gloss:'home',support:true},
 vivere:{forms:['vivo','vivi','vive','viviamo','vivete','vivono'],en:'to live',kind:'regular-present',tail:'in Italia',gloss:'in Italy'},
 abitare:{forms:['abito','abiti','abita','abitiamo','abitate','abitano'],en:'to live / reside',kind:'regular-present',tail:'a Napoli',gloss:'in Naples'},
 chiamarsi:{forms:['mi chiamo','ti chiami','si chiama','ci chiamiamo','vi chiamate','si chiamano'],en:'to be called',kind:'reflexive',tail:'',gloss:'',support:true}
};
function english(v,i){const pron=['I','You','You','We','You all','They'][i],be=['am','are','are','are','are','are'][i];return v==='essere'?pron+' '+be+' at home.':v==='avere'?pron+' '+be+' hungry.':v==='venire'?pron+' come from Naples.':v==='stare'?pron+' '+be+' well.':v==='andare'?pron+' go home.':v==='vivere'?pron+' live in Italy.':pron+' live in Naples.';}
function sentence(key,i){const v=V[key];return SUBJECTS[i]+' '+v.forms[i]+(v.tail?' '+v.tail:'')+'.';}
function promptRows(task, rows=[]) {
 const stimulus = rows.map(row => typeof row === 'string' ? {text:row,lang:'it'} : row);
 const lines = stimulus.map(row => '<span lang="'+esc(row.lang || 'it')+'">'+esc(row.text)+'</span>');
 return {task,stimulus,prompt:[esc(task),...lines].join('<br>')};
}
function written(task, rows, model, hint, kind='word') {
 return {...promptRows(task,rows), type:'text',model,answers:[model],hint,optional_subjects:[],answer_mode:'accent',kind,adapted:true,choices:[]};
}
const personClues=[
 ['You are talking about yourself.','Parli di te.'],['You are speaking to one friend.','Parli con un amico.'],
 ['You are speaking politely to one person.','Dai del Lei a una persona.'],['You are speaking for your group.','Parli per il tuo gruppo.'],
 ['You are speaking to several people.','Ti rivolgi a più persone.'],['You are talking about several other people.','Parli di più persone.']
];
function formsHint(key,i){
 const [en,it]=personClues[i];
 return pair(en+' Use '+key+' with '+SUBJECTS[i]+'.',it+' Usa '+key+' con '+SUBJECTS[i]+'.');
}
function gap(key,i) {
 const tail=key==='chiamarsi'?['Marco','Anna','Luca','Rossi','Rossi','Rossi'][i]:V[key].tail;
 return SUBJECTS[i]+' ____ '+tail+'.';
}
function choice(key,i){
 const forms=V[key].forms,right=forms[i],wrong=[...new Set(forms)].filter(form=>form!==right).slice(0,2);
 return {type:'choice',kind:'choice',...promptRows('Choose the missing present-tense form of '+key+'.',[gap(key,i)]),model:right,answers:[right],choices:[right,...wrong],hint:formsHint(key,i),answer_mode:'accent',optional_subjects:[],adapted:true};
}
function matching(key){
 const v=V[key];
 const left=key==='chiamarsi'?['I am called','You are called (a friend)','You are called (polite)','We are called','You are all called','They are called']:SUBJECTS.map((_,i)=>english(key,i)+(i===1?' (a friend)':i===2?' (polite)':''));
 const pairs=SUBJECTS.map((sub,i)=>({id:String(i),left:left[i],right:key==='chiamarsi'?sub+' '+v.forms[i]:sentence(key,i).replace(/\.$/,'')}));
 const model=JSON.stringify(pairs.map(p=>p.id));
 return {type:'match',kind:'matching',...promptRows('Match each English phrase to the Italian form of '+key+'.'),pairs,model,answers:[model],hint:pair('Match the person first. Check tu for a friend, Lei for polite you and voi for a group.','Abbina prima la persona. Usa tu con un amico, Lei per dare del Lei e voi con un gruppo.'),choices:[],extras:[],explanation:'',answer_mode:'match',optional_subjects:[],adapted:true};
}
function verbQuestions(key){const v=V[key],out=[];
 for(let i=0;i<6;i++){
  out.push(written(key==='chiamarsi'?'Write the missing form of chiamarsi, including its short pronoun.':'Write the missing present-tense form of '+key+'.',[gap(key,i)],v.forms[i],formsHint(key,i)));
 }
 for(let i=0;i<3;i++){
  const names=['Marco','Anna','Luca'];
  const target=key==='chiamarsi'?['My name is Marco.','Your name is Anna.','Your name is Luca.'][i]:english(key,i);
  const answer=key==='chiamarsi'?SUBJECTS[i]+' '+v.forms[i]+' '+names[i]+'.':sentence(key,i);
  out.push(written('Write the whole sentence in Italian using '+SUBJECTS[i]+' and '+key+'.',[{label:'In English',text:target,lang:'en'}],answer,formsHint(key,i),'sentence'));
 }
 for(let i=0;i<3;i++){
  out.push(written('Fill the gap to make the sentence negative. Write non and the form of '+key+'.',[gap(key,i)],'non '+v.forms[i],pair('Put non before the verb. The subject is '+SUBJECTS[i]+'.','Metti non prima del verbo. Il soggetto è '+SUBJECTS[i]+'.'),'phrase'));
 }
 for(let i=0;i<3;i++)out.push(choice(key,i));
 out.push(matching(key));return [...out.slice(0,3),...out.slice(6,15),...out.slice(3,6),out[15]];
}
const objectRows=[['esso','singular masculine','Il gatto è nero.','Esso è nero.'],['essa','singular feminine','La mela è rossa e dolce.','Essa è rossa e dolce.'],['essi','plural masculine','I libri sono sul tavolo.','Essi sono sul tavolo.'],['esse','plural feminine','Le stelle sono nel cielo.','Esse sono nel cielo.']];
function objectQuestions(){const out=[];objectRows.forEach(([pron,desc,full,model])=>{
 const v=pron==='esso'||pron==='essa'?'è':'sono';
 out.push(written('Write the missing pronoun used in formal Italian for this animal or object.',[{label:'Original sentence',text:full,lang:'it'},{label:'Complete',text:'____ '+model.split(' ').slice(1).join(' '),lang:'it'}],pron,pair('Use the noun’s gender and number.','Usa il genere e il numero del nome.')));
 out.push(written('Write the missing form of essere. Match it to the pronoun.',[model.replace(' '+v+' ',' ____ ')],v,pair('Use essere for '+(v==='è'?'one thing.':'more than one thing.'),'Usa essere '+(v==='è'?'al singolare.':'al plurale.'))));
 out.push(written('Replace the noun with '+pron+'. Write the whole Italian sentence.',[full],model,pair('Keep the rest of the sentence.','Mantieni il resto della frase.'),'sentence'));
 const wrong=['esso','essa','essi','esse'].filter(p=>p!==pron);
 out.push({type:'choice',kind:'choice',...promptRows('Choose the pronoun that replaces this noun in formal written Italian.',[full.split(' ').slice(0,2).join(' ')]),model:pron,answers:[pron],choices:[pron,...wrong],hint:pair('Look at the noun’s gender and number.','Guarda il genere e il numero del nome.'),answer_mode:'accent',optional_subjects:[],adapted:true});
 });return out;}
function sourceNote(key){return pair('Adapted practice from the existing course verb reference. Original homework remains in its own sets.','Esercizi adattati dalla guida ai verbi del corso. I compiti originali restano nei propri gruppi.')+(V[key]?.support?' '+pair('Some complete forms extend the expressions encountered in class; see the verb reference for the source boundary.','Alcune forme complete ampliano le espressioni incontrate a lezione; consulta i limiti delle fonti nella guida ai verbi.'):'');}
function makeSheet(key){const v=V[key],questions=verbQuestions(key);const hint=key==='vivere'?'Regular in this present-tense exercise; other tenses have irregular forms.':key==='chiamarsi'?'Reflexive: keep mi / ti / si / ci / vi / si with the verb.':v.kind==='irregular'?'Learn the irregular forms; do not apply one regular ending pattern.':'Compare the repeating stem and the present endings.';
 return {slug:'practice-'+key,title:'Practise '+key,subtitle:v.kind==='irregular'?'Irregular verb · mixed exercises':v.kind==='reflexive'?'Reflexive verb · mixed exercises':'Regular present · mixed exercises',practice:true,intro:sourceNote(key),scope:'Adapted course practice',study_sections:[{stage:'learn',type:'table',title:key+' · forms and pronunciation',headers:['Subject','Form','Approximate pronunciation'],rows:[]},{stage:'examples',type:'bullets',title:'Use the whole sentence',items:[hint,...[0,1,2].map(i=>key==='chiamarsi'?'<span lang="it">'+SUBJECTS[i]+' '+v.forms[i]+' '+['Marco','Anna','Luca'][i]+'.</span>':'<span lang="it">'+sentence(key,i)+'</span> · '+english(key,i)), '<a href="study-sheets.html?sheet=known-verbs-and-forms&stage=learn">Verb reference</a>']}],questions};}
function sheets(reference){const vmap=new Map((reference||[]).map(v=>[v.name,v]));const out=Object.keys(V).map(key=>{const s=makeSheet(key),v=V[key],r=vmap.get(key);s.study_sections[0].rows=SUBJECTS.map((sub,i)=>[i===2?'lui / lei / Lei / esso / essa':i===5?'loro / essi / esse':sub,'<span lang="it">'+v.forms[i]+'</span>',r?.sounds[i]||'']);return s;});
 for(const [type,keys] of [['irregular',['essere','avere','venire','stare','andare']],['regular',['vivere','abitare']]]){
 const title=type==='regular'?'Regular present · mixed practice':'Irregular verbs · mixed practice';
 out.push({slug:'practice-'+type+'-verbs',title,subtitle:'Choose the verb and use it in a complete sentence',practice:true,intro:sourceNote(),study_sections:[{stage:'learn',type:'table',title:'Compare the patterns',headers:['Verb','io','tu','Lei'],rows:keys.map(k=>[k,...V[k].forms.slice(0,3)])},{stage:'examples',type:'bullets',title:'Keep meaning and grammar together',items:keys.map(k=>'<span lang="it">'+sentence(k,0)+'</span> · '+english(k,0))}],questions:keys.flatMap(k=>{const qs=verbQuestions(k);return [qs[0],qs.find(q=>q.kind==='sentence'),qs.find(q=>q.kind==='phrase'),choice(k,2),matching(k)];})});
 }
 out.push({slug:'practice-things-pronouns',title:'Things and animals · esso, essa, essi, esse',subtitle:'Recognise the pronoun and practise singular/plural agreement',practice:true,intro:pair('The Session 6 tables include esso / essa and essi. Esse completes the feminine-plural comparison as added support.','Le tabelle della lezione 6 includono esso / essa ed essi. Esse completa il confronto al femminile plurale come approfondimento.'),study_sections:[{stage:'learn',type:'table',title:'Things and animals · pronoun forms',headers:['Pronoun','Gender and number','Essere'],rows:objectRows.map(([p,d])=>[p,d,p==='esso'||p==='essa'?'è':'sono'])},{stage:'examples',type:'bullets',title:'From the noun to the pronoun',items:[...objectRows.map(r=>'<span lang="it">'+r[2]+' → '+r[3]+'</span>'),pair('These are recognition exercises using formal/written pronouns. Essi/esse can also refer to people; they do not mean “things only”. In conversation, the noun or an omitted subject is often more natural.','Sono esercizi di riconoscimento con pronomi formali o scritti. Essi/esse possono riferirsi anche a persone, non solo a cose. Nella conversazione il nome o il soggetto sottinteso è spesso più naturale.'),'<a href="https://www.treccani.it/enciclopedia/pronomi-personali_%28Enciclopedia-dell%27Italiano%29/" target="_blank" rel="noopener">Treccani · supplementary usage note</a>']}],questions:objectQuestions()});return out;}
function enhance(input,categories,_config,reference){const data=JSON.parse(JSON.stringify(input));
 for(const s of data){
 if(s.slug==='l6-essere-class'){
  const table=s.study_sections.find(x=>x.title==='Essere · present tense');
  if(table){table.rows[2][0]='Lui / lei / Lei / esso / essa';table.rows[2][2]='He/she/it is; formal you are';table.rows[5][0]='Loro / essi / esse';}
 }
 }
 const added=sheets(reference);data.push(...added);
 categories.unshift({id:'verb-practice',title:'Repeatable verb practice',slugs:added.map(s=>s.slug)});
 return data;
}
function hash(text){let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
function shuffle(items,seed){const out=[...items];let n=hash(seed);function next(){n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function seed(slug){const key='italianPracticeSeedV1:'+slug;try{let s=sessionStorage.getItem(key);if(!s){s=String(Date.now())+':'+Math.random();sessionStorage.setItem(key,s);}return s;}catch(_){return slug;}}
function choices(q,slug,i){return q.worksheetOrder?[...q.choices]:shuffle(q.choices,seed(slug)+':'+(q.id||i));}
function normal(v){return String(v??'').normalize('NFC').toLocaleLowerCase('it').replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,' ').replace(/\s+/g,' ').trim();}
const api={V,SUBJECTS,enhance,sheets,shuffle,seed,choices,normal,pair,esc,version:'practice-20261111'};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.ItalianPracticeBank=api;
})(typeof window!=='undefined'?window:null);
