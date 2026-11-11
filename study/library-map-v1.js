/* One set identity, several lesson/topic entry points. No question copies or title-based inference. */
(function(root){'use strict';
const lessons=[
 {id:'L1',date:'2026-09-22',title:'Greetings and introductions',it:'Saluti e presentazioni',topics:['greetings','introductions','register'],extra:['practice-essere','practice-chiamarsi','word-jobs-sentence-building']},
 {id:'L2',date:'2026-09-29',title:'Alphabet, sounds and singular articles',it:'Alfabeto, suoni e articoli singolari',topics:['wellbeing','alphabet','c-sounds','g-sounds','singular-articles'],extra:['practice-stare','subject-pronouns-present-tense']},
 {id:'L3',date:'2026-10-06',title:'Origins, nationalities and residence',it:'Origini, nazionalità e residenza',topics:['pronouns','origins','countries','nationality','dialogues'],extra:['practice-venire','practice-vivere','practice-abitare']},
 {id:'L4',date:'2026-10-13',title:'Avere, numbers, plurals and family',it:'Avere, numeri, plurali e famiglia',topics:['avere','silent-h','numbers-basic','age','family','plurals','partitives'],extra:['practice-avere','avere-numbers-family']},
 {id:'L5',date:'2026-10-20',title:'Consolidation, spelling and plurals',it:'Ripasso, spelling e plurali',topics:['silent-h','plurals','partitives','family','sound-review','town-spelling','wellbeing'],extra:['mixed-review-challenge','practice-irregular-verbs','practice-regular-verbs']},
 {id:'L6',date:'2026-11-03',title:'Larger numbers, essere and questions',it:'Numeri, essere e domande',topics:['wellbeing','partitives','numbers','age','essere','negatives','intonation','questions'],extra:['connected-partitives','class3-complete-replies','practice-essere','practice-things-pronouns']}
];
const topics=[
 ['greetings','Greetings in context','Saluti in contesto','conversation',['class1-greetings'],'L1','01 Greetings & farewells'],
 ['introductions','Names and introductions','Nomi e presentazioni','conversation',['class1-introductions'],'L1','02 Introductions'],
 ['register','Informal and formal conversations','Conversazioni informali e formali','conversation',['class1-register'],'L1','03 Tu and Lei'],
 ['wellbeing','Greetings and wellbeing','Saluti e benessere','conversation',['l6-greetings'],'L2','00 Greetings & wellbeing'],
 ['alphabet','Alphabet and spelling names','Alfabeto e spelling dei nomi','sounds',['class2-alphabet'],'L2','01 Alphabet & spelling'],
 ['c-sounds','C and CH sounds','Suoni C e CH','sounds',['class2-c-sounds'],'L2','02 C and CH sounds'],
 ['g-sounds','G and GH sounds','Suoni G e GH','sounds',['class2-g-sounds'],'L2','03 G and GH sounds'],
 ['singular-articles','Singular articles and gender','Articoli singolari e genere','grammar',['class2-definite-articles','class2-indefinite-articles'],'L2','06 Article application'],
 ['pronouns','Pronouns and verb forms','Pronomi e forme verbali','verbs',['subject-pronouns-present-tense','practice-things-pronouns'],'L3','01 Personal pronouns'],
 ['origins','Origins and residence','Origini e residenza','conversation',['class3-complete-replies','di-da-dove-pronouns'],'L3','03 Origins & questions'],
 ['countries','Country names','Nomi dei paesi','conversation',['class3-countries'],'L3','05 Countries'],
 ['nationality','Nationality and agreement','Nazionalità e concordanza','grammar',['class3-nationality'],'L3','06 Nationality adjectives'],
 ['dialogues','Build a conversation','Costruisci una conversazione','conversation',['class3-dialogues'],'L3','07 Conversation practice'],
 ['avere','Avere in context','Avere in contesto','verbs',['class4-avere-homework','class4-avere-class'],'L4','01 Avere - present tense'],
 ['silent-h','With or without H','Con o senza H','verbs',['class4-silent-h'],'L4','02 Silent H spelling'],
 ['numbers-basic','Numbers 0 to 20','Numeri da 0 a 20','numbers',['numbers-0-20'],'L4','04 Numbers 0-20 and age'],
 ['numbers','Number-building patterns','Come si formano i numeri','numbers',['l6-number-patterns'],'L6','Number-building patterns'],
 ['age','Age and introductions','Età e presentazioni','numbers',['class4-ages-homework','l6-age-dialogue'],'L4','04 Numbers 0-20 and age'],
 ['family','Talking about family','Parlare della famiglia','conversation',['class4-family'],'L4','08 Family sentences and practice'],
 ['plurals','Singular and plural','Singolare e plurale','grammar',['class5-plurals-a','class5-plurals-b','class5-plurals-c','class5-plurals-d','plural-articles'],'L5','02 Singular and plural transformations'],
 ['partitives','Some: articles and quantities','Articoli partitivi e quantità','grammar',['l6-plural-workshop','connected-partitives'],'L5','03 The and some plural articles'],
 ['sound-review','C and G revision','Ripasso C e G','sounds',['sounds-review'],'L5','05 C G sounds and spelling'],
 ['town-spelling','Spelling with Italian towns','Spelling con le città italiane','sounds',['town-code'],'L5','05 C G sounds and spelling'],
 ['essere','Essere in the present','Essere al presente','verbs',['l6-essere-class','l6-essere-matching','l6-essere-gaps','l6-essere-translation'],'L6','Essere in the present'],
 ['negatives','Negative sentences','Frasi negative','verbs',['l6-negative-homework'],'L6','Negative sentences'],
 ['intonation','Statements and questions','Affermazioni e domande','conversation',['l6-intonation'],'L6','Statements and questions'],
 ['questions','Question words and useful phrases','Parole interrogative e frasi utili','conversation',['l6-useful-questions'],'L6','Question words and useful phrases'],
 ['verb-drills','Verb forms and comparisons','Forme verbali e confronti','verbs',['practice-essere','practice-avere','practice-venire','practice-stare','practice-andare','practice-vivere','practice-abitare','practice-chiamarsi','practice-irregular-verbs','practice-regular-verbs'],'L3','02 Verb forms'],
 ['references','Reference and mixed revision','Riferimenti e ripasso misto','reference',['known-verbs-and-forms','word-jobs-sentence-building','conversation-foundations','avere-numbers-family','mixed-review-challenge'],'L3','00 Core patterns']
].map(([id,title,it,category,sets,lesson,deck])=>({id,title,it,category,sets,flashcards:{lesson,deck}}));
const subsets={
 'numbers-0-20':{sheet:'l6-number-patterns',title:'Write numbers 0 to 20',it:'Scrivi i numeri da 0 a 20',indices:Array.from({length:21},(_,i)=>i),kind:'Revision'},
 'sounds-review':{sheet:'c-g-sounds-and-spelling',title:'Recognise C and G patterns',it:'Riconosci i suoni C e G',indices:[0,1,2,3,4,5],kind:'Adapted practice'},
 'town-code':{sheet:'c-g-sounds-and-spelling',title:'Italian town spelling code',it:'Spelling con le città italiane',indices:[6,7,8,9],kind:'Adapted practice'}
};
// Revisiting does not imply that a later worksheet was assigned in an earlier class.
const lessonSets={
 'L4:plurals':['plural-articles'], 'L4:partitives':['connected-partitives'],
 'L5:partitives':['connected-partitives','plural-articles'],
 'L6:partitives':['l6-plural-workshop','connected-partitives'],
 'L4:age':['class4-ages-homework'], 'L6:age':['l6-age-dialogue','class4-ages-homework'],
 'L2:wellbeing':['wellbeing-intro'], 'L5:wellbeing':['l6-greetings']
};
subsets['wellbeing-intro']={sheet:'conversation-foundations',title:'How are you?',it:'Come stai?',indices:[8],kind:'Revision'};
const labels={
 'l6-essere-class':['Classroom sentence gaps','Frasi della lezione'],
 'l6-essere-matching':['Homework: pronouns and forms','Compiti: pronomi e forme'],
 'l6-essere-gaps':['Homework: sentence gaps','Compiti: frasi da completare'],
 'l6-essere-translation':['Homework: translation choices','Compiti: scelta della traduzione'],
 'l6-plural-workshop':['Group activity: plural partitives','Attività di gruppo: partitivi plurali']
};
const api={lessons,topics,subsets,lessonSets,labels,version:'2026-11-11-library-v1'};
if(typeof module!=='undefined')module.exports=api;if(root)root.ItalianLibraryMap=api;
})(typeof window!=='undefined'?window:null);
