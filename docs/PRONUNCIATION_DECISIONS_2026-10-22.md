# Pronunciation review decisions — implementation summary

Date: **22 October 2026**

## Workbook alignment

- Decision rows reviewed: **54**
- Blank decision cells: **0**
- Unique stable keys referenced: **52**
- Keys found in the current Lessons 1–4 packages: **52**
- Missing or ambiguous stable keys: **0**

## Decisions implemented

- Removed learner-facing pronunciation from information/rule-only cards:
  - `italian-l1-vowel_count`
  - `italian-l1-subject_verb_object`
  - `role_nationality_italiana`
- Replaced English-description pronunciation with the actual target sound on the eight core C/G rule cards.
- Standardised the primary sound pronunciation on 28 CE/CI/CHE/CHI and GE/GI/GHE/GHI classification cards.
- Moved each classification card's full example-word pronunciation into a separate example section.
- Retained `italian-l2-def-075` unchanged, as explicitly requested.
- Resolved `L’` as the elided article sound `/l/` attached to the following vowel. The example phrase remains available separately. The letter name *elle* is not used as the article pronunciation.
- Standardised all 12 duplicate-pronunciation groups identified in the workbook.
- Preserved all existing note IDs, GUIDs, card IDs, deck IDs, subdeck assignments and field counts.

## Release validation

The matching Anki release passed the approved pronunciation-manifest gate across all **389 cards**. The gate checks:

- stable key;
- note ID and GUID;
- primary answer;
- English-friendly pronunciation;
- IPA;
- pronunciation policy;
- reviewed duplicate-consistency groups;
- missing or extra notes.

## Source handling

The target C/G sound values follow the standard Italian sound rules in the agreed pronunciation hierarchy. The `L’` handling follows the normal elision of `lo`/`la` before a vowel. Individual lexical pronunciations not yet independently checked against RAI DOP and Treccani remain marked as provisional in the approved release manifest.
