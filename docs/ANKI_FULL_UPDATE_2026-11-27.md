# Full Italian Anki update, 27 November 2026

**Superseded for import by the [28 November formatting correction](ANKI_FORMAT_REPAIR_2026-11-28.md).**
The original content inventory below remains accurate. Its narrow visual sample
missed inherited styling problems in older templates. Use the corrected package
and its formatting-only import settings when the full update is already installed.

One ordinary `.apkg` contains **879 notes and cards**. It can update the matching
released decks or populate a fresh collection. It is not a collection replacement.

## Contents

| Deck | Cards |
| --- | ---: |
| Lesson 1: Introductions | 42 |
| Lesson 2: Alphabet, sounds and articles | 111 |
| Lesson 3: Origins, nationality and residence | 120 |
| Lesson 4: Avere, numbers, plurals and family | 116 |
| Lesson 5: Consolidation Review | 56 |
| Lesson 6: Numbers, essere and questions | 66 |
| Lesson 7: Regular -ARE verbs and everyday sentences | 54 |
| Lesson 8: Grammar and Extra Practice | 58 |
| Lesson 9: Regular -ERE verbs and everyday sentences | 22 |
| Daily Practice: Verbs | 234 |
| **Total** | **879** |

Lesson 9 comprises six grammar patterns and sixteen of Laura's model sentences,
read directly from `lesson9/content.js`. It does not duplicate the individual
conjugation cards already present in Daily Verbs. The source-backed worksheet
activities remain separate study sheets.

The package includes the November 23 course prompt corrections and the latest
Lesson 3 origins correction. Lesson 8 here means the released 58-card Grammar
and Extra Practice deck, not an unreleased core-deck proposal.

## Presentation updates

- The website's shared canonical formatter colours regular stems green and
  endings amber. The `-isc-` insertion uses the same amber as the ending.
- Existing complete references are retained. Fourteen older Lesson 3 sets of
  singular examples keep their examples and gain full six-person references.
- Nine Lesson 1 `chiamarsi` references and the relevant Lesson 3, Lesson 7,
  Daily Verbs and Lesson 9 displays use the same colours.
- The six Lesson 7 ending-gap cards encourage the complete word, show the full
  conjugation as the model, and state that the original short ending is also
  correct. These remain ordinary self-assessed Anki recall cards.
- Irregular verbs retain their actual whole forms; the exporter does not invent
  a regular stem/ending analysis for them.

Canonical website records remain unchanged. Presentation is applied only during
export. Existing field and template schemas, GUIDs and portable IDs are retained.

## Import settings

In a current Anki Desktop version, use **File > Import** and select
`Italian_Full_Anki_Update_2026-11-27.apkg`.

| Option | Value |
| --- | --- |
| Update notes | Always |
| Update note types | Always |
| Import any learning progress | Off |
| Import deck presets | Off, if shown |
| Merge note types | Off |

Keep the existing decks. Sync before and after the import. These settings apply
the supplied wording and card styling. If all earlier releases are installed,
the expected result is **22 new Lesson 9 cards**, with existing cards updated or
recognised. A fresh collection receives all 879 cards. Missing older releases
will also be added.

Reference: [Anki manual: packaged decks](https://docs.ankiweb.net/manual/importing/packaged-decks).

## Native verification

The release gate uses the native Anki 26.09.4 Python/Rust backend, with isolated
temporary collections. It never reads or writes the learner's real collection.

- Fresh import: 879 notes/cards, zero conflicting notes and zero missing media.
- Upgrade: 22 new notes, 308 updated notes and 549 recognised unchanged notes.
- All 857 existing native identities, scheduling fields, flags and suspended
  states are preserved. Forty cards had real scheduler-generated study state,
  including learning, review and lapse cases and 41 review-history rows.
- A custom deck preset and its assignments are preserved.
- Repeat import: zero new notes; all 879 recognised.
- All 879 outgoing portable note/card/model/deck mappings match their source
  packages. The package contains zero review-history rows and no residual
  learning-step or last-review metadata.
- 851 existing fronts retain their visible text/media. The six intentional
  whole-word prompt changes are checked separately.
- All 22 Lesson 9 fronts match the canonical source. Answers and references stay
  on the back. Fifty-six added references and 240 existing row-based references
  are checked for all six persons.
- Native Anki HTML was rendered in isolated Qt WebEngine at phone and desktop
  sizes, in light and dark themes. Eighty views covered ten representative
  cards; eight further views checked the changed whole-word gap and expanded
  Lesson 3 example/reference layout. No clipping or missing rows were found.

Released package SHA-256:
`19eb65d05ec9af62185091a5232e2aedfd8be5aebcca863c3c5467da7e93195b`.

## Rebuild

Use Python with `anki==26.9.4`, `zstandard`, and Node. The input manifest lists
the released L1 to L8 packages and Daily Verbs, their SHA-256 digests, and the
November 23 correction overlay. Source files are supplied by the learner, not
downloaded from a public URL by the builder.

```bash
python daily-verb-cards/build_anki.py daily.apkg
python lesson9/build_anki.py lesson9.apkg --reference-package lesson7-final.apkg
python scripts/validate_l9_anki.py lesson9.apkg --reference-package lesson7-final.apkg
python scripts/build_anki_full_update.py baseline-manifest.json daily.apkg lesson9.apkg full.apkg
python scripts/validate_anki_full_update.py baseline-manifest.json full.apkg --lesson9-component lesson9.apkg --shared-presentation --report validation.json
```

`scripts/anki_verb_display.py` and `.cjs` bridge to the actual website formatter.
`scripts/build_anki_recall_update.py` restores the original portable identities
after native merging and removes residual source scheduling metadata.
