#!/usr/bin/env python3
"""Real-site Lesson 6 smoke test; no Google Sheet comments or progress are sent."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json, os, shutil, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/lesson6-browser';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844)]:
   ctx=browser.new_context(viewport={'width':width,'height':height})
   # Test only local site assets. Never send automatic analytics or review comments.
   ctx.route('**/*',lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
   page=ctx.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(base+'/?page=card&lesson=L6',wait_until='networkidle')
   page.wait_for_selector('.guided-card-host .review-card')
   counts=page.evaluate('({total:cards.length,l6:cards.filter(c=>c.lesson==="L6").length,topics:ITALIAN_L6.topics})')
   assert counts['total']==511 and counts['l6']==66,counts
   assert page.locator('#guidedSubdeckSelect option').count()==6
   page.select_option('#guidedSubdeckSelect',label=counts['topics'][1]);page.click('[data-guide-flip]')
   page.wait_for_selector('.show-answer')
   assert page.locator('.show-answer .l6-n-join').count()>0
   page.screenshot(path=str(OUT/f'flashcard-numbers-{width}.png'),full_page=True)
   # Original source image appears after reaching the Claudia speaking task.
   page.select_option('#guidedSubdeckSelect',label=counts['topics'][3])
   for _ in range(6):page.click('[data-guide-next]')
   page.click('[data-guide-flip]');page.wait_for_selector('.show-answer')
   page.wait_for_function('Array.from(document.querySelectorAll(".show-answer img")).every(i=>i.complete&&i.naturalWidth>0)')
   assert page.locator('.show-answer img').count()>0
   page.screenshot(path=str(OUT/f'flashcard-intonation-{width}.png'),full_page=True)
   slugs=page.evaluate('ITALIAN_L6.sheets.map(s=>s.slug)')
   for slug in slugs:
    page.goto(base+'/study/study-sheets.html?mode=learn&sheet='+slug,wait_until='networkidle')
    page.wait_for_selector('.guided-sheet-steps')
    assert page.locator('[data-guided-step]').count()==3
    page.click('[data-guided-step="examples"]')
    page.click('[data-guided-step="practise"]')
    q=page.locator('.quiz-question:not([hidden])')
    assert q.count()==1
    left=page.locator('[data-guided-action="back"]').bounding_box();right=page.locator('[data-guided-action="next"]').bounding_box()
    assert abs(left['y']-right['y'])<=3,(slug,width,left,right)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(slug,width,'page overflow')
    # Correctness and feedback are exercised via the actual site checker.
    val=q.get_attribute('data-answers');correct=json.loads(val)[0]
    if q.locator('input[type=text]').count():
     q.locator('input[type=text]').fill(correct)
    else:q.locator('input[type=radio]').evaluate_all('(els,v)=>{const e=els.find(x=>x.value===v);e.checked=true;e.dispatchEvent(new Event("change",{bubbles:true}));}',correct)
    q.locator('.check-button').click()
    assert q.get_attribute('data-result')=='correct',(slug,correct)
    assert q.locator('.l6-feedback-explanation').count()==1
    results.append({'viewport':width,'sheet':slug,'render':'pass','answer':'pass','paired_buttons':'pass'})
   page.goto(base+'/study/study-sheets.html?mode=learn&sheet=l6-essere-gaps',wait_until='networkidle');page.wait_for_selector('.guided-sheet-steps');page.click('[data-guided-step="practise"]')
   for _ in range(2):page.click('[data-guided-action="next"]')
   q=page.locator('.quiz-question:not([hidden])');q.locator('input').fill('e');q.locator('.check-button').click();assert q.get_attribute('data-result')=='wrong'
   q.locator('input').fill('è');q.locator('.check-button').click();assert q.get_attribute('data-result')=='correct'
   page.goto(base+'/study/study-sheets.html?mode=learn&sheet=l6-intonation',wait_until='networkidle');page.wait_for_selector('.guided-sheet-steps')
   page.wait_for_function('Array.from(document.querySelectorAll(".l6-int-pair img")).every(i=>i.complete&&i.naturalWidth>0)')
   assert page.locator('.l6-int-pair img').count()==2
   page.screenshot(path=str(OUT/f'study-intonation-{width}.png'),full_page=True)
   page.click('[data-guided-step="practise"]')
   for _ in range(2):page.click('[data-guided-action="next"]')
   q=page.locator('.quiz-question:not([hidden])');q.locator('input').fill('Sei inglese.');q.locator('.check-button').click();assert q.get_attribute('data-result')=='wrong'
   q.locator('input').fill('Sei inglese?');q.locator('.check-button').click();assert q.get_attribute('data-result')=='correct'
   assert not errors,errors
   ctx.close()
  browser.close()
 (OUT/'results.json').write_text(json.dumps({'status':'pass','study_cases':results,'strict_accent':'pass','strict_punctuation':'pass','flashcards':66,'earlier_cards':445},indent=2))
 print('PASS actual Lesson 6 web UI: 18 study cases, 66 cards, curves/images, accent and punctuation, no script errors.')
finally:server.shutdown()
