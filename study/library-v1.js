/* Lesson-first catalogue and safe context links over canonical exercise identities. */
(function(root){'use strict';
const M=root.ItalianLibraryMap;if(!M)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\s*\u2014\s*/g,': ');
const pair=(en,it)=>'<span class="editorial-label"><span lang="en" class="editorial-label-main">'+esc(clean(en))+'</span><span lang="it" class="editorial-label-sub">'+esc(clean(it||root.ItalianUI?.translate(en,'it')||en))+'</span></span>';
const get=(k,def={})=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')||def;}catch(_){return def;}};
const put=(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v));}catch(_){}};
let DATA=[],sets={},current=null;
// Translate only authored task instructions. English recall targets and Italian answers stay intact.
function questionCopy(q){
 let en=q.prompt.replace(/<b>(Napoli|Italia):/g,'<b>$1</b>:');
 let it=en;
 const swaps=[
  ['Write “My name is Marco” using ', 'Scrivi “My name is Marco” usando '],
  ['Ask one person informally for their name, using ', 'Chiedi il nome a una persona in modo informale, usando '],
  ['Ask one person formally for their name, using ', 'Chiedi il nome a una persona in modo formale, usando '],
  ['Choose the <b>formal</b> way to ask one person their name.', 'Scegli la forma <b>formale</b> per chiedere il nome a una persona.'],
  ['Choose the <b>informal</b> way to ask one person their name.', 'Scegli la forma <b>informale</b> per chiedere il nome a una persona.'],
  ['Replace tu with formal Lei: ', 'Sostituisci tu con il Lei formale: '],
  ['Replace formal Lei with tu: ', 'Sostituisci il Lei formale con tu: '],
  ['Complete the informal question: ', 'Completa la domanda informale: '],
  ['Complete the formal question: ', 'Completa la domanda formale: '],
  [' Use stare.', ' Usa stare.'],
  ['Write the Italian letter name for ', 'Scrivi il nome italiano della lettera '],
  ['Spell <b>LUCA</b> using Italian letter names, separated by spaces.', 'Scrivi i nomi italiani delle lettere di <b>LUCA</b>, separati da spazi.'],
  ['Complete the Italian word meaning ', 'Completa la parola italiana che significa '],
  ['Write only the definite article (“the”): ', 'Scrivi solo l’articolo determinativo (“the”): '],
  ['Write only the indefinite article (“a/an”): ', 'Scrivi solo l’articolo indeterminativo (“a/an”): '],
  ['Give the complete <b>io</b> reply using ', 'Scrivi la risposta completa con <b>io</b>, usando '],
  ['</b> and <b>', '</b> e <b>'],
  ['Complete with the preposition: ', 'Completa con la preposizione: '],
  ['Join these syllables into the country name: ', 'Unisci le sillabe per formare il nome del paese: '],
  ['Two male speakers: ', 'Due persone di genere maschile: '],
  ['Two female speakers: ', 'Due persone di genere femminile: '],
  [' Use italiano.', ' Usa italiano.'],
  [' Use inglese.', ' Usa inglese.'],
  [' Write the word meaning “or”.', ' Scrivi la parola che significa “or”.'],
  ['Rewrite the complete sentence, spelling the numbers: ', 'Riscrivi la frase completa con i numeri in lettere: '],
  ['Use avere: ', 'Usa avere: '],
  ['Write the complete sentence: ', 'Scrivi la frase completa: '],
  [' Use io and non.', ' Usa io e non.'],
  [' Use io.', ' Usa io.'],
  ['Make the whole phrase plural: ', 'Trasforma l’intera espressione al plurale: '],
  ['Write only the definite plural article: ', 'Scrivi solo l’articolo determinativo plurale: '],
  ['Make the whole phrase singular: ', 'Trasforma l’intera espressione al singolare: '],
  ['Correct <b>', 'Correggi <b>'],
  ['. Keep the worksheet meaning: ', '. Mantieni il significato indicato nel compito: '],
  ['Write the partitive meaning ', 'Scrivi il partitivo che significa '],
  ['Translate using ', 'Traduci usando '],
  ['Write the phrase from the essere reference: ', 'Scrivi la frase dalla guida a essere: '],
  ['Change only the exact quantity into “some”: ', 'Sostituisci solo la quantità precisa con “some”: '],
  ['Which sentence means ', 'Quale frase significa ']
 ];
 if(en.includes('editorial-label')){
  en=en.replace('Riordina il dialogo. Formal introductions','Riordina il dialogo. Presentazioni formali')
       .replace('Riordina il dialogo. Informal conversation','Riordina il dialogo. Conversazione informale')
       .replace('Riordina il dialogo. Formal conversation','Riordina il dialogo. Conversazione formale');
  return {...q,prompt:en};
 }
 for(const [from,to] of swaps)it=it.replaceAll(from,to);
 return {...q,prompt:it===en?en:'<span class="editorial-label"><span class="editorial-label-main" lang="en">'+en+'</span><span class="editorial-label-sub" lang="it">'+it+'</span></span>'};
}
function enhance(data){
 DATA=data.concat((root.ItalianLibraryContent?.sheets||[]).map(s=>({...s,questions:s.questions.map(questionCopy)})));
 sets={};
 for(const sheet of DATA){const names=M.labels[sheet.slug];sets[sheet.slug]={id:sheet.slug,sheet:sheet.slug,title:names?.[0]||sheet.title,it:names?.[1]||sheet.titleIt||root.ItalianUI?.translate(sheet.title,'it')||sheet.title,indices:sheet.questions.map((_,i)=>i),kind:sheet.sourceKind||(/homework|gaps|translation|matching/.test(sheet.slug)?'Homework':sheet.practice?'Extra practice':'Class practice')};}
 for(const [id,s] of Object.entries(M.subsets))sets[id]={...s,id};
 sets['di-da-dove-pronouns'].indices=[0,3,4,5,8,9,1,2,6,7];
 root.ItalianUILibraryMessages=root.ItalianUILibraryMessages||{};for(const s of DATA)if(s.titleIt)root.ItalianUILibraryMessages[s.title]=s.titleIt;for(const t of M.topics)root.ItalianUILibraryMessages[t.title]=t.it;for(const l of M.lessons)root.ItalianUILibraryMessages[l.title]=l.it;for(const label of Object.values(M.labels))root.ItalianUILibraryMessages[label[0]]=label[1];for(const sub of Object.values(M.subsets))root.ItalianUILibraryMessages[sub.title]=sub.it;
 root.ItalianStudyData=DATA;return DATA;
}
function topicSets(topic,lesson){return (M.lessonSets[lesson+':'+topic.id]||topic.sets).filter(id=>sets[id]);}
function href(setId,lesson,topic,browse='lesson',stage){const s=sets[setId];const u=new URL('study-sheets.html',location.href);u.search='';u.searchParams.set('mode','learn');u.searchParams.set('browse',browse);if(lesson)u.searchParams.set('lesson',lesson);if(topic)u.searchParams.set('topic',topic);if(s){u.searchParams.set('sheet',s.sheet);u.searchParams.set('set',s.id);}if(stage)u.searchParams.set('stage',stage);return u.pathname+u.search;}
function libraryURL(lesson,browse='lesson'){const u=new URL('study-sheets.html',location.href);u.search='?mode=learn&browse='+browse;if(lesson&&browse==='lesson')u.searchParams.set('lesson',lesson);return u.pathname+u.search;}
function questionKeys(id){const s=sets[id];return s?s.indices.map(i=>s.sheet+'-q'+(i+1)):[];}
function stats(id){const keys=questionKeys(id),a=get('italianCourseSessionProgressV2').study?.answers||{};return {total:keys.length,done:keys.filter(k=>a[k]?.result).length,correct:keys.filter(k=>a[k]?.result==='correct').length};}
function chooseSet(topic,lesson){const ids=topicSets(topic,lesson);const resumable=ids.find(id=>{const r=get('italianStudyRoundV2:'+id);return r.keys?.length&&!r.finished;});return resumable||ids.find(id=>stats(id).done<stats(id).total)||ids[0];}
function progress(ids){const unique=new Set(ids.flatMap(questionKeys)),a=get('italianCourseSessionProgressV2').study?.answers||{};const done=[...unique].filter(k=>a[k]?.result).length;return pair(done+' / '+unique.size+' attempted',done+' / '+unique.size+' svolti');}
function topicRow(topic,lesson,browse){const ids=topicSets(topic,lesson),id=chooseSet(topic,lesson);return '<a class="library-topic-row" href="'+esc(href(id,lesson,topic.id,browse))+'" data-library-topic="'+topic.id+'"><span><strong>'+pair(topic.title,topic.it)+'</strong><small>'+pair(ids.length+' practice '+(ids.length===1?'set':'sets'),ids.length+' '+(ids.length===1?'gruppo di esercizi':'gruppi di esercizi'))+' · '+progress(ids)+'</small></span><span aria-hidden="true">›</span></a>';}
function render(nav,host,params){
 const legacy=params.get('path');let browse=params.get('browse')||((legacy==='verbs'||legacy==='all')?'topic':'lesson');if(browse!=='topic')browse='lesson';
 const lesson=M.lessons.find(l=>l.id===(params.get('lesson')||(legacy==='L6'?'L6':null)));
 document.body.classList.add('study-sheet-library','lesson-library');document.body.classList.remove('study-sheet-detail');
 nav.innerHTML='<div class="library-view-tabs" aria-label="Study library views"><a href="'+libraryURL(null,'lesson')+'"'+(browse==='lesson'?' aria-current="page"':'')+'>'+pair('By lesson','Per lezione')+'</a><a href="'+libraryURL(null,'topic')+'"'+(browse==='topic'?' aria-current="page"':'')+'>'+pair('By topic','Per argomento')+'</a></div>';
 let content='';
 if(browse==='lesson'){
  const list='<nav class="library-lessons" aria-label="Lessons">'+M.lessons.map(l=>'<a class="library-lesson-row" data-library-lesson="'+l.id+'" href="'+libraryURL(l.id)+'"'+(l.id===lesson?.id?' aria-current="page"':'')+'><span class="library-number">'+l.id.slice(1)+'</span><span><strong>'+pair(l.title,l.it)+'</strong><small><time datetime="'+l.date+'">'+new Date(l.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+'</time> · '+progress(l.topics.flatMap(id=>topicSets(M.topics.find(t=>t.id===id),l.id)))+'</small></span><span aria-hidden="true">›</span></a>').join('')+'</nav>';
  if(lesson){
   const topics=lesson.topics.map(id=>M.topics.find(t=>t.id===id));
   const firstTopic=topics.find(t=>topicSets(t,lesson.id).some(id=>stats(id).done<stats(id).total))||topics[0];
   content='<div class="library-layout has-lesson"><aside><h2>'+pair('Lessons','Lezioni')+'</h2>'+list+'</aside><section class="library-lesson-detail"><a class="library-mobile-back" href="'+libraryURL(null)+'">← '+pair('All lessons','Tutte le lezioni')+'</a><p class="eyebrow">'+pair('Lesson '+lesson.id.slice(1),'Lezione '+lesson.id.slice(1))+'</p><h2>'+pair(lesson.title,lesson.it)+'</h2><div class="library-actions"><a class="library-primary" href="'+href(chooseSet(firstTopic,lesson.id),lesson.id,firstTopic.id)+'">'+pair('Continue practice','Continua gli esercizi')+'</a><a href="../?page=card&lesson='+lesson.id+'">'+pair('Lesson flashcards','Carte della lezione')+'</a></div>'+topics.map(t=>topicRow(t,lesson.id,browse)).join('')+extraMarkup(lesson.extra,lesson.id,browse)+'</section></div>';
  }else content='<div class="library-view"><h2>'+pair('Choose a lesson','Scegli una lezione')+'</h2>'+list+'</div>';
 }else{
  const categories=[['conversation','Conversation','Conversazione'],['verbs','Verbs and pronouns','Verbi e pronomi'],['grammar','Articles and agreement','Articoli e concordanza'],['numbers','Numbers and age','Numeri ed età'],['sounds','Sounds and spelling','Suoni e ortografia'],['reference','Reference and mixed revision','Riferimenti e ripasso misto']];
  content='<div class="library-topic-view">'+categories.map(([id,en,it])=>'<section class="library-topic-section" id="topic-'+id+'"><h2>'+pair(en,it)+'</h2>'+M.topics.filter(t=>t.category===id).map(t=>topicRow(t,null,'topic')).join('')+'</section>').join('')+'</div>';
 }
 host.innerHTML='<div class="library-view" data-library-ready>'+content+'</div>';
 const library=libraryURL(lesson?.id,browse);
 root.ItalianStudyContext={library,lesson:lesson?.id||null,browse,libraryPage:true,breadcrumbs:[{label:'Study sheets',href:lesson?libraryURL(null):null},...(lesson?[{label:'Lesson '+lesson.id.slice(1)}]:[])]};
 document.title=(lesson?'Lesson '+lesson.id.slice(1)+' · ':'')+'Study sheets · Italian for Beginners';
 root.dispatchEvent(new Event('italian-library-ready'));root.ItalianUI?.refresh();root.ItalianCourseBoot?.ready();
}
function extraMarkup(ids,lesson,browse){if(!ids.length)return '';return '<details class="library-extras"><summary>'+pair('Extra practice','Esercizi aggiuntivi')+'</summary>'+ids.filter(id=>sets[id]).map(id=>'<a class="library-topic-row" href="'+href(id,lesson,null,browse)+'"><span><strong>'+pair(sets[id].title,sets[id].it)+'</strong><small>'+progress([id])+'</small></span><span aria-hidden="true">›</span></a>').join('')+'</details>';}
function context(active,params){
 let set=sets[params.get('set')];if(!set||set.sheet!==active.slug)set=sets[active.slug];
 const requestedLesson=params.get('lesson')||(params.get('path')==='L6'?'L6':null);
 const lesson=M.lessons.find(l=>l.id===requestedLesson);
 let topic=M.topics.find(t=>t.id===params.get('topic')&&topicSets(t,lesson?.id).includes(set.id))||M.topics.find(t=>topicSets(t,lesson?.id).includes(set.id));
 const browse=params.get('browse')==='topic'||(!lesson&&params.get('path')!=='L6')?'topic':'lesson';
 const courseLesson=lesson?.id||null;
 const related=topic?.flashcards||{lesson:'L3',deck:'02 Verb forms'};
 let flashcards={...related};
 const verbCards={
  'practice-essere':courseLesson==='L1'?['L1','05 Sentence & pattern practice']:['L6','Essere in the present'],
  'practice-avere':['L4','01 Avere - present tense'],
  'practice-venire':['L3','03 Origins & questions'],
  'practice-vivere':['L3','03 Origins & questions'],
  'practice-abitare':['L3','03 Origins & questions'],
  'practice-chiamarsi':['L1','02 Introductions'],
  'practice-stare':courseLesson==='L6'?['L6','Greetings and responses']:['L2','00 Greetings & wellbeing'],
  'practice-andare':['L6','Greetings and responses']
 };
 if(verbCards[set.id])flashcards={lesson:verbCards[set.id][0],deck:verbCards[set.id][1]};
 if(topic?.id==='partitives'&&courseLesson==='L6')flashcards={lesson:'L6',deck:'Plural partitives — revision'};
 if(topic?.id==='wellbeing'&&courseLesson==='L6')flashcards={lesson:'L6',deck:'Greetings and responses'};
 if(topic?.id==='age'&&set.sheet==='l6-age-dialogue')flashcards={lesson:'L6',deck:'Age and introductions'};
 if(topic?.id==='partitives'&&courseLesson==='L4')flashcards={lesson:'L4',deck:'06 Plural articles'};
 if(topic?.id==='plurals'&&courseLesson==='L4')flashcards={lesson:'L4',deck:'05 Plural formation'};
 if(topic?.id==='silent-h'&&courseLesson==='L5')flashcards={lesson:'L5',deck:'01 Avere and silent H'};
 if(topic?.id==='family'&&courseLesson==='L5')flashcards={lesson:'L5',deck:'04 Family numbers and quantity'};
 if(set.id==='class2-definite-articles')flashcards={lesson:'L2',deck:'04 Gender, number & definite articles'};
 if(set.id==='class2-indefinite-articles')flashcards={lesson:'L2',deck:'05 Indefinite & plural articles'};
 const ids=topic?topicSets(topic,courseLesson):[set.id];
 let nextId=ids[ids.indexOf(set.id)+1];
 if(!nextId&&lesson&&topic){const following=M.topics.find(t=>t.id===lesson.topics[lesson.topics.indexOf(topic.id)+1]);if(following)nextId=topicSets(following,lesson.id)[0];}
 const nextTopic=nextId&&M.topics.find(t=>topicSets(t,courseLesson).includes(nextId));
 const flash='../?page=card&lesson='+flashcards.lesson+'&topic='+encodeURIComponent(flashcards.deck);
 current={slug:active.slug,topic:topic?.id||active.slug,coursePath:!!lesson,lesson:courseLesson,browse,set,scopeIndices:set.indices,groups:ids.map(id=>sets[id]),library:libraryURL(courseLesson,browse),flashcards:flash,
  flashcardTarget:flashcards,next:nextId?{href:href(nextId,courseLesson,nextTopic?.id,browse),title:sets[nextId].title}:null,
  breadcrumbs:[{label:'Study sheets',href:libraryURL(null,browse)},...(lesson?[{label:'Lesson '+lesson.id.slice(1),href:libraryURL(lesson.id)}]:[]),{label:topic?.title||clean(active.title)}]};
 return current;
}
function detailNav(nav,ctx){
 const label=ctx.lesson?'Lesson '+ctx.lesson.slice(1):'By topic';
 nav.innerHTML='<div class="library-detail-bar"><a href="'+ctx.library+'">← '+pair(label,label.startsWith('Lesson')?'Lezione '+ctx.lesson.slice(1):'Per argomento')+'</a><a data-related-flashcards href="'+ctx.flashcards+'">'+pair('Related flashcards','Carte collegate')+'</a></div>';
}
function mountDetail(article){if(!current||article.dataset.libraryDetail)return;article.dataset.libraryDetail='ready';
 const quiz=article.querySelector('[data-study-quiz]');if(!quiz)return;
 const bar=document.createElement('div');bar.className='library-set-controls';
 bar.innerHTML='<label for="librarySetPicker">'+pair('Practice set','Gruppo di esercizi')+'</label><select id="librarySetPicker">'+current.groups.map(s=>'<option value="'+s.id+'"'+(s.id===current.set.id?' selected':'')+'>'+esc(clean(s.title))+'</option>').join('')+'</select><div class="library-round-buttons"><button type="button" data-library-round="quick">'+pair('Quick practice','Esercizi rapidi')+'</button><button type="button" data-library-round="full">'+pair('Full exercise set','Tutti gli esercizi')+'</button></div><p class="library-round-label" aria-live="polite"></p>';
 quiz.prepend(bar);
 bar.querySelector('select').addEventListener('change',e=>{location.href=href(e.target.value,current.lesson,current.topic,current.browse);});
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-library-round]');if(b)root.ItalianGuidedStudy?.newRound(b.dataset.libraryRound);});
 const connections=document.createElement('details');connections.className='library-connections';
 connections.innerHTML='<summary>'+pair('Helpful connections','Collegamenti utili')+'</summary><p>'+pair('Revisit these ideas across lessons. Plural forms and “some” stay available as you build complete sentences.','Ripassa questi concetti nelle lezioni. Plurali e partitivi restano disponibili mentre costruisci frasi complete.')+'</p><div class="library-actions"><a href="'+href('practice-things-pronouns',current.lesson,'pronouns',current.browse,'learn')+'">'+pair('Pronouns and plural forms','Pronomi e plurali')+'</a><a href="'+href('connected-partitives',current.lesson,'partitives',current.browse,'learn')+'">'+pair('Some: articles and quantities','Articoli partitivi e quantità')+'</a><a href="'+href('known-verbs-and-forms',current.lesson,'references',current.browse,'learn')+'">'+pair('Verb reference','Guida ai verbi')+'</a></div>';
 const learn=article.querySelector('[data-study-stage=learn]')||article.querySelector(':scope>section.panel');learn?.appendChild(connections);
 const groups=article.querySelector('.study-practice-picker');if(groups)groups.hidden=true;
 const old=article.querySelector('.study-practice-links');if(old)old.hidden=true;
 const title=article.querySelector('header.hero h1');if(title)title.innerHTML=pair(current.set.title,current.set.it);
 const lead=article.querySelector('header.hero .lead'),kinds={'Adapted practice':'Esercizi adattati','Homework':'Compiti','Adapted homework':'Compiti adattati','Adapted classroom exercise':'Esercizio in classe adattato','Class practice':'Esercizi in classe','Extra practice':'Esercizi aggiuntivi'};
 if(lead&&kinds[lead.textContent.trim()])lead.innerHTML=pair(lead.textContent.trim(),kinds[lead.textContent.trim()]);
 const finish=article.querySelector('.guided-sheet-finish');
 if(finish){
  const restart=document.createElement('div');restart.className='library-finish-rounds';
  restart.innerHTML='<h3>'+pair('Start another round','Inizia un altro giro')+'</h3><div class="library-round-buttons"><button type="button" data-library-finish-round="quick">'+pair('Quick practice','Esercizi rapidi')+'</button><button type="button" data-library-finish-round="full">'+pair('Full exercise set','Tutti gli esercizi')+'</button></div>';
  restart.addEventListener('click',e=>{const b=e.target.closest('[data-library-finish-round]');if(b)root.ItalianGuidedStudy?.newRound(b.dataset.libraryFinishRound);});finish.append(restart);
 }
 root.ItalianUI?.refresh();
}
document.addEventListener('click',e=>{const link=e.target.closest('[data-related-flashcards]');if(!link)return;
 root.ItalianStudyPersistence?.captureAll();root.ItalianGuidedStudy?.remember();
 const path=location.pathname+location.search;put('italianStudyReturnV1',{path,scrollY:root.scrollY,at:Date.now()});
 const url=new URL(link.href);url.searchParams.set('studyReturn',path);link.href=url.pathname+url.search;
});
function register(){const host=document.getElementById('studySheets');if(!host)return;new MutationObserver(()=>{const a=host.querySelector('.study-pack-sheet[data-guided-pilot=ready]');if(a)mountDetail(a);}).observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['data-guided-pilot']});}
root.ItalianStudyLibrary={enhance,render,context,detailNav,mountDetail,href,questionKeys,stats,sets:()=>sets,map:M,pair,clean,get,put};
register();
})(window);
