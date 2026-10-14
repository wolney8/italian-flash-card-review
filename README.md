# Italian for Beginners - BSE Course

Review site for the class-shareable Anki decks created from Lessons 1–3 of the Italian for Beginners course.

## Live review site

Netlify publishes this repository as:

`https://italian-flash-card-review.netlify.app`

The site lets reviewers:

- open one lesson at a time;
- inspect the **Recall side** and **Answer side** of each flash card;
- filter by subdeck or search within a lesson;
- leave a private comment on a card, subdeck, lesson or the whole site.

## Deployment

The Netlify production site is connected to the `main` branch. Commits pushed to `main` trigger a new production deployment.

## Netlify comments

Comments use the Netlify form named `card-review`.

After form-related changes:

1. Open **Netlify → Forms**.
2. Make sure **Form detection** is enabled.
3. Trigger a fresh production deployment.
4. Confirm `card-review` appears under active forms.
5. Submit one test comment.

The static form blueprint is in `forms.html`; the visible form is the modal in `index.html`.

## Source files

- `index.html` — site structure and comment modal
- `forms.html` — static Netlify form blueprint
- `styles.css` — shared card-preview styling
- `review-enhancements.css` — review-site navigation, flips, accordions and sticky tools
- `app.js` — lesson navigation, answer reveal and comments
- `data/` — compressed card-review data
- `netlify.toml` — static-site publish configuration

## Anki deck schema

The design and content rules for the v5.1 decks, including the process for Lesson 4 and later lessons, are documented here:

- [Anki Deck Schema v5.1](docs/ANKI_DECK_SCHEMA_V5_1.md)

## Optional Google Sheets comments

A Google Sheets + Apps Script alternative is documented here:

- [Google Sheets comment backend](docs/GOOGLE_SHEETS_COMMENTS.md)
