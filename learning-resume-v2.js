/* Local continuation of this browser's learning state. No account or Anki writes. */
(function(root){'use strict';
const KEY='italianLearningResumeV2';
const allowed=k=>k==='italianCourseSessionProgressV2'||k==='italianGuidedResumeV1'||/^(italianGuidedSheetPilotV1:|italianStudyRoundV2:|italianStudyRoundHistoryV2:|italianPracticeSeedV1:|italianFlashPracticeV2:)/.test(k);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===2)for(const [k,v] of Object.entries(saved.entries||{}))if(allowed(k)&&typeof v==='string'&&sessionStorage.getItem(k)===null)sessionStorage.setItem(k,v);}catch(_){}
function save(){try{const entries={};for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(allowed(k))entries[k]=sessionStorage.getItem(k);}localStorage.setItem(KEY,JSON.stringify({version:2,at:Date.now(),entries}));return true;}catch(_){return false;}}
root.ItalianLearningResume={save};root.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
})(window);
