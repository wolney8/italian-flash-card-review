(function () {
  const SITE_VERSION = '6.2.2-compact-pronunciation-candidate';
  const FILES = ['data/pron-v62-01.txt', 'data/pron-v62-02.txt', 'data/pron-v62-03.txt'];
  const IPA_HELP = '<div class="ipa-memory-aid"><p class="field-heading">How do I read the IPA?</p><p>Use the English-friendly line to speak. The IPA is the precision guide: <b>ˈ</b> marks the stressed syllable; <b>ɛ</b> is open <i>e</i> as in British “bed”; <b>e</b> is a pure closed <i>e</i>; <b>ɔ</b> is open <i>o</i> as in British “off”; <b>o</b> is a pure closed <i>o</i>; <b>ɲ</b> = “ny”; <b>ʎ</b> = “ly”; <b>tʃ</b> = “ch”; <b>dʒ</b> = “j”. Tap or roll <b>r</b>, and hold doubled consonants slightly longer.</p></div>';

  async function decode(encoded) {
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function compactPronunciation(value) {
    if (!value) return '';
    const template = document.createElement('template');
    template.innerHTML = value;
    if (template.content.querySelector('.pron-na') || /Not applicable/i.test(template.content.textContent || '')) return '';
    const guide = template.content.querySelector('.pron-guide')?.innerHTML?.trim();
    const ipa = template.content.querySelector('.pron-ipa')?.innerHTML?.trim();
    if (!guide || !ipa) return value;
    return `<div class="pronunciation-compact"><div class="pron-guide-line">${guide}</div><div class="pron-ipa-line">${ipa}</div></div>`;
  }

  function appendIpaHelp(value) {
    const existing = String(value || '').replace(/<div class="ipa-memory-aid">[\s\S]*?<\/div>\s*/g, '').trim();
    return `${existing}${existing ? '<hr>' : ''}${IPA_HELP}`;
  }

  function installStyles() {
    if (document.getElementById('pronV62Styles')) return;
    const style = document.createElement('style');
    style.id = 'pronV62Styles';
    style.textContent = `
      /* v6.2.2 compact pronunciation and equal-height literal tiles */
      .tiles{align-items:stretch!important}
      .word-tile{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;min-height:92px;height:auto}
      .word-tile small{margin-top:auto!important;padding-top:8px}
      .phon .pronunciation-compact{margin:6px 0 18px;text-align:left}
      .pron-guide-line{font-size:23px;line-height:1.4;color:var(--green)}
      .pron-ipa-line{margin-top:4px;font-family:"Noto Sans","DejaVu Sans",sans-serif;font-size:17px;line-height:1.45;color:var(--muted)}
      .ipa-memory-aid{font-size:14px;line-height:1.65;color:var(--muted)}
      .ipa-memory-aid .field-heading{margin-top:0;color:var(--green)}
      @media(max-width:620px){.word-tile{min-height:82px}.pron-guide-line{font-size:20px}.pron-ipa-line{font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function installMemoryAidLabel() {
    if (typeof renderCard !== 'function' || renderCard.__compactPronunciationWrapped) return;
    const previous = renderCard;
    const wrapped = function (...args) {
      return previous(...args).replace('<summary>Clarification</summary>', '<summary>Memory aid and extra information</summary>');
    };
    wrapped.__compactPronunciationWrapped = true;
    renderCard = wrapped;
  }

  async function init() {
    const encoded = (await Promise.all(FILES.map(async file => {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${file}`);
      return (await response.text()).trim();
    }))).join('');
    const map = await decode(encoded);

    const wait = () => {
      if (Array.isArray(cards) && cards.length && window.__LESSON3_REVISION_20261020__) {
        cards = cards.map(card => {
          const merged = map[card.key] ? { ...card, ...map[card.key] } : { ...card };
          const compact = compactPronunciation(merged.pron);
          merged.pron = compact;
          if (compact) merged.clarification = appendIpaHelp(merged.clarification);
          return merged;
        });
        installStyles();
        installMemoryAidLabel();
        document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
        document.querySelector('.site-footer')?.replaceChildren(document.createTextNode('Italian for Beginners - BSE Course · Version 6.2.2 compact pronunciation candidate'));
        updateDeckOptions();
        renderNavigation();
        renderView();
        window.__PRON_V62_READY__ = true;
      } else {
        window.setTimeout(wait, 80);
      }
    };
    wait();
  }

  init().catch(error => console.error('v6.2.2 compact pronunciation candidate failed', error));
})();