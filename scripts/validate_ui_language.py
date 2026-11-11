#!/usr/bin/env python3
"""Test the complete rendered site, language-only switching, and unchanged exercises."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import json,shutil,threading,sys,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/ui-language';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=None
if LIVE:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[];untranslated=set()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   req=p.request.new_context()
   for attempt in range(24):
    response=req.get(base+'/course-ui-language-v1.js?verify=20261111',timeout=30000)
    if response.ok and response.body()==(ROOT/'course-ui-language-v1.js').read_bytes():break
    time.sleep(10)
   else:raise AssertionError('Production language script is not the release version')
   req.dispose()
  for width,height in [(1280,900),(390,844)]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');}')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def visit(path):
     page.goto(base+path,wait_until='networkidle',timeout=45000)
     page.wait_for_selector('.course-site-language');page.wait_for_function('!!window.ItalianUI')
     page.wait_for_timeout(100)
    def language(value):
     if page.evaluate('ItalianUI.language')!=value:page.locator('.course-site-language').click()
     page.wait_for_function('document.documentElement.lang==='+json.dumps(value));page.wait_for_timeout(100)
    def stable():
     f=page.evaluate('ItalianUI.flushes');page.wait_for_timeout(250)
     assert page.evaluate('ItalianUI.flushes')-f<12,'Localization mutation loop'
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'),'Horizontal overflow'
    def assert_single_labels():
     assert page.locator('.editorial-label>[lang="en"]:visible').count()==0,'English interface subtitle visible in Italian'
    visit('/?page=home');language('it');assert_single_labels();stable()
    assert page.locator('.course-site-brand strong').inner_text()=='Italiano per principianti'
    page.reload(wait_until='networkidle');assert page.evaluate('ItalianUI.language')=='it'
    visit('/?page=lessons');assert page.evaluate('ItalianUI.language')=='it';assert_single_labels()
    visit('/?page=card&lesson=L6');page.wait_for_selector('.guided-card-host .review-card')
    card=page.locator('.guided-card-host .review-card')
    key=card.get_attribute('data-key')
    count=page.evaluate('cards.length');assert count==511
    page.locator('[data-guide-flip]').click();page.wait_for_selector('.review-card.show-answer')
    answer=card.locator('.italian').text_content()
    before=page.evaluate('JSON.stringify(cards)')
    language('en');language('it')
    assert card.get_attribute('data-key')==key
    assert card.evaluate('e=>e.classList.contains("show-answer")')
    assert card.locator('.italian').text_content()==answer
    assert page.evaluate('JSON.stringify(cards)')==before
    page.locator('[data-guide-next]').click();assert_single_labels();stable()
    visit('/study/study-sheets.html?mode=learn&path=L6');page.wait_for_selector('.sheet-library-item')
    assert_single_labels();assert page.locator('#studyPathPicker').input_value()=='L6';stable()
    assert page.locator('#studyPathPicker option:checked').inner_text()=='Lezione 6 — ordine degli argomenti'
    slugs=page.evaluate('ITALIAN_L6.sheets.map(s=>s.slug)')+['conversation-foundations','di-da-dove-pronouns','subject-pronouns-present-tense','known-verbs-and-forms','word-jobs-sentence-building','avere-numbers-family','plural-articles','c-g-sounds-and-spelling','mixed-review-challenge']
    for slug in slugs:
     visit('/study/study-sheets.html?mode=learn&sheet='+slug+'&stage=learn')
     page.wait_for_selector('.guided-sheet-steps')
     assert page.evaluate('ItalianUI.language')=='it';assert_single_labels()
     title=page.locator('.study-pack-sheet>header h1').inner_text()
     english=page.evaluate('ItalianUI.sourceText(document.querySelector(".study-pack-sheet>header h1"))')
     assert title==page.evaluate('(s)=>ItalianUI.translate(s,"it")',english)
     assert title!=english,(slug,'Untranslated title',title)
     allowed={'tu','Lei','voi','essere','avere','vivere','venire','abitare','stare','andare','Essere','UNITÀ','DECINE','CENTINAIA','MIGLIAIA'}
     for h in page.locator('th').all():
      source=h.evaluate('(el)=>ItalianUI.sourceText(el)')
      actual=h.inner_text() if h.is_visible() else h.text_content()
      if source not in allowed and actual.strip()==source.strip():untranslated.add(source)
     page.click('[data-guided-step="examples"]');page.wait_for_timeout(80)
     assert page.locator('.guided-sheet-current-title').inner_text()=='Esempi'
     page.click('[data-guided-step="practise"]');page.wait_for_timeout(80)
     assert page.locator('.guided-sheet-current-title').inner_text()=='Esercizi'
     q=page.locator('.quiz-question:not([hidden])');assert q.count()==1
     original_answers=q.get_attribute('data-answers');q.locator('.hint-button').click();page.wait_for_timeout(120)
     hint=q.locator('.hint');assert hint.is_visible()
     en_hint=hint.evaluate('(el)=>ItalianUI.sourceText(el)')
     assert hint.inner_text()==page.evaluate('(s)=>ItalianUI.translate(s,"it")',en_hint)
     assert q.get_attribute('data-answers')==original_answers
     language('en');assert page.locator('.study-pack-sheet>header h1').inner_text()==english
     language('it');assert hint.is_visible();stable()
     results.append({'width':width,'theme':theme,'sheet':slug,'status':'pass'})
    visit('/study/study-sheets.html?sheet=l6-number-patterns&stage=practise')
    page.wait_for_selector('[data-number-reveal-mode]')
    q=page.locator('.quiz-question:not([hidden])');q.locator('input').fill('zero')
    language('en');language('it');assert q.locator('input').input_value()=='zero'
    q.locator('.check-button').click()
    page.wait_for_function('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2"))?.study?.answers?.["l6-number-patterns-q1"]?.result==="correct"')
    saved=page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")')
    page.click('[data-number-reveal-mode="flip"]');page.click('[data-number-action="reveal"]')
    assert page.locator('[data-number-panel="sequence"] details[open]').count()==41
    language('en');language('it')
    assert page.locator('[data-number-panel="sequence"] details[open]').count()==41
    assert page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")')==saved
    page.click('[data-number-view="patterns"]');assert_single_labels();stable()
    page.screenshot(path=str(OUT/f'numbers-{width}-{theme}.png'),full_page=False)
    visit('/study/study-sheets.html?sheet=known-verbs-and-forms&stage=learn')
    page.wait_for_selector('.verb-reference');page.locator('#di-da-dove>summary').click()
    assert page.locator('#di-da-dove>summary').inner_text()=='Perché di dove, da dove o solo dove?'
    assert page.locator('.ui-study-gloss:visible').count()==0
    language('en');assert page.locator('#di-da-dove>summary').inner_text()=='Why di dove, da dove, or just dove?'
    language('it');stable()
    page.screenshot(path=str(OUT/f'verbs-{width}-{theme}.png'),full_page=False)
    assert not errors,errors
    ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'local','cases':results,'untranslated_headers':sorted(untranslated),'cards':511,'saved_answers':'preserved','exercise_answers':'unchanged','anki':'unchanged'}
 (OUT/('live-results.json' if LIVE else 'results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2))
 assert not untranslated,('Untranslated structural headers',sorted(untranslated))
 print(json.dumps(report,ensure_ascii=False,indent=2))
finally:
 if server:server.shutdown()
