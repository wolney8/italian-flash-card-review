# Lesson 6 — review candidate (3 November 2026)

## Scope
One canonical `content.js` dataset generates the Anki candidate and website cards.
- 66 recall cards in six ordered subdecks.
- Nine Lesson 6 Study Sheet sets, 83 practice questions.
- All 30 supplied homework tasks: 6 pronoun/form matches, 10 sentence gaps, 8 translations, 6 negative gaps.
- 27 classroom/group tasks: 12 class gaps and the complete 15-item plural workshop.
- 26 clearly adapted number-pattern, intonation and useful-expression questions.
- Original 445 cards and original nine embedded Study Sheets are preserved.

## Visual source fidelity
The numbers reference retains UNITÀ / DECINE / CENTINAIA / MIGLIAIA, all ten source rows, and coloured parts: `uno` / `otto`, accented `tré`, repeated `cento` and `mille` / `mila`. Added word-building displays are explicit instructional adaptations, not extra claims about what the handout says.

The two original intonation diagrams are cropped from **Session 6 - 03.11.2026 - Tables.pdf, page 2**. They show the same words (`Claudia è di Vienna`) with a down-ending statement curve and up-ending question curve. They stack on narrow screens. Curves are visual speaking guides, not audio playback or pronunciation assessment. The diagram is not generalised to all Italian question types.

Homework is kept principally in Study Sheets. Its answers are derived from supplied conjugation/negative tables, whereas the plural workshop has an explicit teacher answer key. Every exercise records its source and answer origin.

## Review boundary
**Not a pronunciation-verified production release.** Sixty-two cards include supplementary English-friendly and IPA pronunciation fields marked `Provisional — verification pending`. The source PDFs contain no recordings. Full lexical verification and a native Anki import/round-trip remain outstanding. Four conceptual cards need no pronunciation line. No claim of RAI DOP/Treccani verification is made.

The duplicated `Sono italiani?` affirmative/question row is recorded but excluded from scored contrasts. Ambiguous `Sono a casa` is not turned into a single-answer subject-identification question. Referenced textbook pages and listening audio were not supplied and are not invented.

## Build
1. Install Python `genanki==0.13.1` and Node.js.
2. `python lesson6/install.py` — idempotent integration of known entrypoints only.
3. `node scripts/validate_lesson6.cjs`.
4. `python lesson6/build.py` — writes Anki candidate, HTML preview and inventories to `artifacts/lesson6`.
5. `python scripts/validate_lesson6_browser.py` — Playwright 1.57.0 plus Chromium/Chrome, actual static site at desktop and 390px widths.

## Rollback / existing progress
Changes are isolated to this feature branch. Previous card data files are hashed in `baseline-integrity.json` and must not change. All new keys use `italian-l6-`. The dedicated Anki note type and deterministic GUIDs and integer IDs do not replace earlier notes. Rebuilds retain L6 identities. No main-branch deployment is approved by this candidate.
