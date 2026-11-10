#!/usr/bin/env python3
"""Test actual study UI; optional --live verifies the public deployment after merge."""
import sys,json,threading,shutil,time
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/web-study-release';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=None
if LIVE: base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   request=p.request.new_context()
   for attempt in range(18):
    response=request.get(base+'/study/study-ready-tools.js?release=20261110a',timeout=30000)
    if response.ok and 'addVerbReference' in response.text():break
    time.sleep(10)
   else: raise AssertionError('New web study assets have not reached production')
   for name in ['study-ready-tools.js','study-ready-tools.css','verb-reference-v1.js']:
    resp=request.get(base+'/study/'+name+'?release=20261110a')
    assert resp.ok and resp.body()==(ROOT/'study'/name).read_bytes(),name+' deployed bytes differ'
   request.dispose()
  for width,height in [(1280,900),(390,844)]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');}')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def visit(path):
     page.goto(base+path,wait_until='networkidle',timeout=60000)
    visit('/?page=card&lesson=L6')
    page.wait_for_selector('.guided-card-host .review-card')
    assert page.evaluate('cards.filter(c=>c.lesson==="L6").length')==66
    assert page.locator('#guidedSubdeckSelect option').count()==8
    visit('/study/study-sheets.html?mode=learn&path=L6')
    page.wait_for_selector('.study-ready-shortcuts')
    titles=page.locator('.sheet-library-item strong').all_text_contents()
    assert len(titles)==8,(len(titles),titles)
    assert not any('Lesson 6' in title for title in titles)
    slugs=page.evaluate('ITALIAN_L6.sheets.map(s=>s.slug)')
    assert len(slugs)>=11
    for slug in slugs:
     visit('/study/study-sheets.html?mode=learn&sheet='+slug)
     page.wait_for_selector('.guided-sheet-steps')
     assert page.locator('[data-guided-step]').count()==3
     page.click('[data-guided-step="practise"]')
     q=page.locator('.quiz-question:not([hidden])');assert q.count()==1
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(slug,width,'overflow')
    visit('/study/study-sheets.html?mode=learn&sheet=l6-number-patterns&stage=practise')
    page.wait_for_selector('[data-number-reveal-mode]')
    assert page.locator('.quiz-question').count()==41
    q=page.locator('.quiz-question:not([hidden])');q.locator('input').fill('zero');q.locator('.check-button').click()
    assert q.get_attribute('data-result')=='correct'
    saved=page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")')
    page.click('[data-number-reveal-mode="flip"]')
    board=page.locator('.number-reveal-board');assert board.is_visible()
    assert not page.locator('.quiz-list').is_visible()
    assert not page.locator('.guided-sheet-controls').is_visible()
    assert board.locator('[data-number-panel="sequence"] .number-flip-card').count()==41
    nums=board.locator('[data-number-panel="sequence"] .number-flip-card').evaluate_all('(els)=>els.map(e=>Number(e.dataset.number))')
    assert nums==list(range(31))+[40,50,60,70,80,90,100,200,1000,10000]
    first=board.locator('[data-number-panel="sequence"] .number-flip-card').first
    first.locator('summary').click();assert first.get_attribute('open') is not None
    page.click('[data-number-action="reveal"]')
    assert board.locator('[data-number-panel="sequence"] details[open]').count()==41
    page.click('[data-number-action="hide"]')
    assert board.locator('[data-number-panel="sequence"] details[open]').count()==0
    page.click('[data-number-view="patterns"]');page.click('[data-number-action="reveal"]')
    assert board.locator('[data-number-panel="patterns"] details[open]').count()==40
    assert board.locator('[data-number-panel="patterns"] h3').all_text_contents()==['UNITÀ','DECINE','CENTINAIA','MIGLIAIA']
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}numbers-{width}-{theme}.png'),full_page=True)
    page.click('[data-guided-step="learn"]')
    assert page.locator('.guided-sheet-controls').is_visible()
    page.click('[data-guided-step="practise"]');page.click('[data-number-reveal-mode="write"]')
    assert page.locator('.quiz-list').is_visible()
    assert page.evaluate('sessionStorage.getItem("italianCourseSessionProgressV2")')==saved
    visit('/study/study-sheets.html?mode=learn&sheet=known-verbs-and-forms&stage=learn')
    page.wait_for_selector('.verb-reference')
    assert page.locator('.verb-entry').count()==8
    for detail in page.locator('.verb-entry').all():
     if detail.get_attribute('open') is None:detail.locator(':scope > summary').click()
     assert detail.locator('tbody tr').count()==6
     if detail.get_attribute('open') is not None:detail.locator(':scope > summary').click()
    page.locator('#di-da-dove > summary').click();page.locator('#agreement > summary').click()
    assert 'dall’' in page.locator('#agreement').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}verbs-{width}-{theme}.png'),full_page=True)
    assert page.locator('.verb-original .matrix-wrap').count()==1
    assert not errors,errors
    results.append({'width':width,'theme':theme,'lesson6_cards':66,'topic_order':titles,'study_routes_tested':len(slugs),'number_cards':41,'pattern_cards':40,'verbs':8,'saved_answers':'preserved','errors':errors,'status':'pass'})
    ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'local','base':base,'cases':results,'anki':'unchanged'}
 (OUT/('live-results.json' if LIVE else 'results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps(report,ensure_ascii=False,indent=2))
finally:
 if server:server.shutdown()
