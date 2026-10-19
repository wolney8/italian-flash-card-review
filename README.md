# Italian for Beginners - BSE Course

Review site for the class-shareable flash-card decks created from Lessons 1–4 of the Italian for Beginners course.

## Live review site

Netlify publishes this repository as:

`https://italian-flash-card-review.netlify.app`

The site lets reviewers:

- open one lesson at a time;
- inspect the **Recall side** and **Answer side** of each flash card;
- move through cards with the normal study controls;
- filter by subdeck or search within a lesson;
- leave a private comment on a card, subdeck, lesson or the whole site;
- optionally enter a name or initials so visits and comments can be labelled in the private review spreadsheet.

## Personal audit mode

The structured audit remains available at:

`https://italian-flash-card-review.netlify.app/?audit=1`

Audit mode adds:

- **Reviewed OK**;
- **Needs change**;
- **Remove card**;
- lesson and subdeck progress;
- status filters;
- **Next unreviewed** navigation.

See [Card audit workflow](docs/CARD_AUDIT_WORKFLOW.md).

## Current v6.0 card set

```text
Lesson 1: 42 cards
Lesson 2: 111 cards
Lesson 3: 120 cards
Lesson 4: 116 cards
Total: 389 cards
```

The v6.0 data incorporates the tutor comments and the completed card audit while preserving stable card keys for retained cards.

## Deployment

The Netlify production site is connected to the `main` branch. Commits pushed to `main` trigger a production deployment.

The final v6.0 website data is loaded by `site-v55.js` from the versioned `data/v60-cards-*.txt` files.

## Comments and access logging

Comments, audit actions and basic page-view events are sent to a private Google Sheet through the deployed Google Apps Script web app.

The review site records:

- timestamp;
- optional reviewer name or initials;
- comment, audit action or page-view event;
- lesson, subdeck and card context;
- review-site version.

It does not deliberately collect IP addresses or require a Google login.

See:

- [Google Sheets comment backend](docs/GOOGLE_SHEETS_COMMENTS.md)
- [Privacy and access tracking](docs/PRIVACY_AND_ACCESS_TRACKING.md)
- [Card audit workflow](docs/CARD_AUDIT_WORKFLOW.md)

## Source files

- `index.html` — site structure and comment modal
- `styles.css` — shared card-preview styling
- `review-enhancements.css` — review-site navigation, flips, accordions and sticky tools
- `google-review.css` — reviewer identity and tracking notice styling
- `audit-tools.css` — audit panel, progress and card-status styling
- `app.js` — lesson navigation and card interactions
- `google-review.js` — Google Sheets comments and access logging
- `audit-tools.js` — optional per-card audit workflow
- `audit-overview.js` — normal study progression and audit navigation refinements
- `site-v52.js` to `site-v54.js` — historical incremental compatibility layers
- `site-v55.js` — final v6.0 card-data loader and renderer
- `data/v60-cards-*.txt` — compressed v6.0 review data
- `netlify.toml` — static-site publish configuration

## Deck schema

The v6.0 decks follow the established design rules plus the final audit decisions: clear three-part Recall prompts, platform-neutral wording, natural and literal English, construction blocks where useful, separated grammar fields, and source-supported active recall.

Historical schema references remain in `docs/`.
