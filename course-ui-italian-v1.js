/* Authored interface labels; keys are presentation copy, never answer or route IDs. */
(function(root){
'use strict';
const messages=Object.fromEntries(`
Home|||Inizio
Lessons|||Lezioni
Study sheets|||Schede di studio
Study Sheets|||Schede di studio
Comments|||Commenti
Comment|||Commenta
Italian for Beginners|||Italiano per principianti
BSE Course · Beginners · Semester 1|||Corso BSE · Principianti · Primo semestre
Beginners · Semester 1|||Principianti · Primo semestre
Course pathway|||Percorso del corso
Choose a lesson|||Scegli una lezione
Choose a topic|||Scegli un argomento
Choose a sheet|||Scegli una scheda
Choose a study topic|||Scegli un argomento di studio
Browse by category|||Sfoglia per categoria
Flashcards|||Carte didattiche
Learn|||Impara
Study|||Studio
Patterns|||Schemi
Examples|||Esempi
Practise|||Esercizi
Practice|||Esercizi
Review|||Ripasso
Reset|||Azzera
Reset this session|||Azzera questa sessione
Print / save as PDF|||Stampa / salva in PDF
Print or save as PDF|||Stampa o salva in PDF
Light|||Chiaro
Dark|||Scuro
Menu|||Menu
Main navigation|||Navigazione principale
Breadcrumb|||Percorso di navigazione
Study sheet actions|||Azioni della scheda
Learning mode|||Modalità di apprendimento
Learn mode|||Modalità di studio
Review mode|||Modalità di ripasso
Study stages|||Fasi di studio
Theme|||Tema
Change colour theme|||Cambia tema
Switch to light mode|||Passa al tema chiaro
Switch to dark mode|||Passa al tema scuro
All study sheets|||Tutte le schede
All topics|||Tutti gli argomenti
All lessons|||Tutte le lezioni
All cards|||Tutte le carte
Back to topics|||Torna agli argomenti
Next|||Avanti
Previous|||Indietro
Back|||Indietro
Continue|||Continua
Start|||Inizio
Resume|||Riprendi
Continue learning|||Continua a imparare
Your progress|||I tuoi progressi
Overall progress|||Progressi complessivi
Progress|||Progressi
Study sheet progress|||Progressi della scheda
Understand the rule|||Comprendi la regola
Recognise the pattern|||Riconosci lo schema
Check your understanding|||Verifica la comprensione
Read the explanation. Use Next when you are ready.|||Leggi la spiegazione. Seleziona Avanti quando sei pronto.
Look for patterns in the examples, then try a question.|||Cerca gli schemi negli esempi, poi prova un esercizio.
Choose or type an answer, then select Check answer.|||Scegli o scrivi una risposta, poi seleziona Controlla.
Answer tips|||Suggerimenti per rispondere
Show hint|||Mostra suggerimento
Hide hint|||Nascondi suggerimento
Hint|||Suggerimento
Check answer|||Controlla
Type your answer|||Scrivi la risposta
Answer, use a hint if needed, then check|||Rispondi, usa un suggerimento se serve, poi controlla
Practice summary|||Riepilogo degli esercizi
Practice complete|||Esercizi completati
Your practice results|||I tuoi risultati
Review your progress or return to a question.|||Rivedi i tuoi progressi o torna a un esercizio.
You have answered every question. You can revisit any of them.|||Hai risposto a tutte le domande. Puoi riprenderle in qualsiasi momento.
Review incorrect answers|||Ripassa le risposte errate
Review unanswered questions|||Ripassa le domande senza risposta
Back to questions|||Torna alle domande
Back to results|||Torna ai risultati
Previous question|||Domanda precedente
Back to examples|||Torna agli esempi
Previous example|||Esempio precedente
Back to learn|||Torna allo studio
Previous section|||Sezione precedente
Next section|||Sezione successiva
Next: Examples|||Avanti: Esempi
Next: Practise|||Avanti: Esercizi
Next example|||Esempio successivo
Review from start|||Ripassa dall’inizio
Next incorrect|||Prossima risposta errata
Finish review|||Termina il ripasso
Next question|||Domanda successiva
Finish practice|||Termina gli esercizi
Continue to flashcards|||Continua con le carte
Practice set|||Gruppo di esercizi
Other practice for this topic|||Altri esercizi su questo argomento
Topic|||Argomento
Class order|||Ordine della lezione
Show|||Mostra
Session 6 — class order|||Lezione 6 — ordine degli argomenti
Numbers — flip & reveal|||Numeri — gira e scopri
Verb reference|||Guida ai verbi
Write answers|||Scrivi le risposte
Flip & reveal|||Gira e scopri
Practice sequence|||Sequenza degli esercizi
Pattern columns|||Colonne degli schemi
Reveal all|||Mostra tutto
Hide all|||Nascondi tutto
Reveal Italian|||Mostra l’italiano
Hide Italian|||Nascondi l’italiano
Tens, hundreds and thousands|||Decine, centinaia e migliaia
Number card layout|||Disposizione delle carte dei numeri
Number practice method|||Modalità di esercizio con i numeri
Number flip cards|||Carte dei numeri
Tap a number to reveal its Italian. Flips do not count as checked answers.|||Tocca un numero per vedere come si scrive in italiano. Girare le carte non conta come risposta verificata.
Focus mode|||Modalità concentrazione
Exit focus|||Esci dalla concentrazione
Reveal answer|||Mostra la risposta
Show answer|||Mostra la risposta
Show question|||Mostra la domanda
Show answer / question|||Mostra risposta / domanda
Could you recall it without looking?|||Ricordavi la risposta senza guardare?
Practise again|||Da ripassare
Got it|||Lo so
Not rated|||Non valutate
Unrated|||Non valutate
Answers revealed|||Risposte mostrate
Next card|||Carta successiva
Finish topic|||Termina l’argomento
Repeat topic|||Ripeti l’argomento
Next topic|||Argomento successivo
Next lesson|||Lezione successiva
Topic complete|||Argomento completato
Targeted review finished|||Ripasso mirato completato
Targeted review position|||Posizione nel ripasso mirato
Revealing a card records that you saw it, not that you remembered it.|||Mostrare una risposta registra che l’hai vista, non che l’hai ricordata.
No cards to review in this selection.|||Nessuna carta da ripassare in questa selezione.
Return to all cards|||Torna a tutte le carte
Comment on this card|||Commenta questa carta
Current flashcard|||Carta attuale
Recall side|||Lato domanda
Answer side|||Lato risposta
Flip to answer side|||Gira sul lato risposta
Source|||Fonte
Meaning|||Significato
Literal|||Significato letterale
Rule / forms|||Regola / forme
Rule|||Regola
Usage|||Uso
Pattern|||Schema
Clarification|||Chiarimento
Course source|||Fonte del corso
Complete reply|||Risposta completa
Question|||Domanda
Answer|||Risposta
Pronunciation|||Pronuncia
English-friendly pronunciation|||Pronuncia approssimativa
Instructions|||Istruzioni
Name or initials|||Nome o iniziali
Comment on this study sheet|||Commenta questa scheda
Comment on the course|||Commenta il corso
Leave a comment|||Lascia un commento
Send comment|||Invia commento
Cancel|||Annulla
Close|||Chiudi
Review feedback|||Commenti di revisione
What should be checked or changed?|||Che cosa va controllato o modificato?
Study sheets library|||Raccolta delle schede
Study sheets by topic|||Schede per argomento
Flashcards by lesson|||Carte per lezione
Introductions|||Presentazioni
Sounds and articles|||Suoni e articoli
Origins and residence|||Origini e residenza
Avere and plurals|||Avere e plurali
Consolidation review|||Ripasso generale
Numbers, Essere and Questions|||Numeri, essere e domande
Greetings, names and polite introductions|||Saluti, nomi e presentazioni cortesi
Alphabet, pronunciation and articles|||Alfabeto, pronuncia e articoli
Where you are from and where you live|||Da dove vieni e dove abiti
To have, family, numbers and plural forms|||Avere, famiglia, numeri e forme plurali
Mixed practice from previous lessons|||Esercizi misti delle lezioni precedenti
Number patterns, negatives, intonation and useful expressions|||Schemi dei numeri, negazione, intonazione ed espressioni utili
Conversation and context|||Conversazione e contesto
Verbs and pronouns|||Verbi e pronomi
Grammar and sentence building|||Grammatica e costruzione delle frasi
Sounds and spelling|||Suoni e ortografia
Mixed practice|||Esercizi misti
Conversation foundations|||Conversazione di base
Greetings, names, formal and informal speech, origins and residence|||Saluti, nomi, registro formale e informale, origini e residenza
Formal and informal at a glance|||Formale e informale a confronto
Situation|||Situazione
Informal|||Informale
Formal|||Formale
Identity, origin and residence|||Identità, origine e residenza
Purpose|||Scopo
Italian|||Italiano
Natural English|||Inglese naturale
Patterns to notice|||Schemi da osservare
Di, da, dove and pronouns|||Di, da, dove e pronomi
Origin, movement, residence, current location and third-person pronouns|||Origine, movimento, residenza, posizione attuale e pronomi di terza persona
The four question patterns|||I quattro schemi delle domande
Example answer|||Esempio di risposta
Informal, formal and plural|||Informale, formale e plurale
People and object pronouns|||Pronomi per persone e oggetti
Reference|||Riferimento
Singular|||Singolare
Plural|||Plurale
Everyday note|||Nota sull’uso quotidiano
Subject pronouns and present tense|||Pronomi soggetto e presente
Match io, tu, lui/lei, noi, voi and loro to the verb ending|||Abbina io, tu, lui/lei, noi, voi e loro alla desinenza verbale
Subject pronouns|||Pronomi soggetto
Person|||Persona
Core present-tense forms|||Forme principali del presente
Subject|||Soggetto
What to notice|||Che cosa osservare
Known verbs and their forms|||Verbi conosciuti e coniugazioni
A present-tense reference for every verb currently taught or encountered|||Una guida al presente di tutti i verbi studiati o incontrati finora
Pronoun map used in the tables|||Pronomi usati nelle tabelle
Pronoun|||Pronome
Meaning / use|||Significato / uso
Verb person|||Persona del verbo
Core course verbs - complete present tense|||Verbi principali del corso — presente completo
Chiamarsi - to be called|||Il verbo chiamarsi
Form|||Forma
Stare and andare - complete support tables|||Stare e andare — tabelle complete di supporto
Source boundary and practical use|||Ambito delle fonti e uso pratico
Word jobs and sentence building|||Funzioni delle parole e costruzione delle frasi
Nouns, verbs, adjectives, pronouns, articles and prepositions|||Nomi, verbi, aggettivi, pronomi, articoli e preposizioni
The main word jobs|||Le funzioni principali delle parole
Word job|||Funzione della parola
Simple meaning|||Significato semplice
Italian example|||Esempio in italiano
Break a sentence into jobs|||Scomponi la frase per funzione
Sentence|||Frase
Breakdown|||Analisi
Sentence frame|||Struttura della frase
Avere, numbers and family|||Avere, numeri e famiglia
Present-tense forms, silent H, age, common expressions and quantities|||Forme del presente, H muta, età, espressioni comuni e quantità
Avere - present tense|||Avere — presente
English|||Inglese
The silent H changes the meaning|||L’H muta cambia il significato
With H - avere|||Con H — avere
Without H - different word|||Senza H — un’altra parola
Common expressions with avere|||Espressioni comuni con avere
Numbers 0-20|||Numeri 0–20
Plurals and articles|||Plurali e articoli
Noun endings, definite articles and plural "some" forms|||Desinenze dei nomi, articoli determinativi e partitivo plurale
Common plural endings|||Desinenze plurali comuni
Singular pattern|||Schema singolare
Plural pattern|||Schema plurale
Example|||Esempio
The and some - the full visual pattern|||Articoli determinativi e partitivi — schema completo
Noun pattern|||Schema del nome
THE|||DETERMINATIVO
SOME|||PARTITIVO
Special masculine openings|||Iniziali maschili particolari
Work backwards from the singular article|||Parti dall’articolo singolare
Singular family|||Gruppo del singolare
Plural THE|||DETERMINATIVO PLURALE
Plural SOME|||PARTITIVO PLURALE
C/G sounds and spelling with towns|||Suoni C/G e spelling con le città
Hard and soft sounds, H combinations and the Italian town spelling code|||Suoni duri e dolci, combinazioni con H e spelling con le città italiane
C and G sound map|||Mappa dei suoni C e G
Sound|||Suono
English cue|||Aiuto fonetico in inglese
Spelling with Italian towns|||Spelling con le città italiane
Spelling pattern|||Schema per lo spelling
Mixed review challenge|||Sfida di ripasso misto
Combine register, origins, verbs, articles, plurals and sounds|||Combina registro, origini, verbi, articoli, plurali e suoni
How to approach mixed questions|||Come affrontare le domande miste
Quick reference|||Riferimento rapido
Clue|||Indizio
Think|||Rifletti
Essere in the present|||Essere al presente
The six forms, their meaning and how they are used.|||Le sei forme, il significato e l’uso.
Essere — present tense|||Essere — presente
Using essere|||L’uso di essere
Use|||Uso
Context matters|||Il contesto conta
Negative sentences|||Frasi negative
Add non before the verb.|||Aggiungi non prima del verbo.
Non comes before the verb|||Non precede il verbo
Positive → negative|||Affermativa → negativa
Positive|||Affermativa
Negative|||Negativa
Number-building patterns|||Come si formano i numeri
Ventuno and ventotto|||Ventuno e ventotto
The accent in ventitré|||L’accento in ventitré
Hundreds: the cento pattern|||Centinaia: lo schema di cento
Thousands: mille and mila|||Migliaia: mille e mila
The four source columns|||Le quattro colonne della scheda
Other numbers introduced in class|||Altri numeri presentati in classe
Number|||Numero
Statements and questions|||Affermazioni e domande
Same words, different intonation.|||Stesse parole, intonazione diversa.
Same words, different intonation|||Stesse parole, intonazione diversa
Statement → question|||Affermazione → domanda
Statement|||Affermazione
Question meaning|||Significato della domanda
Speak and self-check|||Parla e controllati
Plural partitives|||Partitivi plurali
Revision: un, uno, una, un’ → dei, degli, delle.|||Ripasso: un, uno, una, un’ → dei, degli, delle.
Singular indefinite → plural partitive|||Indeterminativo singolare → partitivo plurale
Opening|||Iniziale
Explain the change|||Spiega il cambiamento
Two decisions in each answer|||Due scelte per ogni risposta
Question words and useful phrases|||Parole interrogative e frasi utili
Ask who, where, what, when and why; ask for help.|||Chiedi chi, dove, che cosa, quando e perché; chiedi aiuto.
Question words|||Parole interrogative
Word|||Parola
Question, example and answer|||Domanda, esempio e risposta
When you need help|||Quando hai bisogno di aiuto
Supplied expression|||Espressione della lezione
Greetings and responses|||Saluti e risposte
Ask how someone is|||Chiedi come sta qualcuno
Supplied greeting|||Saluto della lezione
Respond|||Rispondi
Supplied response|||Risposta della lezione
Age and introductions|||Età e presentazioni
Use the numbers in a formal and informal conversation.|||Usa i numeri in una conversazione formale e informale.
Asking someone’s age|||Chiedere l’età
Register|||Registro
Answer from the minutes|||Risposta dal riepilogo della lezione
The supplied conversation|||La conversazione della lezione
Try the paired speaking activity|||Prova l’attività orale a coppie
Classroom sentences|||Frasi svolte in classe
Homework: matching|||Compiti: abbinamenti
Homework: sentence gaps|||Compiti: completa le frasi
Homework: translation choices|||Compiti: scegli la traduzione
Classroom: sentence gaps|||In classe: completa le frasi
Verbs at a glance|||Verbi a colpo d’occhio
Irregular|||Irregolare
Regular present-tense comparison|||Confronto: presente regolare
Regular comparison|||Confronto: verbo regolare
Reflexive comparison|||Confronto: verbo riflessivo
Who?|||Chi?
Say it approximately|||Pronuncia approssimativa
Plural forms — later reference|||Forme plurali — riferimento per dopo
Original pronoun map and lesson notes|||Pronomi e note originali della lezione
Why di dove, da dove, or just dove?|||Perché di dove, da dove o solo dove?
What changes with articles, partitives and masculine/feminine?|||Che cosa cambia con articoli, partitivi, maschile e femminile?
Essere di — be from|||Essere di — origine
Venire da — come from|||Venire da — provenienza
Vivere / abitare — live|||Vivere / abitare — residenza
Essere + a place — be located|||Essere + un luogo — posizione
Same verb, different adjective|||Stesso verbo, aggettivo diverso
Same verb, different article|||Stesso verbo, articolo diverso
Some: dei / degli / delle|||Il partitivo: dei / degli / delle
A preposition can join an article|||Una preposizione può unirsi a un articolo
Open the verb reference — forms, usage, pronunciation and di / da / dove|||Apri la guida ai verbi — forme, uso, pronuncia e di / da / dove
Singular conversations first|||Prima le conversazioni al singolare
Origins and questions|||Origini e domande
First: be from · come from · live in|||Prima: essere di · venire da · abitare
Personal pronouns|||Pronomi personali
Pronouns|||Pronomi
Verb forms|||Forme verbali
Core patterns|||Schemi principali
Verb patterns|||Schemi dei verbi
Origins & questions|||Origini e domande
Residence & prepositions|||Residenza e preposizioni
Homes and prepositions|||Abitazioni e preposizioni
Countries|||Paesi
Nationality adjectives|||Aggettivi di nazionalità
Nationalities|||Nazionalità
Conversation practice|||Esercizi di conversazione
Conversation and farewells|||Conversazione e saluti finali
Later - plural questions|||Più avanti — domande al plurale
Traditional pronouns - recognition|||Pronomi tradizionali — riconoscimento
Correct|||Corretto
Incorrect|||Sbagliato
Answer:|||Risposta:
Summary|||Riepilogo
Beginners|||Principianti
Intermediate|||Intermedio
Advanced|||Avanzato
Beginners · Semester 1 of 3|||Principianti · Semestre 1 di 3
Currently studying|||In corso
Planned stages — no content available yet|||Fasi previste — contenuti non ancora disponibili
Details to be confirmed|||Dettagli da confermare
Learn it in stages.|||Impara un passo alla volta.
Open this semester’s lessons|||Apri le lezioni di questo semestre
Give feedback|||Invia un commento
Suggest a correction|||Suggerisci una correzione
Most useful feedback includes:|||Un commento utile include:
Leave general feedback|||Lascia un commento generale
Find a flashcard|||Trova una carta
Browse study sheets to review|||Sfoglia le schede da rivedere
Loading lessons…|||Caricamento delle lezioni…
Loading flashcards…|||Caricamento delle carte…
Loading|||Caricamento
Lesson flashcards|||Carte delle lezioni
Open guide|||Apri la scheda
Choose what to study.|||Scegli cosa studiare.
Read the question, reveal the answer, then move on.|||Leggi la domanda, mostra la risposta, poi continua.
Homework: match pronouns|||Compiti: abbina i pronomi
Homework: choose the translation|||Compiti: scegli la traduzione
Classroom: complete the sentences|||In classe: completa le frasi
Homework matching|||Compiti: abbinamenti
Sentence gaps|||Completa le frasi
Translation choices|||Scegli la traduzione
Read the examples|||Leggi gli esempi
Understand the pattern|||Comprendi lo schema
Practice sets|||Gruppi di esercizi
Switch label order|||Cambia lingua dell’interfaccia
Use English labels first|||Passa all’inglese
Use Italian labels first|||Passa all’italiano
Recall confidence|||Valutazione del ricordo
Reset progress for this browser session|||Azzera i progressi di questa sessione
Study sheet categories|||Categorie delle schede
Flashcards or study sheets|||Carte o schede di studio
Choose learning resource|||Scegli una risorsa di studio
Learn or Review mode|||Modalità studio o ripasso
Filter by subdeck|||Filtra per mazzo
Search this lesson|||Cerca in questa lezione
Source note|||Nota sulla fonte
Sentence pattern|||Schema della frase
Natural meaning|||Significato naturale
Main answer|||Risposta principale
Spelling|||Ortografia
When to use it|||Quando si usa
Rule / pattern|||Regola / schema
Useful comparison|||Confronto utile
Course note|||Nota del corso
Notes|||Note
Pronunciation guide|||Guida alla pronuncia
Formal / informal|||Formale / informale
Natural reply|||Risposta naturale
Try again|||Riprova
Well done|||Ben fatto
Check|||Controlla
Write|||Scrivi
in Italian.|||in italiano.
Choose the correct translation:|||Scegli la traduzione corretta:
Choose the pronoun and form for|||Scegli il pronome e la forma per
Make the whole phrase plural:|||Metti al plurale l’intera espressione:
What does this source curve signal?|||Che cosa indica questa curva della scheda?
Say this in Italian:|||Dillo in italiano:
Ask one person informally:|||Chiedi a una persona in modo informale:
Ask one person formally:|||Chiedi a una persona in modo formale:
Say in Italian:|||Dillo in italiano:
Translate into Italian:|||Traduci in italiano:
Complete the sentence:|||Completa la frase:
Choose the correct answer.|||Scegli la risposta corretta.
Statement · falling ending|||Affermazione · finale discendente
Question · rising ending|||Domanda · finale ascendente
Curve ending upwards|||Curva con finale ascendente
Curve ending downwards|||Curva con finale discendente
Greetings & wellbeing|||Saluti e benessere
Alphabet & spelling|||Alfabeto e spelling
Greetings & farewells|||Saluti iniziali e finali
C and CH sounds|||Suoni C e CH
Silent H spelling|||Ortografia della H muta
Expressions with avere|||Espressioni con avere
G and GH sounds|||Suoni G e GH
Tu and Lei|||Tu e Lei
Gender, number & definite articles|||Genere, numero e articoli determinativi
Italian foundations & vowels|||Basi dell’italiano e vocali
Numbers 0-20 and age|||Numeri 0–20 ed età
Indefinite & plural articles|||Articoli indeterminativi e plurali
Plural formation|||Formazione del plurale
Sentence & pattern practice|||Esercizi su frasi e schemi
Article application|||Uso degli articoli
Plural articles|||Articoli plurali
Family vocabulary|||Lessico della famiglia
Family sentences and practice|||Frasi ed esercizi sulla famiglia
Classroom sentences — 12 questions|||Frasi in classe — 12 domande
Homework: match pronouns — 6 questions|||Compiti: abbina i pronomi — 6 domande
Homework: sentence gaps — 10 questions|||Compiti: completa le frasi — 10 domande
Homework: choose the translation — 8 questions|||Compiti: scegli la traduzione — 8 domande
Study tools|||Strumenti di studio
Current topic|||Argomento attuale
`.trim().split('\n').map(line=>line.split('|||')));
root.ItalianUICatalogue=Object.freeze({messages:Object.freeze(messages),blocks:{}});
})(window);
