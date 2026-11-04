/* Shared, dependency-free learning session elements. Used by Study Sheets and Flashcards. */
(function(root) {
  'use strict';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,
    char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  function progressMarkup({label='Progress',completed=0,total=0,prefix='',className=''}={}) {
    const count=Math.max(0,Math.floor(Number(total)||0));
    const done=Math.max(0,Math.min(count,Math.floor(Number(completed)||0)));
    const pct=count ? (100*done/count).toFixed(1) : '0';
    const add=(part)=>prefix ? ' '+prefix+'-'+part : '';
    return '<div class="learning-session-progress '+escapeHtml(className)+' '+escapeHtml(prefix)+'">'+
      '<div class="learning-session-progress-label'+add('label')+'"><span>'+escapeHtml(label)+'</span>'+
      '<span class="learning-session-progress-count'+add('count')+'">'+done+' of '+count+'</span></div>'+
      '<div class="learning-session-progress-track'+add('track')+'" role="progressbar"'+
      ' aria-label="'+escapeHtml(label)+'" aria-valuemin="0" aria-valuemax="'+count+'"'+
      ' aria-valuenow="'+done+'" aria-valuetext="'+done+' of '+count+'">'+
      '<span class="learning-session-progress-fill'+add('fill')+'" style="width:'+pct+'%"></span></div></div>';
  }
  function restoreAnchor(element,previousTop) {
    if (!element || typeof previousTop !== 'number' || !Number.isFinite(previousTop)) return;
    requestAnimationFrame(() => {
      if (!element.isConnected) return;
      const top=element.getBoundingClientRect().top;
      const height=window.innerHeight||document.documentElement.clientHeight;
      const target=Math.max(12,Math.min(previousTop,Math.max(12,height-100)));
      const delta=top-target;
      if (Math.abs(delta)>2) window.scrollBy({top:delta,behavior:'instant'});
    });
  }
  function confidenceSummary(cards,confidence={}) {
    const list=Array.isArray(cards)?cards:[];
    const known=list.filter(card=>confidence[card.key]==='known').length;
    const again=list.filter(card=>confidence[card.key]==='again').length;
    return {total:list.length,known,again,rated:known+again,unrated:list.length-known-again};
  }
  function reviewKeys(cards,confidence={}) {
    return (Array.isArray(cards)?cards:[])
      .filter(card=>confidence[card.key]==='again').map(card=>card.key);
  }
  const api=Object.freeze({progressMarkup,restoreAnchor,confidenceSummary,reviewKeys});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ItalianLearningSession=api;
})(typeof window!=='undefined'?window:undefined);
