/* Presentation only: preserve the approved wording and annotate explicit language references. */
(function (root) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[character]).replace(/\n/g,'<br>');
  const italian = value => '<span class="learning-it" lang="it">'+escape(value)+'</span>';
  const meaning = value => '<span class="learning-gloss" lang="en-GB">'+escape(value)+'</span>';
  const regexEscape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  // Ambiguous single words (I, a, in, come, do) are deliberately absent.
  // The noun phrases below occur in the existing article and plural reminders.
  const terms = [
    'il','lo','la','gli','le','un','uno','una','l’','un’',
    'del','dello','della','dell’','dei','degli','delle',
    'nel','nello','nella','nell’','nei','negli','nelle',
    'sul','sullo','sulla','sull’','sui','sugli','sulle',
    'dal','dallo','dalla','dall’','dai','dagli','dalle',
    'al','allo','alla','all’','ai','agli','alle',
    'il maestro','lo zio','la zia','uno zio','una zia',
    'il libro','i libri','un libro','dei libri',
    'lo studente','gli studenti','uno studente','degli studenti',
    'la casa','le case','una casa','delle case',
    'l’amico','gli amici','un amico','degli amici',
    'l’amica','le amiche','un’amica','delle amiche',
    'i problemi','dei problemi','gli zaini','degli zaini',
    'del pane','dei libri','della pasta','delle pizze',
    'i / dei','gli / degli','le / delle'
  ].sort((a,b)=>b.length-a.length);
  const englishQuotes = new Set([
    'the','a','an','some','in the','on the','from the','from a','from an','of the',
    'to the','at the','to','at','in','on','from','for','and','or','of',
    'who','what','where','when','why','how','you','you all','we','us','they',
    'to make','to do','to take','to get','to catch','to have'
  ]);
  function formatExplanation(value, verb) {
    const text=String(value ?? ''),marks=[];
    const shared=root.ItalianVerbReferenceView?.formatExplanation;
    const fallback=chunk=>shared?shared(chunk,verb):escape(chunk);
    function mark(start,end,kind){
      if(marks.some(row=>start<row.end && end>row.start))return;
      marks.push({start,end,kind});
    }
    for(const quote of text.matchAll(/“([^”\n]+)”|"([^"\n]+)"|‘([^’\n]+)’|'([^'\n]+)'/g)){
      const inner=quote[1] || quote[2] || quote[3] || quote[4],word=inner.toLocaleLowerCase('en-GB');
      if(!englishQuotes.has(word) && inner!=='I')continue;
      const before=text.slice(0,quote.index);
      // Explicitly naming an Italian word takes precedence over a shared spelling.
      if(/\b(?:Italian|preposition|letter|form|verb)\s*$/i.test(before))continue;
      if(['a','in'].includes(word) && !/\b(?:for|means?|meaning|English|say|says|saying|translate|translation of)\s*$/i.test(before))continue;
      mark(quote.index,quote.index+quote[0].length,'meaning');
    }
    for(const term of terms){
      const pattern=regexEscape(term).replace(/’/g,"['’]").replace(/ /g,'\\s+');
      const ending=/[’']$/.test(term)?'':'(?![\\p{L}\\p{N}_])';
      const expression=new RegExp('(?<![\\p{L}\\p{N}_])'+pattern+ending,'giu');
      for(const match of text.matchAll(expression))mark(match.index,match.index+match[0].length,'italian');
    }
    if(!marks.length)return fallback(text);
    let end=0;
    const output=marks.sort((a,b)=>a.start-b.start).map(mark=>{
      const html=fallback(text.slice(end,mark.start))+(mark.kind==='meaning'?meaning:italian)(text.slice(mark.start,mark.end));
      end=mark.end;return html;
    }).join('');
    return output+fallback(text.slice(end));
  }
  const api={formatExplanation,formatItalian:italian,formatMeaning:meaning};
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  root.ItalianDailyFocusLanguage=api;
})(typeof window!=='undefined'?window:globalThis);
