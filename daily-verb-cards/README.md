# Daily verb flashcards

Release: 25 November 2026.

## What the learner can open

The native route is `/?page=card&lesson=PRACTICE`. It uses the existing course navigation, theme, reveal controls and recall ratings. Daily practice and the lesson-card index link to this collection.

The collection contains **333 unique cards** across six topics:

1. Regular -ARE forms.
2. Regular -ERE forms.
3. Regular -IRE forms, including the regular -isc pattern.
4. Irregular present forms.
5. Verb patterns.
6. Everyday verb uses.

All **210 subject/form points for the 35 known verbs** are reachable here. All **94 usage records** are represented by new or existing phrase tasks. Three existing family cards and six existing -ARE ending cards sit alongside the new pattern cards.

## Additions and reuse

| Item | Count |
|---|---:|
| Existing course cards, unchanged | 623 |
| New present-form cards | 163 |
| New whole-phrase cards | 51 |
| New pattern cards | 20 |
| New cards in the additive package | 234 |
| Existing unique cards reused in the Daily view | 99 |
| Unique cards in the Daily view | 333 |
| Unique stored web cards after the addition | 857 |

The coverage map records **47 reused form points** and **43 reused usage records**, plus **nine reused pattern cards**. A source record can contain two phrases, while a generic self-name card can cover both a form and a phrase point. Therefore source-point counts and unique-card counts are intentionally separate.

Reused cards are virtual views of the original records. Their keys and saved confidence remain the same. Original lesson membership and content are unchanged. Decorative panels are replaced by plain topic headings only inside the Daily view, so old tables cannot reveal a form before recall.

`existing-coverage.json` records semantic reuse explicitly. Generic self-name cards cover the source's personal-name examples, the name question is reused without its optional greeting, and the two wellbeing cards cover the paired Sto bene / Sto male source record. This avoids new notes that merely change a name or add a greeting.

## One source for the web and Anki

- `cards.json` is the approved, complete set of 234 new records read by both renderers.
- `coverage.json` maps all form/use points to new or existing stable keys.
- `pronunciation.json` and `phrase-pronunciation.json` hold approximate reading guides and broad IPA.
- `scripts/build_daily_verb_cards.cjs` generates the two output JSON files from the shared verb catalogue and reviewed coverage.
- `content.js` provides the web renderer and virtual collection views.
- `build_anki.py` uses the native Anki engine to export the new records.

The shared language formatter marks Italian words and quoted English meanings in italic text with distinct colours. The same generated markup is used in the new web and Anki cards.

Each production card asks for one form or phrase. English instructions identify the task before the cue. Form cards include the selected subject and a full reference table on the back. Formal Lei shares the third-person singular; the back also explains esso/essa. Concept answers carry English language tags, while Italian production answers carry Italian language tags.

Course examples retain source filenames and page/slide locators in the source data and optional source details. The verb-reference example cards omit these repeated labels and sit in a responsive grid above the six-form table. Added examples and completed reference paradigms are labelled as study support. Prendere is confirmed by the learner; its interim model examples are added practice, not quotations from the unavailable Lesson 9 slides.

Pronunciation is presented as an approximate English-friendly reading guide, with broad IPA. The package makes no blanket claim that every pronunciation has independent dictionary verification. The review specifically checks stress and hard/soft C/G/SC contrasts, including **leggo / leggono** with hard G and **esci** with soft SC.

## Importing the add-on

Keep the existing lesson decks and import `Italian_Daily_Verbs_Add_On_2026-11-25.apkg` normally. It adds **234 new notes and 234 cards** under **Italian - Daily Practice - Verbs**, with six subdecks.

The file contains only the new notes. It does not rename or replace existing lesson decks, rewrite their notes, include personal review history, or change their scheduling settings. The 99 reused web cards remain in their established Anki lesson decks. Reimporting the same add-on updates the same notes rather than creating duplicates.

The new namespace has deterministic note GUIDs and numeric note, card, deck, note-type, field and template identifiers. The archive is exported without scheduling, media or deck configurations.

## Rebuilding and verification

```bash
node scripts/build_daily_verb_cards.cjs
node scripts/build_daily_verb_cards.cjs --check
node scripts/validate_recall_layout.cjs
python daily-verb-cards/build_anki.py /absolute/output/Italian_Daily_Verbs_Add_On_2026-11-25.apkg
```

The Anki command requires the `anki` Python package and its native engine. The package builder does not require the old lesson packages, because it does not rebuild them.

Release checks compare every exported content field with `cards.json`, inspect the archive for scheduling and GUID collisions, and import/reimport into a temporary collection containing the existing lesson packages. Seeded old review schedules and custom options must remain unchanged. The web validator verifies all 857 stored fronts/backs, all 333 virtual collection keys, and complete access to the 210 form points and 94 usage records.

The existing eight lesson banks retain their original count assertions. Browser validators now distinguish the 623 existing records from the additive PRACTICE collection instead of treating the combined total as a lesson-data replacement.
