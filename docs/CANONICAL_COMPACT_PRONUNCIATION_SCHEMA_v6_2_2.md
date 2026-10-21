# Canonical compact pronunciation schema — v6.2.2

This is a binding addendum to `CANONICAL_DECK_CARD_SCHEMA_v6_2.md` for all current and future Anki cards and Web UI cards.

It supersedes the learner-facing pronunciation presentation described in sections 5, 6, 9 and 10 of the v6.2 schema. All other v6.2 rules remain binding.

## 1. Learner-facing answer order

For every pronunciation-bearing card, the Answer side must show:

1. **Italian answer**
2. **English-friendly pronunciation** — no heading or `SAY IT` label
3. **IPA pronunciation** — no `IPA` heading
4. **Natural English**
5. **Literal construction**
6. **Use / word jobs**
7. **Rule / forms**
8. **Memory aid and extra information**
9. **Course source** — reviewer-facing and hidden in Learn mode

Example:

```text
Da dove venite?
dah DOH-veh veh-NEE-teh
/da dˈove venˈite/
```

The English-friendly line is the normal speaking aid. IPA is the precision layer beneath it.

## 2. Information removed from the main pronunciation area

Do not display separate learner-facing rows labelled:

- `SAY IT`
- `STRESS`
- `SOURCE STATUS`

Stress is already represented by bold CAPITALS in the English-friendly guide.

Pronunciation verification status remains mandatory in the pronunciation audit inventory, but it is not repeated visually on every learner card.

## 3. IPA help location

`How do I read the IPA?` belongs inside the expandable section titled:

> **Memory aid and extra information**

It must not appear directly beneath the answer.

The help should explain at minimum:

- `ˈ` marks the stressed syllable;
- `ɛ / e` and `ɔ / o` distinguish open and closed vowels;
- `ɲ`, `ʎ`, `tʃ` and `dʒ`;
- Italian `r` is tapped or rolled;
- doubled consonants are held slightly longer.

## 4. Cards without a spoken answer

A grammar-concept card without a spoken Italian answer must omit the pronunciation area completely.

Do not display:

> Not applicable — this card tests a grammar concept.

## 5. Anki and Web UI parity

The same compact pronunciation HTML and ordering must be used in:

- Anki card fields/templates;
- Web UI card data/renderer;
- previews and teacher-review packs.

A presentation change cannot be released on only one platform.

## 6. Verification and source hierarchy

The verification hierarchy remains:

1. RAI DOP
2. Treccani Vocabolario
3. Accademia della Crusca
4. Official IPA chart

Every unique pronunciation must still carry an internal audit status such as:

- `Verified — DOP`
- `Verified — DOP + Treccani`
- `Derived from verified lemma/form`
- `Variant explained by Crusca`
- `Provisional — verification pending`

The status belongs in the audit inventory and release evidence, not the main learner-facing pronunciation block.

## 7. Required validation

A release fails if:

- the English-friendly pronunciation appears after the IPA;
- `SAY IT`, `STRESS` or `SOURCE STATUS` remains visible;
- the IPA-help text remains directly under the answer;
- a spoken answer has no English-friendly guide or no IPA;
- a non-spoken concept card displays a fake pronunciation line;
- Anki and Web UI pronunciation content differ;
- pronunciation source status is missing from the audit inventory.

## 8. Current implementation

The v6.2.2 candidate applies this schema to all four lessons while preserving:

- note IDs;
- GUIDs;
- card IDs;
- deck and subdeck IDs;
- website card keys;
- existing learning progress when imported with learning progress disabled.
