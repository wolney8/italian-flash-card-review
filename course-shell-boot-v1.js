/* Reveal only the final interface. A failed load shows an actionable error, never legacy chrome. */
(function(root){'use strict';
let released=false,timer;
function ready(){if(released)return;const study=!!document.getElementById('studySheets');
 if(study){if(!document.getElementById('studyGuideHeader'))return;if(!document.querySelector('[data-library-ready],.study-pack-sheet[data-library-detail=ready]'))return;}
 else if(!document.querySelector('#guidedExperience .course-site-header'))return;
 root.ItalianUI?.refresh();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(released)return;released=true;clearTimeout(timer);document.documentElement.classList.remove('course-booting');document.getElementById('courseBoot')?.remove();
  if(study){try{const back=JSON.parse(sessionStorage.getItem('italianStudyReturnV1')||'null');if(back?.path===location.pathname+location.search&&Date.now()-back.at<3600000){root.scrollTo({top:back.scrollY||0,behavior:'instant'});sessionStorage.removeItem('italianStudyReturnV1');}}catch(_){}}
 }));
}
root.ItalianCourseBoot={ready,version:'20261111-library'};
function start(){
 if(new URLSearchParams(location.search).get('audit')==='1'){document.documentElement.classList.remove('course-booting');document.getElementById('courseBoot')?.remove();return;}
 const observer=new MutationObserver(()=>{ready();if(released)observer.disconnect();});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-library-detail','data-guided-pilot']});
 timer=setTimeout(()=>{if(released)return;const shell=document.getElementById('courseBoot');if(shell){shell.innerHTML='<strong>Italian for Beginners</strong><p>The learning page could not finish loading.</p><button type="button" onclick="location.reload()">Reload page</button>';shell.setAttribute('role','alert');}},15000);ready();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
