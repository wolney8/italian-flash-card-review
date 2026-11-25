#!/usr/bin/env node
'use strict';
// One approved bank feeds the native web cards and the additive Anki package.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),DIR=path.join(ROOT,'daily-verb-cards');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const parse=file=>JSON.parse(read(file));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const window={};vm.runInNewContext(read('study/daily-verbs.js'),{window});
const {verbs,courseGroups}=window.ItalianDailyVerbs;
const pronunciation=parse('daily-verb-cards/pronunciation.json');
const phrasePronunciation=parse('daily-verb-cards/phrase-pronunciation.json');
const existing=parse('daily-verb-cards/existing-coverage.json');
const loader=read('course-data-loader-v1.js');
function compressedGroup(name){
  const declaration=loader.match(new RegExp('const '+name+' = \\[([\\s\\S]*?)\\];'))[1];
  const files=[...declaration.matchAll(/'([^']+)'/g)].map(match=>match[1]);
  return JSON.parse(zlib.gunzipSync(Buffer.from(files.map(file=>read(file).trim()).join(''),'base64')));
}
const previous={};for(const file of ['lesson6/content.js','lesson7/content.js'])vm.runInNewContext(read(file),{window:previous});
const oldCards=[...compressedGroup('CORE_FILES').filter(card=>card.lesson!=='L5'),...compressedGroup('LESSON5_FILES'),
  ...previous.ITALIAN_L6.cards,...previous.ITALIAN_L7.cards,...parse('lesson8-practice/cards.json')];
const oldKeys=new Set(oldCards.map(card=>card.key));
if(oldCards.length!==623||oldKeys.size!==623)throw new Error('Existing 623-card baseline changed; review coverage first.');
const people=[['io','I'],['tu','you, one person informally'],['lui / lei / Lei','he / she / you politely'],['noi','we'],['voi','you, several people'],['loro','they']];
const decks={are:'01 Regular -ARE forms',ere:'02 Regular -ERE forms',ire:'03 Regular -IRE forms',irregular:'04 Irregular present forms',patterns:'05 Verb patterns',uses:'06 Everyday verb uses'};
const cards=[],formCoverage=[],usageCoverage=[];
const baseEnglish={essere:['am','is'],avere:['have','has'],fare:['do or make','does or makes'],stare:['stay or feel','stays or feels'],venire:['come','comes'],andare:['go','goes'],chiamarsi:['am called','is called'],lavorare:['work','works'],parlare:['speak','speaks'],abitare:['live','lives'],studiare:['study','studies'],mangiare:['eat','eats'],vivere:['live','lives'],vedere:['see','sees'],leggere:['read','reads'],scrivere:['write','writes'],dormire:['sleep','sleeps'],aprire:['open','opens'],finire:['finish','finishes'],dire:['say or tell','says or tells'],significare:['mean','means'],potere:['can','can'],ripetere:['repeat','repeats'],volere:['want','wants'],dare:['give','gives'],capire:['understand','understands'],scusare:['excuse','excuses'],uscire:['go out','goes out'],dispiacere:['cause regret','causes regret'],bere:['drink','drinks'],lavare:['wash','washes'],salutare:['greet','greets'],telefonare:['phone','phones'],bruciare:['burn','burns'],prendere:['take','takes']};
function meaning(verb,index){
  const [base,third]=baseEnglish[verb.name];
  if(verb.name==='essere')return ['I am','you are, one person informally','he/she is; you are, politely','we are','you are, several people','they are'][index];
  if(verb.name==='chiamarsi')return ['I am called','you are called, one person informally','he/she is called; you are called, politely','we are called','you are called, several people','they are called'][index];
  return index===2?'he/she '+third+'; you '+base+', politely':[['I',base],['you',base],[],['we',base],['you',base],['they',base]][index].join(' ');
}
function table(verb){return '<div class="l7-form-list">'+people.map(([person],index)=>'<div class="l7-form-row"><span>'+esc(person)+'</span><b>'+esc(verb.forms[index])+'</b></div>').join('')+'</div>';}
function rule(verb){
  const family=courseGroups[verb.courseGroup],regularity=verb.kind==='regular'?'Regular in the present.':'Irregular in the present: learn each form.';
  const pattern=verb.isc?' Add -isc- for io, tu, lui/lei/Lei and loro. Noi and voi use the shorter stem.':verb.reflexive?' Keep the matching reflexive word: mi, ti, si, ci, vi, si.':verb.hardC?' H keeps the hard C sound before i: significhi, significhiamo.':verb.singleI?' Keep one i in forms such as '+(verb.name==='studiare'?'studi and studiamo':verb.name==='mangiare'?'mangi and mangiamo':'bruci and bruciamo')+'.':'';
  return '<p>'+esc(family)+'. '+esc(regularity+pattern)+'</p>'+table(verb);
}
function add(card){
  if(oldKeys.has(card.key)||cards.some(row=>row.key===card.key))throw new Error('Duplicate new key: '+card.key);
  if(JSON.stringify(card).includes('\u2014'))throw new Error('Em dash in new card: '+card.key);
  cards.push({guide:'',ipa:'',hint:'',meaning:'',usage:'',rule:'',answerLang:card.kind==='pattern'?'en':'it',...card});
}
for(const verb of verbs){
  if(!pronunciation.forms[verb.name]||pronunciation.forms[verb.name].length!==6)throw new Error('Missing pronunciation rows: '+verb.name);
  for(let index=0;index<6;index++){
    const reused=existing.forms[verb.name]?.[index];
    const key=reused||'italian-daily-verb-'+verb.name+'-present-'+['io','tu','lei','noi','voi','loro'][index];
    formCoverage.push({verb:verb.name,person:index,form:verb.forms[index],key,deck:decks[verb.kind==='irregular'?'irregular':verb.courseGroup],status:reused?'existing':'new'});
    if(reused){if(!oldKeys.has(key))throw new Error('Missing reused form: '+key);continue;}
    const [guide,ipa]=pronunciation.forms[verb.name][index];
    const support=verb.name==='dispiacere'?'The everyday expression is mi dispiace, meaning I am sorry. The full table is reference practice.':verb.name==='scusare'?'This is the present indicative. Scusa! and Scusi! can also be polite requests; their use depends on the sentence.':index===2?'Formal Lei uses this same form. Esso and essa also use the third-person singular.':'';
    add({key,kind:'form',verb:verb.name,person:index,deck:decks[verb.kind==='irregular'?'irregular':verb.courseGroup],
      task:'Say the present-tense form of '+verb.name+'.',
      cues:[{label:'Verb meaning',text:verb.meaning,lang:'en'},{label:'Subject',text:people[index][0],lang:'it'},{label:'Who?',text:people[index][1],lang:'en'}],
      hint:verb.reflexive?'Include the matching reflexive word.':'Say only the verb form.',answer:verb.forms[index],guide,ipa,
      meaning:meaning(verb,index),usage:support,rule:rule(verb),sourceClass:'ADDED STUDY SUPPORT',
      source:'Present-indicative reference practice. Course connection: '+verb.source});
  }
  for(const use of verb.uses){
    const reused=existing.uses[verb.name]?.[use.id];
    const key='italian-daily-use-'+verb.name+'-'+use.id;
    usageCoverage.push({verb:verb.name,use:use.id,italian:use.italian,keys:reused?(Array.isArray(reused)?reused:[reused]):[key],status:reused?'existing':'new'});
    if(reused){for(const k of Array.isArray(reused)?reused:[reused])if(!oldKeys.has(k))throw new Error('Missing reused phrase: '+k);continue;}
    const support=phrasePronunciation[verb.name+':'+use.id];
    if(!support)throw new Error('Missing phrase pronunciation: '+verb.name+':'+use.id);
    let answer=use.italian.replace(/\s*\(essere [^)]+\)/,'');
    let target=use.english,hint='',task='Say this in Italian. Use '+verb.name+'.';
    if(verb.name==='essere'&&use.id==='laura-use-18-1'){target='You are Italian.';hint='Speak to one woman informally.';}
    if(verb.name==='essere'&&use.id==='laura-use-22-1')target='I am at home.';
    if(verb.name==='fare'&&['laura-use-27-1','laura-use-27-2'].includes(use.id))hint='Use the infinitive and the definite article.';
    if(verb.name==='fare'&&use.id==='laura-use-27-2')hint='Talk about a male nurse. Use the infinitive and the definite article.';
    if(verb.name==='fare'&&['laura-use-28-1','laura-use-28-2'].includes(use.id))hint='Describe the weather.';
    if(verb.name==='fare'&&use.id==='job-question')hint='Ask one friend informally.';
    if(verb.name==='fare'&&use.id==='job-cook')hint='Use the masculine job title cuoco.';
    if(verb.name==='stare'&&use.id==='laura-use-32-1'){target='to be standing';hint='Use the infinitive.';}
    if(verb.name==='stare'&&use.id==='laura-use-32-2'){answer='stare seduto';target='to be sitting';hint='Use the infinitive and the masculine singular adjective.';}
    if(verb.name==='stare'&&use.id==='laura-use-33-1'){task='Give this instruction in Italian. Use stare.';hint='Speak to one man informally.';}
    if(verb.name==='stare'&&use.id==='wellbeing-question')hint='Ask one friend informally. Include today.';
    if(verb.name==='stare'&&use.id==='laura-use-34-1')hint='Speak to one person informally. Use d’incanto for beautifully.';
    if(verb.name==='lavorare'&&use.id==='workplace-question')hint='Ask one friend informally.';
    if(verb.name==='abitare')hint='Ask one friend informally.';
    if(verb.name==='mangiare'&&use.id==='pizza')hint='Ask one friend informally. Include la before pizza.';
    if(verb.name==='volere')hint='Ask one friend informally.';
    if(verb.name==='dormire')hint='Use the masculine noun bambino for child.';
    if(verb.name==='scusare')hint='Speak to one person informally. Use the short request.';
    if(verb.name==='prendere'&&['have-coffee','have-sandwich'].includes(use.id))hint='Order in a café. Use the present tense.';
    const [guide,ipa]=support;
    let usage=use.category+'. '+(use.note||'');
    if(verb.name==='prendere')usage+=' This is an added model example for the confirmed verb prendere; the lesson’s exact examples are still awaited.';
    if(verb.name==='prendere'&&use.id==='catch-bus')usage+=' In the reading guide, OW rhymes with now.';
    if(verb.name==='stare'&&use.id==='laura-use-32-2')usage+=' Feminine: stare seduta.';
    add({key,kind:'use',verb:verb.name,useId:use.id,deck:decks.uses,task,cues:[{label:'In English',text:target,lang:'en'}],hint,
      answer,guide:verb.name==='prendere'&&use.id==='catch-bus'?'PREN-doh l-OW-toh-boos':guide,ipa,
      meaning:target,usage:usage.trim(),rule:rule(verb),sourceClass:use.source.kind==='laura'?'COURSE MATERIAL':'ADDED STUDY SUPPORT',
      source:use.source.kind==='laura'?use.source.file+' · '+use.source.location:use.source.label+(use.source.url?' · '+use.source.url:'')});
  }
}
function pattern(id,task,cues,answer,usage,ruleText,source){add({key:'italian-daily-pattern-'+id,kind:'pattern',deck:decks.patterns,task,cues,answer,usage,rule:'<p>'+esc(ruleText)+'</p>',sourceClass:'ADDED STUDY SUPPORT',source});}
for(const [family,model] of [['ere','leggere'],['ire','dormire']]){
  const verb=verbs.find(row=>row.name===model),endings=family==='ere'?['-o','-i','-e','-iamo','-ete','-ono']:['-o','-i','-e','-iamo','-ite','-ono'];
  people.forEach(([person,english],index)=>pattern(family+'-ending-'+index,'Give only the present-tense ending for this regular verb group.',[
    {label:'Group',text:family==='ere'?'Second conjugation: -ERE':'Third conjugation: -IRE, without -isc-',lang:'en'},
    {label:'Subject',text:person,lang:'it'},{label:'Who?',text:english,lang:'en'}],endings[index],model+' gives '+verb.forms[index]+' for this subject.',
    'The full regular pattern is '+endings.join(', ')+'.', 'Checked regular present pattern, using '+model+' from the Lesson 7 conjugation-family table.'));
}
for(const name of ['potere','volere','bere','venire','uscire','dire']){
  const verb=verbs.find(row=>row.name===name);
  pattern('family-'+name,'Name the conjugation group of this verb.',[{label:'Infinitive',text:name,lang:'it'}],
    verb.courseGroup==='ere'?'Second conjugation: -ERE':'Third conjugation: -IRE',
    'The verb is irregular in the present. Learn its forms individually.',
    name==='dire'?'This course uses the modern -IRE grouping. Historical classifications can group dire with -ERE because of dicere.':courseGroups[verb.courseGroup]+'. Irregularity does not remove a verb from its conjugation group.',
    'Added explanation of the course’s conjugation groups. '+verb.source);
}
pattern('isc-noi-voi','For finire and capire, which two subjects use forms without -isc-?',
  [{label:'Models',text:'finire · capire',lang:'it'}],'noi and voi',
  'finisco, finisci, finisce, finiamo, finite, finiscono.',
  'The -isc pattern is regular. Noi and voi do not add -isc-.',
  'Accademia della Crusca: Coniugazione dei verbi come capire, obbedire ecc. https://accademiadellacrusca.it/it/consulenza/coniugazione-dei-verbi-come-capire-obbedire-ecc/187');
pattern('regularity-tense','Choose the accurate label for these forms.',
  [{label:'Present forms',text:'leggo · leggi · legge',lang:'it'},{label:'Choose from',text:'Regular in the present / regular in every tense',lang:'en'}],
  'Regular in the present','Check each new tense separately.',
  'A regular present pattern does not guarantee that every other tense follows a regular pattern.',
  'Treccani, leggere: https://www.treccani.it/vocabolario/leggere/');
const manifest={version:'2026-11-25-release-1',existingLessonCards:623,newCards:cards.length,
  newForms:cards.filter(card=>card.kind==='form').length,newUses:cards.filter(card=>card.kind==='use').length,newPatterns:cards.filter(card=>card.kind==='pattern').length,
  formCoverage,usageCoverage,
  patternCoverage:[...['are','ere','ire'].map(family=>({key:'italian-l7-family-'+family,status:'existing'})),...['io','tu','lei','noi','voi','loro'].map(person=>({key:'italian-l7-ending-'+person,status:'existing'})),...cards.filter(card=>card.kind==='pattern').map(card=>({key:card.key,status:'new'}))],
  existingSourceSha256:crypto.createHash('sha256').update(JSON.stringify(oldCards)).digest('hex'),
  sourceFormCount:formCoverage.length,sourceUseCount:usageCoverage.length,
  sourcePolicy:'Course examples have exact source locators. Added examples and full reference paradigms are labelled as study support. Prendere is learner-confirmed; exact Lesson 9 examples are unavailable.',
  importPolicy:'Additive new notes only. Existing lesson notes, GUIDs, decks and scheduling are not included or rewritten. Coverage uses existing notes where equivalent recall tasks already exist.',
  pronunciationPolicy:'Approximate English-friendly reading guides and broad IPA. No blanket claim of independent dictionary verification.'};
function save(name,data){const target=path.join(DIR,name),value=JSON.stringify(data,null,2)+'\n';if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8')!==value)throw new Error(name+' is out of date.');}else fs.writeFileSync(target,value);}
save('cards.json',cards);save('coverage.json',manifest);
console.log(JSON.stringify({newCards:cards.length,newForms:manifest.newForms,newUses:manifest.newUses,newPatterns:manifest.newPatterns,reusedForms:formCoverage.filter(row=>row.status==='existing').length,reusedUses:usageCoverage.filter(row=>row.status==='existing').length,totalFormCoverage:formCoverage.length,totalUseCoverage:usageCoverage.length}));
