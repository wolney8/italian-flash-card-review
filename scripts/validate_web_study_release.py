#!/usr/bin/env python3
"""Read-only interaction tests for the web study release, including production mode.
No Anki export/build and no requests to review/comment submission endpoints.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json, os, shutil, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/web-study-release'; OUT.mkdir(parents=True, exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=None
base=os.environ.get('STUDY_TEST_BASE','')
if not base:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
base=base.rstrip('/')
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844)]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.route('**/*',lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
    ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');}')
    page=ctx.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def visit(path):
        page.goto(base+path,wait_until='networkidle');page.wait_for_timeout(100)
    def fits():
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,theme,'page overflow',page.url)
    visit('/?page=card&lesson=L6')
    page.wait_for_selector('.guided-card-host .review-card')
    counts=page.evaluate('({total:cards.length,l6:cards.filter(c=>c.lesson==="L6").length,l3:cards.filter(c=>c.lesson==="L3").length})')
    assert counts=={'total':511,'l6':66,'l3':120},counts
    visit('/study/study-sheets.html?path=L6')
    page.wait_for_selector('.study-quick-access')
    assert page.locator('.sheet-library-item').count()==8
    assert page.locator('a[href*="reference=1"]').count()>=1
    titles=page.locator('.sheet-library-item strong').all_text_contents()
    assert not any(t.startswith('Lesson 6') for t in titles),titles
    fits()
    visit('/study/study-sheets.html?sheet=l6-number-patterns&stage=practise&exercise=flip')
    page.wait_for_selector('.read-reveal-panel:not([hidden])')
    assert page.locator('.read-reveal-card').count()==41
    assert page.locator('.read-reveal-card[open]').count()==0
    before=page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")')
    page.locator('[data-reveal-all]').click()
    assert page.locator('.read-reveal-card[open]').count()==41
    assert page.locator('.read-reveal-count').inner_text()=='41 of 41 cards revealed'
    assert before==page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")'),'Reveal changes scored progress'
    assert page.locator('.read-reveal-neighbours').first.inner_text()=='0 zero · 1 uno'
    page.locator('[data-hide-all]').click()
    assert page.locator('.read-reveal-card[open]').count()==0
    page.locator('.read-reveal-card summary').first.click()
    assert page.locator('.read-reveal-card[open]').count()==1
    page.locator('[data-reveal-board="patterns"]').click()
    assert page.locator('.read-reveal-card').count()==40
    assert page.locator('.read-reveal-group h3').all_text_contents()==['UNITÀ','DECINE','CENTINAIA','MIGLIAIA']
    page.locator('[data-reveal-all]').click()
    assert page.locator('.read-reveal-card[open]').count()==40
    assert page.locator('.read-reveal-answer .l6-n-hundred').count()>=9
    assert page.locator('.read-reveal-answer .l6-n-thousand').count()>=10
    fits()
    page.screenshot(path=str(OUT/f'numbers-{width}-{theme}.png'),animations='disabled')
    page.locator('[data-practice-style="typed"]').click()
    question=page.locator('.quiz-question:not([hidden])')
    assert question.count()==1 and question.is_visible()
    question.locator('input[type=text]').fill('zero');question.locator('.check-button').click()
    assert question.get_attribute('data-result')=='correct'
    page.locator('[data-practice-style="flip"]').click()
    page.locator('[data-practice-style="typed"]').click()
    assert question.locator('input[type=text]').input_value()=='zero'
    assert question.get_attribute('data-result')=='correct'
    for _ in range(23):page.locator('[data-guided-action="next"]').click()
    question=page.locator('.quiz-question:not([hidden])')
    question.locator('input[type=text]').fill('ventitre');question.locator('.check-button').click()
    assert question.get_attribute('data-result')=='wrong'
    question.locator('input[type=text]').fill('ventitré');question.locator('.check-button').click()
    assert question.get_attribute('data-result')=='correct'
    visit('/study/study-sheets.html?sheet=l6-intonation&stage=learn')
    page.wait_for_selector('.guided-sheet-steps')
    page.wait_for_function('Array.from(document.querySelectorAll(".l6-int-pair img")).some(i=>i.complete&&i.naturalWidth>0)')
    assert page.locator('.l6-int-pair img').count()==2
    page.locator('[data-guided-step="practise"]').click();page.locator('[data-practice-style="flip"]').click()
    assert page.locator('.read-reveal-card').count()==6
    page.locator('[data-reveal-all]').click();assert page.locator('.read-reveal-card[open]').count()==6
    fits()
    visit('/study/study-sheets.html?sheet=known-verbs-and-forms&stage=learn&reference=1')
    page.wait_for_selector('.verb-reference')
    assert page.locator('#referenceVerb option').count()==8
    assert not page.locator('.guided-sheet-steps').is_visible()
    for index in range(8):
        page.select_option('#referenceVerb',str(index))
        assert page.locator('.verb-reference-body>.verb-forms>.verb-form').count()==3
        page.locator('.verb-reference-body details summary').click()
        assert page.locator('.verb-reference-body details .verb-form').count()==6
        fits()
    assert 'Di is not “for cities”' in page.locator('.verb-reference').inner_text()
    assert 'gender' in page.locator('.verb-reference').inner_text()
    assert 'added study support' in page.locator('.verb-reference').inner_text()
    page.select_option('#referenceVerb','2')
    page.screenshot(path=str(OUT/f'verbs-{width}-{theme}.png'),animations='disabled')
    visit('/study/study-sheets.html?sheet=known-verbs-and-forms&stage=practise')
    page.wait_for_selector('.guided-sheet-steps')
    assert not page.locator('.verb-reference').count()
    assert page.locator('.quiz-question:not([hidden])').is_visible()
    assert not errors,errors
    results.append({'width':width,'theme':theme,'lesson6_flashcards':66,'lesson6_topics':8,'number_sequence':41,'pattern_cards':40,'verb_entries':8,'quiz_progress_preserved':True,'strict_accent':True,'no_page_errors':True,'status':'pass'})
    ctx.close()
  browser.close()
 (OUT/('production-browser.json' if os.environ.get('STUDY_TEST_BASE') else 'browser-results.json')).write_text(json.dumps({'base':base,'status':'pass','cases':results},indent=2))
 print(json.dumps({'base':base,'status':'pass','cases':results},indent=2))
finally:
 if server:server.shutdown()
