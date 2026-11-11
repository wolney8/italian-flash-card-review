#!/usr/bin/env python3
"""Exercise the actual UI, exact answer keys, matching, shuffles and topic-only resets."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import json,shutil,threading,sys,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'artifacts/repeatable-practice';OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads((OUT/'enhanced-sheets.json').read_text())
LIVE='--live' in sys.argv
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=None
if LIVE:base='https://italian-flash-card-review.netlify.app'
else:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if LIVE:
   request=p.request.new_context()
   for attempt in range(18):
    r=request.get(base+'/study/practice-bank-v1.js?release=20261111r1',timeout=30000)
    if r.ok and r.body()==(ROOT/'study/practice-bank-v1.js').read_bytes():break
    time.sleep(10)
   else:raise AssertionError('New practice assets not yet deployed')
   for name in ['practice-options-v1.js','practice-session-v1.js','practice-language-v1.js','practice-session-v1.css']:
    r=request.get(base+'/study/'+name+'?release=20261111r1');assert r.ok and r.body()==(ROOT/'study'/name).read_bytes(),name
   request.dispose()
  for width,theme,lang in [(1280,'light','en'),(1280,'dark','it'),(390,'light','it'),(390,'dark','en')]:
   ctx=browser.new_context(viewport={'width':width,'height':900 if width>500 else 844},reduced_motion='reduce')
   ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
   ctx.add_init_script('if(window===top&&location.origin==='+json.dumps(base)+'){localStorage.setItem("italianCourseLanguageV1",'+json.dumps(lang)+');localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');}')
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def visit(url):
    page.goto(base+url,wait_until='networkidle',timeout=60000)
    page.wait_for_function('!!window.ItalianPracticeBank && !!window.ItalianUI')
   visit('/study/study-sheets.html?path=verbs')
   page.wait_for_selector('.sheet-library-item');assert page.locator('.sheet-library-item').count()==11
   assert page.locator('#studyPathPicker').input_value()=='verbs'
   page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}verb-library-{width}-{theme}.png'),full_page=True)
   visit('/study/study-sheets.html?path=L6');page.wait_for_selector('.sheet-library-item');assert page.locator('.sheet-library-item').count()==8
   assert page.locator('[data-verb-practice-link]').count()==1
   for sheet in DATA:
    slug=sheet['slug'];visit('/study/study-sheets.html?sheet='+slug+'&stage=practise')
    page.wait_for_selector('.practice-round-toolbar');assert page.locator('.quiz-question').count()==len(sheet['questions'])
    assert page.locator('.quiz-question:not([hidden])').count()==1
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3'),(slug,width,'overflow')
    if sheet.get('practice'):
     assert page.locator('#studySheetPicker option').count()==11
     english_title=sheet['title'];expected=page.evaluate('(s)=>ItalianUI.translate(s)',english_title)
     assert page.locator('.study-pack-sheet>header h1').inner_text()==expected
    options_before=page.locator('.choices input').evaluate_all('(es)=>es.map(e=>e.value)')
    for q in page.locator('.quiz-question[data-type=choice]').all():assert q.locator('input[type=radio]').count()>=6
    # Exercise every actual renderer/checker, including hidden questions, without relying on answer positions.
    graded=page.evaluate('''() => [...document.querySelectorAll('.quiz-question')].map(q=>{
      const answer=JSON.parse(q.dataset.answers)[0];
      if(q.dataset.type==='choice'){
        const input=[...q.querySelectorAll('input[type=radio]')].find(x=>x.value===answer);
        if(!input)return {key:q.dataset.questionKey,error:'keyed option absent'};
        input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
      }else if(q.dataset.type==='match'){
        q.querySelectorAll('select').forEach((s,i)=>{s.value=String(i);s.dispatchEvent(new Event('change',{bubbles:true}));});
      }else{
        const input=q.querySelector('input[type=text]');input.value=answer;input.dispatchEvent(new Event('input',{bubbles:true}));
      }
      q.querySelector('.check-button').click();return {key:q.dataset.questionKey,result:q.dataset.result};
    })''')
    assert all(g.get('result')=='correct' for g in graded),(slug,graded)
    page.wait_for_timeout(100)
    assert options_before==page.locator('.choices input').evaluate_all('(es)=>es.map(e=>e.value)')
    page.evaluate('ItalianUI.setLanguage(ItalianUI.language==="en"?"it":"en")')
    assert options_before==page.locator('.choices input').evaluate_all('(es)=>es.map(e=>e.value)')
    assert all(q.locator('.feedback.correct').count()==1 for q in page.locator('.quiz-question').all())
    results.append({'width':width,'theme':theme,'slug':slug,'tasks':len(sheet['questions']),'status':'pass'})
   # Fresh rounds reset only this topic, not another topic or flashcard confidence.
   visit('/study/study-sheets.html?sheet=practice-avere&stage=practise');page.wait_for_selector('.practice-round-toolbar')
   page.evaluate('''()=>{let p=JSON.parse(sessionStorage.getItem('italianCourseSessionProgressV2'));p.study.answers['sentinel-q1']={value:'safe',result:'correct'};p.flashcards={confidence:{keep:'known'}};sessionStorage.setItem('italianCourseSessionProgressV2',JSON.stringify(p));}''')
   old_seed=page.evaluate('sessionStorage.getItem("italianPracticeSeedV1:practice-avere")')
   page.on('dialog',lambda d:d.accept())
   page.locator('.practice-round-toolbar [data-new-practice-round]').click();page.wait_for_selector('.practice-round-toolbar')
   assert page.evaluate('sessionStorage.getItem("italianPracticeSeedV1:practice-avere")')!=old_seed
   kept=page.evaluate('JSON.parse(sessionStorage.getItem("italianCourseSessionProgressV2"))')
   assert kept['study']['answers']['sentinel-q1']['value']=='safe' and kept['flashcards']['confidence']['keep']=='known'
   assert not any(k.startswith('practice-avere-q') for k in kept['study']['answers'])
   assert page.locator('.feedback.correct,.feedback.wrong').count()==0
   assert page.evaluate('JSON.parse(localStorage.getItem("italianPracticeHistoryV1"))["practice-avere"].at(-1).correct')==16
   for _ in range(15):page.locator('[data-guided-action=next]').click()
   match=page.locator('.quiz-question:not([hidden])');assert match.get_attribute('data-type')=='match'
   match.locator('select').first.select_option('0');page.wait_for_timeout(100)
   page.reload(wait_until='networkidle');page.wait_for_selector('.practice-round-toolbar');page.wait_for_timeout(100)
   match=page.locator('.quiz-question:not([hidden])');assert match.locator('select').first.input_value()=='0'
   assert match.locator('.check-button').is_disabled()
   for i,s in enumerate(match.locator('select').all()):s.select_option(str(i))
   match.locator('.check-button').click();assert match.get_attribute('data-result')=='correct'
   page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}matching-{width}-{theme}.png'),full_page=True)
   # Strict accent in new practice and complete model sentences stay intact.
   visit('/study/study-sheets.html?sheet=practice-things-pronouns&stage=practise');page.wait_for_selector('.practice-round-toolbar')
   page.click('[data-guided-action=next]');q=page.locator('.quiz-question:not([hidden])');q.locator('input[type=text]').fill('e');q.locator('.check-button').click();assert q.get_attribute('data-result')=='wrong'
   q.locator('input[type=text]').fill('è');q.locator('.check-button').click();assert q.get_attribute('data-result')=='correct'
   visit('/study/study-sheets.html?sheet=practice-essere&stage=learn');page.wait_for_selector('.practice-round-toolbar',state='attached')
   assert 'esso / essa' in page.locator('.study-pack-sheet .matrix-wrap').first.inner_text()
   assert 'essi / esse' in page.locator('.study-pack-sheet .matrix-wrap').first.inner_text()
   page.screenshot(path=str(OUT/f'{"live-" if LIVE else ""}pronouns-{width}-{theme}.png'),full_page=True)
   assert not errors,errors
   ctx.close()
  browser.close()
 report={'status':'pass','environment':'production' if LIVE else 'local','cases':results,'round_reset':'topic-only; previous summary preserved','matching':'partial and completed persistence checked','shuffle':'stable during question and language switch; new seed per round','anki':'untouched'}
 (OUT/('live-results.json' if LIVE else 'browser-results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print('PASS',len(results),'route/theme/viewport cases, all answers, six-option MC, matching and safe repeat rounds.')
finally:
 if server:server.shutdown()
