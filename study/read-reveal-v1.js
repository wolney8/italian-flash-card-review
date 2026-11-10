/* Web-only read/reveal mode. Uses the existing question and number source data.
   Reveals are not quiz attempts, do not change scores, and never alter card identities. */
(function () {
  'use strict';
  const VERSION='20261110-web1';
  const root=document.getElementById('studySheets');
  if(!root)return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=html=>{const el=document.createElement('div');el.innerHTML=html;return el.textContent.trim();};
  const params=new URLSearchParams(location.search);
  function init(){
    const article=root.querySelector('.study-pack-sheet');
    if(!article){
      if(root.querySelector('.sheet-library-category')&&!document.querySelector('.study-quick-access')){
        const links=document.createElement('nav');links.className='study-quick-access';links.setAttribute('aria-label','Study shortcuts');
        links.innerHTML='<a href="study-sheets.html?path=L6">Lesson 6 in class order</a><a href="study-sheets.html?sheet=l6-number-patterns&stage=practise&exercise=flip">Number flip cards</a><a href="study-sheets.html?sheet=known-verbs-and-forms&stage=learn&reference=1">Verb reference</a>';
        document.getElementById('studyNav').after(links);root.dataset.readReveal=VERSION;return true;
      }return false;
    }
    if(article.dataset.guidedPilot!=='ready')return false;
    if(article.dataset.readReveal)return true;
    const quiz=article.querySelector('[data-study-quiz]'),list=quiz?.querySelector('.quiz-list');
    if(!quiz||!list)return false;
    const source=window.ITALIAN_L6?.sheets.find(s=>s.slug===article.id);
    const questions=source?.questions||[...list.querySelectorAll('.quiz-question')].map((q,i)=>({
      id:q.dataset.questionKey||String(i),prompt:q.querySelector('.question-heading label').innerHTML,
      model:q.querySelector('.model-answer').textContent.replace(/^Risposta:\s*/,''),hint:q.querySelector('.hint')?.innerHTML||'',explanation:q.dataset.explanation||''
    }));
    const numbers=article.id==='l6-number-patterns';
    const key='italianReadRevealV1:'+article.id;
    let revealed={};try{revealed=JSON.parse(sessionStorage.getItem(key)||'{}');if(!revealed||typeof revealed!=='object'||Array.isArray(revealed))revealed={};}catch(_){}
    let flip=params.get('exercise')==='flip',board=params.get('board')==='patterns'&&numbers?'patterns':'sequence';
    const controls=document.createElement('div');controls.className='read-reveal-mode';
    controls.innerHTML='<span>Practice style</span><div role="group" aria-label="Practice style"><button type="button" data-practice-style="typed" aria-pressed="true">Typed / choice answers</button><button type="button" data-practice-style="flip" aria-pressed="false">Flip &amp; reveal</button></div>';
    if(numbers)controls.querySelector('[data-practice-style="typed"]').textContent='Write in Italian';
    list.before(controls);
    const panel=document.createElement('div');panel.className='read-reveal-panel';panel.hidden=true;
    panel.innerHTML=(numbers?'<div class="read-reveal-views" role="group" aria-label="Number board"><button type="button" data-reveal-board="sequence" aria-pressed="true">Practice sequence</button><button type="button" data-reveal-board="patterns" aria-pressed="false">Pattern columns</button></div>':'')+
      '<div class="read-reveal-toolbar"><div><span class="read-reveal-count" role="status"></span><small>Revealed, not scored</small></div><div class="read-reveal-pair"><button type="button" data-reveal-all>Reveal all</button><button type="button" data-hide-all>Hide all</button></div></div><div class="read-reveal-track" role="progressbar" aria-label="Cards currently revealed" aria-valuemin="0"><span></span></div><div class="read-reveal-board"></div>';
    controls.after(panel);
    const boardHost=panel.querySelector('.read-reveal-board');
    function highlight(word){return esc(word).replace(/cento/g,'<span class="l6-n-hundred">cento</span>').replace(/mille|mila/g,'<span class="l6-n-thousand">$&</span>').replace(/tré/g,'<span class="l6-n-accent">tré</span>').replace(/^vent(uno|otto)$/,'vent<span class="l6-n-join">$1</span>');}
    function numberHelp(n){
      const sections=source.study_sections;
      if(n===21||n===28)return sections[0].items.join('');
      if(n===23)return sections[1].items.join('');
      if(n>=1000)return sections[3].items.join('');
      if(n>=100)return sections[2].items.join('');
      return '';
    }
    function card(id,prompt,answer,help='',nearby=''){
      return '<details class="read-reveal-card" data-reveal-key="'+esc(id)+'"'+(revealed[id]?' open':'')+'><summary><span class="read-reveal-front">'+prompt+'</span><span class="read-reveal-cue">Flip to reveal</span></summary><div class="read-reveal-back"><div class="read-reveal-answer" lang="it">'+answer+'</div>'+ (nearby?'<p class="read-reveal-neighbours">'+nearby+'</p>':'')+(help?'<div class="read-reveal-help">'+help+'</div>':'')+'</div></details>';
    }
    function render(){
      if(numbers&&board==='patterns'){
        const names=['UNITÀ','DECINE','CENTINAIA','MIGLIAIA'];
        boardHost.className='read-reveal-board number-pattern-board';
        boardHost.innerHTML=names.map((name,col)=>'<section class="read-reveal-group"><h3>'+name+'</h3><div class="read-reveal-cards">'+window.ITALIAN_L6.numberRows.map((row,i)=>{
          const n=row[col*2],w=row[col*2+1];return card('pattern-'+col+'-'+i,esc(n.toLocaleString('en-GB')),highlight(w),numberHelp(n));
        }).join('')+'</div></section>').join('');
      }else if(numbers){
        boardHost.className='read-reveal-board';
        const groups=[['0–10',0,11],['11–20',11,21],['21–30',21,31],['Tens, hundreds and thousands',31,41]];
        boardHost.innerHTML=groups.map(([name,start,end])=>'<section class="read-reveal-group"><h3>'+name+'</h3><div class="read-reveal-cards">'+questions.slice(start,end).map((q,j)=>{
          const i=start+j,n=window.ITALIAN_L6.numberPracticeValues[i];
          const nearby=questions.slice(Math.max(start,i-1),Math.min(end,i+2)).map((x,k)=>{
            const ni=window.ITALIAN_L6.numberPracticeValues[Math.max(start,i-1)+k];return esc(ni+' '+x.model);
          }).join(' · ');
          return card(q.id||'question-'+i,esc(n.toLocaleString('en-GB')),highlight(q.model),numberHelp(n),nearby);
        }).join('')+'</div></section>').join('');
      }else{
        boardHost.className='read-reveal-board';
        boardHost.innerHTML='<div class="read-reveal-cards sentence-cards">'+questions.map((q,i)=>card(q.id||'question-'+i,q.prompt,esc(q.model),q.explanation||q.hint||'')).join('')+'</div>';
      }
      panel.querySelectorAll('[data-reveal-board]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.revealBoard===board)));
      update();
    }
    function update(){
      const cards=[...boardHost.querySelectorAll('details[data-reveal-key]')],open=cards.filter(c=>c.open).length;
      panel.querySelector('.read-reveal-count').textContent=open+' of '+cards.length+' cards revealed';
      const bar=panel.querySelector('[role="progressbar"]');bar.setAttribute('aria-valuemax',String(cards.length));bar.setAttribute('aria-valuenow',String(open));
      bar.firstElementChild.style.width=(cards.length?open/cards.length*100:0)+'%';
      for(const c of cards){revealed[c.dataset.revealKey]=c.open;c.querySelector('.read-reveal-cue').textContent=c.open?'Flip to hide':'Flip to reveal';}
      try{sessionStorage.setItem(key,JSON.stringify(revealed));}catch(_){}
    }
    function apply(){
      panel.hidden=!flip;controls.querySelectorAll('[data-practice-style]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.practiceStyle==='flip')===flip)));
      quiz.classList.toggle('read-reveal-selected',flip);
      article.classList.toggle('read-reveal-active',flip&&!quiz.hidden);
      if(flip&&!quiz.hidden){const hint=article.querySelector('.guided-sheet-instruction');if(hint)hint.textContent='Think of the answer, then flip a card. Reveal all to compare the patterns.';}
    }
    controls.addEventListener('click',event=>{const b=event.target.closest('[data-practice-style]');if(!b)return;flip=b.dataset.practiceStyle==='flip';apply();});
    panel.addEventListener('click',event=>{
      if(event.target.closest('[data-reveal-all]')||event.target.closest('[data-hide-all]')){
        const open=!!event.target.closest('[data-reveal-all]');boardHost.querySelectorAll('details').forEach(c=>{c.open=open;});update();
      }
      const view=event.target.closest('[data-reveal-board]');if(view){board=view.dataset.revealBoard;render();}
    });
    boardHost.addEventListener('toggle',event=>{if(event.target.matches('details[data-reveal-key]'))update();},true);
    new MutationObserver(apply).observe(quiz,{attributes:true,attributeFilter:['hidden']});
    article.addEventListener('click',event=>{if(event.target.closest('[data-guided-step]'))setTimeout(apply,0);});
    render();apply();article.dataset.readReveal=VERSION;root.dataset.readReveal=VERSION;
    return true;
  }
  if(!init()){const observer=new MutationObserver(()=>{if(init())observer.disconnect();});observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-guided-pilot']});}
})();
