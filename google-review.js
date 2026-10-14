const GOOGLE_REVIEW_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyBZwlHEKrcPVnLRGKVgorqGf-3K9yU9GWcuoRSqAt1UwTdVauUW_ZmYWle7Z050uZbww/exec';
const GOOGLE_REVIEW_TARGET = 'googleReviewSink';
const REVIEWER_STORAGE_KEY = 'italianFlashCardReviewer';
const ACCESS_STORAGE_KEY = 'italianFlashCardPagesSeen';
const REVIEW_SITE_VERSION = '5.1-review-3';

function googleReviewValue(value) {
  return String(value ?? '').trim();
}

function getSavedReviewer() {
  return googleReviewValue(localStorage.getItem(REVIEWER_STORAGE_KEY));
}

function setSavedReviewer(value) {
  const reviewer = googleReviewValue(value);
  if (reviewer) localStorage.setItem(REVIEWER_STORAGE_KEY, reviewer);
  else localStorage.removeItem(REVIEWER_STORAGE_KEY);
  return reviewer;
}

function reviewerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return googleReviewValue(params.get('reviewer') || params.get('r'));
}

function submitToGoogleSheet(fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GOOGLE_REVIEW_ENDPOINT;
  form.target = GOOGLE_REVIEW_TARGET;
  form.hidden = true;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  HTMLFormElement.prototype.submit.call(form);
  window.setTimeout(() => form.remove(), 1500);
}

function currentLessonCode() {
  const match = window.location.hash.match(/^#lesson-(L\d+)$/i);
  return match ? match[1].toUpperCase() : '';
}

function pageTrackingKey() {
  return `${window.location.pathname}${window.location.hash || '#lessons'}`;
}

function readSeenPages() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(ACCESS_STORAGE_KEY) || '[]'));
  } catch (_) {
    return new Set();
  }
}

function writeSeenPages(seen) {
  sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify([...seen]));
}

function trackCurrentPage() {
  const key = pageTrackingKey();
  const seen = readSeenPages();
  if (seen.has(key)) return;

  seen.add(key);
  writeSeenPages(seen);

  const lesson = currentLessonCode();
  submitToGoogleSheet({
    reviewer: getSavedReviewer() || 'Anonymous',
    comment: lesson ? `Opened ${lesson}` : 'Opened lesson overview',
    scope: 'page_view',
    item_id: lesson ? `page:${lesson}` : 'page:overview',
    lesson,
    deck: '',
    card_key: '',
    card_summary: `${document.title} | ${window.location.pathname}${window.location.hash}`,
    site_version: REVIEW_SITE_VERSION
  });
}

function renderReviewerIdentity() {
  const mount = document.getElementById('reviewerIdentityMount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="reviewer-identity" aria-label="Reviewer identity and access logging">
      <div class="reviewer-identity-copy">
        <strong>Reviewer name or initials</strong>
        <span>Optional. Used to label page visits and comments in a private review spreadsheet.</span>
      </div>
      <form id="reviewerIdentityForm" class="reviewer-identity-form">
        <input id="reviewerIdentityInput" type="text" maxlength="80" autocomplete="name" placeholder="e.g. Laura or LC">
        <button type="submit">Save</button>
      </form>
      <span id="reviewerIdentityStatus" class="reviewer-identity-status" aria-live="polite"></span>
    </section>
    <p class="review-tracking-note">This site records the lesson pages opened and comments submitted. It does not try to identify a visitor unless they enter a name or initials.</p>
  `;

  const identityForm = document.getElementById('reviewerIdentityForm');
  const identityInput = document.getElementById('reviewerIdentityInput');
  const identityStatus = document.getElementById('reviewerIdentityStatus');
  const fromUrl = reviewerFromUrl();
  const initial = fromUrl || getSavedReviewer();

  if (initial) {
    setSavedReviewer(initial);
    identityInput.value = initial;
    identityStatus.textContent = `Review activity will be labelled ${initial}.`;
  }

  identityForm.addEventListener('submit', event => {
    event.preventDefault();
    const reviewer = setSavedReviewer(identityInput.value);
    const visibleReviewer = reviewer || 'Anonymous';

    identityStatus.textContent = reviewer
      ? `Review activity will be labelled ${reviewer}.`
      : 'Review activity will be labelled Anonymous.';

    const modalReviewer = document.getElementById('reviewer');
    if (modalReviewer) modalReviewer.value = reviewer;

    submitToGoogleSheet({
      reviewer: visibleReviewer,
      comment: reviewer ? 'Reviewer name or initials saved' : 'Reviewer identity cleared',
      scope: 'reviewer_identity',
      item_id: 'reviewer:identity',
      lesson: currentLessonCode(),
      deck: '',
      card_key: '',
      card_summary: 'Reviewer identity setting changed',
      site_version: REVIEW_SITE_VERSION
    });
  });
}

function fillModalReviewer() {
  const reviewerField = document.getElementById('reviewer');
  if (reviewerField && !reviewerField.value) reviewerField.value = getSavedReviewer();
}

function installModalObserver() {
  const modal = document.getElementById('reviewModal');
  if (!modal) return;

  const observer = new MutationObserver(() => {
    if (!modal.hidden) fillModalReviewer();
  });

  observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
}

function installGoogleCommentHandler() {
  const form = document.getElementById('reviewForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    if (googleReviewValue(formData.get('bot-field'))) return;

    const reviewer = googleReviewValue(formData.get('reviewer')) || getSavedReviewer() || 'Anonymous';
    if (reviewer !== 'Anonymous') setSavedReviewer(reviewer);

    const payload = {
      reviewer,
      comment: googleReviewValue(formData.get('comment')),
      scope: googleReviewValue(formData.get('scope')),
      item_id: googleReviewValue(formData.get('item_id')),
      lesson: googleReviewValue(formData.get('lesson')),
      deck: googleReviewValue(formData.get('deck')),
      card_key: googleReviewValue(formData.get('card_key')),
      card_summary: googleReviewValue(formData.get('card_summary')),
      site_version: REVIEW_SITE_VERSION
    };

    const submitButton = form.querySelector('.modal-submit');
    submitButton.disabled = true;
    status.classList.remove('error');
    status.textContent = 'Sending to the private review spreadsheet…';

    try {
      submitToGoogleSheet(payload);
      status.textContent = 'Thank you — your comment was sent to the review spreadsheet.';
      const commentField = document.getElementById('comment');
      if (commentField) commentField.value = '';
      window.setTimeout(() => {
        const closeButton = form.querySelector('[data-close-modal]');
        if (closeButton) closeButton.click();
      }, 1200);
    } catch (error) {
      console.error(error);
      status.classList.add('error');
      status.textContent = 'The comment could not be sent. Please copy it and send it directly.';
    } finally {
      window.setTimeout(() => { submitButton.disabled = false; }, 1200);
    }
  }, true);
}

function initialiseGoogleReviewBackend() {
  renderReviewerIdentity();
  installModalObserver();
  installGoogleCommentHandler();

  window.setTimeout(trackCurrentPage, 1400);
  window.addEventListener('hashchange', () => window.setTimeout(trackCurrentPage, 300));
}

initialiseGoogleReviewBackend();
