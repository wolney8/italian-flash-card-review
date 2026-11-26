#!/usr/bin/env python3
"""Check the shared header and Daily Practice reference without mutating course data."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import threading,shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)+'/?page=daily-practice'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        for width in [1280,390]:
            context=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce')
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(url,wait_until='domcontentloaded',timeout=60000)
            page.locator('#exercise .panel').wait_for(timeout=60000)
            assert page.locator('h1').filter(has_text='Daily Practice').count()>=1
            assert page.locator('#overview').is_visible()
            assert page.locator('#overview').get_attribute('open') is not None
            assert page.locator('#overview .conj-matrix').count()==1
            assert page.locator('#overview .conj-matrix tr').count()==4
            assert page.locator('#overview .conj-plural').count()==1
            assert page.locator('#overview .conj-plural').get_attribute('open') is None
            assert page.locator('#overview').inner_text().count('finisco')>=1
            assert page.locator('#reference').get_attribute('open') is None
            page.locator('#ref-title').click()
            assert page.locator('#reference').get_attribute('open') is not None
            if page.locator('#exercise input[type=radio]').count():
                page.locator('#exercise input[type=radio]').first.check()
            else:
                page.locator('#exercise input[name=answer]').fill('una risposta sbagliata')
            page.locator('#exercise button[type=submit]').click()
            page.locator('#exercise [data-action=next]').wait_for(timeout=10000)
            assert page.locator('#reference').get_attribute('open') is not None,'Checking an answer collapsed the reference'
            page.locator('#exercise [data-action=next]').click()
            assert page.locator('#reference').get_attribute('open') is not None,'Next Question collapsed the reference'
            assert page.locator('#overview').get_attribute('open') is not None,'Next Question collapsed the comparison'
            assert page.locator('#exercise .question-title').count()==1
            assert page.locator('html').evaluate('(el)=>el.scrollWidth<=innerWidth+2'),'Horizontal overflow'
            if width==1280:
                icon=page.locator('.course-site-comment')
                assert icon.is_visible()
                assert icon.locator('svg').count()==1
                assert icon.get_attribute('aria-label')=='Comments'
                assert not icon.inner_text().strip()
                # The button stays inside the visible navigation/header.
                measurements=icon.evaluate('(el)=>{const r=el.getBoundingClientRect(),h=document.querySelector(".course-site-header").getBoundingClientRect();return {buttonLeft:r.left,buttonRight:r.right,headerRight:h.right}}')
                assert measurements['buttonRight']<=measurements['headerRight']+2,'Comments icon clipped'
                assert 'Daily Focus' in page.locator('.course-site-navigation').inner_text()
                assert 'Daily Practice' in page.locator('.course-site-navigation').inner_text()
            else:
                assert page.locator('.course-site-menu').is_visible()
                page.locator('.course-site-menu').click()
                assert page.locator('.course-site-comment').is_visible()
            assert not errors,'Page errors: '+repr(errors)
            context.close()
        browser.close()
        print('PASS: Daily Practice comparison, expanded-reference persistence, navigation icon, labels and mobile layout')
finally:
    server.shutdown()
