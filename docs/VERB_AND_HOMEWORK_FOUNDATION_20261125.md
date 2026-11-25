# Verb reference and homework foundation

Date: 25 November 2026

Status: local review build. No production deployment or Anki release in this update.

## Why this change is needed

The live Daily practice bank already covered 34 verbs, all six present forms and all three regular families. Its family and lesson coverage were difficult to see. An older reference covered only eight verbs and hid the plural forms in a separate disclosure. Book homework references were stored but folded below the lesson's practice links; assigned handout and oral tasks were not collected there.

The original-source audit also found that the Lesson 5 presentation lacked its own text extract. A same-basename extract contained the minutes instead. Some teaching content was embedded in pictures. The new audit preserves original filenames, extensions, hashes and page/slide locators, including the picture-only content. See `SEMESTER_1_SOURCE_AUDIT.md` and `source-audit-20261125.json`.

## Local implementation

### One shared verb reference

`study/daily-verbs.js` supplies both Daily practice and Verbs at a glance. The shared view displays all six forms together, English subject labels, endings for regular present forms, usage categories, Italian examples, English meanings and source labels. It retains the original eight pronunciation guides and the existing origin/residence and agreement explanations.

- 35 verbs: 16 in the course's -ARE group, 10 -ERE, 7 -IRE, and essere/avere in their own group.
- 210 displayed present forms: six per verb.
- 94 usage examples: 73 from checked Laura material, 21 labelled Added practice.
- 88 new phrase questions: 44 short gaps and 44 meaning choices.
- 1,062 Daily verb questions in total, preserving all 944 existing questions and their identities.
- Eight new sentence-tile rounds use the same example records, including fare i compiti. This brings the sentence activity to 27 rounds and the six visual activities to 77 rounds.

The new family filter is separate from Regular/Irregular in the present. The -isc model is explicitly regular, with noi/voi using the shorter stem. Course grouping keeps fare in -ARE, as Laura teaches, and dire in -IRE; explanatory notes record the historical alternative. Essere and avere are not ordinary -ERE model verbs.

Prendere is provisional course coverage. The learner wrote pendere, but the meanings described point to prendere. The source note records that inference and asks for confirmation against the Lesson 9 slide. Its forms and added examples are checked grammar support. They are not attributed to Laura's unseen presentation.

### Visible homework

Each Lesson 1-8 page has a visible checklist before its study-sheet links:

- 22 exact book exercise references, with concise task instructions and source locators.
- Seven handout or spelling task groups, with links to corresponding existing practice.
- Separate further-reading references for p. 224, pp. 126-127 and p. 233.
- Existing optional online revision links remain available.

Only the assigned textbook pages 166 and 172, plus reference page 224, have been supplied. Other book tasks remain assignments to complete in the learner's book; the update does not invent their unseen pictures, questions or audio.

Checklist ticks use `italianHomeworkChecklist.v1` in local storage. Daily practice keeps `italianDailyPractice.v1` and its old default session keys. Family-specific rounds add a suffix. Existing study-sheet, tile and Anki identities remain intact.

## Extending the course without guessing Laura's syllabus

### Separate the grammar model from lesson coverage

Every verb now has explicit `courseGroup` and `tenses.presente` fields. The latter holds the present forms, regularity and pattern. The existing `kind` and `forms` fields remain compatibility aliases for the present.

Future entries should record the grammatical mood, tense, verified six-person forms, pattern and sources independently. A past participle belongs under principal parts; a complete compound tense also needs a checked auxiliary, agreement rule and use context. A single global regular/irregular flag cannot supply those facts. For example, leggere is regular in the present but has the past participle letto; vivere has vissuto and the future vivrò.

Keep teaching coverage separate: documented in Laura's material, encountered as a fixed expression, learner-reported pending verification, or added practice. The next tense selector should list checked reference content and visibly indicate what has been taught. It should not automatically assign future lessons or introduce unreviewed paradigms into daily rounds.

### Keep written accents separate from spoken stress

Store ordinary Italian spelling separately from pronunciation support. Laura's marks in lavoràre and àbito indicate stress for teaching; normal typed answers are lavorare and abito. Required written accents such as è, dà and può must remain part of the answer. Dedicated stress exercises can ask which syllable is stressed without adding a written accent to ordinary spelling.

### Apply a source coverage gate to every new lesson

1. Inventory minutes, slides, tables, homework and relevant book extracts with original extension and hash.
2. Read each page/slide, inspect embedded images and check speaker notes.
3. Record assigned homework separately from class activities and optional revision.
4. Extract each verb use, construction, example and memory aid with its source locator.
5. Map each learning point to its reference, exercise and, where appropriate, matching web/Anki flashcard.
6. Record missing material or conflicting versions explicitly. Preserve Laura's wording and add a separate clarification for grammar errors.
7. Verify the resulting questions and publish a coverage report with the release.

No new Anki cards are generated in this foundation update. Later card additions must use the same checked learning points, retain stable note identities and be present as web flashcards before the deck release.

## Verification

- Repeatable practice, course library, Lesson 7 and worksheet validators pass.
- Existing 82 sheets and 831 exercise headings remain valid.
- 775 family, pattern, verb and focus combinations produce usable pools, with no cross-family leakage.
- Existing Daily question objects and IDs are preserved exactly.
- Accents remain significant: e/è, da/dà and puo/può are distinct; NFC, case and terminal punctuation variants remain supported.
- Browser inspection verifies the shared navigation, family selection, phrase marking, six-row reference, homework placement, persisted checklist ticks and both themes, the new fare i compiti tile round and a narrow 390 px frame layout.
- Source-based sentence rounds retain old identities and verify their new word counts against the canonical examples.

## Grammar references

- Treccani, prendere: https://www.treccani.it/vocabolario/prendere/
- Treccani, vivere: https://www.treccani.it/vocabolario/vivere/
- Treccani, leggere: https://www.treccani.it/vocabolario/leggere/
- Accademia della Crusca, regular -isc verbs: https://accademiadellacrusca.it/it/consulenza/coniugazione-dei-verbi-come-capire-obbedire-ecc/187
- Accademia della Crusca, fare/dire classification: https://id.accademiadellacrusca.org/articoli/fate-e-dite-di-tutto-ma-non-facete-e-dicete-niente/26075
