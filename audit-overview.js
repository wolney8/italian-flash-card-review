(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('audit') !== '1') return;

  let timer = null;

  function removeBanner() {
    document.getElementById('auditOverviewBanner')?.remove();
  }

  function renderBanner() {
    if (!window.__ITALIAN_V55_READY__) return;

    const app = document.getElementById('app');
    if (!app) return;

    if (typeof currentLesson !== 'undefined' && currentLesson) {
      removeBanner();
      return;
    }

    if (document.getElementById('auditOverviewBanner')) return;

    const anchor = app.querySelector('.review-guide') || app.firstElementChild;
    if (!anchor) return;

    const banner = document.createElement('section');
    banner.id = 'auditOverviewBanner';
    banner.className = 'audit-panel';
    banner.innerHTML = `
      <div class="audit-panel-grid">
        <div>
          <p class="eyebrow">Personal audit mode is active</p>
          <h2>Open a lesson to see the audit controls</h2>
          <p>The <strong>Reviewed OK</strong>, <strong>Needs change</strong> and <strong>Remove</strong> controls appear beneath each card inside a lesson.</p>
        </div>
        <div class="audit-controls" aria-label="Open a lesson for auditing">
          <button type="button" data-lesson-nav="L1">Audit Lesson 1</button>
          <button type="button" data-lesson-nav="L2">Audit Lesson 2</button>
          <button type="button" data-lesson-nav="L3">Audit Lesson 3</button>
          <button type="button" data-lesson-nav="L4">Audit Lesson 4</button>
        </div>
      </div>`;

    anchor.insertAdjacentElement('beforebegin', banner);
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(renderBanner, 80);
  }

  const app = document.getElementById('app');
  if (app) new MutationObserver(schedule).observe(app, { childList: true, subtree: true });

  window.addEventListener('hashchange', schedule);

  const wait = () => {
    if (window.__ITALIAN_V55_READY__) renderBanner();
    else window.setTimeout(wait, 100);
  };
  wait();
})();
