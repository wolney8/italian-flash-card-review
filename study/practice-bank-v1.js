/* Repeatable exercises derived from the existing course verb reference.
 * Source homework is retained. New tasks and added distractors are labelled adaptations.
 * No Anki/card data is read or modified. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=(en,it)=>'<span class="editorial-label"><span lang="en" class="editorial-label-main">'+String(en).replace(/\s*\u2014\s*/g,': ')+'</span><span lang="it" class="editorial-label-sub">'+String(it).replace(/\s*\u2014\s*/g,': ')+'</span></span>';
const SUBJECTS=['Io','Tu','Lei','Noi','Voi','Loro'];
const V={
 essere:{forms:['sono','sei','è','siamo','siete','sono'],en:'to be',kind:'irregular',tail:'a casa',gloss:'at home',reds:['ho','vengo']},
 avere:{forms:['ho','hai','ha','abbiamo','avete','hanno'],en:'to have',kind:'irregular',tail:'fame',gloss:'hungry',reds:['sono','vengo']},
 venire:{forms:['vengo','vieni','viene','veniamo','venite','vengono'],en:'to come',kind:'irregular',tail:'da Napoli',gloss:'from Naples',reds:['sono','ho']},
 stare:{forms:['sto','stai','sta','stiamo','state','stanno'],en:'to be / feel / stay',kind:'irregular',sound:'STAH-reh',tail:'bene',gloss:'well',reds:['ho','vengo'],support:true},
 andare:{forms:['vado','vai','va','andiamo','andate','vanno'],en:'to go',kind:'irregular',tail:'a casa',gloss:'home',reds:['sono','ho'],support:true},
 vivere:{forms:['vivo','vivi','vive','viviamo','vivete','vivono'],en:'to live',kind:'regular-present',tail:'in Italia',gloss:'in Italy',reds:['sono','ho']},
 abitare:{forms:['abito','abiti','abita','abitiamo','abitate','abitano'],en:'to live / reside',kind:'regular-present',tail:'a Napoli',gloss:'in Naples',reds:['sono','ho']},
 chiamarsi:{forms:['mi chiamo','ti chiami','si chiama','ci chiamiamo','vi chiamate','si chiamano'],en:'to be called',kind:'reflexive',tail:'',gloss:'',reds:['ho','vengo'],support:true}
};
function english(v,i){const pron=['I','You','You','We','You all','They'][i],be=['am','are','are','are','are','are'][i];return v==='essere'?pron+' '+be+' at home.':v==='avere'?pron+' '+be+' hungry.':v==='venire'?pron+' come from Naples.':v==='stare'?pron+' '+be+' well.':v==='andare'?pron+' go home.':v==='vivere'?pron+' live in Italy.':pron+' live in Naples.';}
function sentence(key,i){const v=V[key];return SUBJECTS[i]+' '+v.forms[i]+(v.tail?' '+v.tail:'')+'.';}
function text(prompt,model,answers,hint,kind='word') {return {type:'text',prompt,model,answers:answers||[model],hint,optional_subjects:[],answer_mode:'accent',kind,adapted:true,choices:[]};}
const formsHint=key=>pair('Use the present form of '+key+'. Keep accents; formal Lei uses the third-person singular.','Usa il presente di '+key+'. Mantieni gli accenti; il Lei formale usa la terza persona singolare.');
function choice(key,i){const v=V[key],right=v.forms[i],wrong=[...new Set(v.forms)].filter(f=>f!==right).slice(0,3);return {type:'choice',kind:'choice',prompt:'Use <b>'+key+'</b>: '+SUBJECTS[i]+' <b>_____</b>'+ (v.tail?' '+v.tail:'')+'.'+(i===2?' <small>(formal you)</small>':''),model:right,answers:[right],choices:[right,...wrong,...v.reds],redHerrings:v.reds,hint:formsHint(key),explanation:pair('The subject is '+SUBJECTS[i]+'. Use '+right+' from '+key+'. The two distractors use a different verb.','Il soggetto è '+SUBJECTS[i]+'. Usa '+right+' da '+key+'. Le due alternative fuorvianti appartengono a un altro verbo.'),answer_mode:'accent',optional_subjects:[],adapted:true};}
function matching(key){const v=V[key],left=key==='chiamarsi'?['I am called','You are called (informal)','You are called (formal)','We are called','You all are called','They are called']:SUBJECTS.map((_,i)=>english(key,i)+(i===1?' (informal)':i===2?' (formal)':''));const pairs=SUBJECTS.map((s,i)=>({id:String(i),left:left[i],right:key==='chiamarsi'?s+' '+v.forms[i]:sentence(key,i).replace(/\.$/,'')}));const model=JSON.stringify(pairs.map(p=>p.id));return {type:'match',kind:'matching',prompt:pair('Match each meaning to the complete Italian phrase.','Abbina ogni significato alla frase italiana completa.'),pairs,model,answers:[model],hint:pair('Match the person and the verb. Two extra phrases do not belong to this verb.','Abbina la persona e il verbo. Due frasi in più non appartengono a questo verbo.'),choices:[],extras: v.reds.map((f,i)=>({id:'x'+i,right:'Io '+f+(f==='ho'?' fame.':f==='vengo'?' da Roma.':f==='sono'?' a casa.':'.')})),explanation:pair('One point per complete matching task. Each row keeps its subject so identical verb forms are not ambiguous.','Un punto per l’abbinamento completo. Ogni frase conserva il soggetto per distinguere le forme verbali identiche.'),answer_mode:'match',optional_subjects:[],adapted:true};}
function verbQuestions(key){const v=V[key],out=[];
 for(let i=0;i<6;i++)out.push(text('Complete with <b>'+key+'</b>: '+SUBJECTS[i]+' <b>_____</b>'+ (v.tail?' '+v.tail:'')+'.',v.forms[i],null,formsHint(key),'word'));
 for(let i=0;i<3;i++){
  if(key==='chiamarsi'){
   const names=['Marco','Anna','Luca'];const a=SUBJECTS[i]+' '+v.forms[i]+' '+names[i]+'.';
   out.push(text('Write the full sentence. Use <b>chiamarsi</b> and <b>'+SUBJECTS[i]+'</b>: '+['My name is Marco.','Your name is Anna. (informal)','Your name is Luca. (formal)'][i],a,null,formsHint(key),'sentence'));
  }else out.push(text('Write the full sentence. Use <b>'+key+'</b> and <b>'+SUBJECTS[i]+'</b>: '+english(key,i)+(i===1?' (informal)':i===2?' (formal)':''),sentence(key,i),null,formsHint(key),'sentence'));
 }
 for(let i=0;i<3;i++)out.push(text('Complete the negative phrase using <b>non</b> + <b>'+key+'</b>: '+SUBJECTS[i]+' <b>_____</b>'+ (v.tail?' '+v.tail:'')+'.','non '+v.forms[i],null,pair('Put non before the verb phrase.','Metti non prima del gruppo verbale.'),'phrase'));
 for(let i=0;i<3;i++)out.push(choice(key,i));
 out.push(matching(key));return [...out.slice(0,3),...out.slice(6,15),...out.slice(3,6),out[15]];
}
const objectRows=[['esso','singular masculine','Il gatto è nero.','Esso è nero.'],['essa','singular feminine','La mela è rossa e dolce.','Essa è rossa e dolce.'],['essi','plural masculine','I libri sono sul tavolo.','Essi sono sul tavolo.'],['esse','plural feminine','Le stelle sono nel cielo.','Esse sono nel cielo.']];
function objectQuestions(){const out=[];objectRows.forEach(([pron,desc,full,model])=>{
 const v=pron==='esso'||pron==='essa'?'è':'sono';
 out.push(text(full+' Replace the noun with the traditional pronoun: <b>_____</b> '+model.split(' ').slice(1).join(' '),pron,null,pair('Use the noun’s gender and number.','Usa il genere e il numero del nome.'),'word'));
 out.push(text('Complete: '+model.replace(' '+v+' ',' <b>_____</b> '),v,null,formsHint('essere'),'word'));
 out.push(text('Rewrite with <b>'+pron+'</b>, keeping the rest of the sentence: '+full,model,null,pair('The verb follows singular or plural; the pronoun follows the noun’s gender.','Il verbo concorda con singolare o plurale; il pronome segue il genere del nome.'),'sentence'));
 const wrong=['esso','essa','essi','esse'].filter(p=>p!==pron);
 out.push({type:'choice',kind:'choice',prompt:'Which traditional pronoun replaces <b>'+full.split(' ').slice(0,2).join(' ')+'</b> ('+desc+')?',model:pron,answers:[pron],choices:[pron,...wrong,'suo','qui'],redHerrings:['suo','qui'],hint:pair('Compare esso / essa / essi / esse.','Confronta esso / essa / essi / esse.'),explanation:pair('Suo is possessive and qui means here. Neither is the requested subject pronoun.','Suo è possessivo e qui indica un luogo. Nessuno dei due è il pronome soggetto richiesto.'),answer_mode:'accent',optional_subjects:[],adapted:true});
 });return out;}
function sourceNote(key){return pair('Adapted practice from the existing course verb reference. Original homework remains in its own sets.','Esercizi adattati dalla guida ai verbi del corso. I compiti originali restano nei propri gruppi.')+(V[key]?.support?' '+pair('Some complete forms extend the expressions encountered in class; see the verb reference for the source boundary.','Alcune forme complete ampliano le espressioni incontrate a lezione; consulta i limiti delle fonti nella guida ai verbi.'):'');}
function makeSheet(key){const v=V[key],questions=verbQuestions(key);const hint=key==='vivere'?'Regular in this present-tense exercise; other tenses have irregular forms.':key==='chiamarsi'?'Reflexive: keep mi / ti / si / ci / vi / si with the verb.':v.kind==='irregular'?'Learn the irregular forms; do not apply one regular ending pattern.':'Compare the repeating stem and the present endings.';
 return {slug:'practice-'+key,title:'Practise '+key,subtitle:v.kind==='irregular'?'Irregular verb — mixed exercises':v.kind==='reflexive'?'Reflexive verb — mixed exercises':'Regular present — mixed exercises',practice:true,intro:sourceNote(key),scope:'Adapted course practice',study_sections:[{stage:'learn',type:'table',title:key+' — forms and pronunciation',headers:['Subject','Form','Approximate pronunciation'],rows:[]},{stage:'examples',type:'bullets',title:'Use the whole sentence',items:[hint,...[0,1,2].map(i=>key==='chiamarsi'?'<span lang="it">'+SUBJECTS[i]+' '+v.forms[i]+' '+['Marco','Anna','Luca'][i]+'.</span>':'<span lang="it">'+sentence(key,i)+'</span> — '+english(key,i)), '<a href="study-sheets.html?sheet=known-verbs-and-forms&stage=learn">Verb reference</a>']}],questions};}
function sheets(reference){const vmap=new Map((reference||[]).map(v=>[v.name,v]));const out=Object.keys(V).map(key=>{const s=makeSheet(key),v=V[key],r=vmap.get(key);s.study_sections[0].rows=SUBJECTS.map((sub,i)=>[i===2?'lui / lei / Lei / esso / essa':i===5?'loro / essi / esse':sub,'<span lang="it">'+v.forms[i]+'</span>',r?.sounds[i]||'']);return s;});
 for(const [type,keys] of [['irregular',['essere','avere','venire','stare','andare']],['regular',['vivere','abitare']]]){
 const title=type==='regular'?'Regular present — mixed practice':'Irregular verbs — mixed practice';
 out.push({slug:'practice-'+type+'-verbs',title,subtitle:'Choose the verb and use it in a complete sentence',practice:true,intro:sourceNote(),study_sections:[{stage:'learn',type:'table',title:'Compare the patterns',headers:['Verb','io','tu','Lei'],rows:keys.map(k=>[k,...V[k].forms.slice(0,3)])},{stage:'examples',type:'bullets',title:'Keep meaning and grammar together',items:keys.map(k=>'<span lang="it">'+sentence(k,0)+'</span> — '+english(k,0))}],questions:keys.flatMap(k=>{const qs=verbQuestions(k);return [qs[0],qs.find(q=>q.kind==='sentence'),qs.find(q=>q.kind==='phrase'),choice(k,2),matching(k)];})});
 }
 out.push({slug:'practice-things-pronouns',title:'Things and animals — esso, essa, essi, esse',subtitle:'Recognise the pronoun and practise singular/plural agreement',practice:true,intro:pair('The Session 6 tables include esso / essa and essi. Esse completes the feminine-plural comparison as added support.','Le tabelle della lezione 6 includono esso / essa ed essi. Esse completa il confronto al femminile plurale come approfondimento.'),study_sections:[{stage:'learn',type:'table',title:'Things and animals — pronoun forms',headers:['Pronoun','Gender and number','Essere'],rows:objectRows.map(([p,d])=>[p,d,p==='esso'||p==='essa'?'è':'sono'])},{stage:'examples',type:'bullets',title:'From the noun to the pronoun',items:[...objectRows.map(r=>'<span lang="it">'+r[2]+' → '+r[3]+'</span>'),pair('These are recognition exercises using formal/written pronouns. Essi/esse can also refer to people; they do not mean “things only”. In conversation, the noun or an omitted subject is often more natural.','Sono esercizi di riconoscimento con pronomi formali o scritti. Essi/esse possono riferirsi anche a persone, non solo a cose. Nella conversazione il nome o il soggetto sottinteso è spesso più naturale.'),'<a href="https://www.treccani.it/enciclopedia/pronomi-personali_%28Enciclopedia-dell%27Italiano%29/" target="_blank" rel="noopener">Treccani — supplementary usage note</a>']}],questions:objectQuestions()});return out;}
function expand(q,key,config){if(q.type!=='choice')return q;
 if(q.redHerrings){if(q.choices.length<6)throw Error('Insufficient options: '+key);return q;}
 const x=config[key];if(!x)throw Error('Missing authored distractors: '+key);
 return {...q,sourceChoices:[...q.choices],choices:[...q.choices,...x.extra],redHerrings:[...x.redHerrings],prompt:x.prompt||q.prompt,adapted:true,explanation:(q.explanation||'')+'<p>'+pair('Practice adaptation: extra choices added; the original answer is unchanged.','Adattamento: aggiunte nuove opzioni; la risposta originale non cambia.')+'</p><p>'+pair(esc(x.reason),'Queste due alternative riguardano un altro significato o un’altra funzione grammaticale: non rispondono a questa domanda.')+'</p>'};}
function enhance(input,categories,config,reference){const data=JSON.parse(JSON.stringify(input));
 for(const s of data){s.questions=s.questions.map((q,i)=>expand(q,s.slug+'-q'+(i+1),config));
 if(s.slug==='l6-essere-class'){
  const table=s.study_sections.find(x=>x.title==='Essere — present tense');
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
function choices(q,slug,i){return shuffle(q.choices,seed(slug)+':'+(q.id||i));}
function normal(v){return String(v??'').normalize('NFC').toLocaleLowerCase('it').replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,' ').replace(/\s+/g,' ').trim();}
const api={V,SUBJECTS,enhance,sheets,shuffle,seed,choices,normal,pair,esc,version:'practice-20261111'};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.ItalianPracticeBank=api;
})(typeof window!=='undefined'?window:null);
