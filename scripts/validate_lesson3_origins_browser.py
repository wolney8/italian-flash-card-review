#!/usr/bin/env python3
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json, shutil, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/lesson3-origins';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844)]:
   for theme in ['light','dark']:
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    ctx.route('**/*',lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
    ctx.add_init_script('localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');sessionStorage.setItem("italianCourseSessionProgressV2",JSON.stringify({flashcards:{viewed:{origin_di_tu:true},confidence:{origin_di_tu:"known"}}}));')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/?page=card&lesson=L3&topic=03%20Origins%20%26%20questions',wait_until='networkidle')
    page.wait_for_function('!!window.__L3_ORIGINS_SINGULAR__')
    page.wait_for_selector('.guided-card-host .review-card')
    data=page.evaluate('({all:cards,sequence:ItalianLesson3Origins.sequence,moves:ItalianLesson3Origins.moves,core:ItalianLesson3Origins.core})')
    assert len(data['all'])==511
    core=[c for c in data['all'] if c['lesson']=='L3' and c['deck']==data['core']]
    assert [c['key'] for c in core]==data['sequence'] and len(core)==15
    assert sum(c['lesson']=='L3' for c in data['all'])==120
    assert sum(c['lesson']=='L6' for c in data['all'])==66
    assert page.locator('#guidedSubdeckSelect option').filter(has_text='08 Later - plural questions').count()==1
    for i,c in enumerate(core):
     current=page.locator('.guided-card-host .review-card')
     assert current.get_attribute('data-key')==c['key'],(width,theme,i,c['key'])
     assert page.locator('.l3-topic-primer').count()==1
     page.locator('[data-guide-flip]').click();page.wait_for_timeout(450)
     if c['key']!='origin_where':
      assert current.locator('.l3-singular-forms tbody tr').count()==3
      assert 'Complete reply' in current.inner_text()
      assert current.locator('.l3-dialogue').count()==1
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(width,theme,c['key'],'overflow')
     prev=page.locator('[data-guide-prev]').bounding_box();nxt=page.locator('[data-guide-next]').bounding_box()
     assert abs(prev['y']-nxt['y'])<=3
     if c['key'] in ['origin_da_tu','origin_di_lei','liveq_vivi']:
      page.screenshot(path=str(OUT/(c['key']+'-'+str(width)+'-'+theme+'.png')),full_page=True,animations='disabled')
     results.append({'width':width,'theme':theme,'key':c['key'],'status':'pass'})
     if i<len(core)-1:page.locator('[data-guide-next]').click()
    page.locator('[data-guide-next]').click()
    assert page.locator('.guided-complete').is_visible()
    stored=page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2"))')
    assert stored['flashcards']['viewed']['origin_di_tu']
    assert stored['flashcards']['confidence']['origin_di_tu']=='known'
    assert not errors,errors
    if width==1280 and theme=='light':
     (OUT/'runtime-cards.json').write_text(json.dumps(data['all'],ensure_ascii=False,indent=2))
     (OUT/'core-cards.json').write_text(json.dumps(core,ensure_ascii=False,indent=2))
    ctx.close()
  browser.close()
 (OUT/'browser-results.json').write_text(json.dumps({'status':'pass','cases':results,'core_cards':15,'new_cards':0,'course_cards':511,'lesson3_cards':120,'retained_history':'pass'},indent=2))
 print('PASS 60 actual card views: desktop/mobile, light/dark, complete replies, navigation and existing recall state.')
finally:server.shutdown()
