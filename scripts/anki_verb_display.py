"""Export-only verb presentation shared by Anki builders.

``format_verb_displays(records)`` runs the canonical JavaScript formatter in one
batch. Each record may contain ``key``, ``verb``, ``answer`` (existing HTML),
``answerLanguage``, ``pattern`` (existing HTML), ``targetForm`` (an explicitly
identified canonical verb token in a sentence), ``includeReference`` and/or
``referenceVerbs``. Only answer/pattern display strings can change. Prompts,
identities, source records and grading rules are never processed.

Additional full references are marked by ``.anki-verb-reference`` and
``data-verb-reference=\"<infinitive>\"``. Existing complete six-row references are
reused. All output retains the canonical six persons, including irregular forms.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CSS_START = '/* Italian shared verb display: start */'
CSS_END = '/* Italian shared verb display: end */'

# These are the shared website's green/amber reference colours, scoped to the
# new spans so existing model colours and semantic classes remain unchanged.
VERB_DISPLAY_CSS = CSS_START + '''
.card .verb-stem { color:#285d47; }
.card .verb-ending, .card .verb-infix { color:#8b4d15; font-weight:700; }
.nightMode .verb-stem, .night_mode .verb-stem { color:#bcd4bd; }
.nightMode .verb-ending, .nightMode .verb-infix,
.night_mode .verb-ending, .night_mode .verb-infix { color:#f0c58b; }
.anki-verb-reference { margin-top:1.2em; padding-top:.7em; border-top:1px solid #a4b5ab; }
.anki-verb-reference h3 { margin:0 0 .5em; font-size:1em; }
.verb-form-legend, .anki-verb-note { font-size:.85em; line-height:1.5; }
.anki-verb-table { width:100%; border-collapse:collapse; text-align:left; }
.anki-verb-table th, .anki-verb-table td { padding:.35em .4em; border-bottom:1px solid #a4b5ab; vertical-align:top; }
.anki-verb-table th { font-weight:600; }
.anki-verb-table tbody th { width:45%; }
''' + CSS_END


def append_verb_display_css(css: str) -> str:
    """Append the shared block once, replacing a prior version if present."""
    existing = re.sub(re.escape(CSS_START) + r'.*?' + re.escape(CSS_END), '', css, flags=re.S)
    return existing.rstrip() + '\n' + VERB_DISPLAY_CSS + '\n'


def format_verb_displays(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return a formatted copy, preserving order, keys and all non-display data."""
    if not isinstance(records, list) or any(not isinstance(record, dict) for record in records):
        raise TypeError('Expected a list of display records')
    if not records:
        return []
    node = shutil.which('node')
    if not node:
        raise RuntimeError('Node is required for the canonical verb display formatter')
    result = subprocess.run(
        [node, str(ROOT / 'scripts/anki_verb_display.cjs')], cwd=ROOT,
        input=json.dumps(records, ensure_ascii=False), text=True,
        encoding='utf-8', capture_output=True, check=False,
    )
    if result.returncode:
        raise ValueError('Verb display formatting failed: ' + result.stderr.strip())
    formatted = json.loads(result.stdout)
    if len(formatted) != len(records):
        raise ValueError('Verb display formatter changed the record count')
    for original, updated in zip(records, formatted):
        for name, value in original.items():
            if name not in ('answer', 'pattern') and updated.get(name) != value:
                raise ValueError('Verb display formatter changed protected data: ' + name)
    return formatted
