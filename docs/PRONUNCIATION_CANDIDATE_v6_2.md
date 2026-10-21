# Pronunciation candidate v6.2

This branch stages the next pronunciation and card-display update without changing the production Netlify site.

## Deployment state

- Branch: `batch-v6.2-pronunciation`
- Production branch: `main`
- All commits on this branch use `[skip netlify]`.
- Do not merge to `main` until the batch has been reviewed and approved.

## Candidate coverage

The candidate updates all 389 cards across Lessons 1–4 with a structured pronunciation area:

1. Italian spelling
2. IPA transcription
3. English-friendly `Say it` guide
4. stress location
5. source/verification status
6. expandable beginner IPA help

There are 361 unique pronunciation strings in the current set.

## Verification boundary

The new presentation format is complete. The pronunciation entries are currently labelled:

> Provisional — working IPA and guide; DOP/Treccani verification pending.

They must not be described as fully source-verified until the unique-answer inventory has been checked against the agreed source hierarchy.

### Source hierarchy

1. **RAI DOP** — primary standard pronunciation, stress, open/closed vowels, consonant length and audio where available.
2. **Treccani Vocabolario** — cross-check for stress, IPA, verb forms and recognised variants.
3. **Accademia della Crusca** — usage notes, regional variation and disputed or context-sensitive pronunciation.
4. **Official IPA chart** — symbol meanings and reference standard.

## Beginner IPA use

The learner should normally speak from the English-friendly `Say it` line. IPA is the precision layer used to check details that English spelling cannot show reliably.

Example:

```text
essere di
IPA: /ˈɛs.se.re di/
Say it: ESS-seh-reh dee
```

- `ˈ` means stress the next syllable.
- `ɛ` is an open `e`, broadly like British English `e` in *bed*.
- `s.s` means hold the doubled `s` slightly longer.
- `e` is a pure Italian `e`, without an English glide.
- `r` is an Italian tap or trill rather than an English `r`.
- `i` is the vowel in English *machine*.

## Included fixes

- `place_country_compare`: removed the extra English-friendly pronunciation for `in Inghilterra`; the card has three answer phrases and now shows three pronunciation entries.
- `essere` guides: changed the opening from `EHS` to `ESS` to represent the doubled `s` more clearly.
- Italian letter `esse`: changed `ES-seh` to `ESS-seh`.
- Literal-construction tiles: all `.word-tile` elements now stretch to a consistent minimum height, with glosses aligned at the bottom.

## Anki candidate

A matching Anki candidate preserves the existing note IDs, GUIDs, card IDs and field counts. The structured pronunciation markup remains in the existing `Pronunciation` field so updates can import over the installed decks.

Expected card totals remain:

- Lesson 1: 42
- Lesson 2: 111
- Lesson 3: 120
- Lesson 4: 116
- Total: 389

## Release gate

Before merging this branch and producing the final class release:

- review the pronunciation presentation with Laura;
- complete or agree the scope of the DOP/Treccani audit;
- inspect the known pronunciation corrections;
- inspect equal-height literal tiles on desktop and mobile;
- rebuild the final `.apkg` files from the approved data;
- merge once to `main` to trigger one production Netlify deployment.
