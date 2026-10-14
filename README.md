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

Comments are collected through the Netlify form named `card-review`.

## Deployment

The Netlify production site is connected to the `main` branch. Commits pushed to `main` trigger a new production deployment.

## Source files

- `index.html` — site structure and Netlify form
- `styles.css` — review-site and card-preview styling
- `app.js` — lesson navigation, answer reveal and comments
- `data/` — compressed card-review data
- `netlify.toml` — static-site publish configuration

## Anki deck schema

The design and content rules for the v5.1 decks, including the process for Lesson 4 and later lessons, are documented here:

- [Anki Deck Schema v5.1](docs/ANKI_DECK_SCHEMA_V5_1.md)

Keep that document as the source of truth when adding or updating lessons.
