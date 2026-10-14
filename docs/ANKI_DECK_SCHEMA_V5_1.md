# Italian for Beginners Anki Deck Schema — v5.1

This document is the source of truth for rebuilding and extending the **Italian for Beginners - BSE Course** Anki decks from Lesson 4 onwards.

It records the design, display, content and update rules used for the final Lesson 1–3 v5.1 decks.

## 1. Purpose

The decks are designed for short daily recall practice. They should:

- stay faithful to the supplied lesson minutes, slides, handouts and exercises;
- be user-neutral and suitable for sharing with the whole class;
- ask one clear learning question at a time;
- show a visible task on the card front;
- provide pronunciation, natural English and literal structure on the answer side;
- preserve useful added support without presenting it as if it was directly taught in that lesson;
- use a consistent visual and structural system across every lesson.

## 2. Deck naming and hierarchy

Parent deck naming:

```text
Italian - Lesson <number> - <main lesson subject>
```

Subject subdecks:

```text
Italian - Lesson <number> - <main lesson subject>::<two-digit order> <subject>
```

Examples:

```text
Italian - Lesson 2 - Alphabet, Sounds and Articles::03 C and CH
Italian - Lesson 3 - Origins, Nationality and Residence::02 Verb forms
```

Rules:

- One parent deck per class lesson.
- One subdeck per meaningful subject area.
- Use two-digit ordering (`00`, `01`, `02`) so subdecks remain stable.
- Do not create extra nesting levels unless the lesson genuinely needs them.
- New lessons are added as new parent decks. Lessons 1–3 are not rebuilt simply because a later lesson is added.

## 3. Content provenance

Every explanation belongs to one of three layers.

### Course material

Directly supported by the supplied lesson minutes, slides, handouts or exercises.

Use the label:

```text
COURSE MATERIAL
```

### Added study support

Correct supporting material added to make the taught concept easier to understand or revise. Examples include full present-tense verb tables where only singular forms were introduced in the original lesson.

Use the label:

```text
ADDED STUDY SUPPORT
```

### Later-lesson support

Material introduced in a later class but useful on an earlier card, such as plural pronouns or article forms later confirmed by the course.

Use the label:

```text
LATER-LESSON SUPPORT
```

Do not silently convert an inference or general Italian rule into “course material”.

## 4. Card-front schema — Recall side

Every front must contain a visible and unambiguous task.

Order:

1. Lesson and subdeck label.
2. Topic panel.
3. Optional visual choice chips or pattern.
4. Clear instruction.
5. Target phrase, sentence, letter, sound or blank.
6. Small clue only when needed.

Example:

```text
Lesson 2 · Indefinite articles

Indefinite articles
Choose a form of “a / an”.

un · uno · una · un’

Choose the correct article:
___ ufficio

office · masculine · singular
```

### Choice chips

Choice chips are visual clues only.

- They are centred.
- They are not clickable.
- They do not reveal the answer.
- They use normal Italian capitalisation.
- Uppercase is reserved for actual letters or spelling groups being studied, such as `CE`, `CHI`, `GHE` and `GN`.

Correct:

```text
sono · sei · è
un · uno · una · un’
```

Incorrect:

```text
SONO · SEI · È
UN · UNO · UNA · UN’
```

The distinction between `Lei` (formal “you”) and `lei` (“she”) must remain visible.

## 5. Card-answer schema — Answer side

Order:

1. Italian answer.
2. English-friendly pronunciation.
3. Natural English meaning.
4. Literal or structural translation, when useful.
5. Rule, pattern or forms to notice.
6. Word roles, agreement or contrast where relevant.
7. Source/provenance label.

### Pronunciation

- Use an English-friendly approximation.
- Mark the stressed syllable with capitals, for example `VYEH-nee`.
- Do not pretend the guide is exact IPA.
- Explain sound rules where a spelling pattern matters.
- Keep Italian capitalisation separate from stress-marking in the pronunciation line.

### Natural and literal English

Keep these separate.

Example:

```text
A presto!
Natural English: See you soon!
Literal idea: Until soon.
```

Do not imply that words such as “see you” are literally present where they are not.

## 6. Verb cards

A verb answer should show the form being tested first, followed by a complete present-tense reference table where useful.

Required table order:

| Person | Italian | English |
|---|---|---|
| io | first-person singular | I ... |
| tu | second-person informal singular | you ... |
| lui / lei | third-person singular | he / she ... |
| Lei | formal singular | you ... formally |
| noi | first-person plural | we ... |
| voi | second-person plural | you all ... |
| loro | third-person plural | they ... |

Each row should include pronunciation when practical.

Important:

- Verbs generally do not change for masculine versus feminine subjects.
- Adjectives can change to agree with the person or noun being described.
- Formal `Lei` takes the third-person singular verb form.

## 7. Pronoun cards

Active recall cards include:

```text
io · tu · lui · lei · noi · voi · loro
esso · essa · essi · esse
```

Usage notes should explain:

- `lui`, `lei` and `loro` are more common in modern everyday speech;
- `esso`, `essa`, `essi` and `esse` remain useful recognition and grammar forms;
- these are subject pronouns;
- direct-object pronouns are a separate topic.

Direct-object pronouns may appear as extra information until directly taught:

```text
mi · ti · lo · la · ci · vi · li · le
```

## 8. Nouns, adjectives and agreement

Where gender and number matter, display the complete pattern.

Example:

| | Singular | Plural |
|---|---|---|
| Masculine / mixed | italiano | italiani |
| Feminine | italiana | italiane |

For adjectives ending in `-e`:

```text
inglese → inglesi
francese → francesi
```

Explain that the adjective agrees with the person or noun being described, not with the learner’s gender by default.

Example:

```text
buona musica
```

`buona` agrees with the feminine singular noun `musica`.

## 9. Article cards

Teach definite and indefinite forms as systems, then apply them to individual nouns.

Definite articles:

```text
il · lo · l’ · la · i · gli · le
```

Indefinite / partitive forms currently covered:

```text
un · uno · una · un’
dei · degli · delle
```

Beginner rule for masculine `lo / gli / uno`:

```text
s + consonant · z · gn · ps · pn · x · semiconsonantal i/j/y
```

Also state:

```text
Not every p + consonant uses lo / uno.
```

Examples using ordinary `il / un` include `il professore`, `il problema` and `il prato`.

## 10. Pronunciation cards

Active recall cards should cover supplied course material, including:

- Italian alphabet names;
- five vowel letters and the course note about seven vowel sounds;
- hard and soft `C` and `G`;
- `CH` and `GH` preserving hard sounds;
- `CIA/CIO/CIU` and `GIA/GIO/GIU` soft patterns;
- `GLI`;
- `GN`;
- silent `H`;
- `QU`;
- Italian `R`;
- `SC / SCH`;
- Italian `V`;
- adjacent vowels;
- doubled consonants.

Worksheet vocabulary can be used as application cards where it reinforces the rule rather than merely duplicating a page.

## 11. Approved question types

Use a mixture of these, with one main decision per card:

1. Situation → phrase.
2. English → Italian phrase.
3. Person/pronoun → verb form.
4. Informal versus formal selection.
5. Complete the sentence.
6. Letter-name recall.
7. Spelling production.
8. Sound-rule recall.
9. Sound classification.
10. Sound contrast.
11. Gender/number pattern recall.
12. Article-rule recall.
13. Article completion.
14. Paired noun phrase.
15. Country-name recall.
16. Nationality-adjective recall.
17. Preposition/contraction application.
18. Origin versus nationality versus residence contrast.
19. Reusable conversation chunk.
20. Pronoun production and recognition.

Avoid vague image-only fronts and copied statements that do not form a real question.

## 12. Visual design

The v5.1 visual language uses:

- dark charcoal background;
- green-grey topic panels;
- pink accent border and text;
- rounded cards and panels;
- a circular subject badge;
- centred, static choice chips;
- short visible prompts;
- no emoji as the main visual language;
- imagery only where it genuinely clarifies the situation or concept.

Normal Italian capitalisation always overrides decorative styling.

## 13. Sharing and user neutrality

Class-shareable decks must not contain:

- learner names;
- tutor names in card content;
- assumed hometowns or nationalities presented as facts about the learner;
- personal scheduling or review history;
- private comments;
- unsupported claims presented as course teaching.

Fictional examples are allowed when clearly generic.

## 14. Anki update and identity rules

For an in-place update that preserves progress:

- retain the existing note GUID;
- retain the note ID and card ID where the card already exists;
- retain compatible note-type identity and field order;
- add new cards with new collision-safe identities;
- do not rely on matching deck names alone;
- test the import against a copy of the active deck before distribution.

When a clean replacement is intentionally chosen, state that progress will not transfer.

## 15. Review website rules

The review site uses the same card data but is not the Anki deck itself.

- Show one lesson at a time.
- Group cards by subdeck.
- Label the question as **Recall side**.
- Label the revealed answer as **Answer side**.
- Use a visually distinct primary button for showing the answer.
- Use a secondary comment button for feedback.
- Offer card, subdeck, lesson and general comments.
- Keep Netlify form name `card-review` so submissions remain together across site versions.
- Keep stable card/item IDs when wording or layout changes.

## 16. Adding Lesson 4 and later lessons

For each new lesson:

1. Collect the minutes, slides, handouts and exercises.
2. Build a source coverage map.
3. Separate direct course content from added support.
4. Propose lesson and subdeck names.
5. Reuse the v5.1 card fields, templates and styling.
6. Create recall cards for all important taught rules and forms.
7. Add complete verb/agreement reference tables where helpful.
8. Generate an HTML preview before creating the final `.apkg`.
9. Audit spelling, pronunciation, literal meaning and natural usage.
10. Add the new lesson to the same review website without changing existing card IDs.

## 17. Current v5.1 baseline

```text
Lesson 1: 44 cards
Lesson 2: 135 cards
Lesson 3: 116 cards
Total: 295 cards
```

This document should be reviewed before any Lesson 4 deck or future update is generated.
