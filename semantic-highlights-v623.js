(function () {
  const SITE_VERSION = '6.2.3';
  const TOKEN_CLASS = {
    informal: 'informal', informally: 'informal', informale: 'informal',
    formal: 'formal', formally: 'formal', formale: 'formal',
    masculine: 'masc', maschile: 'masc', male: 'masc',
    feminine: 'fem', femminile: 'fem', female: 'fem',
    singular: 'sing', singolare: 'sing',
    plural: 'plur', plurale: 'plur'
  };
  const TOKEN_RE = /\b(informally|informal|informale|formally|formal|formale|masculine|maschile|male|feminine|femminile|female|singular|singolare|plural|plurale)\b/gi;

  function installStyles() {
    if (document.getElementById('semanticV623Styles')) return;
    const style = document.createElement('style');
    style.id = 'semanticV623Styles';
    style.textContent = `
      body.card{
        --semantic-informal:#ffbf69;--semantic-formal:#d2b5ff;
        --semantic-masculine:#9ac8ff;--semantic-feminine:#ffb3d1;
        --semantic-singular:#ffd166;--semantic-plural:#9ee3cf;
      }
      body.card:not(.nightMode):not(.night_mode){
        --semantic-informal:#8a4b00;--semantic-formal:#6741a3;
        --semantic-masculine:#165da6;--semantic-feminine:#9d2e62;
        --semantic-singular:#775500;--semantic-plural:#146a56;
      }
      .gram{display:inline;padding:0 .08em;border-radius:.18em;font-weight:850;border-bottom:3px solid currentColor}
      .gram.informal{color:var(--semantic-informal)}.gram.formal{color:var(--semantic-formal)}
      .gram.masc{color:var(--semantic-masculine)}.gram.fem{color:var(--semantic-feminine)}
      .gram.sing{color:var(--semantic-singular)}.gram.plur{color:var(--semantic-plural)}
      .answer-guidance{margin-top:14px;padding:11px 13px;border-left:4px solid var(--accent);border-radius:7px;background:var(--paper2);font-size:15px}
    `;
    document.head.appendChild(style);
  }

  function wrapTextNode(node) {
    const text = node.nodeValue || '';
    TOKEN_RE.lastIndex = 0;
    if (!TOKEN_RE.test(text)) return;
    TOKEN_RE.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let last = 0;
    text.replace(TOKEN_RE, (match, _token, offset) => {
      if (offset > last) fragment.append(document.createTextNode(text.slice(last, offset)));
      const span = document.createElement('span');
      span.className = `gram ${TOKEN_CLASS[match.toLowerCase()]}`;
      span.textContent = match;
      fragment.append(span);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) fragment.append(document.createTextNode(text.slice(last)));
    node.replaceWith(fragment);
  }

  function colourSemanticTerms(html) {
    if (!html) return html;
    const template = document.createElement('template');
    template.innerHTML = html;
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (!parent || parent.closest('.gram, script, style')) return;
      wrapTextNode(node);
    });
    return template.innerHTML;
  }

  function simplifyNameAnswers(card) {
    if (card.key === 'conversation_name_tu') {
      card.answer = '<strong>Come ti chiami?</strong>';
      if (!String(card.usage || '').includes('Tu, come ti chiami?')) {
        card.usage = `${card.usage || ''}<p class="answer-guidance"><strong>Optional for contrast or emphasis:</strong> <span lang="it">Tu, come ti chiami?</span> State <strong>tu</strong> when contrasting or emphasising the person addressed.</p>`;
      }
    }
    if (card.key === 'conversation_name_lei') {
      card.answer = '<strong>Come si chiama?</strong>';
      if (!String(card.usage || '').includes('Lei, come si chiama?')) {
        card.usage = `${card.usage || ''}<p class="answer-guidance"><strong>Optional for clarity or emphasis:</strong> <span lang="it">Lei, come si chiama?</span> State <strong>Lei</strong> when clarity or emphasis is useful.</p>`;
      }
    }
    return card;
  }

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__SEMANTIC_V623_READY__) return;
    const fields = ['panel','prompt','answer','meaning','literal','usage','pattern','clarification'];
    cards = cards.map(original => {
      const card = simplifyNameAnswers({ ...original });
      fields.forEach(field => { if (card[field]) card[field] = colourSemanticTerms(card[field]); });
      return card;
    });
    installStyles();
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
    document.querySelector('.site-footer')?.replaceChildren(document.createTextNode('Italian for Beginners - BSE Course · Version 6.2.3'));
    window.__SEMANTIC_V623_READY__ = true;
    updateDeckOptions();
    renderNavigation();
    renderView();
  }

  function wait() {
    if (window.__COMPACT_PRON_FINAL_V622__ && window.__ARTICLE_PROGRESSION_V62__ && Array.isArray(cards)) apply();
    else window.setTimeout(wait, 80);
  }

  wait();
})();
