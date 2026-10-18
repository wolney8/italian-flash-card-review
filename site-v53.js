(function () {
  const SITE_VERSION = '5.3-review-1';
  const PATCH_FILES = Array.from({ length: 5 }, (_, index) => `data/v53-patch-${String(index + 1).padStart(2, '0')}.txt`);

  async function decodePatch(encoded) {
    const bytes = Uint8Array.from(atob(encoded.trim()), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function ruleVersion() {
    if (typeof submitToGoogleSheet === 'function' && !submitToGoogleSheet.__v53Wrapped) {
      const previous = submitToGoogleSheet;
      const wrapped = function (fields) { return previous({ ...fields, site_version: SITE_VERSION }); };
      wrapped.__v53Wrapped = true;
      submitToGoogleSheet = wrapped;
    }
    document.querySelectorAll('input[name="site_version"]').forEach(input => { input.value = SITE_VERSION; });
  }

  function applyPatch(payload) {
    const updates = new Map((payload.upsert || []).map(card => [card.key, card]));
    cards = cards.map(card => updates.get(card.key) || card);
    (payload.upsert || []).forEach(card => { if (!cards.some(existing => existing.key === card.key)) cards.push(card); });
    updateDeckOptions();
    renderNavigation();
    renderView();
    ruleVersion();
    document.querySelector('.site-footer')?.replaceChildren(document.createTextNode('Italian for Beginners - BSE Course · Version 5.3 review site'));
    window.__ITALIAN_V53_READY__ = true;
  }

  async function initialise() {
    const encoded = (await Promise.all(PATCH_FILES.map(async file => {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load the v5.3 card refinements.');
      return (await response.text()).trim();
    }))).join('');
    const payload = await decodePatch(encoded);
    const waitForV52 = () => {
      if (typeof cards !== 'undefined' && Array.isArray(cards) && cards.some(card => card.key === 'italian-l4-avere-infinitive')) {
        applyPatch(payload);
        return;
      }
      window.setTimeout(waitForV52, 80);
    };
    waitForV52();
  }

  initialise().catch(error => console.error('v5.3 site update failed:', error));
})();
