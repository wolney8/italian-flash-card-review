/* Lesson 9, 24 November 2026. Canonical source for web sheets and proposed Anki cards.
   Do not substitute examples for the unavailable handbook exercise text. */
(function(root){
'use strict';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lesson={id:'L9',date:'2026-11-24',title:'Second Conjugation: Regular -ERE Verbs',it:'Seconda coniugazione: verbi regolari in -ERE',
  description:'Present-tense -ERE verbs, comparing the three families, classroom sentences and assigned homework.',
  topics:['l9-conjugation-groups','l9-are-recap','l9-ere-class','l9-ere-homework'],extra:[]};
const sourceFiles={
  minutes:'Session 9 - 24.11.2026 - Minutes.pdf',
  presentation:'Session 9 - 24.11.2026.pptx',
  table:'Session 9 - 24.11.2026 - Tables.pdf',
  families:'Exercises on the 3 conjugations.pdf',
  class:'Esercizi verbi -ERE (Class).pdf',
  homework:'Homework verbi -ERE.pdf'
};
const people=['io','tu','lui / lei','noi','voi','loro'];
const endings=['o','i','e','iamo','ete','ono'];
const forms={
  prendere:['prendo','prendi','prende','prendiamo','prendete','prendono'],
  leggere:['leggo','leggi','legge','leggiamo','leggete','leggono'],
  vivere:['vivo','vivi','vive','viviamo','vivete','vivono'],
  vedere:['vedo','vedi','vede','vediamo','vedete','vedono'],
  correre:['corro','corri','corre','corriamo','correte','corrono'],
  scrivere:['scrivo','scrivi','scrive','scriviamo','scrivete','scrivono'],
  ricevere:['ricevo','ricevi','riceve','riceviamo','ricevete','ricevono'],
  ripetere:['ripeto','ripeti','ripete','ripetiamo','ripetete','ripetono'],
  perdere:['perdo','perdi','perde','perdiamo','perdete','perdono'],
  vendere:['vendo','vendi','vende','vendiamo','vendete','vendono']
};
const lesson9Examples=[
 ['prendere','taxi','Io prendo un taxi.','I get a taxi.','Transport: to get or take',0,4],
 ['prendere','coffee','Marco prende un caffè.','Marco has or orders a coffee.','Food and drink: to have or order',2,4],
 ['prendere','notes','Noi prendiamo appunti.','We take notes.','Notes: to take',3,4],
 ['prendere','bus','Gli studenti prendono l’autobus.','The students take the bus.','Transport: to take or catch',5,4],
 ['vivere','rome','Io vivo a Roma.','I live in Rome.','Where someone lives',0,4],
 ['vivere','mother','Lorenzo vive con la mamma.','Lorenzo lives with his mum.','Living with someone',2,4],
 ['vivere','countryside','La nonna vive in campagna.','Grandma lives in the countryside.','Where someone lives',2,4],
 ['vivere','siblings','I fratelli vivono insieme.','The siblings live together.','Living together',5,4],
 ['leggere','newspaper','Tu leggi il giornale.','You read the newspaper.','Reading',1,4],
 ['leggere','books','Maria legge molti libri.','Maria reads many books.','Reading',2,4],
 ['leggere','emails','Voi leggete le email?','Do you read the emails?','Reading',4,4],
 ['leggere','menu','Leggiamo il menu.','We read the menu.','Reading',3,4],
 ['vedere','film','Io vedo un film.','I watch a film.','Seeing or watching',0,4],
 ['vedere','friends','Noi vediamo gli amici.','We see our friends.','Seeing people',3,4],
 ['vedere','tv','Voi vedete la TV?','Do you watch TV?','Watching',4,4],
 ['vedere','match','I ragazzi vedono una partita.','The children watch a match.','Watching',5,4]
];
const section=(stage,title,titleIt,items)=>({stage,type:'bullets',title,titleIt,items});
const textLine=(text,label='Sentence',lang='it')=>({text,label,lang});
function question({id,task,stimulus=[],answer,choices,answers=[],hint='',source='minutes',page=2,activity='',n=null,type='text',mode='accent'}){
  const text=typeof stimulus==='string'?[textLine(stimulus)]:stimulus;
  const prompt='<span lang="en" data-ui-no-translate>'+escape(task)+'</span>'+text.map(line=>'<br><span lang="'+escape(line.lang)+'">'+escape(line.text)+'</span>').join('');
  return {id:'l9-'+id,type:choices?.length?'choice':type,kind:'word',task,stimulus:text,prompt,model:answer,answers:[answer,...answers],
    choices:choices||[],optional_subjects:[],answer_mode:mode,hint:escape(hint),explanation:'',
    source:sourceFiles[source],sourcePage:page,sourceActivity:activity,sourceItem:n,
    support:{hint:{en:hint,it:'',html:''},lines:[]}};
}
function matched(id,task,pairs,source,page,activity){
  const rows=pairs.map(([left,right],i)=>({id:'match-'+(i+1),left,right}));
  const answer=JSON.stringify(rows.map(row=>row.id));
  return {id:'l9-'+id,type:'match',kind:'word',task,stimulus:[],prompt:'<span lang="en" data-ui-no-translate>'+escape(task)+'</span>',model:answer,answers:[answer],
    pairs:rows,matchOptions:rows,extras:[],answer_mode:'match',optional_subjects:[],choices:[],hint:'Match each Italian infinitive with its English meaning.',
    source:sourceFiles[source],sourcePage:page,sourceActivity:activity,sourceItem:1};
}
function sheet(slug,title,it,subtitle,sourceKind,study_sections,questions){
  return {slug,title,titleIt:it,subtitle,subtitleIt:subtitle,intro:escape(subtitle),scope:'Lesson 9 · 24 November 2026',
    lesson:'L9',courseLesson:'L9',sourceKind,sourceItemCount:questions.length,responseCount:questions.length,study_sections,questions};
}
const familyWords=[
 ['parlare','-ARE'],['leggere','-ERE'],['dormire','-IRE'],['lavorare','-ARE'],
 ['scrivere','-ERE'],['partire','-IRE'],['abitare','-ARE'],['prendere','-ERE'],
 ['aprire','-IRE'],['mangiare','-ARE'],['vedere','-ERE'],['sentire','-IRE']
];
const familyQuestions=[
 ...[['first','-ARE','Parl___'],['second','-ERE','Legg___'],['third','-IRE','Dorm___']].map(([n,a,stem],i)=>
   question({id:'family-'+n,task:'Complete the infinitive ending for this conjugation.',stimulus:[textLine(stem,'Infinitive','it')],answer:a.slice(1),choices:['are','ere','ire'],hint:'Infinitives end in -ARE, -ERE or -IRE.',source:'families',page:1,activity:'1',n:i+1})),
 ...familyWords.map(([verb,answer],i)=>question({id:'sort-'+verb,task:'Choose the conjugation family for this infinitive.',stimulus:[textLine(verb,'Infinitive','it')],answer,choices:['-ARE','-ERE','-IRE'],hint:'Look at the final three letters.',source:'families',page:1,activity:'2',n:i+1})),
 matched('family-match-meanings','Match the six Italian verbs to their English meanings.',
 [['parlare','to speak'],['leggere','to read'],['dormire','to sleep'],['lavorare','to work'],['scrivere','to write'],['partire','to leave']], 'families',1,'3'),
 ...[['ballare','-ARE'],['prendere','-ERE'],['sentire','-IRE'],['abitare','-ARE'],['vedere','-ERE']].map(([verb,answer],i)=>
   question({id:'circle-'+verb,task:'Choose the correct conjugation for this verb.',stimulus:[textLine(verb,'Verb','it')],answer,choices:['-ARE','-ERE','-IRE'],hint:'Look at the infinitive ending.',source:'families',page:2,activity:'4',n:i+1}))
];
const classVerbs=['prendere','leggere','vivere','vedere','correre'];
const classQuestions=classVerbs.flatMap((verb,j)=>forms[verb].map((answer,i)=>question({
  id:'class-'+verb+'-'+people[i].replace(/\W+/g,'-'),
  task:'Write the complete present-tense form of '+verb+' for this subject.',
  stimulus:[textLine(people[i],'Subject','it')],answer,
  hint:people[i]+' takes the regular -ERE ending -'+endings[i]+'.',
  source:'class',page:j<2?1:2,activity:'1',n:j*6+i+1
})));
const areRecap=[
 ['Io ___ in una scuola. (lavorare)','lavoro'],['Tu ___ in un ristorante. (lavorare)','lavori'],
 ['Il medico ___ in ospedale. (lavorare)','lavora'],['Noi ___ italiano. (studiare)','studiamo'],
 ['Io ___ il cuoco. (fare)','faccio'],['Loro ___ bene. (stare)','stanno'],
 ['Marco ___ il professore. (fare)','fa'],['Voi ___ a casa. (stare)','state'],
 ['Lucia ___ una torta. (fare)','fa'],['___ freddo! (fare)','fa'],
 ['Loro ___ inglese. (studiare)','studiano'],['Luca ___ spagnolo. (parlare)','parla']
].map(([stimulus,answer],i)=>question({id:'are-recap-'+(i+1),task:'Fill the gap with the correct present-tense verb.',stimulus,answer,
 hint:'Choose the form that matches the subject. Fare and stare are irregular.',source:'presentation',page:11,activity:'Class gap fill',n:i+1}));
const matches=[['leggere','to read'],['prendere','to take'],['vivere','to live'],['scrivere','to write'],['vedere','to see or watch'],
 ['ricevere','to receive'],['ripetere','to repeat'],['correre','to run'],['perdere','to lose'],['vendere','to sell']];
const homeworkQuestions=[matched('homework-match-verbs','Match the ten Italian infinitives with their English meanings.',matches,'homework',1,'1')];
const homeworkGaps=[
 ['Io ___ un libro. (leggere)','leggo'],['Tu ___ un caffè. (prendere)','prendi'],
 ['Maria ___ una lettera. (scrivere)','scrive'],['Noi ___ in Inghilterra. (vivere)','viviamo'],
 ['Voi ___ un film. (vedere)','vedete'],['Loro ___ il giornale. (leggere)','leggono'],
 ['Io ___ un messaggio. (ricevere)','ricevo'],['Tu ___ la parola. (ripetere)','ripeti'],
 ['Marco ___ le chiavi. (perdere)','perde'],['Noi ___ al parco. (correre)','corriamo']
];
homeworkQuestions.push(...homeworkGaps.map(([stimulus,answer],i)=>question({id:'homework-gap-'+(i+1),
 task:'Complete the sentence using the present-tense form of the verb in brackets.',stimulus,answer,
 hint:'Remove -ERE, then add the ending for the subject.',source:'homework',page:i<5?1:2,activity:'2',n:i+1})));
const homeworkEndings=[
 ['Io prend___ un tè.','o',['o','i','e']],['Tu legg___ un libro.','i',['o','i','ete']],
 ['Lei scriv___ un’email.','e',['e','i','ono']],['Noi viv___ in UK.','iamo',['iamo','ete','ono']],
 ['Voi vend___ la macchina.','ete',['e','ete','ono']],['Loro ripet___ la frase.','ono',['o','e','ono']]
];
homeworkQuestions.push(...homeworkEndings.map(([stimulus,answer,choices],i)=>question({id:'homework-ending-'+(i+1),
 task:'Choose the missing regular -ERE ending.',stimulus,answer,choices,
 hint:'Check whether the subject is singular or plural.',source:'homework',page:2,activity:'3',n:i+1})));
const translations=[
 ['I read a book.','Leggo un libro.',['Io leggo un libro.']],
 ['You (singular) have a coffee.','Prendi un caffè.',['Tu prendi un caffè.']],
 ['She writes an email.','Scrive un’email.',['Lei scrive un’email.']],
 ['We live in England.','Viviamo in Inghilterra.',['Noi viviamo in Inghilterra.']],
 ['You (plural) watch a film.','Vedete un film.',['Voi vedete un film.']],
 ['They receive a message.','Ricevono un messaggio.',['Loro ricevono un messaggio.']]
];
homeworkQuestions.push(...translations.map(([stimulus,answer,answers],i)=>question({id:'homework-translate-'+(i+1),
 task:'Translate this sentence into Italian. Write the whole sentence.',stimulus:[textLine(stimulus,'English','en')],answer,answers,
 hint:'A subject pronoun may be omitted when the verb ending is clear.',source:'homework',page:2,activity:'4',n:i+1})));
const examples=lesson9Examples.map(([verb,id,italian,english,category,person,page])=>({verb,id,italian,english,category,person,page,source:sourceFiles.minutes}));
const sheets=[
 sheet('l9-conjugation-groups','Recognise the Three Conjugations','Riconoscere le tre coniugazioni',
 'Class exercise: complete, group, match and identify -ARE, -ERE, -IRE.','Class practice',[
  section('learn','Three endings, three families','Tre desinenze, tre coniugazioni',[
   'The infinitive ends in -ARE, -ERE or -IRE. This tells you the family, not whether a verb is irregular.',
   '<span lang="it">parlare</span> (to speak), <span lang="it">leggere</span> (to read), <span lang="it">dormire</span> (to sleep).'
  ]),
  {stage:'examples',type:'table',title:'Three conjugations',titleIt:'Tre coniugazioni',headers:['1st -ARE','2nd -ERE','3rd -IRE'],headersIt:['1a -ARE','2a -ERE','3a -IRE'],rows:[['lavorare','vivere','dormire'],['mangiare','leggere','aprire'],['parlare','scrivere','finire']]}
 ],familyQuestions),
 sheet('l9-are-recap','First-Conjugation Recap','Ripasso della prima coniugazione',
 'Class slides: complete twelve sentences, including fare and stare.','Class practice',[
  section('learn','-ARE recap and exceptions','Ripasso di -ARE ed eccezioni',[
   'For regular -ARE present-tense verbs, the six endings are -o, -i, -a, -iamo, -ate, -ano.',
   'The verbs <span lang="it">fare</span> and <span lang="it">stare</span> are irregular. Learn their actual forms rather than inventing an -ARE ending.'
  ])
 ],areRecap),
 sheet('l9-ere-class','Regular -ERE Verb Tables','Tabelle dei verbi regolari in -ERE',
 'Class worksheet: conjugate five regular -ERE verbs for all six subjects.','Class practice',[
  section('learn','Stem plus ending','Radice e desinenza',[
   'Start with the infinitive: <span lang="it">prendere</span>. Remove -ERE, leaving <span lang="it">prend-</span>. Add the ending that matches the subject.',
   'The regular -ERE present endings are -o, -i, -e, -iamo, -ete, -ono. The pronoun is often omitted because the ending identifies the subject.',
   'Laura points to Nuovo Espresso Plus 1 page 233 for further grammar reference.'
  ]),
  {stage:'examples',type:'table',title:'Prendere and endings',titleIt:'Prendere e le desinenze',
   headers:['Subject','Ending','Prendere'],headersIt:['Soggetto','Desinenza','Prendere'],
   rows:people.map((person,i)=>[person,'-'+endings[i],forms.prendere[i]])}
 ],classQuestions),
 sheet('l9-ere-homework','-ERE Homework Exercises 1 to 4','Compiti: verbi -ERE, esercizi da 1 a 4',
 'Assigned homework: match meanings, fill sentences, choose endings and translate.','Homework',[
  section('learn','Use the regular -ERE endings','Usa le desinenze regolari in -ERE',[
   'Check the subject first. Then remove -ERE and add the present-tense ending.',
   'Exercise 5 of Laura’s homework is personal writing. Complete it in your book: Io leggo..., Io prendo..., Io vivo..., Io vedo..., Io scrivo.... This is not automatically graded.'
  ])
 ],homeworkQuestions)
];
function makeCard(key,deck,task,cue,answer,meaning,pattern,src){
 const instruction='<p class="instruction" lang="en" data-ui-no-translate>'+escape(task)+'</p>';
 const prompt=instruction+'<div class="recall-cue"><span class="recall-cue-label">English</span><span lang="en">'+escape(cue)+'</span></div>';
 return {key:'l9-'+key,lesson:'L9',deck,panel:'<div class="panel-head"><div class="panel-title">Lesson 9</div></div>',
  prompt,answer:escape(answer),meaning:escape(meaning),pattern:escape(pattern),reference:escape(src),usage:'',literal:'',pron:'',clarification:''};
}
const cards=[
 ...examples.map(row=>makeCard('sentence-'+row.verb+'-'+row.id,'02 Laura’s Model Sentences',
  'Write the complete Italian sentence for this English meaning.',row.english,row.italian,row.english,
  'Regular -ERE present · '+row.category,sourceFiles.minutes+' p. '+row.page+'; '+sourceFiles.table+' p. 3')),
 ...[
  ['stem','What remains after removing -ERE from prendere?','prend-','Stem of prendere','Start with the infinitive, remove -ERE and add the appropriate ending.'],
  ['ending-io','For io, what is the regular -ERE present ending?','-o','First-person singular ending','e.g. prend-o, legg-o, viv-o'],
  ['ending-tu','For tu, what is the regular -ERE present ending?','-i','Second-person singular ending','e.g. prend-i, legg-i, viv-i'],
  ['ending-lui','For lui, lei or formal Lei, what is the regular -ERE present ending?','-e','Third-person singular ending','e.g. prend-e, legg-e, viv-e'],
  ['endings-plural','Which endings follow noi, voi and loro with regular -ERE verbs?','-iamo, -ete, -ono','Three plural endings','Keep the subject order: noi, voi, loro.'],
  ['subject-omission','Why is the subject pronoun often omitted in Italian?','The verb ending usually identifies the subject.','Subject pronouns','Use the verb ending to identify who performs the action.']
 ].map(([key,cue,answer,meaning,pattern])=>makeCard('rule-'+key,'01 -ERE Patterns',
   'Recall the rule from Laura’s lesson.',cue,answer,meaning,pattern,sourceFiles.minutes+' p. 2'))
];
root.ItalianLesson9={lesson,sourceFiles,forms,endings,examples,sheets,cards,version:'2026-11-26-source-review'};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ItalianLesson9;
})(typeof window!=='undefined'?window:globalThis);
