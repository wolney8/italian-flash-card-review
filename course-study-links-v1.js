/* Explicit flashcard-to-practice links. Return paths are restricted to this site's study document. */
(function(root){'use strict';
function valid(path){try{const u=new URL(path,location.href);return u.origin===location.origin&&u.pathname==='/study/study-sheets.html'?u.pathname+u.search+u.hash:null;}catch(_){return null;}}
const pair=(en,it)=>root.ItalianUI?.pair(en,it)||en;
function decorate(){const host=document.getElementById('guidedMain');if(!host||host.querySelector('.study-flash-return'))return;
 const card=host.querySelector('.review-card');if(!card)return;
 const params=new URLSearchParams(location.search),back=valid(params.get('studyReturn')||'');
 const topic=root.ItalianLibraryMap?.topics.find(t=>t.flashcards.lesson===card.dataset.lesson&&t.flashcards.deck===card.dataset.deck);
 const container=document.createElement('div');container.className='study-flash-return';
 if(back){const a=document.createElement('a');a.dataset.backToPractice='true';a.href=back;a.innerHTML='← '+pair('Back to practice','Torna agli esercizi');container.append(a);}
 if(topic){const a=document.createElement('a');a.dataset.topicPractice='true';a.href='/study/study-sheets.html?mode=learn&lesson='+topic.flashcards.lesson+'&topic='+topic.id+'&sheet='+(root.ItalianLibraryMap.subsets[topic.sets[0]]?.sheet||topic.sets[0])+'&set='+topic.sets[0];a.innerHTML=pair('Practise this topic','Esercitati su questo argomento');container.append(a);}
 if(!container.children.length){const a=document.createElement('a');a.href='/study/study-sheets.html?lesson='+card.dataset.lesson;a.innerHTML=pair('Lesson practice','Esercizi della lezione');container.append(a);}
 const crumb=host.querySelector('.course-site-breadcrumb');if(crumb)crumb.after(container);else host.prepend(container);
}
root.ItalianStudyLinks={decorate,valid};
})(window);
