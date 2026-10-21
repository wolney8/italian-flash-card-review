# Pronunciation and stress standard

This document defines how pronunciation guidance should be created and checked for the Italian for Beginners flash-card decks and review site.

## Status of the current decks

The existing English-friendly pronunciation lines are learning aids, not authoritative phonetic transcriptions. They were originally produced from Italian spelling rules and stress patterns, and not every line was independently checked against a dictionary entry. They must therefore be treated as **provisional until audited**.

## Source hierarchy

### 1. Primary source: RAI DOP

Use the **DOP — Dizionario di Ortografia e di Pronunzia della lingua italiana**, second multimedia edition (2025), as the primary pronunciation source.

The DOP provides:

- standard pronunciation;
- lexical stress;
- open and closed `e` / `o` distinctions;
- consonant length and other pronunciation details;
- audio for many entries;
- guidance for suffixes, inflections and forms not listed as separate headwords.

### 2. Cross-check: Treccani Vocabolario

Use Treccani to cross-check:

- written stress marks;
- IPA or phonetic transcription where supplied;
- inflected verb forms;
- accepted variants.

### 3. Usage and variation: Accademia della Crusca

Use the Accademia della Crusca for notes on:

- accepted variants;
- regional pronunciation differences;
- open/closed vowel variation;
- stress or spelling questions where dictionary sources require context.

## Deck representation

Each audited pronunciation should contain:

1. **Italian spelling**
2. **IPA** — the source-of-truth pronunciation
3. **English-friendly guide** — a simplified aid derived from the IPA
4. **Stress** — shown by CAPITALISING the stressed syllable in the English-friendly guide
5. **Source status** — verified, derived from a verified lemma/form, or awaiting review

Example:

```text
essere di
IPA: /ˈɛs.se.re di/
English-friendly: ESS-seh-reh dee
Stress: first syllable of essere
Status: verified
```

## Rules for English-friendly guides

- English-friendly spellings must be derived from IPA, not guessed directly from Italian spelling.
- Double consonants should be visibly represented where they affect pronunciation.
- Open and closed `e` / `o` should be preserved in IPA even where the English-friendly line cannot represent them perfectly.
- `r` should be described as an Italian tapped or rolled `r`; it should not be silently converted to an English `r`.
- `c`, `ch`, `g`, `gh`, `gn`, `gl`, `sc`, `s` and `z` must be checked rather than assumed.
- Connected-speech effects may be noted separately, but the main card should show a clear careful pronunciation suitable for a beginner.
- Regional variants may be mentioned, but the main line should use a recognised standard pronunciation.

## Inflected verb forms

When an inflected form does not have its own dictionary headword:

1. verify the lemma;
2. verify the conjugated form and stress using an authoritative conjugation entry or dictionary form list;
3. apply regular Italian phonology;
4. mark it as **derived from verified form** rather than directly verified as a standalone headword.

## Audit requirement

Before the decks are described as pronunciation-checked for class sharing:

- every unique Italian answer and pronunciation line must be inventoried;
- each line must receive a source status;
- discrepancies must be corrected in both Anki and the review site;
- a second pass should check that the English-friendly guide matches the IPA and stress.

Until that audit is complete, the website and decks should describe pronunciation guides as approximate learning aids.
