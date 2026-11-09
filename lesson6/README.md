# Lesson 6 — web review (3 November 2026)

## Release decision — 6 November 2026
The user approved publishing the web UI for in-site review. Anki deck production and release are on hold until the user reviews the website and explicitly asks to resume. The earlier Anki package remains a draft. See `WEB_REVIEW_STATUS.md`.

## Scope
One canonical `content.js` dataset supplies the web cards and can supply a later approved Anki export.
- 66 recall cards in eight ordered topics.
- Eight visible study topics; eleven retained exercise routes. Four Essere routes appear as practice sets inside one topic.
- 120 practice questions: 79 unchanged non-number questions and 41 number-writing tasks (0–30 inclusive plus ten larger values).
- All 30 supplied homework tasks: 6 pronoun/form matches, 10 sentence gaps, 8 translations, 6 negative gaps.
- 27 classroom/group tasks: 12 class gaps and the complete 15-item plural workshop.
- 55 adapted number-writing, intonation and useful-expression questions, plus eight warm-up/dialogue checks.
- Original 445 cards and original nine embedded Study Sheets are preserved.

## Visual source fidelity
The numbers reference retains UNITÀ / DECINE / CENTINAIA / MIGLIAIA, all ten source rows, and coloured parts: `uno` / `otto`, accented `tré`, repeated `cento` and `mille` / `mila`. Added word-building displays are explicit instructional adaptations, not extra claims about what the handout says.

The two original intonation diagrams are cropped from **Session 6 - 03.11.2026 - Tables.pdf, page 2**. They show the same words (`Claudia è di Vienna`) with a down-ending statement curve and up-ending question curve. They stack on narrow screens. Curves are visual speaking guides, not audio playback or pronunciation assessment. The diagram is not generalised to all Italian question types.

Homework is kept principally in Study Sheets. Its answers are derived from supplied conjugation/negative tables, whereas the plural workshop has an explicit teacher answer key. Every exercise records its source and answer origin.

## Content verification boundary
Sixty-two cards include supplementary English-friendly and IPA pronunciation fields marked `Provisional — verification pending`. Web review approval does not mean those entries are dictionary-verified. Four conceptual cards need no pronunciation line. No claim of RAI DOP/Treccani verification is made.

The duplicated `Sono italiani?` affirmative/question row is recorded but excluded from scored contrasts. Ambiguous `Sono a casa` is not turned into a single-answer subject-identification question. Referenced textbook pages and listening audio were not supplied and are not invented.

## Web validation
1. `python lesson6/install.py` — read-only verification of committed integration points.
2. `node scripts/validate_lesson6.cjs` — canonical data and preserved earlier content.
3. `python scripts/validate_lesson6_browser.py` — Playwright 1.57.0 plus Chromium/Chrome, actual static site at desktop and 390px widths.

The automated Lesson 6 workflow does not install genanki, run `lesson6/build.py`, or generate/upload Anki packages while the hold is active. Existing Anki build code is retained for a later explicitly approved release; native Anki import and full pronunciation verification remain outstanding.

## Review routes
- Flashcards: `/?page=card&lesson=L6`
- Number patterns: `/study/study-sheets.html?mode=learn&sheet=l6-number-patterns`
- Intonation: `/study/study-sheets.html?mode=learn&sheet=l6-intonation`

## Rollback / existing progress
Previous card data files are hashed in `baseline-integrity.json` and must not change. All new keys use `italian-l6-`. Existing lesson identities and learning progress are not replaced. Corrections from in-site review should update this canonical dataset before Anki exports resume.

## Corrected web flow
The Study Sheet catalogue is topic-based. A separate “Session 6 — class order” filter follows the minutes: greetings, plural revision, numbers, age/dialogue, essere, negatives, intonation, useful questions. Existing exercise URLs and progress keys are retained. Source-backed Learn/Examples assignments replace the first-section-only heuristic for this material.
