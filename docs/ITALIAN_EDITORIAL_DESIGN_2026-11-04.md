# Italian Editorial site design — 4 November 2026

## Scope

The website uses the Italian Editorial theme for guided Learn mode and Study Sheets. The detailed `?audit=1` review interface remains on its established styling and behaviour. No lesson or Anki content changes are made by this presentation release.

## Themes

- Light: parchment background, white-cream panels, cypress-green primary controls, terracotta accents.
- Dark: deep cypress/charcoal background, cream text, muted gold primary controls and terracotta accents.
- No external font downloads. Use system fonts and Georgia/Palatino fallbacks.
- Theme setting: `italianCourseThemeV1` in localStorage, shared by guided flashcards and study sheets.

## Bilingual UI labels

- Label-order setting: `italianCourseLabelOrderV1` in localStorage; `it` or `en`.
- Main text on top, translation immediately below in smaller italic text with distinct contrast.
- Switch IT · EN ⇄ EN · IT applies to navigation, breadcrumbs, action labels and topic selection headings. It does **not** translate graded learner prompts or expose hidden flashcard answers.
- Retain Italian learning content as authored in canonical decks; dynamic subdeck names are preserved rather than machine-translated.

## Completion workflow

- Guided flashcards default to the first subdeck of the chosen lesson. Dropdown allows another subdeck.
- The progress indicator shows the current card position within that subdeck.
- On its last card, offer **Complete topic** and, when available, **Complete & next topic/lesson**.
- Completion is explicit and stored as `flashcards.completed["L#::deck name"]` inside `italianCourseSessionProgressV2` (sessionStorage).
- Viewed-answer counts remain independent; completing a topic does not claim the user has mastered it.
- After completing, offer Next topic/lesson, Repeat topic, or All lessons.
- Stable card keys, order, question/answer HTML, pronunciation and Anki parity are not changed.

## Feedback context

- A Comments button appears on all guided site pages, including Home, Lessons, Course, Study Sheets and individual flashcards.
- Context maps to existing review-sheet fields: `scope`, `item_id`, `lesson`, `deck`, `card_key`, `card_summary`, `site_version`, `reviewer`, `comment`.
- General pages use `scope=general` with page-specific IDs (such as `page:home` and `page:topics`).
- Active flashcards use `scope=card`, `item_id=card:<stable-key>` and the existing lesson/deck/key values.
- Finished topics use `scope=deck` and the existing `deck:<lesson>:<slug>` key format.
- Study sheets use `scope=study_sheet` and `item_id=study-sheet:<slug>`; the summary records the study-sheet path.
- The existing private Apps Script/Google Sheet remains the destination; comment delivery is not claimed confirmed from iframe submission.
- Review mode and the private `?audit=1` controls remain available.

## QA performed

- Chromium desktop and mobile: bilingual label reversal, dark/light switch, one-card rendering, topic completion, next subdeck, next lesson, on-card feedback context and comment fields.
- Study-sheet desktop and mobile: global navigation, bilingual labels, theme switching, contextual comments and hint/check buttons.
- The public Netlify site must still be confirmed after deployment; local fixture tests are not a substitute for a live browser check.