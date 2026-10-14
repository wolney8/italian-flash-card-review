let cards=[];
const app=document.getElementById('app');
const lessonSelect=document.getElementById('lesson');
const deckSelect=document.getElementById('deck');
const searchInput=document.getElementById('search');
const count=document.getElementById('count');
const modal=document.getElementById('reviewModal');
const reviewForm=document.getElementById('reviewForm');
const reviewContext=document.getElementById('reviewContext');
const scopeBadge=document.getElementById('scopeBadge');
const formStatus=document.getElementById('formStatus');

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function stripHtml(value){
  const d=document.createElement('div');
  d.innerHTML=value || '';
  return (d.textContent || '').replace(/\s+/g,' ').trim();
}
function slugify(value){
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
async function loadCards(){
  try{
    if(typeof DecompressionStream==='undefined') throw new Error('This browser is too old to open the review data.');
    const files=Array.from({length:9},(_,i)=>`data/cards-${String(i+1).padStart(2,'0')}.txt`);
    const encoded=(await Promise.all(files.map(async file=>{
      const response=await fetch(file);
      if(!response.ok) throw new Error('Could not load the card data.');
      return (await response.text()).trim();
    }))).join('');
    const bytes=Uint8Array.from(atob(encoded), ch=>ch.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    cards=JSON.parse(await new Response(stream).text());
    updateDeckOptions();
    draw();
    if(location.hash) setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView(),50);
  }catch(error){
    app.innerHTML=`<div class="loading"><strong>The cards could not be loaded.</strong><br>${escapeHtml(error.message)}</div>`;
  }
}
function updateDeckOptions(){
  const selectedLesson=lessonSelect.value;
  const previous=deckSelect.value;
  const decks=[...new Set(cards.filter(c=>!selectedLesson||c.lesson===selectedLesson).map(c=>c.deck))];
  deckSelect.innerHTML='<option value="">All subdecks</option>'+decks.map(d=>`<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  if(decks.includes(previous)) deckSelect.value=previous;
}
function draw(){
  const q=searchInput.value.toLowerCase().trim();
  const lesson=lessonSelect.value;
  const deck=deckSelect.value;
  const list=cards.filter(c=>
    (!lesson||c.lesson===lesson) &&
    (!deck||c.deck===deck) &&
    (!q||JSON.stringify(c).toLowerCase().includes(q))
  );
  count.textContent=list.length+' cards';
  app.innerHTML=list.map(c=>{
    const anchor='card-'+slugify(c.key);
    return `<section class="preview-card" id="${anchor}" data-key="${escapeHtml(c.key)}" data-lesson="${escapeHtml(c.lesson)}" data-deck="${escapeHtml(c.deck)}">
      <div class="deck-label">${escapeHtml(c.lesson)} · ${escapeHtml(c.deck)}</div>
      <div class="topic-panel">${c.panel}</div>
      <div class="front-body">${c.prompt}</div>
      <button class="reveal" type="button">Show / hide answer</button>
      <div class="comment-actions">
        <button class="comment-button" type="button" data-comment-scope="card">Comment on card</button>
        <button class="comment-button secondary" type="button" data-comment-scope="deck">Comment on subdeck</button>
      </div>
      <div class="preview-answer">
        <div class="answer-body">
          <div class="answer-label">Answer</div>
          <div class="italian">${c.answer}</div>
          <div class="phon">${c.pron}</div>
          <div class="section"><div class="label">Meaning</div>${c.meaning}</div>
          ${c.literal?`<div class="section"><div class="label">Literal</div>${c.literal}</div>`:''}
          <div class="section"><div class="label">Rule / forms</div>${c.rule}</div>
          <details class="extra"><summary>Source</summary><div class="inside">${c.source}<p>${escapeHtml(c.key)}</p></div></details>
        </div>
      </div>
    </section>`;
  }).join('');
}
function openReview(scope, card){
  formStatus.textContent='';
  formStatus.classList.remove('error');
  reviewForm.reset();
  document.getElementById('formScope').value=scope;
  document.getElementById('formLesson').value=card?.lesson || '';
  document.getElementById('formDeck').value=card?.deck || '';
  document.getElementById('formCardKey').value=scope==='card' ? (card?.key || '') : '';
  const summary=scope==='card' ? `${stripHtml(card?.prompt)} → ${stripHtml(card?.answer)}` : '';
  document.getElementById('formCardSummary').value=summary;
  if(scope==='card'){
    document.getElementById('formItemId').value='card:'+card.key;
    scopeBadge.textContent='Card comment';
    reviewContext.textContent=`${card.lesson} · ${card.deck} · ${summary}`;
  } else if(scope==='deck'){
    document.getElementById('formItemId').value='deck:'+card.lesson+':'+slugify(card.deck);
    scopeBadge.textContent='Subdeck comment';
    reviewContext.textContent=`${card.lesson} · ${card.deck}`;
  } else {
    document.getElementById('formItemId').value='site:general';
    scopeBadge.textContent='General comment';
    reviewContext.textContent='Lessons 1–3 review site';
  }
  modal.hidden=false;
  document.body.style.overflow='hidden';
  setTimeout(()=>document.getElementById('reviewer').focus(),0);
}
function closeReview(){
  modal.hidden=true;
  document.body.style.overflow='';
}
document.addEventListener('click', event=>{
  const reveal=event.target.closest('.reveal');
  if(reveal) reveal.closest('.preview-card').classList.toggle('show');
  const commentButton=event.target.closest('[data-comment-scope]');
  if(commentButton){
    const scope=commentButton.dataset.commentScope;
    if(scope==='general') return openReview('general', null);
    const section=commentButton.closest('.preview-card');
    const card=cards.find(c=>c.key===section?.dataset.key);
    if(card) openReview(scope, card);
  }
  if(event.target.closest('[data-close-modal]')) closeReview();
});
document.addEventListener('keydown', event=>{if(event.key==='Escape'&&!modal.hidden) closeReview();});
reviewForm.addEventListener('submit', async event=>{
  event.preventDefault();
  formStatus.textContent='Sending…';
  formStatus.classList.remove('error');
  const submit=reviewForm.querySelector('.modal-submit');
  submit.disabled=true;
  try{
    const data=new URLSearchParams(new FormData(reviewForm));
    const response=await fetch('/',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:data.toString()
    });
    if(!response.ok) throw new Error('Submission failed');
    formStatus.textContent='Thank you — your comment was sent.';
    reviewForm.querySelector('#comment').value='';
    setTimeout(closeReview,1100);
  }catch(error){
    formStatus.textContent='The comment could not be sent. Please try again.';
    formStatus.classList.add('error');
  }finally{
    submit.disabled=false;
  }
});
searchInput.addEventListener('input', draw);
lessonSelect.addEventListener('change', ()=>{updateDeckOptions();draw();});
deckSelect.addEventListener('change', draw);
loadCards();
