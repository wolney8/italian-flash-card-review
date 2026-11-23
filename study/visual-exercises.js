import './daily-verbs.js';

export function mountPractice(main, signal) {

  const get = id => main.querySelector('#visual-' + id);
  const subjects = ['io','tu','lui / lei','noi','voi','loro'];
  const verbs = window.ItalianDailyVerbs.verbs;
  const verbRounds = [
    ['parlare',[0,1,3], 'Start with who is speaking. Io means “I”, tu means “you” and noi means “we”.'],
    ['lavorare',[2,4,5], 'Lui or lei is one person. Voi addresses a group. Loro means “they”.'],
    ['leggere',[0,2,4], 'Leggere belongs to the -ere family. Look for the endings for I, he or she, and you all.'],
    ['dormire',[1,3,5], 'Dormire is an -ire verb. The three subjects mean you, we and they.'],
    ['studiare',[0,1,3], 'Study the stem in each box. Tu and noi share the stem’s final i with the ending.'],
    ['finire',[2,4,5], 'The spelling before the gap already includes isc where it is needed. Add just the ending.'],
    ['abitare',[0,2,5], 'Io is the speaker, lui or lei is a single person, and loro means they.'],
    ['mangiare',[1,3,4], 'Use a single written i where the stem and ending meet. Voi addresses several people.'],
    ['vivere',[0,3,5], 'Look for the endings for I, we and they in the -ere family.'],
    ['vedere',[1,2,4], 'You are looking for informal you, he or she, and plural you.'],
    ['scrivere',[0,3,4], 'Noi includes the speaker. Voi is the group the speaker addresses.'],
    ['aprire',[0,3,5], 'Aprire uses the ordinary -ire endings, including for io and loro.']
  ].map(([name,indices,hint]) => {
    const verb = verbs.find(v => v.name === name);
    const boxes = indices.map(i => subjects[i] + ' ' + verb.parts[i].stem + '…');
    return {
      id:name, title:'Match the endings of ' + name, task:'Complete each present-tense form of ' + name + ' (' + verb.meaning + ').',
      boxes,boxLang:'it',tiles:indices.map((i,box) => ({text:'-' + verb.parts[i].ending,box})),
      hint,model:indices.map(i => subjects[i] + ' ' + verb.forms[i]).join(' · '),modelLang:'it'
    };
  });

  const hardSoft = ['Hard sound','Soft sound'];
  const allSounds = ['K as in key','Ch as in chip','G as in go','J as in jam'];
  function soundRound(id,title,task,boxes,groups,hint,model) {
    return {id,title,task,boxes,many:true,hint,model,modelLang:'en',
      tiles:groups.flatMap((words,box) => words.map(text => ({text,box})))};
  }
  // Words used in the pronunciation practice and the Lesson 8 sound cards.
  const soundRounds = [
    soundRound('hard-soft','Hard or soft?', 'Sort each word by its first consonant sound.',hardSoft,
      [['ghiro','chiave'],['cena','giro']],
      'Say the word aloud. An h before e or i keeps c or g hard.',
      'Chiave starts like key and ghiro like go. Cena starts like chip and giro like jam.'),
    soundRound('first-c','Read the first C','Sort each word by the sound of its first c.',hardSoft,
      [['casa','cubo','chilo'],['cena','cibo']],
      'Before a, o or u, c sounds like k. Before e or i, look for h.',
      'Casa, cubo and chilo start like key. Cena and cibo start like chip.'),
    soundRound('first-g','Read the first G','Sort each word by the sound of its first g.',hardSoft,
      [['gatto','gufo','ghepardo'],['gelato','giro']],
      'Compare ga with ge. A silent h keeps g hard before e.',
      'Gatto, gufo and ghepardo start like go. Gelato and giro start like jam.'),
    soundRound('four-sounds','Match four starting sounds','Match the first consonant of each Italian word to an English sound.',allSounds,
      [['corso'],['cibo'],['ghiro'],['gelato']],
      'Say the Italian word, then the English example. Listen only to the starting consonant.',
      'Corso starts like key, cibo like chip, ghiro like go and gelato like jam.'),
    soundRound('inside','Hear the sound inside the word','Sort by the sound of the c or g inside each Italian word.',allSounds,
      [['amiche','barche'],['amici'],['funghi'],['pagine']],
      'Look at the letters next to c or g. Each word here has just one c or g.',
      'Amiche and barche have the k sound. Amici has ch, funghi has hard g and pagine has j.'),
    // Session 2 minutes give four word banks. Session 5 revisits the same sound columns.
    soundRound('ce-che','Read ce and che','Sort the words by the sound of c before e.',hardSoft,
      [['chela','bruschetta','perché'],['certo','pace','aceto']],
      'Find the c before e. A silent h keeps it hard, like k in key.',
      'Chela, bruschetta and perché have the hard k. Certo, pace and aceto have the ch sound in chip.'),
    soundRound('ci-chi','Read ci and chi','Sort the words by the sound of c before i.',hardSoft,
      [['chiodo','parchi','chiamarsi'],['cipolla','cinema','noci']],
      'Ci usually sounds like ch in chip. Look for a silent h in hard words.',
      'Chiodo, parchi and chiamarsi have the k sound. Cipolla, cinema and noci have the ch sound.'),
    soundRound('ge-ghe','Read ge and ghe','Sort the words by the sound of g before e.',hardSoft,
      [['streghe','margherita','alghe'],['gennaio','piogge','agenda']],
      'Say the g like the g in go for ghe, or like the j in jam for ge.',
      'Streghe, margherita and alghe have hard g. Gennaio, piogge and agenda have the j sound.'),
    soundRound('gi-ghi','Read gi and ghi','Sort the words by the sound of g before i.',hardSoft,
      [['ghiaccio','preghiera','maghi'],['rifugi','regina','orologi']],
      'Read just the g and the letters beside it. Ghi keeps a hard g before i.',
      'Ghiaccio, preghiera and maghi have hard g. Rifugi, regina and orologi have the j sound.')
  ];

  function sentenceRound(id,english,parts,boxes,hint,punctuation = '.') {
    return {id,title:'Build the Italian sentence',task:'Build “' + english + '” in Italian. Follow the order shown in the boxes.',
      boxes,tiles:parts.map((text,box) => ({text,box})),hint,model:parts.join(' ') + punctuation,modelLang:'it'};
  }
  // Session 6 classroom expressions, Session 7 model sentences and the Session 8 workplace reminder.
  const sentenceRounds = [
    sentenceRound('school','We work in a school',['Noi','lavoriamo','in una scuola'],
      ['1. Subject','2. Verb','3. Place'],'Start with the people who work. Put the workplace last.'),
    sentenceRound('languages','Lorenzo speaks two languages',['Lorenzo','parla','due lingue'],
      ['1. Subject','2. Verb','3. What he speaks'],'Name the speaker first. The last tile answers “speaks what?”'),
    sentenceRound('history','I study history',['Io','studio','storia'],
      ['1. Subject','2. Verb','3. What I study'],'Use the subject tile even though spoken Italian can leave io out.'),
    sentenceRound('chocolate','Maria eats a lot of chocolate',['Maria','mangia','tanta cioccolata'],
      ['1. Subject','2. Verb','3. What she eats'],'Start with the person. The food is the direct object.'),
    sentenceRound('chef','Marco works as a chef',['Marco','lavora','come cuoco'],
      ['1. Subject','2. Verb','3. Job role'],'Come introduces Marco’s role. Put it after the verb.'),
    sentenceRound('teacher','I am a teacher and I work in a school',['Faccio','l’insegnante','e','lavoro','in una scuola'],
      ['1. First verb','2. Job title','3. And','4. Second verb','5. Workplace'],
      'Give the job with fare first. Join it to the workplace with e.'),
    sentenceRound('spell','How do you spell “letto” in Italian?',['Come','si scrive','“letto”','in italiano'],
      ['1. How','2. Spelling phrase','3. Word','4. Language'],
      'Use the spelling question from the handout. Put the word before the language.','?'),
    sentenceRound('understand','I didn’t understand',['Non','ho','capito'],
      ['1. Negative','2. Helping verb','3. Main verb'],'Start with non and keep ho capito together.'),
    // Names (L1), origins and residence (L3), age (L4/L6) and classroom requests (L6).
    sentenceRound('name','My name is Laura',['Mi','chiamo','Laura'],
      ['1. Short pronoun','2. Verb','3. Name'],'Chiamarsi needs a short pronoun before the verb.'),
    sentenceRound('formal-name','What is your name? (polite)',['Come','si','chiama'],
      ['1. Question word','2. Short pronoun','3. Verb'],'Speak politely to one person. Use the short pronoun that goes with Lei.','?'),
    sentenceRound('origin','I am from Naples',['Io','sono','di Napoli'],
      ['1. Subject','2. Verb','3. Origin'],'Essere uses di for the city someone comes from.'),
    sentenceRound('come-from','I come from Naples',['Io','vengo','da Napoli'],
      ['1. Subject','2. Verb','3. Origin'],'Venire uses da for the city someone comes from.'),
    sentenceRound('residence','I live in England',['Io','abito','in Inghilterra'],
      ['1. Subject','2. Verb','3. Country'],'Abitare means to live somewhere. Put the country last.'),
    sentenceRound('age-question','How old are you? (one friend)',['Quanti','anni','hai'],
      ['1. How many','2. What you count','3. Verb'],'Italian asks how many years you have. Use the tu form of avere.','?'),
    sentenceRound('age-answer','I am twenty-five years old',['Io','ho','venticinque','anni'],
      ['1. Subject','2. Verb','3. Number','4. Years'],'Give your age with avere. The number comes before anni.'),
    sentenceRound('negative','We are not at school',['Noi','non','siamo','a scuola'],
      ['1. Subject','2. Negative word','3. Verb','4. Place'],'Put non immediately before the verb. This sentence comes from the essere homework.'),
    sentenceRound('repeat','Can you repeat, please? (polite)',['Può','ripetere,','per favore'],
      ['1. Can you','2. Action','3. Polite ending'],'Use the form of potere for formal Lei. The following verb stays in the infinitive.','?'),
    sentenceRound('mean','What does “letto” mean?',['Che cosa','significa','“letto”'],
      ['1. What','2. Verb','3. Word you are asking about'],'Begin with the two-word question phrase for “what”.','?'),
    sentenceRound('work-question','What do you do for a living? (one friend)',['Che','lavoro','fai'],
      ['1. Which or what','2. Noun','3. Verb'],'Lavoro means job here. Choose the tu form of fare for the verb.','?')
  ];
  function matchingRound(id,title,task,pairs,hint,boxLang = 'en') {
    return {id,title,task,hint,boxLang,boxes:pairs.map(([box]) => box),
      tiles:pairs.map(([,text],box) => ({text,box})),
      model:pairs.map(([cue,text]) => cue + ' → ' + text).join(' · '),modelLang:boxLang};
  }

  // Reuse the checked reference forms. Do not ask a learner to choose between
  // io and loro for sono: both are correct and share a single box in that round.
  function formRound(id,name,people,hint) {
    const verb = verbs.find(v => v.name === name);
    const pairs = people.map(([subject,index]) => [subject,verb.forms[index]]);
    return matchingRound(id,'Match the forms of ' + name,
      'Match each whole form of ' + name + ' (' + verb.meaning + ') to its subject.',pairs,hint,'it');
  }
  const singular = [['io',0],['tu',1],['lui / lei / Lei',2]];
  const plural = [['noi',3],['voi',4],['loro',5]];
  const formRounds = [
    formRound('essere','essere',[['io / loro',0],['tu',1],['lui / lei / Lei',2]],
      'One form works for both “I am” and “they are”. Lei addresses one person politely.'),
    formRound('chiamarsi','chiamarsi',singular,'Keep the two words together. The first word changes with the person.'),
    formRound('venire','venire',singular,'The origin dialogues ask where one person comes from. Tu is informal and Lei is polite.'),
    formRound('avere','avere',singular,'The h in these three forms is silent. It still matters in writing.'),
    formRound('essere-plural','essere',plural,'Noi includes the speaker. Voi addresses a group. Loro means they.'),
    formRound('avere-plural','avere',plural,'Think about we have, you all have and they have. One form starts with a silent h.'),
    formRound('fare','fare',singular,'In Che lavoro fai? the speaker is talking to one friend. Formal Lei takes the third-person form.'),
    formRound('fare-plural','fare',plural,'The first person plural means we. Use voi when speaking to several people.'),
    formRound('stare','stare',singular,'Compare how you ask a friend and how you ask someone politely about their wellbeing.'),
    formRound('stare-plural','stare',plural,'State and stanno sound similar. Decide whether you are talking to the group or about them.'),
    formRound('andare','andare',singular,'Think of the greeting Come va? and the example Vado a Roma from the avere homework.')
  ];

  // Article sorting uses nouns from the handouts. Each noun has one valid box
  // for the specified meaning. For the contractions the starting words are shown.
  function articleSort(id,title,task,groups,hint) {
    const names = groups.map(([article]) => article);
    return {id,title,task,hint,boxes:names,boxLang:'it',many:true,
      tiles:groups.flatMap(([,nouns],box) => nouns.map(text => ({text,box}))),
      model:groups.flatMap(([article,nouns]) => nouns.map(noun => article + (article.endsWith('’') ? '' : ' ') + noun)).join(' · '),modelLang:'it'};
  }
  const articleRounds = [
    articleSort('definite','Choose the singular article for “the”','Put each noun under its singular article meaning “the”.',
      [['il',['telefono','libro']],['lo',['stivale']],['la',['macchina','porta']],['l’',['orologio','isola']]],
      'Look at gender first. A vowel and a start like st- can change the article.'),
    articleSort('indefinite','Choose the article for “a” or “an”','Put each noun under the article that makes it mean “a” or “an”.',
      [['un',['divano','aereo']],['uno',['specchio','stadio']],['una',['sedia','cravatta']],['un’',['aula','onda']]],
      'Aereo is masculine. Aula and onda are feminine. Only the feminine form loses a vowel and takes an apostrophe.'),
    articleSort('plural-the','Choose the plural article for “the”','Sort the plural nouns under i, gli or le.',
      [['i',['telefoni','fiori']],['gli',['orologi','stivali']],['le',['macchine','isole']]],
      'The plural of il is i. Lo becomes gli. For a noun starting with a vowel, check its gender.'),
    articleSort('some-plural','Choose the plural article for “some”','Use Laura’s group exercise. Put each plural noun under the article meaning “some”.',
      [['dei',['divani','ponti']],['degli',['aerei','specchi']],['delle',['cravatte','aule']]],
      'Use dei or degli for masculine plurals. Delle goes with feminine plurals, including those starting with a vowel.'),
    matchingRound('singular-to-plural','Match singular and plural phrases','Match each plural phrase to its singular form. Use the article and the noun.',
      [['il telefono','i telefoni'],['la nave','le navi'],['l’albergo','gli alberghi'],['lo stivale','gli stivali']],
      'Both phrases mean “the”. Look for the same noun, then check which article it takes in the plural.','it'),
    articleSort('some-food','Ask for some food','Put each food under the article that means an unspecified amount of it.',
      [['del',['pane']],['dello',['zucchero']],['della',['pasta']],['dell’',['olio']]],
      'Imagine ordering some bread, sugar, pasta or oil. Use the form that matches each noun.'),
    matchingRound('di','Form the partitive with di','Match di and each definite article to the combined Italian form.',
      [['di + la','della'],['di + i','dei'],['di + gli','degli'],['di + le','delle']],
      'These forms can express “some”. With another meaning, the same spelling can mean “of the”.','it'),
    matchingRound('in','Build “in the”','Match in and each article to their combined form.',
      [['in + il','nel'],['in + la','nella'],['in + gli','negli'],['in + le','nelle']],
      'Use the definite article of the noun. The forms start with ne-.','it'),
    matchingRound('su','Build “on the”','Match su and each article to their combined form.',
      [['su + il','sul'],['su + la','sulla'],['su + l’','sull’'],['su + i','sui']],
      'Keep the article for gender and number. The apostrophe stays in the form used before a singular vowel.','it'),
    matchingRound('da','Build “from the”','Match da and each definite article to the form meaning “from the”.',
      [['da + il','dal'],['da + lo','dallo'],['da + la','dalla'],['da + gli','dagli']],
      'The starting preposition is da. The article tells you whether to use the l, ll or gli form.','it'),
    matchingRound('from-a','Choose “from a” or “from the”','Match each English phrase to the Italian phrase that gives the same source.',
      [['from a shop','da un negozio'],['from the shop','dal negozio'],['from a school','da una scuola'],['from the school','dalla scuola']],
      'Keep da separate before un or una. Da combines with the definite article in “from the”.')
  ];

  // Lesson 4 counts from zero to twenty. The Numeri 20+ handout introduces
  // the twenties, tens, hundreds, thousands and an age example with 34.
  function numberRound(id,title,values,hint) {
    return matchingRound(id,title,'Match each Italian number to its digits.',values,hint,'it');
  }
  const numberRounds = [
    numberRound('zero-ten','Numbers from zero to ten',[['0','zero'],['3','tre'],['6','sei'],['8','otto'],['10','dieci']],
      'Say each number aloud once before placing it.'),
    numberRound('teens','Numbers from eleven to twenty',[['11','undici'],['14','quattordici'],['16','sedici'],['18','diciotto'],['20','venti']],
      'Italian forms most of the numbers up to sixteen differently from seventeen, eighteen and nineteen.'),
    numberRound('twenties','The twenties',[['21','ventuno'],['22','ventidue'],['23','ventitré'],['28','ventotto']],
      'Venti loses its final i before uno and otto. The final syllable in ventitré takes a written accent.'),
    numberRound('tens','Count in tens',[['30','trenta'],['40','quaranta'],['60','sessanta'],['70','settanta'],['90','novanta']],
      'Watch the difference between sessanta and settanta. Say the first syllable slowly.'),
    numberRound('hundreds','Count in hundreds',[['100','cento'],['200','duecento'],['500','cinquecento'],['900','novecento']],
      'Start from cento. For several hundreds, the number comes before cento.'),
    numberRound('thousands','Count in thousands',[['1000','mille'],['2000','duemila'],['5000','cinquemila'],['10000','diecimila']],
      'One thousand uses mille. Several thousand use -mila.'),
    matchingRound('ages','Read someone’s age','Match each sentence to the age it gives in years.',
      [['19','Ho diciannove anni.'],['20','Ho vent’anni.'],['25','Ho venticinque anni.'],['34','Ho trentaquattro anni.']],
      'Every sentence begins with “I have”. Read the number before anni.')
  ];
  const activities = {verbs:verbRounds,sounds:soundRounds,sentence:sentenceRounds,
    forms:formRounds,articles:articleRounds,numbers:numberRounds};
  const storeKey = 'italianVisualExercises.v1';
  let saved = {};
  try {const json = JSON.parse(sessionStorage.getItem(storeKey)); if (json && typeof json === 'object') saved = json;} catch {}
  let activity;
  let stateKey;
  let scoped;
  let round;
  let state;
  let selected = null;
  let dragging = null;
  let tiles = [];
  let targets = [];
  const save = () => {try {sessionStorage.setItem(storeKey,JSON.stringify(saved));} catch {}};
  const correctCount = () => round.tiles.filter((tile,i) => state.assignments[i] === tile.box).length;
  function blank(index) {
    return {index,assignments:activities[activity][index].tiles.map(() => -1),first:null,marked:false,finished:false,revealed:false};
  }
  function notify(message,style) {
    const feedback = get('feedback');
    feedback.textContent = message;
    feedback.dataset.state = style || '';
  }
  function model(prefix) {
    notify(prefix,'success');
    const answer = document.createElement('span');
    answer.lang = round.modelLang;
    answer.textContent = round.model;
    get('feedback').append(' ',answer);
  }
  function button(className) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    return el;
  }
  function update() {
    round.tiles.forEach((tile,i) => {
      const item = tiles[i], box = state.assignments[i];
      item.el.draggable = !state.finished;
      item.el.disabled = state.finished;
      item.el.setAttribute('aria-pressed',String(selected === i));
      item.el.dataset.placed = String(box >= 0);
      const result = state.marked && box >= 0 ? (tile.box === box ? 'right' : 'wrong') : '';
      item.el.dataset.result = result;
      item.status.textContent = box < 0 ? '' : (result === 'wrong' ? 'Check' : result === 'right' ? 'Correct' : 'Placed');
      item.el.setAttribute('aria-label',tile.text + (box < 0 ? ', unplaced' : ', placed in ' + round.boxes[box]) + (result ? ', ' + item.status.textContent : ''));
    });
    targets.forEach(({el,value},i) => {
      const words = round.tiles.filter((_,j) => state.assignments[j] === i).map(tile => tile.text);
      value.textContent = words.length ? words.join(' · ') : 'Empty';
      value.lang = words.length ? 'it' : 'en';
      el.dataset.empty = String(!words.length);
      el.disabled = state.finished;
    });
    get('score').hidden = state.first === null;
    get('score').textContent = state.first === null ? '' : 'First check · ' + state.first + ' of ' + round.tiles.length + ' correct.';
    get('check').hidden = state.finished;
    get('reveal').hidden = state.first === null || state.finished;
    get('next').hidden = !state.finished;
    get('next').textContent = state.index + 1 === activities[activity].length ? 'Play again' : 'Next round';
  }
  function select(i,keyboard) {
    if (state.finished) return;
    selected = selected === i ? null : i;
    update();
    notify(selected === null ? 'Selection cleared.' : 'Selected ' + round.tiles[i].text + '. Choose a box.');
    if (keyboard && selected !== null) targets[0].el.focus();
  }
  function place(box) {
    if (state.finished) return;
    if (selected === null) {notify('Choose a tile first.');return;}
    const index = selected;
    let displaced = -1;
    if (!round.many) {
      displaced = state.assignments.findIndex((slot,i) => i !== index && slot === box);
      if (displaced >= 0) state.assignments[displaced] = -1;
    }
    state.assignments[index] = box;
    selected = null;
    state.marked = false;
    update();save();
    const remaining = displaced < 0 ? '' : ' ' + round.tiles[displaced].text + ' is available again.';
    notify(round.tiles[index].text + ' placed in ' + round.boxes[box] + '.' + remaining);
  }
  function render() {
    const rounds = activities[activity];
    round = rounds[state.index];
    selected = null;
    dragging = null;
    get('activity').value = activity;
    get('count').textContent = 'Round ' + (state.index + 1) + ' of ' + rounds.length;
    get('title').textContent = round.title;
    get('instruction').textContent = round.task;
    get('hint').open = false;
    get('hint').querySelector('p').textContent = round.hint;
    get('tiles').replaceChildren(); get('boxes').replaceChildren();
    tiles = round.tiles.map((tile,i) => {
      const el = button('visual-tile');
      const word = document.createElement('span');
      word.lang = 'it';word.textContent = tile.text;
      const status = document.createElement('small');
      el.append(word,status);
      el.addEventListener('click',event => select(i,event.detail === 0));
      el.addEventListener('dragstart',event => {
        selected = i;dragging = i;update();
        event.dataTransfer.setData('text/plain',tile.text);
        event.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend',() => {dragging=null;targets.forEach(t => t.el.classList.remove('hover'));});
      return {el,status};
    });
    // Vary the initial tile order without changing the stable saved tile IDs.
    const displayed = tiles.map((_,i) => i).reverse();
    const shift = (state.index + 1) % displayed.length;
    get('tiles').append(...displayed.slice(shift).concat(displayed.slice(0,shift)).map(i => tiles[i].el));
    targets = round.boxes.map((name,i) => {
      const el = button('visual-target');
      const label = document.createElement('strong');
      label.lang = round.boxLang || 'en';label.textContent = name;
      const value = document.createElement('span');
      el.append(label,value);
      el.addEventListener('click',event => {
        const before = selected;
        place(i);
        if (before !== null && event.detail === 0) {
          const next = state.assignments.indexOf(-1);
          (next < 0 ? get('check') : tiles[next].el).focus();
        }
      });
      function acceptDrag(event) {
        if (dragging === null) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        el.classList.add('hover');
      }
      el.addEventListener('dragenter',acceptDrag);
      el.addEventListener('dragover',acceptDrag);
      el.addEventListener('dragleave',() => el.classList.remove('hover'));
      el.addEventListener('drop',event => {
        if (dragging === null) return;
        event.preventDefault();el.classList.remove('hover');selected=dragging;dragging=null;place(i);
      });
      get('boxes').append(el);
      return {el,value};
    });
    update();
    if (state.finished) model(state.revealed ? 'Solution.' : 'Correct.');
    else if (state.marked) notify(correctCount() + ' of ' + round.tiles.length + ' correct. Move a tile marked “Check” and try again.');
    else notify('');
  }
  function activate(id, roundId) {
    activity = Object.hasOwn(activities,id) ? id : 'verbs';
    const requested = activities[activity].findIndex(item => item.id === roundId);
    scoped = requested >= 0;
    // A worksheet link may open a specific round without disturbing the ongoing mixed activity.
    stateKey = scoped ? activity + ':' + roundId : activity;
    const previous = saved[stateKey];
    const existing = previous && activities[activity][previous.index];
    if (existing && (!scoped || previous.index === requested) && Array.isArray(previous.assignments) && previous.assignments.length === existing.tiles.length &&
        previous.assignments.every(i => Number.isInteger(i) && i >= -1 && i < existing.boxes.length)) state = previous;
    else state = saved[stateKey] = blank(scoped ? requested : 0);
    render();
  }
  get('activity').addEventListener('change',event => {
    const url = new URL(location.href);
    url.searchParams.set('activity',event.target.value);
    url.searchParams.delete('round');
    history.pushState(null,'',url);
    activate(event.target.value);
  });
  function openFromAddress() {
    const query = new URL(location.href).searchParams;
    activate(query.get('activity'), query.get('round'));
  }
  window.addEventListener('popstate',() => {
    if (new URL(location.href).searchParams.get('page') === 'visual-exercises') openFromAddress();
  }, {signal});
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && selected !== null) {
      const i = selected;selected = null;update();notify('Selection cleared.');tiles[i].el.focus();
    }
  }, {signal});
  get('check').addEventListener('click',() => {
    const left = state.assignments.filter(box => box < 0).length;
    if (left) {notify('Place ' + (left === 1 ? 'the last tile' : 'the remaining ' + left + ' tiles') + ' before checking.');return;}
    const right = correctCount(), total = round.tiles.length;
    if (state.first === null) state.first = right;
    state.marked = true;
    state.finished = right === total;
    selected = null;update();save();
    if (state.finished) {model('Correct.');get('next').focus();}
    else notify(right + ' of ' + total + ' correct. Move a tile marked “Check” and try again.');
  });
  get('reveal').addEventListener('click',() => {
    state.assignments = round.tiles.map(tile => tile.box);
    state.marked = false;state.finished = true;state.revealed = true;selected = null;
    update();save();model('Solution.');get('next').focus();
  });
  get('reset').addEventListener('click',() => {
    const first = state.first;
    state = saved[stateKey] = blank(state.index);
    state.first = first;
    render();save();notify('Tiles reset.');tiles[0].el.focus();
  });
  get('next').addEventListener('click',() => {
    const next = (state.index+1) % activities[activity].length;
    if (scoped) {
      const url = new URL(location.href);
      const nextId = activities[activity][next].id;
      url.searchParams.set('round',nextId);
      history.replaceState(null,'',url);
      const nextKey = activity + ':' + nextId;
      if (next === 0 && saved[nextKey]?.finished) delete saved[nextKey];
      activate(activity,nextId);
    } else {
      state = saved[stateKey] = blank(next);
      render();
    }
    save();get('title').focus();
  });
  openFromAddress();
}
