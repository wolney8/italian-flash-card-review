# Guided course UX — 4 November 2026

## Course structure
- Beginners: 3 semesters. Current: Semester 1 with Lessons 1–5.
- Intermediate: 3 future semesters.
- Advanced: future level; semester structure not yet confirmed.
- Never suggest untaught or future-semester content is already available.
- Laura has explained that some material introduced early will make more sense as later lessons and semesters build on it. Present this as learning guidance, not a promise about exact future lesson content.

## Navigation
- Home: two clear choices, Lesson Flashcards and Study Sheets.
- Lessons: one card at a time with breadcrumbs, topic focus, Previous, Next, reveal answer, and optional feedback.
- Study sheets: categorical listing with independent focused pages.
- Give feedback: separate from practising, uses existing comment workflow.
- Course pathway: three levels, each with three semesters.
- Ordinary website uses guided shell; ?audit=1 preserves the detailed review/audit UI.

## Content contracts
- No changes to the 445 canonical flashcards, stable IDs, card front/back HTML, pronunciation, or nine study-sheet questions.
- Guided card viewer reuses the existing renderCard() and setCardSide() functions.
- Google Sheet comments retain their previous submission path and item keys.
- Browser-session flashcard progress uses italianCourseSessionProgressV2.
- Last-viewed card uses italianGuidedResumeV1 in sessionStorage.
- Dark/light preference uses italianCourseThemeV1 localStorage, on the main site and study-sheet pages.
- Students do not need to supply a name to study. Feedback requires a name/initials.
- Disabled future semesters contain no fabricated lessons or links.
- Reduced-motion preferences respected.

## QA
- Local Chromium desktop and mobile smoke tests: home, lessons, dark/light toggle, breadcrumb/course route, one-card rendering, flip, Next/Previous, topic links, and mobile menu.
- After Netlify deploy: verify main and study theme persistence, comments, old lesson links, and audit mode.
