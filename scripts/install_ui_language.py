#!/usr/bin/env python3
"""Read-only verification. UI migrations are committed, not reapplied by CI."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
checks={'index.html': ['course-ui-language-v1.js'], 'study/study-sheets.html': ['course-ui-language-v1.js', 'practice-language-v1.js'], 'study/study-recovery-v1.js': ['result:q.dataset.result']}
for file,markers in checks.items():
 text=(ROOT/file).read_text()
 for marker in markers:assert marker in text,(file,marker)
print("PASS committed language integration; no source writes")
