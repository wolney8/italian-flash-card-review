/* Read-only adapters over the approved course banks. No new lesson/card identities. */
const root = window;
const base = new URL('.', import.meta.url);
const titles = Object.freeze({
  articles:'Articles', sounds:'Sounds and spelling', prepositions:'In, on and from',
  verbs:'Verb forms', questions:'Questions and classroom phrases', objects:'Subjects and objects',
  conversation:'Everyday conversation', numbers:'Numbers'
});
// A short reminder must make sense without its surrounding worksheet, table or picture.
// These are existing source bullets, selected by location rather than rewriting their text.
const reminders = Object.freeze({
  'conversation-foundations':{'2:0':'conversation','2:1':'verbs','2:3':'conversation'},
  'subject-pronouns-present-tense':{'2:0':'verbs','2:1':'verbs','2:2':'verbs'},
  'known-verbs-and-forms':{'4:4':'verbs','4:5':'verbs'},
  'word-jobs-sentence-building':{'2:1':'articles','2:2':'prepositions'},
  'plural-articles':{'2:0':'articles','2:2':'articles','2:3':'articles'},
  'c-g-sounds-and-spelling':{'2:0':'sounds','2:1':'sounds'},
  'l6-essere-class':{'1:0':'verbs','1:1':'verbs','1:2':'verbs','1:3':'verbs'},
  'l6-number-patterns':{'0:0':'numbers','1:0':'numbers','3:0':'numbers'},
  'l7-class-lavorare':{'0:0':'verbs','0:1':'verbs','0:3':'verbs'},
  'l7-families':{'0:0':'verbs','0:1':'verbs'},
  'l7-connected':{'0:0':'verbs','0:1':'verbs','0:2':'articles'},
  'class1-greetings':{'0:0':'conversation'},
  'class1-introductions':{'0:0':'conversation'},
  'class1-register':{'0:0':'conversation'},
  'class2-c-sounds':{'0:0':'sounds'},
  'class2-g-sounds':{'0:0':'sounds'},
  'class2-definite-articles':{'0:0':'articles'},
  'class2-indefinite-articles':{'0:0':'articles'},
  'class3-complete-replies':{'0:0':'conversation'},
  'class3-nationality':{'0:0':'conversation'},
  'class4-avere-class':{'0:0':'verbs'},
  'class4-family':{'0:0':'conversation'},
  'class5-plurals-a':{'0:1':'articles'},
  'connected-partitives':{'0:0':'articles'},
  'l8-verb-tables':{'0:0':'verbs','0:2':'verbs'},
  'l8-verb-choices':{'0:0':'verbs'},
  'l8-work-dialogue':{'0:0':'conversation','0:1':'conversation'},
  'l8-mixed-verbs':{'0:0':'verbs','0:1':'verbs'},
  'l8-grammar-in-context':{'0:0':'objects','0:1':'objects','0:2':'questions','0:3':'objects','0:4':'objects','0:5':'objects','0:6':'objects','0:7':'objects'},
  'l8-pronunciation-practice':{'0:0':'sounds','0:1':'sounds'},
  'l8-articles-in-context':{'0:0':'articles','0:1':'articles','0:2':'articles','0:3':'articles'}
});
let poolCache;

function topicFor(value) {
  const text = String(value || '').toLowerCase();
  if (/article|partitiv|plural|singolare/.test(text)) return 'articles';
  if (/preposition|^(?:\d+\s+)?(?:in the|on the|from the)(?:\s*[,/·]|$)/.test(text)) return 'prepositions';
  if (/sound|pronunc|phonetic|alphabet|spelling|silent.h|town.code|(?:^|[- ])(?:c|g)[- ]columns/.test(text)) return 'sounds';
  if (/number|calculation/.test(text)) return 'numbers';
  if (/useful.question|question.word|classroom|^questions/.test(text)) return 'questions';
  if (/object|word.jobs|grammar.in.context/.test(text)) return 'objects';
  if (/verb|pronoun|essere|avere|fare|stare|venire|andare|chiamarsi|lavorare|parlare|studiare|mangiare|vivere|abitare|negative|^l9-|^l7-(?:class|homework|endings|families|connected)|^l6-recap/.test(text)) return 'verbs';
  return 'conversation';
}
function topicForSheet(sheet) { return topicFor(typeof sheet === 'string' ? sheet : sheet.slug); }
function topicForCard(card,preparedTask) {
  const authored=root.ItalianLesson8CardTasks?.get(card.key) || root.ItalianEarlyCardTasks?.get(card);
  const instruction=String(card.prompt || '').match(/class=["'][^"']*\binstruction\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i)?.[1] || '';
  const task=String(preparedTask || authored?.task || card.task || instruction).replace(/<[^>]*>/g,' ').toLowerCase();
  const cue=String(card.prompt || '')+' '+JSON.stringify(authored?.stimulus || card.cues || []);
  // A mixed deck title must not override what this specific card asks the learner to do.
  if(/\b(?:pronounce|pronunciation|spelling|soft sound|hard sound|letter name|sound of)\b/.test(task))return 'sounds';
  if(/\b(?:direct object|indirect object|subject complement|transitive|intransitive)\b/.test(task))return 'objects';
  if(/\b(?:combine|join)\b/.test(task) && /\b(?:in|su|da|di|a)\s*\+\s*(?:il|lo|la|l[’']|i|gli|le)\b/i.test(cue))return 'prepositions';
  if(/\b(?:definite|indefinite|partitive|article)\b/.test(task))return 'articles';
  const names=new Set(['essere','avere','fare','stare','venire','andare','chiamarsi','lavorare',...(root.ItalianDailyVerbs?.verbs || []).map(verb=>verb.name)]);
  if(/\b(?:conjugat\w*|present form|verb form|infinitive)\b/.test(task))return 'verbs';
  if(/\b(?:use|using|form of)\s+([\p{L}]+)/gu.test(task)){
    for(const match of task.matchAll(/\b(?:use|using|form of)\s+([\p{L}]+)/gu))if(names.has(match[1]))return 'verbs';
  }
  return topicFor(card.deck || card.key);
}
function textOf(html) {
  const doc = new DOMParser().parseFromString(String(html || '').replace(/<br\s*\/?\s*>/gi,'\n'), 'text/html');
  doc.querySelectorAll('.editorial-label-sub,script,style,button,img,audio,video').forEach(el=>el.remove());
  return (doc.body.textContent || '').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();
}
function readingLines(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  doc.querySelectorAll('.editorial-label-sub,script,style,button,img,audio,video').forEach(el=>el.remove());
  const lines = [];
  function walk(node, lang='en') {
    if (node.nodeType === 3) {
      const text = (node.textContent || '').replace(/\s+/g,' ').trim();
      if (text) lines.push({text,lang:lang.startsWith('it')?'it':'en'});
      return;
    }
    const language = node.getAttribute?.('lang') || lang;
    for (const child of node.childNodes || []) walk(child,language);
  }
  walk(doc.body);
  return lines;
}
const clone = value => JSON.parse(JSON.stringify(value));
const sourceText = source => typeof source === 'string' ? source : source ? [source.label,source.file,source.location].filter(Boolean).join(' · ') : '';
const goodText = value => typeof value === 'string' && value.trim() && !/[\u2014]/.test(value);

async function ensure(check,path,classic=false) {
  if (check()) return;
  const url = new URL(path,base).href;
  if (classic) {
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=url;
      script.onload=resolve;script.onerror=()=>reject(new Error('Could not load approved course content.'));
      document.head.append(script);
    });
  } else await import(url);
  if (!check()) throw new Error('The approved course content is unavailable.');
}
async function dependencies() {
  await Promise.all([
    ensure(()=>root.ItalianDailyVerbs,'daily-verbs.js?v=20261125language'),
    ensure(()=>root.ItalianDailyPatterns,'daily-patterns.js'),
    ensure(()=>root.ItalianDailyPhrases,'daily-phrases.js'),
    ensure(()=>root.ItalianLibraryContent,'library-content-v1.js?v=20261111library'),
    ensure(()=>root.ItalianPracticeBank,'practice-bank-v1.js?v=20261111library'),
    ensure(()=>root.ItalianPracticeOptions,'practice-options-v1.js?v=20261111r1'),
    ensure(()=>root.ITALIAN_L6,'../lesson6/content.js?v=20261109numbers'),
    ensure(()=>root.ITALIAN_L7,'../lesson7/content.js?v=20261116infinitive'),
    ensure(()=>root.ItalianLesson8,'../lesson8-practice/content.js?v=20261121',true)
  ]);
  await ensure(()=>root.ItalianVerbReference,'verb-reference-v1.js?v=20261125cards');
  await ensure(()=>root.ItalianLesson8.buildCoreSheets,'../lesson8-practice/core-study.js?v=20261123');
  await ensure(()=>root.ItalianLesson8.sheets,'../lesson8-practice/study.js?v=20261121');
}
async function baseSheets() {
  const response = await fetch(new URL('study-sheets-v5.js?v=20261111s1',base));
  if (!response.ok) throw new Error('Could not load the approved study-sheet catalogue.');
  const packed = (await response.text()).match(/const B="([^"]+)"/);
  if (!packed) throw new Error('The study-sheet catalogue format has changed.');
  const bytes = Uint8Array.from(atob(packed[1]),letter=>letter.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}
async function allSheets() {
  if (root.ItalianStudyData?.length) return clone(root.ItalianStudyData);
  const initial = (await baseSheets()).concat(root.ITALIAN_L6.sheets || [],root.ITALIAN_L7.sheets || [],root.ITALIAN_L7.lesson6Supplements?.sheets || []);
  const enhanced = root.ItalianPracticeBank.enhance(initial,[],root.ItalianPracticeOptions,root.ItalianVerbReference.verbs);
  const rows = enhanced.concat(root.ItalianLibraryContent.sheets || [],root.ItalianLesson8.sheets || [],root.ItalianLesson9?.sheets || []);
  return [...new Map(rows.map(sheet=>[sheet.slug,sheet])).values()];
}
async function waitForCards() {
  const ready=()=>root.__COURSE_DATA_READY__ && (!root.ItalianLesson9 || root.__LESSON9_READY__) && root.ItalianFlashcards?.cardList('L1')?.length;
  if(ready())return;
  await new Promise((resolve,reject)=>{
    let timeout;
    const finish=()=>{
      if(!ready())return;
      clearTimeout(timeout);root.removeEventListener('italian-course-data-ready',finish);resolve();
    };
    root.addEventListener('italian-course-data-ready',finish);
    timeout=setTimeout(()=>{
      root.removeEventListener('italian-course-data-ready',finish);
      reject(new Error('The flashcards are still loading. Please try Daily Focus again.'));
    },20000);
    finish();
  });
}
function dailyQuestion(q,topicId,verb) {
  const answers = [q.answer,...(q.answers || [])];
  if (q.skill === 'ending') answers.push('-'+q.answer);
  if (q.skill === 'whole') {
    const subject = q.stimulus?.find(row=>row.label==='Subject' && row.lang==='it');
    if (subject) answers.push(subject.text+' '+q.answer);
  }
  const source = q.source || verb?.source || {kind:'approved-practice',file:topicId==='verbs'?'study/daily-verbs.js':topicId==='questions'||topicId==='objects'?'study/daily-phrases.js':'study/daily-patterns.js',label:'Existing approved daily practice'};
  return {
    id:'daily:'+q.id,sourceId:q.id,aliases:[q.id],topicId,topicTitle:titles[topicId],type:'question',
    task:q.task,stimulus:clone(q.stimulus || []),answer:q.answer,answers:[...new Set(answers)],
    answerLang:q.answerLang || 'it',choices:q.choices?.slice() || [],hint:q.hint || '',explanation:q.explanation || '',
    source:clone(source),sourceLabel:sourceText(source),origin:'daily-practice',skill:q.skill || '',
    verbName:verb?.name || '',difficulty:q.choices?.length?'gentle':q.skill==='phrase'?'challenge':'standard',timeSeconds:25,
    originalUrl:'?page=daily-practice',contentVersion:'daily-focus-adapter-1'
  };
}
function sheetQuestion(q,sheet,index) {
  // Long tables, group matching, ordering, pictures and external listening are separate activities.
  if (!['text','choice'].includes(q.type) || q.stimulusHtml || /<(?:img|audio|video)\b/i.test(q.prompt || '') || /\b(listen to|look at the picture|follow the.*maze)\b/i.test(q.task || '')) return null;
  const id=q.id || sheet.slug+'-q'+(index+1),answer=q.model || q.answers?.[0];
  if (!goodText(q.task) || !goodText(answer) || answer.length>200 || q.task.length>300 || !Array.isArray(q.stimulus)) return null;
  const topicId=topicForSheet(sheet),hint=textOf(q.support?.hint?.en || q.hint || '');
  const lines=q.support?.lines?.map(line=>({it:line.it || '',en:line.en || ''})) || [];
  const explanation=textOf(q.explanation || '') || lines.map(line=>[line.it,line.en].filter(Boolean).join(' = ')).join('\n') || hint;
  let source=q.source || sheet.source || {kind:sheet.sourceKind || 'approved-practice',file:'study sheet: '+sheet.slug,label:sheet.title};
  if(q.source && (q.sourcePage || q.sourceActivity || q.sourceItem))source={
    kind:sheet.sourceKind || 'approved-practice',file:q.source,
    ...(q.sourcePage?{location:'page '+q.sourcePage}:{}),
    ...(q.sourceActivity?{activity:q.sourceActivity}:{}),
    ...(q.sourceItem?{item:q.sourceItem}:{})
  };
  return {
    id:'sheet:'+id,sourceId:id,aliases:[id,sheet.slug+'-q'+(index+1)],topicId,topicTitle:titles[topicId],type:'question',
    task:q.task,stimulus:clone(q.stimulus),answer,answers:clone(q.answers || [answer]),
    answerLang:q.answerLang || 'it',choices:clone(q.choices || []),hint,explanation,supportLines:lines,
    optionalSubjects:clone(q.optional_subjects || []),answerMode:q.answer_mode || 'accent',
    source:clone(source),sourceLabel:sourceText(source),origin:'study-sheet',sheetId:sheet.slug,sheetTitle:sheet.title,
    difficulty:q.type==='choice'?'gentle':q.kind==='sentence'?'challenge':'standard',timeSeconds:30,
    originalUrl:'study/study-sheets.html?sheet='+encodeURIComponent(sheet.slug)+'&stage=practise',contentVersion:'daily-focus-adapter-1'
  };
}
function sheetReadings(sheet) {
  const allowed=reminders[sheet.slug],rows=[];
  if(!allowed)return rows;
  (sheet.study_sections || []).forEach((section,sectionIndex)=>{
    if (section.type!=='bullets' || section.stage==='examples') return;
    (section.items || []).forEach((html,itemIndex)=>{
      const topicId=allowed[sectionIndex+':'+itemIndex];
      if(!topicId)return;
      if (/<(?:img|audio|video|table)\b/i.test(html) || /(?:https?:|homework|book practice|p\. \d+|pp\. \d+)/i.test(textOf(html))) return;
      const reading=textOf(html),lines=readingLines(html);
      if (reading.length<35 || reading.length>420 || reading.split(/\s+/).length>70 || reading.includes('\u2014')) return;
      const id='reading:'+sheet.slug+':'+sectionIndex+':'+itemIndex;
      rows.push({id,sourceId:id,aliases:[],topicId,topicTitle:titles[topicId],type:'reading',
        task:'Read this short reminder.',stimulus:[],answer:'',answers:[],answerLang:'en',choices:[],hint:'',explanation:'',
        reading,readingLines:lines,source:{kind:sheet.sourceKind || 'approved-practice',file:sheet.source || sheet.slug,label:sheet.title},
        sourceLabel:sourceText(sheet.source) || sheet.title,origin:'study-sheet',sheetId:sheet.slug,sheetTitle:sheet.title,
        difficulty:'gentle',timeSeconds:25,originalUrl:'study/study-sheets.html?sheet='+encodeURIComponent(sheet.slug)+'&stage=learn',contentVersion:'daily-focus-adapter-1'});
    });
  });
  return rows;
}
function cardItem(card) {
  const front=root.ItalianCardFront?.render(card) || card.prompt || '';
  if (/<(?:img|audio|video)\b/i.test(front)) return null;
  const doc=new DOMParser().parseFromString(front,'text/html');
  doc.querySelectorAll('.editorial-label-sub,script,style').forEach(el=>el.remove());
  const authored=root.ItalianLesson8CardTasks?.get(card.key) || root.ItalianEarlyCardTasks?.get(card);
  const task=authored?.task || textOf(doc.querySelector('.instruction')?.innerHTML || '');
  let stimulus=authored?.stimulus ? clone(authored.stimulus) : [...doc.querySelectorAll('.recall-cue')].map(cue=>{
    const label=cue.querySelector('.recall-cue-label')?.textContent || '';
    const node=[...cue.children].find(el=>!el.classList.contains('recall-cue-label'));
    return {label,text:textOf(node?.innerHTML || ''),lang:node?.lang==='it'?'it':'en'};
  }).filter(cue=>cue.text);
  if (!stimulus.length) {
    const focus=doc.querySelector('.focus');
    if (focus && textOf(focus.innerHTML)) stimulus=[{text:textOf(focus.innerHTML),lang:focus.lang==='it'?'it':'en'}];
  }
  const answer=card.primaryAnswer || textOf(card.answer),hint=textOf(doc.querySelector('.clue')?.innerHTML || '');
  if (!goodText(task) || !goodText(answer) || answer.length>280 || task.length>300 || stimulus.some(row=>row.text.length>400)) return null;
  const topicId=topicForCard(card,task),meaning=textOf(card.meaning),usage=textOf(card.usage);
  return {id:'card:'+card.key,sourceId:card.key,aliases:[card.key],topicId,topicTitle:titles[topicId],type:'flashcard',
    task,stimulus,answer,answers:[answer],answerLang:card.answerLang || (card.task_kind==='concept'?'en':'it'),choices:[],hint,
    explanation:[meaning,usage].filter(Boolean).join('\n'),meaning,usage,
    source:card.reference?textOf(card.reference):'Approved flashcard '+card.key,sourceLabel:card.reference?textOf(card.reference):'Existing approved flashcard',
    origin:'flashcard',lessonId:card.lesson,deck:card.deck,difficulty:'standard',timeSeconds:25,
    originalUrl:'?page=card&lesson='+encodeURIComponent(card.lesson),contentVersion:'daily-focus-adapter-1'};
}
async function buildPool({refresh=false}={}) {
  if (poolCache && !refresh) return clone(poolCache);
  await dependencies();
  const rows=[];
  for (const verb of root.ItalianDailyVerbs.verbs) rows.push(...root.ItalianDailyVerbs.exercises(verb.name).map(q=>dailyQuestion(q,'verbs',verb)));
  for (const topic of root.ItalianDailyPatterns.topics) rows.push(...root.ItalianDailyPatterns.exercises(topic.id).map(q=>dailyQuestion(q,topic.id)));
  for (const topic of ['questions','objects']) rows.push(...root.ItalianDailyPhrases.exercises(topic).map(q=>dailyQuestion(q,topic)));
  const sheets=await allSheets();
  for (const sheet of sheets) {
    rows.push(...(sheet.questions || []).map((q,i)=>sheetQuestion(q,sheet,i)).filter(Boolean));
    rows.push(...sheetReadings(sheet));
  }
  // A direct Today link can mount before the original asynchronous card loader finishes.
  // Never cache an incomplete set that silently omits flashcard activities.
  await waitForCards();
  const seenCards=new Set();
  for (const lesson of ['L1','L2','L3','L4','L5','L6','L7','L8','PRACTICE']) {
    for (const card of root.ItalianFlashcards?.cardList(lesson) || []) {
      if (seenCards.has(card.key)) continue;
      seenCards.add(card.key);
      const item=cardItem(card);if(item)rows.push(item);
    }
  }
  poolCache=[...new Map(rows.map(item=>[item.id,item])).values()];
  return clone(poolCache);
}
function normalise(value,mode='accent') {
  let text=String(value ?? '').normalize('NFC').toLocaleLowerCase('it').replace(/[‘’]/g,"'")
    .replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
  if(mode!=='punctuation')text=text.replace(/[.!?,;:]/g,'').trim();
  return text;
}
function variants(value,subjects=[],mode='accent') {
  const valueNorm=normalise(value,mode),set=new Set([valueNorm]);
  for (const subject of subjects) {
    const prefix=normalise(subject,mode)+' ';
    if (valueNorm.startsWith(prefix)) set.add(valueNorm.slice(prefix.length));
  }
  return set;
}
function matchAnswer(item,value) {
  // Accent and apostrophe differences may change Italian meaning. Keep those meaningful.
  const mode=item.answerMode || 'accent';
  const input=variants(value,item.optionalSubjects,mode),answers=item.answers?.length?item.answers:[item.answer];
  if (!normalise(value,mode)) return false;
  return answers.some(answer=>[...variants(answer,item.optionalSubjects,mode)].some(v=>input.has(v)));
}
function safeJSON(storageKind,key,fallback={}) {try{return JSON.parse(root[storageKind]?.getItem(key)||'null') || fallback;}catch(_){return fallback;}}
function readLegacyHistory(pool=poolCache || []) {
  const current=safeJSON('sessionStorage','italianCourseSessionProgressV2');
  const saved=safeJSON('localStorage','italianLearningResumeV2');
  let prior={};try{prior=JSON.parse(saved.entries?.italianCourseSessionProgressV2 || '{}');}catch(_){}
  const confidence={...(prior.flashcards?.confidence || {}),...(current.flashcards?.confidence || {})};
  const answers={...(prior.study?.answers || {}),...(current.study?.answers || {})};
  const daily=safeJSON('localStorage','italianDailyPractice.v1'),dailyAnswers={};
  for (const session of Object.values(daily.sessions || {})) {
    (session.ids || []).forEach((id,index)=>{
      const result=session.results?.[index];
      if (result && !result.revealed && String(result.value || '').trim()) dailyAnswers[id]=result;
    });
  }
  const items={};
  for (const item of pool) {
    let entry;
    if (item.origin==='flashcard' && ['known','again','unsure'].includes(confidence[item.sourceId])) {
      entry={correct:null,confidence:confidence[item.sourceId]};
    } else if (item.origin==='study-sheet' && item.type!=='reading') {
      const result=item.aliases.map(id=>answers[id]).find(row=>['correct','wrong'].includes(row?.result));
      if(result)entry={correct:result.result==='correct',confidence:null};
    } else if (item.origin==='daily-practice' && dailyAnswers[item.sourceId]) {
      entry={correct:dailyAnswers[item.sourceId].correct===true,confidence:null};
    }
    if (entry) items[item.id]={...entry,lastRecallAt:null,at:null,dateKnown:false,source:'existing web study'};
  }
  return {items,note:'Earlier web answers and self-assessments have no reliable review dates. Page views and answer reveals are excluded.'};
}

root.ItalianDailyFocusContent={buildPool,matchAnswer,readLegacyHistory,topicForSheet,topicForCard,topicFor,titles,cardItem,sheetQuestion,normalise,version:'daily-focus-adapter-1'};
root.dispatchEvent?.(new Event('italian-daily-focus-content-ready'));
export {buildPool,matchAnswer,readLegacyHistory,topicForSheet,topicForCard};
