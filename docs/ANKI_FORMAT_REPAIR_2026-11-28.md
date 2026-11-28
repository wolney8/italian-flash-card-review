# Italian Anki formatting repair, 28 November 2026

This is a **presentation-only correction** to the full 27 November package.
It contains the same **879 cards**, including **22 Lesson 9 cards** and
**234 Daily Verbs cards**, across **11 note types and 62 leaf decks**.
Every note field and tag is byte-identical to the delivered package.

## Cause and scope

The earlier export preserved older lesson templates without giving their newer
prompt markup a matching common stylesheet. Its visual sample did not cover
all older templates. The reported Lesson 2 card, `italian-l2-ex9-099`, can be
reproduced directly from that export. The content is present; the presentation
is inconsistent.

| Finding | Scope | Correction |
| --- | --- | --- |
| Older grey/teal/pink layout and oversized topic banner | 445 Lesson 1 to 5 cards, six note types | One compact warm light/dark presentation |
| Missing common language and cue styles | 645 non-Daily cards, ten note types | Explicit Italian in green italics; English meanings in terracotta; neutral instructions and labels |
| Inline prompt spans bypass the old instruction/focus selectors | 62 of 111 Lesson 2 cards | Structural task wrapper and labelled, spaced cues |
| Cue labels run into their values | All 22 Lesson 9 cards | Block labels and clearly separated values |
| Sparse styles and invalid paragraph wrapper around block content | Lesson 8, 58 cards | Shared hierarchy and a valid task container |
| Long source URL exceeds phone width | Daily `italian-daily-pattern-isc-noi-voi` | Wrap source text without hiding it |
| Legacy Italian answers lack language tags | 62 Lesson 6 and 43 Lesson 7 cards | Use the existing adjacent pronunciation block to identify these answers; English conceptual answers remain neutral |

The final styles also preserve back-only choice hiding, remove a redundant inner
answer border, retain two-column Daily reference rows and three-column Lesson 7
rows, and keep literal word tiles readable on narrow screens. Header badges
expand for longer labels such as `AVERE` and `THE / SOME`, keeping them on one line.

All six persons remain visible in complete verb references, including **noi,
voi and loro**. The shared verb markup keeps **stems green** and **endings amber**;
the `isc` insertion uses the same amber. Irregular whole forms retain their
actual spelling and are not given an invented regular analysis.

## What changes

Only the used note types' CSS and front/back template wrappers change. The
repair does not alter note field bytes, note tags, content, field schemas,
template count, conditional/filter order, media, GUIDs or portable numeric IDs.
The adapter is exactly idempotent and rejects unfamiliar note types.

The shared adapter is also applied by the full-course, Daily Verbs, Lesson 8
practice and Lesson 9 exporters so those paths produce the corrected layout.
The website's canonical course records remain unchanged.

## Importing the correction

Use Anki Desktop **File > Import** and select
`Italian_Full_Anki_Update_2026-11-28.apkg`.

| Option | Value for an existing full-course import |
| --- | --- |
| Update notes | **Never** |
| Update note types | **Always** |
| Import any learning progress | **Off** |
| Import deck presets | **Off**, if shown |
| Merge note types | **Off** |

Import into the existing collection and keep its decks. Sync before and after.
These settings replace the supplied card presentation while retaining personal
note edits and tags. If the 879-card full update is already installed, **zero new
notes and zero updated note contents are expected**. The note-type styles are
what changes. Missing notes are still added by Anki.

For a learner who has not installed the 27 November content update, the same
file remains a complete course package. `Update notes: Always` applies its
released wording and references as well, replacing existing field edits for
matching notes. This is a separate choice from the recommended formatting-only
repair.

Reference: [Anki manual: packaged decks](https://docs.ankiweb.net/manual/importing/packaged-decks).

## Verification

The release uses disposable native Anki 26.09.4 collections. It does not access
the learner's actual Anki profile.

- All 879 field records, tags, portable identities and native front/back text
  and media match the 27 November package.
- All 11 repaired note types install with both `Always` and `If newer`.
- Repair and repeat imports add zero cards; fresh import produces 879 cards
  with zero missing media and no exported personal review history.
- `Update notes: Never` preserves personal tags on all 879 notes, annotations
  across all 11 note types, 45 review records from 44 reviewed cards, schedules,
  flags, suspensions, custom options and preset assignments.
- 126 native optional-field probes preserve field/filter/conditional behaviour.
- The original course regression gate additionally checks the 857-card older
  baseline, all 22 new Lesson 9 records, six whole-word gap prompts, 56 added
  full references and 240 retained six-person reference groups.
- Visual release gates use native card HTML in Qt WebEngine: every card front
  and back at phone width, plus a representative from every note-type/leaf-deck
  pair at phone and desktop widths in both themes. This is 1,758 all-card views
  and 504 representative views across 63 samples, all 11 types and all 62 leaf
  decks. Final results are recorded with the delivered package hash.

## Rebuild and validate

Use the native Anki environment described in the previous full-update release.
Keep the released source package immutable.

```bash
python scripts/build_anki_format_repair.py released-20261127.apkg corrected.apkg
python scripts/validate_anki_format_repair.py released-20261127.apkg corrected.apkg --report validation.json
python scripts/render_anki_preview.py corrected.apkg qa-all --coverage all --device phone --theme dark --smoke --require-shared-theme
python scripts/render_anki_preview.py corrected.apkg qa-decks --coverage decks --require-shared-theme
```

For a future complete rebuild, use the existing full exporter and pass
`--shared-presentation` to `validate_anki_full_update.py`. That opt-in requires
the exact transformed original templates and the common stylesheet while
retaining all previous content, identity and review-state gates. Omitting it
retains the original 27 November template checks.

Source package SHA-256:
`19eb65d05ec9af62185091a5232e2aedfd8be5aebcca863c3c5467da7e93195b`.

Corrected package SHA-256:
`a072b2fb8c86a97596b5823bdaddf14cf7c1794a6722df1f3ebce16357cfc1a5`.
