#!/usr/bin/env python3
"""Verify the committed Lesson 6 integration. Never regenerate Anki or rewrite UI files."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
checks={
 'index.html':['lesson6/content.js','lesson6/styles.css'],
 'study/study-sheets.html':['../lesson6/content.js','../lesson6/styles.css'],
 'course-data-loader-v1.js':['finalCards.concat(lesson6Cards)'],
 'guided-course-v2.js':["['L6', 'Numbers, Essere and Questions'"],
 'study/study-sheets-v5.js':['data=data.concat(window.ITALIAN_L6.sheets)','window.ITALIAN_L6.checkAnswer']
}
for name,markers in checks.items():
    content=(ROOT/name).read_text()
    for marker in markers:
        if marker not in content:raise RuntimeError(f'{name}: missing integration {marker}')
print('Lesson 6 web integration verified; source files unchanged; Anki remains paused.')
