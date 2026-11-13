/* Lesson 7 catalogue adapter. Existing identities, answer queues and controls are retained. */
(function(root){
'use strict';
const D=root.ITALIAN_L7;if(!D)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=(en,it)=>'<span class="editorial-label"><span class="editorial-label-main" lang="en">'+en+'</span><span class="editorial-label-sub" lang="it">'+it+'</span></span>';
const extras=D.lesson6Supplements||{};
function sheets(){
 return [...(D.sheets||[]),...(extras.sheets||[])].map(sheet=>({
  ...sheet,
  titleIt:sheet.titleIt||sheet.it,
  questions:sheet.questions.map(q=>({...q,prompt:q.prompt_it&&!q.prompt.includes('editorial-label')?pair(q.prompt,q.prompt_it):q.prompt})),
  study_sections:sheet.study_sections.map(section=>JSON.parse(JSON.stringify(section),(_,v)=>typeof v==='string'?v.replaceAll('src="lesson7/media/','src="../lesson7/media/'):v))
 }));
}
const M=root.ItalianLibraryMap;
if(M){
 const lesson=D.libraryLesson;
 if(lesson&&!M.lessons.some(x=>x.id===lesson.id))M.lessons.push({...lesson,topics:[...(lesson.topics||[])],extra:[...(lesson.extra||[])]});
 for(const topic of [...(D.libraryTopics||[]),...(extras.topics||extras.libraryTopics||[])]){
  if(!M.topics.some(x=>x.id===topic.id))M.topics.push({...topic,sets:[...topic.sets]});
  if((extras.topics||extras.libraryTopics||[]).includes(topic)){
   const l6=M.lessons.find(x=>x.id==='L6');if(l6&&!l6.topics.includes(topic.id))l6.topics.push(topic.id);
  }
 }
 for(const [id,slugs] of Object.entries(D.existingTopicSets||{})){
  const topic=M.topics.find(x=>x.id===id);if(topic)for(const slug of slugs)if(!topic.sets.includes(slug))topic.sets.push(slug);
 }
 for(const sheet of sheets())if(sheet.titleIt)M.labels[sheet.slug]=[sheet.title,sheet.titleIt];
}
root.ItalianUILibraryMessages=root.ItalianUILibraryMessages||{};
if(D.libraryLesson?.it)root.ItalianUILibraryMessages[D.libraryLesson.title]=D.libraryLesson.it;
for(const topic of [...(D.libraryTopics||[]),...(extras.topics||extras.libraryTopics||[])])if(topic.it)root.ItalianUILibraryMessages[topic.title]=topic.it;
for(const sheet of sheets()){
 if(sheet.titleIt)root.ItalianUILibraryMessages[sheet.title]=sheet.titleIt;
 if(sheet.subtitleIt)root.ItalianUILibraryMessages[sheet.subtitle]=sheet.subtitleIt;
 for(const section of sheet.study_sections){
  if(section.titleIt)root.ItalianUILibraryMessages[section.title]=section.titleIt;
  if(section.headersIt)section.headers.forEach((label,i)=>{if(section.headersIt[i])root.ItalianUILibraryMessages[label]=section.headersIt[i];});
 }
}
Object.assign(root.ItalianUILibraryMessages,D.uiTranslations||{});
root.ItalianLesson7Integration={sheets,version:'2026-11-13-review'};

// New reference tables reflow as compact, labelled rows on phones.
const tableSheetIds=new Set([...(D.sheets||[]),...(extras.sheets||[])].map(s=>s.slug));
function tagTables(){
 for(const article of document.querySelectorAll('.study-pack-sheet')){
  if(!tableSheetIds.has(article.id))continue;
  article.classList.add('lesson7-material');
  for(const table of article.querySelectorAll('table')){
   if(table.dataset.l7Rows)return;table.dataset.l7Rows='ready';
   const labels=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
   for(const row of table.querySelectorAll('tbody tr'))[...row.children].forEach((cell,i)=>{cell.dataset.columnLabel=labels[i]||'';});
  }
 }
}
const host=document.getElementById('studySheets');
if(host)new MutationObserver(tagTables).observe(host,{childList:true,subtree:true});
tagTables();
})(window);
