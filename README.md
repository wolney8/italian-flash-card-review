# Italian for Beginners - BSE Course

Review site for the class-shareable Anki decks created from Lessons 1–3 of the Italian for Beginners course.

## Live review site

Netlify publishes this repository as:

`https://italian-flash-card-review.netlify.app`

The site lets reviewers:

- open one lesson at a time;
- inspect the **Recall side** and **Answer side** of each flash card;
- filter by subdeck or search within a lesson;
- leave a private comment on a card, subdeck, lesson or the whole site;
- optionally enter a name or initials so visits and comments can be labelled in the private review spreadsheet.

## Deployment

The Netlify production site is connected to the `main` branch. Commits pushed to `main` trigger a new production deployment.

## Comments and access logging

Comments and basic page-view events are sent to a private Google Sheet through a deployed Google Apps Script web app.

The review site records:

- timestamp;
- optional reviewer name or initials;
- comment or page-view event;
- lesson, subdeck and card context;
- review-site version.

It does not deliberately collect IP addresses or require a Google login.

See:

- [Google Sheets comment backend](docs/GOOGLE_SHEETS_COMMENTS.md)
- [Privacy and access tracking](docs/PRIVACY_AND_ACCESS_TRACKING.md)

## Source files

- `index.html` — site structure and comment modal
- `styles.css` — shared card-preview styling
- `review-enhancements.css` — review-site navigation, flips, accordions and sticky tools
- `google-review.css` — reviewer identity and tracking notice styling
- `app.js` — lesson navigation and card interactions
- `google-review.js` — Google Sheets comments and access logging
- `data/` — compressed card-review data
- `netlify.toml` — static-site publish configuration

## Anki deck schema

The design and content rules for the v5.1 decks, including the process for Lesson 4 and later lessons, are documented here:

- [Anki Deck Schema v5.1](docs/ANKI_DECK_SCHEMA_V5_1.md)
