#!/usr/bin/env python3
"""Check typed answers through three real UIs, using isolated local browser data."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlencode
import json
import os
import re
import shutil

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INIT = """
if (location.protocol === 'http:' || location.protocol === 'https:') {
  localStorage.setItem('italianCourseLanguageV1', 'en');
  localStorage.setItem('italianAutoAdvanceV2', 'off');
}
"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def new_page(browser, width=1280):
    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
    context.add_init_script(INIT)
    page = context.new_page()
    page.set_default_timeout(15000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    return context, page, errors


def guidance(page, input_box, expected=True):
    described = input_box.get_attribute('aria-describedby')
    if expected:
        assert described, 'Typed input has no associated answer guidance'
        message = page.locator('#' + described)
        expect(message).to_be_visible()
        expect(message).to_contain_text(re.compile(r'(full|whole) word', re.I))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), 'Answer UI overflows the viewport'


def check_focus(browser, base):
    """Resume canonical snapshots containing only the pre-change answer keys."""
    context, page, errors = new_page(browser)
    page.goto(base + '/?page=daily-focus', wait_until='domcontentloaded')
    page.locator('#focusTimeTitle').wait_for(timeout=60000)
    cases = {
        'Italian-l7-class-lavorare-1': ('o', 'lavoro', 'lavori'),
        'verb-studiare-tu-ending': ('i', 'studi', 'studii'),
        'class2-c-sounds-q8': ('ch', 'barche', 'barce'),
        'l8-s-pagine': ('gi', 'pagine', 'paghine'),
    }
    for variant in range(3):
        seeded = page.evaluate("""async ids => {
          const pool = await ItalianDailyFocusContent.buildPool();
          const selected = ids.map(id => pool.find(item => item.sourceId === id));
          if (selected.some(item => !item)) throw Error('Missing approved Focus source');
          const session = ItalianDailyFocus.createSession(selected, {duration:2,difficulty:'standard'});
          ItalianDailyFocus.saveDraft('saved draft', session.id);
          ItalianDailyFocus.saveLater(session.id);
          return {id:session.id, items:session.steps.map(step => step.item)};
        }""", list(cases))
        screenshot = next(item for item in seeded['items'] if item['sourceId'] == 'Italian-l7-class-lavorare-1')
        assert screenshot['answers'] == ['lavoro'], 'Canonical snapshot was expanded in storage'
        # A real navigation reloads saved snapshots, then the actual Resume button opens them.
        page.reload(wait_until='domcontentloaded')
        page.locator('#focusTimeTitle').wait_for(timeout=60000)
        page.locator('[data-focus-action=resume][data-session="' + seeded['id'] + '"]').click()
        expect(page.locator('#focusAnswer')).to_have_value('saved draft')
        for _ in range(4):
            step = page.evaluate('ItalianDailyFocus.currentStep()')
            part, word, wrong = cases[step['item']['sourceId']]
            answer = (part, word, wrong)[variant]
            box = page.locator('#focusAnswer')
            guidance(page, box)
            expect(page.locator('#focusTaskTitle')).not_to_contain_text(re.compile(r'write only the missing', re.I))
            box.fill(answer)
            page.locator('#focusAnswerForm button[type=submit]').click()
            expect(page.locator('.df-feedback')).to_be_visible()
            expect(page.locator('.df-model')).to_have_text(word)
            result = page.evaluate('ItalianDailyFocus.currentStep().result')
            assert result['correct'] is (variant != 2), (step['item']['sourceId'], answer, result)
            page.locator('[data-focus-action=next]').click()
        stored = page.evaluate('id => ItalianDailyFocus.getSession(id).steps.map(step => step.item)', seeded['id'])
        assert stored == seeded['items'], 'Rendering or grading changed saved source snapshots'
    assert not errors, json.dumps(errors)
    context.close()
    print('PASS Focus: saved drafts/snapshots resume; exact fragments and full words grade correctly; misspellings fail', flush=True)


def check_practice(browser, base):
    context, page, errors = new_page(browser, 390)
    page.goto(base + '/?page=daily-practice', wait_until='domcontentloaded')
    page.locator('#exercise .panel').wait_for(timeout=60000)
    cases = {
        'verb-lavorare-io-ending': ('o', 'lavoro', 'lavori'),
        'verb-studiare-tu-ending': ('i', 'studi', 'studii'),
        'verb-significare-tu-ending': ('i', 'significhi', 'significi'),
        'verb-finire-io-ending': ('o', 'finisco', 'finisci'),
        'verb-chiamarsi-io-ending': ('o', 'mi chiamo', 'mi'),
    }
    for variant in range(3):
        page.evaluate("""ids => {
          const today = new Date();
          const day = Math.floor(Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) / 86400000);
          localStorage.setItem('italianDailyPractice.v1', JSON.stringify({
            day,topic:'verbs',group:'all',family:'all',verb:'all',focus:{verbs:'ending'},
            sessions:{'verbs:all:all:ending':{round:0,ids,results:[],index:0}}
          }));
        }""", list(cases))
        page.reload(wait_until='domcontentloaded')
        page.locator('#exercise .panel').wait_for(timeout=60000)
        for index, (key, (part, word, wrong)) in enumerate(cases.items()):
            answer = (part, word, wrong)[variant]
            # The reflexive pronoun is already supplied, so the word alone is valid too.
            if key == 'verb-chiamarsi-io-ending' and variant == 1:
                answer = 'chiamo'
            box = page.locator('#exercise input[name=answer]')
            guidance(page, box)
            expect(page.locator('#exercise .question-title')).not_to_contain_text(re.compile(r'write only the missing', re.I))
            box.fill(answer)
            page.locator('#exercise button[type=submit]').click()
            expect(page.locator('#exercise .feedback > p:first-child > .learning-it')).to_have_text(word)
            session = page.evaluate("JSON.parse(localStorage.getItem('italianDailyPractice.v1')).sessions['verbs:all:all:ending']")
            assert session['ids'][index] == key
            assert session['results'][index]['correct'] is (variant != 2), (key, answer, session['results'][index])
            page.locator('#exercise [data-action=next]').click()
    assert not errors, json.dumps(errors)
    context.close()
    print('PASS Practice: full words, exact endings, written-stem exceptions and reflexives on phone width', flush=True)


def check_sheets(browser, base):
    cases = [
        ('l7-class-lavorare', 'Italian-l7-class-lavorare-1', 0, 'o', 'lavoro', 'lavori'),
        ('l7-endings', 'Italian-l7-ending-1', 0, '-o', 'lavoro', 'i'),
        ('class2-c-sounds', 'class2-c-sounds-q8', 7, 'ch', 'barche', 'barce'),
        ('l8-pronunciation-practice', 'l8-s-pagine', 11, 'gi', 'pagine', 'paghine'),
    ]
    for variant in range(3):
        # Fresh isolated sessions allow checking each representation as a first attempt.
        context, page, errors = new_page(browser, 390 if variant == 1 else 1280)
        for slug, key, index, part, word, wrong in cases:
            params = {'mode':'learn', 'sheet':slug, 'stage':'practise'}
            page.goto(base + '/study/study-sheets.html?' + urlencode(params), wait_until='domcontentloaded')
            page.locator('.study-pack-sheet[data-guided-pilot=ready]').wait_for(timeout=60000)
            page.evaluate('question => ItalianGuidedStudy.setState({step:"practise",question,finished:false})', index)
            question = page.locator('.quiz-question:not([hidden])')
            expect(question).to_have_attribute('data-question-key', key)
            box = question.locator('input[type=text]')
            guidance(page, box)
            expect(question.locator('.model-answer')).to_be_hidden()
            box.fill((part, word, wrong)[variant])
            question.locator('.check-button').click()
            expect(question).to_have_attribute('data-result', 'wrong' if variant == 2 else 'correct')
            expect(question.locator('.model-answer')).to_be_visible()
            model = question.locator('.model-answer').evaluate("el => Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim()")
            assert model == word, (key, model, word)
        # The existing accent-aware checker still distinguishes e from è.
        page.goto(base + '/study/study-sheets.html?mode=learn&sheet=l6-essere-gaps&stage=practise', wait_until='domcontentloaded')
        page.locator('.study-pack-sheet[data-guided-pilot=ready]').wait_for(timeout=60000)
        page.evaluate('ItalianGuidedStudy.setState({step:"practise",question:2,finished:false})')
        question = page.locator('.quiz-question:not([hidden])')
        expect(question).to_have_attribute('data-question-key', 'l6-gap-3')
        question.locator('input[type=text]').fill('e' if variant == 2 else 'è')
        question.locator('.check-button').click()
        expect(question).to_have_attribute('data-result', 'wrong' if variant == 2 else 'correct')
        assert not errors, json.dumps(errors)
        context.close()
    print('PASS Study Sheets: four source examples, full-word models, accessible guidance and preserved accent grading', flush=True)


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = 'http://127.0.0.1:' + str(server.server_port)
try:
    with sync_playwright() as playwright:
        executable = os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or shutil.which('google-chrome') or shutil.which('chromium')
        browser = playwright.chromium.launch(executable_path=executable, headless=True, args=['--no-sandbox'])
        check_focus(browser, base)
        check_practice(browser, base)
        check_sheets(browser, base)
        browser.close()
        print('PASS typed-answer browser regression across Focus, Practice and Study Sheets')
finally:
    server.shutdown()
