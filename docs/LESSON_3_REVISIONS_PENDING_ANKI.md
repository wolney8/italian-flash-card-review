# Lesson 3 card revisions — Web UI applied, Anki export pending

**Date recorded:** 20 October 2026  
**Website patch version:** `6.0-review-3`

These revisions are intentionally applied to the review website first. They must be incorporated into the next Anki/HoloRecall-compatible export without changing retained card identities.

## Source decisions

### `chiamarsi` name questions

The Lesson 3 course material gives:

- `Tu come ti chiami?`
- `Lei come si chiama?`

The revised cards retain **come** because it is the question word that makes the phrase an open question: literally, “How do you call yourself?”

For neutral everyday recall, the primary answers are now:

- `Come ti chiami?`
- `Come si chiama?`

The subject pronouns `tu` and formal `Lei` are shown as optional contrast/emphasis variants. `Ti chiami?` or `Lei si chiama?` alone is not the equivalent open question; it normally needs a name or context, for example `Ti chiami Marco?`

## `abitare` and `vivere`

The Lesson 3 handout presents both `vivere` and `abitare` as valid ways to express where someone lives, including `Io vivo / abito in Italia`.

The cards now use the English teaching gloss **reside** for `abitare` so the recall target is visibly distinct from `vivere`. Answer-side notes explain that:

- `abitare` is normal everyday Italian;
- natural English often translates it as **live**;
- `Io abito in Italia` and `Io vivo in Italia` are both correct.

This avoids creating a duplicate `vivere` card while keeping the two Italian verbs separate for active recall.

## Revised stable card keys

### Name questions

- `conversation_name_tu`
  - Primary answer: `Come ti chiami?`
  - Optional contrast form: `Tu, come ti chiami?`
  - Explanation now states why `come` is required.

- `conversation_name_lei`
  - Primary answer: `Come si chiama?`
  - Optional explicit form: `Lei, come si chiama?`
  - Explanation now distinguishes the open question from `Lei si chiama?`.

### Farewell pattern

- `conversation_martedi`
  - Retains `A martedì!` as the concrete recall answer.
  - Recall clue now explains the literal `a + day` construction.
  - Answer side includes all seven days of the week with English meanings.
  - Added support: `A martedì prossimo!` / `Ci vediamo martedì prossimo.` when “next” must be explicit.

### Origin sentence formatting

- `origin_sono_napoli`
  - Recall side now separates:
    1. instruction: “Say this in Italian”;
    2. target: “I am from Naples”;
    3. clue: `io sono + di + city`, fictional speaker.

### `abitare` conjugation and residence family

The following cards now use **reside** as the Recall-side teaching gloss, with **live** retained as the natural-English explanation:

- `verb_abitare_0`
- `verb_abitare_1`
- `verb_abitare_2`
- `verb_abitare_noi`
- `verb_abitare_voi`
- `verb_abitare_loro`
- `formal_lei_abita`
- `q_dove_abitate`
- `liveq_abita`
- `liveq_abiti`
- `reside_abito_Italia`
- `reside_abito_Napoli`

`reside_abito_Italia` remains `Io abito in Italia`, because a separate retained card already practises `Io vivo in Italia`. This is deliberate and avoids duplicate active recall.

## Export requirements

When these changes are added to the next package:

- preserve every retained note GUID, note ID, card ID and website `card.key`;
- do not generate a new downloadable package until requested;
- keep the existing card/subdeck counts unless a separate removal/addition is approved;
- apply the revised wording to the actual note fields, not only the website renderer;
- keep the cards platform-neutral: no Anki-specific wording inside card content.
