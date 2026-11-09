#!/usr/bin/env python3
"""Exercise actual number practice, progress, saved answers and completion. No Anki."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json, shutil, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/number-practice';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
route='/study/study-sheets.html?mode=learn&sheet=l6-number-patterns&stage=practise'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844)]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    ctx.add_init_script(f"localStorage.setItem('italianCourseThemeV1','{theme}');")
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+route,wait_until='networkidle');page.wait_for_selector('.guided-sheet-steps')
    assert page.locator('.quiz-question').count()==41
    page.click('[data-guided-step="practise"]')
    assert page.locator('.quiz-question:not([hidden])').count()==1
    for i in range(41):
     q=page.locator('.quiz-question:not([hidden])')
     expected=json.loads(q.get_attribute('data-answers'))[0]
     if i==23:
      q.locator('input[type=text]').fill('ventitre');q.locator('.check-button').click()
      assert q.get_attribute('data-result')=='wrong'
     q.locator('input[type=text]').fill(expected);q.locator('.check-button').click()
     assert q.get_attribute('data-result')=='correct',(width,theme,i,expected)
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
     back=page.locator('[data-guided-action="back"]').bounding_box()
     forward=page.locator('[data-guided-action="next"]').bounding_box()
     assert abs(back['y']-forward['y'])<=3
     if i in [0,23,31,40]:
      assert f'of 41' in page.locator('.guided-sheet-position').inner_text()
     if i==23:
      page.screenshot(path=str(OUT/f'number-23-{width}-{theme}.png'),full_page=True,animations='disabled')
     page.click('[data-guided-action="next"]')
    assert page.locator('.guided-sheet-finish').is_visible()
    assert '41 of 41 correct' in page.locator('.guided-sheet-finish-score').inner_text()
    assert 'l6-age-dialogue' in page.locator('.guided-sheet-followup').get_attribute('href')
    page.screenshot(path=str(OUT/f'complete-{width}-{theme}.png'),full_page=True,animations='disabled')
    page.reload(wait_until='networkidle');page.wait_for_selector('.guided-sheet-steps')
    assert '41 of 41 correct' in page.locator('.guided-sheet-finish-score').inner_text()
    assert not errors,errors
    results.append({'width':width,'theme':theme,'typed_answers':41,'accent':'pass','completion':'pass','reload':'pass','paired_buttons':'pass'})
    ctx.close()
  # An upgraded session keeps matching answers, not their previous positions.
  ctx=browser.new_context(viewport={'width':390,'height':844})
  ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
  ctx.add_init_script("""if(!sessionStorage.getItem('migrationSeeded')){
    sessionStorage.setItem('migrationSeeded','yes');
    sessionStorage.setItem('italianCourseSessionProgressV2',JSON.stringify({study:{answers:{'l6-number-patterns-q1':{value:'ventuno',result:'correct'},'l6-essere-gaps-q1':{value:'sono',result:'correct'}}}}));
  }""")
  page=ctx.new_page();page.goto(base+route,wait_until='networkidle');page.wait_for_selector('.guided-sheet-steps')
  page.click('[data-guided-step="practise"]')
  assert page.locator('.quiz-question').nth(0).locator('input').input_value()==''
  for _ in range(21):page.click('[data-guided-action="next"]')
  assert page.locator('.quiz-question:not([hidden]) input').input_value()=='ventuno'
  assert 'correct' in page.locator('.quiz-question:not([hidden]) .feedback').get_attribute('class')
  assert page.evaluate("JSON.parse(sessionStorage.getItem('italianCourseSessionProgressV2')).study.answers['l6-essere-gaps-q1'].value")=='sono'
  ctx.close();browser.close()
 (OUT/'results.json').write_text(json.dumps({'status':'pass','cases':results,'legacy_answer_migration':'pass','anki_generated':False},indent=2))
 print('PASS 164 answers across desktop/phone and light/dark, 41-question progress, completion, reload and legacy migration.')
finally:server.shutdown()
