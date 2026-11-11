#!/usr/bin/env python3
"""Exercise real content, routes, homework selection, persisted answers and mobile navigation."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import quote
import json, shutil, threading, subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/study-flow';OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./lesson6/content.js')))"],cwd=ROOT))
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'],headless=True)
  for width in [1280,390]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':900 if width>500 else 844},reduced_motion='reduce')
    ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    ctx.add_init_script(f"localStorage.setItem('italianCourseThemeV1','{theme}');localStorage.setItem('italianCourseLanguageV1','en');")
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/?page=topics',wait_until='networkidle')
    page.wait_for_url('**/study/study-sheets.html?mode=learn')
    page.wait_for_selector('.sheet-library-item');assert page.locator('.sheet-library-item').count()==17
    # Check what a learner sees, not the hidden alternate-language source spans.
    assert page.locator('.sheet-library-item strong').all_inner_texts().count('Essere in the present')==1
    assert not any(t.startswith('Lesson 6') for t in page.locator('.sheet-library-item strong').all_inner_texts())
    page.select_option('#studyPathPicker','L6');page.wait_for_url('**path=L6');page.wait_for_selector('.sheet-library-item')
    expected=[next(s['title'] for s in DATA['sheets'] if s['slug']==slug) for slug in DATA['flow']]
    assert page.locator('.sheet-library-item strong').all_inner_texts()==expected
    page.screenshot(path=str(OUT/f'library-{width}-{theme}.png'),full_page=True)
    for i,slug in enumerate(DATA['flow']):
     page.goto(base+'/study/study-sheets.html?mode=learn&sheet='+slug+'&stage=learn',wait_until='networkidle')
     page.wait_for_selector('.guided-sheet-steps');page.wait_for_selector('.study-detail-tools')
     sheet=next(s for s in DATA['sheets'] if s['slug']==slug)
     assert page.locator('.study-pack-sheet > header h1').inner_text()==sheet['title']
     assert page.locator('#studySheetPicker option').count()==8
     assert page.locator('#studySheetPicker').input_value()==slug
     assert not page.locator('.course-site-breadcrumb .editorial-label').count()
     stages=page.locator('[data-guided-step]');assert stages.count()==3
     page.click('[data-guided-step="learn"]')
     assert page.locator('.study-pack-sheet > .panel[data-study-stage="learn"]:not([hidden])').count()==1
     for _ in range(sum(s['stage']=='learn' for s in sheet['study_sections'])):page.click('[data-guided-action="next"]')
     assert page.locator('[data-guided-step="examples"]').get_attribute('aria-current')=='step'
     for _ in range(sum(s['stage']=='examples' for s in sheet['study_sections'])):page.click('[data-guided-action="next"]')
     assert page.locator('[data-guided-step="practise"]').get_attribute('aria-current')=='step'
     assert page.locator('.quiz-question:not([hidden])').count()==1
     buttons=[page.locator('[data-guided-action="'+name+'"]').bounding_box() for name in ['back','next']]
     assert abs(buttons[0]['y']-buttons[1]['y'])<3
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(slug,width,'overflow')
     page.locator('.quiz-question:not([hidden])').scroll_into_view_if_needed()
     old=page.locator('.quiz-question:not([hidden])').bounding_box()['y']
     page.click('[data-guided-action="next"]')
     new=page.locator('.quiz-question:not([hidden])').bounding_box()['y']
     assert 8<=new<=page.viewport_size['height']-90,(slug,width,old,new)
     for _ in range(len(sheet['questions'])):
      if page.locator('.guided-sheet-finish').is_visible():break
      page.click('[data-guided-action="next"]')
     follow=page.locator('.guided-sheet-followup').get_attribute('href')
     assert (DATA['flow'][i+1] in follow) if i+1<len(DATA['flow']) else ('lesson=L6' in follow)
     if slug=='l6-essere-class':
      assert page.locator('#studyPracticePicker option').count()==4
      page.click('[data-guided-step="practise"]')
      page.select_option('#studyPracticePicker','l6-essere-gaps');page.wait_for_url('**sheet=l6-essere-gaps**');page.wait_for_selector('.guided-sheet-steps')
      assert page.locator('[data-guided-step="practise"]').get_attribute('aria-current')=='step'
      assert page.locator('#studySheetPicker').input_value()=='l6-essere-class'
      q=page.locator('.quiz-question:not([hidden])');q.locator('input[type=text]').fill('sono');q.locator('.check-button').click()
      assert q.get_attribute('data-result')=='correct'
      assert q.locator('.feedback').inner_text()=='Correct'
      page.wait_for_timeout(60)
      page.select_option('#studyPracticePicker','l6-essere-translation');page.wait_for_url('**sheet=l6-essere-translation**');page.wait_for_selector('#studyPracticePicker')
      page.select_option('#studyPracticePicker','l6-essere-gaps');page.wait_for_url('**sheet=l6-essere-gaps**');page.wait_for_selector('.guided-sheet-steps')
      assert page.locator('.quiz-question:not([hidden]) input[type=text]').input_value()=='sono'
      assert page.locator('.quiz-question:not([hidden]) .feedback').inner_text()=='Correct'
      page.screenshot(path=str(OUT/f'homework-{width}-{theme}.png'),full_page=True)
      page.goto(base+'/study/study-sheets.html?mode=learn&path=L6',wait_until='networkidle')
      page.wait_for_selector('.sheet-library-item')
      entry=page.locator('.sheet-library-item').filter(has=page.locator('strong',has_text='Essere in the present'))
      assert '1 / 36 attempted' in entry.inner_text(),entry.inner_text()
      assert '4 practice sets' in entry.inner_text(),entry.inner_text()
     if slug in ['l6-number-patterns','l6-intonation']:
      page.click('[data-guided-step="learn"]')
      if slug=='l6-intonation':
       page.wait_for_function('Array.from(document.querySelectorAll(".l6-int-pair img")).every(i=>i.complete&&i.naturalWidth>0)')
       assert page.locator('.l6-int-pair img').count()==2
      page.screenshot(path=str(OUT/f'{slug}-{width}-{theme}.png'),full_page=True)
     results.append({'slug':slug,'viewport':width,'theme':theme,'status':'pass'})
    page.goto(base+'/?page=card&lesson=L6',wait_until='networkidle');page.wait_for_selector('.guided-card-host .review-card')
    assert page.locator('#guidedSubdeckSelect option').all_text_contents()==DATA['topics']
    assert page.locator('.guided-study-lesson-link').count()==1
    page.goto(base+'/?page=card&lesson=L6&topic='+quote('01 Conversation and age')+'&card=6',wait_until='networkidle')
    page.wait_for_selector('.guided-card-host .review-card')
    assert page.locator('.guided-card-host .review-card').get_attribute('data-key')=='italian-l6-age-formal'
    assert not errors,errors
    ctx.close()
  browser.close()
 (OUT/'results.json').write_text(json.dumps({'status':'pass','cases':results,'source_order':'pass','homework_progress':'preserved','legacy_links':'pass','anki':'paused'},indent=2))
 print('PASS source-aligned class flow, 32 topic/theme/viewport cases, one catalogue, homework persistence and old card links.')
finally:server.shutdown()
