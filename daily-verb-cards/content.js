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
  function referencePattern(value, verbName) {
    const view = root.ItalianVerbReferenceView;
    if (!view?.formatForm || typeof value !== 'string') return value;
    const subjects = ['io', 'tu', 'lui / lei / lei', 'noi', 'voi', 'loro'];
    const rowExpression = /(<div class="l7-form-row">)([\s\S]*?)(<\/div>)/g;
    const personIndex = content => {
      const subject = content.match(/^<span(?:\s[^>]*)?>([^<]*)<\/span>/)?.[1].toLowerCase().replace(/\s+/g, ' ').trim();
      return subject === 'lui / lei' ? 2 : subjects.indexOf(subject);
    };
    const rows = [...value.matchAll(rowExpression)].map(match => ({content:match[2], index:personIndex(match[2])}));
    if (!rows.length || rows.some(row => /class="[^"]*\bverb-(?:ending|infix)\b/.test(row.content))) return value;
    const catalogue = root.ItalianDailyVerbs?.verbs || [];
    let verb = verbName ? catalogue.find(item => item.name === verbName) : null;
    if (!verbName) {
      // Older lesson cards have no verb metadata. Infer only from a complete
      // six-person reference whose exact full forms identify one regular verb.
      if (rows.length !== 6 || new Set(rows.map(row => row.index)).size !== 6 || rows.some(row => row.index < 0)) return value;
      const matches = catalogue.filter(item => item.kind === 'regular' && rows.every(row =>
        [...row.content.matchAll(/>([^<>]*)</g)].some(match => match[1] === escape(item.forms[row.index]))));
      if (matches.length !== 1) return value;
      verb = matches[0];
    }
    if (!verb || verb.kind !== 'regular') return value;
    // These are the approved full-form reference rows, not sentence examples
    // or recall answers. Keep their wording and only decorate exact known forms.
    return value.replace(rowExpression, (row, open, content, close) => {
      const index = personIndex(content);
      if (index < 0) return row;
      const form = escape(verb.forms[index]);
      let found = false;
      const decorated = content.replace(/>([^<>]*)</g, (node, text) => {
        if (text !== form) return node;
        found = true;
        return '>' + view.formatForm(verb, index) + '<';
      });
      if (!found) return row;
      const ending = verb.parts?.[index]?.ending;
      const result = ending ? decorated.replace(/>([^<>]*)</g, (node, text) => text === '-' + escape(ending) ? '><span class="verb-ending">' + text + '</span><' : node) : decorated;
      return open + result + close;
    });
  }
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
      meaning:row.display?.meaning || escape(row.meaning), literal:'', usage:row.display?.usage || escape(row.usage), pattern:referencePattern(row.rule, row.verb),
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
    function use(key,deck,order,verbName){
      if(seen.has(key))return;
      const original=byKey.get(key);
      if(!original)throw new Error('Missing daily-practice card: '+key);
      seen.add(key);
      // This is a virtual collection view. The stored record, key and progress
      // remain with the original lesson; no second Anki note is created.
      const panel='<div class="panel-head"><div class="panel-copy"><div class="panel-title">'+escape(deck.slice(3))+'</div></div></div>';
      views.push({...original,lesson:collection.id,deck,panel,pattern:referencePattern(original.pattern,verbName),practiceOrder:order});
    }
    coverage.formCoverage.forEach((row,index)=>use(row.key,row.deck,index,row.verb));
    coverage.patternCoverage.forEach((row,index)=>use(row.key,'05 Verb patterns',1000+index));
    coverage.usageCoverage.forEach((row,index)=>row.keys.forEach(key=>use(key,'06 Everyday verb uses',2000+index,row.verb)));
    return views.sort((a,b)=>a.deck.localeCompare(b.deck)||a.practiceOrder-b.practiceOrder);
  }
  root.ItalianDailyVerbCards = {collection, renderCard, loadCards, collectionCards, referencePattern};
})(window);
