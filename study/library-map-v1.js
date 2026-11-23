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
 ['c-sounds','C and CH sounds','Suoni C e CH','sounds',['class2-homework-c-columns','class2-c-sounds'],'L2','02 C and CH sounds'],
 ['g-sounds','G and GH sounds','Suoni G e GH','sounds',['class2-homework-g-columns','class2-g-sounds'],'L2','03 G and GH sounds'],
 ['singular-articles','Singular articles and gender','Articoli singolari e genere','grammar',['class2-definite-articles','class2-homework-article-columns','class2-indefinite-articles'],'L2','06 Article application'],
 ['pronouns','Pronouns and verb forms','Pronomi e forme verbali','verbs',['subject-pronouns-present-tense','practice-things-pronouns'],'L3','01 Personal pronouns'],
 ['origins','Origins and residence','Origini e residenza','conversation',['class3-complete-replies','di-da-dove-pronouns'],'L3','03 Origins & questions'],
 ['countries','Country names','Nomi dei paesi','conversation',['class3-countries'],'L3','05 Countries'],
 ['nationality','Nationality and agreement','Nazionalità e concordanza','grammar',['class3-nationality'],'L3','06 Nationality adjectives'],
 ['dialogues','Build a conversation','Costruisci una conversazione','conversation',['class3-dialogues'],'L3','07 Conversation practice'],
 ['avere','Avere in context','Avere in contesto','verbs',['class4-avere-homework','class4-avere-class'],'L4','01 Avere - present tense'],
 ['silent-h','With or without H','Con o senza H','verbs',['class4-silent-h'],'L4','02 Silent H spelling'],
 ['numbers-basic','Numbers 0 to 20','Numeri da 0 a 20','numbers',['numbers-0-20','class4-homework-number-maze'],'L4','04 Numbers 0-20 and age'],
 ['numbers','Number-building patterns','Come si formano i numeri','numbers',['l6-number-patterns'],'L6','Number-building patterns'],
 ['age','Age and introductions','Età e presentazioni','numbers',['class4-ages-homework','l6-age-dialogue'],'L4','04 Numbers 0-20 and age'],
 ['family','Talking about family','Parlare della famiglia','conversation',['class4-family'],'L4','08 Family sentences and practice'],
 ['plurals','Singular and plural','Singolare e plurale','grammar',['class5-class-plural-table','class5-plurals-a','class5-plurals-b','class5-plurals-c','class5-plurals-d','plural-articles'],'L5','02 Singular and plural transformations'],
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
// Handbook assignments from the session minutes, and optional quizzes shared by the tutor.
const homework = {
 L1: {book: [
   ['pp. 164–165, ex. 1–4', 'Match greetings to situations and dialogues to pictures. Choose the verb forms and fill the gaps.', 'Abbina i saluti alle situazioni e i dialoghi alle immagini. Scegli le forme verbali e completa gli spazi.']
 ]},
 L2: {book: [
   ['p. 172, ex. 9', 'Match each word to its article.', 'Abbina ogni parola al suo articolo.']
 ], quizzes: [
   ['Indefinite articles', 'Articoli indeterminativi', '664eb0143e5b2ac8771d2b0b'],
   ['Definite articles', 'Articoli determinativi', '615396b15821cf0036b983f8']
 ]},
 L3: {book: [
   ['p. 164, ex. 6', 'Complete the sentences.', 'Completa le frasi.'],
   ['p. 165, ex. 7–10', 'Match questions and answers, build country names from syllables, reorder a dialogue and fill the gaps.', 'Abbina domande e risposte, forma i nomi dei paesi con le sillabe, riordina il dialogo e completa gli spazi.']
 ], quizzes: [['Nationalities', 'Nazionalità', '642e0ea7053bff04dbfa8b2f']]},
 L4: {book: [
   ['p. 166, ex. 12', 'Follow the number maze from 20 down to 0 and read the hidden sentence.', 'Segui il labirinto dei numeri da 20 a 0 e leggi la frase nascosta.']
 ], quizzes: [['Plurals', 'Plurali', '63c7f839e4a7b3539aaab5d0']]},
 L5: {book: [
   ['p. 22, ex. 6 A–C', 'Listen and repeat, match the pictures, ask how someone is and order the replies.', 'Ascolta e ripeti, abbina le immagini, chiedi come sta una persona e metti in ordine le risposte.'],
   ['p. 12, ex. 10', 'Listen for tu or formal Lei in each dialogue.', 'Ascolta ogni dialogo e riconosci il tu o il Lei.']
 ]},
 L6: {book: [
   ['p. 20, ex. 1–2', 'Choose the ages. Complete the numbers and check with the audio.', 'Scegli le età. Completa i numeri e controlla con l’audio.'],
   ['p. 21, ex. 3–4A', 'Tick the numbers you hear, then answer the questions about the picture.', 'Segna i numeri che senti, poi rispondi alle domande sull’immagine.'],
   ['p. 175, ex. 19', 'Listen, add a question mark or full stop, then repeat.', 'Ascolta, aggiungi il punto interrogativo o il punto, poi ripeti.']
 ]},
 L7: {book: [
   ['p. 173, ex. 14', 'Fill the gaps with the correct verb.', 'Completa gli spazi con il verbo corretto.']
 ], quizzes: [['Present tense of -are verbs', 'Presente dei verbi in -are', '65777d19f7bf26f894ba2d46']]},
 L8: {book: [
   ['p. 26, ex. 14', 'Look at the pictures and complete the job titles.', 'Guarda le immagini e completa i nomi delle professioni.'],
   ['p. 173, ex. 12', 'Give the workplace for each job.', 'Scrivi il luogo di lavoro per ogni professione.'],
   ['p. 174, ex. 15', 'Complete the sentences with the missing words.', 'Completa le frasi con le parole mancanti.']
 ]}
};
const api={lessons,topics,subsets,lessonSets,labels,homework,version:'2026-11-11-library-v1'};
if(typeof module!=='undefined')module.exports=api;if(root)root.ItalianLibraryMap=api;
})(typeof window!=='undefined'?window:null);
