# Lesson 6 — web review and Anki hold

Status confirmed by the user on 6 November 2026:

- Publish the Lesson 6 web UI so the user can review the material in situ.
- Include the website's Lesson 6 flashcards and homework-led Study Sheets.
- Preserve the number-building patterns and the original statement/question intonation curves.
- Do not generate, update or publish further Anki packages until the user reviews the website and explicitly asks to resume.
- The previously generated Anki review candidate remains a draft, not an approved deck.

## Verification boundary

The 62 supplementary pronunciation/IPA entries retain their provisional status. Web review approval is not dictionary verification or approval of a final Anki release. Source wording, source issue notes, stable card keys and the earlier lesson data remain unchanged.

## Build policy

`.github/workflows/lesson6-validation.yml` now runs web/content checks only. It does not install genanki, invoke `lesson6/build.py`, or upload `.apkg` files. The existing build source remains available for a later explicitly approved Anki release.

## Review routes

- Website flashcards: `/?page=card&lesson=L6`
- Study Sheets library: `/study/study-sheets.html?mode=learn`
- Number-building patterns: `/study/study-sheets.html?mode=learn&sheet=l6-number-patterns`
- Statement/question intonation: `/study/study-sheets.html?mode=learn&sheet=l6-intonation`

Any content corrections arising from in-site review should update the canonical Lesson 6 dataset before Anki exports resume.
