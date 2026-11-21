#!/usr/bin/env python3
"""Exercise the three Lesson 8 practice starts and their shared course data in Chromium."""
import json
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
CARDS = json.loads((ROOT / 'lesson8-practice/cards.json').read_text())
LIBRARY = '/study/study-sheets.html?mode=learn&browse=lesson&lesson=L8'
TOPICS = {
    'grammar': ('l8-grammar-in-context', '01 Grammar in context', 18),
    'sounds': ('l8-pronunciation-practice', '02 Pronunciation practice', 12),
    'articles': ('l8-articles-in-context', '03 Articles in context', 28),
}
GRAMMAR = {
    'object': 'la pizza', 'place': 'in cucina', 'no-object': 'no', 'subject': 'il pane',
    'burn': 'il pane', 'complement': 'un dottore', 'job-verb': 'fai', 'noun': 'lavoro',
    'work': 'lavoro', 'fare': 'il', 'wash': 'lavo', 'wood': 'il legno',
    'specific-doctor': 'il', 'how': 'how', 'as': 'as', 'like': 'like',
}
SOUNDS = dict(zip(
    ('ci', 'chi', 'ce', 'che', 'gi', 'ghi', 'ge', 'ghe', 'amici', 'barche', 'funghi', 'pagine'),
    ('ci', 'chi', 'ce', 'che', 'gi', 'ghi', 'ge', 'ghe', 'ci', 'che', 'ghi', 'gi'), strict=True))
ARTICLE_FORMS = [
    ['il', 'del', 'nel', 'dal'], ['lo', 'dello', 'nello', 'dallo'],
    ['l’', 'dell’', 'nell’', 'dall’'], ['la', 'della', 'nella', 'dalla'],
    ['i', 'dei', 'nei', 'dai'], ['gli', 'degli', 'negli', 'dagli'], ['le', 'delle', 'nelle', 'dalle'],
]
ARTICLE_ANSWERS = [
    ['il libro', 'del pane', 'nel negozio', 'dal negozio'],
    ['lo studente', 'dello zucchero', 'nello studio', 'dallo studio'],
    ['l’amica', 'dell’olio', 'nell’ufficio', 'dall’aula'],
    ['la casa', 'della pasta', 'nella scuola', 'dalla banca'],
    ['i libri', 'dei libri', 'nei negozi', 'dai negozi'],
    ['gli amici', 'degli studenti', 'negli uffici', 'dagli studi'],
    ['le amiche', 'delle mele', 'nelle scuole', 'dalle banche'],
]
ANSWERS = {
    'grammar': {'l8-g-' + key: answer for key, answer in GRAMMAR.items()},
    'sounds': {'l8-s-' + key: answer for key, answer in SOUNDS.items()},
    'articles': {f'l8-a-{family}-{n}': answer for n, row in enumerate(ARTICLE_ANSWERS)
                 for family, answer in enumerate(row)},
}

# Browser CI has no installed Italian voice. Test the actual button's language,
# voice and utterance handling without recording audio or relying on a device voice.
INIT = """
localStorage.setItem('italianCourseLanguageV1', 'en');
localStorage.setItem('italianAutoAdvanceV2', 'off');
window.spokenInTest = [];
window.italianVoiceInTest = true;
const voice = {name:'Test Italian', lang:'it-IT'};
Object.defineProperty(window, 'speechSynthesis', {configurable:true, value:{
    getVoices: () => window.italianVoiceInTest ? [{lang:'en-GB'}, voice] : [{lang:'en-GB'}],
    cancel() {}, speak(u) { window.spokenInTest.push([u.text,u.lang,u.voice.lang]); }
}});
Object.defineProperty(window, 'SpeechSynthesisUtterance', {configurable:true,
    value: class {constructor(text) { this.text=text; }}});
"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def check_model(page):
    model = page.evaluate("""() => {
      const plain = html => {const el = document.createElement('div'); el.innerHTML=html; return el.textContent;};
      return ItalianFlashcards.cardList('L8').map(c => ({
        key:c.key, deck:c.deck, answer:plain(c.answer), front:plain(c.prompt),
        english:plain(c.meaning), notes:plain(c.pattern), pron:plain(c.pron)
      }));
    }""")
    assert len(model) == len(CARDS) == 58
    by_key = {r['key']: r for r in model}
    assert set(by_key) == {r['key'] for r in CARDS} and len(by_key) == 58
    for row in CARDS:
        card = by_key[row['key']]
        assert card['deck'] == TOPICS[row['topic']][1], row['key']
        for field in ('front', 'answer', 'english', 'notes'):
            assert card[field] == row[field], (row['key'], field)
        assert row['pron'] in card['pron'] and row['ipa'] in card['pron'], row['key']


def check_cards(page, topic, deck, count):
    query = parse_qs(urlparse(page.url).query)
    assert query['lesson'] == ['L8'] and query['topic'] == [deck], query
    model = {c['key']: c for c in CARDS if c['topic'] == topic}
    assert len(model) == count
    card = page.locator('.guided-card-host .review-card')
    expect(card).to_have_attribute('data-lesson', 'L8')
    key = card.get_attribute('data-key')
    expected = model[key]
    expect(card.locator('.recall-side .focus')).to_have_text(expected['front'])
    page.locator('[data-guide-flip]').click()
    expect(card).to_have_class(re.compile(r'\bshow-answer\b'))
    expect(card.locator('.answer-side .italian')).to_have_text(expected['answer'])
    expect(card.locator('.answer-side .natural')).to_have_text(expected['english'])
    button = card.locator('[data-l8-speak]')
    if topic == 'sounds':
        expect(button).to_have_text(re.compile('Hear it in Italian'))
        button.click()
        assert page.evaluate('spokenInTest') == [[expected['answer'], 'it-IT', 'it-IT']]
        page.evaluate('window.italianVoiceInTest = false')
        button.click()
        expect(card.locator('[role=status] .editorial-label-main')).to_contain_text('No Italian voice')
        assert len(page.evaluate('spokenInTest')) == 1
    else:
        expect(button).to_have_count(0)


def open_topic(page, base, topic, slug):
    page.goto(base + LIBRARY)
    page.locator(f'[data-library-topic=l8-{topic}]').click()
    expect(page.locator('.study-pack-sheet[data-guided-pilot=ready]')).to_have_attribute('id', slug)


def check_study(page, topic):
    page.locator('[data-guided-step=learn]').click()
    learn = page.locator('section[data-study-stage=learn]:visible')
    expect(learn).to_be_visible()
    if topic == 'articles':
        page.locator('[data-guided-action=next]').click()
        rows = learn.locator('tr').filter(has=page.locator('td'))
        expect(rows).to_have_count(7)
        assert [r.locator('td').all_text_contents() for r in rows.all()] == ARTICLE_FORMS
    page.locator('[data-guided-step=examples]').click()
    examples = page.locator('section[data-study-stage=examples]:visible')
    expect(examples).to_be_visible()
    if topic == 'sounds':
        play = examples.locator('[data-l8-speak]').first
        word = play.get_attribute('data-l8-speak')
        play.click()
        assert page.evaluate('spokenInTest') == [[word, 'it-IT', 'it-IT']]
    page.locator('[data-guided-step=practise]').click()
    expect(page.locator('.quiz-question')).to_have_count(len(ANSWERS[topic]))
    current = page.locator('.quiz-question:not([hidden])')
    seen = []
    for _ in ANSWERS[topic]:
        expect(current).to_have_count(1)
        key = current.get_attribute('data-question-key')
        assert key in ANSWERS[topic] and key not in seen, key
        seen.append(key)
        expect(current.locator('.model-answer')).to_be_hidden()
        current.locator('input[type=text]').fill(ANSWERS[topic][key])
        current.locator('.check-button').click()
        expect(current).to_have_attribute('data-result', 'correct')
        expect(current.locator('.model-answer')).to_be_visible()
        page.locator('[data-guided-action=next]').click()
    expect(page.locator('.guided-sheet-finish')).to_be_visible()
    stats = page.evaluate('ItalianGuidedStudy.stats()')
    assert stats['correct'] == stats['attempted'] == len(seen)
    if topic == 'articles':
        families = [key.split('-')[2] for key in seen]
        assert all(a != b for a, b in zip(families, families[1:])), families


def main():
    handler = partial(QuietHandler, directory=str(ROOT))
    with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server, sync_playwright() as pw:
        Thread(target=server.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{server.server_port}'
        browser = pw.chromium.launch()
        try:
            context = browser.new_context(viewport={'width': 1000, 'height': 850}, reduced_motion='reduce')
            context.route('**/*', lambda route: route.continue_()
                          if urlparse(route.request.url).netloc == urlparse(base).netloc else route.abort())
            context.add_init_script(INIT)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + '/?page=lessons&mode=learn')
            page.locator('[data-guide-lesson=L8]').click()
            expect(page.locator('.guided-card-host .review-card')).to_have_attribute('data-lesson', 'L8')
            check_model(page)
            for topic, (slug, deck, count) in TOPICS.items():
                open_topic(page, base, topic, slug)
                page.locator('[data-related-flashcards]').click()
                expect(page.locator('.guided-card-host .review-card')).to_have_attribute('data-lesson', 'L8')
                check_cards(page, topic, deck, count)
                open_topic(page, base, topic, slug)
                check_study(page, topic)
                print(f'{deck}: {count} cards and {len(ANSWERS[topic])} correct worksheet submissions', flush=True)
            assert not errors, errors
        finally:
            browser.close()
            server.shutdown()


if __name__ == '__main__':
    main()
