# Canonical Italian deck and card schema — v6.2

This document is the binding specification for all current and future Italian lesson decks, subdecks, Anki packages and Web UI cards.

It replaces informal card-building conventions. A card or deck should not be treated as release-ready unless it satisfies this schema.

---

## 1. Core principles

Every card must be:

- **source-grounded** — traceable to the relevant lesson material, or clearly labelled as added study support;
- **self-contained** — answerable without the learner seeing the original handout;
- **single-purpose** — one clear recall decision per card;
- **platform-neutral** — no references to Anki, HoloRecall, a named tutor or a particular learner;
- **consistent** — the same information appears in the same visual and semantic position across Anki and the Web UI;
- **stable** — existing note IDs, GUIDs, card IDs and website keys are preserved when a card is revised;
- **progressive** — later lessons build on earlier lessons rather than silently contradicting or duplicating them.

---

## 2. One source of truth for Anki and Web UI

Anki and the Web UI must be generated from the same approved card dataset.

A card must not be hand-edited independently in only one output unless the change is explicitly a display-only fix. Content fields must remain equivalent across both platforms.

### Required stable identity fields

Each card must retain:

- `StableKey` or `ID` — permanent human-readable identifier;
- Anki note ID;
- Anki GUID;
- Anki card ID;
- deck and subdeck ID;
- website card key.

A wording correction updates the existing card. It must not create a duplicate replacement card unless a deliberate split is approved.

---

## 3. Deck and subdeck structure

### Parent deck naming

```text
Italian - Lesson <number> - <main lesson subjects>
```

### Subdeck naming

```text
Italian - Lesson <number> - <main lesson subjects>::<two-digit order> <learning subject>
```

Examples:

```text
01 Avere - present tense
02 Silent H spelling
03 Expressions with avere
```

### Subdeck rules

A subdeck must:

- represent one coherent learning subject;
- contain only cards relevant to that subject;
- avoid vague names such as `Warm-up`, `Extra`, `Miscellaneous` or `Consolidation` unless there is a clear learning purpose;
- avoid duplicating a subject already owned by another subdeck;
- use a stable order across Anki and the Web UI.

---

## 4. Recall-side schema

Every Recall side must use this hierarchy:

```text
1. Instruction — what the learner must do
2. Target — the phrase, gap, word or meaning to recall
3. Clue — only the minimum information needed to disambiguate the task
4. Optional visual choices — relevant Italian forms only
```

### Approved instructions

Use one direct action:

- `Say this in Italian:`
- `Complete the Italian sentence:`
- `Choose the correct Italian article:`
- `Make this noun plural:`
- `Ask this informally/formally in Italian:`
- `What word class is the target word?`
- `Use <verb> to say:`

### Recall-side requirements

- One main question only.
- The target and clue must not repeat the same sentence.
- The clue must not reveal the answer.
- The intended verb or construction must be named where English allows more than one valid Italian answer.
- Formal/informal, singular/plural and gender must be stated where relevant.
- Any referenced or highlighted word must be visibly highlighted.
- Choice chips are visual prompts only; they are not interactive answer buttons.
- Yes/No-only cards are not used unless the distinction itself is genuinely important and cannot be tested through production.
- Do not ask whether something appeared in a handout or course.
- Do not use phrases such as `according to the lesson material` on the learner-facing side.

### Recall-side example

```text
Say this in Italian:
I come from Italy.
Use venire, io and a complete sentence. Fictional speaker.
```

---

## 5. Answer-side schema

The Answer side must present information in this order:

1. **Italian answer**
2. **Pronunciation block**
3. **Natural English**
4. **Literal construction**
5. **Use / word jobs**
6. **Rule / forms**
7. **Clarification** — only where needed
8. **Course source** — reviewer-facing, hidden in Learn mode

Not every simple vocabulary card needs every section. Empty or meaningless sections must be omitted.

### Italian answer

- Give the shortest neutral standard answer first.
- Variants appear beneath it and must be labelled.
- Formal and informal alternatives must not be mixed without explanation.

### Natural English

- Show what a speaker naturally means.
- Preserve articles such as `a`, `an`, `the` and `some` when they are part of the taught phrase.

### Literal construction

Use aligned word tiles where the construction teaches something useful.

Example:

```text
Io        abito       in       Italia
I         reside      in       Italy
```

Rules:

- one Italian unit per tile;
- one English gloss per tile;
- all tiles in a row use equal height;
- article contractions should be split structurally, e.g. `delle = di + le`;
- do not add decorative tiles to isolated words when they teach nothing.

### Use / word jobs

This section explains the role of words in the answer:

- noun, verb, adjective, pronoun, article or preposition;
- subject–verb agreement;
- formal `Lei` using third-person singular;
- gender and number agreement;
- city/country preposition choice.

### Rule / forms

This section contains only reusable grammar:

- conjugation table;
- article rule;
- plural ending pattern;
- formal/informal pattern;
- pronunciation spelling rule.

It must not contain migration notes, UI notes, source notes or concatenated fields.

---

## 6. Pronunciation schema

### Required pronunciation hierarchy

1. **RAI DOP** — primary source for standard pronunciation, lexical stress, open/closed vowels, consonant length and audio where available.
2. **Treccani Vocabolario** — cross-check for stress, IPA, inflected forms and accepted variants.
3. **Accademia della Crusca** — variation, disputed forms, regional usage and context-sensitive pronunciation.
4. **Official IPA chart** — symbol definitions.

### Required pronunciation fields

Each pronunciation-bearing card must include:

1. Italian spelling
2. IPA transcription
3. English-friendly `Say it` guide
4. stress location
5. source status
6. optional beginner IPA explanation

### Source status values

Use one of:

- `Verified — DOP`
- `Verified — DOP + Treccani`
- `Verified — Treccani; DOP entry unavailable`
- `Derived from verified lemma/form`
- `Variant explained by Crusca`
- `Provisional — verification pending`

A provisional line must never be presented as source-verified.

### English-friendly guide rules

- Derive it from IPA, not directly from spelling.
- CAPITALS mark the stressed syllable.
- Represent doubled consonants where they affect pronunciation.
- Keep open/closed `e` and `o` in IPA even if the English guide cannot show them precisely.
- Explain Italian `r`, `gn`, `gl`, `sc`, `s`, `z`, `c/ch` and `g/gh` where relevant.
- The learner normally speaks from the English-friendly guide; IPA is the precision layer.

### Pronunciation QA

Before release:

- inventory every unique pronunciation string;
- remove duplicate or surplus lines;
- ensure the number of pronunciation entries matches the number of answer variants;
- verify stress and syllable division;
- confirm the English-friendly guide matches the IPA;
- record the source and status.

---

## 7. Source fidelity and evidence labels

Every card must have one source classification:

- **COURSE MATERIAL** — explicitly present in the lesson notes, slides, handout or exercise;
- **COURSE RECAP** — reviewed in the lesson but originally introduced earlier;
- **ADDED STUDY SUPPORT** — explanation, contrast, mnemonic or clarification added to help learning;
- **LATER-LESSON SUPPORT** — information introduced in a later lesson and shown only as labelled support;
- **INFERENCE** — a cautious conclusion from the course sources; requires explicit labelling and review;
- **UNVERIFIED** — not suitable for release until checked.

Do not silently correct, expand or replace Laura's material with general knowledge. Where an added clarification is needed, preserve the course framing and label the addition.

---

## 8. Cross-lesson progression and conflict review

Before building a new lesson deck, complete a **lesson-delta review** against every earlier lesson.

### Required questions

1. What is genuinely new in this lesson?
2. What is recap from an earlier lesson?
3. What deepens or applies an earlier rule?
4. Does the new material contradict an earlier card?
5. Should an earlier card be updated, relabelled or left unchanged?
6. Is the same concept being tested twice with the same recall task?
7. Does the later lesson own the detailed application while the earlier lesson owns first exposure?

### Progression model

Use:

```text
Introduce -> recognise -> produce -> contrast -> apply in sentences
```

A concept may appear in more than one lesson only when the recall purpose changes.

Example — plural articles:

- **Lesson 2:** recognise and map `i/gli/le` and `dei/degli/delle`.
- **Lesson 4:** apply gender, number, starting-sound and `the/some` contrasts in full noun phrases.

This is reinforcement, not duplication.

### Conflict handling

If a later lesson changes or clarifies an earlier rule:

- preserve the original lesson's level and terminology;
- update an earlier card only if it is inaccurate or misleading;
- add a labelled `Later-lesson clarification` when appropriate;
- do not silently rewrite the history of what was taught;
- record the decision in the lesson coverage map.

---

## 9. Required lesson-build artefacts

Every new lesson must produce:

1. **Source inventory** — every supplied file and page used.
2. **Lesson summary** — what was introduced, practised, recapped and assigned as homework.
3. **Coverage map** — source point -> card key/subdeck.
4. **Lesson-delta matrix** — comparison with all earlier lessons.
5. **Card inventory** — card key, purpose, source label and question type.
6. **HTML preview** — Recall and Answer sides.
7. **Pronunciation inventory** — unique forms, IPA, guide, stress and status.
8. **Validation report** — counts, identities, schemas and automated checks.
9. **Import guide** — update options, expected totals and any deliberate removals.

---

## 10. Release validation gates

A release fails if any of the following is true:

- a Recall side has no clear target;
- the clue duplicates the target;
- the answer does not directly answer the Recall side;
- a highlighted target is not visually highlighted;
- pronunciation count does not match answer count;
- pronunciation source status is missing;
- learner-facing text mentions Anki, HoloRecall, Laura or a specific classmate;
- Rule / forms contains source, migration or UI notes;
- Literal-construction tiles are uneven or structurally wrong;
- a retained card loses its stable identity;
- Anki and Web UI content differ;
- card totals differ from the approved inventory;
- a new lesson conflicts with an earlier lesson without a documented resolution;
- a card is not traceable to course material or labelled study support.

### Automated checks

At minimum validate:

- SQLite integrity;
- note/card counts;
- note-type field counts;
- IDs/GUIDs/card IDs retained;
- duplicate Recall prompts;
- repeated target/clue text;
- missing answers;
- missing pronunciation status;
- malformed or concatenated HTML;
- deck/subdeck parity;
- website card-key parity;
- source coverage.

---

## 11. Batch and deployment workflow

Use a non-production branch for grouped changes.

```text
source review
-> lesson-delta review
-> card build
-> pronunciation audit
-> HTML preview
-> Anki candidate
-> validation
-> teacher/learner review
-> one approved merge to main
-> one Netlify production deployment
```

Do not merge partial pronunciation or content work to `main`.

---

## 12. Current canonical references

This schema must be used together with:

- `docs/PRONUNCIATION_STANDARD.md`
- `docs/PRONUNCIATION_CANDIDATE_v6_2.md`
- `docs/ARTICLE_PROGRESSION_v6_2.md`
- the relevant lesson source files and coverage maps

If these documents conflict, this canonical schema governs structure and release process; the lesson source governs what was taught; the pronunciation hierarchy governs how pronunciation is verified.
