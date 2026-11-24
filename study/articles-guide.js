import './articles-guide-data.js';

export function mountPractice(main, signal) {
  const data = window.ItalianArticleGuide;
  const byId = id => main.querySelector('#' + id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const normal = value => String(value).normalize('NFC').toLocaleLowerCase('it').replace(/[‘’]/g, "'").trim().replace(/[.!?]+$/g, '').trim().replace(/\s+/g, ' ').replace(/\s*'\s*/g, "'");
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  const key = 'italianArticleGuideV1';
  const groups = ['mixed','definite','indefinite','partitive','rules'];
  const rows = new Map(data.exercises.map(q => [q.id,q]));
  let state = {day:today, group:'mixed', sessions:{}};
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && groups.includes(saved.group)) state.group = saved.group;
    if (saved?.day === today && saved.sessions && typeof saved.sessions === 'object') state.sessions = saved.sessions;
  } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  let session;
  function start(round = 0, ids) {
    session = {
      round, review: Boolean(ids), index:0, results:[], drafts:{},
      ids:ids || data.daily(today, state.group === 'mixed' ? 'all' : state.group, round).map(q => q.id)
    };
    state.sessions[state.group] = session;
    save();
  }
  function loadSession() {
    session = state.sessions[state.group];
    const valid = session && Array.isArray(session.ids) && session.ids.length > 0 && session.ids.length <= 10
      && new Set(session.ids).size === session.ids.length && session.ids.every(id => rows.has(id))
      && Number.isInteger(session.index) && session.index >= 0 && session.index <= session.ids.length
      && Array.isArray(session.results) && session.results.length <= session.ids.length;
    if (!valid) start();
    if (!session.drafts || typeof session.drafts !== 'object') session.drafts = {};
    byId('ag-group').value = state.group;
    render();
    save();
  }
  function showTab(name, focus = false) {
    for (const id of ['reference','practice']) {
      const selected = id === name;
      byId('ag-'+id).hidden = !selected;
      byId('ag-'+id+'-tab').setAttribute('aria-selected', String(selected));
    }
    if (focus) byId('ag-'+name+'-tab').focus();
  }
  function render(focus = false) {
    const box = byId('ag-question');
    const q = rows.get(session.ids[session.index]);
    if (!q) {
      const correct = session.results.filter(r => r?.correct).length;
      const missed = session.ids.filter((id,i) => !session.results[i]?.correct);
      box.innerHTML = '<section class="panel finished"><h2>'+(session.review?'Review complete':'Daily round complete')+'</h2>'
        +'<p><b>'+correct+' of '+session.ids.length+'</b> correct on the first attempt.</p>'
        +(missed.length ? '<p>Practise the missed answers again to reinforce their rules.</p>' : '<p>You have finished this round. Come back tomorrow for a new selection, or practise another round now.</p>')
        +'<div class="controls">'+(missed.length ? '<button type="button" class="primary" data-ag-action="retry">Practise missed answers</button>' : '')
        +'<button type="button" class="'+(missed.length?'secondary':'primary')+'" data-ag-action="more">Another round</button>'
        +'<button type="button" class="secondary" data-ag-action="reference">Reference tables</button></div></section>';
      if (focus) box.querySelector('button')?.focus();
      return;
    }
    const result = session.results[session.index];
    const draft = result?.value || session.drafts[session.index] || '';
    const stimuli = (q.stimulus || []).map(s => '<p>'+(s.label?'<small>'+esc(s.label)+'</small>':'')+'<span lang="'+(s.lang==='it'?'it':'en-GB')+'">'+esc(s.text)+'</span></p>').join('');
    const answerLang = q.answerLang === 'en' ? 'en-GB' : 'it';
    const input = q.choices?.length
      ? '<fieldset class="choice-list ag-choice-list"><legend class="ag-sr">Choose one answer</legend>'+q.choices.map(c => '<label><input type="radio" required name="answer" value="'+esc(c)+'"'+(draft===c?' checked':'')+(result?' disabled':'')+'><span lang="'+answerLang+'">'+esc(c)+'</span></label>').join('')+'</fieldset>'
      : '<label class="entry">Your answer<input type="text" name="answer" lang="'+answerLang+'" required autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(draft)+'"'+(result?' disabled':'')+'></label>';
    box.innerHTML = '<article class="panel"><div class="ag-question-meta"><progress aria-label="Questions completed" value="'+session.index+'" max="'+session.ids.length+'"></progress><span>'+(session.review?'Review':'Question')+' '+(session.index+1)+' of '+session.ids.length+'</span></div>'
      +'<h2 class="question-title">'+esc(q.task)+'</h2><div class="ag-stimulus">'+stimuli+'</div>'
      +'<form>'+input+(!result?'<details><summary>Hint</summary><p>'+esc(q.hint)+'</p></details><div class="controls"><button type="button" class="primary" data-ag-action="check">Check answer</button></div>':'')+'</form>'
      +(result?'<div role="status" class="feedback ag-feedback '+(result.correct?'':'review')+'"><b>'+(result.correct?'Correct.':'The answer is:')+'</b><span class="ag-answer" lang="'+answerLang+'">'+esc(q.answer)+'</span><p>'+esc(q.explanation)+'</p></div><div class="controls"><button type="button" class="primary" data-ag-action="next">'+(session.index+1===session.ids.length?'Finish round':'Next question')+'</button></div>':'')+'</article>';
    if (focus) (result ? box.querySelector('[data-ag-action="next"]') : box.querySelector('input'))?.focus();
  }
  function checkAnswer() {
    if (session.results[session.index]) return;
    const form = byId('ag-question').querySelector('form');
    if (!form || !form.reportValidity()) return;
    const value = String(new FormData(form).get('answer') || '').trim();
    if (!value) return;
    const q = rows.get(session.ids[session.index]);
    const correct = [q.answer,...(q.alternatives || [])].some(a => normal(a) === normal(value));
    session.results[session.index] = {value,correct};
    save();
    render(true);
  }
  byId('ag-question').addEventListener('submit', e => { e.preventDefault(); checkAnswer(); }, {signal});
  byId('ag-question').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('input[type="text"]')) { e.preventDefault(); checkAnswer(); }
  }, {signal});
  byId('ag-question').addEventListener('input', e => {
    if (e.target.name !== 'answer' || session.results[session.index]) return;
    session.drafts[session.index] = e.target.value;
    save();
  }, {signal});
  byId('ag-question').addEventListener('click', e => {
    const action = e.target.closest('[data-ag-action]')?.dataset.agAction;
    if (action === 'check') { checkAnswer(); return; }
    if (action === 'reference') { showTab('reference',true); return; }
    if (action === 'next' && session.results[session.index]) { session.index++; save(); render(true); }
    if (action === 'more') { start((session.round || 0)+1); render(true); }
    if (action === 'retry') {
      const missed = session.ids.filter((id,i) => !session.results[i]?.correct);
      if (missed.length) { start(session.round || 0, missed); render(true); }
    }
  }, {signal});
  byId('ag-group').addEventListener('change', e => { state.group=e.target.value; loadSession(); }, {signal});
  main.querySelector('.ag-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) showTab(tab.id === 'ag-practice-tab'?'practice':'reference');
  }, {signal});
  main.querySelector('.ag-tabs').addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const current = byId('ag-reference-tab').getAttribute('aria-selected') === 'true' ? 'reference' : 'practice';
    showTab(e.key === 'Home'?'reference':e.key === 'End'?'practice':current === 'reference'?'practice':'reference',true);
  }, {signal});
  main.querySelector('.ag-start').addEventListener('click', () => showTab('practice',true), {signal});
  loadSession();
}
