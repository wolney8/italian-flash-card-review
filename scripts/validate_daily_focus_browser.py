#!/usr/bin/env python3
"""Exercise the Daily Focus preview in a real browser, without learner data."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from datetime import datetime, timedelta
import json
import shutil
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def assert_true(value,message):
    if not value:raise AssertionError(message)

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)

try:
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(base+'/?page=daily-focus',wait_until='domcontentloaded',timeout=60000)
    page.locator('#focusTimeTitle').wait_for(timeout=60000)
    assert_true(page.locator('.df-duration [name=duration]:checked').get_attribute('value')=='5','Default must be five minutes')

    week=page.evaluate('ItalianDailyFocus.weekly().map(row=>row.day)')
    parsed=[datetime.strptime(day,'%Y-%m-%d') for day in week]
    assert_true(len(parsed)==7 and parsed[0].weekday()==0 and parsed[-1].weekday()==6,'Weekly view is not Monday through Sunday')
    assert_true(all(parsed[i+1]-parsed[i]==timedelta(days=1) for i in range(6)),'Week has a gap')

    page.locator('.df-adjustments summary').click()
    bounds=page.evaluate("""() => {
       const a=document.querySelector('#focusDifficulty').getBoundingClientRect();
       const b=document.querySelector('.df-spoken-setting .df-check').getBoundingClientRect();
       return [a.bottom,b.bottom];
    }""")
    assert_true(abs(bounds[0]-bounds[1])<=2,'Spoken checkbox and difficulty selector are not aligned')
    page.select_option('#focusTopicMode','blend')
    page.locator('input[name=focusTopic][value=articles]').check()
    prefs=page.evaluate('ItalianDailyFocus.preferences()')
    assert_true(prefs['focusMode']=='blend' and 'articles' in prefs['focusTopics'],'Blended topics not saved')
    assert_true(not page.evaluate('ItalianDailyFocus.isFlagged("topic","articles")'),'Choosing articles must not flag weakness')

    # Italian interface labels and weekday names. Content IDs and progress do not change.
    page.evaluate("ItalianUI.setLanguage('it')")
    page.wait_for_function("document.documentElement.dataset.uiLanguage==='it' && document.querySelector('#focusWeekTitle')?.textContent==='Una settimana di pratica'",timeout=15000)
    days=page.locator('.df-week .df-day > span:first-child').all_inner_texts()
    assert_true(days==['lun','mar','mer','gio','ven','sab','dom'],'Italian weekdays are incorrect: '+str(days))
    assert_true(page.locator('#focusTopicMode').input_value()=='blend','Language switch lost study-area mode')
    assert_true('articles' in page.evaluate('ItalianDailyFocus.preferences().focusTopics'),'Language switch lost chosen topic')
    assert_true(page.locator('.df-adjustments').get_attribute('open') is not None,'The adjusted controls did not stay expanded')

    page.select_option('#focusTopicMode','only')
    page.locator('input[name=focusTopic][value=articles]').check()
    page.locator('.df-duration label').filter(has_text='2 min').click()
    page.locator('[data-focus-action=start]').click()
    page.locator('.df-task').wait_for(timeout=20000)
    session=page.evaluate('ItalianDailyFocus.getSession()')
    assert_true(len(session['steps'])==4,'Two minutes must assign four steps')
    assert_true(all(s['item']['topicId']=='articles' for s in session['steps']),'Restricted topic leaked into drill')
    assert_true(session['focusMode']=='only','Session did not capture study-area settings')
    assert_true('articoli' in page.locator('.df-task .df-step-meta').inner_text().lower(),'Topic label not Italian')

    # Complete three comparable steps by actual buttons; a wrong answer counts.
    for index in range(3):
      step=page.evaluate('ItalianDailyFocus.currentStep()')
      kind=step['item']['type']
      if kind=='reading':
        page.locator('[data-focus-action=read]').click()
      elif kind in ('flashcard','spoken'):
        page.locator('[data-focus-action=reveal]').click()
        page.locator('[data-focus-action=rate][data-rating=known]').click()
      else:
        page.locator('[data-focus-action=unknown]').click()
      if index<2:page.locator('[data-focus-action=next]').click()
    banner=page.locator('.df-ready-early')
    banner.wait_for(timeout=10000)
    visible=page.evaluate("""() => {
      const card=document.querySelector('.df-task').getBoundingClientRect();
      const invite=document.querySelector('.df-ready-early').getBoundingClientRect();
      return {cardBottom:card.bottom,inviteTop:invite.top,animation:getComputedStyle(document.querySelector('.df-ready-early')).animationName};
    }""")
    assert_true(visible['inviteTop']>=visible['cardBottom']-2,'Qualifying banner appears above the exercise')
    assert_true(visible['animation']=='none','Reduced motion must suppress banner animation')
    page.locator('[data-focus-action=finish]').first.click()
    assert_true(page.evaluate('ItalianDailyFocus.status().state')=='completed','Finishing should keep daily completion')

    # Phone layout and selectable area controls.
    mobile=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    phone=mobile.new_page()
    phone.goto(base+'/?page=daily-focus',wait_until='domcontentloaded',timeout=60000)
    phone.locator('#focusTimeTitle').wait_for(timeout=60000)
    phone.locator('.df-adjustments summary').click()
    assert_true(phone.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'Phone has horizontal overflow')
    phone.select_option('#focusTopicMode','blend')
    phone.locator('.df-topic-choice').first.wait_for(timeout=10000)
    assert_true(phone.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'Topic checkboxes overflow phone')
    sizes=phone.locator('.daily-focus button:visible').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)')
    assert_true(all(size>=43 for size in sizes),'Phone touch controls are too small')
    assert_true(not errors,'Page error: '+json.dumps(errors))
    mobile.close()
    context.close()
    browser.close()
    print('PASS Daily Focus browser: Monday-Sunday, Italian weekdays, topic mode, responsive alignment, reduced-motion banner and completion')
finally:
  server.shutdown()
