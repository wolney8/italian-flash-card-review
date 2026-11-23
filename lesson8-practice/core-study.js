/* Class, homework and presentation exercises taught on 17 November 2026. */
(function (root) {
  'use strict';
  const {bilingual, coreTopics} = root.ItalianLesson8;
  root.ItalianLesson8.buildCoreSheets = function ({question, section, example, line: stimulusLine}) {
    const classFile = 'Exercise Class FARE-STARE.pdf';
    const homeworkFile = 'Homework FARE - STARE.pdf';
    const presentation = 'Session 8 - 17.11.2026.pptx';
    const subjects = ['Io','Tu','Lui / Lei','Noi','Voi','Loro'];
    const people = [
      ['I am speaking about myself. Both io forms end in -o.','Parlo di me. Entrambe le forme di io finiscono in -o.'],
      ['You are speaking to one friend. Listen for -ai in the tu form.','Parli con un amico. Nella forma di tu senti -ai.'],
      ['One other person does it. The short he/she form ends in -a.','Lo fa una sola persona. La forma breve per lui o lei finisce in -a.'],
      ['We includes the speaker. Listen for -iamo.','Noi comprende chi parla. Ascolta la desinenza -iamo.'],
      ['You are addressing several people. Listen for -ate.','Ti rivolgi a più persone. Ascolta la desinenza -ate.'],
      ['Two or more people do it. Both loro forms have a double n.','Lo fanno due o più persone. Entrambe le forme di loro hanno la doppia n.']
    ];
    const forms = {fare:['faccio','fai','fa','facciamo','fate','fanno'],
      stare:['sto','stai','sta','stiamo','state','stanno']};
    function sourced(source, page, activity, n, q) {
      return {...q, source, sourcePage:page, sourceActivity:activity, sourceItem:n};
    }
    function sheet(i, summary, summaryIt, sections, questions, sourceKind) {
      const {slug,title,it} = coreTopics[i];
      return {slug,title,titleIt:it,subtitle:summary,subtitleIt:summaryIt,intro:bilingual(summary,summaryIt),
        scope:'Lesson 8',lesson:'L8',courseLesson:'L8',sourceKind,
        sourceItemCount:questions.length,responseCount:questions.length,study_sections:sections,questions};
    }
    function word(id, task, stimulus, model, hints, complete, meaning, alternatives=[]) {
      const rows = Array.isArray(stimulus) ? stimulus : [stimulusLine('', stimulus)];
      return question(id,task,rows,model,...hints,complete,meaning,alternatives);
    }
    function choice(q, choices) {return {...q,type:'choice',choices};}

    // Homework p. 1, ex. 3A and p. 2, ex. 4A. Each table has six responses.
    const tables = [];
    for (const [verb, entries] of Object.entries(forms)) {
      entries.forEach((model,i) => {
        const phrase = subjects[i] + ' ___';
        const en = verb === 'fare' ? ['I do','you do','he / she does','we do','you all do','they do'][i]
          : ['I stay','you stay','he / she stays','we stay','you all stay','they stay'][i];
        tables.push(sourced(homeworkFile,verb==='fare'?1:2,verb==='fare'?'3A':'4A',i+1,
          word('table-'+verb+'-'+(i+1),'Write the present tense of ' + verb + ' for this person.',phrase,model,people[i],subjects[i]+' '+model+'.',en+'.')));
      });
    }
    const tableGuide = [
      section('learn','From lavorare to fare and stare','Da lavorare a fare e stare',[
        example('Io lavoro. Noi lavoriamo.', 'I work. We work. With regular lavorare the stem stays lavor-.'),
        bilingual('For fare and stare, learn the six forms in order. The homework asks for the missing verb on each row.',
          'Per fare e stare, impara le sei forme in ordine. Nei compiti completa ogni riga con il verbo.'),
        example('Tu fai sport. Tu stai bene.', 'You do sport. You are well. Say fai and stai together. Then try fa and sta.')
      ]),
      {type:'table',stage:'examples',title:'The three verbs side by side',titleIt:'I tre verbi a confronto',
        headers:['Person','lavorare','fare','stare'],headersIt:['Persona','lavorare','fare','stare'],
        rows:subjects.map((person,i)=>[person,['lavoro','lavori','lavora','lavoriamo','lavorate','lavorano'][i],forms.fare[i],forms.stare[i]])}
    ];

    const classChoices = [
      ['Io ___ bene.', ['sto','stai'], 'sto',0,'I am well.'],
      ['Tu ___ il dottore.', ['faccio','fai'], 'fai',1,'You are a doctor.'],
      ['Maria ___ l’insegnante.', ['fa','fanno'], 'fa',2,'Maria is a teacher.'],
      ['Noi ___ così così.', ['stiamo','state'], 'stiamo',3,'We are so-so.'],
      ['Loro ___ bene.', ['sta','stanno'], 'stanno',5,'They are well.'],
      ['Voi ___ un corso di italiano.', ['fate','fanno'], 'fate',4,'You are taking an Italian course.']
    ];
    const choices = classChoices.map(([line,bank,model,i,gloss],j)=>sourced(classFile,1,'2',j+1,
      choice(word('class-form-'+(j+1),'Choose the present form of ' +
        (['sto','stiamo','stanno'].includes(model) ? 'stare' : 'fare') + ' that fits the person.',line,model,people[i],line.replace('___',model),gloss),bank)));
    const fareGaps = [
      ['Tu ___ l’insegnante.',1,'You are a teacher.'],['Mario ___ il cuoco.',2,'Mario is a chef.'],
      ['Io ___ la cameriera.',0,'I am a waitress.'],['Noi ___ un corso di italiano.',3,'We are taking an Italian course.'],
      ['Voi ___ sport?',4,'Do you play sport?'],['Luca e Anna ___ i dottori.',5,'Luca and Anna are doctors.']
    ];
    fareGaps.forEach(([line,i,gloss],j)=>{
      const model=forms.fare[i];
      choices.push(sourced(homeworkFile,2,'3B',j+1,word('hw-fare-'+(j+1),'Write the missing present form of fare.',line,model,
        people[i],line.replace('___',model),gloss)));
    });
    const fareGuide = [
      section('learn','One person or several?','Una persona o più di una?',[
        example('Maria fa sport. Maria e Anna fanno sport.','Maria plays sport. Maria and Anna play sport. One person becomes two, so fa changes to fanno.'),
        bilingual('Choose between the two printed forms in the six class questions. Then fill six homework gaps with fare.',
          'Scegli fra le due forme nelle sei frasi svolte in classe. Poi completa sei frasi dei compiti con fare.'),
        example('faccio · fai · fa · facciamo · fate · fanno','The homework word bank, in person order.')
      ]),
      section('examples','Five uses of fare','Cinque usi di fare',[
        example('Faccio una torta. / Faccio un disegno.','I make a cake. / I do a drawing.'),
        example('Faccio sport. / Faccio i compiti.','I do sport. / I do my homework.'),
        example('Faccio l’insegnante.','I’m a teacher. Fare + the definite article gives a job.'),
        example('Fa caldo. / Fa freddo.','It’s hot. / It’s cold. The weather takes fa.'),
        example('Due più due fa quattro. / La strada fa tre chilometri.','Two plus two makes four. / The road is three kilometres long.')
      ])
    ];

    const roles = [
      ['Il cuoco / la cuoca','Chef','Think about the person preparing a meal.','Pensa a chi prepara il pasto.'],
      ['L’insegnante','Teacher','Think about the person teaching a class.','Pensa a chi tiene la lezione.'],
      ['Il dottore / la dottoressa','Doctor','Who examines a patient?','Chi visita il paziente?'],
      ['Il cameriere / la cameriera','Waiter / waitress','Who brings food to your table?','Chi porta il cibo al tavolo?'],
      ['L’infermiere / l’infermiera','Nurse','Who gives nursing care on the ward?','Chi presta assistenza infermieristica in reparto?'],
      ['Il commesso / la commessa','Shop assistant','Who helps you choose an item in a shop?','Chi ti aiuta a scegliere in negozio?']
    ];
    const jobBank=['Nurse','Chef','Teacher','Shop assistant','Doctor','Waiter / waitress'];
    const jobs = roles.map(([role,model,en,it],i)=>sourced(homeworkFile,1,'2 · professions',i+1,
      choice(word('hw-job-'+(i+1),'Choose the English meaning of this Italian job title.',role,
        model,[en,it],role,model),jobBank)));
    const places = [
      ['Il medico','in ospedale','a doctor','A hospital treats patients.','In questo luogo si curano i pazienti.'],
      ['Il cuoco','in un ristorante','a chef','People come here to have a meal.','La gente viene qui a mangiare.'],
      ['L’insegnante','in una scuola','a teacher','Think of classrooms and students.','Pensa alle aule e agli alunni.'],
      ['Il commesso','in un negozio','a shop assistant','Customers come here to buy things.','I clienti vengono qui per fare acquisti.'],
      ['Il cameriere','in un ristorante','a waiter','He serves customers at their tables.','Serve i clienti ai tavoli.']
    ];
    // The handout prints "In un ristorante" twice. Either printed option means the same.
    const placeBank=['in un ristorante','in una scuola','in ospedale','in un negozio'];
    places.forEach(([role,model,en,hint,hintIt],i)=>{
      const line=role+' lavora ___.';
      jobs.push(sourced(homeworkFile,1,'2 · workplaces',i+1,
        choice(word('hw-place-'+(i+1),'Choose the workplace that goes with this job.',line,model,[hint,hintIt],line.replace('___',model),
          'Where does '+en+' work in this exercise?'),placeBank)));
    });
    const jobGuide=[
      section('learn','Match a job and a place','Abbina professione e luogo',[
        example('L’insegnante lavora in una scuola.','The teacher works in a school. First choose the English job. Then choose a workplace for each role.'),
        bilingual('Follow the homework examples. Two people can work in the same place.',
          'Segui gli esempi dei compiti. Due persone possono lavorare nello stesso posto.')
      ]),
      section('examples','In a restaurant','Al ristorante',[
        example('Il cuoco lavora in un ristorante.','The chef works in a restaurant. He prepares the food.'),
        example('La cameriera lavora in un ristorante.','The waitress works in a restaurant. She serves the customers.'),
        bilingual('Textbook homework · Page 26, exercise 14: identify professions from the pictures. Page 173, exercise 12: give the workplace for each job. Complete these in your textbook.',
          'Compiti sul libro · Pagina 26, esercizio 14: completa le frasi con le professioni delle immagini. Pagina 173, esercizio 12: scrivi il luogo di lavoro di ciascuna professione.')
      ])
    ];

    const translations=[
      ['I am a teacher.','Faccio l’insegnante.', ['Sono insegnante','Sono un insegnante','Sono un’insegnante','Lavoro come insegnante','Sono docente','Sono un docente','Sono una docente'],
        'Use fare with the article, or use essere with the job title.','Usa fare con l’articolo, oppure essere con la professione.'],
      ['I am well, thank you.','Sto bene, grazie.', ['Grazie, sto bene','Sto bene, ti ringrazio','Sto bene, la ringrazio'],
        'Start with how you feel. Then thank the other person.','Di’ come stai e poi ringrazia.'],
      ['What do you do for a living?','Che lavoro fai?', ['Che lavoro fa','Che lavoro fate','Qual è il tuo lavoro','Qual è il suo lavoro','Qual è il vostro lavoro','Cosa fai di lavoro','Che cosa fai di lavoro','Cosa fa di lavoro','Che cosa fa di lavoro','Cosa fate di lavoro','Che cosa fate di lavoro','Che mestiere fai','Che mestiere fa','Di cosa ti occupi','Di cosa si occupa','Di cosa vi occupate'],
        'Laura’s question begins Che lavoro. Choose fare for the person you are asking.','La domanda di Laura inizia con Che lavoro. Scegli la forma di fare per la persona a cui parli.'],
      ['I am a chef.','Faccio il cuoco.', ['Faccio la cuoca','Sono cuoco','Sono cuoca','Sono un cuoco','Sono una cuoca','Sono uno chef','Sono una chef','Sono chef','Faccio lo chef','Faccio la chef','Lavoro come cuoco','Lavoro come cuoca','Lavoro come chef'],
        'Use a job word such as cuoco or cuoca. Fare needs a definite article here.','Usa una parola come cuoco o cuoca. Qui fare richiede l’articolo determinativo.'],
      ['How are you?','Come stai?', ['Come sta','Come state','Come va','Come va oggi'],
        'With a friend use tu. With someone you address politely use Lei.','Con un amico usa tu. Se dai del Lei, usa la forma di cortesia.']
    ];
    const talk=translations.map(([line,model,alternatives,en,it],i)=>{
      const answers=[model,...alternatives];
      const expanded = [0,1,3].includes(i)? answers.concat(answers.filter(a=>!/^(grazie)/i.test(a)).map(a=>'Io '+a)):answers;
      return sourced(classFile,1,'3',i+1,word('class-translate-'+(i+1),'Translate the whole '+(line.endsWith('?')?'question':'sentence')+' into Italian.',[stimulusLine('',line,'en')],
        model,[en,it],model,line,expanded.filter(a=>a!==model)));
    });
    const speakGuide=[
      section('learn','A job and a workplace','Una professione e un luogo di lavoro',[
        example('Faccio l’insegnante e lavoro in una scuola.','I’m a teacher and I work in a school. Faccio tells us what the job is. In introduces the place.'),
        example('Lavoro come insegnante in una scuola.','I work as a teacher in a school. Come introduces the role.'),
        bilingual('Extra speaking practice · Someone says “Lavoro l’insegnante”. Try saying this with come. Then try it with faccio. Check the two models above.',
          'Esercizio orale in più · Qualcuno dice “Lavoro l’insegnante”. Prova a dirlo con come, poi con faccio. Confronta i due modelli sopra.')
      ]),
      section('examples','Pair speaking · John, Giulia, then you','A coppie · John, Giulia, poi tu',[
        example('A. Ciao! Come ti chiami?', 'Hi! What’s your name?'),
        example('B. Mi chiamo John.', 'My name is John.'),
        example('A. Che lavoro fai?', 'What do you do for a living?'),
        example('B. Faccio il cuoco.', 'I’m a chef.'),
        example('A. Dove lavori?', 'Where do you work?'),
        example('B. Lavoro in un ristorante.', 'I work in a restaurant.'),
        example('A. Come stai oggi?', 'How are you today?'),
        example('B. Sto bene, grazie!', 'I’m well, thank you!'),
        bilingual('Swap roles. Choose a character from slide 12 on the next page. Answer all four questions, then give your own answers. You can also say Sono studente/studentessa or Sono pensionato/pensionata.',
          'Scambiatevi i ruoli. Nella pagina seguente scegli un personaggio della diapositiva 12. Rispondi alle quattro domande, poi dai le tue risposte. Puoi anche dire Sono studente/studentessa o Sono pensionato/pensionata.')
      ]),
      {type:'table',stage:'examples',title:'Speaking roles · slide 12',titleIt:'Personaggi per il dialogo · diapositiva 12',
        headers:['Name','Faccio…','Lavoro…'],headersIt:['Nome','Faccio…','Lavoro…'],
        rows:[
          ['Giulia','l’insegnante','in una scuola'], ['Marco','il medico','in ospedale'],
          ['Sara','l’infermiera','in ospedale'], ['Antonio','il cuoco','in un ristorante'],
          ['Luca','il cameriere','in un ristorante'], ['Anna','l’impiegata','in un ufficio'],
          ['Davide','il poliziotto','in una stazione di polizia'], ['Alessandro','il pompiere','in una caserma dei pompieri'],
          ['Federico','il pilota','in un aeroporto'], ['Martina','la parrucchiera','in un salone di bellezza'],
          ['Elena','la commessa','in un negozio'], ['Paolo','l’operaio','in un cantiere'],
          ['Giuseppe','il contadino','in una fattoria'], ['Laura','l’avvocata','in uno studio legale'],
          ['Andrea','il banchiere','in una banca']
        ]}
    ];

    const phraseBank=['Come stai?','Sto bene','Sta bene','Sto così così'];
    const turns=[
      ['Choose the question you would ask a friend about how she feels.',
        [stimulusLine('Speaker A','Ciao, Anna! ___')],
        'Come stai?','You are speaking to one friend. Use the tu form.','Parli a una sola amica. Usa la forma del tu.','Ciao, Anna! Come stai?','Hi, Anna! How are you?'],
      ['Choose the reply that says Anna feels so-so.',
        [stimulusLine('Speaker A','Come stai?'),stimulusLine('Anna','Ciao! Oggi ___.'),stimulusLine('Speaker A','Mi dispiace!')],
        'Sto così così','Anna is speaking about herself. Pick the less positive reply.','Anna parla di sé. Scegli la risposta meno positiva.','Oggi sto così così.','I feel so-so today.'],
      ['Choose the reply that says you feel well.',
        [stimulusLine('Anna','Oggi sto così così.'),stimulusLine('You','Mi dispiace! Io invece ___.')],
        'Sto bene','Invece means “on the other hand”. The speaker feels better than Anna.','Invece introduce un contrasto. Chi parla si sente meglio di Anna.','Mi dispiace! Io invece sto bene.','Sorry to hear that! I’m well, though.'],
      ['Choose the reply that says Marco feels well.',
        [stimulusLine('Anna','E Marco? Come sta?'),stimulusLine('You','___.')],
        'Sta bene','You are talking about one other person. Choose the third-person singular.','Parli di un’altra persona. Usa la terza persona singolare.','Sta bene.','He is well.']
    ];
    const wellbeing=turns.map(([task,rows,model,en,it,complete,gloss],i)=>sourced(classFile,1,'1',i+1,
      choice(word('class-dialogue-'+(i+1),task,rows,model,[en,it],complete,gloss),phraseBank)));
    const states=[
      ['Sto bene','I’m well','Bene is the positive answer.','Bene indica che ti senti bene.'],
      ['Sto male','I’m unwell','Male describes feeling poorly.','Male indica che non ti senti bene.'],
      ['Sto così così','I’m so-so','Think of a day somewhere in the middle.','Pensa a una giornata né buona né cattiva.'],
      ['Sto molto bene','I’m very well','Molto strengthens the reply.','Molto rafforza la risposta.']
    ];
    const englishBank=['I’m unwell','I’m so-so','I’m well','I’m very well'];
    states.forEach(([line,model,en,it],i)=>wellbeing.push(sourced(homeworkFile,2,'4B',i+1,
      choice(word('hw-wellbeing-'+(i+1),'Choose the English phrase that describes how the speaker feels.',line,
        model,[en,it],line+'.',model+'.'),englishBank))));
    const wellbeingGuide=[
      section('learn','Ask about Anna, then Marco','Chiedi di Anna, poi di Marco',[
        example('A. Come stai?', 'How are you?'),
        example('B. Sto bene. E Marco?', 'I’m well. And Marco?'),
        example('A. Sta bene.', 'He’s well. Listen for stai, sto and sta.'),
        example('Come stai? · Sto bene · Sta bene · Sto così così','These are the four phrases from the class dialogue. Choose the one that fits the speaker and the next reply.')
      ]),
      section('examples','More ways to use stare and come','Altri usi di stare e come',[
        example('Stasera sto a casa. / Sto in piedi. / Sto seduta.','I’m staying at home tonight. / I’m standing. / I’m sitting (female speaker).'),
        example('I piatti stanno nella credenza. / Stai attento! / Questa giacca ti sta d’incanto.','The plates are in the cupboard. / Be careful! / This jacket looks wonderful on you.'),
        example('Come stai? / Lavoro come insegnante. / Sei come un fratello per me.','How are you? / I work as a teacher. / You’re like a brother to me. Come changes meaning with the sentence.')
      ])
    ];

    const mixedRows=[
      ['Io ___ in una scuola.','lavorare','lavoro',0,'I work in a school.'],
      ['Tu ___ in un ristorante.','lavorare','lavori',1,'You work in a restaurant.'],
      ['Il medico ___ in ospedale.','lavorare','lavora',2,'The doctor works in hospital.'],
      ['Noi ___ italiano.','studiare','studiamo',3,'We study Italian.'],
      ['Io ___ il cuoco.','fare','faccio',0,'I’m a chef.'],
      ['Loro ___ bene.','stare','stanno',5,'They are well.'],
      ['Marco ___ il professore.','fare','fa',2,'Marco is a teacher.'],
      ['Voi ___ a casa.','stare','state',4,'You all stay at home.'],
      ['Lucia ___ una torta.','fare','fa',2,'Lucia makes a cake.'],
      ['___ freddo!','fare','Fa',null,'It’s cold!'],
      ['Loro ___ inglese.','studiare','studiano',5,'They study English.']
    ];
    const mixed=mixedRows.map(([line,verb,model,i,en],j)=>{
      let hints;
      if (i===null) hints=['For the weather, use fare in the he/she form.','Per il tempo usa la terza persona singolare di fare.'];
      else if (verb==='studiare' || verb==='lavorare') {
        const ending=['-o','-i','-a','-iamo','-ate','-ano'][i];
        hints=['Use the regular '+subjects[i]+' ending '+ending+'.'+(verb==='studiare'&&i===3?' Write a single i.':''),
          'Usa la desinenza regolare '+ending+' per '+subjects[i]+'.'+(verb==='studiare'&&i===3?' Scrivi una sola i.':'')];
      } else hints=people[i];
      return sourced(presentation,16,'Mixed verbs',j+1,word('slide-16-'+(j+1),
        'Write the missing present form of '+verb+'.',line,model,hints,line.replace('___',model),en));
    });
    const mixedGuide=[
      section('learn','Start with the person','Comincia dalla persona',[
        example('Io lavoro in un ufficio. / I dottori lavorano in ospedale.','I work in an office. / The doctors work in hospital. For regular -are verbs, remove -are and add the ending for the person.'),
        example('Io studio. / Noi studiamo. / Loro studiano.','I study. / We study. / They study. Write studiamo with a single i.'),
        bilingual('Slides 2–7 revise regular verbs. The eleven practice gaps follow slide 16 in order. Each gap tells you which verb to use.',
          'Le diapositive 2–7 ripassano i verbi regolari. Gli undici spazi seguono l’ordine della diapositiva 16. Per ogni frase trovi il verbo da usare.')
      ]),
      section('examples','A regular and an irregular verb','Un verbo regolare e uno irregolare',[
        example('Marco lavora in una scuola. / Marco fa il professore.','Marco works in a school. / Marco is a teacher. Both refer to him, but the verbs have different forms.'),
        example('Oggi ho freddo. / Oggi fa freddo.','I feel cold today. / The weather is cold today.'),
        bilingual('Textbook homework · Page 174, exercise 15: complete the sentences with the correct words. Use your textbook for the sentences.',
          'Compiti sul libro · Pagina 174, esercizio 15: completa le frasi con le parole corrette. Le frasi sono nel libro.')
      ])
    ];
    return [
      sheet(0,'Homework · Complete the two six-person verb tables (pp. 1–2).','Compiti · Completa le due tabelle di sei persone (pp. 1–2).',tableGuide,tables,'Homework'),
      sheet(1,'Class p. 1 and homework p. 2 · Six choices, then six gaps.','Scheda in classe p. 1 e compiti p. 2 · Sei scelte, poi sei frasi da completare.',fareGuide,choices,'Class and homework'),
      sheet(2,'Homework p. 1 · Match six professions and five workplaces.','Compiti p. 1 · Abbina sei professioni e cinque luoghi di lavoro.',jobGuide,jobs,'Homework'),
      sheet(3,'Class p. 1 · Translate five everyday lines. Try the pair conversation aloud.','Scheda in classe p. 1 · Traduci cinque frasi. Prova il dialogo a coppie ad alta voce.',speakGuide,talk,'Class practice'),
      sheet(4,'Class p. 1 and homework p. 2 · Complete the dialogue, then match four replies.','Scheda in classe p. 1 e compiti p. 2 · Completa il dialogo, poi abbina quattro risposte.',wellbeingGuide,wellbeing,'Class and homework'),
      sheet(5,'Class presentation · Complete the eleven sentences on slide 16.','Presentazione in classe · Completa le undici frasi della diapositiva 16.',mixedGuide,mixed,'Class practice')
    ];
  };
})(window);
