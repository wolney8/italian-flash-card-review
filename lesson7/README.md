# Lesson 7 review handoff

**Status: approved release.** This addition covers the 10 November 2026 lesson. Production publication follows merge to `main` and successful Netlify deployment. It extends the existing course without replacing its previous cards, exercises or saved-progress identities.

## Contents

| Material | Count |
| --- | ---: |
| Lesson 7 recall cards | 54 |
| Ordered Lesson 7 card topics | 7 |
| Lesson 7 study sets | 14 |
| Lesson 7 question screens | 81 |
| Lesson 7 individual responses | 85 |
| Additional Lesson 6 recap sets | 1 |
| Questions in the Lesson 6 recap | 12 |

The five-pair homework matching activity occupies one screen but contains five individual responses. The source worksheets account for **30 classroom responses and 29 homework responses**. Added pattern, spelling and connected practice account for the remaining Lesson 7 responses and are labelled separately.

The Lesson 6 recap is available through both Lesson 6 and Lesson 7. Both routes use the same exercise identity. No new Lesson 6 cards are created; the existing 66 cards are retained.

## Canonical source files

| File | Purpose |
| --- | --- |
| `card-data.json` | The 54 card records, ordered topics, verb forms, source references and pronunciation fields. |
| `study-data.json` | Lesson 7 study sections, exercises, accepted answers, tailored hints, translations and catalogue metadata. |
| `lesson6-recap-data.json` | The shared Lesson 6 reminder guide, 12 recap questions, existing-topic connections and source references. |
| `content.js` | Generated browser/CommonJS payload assembled from the three JSON files. Do not author a separate copy of card wording here. |
| `integration.js` | Registers catalogue metadata, bilingual headings and new sheet adapters; keeps existing course controls and progress storage. |
| `styles.css` | Display rules scoped to the added material, including compact forms and narrow-screen layouts. |

Edit the JSON source appropriate to a change, preserve each stable key and regenerate `content.js`. Card fields are reused by the website and Anki builder. The standalone preview also reads that generated payload.

## Course integration

`index.html` loads Lesson 7 before the course data loader, then its catalogue adapter after the existing library map. `study/study-sheets.html` loads the same payload before the study renderer.

The minimal integration changes are in:

- `course-data-loader-v1.js`: appends Lesson 7 cards and checks duplicate keys.
- `guided-course-v2.js`: adds Lesson 7 to lesson navigation.
- `study/study-sheets-v5.js`: includes the new study sheets before existing practice enhancements.
- `study/question-support-v1.js`: honours explicit `question.support` data so generic heuristics cannot replace the authored hints or pronunciation.

The existing learning-controls, countdown, retry, quit/resume and progress implementations remain unchanged. A new sheet uses the established `slug-qN` progress identity; changing question order after release would therefore require an explicit migration.

The shared recap links to the existing web subdeck **Question words and useful phrases**. Its web name has no numeric prefix, even though the Anki subdeck is ordered as topic 08.

## Regenerate from another checkout

Run these commands from the repository root with Python 3:

```bash
python3 lesson7/tools/assemble.py
python3 lesson7/tools/build_preview.py
```

The first command regenerates `lesson7/content.js` plus review JSON inventories. The second generates the self-contained interactive preview. Review files default to `artifacts/lesson7-review/`; both commands accept `--output-dir /chosen/directory`.

The normal content and preview build uses Python's standard library. It has no dependency on the original scratch directory, a downloaded Lesson 6 package, or a user Anki database.

An optional Anki build requires `genanki`:

```bash
python3 -m pip install genanki
python3 lesson7/tools/assemble.py --anki
```

`--anki` creates `Italian_Lesson_7_Review.apkg` and its identity registry in the output directory. It does not import the package, read a user's Anki collection, publish the website or modify Lesson 6. The stable key, note/card ID derivation, model ID and deck-ID derivation are retained from the reviewed build. The small `tools/anki-base.css` file contains the existing card styling previously read from the Lesson 6 package.

Import testing is a separate gate. Rebuilding an APKG does not establish that fresh import, repeat import or review-history preservation passed for that new output.

To inspect the integrated course locally:

```bash
python3 -m http.server 8000
```

Useful routes:

- `/?page=lesson&lesson=L7&mode=learn`
- `/?page=card&lesson=L7&mode=learn`
- `/study/study-sheets.html?mode=learn&lesson=L7`
- `/study/study-sheets.html?mode=learn&lesson=L6&topic=questions&sheet=l6-recap-useful-requests`

## Source boundaries

The supplied Lesson 7 sources are the minutes, presentation, tables, classroom worksheet and homework worksheet. The dataset records page/slide references and separates course material, recap and added support.

The minutes reference textbook page 173 exercise 14 and grammar page 233. Those pages were not supplied, so their exercises are not reproduced. No separate email body was present in the request.

Recorded clarifications include:

- `voi` is second-person **plural**; the singular label in the minutes is a typo.
- The ending pattern applies to **regular** -ARE verbs, with exceptions kept outside the rule.
- Internal accent marks in the source's stress examples are teaching aids; accepted written answers retain ordinary Italian spelling.
- `studi`, `studiamo`, `mangi` and `mangiamo` have one `i` in the forms being taught.
- `dormire` and `leggere` retain their actual verb families within the supplied matching exercise.
- Ambiguous English “you” is clarified or given accepted alternatives.
- The transitive/intransitive explanation is qualified according to the actual sentence construction.

English-friendly pronunciation is approximate. The source/stress checks do not establish independent dictionary verification of every sentence or full IPA field. Provisional status is recorded in the pronunciation inventory. There is no recorded tutor audio or automated speech assessment.

## Validation completed

The current content/integration validation records:

- 218 accepted-answer/model checks using the existing answer scorer.
- 36 multiple-choice option checks, including six unique options, two red herrings and one keyed answer per question.
- Resolution of all 15 new study routes and their exact related-card targets.
- Preservation of all 53 previous study sets and answer keys.
- Preservation of original canonical card data and Lesson 6 content hashes.
- Registration of Lesson 7, its topic mappings, bilingual titles and explicit learning support.
- Correct dependency order for the extension scripts.
- Unchanged existing learning-control and progress implementations.

These are data and integration checks. They are **not a browser or production pass**.

## Browser QA still required

The build environment could not launch Chromium because its required Unix socket was blocked. An official Playwright headless-shell installation returned invalid/truncated downloads. No screenshots, mobile readability claims or fresh pointer/touch test results were produced.

Before merging or deploying, verify the integrated site in an environment with a working browser:

- All 15 new study routes and representative recall/answer cards.
- 320px, 390px and desktop widths, both themes and both interface languages.
- Readable form/reference layouts with no horizontal page overflow.
- Empty/unchecked Next gating; one check; five-second countdown; pause; one Next action.
- Matching selections, model-answer scoring and clean retry feedback.
- Related flashcard navigation and return to the same exercise position.
- Quit/resume and scoped reset without changes to unrelated progress.

The standalone preview demonstrates the material for review. Its separate preview controls are not evidence that the production course's browser behaviour passed.
