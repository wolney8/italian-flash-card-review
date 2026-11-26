/* Register Lesson 9 after the shared course map and homework evidence are loaded. */
(function(root){
'use strict';
const data=root.ItalianLesson9, map=root.ItalianLibraryMap;
if(!data||!map||!root.ItalianLibraryContent)return;
if(!map.lessons.some(l=>l.id==='L9'))map.lessons.push(data.lesson);
const labels={
  'l9-conjugation-groups':['Recognise the Three Conjugations','Riconoscere le tre coniugazioni'],
  'l9-are-recap':['First-Conjugation Recap','Ripasso della prima coniugazione'],
  'l9-ere-class':['Regular -ERE Verb Tables','Tabelle dei verbi regolari in -ERE'],
  'l9-ere-homework':['-ERE Homework Exercises 1 to 4','Compiti -ERE, esercizi da 1 a 4']
};
for(const sheet of data.sheets){
  map.labels[sheet.slug]=labels[sheet.slug];
  map.topics.push({id:sheet.slug,title:sheet.title,it:sheet.titleIt,category:'verbs',sets:[sheet.slug],flashcards:{lesson:'L9',deck:sheet.slug==='l9-ere-homework'?'01 -ERE Patterns':'02 Laura’s Model Sentences'}});
}
root.ItalianLibraryContent.sheets.push(...data.sheets);
map.homework.L9={book:[
  ['p. 171, ex. 7','Combine the words in the four columns into five meaningful sentences.','Forma cinque frasi usando le quattro colonne.'],
  ['p. 172, ex. 8','Complete the sentences with the correct words.','Completa le frasi con le parole corrette.'],
  ['p. 172, ex. 10','Answer the questions using information from the box.','Rispondi alle domande usando le informazioni del riquadro.']
]};
const source={file:data.sourceFiles.minutes,locator:'p. 5',sourceId:'l9-minutes-2026-11-24'};
const book=[
  ['171-7','p. 171, exercise 7','Combine words in four columns to make five meaningful sentences.'],
  ['172-8','p. 172, exercise 8','Complete sentences with the correct words.'],
  ['172-10','p. 172, exercise 10','Answer questions using the information in the box.']
].map(([id,label,task])=>({id,label,task,source:{...source},pageCopyChecked:false}));
const handouts=[
  {id:'l9-ere-ex1','label':'-ERE worksheet, exercise 1','task':'Match ten Italian verbs with English meanings.',links:[{set:'l9-ere-homework',label:'Match verbs'}]},
  {id:'l9-ere-ex2','label':'-ERE worksheet, exercise 2','task':'Complete ten sentences with present-tense -ERE forms.',links:[{set:'l9-ere-homework',label:'Sentence gaps'}]},
  {id:'l9-ere-ex3','label':'-ERE worksheet, exercise 3','task':'Choose the six missing endings.',links:[{set:'l9-ere-homework',label:'Choose endings'}]},
  {id:'l9-ere-ex4','label':'-ERE worksheet, exercise 4','task':'Translate six sentences into Italian.',links:[{set:'l9-ere-homework',label:'Translate'}]},
  {id:'l9-ere-ex5','label':'-ERE worksheet, exercise 5','task':'Write five personal sentences: Io leggo, Io prendo, Io vivo, Io vedo, Io scrivo. This is ungraded workbook practice.',links:[{set:'l9-ere-homework',label:'Personal practice notes'}]}
].map(({id,label,task,links})=>({id,label,task,links,source:{file:data.sourceFiles.homework,locator:'pp. 1-2',sourceId:'l9-homework-2026-11-24'}}));
root.ItalianHomeworkEvidence.L9={book,handouts,reference:[{
  id:'l9-gram-233',label:'p. 233',task:'Further reading for -ERE present-tense grammar, not assigned homework.',
  source:{file:data.sourceFiles.minutes,locator:'p. 2',sourceId:'l9-minutes-2026-11-24'}
}]};
const messages=root.ItalianUILibraryMessages||(root.ItalianUILibraryMessages={});
messages[data.lesson.title]=data.lesson.it;
for(const sheet of data.sheets)messages[sheet.title]=sheet.titleIt;
})(window);