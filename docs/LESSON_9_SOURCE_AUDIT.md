# Lesson 9 source audit and staging plan

**Lesson:** 9, 24 November 2026
**Status:** Website published. Lesson 9 is included in the verified 27 November 2026 full Anki update package. No import into the learner's personal collection has been performed.
**Source rule:** No invented handbook questions and no AI-generated pictures.

## Files reviewed and what they contain

| File | Source detail | In the preview |
| --- | --- | --- |
| Session 9 - 24.11.2026 - Minutes.pdf | Five pages. Recap of fare/stare/jobs. Three conjugations. -ERE rule and pronoun endings. Prendere meanings. Comparison with parlare, tables for vivere/leggere/vedere, 16 model sentences, speaking challenge, and exact homework on p. 5. | Reference, exercises, lesson classification and homework |
| Session 9 - 24.11.2026.pptx | 17 slides. Slides 2 to 8 recap Lesson 8; slide 9 introduces three families; slides 10 to 11 -ARE recap; slides 12 to 16 -ERE, stem and endings, forms and example sentences. | Source-based reference, the 12 -ARE recap questions and examples |
| Session 9 - 24.11.2026 - Tables.pdf | Three pages. Tutor's -ERE endings, stem method, compare parlare/prendere, vivere/leggere/vedere and examples. | Reference table and model examples |
| Exercises on the 3 conjugations.pdf | Two pages. Complete infinitive table; group 12 verbs; match six meanings; five family choices. | Study Sheet L9: Recognise the Three Conjugations |
| Esercizi verbi -ERE (Class).pdf | Two pages. Conjugate prendere, leggere, vivere, vedere and correre across six persons each. | Study Sheet L9: Regular -ERE Verb Tables, 30 answers |
| Homework verbi -ERE.pdf | Two pages. Match ten verbs; complete ten sentences; choose six endings; translate six sentences; write five true personal continuations. | Study Sheet L9: Exercises 1 to 4, with Exercise 5 explicitly ungraded |

## Tutor's homework, not to lose

1. **Worksheet -ERE Exercises 1 to 5.** Exercise 5 prompts the learner to write personally true continuations to *Io leggo*, *Io prendo*, *Io vivo*, *Io vedo*, and *Io scrivo*. Do not auto-mark these.
2. **Course handbook p. 171, exercise 7.** Combine words in four columns to form five sentences.
3. **Course handbook p. 172, exercise 8.** Complete the sentences with correct words.
4. **Course handbook p. 172, exercise 10.** Answer questions using information in the box.
5. **p. 233** is a grammar reading reference, not another assigned question.

We do **not** have the actual handbook exercise pages. Keep these as source-cited checklists, not invented web questions.

## Classroom flow and example context

1. Recap the -ARE family including irregular fare and stare.
2. Recognise -ARE, -ERE and -IRE infinitives.
3. Learn the regular -ERE present: take *prendere*, remove *-ere* to obtain *prend-*, then add *-o, -i, -e, -iamo, -ete, -ono*. The subject pronoun is often omitted.
4. Compare *parlare* and *prendere*; then study *vivere, leggere* and *vedere* together.
5. Use four rows of tutor examples per verb, rather than disconnected vocabulary. For *prendere*, examples include taking a taxi, having coffee, taking notes and catching a bus.
6. Take the tutor's three-stage speaking challenge: conjugate a randomly selected verb and subject, build a sentence, then ask a question. This is a self-assessed activity when no exact answer key exists.
7. Complete the homework and handbook tasks.

The illustration grid on PowerPoint slide 6 is not a photograph. Do not use it for photograph-matching activity or infer any photographic licence.

## Where each study route belongs

**Top level:** Home, Today, Lessons, Study Sheets.

**Today / Focus:** Prepared, time-budgeted practice drawing from approved lesson flashcards and individual study questions. No separate content bank, no unsupported Anki review history. Topic selection may narrow the mix, but user-set Needs Practice flags are separate.

**Today / Practice:** Manual, topic-focused work. Existing verb family filters, conjugation comparison, article tables, sounds, sentence building and visual exercises remain. Add clear links to new lesson/source activities as applicable.

**Lessons:** Sequential source-ordered Lesson 1 through Lesson 9 flashcards. L9 contains 22 additional study cards based on the tutor's examples and -ERE grammar rules. Previously published cards remain unchanged.

**Study Sheets:** Class and homework questions tied to exact source sheets. L9 has four groups: three-family recognition, -ARE recap, -ERE class tables and the assigned -ERE homework. The ungraded personal writing and handbook pages are clearly separated from auto-scored tasks.

## Web / Anki parity and import plan

- The **22 Lesson 9 card records** live in the same static \`lesson9/content.js\` catalogue as the website's L9 deck. Categories: 6 \`01 -ERE Patterns\` cards and 16 \`02 Laura’s Model Sentences\` cards.
- The existing Daily Verbs add-on already covers individual verb forms for several of these verbs. Do not create duplicate direct form cards.
- `lesson9/build_anki.py` derives the new `.apkg` from these exact records. GUIDs and numeric IDs derive from stable keys. Its dedicated Lesson 9 note type retains the released Lesson 7 fourteen-field schema, with a dynamic lesson label, avoiding a change to existing Lesson 7 templates.
- Native Anki 26.09.4 testing imports the full package into both a fresh collection and an isolated collection containing all previous decks. The update adds exactly 22 cards, preserves all 857 existing native identities and schedules, and adds zero duplicates on repeat import.
- The user authorised the full package on 27 November 2026. It includes the previous releases and corrections, Daily Verbs, and Lesson 9. Review history and deck presets are excluded. See `ANKI_FULL_UPDATE_2026-11-27.md` for the release scope and import settings.
- New verbs in the handouts such as *correre*, *ricevere*, *perdere*, *vendere*, *partire*, *sentire* and *ballare* are source-backed in worksheets. Extending every verb's general-purpose drill catalogue and Anki form decks is a **follow-up**, with deduplication review.

**Verification scope:** Source audit checked across all six attachments, including images and tables. New module and browser tests must pass before production approval. One-week Focus trial before cosmetic iteration remains the plan.
