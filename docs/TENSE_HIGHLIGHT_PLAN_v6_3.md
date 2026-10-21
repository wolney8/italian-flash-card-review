# Tense highlighting plan — v6.3

This document plans a future semantic tense-highlighting system for all Italian Anki cards and Web UI cards. It does **not** yet modify the current Lessons 1–4 content.

## 1. Purpose

Tense highlighting should help the learner answer one question quickly:

> Which time/form system am I being asked to use?

It must reinforce an explicit written label. Colour must never be the only way tense is communicated.

## 2. Current scope

Lessons 1–4 currently teach and practise only the **present tense**. The first implementation should therefore support `present` without pretending that untaught tenses are already part of the course.

Examples that would qualify:

- `Complete the present-tense form.`
- `Avere — present tense`
- `Use the present tense of abitare.`

Do **not** colour every conjugated verb merely because it happens to be present tense. Highlight only an explicit tense label or a dedicated tense badge.

## 3. Proposed semantic class

Use explicit markup generated from card metadata rather than a global text replacement:

```html
<span class="gram tense present">present tense</span>
```

Recommended card metadata:

```json
{
  "tense": "present"
}
```

Cards that are vocabulary, articles, nouns, greetings or other non-tense tasks should use `tense: null`.

## 4. Present-tense colour

Proposed accessible palette:

| Mode | Colour |
|---|---|
| Dark card mode | `#67d6e5` |
| Light card mode | `#0b6f7d` |

The cyan family is deliberately distinct from the existing semantic colours for:

- informal amber-orange;
- formal violet;
- masculine blue;
- feminine pink;
- singular gold;
- plural mint green.

The written words **present tense** remain visible and bold with a coloured underline, matching the existing semantic-highlight pattern.

## 5. Future tense palette

These colours are provisional and must be contrast-tested before activation:

| Tense / mood | Proposed dark colour | Proposed light colour |
|---|---:|---:|
| Present | `#67d6e5` | `#0b6f7d` |
| Passato prossimo / past | `#ff8f8f` | `#9f3434` |
| Imperfetto | `#aeb8ff` | `#4d579a` |
| Futuro | `#c8e66f` | `#567500` |
| Condizionale | `#f0a66a` | `#8d4a17` |
| Congiuntivo | `#dfa3e6` | `#803887` |

A colour is not final until the corresponding tense appears in Laura's lesson material and passes readability checks against the existing register, gender and number palette.

## 6. Where highlighting should appear

Apply a tense highlight only where the tense is explicitly named:

- Recall-side instructions and clues;
- panel titles or subtitles;
- subdeck learning labels;
- Answer-side Use / word jobs;
- Rule / forms headings or explanatory text;
- conjugation-table headings.

Do not recolour:

- the Italian answer itself merely because it is present tense;
- source/reference metadata;
- ordinary uses of the English word `present` that do not mean grammatical tense.

## 7. Anki and Web UI parity

The same class names, colours and metadata must be used in both outputs.

A tense-highlight release fails if:

- Anki and Web UI use different colours;
- the tense is indicated by colour alone;
- text is highlighted through blind global matching;
- a non-verb card receives an inferred tense without a clear learning reason;
- a new tense appears without a lesson-delta review against earlier cards.

## 8. Cross-lesson process

When Laura introduces a new tense:

1. identify the exact lesson source and terminology;
2. inventory earlier verb cards;
3. decide whether earlier cards need a labelled `present tense` clarification;
4. add the new tense metadata and colour only where pedagogically useful;
5. compare the new tense with present-tense forms through dedicated contrast cards rather than rewriting every old card;
6. generate Anki and Web UI from the same approved dataset;
7. validate colour, wording, identities and source coverage.

## 9. Recommended implementation timing

Do not retrospectively colour every current card immediately. First review the current present-tense cards and identify where an explicit tense label improves the decision being tested.

A sensible first release would:

- highlight existing explicit `present tense` labels;
- add a small present-tense badge to core verb-conjugation panels;
- leave simple phrase and vocabulary cards unchanged;
- preserve every existing note ID, GUID, card ID and website key.
