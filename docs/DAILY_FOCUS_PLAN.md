# Daily Focus: implementation and trial plan

**Date:** 25 November 2026
**Owner:** Will's Italian for Beginners course
**Delivery stage:** Working preview. Production publication remains a separate approval step.
**Purpose:** Start useful practice quickly, using the approved course, with one small completed drill enough for the day.

## Existing work and release boundary

The preceding verb-reference layout work was completed in PR 30 and published at production commit `83197afeb5fc5655467a7bc7d25d237aa4acd6d4`. Its usage-card layout, Italian/English styling and additive Anki update remain the baseline. Daily Focus is an additional practice route, not a replacement for existing Daily practice, flashcards or study sheets.

This change introduces no new lesson claims or Anki learning points. It must not rebuild the Anki package, change existing note/card identities, alter approved answers, or infer that the website can read Anki review history. Laura's missing Lesson 9 minutes and slides remain missing.

## What the current project already provides

| Area | Inspected implementation | Consequence for Daily Focus |
| --- | --- | --- |
| Hosting and build | `netlify.toml` publishes the repository root. The application is static HTML, CSS and JavaScript. | Add a small route and modules. No new framework or server is necessary for the preview. |
| Navigation | `course-practice-routes-v1.js` loads practice routes inside the existing guided shell. `course-site-header-v1.js` serves both main pages and study sheets. | Add `?page=daily-focus` and a visible Today entry. Preserve navigation, deep links, themes and existing routes. |
| Language styling | `study/verb-reference-view.js` supplies escaped Italian/English formatting; its CSS defines distinct accessible colours and italic treatment. | Reuse those classes and helpers for referenced Italian and translated meanings. |
| Learning components | `learning-session-v1.js` provides `progressMarkup` and `restoreAnchor`. | Reuse the progress component. Apply synchronous anchor restoration in Daily Focus so queued scroll changes do not move mobile controls during a tap. |
| Approved exercises | Daily verb, pattern and phrase modules, lesson content and the study library already contain stable question IDs and source notes. | Adapt existing individual questions without rewriting the canonical data. |
| Web flashcards | `ItalianFlashcards.currentCard()` and the `italian-flashcard-rendered` event expose the current card and stable key. | Use approved card content and attach a reversible practice flag. |
| Study interactions | `italian-study-answer-checked` identifies the checked `.quiz-question`. `ItalianStudyLibrary` and `ItalianStudyPersistence` retain existing answer keys. | Observe actual checked attempts. Opening a sheet is only exposure. |
| Existing continuation | `learning-resume-v2.js` snapshots selected sessionStorage entries into localStorage key `italianLearningResumeV2` on page hide/visibility change. | Preserve this mechanism. Daily Focus uses its own versioned store and saves after meaningful actions. |
| Existing recall support | `learning-controls-v2.js` repeats Again after one other card and Not sure after three other cards. | This is an in-round queue, not a calendar scheduler. Reuse its confidence vocabulary without inventing due dates. |
| Existing history | `italianCourseSessionProgressV2.flashcards.confidence` contains ratings. `.study.answers` contains value, result and hint state. These records have no item-level timestamp. | Legacy ratings/results can inform selection. They cannot justify a last-practised date. Viewed flags and topic-completed markers are not recall evidence. |
| Authentication | `google-review.js` stores optional names/initials to label visits and comments. `docs/PRIVACY_AND_ACCESS_TRACKING.md` explicitly says this is self-declared. | There is no secure shared identity to reuse for progress sync. Do not mistake reviewer labels or analytics for authentication. |
| Offline and installation | No service worker, precache manifest or installable web-app manifest was found. | Home-screen access is distinct from offline study. Do not promise the latter in this release. |
| Transfer | Existing local continuation is not a user-facing backup/import route. | Provide a validated Daily Focus export/import route for manual browser/device transfer. |

## Smallest useful experience

The primary path is **choose time, start, practise, finish**. The default is five minutes. Remember the chosen time separately from difficulty. A secondary adjustment control offers Gentle, Standard and Challenge, with no question-selection wizard.

| Approximate duration | Initial target | Shape |
| --- | --- | --- |
| 2 minutes | 4 comparable steps | A small variety of formats; three meaningful completions including active recall can qualify. |
| 5 minutes | 8 comparable steps | A short mixed drill. |
| 10 minutes | 16 comparable steps | One mixed round, with pause and save available throughout. |
| 30 minutes | 40 comparable steps | Five short rounds, with optional break checkpoints included in the approximate budget. |
| 60 minutes | 80 comparable steps | Ten short rounds, with optional break checkpoints included in the approximate budget. |

These are planning estimates, not timed exams. Reading speed, typing and thinking time vary. A timer reaching zero never awards completion. A completed shorter version receives the shorter label.

Allow more than one drill per day. Each completed drill remains ticked in today's history. Offer another prepared mix and a read-only review of the completed drill's questions and answers. Starting or abandoning a later drill must not clear an already completed daily target.

## Content and activity rules

Use one canonical question or similarly sized recall item per learning step. A whole ten-question worksheet must not count as a single step. Short extracts appear inside the drill, with source identity retained in data, so the learner stays in place.

The initial mixture includes:

- A short explanation with **I've read this**.
- A flashcard with reveal and self-assessment.
- Existing gap-fill, multiple-choice and short typed questions.
- A small study-sheet extract.
- Existing word, phrase or practical sentence recall.
- Optional spoken recall with a quiet alternative.

Reading remains a minority, with at most one reading step per four assigned steps. The two-minute version need not contain every activity format. Rotate suitable formats between sessions.

Use the approved answer variants and task-specific answer mode. Tolerate harmless spacing, punctuation and apostrophe differences where appropriate. Do not indiscriminately remove grammatical accents or add pronoun variants that the canonical question does not permit.

After an incorrect answer or **I don't know**, show the approved answer and a short supporting explanation. Record a meaningful attempt and a revisit signal. Do not immediately force the identical failed question again without support.

Spoken recall is self-assessed. No microphone recording, speech recognition or objective pronunciation score is implied.

## Explainable selection

Use a small, bounded mixture rather than treating the whole course as overdue:

1. Prioritise individual items or topics marked **Needs practice**.
2. Include recent incorrect answers and difficult recall.
3. Include recorded review items that are due or least recently practised here.
4. Retain some familiar material and rotate topics and formats.

Keep the rule visible through brief reasons, such as **You flagged articles**, **Recent difficult recall**, or **Last practised here 12 days ago**. Show the last example only when there is a real recorded active-recall timestamp. When history is absent, use **No review recorded here yet**.

Do not import exposure as recall. A page visit, answer reveal without rating, skipped item or ticked reading explanation does not establish that the learner recalled an answer. Legacy ratings with missing dates may inform priority, but must not acquire invented dates or claim a review interval.

Use reversible item and topic practice flags in relevant existing flashcards, study sheets and Daily Focus. A correct answer must not silently clear a user-created flag. Clearing it is the learner's choice.

## Actions and exact meaning

| Action | Required behaviour |
| --- | --- |
| Skip question | Keep that assigned step unfinished. Do not count it as recall, accuracy or completion. |
| Swap question | Replace one unfinished slot with a suitable alternative. Keep the same total and progress count. Preserve a small swap record. |
| Save for later today | Save the queue, answer states and exact current position. Show a resumable saved status. |
| Pause | Stop active-time counting and preserve the current state. |
| Make this shorter | Retain completed work, revise remaining assigned work and show the actual shorter duration. |
| Finish for now | Save a partial result when the completion rule is not yet met. Offer resumption. |
| Skip today | Quieten today's prompt without crediting completion or clearing existing work. |
| Flag an issue for later | Save local context and a short note without navigating away or sending a message. |

Saved and partial sessions survive midnight. Do not create a queue of missed daily drills. Historical sessions remain available for review, but only intentionally started unfinished sessions are resumable work.

## Completion, accuracy and confidence

A drill qualifies only after at least `ceil(0.75 × assigned steps)` meaningful completions, including at least one active-recall attempt.

| Assigned | Required meaningful completions |
| --- | --- |
| 4 | 3 |
| 5 | 4 |
| 8 | 6 |

- An incorrect checked answer counts as practice.
- **I don't know** followed by the answer counts as a learning attempt and adds a revisit signal.
- A flashcard needs reveal plus a recorded self-assessment.
- A reading tick is exposure, not active recall.
- Skip, swap, a page visit and elapsed time do not count as completed learning steps.
- Repeated actions on the same slot cannot award extra completion.

Keep completion, checked-answer accuracy and self-reported confidence separate in the finish summary. Include practice completed, confident answers, items to revisit and skips.

When skipping leaves a drill below the threshold, retain all work and state exactly how many more meaningful steps are required. Offer skipped questions, replacements or an honestly labelled shorter version. The recovery path must never require discarding answers or restarting the whole session.

## Days, time and motivation

Use `Europe/London` for daily boundaries, including British Summer Time. Credit a qualifying drill once, on the date it finishes. A session started yesterday can finish today without loss. A past completion keeps its recorded completion day after later viewing, export or import.

Daily status is one of **not started**, **in progress**, **saved for later**, **completed** or **skipped today**. Completed status takes precedence once a qualifying drill has finished that day.

Use a small completion acknowledgement and a simple weekly activity view. No punitive streak, missed-day debt or prompt to keep going is needed.

An optional **I studied in Anki / did workbook practice** check-in is self-reported activity. Show it separately in the week view. It does not invent question-level answers or award a completed web drill.

Count active practice time while the page is visible and engaged. Stop on pause, save, finish, backgrounding and a reasonable inactivity limit. Long-round breaks are outside active time even though they are included in the approximate session budget. Clock movement or reopening a tab must not manufacture practice time.

## Persistence and identity

Use the isolated localStorage key `italianDailyFocus.v1` for the preview. Persist preferences, flags, issue notes, session snapshots, actual recall history, exposure history, daily credits and external check-ins. Keep old course progress keys and canonical content IDs intact.

Save after answers, ratings, reveals, skips, swaps, flags, explicit position changes and session actions. Save draft input as appropriate for refresh recovery. Retain the selected item's content snapshot and source identity inside each session so a later content update cannot silently change its answer or erase a completed step.

Storage failure must be visible. Do not claim that work is safely saved when localStorage writes fail. Provide a practical export path where possible. Validate imported schema and size, merge by stable identity, and preserve existing completion and answer history.

Label progress **Saved in this browser/device**. Clearing site data, using private browsing or changing devices can remove or separate local progress. Production, a deploy preview and localhost are different storage origins. A successful preview test does not migrate the production learner's progress. Use export/import for an explicit manual transfer.

### Reliable Mac-to-phone continuation

Automatic continuity requires a real authenticated user identity, protected server-side storage, durable session IDs and a conflict-aware synchronisation policy. Remembered sign-in can then use an appropriately secured persisted session. A name field or shared URL is not an account.

For this preview, manually export the Daily Focus backup on one device and import it on the other. This is a transfer, not automatic live synchronisation. Avoid alternating independent changes on both devices without importing the newer backup. The production rollout must explain this limitation directly.

### Home-screen access and offline

A browser bookmark or home-screen shortcut can make Today easier to open. It does not create an offline content cache. Genuine offline study needs a versioned service worker, explicit canonical content/assets caching, updates that preserve session snapshots, and device testing. Defer that infrastructure until the core flow has been used for a week.

## Interface and accessibility requirements

- Retain the editorial design, theme controls and `?page=` navigation.
- Use clear English task instructions and short helpful hints.
- Keep Italian terms and translated meanings italic with distinct accessible colours.
- Keep source traceability without repeated filename/page lines in the normal learning flow.
- Keep the current question anchored as feedback and questions change.
- Provide native keyboard controls, visible focus and labelled inputs.
- Make primary controls comfortable on phones and usable with the on-screen keyboard.
- Respect reduced-motion preferences.
- Keep advanced controls secondary so the next useful action remains clear.

## Implementation boundaries

| Module | Responsibility |
| --- | --- |
| `study/daily-focus-engine.js` | Deterministic selection, session state, completion rules, London dates, flags, issue notes, storage and transfer. |
| `study/daily-focus-content.js` | Read-only adapters from approved content and real legacy recall signals. |
| `study/daily-focus.js`, `.html`, `.css` | Accessible Today setup, drill, pause/checkpoint, summary, history and transfer UI. |
| `daily-focus-hooks.js` | Reversible Needs practice controls and explicit checked-attempt observations on existing screens. |
| Existing route/header files | Entry links and shared shell integration only. |
| `scripts/validate_daily_focus_engine.cjs` | State-transition and preservation checks. |

Avoid rewriting canonical lesson files to make the new feature work. Record source traceability and adapter provenance. Keep this plan alongside the repository so it travels with the implementation.

## Verification plan and current evidence

**Repository inspection and the 27 engine scenarios are complete.** `node scripts/validate_daily_focus_engine.cjs` passed during independent review on 25 November 2026. These checks use isolated storage and an injected clock. They do not access Will's browser progress or Anki collection. The suite also verifies that a new-question repeat excludes the preceding drill's IDs when enough approved alternatives exist, and automatic difficulty signals do not claim that the learner manually flagged an item.

The working browser preview also completed a two-minute drill with one reading step, one incorrect typed answer, one revealed and self-assessed flashcard, and one skip. The summary correctly showed **3 of 4 steps**, **2 recall attempts**, **0 of 1 checked answers correct**, **1 confident answer**, **1 item to revisit** and **1 skip**, with a qualifying daily completion. This observation verifies the mixed core path; it does not establish every device or transfer path.

The preview was checked at a **375 px phone viewport** in light and dark themes. Content width remained **375 px**, with no horizontal overflow, and all visible Daily Focus buttons measured at least **44 px** high. This is a narrow browser viewport check, not a test on a physical iPhone or Mac.

The longer-session recovery path was also exercised in the browser: a 30-minute drill started with 40 steps, one reading step was completed, and the draft **Di dov** was saved. After a page refresh, resumption restored the exact question and draft at **1/40**. Shortening to two minutes retained **1/4**. Swapping removed the old draft while leaving progress at **1/4**. Two skips followed by **I don't know** produced a recoverable **2/4** partial result with **Complete 1 more step**. The result was labelled as a two-minute version shortened from 30 minutes. Today's completed status from the earlier drill remained intact.

The content review checked 64 curated reading extracts for standalone meaning. Existing content checks retained **857 stored web cards**, the **333-card Daily collection** and the **234-card Anki add-on identity set**. No new Anki package was generated for Daily Focus.

Independent review identified and the implementation corrected a stale-backup conflict that could otherwise turn a valid shortened 6/8 completion into an invalid 6/40 record. Finished session targets and finish dates are now immutable across that merge. Additional fixes clear swapped drafts, retain exposure identity per replacement item, preserve the spoken setting, keep previous-day activity when a drill resumes, and guard the displayed question against a second tab changing its position before submission.

| Case | Required evidence | Current state |
| --- | --- | --- |
| All five durations and independent difficulty | Engine target assertions and UI selection | Engine passed; full UI duration sweep pending |
| Wrong answer and I don't know count as practice | State test with retained incorrect result and revisit signal | Engine and browser paths passed |
| Too many skips | Partial summary states exact remaining count and supports recovery | Engine and browser partial-result paths passed |
| Swap | Same assigned total; completed count unchanged | Engine and browser paths passed, including cleared replacement draft |
| Flashcard | Reveal alone does not complete; reveal plus self-assessment does | Engine and two-minute browser path passed |
| Reading minority | Generated queues meet cap and cannot qualify without recall | Engine passed; browser reading recorded separately |
| Refresh/resume | Same session, position, draft/answer, reveal and rating state after reload | Engine reload and browser saved-question/draft refresh passed |
| Shorten | Retains work and receives shorter label; no long-duration credit | Engine and browser paths passed, including newer stale backup conflict in engine |
| Extra session after completion | Finishing, saving or abandoning it cannot clear today's completion | Engine and browser extra-partial paths passed |
| London midnight and summer-time boundaries | Injected-clock tests; finish date credited exactly once | Engine passed; weekly previous-day activity also retained |
| Content update | Snapshot/ID test retains old results and available resumption | Engine passed |
| Old browser progress | Existing keys remain unchanged; exposure excluded from recall | Isolated store, legacy-history and content-preservation checks passed |
| Missing history | No invented review date or whole-course overdue state | Engine passed |
| Transfer | Validated export/import round trip, merge and bad-file rejection | Engine passed; actual browser file-transfer controls pending |
| Multi-tab use and storage failure | Stale-write handling and visible save failure | Engine passed; UI guard reviewed, actual two-tab browser test pending |
| Active time | Background, pause and idle periods excluded | Engine pause/cap passed; browser visibility/idle behaviour pending |
| Navigation, theme and language styles | Browser checks on Today and existing flagged screens | Today route and light/dark phone-width preview passed; existing-screen flag sweep pending |
| Phone controls and keyboard | Narrow viewport, no horizontal overflow, usable focus/controls | 375 px viewport and button heights passed; physical-device and full keyboard sweep unverified |
| Canonical content and Anki parity | Existing content/identity validation; no Anki files changed | 857 stored cards, 333 Daily collection entries and 234 add-on identities retained; CI pending |

The existing repository has preservation checks for the course library, repeatable practice, lessons, recall layout, interface language, navigation, themes and learning controls. Run the affected checks alongside the new state tests. Browser checks must cover the actual preview and report their scope. Do not claim actual iPhone, Safari, offline, assistive-technology or automatic cross-device verification from a desktop preview.

## Delivery and one-week trial

1. Finish the smallest working preview and record exact verification results here.
2. Present the preview, the material limitations and any remaining deployment decision.
3. Follow the existing approval process before production publication. No Anki update is needed for this practice feature.
4. After publication, use the core flow for a week. Fix lost work, confusing instructions, inaccessible controls and incorrect completion behaviour promptly.
5. Defer cosmetic rearrangement and additional infrastructure until that trial identifies a concrete need.

### Deferred deliberately

- Automatic Mac/phone progress sync and new authentication.
- Anki history integration or automatic Anki progress import.
- Offline-first service worker and installable PWA work.
- Objective speech or pronunciation checking.
- New lesson content without Laura's materials.
- Advanced adaptive scheduling, streaks, leaderboards or push reminders.
- Cosmetic redesign during the first week of real use.

No additional content or infrastructure decision is required from Will to build the preview. The routine selection, state and UI choices stay with the implementation. Production approval follows a concrete reviewable result.
