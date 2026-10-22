# Pronunciation-answer integrity schema

Last updated: **22 October 2026**

This is a binding addendum for all current and future Italian Anki cards and Web UI cards.

## Core rule

The learner-facing pronunciation block must correspond exactly to the primary Italian answer shown directly above it.

If the primary answer is:

```text
le case
```

then the pronunciation block must contain only the pronunciation of `le case`:

```text
leh KAH-zeh
/le ˈkaːze/
```

It must not contain the pronunciation of:

- another card;
- the singular source phrase;
- an optional variant moved to Use / word jobs;
- an example that is not present in the primary Answer field.

## Variant parity

- One primary answer requires one matching pronunciation entry.
- Multiple accepted answers may use multiple pronunciation entries only when the Answer field visibly presents the same variants in the same order.
- Optional emphasis, contrast or register variants placed in Use / word jobs do not belong in the primary pronunciation block.
- A transformation card may show singular and plural in Literal Construction, but the primary pronunciation still follows the primary Answer field only.

## Required automated checks

Before release:

1. Count visible primary answer variants.
2. Count English-friendly pronunciation entries.
3. Count IPA entries.
4. Confirm the counts and order match.
5. Reject duplicated pronunciation guides attached to unrelated Italian answers.
6. Reject a pronunciation line containing a source form that is absent from the Answer field.
7. Compare Anki and Web UI output by stable key.

## Current correction

The 22 October 2026 integrity pass corrected:

- `italian-l2-def-074`;
- five Lesson 4 plural-rule cards;
- twelve Lesson 4 singular-to-plural example cards.

The card `italian-l4-plural-rule-a-e` previously answered `le case` while displaying the English-friendly pronunciation for `le ragazze`. The corrected answer now displays:

```text
le case
leh KAH-zeh
/le ˈkaːze/
```

All retained note IDs, GUIDs, card IDs, deck IDs and website card keys remain unchanged.
