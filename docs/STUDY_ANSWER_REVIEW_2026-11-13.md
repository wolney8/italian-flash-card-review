# Study answer review

Will requested a smooth transition after revealing a study-sheet answer and a visible countdown that learners can stop while comparing their response with the model answer.

## Interaction

- Correct, incorrect and skipped answers reveal gently. Scroll only enough to expose the feedback above the fixed controls; retain the submitted response for comparison.
- The five-second countdown has its own numeric display, progress bar and Pause button. Navigation keeps a separate Next button.
- Pause holds the current answer indefinitely. Resume continues the remaining time. Next advances immediately when an answer has been checked or skipped.
- Escape and incidental interaction can still pause. Explicit Pause/Resume must work with mouse, touch and keyboard without the pointer-down handler undoing the action.
- The existing auto-advance preference remains available under Practice options. With it off, an answered question waits for manual navigation.
- Navigation, results, hidden tabs and lost window focus must never allow an old countdown to advance a later question. Rendering, translation and restored sessions do not start a new timer.
- Reduced-motion preferences disable reveal and question-entry animation and smooth scrolling. The same answer, timing and navigation controls remain available.

## Preservation

The update changes study controls and presentation. It retains canonical lesson data, accepted answers, question/card identities, progress keys, retry scoring and Anki packages. The Lesson 7 fixture records reviewed control hashes separately from the unchanged canonical source hashes.

## Verification

`scripts/validate_answer_review.py` exercises the actual browser UI at narrow phone and desktop widths, in English/light and Italian/dark, plus reduced motion. It checks explicit native Pause, keyboard Resume, retained comparison content, remaining time, automatic and manual navigation, auto-off persistence, final-question completion and long matching answers.

The `--live` mode first compares the deployed JavaScript, stylesheet, guided-sheet script and study-page HTML with the checkout. Existing learning-controls, Lesson 7, pointer, dock, language and content-preservation gates continue to cover the surrounding application.
