import './daily-verbs.js';
import './verb-reference-view.js';
import './verb-reference-v1.js';
import './daily-patterns.js';
import './daily-phrases.js';

export function mountPractice(main, signal) {
  const byId = id => main.querySelector('#'+id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const normal = value => String(value).toLocaleLowerCase('it').normalize('NFC').replace(/[‘’]/g, "'").replace(/[.!?]+$/g, '').trim().replace(/\s+/g, ' ');
  const day = new Date();
  const dayNumber = Math.floor(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86400000);
  const key = 'italianDailyPractice.v1';
  const size = 8;
  const topics = [
    {id:'verbs',title:'Verb forms',description:'Practise all six present forms, from io to loro. Choose a family, a verb or a type of question.'},
    ...window.ItalianDailyPatterns.topics,
    {id:'questions',title:'Questions and classroom phrases',description:'Ask who, what, where, when, why and how. Practise asking Laura for help.'},
    {id:'objects',title:'Direct objects',description:'Find who or what the verb acts on. Learn to spot phrases that tell you where or to whom.'}
  ];
  const verbs = window.ItalianDailyVerbs.verbs;
  const familyKeys = ['are','ere','ire','auxiliary'];
  const regularity = verb => verb.tenses?.presente?.regularity || verb.kind;
  let state = {day:dayNumber, topic:'verbs', family:'all', group:'all', verb:'all', focus:{}, sessions:{}};
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && topics.some(t => t.id === saved.topic)) {
      state.topic = saved.topic;
      state.group = ['regular','irregular'].includes(saved.group) ? saved.group : 'all';
      state.family = familyKeys.includes(saved.family) ? saved.family : 'all';
      state.verb = saved.verb || 'all';
      if (saved.focus && typeof saved.focus === 'object') state.focus = saved.focus;
      if (saved.day === dayNumber && saved.sessions && typeof saved.sessions === 'object') state.sessions = saved.sessions;
    }
  } catch {}
  const save = () => {try { localStorage.setItem(key, JSON.stringify(state)); } catch {}};
  let rows = new Map();
  let pool = [];
  let session;
  let refVerb = '';
  function idForSession() {
    const base = state.topic === 'verbs' ? ['verbs',state.group,state.verb].join(':') : state.topic;
    const focus = state.focus[state.topic] || 'all';
    const existing = focus === 'all' ? base : base + ':' + focus;
    return state.topic === 'verbs' && state.family !== 'all' ? existing + ':family:' + state.family : existing;
  }
  function italianVoice() {
    if (!('speechSynthesis' in window)) return undefined;
    return speechSynthesis.getVoices().find(v => /^it(?:[-_]|$)/i.test(v.lang));
  }

  function orderFor(list, salt) {
    function rank(value) {
      let hash = 2166136261;
      for (const letter of salt + '/' + value) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
      hash ^= hash >>> 16;
      hash = Math.imul(hash, 0x45d9f3b);
      return (hash ^ (hash >>> 16)) >>> 0;
    }
    return [...list].sort((a,b) => rank(a.id)-rank(b.id) || a.id.localeCompare(b.id));
  }

  function start(round = 0, ids) {
    const count = Math.min(size, pool.length);
    const first = (dayNumber + round) * size;
    const current = ids || Array.from({length:count}, (_,i) => pool[(first+i) % pool.length].id);
    session = {round, ids:current, results:[], index:0};
    state.sessions[idForSession()] = session;
    save();
  }

  function loadTopic() {
    const topic = topics.find(t => t.id === state.topic);
    byId('topic-title').textContent = topic.title;
    byId('topic-intro').textContent = topic.description;
    byId('topic-buttons').innerHTML = topics.map(t => '<button type="button" data-topic="'+t.id+'" aria-pressed="'+(t.id===state.topic)+'">'+esc(t.title)+'</button>').join('');
    byId('filters').hidden = !['verbs','articles'].includes(state.topic);
    for (const field of ['family','group','verb']) byId(field).parentElement.hidden = state.topic !== 'verbs';
    byId('verb-scope').hidden = state.topic !== 'verbs';
    byId('family').value = state.family;
    const familyVerbs = verbs.filter(v => state.family === 'all' || v.courseGroup === state.family);
    for (const option of byId('group').options) option.disabled = option.value !== 'all' && !familyVerbs.some(v => regularity(v) === option.value);
    if (state.group !== 'all' && !familyVerbs.some(v => regularity(v) === state.group)) state.group = 'all';
    byId('group').value = state.group;
    const options = familyVerbs.filter(v => state.group === 'all' || regularity(v) === state.group).sort((a,b) => a.name.localeCompare(b.name,'it'));
    if (!options.some(v => v.name === state.verb)) state.verb = 'all';
    byId('verb').innerHTML = '<option value="all">Mix all '+options.length+' verbs</option>' + options.map(v => '<option value="'+esc(v.name)+'">'+esc(v.name)+' ('+esc(v.meaning)+')</option>').join('');
    byId('verb').value = state.verb;
    const regularSelection = options.some(v => regularity(v) === 'regular' && (state.verb === 'all' || state.verb === v.name));
    const allRows = state.topic === 'verbs' ? options.filter(v => state.verb === 'all' || v.name === state.verb).flatMap(v => window.ItalianDailyVerbs.exercises(v.name).map(q => ({...q,verbName:v.name})))
      : ['questions','objects'].includes(state.topic) ? window.ItalianDailyPhrases.exercises(state.topic) : window.ItalianDailyPatterns.exercises(state.topic);
    const focusOptions = state.topic === 'articles' ? [['all','All articles'],['definite','Definite (the)'],['indefinite','Indefinite (a or an)'],['partitive','Partitive (some)']]
      : [['all','All tasks'],['match','Match forms and subjects'],['whole','Write whole forms'],...(regularSelection ? [['ending','Write endings']] : []),...(state.topic === 'verbs' && allRows.some(q => q.skill === 'phrase') ? [['phrase','Use verbs in phrases']] : [])];
    if (!focusOptions.some(([id]) => id === state.focus[state.topic])) state.focus[state.topic]='all';
    byId('focus').innerHTML=focusOptions.map(([id,label]) => '<option value="'+id+'">'+esc(label)+'</option>').join('');
    byId('focus').value=state.focus[state.topic];
    const skill = state.focus[state.topic];
    const data = skill === 'all' ? allRows : allRows.filter(q => q.skill === skill);
    rows = new Map(data.map(q => [q.id,q]));
    pool = orderFor(data,idForSession());
    session = state.sessions[idForSession()];
    if (!session || !Array.isArray(session.ids) || !session.ids.length || !session.ids.every(id => rows.has(id)) || !Array.isArray(session.results)) start();
    byId('reference').open = false;
    save();
    render();
  }

  function table(head, records) {
    return '<div class="table-wrap"><table><thead><tr>'+head.map(v => '<th scope="col">'+esc(v)+'</th>').join('')+'</tr></thead><tbody>'+records.map(row => '<tr>'+row.map((v,i) => i ? '<td>'+esc(v)+'</td>' : '<th scope="row">'+esc(v)+'</th>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }

  function reference(q) {
    const sections = {
      articles: () => table(['The (one)','The (several)','A or an','Some (several)'],[
        ['il libro','i libri','un libro','dei libri'],['lo studente','gli studenti','uno studente','degli studenti'],['l’amico','gli amici','un amico','degli amici'],['la casa','le case','una casa','delle case'],['l’amica','le amiche','un’amica','delle amiche']
      ]) + '<p>The plural definite articles are <b>i, gli, le</b>. For “some”, join <b>di</b> to the definite article. With an amount, use a singular form such as <i lang="it">del pane</i> or <i lang="it">dell’acqua</i>.</p>',
      sounds: () => table(['Spelling','First sound','Try saying'],[['ce, ci','ch in chip','cena, cinema'],['che, chi','k in key','che, chi'],['ge, gi','j in jam','gelato, giro'],['ghe, ghi','g in go','ghepardo, ghisa']]) + '<p>Before <b>e</b> or <b>i</b>, an <b>h</b> keeps c and g hard. Before <b>a, o, u</b>, c and g are normally hard already.</p>',
      prepositions: () => table(['Base','il','lo','la','l’','i','gli','le'],[['in','nel','nello','nella','nell’','nei','negli','nelle'],['su','sul','sullo','sulla','sull’','sui','sugli','sulle'],['da','dal','dallo','dalla','dall’','dai','dagli','dalle']]) + '<p>These joined forms are called <i lang="it">preposizioni articolate</i>. For “from a”, keep <i lang="it">da</i> separate, as in <i lang="it">da una scuola</i>.</p>',
      questions: () => table(['English','Italian'],[['Who?','Chi?'],['What?','Che cosa? / Cosa?'],['Where?','Dove?'],['When?','Quando?'],['Why?','Perché?'],['How?','Come?']]) + '<p><i lang="it">Come si dice … in italiano?</i> means “How do you say … in Italian?” <i lang="it">Che cosa significa …?</i> means “What does … mean?”</p>',
      objects: () => '<p><b>Anna mangia una mela.</b> Anna eats what? An apple. <i lang="it">Una mela</i> is the direct object. This use of <i lang="it">mangiare</i> is transitive.</p><p><b>Anna dorme in cucina.</b> Anna is sleeping. Where? In the kitchen. <i lang="it">In cucina</i> gives a place. <i lang="it">Dormire</i> is intransitive.</p><p><b>Anna mangia.</b> You can leave the food unspoken. <i lang="it">Mangiare</i> can still take an object.</p>'
    };
    const verb = verbs.find(v => v.name === (q && q.verbName || refVerb || state.verb)) || verbs[0];
    refVerb = verb.name;
    byId('ref-title').textContent = state.topic === 'verbs' ? 'See all six forms and uses of '+verb.name : 'Quick reference';
    if (state.topic !== 'verbs') {byId('ref-body').innerHTML = sections[state.topic](); return;}
    byId('ref-body').innerHTML = window.ItalianVerbReferenceView.render(window.ItalianVerbReference.find(verb.name));
  }

  function render(focus = false) {
    const box = byId('exercise');
    const q = rows.get(session.ids[session.index]);
    reference(q);
    if (!q) {
      const correct = session.results.filter(r => r.correct).length;
      const missed = session.ids.filter((id,i) => !session.results[i]?.correct);
      box.innerHTML = '<div class="panel finished"><h3 tabindex="-1" class="question-title">Round complete</h3><p>'+correct+' of '+session.ids.length+' correct on the first attempt.</p><div class="controls">'+(missed.length ? '<button class="primary" data-action="retry">Practise these '+missed.length+' again</button>' : '')+'<button class="'+(missed.length?'secondary':'primary')+'" data-action="more">Another round</button></div></div>';
      if (focus) box.querySelector('h3').focus();
      return;
    }
    const result = session.results[session.index];
    const sourceNote = result && q.source ? '<p class="question-source">' + esc(window.ItalianVerbReferenceView.sourceLabel(q.source)) + '</p>' : '';
    const stim = q.stimulus.map(s => '<p>'+(s.label ? '<strong>'+esc(s.label)+'</strong> ' : '')+'<span lang="'+(s.lang==='it'?'it':'en')+'">'+esc(s.text)+'</span></p>').join('');
    const audioWord = state.topic === 'sounds' && (result || q.id.startsWith('sounds-read-')) ? q.word : '';
    const answerLang = q.answerLang === 'en' ? 'en' : 'it';
    const choices = q.choices && q.choices.length;
    const inputs = choices ? '<fieldset class="choice-list"><legend class="sr">Choose one answer</legend>'+q.choices.map(c => '<label data-ui-no-translate lang="'+answerLang+'"><input type="radio" required name="answer" value="'+esc(c)+'"'+(result?.value===c?' checked':'')+'>'+esc(c)+'</label>').join('')+'</fieldset>'
      : '<label class="entry">Your answer<input type="text" name="answer" lang="'+answerLang+'" required autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(result?.value||'')+'"></label>';
    box.innerHTML = '<article class="panel"><div class="meter"><progress value="'+session.index+'" max="'+session.ids.length+'"></progress>Question '+(session.index+1)+' of '+session.ids.length+'</div><h3 class="question-title" tabindex="-1" lang="en-GB" data-ui-no-translate>'+esc(q.task)+'</h3><div class="stimulus" lang="en-GB" data-ui-no-translate>'+stim+'</div>'+(audioWord ? '<button type="button" class="listen" data-action="listen" data-word="'+esc(audioWord)+'"'+(italianVoice()?'':' hidden')+'>Hear the Italian</button>' : '')+
      '<form>'+inputs+(result ? '' : '<details><summary>Hint</summary><p lang="en-GB" data-ui-no-translate>'+esc(q.hint)+'</p></details><div class="controls"><button class="primary" type="submit">Check answer</button><button type="button" class="secondary" data-action="reveal">Show answer</button></div>')+'</form>'+
      (result ? '<div role="status" lang="en-GB" data-ui-no-translate class="feedback '+(result.correct?'':'review')+'"><p><b>'+(result.correct?'Correct.':result.revealed?'Answer':'The answer is')+'</b> <span lang="'+answerLang+'">'+esc(q.answer)+'</span></p><p>'+esc(q.explanation)+'</p>'+sourceNote+'</div><div class="controls"><button class="primary" data-action="next">'+(session.index+1===session.ids.length?'Finish round':'Next question')+'</button></div>' : '')+'</article>';
    if (result) box.querySelectorAll('input').forEach(el => {el.disabled=true;});
    if (focus) (result ? box.querySelector('[data-action="next"]') : box.querySelector('h3')).focus();
  }

  function grade(value, revealed) {
    if (session.results[session.index]) return;
    const q = rows.get(session.ids[session.index]);
    const accepted = [q.answer,...(q.answers||[])];
    if (q.skill === 'ending') accepted.push('-'+q.answer);
    if (q.skill === 'whole') {
      const subject = q.stimulus.find(s => s.label === 'Subject' && s.lang === 'it');
      if (subject) accepted.push(subject.text+' '+q.answer);
    }
    const correct = !revealed && accepted.some(answer => normal(answer)===normal(value));
    session.results[session.index] = {correct, value, revealed};
    save();
    render(true);
  }

  byId('topic-buttons').addEventListener('click', e => {
    const button=e.target.closest('[data-topic]');
    if (!button || button.dataset.topic===state.topic) return;
    state.topic=button.dataset.topic;
    loadTopic();
    byId('topic-buttons').querySelector('[aria-pressed="true"]').focus();
  });
  byId('group').addEventListener('change', e => {state.group=e.target.value; state.verb='all'; loadTopic();});
  byId('family').addEventListener('change', e => {state.family=e.target.value; state.verb='all'; loadTopic();});
  byId('verb').addEventListener('change', e => {state.verb=e.target.value; loadTopic();});
  byId('focus').addEventListener('change', e => {state.focus[state.topic]=e.target.value; loadTopic();});
  if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', () => {
    const button = main.querySelector('[data-action="listen"]');
    if (button) button.hidden=!italianVoice();
  },{signal});
  byId('exercise').addEventListener('submit', e => {
    e.preventDefault();
    const value = String(new FormData(e.target).get('answer') || '').trim();
    if (value) grade(value,false);
  });
  byId('exercise').addEventListener('click', e => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    switch (button.dataset.action) {
      case 'listen': {
        const speech = new SpeechSynthesisUtterance(button.dataset.word);
        speech.lang='it-IT'; speech.rate=.85;
        const voice = italianVoice();
        if (!voice) break;
        speech.voice=voice;
        speechSynthesis.cancel(); speechSynthesis.speak(speech);
        break;
      }
      case 'reveal': grade('',true); break;
      case 'next': session.index++; save(); byId('reference').open=false; render(true); break;
      case 'more': start(session.round+1); byId('reference').open=false; render(true); break;
      case 'retry': start(session.round, session.ids.filter((_,i) => !session.results[i]?.correct)); byId('reference').open=false; render(true); break;
    }
  });
  loadTopic();
}
