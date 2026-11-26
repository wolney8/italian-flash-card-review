#!/usr/bin/env python3
"""Today tabs, previous URLs, and Lesson 9 source-backed content in a real browser."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
import threading,shutil
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(srv.server_port)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width in [1180,390]:
   context=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce')
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(base+'/?page=today',timeout=60000)
   expect(page.locator('[data-today-tab=focus]')).to_have_attribute('aria-selected','true')
   page.locator('#focusTimeTitle').wait_for(timeout=60000)
   if width==1180:
    expect(page.locator('#courseSiteNavigation a')).to_have_count(4)
    labels=page.locator('#courseSiteNavigation a').all_inner_texts()
    assert labels==['Home','Today','Lessons','Study Sheets'],labels
    comment=page.locator('.course-site-comment')
    assert comment.locator('svg').count()==1
    assert comment.locator('svg path').count()==1,'Comments icon must have no cross-line'
   page.get_by_role('tab',name='Practice',exact=False).click()
   expect(page.locator('[data-today-tab=practice]')).to_have_attribute('aria-selected','true')
   expect(page).to_have_url(base+'/?page=today&tab=practice')
   page.locator('#exercise .panel').wait_for(timeout=60000)
   assert page.locator('#overview').get_attribute('open') is not None
   assert page.locator('#overview .conj-matrix').count()==2
   page.locator('#ref-title').click()
   assert page.locator('#reference').get_attribute('open') is not None
   if page.locator('#exercise input[type=radio]').count():
    page.locator('#exercise input[type=radio]').first.check()
   else:
    page.locator('#exercise input[name=answer]').fill('errore')
   page.locator('#exercise button[type=submit]').click()
   page.locator('#exercise [data-action=next]').wait_for(timeout=10000)
   page.locator('#exercise [data-action=next]').click()
   assert page.locator('#reference').get_attribute('open') is not None
   page.get_by_role('tab',name='Focus',exact=False).click()
   page.locator('#focusTimeTitle').wait_for(timeout=60000)
   expect(page.locator('[data-today-tab=focus]')).to_have_attribute('aria-selected','true')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'Today overflows at '+str(width)
   context.close()
  context=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce')
  page=context.new_page()
  page.goto(base+'/?page=daily-practice',timeout=60000)
  page.wait_for_url('**/?page=today&tab=practice',timeout=20000)
  page.locator('#exercise .panel').wait_for(timeout=60000)
  page.goto(base+'/?page=card&lesson=L9',timeout=60000)
  page.locator('.guided-card-host .review-card').wait_for(timeout=60000)
  assert page.evaluate("ItalianFlashcards.cardList('L9').length")==22
  expect(page.locator('.guided-card-host .review-card')).to_have_attribute('data-lesson','L9')
  page.goto(base+'/study/study-sheets.html?mode=learn&browse=lesson&lesson=L9',timeout=60000)
  page.locator('.library-lesson-detail').wait_for(timeout=60000)
  assert page.locator('[data-library-lesson=L9]').count()==1
  assert page.locator('.library-homework [data-homework-item]').count()==8
  assert 'p. 171' in page.locator('.library-homework').inner_text()
  page.locator('.homework-revision summary').click()
  assert 'p. 233' in page.locator('.library-homework').inner_text()
  page.goto(base+'/study/study-sheets.html?mode=learn&sheet=l9-ere-class',timeout=60000)
  page.wait_for_function("ItalianStudyData?.some(sheet=>sheet.slug==='l9-ere-class')",timeout=60000)
  assert page.evaluate("ItalianStudyData.find(s=>s.slug==='l9-ere-class').questions.length")==30
  context.close()
  browser.close()
  print('PASS: Today tabs and aliases, reference retention, 4 menu items, simple comment icon, Lesson 9 cards, sheets and sourced homework.')
finally:
 srv.shutdown()
