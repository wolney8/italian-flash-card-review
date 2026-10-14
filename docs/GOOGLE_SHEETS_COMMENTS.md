# Google Sheets comment and access-log backend

The review site sends comments and basic page-view events to a private Google Sheet through a Google Apps Script web app.

## Sheet columns

The `Comments` tab uses:

```text
Timestamp | Reviewer | Comment | Scope | Item ID | Lesson | Subdeck | Card Key | Card Summary | Site Version
```

The same table stores both comments and lightweight access events.

### Comment row

```text
Scope: card | deck | lesson | general
Reviewer: name or initials entered by the reviewer
Comment: their feedback
```

### Page-view row

```text
Scope: page_view
Reviewer: saved name/initials, or Anonymous
Comment: Opened lesson overview / Opened L1 / Opened L2 / ...
```

### Reviewer-setting row

```text
Scope: reviewer_identity
Comment: reviewer name or initials saved / cleared
```

## Current website integration

`google-review.js` posts to the deployed Apps Script endpoint by submitting a hidden cross-origin form. This avoids browser CORS restrictions while keeping the reviewer on the Netlify page.

The site:

- labels comments with the card, subdeck or lesson being reviewed;
- logs the lesson overview and each lesson opened once per browser tab session;
- stores an optional reviewer name/initials in that browser;
- leaves the Google Sheet itself private.

## Recommended Apps Script

The deployed script should remain small and only append validated fields to the bound spreadsheet.

```javascript
/** @OnlyCurrentDoc */

const SHEET_NAME = 'Comments';
const MAX_LENGTHS = {
  reviewer: 80,
  comment: 4000,
  scope: 40,
  item_id: 250,
  lesson: 30,
  deck: 250,
  card_key: 250,
  card_summary: 1000,
  site_version: 60,
};

function doPost(e) {
  const values = e && e.parameter ? e.parameter : {};

  // Quietly accept bot-trap submissions without writing them.
  if (clean_(values['bot-field'], 200)) {
    return json_({ ok: true });
  }

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Missing sheet tab: ${SHEET_NAME}`);
  }

  const row = [
    new Date(),
    clean_(values.reviewer, MAX_LENGTHS.reviewer),
    clean_(values.comment, MAX_LENGTHS.comment),
    clean_(values.scope, MAX_LENGTHS.scope),
    clean_(values.item_id, MAX_LENGTHS.item_id),
    clean_(values.lesson, MAX_LENGTHS.lesson),
    clean_(values.deck, MAX_LENGTHS.deck),
    clean_(values.card_key, MAX_LENGTHS.card_key),
    clean_(values.card_summary, MAX_LENGTHS.card_summary),
    clean_(values.site_version, MAX_LENGTHS.site_version),
  ];

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return json_({ ok: true });
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deployment settings

Deploy as a web app using:

```text
Execute as: Me
Who has access: Anyone
```

The `exec` URL must remain the production web-app URL used in `index.html` and `google-review.js`.

After changing Apps Script code:

1. Save the script.
2. Choose **Deploy → Manage deployments**.
3. Edit the existing web-app deployment.
4. Select **New version**.
5. Deploy.
6. Confirm the `exec` URL remains unchanged.

## Security boundary

The endpoint is public and can be discovered in the website source. It is not a password or a secret.

The script should therefore:

- only append to the intended sheet;
- never return spreadsheet contents;
- avoid Drive, Gmail or other unrelated services;
- validate and limit input lengths;
- keep the spreadsheet private;
- use Netlify password protection if the review website should only be accessible to invited reviewers.

The main realistic risk for this small review site is unwanted or spam rows, not public reading of the Sheet.
