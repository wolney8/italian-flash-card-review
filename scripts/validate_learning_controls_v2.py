#!/usr/bin/env python3
"""Native browser tests for explicit study transitions and recall scheduling."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json, shutil, sys, time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'artifacts/learning-controls';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if LIVE:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   req=p.request.new_context()
   for attempt in range(24):
    r=req.get(base+'/learning-controls-v2.js?v=20261112flow',timeout=30000)
    if r.ok and r.body()==(ROOT/'learning-controls-v2.js').read_bytes():break
    time.sleep(5)
   else:raise AssertionError('New control code not deployed')
   for f in ['learning-controls-v2.css','learning-resume-v2.js','study/guided-sheet-pilot-v1.js','guided-course-v2.js']:
    r=req.get(base+'/'+f+'?verify=flow-v2');assert r.ok and r.body()==(ROOT/f).read_bytes(),f
   req.dispose()
  for width,height,language,theme in [(1280,900,'en','light'),(1280,900,'it','dark'),(390,844,'en','light'),(390,844,'it','dark')]:
   ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='reduce')
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   ctx.add_init_script('if(window===top){try{localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');localStorage.setItem("italianCourseLanguageV1",'+json.dumps(language)+');}catch(e){}}')
   page=ctx.new_page();page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def visit(slug):
    page.goto(base+'/study/study-sheets.html?sheet='+slug,wait_until='networkidle',timeout=60000);page.wait_for_selector('[data-flow-skip]')
   def q():return page.locator('.quiz-question:not([hidden])')
   def idx():return page.evaluate('ItalianGuidedStudy.getState().question')
   def answer(text=None):
    el=q();expected=json.loads(el.get_attribute('data-answers'))[0]
    if el.get_attribute('data-type')=='choice':next(i for i in el.locator('input[type=radio]').all() if i.input_value()==expected).check()
    else:el.locator('input[type=text]').fill(expected if text is None else text)
    el.locator('.check-button').click();page.wait_for_timeout(150)
   def pause():page.keyboard.press('Escape');page.wait_for_timeout(100)
   def nextq():page.locator('[data-guided-action=next]').click();page.wait_for_timeout(120)
   visit('class2-alphabet')
   assert idx()==0
   assert page.locator('[data-guided-action=next]').is_disabled()
   assert q().locator('.check-button').is_disabled()
   q().locator('input').fill('a');assert not q().locator('.check-button').is_disabled()
   assert page.locator('[data-guided-action=next]').is_disabled()
   answer();assert q().get_attribute('data-result')=='correct'
   assert q().locator('.check-button').is_disabled()
   assert q().locator('.model-answer>strong').inner_text()==('Answer:' if language=='en' else 'Risposta:')
   page.wait_for_timeout(5400);assert idx()==1,('auto advance',idx())
   page.locator('[data-flow-skip]').click();page.wait_for_timeout(150)
   assert q().get_attribute('data-result')=='skipped'
   assert q().locator('.model-answer').is_visible()
   q().locator('.question-heading').click()
   page.wait_for_timeout(5200);assert idx()==1
   nextq();assert idx()==2
   answer('zzzz');assert q().get_attribute('data-result')=='wrong';pause()
   page.locator('[data-flow-results]').click()
   page.locator('[data-guided-review-incorrect]').click();assert idx()==2
   assert q().locator('input').input_value()=='' and q().locator('.model-answer').is_hidden()
   page.reload(wait_until='networkidle');page.wait_for_selector('[data-flow-skip]');assert idx()==2 and q().locator('.model-answer').is_hidden()
   answer();pause();nextq();assert page.locator('.guided-sheet-finish').is_visible()
   page.locator('[data-guided-review-unanswered]').click()
   queue=page.evaluate('ItalianGuidedStudy.getState().reviewQueue');assert 0 not in queue and 2 not in queue and 1 in queue
   assert idx()==1 and q().locator('.model-answer').is_hidden()
   q().locator('input').fill('draft');before=idx();page.keyboard.press('Alt+ArrowRight');assert idx()==before
   page.locator('[data-flow-quit]').click();page.wait_for_url('**/study-sheets.html?**');page.wait_for_selector('.library-view-tabs')
   visit('class2-alphabet');assert idx()==1 and q().locator('input').input_value()=='draft'
   page.evaluate('ItalianStudyPersistence.captureAll();ItalianGuidedStudy.remember();ItalianLearningResume.save()')
   tab=ctx.new_page();tab.goto(base+'/study/study-sheets.html?sheet=class2-alphabet',wait_until='networkidle');tab.wait_for_selector('[data-flow-skip]');assert tab.locator('.quiz-question:not([hidden]) input').input_value()=='draft';tab.close()
   if not LIVE:page.evaluate('''()=>{const b=document.createElement('div');b.id='test-hosting-badge';b.style.cssText='position:fixed;right:16px;bottom:20px;width:170px;height:40px;z-index:2147483647;background:#123';document.body.append(b);window.dispatchEvent(new Event('resize'));}''')
   page.wait_for_timeout(100);dock=page.locator('.flow-bottom-dock').bounding_box();assert abs(dock['y']+dock['height']-height)<3,dock
   for s in ['[data-flow-skip]','[data-guided-action=next]','[data-guided-action=back]']:
    assert page.locator(s).evaluate('(e)=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}'),s
   page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}practice-{width}-{theme}.png'),full_page=True)
   page.locator('.flow-settings>summary').click();page.locator('[data-flow-auto]').uncheck()
   page.evaluate('''()=>{const p=JSON.parse(sessionStorage.getItem('italianCourseSessionProgressV2'));p.study.answers['sentinel-q1']={result:'correct',value:'safe'};p.flashcards={...(p.flashcards||{}),confidence:{sentinel:'known'}};sessionStorage.setItem('italianCourseSessionProgressV2',JSON.stringify(p));}''')
   page.once('dialog',lambda d:d.accept());page.locator('[data-flow-reset=set]').click();page.wait_for_timeout(600);page.wait_for_selector('[data-flow-skip]')
   saved=page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2"))');assert saved['study']['answers']['sentinel-q1']['value']=='safe' and saved['flashcards']['confidence']['sentinel']=='known'
   assert all(not v.get('result') for k,v in saved['study']['answers'].items() if k.startswith('class2-alphabet-q'))
   for slug in ['l6-essere-gaps','l6-essere-translation','practice-avere','class3-dialogues']:
    visit(slug)
    el=q();kind=el.get_attribute('data-type');expected=json.loads(el.get_attribute('data-answers'))[0]
    if kind=='match':
     vals=json.loads(el.get_attribute('data-match-model'));sels=el.locator('select').all()
     for sel,v in zip(sels,vals):sel.select_option(v)
    elif kind=='order':
     ids=json.loads(expected)
     for pos,wanted in enumerate(ids):
      while el.locator('li[data-order-id]').all()[pos].get_attribute('data-order-id')!=wanted:el.locator('li[data-order-id="'+wanted+'"] [data-order-up]').click()
    elif kind=='choice':next(i for i in el.locator('input[type=radio]').all() if i.input_value()==expected).check()
    else:el.locator('input[type=text]').fill(expected)
    el.locator('.check-button').click();page.wait_for_timeout(150);assert el.get_attribute('data-result')=='correct',(slug,kind)
    n=idx();nextq();assert idx()==n+1
   page.goto(base+'/?page=card&lesson=L6',wait_until='networkidle');page.wait_for_selector('[data-guide-flip]')
   def key():return page.locator('.guided-card-host .review-card').get_attribute('data-key')
   first=key();page.locator('[data-guide-flip]').click();page.wait_for_timeout(450);assert page.locator('[data-guide-rate]').count()==3
   page.locator('[data-guide-rate=again]').click();page.wait_for_timeout(250);assert key()!=first
   page.locator('[data-guide-flip]').click();page.wait_for_timeout(450);page.locator('[data-guide-rate=known]').click();page.wait_for_timeout(250);assert key()==first
   page.locator('[data-guide-flip]').click();page.wait_for_timeout(450);page.locator('[data-guide-rate=known]').click();page.wait_for_timeout(200)
   assert all(x['key']!=first for x in page.evaluate('ItalianFlashFlow.getSchedule().pending'))
   page.locator('[data-guide-flip]').click();page.wait_for_timeout(450)
   notsure=key();page.locator('[data-guide-rate=unsure]').click();page.wait_for_timeout(200)
   assert page.evaluate('ItalianFlashFlow.getSchedule().pending.find(x=>x.key==='+json.dumps(notsure)+').rating')=='unsure'
   page.locator('[data-flow-focus]').click();page.wait_for_timeout(200)
   page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}flashcards-{width}-{theme}.png'),full_page=True)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   assert not errors,errors
   results.append({'width':width,'language':language,'theme':theme,'status':'pass','gated_next':True,'countdown_and_pause':True,'skip_unanswered':True,'clean_retries':True,'quit_resume_new_tab':True,'scoped_reset':True,'fixed_bottom':True,'flash_grading':True})
   ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'repository','cases':results,'anki':'unchanged'}
 (OUT/('live-results.json' if LIVE else 'results.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
finally:
 if server:server.shutdown()
