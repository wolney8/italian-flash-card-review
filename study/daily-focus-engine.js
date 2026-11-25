/* Daily Focus stores browser-local practice separately from the canonical course. */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ItalianDailyFocus = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const STORAGE_KEY = 'italianDailyFocus.v1';
  const DURATIONS = [2, 5, 10, 30, 60];
  const STEP_COUNTS = {2:4, 5:8, 10:16, 30:40, 60:80};
  const DIFFICULTIES = ['gentle', 'standard', 'challenge'];
  const STEP_TYPES = ['question', 'flashcard', 'reading', 'spoken'];
  const DAY_MS = 86400000;
  const londonDate = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London', year:'numeric', month:'2-digit', day:'2-digit'});
  const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const clone = value => JSON.parse(JSON.stringify(value));
  const validKey = value => typeof value === 'string' && value.length > 0 && value.length < 600 && !forbidden.has(value);
  const finiteTime = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  function dayKey(value = Date.now()) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) throw Error('The practice date is invalid.');
    const parts = londonDate.formatToParts(date);
    const part = type => parts.find(p => p.type === type).value;
    return part('year') + '-' + part('month') + '-' + part('day');
  }
  function plain(value, depth = 0) {
    if (depth > 20) throw Error('This backup contains data that is too deeply nested.');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) throw Error('This backup contains an invalid number.');
      return value;
    }
    if (typeof value === 'string') {
      if (value.length > 100000) throw Error('This backup contains an oversized text field.');
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length > 20000) throw Error('This backup contains an oversized list.');
      return value.map(v => plain(v, depth + 1));
    }
    if (!value || typeof value !== 'object') throw Error('This backup contains an unsupported value.');
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      if (forbidden.has(key)) throw Error('This backup contains an unsafe field.');
      result[key] = plain(entry, depth + 1);
    }
    return result;
  }
  function freshState() {
    return {version:1, revision:0, preferences:{duration:5, difficulty:'standard', spoken:false, updatedAt:0}, currentSessionId:null,
      sessions:{}, events:{}, flags:{item:{}, topic:{}}, legacy:{}, days:{}, checkins:{}, issues:{}, updatedAt:0};
  }
  function snapshot(item) {
    if (!item || !validKey(item.id) || !STEP_TYPES.includes(item.type) || !validKey(item.topicId)) throw Error('This learning item cannot be used in Daily Focus.');
    // Save only structured content. HTML from backups is never rendered as markup.
    const fields = ['id','sourceId','aliases','topicId','topicTitle','type','task','stimulus','answer','answers','answerLang','choices','hint','explanation','reading','source','origin','difficulty','timeSeconds','verbName','skill','format','quietTask','sourceUrl','readingLines','optionalSubjects','answerMode','supportLines','meaning','usage','originalUrl','sourceLabel','lessonId','deck','sheetId','sheetTitle','contentVersion'];
    const itemCopy = {};
    for (const key of fields) if (item[key] !== undefined) itemCopy[key] = plain(item[key]);
    if (typeof itemCopy.task !== 'string') itemCopy.task = '';
    for(const name of ['answer','reading','hint','explanation','meaning','usage','topicTitle','sourceLabel'])if(itemCopy[name]!==undefined&&typeof itemCopy[name]!=='string')throw Error('This learning item contains invalid text.');
    if (!Array.isArray(itemCopy.stimulus)) itemCopy.stimulus = [];
    if (!Array.isArray(itemCopy.answers)) itemCopy.answers = [];
    for(const name of ['aliases','answers','choices','optionalSubjects'])if(itemCopy[name]!==undefined){if(!Array.isArray(itemCopy[name])||!itemCopy[name].every(value=>typeof value==='string'))throw Error('This learning item contains an invalid answer list.');}
    for(const name of ['stimulus','readingLines'])if(itemCopy[name]!==undefined){if(!Array.isArray(itemCopy[name])||!itemCopy[name].every(value=>value&&typeof value.text==='string'))throw Error('This learning item contains invalid text.');}
    return itemCopy;
  }
  function validateState(value) {
    const data = plain(value);
    if (!data || data.version !== 1 || !data.sessions || !data.events || !data.flags) throw Error('Choose a Daily Focus version 1 backup.');
    const state = freshState();
    state.revision = Number.isInteger(data.revision) && data.revision >= 0 ? data.revision : 0;
    state.updatedAt = finiteTime(data.updatedAt) ? Number(data.updatedAt) : 0;
    if (data.preferences) {
      state.preferences.duration = DURATIONS.includes(Number(data.preferences.duration)) ? Number(data.preferences.duration) : 5;
      state.preferences.difficulty = DIFFICULTIES.includes(data.preferences.difficulty) ? data.preferences.difficulty : 'standard';
      state.preferences.spoken = data.preferences.spoken === true;
      state.preferences.updatedAt = finiteTime(data.preferences.updatedAt) ? Number(data.preferences.updatedAt) : 0;
    }
    for (const [id, session] of Object.entries(data.sessions)) {
      if (!validKey(id) || !session || session.id !== id || !Array.isArray(session.steps) || !session.steps.length || session.steps.length > 80) throw Error('This backup contains an invalid session.');
      if (!DURATIONS.includes(Number(session.duration)) || !DURATIONS.includes(Number(session.originalDuration)) || Number(session.originalDuration)<Number(session.duration) || !DIFFICULTIES.includes(session.difficulty)) throw Error('This backup contains invalid session settings.');
      if (!['in-progress','saved','partial','completed'].includes(session.status)) throw Error('This backup contains an invalid session status.');
      if (!finiteTime(session.createdAt) || !finiteTime(session.updatedAt) || !finiteTime(session.activeMs)) throw Error('This backup contains an invalid session time.');
      if (!Number.isInteger(session.index) || session.index < 0 || session.index > session.steps.length) throw Error('This backup contains an invalid session position.');
      session.checkpoints=Array.isArray(session.checkpoints)?session.checkpoints.filter(index=>Number.isInteger(index)&&index>0&&index%8===0&&index<session.steps.length):[];
      const seen = new Set();
      for (const step of session.steps) {
        if (!validKey(step.id) || seen.has(step.id) || !['pending','skipped','completed'].includes(step.status)) throw Error('This backup contains an invalid learning step.');
        seen.add(step.id);
        step.item = snapshot(step.item);
        if (step.result && !['answer','read','self-assessed'].includes(step.result.type)) throw Error('This backup contains an invalid answer.');
        if (step.status === 'completed' && !step.result) throw Error('A completed step is missing its result.');
        if (step.item.type === 'reading' && step.result && step.result.type !== 'read') throw Error('A reading step has an invalid result.');
        if (['flashcard','spoken'].includes(step.item.type) && step.status === 'completed' && (!step.revealed || step.result.type !== 'self-assessed' || !['known','unsure','again'].includes(step.result.confidence))) throw Error('A flashcard is missing reveal or self-assessment.');
      }
      if (session.steps.filter(s => s.item.type === 'reading').length > Math.floor(session.steps.length / 4)) throw Error('A drill contains too many reading steps.');
      if (session.creditDay && !/^\d{4}-\d{2}-\d{2}$/.test(session.creditDay)) throw Error('This backup contains an invalid completion date.');
      if(session.creditedAt || session.status==='completed'){
        const meaningful=session.steps.filter(step=>step.status==='completed'&&step.result);
        if(!finiteTime(session.creditedAt)||!session.creditDay||dayKey(session.creditedAt)!==session.creditDay||meaningful.length<Math.ceil(session.steps.length*.75)||!meaningful.some(step=>step.result.type!=='read'))throw Error('This backup contains an invalid completion claim.');
      }
      state.sessions[id] = session;
    }
    for (const [id, event] of Object.entries(data.events)) {
      if (!validKey(id) || !event || !['recall','exposure'].includes(event.kind) || !validKey(event.itemId) || !finiteTime(event.at) || (event.correct!==undefined&&event.correct!==null&&typeof event.correct!=='boolean') || (event.confidence!==undefined&&event.confidence!==null&&!['known','unsure','again'].includes(event.confidence))) throw Error('This backup contains an invalid practice record.');
      state.events[id] = event;
    }
    for (const kind of ['item','topic']) for (const [id, flag] of Object.entries(data.flags[kind] || {})) {
      if (!validKey(id) || typeof flag?.value !== 'boolean' || !finiteTime(flag.at)) throw Error('This backup contains an invalid practice flag.');
      state.flags[kind][id] = flag;
    }
    for (const [id, value] of Object.entries(data.legacy || {})) if (validKey(id) && value && typeof value === 'object') state.legacy[id] = value;
    for (const [id, value] of Object.entries(data.issues || {})){if(!validKey(id)||!value||typeof value.note!=='string'||!finiteTime(value.at))throw Error('This backup contains an invalid issue note.');state.issues[id]=value;}
    for (const [id, value] of Object.entries(data.checkins || {})){if(!validKey(id)||!value||!['anki','workbook','other'].includes(value.kind)||!finiteTime(value.at)||(value.minutes!==undefined&&value.minutes!==null&&(!finiteTime(value.minutes)||value.minutes>600)))throw Error('This backup contains an invalid self-reported check-in.');state.checkins[id]=value;}
    for (const [id, value] of Object.entries(data.days || {})) if (/^\d{4}-\d{2}-\d{2}$/.test(id) && value) state.days[id] = {skipAt:value.skipAt!==null&&finiteTime(value.skipAt) ? Number(value.skipAt) : null,updatedAt:finiteTime(value.updatedAt)?Number(value.updatedAt):Number(value.skipAt)||0};
    state.currentSessionId = own(state.sessions, data.currentSessionId) ? data.currentSessionId : null;
    return state;
  }
  function mergeStates(left, right) {
    const merged = clone(left);
    if ((right.preferences.updatedAt || 0) > (left.preferences.updatedAt || 0)) merged.preferences = clone(right.preferences);
    const unionNewer = (a, b, time = 'at') => {
      for (const [id, value] of Object.entries(b || {})) if (!own(a, id) || (value[time] || 0) > (a[id][time] || 0)) a[id] = clone(value);
    };
    for (const [id, incoming] of Object.entries(right.sessions)) {
      if (!own(merged.sessions, id)) { merged.sessions[id] = clone(incoming); continue; }
      const current = merged.sessions[id];
      const creditedCopies=[current,incoming].filter(session=>session.creditedAt).sort((a,b)=>a.creditedAt-b.creditedAt);
      if(creditedCopies.length){
        // A finished target is immutable, including after a shorter version was chosen.
        // Later stale drafts cannot turn a valid 6/8 completion back into 6/40.
        const fixed=clone(creditedCopies[0]);
        fixed.activeMs=Math.max(current.activeMs||0,incoming.activeMs||0);
        merged.sessions[id]=fixed;
        continue;
      }
      const winner = (incoming.updatedAt || 0) > (current.updatedAt || 0) ? incoming : current;
      const other = winner === incoming ? current : incoming;
      const session = clone(winner);
      const otherSteps = new Map(other.steps.map(step => [step.id, step]));
      // An independently completed step must survive a stale tab or backup import.
      session.steps = session.steps.map(step => {
        const old = otherSteps.get(step.id);
        if (!old) return step;
        if (old.status === 'completed' && step.status !== 'completed') return clone(old);
        if (old.item.id === step.item.id && (old.updatedAt || 0) > (step.updatedAt || 0)) return clone(old);
        return step;
      });
      const archived=new Map((session.archivedSteps||[]).map(step=>[step.id,step]));
      for (const step of other.steps) if (step.status === 'completed' && !session.steps.some(s => s.id === step.id)) archived.set(step.id,clone(step));
      if(archived.size)session.archivedSteps=[...archived.values()];
      session.activeMs = Math.max(current.activeMs || 0, incoming.activeMs || 0);
      session.index = Math.min(session.index, session.steps.length);
      merged.sessions[id] = session;
    }
    for(const [id,event] of Object.entries(right.events)){if(!merged.events[id]||(event.updatedAt||event.at)>(merged.events[id].updatedAt||merged.events[id].at))merged.events[id]=clone(event);}
    unionNewer(merged.flags.item, right.flags.item);
    unionNewer(merged.flags.topic, right.flags.topic);
    unionNewer(merged.legacy, right.legacy, 'recordedAt');
    unionNewer(merged.issues, right.issues);
    unionNewer(merged.checkins, right.checkins);
    for (const [day, record] of Object.entries(right.days)) if (!merged.days[day] || (record.updatedAt || record.skipAt || 0) > (merged.days[day].updatedAt || merged.days[day].skipAt || 0)) merged.days[day] = clone(record);
    if (right.updatedAt > left.updatedAt && right.currentSessionId) merged.currentSessionId = right.currentSessionId;
    merged.revision = Math.max(left.revision, right.revision);
    merged.updatedAt = Math.max(left.updatedAt, right.updatedAt);
    return merged;
  }
  function createEngine(options = {}) {
    let storage = options.storage;
    if (storage === undefined) { try { storage = root.localStorage; } catch {} }
    const clock = typeof options.now === 'function' ? options.now : () => Date.now();
    const listeners = new Set();
    let state = freshState();
    let sequence = 0;
    let storageBlocked = false;
    let lastStoredRaw = null;
    let persistence = {ok:!!storage, message:storage ? '' : 'Progress is only in memory because browser storage is unavailable. Export a backup before closing.'};
    const now = () => Number(clock());
    const uid = prefix => prefix + '-' + now().toString(36) + '-' + (++sequence).toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    const timeStamp = () => Math.max(now(), state.updatedAt + 1);
    function readStored() {
      if (!storage) return null;
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if(raw===lastStoredRaw)return null;
        const loaded=raw?validateState(JSON.parse(raw)):null;lastStoredRaw=raw;return loaded;
      } catch (error) {
        storageBlocked = true;
        persistence = {ok:false, message:'Saved Daily Focus progress could not be read. Your original course progress is unchanged. Export any current work before leaving.'};
        return null;
      }
    }
    const stored = readStored();
    if (stored) state = stored;
    function sync() { const latest = readStored(); if (latest) state = mergeStates(state, latest); }
    function save() {
      state.updatedAt = timeStamp(); state.revision++;
      if (storage && !storageBlocked) {
        try { const raw=JSON.stringify(state);storage.setItem(STORAGE_KEY,raw);lastStoredRaw=raw;persistence = {ok:true, message:''}; }
        catch { persistence = {ok:false, message:'This browser could not save the latest practice. Keep this tab open and export a backup to keep your work.'}; }
      }
      for (const listener of listeners) { try { listener(clone(state)); } catch {} }
    }
    function sessionFor(id) {
      const key = id || state.currentSessionId;
      if (!key || !own(state.sessions, key)) throw Error('Choose or start a drill first.');
      return state.sessions[key];
    }
    function slotFor(session) {
      const step = session.steps[session.index];
      if (!step) throw Error('This drill is at its summary. Choose an unfinished step or finish.');
      return step;
    }
    function mutable(id) {
      sync();
      const session = sessionFor(id);
      if (session.status === 'completed') throw Error('This drill is complete. You can review it or start another drill.');
      return session;
    }
    function touch(session) { session.updatedAt = timeStamp(); save(); return clone(session); }
    function flagKey(kind, id) { if (!['item','topic'].includes(kind) || !validKey(id)) throw Error('Choose a valid item or topic.'); }
    function historyFor(item) {
      const id = typeof item === 'string' ? item : item.id;
      const aliases = typeof item === 'string' ? [id] : [id, item.sourceId, ...(item.aliases || [])].filter(Boolean);
      const records = Object.values(state.events).filter(event => aliases.includes(event.itemId));
      const recalls = records.filter(event => event.kind === 'recall').sort((a,b) => a.at - b.at);
      const exposures = records.filter(event => event.kind === 'exposure').sort((a,b) => a.at - b.at);
      const last = recalls.at(-1);
      const legacy = aliases.map(key => state.legacy[key]).find(Boolean);
      const gap = last?.confidence === 'known' || last?.correct === true ? 4 * DAY_MS : DAY_MS;
      return {recallCount:recalls.length, exposureCount:exposures.length,
        lastRecallAt:last?.at || null, lastExposureAt:exposures.at(-1)?.at || null,
        correct:last ? last.correct : legacy?.correct ?? null,
        confidence:last ? last.confidence : legacy?.confidence || null,
        difficult:last ? !!(last.dontKnow || last.correct === false || ['again','unsure'].includes(last.confidence)) : !!(legacy?.correct === false || ['again','unsure'].includes(legacy?.confidence)),
        dueAt:last ? last.at + gap : null, dateKnown:!!last, hasLegacy:!!legacy};
    }
    function reasonFor(item) {
      if (state.flags.item[item.id]?.value) return state.flags.item[item.id].automatic ? 'A recent answer needs another try' : 'You flagged this item';
      if (state.flags.topic[item.topicId]?.value) return 'You flagged ' + (item.topicTitle || item.topicId).toLowerCase();
      const history = historyFor(item);
      if (history.difficult) return history.dateKnown ? 'A recent answer needs another try' : 'Marked difficult in earlier web practice';
      if (history.lastRecallAt) {
        const days = Math.max(0, Math.floor((now() - history.lastRecallAt) / DAY_MS));
        return days === 0 ? 'Familiar practice from today' : 'Last practised here ' + days + (days === 1 ? ' day ago' : ' days ago');
      }
      if (history.hasLegacy) return 'Earlier web practice; no review date recorded';
      return 'No review recorded here yet';
    }
    function rankHash(text) {
      let hash = 2166136261;
      for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
      return hash >>> 0;
    }
    function select(pool, count, settings = {}) {
      const unique = new Map();
      for (const value of pool || []) { try { const item = snapshot(value); if (!unique.has(item.id)) unique.set(item.id, item); } catch {} }
      let candidates = [...unique.values()];
      const excluded = new Set(settings.exclude || []);
      candidates = candidates.filter(item => !excluded.has(item.id));
      if (!candidates.length) throw Error('No suitable approved questions are available.');
      const seed = settings.seed || uid('select');
      const difficulty = settings.difficulty || 'standard';
      const recentItems = new Set(Object.values(state.sessions).filter(s => now() - s.createdAt < DAY_MS).flatMap(s => s.steps.map(step => step.item.id)));
      const preferred = item => (item.difficulty === difficulty ? 1 : 0) + (difficulty === 'gentle' ? (item.type === 'reading' || item.choices?.length ? 1 : 0) : difficulty === 'challenge' ? (item.type !== 'reading' && !item.choices?.length ? 1 : 0) : 0);
      function category(item) {
        const history = historyFor(item);
        if (state.flags.item[item.id]?.value || state.flags.topic[item.topicId]?.value) return 'flagged';
        if (history.difficult) return 'difficult';
        if (history.dueAt && history.dueAt <= now()) return 'review';
        if (history.lastRecallAt && (history.correct === true || history.confidence === 'known')) return 'familiar';
        return 'rotation';
      }
      const metadata = new Map(candidates.map(item=>[item.id,{category:category(item),preferred:preferred(item),hash:rankHash(seed+item.id)}]));
      const plans = ['flagged','difficult','review','rotation','familiar','flagged','review','rotation'];
      const selected = [];
      const topics = {};
      const types = {};
      const readingLimit = Math.floor(count / 4);
      // Small drills include a reading/explanation only if one is available, then recall.
      for (let index = 0; index < count && candidates.length; index++) {
        let possible = candidates.filter(item => item.type !== 'reading' || (types.reading || 0) < readingLimit);
        if (!possible.length) break;
        const readingSlot = readingLimit > 0 && (index === 0 || (index % 8 === 0 && (types.reading || 0) < Math.ceil(count / 8)));
        const flashSlot = index % 4 === 2;
        const preferredType = readingSlot ? 'reading' : flashSlot ? 'flashcard' : null;
        const filtered = preferredType ? possible.filter(item => item.type === preferredType) : possible.filter(item => item.type !== 'reading');
        if (filtered.length) possible = filtered;
        const desired = plans[index % plans.length];
        possible.sort((a,b) => {
          const score = item => {const meta=metadata.get(item.id);return (meta.category === desired ? 16 : 0) + (meta.category === 'flagged' ? 4 : 0) + meta.preferred * 2
            - (topics[item.topicId] || 0) * 5 - (recentItems.has(item.id) ? 12 : 0) - (types[item.type] || 0);};
          return score(b) - score(a) || metadata.get(a.id).hash - metadata.get(b.id).hash;
        });
        const choice = possible[0];
        selected.push({item:choice, reason:reasonFor(choice)});
        topics[choice.topicId] = (topics[choice.topicId] || 0) + 1;
        types[choice.type] = (types[choice.type] || 0) + 1;
        candidates = candidates.filter(item => item.id !== choice.id);
      }
      // If too little recall exists, remove excess reading rather than offering a tick-only drill.
      while (selected.filter(s => s.item.type === 'reading').length > Math.floor(selected.length / 4)) {
        selected.splice(selected.findLastIndex(s => s.item.type === 'reading'), 1);
      }
      if (!selected.some(s => s.item.type !== 'reading')) throw Error('This drill needs at least one active recall question.');
      return selected;
    }
    function summary(id) {
      const session = sessionFor(id);
      const completed = session.steps.filter(s => s.status === 'completed' && s.result);
      const active = completed.filter(s => s.result.type !== 'read');
      const checked = active.filter(s => typeof s.result.correct === 'boolean');
      const required = Math.ceil(session.steps.length * .75);
      const skipped = session.steps.filter(s => s.status === 'skipped').length;
      return {id:session.id, assigned:session.steps.length, completed:completed.length, required,
        remainingNeeded:Math.max(0, required - completed.length, active.length ? 0 : 1), activeRecall:active.length,
        correct:checked.filter(s => s.result.correct).length, checked:checked.length,
        confident:active.filter(s => s.result.confidence === 'known').length,
        skipped, unanswered:session.steps.length - completed.length - skipped,
        readings:completed.length - active.length, attempts:active.length,
        qualifies:completed.length >= required && active.length > 0,
        activeMs:session.activeMs, duration:session.duration, originalDuration:session.originalDuration,
        creditDay:session.creditDay || null, status:session.status,
        revisit:active.filter(s => s.result.correct === false || s.result.dontKnow || ['again','unsure'].includes(s.result.confidence)).map(s => ({id:s.item.id, topicId:s.item.topicId, title:s.item.task, answer:s.item.answer}))};
    }
    function recordExposure(session, step) {
      const id = session.id + ':' + step.id + ':exposure:' + step.item.id;
      if (!state.events[id]) state.events[id] = {id, kind:'exposure', itemId:step.item.id, topicId:step.item.topicId, at:now(), sessionId:session.id, slotId:step.id, source:'daily-focus'};
    }
    function complete(session, step, result) {
      if (step.status === 'completed') return clone(session);
      step.status = 'completed'; step.result = {...result, at:now()}; step.updatedAt = timeStamp();
      recordExposure(session, step);
      if (result.type !== 'read') {
        const id = session.id + ':' + step.id + ':recall';
        state.events[id] = {id, kind:'recall', itemId:step.item.id, topicId:step.item.topicId,
          at:now(), correct:typeof result.correct === 'boolean' ? result.correct : null,
          confidence:result.confidence || null, dontKnow:!!result.dontKnow, sessionId:session.id, slotId:step.id, source:'daily-focus'};
        if (result.correct === false || result.dontKnow || ['again','unsure'].includes(result.confidence)) {
          state.flags.item[step.item.id] = {value:true, label:step.item.task, at:timeStamp(), automatic:true};
        }
      }
      session.status = 'in-progress';
      return touch(session);
    }
    const api = {
      storageKey:STORAGE_KEY, durations:[...DURATIONS], stepCounts:{...STEP_COUNTS},
      getState(){sync(); return clone(state);},
      persistence(){return {...persistence};},
      preferences(value){
        if (!value) return clone(state.preferences);
        sync();
        if (value.duration !== undefined) {
          if (!DURATIONS.includes(Number(value.duration))) throw Error('Choose 2, 5, 10, 30 or 60 minutes.');
          state.preferences.duration = Number(value.duration);
        }
        if (value.difficulty !== undefined) {
          if (!DIFFICULTIES.includes(value.difficulty)) throw Error('Choose Gentle, Standard or Challenge.');
          state.preferences.difficulty = value.difficulty;
        }
        if(value.spoken!==undefined)state.preferences.spoken=value.spoken===true;
        state.preferences.updatedAt = timeStamp(); save(); return clone(state.preferences);
      },
      createSession(pool, settings = {}) {
        sync();
        const duration = Number(settings.duration || state.preferences.duration);
        const difficulty = settings.difficulty || state.preferences.difficulty;
        if (!DURATIONS.includes(duration) || !DIFFICULTIES.includes(difficulty)) throw Error('Choose valid drill settings.');
        const avoidIds=new Set(Array.isArray(settings.avoidIds)?settings.avoidIds.filter(validKey):[]);
        let selectionPool=pool,selectionNote='';
        if(avoidIds.size){
          const unique=new Map();
          for(const item of pool||[]){try{const approved=snapshot(item);unique.set(approved.id,approved);}catch{}}
          const alternatives=[...unique.values()].filter(item=>!avoidIds.has(item.id));
          const target=STEP_COUNTS[duration];
          if(alternatives.length>=target&&alternatives.filter(item=>item.type!=='reading').length>=target-Math.floor(target/4))selectionPool=alternatives;
          else selectionNote='Some questions from the earlier drill may return because there are not enough suitable alternatives for this duration.';
        }
        const chosen = select(selectionPool, STEP_COUNTS[duration], {difficulty});
        const id = uid('focus');
        const session = {id, duration, originalDuration:duration, difficulty, selectionNote,
          steps:chosen.map((entry, index) => ({id:id + '-step-' + index, item:entry.item, reason:entry.reason, status:'pending', revealed:false, result:null, updatedAt:now(), swaps:[]})),
          index:0, status:'in-progress', createdAt:now(), updatedAt:timeStamp(), activeMs:0, creditedAt:null, creditDay:null,
          roundSize:duration >= 30 ? 8 : STEP_COUNTS[duration], breakSeconds:duration >= 30 ? 60 : 0, shortenedFrom:null, checkpoints:[]};
        state.sessions[id] = session; state.currentSessionId = id;
        state.preferences = {...state.preferences,duration,difficulty,updatedAt:timeStamp()};
        state.days[dayKey(now())]={skipAt:null,updatedAt:timeStamp()};
        return touch(session);
      },
      getSession(id){sync(); try{return clone(sessionFor(id));}catch{return null;}},
      currentStep(id){sync(); try {const session = sessionFor(id); return session.steps[session.index] ? clone(session.steps[session.index]) : null;} catch {return null;}},
      saveDraft(value,id){const session=mutable(id),step=slotFor(session);if(step.status==='completed')return clone(session);step.draft=String(value||'').slice(0,3000);step.updatedAt=timeStamp();return touch(session);},
      acknowledgeCheckpoint(index,id){const session=mutable(id);if(!Number.isInteger(index)||index<=0||index>=session.steps.length||index%8!==0)throw Error('This checkpoint is not available.');session.checkpoints=Array.from(new Set([...(session.checkpoints||[]),index]));return touch(session);},
      recordConfidence(confidence,id){
        const session=mutable(id),step=slotFor(session);
        if(step.status!=='completed'||!['answer','self-assessed'].includes(step.result?.type))throw Error('Check the answer before recording confidence.');
        if(!['known','unsure','again'].includes(confidence))throw Error('Choose a recall rating.');
        step.result.confidence=confidence;if(step.result.type==='self-assessed')step.result.dontKnow=confidence==='again';step.updatedAt=timeStamp();
        const event=state.events[session.id+':'+step.id+':recall'];if(event){event.confidence=confidence;if(step.result.type==='self-assessed')event.dontKnow=confidence==='again';event.updatedAt=timeStamp();}
        if(['again','unsure'].includes(confidence))state.flags.item[step.item.id]={value:true,label:step.item.task,at:timeStamp(),automatic:true};
        return touch(session);
      },
      answer(value, options = {}, id){
        const session = mutable(id), step = slotFor(session);
        if (step.item.type !== 'question') throw Error('Use the response controls for this activity.');
        if (!options.dontKnow && !String(value || '').trim()) throw Error('Enter an answer or choose “I don’t know”.');
        if (!options.dontKnow && typeof options.correct !== 'boolean') throw Error('The answer needs to be checked first.');
        return complete(session, step, {type:'answer', value:String(value || '').slice(0,3000), correct:options.dontKnow ? false : options.correct,
          dontKnow:!!options.dontKnow, confidence:['known','unsure','again'].includes(options.confidence) ? options.confidence : null});
      },
      markRead(id){const session = mutable(id), step = slotFor(session); if(step.item.type !== 'reading') throw Error('This is an active recall step.'); return complete(session,step,{type:'read',value:'',correct:null,confidence:null,dontKnow:false});},
      reveal(id){const session = mutable(id), step = slotFor(session); if(!['flashcard','spoken'].includes(step.item.type)) throw Error('This activity uses the answer checker.'); step.revealed = true; step.updatedAt = timeStamp(); recordExposure(session,step); return touch(session);},
      rate(confidence,id){
        const session=mutable(id),step=slotFor(session);
        if(!['flashcard','spoken'].includes(step.item.type) || !step.revealed) throw Error('Reveal the answer before assessing recall.');
        if(!['known','unsure','again'].includes(confidence)) throw Error('Choose a recall rating.');
        if(step.status==='completed')return api.recordConfidence(confidence,id);
        return complete(session,step,{type:'self-assessed',value:'',correct:null,confidence,dontKnow:confidence==='again'});
      },
      skip(id){const session=mutable(id),step=slotFor(session);if(step.status==='completed')throw Error('This step is already completed.');step.status='skipped';step.updatedAt=timeStamp();session.index=Math.min(session.steps.length,session.index+1);return touch(session);},
      swap(pool,id){
        const session=mutable(id),step=slotFor(session);if(step.status==='completed')throw Error('Only unfinished steps can be swapped.');
        const excluded=session.steps.map(s=>s.item.id).concat(step.swaps||[]);
        const readingCount=session.steps.filter(s=>s.item.type==='reading' && s.id!==step.id).length;
        const eligible=(pool||[]).filter(item=>item.type!=='reading' || readingCount<Math.floor(session.steps.length/4));
        const replacement=select(eligible,1,{difficulty:session.difficulty,exclude:excluded})[0];
        step.swaps=(step.swaps||[]).concat(step.item.id);step.item=replacement.item;step.reason=replacement.reason;step.status='pending';step.revealed=false;step.result=null;step.draft='';step.updatedAt=timeStamp();return touch(session);
      },
      advance(id){const session=mutable(id),step=slotFor(session);if(step.status==='pending')throw Error('Answer, skip or swap this question first.');session.index=Math.min(session.steps.length,session.index+1);return touch(session);},
      revisit(index,id){const session=mutable(id);if(!Number.isInteger(index)||index<0||index>=session.steps.length)throw Error('Choose a valid question.');session.index=index;session.status='in-progress';return touch(session);},
      saveLater(id){const session=mutable(id);session.status='saved';return touch(session);},
      pause(id){return api.saveLater(id);},
      finish(id){
        sync();const session=sessionFor(id);if(session.creditedAt)return clone(session);
        const result=summary(session.id);
        if(result.qualifies){session.status='completed';session.creditedAt=now();session.creditDay=dayKey(now());}
        else session.status='partial';
        return touch(session);
      },
      shorten(minutes,id){
        const session=mutable(id);minutes=Number(minutes);
        if(!DURATIONS.includes(minutes)||minutes>=session.duration)throw Error('Choose a shorter duration.');
        const currentId=session.steps[session.index]?.id;
        const completeSteps=session.steps.filter(step=>step.status==='completed');
        const target=Math.max(STEP_COUNTS[minutes],completeSteps.length,completeSteps.filter(step=>step.item.type==='reading').length*4);
        // Keep completed work. Restrict reading to a quarter even after shortening.
        let kept=[...completeSteps];
        const pending=session.steps.filter(step=>step.status!=='completed').sort((a,b)=>(a.id===currentId?-1:b.id===currentId?1:0));
        for(const step of pending){if(kept.length>=target)break;if(step.item.type==='reading' && kept.filter(s=>s.item.type==='reading').length>=Math.floor(target/4))continue;kept.push(step);}
        if(kept.filter(s=>s.item.type==='reading').length>Math.floor(kept.length/4))throw Error('Keep a little more active recall before choosing that shorter version.');
        const ids=new Set(kept.map(s=>s.id));session.steps=session.steps.filter(s=>ids.has(s.id));
        session.shortenedFrom=session.shortenedFrom||session.duration;session.duration=minutes;
        session.roundSize=minutes>=30?8:STEP_COUNTS[minutes];session.breakSeconds=minutes>=30?60:0;
        const currentIndex=session.steps.findIndex(s=>s.id===currentId);
        session.index=currentIndex>=0?currentIndex:session.steps.findIndex(s=>s.status!=='completed');
        if(session.index<0)session.index=session.steps.length;
        session.status='in-progress';return touch(session);
      },
      resume(id){sync();const session=sessionFor(id);state.currentSessionId=session.id;if(session.status!=='completed')session.status='in-progress';return touch(session);},
      summary, dayKey,
      status(date=now()){
        sync();const day=dayKey(date);
        const completed=Object.values(state.sessions).filter(session=>session.creditDay===day && session.creditedAt);
        const today=Object.values(state.sessions).filter(session=>dayKey(session.updatedAt)===day && !session.creditedAt).sort((a,b)=>b.updatedAt-a.updatedAt);
        const recordedActivity=Object.values(state.events).some(event=>dayKey(event.at)===day)||Object.values(state.sessions).some(session=>dayKey(session.createdAt)===day);
        let value=completed.length?'completed':state.days[day]?.skipAt?'skipped today':today[0]?.status==='saved'?'saved for later':today.length||recordedActivity?'in progress':'not started';
        return {state:value,day,completedSessions:completed.map(s=>s.id),selfReported:Object.values(state.checkins).filter(c=>dayKey(c.at)===day)};
      },
      weekly(date=now()){
        const end=dayKey(date), noon=Date.parse(end+'T12:00:00Z');
        return Array.from({length:7},(_,i)=>api.status(noon-(6-i)*DAY_MS));
      },
      skipToday(){sync();const day=dayKey(now());state.days[day]={skipAt:now(),updatedAt:timeStamp()};save();return api.status();},
      undoSkipToday(){sync();const day=dayKey(now());state.days[day]={skipAt:null,updatedAt:timeStamp()};save();return api.status();},
      setFlag(kind,id,value,label=''){
        sync();flagKey(kind,id);state.flags[kind][id]={value:!!value,label:String(label).slice(0,200),at:timeStamp(),automatic:false};save();return !!value;
      },
      isFlagged(kind,id){flagKey(kind,id);return !!state.flags[kind][id]?.value;},
      historyFor, reasonFor,
      seedLegacyHistory(pool, legacy){
        sync();let changed=false;const items=legacy?.items||legacy||{};
        for(const item of pool||[]){const previous=items[item.id]||items[item.sourceId];if(!previous||state.legacy[item.id])continue;
          state.legacy[item.id]={correct:typeof previous.correct==='boolean'?previous.correct:null,confidence:['known','again','unsure'].includes(previous.confidence)?previous.confidence:null,lastRecallAt:null,dateKnown:false,source:'existing web study',recordedAt:now()};changed=true;}
        if(changed)save();return changed;
      },
      recordExternalAttempt(item,result={}){
        sync();const entry=snapshot(item);const at=finiteTime(result.at)?Number(result.at):now();
        if(typeof result.correct!=='boolean'&&!['known','again','unsure'].includes(result.confidence))return false;
        const id='external:'+entry.id+':'+at;
        state.events[id]={id,kind:'recall',itemId:entry.id,topicId:entry.topicId,at,correct:typeof result.correct==='boolean'?result.correct:null,confidence:['known','again','unsure'].includes(result.confidence)?result.confidence:null,dontKnow:!!result.dontKnow,source:'existing-web'};
        if(result.correct===false||result.dontKnow||['again','unsure'].includes(result.confidence))state.flags.item[entry.id]={value:true,label:entry.task,at:timeStamp(),automatic:true};
        save();return true;
      },
      flagIssue(note,id){sync();const session=id?sessionFor(id):state.currentSessionId?sessionFor():null;const step=session?.steps[session.index];const issue={id:uid('issue'),note:String(note||'Please review this item.').trim().slice(0,2000),itemId:step?.item.id||null,sessionId:session?.id||null,source:step?.item.source||null,at:now(),resolved:false};state.issues[issue.id]=issue;save();return clone(issue);},
      checkIn(kind,minutes){sync();if(!['anki','workbook','other'].includes(kind))throw Error('Choose the type of self-reported practice.');const item={id:uid('checkin'),kind,minutes:Number.isFinite(Number(minutes))?Math.max(0,Math.min(600,Number(minutes))):null,at:now(),selfReported:true};state.checkins[item.id]=item;save();return clone(item);},
      tickActive(milliseconds,id){const amount=Math.min(30000,Math.max(0,Number(milliseconds)||0));if(!amount)return api.getSession(id);const session=mutable(id);if(session.status!=='in-progress')return clone(session);session.activeMs+=amount;return touch(session);},
      backup(){sync();return JSON.stringify({format:'italian-daily-focus',version:1,exportedAt:now(),timeZone:'Europe/London',state},null,2);},
      restore(input){
        if(typeof input!=='string'||input.length>20000000)throw Error('Choose a Daily Focus backup smaller than 20 MB.');
        let data;try{data=plain(JSON.parse(input));}catch(error){throw Error(error.message.includes('backup')?error.message:'This file is not a valid Daily Focus backup.');}
        if(data.format!=='italian-daily-focus'||data.version!==1)throw Error('Choose a Daily Focus version 1 backup.');
        const incoming=validateState(data.state);sync();const merged=validateState(mergeStates(state,incoming));state=merged;save();return{sessions:Object.keys(state.sessions).length,events:Object.keys(state.events).length,merged:true};
      },
      subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
    };
    if(options.listen!==false&&root.addEventListener)root.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY)return;sync();for(const listener of listeners){try{listener(clone(state));}catch{}}});
    return api;
  }
  const api=createEngine();
  api.createEngine=createEngine;
  return api;
});
