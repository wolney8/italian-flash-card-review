#!/usr/bin/env python3
"""Exercise the deployed UI, canonical IDs, lesson navigation and round state.
Uses the existing Chromium on GitHub's runner. Never creates Anki packages.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import sys,json,shutil,threading,time,traceback
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/course-library';OUT.mkdir(parents=True,exist_ok=True)
LIVE='--live' in sys.argv
FOCUS=sys.argv[sys.argv.index('--focus')+1] if '--focus' in sys.argv else 'all'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=None
if LIVE:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[];page=None
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   req=p.request.new_context()
   for attempt in range(24):
    response=req.get(base+'/study/library-v1.js?verify=lesson-library',timeout=30000)
    if response.ok and response.body()==(ROOT/'study/library-v1.js').read_bytes():break
    time.sleep(5)
   else:raise AssertionError('Production library script does not yet match the release')
   for name in ['study/library-map-v1.js','study/library-content-v1.js','course-shell-boot-v1.js','course-ui-language-v1.js']:
    response=req.get(base+'/'+name+'?verify=lesson-library');assert response.ok and response.body()==(ROOT/name).read_bytes(),name+' deployed bytes differ'
   req.dispose()
  variants=[(1280,900,'light','en'),(390,844,'light','it'),(1280,900,'dark','it'),(390,844,'dark','en')]
  if FOCUS in ['legacy','lesson6','numbers']:variants=variants[:2]
  for width,height,theme,lang in variants:
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   ctx.add_init_script("try{localStorage.setItem('italianAutoAdvanceV2','off')}catch(_){}")
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){if(!sessionStorage.getItem("libraryTestInit")){localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');localStorage.setItem("italianCourseLanguageV1",'+json.dumps(lang)+');sessionStorage.setItem("libraryTestInit","yes");}window.__oldFrame=[];function watch(){for(const e of document.querySelectorAll(".study-course-shell,body:not(.guided-enabled)>.site-shell")){if(getComputedStyle(e).display!=="none"&&getComputedStyle(e).visibility==="visible"&&e.getBoundingClientRect().height>0)window.__oldFrame.push(e.className);}requestAnimationFrame(watch);}requestAnimationFrame(watch);}')
   page=ctx.new_page();page.set_default_timeout(20000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('dialog',lambda d:d.accept())
   def visit(path):
    page.goto(base+path,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('window.ItalianUI && !document.documentElement.classList.contains("course-booting")')
   def language(value):
    if page.evaluate('ItalianUI.language')!=value:page.locator('.course-site-language').click();page.wait_for_function('(v)=>ItalianUI.language===v',arg=value);page.wait_for_timeout(100)
   def new_round(mode):
    with page.expect_navigation(wait_until='domcontentloaded'):
     page.click('[data-library-round='+mode+']')
    page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
   def check_layout():
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(page.url,width,'horizontal overflow')
    assert page.locator('.course-site-language').inner_text().replace(' ','').replace('\n','')=='ITA/ENG'
    assert not errors,errors
   visit('/study/study-sheets.html?mode=learn')
   assert page.locator('[data-library-lesson]').count()==7
   assert page.locator('[data-library-lesson]').evaluate_all("els=>els.map(el=>el.dataset.libraryLesson)")==['L1','L2','L3','L4','L5','L6','L7']
   assert page.locator('#studyPathPicker').count()==0
   assert len(page.evaluate('window.__oldFrame'))==0,'Legacy study chrome painted during load'
   for i in range(1,8):
    visit('/study/study-sheets.html?mode=learn&lesson=L'+str(i))
    assert page.locator('.library-lesson-detail [data-library-topic]').count()>2
    if i<=6:
     assert page.locator('.library-extras').count()==1
     assert page.locator('.library-extras').get_attribute('open') is None
    else:
     assert page.locator('.library-lesson-detail [data-library-topic]').count()==8
    check_layout()
   page.screenshot(path=str(OUT/f'lessons-{width}-{theme}.png'),full_page=True,animations='disabled')
   visit('/study/study-sheets.html?browse=topic')
   assert page.locator('.library-topic-section').count()==6
   check_layout()
   dataset=page.evaluate('ItalianStudyData');assert len(dataset)==68
   assert sum(not s['slug'].startswith('l7-') and s['slug']!='l6-recap-useful-requests' for s in dataset)==53
   assert sum(s['slug'].startswith('l7-') for s in dataset)==14
   assert sum(s['slug']=='l6-recap-useful-requests' for s in dataset)==1
   if FOCUS=='all':route_data=dataset
   elif FOCUS=='legacy':route_data=dataset[:9]
   elif FOCUS=='lesson6':route_data=[s for s in dataset if s['slug'].startswith('l6-')]
   elif FOCUS=='numbers':route_data=[s for s in dataset if s['slug']=='l6-number-patterns']
   else:route_data=[s for s in dataset if s['slug'] in ['class1-introductions','class4-silent-h','l6-number-patterns','l6-intonation','practice-essere','practice-things-pronouns']]
   for sheet in route_data:
    slug=sheet['slug'];visit('/study/study-sheets.html?sheet='+slug)
    page.wait_for_selector('.quiz-question:not([hidden])')
    assert page.evaluate('ItalianGuidedStudy.getState().step')=='practise'
    assert page.locator('#librarySetPicker').count()==1
    assert page.locator('[data-guided-step]').count()==3
    q=page.locator('.quiz-question:not([hidden])');assert q.count()==1
    # Check every model against the actual UI handler, retaining the canonical progress key.
    response=page.evaluate('''() => [...document.querySelectorAll('.quiz-question')].map(q=>{
      const expected=JSON.parse(q.dataset.answers)[0];
      if(q.dataset.type==='choice'){const radio=[...q.querySelectorAll('input[type=radio]')].find(r=>r.value===expected);if(!radio)return {id:q.dataset.questionKey,error:'choice absent'};radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
      else if(q.dataset.type==='match'){const values=JSON.parse(expected);q.querySelectorAll('[data-match-select]').forEach((s,i)=>{s.value=values[i];s.dispatchEvent(new Event('change',{bubbles:true}));});}
      else {const input=q.querySelector('input[type=text]');input.value=expected;input.dispatchEvent(new Event('input',{bubbles:true}));}
      q.querySelector('.check-button').click();return {id:q.dataset.questionKey,result:q.dataset.result};
    })''')
    assert all(x.get('result')=='correct' for x in response),(slug,[x for x in response if x.get('result')!='correct'])
    page.wait_for_timeout(60)
    check_layout()
    if slug=='l6-intonation':
     page.click('[data-guided-step=learn]');assert page.locator('.l6-int-pair img').count()==2
    if slug=='practice-things-pronouns':
     page.click('[data-guided-step=learn]');assert 'essi' in page.locator('.study-pack-sheet').inner_text()
    results.append({'width':width,'theme':theme,'language':lang,'route':slug,'answers_checked':len(response),'status':'pass'})
   # Targeted journey tests apply to all workflows, using a fresh set state.
   visit('/study/study-sheets.html?lesson=L4&topic=numbers-basic&set=numbers-0-20&sheet=l6-number-patterns')
   assert len(page.evaluate('ItalianGuidedStudy.questions().map(q=>q.dataset.progressKey)'))==21
   assert page.evaluate('ItalianGuidedStudy.questions().at(-1).dataset.progressKey')=='l6-number-patterns-q21'
   new_round('quick')
   keys=page.evaluate('ItalianGuidedStudy.getState().round.keys');assert len(keys)==len(set(keys))==10
   assert all(int(k.rsplit('q',1)[1])<=21 for k in keys)
   page.reload(wait_until='domcontentloaded');page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")');assert page.evaluate('ItalianGuidedStudy.getState().round.keys')==keys
   visit('/study/study-sheets.html?lesson=L6&sheet=l6-number-patterns&set=l6-number-patterns&topic=numbers')
   new_round('full')
   assert len(page.evaluate('ItalianGuidedStudy.questions()'))==41
   q=page.locator('.quiz-question:not([hidden])');q.locator('input[type=text]').fill('zero');q.locator('.check-button').click();page.wait_for_timeout(80)
   page.click('[data-number-reveal-mode=flip]');page.click('[data-number-action=reveal]');assert page.locator('[data-number-panel=sequence] details[open]').count()==41
   page.click('[data-number-view=patterns]');page.click('[data-number-action=reveal]');assert page.locator('[data-number-panel=patterns] details[open]').count()==40
   language('it' if lang=='en' else 'en');assert page.locator('[data-number-panel=patterns] details[open]').count()==40
   page.click('[data-number-reveal-mode=write]');assert q.locator('input[type=text]').input_value()=='zero'
   # Partial draft and hint must survive a real navigation to flashcards and back.
   visit('/study/study-sheets.html?lesson=L3&topic=origins&sheet=class3-complete-replies&set=class3-complete-replies')
   new_round('full')
   page.click('[data-flow-skip]');page.click('[data-guided-action=next]');q=page.locator('.quiz-question:not([hidden])');qid=q.get_attribute('data-progress-key')
   q.locator('input').fill('Io sono di Na');q.locator('.hint-button').click();page.wait_for_timeout(80)
   old_button=page.locator('.course-site-language').bounding_box()
   language('en');language('it')
   new_button=page.locator('.course-site-language').bounding_box();assert abs(old_button['width']-new_button['width'])<1
   assert q.locator('input').input_value()=='Io sono di Na'
   page.click('[data-related-flashcards]');page.wait_for_selector('.review-card[data-lesson=L3]');page.wait_for_function('!document.documentElement.classList.contains("course-booting")')
   assert page.locator('.guided-card-host .review-card').get_attribute('data-deck')=='03 Origins & questions'
   assert page.evaluate('cards.length')==565
   assert page.evaluate("cards.filter(c=>c.lesson!=='L7').length")==511
   assert page.evaluate("cards.filter(c=>c.lesson==='L7').length")==54
   page.click('[data-back-to-practice]');page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")')
   q=page.locator('.quiz-question:not([hidden])');assert q.get_attribute('data-progress-key')==qid
   assert q.locator('input').input_value()=='Io sono di Na'
   assert q.locator('.hint').is_visible()
   # Wrong answer, results, then retry without rewriting first-check history.
   q.locator('input').fill('wrong');q.locator('.check-button').click();page.wait_for_timeout(80)
   page.locator('[data-flow-results]').click()
   assert page.locator('.guided-sheet-finish').is_visible()
   assert page.locator('[data-guided-review-incorrect]').is_visible()
   page.click('[data-guided-review-incorrect]');q=page.locator('.quiz-question:not([hidden])');assert q.get_attribute('data-progress-key')==qid
   q.locator('input').fill('Io sono di Napoli.');q.locator('.check-button').click();page.wait_for_timeout(80)
   assert page.evaluate('(k)=>ItalianGuidedStudy.getState().round.first[k]',arg=qid)=='wrong'
   assert q.get_attribute('data-result')=='correct'
   page.screenshot(path=str(OUT/f'practice-{width}-{theme}.png'),full_page=True,animations='disabled')
   check_layout()
   # The original partial matching and selector state survives reload and a new round elsewhere.
   visit('/study/study-sheets.html?sheet=class4-family&set=class4-family&lesson=L4&topic=family')
   new_round('full')
   match=page.locator('.quiz-question:not([hidden])');match.locator('[data-match-select]').first.select_option('0');page.wait_for_timeout(80)
   page.reload(wait_until='domcontentloaded');page.wait_for_function('window.ItalianGuidedStudy && !document.documentElement.classList.contains("course-booting")');assert page.locator('[data-match-select]').first.input_value()=='0'
   saved=page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2")).study.answers["class4-family-q1"]')
   visit('/study/study-sheets.html?sheet=class4-silent-h&set=class4-silent-h&lesson=L4&topic=silent-h')
   new_round('quick')
   assert page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2")).study.answers["class4-family-q1"]')==saved
   opts=page.locator('.quiz-question:not([hidden]) input[type=radio]').evaluate_all('(els)=>els.map(e=>e.value)')
   assert len(opts)>=6
   language('en');language('it');assert page.locator('.quiz-question:not([hidden]) input[type=radio]').evaluate_all('(els)=>els.map(e=>e.value)')==opts
   assert not errors,errors
   ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'repository','focus':FOCUS,'route_cases':len(results),'model_answers_checked':sum(r['answers_checked'] for r in results),'cases':results,'navigation':'seven lessons and shared topic view; original six retained','quick_full':'passed','flashcard_round_trip':'draft, hint and position retained','partial_matching':'retained','unrelated_progress':'retained','legacy_page_flash':'not observed','language_button':'ITA / ENG; fixed width','anki':'unchanged'}
 (OUT/(('live-' if LIVE else '')+FOCUS+'-results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='cases'},indent=2))
except Exception:
 if page:
  try:page.screenshot(path=str(OUT/f'failure-{FOCUS}.png'),full_page=True);(OUT/f'failure-{FOCUS}.html').write_text(page.content())
  except Exception:pass
 raise
finally:
 if server:server.shutdown()
