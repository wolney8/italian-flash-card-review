(function () {
  const SITE_UPDATED = '21 October 2026';
  const SITE_VERSION = '2026-10-21-final-2';

  const PAIRS = {
    'italian-l4-plural-article-pair-maestri': { definite:'i', partitive:'dei', noun:'maestri', gloss:'teachers', gender:'masculine', condition:'before most consonants', base:'i' },
    'italian-l4-plural-article-pair-maestre': { definite:'le', partitive:'delle', noun:'maestre', gloss:'teachers', gender:'feminine', condition:'all feminine plural nouns', base:'le' },
    'italian-l4-plural-article-pair-amici': { definite:'gli', partitive:'degli', noun:'amici', gloss:'friends', gender:'masculine', condition:'before a vowel', base:'gli' },
    'italian-l4-plural-article-pair-amiche': { definite:'le', partitive:'delle', noun:'amiche', gloss:'friends', gender:'feminine', condition:'all feminine plural nouns', base:'le' },
    'italian-l4-plural-article-pair-stranieri': { definite:'gli', partitive:'degli', noun:'stranieri', gloss:'foreigners', gender:'masculine', condition:'before s + consonant', base:'gli' },
    'italian-l4-plural-article-pair-straniere': { definite:'le', partitive:'delle', noun:'straniere', gloss:'foreigners', gender:'feminine', condition:'all feminine plural nouns', base:'le' },
    'italian-l4-plural-article-pair-zii': { definite:'gli', partitive:'degli', noun:'zii', gloss:'uncles', gender:'masculine', condition:'before z', base:'gli' },
    'italian-l4-plural-article-pair-zie': { definite:'le', partitive:'delle', noun:'zie', gloss:'aunts', gender:'feminine', condition:'all feminine plural nouns', base:'le' }
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
  }

  function cleanHeroPanel(panel) {
    if (!panel || (!panel.includes('panel-title') && !panel.includes('panel-badge'))) return panel;
    const template = document.createElement('template');
    template.innerHTML = panel;
    template.content.querySelectorAll('.panel-title .gram, .panel-badge .gram').forEach(span => {
      span.replaceWith(...span.childNodes);
    });
    return template.innerHTML;
  }

  function semantic(word, gender) {
    return `<span class="gram ${gender === 'masculine' ? 'masc' : 'fem'}">${esc(word)}</span>`;
  }
  function articleTile(article, meaning, config, partitive) {
    const build = partitive ? `<div class="micro-rule">built from <strong>di + ${esc(config.base)}</strong></div>` : '';
    return `<div class="word-tile article-tile"><span class="italian-unit" lang="it">${esc(article)}</span><span class="primary-gloss">${esc(meaning)}</span><div class="semantic-row">${semantic(config.gender, config.gender)}<span class="gram plur">plural</span></div><div class="condition">${esc(config.condition)}</div>${build}</div>`;
  }
  function nounTile(config) {
    return `<div class="word-tile noun-tile"><span class="italian-unit" lang="it">${esc(config.noun)}</span><span class="primary-gloss">${esc(config.gloss)}</span></div>`;
  }
  function literal(config) {
    return `<div class="literal-pair-grid"><div class="phrase-group">${articleTile(config.definite,'the',config,false)}${nounTile(config)}</div><div class="phrase-group">${articleTile(config.partitive,'some',config,true)}${nounTile(config)}</div></div>`;
  }
  function clarification(config, existing) {
    const marker = '<hr><div class="ipa-memory-aid">';
    const ipa = String(existing || '').includes(marker) ? marker + String(existing).split(marker)[1] : '';
    const cls = config.gender === 'masculine' ? 'masc' : 'fem';
    return `Lesson 2 introduced this article family. Lesson 4 now applies it to a complete noun phrase and contrasts definite “the” with partitive/indefinite <span class="gram plur">plural</span> “some”. <span class="gram ${cls}">${config.gender.charAt(0).toUpperCase() + config.gender.slice(1)}</span> <span class="gram plur">plural</span>, ${esc(config.condition)}.${ipa}`;
  }

  function installStyles() {
    if (document.getElementById('literalLayoutFinalStylesV2')) return;
    const style = document.createElement('style');
    style.id = 'literalLayoutFinalStylesV2';
    style.textContent = `
      .gram{display:inline-block!important;width:max-content!important;max-width:100%;padding:0!important;border-radius:0!important;border-bottom:2px solid currentColor!important;line-height:1.12;vertical-align:baseline}
      .panel-badge .gram,.panel-title .gram{color:inherit!important;border-bottom:0!important;border-radius:0!important;padding:0!important;width:auto!important;max-width:none!important;font-weight:inherit!important}
      .tiles{display:flex!important;flex-wrap:wrap!important;align-items:stretch!important;justify-content:flex-start;gap:10px!important}
      .word-tile{display:flex!important;flex:1 1 170px!important;flex-direction:column!important;justify-content:flex-start!important;min-width:150px!important;max-width:260px!important;min-height:110px!important;width:auto!important;height:auto!important;padding:13px 15px!important}
      .word-tile small{margin-top:auto!important;padding-top:10px!important}
      .literal>.tiles{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;grid-auto-rows:1fr!important;align-items:stretch!important;justify-items:stretch!important;gap:10px!important}
      .literal>.tiles>.word-tile{display:flex!important;flex:none!important;align-self:stretch!important;min-width:0!important;max-width:none!important;width:100%!important;height:100%!important;margin:0!important}
      .literal-pair-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:stretch;margin:10px 0}
      .phrase-group{min-width:0;display:grid;grid-template-columns:minmax(170px,1.25fr) minmax(105px,.75fr);gap:10px;align-items:stretch}
      .phrase-group .word-tile{min-width:0!important;max-width:none!important;width:100%!important;height:100%!important;margin:0!important}
      .italian-unit{display:block;font-size:20px;font-weight:850;line-height:1.15}
      .primary-gloss{display:block;color:var(--muted);margin-top:7px}
      .semantic-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
      .condition{margin-top:12px;color:var(--ink);font-size:13px;line-height:1.35}
      .micro-rule{margin-top:auto;padding-top:13px;color:var(--green);font-size:13px;line-height:1.35}
      .noun-tile .primary-gloss{margin-top:auto;padding-top:16px}
      @media(max-width:620px){.word-tile{flex-basis:145px!important;min-width:130px!important;max-width:100%!important}.literal>.tiles{grid-template-columns:1fr!important}.literal-pair-grid{grid-template-columns:1fr}.phrase-group{grid-template-columns:minmax(145px,1.2fr) minmax(90px,.8fr)}}
    `;
    document.head.appendChild(style);
  }

  function setUpdatedReference() {
    document.querySelectorAll('input[name="site_version"]').forEach(input => { if (input.value !== SITE_VERSION) input.value = SITE_VERSION; });
    const footer = document.querySelector('.site-footer');
    const desiredFooter = `Italian for Beginners - BSE Course · <time datetime="2026-10-21">Last updated ${SITE_UPDATED}</time>`;
    if (footer && footer.innerHTML !== desiredFooter) footer.innerHTML = desiredFooter;
    const meta = document.querySelector('meta[name="description"]');
    const desiredDescription = `Italian for Beginners - BSE Course flash-card learning and review for Lessons 1–4. Last updated ${SITE_UPDATED}.`;
    if (meta?.getAttribute('content') !== desiredDescription) meta?.setAttribute('content', desiredDescription);
  }

  function installDirectSubmit() {
    const form = document.getElementById('reviewForm');
    if (!form?.action) return;
    const endpoint = form.action;
    const target = form.target || 'googleReviewSink';
    submitToGoogleSheet = function(fields) {
      const post = document.createElement('form');
      post.method = 'POST'; post.action = endpoint; post.target = target; post.hidden = true;
      Object.entries({...fields, site_version:SITE_VERSION}).forEach(([name,value]) => {
        const input = document.createElement('input'); input.type='hidden'; input.name=name; input.value=String(value ?? ''); post.appendChild(input);
      });
      document.body.appendChild(post); HTMLFormElement.prototype.submit.call(post); setTimeout(() => post.remove(), 1500);
    };
  }

  function apply() {
    if (!Array.isArray(cards) || !cards.length || window.__LITERAL_LAYOUT_FINAL_V2__) return;
    cards = cards.map(original => {
      const base = {...original, panel: cleanHeroPanel(original.panel)};
      const config = PAIRS[base.key];
      if (!config) return base;
      return {...base, literal: literal(config), clarification: clarification(config, base.clarification)};
    });
    installStyles(); installDirectSubmit(); setUpdatedReference();
    window.__LITERAL_LAYOUT_FINAL__ = true;
    window.__LITERAL_LAYOUT_FINAL_V2__ = true;
    updateDeckOptions(); renderNavigation(); renderView();
  }

  function wait() {
    if (window.__SEMANTIC_V623_READY__ && window.__CARD_FLIP_EXPERIENCE_V624__ && Array.isArray(cards)) apply();
    else setTimeout(wait, 80);
  }

  new MutationObserver(setUpdatedReference).observe(document.documentElement,{childList:true,subtree:true});
  wait();
})();
