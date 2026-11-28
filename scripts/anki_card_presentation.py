"""Shared, export-only presentation for the eleven existing Italian note types.

``apply_card_presentation(model)`` returns a deep copy. Only the model stylesheet
and template HTML change: every field, filter, conditional, card ordinal and
identifier remains intact. Note fields are deliberately outside this API.

The wrappers give existing HTML a common layout contract without rewriting its
content. Language styling uses explicit language markup and known meaning
fields; unlabelled mixed-language answers remain neutral. Existing grammar and
verb-part spans retain their own semantic colours.
"""
from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import re
from typing import Any


CSS_START = '/* Italian shared card presentation: start */'
CSS_END = '/* Italian shared card presentation: end */'
CARD_PRESENTATION_CSS = Path(__file__).with_suffix('.css').read_text(encoding='utf-8')

MODEL_IDS = frozenset((
    1675731218, 1836873404, 1941220998, 2026092801, 2026092842,
    2026100102, 2026101304, 2026102805, 2061006931, 1611580895101,
    1791160591597,
))


def append_card_presentation_css(css: str) -> str:
    """Replace the versioned presentation block, preserving prior model CSS."""
    previous = re.sub(re.escape(CSS_START) + r'.*?' + re.escape(CSS_END),
                      '', css, flags=re.S)
    return previous.rstrip() + '\n\n' + CARD_PRESENTATION_CSS.rstrip() + '\n'


def _add_class_to_tag(tag: str, *names: str) -> str:
    match = re.search(r'\bclass=("|\')(.*?)\1', tag)
    if match:
        classes = match.group(2).split()
        classes.extend(name for name in names if name not in classes)
        return tag[:match.start(2)] + ' '.join(classes) + tag[match.end(2):]
    return tag[:-1] + ' class="' + ' '.join(names) + '">'


def _root(markup: str, side: str) -> str:
    match = re.match(r'\s*<(?:div|article|section)\b[^>]*>', markup)
    if not match:
        raise ValueError('Expected the existing Italian card root')
    return (_add_class_to_tag(match.group(), 'anki-course', 'anki-' + side)
            + markup[match.end():])


def _class(markup: str, existing: str, added: str) -> str:
    """Add a class to existing tags, never to a field or script string."""
    pattern = r'<(?:div|p|span|h[1-6]|section)\b[^>]*\bclass=("|\')[^"\']*\1[^>]*>'

    def apply(match: re.Match) -> str:
        tag = match.group()
        classes = re.search(r'\bclass=("|\')(.*?)\1', tag).group(2).split()
        return _add_class_to_tag(tag, added) if existing in classes else tag

    return re.sub(pattern, apply, markup)


def _wrap_field(markup: str, field: str, css_class: str) -> str:
    token = '{{' + field + '}}'
    wrapped = '<div class="' + css_class + '">' + token + '</div>'
    if wrapped not in markup:
        markup = markup.replace(token, wrapped)
    return markup


def _front(markup: str, model_id: int) -> str:
    markup = _root(markup, 'front')
    if 'anki-task' not in markup:
        if model_id == 2026092801:
            # This visual-only type has an English cue rather than a Prompt.
            markup = _class(markup, 'front-body', 'anki-task')
            markup = _class(markup, 'focus', 'anki-gloss')
        elif model_id == 2026092842:
            # Prompt is sometimes plain text and sometimes structured spans;
            # the original .instruction wrapper would double-scale the latter.
            markup = markup.replace('<div class="instruction">{{Prompt}}</div>',
                                    '<div class="anki-task anki-instruction">{{Prompt}}</div>')
        elif model_id == 1611580895101:
            # A Prompt contains block children: a paragraph is invalid here.
            markup = markup.replace('<p class="ask">{{Prompt}}</p>',
                                    '<div class="ask anki-task">{{Prompt}}</div>')
        elif '<div class="front-body">{{Prompt}}</div>' in markup:
            markup = markup.replace('<div class="front-body">{{Prompt}}</div>',
                                    '<div class="front-body anki-task">{{Prompt}}</div>')
        else:
            markup = _wrap_field(markup, 'Prompt', 'anki-task')
    if '{{Panel}}' in markup:
        markup = _wrap_field(markup, 'Panel', 'anki-topic-panel')
    return markup


def _back(markup: str, model_id: int) -> str:
    markup = _root(markup, 'back')
    markup = _class(markup, 'italian', 'anki-answer')
    markup = _class(markup, 'l9-answer', 'anki-answer')
    if 'anki-answer' not in markup:
        markup = re.sub(r'<h1\b[^>]*>', lambda m: _add_class_to_tag(m.group(), 'anki-answer'),
                        markup, count=1)
    markup = _class(markup, 'natural', 'anki-gloss')
    markup = _class(markup, 'phon', 'anki-pronunciation')
    markup = _class(markup, 'reading-guide', 'anki-pronunciation')
    for css_class in ('literal', 'usage', 'pattern'):
        markup = _class(markup, css_class, 'anki-explanation')

    if model_id in (1675731218, 1836873404, 1941220998):
        markup = _wrap_field(markup, 'NaturalEnglish', 'anki-gloss')
        markup = _wrap_field(markup, 'Pronunciation', 'anki-pronunciation')
        for field in ('Literal', 'Usage', 'Pattern'):
            markup = _wrap_field(markup, field, 'anki-explanation')
    elif model_id == 2026100102:
        for field in ('Explain', 'Example'):
            markup = _wrap_field(markup, field, 'anki-explanation')
    elif model_id == 1611580895101:
        markup = markup.replace('<p>{{English}}</p>', '<div class="anki-gloss">{{English}}</div>')
        markup = markup.replace(
            '<p><b>Say it</b><br>{{Pronunciation}}<br><span class="ipa">{{IPA}}</span></p>',
            '<div class="anki-pronunciation"><b>Say it</b><br>{{Pronunciation}}'
            '<br><span class="ipa">{{IPA}}</span></div>')
        markup = markup.replace('<p>{{Explanation}}</p>',
                                '<div class="anki-explanation">{{Explanation}}</div>')
    elif model_id == 1791160591597:
        markup = markup.replace('<p>{{Meaning}}</p>', '<div class="anki-gloss">{{Meaning}}</div>')
        markup = markup.replace('<p>{{Use}}</p>', '<div class="anki-explanation">{{Use}}</div>')
        markup = _wrap_field(markup, 'Rule', 'anki-explanation')
    return markup


def apply_card_presentation(model: dict[str, Any]) -> dict[str, Any]:
    """Return one repaired known note type without changing its schema or IDs.

    Reject unfamiliar note types instead of applying a layout to arbitrary
    templates. Reapplying this function is byte-for-byte idempotent.
    """
    model_id = int(model['id'])
    if model_id not in MODEL_IDS:
        raise ValueError('Unrecognised Italian note type: ' + str(model_id))
    updated = deepcopy(model)
    updated['css'] = append_card_presentation_css(model.get('css', ''))
    for template in updated['tmpls']:
        for key, render in (('qfmt', _front), ('afmt', _back)):
            original = template[key]
            template[key] = render(original, model_id)
            if re.findall(r'{{.*?}}', original, flags=re.S) != re.findall(
                    r'{{.*?}}', template[key], flags=re.S):
                raise ValueError('Presentation changed Anki field order or conditional tokens')
        if 'anki-task' not in template['qfmt'] or 'anki-answer' not in template['afmt']:
            raise ValueError('Incomplete presentation wrappers: ' + str(model_id))
    return updated
