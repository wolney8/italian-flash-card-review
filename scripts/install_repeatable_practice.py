#!/usr/bin/env python3
"""Read-only verification. UI migrations are committed, not reapplied by CI."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
checks={'study/study-sheets.html': ['practice-bank-v1.js', 'practice-session-v1.js', 'library-v1.js'], 'study/study-sheets-v5.js': ['ItalianPracticeBank.enhance', 'ItalianPracticeUI.renderMatching', 'ItalianPracticeBank.choices', 'ItalianStudyLibrary.context']}
for file,markers in checks.items():
 text=(ROOT/file).read_text()
 for marker in markers:assert marker in text,(file,marker)
print("PASS committed repeatable practice integration; no source writes")
