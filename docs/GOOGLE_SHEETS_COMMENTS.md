# Google Sheets comment backend (optional)

The review site currently uses Netlify Forms. If comments need to be written directly into a Google Sheet instead, use a small Google Apps Script web app.

## Why a backend is needed

A public static website should not contain private Google credentials. The Apps Script web app receives the comment and appends it to a Sheet without exposing your Google account.

## Suggested Sheet columns

Create a Sheet tab named `Comments` with:

```text
Timestamp | Reviewer | Comment | Scope | Item ID | Lesson | Subdeck | Card Key | Card Summary | Site Version
```

## Apps Script

Open the spreadsheet, then choose **Extensions → Apps Script** and paste:

```javascript
const SHEET_NAME = 'Comments';

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Missing sheet tab: ${SHEET_NAME}`);
  }

  sheet.appendRow([
    new Date(),
    e.parameter.reviewer || '',
    e.parameter.comment || '',
    e.parameter.scope || '',
    e.parameter.item_id || '',
    e.parameter.lesson || '',
    e.parameter.deck || '',
    e.parameter.card_key || '',
    e.parameter.card_summary || '',
    e.parameter.site_version || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy it as a web app:

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Copy the web-app URL

The review site can then be switched from Netlify Forms to that URL. Existing card IDs remain unchanged, so comments continue to identify the same cards after future lesson updates.

## Simpler alternative

A Google Form linked to a Google Sheet also works, but it normally opens or embeds a separate form. Apps Script gives the smoother in-page comment experience.
