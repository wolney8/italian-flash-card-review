/* UI-only bilingual labels for Daily Focus. The authored lesson text is never translated here. */
(function (root) {
  'use strict';
  const labels = Object.freeze({
    "Daily Focus":"Focus quotidiano",
    "A little Italian, today":"Un po’ di italiano, oggi",
    "Choose your time. We will prepare a useful mix from your course.":"Scegli quanto tempo dedicare. Prepareremo un mix utile dal corso.",
    "Not started":"Non iniziato","In progress":"In corso","Saved for later":"Salvato per dopo",
    "Completed":"Completato","Skipped today":"Oggi saltato","Partial":"Parziale",
    "Today’s target is complete.":"Hai raggiunto l’obiettivo di oggi.",
    "You can stop here. Another drill is optional.":"Puoi fermarti qui. Un altro esercizio è facoltativo.",
    "Today is quiet. You can still start a drill whenever you want.":"Nessun promemoria per oggi. Puoi comunque iniziare quando vuoi.",
    "How much time have you got?":"Quanto tempo hai?",
    "Approximate duration":"Durata indicativa",
    "Adjust difficulty or spoken practice":"Regola la difficoltà o la pratica orale",
    "Adjust difficulty, speaking or study areas":"Regola difficoltà, pratica orale o argomenti",
    "Difficulty":"Difficoltà","Gentle":"Facile","Standard":"Standard","Challenge":"Sfida",
    "Spoken recall":"Ripasso orale","Offer spoken recall":"Proponi il ripasso orale",
    "Gentle shows hints. Standard keeps them optional. Challenge favours longer recall where available. Time and difficulty are separate.":"Facile mostra i suggerimenti. Standard li rende facoltativi. Sfida privilegia risposte più articolate, quando disponibili. Tempo e difficoltà sono indipendenti.",
    "Spoken recall is self-assessed. You can always answer quietly.":"La pratica orale è autovalutata. Puoi sempre rispondere in silenzio.",
    "Study areas (optional)":"Argomenti da studiare (facoltativo)",
    "How should we choose topics?":"Come scegliamo gli argomenti?",
    "Smart mix (recommended)":"Mix intelligente (consigliato)",
    "Mix my areas with weak spots":"Unisci i miei argomenti ai punti deboli",
    "Only my chosen areas":"Solo gli argomenti scelti",
    "Choose the areas you want":"Scegli gli argomenti",
    "Smart mix already prioritises flagged, difficult and due items. Choosing topics does not mark them as difficult.":"Il mix intelligente dà priorità agli elementi segnalati, difficili e da ripassare. Selezionare un argomento non lo segna come difficile.",
    "Choose at least one area for the selected mode.":"Scegli almeno un argomento per questa modalità.",
    "Choose at least one study area or use Smart mix.":"Scegli almeno un argomento oppure usa il mix intelligente.",
    "With Smart mix, you can leave everything else alone.":"Con il mix intelligente non devi scegliere altro.",
    "Start my drill":"Inizia l’esercizio","Start another drill":"Inizia un altro esercizio",
    "One qualifying drill is enough for today, including the two-minute option.":"Un esercizio completato è sufficiente per oggi, anche quello di due minuti.",
    "Your drills":"I tuoi esercizi",
    "Your drills will appear here. You can repeat a drill with new questions or review the answers afterwards.":"Qui appariranno i tuoi esercizi. Potrai ripeterli con nuove domande o rivedere le risposte.",
    "Review answers":"Rivedi le risposte","New questions":"Nuove domande","Resume":"Riprendi",
    "A week of practice":"Una settimana di pratica",
    "Monday to Sunday":"Da lunedì a domenica",
    "Activity from Monday to Sunday":"Attività da lunedì a domenica",
    "Completed web drill":"Esercizio online completato",
    "Practice started":"Pratica iniziata","Self-reported study":"Studio dichiarato",
    "Studied in Anki or your workbook?":"Hai studiato su Anki o sul quaderno?",
    "Record it as self-reported activity. It does not complete a web drill or add question results.":"Registralo come attività dichiarata. Non completa un esercizio online né aggiunge risultati alle domande.",
    "I studied in Anki":"Ho studiato su Anki","I used my workbook":"Ho usato il quaderno",
    "Recorded today:":"Registrato oggi:","Skip today":"Salta oggi",
    "Practice flags, backup and device options":"Segnalazioni, backup e dispositivi",
    "Topics that need practice":"Argomenti da ripassare",
    "Optional. Your drill is prepared even if you leave these alone. Select again to clear a flag.":"Facoltativo. L’esercizio sarà pronto anche senza selezioni. Seleziona di nuovo per togliere una segnalazione.",
    "How the mix is chosen":"Come vengono scelti gli esercizi",
    "Your progress on this device":"I tuoi progressi su questo dispositivo",
    "Saved in this browser. There is no signed-in progress account or automatic Mac–phone sync.":"Salvato in questo browser. Non c’è un account di accesso né una sincronizzazione automatica tra Mac e telefono.",
    "This preview and the live site have separate storage.":"L’anteprima e il sito pubblico salvano i progressi separatamente.",
    "To move Daily Focus progress, export a backup, send the file to your other device, then import it there. Imports merge with saved Daily Focus work. Existing course progress and Anki are separate.":"Per trasferire i progressi, esporta un backup, invialo all’altro dispositivo e importalo. I backup si uniscono al lavoro salvato. Il corso e Anki conservano progressi separati.",
    "Export Daily Focus backup":"Esporta il backup di Focus quotidiano",
    "Import a Daily Focus backup":"Importa un backup di Focus quotidiano",
    "Merge them with the work already on this browser?":"Unirli al lavoro già salvato in questo browser?",
    "Merge this backup":"Unisci questo backup","Cancel":"Annulla",
    "Home-screen and offline access":"Schermata Home e accesso offline",
    "You can save the site to your home screen from your browser. This preview needs an internet connection to load course material. It does not yet provide offline study.":"Puoi aggiungere il sito alla schermata Home dal browser. L’anteprima richiede internet per caricare il materiale. Lo studio offline non è ancora disponibile.",
    "Issues saved for later":"Problemi salvati per dopo",
    "Use “Flag an issue for later” inside a drill. Your note stays here so you can keep practising.":"Usa “Segnala un problema per dopo” durante un esercizio. La nota resta qui mentre continui a studiare.",
    "Saved with its question":"Salvato con la domanda",
    "Pause":"Pausa","Meaningful steps completed":"Attività svolte",
    "You have done enough to qualify.":"Hai svolto abbastanza attività per completare l’esercizio.",
    "Finish here, or keep practising if you want.":"Puoi concludere qui oppure continuare, se vuoi.",
    "Finish drill":"Concludi l’esercizio",
    "Short exercise":"Esercizio breve","Flashcard":"Carta didattica",
    "Read and remember":"Leggi e ricorda","Spoken or quiet recall":"Ripasso orale o silenzioso",
    "No review recorded here yet":"Nessun ripasso registrato qui",
    "You flagged this item":"Hai segnalato questo elemento",
    "A recent answer needs another try":"Una risposta recente richiede un altro tentativo",
    "Marked difficult in earlier web practice":"Difficile in un precedente esercizio online",
    "Familiar practice from today":"Ripasso già svolto oggi",
    "Earlier web practice; no review date recorded":"Esercizio precedente, senza data di ripasso",
    "I’ve read this":"L’ho letto",
    "Reading recorded.":"Lettura registrata.",
    "This is exposure, separate from active recall.":"È una lettura, non una prova di richiamo.",
    "Recall the answer quietly.":"Ricorda la risposta in silenzio.",
    "Say your answer aloud, or recall it quietly.":"Rispondi ad alta voce oppure mentalmente.",
    "Then reveal it and assess your own recall.":"Poi mostra la risposta e valuta quanto ricordavi.",
    "How did that feel? Choose one to complete this step.":"Com’è andata? Scegli una valutazione per completare l’attività.",
    "Reveal answer":"Mostra la risposta","I don’t know":"Non lo so",
    "I knew it":"Lo sapevo","Not sure":"Non sono sicuro","Needs more practice":"Da ripassare",
    "Your answer:":"La tua risposta:","Your answer":"La tua risposta",
    "How confident did it feel? (optional)":"Quanto eri sicuro? (facoltativo)",
    "Choose one answer":"Scegli una risposta","Check answer":"Controlla la risposta",
    "Hint":"Suggerimento","Correct.":"Corretto.","Answer":"Risposta",
    "A useful learning attempt.":"Un tentativo utile per imparare.",
    "Good to practise this one.":"È utile esercitarsi ancora su questo.",
    "This attempt counts. Saved for further practice.":"Questo tentativo conta. Elemento salvato per un altro ripasso.",
    "Next step":"Prossima attività","See my summary":"Vedi il riepilogo",
    "Needs practice":"Da ripassare","Flag this topic":"Segnala questo argomento",
    "Flag an issue for later":"Segnala un problema per dopo",
    "A quick note for later":"Una nota per dopo","What needs checking?":"Che cosa va controllato?",
    "Save issue":"Salva la nota","Skip question":"Salta la domanda","Swap question":"Cambia domanda",
    "Save for later today":"Salva per dopo","Make this shorter":"Riduci la durata",
    "Finish for now":"Concludi per ora","Round":"Turno",
    "A good place for a breather":"È un buon momento per una pausa",
    "Take about a minute if you want. Breaks are included in the approximate time budget.":"Se vuoi, fai una pausa di circa un minuto. Le pause sono incluse nella durata indicativa.",
    "Your place is saved. Active practice time is paused here. Skipped steps remain unfinished.":"La posizione è salvata. Il tempo di pratica attiva è fermo. Le attività saltate restano incomplete.",
    "Start the next round":"Inizia il turno successivo",
    "Choose a shorter version":"Scegli una versione più breve",
    "Keep all completed work. The result will use the shorter duration.":"Le attività completate restano salvate. Il risultato userà la durata più breve.",
    "Drill complete":"Esercizio completato","Your practice is saved":"La tua pratica è salvata",
    "That is enough for today. Your completed drill stays recorded.":"Hai fatto abbastanza per oggi. L’esercizio completato resta registrato.",
    "You have met the practice target. Finish the drill when you are ready.":"Hai raggiunto l’obiettivo. Concludi l’esercizio quando vuoi.",
    "Wrong answers count as practice. Skips do not.":"Le risposte sbagliate contano come pratica; le domande saltate no.",
    "Steps completed":"Attività completate","Recall attempts":"Tentativi di richiamo",
    "Self-rated confident":"Risposte sicure (autovalutate)","To revisit":"Da ripassare",
    "Skipped":"Saltate","Active practice time":"Tempo di pratica attiva",
    "No automatically checked answers in this drill.":"Nessuna risposta corretta automaticamente in questo esercizio.",
    "Flashcards and spoken recall use your own assessment.":"Le carte e il ripasso orale sono autovalutati.",
    "recorded separately.":"registrate separatamente.",
    "Done for today":"Finito per oggi","Resume this drill":"Riprendi l’esercizio",
    "Review questions and answers":"Rivedi domande e risposte",
    "Another drill with new questions":"Un altro esercizio con nuove domande",
    "Try an unfinished question":"Riprova una domanda incompleta",
    "Replace an unfinished question":"Sostituisci una domanda incompleta",
    "Back to Today":"Torna a Oggi","Review your practice":"Rivedi la pratica",
    "Close review":"Chiudi il ripasso",
    "Read-only review. Looking at these answers does not add recall attempts or daily completion.":"Questo è un ripasso di consultazione. Guardare le risposte non aggiunge tentativi né completa l’obiettivo quotidiano.",
    "Previous":"Precedente","Next":"Successivo",
    "You chose":"Hai scelto","You flagged":"Hai segnalato",
    "articles":"articoli","sounds and spelling":"suoni e ortografia",
    "in, on and from":"in, su e da","verb forms":"forme verbali",
    "questions and classroom phrases":"domande e frasi per la lezione",
    "subjects and objects":"soggetti e complementi",
    "everyday conversation":"conversazione quotidiana","numbers":"numeri",
    "Articles":"Articoli","Sounds and spelling":"Suoni e ortografia","In, on and from":"In, su e da",
    "Verb forms":"Forme verbali","Questions and classroom phrases":"Domande e frasi per la lezione",
    "Subjects and objects":"Soggetti e complementi","Everyday conversation":"Conversazione quotidiana","Numbers":"Numeri",
    "Question replaced. The number of assigned steps is unchanged.":"Domanda sostituita. Il numero totale di attività non cambia.",
    "Question skipped. It remains unfinished.":"Domanda saltata. Resta incompleta.",
    "Saved at this exact place. You can resume today or later.":"Salvato in questa posizione. Puoi riprendere oggi o un altro giorno.",
    "Paused. Active practice time has stopped.":"In pausa. Il tempo di pratica attiva è fermo.",
    "Practice flag cleared.":"Segnalazione di ripasso rimossa.",
    "Marked for more practice.":"Segnato per un altro ripasso.",
    "Today’s reminder is quiet. Your saved work is still available.":"Promemoria di oggi disattivato. Il lavoro salvato resta disponibile.",
    "Recorded as self-reported activity.":"Registrato come attività dichiarata.",
    "Backup prepared for download.":"Backup pronto da scaricare.",
    "Issue saved for later. Carry on when you are ready.":"Problema salvato per dopo. Continua quando vuoi.",
    "This drill changed in another tab. Your latest saved question is now shown. Please answer this step.":"L’esercizio è cambiato in un’altra scheda. Ora vedi la domanda salvata più recente. Rispondi a questa attività."
  });
  const originals = new WeakMap();
  const originalAttributes = new WeakMap();
  const skip = '.df-task h2,.df-review-list h3,.df-stimulus .learning-it,.df-stimulus .learning-gloss,.df-stimulus span[lang],.df-reading,.df-model,.df-support p,.df-issue textarea,[data-focus-source]';
  function translate(value) {
    const raw=String(value||'').trim();
    if (Object.prototype.hasOwnProperty.call(labels,raw)) return labels[raw];
    let m;
    if((m=raw.match(/^(\d+)-minute drill(?: · shortened from (\d+) minutes)?$/))) return 'Esercizio di '+m[1]+' minuti'+(m[2]?' · ridotto da '+m[2]+' minuti':'');
    if((m=raw.match(/^(\d+)-minute version, shortened from (\d+) minutes$/)))return 'Versione di '+m[1]+' minuti, ridotta da '+m[2]+' minuti';
    if((m=raw.match(/^(\d+) minutes$/)))return m[1]+' minuti';
    if((m=raw.match(/^(\d+) short steps\. (Rounds of eight, with suggested one-minute breaks\. )?Approximate time, including breaks\. No countdown to beat\.$/))) return m[1]+' brevi attività. '+(m[2]?'Turni da otto, con pause consigliate di un minuto. ':'')+'Tempo indicativo, pause incluse. Nessun conto alla rovescia.';
    if((m=raw.match(/^(\d+) completed steps, including active recall, qualify this drill\.$/)))return 'Bastano '+m[1]+' attività completate, con almeno un tentativo di richiamo.';
    if((m=raw.match(/^Step (\d+) of (\d+)(?: · Round (\d+) of (\d+))?$/)))return 'Attività '+m[1]+' di '+m[2]+(m[3]?' · Turno '+m[3]+' di '+m[4]:'');
    if((m=raw.match(/^Round (\d+) of (\d+) checkpoint$/)))return 'Pausa al termine del turno '+m[1]+' di '+m[2];
    if((m=raw.match(/^Complete (\d+) more steps? to qualify(, including at least one active recall attempt)?\. Wrong answers count as practice\. Skips do not\.$/)))return 'Completa ancora '+m[1]+' attività'+(m[2]?', incluso almeno un tentativo di richiamo':'')+'. Le risposte sbagliate contano come pratica; le attività saltate no.';
    if((m=raw.match(/^(\d+) of (\d+) checked answers were correct\.$/)))return 'Risposte corrette: '+m[1]+' su '+m[2]+'.';
    if((m=raw.match(/^(\d+) reading steps?$/)))return m[1]+' letture';
    if((m=raw.match(/^Last practised here (\d+) days? ago$/)))return 'Ultimo ripasso qui '+m[1]+(m[1]==='1'?' giorno fa':' giorni fa');
    if((m=raw.match(/^You flagged (.+)$/)))return 'Hai segnalato '+(labels[m[1]]||m[1]);
    if((m=raw.match(/^You chose (.+)$/)))return 'Hai scelto '+(labels[m[1]]||m[1]);
    if((m=raw.match(/^(\d+) \/ (\d+) steps · (Completed|Saved for later|In progress)$/)))return m[1]+' / '+m[2]+' attività · '+(labels[m[3]]||m[3]);
    if((m=raw.match(/^(\d{1,2} [A-Za-zÀ-ÿ.]+) · (\d+\/\d+) steps · (Completed|Saved for later|In progress)$/)))return m[1]+' · '+m[2]+' attività · '+(labels[m[3]]||m[3]);
    if((m=raw.match(/^(\d+) saved drills?$/)))return m[1]+' esercizi salvati';
    if((m=raw.match(/^Showing the latest (\d+) drills\. Older work is retained in your backup\.$/)))return 'Mostriamo gli ultimi '+m[1]+' esercizi. I precedenti restano nel backup.';
    if((m=raw.match(/^Recorded today: (.*)\.$/)))return 'Registrato oggi: '+m[1]+'.';
    if((m=raw.match(/^Not enough approved questions in those areas for (\d+) minutes\. Choose a shorter drill or Smart mix\.$/)))return 'Non ci sono abbastanza domande approvate per '+m[1]+' minuti. Scegli una durata più breve o il mix intelligente.';
    if((m=raw.match(/^Flag (.+)$/)))return 'Segnala '+(labels[m[1]]||m[1]);
    if((m=raw.match(/^Your confidence: (.*)$/)))return 'La tua sicurezza: '+(labels[m[1]]||m[1]);
    if((m=raw.match(/^Shortened to (\d+) minutes\. Your completed work is retained\.$/)))return 'Ridotto a '+m[1]+' minuti. Le attività completate restano salvate.';
    if((m=raw.match(/^Backup merged\. (\d+) drills? (?:is|are) saved here\.$/)))return 'Backup unito. Qui sono salvati '+m[1]+' esercizi.';
    if((m=raw.match(/^(\d+) sec$/)))return m[1]+' sec';
    if((m=raw.match(/^(\d+) min (\d+) sec$/)))return m[1]+' min '+m[2]+' sec';
    return raw;
  }
  function apply(scope, locale) {
    if (!scope) return;
    const italian=locale==='it';
    // The interface follows the chosen locale, but approved English prompts
    // remain English for speech readers even when the surrounding UI is Italian.
    const main=scope.matches?.('.daily-focus') ? scope : scope.querySelector('.daily-focus');
    if(main)main.lang=italian?'it':'en-GB';
    for(const element of scope.querySelectorAll('.df-task h2,.df-review-list h3,.df-reading,.df-stimulus strong,.df-support p')) {
      element.lang='en-GB';
    }
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    for(const textNode of nodes){
      const el=textNode.parentElement;
      if(!el || el.closest(skip) || el.closest('script,style,textarea,input,option[data-focus-source]'))continue;
      const old=originals.get(textNode) || textNode.data;
      originals.set(textNode,old);
      const converted=italian?translate(old):old.trim();
      if(converted===old.trim() && old===textNode.data)continue;
      textNode.data=old.replace(/\S[\s\S]*\S|\S/,converted);
    }
    for(const el of scope.querySelectorAll('[aria-label],[placeholder],[title]')){
      if(el.closest(skip))continue;
      const previous=originalAttributes.get(el)||{};
      const updated={...previous};
      for(const attr of ['aria-label','placeholder','title']){
        if(!el.hasAttribute(attr))continue;
        if(!Object.prototype.hasOwnProperty.call(previous,attr))updated[attr]=el.getAttribute(attr);
        const original=updated[attr];
        el.setAttribute(attr,italian?translate(original):original);
      }
      originalAttributes.set(el,updated);
    }
  }
  const api=Object.freeze({translate,apply,labels});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ItalianDailyFocusLocale=api;
})(typeof window!=='undefined'?window:globalThis);
