/* The website and Anki package read the same approved card records. */
(function (root) {
  'use strict';
  const collection = {
    id: 'PRACTICE', title: 'Daily verb flashcards', it: 'Carte quotidiane sui verbi',
    description: 'Present forms, verb patterns and everyday uses from across the course.'
  };
  const assetBase = new URL('.', document.currentScript.src);
  let coverage;
  const escape = value => String(value || '').replace(/[&<>"']/g, character =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[character]);
  function renderCard(row) {
    if (!row.key || !row.task || !row.answer || !row.source) throw new Error('Invalid daily verb card: ' + row.key);
    const cues = row.cues.map(cue => '<div class="recall-cue"><span class="recall-cue-label" lang="en">' +
      escape(cue.label) + '</span><span' + (cue.lang==='it'?' class="learning-it"':['Verb meaning','In English'].includes(cue.label)?' class="learning-gloss"':'') + ' lang="' + cue.lang + '">' + escape(cue.text) + '</span></div>').join('');
    return {
      key:row.key, lesson:collection.id, deck:row.deck,
      panel:'<div class="panel-head"><div class="panel-copy"><div class="panel-title">' + escape(row.deck.slice(3)) + '</div></div></div>',
      prompt:'<div class="recall-exercise" data-ui-no-translate><p class="instruction" lang="en">' + (row.display?.task || escape(row.task)) + '</p><div class="focus recall-cues">' + cues + '</div>' +
        (row.hint ? '<div class="clue" lang="en">' + (row.display?.hint || escape(row.hint)) + '</div>' : '') + '</div>',
      answer:escape(row.answer),answerLang:row.answerLang,
      pron:row.guide ? '<div class="pronunciation-compact"><div class="pron-guide-line">' + escape(row.guide) + '</div><div class="pron-ipa-line">/' + escape(row.ipa) + '/</div></div>' : '',
      meaning:row.display?.meaning || escape(row.meaning), literal:'', usage:row.display?.usage || escape(row.usage), pattern:row.rule,
      clarification:row.guide ? '<p>Approximate English-friendly reading guide. Capitals mark stress. Hold doubled consonants slightly longer.</p>' : '',
      reference:escape(row.sourceClass + ' · ' + row.source),
      primaryAnswer:row.answer, guide:row.guide, ipa:row.ipa,
      task_kind:row.kind === 'pattern' ? 'concept' : 'production',
      pronunciation_status:row.guide ? 'Approximate reading guide' : 'Not applicable: conceptual answer'
    };
  }
  async function loadCards() {
    const responses = await Promise.all(['cards.json','coverage.json'].map(file => fetch(new URL(file+'?v=20261125release2',assetBase))));
    if(responses.some(response=>!response.ok))throw new Error('Could not load daily verb flashcards.');
    const [records,map]=await Promise.all(responses.map(response=>response.json()));
    coverage=map;
    return records.map(renderCard);
  }
  function collectionCards(allCards) {
    if(!coverage)return [];
    const byKey=new Map(allCards.map(card=>[card.key,card])),seen=new Set(),views=[];
    function use(key,deck,order){
      if(seen.has(key))return;
      const original=byKey.get(key);
      if(!original)throw new Error('Missing daily-practice card: '+key);
      seen.add(key);
      // This is a virtual collection view. The stored record, key and progress
      // remain with the original lesson; no second Anki note is created.
      const panel='<div class="panel-head"><div class="panel-copy"><div class="panel-title">'+escape(deck.slice(3))+'</div></div></div>';
      views.push({...original,lesson:collection.id,deck,panel,practiceOrder:order});
    }
    coverage.formCoverage.forEach((row,index)=>use(row.key,row.deck,index));
    coverage.patternCoverage.forEach((row,index)=>use(row.key,'05 Verb patterns',1000+index));
    coverage.usageCoverage.forEach((row,index)=>row.keys.forEach(key=>use(key,'06 Everyday verb uses',2000+index)));
    return views.sort((a,b)=>a.deck.localeCompare(b.deck)||a.practiceOrder-b.practiceOrder);
  }
  root.ItalianDailyVerbCards = {collection, renderCard, loadCards, collectionCards};
})(window);
