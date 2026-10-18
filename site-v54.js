(function () {
  const SITE_VERSION = '5.4-review-1';
  const PATCH_FILES = Array.from({ length: 1 }, (_, index) => `data/v54-patch-${String(index + 1).padStart(2, '0')}.txt`);
  async function decode(encoded) {
    const bytes = Uint8Array.from(atob(encoded.trim()), c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }
  function apply(payload) {
    const updates = new Map((payload.upsert || []).map(card => [card.key, card]));
    cards = cards.map(card => updates.get(card.key) || card);
    updateDeckOptions(); renderNavigation(); renderView();
    if (typeof submitToGoogleSheet === 'function' && !submitToGoogleSheet.__v54Wrapped) {
      const previous = submitToGoogleSheet;
      const wrapped = fields => previous({ ...fields, site_version: SITE_VERSION });
      wrapped.__v54Wrapped = true; submitToGoogleSheet = wrapped;
    }
    document.querySelectorAll('input[name="site_version"]').forEach(input => input.value = SITE_VERSION);
    document.querySelector('.site-footer')?.replaceChildren(document.createTextNode('Italian for Beginners - BSE Course · Version 5.4 review site'));
    window.__ITALIAN_V54_READY__ = true;
  }
  async function initialise() {
    const encoded=(await Promise.all(PATCH_FILES.map(async file=>{const r=await fetch(file,{cache:'no-store'});if(!r.ok)throw new Error('Could not load v5.4 refinements');return (await r.text()).trim();}))).join('');
    const payload=await decode(encoded);
    const wait=()=>{if(window.__ITALIAN_V53_READY__&&typeof cards!=='undefined'&&Array.isArray(cards)&&cards.some(c=>c.key==='italian-l4-age-figli-7-10'))apply(payload);else setTimeout(wait,80);}; wait();
  }
  initialise().catch(error=>console.error('v5.4 site update failed:',error));
})();
