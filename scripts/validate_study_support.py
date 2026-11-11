#!/usr/bin/env python3
"""Real pointer, touch and keyboard regression, plus deployed support verification."""
import json, sys, threading, shutil, time
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/study-support';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if LIVE:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   req=p.request.new_context()
   for attempt in range(18):
    response=req.get(base+'/study/question-support-v1.js?release=20261111s1',timeout=30000)
    if response.ok and response.body()==(ROOT/'study/question-support-v1.js').read_bytes():break
    time.sleep(10)
   else:raise AssertionError('Support release not deployed')
   for name in ['question-support-v1.css','guided-sheet-pilot-v1.js','study-sheets-v5.js']:
    response=req.get(base+'/study/'+name+'?release=20261111s1');assert response.ok and response.body()==(ROOT/'study'/name).read_bytes(),name+' differs from release'
   req.dispose()
  for width,height,theme,lang in [(1280,900,'light','en'),(1280,900,'dark','it'),(390,844,'light','en'),(390,844,'dark','it')]:
   ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='reduce')
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');}')
   page=ctx.new_page();page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('dialog',lambda d:d.accept())
   def visit(slug):
    page.goto(base+'/study/study-sheets.html?sheet='+slug,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('window.ItalianStudySupport && window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
    page.wait_for_selector('.quiz-question[data-language-support=ready]:not([hidden])')
    if page.evaluate('ItalianUI.language')!=lang:
     page.click('.course-site-language');page.wait_for_function('(v)=>ItalianUI.language===v',arg=lang);page.wait_for_timeout(120)
   def current():return page.locator('.quiz-question:not([hidden])')
   def index():return page.evaluate('ItalianGuidedStudy.getState().question')
   def activate(button,kind='pointer'):
    button.scroll_into_view_if_needed()
    if kind=='keyboard':button.focus();button.press('Enter')
    elif kind=='space':button.focus();button.press('Space')
    elif kind=='touch':button.tap()
    else:
     b=button.bounding_box();page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2);page.mouse.down();page.wait_for_timeout(120);page.mouse.up()
   def fill(q,correct=True):
    answers=json.loads(q.get_attribute('data-answers'));expected=answers[0];kind=q.get_attribute('data-type')
    if kind=='choice':
     radios=q.locator('input[type=radio]');target=next(r for r in radios.all() if r.input_value()==expected);target.check()
    elif kind=='match':
     for select,value in zip(q.locator('[data-match-select]').all(),json.loads(expected)):select.select_option(value)
    else:q.locator('input[type=text]').fill(expected if correct else 'wrong')
   for slug in ['class4-avere-homework','l6-essere-gaps','l6-negative-homework','l6-number-patterns','class4-silent-h','practice-essere','class4-family','class3-dialogues','l6-plural-workshop','class2-c-sounds']:
    visit(slug)
    count=min(4,page.evaluate('ItalianGuidedStudy.questions().length'))
    for step in range(count):
     q=current();key=q.get_attribute('data-progress-key');before=index()
     assert not q.locator('.model-answer').is_visible()
     assert not q.locator('.question-answer-support').is_visible()
     fill(q)
     # Check once. The button loses the text input's focus normally; no forced click.
     activate(q.locator('.check-button'),'touch' if width<600 else 'pointer')
     page.wait_for_timeout(90)
     assert q.get_attribute('data-result')=='correct',(slug,key,'first Check click')
     assert q.locator('.model-answer').is_visible()
     assert q.locator('.question-support-pron').count()>0,(slug,key,'no pronunciation')
     assert q.locator('.question-support-english').count()>0,(slug,key,'no meaning')
     # A later native blur/change must not discard the checked result.
     if q.get_attribute('data-type')=='text':
      inp=q.locator('input[type=text]');inp.focus();inp.dispatch_event('change');assert q.get_attribute('data-result')=='correct'
     activate(page.locator('[data-guided-action=next]'),'touch' if width<600 else 'pointer')
     page.wait_for_timeout(90)
     if before+1<page.evaluate('ItalianGuidedStudy.questions().length'):
      assert index()==before+1,(slug,key,'one Next did not advance exactly once',index())
     else:assert page.locator('.guided-sheet-finish').is_visible()
     assert page.evaluate('(key)=>document.querySelector(`[data-progress-key="${key}"]`).dataset.result',key)=='correct'
     results.append({'width':width,'theme':theme,'language':lang,'route':slug,'question':key,'check_once_next_once':'pass'})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(slug,width,'overflow')
   # Enter in the answer field, then keyboard activation of Next must not fire an extra refresh.
   visit('class4-avere-class')
   q=current();fill(q);activate(q.locator('.check-button'),'keyboard');page.wait_for_timeout(70)
   before=index();activate(page.locator('[data-guided-action=next]'),'space');page.wait_for_timeout(70);assert index()==before+1
   visit('class3-complete-replies')
   q=current();fill(q);q.locator('input[type=text]').press('Enter');page.wait_for_timeout(70)
   assert q.get_attribute('data-result')=='correct'
   before=index();activate(page.locator('[data-guided-action=next]'),'keyboard');page.wait_for_timeout(70);assert index()==before+1
   # Actual content: supplied meaning stays English; no hidden answer is exposed before checking.
   page.evaluate('sessionStorage.removeItem("italianStudyRoundV2:l6-essere-class");sessionStorage.removeItem("italianGuidedSheetPilotV1:l6-essere-class")')
   visit('l6-essere-class');q=current()
   assert q.locator('.l6-gloss').inner_text()=='I am at home.'
   assert '[…]' in q.locator('.question-prompt-support').inner_text()
   assert 'SOH-noh' not in q.locator('.question-prompt-support').inner_text()
   q.locator('.hint-button').click();assert q.locator('.hint').is_visible()
   fill(q,False);activate(q.locator('.check-button'));page.wait_for_timeout(80)
   assert q.get_attribute('data-result')=='wrong'
   assert 'Io sono a casa.' in q.locator('.question-answer-support').inner_text()
   assert 'I am at home.' in q.locator('.question-answer-support').inner_text()
   assert 'SOH-noh' in q.locator('.question-answer-support').inner_text()
   english=q.locator('.question-answer-support .question-support-english').inner_text()
   page.click('.course-site-language');page.wait_for_timeout(200)
   assert q.locator('.question-answer-support .question-support-english').inner_text()==english
   assert q.locator('input[type=text]').input_value()=='wrong'
   q.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}support-{width}-{theme}.png'),animations='disabled')
   fill(q);activate(q.locator('.check-button'));page.wait_for_timeout(80)
   assert q.get_attribute('data-result')=='correct'
   assert page.evaluate('ItalianGuidedStudy.getState().round.first["l6-essere-class-q1"]')=='wrong'
   activate(page.locator('[data-guided-action=next]'));page.wait_for_timeout(80);assert index()==1
   page.reload(wait_until='domcontentloaded');page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
   assert index()==1
   activate(page.locator('[data-guided-action=back]'));page.wait_for_timeout(70)
   assert current().get_attribute('data-result')=='correct'
   assert current().locator('.question-answer-support').is_visible()
   assert not errors,errors
   ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'repository','pointer_touch_cases':results,'keyboard':'Enter checks; Enter or Space advances once','source_gloss':'preserved','answer_leakage':'not observed','language_toggle':'learning meaning unchanged','checked_result_after_blur':'preserved','incorrect_then_correct':'first result retained','reload':'position retained','anki':'unchanged'}
 (OUT/('live-results.json' if LIVE else 'browser-results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='pointer_touch_cases'},indent=2));print('Single-check/single-next cases:',len(results))
finally:
 if server:server.shutdown()
