#!/usr/bin/env python3
"""Exercise the shared lesson-library UI; source-data invariants remain in the dedicated validators."""
from pathlib import Path
import subprocess,sys
script=Path(__file__).with_name('validate_course_library_browser.py')
raise SystemExit(subprocess.call([sys.executable,str(script),'--focus','numbers']+sys.argv[1:]))
