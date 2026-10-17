# Italian for Beginners deck schema — v5.3 refinements

This document supplements the v5.2 schema and is the current reference for card wording and recall quality.

## Platform neutrality

- Never name Anki, HoloRecall or another flash-card application inside a shared card.
- Use: **“Say the answer aloud, then reveal it.”**
- Do not name a tutor or learner in class-shareable card content.

## Recall-side structure

Each recall side should contain one unambiguous task:

1. **Visual options:** the relevant Italian answer family.
2. **Instruction:** one action only, such as *Complete*, *Choose*, *Translate* or *Make plural*.
3. **Target:** an Italian gap, word or phrase.
4. **Clue:** the natural English translation or genuinely useful context.

Avoid:

- repeating the instruction in the clue;
- revealing the answer in the clue;
- vague “ask their name” prompts when a specific construction is being practised;
- Yes/No-only recall;
- source-dependent wording such as “as shown in the handout”.

## Literal versus natural meaning

When the Italian construction differs from ordinary English, show both:

- **Literal:** how the Italian is built.
- **Natural English:** what a speaker normally means.

Example:

- `Come ti chiami?`
- literal: *How do you call yourself? / What are you called?*
- natural: *What is your name?*

The recall prompt should explicitly say that it is practising **chiamarsi**.

## Plural formation

- Prefer actual transformations (`ragazzo → ___`) over abstract rules that reveal the answer.
- Include the English singular/plural beneath the Italian target.
- When a noun is unchanged, explicitly distinguish:
  - the article changes;
  - the noun spelling stays unchanged;
  - the reason: accented vowel, final consonant, shortened form, or the specific course rule.

## Plural articles

- Recall-side options should be Italian: `i, gli, le, dei, degli, delle`.
- Explain constructions:
  - `dei = di + i`
  - `degli = di + gli`
  - `delle = di + le`
- Include gender, number, natural meaning (*some*) and, where useful, the structural sense (*of the*).

## Update safety

- Preserve existing Anki identities for every retained card.
- Preserve stable website card keys so review comments survive wording and design revisions.
- Content revisions must update the existing card rather than creating a duplicate.
