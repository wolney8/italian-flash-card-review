(function () {
  'use strict';

  const get = id => document.getElementById('visual-' + id);
  const subjects = ['io','tu','lui / lei','noi','voi','loro'];
  const verbs = window.ItalianDailyVerbs.verbs;
  const verbRounds = [
    ['parlare',[0,1,3], 'Start with who is speaking. Io means “I”, tu means “you” and noi means “we”.'],
    ['lavorare',[2,4,5], 'Lui or lei is one person. Voi addresses a group. Loro means “they”.'],
    ['leggere',[0,2,4], 'Leggere belongs to the -ere family. Look for the endings for I, he or she, and you all.'],
    ['dormire',[1,3,5], 'Dormire is an -ire verb. The three subjects mean you, we and they.'],
    ['studiare',[0,1,3], 'Study the stem in each box. Tu and noi share the stem’s final i with the ending.'],
    ['finire',[2,4,5], 'The spelling before the gap already includes isc where it is needed. Add just the ending.']
  ].map(([name,indices,hint]) => {
    const verb = verbs.find(v => v.name === name);
    const boxes = indices.map(i => subjects[i] + ' ' + verb.parts[i].stem + '…');
    return {
      title:'Match the endings of ' + name, task:'Complete each present-tense form of ' + name + ' (' + verb.meaning + ').',
      boxes,boxLang:'it',tiles:indices.map((i,box) => ({text:'-' + verb.parts[i].ending,box})),
      hint,model:indices.map(i => subjects[i] + ' ' + verb.forms[i]).join(' · '),modelLang:'it'
    };
  });

  const hardSoft = ['Hard sound','Soft sound'];
  const allSounds = ['K as in key','Ch as in chip','G as in go','J as in jam'];
  function soundRound(title,task,boxes,groups,hint,model) {
    return {title,task,boxes,many:true,hint,model,modelLang:'en',
      tiles:groups.flatMap((words,box) => words.map(text => ({text,box})))};
  }
  // Words used in the pronunciation practice and the Lesson 8 sound cards.
  const soundRounds = [
    soundRound('Hard or soft?', 'Sort each word by its first consonant sound.',hardSoft,
      [['ghiro','chiave'],['cena','giro']],
      'Say the word aloud. An h before e or i keeps c or g hard.',
      'Chiave starts like key and ghiro like go. Cena starts like chip and giro like jam.'),
    soundRound('Read the first C','Sort each word by the sound of its first c.',hardSoft,
      [['casa','cubo','chilo'],['cena','cibo']],
      'Before a, o or u, c sounds like k. Before e or i, look for h.',
      'Casa, cubo and chilo start like key. Cena and cibo start like chip.'),
    soundRound('Read the first G','Sort each word by the sound of its first g.',hardSoft,
      [['gatto','gufo','ghepardo'],['gelato','giro']],
      'Compare ga with ge. A silent h keeps g hard before e.',
      'Gatto, gufo and ghepardo start like go. Gelato and giro start like jam.'),
    soundRound('Match four starting sounds','Match the first consonant of each Italian word to an English sound.',allSounds,
      [['corso'],['cibo'],['ghiro'],['gelato']],
      'Say the Italian word, then the English example. Listen only to the starting consonant.',
      'Corso starts like key, cibo like chip, ghiro like go and gelato like jam.'),
    soundRound('Hear the sound inside the word','Sort by the sound of the c or g inside each Italian word.',allSounds,
      [['amiche','barche'],['amici'],['funghi'],['pagine']],
      'Look at the letters next to c or g. Each word here has just one c or g.',
      'Amiche and barche have the k sound. Amici has ch, funghi has hard g and pagine has j.')
  ];

  function sentenceRound(english,parts,boxes,hint,punctuation = '.') {
    return {title:'Build the Italian sentence',task:'Build “' + english + '” in Italian. Follow the order shown in the boxes.',
      boxes,tiles:parts.map((text,box) => ({text,box})),hint,model:parts.join(' ') + punctuation,modelLang:'it'};
  }
  // Session 6 classroom expressions, Session 7 model sentences and the Session 8 workplace reminder.
  const sentenceRounds = [
    sentenceRound('We work in a school',['Noi','lavoriamo','in una scuola'],
      ['1. Subject','2. Verb','3. Place'],'Start with the people who work. Put the workplace last.'),
    sentenceRound('Lorenzo speaks two languages',['Lorenzo','parla','due lingue'],
      ['1. Subject','2. Verb','3. What he speaks'],'Name the speaker first. The last tile answers “speaks what?”'),
    sentenceRound('I study history',['Io','studio','storia'],
      ['1. Subject','2. Verb','3. What I study'],'Use the subject tile even though spoken Italian can leave io out.'),
    sentenceRound('Maria eats a lot of chocolate',['Maria','mangia','tanta cioccolata'],
      ['1. Subject','2. Verb','3. What she eats'],'Start with the person. The food is the direct object.'),
    sentenceRound('Marco works as a chef',['Marco','lavora','come cuoco'],
      ['1. Subject','2. Verb','3. Job role'],'Come introduces Marco’s role. Put it after the verb.'),
    sentenceRound('I am a teacher and I work in a school',['Faccio','l’insegnante','e','lavoro','in una scuola'],
      ['1. First verb','2. Job title','3. And','4. Second verb','5. Workplace'],
      'Give the job with fare first. Join it to the workplace with e.'),
    sentenceRound('How do you spell “letto” in Italian?',['Come','si scrive','“letto”','in italiano'],
      ['1. How','2. Spelling phrase','3. Word','4. Language'],
      'Use the spelling question from the handout. Put the word before the language.','?'),
    sentenceRound('I didn’t understand',['Non','ho','capito'],
      ['1. Negative','2. Helping verb','3. Main verb'],'Start with non and keep ho capito together.')
  ];
  const activities = {verbs:verbRounds,sounds:soundRounds,sentence:sentenceRounds};
  const storeKey = 'italianVisualExercises.v1';
  let saved = {};
  try {const json = JSON.parse(sessionStorage.getItem(storeKey)); if (json && typeof json === 'object') saved = json;} catch {}
  let activity;
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
  function activate(id) {
    activity = Object.hasOwn(activities,id) ? id : 'verbs';
    const previous = saved[activity];
    const existing = previous && activities[activity][previous.index];
    if (existing && Array.isArray(previous.assignments) && previous.assignments.length === existing.tiles.length &&
        previous.assignments.every(i => Number.isInteger(i) && i >= -1 && i < existing.boxes.length)) state = previous;
    else state = saved[activity] = blank(0);
    render();
  }
  get('activity').addEventListener('change',event => {
    const url = new URL(location.href);
    url.searchParams.set('activity',event.target.value);
    history.pushState(null,'',url);
    activate(event.target.value);
  });
  window.addEventListener('popstate',() => activate(new URL(location.href).searchParams.get('activity')));
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && selected !== null) {
      const i = selected;selected = null;update();notify('Selection cleared.');tiles[i].el.focus();
    }
  });
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
    state = saved[activity] = blank(state.index);
    state.first = first;
    render();save();notify('Tiles reset.');tiles[0].el.focus();
  });
  get('next').addEventListener('click',() => {
    state = saved[activity] = blank((state.index+1) % activities[activity].length);
    render();save();get('title').focus();
  });
  activate(new URL(location.href).searchParams.get('activity'));
})();
