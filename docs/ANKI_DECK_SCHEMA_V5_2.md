# Italian for Beginners Anki Deck Schema — v5.2

This document supersedes v5.1 for Lesson 4 and all future deck work.

## Purpose

The decks are short daily-recall tools based on the supplied course minutes, slides, handouts and exercises. They must be user-neutral, self-contained and useful without the original handout beside them.

## Content rules

Keep a card only when it tests a real language fact, form, meaning, pronunciation rule or usable phrase taught in the class materials.

Do not include:

- cards whose answer is only **Yes** or **No**;
- prompts asking which answer “relates to the course material”;
- wording such as “shown in the Lesson 3 handout” when the card can state the language point directly;
- duplicate consolidation cards that repeat an existing learning decision without adding useful retrieval practice;
- decorative or filler cards created merely to increase the card count.

Every question must be answerable from the card itself. If a card asks for a word's job, its answer must explicitly say **noun**, **verb**, **adjective**, **pronoun**, **article**, etc., not merely translate the word.

## Source layers

- **COURSE MATERIAL** — directly supported by the supplied lesson sources.
- **ADDED STUDY SUPPORT** — accurate explanation or a full reference table that helps understand the taught concept.
- **LATER-LESSON SUPPORT** — material confirmed in a later lesson and useful on an earlier card.

Added support must never be presented as though it was directly taught in an earlier lesson.

## Deck hierarchy

```text
Italian - Lesson <number> - <main subject>
Italian - Lesson <number> - <main subject>::<two-digit order> <subject>
```

Use one parent deck per lesson and one subdeck per meaningful learning area. Avoid redundant “consolidation” or “additional” subdecks when their cards duplicate the main subjects.

## Recall side

Each front must contain:

1. lesson/subdeck context;
2. a clear visible instruction;
3. the exact phrase, word, gap, sound or contrast to retrieve;
4. static visual choices only when they genuinely help;
5. normal Italian capitalisation.

The front should test one main decision. Avoid vague image-only fronts and copied lesson statements that are not questions.

## Answer side

Show, in this order where relevant:

1. Italian answer;
2. approximate English-friendly pronunciation with stress marked;
3. natural English meaning;
4. literal construction or word-by-word breakdown;
5. the exact grammar category or rule requested;
6. forms to notice;
7. source layer and concise explanation.

For verbs, the reference table should show all six present-tense persons and formal **Lei** separately where useful. For adjectives and articles, show masculine/feminine and singular/plural agreement where relevant.

## Approved question types

- situation → phrase;
- English → Italian;
- pronoun/person → verb form;
- complete the sentence;
- informal/formal contrast;
- letter-name or spelling production;
- sound rule, classification or contrast;
- singular/plural transformation;
- article selection and noun phrase completion;
- country, nationality and preposition recall;
- word-role identification with the role explicitly stated in the answer;
- reusable conversation sentence.

## Visual design

- dark neutral website/deck background;
- green-grey flash-card panel;
- pink accent;
- rounded sections;
- centred static choice chips;
- normal sentence case for Italian;
- uppercase only for actual letters/sound groups such as **CE**, **CHI**, **GHE**;
- no fake clickable answer choices inside Anki cards.

## Identity and updates

To preserve progress on retained cards, keep the existing note GUID, note ID, card ID and compatible note-type identity. New lessons receive new IDs. Anki imports do not delete cards absent from an update package, so removed subdecks may require manual deletion after import.

## Current baseline

```text
Lesson 1 unchanged: 44 cards
Lesson 2 curated: 113 cards
Lesson 3 self-contained: 116 cards
Lesson 4 new: 116 cards
Website total: 389 cards
```

Lesson 2 no longer includes:

- `04 Additional pronunciation patterns`
- `08 Consolidation & comparison`

Lesson 4 parent deck:

```text
Italian - Lesson 4 - Avere, Numbers, Plurals and Family - 13 October 2026
```

Its subdecks cover **avere**, silent H, expressions with *avere*, numbers 0–20 and age, plural formation, plural articles, family vocabulary and family sentences.
