/* Lesson 3: singular conversations first. Same retained keys; no new cards.
   Canonical content for the web and the update-only Anki field export. */
(function(root){
'use strict';
const VERSION='2026-11-09-origins-singular-v1';
const CORE='03 Origins & questions',LATER='08 Later - plural questions',RESIDENCE='04 Residence & prepositions';
const SEQUENCE=['origin_sono_napoli','origin_di_tu','origin_di_lei','origin_vengo_napoli','origin_da_tu','origin_da_lei','reside_vivo_Napoli','liveq_vivi','liveq_vive','reside_abito_Napoli','liveq_abiti','liveq_abita','reside_vivo_Italia','reside_abito_Italia','origin_where'];
const PLURAL=['q_di_dove_siete','q_da_dove_venite','q_dove_vivete','q_dove_abitate'];
const TO_CORE=['reside_vivo_Napoli','liveq_vivi','liveq_vive','reside_abito_Napoli','liveq_abiti','liveq_abita','reside_vivo_Italia','reside_abito_Italia'];
const MOVES=Object.fromEntries([...TO_CORE.map(k=>[k,CORE]),...PLURAL.map(k=>[k,LATER]),['origin_where_is',RESIDENCE]]);
const SOURCE='<span class="source-pill course">COURSE BASIS</span> Session 3 minutes, 06.10.2026, pp.1–3: essere di, venire da, vivere/abitare; informal tu and formal Lei. Complete examples use the supplied places. The sequencing and explanatory contrasts are adapted study support.';
const verbs={
 essere:{name:'essere',gloss:'to be',frame:'essere di',job:'being from somewhere: origin',preposition:'di',place:'di Napoli',forms:['sono','sei','è'],sounds:['SOH-noh','SEH-ee','EH'],infinitive:'EHSS-seh-reh'},
 venire:{name:'venire',gloss:'to come',frame:'venire da',job:'coming from somewhere: source / origin',preposition:'da',place:'da Napoli',forms:['vengo','vieni','viene'],sounds:['VEHN-goh','VYEH-nee','VYEH-neh'],infinitive:'veh-NEE-reh'},
 vivere:{name:'vivere',gloss:'to live',frame:'vivere a / in',job:'where you live: residence',preposition:'a / in',place:'a Napoli',forms:['vivo','vivi','vive'],sounds:['VEE-voh','VEE-vee','VEE-veh'],infinitive:'VEE-veh-reh'},
 abitare:{name:'abitare',gloss:'to live / reside',frame:'abitare a / in',job:'where you live or have your home',preposition:'a / in',place:'a Napoli',forms:['abito','abiti','abita'],sounds:['AH-bee-toh','AH-bee-tee','AH-bee-tah'],infinitive:'ah-bee-TAH-reh'}
};
function e(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function guide(text){return '<span class="mini-phon">'+e(text)+'</span>';}
function pattern(v){
 const subjects=['io','tu','Lei'],english=['I','you — informal, one person','you — formal, one person'];
 return '<div class="base-rule"><strong>'+v.frame+'</strong> — '+v.job+'</div>'+ 
 '<p><strong>'+v.name+'</strong> = '+v.gloss+guide(v.infinitive)+'</p>'+ 
 '<table class="forms-table l3-singular-forms"><thead><tr><th>Person</th><th>Verb</th><th>Complete example</th></tr></thead><tbody>'+subjects.map((s,i)=>
 '<tr><td>'+s+'<small>'+english[i]+'</small></td><td>'+v.forms[i]+guide(v.sounds[i])+'</td><td lang="it">'+s+' '+v.forms[i]+' '+v.place+'.</td></tr>').join('')+
 '</tbody></table><p class="tiny">Here, Lei means polite “you”, not “she”. Practise one speaker and one listener before adding plural forms.</p>';
}
function why(v){
 if(v===verbs.essere)return 'Learn <strong>essere di</strong> as the origin pattern. In <strong>Io sono di Napoli</strong>, di links “am” to the place of origin. Replace Napoli with dove to form <strong>Di dove sei tu?</strong>.';
 if(v===verbs.venire)return 'Learn <strong>venire da</strong> as the “come from” pattern. In <strong>Io vengo da Napoli</strong>, da introduces the source. Replace Napoli with dove to form <strong>Da dove vieni tu?</strong>.';
 return '<strong>Dove</strong> means “where”. With '+v.name+', the question asks about residence, not “from where”, so it starts with <strong>Dove</strong>, not Di dove or Da dove. The answer still needs a place phrase: <strong>a Napoli</strong> or <strong>in Italia</strong>.';
}
function reply(q,qen,qs,a,aen,as){return '<div class="l3-dialogue"><div><span class="field-heading">Question</span><p lang="it">'+e(q)+'</p>'+guide(qs)+'<small>'+e(qen)+'</small></div><div><span class="field-heading">Complete reply</span><p lang="it">'+e(a)+'</p>'+guide(as)+'<small>'+e(aen)+'</small></div></div><p>The question addresses <strong>tu</strong> or formal <strong>Lei</strong>. The person answering speaks about themselves with <strong>io</strong>. The reply is a complete example, not a claim about your own birthplace or home.</p>';}
const prompts={
 origin_sono_napoli:['essere','Say this in Italian:','I am from Naples.','Use essere and io. Fictional speaker.'],
 origin_di_tu:['essere','Ask one person informally:','Where are you from?','Use essere and tu.'],
 origin_di_lei:['essere','Ask one person formally:','Where are you from?','Use essere and formal Lei.'],
 origin_vengo_napoli:['venire','Say this in Italian:','I come from Naples.','Use venire and io. Fictional speaker.'],
 origin_da_tu:['venire','Ask one person informally:','Where do you come from?','Use venire and tu.'],
 origin_da_lei:['venire','Ask one person formally:','Where do you come from?','Use venire and formal Lei.'],
 reside_vivo_Napoli:['vivere','Say this in Italian:','I live in Naples.','Use vivere and io. Fictional speaker.'],
 liveq_vivi:['vivere','Ask one person informally:','Where do you live?','Use vivere and tu.'],
 liveq_vive:['vivere','Ask one person formally:','Where do you live?','Use vivere and formal Lei.'],
 reside_abito_Napoli:['abitare','Say this in Italian:','I live in Naples.','Use abitare and io. Fictional speaker.'],
 liveq_abiti:['abitare','Ask one person informally:','Where do you live?','Use abitare and tu.'],
 liveq_abita:['abitare','Ask one person formally:','Where do you live?','Use abitare and formal Lei.'],
 reside_vivo_Italia:['vivere','Say this in Italian:','I live in Italy.','Use vivere and io. Fictional speaker.'],
 reside_abito_Italia:['abitare','Say this in Italian:','I live in Italy.','Use abitare and io. Fictional speaker.']
};
const QA={
 origin_di_tu:['Di dove sei tu?','Where are you from? — informal','dee DOH-veh SEH-ee too','Io sono di Napoli.','I am from Naples.','EE-oh SOH-noh dee NAH-poh-lee'],
 origin_di_lei:['Di dove è Lei?','Where are you from? — formal','dee DOH-veh EH LEH-ee','Io sono di Napoli.','I am from Naples.','EE-oh SOH-noh dee NAH-poh-lee'],
 origin_da_tu:['Da dove vieni tu?','Where do you come from? — informal','dah DOH-veh VYEH-nee too','Io vengo da Napoli.','I come from Naples.','EE-oh VEHN-goh dah NAH-poh-lee'],
 origin_da_lei:['Da dove viene Lei?','Where do you come from? — formal','dah DOH-veh VYEH-neh LEH-ee','Io vengo da Napoli.','I come from Naples.','EE-oh VEHN-goh dah NAH-poh-lee'],
 liveq_vivi:['Dove vivi?','Where do you live? — informal','DOH-veh VEE-vee','Io vivo a Napoli.','I live in Naples.','EE-oh VEE-voh ah NAH-poh-lee'],
 liveq_vive:['Dove vive Lei?','Where do you live? — formal','DOH-veh VEE-veh LEH-ee','Io vivo a Napoli.','I live in Naples.','EE-oh VEE-voh ah NAH-poh-lee'],
 liveq_abiti:['Dove abiti?','Where do you live? — informal, using abitare','DOH-veh AH-bee-tee','Io abito a Napoli.','I live in Naples.','EE-oh AH-bee-toh ah NAH-poh-lee'],
 liveq_abita:['Dove abita Lei?','Where do you live? — formal, using abitare','DOH-veh AH-bee-tah LEH-ee','Io abito a Napoli.','I live in Naples.','EE-oh AH-bee-toh ah NAH-poh-lee']
};
const COMPARISON='<table class="forms-table"><thead><tr><th>Meaning</th><th>Question to one person</th><th>Full reply</th></tr></thead><tbody><tr><td>Be from</td><td>Di dove sei tu?</td><td>Io sono di Napoli.</td></tr><tr><td>Come from</td><td>Da dove vieni tu?</td><td>Io vengo da Napoli.</td></tr><tr><td>Live in</td><td>Dove vivi?</td><td>Io vivo a Napoli.</td></tr><tr><td>Live / reside in</td><td>Dove abiti?</td><td>Io abito a Napoli.</td></tr></tbody></table>';
const COUNTRY='<p><strong>Country examples from the lesson</strong></p><p lang="it">Io vengo dall’Italia. — I come from Italy.<br>Io vivo in Italia. — I live in Italy.</p>'+guide('EE-oh VEHN-goh dahl-lee-TAH-lyah · EE-oh VEE-voh een ee-TAH-lyah')+'<p><strong>dall’ = da + l’</strong>. The da construction is retained when joined to the article. Di is not “for cities” and da is not “for countries”: the lesson also gives both <strong>sono di Napoli</strong> and <strong>vengo da Napoli</strong>.</p>';
function revised(card){
 const c={...card};
 if(MOVES[c.key])c.deck=MOVES[c.key];
 if(!SEQUENCE.includes(c.key))return c;
 c.deck=CORE;
 c.panel='<div class="panel-head"><span class="panel-badge">L3</span><div class="panel-copy"><div class="panel-title">Origins and questions</div><div class="panel-subtitle">io · tu · formal Lei</div></div></div>';
 c.reference=SOURCE;
 if(c.key==='origin_where'){
  c.prompt='<div class="instruction">Say this in Italian:</div><div class="focus">Where?</div><div class="clue">The question word for a place, without adding “from”.</div>';
  c.usage='<p><strong>Dove</strong> asks “where”. Add di in the <strong>essere di</strong> origin construction; add da in the <strong>venire da</strong> source construction. For residence, ask <strong>Dove vivi?</strong> or <strong>Dove abiti?</strong>.</p>'+COMPARISON;
  c.pattern='<p><strong>Answer → question:</strong> sono <em>di Napoli</em> → <em>Di dove</em> sei?; vengo <em>da Napoli</em> → <em>Da dove</em> vieni?; vivo <em>a Napoli</em> → <em>Dove</em> vivi?</p>';
  c.clarification='<p>Both origin questions can be used to talk about where someone comes from. Do not memorise “di = birth, da = travelling right now” as a strict rule. Residence is where someone lives, which may be a different place.</p>'+COUNTRY;
  return c;
 }
 const [name,instruction,target,clue]=prompts[c.key],v=verbs[name];
 c.prompt='<div class="instruction">'+instruction+'</div><div class="focus">'+target+'</div><div class="clue">'+clue+'</div>';
 c.pattern=pattern(v);
 const pair=QA[c.key]||QA[{essere:'origin_di_tu',venire:'origin_da_tu',vivere:'liveq_vivi',abitare:'liveq_abiti'}[name]];
 let selected=[...pair];
 if(c.key.endsWith('_Italia')){
  selected[3]='Io '+(name==='vivere'?'vivo':'abito')+' in Italia.';
  selected[4]='I live in Italy.';
  selected[5]='EE-oh '+(name==='vivere'?'VEE-voh':'AH-bee-toh')+' een ee-TAH-lyah';
 }
 c.usage=reply(...selected)+'<div class="key-rule">'+why(v)+'</div>';
 c.clarification='<p>You may omit io/tu when context makes the subject clear. Keep the complete place phrase while learning: <strong>'+e(selected[3])+'</strong></p>';
 if(name==='essere'||name==='venire')c.clarification+='<p>Both questions can ask about origins. The verb determines which of these constructions you practise; this is not a city-versus-country rule.</p>';
 if(name==='abitare')c.clarification+='<p>Abitare is an everyday alternative to vivere for residence. “Reside” is only a teaching gloss, not a requirement to speak formally.</p>';
 if(c.key==='origin_da_lei'||c.key.endsWith('_Italia'))c.clarification+=COUNTRY;
 return c;
}
function applyCards(input){
 if(!Array.isArray(input))throw new Error('Lesson 3 update requires a card array');
 const byKey=new Map(input.map(c=>[c.key,c]));
 for(const key of [...SEQUENCE,...Object.keys(MOVES)]){
  if(byKey.get(key)?.lesson!=='L3')throw new Error('Missing/misassigned retained Lesson 3 key: '+key);
 }
 if(byKey.size!==input.length)throw new Error('Duplicate source keys');
 const result=input.map(c=>c.lesson==='L3'?revised(c):c);
 const sorted=result.filter(c=>c.lesson==='L3').sort((a,b)=>a.deck.localeCompare(b.deck)||
  (a.deck===CORE?SEQUENCE.indexOf(a.key)-SEQUENCE.indexOf(b.key):0));
 let i=0;return result.map(c=>c.lesson==='L3'?sorted[i++]:c);
}
const API={version:VERSION,core:CORE,later:LATER,sequence:SEQUENCE,moves:MOVES,comparison:COMPARISON,applyCards};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(!root)return;
root.ItalianLesson3Origins=API;
function install(){
 if(root.__L3_ORIGINS_SINGULAR__||!root.__REVIEWED_PRONUNCIATION_DECISIONS_20261022__||typeof cards==='undefined'||!Array.isArray(cards))return false;
 const before=cards,updated=applyCards(before);
 // Remap saved resume by stable key, never erase recall ratings or answer history.
 try{
  const key='italianGuidedResumeV1',saved=JSON.parse(sessionStorage.getItem(key)||'null');
  if(saved?.lesson==='L3'){
   const old=before.filter(c=>c.lesson==='L3'&&(!saved.deck||c.deck===saved.deck))[saved.index||0];
   const current=old&&updated.find(c=>c.key===old.key);
   if(current)sessionStorage.setItem(key,JSON.stringify({...saved,deck:current.deck,index:updated.filter(c=>c.lesson==='L3'&&c.deck===current.deck).findIndex(c=>c.key===current.key)}));
  }
 }catch(_e){}
 cards=updated;
 root.__L3_ORIGINS_SINGULAR__=VERSION;
 const style=document.createElement('style');style.id='l3-origins-style';style.textContent='.l3-dialogue{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}.l3-dialogue>div{padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--paper2)}.l3-dialogue p{font-size:21px;margin:8px 0}.l3-dialogue small,.l3-singular-forms small{display:block;font-size:12px;line-height:1.4;color:var(--muted)}.l3-singular-forms{width:100%;table-layout:fixed}.l3-singular-forms th,.l3-singular-forms td{overflow-wrap:anywhere}.l3-singular-forms .mini-phon{display:block;font-size:13px;line-height:1.45}.l3-topic-primer{margin:0 0 15px;padding:12px 15px;border:1px solid var(--line);border-radius:10px;background:var(--paper)}.l3-topic-primer summary{cursor:pointer;font-size:14px;font-weight:500;min-height:24px}.l3-topic-primer .l3-scroll{overflow-x:auto;margin-top:12px}.l3-topic-primer table{min-width:500px}.l3-topic-primer td,.l3-topic-primer th{font-size:14px;padding:9px}@media(max-width:600px){.l3-dialogue{grid-template-columns:1fr}.l3-dialogue p{font-size:19px}}';document.head.appendChild(style);
 if(typeof updateDeckOptions==='function')updateDeckOptions();
 if(typeof renderNavigation==='function')renderNavigation();
 if(typeof renderView==='function')renderView();
 root.dispatchEvent(new CustomEvent('italian-course-data-ready',{detail:{cards:cards.length,revision:VERSION}}));
 function decorate(){
  const card=document.querySelector('.guided-card-host .review-card');
  const layout=document.querySelector('.guided-card-layout');
  if(!layout||layout.querySelector('.l3-topic-primer')||card?.dataset.lesson!=='L3'||card.dataset.deck!==CORE)return;
  const details=document.createElement('details');details.className='l3-topic-primer';
  details.innerHTML='<summary>First: be from · come from · live in</summary><p>One speaker, one listener: <strong>io, tu and formal Lei</strong>. Each verb starts with a complete answer, then the informal and formal questions.</p><div class="l3-scroll">'+COMPARISON+'</div><p>Use the verb pattern to choose di or da. For residence, ask just Dove. Formal Lei changes the question; the speaker still answers with io.</p>';
  layout.querySelector('.guided-card-host')?.before(details);
 }
 const host=document.getElementById('guidedExperience');
 if(host)new MutationObserver(decorate).observe(host,{childList:true,subtree:true});
 decorate();return true;
}
let tries=0;
function wait(){try{if(install())return;if(++tries<750)root.setTimeout(wait,40);else console.warn('Lesson 3 update did not initialise.');}catch(error){console.error('Lesson 3 origins update:',error);}}
wait();
})(typeof window!=='undefined'?window:null);
