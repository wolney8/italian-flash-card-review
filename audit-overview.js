(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('audit') !== '1') return;

  let timer = null;

  function removeBanner() {
    document.getElementById('auditOverviewBanner')?.remove();
  }

  function renderBanner() {
    const app = document.getElementById('app');
    if (!app || typeof cards === 'undefined' || !Array.isArray(cards) || !cards.length) return;

    if (typeof currentLesson !== 'undefined' && currentLesson) {
      removeBanner();
      return;
    }

    if (document.getElementById('auditOverviewBanner')) return;

    const anchor = app.querySelector('.review-guide') || app.firstElementChild;
    if (!anchor) return;

    const banner = document.createElement('section');
    banner.id = 'auditOverviewBanner';
    banner.className = 'audit-panel audit-panel-prominent';
    banner.innerHTML = `
      <div class="audit-panel-grid">
        <div>
          <p class="eyebrow">Personal audit mode is active</p>
          <h2>Choose a lesson to begin the card-by-card audit</h2>
          <p>The <strong>Reviewed OK</strong>, <strong>Needs change</strong> and <strong>Remove</strong> controls appear near the top of every card.</p>
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
    if (typeof cards !== 'undefined' && Array.isArray(cards) && cards.length) renderBanner();
    else window.setTimeout(wait, 100);
  };
  wait();
})();
