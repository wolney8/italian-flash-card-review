#!/usr/bin/env python3
"""Check Lesson 8 class, homework and extra practice through the learner-facing UI."""
import json
import os
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright

from validate_practice_navigation import VIEWS, check_navigation


ROOT = Path(__file__).resolve().parents[1]
CARDS = json.loads((ROOT / 'lesson8-practice/cards.json').read_text())
LIBRARY = '/study/study-sheets.html?mode=learn&browse=lesson&lesson=L8'
TOPICS = {
    'grammar': ('l8-grammar-in-context', '01 Grammar in context', 18),
    'sounds': ('l8-pronunciation-practice', '02 Pronunciation practice', 12),
    'articles': ('l8-articles-in-context', '03 Articles in context', 28),
}
GRAMMAR = {
    'object': 'la pizza', 'place': 'in cucina', 'no-object': 'un panino', 'subject': 'il pane',
    'burn': 'il pane', 'complement': 'un dottore', 'job-verb': 'fai', 'noun': 'lavoro',
    'work': 'lavoro', 'fare': 'il', 'wash': 'lavo', 'wood': 'il legno',
    'specific-doctor': 'il', 'how': 'come', 'as': 'come', 'like': 'come',
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

# Expected responses transcribed independently from the worksheets and slide 16.
# Use alternate correct translations in the UI, including the feminine job and formal question.
CORE = {
    'l8-verb-tables': list(zip(
        [f'l8-table-{verb}-{i}' for verb in ('fare','stare') for i in range(1,7)],
        'faccio fai fa facciamo fate fanno sto stai sta stiamo state stanno'.split(), strict=True)),
    'l8-verb-choices': list(zip(
        [f'l8-{block}-{i}' for block in ('class-form','hw-fare') for i in range(1,7)],
        'sto fai fa stiamo stanno fate fai fa faccio facciamo fate fanno'.split(), strict=True)),
    'l8-jobs-workplaces': list(zip(
        [f'l8-hw-job-{i}' for i in range(1,7)] + [f'l8-hw-place-{i}' for i in range(1,6)],
        ['Chef','Teacher','Doctor','Waiter / waitress','Nurse','Shop assistant','in ospedale',
         'in un ristorante','in una scuola','in un negozio','in un ristorante'], strict=True)),
    'l8-work-dialogue': list(zip([f'l8-class-translate-{i}' for i in range(1,6)],
        ['Io sono un’insegnante.','Sto bene, grazie!','Che lavoro fa?','Faccio la cuoca.','Come sta?'], strict=True)),
    'l8-wellbeing': list(zip(
        [f'l8-{block}-{i}' for block in ('class-dialogue','hw-wellbeing') for i in range(1,5)],
        ['Come stai?','Sto così così','Sto bene','Sta bene','I’m well','I’m unwell','I’m so-so','I’m very well'], strict=True)),
    'l8-mixed-verbs': list(zip([f'l8-slide-16-{i}' for i in range(1,12)],
        'lavoro lavori lavora studiamo faccio stanno fa state fa Fa studiano'.split(), strict=True)),
}

def answer_question(question, value):
    if question.get_attribute('data-type') == 'choice':
        options = question.locator('input[type=radio]')
        option = next((entry for entry in options.all() if entry.get_attribute('value') == value), None)
        assert option is not None, (question.get_attribute('data-question-key'), value)
        option.check()
    else:
        question.locator('input[type=text]').fill(value)
    question.locator('.check-button').click()
    expect(question).to_have_attribute('data-result','correct')
    expect(question.locator('.model-answer')).to_be_visible()


def check_core(page, base):
    page.goto(base + LIBRARY)
    rows = page.locator('[data-library-topic^=l8-]')
    assert [r.get_attribute('data-library-topic') for r in rows.all()][:6] == list(CORE)
    for r in rows.all()[6:]:
        expect(r).to_contain_text('Extra practice')
    source_counts = page.evaluate("""() => ItalianLesson8.sheets.flatMap(s => s.questions)
        .filter(q => q.source).reduce((counts,q) => {
            counts[q.source]=(counts[q.source] || 0)+1;
            return counts;
        },{})""")
    assert source_counts == {'Exercise Class FARE-STARE.pdf':15,
                             'Homework FARE - STARE.pdf':33,'Session 8 - 17.11.2026.pptx':11}
    for slug, expected in CORE.items():
        page.goto(base + LIBRARY)
        page.locator(f'[data-library-topic={slug}]').click()
        expect(page.locator('.study-pack-sheet[data-guided-pilot=ready]')).to_have_attribute('id',slug)
        for step in ('learn','examples','practise'):
            page.locator(f'[data-guided-step={step}]').click()
        expect(page.locator('.quiz-question')).to_have_count(len(expected))
        question = page.locator('.quiz-question:not([hidden])')
        for key,value in expected:
            expect(question).to_have_attribute('data-question-key',key)
            expect(question.locator('.model-answer')).to_be_hidden()
            question.locator('.hint-button').click()
            expect(question.locator('.hint')).to_be_visible()
            answer_question(question,value)
            page.locator('[data-guided-action=next]').click()
        expect(page.locator('.guided-sheet-finish')).to_be_visible()
        stats = page.evaluate('ItalianGuidedStudy.stats()')
        assert stats['correct'] == stats['attempted'] == len(expected)
        print(f'{slug}: {len(expected)} source responses in order', flush=True)

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
    def translate_path(self, path):
        # Netlify serves the three .html bookmark aliases at their extensionless paths too.
        local = super().translate_path(path)
        aliases = {f'/study/{view}' for view in VIEWS}
        return local + '.html' if urlparse(path).path in aliases else local

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
    exercise = page.evaluate('(key) => ItalianLesson8CardTasks.get(key)', key)
    expect(card.locator('.recall-side .instruction[lang="en"]')).to_have_text(exercise['task'])
    cues = card.locator('.recall-side .recall-cue')
    expect(cues).to_have_count(len(exercise['stimulus']))
    for index, cue in enumerate(exercise['stimulus']):
        expect(cues.nth(index).locator('span').last).to_have_text(cue['text'])
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
        if key == 'l8-g-no-object':
            heading = current.locator('.question-heading')
            expect(heading).to_contain_text('Write the article and the noun in Italian.')
            turns = [heading.get_by_text(text, exact=True) for text in
                     ('Anna is eating a sandwich.', 'Che cosa mangia Anna?', 'Mangia ___.')]
            boxes = [row.bounding_box() for row in turns]
            assert all(boxes), 'The situation and both speakers must be visible.'
            assert all(first['y'] + first['height'] <= second['y'] + 1
                       for first, second in zip(boxes, boxes[1:])), 'Display each turn on its own line.'
            current.locator('input[type=text]').fill('no')
            current.locator('.check-button').click()
            expect(current).to_have_attribute('data-result', 'wrong')
        answer_question(current, ANSWERS[topic][key])
        page.locator('[data-guided-action=next]').click()
    expect(page.locator('.guided-sheet-finish')).to_be_visible()
    stats = page.evaluate('ItalianGuidedStudy.stats()')
    assert stats['correct'] == stats['attempted'] == len(seen)
    if topic == 'articles':
        families = [key.split('-')[2] for key in seen]
        assert all(a != b for a, b in zip(families, families[1:])), families


def check_visual_practice(page, base):
    folder = ROOT / 'study' / 'job-photos'
    photos = json.loads((folder / 'sources.json').read_text())
    by_file = {photo['file']: photo for photo in photos}
    assert len(by_file) == len(photos) >= 2
    assert set(by_file) == {file.name for file in folder.glob('*.jpg')}
    for filename, photo in by_file.items():
        assert (folder / filename).read_bytes().startswith(b'\xff\xd8\xff'), filename
        assert all(photo[key].strip() for key in ('title', 'credit', 'licence', 'alt', 'archiveId', 'provenance')), filename
        assert re.fullmatch(r'\d{4}-\d{2}(?:-\d{2})?', photo['date']), filename
        assert re.fullmatch(r'[0-9a-f]{64}', photo['originalSha256']), filename
        for key in ('source', 'licenceUrl', 'originalFile'):
            url = urlparse(photo[key])
            assert url.scheme == 'https' and url.hostname, (filename, key)

    open_topic(page, base, 'jobs-workplaces', 'l8-jobs-workplaces')
    page.locator('[data-guided-step=examples]').click()
    sheet_url = page.url
    page.locator('[data-visual-practice]').click()
    expect(page.get_by_role('heading', name='Jobs in photographs')).to_be_visible()
    seen = set()
    for index in range(len(photos)):
        expect(page.locator('#photo-count')).to_have_text(f'Photograph {index + 1} of {len(photos)}')
        expect(page.locator('#photo-question')).to_be_visible()
        image = page.locator('#job-photo')
        filename = image.get_attribute('src').split('/')[-1]
        assert filename not in seen, filename
        seen.add(filename)
        photo = by_file[filename]
        width, height = image.evaluate('(img) => [img.naturalWidth, img.naturalHeight]')
        assert width == photo['width'] > 0 and height == photo['height'] > 0, filename
        expect(image).to_have_attribute('alt', photo['alt'])
        page.get_by_text('Photograph and source', exact=True).click()
        credit = page.locator('#photo-attribution')
        expect(credit).to_be_visible()
        expect(credit).to_contain_text(photo['credit'])
        expect(credit).to_contain_text(photo['date'][:4])
        for label, url in [(photo['title'], photo['source']), (photo['licence'], photo['licenceUrl'])]:
            expect(credit.get_by_role('link', name=label, exact=True)).to_have_attribute('href', url)

        # Deliberately miss the first photo. Check that feedback and the final score agree.
        answer = photo['role'] if index else photo['distractors'][0]
        page.locator(f'#job-options input[value="{answer}"]').check()
        page.get_by_role('button', name='Check answer', exact=True).click()
        feedback = page.locator('#job-feedback')
        expect(feedback).to_contain_text('Correct.' if index else 'The job is')
        expect(feedback).to_contain_text(photo['evidence'])
        expect(page.locator('#job-options input:checked')).to_be_disabled()
        page.locator('#next-photo').click()
    assert seen == set(by_file)
    expect(page.locator('#photo-score')).to_have_text(f'{len(photos) - 1} of {len(photos)} correct.')
    page.get_by_role('link', name='Back to your study sheet').click()
    expect(page).to_have_url(sheet_url)
    expect(page.locator('section[data-study-stage=examples]:visible')).to_be_visible()

    open_topic(page, base, 'work-dialogue', 'l8-work-dialogue')
    page.locator('[data-visual-practice]').click()
    expect(page.locator('#visual-activity')).to_have_value('sentence')
    expect(page.locator('#visual-instruction')).to_contain_text('I am a teacher and I work in a school')
    page.locator('.visual-tile[aria-label="Faccio, unplaced"]').click()
    page.locator('.visual-target').filter(has_text='First verb').click()
    expect(page.locator('#visual-feedback')).to_contain_text('Faccio placed in 1. First verb')
    print(f'Visual practice: loaded and scored {len(photos)} credited photographs and placed a sentence tile.', flush=True)


def main():
    handler = partial(QuietHandler, directory=str(ROOT))
    with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server, sync_playwright() as pw:
        Thread(target=server.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{server.server_port}'
        browser = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
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
            check_visual_practice(page, base)
            check_core(page, base)
            assert not errors, errors
            check_navigation(browser, base)
        finally:
            browser.close()
            server.shutdown()


if __name__ == '__main__':
    main()
