# Canonical semantic colour and answer-clarity schema — v6.2.3

This is a binding addendum for all current and future Anki and Web UI cards.

## Semantic colour system

Use the same category colours everywhere a learner-facing prompt, answer or explanation explicitly names the category.

| Category | Tokens | Dark-mode colour | Light-mode colour |
|---|---|---|---|
| Informal register | informal, informally, informale | `#ffbf69` | `#8a4b00` |
| Formal register | formal, formally, formale | `#d2b5ff` | `#6741a3` |
| Masculine gender | masculine, male, maschile | `#9ac8ff` | `#165da6` |
| Feminine gender | feminine, female, femminile | `#ffb3d1` | `#9d2e62` |
| Singular number | singular, singolare | `#ffd166` | `#775500` |
| Plural number | plural, plurale | `#9ee3cf` | `#146a56` |

### Colour rules

- Colour is reinforcement, not the only carrier of meaning; the word remains visible.
- The same category always uses the same colour in Recall, Answer, tables, notes and visual panels.
- Existing semantic spans are not nested or recoloured inconsistently.
- Source/reference metadata is excluded from learner-facing colour treatment.
- The palette must remain readable in dark and light card modes.
- Anki and the Web UI must use the same class names and colours.

## Primary-answer clarity

The primary answer area contains only the shortest direct answer to the Recall-side task.

Do not place paragraphs, variants, caveats or teaching guidance beside the large Italian answer.

Move these to:

- **Use or word jobs** for usage, contrast, emphasis and accepted alternatives;
- **Memory aid and extra information** for broader clarifications;
- **Rule / forms** for reusable grammar.

Example:

```text
Answer:
Come ti chiami?
```

Then under **Use or word jobs**:

```text
Optional for contrast or emphasis: Tu, come ti chiami?
```

The same rule applies to formal alternatives such as:

```text
Come si chiama?
```

with the explicit-pronoun variant moved beneath the main answer:

```text
Optional for clarity or emphasis: Lei, come si chiama?
```

## Release gates

A release fails if:

- an explicit register, gender or number label is uncoloured on one platform but coloured on the other;
- category colours differ between Anki and Web UI;
- an Answer field contains an `answer-variant` block or explanatory paragraph;
- optional variants are not clearly labelled outside the primary answer;
- colour is the only way a category is communicated;
- stable identities or note-type field counts change unnecessarily.

## Current implementation

The v6.2.3 candidate applies this schema to Lessons 1–4 while preserving all retained Anki and website identities.
