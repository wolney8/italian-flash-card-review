(function () {
  const SITE_VERSION = '5.2-review-1';
  const PATCH_FILES = Array.from(
    { length: 6 },
    (_, index) => `data/v52-patch-${String(index + 1).padStart(2, '0')}.txt`
  );

  function decodePatch(encoded) {
    const bytes = Uint8Array.from(atob(encoded.trim()), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text().then(JSON.parse);
  }

  function patchLessonMetadata() {
    if (typeof lessonMeta !== 'function') return;
    const originalLessonMeta = lessonMeta;
    lessonMeta = function (lesson) {
      if (lesson === 'L4') {
        return {
          number: '4',
          title: 'Avere, Numbers, Plurals and Family',
          description: 'The verb avere, silent H, numbers 0–20, plural forms, articles and family vocabulary.'
        };
      }
      return originalLessonMeta(lesson);
    };
  }

  function patchTrackingVersion() {
    if (typeof submitToGoogleSheet !== 'function') return;
    const originalSubmit = submitToGoogleSheet;
    submitToGoogleSheet = function (fields) {
      return originalSubmit({ ...fields, site_version: SITE_VERSION });
    };
  }

  function applyPatch(payload) {
    const remove = new Set(payload.remove || []);
    const updates = new Map((payload.upsert || []).map(card => [card.key, card]));
    const existingKeys = new Set();

    cards = cards
      .filter(card => !remove.has(card.key))
      .map(card => {
        existingKeys.add(card.key);
        return updates.get(card.key) || card;
      });

    (payload.upsert || []).forEach(card => {
      if (!existingKeys.has(card.key)) cards.push(card);
    });

    const requestedLesson = location.hash.match(/^#lesson-(L\d+)$/i)?.[1]?.toUpperCase() || null;
    if (requestedLesson && cards.some(card => card.lesson === requestedLesson)) {
      currentLesson = requestedLesson;
    }

    updateDeckOptions();
    renderNavigation();
    renderView();

    document.querySelector('.site-footer')?.replaceChildren(
      document.createTextNode('Italian for Beginners - BSE Course · Version 5.2 review site')
    );
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Italian for Beginners - BSE Course flash-card review for Lessons 1–4.'
    );
  }

  async function initialise() {
    patchLessonMetadata();
    patchTrackingVersion();

    const encoded = (await Promise.all(PATCH_FILES.map(async file => {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load the v5.2 lesson update.');
      return (await response.text()).trim();
    }))).join('');
    const payload = await decodePatch(encoded);

    const waitForCards = () => {
      if (typeof cards !== 'undefined' && Array.isArray(cards) && cards.length) {
        applyPatch(payload);
        return;
      }
      window.setTimeout(waitForCards, 60);
    };
    waitForCards();
  }

  initialise().catch(error => console.error('v5.2 site update failed:', error));
})();
