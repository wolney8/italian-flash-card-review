#!/usr/bin/env python3
"""Focused checks for final presentation and result-screen actions."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json, re, shutil, sys, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/course-library';OUT.mkdir(parents=True,exist_ok=True)
live='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
def contrast(colours):
 def luminance(rgb):
  values=[float(v)/255 for v in re.findall(r'[\d.]+',rgb)[:3]]
  linear=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in values]
  return sum(a*b for a,b in zip(linear,[0.2126,0.7152,0.0722]))
 a,b=map(luminance,colours);return (max(a,b)+0.05)/(min(a,b)+0.05)
server=None
if live:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for width,height,theme in [(1280,900,'light'),(390,844,'dark')]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
   context.add_init_script("try{localStorage.setItem('italianAutoAdvanceV2','off')}catch(_){}")
   context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   context.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){if(!sessionStorage.getItem("finishTest")){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');localStorage.setItem("italianCourseLanguageV1","it");sessionStorage.setItem("finishTest","yes");}}')
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
   page.goto(base+'/study/study-sheets.html?lesson=L3&topic=origins&set=class3-complete-replies&sheet=class3-complete-replies',wait_until='domcontentloaded')
   page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
   q=page.locator('.quiz-question:not([hidden])')
   assert 'Scrivi la risposta completa' in q.locator('.question-heading').inner_text()
   assert 'Give the complete' not in q.locator('.question-heading').inner_text()
   assert 'Esercizi adattati' in page.locator('.study-pack-sheet > header .lead').inner_text()
   assert page.locator('.quiz-question b button').count()==0
   q.locator('input[type=text]').fill('Io sono di Na')
   widths=[]
   for language in ['en','it','en','it']:
    page.locator('.course-site-language').click()
    page.wait_for_function('(lang)=>ItalianUI.language===lang && !document.documentElement.classList.contains("ui-language-changing")',arg=language)
    widths.append(page.locator('.course-site-language').bounding_box()['width'])
    assert q.locator('input[type=text]').input_value()=='Io sono di Na'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   assert max(widths)-min(widths)<1
   q.locator('input[type=text]').fill('wrong');q.locator('.check-button').click()
   page.click('[data-flow-results]')
   assert page.locator('.guided-sheet-finish').is_visible()
   assert page.locator('[data-library-finish-round=quick]').is_visible()
   assert page.locator('[data-library-finish-round=full]').is_visible()
   assert page.locator('.guided-sheet-finish button').first.get_attribute('data-guided-review-incorrect') is not None
   ratios={}
   for selector in ['.guided-sheet-primary','.guided-sheet-followup']:
    colours=page.locator('.guided-sheet-finish '+selector).first.evaluate('(e)=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor]}')
    ratios[selector]=round(contrast(colours),2)
    assert ratios[selector]>=4.5,(theme,selector,colours,ratios)
   page.screenshot(path=str(OUT/f'{"live-" if live else ""}results-{width}-{theme}.png'),full_page=True,animations='disabled')
   with page.expect_navigation(wait_until='domcontentloaded'):page.click('[data-library-finish-round=quick]')
   page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
   assert page.evaluate('ItalianGuidedStudy.getState().round.mode')=='quick'
   assert len(page.evaluate('ItalianGuidedStudy.getState().round.keys'))==10
   verb_targets={
    'practice-avere':('L4','01 Avere - present tense'),
    'practice-essere':('L6','Essere in the present'),
    'practice-venire':('L3','03 Origins & questions'),
    'practice-vivere':('L3','03 Origins & questions'),
    'practice-abitare':('L3','03 Origins & questions'),
    'practice-chiamarsi':('L1','02 Introductions'),
    'practice-stare':('L2','00 Greetings & wellbeing'),
    'practice-andare':('L6','Greetings and responses')
   }
   for slug,(lesson,deck) in verb_targets.items():
    page.goto(base+'/study/study-sheets.html?sheet='+slug,wait_until='domcontentloaded')
    page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
    params=parse_qs(urlparse(page.locator('[data-related-flashcards]').get_attribute('href')).query)
    assert params['lesson']==[lesson] and params['topic']==[deck],(slug,params)
   assert not errors,errors
   results.append({'width':width,'theme':theme,'normal_motion':'pass','translated_instruction':'pass','result_restart':'pass','verb_links':len(verb_targets),'button_contrast':ratios,'status':'pass'})
   context.close()
  browser.close()
 (OUT/('live-finish-results.json' if live else 'finish-results.json')).write_text(json.dumps(results,indent=2))
 print('PASS translated instructions, fixed-width normal-motion language switch, result restart, contrast and verb links.')
finally:
 if server:server.shutdown()
