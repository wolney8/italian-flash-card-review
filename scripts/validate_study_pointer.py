#!/usr/bin/env python3
"""Pointer coverage with a local hosting-badge fixture or the real Netlify badge.
--candidate visits production but substitutes only the candidate CSS in this test browser.
--live verifies deployed bytes before testing; neither mode writes to the public site.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json, shutil, sys, time
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/study-pointer';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv;CANDIDATE='--candidate' in sys.argv
REMOTE=LIVE or CANDIDATE
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=None
if REMOTE:base='https://italian-flash-card-review.netlify.app'
else:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
mode='live' if LIVE else 'candidate' if CANDIDATE else 'local'
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        if LIVE:
            req=p.request.new_context()
            for attempt in range(24):
                r=req.get(base+'/study/question-support-v1.css?v=20261112pointer',timeout=30000)
                if r.ok and r.body()==(ROOT/'study/question-support-v1.css').read_bytes():break
                time.sleep(5)
            else:raise AssertionError('Navigation-safe CSS is not deployed')
            for name in ['question-support-v1.js','guided-sheet-pilot-v1.js','study-sheets-v5.js']:
                r=req.get(base+'/study/'+name+'?verify=20261112pointer')
                assert r.ok and r.body()==(ROOT/'study'/name).read_bytes(),name+' deployed bytes differ'
            req.dispose()
        for width,height,lang,theme in [(1280,900,'en','light'),(1280,900,'it','dark'),(390,844,'en','light'),(390,844,'it','dark')]:
            ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='no-preference')
            def route(r):
                if CANDIDATE and '/study/question-support-v1.css' in r.request.url:
                    r.fulfill(path=str(ROOT/'study/question-support-v1.css'),content_type='text/css')
                elif r.request.url.startswith(base):r.continue_()
                else:r.abort()
            ctx.route('**/*',route)
            ctx.add_init_script('if(window===top){try{localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');localStorage.setItem("italianCourseLanguageV1",'+json.dumps(lang)+');}catch(e){}}')
            page=ctx.new_page();page.set_default_timeout(15000);errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            def index():return page.evaluate('ItalianGuidedStudy.getState().question')
            def activate(button):
                button.scroll_into_view_if_needed()
                # A control can be in view while an iframe is covering it. Test the hit target.
                visible=button.evaluate('(el)=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}')
                assert visible,('Control obscured',button.inner_text(),width,lang)
                box=button.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
                if width<600:page.touchscreen.tap(x,y)
                else:page.mouse.move(x,y);page.mouse.down();page.wait_for_timeout(120);page.mouse.up()
                page.wait_for_timeout(100)
            for slug in ['l6-essere-gaps','l6-negative-homework','l6-plural-workshop','l6-essere-choices']:
                page.goto(base+'/study/study-sheets.html?sheet='+slug,wait_until='networkidle',timeout=60000)
                page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
                if not REMOTE:
                    page.evaluate('''() => {const badge=document.createElement('div');badge.id='test-hosting-badge';badge.style.cssText='position:fixed;right:16px;bottom:20px;width:170px;height:40px;z-index:2147483647;background:#123;color:white;border-radius:20px;text-align:center';badge.textContent='Hosting badge fixture';document.body.append(badge);}''')
                for step in range(4):
                    q=page.locator('.quiz-question:not([hidden])');key=q.get_attribute('data-progress-key');before=index()
                    expected=json.loads(q.get_attribute('data-answers'))[0]
                    if q.get_attribute('data-type')=='choice':
                        next(r for r in q.locator('input[type=radio]').all() if r.input_value()==expected).check()
                    else:q.locator('input[type=text]').fill(expected)
                    activate(q.locator('.check-button'))
                    assert q.get_attribute('data-result')=='correct',(slug,key,'Check failed')
                    assert q.locator('.question-answer-support').is_visible()
                    if q.get_attribute('data-type')=='text':
                        q.locator('input').focus();q.locator('input').dispatch_event('change')
                    activate(page.locator('[data-guided-action=next]'))
                    assert index()==before+1,(slug,key,'Next did not advance once',index())
                    results.append({'viewport':width,'language':lang,'theme':theme,'question':key,'single_check_next':'pass'})
                activate(page.locator('[data-guided-action=back]'));assert index()==3
                page.locator('.quiz-question:not([hidden]) .hint-button').click()
                page.screenshot(path=str(OUT/f'{mode}-{slug}-{width}-{theme}.png'),full_page=True,animations='disabled')
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            assert not errors,errors
            ctx.close()
        browser.close()
    (OUT/(mode+'-results.json')).write_text(json.dumps({'status':'pass','environment':mode,'cases':results,'controls_unobscured':True,'anki':'unchanged'},indent=2))
    print(json.dumps({'status':'pass','environment':mode,'single_click_cases':len(results),'controls_unobscured':True}))
finally:
    if server:server.shutdown()
