# Canonical literal-construction schema

Last updated: **21 October 2026**

This addendum is binding for current and future Italian Anki and Web UI cards.

## General literal tiles

- Use responsive tiles with a useful minimum width rather than content-sized boxes.
- Tiles in a row stretch to equal height.
- Italian appears first; its English gloss appears beneath.
- Long glosses wrap inside the tile without forcing neighbouring tiles into unreadably narrow columns.
- Shared layout classes and wording must remain identical in Anki and the Web UI.

## Paired article phrases

A paired `the / some` card must show two complete, symmetrical phrases:

```text
[definite article metadata] [noun]
[partitive article metadata] [noun]
```

Both article tiles must show:

- grammatical gender;
- plural number;
- starting-condition rule;
- primary meaning (`the` or `some`).

The partitive article also shows its construction as supporting information, for example:

```text
built from di + gli
```

The primary learner-facing gloss remains `some`; do not overload it with `some / of the` in the main gloss.

## Starting-condition language

Use complete labels:

- `before most consonants`;
- `before a vowel`;
- `before s + consonant`;
- `before z`;
- `all feminine plural nouns`.

Never append orphaned fragments such as `, z`, `, vowel`, or `, s + consonant` to another sentence.

## Semantic highlighting

- Semantic tokens use exact-width underlines.
- Do not add horizontal padding to the underlined span.
- Colour reinforces the written category and is never the only signal.
- Masculine/feminine and singular/plural metadata must be present symmetrically when two related article forms are contrasted.

## Responsive rules

- General word tiles use a flexible minimum width and wrap rather than becoming content-sized slivers.
- Article-pair phrases use a two-column phrase grid on wider screens.
- Each phrase contains a wider article tile and a narrower noun tile.
- The two phrases stack vertically on narrow screens.

## Release gates

A release fails if:

- the definite article shows gender/number metadata but its paired partitive article does not;
- a starting condition is an orphaned punctuation fragment;
- semantic underlines extend beyond the highlighted word because of padding;
- a word tile becomes too narrow to show its content clearly;
- Anki and Web UI render different literal-construction content;
- stable note IDs, GUIDs, card IDs, deck IDs or website card keys change unnecessarily.
