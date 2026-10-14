# Privacy and access tracking

## What the review site records

The website records lightweight review activity in a private Google Sheet:

- the time a page or lesson was opened;
- the lesson being viewed;
- an optional reviewer name or initials;
- submitted review comments;
- the card, subdeck or lesson connected to a comment;
- the review-site version.

## What the website does not deliberately record

The custom review code does not deliberately collect:

- email addresses;
- Google account identities;
- IP addresses;
- precise location;
- advertising identifiers;
- browsing activity outside this review site.

Hosting providers such as Netlify and Google may maintain their own operational and security logs under their own terms.

## Reviewer identity

The reviewer-name field is optional.

- If a reviewer enters a name or initials, the value is stored in that browser and used to label later page views and comments.
- If they leave it blank, access events are labelled `Anonymous`.
- A reviewer can clear the field and select **Save** to remove the locally stored value.

The entered identity is self-declared. It does not authenticate the person. A shared or forwarded link can therefore not prove who used it.

## Access control

An unlisted Netlify URL is still a public URL. Sharing it only with one person reduces exposure but does not make the site private.

For a tutor-only review, use Netlify project password protection and share the password separately.

## Data retention

Review comments and access events remain in the private Google Sheet until the sheet owner deletes them. Before sharing the site, decide how long they need to be retained and remove obsolete review records when the review has finished.

## Suggested notice shown to reviewers

> This site records the lesson pages opened and comments submitted in a private review spreadsheet. Entering a name or initials is optional and is only used to label review activity.
