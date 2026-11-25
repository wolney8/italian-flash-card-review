import './daily-focus-content.js?v=20261125focus1';
import './verb-reference-view.js?v=20261125cards';
import './daily-focus-language.js?v=20261125focus1';

export async function mountPractice(main, signal) {
  const engine = window.ItalianDailyFocus;
  const content = window.ItalianDailyFocusContent;
  const language = window.ItalianVerbReferenceView;
  const view = main.querySelector('#focusView');
  const notice = main.querySelector('#focusNotice');
  const warning = main.querySelector('#focusStorage');
  const displayText = value => String(value ?? '').replace(/\u2014/g, ':');
  const esc = value => displayText(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const explain = value => window.ItalianDailyFocusLanguage.formatExplanation(displayText(value));
  const it = value => language.formatItalian(displayText(value));
  const meaning = value => language.formatMeaning(displayText(value));
  const cap = value => String(value || '').replace(/^./, c => c.toUpperCase());
  const button = (action, label, className = '', extra = '') => '<button type="button" data-focus-action="'+action+'" class="'+className+'" '+extra+'>'+label+'</button>';
  const labelFor = {question:'Short exercise', flashcard:'Flashcard', reading:'Read and remember', spoken:'Spoken or quiet recall'};
  const durations = [2,5,10,30,60];
  const today = () => engine.dayKey(Date.now());
  const dateLabel = value => new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London',day:'numeric',month:'short'}).format(new Date(value));
  const timeLabel = ms => ms < 60000 ? Math.floor(ms/1000)+' sec' : Math.floor(ms/60000)+' min '+Math.floor(ms%60000/1000)+' sec';
  let pool = [];
  let mode = 'home';
  let sessionId = null;
  let reviewIndex = 0;
  let showShorten = false;
  let showIssue = false;
  let speech = false;
  let pendingImport = null;
  let lastInteraction = Date.now();
  let lastTick = Date.now();
  let ready = false;
  let renderedSessionKey = '';
  let renderedDay = today();
  const getSession = () => engine.getSession(sessionId);
  const sessionKey = session => {
    const step = session?.steps[session.index];
    return JSON.stringify([session?.id,session?.index,session?.status,step?.id,step?.item.id,step?.status,step?.revealed,step?.result]);
  };
  function ensureVisibleStep() {
    if (mode !== 'drill' || sessionKey(getSession()) === renderedSessionKey) return true;
    render(true);
    announce('This drill changed in another tab. Your latest saved question is now shown. Please answer this step.');
    return false;
  }
  const isActive = () => mode === 'drill' && getSession()?.status === 'in-progress' && !atCheckpoint(getSession());
  function announce(message) {
    const anchor = view.querySelector('.df-task');
    const previousTop = anchor?.getBoundingClientRect().top;
    notice.textContent = message;
    notice.hidden = !message;
    restorePosition(anchor,previousTop);
  }
  function restorePosition(anchor, previousTop) {
    if (!anchor || previousTop === undefined || mode !== 'drill') return;
    const delta = anchor.getBoundingClientRect().top - previousTop;
    if (Math.abs(delta)>1) window.scrollBy({top:delta,behavior:'instant'});
  }
  function storageStatus() {
    const state = engine.persistence();
    warning.hidden = state.ok;
    warning.textContent = state.ok ? '' : state.message;
  }
  function atCheckpoint(session) {
    return !!session && session.duration >= 30 && session.index > 0 && session.index < session.steps.length && session.index % session.roundSize === 0 && !(session.checkpoints || []).includes(session.index);
  }
  function activeTick() {
    const now = Date.now();
    const elapsed = Math.min(5000, Math.max(0, now-lastTick));
    lastTick = now;
    if (isActive() && !document.hidden && document.hasFocus() && now-lastInteraction < 45000) {
      try { engine.tickActive(elapsed, sessionId); } catch {}
    }
    storageStatus();
  }
  function stimulus(item) {
    return (item.stimulus || []).length ? '<div class="df-stimulus">'+item.stimulus.map(line => {
      const html = line.lang === 'it' ? it(line.text) : !line.label || /meaning|english|translation/i.test(line.label) ? meaning(line.text) : esc(line.text);
      return '<p>'+(line.label ? '<strong>'+esc(line.label)+'</strong>' : '')+html+'</p>';
    }).join('')+'</div>' : '';
  }
  function modelAnswer(item) { return item.answerLang === 'en' || item.answerLang === 'en-GB' ? meaning(item.answer) : it(item.answer); }
  function readingBody(item) {
    if (item.readingLines?.length) return '<p>'+item.readingLines.map(line => line.lang === 'it' ? it(line.text) : explain(line.text)).join(' ')+'</p>';
    return '<p>'+explain(item.reading || item.explanation || item.hint)+'</p>';
  }
  function explanation(item) {
    if (item.supportLines?.length) return item.supportLines.map(line=>'<p>'+(line.it?it(line.it):'')+(line.it&&line.en?' = ':'')+(line.en?meaning(line.en):'')+'</p>').join('');
    if (item.type==='flashcard' || item.type==='spoken') return (item.meaning?'<p>'+meaning(item.meaning)+'</p>':'')+(item.usage?'<p>'+explain(item.usage)+'</p>':'');
    const parts=String(item.explanation || '').split(' = ');
    if (parts.length===2) return '<p>'+it(parts[0])+' = '+meaning(parts[1])+'</p>';
    return item.explanation?'<p>'+explain(item.explanation)+'</p>':item.hint?'<p>'+explain(item.hint)+'</p>':'';
  }
  function flagButton(kind, id, title, label) {
    return button('flag',esc(label || 'Needs practice'),'df-flag','data-kind="'+kind+'" data-id="'+esc(id)+'" data-label="'+esc(title)+'" aria-pressed="'+engine.isFlagged(kind,id)+'"');
  }
  function weekView() {
    const rows = engine.weekly();
    return '<div class="df-week" aria-label="Activity over the last seven days">'+rows.map(day => {
      const stamp = new Date(day.day+'T12:00:00Z');
      const name = new Intl.DateTimeFormat('en-GB',{weekday:'short',timeZone:'Europe/London'}).format(stamp);
      const complete = day.state === 'completed';
      const self = day.selfReported?.length > 0;
      const mark = complete ? '✓' : self ? '•' : day.state === 'in progress' || day.state === 'saved for later' ? '○' : '·';
      return '<div class="df-day" data-complete="'+complete+'"'+(day.day===today()?' aria-current="date"':'')+' aria-label="'+esc(dateLabel(stamp)+': '+(complete?'completed web drill':self?'self-reported activity':day.state))+'"><span>'+name+'</span><b aria-hidden="true">'+mark+'</b><span>'+stamp.getUTCDate()+'</span></div>';
    }).join('')+'</div><p class="df-muted">✓ Completed web drill · ○ Practice started · • Self-reported study</p>';
  }
  function sessionRows() {
    const state = engine.getState();
    const rows = Object.values(state.sessions).sort((a,b)=>b.updatedAt-a.updatedAt);
    if (!rows.length) return '<p class="df-muted">Your drills will appear here. You can repeat a drill with new questions or review the answers afterwards.</p>';
    return '<ul class="df-sessions">'+rows.slice(0,20).map(session => {
      const stats = engine.summary(session.id);
      const completed = session.status === 'completed';
      const saved = session.status === 'saved';
      return '<li class="df-session"><div><strong>'+(completed?'✓ ':'')+session.duration+'-minute drill'+(session.shortenedFrom?' · shortened from '+session.originalDuration+' minutes':'')+'</strong><p class="df-muted">'+dateLabel(session.updatedAt)+' · '+stats.completed+'/'+stats.assigned+' steps · '+(completed?'Completed':saved?'Saved for later':'In progress')+'</p></div><div class="df-actions">'+(completed ? button('review','Review answers','','data-session="'+esc(session.id)+'"')+button('again','New questions','','data-session="'+esc(session.id)+'"') : button('resume','Resume','df-primary','data-session="'+esc(session.id)+'"'))+'</div></li>';
    }).join('')+'</ul>'+(rows.length>20?'<p class="df-muted">Showing the latest 20 drills. Older work is retained in your backup.</p>':'');
  }
  function settingsMarkup() {
    const state = engine.getState();
    const topics = [...new Map(pool.map(item => [item.topicId,item.topicTitle || cap(item.topicId)])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
    const issues = Object.values(state.issues || {}).sort((a,b)=>b.at-a.at);
    const preview = location.hostname !== 'italian-flash-card-review.netlify.app';
    return '<details class="df-settings"><summary>Practice flags, backup and device options</summary><h3>Topics that need practice</h3><p class="df-muted">Optional. Your drill is prepared even if you leave these alone. Select again to clear a flag.</p><div class="df-topic-flags">'+topics.map(([id,title])=>flagButton('topic',id,title,title)).join('')+'</div><h3>How the mix is chosen</h3><p class="df-muted">Your flags and difficult answers get priority. The drill also mixes older recall, familiar material and rotating topics. Only active recall sets a review date. A difficult answer is eligible for review the next day; a correct or confident answer after four days. This is a simple website practice rule, separate from Anki.</p><h3>Your progress on this device</h3><p>Saved in this browser. There is no signed-in progress account or automatic Mac–phone sync.</p><p class="df-muted">'+(preview?'This preview and the live site have separate storage. ':'')+'To move Daily Focus progress, export a backup, send the file to your other device, then import it there. Imports merge with saved Daily Focus work. Existing course progress and Anki are separate.</p><div class="df-actions">'+button('export','Export Daily Focus backup')+'</div><label>Import a Daily Focus backup<input id="focusImport" type="file" accept="application/json,.json"></label>'+(pendingImport?'<div class="df-transfer-plan"><p><strong>'+pendingImport.count+' saved '+(pendingImport.count===1?'drill':'drills')+'</strong> in this backup. Merge them with the work already on this browser?</p><div class="df-actions">'+button('import','Merge this backup','df-primary')+button('cancel-import','Cancel')+'</div></div>':'')+'<h3>Home-screen and offline access</h3><p class="df-muted">You can save the site to your home screen from your browser. This preview needs an internet connection to load course material. It does not yet provide offline study.</p><h3>Issues saved for later</h3>'+(issues.length?'<ul class="df-review-list">'+issues.slice(0,12).map(issue=>'<li><p>'+esc(issue.note)+'</p><p class="df-muted">'+dateLabel(issue.at)+(issue.itemId?' · Saved with its question':'')+'</p></li>').join('')+'</ul>':'<p class="df-muted">Use “Flag an issue for later” inside a drill. Your note stays here so you can keep practising.</p>')+'</details>';
  }
  function homeMarkup() {
    const status = engine.status();
    const prefs = engine.preferences();
    const complete = status.state === 'completed';
    return '<div class="df-heading"><div><p class="df-kicker">A little Italian, today</p><h1>Daily Focus</h1><p class="df-lede">Choose your time. We will prepare a useful mix from your course.</p></div><span class="df-status">'+cap(status.state)+'</span></div>'+
      (complete ? '<div class="df-ready"><p><strong>Today’s target is complete.</strong> You can stop here. Another drill is optional.</p></div>' : status.state==='skipped today'?'<p class="df-muted">Today is quiet. You can still start a drill whenever you want.</p>':'')+
      '<section class="df-panel" aria-labelledby="focusTimeTitle"><h2 id="focusTimeTitle">How much time have you got?</h2><fieldset class="df-duration"><legend class="sr">Approximate duration</legend>'+durations.map(n=>'<label><input type="radio" name="duration" value="'+n+'"'+(prefs.duration===n?' checked':'')+'>'+n+' min</label>').join('')+'</fieldset><p id="focusBudget" class="df-muted">'+budgetText(prefs.duration)+'</p><details class="df-adjustments"><summary>Adjust difficulty or spoken practice</summary><div class="df-adjustment-row"><label>Difficulty<select id="focusDifficulty"><option value="gentle"'+(prefs.difficulty==='gentle'?' selected':'')+'>Gentle</option><option value="standard"'+(prefs.difficulty==='standard'?' selected':'')+'>Standard</option><option value="challenge"'+(prefs.difficulty==='challenge'?' selected':'')+'>Challenge</option></select></label><label class="df-check"><input type="checkbox" id="focusSpoken"'+(speech?' checked':'')+'>Offer spoken recall</label></div><p class="df-muted">Gentle shows hints. Standard keeps them optional. Challenge favours longer recall where available. Time and difficulty are separate.</p><p class="df-muted">Spoken recall is self-assessed. You can always answer quietly.</p></details><div class="df-actions">'+button('start',complete?'Start another drill':'Start my drill','df-primary',ready?'':'disabled')+'</div><p class="df-muted" style="margin-top:12px">One qualifying drill is enough for today, including the two-minute option.</p></section>'+
      '<section class="df-panel" aria-labelledby="focusDrillsTitle"><h2 id="focusDrillsTitle">Your drills</h2>'+sessionRows()+'</section><section class="df-panel" aria-labelledby="focusWeekTitle"><h2 id="focusWeekTitle">A week of practice</h2>'+weekView()+'<details><summary>Studied in Anki or your workbook?</summary><p class="df-muted">Record it as self-reported activity. It does not complete a web drill or add question results.</p><div class="df-actions">'+button('checkin','I studied in Anki','','data-kind="anki"')+button('checkin','I used my workbook','','data-kind="workbook"')+'</div>'+(status.selfReported?.length?'<p class="df-muted">Recorded today: '+status.selfReported.map(row=>row.kind==='anki'?'Anki':row.kind==='workbook'?'workbook':'other study').join(', ')+'.</p>':'')+'</details></section>'+(!complete?'<div class="df-utility">'+button('skip-today','Skip today','df-quiet')+'</div>':'')+settingsMarkup();
  }
  function budgetText(minutes) {
    return engine.stepCounts[minutes]+' short steps. '+(minutes>=30?'Rounds of eight, with suggested one-minute breaks. ':'')+'Approximate time, including breaks. No countdown to beat.';
  }
  function shortenMarkup(session) {
    const choices = durations.filter(n=>n<session.duration);
    return showShorten ? '<section class="df-panel"><h3>Choose a shorter version</h3><p class="df-muted">Keep all completed work. The result will use the shorter duration.</p><div class="df-actions">'+choices.map(n=>button('shorten',n+' minutes','','data-minutes="'+n+'"')).join('')+button('cancel-shorten','Cancel','df-quiet')+'</div></section>' : '';
  }
  function sessionControls(session) {
    return '<div class="df-controls"><div>'+button('save','Save for later today')+(session.duration>2?button('show-shorten','Make this shorter'):'')+'</div><div>'+button('finish','Finish for now','df-quiet')+'</div></div>'+shortenMarkup(session);
  }
  function checkpointMarkup(session) {
    const round = session.index/session.roundSize;
    return '<section class="df-panel"><p class="df-kicker">Round '+round+' of '+Math.ceil(session.steps.length/session.roundSize)+' checkpoint</p><h2 tabindex="-1" id="focusTaskTitle">A good place for a breather</h2><p>Take about a minute if you want. Breaks are included in the approximate time budget.</p><p class="df-muted">Your place is saved. Active practice time is paused here. Skipped steps remain unfinished.</p><div class="df-actions">'+button('continue-round','Start the next round','df-primary')+button('save','Save for later today')+'</div></section>'+sessionControls(session);
  }
  function hint(item, session) {
    return item.hint ? '<details class="df-support"'+(session.difficulty==='gentle'?' open':'')+'><summary>Hint</summary><p>'+explain(item.hint)+'</p></details>' : '';
  }
  function ratingButtons(current = '', action = 'rate') {
    return '<div class="df-rating" role="group" aria-label="How did recall feel?">'+[['known','I knew it'],['unsure','Not sure'],['again','Needs more practice']].map(([value,label])=>button(action,label,'','data-rating="'+value+'" aria-pressed="'+(current===value)+'"')).join('')+'</div>';
  }
  function feedback(slot) {
    const item = slot.item;
    const result = slot.result;
    const isRecall = ['flashcard','spoken'].includes(item.type);
    const review = result?.correct === false || result?.dontKnow || ['again','unsure'].includes(result?.confidence);
    if (item.type==='reading') return '<div class="df-feedback"><p><strong>Reading recorded.</strong> This is exposure, separate from active recall.</p></div>';
    return '<div class="df-feedback" data-review="'+review+'" role="status"><p><strong>'+(isRecall?'Answer':result?.dontKnow?'A useful learning attempt.':result?.correct?'Correct.':'Good to practise this one.')+'</strong></p><p class="df-model">'+modelAnswer(item)+'</p>'+explanation(item)+(review?'<p class="df-muted">This attempt counts. Saved for further practice.</p>':'')+'</div>';
  }
  function stepMarkup(session, slot) {
    const item = slot.item;
    const completed = slot.status==='completed';
    const flash = ['flashcard','spoken'].includes(item.type);
    let response = '';
    if (item.type === 'reading') {
      response = '<div class="df-reading">'+readingBody(item)+'</div>'+(completed ? feedback(slot) : '<div class="df-actions">'+button('read','I’ve read this','df-primary')+'</div>');
    } else if (flash) {
      response = '<p class="df-muted">'+(speech?'Say your answer aloud, or recall it quietly. ':'Recall the answer quietly. ')+'Then reveal it and assess your own recall.</p>'+hint(item,session)+(slot.revealed ? feedback(slot)+(completed?'':'<p class="df-muted" style="margin-top:15px">How did that feel? Choose one to complete this step.</p>')+ratingButtons(slot.result?.confidence || '',completed?'confidence':'rate') : '<div class="df-actions">'+button('reveal','Reveal answer','df-primary')+button('unknown','I don’t know')+'</div>');
    } else if (completed) {
      response = (slot.result?.value?'<p class="df-muted">Your answer: '+esc(slot.result.value)+'</p>':'')+feedback(slot)+'<details class="df-support"><summary>How confident did it feel? (optional)</summary>'+ratingButtons(slot.result?.confidence || '', 'confidence')+'</details>';
    } else {
      const answerLang = /^en/.test(item.answerLang || '') ? 'en' : 'it';
      const choices = item.choices || [];
      const draft = slot.draft || '';
      const input = choices.length ? '<fieldset class="df-options"><legend>Choose one answer</legend>'+choices.map(choice=>'<label><input type="radio" name="answer" value="'+esc(choice)+'" required'+(draft===choice?' checked':'')+'><span class="'+(answerLang==='it'?'learning-it':'')+'" lang="'+answerLang+'">'+esc(choice)+'</span></label>').join('')+'</fieldset>' : '<label class="df-answer-label" for="focusAnswer">Your answer<input id="focusAnswer" class="df-answer" type="text" name="answer" lang="'+answerLang+'" required autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(draft)+'"></label>';
      response = '<form id="focusAnswerForm">'+input+hint(item,session)+'<div class="df-actions"><button type="submit" class="df-primary">Check answer</button>'+button('unknown','I don’t know')+'</div></form>';
    }
    return '<article class="df-panel df-task"><p class="df-step-position">Step '+(session.index+1)+' of '+session.steps.length+(session.duration>=30?' · Round '+(Math.floor(session.index/session.roundSize)+1)+' of '+Math.ceil(session.steps.length/session.roundSize):'')+'</p><div class="df-step-meta"><span>'+esc(item.topicTitle || cap(item.topicId))+'</span><span>'+labelFor[item.type]+'</span></div><h2 tabindex="-1" id="focusTaskTitle">'+explain(item.task)+'</h2><p class="df-reason">'+esc(slot.reason || 'No review recorded here yet')+'</p>'+stimulus(item)+response+(completed?'<div class="df-actions">'+button('next',session.index===session.steps.length-1?'See my summary':'Next step','df-primary')+'</div>':'')+'<div class="df-step-tools"><div>'+flagButton('item',item.id,item.task)+(item.topicId?flagButton('topic',item.topicId,item.topicTitle || item.topicId,'Flag this topic'):'')+'</div>'+button('show-issue','Flag an issue for later','df-quiet')+'</div>'+(showIssue?'<form id="focusIssueForm" class="df-issue"><label for="focusIssueNote">A quick note for later<textarea id="focusIssueNote" maxlength="2000" placeholder="What needs checking?" required></textarea></label><div class="df-actions"><button class="df-primary" type="submit">Save issue</button>'+button('hide-issue','Cancel')+'</div></form>':'')+(!completed?'<div class="df-utility">'+button('skip','Skip question','df-quiet')+button('swap','Swap question','df-quiet')+'</div>':'')+'</article>';
  }
  function drillMarkup() {
    const session = getSession();
    if (!session) { mode='home'; return homeMarkup(); }
    const stats = engine.summary(sessionId);
    const slot = session.steps[session.index];
    const heading = '<div class="df-work-head"><div><p class="df-kicker">Daily Focus · '+cap(session.difficulty)+'</p><h1>'+session.duration+'-minute drill</h1></div>'+button('pause','Pause')+'</div>'+
      '<div class="df-progress">'+window.ItalianLearningSession.progressMarkup({label:'Meaningful steps completed',completed:stats.completed,total:stats.assigned})+'<p class="df-muted">'+stats.required+' completed steps, including active recall, qualify this drill.</p></div>';
    if (!slot) return heading+summaryMarkup(false);
    return heading+(stats.qualifies?'<div class="df-ready"><p><strong>You have done enough to qualify.</strong> Finish here, or keep practising if you want.</p>'+button('finish','Finish drill','df-primary')+'</div>':'')+(atCheckpoint(session)?checkpointMarkup(session):stepMarkup(session,slot)+sessionControls(session));
  }
  function summaryMarkup(withHeading = true) {
    const session = getSession();
    if (!session) {mode='home';return homeMarkup();}
    const stats = engine.summary(sessionId);
    const complete = session.status==='completed';
    const heading = complete?'Drill complete':session.status==='saved'?'Saved for later':'Your practice is saved';
    const firstUnfinished = session.steps.findIndex(step=>step.status!=='completed');
    return '<section class="df-panel">'+(complete?'<span class="df-celebrate" aria-hidden="true">✓</span>':'')+(withHeading?'<p class="df-kicker">'+session.duration+'-minute'+(session.shortenedFrom?' version, shortened from '+session.originalDuration+' minutes':' drill')+'</p>':'')+'<h2 tabindex="-1" id="focusTaskTitle">'+heading+'</h2><p>'+(complete?'That is enough for today. Your completed drill stays recorded.':stats.qualifies?'You have met the practice target. Finish the drill when you are ready.':'Complete '+stats.remainingNeeded+' more '+(stats.remainingNeeded===1?'step':'steps')+' to qualify'+(stats.activeRecall===0?', including at least one active recall attempt':'')+'. Wrong answers count as practice. Skips do not.')+'</p>'+ (session.status==='saved'?'<p class="df-muted">The same queue, answers and position are saved. This drill can still be resumed tomorrow.</p>':'')+'<div class="df-stats"><div class="df-stat"><strong>'+stats.completed+'/'+stats.assigned+'</strong><span>Steps completed</span></div><div class="df-stat"><strong>'+stats.activeRecall+'</strong><span>Recall attempts</span></div><div class="df-stat"><strong>'+stats.confident+'</strong><span>Self-rated confident</span></div><div class="df-stat"><strong>'+stats.revisit.length+'</strong><span>To revisit</span></div><div class="df-stat"><strong>'+stats.skipped+'</strong><span>Skipped</span></div><div class="df-stat"><strong>'+timeLabel(stats.activeMs)+'</strong><span>Active practice time</span></div></div><p class="df-muted">'+(stats.checked?stats.correct+' of '+stats.checked+' checked answers were correct.':'No automatically checked answers in this drill.')+' Flashcards and spoken recall use your own assessment. '+stats.readings+' reading '+(stats.readings===1?'step':'steps')+' recorded separately.</p><div class="df-actions">'+(complete ? button('home','Done for today','df-primary') : stats.qualifies ? button('finish','Finish drill','df-primary') : button('continue','Resume this drill','df-primary'))+button('review','Review questions and answers','','data-session="'+esc(session.id)+'"')+(complete?button('again','Another drill with new questions','','data-session="'+esc(session.id)+'"'):'')+'</div>'+(!complete&&stats.skipped?'<div class="df-actions">'+button('recover','Try an unfinished question','','data-index="'+firstUnfinished+'"')+button('replace-skipped','Replace an unfinished question','','data-index="'+firstUnfinished+'"')+'</div>':'')+(!complete?'<div class="df-utility">'+(session.duration>2?button('show-shorten','Make this shorter','df-quiet'):'')+button('home','Back to Today','df-quiet')+'</div>':'')+'</section>'+shortenMarkup(session);
  }
  function reviewMarkup() {
    const session = getSession();
    if (!session) {mode='home';return homeMarkup();}
    reviewIndex = Math.min(reviewIndex,session.steps.length-1);
    const slot = session.steps[reviewIndex];
    const item = slot.item;
    const result = slot.result;
    return '<div class="df-work-head"><div><p class="df-kicker">Saved drill · '+session.duration+' minutes</p><h1>Review your practice</h1></div>'+button('summary','Close review')+'</div><p class="df-muted">Read-only review. Looking at these answers does not add recall attempts or daily completion.</p><article class="df-panel" style="margin-top:18px"><div class="df-step-meta"><span>Step '+(reviewIndex+1)+' of '+session.steps.length+'</span><span>'+cap(slot.status)+'</span></div><h2 tabindex="-1" id="focusTaskTitle">'+explain(item.task)+'</h2>'+stimulus(item)+(item.type==='reading'?'<div class="df-reading">'+readingBody(item)+'</div>':(result?.value?'<p>Your answer: '+esc(result.value)+'</p>':'')+'<p class="df-model">'+modelAnswer(item)+'</p>'+(item.explanation?'<p>'+explain(item.explanation)+'</p>':'')+(result?.confidence?'<p class="df-muted">Your confidence: '+({known:'I knew it',unsure:'Not sure',again:'Needs more practice'}[result.confidence])+'</p>':''))+'<div class="df-step-tools">'+flagButton('item',item.id,item.task)+'</div></article><div class="df-controls"><div>'+button('review-prev','Previous','',''+(reviewIndex===0?'disabled':''))+button('review-next','Next','',''+(reviewIndex===session.steps.length-1?'disabled':''))+'</div></div>';
  }
  function render(focus = false) {
    if (signal.aborted) return;
    const anchor = view.querySelector('.df-task');
    const previousTop = anchor?.getBoundingClientRect().top;
    const scroll = window.scrollY;
    view.innerHTML = mode==='home'?homeMarkup():mode==='drill'?drillMarkup():mode==='review'?reviewMarkup():summaryMarkup();
    renderedSessionKey = sessionKey(getSession());
    storageStatus();
    if (mode==='drill' && previousTop !== undefined) restorePosition(view.querySelector('.df-task'),previousTop);
    else if (mode!=='home' && focus) window.scrollTo({top:scroll,behavior:'instant'});
    if (focus) view.querySelector('#focusTaskTitle')?.focus({preventScroll:true});
  }
  function start(settings) {
    const current=engine.getSession();
    if (current?.status==='in-progress') engine.saveLater(current.id);
    const session=engine.createSession(pool, settings || engine.preferences());
    sessionId=session.id;mode='drill';showShorten=false;showIssue=false;lastInteraction=Date.now();lastTick=Date.now();
    announce(session.selectionNote || '');render(true);
  }
  function finish() {activeTick();engine.finish(sessionId);mode='summary';showShorten=false;render(true);}
  function perform(action, control) {
    if (['read','reveal','unknown','rate','confidence','next','skip','swap','continue-round','show-issue'].includes(action) && !ensureVisibleStep()) return;
    const session=getSession();
    switch(action) {
      case 'start': start(); break;
      case 'again': { const previous=engine.getSession(control.dataset.session);start({duration:previous.duration,difficulty:previous.difficulty,avoidIds:previous.steps.map(step=>step.item.id)}); break; }
      case 'resume': sessionId=control.dataset.session;engine.resume(sessionId);mode='drill';showShorten=false;announce('');render(true);break;
      case 'continue': engine.resume(sessionId);if(session.index>=session.steps.length){const index=session.steps.findIndex(s=>s.status!=='completed');if(index>=0)engine.revisit(index,sessionId);}mode='drill';render(true);break;
      case 'read': engine.markRead(sessionId);render(true);break;
      case 'reveal': engine.reveal(sessionId);render();break;
      case 'unknown': {const step=engine.currentStep(sessionId);if(['flashcard','spoken'].includes(step.item.type)){engine.reveal(sessionId);engine.rate('again',sessionId);}else engine.answer('',{dontKnow:true},sessionId);render(true);break;}
      case 'rate': engine.rate(control.dataset.rating,sessionId);render(true);break;
      case 'confidence': engine.recordConfidence(control.dataset.rating,sessionId);render();break;
      case 'next': engine.advance(sessionId);showIssue=false;if(!engine.currentStep(sessionId))finish();else render(true);break;
      case 'skip': engine.skip(sessionId);showIssue=false;if(!engine.currentStep(sessionId))finish();else render(true);announce('Question skipped. It remains unfinished.');break;
      case 'swap': engine.swap(pool,sessionId);showIssue=false;render(true);announce('Question replaced. The number of assigned steps is unchanged.');break;
      case 'save': activeTick();engine.saveLater(sessionId);mode='summary';render(true);announce('Saved at this exact place. You can resume today or later.');break;
      case 'pause': activeTick();engine.pause(sessionId);mode='summary';render(true);announce('Paused. Active practice time has stopped.');break;
      case 'finish': finish();break;
      case 'home': if(session?.status==='in-progress')engine.saveLater(sessionId);mode='home';showShorten=false;announce('');render();break;
      case 'review': sessionId=control.dataset.session || sessionId;reviewIndex=0;mode='review';render(true);break;
      case 'summary': mode='summary';render(true);break;
      case 'review-prev': reviewIndex--;render(true);break;
      case 'review-next': reviewIndex++;render(true);break;
      case 'show-shorten': showShorten=true;render();break;
      case 'cancel-shorten': showShorten=false;render();break;
      case 'shorten': engine.shorten(Number(control.dataset.minutes),sessionId);showShorten=false;mode='drill';if(!engine.currentStep(sessionId))finish();else render(true);announce('Shortened to '+control.dataset.minutes+' minutes. Your completed work is retained.');break;
      case 'recover': engine.resume(sessionId);engine.revisit(Number(control.dataset.index),sessionId);mode='drill';render(true);break;
      case 'replace-skipped': engine.resume(sessionId);engine.revisit(Number(control.dataset.index),sessionId);engine.swap(pool,sessionId);mode='drill';render(true);break;
      case 'continue-round': engine.acknowledgeCheckpoint(session.index,sessionId);lastTick=Date.now();lastInteraction=Date.now();render(true);break;
      case 'flag': {const value=!engine.isFlagged(control.dataset.kind,control.dataset.id);engine.setFlag(control.dataset.kind,control.dataset.id,value,control.dataset.label);control.setAttribute('aria-pressed',String(value));announce(value?'Marked for more practice.':'Practice flag cleared.');break;}
      case 'show-issue': showIssue=true;render();view.querySelector('#focusIssueNote')?.focus({preventScroll:true});break;
      case 'hide-issue': showIssue=false;render();break;
      case 'skip-today': engine.skipToday();render();announce('Today’s reminder is quiet. Your saved work is still available.');break;
      case 'checkin': engine.checkIn(control.dataset.kind);render();announce('Recorded as self-reported activity.');break;
      case 'export': {const blob=new Blob([engine.backup()],{type:'application/json'});const href=URL.createObjectURL(blob);const link=document.createElement('a');link.href=href;link.download='Italian_Daily_Focus_'+today()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(href),1000);announce('Backup prepared for download.');break;}
      case 'import': {const result=engine.restore(pendingImport.text);pendingImport=null;render();announce('Backup merged. '+result.sessions+' '+(result.sessions===1?'drill is':'drills are')+' saved here.');break;}
      case 'cancel-import': pendingImport=null;render();break;
    }
    storageStatus();
  }
  main.addEventListener('click', event => {
    const control=event.target.closest('[data-focus-action]');
    if(!control||!main.contains(control))return;
    try{perform(control.dataset.focusAction,control);}catch(error){announce(error.message);storageStatus();}
  },{signal});
  main.addEventListener('submit', event => {
    if(event.target.id==='focusAnswerForm') {
      event.preventDefault();
      if (!ensureVisibleStep()) return;
      try {const value=String(new FormData(event.target).get('answer') || '');const item=engine.currentStep(sessionId).item;const result=content.matchAnswer(item,value);engine.answer(value,{correct:typeof result==='boolean'?result:result.correct},sessionId);render(true);}catch(error){announce(error.message);}
    } else if(event.target.id==='focusIssueForm') {
      if (!ensureVisibleStep()) {event.preventDefault();return;}
      event.preventDefault();engine.flagIssue(view.querySelector('#focusIssueNote').value,sessionId);showIssue=false;render();announce('Issue saved for later. Carry on when you are ready.');
    }
  },{signal});
  main.addEventListener('input', event => {
    if(event.target.name==='answer'&&mode==='drill'&&ensureVisibleStep())engine.saveDraft(event.target.value,sessionId);
  },{signal});
  main.addEventListener('change', async event => {
    try {
      if(event.target.name==='duration') {engine.preferences({duration:Number(event.target.value)});view.querySelector('#focusBudget').textContent=budgetText(Number(event.target.value));}
      if(event.target.id==='focusDifficulty')engine.preferences({difficulty:event.target.value});
      if(event.target.id==='focusSpoken'){speech=event.target.checked;engine.preferences({spoken:speech});}
      if(event.target.id==='focusImport'&&event.target.files[0]) {
        const file=event.target.files[0];if(file.size>20000000)throw Error('Choose a backup smaller than 20 MB.');
        const text=await file.text();const data=JSON.parse(text);if(data.format!=='italian-daily-focus'||data.version!==1||!data.state?.sessions)throw Error('Choose a Daily Focus version 1 backup.');
        pendingImport={text,count:Object.keys(data.state.sessions).length};render();view.querySelector('.df-settings').open=true;view.querySelector('[data-focus-action="import"]')?.focus({preventScroll:true});
      }
    }catch(error){announce(error.message || 'This backup could not be read.');}
  },{signal});
  const interaction = () => {lastInteraction=Date.now();};
  ['pointerdown','keydown','input','scroll','touchstart'].forEach(name=>document.addEventListener(name,interaction,{signal,passive:true}));
  document.addEventListener('visibilitychange',()=>{activeTick();lastTick=Date.now();if(!document.hidden){lastInteraction=Date.now();if(renderedDay!==today()){renderedDay=today();if(mode==='home')render();}}},{signal});
  window.addEventListener('focus',()=>{lastTick=Date.now();lastInteraction=Date.now();},{signal});
  window.addEventListener('blur',activeTick,{signal});
  window.addEventListener('pagehide',()=>{activeTick();if(isActive())engine.saveLater(sessionId);},{signal});
  window.addEventListener('storage',event=>{if(event.key===engine.storageKey){if(mode==='home')render();else{const next=getSession();if(next?.status==='completed'){mode='summary';render();}else if(mode==='drill'&&sessionKey(next)!==renderedSessionKey){render(true);announce('This drill changed in another tab. The latest saved question is now shown.');}}}},{signal});
  const timer=setInterval(activeTick,5000);
  signal.addEventListener('abort',()=>{clearInterval(timer);activeTick();if(isActive())engine.saveLater(sessionId);},{once:true});
  try {
    pool=await content.buildPool();
    if(signal.aborted)return;
    engine.seedLegacyHistory(pool,content.readLegacyHistory(pool));
    speech=!!engine.preferences().spoken;
    ready=true;
    render();
  }catch(error){view.innerHTML='<h1>Daily Focus</h1><p>The course material could not be loaded. Your saved work is still here.</p><div class="df-actions">'+button('export','Export saved work')+'</div>';announce(error.message);}
}
