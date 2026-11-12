#!/usr/bin/env python3
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from urllib.parse import quote
import json,shutil,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'artifacts/learning-controls';OUT.mkdir(parents=True,exist_ok=True)
live='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if live:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
checks=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='reduce')
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   ctx.add_init_script("if(window===top){try{localStorage.setItem('italianAutoAdvanceV2','off');localStorage.setItem('italianCourseLanguageV1','en');localStorage.setItem('italianCourseThemeV1','light')}catch(_){}}")
   page=ctx.new_page();page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
   def visit(slug,extra=''):
    page.goto(base+'/study/study-sheets.html?sheet='+slug+extra,wait_until='networkidle');page.wait_for_selector('[data-flow-skip]')
   def q():return page.locator('.quiz-question:not([hidden])')
   visit('class2-alphabet')
   q().locator('input[type=text]').fill('a');q().locator('input[type=text]').press('Enter');page.wait_for_timeout(100)
   assert q().get_attribute('data-result')=='correct'
   q().locator('input[type=text]').press('Enter');page.wait_for_timeout(100);assert page.evaluate('ItalianGuidedStudy.getState().question')==1
   q().locator('input[type=text]').fill('no');page.keyboard.press('Alt+KeyH');assert q().locator('.hint').is_visible()
   page.keyboard.press('Alt+KeyS');page.wait_for_timeout(100);assert q().get_attribute('data-result')=='skipped'
   page.keyboard.press('Alt+ArrowRight');assert page.evaluate('ItalianGuidedStudy.getState().question')==2
   visit('class4-silent-h')
   page.locator('.question-heading').click();page.keyboard.press('1')
   options=q().locator('input[type=radio]');assert options.nth(0).is_checked()
   page.keyboard.press('2');assert options.nth(1).is_checked()
   page.keyboard.press('Enter');page.wait_for_timeout(120);assert q().get_attribute('data-result') in ['correct','wrong']
   visit('class4-family','&lesson=L4&topic=family&set=class4-family')
   match=q();values=json.loads(json.loads(match.get_attribute('data-answers'))[0]);sels=match.locator('[data-match-select]').all()
   for sel,v in zip(sels[:-1],values[:-1]):sel.select_option(v)
   assert match.locator('.check-button').is_disabled()
   wrong=next(x.get_attribute('value') for x in sels[-1].locator('option').all() if x.get_attribute('value') not in ['',values[-1]])
   sels[-1].select_option(wrong);match.locator('.check-button').click();page.wait_for_timeout(120);assert match.get_attribute('data-result')=='wrong'
   page.locator('[data-flow-results]').click();page.locator('[data-guided-review-incorrect]').click()
   assert all(s.input_value()=='' for s in q().locator('[data-match-select]').all())
   assert q().locator('.model-answer').is_hidden()
   q().locator('[data-match-select]').first.select_option(values[0]);page.wait_for_timeout(120)
   page.locator('[data-flow-quit]').click();page.wait_for_load_state('networkidle')
   visit('class4-family','&lesson=L4&topic=family&set=class4-family');assert q().locator('[data-match-select]').first.input_value()==values[0]
   assert q().locator('.model-answer').is_hidden()
   page.evaluate("""()=>{const p=JSON.parse(sessionStorage.getItem('italianCourseSessionProgressV2'));p.study.answers['class4-avere-homework-q1']={result:'correct',value:'ho'};p.study.answers['class2-alphabet-q1']={result:'correct',value:'a'};p.flashcards={confidence:{safe:'known'}};sessionStorage.setItem('italianCourseSessionProgressV2',JSON.stringify(p));}""")
   page.locator('.flow-settings>summary').click();page.locator('[data-flow-reset=lesson]').click();page.wait_for_timeout(700);page.wait_for_selector('[data-flow-skip]')
   saved=page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2"))')
   assert 'class4-avere-homework-q1' not in saved['study']['answers']
   assert saved['study']['answers']['class2-alphabet-q1']['result']=='correct' and saved['flashcards']['confidence']['safe']=='known'
   page.goto(base+'/?page=card&lesson=L6&topic='+quote('Number-building patterns'),wait_until='networkidle');page.wait_for_selector('[data-guide-flip]')
   def key():return page.locator('.guided-card-host .review-card').get_attribute('data-key')
   first=key();page.keyboard.press('Space');page.wait_for_timeout(450);assert page.locator('.review-card.show-answer').count()==1
   page.keyboard.press('2');page.wait_for_timeout(100)
   seen=[]
   for _ in range(3):
    seen.append(key());assert key()!=first
    page.keyboard.press('Space');page.wait_for_timeout(450);page.keyboard.press('3');page.wait_for_timeout(100)
   assert key()==first,(first,seen,key())
   if not page.evaluate('document.body.classList.contains("guided-focus-active")'):page.keyboard.press('f')
   assert page.evaluate('document.body.classList.contains("guided-focus-active")')
   page.keyboard.press('Escape');assert not page.evaluate('document.body.classList.contains("guided-focus-active")')
   assert not errors,errors
   checks.append({'width':width,'enter_check_next':'pass','hint_skip_shortcuts':'pass','choice_digit_shortcuts':'pass','matching_retry_blank_and_resumable':'pass','lesson_reset_preserves_other_lessons_and_flashcards':'pass','not_sure_three_intervening_cards':'pass','focus_keyboard':'pass'})
   ctx.close()
  browser.close()
 (OUT/('live-edge-results.json' if live else 'edge-results.json')).write_text(json.dumps({'status':'pass','checks':checks},indent=2));print(json.dumps(checks,indent=2))
finally:
 if server:server.shutdown()
